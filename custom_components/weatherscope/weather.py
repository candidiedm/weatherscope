"""Weather entity with current values and hourly / daily forecast (Open-Meteo)."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from homeassistant.components.weather import Forecast, WeatherEntity, WeatherEntityFeature
from homeassistant.const import UnitOfLength, UnitOfPrecipitationDepth, UnitOfPressure, UnitOfSpeed, UnitOfTemperature
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from . import WeatherScopeConfigEntry
from .sensor import device_info
from .weather_data import WeatherScopeData, condition

ATTRIBUTION = "Weather data by Open-Meteo.com (CC BY 4.0)"


async def async_setup_entry(hass: HomeAssistant, entry: WeatherScopeConfigEntry, async_add_entities: AddEntitiesCallback) -> None:
    """Add the weather entity when weather data is switched on."""
    data = entry.runtime_data.weather
    if data:
        async_add_entities([WeatherScopeWeather(data, entry)])


def _iso(ts: Any) -> str:
    return datetime.fromtimestamp(int(ts), UTC).isoformat()


def _at(lst: list[Any] | None, i: int) -> Any:
    return lst[i] if lst and i < len(lst) else None


class WeatherScopeWeather(CoordinatorEntity[WeatherScopeData], WeatherEntity):
    """Current weather at home, with forecasts."""

    _attr_has_entity_name = True
    _attr_name = None
    _attr_attribution = ATTRIBUTION
    _attr_native_temperature_unit = UnitOfTemperature.CELSIUS
    _attr_native_pressure_unit = UnitOfPressure.HPA
    _attr_native_wind_speed_unit = UnitOfSpeed.KILOMETERS_PER_HOUR
    _attr_native_visibility_unit = UnitOfLength.KILOMETERS
    _attr_native_precipitation_unit = UnitOfPrecipitationDepth.MILLIMETERS
    _attr_supported_features = WeatherEntityFeature.FORECAST_DAILY | WeatherEntityFeature.FORECAST_HOURLY

    def __init__(self, data: WeatherScopeData, entry: WeatherScopeConfigEntry) -> None:
        super().__init__(data)
        self._attr_unique_id = f"{entry.entry_id}_weather"
        self._attr_device_info = device_info(entry)

    @property
    def _cur(self) -> dict[str, Any]:
        return (self.coordinator.data or {}).get("current", {})

    @property
    def condition(self) -> str | None:
        return condition(self._cur.get("weather_code"), self._cur.get("is_day", 1))

    @property
    def native_temperature(self) -> float | None:
        return self._cur.get("temperature_2m")

    @property
    def native_apparent_temperature(self) -> float | None:
        return self._cur.get("apparent_temperature")

    @property
    def humidity(self) -> float | None:
        return self._cur.get("relative_humidity_2m")

    @property
    def native_dew_point(self) -> float | None:
        return self._cur.get("dew_point_2m")

    @property
    def native_pressure(self) -> float | None:
        return self._cur.get("pressure_msl")

    @property
    def native_wind_speed(self) -> float | None:
        return self._cur.get("wind_speed_10m")

    @property
    def native_wind_gust_speed(self) -> float | None:
        return self._cur.get("wind_gusts_10m")

    @property
    def wind_bearing(self) -> float | None:
        return self._cur.get("wind_direction_10m")

    @property
    def cloud_coverage(self) -> float | None:
        return self._cur.get("cloud_cover")

    @property
    def uv_index(self) -> float | None:
        return self._cur.get("uv_index")

    @property
    def native_visibility(self) -> float | None:
        v = self._cur.get("visibility")
        return round(v / 1000, 1) if v is not None else None

    async def async_forecast_daily(self) -> list[Forecast] | None:
        d = (self.coordinator.data or {}).get("daily", {})
        out: list[Forecast] = []
        for i, t in enumerate(d.get("time", [])):
            out.append(
                Forecast(
                    datetime=_iso(t),
                    condition=condition(_at(d.get("weather_code"), i)),
                    native_temperature=_at(d.get("temperature_2m_max"), i),
                    native_templow=_at(d.get("temperature_2m_min"), i),
                    native_precipitation=_at(d.get("precipitation_sum"), i),
                    precipitation_probability=_at(d.get("precipitation_probability_max"), i),
                    native_wind_speed=_at(d.get("wind_speed_10m_max"), i),
                    wind_bearing=_at(d.get("wind_direction_10m_dominant"), i),
                    uv_index=_at(d.get("uv_index_max"), i),
                )
            )
        return out

    async def async_forecast_hourly(self) -> list[Forecast] | None:
        h = (self.coordinator.data or {}).get("hourly", {})
        out: list[Forecast] = []
        for i, t in enumerate(h.get("time", [])):
            day = _at(h.get("is_day"), i)
            out.append(
                Forecast(
                    datetime=_iso(t),
                    condition=condition(_at(h.get("weather_code"), i), day if day is not None else 1),
                    native_temperature=_at(h.get("temperature_2m"), i),
                    native_precipitation=_at(h.get("precipitation"), i),
                    precipitation_probability=_at(h.get("precipitation_probability"), i),
                    native_wind_speed=_at(h.get("wind_speed_10m"), i),
                    wind_bearing=_at(h.get("wind_direction_10m"), i),
                    uv_index=_at(h.get("uv_index"), i),
                    is_daytime=bool(day) if day is not None else None,
                )
            )
        return out

    def _handle_coordinator_update(self) -> None:
        super()._handle_coordinator_update()
        self.hass.async_create_task(self.async_update_listeners(None))
