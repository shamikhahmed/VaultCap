'use strict';
/* VaultOS Family Vault — members stored in S.family (VaultDB encrypted)
 * Each member has: id, name, avatar, relation, dob, phone, email, notes
 * Plus entity arrays: banks[], cards[], docs[], cash[]
 * All entities stamped with ownerId = member.id
 */

const Family = {
  _memberIdx: null,
  _tab: 'overview',

  // ── Data access via VaultDB S.family ──────────────────────────────────────
  get() {
    if (typeof S !== 'undefined' && S.family) return S.family;
    try { return JSON.parse(localStorage.getItem('vo_family') || '{"head":null,"members":[]}'); }
    catch(e) { return { head: null, members: [] }; }
  },

  save(d) {
    if (typeof S !== 'undefined') {
      S.family = d;
      if (typeof Store !== 'undefined') Store.save();
    } else {
      try { localStorage.setItem('vo_family', JSON.stringify(d)); } catch(e) {}
    }
  },

  _member() {
    const d = this.get();
    if (this._memberIdx === 'head') return d.head || {};
    return (d.members || [])[this._memberIdx] || {};
  },

  _memberId() {
    return this._member().id || this._memberIdx;
  },

  // ── Render ─────────────────────────────────────────────────────────────────
  render() {
    const body = document.getElementById('pg-family-body');
    if (!body) return;
    if (this._memberIdx !== null) { this._renderMember(body); return; }
    this._renderList(body);
  },

  _renderList(body) {
    const d = this.get();
    const members = d.members || [];

    const headCard = d.head
      ? `<div onclick="Family.openMember('head')" style="background:linear-gradient(135deg,rgba(123,95,255,.25),rgba(0,213,255,.15));border:1px solid rgba(123,95,255,.5);border-radius:20px;padding:20px;cursor:pointer;touch-action:manipulation;position:relative;overflow:hidden;margin-bottom:12px">
          <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--accent),#00D5FF)"></div>
          <div style="position:absolute;top:10px;right:12px;font-size:10px;background:rgba(123,95,255,.4);color:#fff;padding:3px 8px;border-radius:8px;font-weight:700">HEAD 👑</div>
          <div style="display:flex;align-items:center;gap:14px;margin-top:6px">
            <div style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,rgba(123,95,255,.8),rgba(0,213,255,.6));display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0">${escHtml(d.head.avatar||'👤')}</div>
            <div>
              <div style="font-size:17px;font-weight:800;color:var(--text)">${escHtml(d.head.name||'Head of Family')}</div>
              <div style="font-size:12px;color:var(--text3);margin-top:2px">${(d.head.banks||[]).length} banks · ${(d.head.cards||[]).length} cards · ${(d.head.docs||[]).length} docs</div>
            </div>
          </div>
        </div>`
      : `<div onclick="Family.openSetHead()" style="background:rgba(123,95,255,.08);border:2px dashed rgba(123,95,255,.3);border-radius:20px;padding:24px;text-align:center;cursor:pointer;touch-action:manipulation;margin-bottom:12px">
          <div style="font-size:32px;margin-bottom:8px">👑</div>
          <div style="font-size:15px;font-weight:700;color:var(--text)">Set Head of Family</div>
          <div style="font-size:13px;color:var(--text3);margin-top:4px">Tap to set up your own family vault profile</div>
        </div>`;

    const memberCards = members.map((m, i) =>
      `<div onclick="Family.openMember(${i})" style="background:var(--glass);border:1px solid var(--border);border-radius:16px;padding:16px;margin-bottom:10px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:14px">
        <div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,rgba(123,95,255,.3),rgba(0,213,255,.2));display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0">${escHtml(m.avatar||'👤')}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:15px;font-weight:700;color:var(--text)">${escHtml(m.name||'Member')}</div>
          <div style="font-size:12px;color:var(--text3);margin-top:2px">${escHtml(m.relation||'')} · ${(m.banks||[]).length} banks · ${(m.cards||[]).length} cards · ${(m.docs||[]).length} docs</div>
        </div>
        <div style="color:var(--text3);font-size:20px">›</div>
      </div>`
    ).join('');

    body.innerHTML =
      `<div style="padding:16px">
        ${headCard}
        <div style="display:flex;align-items:center;justify-content:space-between;margin:16px 0 10px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text3)">Family Members</div>
          <button onclick="Family.openAddMember()" style="background:var(--accent);color:#fff;border:none;border-radius:20px;padding:7px 16px;font-size:13px;font-weight:700;cursor:pointer;touch-action:manipulation">+ Add</button>
        </div>
        ${members.length ? memberCards : '<div style="text-align:center;padding:32px 20px;color:var(--text3)"><div style="font-size:40px;margin-bottom:10px">👨‍👩‍👧‍👦</div><div style="font-size:14px">Add family members to manage their finances</div></div>'}
      </div>`;
  },

  _renderMember(body) {
    const m = this._member();
    if (!m || !m.name) { this._memberIdx = null; this.render(); return; }

    const tabs = [
      { id:'overview', label:'Overview', icon:'📊' },
      { id:'banks',    label:'Banks',    icon:'🏦' },
      { id:'cards',    label:'Cards',    icon:'💳' },
      { id:'docs',     label:'Docs',     icon:'🪪' },
      { id:'cash',     label:'Cash',     icon:'💵' },
    ];

    const tabBar = `<div style="display:flex;gap:6px;padding:12px 16px 0;overflow-x:auto;scrollbar-width:none;background:var(--bg2);border-bottom:1px solid var(--border)">
      ${tabs.map(t => `<button onclick="Family._switchTab('${t.id}')" style="flex-shrink:0;padding:8px 14px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation;white-space:nowrap;border:1px solid ${this._tab===t.id?'var(--accent)':'var(--border)'};background:${this._tab===t.id?'var(--accent)':'transparent'};color:${this._tab===t.id?'#fff':'var(--text3)'}">${t.icon} ${t.label}</button>`).join('')}
    </div>`;

    const isHead = this._memberIdx === 'head';
    const backBtn = `<button onclick="Family._memberIdx=null;Family._tab='overview';Family.render()" style="background:none;border:none;color:var(--accent);font-size:14px;font-weight:600;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:6px;padding:16px 16px 0">← Family</button>`;

    const header = `<div style="display:flex;align-items:center;gap:14px;padding:12px 16px 16px;background:linear-gradient(135deg,rgba(123,95,255,.12),rgba(0,213,255,.06))">
      <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,rgba(123,95,255,.8),rgba(0,213,255,.6));display:flex;align-items:center;justify-content:center;font-size:30px;flex-shrink:0">${escHtml(m.avatar||'👤')}</div>
      <div style="flex:1">
        <div style="font-size:20px;font-weight:900;color:var(--text)">${escHtml(m.name)}${isHead?' 👑':''}</div>
        <div style="font-size:13px;color:var(--text3)">${escHtml(m.relation||'')}${m.dob?' · DOB: '+escHtml(m.dob):''}</div>
      </div>
      <button onclick="Family.editMember()" style="background:rgba(255,255,255,.08);border:1px solid var(--border);border-radius:10px;padding:8px 12px;font-size:12px;cursor:pointer;touch-action:manipulation;color:var(--text)">Edit</button>
    </div>`;

    body.innerHTML = backBtn + header + tabBar + '<div id="fm-tab-body" style="padding:14px 16px">' + this._tabContent(m) + '</div>';
  },

  _switchTab(t) {
    this._tab = t;
    const m = this._member();
    const body = document.getElementById('fm-tab-body');
    if (body && m) body.innerHTML = this._tabContent(m);
    document.querySelectorAll('#pg-family-body button[onclick*="_switchTab"]').forEach(b => {
      const bt = b.getAttribute('onclick').match(/'(\w+)'/)?.[1];
      const active = bt === t;
      b.style.border = '1px solid ' + (active ? 'var(--accent)' : 'var(--border)');
      b.style.background = active ? 'var(--accent)' : 'transparent';
      b.style.color = active ? '#fff' : 'var(--text3)';
    });
  },

  _tabContent(m) {
    if (this._tab === 'overview') {
      const fields = [
        m.phone && ['📞 Phone', escHtml(m.phone)],
        m.email && ['📧 Email', escHtml(m.email)],
        m.notes && ['📝 Notes', escHtml(m.notes)],
      ].filter(Boolean);
      return `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px">
        <div style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px;text-align:center">
          <div style="font-size:22px;font-weight:800;color:var(--text)">${(m.banks||[]).length}</div>
          <div style="font-size:11px;color:var(--text3)">Banks</div>
        </div>
        <div style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px;text-align:center">
          <div style="font-size:22px;font-weight:800;color:var(--text)">${(m.cards||[]).length}</div>
          <div style="font-size:11px;color:var(--text3)">Cards</div>
        </div>
        <div style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px;text-align:center">
          <div style="font-size:22px;font-weight:800;color:var(--text)">${(m.docs||[]).length}</div>
          <div style="font-size:11px;color:var(--text3)">Docs</div>
        </div>
      </div>
      ${fields.map(([k,v]) => `<div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)"><span style="font-size:13px;color:var(--text3);flex-shrink:0;min-width:80px">${k}</span><span style="font-size:13px;color:var(--text);flex:1">${v}</span></div>`).join('')}`;
    }

    if (this._tab === 'banks') {
      const banks = m.banks || [];
      const idx = this._memberIdx;
      return `<button onclick="Family.addEntity('banks')" class="btn btn-p" style="width:100%;margin-bottom:12px">+ Add Bank</button>` +
        (banks.length ? banks.map((b,i) => `<div style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px;margin-bottom:8px;display:flex;align-items:center;gap:12px">
          <div style="font-size:24px">🏦</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:14px;font-weight:700;color:var(--text)">${escHtml(b.bankName||'Bank')}</div>
            <div style="font-size:12px;color:var(--text3)">${escHtml(b.accountType||'')}${b.currency?' · '+escHtml(b.currency):''}${b.balance?' · '+U.fmt(b.balance):''}</div>
          </div>
          <button onclick="Family.delEntity('banks',${i})" style="background:none;border:none;color:var(--err);font-size:16px;cursor:pointer;touch-action:manipulation;padding:4px">🗑️</button>
        </div>`).join('') : '<div style="text-align:center;padding:24px;color:var(--text3)">No banks added</div>');
    }

    if (this._tab === 'cards') {
      const cards = m.cards || [];
      return `<button onclick="Family.addEntity('cards')" class="btn btn-p" style="width:100%;margin-bottom:12px">+ Add Card</button>` +
        (cards.length ? cards.map((c,i) => `<div style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px;margin-bottom:8px;display:flex;align-items:center;gap:12px">
          <div style="font-size:24px">💳</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:14px;font-weight:700;color:var(--text)">${escHtml(c.cardName||'Card')}</div>
            <div style="font-size:12px;color:var(--text3)">${escHtml(c.network||'')}${c.last4?' · **** '+escHtml(c.last4):''}${c.cardType?' · '+escHtml(c.cardType):''}</div>
          </div>
          <button onclick="Family.delEntity('cards',${i})" style="background:none;border:none;color:var(--err);font-size:16px;cursor:pointer;touch-action:manipulation;padding:4px">🗑️</button>
        </div>`).join('') : '<div style="text-align:center;padding:24px;color:var(--text3)">No cards added</div>');
    }

    if (this._tab === 'docs') {
      const docs = m.docs || [];
      return `<button onclick="Family.addEntity('docs')" class="btn btn-p" style="width:100%;margin-bottom:12px">+ Add Document</button>` +
        (docs.length ? docs.map((d,i) => `<div style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px;margin-bottom:8px;display:flex;align-items:center;gap:12px">
          <div style="font-size:24px">🪪</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:14px;font-weight:700;color:var(--text)">${escHtml(d.docType||d.type||'Document')}</div>
            <div style="font-size:12px;color:var(--text3)">${escHtml(d.number||d.docNumber||'')}${d.expiryDate?' · Exp: '+escHtml(d.expiryDate):''}</div>
          </div>
          <button onclick="Family.delEntity('docs',${i})" style="background:none;border:none;color:var(--err);font-size:16px;cursor:pointer;touch-action:manipulation;padding:4px">🗑️</button>
        </div>`).join('') : '<div style="text-align:center;padding:24px;color:var(--text3)">No documents added</div>');
    }

    if (this._tab === 'cash') {
      const cash = m.cash || [];
      return `<button onclick="Family.addEntity('cash')" class="btn btn-p" style="width:100%;margin-bottom:12px">+ Add Cash</button>` +
        (cash.length ? cash.map((c,i) => `<div style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px;margin-bottom:8px;display:flex;align-items:center;gap:12px">
          <div style="font-size:24px">💵</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:14px;font-weight:700;color:var(--text)">${escHtml(c.currency||'PKR')} ${U.fmt(c.amount||0)}</div>
            <div style="font-size:12px;color:var(--text3)">${escHtml(c.location||'Cash')}</div>
          </div>
          <button onclick="Family.delEntity('cash',${i})" style="background:none;border:none;color:var(--err);font-size:16px;cursor:pointer;touch-action:manipulation;padding:4px">🗑️</button>
        </div>`).join('') : '<div style="text-align:center;padding:24px;color:var(--text3)">No cash entries</div>');
    }

    return '';
  },

  // ── Member CRUD ────────────────────────────────────────────────────────────
  openMember(idx) {
    this._memberIdx = idx;
    this._tab = 'overview';
    this.render();
  },

  openSetHead() {
    const d = this.get();
    this._openMemberForm(d.head || {}, true);
  },

  editMember() {
    const m = this._member();
    this._openMemberForm(m, this._memberIdx === 'head');
  },

  _openMemberForm(m, isHead) {
    const avatars = ['👤','👨','👩','👦','👧','👴','👵','👱‍♂️','👱‍♀️','🧑'];
    Modal.open(isHead ? '👑 Head of Family' : (m.name ? '✏️ Edit Member' : '➕ Add Member'),
      `<div style="display:flex;flex-direction:column;gap:10px">
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:4px">${avatars.map(a => `<div onclick="document.querySelectorAll('.fav-av').forEach(x=>{x.style.background='var(--glass)';x.style.border='1px solid var(--border)'});this.style.background='var(--accent)';this.style.border='1px solid var(--accent)';document.getElementById('fav-av').value='${a}'" class="fav-av" style="font-size:24px;padding:6px;border-radius:10px;cursor:pointer;background:${(m.avatar||'👤')===a?'var(--accent)':'var(--glass)'};border:1px solid ${(m.avatar||'👤')===a?'var(--accent)':'var(--border)'}">${a}</div>`).join('')}</div>
        <input type="hidden" id="fav-av" value="${escHtml(m.avatar||'👤')}">
        <div class="fg"><label class="fl">Name *</label><input class="inp" id="fm-name" value="${escHtml(m.name||'')}" placeholder="Full name"></div>
        ${!isHead ? `<div class="fg"><label class="fl">Relationship</label><datalist id="fRelDL"><option>Spouse</option><option>Son</option><option>Daughter</option><option>Father</option><option>Mother</option><option>Brother</option><option>Sister</option><option>Grandparent</option></datalist><input class="inp" id="fm-rel" value="${escHtml(m.relation||'')}" list="fRelDL" placeholder="Spouse, Son, Daughter..."></div>` : ''}
        <div class="fr">
          <div class="fg"><label class="fl">Date of Birth</label><input class="inp" id="fm-dob" type="date" value="${escHtml(m.dob||'')}"></div>
          <div class="fg"><label class="fl">Phone</label><input class="inp" id="fm-phone" value="${escHtml(m.phone||'')}" placeholder="+92..."></div>
        </div>
        <div class="fg"><label class="fl">Email</label><input class="inp" id="fm-email" value="${escHtml(m.email||'')}" placeholder="email@example.com"></div>
        <div class="fg"><label class="fl">Notes</label><textarea class="inp" id="fm-notes" rows="2">${escHtml(m.notes||'')}</textarea></div>
      </div>`,
      `<button class="btn btn-g" onclick="Modal.close()">Cancel</button>` +
      (!isHead && m.name ? `<button class="btn btn-d btn-sm" onclick="Family.deleteMember()">Delete</button>` : '') +
      `<button class="btn btn-p" onclick="Family.saveMember(${isHead})">Save</button>`
    );
  },

  saveMember(isHead) {
    const name = (document.getElementById('fm-name')?.value || '').trim();
    if (!name) { Toast.show('Name required', 'warning'); return; }
    const avatar = document.getElementById('fav-av')?.value || '👤';
    const now = new Date().toISOString();
    const d = this.get();
    const existing = isHead ? (d.head || {}) : ((d.members||[])[this._memberIdx] || {});
    const member = {
      ...existing,
      id: existing.id || U.id(),
      name, avatar,
      relation: isHead ? 'Head of Family' : (document.getElementById('fm-rel')?.value?.trim() || ''),
      dob:   document.getElementById('fm-dob')?.value   || '',
      phone: document.getElementById('fm-phone')?.value?.trim() || '',
      email: document.getElementById('fm-email')?.value?.trim() || '',
      notes: document.getElementById('fm-notes')?.value?.trim() || '',
      updatedAt: now,
      banks: existing.banks || [],
      cards: existing.cards || [],
      docs:  existing.docs  || [],
      cash:  existing.cash  || [],
    };
    if (!member.createdAt) member.createdAt = now;
    if (isHead) {
      d.head = member;
    } else if (typeof this._memberIdx === 'number') {
      d.members[this._memberIdx] = member;
    }
    this.save(d);
    Modal.close();
    this.render();
    Toast.show((isHead ? 'Family head' : 'Member') + ' saved', 'success');
  },

  openAddMember() {
    Modal.open('➕ Add Family Member',
      `<div style="display:flex;flex-direction:column;gap:10px">
        <div class="fg"><label class="fl">Name *</label><input class="inp" id="fm-name" placeholder="Full name"></div>
        <div class="fg"><label class="fl">Relationship</label><datalist id="fRelDL2"><option>Spouse</option><option>Son</option><option>Daughter</option><option>Father</option><option>Mother</option><option>Brother</option><option>Sister</option></datalist><input class="inp" id="fm-rel" list="fRelDL2" placeholder="Spouse, Son..."></div>
        <div class="fr">
          <div class="fg"><label class="fl">Date of Birth</label><input class="inp" id="fm-dob" type="date"></div>
          <div class="fg"><label class="fl">Phone</label><input class="inp" id="fm-phone" placeholder="+92..."></div>
        </div>
        <div class="fg"><label class="fl">Email</label><input class="inp" id="fm-email" placeholder="email@example.com"></div>
      </div>`,
      `<button class="btn btn-g" onclick="Modal.close()">Cancel</button>` +
      `<button class="btn btn-p" onclick="Family._saveNewMember()">Add Member</button>`
    );
  },

  _saveNewMember() {
    const name = (document.getElementById('fm-name')?.value || '').trim();
    if (!name) { Toast.show('Name required', 'warning'); return; }
    const now = new Date().toISOString();
    const d = this.get();
    if (!d.members) d.members = [];
    const member = {
      id: U.id(),
      name,
      avatar: '👤',
      relation: document.getElementById('fm-rel')?.value?.trim() || '',
      dob:   document.getElementById('fm-dob')?.value   || '',
      phone: document.getElementById('fm-phone')?.value?.trim() || '',
      email: document.getElementById('fm-email')?.value?.trim() || '',
      notes: '',
      createdAt: now, updatedAt: now,
      banks: [], cards: [], docs: [], cash: [],
    };
    d.members.push(member);
    this.save(d);
    this._memberIdx = d.members.length - 1;
    this._tab = 'overview';
    Modal.close();
    this.render();
    Toast.show('Member added', 'success');
  },

  deleteMember() {
    if (!window.__vos_confirm('Remove this family member?')) return;
    const d = this.get();
    d.members.splice(this._memberIdx, 1);
    this.save(d);
    this._memberIdx = null;
    Modal.close();
    this.render();
    Toast.show('Member removed', 'success');
  },

  // ── Entity add/delete (banks, cards, docs, cash) ──────────────────────────
  addEntity(type) {
    const m = this._member();
    const ctx = { memberIdx: this._memberIdx, isHead: this._memberIdx === 'head' };
    const prefill = { _ownerName: m.name, _familyCtx: ctx };

    if (type === 'banks') {
      if (typeof Banks !== 'undefined') { Banks.openAdd(prefill); return; }
    } else if (type === 'cards') {
      if (typeof Cards !== 'undefined') { Cards.openAdd(prefill); return; }
    } else if (type === 'docs') {
      if (typeof DocsModule !== 'undefined') { DocsModule.openAdd(prefill); return; }
    } else if (type === 'cash') {
      if (typeof Cash !== 'undefined') { Cash.openAdd(prefill); return; }
    }
  },

  delEntity(type, entityIdx) {
    if (!window.__vos_confirm('Remove this entry?')) return;
    const d = this.get();
    const isHead = this._memberIdx === 'head';
    const m = isHead ? d.head : d.members[this._memberIdx];
    if (!m || !m[type]) return;
    m[type].splice(entityIdx, 1);
    this.save(d);
    this.render();
    Toast.show('Removed', 'success');
  },

  // ── Summary helpers (for dashboard / entity counts) ───────────────────────
  totalNetWorthPKR() {
    const d = this.get();
    const all = [...(d.head ? [d.head] : []), ...(d.members || [])];
    let total = 0;
    all.forEach(m => {
      (m.banks||[]).forEach(b => { total += typeof CurrencyEngine !== 'undefined' ? CurrencyEngine.toBase(b.balance||0, b.currency||'PKR') : (b.balance||0); });
      (m.cash||[]).forEach(c => { total += typeof CurrencyEngine !== 'undefined' ? CurrencyEngine.toBase(c.amount||0, c.currency||'PKR') : (c.amount||0); });
    });
    return total;
  },

  memberCount() {
    const d = this.get();
    return (d.members||[]).length + (d.head ? 1 : 0);
  },
};
window.Family = Family;
