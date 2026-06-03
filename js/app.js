// VaultOS — © 2026 Shamikh Ahmed. Source-available. See LICENSE.
const THEMES=[
  {id:'dark',     n:'Midnight',  g:'dark',  bg:'#080808', ac:'#0080ff', gl:'rgba(0,128,255,.2)',    cls:''},
  {id:'ocean',    n:'Ocean',     g:'dark',  bg:'#04101e', ac:'#0ea5e9', gl:'rgba(14,165,233,.2)',   cls:'ocean'},
  {id:'forest',   n:'Forest',    g:'dark',  bg:'#040e08', ac:'#10b981', gl:'rgba(16,185,129,.2)',   cls:'forest'},
  {id:'aurora',   n:'Aurora',    g:'dark',  bg:'#08040e', ac:'#d946ef', gl:'rgba(217,70,239,.2)',   cls:'aurora'},
  {id:'ironman',  n:'Iron Man',  g:'bold',  bg:'#050200', ac:'#ff6b00', gl:'rgba(255,107,0,.2)',    cls:'ironman'},
  {id:'light',    n:'Light',     g:'light', bg:'#f5f5f7', ac:'#0080ff', gl:'rgba(0,128,255,.12)',   cls:'light'},
  {id:'rosegold', n:'Rose Gold', g:'dark',  bg:'#1a0f0e', ac:'#e8a598', gl:'rgba(232,165,152,.2)', cls:'rosegold'},
  {id:'titanium', n:'Titanium',  g:'dark',  bg:'#0d0f11', ac:'#b4bcc8', gl:'rgba(180,188,200,.15)',cls:'titanium'},
];

const ALL_MODULES=[
  {id:'banks',  n:'Banks',       ic:'🏦', desc:'Accounts, IBAN, login details',      group:'Finance'},
  {id:'cards',  n:'Cards',       ic:'💳', desc:'Debit, credit, crypto & BNPL',       group:'Finance'},
  {id:'investments',n:'Investments',ic:'📈',desc:'Stocks, funds, bonds, crypto',      group:'Finance'},
  {id:'cash',    n:'Cash',        ic:'💵', desc:'Physical cash by location',          group:'Finance'},
  {id:'loans',   n:'Loans',       ic:'🤝', desc:'Money lent & borrowed',              group:'Finance'},
  {id:'expenses',n:'Expenses',   ic:'📋', desc:'Subscriptions & recurring bills',    group:'Finance'},
  {id:'credit',  n:'Credit Score',ic:'📊', desc:'Credit score tracker',              group:'Finance'},
  {id:'zakat',   n:'Zakat',       ic:'🌙', desc:'Annual zakat calculator',           group:'Finance'},
  {id:'tax',     n:'Tax',         ic:'🧾', desc:'Income tax calculator',             group:'Finance'},
  {id:'currency',n:'Currency',    ic:'💱', desc:'Live exchange rates',               group:'Finance'},
  {id:'gold',    n:'Precious Metals',ic:'🥇',desc:'Gold & silver prices',            group:'Assets'},
  {id:'assets', n:'Assets',      ic:'🏠', desc:'Property, vehicles, valuables',      group:'Assets'},
  {id:'friends', n:'Contacts',    ic:'👥', desc:'Contacts & people',                  group:'Identity'},
  {id:'sims',   n:'SIM Cards',   ic:'📱', desc:'Mobile numbers & networks',          group:'Identity'},
  {id:'documents',n:'Documents',ic:'🪪', desc:'IDs, passports, visas, contracts',   group:'Identity'},
  {id:'emails', n:'Emails',      ic:'📧', desc:'All email identities & security',    group:'Identity'},
  {id:'gadgets',n:'Gadgets',     ic:'💻', desc:'Devices, IMEI, warranty',            group:'Identity'},
  {id:'digital',n:'Digital',     ic:'💼', desc:'Logins, wallets, social media',      group:'Identity'},
  {id:'vehicles',n:'Vehicles',   ic:'🚗', desc:'Cars, fuel, service, insurance',     group:'Assets'},
  {id:'alerts',     n:'Alerts',     ic:'🔔', desc:'Expiry & urgent alerts',             group:'Tools'},
  {id:'timeline',   n:'Timeline',   ic:'📅', desc:'Activity history',                   group:'Tools'},
  {id:'reminders',  n:'Reminders',  ic:'⏰', desc:'Expiry alerts & upcoming dues',      group:'Tools'},
  {id:'ai-import',  n:'AI Import',  ic:'🤖', desc:'Smart pattern-matching data import', group:'Tools'},
  {id:'trash',      n:'Trash',      ic:'🗑️', desc:'Deleted items — restore or purge',    group:'Tools'},
  {id:'emergency',  n:'Emergency',  ic:'🆘', desc:'Emergency access info for first responders', group:'Tools'},
];

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
const Tags = {
  chips(tags = [], opts = {}) {
    if (!tags.length) return '';
    return tags.map(t => `<span style="display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:600;padding:2px 7px;border-radius:var(--r-pill,999px);background:rgba(123,95,255,.15);color:rgba(150,120,255,1);border:1px solid rgba(123,95,255,.25)">${t}${opts.removable ? `<span onclick="${opts.onRemove}('${t}')" style="cursor:pointer;margin-left:2px;opacity:.7">×</span>` : ''}</span>`).join(' ');
  },
  parse(str) {
    return (str || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
  },
  input(id, existing = [], presets = null) {
    const p = presets || this.PRESETS.slice(0, 8);
    return `<div>
      <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Tags (optional)</div>
      <input id="${id}" placeholder="e.g. uk, business, halal" value="${existing.join(', ')}"
        style="width:100%;background:var(--input,var(--glass2));border:1px solid var(--border);border-radius:10px;padding:12px;color:var(--text);font-size:14px;margin-bottom:6px">
      <div style="display:flex;flex-wrap:wrap;gap:4px">
        ${p.map(t => `<span onclick="(()=>{const el=document.getElementById('${id}');const cur=el.value.split(',').map(x=>x.trim()).filter(Boolean);if(!cur.includes('${t}')){cur.push('${t}');el.value=cur.join(', ');}else{el.value=cur.filter(x=>x!=='${t}').join(', ');}})()" style="font-size:10px;padding:2px 8px;border-radius:999px;background:var(--glass2);border:1px solid var(--border);color:var(--text3);cursor:pointer;touch-action:manipulation">${t}</span>`).join('')}
      </div>
    </div>`;
  },
  PRESETS: ['personal', 'business', 'uk', 'pakistan', 'uae', 'halal', 'urgent', 'archived', 'family', 'tax-related', 'investment'],
};

const escHtml = str => String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

// ===================== VAULT RELATIONS =====================
const VaultRelations = {
  cardsForBank(bankId) {
    return (S.cards || []).filter(c => c.linkedBankId === bankId || c.linkedBank === (S.banks||[]).find(b => b.id === bankId)?.bankName);
  },
  loansForContact(contactId) {
    return (S.loans || []).filter(l => {
      const contact = (S.friends || []).find(f => f.id === contactId);
      return contact && l.person === contact.name;
    });
  },
  docsForMember(memberId) {
    const family = typeof Family !== 'undefined' ? Family.get() : null;
    if (!family) return [];
    const member = memberId === 'head' ? family.head : family.members?.[memberId];
    return member?.docs || [];
  },
  bankSummary(bankId) {
    const bank = (S.banks || []).find(b => b.id === bankId);
    if (!bank) return null;
    const cards = this.cardsForBank(bankId);
    return { bank, cards, cardCount: cards.length, jointWith: bank.jointWith || null };
  },
  byTag(tag) {
    const results = [];
    const search = (arr, type) => (arr || []).filter(x => (x.tags || []).includes(tag)).forEach(x => results.push({...x, _type: type}));
    search(S.banks, 'bank'); search(S.cards, 'card'); search(S.documents, 'document');
    search(S.investments, 'investment'); search(S.loans, 'loan'); search(S.cash, 'cash');
    return results;
  },
  loanNetImpact() {
    const fx = typeof getFX === 'function' ? getFX() : {PKR:1,GBP:355,USD:280,AED:76};
    const toBase = (amt, cur) => (amt || 0) * (fx[cur] || 1);
    const owe = (S.loans || []).filter(l => l.type === 'borrowed' && l.status !== 'Settled').reduce((a, l) => a + toBase(l.amount, l.currency || 'PKR'), 0);
    const owed = (S.loans || []).filter(l => l.type === 'lent' && l.status !== 'Settled').reduce((a, l) => a + toBase(l.amount, l.currency || 'PKR'), 0);
    return { owe, owed, net: owed - owe };
  },
};

// ===================== DATA INTEGRITY =====================
const DataIntegrity = {
  cleanOrphanedBankLinks() {
    const bankIds = new Set((S.banks || []).map(b => b.id));
    let fixed = 0;
    (S.cards || []).forEach(c => { if (c.linkedBankId && !bankIds.has(c.linkedBankId)) { c.linkedBankId = ''; fixed++; } });
    return fixed;
  },
  findDuplicateBanks() {
    const seen = {};
    return (S.banks || []).filter(b => { const key = (b.bankName || '').toLowerCase() + '|' + (b.country || ''); if (seen[key]) return true; seen[key] = true; return false; });
  },
  findDuplicateCards() {
    const seen = {};
    return (S.cards || []).filter(c => { if (!c.last4) return false; const key = (c.last4 || '') + '|' + (c.network || '').toLowerCase(); if (seen[key]) return true; seen[key] = true; return false; });
  },
  expiredDocs() {
    const now = new Date();
    return (S.documents || []).filter(d => d.expiry && new Date(d.expiry) < now);
  },
  run() {
    const orphanedLinks = this.cleanOrphanedBankLinks();
    const dupBanks = this.findDuplicateBanks();
    const dupCards = this.findDuplicateCards();
    const expiredDocs = this.expiredDocs();
    if (orphanedLinks > 0) Store.save();
    return { orphanedLinks, dupBanks: dupBanks.length, dupCards: dupCards.length, expiredDocs: expiredDocs.length, issues: orphanedLinks + dupBanks.length + dupCards.length };
  },
  showReport() {
    const r = this.run();
    const dupBanks = this.findDuplicateBanks();
    const dupCards = this.findDuplicateCards();
    const hasDups = dupBanks.length + dupCards.length > 0;
    const lines = [
      r.orphanedLinks > 0 ? `✅ Fixed ${r.orphanedLinks} orphaned card-bank link(s)` : '✅ No orphaned links',
      r.dupBanks > 0 ? `⚠️ ${r.dupBanks} possible duplicate bank(s) found` : '✅ No duplicate banks',
      r.dupCards > 0 ? `⚠️ ${r.dupCards} possible duplicate card(s) found` : '✅ No duplicate cards',
      r.expiredDocs > 0 ? `⚠️ ${r.expiredDocs} expired document(s)` : '✅ No expired documents',
    ];
    Modal.open('🔍 Vault Integrity Check',
      `<div style="display:flex;flex-direction:column;gap:10px">
        ${lines.map(l => `<div style="padding:12px 14px;background:var(--glass);border-radius:10px;font-size:13px;color:var(--text)">${l}</div>`).join('')}
        ${r.issues === 0 ? '<div style="text-align:center;margin-top:8px;font-size:13px;color:var(--ok)">Vault is clean ✓</div>' : ''}
      </div>`,
      `${hasDups ? '<button class="btn btn-g" onclick="Modal.close();DataIntegrity.showDuplicates()">View Duplicates →</button>' : ''}<button class="btn btn-p" onclick="Modal.close()">Done</button>`
    );
  },
  showDuplicates() {
    const dupBanks = this.findDuplicateBanks();
    const dupCards = this.findDuplicateCards();
    if (!dupBanks.length && !dupCards.length) { Toast.show('No duplicates found ✓', 'success'); return; }
    const bankRows = dupBanks.map(b => `
      <div style="background:rgba(255,152,0,.08);border:1px solid rgba(255,152,0,.25);border-radius:12px;padding:12px 14px;margin-bottom:8px">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div><div style="font-size:13px;font-weight:600;color:var(--text)">🏦 ${b.bankName}</div><div style="font-size:11px;color:var(--text3)">${b.country||''} · ${b.accountType||''} · ${b.currency||''}</div></div>
          <button onclick="Banks.del('${b.id}');Modal.close();DataIntegrity.showDuplicates()" style="background:rgba(255,69,58,.12);border:1px solid rgba(255,69,58,.3);color:var(--err);border-radius:8px;padding:6px 12px;font-size:12px;cursor:pointer;touch-action:manipulation">Remove</button>
        </div>
      </div>`).join('');
    const cardRows = dupCards.map(c => `
      <div style="background:rgba(255,152,0,.08);border:1px solid rgba(255,152,0,.25);border-radius:12px;padding:12px 14px;margin-bottom:8px">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div><div style="font-size:13px;font-weight:600;color:var(--text)">💳 ${c.cardName}</div><div style="font-size:11px;color:var(--text3)">**** ${c.last4||''} · ${c.network||''}</div></div>
          <button onclick="Cards.del('${c.id}');Modal.close();DataIntegrity.showDuplicates()" style="background:rgba(255,69,58,.12);border:1px solid rgba(255,69,58,.3);color:var(--err);border-radius:8px;padding:6px 12px;font-size:12px;cursor:pointer;touch-action:manipulation">Remove</button>
        </div>
      </div>`).join('');
    Modal.open('⚠️ Possible Duplicates',
      `<div>
        <div style="font-size:12px;color:var(--text3);margin-bottom:16px;line-height:1.6">These entries appear to be duplicates based on name and country (banks) or last 4 digits and network (cards). Review and remove if needed.</div>
        ${dupBanks.length ? `<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);margin-bottom:8px">Duplicate Banks (${dupBanks.length})</div>${bankRows}` : ''}
        ${dupCards.length ? `<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);margin-bottom:8px;margin-top:${dupBanks.length?'12px':'0'}">Duplicate Cards (${dupCards.length})</div>${cardRows}` : ''}
      </div>`,
      `<button class="btn btn-p" onclick="Modal.close();DataIntegrity.showReport()">Done</button>`
    );
  },
};

const Audit = {
  log(item, action, changes = {}) {
    if (!item) return;
    if (!item._audit) item._audit = [];
    item._audit.unshift({ action, at: new Date().toISOString(), changes });
    item._audit = item._audit.slice(0, 10);
    item.updatedAt = new Date().toISOString();
  },
  render(item) {
    if (!item?._audit?.length) return '<div style="font-size:12px;color:var(--text3);padding:8px 0">No edit history yet</div>';
    return `<div style="display:flex;flex-direction:column;gap:8px;margin-top:12px">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text3)">Edit History</div>
      ${item._audit.map(a => `
        <div style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
          <div style="width:6px;height:6px;border-radius:50%;background:var(--accent,var(--purple,#7b5fff));flex-shrink:0;margin-top:5px"></div>
          <div>
            <div style="font-size:12px;font-weight:600;color:var(--text)">${a.action}</div>
            <div style="font-size:10px;color:var(--text3)">${new Date(a.at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
          </div>
        </div>`).join('')}
    </div>`;
  },
};

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
        <button class="btn btn-p" onclick="Emergency.save()" style="width:100%">Save Emergency Info</button>
        ${e.showOnLockscreen?`
        <div style="background:rgba(0,255,136,.08);border:1px solid rgba(0,255,136,.25);border-radius:14px;padding:16px">
          <div style="font-size:12px;font-weight:700;color:var(--ok);margin-bottom:8px">Preview — Lock Screen</div>
          <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:4px">🆘 ${e.name||'Name not set'}</div>
          <div style="font-size:13px;color:var(--text2)">${e.phone?'📞 '+e.phone:''}</div>
          <div style="font-size:12px;color:var(--text3);margin-top:4px">${e.bloodType?'🩸 '+e.bloodType:''}${e.allergies?' · ⚠️ '+e.allergies.split('\n')[0]:''}</div>
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
          <div style="font-size:20px;font-weight:800;color:var(--text)">${e.name||''}</div>
        </div>
        ${e.phone?`<div style="background:rgba(0,255,136,.1);border:1px solid rgba(0,255,136,.3);border-radius:12px;padding:14px;text-align:center"><div style="font-size:11px;color:var(--text3);margin-bottom:4px">EMERGENCY CONTACT</div><div style="font-size:18px;font-weight:700;color:var(--ok)">${e.phone}</div></div>`:''}
        ${e.bloodType?`<div style="background:rgba(255,59,48,.1);border:1px solid rgba(255,59,48,.3);border-radius:12px;padding:14px;text-align:center"><div style="font-size:11px;color:var(--text3);margin-bottom:4px">BLOOD TYPE</div><div style="font-size:24px;font-weight:900;color:var(--err)">${e.bloodType}</div></div>`:''}
        ${e.allergies?`<div style="background:rgba(255,152,0,.1);border:1px solid rgba(255,152,0,.3);border-radius:12px;padding:14px"><div style="font-size:11px;color:var(--text3);margin-bottom:4px">⚠️ ALLERGIES / MEDICATIONS</div><div style="font-size:13px;color:var(--text)">${e.allergies}</div></div>`:''}
        ${e.emergencyNote?`<div style="background:var(--glass);border:1px solid var(--border);border-radius:12px;padding:14px"><div style="font-size:11px;color:var(--text3);margin-bottom:4px">NOTE</div><div style="font-size:13px;color:var(--text)">${e.emergencyNote}</div></div>`:''}
      </div>`,
      `<button class="btn btn-p" onclick="Modal.close()">Close</button>`
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
    return {
      banks: (S.banks||[]).length,
      cards: (S.cards||[]).length,
      documents: (S.documents||[]).length,
      investments: (S.investments||[]).length,
      loans: (S.loans||[]).length,
      cash: (S.cash||[]).length,
      vehicles: (S.vehicles||[]).length,
      assets: (S.assets||[]).length,
      friends: (S.friends||[]).length,
      sims: (S.sims||[]).length,
      emails: (S.emails||[]).length,
      gadgets: (S.gadgets||[]).length,
      expenses: (S.expenses||[]).length,
      activity: (S.activity||[]).length,
      trash: (S.trash||[]).length,
      total: Object.values({
        banks:S.banks, cards:S.cards, documents:S.documents,
        investments:S.investments, loans:S.loans, cash:S.cash,
        vehicles:S.vehicles, assets:S.assets, friends:S.friends,
      }).reduce((a, arr) => a + (arr||[]).length, 0),
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
      const integrity = typeof DataIntegrity !== 'undefined' ? DataIntegrity.run() : null;
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
          ${integrity ? row('Integrity Issues', integrity.issues === 0 ? 'None ✓' : `${integrity.issues} found`, integrity.issues === 0) : ''}
          ${failedOps.length ? row('Failed Operations', failedOps.length, false) : row('Failed Operations', 'None ✓', true)}
          ${Object.entries(this._renderTimings).slice(0,5).map(([k,v]) => row(`Render: ${k}`, `${v}ms`)).join('')}
        </div>
        <button class="btn btn-g" onclick="DevDiag.copyReport()" style="width:100%;margin-top:10px;font-size:11px">Copy Report</button>
      `;
    }, 50);
  },

  copyReport() {
    const storage = this.storageUsage();
    const counts = this.entityCounts();
    const backup = this.backupAge();
    const report = [
      `VaultOS Diagnostics — ${new Date().toLocaleString()}`,
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
      `<button class="btn btn-g" onclick="Modal.close()">Dismiss</button><button class="btn btn-p" onclick="ExIm.export('vos');Modal.close()">Export Backup</button>`
    );
    return true;
  },
};

