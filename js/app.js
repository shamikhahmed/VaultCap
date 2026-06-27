// VaultCap — © 2026 Shamikh Ahmed. Source-available. See LICENSE.

const ALL_MODULES=[
  {id:'banks',  n:'Banks',       ic:'🏦', desc:'Accounts, IBAN, login details',      group:'Finance'},
  {id:'cards',  n:'Cards',       ic:'💳', desc:'Debit, credit, crypto & BNPL',       group:'Finance'},
  {id:'investments',n:'Investments',ic:'📈',desc:'Stocks, funds, bonds, crypto',      group:'Finance'},
  {id:'cash',    n:'Cash',        ic:'💵', desc:'Physical cash by location',          group:'Finance'},
  {id:'loans',   n:'Loans',       ic:'🤝', desc:'Money lent & borrowed',              group:'Finance'},
  {id:'bc',      n:'Committee (BC)', ic:'🤝', desc:'Rotating savings committees',    group:'Finance'},
  {id:'bonds',   n:'Prize Bonds & Savings', ic:'🎫', desc:'Prize bonds, NSS, govt securities', group:'Finance'},
  {id:'expenses',n:'Expenses',   ic:'📋', desc:'Subscriptions & recurring bills',    group:'Finance'},
  {id:'credit',  n:'Credit Score',ic:'📊', desc:'Credit score tracker',              group:'Finance'},
  {id:'zakat',   n:'Zakat',       ic:'🌙', desc:'Annual zakat calculator',           group:'Finance'},
  {id:'tax',     n:'Tax',         ic:'🧾', desc:'Income tax calculator',             group:'Finance'},
  {id:'currency',n:'Currency',    ic:'💱', desc:'Live exchange rates',               group:'Finance'},
  {id:'assets', n:'Assets',      ic:'🏠', desc:'Property, vehicles, electronics, metals & valuables', group:'Assets'},
  {id:'friends', n:'Contacts',    ic:'👥', desc:'Contacts & people',                  group:'Identity'},
  {id:'sims',   n:'SIM Cards',   ic:'📱', desc:'Mobile numbers & networks',          group:'Identity'},
  {id:'documents',n:'Documents',ic:'🪪', desc:'IDs, passports, visas, contracts',   group:'Identity'},
  {id:'emails', n:'Emails',      ic:'📧', desc:'All email identities & security',    group:'Identity'},
  {id:'digital',n:'Digital',     ic:'💼', desc:'Logins, wallets, social media',      group:'Identity'},
  {id:'alerts',     n:'Alerts',     ic:'🔔', desc:'Expiry & urgent alerts',             group:'Tools'},
  {id:'timeline',   n:'Timeline',   ic:'📅', desc:'Activity history',                   group:'Tools'},
  {id:'reminders',  n:'Reminders',  ic:'⏰', desc:'Expiry alerts & upcoming dues',      group:'Tools'},
  {id:'import',  n:'Smart Import',  ic:'📥', desc:'Paste text — Smart Parser + optional LLM', group:'Tools'},
  {id:'trash',      n:'Trash',      ic:'🗑️', desc:'Deleted items — restore or purge',    group:'Tools'},
  {id:'family',        n:'Family Vault',    ic:'👨‍👩‍👧‍👦', desc:'Family financial overview',                    group:'Finance'},
  {id:'emergency',     n:'Emergency',       ic:'🆘', desc:'Emergency access info for first responders', group:'Tools'},
  {id:'recovery-center',n:'Recovery Center',ic:'🛡️', desc:'Backup health, restore guide, verification',  group:'Tools'},
  {id:'help',          n:'Help & Guide',    ic:'📖', desc:'How to use VaultCap',                           group:'Tools'},
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
    return tags.map(t => {
      const safe = escHtml(t);
      const safeJs = String(t).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      return `<span style="display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:600;padding:2px 7px;border-radius:var(--r-pill,999px);background:rgba(123,95,255,.15);color:rgba(150,120,255,1);border:1px solid rgba(123,95,255,.25)">${safe}${opts.removable ? `<span onclick="${opts.onRemove}('${safeJs}')" style="cursor:pointer;margin-left:2px;opacity:.7">×</span>` : ''}</span>`;
    }).join(' ');
  },
  parse(str) {
    return (str || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
  },
  input(id, existing = [], presets = null) {
    const p = presets || this.PRESETS.slice(0, 8);
    const safeId = escHtml(id);
    return `<div>
      <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Tags (optional)</div>
      <input id="${safeId}" placeholder="e.g. uk, business, halal" value="${escHtml(existing.join(', '))}"
        style="width:100%;background:var(--input,var(--glass2));border:1px solid var(--border);border-radius:10px;padding:12px;color:var(--text);font-size:14px;margin-bottom:6px">
      <div style="display:flex;flex-wrap:wrap;gap:4px">
        ${p.map(t => {
          const safeT = escHtml(t);
          const jsT = String(t).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
          return `<span onclick="(()=>{const el=document.getElementById('${safeId}');const cur=el.value.split(',').map(x=>x.trim()).filter(Boolean);if(!cur.includes('${jsT}')){cur.push('${jsT}');el.value=cur.join(', ');}else{el.value=cur.filter(x=>x!=='${jsT}').join(', ');}})()" style="font-size:10px;padding:2px 8px;border-radius:999px;background:var(--glass2);border:1px solid var(--border);color:var(--text3);cursor:pointer;touch-action:manipulation">${safeT}</span>`;
        }).join('')}
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
    if (!memberId) return [];
    return (S.documents || []).filter(d => d.ownerId === memberId);
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
  // BANK duplicate detection — entity-aware
  // HIGH confidence: same bankName + (accountNumber OR iban)
  // POSSIBLE: same bankName + accountType (different accounts at same bank)
  findDuplicateBanks() {
    const banks = S.banks || [];
    const dupes = [];
    for (let i = 0; i < banks.length; i++) {
      for (let j = i + 1; j < banks.length; j++) {
        const a = banks[i], b = banks[j];
        const sameName = (a.bankName || '').toLowerCase() === (b.bankName || '').toLowerCase();
        if (!sameName) continue;
        // HIGH: same unique identifier
        const aNum = (a.accountNumber || a.iban || '').replace(/\s/g,'').toLowerCase();
        const bNum = (b.accountNumber || b.iban || '').replace(/\s/g,'').toLowerCase();
        if (aNum && bNum && aNum === bNum) {
          dupes.push({ a, b, confidence: 'HIGH', reason: 'Same bank name and account number/IBAN' });
          continue;
        }
        // POSSIBLE: same name + same account type (but different/missing numbers — could be different accounts)
        if ((a.accountType || '') === (b.accountType || '') && a.accountType) {
          dupes.push({ a, b, confidence: 'POSSIBLE', reason: 'Same bank and account type — verify if different accounts' });
        }
      }
    }
    return dupes;
  },

  // CARD duplicate detection — entity-aware
  // HIGH: same last4 + same network
  // POSSIBLE: same card type + same linked bank (could be different cards)
  findDuplicateCards() {
    const cards = S.cards || [];
    const dupes = [];
    for (let i = 0; i < cards.length; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        const a = cards[i], b = cards[j];
        const aLast4 = (a.last4 || a.cardNumber || '').slice(-4);
        const bLast4 = (b.last4 || b.cardNumber || '').slice(-4);
        const aNet = (a.network || a.cardType || '').toLowerCase();
        const bNet = (b.network || b.cardType || '').toLowerCase();
        // HIGH: same last 4 + same network
        if (aLast4 && bLast4 && aLast4 === bLast4 && aNet && aNet === bNet) {
          dupes.push({ a, b, confidence: 'HIGH', reason: 'Same last 4 digits and card network' });
          continue;
        }
        // POSSIBLE: same card type + same linked bank
        if (aNet && aNet === bNet && (a.linkedBank || '') === (b.linkedBank || '') && a.linkedBank) {
          dupes.push({ a, b, confidence: 'POSSIBLE', reason: 'Same card type and linked bank — verify if different cards' });
        }
      }
    }
    return dupes;
  },

  // DOCUMENT duplicate detection
  findDuplicateDocuments() {
    const docs = S.documents || [];
    const dupes = [];
    for (let i = 0; i < docs.length; i++) {
      for (let j = i + 1; j < docs.length; j++) {
        const a = docs[i], b = docs[j];
        const sameType = (a.type || '').toLowerCase() === (b.type || '').toLowerCase();
        const aNum = (a.number || a.docNumber || '').replace(/\s/g,'').toLowerCase();
        const bNum = (b.number || b.docNumber || '').replace(/\s/g,'').toLowerCase();
        if (sameType && aNum && bNum && aNum === bNum) {
          dupes.push({ a, b, confidence: 'HIGH', reason: 'Same document type and number' });
        }
      }
    }
    return dupes;
  },

  check() {
    const dupBanks = this.findDuplicateBanks();
    const dupCards = this.findDuplicateCards();
    const dupDocs  = this.findDuplicateDocuments();
    const highCount = [...dupBanks, ...dupCards, ...dupDocs].filter(d => d.confidence === 'HIGH').length;
    const posCount  = [...dupBanks, ...dupCards, ...dupDocs].filter(d => d.confidence === 'POSSIBLE').length;
    return { dupBanks, dupCards, dupDocs, highCount, posCount };
  },

  run() {
    const r = this.check();
    const total = r.highCount + r.posCount;
    const hasDups = total > 0;
    Modal.open(
      '🔍 Data Integrity Check',
      `<div style="font-size:13px;color:var(--text2);margin-bottom:14px;line-height:1.6">
        Scanned ${(S.banks||[]).length} banks, ${(S.cards||[]).length} cards, ${(S.documents||[]).length} documents.
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px">
        ${r.highCount > 0 ? `<div style="padding:10px;background:rgba(255,59,48,.08);border:1px solid rgba(255,59,48,.2);border-radius:10px;font-size:13px;color:var(--err)">🔴 ${r.highCount} HIGH confidence duplicate${r.highCount>1?'s':''} — likely same record entered twice</div>` : '<div style="font-size:13px;color:var(--ok)">✅ No high-confidence duplicates</div>'}
        ${r.posCount > 0 ? `<div style="padding:10px;background:rgba(255,152,0,.08);border:1px solid rgba(255,152,0,.2);border-radius:10px;font-size:13px;color:var(--warn)">🟡 ${r.posCount} POSSIBLE duplicate${r.posCount>1?'s':''} — review recommended</div>` : ''}
        ${!hasDups ? '<div style="font-size:13px;color:var(--ok)">✅ No duplicates detected</div>' : ''}
      </div>
      <div style="font-size:11px;color:var(--text3);line-height:1.5">Note: Duplicate detection uses unique identifiers (account numbers, last 4 digits, document numbers) — two accounts at the same bank are NOT flagged as duplicates unless they share the same identifier.</div>`,
      `${hasDups ? '<button class="btn btn-g" onclick="Modal.close();DataIntegrity.showDuplicates()">Review →</button>' : ''}<button class="btn btn-p" onclick="Modal.close()">Done</button>`
    );
  },

  showDuplicates() {
    const r = this.check();
    const allDupes = [...r.dupBanks, ...r.dupCards, ...r.dupDocs];
    if (!allDupes.length) { Toast.show('No duplicates found', 'success'); return; }

    const renderDupe = (d, idx) => {
      const confColor = d.confidence === 'HIGH' ? 'var(--err)' : 'var(--warn)';
      const confBg    = d.confidence === 'HIGH' ? 'rgba(255,59,48,.08)' : 'rgba(255,152,0,.08)';
      const nameA = d.a.bankName || d.a.cardType || d.a.type || d.a.name || 'Record A';
      const nameB = d.b.bankName || d.b.cardType || d.b.type || d.b.name || 'Record B';
      const subA  = d.a.accountNumber || d.a.last4 || d.a.number || d.a.accountType || '';
      const subB  = d.b.accountNumber || d.b.last4 || d.b.number || d.b.accountType || '';
      return `<div style="background:${confBg};border:1px solid ${confColor}44;border-radius:12px;padding:12px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-size:11px;font-weight:700;color:${confColor}">${d.confidence} CONFIDENCE</span>
          <span style="font-size:11px;color:var(--text3)">${d.reason}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
          <div style="background:var(--glass);border-radius:8px;padding:8px">
            <div style="font-size:12px;font-weight:700;color:var(--text)">${escHtml(nameA)}</div>
            ${subA ? `<div style="font-size:11px;color:var(--text3)">${escHtml(subA)}</div>` : ''}
          </div>
          <div style="background:var(--glass);border-radius:8px;padding:8px">
            <div style="font-size:12px;font-weight:700;color:var(--text)">${escHtml(nameB)}</div>
            ${subB ? `<div style="font-size:11px;color:var(--text3)">${escHtml(subB)}</div>` : ''}
          </div>
        </div>
        ${d.confidence === 'HIGH' ? `<div style="font-size:11px;color:var(--text3)">These appear to be the same record. Review both before deleting.</div>` : `<div style="font-size:11px;color:var(--text3)">These may be different records at the same institution. No action required if they are distinct accounts.</div>`}
      </div>`;
    };

    Modal.open(
      '⚠️ Duplicate Review',
      `<div style="font-size:12px;color:var(--text3);margin-bottom:12px">Review these entries. Only delete if you are certain they are the same record. Never auto-merge without your confirmation.</div>` +
      allDupes.map(renderDupe).join(''),
      `<button class="btn btn-p" onclick="Modal.close()">Done</button>`
    );
  }
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
        <button class="btn btn-g" onclick="DevDiag.copyReport()" style="width:100%;margin-top:10px;font-size:11px">Copy Report</button>
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
      `<button class="btn btn-g" onclick="Modal.close()">Dismiss</button><button class="btn btn-p" onclick="ExIm.export('vos');Modal.close()">Export Backup</button>`
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
      return `<button type="button" onclick="ContextSwitcher.set('${code}')" style="display:flex;align-items:center;gap:5px;padding:7px 13px;border-radius:999px;background:${isActive ? 'var(--accent)' : 'var(--glass2)'};color:${isActive ? '#fff' : 'var(--text)'};border:1px solid ${isActive ? 'var(--accent)' : 'var(--border)'};cursor:pointer;touch-action:manipulation;white-space:nowrap;font-size:12px;font-weight:${isActive ? '700' : '500'};transition:all .15s ease;font-family:inherit">
        ${flag ? `<span aria-hidden="true">${flag}</span>` : ''}<span>${label}</span>
      </button>`;
    };
    let pills = pill('ALL', 'All', '🌍');
    codes.forEach(code => pills += pill(code, U.cname(code), U.flag(code)));
    if (!primary) {
      pills += `<button type="button" onclick="ContextSwitcher.openManager()" style="display:flex;align-items:center;gap:5px;padding:7px 13px;border-radius:999px;background:rgba(123,95,255,.12);color:var(--accent);border:1px dashed var(--accent);cursor:pointer;font-size:12px;font-weight:600;font-family:inherit">+ Set home country</button>`;
    } else {
      pills += `<button type="button" onclick="ContextSwitcher.openManager()" title="Manage countries" style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:999px;background:var(--glass2);color:var(--text2);border:1px solid var(--border);cursor:pointer;font-size:14px;font-family:inherit;flex-shrink:0">✏️</button>`;
    }
    return `<div style="padding:10px 16px 8px;overflow-x:auto;display:flex;gap:6px;align-items:center;scrollbar-width:none;-webkit-overflow-scrolling:touch;border-bottom:1px solid var(--border)">${pills}</div>`;
  },
  openManager() {
    const primary = S.user.country || '';
    const secondary = [...(S.user.secondaryCountries || [])];
    const pickList = COUNTRIES.filter(c => c.c !== 'OTHER');
    Modal.open('🌍 Countries & Regions', `
      <p style="font-size:12px;color:var(--text2);line-height:1.55;margin-bottom:14px">Choose your home country and any others where you hold accounts. Filter the dashboard by country, or tap <strong>All</strong> to see everything.</p>
      <div class="fg"><label class="fl">Home country</label>
        <select class="inp" id="ctx-primary">${pickList.map(c => `<option value="${c.c}">${c.f} ${c.n}</option>`).join('')}</select>
      </div>
      <div class="fg"><label class="fl">Also active in</label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px" id="ctx-secondary">${pickList.filter(c => c.c !== primary).map(c => `
          <label style="display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:12px;background:var(--glass);border:1px solid var(--border);cursor:pointer;font-size:13px;color:var(--text)">
            <input type="checkbox" class="ctx-sec-chk" value="${c.c}" ${secondary.includes(c.c) ? 'checked' : ''} style="accent-color:var(--accent)">
            <span>${c.f} ${c.n}</span>
          </label>`).join('')}
        </div>
      </div>
      <div class="fg"><label class="fl">Display currency</label><select class="inp" id="ctx-currency">${U.currencies()}</select></div>`,
      `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="ContextSwitcher.saveManager()">Save</button>`);
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
      <label style="display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:12px;background:var(--glass);border:1px solid var(--border);cursor:pointer;font-size:13px;color:var(--text)">
        <input type="checkbox" class="ctx-sec-chk" value="${c.c}" ${secondary.includes(c.c) ? 'checked' : ''} style="accent-color:var(--accent)">
        <span>${c.f} ${c.n}</span>
      </label>`).join('') || '<div style="font-size:12px;color:var(--text3);padding:8px 0">Add another home country above to enable secondary regions.</div>';
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

const Onboarding = {
  _step: 0,

  shouldShow() {
    return S.unlocked && !S.user.onboardingComplete;
  },

  show() {
    this._step = 0;
    this._render();
  },

  _countries: [
    { code: 'PK', name: 'Pakistan',        flag: '🇵🇰', currency: 'PKR', zakat: true  },
    { code: 'GB', name: 'United Kingdom',  flag: '🇬🇧', currency: 'GBP', zakat: false },
    { code: 'AE', name: 'UAE',             flag: '🇦🇪', currency: 'AED', zakat: false },
    { code: 'US', name: 'United States',   flag: '🇺🇸', currency: 'USD', zakat: false },
    { code: 'CA', name: 'Canada',          flag: '🇨🇦', currency: 'CAD', zakat: false },
    { code: 'AU', name: 'Australia',       flag: '🇦🇺', currency: 'AUD', zakat: false },
    { code: 'SA', name: 'Saudi Arabia',    flag: '🇸🇦', currency: 'SAR', zakat: true  },
    { code: 'QA', name: 'Qatar',           flag: '🇶🇦', currency: 'QAR', zakat: false },
    { code: 'OTHER', name: 'Other',        flag: '🌍', currency: 'USD', zakat: false },
  ],

  _primaryCountry: '',
  _secondaryCountries: [],
  _prefs: { zakat: false, family: false, business: false, investments: false },
  _modules: { banking:true, documents:true, family:false, investments:false, vehicles:false, expenses:false, zakat:false, tax:true, currency:false, loans:false },

  _render() {
    const existing = document.getElementById('onboarding-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'onboarding-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:9000;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;overflow-y:auto;animation:fadeIn .3s ease';

    const steps = ['welcome', 'country', 'secondary', 'modules', 'prefs'];
    const progress = `
      <div style="display:flex;gap:6px;margin-bottom:32px">
        ${steps.map((_, i) => `<div style="height:3px;flex:1;border-radius:2px;background:${i <= this._step ? 'var(--accent)' : 'var(--border)'}"></div>`).join('')}
      </div>`;

    let content = '';

    if (this._step === 0) {
      content = `
        <div style="font-size:40px;margin-bottom:16px">🔐</div>
        <div style="font-size:24px;font-weight:800;color:var(--text);margin-bottom:8px;text-align:center">Welcome to VaultCap</div>
        <div style="font-size:14px;color:var(--text3);text-align:center;line-height:1.7;max-width:320px;margin-bottom:32px">Your private financial vault. Takes 30 seconds to personalise.</div>
        <button onclick="Onboarding._next()" class="btn btn-p" style="width:100%;max-width:320px;padding:16px;font-size:15px;font-weight:700">Get Started →</button>
        <button onclick="Onboarding._skip()" style="margin-top:14px;background:none;border:none;color:var(--text3);font-size:13px;cursor:pointer;touch-action:manipulation">Skip for now</button>`;
    } else if (this._step === 1) {
      content = `
        <div style="font-size:22px;font-weight:800;color:var(--text);margin-bottom:6px;text-align:center">Where do you primarily live?</div>
        <div style="font-size:13px;color:var(--text3);text-align:center;margin-bottom:24px">Sets your currency, tax system, and banks</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;max-width:400px;margin-bottom:24px">
          ${this._countries.map(c => `
            <div onclick="Onboarding._primaryCountry='${c.code}';document.querySelectorAll('.ob-country').forEach(el=>el.style.borderColor='var(--border)');this.style.borderColor='var(--accent)'"
              class="ob-country"
              style="padding:14px 12px;border-radius:14px;background:var(--glass);border:2px solid ${this._primaryCountry===c.code?'var(--accent)':'var(--border)'};cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:10px">
              <span style="font-size:20px">${c.flag}</span>
              <span style="font-size:13px;font-weight:600;color:var(--text)">${c.name}</span>
            </div>`).join('')}
        </div>
        <button onclick="Onboarding._next()" class="btn btn-p" style="width:100%;max-width:400px;padding:14px;font-weight:700">Continue →</button>
        <button onclick="Onboarding._back()" style="margin-top:12px;background:none;border:none;color:var(--text3);font-size:13px;cursor:pointer;touch-action:manipulation">← Back</button>`;
    } else if (this._step === 2) {
      content = `
        <div style="font-size:22px;font-weight:800;color:var(--text);margin-bottom:6px;text-align:center">Any other countries?</div>
        <div style="font-size:13px;color:var(--text3);text-align:center;margin-bottom:24px">Multi-country support — add relevant banks</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;max-width:400px;margin-bottom:24px">
          <div id="ob-none-card" onclick="Onboarding._secondaryCountries=[];document.querySelectorAll('.ob-sec').forEach(el=>{el.style.borderColor='var(--border)';el.style.background='var(--glass)'});this.style.borderColor='var(--accent)';this.style.background='var(--glass2)'"
            class="ob-sec"
            style="padding:14px 12px;border-radius:14px;background:var(--glass2);border:2px solid var(--accent);cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:10px;grid-column:1/-1">
            <span style="font-size:20px">🚫</span>
            <span style="font-size:13px;font-weight:600;color:var(--text)">None — I only manage money in one country</span>
          </div>
          ${this._countries.filter(c=>c.code!==this._primaryCountry).map(c => `
            <div onclick="(()=>{const i=Onboarding._secondaryCountries.indexOf('${c.code}');if(i>-1)Onboarding._secondaryCountries.splice(i,1);else Onboarding._secondaryCountries.push('${c.code}');this.style.borderColor=Onboarding._secondaryCountries.includes('${c.code}')?'var(--accent)':'var(--border)';this.style.background=Onboarding._secondaryCountries.includes('${c.code}')?'var(--glass2)':'var(--glass)';const nc=document.getElementById('ob-none-card');if(nc){nc.style.borderColor='var(--border)';nc.style.background='var(--glass)';}})()"
              class="ob-sec"
              style="padding:14px 12px;border-radius:14px;background:${this._secondaryCountries.includes(c.code)?'var(--glass2)':'var(--glass)'};border:2px solid ${this._secondaryCountries.includes(c.code)?'var(--accent)':'var(--border)'};cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:10px">
              <span style="font-size:20px">${c.flag}</span>
              <span style="font-size:13px;font-weight:600;color:var(--text)">${c.name}</span>
            </div>`).join('')}
        </div>
        <button onclick="Onboarding._next()" class="btn btn-p" style="width:100%;max-width:400px;padding:14px;font-weight:700">Continue →</button>
        <button onclick="Onboarding._secondaryCountries=[];Onboarding._next()" style="margin-top:8px;background:none;border:none;color:var(--text3);font-size:13px;cursor:pointer;touch-action:manipulation">Skip this step →</button>
        <button onclick="Onboarding._back()" style="margin-top:12px;background:none;border:none;color:var(--text3);font-size:13px;cursor:pointer;touch-action:manipulation">← Back</button>`;
    } else if (this._step === 3) {
      const moduleOptions = [
        { key:'banking',     icon:'🏦', label:'Banking & Cards',    desc:'Banks, cards, cash, credit' },
        { key:'documents',   icon:'🪪', label:'Documents & ID',     desc:'Passport, licence, visas' },
        { key:'family',      icon:'👨‍👩‍👧‍👦', label:'Family Vault',       desc:'Finance for family members' },
        { key:'investments', icon:'📈', label:'Investments',         desc:'Stocks, funds, crypto, bonds' },
        { key:'vehicles',    icon:'🚗', label:'Vehicles & Assets',   desc:'Cars, property, gadgets' },
        { key:'expenses',    icon:'💸', label:'Expenses',            desc:'Daily spending tracker' },
        { key:'zakat',       icon:'🌙', label:'Zakat',               desc:'Islamic wealth calculator' },
        { key:'tax',         icon:'🧾', label:'Tax Calculator',      desc:'PK, UK, UAE tax tools' },
        { key:'currency',    icon:'💱', label:'Currency & Metals',   desc:'Exchange rates, gold, silver' },
        { key:'loans',       icon:'🤝', label:'Loans & Debts',       desc:'Money lent or borrowed' },
      ];
      content = `
        <div style="font-size:22px;font-weight:800;color:var(--text);margin-bottom:6px;text-align:center">What do you want to manage?</div>
        <div style="font-size:13px;color:var(--text3);text-align:center;margin-bottom:20px">You can change this anytime in Settings</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%;max-width:440px;margin-bottom:20px;max-height:55vh;overflow-y:auto;padding:2px">
          ${moduleOptions.map(m => `
            <div onclick="Onboarding._modules['${m.key}']=!Onboarding._modules['${m.key}'];this.style.borderColor=Onboarding._modules['${m.key}']?'var(--accent)':'var(--border)';this.querySelector('.mod-check').style.background=Onboarding._modules['${m.key}']?'var(--accent)':'transparent';this.querySelector('.mod-check').textContent=Onboarding._modules['${m.key}']?'✓':''"
              style="padding:12px;border-radius:14px;background:var(--glass);border:2px solid ${this._modules[m.key]?'var(--accent)':'var(--border)'};cursor:pointer;touch-action:manipulation;display:flex;flex-direction:column;gap:4px;position:relative">
              <div style="display:flex;align-items:center;justify-content:space-between">
                <span style="font-size:20px">${m.icon}</span>
                <div class="mod-check" style="width:20px;height:20px;border-radius:50%;border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;background:${this._modules[m.key]?'var(--accent)':'transparent'}">${this._modules[m.key]?'✓':''}</div>
              </div>
              <div style="font-size:12px;font-weight:700;color:var(--text);line-height:1.2">${m.label}</div>
              <div style="font-size:10px;color:var(--text3);line-height:1.3">${m.desc}</div>
            </div>`).join('')}
        </div>
        <button onclick="Onboarding._next()" class="btn btn-p" style="width:100%;max-width:440px;padding:14px;font-weight:700">Continue →</button>
        <button onclick="Onboarding._back()" style="margin-top:12px;background:none;border:none;color:var(--text3);font-size:13px;cursor:pointer;touch-action:manipulation">← Back</button>`;
    } else if (this._step === 4) {
      const prefs = [
        { key: 'zakat',       icon: '🌙', label: 'Zakat Calculator', desc: 'Islamic annual wealth obligation' },
        { key: 'family',      icon: '👨‍👩‍👧‍👦', label: 'Family Vault',    desc: 'Manage finances for your family' },
        { key: 'business',    icon: '🏢', label: 'Business Accounts', desc: 'Separate business finances' },
        { key: 'investments', icon: '📈', label: 'Investments',       desc: 'Track stocks, funds, crypto' },
      ];
      content = `
        <div style="font-size:22px;font-weight:800;color:var(--text);margin-bottom:6px;text-align:center">What do you use?</div>
        <div style="font-size:13px;color:var(--text3);text-align:center;margin-bottom:24px">Personalise your vault — hide what you don't need</div>
        <div style="display:flex;flex-direction:column;gap:10px;width:100%;max-width:400px;margin-bottom:24px">
          ${prefs.map(p => `
            <div onclick="Onboarding._prefs['${p.key}']=!Onboarding._prefs['${p.key}'];this.style.borderColor=Onboarding._prefs['${p.key}']?'var(--accent)':'var(--border)';this.querySelector('.pref-check').textContent=Onboarding._prefs['${p.key}']?'✓':''"
              style="padding:14px 16px;border-radius:14px;background:var(--glass);border:2px solid ${this._prefs[p.key]?'var(--accent)':'var(--border)'};cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:14px">
              <span style="font-size:22px">${p.icon}</span>
              <div style="flex:1">
                <div style="font-size:14px;font-weight:600;color:var(--text)">${p.label}</div>
                <div style="font-size:12px;color:var(--text3)">${p.desc}</div>
              </div>
              <div class="pref-check" style="width:24px;height:24px;border-radius:50%;border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:var(--accent)">${this._prefs[p.key]?'✓':''}</div>
            </div>`).join('')}
        </div>
        <button onclick="Onboarding._finish()" class="btn btn-p" style="width:100%;max-width:400px;padding:16px;font-size:15px;font-weight:700">Start Using VaultCap ✓</button>
        <button onclick="Onboarding._back()" style="margin-top:12px;background:none;border:none;color:var(--text3);font-size:13px;cursor:pointer;touch-action:manipulation">← Back</button>`;
    }

    overlay.innerHTML = `
      <div style="width:100%;max-width:440px;display:flex;flex-direction:column;align-items:center">
        ${progress}
        ${content}
      </div>`;

    document.body.appendChild(overlay);
  },

  _next() {
    if (this._step === 1 && !this._primaryCountry) {
      Toast.show('Please select your primary country', 'warning');
      return;
    }
    this._step = Math.min(this._step + 1, 4);
    this._render();
  },

  _back() {
    this._step = Math.max(this._step - 1, 0);
    this._render();
  },

  _skip() {
    S.user.onboardingComplete = true;
    Store.save();
    document.getElementById('onboarding-overlay')?.remove();
    Toast.show('You can personalise anytime in Settings → Profile', 'info', 4000);
  },

  _finish() {
    const country = this._countries.find(c => c.code === this._primaryCountry);
    if (country) {
      S.user.country = country.code;
      S.user.currency = country.currency;
      S.user.secondaryCountries = this._secondaryCountries;
    }
    {
      const zakatOn = this._prefs.zakat || this._modules.zakat;
      const prefs = getTabPrefs();
      prefs.hiddenFinance = [...(prefs.hiddenFinance || [])];
      if (zakatOn) {
        prefs.hiddenFinance = prefs.hiddenFinance.filter(m => m !== 'zakat');
      } else {
        if (!prefs.hiddenFinance.includes('zakat')) prefs.hiddenFinance.push('zakat');
      }
      saveTabPrefs(prefs);
    }
    if (!this._prefs.family) S.modules.family = false;

    // Apply module step selections
    const mtp = getTabPrefs();
    mtp.hiddenFinance = mtp.hiddenFinance || [];
    mtp.hiddenVault = mtp.hiddenVault || [];
    mtp.hiddenAssets = mtp.hiddenAssets || [];
    if (!this._modules.banking) { ['banks','cards','cash','credit'].forEach(m => { if(!mtp.hiddenFinance.includes(m)) mtp.hiddenFinance.push(m); }); }
    if (!this._modules.investments) { if(!mtp.hiddenFinance.includes('investments')) mtp.hiddenFinance.push('investments'); }
    if (!this._modules.expenses) { if(!mtp.hiddenFinance.includes('expenses')) mtp.hiddenFinance.push('expenses'); }
    if (!this._modules.zakat) { if(!mtp.hiddenFinance.includes('zakat')) mtp.hiddenFinance.push('zakat'); }
    if (!this._modules.tax) { if(!mtp.hiddenFinance.includes('tax')) mtp.hiddenFinance.push('tax'); }
    if (!this._modules.currency) { ['currency','gold'].forEach(m => { if(!mtp.hiddenFinance.includes(m)) mtp.hiddenFinance.push(m); }); }
    if (!this._modules.loans) { if(!mtp.hiddenFinance.includes('loans')) mtp.hiddenFinance.push('loans'); }
    if (!this._modules.family) S.modules.family = false;
    if (!this._modules.vehicles) { if(!mtp.hiddenAssets.includes('vehicles')) mtp.hiddenAssets.push('vehicles'); }
    if (!this._modules.documents) { if(!mtp.hiddenVault.includes('documents')) mtp.hiddenVault.push('documents'); }
    saveTabPrefs(mtp);
    S.user.modulePrefs = this._modules;

    S.user.onboardingComplete = true;
    S.user.showZakat = this._prefs.zakat || this._modules.zakat;
    S.user.hasBusiness = this._prefs.business;
    Store.save();
    buildNav();
    document.getElementById('onboarding-overlay')?.remove();
    Toast.show('Vault personalised ✓', 'success');
    if (country) {
      Toast.show(`Currency set to ${country.currency} · Banks filtered to ${country.name}`, 'info', 4000);
    }
  },

  showSettingsCard() {
    return `
      <div style="background:rgba(91,141,238,.08);border:1px solid rgba(91,141,238,.2);border-radius:14px;padding:16px;margin:0 0 16px">
        <div style="font-size:13px;font-weight:700;color:var(--accent);margin-bottom:6px">⚡ Personalise Your Vault</div>
        <div style="font-size:12px;color:var(--text3);line-height:1.6;margin-bottom:12px">Set your country, currency, and preferences for a tailored experience.</div>
        <button onclick="Onboarding._primaryCountry=S.user.country||'';Onboarding._secondaryCountries=S.user.secondaryCountries||[];Onboarding.show()" class="btn btn-p btn-sm">Run Setup →</button>
      </div>`;
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

// COUNTRY_CUR → js/core/constants.js · SMART_DB → js/core/smart-db.js

const CUR_SYM = { GBP:'£', USD:'$', EUR:'€', AED:'AED ', PKR:'PKR ', SAR:'SAR ', CAD:'CA$', AUD:'A$', SGD:'S$', INR:'₹', QAR:'QAR ' };

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

// SMART_DB → js/core/smart-db.js

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

// ── VaultCap safe confirm — works in sandboxed iframe and native ──
window.__vos_confirm = function(msg) {
  try { return window.confirm(msg); }
  catch(e) {
    console.warn('[VaultCap] confirm blocked in sandbox — treating as cancelled:', msg.slice(0, 80));
    return false;
  }
};

window.__vos_confirmTyped = function(msg, word) {
  try {
    const typed = window.prompt(msg + '\n\nType ' + word + ' to continue:');
    return typed === word;
  } catch (e) {
    return false;
  }
};

function _vaultEntityCount(data) {
  if (!data || typeof data !== 'object') return 0;
  return ['banks','cards','investments','cash','loans','documents','vehicles','assets','emails','gadgets','digital','expenses','sims'].reduce(
    (n, k) => n + (Array.isArray(data[k]) ? data[k].length : 0), 0
  );
}

const VaultSafety = {
  async maybeOfferRestore() {
    if (VaultProfiles.isDemo() || !S.unlocked) return;
    if (sessionStorage.getItem('vo_restore_offer_dismissed')) return;
    if (!(await VaultDB.hasPinBackup())) return;
    const backup = await VaultDB.loadPinBackup();
    if (!backup) return;
    const mainCount = _vaultEntityCount(Store._data());
    const backupCount = _vaultEntityCount(backup);
    if (backupCount < 3 || backupCount <= mainCount) return;
    Modal.open('↩ Restore previous vault?',
      `<div style="font-size:13px;color:var(--text2);line-height:1.6;margin-bottom:12px">A saved copy from before your last change is available (${backupCount} entries vs ${mainCount} now). This can recover data after an accidental demo load or bad import.</div>`,
      `<button class="btn btn-g" onclick="sessionStorage.setItem('vo_restore_offer_dismissed','1');Modal.close()">Keep current</button>` +
      `<button class="btn btn-p" onclick="VaultSafety.restore()">Restore previous →</button>`
    );
  },

  async restore() {
    try {
      const data = await VaultDB.restorePinBackup();
      Object.assign(S, data);
      await Store.save();
      Modal.close();
      buildNav();
      Toast.show('Previous vault restored', 'success', 5000);
      R.goto('dashboard');
      setTimeout(() => Dash.render(), 50);
    } catch (e) {
      Toast.show('Restore failed — try Backup Center import', 'error');
    }
  },
};
window.VaultSafety = VaultSafety;

const VER = '4.3.8';

// Crypto → js/core/crypto.js · Migrate → js/core/migrate.js (load before app.js)

// ===================== VAULT HEALTH — SINGLE SOURCE OF TRUTH =====================
// All three callers (Dashboard, SecurityCenter, Widget snapshot) must use this.
const VaultHealth = {
  score() {
    let s = 0;
    if (Crypto.available())                                    s += 20; // AES-256-GCM ready
    if (S.pin !== '123456')                                    s += 20; // Custom PIN (undefined = VaultDB mode = custom)
    const daysSince = S.user?.lastBackup
      ? Math.floor((Date.now() - new Date(S.user.lastBackup)) / 86400000) : 999;
    if (daysSince <= 7)       s += 20;
    else if (daysSince <= 30) s += 10;
    else if (daysSince < 999) s += 3;
    if (localStorage.getItem(recoveryKeyStorageKey()))                        s += 15; // Recovery key saved
    if (S.autoLock)                                            s += 10; // Auto-lock on
    if (S.decoyPin)                                            s += 8;  // Decoy PIN
    if (S.emergency && S.emergency.enabled)                    s += 5;  // Emergency info
    if (S.privacyMode !== undefined)                           s += 2;  // Privacy-mode available
    return Math.min(s, 100);
  },
  label(score) {
    return score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Attention';
  },
  color(score) {
    return score >= 80 ? 'var(--ok)' : score >= 60 ? 'var(--warn)' : 'var(--err)';
  },
  checks() {
    const daysSince = S.user?.lastBackup
      ? Math.floor((Date.now() - new Date(S.user.lastBackup)) / 86400000) : 999;
    return [
      { ok: Crypto.available(),                  label: 'AES-256 encryption' },
      { ok: S.pin !== '123456',                  label: 'Custom PIN' },
      { ok: !!localStorage.getItem(recoveryKeyStorageKey()),    label: 'Recovery key saved' },
      { ok: daysSince <= 30,                     label: daysSince >= 999 ? 'No backup yet' : daysSince === 0 ? 'Backed up today' : `Backup ${daysSince}d ago` },
      { ok: S.autoLock,                          label: 'Auto-lock on' },
      { ok: !!S.decoyPin,                        label: 'Decoy PIN' },
      { ok: !!(S.emergency && S.emergency.enabled), label: 'Emergency info' },
    ];
  },
};
window.VaultHealth = VaultHealth;

// S + Store → js/core/store-engine.js (loaded before app.js)

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
    if (window._familyEditCtx) {
      const ctx = window._familyEditCtx; window._familyEditCtx = null;
      setTimeout(() => { if (typeof Family !== 'undefined') { Family._activeId = ctx.memberId; Family._tab = ctx.tab; Family.render(); } }, 50);
    }
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

// ===================== MASTER KEY HELPERS =====================
async function hashString(str) {
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

function generateMasterKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => chars[b % chars.length]).join('');
}

async function storeMasterKeyHash(key) {
  const h = await hashString(key);
  localStorage.setItem(recoveryKeyStorageKey(), h);
}

function recoveryKeyStorageKey() {
  const p = localStorage.getItem('vo_active_profile') || 'personal';
  return p === 'personal' ? 'vo_mkh' : 'vo_mkh_' + p;
}
window.recoveryKeyStorageKey = recoveryKeyStorageKey;

async function showMasterKeyModal(mk) {
  const fmt = mk.match(/.{1,6}/g).join('-');
  Modal.open('🔑 Save Your Master Key',
    '<div style="font-size:13px;color:var(--text2);margin-bottom:12px;line-height:1.6">This is your vault recovery key. <strong>Write it down and keep it safe.</strong> You cannot view it again here.</div>' +
    '<div style="background:var(--glass);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center;font-family:var(--mono);font-size:1.05rem;font-weight:700;letter-spacing:.12em;color:var(--accent);margin-bottom:8px;word-break:break-all">' + fmt + '</div>' +
    '<div style="font-size:11px;color:var(--text3);text-align:center">If you forget your PIN, this key lets you recover your vault data.</div>',
    '<button class="btn btn-p btn-full" onclick="Modal.close()">I\'ve saved it ✓</button>'
  );
}




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
    '<div style="font-size:13px;color:var(--text2);line-height:1.6;padding:10px;background:var(--glass);border-radius:10px">Enter the master key that was shown when you first set up VaultCap.<br><span style="color:var(--text3)">Format: XXXXXX-XXXXXX-XXXXXX-XXXXXX</span></div>' +
    '<input class="inp" id="mk-in" placeholder="XXXXXX-XXXXXX-XXXXXX-XXXXXX" style="font-family:var(--mono);letter-spacing:3px;text-transform:uppercase;font-size:16px;text-align:center" oninput="this.value=this.value.toUpperCase().replace(/[^A-Z0-9-]/g,\'\')">' +
    '<div id="mk-err" style="color:var(--err);font-size:12px;min-height:16px;text-align:center"></div>' +
    '</div>',
    '<button class="btn btn-g" onclick="Modal.close()">Cancel</button>' +
    '<button class="btn btn-p" onclick="window.Settings.verifyMasterKey()">Verify & Reset PIN</button>'
  );
};

window.Settings.verifyMasterKey = function() {
  window._verifyMasterKey();
};

window.Settings.resetVault = function() {
  if (typeof Settings !== 'undefined' && Settings.resetVault) {
    Settings.resetVault();
    return;
  }
  if (!confirm('⚠️ This will permanently delete ALL your vault data. This cannot be undone. Are you absolutely sure?')) return;
  if (!confirm('FINAL CONFIRMATION: Reset entire vault and delete all data?')) return;
  window._confirmReset();
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
  curSym:   c  => CUR_SYM[(c || 'GBP').toUpperCase()] || ((c || 'GBP').toUpperCase() + ' '),
  fmtCur(pkr, cur) {
    cur = (cur || (typeof S !== 'undefined' && S.user && S.user.currency) || 'GBP').toUpperCase();
    const val = typeof CurrencyEngine !== 'undefined'
      ? Math.round(CurrencyEngine.fromBase(pkr || 0, cur))
      : Math.round(pkr || 0);
    const sym = U.curSym(cur);
    if (cur === 'PKR') return sym + U.fmtPKR(val);
    if (val >= 1000000) return sym + (val / 1000000).toFixed(2).replace(/\.?0+$/, '') + 'M';
    if (val >= 1000) return sym + (val / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return sym + val.toLocaleString();
  },
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
    el.addEventListener('input', () => { formatNumberInput(el, currency || S.user.currency || 'PKR'); U.showWords(el, currency); });
    U.showWords(el, currency);
  },
  numInWords(n, currency) {
    if (!n || isNaN(n)) return '';
    const num = Math.round(Math.abs(parseFloat(String(n).replace(/,/g,''))));
    if (num === 0) return '';
    const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
      'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
    const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
    const toHundred = x => x < 20 ? ones[x] : tens[Math.floor(x/10)] + (x%10 ? ' ' + ones[x%10] : '');
    const cur = (currency || S.user?.currency || '').toUpperCase();
    const isPKR = cur === 'PKR' || cur === 'RS' || cur === 'RS.' || cur === '';
    if (isPKR && num >= 100) {
      const crore = Math.floor(num / 10000000);
      const lakh  = Math.floor((num % 10000000) / 100000);
      const thou  = Math.floor((num % 100000) / 1000);
      const hund  = Math.floor((num % 1000) / 100);
      const rem   = num % 100;
      const parts = [];
      if (crore) parts.push(toHundred(crore) + ' Crore');
      if (lakh)  parts.push(toHundred(lakh)  + ' Lakh');
      if (thou)  parts.push(toHundred(thou)  + ' Thousand');
      if (hund)  parts.push(ones[hund]        + ' Hundred');
      if (rem)   parts.push(toHundred(rem));
      return parts.join(' ');
    }
    const toThree = x => {
      if (x === 0) return '';
      const h = Math.floor(x/100), r = x%100;
      return (h ? ones[h] + ' Hundred' + (r?' ':'') : '') + (r < 20 ? ones[r] : tens[Math.floor(r/10)] + (r%10?' '+ones[r%10]:''));
    };
    const bill = Math.floor(num / 1000000000);
    const mill = Math.floor((num % 1000000000) / 1000000);
    const thou = Math.floor((num % 1000000) / 1000);
    const rem  = num % 1000;
    const parts = [];
    if (bill) parts.push(toThree(bill) + ' Billion');
    if (mill) parts.push(toThree(mill) + ' Million');
    if (thou) parts.push(toThree(thou) + ' Thousand');
    if (rem)  parts.push(toThree(rem));
    return parts.join(' ') || 'Zero';
  },
  showWords(inputEl, currency) {
    if (!inputEl) return;
    const hintId = inputEl.id + '-words';
    let hint = document.getElementById(hintId);
    if (!hint) {
      hint = document.createElement('div');
      hint.id = hintId;
      hint.style.cssText = 'font-size:10px;color:var(--text3);margin-top:2px;min-height:14px;font-style:italic;transition:opacity .2s';
      inputEl.parentNode && inputEl.parentNode.insertBefore(hint, inputEl.nextSibling);
    }
    const num = parseFloat((inputEl.value || '').replace(/,/g,''));
    hint.textContent = num > 0 ? U.numInWords(num, currency) : '';
  }
};

function entityDefaults(country) {
  const now = new Date().toISOString();
  return { ownerId: 'self', owners: ['self'], country: country || (S.user && S.user.country) || 'PK', tags: [], createdAt: now, updatedAt: now };
}
window.entityDefaults = entityDefaults;

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
    }).join('') : '<div style="grid-column:1/-1;text-align:center;padding:16px 8px"><div style="font-size:13px;color:var(--text2);margin-bottom:12px">No money modules enabled.</div><button class="btn btn-p btn-sm" onclick="document.getElementById(\'moneySheet\')?.remove();R.goto(\'settings\');setTimeout(function(){SettingsNav.show(\'modules\')},80)">Enable in Settings →</button></div>') +
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
    }).join('') : '<div style="grid-column:1/-1;text-align:center;padding:16px 8px"><div style="font-size:13px;color:var(--text2);margin-bottom:12px">No asset modules enabled.</div><button class="btn btn-p btn-sm" onclick="document.getElementById(\'assetsSheet\')?.remove();R.goto(\'settings\');setTimeout(function(){SettingsNav.show(\'modules\')},80)">Enable in Settings →</button></div>') +
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
    }).join('') : '<div style="grid-column:1/-1;text-align:center;padding:16px 8px"><div style="font-size:13px;color:var(--text2);margin-bottom:12px">No identity modules enabled.</div><button class="btn btn-p btn-sm" onclick="document.getElementById(\'identitySheet\')?.remove();R.goto(\'settings\');setTimeout(function(){SettingsNav.show(\'modules\')},80)">Enable in Settings →</button></div>') +
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
    '<button onclick="document.getElementById(\'moreOverlay\')?.remove()" style="background:none;border:none;color:var(--text3);font-size:26px;cursor:pointer;touch-action:manipulation;line-height:1">×</button>' +
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
  const navKey = active.map(m => m.id).sort().join(',') + '|' + (S.user?.country || '') + '|' + VER;
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

  let sbHTML = `<div class="ni${S.currentPage === 'dashboard' ? ' on' : ''}" data-pg="dashboard"><span class="ni-ic">📊</span><span class="ni-txt">Dashboard</span></div>`;
  Object.entries(groups).forEach(([grp, label]) => {
    if (!grouped[grp] || !grouped[grp].length) return;
    sbHTML += `<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text3);padding:12px 14px 4px">${label}</div>`;
    sbHTML += grouped[grp].filter(m => !!document.getElementById('pg-' + m.id)).map(m =>
      `<div class="ni${S.currentPage === m.id ? ' on' : ''}" data-pg="${m.id}"><span class="ni-ic">${m.ic}</span><span class="ni-txt">${m.n}</span></div>`
    ).join('');
  });
  sbHTML += `<div style="height:1px;background:var(--border);margin:8px 14px"></div>`;
  const activeModIds = new Set(active.map(m => m.id));
  sbHTML += extras.filter(m => !activeModIds.has(m.id)).map(m =>
    `<div class="ni${S.currentPage === m.id ? ' on' : ''}" data-pg="${m.id}"><span class="ni-ic">${m.ic}</span><span class="ni-txt">${m.n}</span></div>`
  ).join('');
  document.getElementById('sbNav').innerHTML = sbHTML;

  const nameEl = document.getElementById('sbUser');
  if (nameEl) nameEl.textContent = (S.user.name || 'User') + ' · v' + VER;

  const moneyPages = new Set(['banks','cards','cash','investments','loans','expenses','bc','bonds']);
  const assetsPages = new Set(['assets','vehicles','gadgets']);
  const identityPages = new Set(['documents','sims','emails','digital','friends']);

  document.getElementById('btabs').innerHTML =
    `<div class="ti${S.currentPage === 'dashboard' ? ' on' : ''}" data-pg="dashboard"><div class="ti-ic">🏠</div><span>Home</span></div>` +
    `<div class="ti${moneyPages.has(S.currentPage) ? ' on' : ''}" onclick="openMoneySheet()"><div class="ti-ic">💰</div><span>Money</span></div>` +
    `<div class="ti${assetsPages.has(S.currentPage) ? ' on' : ''}" onclick="openAssetsSheet()"><div class="ti-ic">🏠</div><span>Assets</span></div>` +
    `<div class="ti${identityPages.has(S.currentPage) ? ' on' : ''}" onclick="openIdentitySheet()"><div class="ti-ic">🪪</div><span>Identity</span></div>` +
    `<div class="ti" onclick="openMore()"><div class="ti-ic">⋯</div><span>More</span></div>`;

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
const SmartAdd = {
  open() {
    Modal.open('✨ Smart Add', `
      <p style="font-size:12px;color:var(--text2);margin-bottom:14px;line-height:1.6">Describe what to add in plain English. VaultCap detects the type and pre-fills the form — works offline, no AI needed.</p>
      <div class="fg">
        <label class="fl">What do you want to add?</label>
        <textarea class="inp" id="sa-text" rows="4" placeholder="Chase account USD 12,500 balance&#10;Lent $500 to Ahmed, due June 2026&#10;Netflix $17.99 monthly&#10;Vodafone SIM +44 7700 900123" style="font-size:13px;line-height:1.6"></textarea>
      </div>
      <div style="font-size:11px;color:var(--text3);margin-top:8px;line-height:1.5">Examples: bank + balance · card + last 4 · loan to someone · subscription · SIM number</div>
    `, `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" id="sa-run-btn" onclick="SmartAdd.run()">✨ Detect &amp; Pre-fill</button>`);
    setTimeout(() => document.getElementById('sa-text')?.focus(), 120);
  },

  async run() {
    const text = (document.getElementById('sa-text')?.value || '').trim();
    if (!text) { Toast.show('Describe what you want to add', 'warning'); return; }
    const btn = document.getElementById('sa-run-btn');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Detecting...'; }

    let parsed = null;
    if (typeof LlmAssist !== 'undefined' && LlmAssist.getConfig().enabled) {
      parsed = await LlmAssist.parseOne(text);
    }
    if (!parsed) {
      parsed = (typeof SmartParser !== 'undefined' ? SmartParser.parseOne(text) : null)
        || (typeof AIImport !== 'undefined' && AIImport.parse ? (() => { const items = AIImport.parse(text); return items.length ? { module: items[0].type === 'expense' ? 'expense' : items[0].type, fields: items[0].data } : null; })() : null);
    }

    if (btn) { btn.disabled = false; btn.textContent = '✨ Detect & Pre-fill'; }

    if (parsed && parsed.module) {
      Modal.close();
      if (navigator.vibrate) navigator.vibrate(30);
      this._dispatch(parsed.module, parsed.fields || {});
      Toast.show('Detected — review and save', 'success', 3000);
    } else {
      Toast.show('Could not detect — try: bank name + amount, or "lent $X to Name"', 'warning', 4500);
    }
  },

  _dispatch(module, f) {
    if (!module) { Toast.show('Smart Add: could not detect module type', 'warning'); return; }
    const delay = 220;
    switch (module) {
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
        Toast.show(`Smart Add detected "${module}" — open the form manually`, 'info', 4000);
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
    {icon:'✨',label:'Smart Add',action:()=>SmartAdd.open()},
    {icon:'🏦',label:'Add Bank',action:()=>Banks.openAdd()},
    {icon:'💳',label:'Add Card',action:()=>Cards.openAdd()},
    {icon:'📈',label:'Add Investment',action:()=>Inv.openAdd()},
    {icon:'💵',label:'Add Cash',action:()=>Cash.openAdd()},
    {icon:'🤝',label:'Add Loan',action:()=>Loans.openAdd()},
    {icon:'📱',label:'Add SIM',action:()=>Sims.openAdd()},
    {icon:'🏠',label:'Add Asset',action:()=>Assets.openAdd()},
    {icon:'📋',label:'Add Expense',action:()=>Exp.openAdd()},
    {icon:'📧',label:'Add Email',action:()=>Emails.openAdd()},
    {icon:'💻',label:'Add Device',action:()=>Assets.openAdd('electronics')},
    {icon:'💼',label:'Add Login',action:()=>Digital.openAdd()},
    {icon:'🪪',label:'Add Document',action:()=>DocsModule.openAdd()},
    {icon:'📊',label:'Dashboard',action:()=>R.goto('dashboard')},
    {icon:'⚙️',label:'Settings',action:()=>R.goto('settings')},
    {icon:'🔒',label:'Lock Vault',action:()=>R.lock()},
    {icon:'🚨',label:'Panic Lock',action:()=>PanicLock.trigger()},
    {icon:'🎨',label:'Dark mode',action:()=>ThemeEngine.apply('dark')},
    {icon:'🎨',label:'Light mode',action:()=>ThemeEngine.apply('light')},
    {icon:'🎨',label:'System appearance',action:()=>ThemeEngine.apply('auto')},
    {icon:'🎨',label:'Appearance',action:()=>ThemeEngine.openPicker()},
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
        { cat:'Add Entry', items:[['🏦','Add Bank',()=>Banks.openAdd()],['💳','Add Card',()=>Cards.openAdd()],['📈','Add Investment',()=>Inv.openAdd()],['📱','Add SIM',()=>Sims.openAdd()],['🏠','Add Asset',()=>Assets.openAdd()],['📋','Add Expense',()=>Exp.openAdd()],['📧','Add Email',()=>Emails.openAdd()],['💻','Add Device',()=>Assets.openAdd('electronics')],['💼','Add Login',()=>Digital.openAdd()]] },
        { cat:'Vault Actions', items:[['🎨','Appearance',()=>ThemeEngine.openPicker()],['📤','Export Encrypted Vault',()=>ExIm.export('vault')],['📸','Net Worth Snapshot',()=>Dash.snap()],['👝','Edit Wallet',()=>Dash.editWallet()],['🙈','Toggle Privacy Mode',()=>togglePrivacy()],['🔒','Lock Vault',()=>R.lock()],['🚨','Panic Lock',()=>PanicLock.trigger()]] },
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
const WorkspaceManager = {
  render() {
    const el = document.getElementById('workspaceBody');
    if (!el) return;
    const presets = Object.entries(WORKSPACE_PRESETS);
    const current = S.workspace || 'default';
    el.innerHTML = `<div style="font-size:11px;color:var(--text3);padding:0 0 12px;font-weight:600;text-transform:uppercase;letter-spacing:.06em">Switch between pre-configured module layouts</div>` +
      presets.map(([id, p]) => `
        <div class="entry" style="${current===id?'border-left:3px solid var(--accent)':''}" onclick="WorkspaceManager.apply('${id}')">
          <div class="entry-main">
            <div class="entry-ic">${p.ic}</div>
            <div class="entry-body">
              <div class="entry-name">${p.name}</div>
              <div class="entry-sub">${p.desc}</div>
            </div>
            ${current===id?'<span class="badge b-ok">Active</span>':''}
          </div>
        </div>`).join('');
  },
  apply(id) {
    const preset = WORKSPACE_PRESETS[id];
    if (!preset) return;
    S.workspace = id;
    Object.assign(S.modules, preset.modules);
    Store.save();
    buildNav();
    this.render();
    Toast.show(`Workspace: ${preset.name}`, 'success');
  },
};

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
function applyDecoyUnlock(decoyData) {
  S.decoy = true;
  S.fails = 0;
  S.lockedUntil = 0;
  try { sessionStorage.removeItem('vos_fails'); localStorage.removeItem('vos_fails'); } catch(e) {}
  const hasCustomVault = decoyData && !decoyData._decoy &&
    ((decoyData.banks && decoyData.banks.length) || (decoyData.cards && decoyData.cards.length) ||
     (decoyData.documents && decoyData.documents.length));
  if (hasCustomVault) {
    Object.assign(S, decoyData);
    S.decoy = true;
    Activity.log('Vault unlocked (decoy)');
    Store.save();
    R.unlock();
    return;
  }
  loadDecoyData();
  R.unlock();
}

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
  const id = U.id;
  const ts = new Date().toISOString();
  const now = new Date();
  const daysAgo = d => new Date(now - d*86400000).toISOString().split('T')[0];
  const daysFromNow = d => new Date(now.getTime() + d*86400000).toISOString().split('T')[0];

  // Reset all arrays
  ['banks','cards','investments','cash','loans','friends','sims','assets','expenses','emails','gadgets','digital','vehicles','documents','bc','bonds'].forEach(k => { S[k]=[]; });

  // ── Alex Khan — UK-based Pakistani professional (full demo) ──
  S.user.name = 'Alex Khan';
  S.user.currency = 'GBP';
  S.user.avatar = '👨‍💼';
  S.user.theme = 'dark';
  S.user.email = 'alex.khan@gmail.com';
  S.user.phone = '+44 7700 123456';
  S.user.dob = '1988-04-15';
  S.user.nwHistory = [
    {v:42000,d:'2025-12-01'},{v:44500,d:'2026-01-01'},{v:43800,d:'2026-02-01'},
    {v:46200,d:'2026-03-01'},{v:47800,d:'2026-04-01'},{v:51200,d:'2026-05-01'}
  ];

  // Banks (6)
  S.banks.push({id:id(),bankName:'Barclays',country:'GB',bankType:'commercial',accountType:'Current',currency:'GBP',last4:'4821',balance:8450,holderName:'Alex Khan',tags:['Primary','UK'],favorite:true,createdAt:ts});
  S.banks.push({id:id(),bankName:'Monzo',country:'GB',bankType:'digital',accountType:'Current',currency:'GBP',last4:'7732',balance:3120,holderName:'Alex Khan',tags:['Digital'],createdAt:ts});
  S.banks.push({id:id(),bankName:'Lloyds Bank',country:'GB',bankType:'commercial',accountType:'Savings',currency:'GBP',last4:'5519',balance:22000,holderName:'Alex Khan',tags:['Savings'],createdAt:ts});
  S.banks.push({id:id(),bankName:'HBL',country:'PK',bankType:'commercial',accountType:'Current',currency:'PKR',last4:'3310',balance:680000,holderName:'Alex Khan',tags:['Pakistan','Family'],createdAt:ts});
  S.banks.push({id:id(),bankName:'MCB Bank',country:'PK',bankType:'commercial',accountType:'Savings',currency:'PKR',last4:'9901',balance:1250000,holderName:'Alex Khan',tags:['Pakistan','Savings'],createdAt:ts});
  S.banks.push({id:id(),bankName:'Emirates NBD',country:'AE',bankType:'commercial',accountType:'Savings',currency:'AED',last4:'6644',balance:18500,holderName:'Alex Khan',tags:['UAE'],createdAt:ts});

  // Cards (5)
  S.cards.push({id:id(),cardName:'Barclays Visa Debit',network:'Visa',cardType:'Debit',category:'Standard',country:'GB',last4:'4821',expiry:'09/28',holderName:'ALEX KHAN',currency:'GBP',createdAt:ts});
  S.cards.push({id:id(),cardName:'Barclaycard Avios Mastercard',network:'Mastercard',cardType:'Credit',category:'Rewards',country:'GB',last4:'3391',expiry:'04/27',holderName:'ALEX KHAN',currency:'GBP',creditLimit:8000,createdAt:ts});
  S.cards.push({id:id(),cardName:'Monzo Visa Debit',network:'Visa',cardType:'Debit',category:'Digital',country:'GB',last4:'7732',expiry:'11/28',holderName:'ALEX KHAN',currency:'GBP',createdAt:ts});
  S.cards.push({id:id(),cardName:'HBL Visa Debit',network:'Visa',cardType:'Debit',category:'Standard',country:'PK',last4:'3310',expiry:'07/27',holderName:'ALEX KHAN',currency:'PKR',createdAt:ts});
  S.cards.push({id:id(),cardName:'Lloyds Platinum Mastercard',network:'Mastercard',cardType:'Credit',category:'Premium',country:'GB',last4:'5519',expiry:'02/29',holderName:'ALEX KHAN',currency:'GBP',creditLimit:12000,createdAt:ts});

  // Cash (3)
  S.cash.push({id:id(),label:'Home Safe',location:'Home',amount:15000,currency:'PKR',notes:'Emergency PKR',createdAt:ts});
  S.cash.push({id:id(),label:'Wallet',location:'Wallet',amount:180,currency:'GBP',createdAt:ts});
  S.cash.push({id:id(),label:'Office Drawer',location:'Office',amount:25000,currency:'PKR',createdAt:ts});

  // Investments (6)
  S.investments.push({id:id(),investmentName:'Vanguard S&P 500 ETF',broker:'Hargreaves Lansdown',type:'Stocks',ticker:'VUSA',country:'GB',currency:'GBP',amountInvested:12000,currentValue:15840,riskLevel:'Medium',ownership:'personal',tags:['ISA','Index'],createdAt:ts});
  S.investments.push({id:id(),investmentName:'Bitcoin',broker:'Coinbase',type:'Crypto',ticker:'BTC',country:'GB',currency:'USD',amountInvested:3500,currentValue:6720,riskLevel:'High',ownership:'personal',tags:['Crypto'],createdAt:ts});
  S.investments.push({id:id(),investmentName:'Meezan Islamic Fund',broker:'Al Meezan Investments',type:'Mutual Funds',country:'PK',currency:'PKR',amountInvested:500000,currentValue:578000,riskLevel:'Low',ownership:'personal',tags:['Islamic'],createdAt:ts});
  S.investments.push({id:id(),investmentName:'UK Premium Bonds',broker:'NS&I',type:'Bonds',country:'GB',currency:'GBP',amountInvested:5000,currentValue:5000,riskLevel:'Low',ownership:'personal',tags:['NSANDI'],createdAt:ts});
  S.investments.push({id:id(),investmentName:'Tesla Inc',broker:'Trading 212',type:'Stocks',ticker:'TSLA',country:'GB',currency:'GBP',amountInvested:2200,currentValue:1980,riskLevel:'High',ownership:'personal',tags:['GIA'],createdAt:ts});
  S.investments.push({id:id(),investmentName:'iShares Gold ETF',broker:'Hargreaves Lansdown',type:'Stocks',ticker:'SGLN',country:'GB',currency:'GBP',amountInvested:3000,currentValue:3510,riskLevel:'Low',ownership:'personal',tags:['Commodities','ISA'],createdAt:ts});

  // Loans (4: 2 lent, 2 borrowed)
  S.loans.push({id:id(),person:'Usman Malik',type:'lent',amount:2500,currency:'GBP',status:'Active',date:'2025-09-10',dueDate:'2026-09-10',notes:'For car repairs',createdAt:ts});
  S.loans.push({id:id(),person:'Tariq (Brother)',type:'lent',amount:350000,currency:'PKR',status:'Active',date:'2025-06-01',dueDate:'2026-06-01',notes:'Business loan',createdAt:ts});
  S.loans.push({id:id(),person:'Barclays Mortgage',type:'borrowed',amount:185000,currency:'GBP',status:'Active',date:'2021-03-15',dueDate:'2046-03-15',notes:'Home mortgage — monthly £920',createdAt:ts});
  S.loans.push({id:id(),person:'HSBC Personal Loan',type:'borrowed',amount:8000,currency:'GBP',status:'Active',date:'2024-07-01',dueDate:'2027-07-01',notes:'Home renovation — £250/month',createdAt:ts});

  // Documents (5) — mix of expiring and not
  S.documents.push({id:id(),docType:'passport',docNumber:'P12345678',issuingCountry:'United Kingdom',nationality:'British',holderName:'Alex Khan',dob:'1988-04-15',issueDate:'2019-06-10',expiryDate:'2029-06-10',storageLocation:'Home safe',notes:'',tags:[],frontPhoto:'',backPhoto:'',createdAt:ts});
  S.documents.push({id:id(),docType:'nic',docNumber:'42301-7890123-4',issuingCountry:'Pakistan',holderName:'Alex Khan',dob:'1988-04-15',issueDate:'2018-03-01',expiryDate:daysFromNow(43),storageLocation:'Wallet',notes:'Expiring soon — renew at NADRA',tags:['urgent'],frontPhoto:'',backPhoto:'',createdAt:ts});
  S.documents.push({id:id(),docType:'driving_license',docNumber:'KHANA880415AX9XM',issuingCountry:'United Kingdom',holderName:'Alex Khan',dob:'1988-04-15',issueDate:'2010-05-20',expiryDate:'2030-04-15',vehicleCategories:'B',storageLocation:'Wallet',notes:'',tags:[],frontPhoto:'',backPhoto:'',createdAt:ts});
  S.documents.push({id:id(),docType:'visa',docNumber:'GBR-2024-78923',visaType:'Indefinite Leave to Remain',issuingCountry:'United Kingdom',holderName:'Alex Khan',issueDate:'2020-01-15',expiryDate:'',validEntries:'ILR — no expiry',linkedPassportNum:'P12345678',storageLocation:'Home safe',notes:'',tags:['ILR'],frontPhoto:'',backPhoto:'',createdAt:ts});
  S.documents.push({id:id(),docType:'nic',docNumber:'NI WC 12 34 56 A',issuingCountry:'United Kingdom',holderName:'Alex Khan',dob:'1988-04-15',issueDate:'2006-09-01',expiryDate:'',storageLocation:'Home safe',notes:'National Insurance card',tags:['NI'],frontPhoto:'',backPhoto:'',createdAt:ts});

  // Assets (3)
  S.assets.push({id:id(),name:'London Flat — East Ham',assetType:'property',currentValue:340000,currency:'GBP',purchasePrice:265000,purchaseDate:'2021-03-15',notes:'Primary residence. 2BR flat.',createdAt:ts});
  S.assets.push({id:id(),name:'Toyota Hilux (2022)',assetType:'vehicle',currentValue:22000,currency:'GBP',purchasePrice:28000,notes:'Paid off in 2025.',createdAt:ts});
  S.assets.push({id:id(),name:'MacBook Pro 16" M4',assetType:'gadget',currentValue:2800,currency:'GBP',purchasePrice:3499,notes:'Work machine.',createdAt:ts});

  // Vehicles (1) — MOT due in 60 days
  S.vehicles.push({id:id(),make:'Toyota',model:'Hilux',year:'2022',regPlate:'EH22 KHN',fuel:'Diesel',mileage:38000,motExpiry:daysFromNow(60),taxExpiry:daysFromNow(28),insuranceExpiry:daysFromNow(92),insuranceProvider:'Admiral',createdAt:ts});

  // SIMs (2)
  S.sims.push({id:id(),network:'O2',country:'GB',simType:'Physical',status:'Active',phone:'+44 7700 123456',dataPlan:30,planType:'Monthly',createdAt:ts});
  S.sims.push({id:id(),network:'Jazz',country:'PK',simType:'Physical',status:'Active',phone:'+92 300 1234567',dataPlan:10,planType:'Monthly',createdAt:ts});

  // Expenses (4)
  S.expenses.push({id:id(),name:'Netflix',amount:17.99,currency:'GBP',category:'Streaming',frequency:'monthly',active:true,createdAt:ts});
  S.expenses.push({id:id(),name:'PureGym',amount:22.99,currency:'GBP',category:'Fitness',frequency:'monthly',active:true,createdAt:ts});
  S.expenses.push({id:id(),name:'Council Tax',amount:142,currency:'GBP',category:'Housing',frequency:'monthly',active:true,createdAt:ts});
  S.expenses.push({id:id(),name:'O2 Phone Bill',amount:35,currency:'GBP',category:'Telecom',frequency:'monthly',active:true,createdAt:ts});

  // Friends (3)
  S.friends.push({id:id(),name:'Usman Malik',phone:'+44 7700 987654',notes:'Old uni friend, Manchester',createdAt:ts});
  S.friends.push({id:id(),name:'Tariq Khan',phone:'+92 321 9876543',notes:'Brother — in Lahore',createdAt:ts});
  S.friends.push({id:id(),name:'Sophie Williams',phone:'+44 7800 234567',notes:'Work colleague',createdAt:ts});

  // BC / Committees (2)
  S.bc.push({id:id(),name:'Family BC 2026',role:'participant',type:'ballot',members:10,contribution:10000,currency:'PKR',frequency:'monthly',totalRounds:10,myTurnRound:7,currentRound:4,startDate:'2026-01-01',paymentDay:5,organiser:'Ammi',notes:'Family rotating committee',memberList:[],paymentHistory:[],createdAt:ts,updatedAt:ts});
  S.bc.push({id:id(),name:'Office Pardner',role:'participant',type:'ballot',members:6,contribution:200,currency:'GBP',frequency:'monthly',totalRounds:6,myTurnRound:3,currentRound:2,startDate:'2026-04-01',paymentDay:1,organiser:'James (PM)',notes:'Office savings committee',memberList:[],paymentHistory:[],createdAt:ts,updatedAt:ts});

  // Prize Bonds (2)
  S.bonds.push({id:id(),name:'Prize Bond PKR 7500',typeId:'prize_bond',quantity:5,faceValue:7500,amount:7500,currency:'PKR',country:'PK',purchaseDate:'2025-01-10',maturityDate:'',annualRate:0,bondNumbers:['PB-001234','PB-001235','PB-001236','PB-001237','PB-001238'],notes:'Bought in Lahore',createdAt:ts,updatedAt:ts});
  S.bonds.push({id:id(),name:'UK Premium Bonds',typeId:'premium_bonds',quantity:500,faceValue:1,amount:1,currency:'GBP',country:'GB',purchaseDate:'2023-06-01',maturityDate:'',annualRate:0,bondNumbers:[],notes:'NS&I — eligible for monthly prize draw',createdAt:ts,updatedAt:ts});

  // Emails (2)
  S.emails.push({id:id(),email:'alex.khan@gmail.com',provider:'Gmail',purpose:'Personal',mfaEnabled:true,recoveryEmail:'tariq.khan@gmail.com',createdAt:ts});
  S.emails.push({id:id(),email:'a.khan@techcorp.co.uk',provider:'Microsoft 365',purpose:'Work',mfaEnabled:true,createdAt:ts});

  // Gadgets (2)
  S.gadgets.push({id:id(),name:'MacBook Pro 16" M4 Max',brand:'Apple',category:'Laptop',serialNum:'C02Z9ABCDE12',purchasePrice:3499,currency:'GBP',warranty:'2027-01',purchaseDate:'2025-01-15',insured:true,createdAt:ts});
  S.gadgets.push({id:id(),name:'iPhone 16 Pro Max',brand:'Apple',category:'Phone',serialNum:'F7X8K9M2P5',purchasePrice:1199,currency:'GBP',warranty:'2026-10',purchaseDate:'2024-10-05',insured:true,createdAt:ts});

  // Digital logins (2)
  S.digital.push({id:id(),serviceName:'LinkedIn',username:'alexkhan88',url:'linkedin.com',category:'Professional',mfaEnabled:true,passwordStrength:'strong',createdAt:ts});
  S.digital.push({id:id(),serviceName:'Barclays Online Banking',username:'alexkhan',url:'barclays.co.uk',category:'Banking',mfaEnabled:true,passwordStrength:'strong',createdAt:ts});

  // Precious metals demo (encrypted vault)
  S.assets.push(
    {id:id(),assetType:'precious_metals',name:'Gold Jewellery Set',metal:'gold',weight:5,unit:'tola',purity:'22k',notes:'Wife\'s jewellery',createdAt:ts,updatedAt:ts},
    {id:id(),assetType:'precious_metals',name:'Gold Bars',metal:'gold',weight:10,unit:'tola',purity:'24k',notes:'Investment — stored at home',createdAt:ts,updatedAt:ts}
  );
  if (typeof VaultMeta !== 'undefined') {
    VaultMeta.set('creditScore', {
      score:742,agency:'Experian',lastChecked:daysAgo(45),
      history:[{score:698,date:'2025-09-01'},{score:715,date:'2025-12-01'},{score:742,date:'2026-03-01'}]
    });
    VaultMeta.set('zakatState', { nisabType:'silver',hawlDate:daysAgo(250),includeJewellery:true,mode:'personal' });
  }

  S.user.netWorth = 0;
  Store.save();
  if (S.unlocked) { buildNav(); R.goto('dashboard'); }
}



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

function applyReduceMotion(on) {
  S.reduceMotion = !!on;
  document.body.classList.toggle('reduce-motion', S.reduceMotion);
  Store.save();
}
window.applyReduceMotion = applyReduceMotion;

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

  // Restore brute-force state from sessionStorage (pre-unlock — not bypassable via localStorage clear)
  try {
    const raw = sessionStorage.getItem('vos_fails') || localStorage.getItem('vos_fails');
    const fc = JSON.parse(raw || 'null');
    if (fc) {
      S.fails = fc.fails || 0;
      S.lockedUntil = fc.lockedUntil || 0;
      if (sessionStorage.getItem('vos_fails') == null) {
        sessionStorage.setItem('vos_fails', JSON.stringify({ fails: S.fails, lockedUntil: S.lockedUntil }));
        localStorage.removeItem('vos_fails');
      }
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

  if (!hasData || !(prefs?.hasVault || oldData?.user?.name)) {
    document.getElementById('pgOnboard').style.display = 'flex';
    OB.init();
  } else {
    R.showHome();
  }
}

App();
