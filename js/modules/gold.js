'use strict';
/* VaultOS Gold — Compatibility wrapper.
 * Precious metals now live in S.assets with assetType:'precious_metals' (migrated at schema v10).
 * This wrapper redirects the gold screen to the unified Assets screen.
 * Gold.totalPKR() and Gold.getZakatableAmount() are preserved for Zakat module compatibility.
 */

const Gold = {
  render() {
    S.aF = 'precious_metals';
    if (typeof R !== 'undefined') R.goto('assets');
  },
  openAdd() {
    if (typeof Assets !== 'undefined') Assets.openAdd('precious_metals');
  },
  get() {
    // Return migrated records from S.assets for backward compat
    return typeof Assets !== 'undefined' ? Assets.byType('precious_metals') : [];
  },
  getLegacy() {
    try { return JSON.parse(localStorage.getItem('vo_gold') || '[]'); } catch(e) { return []; }
  },
  totalPKR() {
    if (typeof Assets !== 'undefined') {
      return Assets.byType('precious_metals').reduce((s, a) => s + Assets._valueInPKR(a), 0);
    }
    // Fallback: read from localStorage if Assets not ready
    try {
      const items = JSON.parse(localStorage.getItem('vo_gold') || '[]');
      return items.reduce((a, g) => {
        let ppg = typeof RatesEngine !== 'undefined'
          ? (g.metal === 'silver' ? RatesEngine.silverInCurrency('PKR', 'gram') : RatesEngine.goldInCurrency('PKR', 'gram'))
          : 0;
        let grams = g.weight || 0;
        if (g.unit === 'tola') grams *= 11.6638;
        else if (g.unit === 'oz') grams *= 31.1035;
        else if (g.unit === 'kg') grams *= 1000;
        return a + grams * ppg;
      }, 0);
    } catch(e) { return 0; }
  },
  getZakatableAmount(currency) {
    const pkr = this.totalPKR();
    return typeof CurrencyEngine !== 'undefined' ? CurrencyEngine.fromBase(pkr, currency || 'PKR') : pkr;
  },
  detail(id) { if (typeof Assets !== 'undefined') Assets.edit(id); },
  del(id) { if (typeof Assets !== 'undefined') Assets.del(id); }
};
window.Gold = Gold;
