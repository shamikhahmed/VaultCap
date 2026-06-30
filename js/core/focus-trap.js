'use strict';
/* FocusTrap — keyboard accessibility for modal dialogs */
var FocusTrap = (function () {
  var _el = null, _prev = null;
  var FOCUSABLE = [
    'a[href]','button:not([disabled])','input:not([disabled])',
    'select:not([disabled])','textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])','summary','details'
  ].join(',');

  function trap(el) {
    if (_el) release();
    _el = el;
    _prev = document.activeElement;
    var first = _focusables()[0];
    if (first) first.focus();
    document.addEventListener('keydown', _onKey, true);
  }

  function release() {
    document.removeEventListener('keydown', _onKey, true);
    if (_prev && typeof _prev.focus === 'function') _prev.focus();
    _el = null;
    _prev = null;
  }

  function _focusables() {
    if (!_el) return [];
    return Array.from(_el.querySelectorAll(FOCUSABLE)).filter(function (n) {
      return !!(n.offsetWidth || n.offsetHeight || n.getClientRects().length);
    });
  }

  function _onKey(e) {
    if (!_el) return;
    if (e.key === 'Escape') { release(); return; }
    if (e.key !== 'Tab') return;
    var nodes = _focusables();
    if (!nodes.length) { e.preventDefault(); return; }
    var first = nodes[0], last = nodes[nodes.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  return { trap: trap, release: release };
})();
