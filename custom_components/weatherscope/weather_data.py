"""Current weather, forecast, air quality and climate normals for the home location.

All values come from Open-Meteo (no key needed, worldwide); moon and sun data
are calculated locally. Cards can use these or the user's own sensors.
"""

from __future__ import annotations

import asyncio
import json
import logging
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

import aiohttp
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.util import dt as dt_util

from . import astro
from .const import VERSION

_LOGGER = logging.getLogger(__name__)

FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
AIR_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"
ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"
USER_AGENT = f"WeatherScope/{VERSION} (Home Assistant integration)"
TIMEOUT = aiohttp.ClientTimeout(total=30)
TIMEOUT_ARCHIVE = aiohttp.ClientTimeout(total=120)

CURRENT = (
    "temperature_2m,apparent_temperature,relative_humidity_2m,dew_point_2m,pressure_msl,"
    "wind_speed_10m,wind_gusts_10m,wind_direction_10m,weather_code,is_day,cloud_cover,"
    "visibility,uv_index,precipitation"
)
HOURLY = (
    "temperature_2m,weather_code,precipitation,precipitation_probability,wind_speed_10m,wind_gusts_10m,wind_direction_10m,uv_index,is_day"
)
DAILY = (
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,"
    "sunrise,sunset,uv_index_max,wind_speed_10m_max,wind_direction_10m_dominant"
)
AIR = "european_aqi,pm2_5,pm10,nitrogen_dioxide,ozone,carbon_monoxide,sulphur_dioxide"

UPDATE_INTERVAL = timedelta(minutes=15)

# WMO weather code -> Home Assistant condition
WMO = {
    0: "sunny", 1: "sunny", 2: "partlycloudy", 3: "cloudy", 45: "fog", 48: "fog",
    51: "rainy", 53: "rainy", 55: "rainy", 56: "snowy-rainy", 57: "snowy-rainy",
    61: "rainy", 63: "rainy", 65: "pouring", 66: "snowy-rainy", 67: "snowy-rainy",
    71: "snowy", 73: "snowy", 75: "snowy", 77: "snowy",
    80: "rainy", 81: "rainy", 82: "pouring", 85: "snowy", 86: "snowy",
    95: "lightning-rainy", 96: "lightning-rainy", 99: "lightning-rainy",
}  # fmt: skip


def condition(code: Any, is_day: Any = 1) -> str | None:
    """Home Assistant condition for a WMO code; clear sky at night is clear-night."""
    if code is None:
        return None
    c = WMO.get(int(code), "exceptional")
    if c == "sunny" and not is_day:
        return "clear-night"
    return c


def climate_normals(daily: dict[str, list[Any]]) -> list[dict[str, float | None]]:
    """Average high, low and rain total for each month from a daily archive series."""
    hi: dict[int, list[float]] = defaultdict(list)
    lo: dict[int, list[float]] = defaultdict(list)
    rain: dict[tuple[int, int], float] = defaultdict(float)
    for t, mx, mn, pr in zip(
        daily.get("time", []),
        daily.get("temperature_2m_max", []),
        daily.get("temperature_2m_min", []),
        daily.get("precipitation_sum", []),
        strict=False,
    ):
        year, month = int(t[:4]), int(t[5:7])
        if mx is not None:
            hi[month].append(mx)
        if mn is not None:
            lo[month].append(mn)
        if pr is not None:
            rain[(year, month)] += pr
    out = []
    for month in range(1, 13):
        totals = [v for (y, m), v in rain.items() if m == month]
        out.append(
            {
                "month": month,
                "high": round(sum(hi[month]) / len(hi[month]), 1) if hi[month] else None,
                "low": round(sum(lo[month]) / len(lo[month]), 1) if lo[month] else None,
                "rain": round(sum(totals) / len(totals)) if totals else None,
            }
        )
    return out


