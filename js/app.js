// VaultCap — © 2026 Shamikh Ahmed. Source-available. See LICENSE.

/* → js/core/module-registry.js */

// ── Universal Entity Factory ──
function mkEntity(type, fields = {}) {
  return {
    id: fields.id || U.id(),
    type,
    createdAt: fields.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: fields.tags || [],
    linkedEntities: fields.linkedEntities || [],
    archived: fields.archived || false,
    favorite: fields.favorite || false,
    ...fields,
  };
}

// ── Tag Utilities ──
/* → js/core/tags.js */

/* → js/core/vault-relations.js */

/* → js/core/data-integrity.js */

/* → js/core/emergency.js */
/* → js/core/onboarding-wizard.js */
/* → js/core/vault-health.js */
/* → js/core/modal.js */
/* → js/core/activity.js */
/* → js/core/vault-utils.js */
/* → js/core/ios-interactions.js */
/* → js/core/nav-ui.js */
/* → js/core/smart-actions.js */
/* → js/core/workspace-security.js */
/* → js/core/demo-profiles.js */
/* → js/core/app-helpers.js */
// ===================== APP INIT =====================
function isFreshVaultInstall() {
  try {
    if (localStorage.getItem('vo_used_demo') === '1') return false;
    const profile = localStorage.getItem('vo_active_profile');
    if (profile && profile !== 'personal' && profile !== '') return false;
    const old = typeof Store !== 'undefined' && Store.loadRaw ? Store.loadRaw() : null;
    if (old && old.user && old.user.name) return false;
    if (old && ((Array.isArray(old.banks) && old.banks.length) || (Array.isArray(old.cards) && old.cards.length))) {
      return false;
    }
  } catch (_) {}
  return true;
}

function capMotionMs(name, fallback) {
  try {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const m = raw.match(/^([\d.]+)(ms|s)$/i);
    if (!m) return fallback;
    return m[2].toLowerCase() === 's' ? parseFloat(m[1]) * 1000 : parseFloat(m[1]);
  } catch (_) { return fallback; }
}

async function maybeWelcomeIntro(done, opts) {
  opts = opts || {};
  const shell = document.getElementById('welcomeIntro');
  const video = document.getElementById('welcomeIntroVideo');
  if (!shell || !video || typeof done !== 'function') { done(); return; }

  let introSeen = false;
  try { introSeen = localStorage.getItem('vc_intro_seen') === '1'; } catch (_) {}
  const demo = document.documentElement.hasAttribute('data-vc-demo');
  const skipAttr = document.documentElement.hasAttribute('data-vc-skip-splash');
  let demoUrl = false;
  try { demoUrl = new URLSearchParams(location.search).get('demo') === '1'; } catch (_) {}
  let webdriver = false;
  try { webdriver = !!navigator.webdriver; } catch (_) {}

  if (!opts.force) {
    if (introSeen || demo || demoUrl || skipAttr || webdriver || !isFreshVaultInstall()) {
      done();
      return;
    }
    try {
      if (typeof VaultDB !== 'undefined' && typeof VaultDB.isInitialized === 'function' && await VaultDB.isInitialized()) {
        done();
        return;
      }
    } catch (_) {}
  }

  try { localStorage.setItem('vc_intro_seen', '1'); } catch (_) {}

  shell.removeAttribute('hidden');
  let closed = false;
  let safetyTimer;
  let posterTimer;
  const leaveMs = capMotionMs('--cap-dur-slow', 600);

  const close = () => {
    if (closed) return;
    closed = true;
    clearTimeout(safetyTimer);
    clearTimeout(posterTimer);
    try { video.pause(); } catch (_) {}
    shell.style.pointerEvents = 'none';
    shell.classList.add('is-leaving');
    setTimeout(() => {
      shell.remove();
      done();
    }, leaveMs);
  };

  const skipBtn = document.getElementById('welcomeIntroSkip');
  const dismissIntro = () => { close(); };
  skipBtn?.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); dismissIntro(); });
  video.addEventListener('click', dismissIntro);
  shell.addEventListener('click', dismissIntro);
  video.addEventListener('ended', close, { once: true });
  const onKey = (e) => {
    if (e.key === 'Escape' || e.key === 'Enter') {
      close();
      window.removeEventListener('keydown', onKey);
    }
  };
  window.addEventListener('keydown', onKey);
  safetyTimer = setTimeout(close, 8000);

  let reduceMotion = false;
  try { reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (_) {}

  if (reduceMotion) {
    posterTimer = setTimeout(close, 1200);
    return;
  }

  video.src = 'assets/intro/welcome.mp4';
  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(() => { posterTimer = setTimeout(close, 1200); });
  }
}

