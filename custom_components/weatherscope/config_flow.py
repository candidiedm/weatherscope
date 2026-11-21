"""Setup dialog: map centre, size and data sources."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.const import CONF_NAME
from homeassistant.core import callback
from homeassistant.helpers.selector import (
    BooleanSelector,
    LocationSelector,
    LocationSelectorConfig,
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
)

from .const import (
    AUTO,
    CONF_LOCATION,
    CONF_RADAR,
    CONF_SATELLITE,
    CONF_WEATHER,
    CONF_WIDTH_KM,
    DEFAULT_NAME,
    DEFAULT_WIDTH_KM,
    DOMAIN,
    RADAR_CHOICES,
    SATELLITE_CHOICES,
)


def _map_schema(defaults: dict[str, Any]) -> dict[Any, Any]:
    return {
        vol.Required(CONF_LOCATION, default=defaults[CONF_LOCATION]): LocationSelector(LocationSelectorConfig(radius=False)),
        vol.Required(CONF_WIDTH_KM, default=defaults[CONF_WIDTH_KM]): NumberSelector(
            NumberSelectorConfig(min=200, max=6000, step=50, unit_of_measurement="km", mode=NumberSelectorMode.BOX)
        ),
        vol.Required(CONF_RADAR, default=defaults[CONF_RADAR]): SelectSelector(
            SelectSelectorConfig(options=RADAR_CHOICES, translation_key="radar", mode=SelectSelectorMode.DROPDOWN)
        ),
        vol.Required(CONF_SATELLITE, default=defaults[CONF_SATELLITE]): SelectSelector(
            SelectSelectorConfig(options=SATELLITE_CHOICES, translation_key="satellite", mode=SelectSelectorMode.DROPDOWN)
        ),
        vol.Required(CONF_WEATHER, default=defaults[CONF_WEATHER]): BooleanSelector(),
    }


class WeatherScopeConfigFlow(ConfigFlow, domain=DOMAIN):
    """First setup."""

    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            name = user_input.pop(CONF_NAME, DEFAULT_NAME) or DEFAULT_NAME
            return self.async_create_entry(title=name, data=user_input)
        defaults = {
            CONF_LOCATION: {"latitude": self.hass.config.latitude, "longitude": self.hass.config.longitude},
            CONF_WIDTH_KM: DEFAULT_WIDTH_KM,
            CONF_RADAR: AUTO,
            CONF_SATELLITE: AUTO,
            CONF_WEATHER: True,
        }
        schema = vol.Schema({vol.Optional(CONF_NAME, default=DEFAULT_NAME): TextSelector(), **_map_schema(defaults)})
        return self.async_show_form(step_id="user", data_schema=schema)

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return WeatherScopeOptionsFlow()


class WeatherScopeOptionsFlow(OptionsFlow):
    """Change map centre, size or sources later."""

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            return self.async_create_entry(data=user_input)
        current = {**self.config_entry.data, **self.config_entry.options}
        defaults = {
            CONF_LOCATION: current.get(CONF_LOCATION) or {"latitude": self.hass.config.latitude, "longitude": self.hass.config.longitude},
            CONF_WIDTH_KM: current.get(CONF_WIDTH_KM, DEFAULT_WIDTH_KM),
            CONF_RADAR: current.get(CONF_RADAR, AUTO),
            CONF_SATELLITE: current.get(CONF_SATELLITE, AUTO),
            CONF_WEATHER: current.get(CONF_WEATHER, True),
        }
        return self.async_show_form(step_id="init", data_schema=vol.Schema(_map_schema(defaults)))
