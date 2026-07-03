'use strict';
// Pre-unlock brute-force state — localStorage (profile-scoped), survives sessionStorage clear.

const LockoutStore = {
  _profile() {
    try {
      if (typeof VaultProfiles !== 'undefined' && VaultProfiles.active) return VaultProfiles.active();
      return localStorage.getItem('vo_active_profile') || 'personal';
    } catch (e) {
      return 'personal';
    }
  },

  _key() {
    return 'vc_lockout_v1_' + this._profile();
  },

  load() {
    try {
      const raw = localStorage.getItem(this._key());
      if (!raw) return null;
      const o = JSON.parse(raw);
      if (!o || typeof o.fails !== 'number') return null;
      const lockedUntil = o.lockedUntil || 0;
      if (lockedUntil && Date.now() >= lockedUntil && o.fails < 10) {
        this.clear();
        return { fails: 0, lockedUntil: 0 };
      }
      return { fails: o.fails, lockedUntil };
    } catch (e) {
      return null;
    }
  },

  save(fails, lockedUntil) {
    try {
      localStorage.setItem(this._key(), JSON.stringify({
        fails: fails || 0,
        lockedUntil: lockedUntil || 0,
        at: Date.now(),
      }));
      sessionStorage.removeItem('vos_fails');
      localStorage.removeItem('vos_fails');
    } catch (e) {}
  },

  clear() {
    try {
      localStorage.removeItem(this._key());
      sessionStorage.removeItem('vos_fails');
      localStorage.removeItem('vos_fails');
    } catch (e) {}
  },
};

window.LockoutStore = LockoutStore;
