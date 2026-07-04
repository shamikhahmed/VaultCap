'use strict';
/* applyLargeText, applyReduceMotion, debounce, fmtAmountInput, initAmountFormatting, Haptic, _scheduleClipClear */

function applyLargeText(on) {
  S.largeText = !!on;
  document.body.classList.toggle('large-text', S.largeText);
  if (S.largeText) {
    document.documentElement.style.setProperty('--base-font', '17px');
  } else {
    document.documentElement.style.removeProperty('--base-font');
  }
  Store.save();
}
window.applyLargeText = applyLargeText;

function applyReduceMotion(on) {
  S.reduceMotion = !!on;
  document.body.classList.toggle('reduce-motion', S.reduceMotion);
  Store.save();
}
window.applyReduceMotion = applyReduceMotion;

function applyHighContrast(on) {
  S.highContrast = !!on;
  document.body.classList.toggle('hc', S.highContrast);
  Store.save();
}
window.applyHighContrast = applyHighContrast;

// ===================== DEBOUNCE =====================
function debounce(fn, ms) {
  let t;
  return function(...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), ms); };
}
window._dbSearch = debounce((fn) => fn(), 200);

// Wire debounced handlers to all search inputs after page renders
function _wireSearchDebounce() {
  const pairs = [
    ['bQ', () => Banks.render()],
    ['cQ', () => Cards.render()],
    ['invQ', () => Inv.render()],
    ['simQ', () => Sims.render()],
    ['emailQ', () => Emails.render()],
    ['friendQ', () => Friends.render()],
    ['digQ', () => Digital.render()],
    ['docsQ', () => DocsModule.render()],
  ];
  pairs.forEach(([id, fn]) => {
    const el = document.getElementById(id);
    if (el && !el._debounced) {
      el._debounced = true;
      el.oninput = debounce(fn, 200);
    }
  });
}

// ===================== AMOUNT FORMATTING =====================
function fmtAmountInput(el) {
  if (!el) return;
  const pos = el.selectionStart;
  const raw = el.value.replace(/,/g, '');
  if (!raw || isNaN(raw)) return;
  const parts = raw.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  el.value = parts.join('.');
}

function initAmountFormatting(container) {
  (container || document).querySelectorAll('input[type=number],input[inputmode=numeric]').forEach(el => {
    if (el._fmtInited) return;
    el._fmtInited = true;
    const isAmt = el.placeholder && /amount|balance|value|price|cost/i.test(el.placeholder + (el.id || ''));
    if (!isAmt) return;
    el.addEventListener('blur', () => fmtAmountInput(el));
  });
}

// ===================== HAPTIC FEEDBACK =====================
const Haptic = {
  save()   { if (navigator.vibrate) navigator.vibrate(30); },
  del()    { if (navigator.vibrate) navigator.vibrate([50,30,50]); },
  error()  { if (navigator.vibrate) navigator.vibrate([100,50,100]); },
  lock()   { if (navigator.vibrate) navigator.vibrate(50); },
  tap()    { if (navigator.vibrate) navigator.vibrate(6); },
};

// ===================== SECURITY HARDENING =====================

// Console suppression in production (non-localhost)
(function() {
  const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.hostname === '';
  if (!isLocal) {
    const noop = () => {};
    ['log', 'debug', 'info', 'warn'].forEach(m => { try { window.console[m] = noop; } catch(e) {} });
  }
})();

// Clipboard auto-clear helper — clear after clipSecs seconds
function _scheduleClipClear() {
  const secs = S.clipSecs || 30;
  setTimeout(() => {
    try { navigator.clipboard.writeText(''); } catch(e) {}
  }, secs * 1000);
}

// Anti-devtools: blur app when devtools likely open
(function() {
  let _dtOpen = false;
  function _checkDevtools() {
    const w = window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160;
    if (w && !_dtOpen) {
      _dtOpen = true;
      if (S.unlocked) document.body.classList.add('app-blur');
    } else if (!w && _dtOpen) {
      _dtOpen = false;
      document.body.classList.remove('app-blur');
    }
  }
  window.addEventListener('resize', _checkDevtools);
})();

// PWA install prompt
var InstallPrompt = (function () {
  var _evt = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    _evt = e;
    if (!localStorage.getItem('vo_install_dismissed')) {
      setTimeout(_showBanner, 8000);
    }
  });
  function _showBanner() {
    if (!_evt || document.getElementById('vaultInstallBanner')) return;
    var b = document.createElement('div');
    b.id = 'vaultInstallBanner';
    b.setAttribute('role', 'region');
    b.setAttribute('aria-label', 'Install VaultCap');
    b.style.cssText = 'position:fixed;bottom:calc(64px + env(safe-area-inset-bottom,0px));left:12px;right:12px;z-index:8500;background:var(--glass,rgba(15,20,40,0.97));border:1px solid var(--border,rgba(255,255,255,0.12));border-radius:16px;padding:14px 16px;display:flex;align-items:center;gap:12px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);box-shadow:0 8px 32px rgba(0,0,0,0.4);animation:pgIn 0.3s ease';
    b.innerHTML = '<div class="chip-ic" style="flex-shrink:0" aria-hidden="true">' + (typeof VC !== 'undefined' ? VC.icon('vault', 28) : '') + '</div><div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--text)">Install VaultCap</div><div style="font-size:12px;color:var(--text2);margin-top:2px">Works offline. No tracking.</div></div><button type="button" style="padding:7px 14px;background:var(--accent,#ffffff);color:#fff;border:none;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap" aria-label="Install app" onclick="InstallPrompt.install()">Install</button><button type="button" style="padding:7px 10px;background:none;border:none;color:var(--text2);font-size:12px;cursor:pointer;line-height:1" aria-label="Dismiss install prompt" onclick="InstallPrompt.dismiss()">Close</button>';
    document.body.appendChild(b);
  }
  return {
    install: function () {
      if (!_evt) return;
      _evt.prompt();
      _evt.userChoice.then(function () { _evt = null; InstallPrompt.dismiss(); });
    },
    dismiss: function () {
      localStorage.setItem('vo_install_dismissed', '1');
      var b = document.getElementById('vaultInstallBanner');
      if (b) b.remove();
    }
  };
})();

