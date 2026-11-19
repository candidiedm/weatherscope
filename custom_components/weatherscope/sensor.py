"""Status sensor that hands map settings and update times to the card."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity import async_generate_entity_id
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.util import dt as dt_util

from . import WeatherScopeConfigEntry
from .const import DOMAIN, SIGNAL_UPDATE, VERSION
from .manager import WeatherScopeManager

ATTRS = ("version", "url", "bbox", "size", "center", "grid", "radar", "satellite", "forecast", "errors", "attribution")


async def async_setup_entry(hass: HomeAssistant, entry: WeatherScopeConfigEntry, async_add_entities: AddEntitiesCallback) -> None:
    """Add the status sensor."""
    sensor = WeatherScopeSensor(entry.runtime_data)
    # Same entity id in every language, so the card example in the README always fits.
    sensor.entity_id = async_generate_entity_id("sensor.{}", f"{entry.title} map data", hass=hass)
    async_add_entities([sensor])


class WeatherScopeSensor(SensorEntity):
    """Last data update; the attributes describe the map for weatherscope-card."""

    _attr_has_entity_name = True
    _attr_translation_key = "status"
    _attr_device_class = SensorDeviceClass.TIMESTAMP
    _attr_icon = "mdi:map-clock"
    _attr_should_poll = False
    # Map settings change rarely and would only bloat the database.
    _unrecorded_attributes = frozenset(ATTRS)

    def __init__(self, manager: WeatherScopeManager) -> None:
        self._m = manager
        entry = manager.entry
        self._attr_unique_id = f"{entry.entry_id}_status"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name=entry.title,
            manufacturer="WeatherScope",
            sw_version=VERSION,
            entry_type=DeviceEntryType.SERVICE,
        )

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(async_dispatcher_connect(self.hass, SIGNAL_UPDATE.format(self._m.entry.entry_id), self._update))

    @callback
    def _update(self) -> None:
        self.async_write_ha_state()

    @property
    def native_value(self) -> datetime | None:
        ts = max((t for t in (self._m.radar_basis, self._m.sat_basis, self._m.fc_basis) if t), default=None)
        return dt_util.utc_from_timestamp(ts) if ts else None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return self._m.attributes()
