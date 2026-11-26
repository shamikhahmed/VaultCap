'use strict';
/* motion.js — app-wide entrance motion. Every time a page opens:
   numbers count up, line charts draw, donut segments sweep, bars grow,
   cards/rows rise in on a short stagger. Only what is on screen animates.
   Uses WAAPI (no layout writes besides the counting text), stops if the app
   re-renders mid-animation, and does nothing with reduced motion, privacy
   mode, or the living layer switched off (localStorage vc_alive = '0').
   The dashboard hero/sparkline/stagger stay with alive.js. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  function cssMs(name, fallback) {
    try {
      var raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      var m = raw.match(/^([\d.]+)(ms|s)$/i);
      if (!m) return fallback;
      return m[2].toLowerCase() === 's' ? parseFloat(m[1]) * 1000 : parseFloat(m[1]);
    } catch (e) { return fallback; }
  }
  function cssEase(name, fallback) {
    try {
      var raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return raw || fallback;
    } catch (e) { return fallback; }
  }
  var EASE = cssEase('--cap-ease', 'cubic-bezier(.22,1,.36,1)');
  var DUR_FAST = cssMs('--cap-dur-fast', 150);
  var DUR_BASE = cssMs('--cap-dur-base', 280);
  var DUR_SLOW = cssMs('--cap-dur-slow', 600);
  var DUR_REVEAL = cssMs('--cap-dur-reveal', 800);
  var done = new WeakSet();
  var current = null;
  var runId = 0;

  function off() {
    if (reduce.matches) return true;
    try { if (localStorage.getItem('vc_alive') === '0') return true; } catch (e) {}
    return document.body.classList.contains('privacy') || document.hidden;
  }
  function onScreen(el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  }
  function skip(el) {
    return done.has(el) || el.closest('.nw-hero-card, .modal, input, select, textarea, [contenteditable]');
  }

  /* ── Numbers ───────────────────────────────────────────────────────── */
  var ONE = /^([^\d−-]{0,6}?)([−-]?\d[\d,]*(?:\.\d+)?)([^\d]{0,8})$/;
  /* The number's own text node: a leaf, or "218<span>GBP</span>" (number + small unit children) */
  function numNode(el) {
    if (!el.children.length) return el.firstChild && el.firstChild.nodeType === 3 && el.childNodes.length === 1 ? el.firstChild : null;
    if (el.children.length > 2) return null;
    for (var i = 0; i < el.children.length; i++) if (/\d/.test(el.children[i].textContent) || el.children[i].children.length) return null;
    var f = el.firstChild;
    return f && f.nodeType === 3 && /\d/.test(f.nodeValue) ? f : null;
  }
  function countable(el) {
    if (skip(el)) return null;
    var node = numNode(el);
    if (!node) return null;
    var t = node.nodeValue.trim();
    if (!t || t.length > 20 || /[\/:*@#]|\d{4}-\d|\d\s\d/.test(t)) return null;
    var m = t.match(ONE);
    if (!m) return null;
    var raw = m[2].replace(/,/g, '').replace('−', '-');
    var to = parseFloat(raw);
    if (!isFinite(to) || to === 0) return null;
    // Years never count up — "2025", "2025 rates", "FY 2025", "YA 2025" (no thousands comma, no decimals)
    if (/^(19|20)\d\d$/.test(raw) && m[2].indexOf(',') < 0) return null;
    var dashboardMain = el.closest('.dash-vault-main');
    if (dashboardMain && parseFloat(getComputedStyle(el).fontSize) >= 16) return null; // alive.js owns these
    return { el: el, node: node, orig: node.nodeValue, text: t, m: m, to: to, dec: (raw.split('.')[1] || '').length, comma: /,/.test(m[2]) };
  }
  function count(n, ms, delay) {
    done.add(n.el);
    var t0 = performance.now() + delay;
    var el = n.el, node = n.node;
    var full = el.textContent.trim();
    el.setAttribute('aria-label', full);
    function fmt(v) {
      var s = Math.abs(v).toFixed(n.dec);
      if (n.comma) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return n.m[1] + (v < 0 ? '−' : '') + s + n.m[3];
    }
    var lead = n.orig.match(/^\s*/)[0], trail = n.orig.match(/\s*$/)[0];
    node.nodeValue = lead + fmt(0) + trail;
    (function step(now) {
      if (!el.isConnected || !node.isConnected) return;
      var k = Math.max(0, Math.min(1, (now - t0) / ms));
      if (k >= 1 || document.body.classList.contains('privacy')) { node.nodeValue = n.orig; el.removeAttribute('aria-label'); return; }
      node.nodeValue = lead + fmt(n.to * (1 - Math.pow(2, -10 * k))) + trail;
      requestAnimationFrame(step);
    })(performance.now());
  }
  function numbers(page) {
    var list = [];
    page.querySelectorAll('.sens, b, strong, span, div, td').forEach(function (el) {
      if (list.length >= 48) return;
      var n = countable(el);
      if (!n || !onScreen(el)) return;
      var fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < 11) return;
      n.big = fs >= 20;
      list.push(n);
    });
    list.forEach(function (n, i) { count(n, n.big ? 1100 : 800, Math.min(i * 18, 360)); });
  }

  /* ── Charts ────────────────────────────────────────────────────────── */
  function charts(page) {
    page.querySelectorAll('svg:not(.vc-icon)').forEach(function (svg) {
      if (skip(svg) || svg.getBoundingClientRect().width < 40 || !onScreen(svg)) return;
      done.add(svg);
      var seg = 0;
      svg.querySelectorAll('polyline, path, line').forEach(function (p) {
        var stroke = p.getAttribute('stroke');
        if (!stroke || stroke === 'none' || !p.getTotalLength) return;
        var len = p.getTotalLength();
        if (!(len > 8)) return;
        p.animate([{ strokeDasharray: len, strokeDashoffset: len }, { strokeDasharray: len, strokeDashoffset: 0 }],
          { duration: DUR_REVEAL + DUR_BASE, easing: EASE, delay: 80 });
      });
      svg.querySelectorAll('polygon, path[fill]:not([fill="none"])').forEach(function (a) {
        if (a.getAttribute('stroke') && a.tagName === 'path') return;
        a.animate([{ opacity: 0 }, { opacity: getComputedStyle(a).opacity || 1 }], { duration: DUR_REVEAL, easing: 'ease-out', delay: 450, fill: 'backwards' });
      });
      svg.querySelectorAll('circle[stroke-dasharray]').forEach(function (c) {
        var d = (c.getAttribute('stroke-dasharray') || '').split(/[ ,]+/).map(parseFloat);
        if (d.length < 2 || !(d[0] > 0)) return;
        c.animate([{ strokeDasharray: '0 ' + (d[0] + d[1]) }, { strokeDasharray: d[0] + ' ' + d[1] }],
          { duration: DUR_REVEAL, easing: EASE, delay: 120 + seg++ * 110, fill: 'backwards' });
      });
      svg.querySelectorAll('rect').forEach(function (r, i) {
        if (parseFloat(r.getAttribute('height')) < 4) return;
        r.style.transformBox = 'fill-box'; r.style.transformOrigin = '50% 100%';
        r.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: DUR_REVEAL, easing: EASE, delay: 80 + i * 40, fill: 'backwards' });
      });
      svg.querySelectorAll('circle:not([stroke-dasharray])').forEach(function (c) {
        if (parseFloat(c.getAttribute('r')) > 8) return;           // end dots pop in after the line lands
        c.animate([{ opacity: 0, transform: 'scale(0)' }, { opacity: 1, transform: 'scale(1)' }],
          { duration: DUR_BASE + DUR_FAST, easing: cssEase('--cap-ease-spring', 'cubic-bezier(.34,1.56,.64,1)'), delay: DUR_REVEAL + DUR_FAST, fill: 'backwards' });
      });
    });
  }

  /* ── Bars + progress ───────────────────────────────────────────────── */
  function bars(page) {
    var i = 0;
    page.querySelectorAll('[style*="width"], [style*="height"], progress, meter').forEach(function (el) {
      if (skip(el) || !onScreen(el)) return;
      var st = el.getAttribute('style') || '';
      var w = st.match(/(?:^|;)\s*width:\s*([\d.]+%)/), h = st.match(/(?:^|;)\s*height:\s*([\d.]+%)/);
      var r = el.getBoundingClientRect();
      if (w && r.height <= 16 && r.height > 0) {
        done.add(el);
        el.animate([{ width: '0%' }, { width: w[1] }], { duration: DUR_REVEAL + DUR_FAST, easing: EASE, delay: 120 + i++ * 60, fill: 'backwards' });
      } else if (h && r.width <= 48 && r.width > 0) {
        done.add(el);
        el.animate([{ height: '0%' }, { height: h[1] }], { duration: DUR_REVEAL, easing: EASE, delay: 120 + i++ * 50, fill: 'backwards' });
      }
    });
  }

  /* ── Cards + rows rise in ──────────────────────────────────────────── */
  var CARD = '.entry, .set-card, .vault-panel, .widget, .si, .stat-card, .kpi, [class*="-card"]:not(.wcard-net):not(.wcard)';
  function rise(page) {
    if (page.id === 'pg-dashboard') return;                         // alive.js staggers the dashboard
    var all = Array.prototype.filter.call(page.querySelectorAll(CARD), function (el) {
      var p = el.parentElement && el.parentElement.closest(CARD);
      return !(p && page.contains(p)) && !skip(el) && onScreen(el);
    }).slice(0, 18);
    all.forEach(function (el, i) {
      done.add(el);
      el.animate([{ opacity: 0, transform: 'translateY(12px) scale(.985)' }, { opacity: 1, transform: 'none' }],
        { duration: DUR_SLOW, easing: EASE, delay: i * 38, fill: 'backwards' });
    });
  }


  /* ── Large title glides in ─────────────────────────────────────────── */
  function title(page) {
    page.querySelectorAll('.cap-kicker, .cap-h2, .cap-title').forEach(function (el, i) {
      if (i > 2 || skip(el) || !onScreen(el)) return;
      done.add(el);
      el.animate([{ opacity: 0, transform: 'translateX(-10px)' }, { opacity: 1, transform: 'none' }],
        { duration: DUR_SLOW - DUR_FAST, easing: EASE, delay: i * 50, fill: 'backwards' });
    });
  }

  /* ── Cards page: wallet cards deal in like a fanned hand ───────────── */
  function wallet(page) {
    var cards = Array.prototype.filter.call(page.querySelectorAll('.wcard'), function (el) { return !skip(el) && onScreen(el); }).slice(0, 10);
    cards.forEach(function (el, i) {
      done.add(el);
      el.animate([
        { opacity: 0, transform: 'translate(46px, 14px) rotate(7deg) scale(.94)' },
        { opacity: 1, offset: .55 },
        { opacity: 1, transform: 'none' }
      ], { duration: DUR_REVEAL - DUR_FAST / 2, easing: cssEase('--cap-ease-spring', 'cubic-bezier(.34,1.3,.64,1)'), delay: 60 + i * 70, fill: 'backwards' });
    });
  }

  /* ── Things that need attention breathe twice ──────────────────────── */
  function attention(page) {
    page.querySelectorAll('.badge.b-warn, .badge.b-err, .badge.b-danger, .alive-chip--warn, .alive-chip--down').forEach(function (el, i) {
      if (i > 8 || skip(el) || !onScreen(el)) return;
      done.add(el);
      el.animate([
        { boxShadow: '0 0 0 0 rgb(255 159 10 / .55)' },
        { boxShadow: '0 0 0 8px rgb(255 159 10 / 0)' }
      ], { duration: DUR_REVEAL + DUR_BASE, easing: 'ease-out', delay: DUR_REVEAL + DUR_FAST, iterations: 2 });
    });
  }

  /* ── Live lists: rows added by filtering, searching or saving ease in ─ */
  var entering = 0;
  function liveRows(nodes) {
    if (off() || performance.now() < entering) return;
    var n = 0;
    nodes.forEach(function (node) {
      if (n >= 14 || node.nodeType !== 1 || !node.isConnected || node.closest('.modal')) return;
      var rows = node.matches(CARD) ? [node] : Array.prototype.slice.call(node.querySelectorAll(CARD), 0, 14);
      rows.forEach(function (el) {
        if (n >= 14 || done.has(el) || !onScreen(el)) return;
        done.add(el);
        el.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }],
          { duration: DUR_BASE, easing: EASE, delay: n++ * 22, fill: 'backwards' });
      });
    });
  }
  var pendingRows = [], rowTimer = null;
  var rowObserver = new MutationObserver(function (muts) {
    muts.forEach(function (m) { m.addedNodes.forEach(function (x) { pendingRows.push(x); }); });
    clearTimeout(rowTimer);
    rowTimer = setTimeout(function () { var list = pendingRows; pendingRows = []; liveRows(list); }, 16);
  });

  /* ── Native haptic tick on tab + chip changes (iOS app only) ───────── */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.ti, .chip, [role="tab"], .ob-cty, .home-mod-tile, .vc-sheet-tile');
    if (!t) return;
    try { if (window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform() && typeof Haptic !== 'undefined') Haptic.tap(); } catch (err) {}
  }, { passive: true, capture: true });

  function animate(page, pass) {
    if (off() || !page || !page.classList.contains('on')) return;
    if (pass === 0) { rise(page); title(page); }
    wallet(page);
    charts(page);
    attention(page);
    bars(page);
    numbers(page);
  }

  function check() {
    var page = document.querySelector('#mainPages > .page.on');
    var app = document.getElementById('app');
    if (!page || !app || app.style.display === 'none') { current = null; return; }
    if (page === current) return;
    current = page;
    done = new WeakSet();
    var id = ++runId;
    entering = performance.now() + DUR_REVEAL + DUR_BASE;
    rowObserver.disconnect();
    rowObserver.observe(page, { childList: true, subtree: true });
    /* Pages render async (lazy modules); catch late content with a second pass */
    requestAnimationFrame(function () { requestAnimationFrame(function () { if (id === runId) animate(page, 0); }); });
    setTimeout(function () { if (id === runId) animate(page, 1); }, DUR_SLOW + DUR_FAST / 2);
  }

  function watch() {
    var main = document.getElementById('mainPages');
    if (!main) return setTimeout(watch, 400);
    var t = null;
    var kick = function () { clearTimeout(t); t = setTimeout(check, 30); };
    new MutationObserver(kick).observe(main, { attributes: true, attributeFilter: ['class'], subtree: false, childList: false });
    main.querySelectorAll(':scope > .page').forEach(function (p) {
      new MutationObserver(kick).observe(p, { attributes: true, attributeFilter: ['class'] });
    });
    var app = document.getElementById('app');
    if (app) new MutationObserver(kick).observe(app, { attributes: true, attributeFilter: ['style'] });
    /* Re-run when the vault locks/unlocks */
    new MutationObserver(function () { if (document.body.classList.contains('on-lock')) current = null; kick(); })
      .observe(document.body, { attributes: true, attributeFilter: ['class'] });
    check();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();

  window.VCMotion = { replay: function () { current = null; check(); } };
})();
