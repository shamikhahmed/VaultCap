'use strict';
/* Cache-bust on BUILD change — external so CSP needs no unsafe-inline */
(function () {
  var BUILD = '5.1.9';
  var KEY = 'vaultcap_build';
  if (localStorage.getItem(KEY) === BUILD) return;
  localStorage.setItem(KEY, BUILD);
  function reload() { location.reload(); }
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
  Promise.all(tasks).then(reload).catch(reload);
})();
