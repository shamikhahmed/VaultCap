'use strict';
/* ConfirmDialog / PromptDialog — VLT-P1-02 foundation (replaces window.confirm / prompt). */
(function () {
  function ensureStyles() {
    if (document.getElementById('vc-dialog-css')) return;
    const style = document.createElement('style');
    style.id = 'vc-dialog-css';
    style.textContent = `
.vc-dialog-backdrop{position:fixed;inset:0;background:rgba(8,10,14,.55);z-index:var(--z-modal,9200);display:flex;align-items:flex-end;justify-content:center;padding:max(12px,env(safe-area-inset-bottom,0px)) 12px}
@media(min-width:560px){.vc-dialog-backdrop{align-items:center;padding:24px}}
.vc-dialog{width:min(100%,420px);background:var(--bg2,var(--glass,${VCBrand.h_16161a}));color:var(--text,${VCBrand.h_f5f5f5});border:1px solid var(--border,rgba(255,255,255,.12));border-radius:16px;padding:18px 16px 14px;box-shadow:0 18px 48px rgba(0,0,0,.35)}
.vc-dialog h2{margin:0 0 8px;font:600 1.125rem/1.3 var(--font,system-ui);color:var(--text)}
.vc-dialog p{margin:0;font-size:.9375rem;line-height:1.45;color:var(--text2,${VCBrand.h_a1a1a6});white-space:pre-wrap}
.vc-dialog__actions{display:flex;gap:8px;justify-content:flex-end;margin-top:16px;flex-wrap:wrap}
.vc-dialog__actions .btn{min-height:44px;min-width:44px;padding:0 14px;border-radius:10px;border:1px solid var(--border,rgba(255,255,255,.12));background:var(--bg3,${VCBrand.h_1c1c1e});color:var(--text);font:600 .9rem/1 var(--font,system-ui);cursor:pointer;touch-action:manipulation}
.vc-dialog__actions .btn-p{background:var(--accent,${VCBrand.h_00d5ff});border-color:transparent;color:var(--accent-contrast,${VCBrand.h_041018})}
.vc-dialog__actions .btn-danger{background:transparent;border-color:var(--err,${VCBrand.h_ff453a});color:var(--err,${VCBrand.h_ff453a})}
.vc-dialog input{width:100%;margin-top:12px;min-height:44px;border-radius:10px;border:1px solid var(--border);background:var(--bg3,${VCBrand.h_1c1c1e});color:var(--text);padding:0 12px;font-size:1rem;box-sizing:border-box;font-family:var(--font,system-ui)}
`;
    document.head.appendChild(style);
  }

  function mountDialog({ title, body, input, confirmLabel, cancelLabel, destructive, showCancel }) {
    ensureStyles();
    return new Promise((resolve) => {
      const backdrop = document.createElement('div');
      backdrop.className = 'vc-dialog-backdrop';
      backdrop.id = 'vc-confirm-backdrop';
      backdrop.setAttribute('role', 'presentation');

      const dialog = document.createElement('div');
      dialog.className = 'vc-dialog';
      dialog.setAttribute('role', 'alertdialog');
      dialog.setAttribute('aria-modal', 'true');
      dialog.setAttribute('aria-labelledby', 'vc-dlg-title');
      if (body) dialog.setAttribute('aria-describedby', 'vc-dlg-body');

      const h = document.createElement('h2');
      h.id = 'vc-dlg-title';
      h.tabIndex = -1;
      h.textContent = title || 'Confirm';
      dialog.appendChild(h);

      if (body) {
        const p = document.createElement('p');
        p.id = 'vc-dlg-body';
        p.textContent = body;
        dialog.appendChild(p);
      }

      let inputEl = null;
      if (input) {
        inputEl = document.createElement('input');
        inputEl.type = input.type || 'text';
        inputEl.autocomplete = 'off';
        inputEl.placeholder = input.placeholder || '';
        if (input.value != null) inputEl.value = String(input.value);
        dialog.appendChild(inputEl);
      }

      const actions = document.createElement('div');
      actions.className = 'vc-dialog__actions';

      const close = (val) => {
        window.removeEventListener('keydown', onKey, true);
        backdrop.remove();
        resolve(val);
      };
      const onKey = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          close(input ? null : false);
        }
        if (e.key === 'Enter' && inputEl && document.activeElement === inputEl) {
          e.preventDefault();
          close(inputEl.value);
        }
      };

      let cancelBtn = null;
      if (showCancel !== false) {
        cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'btn';
        cancelBtn.textContent = cancelLabel || 'Cancel';
        cancelBtn.addEventListener('click', () => close(input ? null : false));
        actions.appendChild(cancelBtn);
      }

      const confirmBtn = document.createElement('button');
      confirmBtn.type = 'button';
      confirmBtn.className = 'btn ' + (destructive ? 'btn-danger' : 'btn-p');
      confirmBtn.textContent = confirmLabel || 'Confirm';
      confirmBtn.addEventListener('click', () => close(input ? inputEl.value : true));
      actions.appendChild(confirmBtn);

      dialog.appendChild(actions);
      backdrop.appendChild(dialog);
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) close(input ? null : false);
      });
      document.body.appendChild(backdrop);
      window.addEventListener('keydown', onKey, true);
      if (inputEl) inputEl.focus();
      else if (destructive && cancelBtn) cancelBtn.focus();
      else h.focus();
    });
  }

  function splitMsg(msg) {
    const text = String(msg == null ? '' : msg);
    const parts = text.split(/\n\n/);
    if (parts.length > 1) {
      return { title: parts[0].replace(/\n/g, ' ').trim(), body: parts.slice(1).join('\n\n').trim() };
    }
    if (text.length > 90) {
      const cut = text.indexOf('. ');
      if (cut > 20 && cut < 120) {
        return { title: text.slice(0, cut + 1).trim(), body: text.slice(cut + 2).trim() };
      }
    }
    return { title: text.trim() || 'Confirm', body: '' };
  }

  function isDestructive(msg, opts) {
    if (opts && opts.destructive != null) return !!opts.destructive;
    return /delete|trash|reset|permanently|WARNING|erase|wipe|panic/i.test(String(msg || ''));
  }

  function confirmLabelFor(msg, opts) {
    if (opts && opts.confirmLabel) return opts.confirmLabel;
    const m = String(msg || '');
    if (/trash/i.test(m)) return 'Move to Trash';
    if (/delete/i.test(m)) return 'Delete';
    if (/reset/i.test(m)) return 'Reset';
    if (/export/i.test(m)) return 'Export';
    return 'Continue';
  }

  window.CapConfirm = function CapConfirm(opts) {
    opts = opts || {};
    return mountDialog({
      title: opts.title || 'Confirm',
      body: opts.body || '',
      confirmLabel: opts.confirmLabel || 'Confirm',
      cancelLabel: opts.cancelLabel || 'Cancel',
      destructive: !!opts.destructive,
      showCancel: true
    });
  };

  window.CapPrompt = function CapPrompt(opts) {
    opts = opts || {};
    return mountDialog({
      title: opts.title || 'Enter value',
      body: opts.body || '',
      input: { placeholder: opts.placeholder || '', type: opts.type || 'text', value: opts.value },
      confirmLabel: opts.confirmLabel || 'OK',
      cancelLabel: opts.cancelLabel || 'Cancel',
      showCancel: true
    });
  };

  /** Async ConfirmDialog — drop-in for legacy sync __vos_confirm(msg). */
  window.__vos_confirm = async function (msg, opts) {
    try {
      if (typeof window.CapConfirm !== 'function') return false;
      const split = splitMsg(msg);
      return !!(await window.CapConfirm({
        title: split.title,
        body: split.body,
        confirmLabel: confirmLabelFor(msg, opts),
        cancelLabel: (opts && opts.cancelLabel) || 'Cancel',
        destructive: isDestructive(msg, opts)
      }));
    } catch (e) {
      console.warn('[VaultCap] confirm failed — treating as cancelled:', String(msg || '').slice(0, 80));
      return false;
    }
  };

  /** Typed confirmation — replaces window.prompt gate. */
  window.__vos_confirmTyped = async function (msg, word) {
    try {
      const expected = String(word || '');
      const typed = await window.CapPrompt({
        title: String(msg || 'Type to confirm'),
        body: expected ? ('Type ' + expected + ' to continue.') : '',
        placeholder: expected,
        confirmLabel: 'Confirm',
        cancelLabel: 'Cancel'
      });
      if (typed == null) return false;
      const got = String(typed).trim();
      if (expected === expected.toUpperCase()) return got.toUpperCase() === expected;
      return got === expected;
    } catch (e) {
      return false;
    }
  };
})();
