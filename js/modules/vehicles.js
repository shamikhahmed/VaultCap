'use strict';
/* VaultOS Vehicles — Compatibility wrapper.
 * Vehicles now live in S.assets with assetType:'vehicle' (migrated at schema v10).
 * This wrapper redirects the vehicles screen to the unified Assets screen.
 */

const Vehicles = {
  render() {
    S.aF = 'vehicle';
    if (typeof R !== 'undefined') R.goto('assets');
  },
  openAdd() {
    if (typeof Assets !== 'undefined') Assets.openAdd('vehicle');
  },
  get() {
    return typeof Assets !== 'undefined' ? Assets.byType('vehicle') : [];
  },
  totalPKR() {
    return typeof Assets !== 'undefined'
      ? Assets.byType('vehicle').reduce((s, a) => s + Assets._valueInPKR(a), 0)
      : 0;
  },
  detail(id) { if (typeof Assets !== 'undefined') Assets.edit(id); },
  edit(id) { this.detail(id); },
  del(id) { if (typeof Assets !== 'undefined') Assets.del(id); }
};
window.Vehicles = Vehicles;
