'use strict';
/* Yield for first paint, then load boot chunk (~180–200KB parse off LCP path). */
(function () {
  var v = (window.APP_VERSION || window.VER || '5.4.2');
  function inject(src, next) {
    var s = document.createElement('script');
    s.src = src;
    s.onload = function () { if (next) next(); };
    s.onerror = function () { if (next) next(); };
    document.head.appendChild(s);
  }
  function go() {
    inject('dist/vaultcap.boot.js?v=' + v, function () {
      inject('js/boot-shell.js?v=' + v);
    });
  }
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { setTimeout(go, 0); });
  });
})();
