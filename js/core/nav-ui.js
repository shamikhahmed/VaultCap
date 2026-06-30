'use strict';
/* openMoneySheet, openAssetsSheet, openIdentitySheet, openMore, closeMore, togglePrivacy, toggleSidebar, initSidebar, buildSettTabs, getTabPrefs, saveTabPrefs, renderFinanceHome, renderVaultHome, renderAssetsHome, buildNav, patchNavActiveState */

function openMoneySheet() {
  document.getElementById('moneySheet')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'moneySheet';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.5);display:flex;align-items:flex-end';
  const ctx = typeof ContextSwitcher !== 'undefined' ? ContextSwitcher.get() : 'ALL';
  const ctxLabel = (ctx && ctx !== 'ALL') ? (' · ' + ctx) : '';
  const items = [
    {id:'banks',ic:'🏦',n:'Banks'},
    {id:'cards',ic:'💳',n:'Cards'},
    {id:'cash',ic:'💵',n:'Cash'},
    {id:'investments',ic:'📈',n:'Investments'},
    {id:'loans',ic:'💸',n:'Loans'},
    {id:'expenses',ic:'📋',n:'Expenses'},
    {id:'bc',ic:'🤝',n:'Committees'},
    {id:'bonds',ic:'🎫',n:'Bonds'},
  ].filter(m => S.modules[m.id] !== false);
  overlay.innerHTML = '<div style="background:var(--bg);width:100%;border-radius:20px 20px 0 0;padding:12px 16px calc(env(safe-area-inset-bottom,0) + 16px)">' +
    '<div style="width:36px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 16px"></div>' +
    '<div style="font-size:13px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">Money' + ctxLabel + '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px">' +
    (items.length ? items.map(m => {
      const cnt = typeof ContextSwitcher !== 'undefined' ? ContextSwitcher.filter(S[m.id]||[]).length : (S[m.id]||[]).length;
      const badge = cnt > 0 ? '<div style="font-size:9px;color:var(--text3);margin-top:1px">'+cnt+'</div>' : '';
      return '<div onclick="document.getElementById(\'moneySheet\')?.remove();R.goto(\''+m.id+'\')" style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:12px 8px;cursor:pointer;touch-action:manipulation;display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center"><div style="font-size:24px">'+m.ic+'</div><div style="font-size:11px;font-weight:600;color:var(--text);line-height:1.2">'+m.n+'</div>'+badge+'</div>';
    }).join('') : '<div style="grid-column:1/-1;text-align:center;padding:16px 8px"><div style="font-size:13px;color:var(--text2);margin-bottom:12px">No money modules enabled.</div><button type="button" class="btn btn-p btn-sm" onclick="document.getElementById(\'moneySheet\')?.remove();R.goto(\'settings\');setTimeout(function(){SettingsNav.show(\'modules\')},80)">Enable in Settings →</button></div>') +
    '</div></div>';
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
  const items = [
    {id:'assets',ic:'🏠',n:'All Assets'},
    {id:'vehicles',ic:'🚗',n:'Vehicles'},
    {id:'gadgets',ic:'📱',n:'Gadgets'},
  ].filter(m => S.modules[m.id] !== false);
  overlay.innerHTML = '<div style="background:var(--bg);width:100%;border-radius:20px 20px 0 0;padding:12px 16px calc(env(safe-area-inset-bottom,0) + 16px)">' +
    '<div style="width:36px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 16px"></div>' +
    '<div style="font-size:13px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">Assets' + ctxLabel + '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px">' +
    (items.length ? items.map(m => {
      const cnt = typeof ContextSwitcher !== 'undefined' ? ContextSwitcher.filter(S[m.id]||[]).length : (S[m.id]||[]).length;
      const badge = cnt > 0 ? '<div style="font-size:9px;color:var(--text3);margin-top:1px">'+cnt+'</div>' : '';
      return '<div onclick="document.getElementById(\'assetsSheet\')?.remove();R.goto(\''+m.id+'\')" style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:12px 8px;cursor:pointer;touch-action:manipulation;display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center"><div style="font-size:24px">'+m.ic+'</div><div style="font-size:11px;font-weight:600;color:var(--text);line-height:1.2">'+m.n+'</div>'+badge+'</div>';
    }).join('') : '<div style="grid-column:1/-1;text-align:center;padding:16px 8px"><div style="font-size:13px;color:var(--text2);margin-bottom:12px">No asset modules enabled.</div><button type="button" class="btn btn-p btn-sm" onclick="document.getElementById(\'assetsSheet\')?.remove();R.goto(\'settings\');setTimeout(function(){SettingsNav.show(\'modules\')},80)">Enable in Settings →</button></div>') +
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
    {id:'documents',ic:'🪪',n:'Documents'},
    {id:'sims',ic:'📱',n:'SIM Cards'},
    {id:'emails',ic:'📧',n:'Emails'},
    {id:'digital',ic:'💼',n:'Digital'},
    {id:'friends',ic:'👥',n:'Contacts'},
  ].filter(m => S.modules[m.id] !== false);
  overlay.innerHTML = '<div style="background:var(--bg);width:100%;border-radius:20px 20px 0 0;padding:12px 16px calc(env(safe-area-inset-bottom,0) + 16px)">' +
    '<div style="width:36px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 16px"></div>' +
    '<div style="font-size:13px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">Identity' + ctxLabel + '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px">' +
    (items.length ? items.map(m => {
      const cnt = typeof ContextSwitcher !== 'undefined' ? ContextSwitcher.filter(S[m.id]||[]).length : (S[m.id]||[]).length;
      const badge = cnt > 0 ? '<div style="font-size:9px;color:var(--text3);margin-top:1px">'+cnt+'</div>' : '';
      return '<div onclick="document.getElementById(\'identitySheet\')?.remove();R.goto(\''+m.id+'\')" style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:12px 8px;cursor:pointer;touch-action:manipulation;display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center"><div style="font-size:24px">'+m.ic+'</div><div style="font-size:11px;font-weight:600;color:var(--text);line-height:1.2">'+m.n+'</div>'+badge+'</div>';
    }).join('') : '<div style="grid-column:1/-1;text-align:center;padding:16px 8px"><div style="font-size:13px;color:var(--text2);margin-bottom:12px">No identity modules enabled.</div><button type="button" class="btn btn-p btn-sm" onclick="document.getElementById(\'identitySheet\')?.remove();R.goto(\'settings\');setTimeout(function(){SettingsNav.show(\'modules\')},80)">Enable in Settings →</button></div>') +
    '</div></div>';
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}
window.openIdentitySheet = openIdentitySheet;

