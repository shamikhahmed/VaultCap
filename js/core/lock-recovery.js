'use strict';
// ===================== FORGOT PIN (LOCK SCREEN) =====================
const _lrIcon = (key, size) => typeof VC !== 'undefined' ? `<span class="chip-ic">${VC.icon(key, size)}</span>` : '';

/** Public vault ID for support tickets only — not a secret, cannot unlock vault. */
function getVaultId() {
  let id = localStorage.getItem('vo_vault_id');
  if (id && /^VC-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(id)) return id;
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part = () => Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map(b => chars[b % chars.length]).join('');
  id = 'VC-' + part() + '-' + part();
  localStorage.setItem('vo_vault_id', id);
  return id;
}
window.getVaultId = getVaultId;

function copyVaultId() {
  const id = getVaultId();
  const done = () => {
    if (typeof Toast !== 'undefined') Toast.show('Vault ID copied', 'success', 1500);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(id).then(done).catch(() => {
      window.prompt('Copy Vault ID:', id);
    });
  } else {
    window.prompt('Copy Vault ID:', id);
  }
}
window.copyVaultId = copyVaultId;

function _supportBlockHtml() {
  const vid = getVaultId();
  return (
    '<div style="display:flex;flex-direction:column;gap:10px;padding:16px;background:var(--glass);border:1px solid var(--border);border-radius:14px">' +
    '<div style="display:flex;align-items:flex-start;gap:12px">' +
    _lrIcon('shield', 24) +
    '<div style="flex:1;min-width:0">' +
    '<div style="font-weight:700;font-size:15px;margin-bottom:4px">Capricorn Systems support</div>' +
    '<div style="font-size:13px;color:var(--text2);line-height:1.55">' +
    '<strong>We cannot open your vault.</strong> PIN, master key, and data stay on your device (AES-256-GCM). ' +
    'Support only helps you use recovery on <em>your</em> device — we never receive keys unless you paste them yourself (please don’t).' +
    '</div></div></div>' +
    '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:12px">' +
    '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text3);margin-bottom:6px">Your Vault ID</div>' +
    '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">' +
    '<code style="font-family:var(--mono);font-size:15px;font-weight:700;letter-spacing:.08em;color:var(--text)">' + vid + '</code>' +
    '<button type="button" class="btn btn-g btn-sm" onclick="copyVaultId()">Copy</button>' +
    '</div>' +
    '<div style="font-size:12px;color:var(--text3);margin-top:8px;line-height:1.45">' +
    'Find this anytime in Settings → About. Use it when you contact support so we can track your ticket. ' +
    'It is <strong>not</strong> a password and cannot unlock data.' +
    '</div></div>' +
    '<div style="font-size:12px;color:var(--text2);line-height:1.5">' +
    'Contact: <a href="mailto:support@capricornsystems.com?subject=VaultCap%20' + encodeURIComponent(vid) + '" style="color:var(--text);font-weight:600">support@capricornsystems.com</a>' +
    ' · include Vault ID + what you tried (master key / .vos backup).' +
    '</div></div>'
  );
}

window.forgotPINFromLock = async function() {
  const hasRecovery = !!localStorage.getItem(recoveryKeyStorageKey());
  Modal.open('Account Recovery',
    '<div style="display:flex;flex-direction:column;gap:10px">' +
    '<div style="font-size:13px;color:var(--text2);line-height:1.6;margin-bottom:4px">' +
    'Only you can unlock this vault. Pick an option you control:' +
    '</div>' +
    (hasRecovery
      ? '<div onclick="Modal.close();setTimeout(window._recoverWithKey,200)" style="display:flex;align-items:center;gap:14px;padding:16px;background:var(--glass);border:1px solid var(--border);border-radius:14px;cursor:pointer;touch-action:manipulation">' + _lrIcon('key', 28) + '<div><div style="font-weight:700;font-size:15px;margin-bottom:3px">Recover with Master Key</div><div style="font-size:13px;color:var(--text2)">Key shown once at setup — restores access on this device</div></div></div>'
      : '<div style="display:flex;align-items:center;gap:14px;padding:16px;background:var(--glass);border:1px solid var(--border);border-radius:14px;opacity:.45">' + _lrIcon('key', 28) + '<div><div style="font-weight:700;font-size:15px;margin-bottom:3px">Recover with Master Key</div><div style="font-size:13px;color:var(--text2)">No master key set up for this vault</div></div></div>') +
    '<div onclick="Modal.close();document.getElementById(\'importF-global\')?.click()" style="display:flex;align-items:center;gap:14px;padding:16px;background:var(--glass);border:1px solid var(--border);border-radius:14px;cursor:pointer;touch-action:manipulation">' + _lrIcon('download', 28) + '<div><div style="font-weight:700;font-size:15px;margin-bottom:3px">Restore from backup</div><div style="font-size:13px;color:var(--text2)">Import your .vos file — still encrypted until you unlock</div></div></div>' +
    '<div onclick="Modal.close();setTimeout(window._resetVault,200)" style="display:flex;align-items:center;gap:14px;padding:16px;background:rgba(255,64,96,.06);border:1px solid rgba(255,64,96,.25);border-radius:14px;cursor:pointer;touch-action:manipulation">' + _lrIcon('cross', 28) + '<div><div style="font-weight:700;font-size:15px;color:var(--err);margin-bottom:3px">Reset Vault</div><div style="font-size:13px;color:var(--text2)">Permanently deletes all data on this device</div></div></div>' +
    _supportBlockHtml() +
    '</div>',
    '<button type="button" class="btn btn-g btn-full" onclick="Modal.close()">Cancel</button>'
  );
};

