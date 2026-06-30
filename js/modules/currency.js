'use strict';
// VaultOS — © 2026 Shamikh Ahmed. Source-available. See LICENSE.
const Currency = {
  _CURRENCIES: [
    { code: 'PKR', name: 'Pakistani Rupee',   flag: '🇵🇰', symbol: '₨' },
    { code: 'GBP', name: 'British Pound',     flag: '🇬🇧', symbol: '£' },
    { code: 'AED', name: 'UAE Dirham',        flag: '🇦🇪', symbol: 'د.إ' },
    { code: 'USD', name: 'US Dollar',         flag: '🇺🇸', symbol: '$' },
    { code: 'EUR', name: 'Euro',              flag: '🇪🇺', symbol: '€' },
    { code: 'SAR', name: 'Saudi Riyal',       flag: '🇸🇦', symbol: '﷼' },
    { code: 'QAR', name: 'Qatari Riyal',      flag: '🇶🇦', symbol: 'ر.ق' },
    { code: 'CAD', name: 'Canadian Dollar',   flag: '🇨🇦', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', symbol: 'A$' },
    { code: 'OMR', name: 'Omani Rial',        flag: '🇴🇲', symbol: 'ر.ع.' },
    { code: 'KWD', name: 'Kuwaiti Dinar',     flag: '🇰🇼', symbol: 'د.ك' },
    { code: 'INR', name: 'Indian Rupee',      flag: '🇮🇳', symbol: '₹' },
    { code: 'TRY', name: 'Turkish Lira',      flag: '🇹🇷', symbol: '₺' },
    { code: 'SGD', name: 'Singapore Dollar',  flag: '🇸🇬', symbol: 'S$' },
    { code: 'MYR', name: 'Malaysian Ringgit', flag: '🇲🇾', symbol: 'RM' },
  ],

  _MANUAL_KEY: 'vo_currency_manual',

  get() {
    // Returns { base: 'USD', rates: { PKR: 278.5, GBP: 0.787, ... } } — USD-based
    const manual = this._getManual();
    const fx = typeof RatesEngine !== 'undefined' ? RatesEngine.getFX() : {};
    const rates = {};
    this._CURRENCIES.forEach(function(c) {
      if (manual[c.code] !== undefined) {
        rates[c.code] = manual[c.code];
      } else if (fx[c.code]) {
        rates[c.code] = fx[c.code];
      }
    });
    return { base: 'USD', rates: rates };
  },

  _getManual() {
    try { return JSON.parse(localStorage.getItem(this._MANUAL_KEY) || '{}'); }
    catch(e) { return {}; }
  },

  _saveManual(overrides) {
    try { localStorage.setItem(this._MANUAL_KEY, JSON.stringify(overrides)); }
    catch(e) {}
  },

  convert(amount, from, to) {
    if (!amount || from === to) return amount || 0;
    if (typeof RatesEngine !== 'undefined') return RatesEngine.convert(amount, from, to);
    const rates = this.get().rates;
    const inUSD = from === 'USD' ? amount : amount / (rates[from] || 1);
    return inUSD * (rates[to] || 1);
  },

  format(amount, currency) {
    const syms = { PKR: '₨', GBP: '£', AED: 'د.إ', USD: '$', EUR: '€', SAR: '﷼', QAR: 'ر.ق', CAD: 'C$', AUD: 'A$', OMR: 'ر.ع.', KWD: 'د.ك', INR: '₹', TRY: '₺', SGD: 'S$', MYR: 'RM' };
    const sym = syms[currency] || currency || '';
    const formatted = Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    return (amount < 0 ? '-' : '') + sym + formatted;
  },

  _buildCurrencyRow(c, i, fx, manual, usdToPkr) {
    const liveRate = fx[c.code];
    const manualRate = manual[c.code];
    const displayRate = manualRate !== undefined ? manualRate : liveRate;
    const isManual = manualRate !== undefined;
    const inPkr = displayRate ? (usdToPkr / displayRate) : null;
    const border = i > 0 ? 'border-top:1px solid var(--border);' : '';
    const manualBadge = isManual ? '<span style="font-size:9px;background:rgba(255,152,0,.15);color:var(--warn);border-radius:4px;padding:1px 5px;font-weight:700">MANUAL</span>' : '';
    const rateText = displayRate ? displayRate.toFixed(4) : '—';
    const pkrText = inPkr ? ' · 1 ' + c.code + ' = <strong style="color:var(--accent)">' + inPkr.toFixed(2) + '</strong> PKR' : '';
    const clearBtn = isManual ? '<button type="button" onclick="Currency._clearManual(\'' + c.code + '\')" style="font-size:9px;color:var(--text3);background:none;border:none;cursor:pointer;touch-action:manipulation">Use live ↺</button>' : '';
    return '<div style="padding:14px 16px;' + border + 'display:flex;align-items:center;gap:12px">' +
      '<div style="font-size:22px;flex-shrink:0">' + c.flag + '</div>' +
      '<div style="flex:1;min-width:0">' +
        '<div style="display:flex;align-items:center;gap:6px">' +
          '<div style="font-size:14px;font-weight:700;color:var(--text)">' + c.code + '</div>' +
          '<div style="font-size:11px;color:var(--text3)">' + c.name + '</div>' +
          manualBadge +
        '</div>' +
        '<div style="font-size:12px;color:var(--text3);margin-top:2px">' +
          '1 USD = <strong style="color:var(--text)">' + rateText + '</strong> ' + c.code + pkrText +
        '</div>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">' +
        '<input type="number" value="' + (manualRate !== undefined ? manualRate : '') + '" placeholder="' + (liveRate ? liveRate.toFixed(4) : 'Live') + '" ' +
          'style="width:90px;background:var(--input,var(--glass2));border:1px solid var(--border);border-radius:8px;padding:6px 8px;color:var(--text);font-size:13px;text-align:right" ' +
          'oninput="Currency._setManual(\'' + c.code + '\',this.value)" title="Override rate manually">' +
        clearBtn +
      '</div>' +
    '</div>';
  },

  _buildCurrencyOption(c, selectedCode) {
    return '<option value="' + c.code + '"' + (c.code === selectedCode ? ' selected' : '') + '>' + c.flag + ' ' + c.code + '</option>';
  },

  render() {
    const body = document.getElementById('pg-currency-body');
    if (!body) return;
    const manual = this._getManual();
    const fx = typeof RatesEngine !== 'undefined' ? RatesEngine.getFX() : {};
    const lastUpdated = typeof RatesEngine !== 'undefined' ? RatesEngine.lastUpdated() : 'Unknown';
    const isStale = typeof RatesEngine !== 'undefined' ? RatesEngine.isStale() : true;
    const usdToPkr = fx.PKR || 278.5;
    const staleColor = isStale ? 'var(--warn)' : 'var(--ok)';
    const staleIcon = isStale ? '⚠️' : '✓';

    const rows = this._CURRENCIES
      .filter(function(c) { return c.code !== 'USD'; })
      .map(function(c, i) { return Currency._buildCurrencyRow(c, i, fx, manual, usdToPkr); })
      .join('');

    const fromOpts = this._CURRENCIES.map(function(c) { return Currency._buildCurrencyOption(c, 'USD'); }).join('');
    const toOpts = this._CURRENCIES.map(function(c) { return Currency._buildCurrencyOption(c, 'PKR'); }).join('');

    body.innerHTML =
      '<div style="padding:16px;display:flex;flex-direction:column;gap:14px">' +

        '<div style="background:var(--glass);border:1px solid var(--border);border-radius:16px;padding:14px 16px">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
            '<div style="font-size:13px;font-weight:700;color:var(--text)">💱 Exchange Rates</div>' +
            '<button type="button" onclick="Currency._refreshRates()" style="background:var(--glass2);border:1px solid var(--border);color:var(--accent);border-radius:8px;padding:5px 12px;font-size:11px;font-weight:700;cursor:pointer;touch-action:manipulation">↻ Refresh</button>' +
          '</div>' +
          '<div style="font-size:11px;color:' + staleColor + '">' + staleIcon + ' Last updated: ' + lastUpdated + '</div>' +
          '<div style="font-size:10px;color:var(--text3);margin-top:4px">Base: 1 USD · Tap any rate to override manually</div>' +
        '</div>' +

        '<div style="background:var(--glass);border:1px solid var(--border);border-radius:16px;overflow:hidden">' +
          rows +
        '</div>' +

        '<div style="background:var(--glass);border:1px solid var(--border);border-radius:16px;padding:16px">' +
          '<div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:12px">Quick Convert</div>' +
          '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
            '<input type="number" id="conv-amount" placeholder="Amount" value="100" ' +
              'style="flex:1;min-width:80px;background:var(--input,var(--glass2));border:1px solid var(--border);border-radius:10px;padding:10px;color:var(--text);font-size:16px" ' +
              'oninput="Currency._updateConvert()">' +
            '<select id="conv-from" onchange="Currency._updateConvert()" ' +
              'style="background:var(--input,var(--glass2));border:1px solid var(--border);border-radius:10px;padding:10px;color:var(--text);font-size:14px">' +
              fromOpts +
            '</select>' +
            '<span style="color:var(--text3);font-size:18px;font-weight:300">→</span>' +
            '<select id="conv-to" onchange="Currency._updateConvert()" ' +
              'style="background:var(--input,var(--glass2));border:1px solid var(--border);border-radius:10px;padding:10px;color:var(--text);font-size:14px">' +
              toOpts +
            '</select>' +
          '</div>' +
          '<div id="conv-result" style="margin-top:12px;font-size:22px;font-weight:800;color:var(--accent);text-align:center"></div>' +
        '</div>' +

      '</div>';

    this._updateConvert();
  },

  _updateConvert() {
    const amt = parseFloat((document.getElementById('conv-amount') || {}).value) || 0;
    const from = (document.getElementById('conv-from') || {}).value || 'USD';
    const to = (document.getElementById('conv-to') || {}).value || 'PKR';
    const result = this.convert(amt, from, to);
    const el = document.getElementById('conv-result');
    if (el) el.textContent = result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) + ' ' + to;
  },

  _setManual(code, val) {
    const v = parseFloat(val);
    const m = this._getManual();
    if (!isNaN(v) && v > 0) { m[code] = v; } else { delete m[code]; }
    this._saveManual(m);
  },

  _clearManual(code) {
    const m = this._getManual();
    delete m[code];
    this._saveManual(m);
    this.render();
  },

  async _refreshRates() {
    if (typeof RatesEngine === 'undefined') { Toast.show('Rates engine not available', 'warn'); return; }
    Toast.show('Fetching live rates...', 'info', 2000);
    const ok = await RatesEngine.fetch();
    if (ok) { Toast.show('Rates updated ✓', 'success'); this.render(); }
    else { Toast.show('Could not fetch rates — using cached data', 'warn'); }
  },

  _netWorthSummary() { return ''; },

  save(d) {
    try { localStorage.setItem('vo_currency', JSON.stringify(d)); } catch(e) {}
  },
};
window.Currency = Currency;
