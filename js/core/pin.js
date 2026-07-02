'use strict';
// ===================== PIN / LOCK SYSTEM =====================
let pe = ''; let lt = null;
const PIN = {
  reset() {
    pe = '';
    [0,1,2,3,4,5].forEach(i => { const d = document.getElementById('pd' + i); if (d) d.className = 'pd'; });
    document.getElementById('pmsg').className = 'pin-msg';
    document.getElementById('pmsg').textContent = '';
    document.getElementById('lkBar').style.display = 'none';
  },
  in(n) {
    if (pe.length >= 6) return;
    if (Date.now() < S.lockedUntil) { this.showLo(); return; }
    if (S.noPin) { R.unlock(); return; }
    pe += n; this.dots();
    if (navigator.vibrate) navigator.vibrate(6);
    if (pe.length === 6) {
      const fpl = document.getElementById('forgotPinLink');
      if (fpl) fpl.style.display = 'none';
      setTimeout(() => this.verify(), 130);
    }
  },
  del() {
    pe = pe.slice(0, -1);
    const msg = document.getElementById('pmsg');
    if (msg) msg.className = 'pin-msg';
    this.dots();
  },
  dots() {
    [0,1,2,3,4,5].forEach(i => {
      const d = document.getElementById('pd' + i);
      if (d) d.className = 'pd' + (i < pe.length ? ' on' : '');
    });
    const msg = document.getElementById('pmsg');
    if (msg && !msg.classList.contains('err')) {
      if (pe.length > 0) {
        msg.textContent = pe.length + ' of 6';
      } else if (VaultProfiles.isDemo()) {
        msg.textContent = 'Demo PIN: 123456';
      } else {
        msg.textContent = '';
      }
    }
  },
  verify() {
    if (Date.now() < S.lockedUntil) { this.showLo(); pe = ''; this.dots(); return; }
    const entered = pe;
    pe = '';
    this.dots();
    // Show pending state
    [0,1,2,3,4,5].forEach(i => { const d = document.getElementById('pd' + i); if (d) d.classList.add('on'); });
    const msg = document.getElementById('pmsg');
    if (msg) { msg.className = 'pin-msg'; msg.textContent = 'Verifying…'; }

    this._verify(entered).then(result => {
      const kind = (result && typeof result === 'object') ? result.kind : result;
      if (kind === 'real') {
        S.fails = 0; S.lockedUntil = 0;
        try { sessionStorage.removeItem('vos_fails'); localStorage.removeItem('vos_fails'); localStorage.removeItem('vo_pin'); } catch(e) {}
        Store.save();
        setTimeout(() => R.unlock(), 180);
      } else if (kind === 'decoy') {
        applyDecoyUnlock(result && result.data);
      } else {
        // Wrong PIN — brute force protection
        S.fails++;

        [0,1,2,3,4,5].forEach(i => { const d = document.getElementById('pd' + i); if (d) d.className = 'pd err'; });
        if (msg) msg.className = 'pin-msg err';

        if (S.fails >= 10) {
          msg.textContent = 'Too many attempts';
          this.showWipeGate();
          return;
        } else if (S.fails >= 5) {
          const w = 300; // 5 min
          S.lockedUntil = Date.now() + w * 1000;
          if (msg) msg.textContent = `Too many attempts — locked ${w}s`;
          this.countdown(w);
        } else if (S.fails >= 3) {
          const w = 30;
          S.lockedUntil = Date.now() + w * 1000;
          if (msg) msg.textContent = `Too many attempts — locked ${w}s`;
          this.countdown(w);
        } else {
          if (VaultProfiles.isDemo()) {
            if (msg) msg.textContent = 'Wrong PIN — demo uses 123456 (6 digits)';
          } else {
            if (msg) msg.textContent = `Wrong PIN — ${3 - Math.min(S.fails, 2)} attempts left`;
          }
        }
        // Persist AFTER lockedUntil is set so reload restores the full lockout state
        if (VaultDB.sessionKey) { Store.save(); }
        else { try { sessionStorage.setItem('vos_fails', JSON.stringify({ fails: S.fails, lockedUntil: S.lockedUntil })); localStorage.removeItem('vos_fails'); } catch(e) {} }
        Activity.log('Failed PIN #' + S.fails);
        if (S.fails >= 3) {
          const fpl = document.getElementById('forgotPinLink');
          if (fpl) fpl.style.display = 'inline';
        }
        setTimeout(() => {
          [0,1,2,3,4,5].forEach(i => { const d = document.getElementById('pd' + i); if (d) d.className = 'pd'; });
          this.dots();
        }, 580);
      }
    }).catch(() => {
      // Unexpected error
      [0,1,2,3,4,5].forEach(i => { const d = document.getElementById('pd' + i); if (d) d.className = 'pd'; });
      if (msg) { msg.className = 'pin-msg err'; msg.textContent = 'Error — try again'; }
      this.dots();
    });
  },

  showWipeGate() {
    if (PIN._wipeTimer) clearInterval(PIN._wipeTimer);
    let left = 60;
    Modal.open('Vault Protection',
      `<p style="font-size:13px;color:var(--text2);line-height:1.6;margin-bottom:12px">10 failed PIN attempts. Recover with your <strong>master key</strong> or the vault will be permanently wiped.</p>
       <p style="font-size:12px;color:var(--warn);text-align:center">Auto-wipe in <strong id="wipe-cd">${left}</strong>s</p>`,
      `<button type="button" class="btn btn-p" onclick="PIN.cancelWipe();Modal.close();Settings.useMasterKey()">Use Master Key</button>
       <button type="button" class="btn btn-d btn-sm" onclick="PIN._executeWipe()">Wipe Now</button>`
    );
    PIN._wipeTimer = setInterval(() => {
      left--;
      const el = document.getElementById('wipe-cd');
      if (el) el.textContent = String(left);
      if (left <= 0) PIN._executeWipe();
    }, 1000);
  },
  cancelWipe() {
    if (PIN._wipeTimer) { clearInterval(PIN._wipeTimer); PIN._wipeTimer = null; }
  },
  _executeWipe() {
    PIN.cancelWipe();
    Modal.close();
    Store.clear().then(() => location.reload());
  },

  // Async PIN verification: migration path + VaultDB path
  async _verify(pin) {
    if (S.noPin) return { kind: 'real' };

    // ── Demo vault: fixed PIN + auto-repair stale encrypted store ───────────
    if (VaultProfiles.isDemo()) {
      if (String(pin) !== VaultProfiles.DEMO_PIN) return null;
      const result = await unlockDemoVaultWithPin(pin);
      if (!result) return null;
      Object.assign(S, result.data);
      S.pin = VaultProfiles.DEMO_PIN;
      return { kind: 'real' };
    }

    // ── Migration path: old localStorage data ──────────────────────────────
    const oldData = Store.loadRaw();
    const hasVaultDB = await VaultDB.isInitialized();

    if (oldData && !hasVaultDB) {
      if (oldData.noPin || pin === String(oldData.pin)) {
        Object.assign(S, oldData);
        try {
          await VaultDB.init(pin || '000000');
          await VaultDB.save(Store._data());
          localStorage.removeItem('vos3');
          Store._savePrefs();
        } catch(e) { console.warn('[VaultDB] migration error:', e); }
        return { kind: 'real' };
      }
      if (oldData.decoyPin && pin === String(oldData.decoyPin)) {
        return { kind: 'decoy', data: null };
      }
      return null;
    }

    // ── VaultDB path: try main then decoy slot ─────────────────────────────
    const result = await VaultDB.tryPin(pin);
    if (!result) return null;
    if (result.slot === 'decoy') return { kind: 'decoy', data: result.data };
    Object.assign(S, result.data);
    return { kind: 'real' };
  },
  countdown(s) {
    let r = s;
    const bar  = document.getElementById('lkBar');
    const fill = document.getElementById('lkFill');
    bar.style.display = 'block'; fill.style.width = '100%'; clearInterval(lt);
    lt = setInterval(() => {
      r--; fill.style.width = (r / s * 100) + '%';
      document.getElementById('pmsg').textContent = `Locked — ${r}s`;
      if (r <= 0) { clearInterval(lt); bar.style.display = 'none'; S.lockedUntil = 0; Store.save(); this.reset(); }
    }, 1000);
  },
  showLo() {
    const r = Math.ceil((S.lockedUntil - Date.now()) / 1000);
    document.getElementById('pmsg').textContent = `Locked — ${r}s`;
    document.getElementById('pmsg').className = 'pin-msg err';
  }
};