function compressImage(dataUrl, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image')) { resolve(dataUrl); return; }
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

const COUNTRIES=[
  {c:'PK',n:'Pakistan',f:'🇵🇰',p:'+92'},{c:'GB',n:'United Kingdom',f:'🇬🇧',p:'+44'},
  {c:'AE',n:'UAE',f:'🇦🇪',p:'+971'},{c:'US',n:'United States',f:'🇺🇸',p:'+1'},
  {c:'CA',n:'Canada',f:'🇨🇦',p:'+1'},{c:'AU',n:'Australia',f:'🇦🇺',p:'+61'},
  {c:'SG',n:'Singapore',f:'🇸🇬',p:'+65'},{c:'IN',n:'India',f:'🇮🇳',p:'+91'},
  {c:'SA',n:'Saudi Arabia',f:'🇸🇦',p:'+966'},{c:'QA',n:'Qatar',f:'🇶🇦',p:'+974'},
  {c:'OTHER',n:'Other',f:'🌐',p:'+0'},
];

const CURRENCIES=['PKR','GBP','USD','AED','EUR','SAR','CAD','AUD','SGD','INR','QAR','BTC','ETH','USDT'];

const BANKS_DB=[
  {n:'HBL',c:'PK',t:'commercial'},{n:'UBL',c:'PK',t:'commercial'},{n:'MCB Bank',c:'PK',t:'commercial'},
  {n:'Bank Alfalah',c:'PK',t:'commercial'},{n:'Allied Bank',c:'PK',t:'commercial'},{n:'Askari Bank',c:'PK',t:'commercial'},
  {n:'Meezan Bank',c:'PK',t:'islamic'},{n:'Bank Islami',c:'PK',t:'islamic'},{n:'Faysal Bank',c:'PK',t:'islamic'},
  {n:'Zindigi',c:'PK',t:'digital'},{n:'Sadapay',c:'PK',t:'digital'},{n:'NayaPay',c:'PK',t:'digital'},
  {n:'JazzCash',c:'PK',t:'microfinance'},{n:'EasyPaisa',c:'PK',t:'microfinance'},
  {n:'NBP',c:'PK',t:'government'},{n:'Bank of Punjab',c:'PK',t:'government'},
  {n:'HSBC',c:'GB',t:'commercial'},{n:'Barclays',c:'GB',t:'commercial'},{n:'NatWest',c:'GB',t:'commercial'},
  {n:'Lloyds Bank',c:'GB',t:'commercial'},{n:'Santander UK',c:'GB',t:'commercial'},{n:'Halifax',c:'GB',t:'commercial'},
  {n:'Nationwide',c:'GB',t:'commercial'},{n:'TSB Bank',c:'GB',t:'commercial'},{n:'Metro Bank',c:'GB',t:'commercial'},
  {n:'Monzo',c:'GB',t:'digital'},{n:'Starling Bank',c:'GB',t:'digital'},{n:'Revolut',c:'GB',t:'digital'},
  {n:'Wise',c:'GB',t:'international'},{n:'Chase UK',c:'GB',t:'digital'},{n:'First Direct',c:'GB',t:'digital'},
  {n:'Emirates NBD',c:'AE',t:'commercial'},{n:'ADCB',c:'AE',t:'commercial'},{n:'FAB',c:'AE',t:'commercial'},
  {n:'Mashreq Bank',c:'AE',t:'commercial'},{n:'RAKBANK',c:'AE',t:'commercial'},
  {n:'Dubai Islamic Bank',c:'AE',t:'islamic'},{n:'ADIB',c:'AE',t:'islamic'},
  {n:'Mashreq Neo',c:'AE',t:'digital'},{n:'Liv.',c:'AE',t:'digital'},{n:'Wio Bank',c:'AE',t:'digital'},
  {n:'Chase',c:'US',t:'commercial'},{n:'Bank of America',c:'US',t:'commercial'},{n:'Wells Fargo',c:'US',t:'commercial'},
  {n:'Citibank',c:'US',t:'commercial'},{n:'Capital One',c:'US',t:'commercial'},
  {n:'Bank Al Habib',c:'PK',t:'commercial'},{n:'Habib Metro Bank',c:'PK',t:'commercial'},
  {n:'JS Bank',c:'PK',t:'commercial'},{n:'Soneri Bank',c:'PK',t:'commercial'},
  {n:'Standard Chartered PK',c:'PK',t:'international'},{n:'Citibank PK',c:'PK',t:'international'},
  {n:'Dubai Islamic Bank PK',c:'PK',t:'islamic'},{n:'Al Baraka Bank',c:'PK',t:'islamic'},
  {n:'HBL Konnect',c:'PK',t:'digital'},{n:'UMicro',c:'PK',t:'microfinance'},
  {n:'Khushhali MFB',c:'PK',t:'microfinance'},{n:'FINCA MFB',c:'PK',t:'microfinance'},
  {n:'Co-operative Bank',c:'GB',t:'commercial'},{n:'Virgin Money',c:'GB',t:'commercial'},
  {n:'Santander',c:'GB',t:'commercial'},{n:'Atom Bank',c:'GB',t:'digital'},
  {n:'Zopa Bank',c:'GB',t:'digital'},{n:'Bunq',c:'GB',t:'digital'},
  {n:'Monese',c:'GB',t:'digital'},{n:'Cashplus',c:'GB',t:'digital'},
  {n:'HSBC Kinetic',c:'GB',t:'digital'},{n:'Lloyds Business',c:'GB',t:'commercial'},
  {n:'National Bank of Ras Al-Khaimah',c:'AE',t:'commercial'},{n:'Commercial Bank of Dubai',c:'AE',t:'commercial'},
  {n:'United Arab Bank',c:'AE',t:'commercial'},{n:'Ajman Bank',c:'AE',t:'islamic'},
  {n:'Sharjah Islamic Bank',c:'AE',t:'islamic'},{n:'Alinma Bank',c:'AE',t:'islamic'},
  {n:'Al Rajhi Bank',c:'SA',t:'islamic'},{n:'Saudi National Bank',c:'SA',t:'commercial'},
  {n:'Riyad Bank',c:'SA',t:'commercial'},{n:'Saudi British Bank (SABB)',c:'SA',t:'commercial'},
  {n:'HDFC Bank',c:'IN',t:'commercial'},{n:'ICICI Bank',c:'IN',t:'commercial'},
  {n:'State Bank of India',c:'IN',t:'government'},{n:'Axis Bank',c:'IN',t:'commercial'},
  {n:'DBS Bank',c:'SG',t:'commercial'},{n:'OCBC',c:'SG',t:'commercial'},
  {n:'Maybank',c:'MY',t:'commercial'},{n:'CIMB',c:'MY',t:'commercial'},
  {n:'Silk Bank',c:'PK',t:'commercial'},{n:'Summit Bank',c:'PK',t:'commercial'},
  {n:'First Women Bank',c:'PK',t:'government'},{n:'Bank of Khyber',c:'PK',t:'government'},
  {n:'Zarai Taraqiati Bank',c:'PK',t:'government'},{n:'SME Bank',c:'PK',t:'government'},
  {n:'Industrial Development Bank',c:'PK',t:'government'},{n:'Punjab Provincial Cooperative Bank',c:'PK',t:'cooperative'},
  {n:'MCB Islamic',c:'PK',t:'islamic'},{n:'UBL Ameen',c:'PK',t:'islamic'},{n:'HBL Islamic',c:'PK',t:'islamic'},
  {n:'Deutsche Bank PK',c:'PK',t:'international'},{n:'Taam',c:'PK',t:'microfinance'},
  {n:'U Microfinance',c:'PK',t:'microfinance'},{n:'NRSP',c:'PK',t:'microfinance'},
  {n:'Apna Microfinance',c:'PK',t:'microfinance'},{n:'Akhuwat',c:'PK',t:'microfinance'},
  {n:'Tide',c:'GB',t:'digital'},{n:'Anna Money',c:'GB',t:'digital'},{n:'Zempler',c:'GB',t:'digital'},
  {n:'Kroo',c:'GB',t:'digital'},{n:'Pockit',c:'GB',t:'digital'},{n:'Suits Me',c:'GB',t:'digital'},
  {n:'Chip',c:'GB',t:'digital'},{n:'Plum',c:'GB',t:'digital'},{n:'Tandem',c:'GB',t:'digital'},
  {n:'Cynergy Bank',c:'GB',t:'commercial'},
  {n:'Abu Dhabi Commercial Bank',c:'AE',t:'commercial'},{n:'National Bank of Fujairah',c:'AE',t:'commercial'},
  {n:'Al Hilal Bank',c:'AE',t:'islamic'},{n:'Bank of Sharjah',c:'AE',t:'commercial'},
  {n:'Invest Bank',c:'AE',t:'commercial'},{n:'Finance House',c:'AE',t:'commercial'},
  {n:'Aafaq Islamic',c:'AE',t:'islamic'},
];

const NETWORKS_DB=[
  {n:'Jazz',c:'PK'},{n:'Zong',c:'PK'},{n:'Ufone',c:'PK'},{n:'Telenor PK',c:'PK'},{n:'SCOM',c:'PK'},
  {n:'O2',c:'GB'},{n:'EE',c:'GB'},{n:'Vodafone UK',c:'GB'},{n:'Three UK',c:'GB'},{n:'Sky Mobile',c:'GB'},
  {n:'giffgaff',c:'GB'},{n:'Lebara UK',c:'GB'},{n:'Lyca Mobile',c:'GB'},{n:'Smarty',c:'GB'},
  {n:'Etisalat (e&)',c:'AE'},{n:'du',c:'AE'},{n:'Virgin Mobile UAE',c:'AE'},
  {n:'AT&T',c:'US'},{n:'Verizon',c:'US'},{n:'T-Mobile US',c:'US'},
  {n:'Airalo',c:'OTHER'},{n:'Holafly',c:'OTHER'},{n:'Nomad eSIM',c:'OTHER'},
  {n:'Ubigi',c:'OTHER'},{n:'Saily',c:'OTHER'},{n:'eSIM.me',c:'OTHER'},
  {n:'STC',c:'SA'},{n:'Mobily',c:'SA'},{n:'Zain KSA',c:'SA'},
  {n:'Ooredoo Qatar',c:'QA'},{n:'Vodafone Qatar',c:'QA'},
  {n:'Zain Kuwait',c:'KW'},{n:'Ooredoo Kuwait',c:'KW'},{n:'STC Kuwait',c:'KW'},
  {n:'Jio',c:'IN'},{n:'Airtel IN',c:'IN'},{n:'Vi (Vodafone Idea)',c:'IN'},{n:'BSNL',c:'IN'},
  {n:'Rogers',c:'CA'},{n:'Bell Canada',c:'CA'},{n:'Telus',c:'CA'},
  {n:'Telstra',c:'AU'},{n:'Optus',c:'AU'},{n:'Vodafone AU',c:'AU'},
];

const CARDS_DB=[
  {n:'Amex Centurion (Black)',net:'American Express',cat:'Premium'},
  {n:'Amex Platinum',net:'American Express',cat:'Premium'},
  {n:'Amex Gold',net:'American Express',cat:'Premium'},
  {n:'Amex Blue',net:'American Express',cat:'Standard'},
  {n:'British Airways Amex',net:'American Express',cat:'Travel'},
  {n:'Marriott Bonvoy Amex',net:'American Express',cat:'Travel'},
  {n:'NatWest Debit Visa',net:'Visa',cat:'Debit'},
  {n:'Monzo Debit Visa',net:'Visa',cat:'Debit'},
  {n:'Starling Debit Visa',net:'Visa',cat:'Debit'},
  {n:'Chase Sapphire Reserve',net:'Visa',cat:'Premium'},
  {n:'Wise Debit',net:'Visa',cat:'Debit'},
  {n:'Revolut Premium Visa',net:'Visa',cat:'Premium'},
  {n:'Virgin Atlantic Visa',net:'Visa',cat:'Travel'},
  {n:'Zable Visa',net:'Visa',cat:'Standard'},
  {n:'Barclaycard Mastercard',net:'Mastercard',cat:'Standard'},
  {n:'Aqua Card',net:'Mastercard',cat:'Standard'},
  {n:'Capital One Classic',net:'Mastercard',cat:'Standard'},
  {n:'Tesco Clubcard MC',net:'Mastercard',cat:'Rewards'},
  {n:'Monzo Credit Card',net:'Mastercard',cat:'Standard'},
  {n:'HBL Premier World Elite',net:'Mastercard',cat:'Premium'},
  {n:'HBL Debit Mastercard',net:'Mastercard',cat:'Debit'},
  {n:'UBL Debit Mastercard',net:'Mastercard',cat:'Debit'},
  {n:'Meezan Debit Visa',net:'Visa',cat:'Debit'},
  {n:'Emirates NBD Prestige',net:'Mastercard',cat:'Premium'},
  {n:'FAB Signature Visa',net:'Visa',cat:'Premium'},
  {n:'ADCB Prestige MC',net:'Mastercard',cat:'Premium'},
  {n:'Crypto.com Ruby',net:'Visa',cat:'Crypto'},
  {n:'Crypto.com Jade',net:'Visa',cat:'Crypto'},
  {n:'Crypto.com Obsidian',net:'Visa',cat:'Crypto'},
  {n:'Binance Visa',net:'Visa',cat:'Crypto'},
  {n:'Wirex Visa',net:'Visa',cat:'Crypto'},
  {n:'Klarna Card',net:'Visa',cat:'BNPL'},
  {n:'Clearpay Card',net:'Mastercard',cat:'BNPL'},
  {n:'Tabby Card',net:'Visa',cat:'BNPL'},
  {n:'Meezan Visa Debit',net:'Visa',cat:'Debit'},
  {n:'Bank Alfalah Visa Debit',net:'Visa',cat:'Debit'},
  {n:'Allied Bank MC Debit',net:'Mastercard',cat:'Debit'},
  {n:'UBL Visa Debit',net:'Visa',cat:'Debit'},
  {n:'HBL Platinum MC',net:'Mastercard',cat:'Premium'},
  {n:'HBL Islamic Visa',net:'Visa',cat:'Standard'},
  {n:'Sadapay MC',net:'Mastercard',cat:'Debit'},
  {n:'Zindigi MC',net:'Mastercard',cat:'Debit'},
  {n:'NayaPay Visa',net:'Visa',cat:'Debit'},
  {n:'Bank Al Habib Visa',net:'Visa',cat:'Debit'},
  {n:'Monese MC',net:'Mastercard',cat:'Debit'},
  {n:'Zempler MC',net:'Mastercard',cat:'Debit'},
  {n:'Tide Business Visa',net:'Visa',cat:'Debit'},
  {n:'Kroo Visa',net:'Visa',cat:'Debit'},
  {n:'Anna Business MC',net:'Mastercard',cat:'Debit'},
  {n:'Emirates Islamic Visa',net:'Visa',cat:'Standard'},
  {n:'Al Hilal Islamic Visa',net:'Visa',cat:'Standard'},
  {n:'ADCB Traveller Visa',net:'Visa',cat:'Travel'},
  {n:'Mashreq Neo Visa',net:'Visa',cat:'Debit'},
  {n:'FAB Islamic MC',net:'Mastercard',cat:'Standard'},
  {n:'HBL Prestige Visa Infinite',net:'Visa',cat:'Premium'},
  {n:'Meezan Infinite Visa',net:'Visa',cat:'Premium'},
  {n:'MCB Visa Infinite',net:'Visa',cat:'Premium'},
  {n:'UBL Platinum Mastercard',net:'Mastercard',cat:'Premium'},
  {n:'Faysal Islami Visa Infinite',net:'Visa',cat:'Premium'},
  {n:'JS Bank Visa Infinite',net:'Visa',cat:'Premium'},
  {n:'Askari Platinum Visa',net:'Visa',cat:'Premium'},
  {n:'Yonder Credit Card',net:'Visa',cat:'Rewards'},
  {n:'Zabel Visa',net:'Visa',cat:'Standard'},
  {n:'HSBC Premier World Elite Mastercard',net:'Mastercard',cat:'Premium'},
  {n:'FAB Infinite Visa',net:'Visa',cat:'Premium'},
  {n:'DIB Infinite Visa',net:'Visa',cat:'Premium'},
  {n:'Emirates NBD Skywards Infinite Visa',net:'Visa',cat:'Premium'},
  {n:'Mashreq Cashback World Mastercard',net:'Mastercard',cat:'Cashback'},
];

const BROKERS_DB=['Hargreaves Lansdown','AJ Bell','Trading 212','Freetrade','eToro','Vanguard UK','Sarwa','Baraka','Al Meezan','AKD Securities','JS Global','Binance','Coinbase','Kraken','Bybit','OKX',
  'Rafi Securities','JS Global Capital','Arif Habib Limited','Topline Securities','Alfalah Securities',
  'Next Capital','Sherman Securities','Ismail Iqbal Securities','IGI Securities','KASB Securities',
  'Optimus Capital','Pearl Securities','Vector Securities','CDC Pakistan','UBL Fund Managers',
  'Al Meezan Investments','NBP Funds','MCB Arif Habib Savings','Faysal Asset Management',
  'Atlas Asset Management','HBL Asset Management','NAFA Funds','Meezan Islamic Fund',
  'ABL Asset Management','Lakson Investments'];

// ===================== SMART AUTOCOMPLETE DB =====================
const SMART_DB = {
  banks:[
    // ── PK COMMERCIAL BANKS ──
    {name:'HBL',aliases:['Habib Bank Limited','Habib Bank','HBL Konnect','HBL Islamic','HBL Pay'],country:'PK',currency:'PKR',type:'commercial',swift:'HABBPKKA'},
    {name:'UBL',aliases:['United Bank Limited','United Bank','UBL Ameen'],country:'PK',currency:'PKR',type:'commercial',swift:'UNILPKKA'},
    {name:'MCB Bank',aliases:['MCB','Muslim Commercial Bank','MCB Islamic','NIB Bank'],country:'PK',currency:'PKR',type:'commercial',swift:'MCIBPKKA'},
    {name:'Bank Alfalah',aliases:['Alfalah','BankAlfalah','Bank Alfalah Islamic','Alfalah Islamic'],country:'PK',currency:'PKR',type:'commercial',swift:'ALFHPKKA'},
    {name:'Allied Bank',aliases:['ABL','Allied Bank Limited','Allied Islamic','Allied Bank Islamic'],country:'PK',currency:'PKR',type:'commercial',swift:'ABPAPKKA'},
    {name:'Askari Bank',aliases:['ACBL','Askari'],country:'PK',currency:'PKR',type:'commercial',swift:'ASCMPKKA'},
    {name:'Bank Al Habib',aliases:['BAHL','Al Habib Bank'],country:'PK',currency:'PKR',type:'commercial',swift:'BAHLPKKA'},
    {name:'Habib Metro Bank',aliases:['Habib Metropolitan','Habib Metro'],country:'PK',currency:'PKR',type:'commercial',swift:'MPBLPKKA'},
    {name:'Standard Chartered PK',aliases:['Standard Chartered Pakistan','StanChart PK','SC Pakistan'],country:'PK',currency:'PKR',type:'international',swift:'SCBLPKKX'},
    {name:'Deutsche Bank PK',aliases:['Deutsche Bank Pakistan'],country:'PK',currency:'PKR',type:'international',swift:'DEUTPKKA'},
    {name:'Bank of China PK',aliases:['Bank of China Pakistan','BOC Pakistan'],country:'PK',currency:'PKR',type:'international',swift:'BKCHPKKA'},
    {name:'ICBC Pakistan',aliases:['Industrial and Commercial Bank of China PK','ICBC PK'],country:'PK',currency:'PKR',type:'international',swift:null},
    {name:'China Development Bank PK',aliases:['CDB Pakistan'],country:'PK',currency:'PKR',type:'international',swift:null},
    {name:'SAMBA Bank',aliases:['Samba Financial Group PK','SAMBA PK'],country:'PK',currency:'PKR',type:'commercial',swift:'SMBOPKKA'},
    {name:'Silkbank',aliases:['Silk Bank','SILK'],country:'PK',currency:'PKR',type:'commercial',swift:null},
    {name:'Soneri Bank',aliases:['Soneri'],country:'PK',currency:'PKR',type:'commercial',swift:'SONEPKKA'},
    {name:'Summit Bank',aliases:['Summit','Sindh Bank Summit'],country:'PK',currency:'PKR',type:'commercial',swift:null},
    {name:'JS Bank',aliases:['JSB','JS'],country:'PK',currency:'PKR',type:'commercial',swift:'JSBLPKKA'},
    // ── PK ISLAMIC BANKS ──
    {name:'Meezan Bank',aliases:['Meezan','Al Meezan Bank'],country:'PK',currency:'PKR',type:'islamic',swift:'MEZNPKKA'},
    {name:'Bank Islami',aliases:['BankIslami','KASB Bank','BIPL'],country:'PK',currency:'PKR',type:'islamic',swift:null},
    {name:'Dubai Islamic Bank PK',aliases:['DIB Pakistan','DIB PK'],country:'PK',currency:'PKR',type:'islamic',swift:null},
    {name:'Al Baraka Bank PK',aliases:['Al Baraka Pakistan','Albaraka Bank PK'],country:'PK',currency:'PKR',type:'islamic',swift:'ARAKPKKA'},
    {name:'Faysal Bank',aliases:['Faysal','FBL','Faysal Bank Islamic'],country:'PK',currency:'PKR',type:'islamic',swift:'FAYSPKKA'},
    // ── PK MICROFINANCE / DIGITAL ──
    {name:'Sadapay',aliases:['Sada Pay'],country:'PK',currency:'PKR',type:'digital',swift:null},
    {name:'NayaPay',aliases:['Naya Pay'],country:'PK',currency:'PKR',type:'digital',swift:null},
    {name:'Zindigi',aliases:['Jazz Zindigi'],country:'PK',currency:'PKR',type:'digital',swift:null},
    {name:'JazzCash',aliases:['Jazz Cash','Jazz Mobile Money'],country:'PK',currency:'PKR',type:'microfinance',swift:null},
    {name:'EasyPaisa',aliases:['Easy Paisa','Easypaisa','Telenor Microfinance'],country:'PK',currency:'PKR',type:'microfinance',swift:null},
    {name:'UPaisa',aliases:['U Paisa','Ufone Wallet','Ufone Mobile Paisa'],country:'PK',currency:'PKR',type:'microfinance',swift:null},
    {name:'TimePey',aliases:['Time Pey'],country:'PK',currency:'PKR',type:'microfinance',swift:null},
    {name:'Finja',aliases:['SimSim','Finja SimSim'],country:'PK',currency:'PKR',type:'digital',swift:null},
    {name:'HBL Pay',aliases:['HBL Mobile Wallet','HBL Konnect Digital'],country:'PK',currency:'PKR',type:'digital',swift:null},
    {name:'MCB Lite',aliases:['MCB Mobile','MCB Lite Prepaid','MCB Mobile App'],country:'PK',currency:'PKR',type:'digital',swift:null},
    {name:'PayFast',aliases:['Pay Fast PK'],country:'PK',currency:'PKR',type:'digital',swift:null},
    // ── PK GOVERNMENT / DFI BANKS ──
    {name:'NBP',aliases:['National Bank of Pakistan','National Bank'],country:'PK',currency:'PKR',type:'government',swift:'NBPKPKKA'},
    {name:'Bank of Punjab',aliases:['BOP','BoP'],country:'PK',currency:'PKR',type:'government',swift:null},
    {name:'First Women Bank',aliases:['FWBL'],country:'PK',currency:'PKR',type:'government',swift:null},
    {name:'Zarai Taraqiati Bank',aliases:['ZTBL','Agricultural Bank PK','ADBP'],country:'PK',currency:'PKR',type:'government',swift:null},
    {name:'SME Bank',aliases:['SME Bank Pakistan','Small and Medium Enterprise Bank'],country:'PK',currency:'PKR',type:'government',swift:null},
    {name:'Industrial Development Bank',aliases:['IDBP'],country:'PK',currency:'PKR',type:'government',swift:null},
    {name:'HBFC',aliases:['House Building Finance Company','House Building Finance Corporation'],country:'PK',currency:'PKR',type:'government',swift:null},
    // ── PK FOREIGN BANKS ──
    {name:'HSBC Pakistan',aliases:['HSBC PK'],country:'PK',currency:'PKR',type:'international',swift:'HSBCPKKA'},
    {name:'Citibank PK',aliases:['Citi Pakistan','Citibank Pakistan','Citi PK'],country:'PK',currency:'PKR',type:'international',swift:'CITIPKKA'},
    // ── PK ADDITIONAL MICROFINANCE / SPECIAL BANKS ──
    {name:'Khushhali Microfinance Bank',aliases:['KMBL','Khushhali Bank','KMB','Khushhali MFB'],country:'PK',currency:'PKR',type:'microfinance',swift:null},
    {name:'NRSP Microfinance Bank',aliases:['NRSP Bank','NRSP MFB'],country:'PK',currency:'PKR',type:'microfinance',swift:null},
    {name:'Apna Microfinance Bank',aliases:['Apna Bank','Apna MFB'],country:'PK',currency:'PKR',type:'microfinance',swift:null},
    {name:'Mobilink Microfinance Bank',aliases:['MMBL','Mobilink Bank','Mobilink MFB'],country:'PK',currency:'PKR',type:'microfinance',swift:null},
    {name:'Telenor Microfinance Bank',aliases:['TMB','Telenor MFB'],country:'PK',currency:'PKR',type:'microfinance',swift:null},
    {name:'U Microfinance Bank',aliases:['U Bank','UMicro','U MFB'],country:'PK',currency:'PKR',type:'microfinance',swift:null},
    {name:'FINCA Microfinance Bank',aliases:['FINCA Pakistan','FINCA MFB'],country:'PK',currency:'PKR',type:'microfinance',swift:null},
    {name:'First MicroFinance Bank',aliases:['FMFB','First Micro','First MFB'],country:'PK',currency:'PKR',type:'microfinance',swift:null},
    {name:'Kashf Microfinance Bank',aliases:['Kashf Bank','Kashf MFB','Kashf Foundation'],country:'PK',currency:'PKR',type:'microfinance',swift:null},
    {name:'Akhuwat Islamic Microfinance',aliases:['Akhuwat Bank','Akhuwat'],country:'PK',currency:'PKR',type:'microfinance',swift:null},
    {name:'Pak Oman Investment Company',aliases:['Pak Oman','POIC'],country:'PK',currency:'PKR',type:'investment',swift:null},
    {name:'Pak Kuwait Investment Company',aliases:['Pak Kuwait','PKIC'],country:'PK',currency:'PKR',type:'investment',swift:null},
    {name:'Pakistan Post Savings',aliases:['Pakistan Post Office Savings','PO Savings','Post Office Savings'],country:'PK',currency:'PKR',type:'government',swift:null},
    // ── UK TRADITIONAL BANKS ──
    {name:'Barclays',aliases:['Barclays Bank','Barclaycard','Barclays International'],country:'GB',currency:'GBP',type:'commercial',swift:'BARCGB22'},
    {name:'HSBC UK',aliases:['HSBC','HSBC Holdings','HSBC Kinetic'],country:'GB',currency:'GBP',type:'commercial',swift:'MIDLGB22'},
    {name:'NatWest',aliases:['National Westminster Bank','National Westminster'],country:'GB',currency:'GBP',type:'commercial',swift:'NWBKGB2L'},
    {name:'Lloyds Bank',aliases:['Lloyds','Lloyds Banking Group','Lloyds Business','Lloyds International'],country:'GB',currency:'GBP',type:'commercial',swift:'LOYDGB2L'},
    {name:'Santander UK',aliases:['Santander','Abbey National'],country:'GB',currency:'GBP',type:'commercial',swift:'ABBYGB2L'},
    {name:'Halifax',aliases:['Halifax Bank','Halifax Building Society'],country:'GB',currency:'GBP',type:'commercial',swift:'HLFXGB21'},
    {name:'Nationwide',aliases:['Nationwide Building Society'],country:'GB',currency:'GBP',type:'commercial',swift:'NAIAGB21'},
    {name:'Metro Bank',aliases:['Metro Bank UK'],country:'GB',currency:'GBP',type:'commercial',swift:'MYMBGB2L'},
    {name:'TSB',aliases:['TSB Bank'],country:'GB',currency:'GBP',type:'commercial',swift:'TSBSGB2A'},
    {name:'Bank of Scotland',aliases:['BoS Scotland','BOS'],country:'GB',currency:'GBP',type:'commercial',swift:'BOFSGB21'},
    {name:'Royal Bank of Scotland',aliases:['RBS','RBS Group'],country:'GB',currency:'GBP',type:'commercial',swift:'RBSSGB2L'},
    {name:'Ulster Bank',aliases:['Ulster Bank NI'],country:'GB',currency:'GBP',type:'commercial',swift:null},
    {name:'Yorkshire Bank',aliases:['Yorkshire','Clydesdale Yorkshire'],country:'GB',currency:'GBP',type:'commercial',swift:null},
    {name:'Clydesdale Bank',aliases:['Clydesdale'],country:'GB',currency:'GBP',type:'commercial',swift:'CLYDGB21'},
    {name:'Virgin Money',aliases:['Virgin Money UK','Virgin Bank UK'],country:'GB',currency:'GBP',type:'commercial',swift:null},
    {name:'Co-operative Bank',aliases:['Co-op Bank','The Co-operative Bank','Cooperative Bank'],country:'GB',currency:'GBP',type:'commercial',swift:'CPBKGB22'},
    {name:'Post Office Money',aliases:['Post Office Bank','PO Money'],country:'GB',currency:'GBP',type:'commercial',swift:null},
    // ── UK DIGITAL / CHALLENGER BANKS ──
    {name:'Monzo',aliases:['Monzo Bank'],country:'GB',currency:'GBP',type:'digital',swift:'MONZGB2L'},
    {name:'Starling Bank',aliases:['Starling'],country:'GB',currency:'GBP',type:'digital',swift:'SRLGGB3L'},
    {name:'Revolut',aliases:['Revolut Bank'],country:'GB',currency:'GBP',type:'digital',swift:'REVOGB21'},
    {name:'Wise',aliases:['TransferWise','Wise Bank'],country:'GB',currency:'GBP',type:'digital',swift:'TRWIGB22'},
    {name:'Chase UK',aliases:['Chase Bank UK','JPMorgan Chase UK'],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'First Direct',aliases:['firstdirect'],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'Atom Bank',aliases:['Atom'],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'Tandem Bank',aliases:['Tandem'],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'Cashplus',aliases:['Zempler Bank','Cashplus Bank'],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'Suits Me',aliases:['SuitsMe'],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'Pockit',aliases:[],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'ANNA Money',aliases:['ANNA Business'],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'Tide',aliases:['Tide Business','Tide Bank'],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'Allica Bank',aliases:['Allica'],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'OakNorth Bank',aliases:['OakNorth'],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'Monument Bank',aliases:['Monument'],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'Zopa Bank',aliases:['Zopa'],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'Paysend',aliases:['Dozens','Paysend UK'],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'Zabel',aliases:['Zable','Zabel Visa'],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'Yonder',aliases:['Yonder Credit'],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'Wirex',aliases:['Wirex Visa','Wirex Bank'],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'Klarna',aliases:['Klarna Card','Klarna Bank'],country:'GB',currency:'GBP',type:'digital',swift:null},
    // ── UK ISLAMIC BANKS ──
    {name:'Al Rayan Bank',aliases:['Islamic Bank of Britain','Al Rayan'],country:'GB',currency:'GBP',type:'islamic',swift:null},
    {name:'Gatehouse Bank',aliases:['Gatehouse'],country:'GB',currency:'GBP',type:'islamic',swift:null},
    {name:'Ansar Finance',aliases:['Ansar Housing'],country:'GB',currency:'GBP',type:'islamic',swift:null},
    // ── UK INTERNATIONAL BANKS ──
    {name:'Citibank UK',aliases:['Citi UK'],country:'GB',currency:'GBP',type:'international',swift:'CITIGB2L'},
    {name:'JP Morgan UK',aliases:['JPMorgan UK','J.P. Morgan UK'],country:'GB',currency:'GBP',type:'international',swift:'CHASGB2L'},
    {name:'Goldman Sachs UK',aliases:['Marcus UK','Marcus by Goldman Sachs','Goldman Sachs Marcus'],country:'GB',currency:'GBP',type:'international',swift:null},
    // ── UAE COMMERCIAL BANKS ──
    {name:'Emirates NBD',aliases:['ENBD','Emirates NBD Bank','Emirates National Bank of Dubai'],country:'AE',currency:'AED',type:'commercial',swift:'EBILAEAD'},
    {name:'FAB',aliases:['First Abu Dhabi Bank','NBAD','National Bank of Abu Dhabi'],country:'AE',currency:'AED',type:'commercial',swift:'FABEAEAD'},
    {name:'ADCB',aliases:['Abu Dhabi Commercial Bank'],country:'AE',currency:'AED',type:'commercial',swift:'ADCBAEAD'},
    {name:'Mashreq Bank',aliases:['Mashreq','Mashreq Neo'],country:'AE',currency:'AED',type:'commercial',swift:'BOMLAEAD'},
    {name:'RAKBank',aliases:['RAKBANK','National Bank of Ras Al-Khaimah','NRAK'],country:'AE',currency:'AED',type:'commercial',swift:'RAKBAEAD'},
    {name:'Commercial Bank of Dubai',aliases:['CBD','CBD Dubai'],country:'AE',currency:'AED',type:'commercial',swift:'CBDUAEAD'},
    {name:'United Arab Bank',aliases:['UAB','UAB UAE'],country:'AE',currency:'AED',type:'commercial',swift:null},
    {name:'Bank of Sharjah',aliases:['BoS Sharjah','BOS Sharjah'],country:'AE',currency:'AED',type:'commercial',swift:null},
    {name:'Investbank',aliases:['Invest Bank UAE'],country:'AE',currency:'AED',type:'commercial',swift:null},
    {name:'National Bank of Fujairah',aliases:['NBF','NBF UAE'],country:'AE',currency:'AED',type:'commercial',swift:'NBFUAEAD'},
    {name:'National Bank of Umm Al Qaiwain',aliases:['NBQ','NBQ UAE'],country:'AE',currency:'AED',type:'commercial',swift:null},
    {name:'Arab Bank UAE',aliases:['Arab Bank Dubai'],country:'AE',currency:'AED',type:'commercial',swift:null},
    // ── UAE ISLAMIC BANKS ──
    {name:'ADIB',aliases:['Abu Dhabi Islamic Bank'],country:'AE',currency:'AED',type:'islamic',swift:'ADIBAEAA'},
    {name:'Dubai Islamic Bank',aliases:['DIB','DIB UAE'],country:'AE',currency:'AED',type:'islamic',swift:'DUIBAEAD'},
    {name:'Emirates Islamic',aliases:['EI Bank','Emirates Islamic Bank','EIB'],country:'AE',currency:'AED',type:'islamic',swift:null},
    {name:'Sharjah Islamic Bank',aliases:['SIB','SIB UAE'],country:'AE',currency:'AED',type:'islamic',swift:null},
    {name:'Alinma Abu Dhabi',aliases:['Alinma Bank UAE'],country:'AE',currency:'AED',type:'islamic',swift:null},
    // ── UAE DIGITAL BANKS ──
    {name:'Wio Bank',aliases:['Wio'],country:'AE',currency:'AED',type:'digital',swift:null},
    {name:'Liv.',aliases:['Liv Bank','Emirates NBD Liv','Liv by Emirates NBD'],country:'AE',currency:'AED',type:'digital',swift:null},
    {name:'YAP',aliases:['YAP UAE'],country:'AE',currency:'AED',type:'digital',swift:null},
    {name:'NOW Money',aliases:['Now Money UAE'],country:'AE',currency:'AED',type:'digital',swift:null},
    {name:'Zand Bank',aliases:['Zand'],country:'AE',currency:'AED',type:'digital',swift:null},
    {name:'Nomo Bank',aliases:['Nomo'],country:'AE',currency:'AED',type:'digital',swift:null},
    // ── UAE INTERNATIONAL BANKS ──
    {name:'Citibank UAE',aliases:['Citi UAE','Citibank Dubai'],country:'AE',currency:'AED',type:'international',swift:'CITIAEAD'},
    {name:'HSBC UAE',aliases:['HSBC Dubai','HSBC Abu Dhabi'],country:'AE',currency:'AED',type:'international',swift:'BBMEAEAD'},
    {name:'Standard Chartered UAE',aliases:['StanChart UAE','Standard Chartered Dubai'],country:'AE',currency:'AED',type:'international',swift:'SCBLAEAD'},
    {name:'Barclays UAE',aliases:['Barclays Dubai'],country:'AE',currency:'AED',type:'international',swift:null},
    // ── US BANKS ──
    {name:'Citibank',aliases:['Citi','Citigroup'],country:'US',currency:'USD',type:'commercial',swift:'CITIUS33'},
    {name:'Chase',aliases:['JPMorgan Chase','JP Morgan'],country:'US',currency:'USD',type:'commercial',swift:'CHASUS33'},
    {name:'Bank of America',aliases:['BofA','BoA'],country:'US',currency:'USD',type:'commercial',swift:'BOFAUS3N'},
    {name:'Wells Fargo',aliases:[],country:'US',currency:'USD',type:'commercial',swift:'WFBIUS6S'},
  ],
  cards:[
    // ── PK CARDS — HBL ──
    {name:'HBL Visa Debit',network:'Visa',type:'Debit',country:'PK',category:'Standard'},
    {name:'HBL Platinum Visa Credit',network:'Visa',type:'Credit',country:'PK',category:'Premium'},
    {name:'HBL Gold Mastercard',network:'Mastercard',type:'Credit',country:'PK',category:'Standard'},
    {name:'HBL Classic Visa',network:'Visa',type:'Credit',country:'PK',category:'Standard'},
    {name:'HBL CashBack Card',network:'Visa',type:'Credit',country:'PK',category:'Cashback'},
    {name:'HBL Konnect Wallet',network:'Mastercard',type:'Prepaid',country:'PK',category:'Digital'},
    // ── PK CARDS — UBL ──
    {name:'UBL Visa Debit',network:'Visa',type:'Debit',country:'PK',category:'Standard'},
    {name:'UBL Unionpay Debit',network:'UnionPay',type:'Debit',country:'PK',category:'Standard'},
    {name:'UBL Rewards Credit Card',network:'Visa',type:'Credit',country:'PK',category:'Rewards'},
    {name:'UBL Gold Visa Credit',network:'Visa',type:'Credit',country:'PK',category:'Standard'},
    {name:'UBL Business Card',network:'Visa',type:'Credit',country:'PK',category:'Business'},
    // ── PK CARDS — MCB ──
    {name:'MCB Visa Debit',network:'Visa',type:'Debit',country:'PK',category:'Standard'},
    {name:'MCB Mastercard Credit',network:'Mastercard',type:'Credit',country:'PK',category:'Standard'},
    {name:'MCB Lite Prepaid',network:'Visa',type:'Prepaid',country:'PK',category:'Digital'},
    {name:'MCB Gold Credit',network:'Mastercard',type:'Credit',country:'PK',category:'Standard'},
    {name:'MCB Titanium Credit',network:'Mastercard',type:'Credit',country:'PK',category:'Premium'},
    // ── PK CARDS — Bank Alfalah ──
    {name:'Alfalah Visa Debit',network:'Visa',type:'Debit',country:'PK',category:'Standard'},
    {name:'Alfalah Platinum Visa',network:'Visa',type:'Credit',country:'PK',category:'Premium'},
    {name:'Alfalah CashBack Mastercard',network:'Mastercard',type:'Credit',country:'PK',category:'Cashback'},
    {name:'Alfalah Alfa Rewards Card',network:'Visa',type:'Credit',country:'PK',category:'Rewards'},
    {name:'Alfalah Virtual Card',network:'Visa',type:'Prepaid',country:'PK',category:'Digital'},
    // ── PK CARDS — Meezan ──
    {name:'Meezan Visa Debit',network:'Visa',type:'Debit',country:'PK',category:'Islamic'},
    {name:'Meezan Platinum Card',network:'Visa',type:'Credit',country:'PK',category:'Islamic'},
    {name:'Meezan Islamic Credit Card',network:'Visa',type:'Credit',country:'PK',category:'Islamic'},
    {name:'Meezan Prepaid Card',network:'Visa',type:'Prepaid',country:'PK',category:'Islamic'},
    // ── PK CARDS — Allied Bank ──
    {name:'ABL Visa Debit',network:'Visa',type:'Debit',country:'PK',category:'Standard'},
    {name:'ABL Gold Credit',network:'Visa',type:'Credit',country:'PK',category:'Standard'},
    {name:'ABL Platinum Credit',network:'Visa',type:'Credit',country:'PK',category:'Premium'},
    // ── PK CARDS — Faysal Bank ──
    {name:'Faysal Visa Debit',network:'Visa',type:'Debit',country:'PK',category:'Islamic'},
    {name:'Faysal Islamic Credit Card',network:'Visa',type:'Credit',country:'PK',category:'Islamic'},
    {name:'Faysal Titanium Card',network:'Visa',type:'Credit',country:'PK',category:'Premium'},
    // ── PK CARDS — Digital/Fintech ──
    {name:'Sadapay Mastercard',network:'Mastercard',type:'Debit',country:'PK',category:'Digital'},
    {name:'NayaPay Visa Prepaid',network:'Visa',type:'Prepaid',country:'PK',category:'Digital'},
    {name:'Zindigi Mastercard',network:'Mastercard',type:'Debit',country:'PK',category:'Digital'},
    {name:'JazzCash Mastercard Prepaid',network:'Mastercard',type:'Prepaid',country:'PK',category:'Digital'},
    {name:'EasyPaisa Mastercard Prepaid',network:'Mastercard',type:'Prepaid',country:'PK',category:'Digital'},
    // ── PK CARDS — Standard Chartered ──
    {name:'SC Visa Debit',network:'Visa',type:'Debit',country:'PK',category:'Standard'},
    {name:'SC Smart Visa Credit',network:'Visa',type:'Credit',country:'PK',category:'Standard'},
    {name:'SC Ultimate Visa',network:'Visa',type:'Credit',country:'PK',category:'Premium'},
    {name:'SC Platinum Mastercard',network:'Mastercard',type:'Credit',country:'PK',category:'Premium'},
    // ── PK CARDS — Habib Metro ──
    {name:'Habib Metro Visa Debit',network:'Visa',type:'Debit',country:'PK',category:'Standard'},
    {name:'Habib Metro Mastercard Credit',network:'Mastercard',type:'Credit',country:'PK',category:'Standard'},
    // ── PK CARDS — Bank Al Habib ──
    {name:'BAHL Visa Debit',network:'Visa',type:'Debit',country:'PK',category:'Standard'},
    {name:'BAHL Gold Mastercard',network:'Mastercard',type:'Credit',country:'PK',category:'Standard'},
    // ── PK CARDS — JS Bank ──
    {name:'JS Bank Visa Debit',network:'Visa',type:'Debit',country:'PK',category:'Standard'},
    {name:'JS Bank Mastercard Credit',network:'Mastercard',type:'Credit',country:'PK',category:'Standard'},
    // ── PK CARDS — Soneri Bank ──
    {name:'Soneri Visa Debit',network:'Visa',type:'Debit',country:'PK',category:'Standard'},
    {name:'Soneri Mastercard Credit',network:'Mastercard',type:'Credit',country:'PK',category:'Standard'},
    // ── PK CARDS — Askari Bank ──
    {name:'ACBL Visa Debit',network:'Visa',type:'Debit',country:'PK',category:'Standard'},
    {name:'ACBL Gold Visa Credit',network:'Visa',type:'Credit',country:'PK',category:'Standard'},
    {name:'ACBL Titanium Card',network:'Visa',type:'Credit',country:'PK',category:'Premium'},
    // ── UK CARDS — Monzo ──
    {name:'Monzo Mastercard Debit',network:'Mastercard',type:'Debit',country:'GB',category:'Digital'},
    {name:'Monzo Plus Mastercard',network:'Mastercard',type:'Debit',country:'GB',category:'Digital'},
    {name:'Monzo Premium Metal',network:'Mastercard',type:'Debit',country:'GB',category:'Premium'},
    // ── UK CARDS — Starling ──
    {name:'Starling Mastercard Debit',network:'Mastercard',type:'Debit',country:'GB',category:'Digital'},
    {name:'Starling Business Mastercard',network:'Mastercard',type:'Debit',country:'GB',category:'Business'},
    // ── UK CARDS — Revolut ──
    {name:'Revolut Visa Debit',network:'Visa',type:'Debit',country:'GB',category:'Digital'},
    {name:'Revolut Metal Visa',network:'Visa',type:'Debit',country:'GB',category:'Premium'},
    {name:'Revolut Ultra Visa',network:'Visa',type:'Debit',country:'GB',category:'Premium'},
    // ── UK CARDS — Wise ──
    {name:'Wise Mastercard Debit',network:'Mastercard',type:'Debit',country:'GB',category:'Digital'},
    // ── UK CARDS — Barclays ──
    {name:'Barclays Visa Debit',network:'Visa',type:'Debit',country:'GB',category:'Standard'},
    {name:'Barclays Avios Visa Credit',network:'Visa',type:'Credit',country:'GB',category:'Rewards'},
    {name:'Barclays Platinum Visa',network:'Visa',type:'Credit',country:'GB',category:'Premium'},
    {name:'Barclaycard Cashback Visa',network:'Visa',type:'Credit',country:'GB',category:'Cashback'},
    {name:'Barclays Business Debit',network:'Visa',type:'Debit',country:'GB',category:'Business'},
    // ── UK CARDS — HSBC ──
    {name:'HSBC Visa Debit',network:'Visa',type:'Debit',country:'GB',category:'Standard'},
    {name:'HSBC Premier Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Premium'},
    {name:'HSBC Rewards Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Rewards'},
    {name:'HSBC Balance Transfer Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Standard'},
    // ── UK CARDS — NatWest ──
    {name:'NatWest Visa Debit',network:'Visa',type:'Debit',country:'GB',category:'Standard'},
    {name:'NatWest Reward Black Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Premium'},
    {name:'NatWest Platinum Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Premium'},
    // ── UK CARDS — Lloyds ──
    {name:'Lloyds Visa Debit',network:'Visa',type:'Debit',country:'GB',category:'Standard'},
    {name:'Lloyds Avios Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Rewards'},
    {name:'Lloyds Cashback Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Cashback'},
    {name:'Lloyds Platinum Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Premium'},
    // ── UK CARDS — Santander ──
    {name:'Santander Visa Debit',network:'Visa',type:'Debit',country:'GB',category:'Standard'},
    {name:'Santander All in One Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Rewards'},
    {name:'Santander Everyday Cashback Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Cashback'},
    // ── UK CARDS — Halifax ──
    {name:'Halifax Visa Debit',network:'Visa',type:'Debit',country:'GB',category:'Standard'},
    {name:'Halifax Clarity Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Travel'},
    {name:'Halifax Cashback Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Cashback'},
    // ── UK CARDS — Chase / First Direct ──
    {name:'Chase Visa Debit',network:'Visa',type:'Debit',country:'GB',category:'Digital'},
    {name:'First Direct Visa Debit',network:'Visa',type:'Debit',country:'GB',category:'Digital'},
    {name:'First Direct Credit Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Standard'},
    // ── UK CARDS — American Express ──
    {name:'Amex Gold Rewards',network:'American Express',type:'Credit',country:'GB',category:'Rewards'},
    {name:'Amex Platinum',network:'American Express',type:'Credit',country:'GB',category:'Premium'},
    {name:'Amex BA Premium Plus',network:'American Express',type:'Credit',country:'GB',category:'Premium'},
    {name:'Amex Cashback Everyday',network:'American Express',type:'Credit',country:'GB',category:'Cashback'},
    {name:'Amex Nectar',network:'American Express',type:'Credit',country:'GB',category:'Rewards'},
    {name:'Amex Preferred Rewards Gold UK',network:'American Express',type:'Credit',country:'GB',category:'Rewards'},
    // ── UK CARDS — Nationwide ──
    {name:'Nationwide Visa Debit',network:'Visa',type:'Debit',country:'GB',category:'Standard'},
    {name:'Nationwide FlexPlus Visa',network:'Visa',type:'Debit',country:'GB',category:'Standard'},
    {name:'Nationwide Select Credit Card',network:'Visa',type:'Credit',country:'GB',category:'Standard'},
    // ── UK CARDS — Virgin Money ──
    {name:'Virgin Money Visa Debit',network:'Visa',type:'Debit',country:'GB',category:'Standard'},
    {name:'Virgin Money All Round Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Rewards'},
    // ── UK CARDS — Co-op Bank ──
    {name:'Co-op Bank Visa Debit',network:'Visa',type:'Debit',country:'GB',category:'Standard'},
    {name:'Co-op Bank Ethical Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Standard'},
    // ── UK CARDS — TSB ──
    {name:'TSB Spend & Save Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Cashback'},
    {name:'TSB Platinum Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Premium'},
    // ── UK CARDS — Metro Bank ──
    {name:'Metro Bank Mastercard Debit',network:'Mastercard',type:'Debit',country:'GB',category:'Standard'},
    {name:'Metro Bank Personal Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Standard'},
    // ── UK CARDS — Travel ──
    {name:'Curve Mastercard',network:'Mastercard',type:'Debit',country:'GB',category:'Digital'},
    {name:'Caxton Mastercard',network:'Mastercard',type:'Prepaid',country:'GB',category:'Travel'},
    {name:'FairFX Mastercard',network:'Mastercard',type:'Prepaid',country:'GB',category:'Travel'},
    {name:'Post Office Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Travel'},
    // ── UK CARDS — Retail / Partner ──
    {name:"Sainsbury's Bank Nectar Mastercard",network:'Mastercard',type:'Credit',country:'GB',category:'Rewards'},
    {name:'John Lewis Partnership Card',network:'Mastercard',type:'Credit',country:'GB',category:'Rewards'},
    {name:'M&S Bank Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Rewards'},
    {name:'Tesco Bank Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Cashback'},
    {name:'Asda Money Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Cashback'},
    {name:'AA Credit Card Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Standard'},
    {name:'RAC Credit Card Visa',network:'Visa',type:'Credit',country:'GB',category:'Standard'},
    // ── UK CARDS — Credit Building ──
    {name:'Capital One Classic Mastercard UK',network:'Mastercard',type:'Credit',country:'GB',category:'Standard'},
    {name:'Aqua Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Standard'},
    {name:'Marbles Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Standard'},
    {name:'Vanquis Visa',network:'Visa',type:'Credit',country:'GB',category:'Standard'},
    // ── UAE CARDS — Emirates NBD ──
    {name:'ENBD Visa Debit',network:'Visa',type:'Debit',country:'AE',category:'Standard'},
    {name:'ENBD Titanium Mastercard',network:'Mastercard',type:'Credit',country:'AE',category:'Standard'},
    {name:'ENBD Go4it Gold Visa',network:'Visa',type:'Credit',country:'AE',category:'Rewards'},
    {name:'ENBD Skywards Infinite Visa',network:'Visa',type:'Credit',country:'AE',category:'Premium'},
    // ── UAE CARDS — FAB ──
    {name:'FAB Visa Debit',network:'Visa',type:'Debit',country:'AE',category:'Standard'},
    {name:'FAB Cashback Platinum Visa',network:'Visa',type:'Credit',country:'AE',category:'Cashback'},
    {name:'FAB World Elite Mastercard',network:'Mastercard',type:'Credit',country:'AE',category:'Premium'},
    {name:'FAB Islamic Mastercard',network:'Mastercard',type:'Credit',country:'AE',category:'Islamic'},
    // ── UAE CARDS — ADCB ──
    {name:'ADCB Visa Debit',network:'Visa',type:'Debit',country:'AE',category:'Standard'},
    {name:'ADCB Lulu Mastercard',network:'Mastercard',type:'Credit',country:'AE',category:'Rewards'},
    {name:'ADCB SimplyLife Mastercard',network:'Mastercard',type:'Credit',country:'AE',category:'Standard'},
    {name:'ADCB Traveller Credit Card',network:'Visa',type:'Credit',country:'AE',category:'Travel'},
    // ── UAE CARDS — DIB ──
    {name:'DIB Visa Debit',network:'Visa',type:'Debit',country:'AE',category:'Islamic'},
    {name:'DIB Platinum Visa',network:'Visa',type:'Credit',country:'AE',category:'Islamic'},
    {name:'DIB Cashback Card',network:'Mastercard',type:'Credit',country:'AE',category:'Islamic'},
    {name:'DIB Islamic Credit Card',network:'Visa',type:'Credit',country:'AE',category:'Islamic'},
    // ── UAE CARDS — ADIB ──
    {name:'ADIB Visa Debit',network:'Visa',type:'Debit',country:'AE',category:'Islamic'},
    {name:'ADIB Cashback Visa',network:'Visa',type:'Credit',country:'AE',category:'Islamic'},
    // ── UAE CARDS — Mashreq ──
    {name:'Mashreq Neo Visa Debit',network:'Visa',type:'Debit',country:'AE',category:'Digital'},
    {name:'Mashreq Cashback Credit Visa',network:'Visa',type:'Credit',country:'AE',category:'Cashback'},
    {name:'Mashreq Solitaire Mastercard',network:'Mastercard',type:'Credit',country:'AE',category:'Premium'},
    // ── UAE CARDS — Wio / Liv. ──
    {name:'Wio Visa Debit',network:'Visa',type:'Debit',country:'AE',category:'Digital'},
    {name:'Liv. Mastercard Debit',network:'Mastercard',type:'Debit',country:'AE',category:'Digital'},
    // ── UAE CARDS — Emirates Islamic ──
    {name:'EI Visa Debit',network:'Visa',type:'Debit',country:'AE',category:'Islamic'},
    {name:'EI Cashback Card',network:'Visa',type:'Credit',country:'AE',category:'Islamic'},
    {name:'EI Business Card',network:'Visa',type:'Credit',country:'AE',category:'Business'},
    // ── UAE CARDS — RAKBank ──
    {name:'RAK Visa Debit',network:'Visa',type:'Debit',country:'AE',category:'Standard'},
    {name:'RAK MaxSaver Mastercard',network:'Mastercard',type:'Credit',country:'AE',category:'Rewards'},
    {name:'RAK Titanium Mastercard',network:'Mastercard',type:'Credit',country:'AE',category:'Premium'},
    // ── UAE CARDS — American Express ──
    {name:'Amex Gold UAE',network:'American Express',type:'Credit',country:'AE',category:'Rewards'},
    {name:'Amex Platinum UAE',network:'American Express',type:'Credit',country:'AE',category:'Premium'},
    {name:'Amex Marriott Bonvoy UAE',network:'American Express',type:'Credit',country:'AE',category:'Premium'},
    // ── UAE CARDS — Premium/Infinite additions ──
    {name:'FAB Infinite Visa',network:'Visa',type:'Credit',country:'AE',category:'Premium'},
    {name:'ADCB Traveller Visa Infinite',network:'Visa',type:'Credit',country:'AE',category:'Travel'},
    {name:'Mashreq Cashback World Mastercard',network:'Mastercard',type:'Credit',country:'AE',category:'Cashback'},
    {name:'DIB Infinite Visa',network:'Visa',type:'Credit',country:'AE',category:'Islamic'},
    // ── PK CARDS — Infinite/Prestige tier ──
    {name:'HBL Prestige Visa Infinite',network:'Visa',type:'Credit',country:'PK',category:'Premium'},
    {name:'HBL Meezan Infinity Visa',network:'Visa',type:'Credit',country:'PK',category:'Islamic'},
    {name:'Meezan Infinite Visa',network:'Visa',type:'Credit',country:'PK',category:'Islamic'},
    {name:'MCB Visa Infinite',network:'Visa',type:'Credit',country:'PK',category:'Premium'},
    {name:'UBL Platinum Mastercard',network:'Mastercard',type:'Credit',country:'PK',category:'Premium'},
    {name:'Faysal Islami Visa Infinite',network:'Visa',type:'Credit',country:'PK',category:'Islamic'},
    {name:'Bank Al Habib Visa Platinum',network:'Visa',type:'Credit',country:'PK',category:'Premium'},
    {name:'JS Bank Visa Infinite',network:'Visa',type:'Credit',country:'PK',category:'Premium'},
    // ── UK CARDS — Premium additions ──
    {name:'Yonder Credit Card',network:'Visa',type:'Credit',country:'GB',category:'Rewards'},
    {name:'Zabel Visa',network:'Visa',type:'Credit',country:'GB',category:'Standard'},
    {name:'HSBC Premier World Elite Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Premium'},
    {name:'Virgin Money Rewards Visa',network:'Visa',type:'Credit',country:'GB',category:'Rewards'},
  ],
  sims:[
    // ── PK ──
    {network:'Jazz',country:'PK',prefixes:['300','306','307','308'],type:'Physical',currency:'PKR'},
    {network:'Zong',country:'PK',prefixes:['310','311','312','313','314','315'],type:'Physical',currency:'PKR'},
    {network:'Ufone',country:'PK',prefixes:['333','331','332'],type:'Physical',currency:'PKR'},
    {network:'Telenor Pakistan',country:'PK',prefixes:['340','341','342','343','344','345','346'],type:'Physical',currency:'PKR'},
    {network:'SCOM',country:'PK',prefixes:['320'],type:'Physical',currency:'PKR'},
    {network:'SCO',country:'PK',prefixes:['321'],type:'Physical',currency:'PKR'},
    {network:'EVO',country:'PK',prefixes:[],type:'Physical',currency:'PKR'},
    // ── UK ──
    {network:'EE',country:'GB',prefixes:['7'],type:'Physical',currency:'GBP'},
    {network:'O2',country:'GB',prefixes:['7'],type:'Physical',currency:'GBP'},
    {network:'Vodafone UK',country:'GB',prefixes:['7'],type:'Physical',currency:'GBP'},
    {network:'Three UK',country:'GB',prefixes:['7'],type:'Physical',currency:'GBP'},
    {network:'Sky Mobile',country:'GB',prefixes:['7'],type:'Physical',currency:'GBP'},
    {network:'Virgin Mobile UK',country:'GB',prefixes:['7'],type:'Physical',currency:'GBP'},
    {network:'iD Mobile',country:'GB',prefixes:['7'],type:'Physical',currency:'GBP'},
    {network:'SMARTY',country:'GB',prefixes:['7'],type:'Physical',currency:'GBP'},
    {network:'VOXI',country:'GB',prefixes:['7'],type:'Physical',currency:'GBP'},
    {network:'giffgaff',country:'GB',prefixes:['7'],type:'Physical',currency:'GBP'},
    {network:'Lebara UK',country:'GB',prefixes:['7'],type:'Physical',currency:'GBP'},
    {network:'Lycamobile UK',country:'GB',prefixes:['7'],type:'Physical',currency:'GBP'},
    {network:'Tesco Mobile',country:'GB',prefixes:['7'],type:'Physical',currency:'GBP'},
    {network:'BT Mobile',country:'GB',prefixes:['7'],type:'Physical',currency:'GBP'},
    {network:'Plusnet Mobile',country:'GB',prefixes:['7'],type:'Physical',currency:'GBP'},
    // ── UAE ──
    {network:'Etisalat',country:'AE',prefixes:['5'],type:'Physical',currency:'AED'},
    {network:'e&',country:'AE',prefixes:['5'],type:'Physical',currency:'AED'},
    {network:'du',country:'AE',prefixes:['5'],type:'Physical',currency:'AED'},
    {network:'Virgin Mobile UAE',country:'AE',prefixes:['5'],type:'Physical',currency:'AED'},
    {network:'Lebara UAE',country:'AE',prefixes:['5'],type:'Physical',currency:'AED'},
    {network:'C\'ME',country:'AE',prefixes:['5'],type:'Physical',currency:'AED'},
    // ── US ──
    {network:'AT&T',country:'US',prefixes:[],type:'Physical',currency:'USD'},
    {network:'Verizon',country:'US',prefixes:[],type:'Physical',currency:'USD'},
    {network:'T-Mobile',country:'US',prefixes:[],type:'Physical',currency:'USD'},
    {network:'Mint Mobile',country:'US',prefixes:[],type:'Physical',currency:'USD'},
    {network:'Google Fi',country:'US',prefixes:[],type:'Physical',currency:'USD'},
    {network:'Cricket Wireless',country:'US',prefixes:[],type:'Physical',currency:'USD'},
    {network:'Metro by T-Mobile',country:'US',prefixes:[],type:'Physical',currency:'USD'},
    {network:'Boost Mobile',country:'US',prefixes:[],type:'Physical',currency:'USD'},
    // ── India ──
    {network:'Airtel India',country:'IN',prefixes:[],type:'Physical',currency:'INR'},
    {network:'Jio',country:'IN',prefixes:[],type:'Physical',currency:'INR'},
    {network:'BSNL',country:'IN',prefixes:[],type:'Physical',currency:'INR'},
    // ── Saudi Arabia ──
    {network:'STC',country:'SA',prefixes:[],type:'Physical',currency:'SAR'},
    {network:'Mobily',country:'SA',prefixes:[],type:'Physical',currency:'SAR'},
    {network:'Zain Saudi',country:'SA',prefixes:[],type:'Physical',currency:'SAR'},
    // ── Other GCC ──
    {network:'Zain Kuwait',country:'KW',prefixes:[],type:'Physical',currency:'KWD'},
    {network:'Ooredoo Qatar',country:'QA',prefixes:[],type:'Physical',currency:'QAR'},
  ],
  investments:[
    {name:'Engro Corporation',ticker:'ENGRO',exchange:'PSX',type:'Stocks',country:'PK',currency:'PKR',broker:''},
    {name:'Lucky Cement',ticker:'LUCK',exchange:'PSX',type:'Stocks',country:'PK',currency:'PKR',broker:''},
    {name:'HBL',ticker:'HBL',exchange:'PSX',type:'Stocks',country:'PK',currency:'PKR',broker:''},
    {name:'MCB Bank',ticker:'MCB',exchange:'PSX',type:'Stocks',country:'PK',currency:'PKR',broker:''},
    {name:'UBL',ticker:'UBL',exchange:'PSX',type:'Stocks',country:'PK',currency:'PKR',broker:''},
    {name:'OGDC',ticker:'OGDC',exchange:'PSX',type:'Stocks',country:'PK',currency:'PKR',broker:''},
    {name:'PPL',ticker:'PPL',exchange:'PSX',type:'Stocks',country:'PK',currency:'PKR',broker:''},
    {name:'PSO',ticker:'PSO',exchange:'PSX',type:'Stocks',country:'PK',currency:'PKR',broker:''},
    {name:'Fauji Fertilizer',ticker:'FFC',exchange:'PSX',type:'Stocks',country:'PK',currency:'PKR',broker:''},
    {name:'Hub Power',ticker:'HUBC',exchange:'PSX',type:'Stocks',country:'PK',currency:'PKR',broker:''},
    {name:'Maple Leaf',ticker:'MLCF',exchange:'PSX',type:'Stocks',country:'PK',currency:'PKR',broker:''},
    {name:'Systems Ltd',ticker:'SYS',exchange:'PSX',type:'Stocks',country:'PK',currency:'PKR',broker:''},
    {name:'TRG Pakistan',ticker:'TRG',exchange:'PSX',type:'Stocks',country:'PK',currency:'PKR',broker:''},
    {name:'K-Electric',ticker:'KEL',exchange:'PSX',type:'Stocks',country:'PK',currency:'PKR',broker:''},
    {name:'Sui Northern',ticker:'SNGP',exchange:'PSX',type:'Stocks',country:'PK',currency:'PKR',broker:''},
    {name:'Lloyds Banking Group',ticker:'LLOY',exchange:'LSE',type:'Stocks',country:'GB',currency:'GBP',broker:''},
    {name:'Barclays',ticker:'BARC',exchange:'LSE',type:'Stocks',country:'GB',currency:'GBP',broker:''},
    {name:'HSBC Holdings',ticker:'HSBA',exchange:'LSE',type:'Stocks',country:'GB',currency:'GBP',broker:''},
    {name:'Al Meezan Islamic Fund',ticker:null,exchange:null,type:'Mutual Funds',country:'PK',currency:'PKR',broker:'Al Meezan Investments'},
    {name:'NBP Income Fund',ticker:null,exchange:null,type:'Mutual Funds',country:'PK',currency:'PKR',broker:'NBP Funds'},
    {name:'UBL Stock Advantage Fund',ticker:null,exchange:null,type:'Mutual Funds',country:'PK',currency:'PKR',broker:'UBL Fund Managers'},
    {name:'Bitcoin',ticker:'BTC',exchange:null,type:'Crypto',country:'',currency:'USD',broker:''},
    {name:'Ethereum',ticker:'ETH',exchange:null,type:'Crypto',country:'',currency:'USD',broker:''},
    {name:'USDT',ticker:'USDT',exchange:null,type:'Crypto',country:'',currency:'USD',broker:''},
  ],
  documents:[
    {name:'Pakistani CNIC',type:'cnic',numberFormat:'00000-0000000-0',hasExpiry:true},
    {name:'Pakistani Passport',type:'passport',numberFormat:'AB1234567',hasExpiry:true},
    {name:'Pakistani Driving Licence',type:'driving_licence',numberFormat:'',hasExpiry:true},
    {name:'NTN',type:'ntn',numberFormat:'0000000-0',hasExpiry:false},
    {name:'UK Passport',type:'passport',numberFormat:'123456789',hasExpiry:true},
    {name:'UK Driving Licence',type:'driving_licence',numberFormat:'',hasExpiry:true},
    {name:'UAE Residence Visa',type:'visa',numberFormat:'',hasExpiry:true},
    {name:'UAE Emirates ID',type:'emirates_id',numberFormat:'784-0000-0000000-0',hasExpiry:true},
    {name:'International Vaccination Card',type:'vaccination',numberFormat:'',hasExpiry:false},
  ],
  // Auto-fill helpers
  fillBank(val, country) {
    const lv = val.toLowerCase();
    const _find = list => list.find(b => {
      if (b.name.toLowerCase().includes(lv)) return true;
      if (b.aliases && b.aliases.some(a => a.toLowerCase().includes(lv))) return true;
      return false;
    });
    const match = (country ? _find(this.banks.filter(b => b.country === country)) : null) || _find(this.banks);
    if (!match) return;
    setTimeout(() => {
      const cc = document.getElementById('bf-cc'); if (cc) cc.value = match.country;
      const cur = document.getElementById('bf-cur'); if (cur) cur.value = match.currency;
      const type = document.getElementById('bf-type'); if (type && match.type) type.value = match.type.charAt(0).toUpperCase() + match.type.slice(1);
      const swift = document.getElementById('bf-swift'); if (swift && match.swift) swift.value = match.swift;
    }, 50);
  },
  fillCard(val) {
    const match = this.cards.find(c => c.name.toLowerCase().includes(val.toLowerCase()));
    if (!match) return;
    setTimeout(() => {
      const net = document.getElementById('cf-net'); if (net) net.value = match.network;
      const type = document.getElementById('cf-type'); if (type) type.value = match.type;
      const cat = document.getElementById('cf-cat'); if (cat) cat.value = match.category;
      const cc = document.getElementById('cf-cc'); if (cc) cc.value = match.country;
    }, 50);
  },
  fillSim(val) {
    const match = this.sims.find(s => s.network.toLowerCase().includes(val.toLowerCase()));
    if (!match) return;
    setTimeout(() => {
      const cc = document.getElementById('sf-cc'); if (cc) { cc.value = match.country; cc.dispatchEvent(new Event('change')); }
      const pfx = document.getElementById('sf-pfx'); if (pfx) pfx.textContent = U.phone(match.country);
    }, 50);
  },
  fillInv(val) {
    const match = this.investments.find(i => i.name.toLowerCase().includes(val.toLowerCase()) || (i.ticker && i.ticker.toLowerCase() === val.toLowerCase()));
    if (!match) return;
    setTimeout(() => {
      const tick = document.getElementById('if-tick'); if (tick && match.ticker) tick.value = match.ticker;
      const type = document.getElementById('if-type'); if (type) type.value = match.type;
      const cc = document.getElementById('if-cc'); if (cc && match.country) cc.value = match.country;
      const cur = document.getElementById('if-cur'); if (cur) cur.value = match.currency;
      const broker = document.getElementById('if-broker'); if (broker && match.broker) broker.value = match.broker;
    }, 50);
  },
};

// ── Bank logo / brand helpers ──
const BANK_DOMAINS={
  'HBL':'hbl.com','Habib Bank':'hbl.com','HBL Bank':'hbl.com',
  'Meezan Bank':'meezanbank.com','Meezan':'meezanbank.com',
  'UBL':'ubl.com','MCB Bank':'mcb.com.pk','MCB':'mcb.com.pk',
  'Bank Alfalah':'bankalfalah.com','Alfalah':'bankalfalah.com',
  'Allied Bank':'abl.com','Allied':'abl.com',
  'Askari Bank':'askaribank.com','Askari':'askaribank.com',
  'Bank Al Habib':'bankalhabib.com','BAHL':'bankalhabib.com',
  'Habib Metro Bank':'habibmetro.com','Habib Metro':'habibmetro.com',
  'Faysal Bank':'faysalbank.com','Faysal':'faysalbank.com',
  'Bank Islami':'bankislami.com','Islami':'bankislami.com',
  'Sadapay':'sadapay.com','NayaPay':'nayapay.com','Zindigi':'zindigi.com',
  'JazzCash':'jazzcash.com.pk','EasyPaisa':'easypaisa.com',
  'NBP':'nbp.com.pk','Bank of Punjab':'bop.com.pk',
  'Silkbank':'silkbank.com','Silk Bank':'silkbank.com',
  'Soneri Bank':'soneribank.com','Soneri':'soneribank.com',
  'JS Bank':'jsbl.com','JS':'jsbl.com',
  'Standard Chartered PK':'sc.com','Standard Chartered':'sc.com',
  'HSBC':'hsbc.com','HSBC UK':'hsbc.co.uk',
  'Monzo':'monzo.com',
  'Starling Bank':'starlingbank.com','Starling':'starlingbank.com',
  'Revolut':'revolut.com','Wise':'wise.com',
  'Barclays':'barclays.co.uk','Barclaycard':'barclays.co.uk',
  'NatWest':'natwest.com',
  'Lloyds Bank':'lloydsbank.com','Lloyds':'lloydsbank.com',
  'Santander UK':'santander.co.uk','Santander':'santander.co.uk',
  'Halifax':'halifax.co.uk','Nationwide':'nationwide.co.uk',
  'Metro Bank':'metrobankonline.co.uk','TSB':'tsb.co.uk','TSB Bank':'tsb.co.uk',
  'Chase UK':'chase.co.uk','First Direct':'firstdirect.com',
  'Atom Bank':'atombank.co.uk','Atom':'atombank.co.uk',
  'Emirates NBD':'emiratesnbd.com','ENBD':'emiratesnbd.com','Emirates':'emiratesnbd.com',
  'FAB':'bankfab.com','ADCB':'adcb.com',
  'Mashreq Bank':'mashreq.com','Mashreq':'mashreq.com',
  'ADIB':'adib.ae','Dubai Islamic Bank':'dib.ae','DIB':'dib.ae',
  'RAKBank':'rakbank.ae','RAK Bank':'rakbank.ae','RAKBANK':'rakbank.ae',
  'Wio Bank':'wio.com','Wio':'wio.com',
  'Liv.':'liv.ae','Liv':'liv.ae',
  'Al Rayan Bank':'alrayanbank.co.uk',
  'Citibank':'citibank.com','Citi':'citibank.com','Citi Bank':'citibank.com',
  'Chase':'chase.com','Chase Bank':'chase.com',
  'Bank of America':'bankofamerica.com',
  'Wells Fargo':'wellsfargo.com','Wells':'wellsfargo.com',
};

const BANK_COLORS={
  'HBL':'#1a3a6b','Meezan Bank':'#006400','UBL':'#8b0000','MCB Bank':'#1a1a2e',
  'Bank Alfalah':'#003366','Allied Bank':'#004225','Sadapay':'#6b21a8',
  'NayaPay':'#ea580c','Monzo':'#ff3464','Starling Bank':'#6935d3','Revolut':'#191c1f',
  'Wise':'#00b67a','Barclays':'#00aeef','HSBC':'#db0011','HSBC UK':'#db0011',
  'NatWest':'#5a0096','Lloyds Bank':'#006a4e','Emirates NBD':'#c8972a',
  'FAB':'#00a651','ADCB':'#cc0000','Dubai Islamic Bank':'#006400',
};

function bankDomain(name){
  if(!name)return null;
  const n=name.trim();
  if(BANK_DOMAINS[n])return BANK_DOMAINS[n];
  const lc=n.toLowerCase();
  // Case-insensitive exact match
  for(const[k,v]of Object.entries(BANK_DOMAINS)){
    if(k.toLowerCase()===lc)return v;
  }
  // First word of bank name starts any key
  const firstWord=lc.split(' ')[0];
  for(const[k,v]of Object.entries(BANK_DOMAINS)){
    if(k.toLowerCase().startsWith(firstWord))return v;
  }
  // Bank name starts with any key
  for(const[k,v]of Object.entries(BANK_DOMAINS)){
    if(lc.startsWith(k.toLowerCase()))return v;
  }
  // Any key contains or is contained in bank name
  for(const[k,v]of Object.entries(BANK_DOMAINS)){
    const kl=k.toLowerCase();
    if(lc.includes(kl)||kl.includes(lc))return v;
  }
  return null;
}

function brandColor(name){
  if(!name)return '#1a1a2e';
  const n=name.trim();
  if(BANK_COLORS[n])return BANK_COLORS[n];
  const lc=n.toLowerCase();
  for(const[k,v]of Object.entries(BANK_COLORS)){
    if(lc.includes(k.toLowerCase()))return v;
  }
  return '#1a1a2e';
}

function bankLogo(bankName,country){
  const domain=bankDomain(bankName);
  if(!domain)return '';
  return `<img src="https://www.google.com/s2/favicons?domain=${domain}&sz=64" style="width:36px;height:36px;border-radius:8px;object-fit:cover" onerror="this.style.display='none'" loading="lazy">`;
}

function cardGradient(c){
  const g={
    'HBL':'linear-gradient(135deg,#0d2147 0%,#1a3a6b 50%,#2d5aa0 100%)',
    'Meezan Bank':'linear-gradient(135deg,#003d00 0%,#006400 50%,#228b22 100%)',
    'Meezan':'linear-gradient(135deg,#003d00 0%,#006400 50%,#228b22 100%)',
    'UBL':'linear-gradient(135deg,#5c0000 0%,#8b0000 50%,#cc0000 100%)',
    'MCB Bank':'linear-gradient(135deg,#0d0d1a 0%,#1a1a2e 50%,#16213e 100%)',
    'MCB':'linear-gradient(135deg,#0d0d1a 0%,#1a1a2e 50%,#16213e 100%)',
    'Bank Alfalah':'linear-gradient(135deg,#001a33 0%,#003366 50%,#0055a5 100%)',
    'Alfalah':'linear-gradient(135deg,#001a33 0%,#003366 50%,#0055a5 100%)',
    'Allied Bank':'linear-gradient(135deg,#001f0f 0%,#004225 50%,#006b3c 100%)',
    'ABL':'linear-gradient(135deg,#001f0f 0%,#004225 50%,#006b3c 100%)',
    'Sadapay':'linear-gradient(135deg,#4a0080 0%,#6b21a8 50%,#9333ea 100%)',
    'NayaPay':'linear-gradient(135deg,#7a2800 0%,#ea580c 50%,#f97316 100%)',
    'Monzo':'linear-gradient(135deg,#cc1040 0%,#ff3464 50%,#ff6b8a 100%)',
    'Starling':'linear-gradient(135deg,#3a1a80 0%,#6935d3 50%,#9b59b6 100%)',
    'Revolut':'linear-gradient(135deg,#0d0f10 0%,#191c1f 50%,#2d3436 100%)',
    'Wise':'linear-gradient(135deg,#005c3d 0%,#00b67a 50%,#9fe870 100%)',
    'Barclays':'linear-gradient(135deg,#001f40 0%,#003b7a 50%,#00aeef 100%)',
    'Barclaycard':'linear-gradient(135deg,#001f40 0%,#003b7a 50%,#00aeef 100%)',
    'HSBC':'linear-gradient(135deg,#6b0008 0%,#a00008 50%,#db0011 100%)',
    'NatWest':'linear-gradient(135deg,#1a0030 0%,#2d0048 50%,#5a0096 100%)',
    'Lloyds':'linear-gradient(135deg,#002214 0%,#004d38 50%,#006a4e 100%)',
    'Emirates NBD':'linear-gradient(135deg,#4a3500 0%,#8b6914 50%,#c8972a 100%)',
    'ENBD':'linear-gradient(135deg,#4a3500 0%,#8b6914 50%,#c8972a 100%)',
    'FAB':'linear-gradient(135deg,#003d1a 0%,#007a3d 50%,#00a651 100%)',
    'ADCB':'linear-gradient(135deg,#4d0000 0%,#990000 50%,#cc0000 100%)',
    'Dubai Islamic Bank':'linear-gradient(135deg,#002600 0%,#004d00 50%,#006400 100%)',
    'DIB':'linear-gradient(135deg,#002600 0%,#004d00 50%,#006400 100%)',
    'Chase':'linear-gradient(135deg,#001f40 0%,#003b7a 50%,#117aca 100%)',
    'Bank of America':'linear-gradient(135deg,#7a0012 0%,#c41230 50%,#e31837 100%)',
    'Wells Fargo':'linear-gradient(135deg,#6b000a 0%,#9a1422 50%,#d71921 100%)',
    'Santander':'linear-gradient(135deg,#6b0000 0%,#aa0000 50%,#ec0000 100%)',
    'Halifax':'linear-gradient(135deg,#002030 0%,#003d5c 50%,#005c8e 100%)',
    'Nationwide':'linear-gradient(135deg,#001f33 0%,#003a5e 50%,#00568c 100%)',
    'Metro Bank':'linear-gradient(135deg,#400000 0%,#8b0000 50%,#cc0000 100%)',
    'TSB':'linear-gradient(135deg,#003040 0%,#005a87 50%,#007db9 100%)',
    'First Direct':'linear-gradient(135deg,#000000 0%,#111 50%,#333 100%)',
    'Atom Bank':'linear-gradient(135deg,#1a0040 0%,#3d1a78 50%,#6b21a8 100%)',
    'RAKBank':'linear-gradient(135deg,#400000 0%,#8b0000 50%,#cc0000 100%)',
    'Wio Bank':'linear-gradient(135deg,#003d29 0%,#008a5c 50%,#00b67a 100%)',
    'Askari':'linear-gradient(135deg,#0a1f30 0%,#1a5276 50%,#2e86c1 100%)',
    'Faysal':'linear-gradient(135deg,#0a1f30 0%,#1a5276 50%,#2e86c1 100%)',
    'Bank Islami':'linear-gradient(135deg,#003d00 0%,#006400 50%,#228b22 100%)',
    'Zindigi':'linear-gradient(135deg,#3d1045 0%,#7b2d8b 50%,#a855f7 100%)',
    'JazzCash':'linear-gradient(135deg,#6b0000 0%,#cc0000 50%,#ff4500 100%)',
    'EasyPaisa':'linear-gradient(135deg,#003d1f 0%,#007a3d 50%,#00a651 100%)',
    'NBP':'linear-gradient(135deg,#002600 0%,#004d00 50%,#006400 100%)',
    'Bank of Punjab':'linear-gradient(135deg,#0d2147 0%,#1a3a6b 50%,#2d5aa0 100%)',
  };
  const n=(c.cardName||'').toLowerCase();
  for(const[k,v]of Object.entries(g)){if(n.includes(k.toLowerCase()))return v;}
  const ng={
    'Visa':'linear-gradient(135deg,#0d0d1a 0%,#1a1a2e 50%,#16213e 100%)',
    'Mastercard':'linear-gradient(135deg,#1a1a1a 0%,#2c2c2c 50%,#3d3d3d 100%)',
    'American Express':'linear-gradient(135deg,#003d2e 0%,#005a45 50%,#007b5e 100%)',
    'UnionPay':'linear-gradient(135deg,#5c0012 0%,#8b0000 50%,#c8102e 100%)',
  };
  if(ng[c.network])return ng[c.network];
  const tg={Debit:'linear-gradient(135deg,#1a1a2e 0%,#2c3e50 50%,#34495e 100%)',Credit:'linear-gradient(135deg,#1a1a2e 0%,#2c3e50 50%,#34495e 100%)',Prepaid:'linear-gradient(135deg,#1a1a2e 0%,#2d3436 50%,#636e72 100%)'};
  return tg[c.cardType]||'linear-gradient(135deg,#1a1a2e 0%,#2c3e50 50%,#34495e 100%)';
}

const SUBS_DB=[
  {n:'Netflix',c:'Streaming',ic:'🎬'},{n:'Disney+',c:'Streaming',ic:'🏰'},{n:'Amazon Prime',c:'Streaming',ic:'📦'},
  {n:'Apple TV+',c:'Streaming',ic:'🍎'},{n:'YouTube Premium',c:'Streaming',ic:'▶️'},{n:'HBO Max',c:'Streaming',ic:'🎭'},
  {n:'Spotify',c:'Music',ic:'🎵'},{n:'Apple Music',c:'Music',ic:'🎶'},{n:'Tidal',c:'Music',ic:'🌊'},
  {n:'NordVPN',c:'VPN',ic:'🔒'},{n:'ExpressVPN',c:'VPN',ic:'🔒'},{n:'Surfshark',c:'VPN',ic:'🦈'},{n:'ProtonVPN',c:'VPN',ic:'⚛️'},
  {n:'iCloud+',c:'Cloud',ic:'☁️'},{n:'Google One',c:'Cloud',ic:'💾'},{n:'Dropbox',c:'Cloud',ic:'📦'},
  {n:'Microsoft 365',c:'Productivity',ic:'💼'},{n:'Adobe CC',c:'Productivity',ic:'🎨'},{n:'Notion',c:'Productivity',ic:'📝'},
  {n:'1Password',c:'Security',ic:'🔑'},{n:'Bitwarden',c:'Security',ic:'🛡️'},
  {n:'Pure Gym',c:'Fitness',ic:'🏋️'},{n:'David Lloyd',c:'Fitness',ic:'🎾'},{n:'Apple Fitness+',c:'Fitness',ic:'🍎'},{n:'Planet Fitness',c:'Fitness',ic:'🏋️'},
  {n:'PlayStation Plus',c:'Gaming',ic:'🎮'},{n:'Xbox Game Pass',c:'Gaming',ic:'🎮'},{n:'Nintendo Online',c:'Gaming',ic:'🎮'},
  {n:'LinkedIn Premium',c:'Business',ic:'💼'},{n:'ChatGPT Plus',c:'AI',ic:'🤖'},{n:'Claude Pro',c:'AI',ic:'🧠'},
  {n:'Canva Pro',c:'Design',ic:'🎨'},{n:'Figma',c:'Design',ic:'🖌️'},{n:'Grammarly',c:'Tools',ic:'✍️'},
  {n:'FT',c:'News',ic:'📰'},{n:'The Times',c:'News',ic:'📰'},
];

const EMAIL_PROVIDERS=[
  {n:'Gmail',ic:'📧',color:'#ea4335'},{n:'Outlook/Hotmail',ic:'📮',color:'#0078d4'},
  {n:'Apple iCloud Mail',ic:'🍎',color:'#555'},{n:'ProtonMail',ic:'🔒',color:'#6d4aff'},
  {n:'Yahoo Mail',ic:'💜',color:'#720e9e'},{n:'Tutanota',ic:'🛡️',color:'#c63927'},
  {n:'Zoho Mail',ic:'💼',color:'#cc4b00'},{n:'FastMail',ic:'⚡',color:'#2272b2'},
  {n:'Custom Domain',ic:'🌐',color:'#666'},{n:'Other',ic:'📧',color:'#888'},
];

const GADGET_TYPES=[
  {n:'iPhone',ic:'📱',cat:'Phone'},{n:'Android Phone',ic:'📱',cat:'Phone'},{n:'Samsung Galaxy',ic:'📱',cat:'Phone'},
  {n:'iPad',ic:'📲',cat:'Tablet'},{n:'iPad Pro',ic:'📲',cat:'Tablet'},{n:'Android Tablet',ic:'📲',cat:'Tablet'},
  {n:'MacBook Air',ic:'💻',cat:'Laptop'},{n:'MacBook Pro',ic:'💻',cat:'Laptop'},{n:'Windows Laptop',ic:'💻',cat:'Laptop'},
  {n:'iMac',ic:'🖥️',cat:'Desktop'},{n:'Mac Mini',ic:'🖥️',cat:'Desktop'},{n:'Mac Pro',ic:'🖥️',cat:'Desktop'},
  {n:'Apple Watch',ic:'⌚',cat:'Wearable'},{n:'Samsung Watch',ic:'⌚',cat:'Wearable'},{n:'Garmin Watch',ic:'⌚',cat:'Wearable'},
  {n:'AirPods',ic:'🎧',cat:'Audio'},{n:'AirPods Pro',ic:'🎧',cat:'Audio'},{n:'Sony WH-1000XM5',ic:'🎧',cat:'Audio'},
  {n:'PlayStation 5',ic:'🎮',cat:'Gaming'},{n:'Xbox Series X',ic:'🎮',cat:'Gaming'},{n:'Nintendo Switch',ic:'🎮',cat:'Gaming'},
  {n:'Amazon Echo',ic:'📢',cat:'Smart Home'},{n:'Google Nest',ic:'🏠',cat:'Smart Home'},{n:'Apple HomePod',ic:'🔊',cat:'Smart Home'},
  {n:'External SSD',ic:'💾',cat:'Storage'},{n:'External HDD',ic:'💾',cat:'Storage'},{n:'USB Hub',ic:'🔌',cat:'Accessory'},
  {n:'Camera (DSLR)',ic:'📷',cat:'Camera'},{n:'Camera (Mirrorless)',ic:'📷',cat:'Camera'},
  {n:'Router/Mesh',ic:'📡',cat:'Network'},{n:'NAS Drive',ic:'🗄️',cat:'Network'},
];

const DIGITAL_SVCS=['PayPal','Wise','Revolut','Stripe','Crypto.com','Coinbase','Binance','Kraken','Cash App','Monzo','PayPay','Western Union','MoneyGram','Remitly','WorldRemit','Skrill','Neteller','Payoneer','Brex','JazzCash','EasyPaisa','NayaPay','Bybit','OKX'];

const IPHONE_MODELS=['iPhone 16 Pro Max','iPhone 16 Pro','iPhone 16 Plus','iPhone 16','iPhone 15 Pro Max','iPhone 15 Pro','iPhone 15','iPhone 14 Pro Max','iPhone 14 Pro','iPhone 14','iPhone 13 Pro Max','iPhone 13 Pro','iPhone 13','iPhone SE (3rd gen)','iPhone 12 Pro Max','iPhone 12','iPhone 11 Pro Max','iPhone 11'];
const MACBOOK_MODELS=['MacBook Pro 16" M4 Max','MacBook Pro 16" M4 Pro','MacBook Pro 14" M4 Max','MacBook Pro 14" M4 Pro','MacBook Air 15" M3','MacBook Air 13" M3','MacBook Pro 16" M3 Max','MacBook Pro 14" M3','MacBook Air M2 15"','MacBook Air M2 13"','MacBook Pro 13" M2','MacBook Air M1','MacBook Pro 13" M1'];
const SAMSUNG_MODELS=['Galaxy S25 Ultra','Galaxy S25+','Galaxy S25','Galaxy S24 Ultra','Galaxy S24+','Galaxy S24','Galaxy Z Fold 6','Galaxy Z Flip 6','Galaxy A55 5G','Galaxy A35 5G'];
const IPAD_MODELS=['iPad Pro 13" M4','iPad Pro 11" M4','iPad Air 13" M2','iPad Air 11" M2','iPad mini 7','iPad (10th gen)','iPad Pro 12.9" M2','iPad Pro 11" M2'];
const ALL_GADGET_MODELS=[...IPHONE_MODELS,...MACBOOK_MODELS,...SAMSUNG_MODELS,...IPAD_MODELS,'Apple Watch Series 10','Apple Watch Ultra 2','Apple Watch SE (3rd gen)','AirPods Pro (2nd gen)','AirPods 4','AirPods Max','iPad mini 7','PlayStation 5','Xbox Series X','Nintendo Switch OLED','Amazon Echo','Google Nest Hub','Sony WH-1000XM5','Bose QC45'];

const DIGITAL_CATS=['Social Media','Messaging','Email Service','Streaming','Banking / Finance','Shopping / E-commerce','Travel','Developer / Tech','AI Tools','VPN / Security','Cloud Storage','Productivity','Gaming','Health & Fitness','Government / Official','Crypto / Web3','News / Media','Dating','Education','Other'];
const COMMON_SERVICES=['Instagram','Twitter / X','TikTok','Facebook','LinkedIn','Snapchat','WhatsApp','Telegram','Discord','Reddit','Pinterest','YouTube','Twitch','BeReal','Threads','Signal','WeChat','ChatGPT','Claude','Gemini','Midjourney','Copilot','Perplexity','GitHub','GitLab','Vercel','Netlify','AWS','Google Cloud','Heroku','Figma','Canva','Adobe CC','Netflix','Spotify','Apple Music','Amazon','eBay','AliExpress','Noon','Namshi','Shopify','Etsy','PayPal','Stripe','Revolut','Wise','Binance','Coinbase','Kraken','OpenSea','Google','Apple ID','Microsoft','Dropbox','OneDrive','Notion','Trello','Slack','Zoom','Expedia','Booking.com','Airbnb','Uber','Lyft','Careem','Deliveroo','Just Eat','Uber Eats','Duolingo','Coursera','Udemy'];

const WORKSPACE_PRESETS={
  default:{name:'Default',ic:'🏠',desc:'All modules enabled',modules:{banks:true,cards:true,investments:true,sims:true,assets:true,expenses:true,emails:true,gadgets:true,digital:true,import:true,timeline:true,security:true,backup:true,recovery:true,workspace:true}},
  minimal:{name:'Minimal',ic:'⚡',desc:'Cards, expenses, SIMs only',modules:{banks:true,cards:true,investments:false,sims:true,assets:false,expenses:true,emails:false,gadgets:false,digital:false,import:false,timeline:true,security:true,backup:true,recovery:true,workspace:true}},
  finance:{name:'Finance Pro',ic:'💰',desc:'Banks, cards, investments, expenses',modules:{banks:true,cards:true,investments:true,sims:false,assets:true,expenses:true,emails:false,gadgets:false,digital:true,import:true,timeline:true,security:true,backup:true,recovery:true,workspace:true}},
  traveler:{name:'Traveler',ic:'✈️',desc:'Cards, SIMs, documents, emails',modules:{banks:true,cards:true,investments:false,sims:true,assets:true,expenses:true,emails:true,gadgets:true,digital:false,import:true,timeline:true,security:true,backup:true,recovery:true,workspace:true}},
  privacy:{name:'Privacy First',ic:'🔒',desc:'Essential modules only, no import/tools',modules:{banks:true,cards:true,investments:false,sims:true,assets:false,expenses:true,emails:true,gadgets:false,digital:true,import:false,timeline:false,security:true,backup:true,recovery:true,workspace:true}},
  business:{name:'Business',ic:'🏢',desc:'Full suite for professionals',modules:{banks:true,cards:true,investments:true,sims:true,assets:true,expenses:true,emails:true,gadgets:true,digital:true,import:true,timeline:true,security:true,backup:true,recovery:true,workspace:true}},
  family:{name:'Family',ic:'👨‍👩‍👧',desc:'Assets, subscriptions, documents',modules:{banks:true,cards:true,investments:false,sims:true,assets:true,expenses:true,emails:true,gadgets:true,digital:false,import:false,timeline:true,security:true,backup:true,recovery:true,workspace:true}},
};

const DOC_SCHEMAS = {
  passport:{
    label:'Passport',ic:'📘',
    fields:[
      {id:'docNumber',label:'Passport Number',ph:'e.g. AB1234567'},
      {id:'issuingCountry',label:'Issuing Country',ph:'e.g. United Kingdom'},
      {id:'nationality',label:'Nationality',ph:'e.g. British'},
      {id:'holderName',label:'Full Name (as printed)',ph:'Full name on passport'},
      {id:'dob',label:'Date of Birth',type:'date'},
      {id:'issueDate',label:'Issue Date',type:'date'},
      {id:'expiryDate',label:'Expiry Date',type:'date'},
      {id:'issuingAuthority',label:'Issuing Authority',ph:'Passport Office'},
      {id:'mrzLine',label:'MRZ Line (optional)',ph:'Machine readable zone line 1'},
      {id:'storageLocation',label:'Physical Storage',ph:'Safe, drawer, wallet...'},
    ]
  },
  nic:{
    label:'National ID',ic:'🪪',
    fields:[
      {id:'docNumber',label:'ID Number',ph:'National ID number'},
      {id:'issuingCountry',label:'Issuing Country',ph:'Issuing country'},
      {id:'holderName',label:'Full Name',ph:'Name on document'},
      {id:'dob',label:'Date of Birth',type:'date'},
      {id:'issueDate',label:'Issue Date',type:'date'},
      {id:'expiryDate',label:'Expiry Date',type:'date'},
      {id:'storageLocation',label:'Storage Location',ph:'Wallet, safe...'},
    ]
  },
  driving_license:{
    label:'Driving Licence',ic:'🚗',
    fields:[
      {id:'docNumber',label:'Licence Number',ph:'Driving licence number'},
      {id:'issuingCountry',label:'Issuing Country',ph:'Country'},
      {id:'holderName',label:'Full Name',ph:'Name on licence'},
      {id:'dob',label:'Date of Birth',type:'date'},
      {id:'issueDate',label:'Issue Date',type:'date'},
      {id:'expiryDate',label:'Expiry Date',type:'date'},
      {id:'vehicleCategories',label:'Categories',ph:'B, C, D...'},
      {id:'storageLocation',label:'Storage',ph:'Wallet, glove box...'},
    ]
  },
  visa:{
    label:'Visa / Entry Permit',ic:'✈️',
    fields:[
      {id:'docNumber',label:'Visa Number',ph:'Visa reference number'},
      {id:'visaType',label:'Visa Type',ph:'Tourist, Work, Student, ILR...',list:'Student,Work/Skilled Worker,Tourist,Family/Spouse,Student,Indefinite Leave to Remain,Business,Transit,Investor'},
      {id:'issuingCountry',label:'Issuing Country',ph:'Country that issued visa'},
      {id:'holderName',label:'Holder Name',ph:'Full name'},
      {id:'issueDate',label:'Issue Date',type:'date'},
      {id:'expiryDate',label:'Expiry Date',type:'date'},
      {id:'validEntries',label:'Entry Type',ph:'Single, Multiple, Multiple (2 years)...'},
      {id:'linkedPassportNum',label:'Linked Passport No.',ph:'Passport this visa is in'},
      {id:'storageLocation',label:'Storage',ph:'In passport, safe...'},
    ]
  },
  property_doc:{
    label:'Property Document',ic:'🏠',
    fields:[
      {id:'docSubType',label:'Document Type',ph:'Title deed, Sale agreement, Mortgage docs...',list:'Title Deed,Sale Agreement,Mortgage Documents,Property Survey,Planning Permission,Lease Agreement,Building Certificate,Insurance Policy'},
      {id:'propertyRef',label:'Property / Address',ph:'Which property does this relate to?'},
      {id:'ownerName',label:'Owner Name',ph:'Registered owner(s)'},
      {id:'plotNumber',label:'Plot / Unit Number',ph:'Plot or unit reference'},
      {id:'handoverDate',label:'Handover Date',type:'date'},
      {id:'developer',label:'Developer / Seller',ph:'Developer or seller name'},
      {id:'registrationRef',label:'Registration / Registry Ref',ph:'Land registry or title ref'},
      {id:'issueDate',label:'Document Date',type:'date'},
      {id:'expiryDate',label:'Expiry Date (if applicable)',type:'date'},
      {id:'storageLocation',label:'Storage',ph:'Safe, solicitor, bank...'},
    ]
  },
  insurance_doc:{
    label:'Insurance Document',ic:'🛡️',
    fields:[
      {id:'docSubType',label:'Insurance Type',ph:'Health, Auto, Home, Life...',list:'Health,Auto/Car,Home,Life,Travel,Business,Pet,Gadget'},
      {id:'policyNumber',label:'Policy Number',ph:'Policy reference'},
      {id:'provider',label:'Insurance Provider',ph:'Company name'},
      {id:'holderName',label:'Policy Holder',ph:'Name on policy'},
      {id:'beneficiary',label:'Beneficiary',ph:'Who benefits'},
      {id:'coverAmount',label:'Cover Amount',ph:'e.g. 250000'},
      {id:'premium',label:'Premium (per period)',ph:'Monthly or annual premium'},
      {id:'issueDate',label:'Start Date',type:'date'},
      {id:'expiryDate',label:'Renewal Date',type:'date'},
      {id:'storageLocation',label:'Storage',ph:'Email, safe, broker...'},
    ]
  },
  vehicle_reg:{
    label:'Vehicle Registration',ic:'🚗',
    fields:[
      {id:'regNumber',label:'Registration / Plate No.',ph:'e.g. ABC-1234'},
      {id:'vehicleMake',label:'Make / Brand',ph:'Toyota, BMW, Mercedes...'},
      {id:'vehicleModel',label:'Model',ph:'Corolla, 3 Series...'},
      {id:'vin',label:'VIN / Chassis Number',ph:'17-character VIN'},
      {id:'ownerName',label:'Registered Owner',ph:'Owner name'},
      {id:'issueDate',label:'Registration Date',type:'date'},
      {id:'expiryDate',label:'Expiry / Renewal Date',type:'date'},
      {id:'issuingAuthority',label:'Issuing Authority',ph:'DVLA, RTA, MTMIS...'},
      {id:'storageLocation',label:'Storage',ph:'Glove box, safe...'},
    ]
  },
  tax:{
    label:'Tax Document',ic:'📋',
    fields:[
      {id:'docSubType',label:'Tax Doc Type',ph:'Tax Return, Tax Certificate, VAT Reg...',list:'Income Tax Return,Tax Certificate,VAT Registration,NTN Certificate,Tax Clearance,CNIC Tax Filing,Corporate Tax'},
      {id:'taxYear',label:'Tax Year / Period',ph:'e.g. 2023-24'},
      {id:'referenceNum',label:'Reference Number',ph:'Tax reference or UTR'},
      {id:'issuingAuthority',label:'Issuing Authority',ph:'HMRC, FBR, IRS...'},
      {id:'holderName',label:'Taxpayer Name',ph:'Your name or company'},
      {id:'issueDate',label:'Issue / Filing Date',type:'date'},
      {id:'expiryDate',label:'Expiry (if applicable)',type:'date'},
      {id:'storageLocation',label:'Storage',ph:'Accountant, cloud, safe...'},
    ]
  },
  medical:{
    label:'Medical Record',ic:'🏥',
    fields:[
      {id:'docSubType',label:'Record Type',ph:'Prescription, Test Result, Vaccination...',list:'Prescription,Test Results,Vaccination Record,Medical Report,Discharge Summary,Dental Records,Blood Type Card,Allergy Info'},
      {id:'holderName',label:'Patient Name',ph:'Patient name'},
      {id:'doctor',label:'Doctor / Hospital',ph:'Name of doctor or hospital'},
      {id:'issueDate',label:'Date',type:'date'},
      {id:'expiryDate',label:'Valid Until (if applicable)',type:'date'},
      {id:'notes',label:'Notes',ph:'Brief description of document',multi:true},
      {id:'storageLocation',label:'Storage',ph:'Physical or digital location'},
    ]
  },
  warranty:{
    label:'Warranty / Receipt',ic:'🧾',
    fields:[
      {id:'productName',label:'Product Name',ph:'What is covered?'},
      {id:'serialNum',label:'Serial / Model Number',ph:'Product serial number'},
      {id:'retailer',label:'Retailer / Seller',ph:'Where purchased'},
      {id:'purchasePrice',label:'Purchase Price',ph:'Amount paid'},
      {id:'issueDate',label:'Purchase Date',type:'date'},
      {id:'expiryDate',label:'Warranty Expiry',type:'date'},
      {id:'warrantyProvider',label:'Warranty Provider',ph:'Brand or extended warranty company'},
      {id:'claimProcess',label:'How to Claim',ph:'Warranty claim process or URL'},
      {id:'storageLocation',label:'Storage',ph:'Drawer, email, safe...'},
    ]
  },
  contract:{
    label:'Contract / Agreement',ic:'📝',
    fields:[
      {id:'contractTitle',label:'Contract Title',ph:'e.g. Employment Agreement, NDA...'},
      {id:'parties',label:'Parties Involved',ph:'Names of all parties'},
      {id:'issueDate',label:'Signing Date',type:'date'},
      {id:'expiryDate',label:'Expiry Date (if applicable)',type:'date'},
      {id:'keyTerms',label:'Key Terms / Summary',ph:'Brief summary of key points',multi:true},
      {id:'lawyer',label:'Lawyer / Solicitor',ph:'Legal representative'},
      {id:'storageLocation',label:'Storage',ph:'Safe, solicitor, email...'},
    ]
  },
  certificate:{
    label:'Certificate / Award',ic:'🎓',
    fields:[
      {id:'certTitle',label:'Certificate Name',ph:'e.g. Bachelor of Science, AWS Certified...'},
      {id:'holderName',label:'Holder Name',ph:'Your name on certificate'},
      {id:'issuingAuthority',label:'Issued By',ph:'University, company, body...'},
      {id:'issueDate',label:'Issue Date',type:'date'},
      {id:'expiryDate',label:'Expiry / Renewal',type:'date'},
      {id:'certNumber',label:'Certificate Number',ph:'Reference number (if any)'},
      {id:'storageLocation',label:'Storage',ph:'Frame, folder, cloud...'},
    ]
  },
  other:{
    label:'Other Document',ic:'📄',
    fields:[
      {id:'docSubType',label:'Document Description',ph:'What is this document?'},
      {id:'holderName',label:'Related Person/Entity',ph:'Who does this relate to?'},
      {id:'referenceNum',label:'Reference Number',ph:'Any reference or ID number'},
      {id:'issueDate',label:'Date Issued',type:'date'},
      {id:'expiryDate',label:'Expiry Date',type:'date'},
      {id:'issuingAuthority',label:'Issued By',ph:'Authority or organization'},
      {id:'notes',label:'Notes',ph:'Additional details',multi:true},
      {id:'storageLocation',label:'Storage',ph:'Where is this kept?'},
    ]
  },
};

const DOC_TYPES=Object.keys(DOC_SCHEMAS);

'use strict';

// ── User context helper — derives name/country/currency from stored vault ──
function getUserContext() {
  try {
    const state = JSON.parse(localStorage.getItem('vos3') || '{}');
    const user = state.user || {};
    const currency = user.currency || 'PKR';
    const currencyToCountry = { GBP: 'GB', PKR: 'PK', AED: 'AE', USD: 'US', EUR: 'GB' };
    return {
      name: user.name || '',
      country: user.country || currencyToCountry[currency] || 'GB',
      baseCurrency: currency
    };
  } catch(e) { return { name: '', country: 'GB', baseCurrency: 'PKR' }; }
}
window.getUserContext = getUserContext;

// ── VaultOS safe confirm — works in sandboxed iframe and native ──
window.__vos_confirm = function(msg) {
  try { return window.confirm(msg); }
  catch(e) {
    console.log('[VaultOS] Auto-confirmed (sandboxed):', msg.slice(0, 50));
    return true;
  }
};

const VER = '4.0';

// ===================== CRYPTO ENGINE (AES-256-GCM + PBKDF2) =====================
const Crypto = {
  async deriveKey(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 310000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false, ['encrypt', 'decrypt']
    );
  },
  async encrypt(data, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv   = crypto.getRandomValues(new Uint8Array(12));
    const key  = await this.deriveKey(password, salt);
    const enc  = new TextEncoder();
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(data));
    const buf = new Uint8Array(16 + 12 + ciphertext.byteLength);
    buf.set(salt, 0); buf.set(iv, 16); buf.set(new Uint8Array(ciphertext), 28);
    return btoa(String.fromCharCode(...buf));
  },
  async decrypt(b64, password) {
    const buf  = new Uint8Array(atob(b64).split('').map(c => c.charCodeAt(0)));
    const salt = buf.slice(0, 16);
    const iv   = buf.slice(16, 28);
    const ct   = buf.slice(28);
    const key  = await this.deriveKey(password, salt);
    const dec  = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    return new TextDecoder().decode(dec);
  },
  available() { return !!window.crypto?.subtle; }
};

