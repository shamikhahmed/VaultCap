'use strict';
/* halo-mark.js — swaps the static VaultCap mark for the living Halo mark:
   solid gold shield, keyhole that turns on unlock, an orbiting halo arc and
   a slow glint. Styling + motion live in css/halo.css (§7). */
(function () {
  var n = 0;

  function svg(size, draw) {
    var id = 'hm' + (++n);
    return '<svg class="halo-mark' + (draw ? ' halo-mark--draw' : '') + '" width="' + size + '" height="' + size +
      '" viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false">' +
      '<defs>' +
        '<linearGradient id="' + id + 'g" x1="16" y1="8" x2="48" y2="56" gradientUnits="userSpaceOnUse">' +
          '<stop stop-color="#FFE3A3"/><stop offset=".42" stop-color="#F2B53A"/><stop offset="1" stop-color="#B9790C"/></linearGradient>' +
        '<linearGradient id="' + id + 'r" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">' +
          '<stop stop-color="#FFD98A" stop-opacity="0"/><stop offset=".5" stop-color="#FFD98A"/><stop offset="1" stop-color="#F2B53A" stop-opacity="0"/></linearGradient>' +
        '<clipPath id="' + id + 'c"><path d="M32 10 L50 18 V31 C50 41.5 42.6 49.6 32 53 C21.4 49.6 14 41.5 14 31 V18 Z"/></clipPath>' +
      '</defs>' +
      '<circle cx="32" cy="32" r="29.5" stroke="currentColor" stroke-opacity=".10" stroke-width="1"/>' +
      '<g class="hm-ring"><circle class="hm-ring-arc" cx="32" cy="32" r="29.5" stroke="url(#' + id + 'r)" stroke-width="2" stroke-linecap="round"/></g>' +
      '<path class="hm-fill" d="M32 10 L50 18 V31 C50 41.5 42.6 49.6 32 53 C21.4 49.6 14 41.5 14 31 V18 Z" fill="url(#' + id + 'g)"/>' +
      '<path class="hm-shield" d="M32 10 L50 18 V31 C50 41.5 42.6 49.6 32 53 C21.4 49.6 14 41.5 14 31 V18 Z" stroke="#FFE3A3" stroke-opacity=".55" stroke-width="1.2" stroke-linejoin="round"/>' +
      '<g clip-path="url(#' + id + 'c)"><rect class="hm-glint" x="22" y="4" width="7" height="60" fill="#fff" opacity="0" transform="rotate(20 32 32)"/></g>' +
      '<g class="hm-key"><circle cx="32" cy="28.5" r="5.2" fill="#1A1206"/><path d="M32 32 V40" stroke="#1A1206" stroke-width="3.8" stroke-linecap="round"/></g>' +
      '</svg>';
  }

  function swap(el, draw) {
    if (!el || el.dataset.halo) return;
    var size = parseInt(el.getAttribute('width'), 10) || el.clientWidth || 48;
    var wrap = document.createElement('span');
    wrap.className = 'halo-mark-wrap ' + (el.getAttribute('class') || '').replace(/\bvc-mark\b/g, '');
    wrap.dataset.halo = '1';
    wrap.style.display = 'inline-flex';
    wrap.style.color = 'var(--h-gold, #f2b53a)';
    wrap.innerHTML = svg(Math.round(size * 1.15), draw);
    el.replaceWith(wrap);
  }

  function run() {
    swap(document.querySelector('.vault-splash__mark'), true);
    swap(document.querySelector('#pgHome .vc-mark--hero'), true);
    document.querySelectorAll('.lk-mark img.vc-mark, .lk-mark svg.vc-mark').forEach(function (e) { swap(e, false); });
    document.querySelectorAll('img.vc-mark, svg.vc-mark').forEach(function (e) {
      if (!e.closest('.modal')) swap(e, false);
    });

    /* Key turns the moment the last PIN dot fills */
    var dots = document.getElementById('pdots');
    if (dots && !dots.dataset.halo) {
      dots.dataset.halo = '1';
      new MutationObserver(function () {
        var all = dots.querySelectorAll('.pd'), on = dots.querySelectorAll('.pd.on');
        if (all.length && on.length === all.length) {
          document.body.classList.add('halo-unlocking');
          setTimeout(function () { document.body.classList.remove('halo-unlocking'); }, 1100);
        }
      }).observe(dots, { subtree: true, attributes: true, attributeFilter: ['class'] });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  /* Sidebar + late-rendered marks */
  setTimeout(run, 1500);
  window.HaloMark = { svg: svg, run: run };
})();
