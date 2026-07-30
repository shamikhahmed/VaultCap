'use strict';
/* openMoneySheet, openAssetsSheet, openIdentitySheet, openMore, closeMore, togglePrivacy, toggleSidebar, initSidebar, buildSettTabs, getTabPrefs, saveTabPrefs, renderFinanceHome, renderVaultHome, renderAssetsHome, buildNav, patchNavActiveState */

function moneySheetTile(m) {
  const cnt = typeof ContextSwitcher !== 'undefined' ? ContextSwitcher.filter(S[m.id]||[]).length : (S[m.id]||[]).length;
  const badge = cnt > 0 ? '<div style="font-size:9px;color:var(--text3);margin-top:1px">'+cnt+'</div>' : '';
  return '<div data-act="ActHelpers.closeSheetGoto(\'moneySheet\',\''+m.id+'\')" style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:12px 8px;cursor:pointer;touch-action:manipulation;display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center"><div class="vc-icon-wrap vc-icon-wrap--sheet">'+VC.modIcon(m,22)+'</div><div style="font-size:11px;font-weight:600;color:var(--text);line-height:1.2">'+m.n+'</div>'+badge+'</div>';
}

function openMoneySheet() {
  document.getElementById('moneySheet')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'moneySheet';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.5);display:flex;align-items:flex-end';
  const ctx = typeof ContextSwitcher !== 'undefined' ? ContextSwitcher.get() : 'ALL';
  const ctxLabel = (ctx && ctx !== 'ALL') ? (' · ' + ctx) : '';
  // Banking = liquid accounts & payment rails; Cashflow = obligations & money in/out
  const banking = [
    {id:'banks',ic:'bank',n:'Banks'},
    {id:'cards',ic:'card',n:'Cards'},
    {id:'cash',ic:'banknote',n:'Cash'},
  ].filter(m => isModOn(m.id));
  const cashflow = [
    {id:'loans',ic:'handshake',n:'Loans'},
    {id:'expenses',ic:'repeat',n:'Expenses'},
    {id:'bc',ic:'refresh-cw',n:'Committees'},
  ].filter(m => isModOn(m.id));
  const section = (label, items) => !items.length ? '' :
    '<div style="font-size:12px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin:12px 0 8px">'+label+'</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">'+items.map(moneySheetTile).join('')+'</div>';
  const body = (banking.length || cashflow.length)
    ? section('Banking', banking) + section('Cashflow', cashflow)
    : '<div style="text-align:center;padding:16px 8px"><div style="font-size:13px;color:var(--text2);margin-bottom:12px">No money modules enabled.</div><button type="button" class="btn btn-p btn-sm" data-act="ActHelpers.closeSheetGotoModules(\'moneySheet\')">Enable in Settings →</button></div>';
  overlay.innerHTML = '<div style="background:var(--bg);width:100%;border-radius:20px 20px 0 0;padding:12px 16px calc(env(safe-area-inset-bottom,0) + 16px)">' +
    '<div style="width:36px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 16px"></div>' +
    '<div style="font-size:13px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Money' + ctxLabel + '</div>' +
    body + '</div>';
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}
window.openMoneySheet = openMoneySheet;

function openAssetsSheet() {
  document.getElementById('assetsSheet')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'assetsSheet';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.5);display:flex;align-items:flex-end';
  const ctx = typeof ContextSwitcher !== 'undefined' ? ContextSwitcher.get() : 'ALL';
  const ctxLabel = (ctx && ctx !== 'ALL') ? (' · ' + ctx) : '';
  // Wealth = holdings (vehicles/metals/gadgets live under Property — no duplicate tiles)
  const items = [
    {id:'investments',ic:'trending-up',n:'Investments'},
    {id:'bonds',ic:'ticket',n:'Bonds'},
    {id:'assets',ic:'layers',n:'Property'},
  ].filter(m => isModOn(m.id));
  overlay.innerHTML = '<div style="background:var(--bg);width:100%;border-radius:20px 20px 0 0;padding:12px 16px calc(env(safe-area-inset-bottom,0) + 16px)">' +
    '<div style="width:36px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 16px"></div>' +
    '<div style="font-size:13px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">Wealth' + ctxLabel + '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px">' +
    (items.length ? items.map(m => {
      const cnt = typeof ContextSwitcher !== 'undefined' ? ContextSwitcher.filter(S[m.id]||[]).length : (S[m.id]||[]).length;
      const badge = cnt > 0 ? '<div style="font-size:9px;color:var(--text3);margin-top:1px">'+cnt+'</div>' : '';
      return '<div data-act="ActHelpers.closeSheetGoto(\'assetsSheet\',\''+m.id+'\')" style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:12px 8px;cursor:pointer;touch-action:manipulation;display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center"><div class="vc-icon-wrap vc-icon-wrap--sheet">'+VC.modIcon(m,22)+'</div><div style="font-size:11px;font-weight:600;color:var(--text);line-height:1.2">'+m.n+'</div>'+badge+'</div>';
    }).join('') : '<div style="grid-column:1/-1;text-align:center;padding:16px 8px"><div style="font-size:13px;color:var(--text2);margin-bottom:12px">No wealth modules enabled.</div><button type="button" class="btn btn-p btn-sm" data-act="ActHelpers.closeSheetGotoModules(\'assetsSheet\')">Enable in Settings →</button></div>') +
    '</div></div>';
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}
window.openAssetsSheet = openAssetsSheet;