// ===================== SCHEMA MIGRATION =====================
const SCHEMA_VERSION = 7;

const Migrate = {
  run() {
    const stored = Store.loadRaw();
    if (!stored) return;
    const sv = stored.schemaVersion || 1;
    if (sv >= SCHEMA_VERSION) return;
    console.log(`VaultOS: migrating schema v${sv} → v${SCHEMA_VERSION}`);
    if (sv < 2 && !stored.modules) {
      stored.modules = { banks:true, cards:true, investments:true, sims:true, assets:true, expenses:true, emails:true, gadgets:true, digital:true, import:true, timeline:true, security:true };
    }
    if (sv < 3 && !stored.wallet) stored.wallet = [];
    if (sv < 4) {
      if (!stored.tags)     stored.tags = [];
      if (!stored.emails)   stored.emails = [];
      if (!stored.gadgets)  stored.gadgets = [];
      if (!stored.digital)  stored.digital = [];
      if (!stored.expenses) stored.expenses = [];
      if (!stored.activity) stored.activity = [];
      if (stored.assets)  stored.assets  = stored.assets.map(a => ({ ...a, assetType: a.assetType || 'other' }));
      if (stored.cards)   stored.cards   = stored.cards.map(c => ({ ...c, issuer: c.issuer || (c.cardName || '').split(' ')[0] }));
    }
    if (sv < 5) {
      const newMods = ['credit','zakat','tax','currency','gold'];
      if (stored.modules) newMods.forEach(id => { if (stored.modules[id] === undefined) stored.modules[id] = true; });
    }
    if (sv < 6) {
      const backfill = (arr, type) => (arr || []).map(item => ({
        id: item.id || Math.random().toString(36).slice(2),
        type: item.type || type,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
        tags: item.tags || [],
        linkedEntities: item.linkedEntities || [],
        archived: item.archived || false,
        favorite: item.favorite || false,
        ...item,
      }));
      stored.banks        = backfill(stored.banks,        'bank');
      stored.cards        = backfill(stored.cards,        'card');
      stored.documents    = backfill(stored.documents,    'document');
      stored.investments  = backfill(stored.investments,  'investment');
      stored.cash         = backfill(stored.cash,         'cash');
      stored.loans        = backfill(stored.loans,        'loan');
      stored.vehicles     = backfill(stored.vehicles,     'vehicle');
      stored.assets       = backfill(stored.assets,       'asset');
      stored.friends      = backfill(stored.friends,      'contact');
      stored.sims         = backfill(stored.sims,         'sim');
      stored.emails       = backfill(stored.emails,       'email');
      stored.gadgets      = backfill(stored.gadgets,      'gadget');
      stored.digital      = backfill(stored.digital,      'digital');
      stored.expenses     = backfill(stored.expenses,     'expense');
    }
    if (sv < 7) {
      if (stored.modules && stored.modules.emergency === undefined) stored.modules.emergency = true;
      if (!stored.emergency) stored.emergency = { enabled: false, name: '', phone: '', bloodType: '', allergies: '', emergencyNote: '', showOnLockscreen: false };
    }
    stored.schemaVersion = SCHEMA_VERSION;
    // Write back to localStorage only during migration phase (before VaultDB is active)
    try { localStorage.setItem('vos3', JSON.stringify(stored)); } catch(e) {}
  }
};

