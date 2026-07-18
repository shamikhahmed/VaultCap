// VaultDB — IndexedDB + AES-256-GCM encrypted storage
// Salt → localStorage (not sensitive). Session key → memory only. Data → IndexedDB encrypted.

const VaultDB = (() => {
  let _key  = null;  // AES-GCM session key (in memory only, cleared on lock)
  let _db   = null;  // cached IndexedDB connection
  let _dbId = null;  // which profile DB is open

  function _profileId() {
    try { return localStorage.getItem('vo_active_profile') || 'personal'; }
    catch (e) { return 'personal'; }
  }

  function _dbName() {
    const p = _profileId();
    return p === 'personal' ? 'vaultos' : 'vaultos_' + p;
  }

  // ── IndexedDB helpers ──────────────────────────────────────────────────────

  async function _getDB() {
    const name = _dbName();
    if (_db && _dbId === name) return _db;
    if (_db) {
      try { _db.close(); } catch (e) {}
      _db = null;
      _dbId = null;
    }
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(name, 1);
      req.onupgradeneeded = e => { e.target.result.createObjectStore('vault'); };
      req.onsuccess  = e => { _db = e.target.result; _dbId = name; resolve(_db); };
      req.onerror    = e => reject(e.target.error);
    });
  }

  async function _idbGet(key) {
    const db = await _getDB();
    return new Promise((resolve, reject) => {
      const req = db.transaction('vault', 'readonly').objectStore('vault').get(key);
      req.onsuccess = e => resolve(e.target.result);
      req.onerror   = e => reject(e.target.error);
    });
  }

  async function _idbPut(key, value) {
    const db = await _getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('vault', 'readwrite');
      tx.objectStore('vault').put(value, key);
      tx.oncomplete = resolve;
      tx.onerror    = e => reject(e.target.error);
    });
  }

  async function _idbClearAll() {
    const db = await _getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('vault', 'readwrite');
      tx.objectStore('vault').clear();
      tx.oncomplete = resolve;
      tx.onerror    = e => reject(e.target.error);
    });
  }

  // ── Salt (non-sensitive, lives in localStorage) ────────────────────────────

  function _getSalt() {
    const p = _profileId();
    const saltKey = p === 'personal' ? 'vos_salt' : 'vos_salt_' + p;
    let s = localStorage.getItem(saltKey);
    if (!s) {
      const bytes = crypto.getRandomValues(new Uint8Array(16));
      s = btoa(String.fromCharCode(...bytes));
      localStorage.setItem(saltKey, s);
    }
    return new Uint8Array(atob(s).split('').map(c => c.charCodeAt(0)));
  }

  // ── Key derivation ─────────────────────────────────────────────────────────
  // Target: 600k (OWASP). Existing vaults may still be on 310k — migrate on unlock.

  const KDF_TARGET = 600000;
  const KDF_LEGACY = 310000;

  function _kdfKey() {
    const p = _profileId();
    return p === 'personal' ? 'vos_kdf_iters' : 'vos_kdf_iters_' + p;
  }

  function _getKdfIters() {
    try {
      const v = parseInt(localStorage.getItem(_kdfKey()) || '', 10);
      if (v === KDF_TARGET || v === KDF_LEGACY) return v;
    } catch (e) {}
    // Unknown / first run after upgrade: prefer legacy so unlock still works
    return KDF_LEGACY;
  }

  function _setKdfIters(n) {
    try { localStorage.setItem(_kdfKey(), String(n)); } catch (e) {}
  }

  function _authModeKey() {
    const p = _profileId();
    return p === 'personal' ? 'vos_auth_mode' : 'vos_auth_mode_' + p;
  }

  function _getAuthMode() {
    try {
      const m = localStorage.getItem(_authModeKey());
      if (m === 'passphrase' || m === 'pin') return m;
    } catch (e) {}
    return 'pin';
  }

  function _setAuthMode(mode) {
    try { localStorage.setItem(_authModeKey(), mode === 'passphrase' ? 'passphrase' : 'pin'); } catch (e) {}
  }

  async function _deriveKey(pin, iterations) {
    const enc = new TextEncoder();
    const iters = iterations || _getKdfIters();
    const km  = await crypto.subtle.importKey(
      'raw', enc.encode(String(pin)), 'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: _getSalt(), iterations: iters, hash: 'SHA-256' },
      km,
      { name: 'AES-GCM', length: 256 },
      false, ['encrypt', 'decrypt']
    );
  }

  // ── Master-key derivation (PBKDF2 + vault salt — recovery slot) ────────────

  async function _deriveMasterKey(masterKey) {
    const enc = new TextEncoder();
    const km = await crypto.subtle.importKey(
      'raw', enc.encode(String(masterKey) + ':vaultos-recovery-v2'), 'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: _getSalt(), iterations: KDF_TARGET, hash: 'SHA-256' },
      km,
      { name: 'AES-GCM', length: 256 },
      false, ['encrypt', 'decrypt']
    );
  }

  async function _deriveMasterKeyLegacy(masterKey) {
    const enc = new TextEncoder().encode(String(masterKey) + ':vaultos-recovery-v1');
    const hash = await crypto.subtle.digest('SHA-256', enc);
    return crypto.subtle.importKey('raw', hash, 'AES-GCM', false, ['encrypt', 'decrypt']);
  }

  // ── Encrypt / Decrypt ──────────────────────────────────────────────────────

  async function _encrypt(key, data) {
    const iv  = crypto.getRandomValues(new Uint8Array(12));
    const ct  = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv }, key,
      new TextEncoder().encode(JSON.stringify(data))
    );
    const buf = new Uint8Array(12 + ct.byteLength);
    buf.set(iv, 0);
    buf.set(new Uint8Array(ct), 12);
    return buf;
  }

  async function _decrypt(key, buf) {
    const dec = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: buf.slice(0, 12) },
      key, buf.slice(12)
    );
    return JSON.parse(new TextDecoder().decode(dec));
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  return {
    // In-memory session key accessor (set to null on lock)
    get sessionKey() { return _key; },
    set sessionKey(v) { _key = v; },

    // Derive key from PIN and store in memory. Call before save/load.
    async init(pin) {
      const has = await (async () => {
        try { return !!(await _idbGet('main')); } catch (e) { return false; }
      })();
      if (!has) _setKdfIters(KDF_TARGET);
      _key = await _deriveKey(pin, has ? _getKdfIters() : KDF_TARGET);
      await _getDB();
    },

    // Encrypt data and write to IndexedDB slot 'main'.
    // Keeps previous main ciphertext in pin_backup so the last save can be rolled back.
    async save(data) {
      if (!_key) throw new Error('VaultDB: session not initialized');
      try {
        const prev = await _idbGet('main');
        if (prev) await _idbPut('pin_backup', prev);
      } catch (e) { /* non-fatal */ }
      const buf = await _encrypt(_key, data);
      await _idbPut('main', buf);
      // Always keep a decoy-sized ciphertext slot so "has decoy?" is not forensic
      try { await this._ensureDecoyPadding(buf.byteLength); } catch (e) {}
    },

    async loadPinBackup() {
      if (!_key) return null;
      try {
        const buf = await _idbGet('pin_backup');
        if (!buf) return null;
        return await _decrypt(_key, buf);
      } catch (e) {
        return null;
      }
    },

    async hasPinBackup() {
      try {
        return !!(await _idbGet('pin_backup'));
      } catch (e) {
        return false;
      }
    },

    async restorePinBackup() {
      if (!_key) throw new Error('VaultDB: session not initialized');
      const buf = await _idbGet('pin_backup');
      if (!buf) throw new Error('VaultDB: no pin backup');
      await _idbPut('main', buf);
      return await _decrypt(_key, buf);
    },

    // Read and decrypt from slot 'main'. Returns null if no key or decrypt fails.
    async load() {
      if (!_key) return null;
      try {
        const buf = await _idbGet('main');
        if (!buf) return null;
        return await _decrypt(_key, buf);
      } catch (e) {
        return null;
      }
    },

    // Wipe all IndexedDB data and clear session key.
    async clear() {
      _key = null;
      try { await _idbClearAll(); } catch(e) {}
    },

    // Re-encrypt existing data with a new PIN-derived key.
    async changePin(oldPin, newPin) {
      const data = await this.load();
      if (data === null) throw new Error('VaultDB: could not decrypt with current PIN');
      _key = await _deriveKey(newPin);
      await this.save(data);
    },

    // Returns true if encrypted data exists in IndexedDB.
    async isInitialized() {
      try {
        const buf = await _idbGet('main');
        return !!buf;
      } catch(e) {
        return false;
      }
    },

    // Try to decrypt 'main' slot then 'decoy' slot with the given PIN.
    // Returns { slot: 'main'|'decoy', data } or null on failure.
    async tryPin(pin) {
      const itersToTry = [_getKdfIters()];
      if (!itersToTry.includes(KDF_LEGACY)) itersToTry.push(KDF_LEGACY);
      if (!itersToTry.includes(KDF_TARGET)) itersToTry.push(KDF_TARGET);

      for (const iters of itersToTry) {
        const key = await _deriveKey(pin, iters);
        for (const slot of ['main', 'decoy']) {
          const buf = await _idbGet(slot);
          if (!buf) continue;
          try {
            const data = await _decrypt(key, buf);
            _key = key;
            // Migrate vault to stronger KDF after successful unlock
            if (iters !== KDF_TARGET && slot === 'main') {
              try {
                _key = await _deriveKey(pin, KDF_TARGET);
                await this.save(data);
                _setKdfIters(KDF_TARGET);
              } catch (migErr) {
                _key = key;
                _setKdfIters(iters);
                console.warn('[VaultDB] KDF migrate deferred:', migErr);
              }
            } else {
              _setKdfIters(iters === KDF_TARGET ? KDF_TARGET : iters);
            }
            return { slot, data };
          } catch(e) {
            // wrong key / wrong iters for this slot
          }
        }
      }
      return null;
    },

    // Encrypt decoy marker with decoy PIN and store in 'decoy' slot.
    async saveDecoySlot(decoyPin, decoyData) {
      const k   = await _deriveKey(decoyPin);
      const buf = await _encrypt(k, decoyData || { _decoy: true });
      await _idbPut('decoy', buf);
    },

    // Replace real decoy with random padding (slot always present).
    async clearDecoySlot() {
      await this._writePaddingDecoy();
    },

    async _ensureDecoyPadding(mainBytes) {
      const existing = await _idbGet('decoy');
      if (existing) return;
      await this._writePaddingDecoy(mainBytes);
    },

    async _writePaddingDecoy(sizeHint) {
      const raw = crypto.getRandomValues(new Uint8Array(32));
      const key = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt']);
      const noise = {
        _pad: true,
        _noise: Array.from(crypto.getRandomValues(new Uint8Array(48))),
      };
      let buf = await _encrypt(key, noise);
      // Match main blob size roughly so slot length is not a tell
      const target = Math.max(buf.byteLength, Math.min(sizeHint || 0, 65536));
      if (buf.byteLength < target) {
        const padded = new Uint8Array(target);
        padded.set(buf);
        crypto.getRandomValues(padded.subarray(buf.byteLength));
        buf = padded;
      }
      await _idbPut('decoy', buf);
    },

    getAuthMode() { return _getAuthMode(); },
    setAuthMode(mode) { _setAuthMode(mode); },

    /** One-time: re-encrypt passphrase vault with 6-digit PIN unlock. */
    async migrateToPin(passphrase, pin) {
      const pp = String(passphrase || '');
      const p = String(pin || '');
      if (!/^\d{6}$/.test(p)) throw new Error('PIN must be 6 digits');
      const result = await this.tryPin(pp);
      if (!result || result.slot !== 'main') throw new Error('Old passphrase incorrect');
      _setKdfIters(KDF_TARGET);
      _key = await _deriveKey(p, KDF_TARGET);
      await this.save(result.data);
      _setAuthMode('pin');
      return result.data;
    },

    // Download current encrypted blob as a .vos file.
    // Deprecated device-bound export — use ExIm.export('vault') for portable .vos
    async exportEncrypted() {
      throw new Error('Use ExIm portable export (backup-key encrypted .vos)');
    },

    // Wipe all vault data and clear session key.
    async wipe() {
      _key = null;
      try { await _idbClearAll(); } catch(e) {}
      if (_db) {
        try { _db.close(); } catch(e) {}
      }
      _db = null;
      _dbId = null;
    },

    activeProfile() { return _profileId(); },
    databaseName() { return _dbName(); },

    // Save a recovery copy of current vault data encrypted with master key.
    async saveRecovery(masterKey) {
      const data = await this.load();
      if (!data) return;
      const rkey = await _deriveMasterKey(masterKey);
      const buf = await _encrypt(rkey, data);
      await _idbPut('recovery', buf);
    },

    // Load and decrypt recovery slot with master key. Returns data or null.
    async loadRecovery(masterKey) {
      try {
        const buf = await _idbGet('recovery');
        if (!buf) return null;
        try {
          const rkey = await _deriveMasterKey(masterKey);
          return await _decrypt(rkey, buf);
        } catch (e1) {
          const rkey = await _deriveMasterKeyLegacy(masterKey);
          return await _decrypt(rkey, buf);
        }
      } catch(e) {
        return null;
      }
    },

    // Decrypt recovery slot with master key, re-encrypt with new PIN.
    async recoverAccess(masterKey, newPin) {
      const data = await this.loadRecovery(masterKey);
      if (!data) throw new Error('Recovery slot not found or master key incorrect');
      _key = await _deriveKey(newPin);
      await this.save(data);
    },

    // Import a .vos file, decrypt with given PIN, store as new 'main', return data.
    async importEncrypted(file, pin) {
      const ab  = await file.arrayBuffer();
      const buf = new Uint8Array(ab);
      const key = await _deriveKey(pin);
      try {
        const data = await _decrypt(key, buf);
        _key = key;
        await _idbPut('main', buf);
        return data;
      } catch(e) {
        throw new Error('Decryption failed — wrong PIN or corrupted file');
      }
    }
  };
})();
