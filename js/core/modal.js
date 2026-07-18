'use strict';
/* Toast, Modal — UI dialog layer */

const Toast = {
  /**
   * @param {string} msg
   * @param {string} [type]
   * @param {number} [dur]
   * @param {boolean|object} [opts] - true/{html:true} = trusted HTML (caller must escape user data)
   */
  show(msg, type = 'info', dur = 3200, opts) {
    const w = document.getElementById('toastWrap');
    if (!w) return;
    const t = document.createElement('div');
    if (type === 'warn') type = 'warning';
    const icons = { success:'target', error:'cross', warning:'bell', info:'search' };
    const cls   = { success:'ok', error:'err', warning:'wrn', info:'inf' };
    t.className = `toast ${cls[type] || 'inf'}`;
    const ic = (typeof VC !== 'undefined' ? VC.icon(icons[type] || 'search', 16) : '');
    const allowHtml = opts === true || (opts && opts.html === true);
    const body = allowHtml
      ? String(msg ?? '')
      : (typeof escHtml === 'function' ? escHtml(msg) : String(msg ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
    t.innerHTML = `<span class="chip-ic">${ic}</span><span style="flex:1;line-height:1.4;display:flex;align-items:center;gap:6px;flex-wrap:wrap">${body}</span><button type="button" aria-label="Dismiss" onclick="this.closest('.toast').remove()" style="background:none;border:none;cursor:pointer;color:var(--text2);font-size:15px;flex-shrink:0;min-width:44px;min-height:44px">×</button>`;
    w.appendChild(t);
    setTimeout(() => { t.style.animation = 'slideIn .25s reverse'; setTimeout(() => t.remove(), 240); }, dur);
  }
};

// ===================== MODAL =====================
const Modal = {
  /** Opens modal with title, body HTML, and optional footer HTML. */
  open(title, body, foot = '') {
    document.getElementById('mTitle').textContent = title;
    document.getElementById('mBody').innerHTML = body;
    document.getElementById('mFoot').innerHTML = foot;
    const modal = document.getElementById('modal');
    modal.style.transform = '';
    modal.style.transition = '';
    document.getElementById('overlay').classList.add('on');
    this._initSwipe();
    if (typeof FocusTrap !== 'undefined') FocusTrap.trap(modal);
    // Wire amount formatting to numeric inputs in modal
    setTimeout(() => {
      document.querySelectorAll('.mb input[type=number], .mb input[inputmode=numeric]').forEach(el => {
        if (el._amtFmt) return;
        el._amtFmt = true;
        el.addEventListener('blur', () => {
          const raw = el.value.replace(/,/g, '');
          if (!isNaN(raw) && raw !== '' && !el.value.includes('/')) {
            const n = parseFloat(raw);
            if (!isNaN(n) && n > 0) el.value = n.toLocaleString('en-US', {maximumFractionDigits:2});
          }
        });
      });
    }, 80);
  },
  /** Closes the modal, releases focus trap, and clears sensitive input fields. */
  close() {
    if (typeof FocusTrap !== 'undefined') FocusTrap.release();
    const modal = document.getElementById('modal');
    modal.style.transform = '';
    modal.style.transition = '';
    document.getElementById('overlay').classList.remove('on');
    ['cf-cvv','cf-cpin','bf-pin','bf-appPin','cf-pwd','bf-pwd'].forEach(id => {
      const f = document.getElementById(id); if (f) f.value = '';
    });
    if (window._familyEditCtx) {
      const ctx = window._familyEditCtx; window._familyEditCtx = null;
      setTimeout(() => { if (typeof Family !== 'undefined') { Family._activeId = ctx.memberId; Family._tab = ctx.tab; Family.render(); } }, 50);
    }
  },
  _initSwipe() {
    const modal = document.getElementById('modal');
    if (!modal || modal._swipeInited) return;
    modal._swipeInited = true;
    let startY = 0, startScrollTop = 0;
    modal.addEventListener('touchstart', e => {
      startY = e.touches[0].clientY;
      startScrollTop = modal.querySelector('.mb')?.scrollTop || 0;
    }, {passive: true});
    modal.addEventListener('touchmove', e => {
      const dy = e.touches[0].clientY - startY;
      if (dy > 0 && startScrollTop === 0) {
        modal.style.transform = `translateY(${Math.max(0, dy * 0.6)}px)`;
        modal.style.transition = 'none';
      }
    }, {passive: true});
    modal.addEventListener('touchend', e => {
      const dy = e.changedTouches[0].clientY - startY;
      modal.style.transition = 'transform .3s var(--spring)';
      if (dy > 80 && startScrollTop === 0) {
        Modal.close();
      } else {
        modal.style.transform = '';
      }
      setTimeout(() => { modal.style.transition = ''; }, 350);
    }, {passive: true});
  }
};

// ===================== MASTER KEY HELPERS =====================
async function hashString(str) {
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

function generateMasterKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => chars[b % chars.length]).join('');
}

/** Longer random key for portable .vos export (not user-invented). */
function generateBackupKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => chars[b % chars.length]).join('');
}
window.generateBackupKey = generateBackupKey;

