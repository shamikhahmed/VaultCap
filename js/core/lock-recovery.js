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
    '<div class="vc-ix-20">' +
    '<div style="font-weight:700;font-size:15px;margin-bottom:4px">Capricorn Systems support</div>' +
    '<div style="font-size:13px;color:var(--text2);line-height:1.55">' +
    '<strong>We cannot open your vault.</strong> PIN, master key, and data stay on your device (AES-256-GCM). ' +
    'Support only helps you use recovery on <em>your</em> device — we never receive keys unless you paste them yourself (please don’t).' +
    '</div></div></div>' +
    '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:12px">' +
    '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text3);margin-bottom:6px">Your Vault ID</div>' +
    '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">' +
    '<code style="font-family:var(--mono);font-size:15px;font-weight:700;letter-spacing:.08em;color:var(--text)">' + vid + '</code>' +
    '<button type="button" class="btn btn-g btn-sm" data-act="copyVaultId()">Copy</button>' +
    '</div>' +
    '<div style="font-size:12px;color:var(--text3);margin-top:8px;line-height:1.45">' +
    'Find this anytime in Settings → About. Use it when you contact support so we can track your ticket. ' +
    'It is <strong>not</strong> a password and cannot unlock data.' +
    '</div></div>' +
    '<div class="vc-ix-172">' +
    'Contact: <a href="mailto:support@capricornsystems.com?subject=VaultCap%20' + encodeURIComponent(vid) + '" style="color:var(--text);font-weight:600">support@capricornsystems.com</a>' +
    ' · include Vault ID + what you tried (master key / .vos backup).' +
    '</div></div>'
  );
}

window.forgotPINFromLock = async function() {
  const hasRecovery = !!localStorage.getItem(recoveryKeyStorageKey());
  Modal.open('Account Recovery',
    '<div class="vc-ix-31">' +
    '<div style="font-size:13px;color:var(--text2);line-height:1.6;margin-bottom:4px">' +
    'Only you can unlock this vault. Pick an option you control:' +
    '</div>' +
    (hasRecovery
      ? '<div class="vc-ix-174" data-act="Modal.close();setTimeout(window._recoverWithKey,200)">' + _lrIcon('key', 28) + '<div><div class="vc-ix-98">Recover with Master Key</div><div class="vc-ix-10">Key shown once at setup — restores access on this device</div></div></div>'
      : '<div style="display:flex;align-items:center;gap:14px;padding:16px;background:var(--glass);border:1px solid var(--border);border-radius:14px;opacity:.45">' + _lrIcon('key', 28) + '<div><div class="vc-ix-98">Recover with Master Key</div><div class="vc-ix-10">No master key set up for this vault</div></div></div>') +
    '<div class="vc-ix-174" data-act="Modal.close();document.getElementById(\'importF-global\')?.click()">' + _lrIcon('download', 28) + '<div><div class="vc-ix-98">Restore from backup</div><div class="vc-ix-10">Import your .vos file — still encrypted until you unlock</div></div></div>' +
    '<div data-act="Modal.close();setTimeout(window._resetVault,200)" style="display:flex;align-items:center;gap:14px;padding:16px;background:rgba(255,64,96,.06);border:1px solid rgba(255,64,96,.25);border-radius:14px;cursor:pointer;touch-action:manipulation">' + _lrIcon('cross', 28) + '<div><div style="font-weight:700;font-size:15px;color:var(--err);margin-bottom:3px">Reset Vault</div><div class="vc-ix-10">Permanently deletes all data on this device</div></div></div>' +
    _supportBlockHtml() +
    '</div>',
    '<button type="button" class="btn btn-g btn-full" data-act="Modal.close()">Cancel</button>'
  );
};

window._recoverWithKey = function() {
  Modal.open('Master Key Recovery',
    '<div class="vc-ix-69">Enter your 24-character master key to restore vault access. Capricorn Systems never has this key.</div>' +
    '<input class="inp" id="mkInput" placeholder="XXXXXX-XXXXXX-XXXXXX-XXXXXX" style="font-family:var(--mono);letter-spacing:.1em;text-transform:uppercase;text-align:center;font-size:16px" autocomplete="off" autocorrect="off" spellcheck="false" data-act-input="ActHelpers.upperAlnumDash(this)">' +
    '<div class="vc-ix-175" id="mkErr"></div>',
    '<button type="button" class="btn btn-g" data-act="Modal.close()">Cancel</button>' +
    '<button type="button" class="btn btn-p" data-act="window._verifyMasterKey()">Verify →</button>'
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
  setTimeout(() => {
    Modal.open('Set New PIN',
      '<div class="vc-ix-69">Master key verified.' + (hasSlot ? ' Your vault data will be restored.' : ' No recovery snapshot found — vault will be re-initialised.') + '</div>' +
      '<input class="inp" id="newPinA" type="password" inputmode="numeric" maxlength="8" placeholder="New PIN" style="text-align:center;letter-spacing:.2em;font-size:1.4rem;margin-bottom:8px">' +
      '<input class="inp" id="newPinB" type="password" inputmode="numeric" maxlength="8" placeholder="Confirm PIN" style="text-align:center;letter-spacing:.2em;font-size:1.4rem">' +
      '<div class="vc-ix-175" id="newPinErr"></div>',
      '<button type="button" class="btn btn-g" data-act="Modal.close()">Cancel</button>' +
      '<button type="button" class="btn btn-p" data-act="window._applyNewPIN(\'' + input + '\',' + hasSlot + ')">Set PIN →</button>'
    );
  }, 300);
};

window._applyNewPIN = async function(masterKey, hasSlot) {
  const a = document.getElementById('newPinA')?.value || '';
  const b = document.getElementById('newPinB')?.value || '';
  const err = document.getElementById('newPinErr');
  const setErr = msg => { if(err){err.textContent=msg;} };
  if (!/^\d{6}$/.test(a)) { setErr('PIN must be exactly 6 digits.'); return; }
  if (a !== b) { setErr('PINs do not match.'); return; }
  try {
    if (hasSlot && masterKey) {
      await VaultDB.recoverAccess(masterKey, a);
    } else {
      await VaultDB.init(a);
      Store.save();
    }
    Modal.close();
    Toast.show('PIN updated — please log in with your new PIN', 'success', 5000);
  } catch(e) {
    setErr('Could not update PIN. Try resetting the vault.');
  }
};

window._resetVault = function() {
  Modal.open('Reset Vault',
    '<div style="font-size:14px;font-weight:700;color:var(--err);margin-bottom:8px">This permanently deletes ALL vault data.</div>' +
    '<div class="vc-ix-168">Type <strong>RESET</strong> to confirm. This cannot be undone.</div>' +
    '<input class="inp" id="resetConfirm" placeholder="RESET" autocorrect="off" autocapitalize="characters" style="text-align:center;font-weight:700;letter-spacing:.15em;font-size:16px">',
    '<button type="button" class="btn btn-g" data-act="Modal.close()">Cancel</button>' +
    '<button type="button" class="btn btn-d" data-act="window._confirmReset()">Delete Everything</button>'
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