function openIdentitySheet() {
  document.getElementById('identitySheet')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'identitySheet';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.5);display:flex;align-items:flex-end';
  const ctx = typeof ContextSwitcher !== 'undefined' ? ContextSwitcher.get() : 'ALL';
  const ctxLabel = (ctx && ctx !== 'ALL') ? (' · ' + ctx) : '';
  const items = [
    {id:'documents',ic:'id-card',n:'Documents'},
    {id:'sims',ic:'smartphone',n:'SIM Cards'},
    {id:'emails',ic:'mail',n:'Emails'},
    {id:'digital',ic:'key',n:'Digital'},
    {id:'friends',ic:'user',n:'Contacts'},
  ].filter(m => isModOn(m.id));
  overlay.innerHTML = '<div style="background:var(--bg);width:100%;border-radius:20px 20px 0 0;padding:12px 16px calc(env(safe-area-inset-bottom,0) + 16px)">' +
    '<div style="width:36px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 16px"></div>' +
    '<div style="font-size:13px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">Identity' + ctxLabel + '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px">' +
    (items.length ? items.map(m => {
      const cnt = typeof ContextSwitcher !== 'undefined' ? ContextSwitcher.filter(S[m.id]||[]).length : (S[m.id]||[]).length;
      const badge = cnt > 0 ? '<div style="font-size:9px;color:var(--text3);margin-top:1px">'+cnt+'</div>' : '';
      return '<div data-act="ActHelpers.closeSheetGoto(\'identitySheet\',\''+m.id+'\')" style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:12px 8px;cursor:pointer;touch-action:manipulation;display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center"><div class="vc-icon-wrap vc-icon-wrap--sheet">'+VC.modIcon(m,22)+'</div><div style="font-size:11px;font-weight:600;color:var(--text);line-height:1.2">'+m.n+'</div>'+badge+'</div>';
    }).join('') : '<div style="grid-column:1/-1;text-align:center;padding:16px 8px"><div style="font-size:13px;color:var(--text2);margin-bottom:12px">No identity modules enabled.</div><button type="button" class="btn btn-p btn-sm" data-act="ActHelpers.closeSheetGotoModules(\'identitySheet\')">Enable in Settings →</button></div>') +
    '</div></div>';
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}
window.openIdentitySheet = openIdentitySheet;

function moreItemIcon(id, size = 22) {
  const extra = { search: 'search', backup: 'share', security: 'shield', settings: 'settings', help: 'book' };
  if (extra[id]) return VC.icon(extra[id], size);
  const mod = ALL_MODULES.find((x) => x.id === id);
  return mod ? VC.modIcon(mod, size) : VC.icon('list', size);
}

