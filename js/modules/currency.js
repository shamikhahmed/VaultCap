'use strict';
// VaultOS — © 2026 Shamikh Ahmed. Source-available. See LICENSE.
/* Currency page — every rate is quoted against the user's display currency (S.user.currency),
   not a fixed base. Storage stays USD-based (RatesEngine: units per 1 USD), so manual overrides
   saved by older versions keep working. */
const Currency = {
  /* Pinned at the top of the list when present; the rest of the world follows, searchable. */
  _POPULAR: ['USD', 'EUR', 'GBP', 'AED', 'SAR', 'INR', 'PKR', 'CNY', 'JPY', 'CAD', 'AUD', 'CHF', 'SGD', 'TRY', 'NGN', 'BRL', 'MXN', 'ZAR'],
  _MANUAL_KEY: 'vo_currency_manual',
  _query: '',
  _showAll: false,

  /** Display currency every rate on this page is quoted in. */
  base() {
    const u = (typeof S !== 'undefined' && S.user) || {};
    if (u.currency) return u.currency;
    try { if (typeof countryCurrency === 'function' && typeof U !== 'undefined' && U.homeCC) return countryCurrency(U.homeCC()); } catch (e) {}
    return 'USD';
  },

  _dn: null,
  name(code) {
    try {
      if (!this._dn) this._dn = new Intl.DisplayNames([(typeof navigator !== 'undefined' && navigator.language) || 'en'], { type: 'currency' });
      return this._dn.of(code) || code;
    } catch (e) { return code; }
  },

  /** Flag for a currency: its issuing country's flag where the ISO prefix is a country. */
  flag(code) {
    if (code === 'EUR') return '🇪🇺';
    if (!code || code[0] === 'X') return '🌐';
    const cc = code.slice(0, 2).toUpperCase();
    if (!/^[A-Z]{2}$/.test(cc)) return '🌐';
    return String.fromCodePoint(...[...cc].map(ch => 0x1F1E6 + ch.charCodeAt(0) - 65));
  },

  symbol(code) {
    try {
      const p = new Intl.NumberFormat(undefined, { style: 'currency', currency: code, currencyDisplay: 'narrowSymbol' }).formatToParts(0);
      const s = p.find(x => x.type === 'currency');
      return s ? s.value : code;
    } catch (e) { return code; }
  },

  /** Currencies used anywhere in the vault — shown first so the page answers "what are my holdings worth". */
  inUse() {
    const out = new Set();
    if (typeof S === 'undefined') return out;
    Object.keys(S).forEach(k => {
      const v = S[k];
      if (!Array.isArray(v)) return;
      v.forEach(x => { if (x && typeof x.currency === 'string' && /^[A-Z]{3}$/.test(x.currency)) out.add(x.currency); });
    });
    return out;
  },

  /** All fiat codes we can price (live + offline estimates), minus crypto. */
  codes() {
    const fx = typeof RatesEngine !== 'undefined' ? RatesEngine.getFX() : { USD: 1 };
    return Object.keys(fx).filter(c => /^[A-Z]{3}$/.test(c) && fx[c] > 0 && !['BTC', 'ETH', 'USDT', 'XAU', 'XAG', 'XDR'].includes(c));
  },

  get() {
    // { base: 'USD', rates: { PKR: 278.5, ... } } — USD-based (manual overrides already applied)
    const fx = typeof RatesEngine !== 'undefined' ? RatesEngine.getFX() : {};
    return { base: 'USD', rates: { ...fx } };
  },

  _getManual() {
    try { return JSON.parse(localStorage.getItem(this._MANUAL_KEY) || '{}'); }
    catch (e) { return {}; }
  },

  _saveManual(overrides) {
    try { localStorage.setItem(this._MANUAL_KEY, JSON.stringify(overrides)); }
    catch (e) {}
  },

  convert(amount, from, to) {
    if (!amount || from === to) return amount || 0;
    if (typeof RatesEngine !== 'undefined') return RatesEngine.convert(amount, from, to);
    const rates = this.get().rates;
    const inUSD = from === 'USD' ? amount : amount / (rates[from] || 1);
    return inUSD * (rates[to] || 1);
  },

  format(amount, currency) {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency, currencyDisplay: 'narrowSymbol', maximumFractionDigits: 2 }).format(amount);
    } catch (e) {
      return (amount < 0 ? '-' : '') + (currency || '') + ' ' + Math.abs(amount).toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
  },

  /** Number of decimals that keeps a rate readable whatever its size (0.00012 vs 278.5). */
  _fmtRate(v) {
    if (!v || !isFinite(v)) return '—';
    const d = v >= 100 ? 2 : v >= 1 ? 4 : v >= 0.01 ? 5 : 8;
    return v.toLocaleString(undefined, { minimumFractionDigits: Math.min(2, d), maximumFractionDigits: d });
  },

  /** 1 code = ? base, from USD-based rates. */
  _inBase(code, fx, base) {
    const r = fx[code], b = fx[base];
    return r && b ? b / r : null;
  },

  _ordered() {
    const base = this.base();
    const all = this.codes().filter(c => c !== base);
    const used = this.inUse();
    const pop = this._POPULAR;
    const rank = c => (used.has(c) ? 0 : pop.includes(c) ? 1 : 2);
    return all.sort((a, b) => rank(a) - rank(b) || (rank(a) === 1 ? pop.indexOf(a) - pop.indexOf(b) : this.name(a).localeCompare(this.name(b))));
  },

  _buildCurrencyRow(code, i, fx, market, manual, base) {
    /* USD is the storage anchor, so a USD override is stored as the display currency's rate. */
    const isManual = code === 'USD' ? manual[base] !== undefined : manual[code] !== undefined;
    const inBase = this._inBase(code, fx, base);
    const perBase = inBase ? 1 / inBase : null;
    const marketInBase = this._inBase(code, market, base);
    const live = typeof RatesEngine !== 'undefined' && RatesEngine.hasLive ? RatesEngine.hasLive(code) : false;
    const border = i > 0 ? 'border-top:1px solid var(--border);' : '';
    const badge = isManual
      ? '<span class="cur-badge cur-badge--manual">MANUAL</span>'
      : (!live ? '<span class="cur-badge" title="Offline estimate — refresh for a live rate">EST.</span>' : '');
    const clearBtn = isManual ? '<button type="button" class="cur-live-btn" data-act="Currency._clearManual(\'' + code + '\')">Use market ↺</button>' : '';
    return '<div class="cur-row" data-code="' + code + '" style="padding:14px 16px;' + border + 'display:flex;align-items:center;gap:12px">' +
      '<div style="font-size:1.375rem;flex-shrink:0" aria-hidden="true">' + this.flag(code) + '</div>' +
      '<div class="vc-ix-20">' +
        '<div class="vc-ix-173">' +
          '<div class="vc-ix-25">' + code + '</div>' +
          '<div class="vc-ix-3">' + escHtml(this.name(code)) + '</div>' +
          badge +
        '</div>' +
        '<div class="vc-ix-36">' +
          '1 ' + code + ' = <strong class="vc-ix-189">' + this._fmtRate(inBase) + '</strong> ' + base +
          (perBase ? ' · 1 ' + base + ' = ' + this._fmtRate(perBase) + ' ' + code : '') +
        '</div>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">' +
        '<input type="number" inputmode="decimal" min="0" step="any" aria-label="Override: ' + base + ' per 1 ' + code + '" value="' + (isManual && inBase ? +inBase.toPrecision(8) : '') + '" placeholder="' + (marketInBase ? this._fmtRate(marketInBase).replace(/,/g, '') : 'Rate') + '" ' +
          'style="width:96px;background:var(--input,var(--glass2));border:1px solid var(--border);border-radius:8px;padding:6px 8px;color:var(--text);font-size:0.8125rem;text-align:right" ' +
          'data-act-change="Currency._setManual(\'' + code + '\',this.value)" title="Your own rate: ' + base + ' per 1 ' + code + '">' +
        clearBtn +
      '</div>' +
    '</div>';
  },

  _buildCurrencyOption(code, selectedCode) {
    return '<option value="' + code + '"' + (code === selectedCode ? ' selected' : '') + '>' + this.flag(code) + ' ' + code + ' — ' + escHtml(this.name(code)) + '</option>';
  },

  _rowsHtml() {
    const base = this.base();
    const manual = this._getManual();
    const fx = typeof RatesEngine !== 'undefined' ? RatesEngine.getFX() : {};
    const market = typeof RatesEngine !== 'undefined' && RatesEngine.getMarketFX ? RatesEngine.getMarketFX() : fx;
    const q = (this._query || '').trim().toLowerCase();
    let list = this._ordered();
    if (q) list = list.filter(c => c.toLowerCase().includes(q) || this.name(c).toLowerCase().includes(q));
    const total = list.length;
    const limit = q || this._showAll ? total : 12;
    const rows = list.slice(0, limit).map((c, i) => this._buildCurrencyRow(c, i, fx, market, manual, base)).join('');
    const more = !q && !this._showAll && total > limit
      ? '<button type="button" class="btn btn-g btn-full" style="border-radius:0;border-top:1px solid var(--border)" data-act="Currency._showAll=true;Currency.render()">Show all ' + total + ' currencies</button>'
      : '';
    return (rows || '<div class="vc-ix-221" style="padding:16px">No currency matches “' + escHtml(q) + '”.</div>') + more;
  },

  render() {
    const body = document.getElementById('pg-currency-body');
    if (!body) return;
    const base = this.base();
    const lastUpdated = typeof RatesEngine !== 'undefined' ? RatesEngine.lastUpdated() : 'Unknown';
    const isStale = typeof RatesEngine !== 'undefined' ? RatesEngine.isStale() : true;
    const staleColor = isStale ? 'var(--warn)' : 'var(--ok)';
    const staleIcon = isStale ? (typeof VC !== 'undefined' ? VC.icon('bell', 12) : '') : (typeof VC !== 'undefined' ? VC.icon('target', 12) : '');
    const codes = [base].concat(this._ordered());
    const used = [...this.inUse()].filter(c => c !== base);
    const defTo = used[0] || (base === 'USD' ? 'EUR' : 'USD');
    const fromOpts = codes.map(c => this._buildCurrencyOption(c, base)).join('');
    const toOpts = codes.map(c => this._buildCurrencyOption(c, defTo)).join('');
    const netOn = typeof RatesEngine !== 'undefined' && RatesEngine.networkAllowed && RatesEngine.networkAllowed();

    body.innerHTML =
      '<div class="vc-ix-59">' +

        '<div style="background:var(--glass);border:1px solid var(--border);border-radius:16px;padding:14px 16px">' +
          '<div class="vc-ix-88">' +
            '<div class="vc-ix-56">Exchange Rates</div>' +
            '<button type="button" data-act="Currency._refreshRates()" style="background:var(--glass2);border:1px solid var(--border);color:var(--accent);border-radius:8px;padding:5px 12px;font-size:0.6875rem;font-weight:700;cursor:pointer;touch-action:manipulation">↻ Refresh</button>' +
          '</div>' +
          '<div style="font-size:0.6875rem;color:' + staleColor + '">' + staleIcon + ' Last updated: ' + lastUpdated + (netOn ? '' : ' · live rates off (Settings → Privacy)') + '</div>' +
          '<div class="vc-ix-221" id="cur-base-line">Quoted in <strong>' + this.flag(base) + ' ' + base + '</strong> (' + escHtml(this.name(base)) + ') — your display currency. ' +
            '<button type="button" class="cur-live-btn" data-act="Dash.toggleCurrency()">Change</button></div>' +
          '<div class="vc-ix-221">Type your own rate (e.g. a bank, exchange-house or parallel-market rate) to use it everywhere in the vault.</div>' +
        '</div>' +

        '<div style="background:var(--glass);border:1px solid var(--border);border-radius:16px;padding:16px">' +
          '<div style="font-size:0.8125rem;font-weight:700;color:var(--text);margin-bottom:12px">Quick Convert</div>' +
          '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
            '<input type="number" inputmode="decimal" id="conv-amount" aria-label="Amount" placeholder="Amount" value="100" ' +
              'style="flex:1;min-width:80px;background:var(--input,var(--glass2));border:1px solid var(--border);border-radius:10px;padding:10px;color:var(--text);font-size:1rem" ' +
              'data-act-input="Currency._updateConvert()">' +
            '<select id="conv-from" aria-label="From currency" data-act-change="Currency._updateConvert()" ' +
              'style="max-width:42%;background:var(--input,var(--glass2));border:1px solid var(--border);border-radius:10px;padding:10px;color:var(--text);font-size:0.875rem">' +
              fromOpts +
            '</select>' +
            '<button type="button" aria-label="Swap currencies" data-act="Currency._swap()" style="background:none;border:none;color:var(--text3);font-size:1.125rem;cursor:pointer;min-width:32px;min-height:32px">⇄</button>' +
            '<select id="conv-to" aria-label="To currency" data-act-change="Currency._updateConvert()" ' +
              'style="max-width:42%;background:var(--input,var(--glass2));border:1px solid var(--border);border-radius:10px;padding:10px;color:var(--text);font-size:0.875rem">' +
              toOpts +
            '</select>' +
          '</div>' +
          '<div id="conv-result" aria-live="polite" style="margin-top:12px;font-size:1.375rem;font-weight:800;color:var(--accent);text-align:center"></div>' +
        '</div>' +

        '<input type="search" id="cur-search" class="inp" aria-label="Search currencies" placeholder="Search ' + codes.length + ' currencies — name or code" value="' + escAttr(this._query) + '" data-act-input="Currency._search(this.value)">' +

        '<div id="cur-rows" style="background:var(--glass);border:1px solid var(--border);border-radius:16px;overflow:hidden">' +
          this._rowsHtml() +
        '</div>' +

      '</div>';

    this._updateConvert();
  },

  _search(v) {
    this._query = v || '';
    const el = document.getElementById('cur-rows');
    if (el) el.innerHTML = this._rowsHtml();
  },

  _swap() {
    const f = document.getElementById('conv-from'), t = document.getElementById('conv-to');
    if (!f || !t) return;
    const x = f.value; f.value = t.value; t.value = x;
    this._updateConvert();
  },

  _updateConvert() {
    const amt = parseFloat((document.getElementById('conv-amount') || {}).value) || 0;
    const from = (document.getElementById('conv-from') || {}).value || this.base();
    const to = (document.getElementById('conv-to') || {}).value || 'USD';
    const result = this.convert(amt, from, to);
    const el = document.getElementById('conv-result');
    if (el) el.textContent = result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: Math.abs(result) < 1 ? 4 : 2 }) + ' ' + to;
  },

  /** val = display-currency units per 1 `code`; stored USD-based so the rest of the app reads it directly. */
  _setManual(code, val) {
    const v = parseFloat(val);
    const m = this._getManual();
    const base = this.base();
    if (!isNaN(v) && v > 0) {
      const fx = typeof RatesEngine !== 'undefined' ? RatesEngine.getFX() : {};
      const basePerUsd = base === 'USD' ? 1 : fx[base];
      if (code === base || !basePerUsd) return;
      if (code === 'USD') m[base] = v; else m[code] = basePerUsd / v;
    } else {
      delete m[code === 'USD' ? base : code];
    }
    this._saveManual(m);
    const el = document.getElementById('cur-rows');
    if (el) el.innerHTML = this._rowsHtml();
    this._updateConvert();
  },

  _clearManual(code) {
    const m = this._getManual();
    delete m[code === 'USD' ? this.base() : code];
    this._saveManual(m);
    this.render();
  },

  async _refreshRates() {
    if (typeof RatesEngine === 'undefined') { Toast.show('Rates engine not available', 'warn'); return; }
    if (RatesEngine.networkAllowed && !RatesEngine.networkAllowed()) { Toast.show('Live rates are off — turn them on in Settings → Privacy', 'warn'); return; }
    Toast.show('Fetching live rates...', 'info', 2000);
    const ok = await RatesEngine.fetch();
    if (ok) { Toast.show('Rates updated', 'success'); this.render(); }
    else { Toast.show('Could not fetch rates — using cached data', 'warn'); }
  },

  _netWorthSummary() { return ''; },

  save(d) {
    try { localStorage.setItem('vo_currency', JSON.stringify(d)); } catch (e) {}
  },
};
window.Currency = Currency;
