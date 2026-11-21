"""Moon phase, illumination, next full moon, moonrise and moonset.

Low-precision formulas (accurate to a few minutes), no internet needed.
"""

from __future__ import annotations

import math
from datetime import UTC, datetime, timedelta

SYNODIC = 29.530588853
# A known new moon: 2000-01-06 18:14 UTC
NEW_MOON_REF = datetime(2000, 1, 6, 18, 14, tzinfo=UTC)

PHASES = (
    "new_moon",
    "waxing_crescent",
    "first_quarter",
    "waxing_gibbous",
    "full_moon",
    "waning_gibbous",
    "last_quarter",
    "waning_crescent",
)


def moon_age(when: datetime) -> float:
    """Days since the last new moon."""
    days = (when - NEW_MOON_REF).total_seconds() / 86400
    return days % SYNODIC


def moon_illumination(when: datetime) -> float:
    """Lit fraction of the moon disc in percent (0 … 100)."""
    return round((1 - math.cos(2 * math.pi * moon_age(when) / SYNODIC)) / 2 * 100, 1)


def moon_phase(when: datetime) -> str:
    """Phase name, same names as Home Assistant's moon integration."""
    a = moon_age(when) / SYNODIC
    # the four main phases get one day each, the rest go to the in-between phases
    day = 1 / SYNODIC
    for k, centre in ((0, 0.0), (2, 0.25), (4, 0.5), (6, 0.75)):
        if abs(a - centre) < day / 2 or abs(a - centre - 1) < day / 2:
            return PHASES[k]
    if a < 0.25:
        return PHASES[1]
    if a < 0.5:
        return PHASES[3]
    if a < 0.75:
        return PHASES[5]
    return PHASES[7]


def next_full_moon(when: datetime) -> datetime:
    """Time of the next full moon (± about half a day)."""
    age = moon_age(when)
    wait = (SYNODIC / 2 - age) % SYNODIC
    return when + timedelta(days=wait)


def _moon_radec(when: datetime) -> tuple[float, float]:
    """Right ascension and declination of the moon in radians."""
    d = (when - datetime(2000, 1, 1, 12, tzinfo=UTC)).total_seconds() / 86400
    rad = math.radians
    lon = rad(218.316 + 13.176396 * d)
    m = rad(134.963 + 13.064993 * d)
    f = rad(93.272 + 13.229350 * d)
    lam = lon + rad(6.289) * math.sin(m)
    beta = rad(5.128) * math.sin(f)
    eps = rad(23.4397)
    ra = math.atan2(math.sin(lam) * math.cos(eps) - math.tan(beta) * math.sin(eps), math.cos(lam))
    dec = math.asin(math.sin(beta) * math.cos(eps) + math.cos(beta) * math.sin(eps) * math.sin(lam))
    return ra, dec


def _moon_alt(when: datetime, lat: float, lon: float) -> float:
    """Altitude of the moon centre in degrees."""
    d = (when - datetime(2000, 1, 1, 12, tzinfo=UTC)).total_seconds() / 86400
    lst = math.radians((280.16 + 360.9856235 * d) % 360) + math.radians(lon)
    ra, dec = _moon_radec(when)
    h = lst - ra
    phi = math.radians(lat)
    return math.degrees(math.asin(math.sin(phi) * math.sin(dec) + math.cos(phi) * math.cos(dec) * math.cos(h)))


def moon_rise_set(day_start: datetime, lat: float, lon: float) -> tuple[datetime | None, datetime | None]:
    """Moonrise and moonset within 24 h from day_start (local midnight); None if none that day."""
    # parallax lifts the moon by ~0.95°, refraction and radius lower the horizon by ~0.83°
    h0 = 0.125
    step = timedelta(minutes=10)
    rise = sett = None
    t0 = day_start.astimezone(UTC)
    a0 = _moon_alt(t0, lat, lon) - h0
    for _ in range(24 * 6):
        t1 = t0 + step
        a1 = _moon_alt(t1, lat, lon) - h0
        if a0 < 0 <= a1 and rise is None:
            rise = t0 + step * (-a0 / (a1 - a0))
        elif a0 >= 0 > a1 and sett is None:
            sett = t0 + step * (a0 / (a0 - a1))
        t0, a0 = t1, a1
    return rise, sett
