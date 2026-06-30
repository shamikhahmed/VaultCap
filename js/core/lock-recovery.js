'use strict';
// ===================== FORGOT PIN (LOCK SCREEN) =====================
window.forgotPINFromLock = async function() {
  const hasRecovery = !!localStorage.getItem(recoveryKeyStorageKey());
  Modal.open('🔑 Account Recovery',
    '<div style="display:flex;flex-direction:column;gap:10px">' +
    '<div style="font-size:13px;color:var(--text2);line-height:1.6;margin-bottom:4px">Choose a recovery option:</div>' +
    (hasRecovery
      ? '<div onclick="Modal.close();setTimeout(window._recoverWithKey,200)" style="display:flex;align-items:center;gap:14px;padding:16px;background:var(--glass);border:1px solid var(--border);border-radius:14px;cursor:pointer;touch-action:manipulation"><div style="font-size:28px">🗝️</div><div><div style="font-weight:700;font-size:15px;margin-bottom:3px">Recover with Master Key</div><div style="font-size:13px;color:var(--text2)">Restores your vault data</div></div></div>'
      : '<div style="display:flex;align-items:center;gap:14px;padding:16px;background:var(--glass);border:1px solid var(--border);border-radius:14px;opacity:.45"><div style="font-size:28px">🗝️</div><div><div style="font-weight:700;font-size:15px;margin-bottom:3px">Recover with Master Key</div><div style="font-size:13px;color:var(--text2)">No master key set up for this vault</div></div></div>') +
    '<div onclick="Modal.close();setTimeout(window._resetVault,200)" style="display:flex;align-items:center;gap:14px;padding:16px;background:rgba(255,64,96,.06);border:1px solid rgba(255,64,96,.25);border-radius:14px;cursor:pointer;touch-action:manipulation"><div style="font-size:28px">⚠️</div><div><div style="font-weight:700;font-size:15px;color:var(--err);margin-bottom:3px">Reset Vault</div><div style="font-size:13px;color:var(--text2)">Permanently deletes all data</div></div></div>' +
    '<div style="display:flex;align-items:flex-start;gap:14px;padding:16px;background:rgba(123,95,255,.08);border:1px solid rgba(123,95,255,.25);border-radius:14px"><div style="font-size:28px">💎</div><div><div style="font-weight:700;font-size:15px;margin-bottom:3px">Premium Recovery Support</div><div style="font-size:13px;color:var(--text2);line-height:1.55">Contact Shamikh with your vault ID. Assisted unlock requires <strong>your Master Key</strong> or encrypted backup — encryption is never bypassed. Fee applies.</div><div style="font-size:12px;color:var(--accent);margin-top:6px">thesolution360.com · support@thesolution360.com</div></div></div>' +
    '</div>',
    '<button type="button" class="btn btn-g btn-full" onclick="Modal.close()">Cancel</button>'
  );
};

window._recoverWithKey = function() {
  Modal.open('🗝️ Master Key Recovery',
    '<div style="font-size:13px;color:var(--text2);margin-bottom:12px;line-height:1.6">Enter your 24-character master key to restore vault access.</div>' +
    '<input class="inp" id="mkInput" placeholder="XXXXXX-XXXXXX-XXXXXX-XXXXXX" style="font-family:var(--mono);letter-spacing:.1em;text-transform:uppercase;text-align:center" autocomplete="off" autocorrect="off" spellcheck="false" oninput="this.value=this.value.toUpperCase().replace(/[^A-Z0-9-]/g,\'\')">' +
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
  // Hash matches — check if recovery slot exists
  const hasSlot = !!(await VaultDB.loadRecovery(input).catch(() => null));
  Modal.close();
  setTimeout(() => {
    Modal.open('🔒 Set New PIN',
      '<div style="font-size:13px;color:var(--text2);margin-bottom:12px;line-height:1.6">Master key verified.' + (hasSlot ? ' Your vault data will be restored.' : ' No recovery snapshot found — vault will be re-initialised.') + '</div>' +
      '<input class="inp" id="newPinA" type="password" inputmode="numeric" maxlength="8" placeholder="New PIN" style="text-align:center;letter-spacing:.2em;font-size:1.4rem;margin-bottom:8px">' +
      '<input class="inp" id="newPinB" type="password" inputmode="numeric" maxlength="8" placeholder="Confirm PIN" style="text-align:center;letter-spacing:.2em;font-size:1.4rem">' +
      '<div id="newPinErr" style="color:var(--err);font-size:12px;margin-top:6px;min-height:16px"></div>',
      '<button type="button" class="btn btn-g" onclick="Modal.close()">Cancel</button>' +
      '<button type="button" class="btn btn-p" onclick="window._applyNewPIN(\'' + input + '\',' + hasSlot + ')">Set PIN →</button>'
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
  Modal.open('⚠️ Reset Vault',
    '<div style="font-size:14px;font-weight:700;color:var(--err);margin-bottom:8px">This permanently deletes ALL vault data.</div>' +
    '<div style="font-size:13px;color:var(--text2);margin-bottom:14px;line-height:1.6">Type <strong>RESET</strong> to confirm. This cannot be undone.</div>' +
    '<input class="inp" id="resetConfirm" placeholder="RESET" autocorrect="off" autocapitalize="characters" style="text-align:center;font-weight:700;letter-spacing:.15em">',
    '<button type="button" class="btn btn-g" onclick="Modal.close()">Cancel</button>' +
    '<button type="button" class="btn btn-d" onclick="window._confirmReset()">Delete Everything</button>'
  );
};

window._confirmReset = async function() {
  const val = (document.getElementById('resetConfirm')?.value || '').trim().toUpperCase();
  if (val !== 'RESET') { Toast.show('Type RESET to confirm', 'warn'); return; }
  try {
    await VaultDB.wipe();
  } catch(e) {}
  localStorage.clear();
  Toast.show('Vault reset. Reloading...', 'info', 2000);
  setTimeout(() => location.reload(), 2000);
};