// ===================== STATE =====================
let S = {
  unlocked: false, decoy: false,
  user: { name:'', avatar:'💼', theme:'dark', currency:'GBP', netWorth:0, nwHistory:[], email:'', phone:'', homeAddr:'', workAddr:'', dob:'', lastBackup:'' },
  pin: '123456', decoyPin: '', noPin: false,
  modules: { banks:true, cards:true, investments:true, cash:true, loans:true, sims:true, friends:true, assets:true, expenses:true, credit:true, zakat:true, tax:true, currency:true, gold:true, emails:true, gadgets:true, digital:true, documents:true, search:true, import:true, timeline:true, security:true, backup:true, recovery:true, workspace:true, vehicles:true, reminders:true, emergency:true },
  banks:[], cards:[], investments:[], cash:[], loans:[], friends:[], sims:[], assets:[], expenses:[], emails:[], gadgets:[], digital:[], documents:[], vehicles:[], activity:[], tags:[], trash:[],
  emergency: { enabled: false, name: '', phone: '', bloodType: '', allergies: '', emergencyNote: '', showOnLockscreen: false },
  importedFiles:[], _pendingLinks:[],
  loanF:'all',
  wallet:[],
  fails:0, lockedUntil:0, autoLock:true, lockMins:10, clipSecs:30, privacyMode:false, workspace:'default', panicEnabled:true, fontScale:'md', highContrast:false,
  bF:'all', cF:'all', invF:'all', simF:'all', aF:'all', expF:'all', gF:'all',
  _timer:null, _clockTimer:null,
};

