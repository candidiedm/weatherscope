/* WeatherScope weather cards: Now, Hourly. Every value can come from any weather entity or the user's own sensors. */
(() => {
  const VERSION = '0.7.0';

  // ---------------------------------------------------------------- shared
  const T = {
    de: {
      hi: 'H', lo: 'T', home: 'Zuhause', now: 'Jetzt', hourly: 'Stündlich', sunrise: 'Sonnenaufgang', sunset: 'Sonnenuntergang',
      m_temp: 'Temperatur ({u})', m_rain: 'Niederschlag ({u})', m_wind: 'Wind und Böen ({u})', max: 'max', loading: 'Vorhersage wird geladen …',
      e_entity: 'Wetter-Entität', e_temperature: 'Eigener Temperatursensor (optional)', e_name: 'Ortsname (optional)', e_background: 'Hintergrund',
      e_sky: 'Eigener Himmel', e_glass: 'Glas', e_none: 'Durchsichtig', e_temperature_h: 'Zum Beispiel die Außentemperatur deiner Wetterstation. Leer lassen, dann kommt sie von der Wetter-Entität.',
      e_background_h: '„Glas“ und „Durchsichtig“ passen zu einer Wetterseite mit der WeatherScope-Himmel-Animation dahinter.', e_wind_speed: 'Eigener Windsensor (optional)', e_wind_gust: 'Eigener Böensensor (optional)',
      e_wind_bearing: 'Eigener Windrichtungssensor (optional)', e_rain_rate: 'Eigener Regensensor (optional)', e_rain_rate_h: 'Regenrate der Wetterstation, z. B. mm/h. Ersetzt den Wert bei „Jetzt“.', e_hours: 'Stunden', e_mode: 'Ansicht beim Start', e_own_h: 'Eigene Sensoren ersetzen nur den Wert bei „Jetzt“.',
      d_now: 'Ort, Temperatur, Wetterlage, Höchst- und Tiefstwert.', d_hourly: 'Stündliche Vorhersage: Temperatur, Niederschlag, Wind.',
    },
    en: {
      hi: 'H', lo: 'L', home: 'Home', now: 'Now', hourly: 'Hourly', sunrise: 'Sunrise', sunset: 'Sunset',
      m_temp: 'Temperature ({u})', m_rain: 'Precipitation ({u})', m_wind: 'Wind and gusts ({u})', max: 'max', loading: 'Loading forecast …',
      e_entity: 'Weather entity', e_temperature: 'Own temperature sensor (optional)', e_name: 'Place name (optional)', e_background: 'Background',
      e_sky: 'Own sky', e_glass: 'Glass', e_none: 'Transparent', e_temperature_h: 'For example the outdoor temperature of your weather station. Leave empty to use the weather entity.',
      e_background_h: '“Glass” and “Transparent” suit a weather page with the WeatherScope sky animation behind it.', e_wind_speed: 'Own wind sensor (optional)', e_wind_gust: 'Own gust sensor (optional)',
      e_wind_bearing: 'Own wind direction sensor (optional)', e_rain_rate: 'Own rain sensor (optional)', e_rain_rate_h: 'Rain rate of your weather station, e.g. mm/h. Replaces the “Now” value.', e_hours: 'Hours', e_mode: 'View at start', e_own_h: 'Own sensors only replace the “Now” value.',
      d_now: 'Place, temperature, condition, high and low.', d_hourly: 'Hourly forecast: temperature, precipitation, wind.',
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
.o{font-size:clamp(18px,4.2cqw,28px);font-weight:400;text-shadow:0 1px 3px rgba(0,0,0,.25)}
.t{font-size:clamp(56px,16cqw,104px);font-weight:var(--ws-temp-weight,300);line-height:1;margin:2px 0 0 .12em;text-shadow:0 1px 4px rgba(0,0,0,.2)}
.c{font-size:clamp(15px,3.4cqw,20px);font-weight:500;margin-top:4px}
.h{font-size:clamp(13px,3cqw,17px);opacity:.9;margin-top:2px}
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
.mode{font-size:13px;font-weight:500;margin-top:3px}
.seg{display:flex;gap:2px;background:rgba(0,0,0,.18);border-radius:999px;padding:3px}
.seg button{all:unset;cursor:pointer;width:34px;height:24px;border-radius:999px;display:flex;align-items:center;justify-content:center;color:rgba(235,240,255,.7)}
.seg button.on{background:rgba(255,255,255,.28);color:#fff}.seg ha-icon{--mdc-icon-size:16px}
.hours{flex:1;display:flex;gap:2px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;align-items:center}.hours::-webkit-scrollbar{display:none}
.h{flex:0 0 52px;display:grid;grid-template-rows:16px 34px 18px 14px;row-gap:6px;justify-items:center;align-items:center}
.h .tm{font-size:13px;font-weight:600}
.h ha-icon{--mdc-icon-size:24px}
.h .v{font-size:15px;font-weight:600;white-space:nowrap}
.h .x{font-size:11px;font-weight:600;color:rgba(255,255,255,.85);text-shadow:0 1px 2px rgba(0,0,0,.35);white-space:nowrap}
.h .x.pp{color:#bfe9ff}
.h.ev{flex:0 0 auto;padding:0 8px;color:#ffe7a3}.h.ev .v{font-size:13px}
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

  console.info(`%c WEATHERSCOPE CARDS %c ${VERSION} `, 'background:#2b7de0;color:#fff;border-radius:3px 0 0 3px', 'background:#444;color:#fff;border-radius:0 3px 3px 0');
})();
