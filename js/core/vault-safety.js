'use strict';
/* VaultSafety — PIN backup restore offer + restore logic */

const VaultSafety = {
  async maybeOfferRestore() {
    if (VaultProfiles.isDemo() || !S.unlocked) return;
    if (sessionStorage.getItem('vo_restore_offer_dismissed')) return;
    if (!(await VaultDB.hasPinBackup())) return;
    const backup = await VaultDB.loadPinBackup();
    if (!backup) return;
    const mainCount = _vaultEntityCount(Store._data());
    const backupCount = _vaultEntityCount(backup);
    if (backupCount < 3 || backupCount <= mainCount) return;
    Modal.open('↩ Restore previous vault?',
      `<div class="vc-ix-96">A saved copy from before your last change is available (${backupCount} entries vs ${mainCount} now). This can recover data after an accidental demo load or bad import.</div>`,
      `<button type="button" class="btn btn-g" data-act="ActHelpers.dismissRestoreOffer()">Keep current</button>` +
      `<button type="button" class="btn btn-p" data-act="VaultSafety.restore()">Restore previous →</button>`
    );
  },

  async restore() {
    try {
      const data = await VaultDB.restorePinBackup();
      Object.assign(S, data);
      await Store.save();
      Modal.close();
      buildNav();
      Toast.show('Previous vault restored', 'success', 5000);
      R.goto('dashboard');
      setTimeout(() => Dash.render(), 50);
    } catch (e) {
      Toast.show('Restore failed — try Backup Center import', 'error');
    }
  },
};
window.VaultSafety = VaultSafety;