// ===================== STORAGE ENGINE =====================
const Store = {
  // Legacy localStorage accessor (migration only)
  loadRaw() { try { return JSON.parse(localStorage.getItem('vos3')); } catch(e) {} return null; },

  // Build the serialisable data object from S
  _data() {
    return {
      schemaVersion: SCHEMA_VERSION,
      user: S.user, noPin: S.noPin,
      modules: S.modules,
      banks: S.banks, cards: S.cards, investments: S.investments, cash: S.cash, loans: S.loans, friends: S.friends, sims: S.sims,
      assets: S.assets, expenses: S.expenses, emails: S.emails, gadgets: S.gadgets,
      digital: S.digital, vehicles: S.vehicles, activity: S.activity.slice(0, 80), tags: S.tags, wallet: S.wallet, trash: S.trash,
      importedFiles: S.importedFiles || [], _pendingLinks: S._pendingLinks || [],
      fails: S.fails, lockedUntil: S.lockedUntil,
      autoLock: S.autoLock, lockMins: S.lockMins, clipSecs: S.clipSecs
    };
  },

  // Save non-sensitive prefs to localStorage (for startup display before unlock)
  _savePrefs() {
    try {
      localStorage.setItem('vos_prefs', JSON.stringify({
        theme: S.user.theme, fontScale: S.fontScale, highContrast: S.highContrast,
        name: S.user.name, hasVault: true
      }));
    } catch(e) {}
  },

  loadPrefs() { try { return JSON.parse(localStorage.getItem('vos_prefs')); } catch(e) {} return null; },

  _saveCount: 0,

  checkQuota() {
    try {
      let total = 0;
      for (const key of Object.keys(localStorage)) {
        total += (localStorage.getItem(key) || '').length * 2;
      }
      const MB = total / (1024 * 1024);
      if (MB > 4) {
        Toast.show(`Storage is ${MB.toFixed(1)}MB — consider removing old photos or exporting a backup.`, 'warn', 8000);
      }
      return MB;
    } catch(e) { return 0; }
  },

  // Fire-and-forget: encrypt and persist to IndexedDB.
  // Callers remain synchronous — VaultDB.save runs in background.
  save() {
    const data = this._data();
    this._savePrefs();
    if (VaultDB.sessionKey) {
      VaultDB.save(data).catch(e => {
        console.warn('[VaultDB] save error:', e);
        try {
          const fails = JSON.parse(localStorage.getItem('vos_failed_ops') || '[]');
          fails.unshift({ op: 'save', at: new Date().toISOString(), err: String(e).slice(0, 100) });
          localStorage.setItem('vos_failed_ops', JSON.stringify(fails.slice(0, 20)));
        } catch(_) {}
      });
    }
    this._saveWidgetSnapshot();
    this._saveCount++;
    if (this._saveCount % 10 === 0) this.checkQuota();
    // Monthly cleanup of oversized activity and trash
    try {
      const lastClean = localStorage.getItem('vos_last_clean');
      const monthAgo = Date.now() - 30*24*60*60*1000;
      if (!lastClean || parseInt(lastClean) < monthAgo) {
        if (S.activity && S.activity.length > 500) S.activity = S.activity.slice(0, 200);
        if (S.trash && S.trash.length > 100) S.trash = S.trash.slice(0, 50);
        localStorage.setItem('vos_last_clean', Date.now().toString());
      }
    } catch(_) {}
  },

  _saveWidgetSnapshot() {
    try {
      localStorage.setItem('vaultos_widget', JSON.stringify({
        nw: S.user.netWorth || 0,
        currency: S.user.currency || 'PKR',
        cards: (S.cards || []).length,
        banks: (S.banks || []).length,
        name: S.user.name || '',
        updated: new Date().toISOString()
      }));
    } catch(e) {}
  },

  // Load from VaultDB (async). Called after VaultDB.init() in PIN flow.
  async load() {
    try {
      const d = await VaultDB.load();
      if (d) { Object.assign(S, d); return true; }
    } catch(e) {}
    return false;
  },

  async clear() {
    try { await VaultDB.clear(); } catch(e) {}
    try { sessionStorage.clear(); } catch(e) {}
    try {
      ['vos3', 'vos_prefs'].forEach(k => localStorage.removeItem(k));
    } catch(e) {}
    S.banks=[]; S.cards=[]; S.investments=[]; S.cash=[]; S.loans=[]; S.friends=[]; S.sims=[]; S.assets=[];
    S.expenses=[]; S.emails=[]; S.gadgets=[]; S.digital=[]; S.documents=[]; S.vehicles=[];
    S.activity=[]; S.tags=[]; S.wallet=[]; S.trash=[];
    S.user = { name:'', avatar:'💼', theme:'dark', currency:'USD', netWorth:0, nwHistory:[], email:'', phone:'', homeAddr:'', workAddr:'', dob:'', lastBackup:null };
    S.pin=''; S.decoyPin=''; S.fails=0; S.unlocked=false; S.decoy=false;
  }
};

// ===================== THEME ENGINE =====================
const ThemeEngine = {
  _mqListener: null,
  apply(id) {
    if (id === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const resolved = prefersDark ? 'dark' : 'light';
      const t = THEMES.find(x => x.id === resolved) || THEMES[0];
      // Preserve font-scale and high-contrast classes
      const extra = (document.body.className.match(/\b(fs-\w+|hc)\b/g) || []).join(' ');
      document.body.className = [t.cls || '', extra].filter(Boolean).join(' ');
      S.user.theme = 'auto';
      document.getElementById('themeColorMeta').content = t.ac;
      Store.save();
      this.renderDots();
      // Register system preference listener once
      if (!this._mqListener) {
        this._mqListener = () => { if (S.user.theme === 'auto') ThemeEngine.apply('auto'); };
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', this._mqListener);
      }
      return;
    }
    const t = THEMES.find(x => x.id === id) || THEMES[0];
    const extra = (document.body.className.match(/\b(fs-\w+|hc)\b/g) || []).join(' ');
    document.body.className = [t.cls || '', extra].filter(Boolean).join(' ');
    S.user.theme = id;
    document.getElementById('themeColorMeta').content = t.ac;
    Store.save();
    this.renderDots();
  },
  renderDots() {
    ['homeThemes'].forEach(elId => {
      const e = document.getElementById(elId);
      if (e) e.innerHTML = THEMES.map(t =>
        `<div class="tdot${t.id === S.user.theme ? ' on' : ''}" style="background:${t.ac}" title="${t.n}" onclick="ThemeEngine.apply('${t.id}')"></div>`
      ).join('');
    });
  },
  openPicker() {
    const gs = { dark:'🌙 Dark', bold:'⚡ Bold', light:'🌸 Light' };
    document.getElementById('themePicker').innerHTML = Object.entries(gs).map(([g, label]) => `
      <div style="margin-bottom:16px"><div class="set-title">${label}</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">
        ${THEMES.filter(t => t.g === g).map(t =>
          `<div onclick="ThemeEngine.apply('${t.id}');ThemeEngine.closePicker()" style="background:${t.bg};border:2px solid ${t.id === S.user.theme ? t.ac : 'rgba(255,255,255,0.08)'};border-radius:var(--r);padding:12px;cursor:pointer;transition:var(--t)">
            <div style="width:16px;height:16px;border-radius:50%;background:${t.ac};margin-bottom:6px;box-shadow:0 0 8px ${t.gl}"></div>
            <div style="font-size:11px;font-weight:600;color:${t.ac}">${t.n}</div>
          </div>`
        ).join('')}
      </div></div>`
    ).join('');
    document.getElementById('themeOv').classList.add('on');
  },
  closePicker() { document.getElementById('themeOv').classList.remove('on'); }
};

