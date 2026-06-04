'use strict';
/* VaultOS Gadgets — Compatibility wrapper.
 * Gadgets now live in S.assets with assetType:'electronics' (migrated at schema v10).
 * This wrapper redirects the gadgets screen to the unified Assets screen.
 */

const Gadgets = {
  render() {
    S.aF = 'electronics';
    if (typeof R !== 'undefined') R.goto('assets');
  },
  openAdd() {
    if (typeof Assets !== 'undefined') Assets.openAdd('electronics');
  },
  get() {
    return typeof Assets !== 'undefined' ? Assets.byType('electronics') : [];
  },
  totalPKR() {
    return typeof Assets !== 'undefined'
      ? Assets.byType('electronics').reduce((s, a) => s + Assets._valueInPKR(a), 0)
      : 0;
  },
  detail(id) { if (typeof Assets !== 'undefined') Assets.edit(id); },
  del(id) { if (typeof Assets !== 'undefined') Assets.del(id); }
};
window.Gadgets = Gadgets;