class WeatherScopeData(DataUpdateCoordinator[dict[str, Any]]):
    """Fetches weather data for the home location every 15 minutes."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry, folder: Path) -> None:
        super().__init__(hass, _LOGGER, name="WeatherScope weather", update_interval=UPDATE_INTERVAL, config_entry=entry)
        self.lat = round(hass.config.latitude, 4)
        self.lon = round(hass.config.longitude, 4)
        self._session = async_get_clientsession(hass)
        self._normals_file = folder / "normals.json"
        self.normals: list[dict[str, Any]] | None = None
        self._normals_try: datetime | None = None

    async def _get(self, url: str, params: dict[str, Any], timeout: aiohttp.ClientTimeout = TIMEOUT) -> dict[str, Any] | None:
        try:
            async with self._session.get(url, params=params, timeout=timeout, headers={"User-Agent": USER_AGENT}) as resp:
                if resp.status != 200:
                    _LOGGER.debug("%s -> HTTP %s", url, resp.status)
                    return None
                data = await resp.json(content_type=None)
                return data if isinstance(data, dict) else None
        except (TimeoutError, aiohttp.ClientError, ValueError, RuntimeError) as err:
            _LOGGER.debug("%s failed: %s", url, err)
            return None

    def _base(self) -> dict[str, Any]:
        return {"latitude": self.lat, "longitude": self.lon, "timezone": "auto", "timeformat": "unixtime"}

    async def _async_update_data(self) -> dict[str, Any]:
        fc, air = await asyncio.gather(
            self._get(
                FORECAST_URL,
                {**self._base(), "current": CURRENT, "hourly": HOURLY, "daily": DAILY, "forecast_days": 10, "forecast_hours": 240},
            ),
            self._get(AIR_URL, {**self._base(), "current": AIR}),
        )
        if not fc or "current" not in fc:
            raise UpdateFailed("Open-Meteo forecast not available")
        await self._ensure_normals()
        now = dt_util.now()
        midnight = dt_util.start_of_local_day(now)
        rise, sett = await self.hass.async_add_executor_job(astro.moon_rise_set, midnight, self.lat, self.lon)
        return {
            "current": fc["current"],
            "hourly": fc.get("hourly", {}),
            "daily": fc.get("daily", {}),
            "air": (air or {}).get("current", {}),
            "moon": {
                "phase": astro.moon_phase(now),
                "illumination": astro.moon_illumination(now),
                "next_full": astro.next_full_moon(now),
                "rise": rise,
                "set": sett,
            },
            "normals": self.normals,
        }

    async def _ensure_normals(self) -> None:
        """Climate normals 1991–2020 for this place; fetched once and kept on disk."""
        if self.normals is not None:
            return
        key = f"{self.lat:.2f},{self.lon:.2f}"

        def _load() -> list[dict[str, Any]] | None:
            try:
                saved = json.loads(self._normals_file.read_text())
                return saved["months"] if saved.get("key") == key else None
            except (OSError, ValueError, KeyError):
                return None

        self.normals = await self.hass.async_add_executor_job(_load)
        if self.normals is not None:
            return
        # the archive request is large: try at most once a day
        if self._normals_try and dt_util.utcnow() - self._normals_try < timedelta(days=1):
            return
        self._normals_try = dt_util.utcnow()
        data = await self._get(
            ARCHIVE_URL,
            {
                "latitude": self.lat,
                "longitude": self.lon,
                "start_date": "1991-01-01",
                "end_date": "2020-12-31",
                "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum",
                "timezone": "auto",
            },
            TIMEOUT_ARCHIVE,
        )
        if not data or "daily" not in data:
            return
        months = await self.hass.async_add_executor_job(climate_normals, data["daily"])
        self.normals = months

        def _save() -> None:
            self._normals_file.parent.mkdir(parents=True, exist_ok=True)
            self._normals_file.write_text(json.dumps({"key": key, "months": months}))

        await self.hass.async_add_executor_job(_save)
