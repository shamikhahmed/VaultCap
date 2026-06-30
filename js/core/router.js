'use strict';
// ===================== ROUTER =====================
const R = {
  showProfilePicker() {
    if (VaultProfiles.active() === 'personal' && !VaultProfiles.isDevMode()) {
      this.showLock();
      return;
    }
    ['pgHome', 'pgLock', 'pgOnboard', 'app'].forEach(id => { const e = document.getElementById(id); if (e) e.style.display = 'none'; });
    const pp = document.getElementById('pgProfilePicker');
    if (!pp) { this.showLock(); return; }
    const active = VaultProfiles.active();
    const ppCards = document.getElementById('ppCards');
    if (ppCards) {
      ppCards.innerHTML =
        '<div onclick="R._pickProfile(\'personal\')" style="display:flex;align-items:center;gap:14px;padding:18px;background:' + (active === 'personal' ? 'rgba(123,95,255,.12)' : 'var(--glass)') + ';border:1.5px solid ' + (active === 'personal' ? 'rgba(123,95,255,.5)' : 'var(--border)') + ';border-radius:16px;cursor:pointer;touch-action:manipulation">' +
        '<div style="font-size:34px">🔐</div><div style="flex:1"><div style="font-size:15px;font-weight:700;color:var(--text)">My Vault</div><div style="font-size:12px;color:var(--text3)">Your private encrypted vault</div></div><div style="font-size:20px;color:var(--text3)">›</div></div>' +
        '<button type="button" onclick="VaultProfiles.startDemo()" style="width:100%;margin-top:10px;padding:14px;background:var(--glass);border:1px solid var(--border);border-radius:14px;color:var(--text2);font-size:13px;font-weight:600;cursor:pointer;touch-action:manipulation">🎭 New here? Take the guided demo →</button>' +
        (VaultProfiles.isDevMode() ? '<div onclick="R._pickProfile(\'test\')" style="display:flex;align-items:center;gap:14px;padding:14px;background:var(--glass);border:1px solid var(--border);border-radius:14px;cursor:pointer;margin-top:8px"><div style="font-size:24px">🧪</div><div style="flex:1"><div style="font-size:13px;font-weight:700">Test Sandbox</div><div style="font-size:11px;color:var(--text3)">Developer only</div></div></div>' : '');
    }
    pp.style.display = 'flex';
  },
  _pickProfile(profileId) {
    if (profileId !== VaultProfiles.active()) {
      VaultProfiles.switch(profileId);
    } else {
      const pp = document.getElementById('pgProfilePicker');
      if (pp) pp.style.display = 'none';
      R.showLock();
    }
  },
  showLock() {
    ['pgHome', 'pgOnboard', 'app', 'pgProfilePicker'].forEach(id => { const e = document.getElementById(id); if (e) e.style.display = 'none'; });
    const lk = document.getElementById('pgLock');
    lk.style.display = 'flex';
    PIN.reset();
    this.startClock();
    const sub = document.getElementById('lkSub');
    if (sub) {
      if (VaultProfiles.isDemo()) sub.textContent = 'Demo vault · PIN ' + VaultProfiles.DEMO_PIN;
      else if (S.user.name) sub.textContent = 'Welcome back, ' + S.user.name;
      else sub.textContent = 'Enter your 6-digit PIN';
    }
    const sp = document.getElementById('switchProfileBtn');
    if (sp) sp.style.display = (VaultProfiles.isDemo() || VaultProfiles.isDevMode() || localStorage.getItem('vo_used_demo') === '1') ? '' : 'none';
    const fp = document.getElementById('forgotPinLink');
    if (fp) fp.style.display = VaultProfiles.isDemo() ? 'none' : 'none';
    ThemeEngine.renderDots();
  },
  showHome() {
    ['pgLock', 'pgOnboard', 'app'].forEach(id => { const e = document.getElementById(id); if (e) e.style.display = 'none'; });
    document.getElementById('pgHome').style.display = 'flex';
    const hw = document.getElementById('hWelcome');
    if (hw && S.user.name) hw.textContent = `Welcome back, ${S.user.name}! 👋`;
    ThemeEngine.renderDots();
    setTimeout(() => Emergency.updateLockscreenButton(), 200);
  },
  unlock() {
    // Run live family migration if S.familyMembers is missing but S.family has data
    if ((!S.familyMembers || !S.familyMembers.length) && S.family) {
      const _fLive = S.family;
      if ((_fLive.head && _fLive.head.name) || (_fLive.members && _fLive.members.length)) {
        try { Migrate._runFamilyV13(S); Store.save(); } catch(e) {}
      }
    }
    S.unlocked = true; S.decoy = false;
    window._vosUnlocked = true;
    ['pgLock', 'pgHome', 'pgOnboard'].forEach(id => { const e = document.getElementById(id); if (e) e.style.display = 'none'; });
    const fp = document.getElementById('forgotPinLink'); if (fp) fp.style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    document.getElementById('fab').style.display = 'flex';
    buildNav();
    this.goto('dashboard');
    setTimeout(() => Dash.render(), 50);
    Activity.log('Vault unlocked');
    if (typeof RatesEngine !== 'undefined') {
      RatesEngine.init().then(() => {
        if (S.currentPage === 'dashboard' && typeof Dash !== 'undefined') Dash.render();
      });
    }
    setTimeout(() => {
      const dashPb = document.getElementById('dashBody');
      if (dashPb) pullToRefresh(dashPb, () => Dash.render());
    }, 500);
    setTimeout(() => {
      if (typeof DataIntegrity !== 'undefined') {
        const r = DataIntegrity.check();
        const issues = r.highCount + r.posCount;
        if (issues > 0) Toast.show(`🔍 Vault scan: ${issues} issue(s) found — check Integrity in Settings`, 'warn', 5000);
      }
    }, 2000);
    setTimeout(() => {
      if (typeof VaultRecovery !== 'undefined') VaultRecovery.check();
    }, 1500);
    setTimeout(() => {
      if (typeof VaultSafety !== 'undefined') VaultSafety.maybeOfferRestore();
    }, 2200);
    if (VaultProfiles.isDemo() && localStorage.getItem('vo_demo_guide_pending') === '1') {
      setTimeout(() => VaultProfiles.showDemoGuide(), 500);
      localStorage.removeItem('vo_demo_guide_pending');
    }
    setTimeout(() => {
      if (typeof Reminders !== 'undefined' && Reminders.checkAndNotify) Reminders.checkAndNotify();
    }, 2500);
    setTimeout(() => {
      if (!window._backupPrompted) {
        window._backupPrompted = true;
        const _lb = S.user?.lastBackup ? new Date(S.user.lastBackup) : null;
        const _days = _lb ? Math.floor((Date.now() - _lb) / (1000*60*60*24)) : 999;
        if (_days > 14 && !VaultProfiles.isDemo()) {
          Toast.show(
            _days >= 999
              ? '⚠️ You have never backed up your vault. <button type="button" class="cpbtn" onclick="ExIm.export(\'vos\')">Backup Now</button>'
              : `⚠️ Last backup was ${_days} days ago. <button type="button" class="cpbtn" onclick="ExIm.export(\'vos\')">Backup Now</button>`,
            'warn', 8000
          );
        }
      }
    }, 3000);
    // Auto-purge trash items older than 30 days
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const before = (S.trash||[]).length;
    S.trash = (S.trash||[]).filter(item => new Date(item.deletedAt).getTime() > cutoff);
    if (S.trash.length < before) Store.save();
    if (S.autoLock) this.resetTimer();
    setTimeout(() => WhatsNew.check(), 800);
    // OB (index.html inline onboarding) is the active system; Onboarding overlay is retired.
    if (S._clockTimer) clearInterval(S._clockTimer);
  },
  lock() {
    const finishLock = () => {
      S.unlocked = false; clearTimeout(S._timer);
      S._bankFilterInit = false;
      VaultDB.sessionKey = null;
      if (navigator.vibrate) navigator.vibrate(50);
      document.getElementById('app').style.display = 'none';
      document.getElementById('fab').style.display = 'none';
      Modal.close();
      Store._saveWidgetSnapshot();
      this.showLock();
      Activity.log('Vault locked');
    };
    Store.flush().then(finishLock).catch(finishLock);
  },
  goto(pg, force = false) {
    if (pg === 'ai-import') pg = 'import';
    const alias = PAGE_ALIASES[pg];
    if (alias) {
      S.aF = alias.filter;
      pg = alias.target;
    }
    updatePageChrome(pg);
    const prev = S.currentPage;
    // Save scroll position for the page we're leaving
    window._scrollCache = window._scrollCache || {};
    if (prev && prev !== pg) {
      const prevEl = document.getElementById('pg-' + prev);
      const prevPb = prevEl?.querySelector('.pb');
      if (prevPb) window._scrollCache[prev] = prevPb.scrollTop;
    }
    S.currentPage = pg;
    document.title = (pg.charAt(0).toUpperCase() + pg.slice(1).replace(/-/g, ' ')) + ' — VaultCap';
    document.querySelectorAll('.page').forEach(p => {
      p.classList.remove('on');
      p.style.opacity = '';
      p.style.transform = '';
      p.style.transition = '';
    });
    const el = document.getElementById('pg-' + pg);
    if (el) {
      el.classList.add('on');
      const pb = el.querySelector('.pb');
      if (isFastNavigation()) {
        el.style.opacity = '';
        el.style.transform = '';
        el.style.transition = '';
        if (pb) pb.scrollTop = window._scrollCache?.[pg] || 0;
      } else {
        el.style.opacity = '0';
        el.style.transform = 'translateY(8px)';
        requestAnimationFrame(() => {
          el.style.transition = 'opacity var(--anim-fast,140ms) var(--ease-smooth,ease), transform var(--anim-fast,140ms) var(--ease-smooth,ease)';
          el.style.opacity = '1';
          el.style.transform = 'none';
          if (pb) pb.scrollTop = window._scrollCache?.[pg] || 0;
        });
      }
    }
    document.querySelectorAll('.ni,[data-pg]').forEach(n => n.classList.toggle('on', n.dataset.pg === pg));
    if (prev === pg && !force) return;
    const renders = {
      dashboard:   () => Dash.render(),
      banks:       () => { const t=Date.now(); Banks.render(); if(typeof DevDiag!=='undefined')DevDiag.trackRender('banks',Date.now()-t); },
      cards:       () => { const t=Date.now(); Cards.render(); if(typeof DevDiag!=='undefined')DevDiag.trackRender('cards',Date.now()-t); },
      investments: () => { const t=Date.now(); Inv.render(); if(typeof DevDiag!=='undefined')DevDiag.trackRender('investments',Date.now()-t); },
      cash:        () => Cash.render(),
      loans:       () => { const t=Date.now(); Loans.render(); if(typeof DevDiag!=='undefined')DevDiag.trackRender('loans',Date.now()-t); },
      friends:     () => { const t=Date.now(); Friends.render(); if(typeof DevDiag!=='undefined')DevDiag.trackRender('friends',Date.now()-t); },
      sims:        () => Sims.render(),
      assets:      () => Assets.render(),
      expenses:    () => Exp.render(),
      emails:      () => Emails.render(),
      gadgets:     () => Assets.render(),
      digital:     () => Digital.render(),
      alerts:      () => renderAlerts(),
      documents:   () => { const t=Date.now(); DocsModule.render(); if(typeof DevDiag!=='undefined')DevDiag.trackRender('documents',Date.now()-t); },
      search:      () => GlobalSearch.render(),
      import:      () => {
        VaultLazy.ensure('llm').then(() => {
          if (typeof AIImport !== 'undefined') AIImport.render();
          else if (typeof ImportEngine !== 'undefined') ImportEngine.render();
        }).catch(() => Toast.show('Import tools failed to load', 'error'));
      },
      timeline:    () => Timeline.render(),
      security:    () => SecurityCenter.render(),
      backup:      () => BackupCenter.render(),
      recovery:    () => RecoveryCenter.render(),
      workspace:   () => WorkspaceManager.render(),
      vehicles:    () => Assets.render(),
      reminders:   () => Reminders.render(),
      'ai-import': () => R.goto('import'),
      'trash':     () => { if (typeof Trash !== 'undefined') Trash.render(); },
      emergency:   () => Emergency.render(),
      'recovery-center': () => { if (typeof VaultHealthCenter !== 'undefined') VaultHealthCenter.render(); },
      'help':      () => { if (typeof HelpCenter !== 'undefined') HelpCenter.render(); },
      currency:    () => { if (typeof Currency !== 'undefined') Currency.render(); },
      gold:        () => Assets.render(),
      bc:          () => { if (typeof BCModule !== 'undefined') BCModule.render(); },
      bonds:       () => { if (typeof BondsModule !== 'undefined') BondsModule.render(); },
      zakat:       () => { if (typeof Zakat !== 'undefined') Zakat.render(); },
      credit:      () => { if (typeof CreditScore !== 'undefined') CreditScore.render(); },
      tax:         () => { if (typeof Tax !== 'undefined') Tax.render(); },
      family:      () => { if (typeof Family !== 'undefined') Family.render(); },
      sync:        () => { if (typeof QRSync !== 'undefined') QRSync.renderPage(); else { const el = document.getElementById('syncBody'); if (el) el.innerHTML = '<div class="empty"><div class="empty-ic">🔄</div><h3>Sync</h3><p>Loading…</p></div>'; } },
      settings:    () => {
        buildNav();
        buildSettTabs();
        if (typeof SettingsNav !== 'undefined') {
          setTimeout(() => { SettingsNav.show(SettingsNav.current || 'profile'); if (typeof SelfCheck !== 'undefined') SelfCheck.run(); }, 50);
        } else if (typeof Settings !== 'undefined' && Settings.refresh) {
          Settings.refresh();
        }
      },
      'finance-home': () => renderFinanceHome(),
      'vault-home':   () => renderVaultHome(),
      'assets-home':  () => renderAssetsHome(),
    };
    if (renders[pg]) renders[pg]();
    if (prev !== pg) buildNav();
    // Pull-to-refresh on module page bodies
    const ptrMap = {banks:'bList',cards:'cItems',investments:'invItems',cash:'cashItems',loans:'loanItems',sims:'simItems',assets:'aItems',expenses:'expItems',emails:'emailItems',gadgets:'gItems',digital:'digItems',friends:'friendItems',documents:'docsItems',vehicles:'vItems'};
    if (ptrMap[pg]) {
      const ptrEl = document.getElementById(ptrMap[pg])?.closest('.pb') || document.getElementById('pg-'+pg)?.querySelector('.pb');
      if (ptrEl && typeof pullToRefresh === 'function') pullToRefresh(ptrEl, () => { if (renders[pg]) renders[pg](); });
    }
    // Wire debounced search inputs
    if (typeof _wireSearchDebounce === 'function') setTimeout(_wireSearchDebounce, 100);
  },
  resetTimer() {
    clearTimeout(S._timer);
    if (!S.lockMins) return;
    S._timer = setTimeout(() => {
      if (S.unlocked) { this.lock(); Toast.show('Auto-locked', 'warning'); }
    }, S.lockMins * 60000);
  },
  startClock() {
    const upd = () => {
      const n  = new Date();
      const cl = document.getElementById('lkClock');
      const dt = document.getElementById('lkDate');
      if (cl) cl.textContent = String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0');
      if (dt) dt.textContent = n.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' });
    };
    upd();
    if (S._clockTimer) clearInterval(S._clockTimer);
    S._clockTimer = setInterval(upd, 10000);
  }
};

