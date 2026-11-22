"""Status sensor that hands map settings and update times to the card."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity, SensorEntityDescription, SensorStateClass
from homeassistant.const import PERCENTAGE, UnitOfLength, UnitOfPrecipitationDepth
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity import async_generate_entity_id
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.util import dt as dt_util

from .const import DOMAIN, SIGNAL_UPDATE, VERSION
from .manager import WeatherScopeManager
from .weather_data import WeatherScopeData

ATTRS = ("updated", "version", "url", "bbox", "size", "center", "grid", "radar", "satellite", "forecast", "errors", "attribution")


def device_info(entry: Any) -> DeviceInfo:
    """One device per WeatherScope entry."""
    return DeviceInfo(
        identifiers={(DOMAIN, entry.entry_id)},
        name=entry.title,
        manufacturer="WeatherScope",
        sw_version=VERSION,
        entry_type=DeviceEntryType.SERVICE,
    )


def _ts(v: Any) -> datetime | None:
    if v is None:
        return None
    if isinstance(v, datetime):
        return v
    return datetime.fromtimestamp(int(v), UTC)


def _today(d: dict[str, Any], key: str) -> Any:
    lst = d.get("daily", {}).get(key) or []
    return lst[0] if lst else None


def _steps(d: dict[str, Any]) -> list[list[Any]]:
    """Precipitation in 15-minute steps for the next hours: [[iso time, mm], ...]."""
    m = d.get("minutely") or {}
    return [[_ts(t).isoformat(), v] for t, v in zip(m.get("time", []), m.get("precipitation", []), strict=False) if t is not None]


def _past_hours(d: dict[str, Any]) -> list[list[Any]]:
    """Precipitation of each of the past 24 hours: [[iso time at the end of the hour, mm], ...]."""
    h = d.get("hourly") or {}
    now = (d.get("current") or {}).get("time") or dt_util.utcnow().timestamp()
    return [
        [_ts(t).isoformat(), v]
        for t, v in zip(h.get("time", []), h.get("precipitation", []), strict=False)
        if t is not None and now - 86400 < t <= now
    ]


def _past_24h(d: dict[str, Any]) -> float | None:
    vals = [v for _, v in _past_hours(d) if v is not None]
    return round(sum(vals), 1) if vals else None


def _next_hour(d: dict[str, Any]) -> float | None:
    now = dt_util.utcnow().timestamp()
    m = d.get("minutely") or {}
    vals = [v for t, v in zip(m.get("time", []), m.get("precipitation", []), strict=False) if v is not None and now - 900 < t <= now + 3600]
    return round(sum(vals), 1) if vals else None


def _normal_today(d: dict[str, Any]) -> float | None:
    months = d.get("normals")
    if not months:
        return None
    return months[dt_util.now().month - 1].get("high")


@dataclass(frozen=True, kw_only=True)
class WSSensorDescription(SensorEntityDescription):
    """Sensor fed by the weather data."""

    value_fn: Callable[[dict[str, Any]], Any]
    attrs_fn: Callable[[dict[str, Any]], dict[str, Any]] | None = None


try:  # Home Assistant 2026.8+: µg/m³ moved to UnitOfDensity
    from homeassistant.const import UnitOfDensity

    AQ = UnitOfDensity.MICROGRAMS_PER_CUBIC_METER
except ImportError:  # older versions
    from homeassistant.const import CONCENTRATION_MICROGRAMS_PER_CUBIC_METER as AQ
MEAS = SensorStateClass.MEASUREMENT

WEATHER_SENSORS: tuple[WSSensorDescription, ...] = (
    WSSensorDescription(key="air_quality_index", translation_key="air_quality_index", device_class=SensorDeviceClass.AQI, state_class=MEAS,
                        value_fn=lambda d: d["air"].get("european_aqi")),
    WSSensorDescription(key="pm2_5", translation_key="pm2_5", device_class=SensorDeviceClass.PM25, native_unit_of_measurement=AQ, state_class=MEAS,
                        value_fn=lambda d: d["air"].get("pm2_5")),
    WSSensorDescription(key="pm10", translation_key="pm10", device_class=SensorDeviceClass.PM10, native_unit_of_measurement=AQ, state_class=MEAS,
                        value_fn=lambda d: d["air"].get("pm10")),
    WSSensorDescription(key="no2", translation_key="no2", device_class=SensorDeviceClass.NITROGEN_DIOXIDE, native_unit_of_measurement=AQ,
                        state_class=MEAS, value_fn=lambda d: d["air"].get("nitrogen_dioxide")),
    WSSensorDescription(key="o3", translation_key="o3", device_class=SensorDeviceClass.OZONE, native_unit_of_measurement=AQ, state_class=MEAS,
                        value_fn=lambda d: d["air"].get("ozone")),
    WSSensorDescription(key="co", translation_key="co", device_class=SensorDeviceClass.CO, native_unit_of_measurement=AQ, state_class=MEAS,
                        suggested_display_precision=0,
                        value_fn=lambda d: d["air"].get("carbon_monoxide")),
    WSSensorDescription(key="so2", translation_key="so2", device_class=SensorDeviceClass.SULPHUR_DIOXIDE, native_unit_of_measurement=AQ,
                        state_class=MEAS, value_fn=lambda d: d["air"].get("sulphur_dioxide")),
    WSSensorDescription(key="uv_index", translation_key="uv_index", icon="mdi:sun-wireless", state_class=MEAS, suggested_display_precision=1,
                        value_fn=lambda d: d["current"].get("uv_index")),
    WSSensorDescription(key="visibility", translation_key="visibility", icon="mdi:eye", device_class=SensorDeviceClass.DISTANCE,
                        native_unit_of_measurement=UnitOfLength.KILOMETERS, state_class=MEAS, suggested_display_precision=0,
                        value_fn=lambda d: round(d["current"]["visibility"] / 1000, 1) if d["current"].get("visibility") is not None else None),
    # total_increasing (resets at midnight): Home Assistant then keeps hourly/daily rain in its long-term statistics
    WSSensorDescription(key="precipitation_today", translation_key="precipitation_today", device_class=SensorDeviceClass.PRECIPITATION,
                        native_unit_of_measurement=UnitOfPrecipitationDepth.MILLIMETERS, state_class=SensorStateClass.TOTAL_INCREASING,
                        value_fn=lambda d: _today(d, "precipitation_sum")),
    WSSensorDescription(key="precipitation_nowcast", translation_key="precipitation_nowcast", icon="mdi:weather-rainy",
                        device_class=SensorDeviceClass.PRECIPITATION, native_unit_of_measurement=UnitOfPrecipitationDepth.MILLIMETERS,
                        value_fn=lambda d: _next_hour(d), attrs_fn=lambda d: {"steps": _steps(d)}),
    WSSensorDescription(key="precipitation_24h", translation_key="precipitation_24h", device_class=SensorDeviceClass.PRECIPITATION,
                        native_unit_of_measurement=UnitOfPrecipitationDepth.MILLIMETERS,
                        value_fn=_past_24h, attrs_fn=lambda d: {"hours": _past_hours(d)}),
    WSSensorDescription(key="sunrise", translation_key="sunrise", icon="mdi:weather-sunset-up", device_class=SensorDeviceClass.TIMESTAMP,
                        value_fn=lambda d: _ts(_today(d, "sunrise"))),
    WSSensorDescription(key="sunset", translation_key="sunset", icon="mdi:weather-sunset-down", device_class=SensorDeviceClass.TIMESTAMP,
                        value_fn=lambda d: _ts(_today(d, "sunset"))),
    WSSensorDescription(key="moon_phase", translation_key="moon_phase", icon="mdi:moon-waxing-gibbous", device_class=SensorDeviceClass.ENUM,
                        options=["new_moon", "waxing_crescent", "first_quarter", "waxing_gibbous", "full_moon", "waning_gibbous",
                                 "last_quarter", "waning_crescent"],
                        value_fn=lambda d: d["moon"]["phase"]),
    WSSensorDescription(key="moon_illumination", translation_key="moon_illumination", icon="mdi:brightness-6",
                        native_unit_of_measurement=PERCENTAGE, value_fn=lambda d: d["moon"]["illumination"]),
    WSSensorDescription(key="moonrise", translation_key="moonrise", icon="mdi:arrow-up-circle-outline", device_class=SensorDeviceClass.TIMESTAMP,
                        value_fn=lambda d: d["moon"]["rise"]),
    WSSensorDescription(key="moonset", translation_key="moonset", icon="mdi:arrow-down-circle-outline", device_class=SensorDeviceClass.TIMESTAMP,
                        value_fn=lambda d: d["moon"]["set"]),
    WSSensorDescription(key="next_full_moon", translation_key="next_full_moon", icon="mdi:moon-full", device_class=SensorDeviceClass.TIMESTAMP,
                        value_fn=lambda d: d["moon"]["next_full"]),
    WSSensorDescription(key="normal_high", translation_key="normal_high", icon="mdi:chart-bell-curve", device_class=SensorDeviceClass.TEMPERATURE,
                        native_unit_of_measurement="°C", value_fn=_normal_today,
                        attrs_fn=lambda d: {"months": d.get("normals")} if d.get("normals") else {}),
)  # fmt: skip


async def async_setup_entry(hass: HomeAssistant, entry: Any, async_add_entities: AddEntitiesCallback) -> None:
    """Add the status sensor and, if switched on, the weather sensors."""
    sensor = WeatherScopeSensor(entry.runtime_data)
    # Same entity id in every language, so the card example in the README always fits.
    sensor.entity_id = async_generate_entity_id("sensor.{}", f"{entry.title} map data", hass=hass)
    entities: list[SensorEntity] = [sensor]
    data = entry.runtime_data.weather
    if data:
        for desc in WEATHER_SENSORS:
            e = WeatherSensor(data, entry, desc)
            e.entity_id = async_generate_entity_id("sensor.{}", f"{entry.title} {desc.key}", hass=hass)
            entities.append(e)
    async_add_entities(entities)


class WeatherSensor(CoordinatorEntity[WeatherScopeData], SensorEntity):
    """One value from the weather data."""

    _attr_has_entity_name = True
    entity_description: WSSensorDescription

    def __init__(self, data: WeatherScopeData, entry: Any, desc: WSSensorDescription) -> None:
        super().__init__(data)
        self.entity_description = desc
        self._attr_unique_id = f"{entry.entry_id}_{desc.key}"
        self._attr_device_info = device_info(entry)
        if desc.key == "normal_high":
            self._unrecorded_attributes = frozenset({"months"})
        if desc.key == "precipitation_nowcast":
            self._unrecorded_attributes = frozenset({"steps"})
        if desc.key == "precipitation_24h":
            self._unrecorded_attributes = frozenset({"hours"})

    @property
    def native_value(self) -> Any:
        d = self.coordinator.data
        if not d:
            return None
        try:
            return self.entity_description.value_fn(d)
        except (KeyError, TypeError, ValueError):
            return None

    @property
    def icon(self) -> str | None:
        if self.entity_description.key == "moon_phase" and self.coordinator.data:
            return f"mdi:moon-{self.coordinator.data['moon']['phase'].replace('_moon', '').replace('_', '-')}"
        return self.entity_description.icon

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        fn = self.entity_description.attrs_fn
        return fn(self.coordinator.data) if fn and self.coordinator.data else None


class WeatherScopeSensor(SensorEntity):
    """Last data update; the attributes describe the map for weatherscope-card."""

    _attr_has_entity_name = True
    _attr_translation_key = "status"
    # only "ok" / "error": a timestamp here would flood the activity log every 5 minutes
    _attr_device_class = SensorDeviceClass.ENUM
    _attr_icon = "mdi:map-clock"
    _attr_should_poll = False
    # Map settings change rarely and would only bloat the database.
    _unrecorded_attributes = frozenset(ATTRS)

    def __init__(self, manager: WeatherScopeManager) -> None:
        self._m = manager
        entry = manager.entry
        self._attr_unique_id = f"{entry.entry_id}_status"
        self._attr_options = ["ok", "error"]
        self._attr_device_info = device_info(entry)

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(async_dispatcher_connect(self.hass, SIGNAL_UPDATE.format(self._m.entry.entry_id), self._update))

    @callback
    def _update(self) -> None:
        self.async_write_ha_state()

    @property
    def native_value(self) -> str:
        return "error" if self._m.errors else "ok"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        ts = max((t for t in (self._m.radar_basis, self._m.sat_basis, self._m.fc_basis) if t), default=None)
        return {**self._m.attributes(), "updated": dt_util.utc_from_timestamp(ts).isoformat() if ts else None}
