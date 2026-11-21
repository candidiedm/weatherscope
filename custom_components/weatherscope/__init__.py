"""WeatherScope – animated weather maps for Home Assistant dashboards."""

from __future__ import annotations

from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant

from .const import CARD_FILES, CONF_WEATHER, DOMAIN, URL_DATA, URL_STATIC, VERSION
from .manager import WeatherScopeManager
from .weather_data import WeatherScopeData

PLATFORMS: list[Platform] = [Platform.SENSOR, Platform.WEATHER]

type WeatherScopeConfigEntry = ConfigEntry[WeatherScopeManager]


async def _async_register_frontend(hass: HomeAssistant) -> None:
    """Serve the card, the base-map data and the downloaded images (once per HA start)."""
    data = hass.data.setdefault(DOMAIN, {})
    if data.get("frontend"):
        return
    data["frontend"] = True
    base = Path(__file__).parent / "frontend"
    files = Path(hass.config.path("weatherscope"))
    await hass.async_add_executor_job(lambda: files.mkdir(parents=True, exist_ok=True))
    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(URL_STATIC, str(base), cache_headers=True),
            StaticPathConfig(URL_DATA, str(files), cache_headers=False),
        ]
    )
    for name in CARD_FILES:
        add_extra_js_url(hass, f"{URL_STATIC}/{name}?v={VERSION}")


async def async_setup_entry(hass: HomeAssistant, entry: WeatherScopeConfigEntry) -> bool:
    """Set up WeatherScope from a config entry."""
    await _async_register_frontend(hass)
    manager = WeatherScopeManager(hass, entry)
    entry.runtime_data = manager
    await manager.async_start()
    if {**entry.data, **entry.options}.get(CONF_WEATHER, True):
        manager.weather = WeatherScopeData(hass, entry, manager.dir)
        # a failed first fetch must not block the map; the coordinator retries by itself
        await manager.weather.async_refresh()
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_async_reload))
    return True


async def _async_reload(hass: HomeAssistant, entry: WeatherScopeConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: WeatherScopeConfigEntry) -> bool:
    """Unload a config entry."""
    await entry.runtime_data.async_stop()
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def async_remove_entry(hass: HomeAssistant, entry: WeatherScopeConfigEntry) -> None:
    """Delete downloaded files when the entry is removed."""
    import shutil

    path = Path(hass.config.path("weatherscope", entry.entry_id))
    await hass.async_add_executor_job(lambda: shutil.rmtree(path, ignore_errors=True))
