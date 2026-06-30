'use strict';
/* VaultHealth — single source of truth for vault health score */

const VaultHealth = {
  score() {
    let s = 0;
    if (Crypto.available())                                    s += 20; // AES-256-GCM ready
    if (S.pin !== '123456')                                    s += 20; // Custom PIN (undefined = VaultDB mode = custom)
    const daysSince = S.user?.lastBackup
      ? Math.floor((Date.now() - new Date(S.user.lastBackup)) / 86400000) : 999;
    if (daysSince <= 7)       s += 20;
    else if (daysSince <= 30) s += 10;
    else if (daysSince < 999) s += 3;
    if (localStorage.getItem(recoveryKeyStorageKey()))                        s += 15; // Recovery key saved
    if (S.autoLock)                                            s += 10; // Auto-lock on
    if (S.decoyPin)                                            s += 8;  // Decoy PIN
    if (S.emergency && S.emergency.enabled)                    s += 5;  // Emergency info
    if (S.privacyMode !== undefined)                           s += 2;  // Privacy-mode available
    return Math.min(s, 100);
  },
  label(score) {
    return score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Attention';
  },
  color(score) {
    return score >= 80 ? 'var(--ok)' : score >= 60 ? 'var(--warn)' : 'var(--err)';
  },
  checks() {
    const daysSince = S.user?.lastBackup
      ? Math.floor((Date.now() - new Date(S.user.lastBackup)) / 86400000) : 999;
    return [
      { ok: Crypto.available(),                  label: 'AES-256 encryption' },
      { ok: S.pin !== '123456',                  label: 'Custom PIN' },
      { ok: !!localStorage.getItem(recoveryKeyStorageKey()),    label: 'Recovery key saved' },
      { ok: daysSince <= 30,                     label: daysSince >= 999 ? 'No backup yet' : daysSince === 0 ? 'Backed up today' : `Backup ${daysSince}d ago` },
      { ok: S.autoLock,                          label: 'Auto-lock on' },
      { ok: !!S.decoyPin,                        label: 'Decoy PIN' },
      { ok: !!(S.emergency && S.emergency.enabled), label: 'Emergency info' },
    ];
  },
};
window.VaultHealth = VaultHealth;

// S + Store → js/core/store-engine.js (loaded before app.js)

// ===================== TOAST =====================