// ===================== TOAST =====================
const Toast = {
  show(msg, type = 'info', dur = 3200) {
    const w = document.getElementById('toastWrap');
    const t = document.createElement('div');
    const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
    const cls   = { success:'ok', error:'err', warning:'wrn', info:'inf' };
    t.className = `toast ${cls[type] || 'inf'}`;
    // msg is rendered as innerHTML so callers can embed buttons or strong tags
    t.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span style="flex:1;line-height:1.4;display:flex;align-items:center;gap:6px;flex-wrap:wrap">${msg}</span><button onclick="this.closest('.toast').remove()" style="background:none;border:none;cursor:pointer;color:var(--text2);font-size:15px;flex-shrink:0">×</button>`;
    w.appendChild(t);
    setTimeout(() => { t.style.animation = 'slideIn .25s reverse'; setTimeout(() => t.remove(), 240); }, dur);
  }
};

// ===================== MODAL =====================
const Modal = {
  open(title, body, foot = '') {
    document.getElementById('mTitle').textContent = title;
    document.getElementById('mBody').innerHTML = body;
    document.getElementById('mFoot').innerHTML = foot;
    const modal = document.getElementById('modal');
    modal.style.transform = '';
    modal.style.transition = '';
    document.getElementById('overlay').classList.add('on');
    this._initSwipe();
    // Wire amount formatting to numeric inputs in modal
    setTimeout(() => {
      document.querySelectorAll('.mb input[type=number], .mb input[inputmode=numeric]').forEach(el => {
        if (el._amtFmt) return;
        el._amtFmt = true;
        el.addEventListener('blur', () => {
          const raw = el.value.replace(/,/g, '');
          if (!isNaN(raw) && raw !== '' && !el.value.includes('/')) {
            const n = parseFloat(raw);
            if (!isNaN(n) && n > 0) el.value = n.toLocaleString('en-US', {maximumFractionDigits:2});
          }
        });
      });
    }, 80);
  },
  close() {
    const modal = document.getElementById('modal');
    modal.style.transform = '';
    modal.style.transition = '';
    document.getElementById('overlay').classList.remove('on');
    ['cf-cvv','cf-cpin','bf-pin','bf-appPin','cf-pwd','bf-pwd'].forEach(id => {
      const f = document.getElementById(id); if (f) f.value = '';
    });
  },
  _initSwipe() {
    const modal = document.getElementById('modal');
    if (!modal || modal._swipeInited) return;
    modal._swipeInited = true;
    let startY = 0, startScrollTop = 0;
    modal.addEventListener('touchstart', e => {
      startY = e.touches[0].clientY;
      startScrollTop = modal.querySelector('.mb')?.scrollTop || 0;
    }, {passive: true});
    modal.addEventListener('touchmove', e => {
      const dy = e.touches[0].clientY - startY;
      if (dy > 0 && startScrollTop === 0) {
        modal.style.transform = `translateY(${Math.max(0, dy * 0.6)}px)`;
        modal.style.transition = 'none';
      }
    }, {passive: true});
    modal.addEventListener('touchend', e => {
      const dy = e.changedTouches[0].clientY - startY;
      modal.style.transition = 'transform .3s var(--spring)';
      if (dy > 80 && startScrollTop === 0) {
        Modal.close();
      } else {
        modal.style.transform = '';
      }
      setTimeout(() => { modal.style.transition = ''; }, 350);
    }, {passive: true});
  }
};

// ===================== ROUTER =====================
const R = {
  showLock() {
    ['pgHome', 'pgOnboard', 'app'].forEach(id => { const e = document.getElementById(id); if (e) e.style.display = 'none'; });
    const lk = document.getElementById('pgLock');
    lk.style.display = 'flex';
    PIN.reset();
    this.startClock();
    const sub = document.getElementById('lkSub');
    if (sub && S.user.name) sub.textContent = `Welcome back, ${S.user.name}`;
    // Forgot PIN shows only after failed attempts
    const fp = document.getElementById('forgotPinLink');
    if (fp) fp.style.display = 'none';
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
    S.unlocked = true; S.decoy = false;
    window._vosUnlocked = true;
    ['pgLock', 'pgHome', 'pgOnboard'].forEach(id => { const e = document.getElementById(id); if (e) e.style.display = 'none'; });
    const fp = document.getElementById('forgotPinLink'); if (fp) fp.style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    document.getElementById('fab').style.display = 'flex';
    buildNav();
    this.goto('dashboard');
    Activity.log('Vault unlocked');
    setTimeout(() => {
      const dashPb = document.getElementById('dashBody');
      if (dashPb) pullToRefresh(dashPb, () => Dash.render());
    }, 500);
    setTimeout(() => {
      if (typeof DataIntegrity !== 'undefined') {
        const r = DataIntegrity.run();
        if (r.issues > 0) Toast.show(`🔍 Vault scan: ${r.issues} issue(s) found — check Integrity in Settings`, 'warn', 5000);
      }
    }, 2000);
    setTimeout(() => {
      if (typeof VaultRecovery !== 'undefined') VaultRecovery.check();
    }, 1500);
    setTimeout(() => {
      if (!window._backupPrompted) {
        window._backupPrompted = true;
        const _lb = S.user?.lastBackup ? new Date(S.user.lastBackup) : null;
        const _days = _lb ? Math.floor((Date.now() - _lb) / (1000*60*60*24)) : 999;
        if (_days > 14) {
          Toast.show(
            _days >= 999
              ? '⚠️ You have never backed up your vault. <button class="cpbtn" onclick="ExIm.export(\'vos\')">Backup Now</button>'
              : `⚠️ Last backup was ${_days} days ago. <button class="cpbtn" onclick="ExIm.export(\'vos\')">Backup Now</button>`,
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
    if (S._clockTimer) clearInterval(S._clockTimer);
  },
  lock() {
    S.unlocked = false; clearTimeout(S._timer);
    VaultDB.sessionKey = null;           // clear in-memory key on lock
    if (navigator.vibrate) navigator.vibrate(50);
    document.getElementById('app').style.display = 'none';
    document.getElementById('fab').style.display = 'none';
    Modal.close();
    this.showHome();
    Activity.log('Vault locked');
  },
  goto(pg, force = false) {
    const prev = S.currentPage;
    S.currentPage = pg;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('on'));
    const el = document.getElementById('pg-' + pg);
    if (el) {
      el.classList.add('on');
      el.style.opacity = '0';
      el.style.transform = 'translateY(8px)';
      requestAnimationFrame(() => {
        el.style.transition = 'opacity var(--anim-fast,140ms) var(--ease-smooth,ease), transform var(--anim-fast,140ms) var(--ease-smooth,ease)';
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
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
      gadgets:     () => Gadgets.render(),
      digital:     () => Digital.render(),
      alerts:      () => renderAlerts(),
      documents:   () => { const t=Date.now(); DocsModule.render(); if(typeof DevDiag!=='undefined')DevDiag.trackRender('documents',Date.now()-t); },
      search:      () => GlobalSearch.render(),
      import:      () => ImportEngine.render(),
      timeline:    () => Timeline.render(),
      security:    () => SecurityCenter.render(),
      backup:      () => BackupCenter.render(),
      recovery:    () => RecoveryCenter.render(),
      workspace:   () => WorkspaceManager.render(),
      vehicles:    () => Vehicles.render(),
      reminders:   () => Reminders.render(),
      'ai-import': () => { if (typeof AIImport !== 'undefined') AIImport.render(); },
      'trash':     () => { if (typeof Trash !== 'undefined') Trash.render(); },
      emergency:   () => Emergency.render(),
      currency:    () => { if (typeof Currency !== 'undefined') Currency.render(); },
      gold:        () => { if (typeof Gold !== 'undefined') Gold.render(); },
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
        } else {
          Settings.render();
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

// ===================== SETTINGS — FORGOT PIN =====================
window.Settings = window.Settings || {};

window.Settings.forgotPIN = function() {
  Modal.open('🔑 Forgot PIN',
    '<div style="display:flex;flex-direction:column;gap:12px;padding:4px 0">' +
    '<div onclick="Modal.close();window.Settings.useMasterKey()" style="background:var(--glass);border:1px solid var(--border);border-radius:12px;padding:16px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:14px">' +
    '<div style="font-size:28px">🗝️</div>' +
    '<div><div style="font-weight:700;font-size:15px;margin-bottom:3px">Use Master Key</div><div style="font-size:13px;color:var(--text2)">Enter the master key you saved when setting up</div></div>' +
    '</div>' +
    '<div onclick="Modal.close();document.getElementById(\'importF-global\')?.click()" style="background:var(--glass);border:1px solid var(--border);border-radius:12px;padding:16px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:14px">' +
    '<div style="font-size:28px">📥</div>' +
    '<div><div style="font-weight:700;font-size:15px;margin-bottom:3px">Restore from Backup</div><div style="font-size:13px;color:var(--text2)">Import a .vault backup file to recover access</div></div>' +
    '</div>' +
    '<div onclick="Modal.close();window.Settings.resetVault()" style="background:rgba(255,64,96,.06);border:1px solid rgba(255,64,96,.25);border-radius:12px;padding:16px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:14px">' +
    '<div style="font-size:28px">⚠️</div>' +
    '<div><div style="font-weight:700;font-size:15px;color:var(--err);margin-bottom:3px">Reset Vault</div><div style="font-size:13px;color:var(--text2)">Last resort — permanently wipes all data</div></div>' +
    '</div>' +
    '</div>',
    '<button class="btn btn-g btn-full" onclick="Modal.close()">Cancel</button>'
  );
};

window.Settings.useMasterKey = function() {
  Modal.open('🗝️ Enter Master Key',
    '<div style="display:flex;flex-direction:column;gap:12px">' +
    '<div style="font-size:13px;color:var(--text2);line-height:1.6;padding:10px;background:var(--glass);border-radius:10px">Enter the master key that was shown when you first set up VaultOS.<br><span style="color:var(--text3)">Format: XXXXXX-XXXXXX-XXXXXX</span></div>' +
    '<input class="inp" id="mk-in" placeholder="XXXXXX-XXXXXX-XXXXXX" style="font-family:var(--mono);letter-spacing:3px;text-transform:uppercase;font-size:16px;text-align:center" oninput="this.value=this.value.toUpperCase().replace(/[^A-Z0-9-]/g,\'\')">' +
    '<div id="mk-err" style="color:var(--err);font-size:12px;min-height:16px;text-align:center"></div>' +
    '</div>',
    '<button class="btn btn-g" onclick="Modal.close()">Cancel</button>' +
    '<button class="btn btn-p" onclick="window.Settings.verifyMasterKey()">Verify & Reset PIN</button>'
  );
};

window.Settings.verifyMasterKey = function() {
  const input = (document.getElementById('mk-in')?.value || '').trim().toUpperCase();
  const pin = S.pin || localStorage.getItem('vo_pin') || '';
  const name = S.user?.name || '';
  const raw = btoa(unescape(encodeURIComponent(pin + ':' + name + ':VaultOS3')));
  const expected = (raw.replace(/[^A-Za-z0-9]/g,'').slice(0,6) + '-' + raw.slice(4,10).toUpperCase() + '-' + raw.slice(10,16).toUpperCase()).toUpperCase();
  const err = document.getElementById('mk-err');
  if (input === expected) {
    Modal.close();
    if (window.Settings.changePIN) {
      window.Settings.changePIN();
    } else {
      const newPin = prompt('Master key verified! Enter your new 6-digit PIN:');
      if (newPin && /^\d{6}$/.test(newPin)) {
        S.pin = newPin;
        if (typeof Store !== 'undefined') Store.save();
        else localStorage.setItem('vo_pin', newPin);
        if (window.Toast) Toast.show('PIN updated successfully', 'success');
      }
    }
  } else {
    if (err) err.textContent = 'Invalid master key — please check and try again';
    else alert('Invalid master key');
  }
};

window.Settings.resetVault = function() {
  if (!confirm('⚠️ This will permanently delete ALL your vault data. This cannot be undone. Are you absolutely sure?')) return;
  if (!confirm('FINAL CONFIRMATION: Reset entire vault and delete all data?')) return;
  const keys = Object.keys(localStorage).filter(k =>
    k.startsWith('vo_') || k.startsWith('vos_') || k.startsWith('vault_') || k === 'pin'
  );
  keys.forEach(k => localStorage.removeItem(k));
  if (window.caches) caches.keys().then(ks => ks.forEach(k => caches.delete(k)));
  if (window.Toast) Toast.show('Vault reset — reloading...', 'warning', 1500);
  setTimeout(() => location.reload(), 1600);
};

// ===================== PIN / LOCK SYSTEM =====================
let pe = ''; let lt = null;
const PIN = {
  reset() {
    pe = '';
    [0,1,2,3,4,5].forEach(i => { const d = document.getElementById('pd' + i); if (d) d.className = 'pd'; });
    document.getElementById('pmsg').className = 'pin-msg';
    document.getElementById('pmsg').textContent = '';
    document.getElementById('lkBar').style.display = 'none';
  },
  in(n) {
    if (pe.length >= 6) return;
    if (Date.now() < S.lockedUntil) { this.showLo(); return; }
    if (S.noPin) { R.unlock(); return; }
    pe += n; this.dots();
    if (navigator.vibrate) navigator.vibrate(6);
    if (pe.length === 6) {
      const fpl = document.getElementById('forgotPinLink');
      if (fpl) fpl.style.display = 'none';
      setTimeout(() => this.verify(), 130);
    }
  },
  del() {
    pe = pe.slice(0, -1);
    const msg = document.getElementById('pmsg');
    if (msg) msg.className = 'pin-msg';
    this.dots();
  },
  dots() {
    [0,1,2,3,4,5].forEach(i => {
      const d = document.getElementById('pd' + i);
      if (d) d.className = 'pd' + (i < pe.length ? ' on' : '');
    });
    const msg = document.getElementById('pmsg');
    if (msg && !msg.classList.contains('err')) {
      msg.textContent = pe.length > 0 ? pe.length + ' of 6' : '';
    }
  },
  verify() {
    if (Date.now() < S.lockedUntil) { this.showLo(); pe = ''; this.dots(); return; }
    const entered = pe;
    pe = '';
    this.dots();
    // Show pending state
    [0,1,2,3,4,5].forEach(i => { const d = document.getElementById('pd' + i); if (d) d.classList.add('on'); });
    const msg = document.getElementById('pmsg');
    if (msg) { msg.className = 'pin-msg'; msg.textContent = 'Verifying…'; }

    this._verify(entered).then(result => {
      if (result === 'real') {
        S.fails = 0; Store.save();
        setTimeout(() => R.unlock(), 180);
      } else if (result === 'decoy') {
        S.decoy = true; S.fails = 0;
        loadDecoyData(); R.unlock();
      } else {
        // Wrong PIN — brute force protection
        S.fails++;
        // Persist fail count via legacy localStorage during migration, or via VaultDB if available
        if (VaultDB.sessionKey) { Store.save(); }
        else { try { localStorage.setItem('vos_fails', JSON.stringify({ fails: S.fails, lockedUntil: S.lockedUntil })); } catch(e) {} }

        [0,1,2,3,4,5].forEach(i => { const d = document.getElementById('pd' + i); if (d) d.className = 'pd err'; });
        if (msg) msg.className = 'pin-msg err';

        if (S.fails >= 10) {
          // Wipe vault after 10 fails
          msg.textContent = '⚠️ Too many attempts — wiping vault';
          Store.clear().then(() => setTimeout(() => location.reload(), 1500));
          return;
        } else if (S.fails >= 5) {
          const w = 300; // 5 min
          S.lockedUntil = Date.now() + w * 1000;
          if (msg) msg.textContent = `Too many attempts — locked ${w}s`;
          this.countdown(w);
        } else if (S.fails >= 3) {
          const w = 30;
          S.lockedUntil = Date.now() + w * 1000;
          if (msg) msg.textContent = `Too many attempts — locked ${w}s`;
          this.countdown(w);
        } else {
          if (msg) msg.textContent = `Wrong PIN — ${3 - Math.min(S.fails, 2)} attempts left`;
        }
        Activity.log('Failed PIN #' + S.fails);
        if (S.fails >= 2) {
          const fpl = document.getElementById('forgotPinLink');
          if (fpl) fpl.style.display = 'inline';
        }
        setTimeout(() => {
          [0,1,2,3,4,5].forEach(i => { const d = document.getElementById('pd' + i); if (d) d.className = 'pd'; });
          this.dots();
        }, 580);
      }
    }).catch(() => {
      // Unexpected error
      [0,1,2,3,4,5].forEach(i => { const d = document.getElementById('pd' + i); if (d) d.className = 'pd'; });
      if (msg) { msg.className = 'pin-msg err'; msg.textContent = 'Error — try again'; }
      this.dots();
    });
  },

  // Async PIN verification: migration path + VaultDB path
  async _verify(pin) {
    if (S.noPin) return 'real';

    // ── Migration path: old localStorage data ──────────────────────────────
    const oldData = Store.loadRaw();
    const hasVaultDB = await VaultDB.isInitialized();

    if (oldData && !hasVaultDB) {
      if (oldData.noPin || pin === String(oldData.pin)) {
        // Migrate: load old data into S, then encrypt to VaultDB
        Object.assign(S, oldData);
        try {
          await VaultDB.init(pin || '000000');
          await VaultDB.save(Store._data());
          localStorage.removeItem('vos3');
          Store._savePrefs();
        } catch(e) { console.warn('[VaultDB] migration error:', e); }
        return 'real';
      }
      if (oldData.decoyPin && pin === String(oldData.decoyPin)) {
        return 'decoy';
      }
      return null;
    }

    // ── VaultDB path: try main then decoy slot ─────────────────────────────
    const result = await VaultDB.tryPin(pin);
    if (!result) return null;
    if (result.slot === 'decoy') return 'decoy';
    Object.assign(S, result.data);
    return 'real';
  },
  countdown(s) {
    let r = s;
    const bar  = document.getElementById('lkBar');
    const fill = document.getElementById('lkFill');
    bar.style.display = 'block'; fill.style.width = '100%'; clearInterval(lt);
    lt = setInterval(() => {
      r--; fill.style.width = (r / s * 100) + '%';
      document.getElementById('pmsg').textContent = `Locked — ${r}s`;
      if (r <= 0) { clearInterval(lt); bar.style.display = 'none'; S.lockedUntil = 0; Store.save(); this.reset(); }
    }, 1000);
  },
  showLo() {
    const r = Math.ceil((S.lockedUntil - Date.now()) / 1000);
    document.getElementById('pmsg').textContent = `Locked — ${r}s`;
    document.getElementById('pmsg').className = 'pin-msg err';
  }
};

// ===================== ONBOARDING =====================
let obStep = 1, obSec = 'secure';
let obMods = { banks:true, cards:true, investments:true, sims:true, assets:true, expenses:true, emails:true, gadgets:true, digital:true };

const OB = {
  init() {
    document.getElementById('pgOnboard').style.display = 'flex';
    document.getElementById('pgHome').style.display = 'none';
    this.renderProg(); this.renderMods(); this.renderThemes();
  },
  renderProg() {
    document.getElementById('obProg').innerHTML = Array.from({ length:6 }, (_, i) =>
      `<div class="ob-pd${i < obStep ? ' on' : ''}"></div>`
    ).join('');
  },
  renderMods() {
    document.getElementById('modGrid').innerHTML = ALL_MODULES.map(m =>
      `<div class="mod-opt${obMods[m.id] ? ' on' : ''}" onclick="OB.toggleMod('${m.id}',this)">
        <div class="mic">${m.ic}</div><div class="mname">${m.n}</div><div class="mchk">✓</div>
      </div>`
    ).join('');
  },
  toggleMod(id, el) { obMods[id] = !obMods[id]; el.classList.toggle('on', obMods[id]); },
  renderThemes() {
    document.getElementById('ob-themes').innerHTML = THEMES.map(t =>
      `<div onclick="ThemeEngine.apply('${t.id}');document.querySelectorAll('[data-tid]').forEach(x=>x.style.borderColor='rgba(255,255,255,0.08)');this.style.borderColor='${t.ac}'" data-tid="${t.id}" style="background:${t.bg};border:2px solid ${t.id === S.user.theme ? t.ac : 'rgba(255,255,255,0.08)'};border-radius:var(--r);padding:11px;cursor:pointer;transition:var(--t)">
        <div style="width:16px;height:16px;border-radius:50%;background:${t.ac};margin-bottom:6px;box-shadow:0 0 8px ${t.gl}"></div>
        <div style="font-size:10px;font-weight:600;color:${t.ac}">${t.n}</div>
      </div>`
    ).join('');
  },
  setSec(s) {
    obSec = s;
    ['paranoid', 'secure', 'relaxed'].forEach(x => {
      const el = document.getElementById('so-' + x);
      if (el) el.classList.toggle('on', x === s);
    });
  },
  checkPIN() {
    const p1 = document.getElementById('ob-pin')?.value;
    const p2 = document.getElementById('ob-pin2')?.value;
    const m  = document.getElementById('ob-pinmatch');
    if (!m || !p2) return;
    if (p2.length === 0) { m.textContent = ''; return; }
    if (p1 === p2 && p1.length === 6) { m.innerHTML = '<span style="color:var(--ok)">✅ PINs match</span>'; }
    else if (p1.startsWith(p2) || p2.length < 6) { m.innerHTML = '<span style="color:var(--text3)">Typing...</span>'; }
    else { m.innerHTML = '<span style="color:var(--err)">❌ PINs do not match</span>'; }
  },
  next(step) {
    if (step === 1) {
      const n = document.getElementById('ob-name').value.trim();
      if (!n) { Toast.show('Please enter your name', 'warning'); return; }
      S.user.name = n;
    }
    if (step === 2) Object.assign(S.modules, obMods);
    if (step === 4) {
      const cfg = { paranoid:{ lockMins:1, clipSecs:15 }, secure:{ lockMins:10, clipSecs:30 }, relaxed:{ lockMins:30, clipSecs:60 } };
      const c = cfg[obSec]; S.autoLock = true; S.lockMins = c.lockMins; S.clipSecs = c.clipSecs;
    }
    obStep = step + 1;
    document.querySelectorAll('.ob-step').forEach((el, i) => el.classList.toggle('on', i + 1 === obStep));
    this.renderProg();
  },
  finish() {
    const p  = document.getElementById('ob-pin').value;
    const p2 = document.getElementById('ob-pin2').value;
    const d  = document.getElementById('ob-decoy').value;
    if (!/^\d{6}$/.test(p)) { document.getElementById('ob-perr').textContent = 'PIN must be 6 digits'; return; }
    if (p !== p2) { document.getElementById('ob-perr').textContent = 'PINs do not match'; return; }
    S.pin = p; S.decoyPin = d || ''; S.noPin = false;
    VaultDB.init(p).then(async () => {
      Store.save();
      if (d && /^\d{6}$/.test(d)) {
        await VaultDB.saveDecoySlot(d, { _decoy: true });
      }
      delete S.pin; delete S.decoyPin;
    }).catch(e => console.warn('[VaultDB] init error:', e));
    obStep = 6;
    document.querySelectorAll('.ob-step').forEach((el, i) => el.classList.toggle('on', i + 1 === obStep));
    this.renderProg();
  },
  complete() {
    document.getElementById('pgOnboard').style.display = 'none';
    Toast.show(`Welcome to VaultOS, ${S.user.name}! 🎉`, 'success');
    R.unlock();
    setTimeout(() => {
      const ov = document.createElement('div');
      ov.id = 'quickStartOv';
      ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:1000;display:flex;flex-direction:column;align-items:center;justify-content:center;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);padding:24px';
      ov.innerHTML = `
        <div style="font-size:22px;font-weight:800;margin-bottom:6px;text-align:center">Quick Start 🚀</div>
        <div style="font-size:13px;color:var(--text2);margin-bottom:20px;text-align:center">Tap a card to add your first entry</div>
        <div style="display:flex;flex-direction:column;gap:10px;width:100%;max-width:320px">
          <div onclick="Banks.openAdd();document.getElementById('quickStartOv').remove()" style="background:var(--glass2);border:1px solid var(--border2);border-radius:var(--r);padding:14px 16px;cursor:pointer;display:flex;align-items:center;gap:12px;animation:obIn .35s .05s both">
            <span style="font-size:26px">🏦</span><div style="flex:1"><div style="font-weight:700;font-size:14px">Add your first bank</div><div style="font-size:12px;color:var(--text2)">Accounts, IBANs & login details</div></div><span style="color:var(--accent)">→</span>
          </div>
          <div onclick="DocsModule.openAdd();document.getElementById('quickStartOv').remove()" style="background:var(--glass2);border:1px solid var(--border2);border-radius:var(--r);padding:14px 16px;cursor:pointer;display:flex;align-items:center;gap:12px;animation:obIn .35s .15s both">
            <span style="font-size:26px">🪪</span><div style="flex:1"><div style="font-weight:700;font-size:14px">Add your ID</div><div style="font-size:12px;color:var(--text2)">Passport, NIC, driving licence</div></div><span style="color:var(--accent)">→</span>
          </div>
          <div onclick="Sims.openAdd();document.getElementById('quickStartOv').remove()" style="background:var(--glass2);border:1px solid var(--border2);border-radius:var(--r);padding:14px 16px;cursor:pointer;display:flex;align-items:center;gap:12px;animation:obIn .35s .25s both">
            <span style="font-size:26px">📱</span><div style="flex:1"><div style="font-weight:700;font-size:14px">Add your SIM</div><div style="font-size:12px;color:var(--text2)">Mobile numbers & networks</div></div><span style="color:var(--accent)">→</span>
          </div>
        </div>
        <button onclick="document.getElementById('quickStartOv').remove()" style="margin-top:18px;background:none;border:none;color:var(--text3);font-size:13px;cursor:pointer;padding:10px">Skip, go to dashboard →</button>
      `;
      document.body.appendChild(ov);
      setTimeout(() => { const e = document.getElementById('quickStartOv'); if (e) e.remove(); }, 8000);
    }, 400);
  }
};

// ===================== ACTIVITY =====================
const Activity = {
  log(a, d = '') {
    S.activity.unshift({ id: Date.now(), a, d, t: new Date().toISOString() });
    if (S.activity.length > 80) S.activity.pop();
    Store.save();
  },
  ago(iso) {
    const diff = Date.now() - new Date(iso);
    if (diff < 60000)   return 'just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return new Date(iso).toLocaleDateString();
  }
};

// ===================== DUPLICATE CHECKER =====================
const _BANK_ALIAS_GROUPS = [
  // PK commercial
  ['hbl','habib bank limited','habib bank','hbl konnect','hbl islamic','hbl pay'],
  ['ubl','united bank','united bank limited','ubl ameen'],
  ['mcb bank','mcb','muslim commercial bank','mcb islamic','nib bank'],
  ['bank alfalah','alfalah','bankalfalah','alfalah islamic','bank alfalah islamic'],
  ['allied bank','abl','allied bank limited','allied islamic','allied bank islamic'],
  ['askari bank','acbl','askari'],
  ['bank al habib','bahl','al habib bank'],
  ['habib metro bank','habib metropolitan','habib metro'],
  ['standard chartered pk','standard chartered pakistan','stanchart pk','sc pakistan'],
  ['deutsche bank pk','deutsche bank pakistan'],
  ['bank of china pk','bank of china pakistan','boc pakistan'],
  ['icbc pakistan','industrial and commercial bank of china pk','icbc pk'],
  ['samba bank','samba pk','samba financial group pk'],
  ['silkbank','silk bank','silk'],
  ['soneri bank','soneri'],
  ['summit bank','summit'],
  ['js bank','jsb'],
  // PK islamic
  ['meezan bank','meezan','al meezan bank'],
  ['bank islami','bankislami','kasb bank','bipl'],
  ['dubai islamic bank pk','dib pakistan','dib pk'],
  ['al baraka bank pk','al baraka pakistan','albaraka bank pk'],
  ['faysal bank','faysal','fbl','faysal bank islamic'],
  // PK microfinance/digital
  ['sadapay','sada pay'],
  ['nayapay','naya pay'],
  ['zindigi','jazz zindigi'],
  ['jazzcash','jazz cash','jazz mobile money'],
  ['easypaisa','easy paisa','telenor microfinance'],
  ['upaisa','u paisa','ufone wallet'],
  ['finja','simsim','finja simsim'],
  ['hbl pay','hbl mobile wallet'],
  ['mcb lite','mcb mobile','mcb lite prepaid'],
  // PK government
  ['nbp','national bank of pakistan','national bank'],
  ['bank of punjab','bop'],
  ['zarai taraqiati bank','ztbl','agricultural bank pk','adbp'],
  ['sme bank','sme bank pakistan'],
  ['hbfc','house building finance company','house building finance corporation'],
  // PK foreign
  ['hsbc pakistan','hsbc pk'],
  ['citibank pk','citi pakistan','citibank pakistan','citi pk'],
  // UK traditional
  ['barclays','barclays bank','barclaycard','barclays international'],
  ['hsbc uk','hsbc','hsbc holdings','hsbc kinetic'],
  ['natwest','national westminster bank','national westminster'],
  ['lloyds bank','lloyds','lloyds banking group','lloyds international'],
  ['santander uk','santander','abbey national'],
  ['halifax','halifax bank','halifax building society'],
  ['nationwide','nationwide building society'],
  ['metro bank','metro bank uk'],
  ['tsb','tsb bank'],
  ['bank of scotland','bos scotland','bos'],
  ['royal bank of scotland','rbs','rbs group'],
  ['ulster bank','ulster bank ni'],
  ['clydesdale bank','clydesdale'],
  ['virgin money','virgin money uk','virgin bank uk'],
  ['co-operative bank','co-op bank','the co-operative bank','cooperative bank'],
  ['yorkshire bank','yorkshire','clydesdale yorkshire'],
  // UK digital
  ['monzo','monzo bank'],
  ['starling bank','starling'],
  ['revolut','revolut bank'],
  ['wise','transferwise','wise bank'],
  ['chase uk','chase bank uk','jpmorgan chase uk'],
  ['first direct','firstdirect'],
  ['atom bank','atom'],
  ['tandem bank','tandem'],
  ['cashplus','zempler bank','cashplus bank'],
  ['anna money','anna business'],
  ['tide','tide business','tide bank'],
  ['oaknorth bank','oaknorth'],
  ['zopa bank','zopa'],
  ['paysend','dozens','paysend uk'],
  // UK islamic
  ['al rayan bank','islamic bank of britain','al rayan'],
  ['gatehouse bank','gatehouse'],
  // UK international
  ['citibank uk','citi uk'],
  ['jp morgan uk','jpmorgan uk','j.p. morgan uk'],
  ['goldman sachs uk','marcus uk','marcus by goldman sachs'],
  // UAE commercial
  ['emirates nbd','enbd','emirates nbd bank','emirates national bank of dubai'],
  ['fab','first abu dhabi bank','nbad','national bank of abu dhabi'],
  ['adcb','abu dhabi commercial bank'],
  ['mashreq bank','mashreq','mashreq neo'],
  ['rakbank','national bank of ras al-khaimah','nrak'],
  ['commercial bank of dubai','cbd','cbd dubai'],
  ['united arab bank','uab','uab uae'],
  ['national bank of fujairah','nbf','nbf uae'],
  ['national bank of umm al qaiwain','nbq','nbq uae'],
  // UAE islamic
  ['adib','abu dhabi islamic bank'],
  ['dubai islamic bank','dib','dib uae'],
  ['emirates islamic','ei bank','emirates islamic bank','eib'],
  ['sharjah islamic bank','sib','sib uae'],
  // UAE digital
  ['wio bank','wio'],
  ['liv.','liv bank','emirates nbd liv','liv by emirates nbd'],
  ['yap','yap uae'],
  ['now money','now money uae'],
  ['zand bank','zand'],
  ['nomo bank','nomo'],
  // UAE international
  ['citibank uae','citi uae','citibank dubai'],
  ['hsbc uae','hsbc dubai','hsbc abu dhabi'],
  ['standard chartered uae','stanchart uae','standard chartered dubai'],
  // US
  ['chase','jpmorgan chase','jp morgan'],
  ['citibank','citi','citigroup'],
];
function checkDuplicate(type, data) {
  const n = s => (s||'').toLowerCase().trim();
  if (type === 'bank') {
    const nm = n(data.bankName);
    const grp = _BANK_ALIAS_GROUPS.find(g => g.some(a => a === nm || nm.includes(a) || a.includes(nm)));
    const ex = (S.banks||[]).find(b => {
      const bn = n(b.bankName);
      if (bn === nm) return true;
      if (grp && grp.some(a => a === bn)) return true;
      return false;
    });
    if (ex) return { isDuplicate:true, existingId:ex.id, message:`Possible duplicate: "${ex.bankName}" already exists. Save anyway?` };
  }
  if (type === 'card') {
    const ex = (S.cards||[]).find(c => n(c.cardName) === n(data.cardName) && (c.last4||'') === (data.last4||''));
    if (ex) return { isDuplicate:true, existingId:ex.id, message:`Possible duplicate: "${ex.cardName}"${ex.last4?' ****'+ex.last4:''} already exists. Save anyway?` };
  }
  if (type === 'sim') {
    const ph = s => (s||'').replace(/\D/g,'').slice(-7);
    const ex = (S.sims||[]).find(s => n(s.network) === n(data.network) && ph(s.phone) && ph(data.phone) && ph(s.phone) === ph(data.phone));
    if (ex) return { isDuplicate:true, existingId:ex.id, message:`Possible duplicate: ${ex.network} ${ex.phone} already exists. Save anyway?` };
  }
  if (type === 'email') {
    const ex = (S.emails||[]).find(e => n(e.email) === n(data.email));
    if (ex) return { isDuplicate:true, existingId:ex.id, message:`Possible duplicate: "${ex.email}" already exists. Save anyway?` };
  }
  if (type === 'investment') {
    const nm = n(data.investmentName);
    const ex = (S.investments||[]).find(i => {
      const iv = n(i.investmentName);
      return iv === nm || (nm && iv && (nm.includes(iv) || iv.includes(nm)));
    });
    if (ex) return { isDuplicate:true, existingId:ex.id, message:`Possible duplicate: "${ex.investmentName}" already exists. Save anyway?` };
  }
  return { isDuplicate:false };
}

// ===================== AUTO LINK =====================
function autoLink(module, item) {
  const n = s => (s||'').toLowerCase().trim();
  S._pendingLinks = S._pendingLinks || [];

  if (module === 'card') {
    const cardLow = n(item.cardName || '');
    const bank = (S.banks||[]).find(b => {
      const bn = n(b.bankName);
      return bn && (cardLow.includes(bn) || bn.includes(cardLow.split(' ')[0]));
    });
    if (bank) {
      item.linkedBankId = bank.id;
    } else if (cardLow) {
      S._pendingLinks.push({ type:'card', id:item.id, matchName:cardLow, field:'linkedBankId', targetModule:'banks' });
    }
  }

  if (module === 'bank') {
    const bankLow = n(item.bankName || '');
    const stillPending = [];
    S._pendingLinks.forEach(link => {
      if ((link.type === 'card' || link.type === 'expense') && link.matchName &&
          (link.matchName.includes(bankLow) || bankLow.includes(link.matchName.split(' ')[0]))) {
        const arr = link.type === 'card' ? S.cards : S.expenses;
        const target = (arr||[]).find(x => x.id === link.id);
        if (target) target[link.field] = item.id;
      } else {
        stillPending.push(link);
      }
    });
    S._pendingLinks = stillPending;
  }

  if (module === 'loan') {
    const person = n(item.person || item.personName || '');
    if (person) {
      const friend = (S.friends||[]).find(f => n(f.name) === person);
      if (friend) item.linkedFriendId = friend.id;
    }
  }

  if (module === 'sim') {
    const network = n(item.network || '');
    if (network) {
      const expense = (S.expenses||[]).find(e => {
        const en = n(e.name);
        return en.includes(network) || network.includes(en);
      });
      if (expense) item.linkedExpenseId = expense.id;
    }
  }
}

// ===================== AUTO TAGS =====================
function autoTags(type, data) {
  const tags = [];
  if (type === 'bank') {
    if (data.bankType === 'islamic') { tags.push('islamic'); tags.push('halal'); }
    if (data.bankType === 'digital') tags.push('digital');
    if (data.country === 'PK') tags.push('pakistan');
    if (data.country === 'GB') tags.push('uk');
    if (data.country === 'AE') tags.push('uae');
    if ((data.balance||0) > 100000) tags.push('high-value');
  } else if (type === 'card') {
    if (data.network === 'American Express') { tags.push('amex'); tags.push('travel'); }
    if ((data.cardType||'').toLowerCase() === 'credit') tags.push('credit');
    if ((data.cardType||'').toLowerCase() === 'debit') tags.push('debit');
    if (data.network === 'Visa') tags.push('visa');
    if (data.network === 'Mastercard') tags.push('mastercard');
    if ((data.annualFee||0) > 0) tags.push('paid');
    if (data.category === 'Crypto') tags.push('crypto');
    if (data.category === 'International' || data.country !== (S.user.currency||'GBP').slice(0,2)) tags.push('international');
  } else if (type === 'investment') {
    if (data.type === 'Crypto') { tags.push('crypto'); tags.push('high-risk'); }
    if (data.type === 'Sukuk') { tags.push('islamic'); tags.push('halal'); }
    if (data.type === 'Mutual Funds') tags.push('fund');
    if (data.country === 'PK') tags.push('psx');
  } else if (type === 'sim') {
    const ccMap = {PK:'pakistan',GB:'uk',AE:'uae',US:'usa',CA:'canada',AU:'australia',IN:'india'};
    if (ccMap[data.country]) tags.push(ccMap[data.country]);
    if (data.simType === 'eSIM') tags.push('esim');
  }
  return tags;
}

// ===================== UTILS =====================
const U = {
  id:       () => 'i' + Date.now() + Math.random().toString(36).slice(2, 5),
  flag:     c  => COUNTRIES.find(x => x.c === c)?.f || '🌐',
  cname:    c  => COUNTRIES.find(x => x.c === c)?.n || c,
  phone:    c  => COUNTRIES.find(x => x.c === c)?.p || '+0',
  fmt:      n  => new Intl.NumberFormat().format(n || 0),
  fmtPKR(n) {
    n = Math.abs(Math.round(n || 0));
    if (n >= 10000000) return (n / 10000000).toFixed(2).replace(/\.?0+$/, '') + ' Cr';
    if (n >= 100000)   return (n / 100000).toFixed(2).replace(/\.?0+$/, '') + ' L';
    return new Intl.NumberFormat('en-PK').format(n);
  },
  expSt(e) {
    if (!e) return 'ok';
    const [m, y] = e.split('/');
    const d = new Date(2000 + parseInt(y), parseInt(m) - 1, 1);
    const mo = (d.getFullYear() - new Date().getFullYear()) * 12 + (d.getMonth() - new Date().getMonth());
    if (mo < 0) return 'err'; if (mo < 3) return 'err'; if (mo < 6) return 'warn'; return 'ok';
  },
  expBadge(e) {
    const s = U.expSt(e); if (!e) return '';
    if (s === 'err')  return '<span class="badge b-err">⚠️ Exp</span>';
    if (s === 'warn') return '<span class="badge b-warn">Soon</span>';
    return '<span class="badge b-ok">Valid</span>';
  },
  pnl(inv, cur) {
    if (!inv || !cur) return '—';
    const d = cur - inv, p = ((d / inv) * 100).toFixed(1), s = d >= 0 ? '+' : '';
    return `<span style="color:${d >= 0 ? 'var(--ok)' : 'var(--err)'}">${s}${U.fmt(Math.round(d))} (${s}${p}%)</span>`;
  },
  countries:   () => COUNTRIES.map(c  => `<option value="${c.c}">${c.f} ${c.n}</option>`).join(''),
  currencies:  () => CURRENCIES.map(c  => `<option value="${c}">${c}</option>`).join(''),
  bankOpts:    cc => (cc ? BANKS_DB.filter(b => b.c === cc || b.c === 'OTHER') : BANKS_DB).map(b => `<option value="${b.n}">`).join(''),
  cardOpts:    () => CARDS_DB.map(c  => `<option value="${c.n}">`).join(''),
  brokerOpts:  () => BROKERS_DB.map(b => `<option value="${b}">`).join(''),
  netOpts:     cc => (cc ? NETWORKS_DB.filter(n => n.c === cc || n.c === 'OTHER') : NETWORKS_DB).map(n => `<option value="${n.n}">`).join(''),
  copy(text, label = '') {
    // Try modern Clipboard API first, fall back to execCommand
    const doCopy = () => {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => _legacyCopy(text));
      } else {
        _legacyCopy(text);
      }
    };
    function _legacyCopy(t) {
      const ta = document.createElement('textarea');
      ta.value = t; ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;width:1px;height:1px';
      document.body.appendChild(ta); ta.focus(); ta.select();
      try { document.execCommand('copy'); } catch(e) {}
      document.body.removeChild(ta);
    }
    doCopy();
    Toast.show((label || 'Value') + ' copied!', 'success');
    // Auto-clear clipboard after configured delay
    _scheduleClipClear();
  },
  reveal(elId, secret, label = '') {
    const el = document.getElementById(elId); if (!el) return;
    const orig = el.textContent; el.textContent = secret; U.copy(secret, label);
    setTimeout(() => { el.textContent = orig; }, 5000);
  },
  tags(sel) {
    if (!sel) sel = [];
    const defaults = ['Personal','Business','Primary','Secondary','Joint','Emergency','Savings','Travel','Islamic','Backup','Crypto','Family'];
    const all = [...defaults, ...(S.tags || [])].filter((v, i, a) => v && a.indexOf(v) === i);
    let html = '<div class="tags" id="tagPick">';
    all.forEach(t => { html += `<span class="tag${sel.indexOf(t) >= 0 ? ' on' : ''}" onclick="this.classList.toggle('on')">${t}</span>`; });
    html += '</div>';
    html += '<div style="display:flex;gap:7px;margin-top:7px">';
    html += '<input class="inp" id="custTagIn" placeholder="Add tag..." style="flex:1" onkeydown="if(event.key===\'Enter\')U.addTag()">';
    html += '<button class="btn btn-g btn-sm" onclick="U.addTag()">+</button></div>';
    return html;
  },
  addTag() {
    const i = document.getElementById('custTagIn'); const v = i.value.trim(); if (!v) return;
    if (!S.tags.includes(v)) S.tags.push(v);
    const p = document.getElementById('tagPick');
    if (p) { const sp = document.createElement('span'); sp.className = 'tag on'; sp.textContent = v; sp.onclick = function() { this.classList.toggle('on'); }; p.appendChild(sp); }
    i.value = ''; Store.save();
  },
  getTags: () => [...document.querySelectorAll('#tagPick .tag.on')].map(t => t.textContent.trim()),
  drRow: (label, val, secret = '') =>
    `<div class="dr"><div class="dk">${label}</div><div class="dv"><span id="dr-${label.replace(/\W/g,'')}" class="sens">${val}</span>${secret ? `<button class="cpbtn" onclick="U.reveal('dr-${label.replace(/\W/g,'')}','${secret.replace(/'/g,"\\'")}','${label}')">👁️</button>` : ''}</div></div>`,
  loginFields: (obj = {}) => `<div class="fr">
    <div class="fg"><label class="fl">App / Web Username</label><input class="inp" id="lf-user" value="${obj.username||''}" placeholder="Username"></div>
    <div class="fg"><label class="fl">Password Hint</label><input class="inp" id="lf-pwd" value="${obj.pwdHint||''}" placeholder="e.g. 'Email+DOB'"></div>
  </div><div class="fr">
    <div class="fg"><label class="fl">App PIN / Passcode</label><input class="inp" id="lf-pin" type="password" value="${obj.appPin||''}" placeholder="App PIN"></div>
    <div class="fg"><label class="fl">2FA Method</label><select class="inp" id="lf-2fa"><option value="">None</option><option value="SMS">SMS</option><option value="Authenticator">Authenticator</option><option value="Email">Email</option><option value="Hardware Key">Hardware Key</option></select></div>
  </div>`,
  getLF:  () => ({ username: document.getElementById('lf-user')?.value.trim(), pwdHint: document.getElementById('lf-pwd')?.value.trim(), appPin: document.getElementById('lf-pin')?.value.trim(), twoFA: document.getElementById('lf-2fa')?.value }),
  setLF(obj) { setTimeout(() => { const t = document.getElementById('lf-2fa'); if (t) t.value = obj.twoFA || ''; }, 60); },
  numInput(el, currency) {
    if (!el) return;
    el.addEventListener('input', () => formatNumberInput(el, currency || S.user.currency || 'PKR'));
  }
};

// ===================== NUMBER INPUT FORMATTER =====================
function formatNumberInput(input, currency) {
  const raw   = (input.value || '').replace(/,/g, '');
  const parts = raw.split('.');
  const intPart = parts[0].replace(/\D/g, '');
  const hasDec  = raw.includes('.');
  const decPart = hasDec ? '.' + (parts[1] || '').replace(/\D/g, '').slice(0, 2) : '';

  if (!intPart && !hasDec) { return 0; }
  const n = parseInt(intPart || '0', 10);
  const formatted = (currency === 'PKR')
    ? new Intl.NumberFormat('en-IN').format(n)
    : new Intl.NumberFormat('en-US').format(n);

  const newVal = formatted + decPart;
  if (input.value !== newVal) {
    const pos = input.selectionStart + (newVal.length - input.value.length);
    input.value = newVal;
    try { input.setSelectionRange(pos, pos); } catch(e) {}
  }
  return parseFloat(raw) || 0;
}

// ===================== MEGA-ADD HELPER =====================
// After any module save, show a quick "Add another?" prompt at the bottom.
function promptAddAnother(moduleLabel, openFn) {
  // Cap at 3 prompts per module to avoid annoying users
  const key = 'vos_addcount_' + moduleLabel;
  const count = parseInt(localStorage.getItem(key) || '0');
  if (count >= 3) return;
  localStorage.setItem(key, count + 1);
  // Remove any existing prompt
  const existing = document.getElementById('add-another-bar');
  if (existing) existing.remove();

  const bar = document.createElement('div');
  bar.id = 'add-another-bar';
  bar.style.cssText = `
    position:fixed;bottom:calc(var(--tabh) + env(safe-area-inset-bottom) + 8px);left:50%;transform:translateX(-50%);
    background:var(--bg2);border:1px solid var(--border2);border-radius:var(--rfull);
    padding:10px 18px;display:flex;align-items:center;gap:12px;z-index:9999;
    box-shadow:var(--shadowlg);animation:slideIn .25s var(--spring);white-space:nowrap;
  `;
  bar.innerHTML = `<span style="font-size:13px;color:var(--text2)">Add another ${moduleLabel}?</span>
    <button class="btn btn-p btn-sm" onclick="document.getElementById('add-another-bar').remove();(${openFn})()">Yes</button>
    <button class="btn btn-g btn-sm" onclick="document.getElementById('add-another-bar').remove()">No</button>`;
  document.body.appendChild(bar);
  // Auto-dismiss after 8s
  setTimeout(() => { if (bar.isConnected) bar.remove(); }, 8000);
}

// ===================== iOS INTERACTION UTILS =====================

function skeletonCard() {
  return `<div class="entry" style="pointer-events:none">
    <div class="entry-main">
      <div class="entry-ic skel" style="width:40px;height:40px;border-radius:var(--rsm);flex-shrink:0"></div>
      <div class="entry-body" style="gap:6px;display:flex;flex-direction:column">
        <div class="skel skel-line medium" style="height:14px;border-radius:6px"></div>
        <div class="skel skel-line short" style="height:11px;border-radius:5px"></div>
      </div>
    </div>
  </div>`;
}

function initSwipeDelete(containerEl, deleteCallback) {
  if (!containerEl) return;
  containerEl.querySelectorAll('.entry:not([data-swipe])').forEach(entry => {
    entry.setAttribute('data-swipe', '1');
    if (!entry.querySelector('.entry-del-bg')) {
      const bg = document.createElement('div');
      bg.className = 'entry-del-bg';
      bg.textContent = 'DELETE';
      entry.appendChild(bg);
    }
    if (!entry.querySelector('.entry-fav-bg')) {
      const favBg = document.createElement('div');
      favBg.className = 'entry-fav-bg';
      favBg.textContent = '⭐';
      favBg.style.cssText = 'position:absolute;left:0;top:0;bottom:0;width:80px;background:var(--ok);display:flex;align-items:center;justify-content:center;font-size:22px;border-radius:var(--r) 0 0 var(--r);transform:translateX(-100%);transition:transform .25s var(--spring)';
      entry.appendChild(favBg);
    }
    const main = entry.querySelector('.entry-main');
    const bg = entry.querySelector('.entry-del-bg');
    const favBg = entry.querySelector('.entry-fav-bg');
    let startX = 0, dx = 0;
    entry.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX; dx = 0;
      if (main) { main.style.transition = 'none'; }
    }, {passive: true});
    entry.addEventListener('touchmove', e => {
      dx = e.touches[0].clientX - startX;
      if (dx < 0 && main) {
        const offset = Math.max(-140, dx);
        main.style.transform = `translateX(${offset}px)`;
        if (bg) bg.style.transform = `translateX(${Math.max(0, 100 + (offset / 80) * 100)}%)`;
        if (favBg) favBg.style.transform = 'translateX(-100%)';
      } else if (dx > 0 && main) {
        const offset = Math.min(80, dx);
        main.style.transform = `translateX(${offset}px)`;
        if (favBg) favBg.style.transform = `translateX(${Math.min(0, -100 + (offset / 80) * 100)}%)`;
        if (bg) bg.style.transform = 'translateX(100%)';
      }
    }, {passive: true});
    entry.addEventListener('touchend', () => {
      if (main) main.style.transition = 'transform .25s var(--spring)';
      if (bg) bg.style.transition = 'transform .25s var(--spring)';
      if (favBg) favBg.style.transition = 'transform .25s var(--spring)';
      if (dx < -120) {
        if (navigator.vibrate) navigator.vibrate([50,30,50]);
        if (main) main.style.transform = '';
        if (bg) bg.style.transform = '';
        const delBtn = entry.querySelector('.icb.del');
        if (delBtn) delBtn.click();
        else if (deleteCallback) deleteCallback(entry.dataset.id);
      } else if (dx < -60) {
        if (main) main.style.transform = 'translateX(-80px)';
        if (bg) bg.style.transform = 'translateX(0%)';
      } else if (dx > 80) {
        if (navigator.vibrate) navigator.vibrate(30);
        if (main) main.style.transform = '';
        if (favBg) favBg.style.transform = 'translateX(-100%)';
        const id = entry.dataset.id;
        if (id) {
          const allArrs = ['banks','cards','investments','sims','assets','expenses','emails','gadgets','digital','loans','cash','friends','vehicles'];
          for (const k of allArrs) {
            const item = (S[k]||[]).find(x => x.id === id);
            if (item) { item.favorite = !item.favorite; Store.save(); Toast.show(item.favorite ? '⭐ Favorited' : 'Removed from favorites', 'success', 1500); break; }
          }
        }
      } else {
        if (main) main.style.transform = '';
        if (bg) bg.style.transform = '';
        if (favBg) favBg.style.transform = 'translateX(-100%)';
      }
    }, {passive: true});
  });
}

function pullToRefresh(el, callback) {
  if (!el || el._ptrInited) return;
  el._ptrInited = true;
  const ind = document.createElement('div');
  ind.className = 'ptr-indicator';
  ind.textContent = '↻';
  el.style.position = 'relative';
  el.insertBefore(ind, el.firstChild);
  let startY = 0, pulling = false;
  el.addEventListener('touchstart', e => {
    if (el.scrollTop === 0) { startY = e.touches[0].clientY; pulling = true; }
  }, {passive: true});
  el.addEventListener('touchmove', e => {
    if (!pulling) return;
    const dy = e.touches[0].clientY - startY;
    if (dy > 0 && el.scrollTop === 0) {
      const pull = Math.min(80, dy);
      ind.style.top = (pull - 44) + 'px';
      el.style.transform = `translateY(${pull * 0.25}px)`;
      el.style.transition = 'none';
    }
  }, {passive: true});
  el.addEventListener('touchend', e => {
    if (!pulling) return;
    pulling = false;
    const dy = e.changedTouches[0].clientY - startY;
    el.style.transition = 'transform .3s var(--spring)';
    el.style.transform = '';
    ind.style.top = '-44px';
    if (dy > 60) {
      ind.textContent = '⟳';
      setTimeout(() => { callback(); ind.textContent = '↻'; }, 300);
    }
    setTimeout(() => { el.style.transition = ''; }, 400);
  }, {passive: true});
}

let _ctxMenuItems = [];
function showContextMenu(x, y, items) {
  document.getElementById('_ctxOverlay')?.remove();
  _ctxMenuItems = items;
  const overlay = document.createElement('div');
  overlay.id = '_ctxOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:1000;';
  overlay.addEventListener('click', () => overlay.remove());
  const menu = document.createElement('div');
  menu.className = 'ctx-menu';
  const mw = 220, mh = items.length * 50;
  const left = Math.min(x, window.innerWidth - mw - 12);
  const top = Math.min(y, window.innerHeight - mh - 12);
  menu.style.cssText = `left:${Math.max(8, left)}px;top:${Math.max(8, top)}px;`;
  menu.innerHTML = items.map((item, i) =>
    `<div class="ctx-menu-item${item.destructive ? ' destructive' : ''}" data-ci="${i}">
      <span class="ctx-menu-ic">${item.icon || ''}</span><span>${item.label}</span>
    </div>`
  ).join('');
  menu.addEventListener('click', e => {
    const el = e.target.closest('[data-ci]');
    if (el) { _ctxMenuItems[+el.dataset.ci]?.action?.(); overlay.remove(); }
    e.stopPropagation();
  });
  overlay.appendChild(menu);
  document.body.appendChild(overlay);
}

function initLongPress(containerEl, buildItems) {
  if (!containerEl) return;
  containerEl.querySelectorAll('.entry:not([data-lp])').forEach(entry => {
    entry.setAttribute('data-lp', '1');
    let timer = null;
    entry.addEventListener('touchstart', e => {
      const id = entry.dataset.id;
      if (!id) return;
      timer = setTimeout(() => {
        if (navigator.vibrate) navigator.vibrate(10);
        const touch = e.touches[0];
        showContextMenu(touch.clientX, touch.clientY, buildItems(id));
      }, 500);
    }, {passive: true});
    entry.addEventListener('touchmove', () => { clearTimeout(timer); timer = null; }, {passive: true});
    entry.addEventListener('touchend', () => { clearTimeout(timer); timer = null; }, {passive: true});
  });
}

// ===================== SMART SUGGEST =====================
const SmartSuggest = {
  forBank(countryCode) {
    const popMap = {
      PK: ['HBL','Meezan Bank','UBL','MCB Bank','Bank Alfalah','Allied Bank','Sadapay','NayaPay'],
      GB: ['Monzo','Starling Bank','Barclays','HSBC UK','Lloyds Bank','NatWest','Revolut','Wise'],
      AE: ['Emirates NBD','FAB','ADCB','Dubai Islamic Bank','Mashreq Bank','ADIB','Wio Bank','Liv.'],
      US: ['Chase','Bank of America','Wells Fargo','Citibank','Capital One'],
    };
    const names = popMap[countryCode] || [];
    return names.map(n => SMART_DB.banks.find(b => b.name === n)).filter(Boolean);
  },
  forCard(bankName) {
    const lc = (bankName || '').toLowerCase();
    return SMART_DB.cards.filter(c => c.name.toLowerCase().includes(lc.split(' ')[0])).slice(0, 6);
  },
  forExpense(name) {
    const n = (name || '').toLowerCase();
    const subs = [
      {k:'netflix',cat:'Streaming',freq:'monthly'},{k:'spotify',cat:'Streaming',freq:'monthly'},
      {k:'youtube',cat:'Streaming',freq:'monthly'},{k:'amazon',cat:'Shopping',freq:'monthly'},
      {k:'apple',cat:'Tech',freq:'monthly'},{k:'google',cat:'Tech',freq:'monthly'},
      {k:'gym',cat:'Fitness',freq:'monthly'},{k:'electricity',cat:'Utilities',freq:'monthly'},
      {k:'internet',cat:'Utilities',freq:'monthly'},{k:'insurance',cat:'Insurance',freq:'monthly'},
      {k:'rent',cat:'Housing',freq:'monthly'},{k:'mortgage',cat:'Housing',freq:'monthly'},
    ];
    return subs.find(s => n.includes(s.k)) || null;
  },
  forInvestment(ticker) {
    return SMART_DB.investments.find(i => i.ticker === (ticker || '').toUpperCase()) || null;
  }
};

// ===================== MORE SHEET =====================
function openMore() {
  document.getElementById('moreOverlay')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'moreOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:500;background:var(--bg);overflow-y:auto;padding:env(safe-area-inset-top,0) 0 calc(env(safe-area-inset-bottom,0) + 100px)';
  const allMore = [
    {id:'alerts',     ic:'🔔', n:'Alerts'},
    {id:'reminders',  ic:'⏰', n:'Reminders'},
    {id:'timeline',   ic:'📅', n:'Timeline'},
    {id:'search',     ic:'🔍', n:'Search'},
    {id:'expenses',   ic:'📋', n:'Expenses'},
    {id:'trash',      ic:'🗑️', n:'Trash'},
    {id:'ai-import',  ic:'🤖', n:'AI Import'},
    {id:'backup',     ic:'💾', n:'Backup'},
    {id:'security',   ic:'🛡️', n:'Security'},
    {id:'settings',   ic:'⚙️', n:'Settings'},
  ];
  overlay.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:calc(env(safe-area-inset-top,0) + 20px) 16px 12px;position:sticky;top:0;background:var(--bg);z-index:1;border-bottom:1px solid var(--border)">' +
    '<div style="font-size:16px;font-weight:800;color:var(--text)">More</div>' +
    '<button onclick="document.getElementById(\'moreOverlay\')?.remove()" style="background:none;border:none;color:var(--text3);font-size:26px;cursor:pointer;touch-action:manipulation;line-height:1">×</button>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 16px">' +
    allMore.map(m =>
      `<div onclick="document.getElementById('moreOverlay')?.remove();R.goto('${m.id}')" style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:16px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:12px"><div style="font-size:24px">${m.ic}</div><div style="font-size:14px;font-weight:600;color:var(--text)">${m.n}</div></div>`
    ).join('') +
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
    `<div class="tab-pill${cur === id ? ' on' : ''}" onclick="SettingsNav.show('${id}')">${label}</div>`
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
  const allModules = [
    {id:'banks',icon:'🏦',label:'Banks',desc:(S.banks||[]).length+' accounts'},
    {id:'cards',icon:'💳',label:'Cards',desc:(S.cards||[]).length+' cards'},
    {id:'cash',icon:'💵',label:'Cash',desc:(S.cash||[]).length+' entries'},
    {id:'investments',icon:'📈',label:'Investments',desc:(S.investments||[]).length+' positions'},
    {id:'loans',icon:'🤝',label:'Loans',desc:(S.loans||[]).length+' loans'},
    {id:'credit',icon:'📊',label:'Credit Score',desc:'Track scores'},
    {id:'zakat',icon:'🌙',label:'Zakat',desc:'Calculate'},
    {id:'tax',icon:'🧾',label:'Tax',desc:'UK · PK · UAE'},
    {id:'currency',icon:'💱',label:'Currency',desc:'Net worth'},
    {id:'gold',icon:'🥇',label:'Metals',desc:'Gold & silver'},
    {id:'expenses',icon:'💸',label:'Expenses',desc:(S.expenses||[]).length+' entries'},
  ];
  const hidden = getTabPrefs().hiddenFinance || [];
  const modules = allModules.filter(m => !hidden.includes(m.id));
  b.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:16px">' +
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
  const modules = [
    {id:'vehicles',icon:'🚗',label:'Vehicles',desc:(S.vehicles||[]).length+' vehicles'},
    {id:'assets',icon:'🏠',label:'Property & Assets',desc:(S.assets||[]).length+' items'},
    {id:'gold',icon:'🥇',label:'Precious Metals',desc:'Gold & silver'},
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
  const all = [{ id:'dashboard', n:'Dashboard', ic:'📊' }, ...active, ...extras];

  const groups = {
    Finance:  '💰 Finance',
    Assets:   '🏠 Assets & Property',
    Identity: '🪪 Vault & Identity',
    Tools:    '⚙️ Tools',
  };
  const grouped = {};
  active.forEach(m => { if (!grouped[m.group]) grouped[m.group] = []; grouped[m.group].push(m); });

  let sbHTML = `<div class="ni${S.currentPage === 'dashboard' ? ' on' : ''}" data-pg="dashboard" onclick="R.goto('dashboard')"><span class="ni-ic">📊</span>Dashboard</div>`;
  Object.entries(groups).forEach(([grp, label]) => {
    if (!grouped[grp] || !grouped[grp].length) return;
    sbHTML += `<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text3);padding:12px 14px 4px">${label}</div>`;
    sbHTML += grouped[grp].filter(m => !!document.getElementById('pg-' + m.id)).map(m =>
      `<div class="ni${S.currentPage === m.id ? ' on' : ''}" data-pg="${m.id}" onclick="R.goto('${m.id}')"><span class="ni-ic">${m.ic}</span>${m.n}</div>`
    ).join('');
  });
  if (document.getElementById('pg-family')) {
    sbHTML += `<div class="ni${S.currentPage === 'family' ? ' on' : ''}" data-pg="family" onclick="R.goto('family')"><span class="ni-ic">👨‍👩‍👧‍👦</span>Family</div>`;
  }
  sbHTML += `<div style="height:1px;background:var(--border);margin:8px 14px"></div>`;
  const activeModIds = new Set(active.map(m => m.id));
  sbHTML += extras.filter(m => !activeModIds.has(m.id)).map(m =>
    `<div class="ni${S.currentPage === m.id ? ' on' : ''}" data-pg="${m.id}" onclick="R.goto('${m.id}')"><span class="ni-ic">${m.ic}</span>${m.n}</div>`
  ).join('');
  document.getElementById('sbNav').innerHTML = sbHTML;

  const nameEl = document.getElementById('sbUser');
  if (nameEl) nameEl.textContent = (S.user.name || 'User') + ' · v' + VER;

  const PRIMARY_TABS = [
    { id: 'dashboard',    n: 'Home',    ic: '📊' },
    { id: 'finance-home', n: 'Finance', ic: '💰' },
    { id: 'vault-home',   n: 'Vault',   ic: '🪪' },
    { id: 'assets-home',  n: 'Assets',  ic: '🏠' },
    { id: 'family',       n: 'Family',  ic: '👨‍👩‍👧‍👦' },
  ];

  document.getElementById('btabs').innerHTML = PRIMARY_TABS.map(m =>
    `<div class="ti${S.currentPage === m.id ? ' on' : ''}" data-pg="${m.id}" onclick="R.goto('${m.id}')"><div class="ti-ic">${m.ic}</div><span>${m.n}</span></div>`
  ).join('');

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
    '<div class="fmi" onclick="AIImport.openImportModal();FAB.close()">🤖 AI Import</div>',
    '<div class="fmi" onclick="CMD.open();FAB.close()">⌘ Search Everything</div>',
    '<div class="fmi" onclick="R.goto(\'alerts\');FAB.close()">🔔 Alerts</div>',
    '<div class="fmi" onclick="R.goto(\'timeline\');FAB.close()">📅 Timeline</div>',
    '<div class="fmi" onclick="R.goto(\'settings\');FAB.close()">⚙️ Settings</div>',
    '<div class="fmi" onclick="R.lock();FAB.close()">🔒 Lock Vault</div>'
  ];
  document.getElementById('fabMenu').innerHTML = fabItems.join('');
}

