import re
from datetime import timedelta
from pathlib import Path
from unittest.mock import patch

from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_time_changed

from custom_components.weatherscope.const import DOMAIN

PNG = b"\x89PNG" + b"0" * 20


async def test_ticks(hass, aioclient_mock, tmp_path: Path):
    hass.config.config_dir = str(tmp_path)
    aioclient_mock.get(re.compile(r".*"), content=PNG, headers={"Content-Type": "image/png"})
    entry = MockConfigEntry(
        domain=DOMAIN, data={"location": {"latitude": 51, "longitude": 10.1}, "width_km": 1000, "radar": "auto", "satellite": "none"}
    )
    entry.add_to_hass(hass)
    calls = []
    from custom_components.weatherscope import manager as M

    orig = M.WeatherScopeManager._radar_tick

    async def spy(self, now=None):
        calls.append(now)
        return await orig(self, now)

    with (
        patch.object(M.WeatherScopeManager, "_radar_tick", spy),
        patch("custom_components.weatherscope.manager.asyncio.sleep", return_value=None),
    ):
        assert await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()
        for k in range(1, 4):
            async_fire_time_changed(hass, dt_util.utcnow() + timedelta(minutes=5 * k + 1))
            await hass.async_block_till_done(wait_background_tasks=True)
    print("CALLS", len(calls))
    assert len(calls) >= 3
