"""Build frontend/weatherscope-fx.js (weather animation engine) from the preview script.

Usage: python tools/build_fx.py tools/fx_preview/script.part custom_components/weatherscope/frontend/weatherscope-fx.js
The preview page itself: cat tools/fx_preview/{head,script,tail}.part > preview.html
The preview page keeps its own controls; this strips them and wraps the engine in a factory:
window.WeatherScopeFx(bgCanvas, fxCanvas, host) -> { S, set, resize, start, stop, reset }.
"""
import re
import sys
from pathlib import Path

src, out = sys.argv[1], sys.argv[2]
s = Path(src).read_text(encoding="utf-8")


def rep(a, b, count=1):
    global s
    assert s.count(a) >= 1, a[:70]
    s = s.replace(a, b, count)


def cut(a, b, new=""):
    """Replace from marker a up to (not including) marker b."""
    global s
    i = s.index(a)
    j = s.index(b, i)
    s = s[:i] + new + s[j:]


s = s.strip()
assert s.startswith("<script>\n{") and s.endswith("}")
s = s[len("<script>\n{"):s.rindex("}")]

cut("\nconst bg = document.getElementById('bg')", "const MODES = {",
    "\nconst B = bg.getContext('2d'), F = fx.getContext('2d');\n"
    "const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);\n")
rep("\nconst S = { ", "\nconst S = { meteors: true, q: 1, fps: 30, maxDpr: 2, still: false, ")
m = re.search(r"const T = tiles\.map\(\(\) => \((\{.*?\})\)\);", s)
assert m
s = s.replace(m.group(0), f"const newT = () => ({m.group(1)});\nlet T = []; const TS = new Map(); // state per tile, kept by the tile's name")
cut("\nconst days = [", "\nfunction size() {", "\n")
cut("  DPR = Math.min(2, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight;", "  makeClouds(); makeFog(); fill();",
    "  DPR = Math.min(S.maxDpr, window.devicePixelRatio || 1); W = window.innerWidth; H = window.innerHeight; RC = null;\n"
    "  for (const c of [bg, fx]) { c.width = Math.round(W * DPR); c.height = Math.round(H * DPR); }\n"
    "  B.setTransform(DPR, 0, 0, DPR, 0, 0); F.setTransform(DPR, 0, 0, DPR, 0, 0);\n")
rep("area = W * H / 2100;", "area = W * H / 2100 * S.q;")
cut("  document.getElementById('cond').textContent = m.name;", "  // brighter sky = a little more tint", "")
rep("  document.documentElement.style.setProperty('--glass', Math.min(0.55, Math.max(0.3, 0.3 + (L - 0.45) * 0.5)).toFixed(2));",
    "  if (host.glass) host.glass(Math.min(0.55, Math.max(0.3, 0.3 + (L - 0.45) * 0.5)).toFixed(2));")
rep("function rects() { return tiles.map((el) => el.getBoundingClientRect()); }",
    "let RC = null; // tile positions, read once per frame\n"
    "function rects() {\n"
    "  if (RC) return RC;\n"
    "  const L = host.rects();\n"
    "  T = L.map((q) => { let o = TS.get(q.key); if (!o) { o = newT(); TS.set(q.key, o); } return o; });\n"
    "  RC = L.map((q) => q.rect); return RC;\n"
    "}")
# snow may only hang over an outer edge as far as the layer reaches (host.bounds), so it is never cut off straight
rep("    const o = T[i]; o.maxh = (up < 30",
    "    if (host.bounds) { const b = host.bounds(); lf = Math.min(lf, 2 * Math.max(0, r.left - b.left) + 2); rt = Math.min(rt, 2 * Math.max(0, b.right - r.right) + 2); }\n    const o = T[i]; o.maxh = (up < 30")
rep("if (S.tod === 'night' && m.clear && !S.fog) {\n    nextMeteor", "if (S.meteors && S.tod === 'night' && m.clear && !S.fog) {\n    nextMeteor")
rep("let meteor = null, nextMeteor = rnd(15, 40);", "let meteor = null, nextMeteor = rnd(120, 240);")
rep("// shooting star: rare, only in a clear night sky (first one soon, so it can be seen in the preview; then every 2–4 minutes)",
    "// shooting star: rare, only in a clear night sky (every 2–4 minutes)")
cut("function frame(ts) {", "function save() {", "")
cut("function save() {", "\nconst fmtT", """const KEY = 'weatherscope-fx-snow';
function save() { try { localStorage.setItem(KEY, JSON.stringify([...TS].filter(([, o]) => o.cap).map(([k, o]) => [k, Array.from(o.cap, (v) => Math.round(v * 10) / 10)]))); } catch (e) {} }
function load() { try { const a = JSON.parse(localStorage.getItem(KEY) || 'null'); if (Array.isArray(a)) a.forEach(([k, c]) => { if (c) { const o = newT(); o.cap = Float32Array.from(c); TS.set(k, o); } }); } catch (e) {} }
""")
i = s.index("\nconst fmtT")
s = s[:i] + """
function reset() { TS.clear(); T = []; RC = null; wetStart = t; splash = []; clumps = []; powder = []; falls = []; lines = []; slabs = []; bolt = null; flash = 0; save(); }
let run = false, raf = 0, saver = 0, stillT = 0;
function frame(ts) {
  if (!run) return;
  raf = requestAnimationFrame(frame);
  if (document.hidden) { last = ts; return; }
  if (S.still || reduce) { if (ts - stillT > 60000 || !stillT) { stillT = ts; RC = null; draw(); } last = ts; return; }
  if (ts - last < 1000 / S.fps - 2) return;
  const dt = Math.min(0.05, (ts - last) / 1000 || 0.03); last = ts; t += dt; RC = null;
  step(dt); draw();
}
load();
return {
  S,
  // new weather: only what changed is rebuilt
  set(o) {
    const scene = ['mode', 'tod'].some((k) => k in o && o[k] !== S[k]), fogC = 'fog' in o && o.fog !== S.fog, qC = ('q' in o && o.q !== S.q), dC = 'maxDpr' in o && o.maxDpr !== S.maxDpr;
    const wasWet = !!MODES[S.mode].rain, any = Object.keys(o).some((k) => o[k] !== S[k]);
    if (!any) return;
    Object.assign(S, o);
    if (!wasWet && MODES[S.mode].rain) wetStart = t;
    if (!W) return;
    if (dC) size(); else if (scene) { makeClouds(); fill(); } else if (fogC || qC) fill();
    stillT = 0;
  },
  resize: size,
  start() { if (run) return; run = true; if (!W) size(); saver = setInterval(save, 5000); raf = requestAnimationFrame(frame); },
  stop() { run = false; cancelAnimationFrame(raf); clearInterval(saver); save(); },
  reset,
};
};
"""
s = ("/* WeatherScope – weather animation: sky behind the tiles and weather on the tiles.\n"
     "   Generated by tools/build_fx.py from the preview page; own drawing code, no images. */\n"
     "(() => {\nwindow.WeatherScopeFx = function (bg, fx, host) {" + s + "})();\n")
for bad in ("document.getElementById", "querySelector", "tiles.map", " innerWidth;", "ui()"):
    assert bad not in s, bad
Path(out).write_text(s, encoding="utf-8")
print("ok", len(s))