function openMore() {
  document.getElementById('moreOverlay')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'moreOverlay';
  // Header outside scroll — never slides under status bar / Dynamic Island
  overlay.style.cssText = 'position:fixed;inset:0;z-index:500;display:flex;flex-direction:column;background:var(--bg);';
  const vis = id => id === 'dashboard' || id === 'search' || id === 'settings' || id === 'backup' || id === 'security' || id === 'help' || isModOn(id);
  const navGroups = [
    { label:'Home', items:[
      {id:'dashboard',n:'Dashboard'},{id:'family',n:'Family Vault'},
    ].filter(m => m.id === 'dashboard' || vis(m.id))},
    { label:'Banking', items:[
      {id:'banks',n:'Banks'},{id:'cards',n:'Cards'},{id:'cash',n:'Cash'},
    ].filter(m => vis(m.id))},
    { label:'Wealth', items:[
      {id:'investments',n:'Investments'},{id:'bonds',n:'Bonds'},{id:'assets',n:'Property'},
    ].filter(m => vis(m.id))},
    { label:'Cashflow', items:[
      {id:'loans',n:'Loans'},{id:'expenses',n:'Expenses'},{id:'bc',n:'Committees'},
    ].filter(m => vis(m.id))},
    { label:'Identity', items:[
      {id:'documents',n:'Documents'},{id:'sims',n:'SIM Cards'},{id:'emails',n:'Emails'},
      {id:'digital',n:'Digital'},{id:'friends',n:'Contacts'},
    ].filter(m => vis(m.id))},
    { label:'Planning', items:[
      {id:'zakat',n:'Zakat'},{id:'tax',n:'Tax'},{id:'credit',n:'Credit Score'},{id:'currency',n:'Currency'},
    ].filter(m => vis(m.id))},
    { label:'Tools', items:[
      {id:'import',n:'Smart Import'},{id:'reminders',n:'Reminders'},{id:'alerts',n:'Alerts'},
      {id:'timeline',n:'Timeline'},{id:'search',n:'Search'},{id:'trash',n:'Trash'},
    ].filter(m => vis(m.id))},
    { label:'System', items:[
      {id:'settings',n:'Settings'},{id:'help',n:'Help'},
    ]},
  ].filter(g => g.items.length > 0);
  const bodyHtml = navGroups.map(group =>
    '<div style="padding:14px 16px 4px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);margin-bottom:8px">' + group.label + '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">' +
    group.items.map(m =>
      '<div data-act="ActHelpers.closeSheetGoto(\'moreOverlay\',\'' + m.id + '\')" style="background:var(--glass);border:1px solid var(--border);border-radius:12px;padding:12px 8px;cursor:pointer;touch-action:manipulation;display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center">' +
      '<div class="vc-icon-wrap vc-icon-wrap--sheet">' + moreItemIcon(m.id, 22) + '</div>' +
      '<div style="font-size:11px;font-weight:600;color:var(--text);line-height:1.2">' + m.n + '</div>' +
      '</div>'
    ).join('') +
    '</div></div>'
  ).join('') + '<div style="height:24px"></div>';
  overlay.innerHTML =
    '<div style="flex-shrink:0;display:flex;align-items:center;justify-content:space-between;padding:calc(env(safe-area-inset-top,0px) + 12px) 16px 12px;background:var(--bg);border-bottom:1px solid var(--border);z-index:2">' +
    '<div style="font-size:16px;font-weight:800;color:var(--text)">Vault</div>' +
    '<button type="button" data-act="ActHelpers.closeSheetGoto(\'moreOverlay\',\'\')" aria-label="Close" style="background:none;border:none;color:var(--text3);font-size:26px;cursor:pointer;touch-action:manipulation;line-height:1;min-width:44px;min-height:44px">×</button>' +
    '</div>' +
    '<div style="flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding-bottom:calc(env(safe-area-inset-bottom,0px) + 88px)">' +
    bodyHtml +
    '</div>';
  document.body.appendChild(overlay);
}
function closeMore() {
  document.getElementById('moreOverlay')?.remove();
  const el = document.getElementById('moreSheet');
  if (el) el.style.display = 'none';
}
window.openMore = openMore;
window.closeMore = closeMore;

// ===================== PRIVACY MODE =====================
function togglePrivacy() {
  S.privacyMode = !S.privacyMode;
  document.body.classList.toggle('privacy', S.privacyMode);
  if (typeof VC !== 'undefined') {
    VC.setBtnIcon(document.getElementById('privBtn'), S.privacyMode ? 'eye' : 'eye-off', 18);
    document.querySelectorAll('[data-vc-icon="eye-off"],[data-vc-icon="eye"]').forEach((el) => {
      if (el.id !== 'privBtn') VC.setBtnIcon(el, S.privacyMode ? 'eye' : 'eye-off', 18);
    });
  }
}

function toggleSidebar() {
  const collapsed = document.body.classList.toggle('sidebar-collapsed');
  localStorage.setItem('vo_sidebar_collapsed', collapsed ? '1' : '0');
}