// ===================== SMART ADD (Quick Add — no API key required) =====================
const SmartAdd = {
  open() {
    Modal.open('✨ Quick Add', `
      <p style="font-size:12px;color:var(--text2);margin-bottom:14px;line-height:1.6">Describe what you want to add in plain English. The engine will detect and pre-fill the form — no API key needed.</p>
      <div class="fg">
        <label class="fl">What do you want to add?</label>
        <textarea class="inp" id="sa-text" rows="4" placeholder="I have 50000 rupees in HBL savings&#10;Lent 5000 to Ahmed&#10;My Jazz SIM is 0300-1234567&#10;Netflix 1499 per month" style="font-size:13px;line-height:1.6"></textarea>
      </div>
      <div style="font-size:11px;color:var(--text3);margin-top:8px;line-height:1.5">Examples: "I have 50,000 PKR in HBL savings" · "Lent 5000 to Ahmed" · "Netflix 1499/month"</div>
    `, `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" id="sa-run-btn" onclick="SmartAdd.run()">✨ Detect &amp; Pre-fill</button>`);
    setTimeout(() => document.getElementById('sa-text')?.focus(), 120);
  },

  run() {
    const text = (document.getElementById('sa-text')?.value || '').trim();
    if (!text) { Toast.show('Describe what to add', 'warning'); return; }
    const items = (typeof AIImport !== 'undefined') ? AIImport.parse(text) : [];
    if (!items.length) { Toast.show('Could not detect entry type — try more detail (e.g. mention bank name, amount, currency)', 'warning'); return; }
    const best = items[0];
    Modal.close();
    if (navigator.vibrate) navigator.vibrate(30);
    this._openForm({ module: best.type, fields: best.fields });
  },

  _openForm(parsed) {
    if (!parsed || !parsed.module) { Toast.show('Smart Add: could not detect module type', 'warning'); return; }
    const f = parsed.fields || {};
    const delay = 220;
    switch (parsed.module) {
      case 'bank':
        typeof Banks !== 'undefined' && Banks.openAdd && Banks.openAdd();
        setTimeout(() => { this._fill({ 'bf-name':f.bankName, 'bf-bal':f.balance, 'bf-iban':f.iban }); Toast.show('Smart Add: bank pre-filled — review and save', 'success', 3000); }, delay); break;
      case 'card':
        typeof Cards !== 'undefined' && Cards.openAdd && Cards.openAdd();
        setTimeout(() => { this._fill({ 'cf-name':f.cardName, 'cf-l4':f.last4, 'cf-exp':f.expiry }); Toast.show('Smart Add: card pre-filled — review and save', 'success', 3000); }, delay); break;
      case 'loan':
        typeof Loans !== 'undefined' && Loans.openAdd && Loans.openAdd(f.type || 'lent');
        setTimeout(() => { this._fill({ 'lf-person':f.person || f.personName, 'lf-amt':f.amount, 'lf-due':f.dueDate }); Toast.show('Smart Add: loan pre-filled — review and save', 'success', 3000); }, delay); break;
      case 'sim':
        typeof Sims !== 'undefined' && Sims.openAdd && Sims.openAdd();
        setTimeout(() => { this._fill({ 'sf-net':f.network, 'sf-phone':f.phone }); Toast.show('Smart Add: SIM pre-filled — review and save', 'success', 3000); }, delay); break;
      case 'cash':
        typeof Cash !== 'undefined' && Cash.openAdd && Cash.openAdd();
        setTimeout(() => { this._fill({ 'cash-label':f.label, 'cash-amount':f.amount }); Toast.show('Smart Add: cash pre-filled — review and save', 'success', 3000); }, delay); break;
      case 'investment':
        typeof Inv !== 'undefined' && Inv.openAdd && Inv.openAdd();
        setTimeout(() => { this._fill({ 'inv-name':f.investmentName, 'inv-broker':f.broker, 'inv-amt':f.amountInvested }); Toast.show('Smart Add: investment pre-filled — review and save', 'success', 3000); }, delay); break;
      case 'expense':
        typeof Exp !== 'undefined' && Exp.openAdd && Exp.openAdd();
        setTimeout(() => { this._fill({ 'exp-name':f.name, 'exp-amt':f.amount }); Toast.show('Smart Add: expense pre-filled — review and save', 'success', 3000); }, delay); break;
      default:
        Toast.show(`Smart Add detected "${parsed.module}" — open the form manually`, 'info', 4000);
    }
  },

  _fill(map) {
    Object.entries(map).forEach(([id, val]) => {
      if (!val && val !== 0) return;
      const el = document.getElementById(id);
      if (el) { el.value = String(val); el.dispatchEvent(new Event('input')); }
    });
  }
};

// ===================== COMMAND PALETTE =====================
let cmdRes = [], cmdIdx = -1;
const CMD = {
  open() {
    document.getElementById('cmdPal').classList.add('on');
    document.getElementById('cmdIn').value = '';
    this.search('');
    setTimeout(() => document.getElementById('cmdIn').focus(), 80);
  },
  close() { document.getElementById('cmdPal').classList.remove('on'); cmdIdx = -1; },
  fuzzyMatch(str, q) {
    if (!str || !q) return false;
    const s = str.toLowerCase().trim();
    const ql = q.toLowerCase().trim();
    if (s.includes(ql)) return true;
    if (ql.length < 2) return false;
    const maxDist = ql.length <= 2 ? 0 : ql.length <= 5 ? 1 : 2;
    return this._levenshtein(s, ql) <= maxDist || this._substringLevenshtein(s, ql, maxDist);
  },
  _levenshtein(a, b) {
    if (Math.abs(a.length - b.length) > 3) return 99;
    const m = a.length, n = b.length;
    const dp = Array.from({length: m+1}, (_, i) => Array.from({length: n+1}, (_, j) => i === 0 ? j : j === 0 ? i : 0));
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
      }
    }
    return dp[m][n];
  },
  _substringLevenshtein(str, query, maxDist) {
    if (str.length < query.length) return false;
    for (let i = 0; i <= str.length - query.length; i++) {
      const sub = str.slice(i, i + query.length);
      if (this._levenshtein(sub, query) <= maxDist) return true;
    }
    return false;
  },
  recentActions: [],
  addRecent(action) { this.recentActions = [action, ...this.recentActions.filter(a => a.label !== action.label)].slice(0, 8); },
  _allCmds: [
    {icon:'✨',label:'Smart Add (AI)',action:()=>SmartAdd.open()},
    {icon:'🏦',label:'Add Bank',action:()=>Banks.openAdd()},
    {icon:'💳',label:'Add Card',action:()=>Cards.openAdd()},
    {icon:'📈',label:'Add Investment',action:()=>Inv.openAdd()},
    {icon:'💵',label:'Add Cash',action:()=>Cash.openAdd()},
    {icon:'🤝',label:'Add Loan',action:()=>Loans.openAdd()},
    {icon:'📱',label:'Add SIM',action:()=>Sims.openAdd()},
    {icon:'🏠',label:'Add Asset',action:()=>Assets.openAdd()},
    {icon:'📋',label:'Add Expense',action:()=>Exp.openAdd()},
    {icon:'📧',label:'Add Email',action:()=>Emails.openAdd()},
    {icon:'💻',label:'Add Device',action:()=>Gadgets.openAdd()},
    {icon:'💼',label:'Add Login',action:()=>Digital.openAdd()},
    {icon:'🪪',label:'Add Document',action:()=>DocsModule.openAdd()},
    {icon:'📊',label:'Dashboard',action:()=>R.goto('dashboard')},
    {icon:'⚙️',label:'Settings',action:()=>R.goto('settings')},
    {icon:'🔒',label:'Lock Vault',action:()=>R.lock()},
    {icon:'🚨',label:'Panic Lock',action:()=>PanicLock.trigger()},
    {icon:'🎨',label:'Theme Dark',action:()=>ThemeEngine.apply('dark')},
    {icon:'🎨',label:'Theme Light',action:()=>ThemeEngine.apply('light')},
    {icon:'🎨',label:'Theme Ocean',action:()=>ThemeEngine.apply('ocean')},
    {icon:'🎨',label:'Theme Forest',action:()=>ThemeEngine.apply('forest')},
    {icon:'🎨',label:'Change Theme',action:()=>ThemeEngine.openPicker()},
    {icon:'📤',label:'Export Vault',action:()=>ExIm.export('vault')},
    {icon:'📸',label:'Net Worth Snapshot',action:()=>Dash.snap()},
    {icon:'🙈',label:'Privacy Mode',action:()=>togglePrivacy()},
    {icon:'🗑️',label:'Trash',action:()=>R.goto('trash')},
    {icon:'💾',label:'Backup',action:()=>R.goto('backup')},
    {icon:'🔔',label:'Reminders',action:()=>R.goto('reminders')},
    {icon:'🛡️',label:'Security',action:()=>R.goto('security')},
    {icon:'📅',label:'Timeline',action:()=>R.goto('timeline')},
    {icon:'📥',label:'Import',action:()=>R.goto('import')},
  ],
  search(q) {
    const ql = q.toLowerCase(); cmdRes = [];
    if (!q) {
      if (this.recentActions.length) {
        this.recentActions.forEach(a => cmdRes.push({ ...a, cat:'Recent' }));
      } else {
        [
          {icon:'⌘', label:'⌘K — command palette', cat:'Shortcuts', action:null},
          {icon:'⌘', label:'⌘L — lock vault', cat:'Shortcuts', action:()=>R.lock()},
          {icon:'⌘', label:'⌘F — search', cat:'Shortcuts', action:()=>R.goto('search')},
          {icon:'⎋', label:'Escape — close palette', cat:'Shortcuts', action:null},
          {icon:'💬', label:'Try: "add bank" · "lock" · "theme dark" · "reminders"', cat:'Shortcuts', action:null},
        ].forEach(a => cmdRes.push(a));
      }
      [
        { cat:'Navigate', items:[['📊','Dashboard',()=>R.goto('dashboard')],['🔔','Reminders',()=>R.goto('reminders')],['📅','Timeline',()=>R.goto('timeline')],['🛡️','Security',()=>R.goto('security')],['💾','Backup',()=>R.goto('backup')],['⚙️','Settings',()=>R.goto('settings')],['📥','Import',()=>R.goto('import')]] },
        { cat:'Add Entry', items:[['🏦','Add Bank',()=>Banks.openAdd()],['💳','Add Card',()=>Cards.openAdd()],['📈','Add Investment',()=>Inv.openAdd()],['📱','Add SIM',()=>Sims.openAdd()],['🏠','Add Asset',()=>Assets.openAdd()],['📋','Add Expense',()=>Exp.openAdd()],['📧','Add Email',()=>Emails.openAdd()],['💻','Add Device',()=>Gadgets.openAdd()],['💼','Add Login',()=>Digital.openAdd()]] },
        { cat:'Vault Actions', items:[['🎨','Change Theme',()=>ThemeEngine.openPicker()],['📤','Export Encrypted Vault',()=>ExIm.export('vault')],['📸','Net Worth Snapshot',()=>Dash.snap()],['👝','Edit Wallet',()=>Dash.editWallet()],['🙈','Toggle Privacy Mode',()=>togglePrivacy()],['🔒','Lock Vault',()=>R.lock()],['🚨','Panic Lock',()=>PanicLock.trigger()]] },
      ].forEach(({ cat, items }) => items.forEach(([i, l, a]) => cmdRes.push({ icon:i, label:l, action:a, cat })));
    } else {
      const fm = this.fuzzyMatch.bind(this);
      const score = (name, q) => {
        const nl = (name||'').toLowerCase();
        if (nl === q) return 10;
        if (nl.startsWith(q)) return 7;
        if (nl.includes(q)) return 3;
        return 1;
      };
      const weighted = [];
      this._allCmds.filter(c => fm(c.label, ql)).slice(0, 5).forEach(c => weighted.push({...c, cat:'Actions', _score:score(c.label,ql)+5}));
      (S.banks||[]).filter(b => fm(b.bankName || '', ql) || fm(b.notes || '', ql) || (b.tags||[]).some(t=>fm(t,ql))).forEach(b => {
        const s = score(b.bankName,ql) + (fm(b.notes||'',ql)?1:0); weighted.push({ icon:'🏦', label:escHtml(b.bankName), subtitle:escHtml(b.currency+(b.last4?' · ****'+b.last4:'')), badge:'Bank', cat:'Banks', action:()=>Banks.detail(b.id), _score:s });
      });
      (S.cards||[]).filter(cv => fm(cv.cardName || '', ql) || fm(cv.last4 || '', ql) || (cv.tags||[]).some(t=>fm(t,ql))).forEach(cv => {
        const linkedBank = cv.linkedBankId ? (S.banks||[]).find(b=>b.id===cv.linkedBankId)?.bankName : cv.linkedBank;
        const s = score(cv.cardName,ql) + (fm(cv.last4||'',ql)?2:0); weighted.push({ icon:'💳', label:escHtml(cv.cardName+(cv.last4?' ****'+cv.last4:'')), subtitle:escHtml(linkedBank?'Linked to: '+linkedBank:(cv.network||'')), badge:'Card', cat:'Cards', action:()=>Cards.openDetail(cv.id), _score:s });
      });
      (S.investments||[]).filter(i => fm(i.investmentName || '', ql) || fm(i.broker || '', ql)).forEach(i => weighted.push({ icon:'📈', label:i.investmentName||i.broker, subtitle:i.broker||'', badge:'Investment', cat:'Investments', action:()=>Inv.edit(i.id), _score:score(i.investmentName||i.broker,ql) }));
      (S.loans||[]).filter(l => fm(l.person||'',ql) || fm(l.description||'',ql)).forEach(l => weighted.push({ icon:'🤝', label:l.person||'Loan', subtitle:(l.type==='lent'?'Lent':'Borrowed')+' · '+(l.currency||'')+(l.amount?' '+l.amount:''), badge:'Loan', cat:'Loans', action:()=>Loans.openAdd(), _score:score(l.person||'',ql) }));
      (S.documents||[]).filter(d => fm(d.title||d.type||'',ql) || fm(d.docNumber||'',ql)).forEach(d => weighted.push({ icon:'🪪', label:d.title||d.type||'Document', subtitle:d.docNumber?'#'+d.docNumber:'', badge:'Doc', cat:'Documents', action:()=>DocsModule.render(), _score:score(d.title||d.type||'',ql) }));
      (S.emails||[]).filter(e => fm(e.email, ql) || fm(e.provider || '', ql)).slice(0, 3).forEach(e => weighted.push({ icon:'📧', label:e.email, subtitle:e.provider||'', badge:'Email', cat:'Emails', action:()=>Emails.detail(e.id), _score:score(e.email,ql) }));
      (S.gadgets||[]).filter(g => fm(g.name, ql) || fm(g.brand || '', ql) || fm(g.serialNum || '', ql)).slice(0, 3).forEach(g => weighted.push({ icon:g.ic || '💻', label:g.name+(g.storage?' · '+g.storage:''), subtitle:g.brand||'', badge:'Device', cat:'Devices', action:()=>Gadgets.detail(g.id), _score:score(g.name,ql) }));
      (S.digital||[]).filter(d => fm(d.serviceName, ql) || fm(d.username || '', ql)).slice(0, 3).forEach(d => weighted.push({ icon:'💼', label:d.serviceName+(d.username?' · @'+d.username:''), subtitle:'', badge:'Login', cat:'Logins', action:()=>Digital.detail(d.id), _score:score(d.serviceName,ql) }));
      (S.expenses||[]).filter(e => fm(e.name, ql)).slice(0, 3).forEach(e => weighted.push({ icon:e.icon || '📋', label:e.name, subtitle:e.currency+' '+e.amount+'/mo', badge:'Expense', cat:'Expenses', action:()=>Exp.edit(e.id), _score:score(e.name,ql) }));
      (S.assets||[]).filter(a => fm(a.name, ql) || fm(a.assetType || '', ql)).slice(0, 3).forEach(a => weighted.push({ icon:'🏠', label:a.name, subtitle:a.assetType||'', badge:'Asset', cat:'Assets', action:()=>Assets.edit(a.id), _score:score(a.name,ql) }));
      (S.sims||[]).filter(s => fm(s.network, ql) || fm(s.phone || '', ql)).slice(0, 3).forEach(s => weighted.push({ icon:'📱', label:s.network+' '+U.flag(s.country), subtitle:s.phone||'', badge:'SIM', cat:'SIMs', action:()=>Sims.detail(s.id), _score:score(s.network,ql) }));
      (S.cash||[]).filter(c => fm(c.currency||'',ql) || fm(c.note||'',ql)).slice(0,3).forEach(c => weighted.push({ icon:'💵', label:c.currency+(c.amount?' · '+c.amount:''), subtitle:c.note||'', badge:'Cash', cat:'Cash', action:()=>Cash.openAdd(), _score:score(c.currency||'',ql) }));
      (S.friends||[]).filter(f => fm(f.name||'',ql) || fm(f.phone||'',ql)).slice(0,3).forEach(f => weighted.push({ icon:'👤', label:f.name, subtitle:f.phone||'', badge:'Contact', cat:'Contacts', action:()=>Friends.render(), _score:score(f.name||'',ql) }));
      weighted.sort((a,b) => (b._score||0)-(a._score||0));
      weighted.forEach(r => cmdRes.push(r));
      if (!cmdRes.length) cmdRes.push({ icon:'🔍', label:`No results for "${q}"`, cat:'', action:null });
    }
    cmdIdx = -1;
    const hl = (text, q) => {
      if (!q) return text;
      const idx = text.toLowerCase().indexOf(q.toLowerCase());
      if (idx < 0) return text;
      return text.slice(0, idx) + `<mark style="background:rgba(10,132,255,.25);color:var(--accent);border-radius:2px;padding:0 1px">${text.slice(idx, idx + q.length)}</mark>` + text.slice(idx + q.length);
    };
    let html = '', lastCat = null;
    cmdRes.forEach((r, i) => {
      if (r.cat !== lastCat) {
        if (r.cat) html += `<div class="ci-cat">${r.cat}</div>`;
        lastCat = r.cat;
      }
      const labelHtml = q ? hl(r.label, q) : r.label;
      if (!r.action) {
        html += `<div class="ci ci-info" id="ci${i}"><span class="ci-ic">${r.icon}</span><span>${labelHtml}</span></div>`;
      } else {
        const badgeHtml = r.badge ? `<span style="font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px;background:rgba(123,95,255,.15);color:rgba(150,120,255,1);border:1px solid rgba(123,95,255,.2);margin-left:auto;flex-shrink:0">${r.badge}</span>` : '';
        const subHtml = r.subtitle ? `<div style="font-size:10px;color:var(--text3);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.subtitle}</div>` : '';
        html += `<div class="ci" id="ci${i}" onclick="CMD.select(${i})" style="align-items:flex-start"><span class="ci-ic" style="margin-top:2px">${r.icon}</span><div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:6px">${labelHtml}${badgeHtml}</div>${subHtml}</div></div>`;
      }
    });
    document.getElementById('cmdList').innerHTML = html;
  },
  select(i) { const r = cmdRes[i]; if (r?.action) { this.addRecent(r); this.close(); r.action(); } },
  key(e) {
    const items = document.querySelectorAll('.ci');
    if (e.key === 'ArrowDown') cmdIdx = Math.min(cmdIdx + 1, items.length - 1);
    else if (e.key === 'ArrowUp') cmdIdx = Math.max(cmdIdx - 1, 0);
    else if (e.key === 'Enter') { this.select(cmdIdx >= 0 ? cmdIdx : 0); return; }
    else if (e.key === 'Escape') { this.close(); return; }
    items.forEach((el, i) => el.classList.toggle('hi', i === cmdIdx));
    if (cmdIdx >= 0) items[cmdIdx]?.scrollIntoView({ block:'nearest' });
  }
};

// ===================== FAB =====================
const FAB = {
  toggle() {
    const m = document.getElementById('fabMenu'), btn = document.getElementById('fab');
    const o = m.classList.toggle('on'); btn.classList.toggle('open', o); btn.textContent = o ? '✕' : '＋';
  },
  close() {
    const m = document.getElementById('fabMenu'), btn = document.getElementById('fab');
    m.classList.remove('on'); btn.classList.remove('open'); btn.textContent = '＋';
  }
};

// ===================== PANIC LOCK =====================
const PanicLock = {
  trigger() {
    if (!window.__vos_confirm('⚠️ PANIC LOCK: This will immediately lock the vault and clear the screen. Continue?')) return;
    document.querySelectorAll('.sens').forEach(el => el.textContent = '••••');
    R.lock();
    Toast.show('Vault panic-locked', 'warning', 2000);
    Activity.log('Panic lock triggered');
  }
};

(function() {
  const btn = document.createElement('button');
  btn.className = 'panic-btn'; btn.title = 'Panic Lock';
  btn.innerHTML = '🚨'; btn.onclick = () => PanicLock.trigger();
  btn.id = 'panicBtn'; document.body.appendChild(btn);
})();

// ===================== DECOY MODE =====================
function loadDecoyData() {
  S.banks=[]; S.cards=[]; S.investments=[]; S.cash=[]; S.loans=[]; S.friends=[]; S.sims=[]; S.assets=[];
  S.expenses=[]; S.emails=[]; S.gadgets=[]; S.digital=[]; S.activity=[]; S.wallet=[]; S.vehicles=[];
  const id = U.id, ts = () => new Date().toISOString();
  const names = ['Ali Hassan','Sara Ahmed','Omar Khan','Fatima Malik'];
  const dName = names[Math.floor(Math.random() * names.length)];
  const dFirst = dName.split(' ')[0];
  const rl4 = () => String(1000 + Math.floor(Math.random() * 8999));
  // 2 random PK commercial banks
  const pkBanks = BANKS_DB.filter(b => b.c === 'PK' && (b.t === 'commercial' || b.t === 'islamic'));
  const shuffled = [...pkBanks].sort(() => Math.random() - 0.5);
  const selBanks = shuffled.slice(0, 2);
  selBanks.forEach((b, i) => {
    S.banks.push({ id:id(), bankName:b.n, country:'PK', bankType:b.t, accountType:i===0?'Current':'Savings', currency:'PKR', last4:rl4(), holderName:dName, tags:[i===0?'Primary':'Secondary'], favorite:i===0, createdAt:ts() });
  });
  // 1 random debit card
  const selCard = CARDS_DB.filter(c => c.cat === 'Debit')[Math.floor(Math.random() * CARDS_DB.filter(c => c.cat === 'Debit').length)];
  const expYr = (new Date().getFullYear() - 2000 + 3);
  const expMo = String(Math.floor(Math.random() * 12) + 1).padStart(2,'0');
  S.cards.push({ id:id(), cardName:selCard.n, network:selCard.net, cardType:'Debit', category:'Standard', country:'PK', last4:rl4(), expiry:`${expMo}/${expYr}`, holderName:dName.toUpperCase(), issuer:selCard.n.split(' ')[0], tags:['Primary'], createdAt:ts() });
  // Jazz SIM
  S.sims.push({ id:id(), network:'Jazz', country:'PK', simType:'Physical', status:'Active', phone:`+92 300 ${Math.floor(1000000 + Math.random() * 8999999)}`, dataPlan:10, createdAt:ts() });
  // Small cash amount
  const cashAmt = Math.floor(2000 + Math.random() * 13000);
  S.cash.push({ id:id(), label:'Wallet', amount:cashAmt, currency:'PKR', location:'Wallet', createdAt:ts() });
  // 1 PSX stock
  const stocks = [
    {name:'Engro Corporation',ticker:'ENGRO',inv:150000,cur:163500},
    {name:'Lucky Cement',ticker:'LUCK',inv:90000,cur:97200},
    {name:'HBL',ticker:'HBL',inv:120000,cur:128400},
    {name:'MCB Bank',ticker:'MCB',inv:80000,cur:86400},
    {name:'Pakistan Petroleum',ticker:'PPL',inv:60000,cur:64800},
  ];
  const st = stocks[Math.floor(Math.random() * stocks.length)];
  S.investments.push({ id:id(), investmentName:st.name, broker:'Arif Habib Limited', type:'Stocks', ticker:st.ticker, country:'PK', currency:'PKR', amountInvested:st.inv, currentValue:st.cur, riskLevel:'Medium', ownership:'personal', tags:['PSX'], createdAt:ts() });
  S.user.name = dName;
  S.user.netWorth = cashAmt + st.cur;
  S.user.currency = 'PKR';
  Activity.log('Vault unlocked');
  Store.save();
  R.goto('dashboard');
}

