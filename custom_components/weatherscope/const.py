"""Constants for WeatherScope."""

from __future__ import annotations

DOMAIN = "weatherscope"
VERSION = "0.12.7"

# Config entry keys
CONF_LOCATION = "location"
CONF_WIDTH_KM = "width_km"
CONF_RADAR = "radar"
CONF_SATELLITE = "satellite"
CONF_WEATHER = "weather_data"

DEFAULT_NAME = "WeatherScope"
DEFAULT_WIDTH_KM = 750
# Extra map loaded around the chosen area, so the card is always filled (1.5 = 25 % on every side)
MAP_PAD = 1.5

# Provider choices
AUTO = "auto"
NONE = "none"
RADAR_DWD = "dwd"
SAT_EUMETSAT = "eumetsat"
RADAR_CHOICES = [AUTO, RADAR_DWD, NONE]
SATELLITE_CHOICES = [AUTO, SAT_EUMETSAT, NONE]

# Image size of every map layer (portrait, like a dashboard tile)
IMG_W = 800
IMG_H = 922

# Forecast grid (Open-Meteo): NLA rows x NLO columns, fetched in FC_PARTS requests
GRID_NLA = 32
GRID_NLO = 33
FC_PARTS = 4

# Time windows
RADAR_STEP_MIN = 5
RADAR_PAST = 36  # 3 hours
RADAR_FUTURE = 12  # 1 hour nowcast
SAT_STEP_MIN = 10
SAT_PAST = 18  # 3 hours

# URLs served by Home Assistant
URL_STATIC = "/weatherscope/static"
URL_DATA = "/weatherscope/data"
CARD_FILE = "weatherscope-card.js"
CARD_FILES = (CARD_FILE, "weatherscope-cards.js")

SIGNAL_UPDATE = "weatherscope_update_{}"
