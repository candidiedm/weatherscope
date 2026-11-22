/* WeatherScope weather cards: Now, Hourly, Daily, Value, Wind, Moon, Air, Warning, Sky. Every value can come from any weather entity or the user's own sensors. */
(() => {
  const VERSION = '0.12.7';

  // ---------------------------------------------------------------- shared
  const T = {
    de: {
      hi: 'H', lo: 'T', home: 'Zuhause', now: 'Jetzt', hourly: 'Stündlich', sunrise: 'Sonnenaufgang', sunset: 'Sonnenuntergang',
      m_temp: 'Temperatur ({u})', m_rain: 'Niederschlag ({u})', m_wind: 'Wind und Böen ({u})', max: 'max', loading: 'Vorhersage wird geladen …',
      e_entity: 'Wetter-Entität', e_temperature: 'Eigener Temperatursensor (optional)', e_name: 'Ortsname (optional)', e_background: 'Hintergrund',
      e_sky: 'Eigener Himmel', e_glass: 'Glas', e_none: 'Durchsichtig', e_temperature_h: 'Zum Beispiel die Außentemperatur deiner Wetterstation. Leer lassen, dann kommt sie von der Wetter-Entität.',
      e_background_h: '„Glas“ und „Durchsichtig“ passen zu einer Wetterseite mit der WeatherScope-Himmel-Animation dahinter.', e_wind_speed: 'Eigener Windsensor (optional)', e_wind_gust: 'Eigener Böensensor (optional)',
      e_wind_bearing: 'Eigener Windrichtungssensor (optional)', e_rain_rate: 'Eigener Regensensor (optional)', e_rain_rate_h: 'Regenrate der Wetterstation, z. B. mm/h. Ersetzt den Wert bei „Jetzt“.', e_hours: 'Stunden', e_mode: 'Ansicht beim Start', e_own_h: 'Eigene Sensoren ersetzen nur den Wert bei „Jetzt“.',
      n_wind: 'Wind', n_moon: 'Mond', n_air: 'Luftqualität', n_warning: 'Wetterwarnung', d_wind: 'Wind, Böen und Richtung mit Kompass.', d_moon: 'Mondphase mit Bild, Beleuchtung, Mondauf- und -untergang.', d_air: 'Luftqualität nach dem Europäischen Luftqualitätsindex.', d_warning: 'Amtliche Wetterwarnungen (DWD), nur sichtbar wenn aktiv.',
      w_wind: 'Wind', w_gust: 'Böen', w_dir: 'Richtung', dirs: ['N', 'NNO', 'NO', 'ONO', 'O', 'OSO', 'SO', 'SSO', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'],
      mp: { new_moon: 'Neumond', waxing_crescent: 'Zunehmende Sichel', first_quarter: 'Erstes Viertel', waxing_gibbous: 'Zunehmender Mond', full_moon: 'Vollmond', waning_gibbous: 'Abnehmender Mond', last_quarter: 'Letztes Viertel', waning_crescent: 'Abnehmende Sichel' },
      m_illum: 'Beleuchtung', m_rise: 'Mondaufgang', m_set: 'Monduntergang', m_full: 'Vollmond', m_in: (d) => (d < 1 ? 'heute' : d < 2 ? 'morgen' : `in ${Math.round(d)} Tagen`),
      aq: ['Gut', 'Ordentlich', 'Mäßig', 'Schlecht', 'Sehr schlecht', 'Extrem schlecht'], aq_main: (p) => `Hauptursache: ${p}`, aq_scale: 'Index nach EU-Skala', aq_idx: (v) => `Index ${v}`,
      wr_title: 'Wetterwarnung', wr_more: (n) => `+${n} weitere`, wr_none: 'Keine Warnungen', wr_until: (a, b) => `${a} bis ${b}`, wr_adv: 'Vorabinformation',
      e_wind_entity: 'Wetter-Entität', e_warning: 'Warnungs-Sensor (z. B. DWD „Aktuelle Warnstufe“)', e_advance: 'Vorwarnungs-Sensor (optional)', e_hide: 'Ausblenden, wenn keine Warnung', e_aqi: 'Eigener Luftqualitätsindex (optional, EU-Skala)', e_pm25: 'PM2,5 (optional)', e_pm10: 'PM10 (optional)', e_no2: 'NO₂ (optional)', e_o3: 'O₃ (optional)',
      n_now: 'Aktuell', n_hourly: 'Stündlich', n_daily: 'Tagesvorhersage', n_value: 'Wert (alle)', n_sky: 'Himmel-Animation', d_now: 'Ort, Temperatur, Wetterlage, Höchst- und Tiefstwert.', d_value: 'Einzelwert: Gefühlt, Sonne, UV-Index, Durchschnitt, Niederschlag, Sichtweite, Feuchtigkeit oder Luftdruck.',
      k_feels: 'Gefühlt', k_sun: 'Sonne', k_uv: 'UV-Index', k_normal: 'Durchschnitt', k_precip: 'Niederschlag', k_visibility: 'Sichtweite', k_humidity: 'Feuchtigkeit', k_pressure: 'Luftdruck',
      sunrise_l: 'Sonnenaufgang', sunset_l: 'Sonnenuntergang', actual: (v) => `Tatsächlich: ${v}`, f_colder: 'Fühlt sich kälter an als die tatsächliche Temperatur.', f_colder_wind: 'Fühlt sich durch den Wind kälter an.',
      f_warmer: 'Fühlt sich wärmer an als die tatsächliche Temperatur.', f_warmer_hum: 'Fühlt sich durch die Luftfeuchtigkeit wärmer an.', f_same: 'Ähnlich wie die tatsächliche Temperatur.',
      uv0: 'Niedrig', uv1: 'Mäßig', uv2: 'Hoch', uv3: 'Sehr hoch', uv4: 'Extrem', uv_low_day: 'Ganztägig niedrig.', uv_max: (v, l) => `Höchstwert heute: ${v} (${l}).`,
      n_above: 'über dem durchschnittlichen Tageshöchstwert', n_below: 'unter dem durchschnittlichen Tageshöchstwert', n_same: 'entspricht dem durchschnittlichen Tageshöchstwert', n_note: (a, b) => `<span class="nt"><span>Heute</span><b>H: ${a}</b><span>Durchschnitt</span><b>H: ${b}</b></span>`, n_none: 'Klimawerte werden geladen …',
      p_today: 'Heute', p_tomorrow: (v) => `Morgen ${v} erwartet.`, p_tomorrow0: 'Morgen kein Niederschlag erwartet.',
      v0: 'Nebel.', v1: 'Dunst.', v2: 'Leicht dunstig.', v3: 'Gute Sicht.', v4: 'Klare Sicht.', h_dew: (v) => `Der Taupunkt liegt bei ${v}.`,
      pr_up: 'steigend', pr_down: 'fallend', pr_same: 'gleichbleibend', pr_24: 'letzte 24 Std.',
      uv_protect: (a, b) => `Sonnenschutz von ${a} bis ${b} empfohlen`, uv_none: 'Kein Sonnenschutz nötig', uv_peak: (v, at) => `Höchstwert ${v} um ${at}`,
      rn_start: (at) => `Niederschlag ab ${at}`, rn_stop: (at) => `Hört gegen ${at} auf`, rn_none: (hh) => `Kein Niederschlag in den nächsten ${hh} Std.`, rn_cont: 'Hält an', rn_next: 'nächste Stunde',
      daylen: (h, m) => `Tageslänge ${h} Std. ${m} Min.`, dusk: (at) => `Dämmerung bis ${at}`, dawn: (at) => `Dämmerung ab ${at}`, golden: (at) => `Goldene Stunde ab ${at}`,
      e_size: 'Größe', e_small: 'Klein (4 × 3)', e_medium: 'Mittel (8 × 3)', e_size_h: 'Mittel zeigt bei UV, Niederschlag, Luftdruck und Sonne einen Verlauf.', e_kind: 'Wert', e_sensor: 'Eigener Sensor (optional)', e_sensor_h: 'Ersetzt den Hauptwert, z. B. von deiner Wetterstation.', e_sensor2: 'Zweiter eigener Sensor (optional)', e_sensor2_h: 'Gefühlt: tatsächliche Temperatur · Feuchtigkeit: Taupunkt.', today: 'Heute', days: (n) => `${n} Tage`, d_rain: 'Niederschlag', d_wind: 'Wind', e_days: 'Anzahl der Tage', e_link: 'Mit anderen Kacheln koppeln', e_link_h: 'Umschalten zwischen Temperatur, Niederschlag und Wind wirkt auf alle gekoppelten Kacheln der Seite.', d_daily: 'Tagesvorhersage: Temperatur, Niederschlag, Wind.', d_sky: 'Animierter Himmel als Hintergrund der ganzen Seite, passend zur Wetterlage.', e_test: 'Wetterlage testen (optional)', e_test_h: 'Zeigt dauerhaft diese Wetterlage – zum Ausprobieren. Für den Betrieb leer lassen.', e_fps: 'Bilder pro Sekunde', e_fps_h: 'Weniger Bilder schonen ältere Tablets.', d_hourly: 'Stündliche Vorhersage: Temperatur, Niederschlag, Wind.',
    },
    en: {
      hi: 'H', lo: 'L', home: 'Home', now: 'Now', hourly: 'Hourly', sunrise: 'Sunrise', sunset: 'Sunset',
      m_temp: 'Temperature ({u})', m_rain: 'Precipitation ({u})', m_wind: 'Wind and gusts ({u})', max: 'max', loading: 'Loading forecast …',
      e_entity: 'Weather entity', e_temperature: 'Own temperature sensor (optional)', e_name: 'Place name (optional)', e_background: 'Background',
      e_sky: 'Own sky', e_glass: 'Glass', e_none: 'Transparent', e_temperature_h: 'For example the outdoor temperature of your weather station. Leave empty to use the weather entity.',
      e_background_h: '“Glass” and “Transparent” suit a weather page with the WeatherScope sky animation behind it.', e_wind_speed: 'Own wind sensor (optional)', e_wind_gust: 'Own gust sensor (optional)',
      e_wind_bearing: 'Own wind direction sensor (optional)', e_rain_rate: 'Own rain sensor (optional)', e_rain_rate_h: 'Rain rate of your weather station, e.g. mm/h. Replaces the “Now” value.', e_hours: 'Hours', e_mode: 'View at start', e_own_h: 'Own sensors only replace the “Now” value.',
      n_wind: 'Wind', n_moon: 'Moon', n_air: 'Air quality', n_warning: 'Weather warning', d_wind: 'Wind, gusts and direction with compass.', d_moon: 'Moon phase with picture, illumination, moonrise and moonset.', d_air: 'Air quality on the European Air Quality Index.', d_warning: 'Official weather warnings (DWD), only visible when active.',
      w_wind: 'Wind', w_gust: 'Gusts', w_dir: 'Direction', dirs: ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'],
      mp: { new_moon: 'New moon', waxing_crescent: 'Waxing crescent', first_quarter: 'First quarter', waxing_gibbous: 'Waxing gibbous', full_moon: 'Full moon', waning_gibbous: 'Waning gibbous', last_quarter: 'Last quarter', waning_crescent: 'Waning crescent' },
      m_illum: 'Illumination', m_rise: 'Moonrise', m_set: 'Moonset', m_full: 'Full moon', m_in: (d) => (d < 1 ? 'today' : d < 2 ? 'tomorrow' : `in ${Math.round(d)} days`),
      aq: ['Good', 'Fair', 'Moderate', 'Poor', 'Very poor', 'Extremely poor'], aq_main: (p) => `Main pollutant: ${p}`, aq_scale: 'European index', aq_idx: (v) => `Index ${v}`,
      wr_title: 'Weather warning', wr_more: (n) => `+${n} more`, wr_none: 'No warnings', wr_until: (a, b) => `${a} to ${b}`, wr_adv: 'Advance notice',
      e_wind_entity: 'Weather entity', e_warning: 'Warning sensor (e.g. DWD “current warning level”)', e_advance: 'Advance warning sensor (optional)', e_hide: 'Hide when there is no warning', e_aqi: 'Own air quality index (optional, European scale)', e_pm25: 'PM2.5 (optional)', e_pm10: 'PM10 (optional)', e_no2: 'NO₂ (optional)', e_o3: 'O₃ (optional)',
      n_now: 'Now', n_hourly: 'Hourly', n_daily: 'Daily forecast', n_value: 'Value (all)', n_sky: 'Sky animation', d_now: 'Place, temperature, condition, high and low.', d_value: 'Single value: feels like, sun, UV index, average, precipitation, visibility, humidity or pressure.',
      k_feels: 'Feels like', k_sun: 'Sun', k_uv: 'UV index', k_normal: 'Average', k_precip: 'Precipitation', k_visibility: 'Visibility', k_humidity: 'Humidity', k_pressure: 'Pressure',
      sunrise_l: 'Sunrise', sunset_l: 'Sunset', actual: (v) => `Actual: ${v}`, f_colder: 'Feels colder than the actual temperature.', f_colder_wind: 'Wind makes it feel colder.',
      f_warmer: 'Feels warmer than the actual temperature.', f_warmer_hum: 'Humidity makes it feel warmer.', f_same: 'Similar to the actual temperature.',
      uv0: 'Low', uv1: 'Moderate', uv2: 'High', uv3: 'Very high', uv4: 'Extreme', uv_low_day: 'Low for the rest of the day.', uv_max: (v, l) => `Today's maximum: ${v} (${l}).`,
      n_above: 'above the average daily high', n_below: 'below the average daily high', n_same: 'equal to the average daily high', n_note: (a, b) => `<span class="nt"><span>Today</span><b>H: ${a}</b><span>Average</span><b>H: ${b}</b></span>`, n_none: 'Loading climate normals …',
      p_today: 'Today', p_tomorrow: (v) => `${v} expected tomorrow.`, p_tomorrow0: 'None expected tomorrow.',
      v0: 'Fog.', v1: 'Haze.', v2: 'Slightly hazy.', v3: 'Good visibility.', v4: 'Clear view.', h_dew: (v) => `The dew point is ${v} right now.`,
      pr_up: 'rising', pr_down: 'falling', pr_same: 'steady', pr_24: 'last 24 h',
      uv_protect: (a, b) => `Sun protection recommended ${a}–${b}`, uv_none: 'No sun protection needed', uv_peak: (v, at) => `Maximum ${v} at ${at}`,
      rn_start: (at) => `Precipitation from ${at}`, rn_stop: (at) => `Stopping around ${at}`, rn_none: (hh) => `No precipitation in the next ${hh} h`, rn_cont: 'Continuing', rn_next: 'next hour',
      daylen: (h, m) => `Day length ${h} h ${m} min`, dusk: (at) => `Dusk until ${at}`, dawn: (at) => `Dawn from ${at}`, golden: (at) => `Golden hour from ${at}`,
      e_size: 'Size', e_small: 'Small (4 × 3)', e_medium: 'Medium (8 × 3)', e_size_h: 'Medium shows a chart for UV, precipitation, pressure and sun.', e_kind: 'Value', e_sensor: 'Own sensor (optional)', e_sensor_h: 'Replaces the main value, e.g. from your weather station.', e_sensor2: 'Second own sensor (optional)', e_sensor2_h: 'Feels like: actual temperature · Humidity: dew point.', today: 'Today', days: (n) => `${n} days`, d_rain: 'Precipitation', d_wind: 'Wind', e_days: 'Number of days', e_link: 'Link with other cards', e_link_h: 'Switching between temperature, precipitation and wind applies to all linked cards on the page.', d_daily: 'Daily forecast: temperature, precipitation, wind.', d_sky: 'Animated sky as background of the whole page, matching the weather.', e_test: 'Test a condition (optional)', e_test_h: 'Always shows this condition – for trying out. Leave empty for normal use.', e_fps: 'Frames per second', e_fps_h: 'Fewer frames are easier on older tablets.', d_hourly: 'Hourly forecast: temperature, precipitation, wind.',
    },
  };
  const lang = (h) => ((h && ((h.locale && h.locale.language) || h.language)) || navigator.language || 'en').slice(0, 2);
  const tr = (h) => T[lang(h)] || T.en;
  const hass0 = () => { const e = document.querySelector('home-assistant'); return e && e.hass; };

  const SKY = {
    sunny: ['#3d8fe0', '#8cc4f2'], 'clear-night': ['#141d3a', '#2e3c6b'],
    partlycloudy: ['#6f86a6', '#a9b6c8'], cloudy: ['#6b7686', '#9aa3ae'], fog: ['#8a929b', '#b5bbc1'],
    rainy: ['#5d6672', '#8b939c'], pouring: ['#4a525d', '#727b86'], 'lightning-rainy': ['#3d4350', '#666d7a'], lightning: ['#3d4350', '#666d7a'],
    snowy: ['#9aa6b4', '#cdd5de'], 'snowy-rainy': ['#7f8995', '#aab2bb'], hail: ['#6b7380', '#959ca6'],
    windy: ['#6f86a6', '#a9b6c8'], 'windy-variant': ['#6f86a6', '#a9b6c8'], exceptional: ['#7a5a5a', '#a88a8a'],
  };
  const NIGHT = { partlycloudy: ['#1f2a44', '#3b4868'], cloudy: ['#262c38', '#454d5c'], rainy: ['#20252e', '#3b424e'], pouring: ['#1b2028', '#343a45'], snowy: ['#3a4250', '#5e6676'], fog: ['#2c3138', '#4b5058'] };
  const isNight = (h, s) => s.state === 'clear-night' || (h.states['sun.sun'] && h.states['sun.sun'].state === 'below_horizon');
  // design rules: see "WeatherScope Design-Regeln" – same background, type sizes, spacing for every card
  const bgCss = (h, s, bg) => {
    if (bg === 'none') return 'background:none;box-shadow:none;border:none';
    if (bg === 'glass') return 'background:rgba(32,62,112,.38);-webkit-backdrop-filter:blur(16px) saturate(170%);backdrop-filter:blur(16px) saturate(170%);border:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.12),inset 0 1px 0 rgba(255,255,255,.18)';
    const k = (isNight(h, s) && NIGHT[s.state]) || SKY[s.state] || SKY.partlycloudy;
    return `background:linear-gradient(180deg,${k[0]},${k[1]});border:none;box-shadow:none`;
  };
  const baseCss = (h, s, bg) => `
:host{display:block;height:100%}
ha-card{height:100%;box-sizing:border-box;padding:12px;border-radius:18px;color:#fff;overflow:hidden;display:flex;flex-direction:column;${bgCss(h, s, bg)}}
.lab{flex:none;display:flex;align-items:center;gap:4px;font-size:11px;font-weight:500;letter-spacing:.01em;text-transform:uppercase;color:rgba(255,255,255,.7);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lab ha-icon{--mdc-icon-size:13px}
.big{flex:none;font-size:30px;font-weight:400;line-height:1.15}
.sub{font-size:13px;font-weight:500;line-height:1.25}
.note{font-size:12px;color:rgba(255,255,255,.85);margin-top:auto}
.nt{display:grid;grid-template-columns:1fr auto;column-gap:8px}.nt span{color:rgba(255,255,255,.6)}.nt b{font-weight:600;color:#fff;text-align:right}
.dim{color:rgba(255,255,255,.7);font-size:13px}
`;

  // round graphics in small tiles (moon, compass, pressure gauge): same circle size and position everywhere
  const picCss = '.pic{flex:1;min-height:0;display:flex;align-items:center;justify-content:center}.pic svg{height:100%;max-height:96px;width:auto;display:block}';

  const ICON = {
    sunny: 'mdi:weather-sunny', 'clear-night': 'mdi:weather-night', partlycloudy: 'mdi:weather-partly-cloudy', cloudy: 'mdi:weather-cloudy',
    fog: 'mdi:weather-fog', rainy: 'mdi:weather-rainy', pouring: 'mdi:weather-pouring', lightning: 'mdi:weather-lightning',
    'lightning-rainy': 'mdi:weather-lightning-rainy', snowy: 'mdi:weather-snowy', 'snowy-rainy': 'mdi:weather-snowy-rainy', hail: 'mdi:weather-hail',
    windy: 'mdi:weather-windy', 'windy-variant': 'mdi:weather-windy-variant', exceptional: 'mdi:alert-circle-outline',
  };
  const icon = (c, day) => (day === false && c === 'partlycloudy' ? 'mdi:weather-night-partly-cloudy' : ICON[c] || 'mdi:weather-cloudy');

  // WeatherScope temperature scale (same as the map)
  const PAL_T = [[-50, [245, 238, 248]], [-45, [214, 181, 226]], [-40, [176, 124, 200]], [-35, [138, 85, 176]], [-30, [75, 42, 122]], [-25, [58, 58, 140]], [-20, [44, 74, 158]], [-15, [54, 100, 186]], [-10, [63, 127, 214]], [-0.01, [143, 208, 240]], [0.01, [92, 191, 140]], [8, [159, 211, 107]], [14, [227, 220, 85]], [20, [246, 177, 63]], [26, [239, 124, 53]], [32, [217, 68, 47]], [40, [142, 28, 58]], [45, [106, 15, 42]], [50, [70, 8, 28]], [55, [36, 4, 14]]];
  const tcolor = (v) => {
    const P = PAL_T; if (v <= P[0][0]) return `rgb(${P[0][1]})`;
    for (let k = 0; k < P.length - 1; k++) if (v <= P[k + 1][0]) { const f = (v - P[k][0]) / (P[k + 1][0] - P[k][0]); return `rgb(${P[k][1].map((q, z) => Math.round(q + (P[k + 1][1][z] - q) * f)).join(',')})`; }
    return `rgb(${P[P.length - 1][1]})`;
  };
  const num = (v) => (v === null || v === undefined || v === '' || isNaN(v) ? null : Number(v));
  const deg = (v) => { const n = num(v); if (n === null) return '–'; const r = Math.round(n); return `${r < 0 ? '−' : ''}${Math.abs(r)}°`; };
  const int = (v) => { const n = num(v); return n === null ? '–' : String(Math.round(n)); };
  const dec = (h, v, u) => { const n = num(v); if (n === null) return '–'; const f = u === 'in' ? 100 : 10; const r = n >= 10 ? Math.round(n) : Math.round(n * f) / f; return r.toLocaleString(lang(h)); };
  const hhmm = (h, d) => d.toLocaleTimeString(lang(h), { hour: '2-digit', minute: '2-digit' });
  // unit conversion, so own sensors fit the weather entity's units (set in Home Assistant)
  const toBase = { '°C': (v) => v, '°F': (v) => ((v - 32) * 5) / 9, K: (v) => v - 273.15,
    'km/h': (v) => v, 'm/s': (v) => v * 3.6, mph: (v) => v * 1.609344, kn: (v) => v * 1.852, 'ft/s': (v) => v * 1.09728,
    mm: (v) => v, cm: (v) => v * 10, in: (v) => v * 25.4 };
  const fromBase = { '°C': (v) => v, '°F': (v) => (v * 9) / 5 + 32, K: (v) => v + 273.15,
    'km/h': (v) => v, 'm/s': (v) => v / 3.6, mph: (v) => v / 1.609344, kn: (v) => v / 1.852, 'ft/s': (v) => v / 1.09728,
    mm: (v) => v, cm: (v) => v / 10, in: (v) => v / 25.4 };
  const conv = (v, from, to) => {
    if (v === null || !from || !to || from === to) return v;
    const f = from.replace(/\/h$/, ''), t = to.replace(/\/h$/, '');
    return toBase[f] && fromBase[t] ? fromBase[t](toBase[f](v)) : v;
  };
  const units = (s) => ({ t: s.attributes.temperature_unit || '°C', w: s.attributes.wind_speed_unit || 'km/h', p: s.attributes.precipitation_unit || 'mm' });
  const sensor = (h, id, unit) => {
    const e = id && h.states[id];
    if (!e) return null;
    return conv(num(e.state), e.attributes.unit_of_measurement, unit);
  };

  // base class: config, forecast subscription, re-render only on visible change
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

  class WSBase extends HTMLElement {
    setConfig(c) {
      this._c = Object.assign({}, this.constructor.defaults, c || {});
      this._fc = null; this._fcs = {};
      this._unsub();
      if (!this.shadowRoot) { this.attachShadow({ mode: 'open' }); this.shadowRoot.addEventListener('click', (e) => this._click(e)); }
      this._render();  this._sq();
    }
    set hass(h) { this._h = h; if (!this._sub) this._subscribe(); this._render(); }
    connectedCallback() {
      if (this._h) this._subscribe();
      // "link": switching temperature/rain/wind on one card switches the others on the page too
      this._onMode = (e) => { if (this._c && this._c.link !== false && (e.detail.entity === this._c.entity || e.detail.entity === '*') && e.detail.src !== this) { this._mode = e.detail.mode; this._render(); } };
      window.addEventListener('weatherscope-mode', this._onMode);
      this._sqro = new ResizeObserver(() => this._sq()); this._sqro.observe(this);
    }
    disconnectedCallback() { this._unsub(); window.removeEventListener('weatherscope-mode', this._onMode); if (this._sqro) this._sqro.disconnect(); }
    _grid() { return { columns: 4, rows: 3 }; }
    getGridOptions() { return this._grid(); }
    _sq() { if (this._c) sqFit(this, this._c, this._grid()); }
    _click() {}
    _setMode(m) {
      this._mode = m; this._render();
      if (this._c.link !== false) window.dispatchEvent(new CustomEvent('weatherscope-mode', { detail: { entity: this._c.entity, mode: m, src: this } }));
    }
    _unsub() { (this._subs || []).forEach((p) => p.then((u) => u && u()).catch(() => {})); this._subs = null; this._sub = null; }
    _subscribe() {
      const h = this._h, e = this._c && this._c.entity, types = [].concat(this.constructor.forecast || []);
      if (!types.length || !h || !e || !h.states[e] || this._sub || !h.connection) return;
      this._sub = true;
      this._subs = types.map((type, k) => h.connection.subscribeMessage((m) => {
        this._fcs[type] = m.forecast || [];
        if (k === 0) this._fc = this._fcs[type];
        this._render();
      }, { type: 'weather/subscribe_forecast', forecast_type: type, entity_id: e }).catch(() => null));
    }
    _put(html) { if (html !== this._last) { this._last = html; this._paint(html); } }
    _paint(html) { this.shadowRoot.innerHTML = html; }
    _render() {
      if (!this.shadowRoot || !this._c || !this._h) return;
      const s = this._h.states[this._c.entity];
      if (!s) { this._put(`<ha-card style="padding:16px">${this._c.entity || ''} ?</ha-card>`); return; }
      this._put(this._html(this._h, s, tr(this._h)));
    }
    static getStubConfig(h) {
      const ids = Object.keys(h.states);
      return { entity: ids.includes('weather.weatherscope') ? 'weather.weatherscope' : ids.find((e) => e.startsWith('weather.')) || 'weather.weatherscope' };
    }
  }

  // true while the dashboard is in edit mode
  const lovelaceEdit = () => !!document.querySelector('home-assistant')?.shadowRoot?.querySelector('home-assistant-main')?.shadowRoot?.querySelector('ha-panel-lovelace')?.lovelace?.editMode;

  // generic visual editor built from a schema
  const makeEditor = (schemaFn, helpers) => class extends HTMLElement {
    setConfig(c) { this._c = c; this._r(); }
    set hass(h) { this._h = h; this._r(); }
    _r() {
      if (!this._h || !this._c) return;
      const t = tr(this._h);
      if (!this._f) {
        this._f = document.createElement('ha-form');
        this._f.computeLabel = (s) => t[`e_${s.name}`] || s.name;
        this._f.computeHelper = (s) => (helpers[s.name] ? t[helpers[s.name]] : '');
        this._f.addEventListener('value-changed', (ev) => this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: ev.detail.value }, bubbles: true, composed: true })));
        this.appendChild(this._f);
      }
      this._f.schema = schemaFn(t);
      this._f.hass = this._h;
      this._f.data = this._c;
    }
  };
  const bgSchema = (t) => ({ name: 'background', selector: { select: { mode: 'dropdown', options: [{ value: 'sky', label: t.e_sky }, { value: 'glass', label: t.e_glass }, { value: 'none', label: t.e_none }] } } });
  const sensorSel = (dc) => ({ selector: { entity: { domain: 'sensor', ...(dc ? { device_class: dc } : {}) } } });

  const register = (tag, cls, editor, name, descKey) => {
    if (!customElements.get(tag)) customElements.define(tag, cls);
    if (!customElements.get(`${tag}-editor`)) customElements.define(`${tag}-editor`, editor);
    cls.getConfigElement = () => document.createElement(`${tag}-editor`);
    window.customCards = window.customCards || [];
    if (!window.customCards.some((c) => c.type === tag)) {
      window.customCards.push({ type: tag, name, description: tr(hass0())[descKey], preview: true, documentationURL: 'https://github.com/candidiedm/weatherscope' });
    }
  };

  // ---------------------------------------------------------------- Now
  class NowCard extends WSBase {
    static defaults = { entity: 'weather.weatherscope', background: 'sky' };
    static forecast = 'daily';
    getCardSize() { return 3; }
    _grid() { return { columns: 'full', rows: 'auto' }; }
    _html(h, s, t) {
      const temp = sensor(h, this._c.temperature, units(s).t) ?? s.attributes.temperature;
      const cond = h.formatEntityState ? h.formatEntityState(s) : s.state;
      const today = (this._fc || [])[0];
      const name = this._c.name || (h.config && h.config.location_name) || t.home;
      return `
<style>${baseCss(h, s, this._c.background)}
:host{container-type:inline-size}
ha-card{align-items:center;justify-content:center;text-align:center;padding:16px 12px}
/* page header: the one exception to the four type sizes (design rules) */
.o{font-size:22px;font-weight:400;text-shadow:0 1px 3px rgba(0,0,0,.25)}
.t{font-size:88px;font-weight:var(--ws-temp-weight,300);line-height:1;margin:2px 0 0 .12em;text-shadow:0 1px 4px rgba(0,0,0,.2)}
.c{font-size:17px;font-weight:500;margin-top:4px}
.h{font-size:15px;opacity:.9;margin-top:2px}
@container (max-width:260px){.t{font-size:64px}}
</style>
<ha-card><div class="o">${name}</div><div class="t">${deg(temp)}</div><div class="c">${cond}</div>
<div class="h">${today ? `${t.hi}: ${deg(today.temperature)} ${t.lo}: ${deg(today.templow)}` : '&nbsp;'}</div></ha-card>`;
    }
  }
  register('weatherscope-now-card', NowCard, makeEditor((t) => [
    { name: 'entity', required: true, selector: { entity: { domain: 'weather' } } },
    { name: 'temperature', ...sensorSel('temperature') },
    { name: 'name', selector: { text: {} } },
    bgSchema(t),
  ], { temperature: 'e_temperature_h', background: 'e_background_h' }), `WeatherScope – ${tr(hass0()).n_now}`, 'd_now');

  // ---------------------------------------------------------------- Hourly
  class HourlyCard extends WSBase {
    static defaults = { entity: 'weather.weatherscope', background: 'sky', hours: 24, mode: 'temp', link: true };
    static forecast = 'hourly';
    getCardSize() { return 3; }
    // fixed height in every view (design rules)
    _grid() { return { columns: 16, rows: 3, min_columns: 8, min_rows: 3 }; }
    _click(e) {
      const b = e.composedPath().find((x) => x.dataset && x.dataset.mode);
      if (b) this._setMode(b.dataset.mode);
    }
    // keep the scroll position when the content is replaced
    _paint(html) {
      const old = this.shadowRoot.querySelector('.hours'), x = old ? old.scrollLeft : 0;
      this.shadowRoot.innerHTML = html;
      const hrs = this.shadowRoot.querySelector('.hours');
      if (hrs) {
        hrs.scrollLeft = x;
        hrs.addEventListener('wheel', (ev) => { if (Math.abs(ev.deltaY) > Math.abs(ev.deltaX)) { hrs.scrollLeft += ev.deltaY; ev.preventDefault(); } }, { passive: false });
      }
    }
    _html(h, s, t) {
      const M = this._mode || this._c.mode || 'temp', c = this._c, U = units(s);
      const list = (this._fc || []).slice(0, Math.max(1, Math.min(48, Number(c.hours) || 24)));
      const sun = h.states['sun.sun'];
      const evs = sun && sun.attributes.next_rising
        ? [[new Date(sun.attributes.next_setting), 'mdi:weather-sunset-down', t.sunset], [new Date(sun.attributes.next_rising), 'mdi:weather-sunset-up', t.sunrise]]
        : [];
      const rmax = Math.max(conv(4, 'mm', U.p), ...list.map((f) => f.precipitation || 0));
      // every hour has the same four rows: time · picture · value · extra
      const cell = (f, i) => {
        const d = new Date(f.datetime), tm = `<span class="tm">${i === 0 ? t.now : hhmm(h, d)}</span>`;
        const pp = num(f.precipitation_probability);
        if (M === 'rain') {
          const mm = (i === 0 ? sensor(h, c.rain_rate, U.p) : null) ?? f.precipitation ?? 0, hgt = mm > 0 ? Math.max(6, Math.min(100, (mm / rmax) * 100)) : 0;
          return `<div class="h">${tm}<span class="vb"><i style="height:${hgt}%"></i></span><span class="v">${dec(h, mm, U.p)}</span><span class="x pp">${pp === null ? '' : `${Math.round(pp)} %`}</span></div>`;
        }
        if (M === 'wind') {
          const ws = i === 0 ? sensor(h, c.wind_speed, U.w) ?? f.wind_speed : f.wind_speed;
          const wg = i === 0 ? sensor(h, c.wind_gust, U.w) ?? f.wind_gust_speed : f.wind_gust_speed;
          const wb = i === 0 ? sensor(h, c.wind_bearing) ?? f.wind_bearing : f.wind_bearing;
          return `<div class="h">${tm}<ha-icon icon="mdi:navigation" style="transform:rotate(${(num(wb) || 0) + 180}deg)"></ha-icon><span class="v">${int(ws)}</span><span class="x">${wg === null || wg === undefined ? '' : `${t.max} ${int(wg)}`}</span></div>`;
        }
        const temp = i === 0 ? sensor(h, c.temperature, U.t) ?? f.temperature : f.temperature;
        return `<div class="h">${tm}<ha-icon icon="${icon(f.condition, f.is_daytime)}"></ha-icon><span class="v">${deg(temp)}</span><span class="x pp">${pp !== null && pp >= 20 ? `${Math.round(pp)} %` : ''}</span></div>`;
      };
      const ev = (e) => `<div class="h ev"><span class="tm">${hhmm(h, e[0])}</span><ha-icon icon="${e[1]}"></ha-icon><span class="v">${e[2]}</span><span class="x"></span></div>`;
      const cells = list.map((f, i) => {
        const d0 = new Date(f.datetime), d1 = new Date(d0.getTime() + 36e5);
        return cell(f, i) + evs.filter((e) => e[0] >= d0 && e[0] < d1).map(ev).join('');
      }).join('');
      const btn = (m, ic) => `<button data-mode="${m}" class="${M === m ? 'on' : ''}" aria-label="${t[`m_${m}`].replace(' ({u})', '')}"><ha-icon icon="${ic}"></ha-icon></button>`;
      const unit = { temp: U.t, rain: U.p, wind: U.w }[M];
      return `
<style>${baseCss(h, s, c.background)}
.hd{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px}
.mode{font-size:12px;font-weight:500;margin-top:3px}
.seg{display:flex;gap:2px;background:rgba(0,0,0,.18);border-radius:999px;padding:3px}
.seg button{all:unset;cursor:pointer;width:34px;height:24px;border-radius:999px;display:flex;align-items:center;justify-content:center;color:rgba(235,240,255,.7)}
.seg button.on{background:rgba(255,255,255,.28);color:#fff}.seg ha-icon{--mdc-icon-size:16px}
.hours{flex:1;display:flex;gap:2px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;align-items:center}.hours::-webkit-scrollbar{display:none}
.h{flex:0 0 52px;display:grid;grid-template-rows:16px 34px 18px 14px;row-gap:6px;justify-items:center;align-items:center}
.h .tm{font-size:12px;font-weight:600}
.h ha-icon{--mdc-icon-size:24px}
.h .v{font-size:15px;font-weight:600;white-space:nowrap}
.h .x{font-size:12px;font-weight:600;color:rgba(255,255,255,.85);text-shadow:0 1px 2px rgba(0,0,0,.35);white-space:nowrap}
.h .x.pp{color:#bfe9ff}
.h.ev{flex:0 0 auto;padding:0 8px;color:#ffe7a3}.h.ev .v{font-size:15px}
.vb{width:14px;height:34px;border-radius:4px;background:rgba(0,0,0,.2);position:relative;overflow:hidden}
.vb i{position:absolute;left:0;right:0;bottom:0;background:#5ac8fa}
</style>
<ha-card>
  <div class="hd"><div><div class="lab"><ha-icon icon="mdi:clock-outline"></ha-icon>${t.hourly}</div><div class="mode">${t[`m_${M}`].replace('{u}', unit)}</div></div>
  <div class="seg">${btn('temp', 'mdi:thermometer')}${btn('rain', 'mdi:water')}${btn('wind', 'mdi:weather-windy')}</div></div>
  <div class="hours">${cells || `<span class="dim">${t.loading}</span>`}</div>
</ha-card>`;
    }
  }
  register('weatherscope-hourly-card', HourlyCard, makeEditor((t) => [
    { name: 'entity', required: true, selector: { entity: { domain: 'weather' } } },
    { name: 'mode', selector: { select: { mode: 'dropdown', options: [{ value: 'temp', label: t.m_temp.replace(' ({u})', '') }, { value: 'rain', label: t.m_rain.replace(' ({u})', '') }, { value: 'wind', label: t.m_wind.replace(' ({u})', '') }] } } },
    { name: 'hours', selector: { number: { min: 6, max: 48, step: 1, mode: 'box' } } },
    { name: 'link', selector: { boolean: {} } },
    { name: 'temperature', ...sensorSel('temperature') },
    { name: 'wind_speed', ...sensorSel('wind_speed') },
    { name: 'wind_gust', ...sensorSel('wind_speed') },
    { name: 'wind_bearing', ...sensorSel() },
    { name: 'rain_rate', ...sensorSel() },
    bgSchema(t),
  ], { link: 'e_link_h', temperature: 'e_own_h', rain_rate: 'e_rain_rate_h', background: 'e_background_h' }), `WeatherScope – ${tr(hass0()).n_hourly}`, 'd_hourly');

  // ---------------------------------------------------------------- Daily
  const ROW = 36; // minimum row height (px)
  const isSnow = (c) => c === 'snowy' || c === 'snowy-rainy' || c === 'hail';
  class DailyCard extends WSBase {
    static defaults = { entity: 'weather.weatherscope', background: 'sky', days: 10, mode: 'temp', link: true };
    static forecast = ['daily', 'hourly'];
    getCardSize() { return 6; }
    _grid() { return { columns: 8, rows: 9, min_columns: 6, min_rows: 4 }; }
    connectedCallback() {
      super.connectedCallback();
      // how many rows fit decides how many days are shown (the card never grows)
      this._ro = new ResizeObserver(() => { const l = this.shadowRoot && this.shadowRoot.querySelector('.list'); const f = l ? Math.max(1, Math.floor(l.clientHeight / ROW)) : 0; if (f && f !== this._fit) { this._fit = f; this._last = null; this._render(); } });
      this._ro.observe(this);
    }
    disconnectedCallback() { super.disconnectedCallback(); if (this._ro) this._ro.disconnect(); }
    _click(e) { const b = e.composedPath().find((x) => x.dataset && x.dataset.mode); if (b) this._setMode(b.dataset.mode); }
    _paint(html) { super._paint(html); if (!this._fit) { const l = this.shadowRoot.querySelector('.list'); if (l && l.clientHeight) { this._fit = Math.max(1, Math.floor(l.clientHeight / ROW)); this._last = null; this._render(); } } }
    _html(h, s, t) {
      const c = this._c, M = this._mode || c.mode || 'temp', U = units(s), L = lang(h);
      const all = this._fcs.daily || [], hourly = this._fcs.hourly || [];
      const n = Math.min(all.length, Math.max(1, Number(c.days) || 10), this._fit || 99);
      const days = all.slice(0, n);
      const dayStart = (f) => { const d = new Date(f.datetime); d.setHours(0, 0, 0, 0); return d.getTime(); };
      const hoursOf = (f) => { const a = dayStart(f), b = a + 864e5; return hourly.filter((x) => { const q = new Date(x.datetime).getTime(); return q >= a && q < b; }); };
      const name = (f, i) => (i === 0 ? t.today : new Date(f.datetime).toLocaleDateString(L, { weekday: 'short' }).replace('.', ''));
      const now = Date.now();
      let rows = '';
      if (M === 'temp') {
        const lo = Math.min(...days.map((f) => num(f.templow) ?? num(f.temperature) ?? 99)), hi = Math.max(...days.map((f) => num(f.temperature) ?? -99));
        const span = Math.max(1, hi - lo), pos = (v) => ((v - lo) / span) * 100;
        const cur = sensor(h, c.temperature, U.t) ?? num(s.attributes.temperature);
        const tC = (v) => tcolor(conv(v, U.t, '°C'));
        rows = days.map((f, i) => {
          const a = num(f.templow) ?? num(f.temperature), b = num(f.temperature), pp = num(f.precipitation_probability);
          const bar = a === null || b === null ? '' : `<b style="left:${pos(a)}%;right:${100 - pos(b)}%;background:linear-gradient(90deg,${tC(a)},${tC(b)})"></b>`;
          const dot = i === 0 && cur !== null && a !== null ? `<span class="dot" style="left:${Math.max(0, Math.min(100, pos(cur)))}%"></span>` : '';
          return `<div class="r"><span class="dn">${name(f, i)}</span><span class="ic"><ha-icon icon="${icon(f.condition)}"></ha-icon><small>${pp !== null && pp >= 20 ? `${Math.round(pp)} %` : ''}</small></span><span class="lo">${deg(a)}</span><span class="tr">${bar}${dot}</span><span class="hi">${deg(b)}</span></div>`;
        }).join('');
      } else if (M === 'rain') {
        const buckets = days.map((f) => { const hs = hoursOf(f); if (!hs.length) return null; const B = Array.from({ length: 8 }, () => ({ v: 0, snow: false })); hs.forEach((x) => { const k = Math.floor(new Date(x.datetime).getHours() / 3); B[k].v += num(x.precipitation) || 0; if (isSnow(x.condition)) B[k].snow = true; }); return B; });
        const bmax = Math.max(conv(2, 'mm', U.p), ...buckets.flat().filter(Boolean).map((q) => q.v));
        const dmax = Math.max(conv(5, 'mm', U.p), ...days.map((f) => num(f.precipitation) || 0));
        rows = days.map((f, i) => {
          const mm = num(f.precipitation), pp = num(f.precipitation_probability), dry = !(mm > 0) && !(pp > 0), B = buckets[i];
          const viz = B
            ? `<span class="bk">${B.map((q) => `<i><b style="height:${q.v > 0 ? Math.max(12, Math.min(100, (q.v / bmax) * 100)) : 0}%;background:${q.snow ? '#fff' : '#5ac8fa'}"></b></i>`).join('')}</span>`
            : `<span class="tr"><b style="left:0;right:${100 - Math.min(100, ((mm || 0) / dmax) * 100)}%;background:${isSnow(f.condition) ? '#fff' : '#5ac8fa'}"></b></span>`;
          return `<div class="r rn${dry ? ' dry' : ''}"><span class="dn">${name(f, i)}</span>${viz}<span class="am">${mm === null ? '–' : `${dec(h, mm, U.p)} ${U.p}`}</span><span class="pb">${pp === null ? '' : `<ha-icon icon="${isSnow(f.condition) ? 'mdi:snowflake' : 'mdi:water'}"></ha-icon>${Math.round(pp)} %`}</span></div>`;
        }).join('');
      } else {
        const hsAll = days.map(hoursOf);
        const gmax = Math.max(conv(20, 'km/h', U.w), ...hsAll.flat().map((x) => num(x.wind_gust_speed) ?? num(x.wind_speed) ?? 0), ...days.map((f) => num(f.wind_gust_speed) ?? num(f.wind_speed) ?? 0));
        const W = 120, H = 22, y = (v) => H - 2 - (Math.min(v, gmax) / gmax) * (H - 4);
        rows = days.map((f, i) => {
          const hs = hsAll[i];
          let viz, lo, hi;
          if (hs.length >= 4) {
            const a = dayStart(f), X = (x) => ((new Date(x.datetime).getTime() - a) / 864e5) * W;
            const sp = hs.map((x) => [X(x), num(x.wind_speed) || 0]), gs = hs.map((x) => [X(x), num(x.wind_gust_speed) ?? num(x.wind_speed) ?? 0]);
            const line = sp.map(([px, v], k) => `${k ? 'L' : 'M'}${px.toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
            const band = gs.map(([px, v], k) => `${k ? 'L' : 'M'}${px.toFixed(1)} ${y(v).toFixed(1)}`).join(' ') + ' ' + sp.slice().reverse().map(([px, v]) => `L${px.toFixed(1)} ${y(v).toFixed(1)}`).join(' ') + ' Z';
            const dayH = hs.filter((x) => x.is_daytime), d0 = dayH.length ? X(dayH[0]) : W * 0.3, d1 = dayH.length ? X(dayH[dayH.length - 1]) : W * 0.7;
            const nx = i === 0 && now >= a && now < a + 864e5 ? ((now - a) / 864e5) * W : null, nv = nx === null ? null : (sp.reduce((p, q) => (Math.abs(q[0] - nx) < Math.abs(p[0] - nx) ? q : p))[1]);
            viz = `<svg class="wc" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><rect x="0" y="0" width="${W}" height="${H}" rx="3" fill="rgba(0,0,0,.18)"/><rect x="${d0}" y="0" width="${Math.max(0, d1 - d0)}" height="${H}" fill="rgba(255,255,255,.08)"/><path d="${band}" fill="rgba(127,212,255,.3)"/><path d="${line}" fill="none" stroke="#7fd4ff" stroke-width="1.6" vector-effect="non-scaling-stroke"/>${nx === null ? '' : `<circle cx="${nx}" cy="${y(nv)}" r="2.6" fill="#fff"/>`}</svg>`;
            lo = Math.min(...sp.map((q) => q[1])); hi = Math.max(...gs.map((q) => q[1]));
          } else {
            lo = 0; hi = num(f.wind_gust_speed) ?? num(f.wind_speed);
            viz = `<span class="tr"><b style="left:0;right:${100 - Math.min(100, ((hi || 0) / gmax) * 100)}%;background:#7fd4ff"></b></span>`;
            if (num(f.wind_gust_speed) === null) lo = null;
          }
          return `<div class="r wn"><span class="dn">${name(f, i)}</span>${viz}<span class="am">${lo === null ? '' : `${int(lo)}–`}${int(hi)}</span></div>`;
        }).join('');
      }
      const btn = (m, ic) => `<button data-mode="${m}" class="${M === m ? 'on' : ''}" aria-label="${t[`m_${m}`].replace(' ({u})', '')}"><ha-icon icon="${ic}"></ha-icon></button>`;
      const sub = M === 'rain' ? ` · ${t.d_rain} (${U.p})` : M === 'wind' ? ` · ${t.d_wind} (${U.w})` : '';
      return `
<style>${baseCss(h, s, c.background)}
.hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
.seg{display:flex;gap:2px;background:rgba(0,0,0,.18);border-radius:999px;padding:3px}
.seg button{all:unset;cursor:pointer;width:34px;height:24px;border-radius:999px;display:flex;align-items:center;justify-content:center;color:rgba(235,240,255,.7)}
.seg button.on{background:rgba(255,255,255,.28);color:#fff}.seg ha-icon{--mdc-icon-size:16px}
.list{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden}
.r{flex:1 1 0;min-height:${ROW}px;display:grid;grid-template-columns:48px 34px 36px 1fr 36px;align-items:center;border-top:1px solid rgba(255,255,255,.12);font-size:15px;font-weight:600}
.r:first-child{border-top:none}
.dn{white-space:nowrap}
.ic{display:flex;flex-direction:column;align-items:center;line-height:1}.ic ha-icon{--mdc-icon-size:22px}.ic small{font-size:12px;font-weight:600;color:#bfe9ff;min-height:0}
.lo{text-align:right;padding-right:8px;color:rgba(255,255,255,.7)}.hi{text-align:left;padding-left:8px}
.tr{height:6px;border-radius:3px;background:rgba(0,0,0,.22);position:relative}
.tr b{position:absolute;top:0;bottom:0;border-radius:3px}
.dot{position:absolute;top:-3px;width:8px;height:8px;border-radius:50%;background:#fff;border:2px solid rgba(20,40,80,.6);transform:translateX(-50%)}
.r.rn{grid-template-columns:48px 1fr 68px 58px}.r.wn{grid-template-columns:48px 1fr 76px}
.bk{display:flex;gap:3px;height:22px;align-items:stretch}.bk i{flex:1;border-radius:2px;background:rgba(0,0,0,.2);position:relative;overflow:hidden}.bk i b{position:absolute;left:0;right:0;bottom:0}
.am{text-align:right;white-space:nowrap}.pb{text-align:right;font-size:12px;color:#bfe9ff;white-space:nowrap}.pb ha-icon{--mdc-icon-size:12px;margin-right:2px;vertical-align:-1px}
.r.dry .am,.r.dry .pb{color:rgba(255,255,255,.45)}
.wc{width:100%;height:22px;display:block}
</style>
<ha-card>
  <div class="hd"><div class="lab"><ha-icon icon="mdi:calendar-month-outline"></ha-icon>${t.days(n || Number(c.days) || 10)}${sub}</div>
  <div class="seg">${btn('temp', 'mdi:thermometer')}${btn('rain', 'mdi:water')}${btn('wind', 'mdi:weather-windy')}</div></div>
  <div class="list">${rows || `<span class="dim">${t.loading}</span>`}</div>
</ha-card>`;
    }
  }
  register('weatherscope-daily-card', DailyCard, makeEditor((t) => [
    { name: 'entity', required: true, selector: { entity: { domain: 'weather' } } },
    { name: 'days', selector: { number: { min: 3, max: 16, step: 1, mode: 'box' } } },
    { name: 'mode', selector: { select: { mode: 'dropdown', options: [{ value: 'temp', label: t.m_temp.replace(' ({u})', '') }, { value: 'rain', label: t.m_rain.replace(' ({u})', '') }, { value: 'wind', label: t.m_wind.replace(' ({u})', '') }] } } },
    { name: 'link', selector: { boolean: {} } },
    { name: 'temperature', ...sensorSel('temperature') },
    bgSchema(t),
  ], { link: 'e_link_h', temperature: 'e_own_h', background: 'e_background_h' }), `WeatherScope – ${tr(hass0()).n_daily}`, 'd_daily');

  // ---------------------------------------------------------------- Value (small tiles)
  // WHO UV index colours (INTERSUN): green, yellow, orange, red, violet
  const UVC = ['#3ea72d', '#fff300', '#f18b00', '#e53210', '#b567a4'];
  const uvStage = (v) => (v < 3 ? 0 : v < 6 ? 1 : v < 8 ? 2 : v < 11 ? 3 : 4);
  // sunrise/sunset/twilight times (SunCalc formulas)
  const sunTimes = (date, lat, lng, angle) => {
    const rad = Math.PI / 180, day = 864e5, J1970 = 2440588, J2000 = 2451545, e = rad * 23.4397;
    const d = date.valueOf() / day - 0.5 + J1970 - J2000, lw = rad * -lng, phi = rad * lat;
    const n = Math.round(d - 0.0009 - lw / (2 * Math.PI)), ds = 0.0009 + lw / (2 * Math.PI) + n;
    const M = rad * (357.5291 + 0.98560028 * ds), L = M + rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M)) + rad * 102.9372 + Math.PI;
    const dec = Math.asin(Math.sin(e) * Math.sin(L)), Jnoon = J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
    const cosw = (Math.sin(angle * rad) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec));
    if (cosw < -1 || cosw > 1) return null;
    const w = Math.acos(cosw), Jset = J2000 + (0.0009 + (w + lw) / (2 * Math.PI) + n) + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L), Jrise = Jnoon - (Jset - Jnoon);
    const toDate = (j) => new Date((j + 0.5 - J1970) * day);
    return [toDate(Jrise), toDate(Jset)];
  };
  const KINDS = ['feels', 'sun', 'uv', 'normal', 'precip', 'visibility', 'humidity', 'pressure'];
  const KICON = { feels: 'mdi:thermometer', sun: 'mdi:weather-sunset', uv: 'mdi:sun-wireless-outline', normal: 'mdi:chart-bell-curve-cumulative', precip: 'mdi:water', visibility: 'mdi:eye-outline', humidity: 'mdi:water-percent', pressure: 'mdi:gauge' };
  class ValueCard extends WSBase {
    static defaults = { entity: 'weather.weatherscope', kind: 'feels', background: 'sky', size: 'small' };
    static forecast = ['daily', 'hourly'];
    static getStubConfig(h) { return { ...WSBase.getStubConfig(h), kind: 'feels' }; }
    getCardSize() { return 3; }
    _grid() { return this._c && this._c.size === 'medium' ? { columns: 8, rows: 3, min_columns: 6, min_rows: 3 } : { columns: 4, rows: 3, min_columns: 4, min_rows: 3 }; }
    connectedCallback() { super.connectedCallback(); this._tick = setInterval(() => { if (this._c && (this._c.kind === 'sun' || this._c.kind === 'pressure')) { this._last = null; this._render(); } }, 60000); }
    disconnectedCallback() { super.disconnectedCallback(); clearInterval(this._tick); }
    // pressure trend: change over the last 3 hours from the recorder
    async _trend(h, id, attr) {
      const key = `${id}|${Math.floor(Date.now() / 6e5)}`;
      if (this._trK === key || this._trBusy) return;
      this._trBusy = true;
      try {
        const start = new Date(Date.now() - 24 * 36e5).toISOString();
        const r = await h.callWS({ type: 'history/history_during_period', start_time: start, entity_ids: [id], minimal_response: !attr, no_attributes: !attr, significant_changes_only: false });
        const L = (r && r[id]) || [];
        const pts = L.map((q) => [(q.lu || q.lc || 0) * 1000 || new Date(q.last_updated || q.last_changed).getTime(), num(attr ? (q.a || q.attributes || {})[attr] : q.s ?? q.state)]).filter((q) => q[1] !== null && !isNaN(q[0]));
        this._series = pts;
        const t3 = Date.now() - 3 * 36e5; let v0 = null; for (const q of pts) { if (q[0] <= t3) v0 = q[1]; }
        this._trV = v0 ?? (pts[0] ? pts[0][1] : null); this._trK = key; this._last = null; this._render();
      } catch (e) { this._trK = key; } finally { this._trBusy = false; }
    }
    _html(h, s, t) {
      const c = this._c, K = KINDS.includes(c.kind) ? c.kind : 'feels', U = units(s), A = s.attributes, today = (this._fc || [])[0], tomorrow = (this._fc || [])[1];
      const own = (unit) => sensor(h, c.sensor, unit), own2 = (unit) => sensor(h, c.sensor2, unit);
      let label = t[`k_${K}`], ic = KICON[K], big = '–', sub = '', viz = '', note = '', chart = '';
      const med = c.size === 'medium', hourly = this._fcs.hourly || [], L = lang(h), now = Date.now();
      if (K === 'feels') {
        const f = own(U.t) ?? num(A.apparent_temperature), a = own2(U.t) ?? num(A.temperature);
        big = deg(f); sub = t.actual(deg(a));
        const d = f !== null && a !== null ? f - a : 0, wind = num(A.wind_speed), hum = num(A.humidity);
        note = d <= -1.5 ? (wind !== null && conv(wind, U.w, 'km/h') > 10 ? t.f_colder_wind : t.f_colder) : d >= 1.5 ? (hum !== null && hum > 60 && conv(a, U.t, '°C') > 20 ? t.f_warmer_hum : t.f_warmer) : t.f_same;
      } else if (K === 'sun') {
        const sun = h.states['sun.sun'], sa = sun ? sun.attributes : {}, rise = sa.next_rising ? new Date(sa.next_rising) : null, set = sa.next_setting ? new Date(sa.next_setting) : null;
        const up = sun && sun.state === 'above_horizon', next = up ? set : rise, other = up ? rise : set;
        label = up ? t.sunset_l : t.sunrise_l; ic = up ? 'mdi:weather-sunset-down' : 'mdi:weather-sunset-up';
        big = next ? hhmm(h, next) : '–'; note = other ? `${up ? t.sunrise_l : t.sunset_l}: ${hhmm(h, other)}` : '';
        // sun path over 24 h, centred on today's solar noon; the line is the horizon (depends on day length).
        // Calculated locally, so it does not depend on when sun.sun updates its next_* times.
        const lat0 = h.config.latitude, lng0 = h.config.longitude, noon0 = new Date(); noon0.setHours(12, 0, 0, 0);
        const rs0 = sunTimes(noon0, lat0, lng0, -0.833), mid = (d) => (d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60) / 1440;
        const dayLen = rs0 ? Math.max(0, Math.min(24, (rs0[1] - rs0[0]) / 36e5)) : (up ? 24 : 0);
        const xn = rs0 ? (mid(rs0[0]) + mid(rs0[1])) / 2 : 0.5;
        const W = 120, H = 40, yc = (x) => H / 2 - Math.cos(2 * Math.PI * (x - xn)) * (H / 2 - 4), hz = H / 2 - Math.cos(Math.PI * dayLen / 24) * (H / 2 - 4);
        const xf = mid(new Date()), yf = yc(xf);
        let path = ''; for (let k = 0; k <= 48; k++) { const x = k / 48; path += `${k ? 'L' : 'M'}${(x * W).toFixed(1)} ${yc(x).toFixed(1)}`; }
        const cid = `sc${Math.random().toString(36).slice(2, 7)}`;
        // the sun is an HTML dot on top of the stretched SVG, so it stays round at every tile size
        viz = `<div class="svw"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs><clipPath id="${cid}"><rect x="0" y="0" width="${W}" height="${hz}"/></clipPath></defs>
<path d="${path}" fill="none" stroke="rgba(0,0,0,.22)" stroke-width="2.5" vector-effect="non-scaling-stroke"/><path d="${path}" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="2" vector-effect="non-scaling-stroke" clip-path="url(#${cid})"/>
<line x1="0" x2="${W}" y1="${hz}" y2="${hz}" stroke="rgba(255,255,255,.35)" vector-effect="non-scaling-stroke"/></svg><i class="sd${yf > hz ? ' dn' : ''}" style="left:${(xf * 100).toFixed(2)}%;top:${((yf / H) * 100).toFixed(2)}%"></i></div>`;
        if (med) {
          const lat = h.config.latitude, lng = h.config.longitude, today0 = new Date(); today0.setHours(12, 0, 0, 0);
          const rs = sunTimes(today0, lat, lng, -0.833), tw = sunTimes(today0, lat, lng, -6), gh = sunTimes(today0, lat, lng, 6);
          chart = viz.replace('class="svw"', 'class="svw big"'); viz = '';
          const parts = [];
          if (rs) { const m = Math.round((rs[1] - rs[0]) / 6e4); parts.push(t.daylen(Math.floor(m / 60), m % 60)); }
          if (tw) parts.push(up || now > (rs ? rs[1].getTime() : 0) ? t.dusk(hhmm(h, tw[1])) : t.dawn(hhmm(h, tw[0])));
          if (gh && up) parts.push(t.golden(hhmm(h, gh[1])));
          sub = note; note = parts.join(' · ');
        }
      } else if (K === 'uv') {
        const v = own() ?? num(A.uv_index), st = v === null ? 0 : uvStage(v), mx = today ? num(today.uv_index) : null;
        big = v === null ? '–' : String(Math.round(v)); sub = v === null ? '' : t[`uv${st}`];
        const pos = v === null ? 0 : Math.min(100, (v / 12) * 100);
        // gradient that keeps every WHO stage in its own colour; blends only at the stage limits (0-12 scale)
        const UVG = 'linear-gradient(90deg,#3ea72d 0%,#3ea72d 22%,#fff300 28%,#fff300 47%,#f18b00 53%,#f18b00 64%,#e53210 70%,#e53210 89%,#b567a4 95%,#b567a4 100%)';
        viz = `<div class="uvb" style="background:${UVG}">${v === null ? '' : `<b style="left:${pos}%"></b>`}</div>`;
        note = mx === null ? '' : mx < 3 ? t.uv_low_day : t.uv_max(Math.round(mx), t[`uv${uvStage(mx)}`]);
        if (med) {
          const d0 = new Date(); d0.setHours(0, 0, 0, 0);
          let hs = hourly.filter((x) => { const q = new Date(x.datetime).getTime(); return q >= d0.getTime() && q < d0.getTime() + 864e5 && num(x.uv_index) !== null; });
          const on = hs.filter((x) => num(x.uv_index) >= 0.5);
          if (on.length) { const a = new Date(on[0].datetime).getTime() - 36e5, b = new Date(on[on.length - 1].datetime).getTime() + 36e5; hs = hs.filter((x) => { const q = new Date(x.datetime).getTime(); return q >= a && q <= b; }); }
          if (hs.length) {
            const rs = sunTimes(new Date(d0.getTime() + 432e5), h.config.latitude, h.config.longitude, -0.833);
            const a = rs ? Math.floor(rs[0].getTime() / 36e5) * 36e5 - 36e5 : new Date(hs[0].datetime).getTime(), b = rs ? Math.ceil(rs[1].getTime() / 36e5) * 36e5 + 36e5 : new Date(hs[hs.length - 1].datetime).getTime() + 36e5;
            const span = b - a, W = (36e5 / span) * 100, top = Math.max(8, ...hs.map((x) => num(x.uv_index)));
            let axis = ''; for (let q = a; q <= b; q += 36e5) { const hh = new Date(q).getHours(); if (hh % 3 === 0) axis += `<span class="ax" style="left:${((q - a) / span) * 100}%">${hh}</span>`; }
            const bars = hs.filter((x) => { const q = new Date(x.datetime).getTime(); return q >= a && q < b; }).map((x) => { const u = num(x.uv_index), q = new Date(x.datetime).getTime(); return `<div class="cb" style="left:${((q - a) / span) * 100}%;width:${W}%"><i style="height:${Math.max(3, (u / top) * 100)}%;background:${UVC[uvStage(u)]}"></i></div>`; }).join('');
            const nowX = ((now - a) / span) * 100;
            chart = `<div class="ch"><div class="base"></div>${bars}${axis}${nowX >= 0 && nowX <= 100 ? `<b class="nw" style="left:${nowX}%"></b>` : ''}</div>`;
            const pr = hs.filter((x) => num(x.uv_index) >= 3), pk = hs.reduce((p, q) => (num(q.uv_index) > num(p.uv_index) ? q : p));
            note = pr.length ? `${t.uv_protect(hhmm(h, new Date(pr[0].datetime)), hhmm(h, new Date(new Date(pr[pr.length - 1].datetime).getTime() + 36e5)))} · ${t.uv_peak(Math.round(num(pk.uv_index)), hhmm(h, new Date(pk.datetime)))}` : t.uv_none;
          }
        }
      } else if (K === 'normal') {
        const nid = c.sensor || 'sensor.weatherscope_normal_high', ns = h.states[nid];
        const nh = ns ? conv(num(ns.state), ns.attributes.unit_of_measurement, U.t) : null, th = today ? num(today.temperature) : null;
        if (nh === null || th === null) { big = '–'; note = t.n_none; } else {
          const d = Math.round(th - nh); big = `${d > 0 ? '+' : d < 0 ? '−' : '±'}${Math.abs(d)}°`; sub = d > 0 ? t.n_above : d < 0 ? t.n_below : t.n_same; note = t.n_note(deg(th), deg(nh));
        }
      } else if (K === 'precip') {
        const v = own(U.p) ?? (today ? num(today.precipitation) : null), tm = tomorrow ? num(tomorrow.precipitation) : null;
        big = v === null ? '–' : `${dec(h, v, U.p)} ${U.p}`; sub = t.p_today;
        note = tm === null ? '' : tm >= conv(0.1, 'mm', U.p) ? t.p_tomorrow(`${dec(h, tm, U.p)} ${U.p}`) : t.p_tomorrow0;
        if (med) {
          // 15-minute steps from WeatherScope, otherwise the next hours of the hourly forecast
          const nc = h.states[c.nowcast || 'sensor.weatherscope_precipitation_nowcast'];
          let steps = nc && Array.isArray(nc.attributes.steps) ? nc.attributes.steps.map((q) => [new Date(q[0]).getTime(), conv(num(q[1]) || 0, 'mm', U.p), 9e5]) : [];
          steps = steps.filter((q) => q[0] + q[2] > now);
          if (!steps.length) steps = hourly.filter((x) => new Date(x.datetime).getTime() + 36e5 > now).slice(0, 6).map((x) => [new Date(x.datetime).getTime(), num(x.precipitation) || 0, 36e5]);
          if (steps.length) {
            const wet = (q) => q[1] >= conv(0.05, 'mm', U.p), top = Math.max(conv(1, 'mm', U.p), ...steps.map((q) => q[1])), W = 100 / steps.length;
            const every = steps[0][2] < 36e5 ? 4 : 2;
            const bars = steps.map((q, k) => `<div class="cb slot" style="left:${k * W}%;width:${W}%"><em></em><i style="height:${q[1] > 0 ? Math.max(6, (q[1] / top) * 100) : 0}%;background:#5ac8fa"></i></div>${k % every === 0 ? `<span class="ax" style="left:${k * W}%">${hhmm(h, new Date(q[0]))}</span>` : ''}`).join('');
            chart = `<div class="ch">${bars}</div>`;
            const first = steps.find(wet), hh = Math.round((steps.length * steps[0][2]) / 36e5);
            if (!first) note = t.rn_none(hh);
            else if (first === steps[0]) { const stop = steps.find((q) => !wet(q)); note = stop ? t.rn_stop(hhmm(h, new Date(stop[0]))) : t.rn_cont; }
            else note = t.rn_start(hhmm(h, new Date(first[0])));
            const nh = steps.filter((q) => q[0] < now + 36e5).reduce((a, q) => a + q[1] * Math.min(1, q[2] / 36e5), 0);
            big = `${dec(h, nh, U.p)} ${U.p}`; sub = t.rn_next;
          }
        }
      } else if (K === 'visibility') {
        const vu = A.visibility_unit || 'km', v = own(vu) ?? num(A.visibility), km = v === null ? null : vu === 'mi' ? v * 1.609 : v;
        big = v === null ? '–' : `${dec(h, v)} ${vu}`;
        note = km === null ? '' : t[`v${km < 1 ? 0 : km < 4 ? 1 : km < 10 ? 2 : km < 20 ? 3 : 4}`];
      } else if (K === 'humidity') {
        const v = own() ?? num(A.humidity), dp = own2(U.t) ?? num(A.dew_point);
        big = v === null ? '–' : `${Math.round(v)} %`; note = dp === null ? '' : t.h_dew(deg(dp));
      } else if (K === 'pressure') {
        const pu = A.pressure_unit || 'hPa', v = c.sensor ? sensor(h, c.sensor, pu) : num(A.pressure);
        this._trend(h, c.sensor || c.entity, c.sensor ? null : 'pressure');
        const v0 = this._trV === null || this._trV === undefined ? null : c.sensor ? conv(this._trV, h.states[c.sensor] && h.states[c.sensor].attributes.unit_of_measurement, pu) : this._trV;
        const d = v !== null && v0 !== null ? v - v0 : 0, arrow = d > 1 ? 'mdi:arrow-up' : d < -1 ? 'mdi:arrow-down' : 'mdi:equal';
        const hpa = v === null ? 1013 : conv(v, pu === 'inHg' ? 'inHg' : pu, 'hPa') ?? v, f = Math.max(0, Math.min(1, ((pu === 'inHg' ? v * 33.8639 : hpa) - 960) / 90));
        const R = 34, cx = 60, cy = 42, a0 = Math.PI * 0.75, a1 = Math.PI * 2.25, ang = a0 + (a1 - a0) * f;
        let ticks = ''; for (let k = 0; k <= 30; k++) { const a = a0 + ((a1 - a0) * k) / 30; ticks += `<line x1="${cx + Math.cos(a) * (R - 6)}" y1="${cy + Math.sin(a) * (R - 6)}" x2="${cx + Math.cos(a) * R}" y2="${cy + Math.sin(a) * R}" stroke="rgba(255,255,255,.4)" stroke-width="1.4"/>`; }
        viz = `<svg class="gv" viewBox="0 0 120 88">${ticks}<line x1="${cx + Math.cos(ang) * (R - 9)}" y1="${cy + Math.sin(ang) * (R - 9)}" x2="${cx + Math.cos(ang) * (R + 1)}" y2="${cy + Math.sin(ang) * (R + 1)}" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/><text x="${cx}" y="${cy - 11}" text-anchor="middle" fill="#fff" font-size="11">${d > 1 ? '↑' : d < -1 ? '↓' : '='}</text><text x="${cx - 27}" y="${cy + 38}" text-anchor="middle" fill="rgba(255,255,255,.8)" font-size="10">↓</text><text x="${cx + 27}" y="${cy + 38}" text-anchor="middle" fill="rgba(255,255,255,.8)" font-size="10">↑</text><text x="${cx}" y="${cy + 4}" text-anchor="middle" fill="#fff" font-size="15" font-weight="600">${v === null ? '–' : pu === 'inHg' ? v.toFixed(2) : Math.round(v).toLocaleString(lang(h))}</text><text x="${cx}" y="${cy + 16}" text-anchor="middle" fill="rgba(255,255,255,.8)" font-size="10">${pu}</text></svg>`;
        big = ''; note = med ? `<ha-icon icon="${arrow}"></ha-icon> ${t[d > 1 ? 'pr_up' : d < -1 ? 'pr_down' : 'pr_same']}` : '';
        if (!med) {
          // small: crop to the gauge circle so it matches the moon; low/high marks sit at the two ends of the scale
          const ends = `<text x="${cx - 17}" y="${cy + 33}" text-anchor="middle" fill="rgba(255,255,255,.8)" font-size="9">↓</text><text x="${cx + 17}" y="${cy + 33}" text-anchor="middle" fill="rgba(255,255,255,.8)" font-size="9">↑</text>`;
          viz = `<div class="pic">${viz.replace(/<text[^>]*>↓<\/text><text[^>]*>↑<\/text>/, ends).replace('class="gv" viewBox="0 0 120 88"', `viewBox="${cx - 36.96} ${cy - 36.96} 73.92 73.92"`)}</div>`;
          note = '';
        }
        if (med && this._series && this._series.length > 1) {
          const P = this._series.map((q) => [q[0], c.sensor ? conv(q[1], h.states[c.sensor] && h.states[c.sensor].attributes.unit_of_measurement, pu) : q[1]]);
          const t0 = now - 24 * 36e5, lo = Math.min(...P.map((q) => q[1])), hi = Math.max(...P.map((q) => q[1])), pad = Math.max(1, (hi - lo) * 0.15);
          const X = (q) => Math.max(0, ((q - t0) / (24 * 36e5)) * 200), Y = (v) => 56 - ((v - (lo - pad)) / (hi - lo + 2 * pad)) * 52;
          const line = P.map((q, k) => `${k ? 'L' : 'M'}${X(q[0]).toFixed(1)} ${Y(q[1]).toFixed(1)}`).join(' ') + (v !== null ? ` L200 ${Y(v).toFixed(1)}` : '');
          const fmtp = (x) => (pu === 'inHg' ? x.toFixed(2) : Math.round(x).toLocaleString(L));
          chart = `<div class="pc"><svg viewBox="0 0 200 60" preserveAspectRatio="none"><path d="${line} L200 60 L0 60 Z" fill="rgba(127,212,255,.18)"/><path d="${line}" fill="none" stroke="#7fd4ff" stroke-width="2" vector-effect="non-scaling-stroke"/></svg><span class="hi">${fmtp(hi)}</span><span class="lo">${fmtp(lo)}</span><span class="ax">${t.pr_24}</span></div>`;
        }
      }
      return `
<style>${baseCss(h, s, c.background)}
.big{margin-top:6px}.sub{margin-top:2px}
.svw{position:relative;width:100%;height:40px;margin-top:6px}.svw svg{width:100%;height:100%;display:block}
.sd{position:absolute;width:8px;height:8px;border-radius:50%;background:#fff;transform:translate(-50%,-50%);box-shadow:0 0 6px 3px rgba(255,255,255,.5)}.sd.dn{background:rgba(0,0,0,.3);box-shadow:none}
.gv{width:100%;flex:1;min-height:0;max-height:118px;margin-top:2px;display:block}
${picCss}
.uvb{position:relative;height:6px;margin-top:10px;border-radius:3px}.uvb b{position:absolute;top:-3px;width:8px;height:8px;border-radius:50%;background:#fff;border:2px solid rgba(20,40,80,.6);transform:translateX(-50%)}
.note{line-height:1.3}.note ha-icon{--mdc-icon-size:13px;vertical-align:-2px}
.md{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,34%) minmax(0,1fr);gap:14px;align-items:stretch}
.ml{display:flex;flex-direction:column;min-width:0}.mr{position:relative;min-width:0;padding-top:6px}
.ch{position:absolute;inset:6px 0 16px 0}.cb{position:absolute;top:0;bottom:0;display:flex;justify-content:center}
.cb i{position:absolute;bottom:0;left:15%;right:15%;border-radius:3px 3px 1px 1px;display:block}
.cb.slot em{position:absolute;top:0;bottom:0;left:15%;right:15%;border-radius:3px;background:rgba(0,0,0,.18)}
.ch .ax{position:absolute;bottom:-16px;font-size:12px;color:rgba(255,255,255,.75);white-space:nowrap;transform:translateX(0)}
.ch .base{position:absolute;left:0;right:0;bottom:0;border-top:1px solid rgba(255,255,255,.25)}
.nw{position:absolute;top:-4px;bottom:0;border-left:1.5px dashed rgba(255,255,255,.85)}
.pc{position:absolute;inset:6px 0 4px 0}.pc svg{width:100%;height:100%;display:block}.pc span{position:absolute;right:0;font-size:12px;color:rgba(255,255,255,.75)}.pc .hi{top:0}.pc .lo{bottom:16px}.pc .ax{left:0;bottom:-2px;right:auto}
.svw.big{height:100%;min-height:60px;margin-top:0}
</style>
${med && chart
  ? `<ha-card><div class="lab"><ha-icon icon="${ic}"></ha-icon>${label}</div><div class="md"><div class="ml">${big ? `<div class="big">${big}</div>` : ''}${sub ? `<div class="sub">${sub}</div>` : ''}${viz}</div><div class="mr">${chart}</div></div><div class="note">${note}</div></ha-card>`
  : `<ha-card><div class="lab"><ha-icon icon="${ic}"></ha-icon>${label}</div>${big ? `<div class="big">${big}</div>` : ''}${sub ? `<div class="sub">${sub}</div>` : ''}${viz}<div class="note">${note}</div></ha-card>`}`;
    }
  }
  const valueEditor = makeEditor((t) => [
    { name: 'kind', required: true, selector: { select: { mode: 'dropdown', options: KINDS.map((k) => ({ value: k, label: t[`k_${k}`] })) } } },
    { name: 'size', selector: { select: { mode: 'dropdown', options: [{ value: 'small', label: t.e_small }, { value: 'medium', label: t.e_medium }] } } },
    { name: 'entity', required: true, selector: { entity: { domain: 'weather' } } },
    { name: 'sensor', ...sensorSel() },
    { name: 'sensor2', ...sensorSel() },
    bgSchema(t),
  ], { size: 'e_size_h', sensor: 'e_sensor_h', sensor2: 'e_sensor2_h', background: 'e_background_h' });
  register('weatherscope-value-card', ValueCard, valueEditor, `WeatherScope – ${tr(hass0()).n_value}`, 'd_value');
  // every value also as its own entry in the card picker (same card, preset value)
  KINDS.forEach((k) => {
    const Cls = class extends ValueCard {
      static defaults = { ...ValueCard.defaults, kind: k };
      static getStubConfig(h) { return { ...WSBase.getStubConfig(h), kind: k }; }
    };
    register(`weatherscope-${k}-card`, Cls, class extends valueEditor {}, `WeatherScope – ${tr(hass0())[`k_${k}`]}`, 'd_value');
  });

  // ---------------------------------------------------------------- shared row list (Wind, Moon)
  const rowsCss = `.md{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:center}
.rows{display:flex;flex-direction:column}.rw{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 0;border-top:1px solid rgba(255,255,255,.12);font-size:13px;font-weight:600;white-space:nowrap}
.rw:first-child{border-top:none}.rw span:last-child{color:rgba(255,255,255,.7);font-weight:500}`;
  const rowList = (L) => `<div class="rows">${L.map(([a, b]) => `<div class="rw"><span>${a}</span><span>${b}</span></div>`).join('')}</div>`;

  // ---------------------------------------------------------------- Wind
  class WindCard extends WSBase {
    static defaults = { entity: 'weather.weatherscope', background: 'sky', size: 'medium' };
    getCardSize() { return 3; }
    _grid() { return this._c && this._c.size === 'small' ? { columns: 4, rows: 3, min_columns: 4, min_rows: 3 } : { columns: 8, rows: 3, min_columns: 6, min_rows: 3 }; }
    _html(h, s, t) {
      const c = this._c, U = units(s), A = s.attributes;
      const ws = sensor(h, c.wind_speed, U.w) ?? num(A.wind_speed), wg = sensor(h, c.wind_gust, U.w) ?? num(A.wind_gust_speed), wb = sensor(h, c.wind_bearing) ?? num(A.wind_bearing);
      const dir = wb === null ? '–' : `${Math.round(wb)}° ${t.dirs[Math.round(wb / 22.5) % 16]}`;
      const R = 46, cx = 56, cy = 56;
      let ticks = ''; for (let k = 0; k < 72; k++) { const a = (k / 72) * 2 * Math.PI, l = k % 18 === 0 ? 7 : k % 2 === 0 ? 4 : 2.5; ticks += `<line x1="${cx + Math.sin(a) * R}" y1="${cy - Math.cos(a) * R}" x2="${cx + Math.sin(a) * (R - l)}" y2="${cy - Math.cos(a) * (R - l)}" stroke="rgba(255,255,255,${k % 18 === 0 ? 0.8 : 0.35})" stroke-width="1.2"/>`; }
      const letters = [['N', 0], [t.dirs[4], 90], ['S', 180], ['W', 270]].map(([l, d]) => { const a = (d * Math.PI) / 180; return `<text x="${cx + Math.sin(a) * (R - 15)}" y="${cy - Math.cos(a) * (R - 15) + 4}" text-anchor="middle" font-size="11" font-weight="600" fill="#fff">${l}</text>`; }).join('');
      // the arrow points where the wind blows to (from the bearing it comes from)
      const arrow = wb === null ? '' : `<g transform="rotate(${wb + 180} ${cx} ${cy})"><line x1="${cx}" y1="${cy + R - 4}" x2="${cx}" y2="${cy - R + 10}" stroke="#fff" stroke-width="2.2"/><polygon points="${cx},${cy - R + 2} ${cx - 6},${cy - R + 13} ${cx + 6},${cy - R + 13}" fill="#fff"/><circle cx="${cx}" cy="${cy + R - 4}" r="4" fill="none" stroke="#fff" stroke-width="2"/></g>`;
      const comp = `<svg class="cmp" viewBox="0 0 112 112">${ticks}${letters}${arrow}<circle cx="${cx}" cy="${cy}" r="19" fill="rgba(20,40,80,.55)"/><text x="${cx}" y="${cy + 3}" text-anchor="middle" font-size="16" font-weight="600" fill="#fff">${int(ws)}</text><text x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="8" fill="rgba(255,255,255,.8)">${U.w}</text></svg>`;
      // small: compass fills the tile, gusts below (wind speed is in the middle of the compass)
      if (c.size === 'small') {
        return `<style>${baseCss(h, s, c.background)}${picCss}</style>
<ha-card><div class="lab"><ha-icon icon="mdi:weather-windy"></ha-icon>${t.n_wind}</div><div class="pic">${comp.replace('viewBox="0 0 112 112"', 'viewBox="6 6 100 100"')}</div><div class="note">${t.w_gust}: ${int(wg)} ${U.w}</div></ha-card>`;
      }
      return `<style>${baseCss(h, s, c.background)}${rowsCss}.cmp{width:112px;height:112px;display:block}</style>
<ha-card><div class="lab"><ha-icon icon="mdi:weather-windy"></ha-icon>${t.n_wind}</div><div class="md">${rowList([[t.w_wind, `${int(ws)} ${U.w}`], [t.w_gust, `${int(wg)} ${U.w}`], [t.w_dir, dir]])}${comp}</div></ha-card>`;
    }
  }
  register('weatherscope-wind-card', WindCard, makeEditor((t) => [
    { name: 'entity', required: true, selector: { entity: { domain: 'weather' } } },
    { name: 'size', selector: { select: { mode: 'dropdown', options: [{ value: 'small', label: t.e_small }, { value: 'medium', label: t.e_medium }] } } },
    { name: 'wind_speed', ...sensorSel('wind_speed') }, { name: 'wind_gust', ...sensorSel('wind_speed') }, { name: 'wind_bearing', ...sensorSel() },
    bgSchema(t),
  ], { background: 'e_background_h' }), `WeatherScope – ${tr(hass0()).n_wind}`, 'd_wind');

  // ---------------------------------------------------------------- Moon (calculated locally, no sensors needed)
  const SYN = 29.530588853, NEW0 = Date.UTC(2000, 0, 6, 18, 14);
  const moonAge = (ms) => ((((ms - NEW0) / 864e5) % SYN) + SYN) % SYN;
  const moonPhase = (age) => { const a = age / SYN, d = 1 / SYN / 2; if (a < d || a > 1 - d) return 'new_moon'; if (Math.abs(a - 0.25) < d) return 'first_quarter'; if (Math.abs(a - 0.5) < d) return 'full_moon'; if (Math.abs(a - 0.75) < d) return 'last_quarter'; return a < 0.25 ? 'waxing_crescent' : a < 0.5 ? 'waxing_gibbous' : a < 0.75 ? 'waning_gibbous' : 'waning_crescent'; };
  const moonAlt = (ms, lat, lon) => {
    const rad = Math.PI / 180, d = (ms - Date.UTC(2000, 0, 1, 12)) / 864e5;
    const L = rad * (218.316 + 13.176396 * d), M = rad * (134.963 + 13.064993 * d), F = rad * (93.272 + 13.22935 * d);
    const lam = L + rad * 6.289 * Math.sin(M), bet = rad * 5.128 * Math.sin(F), e = rad * 23.4397;
    const ra = Math.atan2(Math.sin(lam) * Math.cos(e) - Math.tan(bet) * Math.sin(e), Math.cos(lam)), dec = Math.asin(Math.sin(bet) * Math.cos(e) + Math.cos(bet) * Math.sin(e) * Math.sin(lam));
    const H = rad * ((280.16 + 360.9856235 * d) % 360) + rad * lon - ra, phi = rad * lat;
    return Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H)) / rad;
  };
  // next moonrise or moonset after now (10-minute steps, 2 days ahead)
  const moonNext = (lat, lon) => {
    let t0 = Date.now(), a0 = moonAlt(t0, lat, lon) - 0.125;
    for (let i = 0; i < 288; i++) { const t1 = t0 + 6e5, a1 = moonAlt(t1, lat, lon) - 0.125; if ((a0 < 0) !== (a1 < 0)) return { rise: a1 >= 0, at: new Date(t0 + 6e5 * (-a0 / (a1 - a0))) }; t0 = t1; a0 = a1; }
    return null;
  };
  // moon picture: lit part from the phase; mirrored on the southern hemisphere
  const moonSvg = (age, size, south) => {
    const r = 46, f = age / SYN, k = (1 - Math.cos(2 * Math.PI * f)) / 2, wax = f < 0.5, rx = Math.abs(1 - 2 * k) * r;
    const right = wax !== !!south, sweepOuter = right ? 1 : 0, sweepInner = k > 0.5 ? (right ? 1 : 0) : right ? 0 : 1;
    const lit = k < 0.01 ? '' : k > 0.99 ? `<circle cx="50" cy="50" r="${r}" fill="url(#mlit)"/>` : `<path d="M50 ${50 - r} A${r} ${r} 0 0 ${sweepOuter} 50 ${50 + r} A${rx} ${r} 0 0 ${sweepInner} 50 ${50 - r} Z" fill="url(#mlit)"/>`;
    const id = `m${Math.random().toString(36).slice(2, 7)}`;
    return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" class="moon"><defs><radialGradient id="mlit" cx="42%" cy="38%"><stop offset="0" stop-color="#f4f7fb"/><stop offset="1" stop-color="#b7c4d6"/></radialGradient><clipPath id="${id}"><circle cx="50" cy="50" r="${r}"/></clipPath></defs>
<circle cx="50" cy="50" r="${r}" fill="rgba(10,20,45,.45)"/>${lit}<g clip-path="url(#${id})" fill="#7f8ea6" opacity=".28"><circle cx="38" cy="36" r="9"/><circle cx="58" cy="30" r="6"/><circle cx="62" cy="56" r="11"/><circle cx="40" cy="64" r="7"/><circle cx="70" cy="40" r="4"/></g></svg>`;
  };
  class MoonCard extends WSBase {
    static defaults = { entity: 'weather.weatherscope', background: 'sky', size: 'medium' };
    getCardSize() { return 3; }
    _grid() { return this._c && this._c.size === 'small' ? { columns: 4, rows: 3, min_columns: 4, min_rows: 3 } : { columns: 8, rows: 3, min_columns: 6, min_rows: 3 }; }
    connectedCallback() { super.connectedCallback(); this._tick = setInterval(() => { this._last = null; this._render(); }, 300000); }
    disconnectedCallback() { super.disconnectedCallback(); clearInterval(this._tick); }
    _html(h, s, t) {
      const c = this._c, lat = h.config.latitude, lon = h.config.longitude, now = Date.now(), age = moonAge(now), ph = moonPhase(age);
      const k = (1 - Math.cos((2 * Math.PI * age) / SYN)) / 2, nx = moonNext(lat, lon), full = ((SYN / 2 - age) % SYN + SYN) % SYN;
      const ev = nx ? `${nx.rise ? t.m_rise : t.m_set} ${hhmm(h, nx.at)}` : '';
      const lab = `<div class="lab"><ha-icon icon="mdi:moon-${ph.replace('_moon', '').replace('_', '-')}"></ha-icon>${t.mp[ph]}</div>`;
      if (c.size === 'small') {
        return `<style>${baseCss(h, s, c.background)}${picCss}</style>
<ha-card>${lab}<div class="pic">${moonSvg(age, 96, lat < 0)}</div><div class="note">${ev}</div></ha-card>`;
      }
      return `<style>${baseCss(h, s, c.background)}${rowsCss}.moon{display:block}</style>
<ha-card>${lab}<div class="md">${rowList([[t.m_illum, `${Math.round(k * 100)} %`], [nx ? (nx.rise ? t.m_rise : t.m_set) : t.m_rise, nx ? hhmm(h, nx.at) : '–'], [t.m_full, t.m_in(full)]])}${moonSvg(age, 104, lat < 0)}</div></ha-card>`;
    }
  }
  register('weatherscope-moon-card', MoonCard, makeEditor((t) => [
    { name: 'size', selector: { select: { mode: 'dropdown', options: [{ value: 'small', label: t.e_small }, { value: 'medium', label: t.e_medium }] } } },
    bgSchema(t),
  ], { background: 'e_background_h' }), `WeatherScope – ${tr(hass0()).n_moon}`, 'd_moon');

  // ---------------------------------------------------------------- Air quality (European Air Quality Index)
  // EEA colours: good, fair, moderate, poor, very poor, extremely poor; index 0-20-40-60-80-100+
  const AQG = 'linear-gradient(90deg,#50f0e6 0%,#50f0e6 13%,#50ccaa 20%,#50ccaa 30%,#f0e641 37%,#f0e641 47%,#ff5050 53%,#ff5050 63%,#960032 70%,#960032 80%,#7d2181 87%,#7d2181 100%)';
  const aqStage = (v) => (v < 20 ? 0 : v < 40 ? 1 : v < 60 ? 2 : v < 80 ? 3 : v < 100 ? 4 : 5);
  class AirCard extends WSBase {
    static defaults = { entity: 'weather.weatherscope', background: 'sky', size: 'medium' };
    static getStubConfig(h) { return { ...WSBase.getStubConfig(h), size: 'medium' }; }
    getCardSize() { return 3; }
    _grid() { return this._c && this._c.size === 'small' ? { columns: 4, rows: 3, min_columns: 4, min_rows: 3 } : { columns: 8, rows: 3, min_columns: 6, min_rows: 3 }; }
    _html(h, s, t) {
      const c = this._c, val = (key, def) => { const e = h.states[c[key] || def]; return e ? num(e.state) : null; };
      const v = val('aqi', 'sensor.weatherscope_air_quality_index');
      const P = [['PM2,5', val('pm25', 'sensor.weatherscope_pm2_5'), 15], ['PM10', val('pm10', 'sensor.weatherscope_pm10'), 45], ['NO₂', val('no2', 'sensor.weatherscope_no2'), 25], ['O₃', val('o3', 'sensor.weatherscope_o3'), 100]];
      const st = v === null ? null : aqStage(v), pos = v === null ? 0 : Math.min(100, (v / 120) * 100);
      // main pollutant: highest share of its WHO guideline value (2021)
      const main = P.filter((q) => q[1] !== null).sort((a, b) => b[1] / b[2] - a[1] / a[2])[0];
      const bar = `<div class="aqb" style="background:${AQG}">${v === null ? '' : `<b style="left:${pos}%"></b>`}</div>`;
      const lab = `<div class="lab"><ha-icon icon="mdi:air-filter"></ha-icon>${t.n_air}</div>`;
      const css = `${baseCss(h, s, c.background)}.aqb{position:relative;height:6px;border-radius:3px;margin-top:10px}.aqb b{position:absolute;top:-3px;width:8px;height:8px;border-radius:50%;background:#fff;border:2px solid rgba(20,40,80,.6);transform:translateX(-50%)}`;
      if (c.size === 'small') return `<style>${css}</style><ha-card>${lab}<div class="big">${v === null ? '–' : Math.round(v)}</div><div class="sub">${st === null ? '' : t.aq[st]}</div>${bar}<div class="note">${t.aq_scale}</div></ha-card>`;
      const pol = P.filter((q) => q[1] !== null).map((q) => `${q[0]} ${Math.round(q[1])}`).join(' · ');
      return `<style>${css}.big{font-size:22px;font-weight:500;margin-top:8px}</style><ha-card>${lab}<div class="big">${st === null ? '–' : t.aq[st]}</div>${bar}
<div class="note">${v === null ? '' : t.aq_idx(Math.round(v))}${pol ? ` · ${pol} µg/m³` : ''}${main ? `<br>${t.aq_main(main[0])}` : ''}</div></ha-card>`;
    }
  }
  register('weatherscope-air-card', AirCard, makeEditor((t) => [
    { name: 'size', selector: { select: { mode: 'dropdown', options: [{ value: 'small', label: t.e_small }, { value: 'medium', label: t.e_medium }] } } },
    { name: 'aqi', ...sensorSel() }, { name: 'pm25', ...sensorSel() }, { name: 'pm10', ...sensorSel() }, { name: 'no2', ...sensorSel() }, { name: 'o3', ...sensorSel() },
    bgSchema(t),
  ], { background: 'e_background_h' }), `WeatherScope – ${tr(hass0()).n_air}`, 'd_air');

  // ---------------------------------------------------------------- Weather warning (DWD integration)
  class WarningCard extends HTMLElement {
    static getStubConfig(h) { const w = Object.keys(h.states).find((e) => e.startsWith('sensor.') && /warnstufe|warning_level/i.test(e) && !/vorwarn|advance/i.test(e)); return { warning: w || '' }; }
    setConfig(c) { this._c = Object.assign({ hide: true }, c || {}); if (!this.shadowRoot) this.attachShadow({ mode: 'open' }); this._render(); }
    set hass(h) { this._h = h; this._render(); }
    getCardSize() { return 3; }
    _grid() { return { columns: 8, rows: 3, min_columns: 6, min_rows: 2 }; }
    getGridOptions() { return this._grid(); }
    connectedCallback() { this._sqro = new ResizeObserver(() => { if (this._c) sqFit(this, this._c, this._grid()); }); this._sqro.observe(this); }
    disconnectedCallback() { if (this._sqro) this._sqro.disconnect(); }
    _list(id, adv) {
      const e = id && this._h.states[id]; if (!e) return [];
      const a = e.attributes, n = Number(a.warning_count) || 0, out = [];
      for (let i = 1; i <= n; i++) if (a[`warning_${i}_name`]) out.push({ name: a[`warning_${i}_name`], level: Number(a[`warning_${i}_level`]) || 1, start: a[`warning_${i}_start`], end: a[`warning_${i}_end`], desc: a[`warning_${i}_description`] || '', color: a[`warning_${i}_color`], adv });
      return out;
    }
    _render() {
      if (!this.shadowRoot || !this._c || !this._h) return;
      const h = this._h, t = tr(h), c = this._c;
      const all = [...this._list(c.warning, false), ...this._list(c.advance, true)].sort((a, b) => b.level - a.level);
      const edit = !!this.closest && (this.preview || lovelaceEdit());
      let html;
      if (!all.length) {
        this.style.display = c.hide && !edit ? 'none' : '';
        html = `<style>${baseCss(h, { state: 'sunny', attributes: {} }, c.background || 'sky')}</style><ha-card><div class="lab"><ha-icon icon="mdi:alert-outline"></ha-icon>${t.wr_title}</div><div class="sub" style="margin-top:8px">${t.wr_none}</div></ha-card>`;
      } else {
        this.style.display = '';
        const w = all[0], col = w.color || ['#ffeb3b', '#ffeb3b', '#fb8c00', '#e53935', '#880e4f'][Math.min(4, w.level)], dark = w.level <= 2;
        const fg = dark ? '#3a2600' : '#fff', d = (x) => { const q = new Date(x); return `${q.toLocaleDateString(lang(h), { weekday: 'short' }).replace('.', '')} ${hhmm(h, q)}`; };
        const name = String(w.name).charAt(0) + String(w.name).slice(1).toLowerCase();
        html = `<style>${baseCss(h, { state: 'sunny', attributes: {} }, 'none')}ha-card{background:${col};color:${fg}}.lab{color:${fg};opacity:.75}.ttl{font-size:22px;font-weight:500;margin-top:6px}.tm{font-size:13px;margin-top:2px}.ds{font-size:13px;margin-top:6px;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.note{color:${fg};opacity:.8}</style>
<ha-card><div class="lab"><ha-icon icon="mdi:alert"></ha-icon>${w.adv ? t.wr_adv : t.wr_title}</div><div class="ttl">${name}</div><div class="tm">${w.start && w.end ? t.wr_until(d(w.start), d(w.end)) : ''}</div><div class="ds">${w.desc}</div><div class="note">Deutscher Wetterdienst${all.length > 1 ? ` · ${t.wr_more(all.length - 1)}` : ''}</div></ha-card>`;
      }
      if (html !== this._last) { this._last = html; this.shadowRoot.innerHTML = html; }
    }
  }
  register('weatherscope-warning-card', WarningCard, makeEditor((t) => [
    { name: 'warning', required: true, selector: { entity: { domain: 'sensor' } } },
    { name: 'advance', selector: { entity: { domain: 'sensor' } } },
    { name: 'hide', selector: { boolean: {} } },
  ], {}), `WeatherScope – ${tr(hass0()).n_warning}`, 'd_warning');

  // ---------------------------------------------------------------- Sky (animated page background)
  class SkyCard extends HTMLElement {
    static getStubConfig(h) { return WSBase.getStubConfig(h); }
    setConfig(c) {
      this._c = Object.assign({ entity: 'weather.weatherscope', sun: 'sun.sun', fps: 30 }, c || {});
      this.style.display = 'block';
      this._place();
      if (this._h) this.hass = this._h;
    }
    // small tile in the card editor and while the dashboard is being edited;
    // full screen would otherwise cover the cards in edit mode
    _small() { return !!this.preview || !!lovelaceEdit(); }
    getCardSize() { return this._small() ? 2 : 0; }
    getGridOptions() { return this._small() ? { rows: 2, columns: 12 } : { rows: 0, columns: 12 }; }
    set hass(h) {
      this._h = h;
      if (!this._c) return;
      const w = h.states[this._c.entity], s = h.states[this._c.sun];
      let cond = w ? w.state : 'cloudy';
      if (this._c.test) cond = this._c.test;
      const night = cond === 'clear-night' || (s ? s.state === 'below_horizon' : false);
      this._wind = w && w.attributes ? parseFloat(w.attributes.wind_speed) || 0 : 0;
      const key = `${cond}|${night}`;
      if (key !== this._key) { this._key = key; this._cond = cond; this._night = night; this._build(); }
    }
    // full-screen behind all cards; inside the card editor only a small preview
    _place() {
      if (!this._cv) this._cv = document.createElement('canvas');
      const pv = this._small();
      this._sm = pv;
      this.style.height = pv ? '112px' : '0';
      this.style.margin = '0';
      this._cv.style.cssText = pv
        ? 'display:block;width:100%;height:112px;border-radius:18px;pointer-events:none'
        : 'position:fixed;inset:0;width:100vw;height:100vh;z-index:-1;pointer-events:none';
      if (this.isConnected) this._resize();
    }
    set preview(v) { this._pv = v; if (this._c) this._place(); }
    get preview() { return this._pv; }
    connectedCallback() {
      this._place();
      this.appendChild(this._cv);
      this._onResize = () => this._resize();
      window.addEventListener('resize', this._onResize);
      this._onVis = () => { if (!document.hidden) this._last = 0; };
      document.addEventListener('visibilitychange', this._onVis);
      this._resize();
      // follow switching into and out of edit mode
      this._edit = setInterval(() => { if (this._small() !== this._sm) this._place(); }, 500);
      this._run = true;
      const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const loop = (t) => {
        if (!this._run) return;
        this._raf = requestAnimationFrame(loop);
        if (document.hidden) return;
        const step = 1000 / (still ? 1 : Number(this._c.fps) || 30);
        if (this._last && t - this._last < step - 2) return;
        const dt = still ? 0 : this._last ? Math.min((t - this._last) / 1000, 0.1) : 0.033;
        this._last = t;
        this._draw(dt, t / 1000);
      };
      this._raf = requestAnimationFrame(loop);
    }
    disconnectedCallback() {
      this._run = false;
      clearInterval(this._edit);
      cancelAnimationFrame(this._raf);
      window.removeEventListener('resize', this._onResize);
      document.removeEventListener('visibilitychange', this._onVis);
    }
    _resize() {
      const d = Math.min(window.devicePixelRatio || 1, 1.25), r = this._cv.getBoundingClientRect();
      this._d = d;
      this._W = this._sm ? Math.max(100, r.width || 400) : window.innerWidth;
      this._H = this._sm ? 112 : window.innerHeight;
      this._cv.width = Math.round(this._W * d); this._cv.height = Math.round(this._H * d);
      this._ctx = this._cv.getContext('2d');
      this._ctx.setTransform(d, 0, 0, d, 0, 0);
      this._build();
    }

    _scene() {
      const c = this._cond || 'cloudy', n = !!this._night;
      const S = { clouds: 0, dark: 0, rain: 0, snow: 0, flash: false, fog: false, sun: false, stars: false, sky: null };
      const sky = {
        clear: n ? ['#081329', '#1c3160', '#36507f'] : ['#1f5ea8', '#4f8fd0', '#9cc3ea'],
        part: n ? ['#0d1830', '#24365e', '#3e537a'] : ['#2f6aa8', '#6497cc', '#a9c7e3'],
        cloud: n ? ['#141a24', '#2a3240', '#3d4655'] : ['#5b6c80', '#7f8fa1', '#a7b3c0'],
        rain: n ? ['#10151d', '#232b37', '#343e4c'] : ['#3d4a5a', '#56646f', '#7a8692'],
        storm: n ? ['#090c12', '#171d27', '#252d3a'] : ['#232a35', '#3a4452', '#545f6d'],
        snow: n ? ['#1a2230', '#36425a', '#56627a'] : ['#7d8ea3', '#a8b6c6', '#d6dee7'],
        fog: n ? ['#1c2128', '#343b44', '#4b535c'] : ['#8a949e', '#a9b1b9', '#ccd2d7'],
      };
      switch (c) {
        case 'sunny': S.sky = sky.clear; S.sun = !n; S.stars = n; break;
        case 'clear-night': S.sky = sky.clear; S.stars = true; break;
        case 'partlycloudy': S.sky = sky.part; S.clouds = 5; S.sun = !n; S.stars = n; break;
        case 'cloudy': S.sky = sky.cloud; S.clouds = 10; S.dark = 0.15; break;
        case 'windy': case 'windy-variant': S.sky = sky.part; S.clouds = 7; break;
        case 'fog': S.sky = sky.fog; S.clouds = 4; S.fog = true; break;
        case 'rainy': S.sky = sky.rain; S.clouds = 11; S.dark = 0.35; S.rain = 130; break;
        case 'pouring': S.sky = sky.rain; S.clouds = 13; S.dark = 0.45; S.rain = 260; break;
        case 'lightning': S.sky = sky.storm; S.clouds = 12; S.dark = 0.55; S.flash = true; break;
        case 'lightning-rainy': S.sky = sky.storm; S.clouds = 13; S.dark = 0.55; S.rain = 200; S.flash = true; break;
        case 'hail': S.sky = sky.storm; S.clouds = 12; S.dark = 0.45; S.rain = 160; S.snow = 40; break;
        case 'snowy': S.sky = sky.snow; S.clouds = 10; S.dark = 0.05; S.snow = 140; break;
        case 'snowy-rainy': S.sky = sky.rain; S.clouds = 11; S.dark = 0.3; S.rain = 80; S.snow = 70; break;
        default: S.sky = sky.cloud; S.clouds = 8;
      }
      if (n) S.dark = Math.min(1, S.dark + 0.55);
      return S;
    }

    _puff(w, h, shade) {
      const o = document.createElement('canvas');
      o.width = w; o.height = h;
      const g = o.getContext('2d');
      const n = 9 + Math.floor(Math.random() * 6);
      const v = Math.round(255 - shade * 195);
      for (let i = 0; i < n; i++) {
        const x = w * (0.22 + Math.random() * 0.56);
        const y = h * (0.5 + (Math.random() - 0.5) * 0.16);
        const r = h * (0.2 + Math.random() * 0.2);
        const rg = g.createRadialGradient(x, y, 0, x, y, r);
        rg.addColorStop(0, `rgba(${v},${v},${Math.min(255, v + 8)},0.55)`);
        rg.addColorStop(0.6, `rgba(${v},${v},${Math.min(255, v + 8)},0.25)`);
        rg.addColorStop(1, `rgba(${v},${v},${v},0)`);
        g.fillStyle = rg;
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      }
      return o;
    }

    _build() {
      if (!this._W || !this._cond) return;
      const W = this._W, H = this._H, S = this._scene();
      this._S = S;
      this._clouds = [];
      for (let i = 0; i < S.clouds; i++) {
        const cw = W * (0.4 + Math.random() * 0.45), ch = cw * 0.5;
        this._clouds.push({
          img: this._puff(Math.round(cw), Math.round(ch), S.dark * (0.6 + Math.random() * 0.4)),
          x: Math.random() * (W + cw) - cw, y: -ch * 0.3 + Math.random() * H * 0.45,
          v: 6 + Math.random() * 10, a: 0.4 + Math.random() * 0.4,
        });
      }
      this._drops = [];
      for (let i = 0; i < S.rain; i++) this._drops.push({ x: Math.random() * W, y: Math.random() * H, l: 14 + Math.random() * 16, v: 650 + Math.random() * 350, a: 0.18 + Math.random() * 0.25 });
      this._flakes = [];
      for (let i = 0; i < S.snow; i++) this._flakes.push({ x: Math.random() * W, y: Math.random() * H, r: 1.2 + Math.random() * 2.6, v: 25 + Math.random() * 45, p: Math.random() * 6.28 });
      this._stars = [];
      if (S.stars) for (let i = 0; i < 140; i++) this._stars.push({ x: Math.random() * W, y: Math.random() * H * 0.75, r: 0.4 + Math.random() * 1.2, p: Math.random() * 6.28, s: 0.5 + Math.random() * 1.5 });
      this._fog = [];
      if (S.fog) for (let i = 0; i < 4; i++) this._fog.push({ x: Math.random() * W, y: H * (0.25 + i * 0.2), v: 8 + Math.random() * 10 });
      this._flashT = 0; this._nextFlash = 4 + Math.random() * 8; this._flashA = 0;
    }

    _draw(dt, t) {
      const g = this._ctx, S = this._S;
      if (!g || !S) return;
      const W = this._W, H = this._H;
      const wind = Math.max(0.6, Math.min(3, (this._wind || 10) / 12));
      const lg = g.createLinearGradient(0, 0, 0, H);
      lg.addColorStop(0, S.sky[0]); lg.addColorStop(0.55, S.sky[1]); lg.addColorStop(1, S.sky[2]);
      g.fillStyle = lg; g.fillRect(0, 0, W, H);

      for (const s of this._stars) {
        const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.s + s.p));
        g.fillStyle = `rgba(255,255,255,${a * 0.9})`;
        g.beginPath(); g.arc(s.x, s.y, s.r, 0, 6.283); g.fill();
      }
      if (S.sun) {
        const sx = W * 0.82, sy = H * 0.08, r = H * (0.55 + 0.03 * Math.sin(t * 0.6));
        const rg = g.createRadialGradient(sx, sy, 0, sx, sy, r);
        rg.addColorStop(0, 'rgba(255,248,220,0.75)'); rg.addColorStop(0.15, 'rgba(255,236,180,0.35)'); rg.addColorStop(1, 'rgba(255,230,170,0)');
        g.fillStyle = rg; g.fillRect(0, 0, W, H);
      }
      for (const c of this._clouds) {
        c.x += c.v * wind * dt;
        if (c.x > W) { c.x = -c.img.width; c.y = -c.img.height * 0.3 + Math.random() * H * 0.45; }
        g.globalAlpha = c.a; g.drawImage(c.img, c.x, c.y); g.globalAlpha = 1;
      }
      for (const f of this._fog) {
        f.x += f.v * dt; if (f.x > W) f.x -= W * 2;
        const rg = g.createRadialGradient(f.x, f.y, 0, f.x, f.y, W * 0.6);
        rg.addColorStop(0, 'rgba(230,234,238,0.35)'); rg.addColorStop(1, 'rgba(230,234,238,0)');
        g.fillStyle = rg; g.fillRect(0, 0, W, H);
      }
      if (this._drops.length) {
        const sl = 0.12 * wind;
        g.lineWidth = 1.2; g.lineCap = 'round';
        for (const d of this._drops) {
          d.y += d.v * dt; d.x += d.v * sl * dt;
          if (d.y > H) { d.y = -d.l; d.x = Math.random() * (W + 100) - 100; }
          if (d.x > W) d.x -= W;
          g.strokeStyle = `rgba(210,225,240,${d.a})`;
          g.beginPath(); g.moveTo(d.x, d.y); g.lineTo(d.x - d.l * sl, d.y - d.l); g.stroke();
        }
      }
      for (const f of this._flakes) {
        f.y += f.v * dt; f.p += dt; f.x += (Math.sin(f.p) * 18 + 10 * wind) * dt;
        if (f.y > H) { f.y = -5; f.x = Math.random() * W; }
        if (f.x > W) f.x -= W;
        g.fillStyle = 'rgba(255,255,255,0.85)';
        g.beginPath(); g.arc(f.x, f.y, f.r, 0, 6.283); g.fill();
      }
      if (S.flash) {
        this._flashT += dt;
        if (this._flashT > this._nextFlash) {
          this._flashT = 0; this._nextFlash = 6 + Math.random() * 12;
          this._flashSeq = [0, 0.12, 0.28];
        }
        if (this._flashSeq) {
          const ft = this._flashT;
          let a = 0;
          for (const s of this._flashSeq) { const d = ft - s; if (d >= 0 && d < 0.25) a = Math.max(a, 0.45 * (1 - d / 0.25)); }
          if (ft > 0.6) this._flashSeq = null;
          if (a > 0) { g.fillStyle = `rgba(235,240,255,${a})`; g.fillRect(0, 0, W, H); }
        }
      }
    }
  }
  register('weatherscope-sky-card', SkyCard, makeEditor((t) => [
    { name: 'entity', required: true, selector: { entity: { domain: 'weather' } } },
    { name: 'test', selector: { select: { mode: 'dropdown', options: Object.keys(ICON).map((k) => ({ value: k, label: k })) } } },
    { name: 'fps', selector: { number: { min: 5, max: 60, step: 5, mode: 'box' } } },
  ], { test: 'e_test_h', fps: 'e_fps_h' }), `WeatherScope – ${tr(hass0()).n_sky}`, 'd_sky');

  console.info(`%c WEATHERSCOPE CARDS %c ${VERSION} `, 'background:#2b7de0;color:#fff;border-radius:3px 0 0 3px', 'background:#444;color:#fff;border-radius:0 3px 3px 0');
})();