function openMore() {
  document.getElementById('moreOverlay')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'moreOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:500;background:var(--bg);overflow-y:auto;padding:env(safe-area-inset-top,0) 0 calc(env(safe-area-inset-bottom,0) + 100px)';
  const vis = id => S.modules[id] !== false;
  const navGroups = [
    { label:'💰 Money', items:[
      {id:'banks',ic:'🏦',n:'Banks'},
      {id:'cards',ic:'💳',n:'Cards'},
      {id:'cash',ic:'💵',n:'Cash'},
      {id:'investments',ic:'📈',n:'Investments'},
      {id:'loans',ic:'💸',n:'Loans'},
      {id:'expenses',ic:'📋',n:'Expenses'},
      {id:'bc',ic:'🤝',n:'Committees'},
      {id:'bonds',ic:'🎫',n:'Bonds'},
    ].filter(m => vis(m.id))},
    { label:'🏠 Assets', items:[
      {id:'assets',ic:'🏠',n:'Assets'},
    ].filter(m => vis(m.id))},
    { label:'🪪 Identity', items:[
      {id:'documents',ic:'🪪',n:'Documents'},
      {id:'sims',ic:'📱',n:'SIM Cards'},
      {id:'emails',ic:'📧',n:'Emails'},
      {id:'digital',ic:'💼',n:'Digital'},
      {id:'friends',ic:'👥',n:'Contacts'},
    ].filter(m => vis(m.id))},
    { label:'🔧 Tools', items:[
      {id:'zakat',ic:'🌙',n:'Zakat'},
      {id:'tax',ic:'🧾',n:'Tax'},
      {id:'currency',ic:'💱',n:'Currency'},
      {id:'import',ic:'📥',n:'Smart Import'},
      {id:'credit',ic:'📊',n:'Credit Score'},
      {id:'reminders',ic:'⏰',n:'Reminders'},
      {id:'alerts',ic:'🔔',n:'Alerts'},
      {id:'timeline',ic:'📅',n:'Timeline'},
      {id:'search',ic:'🔍',n:'Search'},
      {id:'trash',ic:'🗑️',n:'Trash'},
      {id:'family',ic:'👨‍👩‍👧‍👦',n:'Family Vault'},
    ].filter(m => vis(m.id))},
    { label:'⚙️ System', items:[
      {id:'backup',ic:'💾',n:'Backup'},
      {id:'security',ic:'🛡️',n:'Security'},
      {id:'settings',ic:'⚙️',n:'Settings'},
      {id:'help',ic:'❓',n:'Help'},
    ]},
  ].filter(g => g.items.length > 0);
  overlay.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:calc(env(safe-area-inset-top,0) + 20px) 16px 12px;position:sticky;top:0;background:var(--bg);z-index:1;border-bottom:1px solid var(--border)">' +
    '<div style="font-size:16px;font-weight:800;color:var(--text)">Vault</div>' +
    '<button type="button" onclick="document.getElementById(\'moreOverlay\')?.remove()" style="background:none;border:none;color:var(--text3);font-size:26px;cursor:pointer;touch-action:manipulation;line-height:1">×</button>' +
    '</div>' +
    navGroups.map(group =>
      '<div style="padding:14px 16px 4px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);margin-bottom:8px">' + group.label + '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">' +
      group.items.map(m =>
        '<div onclick="document.getElementById(\'moreOverlay\')?.remove();R.goto(\'' + m.id + '\')" style="background:var(--glass);border:1px solid var(--border);border-radius:12px;padding:12px 8px;cursor:pointer;touch-action:manipulation;display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center">' +
        '<div style="font-size:22px">' + m.ic + '</div>' +
        '<div style="font-size:11px;font-weight:600;color:var(--text);line-height:1.2">' + m.n + '</div>' +
        '</div>'
      ).join('') +
      '</div></div>'
    ).join('') +
    '<div style="height:20px"></div>';
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
  document.getElementById('privBtn').textContent = S.privacyMode ? '👁️ Visible' : '🙈 Privacy';
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
function buildSettTabs() {
  const el = document.getElementById('settTabs');
  if (!el) return;
  const tabs = [
    ['profile','👤 Profile'],['security','🔒 Security'],['appearance','🎨 Appearance'],
    ['modules','🧩 Modules'],['backup','💾 Backup'],['import','📥 Import'],
    ['accessibility','♿ Accessibility'],['about','ℹ️ About']
  ];
  const cur = (typeof SettingsNav !== 'undefined' ? SettingsNav.current : null) || 'profile';
  el.innerHTML = tabs.map(([id, label]) =>
    `<button type="button" class="cap-tab tab-pill${cur === id ? ' on' : ''}" role="tab" aria-selected="${cur === id}" onclick="SettingsNav.show('${id}')">${label}</button>`
  ).join('');
}

function getTabPrefs() {
  try { return JSON.parse(localStorage.getItem('vo_tab_prefs')||'{}'); } catch(e) { return {}; }
}
function saveTabPrefs(prefs) {
  localStorage.setItem('vo_tab_prefs', JSON.stringify(prefs));
}

function renderFinanceHome() {
  const b = document.getElementById('finance-home-body');
  if (!b) return;
  const ctxBar = typeof ContextSwitcher !== 'undefined' ? ContextSwitcher.bar('finance-home') : '';
  const allModules = [
    {id:'banks',icon:'🏦',label:'Banks',desc:(S.banks||[]).length+' accounts'},
    {id:'cards',icon:'💳',label:'Cards',desc:(S.cards||[]).length+' cards'},
    {id:'cash',icon:'💵',label:'Cash',desc:(S.cash||[]).length+' entries'},
    {id:'investments',icon:'📈',label:'Investments',desc:(S.investments||[]).length+' positions'},
    {id:'loans',icon:'🤝',label:'Loans',desc:(S.loans||[]).length+' loans'},
    {id:'credit',icon:'📊',label:'Credit Score',desc:'Track scores'},
    {id:'zakat',icon:'🌙',label:'Zakat',desc:'Calculate'},
    {id:'tax',icon:'🧾',label:'Tax',desc:'Income tax calculator'},
    {id:'currency',icon:'💱',label:'Currency',desc:'Net worth'},
    {id:'gold',icon:'🥇',label:'Metals',desc:'Gold & silver'},
    {id:'expenses',icon:'💸',label:'Expenses',desc:(S.expenses||[]).length+' entries'},
    {id:'bc',    icon:'🤝', label:'Committee (BC)',       desc:(S.bc||[]).length+' committees'},
    {id:'bonds', icon:'🎫', label:'Prize Bonds & Savings', desc:(S.bonds||[]).length+' holdings'},
  ];
  const hidden = getTabPrefs().hiddenFinance || [];
  const modules = allModules.filter(m => {
    if (hidden.includes(m.id)) return false;
    if (m.id === 'zakat' && S.user?.showZakat === false) return false;
    if (S.modules) {
      const modKey = { banks:'banks', cards:'banks', cash:'banks', credit:'banks',
        investments:'investments', loans:'loans', expenses:'expenses', tax:'tax',
        currency:'currency', gold:'currency', zakat:'zakat', bc:'bc', bonds:'bonds' }[m.id];
      if (modKey && S.modules[modKey] === false) return false;
    }
    return true;
  });
  b.innerHTML = ctxBar + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:16px">' +
    modules.map(m => `<div onclick="R.goto('${m.id}')" style="background:var(--glass);border:1px solid var(--border);border-radius:18px;padding:18px 16px;cursor:pointer;touch-action:manipulation;display:flex;flex-direction:column;gap:4px;min-height:100px;position:relative">
      <div style="font-size:28px;margin-bottom:4px">${m.icon}</div>
      <div style="font-size:14px;font-weight:700;color:var(--text)">${m.label}</div>
      <div style="font-size:12px;color:var(--text3)">${m.desc}</div>
      <div style="position:absolute;bottom:12px;right:12px;color:var(--text3);font-size:16px">›</div>
    </div>`).join('') + '</div>';
}

function renderVaultHome() {
  const b = document.getElementById('vault-home-body');
  if (!b) return;
  const modules = [
    {id:'documents',icon:'📄',label:'Documents',desc:(S.documents||[]).length+' docs'},
    {id:'digital',icon:'💻',label:'Digital',desc:'Accounts & subscriptions'},
    {id:'emails',icon:'📧',label:'Emails',desc:(S.emails||[]).length+' identities'},
    {id:'sims',icon:'📱',label:'SIM Cards',desc:(S.sims||[]).length+' SIMs'},
    {id:'friends',icon:'👥',label:'Contacts',desc:(S.friends||[]).length+' contacts'},
    {id:'gadgets',icon:'🖥️',label:'Gadgets',desc:(S.gadgets||[]).length+' devices'},
  ];
  b.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:16px">' +
    modules.map(m => `<div onclick="R.goto('${m.id}')" style="background:var(--glass);border:1px solid var(--border);border-radius:18px;padding:18px 16px;cursor:pointer;touch-action:manipulation;display:flex;flex-direction:column;gap:4px;min-height:100px;position:relative">
      <div style="font-size:28px;margin-bottom:4px">${m.icon}</div>
      <div style="font-size:14px;font-weight:700;color:var(--text)">${m.label}</div>
      <div style="font-size:12px;color:var(--text3)">${m.desc}</div>
      <div style="position:absolute;bottom:12px;right:12px;color:var(--text3);font-size:16px">›</div>
    </div>`).join('') + '</div>';
}

function renderAssetsHome() {
  const b = document.getElementById('assets-home-body');
  if (!b) return;
  const vehicleCount = (S.assets || []).filter(a => a.assetType === 'vehicle').length;
  const metalCount = (S.assets || []).filter(a => a.assetType === 'precious_metals' || a.assetType === 'precious').length;
  const modules = [
    {id:'vehicles',icon:'🚗',label:'Vehicles',desc:vehicleCount+' vehicle'+(vehicleCount!==1?'s':'')},
    {id:'assets',icon:'🏠',label:'Property & Assets',desc:(S.assets||[]).length+' items'},
    {id:'gold',icon:'🥇',label:'Precious Metals',desc:metalCount ? metalCount+' holding'+(metalCount!==1?'s':'') : 'Gold & silver'},
  ];
  b.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:16px">' +
    modules.map(m => `<div onclick="R.goto('${m.id}')" style="background:var(--glass);border:1px solid var(--border);border-radius:18px;padding:18px 16px;cursor:pointer;touch-action:manipulation;display:flex;flex-direction:column;gap:4px;min-height:100px;position:relative">
      <div style="font-size:28px;margin-bottom:4px">${m.icon}</div>
      <div style="font-size:14px;font-weight:700;color:var(--text)">${m.label}</div>
      <div style="font-size:12px;color:var(--text3)">${m.desc}</div>
      <div style="position:absolute;bottom:12px;right:12px;color:var(--text3);font-size:16px">›</div>
    </div>`).join('') + '</div>';
}

function buildNav() {
  if (S.user && S.user.country) {
    const uc = S.user.country;
    SMART_DB.banks.sort((a, b) => (a.country === uc ? 0 : 1) - (b.country === uc ? 0 : 1));
  }
  const active = ALL_MODULES.filter(m => S.modules[m.id]);
  const extras = [{ id:'settings', n:'Settings', ic:'⚙️' }, { id:'trash', n:'Trash', ic:'🗑️' }, { id:'reminders', n:'Reminders', ic:'🔔' }, { id:'sync', n:'Sync', ic:'🔄' }];
  const appVer = (typeof window !== 'undefined' && window.VER) || (typeof VER !== 'undefined' ? VER : (typeof APP_VERSION !== 'undefined' ? APP_VERSION : '4.8.2'));
  const navKey = active.map(m => m.id).sort().join(',') + '|' + (S.user?.country || '') + '|' + appVer;
  const sbNav = document.getElementById('sbNav');
  const btabs = document.getElementById('btabs');
  if (sbNav && btabs && navKey === buildNav._cacheKey && sbNav.children.length) {
    patchNavActiveState();
    return;
  }
  buildNav._cacheKey = navKey;

  const groups = {
    Finance:  '💰 Finance',
    Assets:   '🏠 Assets & Property',
    Identity: '🪪 Identity',
    Tools:    '⚙️ Tools',
  };
  const grouped = {};
  active.forEach(m => { if (!grouped[m.group]) grouped[m.group] = []; grouped[m.group].push(m); });

  let sbHTML = `<div class="ni${S.currentPage === 'dashboard' ? ' on' : ''}" role="menuitem" tabindex="0" data-pg="dashboard"><span class="ni-ic" aria-hidden="true">📊</span><span class="ni-txt">Dashboard</span></div>`;
  Object.entries(groups).forEach(([grp, label]) => {
    if (!grouped[grp] || !grouped[grp].length) return;
    sbHTML += `<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text3);padding:12px 14px 4px" role="separator" aria-label="${label}">${label}</div>`;
    sbHTML += grouped[grp].filter(m => !!document.getElementById('pg-' + m.id)).map(m =>
      `<div class="ni${S.currentPage === m.id ? ' on' : ''}" role="menuitem" tabindex="0" data-pg="${m.id}"><span class="ni-ic" aria-hidden="true">${m.ic}</span><span class="ni-txt">${m.n}</span></div>`
    ).join('');
  });
  sbHTML += `<div style="height:1px;background:var(--border);margin:8px 14px" role="separator"></div>`;
  const activeModIds = new Set(active.map(m => m.id));
  sbHTML += extras.filter(m => !activeModIds.has(m.id)).map(m =>
    `<div class="ni${S.currentPage === m.id ? ' on' : ''}" role="menuitem" tabindex="0" data-pg="${m.id}"><span class="ni-ic" aria-hidden="true">${m.ic}</span><span class="ni-txt">${m.n}</span></div>`
  ).join('');
  document.getElementById('sbNav').innerHTML = sbHTML;

  const nameEl = document.getElementById('sbUser');
  if (nameEl) nameEl.textContent = (S.user.name || 'User') + ' · v' + appVer;

  const moneyPages = new Set(['banks','cards','cash','investments','loans','expenses','bc','bonds']);
  const assetsPages = new Set(['assets','vehicles','gadgets']);
  const identityPages = new Set(['documents','sims','emails','digital','friends']);

  document.getElementById('btabs').setAttribute('role', 'tablist');
  document.getElementById('btabs').setAttribute('aria-label', 'Main navigation');
  document.getElementById('btabs').innerHTML =
    `<div class="ti${S.currentPage === 'dashboard' ? ' on' : ''}" role="tab" aria-selected="${S.currentPage === 'dashboard'}" aria-label="Home" data-pg="dashboard"><div class="ti-ic" aria-hidden="true">🏠</div><span>Home</span></div>` +
    `<div class="ti${moneyPages.has(S.currentPage) ? ' on' : ''}" role="tab" aria-selected="${moneyPages.has(S.currentPage)}" aria-label="Money" onclick="openMoneySheet()"><div class="ti-ic" aria-hidden="true">💰</div><span>Money</span></div>` +
    `<div class="ti${assetsPages.has(S.currentPage) ? ' on' : ''}" role="tab" aria-selected="${assetsPages.has(S.currentPage)}" aria-label="Assets" onclick="openAssetsSheet()"><div class="ti-ic" aria-hidden="true">🏠</div><span>Assets</span></div>` +
    `<div class="ti${identityPages.has(S.currentPage) ? ' on' : ''}" role="tab" aria-selected="${identityPages.has(S.currentPage)}" aria-label="Identity" onclick="openIdentitySheet()"><div class="ti-ic" aria-hidden="true">🪪</div><span>Identity</span></div>` +
    `<div class="ti" role="tab" aria-selected="false" aria-label="More options" onclick="openMore()"><div class="ti-ic" aria-hidden="true">⋯</div><span>More</span></div>`;

  const modMap = { banks:'Banks', cards:'Cards', investments:'Inv', cash:'Cash', loans:'Loans', friends:'Friends', sims:'Sims', assets:'Assets', expenses:'Exp', emails:'Emails', gadgets:'Gadgets', digital:'Digital', vehicles:'Vehicles', trash:'Trash' };
  const quickAdds = [
    {id:'cash',  icon:'💵', label:'Cash',  obj:'Cash'},
    {id:'loans', icon:'🤝', label:'Loan',  obj:'Loans'},
    {id:'banks', icon:'🏦', label:'Bank',  obj:'Banks'},
    {id:'cards', icon:'💳', label:'Card',  obj:'Cards'},
  ].filter(q => S.modules[q.id] && document.getElementById('pg-' + q.id));
  const fabItems = [
    ...quickAdds.map(q => `<div class="fmi" onclick="${q.obj}.openAdd();FAB.close()">${q.icon} Add ${q.label}</div>`),
    '<div class="fmi" onclick="SmartAdd.open();FAB.close()">✨ Smart Add</div>',
    '<div class="fmi" onclick="AIImport.openImportModal();FAB.close()">📥 Smart Import</div>',
    '<div class="fmi" onclick="CMD.open();FAB.close()">⌘ Search Everything</div>',
    '<div class="fmi" onclick="R.goto(\'alerts\');FAB.close()">🔔 Alerts</div>',
    '<div class="fmi" onclick="R.goto(\'timeline\');FAB.close()">📅 Timeline</div>',
    '<div class="fmi" onclick="R.goto(\'settings\');FAB.close()">⚙️ Settings</div>',
    '<div class="fmi" onclick="R.lock();FAB.close()">🔒 Lock Vault</div>'
  ];
  document.getElementById('fabMenu').innerHTML = fabItems.join('');
  patchNavActiveState();
}

function patchNavActiveState() {
  const page = S.currentPage;
  document.querySelectorAll('#sbNav .ni[data-pg]').forEach(el => {
    el.classList.toggle('on', el.dataset.pg === page);
  });
  const moneyPages = new Set(['banks','cards','cash','investments','loans','expenses','bc','bonds']);
  const assetsPages = new Set(['assets','vehicles','gadgets']);
  const identityPages = new Set(['documents','sims','emails','digital','friends']);
  const tabs = document.getElementById('btabs');
  if (!tabs) return;
  const ti = tabs.querySelectorAll('.ti');
  if (ti[0]) ti[0].classList.toggle('on', page === 'dashboard');
  if (ti[1]) ti[1].classList.toggle('on', moneyPages.has(page));
  if (ti[2]) ti[2].classList.toggle('on', assetsPages.has(page));
  if (ti[3]) ti[3].classList.toggle('on', identityPages.has(page));
}

// ===================== SMART ADD (offline pattern detection) =====================
