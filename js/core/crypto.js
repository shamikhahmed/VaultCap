// VaultCap — AES-256-GCM + PBKDF2 (extracted from app.js)
// Portable format: salt(16) + iv(12) + ciphertext  → base64 (chunked, no spread)

const Crypto = {
  PBKDF2_ITERS: 600000, // OWASP 2023 recommendation for PBKDF2-SHA256

  _bytesToB64(bytes) {
    const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    let bin = '';
    const chunk = 0x8000;
    for (let i = 0; i < u8.length; i += chunk) {
      bin += String.fromCharCode.apply(null, u8.subarray(i, i + chunk));
    }
    return btoa(bin);
  },

  _b64ToBytes(b64) {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  },

  async deriveKey(password, salt, iterations) {
    const enc = new TextEncoder();
    const iters = iterations || this.PBKDF2_ITERS;
    const keyMaterial = await crypto.subtle.importKey(
      'raw', enc.encode(String(password)), 'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: iters, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false, ['encrypt', 'decrypt']
    );
  },

  async encrypt(data, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this.deriveKey(password, salt);
    const enc = new TextEncoder();
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(data));
    const buf = new Uint8Array(16 + 12 + ciphertext.byteLength);
    buf.set(salt, 0);
    buf.set(iv, 16);
    buf.set(new Uint8Array(ciphertext), 28);
    return this._bytesToB64(buf);
  },

  async decrypt(b64, password) {
    const buf = this._b64ToBytes(b64);
    const salt = buf.slice(0, 16);
    const iv = buf.slice(16, 28);
    const ct = buf.slice(28);
    // Try current iters, then legacy 310k (pre-5.1 portable backups)
    const attempts = [this.PBKDF2_ITERS, 310000];
    let lastErr;
    for (const iters of attempts) {
      try {
        const key = await this.deriveKey(password, salt, iters);
        const dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
        return new TextDecoder().decode(dec);
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error('decrypt failed');
  },

  available() { return !!window.crypto?.subtle; },
};

window.Crypto = Crypto;
