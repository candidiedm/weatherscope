"""Fixtures."""

from unittest.mock import patch

import pytest


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Allow loading custom_components/weatherscope."""
    yield


@pytest.fixture(autouse=True)
def fake_frontend(hass):
    """The real frontend needs the large hass_frontend package; pretend it is loaded."""
    hass.config.components.add("frontend")
    with patch("custom_components.weatherscope.add_extra_js_url") as mock:
        yield mock
