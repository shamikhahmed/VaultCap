'use strict';
/* Emergency, DevDiag, VaultRecovery, ContextSwitcher */

const Emergency = {
  render() {
    const e = S.emergency || {};
    const b = document.getElementById('pg-emergency-body');
    if (!b) return;
    b.innerHTML = `
      <div style="padding:16px;display:flex;flex-direction:column;gap:16px">
        <div style="background:rgba(255,59,48,.1);border:1px solid rgba(255,59,48,.3);border-radius:16px;padding:16px">
          <div style="font-size:13px;font-weight:700;color:var(--err);margin-bottom:4px">🆘 Emergency Access</div>
          <div style="font-size:12px;color:var(--text3);line-height:1.6">This information can be shown on the lock screen for first responders. Keep it accurate and updated.</div>
        </div>
        <div style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:16px;display:flex;align-items:center;justify-content:space-between">
          <div>
            <div style="font-size:14px;font-weight:600;color:var(--text)">Show on Lock Screen</div>
            <div style="font-size:12px;color:var(--text3)">Accessible without PIN</div>
          </div>
          <label class="tog"><input type="checkbox" ${e.showOnLockscreen?'checked':''} onchange="Emergency.toggleLockscreen(this.checked)"><span class="ts"></span></label>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${[
            {id:'em-name',label:'Full Name',val:e.name||'',placeholder:'Your legal name'},
            {id:'em-phone',label:'Emergency Contact',val:e.phone||'',placeholder:'+44 7700 000000',type:'tel'},
            {id:'em-blood',label:'Blood Type',val:e.bloodType||'',placeholder:'A+, B-, O+...'},
            {id:'em-allergies',label:'Allergies / Medications',val:e.allergies||'',placeholder:'Penicillin allergy, Metformin 500mg...',area:true},
            {id:'em-note',label:'Emergency Note',val:e.emergencyNote||'',placeholder:'In case of emergency contact...',area:true},
          ].map(f=>`<div>
            <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">${f.label}</div>
            ${f.area
              ?`<textarea id="${f.id}" placeholder="${f.placeholder}" rows="3" style="width:100%;box-sizing:border-box;background:var(--glass2);border:1px solid var(--border);border-radius:10px;padding:12px;color:var(--text);font-size:14px;resize:none">${f.val}</textarea>`
              :`<input id="${f.id}" type="${f.type||'text'}" placeholder="${f.placeholder}" value="${f.val}" style="width:100%;box-sizing:border-box;background:var(--glass2);border:1px solid var(--border);border-radius:10px;padding:12px;color:var(--text);font-size:16px">`
            }
          </div>`).join('')}
        </div>
        <button type="button" class="btn btn-p" onclick="Emergency.save()" style="width:100%">Save Emergency Info</button>
        ${e.showOnLockscreen?`
        <div style="background:rgba(0,255,136,.08);border:1px solid rgba(0,255,136,.25);border-radius:14px;padding:16px">
          <div style="font-size:12px;font-weight:700;color:var(--ok);margin-bottom:8px">Preview — Lock Screen</div>
          <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:4px">🆘 ${escHtml(e.name||'Name not set')}</div>
          <div style="font-size:13px;color:var(--text2)">${e.phone?'📞 '+escHtml(e.phone):''}</div>
          <div style="font-size:12px;color:var(--text3);margin-top:4px">${e.bloodType?'🩸 '+escHtml(e.bloodType):''}${e.allergies?' · ⚠️ '+escHtml(e.allergies.split('\n')[0]):''}</div>
        </div>`:''}
      </div>`;
  },
  save() {
    if (!S.emergency) S.emergency = {};
    S.emergency.name = document.getElementById('em-name')?.value.trim() || '';
    S.emergency.phone = document.getElementById('em-phone')?.value.trim() || '';
    S.emergency.bloodType = document.getElementById('em-blood')?.value.trim() || '';
    S.emergency.allergies = document.getElementById('em-allergies')?.value.trim() || '';
    S.emergency.emergencyNote = document.getElementById('em-note')?.value.trim() || '';
    Store.save();
    Toast.show('Emergency info saved', 'success');
    this.render();
    this.updateLockscreenButton();
  },
  toggleLockscreen(enabled) {
    if (!S.emergency) S.emergency = {};
    S.emergency.showOnLockscreen = enabled;
    Store.save();
    this.render();
    this.updateLockscreenButton();
  },
  updateLockscreenButton() {
    const e = S.emergency || {};
    const lockEl = document.getElementById('emergencyLockBtn');
    if (lockEl) lockEl.style.display = (e.showOnLockscreen && e.name) ? 'block' : 'none';
  },
  showLockscreen() {
    const e = S.emergency || {};
    if (!e.name && !e.phone) { Toast.show('No emergency info set', 'warn'); return; }
    Modal.open('🆘 Emergency Information',
      `<div style="display:flex;flex-direction:column;gap:12px">
        <div style="text-align:center;padding:8px 0">
          <div style="font-size:32px;margin-bottom:8px">🆘</div>
          <div style="font-size:20px;font-weight:800;color:var(--text)">${escHtml(e.name||'')}</div>
        </div>
        ${e.phone?`<div style="background:rgba(0,255,136,.1);border:1px solid rgba(0,255,136,.3);border-radius:12px;padding:14px;text-align:center"><div style="font-size:11px;color:var(--text3);margin-bottom:4px">EMERGENCY CONTACT</div><div style="font-size:18px;font-weight:700;color:var(--ok)">${escHtml(e.phone)}</div></div>`:''}
        ${e.bloodType?`<div style="background:rgba(255,59,48,.1);border:1px solid rgba(255,59,48,.3);border-radius:12px;padding:14px;text-align:center"><div style="font-size:11px;color:var(--text3);margin-bottom:4px">BLOOD TYPE</div><div style="font-size:24px;font-weight:900;color:var(--err)">${escHtml(e.bloodType)}</div></div>`:''}
        ${e.allergies?`<div style="background:rgba(255,152,0,.1);border:1px solid rgba(255,152,0,.3);border-radius:12px;padding:14px"><div style="font-size:11px;color:var(--text3);margin-bottom:4px">⚠️ ALLERGIES / MEDICATIONS</div><div style="font-size:13px;color:var(--text)">${escHtml(e.allergies)}</div></div>`:''}
        ${e.emergencyNote?`<div style="background:var(--glass);border:1px solid var(--border);border-radius:12px;padding:14px"><div style="font-size:11px;color:var(--text3);margin-bottom:4px">NOTE</div><div style="font-size:13px;color:var(--text)">${escHtml(e.emergencyNote)}</div></div>`:''}
      </div>`,
      `<button type="button" class="btn btn-p" onclick="Modal.close()">Close</button>`
    );
  },
};

