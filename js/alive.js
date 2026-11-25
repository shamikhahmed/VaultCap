'use strict';
/* alive.js — "Living dashboard" layer (prototype). Pairs with css/alive.css.
   Reads only what the dashboard already rendered; never changes data.
   Toggle: localStorage vc_alive = '0' turns it off. */
(function () {
  var KEY = 'vc_alive';
  var SEEN = 'vc_alive_seen_nw';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var entered = false;
  var timer = 0;

  function enabled() { try { return localStorage.getItem(KEY) !== '0'; } catch (e) { return true; } }
  function priv() { return document.body.classList.contains('privacy'); }

  /* ── Mood: tint the aurora from real numbers ───────────────────────── */
  function mood(root) {
    var hero = root.querySelector('.nw-hero-card');
    var down = hero && /▼/.test(hero.textContent);
    var scoreEl = root.querySelector('.vault-status-seal__score');
    var score = scoreEl ? parseInt(scoreEl.textContent, 10) || 0 : 100;
    var h = new Date().getHours();
    var night = h >= 20 || h < 6, dawn = h >= 6 && h < 10;
    var s = document.body.style;
    /* growth = emerald, dip = amber/rose; weak security warms the second light */
    s.setProperty('--mood-a', down ? '235 130 70' : '46 170 115');
    s.setProperty('--mood-b', score < 70 ? '240 165 40' : '212 160 23');
    s.setProperty('--mood-c', night ? '70 80 200' : dawn ? '255 150 110' : '64 120 230');
  }

  function aurora(page) {
    if (page.querySelector(':scope > .alive-aurora')) return;
    var a = document.createElement('div');
    a.className = 'alive-aurora';
    a.setAttribute('aria-hidden', 'true');
    a.innerHTML = '<i></i><i></i><i></i>';
    page.insertBefore(a, page.firstChild);
  }
  /* Keep the light off the sidebar: start where the main column starts */
  function auroraEdge() {
    var main = document.getElementById('mainPages');
    if (main) document.body.style.setProperty('--alive-left', Math.max(0, main.getBoundingClientRect().left) + 'px');
  }
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(auroraEdge);
    (function obs() { var m = document.getElementById('mainPages'); if (m) ro.observe(m); else setTimeout(obs, 500); })();
  }
  window.addEventListener('resize', auroraEdge);

  /* ── Count-up: animate a rendered money string, end on the exact text ── */
  var NUM = /^([^\d\-−]*)([\-−]?[\d,]+(?:\.\d+)?)([^\d]*)$/;
  function countUp(el, from, ms) {
    var text = el.textContent.trim();
    var m = text.match(NUM);
    if (!m || priv() || reduce.matches) return;
    var raw = m[2].replace(/,/g, '').replace('−', '-');
    var to = parseFloat(raw);
    if (!isFinite(to)) return;
    var dec = (raw.split('.')[1] || '').length;
    var comma = /,/.test(m[2]);
    var start = from == null ? to * 0.86 : from;
    if (Math.abs(to - start) < Math.pow(10, -dec)) return;
    var t0 = performance.now();
    function fmt(v) {
      var s = Math.abs(v).toFixed(dec);
      if (comma) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return m[1] + (v < 0 ? '−' : '') + s + m[3];
    }
    el.setAttribute('aria-label', text);
    (function step(now) {
      var k = Math.min(1, (now - t0) / ms);
      var e = 1 - Math.pow(2, -10 * k);
      if (!el.isConnected) return;
      if (k >= 1 || priv()) { el.textContent = text; return; }
      el.textContent = fmt(start + (to - start) * e);
      requestAnimationFrame(step);
    })(t0);
  }

  function heroNumber(root) {
    var el = root.querySelector('.nw-hero-amount');
    if (!el) return;
    var m = el.textContent.trim().match(NUM);
    if (!m) return;
    var unit = m[1] + '|' + m[3];
    var val = parseFloat(m[2].replace(/,/g, '').replace('−', '-'));
    var prev = null;
    try {
      var seen = JSON.parse(sessionStorage.getItem(SEEN) || 'null');
      /* Only count from the last value if it was shown in the same currency + scale */
      if (seen && seen.u === unit && isFinite(seen.v) && seen.v !== val && Math.abs(seen.v - val) <= Math.abs(val) * 0.5) prev = seen.v;
    } catch (e) {}
    countUp(el, prev, 1100);
    try { sessionStorage.setItem(SEEN, JSON.stringify({ u: unit, v: val })); } catch (e) {}
  }

  function smallNumbers(root) {
    root.querySelectorAll('.dash-vault-main *').forEach(function (el) {
      if (el.children.length || el.closest('.nw-hero-card') || el.closest('button')) return;
      var t = el.textContent.trim();
      if (t.length > 12 || !/^[£$€₨]|^(Rs|PKR|AED)\s?/.test(t) || !NUM.test(t)) return;
      if (parseFloat(getComputedStyle(el).fontSize) < 16) return;
      countUp(el, null, 900);
    });
  }

  /* ── Sparkline: draw line, fade area, breathing "today" dot ─────────── */
  function sparkline(root) {
    var svg = root.querySelector('.nw-hero-card svg');
    if (!svg || svg.dataset.alive) return;
    svg.dataset.alive = '1';
    var line = svg.querySelector('polyline, path[stroke]:not([stroke="none"])');
    if (line && line.getTotalLength && !reduce.matches) {
      var len = Math.ceil(line.getTotalLength());
      line.style.setProperty('--len', len);
      line.classList.add('alive-draw');
    }
    var area = svg.querySelector('polygon, path[fill]:not([fill="none"])');
    if (area && area !== line) area.classList.add('alive-fill');
    var dots = svg.querySelectorAll('circle');
    var dot = dots[dots.length - 1];
    if (dot) {
      var ring = dot.cloneNode(false);
      ring.classList.add('alive-pulse');
      ring.setAttribute('aria-hidden', 'true');
      dot.parentNode.insertBefore(ring, dot);
    }
  }

  /* ── Chambers: tag colour; tilt with the cursor on Mac ──────────────── */
  function chambers(root) {
    root.querySelectorAll('.chamber-card').forEach(function (c) {
      var name = (c.getAttribute('aria-label') || '').split('·')[0].trim().toLowerCase();
      c.dataset.ch = name;
      c.classList.add('alive-lit');
    });
  }

  function securityRing(root) {
    var b = root.querySelector('.vault-status-seal__score');
    if (!b || b.classList.contains('alive-ring')) return;
    var p = parseInt(b.textContent, 10);
    if (!isFinite(p)) return;
    b.classList.add('alive-ring');
    b.style.setProperty('--ring', b.style.color || 'var(--accent)');
    b.style.setProperty('--alive-p', reduce.matches ? p : 0);
    requestAnimationFrame(function () { requestAnimationFrame(function () { b.style.setProperty('--alive-p', p); }); });
  }

  function ledger(root) {
    var first = root.querySelector('.ledger-strip');
    if (first && /just now|seconds? ago|min(ute)?s? ago/i.test(first.textContent)) first.classList.add('alive-live');
  }

  function stagger(root) {
    ['.dash-vault-main', '.dash-inspector'].forEach(function (sel) {
      var box = root.querySelector(sel);
      if (box) Array.prototype.forEach.call(box.children, function (c, i) { c.style.setProperty('--alive-i', i); });
    });
  }

  function lights(root) {
    root.querySelectorAll('.nw-hero-card, .vault-panel, .dash-inspector__seal').forEach(function (el) { el.classList.add('alive-lit'); });
  }

  function apply() {
    var page = document.getElementById('pg-dashboard');
    var root = document.getElementById('dashBody');
    if (!page || !root || !root.firstElementChild) return;
    if (!enabled()) { document.body.classList.remove('alive'); return; }
    document.body.classList.add('alive');
    aurora(page);
    auroraEdge();
    mood(root);
    stagger(root);
    lights(root);
    chambers(root);
    securityRing(root);
    ledger(root);
    sparkline(root);
    if (!entered && page.offsetParent) {
      entered = true;
      document.body.classList.add('alive-enter');
      setTimeout(function () { document.body.classList.remove('alive-enter'); }, 1600);
      heroNumber(root);
      smallNumbers(root);
    }
  }

  /* Cursor light + chamber tilt — one listener, rAF-throttled */
  var pend = null, queued = false;
  document.addEventListener('pointermove', function (ev) {
    if (!fine.matches || !document.body.classList.contains('alive')) return;
    pend = ev;
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      var e = pend; pend = null; queued = false;
      var el = e && e.target.closest && e.target.closest('.alive-lit');
      if (!el) return;
      var r = el.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      el.style.setProperty('--mx', x + 'px');
      el.style.setProperty('--my', y + 'px');
      if (el.classList.contains('chamber-card') && !reduce.matches) {
        el.style.setProperty('--ty', ((x / r.width - 0.5) * 8).toFixed(2) + 'deg');
        el.style.setProperty('--tx', ((0.5 - y / r.height) * 8).toFixed(2) + 'deg');
      }
    });
  }, { passive: true });
  document.addEventListener('pointerout', function (ev) {
    var c = ev.target.closest && ev.target.closest('.chamber-card');
    if (c && !c.contains(ev.relatedTarget)) { c.style.removeProperty('--tx'); c.style.removeProperty('--ty'); }
  }, { passive: true });

  document.addEventListener('visibilitychange', function () {
    document.body.classList.toggle('alive-paused', document.hidden);
  });
  /* Re-arm the entrance each time the vault is unlocked */
  document.addEventListener('vc:locked', function () { entered = false; });

  function watch() {
    var root = document.getElementById('dashBody');
    if (!root) return setTimeout(watch, 500);
    new MutationObserver(function () { clearTimeout(timer); timer = setTimeout(apply, 60); })
      .observe(root, { childList: true });
    apply();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();

  window.VCAlive = { apply: apply, on: function () { try { localStorage.setItem(KEY, '1'); } catch (e) {} apply(); }, off: function () { try { localStorage.setItem(KEY, '0'); } catch (e) {} document.body.classList.remove('alive'); } };
})();
