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
// iOS has no navigator.vibrate — use the Capacitor Haptics plugin (Taptic Engine) in the app.
const _nativeHaptics = (function () {
  try {
    if (window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform() && Capacitor.registerPlugin) {
      return Capacitor.registerPlugin('Haptics');
    }
  } catch (e) {}
  return null;
})();
function _hImpact(style, fallback) {
  if (_nativeHaptics) { try { _nativeHaptics.impact({ style: style }); } catch (e) {} return; }
  if (navigator.vibrate) navigator.vibrate(fallback);
}
function _hNotify(type, fallback) {
  if (_nativeHaptics) { try { _nativeHaptics.notification({ type: type }); } catch (e) {} return; }
  if (navigator.vibrate) navigator.vibrate(fallback);
}
const Haptic = {
  save()   { _hNotify('SUCCESS', 30); },
  del()    { _hImpact('MEDIUM', [50,30,50]); },
  error()  { _hNotify('ERROR', [100,50,100]); },
  lock()   { _hImpact('HEAVY', 50); },
  tap()    { _hImpact('LIGHT', 6); },
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

// True inside the Capacitor iOS app (WKWebView) — drives app-vs-website wording and native paths
function isNativeApp() {
  try {
    if (window.VaultNative && VaultNative.isNative) return !!VaultNative.isNative();
    return !!(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform());
  } catch (e) { return false; }
}
window.isNativeApp = isNativeApp;

/** iOS app: native print sheet (Print / Save to PDF) — popups + window.print() do nothing in WKWebView.
 *  Returns true when handled natively; callers fall back to their popup window on the web. */
function printReport(html, jobName) {
  if (!isNativeApp() || !window.VaultNative || !VaultNative.printHTML) return false;
  // Drop on-screen toolbars (.no-print) — the native print formatter ignores @media print
  const clean = String(html).replace(/<div class="no-print">[\s\S]*?<\/div>/g, '');
  VaultNative.printHTML({ html: clean, jobName: jobName || 'VaultCap' })
    .catch(function () { if (typeof Toast !== 'undefined') Toast.show('Printing unavailable', 'warn'); });
  return true;
}
window.printReport = printReport;

/** Dynamic Type: native uses `-apple-system-body`; web honours `--dt-scale` / URL / stored pref.
 *  Default body 17pt. Cap at 2.0 (≥200% / near AX5) so primary content reflows instead of truncating. */
function applyDynamicType() {
  try {
    let scale = parseFloat(document.documentElement.style.getPropertyValue('--dt-scale')) ||
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dt-scale')) || 1;
    if (typeof isNativeApp === 'function' && isNativeApp()) {
      const probe = document.createElement('span');
      probe.style.cssText = 'font:-apple-system-body;position:absolute;visibility:hidden;pointer-events:none';
      probe.textContent = 'A';
      document.body.appendChild(probe);
      const px = parseFloat(getComputedStyle(probe).fontSize) || 17;
      probe.remove();
      scale = px / 17;
    } else {
      const q = new URLSearchParams(location.search).get('dt');
      if (q) scale = parseFloat(q) || scale;
      try {
        const stored = localStorage.getItem('vc-dt-scale');
        if (stored && !q) scale = parseFloat(stored) || scale;
      } catch (_) {}
    }
    scale = Math.min(2.0, Math.max(0.85, scale));
    document.documentElement.style.setProperty('--dt-scale', scale.toFixed(3));
    if (document.documentElement.dataset.dtScale !== scale.toFixed(2)) {
      document.documentElement.dataset.dtScale = scale.toFixed(2);
      document.dispatchEvent(new Event('vc-text-size'));
    }
  } catch (e) {}
}
window.applyDynamicType = applyDynamicType;
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyDynamicType);
else applyDynamicType();
// Text size is changed in the Settings app → re-read when VaultCap comes back to the foreground
document.addEventListener('visibilitychange', function () { if (!document.hidden) applyDynamicType(); });

(function nativeViewport() {
  if (!isNativeApp()) return;
  const vp = document.querySelector('meta[name="viewport"]');
  if (vp) vp.setAttribute('content', 'width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover');
  document.documentElement.classList.add('is-native');
})();

// PWA install prompt — direct listeners (CSP Act needs window export; var alone never exported)
const InstallPrompt = (function () {
  let _evt = null;
  let _shown = false;

  function _canNativeInstall() {
    return !!_evt;
  }

  // Standalone PWA, iOS home-screen app, or Capacitor native shell — nothing to install
  function _isInstalled() {
    try {
      if (isNativeApp()) return true;
      if (window.matchMedia('(display-mode: standalone)').matches) return true;
      if (navigator.standalone === true) return true;
    } catch (e) {}
    return false;
  }

  function _showBanner() {
    if (_shown || document.getElementById('vaultInstallBanner')) return;
    if (localStorage.getItem('vo_install_dismissed') === '1') return;
    if (_isInstalled()) return;

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
      if (_isInstalled()) return;
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

/** Foundation Switch — role=switch + aria-checked on .tog inputs (VLT-P1-02). */
window.enhanceFoundationSwitches = function enhanceFoundationSwitches(root) {
  const scope = root && root.querySelectorAll ? root : document;
  scope.querySelectorAll('label.tog input[type="checkbox"]').forEach((input) => {
    if (input.dataset.vcSwitch === '1') return;
    input.dataset.vcSwitch = '1';
    input.setAttribute('role', 'switch');
    const sync = () => input.setAttribute('aria-checked', input.checked ? 'true' : 'false');
    sync();
    input.addEventListener('change', sync);
  });
};

