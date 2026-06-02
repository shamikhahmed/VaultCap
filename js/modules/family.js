'use strict';
const Family = {
  _view: 'list',
  _memberIdx: null,
  _tab: 'overview',

  get() { return JSON.parse(localStorage.getItem('vo_family')||'{"head":null,"members":[]}'); },
  save(d) { localStorage.setItem('vo_family',JSON.stringify(d)); },

  render() {
    const body = document.getElementById('pg-family-body');
    if (!body) return;
    this._syncHeadFromVault();
    if (this._view === 'member') { this._renderMember(body); return; }
    this._renderList(body);
  },

  _syncHeadFromVault() {
    if (typeof S === 'undefined' || !S.user?.name) return;
    const d = this.get();
    d.head = {
      name: S.user.name || d.head?.name || '',
      avatar: S.user.avatar || d.head?.avatar || '👤',
      relation: 'Head of Family',
      dob: S.user.dob || d.head?.dob || '',
      phone: S.user.phone || d.head?.phone || '',
      email: S.user.email || d.head?.email || '',
      notes: d.head?.notes || '',
      docs: d.head?.docs || [],
      banks: d.head?.banks || [],
      cards: d.head?.cards || [],
      cash: d.head?.cash || [],
      _liveData: true,
    };
    this.save(d);
  },

  _getMemberData() {
    const d = this.get();
    if (this._memberIdx === 'head') {
      const head = d.head || {};
      return {
        ...head,
        _isVaultOwner: true,
        docs: typeof S !== 'undefined' ? (S.documents || []).map(doc => ({
          type: doc.type || doc.category || 'Document',
          number: doc.number || doc.docNum || '',
          expiry: doc.expiry || doc.expiryDate || '',
          issued: doc.issued || doc.issueDate || '',
          issuer: doc.issuer || doc.issuedBy || '',
          notes: doc.notes || '',
        })) : (head.docs || []),
        banks: typeof S !== 'undefined' ? (S.banks || []).map(b => b.bankName).filter(Boolean) : (head.banks || []),
        cards: typeof S !== 'undefined' ? (S.cards || []).map(c => ({
          name: c.cardName || c.name || '',
          last4: c.last4 || '',
          network: c.network || '',
          type: c.cardType || c.type || 'debit',
        })) : (head.cards || []),
        cash: typeof S !== 'undefined' ? (S.cash || []).map(c => ({
          label: c.label || c.name || 'Cash',
          amount: c.amount || c.balance || 0,
          notes: c.notes || '',
        })) : (head.cash || []),
        investments: typeof S !== 'undefined' ? (S.investments || []).map(inv => ({
          type: inv.type || inv.assetType || 'Investment',
          name: inv.name || inv.ticker || '',
          value: inv.value || inv.currentValue || inv.amount || 0,
        })) : (head.investments || []),
      };
    }
    return d.members[this._memberIdx] || {};
  },

  _renderList(body) {
    const d = this.get();
    body.innerHTML = `
      <div style="padding:16px">
        ${d.head ? this._headCard(d.head) : this._addHeadPrompt()}
        <div style="display:flex;align-items:center;justify-content:space-between;margin:20px 0 12px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text3)">Family Members</div>
          <button onclick="Family.openAddMember()" style="background:rgba(123,95,255,1);color:#fff;border:none;border-radius:20px;padding:8px 18px;font-size:13px;font-weight:700;cursor:pointer;touch-action:manipulation">+ Add</button>
        </div>
        ${d.members.length ? d.members.map((m,i)=>this._memberRow(m,i)).join('') : `
          <div style="text-align:center;padding:40px 20px;color:var(--text3)">
            <div style="font-size:48px;margin-bottom:12px">👨‍👩‍👧‍👦</div>
            <div style="font-size:15px;font-weight:600;color:var(--text2);margin-bottom:6px">No members yet</div>
            <div style="font-size:13px">Add family members to manage their documents, banks and more</div>
          </div>`}
      </div>`;
  },

  _addHeadPrompt() {
    return `<div onclick="Family.openSetHead()" style="background:linear-gradient(135deg,rgba(123,95,255,.2),rgba(0,213,255,.1));border:2px dashed rgba(123,95,255,.4);border-radius:20px;padding:24px;text-align:center;cursor:pointer;touch-action:manipulation">
      <div style="font-size:44px;margin-bottom:10px">👑</div>
      <div style="font-size:16px;font-weight:700;color:var(--text);margin-bottom:4px">Set Head of Family</div>
      <div style="font-size:13px;color:var(--text3)">Tap to set up the family head profile</div>
    </div>`;
  },

  _headCard(head) {
    const stats = [
      head.docs?.length ? head.docs.length+' Docs' : null,
      head.banks?.length ? head.banks.length+' Banks' : null,
      head.cards?.length ? head.cards.length+' Cards' : null,
      head.cash?.length ? head.cash.length+' Cash' : null,
    ].filter(Boolean);
    return `<div onclick="Family.openMember('head')" style="background:linear-gradient(135deg,rgba(123,95,255,.25),rgba(0,213,255,.15));border:1px solid rgba(123,95,255,.5);border-radius:20px;padding:20px;cursor:pointer;touch-action:manipulation;position:relative;overflow:hidden">
      <div style="position:absolute;top:10px;right:12px;font-size:11px;background:rgba(123,95,255,.4);color:#fff;padding:3px 10px;border-radius:10px;font-weight:700">HEAD OF FAMILY 👑</div>
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
        <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,rgba(123,95,255,.8),rgba(0,213,255,.6));display:flex;align-items:center;justify-content:center;font-size:30px;flex-shrink:0;box-shadow:0 4px 20px rgba(123,95,255,.4)">${head.avatar||'👤'}</div>
        <div>
          <div style="font-size:20px;font-weight:900;color:var(--text)">${_fesc(head.name)}</div>
          <div style="font-size:13px;color:var(--text3);margin-top:2px">${head.dob?'DOB: '+head.dob:''}${head.phone?' · '+head.phone:''}</div>
        </div>
      </div>
      ${stats.length ? `<div style="display:flex;gap:8px;flex-wrap:wrap">
        ${stats.map(s=>`<div style="background:rgba(255,255,255,.08);border-radius:10px;padding:5px 12px;font-size:12px;font-weight:600;color:var(--text2)">${s}</div>`).join('')}
      </div>` : ''}
      <div style="margin-top:12px;font-size:12px;color:rgba(123,95,255,.8);font-weight:600">Tap to manage →</div>
    </div>`;
  },

  _memberRow(m, i) {
    const relations = {son:'👦',daughter:'👧',wife:'👩',husband:'👨',mother:'👩‍🦳',father:'👨‍🦳',brother:'👱‍♂️',sister:'👱‍♀️',grandfather:'🧓',grandmother:'👵',uncle:'👨',aunt:'👩',cousin:'🧑'};
    const avatar = m.avatar || relations[(m.relation||'').toLowerCase()] || '👤';
    const totalCash = (m.cash||[]).reduce((a,c)=>a+(c.amount||0),0);
    const stats = [
      m.docs?.length ? m.docs.length+' Docs' : null,
      m.banks?.length ? m.banks.length+' Banks' : null,
      m.cards?.length ? m.cards.length+' Cards' : null,
      totalCash > 0 ? 'PKR '+totalCash.toLocaleString() : null,
    ].filter(Boolean);
    return `<div onclick="Family.openMember(${i})" style="background:var(--glass);border:1px solid var(--border);border-radius:16px;padding:16px;margin-bottom:12px;min-height:72px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:14px">
      <div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,rgba(123,95,255,.3),rgba(0,213,255,.2));display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0">${avatar}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:15px;font-weight:700;color:var(--text)">${_fesc(m.name)}</div>
        <div style="font-size:12px;color:var(--text3)">${_fesc(m.relation||'')}${m.dob?' · '+m.dob:''}</div>
        ${stats.length ? `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">${stats.map(s=>`<div style="background:rgba(255,255,255,.06);border-radius:8px;padding:3px 8px;font-size:11px;color:var(--text3)">${s}</div>`).join('')}</div>` : ''}
      </div>
      <div style="color:var(--text3);font-size:20px">›</div>
    </div>`;
  },

  openMember(idx) {
    this._view = 'member';
    this._memberIdx = idx;
    this._tab = 'overview';
    this.render();
  },

  back() {
    this._view = 'list';
    this._memberIdx = null;
    this.render();
  },

  _renderMember(body) {
    const m = this._getMemberData();
    if (!m || !m.name) { this.back(); return; }
    let tabs = ['overview','docs','banks','cash','investments','notes'];
    try { const fp=JSON.parse(localStorage.getItem('vo_family_tab_prefs')||'{}'); const ht=fp.hiddenTabs||[]; tabs=tabs.filter(t=>t==='overview'||!ht.includes(t)); } catch(e) {}
    const tabLabels = {overview:'📋 Overview',docs:'📄 Docs',banks:'💳 Banks & Cards',cash:'💵 Cash',investments:'📈 Investments',notes:'📝 Notes'};
    const midx = this._memberIdx;

    body.innerHTML = `
      <div style="background:linear-gradient(135deg,rgba(123,95,255,.15),rgba(0,213,255,.08));padding:20px 16px 16px">
        <button onclick="Family.back()" style="background:none;border:none;color:rgba(123,95,255,1);font-size:14px;font-weight:600;cursor:pointer;touch-action:manipulation;padding:0;margin-bottom:16px">← Family</button>
        <div style="display:flex;align-items:center;gap:14px">
          <div style="width:68px;height:68px;border-radius:50%;background:linear-gradient(135deg,rgba(123,95,255,.8),rgba(0,213,255,.6));display:flex;align-items:center;justify-content:center;font-size:32px;flex-shrink:0">${m.avatar||'👤'}</div>
          <div style="flex:1">
            <div style="font-size:22px;font-weight:900;color:var(--text)">${_fesc(m.name)}</div>
            <div style="font-size:13px;color:var(--text3)">${_fesc(m.relation||'')}${midx==='head'?' 👑':''}</div>
            ${m.dob?`<div style="font-size:12px;color:var(--text3);margin-top:2px">DOB: ${m.dob}</div>`:''}
          </div>
          <button onclick="Family.editMember(${JSON.stringify(midx)})" style="background:rgba(255,255,255,.08);border:1px solid var(--border);border-radius:10px;padding:8px 12px;color:var(--text2);font-size:13px;cursor:pointer;touch-action:manipulation">Edit</button>
        </div>
      </div>
      <div style="display:flex;overflow-x:auto;gap:6px;padding:12px 16px 8px;-webkit-overflow-scrolling:touch;scrollbar-width:none;background:var(--bg2);border-bottom:1px solid var(--border)">
        ${tabs.map(t=>`<button onclick="Family._switchTab('${t}')" style="flex-shrink:0;padding:8px 16px;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;touch-action:manipulation;white-space:nowrap;border:1px solid ${this._tab===t?'rgba(123,95,255,1)':'var(--border)'};background:${this._tab===t?'rgba(123,95,255,.2)':'transparent'};color:${this._tab===t?'rgba(123,95,255,1)':'var(--text3)'}">${tabLabels[t]}</button>`).join('')}
      </div>
      <div id="fm-tab-body" style="padding:16px">
        ${this._renderTab(m)}
      </div>`;
  },

  _switchTab(t) {
    this._tab = t;
    const m = this._getMemberData();
    const body = document.getElementById('fm-tab-body');
    if (body && m) body.innerHTML = this._renderTab(m);
    document.querySelectorAll('#pg-family-body button[onclick*="_switchTab"]').forEach(b=>{
      const bt = b.getAttribute('onclick').match(/'(\w+)'/)?.[1];
      const active = bt === t;
      b.style.border = '1px solid '+(active?'rgba(123,95,255,1)':'var(--border)');
      b.style.background = active?'rgba(123,95,255,.2)':'transparent';
      b.style.color = active?'rgba(123,95,255,1)':'var(--text3)';
    });
  },

  _renderTab(m) {
    switch(this._tab) {
      case 'overview': return this._tabOverview(m);
      case 'docs':     return this._tabDocs(m);
      case 'banks':    return this._tabBanks(m);
      case 'cash':        return this._tabCash(m);
      case 'investments': return this._tabInvestments(m);
      case 'notes':       return this._tabNotes(m);
      default: return '';
    }
  },

  _tabOverview(m) {
    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
        ${[
  ['📄','Documents',(m.docs||[]).length,'docs'],
  ['🏦','Banks',(m.banks||[]).length,'banks'],
  ['💳','Cards',(m.cards||[]).length,'banks'],
  ['💵','Cash entries',(m.cash||[]).length,'cash']
].map(([icon,label,count,tab])=>`
          <div onclick="Family._switchTab('${tab}')" style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px;text-align:center;cursor:pointer;touch-action:manipulation;transition:border-color .15s" onmouseenter="this.style.borderColor='var(--accent,var(--purple))'" onmouseleave="this.style.borderColor='var(--border)'">
            <div style="font-size:24px;margin-bottom:4px">${icon}</div>
            <div style="font-size:22px;font-weight:900;color:var(--text)">${count}</div>
            <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em">${label}</div>
          </div>`).join('')}
      </div>
      ${m.phone||m.email?`<div style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px;margin-bottom:12px">
        ${m.phone?`<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)"><span style="font-size:16px">📞</span><div><div style="font-size:11px;color:var(--text3)">Phone</div><div style="font-size:14px;font-weight:600;color:var(--text)">${_fesc(m.phone)}</div></div></div>`:''}
        ${m.email?`<div style="display:flex;align-items:center;gap:10px;padding:8px 0"><span style="font-size:16px">✉️</span><div><div style="font-size:11px;color:var(--text3)">Email</div><div style="font-size:14px;font-weight:600;color:var(--text)">${_fesc(m.email)}</div></div></div>`:''}
      </div>`:''}
      ${m.notes?`<div style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px"><div style="font-size:11px;color:var(--text3);margin-bottom:6px;text-transform:uppercase;letter-spacing:.06em">Notes</div><div style="font-size:14px;color:var(--text2);line-height:1.6">${_fesc(m.notes)}</div></div>`:''}`;
  },

  _tabDocs(m) {
    const docs = m.docs || [];
    const liveNote = m._isVaultOwner ? '<div style="font-size:12px;color:var(--text3);background:rgba(0,213,255,.06);border:1px solid rgba(0,213,255,.2);border-radius:10px;padding:8px 12px;margin-bottom:12px">📡 Live data from your vault — manage in Documents tab</div>' : '';
    const addBtn = m._isVaultOwner ? '' : '<button onclick="Family._addDoc()" style="width:100%;padding:12px;border-radius:12px;background:rgba(123,95,255,.15);border:1px solid rgba(123,95,255,.3);color:rgba(123,95,255,1);font-size:14px;font-weight:700;cursor:pointer;touch-action:manipulation;margin-bottom:14px">+ Add Document</button>';
    return `
      ${liveNote}
      ${addBtn}
      ${docs.length ? docs.map((doc,i)=>`
        <div style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:13px;font-weight:700;color:var(--text)">${_fesc(doc.type)}</div>
            ${doc.number?`<div style="font-size:12px;color:var(--text3);margin-top:2px">${_fesc(doc.number)}</div>`:''}
            ${doc.issued?`<div style="font-size:11px;color:var(--text3);margin-top:2px">Issued: ${doc.issued}</div>`:''}
            ${doc.issuer?`<div style="font-size:11px;color:var(--text3)">By: ${_fesc(doc.issuer)}</div>`:''}
            ${doc.expiry?`<div style="font-size:11px;color:${new Date(doc.expiry)<new Date(Date.now()+30*24*60*60*1000)?'var(--err)':'var(--text3)'};margin-top:2px">Exp: ${doc.expiry}</div>`:''}
          </div>
          ${!m._isVaultOwner?`<button onclick="Family._removeDoc(${i})" style="background:none;border:none;color:var(--err);font-size:20px;cursor:pointer;touch-action:manipulation">×</button>`:''}
        </div>`).join('') : '<div style="text-align:center;padding:30px;color:var(--text3)">No documents yet</div>'}`;
  },

  _tabBanks(m) {
    const banks = m.banks || [];
    const cards = m.cards || [];
    const liveNote = m._isVaultOwner ? '<div style="font-size:12px;color:var(--text3);background:rgba(0,213,255,.06);border:1px solid rgba(0,213,255,.2);border-radius:10px;padding:8px 12px;margin-bottom:12px">📡 Live data from your vault — manage in Banks/Cards tabs</div>' : '';
    return `
      ${liveNote}
      <div style="margin-bottom:20px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <div style="font-size:12px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.08em">Banks</div>
          ${!m._isVaultOwner?'<button onclick="Family._addBank()" style="font-size:13px;color:rgba(123,95,255,1);background:none;border:none;cursor:pointer;font-weight:600">+ Add</button>':''}
        </div>
        ${banks.length ? banks.map((b,i)=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:var(--glass);border:1px solid var(--border);border-radius:12px;margin-bottom:8px"><div style="font-size:14px;font-weight:600;color:var(--text)">🏦 ${_fesc(b)}</div>${!m._isVaultOwner?`<button onclick="Family._removeBank(${i})" style="background:none;border:none;color:var(--err);font-size:18px;cursor:pointer">×</button>`:''}</div>`).join('') : '<div style="color:var(--text3);font-size:13px;padding:8px 0">No banks added</div>'}
      </div>
      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <div style="font-size:12px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.08em">Cards</div>
          ${!m._isVaultOwner?'<button onclick="Family._addCard()" style="font-size:13px;color:rgba(123,95,255,1);background:none;border:none;cursor:pointer;font-weight:600">+ Add</button>':''}
        </div>
        ${cards.length ? cards.map((c,i)=>`
          <div style="background:var(--glass);border:1px solid var(--border);border-radius:12px;padding:12px 14px;margin-bottom:8px;display:flex;align-items:center;gap:12px">
            <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,rgba(123,95,255,.3),rgba(0,213,255,.2));display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">💳</div>
            <div style="flex:1;min-width:0">
              <div style="font-size:14px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${_fesc(c.name)}</div>
              <div style="font-size:11px;color:var(--text3);margin-top:2px">${c.last4?'**** '+c.last4:''}${c.network?' · '+c.network:''}${c.type?' · '+c.type:''}</div>
            </div>
            ${!m._isVaultOwner?`<button onclick="Family._removeCard(${i})" style="background:none;border:none;color:var(--err);font-size:20px;cursor:pointer;touch-action:manipulation;flex-shrink:0">×</button>`:''}
          </div>`).join('') : '<div style="color:var(--text3);font-size:13px;padding:8px 0">No cards added</div>'}
      </div>`;
  },

  _tabCash(m) {
    const cash = m.cash || [];
    const total = cash.reduce((a,c)=>a+(c.amount||0),0);
    const liveNote = m._isVaultOwner ? '<div style="font-size:12px;color:var(--text3);background:rgba(0,213,255,.06);border:1px solid rgba(0,213,255,.2);border-radius:10px;padding:8px 12px;margin-bottom:12px">📡 Live data from your vault — manage in Cash tab</div>' : '';
    const addBtn = m._isVaultOwner ? '' : '<button onclick="Family._addCash()" style="width:100%;padding:12px;border-radius:12px;background:rgba(0,255,136,.1);border:1px solid rgba(0,255,136,.3);color:var(--ok);font-size:14px;font-weight:700;cursor:pointer;touch-action:manipulation;margin-bottom:14px">+ Add Cash Entry</button>';
    return `
      ${liveNote}
      ${total>0?`<div style="background:linear-gradient(135deg,rgba(0,255,136,.1),rgba(0,213,255,.08));border:1px solid rgba(0,255,136,.3);border-radius:14px;padding:16px;text-align:center;margin-bottom:14px"><div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Total Cash</div><div style="font-size:28px;font-weight:900;color:var(--ok)">PKR ${total.toLocaleString()}</div></div>`:''}
      ${addBtn}
      ${cash.map((c,i)=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:14px;background:var(--glass);border:1px solid var(--border);border-radius:12px;margin-bottom:8px"><div><div style="font-size:14px;font-weight:600;color:var(--text)">${_fesc(c.label||'Cash')}</div>${c.notes?`<div style="font-size:12px;color:var(--text3)">${_fesc(c.notes)}</div>`:''}</div><div style="text-align:right"><div style="font-size:15px;font-weight:800;color:var(--ok)">PKR ${(c.amount||0).toLocaleString()}</div>${!m._isVaultOwner?`<button onclick="Family._removeCash(${i})" style="font-size:11px;color:var(--err);background:none;border:none;cursor:pointer;margin-top:2px">Remove</button>`:''}</div></div>`).join('')}
      ${!cash.length?'<div style="text-align:center;padding:30px;color:var(--text3)">No cash entries yet</div>':''}`;
  },

  _tabNotes(m) {
    return `
      <textarea id="fm-notes-area" rows="10" placeholder="Add notes about ${_fesc(m.name)}..." style="width:100%;background:var(--glass2);border:1px solid var(--border);border-radius:14px;padding:14px;color:var(--text);font-size:14px;line-height:1.6;resize:none;box-sizing:border-box">${_fesc(m.notes||'')}</textarea>
      <button onclick="Family._saveNotes()" style="width:100%;margin-top:10px;padding:12px;border-radius:12px;background:rgba(123,95,255,1);color:#fff;border:none;font-size:14px;font-weight:700;cursor:pointer;touch-action:manipulation">Save Notes</button>`;
  },

  _tabInvestments(m) {
    const items = m.investments || [];
    const total = items.reduce((a,x)=>a+(x.value||0),0);
    return `
      ${total>0?`<div style="background:linear-gradient(135deg,rgba(0,213,255,.1),rgba(123,95,255,.08));border:1px solid rgba(0,213,255,.3);border-radius:14px;padding:16px;text-align:center;margin-bottom:14px">
        <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Total Investments</div>
        <div style="font-size:26px;font-weight:900;color:var(--info)">PKR ${total.toLocaleString()}</div>
      </div>`:''}
      <button onclick="Family._addInvestment()" style="width:100%;padding:12px;border-radius:12px;background:rgba(0,213,255,.1);border:1px solid rgba(0,213,255,.3);color:var(--info);font-size:14px;font-weight:700;cursor:pointer;touch-action:manipulation;margin-bottom:14px">+ Add Investment</button>
      ${items.map((x,i)=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:14px;background:var(--glass);border:1px solid var(--border);border-radius:12px;margin-bottom:8px">
        <div><div style="font-size:14px;font-weight:600;color:var(--text)">${_fesc(x.type||'Investment')}</div><div style="font-size:12px;color:var(--text3)">${_fesc(x.name||'')}</div></div>
        <div style="text-align:right"><div style="font-size:15px;font-weight:800;color:var(--info)">PKR ${(x.value||0).toLocaleString()}</div><button onclick="Family._removeInvestment(${i})" style="font-size:11px;color:var(--err);background:none;border:none;cursor:pointer">Remove</button></div>
      </div>`).join('')}
      ${!items.length?'<div style="text-align:center;padding:30px;color:var(--text3)">No investments added yet</div>':''}`;
  },

  _addInvestment() {
    Modal.open('📈 Add Investment',
      `<div style="display:flex;flex-direction:column;gap:10px">
        <select id="fi-type" style="background:var(--input,var(--glass2));border:1px solid var(--border);border-radius:10px;padding:12px;color:var(--text)">
          ${['Stocks / Shares','Mutual Fund','Property / Real Estate','Savings Account','Fixed Deposit','NSS / Prize Bond','Cryptocurrency','Business Stake','Other'].map(t=>`<option>${t}</option>`).join('')}
        </select>
        <input id="fi-name" placeholder="Name / Description" style="background:var(--input,var(--glass2));border:1px solid var(--border);border-radius:10px;padding:12px;color:var(--text)">
        <input id="fi-val" type="number" placeholder="Current value (PKR)" min="0" style="background:var(--input,var(--glass2));border:1px solid var(--border);border-radius:10px;padding:12px;color:var(--text)">
      </div>`,
      `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Family._saveInvestment()">Add</button>`
    );
  },

  _saveInvestment() {
    const value = parseFloat(document.getElementById('fi-val')?.value||0);
    if (!value) { if(window.Toast) Toast.show('Enter value','error'); return; }
    const d = this.get();
    const m = this._memberIdx==='head' ? d.head : d.members[this._memberIdx];
    if (!m.investments) m.investments = [];
    m.investments.push({type:document.getElementById('fi-type')?.value,name:document.getElementById('fi-name')?.value,value});
    this.save(d); Modal.close();
    if(window.Toast) Toast.show('Investment added','success');
    const body = document.getElementById('fm-tab-body');
    if (body) body.innerHTML = this._tabInvestments(m);
  },

  _removeInvestment(i) {
    const d = this.get();
    const m = this._memberIdx==='head' ? d.head : d.members[this._memberIdx];
    if (m.investments) m.investments.splice(i,1);
    this.save(d);
    const body = document.getElementById('fm-tab-body');
    if (body) body.innerHTML = this._tabInvestments(m);
  },

  /* ── Member form ── */
  openSetHead() { this._openMemberForm(null, true); },
  openAddMember() { this._openMemberForm(null, false); },

  editMember(idx) {
    const isHead = idx === 'head';
    this._openMemberForm(isHead ? null : idx, isHead);
  },

  _openMemberForm(idx, isHead) {
    const d = this.get();
    const m = isHead ? d.head : (idx !== null && idx !== undefined ? d.members[idx] : null);
    const avatarOptions = ['👤','👦','👧','👩','👨','👩‍🦳','👨‍🦳','👱‍♂️','👱‍♀️','🧓','👵','🧑','👶'];
    const title = isHead ? '👑 Head of Family' : (m ? '✏️ Edit Member' : '➕ Add Member');
    const formHTML = `<div style="display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:4px">
        ${avatarOptions.map(a=>`<button class="fav-btn" data-av="${a}" onclick="document.getElementById('fm-avatar').value='${a}';document.querySelectorAll('.fav-btn').forEach(b=>b.style.outline='none');this.style.outline='2px solid var(--purple,var(--accent))'" style="font-size:22px;width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border);background:transparent;cursor:pointer;outline:${(m?.avatar||'👤')===a?'2px solid var(--purple,var(--accent))':'none'}">${a}</button>`).join('')}
      </div>
      <input id="fm-avatar" value="${_fesc(m?.avatar||'👤')}" style="display:none">
      <input id="fm-name" placeholder="Full name *" value="${_fesc(m?.name||'')}" style="background:var(--glass2);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);width:100%;box-sizing:border-box">
      <select id="fm-relation" onchange="(function(rel){const map={Wife:'👩',Husband:'👨',Son:'👦',Daughter:'👧',Mother:'👩‍🦳',Father:'👨‍🦳',Brother:'👱‍♂️',Sister:'👱‍♀️',Grandfather:'🧓',Grandmother:'👵',Uncle:'👨‍💼',Aunt:'👩‍💼',Cousin:'🧑',Other:'👤'};const av=map[rel];if(av){document.getElementById('fm-avatar').value=av;document.querySelectorAll('.fav-btn').forEach(b=>{b.style.outline=b.dataset.av===av?'2px solid var(--purple,var(--accent))':'none'});}})(this.value)" style="background:var(--glass2);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);width:100%;box-sizing:border-box">
        ${['Wife','Husband','Son','Daughter','Mother','Father','Brother','Sister','Grandfather','Grandmother','Uncle','Aunt','Cousin','Other'].map(r=>`<option value="${r}" ${m?.relation===r?'selected':''}>${r}</option>`).join('')}
      </select>
      <input id="fm-dob" type="date" value="${m?.dob||''}" style="background:var(--glass2);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);width:100%;box-sizing:border-box">
      <input id="fm-phone" placeholder="Phone number" value="${_fesc(m?.phone||'')}" style="background:var(--glass2);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);width:100%;box-sizing:border-box">
      <input id="fm-email" placeholder="Email address" value="${_fesc(m?.email||'')}" style="background:var(--glass2);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);width:100%;box-sizing:border-box">
      <textarea id="fm-notes-modal" placeholder="Notes..." rows="3" style="background:var(--glass2);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);resize:none;width:100%;box-sizing:border-box">${_fesc(m?.notes||'')}</textarea>
    </div>`;

    let footer;
    if (isHead) {
      footer = d.head
        ? `<button class="btn btn-danger" onclick="Family._deleteHead()">Remove</button><button class="btn btn-p" onclick="Family._saveHead()">Save</button>`
        : `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Family._saveHead()">Set as Head</button>`;
    } else if (m) {
      footer = `<button class="btn btn-danger" onclick="Family._deleteMember(${JSON.stringify(idx)})">Delete</button><button class="btn btn-p" onclick="Family._saveMemberEdit(${JSON.stringify(idx)})">Save</button>`;
    } else {
      footer = `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Family._saveNewMember()">Add</button>`;
    }
    Modal.open(title, formHTML, footer);
  },

  _memberFields() {
    return {
      name:     document.getElementById('fm-name')?.value?.trim(),
      avatar:   document.getElementById('fm-avatar')?.value || '👤',
      relation: document.getElementById('fm-relation')?.value,
      dob:      document.getElementById('fm-dob')?.value,
      phone:    document.getElementById('fm-phone')?.value,
      email:    document.getElementById('fm-email')?.value,
      notes:    document.getElementById('fm-notes-modal')?.value,
    };
  },

  _saveHead() {
    const f = this._memberFields();
    if (!f.name) { Toast.show('Name is required','error'); return; }
    const d = this.get();
    d.head = { ...f, docs: d.head?.docs||[], banks: d.head?.banks||[], cards: d.head?.cards||[], cash: d.head?.cash||[] };
    this.save(d); Modal.close(); this.render(); Toast.show('Head of family saved','success');
  },

  _deleteHead() {
    const d = this.get();
    d.head = null;
    this.save(d); Modal.close(); this.back(); Toast.show('Removed','info');
  },

  _saveNewMember() {
    const f = this._memberFields();
    if (!f.name) { Toast.show('Name is required','error'); return; }
    const d = this.get();
    d.members.push({ ...f, docs:[], banks:[], cards:[], cash:[] });
    this.save(d); Modal.close(); this.render(); Toast.show('Member added','success');
  },

  _saveMemberEdit(idx) {
    const f = this._memberFields();
    if (!f.name) { Toast.show('Name is required','error'); return; }
    const d = this.get();
    d.members[idx] = { ...d.members[idx], ...f };
    this.save(d); Modal.close();
    if (this._view === 'member') { this._memberIdx = idx; this.render(); }
    else this.render();
    Toast.show('Member saved','success');
  },

  _deleteMember(idx) {
    const d = this.get();
    d.members.splice(idx, 1);
    this.save(d); Modal.close(); this.back(); Toast.show('Removed','info');
  },

  /* ── Doc actions ── */
  _addDoc() {
    Modal.open('📄 Add Document',
      `<div style="display:flex;flex-direction:column;gap:10px">
        <div>
          <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Document Type</div>
          <select id="fd-type" style="width:100%;background:var(--input,var(--glass2));border:1px solid var(--border);border-radius:10px;padding:12px;color:var(--text);font-size:16px">
            <optgroup label="Identity">
              <option>Passport</option>
              <option>National ID / CNIC</option>
              <option>Driving Licence</option>
              <option>Iqama / Resident Permit</option>
              <option>Emirates ID</option>
              <option>PAN Card</option>
              <option>Voter ID</option>
            </optgroup>
            <optgroup label="Finance">
              <option>NTN Certificate</option>
              <option>Tax Return</option>
              <option>Bank Statement</option>
              <option>Salary Certificate</option>
            </optgroup>
            <optgroup label="Travel">
              <option>Visa</option>
              <option>Travel Permit</option>
              <option>Vehicle Registration</option>
            </optgroup>
            <optgroup label="Legal">
              <option>Birth Certificate</option>
              <option>Marriage Certificate</option>
              <option>Divorce Certificate</option>
              <option>Death Certificate</option>
              <option>Will / Testament</option>
              <option>Power of Attorney</option>
              <option>Property Deed</option>
            </optgroup>
            <optgroup label="Education">
              <option>Degree Certificate</option>
              <option>Transcript</option>
              <option>School Certificate</option>
            </optgroup>
            <optgroup label="Other">
              <option>Insurance Policy</option>
              <option>Medical Record</option>
              <option>Other</option>
            </optgroup>
          </select>
        </div>
        <input id="fd-num" placeholder="Document number (optional)" style="background:var(--input,var(--glass2));border:1px solid var(--border);border-radius:10px;padding:12px;color:var(--text);font-size:16px">
        <div>
          <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Issue Date</div>
          <input id="fd-issued" type="date" style="width:100%;background:var(--input,var(--glass2));border:1px solid var(--border);border-radius:10px;padding:12px;color:var(--text);font-size:16px">
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Expiry Date</div>
          <input id="fd-exp" type="date" style="width:100%;background:var(--input,var(--glass2));border:1px solid var(--border);border-radius:10px;padding:12px;color:var(--text);font-size:16px">
        </div>
        <input id="fd-issuer" placeholder="Issued by (optional)" style="background:var(--input,var(--glass2));border:1px solid var(--border);border-radius:10px;padding:12px;color:var(--text);font-size:16px">
        <textarea id="fd-note" placeholder="Notes (optional)" rows="2" style="background:var(--input,var(--glass2));border:1px solid var(--border);border-radius:10px;padding:12px;color:var(--text);font-size:16px;resize:none"></textarea>
        <div>
          <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">Photos (optional)</div>
          <div style="display:flex;gap:8px">
            <button onclick="Family._captureDocPhoto('front')" style="flex:1;padding:12px 14px;border-radius:10px;background:var(--glass);border:1px solid var(--border);color:var(--text);font-size:13px;cursor:pointer;touch-action:manipulation">📷 Front</button>
            <button onclick="Family._captureDocPhoto('back')" style="flex:1;padding:12px 14px;border-radius:10px;background:var(--glass);border:1px solid var(--border);color:var(--text);font-size:13px;cursor:pointer;touch-action:manipulation">📷 Back</button>
          </div>
          <div id="fd-photo-preview" style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap"></div>
        </div>
      </div>`,
      `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Family._saveDoc()">Save Document</button>`);
  },

  _captureDocPhoto(side) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = function(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(ev) {
        const preview = document.getElementById('fd-photo-preview');
        if (!preview) return;
        const img = document.createElement('div');
        img.style.cssText = 'position:relative;display:inline-block';
        img.dataset.side = side;
        img.dataset.src = ev.target.result;
        img.innerHTML = '<img src="'+ev.target.result+'" style="width:80px;height:60px;object-fit:cover;border-radius:8px;border:1px solid var(--border)" data-side="'+side+'">' +
          '<div style="position:absolute;top:2px;right:2px;background:rgba(0,0,0,.6);color:#fff;font-size:11px;padding:1px 4px;border-radius:4px">'+side.toUpperCase()+'</div>';
        const existing = preview.querySelector('[data-side="'+side+'"]');
        if (existing) existing.remove();
        preview.appendChild(img);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  },

  _saveDoc() {
    const type = document.getElementById('fd-type')?.value;
    if (!type) { if(window.Toast) Toast.show('Select document type','error'); return; }
    const d = this.get();
    const m = this._memberIdx === 'head' ? d.head : d.members[this._memberIdx];
    if (!m) return;
    if (!m.docs) m.docs = [];
    const photos = {};
    document.querySelectorAll('#fd-photo-preview [data-side]').forEach(el => {
      photos[el.dataset.side] = el.dataset.src || '';
    });
    m.docs.push({
      type,
      number: document.getElementById('fd-num')?.value || '',
      issued: document.getElementById('fd-issued')?.value || '',
      expiry: document.getElementById('fd-exp')?.value || '',
      issuer: document.getElementById('fd-issuer')?.value || '',
      notes: document.getElementById('fd-note')?.value || '',
      photos: Object.keys(photos).length ? photos : undefined,
      addedAt: new Date().toISOString(),
    });
    this.save(d); Modal.close();
    const tb = document.getElementById('fm-tab-body');
    if (tb) tb.innerHTML = this._tabDocs(m);
    Toast.show('Document saved','success');
  },

  _removeDoc(i) {
    const d = this.get();
    const m = this._memberIdx === 'head' ? d.head : d.members[this._memberIdx];
    if (m?.docs) m.docs.splice(i,1);
    this.save(d);
    const tb = document.getElementById('fm-tab-body');
    if (tb) tb.innerHTML = this._tabDocs(m);
  },

  /* ── Bank actions ── */
  _addBank() {
    const midx = this._memberIdx;
    const userCountry = (typeof S !== 'undefined' && S.user?.country) || 'PK';
    const allBanks = typeof SMART_DB !== 'undefined' ? SMART_DB.banks : [];
    const countryBanks = allBanks.filter(b => b.country === userCountry);
    const flags = {PK:'🇵🇰',GB:'🇬🇧',AE:'🇦🇪',US:'🇺🇸'};
    const cnames = {PK:'Pakistan',GB:'United Kingdom',AE:'UAE',US:'USA'};
    Modal.open('🏦 Add Bank',
      `<div style="display:flex;flex-direction:column;gap:12px">
        <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Country</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap" id="fam-country-chips">
          ${['PK','GB','AE','US'].map(cc=>`
            <button onclick="Family._loadBanksForCountry('${cc}','fam-bank-list')"
              id="fcc-${cc}"
              style="padding:8px 16px;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;touch-action:manipulation;border:1px solid ${cc===userCountry?'var(--accent,var(--purple))':'var(--border)'};background:${cc===userCountry?'rgba(123,95,255,.2)':'transparent'};color:${cc===userCountry?'var(--accent,var(--purple))':'var(--text3)'}"
            >${flags[cc]||'🌐'} ${cnames[cc]||cc}</button>`).join('')}
        </div>
        <input id="fam-bank-search" placeholder="Search banks..."
          style="background:var(--input,var(--glass2));border:1px solid var(--border);border-radius:10px;padding:12px;color:var(--text);font-size:16px"
          oninput="if(window.Family)window.Family._searchBankList(this.value,'fam-bank-list')">
        <div id="fam-bank-list" style="max-height:320px;overflow-y:auto;display:flex;flex-direction:column;gap:6px">
          ${countryBanks.map(b=>`
            <div onclick="document.getElementById('fam-bank-selected').value='${b.name.replace(/'/g,"\\'")}';document.querySelectorAll('#fam-bank-list .fbl-item').forEach(el=>{el.style.background='transparent';el.style.borderColor='var(--border)'});this.style.background='rgba(123,95,255,.15)';this.style.borderColor='rgba(123,95,255,.5)'"
              class="fbl-item"
              style="padding:12px;border-radius:12px;border:1px solid var(--border);cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:12px;transition:all .15s">
              <div style="width:36px;height:36px;border-radius:10px;background:${b.color||'rgba(123,95,255,.2)'};display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">${b.logo||'🏦'}</div>
              <div>
                <div style="font-size:14px;font-weight:600;color:var(--text)">${b.name}</div>
                <div style="font-size:11px;color:var(--text3)">${b.type||'Commercial'}</div>
              </div>
            </div>`).join('')}
        </div>
        <input id="fam-bank-selected" placeholder="Or type bank name manually"
          style="background:var(--input,var(--glass2));border:1px solid var(--border);border-radius:10px;padding:12px;color:var(--text);font-size:16px">
      </div>`,
      `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="if(window.Family)window.Family._saveFamilyBank(${JSON.stringify(midx)})">Add Bank</button>`
    );
  },

  _loadBanksForCountry(cc, listId) {
    ['PK','GB','AE','US'].forEach(c => {
      const btn = document.getElementById('fcc-'+c);
      if (!btn) return;
      btn.style.border = c===cc ? '1px solid rgba(123,95,255,.6)' : '1px solid var(--border)';
      btn.style.background = c===cc ? 'rgba(123,95,255,.2)' : 'transparent';
      btn.style.color = c===cc ? 'var(--accent,var(--purple))' : 'var(--text3)';
    });
    const banks = (typeof SMART_DB !== 'undefined' ? SMART_DB.banks : []).filter(b => b.country === cc);
    const list = document.getElementById(listId);
    if (!list) return;
    list.innerHTML = banks.map(b=>`
      <div onclick="document.getElementById('fam-bank-selected').value='${b.name.replace(/'/g,"\\'")}';document.querySelectorAll('#${listId} .fbl-item').forEach(el=>{el.style.background='transparent';el.style.borderColor='var(--border)'});this.style.background='rgba(123,95,255,.15)';this.style.borderColor='rgba(123,95,255,.5)'"
        class="fbl-item"
        style="padding:12px;border-radius:12px;border:1px solid var(--border);cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:12px;transition:all .15s">
        <div style="width:36px;height:36px;border-radius:10px;background:${b.color||'rgba(123,95,255,.2)'};display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">${b.logo||'🏦'}</div>
        <div>
          <div style="font-size:14px;font-weight:600;color:var(--text)">${b.name}</div>
          <div style="font-size:11px;color:var(--text3)">${b.type||'Commercial'}</div>
        </div>
      </div>`).join('') || '<div style="padding:20px;text-align:center;color:var(--text3);font-size:13px">No banks found for this country</div>';
  },

  _searchBankList(query, listId) {
    const all = typeof SMART_DB !== 'undefined' ? SMART_DB.banks : [];
    const q = (query||'').toLowerCase();
    const filtered = q ? all.filter(b=>b.name.toLowerCase().includes(q)) : all.slice(0,20);
    const list = document.getElementById(listId);
    if (!list) return;
    list.innerHTML = filtered.map(b=>`
      <div onclick="document.getElementById('fam-bank-selected').value='${b.name.replace(/'/g,"\\'")}';document.querySelectorAll('#${listId} .fbl-item').forEach(el=>{el.style.background='transparent';el.style.borderColor='var(--border)'});this.style.background='rgba(123,95,255,.15)';this.style.borderColor='rgba(123,95,255,.5)'"
        class="fbl-item"
        style="padding:12px;border-radius:12px;border:1px solid var(--border);cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:12px;transition:all .15s">
        <div style="width:36px;height:36px;border-radius:10px;background:${b.color||'rgba(123,95,255,.2)'};display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">${b.logo||'🏦'}</div>
        <div>
          <div style="font-size:14px;font-weight:600;color:var(--text)">${b.name}</div>
          <div style="font-size:11px;color:var(--text3)">${b.type||'Commercial'} · ${b.country||''}</div>
        </div>
      </div>`).join('') || '<div style="padding:20px;text-align:center;color:var(--text3);font-size:13px">No banks found</div>';
  },

  _saveFamilyBank(midx) {
    const name = (document.getElementById('fam-bank-selected')?.value || '').trim();
    if (!name) { if(window.Toast) Toast.show('Select or enter a bank','error'); return; }
    const d = this.get();
    const m = midx === 'head' ? d.head : d.members[midx];
    if (!m) return;
    if (!m.banks) m.banks = [];
    if (m.banks.includes(name)) { if(window.Toast) Toast.show('Bank already added','warning'); return; }
    m.banks.push(name);
    this.save(d);
    Modal.close();
    if(window.Toast) Toast.show('Bank added','success');
    const body = document.getElementById('fm-tab-body');
    if (body) body.innerHTML = this._tabBanks(m);
  },

  _filterBankList(query) {
    const allBanks = typeof SMART_DB !== 'undefined' ? SMART_DB.banks : [];
    const q = (query||'').toLowerCase();
    const filtered = q ? allBanks.filter(b=>b.name.toLowerCase().includes(q)) : allBanks.slice(0,40);
    const list = document.getElementById('fb-list');
    if (!list) return;
    if (!filtered.length) { list.innerHTML = '<div style="padding:12px;color:var(--text3);font-size:13px;text-align:center">No banks found</div>'; return; }
    list.innerHTML = filtered.map(b=>`
      <div onclick="document.getElementById('fb-selected').value='${b.name.replace(/'/g,"\\'")}';document.querySelectorAll('#fb-list .fb-item').forEach(el=>{el.style.background='transparent';el.style.border='1px solid var(--border)'});this.style.background='rgba(123,95,255,.15)';this.style.border='1px solid rgba(123,95,255,.5)'"
        class="fb-item"
        style="padding:10px 12px;border-radius:10px;border:1px solid var(--border);cursor:pointer;touch-action:manipulation;font-size:14px;color:var(--text);display:flex;align-items:center;gap:10px;transition:all .15s">
        <div style="width:32px;height:32px;border-radius:8px;background:${b.color||'rgba(123,95,255,.2)'};display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">${b.logo||'🏦'}</div>
        <div><div style="font-weight:600">${b.name}</div><div style="font-size:11px;color:var(--text3)">${b.country||''}</div></div>
      </div>`).join('');
  },

  _saveBank() {
    const name = (document.getElementById('fb-selected')?.value || document.getElementById('fb-name')?.value || '').trim();
    if (!name) { if(window.Toast) Toast.show('Select or enter a bank','error'); return; }
    const d = this.get();
    const m = this._memberIdx === 'head' ? d.head : d.members[this._memberIdx];
    if (!m) return;
    if (!m.banks) m.banks = [];
    if (m.banks.includes(name)) { if(window.Toast) Toast.show('Bank already added','warning'); return; }
    m.banks.push(name);
    this.save(d); Modal.close();
    if(window.Toast) Toast.show('Bank added','success');
    const tb = document.getElementById('fm-tab-body');
    if (tb) tb.innerHTML = this._tabBanks(m);
  },

  _removeBank(i) {
    const d = this.get();
    const m = this._memberIdx === 'head' ? d.head : d.members[this._memberIdx];
    if (m?.banks) m.banks.splice(i,1);
    this.save(d);
    const tb = document.getElementById('fm-tab-body');
    if (tb) tb.innerHTML = this._tabBanks(m);
  },

  /* ── Card actions ── */
  _addCard() {
    const d = this.get();
    const m = this._memberIdx === 'head' ? d.head : d.members[this._memberIdx];
    const memberBanks = m?.banks || [];
    const getCardSuggestions = (bankName) => {
      if (!bankName || typeof SMART_DB === 'undefined') return [];
      const firstWord = bankName.toLowerCase().split(' ')[0];
      return (SMART_DB.cards || []).filter(c => c.toLowerCase().includes(firstWord)).slice(0,8);
    };
    const initialCards = memberBanks.length > 0 ? getCardSuggestions(memberBanks[0]) :
      (typeof SMART_DB !== 'undefined' ? (SMART_DB.cards||[]).slice(0,10) : []);
    Modal.open('💳 Add Card',
      `<div style="display:flex;flex-direction:column;gap:10px">
        ${memberBanks.length > 0 ? `
          <div>
            <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Filter by Bank</div>
            <select id="fc-bank-filter" onchange="if(window.Family)window.Family._filterCardList(this.value,'')"
              style="width:100%;background:var(--input,var(--glass2));border:1px solid var(--border);border-radius:10px;padding:12px;color:var(--text);font-size:16px">
              <option value="">All Cards</option>
              ${memberBanks.map(b=>`<option value="${_fesc(b)}">${_fesc(b)}</option>`).join('')}
            </select>
          </div>` : ''}
        <div>
          <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Select Card</div>
          <input id="fc-search" placeholder="Search or type card name..."
            style="width:100%;background:var(--input,var(--glass2));border:1px solid var(--border);border-radius:10px;padding:12px;color:var(--text);font-size:16px"
            oninput="if(window.Family)window.Family._filterCardList(document.getElementById('fc-bank-filter')?.value||'',this.value)">
        </div>
        <div id="fc-list" style="max-height:200px;overflow-y:auto;display:flex;flex-direction:column;gap:6px">
          ${initialCards.map(c=>`
            <div onclick="document.getElementById('fc-name').value='${c.replace(/'/g,"\\'")}';document.querySelectorAll('#fc-list .fc-item').forEach(el=>el.style.background='transparent');this.style.background='rgba(123,95,255,.15)'"
              class="fc-item"
              style="padding:10px 14px;border-radius:10px;border:1px solid var(--border);cursor:pointer;touch-action:manipulation;font-size:13px;color:var(--text);transition:background .15s">
              💳 ${c}
            </div>`).join('')}
        </div>
        <input id="fc-name" placeholder="Card name"
          style="background:var(--input,var(--glass2));border:1px solid var(--border);border-radius:10px;padding:12px;color:var(--text);font-size:16px">
        <div style="display:flex;gap:8px">
          <input id="fc-l4" placeholder="Last 4 digits" maxlength="4"
            style="flex:1;background:var(--input,var(--glass2));border:1px solid var(--border);border-radius:10px;padding:12px;color:var(--text);font-size:16px">
          <select id="fc-type" style="flex:1;background:var(--input,var(--glass2));border:1px solid var(--border);border-radius:10px;padding:12px;color:var(--text);font-size:16px">
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
            <option value="prepaid">Prepaid</option>
          </select>
        </div>
        <select id="fc-net" style="background:var(--input,var(--glass2));border:1px solid var(--border);border-radius:10px;padding:12px;color:var(--text);font-size:16px">
          <option value="">Network (optional)</option>
          <option>Visa</option><option>Mastercard</option><option>Amex</option>
          <option>UnionPay</option><option>PayPak</option><option>JCB</option>
        </select>
      </div>`,
      `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Family._saveCard()">Add Card</button>`
    );
  },

  _filterCardList(bankName, searchQuery) {
    const q = (searchQuery||'').toLowerCase();
    let cards = [];
    if (bankName && typeof SMART_DB !== 'undefined') {
      const firstWord = bankName.toLowerCase().split(' ')[0];
      cards = (SMART_DB.cards||[]).filter(c => c.toLowerCase().includes(firstWord));
    } else if (typeof SMART_DB !== 'undefined') {
      cards = SMART_DB.cards || [];
    }
    if (q) cards = cards.filter(c => c.toLowerCase().includes(q));
    const list = document.getElementById('fc-list');
    if (!list) return;
    list.innerHTML = cards.slice(0,10).map(c=>`
      <div onclick="document.getElementById('fc-name').value='${c.replace(/'/g,"\\'")}';document.querySelectorAll('#fc-list .fc-item').forEach(el=>el.style.background='transparent');this.style.background='rgba(123,95,255,.15)'"
        class="fc-item"
        style="padding:10px 14px;border-radius:10px;border:1px solid var(--border);cursor:pointer;touch-action:manipulation;font-size:13px;color:var(--text);transition:background .15s">
        💳 ${c}
      </div>`).join('') || '<div style="padding:12px;color:var(--text3);font-size:13px">No cards found — type name manually above</div>';
  },

  _saveCard() {
    const name = document.getElementById('fc-name')?.value?.trim();
    if (!name) { if(window.Toast) Toast.show('Enter card name','error'); return; }
    const d = this.get();
    const m = this._memberIdx === 'head' ? d.head : d.members[this._memberIdx];
    if (!m) return;
    if (!m.cards) m.cards = [];
    m.cards.push({
      name,
      last4: document.getElementById('fc-l4')?.value || '',
      network: document.getElementById('fc-net')?.value || '',
      type: document.getElementById('fc-type')?.value || 'debit',
    });
    this.save(d); Modal.close();
    if(window.Toast) Toast.show('Card added','success');
    const tb = document.getElementById('fm-tab-body');
    if (tb) tb.innerHTML = this._tabBanks(m);
  },

  _removeCard(i) {
    const d = this.get();
    const m = this._memberIdx === 'head' ? d.head : d.members[this._memberIdx];
    if (m?.cards) m.cards.splice(i,1);
    this.save(d);
    const tb = document.getElementById('fm-tab-body');
    if (tb) tb.innerHTML = this._tabBanks(m);
  },

  /* ── Cash actions ── */
  _addCash() {
    Modal.open('💵 Add Cash Entry',
      `<div style="display:flex;flex-direction:column;gap:10px">
        <input id="fca-label" placeholder="Label (e.g. Savings, Wallet)" style="background:var(--glass2);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);width:100%;box-sizing:border-box">
        <input id="fca-amount" type="number" placeholder="Amount (PKR)" style="background:var(--glass2);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);width:100%;box-sizing:border-box">
        <input id="fca-notes" placeholder="Notes (optional)" style="background:var(--glass2);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);width:100%;box-sizing:border-box">
      </div>`,
      `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Family._saveCash()">Add</button>`);
  },

  _saveCash() {
    const amount = parseFloat(document.getElementById('fca-amount')?.value)||0;
    if (!amount) { Toast.show('Enter an amount','error'); return; }
    const d = this.get();
    const m = this._memberIdx === 'head' ? d.head : d.members[this._memberIdx];
    if (!m) return;
    if (!m.cash) m.cash = [];
    m.cash.push({ label: document.getElementById('fca-label')?.value||'Cash', amount, notes: document.getElementById('fca-notes')?.value });
    this.save(d); Modal.close();
    const tb = document.getElementById('fm-tab-body');
    if (tb) tb.innerHTML = this._tabCash(m);
  },

  _removeCash(i) {
    const d = this.get();
    const m = this._memberIdx === 'head' ? d.head : d.members[this._memberIdx];
    if (m?.cash) m.cash.splice(i,1);
    this.save(d);
    const tb = document.getElementById('fm-tab-body');
    if (tb) tb.innerHTML = this._tabCash(m);
  },

  /* ── Notes action ── */
  _saveNotes() {
    const notes = document.getElementById('fm-notes-area')?.value;
    const d = this.get();
    const m = this._memberIdx === 'head' ? d.head : d.members[this._memberIdx];
    if (m) { m.notes = notes; this.save(d); Toast.show('Notes saved','success'); }
  },
};
window.Family = Family;
window.Family._filterBankList = Family._filterBankList.bind(Family);
window.Family._filterCardList = Family._filterCardList.bind(Family);
window.Family._loadBanksForCountry = Family._loadBanksForCountry.bind(Family);
window.Family._searchBankList = Family._searchBankList.bind(Family);
window.Family._saveFamilyBank = Family._saveFamilyBank.bind(Family);

function _fesc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
