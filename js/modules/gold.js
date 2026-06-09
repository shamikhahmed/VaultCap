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
    return this.get();
  },
  totalPKR() {
    const items = typeof Assets !== 'undefined' ? Assets.byType('precious_metals') : this.get();
    return items.reduce((s, a) => {
      if (typeof Assets !== 'undefined') return s + Assets._valueInPKR(a);
      let ppg = typeof RatesEngine !== 'undefined'
        ? ((a.metal || a.metalType || 'gold') === 'silver' ? RatesEngine.silverInCurrency('PKR', 'gram') : RatesEngine.goldInCurrency('PKR', 'gram'))
        : 0;
      let grams = a.weight || 0;
      const unit = a.unit || a.weightUnit || 'g';
      if (unit === 'tola') grams *= 11.6638;
      else if (unit === 'oz' || unit === 'troy oz') grams *= 31.1035;
      else if (unit === 'kg') grams *= 1000;
      return s + grams * ppg;
    }, 0);
  },
  getZakatableAmount(currency) {
    const pkr = this.totalPKR();
    return typeof CurrencyEngine !== 'undefined' ? CurrencyEngine.fromBase(pkr, currency || 'PKR') : pkr;
  },
  detail(id) { if (typeof Assets !== 'undefined') Assets.edit(id); },
  del(id) { if (typeof Assets !== 'undefined') Assets.del(id); }
};
window.Gold = Gold;
