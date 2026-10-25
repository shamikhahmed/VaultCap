'use strict';
/* Yield for first paint, then storage → boot (~smaller) → shell — off LCP path. */
(function () {
  var v = (window.APP_VERSION || window.VER || '6.0.0');
  function inject(src, next) {
    var s = document.createElement('script');
    s.src = src;
    s.onload = function () { if (next) next(); };
    s.onerror = function () { if (next) next(); };
    document.head.appendChild(s);
  }
  function go() {
    inject('js/storage.js?v=' + v, function () {
      inject('dist/vaultcap.boot.js?v=' + v, function () {
        inject('js/boot-shell.js?v=' + v);
      });
    });
  }
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { setTimeout(go, 0); });
  });
})();
