"""Fetches all map data on Home Assistant and stores it for the card.

Home Assistant does every download, so dashboards (e.g. wall tablets) never
need internet access themselves. Files land in <config>/weatherscope/<entry_id>/
and are served at /weatherscope/data/<entry_id>/.
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
from collections.abc import Callable
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any

import aiohttp
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import (
    async_call_later,
    async_track_time_change,
    async_track_time_interval,
)
from homeassistant.util import dt as dt_util

from .const import (
    AUTO,
    CONF_LOCATION,
    CONF_RADAR,
    CONF_SATELLITE,
    CONF_WIDTH_KM,
    DEFAULT_WIDTH_KM,
    FC_PARTS,
    IMG_H,
    IMG_W,
    NONE,
    RADAR_DWD,
    RADAR_FUTURE,
    RADAR_PAST,
    RADAR_STEP_MIN,
    SAT_EUMETSAT,
    SAT_PAST,
    SAT_STEP_MIN,
    SIGNAL_UPDATE,
    URL_DATA,
    VERSION,
)
from .geo import MapBox

_LOGGER = logging.getLogger(__name__)

DWD_WMS = "https://maps.dwd.de/geoserver/dwd/wms"
EUMETSAT_WMS = "https://view.eumetsat.int/geoserver/ows"
OPEN_METEO = "https://api.open-meteo.com/v1/forecast"
OM_VARS = "temperature_2m,wind_speed_10m,wind_direction_10m,snowfall,weather_code,precipitation,pressure_msl"

# Rough coverage of the providers (lon0, lat0, lon1, lat1)
DWD_COVERAGE = (1.5, 45.5, 18.8, 56.3)
EUMETSAT_COVERAGE = (-75.0, -75.0, 75.0, 75.0)

TIMEOUT = aiohttp.ClientTimeout(total=40)
USER_AGENT = f"WeatherScope/{VERSION} (Home Assistant integration)"


def _iso(ts: int) -> str:
    return datetime.fromtimestamp(ts, UTC).strftime("%Y-%m-%dT%H:%M:00Z")


class WeatherScopeManager:
    """Owns the download loops for one config entry."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        self.hass = hass
        self.entry = entry
        conf = {**entry.data, **entry.options}
        loc = conf.get(CONF_LOCATION) or {}
        self.lat = float(loc.get("latitude", hass.config.latitude))
        self.lon = float(loc.get("longitude", hass.config.longitude))
        self.width_km = float(conf.get(CONF_WIDTH_KM, DEFAULT_WIDTH_KM))
        self.box = MapBox.around(self.lat, self.lon, self.width_km)
        self.radar = self._pick(conf.get(CONF_RADAR, AUTO), RADAR_DWD, DWD_COVERAGE)
        self.satellite = self._pick(conf.get(CONF_SATELLITE, AUTO), SAT_EUMETSAT, EUMETSAT_COVERAGE)
        self.dir = Path(hass.config.path("weatherscope", entry.entry_id))
        self.url = f"{URL_DATA}/{entry.entry_id}/"
        self.radar_basis: int | None = None
        self.sat_basis: int | None = None
        self.fc_basis: int | None = None
        self.fc_updated: str | None = None
        self.errors: dict[str, str] = {}
        self._unsubs: list[Callable[[], None]] = []
        self._locks = {k: asyncio.Lock() for k in ("radar", "sat", "fc")}
        self._sem = asyncio.Semaphore(4)
        self._session = async_get_clientsession(hass)

    def _pick(self, choice: str, provider: str, coverage: tuple[float, ...]) -> str | None:
        if choice == NONE:
            return None
        if choice == AUTO:
            return provider if self.box.intersects(*coverage) else None
        return choice

    # ------------------------------------------------------------------ setup
    async def async_start(self) -> None:
        """Create the data folder and start all loops."""
        await self.hass.async_add_executor_job(lambda: self.dir.mkdir(parents=True, exist_ok=True))
        await self.hass.async_add_executor_job(self._restore_state)
        if self.radar:
            self._unsubs.append(async_track_time_interval(self.hass, self._radar_tick, timedelta(minutes=RADAR_STEP_MIN)))
            self._unsubs.append(async_call_later(self.hass, 5, self._radar_tick))
        if self.satellite:
            self._unsubs.append(async_track_time_interval(self.hass, self._sat_tick, timedelta(minutes=SAT_STEP_MIN)))
            self._unsubs.append(async_call_later(self.hass, 15, self._sat_tick))
        # Weather models are published a few hours after their run; refresh four times a day.
        self._unsubs.append(async_track_time_change(self.hass, self._fc_tick, hour=[4, 10, 16, 22], minute=40, second=0))
        stale = self.fc_basis is None or not (self.dir / "om_0.json").exists() or time.time() - self._fc_mtime() > 6 * 3600
        if stale:
            self._unsubs.append(async_call_later(self.hass, 30, self._fc_tick))

    async def async_stop(self) -> None:
        """Stop all loops."""
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()

    def _fc_mtime(self) -> float:
        try:
            return (self.dir / "om_0.json").stat().st_mtime
        except OSError:
            return 0

    def _restore_state(self) -> None:
        """Pick up files from an earlier run so the card works right after a restart."""
        try:
            state = json.loads((self.dir / "state.json").read_text())
        except (OSError, ValueError):
            return
        self.fc_basis = state.get("fc_basis")
        self.fc_updated = state.get("fc_updated")

    def _save_state(self) -> None:
        (self.dir / "state.json").write_text(json.dumps({"fc_basis": self.fc_basis, "fc_updated": self.fc_updated}))

    @callback
    def _notify(self) -> None:
        async_dispatcher_send(self.hass, SIGNAL_UPDATE.format(self.entry.entry_id))

    # ------------------------------------------------------------- helpers
    async def _get(self, url: str, params: dict[str, Any], kind: str) -> bytes | None:
        """GET with timeout; returns the body only if it has the expected type."""
        async with self._sem:
            try:
                async with self._session.get(url, params=params, timeout=TIMEOUT, headers={"User-Agent": USER_AGENT}) as resp:
                    ctype = resp.headers.get("Content-Type", "")
                    body = await resp.read()
                    if resp.status != 200 or not ctype.startswith(kind):
                        _LOGGER.debug("%s -> HTTP %s %s", url, resp.status, ctype)
                        return None
                    return body
            except (TimeoutError, aiohttp.ClientError) as err:
                _LOGGER.debug("%s failed: %s", url, err)
                return None

    async def _write(self, name: str, data: bytes) -> None:
        path = self.dir / name
        tmp = path.with_suffix(path.suffix + ".tmp")

        def _do() -> None:
            tmp.write_bytes(data)
            tmp.replace(path)

        await self.hass.async_add_executor_job(_do)

    async def _existing(self) -> set[str]:
        return set(await self.hass.async_add_executor_job(lambda: [p.name for p in self.dir.iterdir()]))

    async def _cleanup(self, keep: Callable[[str], bool]) -> None:
        def _do() -> None:
            for p in self.dir.iterdir():
                if p.suffix in (".png", ".jpg") and not keep(p.name):
                    p.unlink(missing_ok=True)

        await self.hass.async_add_executor_job(_do)

    def _wms(self, layer: str, fmt: str, t: int, extra: dict[str, str] | None = None) -> dict[str, str]:
        p = {
            "service": "WMS",
            "version": "1.1.1",
            "request": "GetMap",
            "layers": layer,
            "styles": "",
            "srs": "EPSG:3857",
            "bbox": self.box.wms,
            "width": str(IMG_W),
            "height": str(IMG_H),
            "format": fmt,
            "time": _iso(t),
        }
        if extra:
            p.update(extra)
        return p

    # --------------------------------------------------------------- radar
    async def _radar_tick(self, _now: Any = None) -> None:
        if self._locks["radar"].locked():
            return
        async with self._locks["radar"]:
            step = RADAR_STEP_MIN * 60
            base = int(time.time() // step * step - 600)  # DWD is ~10 min behind
            have = await self._existing()
            jobs = []
            past = [base - i * step for i in range(RADAR_PAST)]
            for t in past:
                name = f"r_{t}.png"
                if name not in have:
                    jobs.append(self._radar_one(t, name))
            for k in range(1, RADAR_FUTURE + 1):  # nowcast changes every run
                t = base + k * step
                jobs.append(self._radar_one(t, f"v_{t}.png"))
            results = await asyncio.gather(*jobs)
            ok_past = sum(1 for t in past if f"r_{t}.png" in have) + sum(1 for r in results if r == "r")
            lo = base - RADAR_PAST * step
            await self._cleanup(lambda n: not n.startswith(("r_", "v_")) or self._keep(n, lo, base, future=n.startswith("v_")))
            if ok_past:
                self.radar_basis = base
                self.errors.pop("radar", None)
            else:
                self.errors["radar"] = "no radar images"
            self._notify()

    async def _radar_one(self, t: int, name: str) -> str | None:
        params = self._wms("dwd:Niederschlagsradar", "image/png", t, {"transparent": "true", "exceptions": "application/vnd.ogc.se_xml"})
        data = await self._get(DWD_WMS, params, "image/")
        if data:
            await self._write(name, data)
            return name[0]
        return None

    @staticmethod
    def _keep(name: str, lo: int, base: int, future: bool) -> bool:
        try:
            t = int(name.split("_", 1)[1].split(".", 1)[0])
        except ValueError:
            return False
        return t > base if future else t > lo

    # ----------------------------------------------------------- satellite
    async def _sat_tick(self, _now: Any = None) -> None:
        if self._locks["sat"].locked():
            return
        async with self._locks["sat"]:
            step = SAT_STEP_MIN * 60
            base = int(time.time() // step * step - 1800)  # EUMETSAT is ~25-30 min behind
            have = await self._existing()
            jobs = []
            for i in range(SAT_PAST):
                t = base - i * step
                for prefix, layer in (("s", "mtg_fd:rgb_geocolour"), ("i", "mtg_fd:ir105_hrfi")):
                    name = f"{prefix}_{t}.jpg"
                    if name not in have:
                        jobs.append(self._sat_one(t, layer, name))
            got = await asyncio.gather(*jobs)
            lo = base - SAT_PAST * step
            await self._cleanup(lambda n: not n.startswith(("s_", "i_")) or self._keep(n, lo, base, future=False))
            if any(got) or f"s_{base}.jpg" in have:
                self.sat_basis = base
                self.errors.pop("satellite", None)
            elif self.sat_basis is None:
                self.errors["satellite"] = "no satellite images"
            self._notify()

    async def _sat_one(self, t: int, layer: str, name: str) -> bool:
        data = await self._get(EUMETSAT_WMS, self._wms(layer, "image/jpeg", t), "image/")
        if data:
            await self._write(name, data)
            return True
        return False

    # ------------------------------------------------------------ forecast
    async def _fc_tick(self, _now: Any = None) -> None:
        if self._locks["fc"].locked():
            return
        async with self._locks["fc"]:
            g = self.box.grid()
            rows_per_part = g["nla"] // FC_PARTS
            tz = self.hass.config.time_zone or "UTC"
            ok = 0
            for part in range(FC_PARTS):
                lats, lons = [], []
                for r in range(part * rows_per_part, (part + 1) * rows_per_part):
                    for j in range(g["nlo"]):
                        lats.append(f"{g['la0'] + r * g['dla']:.3f}")
                        lons.append(f"{g['lo0'] + j * g['dlo']:.3f}")
                params = {
                    "latitude": ",".join(lats),
                    "longitude": ",".join(lons),
                    "hourly": OM_VARS,
                    "forecast_days": "6",
                    "temporal_resolution": "hourly_3",
                    "timeformat": "unixtime",
                    "timezone": tz,
                    "wind_speed_unit": "kmh",
                }
                data = await self._get(OPEN_METEO, params, "application/json")
                if data:
                    try:
                        parsed = json.loads(data)
                    except ValueError:
                        parsed = None
                    if isinstance(parsed, list) and len(parsed) == rows_per_part * g["nlo"]:
                        await self._write(f"om_{part}.json", data)
                        ok += 1
                    else:
                        _LOGGER.warning("Open-Meteo returned unexpected data for part %s", part)
                if part < FC_PARTS - 1:
                    # Open-Meteo counts every location as one call (limit 600/min).
                    await asyncio.sleep(35)
            if ok:
                local = dt_util.now()
                start = local.replace(hour=local.hour // 3 * 3, minute=0, second=0, microsecond=0)
                self.fc_basis = int(start.timestamp())
                self.fc_updated = dt_util.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
                self.errors.pop("forecast", None)
                await self.hass.async_add_executor_job(self._save_state)
            else:
                self.errors["forecast"] = "Open-Meteo not reachable"
            self._notify()

    # ------------------------------------------------------------- export
    def attributes(self) -> dict[str, Any]:
        """Everything the card needs, as sensor attributes."""
        attribution = ["Natural Earth", "Open-Meteo.com (CC BY 4.0)"]
        if self.radar == RADAR_DWD:
            attribution.append("DWD")
        if self.satellite == SAT_EUMETSAT:
            attribution.append("EUMETSAT")
        return {
            "version": VERSION,
            "url": self.url,
            "bbox": [self.box.x0, self.box.y0, self.box.x1, self.box.y1],
            "size": [IMG_W, IMG_H],
            "center": [round(self.lat, 4), round(self.lon, 4)],
            "grid": self.box.grid(),
            "radar": None
            if not self.radar
            else {
                "provider": self.radar,
                "basis": _iso(self.radar_basis) if self.radar_basis else None,
                "step": RADAR_STEP_MIN,
                "past": RADAR_PAST,
                "future": RADAR_FUTURE,
            },
            "satellite": None
            if not self.satellite
            else {
                "provider": self.satellite,
                "basis": _iso(self.sat_basis) if self.sat_basis else None,
                "step": SAT_STEP_MIN,
                "past": SAT_PAST,
            },
            "forecast": {
                "provider": "open-meteo",
                "basis": _iso(self.fc_basis) if self.fc_basis else None,
                "updated": self.fc_updated,
                "parts": FC_PARTS,
            },
            "errors": dict(self.errors),
            "attribution": attribution,
        }
