// VaultOS RatesEngine — © 2026 Shamikh Ahmed. Source-available. See LICENSE.
'use strict';

const RatesEngine = {
  _CACHE_KEY: 'vo_rates',
  _STALE_MS: 6 * 60 * 60 * 1000, // 6 hours

  _FX_FALLBACK: {
    USD: 1, PKR: 278.5, GBP: 0.7879, AED: 3.6725, EUR: 0.9198,
    SAR: 3.75, QAR: 3.64, CAD: 1.3631, AUD: 1.5287, SGD: 1.3421,
    INR: 83.47, CNY: 7.243, TRY: 32.15, OMR: 0.385, KWD: 0.307,
    BHD: 0.376, MYR: 4.71, NGN: 1580, EGP: 30.9
  },

  _METAL_FALLBACK: {
    gold: 2380,   // USD per troy oz (XAU)
    silver: 28.8  // USD per troy oz (XAG)
  },

  _cache() {
    try { return JSON.parse(localStorage.getItem(this._CACHE_KEY) || 'null'); }
    catch(e) { return null; }
  },

  _save(data) {
    try { localStorage.setItem(this._CACHE_KEY, JSON.stringify({ ...data, fetchedAt: Date.now() })); }
    catch(e) {}
  },

  isStale() {
    const c = this._cache();
    return !c || !c.fetchedAt || (Date.now() - c.fetchedAt) > this._STALE_MS;
  },

  lastUpdated() {
    const c = this._cache();
    if (!c || !c.fetchedAt) return 'Never fetched — using estimates';
    const mins = Math.floor((Date.now() - c.fetchedAt) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  },

  lastUpdatedBadge() {
    const stale = this.isStale();
    const color = stale ? 'var(--warn)' : 'var(--ok)';
    const icon = stale ? '⚠️' : '✓';
    return `<span style="font-size:10px;color:${color};display:inline-flex;align-items:center;gap:4px">${icon} Rates: ${this.lastUpdated()}</span>`;
  },

  getFX() {
    const c = this._cache();
    return c && c.fx ? { ...this._FX_FALLBACK, ...c.fx } : { ...this._FX_FALLBACK };
  },

  convert(amount, from, to) {
    if (!amount || from === to) return amount || 0;
    const fx = this.getFX();
    // Rates are USD-based (1 USD = X currency)
    const inUSD = from === 'USD' ? amount : amount / (fx[from] || 1);
    return inUSD * (fx[to] || 1);
  },

  getGold() {
    const c = this._cache();
    const perOz = (c && c.metals && c.metals.gold) ? c.metals.gold : this._METAL_FALLBACK.gold;
    const perGram = perOz / 31.1035;
    const perTola = perGram * 11.6638; // 1 tola = 11.6638g (standard)
    return {
      perOz:   +perOz.toFixed(4),
      perGram: +perGram.toFixed(4),
      perTola: +perTola.toFixed(4),
      per10g:  +(perGram * 10).toFixed(4),
      currency: 'USD',
    };
  },

  getSilver() {
    const c = this._cache();
    const perOz = (c && c.metals && c.metals.silver) ? c.metals.silver : this._METAL_FALLBACK.silver;
    const perGram = perOz / 31.1035;
    const perTola = perGram * 11.6638;
    return {
      perOz:   +perOz.toFixed(4),
      perGram: +perGram.toFixed(4),
      perTola: +perTola.toFixed(4),
      currency: 'USD',
    };
  },

  goldInCurrency(currency = 'USD', unit = 'gram') {
    const g = this.getGold();
    const base = unit === 'oz' ? g.perOz : unit === 'tola' ? g.perTola : unit === '10g' ? g.per10g : g.perGram;
    return +this.convert(base, 'USD', currency).toFixed(2);
  },

  silverInCurrency(currency = 'USD', unit = 'gram') {
    const s = this.getSilver();
    const base = unit === 'oz' ? s.perOz : unit === 'tola' ? s.perTola : s.perGram;
    return +this.convert(base, 'USD', currency).toFixed(2);
  },

  // Nisab thresholds in a given currency
  nisab(type = 'silver', currency = 'PKR') {
    // Gold nisab: 87.48g (7.5 tola)
    // Silver nisab: 612.36g (52.5 tola)
    if (type === 'gold') {
      return Math.round(this.goldInCurrency(currency, 'gram') * 87.48);
    } else {
      return Math.round(this.silverInCurrency(currency, 'gram') * 612.36);
    }
  },

  formatPrice(usdAmount, currency = 'USD', decimals = 2) {
    const converted = this.convert(usdAmount, 'USD', currency);
    return converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: decimals });
  },

  async fetch() {
    try {
      const fxRes = await Promise.race([
        fetch('https://open.er-api.com/v6/latest/USD'),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 6000))
      ]);

      let fx = null;
      if (fxRes.ok) {
        const fxData = await fxRes.json();
        if (fxData && fxData.rates) {
          fx = fxData.rates;
        }
      }

      let metals = null;
      try {
        const mRes = await Promise.race([
          fetch('https://api.metals.live/v1/spot'),
          new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 6000))
        ]);
        if (mRes.ok) {
          const mData = await mRes.json();
          if (Array.isArray(mData)) {
            metals = {};
            mData.forEach(m => { if (m.metal && m.price) metals[m.metal] = m.price; });
          } else if (mData && typeof mData === 'object') {
            metals = mData;
          }
        }
      } catch(e) {
        metals = null;
      }

      if (fx || metals) {
        const existing = this._cache() || {};
        this._save({
          fx: fx || existing.fx || null,
          metals: metals || existing.metals || null,
        });
        return true;
      }
    } catch(e) {
      // Network error — keep existing cache
    }
    return false;
  },

  async init() {
    if (this.isStale()) {
      await this.fetch();
    }
    if (typeof window !== 'undefined') {
      window._ratesEngineReady = true;
    }
  },
};

window.RatesEngine = RatesEngine;