// ===================== DEVELOPER DIAGNOSTICS =====================
const DevDiag = {
  _renderTimings: {},

  trackRender(module, ms) {
    this._renderTimings[module] = ms;
  },

  storageUsage() {
    try {
      let total = 0, breakdown = {};
      for (const key of Object.keys(localStorage)) {
        const size = (localStorage.getItem(key) || '').length * 2;
        total += size;
        breakdown[key] = (size / 1024).toFixed(1) + 'KB';
      }
      return { totalMB: (total / (1024*1024)).toFixed(2), breakdown };
    } catch(e) { return { totalMB: '?', breakdown: {} }; }
  },

  entityCounts() {
    const filter = arr => typeof ContextSwitcher !== 'undefined' ? ContextSwitcher.filter(arr || []) : (arr || []);
    return {
      banks: filter(S.banks).length,
      cards: filter(S.cards).length,
      documents: filter(S.documents).length,
      investments: filter(S.investments).length,
      loans: filter(S.loans).length,
      cash: filter(S.cash).length,
      vehicles: filter(S.vehicles).length,
      assets: filter(S.assets).length,
      friends: filter(S.friends).length,
      sims: filter(S.sims).length,
      emails: filter(S.emails).length,
      gadgets: filter(S.gadgets).length,
      expenses: filter(S.expenses).length,
      activity: (S.activity||[]).length,
      trash: (S.trash||[]).length,
      total: ['banks','cards','documents','investments','loans','cash','vehicles','assets','friends'].reduce((a, k) => a + filter(S[k]).length, 0),
    };
  },

  backupAge() {
    if (!S.user?.lastBackup) return { days: null, label: 'Never backed up', ok: false };
    const days = Math.floor((Date.now() - new Date(S.user.lastBackup)) / (1000*60*60*24));
    return {
      days,
      label: days === 0 ? 'Today' : `${days} day${days>1?'s':''} ago`,
      ok: days <= 14,
      fingerprint: S.user.lastBackupFingerprint || 'N/A',
    };
  },

  run() {
    const el = document.getElementById('dev-diag-results');
    if (!el) return;
    el.innerHTML = '<div style="color:var(--text3)">Running...</div>';

    setTimeout(() => {
      const storage = this.storageUsage();
      const counts = this.entityCounts();
      const backup = this.backupAge();
      const integrity = typeof DataIntegrity !== 'undefined' ? DataIntegrity.check() : null;
      const schemaVer = typeof SCHEMA_VERSION !== 'undefined' ? SCHEMA_VERSION : '?';
      const appVer = typeof VER !== 'undefined' ? VER : '?';
      const failedOps = JSON.parse(localStorage.getItem('vos_failed_ops') || '[]');

      const row = (label, value, ok = null) => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:12px;color:var(--text3)">${label}</span>
          <span style="font-size:12px;font-weight:600;color:${ok === true ? 'var(--ok)' : ok === false ? 'var(--err)' : 'var(--text)'}">${value}</span>
        </div>`;

      el.innerHTML = `
        <div style="display:flex;flex-direction:column">
          ${row('App Version', appVer)}
          ${row('Schema Version', `v${schemaVer}`)}
          ${row('Total Storage', `${storage.totalMB} MB`, parseFloat(storage.totalMB) < 4)}
          ${row('Total Entities', counts.total)}
          ${row('Banks', counts.banks)} ${row('Cards', counts.cards)}
          ${row('Documents', counts.documents)} ${row('Investments', counts.investments)}
          ${row('Loans', counts.loans)} ${row('Vehicles', counts.vehicles)}
          ${row('Friends', counts.friends)} ${row('Activity log', counts.activity)}
          ${row('Trash', counts.trash)} ${row('Emails', counts.emails)}
          ${row('Last Backup', backup.label, backup.ok)}
          ${row('Backup Fingerprint', backup.fingerprint)}
          ${integrity ? row('Integrity Issues', (integrity.highCount + integrity.posCount) === 0 ? 'None ✓' : `${integrity.highCount + integrity.posCount} found`, (integrity.highCount + integrity.posCount) === 0) : ''}
          ${failedOps.length ? row('Failed Operations', failedOps.length, false) : row('Failed Operations', 'None ✓', true)}
          ${Object.entries(this._renderTimings).slice(0,5).map(([k,v]) => row(`Render: ${k}`, `${v}ms`)).join('')}
        </div>
        <button type="button" class="btn btn-g" onclick="DevDiag.copyReport()" style="width:100%;margin-top:10px;font-size:11px">Copy Report</button>
      `;
    }, 50);
  },

  copyReport() {
    const storage = this.storageUsage();
    const counts = this.entityCounts();
    const backup = this.backupAge();
    const report = [
      `VaultCap Diagnostics — ${new Date().toLocaleString()}`,
      `Schema: v${typeof SCHEMA_VERSION !== 'undefined' ? SCHEMA_VERSION : '?'}`,
      `Storage: ${storage.totalMB}MB`,
      `Entities: ${JSON.stringify(counts)}`,
      `Last Backup: ${backup.label}`,
      `Fingerprint: ${backup.fingerprint}`,
    ].join('\n');
    navigator.clipboard?.writeText(report).then(() => Toast.show('Report copied', 'success'));
  },
};

// ===================== VAULT RECOVERY =====================
const VaultRecovery = {
  validate() {
    const issues = [];
    if (!S || typeof S !== 'object') { issues.push('State object missing'); return issues; }
    if (!Array.isArray(S.banks)) issues.push('banks is not an array');
    if (!Array.isArray(S.cards)) issues.push('cards is not an array');
    if (!Array.isArray(S.documents)) issues.push('documents is not an array');
    if (!Array.isArray(S.investments)) issues.push('investments is not an array');
    if (!Array.isArray(S.cash)) issues.push('cash is not an array');
    if (!Array.isArray(S.loans)) issues.push('loans is not an array');
    if (!Array.isArray(S.activity)) issues.push('activity is not an array');
    const allIds = [...(S.banks||[]), ...(S.cards||[]), ...(S.documents||[])].map(x => x.id).filter(Boolean);
    const uniqueIds = new Set(allIds);
    if (uniqueIds.size < allIds.length) issues.push(`${allIds.length - uniqueIds.size} duplicate entity IDs found`);
    return issues;
  },

  repair() {
    let fixed = 0;
    ['banks','cards','documents','investments','cash','loans','vehicles','assets','friends','sims','emails','gadgets','digital','expenses','activity','trash','tags'].forEach(k => {
      if (!Array.isArray(S[k])) { S[k] = []; fixed++; }
    });
    ['banks','cards','documents','investments'].forEach(k => {
      const seen = new Set();
      const before = (S[k]||[]).length;
      S[k] = (S[k]||[]).filter(x => { if (!x.id || seen.has(x.id)) return false; seen.add(x.id); return true; });
      fixed += before - S[k].length;
    });
    if (fixed > 0) Store.save();
    return fixed;
  },

  check() {
    const issues = this.validate();
    if (!issues.length) return false;
    const fixed = this.repair();
    Modal.open('🔧 Vault Recovery',
      `<div style="display:flex;flex-direction:column;gap:10px">
        <div style="background:rgba(255,152,0,.1);border:1px solid rgba(255,152,0,.3);border-radius:12px;padding:14px">
          <div style="font-size:13px;font-weight:700;color:var(--warn);margin-bottom:8px">⚠️ Issues Detected</div>
          ${issues.map(i => `<div style="font-size:12px;color:var(--text2);padding:3px 0">• ${i}</div>`).join('')}
        </div>
        ${fixed > 0 ? `<div style="background:rgba(0,255,136,.08);border:1px solid rgba(0,255,136,.2);border-radius:12px;padding:14px;font-size:12px;color:var(--ok)">✓ Auto-repaired ${fixed} issue(s)</div>` : ''}
        <div style="font-size:12px;color:var(--text3);line-height:1.6">If problems persist, export a backup and restore from a previous .vos file.</div>
      </div>`,
      `<button type="button" class="btn btn-g" onclick="Modal.close()">Dismiss</button><button type="button" class="btn btn-p" onclick="ExIm.export('vos');Modal.close()">Export Backup</button>`
    );
    return true;
  },
};

const ContextSwitcher = {
  _page: 'dashboard',
  get() { return S.user.activeContext || 'ALL'; },
  set(code) {
    S.user.activeContext = code;
    Store.save();
    const renders = {
      'finance-home': renderFinanceHome,
      'dashboard':    () => Dash.render(),
      'banks':        () => Banks.render(),
      'cards':        () => Cards.render(),
      'investments':  () => typeof Inv !== 'undefined' && Inv.render(),
      'cash':         () => typeof Cash !== 'undefined' && Cash.render(),
      'loans':        () => typeof Loans !== 'undefined' && Loans.render(),
      'assets':       () => typeof Assets !== 'undefined' && Assets.render(),
      'expenses':     () => typeof Exp !== 'undefined' && Exp.render(),
    };
    if (renders[S.currentPage]) renders[S.currentPage]();
    if (typeof resetScroll === 'function') resetScroll();
  },
  bar(currentPage) {
    this._page = currentPage || 'dashboard';
    const primary = S.user.country || '';
    const secondary = (S.user.secondaryCountries || []).filter(c => c && c !== primary);
    const codes = primary ? [primary, ...secondary] : secondary;
    const active = this.get();
    const pill = (code, label, flag) => {
      const isActive = active === code;
      return `<button type="button" class="ctx-pill${isActive ? ' on' : ''}" onclick="ContextSwitcher.set('${code}')">
        ${flag ? `<span aria-hidden="true">${flag}</span>` : ''}<span>${label}</span>
      </button>`;
    };
    let pills = pill('ALL', 'All', '🌍');
    codes.forEach(code => pills += pill(code, U.cname(code), U.flag(code)));
    if (!primary) {
      pills += `<button type="button" class="ctx-pill ctx-pill--cta" onclick="ContextSwitcher.openManager()">+ Set home country</button>`;
    } else {
      pills += `<button type="button" class="ctx-pill ctx-pill--icon" onclick="ContextSwitcher.openManager()" title="Manage countries">✏️</button>`;
    }
    return `<div class="ctx-bar">${pills}</div>`;
  },
  openManager() {
    const primary = S.user.country || '';
    const secondary = [...(S.user.secondaryCountries || [])];
    const pickList = COUNTRIES.filter(c => c.c !== 'OTHER');
    Modal.open('🌍 Countries & Regions', `
      <p class="ctx-modal-intro">Choose your home country and any others where you hold accounts. Filter the dashboard by country, or tap <strong>All</strong> to see everything.</p>
      <div class="fg"><label class="fl">Home country</label>
        <select class="inp" id="ctx-primary">${pickList.map(c => `<option value="${c.c}">${c.f} ${c.n}</option>`).join('')}</select>
      </div>
      <div class="fg"><label class="fl">Also active in</label>
        <div class="ctx-country-grid" id="ctx-secondary">${pickList.filter(c => c.c !== primary).map(c => `
          <label class="ctx-country-card">
            <input type="checkbox" class="ctx-sec-chk" value="${c.c}" ${secondary.includes(c.c) ? 'checked' : ''}>
            <span>${c.f} ${c.n}</span>
          </label>`).join('')}
        </div>
      </div>
      <div class="fg"><label class="fl">Display currency</label><select class="inp" id="ctx-currency">${U.currencies()}</select></div>`,
      `<button type="button" class="btn btn-g" onclick="Modal.close()">Cancel</button><button type="button" class="btn btn-p" onclick="ContextSwitcher.saveManager()">Save</button>`);
    setTimeout(() => {
      const p = document.getElementById('ctx-primary');
      if (p) {
        p.value = primary || 'GB';
        p.onchange = () => ContextSwitcher._refreshSecondaryList();
      }
      const c = document.getElementById('ctx-currency');
      if (c) c.value = S.user.currency || COUNTRY_CUR[primary] || 'GBP';
      ContextSwitcher._refreshSecondaryList();
    }, 50);
  },
  _refreshSecondaryList() {
    const primary = document.getElementById('ctx-primary')?.value || '';
    const secondary = [...(S.user.secondaryCountries || [])];
    const box = document.getElementById('ctx-secondary');
    if (!box) return;
    const pickList = COUNTRIES.filter(c => c.c !== 'OTHER' && c.c !== primary);
    box.innerHTML = pickList.map(c => `
      <label class="ctx-country-card">
        <input type="checkbox" class="ctx-sec-chk" value="${c.c}" ${secondary.includes(c.c) ? 'checked' : ''}>
        <span>${c.f} ${c.n}</span>
      </label>`).join('') || '<div class="ctx-country-empty">Add another home country above to enable secondary regions.</div>';
    const cur = document.getElementById('ctx-currency');
    if (cur && primary && COUNTRY_CUR[primary]) cur.value = COUNTRY_CUR[primary];
  },
  saveManager() {
    const primary = document.getElementById('ctx-primary')?.value || '';
    const secondary = [...document.querySelectorAll('.ctx-sec-chk:checked')].map(el => el.value).filter(c => c !== primary);
    const currency = document.getElementById('ctx-currency')?.value || S.user.currency || 'GBP';
    S.user.country = primary;
    S.user.secondaryCountries = secondary;
    S.user.currency = currency;
    const ctx = this.get();
    const valid = ['ALL', primary, ...secondary];
    if (!valid.includes(ctx)) S.user.activeContext = 'ALL';
    Store.save();
    Modal.close();
    Toast.show('Countries updated', 'success');
    const renders = { 'finance-home': renderFinanceHome, 'dashboard': () => Dash.render() };
    if (renders[S.currentPage]) renders[S.currentPage]();
    else if (typeof Dash !== 'undefined') Dash.render();
    buildNav();
  },
  filter(arr, countryField = 'country') {
    const ctx = this.get();
    if (ctx === 'ALL') return arr;
    return (arr || []).filter(item => (item[countryField] || '').toUpperCase() === ctx);
  },
};

