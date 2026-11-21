"""Config flow, data download and sensor attributes."""

from __future__ import annotations

import json
import re
from pathlib import Path
from unittest.mock import patch

from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_time_changed
from pytest_homeassistant_custom_component.test_util.aiohttp import AiohttpClientMocker

from custom_components.weatherscope.const import DOMAIN
from custom_components.weatherscope.geo import MapBox

PNG = b"\x89PNG\r\n\x1a\n" + b"0" * 20
JPG = b"\xff\xd8\xff" + b"0" * 20


def _om_payload(n: int) -> bytes:
    hourly = {
        "time": [1763600000 + 10800 * i for i in range(48)],
        **{
            k: [1.0] * 48
            for k in ("temperature_2m", "wind_speed_10m", "wind_direction_10m", "snowfall", "weather_code", "precipitation", "pressure_msl")
        },
    }
    return json.dumps([{"latitude": 50, "longitude": 9, "elevation": 100, "hourly": hourly}] * n).encode()


async def test_config_flow(hass: HomeAssistant) -> None:
    hass.config.latitude, hass.config.longitude = 49.14, 9.22
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": config_entries.SOURCE_USER})
    assert result["type"] == "form"
    with patch("custom_components.weatherscope.async_setup_entry", return_value=True):
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"],
            {"name": "Wetter", "location": {"latitude": 51.0, "longitude": 10.1}, "width_km": 750, "radar": "auto", "satellite": "auto"},
        )
    assert result["type"] == "create_entry"
    assert result["title"] == "Wetter"
    assert result["data"]["location"]["latitude"] == 51.0


def test_box_germany() -> None:
    box = MapBox.around(51.0, 10.1, 1000)
    lo0, la0, lo1, la1 = box.lonlat
    assert 2 < lo0 < 4 and 16 < lo1 < 18
    assert 45 < la0 < 47 and 55 < la1 < 57
    g = box.grid()
    assert g["nla"] == 32 and g["nlo"] == 33


async def test_setup_downloads(hass: HomeAssistant, aioclient_mock: AiohttpClientMocker, tmp_path: Path) -> None:
    hass.config.latitude, hass.config.longitude = 49.14, 9.22
    hass.config.config_dir = str(tmp_path)
    aioclient_mock.get(re.compile(r"https://maps\.dwd\.de/.*"), content=PNG, headers={"Content-Type": "image/png"})
    aioclient_mock.get(re.compile(r"https://view\.eumetsat\.int/.*"), content=JPG, headers={"Content-Type": "image/jpeg"})
    aioclient_mock.get(
        re.compile(r"https://api\.open-meteo\.com/.*"), content=_om_payload(8 * 33), headers={"Content-Type": "application/json"}
    )

    entry = MockConfigEntry(
        domain=DOMAIN,
        title="WeatherScope",
        data={"location": {"latitude": 51.0, "longitude": 10.1}, "width_km": 750, "radar": "auto", "satellite": "auto"},
    )
    entry.add_to_hass(hass)
    with patch("custom_components.weatherscope.manager.asyncio.sleep", return_value=None):
        assert await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()
        from datetime import timedelta

        from homeassistant.util import dt as dt_util

        async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=40))
        await hass.async_block_till_done(wait_background_tasks=True)

    data = tmp_path / "weatherscope" / entry.entry_id
    names = sorted(p.name for p in data.iterdir())
    assert sum(n.startswith("r_") for n in names) == 36
    assert sum(n.startswith("v_") for n in names) == 12
    assert sum(n.startswith("s_") for n in names) == 18
    assert sum(n.startswith("i_") for n in names) == 18
    assert {f"om_{i}.json" for i in range(4)} <= set(names)

    state = hass.states.get("sensor.weatherscope_map_data")
    assert state.state == "ok"
    a = state.attributes
    assert a["updated"]
    assert a["radar"]["provider"] == "dwd" and a["radar"]["basis"]
    assert a["satellite"]["provider"] == "eumetsat" and a["satellite"]["basis"]
    assert a["forecast"]["basis"]
    assert a["url"] == f"/weatherscope/data/{entry.entry_id}/"
    assert len(a["bbox"]) == 4

    assert await hass.config_entries.async_unload(entry.entry_id)


async def test_radar_auto_off_outside_germany(hass: HomeAssistant, aioclient_mock: AiohttpClientMocker, tmp_path: Path) -> None:
    hass.config.config_dir = str(tmp_path)
    aioclient_mock.get(re.compile(r".*"), status=500)
    entry = MockConfigEntry(
        domain=DOMAIN,
        data={"location": {"latitude": 40.7, "longitude": -74.0}, "width_km": 750, "radar": "auto", "satellite": "auto"},
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    m = entry.runtime_data
    assert m.radar is None
    assert m.satellite == "eumetsat"
    assert await hass.config_entries.async_unload(entry.entry_id)


async def test_area_change_clears_old_files(hass: HomeAssistant, aioclient_mock: AiohttpClientMocker, tmp_path: Path) -> None:
    hass.config.config_dir = str(tmp_path)
    aioclient_mock.get(re.compile(r".*"), status=500)
    entry = MockConfigEntry(
        domain=DOMAIN, data={"location": {"latitude": 51, "longitude": 10.1}, "width_km": 750, "radar": "none", "satellite": "none"}
    )
    entry.add_to_hass(hass)
    data = tmp_path / "weatherscope" / entry.entry_id
    data.mkdir(parents=True)
    (data / "state.json").write_text(json.dumps({"bbox": "1,2,3,4", "fc_basis": 1, "fc_updated": "x"}))
    (data / "om_0.json").write_text("[]")
    (data / "r_1.png").write_bytes(PNG)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert not (data / "om_0.json").exists() and not (data / "r_1.png").exists()
    assert entry.runtime_data.fc_basis is None
    assert await hass.config_entries.async_unload(entry.entry_id)
