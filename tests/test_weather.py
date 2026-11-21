"""Weather data: entity, sensors, moon and climate normals."""

from __future__ import annotations

import json
import re
from datetime import UTC, datetime
from pathlib import Path

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.test_util.aiohttp import AiohttpClientMocker

from custom_components.weatherscope import astro
from custom_components.weatherscope.const import DOMAIN
from custom_components.weatherscope.weather_data import climate_normals, condition

T0 = 1763700000

FORECAST = {
    "current": {
        "time": T0, "temperature_2m": 2.4, "apparent_temperature": -0.5, "relative_humidity_2m": 97, "dew_point_2m": 2.0,
        "pressure_msl": 993.1, "wind_speed_10m": 4.0, "wind_gusts_10m": 9.0, "wind_direction_10m": 124, "weather_code": 2,
        "is_day": 1, "cloud_cover": 60, "visibility": 20000, "uv_index": 0.4, "precipitation": 0,
    },
    "hourly": {
        "time": [T0 + 3600 * i for i in range(48)], "temperature_2m": [3.0] * 48, "weather_code": [0] * 48,
        "precipitation": [0.0] * 48, "precipitation_probability": [5] * 48, "wind_speed_10m": [5.0] * 48,
        "wind_direction_10m": [200] * 48, "uv_index": [0.1] * 48, "is_day": [0] * 48,
    },
    "daily": {
        "time": [T0 + 86400 * i for i in range(10)], "weather_code": [3] * 10, "temperature_2m_max": [7.0] * 10,
        "temperature_2m_min": [-1.0] * 10, "precipitation_sum": [0.3] * 10, "precipitation_probability_max": [20] * 10,
        "sunrise": [T0 - 3600] * 10, "sunset": [T0 + 28000] * 10, "uv_index_max": [1.0] * 10, "wind_speed_10m_max": [12.0] * 10,
        "wind_direction_10m_dominant": [180] * 10,
    },
}  # fmt: skip
AIR = {
    "current": {
        "european_aqi": 35,
        "pm2_5": 12,
        "pm10": 16,
        "nitrogen_dioxide": 16,
        "ozone": 21,
        "carbon_monoxide": 180,
        "sulphur_dioxide": 2,
    }
}
ARCHIVE = {
    "daily": {
        "time": ["1991-01-01", "1991-01-02", "1992-01-01", "1991-07-01"],
        "temperature_2m_max": [4.0, 6.0, 2.0, 25.0],
        "temperature_2m_min": [-2.0, 0.0, -4.0, 14.0],
        "precipitation_sum": [10.0, 5.0, 20.0, 80.0],
    }
}


def _mock(aioclient_mock: AiohttpClientMocker) -> None:
    js = {"Content-Type": "application/json"}
    aioclient_mock.get(re.compile(r"https://air-quality-api\.open-meteo\.com/.*"), content=json.dumps(AIR).encode(), headers=js)
    aioclient_mock.get(re.compile(r"https://archive-api\.open-meteo\.com/.*"), content=json.dumps(ARCHIVE).encode(), headers=js)
    aioclient_mock.get(
        re.compile(r"https://api\.open-meteo\.com/v1/forecast\?.*current=.*"), content=json.dumps(FORECAST).encode(), headers=js
    )
    aioclient_mock.get(re.compile(r".*"), status=500)


async def test_weather_entities(hass: HomeAssistant, aioclient_mock: AiohttpClientMocker, tmp_path: Path) -> None:
    hass.config.config_dir = str(tmp_path)
    hass.config.latitude, hass.config.longitude = 49.14, 9.22
    _mock(aioclient_mock)
    entry = MockConfigEntry(
        domain=DOMAIN,
        title="WeatherScope",
        data={"location": {"latitude": 51, "longitude": 10.1}, "width_km": 750, "radar": "none", "satellite": "none"},
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    w = hass.states.get("weather.weatherscope")
    assert w is not None
    assert w.state == "partlycloudy"
    assert w.attributes["temperature"] == 2.4
    assert w.attributes["humidity"] == 97
    assert w.attributes["visibility"] == 20.0

    res = await hass.services.async_call(
        "weather", "get_forecasts", {"entity_id": "weather.weatherscope", "type": "daily"}, blocking=True, return_response=True
    )
    daily = res["weather.weatherscope"]["forecast"]
    assert len(daily) == 10 and daily[0]["temperature"] == 7.0 and daily[0]["templow"] == -1.0
    res = await hass.services.async_call(
        "weather", "get_forecasts", {"entity_id": "weather.weatherscope", "type": "hourly"}, blocking=True, return_response=True
    )
    hourly = res["weather.weatherscope"]["forecast"]
    assert len(hourly) == 48 and hourly[0]["condition"] == "clear-night"

    assert hass.states.get("sensor.weatherscope_air_quality_index").state == "35"
    assert hass.states.get("sensor.weatherscope_pm2_5").state == "12"
    assert hass.states.get("sensor.weatherscope_visibility").state == "20.0"
    assert hass.states.get("sensor.weatherscope_moon_phase").state in astro.PHASES
    normal = hass.states.get("sensor.weatherscope_normal_high")
    assert len(normal.attributes["months"]) == 12
    assert (tmp_path / "weatherscope" / entry.entry_id / "normals.json").exists()

    assert await hass.config_entries.async_unload(entry.entry_id)


async def test_weather_switched_off(hass: HomeAssistant, aioclient_mock: AiohttpClientMocker, tmp_path: Path) -> None:
    hass.config.config_dir = str(tmp_path)
    _mock(aioclient_mock)
    entry = MockConfigEntry(
        domain=DOMAIN,
        title="WeatherScope",
        data={
            "location": {"latitude": 51, "longitude": 10.1},
            "width_km": 750,
            "radar": "none",
            "satellite": "none",
            "weather_data": False,
        },
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert hass.states.get("weather.weatherscope") is None
    assert hass.states.get("sensor.weatherscope_air_quality_index") is None
    assert hass.states.get("sensor.weatherscope_map_data") is not None
    assert await hass.config_entries.async_unload(entry.entry_id)


def test_condition_mapping() -> None:
    assert condition(0, 1) == "sunny"
    assert condition(0, 0) == "clear-night"
    assert condition(65) == "pouring"
    assert condition(95) == "lightning-rainy"
    assert condition(123) == "exceptional"


def test_climate_normals() -> None:
    n = climate_normals(ARCHIVE["daily"])
    jan, jul = n[0], n[6]
    assert jan["high"] == 4.0 and jan["low"] == -2.0
    assert jan["rain"] == 18  # (15 + 20) / 2 years
    assert jul["high"] == 25.0 and n[1]["high"] is None


def test_moon() -> None:
    # 21 Nov 2026: waxing gibbous, ~88 %, full moon on 24 Nov, moonrise Heilbronn ~13:32 UTC
    now = datetime(2026, 11, 21, 9, 0, tzinfo=UTC)
    assert astro.moon_phase(now) == "waxing_gibbous"
    assert 85 < astro.moon_illumination(now) < 92
    assert astro.next_full_moon(now).date().isoformat() == "2026-11-24"
    rise, sett = astro.moon_rise_set(datetime(2026, 11, 20, 23, 0, tzinfo=UTC), 49.14, 9.22)
    assert rise and abs((rise - datetime(2026, 11, 21, 13, 32, tzinfo=UTC)).total_seconds()) < 20 * 60
    assert sett is not None
