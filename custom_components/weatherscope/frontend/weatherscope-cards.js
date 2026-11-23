/* WeatherScope weather cards: Now, Hourly, Daily, Value, Wind, Moon, Air, Warning, Sky. Every value can come from any weather entity or the user's own sensors. */
(() => {
  const VERSION = '0.15.0';

  // ---------------------------------------------------------------- shared
  const T = {
    de: {
      e_total: 'Regen-Zähler (Niederschlag)', e_total_h: 'Nur Niederschlag: ein Zähler für den Gesamtregen, für die Balken der letzten 24 Std. / 7 Tage.', e_period: 'Zeitraum (Niederschlag und Luftdruck, mittel)',
      n_page: 'Wetterseite', d_page: 'Ganze Wetterseite: ordnet alle Kacheln selbst nach Wichtigkeit an.', e_feels_like: 'Gefühlte Temperatur', e_humidity: 'Luftfeuchtigkeit', e_dewpoint: 'Taupunkt', e_pressure: 'Luftdruck', e_uv: 'UV-Index', e_rain_today: 'Niederschlag heute', e_rain_total: 'Regen-Zähler gesamt', e_map: 'Wetterkarte (WeatherScope-Sensor)', e_sensors: 'Eigene Sensoren (ersetzen die Werte des Wetterdienstes)',
      hi: 'H', lo: 'T', home: 'Zuhause', now: 'Jetzt', hourly: 'Stündlich', sunrise: 'Sonnenaufgang', sunset: 'Sonnenuntergang',
      m_temp: 'Temperatur ({u})', m_rain: 'Niederschlag ({u})', m_wind: 'Wind und Böen ({u})', max: 'max', loading: 'Vorhersage wird geladen …',
      e_entity: 'Wetter-Entität', e_temperature: 'Eigener Temperatursensor (optional)', e_name: 'Ortsname (optional)', e_background: 'Hintergrund',
      e_sky: 'Eigener Himmel', e_glass: 'Glas', e_none: 'Durchsichtig', e_temperature_h: 'Zum Beispiel die Außentemperatur deiner Wetterstation. Leer lassen, dann kommt sie von der Wetter-Entität.',
      e_fx: 'Wetter-Animation', e_animation: 'Himmel animieren', e_animation_h: 'Wolken, Regen, Schnee, Nebel und Gewitter hinter den Kacheln – richtet sich nach dem aktuellen Wetter.', e_fx_tiles: 'Wetter auf Kacheln', e_fx_tiles_h: 'Tropfen, liegender Schnee und Nebelschleier auf den Kacheln.', e_performance: 'Leistung', e_performance_h: '„Sparsam“ für schwächere Geräte wie Wandtablets, „Standbild“ ohne Bewegung.', e_perf_full: 'Voll', e_perf_eco: 'Sparsam', e_perf_still: 'Standbild', e_meteors: 'Sternschnuppen', e_meteors_h: 'Selten, nur in klarer Nacht.',
      e_background_h: '„Glas“ und „Durchsichtig“ passen zu einer Wetterseite mit der WeatherScope-Himmel-Animation dahinter.', e_wind_speed: 'Eigener Windsensor (optional)', e_wind_gust: 'Eigener Böensensor (optional)',
      e_wind_bearing: 'Eigener Windrichtungssensor (optional)', e_rain_rate: 'Eigener Regensensor (optional)', e_rain_rate_h: 'Regenrate der Wetterstation, z. B. mm/h. Ersetzt den Wert bei „Jetzt“.', e_hours: 'Stunden', e_mode: 'Ansicht beim Start', e_own_h: 'Eigene Sensoren ersetzen nur den Wert bei „Jetzt“.',
      n_wind: 'Wind', n_moon: 'Mond', n_air: 'Luftqualität', n_warning: 'Wetterwarnung', d_wind: 'Wind, Böen und Richtung mit Kompass.', d_moon: 'Mondphase mit Bild, Beleuchtung, Mondauf- und -untergang.', d_air: 'Luftqualität nach dem Europäischen Luftqualitätsindex.', d_warning: 'Amtliche Wetterwarnungen (DWD), nur sichtbar wenn aktiv.',
      w_wind: 'Wind', w_gust: 'Böen', w_dir: 'Richtung', dirs: ['N', 'NNO', 'NO', 'ONO', 'O', 'OSO', 'SO', 'SSO', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'],
      mp: { new_moon: 'Neumond', waxing_crescent: 'Zunehmende Sichel', first_quarter: 'Erstes Viertel', waxing_gibbous: 'Zunehmender Mond', full_moon: 'Vollmond', waning_gibbous: 'Abnehmender Mond', last_quarter: 'Letztes Viertel', waning_crescent: 'Abnehmende Sichel' },
      m_illum: 'Beleuchtung', m_rise: 'Mondaufgang', m_set: 'Monduntergang', m_full: 'Vollmond', m_in: (d) => (d < 1 ? 'heute' : d < 2 ? 'morgen' : `in ${Math.round(d)} Tagen`),
      aq: ['Gut', 'Befriedigend', 'Mäßig', 'Schlecht', 'Sehr schlecht', 'Extrem schlecht'], aq_main: (p) => `Hauptursache: ${p}`, aq_scale: 'Index nach EU-Skala', aq_idx: (v) => `Index ${v}`,
      wr_title: 'Wetterwarnung', wr_more: (n) => `+${n} weitere`, wr_none: 'Keine Warnungen', wr_until: (a, b) => `${a} bis ${b}`, wr_adv: 'Vorabinformation',
      e_wind_entity: 'Wetter-Entität', e_warning: 'Warnungs-Sensor (z. B. DWD „Aktuelle Warnstufe“)', e_advance: 'Vorwarnungs-Sensor (optional)', e_hide: 'Ausblenden, wenn keine Warnung', e_aqi: 'Eigener Luftqualitätsindex (optional, EU-Skala)', e_pm25: 'PM2,5 (optional)', e_pm10: 'PM10 (optional)', e_no2: 'NO₂ (optional)', e_o3: 'O₃ (optional)', e_so2: 'SO₂ (optional)', e_so2: 'SO₂ (optional)',
      n_now: 'Aktuell', n_hourly: 'Stündlich', n_daily: 'Tagesvorhersage', n_value: 'Wert (alle)', n_sky: 'Himmel-Animation', d_now: 'Ort, Temperatur, Wetterlage, Höchst- und Tiefstwert.', d_value: 'Einzelwert: Gefühlt, Sonne, UV-Index, Durchschnitt, Niederschlag, Sichtweite, Feuchtigkeit oder Luftdruck.',
      k_feels: 'Gefühlt', k_sun: 'Sonne', k_uv: 'UV-Index', k_normal: 'Durchschnittswert', k_precip: 'Niederschlag', k_visibility: 'Sichtweite', k_humidity: 'Feuchtigkeit', k_pressure: 'Luftdruck',
      sunrise_l: 'Sonnenaufgang', sunset_l: 'Sonnenuntergang', actual: (v) => `Tatsächlich: ${v}`, f_colder: 'Fühlt sich kälter an als die tatsächliche Temperatur.', f_colder_wind: 'Fühlt sich durch den Wind kälter an.',
      f_warmer: 'Fühlt sich wärmer an als die tatsächliche Temperatur.', f_warmer_hum: 'Fühlt sich durch die Luftfeuchtigkeit wärmer an.', f_same: 'Ähnlich wie die tatsächliche Temperatur.',
      uv0: 'Niedrig', uv1: 'Mäßig', uv2: 'Hoch', uv3: 'Sehr hoch', uv4: 'Extrem', uv_low_day: 'Ganztägig niedrig.', uv_max: (v, l) => `Höchstwert heute: ${v} (${l}).`,
      n_above: 'über dem durchschnittlichen Tageshöchstwert', n_below: 'unter dem durchschnittlichen Tageshöchstwert', n_same: 'entspricht dem durchschnittlichen Tageshöchstwert', n_note: (a, b) => `<span class="nt"><span>Heute</span><b>H: ${a}</b><span>Durchschnitt</span><b>H: ${b}</b></span>`, n_none: 'Klimawerte werden geladen …',
      p_today: 'Heute', p_24h: 'letzte 24 Std.', p_7d: 'letzte 7 Tage', p_next0: 'In den nächsten 24 Std. kein Niederschlag erwartet.', p_next_lt: (v) => `< ${v} in den nächsten 24 Std. erwartet.`, p_next: (v) => `${v} in den nächsten 24 Std. erwartet.`, p_tomorrow: (v) => `Morgen ${v} erwartet.`, p_tomorrow0: 'Morgen kein Niederschlag erwartet.',
      v0: 'Nebel.', v1: 'Dunst.', v2: 'Leicht dunstig.', v3: 'Gute Sicht.', v4: 'Klare Sicht.', h_dew: (v) => `Der Taupunkt liegt bei ${v}.`,
      pr_up: 'steigend', pr_down: 'fallend', pr_same: 'gleichbleibend', pr_24: 'letzte 24 Std.', last: (n, u) => (n === 1 ? (u === 'd' ? 'letzter Tag' : 'letzte Stunde') : `letzte ${n} ${u === 'd' ? 'Tage' : 'Std.'}`), ago: (n, u) => `vor ${n} ${u === 'd' ? (n === 1 ? 'Tag' : 'Tagen') : 'Std.'}`, ax_now: 'jetzt', e_period_unit: 'Einheit', u_h: 'Stunden', u_d: 'Tage',
      uv_protect: (a, b) => `Sonnenschutz von ${a} bis ${b} empfohlen`, uv_none: 'Kein Sonnenschutz nötig', uv_peak: (v, at) => `Höchstwert ${v} um ${at}`,
      rn_start: (at) => `Niederschlag ab ${at}`, rn_stop: (at) => `Hört gegen ${at} auf`, rn_none: (hh) => `Kein Niederschlag in den nächsten ${hh} Std.`, rn_cont: 'Hält an', rn_next: 'nächste Stunde',
      daylen: (h, m) => ['Tageslänge', `${h} Std. ${m} Min.`], dusk: (at) => ['Dämmerung bis', at], dawn: (at) => ['Dämmerung ab', at], golden: (at) => ['Goldene Stunde ab', at],
      e_size: 'Größe', e_small: 'Klein (4 × 3)', e_medium: 'Mittel (8 × 3)', e_size_h: 'Mittel zeigt bei UV, Niederschlag, Luftdruck und Sonne einen Verlauf.', e_kind: 'Wert', e_sensor: 'Eigener Sensor (optional)', e_sensor_h: 'Ersetzt den Hauptwert, z. B. von deiner Wetterstation.', e_sensor2: 'Zweiter eigener Sensor (optional)', e_sensor2_h: 'Gefühlt: tatsächliche Temperatur · Feuchtigkeit: Taupunkt.', today: 'Heute', days: (n) => `${n} Tage`, d_rain: 'Niederschlag', d_wind: 'Wind', e_days: 'Anzahl der Tage', e_link: 'Mit anderen Kacheln koppeln', e_link_h: 'Umschalten zwischen Temperatur, Niederschlag und Wind wirkt auf alle gekoppelten Kacheln der Seite.', d_daily: 'Tagesvorhersage: Temperatur, Niederschlag, Wind.', d_sky: 'Animierter Himmel als Hintergrund der ganzen Seite, passend zur Wetterlage.', e_test: 'Wetterlage testen (optional)', e_test_h: 'Zeigt dauerhaft diese Wetterlage – zum Ausprobieren. Für den Betrieb leer lassen.', e_fps: 'Bilder pro Sekunde', e_fps_h: 'Weniger Bilder schonen ältere Tablets.', d_hourly: 'Stündliche Vorhersage: Temperatur, Niederschlag, Wind.',
    },
    en: {
      e_total: 'Rain counter (precipitation)', e_total_h: 'Precipitation only: a total-rain counter, for the bars of the last 24 h / 7 days.', e_period: 'Period (precipitation and pressure, medium)',
      n_page: 'Weather page', d_page: 'Whole weather page: arranges all tiles by importance on its own.', e_feels_like: 'Feels-like temperature', e_humidity: 'Humidity', e_dewpoint: 'Dew point', e_pressure: 'Pressure', e_uv: 'UV index', e_rain_today: 'Precipitation today', e_rain_total: 'Total rain counter', e_map: 'Weather map (WeatherScope sensor)', e_sensors: 'Own sensors (replace the values of the weather service)',
      hi: 'H', lo: 'L', home: 'Home', now: 'Now', hourly: 'Hourly', sunrise: 'Sunrise', sunset: 'Sunset',
      m_temp: 'Temperature ({u})', m_rain: 'Precipitation ({u})', m_wind: 'Wind and gusts ({u})', max: 'max', loading: 'Loading forecast …',
      e_entity: 'Weather entity', e_temperature: 'Own temperature sensor (optional)', e_name: 'Place name (optional)', e_background: 'Background',
      e_sky: 'Own sky', e_glass: 'Glass', e_none: 'Transparent', e_temperature_h: 'For example the outdoor temperature of your weather station. Leave empty to use the weather entity.',
      e_fx: 'Weather animation', e_animation: 'Animate the sky', e_animation_h: 'Clouds, rain, snow, fog and thunderstorms behind the tiles – follows the current weather.', e_fx_tiles: 'Weather on the tiles', e_fx_tiles_h: 'Drops, settled snow and wisps of fog on the tiles.', e_performance: 'Performance', e_performance_h: '“Economy” for weaker devices such as wall tablets, “Still image” without motion.', e_perf_full: 'Full', e_perf_eco: 'Economy', e_perf_still: 'Still image', e_meteors: 'Shooting stars', e_meteors_h: 'Rare, only in a clear night sky.',
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
      p_today: 'Today', p_24h: 'last 24 h', p_7d: 'last 7 days', p_next0: 'None expected in the next 24 h.', p_next_lt: (v) => `< ${v} expected in the next 24 h.`, p_next: (v) => `${v} expected in the next 24 h.`, p_tomorrow: (v) => `${v} expected tomorrow.`, p_tomorrow0: 'None expected tomorrow.',
      v0: 'Fog.', v1: 'Haze.', v2: 'Slightly hazy.', v3: 'Good visibility.', v4: 'Clear view.', h_dew: (v) => `The dew point is ${v} right now.`,
      pr_up: 'rising', pr_down: 'falling', pr_same: 'steady', pr_24: 'last 24 h', last: (n, u) => (n === 1 ? (u === 'd' ? 'last day' : 'last hour') : `last ${n} ${u === 'd' ? 'days' : 'h'}`), ago: (n, u) => `${n} ${u === 'd' ? (n === 1 ? 'day' : 'days') : 'h'} ago`, ax_now: 'now', e_period_unit: 'Unit', u_h: 'hours', u_d: 'days',
      uv_protect: (a, b) => `Sun protection recommended ${a}–${b}`, uv_none: 'No sun protection needed', uv_peak: (v, at) => `Maximum ${v} at ${at}`,
      rn_start: (at) => `Precipitation from ${at}`, rn_stop: (at) => `Stopping around ${at}`, rn_none: (hh) => `No precipitation in the next ${hh} h`, rn_cont: 'Continuing', rn_next: 'next hour',
      daylen: (h, m) => ['Day length', `${h} h ${m} min`], dusk: (at) => ['Dusk until', at], dawn: (at) => ['Dawn from', at], golden: (at) => ['Golden hour from', at],
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
    if (bg === 'glass') return 'background:rgba(32,62,112,var(--ws-glass,.38));-webkit-backdrop-filter:blur(16px) saturate(170%);backdrop-filter:blur(16px) saturate(170%);border:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.12),inset 0 1px 0 rgba(255,255,255,.18)';
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

  // bars on whole (device) pixels: equal width, equal gaps, sharp edges. Percent layout stays as fallback.
  const snapBars = (root) => {
    if (!root) return;
    const d = window.devicePixelRatio || 1, fl = (x) => Math.floor(x * d) / d, rd = (x) => Math.round(x * d) / d;
    root.querySelectorAll('.ch').forEach((ch) => {
      const cbs = [...ch.children].filter((e) => e.classList.contains('cb')), n = cbs.length, R = ch.getBoundingClientRect(), w = R.width;
      if (!n || w < n) return;
      const slot = fl(w / n), gap = Math.max(1 / d, rd(slot * 0.3)), bw = slot - gap, off = fl(gap / 2);
      let ex = rd(R.left + (w - slot * n)) - R.left; if (ex + slot * n > w + 0.01) ex -= 1 / d; if (ex < 0) ex += 1 / d;
      cbs.forEach((cb, k) => {
        cb.style.left = `${ex + k * slot}px`; cb.style.width = `${slot}px`;
        cb.querySelectorAll('em,i').forEach((x) => { x.style.left = `${off}px`; x.style.right = 'auto'; x.style.width = `${bw}px`; });
      });
      ch.querySelectorAll('.ax,.nw').forEach((x) => {
        if (!x.dataset.p) x.dataset.p = x.style.left || '';
        const p = x.dataset.p;
        if (p.endsWith('%')) x.style.left = `${ex + (parseFloat(p) / 100) * n * slot}px`;
        else if (p === '0px' || p === '0') x.style.left = `${ex}px`;
      });
    });
    root.querySelectorAll('.bk').forEach((bk) => {
      const is = [...bk.children], n = is.length, R = bk.getBoundingClientRect(), g = 3;
      if (!n || R.width < n * 2) return;
      const bw = fl((R.width - g * (n - 1)) / n), tot = bw * n + g * (n - 1), st = fl(R.left + R.width - tot) - R.left;
      bk.style.justifyContent = 'flex-start';
      is.forEach((x, k) => { x.style.flex = 'none'; x.style.width = `${bw}px`; x.style.marginLeft = k ? '' : `${Math.max(0, st)}px`; });
    });
    root.querySelectorAll('.vb').forEach((vb) => { vb.style.transform = ''; const x = vb.getBoundingClientRect().left, dx = rd(x) - x; if (Math.abs(dx) > 0.01) vb.style.transform = `translateX(${dx}px)`; });
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
    _sq() { if (this._c) sqFit(this, this._c, this._grid()); requestAnimationFrame(() => snapBars(this.shadowRoot)); }
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
    _paint(html) { this.shadowRoot.innerHTML = html; requestAnimationFrame(() => snapBars(this.shadowRoot)); }
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
      requestAnimationFrame(() => snapBars(this.shadowRoot));
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
  // look-back period of the medium precipitation / pressure tiles: 1-24 hours or 1-31 days
  const periodOf = (c) => {
    let n = num(c.period), u = c.period_unit === 'd' ? 'd' : 'h';
    if (typeof c.period === 'string' && /^\d+[hd]$/.test(c.period)) { n = parseInt(c.period, 10); u = c.period.slice(-1); }
    if (!n || n < 1) { n = 24; u = 'h'; }
    n = Math.round(Math.min(n, u === 'd' ? 31 : 24));
    return { n, u, ms: n * (u === 'd' ? 864e5 : 36e5) };
  };
  class ValueCard extends WSBase {
    static defaults = { entity: 'weather.weatherscope', kind: 'feels', background: 'sky', size: 'small' };
    static forecast = ['daily', 'hourly'];
    static getStubConfig(h) { return { ...WSBase.getStubConfig(h), kind: 'feels' }; }
    getCardSize() { return 3; }
    _grid() { return this._c && this._c.size === 'medium' ? { columns: 8, rows: 3, min_columns: 6, min_rows: 3 } : { columns: 4, rows: 3, min_columns: 4, min_rows: 3 }; }
    connectedCallback() { super.connectedCallback(); this._tick = setInterval(() => { if (this._c && (this._c.kind === 'sun' || this._c.kind === 'pressure')) { this._last = null; this._render(); } }, 60000); }
    disconnectedCallback() { super.disconnectedCallback(); clearInterval(this._tick); }
    // pressure trend: change over the last 3 hours from the recorder
    // long-term statistics (kept indefinitely by Home Assistant): [[start ms, value]]
    _stats(h, id, start, period, type) {
      const key = `${id}|${start}|${period}|${type}|${Math.floor(Date.now() / 6e5)}`;
      this._st = this._st || {};
      if (!this._st[key] && !this._st[`${key}|busy`]) {
        this._st[`${key}|busy`] = true;
        h.callWS({ type: 'recorder/statistics_during_period', start_time: new Date(start).toISOString(), statistic_ids: [id], period, types: [type], units: {} })
          .then((r) => { this._st[key] = ((r && r[id]) || []).map((q) => [typeof q.start === 'number' ? q.start : new Date(q.start).getTime(), num(q[type])]).filter((q) => q[1] !== null); this._last = null; this._render(); })
          .catch(() => { this._st[key] = []; });
      }
      return this._st[key] || null;
    }
    // precipitation per bucket (hour or day) that has already fallen, from the history of a rain counter
    // (total counter, or a daily counter that resets at midnight), else WeatherScope's last-24-hours sensor
    _rainBars(h, c, pp, unit) {
      // bucket size: hours up to 24 h, 3 hours for 2-3 days, days from 4 days on
      const now = Date.now(), days = pp.u === 'd' ? pp.n : 0, step = !days ? 36e5 : days <= 3 ? 108e5 : 864e5;
      const n = !days ? pp.n : days <= 3 ? days * 8 : days;
      const starts = []; const d0 = new Date(now);
      if (step === 864e5) { d0.setHours(0, 0, 0, 0); for (let k = n - 1; k >= 0; k--) { const d = new Date(d0); d.setDate(d.getDate() - k); starts.push(d.getTime()); } }
      else { d0.setMinutes(0, 0, 0); if (step === 108e5) d0.setHours(Math.floor(d0.getHours() / 3) * 3); for (let k = n - 1; k >= 0; k--) starts.push(d0.getTime() - k * step); }
      const id = c.total || c.sensor || (days ? 'sensor.weatherscope_precipitation_today' : null);
      // longer periods: hourly / daily rain from the long-term statistics (kept indefinitely)
      if (id && days) {
        const stt = this._stats(h, id, starts[0], step === 864e5 ? 'day' : 'hour', 'change');
        if (stt === null) return null;
        if (stt.length) {
          const u = h.states[id] && h.states[id].attributes.unit_of_measurement;
          const out = starts.map((s0) => [s0, 0]);
          stt.forEach(([tq, vq]) => { const i = out.findIndex((o, k) => tq >= o[0] && tq < (out[k + 1] ? out[k + 1][0] : o[0] + step)); if (i >= 0 && vq > 0) out[i][1] += conv(vq, u, unit); });
          return out;
        }
      }
      if (!id) {
        const ws = h.states['sensor.weatherscope_precipitation_24h'], hrs = ws && Array.isArray(ws.attributes.hours) ? ws.attributes.hours : [];
        // each value is the hour that ends at its time stamp
        return starts.map((s0) => { const q = hrs.find((x) => { const te = new Date(x[0]).getTime(); return te > s0 && te <= s0 + 36e5; }); return [s0, q ? conv(num(q[1]) || 0, 'mm', unit) : 0]; });
      }
      const key = `${id}|${pp.n}${pp.u}|${Math.floor(now / 6e5)}`;
      if (this._rbK !== key && !this._rbBusy) {
        this._rbBusy = true;
        h.callWS({ type: 'history/history_during_period', start_time: new Date(starts[0] - 36e5).toISOString(), entity_ids: [id], minimal_response: true, no_attributes: true, significant_changes_only: false })
          .then((r) => { const u = h.states[id] && h.states[id].attributes.unit_of_measurement; this._rbPts = ((r && r[id]) || []).map((q) => [(q.lu || q.lc || 0) * 1000 || new Date(q.last_updated || q.last_changed).getTime(), conv(num(q.s ?? q.state), u, unit)]).filter((q) => q[1] !== null); this._rbK = key; this._last = null; this._render(); })
          .catch(() => {}).finally(() => { this._rbBusy = false; });
      }
      if (!this._rbPts) return null;
      const out = starts.map((s0) => [s0, 0]), size = step;
      let prev = null;
      for (const [tq, vq] of this._rbPts) {
        if (prev !== null) { const dv = vq - prev, add = dv < 0 ? vq : dv; const i = out.findIndex((o, k) => tq >= o[0] && tq < (out[k + 1] ? out[k + 1][0] : o[0] + size)); if (i >= 0 && add > 0) out[i][1] += add; }
        prev = vq;
      }
      return out;
    }
    async _trend(h, id, attr) {
      const key = `${id}|${Math.floor(Date.now() / 6e5)}`;
      if (this._trK === key || this._trBusy) return;
      this._trBusy = true;
      try {
        const start = new Date(Date.now() - Math.min(10 * 864e5, Math.max(24 * 36e5, (this._c && periodOf(this._c).ms) || 0))).toISOString();
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
          // one value per row, label left and value right (like the average tile)
          sub = note; note = parts.length ? `<span class="nt">${parts.map(([l, v]) => `<span>${l}</span><b>${v}</b>`).join('')}</span>` : '';
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
          const hs = hourly.filter((x) => { const q = new Date(x.datetime).getTime(); return q >= d0.getTime() && q < d0.getTime() + 864e5 && num(x.uv_index) !== null; });
          // one column per hour from the hour of sunrise to the hour of sunset (recomputed daily for the location);
          // an hour outside with UV above 0 from the service is added, polar night shows no columns
          const rs = sunTimes(new Date(d0.getTime() + 432e5), h.config.latitude, h.config.longitude, -0.833), hr = (q) => Math.floor(q / 36e5) * 36e5;
          const past0 = c.sensor ? this._stats(h, c.sensor, d0.getTime(), 'hour', 'mean') : null;
          const lit = [...hs.filter((x) => num(x.uv_index) > 0).map((x) => hr(new Date(x.datetime).getTime())), ...(past0 || []).filter((q) => q[1] > 0).map((q) => hr(q[0]))];
          let a = rs ? hr(rs[0].getTime()) : null, b = rs ? hr(rs[1].getTime()) : null;
          if (lit.length) { a = Math.min(a ?? Infinity, ...lit); b = Math.max(b ?? -Infinity, ...lit); }
          if (!rs && !lit.length && hs.length && num(A.uv_index) > 0) { a = d0.getTime(); b = d0.getTime() + 23 * 36e5; }
          if (a !== null && b !== null && b >= a) {
            const n = Math.round((b - a) / 36e5) + 1, W = 100 / n, byH = new Map(hs.map((x) => [hr(new Date(x.datetime).getTime()), num(x.uv_index)]));
            // hours already past: hourly mean of the own UV sensor (the service only delivers from now on)
            if (past0) past0.forEach(([q, u]) => { if (q < hr(now) && q >= a && q <= b) byH.set(hr(q), u); });
            const wmax = Math.max(0, ...byH.values()), LIM = [3, 6, 8, 11], top = LIM.find((x) => wmax <= x) ?? Math.ceil(wmax);
            const marks = [0, ...LIM.filter((x) => x < top), top];
            let cols = '', axis = '';
            for (let k = 0; k < n; k++) {
              const q = a + k * 36e5, u = byH.get(q), hh = new Date(q).getHours();
              cols += `<div class="cb slot" style="left:${k * W}%;width:${W}%"><em></em>${u !== undefined && u > 0 ? `<i style="height:${Math.max(4, Math.min(100, (u / top) * 100))}%;background:${UVC[uvStage(u)]}"></i>` : ''}</div>`;
              if (hh % 3 === 0) axis += `<span class="ax" style="left:${(k + 0.5) * W}%;transform:translateX(-50%)">${hh}</span>`;
            }
            const nowX = ((now - a) / (n * 36e5)) * 100;
            chart = `<div class="rc"><div class="ch">${cols}${axis}${nowX >= 0 && nowX <= 100 ? `<b class="nw" style="left:${nowX}%"></b>` : ''}</div><div class="pv"><b>${marks.map(String).sort((x, y) => y.length - x.length)[0]}</b>${marks.map((m) => `<span style="top:${100 - (m / top) * 100}%">${m}</span>`).join('')}</div></div>`;
          }
          if (hs.length) {
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
          // what has already fallen: 24 hourly bars (or 7 daily bars), ending now; below an outlook for the next 24 hours
          const pp = periodOf(c), bars = this._rainBars(h, c, pp, U.p);
          if (bars && bars.length) {
            const total = bars.reduce((x, q) => x + q[1], 0), W = 100 / bars.length;
            // scale on the right: grows with the wettest bar, rounded up to a plain number (5, 10, 20, 50, 100 …), at least 5 mm
            const wet = Math.max(...bars.map((q) => q[1])), steps = U.p === 'in' ? [0.2, 0.5, 1, 2, 5, 10, 20, 50] : [5, 10, 20, 50, 100, 200, 500, 1000];
            const top = steps.find((x) => wet <= x + 1e-9) ?? Math.ceil(wet), fsc = (x) => x.toLocaleString(L, { maximumFractionDigits: 2 });
            big = `${dec(h, total, U.p)} ${U.p}`; sub = t.last(pp.n, pp.u);
            const wdf = new Intl.DateTimeFormat(L, { weekday: 'short' });
            const daily = pp.u === 'd' && pp.n >= 4, every = Math.max(1, Math.ceil(bars.length / 5));
            const lab = (q, k) => ((bars.length - 1 - k) % every !== 0 ? '' : daily ? (pp.n <= 7 ? wdf.format(new Date(q[0])).replace('.', '') : new Date(q[0]).getDate() + '.') : pp.u === 'd' ? wdf.format(new Date(q[0])).replace('.', '') + ' ' + hhmm(h, new Date(q[0])).slice(0, 2) : hhmm(h, new Date(q[0])));
            chart = `<div class="rc"><div class="ch">${bars.map((q, k) => `<div class="cb slot" style="left:${k * W}%;width:${W}%"><em></em><i style="height:${q[1] > 0 ? Math.max(6, (q[1] / top) * 100) : 0}%;background:#5ac8fa"></i></div>${lab(q, k) && !(k === bars.length - 1 && !daily && bars.length > 10) ? `<span class="ax" style="${k === bars.length - 1 ? 'right:0' : k === 0 ? 'left:0' : `left:${(k + 0.5) * W}%;transform:translateX(-50%)`}">${lab(q, k)}</span>` : ''}`).join('')}</div><div class="pv"><b>${[fsc(top), fsc(top / 2)].sort((x, y) => y.length - x.length)[0]}</b><span style="top:0">${fsc(top)}</span><span style="top:50%">${fsc(top / 2)}</span><span style="top:100%">0</span></div></div>`;
          }
          if (hourly.length) {
            const nx = hourly.filter((x) => { const tt = new Date(x.datetime).getTime(); return tt > now && tt <= now + 864e5; }).reduce((x, q) => x + (num(q.precipitation) || 0), 0);
            note = nx < conv(0.1, 'mm', U.p) ? t.p_next0 : nx < conv(1, 'mm', U.p) ? t.p_next_lt(`1 ${U.p}`) : t.p_next(`${dec(h, nx, U.p)} ${U.p}`);
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
        big = ''; note = med ? `<span class="ti"><ha-icon icon="${arrow}"></ha-icon>${t[d > 1 ? 'pr_up' : d < -1 ? 'pr_down' : 'pr_same']}</span>` : '';
        {
          // small and medium: crop to the gauge circle so it matches the moon; low/high marks sit at the two ends of the scale
          const ends = `<text x="${cx - 17}" y="${cy + 33}" text-anchor="middle" fill="rgba(255,255,255,.8)" font-size="9">↓</text><text x="${cx + 17}" y="${cy + 33}" text-anchor="middle" fill="rgba(255,255,255,.8)" font-size="9">↑</text>`;
          viz = `<div class="pic">${viz.replace(/<text[^>]*>↓<\/text><text[^>]*>↑<\/text>/, ends).replace('class="gv" viewBox="0 0 120 88"', `viewBox="${cx - 36.96} ${cy - 36.96} 73.92 73.92"`)}</div>`;
          if (!med) note = '';
        }
        if (med) {
          const pp = periodOf(c), t0 = now - pp.ms, su = c.sensor ? h.states[c.sensor] && h.states[c.sensor].attributes.unit_of_measurement : pu;
          let P = null;
          if (pp.ms > 864e5 && c.sensor) {
            // longer than a day: hourly (up to 7 days) or daily means from the long-term statistics
            const stt = this._stats(h, c.sensor, t0, pp.ms > 7 * 864e5 ? 'day' : 'hour', 'mean');
            if (stt && stt.length > 1) P = stt.map((q) => [q[0] + (pp.ms > 7 * 864e5 ? 432e5 : 18e5), conv(q[1], su, pu)]);
          }
          if (!P && this._series && this._series.length > 1) {
            // up to a day (or no statistics): the exact history, smoothed to about 48 points over the period
            const slot = Math.max(3e5, pp.ms / 48), P0 = this._series.filter((q) => q[0] >= t0).map((q) => [q[0], c.sensor ? conv(q[1], su, pu) : q[1]]);
            const slots = new Map(); P0.forEach(([tq, vq]) => { const k = Math.floor(tq / slot); const a = slots.get(k) || [0, 0]; a[0] += vq; a[1] += 1; slots.set(k, a); });
            P = [...slots.entries()].sort((x, y) => x[0] - y[0]).map(([k, a]) => [k * slot + slot / 2, a[0] / a[1]]);
          }
          if (P && P.length > 1) {
            const lo0 = Math.min(...P.map((q) => q[1]), v ?? Infinity), hi0 = Math.max(...P.map((q) => q[1]), v ?? -Infinity), mr = pu === 'inHg' ? 0.06 : 2, ex = Math.max(0, (mr - (hi0 - lo0)) / 2);
            const lo = lo0 - ex, hi = hi0 + ex;
            // highest value on the top line, lowest on the bottom line: the numbers in their own column sit exactly at that height
            const X = (q) => Math.max(0, ((q - t0) / pp.ms) * 200), Y = (val) => 56 - ((val - lo) / (hi - lo)) * 52;
            // gaps in the data (e.g. statistics only since a few days) stay gaps instead of a straight connecting line
            const step = P.length > 1 ? Math.min(...P.slice(1).map((q, k) => q[0] - P[k][0]).filter((x) => x > 0)) : 36e5, segs = [[]];
            P.forEach((q, k) => { if (k && q[0] - P[k - 1][0] > 2.5 * step) segs.push([]); segs[segs.length - 1].push(q); });
            if (v !== null) segs[segs.length - 1].push([now, v]);
            const pts = (sg) => sg.map((q, k) => `${k ? 'L' : 'M'}${X(q[0]).toFixed(1)} ${Y(q[1]).toFixed(1)}`).join(' ');
            const area = segs.filter((sg) => sg.length > 1).map((sg) => `${pts(sg)} L${X(sg[sg.length - 1][0]).toFixed(1)} 60 L${X(sg[0][0]).toFixed(1)} 60 Z`).join(' ');
            const line = segs.filter((sg) => sg.length > 1).map(pts).join(' ');
            const fmtp = (x) => (pu === 'inHg' ? x.toFixed(2) : Math.round(x).toLocaleString(L));
            chart = `<div class="pc"><div class="pp"><svg viewBox="0 0 200 60" preserveAspectRatio="none"><path d="${area}" fill="rgba(127,212,255,.18)"/><path d="${line}" fill="none" stroke="#7fd4ff" stroke-width="2" vector-effect="non-scaling-stroke"/></svg></div><div class="pv"><b>${fmtp(hi).length >= fmtp(lo).length ? fmtp(hi) : fmtp(lo)}</b><span style="top:6.67%">${fmtp(hi)}</span><span style="top:93.33%">${fmtp(lo)}</span></div><div class="pa"><span>${t.ago(pp.n, pp.u)}</span><span>${t.ax_now}</span></div></div>`;
          }
        }
      }
      return `
<style>${baseCss(h, s, c.background)}
.big{margin-top:6px}.sub{margin-top:2px}
.svw{position:relative;width:100%;flex:1;min-height:36px;margin:6px 0 4px}.svw svg{width:100%;height:100%;display:block}
.sd{position:absolute;width:8px;height:8px;border-radius:50%;background:#fff;transform:translate(-50%,-50%);box-shadow:0 0 6px 3px rgba(255,255,255,.5)}.sd.dn{background:rgba(0,0,0,.3);box-shadow:none}
.gv{width:100%;flex:1;min-height:0;max-height:118px;margin-top:2px;display:block}
.ti{display:flex;align-items:center;gap:4px;height:16px;line-height:16px}.ti ha-icon{--mdc-icon-size:14px;display:flex}
${picCss}
.uvb{position:relative;height:6px;margin-top:10px;border-radius:3px}.uvb b{position:absolute;top:-3px;width:8px;height:8px;border-radius:50%;background:#fff;border:2px solid rgba(20,40,80,.6);transform:translateX(-50%)}
.note{line-height:1.3}.note ha-icon{--mdc-icon-size:13px;vertical-align:-2px}
.md{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,34%) minmax(0,1fr);gap:14px;align-items:stretch}
.ml{display:flex;flex-direction:column;min-width:0}.mr{position:relative;min-width:0;padding-top:6px}
.ch{position:absolute;inset:6px 0 16px 0}.rc{position:absolute;inset:6px 0 0 0;display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:minmax(0,1fr) 16px;column-gap:8px;font-size:12px;line-height:12px;color:rgba(255,255,255,.7)}.rc .ch{position:relative;inset:auto}.cb{position:absolute;top:0;bottom:0;display:flex;justify-content:center}
.cb i{position:absolute;bottom:0;left:15%;right:15%;border-radius:3px 3px 1px 1px;display:block}
.cb.slot em{position:absolute;top:0;bottom:0;left:15%;right:15%;border-radius:3px;background:rgba(0,0,0,.18)}
.ch .ax{position:absolute;bottom:-16px;font-size:12px;color:rgba(255,255,255,.75);white-space:nowrap;transform:translateX(0)}
.ch .base{position:absolute;left:0;right:0;bottom:0;border-top:1px solid rgba(255,255,255,.25)}
.nw{position:absolute;top:0;bottom:0;border-left:1.5px dashed rgba(255,255,255,.85)}
.pc{position:absolute;inset:6px 0 0 0;display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:minmax(0,1fr) 16px;column-gap:8px;font-size:12px;line-height:12px;color:rgba(255,255,255,.7)}
.pp{position:relative;min-height:0}.pp svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.pv{position:relative;min-height:0;white-space:nowrap}.pv b{display:block;height:0;overflow:hidden;font-weight:400}.pv span{position:absolute;right:0;transform:translateY(-50%)}
.pa{grid-column:1;display:flex;justify-content:space-between;align-items:flex-end;white-space:nowrap}
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
    { name: 'total', ...sensorSel() },
    { type: 'grid', name: '', schema: [
      { name: 'period', selector: { number: { min: 1, max: 31, step: 1, mode: 'box' } } },
      { name: 'period_unit', selector: { select: { mode: 'dropdown', options: [{ value: 'h', label: t.u_h }, { value: 'd', label: t.u_d }] } } },
    ] },
    bgSchema(t),
  ], { size: 'e_size_h', sensor: 'e_sensor_h', sensor2: 'e_sensor2_h', total: 'e_total_h', background: 'e_background_h' });
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
      // the arrow points where the wind blows to (from the bearing it comes from); it stops at the centre disc and at the tail ring
      const arrow = wb === null ? '' : `<g transform="rotate(${wb + 180} ${cx} ${cy})"><line x1="${cx}" y1="${cy + R - 8}" x2="${cx}" y2="${cy + 21}" stroke="#fff" stroke-width="2.2"/><line x1="${cx}" y1="${cy - 21}" x2="${cx}" y2="${cy - R + 10}" stroke="#fff" stroke-width="2.2"/><polygon points="${cx},${cy - R + 2} ${cx - 6},${cy - R + 13} ${cx + 6},${cy - R + 13}" fill="#fff"/><circle cx="${cx}" cy="${cy + R - 4}" r="4" fill="none" stroke="#fff" stroke-width="2"/></g>`;
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
  // European Air Quality Index (EEA, current version): each pollutant gets its own stage from its concentration (µg/m³),
  // the worst one decides. Upper limits of stages 1-5; above the last one = stage 6 "extremely poor".
  const EAQI = [['pm25', 'PM2,5', [5, 15, 50, 90, 140]], ['pm10', 'PM10', [15, 45, 120, 195, 270]], ['o3', 'O₃', [60, 100, 120, 160, 180]], ['no2', 'NO₂', [10, 25, 60, 100, 150]], ['so2', 'SO₂', [20, 40, 125, 190, 275]]];
  const EAQI_DEF = { aqi: 'sensor.weatherscope_air_quality_index', pm25: 'sensor.weatherscope_pm2_5', pm10: 'sensor.weatherscope_pm10', o3: 'sensor.weatherscope_o3', no2: 'sensor.weatherscope_no2', so2: 'sensor.weatherscope_so2' };
  const airStage = (h, c) => {
    const val = (key) => { const e = h.states[c[key] || EAQI_DEF[key]]; return e ? num(e.state) : null; };
    const P = EAQI.map(([k, name, lim]) => {
      const v = val(k); if (v === null) return null;
      const st = lim.findIndex((x) => v <= x), s2 = st < 0 ? 5 : st, lo = s2 ? lim[s2 - 1] : 0, hi = s2 < 5 ? lim[s2] : lim[4] * 1.5;
      return { name, v, st: s2, f: Math.max(0, Math.min(0.95, (v - lo) / (hi - lo))) };
    }).filter(Boolean);
    if (P.length) {
      const main = P.slice().sort((x, y) => y.st - x.st || y.f - x.f)[0];
      return { st: main.st, pos: ((main.st + main.f) / 6) * 100, main: main.name, P, idx: null };
    }
    // no single pollutants: fall back to an overall index number (older 0-100+ scale)
    const v = val('aqi');
    return v === null ? { st: null, pos: 0, main: null, P: [], idx: null } : { st: aqStage(v), pos: Math.min(100, (v / 120) * 100), main: null, P: [], idx: v };
  };
  class AirCard extends WSBase {
    static defaults = { entity: 'weather.weatherscope', background: 'sky', size: 'medium' };
    static getStubConfig(h) { return { ...WSBase.getStubConfig(h), size: 'medium' }; }
    getCardSize() { return 3; }
    _grid() { return this._c && this._c.size === 'small' ? { columns: 4, rows: 3, min_columns: 4, min_rows: 3 } : { columns: 8, rows: 3, min_columns: 6, min_rows: 3 }; }
    _html(h, s, t) {
      const c = this._c, A = airStage(h, c);
      const bar = `<div class="aqb" style="background:${AQG}">${A.st === null ? '' : `<b style="left:${A.pos}%"></b>`}</div>`;
      const lab = `<div class="lab"><ha-icon icon="mdi:air-filter"></ha-icon>${t.n_air}</div>`;
      const css = `${baseCss(h, s, c.background)}.aqb{position:relative;height:6px;border-radius:3px;margin-top:10px}.aqb b{position:absolute;top:-3px;width:8px;height:8px;border-radius:50%;background:#fff;border:2px solid rgba(20,40,80,.6);transform:translateX(-50%)}.big{font-size:22px;font-weight:500;margin-top:8px}`;
      const name = A.st === null ? '–' : t.aq[A.st];
      const mainL = A.main ? t.aq_main(A.main) : A.idx !== null ? t.aq_idx(Math.round(A.idx)) : '';
      if (c.size === 'small') return `<style>${css}</style><ha-card>${lab}<div class="big">${name}</div>${bar}<div class="note">${mainL}</div></ha-card>`;
      const pol = A.P.map((q) => `${q.name} ${Math.round(q.v)}`).join(' · ');
      return `<style>${css}</style><ha-card>${lab}<div class="big">${name}</div>${bar}
<div class="note">${pol ? `${pol} µg/m³` : ''}${pol && mainL ? '<br>' : ''}${mainL}</div></ha-card>`;
    }
  }
  register('weatherscope-air-card', AirCard, makeEditor((t) => [
    { name: 'size', selector: { select: { mode: 'dropdown', options: [{ value: 'small', label: t.e_small }, { value: 'medium', label: t.e_medium }] } } },
    { name: 'aqi', ...sensorSel() }, { name: 'pm25', ...sensorSel() }, { name: 'pm10', ...sensorSel() }, { name: 'no2', ...sensorSel() }, { name: 'o3', ...sensorSel() }, { name: 'so2', ...sensorSel() },
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


  // ---------------------------------------------------------------- Weather page (arranges all tiles by importance)
  // Grid of 6 squares: row 0 = slot A (2) + hourly (4); rows 1-3 = left column (2 wide) + 10 days (2x3) + map (2x3);
  // row 4 (and more if needed) = the rest. Important tiles move up and, where they have a medium size, grow.
  const P_MED = ['air', 'wind', 'moon', 'sun', 'uv', 'precip', 'pressure'];
  const P_SMALL = ['sun', 'uv', 'moon', 'wind', 'air', 'feels', 'normal', 'precip', 'visibility', 'humidity', 'pressure'];
  const P_TILES = ['air', 'wind', 'moon', 'sun', 'uv', 'precip', 'pressure', 'feels', 'normal', 'visibility', 'humidity'];
  class PageCard extends WSBase {
    static defaults = { entity: 'weather.weatherscope', background: 'glass', map: 'sensor.weatherscope_map_data', animation: true, fx_tiles: true, performance: 'full', meteors: true };
    static forecast = ['hourly', 'daily'];
    getCardSize() { return 20; }
    _grid() { return { columns: 'full', rows: 'auto' }; }
    connectedCallback() {
      super.connectedCallback();
      this._pro = new ResizeObserver(() => this._unit()); this._pro.observe(this);
    }
    disconnectedCallback() { super.disconnectedCallback(); if (this._pro) this._pro.disconnect(); this._fxStop(); }
    // ---- weather animation: sky behind the tiles, weather on the tiles (engine: weatherscope-fx.js)
    _fxStop() {
      if (!this._fx) return;
      this._fx.stop(); this._fx = null;
      window.removeEventListener('resize', this._fxRs);
      [this._fxB, this._fxF].forEach((c) => c && c.remove()); this._fxB = this._fxF = null;
      this.style.removeProperty('--ws-glass');
    }
    _fxRects() {
      const out = [];
      Object.entries(this._els || {}).forEach(([k, e]) => { const r = e.getBoundingClientRect(); if (r.width > 40 && r.height > 40) out.push({ key: k, rect: r }); });
      return out;
    }
    // what the sky should show, from the weather entity and the sensors of this page
    _fxScene(h, s) {
      const c = this._c, A = s.attributes, U = units(s), st = (id) => (id && h.states[id] ? h.states[id] : null), now = Date.now();
      const cond = c.fx_test || s.state;
      // precipitation right now in mm/h: 15-minute steps of WeatherScope, else the current hour of the forecast
      let rate = null;
      const nc = st(c.nowcast || 'sensor.weatherscope_precipitation_nowcast');
      if (nc && Array.isArray(nc.attributes.steps)) { const q = nc.attributes.steps.find((x) => { const t0 = new Date(x[0]).getTime(); return t0 <= now && t0 + 9e5 > now; }); if (q && num(q[1]) !== null) rate = num(q[1]) * 4; }
      if (rate === null) { const f = (this._fcs.hourly || [])[0]; if (f && num(f.precipitation) !== null) rate = num(f.precipitation); }
      const wet = rate === null ? 1 : rate;
      const mode = {
        sunny: 'sunny', 'clear-night': 'sunny', partlycloudy: 'partly', cloudy: 'dry', windy: 'dry', 'windy-variant': 'dry', fog: 'dry', exceptional: 'dry',
        rainy: wet < 0.5 ? 'drizzle' : wet <= 4 ? 'rain' : 'heavy', pouring: 'heavy', hail: 'heavy', lightning: 'storm', 'lightning-rainy': 'storm',
        snowy: wet > 1.5 ? 'snowh' : 'snow', 'snowy-rainy': 'sleet',
      }[cond] || 'dry';
      const vr = A.visibility_unit || 'km', vis = num(A.visibility), vkm = vis === null ? null : vr === 'mi' ? vis * 1.609 : vr === 'm' ? vis / 1000 : vis;
      // fog by visibility: below 200 m dense, below 1 km fog, below 5 km haze (not under a clear sky); the condition "fog" always shows fog
      const fog = Math.max(vkm === null ? 0 : vkm < 0.2 ? 3 : vkm < 1 ? 2 : vkm < 5 && !['sunny', 'clear-night', 'partlycloudy'].includes(cond) ? 1 : 0, cond === 'fog' ? 2 : 0);
      const sun = st('sun.sun'), el = sun ? num(sun.attributes.elevation) : null;
      const tod = sun && sun.state === 'below_horizon' ? 'night' : el !== null && el < 8 ? (sun.attributes.rising ? 'morning' : 'evening') : cond === 'clear-night' ? 'night' : 'day';
      const ws = sensor(h, c.wind_speed, U.w) ?? num(A.wind_speed), wb = num(st(c.wind_bearing) && st(c.wind_bearing).state) ?? num(A.wind_bearing);
      const tp = sensor(h, c.temperature, U.t) ?? num(A.temperature);
      const P = { full: { q: 1, fps: 30, maxDpr: 2, still: false }, eco: { q: 0.55, fps: 20, maxDpr: 1, still: false }, still: { q: 0.55, fps: 30, maxDpr: 1, still: true } }[c.performance] || {};
      return { mode, fog, tod, wind: ws === null ? 10 : Math.round(conv(ws, U.w, 'km/h')), dir: wb === null ? 270 : wb, temp: tp === null ? 5 : conv(tp, U.t, '°C'), on: c.fx_tiles !== false, meteors: c.meteors !== false, ...P };
    }
    _fxSync(h, s) {
      const on = this._c.animation !== false && this.isConnected && !this.preview && !lovelaceEdit() && typeof window.WeatherScopeFx === 'function';
      if (!on) { this._fxStop(); return; }
      if (!this._fx) {
        const mk = (z) => { const cv = document.createElement('canvas'); cv.style.cssText = `position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:${z}`; this.shadowRoot.appendChild(cv); return cv; };
        this._fxB = mk(-1); this._fxF = mk(1);
        this._fx = window.WeatherScopeFx(this._fxB, this._fxF, { rects: () => this._fxRects(), glass: (a) => this.style.setProperty('--ws-glass', a) });
        this._fx.set(this._fxScene(h, s));
        this._fxRs = () => this._fx && this._fx.resize(); window.addEventListener('resize', this._fxRs);
        this._fx.start();
      } else this._fx.set(this._fxScene(h, s));
    }
    _unit() {
      const g = this.shadowRoot && this.shadowRoot.getElementById('gr'); if (!g) return;
      const W = g.getBoundingClientRect().width; if (W) g.style.setProperty('--u', `${Math.floor((W - 5 * 8) / 6)}px`);
    }
    // what is important right now: key -> score (higher = more important)
    _importance(h, s) {
      const c = this._c, A = s.attributes, U = units(s), now = Date.now(), I = {};
      const hourly = this._fcs.hourly || [], daily = this._fcs.daily || [];
      const st = (id) => (id && h.states[id] ? h.states[id] : null);
      const warn = [c.warning, c.advance].some((id) => st(id) && num(st(id).state) > 0);
      // precipitation now or in the next 3 hours (15-minute steps from WeatherScope, else the hourly forecast)
      const nc = st(c.nowcast || 'sensor.weatherscope_precipitation_nowcast');
      let wet = !!(nc && Array.isArray(nc.attributes.steps) && nc.attributes.steps.some((q) => { const t = new Date(q[0]).getTime(); return t + 9e5 > now && t < now + 108e5 && num(q[1]) >= 0.1; }));
      if (!wet) wet = hourly.some((x) => { const t = new Date(x.datetime).getTime(); return t + 36e5 > now && t < now + 108e5 && (num(x.precipitation) || 0) >= 0.1; });
      if (wet) I.precip = 90;
      const vr = A.visibility_unit || 'km', vis = num(A.visibility), vkm = vis === null ? null : vr === 'mi' ? vis * 1.609 : vr === 'm' ? vis / 1000 : vis;
      if (vkm !== null && vkm < 1) I.visibility = 85;
      const gust = sensor(h, c.wind_gust, U.w) ?? num(A.wind_gust_speed);
      if (gust !== null && conv(gust, U.w, 'km/h') >= 40) I.wind = 80;
      if (c.pressure || A.pressure !== undefined) {
        ValueCard.prototype._trend.call(this, h, c.pressure || c.entity, c.pressure ? null : 'pressure');
        const p = c.pressure ? num(st(c.pressure) && st(c.pressure).state) : num(A.pressure);
        if (p !== null && this._trV !== null && this._trV !== undefined && p - this._trV <= -3) I.pressure = 75;
      }
      const uv = sensor(h, c.uv) ?? num(A.uv_index);
      if (uv !== null && uv >= 3) I.uv = 70;
      const aqs = airStage(h, c).st; // EU index: stage 4 "poor" or worse
      if (aqs !== null && aqs >= 3) I.air = 60;
      const sun = st('sun.sun'), up = !sun || sun.state === 'above_horizon';
      const nx = sun ? new Date(up ? sun.attributes.next_setting : sun.attributes.next_rising).getTime() : null;
      if (nx && nx > now && nx - now < 72e5) I.sun = 50;
      if (!up) I.moon = 40;
      const t0 = sensor(h, c.temperature, U.t) ?? num(A.temperature), fl = sensor(h, c.feels_like, U.t) ?? num(A.apparent_temperature);
      if (t0 !== null && fl !== null && Math.abs(fl - t0) >= 3) I.feels = 30;
      const dp = sensor(h, c.dewpoint, U.t) ?? num(A.dew_point);
      if (t0 !== null && dp !== null && t0 - dp <= 1.5) I.humidity = 35;
      const nh = st('sensor.weatherscope_normal_high'), th = daily[0] ? num(daily[0].temperature) : null;
      if (nh && th !== null && num(nh.state) !== null && Math.abs(th - num(nh.state)) >= 5) I.normal = 20;
      // moon specials (full moon at night for now; supermoon and eclipses follow)
      const ill = st('sensor.weatherscope_moon_illumination'), full = !up && ill && num(ill.state) >= 98;
      return { I, warn, special: full ? 'moon' : null };
    }
    _layout(imp) {
      const { I, warn, special } = imp;
      const slotA = warn ? 'warning' : special || 'air';
      const R = P_TILES.filter((k) => k !== slotA);
      const rows = [{ c: 0, r: 1, cap: 2 }, { c: 0, r: 2, cap: 2 }, { c: 0, r: 3, cap: 2 }, { c: 0, r: 4, cap: 6 }];
      let cells = 12; while (cells < R.length) { rows.push({ c: 0, r: rows.length + 1, cap: 6 }); cells += 6; }
      const extra = cells - R.length;
      const rank = (list) => (k) => (I[k] ? 100 - I[k] : 1000 + list.indexOf(k)); // important first (highest score), then the usual order
      const med = [...R.filter((k) => I[k] && P_MED.includes(k)).sort((a, b) => I[b] - I[a]), ...P_MED.filter((k) => R.includes(k))]
        .filter((k, i, a) => a.indexOf(k) === i).slice(0, extra);
      const place = [];
      const put = (k, w) => { const row = rows.find((q) => q.cap >= w); if (!row) return false; place.push({ k, c: row.c, r: row.r, w, h: 1, size: w > 1 ? 'medium' : 'small' }); row.c += w; row.cap -= w; return true; };
      med.slice().sort((a, b) => rank(P_MED)(a) - rank(P_MED)(b)).forEach((k) => put(k, 2));
      R.filter((k) => !med.includes(k)).sort((a, b) => rank(P_SMALL)(a) - rank(P_SMALL)(b)).forEach((k) => put(k, 1));
      place.push({ k: slotA, c: 0, r: 0, w: 2, h: 1, size: 'medium' }, { k: 'hourly', c: 2, r: 0, w: 4, h: 1 }, { k: 'daily', c: 2, r: 1, w: 2, h: 3 }, { k: 'map', c: 4, r: 1, w: 2, h: 3 });
      return place;
    }
    _child(k, size) {
      const c = this._c, base = { entity: c.entity, background: c.background, square: false };
      const V = (kind, extra) => ['weatherscope-value-card', { ...base, kind, size, ...extra }];
      const def = {
        warning: ['weatherscope-warning-card', { warning: c.warning, advance: c.advance, square: false }],
        hourly: ['weatherscope-hourly-card', base], daily: ['weatherscope-daily-card', base],
        map: ['weatherscope-card', { entity: c.map, frame: 'glass', header: true, square: false }],
        air: ['weatherscope-air-card', { ...base, size, aqi: c.aqi, pm25: c.pm25, pm10: c.pm10, no2: c.no2, o3: c.o3, so2: c.so2 }],
        wind: ['weatherscope-wind-card', { ...base, size, wind_speed: c.wind_speed, wind_gust: c.wind_gust, wind_bearing: c.wind_bearing }],
        moon: ['weatherscope-moon-card', { ...base, size }],
        sun: V('sun'), uv: V('uv', { sensor: c.uv }), precip: V('precip', { sensor: c.rain_today, total: c.rain_total }), pressure: V('pressure', { sensor: c.pressure }),
        feels: V('feels', { sensor: c.feels_like, sensor2: c.temperature }), normal: V('normal'), visibility: V('visibility'),
        humidity: V('humidity', { sensor: c.humidity, sensor2: c.dewpoint }),
      }[k];
      // leave out empty options so the tiles fall back to the weather entity
      const cfg = Object.fromEntries(Object.entries(def[1]).filter(([, v]) => v !== undefined && v !== null && v !== ''));
      return [def[0], cfg];
    }
    _render() {
      if (!this.shadowRoot || !this._c || !this._h) return;
      const h = this._h, s = h.states[this._c.entity];
      if (!s) { this._fxStop(); this.shadowRoot.innerHTML = `<ha-card style="padding:16px">${this._c.entity || ''} ?</ha-card>`; this._built = false; return; }
      if (!this._built) {
        this._fxStop();
        this.shadowRoot.innerHTML = `<style>:host{display:block}.pg{display:flex;flex-direction:column;gap:8px}
.gr{--u:160px;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));grid-auto-rows:var(--u);gap:8px}.gr>*{min-width:0;min-height:0;height:100%}</style>
<div class="pg"><div id="hd"></div><div class="gr" id="gr"></div></div>`;
        this._built = true; this._els = {}; this._sig = null; this._now = null;
        requestAnimationFrame(() => this._unit());
      }
      const c = this._c;
      if (!this._now) { this._now = document.createElement('weatherscope-now-card'); this.shadowRoot.getElementById('hd').appendChild(this._now); }
      const nowCfg = JSON.stringify({ entity: c.entity, name: c.name, temperature: c.temperature, background: 'none', square: false });
      if (nowCfg !== this._nowCfg) { this._nowCfg = nowCfg; this._now.setConfig(Object.fromEntries(Object.entries(JSON.parse(nowCfg)).filter(([, v]) => v !== undefined))); }
      this._now.hass = h;
      const place = this._layout(this._importance(h, s));
      const sig = JSON.stringify(place) + nowCfg + JSON.stringify(c);
      const gr = this.shadowRoot.getElementById('gr');
      if (sig !== this._sig) {
        this._sig = sig;
        const keep = new Set();
        place.forEach((q) => {
          const [tag, cfg] = this._child(q.k, q.size), id = `${q.k}`; keep.add(id);
          let e = this._els[id];
          if (!e || e.localName !== tag) { if (e) e.remove(); e = document.createElement(tag); this._els[id] = e; e._cfgS = null; }
          const cs = JSON.stringify(cfg); if (e._cfgS !== cs) { e._cfgS = cs; e.setConfig(cfg); }
          e.style.gridColumn = `${q.c + 1} / span ${q.w}`; e.style.gridRow = `${q.r + 1} / span ${q.h}`;
          gr.appendChild(e);
        });
        Object.keys(this._els).forEach((id) => { if (!keep.has(id)) { this._els[id].remove(); delete this._els[id]; } });
      }
      Object.values(this._els).forEach((e) => { e.hass = h; });
      this._fxSync(h, s);
    }
  }
  const pageSensors = (t) => ['feels_like', 'humidity', 'dewpoint', 'pressure', 'uv', 'rain_today', 'rain_total', 'wind_speed', 'wind_gust', 'wind_bearing', 'aqi', 'pm25', 'pm10', 'no2', 'o3', 'so2'].map((n) => ({ name: n, ...sensorSel() }));
  register('weatherscope-page-card', PageCard, makeEditor((t) => [
    { name: 'entity', required: true, selector: { entity: { domain: 'weather' } } },
    { name: 'name', selector: { text: {} } },
    { name: 'temperature', ...sensorSel('temperature') },
    { name: 'warning', selector: { entity: { domain: 'sensor' } } },
    { name: 'advance', selector: { entity: { domain: 'sensor' } } },
    { name: 'map', selector: { entity: { domain: 'sensor', integration: 'weatherscope' } } },
    bgSchema(t),
    { type: 'expandable', name: '', title: t.e_fx, schema: [
      { name: 'animation', selector: { boolean: {} } },
      { name: 'fx_tiles', selector: { boolean: {} } },
      { name: 'performance', selector: { select: { mode: 'dropdown', options: [{ value: 'full', label: t.e_perf_full }, { value: 'eco', label: t.e_perf_eco }, { value: 'still', label: t.e_perf_still }] } } },
      { name: 'meteors', selector: { boolean: {} } },
    ] },
    { type: 'expandable', name: '', title: t.e_sensors, schema: pageSensors(t) },
  ], { temperature: 'e_temperature_h', background: 'e_background_h', animation: 'e_animation_h', fx_tiles: 'e_fx_tiles_h', performance: 'e_performance_h', meteors: 'e_meteors_h' }), `WeatherScope – ${tr(hass0()).n_page}`, 'd_page');

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
