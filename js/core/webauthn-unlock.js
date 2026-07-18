'use strict';
/* WebAuthnUnlock — optional biometric / passkey gate (web only, no Capacitor)
 *
 * PRF path (Chrome 118+ etc.): PRF output wraps VaultDB session key in IDB slot
 * `webauthn_wrap` — true passwordless re-unlock until lock or PIN change.
 *
 * Non-PRF path: WebAuthn assertion confirms user presence only; caller must still
 * collect PIN (UX convenience — focus PIN pad after success).
 */

const WebAuthnUnlock = (() => {
  const RP_ID = typeof location !== 'undefined' ? location.hostname : 'localhost';
  const RP_NAME = 'VaultCap';

  function _profileId() {
    try { return localStorage.getItem('vo_active_profile') || 'personal'; } catch (e) { return 'personal'; }
  }

  function _lsKey(base) {
    const p = _profileId();
    return p === 'personal' ? base : base + '_' + p;
  }

  function _credKey() { return _lsKey('vos_webauthn_cred'); }
  function _enabledKey() { return _lsKey('vos_webauthn_enabled'); }
  function _prfSaltKey() { return _lsKey('vos_webauthn_prf_salt'); }

  function _b64Url(buf) {
    const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    let s = '';
    u8.forEach(b => { s += String.fromCharCode(b); });
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function _b64UrlToBytes(b64) {
    const pad = '='.repeat((4 - (b64.length % 4)) % 4);
    const bin = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function _getPrfSalt() {
    let s = localStorage.getItem(_prfSaltKey());
    if (!s) {
      s = _b64Url(crypto.getRandomValues(new Uint8Array(32)));
      localStorage.setItem(_prfSaltKey(), s);
    }
    return _b64UrlToBytes(s);
  }

  async function _idbPut(key, value) {
    if (typeof VaultDB === 'undefined') throw new Error('VaultDB unavailable');
    const name = _profileId() === 'personal' ? 'vaultos' : 'vaultos_' + _profileId();
    const db = await new Promise((resolve, reject) => {
      const req = indexedDB.open(name, 1);
      req.onupgradeneeded = e => { e.target.result.createObjectStore('vault'); };
      req.onsuccess = e => resolve(e.target.result);
      req.onerror = e => reject(e.target.error);
    });
    return new Promise((resolve, reject) => {
      const tx = db.transaction('vault', 'readwrite');
      tx.objectStore('vault').put(value, key);
      tx.oncomplete = () => { try { db.close(); } catch (e) {} resolve(); };
      tx.onerror = e => reject(e.target.error);
    });
  }

  async function _idbGet(key) {
    const name = _profileId() === 'personal' ? 'vaultos' : 'vaultos_' + _profileId();
    const db = await new Promise((resolve, reject) => {
      const req = indexedDB.open(name, 1);
      req.onupgradeneeded = e => { e.target.result.createObjectStore('vault'); };
      req.onsuccess = e => resolve(e.target.result);
      req.onerror = e => reject(e.target.error);
    });
    return new Promise((resolve, reject) => {
      const tx = db.transaction('vault', 'readonly');
      const req = tx.objectStore('vault').get(key);
      req.onsuccess = e => { try { db.close(); } catch (x) {} resolve(e.target.result || null); };
      req.onerror = e => reject(e.target.error);
    });
  }

  async function _idbDel(key) {
    const name = _profileId() === 'personal' ? 'vaultos' : 'vaultos_' + _profileId();
    const db = await new Promise((resolve, reject) => {
      const req = indexedDB.open(name, 1);
      req.onupgradeneeded = e => { e.target.result.createObjectStore('vault'); };
      req.onsuccess = e => resolve(e.target.result);
      req.onerror = e => reject(e.target.error);
    });
    return new Promise((resolve, reject) => {
      const tx = db.transaction('vault', 'readwrite');
      tx.objectStore('vault').delete(key);
      tx.oncomplete = () => { try { db.close(); } catch (x) {} resolve(); };
      tx.onerror = e => reject(e.target.error);
    });
  }

  async function _prfToAesKey(prfOutput) {
    const hash = await crypto.subtle.digest('SHA-256', prfOutput);
    return crypto.subtle.importKey('raw', hash, 'AES-GCM', false, ['encrypt', 'decrypt']);
  }

  async function _wrapSessionKey(prfOutput) {
    if (!VaultDB.sessionKey) throw new Error('Unlock vault with PIN first');
    const raw = await crypto.subtle.exportKey('raw', VaultDB.sessionKey);
    const wrapKey = await _prfToAesKey(prfOutput);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, wrapKey, raw);
    const buf = new Uint8Array(12 + ct.byteLength);
    buf.set(iv, 0);
    buf.set(new Uint8Array(ct), 12);
    await _idbPut('webauthn_wrap', buf);
  }

  async function _unwrapSessionKey(prfOutput) {
    const buf = await _idbGet('webauthn_wrap');
    if (!buf) return false;
    const wrapKey = await _prfToAesKey(prfOutput);
    const raw = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: buf.slice(0, 12) },
      wrapKey,
      buf.slice(12)
    );
    const key = await crypto.subtle.importKey(
      'raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']
    );
    VaultDB.sessionKey = key;
    return true;
  }

  function _prfSupported() {
    return typeof PublicKeyCredential !== 'undefined'
      && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable
      && typeof window !== 'undefined';
  }

  return {
    isSupported() {
      return typeof window !== 'undefined'
        && typeof PublicKeyCredential !== 'undefined'
        && !!window.crypto?.subtle
        && !!indexedDB;
    },

    isEnabled() {
      try {
        return localStorage.getItem(_enabledKey()) === '1'
          && !!localStorage.getItem(_credKey());
      } catch (e) { return false; }
    },

    /** Register platform authenticator while vault is unlocked (PIN verified). */
    async register(pin) {
      if (!this.isSupported()) throw new Error('WebAuthn not supported on this browser');
      if (typeof VaultDB === 'undefined') throw new Error('VaultDB unavailable');
      if (!VaultDB.sessionKey) {
        if (pin) await VaultDB.init(String(pin));
        else throw new Error('Unlock with PIN before enabling biometrics');
      }

      const userId = crypto.getRandomValues(new Uint8Array(16));
      const prfSalt = _getPrfSalt();
      const createOpts = {
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: { name: RP_NAME, id: RP_ID },
          user: {
            id: userId,
            name: 'vaultcap-' + _profileId(),
            displayName: 'VaultCap ' + (_profileId() === 'personal' ? 'Personal' : _profileId()),
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 },
            { type: 'public-key', alg: -257 },
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            residentKey: 'preferred',
            userVerification: 'required',
          },
          extensions: { prf: { eval: { first: prfSalt } } },
          timeout: 60000,
          attestation: 'none',
        },
      };

      const cred = await navigator.credentials.create(createOpts);
      if (!cred || !cred.rawId) throw new Error('Registration cancelled');

      const ext = cred.getClientExtensionResults?.() || {};
      const prfOut = ext.prf?.results?.first;
      if (prfOut) {
        await _wrapSessionKey(prfOut);
        localStorage.setItem(_lsKey('vos_webauthn_prf'), '1');
      } else {
        localStorage.removeItem(_lsKey('vos_webauthn_prf'));
        await _idbDel('webauthn_wrap');
      }

      localStorage.setItem(_credKey(), _b64Url(cred.rawId));
      localStorage.setItem(_enabledKey(), '1');
      return { prf: !!prfOut };
    },

    /**
     * @returns {Promise<{success:boolean, prfUnlock?:boolean}>}
     * prfUnlock=true → VaultDB.sessionKey restored; caller may skip PIN entry.
     */
    async authenticate() {
      if (!this.isEnabled()) return { success: false };
      const credId = localStorage.getItem(_credKey());
      if (!credId) return { success: false };

      const prfSalt = _getPrfSalt();
      const hasPrf = localStorage.getItem(_lsKey('vos_webauthn_prf')) === '1';

      const getOpts = {
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rpId: RP_ID,
          allowCredentials: [{ type: 'public-key', id: _b64UrlToBytes(credId) }],
          userVerification: 'required',
          timeout: 60000,
          extensions: hasPrf ? { prf: { eval: { first: prfSalt } } } : {},
        },
      };

      try {
        const assertion = await navigator.credentials.get(getOpts);
        if (!assertion) return { success: false };

        if (hasPrf) {
          const ext = assertion.getClientExtensionResults?.() || {};
          const prfOut = ext.prf?.results?.first;
          if (prfOut) {
            const ok = await _unwrapSessionKey(prfOut);
            return { success: ok, prfUnlock: ok };
          }
        }
        // Biometric confirmed but no PRF unwrap — caller shows PIN pad
        return { success: true, prfUnlock: false };
      } catch (e) {
        console.warn('[WebAuthnUnlock] authenticate', e);
        return { success: false };
      }
    },

    async disable() {
      localStorage.removeItem(_credKey());
      localStorage.removeItem(_enabledKey());
      localStorage.removeItem(_lsKey('vos_webauthn_prf'));
      await _idbDel('webauthn_wrap');
      if (typeof Toast !== 'undefined') Toast.show('Biometric unlock disabled', 'info');
    },

    async enable() {
      if (!this.isSupported()) {
        if (typeof Toast !== 'undefined') Toast.show('WebAuthn not available here', 'warning');
        return false;
      }
      try {
        const uv = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.();
        if (uv === false) {
          if (typeof Toast !== 'undefined') Toast.show('No platform authenticator found', 'warning');
          return false;
        }
      } catch (e) { /* continue */ }

      if (typeof Modal !== 'undefined') {
        Modal.open('Enable biometric unlock',
          '<p style="font-size:13px;color:var(--text2);line-height:1.6;margin-bottom:12px">Register Face ID / Touch ID / Windows Hello for faster unlock. Your PIN is never stored.</p>'
          + '<p style="font-size:12px;color:var(--text3);line-height:1.5">When PRF is supported, biometrics can restore your vault session key. Otherwise biometrics only confirm identity before PIN entry. Re-register after changing PIN.</p>'
          + '<div class="fg"><label class="fl">Confirm current PIN</label><input class="inp" id="wa-pin" type="password" inputmode="numeric" autocomplete="current-password" maxlength="6" placeholder="6-digit PIN"></div>'
          + '<div class="ferr" id="wa-err"></div>',
          '<button type="button" class="btn btn-g" onclick="Modal.close()">Cancel</button>'
          + '<button type="button" class="btn btn-p" onclick="WebAuthnUnlock._doEnable()">Register</button>');
        setTimeout(() => document.getElementById('wa-pin')?.focus(), 80);
        return true;
      }
      return this.register(null);
    },

    async _doEnable() {
      const pin = document.getElementById('wa-pin')?.value || '';
      const err = document.getElementById('wa-err');
      if (!pin || pin.length < 4) {
        if (err) err.textContent = 'Enter your PIN';
        return;
      }
      try {
        const r = await this.register(pin);
        if (typeof Modal !== 'undefined') Modal.close();
        const msg = r.prf
          ? 'Biometric unlock enabled — fast unlock available'
          : 'Biometric gate enabled — PIN still required after scan';
        if (typeof Toast !== 'undefined') Toast.show(msg, 'success', 4500);
        if (typeof Settings !== 'undefined' && Settings.refresh) Settings.refresh();
      } catch (e) {
        if (err) err.textContent = e.message || 'Registration failed';
      }
    },

    settingsRow() {
      const on = this.isEnabled();
      const sup = this.isSupported();
      const status = !sup ? 'Not supported on this device' : on ? 'Enabled' : 'Off';
      return '<div class="si"><div class="sil"><div class="name">Biometric unlock</div>'
        + '<div class="desc">WebAuthn / Face ID / Touch ID — ' + status + '</div></div>'
        + (on
          ? '<button type="button" class="btn btn-d btn-sm" onclick="WebAuthnUnlock.disable()">Disable</button>'
          : '<button type="button" class="btn btn-g btn-sm"' + (sup ? '' : ' disabled') + ' onclick="WebAuthnUnlock.enable()">Enable</button>')
        + '</div>';
    },

    /** Call after PIN change — wrapped key is invalid. */
    async onPinChanged() {
      if (this.isEnabled()) {
        await _idbDel('webauthn_wrap');
        localStorage.removeItem(_lsKey('vos_webauthn_prf'));
        if (typeof Toast !== 'undefined') {
          Toast.show('Re-register biometrics after PIN change', 'warning', 5000);
        }
      }
    },
  };
})();

window.WebAuthnUnlock = WebAuthnUnlock;
