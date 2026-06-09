'use strict';
/* Encrypted vault meta — replaces plain localStorage for calculator modules */

const VaultMeta = {
  _keys: ['creditScore', 'zakatState', 'zakatCalc', 'taxCalc'],

  _ensure() {
    if (!S.vaultMeta || typeof S.vaultMeta !== 'object') {
      S.vaultMeta = { creditScore: {}, zakatState: {}, zakatCalc: {}, taxCalc: {} };
    }
    this._keys.forEach(k => { if (!S.vaultMeta[k]) S.vaultMeta[k] = {}; });
  },

  get(key) {
    this._ensure();
    return S.vaultMeta[key] || {};
  },

  set(key, val) {
    this._ensure();
    S.vaultMeta[key] = val || {};
    if (typeof Store !== 'undefined') Store.save();
  },

  migrateFromLocalStorage() {
    if (localStorage.getItem('vo_vault_meta_migrated') === '1') return false;
    this._ensure();
    let changed = false;
    const map = [
      ['vo_credit_score', 'creditScore'],
      ['vo_zakat_state', 'zakatState'],
      ['vo_zakat_calc', 'zakatCalc'],
      ['vo_tax_calc', 'taxCalc'],
    ];
    map.forEach(([lsKey, metaKey]) => {
      try {
        const raw = localStorage.getItem(lsKey);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length) {
          S.vaultMeta[metaKey] = { ...S.vaultMeta[metaKey], ...parsed };
          changed = true;
        }
        localStorage.removeItem(lsKey);
      } catch (e) {}
    });
    if (changed) {
      if (typeof Store !== 'undefined') Store.save();
    }
    localStorage.setItem('vo_vault_meta_migrated', '1');
    return changed;
  },
};

window.VaultMeta = VaultMeta;
