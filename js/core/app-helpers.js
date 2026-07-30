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

// PWA install prompt — direct listeners (CSP Act needs window export; var alone never exported)
const InstallPrompt = (function () {
  let _evt = null;
  let _shown = false;

  function _canNativeInstall() {
    return !!_evt;
  }

  function _showBanner() {
    if (_shown || document.getElementById('vaultInstallBanner')) return;
    if (localStorage.getItem('vo_install_dismissed') === '1') return;
    // Standalone / already installed — no banner
    try {
      if (window.matchMedia('(display-mode: standalone)').matches) return;
      if (navigator.standalone === true) return;
    } catch (e) {}

    _shown = true;
    const b = document.createElement('div');
    b.id = 'vaultInstallBanner';
    b.className = 'vc-install-banner';
    b.setAttribute('role', 'region');
    b.setAttribute('aria-label', 'Install VaultCap');

    const icon = typeof VC !== 'undefined' ? VC.icon('vault', 28) : '';
    const native = _canNativeInstall();
    b.innerHTML =
      '<div class="vc-install-banner__ic chip-ic" aria-hidden="true">' + icon + '</div>' +
      '<div class="vc-install-banner__copy">' +
        '<div class="vc-install-banner__title">Install VaultCap</div>' +
        '<div class="vc-install-banner__sub">Works offline. No tracking.</div>' +
      '</div>' +
      '<button type="button" class="vc-install-banner__btn" id="vaultInstallBtn">' +
        (native ? 'Install' : 'How') +
      '</button>' +
      '<button type="button" class="vc-install-banner__close" id="vaultInstallClose" aria-label="Dismiss install prompt">×</button>';

    document.body.appendChild(b);

    const btn = document.getElementById('vaultInstallBtn');
    const close = document.getElementById('vaultInstallClose');
    if (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        InstallPrompt.install();
      });
    }
    if (close) {
      close.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        InstallPrompt.dismiss();
      });
    }
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    _evt = e;
    if (localStorage.getItem('vo_install_dismissed') !== '1') {
      setTimeout(_showBanner, 2500);
    }
  });

  // Safari / iOS never fires beforeinstallprompt — still offer install help
  window.addEventListener('load', function () {
    setTimeout(function () {
      if (_evt) return;
      if (localStorage.getItem('vo_install_dismissed') === '1') return;
      try {
        if (window.matchMedia('(display-mode: standalone)').matches) return;
        if (navigator.standalone === true) return;
      } catch (e) {}
      _showBanner();
    }, 6000);
  });

  return {
    install: function () {
      if (_evt) {
        try {
          _evt.prompt();
          _evt.userChoice.then(function () {
            _evt = null;
            InstallPrompt.dismiss();
          }).catch(function () {
            InstallPrompt.dismiss();
          });
        } catch (err) {
          window.location.href = 'install.html';
        }
        return;
      }
      window.location.href = 'install.html';
    },
    dismiss: function () {
      try { localStorage.setItem('vo_install_dismissed', '1'); } catch (e) {}
      _shown = false;
      const b = document.getElementById('vaultInstallBanner');
      if (b) b.remove();
    },
    /** Test / demo helper */
    _forceShow: function () {
      try { localStorage.removeItem('vo_install_dismissed'); } catch (e) {}
      _shown = false;
      const old = document.getElementById('vaultInstallBanner');
      if (old) old.remove();
      _showBanner();
    }
  };
})();
window.InstallPrompt = InstallPrompt;