function initSidebar() {
  if (localStorage.getItem('vo_sidebar_collapsed') === '1') {
    document.body.classList.add('sidebar-collapsed');
  }
}

// ===================== BUILD NAV =====================
function hubTileIcon(id, size = 22) {
  const extra = { credit: 'gauge', gold: 'gem', vehicles: 'car', gadgets: 'laptop' };
  const mod = ALL_MODULES.find((m) => m.id === id);
  return VC.icon(mod?.ic || extra[id] || 'list', size);
}

function buildSettTabs() {
  const el = document.getElementById('settTabs');
  if (!el) return;
  // Ordering law: identity top → rare middle → destructive/legal bottom (see IA-RATIONALE.md)
  const tabs = [
    ['account', 'Account', 'users'],
    ['general', 'General', 'grid'],
    ['appearance', 'Appearance', 'settings'],
    ['accessibility', 'Access', 'eye'],
    ['notifications', 'Alerts', 'bell'],
    ['privacy', 'Privacy', 'lock'],
    ['about', 'About', 'book'],
  ];
  const cur = (typeof SettingsNav !== 'undefined' ? SettingsNav.current : null) || 'account';
  el.innerHTML = tabs.map(([id, label, ic]) =>
    `<button type="button" class="cap-tab tab-pill${cur === id ? ' on' : ''}" role="tab" aria-selected="${cur === id}" data-act="SettingsNav.show('${id}')">${VC.icon(ic, 14)}<span>${label}</span></button>`
  ).join('');
}

function getTabPrefs() {
  try { return JSON.parse(localStorage.getItem('vo_tab_prefs')||'{}'); } catch(e) { return {}; }
}
function saveTabPrefs(prefs) {
  localStorage.setItem('vo_tab_prefs', JSON.stringify(prefs));
}

function financeHomeTile(m) {
  return `<div data-act="R.goto('${m.id}')" style="background:var(--glass);border:1px solid var(--border);border-radius:18px;padding:18px 16px;cursor:pointer;touch-action:manipulation;display:flex;flex-direction:column;gap:4px;min-height:100px;position:relative">
      <div class="vc-icon-wrap" style="width:28px;height:28px;margin-bottom:4px">${VC.icon(m.ic, 22)}</div>
      <div style="font-size:14px;font-weight:700;color:var(--text)">${m.label}</div>
      <div style="font-size:12px;color:var(--text3);padding-right:18px;line-height:1.35">${m.desc}</div>
      <div style="position:absolute;top:14px;right:14px;color:var(--text3);font-size:16px;line-height:1">›</div>
    </div>`;
}

function renderFinanceHome() {
  const b = document.getElementById('finance-home-body');
  if (!b) return;
  const ctxBar = typeof ContextSwitcher !== 'undefined' ? ContextSwitcher.bar('finance-home') : '';
  const hidden = getTabPrefs().hiddenFinance || [];
  const vis = (m) => !hidden.includes(m.id) && isModOn(m.id);
  const banking = [
    {id:'banks',ic:'bank',label:'Banks',desc:(S.banks||[]).length+' accounts'},
    {id:'cards',ic:'card',label:'Cards',desc:(S.cards||[]).length+' cards'},
    {id:'cash',ic:'banknote',label:'Cash',desc:(S.cash||[]).length+' entries'},
  ].filter(vis);
  const cashflow = [
    {id:'loans',ic:'handshake',label:'Loans',desc:(S.loans||[]).length+' loans'},
    {id:'expenses',ic:'repeat',label:'Expenses',desc:(S.expenses||[]).length+' entries'},
    {id:'bc',ic:'refresh-cw',label:'Committee (BC)',desc:(S.bc||[]).length+' committees'},
  ].filter(vis);
  const section = (label, mods) => !mods.length ? '' :
    `<div style="padding:16px 16px 0"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);margin-bottom:10px">${label}</div>` +
    `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${mods.map(financeHomeTile).join('')}</div></div>`;
  b.innerHTML = ctxBar + section('Banking', banking) + section('Cashflow', cashflow) + '<div style="height:16px"></div>';
}

