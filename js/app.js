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
async function App() {
  initSidebar();
  const splash = document.getElementById('splashScreen');
  const bar = document.getElementById('splashBar');
  if (splash) {
    setTimeout(() => { if (bar) bar.style.width = '100%'; }, 100);
    setTimeout(() => {
      splash.style.transition = 'opacity 0.4s ease';
      splash.style.opacity = '0';
      setTimeout(() => { splash.style.display = 'none'; }, 400);
    }, 1800);
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

  // Check if old localStorage data exists (migration)
  const oldData = Store.loadRaw();
  if (oldData) { Migrate.run(); }

  if (new URLSearchParams(location.search).get('demo') === '1') {
    localStorage.setItem('vo_active_profile', 'demo');
    localStorage.setItem('vo_used_demo', '1');
    localStorage.setItem('vo_demo_guide_pending', '1');
    if (typeof CapDemo !== 'undefined') {
      CapDemo.markActive();
      CapDemo.showBanner('vaultcap', '<strong>Demo mode</strong> — guided vault. Lock PIN: <strong>123456</strong> (6 digits).');
    }
  }

  await ensureDemoVaultReady();

  // Determine startup screen
  const hasVaultDB = await VaultDB.isInitialized();
  const hasOldData = !!oldData;
  const hasData    = hasVaultDB || hasOldData;
  // Reload prefs after demo seed (first-visit: prefs loaded before seed ran)
  const freshPrefs = Store.loadPrefs();

  if (!hasData || !(freshPrefs?.hasVault || prefs?.hasVault || oldData?.user?.name)) {
    document.getElementById('pgOnboard').style.display = 'flex';
    OB.init();
  } else {
    R.showHome();
  }
}

App();