async function storeMasterKeyHash(key) {
  const h = await hashString(key);
  localStorage.setItem(recoveryKeyStorageKey(), h);
}

function recoveryKeyStorageKey() {
  const p = localStorage.getItem('vo_active_profile') || 'personal';
  return p === 'personal' ? 'vo_mkh' : 'vo_mkh_' + p;
}
window.recoveryKeyStorageKey = recoveryKeyStorageKey;

async function showMasterKeyModal(mk) {
  const fmt = mk.match(/.{1,6}/g).join('-');
  Modal.open('Save Your Master Key',
    '<div style="font-size:13px;color:var(--text2);margin-bottom:12px;line-height:1.6">This is your vault recovery key. <strong>Write it down and keep it safe.</strong> You cannot view it again here.</div>' +
    '<div style="background:var(--glass);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center;font-family:var(--mono);font-size:1.05rem;font-weight:700;letter-spacing:.12em;color:var(--accent);margin-bottom:8px;word-break:break-all">' + fmt + '</div>' +
    '<div style="font-size:11px;color:var(--text3);text-align:center">If you forget your PIN, this key lets you recover your vault data.</div>',
    '<button type="button" class="btn btn-p btn-full" onclick="Modal.close()">I\'ve saved it</button>'
  );
}




// ===================== SETTINGS — FORGOT PIN =====================
window.Settings = window.Settings || {};

window.Settings.forgotPIN = function() {
  if (typeof forgotPINFromLock === 'function') {
    forgotPINFromLock();
    return;
  }
  Modal.open('Forgot PIN',
    '<div style="font-size:13px;color:var(--text2);line-height:1.6">Use Master Key or restore a .vos backup. Capricorn Systems cannot open your vault.</div>',
    '<button type="button" class="btn btn-g btn-full" onclick="Modal.close()">Cancel</button>'
  );
};

window.Settings.useMasterKey = function() {
  Modal.open('Enter Master Key',
    '<div style="display:flex;flex-direction:column;gap:12px">' +
    '<div style="font-size:13px;color:var(--text2);line-height:1.6;padding:10px;background:var(--glass);border-radius:10px">Enter the master key that was shown when you first set up VaultCap.<br><span style="color:var(--text3)">Format: XXXXXX-XXXXXX-XXXXXX-XXXXXX</span></div>' +
    '<input class="inp" id="mk-in" placeholder="XXXXXX-XXXXXX-XXXXXX-XXXXXX" style="font-family:var(--mono);letter-spacing:3px;text-transform:uppercase;font-size:16px;text-align:center" oninput="this.value=this.value.toUpperCase().replace(/[^A-Z0-9-]/g,\'\')">' +
    '<div id="mk-err" style="color:var(--err);font-size:12px;min-height:16px;text-align:center"></div>' +
    '</div>',
    '<button type="button" class="btn btn-g" onclick="Modal.close()">Cancel</button>' +
    '<button type="button" class="btn btn-p" onclick="window.Settings.verifyMasterKey()">Verify & Reset PIN</button>'
  );
};

window.Settings.verifyMasterKey = function() {
  window._verifyMasterKey();
};

window.Settings.resetVault = function() {
  if (typeof Settings !== 'undefined' && Settings.resetVault) {
    Settings.resetVault();
    return;
  }
  if (!confirm('This will permanently delete ALL your vault data. This cannot be undone. Are you absolutely sure?')) return;
  if (!confirm('FINAL CONFIRMATION: Reset entire vault and delete all data?')) return;
  window._confirmReset();
};



// ===================== ACTIVITY =====================
