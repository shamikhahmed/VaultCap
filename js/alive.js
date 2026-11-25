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


  /* ═══ Round 2 ═══════════════════════════════════════════════════════ */
  var VISIT = 'vc_alive_visit';
  var HIGH = 'vc_alive_high';
  var away = null;          // { since, delta, unit, changes } for this session
  var lastHero = null;      // last hero text rendered this session
  var DAY = 864e5;

  function profileKey(k) {
    var p = 'default';
    try { p = localStorage.getItem('vo_active_profile') || p; } catch (e) {}
    return k + '_' + p;
  }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function parseHero(root) {
    var el = root.querySelector('.nw-hero-amount');
    var m = el && el.textContent.trim().match(NUM);
    if (!m) return null;
    var raw = m[2].replace(/,/g, '').replace('−', '-');
    return { el: el, pre: m[1], suf: m[3], v: parseFloat(raw), dec: (raw.split('.')[1] || '').length, comma: /,/.test(m[2]), unit: m[1] + '|' + m[3] };
  }
  function fmtLike(h, v, signed) {
    var s = Math.abs(v).toFixed(h.dec);
    if (h.comma) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (signed ? (v < 0 ? '−' : '+') : (v < 0 ? '−' : '')) + h.pre + s + h.suf;
  }
  function sinceLabel(t) {
    var d = new Date(t), now = new Date();
    var days = Math.floor((new Date(now.toDateString()) - new Date(d.toDateString())) / DAY);
    if (days <= 0) return d.getHours() < 12 && now.getHours() >= 12 ? 'this morning' : 'earlier today';
    if (days === 1) return 'yesterday';
    if (days < 7) return d.toLocaleDateString(undefined, { weekday: 'long' });
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  }

  /* Expiring cards + documents in the next 60 days, soonest first */
  function expiring() {
    var now = Date.now(), out = [];
    try {
      (window.S && S.cards || []).forEach(function (c) {
        var p = String(c.expiry || '').split('/');
        if (p.length !== 2) return;
        var end = new Date(2000 + (+p[1]), +p[0], 0).getTime();
        out.push({ name: c.cardName || c.name || 'Card', days: Math.round((end - now) / DAY) });
      });
      (window.S && S.documents || []).forEach(function (d) {
        var e = typeof docExpiry === 'function' ? docExpiry(d) : d.expiry;
        var t = e ? new Date(e).getTime() : NaN;
        var n = String(d.title || d.docType || 'Document');
        n = n.length <= 4 ? n.toUpperCase() : n.charAt(0).toUpperCase() + n.slice(1);
        if (isFinite(t)) out.push({ name: n, days: Math.round((t - now) / DAY) });
      });
    } catch (e) {}
    return out.filter(function (x) { return x.days >= 0 && x.days <= 60; }).sort(function (a, b) { return a.days - b.days; });
  }

  function isNewHigh() {
    try {
      var h = (S.user.nwHistory || []).filter(function (x) { return typeof x.v === 'number'; });
      if (h.length < 3) return false;
      var last = h[h.length - 1].v, prev = Math.max.apply(null, h.slice(0, -1).map(function (x) { return x.v; }));
      return last > prev;
    } catch (e) { return false; }
  }

  /* ── A. "Since you were away" strip ───────────────────────────────── */
  function awayStrip(root, hero) {
    var main = root.querySelector('.dash-vault-main');
    if (!main || !hero) return;
    if (!away) {
      var last = null;
      try { last = JSON.parse(localStorage.getItem(profileKey(VISIT)) || 'null'); } catch (e) {}
      var changes = 0;
      if (last) {
        (window.S && S.activity || []).forEach(function (a) {
          if (new Date(a.t).getTime() > last.t && !/^Vault (un)?locked/i.test(a.a || '')) changes++;
        });
      }
      away = {
        since: last ? last.t : null,
        delta: last && last.u === hero.unit && isFinite(last.v) ? hero.v - last.v : null,
        changes: changes,
        fresh: true
      };
      try { localStorage.setItem(profileKey(VISIT), JSON.stringify({ t: Date.now(), u: hero.unit, v: hero.v })); } catch (e) {}
    }
    var old = main.querySelector(':scope > .alive-away');
    if (old) old.remove();

    var chips = [];
    if (away.delta != null && Math.abs(away.delta) >= Math.pow(10, -hero.dec)) {
      chips.push('<span class="alive-chip alive-chip--' + (away.delta >= 0 ? 'up' : 'down') + '"><b class="sens">' + esc(fmtLike(hero, away.delta, true)) + '</b> since ' + esc(sinceLabel(away.since)) + '</span>');
    }
    if (isNewHigh()) chips.push('<span class="alive-chip alive-chip--high">New net-worth high</span>');
    if (away.changes) chips.push('<span class="alive-chip">' + away.changes + ' change' + (away.changes > 1 ? 's' : '') + ' since your last visit</span>');
    var ex = expiring();
    if (ex.length) {
      var n = ex[0];
      chips.push('<button type="button" class="alive-chip alive-chip--' + (n.days <= 14 ? 'down' : 'warn') + '" data-act="R.goto(\'alerts\')">' +
        esc(n.name) + ' expires ' + (n.days === 0 ? 'today' : 'in ' + n.days + ' day' + (n.days > 1 ? 's' : '')) +
        (ex.length > 1 ? ' · +' + (ex.length - 1) + ' more' : '') + '</button>');
    }
    try {
      var lb = S.user && S.user.lastBackup ? Math.floor((Date.now() - new Date(S.user.lastBackup)) / DAY) : null;
      if (lb != null && lb > 14) chips.push('<button type="button" class="alive-chip alive-chip--warn" data-act="R.goto(\'backup\')">Last backup ' + lb + ' days ago</button>');
    } catch (e) {}
    if (!chips.length) chips.push('<span class="alive-chip">All quiet. Nothing needs you today.</span>');

    var h = new Date().getHours();
    var hi = away.since ? 'Since you were away' : (h < 12 ? 'This morning' : h < 18 ? 'This afternoon' : 'This evening');
    var box = document.createElement('div');
    box.className = 'alive-away' + (away.fresh ? ' alive-away--in' : '');
    box.setAttribute('role', 'status');
    box.innerHTML = '<span class="alive-away__hi">' + hi + '</span>' + chips.map(function (c, i) {
      return c.replace('class="alive-chip', 'style="--alive-i:' + i + '" class="alive-chip');
    }).join('');
    main.insertBefore(box, main.firstChild);
    away.fresh = false;
  }

  /* ── B. Rolling digits when the number changes while you watch ───── */
  function roll(el, text) {
    if (reduce.matches || priv()) return;
    el.setAttribute('aria-label', text);
    el.innerHTML = Array.prototype.map.call(text, function (ch, i) {
      return /\d/.test(ch)
        ? '<span class="alive-d" style="--alive-i:' + i + '"><span>' + ch + '</span></span>'
        : '<span>' + esc(ch) + '</span>';
    }).join('');
    setTimeout(function () { if (el.isConnected) el.textContent = text; }, 1200);
  }

  /* ── C. Hero chart: taller, hover any day ────────────────────────── */
  function heroChart(root, hero) {
    var card = root.querySelector('.nw-hero-card');
    var svg = card && card.querySelector('svg');
    var line = svg && svg.querySelector('polyline');
    if (!svg || !line || svg.dataset.aliveChart) return;
    svg.dataset.aliveChart = '1';
    var w = svg.clientWidth || 500;
    svg.style.height = Math.max(48, Math.min(120, Math.round(w * 42 / 260))) + 'px';
    if (/Net Worth ·/.test(card.textContent)) return; // country filter: history is all-vault
    var pts = line.getAttribute('points').trim().split(/\s+/).map(function (p) { return p.split(',').map(Number); });
    var hist = (S.user.nwHistory || []).filter(function (x) { return typeof x.v === 'number'; }).slice(-pts.length);
    if (hist.length !== pts.length || !hero) return;
    var tip = document.createElement('div');
    tip.className = 'alive-tip';
    tip.setAttribute('aria-hidden', 'true');
    var bar = document.createElement('div');
    bar.className = 'alive-xhair';
    bar.setAttribute('aria-hidden', 'true');
    card.appendChild(bar); card.appendChild(tip);
    var lastV = hist[hist.length - 1].v || 1;
    function show(ev) {
      var r = svg.getBoundingClientRect(), cr = card.getBoundingClientRect();
      var vx = (ev.clientX - r.left) / r.width * 260;
      var i = 0, best = 1e9;
      pts.forEach(function (p, j) { var d = Math.abs(p[0] - vx); if (d < best) { best = d; i = j; } });
      var px = r.left - cr.left + pts[i][0] / 260 * r.width;
      var py = r.top - cr.top + pts[i][1] / 42 * r.height;
      var val = hero.v * hist[i].v / lastV;
      var date = new Date(hist[i].d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
      tip.innerHTML = '<span>' + esc(date) + '</span><b>' + (priv() ? '•••' : esc(fmtLike(hero, val))) + '</b>';
      tip.style.left = px + 'px'; tip.style.top = py + 'px';
      bar.style.left = px + 'px'; bar.style.top = (r.top - cr.top) + 'px'; bar.style.height = r.height + 'px';
      card.classList.add('alive-hover');
    }
    svg.addEventListener('pointermove', show);
    svg.addEventListener('pointerdown', show);
    svg.addEventListener('pointerleave', function () { card.classList.remove('alive-hover'); });
  }

  /* ── D. Milestone shimmer — once a day, only on a real new high ──── */
  function milestone(root) {
    if (!isNewHigh() || reduce.matches) return;
    var today = new Date().toISOString().slice(0, 10);
    try { if (localStorage.getItem(profileKey(HIGH)) === today) return; localStorage.setItem(profileKey(HIGH), today); } catch (e) { return; }
    var card = root.querySelector('.nw-hero-card');
    if (!card) return;
    card.classList.add('alive-shimmer');
    setTimeout(function () { card.classList.remove('alive-shimmer'); }, 2600);
  }

  /* ── E. Tools chamber: countdown ring to the next expiry ─────────── */
  function expiryRing(root) {
    var c = root.querySelector('.chamber-card[data-ch="tools"] .chamber-card__icon');
    var ex = expiring();
    if (!c || !ex.length) return;
    var d = ex[0].days;
    c.classList.add('alive-countdown');
    c.style.setProperty('--alive-p', Math.round((1 - d / 60) * 100));
    c.style.setProperty('--due', d <= 14 ? '255 69 58' : d <= 30 ? '255 159 10' : '52 199 89');
    c.closest('.chamber-card').title = ex[0].name + ' expires in ' + d + ' day' + (d === 1 ? '' : 's');
  }

  function round2(root, first) {
    var hero = parseHero(root);
    awayStrip(root, hero);
    heroChart(root, hero);
    expiryRing(root);
    if (hero) {
      var text = hero.el.textContent.trim();
      if (!first && lastHero && lastHero !== text) roll(hero.el, text);
      lastHero = text;
    }
    if (first) milestone(root);
  }

  /* ── F. Lock screen: same light, breathing mark ──────────────────── */
  function lockGlow() {
    var lock = document.getElementById('pgLock');
    if (!lock || lock.querySelector(':scope > .alive-aurora')) return;
    var a = document.createElement('div');
    a.className = 'alive-aurora alive-aurora--lock';
    a.setAttribute('aria-hidden', 'true');
    a.innerHTML = '<i></i><i></i><i></i>';
    lock.insertBefore(a, lock.firstChild);
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
    var first = !entered && !!page.offsetParent;
    round2(root, first);
    if (first) {
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
  /* Re-arm entrance + "since you were away" each time the vault locks */
  new MutationObserver(function () {
    if (document.body.classList.contains('on-lock')) { entered = false; away = null; lastHero = null; }
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  function watch() {
    if (enabled()) { document.body.classList.add('alive'); lockGlow(); }
    var root = document.getElementById('dashBody');
    if (!root) return setTimeout(watch, 500);
    new MutationObserver(function () { clearTimeout(timer); timer = setTimeout(apply, 60); })
      .observe(root, { childList: true });
    apply();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();

  window.VCAlive = { apply: apply, on: function () { try { localStorage.setItem(KEY, '1'); } catch (e) {} apply(); }, off: function () { try { localStorage.setItem(KEY, '0'); } catch (e) {} document.body.classList.remove('alive'); } };
})();
