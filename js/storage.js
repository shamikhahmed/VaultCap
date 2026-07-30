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

  function _wrapModeKey() {
    const p = _profileId();
    return p === 'personal' ? 'vos_kdf_mode' : 'vos_kdf_mode_' + p;
  }

  function _isWrapped() {
    try { return localStorage.getItem(_wrapModeKey()) === 'wrapped'; } catch (e) { return false; }
  }

  function _setWrapped(on) {
    try {
      if (on) localStorage.setItem(_wrapModeKey(), 'wrapped');
      else localStorage.removeItem(_wrapModeKey());
    } catch (e) {}
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

  /** Random vault DEK — extractable so PIN-KEK wrap + WebAuthn PRF wrap work. */
  async function _generateDek() {
    return crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  async function _encryptRaw(key, rawBytes) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, rawBytes);
    const buf = new Uint8Array(12 + ct.byteLength);
    buf.set(iv, 0);
    buf.set(new Uint8Array(ct), 12);
    return buf;
  }

  async function _decryptRaw(key, buf) {
    const dec = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: buf.slice(0, 12) },
      key, buf.slice(12)
    );
    return new Uint8Array(dec);
  }

  async function _wrapDek(kek, dek) {
    const raw = await crypto.subtle.exportKey('raw', dek);
    return _encryptRaw(kek, new Uint8Array(raw));
  }

  async function _unwrapDek(kek, wrapBuf) {
    const raw = await _decryptRaw(kek, wrapBuf);
    return crypto.subtle.importKey('raw', raw, 'AES-GCM', true, ['encrypt', 'decrypt']);
  }

  /** After legacy PIN-KDF unlock: re-encrypt with random DEK, wrap DEK with PIN-KEK. */
  async function _migrateToWrapped(pin, data) {
    const dek = await _generateDek();
    const kek = await _deriveKey(pin, KDF_TARGET);
    const wrapBuf = await _wrapDek(kek, dek);
    await _idbPut('key_wrap', wrapBuf);
    _key = dek;
    _setKdfIters(KDF_TARGET);
    _setWrapped(true);
    // Caller must save(data) with _key = dek
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

    // Derive session: new vaults get random DEK wrapped by PIN-KEK; existing unlocked via tryPin.
    async init(pin) {
      const has = await (async () => {
        try { return !!(await _idbGet('main')); } catch (e) { return false; }
      })();
      await _getDB();
      if (!has) {
        _setKdfIters(KDF_TARGET);
        const dek = await _generateDek();
        const kek = await _deriveKey(pin, KDF_TARGET);
        await _idbPut('key_wrap', await _wrapDek(kek, dek));
        _key = dek;
        _setWrapped(true);
        return;
      }
      // Existing vault — tryPin sets session key; keep legacy derive as fallback for callers
      _key = await _deriveKey(pin, _getKdfIters());
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
      _setWrapped(false);
    },

    // Re-wrap DEK with new PIN (wrapped mode) or re-encrypt (legacy then migrate).
    async changePin(oldPin, newPin) {
      const data = await this.load();
      if (data === null) throw new Error('VaultDB: could not decrypt with current PIN');
      const wrapBuf = await _idbGet('key_wrap');
      if (wrapBuf || _isWrapped()) {
        const oldKek = await _deriveKey(oldPin, KDF_TARGET);
        let dek = _key;
        try {
          dek = await _unwrapDek(oldKek, wrapBuf || await _idbGet('key_wrap'));
        } catch (e) {
          throw new Error('VaultDB: could not verify current PIN');
        }
        const newKek = await _deriveKey(newPin, KDF_TARGET);
        await _idbPut('key_wrap', await _wrapDek(newKek, dek));
        _key = dek;
        _setWrapped(true);
        _setKdfIters(KDF_TARGET);
        return;
      }
      // Legacy PIN-as-KDF → re-encrypt then wrap
      _key = await _deriveKey(newPin, KDF_TARGET);
      await this.save(data);
      try {
        await _migrateToWrapped(newPin, data);
        await this.save(data);
      } catch (e) {
        console.warn('[VaultDB] wrap after changePin deferred:', e);
      }
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

      const wrapBuf = await _idbGet('key_wrap');

      // Wrapped DEK path (PIN → KEK → unwrap DEK → decrypt vault)
      if (wrapBuf) {
        for (const iters of itersToTry) {
          try {
            const kek = await _deriveKey(pin, iters);
            const dek = await _unwrapDek(kek, wrapBuf);
            for (const slot of ['main', 'decoy']) {
              const buf = await _idbGet(slot);
              if (!buf) continue;
              try {
                const data = await _decrypt(dek, buf);
                _key = dek;
                _setKdfIters(iters === KDF_TARGET ? KDF_TARGET : iters);
                _setWrapped(true);
                if (iters !== KDF_TARGET && slot === 'main') {
                  try {
                    const kekT = await _deriveKey(pin, KDF_TARGET);
                    await _idbPut('key_wrap', await _wrapDek(kekT, dek));
                    _setKdfIters(KDF_TARGET);
                  } catch (e) { /* keep working iters */ }
                }
                return { slot, data };
              } catch (e) { /* wrong slot */ }
            }
          } catch (e) { /* wrong PIN / iters */ }
        }
        return null;
      }

      // Legacy: PIN derives vault key directly; migrate to wrap on success
      for (const iters of itersToTry) {
        const key = await _deriveKey(pin, iters);
        for (const slot of ['main', 'decoy']) {
          const buf = await _idbGet(slot);
          if (!buf) continue;
          try {
            const data = await _decrypt(key, buf);
            _key = key;
            if (slot === 'main') {
              try {
                if (iters !== KDF_TARGET) {
                  _key = await _deriveKey(pin, KDF_TARGET);
                  await this.save(data);
                  _setKdfIters(KDF_TARGET);
                } else {
                  _setKdfIters(KDF_TARGET);
                }
                await _migrateToWrapped(pin, data);
                await this.save(data);
              } catch (migErr) {
                _key = key;
                _setKdfIters(iters === KDF_TARGET ? KDF_TARGET : iters);
                console.warn('[VaultDB] wrap migrate deferred:', migErr);
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

    /** One-time: re-encrypt passphrase vault with 6-digit PIN unlock + DEK wrap. */
    async migrateToPin(passphrase, pin) {
      const pp = String(passphrase || '');
      const p = String(pin || '');
      if (!/^\d{6}$/.test(p)) throw new Error('PIN must be 6 digits');
      const result = await this.tryPin(pp);
      if (!result || result.slot !== 'main') throw new Error('Old passphrase incorrect');
      // tryPin may already have wrapped; ensure PIN wrap with new PIN
      _setKdfIters(KDF_TARGET);
      try {
        await _migrateToWrapped(p, result.data);
        await this.save(result.data);
      } catch (e) {
        const dek = await _generateDek();
        const kek = await _deriveKey(p, KDF_TARGET);
        await _idbPut('key_wrap', await _wrapDek(kek, dek));
        _key = dek;
        _setWrapped(true);
        await this.save(result.data);
      }
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
      _setWrapped(false);
      if (_db) {
        try { _db.close(); } catch(e) {}
      }
      _db = null;
      _dbId = null;
    },

    activeProfile() { return _profileId(); },
    databaseName() { return _dbName(); },
    isWrappedMode() { return _isWrapped(); },

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

    // Decrypt recovery slot with master key, re-encrypt with new PIN + DEK wrap.
    async recoverAccess(masterKey, newPin) {
      const data = await this.loadRecovery(masterKey);
      if (!data) throw new Error('Recovery slot not found or master key incorrect');
      const dek = await _generateDek();
      const kek = await _deriveKey(newPin, KDF_TARGET);
      await _idbPut('key_wrap', await _wrapDek(kek, dek));
      _key = dek;
      _setKdfIters(KDF_TARGET);
      _setWrapped(true);
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