// ===================== DEMO PROFILES =====================
function loadDemoProfile(type) {
  const id = U.id, ts = new Date().toISOString();
  // Reset all arrays
  ['banks','cards','investments','cash','loans','friends','sims','assets','expenses','emails','gadgets','digital','vehicles','documents'].forEach(k => { if (!S[k]) S[k]=[]; });

  if (type === 'business') {
    S.user.name = 'Ahmed Karimi'; S.user.currency = 'PKR';
    S.banks.push({id:id(),bankName:'HBL',country:'PK',bankType:'commercial',accountType:'Current',currency:'PKR',last4:'4821',balance:450000,holderName:'Ahmed Karimi',tags:['Primary','Business'],createdAt:ts});
    S.banks.push({id:id(),bankName:'Meezan Bank',country:'PK',bankType:'islamic',accountType:'Savings',currency:'PKR',last4:'3310',balance:850000,holderName:'Ahmed Karimi',tags:['Savings','Islamic'],createdAt:ts});
    S.banks.push({id:id(),bankName:'Bank Alfalah',country:'PK',bankType:'commercial',accountType:'Business',currency:'PKR',last4:'7734',balance:1200000,holderName:'Ahmed Karimi',tags:['Business'],createdAt:ts});
    S.cards.push({id:id(),cardName:'HBL Premier World Elite',network:'Mastercard',cardType:'Credit',category:'Premium',country:'PK',last4:'4821',expiry:'09/27',holderName:'AHMED KARIMI',createdAt:ts});
    S.cards.push({id:id(),cardName:'Meezan Visa Debit',network:'Visa',cardType:'Debit',category:'Islamic',country:'PK',last4:'3310',expiry:'11/26',holderName:'AHMED KARIMI',createdAt:ts});
    S.investments.push({id:id(),investmentName:'Engro Corporation',broker:'Arif Habib Limited',type:'Stocks',ticker:'ENGRO',country:'PK',currency:'PKR',amountInvested:500000,currentValue:567000,riskLevel:'Medium',createdAt:ts});
    S.investments.push({id:id(),investmentName:'Al Meezan Islamic Fund',broker:'Al Meezan Investments',type:'Mutual Funds',country:'PK',currency:'PKR',amountInvested:300000,currentValue:328500,riskLevel:'Low',createdAt:ts});
    S.cash.push({id:id(),location:'Wallet',amount:15000,currency:'PKR',createdAt:ts});
    S.cash.push({id:id(),location:'Office',amount:50000,currency:'PKR',createdAt:ts});
    S.sims.push({id:id(),network:'Jazz',country:'PK',simType:'Physical',status:'Active',phone:'+92 300 9876543',createdAt:ts});
    S.sims.push({id:id(),network:'Zong',country:'PK',simType:'Physical',status:'Active',phone:'+92 311 2345678',createdAt:ts});
    S.loans.push({id:id(),person:'Bilal Sheikh',type:'lent',amount:75000,currency:'PKR',status:'Active',date:'2024-01-15',createdAt:ts});
    S.friends.push({id:id(),name:'Bilal Sheikh',createdAt:ts});
    S.vehicles.push({id:id(),make:'Toyota',model:'Corolla',year:'2021',regPlate:'LHR-1234',fuel:'Petrol',createdAt:ts});
    S.gadgets.push({id:id(),name:'iPhone 15 Pro',brand:'Apple',category:'Phone',serialNum:'F2K3L8M9P2',purchasePrice:350000,currency:'PKR',warranty:'2025-10',createdAt:ts});
    S.gadgets.push({id:id(),name:'MacBook Pro 14" M3',brand:'Apple',category:'Laptop',purchasePrice:580000,currency:'PKR',warranty:'2026-03',createdAt:ts});
    S.expenses.push({id:id(),name:'Netflix',amount:1200,currency:'PKR',category:'Streaming',active:true,createdAt:ts});
    S.expenses.push({id:id(),name:'ChatGPT Plus',amount:7000,currency:'PKR',category:'AI',active:true,createdAt:ts});
    S.expenses.push({id:id(),name:'iCloud+ 2TB',amount:1600,currency:'PKR',category:'Cloud',active:true,createdAt:ts});
    S.emails.push({id:id(),email:'ahmed.karimi@gmail.com',provider:'Gmail',purpose:'Personal',mfaEnabled:true,createdAt:ts});
    S.emails.push({id:id(),email:'ahmed@karimiconsulting.pk',provider:'Custom Domain',purpose:'Business',mfaEnabled:true,createdAt:ts});

  } else if (type === 'student') {
    S.user.name = 'Zara Khan'; S.user.currency = 'GBP';
    S.banks.push({id:id(),bankName:'Monzo',country:'GB',bankType:'digital',accountType:'Current',currency:'GBP',last4:'7821',balance:2340,holderName:'Zara Khan',tags:['Primary'],createdAt:ts});
    S.banks.push({id:id(),bankName:'Barclays',country:'GB',bankType:'commercial',accountType:'Student',currency:'GBP',last4:'4456',balance:500,holderName:'Zara Khan',tags:['Backup'],createdAt:ts});
    S.cards.push({id:id(),cardName:'Monzo Visa',network:'Visa',cardType:'Debit',category:'Digital',country:'GB',last4:'7821',expiry:'08/28',holderName:'ZARA KHAN',createdAt:ts});
    S.cards.push({id:id(),cardName:'Barclaycard Mastercard',network:'Mastercard',cardType:'Credit',category:'Standard',country:'GB',last4:'4456',expiry:'05/27',holderName:'ZARA KHAN',createdAt:ts});
    S.investments.push({id:id(),investmentName:'Vanguard Global Index',broker:'Trading 212',type:'Mutual Funds',country:'GB',currency:'GBP',amountInvested:500,currentValue:542,riskLevel:'Medium',createdAt:ts});
    S.investments.push({id:id(),investmentName:'Bitcoin',ticker:'BTC',broker:'Coinbase',type:'Crypto',currency:'USD',amountInvested:200,currentValue:380,riskLevel:'High',createdAt:ts});
    S.cash.push({id:id(),location:'Wallet',amount:120,currency:'GBP',createdAt:ts});
    S.sims.push({id:id(),network:'giffgaff',country:'GB',simType:'Physical',status:'Active',phone:'+44 7700 234567',createdAt:ts});
    S.loans.push({id:id(),person:'Parents',type:'borrowed',amount:3000,currency:'GBP',status:'Active',date:'2023-09-01',notes:'Tuition support',createdAt:ts});
    S.gadgets.push({id:id(),name:'MacBook Air M2 13"',brand:'Apple',category:'Laptop',purchasePrice:1099,currency:'GBP',warranty:'2026-06',createdAt:ts});
    S.gadgets.push({id:id(),name:'iPhone 15',brand:'Apple',category:'Phone',purchasePrice:799,currency:'GBP',warranty:'2026-09',createdAt:ts});
    S.expenses.push({id:id(),name:'Spotify',amount:11.99,currency:'GBP',category:'Music',active:true,createdAt:ts});
    S.expenses.push({id:id(),name:'Amazon Prime',amount:8.99,currency:'GBP',category:'Streaming',active:true,createdAt:ts});
    S.emails.push({id:id(),email:'zara.khan@gmail.com',provider:'Gmail',purpose:'Personal',mfaEnabled:true,createdAt:ts});
    S.emails.push({id:id(),email:'z.khan@university.ac.uk',provider:'Custom Domain',purpose:'University',mfaEnabled:false,createdAt:ts});
    S.friends.push({id:id(),name:'Aisha Malik',createdAt:ts});
    S.friends.push({id:id(),name:'Omar Hassan',createdAt:ts});

  } else if (type === 'family') {
    S.user.name = 'Tariq Al-Rashidi'; S.user.currency = 'AED';
    S.banks.push({id:id(),bankName:'Emirates NBD',country:'AE',bankType:'commercial',accountType:'Current',currency:'AED',last4:'9912',balance:85000,holderName:'Tariq Al-Rashidi',tags:['Primary'],createdAt:ts});
    S.banks.push({id:id(),bankName:'ADCB',country:'AE',bankType:'commercial',accountType:'Savings',currency:'AED',last4:'3344',balance:220000,holderName:'Tariq Al-Rashidi',tags:['Savings'],createdAt:ts});
    S.banks.push({id:id(),bankName:'HSBC',country:'GB',bankType:'commercial',accountType:'Current',currency:'GBP',last4:'5577',balance:15000,holderName:'Tariq Al-Rashidi',tags:['UK'],createdAt:ts});
    S.cards.push({id:id(),cardName:'Emirates NBD Visa',network:'Visa',cardType:'Credit',category:'Premium',country:'AE',last4:'9912',expiry:'12/27',holderName:'TARIQ AL-RASHIDI',createdAt:ts});
    S.cards.push({id:id(),cardName:'ADCB Visa',network:'Visa',cardType:'Debit',category:'Standard',country:'AE',last4:'3344',expiry:'04/28',holderName:'TARIQ AL-RASHIDI',createdAt:ts});
    S.investments.push({id:id(),investmentName:'Dubai Real Estate Fund',broker:'Sarwa',type:'Mutual Funds',country:'AE',currency:'AED',amountInvested:50000,currentValue:58500,riskLevel:'Medium',createdAt:ts});
    S.investments.push({id:id(),investmentName:'Saudi Aramco',ticker:'2222',broker:'Sarwa',type:'Stocks',country:'AE',currency:'AED',amountInvested:15000,currentValue:17800,riskLevel:'Low',createdAt:ts});
    S.cash.push({id:id(),location:'Wallet',amount:3000,currency:'AED',createdAt:ts});
    S.cash.push({id:id(),location:'Home',amount:10000,currency:'AED',createdAt:ts});
    S.sims.push({id:id(),network:'du',country:'AE',simType:'Physical',status:'Active',phone:'+971 50 234 5678',createdAt:ts});
    S.loans.push({id:id(),person:'Ahmad (Brother)',type:'lent',amount:20000,currency:'AED',status:'Active',date:'2023-06-01',createdAt:ts});
    S.vehicles.push({id:id(),make:'BMW',model:'X5',year:'2022',regPlate:'Dubai B 12345',fuel:'Petrol',createdAt:ts});
    S.assets.push({id:id(),name:'Dubai Apartment',assetType:'property',currentValue:1200000,currency:'AED',purchasePrice:950000,createdAt:ts});
    S.gadgets.push({id:id(),name:'iPhone 16 Pro',brand:'Apple',category:'Phone',purchasePrice:4500,currency:'AED',warranty:'2026-10',createdAt:ts});
    S.expenses.push({id:id(),name:'Netflix',amount:55,currency:'AED',category:'Streaming',active:true,createdAt:ts});
    S.expenses.push({id:id(),name:'iCloud+ 2TB',amount:39,currency:'AED',category:'Cloud',active:true,createdAt:ts});
    S.emails.push({id:id(),email:'tariq.rashidi@gmail.com',provider:'Gmail',purpose:'Personal',mfaEnabled:true,createdAt:ts});
    S.friends.push({id:id(),name:'Ahmad Al-Rashidi',createdAt:ts});
    S.friends.push({id:id(),name:'Fatima Hassan',createdAt:ts});

  } else if (type === 'expat') {
    S.user.name = 'Sana Mirza'; S.user.currency = 'GBP';
    S.banks.push({id:id(),bankName:'Revolut',country:'GB',bankType:'digital',accountType:'Premium',currency:'GBP',last4:'2291',balance:12500,holderName:'Sana Mirza',tags:['Primary','Multi-currency'],createdAt:ts});
    S.banks.push({id:id(),bankName:'Wise',country:'GB',bankType:'digital',accountType:'Multi-currency',currency:'GBP',last4:'8844',balance:8000,holderName:'Sana Mirza',tags:['Transfer'],createdAt:ts});
    S.banks.push({id:id(),bankName:'HBL',country:'PK',bankType:'commercial',accountType:'Current',currency:'PKR',last4:'5512',balance:350000,holderName:'Sana Mirza',tags:['Pakistan'],createdAt:ts});
    S.banks.push({id:id(),bankName:'Emirates NBD',country:'AE',bankType:'commercial',accountType:'Savings',currency:'AED',last4:'7733',balance:45000,holderName:'Sana Mirza',tags:['UAE'],createdAt:ts});
    S.cards.push({id:id(),cardName:'Revolut Visa',network:'Visa',cardType:'Debit',category:'Digital',country:'GB',last4:'2291',expiry:'07/28',holderName:'SANA MIRZA',createdAt:ts});
    S.cards.push({id:id(),cardName:'Wise Mastercard',network:'Mastercard',cardType:'Debit',category:'Digital',country:'GB',last4:'8844',expiry:'03/27',holderName:'SANA MIRZA',createdAt:ts});
    S.cards.push({id:id(),cardName:'Meezan Visa Debit',network:'Visa',cardType:'Debit',category:'Islamic',country:'PK',last4:'5512',expiry:'11/26',holderName:'SANA MIRZA',createdAt:ts});
    S.investments.push({id:id(),investmentName:'Vanguard S&P 500',broker:'Freetrade',type:'Stocks',country:'GB',currency:'GBP',amountInvested:8000,currentValue:9650,riskLevel:'Medium',createdAt:ts});
    S.investments.push({id:id(),investmentName:'Bitcoin',ticker:'BTC',broker:'Coinbase',type:'Crypto',currency:'USD',amountInvested:2000,currentValue:3840,riskLevel:'High',createdAt:ts});
    S.investments.push({id:id(),investmentName:'NBP Income Fund',broker:'NBP Funds',type:'Mutual Funds',country:'PK',currency:'PKR',amountInvested:200000,currentValue:228000,riskLevel:'Low',createdAt:ts});
    S.cash.push({id:id(),location:'Wallet',amount:200,currency:'GBP',createdAt:ts});
    S.cash.push({id:id(),location:'Wallet',amount:5000,currency:'PKR',createdAt:ts});
    S.cash.push({id:id(),location:'Wallet',amount:500,currency:'AED',createdAt:ts});
    S.sims.push({id:id(),network:'EE',country:'GB',simType:'Physical',status:'Active',phone:'+44 7700 123456',createdAt:ts});
    S.sims.push({id:id(),network:'Jazz',country:'PK',simType:'Physical',status:'Active',phone:'+92 300 1234567',createdAt:ts});
    S.gadgets.push({id:id(),name:'iPhone 15 Pro Max',brand:'Apple',category:'Phone',purchasePrice:1199,currency:'GBP',warranty:'2026-10',createdAt:ts});
    S.emails.push({id:id(),email:'sana.mirza@gmail.com',provider:'Gmail',purpose:'Personal',mfaEnabled:true,createdAt:ts});
    S.emails.push({id:id(),email:'sana@protonmail.com',provider:'ProtonMail',purpose:'Private',mfaEnabled:true,createdAt:ts});
    S.expenses.push({id:id(),name:'Revolut Premium',amount:9.99,currency:'GBP',category:'Finance',active:true,createdAt:ts});
    S.expenses.push({id:id(),name:'NordVPN',amount:3.99,currency:'GBP',category:'VPN',active:true,createdAt:ts});
    S.friends.push({id:id(),name:'Rania Shah',createdAt:ts});
    S.friends.push({id:id(),name:'Hassan Malik',createdAt:ts});
    S.friends.push({id:id(),name:'Meera Patel',createdAt:ts});

  } else if (type === 'entrepreneur') {
    S.user.name = 'Omar Qureshi'; S.user.currency = 'GBP';
    S.banks.push({id:id(),bankName:'Barclays',country:'GB',bankType:'commercial',accountType:'Business',currency:'GBP',last4:'3301',balance:45000,holderName:'Omar Qureshi',tags:['Business','UK'],createdAt:ts});
    S.banks.push({id:id(),bankName:'Monzo',country:'GB',bankType:'digital',accountType:'Current',currency:'GBP',last4:'9922',balance:8500,holderName:'Omar Qureshi',tags:['Personal'],createdAt:ts});
    S.banks.push({id:id(),bankName:'MCB Bank',country:'PK',bankType:'commercial',accountType:'Business',currency:'PKR',last4:'7744',balance:2500000,holderName:'Omar Qureshi',tags:['Pakistan','Business'],createdAt:ts});
    S.banks.push({id:id(),bankName:'Meezan Bank',country:'PK',bankType:'islamic',accountType:'Current',currency:'PKR',last4:'1133',balance:900000,holderName:'Omar Qureshi',tags:['Pakistan','Islamic'],createdAt:ts});
    S.cards.push({id:id(),cardName:'Barclaycard Mastercard',network:'Mastercard',cardType:'Credit',category:'Business',country:'GB',last4:'3301',expiry:'06/27',holderName:'OMAR QURESHI',annualFee:195,createdAt:ts});
    S.cards.push({id:id(),cardName:'Amex Gold',network:'American Express',cardType:'Credit',category:'Premium',country:'GB',last4:'8812',expiry:'04/28',holderName:'OMAR QURESHI',annualFee:160,createdAt:ts});
    S.cards.push({id:id(),cardName:'MCB Visa',network:'Visa',cardType:'Credit',category:'Standard',country:'PK',last4:'7744',expiry:'10/26',holderName:'OMAR QURESHI',createdAt:ts});
    S.investments.push({id:id(),investmentName:'HSBC Holdings',ticker:'HSBA',broker:'Hargreaves Lansdown',type:'Stocks',country:'GB',currency:'GBP',amountInvested:12000,currentValue:13800,riskLevel:'Low',createdAt:ts});
    S.investments.push({id:id(),investmentName:'Ethereum',ticker:'ETH',broker:'Binance',type:'Crypto',currency:'USD',amountInvested:5000,currentValue:8200,riskLevel:'High',createdAt:ts});
    S.investments.push({id:id(),investmentName:'Systems Ltd',ticker:'SYS',broker:'Topline Securities',type:'Stocks',country:'PK',currency:'PKR',amountInvested:800000,currentValue:1040000,riskLevel:'Medium',createdAt:ts});
    S.investments.push({id:id(),investmentName:'USDT',ticker:'USDT',broker:'Binance',type:'Crypto',currency:'USD',amountInvested:10000,currentValue:10000,riskLevel:'Low',createdAt:ts});
    S.cash.push({id:id(),location:'Office',amount:5000,currency:'GBP',createdAt:ts});
    S.cash.push({id:id(),location:'Home',amount:100000,currency:'PKR',createdAt:ts});
    S.sims.push({id:id(),network:'O2',country:'GB',simType:'Physical',status:'Active',phone:'+44 7800 567890',createdAt:ts});
    S.sims.push({id:id(),network:'Zong',country:'PK',simType:'Physical',status:'Active',phone:'+92 310 9876543',createdAt:ts});
    S.vehicles.push({id:id(),make:'Tesla',model:'Model 3',year:'2023',regPlate:'BM23 XYZ',fuel:'Electric',createdAt:ts});
    S.gadgets.push({id:id(),name:'MacBook Pro 16" M4 Max',brand:'Apple',category:'Laptop',purchasePrice:3499,currency:'GBP',warranty:'2027-01',createdAt:ts});
    S.gadgets.push({id:id(),name:'iPhone 16 Pro Max',brand:'Apple',category:'Phone',purchasePrice:1199,currency:'GBP',warranty:'2026-10',createdAt:ts});
    S.gadgets.push({id:id(),name:'iPad Pro 13" M4',brand:'Apple',category:'Tablet',purchasePrice:1299,currency:'GBP',warranty:'2026-05',createdAt:ts});
    S.expenses.push({id:id(),name:'Microsoft 365',amount:9.99,currency:'GBP',category:'Productivity',active:true,createdAt:ts});
    S.expenses.push({id:id(),name:'Adobe CC',amount:54.99,currency:'GBP',category:'Design',active:true,createdAt:ts});
    S.expenses.push({id:id(),name:'ChatGPT Plus',amount:20,currency:'GBP',category:'AI',active:true,createdAt:ts});
    S.expenses.push({id:id(),name:'LinkedIn Premium',amount:39.99,currency:'GBP',category:'Business',active:true,createdAt:ts});
    S.emails.push({id:id(),email:'omar@qureshi.co.uk',provider:'Custom Domain',purpose:'Business',mfaEnabled:true,createdAt:ts});
    S.emails.push({id:id(),email:'omar.qureshi@gmail.com',provider:'Gmail',purpose:'Personal',mfaEnabled:true,createdAt:ts});
    S.emails.push({id:id(),email:'omar@protonmail.com',provider:'ProtonMail',purpose:'Private',mfaEnabled:true,createdAt:ts});
    S.friends.push({id:id(),name:'Nadia Hussain',createdAt:ts});
    S.friends.push({id:id(),name:'Kamran Akhtar',createdAt:ts});
    S.friends.push({id:id(),name:'Sophie Williams',createdAt:ts});
    S.assets.push({id:id(),name:'Manchester Apartment',assetType:'property',currentValue:285000,currency:'GBP',purchasePrice:220000,createdAt:ts});
    S.loans.push({id:id(),person:'Kamran Akhtar',type:'lent',amount:5000,currency:'GBP',status:'Active',date:'2024-03-10',createdAt:ts});
  }

  S.user.netWorth = 0;
  Store.save();
  if (S.unlocked) { buildNav(); R.goto('dashboard'); }
}

function loadDemoData() {
  const snapshot = {};
  Object.keys(localStorage).forEach(k => { snapshot[k] = localStorage.getItem(k); });
  // NOTE: demo snapshot is stored unencrypted temporarily for undo — cleared after 30s
  localStorage.setItem('vo_demo_snapshot', JSON.stringify(snapshot));
  localStorage.setItem('vo_demo_snapshot_time', new Date().toISOString());
  loadDemoProfile('business');
  localStorage.setItem('vo_currency', JSON.stringify({ base:'PKR', rates:{USD:280,GBP:355,AED:76,EUR:300} }));
  localStorage.setItem('vo_gold', JSON.stringify([
    {type:'gold',name:'22k Wedding Set',weight:40,unit:'g',pricePerUnit:18500,addedAt:new Date().toISOString()},
    {type:'gold',name:'Gold Coins (10)',weight:20,unit:'tola',pricePerUnit:220000,addedAt:new Date().toISOString()},
    {type:'silver',name:'Silver Cutlery Set',weight:500,unit:'g',pricePerUnit:250,addedAt:new Date().toISOString()},
    {type:'gold',name:'Gold Bangles',weight:15,unit:'g',pricePerUnit:18500,addedAt:new Date().toISOString()}
  ]));
  localStorage.setItem('vo_family', JSON.stringify({
    head:{
      name:'Ahmed Khan',avatar:'👨',relation:'Head',dob:'1968-05-15',
      phone:'+92 300 1234567',email:'ahmed.khan@example.com',
      notes:'Head of household. Director at logistics company. Based in Karachi.',
      docs:[
        {type:'CNIC',number:'42101-1234567-1',expiry:'2028-01-01'},
        {type:'Passport',number:'AB1234567',expiry:'2029-06-15'},
        {type:'NTN',number:'1234567-8',expiry:''}
      ],
      banks:['HBL','Standard Chartered','Meezan Bank'],
      cards:[{name:'HBL Prestige Visa Infinite',last4:'4821',network:'Visa'},{name:'SCB Platinum Mastercard',last4:'3390',network:'Mastercard'}],
      cash:[{label:'Home Safe',amount:150000,notes:'Emergency cash'},{label:'Office Petty Cash',amount:50000,notes:'Business expenses'}]
    },
    members:[
      {
        name:'Sara Ahmed',avatar:'👩',relation:'Wife',dob:'1972-08-22',
        phone:'+92 300 7654321',email:'sara.ahmed@example.com',
        notes:'Joint account holder. Manages household finances.',
        docs:[{type:'CNIC',number:'42101-7654321-2',expiry:'2027-03-10'},{type:'Passport',number:'CD7654321',expiry:'2028-11-20'}],
        banks:['Meezan Bank','HBL'],
        cards:[{name:'Meezan Infinite Visa',last4:'6677',network:'Visa'}],
        cash:[{label:'Household Budget',amount:80000,notes:'Monthly expenses'},{label:'Savings Jar',amount:30000,notes:'Personal savings'}]
      },
      {
        name:'Ali Ahmed',avatar:'👦',relation:'Son',dob:'1998-03-10',
        phone:'+92 321 1234567',email:'ali.ahmed@student.com',
        notes:'Studying at IBA Karachi. Final year MBA.',
        docs:[{type:'CNIC',number:'42101-9876543-3',expiry:'2030-01-01'},{type:'Passport',number:'EF9876543',expiry:'2031-09-20'}],
        banks:['UBL','NayaPay'],
        cards:[{name:'UBL Campus Visa Debit',last4:'1122',network:'Visa'}],
        cash:[{label:'Pocket Money',amount:15000,notes:'Monthly allowance'}]
      },
      {
        name:'Fatima Ahmed',avatar:'👧',relation:'Daughter',dob:'2003-11-05',
        phone:'+92 321 9876543',email:'fatima.ahmed@school.com',
        notes:'A-Levels student. Karachi Grammar School.',
        docs:[{type:'CNIC',number:'42101-5432167-8',expiry:'2030-06-01'},{type:'Birth Certificate',number:'KHI-2003-11789',expiry:''}],
        banks:['EasyPaisa Bank'],
        cards:[],
        cash:[{label:'Savings',amount:25000,notes:'Birthday gifts savings'}]
      },
      {
        name:'Khalid Khan',avatar:'👨‍🦳',relation:'Father',dob:'1940-02-28',
        phone:'+92 300 1111111',email:'',
        notes:'Retired. Lives in Lahore. Property owner.',
        docs:[{type:'CNIC',number:'42101-0001111-9',expiry:'2025-12-31'},{type:'Passport',number:'GH0001111',expiry:'2026-03-10'}],
        banks:['NBP','HBL'],
        cards:[],
        cash:[{label:'Pension',amount:45000,notes:'Monthly pension'}]
      }
    ]
  }));
  localStorage.setItem('vo_credit_score', JSON.stringify({
    country:'GB',
    entries:[
      {score:695,bureau:'Experian',date:'2023-07-10',notes:'Initial check'},
      {score:720,bureau:'Experian',date:'2024-01-15',notes:'After clearing credit card'},
      {score:740,bureau:'Experian',date:'2024-06-01',notes:'Mortgage application'},
      {score:755,bureau:'Experian',date:'2025-01-20',notes:'Annual check — improving trend'}
    ]
  }));
  localStorage.setItem('vo_zakat_calc', JSON.stringify({
    goldPrice:18500,silverPrice:250,
    'zk-cash':'850000','zk-gold':'740000','zk-silver':'125000',
    'zk-invest':'500000','zk-recv':'150000','zk-stock':'200000',
    'zk-debts':'200000','zk-exp':'80000'
  }));
  localStorage.setItem('vo_tax_calc', JSON.stringify({ country:'PK', filing:'salaried', income:'3600000' }));
  if (window.Toast) Toast.show(
    'Demo data loaded! <button onclick="undoDemoLoad()" style="margin-left:8px;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.4);border-radius:6px;padding:3px 10px;color:#fff;font-size:12px;font-weight:700;cursor:pointer;touch-action:manipulation">↩ Undo</button>',
    'success', 8000
  );
  setTimeout(() => localStorage.removeItem('vo_demo_snapshot'), 30000);
}

function undoDemoLoad() {
  const snap = localStorage.getItem('vo_demo_snapshot');
  if (!snap) { if(window.Toast) Toast.show('No snapshot to restore', 'warning'); return; }
  if (!confirm('Restore your previous data? Demo data will be removed.')) return;
  let data;
  try { data = JSON.parse(snap); } catch(e) { if(window.Toast) Toast.show('Snapshot is corrupted — cannot restore', 'error'); return; }
  Object.keys(localStorage).forEach(k => localStorage.removeItem(k));
  Object.entries(data).forEach(([k,v]) => { if (k !== 'vo_demo_snapshot' && k !== 'vo_demo_snapshot_time') localStorage.setItem(k,v); });
  localStorage.removeItem('vo_demo_snapshot');
  localStorage.removeItem('vo_demo_snapshot_time');
  if (window.Toast) Toast.show('Previous data restored!', 'success');
  setTimeout(() => location.reload(), 1200);
}
window.undoDemoLoad = undoDemoLoad;

// ===================== LARGE TEXT =====================
function applyLargeText(on) {
  S.largeText = !!on;
  document.body.classList.toggle('large-text', S.largeText);
  if (S.largeText) {
    document.documentElement.style.setProperty('--base-font', '17px');
  } else {
    document.documentElement.style.removeProperty('--base-font');
  }
  Store.save();
}
window.applyLargeText = applyLargeText;

// ===================== DEBOUNCE =====================
function debounce(fn, ms) {
  let t;
  return function(...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), ms); };
}
window._dbSearch = debounce((fn) => fn(), 200);

// Wire debounced handlers to all search inputs after page renders
function _wireSearchDebounce() {
  const pairs = [
    ['bQ', () => Banks.render()],
    ['cQ', () => Cards.render()],
    ['invQ', () => Inv.render()],
    ['simQ', () => Sims.render()],
    ['emailQ', () => Emails.render()],
    ['friendQ', () => Friends.render()],
    ['digQ', () => Digital.render()],
    ['docsQ', () => DocsModule.render()],
  ];
  pairs.forEach(([id, fn]) => {
    const el = document.getElementById(id);
    if (el && !el._debounced) {
      el._debounced = true;
      el.oninput = debounce(fn, 200);
    }
  });
}

// ===================== AMOUNT FORMATTING =====================
function fmtAmountInput(el) {
  if (!el) return;
  const pos = el.selectionStart;
  const raw = el.value.replace(/,/g, '');
  if (!raw || isNaN(raw)) return;
  const parts = raw.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  el.value = parts.join('.');
}

function initAmountFormatting(container) {
  (container || document).querySelectorAll('input[type=number],input[inputmode=numeric]').forEach(el => {
    if (el._fmtInited) return;
    el._fmtInited = true;
    const isAmt = el.placeholder && /amount|balance|value|price|cost/i.test(el.placeholder + (el.id || ''));
    if (!isAmt) return;
    el.addEventListener('blur', () => fmtAmountInput(el));
  });
}

// ===================== HAPTIC FEEDBACK =====================
const Haptic = {
  save()   { if (navigator.vibrate) navigator.vibrate(30); },
  del()    { if (navigator.vibrate) navigator.vibrate([50,30,50]); },
  error()  { if (navigator.vibrate) navigator.vibrate([100,50,100]); },
  lock()   { if (navigator.vibrate) navigator.vibrate(50); },
  tap()    { if (navigator.vibrate) navigator.vibrate(6); },
};

// ===================== SECURITY HARDENING =====================

// Console suppression in production (non-localhost)
(function() {
  const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.hostname === '';
  if (!isLocal) {
    const noop = () => {};
    ['log', 'debug', 'info', 'warn'].forEach(m => { try { window.console[m] = noop; } catch(e) {} });
  }
})();

// Clipboard auto-clear helper — clear after clipSecs seconds
function _scheduleClipClear() {
  const secs = S.clipSecs || 30;
  setTimeout(() => {
    try { navigator.clipboard.writeText(''); } catch(e) {}
  }, secs * 1000);
}

// Anti-devtools: blur app when devtools likely open
(function() {
  let _dtOpen = false;
  function _checkDevtools() {
    const w = window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160;
    if (w && !_dtOpen) {
      _dtOpen = true;
      if (S.unlocked) document.body.classList.add('app-blur');
    } else if (!w && _dtOpen) {
      _dtOpen = false;
      document.body.classList.remove('app-blur');
    }
  }
  window.addEventListener('resize', _checkDevtools);
})();

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

  // Restore brute-force state from lightweight localStorage (pre-unlock)
  try {
    const fc = JSON.parse(localStorage.getItem('vos_fails') || 'null');
    if (fc) { S.fails = fc.fails || 0; S.lockedUntil = fc.lockedUntil || 0; }
  } catch(e) {}

  // Load non-sensitive prefs for startup display (theme, font scale)
  const prefs = Store.loadPrefs();
  if (prefs) {
    if (prefs.theme)       S.user.theme    = prefs.theme;
    if (prefs.fontScale)   S.fontScale     = prefs.fontScale;
    if (prefs.highContrast) S.highContrast = prefs.highContrast;
    if (prefs.name)        S.user.name     = prefs.name;
  }

  const startTheme = S.user.theme || 'dark';
  ThemeEngine.apply(startTheme);
  const fs = S.fontScale || 'md';
  // Preserve theme class when adding font-scale; ThemeEngine.apply already preserves them on re-apply
  if (!document.body.className.includes('fs-')) {
    document.body.className = document.body.className.trim() + ' fs-' + fs;
  }
  if (S.highContrast && !document.body.classList.contains('hc')) document.body.classList.add('hc');
  if (S.largeText) applyLargeText(true);

  // Check if old localStorage data exists (migration)
  const oldData = Store.loadRaw();
  if (oldData) { Migrate.run(); }

  // Determine startup screen
  const hasVaultDB = await VaultDB.isInitialized();
  const hasOldData = !!oldData;
  const hasData    = hasVaultDB || hasOldData;

  if (!hasData || !(prefs?.hasVault || oldData?.user?.name)) {
    document.getElementById('pgOnboard').style.display = 'flex';
    OB.init();
  } else {
    R.showHome();
  }
}

App();
