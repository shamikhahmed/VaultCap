'use strict';
/* Cache-bust + demo/skip-splash flags before first paint (CSP-safe, no inline). */
(function () {
  var BUILD = '5.4.1';
  var KEY = 'vaultcap_build';
  try {
    if (localStorage.getItem(KEY) !== BUILD) {
      localStorage.setItem(KEY, BUILD);
      var tasks = [];
      if (window.caches) {
        tasks.push(caches.keys().then(function (keys) {
          return Promise.all(keys.map(function (key) { return caches.delete(key); }));
        }));
      }
      if (navigator.serviceWorker) {
        tasks.push(navigator.serviceWorker.getRegistrations().then(function (regs) {
          return Promise.all(regs.map(function (reg) { return reg.unregister(); }));
        }));
      }
      Promise.all(tasks).catch(function () {});
    }
  } catch (e) {}

  try {
    var demo = /(?:^|[?&])demo=1(?:&|$)/.test(location.search);
    var splashSeen = false;
    try { splashSeen = sessionStorage.getItem('vc_splash_seen') === '1'; } catch (e1) {}
    var reduce = false;
    try { reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e2) {}
    if (demo) {
      document.documentElement.setAttribute('data-vc-demo', '1');
      try {
        localStorage.setItem('vo_active_profile', 'demo');
        localStorage.setItem('vo_used_demo', '1');
      } catch (e3) {}
      try {
        document.documentElement.dataset.appReady = 'true';
        window.__APP_READY__ = true;
      } catch (e4) {}
    } else if (splashSeen || reduce) {
      document.documentElement.setAttribute('data-vc-skip-splash', '1');
    }
  } catch (e) {}

  function activateDeferredCss() {
    var links = document.querySelectorAll('link[data-vc-defer-css]');
    for (var i = 0; i < links.length; i++) links[i].media = 'all';
  }
  window.__vcActivateDeferredCss = activateDeferredCss;
  setTimeout(activateDeferredCss, 5500);
})();
