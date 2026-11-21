/* WeatherScope – "Now" card: place, temperature, condition, today's high and low. */
(() => {
  const VERSION = '0.5.0';
  const TAG = 'weatherscope-now-card';
  const T = {
    de: { hi: 'H', lo: 'T', home: 'Zuhause', e_entity: 'Wetter-Entität', e_temp: 'Eigener Temperatursensor (optional)', e_name: 'Ortsname (optional)', e_bg: 'Hintergrund', e_sky: 'Eigener Himmel', e_none: 'Durchsichtig', e_temp_h: 'Zum Beispiel die Außentemperatur deiner Wetterstation. Leer lassen, dann kommt sie von der Wetter-Entität.', e_bg_h: '„Durchsichtig“ passt zu einer Wetterseite mit eigenem Hintergrund.', desc: 'Ort, Temperatur, Wetterlage, Höchst- und Tiefstwert.' },
    en: { hi: 'H', lo: 'L', home: 'Home', e_entity: 'Weather entity', e_temp: 'Own temperature sensor (optional)', e_name: 'Place name (optional)', e_bg: 'Background', e_sky: 'Own sky', e_none: 'Transparent', e_temp_h: 'For example the outdoor temperature of your weather station. Leave empty to use the weather entity.', e_bg_h: '“Transparent” suits a weather page with its own background.', desc: 'Place, temperature, condition, high and low.' },
  };
  const tr = (hass) => T[((hass && (hass.locale && hass.locale.language || hass.language)) || 'en').slice(0, 2)] || T.en;

  // sky colours (top, bottom) by condition; night versions are darker
  const SKY = {
    sunny: ['#3d8fe0', '#8cc4f2'], 'clear-night': ['#141d3a', '#2e3c6b'],
    partlycloudy: ['#6f86a6', '#a9b6c8'], cloudy: ['#6b7686', '#9aa3ae'], fog: ['#8a929b', '#b5bbc1'],
    rainy: ['#5d6672', '#8b939c'], pouring: ['#4a525d', '#727b86'], 'lightning-rainy': ['#3d4350', '#666d7a'], lightning: ['#3d4350', '#666d7a'],
    snowy: ['#9aa6b4', '#cdd5de'], 'snowy-rainy': ['#7f8995', '#aab2bb'], hail: ['#6b7380', '#959ca6'],
    windy: ['#6f86a6', '#a9b6c8'], 'windy-variant': ['#6f86a6', '#a9b6c8'], exceptional: ['#7a5a5a', '#a88a8a'],
  };
  const NIGHT = { partlycloudy: ['#1f2a44', '#3b4868'], cloudy: ['#262c38', '#454d5c'], rainy: ['#20252e', '#3b424e'], pouring: ['#1b2028', '#343a45'], snowy: ['#3a4250', '#5e6676'], fog: ['#2c3138', '#4b5058'] };

  const fmt = (v) => { if (v === null || v === undefined || isNaN(v)) return '–'; const n = Math.round(Number(v)); return `${n < 0 ? '−' : ''}${Math.abs(n)}°`; };

  class WeatherScopeNowCard extends HTMLElement {
    static getConfigElement() { return document.createElement(`${TAG}-editor`); }
    static getStubConfig(hass) {
      const w = Object.keys(hass.states).find((e) => e === 'weather.weatherscope') || Object.keys(hass.states).find((e) => e.startsWith('weather.'));
      return { entity: w || 'weather.weatherscope' };
    }

    setConfig(c) {
      this._c = Object.assign({ entity: 'weather.weatherscope', background: 'sky' }, c || {});
      this._fc = null;
      this._unsub();
      if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
      this._render();
    }

    set hass(h) {
      const first = !this._h;
      this._h = h;
      if (first || !this._sub) this._subscribe();
      this._render();
    }

    getCardSize() { return 3; }
    getGridOptions() { return { columns: 12, rows: 3, min_rows: 2 }; }

    connectedCallback() { if (this._h) this._subscribe(); }
    disconnectedCallback() { this._unsub(); }

    _unsub() { if (this._sub) { this._sub.then((u) => u && u()).catch(() => {}); this._sub = null; } }

    _subscribe() {
      const h = this._h, e = this._c && this._c.entity;
      if (!h || !e || !h.states[e] || this._sub || !h.connection) return;
      this._sub = h.connection.subscribeMessage((m) => { this._fc = m.forecast || []; this._render(); }, { type: 'weather/subscribe_forecast', forecast_type: 'daily', entity_id: e }).catch(() => null);
    }

    _render() {
      if (!this.shadowRoot || !this._c) return;
      const h = this._h, s = h && h.states[this._c.entity], t = tr(h);
      if (!h) return;
      if (!s) { this.shadowRoot.innerHTML = `<ha-card style="padding:16px">${this._c.entity}?</ha-card>`; return; }
      const ts = this._c.temperature && h.states[this._c.temperature];
      const temp = ts && !isNaN(parseFloat(ts.state)) ? parseFloat(ts.state) : s.attributes.temperature;
      const cond = h.formatEntityState ? h.formatEntityState(s) : s.state;
      const today = (this._fc || [])[0];
      const name = this._c.name || (h.config && h.config.location_name) || t.home;
      const sun = h.states['sun.sun'], night = s.state === 'clear-night' || (sun && sun.state === 'below_horizon');
      const sky = (night && NIGHT[s.state]) || SKY[s.state] || SKY.partlycloudy;
      const own = this._c.background !== 'none';
      const html = `
<style>
ha-card{height:100%;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:16px 12px;color:#fff;overflow:hidden;
  ${own ? `background:linear-gradient(180deg,${sky[0]},${sky[1]});border:none` : 'background:none;border:none;box-shadow:none'}}
.o{font-size:clamp(18px,4.2cqw,28px);font-weight:400;text-shadow:0 1px 3px rgba(0,0,0,.25)}
.t{font-size:clamp(56px,16cqw,104px);font-weight:200;line-height:1;margin:2px 0 0 .12em;text-shadow:0 1px 4px rgba(0,0,0,.2)}
.c{font-size:clamp(15px,3.4cqw,20px);font-weight:500;margin-top:4px}
.h{font-size:clamp(13px,3cqw,17px);opacity:.9;margin-top:2px}
:host{display:block;height:100%;container-type:inline-size}
</style>
<ha-card>
  <div class="o">${name}</div>
  <div class="t">${fmt(temp)}</div>
  <div class="c">${cond}</div>
  <div class="h">${today ? `${t.hi}: ${fmt(today.temperature)} ${t.lo}: ${fmt(today.templow)}` : '&nbsp;'}</div>
</ha-card>`;
      // hass changes many times a second; only touch the DOM when something visible changed
      if (html !== this._last) { this._last = html; this.shadowRoot.innerHTML = html; }
    }
  }

  class WeatherScopeNowEditor extends HTMLElement {
    setConfig(c) { this._c = c; this._r(); }
    set hass(h) { this._h = h; this._r(); }
    _r() {
      if (!this._h || !this._c) return;
      const t = tr(this._h);
      if (!this._f) {
        this._f = document.createElement('ha-form');
        this._f.computeLabel = (s) => t[`e_${s.name === 'background' ? 'bg' : s.name === 'temperature' ? 'temp' : s.name}`] || s.name;
        this._f.computeHelper = (s) => (s.name === 'temperature' ? t.e_temp_h : s.name === 'background' ? t.e_bg_h : '');
        this._f.addEventListener('value-changed', (ev) => this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: ev.detail.value }, bubbles: true, composed: true })));
        this.appendChild(this._f);
      }
      this._f.schema = [
        { name: 'entity', required: true, selector: { entity: { domain: 'weather' } } },
        { name: 'temperature', selector: { entity: { domain: 'sensor', device_class: 'temperature' } } },
        { name: 'name', selector: { text: {} } },
        { name: 'background', selector: { select: { mode: 'dropdown', options: [{ value: 'sky', label: t.e_sky }, { value: 'none', label: t.e_none }] } } },
      ];
      this._f.hass = this._h;
      this._f.data = Object.assign({ background: 'sky' }, this._c);
    }
  }

  if (!customElements.get(TAG)) customElements.define(TAG, WeatherScopeNowCard);
  if (!customElements.get(`${TAG}-editor`)) customElements.define(`${TAG}-editor`, WeatherScopeNowEditor);
  window.customCards = window.customCards || [];
  if (!window.customCards.some((c) => c.type === TAG)) {
    window.customCards.push({ type: TAG, name: 'WeatherScope – Now', description: tr(document.querySelector('home-assistant') && document.querySelector('home-assistant').hass).desc, preview: true, documentationURL: 'https://github.com/candidiedm/weatherscope' });
  }
  console.info(`%c WEATHERSCOPE NOW %c ${VERSION} `, 'background:#2b7de0;color:#fff;border-radius:3px 0 0 3px', 'background:#444;color:#fff;border-radius:0 3px 3px 0');
})();