window._recoverWithKey = function() {
  Modal.open('Master Key Recovery',
    '<div style="font-size:13px;color:var(--text2);margin-bottom:12px;line-height:1.6">Enter your 24-character master key to restore vault access. Capricorn Systems never has this key.</div>' +
    '<input class="inp" id="mkInput" placeholder="XXXXXX-XXXXXX-XXXXXX-XXXXXX" style="font-family:var(--mono);letter-spacing:.1em;text-transform:uppercase;text-align:center;font-size:16px" autocomplete="off" autocorrect="off" spellcheck="false" oninput="this.value=this.value.toUpperCase().replace(/[^A-Z0-9-]/g,\'\')">' +
    '<div id="mkErr" style="color:var(--err);font-size:12px;margin-top:6px;min-height:16px"></div>',
    '<button type="button" class="btn btn-g" onclick="Modal.close()">Cancel</button>' +
    '<button type="button" class="btn btn-p" onclick="window._verifyMasterKey()">Verify →</button>'
  );
};

window._verifyMasterKey = async function() {
  const input = (document.getElementById('mkInput')?.value || document.getElementById('mk-in')?.value || '').replace(/[\s-]/g,'').toUpperCase();
  const errEl = document.getElementById('mkErr') || document.getElementById('mk-err');
  const setErr = msg => { if(errEl){ errEl.textContent=msg; } };
  if (input.length < 8) { setErr('Please enter your master key.'); return; }
  const stored = localStorage.getItem(recoveryKeyStorageKey());
  if (!stored) { setErr('No master key found for this vault.'); return; }
  const h = await hashString(input);
  if (h !== stored) { setErr('Incorrect master key — please check and try again.'); return; }
  const hasSlot = !!(await VaultDB.loadRecovery(input).catch(() => null));
  Modal.close();
  setTimeout(() => RecoveryPinUI.open(input, hasSlot), 300);
};

