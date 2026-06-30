'use strict';
/* VaultOS Currency Engine — Single source of truth for all conversions
 * All amounts are normalised to PKR internally, then converted to display currency.
 * Usage:
 *   CurrencyEngine.convert(amount, fromCurrency, toCurrency) → number
 *   CurrencyEngine.toBase(amount, currency)  → PKR equivalent
 *   CurrencyEngine.fromBase(pkrAmount, toCurrency) → display amount
 *   CurrencyEngine.fmt(pkrAmount, displayCurrency) → formatted string
 *   CurrencyEngine.computeNetWorthPKR(opts) → breakdown object (PKR base)
 */
const CurrencyEngine = (() => {
  const _PKR_FALLBACK = {
    PKR: 1,
    GBP: 0.00284,
    USD: 0.00358,
    AED: 0.01316,
    EUR: 0.00330,
    SAR: 0.01343,
    CAD: 0.00489,
    AUD: 0.00549,
    SGD: 0.00477,
    CHF: 0.00321,
  };

  function _rates() {
    try {
      if (typeof RatesEngine !== 'undefined' && typeof RatesEngine.getFX === 'function') {
        const fx = RatesEngine.getFX();
        const pkrPerUsd = fx.PKR || 278.5;
        const out = { PKR: 1 };
        Object.keys(fx).forEach((code) => {
          if (code === 'PKR' || !fx[code]) return;
          out[code] = fx[code] / pkrPerUsd;
        });
        return out;
      }
    } catch (e) {}
    return { ..._PKR_FALLBACK };
  }

  function convert(amount, from, to) {
    if (!amount || isNaN(amount)) return 0;
    from = (from || 'PKR').toUpperCase();
    to = (to || 'PKR').toUpperCase();
    if (from === to) return Number(amount);
    try {
      if (typeof RatesEngine !== 'undefined' && typeof RatesEngine.convert === 'function') {
        return RatesEngine.convert(Number(amount), from, to);
      }
    } catch (e) {}
    const rates = _rates();
    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;
    return Number(amount) / fromRate * toRate;
  }

  function toBase(amount, currency) {
    return convert(amount, currency || 'PKR', 'PKR');
  }

  function fromBase(pkrAmount, toCurrency) {
    return convert(pkrAmount, 'PKR', toCurrency || 'PKR');
  }

  function displayCurrency() {
    try { return (S.user && S.user.currency) || 'PKR'; } catch (e) { return 'PKR'; }
  }

  function fmt(pkrAmount, toCurrency) {
    const cur = toCurrency || displayCurrency();
    const val = fromBase(pkrAmount, cur);
    return cur + ' ' + Math.round(val).toLocaleString();
  }

  function fmtOwn(amount, currency) {
    const cur = (currency || 'PKR').toUpperCase();
    return cur + ' ' + Math.round(amount || 0).toLocaleString();
  }

  function sumToBase(items, amountKey, currencyKey) {
    amountKey = amountKey || 'amount';
    currencyKey = currencyKey || 'currency';
    return (items || []).reduce((total, item) => {
      return total + toBase(item[amountKey] || 0, item[currencyKey] || 'PKR');
    }, 0);
  }

  function _assetValuePKR(x, toB) {
    if ((x.assetType === 'precious_metals' || x.assetType === 'precious') && x.weight && typeof RatesEngine !== 'undefined') {
      let gr = x.weight || 0;
      const un = x.unit || x.weightUnit || 'g';
      if (un === 'tola') gr *= 11.6638;
      else if (un === 'oz' || un === 'troy oz') gr *= 31.1035;
      else if (un === 'kg') gr *= 1000;
      const m = (x.metal || x.metalType || 'gold').toLowerCase();
      const ppg = m === 'silver'
        ? RatesEngine.silverInCurrency('PKR', 'gram')
        : RatesEngine.goldInCurrency('PKR', 'gram');
      return gr * ppg;
    }
    return toB(x.currentValue || 0, x.currency);
  }

  /** Shared net-worth math — all values in PKR base. */
  function computeNetWorthPKR(options = {}) {
    const ctxFilter = options.ctxFilter || (arr => arr || []);
    const ownerFilter = options.ownerFilter || null;
    const filterByOwner = (arr) => {
      let list = ctxFilter(arr || []);
      if (ownerFilter) list = list.filter(item => ownerFilter.has(item.ownerId));
      return list;
    };

    const _CC = typeof COUNTRY_CUR !== 'undefined' ? COUNTRY_CUR : { PK: 'PKR', GB: 'GBP', AE: 'AED', US: 'USD' };
    const homeCur = (
      typeof S !== 'undefined' && S.user
        ? (S.user.homeCurrency || _CC[S.user.country] || 'PKR')
        : 'PKR'
    ).toUpperCase();
    const itemCur = (c) => (c && String(c).trim()) ? String(c).trim().toUpperCase() : homeCur;
    const toB = (a, c) => toBase(a || 0, itemCur(c));

    const invPKR = filterByOwner(S.investments).reduce((a, i) => a + toB(i.currentValue || 0, i.currency), 0);
    const asPKR = filterByOwner(S.assets).reduce((a, x) => a + _assetValuePKR(x, toB), 0);
    const cashPKR = filterByOwner(S.cash).reduce((a, c) => a + toB(c.amount || 0, c.currency), 0);
    const bankPKR = filterByOwner(S.banks).reduce((a, b) => a + toB(b.balance || 0, b.currency), 0);
    const debtPKR = filterByOwner(S.loans)
      .filter(l => l.type === 'borrowed' && l.status !== 'Settled')
      .reduce((a, l) => a + toB(l.amount || 0, l.currency), 0);
    const bcPKR = typeof BCModule !== 'undefined' ? BCModule.getZakatableAmount('PKR') : 0;
    const bondsPKR = typeof BondsModule !== 'undefined' ? BondsModule.getZakatableAmount('PKR') : 0;
    const nwPKR = bankPKR + invPKR + asPKR + cashPKR + bcPKR + bondsPKR - debtPKR;

    return { bankPKR, invPKR, asPKR, cashPKR, bcPKR, bondsPKR, debtPKR, nwPKR };
  }

  return {
    convert, toBase, fromBase, displayCurrency, fmt, fmtOwn, sumToBase, computeNetWorthPKR,
  };
})();

window.CurrencyEngine = CurrencyEngine;
