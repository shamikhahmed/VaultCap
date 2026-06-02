const Family = {
  get() { return JSON.parse(localStorage.getItem('vo_family')||'{"head":null,"members":[]}'); },
  save(d) { localStorage.setItem('vo_family',JSON.stringify(d)); },

  render() {
    const body = document.getElementById('pg-family-body');
    if (!body) return;
    const d = this.get();
    const members = d.members || [];

    body.innerHTML = `
      <div style="padding:16px">
        ${this._headCard(d.head)}
        <div style="display:flex;align-items:center;justify-content:space-between;margin:20px 0 12px">
          <div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em">Family Members (${members.length})</div>
          <button onclick="Family.openAdd()" style="background:var(--accent);color:#fff;border:none;border-radius:20px;padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer">+ Add Member</button>
        </div>
        ${members.length ? members.map((m,i)=>this._memberCard(m,i)).join('') : this._empty()}
      </div>`;
  },

  _headCard(head) {
    if (!head) return `
      <div style="background:linear-gradient(135deg,rgba(123,95,255,.2),rgba(0,213,255,.1));border:1px solid rgba(123,95,255,.4);border-radius:var(--r);padding:20px;text-align:center;cursor:pointer" onclick="Family.setHead()">
        <div style="font-size:40px;margin-bottom:8px">👑</div>
        <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:4px">Set Head of Family</div>
        <div style="font-size:12px;color:var(--text3)">Tap to add the head of household</div>
      </div>`;
    return `
      <div style="background:linear-gradient(135deg,rgba(123,95,255,.25),rgba(0,213,255,.15));border:1px solid rgba(123,95,255,.5);border-radius:var(--r);padding:20px;position:relative">
        <div style="position:absolute;top:12px;right:12px;font-size:11px;background:rgba(123,95,255,.3);color:var(--accent);padding:3px 8px;border-radius:10px;font-weight:700">HEAD OF FAMILY</div>
        <div style="display:flex;align-items:center;gap:14px">
          <div style="width:60px;height:60px;border-radius:50%;background:var(--grad,linear-gradient(135deg,var(--accent),rgba(0,213,255,.8)));display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0">${head.avatar||'👤'}</div>
          <div>
            <div style="font-size:18px;font-weight:800;color:var(--text)">${_fesc(head.name)}</div>
            <div style="font-size:13px;color:var(--text3)">${_fesc(head.relation||'')}</div>
            ${head.dob?`<div style="font-size:12px;color:var(--text3);margin-top:2px">DOB: ${head.dob}</div>`:''}
          </div>
        </div>
        ${head.notes?`<div style="margin-top:12px;font-size:13px;color:var(--text2);border-top:1px solid rgba(255,255,255,.1);padding-top:10px">${_fesc(head.notes)}</div>`:''}
        <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
          ${head.docs?.length?`<button onclick="Family.manageDocs('head')" style="font-size:12px;color:var(--info);background:rgba(0,213,255,.1);border:1px solid rgba(0,213,255,.3);border-radius:8px;padding:6px 12px;cursor:pointer">📄 ${head.docs.length} Doc${head.docs.length>1?'s':''}</button>`:''}
          ${head.banks?.length?`<button onclick="Family.manageBanks('head')" style="font-size:12px;color:var(--accent);background:rgba(123,95,255,.1);border:1px solid rgba(123,95,255,.3);border-radius:8px;padding:6px 12px;cursor:pointer">🏦 ${head.banks.length} Bank${head.banks.length>1?'s':''}</button>`:''}
          <button onclick="Family.editMember('head')" style="font-size:12px;color:var(--text3);background:var(--glass);border:1px solid var(--border);border-radius:8px;padding:6px 12px;cursor:pointer">✏️ Edit</button>
        </div>
      </div>`;
  },

  _memberCard(m, i) {
    const relations = {son:'👦',daughter:'👧',wife:'👩',husband:'👨',mother:'👩‍🦳',father:'👨‍🦳',brother:'👱‍♂️',sister:'👱‍♀️',grandfather:'🧓',grandmother:'👵',uncle:'👨',aunt:'👩',cousin:'🧑'};
    const avatar = m.avatar || relations[m.relation?.toLowerCase()] || '👤';
    return `
      <div style="background:var(--glass);border:1px solid var(--border);border-radius:var(--r);padding:16px;margin-bottom:12px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,rgba(123,95,255,.4),rgba(0,213,255,.3));display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">${avatar}</div>
          <div style="flex:1">
            <div style="font-size:15px;font-weight:700;color:var(--text)">${_fesc(m.name)}</div>
            <div style="font-size:12px;color:var(--text3)">${_fesc(m.relation||'')}${m.dob?' · '+m.dob:''}</div>
          </div>
          <button onclick="Family.editMember(${i})" style="background:none;border:none;color:var(--text3);font-size:18px;cursor:pointer;padding:4px">⋯</button>
        </div>
        ${m.notes?`<div style="font-size:13px;color:var(--text2);margin-bottom:10px;padding:8px;background:rgba(255,255,255,.03);border-radius:8px">${_fesc(m.notes)}</div>`:''}
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button onclick="Family.manageDocs(${i})" style="font-size:12px;color:var(--info);background:rgba(0,213,255,.08);border:1px solid rgba(0,213,255,.2);border-radius:8px;padding:6px 12px;cursor:pointer">📄 Docs ${m.docs?.length?'('+m.docs.length+')':''}</button>
          <button onclick="Family.manageBanks(${i})" style="font-size:12px;color:var(--accent);background:rgba(123,95,255,.08);border:1px solid rgba(123,95,255,.2);border-radius:8px;padding:6px 12px;cursor:pointer">🏦 Banks ${m.banks?.length?'('+m.banks.length+')':''}</button>
          <button onclick="Family.manageCards(${i})" style="font-size:12px;color:var(--ok);background:rgba(0,255,136,.08);border:1px solid rgba(0,255,136,.2);border-radius:8px;padding:6px 12px;cursor:pointer">💳 Cards ${m.cards?.length?'('+m.cards.length+')':''}</button>
          <button onclick="Family.manageNotes(${i})" style="font-size:12px;color:var(--text3);background:var(--glass);border:1px solid var(--border);border-radius:8px;padding:6px 12px;cursor:pointer">📝 Notes</button>
        </div>
      </div>`;
  },

  _empty() {
    return `<div style="text-align:center;padding:40px 20px;color:var(--text3)">
      <div style="font-size:48px;margin-bottom:12px">👨‍👩‍👧‍👦</div>
      <div style="font-size:15px;font-weight:600;color:var(--text2);margin-bottom:6px">No family members yet</div>
      <div style="font-size:13px">Add your family members to keep their documents, banks and cards in one place</div>
    </div>`;
  },

  _memberForm(m) {
    const avatarOptions = ['👤','👦','👧','👩','👨','👩‍🦳','👨‍🦳','👱‍♂️','👱‍♀️','🧓','👵','🧑','👶'];
    return `<div style="display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:4px">
        ${avatarOptions.map(a=>`<button onclick="this.parentElement.parentElement.querySelector('#fm-avatar').value='${a}';this.parentElement.querySelectorAll('button').forEach(b=>b.style.background='');this.style.background='rgba(123,95,255,.3)'" style="font-size:22px;padding:6px;border-radius:10px;border:1px solid var(--border);background:${(m?.avatar||'👤')===a?'rgba(123,95,255,.3)':'transparent'};cursor:pointer">${a}</button>`).join('')}
      </div>
      <input id="fm-avatar" value="${m?.avatar||'👤'}" style="display:none">
      <input id="fm-name" placeholder="Full name *" value="${_fesc(m?.name||'')}" style="background:var(--glass2,var(--glass));border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);width:100%;box-sizing:border-box">
      <select id="fm-relation" style="background:var(--glass2,var(--glass));border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);width:100%;box-sizing:border-box">
        ${['Wife','Husband','Son','Daughter','Mother','Father','Brother','Sister','Grandfather','Grandmother','Uncle','Aunt','Cousin','Other'].map(r=>`<option value="${r}" ${m?.relation===r?'selected':''}>${r}</option>`).join('')}
      </select>
      <input id="fm-dob" type="date" value="${m?.dob||''}" style="background:var(--glass2,var(--glass));border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);width:100%;box-sizing:border-box">
      <input id="fm-phone" placeholder="Phone number" value="${_fesc(m?.phone||'')}" style="background:var(--glass2,var(--glass));border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);width:100%;box-sizing:border-box">
      <input id="fm-email" placeholder="Email address" value="${_fesc(m?.email||'')}" style="background:var(--glass2,var(--glass));border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);width:100%;box-sizing:border-box">
      <textarea id="fm-notes" placeholder="Notes..." rows="3" style="background:var(--glass2,var(--glass));border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);resize:none;width:100%;box-sizing:border-box">${_fesc(m?.notes||'')}</textarea>
    </div>`;
  },

  setHead() {
    Modal.open('👑 Head of Family', this._memberForm(null),
      `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Family._saveHead()">Set as Head</button>`);
  },

  openAdd() {
    Modal.open('➕ Add Family Member', this._memberForm(null),
      `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Family._saveMember()">Add Member</button>`);
  },

  _saveHead() {
    const name = document.getElementById('fm-name')?.value?.trim();
    if (!name) { Toast.show('Name is required','error'); return; }
    const d = this.get();
    d.head = { name, avatar: document.getElementById('fm-avatar')?.value, relation: document.getElementById('fm-relation')?.value, dob: document.getElementById('fm-dob')?.value, phone: document.getElementById('fm-phone')?.value, email: document.getElementById('fm-email')?.value, notes: document.getElementById('fm-notes')?.value, docs: d.head?.docs||[], banks: d.head?.banks||[], cards: d.head?.cards||[] };
    this.save(d); Modal.close(); this.render(); Toast.show('Head of family set','success');
  },

  _saveMember(idx) {
    const name = document.getElementById('fm-name')?.value?.trim();
    if (!name) { Toast.show('Name is required','error'); return; }
    const d = this.get();
    const member = { name, avatar: document.getElementById('fm-avatar')?.value, relation: document.getElementById('fm-relation')?.value, dob: document.getElementById('fm-dob')?.value, phone: document.getElementById('fm-phone')?.value, email: document.getElementById('fm-email')?.value, notes: document.getElementById('fm-notes')?.value, docs: [], banks: [], cards: [] };
    if (idx !== undefined) d.members[idx] = { ...d.members[idx], ...member };
    else d.members.push(member);
    this.save(d); Modal.close(); this.render(); Toast.show('Member saved','success');
  },

  editMember(idx) {
    const d = this.get();
    const m = idx === 'head' ? d.head : d.members[idx];
    if (!m) return;
    Modal.open('✏️ Edit Member', this._memberForm(m),
      `<button class="btn btn-danger" onclick="Family._deleteMember(${JSON.stringify(idx)})">Delete</button><button class="btn btn-p" onclick="Family._saveMember(${JSON.stringify(idx)})">Save</button>`);
  },

  _deleteMember(idx) {
    const d = this.get();
    if (idx === 'head') { d.head = null; }
    else { d.members.splice(idx,1); }
    this.save(d); Modal.close(); this.render(); Toast.show('Removed','info');
  },

  manageDocs(idx) {
    const d = this.get();
    const m = idx === 'head' ? d.head : d.members[idx];
    if (!m) return;
    const docs = m.docs || [];
    Modal.open(`📄 ${_fesc(m.name)}'s Documents`,
      `<div style="margin-bottom:12px">
        ${docs.length ? docs.map((doc,i)=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)"><div><div style="font-size:13px;font-weight:600">${_fesc(doc.type)}</div><div style="font-size:11px;color:var(--text3)">${_fesc(doc.number||'')}${doc.expiry?' · Exp: '+doc.expiry:''}</div></div><button onclick="Family._removeDoc(${JSON.stringify(idx)},${i})" style="color:var(--err);background:none;border:none;cursor:pointer;font-size:18px">×</button></div>`).join('') : '<div style="text-align:center;padding:20px;color:var(--text3)">No documents yet</div>'}
        <div style="margin-top:14px;display:flex;flex-direction:column;gap:8px">
          <select id="fd-type" style="background:var(--glass2,var(--glass));border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);width:100%;box-sizing:border-box">
            ${['Passport','National ID','Driving Licence','Visa','Birth Certificate','Marriage Certificate','NTN','CNIC','Iqama','Emirates ID','Other'].map(t=>`<option>${t}</option>`).join('')}
          </select>
          <input id="fd-number" placeholder="Document number" style="background:var(--glass2,var(--glass));border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);width:100%;box-sizing:border-box">
          <input id="fd-expiry" type="date" placeholder="Expiry date" style="background:var(--glass2,var(--glass));border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);width:100%;box-sizing:border-box">
          <input id="fd-notes" placeholder="Notes" style="background:var(--glass2,var(--glass));border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);width:100%;box-sizing:border-box">
          <button class="btn btn-p" onclick="Family._addDoc(${JSON.stringify(idx)})">+ Add Document</button>
        </div>
      </div>`,
      `<button class="btn btn-g" onclick="Modal.close()">Done</button>`);
  },

  _addDoc(idx) {
    const d = this.get();
    const m = idx === 'head' ? d.head : d.members[idx];
    if (!m) return;
    if (!m.docs) m.docs = [];
    m.docs.push({ type: document.getElementById('fd-type')?.value, number: document.getElementById('fd-number')?.value, expiry: document.getElementById('fd-expiry')?.value, notes: document.getElementById('fd-notes')?.value });
    this.save(d);
    Toast.show('Document added','success');
    Modal.close();
    this.manageDocs(idx);
  },

  _removeDoc(idx, docIdx) {
    const d = this.get();
    const m = idx === 'head' ? d.head : d.members[idx];
    if (m?.docs) m.docs.splice(docIdx,1);
    this.save(d); Modal.close(); this.manageDocs(idx);
  },

  manageBanks(idx) {
    const d = this.get();
    const m = idx === 'head' ? d.head : d.members[idx];
    if (!m) return;
    const banks = m.banks || [];
    Modal.open(`🏦 ${_fesc(m.name)}'s Banks`,
      `<div>
        ${banks.length ? banks.map((b,i)=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600">${_fesc(b)}</div><button onclick="Family._removeBank(${JSON.stringify(idx)},${i})" style="color:var(--err);background:none;border:none;cursor:pointer;font-size:18px">×</button></div>`).join('') : '<div style="text-align:center;padding:20px;color:var(--text3)">No banks added</div>'}
        <div style="margin-top:12px;display:flex;gap:8px">
          <input id="fb-name" placeholder="Bank name" style="flex:1;background:var(--glass2,var(--glass));border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text)">
          <button class="btn btn-p" onclick="Family._addBank(${JSON.stringify(idx)})">Add</button>
        </div>
      </div>`,
      `<button class="btn btn-g" onclick="Modal.close()">Done</button>`);
  },

  _addBank(idx) {
    const name = document.getElementById('fb-name')?.value?.trim();
    if (!name) return;
    const d = this.get();
    const m = idx === 'head' ? d.head : d.members[idx];
    if (!m.banks) m.banks = [];
    m.banks.push(name);
    this.save(d); Modal.close(); this.manageBanks(idx);
  },

  _removeBank(idx, bi) {
    const d = this.get();
    const m = idx === 'head' ? d.head : d.members[idx];
    if (m?.banks) m.banks.splice(bi,1);
    this.save(d); Modal.close(); this.manageBanks(idx);
  },

  manageCards(idx) {
    const d = this.get();
    const m = idx === 'head' ? d.head : d.members[idx];
    if (!m) return;
    const cards = m.cards || [];
    Modal.open(`💳 ${_fesc(m.name)}'s Cards`,
      `<div>
        ${cards.length ? cards.map((c,i)=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)"><div><div style="font-size:13px;font-weight:600">${_fesc(c.name)}</div><div style="font-size:11px;color:var(--text3)">${_fesc(c.last4?'****'+c.last4:'')}</div></div><button onclick="Family._removeCard(${JSON.stringify(idx)},${i})" style="color:var(--err);background:none;border:none;cursor:pointer;font-size:18px">×</button></div>`).join('') : '<div style="text-align:center;padding:20px;color:var(--text3)">No cards added</div>'}
        <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px">
          <input id="fc-name" placeholder="Card name" style="background:var(--glass2,var(--glass));border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);width:100%;box-sizing:border-box">
          <input id="fc-last4" placeholder="Last 4 digits (optional)" maxlength="4" style="background:var(--glass2,var(--glass));border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);width:100%;box-sizing:border-box">
          <button class="btn btn-p" onclick="Family._addCard(${JSON.stringify(idx)})">Add Card</button>
        </div>
      </div>`,
      `<button class="btn btn-g" onclick="Modal.close()">Done</button>`);
  },

  _addCard(idx) {
    const name = document.getElementById('fc-name')?.value?.trim();
    if (!name) return;
    const d = this.get();
    const m = idx === 'head' ? d.head : d.members[idx];
    if (!m.cards) m.cards = [];
    m.cards.push({ name, last4: document.getElementById('fc-last4')?.value });
    this.save(d); Modal.close(); this.manageCards(idx);
  },

  _removeCard(idx, ci) {
    const d = this.get();
    const m = idx === 'head' ? d.head : d.members[idx];
    if (m?.cards) m.cards.splice(ci,1);
    this.save(d); Modal.close(); this.manageCards(idx);
  },

  manageNotes(idx) {
    const d = this.get();
    const m = idx === 'head' ? d.head : d.members[idx];
    if (!m) return;
    Modal.open(`📝 Notes — ${_fesc(m.name)}`,
      `<textarea id="fn-notes" rows="8" style="width:100%;background:var(--glass2,var(--glass));border:1px solid var(--border);border-radius:8px;padding:12px;color:var(--text);resize:none;font-size:14px;box-sizing:border-box">${_fesc(m.notes||'')}</textarea>`,
      `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Family._saveNotes(${JSON.stringify(idx)})">Save</button>`);
  },

  _saveNotes(idx) {
    const d = this.get();
    const m = idx === 'head' ? d.head : d.members[idx];
    if (m) m.notes = document.getElementById('fn-notes')?.value;
    this.save(d); Modal.close(); this.render(); Toast.show('Notes saved','success');
  }
};
window.Family = Family;

function _fesc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
