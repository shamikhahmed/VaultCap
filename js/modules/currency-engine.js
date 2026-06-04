'use strict';
/* VaultOS Currency Engine — Single source of truth for all conversions
 * All amounts are normalised to PKR internally, then converted to display currency.
 * Usage:
 *   CurrencyEngine.convert(amount, fromCurrency, toCurrency) → number
 *   CurrencyEngine.toBase(amount, currency)  → PKR equivalent
 *   CurrencyEngine.fromBase(pkrAmount, toCurrency) → display amount
 *   CurrencyEngine.fmt(pkrAmount, displayCurrency) → formatted string
 */
const CurrencyEngine = (() => {
  // Live rates come from RatesEngine if available, fallback to hardcoded
  function _rates() {
    try {
      if (typeof RatesEngine !== 'undefined' && RatesEngine.rates) {
        return RatesEngine.rates;
      }
    } catch(e) {}
    // Fallback rates (PKR base)
    return {
      PKR: 1,
      GBP: 0.00284,  // 1 PKR = 0.00284 GBP
      USD: 0.00358,
      AED: 0.01316,
      EUR: 0.00330,
      SAR: 0.01343,
      CAD: 0.00489,
      AUD: 0.00549,
      SGD: 0.00477,
      CHF: 0.00321
    };
  }

  // Convert any amount from one currency to another
  function convert(amount, from, to) {
    if (!amount || isNaN(amount)) return 0;
    from = (from || 'PKR').toUpperCase();
    to   = (to   || 'PKR').toUpperCase();
    if (from === to) return Number(amount);
    const rates = _rates();
    const fromRate = rates[from] || 1;
    const toRate   = rates[to]   || 1;
    // Convert: amount → PKR → target
    return Number(amount) / fromRate * toRate;
  }

  // Convert any currency amount to PKR base
  function toBase(amount, currency) {
    return convert(amount, currency || 'PKR', 'PKR');
  }

  // Convert PKR base amount to display currency
  function fromBase(pkrAmount, toCurrency) {
    return convert(pkrAmount, 'PKR', toCurrency || 'PKR');
  }

  // Get user display currency
  function displayCurrency() {
    try { return (S.user && S.user.currency) || 'PKR'; } catch(e) { return 'PKR'; }
  }

  // Format a PKR base amount in display currency with symbol
  function fmt(pkrAmount, toCurrency) {
    const cur = toCurrency || displayCurrency();
    const val = fromBase(pkrAmount, cur);
    return cur + ' ' + Math.round(val).toLocaleString();
  }

  // Format any amount in its own currency
  function fmtOwn(amount, currency) {
    const cur = (currency || 'PKR').toUpperCase();
    return cur + ' ' + Math.round(amount || 0).toLocaleString();
  }

  // Sum an array of {amount, currency} objects, return PKR total
  function sumToBase(items, amountKey, currencyKey) {
    amountKey  = amountKey  || 'amount';
    currencyKey = currencyKey || 'currency';
    return (items || []).reduce((total, item) => {
      return total + toBase(item[amountKey] || 0, item[currencyKey] || 'PKR');
    }, 0);
  }

  return { convert, toBase, fromBase, displayCurrency, fmt, fmtOwn, sumToBase };
})();

window.CurrencyEngine = CurrencyEngine;