function renderVaultHome() {
  const b = document.getElementById('vault-home-body');
  if (!b) return;
  const modules = [
    {id:'documents',ic:'id-card',label:'Documents',desc:(S.documents||[]).length+' docs'},
    {id:'digital',ic:'key',label:'Digital',desc:'Accounts & subscriptions'},
    {id:'emails',ic:'mail',label:'Emails',desc:(S.emails||[]).length+' identities'},
    {id:'sims',ic:'smartphone',label:'SIM Cards',desc:(S.sims||[]).length+' SIMs'},
    {id:'friends',ic:'user',label:'Contacts',desc:(S.friends||[]).length+' contacts'},
  ];
  b.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:16px">' +
    modules.map(m => `<div data-act="R.goto('${m.id}')" style="background:var(--glass);border:1px solid var(--border);border-radius:18px;padding:18px 16px;cursor:pointer;touch-action:manipulation;display:flex;flex-direction:column;gap:4px;min-height:100px;position:relative">
      <div class="vc-icon-wrap" style="width:28px;height:28px;margin-bottom:4px">${VC.icon(m.ic, 22)}</div>
      <div style="font-size:14px;font-weight:700;color:var(--text)">${m.label}</div>
      <div style="font-size:12px;color:var(--text3);padding-right:18px;line-height:1.35">${m.desc}</div>
      <div style="position:absolute;top:14px;right:14px;color:var(--text3);font-size:16px;line-height:1">›</div>
    </div>`).join('') + '</div>';
}

function renderAssetsHome() {
  const b = document.getElementById('assets-home-body');
  if (!b) return;
  const vehicleCount = (S.assets || []).filter(a => a.assetType === 'vehicle').length;
  const metalCount = (S.assets || []).filter(a => a.assetType === 'precious_metals' || a.assetType === 'precious').length;
  // Wealth hub — one tile per module (filters live inside Property)
  const modules = [
    {id:'investments',ic:'trending-up',label:'Investments',desc:(S.investments||[]).length+' positions'},
    {id:'bonds',ic:'ticket',label:'Bonds & Savings',desc:(S.bonds||[]).length+' holdings'},
    {id:'assets',ic:'layers',label:'Property',desc:(S.assets||[]).length+' items'+(vehicleCount||metalCount?' · inc. vehicles & metals':'')},
  ].filter(m => isModOn(m.id));
  b.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:16px">' +
    modules.map(m => `<div data-act="R.goto('${m.id}')" style="background:var(--glass);border:1px solid var(--border);border-radius:18px;padding:18px 16px;cursor:pointer;touch-action:manipulation;display:flex;flex-direction:column;gap:4px;min-height:100px;position:relative">
      <div class="vc-icon-wrap" style="width:28px;height:28px;margin-bottom:4px">${VC.icon(m.ic, 22)}</div>
      <div style="font-size:14px;font-weight:700;color:var(--text)">${m.label}</div>
      <div style="font-size:12px;color:var(--text3);padding-right:18px;line-height:1.35">${m.desc}</div>
      <div style="position:absolute;top:14px;right:14px;color:var(--text3);font-size:16px;line-height:1">›</div>
    </div>`).join('') + '</div>';
}

function renderHomeModules() {
  const grid = document.getElementById('homeModGrid');
  if (!grid || typeof VC === 'undefined') return;
  // Locked welcome grid — each tile opens that module after unlock (or queues via data-act)
  const mods = [
    { ic: 'bank', label: 'Banks', page: 'banks' },
    { ic: 'card', label: 'Cards', page: 'cards' },
    { ic: 'trending-up', label: 'Invest', page: 'investments' },
    { ic: 'layers', label: 'Assets', page: 'assets' },
    { ic: 'smartphone', label: 'SIMs', page: 'sims' },
    { ic: 'mail', label: 'Emails', page: 'emails' },
    { ic: 'laptop', label: 'Gadgets', page: 'gadgets' },
    { ic: 'id-card', label: 'Docs', page: 'documents' },
    { ic: 'repeat', label: 'Subs', page: 'expenses' },
    { ic: 'key', label: 'Logins', page: 'digital' },
    { ic: 'shield', label: 'Security', page: 'security' },
    { ic: 'receipt', label: 'Expenses', page: 'expenses' },
  ];
  grid.innerHTML = mods.map(m =>
    `<button type="button" class="home-mod-tile" data-act="ActHelpers.homeModGoto('${m.page}')" aria-label="${m.label}">
      <div class="home-mod-ic">${VC.icon(m.ic, 20)}</div>
      <div class="home-mod-label">${m.label}</div>
    </button>`
  ).join('');
}

