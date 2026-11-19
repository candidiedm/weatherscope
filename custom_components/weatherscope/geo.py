"""Map geometry: Web Mercator box around a centre point and the forecast grid."""

from __future__ import annotations

import math
from dataclasses import dataclass

from .const import GRID_NLA, GRID_NLO, IMG_H, IMG_W

R_EARTH = 6378137.0


def merc(lon: float, lat: float) -> tuple[float, float]:
    """WGS84 -> EPSG:3857."""
    x = R_EARTH * math.radians(lon)
    y = R_EARTH * math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))
    return x, y


def inv_merc(x: float, y: float) -> tuple[float, float]:
    """EPSG:3857 -> WGS84 (lon, lat)."""
    lon = math.degrees(x / R_EARTH)
    lat = math.degrees(2 * math.atan(math.exp(y / R_EARTH)) - math.pi / 2)
    return lon, lat


@dataclass(frozen=True)
class MapBox:
    """Map box in EPSG:3857 metres plus the matching lon/lat range."""

    x0: float
    y0: float
    x1: float
    y1: float

    @classmethod
    def around(cls, lat: float, lon: float, width_km: float) -> MapBox:
        """Box centred on lat/lon, `width_km` wide (true distance at the centre)."""
        cx, cy = merc(lon, lat)
        w = width_km * 1000 / max(0.2, math.cos(math.radians(lat)))
        h = w * IMG_H / IMG_W
        return cls(round(cx - w / 2), round(cy - h / 2), round(cx + w / 2), round(cy + h / 2))

    @property
    def wms(self) -> str:
        """BBOX parameter for WMS requests in EPSG:3857."""
        return f"{self.x0},{self.y0},{self.x1},{self.y1}"

    @property
    def lonlat(self) -> tuple[float, float, float, float]:
        """(lon0, lat0, lon1, lat1)."""
        lo0, la0 = inv_merc(self.x0, self.y0)
        lo1, la1 = inv_merc(self.x1, self.y1)
        return lo0, la0, lo1, la1

    def intersects(self, lon0: float, lat0: float, lon1: float, lat1: float) -> bool:
        """True if the box overlaps the given lon/lat rectangle."""
        a0, b0, a1, b1 = self.lonlat
        return not (a1 < lon0 or a0 > lon1 or b1 < lat0 or b0 > lat1)

    def grid(self) -> dict[str, float]:
        """Regular lon/lat grid covering the box (for Open-Meteo)."""
        lo0, la0, lo1, la1 = self.lonlat
        return {
            "la0": round(la0, 3),
            "dla": round((la1 - la0) / (GRID_NLA - 1), 4),
            "nla": GRID_NLA,
            "lo0": round(lo0, 3),
            "dlo": round((lo1 - lo0) / (GRID_NLO - 1), 4),
            "nlo": GRID_NLO,
        }
