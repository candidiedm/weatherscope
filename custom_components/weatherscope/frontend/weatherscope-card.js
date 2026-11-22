// WeatherScope card – animated weather maps (rain radar, satellite, lightning, wind, rain, temperature).
// All data is downloaded by the WeatherScope integration on Home Assistant; the browser only talks to Home Assistant.
(() => {
  const VERSION = '0.12.7';
  const BASE = '/weatherscope/static/geo/';
  // Apple-style grid: a small tile (4 columns × 3 rows) is a square, bigger tiles are multiples of it.
  // Inside a sections grid the row height of that section is set so that 3 rows match 4 columns (gaps included).
  // Turn off per card with square: false.
  const sqCols = (c, g) => (c && c.grid_options && c.grid_options.columns) ?? g.columns;
  const sqUp = (n) => n.parentElement || (n.getRootNode && n.getRootNode().host) || null;
  const sqFit = (el, c, g) => {
    if (!c || c.square === false) return;
    const cols = sqCols(c, g); if (typeof cols !== 'number') return;
    const cs = getComputedStyle(el); if (!cs.getPropertyValue('--row-height').trim()) return;
    let sec = sqUp(el); for (let i = 0; sec && sec.tagName !== 'HUI-GRID-SECTION' && i < 12; i++) sec = sqUp(sec);
    if (!sec || sec.tagName !== 'HUI-GRID-SECTION') return;
    const W = el.getBoundingClientRect().width; if (!W) return;
    const cg = parseFloat(cs.getPropertyValue('--column-gap')) || 8, rg = parseFloat(cs.getPropertyValue('--row-gap')) || 8;
    const col = (W - (cols - 1) * cg) / cols, h = Math.round(((4 * col + 3 * cg - 2 * rg) / 3) * 2) / 2;
    if (h > 20 && Math.abs((parseFloat(sec.style.getPropertyValue('--ha-section-grid-row-height')) || 0) - h) > 0.5) sec.style.setProperty('--ha-section-grid-row-height', `${h}px`);
  };


  // ---------- colour tables ----------
  const DWD = [[51, 255, 255], [26, 204, 154], [1, 153, 52], [77, 179, 27], [153, 204, 1], [204, 230, 1], [255, 255, 1], [255, 196, 1], [255, 137, 1], [255, 69, 1], [254, 0, 0], [229, 0, 76], [204, 0, 152], [102, 0, 203], [0, 0, 254]];
  const WIN = [[112, 104, 172, .55], [70, 100, 168, .7], [22, 122, 142, .82], [12, 156, 108, .9], [60, 188, 70, .95], [170, 208, 50, 1], [240, 220, 40, 1], [245, 176, 32, 1], [240, 122, 32, 1], [230, 72, 32, 1], [214, 40, 40, 1], [200, 30, 90, 1], [200, 40, 150, 1], [170, 60, 200, 1], [90, 26, 154, 1]];
  const LEG_R = ['#7068ac', '#4664a8', '#167a8e', '#0c9c6c', '#3cbc46', '#aad032', '#f0dc28', '#f07a20', '#d62828', '#c8288c'];
  const IRC = [[150, [90, 200, 230]], [166, [40, 90, 220]], [182, [40, 190, 80]], [195, [240, 225, 40]], [205, [245, 140, 30]], [214, [220, 40, 40]], [226, [90, 26, 154]]];
  const LEG_I = ['#7a7a7a', '#5ac8e6', '#285adc', '#28be50', '#f0e128', '#f58c1e', '#dc2828', '#5a1a9a'];
  const LEG_B = ['rgba(240,180,245,1)', 'rgba(220,160,230,.75)', 'rgba(200,140,210,.5)', 'rgba(180,130,190,.28)'];
  // WeatherScope temperature scale: smooth, with a clear edge at 0 °C (frost blue, above zero green)
  const PAL_T = [[-50, [245, 238, 248]], [-45, [214, 181, 226]], [-40, [176, 124, 200]], [-35, [138, 85, 176]], [-30, [75, 42, 122]], [-25, [58, 58, 140]], [-20, [44, 74, 158]], [-15, [54, 100, 186]], [-10, [63, 127, 214]], [-0.01, [143, 208, 240]], [0.01, [92, 191, 140]], [8, [159, 211, 107]], [14, [227, 220, 85]], [20, [246, 177, 63]], [26, [239, 124, 53]], [32, [217, 68, 47]], [40, [142, 28, 58]], [45, [106, 15, 42]], [50, [70, 8, 28]], [55, [36, 4, 14]]];
  // kept for a later colour choice in the card editor
  const PAL_T_WINDY = [[-25, [123, 47, 191]], [-15, [74, 90, 216]], [-5, [63, 160, 224]], [0, [86, 195, 201]], [5, [98, 191, 115]], [10, [156, 204, 74]], [15, [216, 210, 58]], [20, [240, 178, 50]], [25, [238, 125, 44]], [30, [224, 72, 48]], [38, [168, 32, 60]]];
  const PAL_T_APPLE = [[-30, [44, 79, 158]], [-0.01, [44, 79, 158]], [0, [111, 182, 233]], [14.99, [111, 182, 233]], [15, [100, 194, 107]], [19.99, [100, 194, 107]], [20, [242, 212, 58]], [24.99, [242, 212, 58]], [25, [243, 154, 44]], [29.99, [243, 154, 44]], [30, [227, 65, 47]], [40, [227, 65, 47]]];
  const PAL_W = [[0, [61, 95, 163]], [10, [58, 143, 183]], [20, [63, 181, 154]], [30, [125, 197, 82]], [40, [216, 210, 58]], [55, [238, 154, 44]], [70, [224, 72, 48]], [90, [184, 48, 110]], [120, [123, 47, 191]], [150, [74, 29, 138]], [200, [44, 16, 96]]];
  const PAL_R = [[0.1, [120, 160, 215]], [0.5, [45, 105, 205]], [1, [30, 160, 150]], [2, [80, 190, 80]], [4, [200, 210, 50]], [7, [240, 170, 40]], [10, [230, 100, 40]], [20, [210, 40, 40]], [30, [190, 40, 140]], [50, [122, 31, 143]], [100, [62, 12, 94]]];
  const LEG_T = ['#2c4a9e', '#3664ba', '#3f7fd6', '#67a8e3', '#8fd0f0', '#5cbf8c', '#9fd36b', '#e3dc55', '#f6b13f', '#ef7c35'];
  const LEG_W = ['#3d5fa3', '#3a8fb7', '#3fb59a', '#7dc552', '#d8d23a', '#ee9a2c', '#e04830', '#b8306e', '#7b2fbf'];
  const LEG_FR = ['#78a0d7', '#2d69cd', '#1ea096', '#50be50', '#c8d232', '#f0aa28', '#e66428', '#d22828', '#be288c'];
  const ramp = (P) => { const t = new Uint8Array(2001 * 3); for (let i = 0; i <= 2000; i++) { const v = P[0][0] + (P[P.length - 1][0] - P[0][0]) * i / 2000; let c = P[P.length - 1][1]; for (let k = 0; k < P.length - 1; k++) { if (v >= P[k][0] && v <= P[k + 1][0]) { const f = (v - P[k][0]) / (P[k + 1][0] - P[k][0]); c = P[k][1].map((q, z) => Math.round(q + (P[k + 1][1][z] - q) * f)); break; } } t.set(c, i * 3); } return { t, a: P[0][0], b: P[P.length - 1][0] }; };
  const RT = ramp(PAL_T), RW = ramp(PAL_W);
  const TSTEP = 5, TLO = -50, THI = 55;
  const place = (e, pct, tx) => { e.style.right = ''; if (pct <= 3) { e.style.left = '0'; e.style.transform = 'none'; } else if (pct >= 97) { e.style.left = 'auto'; e.style.right = '0'; e.style.transform = 'none'; } else { e.style.left = `${pct}%`; e.style.transform = tx || 'translateX(-50%)'; } };
  const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
  const tcol = (v) => { const q = Math.max(0, Math.min(2000, Math.round((v - RT.a) * 2000 / (RT.b - RT.a)))) * 3; return `rgb(${RT.t[q]},${RT.t[q + 1]},${RT.t[q + 2]})`; };

  // ---------- texts ----------
  const I18N = {
    de: { radar: 'Wetterradar', sat: 'Satellit', blitz: 'Blitze', wind: 'Wind', rain: 'Regen', temp: 'Temperatur', blue: 'Blau', vis: 'Sichtbar', ir: 'Infra', more: 'Weitere Optionen', fc: 'Vorhersage', ort: 'Mein Ort', bz: 'Blitze', ov: 'Overlay mit Radar', iso: 'Isobaren', ws: 'Windstriche', now: 'aktuell', jetzt: 'jetzt', plus1: '+1 Std.', minusH: (h) => `−${h} Std.`, loading: 'Wird geladen …', nodata: 'Noch keine Daten', ago: (m) => m < 60 ? `vor ${m} Min.` : `vor ${Math.floor(m / 60)} Std.${m % 60 ? ` ${m % 60} Min.` : ''}`, in: (m) => `in ${m} Min.`, strikes: (n) => n ? `${n} Blitz${n === 1 ? '' : 'e'} im Kartenausschnitt in der letzten Stunde · live` : 'Keine Blitze im Kartenausschnitt in der letzten Stunde · live', weak: 'schwach', strong: 'stark', newest: 'neu', min60: '60 Min.', warm: 'warm', cold: 'kalt', play: 'Abspielen', pause: 'Anhalten', noentity: 'WeatherScope: Bitte zuerst die Integration einrichten und hier den Sensor angeben.', e_entity: 'Kartendaten (Sensor der WeatherScope-Integration)', e_fit: 'Darstellung', e_cover: 'Kachel füllen', e_contain: 'Ganze Karte zeigen', e_zoom: 'Zoom', e_fit_h: '„Kachel füllen“ zeigt den eingestellten Ausschnitt und füllt die Kachel bis zum Rand.', e_zoom_h: 'Größer als 1 vergrößert die Karte, kleiner als 1 verkleinert sie.', e_frame: 'Rahmen', e_frame_none: 'Ohne', e_frame_glass: 'Glas', e_frame_h: '„Glas“ passt zu den anderen WeatherScope-Kacheln mit Glas-Hintergrund.', e_link: 'Mit anderen Kacheln koppeln', e_link_h: 'Temperatur, Regen und Wind schalten zusammen mit Stündlich und Tagesvorhersage um.', e_header: 'Kopfzeile anzeigen', e_header_h: 'Zeigt oben den Namen der gewählten Karte, wie bei den anderen Kacheln.' },
    en: { radar: 'Weather radar', sat: 'Satellite', blitz: 'Lightning', wind: 'Wind', rain: 'Rain', temp: 'Temperature', blue: 'Blue', vis: 'Visible', ir: 'Infrared', more: 'More options', fc: 'Nowcast', ort: 'My location', bz: 'Lightning', ov: 'Radar overlay', iso: 'Isobars', ws: 'Wind lines', now: 'now', jetzt: 'now', plus1: '+1 h', minusH: (h) => `−${h} h`, loading: 'Loading …', nodata: 'No data yet', ago: (m) => m < 60 ? `${m} min ago` : `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ''} ago`, in: (m) => `in ${m} min`, strikes: (n) => n ? `${n} strike${n === 1 ? '' : 's'} in the map area in the last hour · live` : 'No lightning in the map area in the last hour · live', weak: 'light', strong: 'heavy', newest: 'new', min60: '60 min', warm: 'warm', cold: 'cold', play: 'Play', pause: 'Pause', noentity: 'WeatherScope: please set up the integration first and select its sensor here.', e_entity: 'Map data (sensor of the WeatherScope integration)', e_fit: 'Display', e_cover: 'Fill the card', e_contain: 'Show the whole map', e_zoom: 'Zoom', e_fit_h: '“Fill the card” shows the chosen area and fills the card to its edges.', e_zoom_h: 'Above 1 enlarges the map, below 1 shrinks it.', e_frame: 'Frame', e_frame_none: 'None', e_frame_glass: 'Glass', e_frame_h: '“Glass” matches the other WeatherScope cards with glass background.', e_link: 'Link with other cards', e_link_h: 'Temperature, rain and wind switch together with the hourly and daily cards.', e_header: 'Show header', e_header_h: 'Shows the name of the chosen map at the top, like the other cards.' },
  };
  const lang0 = () => { try { const h = document.querySelector('home-assistant'); return ((h && h.hass && (h.hass.locale && h.hass.locale.language || h.hass.language)) || navigator.language || 'en').slice(0, 2); } catch (e) { return 'en'; } };

  // ---------- helpers ----------
  const RE = 6378137;
  const proj = (b) => {
    const [X0, Y0, X1, Y1] = b;
    const nx = (lo) => ((RE * lo * Math.PI / 180) - X0) / (X1 - X0);
    const ny = (la) => 1 - ((RE * Math.log(Math.tan(Math.PI / 4 + la * Math.PI / 360))) - Y0) / (Y1 - Y0);
    const ilon = (fx) => (X0 + fx * (X1 - X0)) / RE * 180 / Math.PI;
    const ilat = (fy) => (2 * Math.atan(Math.exp((Y0 + (1 - fy) * (Y1 - Y0)) / RE)) - Math.PI / 2) * 180 / Math.PI;
    return { X0, Y0, X1, Y1, nx, ny, ilon, ilat, lo0: ilon(0), lo1: ilon(1), la0: ilat(1), la1: ilat(0), key: b.join('_') };
  };
  const pad = (n) => String(n).padStart(2, '0');
  const hm = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const MAPS = [{ id: 'radar', icon: 'mdi:weather-pouring', bg: '#2f9e5a' }, { id: 'sat', icon: 'mdi:satellite-variant', bg: '#4a6fa5' }, { id: 'blitz', icon: 'mdi:flash', bg: '#a8489e' }, { id: 'wind', icon: 'mdi:weather-windy', bg: '#3a8fb7', sep: 1 }, { id: 'rain', icon: 'mdi:water', bg: '#2c6fb0' }, { id: 'temp', icon: 'mdi:thermometer', bg: '#e07a30' }];
  const SATM = [['blau', 'blue'], ['sicht', 'vis'], ['infra', 'ir']];
  const OPT0 = { map: 'radar', fc: true, ort: true, bz: true, ov: false, sm: 'blau', iso: false, ws: false };
  const FMAPS = ['wind', 'rain', 'temp'];

  const CSS = `:host{display:block;position:relative;width:100%;height:100%;min-height:260px;font-family:var(--paper-font-body1_-_font-family,sans-serif);-webkit-tap-highlight-color:transparent;user-select:none}
#m{position:absolute;inset:0;border-radius:18px;overflow:hidden;background:#858585}
#fr{position:absolute;inset:0;border-radius:18px;display:none}
:host([frame]) #fr{display:block;background:rgba(32,62,112,.38);-webkit-backdrop-filter:blur(16px) saturate(170%);backdrop-filter:blur(16px) saturate(170%);box-shadow:inset 0 0 0 1px rgba(255,255,255,.12),inset 0 1px 0 rgba(255,255,255,.18)}
:host([frame]) #m{inset:8px;border-radius:12px}
:host([header]) #m{top:32px}
:host([header]:not([frame])) #fr{display:block;background:rgba(30,32,36,.84)}
#hd{position:absolute;left:12px;top:9px;display:none;align-items:center;gap:4px;font-size:11px;font-weight:500;letter-spacing:.01em;text-transform:uppercase;color:rgba(255,255,255,.7)}
#hd ha-icon{--mdc-icon-size:13px}
:host([header]) #hd{display:flex}
canvas{position:absolute;inset:0;width:100%;height:100%}
#mb{position:absolute;right:8px;top:8px;display:flex;flex-direction:column;align-items:flex-end;gap:7px}
.mb{display:flex;align-items:center;gap:6px;background:none;border:none;padding:0;cursor:pointer;color:#fff}
.mb[hidden]{display:none}
.mb span{background:rgba(30,32,36,.82);border-radius:9px;padding:2px 8px;font-size:12px;white-space:nowrap;display:none;transition:opacity .8s ease}
.mb i{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:1.5px solid rgba(255,255,255,.55);opacity:.85}
.mb i ha-icon{--mdc-icon-size:15px;color:#fff}
.mb.on i{width:30px;height:30px;border:2px solid #fff;opacity:1}
.mb.on span,:host([big]) .mb span{display:block}
:host(:not([big])) #mb.fade .mb.on span{opacity:0}
:host([big]) .mb:not(.on) span{background:rgba(30,32,36,.6)}
#lg{position:absolute;right:8px;background:rgba(30,32,36,.78);border-radius:7px;padding:3px 7px;color:#fff;font-size:12px}
#lg .b{display:flex;width:110px;height:6px;border-radius:3px;overflow:hidden}#lg .b i{flex:1}
#lg .t{display:flex;justify-content:space-between;margin-top:2px;opacity:.85}
#lg.tr .b{width:168px;height:8px;align-items:center;border-radius:0;overflow:visible;gap:1px}#lg.tr .b i{height:8px}#lg.tr .b i.o{height:4px;opacity:.35}#lg.tr .b i.z{margin-left:2px}
#lg.tr.rd .b{width:220px}
#lgu{display:none}#lg.tr{display:flex;align-items:center;gap:7px;padding-right:14px}#lg.tr #lgu{display:block;font-weight:500;padding-bottom:12px}
#lg.tr .t{position:relative;height:12px}#lg.tr .t span{position:absolute;transform:translateX(-50%);white-space:nowrap}
#ct{position:absolute;left:8px;right:8px;bottom:8px;background:rgba(30,32,36,.84);border-radius:10px;padding:6px 8px 4px;color:#fff;font-size:12px}
#r1{display:flex;align-items:center;gap:8px}
#pl{flex:none;width:28px;height:28px;border-radius:50%;border:none;background:rgba(255,255,255,.15);color:#fff;display:flex;align-items:center;justify-content:center;padding:0;cursor:pointer}
#pl ha-icon{--mdc-icon-size:18px}
#tl{flex:1;position:relative;height:44px;cursor:pointer;touch-action:none;margin-right:16px}
#tk{position:absolute;left:0;right:0;top:22px;height:5px;border-radius:3px;background:rgba(255,255,255,.18);overflow:hidden}
#fc{position:absolute;top:0;bottom:0;right:0;background:rgba(224,64,46,.55)}
#pg{position:absolute;left:0;top:0;bottom:0;width:100%;transform-origin:0 50%;transform:scaleX(0);background:#e8a317}
#nm{position:absolute;top:18px;width:2px;height:13px;margin-left:-1px;background:#fff;border-radius:1px;pointer-events:none}
#tb{position:absolute;top:0;background:#e8a317;color:#3a2600;border-radius:6px;padding:0 7px;font-size:10px;font-weight:600;line-height:16px;white-space:nowrap;pointer-events:none}
#tb.f{background:#e0402e;color:#fff}
#nc{position:absolute;top:30px;transform:translateX(-50%);background:#fff;color:#2a2c30;border-radius:6px;padding:0 6px;font-size:10px;font-weight:600;line-height:13px;white-space:nowrap;cursor:pointer}
#l0{position:absolute;left:0;top:31px;opacity:.8}
#l1{position:absolute;right:0;top:31px;opacity:.8}
#bi{flex:1;font-size:12px;padding:6px 2px}
#r2{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:2px;min-height:18px}
#sm{display:flex;gap:2px;background:rgba(255,255,255,.1);border-radius:7px;padding:1px}
#sm button{background:none;border:none;color:#fff;font-size:12px;padding:2px 7px;border-radius:6px;cursor:pointer;opacity:.85}
#sm button.on{background:rgba(232,163,23,.9);color:#3a2600;opacity:1;font-weight:600}
#mo{background:none;border:none;color:#fff;font-size:12px;opacity:.8;cursor:pointer;padding:2px 4px;margin-left:auto;display:flex;align-items:center;gap:2px}
#mo ha-icon{--mdc-icon-size:14px}
#op{display:none;flex-wrap:wrap;gap:12px;justify-content:center;padding:6px 0 3px}
#op.open{display:flex}
.sw{display:flex;align-items:center;gap:5px;background:none;border:none;color:#fff;font-size:12px;padding:0;cursor:pointer}
.sw i{width:26px;height:15px;border-radius:8px;background:rgba(255,255,255,.25);position:relative;transition:background .2s}
.sw i::after{content:'';position:absolute;left:2px;top:2px;width:11px;height:11px;border-radius:50%;background:#fff;transition:left .2s}
.sw.on i{background:#e0402e}.sw.on i::after{left:13px}
#s_ort.on i{background:#2b7de0}#s_bz.on i{background:#a8489e}#s_ov.on i{background:#2f9e5a}#s_iso.on i{background:#8a8a8a}#s_ws.on i{background:#3a8fb7}
.sep{display:none}
#dl{position:absolute;left:0;right:0;top:30px;height:12px;pointer-events:none}#dl span{position:absolute;transform:translateX(-50%);opacity:.8;white-space:nowrap}#dl span.j{transform:none}
#ct #lg{position:static;background:none;border-radius:0;padding:0 12px 6px 2px;display:flex;align-items:flex-start;gap:7px}
#ct #lg .w{flex:1;min-width:0}
#op{position:absolute;right:48px;z-index:6;flex-direction:column;flex-wrap:nowrap;align-items:flex-start;justify-content:flex-start;gap:4px;padding:8px 12px;background:rgba(30,32,36,.92);border-radius:12px}
#op .sw{font-size:13px;padding:6px 0;gap:8px}
#ct{padding:4px 6px 4px}#ct #lg{padding:0 12px 2px 2px}
#pl{width:30px;height:30px;position:relative}#pl ha-icon{--mdc-icon-size:18px}
#mo{flex:none;width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.15);opacity:1;padding:0;margin-left:0;justify-content:center;position:relative}#mo ha-icon{--mdc-icon-size:18px}
/* all round buttons look 30 px; the area that reacts to a finger is about 40 px */
#pl::after,#mo::after{content:'';position:absolute;inset:-5px;border-radius:50%}
.mb i{width:30px;height:30px;box-sizing:border-box;position:relative}.mb i::after{content:'';position:absolute;inset:-5px;border-radius:50%}
#tl{margin-right:4px}#r2{margin-top:4px}#ct #lg .b,#ct #lg.tr .b,#ct #lg.tr.rd .b{width:100%}
#tl.fm{height:38px}#tl.fm #tk{top:18px;height:18px;border-radius:5px;background:rgba(255,255,255,.1)}#tl.fm #pg{background:rgba(255,255,255,.16)}#tl.fm #fc{display:none}
#tl.fm #nm{top:15px;height:24px}#tl.fm #dl{top:18px;height:18px}
#tl.fm #dl span{transform:none;top:0;height:18px;line-height:18px;text-align:center;opacity:1;color:rgba(255,255,255,.85);border-left:1px solid rgba(0,0,0,.35);box-sizing:border-box;overflow:hidden;font-size:11px}
#tl.fm #dl span:first-child{border-left:none}#tl.fm #dl span.we{color:#f0c94a}
#ld{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;background:rgba(0,0,0,.25);pointer-events:none;text-align:center;padding:0 20px}`;

  class WeatherScopeCard extends HTMLElement {
    static getConfigElement() { return document.createElement('weatherscope-card-editor'); }

    static getStubConfig(hass) {
      const e = Object.keys((hass && hass.states) || {}).find((k) => k.startsWith('sensor.') && hass.states[k].attributes && hass.states[k].attributes.bbox && hass.states[k].attributes.grid);
      return { entity: e || 'sensor.weatherscope_map_data' };
    }

    setConfig(c) {
      this._c = Object.assign({ fspeed: 650, fhold: 1500, fit: 'cover', cx: 0.5, cy: 0.5, zoom: 1, speed: 450, hold: 1000, bzfilm: 15, bzlive: 60 }, c || {});
      if (this._c.fit === 'contain') this.setAttribute('big', ''); else this.removeAttribute('big');
      this.toggleAttribute('frame', this._c.frame === 'glass');
      this.toggleAttribute('header', !!this._c.header);
      if (this.shadowRoot) return;
      this._lang = I18N[lang0()] ? lang0() : 'en';
      const T = (this._T = I18N[this._lang]);
      this._o = Object.assign({}, OPT0, LS.get('weatherscopeOpt', {}));
      this.attachShadow({ mode: 'open' });
      const sw = (id, t) => `<button class="sw" id="${id}"><i></i><span>${t}</span></button>`;
      this.shadowRoot.innerHTML = `<style>${CSS}</style><div id="fr"></div><div id="hd"><ha-icon></ha-icon><span></span></div><div id="m"><canvas id="cv"></canvas>
<div id="mb">${MAPS.map((m) => `${m.sep ? '<i class="sep"></i>' : ''}<button class="mb" data-m="${m.id}"><span>${T[m.id]}</span><i style="background:${m.bg}"><ha-icon icon="${m.icon}"></ha-icon></i></button>`).join('')}<button class="mb mg" id="gear" aria-label="${T.more}" title="${T.more}"><i style="background:#4a505a"><ha-icon icon="mdi:cog"></ha-icon></i></button></div>
<div id="ct"><div id="lg"><span id="lgu"></span><div class="w"><div class="b"></div><div class="t"><span id="lga"></span><span id="lgb"></span></div></div></div><div id="r1"><button id="pl" aria-label="${T.play}"><ha-icon icon="mdi:play"></ha-icon></button>
<div id="tl"><div id="tk"><div id="fc"></div><div id="pg"></div></div><div id="nm"></div><div id="tb">–</div><div id="nc">${T.now}</div><span id="l0"></span><span id="l1">${T.plus1}</span><div id="dl"></div></div><div id="bi"></div></div>
<div id="r2"><div id="sm">${SATM.map(([k, t]) => `<button data-s="${k}">${T[t]}</button>`).join('')}</div></div>
</div><div id="op">${sw('s_fc', T.fc)}${sw('s_ort', T.ort)}${sw('s_bz', T.bz)}${sw('s_ov', T.ov)}${sw('s_iso', T.iso)}${sw('s_ws', T.ws)}</div>
<div id="ld">${T.loading}</div></div>`;
      const s = this.shadowRoot, $ = (id) => s.getElementById(id);
      s.addEventListener('click', (e) => e.stopPropagation());
      s.querySelectorAll('.mb[data-m]').forEach((b) => b.addEventListener('click', () => {
        this._setMap(b.dataset.m);
        // coupling: temperature, rain and wind also switch the hourly and daily cards on the page
        if (this._c.link !== false && FMAPS.includes(b.dataset.m)) window.dispatchEvent(new CustomEvent('weatherscope-mode', { detail: { entity: '*', mode: b.dataset.m, src: this } }));
      }));
      s.querySelectorAll('#sm button').forEach((b) => b.addEventListener('click', () => { this._o.sm = b.dataset.s; this._save(); this._loadSat(); }));
      // settings: the gear at the bottom of the button column opens a small panel over the map; a tap elsewhere closes it
      $('gear').addEventListener('click', () => {
        const op = $('op'), o = op.classList.toggle('open'); $('gear').classList.toggle('on', o);
        if (o) { const g = $('gear'), top = $('mb').offsetTop + g.offsetTop; op.style.top = `${Math.max(8, Math.min(top, $('m').clientHeight - op.offsetHeight - 8))}px`; }
      });
      s.addEventListener('click', (e) => { const p = e.composedPath(); if ($('op').classList.contains('open') && !p.includes($('op')) && !p.includes($('gear'))) { $('op').classList.remove('open'); $('gear').classList.remove('on'); } });
      const tog = (id, k, fn) => $(id).addEventListener('click', () => { this._o[k] = !this._o[k]; this._save(); if (fn) fn(); this._ui(); this._draw(); });
      tog('s_fc', 'fc', () => { this._apply(false); this._loop(); });
      tog('s_ort', 'ort'); tog('s_bz', 'bz'); tog('s_ov', 'ov'); tog('s_iso', 'iso', () => this._draw()); tog('s_ws', 'ws', () => this._anim());
      $('pl').addEventListener('click', () => { this._play = !this._play; this._icon(); this._loop(); });
      $('nc').addEventListener('pointerdown', (e) => { e.stopPropagation(); if (this._fr.length) { this._i = this._now; this._pi = null; this._play = false; this._icon(); this._draw(); } });
      const tl = $('tl');
      const seek = (e) => { const r = $('tk').getBoundingClientRect(); const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)); if (!this._fr.length) return; const tt = this._t0 + f * (this._t1 - this._t0); let bi = 0; this._fr.forEach((q, k) => { if (Math.abs(q.t - tt) < Math.abs(this._fr[bi].t - tt)) bi = k; }); this._i = bi; this._pi = null; this._play = false; this._icon(); this._draw(); };
      tl.addEventListener('pointerdown', (e) => { this._drag = true; tl.setPointerCapture(e.pointerId); seek(e); });
      tl.addEventListener('pointermove', (e) => { if (this._drag) seek(e); });
      tl.addEventListener('pointerup', () => { this._drag = false; });
      this._play = false; this._i = 0; this._fr = []; this._R = []; this._S = []; this._st = []; this._skew = 0; this._seen = new Map(); this._bc = {}; this._avail = {};
      this._ro = new ResizeObserver(() => { sqFit(this, this._c, this._grid()); this._layout(); this._draw(); }); this._ro.observe(this);
      try { this._io = new IntersectionObserver((e) => { this._vis = e[0] && e[0].isIntersecting; if (this._vis) this._draw(); }); this._io.observe(this); } catch (e) {}
      this._ui();
    }

    _save() { LS.set('weatherscopeOpt', Object.assign({}, this._o)); }

    _setMap(m) {
      if (this._o.map === m) return;
      this._o.map = m; this._save(); cancelAnimationFrame(this._raf); clearTimeout(this._t); this._t = null; this._play = false; this._icon();
      if (m === 'sat') this._loadSat();
      if (FMAPS.includes(m)) this._loadF();
      this._apply(true); this._ui(); this._loop(); this._draw(); this._live(); this._anim(); this._pill();
    }

    // Show the name of the selected map for 3 seconds
    _pill() {
      const mb = this.shadowRoot && this.shadowRoot.getElementById('mb'); if (!mb) return;
      mb.classList.remove('fade'); clearTimeout(this._pft); this._pft = setTimeout(() => mb.classList.add('fade'), 3000);
    }

    set hass(h) {
      this._h = h;
      const st = h.states[this._c.entity], a = st && st.attributes;
      const $ = (id) => this.shadowRoot.getElementById(id);
      if (!a || !a.bbox || !a.grid) { $('ld').style.display = 'flex'; $('ld').textContent = this._T.noentity; return; }
      this._A = a;
      // map box changed (or first time): reset geometry and caches
      const key = a.bbox.join('_');
      if (key !== (this._J && this._J.key)) {
        this._J = proj(a.bbox); this._GR = a.grid; this._bc = {}; this._bi = {}; this._PM = null; this._cl = null; this._lp = null; this._G = null; this._gk = null; this._FF = {};
        this._seen.clear();
      }
      const home = h.states['zone.home'];
      this._home = home && home.attributes ? [home.attributes.latitude, home.attributes.longitude] : [h.config.latitude, h.config.longitude];
      // which maps can be shown
      const blitzOn = !!this._hasBlitz(h);
      const av = { radar: !!a.radar, sat: !!a.satellite, blitz: blitzOn, wind: true, rain: true, temp: true };
      if (JSON.stringify(av) !== JSON.stringify(this._avail)) {
        this._avail = av;
        this.shadowRoot.querySelectorAll('.mb[data-m]').forEach((b) => { b.hidden = !av[b.dataset.m]; });
        if (!av[this._o.map]) { this._o.map = av.radar ? 'radar' : av.sat ? 'sat' : 'temp'; this._apply(true); this._ui(); }
      }
      const rb = a.radar && a.radar.basis; if (rb && rb !== this._b) { this._b = rb; this._loadRadar(); }
      const sb = a.satellite && a.satellite.basis; if (sb && sb !== this._sb) { this._sb = sb; if (this._o.map === 'sat') this._loadSat(); }
      const vb = a.forecast && a.forecast.basis ? `${a.forecast.basis}#${a.forecast.updated || ''}` : null;
      if (vb && vb !== this._vb) { this._vb = vb; if (FMAPS.includes(this._o.map)) this._loadF(); }
      const now = Date.now();
      if (blitzOn && (!this._stT || now - this._stT > 2000)) { this._stT = now; this._strikes(h); }
      if (!this._drawn) { this._drawn = true; this._apply(true); this._ui(); }
    }

    _hasBlitz(h) {
      if (this._bzk && Date.now() - this._bzk.t < 60000) return this._bzk.v;
      // geo_location entities of the Blitzortung integration, or its sensors (their attribution names blitzortung.org)
      const v = Object.keys(h.states).some((k) => { const a = h.states[k].attributes || {}; return (k.startsWith('geo_location.') && a.source === 'blitzortung') || (k.startsWith('sensor.') && /blitzortung/i.test(a.attribution || '')); });
      this._bzk = { t: Date.now(), v };
      return v;
    }

    connectedCallback() {
      // coupling: switching temperature/rain/wind on the hourly or daily card shows the matching map
      if (!this._onMode) this._onMode = (e) => { const m = e.detail && e.detail.mode, b = this.shadowRoot && this.shadowRoot.querySelector(`.mb[data-m="${m}"]`); if (this._c && this._c.link !== false && e.detail.src !== this && FMAPS.includes(m) && b && !b.hidden) this._setMap(m); };
      window.addEventListener('weatherscope-mode', this._onMode);
      this._loop(); this._draw(); this._live(); this._anim(); this._pill(); clearInterval(this._fiv); this._fiv = setInterval(() => { if (FMAPS.includes(this._o.map) && this._G && this._fnear() !== this._fs) this._loadF(); }, 300000); }
    disconnectedCallback() { window.removeEventListener('weatherscope-mode', this._onMode); clearInterval(this._fiv); clearTimeout(this._t); this._t = null; cancelAnimationFrame(this._raf); clearTimeout(this._lt); cancelAnimationFrame(this._praf); this._pl = false; }

    _icon() { const p = this.shadowRoot.getElementById('pl'); p.innerHTML = `<ha-icon icon="mdi:${this._play ? 'pause' : 'play'}"></ha-icon>`; p.setAttribute('aria-label', this._play ? this._T.pause : this._T.play); }

    // ---------- base maps (drawn once, kept in the browser) ----------
    _geo() {
      if (!window.__wsGeo) {
        const get = async (n) => { try { const r = await fetch(BASE + n, { cache: 'force-cache' }); return r.ok ? await r.json() : null; } catch (e) { return null; } };
        window.__wsGeo = Promise.all([get('countries.geojson'), get('lakes.geojson'), get('rivers.geojson'), get('cities.json')]);
        window.__wsGeo.then((g) => { if (!g[0]) window.__wsGeo = null; else window.__wsGeoData = g; });
      }
      return window.__wsGeo;
    }

    // Cities inside the map box, largest first, names in the dashboard language
    _cityList() {
      if (this._cl) return this._cl;
      const g = window.__wsGeoData;
      if (!g || !g[3] || !this._J) { if (!this._clw) { this._clw = 1; this._geo().then(() => { this._clw = 0; this._draw(); }); } return null; }
      const cj = g[3], J = this._J, li = cj.langs.indexOf(this._lang), out = [];
      for (const r of cj.c) {
        const [lo, la, popk] = r;
        if (popk < 30) break; // list is sorted by population; skip villages
        if (lo < J.lo0 || lo > J.lo1 || la < J.la0 || la > J.la1) continue;
        out.push([(li >= 0 && r[5 + li]) || r[4], lo, la]);
        if (out.length >= 400) break;
      }
      return (this._cl = out);
    }

    // City names (and temperatures) in a fixed, readable size: as many as fit without overlapping
    _labels(x, g, D, Hv, si) {
      const cl = this._cityList(); if (!cl) return;
      const J = this._J, temps = si != null && this._G;
      const ff = 'Roboto, "Segoe UI", sans-serif', fN = `500 ${11 * D}px ${ff}`, fB = `600 ${12 * D}px ${ff}`, fT = `700 ${12 * D}px ${ff}`;
      const key = `${g.W}x${g.H}x${Math.round(g.ox)}x${Math.round(g.oy)}x${Math.round(g.dw)}x${Math.round(Hv)}x${temps ? 1 : 0}`;
      let P = this._lp && this._lp.k === key ? this._lp.v : null;
      if (!P) {
        P = []; const boxes = [], xr = g.W - 46 * D, yb = Hv - 6 * D;
        for (let i = 0; i < cl.length && P.length < 60; i++) {
          const [n, lo, la] = cl[i], px = g.ox + J.nx(lo) * g.dw, py = g.oy + J.ny(la) * g.dh;
          if (px < 4 * D || py < 16 * D || px > xr + 30 * D || py > yb) continue;
          const big = P.length < 6; x.font = big ? fB : fN;
          const tw = Math.max(x.measureText(n).width, temps ? 24 * D : 0), top = py - 14 * D, bot = py + (temps ? 17 : 5) * D;
          const free = (bx) => bx[0] >= 2 * D && bx[2] <= xr && !boxes.some((b) => !(bx[2] < b[0] || bx[0] > b[2] || bx[3] < b[1] || bx[1] > b[3]));
          // text right of the dot, or left of it if there is no room
          const R = [px - 4 * D, top, px + 8 * D + tw, bot], L = [px - 8 * D - tw, top, px + 4 * D, bot];
          const side = free(R) ? 1 : free(L) ? -1 : 0;
          if (!side) continue;
          boxes.push(side > 0 ? R : L); P.push([n, lo, la, px, py, big, side]);
        }
        this._lp = { k: key, v: P };
      }
      const GR = this._GR, T = temps ? this._G.T[si] : null;
      // soft shadow behind white text, like Windy
      x.save(); x.textBaseline = 'alphabetic'; x.fillStyle = '#fff'; x.shadowColor = 'rgba(0,0,0,.7)'; x.shadowBlur = 3 * D;
      for (const [n, lo, la, px, py, big, side] of P) {
        x.beginPath(); x.arc(px, py, 2.2 * D, 0, 7); x.fill();
        x.textAlign = side > 0 ? 'left' : 'right'; const tx = px + side * 5 * D;
        x.font = big ? fB : fN; x.fillText(n, tx, py - 3 * D);
        if (T) {
          const v = this._samp(T, (la - GR.la0) / GR.dla, (lo - GR.lo0) / GR.dlo);
          if (!isNaN(v)) { const t = `${Math.round(v)}°`; x.font = fT; x.fillText(t, tx, py + 11 * D); }
        }
      }
      x.restore();
    }

    _baseImg(kind) {
      const J = this._J; if (!J) return Promise.resolve(null);
      const B = window.__wsB || (window.__wsB = {}), id = `${kind}_${J.key}_${this._lang}`;
      if (B[id]) return B[id];
      B[id] = (async () => {
        const KEY = `wsB_${id}_v2`;
        let url = null;
        try { url = localStorage.getItem(KEY); } catch (e) {}
        if (!url) {
          const cv = await this._drawBase(kind);
          if (!cv) return null;
          url = cv.toDataURL('image/webp', 0.9);
          try { Object.keys(localStorage).filter((k) => k.startsWith(`wsB_${kind}_`)).forEach((k) => localStorage.removeItem(k)); localStorage.setItem(KEY, url); } catch (e) {}
        }
        return await new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = url; });
      })();
      B[id].then((v) => { if (!v) B[id] = null; });
      return B[id];
    }

    _attrib() {
      const a = (this._A && this._A.attribution) || ['Natural Earth'];
      return `© ${a.concat(this._avail.blitz ? ['Blitzortung.org'] : []).join(' · ')}`;
    }

    async _drawBase(kind) {
      const g = await this._geo(); if (!g || !g[0]) return null;
      const [co, la, ri, cj] = g, J = this._J;
      const [iw, ih] = (this._A && this._A.size) || [800, 922];
      const W = iw * 2, H = ih * 2, k = W / 800;
      const px = (lo, la2) => [J.nx(lo) * W, J.ny(la2) * H];
      const m = 4, L0 = J.lo0 - m, L1 = J.lo1 + m, B0 = J.la0 - m, B1 = J.la1 + m;
      const inBox = (gm) => { let ok = false; const walk = (a) => { if (ok) return; if (typeof a[0] === 'number') { if (a[0] > L0 && a[0] < L1 && a[1] > B0 && a[1] < B1) ok = true; } else a.forEach(walk); }; walk(gm.coordinates); return ok; };
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const x = cv.getContext('2d');
      x.lineJoin = 'round'; x.lineCap = 'round';
      const ring = (r) => { r.forEach((p, i) => { const q = px(p[0], p[1]); i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1]); }); x.closePath(); };
      const polys = (gm) => gm.type === 'Polygon' ? [gm.coordinates] : gm.type === 'MultiPolygon' ? gm.coordinates : [];
      const lines = (gm) => gm.type === 'LineString' ? [gm.coordinates] : gm.type === 'MultiLineString' ? gm.coordinates : [];
      const feats = (fc) => ((fc && fc.features) || []).filter((f) => f.geometry && inBox(f.geometry));
      const C = feats(co), L = feats(la), RV = feats(ri);
      // the home country gets a slightly stronger border
      const [hla, hlo] = this._home || [0, 0];
      const inRing = (r) => { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > hla) !== (yj > hla) && hlo < (xj - xi) * (hla - yi) / (yj - yi) + xi) c = !c; } return c; };
      const homeC = C.find((f) => polys(f.geometry).some((p) => inRing(p[0])));
      const rivers = (col, wf) => RV.forEach((f) => { const sr = f.properties.scalerank == null ? 10 : f.properties.scalerank; if (sr > 7) return; x.beginPath(); lines(f.geometry).forEach((l) => l.forEach((p, i) => { const q = px(p[0], p[1]); i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1]); })); x.strokeStyle = col; x.lineWidth = Math.max(0.5, 1.6 - sr * 0.15) * k * wf; x.stroke(); });
      const borders = (col, w1, w2) => C.forEach((f) => { x.beginPath(); polys(f.geometry).forEach((p) => ring(p[0])); x.strokeStyle = col; x.lineWidth = (f === homeC ? w1 : w2) * k; x.stroke(); });
      const fnt = (s, b) => `${b ? '600 ' : ''}${s * k}px Roboto, "Segoe UI", sans-serif`;
      if (kind === 'grey') {
        x.fillStyle = '#858585'; x.fillRect(0, 0, W, H);
        C.forEach((f) => { x.beginPath(); polys(f.geometry).forEach((p) => p.forEach(ring)); x.fillStyle = '#868686'; x.fill('evenodd'); });
        L.forEach((f) => { x.beginPath(); polys(f.geometry).forEach((p) => p.forEach(ring)); x.fillStyle = '#7e7e7e'; x.fill('evenodd'); x.strokeStyle = '#6a6a6a'; x.lineWidth = 0.7 * k; x.stroke(); });
        rivers('#7f7f7f', 1); borders('#484848', 1.3, 1.0);
        x.font = fnt(10); x.fillStyle = '#505050'; x.textAlign = 'right'; x.fillText(this._attrib(), W - 8 * k, H - 8 * k);
      } else if (kind === 'land') {
        x.fillStyle = '#28497e'; x.fillRect(0, 0, W, H);
        C.forEach((f) => { x.beginPath(); polys(f.geometry).forEach((p) => p.forEach(ring)); x.fillStyle = '#4a6a2c'; x.fill('evenodd'); });
        L.forEach((f) => { x.beginPath(); polys(f.geometry).forEach((p) => p.forEach(ring)); x.fillStyle = '#28497e'; x.fill('evenodd'); });
        rivers('#3a5f8a', 0.8);
      } else {
        borders('rgba(15,15,15,.85)', 1.3, 1.0);
        x.font = fnt(10); x.fillStyle = 'rgba(255,255,255,.7)'; x.textAlign = 'right'; x.fillText(this._attrib(), W - 8 * k, H - 8 * k);
      }
      return cv;
    }

    // ---------- loading images ----------
    _q(key, make) {
      const C = window.__wsRF || (window.__wsRF = new Map());
      if (C.has(key)) return C.get(key);
      const pr = (window.__wsRQ = (window.__wsRQ || Promise.resolve()).then(make));
      C.set(key, pr); pr.then((v) => { if (!v) C.delete(key); });
      return pr;
    }

    async _img(url) {
      await new Promise((ok) => setTimeout(ok, 25));
      const r = await fetch(url, { cache: 'no-store' });
      if (!r.ok) return null;
      return createImageBitmap(await r.blob());
    }

    async _px(url, fn) {
      try {
        const bm = await this._img(url); if (!bm) return null;
        if (!fn) return bm;
        const w = bm.width, hh = bm.height, cv = document.createElement('canvas'); cv.width = w; cv.height = hh;
        const x = cv.getContext('2d', { willReadFrequently: true });
        x.drawImage(bm, 0, 0); if (bm.close) bm.close();
        const d = x.getImageData(0, 0, w, hh); fn(d.data, new Uint32Array(d.data.buffer)); x.putImageData(d, 0, 0);
        try { const ib = await createImageBitmap(cv); cv.width = cv.height = 0; return ib; } catch (e) { return cv; }
      } catch (e) { return null; }
    }

    // DWD radar colours -> calmer, Windy-like colours
    _radarFn(p, u) {
      const LUT = window.__wsLUT || (window.__wsLUT = new Int8Array(32768).fill(-1));
      for (let i = 0, j = 0; j < u.length; j++, i += 4) {
        const a = p[i + 3];
        if (a < 30) { u[j] = 0; continue; }
        const R = p[i], G = p[i + 1], B = p[i + 2];
        if (R > 120 && G < 90 && B >= R - 10) { u[j] = 0; continue; }
        if (Math.abs(R - G) < 12 && Math.abs(G - B) < 12) { p[i] = 255; p[i + 1] = 255; p[i + 2] = 255; p[i + 3] = 20; continue; }
        const k = (R >> 3) << 10 | (G >> 3) << 5 | (B >> 3);
        let n = LUT[k];
        if (n < 0) { let bd = 1e9; n = 0; for (let q = 0; q < DWD.length; q++) { const c = DWD[q], dd = (c[0] - R) ** 2 + (c[1] - G) ** 2 + (c[2] - B) ** 2; if (dd < bd) { bd = dd; n = q; } } LUT[k] = n; }
        const c = WIN[n];
        p[i] = c[0]; p[i + 1] = c[1]; p[i + 2] = c[2]; p[i + 3] = Math.round(c[3] * Math.min(1, a / 230) * 255);
      }
    }

    _blauFn(p) {
      for (let i = 0; i < p.length; i += 4) {
        const v = p[i], a = Math.min(1, Math.max(0, (v - 105) / 85));
        const c = 200 + Math.round(a * 50);
        p[i] = c; p[i + 1] = c; p[i + 2] = c + 3 > 255 ? 255 : c + 3; p[i + 3] = Math.round(Math.pow(a, 0.85) * 245);
      }
    }

    _infraFn(p) {
      const T = window.__wsIRT || (window.__wsIRT = (() => { const t = new Uint8Array(256 * 3); for (let v = 0; v < 256; v++) { let c; if (v < IRC[0][0]) { const g = Math.round(v * 0.9); c = [g, g, g]; } else { c = IRC[IRC.length - 1][1]; for (let k = 0; k < IRC.length - 1; k++) { const [a0, c0] = IRC[k], [a1, c1] = IRC[k + 1]; if (v >= a0 && v < a1) { const f = (v - a0) / (a1 - a0); c = c0.map((q, z) => Math.round(q + (c1[z] - q) * f)); break; } } } t.set(c, v * 3); } return t; })());
      for (let i = 0; i < p.length; i += 4) { const v = p[i] * 3; p[i] = T[v]; p[i + 1] = T[v + 1]; p[i + 2] = T[v + 2]; p[i + 3] = 255; }
    }

    async _loadRadar() {
      const a = this._A, r = a && a.radar; if (!r || !r.basis) return;
      const b = new Date(r.basis), lid = (this._rl = (this._rl || 0) + 1), step = r.step * 6e4;
      if (isNaN(b)) return;
      const list = [], u = a.url;
      for (let i = r.past - 1; i >= 0; i--) { const t = new Date(b.getTime() - i * step); list.push({ t, f: false, u: `${u}r_${t.getTime() / 1000}.png` }); }
      for (let k = 1; k <= r.future; k++) { const t = new Date(b.getTime() + k * step); list.push({ t, f: true, u: `${u}v_${t.getTime() / 1000}.png?b=${b.getTime()}` }); }
      const out = await Promise.all(list.map(async (q) => { const cv = await this._q(q.u, () => this._px(q.u, (p, uu) => this._radarFn(p, uu))); return cv ? Object.assign({}, q, { cv }) : null; }));
      if (lid !== this._rl) return;
      this._prune();
      this._R = out.filter(Boolean);
      if (this._o.map === 'radar') this._apply(true);
      this._loop(); this._draw();
    }

    async _loadSat() {
      const a = this._A, sa = a && a.satellite;
      if (!sa || !this._sb) { this._ui(); return; }
      const b = new Date(this._sb), m = this._o.sm, lid = (this._sl = (this._sl || 0) + 1), step = sa.step * 6e4;
      if (isNaN(b)) return;
      this._ui();
      const list = [];
      for (let i = sa.past - 1; i >= 0; i--) { const t = new Date(b.getTime() - i * step); list.push({ t, f: false, u: `${a.url}${m === 'sicht' ? 's' : 'i'}_${t.getTime() / 1000}.jpg` }); }
      const fn = m === 'blau' ? (p) => this._blauFn(p) : m === 'infra' ? (p) => this._infraFn(p) : null;
      if (this._o.map === 'sat' && !this._S.length) this.shadowRoot.getElementById('ld').style.display = 'flex';
      const out = await Promise.all(list.map(async (q) => { const cv = await this._q(`${q.u}#${m}`, () => this._px(q.u, fn)); return cv ? Object.assign({}, q, { cv }) : null; }));
      if (lid !== this._sl) return;
      this._prune();
      this._S = out.filter(Boolean);
      if (this._o.map === 'sat') this._apply(true);
      this._loop(); this._draw();
    }

    _prune() {
      const C = window.__wsRF; if (!C) return;
      const keep = new Set();
      (this._R || []).forEach((q) => keep.add(q.u));
      (this._S || []).forEach((q) => keep.add(`${q.u}#${this._o.sm}`));
      const lim = Date.now() / 1000 - 6 * 3600;
      for (const k of [...C.keys()]) { const m = /\/[rvsi]_(\d{9,})\./.exec(k); if (m && +m[1] < lim && !keep.has(k)) C.delete(k); }
    }

    // ---------- timeline ----------
    _apply(reset) {
      const s = this.shadowRoot, $ = (id) => s.getElementById(id), map = this._o.map, T = this._T;
      const keep = !reset && this._fr[this._i] && (this._play || this._i !== this._now) ? this._fr[this._i].t.getTime() : null;
      const fm = FMAPS.includes(map);
      const A = map === 'radar' ? this._R : map === 'sat' ? this._S : fm ? ((this._FF || {})[map] || []) : [];
      this._fr = map === 'radar' && !this._o.fc ? A.filter((q) => !q.f) : A;
      const L = this._fr.length, nf = fm ? -1 : this._fr.findIndex((q) => q.f);
      this._now = fm ? 0 : Math.max(0, nf < 0 ? L - 1 : nf - 1);
      let i = this._now;
      if (keep != null) { const k = this._fr.findIndex((q) => q.t.getTime() === keep); if (k >= 0) i = k; }
      this._i = Math.max(0, Math.min(L - 1, i)); this._pi = null;
      this._t0 = L ? this._fr[0].t.getTime() : 0; this._t1 = L ? this._fr[L - 1].t.getTime() : 1;
      const fn = this._tf(this._now), pos = `${fn * 100}%`;
      $('fc').style.width = nf >= 0 ? `${(1 - fn) * 100}%` : '0';
      $('nm').style.left = pos; $('nc').style.left = pos;
      $('l1').style.display = nf >= 0 ? '' : 'none';
      $('l0').style.display = $('nc').style.display = fm ? 'none' : ''; $('dl').style.display = fm ? '' : 'none'; $('tl').classList.toggle('fm', !!fm);
      if (fm && L) {
        const wd = new Intl.DateTimeFormat(this._lang, { weekday: 'short' });
        // forecast maps: the bar is a band of day fields with the day name inside (like Windy); weekend in yellow.
        // A field too narrow for "Mo 23" shows "Mo", one too narrow for that stays empty.
        const W = $('dl').getBoundingClientRect().width || 300, span = this._t1 - this._t0;
        let h = ''; const d = new Date(this._t0); d.setHours(0, 0, 0, 0);
        for (; d.getTime() < this._t1; d.setDate(d.getDate() + 1)) {
          const e = new Date(d); e.setDate(e.getDate() + 1);
          const x0 = Math.max(0, (d.getTime() - this._t0) / span), x1 = Math.min(1, (e.getTime() - this._t0) / span), w = (x1 - x0) * W;
          if (w <= 0) continue;
          const name = wd.format(d).replace('.', ''), txt = w >= 46 ? `${name} ${d.getDate()}` : w >= 22 ? name : '';
          h += `<span class="${d.getDay() % 6 === 0 ? 'we' : ''}" style="left:${x0 * 100}%;width:${(x1 - x0) * 100}%">${txt}</span>`;
        }
        $('dl').innerHTML = h;
      }
      const h0 = L ? Math.round((this._fr[this._now].t - this._fr[0].t) / 36e5) : 0;
      $('l0').textContent = T.minusH(h0);
      $('ld').style.display = map !== 'blitz' && !L ? 'flex' : 'none';
      $('ld').textContent = this._A ? T.loading : T.noentity;
      if (fm && L && !this._fr[this._i].cv) this._fbuild(map);
      this._draw();
    }

    _tf(i) { const q = this._fr[i]; return q && this._t1 > this._t0 ? (q.t.getTime() - this._t0) / (this._t1 - this._t0) : 0; }

    _loop() {
      clearTimeout(this._t);
      if (!this._play || !this.isConnected || this._o.map === 'blitz' || this._fr.length < 2) return;
      if (document.hidden || this._vis === false) { this._t = setTimeout(() => this._loop(), 1500); return; }
      const last = this._i >= this._fr.length - 1;
      this._t = setTimeout(() => { this._pi = last ? null : this._i; this._i = last ? 0 : this._i + 1; this._fade(); this._loop(); }, FMAPS.includes(this._o.map) ? (last ? this._c.fhold : this._c.fspeed) : (last ? this._c.hold : this._c.speed));
    }

    _fade() {
      if (this._pl) { if (this._pi == null) this._a = 1; else { this._ft0 = performance.now(); this._a = 0; } return; }
      cancelAnimationFrame(this._raf);
      if (this._pi == null) { this._a = 1; this._draw(); return; }
      const t0 = performance.now(), dur = Math.min(320, this._c.speed * 0.7);
      const step = () => { this._a = Math.min(1, (performance.now() - t0) / dur); this._draw(); if (this._a < 1 && this.isConnected) this._raf = requestAnimationFrame(step); else this._pi = null; };
      step();
    }

    // ---------- lightning (Blitzortung integration) ----------
    _strikes(h) {
      const J = this._J; if (!J) return;
      const st = [], seen = this._seen, now = Date.now();
      for (const id in h.states) {
        if (id.charCodeAt(0) !== 103 || !id.startsWith('geo_location.')) continue;
        const e = h.states[id], a = e.attributes || {};
        if (a.source !== 'blitzortung') continue;
        let q = seen.get(id);
        if (!q || q.lu !== e.last_updated) {
          const x = J.nx(+a.longitude), y = J.ny(+a.latitude);
          q = { lu: e.last_updated, x, y, t: Date.parse(a.publication_date || e.last_changed), in: x >= 0 && x <= 1 && y >= 0 && y <= 1 };
          if (!seen.has(id)) { const sk = now - Date.parse(e.last_updated); if (sk > -36e5 && sk < 36e5) this._skew = this._skew ? this._skew * 0.8 + sk * 0.2 : sk; }
          seen.set(id, q);
        }
        if (q.in && !isNaN(q.t)) st.push(q);
      }
      for (const k of [...seen.keys()]) if (!h.states[k]) seen.delete(k);
      const n0 = this._st.length ? Math.max(...this._st.map((q) => q.t)) : 0;
      this._st = st;
      if (this._o.map === 'blitz') { this._ui(); this._live(st.some((q) => q.t > n0)); }
      else if (this._o.bz) this._draw();
    }

    _now2() { return Date.now() - (this._skew || 0); }

    _live() {
      cancelAnimationFrame(this._raf); clearTimeout(this._lt);
      if (this._o.map !== 'blitz' || !this.isConnected) return;
      const tick = () => {
        if (this._o.map !== 'blitz' || !this.isConnected) return;
        this._draw();
        const now = this._now2(), act = this._st.some((q) => now - q.t < 26e3);
        if (act && !document.hidden && this._vis !== false) this._raf = requestAnimationFrame(tick);
        else this._lt = setTimeout(tick, 10000);
      };
      tick();
    }

    _bolt(x, cx, cy, s, col, a) {
      x.globalAlpha = a; x.fillStyle = col; x.strokeStyle = 'rgba(40,20,45,.55)'; x.lineWidth = Math.max(1, s * 0.12);
      x.beginPath();
      x.moveTo(cx + 0.15 * s, cy - 0.6 * s); x.lineTo(cx - 0.35 * s, cy + 0.08 * s); x.lineTo(cx - 0.02 * s, cy + 0.08 * s);
      x.lineTo(cx - 0.18 * s, cy + 0.6 * s); x.lineTo(cx + 0.35 * s, cy - 0.12 * s); x.lineTo(cx + 0.02 * s, cy - 0.12 * s); x.closePath();
      x.fill(); x.stroke(); x.globalAlpha = 1;
    }

    _drawStrikes(x, g, D, tEnd, win, live) {
      const now = tEnd, s = 9 * D;
      const list = this._st.filter((q) => q.t <= now && now - q.t < win * 6e4).sort((a, b) => a.t - b.t);
      for (const q of list) {
        const age = (now - q.t) / (win * 6e4), px = g.ox + q.x * g.dw, py = g.oy + q.y * g.dh;
        if (px < -20 || py < -20 || px > g.W + 20 || py > g.H + 20) continue;
        const a = 1 - age * 0.78;
        const col = age < 0.25 ? '#f6c8fa' : age < 0.5 ? '#e2a6ea' : age < 0.75 ? '#c88cd2' : '#a77eb0';
        this._bolt(x, px, py, s, col, a);
        if (live) {
          const sec = (this._now2() - q.t) / 1000;
          if (sec >= 0 && sec < 25) {
            const r = (8 + Math.min(1, sec / 20) * 26) * D, ra = sec < 20 ? 0.9 : 0.9 * (1 - (sec - 20) / 5);
            x.globalAlpha = Math.max(0, ra); x.strokeStyle = '#fff'; x.lineWidth = 1.4 * D; x.beginPath(); x.arc(px, py, r, 0, 7); x.stroke(); x.globalAlpha = 1;
            if (sec < 1.5) { const gr = x.createRadialGradient(px, py, 0, px, py, 18 * D); gr.addColorStop(0, `rgba(255,255,255,${0.9 * (1 - sec / 1.5)})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.beginPath(); x.arc(px, py, 18 * D, 0, 7); x.fill(); }
          }
        }
      }
    }

    // ---------- controls ----------
    _ui() {
      const s = this.shadowRoot; if (!s) return;
      const $ = (id) => s.getElementById(id), o = this._o, map = o.map, T = this._T, av = this._avail || {};
      s.querySelectorAll('.mb[data-m]').forEach((b) => b.classList.toggle('on', b.dataset.m === map));
      const mm = MAPS.find((q) => q.id === map); if (mm) { s.querySelector('#hd span').textContent = T[map]; s.querySelector('#hd ha-icon').setAttribute('icon', mm.icon); }
      s.querySelectorAll('#sm button').forEach((b) => b.classList.toggle('on', b.dataset.s === o.sm));
      $('r2').style.display = map === 'sat' ? '' : 'none'; // satellite channel buttons only; no empty row otherwise
      [['s_fc', 'fc', map === 'radar'], ['s_ort', 'ort', true], ['s_bz', 'bz', av.blitz && (map === 'radar' || map === 'sat')], ['s_ov', 'ov', map === 'sat' && av.radar], ['s_iso', 'iso', FMAPS.includes(map)], ['s_ws', 'ws', map === 'rain' || map === 'temp']].forEach(([id, k, vis]) => { $(id).style.display = vis ? '' : 'none'; $(id).classList.toggle('on', !!o[k]); });
      const blitz = map === 'blitz';
      $('pl').style.display = blitz ? 'none' : ''; $('tl').style.display = blitz ? 'none' : ''; $('bi').style.display = blitz ? '' : 'none';
      if (blitz) { const now = this._now2(), n = this._st.filter((q) => now - q.t < this._c.bzlive * 6e4).length; $('bi').textContent = T.strikes(n); }
      const lg = s.querySelector('#lg .b'), sat = map === 'sat';
      let cols = LEG_R, a = T.weak, b = T.strong;
      if (blitz) { cols = LEG_B; a = T.newest; b = T.min60; }
      else if (sat && o.sm === 'infra' && !o.ov) { cols = LEG_I; a = T.warm; b = T.cold; }
      else if (map === 'temp') { cols = LEG_T; a = '−20 °C'; b = '+30 °C'; }
      else if (map === 'wind') { cols = LEG_W; a = '0 km/h'; b = '100 km/h'; }
      else if (map === 'rain') { cols = LEG_FR; a = '0,1 mm/h'; b = '30 mm/h'; if (this._lang !== 'de') a = '0.1 mm/h'; }
      const show = !(sat && o.sm !== 'infra' && !o.ov);
      const ir = cols === LEG_I, rd = cols === LEG_R, tr = rd || ir || ((map === 'temp' || map === 'wind' || map === 'rain') && !blitz && !sat);
      const tq = s.querySelector('#lg .t'); tq.querySelectorAll('.x').forEach((e) => e.remove());
      $('lg').classList.toggle('rd', rd); $('lg').classList.toggle('tr', tr);
      $('lg').style.display = show ? '' : 'none';
      const de = this._lang === 'de', f = (v) => (de ? String(v).replace('.', ',') : String(v));
      // labels sit centred on their position; the box has room on both sides
      const tick = (txt, pct) => { const e = document.createElement('span'); e.className = 'x'; e.textContent = txt; e.style.left = `${pct}%`; tq.appendChild(e); };
      ['lga', 'lgb'].forEach((k) => { const e = $(k); e.style.left = e.style.right = e.style.transform = ''; if (tr) e.textContent = ''; });
      if (rd) {
        // all 15 DWD intensity classes (mm/h), colours as drawn on the map
        lg.innerHTML = WIN.map((c) => `<i style="background:rgb(${c[0]},${c[1]},${c[2]})"></i>`).join(''); $('lgu').textContent = 'mm/h';
        [[0.1, 0], [1, 3], [3, 5], [7.5, 7], [15, 9], [45, 11], [100, 13]].forEach(([v, k]) => tick(f(v), k / 15 * 100)); tick('150+', 100);
      } else if (ir) {
        // cloud-top temperature, EUMETSAT IR 10.5 µm (white −80 °C … black +30 °C)
        lg.innerHTML = cols.map((c) => `<i style="background:${c}"></i>`).join(''); $('lgu').textContent = '°C';
        [[-35, 1], [-48, 3], [-58, 5], [-67, 7]].forEach(([v, k]) => tick('−' + Math.abs(v), (k + 0.5) / cols.length * 100));
      } else if (tr) {
        // whole scale; the range found in the forecast is highlighted, the rest dimmed
        let B, C, unit;
        if (map === 'temp') { B = []; for (let v = TLO; v <= THI; v += TSTEP) B.push(v); C = B.slice(0, -1).map((v) => tcol(v + TSTEP / 2)); unit = '°C'; }
        else { const P = map === 'wind' ? PAL_W : PAL_R; B = P.map((q) => q[0]); C = P.slice(0, -1).map((q) => rgb(q[1])); unit = map === 'wind' ? 'km/h' : 'mm'; }
        const n = C.length, R = this._frange(map);
        let i0 = 0, i1 = n;
        if (R) { if (map === 'temp') { while (i0 < n - 1 && B[i0 + 1] <= R[0]) i0++; } i1 = i0 + 1; while (i1 < n && B[i1] < R[1]) i1++; }
        $('lgu').textContent = unit;
        let h = ''; for (let k = 0; k < n; k++) h += `<i class="${k < i0 || k >= i1 ? 'o' : ''}" style="background:${C[k]}"></i>`;
        lg.innerHTML = h;
        if (map === 'temp') {
          const sg = (v) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v), z = B.indexOf(0);
          // the full-width scale has room for every 10 °C inside the forecast range, plus its two ends
          const tens = []; for (let k = i0; k <= i1; k++) if (B[k] % 10 === 0) tens.push(k);
          if (!tens.includes(z) && z > i0 && z < i1) tens.push(z);
          tens.forEach((k) => tick(sg(B[k]), k / n * 100));
          [i0, i1].forEach((k) => { if (!tens.some((q) => Math.abs(q - k) < 2)) tick(sg(B[k]), k / n * 100); });
        } else for (let k = 0; k <= n; k += 2) tick(f(B[k]), k / n * 100);
      } else { lg.innerHTML = cols.map((c) => `<i style="background:${c}"></i>`).join(''); $('lga').textContent = a; $('lgb').textContent = b; }
      this._layout();
    }

    _frange(map) {
      const G = this._G; if (!G) return null; G.fr = G.fr || {}; if (G.fr[map] !== undefined) return G.fr[map];
      const A = map === 'temp' ? G.T : map === 'wind' ? G.S : G.P;
      let lo = Infinity, hi = -Infinity; A.forEach((X) => X.forEach((v) => { if (!isNaN(v)) { if (v < lo) lo = v; if (v > hi) hi = v; } }));
      return (G.fr[map] = lo > hi ? null : [lo, hi]);
    }

    // the colour scale now sits inside the control box, so nothing has to follow its height
    _layout() {}

    _draw() {
      const s = this.shadowRoot; if (!s || !this._c || !this._J) return;
      const cv = s.getElementById('cv'), r = cv.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const D = Math.min(window.devicePixelRatio || 1, 1.5), W = Math.round(r.width * D), H = Math.round(r.height * D);
      if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
      const x = cv.getContext('2d', { alpha: false }), c = this._c, o = this._o, map = o.map, J = this._J;
      const [iw, ih] = (this._A && this._A.size) || [800, 922];
      const ct = s.getElementById('ct'), op = s.getElementById('op');
      const Hv = c.fit === 'contain' ? H : Math.max(H * 0.5, H - Math.round((ct.offsetHeight - (op.classList.contains('open') ? op.offsetHeight : 0) + 8) * D));
      // the integration loads a margin around the chosen area (pad); fit the chosen area into the space above the controls
      const pad = (this._A && this._A.pad) || 1;
      let sc = c.fit === 'contain' ? Math.min(W / iw, H / ih) : Math.min(W / (iw / pad), Hv / (ih / pad));
      sc *= c.zoom;
      const dw = iw * sc, dh = ih * sc;
      let ox = W / 2 - c.cx * dw, oy = Hv / 2 - c.cy * dh;
      ox = dw <= W ? (W - dw) / 2 : Math.min(0, Math.max(W - dw, ox));
      // keep the whole card covered (also below the controls) as long as the loaded map is large enough
      oy = dh <= H ? (H - dh) / 2 : Math.min(0, Math.max(H - dh, oy));
      const g = { ox, oy, dw, dh, W, H };
      const layer = (kind) => {
        const key = `${W}x${H}x${Math.round(ox)}x${Math.round(oy)}x${Math.round(dw)}`, bc = this._bc[kind];
        if (bc && bc.k === key) return bc.c;
        const img = (this._bi || (this._bi = {}))[kind];
        if (!img) { if (!this._bw) this._bw = {}; if (!this._bw[kind]) { this._bw[kind] = 1; this._baseImg(kind).then((v) => { this._bw[kind] = 0; if (v) { this._bi[kind] = v; this._draw(); } }); } return null; }
        const lc = document.createElement('canvas'); lc.width = W; lc.height = H;
        const y = lc.getContext('2d'); y.imageSmoothingEnabled = true; y.imageSmoothingQuality = 'high';
        y.drawImage(img, ox, oy, dw, dh);
        this._bc[kind] = { k: key, c: lc };
        return lc;
      };
      const frame = (list, i, pi, a) => {
        const f = list[i]; if (!f) return null;
        x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'low';
        const pf = pi != null && a < 1 && list[pi];
        if (pf) { x.globalAlpha = 1 - a; x.drawImage(pf.cv, ox, oy, dw, dh); x.globalAlpha = a; x.drawImage(f.cv, ox, oy, dw, dh); x.globalAlpha = 1; }
        else x.drawImage(f.cv, ox, oy, dw, dh);
        return f;
      };
      let f = null;
      if (map === 'sat') {
        const sm = o.sm;
        if (sm === 'blau') { x.fillStyle = '#28497e'; x.fillRect(0, 0, W, H); const L = layer('land'); if (L) x.drawImage(L, 0, 0); }
        else { x.fillStyle = '#1c1c1c'; x.fillRect(0, 0, W, H); }
        f = frame(this._fr, this._i, this._pi, this._a);
        if (f && o.ov && this._R.length) {
          let bi = -1, bd = 1e12; this._R.forEach((q, k) => { const d = Math.abs(q.t - f.t); if (!q.f && d < bd) { bd = d; bi = k; } });
          if (bi >= 0 && bd <= 6e5) { x.imageSmoothingQuality = 'low'; x.drawImage(this._R[bi].cv, ox, oy, dw, dh); }
        }
        const LN = layer('lines'); if (LN) x.drawImage(LN, 0, 0);
      } else if (FMAPS.includes(map)) {
        x.fillStyle = '#858585'; x.fillRect(0, 0, W, H); const G = layer('grey'); if (G) x.drawImage(G, 0, 0);
        const ok = this._fr[this._i] && this._fr[this._i].cv;
        if (ok) { const pi = this._pi != null && this._fr[this._pi] && this._fr[this._pi].cv ? this._pi : null; f = frame(this._fr, this._i, pi, this._a); if (map !== 'rain') x.imageSmoothingQuality = 'high'; }
        if (f && f.sn) { x.imageSmoothingQuality = 'low'; x.drawImage(f.sn, ox, oy, dw, dh); }
        if (f && o.iso && this._G && this._G.M) this._isoDraw(x, f.si, ox, oy, dw, dh, W, H, D);
        if (f && f.th) f.th.forEach(([tx, ty]) => this._bolt(x, ox + tx * dw, oy + ty * dh, 9 * D, '#f0b4f5', 0.95));
        if (this._pc && this._pl) x.drawImage(this._pc, 0, 0);
        if (map !== 'rain') { const LN = layer('lines'); if (LN) x.drawImage(LN, 0, 0); }
        this._geom = g;
      } else {
        x.fillStyle = '#858585'; x.fillRect(0, 0, W, H); const G = layer('grey'); if (G) x.drawImage(G, 0, 0);
        if (map === 'radar') f = frame(this._fr, this._i, this._pi, this._a);
      }
      this._labels(x, g, D, Hv, map === 'temp' && f ? f.si : null);
      const a = this._A || {};
      if (map === 'blitz') this._drawStrikes(x, g, D, this._now2(), c.bzlive, true);
      else if (o.bz && f && !f.f && !FMAPS.includes(map) && this._avail.blitz) this._drawStrikes(x, g, D, f.t.getTime() + ((map === 'sat' ? a.satellite : a.radar) || { step: 5 }).step * 6e4 - 1, c.bzfilm, false);
      if (o.ort && this._home) {
        const hx = ox + J.nx(this._home[1]) * dw, hy = oy + J.ny(this._home[0]) * dh;
        x.fillStyle = '#fff'; x.beginPath(); x.arc(hx, hy, 6 * D, 0, 7); x.fill();
        x.fillStyle = '#2b7de0'; x.beginPath(); x.arc(hx, hy, 3.6 * D, 0, 7); x.fill();
      }
      if (map === 'blitz') { if (!this._uiT || Date.now() - this._uiT > 5000) { this._uiT = Date.now(); this._ui(); } return; }
      if (f) {
        const T = this._T, tb = s.getElementById('tb'), mins = Math.round((this._now2() - f.t.getTime()) / 6e4);
        const rel = mins >= 0 ? T.ago(mins) : T.in(-mins);
        let txt;
        if (FMAPS.includes(map)) { const wd = new Intl.DateTimeFormat(this._lang, { weekday: 'short' }).format(f.t).replace('.', ''); txt = `${wd} ${f.t.getDate()} – ${hm(f.t)}`; }
        else txt = `${hm(f.t)} · ${this._i === this._now && mins < 15 ? T.now : rel}`;
        if (tb.textContent !== txt) tb.textContent = txt;
        tb.className = f.f ? 'f' : '';
        const fr = this._tf(this._i);
        s.getElementById('pg').style.transform = `scaleX(${fr})`;
        const tw = s.getElementById('tk').offsetWidth, bw = tb.offsetWidth;
        tb.style.left = `${Math.max(0, Math.min(tw - bw, fr * tw - bw / 2))}px`;
      }
    }

    // ---------- forecast (Open-Meteo grid, 3-hour steps in local time) ----------
    async _loadF() {
      const a = this._A; if (!this._vb || !a) return;
      const vb = this._vb, lid = (this._fl = (this._fl || 0) + 1), GR = this._GR, parts = (a.forecast && a.forecast.parts) || 4;
      if (this._gk !== vb) {
        const got = await Promise.all([...Array(parts).keys()].map(async (i) => { try { const r = await fetch(`${a.url}om_${i}.json?b=${encodeURIComponent(vb)}`, { cache: 'no-store' }); return r.ok ? await r.json() : null; } catch (e) { return null; } }));
        if (lid !== this._fl) return;
        const per = GR.nla / parts * GR.nlo;
        const all = [].concat(...got.map((p) => (Array.isArray(p) && p.length === per ? p : new Array(per).fill(null))));
        const ref = all.find(Boolean); if (!ref) return;
        const tt = ref.hourly.time.map((q) => q * 1000), n = GR.nla * GR.nlo;
        const mk = () => tt.map(() => new Float32Array(n).fill(NaN));
        const G = { t: tt, T: mk(), U: mk(), V: mk(), S: mk(), N: mk(), C: mk(), P: mk(), M: mk() };
        all.forEach((p, k) => { if (!p) return; const h = p.hourly; tt.forEach((_, si) => { const sp = h.wind_speed_10m[si], dr = h.wind_direction_10m[si] * Math.PI / 180; G.T[si][k] = h.temperature_2m[si]; G.S[si][k] = sp; G.U[si][k] = -sp * Math.sin(dr); G.V[si][k] = -sp * Math.cos(dr); G.N[si][k] = h.snowfall[si]; G.C[si][k] = h.weather_code[si]; G.P[si][k] = (h.precipitation || [])[si]; G.M[si][k] = (h.pressure_msl || [])[si]; }); });
        const nb = (A, fn) => { const B = new Float32Array(A.length).fill(NaN); for (let i = 0; i < GR.nla; i++) for (let j = 0; j < GR.nlo; j++) fn(A, B, i, j); return B; };
        const avg = (A, B, i, j) => { let s = 0, c = 0; for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) { const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= GR.nla || jj >= GR.nlo) continue; const v = A[ii * GR.nlo + jj]; if (!isNaN(v)) { s += v; c++; } } if (c) B[i * GR.nlo + j] = s / c; };
        const sm = (A) => nb(A, avg);
        // mountains distort sea-level pressure: fill high points from their surroundings
        const hiE = all.map((p) => !!(p && p.elevation > 700));
        const fill = (A) => { const B = Float32Array.from(A, (v, k) => (hiE[k] ? NaN : v)); for (let it = 0; it < 12; it++) { const C2 = B.slice(); let left = 0; for (let i = 0; i < GR.nla; i++) for (let j = 0; j < GR.nlo; j++) { const k = i * GR.nlo + j; if (!isNaN(B[k])) continue; let s = 0, c = 0; for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) { const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= GR.nla || jj >= GR.nlo) continue; const v = B[ii * GR.nlo + jj]; if (!isNaN(v)) { s += v; c++; } } if (c) C2[k] = s / c; else left++; } B.set(C2); if (!left) break; } return B; };
        G.M = G.M.map((A) => sm(sm(sm(fill(A)))));
        this._G = G; this._gk = vb; this._FF = {}; this._IC = {}; this._HT = {}; if (this._o && ['temp', 'wind', 'rain'].includes(this._o.map)) this._ui();
      }
      const G = this._G, s0 = this._fnear(); if (s0 < 0) return;
      if (s0 !== this._fs) { this._fs = s0; this._FF = {}; }
      const FF = this._FF || (this._FF = {});
      const list = [];
      for (let si = s0; si < G.t.length && list.length < 41; si++) list.push({ t: new Date(G.t[si]), si, f: false });
      FMAPS.forEach((m) => { if (!FF[m]) FF[m] = list.map((q) => Object.assign({}, q)); });
      if (FMAPS.includes(this._o.map)) { this._apply(true); this._fbuild(this._o.map); }
      this._anim();
    }

    // forecast step closest to the current time ("now")
    _fnear() {
      const G = this._G; if (!G || !this._vb) return -1;
      const T0 = Date.parse(this._vb.split('#')[0]), now = Date.now(); let s0 = -1, bd = Infinity;
      G.t.forEach((t, si) => { if (t < T0) return; const d = Math.abs(t - now); if (d < bd) { bd = d; s0 = si; } });
      return s0;
    }

    _pmap() {
      if (this._PM) return this._PM;
      const J = this._J, GR = this._GR, w = 200, h = 230, gi = new Float32Array(w * h), gj = new Float32Array(w * h);
      for (let y = 0; y < h; y++) { const la = J.ilat((y + 0.5) / h); for (let xx = 0; xx < w; xx++) { const k = y * w + xx; gi[k] = (la - GR.la0) / GR.dla; gj[k] = (J.ilon((xx + 0.5) / w) - GR.lo0) / GR.dlo; } }
      return (this._PM = { w, h, gi, gj });
    }

    _samp(A, gi, gj) {
      const GR = this._GR;
      if (!(gi >= 0 && gj >= 0 && gi <= GR.nla - 1 && gj <= GR.nlo - 1)) return NaN;
      const i0 = Math.min(GR.nla - 2, gi | 0), j0 = Math.min(GR.nlo - 2, gj | 0), fi = gi - i0, fj = gj - j0, b = i0 * GR.nlo + j0;
      return (A[b] * (1 - fj) + A[b + 1] * fj) * (1 - fi) + (A[b + GR.nlo] * (1 - fj) + A[b + GR.nlo + 1] * fj) * fi;
    }

    _field(A, R) {
      const P = this._pmap(), cv = document.createElement('canvas'); cv.width = P.w; cv.height = P.h;
      const x = cv.getContext('2d'), d = x.createImageData(P.w, P.h), p = d.data, sc = 2000 / (R.b - R.a);
      for (let k = 0; k < P.w * P.h; k++) { const v = this._samp(A, P.gi[k], P.gj[k]); if (isNaN(v)) continue; const q = Math.max(0, Math.min(2000, Math.round((v - R.a) * sc))) * 3, i = k * 4; p[i] = R.t[q]; p[i + 1] = R.t[q + 1]; p[i + 2] = R.t[q + 2]; p[i + 3] = 235; }
      x.putImageData(d, 0, 0); return cv;
    }

    _rfield(A) {
      const P = this._pmap(), cv = document.createElement('canvas'); cv.width = P.w; cv.height = P.h;
      const x = cv.getContext('2d'), d = x.createImageData(P.w, P.h), p = d.data;
      for (let k = 0; k < P.w * P.h; k++) {
        const v = this._samp(A, P.gi[k], P.gj[k]); if (!(v >= PAL_R[0][0])) continue;
        let c = PAL_R[PAL_R.length - 1][1];
        for (let n = 0; n < PAL_R.length - 1; n++) if (v < PAL_R[n + 1][0]) { const f = (v - PAL_R[n][0]) / (PAL_R[n + 1][0] - PAL_R[n][0]); c = PAL_R[n][1].map((q, z) => Math.round(q + (PAL_R[n + 1][1][z] - q) * f)); break; }
        const i = k * 4; p[i] = c[0]; p[i + 1] = c[1]; p[i + 2] = c[2]; p[i + 3] = Math.round(Math.min(1, 0.55 + v * 0.3) * 255);
      }
      x.putImageData(d, 0, 0); return cv;
    }

    _snow(si) {
      const G = this._G, P = this._pmap(); let any = false;
      const cv = document.createElement('canvas'); cv.width = P.w; cv.height = P.h; const x = cv.getContext('2d'); x.fillStyle = 'rgba(255,255,255,.95)';
      for (let y = 2; y < P.h; y += 5) for (let xx = (y % 10 === 2 ? 2 : 4); xx < P.w; xx += 5) { const k = y * P.w + xx, v = this._samp(G.N[si], P.gi[k], P.gj[k]); if (v > 0.1) { any = true; x.fillRect(xx, y, 1.6, 1.6); } }
      return any ? cv : null;
    }

    _thunder(si) {
      const G = this._G, GR = this._GR, J = this._J, out = [];
      for (let i = 0; i < GR.nla; i++) for (let j = 0; j < GR.nlo; j++) { const c = G.C[si][i * GR.nlo + j]; if (c >= 95) out.push([J.nx(GR.lo0 + j * GR.dlo), J.ny(GR.la0 + i * GR.dla)]); }
      return out.length ? out : null;
    }

    async _fbuild(map) {
      const L = (this._FF || {})[map], G = this._G; if (!L || !G) return;
      const bid = (this._fb = (this._fb || 0) + 1);
      for (let n = 0; n < L.length; n++) {
        const q = L[n]; if (q.cv) continue;
        if (map === 'temp') q.cv = this._field(G.T[q.si], RT);
        else if (map === 'wind') q.cv = this._field(G.S[q.si], RW);
        else { q.cv = this._rfield(G.P[q.si]); q.sn = this._snow(q.si); q.th = this._thunder(q.si); }
        if (bid !== this._fb) return;
        if (n === this._i || n % 6 === 5) this._draw();
        if (n % 4 === 3) await new Promise((ok) => setTimeout(ok, 0));
      }
      this._draw();
    }

    // isobars every 2 hPa from the smoothed pressure field
    _iso(si) {
      const C = this._IC || (this._IC = {}); if (C[si]) return C[si];
      const P = this._pmap(), w = P.w, h = P.h, M = this._G.M[si], v = new Float32Array(w * h);
      let lo = 1e9, hi = -1e9;
      for (let k = 0; k < w * h; k++) { const q = (v[k] = this._samp(M, P.gi[k], P.gj[k])); if (!isNaN(q)) { if (q < lo) lo = q; if (q > hi) hi = q; } }
      const key = (a, b) => Math.round(a * 512) + ',' + Math.round(b * 512);
      const chaikin = (p) => { for (let r = 0; r < 2; r++) { if (p.length < 6) break; const o = [p[0], p[1]]; for (let i = 0; i < p.length - 2; i += 2) { const x0 = p[i], y0 = p[i + 1], x1 = p[i + 2], y1 = p[i + 3]; o.push(0.75 * x0 + 0.25 * x1, 0.75 * y0 + 0.25 * y1, 0.25 * x0 + 0.75 * x1, 0.25 * y0 + 0.75 * y1); } o.push(p[p.length - 2], p[p.length - 1]); p = o; } return p; };
      const out = [];
      for (let L = Math.ceil(lo / 2) * 2; L <= hi; L += 2) {
        const s = [];
        for (let y = 0; y < h - 1; y++) for (let xx = 0; xx < w - 1; xx++) {
          const k = y * w + xx, a = v[k], b = v[k + 1], c = v[k + w + 1], d = v[k + w];
          if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d)) continue;
          const pt = [], e = (p, q, x0, y0, x1, y1) => { if ((p < L) !== (q < L)) { const f = (L - p) / (q - p); pt.push(x0 + (x1 - x0) * f, y0 + (y1 - y0) * f); } };
          e(a, b, xx, y, xx + 1, y); e(b, c, xx + 1, y, xx + 1, y + 1); e(d, c, xx, y + 1, xx + 1, y + 1); e(a, d, xx, y, xx, y + 1);
          if (pt.length >= 4) s.push(pt[0], pt[1], pt[2], pt[3]);
          if (pt.length === 8) s.push(pt[4], pt[5], pt[6], pt[7]);
        }
        const n = s.length / 4; if (!n) continue;
        const adj = new Map(), used = new Uint8Array(n), add = (kk, i) => { const q = adj.get(kk); if (q) q.push(i); else adj.set(kk, [i]); };
        for (let i = 0; i < n; i++) { add(key(s[4 * i], s[4 * i + 1]), i); add(key(s[4 * i + 2], s[4 * i + 3]), i); }
        const lines = [];
        for (let i0 = 0; i0 < n; i0++) {
          if (used[i0]) continue; used[i0] = 1;
          const fw = [s[4 * i0 + 2], s[4 * i0 + 3]], bw = [s[4 * i0], s[4 * i0 + 1]];
          for (const arr of [fw, bw]) {
            for (;;) {
              const ex = arr[arr.length - 2], ey = arr[arr.length - 1], k0 = key(ex, ey);
              const c = (adj.get(k0) || []).find((j) => !used[j]); if (c == null) break; used[c] = 1;
              if (key(s[4 * c], s[4 * c + 1]) === k0) arr.push(s[4 * c + 2], s[4 * c + 3]); else arr.push(s[4 * c], s[4 * c + 1]);
            }
          }
          const pts = []; for (let i = bw.length - 2; i >= 0; i -= 2) pts.push(bw[i], bw[i + 1]); pts.push(...fw);
          if (pts.length >= 12) lines.push(chaikin(pts));
        }
        if (lines.length) out.push({ L, lines });
      }
      return (C[si] = { w, h, out });
    }

    // high and low pressure centres
    _ht(si) {
      const C = this._HT || (this._HT = {}); if (C[si]) return C[si];
      const GR = this._GR, M = this._G.M[si], R = 4, out = [];
      for (let i = 2; i < GR.nla - 2; i++) for (let j = 2; j < GR.nlo - 2; j++) {
        const v = M[i * GR.nlo + j]; if (isNaN(v)) continue;
        let mx = -1e9, mn = 1e9;
        for (let di = -R; di <= R; di++) for (let dj = -R; dj <= R; dj++) { if (!di && !dj) continue; const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= GR.nla || jj >= GR.nlo) continue; const q = M[ii * GR.nlo + jj]; if (isNaN(q)) continue; if (q > mx) mx = q; if (q < mn) mn = q; }
        if (v > mx && v - mn >= 2) out.push([GR.lo0 + j * GR.dlo, GR.la0 + i * GR.dla, v, true]);
        else if (v < mn && mx - v >= 2) out.push([GR.lo0 + j * GR.dlo, GR.la0 + i * GR.dla, v, false]);
      }
      return (C[si] = out);
    }

    _isoDraw(x, si, ox, oy, dw, dh, W, H, D) {
      const I = this._iso(si), J = this._J, X = (q) => ox + (q + 0.5) / I.w * dw, Y = (q) => oy + (q + 0.5) / I.h * dh;
      x.save(); x.strokeStyle = 'rgba(255,255,255,.8)'; x.lineWidth = 1.2 * D; x.lineJoin = 'round'; x.lineCap = 'round'; x.beginPath();
      for (const { lines } of I.out) for (const l of lines) { x.moveTo(X(l[0]), Y(l[1])); for (let i = 2; i < l.length; i += 2) x.lineTo(X(l[i]), Y(l[i + 1])); }
      x.stroke();
      x.font = `600 ${9 * D}px -apple-system,system-ui,sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
      const used = [], gap = 45 * D, HL = this._lang === 'de' ? ['H', 'T'] : ['H', 'L'];
      this._ht(si).forEach(([lo, la, v, hi]) => {
        const px = ox + J.nx(lo) * dw, py = oy + J.ny(la) * dh;
        if (px < W * 0.06 || px > W * 0.82 || py < H * 0.06 || py > H * 0.74) return;
        used.push([px, py]);
        x.shadowColor = 'rgba(0,0,0,.55)'; x.shadowBlur = 3 * D; x.fillStyle = hi ? '#ffffff' : '#ffd6d6';
        x.font = `700 ${15 * D}px -apple-system,system-ui,sans-serif`; x.fillText(hi ? HL[0] : HL[1], px, py - 5 * D);
        x.font = `600 ${9 * D}px -apple-system,system-ui,sans-serif`; x.fillText(String(Math.round(v)), px, py + 7 * D);
        x.shadowBlur = 0; x.shadowColor = 'transparent';
      });
      for (const { L, lines } of I.out) {
        const cand = [];
        for (const l of lines) for (let i = 0; i < l.length; i += 8) { const px = X(l[i]), py = Y(l[i + 1]); if (px > W * 0.08 && px < W * 0.78 && py > H * 0.08 && py < H * 0.72) cand.push([px, py]); }
        if (!cand.length) continue;
        cand.sort((a, b) => a[0] - b[0]);
        const pick = [0.5, 0.3, 0.7, 0.15, 0.85].map((f) => cand[Math.floor(f * (cand.length - 1))]).find(([px, py]) => used.every(([ux, uy]) => Math.hypot(px - ux, py - uy) > gap));
        if (!pick) continue;
        used.push(pick);
        const t = String(L), tw = x.measureText(t).width + 6 * D, th = 11 * D, [px, py] = pick;
        x.fillStyle = 'rgba(235,240,248,.92)'; x.beginPath();
        if (x.roundRect) x.roundRect(px - tw / 2, py - th / 2, tw, th, th / 2); else x.rect(px - tw / 2, py - th / 2, tw, th);
        x.fill(); x.fillStyle = '#2a3340'; x.fillText(t, px, py + 0.5 * D);
      }
      x.restore();
    }

    // ---------- animated wind lines ----------
    _anim() {
      const m = this._o.map, on = this.isConnected && this._G && (m === 'wind' || ((m === 'rain' || m === 'temp') && this._o.ws));
      if (!on) { if (this._pl) { this._pl = false; cancelAnimationFrame(this._praf); this._draw(); } return; }
      if (this._pl) return;
      this._pl = true; this._pt = 0;
      const tick = (ts) => {
        if (!this._pl) return;
        this._praf = requestAnimationFrame(tick);
        if (document.hidden || this._vis === false || ts - this._pt < 33) return;
        const dt = Math.min(0.1, (ts - (this._pt || ts)) / 1000); this._pt = ts;
        if (this._pi != null) { this._a = Math.min(1, (performance.now() - this._ft0) / Math.min(320, this._c.fspeed * 0.7)); if (this._a >= 1) this._pi = null; }
        this._pstep(dt); this._draw();
      };
      this._praf = requestAnimationFrame(tick);
    }

    _pstep(dt) {
      const g = this._geom, f = this._fr[this._i], G = this._G, J = this._J, GR = this._GR; if (!g || !f || !G) return;
      const D = Math.min(window.devicePixelRatio || 1, 1.5);
      const pc = this._pc || (this._pc = document.createElement('canvas'));
      if (pc.width !== g.W || pc.height !== g.H) { pc.width = g.W; pc.height = g.H; this._P = null; }
      const x = pc.getContext('2d');
      const N = Math.min(700, Math.round(g.W * g.H / (D * D) / 300));
      const P = this._P || (this._P = Array.from({ length: N }, () => ({ x: Math.random(), y: Math.random(), a: Math.random() * 80 | 0 })));
      x.globalCompositeOperation = 'destination-in'; x.fillStyle = 'rgba(0,0,0,0.9)'; x.fillRect(0, 0, g.W, g.H);
      x.globalCompositeOperation = 'source-over'; x.strokeStyle = 'rgba(255,255,255,.75)'; x.lineWidth = 1.1 * D; x.beginPath();
      // speed scale was tuned on a ~1580 km (Mercator) wide map; keep the same look on any map size
      const U = G.U[f.si], V = G.V[f.si], K = 0.0011 * 1580000 / (J.X1 - J.X0);
      for (const q of P) {
        const mx = (q.x * g.W - g.ox) / g.dw, my = (q.y * g.H - g.oy) / g.dh;
        const gi = (J.ilat(my) - GR.la0) / GR.dla, gj = (J.ilon(mx) - GR.lo0) / GR.dlo;
        const u = this._samp(U, gi, gj), v = this._samp(V, gi, gj);
        q.a++;
        if (isNaN(u) || q.a > 90) { q.x = Math.random(); q.y = Math.random(); q.a = 0; continue; }
        const nx2 = q.x + u * K * dt * (g.dw / g.W), ny2 = q.y - v * K * dt * (g.dh / g.H) * 1.15;
        x.moveTo(q.x * g.W, q.y * g.H); x.lineTo(nx2 * g.W, ny2 * g.H);
        q.x = nx2; q.y = ny2;
        if (q.x < 0 || q.x > 1 || q.y < 0 || q.y > 1) { q.x = Math.random(); q.y = Math.random(); q.a = 0; }
      }
      x.stroke();
    }

    getCardSize() { return 6; }
    _grid() { return { columns: 8, rows: 9, min_columns: 6, min_rows: 4 }; }
    getGridOptions() { return this._grid(); }
  }

  // Visual editor shown in the dashboard ("Edit card"), so no YAML is needed
  class WeatherScopeCardEditor extends HTMLElement {
    setConfig(c) { this._config = Object.assign({}, c); this._render(); }
    set hass(h) { this._hass = h; this._render(); }
    _render() {
      if (!this._hass || !this._config) return;
      const lang = (this._hass.locale && this._hass.locale.language || this._hass.language || 'en').slice(0, 2), T = I18N[lang] || I18N.en;
      if (!this._form) {
        this._form = document.createElement('ha-form');
        this._form.addEventListener('value-changed', (e) => {
          const c = Object.assign({}, this._config, e.detail.value);
          if (c.zoom === 1) delete c.zoom;
          if (c.fit === 'cover') delete c.fit;
          if (c.frame === 'none') delete c.frame;
          if (!c.header) delete c.header;
          this._config = c;
          this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: c }, bubbles: true, composed: true }));
        });
        this.appendChild(this._form);
      }
      this._form.hass = this._hass;
      this._form.data = Object.assign({ fit: 'cover', zoom: 1, frame: 'none', header: false }, this._config);
      this._form.schema = [
        { name: 'entity', required: true, selector: { entity: { filter: [{ domain: 'sensor', integration: 'weatherscope' }] } } },
        { name: 'fit', selector: { select: { mode: 'dropdown', options: [{ value: 'cover', label: T.e_cover }, { value: 'contain', label: T.e_contain }] } } },
        { name: 'zoom', selector: { number: { min: 0.5, max: 3, step: 0.1, mode: 'slider' } } },
        { name: 'frame', selector: { select: { mode: 'dropdown', options: [{ value: 'none', label: T.e_frame_none }, { value: 'glass', label: T.e_frame_glass }] } } },
        { name: 'header', selector: { boolean: {} } },
        { name: 'link', default: true, selector: { boolean: {} } },
      ];
      this._form.computeLabel = (s) => T[`e_${s.name}`] || s.name;
      this._form.computeHelper = (s) => T[`e_${s.name}_h`] || '';
    }
  }
  if (!customElements.get('weatherscope-card-editor')) customElements.define('weatherscope-card-editor', WeatherScopeCardEditor);

  if (!customElements.get('weatherscope-card')) customElements.define('weatherscope-card', WeatherScopeCard);
  window.customCards = window.customCards || [];
  if (!window.customCards.some((c) => c.type === 'weatherscope-card')) window.customCards.push({ type: 'weatherscope-card', name: lang0() === 'de' ? 'WeatherScope – Wetterkarte' : 'WeatherScope – Weather map', description: lang0() === 'de' ? 'Animierte Wetterkarten: Wetterradar, Satellit, Blitze, Wind, Regen und Temperatur.' : 'Animated weather maps: weather radar, satellite, lightning, wind, rain and temperature.', preview: true, documentationURL: 'https://github.com/candidiedm/weatherscope' });
  console.info(`%c WEATHERSCOPE %c ${VERSION} `, 'background:#2b7de0;color:#fff;border-radius:3px 0 0 3px', 'background:#444;color:#fff;border-radius:0 3px 3px 0');
})();