const UTILITY_PAGES = new Set([
  'settings', 'import', 'ai-import', 'help', 'search', 'timeline', 'security', 'backup',
  'recovery', 'recovery-center', 'sync', 'trash', 'emergency', 'workspace', 'alerts', 'reminders',
]);

const PAGE_ALIASES = {
  gadgets:  { target: 'assets', filter: 'electronics' },
  vehicles: { target: 'assets', filter: 'vehicle' },
  gold:     { target: 'assets', filter: 'precious_metals' },
};

function isFastNavigation() {
  return document.body.getAttribute('data-cap-app') === '1'
    || document.body.classList.contains('reduce-motion')
    || !!S.reduceMotion;
}

function updatePageChrome(pg) {
  const hideTabs = UTILITY_PAGES.has(pg);
  document.body.classList.toggle('hide-btabs', hideTabs);
  const fab = document.getElementById('fab');
  if (fab && S.unlocked) fab.style.display = (hideTabs || pg === 'dashboard') ? 'none' : '';
}

window.resetScroll = function(pageId) {
  const pid = pageId || (typeof S !== 'undefined' ? S.currentPage : null);
  if (window._scrollCache && pid) window._scrollCache[pid] = 0;
  const el = pid ? document.getElementById('pg-' + pid) : null;
  const pb = el?.querySelector('.pb');
  if (pb) pb.scrollTop = 0;
};