function ensureWelcomeIntroShell() {
  if (document.getElementById('welcomeIntro')) return;
  const splash = document.getElementById('splashScreen');
  const shell = document.createElement('div');
  shell.id = 'welcomeIntro';
  shell.hidden = true;
  shell.setAttribute('aria-label', 'Welcome to VaultCap');
  shell.innerHTML =
    '<video id="welcomeIntroVideo" muted playsinline preload="none" poster="assets/intro/welcome-poster.jpg"></video>' +
    '<button id="welcomeIntroSkip" type="button">Skip</button>';
  if (splash && splash.parentNode) splash.parentNode.insertBefore(shell, splash.nextSibling);
  else document.body.appendChild(shell);
}

window.VCWelcomeIntro = {
  replay() {
    try { localStorage.removeItem('vc_intro_seen'); } catch (_) {}
    ensureWelcomeIntroShell();
    maybeWelcomeIntro(() => {}, { force: true });
  },
};

async function App() {
  // Sidebar chrome lives in the deferred app chunk — init on unlock via R.unlock.
  if (typeof initSidebar === 'function') initSidebar();
  const splash = document.getElementById('splashScreen');
  const bar = document.getElementById('splashBar');
  const demoRequested = new URLSearchParams(location.search).get('demo') === '1';
  let splashSeen = false;
  try { splashSeen = sessionStorage.getItem('vc_splash_seen') === '1'; } catch (_) {}
  // Fleet: splash first-launch ≤200ms; demo / seen / reduced-motion skip for LCP.
  let reduceMotion = false;
  try { reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (_) {}
  const skipSplash = !splash || splashSeen || demoRequested || reduceMotion || document.documentElement.hasAttribute('data-vc-demo');
  const markAppReady = () => {
    try {
      window.__APP_READY__ = true;
      document.documentElement.dataset.appReady = 'true';
    } catch (_) {}
  };
  const finishBootSplash = () => { void maybeWelcomeIntro(markAppReady); };
  if (skipSplash) {
    if (splash) splash.style.display = 'none';
    finishBootSplash();
  } else {
    let splashFillTimer;
    let splashHoldTimer;
    let splashLeaveTimer;
    let splashDismissed = false;
    const dismissSplash = () => {
      if (splashDismissed) return;
      splashDismissed = true;
      clearTimeout(splashFillTimer);
      clearTimeout(splashHoldTimer);
      clearTimeout(splashLeaveTimer);
      splash.style.display = 'none';
      finishBootSplash();
      window.removeEventListener('pointerdown', dismissSplash);
      window.removeEventListener('keydown', dismissSplash);
    };
    try { sessionStorage.setItem('vc_splash_seen', '1'); } catch (_) {}
    window.addEventListener('pointerdown', dismissSplash, { once: true, passive: true });
    window.addEventListener('keydown', dismissSplash, { once: true, passive: true });
    // Halo splash: Cap kit durations (fast → fill, slow → hold, base → leave). First launch per session only.
    const fillDelay = capMotionMs('--cap-dur-fast', 150);
    const hold = capMotionMs('--cap-dur-slow', 600);
    const leave = capMotionMs('--cap-dur-base', 280);
    splashFillTimer = setTimeout(() => { if (bar) bar.style.width = '100%'; }, Math.min(40, fillDelay));
    splashHoldTimer = setTimeout(() => {
      splash.classList.add('is-leaving');
      splashLeaveTimer = setTimeout(dismissSplash, leave);
    }, hold);
  }

  document.addEventListener('click', function(e) {
    const ni = e.target.closest('[data-pg]');
    if (ni && ni.dataset.pg) R.goto(ni.dataset.pg);
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      const ni = e.target.closest('[data-pg]');
      if (ni && ni.dataset.pg) { e.preventDefault(); R.goto(ni.dataset.pg); }
    }
  });

  document.addEventListener('keydown', function(e) {
    if (S.unlocked) return;
    const lk = document.getElementById('pgLock');
    if (!lk || lk.style.display === 'none') return;
    if (e.key >= '0' && e.key <= '9') { e.preventDefault(); PIN.in(e.key); }
    else if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); PIN.del(); }
    else if (e.key === 'Enter') { e.preventDefault(); }
    else if (e.key === 'Escape') { PIN.reset(); }
  });

  document.addEventListener('keydown', function(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); if (S.unlocked) CMD.open(); }
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') { e.preventDefault(); if (S.unlocked) FAB.toggle(); }
    if ((e.metaKey || e.ctrlKey) && e.key === 'l') { e.preventDefault(); if (S.unlocked) R.lock(); }
    if ((e.metaKey || e.ctrlKey) && e.key === 'f') { e.preventDefault(); if (S.unlocked) { R.goto('search'); setTimeout(() => document.getElementById('gs-input')?.focus(), 200); } }
    if ((e.metaKey || e.ctrlKey) && e.key === '1') { e.preventDefault(); if (S.unlocked) R.goto('dashboard'); }
    if ((e.metaKey || e.ctrlKey) && e.key === '2') { e.preventDefault(); if (S.unlocked) R.goto('banks'); }
    if ((e.metaKey || e.ctrlKey) && e.key === '3') { e.preventDefault(); if (S.unlocked) R.goto('cards'); }
    if (e.key === 'Escape') { CMD.close(); Modal.close(); FAB.close(); ThemeEngine.closePicker(); }
    if (e.key === '?' && !e.metaKey && !e.ctrlKey && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') { e.preventDefault(); if (S.unlocked) CMD.showHelp(); }
  });

  // Auto-lock on tab/window hide; blur screenshot on hide
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      document.body.classList.add('app-blur');
      if (S.unlocked && S.autoLock) { R.lock(); }
    } else {
      document.body.classList.remove('app-blur');
    }
  });

  window.addEventListener('online',  function() { document.getElementById('offBar').classList.remove('on'); });
  window.addEventListener('offline', function() { document.getElementById('offBar').classList.add('on'); });
  if (!navigator.onLine) document.getElementById('offBar').classList.add('on');

  document.querySelectorAll('.key').forEach(function(k) {
    k.addEventListener('click', function() { if (navigator.vibrate) navigator.vibrate(6); });
  });

  try {
    const fc = typeof LockoutStore !== 'undefined' ? LockoutStore.load() : null;
    if (fc) {
      S.fails = fc.fails || 0;
      S.lockedUntil = fc.lockedUntil || 0;
    }
  } catch(e) {}

  // Load non-sensitive prefs for startup display (theme, font scale)
  const prefs = Store.loadPrefs();
  if (prefs) {
    if (prefs.theme)       S.user.theme    = prefs.theme;
    if (prefs.fontScale)   S.fontScale     = prefs.fontScale;
    if (prefs.highContrast) S.highContrast = prefs.highContrast;
    if (prefs.reduceMotion) S.reduceMotion = prefs.reduceMotion;
    if (prefs.largeText) S.largeText = prefs.largeText;
    if (prefs.name)        S.user.name     = prefs.name;
  }
  if (S.user.onboardingComplete && !S.user.setupProgress) {
    S.user.setupProgress = { pinSet: true, recoveryAck: true, profileDone: true };
  }

  const startTheme = normalizeVaultTheme(S.user.theme || 'dark');
  S.user.theme = startTheme;
  ThemeEngine.apply(startTheme);
  const fs = S.fontScale || 'md';
  // Preserve theme class when adding font-scale; ThemeEngine.apply already preserves them on re-apply
  if (!document.body.className.includes('fs-')) {
    document.body.className = document.body.className.trim() + ' fs-' + fs;
  }
  if (S.highContrast && !document.body.classList.contains('hc')) document.body.classList.add('hc');
  if (S.largeText) applyLargeText(true);
  if (S.reduceMotion) applyReduceMotion(true);

  // Check if old localStorage data exists (Migrate lives in app chunk — never block home paint)
  const oldData = Store.loadRaw();
  function runMigrateIfNeeded() {
    if (!oldData || typeof Migrate === 'undefined') return;
    try { Migrate.run(); } catch (e) { /* unlock path retries */ }
  }
  if (oldData && typeof Migrate !== 'undefined') {
    runMigrateIfNeeded();
  } else if (oldData && typeof VaultLazy !== 'undefined') {
    VaultLazy.ensure('app').then(runMigrateIfNeeded).catch(function () {});
  }

  if (demoRequested) {
    localStorage.setItem('vo_active_profile', 'demo');
    localStorage.setItem('vo_used_demo', '1');
    localStorage.setItem('vo_demo_guide_pending', '1');
    if (typeof CapDemo !== 'undefined') {
      CapDemo.markActive();
      // Banner after LCP/CLS window — early banner caused ~0.5 CLS
      setTimeout(function () {
        CapDemo.showBanner('vaultcap', '<strong>Demo mode</strong> — guided vault. Lock PIN: <strong>123456</strong> (6 digits).');
      }, 5000);
    }
  }

  const isDemoProfile = typeof VaultProfiles !== 'undefined' && VaultProfiles.active() === 'demo';

  // Paint shell from sync hints before IndexedDB (cuts LCP render-delay).
  const prefsHasVault = !!(prefs && prefs.hasVault);
  const paintHome = isDemoProfile || prefsHasVault || !!(oldData && oldData.user && oldData.user.name);
  if (paintHome) {
    R.showHome();
  } else {
    document.getElementById('pgOnboard').style.display = 'flex';
    if (typeof OB === 'undefined' && typeof VaultLazy !== 'undefined') {
      try { await VaultLazy.ensure('app'); } catch (e) { /* show empty onboard chrome */ }
    }
    if (typeof OB !== 'undefined') OB.init();
  }

  const demoPrep = isDemoProfile && typeof ensureDemoVaultReady === 'function'
    ? ensureDemoVaultReady()
    : Promise.resolve();

  const hasVaultDB = await VaultDB.isInitialized();
  const hasOldData = !!oldData;
  const hasData = hasVaultDB || hasOldData || isDemoProfile;
  const freshPrefs = Store.loadPrefs();
  const shouldHome = hasData && !!(freshPrefs?.hasVault || prefs?.hasVault || oldData?.user?.name || isDemoProfile);
  if (shouldHome && !paintHome) {
    document.getElementById('pgOnboard').style.display = 'none';
    R.showHome();
  } else if (!shouldHome && paintHome) {
    document.getElementById('pgHome').style.display = 'none';
    document.getElementById('pgOnboard').style.display = 'flex';
    if (typeof OB === 'undefined' && typeof VaultLazy !== 'undefined') {
      try { await VaultLazy.ensure('app'); } catch (e) { /* show empty onboard chrome */ }
    }
    if (typeof OB !== 'undefined') OB.init();
  }

  if (isDemoProfile) {
    demoPrep.catch(function () { /* unlockDemoVaultWithPin reseeds */ });
  }
}

App();