const RecoveryPinUI = {
  _masterKey: '',
  _hasSlot: false,
  _step: 'enter',
  _pinA: '',
  _pinB: '',

  open(masterKey, hasSlot) {
    this._masterKey = masterKey;
    this._hasSlot = !!hasSlot;
    this._step = 'enter';
    this._pinA = '';
    this._pinB = '';
    this._render();
  },

  _keypadHtml() {
    const k = (d, label, sub) =>
      `<button type="button" class="key recovery-key" onclick="RecoveryPinUI.key('${d}')" aria-label="${label}">${label}${sub ? `<span class="key-sub">${sub}</span>` : ''}</button>`;
    return (
      '<div class="keypad recovery-keypad">' +
      k('1', '1') + k('2', '2', 'ABC') + k('3', '3', 'DEF') +
      k('4', '4', 'GHI') + k('5', '5', 'JKL') + k('6', '6', 'MNO') +
      k('7', '7', 'PQRS') + k('8', '8', 'TUV') + k('9', '9', 'WXYZ') +
      '<button type="button" class="key act recovery-key" aria-hidden="true" tabindex="-1"></button>' +
      k('0', '0') +
      '<button type="button" class="key act recovery-key" onclick="RecoveryPinUI.del()" aria-label="Delete">⌫</button>' +
      '</div>'
    );
  },

  _render() {
    const isConfirm = this._step === 'confirm';
    const len = isConfirm ? this._pinB.length : this._pinA.length;
    const dots = [0, 1, 2, 3, 4, 5].map(i =>
      `<div class="pd${i < len ? ' on' : ''}"></div>`
    ).join('');
    const slotMsg = this._hasSlot ? 'Your vault data will be restored.' : 'No recovery snapshot — vault will be re-initialised.';
    Modal.open('Set New PIN',
      '<div style="font-size:13px;color:var(--text2);margin-bottom:14px;line-height:1.6;text-align:center">' +
      'Master key verified. ' + slotMsg + '</div>' +
      '<div class="recovery-pin-wrap">' +
      '<div class="pin-dots recovery-pdots">' + dots + '</div>' +
      '<div class="pin-msg recovery-pmsg">' + (isConfirm ? 'Confirm your new PIN' : 'Choose a 6-digit PIN') + '</div>' +
      '<div id="recoveryPinErr" style="color:var(--err);font-size:12px;text-align:center;min-height:18px;margin:6px 0 10px"></div>' +
      this._keypadHtml() +
      '</div>',
      '<button type="button" class="btn btn-g" onclick="Modal.close()">Cancel</button>' +
      '<button type="button" class="btn btn-p" onclick="RecoveryPinUI.submit()" id="recoveryPinSaveBtn">Save PIN</button>'
    );
  },

  _updateDots() {
    const isConfirm = this._step === 'confirm';
    const len = isConfirm ? this._pinB.length : this._pinA.length;
    const wrap = document.querySelector('.recovery-pdots');
    if (!wrap) return;
    wrap.querySelectorAll('.pd').forEach((d, i) => {
      d.className = 'pd' + (i < len ? ' on' : '');
    });
    const msg = document.querySelector('.recovery-pmsg');
    if (msg && !msg.classList.contains('err')) {
      msg.textContent = len > 0 ? (len + ' of 6') : (isConfirm ? 'Confirm your new PIN' : 'Choose a 6-digit PIN');
    }
  },

  key(n) {
    if (this._step === 'enter') {
      if (this._pinA.length >= 6) return;
      this._pinA += n;
    } else {
      if (this._pinB.length >= 6) return;
      this._pinB += n;
    }
    if (navigator.vibrate) navigator.vibrate(6);
    this._updateDots();
    const len = this._step === 'enter' ? this._pinA.length : this._pinB.length;
    if (len === 6) {
      setTimeout(() => {
        if (this._step === 'enter') {
          this._step = 'confirm';
          this._pinB = '';
          this._render();
        } else {
          this.submit();
        }
      }, 180);
    }
  },

  del() {
    if (this._step === 'enter') {
      this._pinA = this._pinA.slice(0, -1);
    } else {
      this._pinB = this._pinB.slice(0, -1);
    }
    const err = document.getElementById('recoveryPinErr');
    if (err) err.textContent = '';
    const msg = document.querySelector('.recovery-pmsg');
    if (msg) msg.className = 'pin-msg recovery-pmsg';
    this._updateDots();
  },

  submit() {
    const err = document.getElementById('recoveryPinErr');
    const setErr = msg => { if (err) err.textContent = msg; };
    const msg = document.querySelector('.recovery-pmsg');
    if (this._step === 'enter') {
      if (!/^\d{6}$/.test(this._pinA)) { setErr('PIN must be exactly 6 digits.'); return; }
      this._step = 'confirm';
      this._pinB = '';
      this._render();
      return;
    }
    if (!/^\d{6}$/.test(this._pinB)) { setErr('Confirm your 6-digit PIN.'); return; }
    if (this._pinA !== this._pinB) {
      setErr('PINs do not match — try again.');
      if (msg) { msg.className = 'pin-msg recovery-pmsg err'; msg.textContent = 'PINs did not match'; }
      this._step = 'enter';
      this._pinA = '';
      this._pinB = '';
      setTimeout(() => this._render(), 600);
      return;
    }
    window._applyNewPIN(this._masterKey, this._hasSlot, this._pinA);
  },
};
window.RecoveryPinUI = RecoveryPinUI;

window._applyNewPIN = async function(masterKey, hasSlot, pin) {
  const a = pin || document.getElementById('newPinA')?.value || '';
  const b = pin || document.getElementById('newPinB')?.value || '';
  const err = document.getElementById('recoveryPinErr') || document.getElementById('newPinErr');
  const setErr = msg => { if(err){err.textContent=msg;} };
  if (!/^\d{6}$/.test(a)) { setErr('PIN must be exactly 6 digits.'); return; }
  if (pin ? false : a !== b) { setErr('PINs do not match.'); return; }
  try {
    if (hasSlot && masterKey) {
      await VaultDB.recoverAccess(masterKey, a);
    } else {
      await VaultDB.init(a);
      Store.save();
    }
    Modal.close();
    PIN.reset();
    Toast.show('PIN updated — log in with your new PIN', 'success', 5000);
  } catch(e) {
    setErr('Could not update PIN. Try restoring from backup or reset vault.');
  }
};

window._resetVault = function() {
  Modal.open('Reset Vault',
    '<div style="font-size:14px;font-weight:700;color:var(--err);margin-bottom:8px">This permanently deletes ALL vault data.</div>' +
    '<div style="font-size:13px;color:var(--text2);margin-bottom:14px;line-height:1.6">Type <strong>RESET</strong> to confirm. This cannot be undone.</div>' +
    '<input class="inp" id="resetConfirm" placeholder="RESET" autocorrect="off" autocapitalize="characters" style="text-align:center;font-weight:700;letter-spacing:.15em;font-size:16px">',
    '<button type="button" class="btn btn-g" onclick="Modal.close()">Cancel</button>' +
    '<button type="button" class="btn btn-d" onclick="window._confirmReset()">Delete Everything</button>'
  );
};

window._confirmReset = async function() {
  const val = (document.getElementById('resetConfirm')?.value || '').trim().toUpperCase();
  if (val !== 'RESET') { Toast.show('Type RESET to confirm', 'warn'); return; }
  const keepId = localStorage.getItem('vo_vault_id');
  try {
    await VaultDB.wipe();
  } catch(e) {}
  localStorage.clear();
  if (keepId) localStorage.setItem('vo_vault_id', keepId);
  Toast.show('Vault reset. Reloading...', 'info', 2000);
  setTimeout(() => location.reload(), 2000);
};
