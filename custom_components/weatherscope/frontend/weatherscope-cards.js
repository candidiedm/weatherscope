/* WeatherScope weather cards: Now, Hourly, Sky. Every value can come from any weather entity or the user's own sensors. */
(() => {
  const VERSION = '0.7.2';

  // ---------------------------------------------------------------- shared
  const T = {
    de: {
      hi: 'H', lo: 'T', home: 'Zuhause', now: 'Jetzt', hourly: 'Stündlich', sunrise: 'Sonnenaufgang', sunset: 'Sonnenuntergang',
      m_temp: 'Temperatur ({u})', m_rain: 'Niederschlag ({u})', m_wind: 'Wind und Böen ({u})', max: 'max', loading: 'Vorhersage wird geladen …',
      e_entity: 'Wetter-Entität', e_temperature: 'Eigener Temperatursensor (optional)', e_name: 'Ortsname (optional)', e_background: 'Hintergrund',
      e_sky: 'Eigener Himmel', e_glass: 'Glas', e_none: 'Durchsichtig', e_temperature_h: 'Zum Beispiel die Außentemperatur deiner Wetterstation. Leer lassen, dann kommt sie von der Wetter-Entität.',
      e_background_h: '„Glas“ und „Durchsichtig“ passen zu einer Wetterseite mit der WeatherScope-Himmel-Animation dahinter.', e_wind_speed: 'Eigener Windsensor (optional)', e_wind_gust: 'Eigener Böensensor (optional)',
      e_wind_bearing: 'Eigener Windrichtungssensor (optional)', e_rain_rate: 'Eigener Regensensor (optional)', e_rain_rate_h: 'Regenrate der Wetterstation, z. B. mm/h. Ersetzt den Wert bei „Jetzt“.', e_hours: 'Stunden', e_mode: 'Ansicht beim Start', e_own_h: 'Eigene Sensoren ersetzen nur den Wert bei „Jetzt“.',
      d_now: 'Ort, Temperatur, Wetterlage, Höchst- und Tiefstwert.', d_sky: 'Animierter Himmel als Hintergrund der ganzen Seite, passend zur Wetterlage.', e_test: 'Wetterlage testen (optional)', e_test_h: 'Zeigt dauerhaft diese Wetterlage – zum Ausprobieren. Für den Betrieb leer lassen.', e_fps: 'Bilder pro Sekunde', e_fps_h: 'Weniger Bilder schonen ältere Tablets.', d_hourly: 'Stündliche Vorhersage: Temperatur, Niederschlag, Wind.',
    },
    en: {
      hi: 'H', lo: 'L', home: 'Home', now: 'Now', hourly: 'Hourly', sunrise: 'Sunrise', sunset: 'Sunset',
      m_temp: 'Temperature ({u})', m_rain: 'Precipitation ({u})', m_wind: 'Wind and gusts ({u})', max: 'max', loading: 'Loading forecast …',
      e_entity: 'Weather entity', e_temperature: 'Own temperature sensor (optional)', e_name: 'Place name (optional)', e_background: 'Background',
      e_sky: 'Own sky', e_glass: 'Glass', e_none: 'Transparent', e_temperature_h: 'For example the outdoor temperature of your weather station. Leave empty to use the weather entity.',
      e_background_h: '“Glass” and “Transparent” suit a weather page with the WeatherScope sky animation behind it.', e_wind_speed: 'Own wind sensor (optional)', e_wind_gust: 'Own gust sensor (optional)',
      e_wind_bearing: 'Own wind direction sensor (optional)', e_rain_rate: 'Own rain sensor (optional)', e_rain_rate_h: 'Rain rate of your weather station, e.g. mm/h. Replaces the “Now” value.', e_hours: 'Hours', e_mode: 'View at start', e_own_h: 'Own sensors only replace the “Now” value.',
      d_now: 'Place, temperature, condition, high and low.', d_sky: 'Animated sky as background of the whole page, matching the weather.', e_test: 'Test a condition (optional)', e_test_h: 'Always shows this condition – for trying out. Leave empty for normal use.', e_fps: 'Frames per second', e_fps_h: 'Fewer frames are easier on older tablets.', d_hourly: 'Hourly forecast: temperature, precipitation, wind.',
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
.lab{display:flex;align-items:center;gap:5px;font-size:12px;font-weight:500;letter-spacing:.04em;text-transform:uppercase;color:rgba(255,255,255,.7)}
.lab ha-icon{--mdc-icon-size:14px}
.big{font-size:30px;font-weight:400;line-height:1.15}
.sub{font-size:15px;font-weight:500}
.note{font-size:12px;color:rgba(255,255,255,.85);margin-top:auto}
.dim{color:rgba(255,255,255,.7);font-size:13px}
`;

  const ICON = {
    sunny: 'mdi:weather-sunny', 'clear-night': 'mdi:weather-night', partlycloudy: 'mdi:weather-partly-cloudy', cloudy: 'mdi:weather-cloudy',
    fog: 'mdi:weather-fog', rainy: 'mdi:weather-rainy', pouring: 'mdi:weather-pouring', lightning: 'mdi:weather-lightning',
    'lightning-rainy': 'mdi:weather-lightning-rainy', snowy: 'mdi:weather-snowy', 'snowy-rainy': 'mdi:weather-snowy-rainy', hail: 'mdi:weather-hail',
    windy: 'mdi:weather-windy', 'windy-variant': 'mdi:weather-windy-variant', exceptional: 'mdi:alert-circle-outline',
  };
  const icon = (c, day) => (day === false && c === 'partlycloudy' ? 'mdi:weather-night-partly-cloudy' : ICON[c] || 'mdi:weather-cloudy');

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
  class WSBase extends HTMLElement {
    setConfig(c) {
      this._c = Object.assign({}, this.constructor.defaults, c || {});
      this._fc = null;
      this._unsub();
      if (!this.shadowRoot) { this.attachShadow({ mode: 'open' }); this.shadowRoot.addEventListener('click', (e) => this._click(e)); }
      this._render();
    }
    set hass(h) { this._h = h; if (!this._sub) this._subscribe(); this._render(); }
    connectedCallback() { if (this._h) this._subscribe(); }
    disconnectedCallback() { this._unsub(); }
    _click() {}
    _unsub() { if (this._sub) { this._sub.then((u) => u && u()).catch(() => {}); this._sub = null; } }
    _subscribe() {
      const h = this._h, e = this._c && this._c.entity, type = this.constructor.forecast;
      if (!type || !h || !e || !h.states[e] || this._sub || !h.connection) return;
      this._sub = h.connection.subscribeMessage((m) => { this._fc = m.forecast || []; this._render(); }, { type: 'weather/subscribe_forecast', forecast_type: type, entity_id: e }).catch(() => null);
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
    getGridOptions() { return { columns: 12, rows: 3, min_rows: 2 }; }
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
  ], { temperature: 'e_temperature_h', background: 'e_background_h' }), 'WeatherScope – Now', 'd_now');

  // ---------------------------------------------------------------- Hourly
  class HourlyCard extends WSBase {
    static defaults = { entity: 'weather.weatherscope', background: 'sky', hours: 24, mode: 'temp' };
    static forecast = 'hourly';
    getCardSize() { return 3; }
    // fixed height in every view (design rules)
    getGridOptions() { return { columns: 12, rows: 3, min_columns: 6, min_rows: 3 }; }
    _click(e) {
      const b = e.composedPath().find((x) => x.dataset && x.dataset.mode);
      if (b) { this._mode = b.dataset.mode; this._render(); }
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
  <div class="seg">${btn('temp', 'mdi:weather-partly-cloudy')}${btn('rain', 'mdi:water')}${btn('wind', 'mdi:weather-windy')}</div></div>
  <div class="hours">${cells || `<span class="dim">${t.loading}</span>`}</div>
</ha-card>`;
    }
  }
  register('weatherscope-hourly-card', HourlyCard, makeEditor((t) => [
    { name: 'entity', required: true, selector: { entity: { domain: 'weather' } } },
    { name: 'mode', selector: { select: { mode: 'dropdown', options: [{ value: 'temp', label: t.m_temp.replace(' ({u})', '') }, { value: 'rain', label: t.m_rain.replace(' ({u})', '') }, { value: 'wind', label: t.m_wind.replace(' ({u})', '') }] } } },
    { name: 'hours', selector: { number: { min: 6, max: 48, step: 1, mode: 'box' } } },
    { name: 'temperature', ...sensorSel('temperature') },
    { name: 'wind_speed', ...sensorSel('wind_speed') },
    { name: 'wind_gust', ...sensorSel('wind_speed') },
    { name: 'wind_bearing', ...sensorSel() },
    { name: 'rain_rate', ...sensorSel() },
    bgSchema(t),
  ], { temperature: 'e_own_h', rain_rate: 'e_rain_rate_h', background: 'e_background_h' }), 'WeatherScope – Hourly', 'd_hourly');

  // ---------------------------------------------------------------- Sky (animated page background)
  class SkyCard extends HTMLElement {
    static getStubConfig(h) { return WSBase.getStubConfig(h); }
    setConfig(c) {
      this._c = Object.assign({ entity: 'weather.weatherscope', sun: 'sun.sun', fps: 30 }, c || {});
      this.style.display = 'block';
      this._place();
      if (this._h) this.hass = this._h;
    }
    getCardSize() { return this.preview ? 2 : 0; }
    getGridOptions() { return this.preview ? { rows: 2, columns: 12 } : { rows: 0, columns: 12 }; }
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
      const pv = !!this.preview;
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
      cancelAnimationFrame(this._raf);
      window.removeEventListener('resize', this._onResize);
      document.removeEventListener('visibilitychange', this._onVis);
    }
    _resize() {
      const d = Math.min(window.devicePixelRatio || 1, 1.25), r = this._cv.getBoundingClientRect();
      this._d = d;
      this._W = this.preview ? Math.max(100, r.width || 400) : window.innerWidth;
      this._H = this.preview ? 112 : window.innerHeight;
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
  ], { test: 'e_test_h', fps: 'e_fps_h' }), 'WeatherScope – Sky', 'd_sky');

  console.info(`%c WEATHERSCOPE CARDS %c ${VERSION} `, 'background:#2b7de0;color:#fff;border-radius:3px 0 0 3px', 'background:#444;color:#fff;border-radius:0 3px 3px 0');
})();