function buildNav() {
  if (S.user && S.user.country && typeof SMART_DB !== 'undefined' && Array.isArray(SMART_DB.banks)) {
    const uc = S.user.country;
    SMART_DB.banks.sort((a, b) => (a.country === uc ? 0 : 1) - (b.country === uc ? 0 : 1));
  }
  const active = ALL_MODULES.filter(m => isModOn(m.id));
  const extras = [{ id:'settings', n:'Settings', ic:'settings' }, { id:'trash', n:'Trash', ic:'trash' }, { id:'reminders', n:'Reminders', ic:'bell' }, { id:'sync', n:'Sync', ic:'sync' }];
  const appVer = (typeof window !== 'undefined' && window.VER) || (typeof VER !== 'undefined' ? VER : (typeof APP_VERSION !== 'undefined' ? APP_VERSION : '4.8.2'));
  const navKey = active.map(m => m.id).sort().join(',') + '|' + (S.user?.country || '') + '|' + appVer + '|nav-v4';
  const sbNav = document.getElementById('sbNav');
  const btabs = document.getElementById('btabs');
  if (sbNav && btabs && navKey === buildNav._cacheKey && sbNav.children.length) {
    patchNavActiveState();
    return;
  }
  buildNav._cacheKey = navKey;

  const groups = {
    Family:   'Family',
    Banking:  'Banking',
    Wealth:   'Wealth',
    Cashflow: 'Cashflow',
    Identity: 'Identity',
    Planning: 'Planning',
    Tools:    'Tools',
  };
  const groupOrder = ['Family', 'Banking', 'Wealth', 'Cashflow', 'Identity', 'Planning', 'Tools'];
  const grouped = {};
  active.forEach(m => { if (!grouped[m.group]) grouped[m.group] = []; grouped[m.group].push(m); });

  let sbHTML = `<div class="ni${S.currentPage === 'dashboard' ? ' on' : ''}" role="menuitem" tabindex="0" data-pg="dashboard"><span class="ni-ic" aria-hidden="true">${VC.icon('chart', 18)}</span><span class="ni-txt">Dashboard</span></div>`;
  groupOrder.forEach((grp) => {
    const label = groups[grp];
    if (!grouped[grp] || !grouped[grp].length) return;
    sbHTML += `<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text3);padding:12px 14px 4px" role="separator" aria-label="${label}">${label}</div>`;
    sbHTML += grouped[grp].filter(m => !!document.getElementById('pg-' + m.id)).map(m =>
      `<div class="ni${S.currentPage === m.id ? ' on' : ''}" role="menuitem" tabindex="0" data-pg="${m.id}"><span class="ni-ic" aria-hidden="true">${VC.modIcon(m, 18)}</span><span class="ni-txt">${m.n}</span></div>`
    ).join('');
  });
  sbHTML += `<div style="height:1px;background:var(--border);margin:8px 14px" role="separator"></div>`;
  const activeModIds = new Set(active.map(m => m.id));
  sbHTML += extras.filter(m => !activeModIds.has(m.id)).map(m =>
    `<div class="ni${S.currentPage === m.id ? ' on' : ''}" role="menuitem" tabindex="0" data-pg="${m.id}"><span class="ni-ic" aria-hidden="true">${VC.modIcon(m, 18)}</span><span class="ni-txt">${m.n}</span></div>`
  ).join('');
  document.getElementById('sbNav').innerHTML = sbHTML;

  const nameEl = document.getElementById('sbUser');
  if (nameEl) nameEl.textContent = (S.user.name || 'User') + ' · v' + appVer;

  const bankingPages = new Set(['banks','cards','cash','loans','expenses','bc','finance-home']);
  const wealthPages = new Set(['investments','bonds','assets','vehicles','gadgets','gold','assets-home']);
  const identityPages = new Set(['documents','sims','emails','digital','friends','vault-home']);

  document.getElementById('btabs').setAttribute('role', 'tablist');
  document.getElementById('btabs').setAttribute('aria-label', 'Main navigation');
  document.getElementById('btabs').innerHTML =
    `<div class="ti${S.currentPage === 'dashboard' || S.currentPage === 'family' ? ' on' : ''}" role="tab" aria-selected="${S.currentPage === 'dashboard' || S.currentPage === 'family'}" aria-label="Home" data-act="R.goto('dashboard')"><div class="ti-ic" aria-hidden="true">${VC.icon('home', 20)}</div><span>Home</span></div>` +
    `<div class="ti${bankingPages.has(S.currentPage) ? ' on' : ''}" role="tab" aria-selected="${bankingPages.has(S.currentPage)}" aria-label="Money" data-act="openMoneySheet()"><div class="ti-ic" aria-hidden="true">${VC.icon('wallet', 20)}</div><span>Money</span></div>` +
    `<div class="ti${wealthPages.has(S.currentPage) ? ' on' : ''}" role="tab" aria-selected="${wealthPages.has(S.currentPage)}" aria-label="Wealth" data-act="openAssetsSheet()"><div class="ti-ic" aria-hidden="true">${VC.icon('trending-up', 20)}</div><span>Wealth</span></div>` +
    `<div class="ti${identityPages.has(S.currentPage) ? ' on' : ''}" role="tab" aria-selected="${identityPages.has(S.currentPage)}" aria-label="Identity" data-act="openIdentitySheet()"><div class="ti-ic" aria-hidden="true">${VC.icon('id-card', 20)}</div><span>Identity</span></div>` +
    `<div class="ti" role="tab" aria-selected="false" aria-label="More options" data-act="openMore()"><div class="ti-ic" aria-hidden="true">${VC.icon('more', 20)}</div><span>More</span></div>`;

  const modMap = { banks:'Banks', cards:'Cards', investments:'Inv', cash:'Cash', loans:'Loans', friends:'Friends', sims:'Sims', assets:'Assets', expenses:'Exp', emails:'Emails', gadgets:'Gadgets', digital:'Digital', vehicles:'Vehicles', trash:'Trash' };
  const quickAdds = [
    { id: 'cash', icon: 'banknote', label: 'Cash', obj: 'Cash' },
    { id: 'loans', icon: 'handshake', label: 'Loan', obj: 'Loans' },
    { id: 'banks', icon: 'bank', label: 'Bank', obj: 'Banks' },
    { id: 'cards', icon: 'card', label: 'Card', obj: 'Cards' },
  ].filter(q => isModOn(q.id) && document.getElementById('pg-' + q.id));
  const fabItems = [
    ...quickAdds.map(q => `<div class="fmi" data-act="${q.obj}.openAdd();FAB.close()">${VC.icon(q.icon, 16)} Add ${q.label}</div>`),
    '<div class="fmi" data-act="SmartAdd.open();FAB.close()">'+VC.icon('sparkles', 16)+' Smart Add</div>',
    '<div class="fmi" data-act="AIImport.openImportModal();FAB.close()">'+VC.icon('download', 16)+' Smart Import</div>',
    '<div class="fmi" data-act="CMD.open();FAB.close()">'+VC.icon('search', 16)+' Search Everything</div>',
    '<div class="fmi" data-act="R.goto(\'alerts\');FAB.close()">'+VC.icon('bell', 16)+' Alerts</div>',
    '<div class="fmi" data-act="R.goto(\'timeline\');FAB.close()">'+VC.icon('calendar', 16)+' Timeline</div>',
    '<div class="fmi" data-act="R.goto(\'settings\');FAB.close()">'+VC.icon('settings', 16)+' Settings</div>',
    '<div class="fmi" data-act="R.lock();FAB.close()">'+VC.icon('lock', 16)+' Lock Vault</div>'
  ];
  document.getElementById('fabMenu').innerHTML = fabItems.join('');
  patchNavActiveState();
  if (typeof VC !== 'undefined') VC.refreshShellIcons();
}

function patchNavActiveState() {
  const page = S.currentPage;
  document.querySelectorAll('#sbNav .ni[data-pg]').forEach(el => {
    el.classList.toggle('on', el.dataset.pg === page);
  });
  const bankingPages = new Set(['banks','cards','cash','loans','expenses','bc','finance-home']);
  const wealthPages = new Set(['investments','bonds','assets','vehicles','gadgets','gold','assets-home']);
  const identityPages = new Set(['documents','sims','emails','digital','friends','vault-home']);
  const tabs = document.getElementById('btabs');
  if (!tabs) return;
  const ti = tabs.querySelectorAll('.ti');
  if (ti[0]) ti[0].classList.toggle('on', page === 'dashboard' || page === 'family');
  if (ti[1]) ti[1].classList.toggle('on', bankingPages.has(page));
  if (ti[2]) ti[2].classList.toggle('on', wealthPages.has(page));
  if (ti[3]) ti[3].classList.toggle('on', identityPages.has(page));
}

// ===================== SMART ADD (offline pattern detection) =====================
