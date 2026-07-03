'use strict';

const PinHash = {
  async digest(pin) {
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest('SHA-256', enc.encode('vaultcap-pin-v1:' + String(pin)));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  },

  timingSafeEqual(a, b) {
    const x = String(a);
    const y = String(b);
    if (x.length !== y.length) return false;
    let out = 0;
    for (let i = 0; i < x.length; i++) out |= x.charCodeAt(i) ^ y.charCodeAt(i);
    return out === 0;
  },

  async verifyLegacy(pin, oldData) {
    if (!oldData || oldData.noPin) return true;
    const entered = String(pin);
    if (oldData.pinHash) {
      const h = await this.digest(entered);
      return this.timingSafeEqual(h, oldData.pinHash);
    }
    if (oldData.pin != null && oldData.pin !== '') {
      return this.timingSafeEqual(entered, String(oldData.pin));
    }
    return false;
  },
};

window.PinHash = PinHash;
