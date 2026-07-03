'use strict';
/* Family Vault — first-class owner model
 * Members stored in S.familyMembers (flat profile list, no embedded entity arrays)
 * All entities (banks, cards, cash, investments, assets, documents) live in their
 * respective S arrays with ownerId = member.id for family-owned items.
 * Family Vault is a filtered view — it opens the same full forms used by main modules.
 */

const Family = {
  _activeId: null,  // null = list view, string memberId = member detail view
  _tab: 'overview',

  // ── Data access ──────────────────────────────────────────────────────────
  allMembers() {
    return S.familyMembers || [];
  },

  getMember(id) {
    return (S.familyMembers || []).find(m => m.id === id) || null;
  },

  ownerName(ownerId) {
    if (!ownerId || ownerId === 'self') return '';
    const m = this.getMember(ownerId);
    return m ? m.name : 'Former member';
  },

  _roleLabel(role) {
    return role === 'admin' ? 'Admin' : 'Viewer';
  },

  _roleBadge(role) {
    const isAdmin = role !== 'viewer';
    return `<span style="font-size:10px;padding:2px 8px;border-radius:8px;font-weight:700;background:${isAdmin ? 'rgba(123,95,255,.25)' : 'var(--glass2)'};color:${isAdmin ? 'var(--accent)' : 'var(--text3)'}">${this._roleLabel(role)}</span>`;
  },

  _initials(name) {
    const p = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!p.length) return '?';
    if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
    return (p[0][0] + p[p.length - 1][0]).toUpperCase();
  },

  _hueFromName(name) {
    let h = 0;
    const s = String(name || 'member');
    for (let i = 0; i < s.length; i++) h = (h + s.charCodeAt(i) * 17) % 360;
    return h;
  },

  avatarHtml(name, size = 52) {
    const initials = this._initials(name);
    const hue = this._hueFromName(name);
    const fs = Math.round(size * (initials.length > 2 ? 0.28 : 0.36));
    return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:linear-gradient(135deg,hsl(${hue},68%,42%),hsl(${(hue + 36) % 360},70%,52%));display:flex;align-items:center;justify-content:center;font-size:${fs}px;font-weight:800;color:#fff;letter-spacing:-.02em;flex-shrink:0;font-family:var(--font)">${escHtml(initials)}</div>`;
  },

  _avatarFieldHtml(name) {
    const preview = this.avatarHtml(name || 'Member', 48).replace(/^<div /, '<div id="fam-av-preview" ');
    return `<div class="fg"><label class="fl">Avatar</label><div style="display:flex;align-items:center;gap:12px">${preview}<div style="font-size:12px;color:var(--text3);line-height:1.45">Initials from name.</div></div></div>`;
  },

  _syncAvatarPreview(name) {
    const el = document.getElementById('fam-av-preview');
    if (!el) return;
    el.outerHTML = this.avatarHtml(name || 'Member', 48).replace(/^<div /, '<div id="fam-av-preview" ');
  },

  // Legacy API — used by search module and dashboard
  get() {
    const members = this.allMembers();
    const head = members.find(m => m.isHead) || null;
    const rest = members.filter(m => !m.isHead);
    return { head, members: rest };
  },

  // ── Summary helpers ───────────────────────────────────────────────────────
  memberCount() {
    return this.allMembers().length;
  },

  totalNetWorthPKR() {
    const memberIds = new Set(this.allMembers().map(m => m.id));
    if (typeof CurrencyEngine !== 'undefined' && CurrencyEngine.computeNetWorthPKR) {
      return CurrencyEngine.computeNetWorthPKR({ ownerFilter: memberIds }).nwPKR;
    }
    let total = 0;
    (S.banks || []).filter(b => memberIds.has(b.ownerId)).forEach(b => { total += b.balance || 0; });
    (S.cash || []).filter(c => memberIds.has(c.ownerId)).forEach(c => { total += c.amount || 0; });
    (S.investments || []).filter(i => memberIds.has(i.ownerId)).forEach(i => { total += i.currentValue || 0; });
    (S.assets || []).filter(a => memberIds.has(a.ownerId)).forEach(a => { total += a.currentValue || 0; });
    return total;
  },

  // ── Render ─────────────────────────────────────────────────────────────────
  _profileSnapshot() {
    return {
      name: (S.user && S.user.name) || '',
      avatar: (S.user && S.user.avatar) || '💼',
      dob: (S.user && S.user.dob) || '',
      phone: (S.user && S.user.phone) || '',
      email: (S.user && S.user.email) || '',
    };
  },

  ensureHeadFromProfile(opts = {}) {
    const members = S.familyMembers || [];
    const existing = members.find(m => m.isHead);
    if (existing) return existing;
    const p = this._profileSnapshot();
    if (!p.name) return null;
    const now = new Date().toISOString();
    const head = {
      id: U.id(),
      name: p.name,
      avatar: p.avatar,
      relation: 'Head of Family',
      isHead: true,
      role: 'admin',
      dob: p.dob,
      phone: p.phone,
      email: p.email,
      notes: '',
      createdAt: now,
      updatedAt: now,
    };
    S.familyMembers = [...members, head];
    Store.save();
    if (!opts.silent) Toast.show('Linked your profile as Head of Family', 'success');
    return head;
  },

  syncHeadFromProfile() {
    const head = (S.familyMembers || []).find(m => m.isHead);
    if (!head) return;
    const p = this._profileSnapshot();
    S.familyMembers = S.familyMembers.map(m => m.isHead ? {
      ...m,
      name: p.name || m.name,
      avatar: this._initials(p.name || m.name),
      dob: p.dob || m.dob,
      phone: p.phone || m.phone,
      email: p.email || m.email,
      updatedAt: new Date().toISOString(),
    } : m);
  },

  syncProfileFromHead() {
    const head = (S.familyMembers || []).find(m => m.isHead);
    if (!head) return;
    if (head.name) S.user.name = head.name;
    if (head.avatar) S.user.avatar = head.avatar;
    if (head.dob) S.user.dob = head.dob;
    if (head.phone) S.user.phone = head.phone;
    if (head.email) S.user.email = head.email;
  },

  confirmHeadFromProfile() {
    const head = this.ensureHeadFromProfile();
    if (head) {
      this.openMember(head.id);
    } else {
      Toast.show('Add your name in Settings → Profile first', 'warning');
      R.goto('settings');
    }
  },

  render() {
    const body = document.getElementById('pg-family-body');
    const page = document.getElementById('pg-family');
    if (!body) return;
    if (page) page.classList.toggle('family-detail', this._activeId !== null);
    if (S.modules?.family !== false && (S.user?.name || S.user?.email)) {
      this.ensureHeadFromProfile({ silent: true });
    }
    if (this._activeId !== null) { this._renderMember(body); return; }
    this._renderList(body);
  },

  _renderList(body) {
    const members = this.allMembers();

    const _stat = (id) => {
      const banks = (S.banks || []).filter(b => b.ownerId === id).length;
      const cards = (S.cards || []).filter(c => c.ownerId === id).length;
      const docs  = (S.documents || []).filter(d => d.ownerId === id).length;
      const cash  = (S.cash || []).filter(c => c.ownerId === id).length;
      const inv   = (S.investments || []).filter(i => i.ownerId === id).length;
      const assets= (S.assets || []).filter(a => a.ownerId === id).length;
      const parts = [];
      if (banks) parts.push(banks + ' bank' + (banks !== 1 ? 's' : ''));
      if (cards) parts.push(cards + ' card' + (cards !== 1 ? 's' : ''));
      if (docs)  parts.push(docs  + ' doc' + (docs !== 1 ? 's' : ''));
      if (cash)  parts.push(cash  + ' cash');
      if (inv)   parts.push(inv   + ' inv.');
      if (assets)parts.push(assets + ' asset' + (assets !== 1 ? 's' : ''));
      return parts.length ? parts.join(' · ') : 'No items yet';
    };

    const head = members.find(m => m.isHead);
    const rest = members.filter(m => !m.isHead);

    const headCard = head
      ? `<div onclick="Family.openMember('${head.id}')" style="background:linear-gradient(135deg,rgba(123,95,255,.25),rgba(0,213,255,.15));border:1px solid rgba(123,95,255,.5);border-radius:20px;padding:20px;cursor:pointer;touch-action:manipulation;position:relative;overflow:hidden;margin-bottom:12px">
          <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--accent),#00D5FF)"></div>
          <div style="position:absolute;top:10px;right:12px;font-size:10px;background:rgba(123,95,255,.4);color:#fff;padding:3px 8px;border-radius:8px;font-weight:700">HEAD</div>
          <div style="display:flex;align-items:center;gap:14px;margin-top:6px">
            ${this.avatarHtml(head.name, 60)}
            <div>
              <div style="font-size:17px;font-weight:800;color:var(--text)">${escHtml(head.name)} ${this._roleBadge(head.role || 'admin')}</div>
              <div style="font-size:12px;color:var(--text3);margin-top:2px">${_stat(head.id)}</div>
            </div>
          </div>
        </div>`
      : (S.user.name
        ? `<div onclick="Family.confirmHeadFromProfile()" style="background:rgba(123,95,255,.08);border:2px dashed rgba(123,95,255,.3);border-radius:20px;padding:24px;text-align:center;cursor:pointer;touch-action:manipulation;margin-bottom:12px">
          <div style="margin-bottom:8px;display:flex;justify-content:center">${S.user.name ? this.avatarHtml(S.user.name, 48) : (typeof VC !== 'undefined' ? VC.icon('star', 32) : '')}</div>
          <div style="font-size:15px;font-weight:700;color:var(--text)">Use ${escHtml(S.user.name)} as Head of Family</div>
          <div style="font-size:13px;color:var(--text3);margin-top:4px;line-height:1.45">Links your existing profile — no need to re-enter details</div>
        </div>`
        : `<div onclick="Family.openAddMember(true)" style="background:rgba(123,95,255,.08);border:2px dashed rgba(123,95,255,.3);border-radius:20px;padding:24px;text-align:center;cursor:pointer;touch-action:manipulation;margin-bottom:12px">
          <div style="margin-bottom:8px;display:flex;justify-content:center">${VC.icon('star',32)}</div>
          <div style="font-size:15px;font-weight:700;color:var(--text)">Set Head of Family</div>
          <div style="font-size:13px;color:var(--text3);margin-top:4px">Add your name in Settings first, or tap to enter manually</div>
        </div>`);

    const memberCards = rest.map(m =>
      `<div onclick="Family.openMember('${m.id}')" style="background:var(--glass);border:1px solid var(--border);border-radius:16px;padding:16px;margin-bottom:10px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:14px">
        ${this.avatarHtml(m.name, 52)}
        <div style="flex:1;min-width:0">
          <div style="font-size:15px;font-weight:700;color:var(--text)">${escHtml(m.name)} ${this._roleBadge(m.role || 'viewer')}</div>
          <div style="font-size:12px;color:var(--text3);margin-top:2px">${escHtml(m.relation || '')} · ${_stat(m.id)}</div>
        </div>
        <div style="color:var(--text3);font-size:20px">›</div>
      </div>`
    ).join('');

    body.innerHTML =
      `<div class="fam-list-wrap">
        ${headCard}
        <div style="display:flex;align-items:center;justify-content:space-between;margin:16px 0 10px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text3)">Family Members</div>
          <button type="button" class="btn btn-p btn-sm" onclick="Family.openAddMember(false)">+ Add</button>
        </div>
        ${rest.length ? memberCards : '<div class="empty"><div class="empty-ic">'+VC.icon('users',32)+'</div><h3>No members yet</h3><p>Add family members to manage their finances</p></div>'}
      </div>`;
  },

  _renderMember(body) {
    const m = this.getMember(this._activeId);
    if (!m) { this._activeId = null; this.render(); return; }

    const tabs = this._visibleTabs();

    const tabBar = `<div class="cap-tab-bar" role="tablist" aria-label="Family member sections">
      ${tabs.map(t => `<button type="button" class="cap-tab${this._tab === t.id ? ' on' : ''}" data-tab="${t.id}" role="tab" aria-selected="${this._tab === t.id}" onclick="Family._switchTab('${t.id}')"><span class="chip-ic">${VC.icon(t.icon,12)}</span>${t.label}</button>`).join('')}
    </div>`;

    const backBtn = `<button type="button" class="cap-subchrome-back" onclick="Family._activeId=null;Family._tab='overview';Family.render()">← Family</button>`;

    const header = `<div class="cap-member-header">
      ${this.avatarHtml(m.name, 64)}
      <div class="cap-member-meta">
        <div class="cap-member-name">${escHtml(m.name)}${m.isHead ? ' <span class="badge b-acc">Head</span>' : ''} ${this._roleBadge(m.role || (m.isHead ? 'admin' : 'viewer'))}</div>
        <div class="cap-member-sub">${escHtml(m.relation || '')}${m.dob ? ' · DOB: ' + escHtml(m.dob) : ''}</div>
      </div>
      <button type="button" class="btn btn-g btn-sm" onclick="Family.editMember('${m.id}')">Edit</button>
    </div>`;

    body.innerHTML = `<div class="cap-subchrome">${backBtn}${header}${tabBar}<div id="fm-tab-body" class="cap-tab-panel" role="tabpanel">${this._tabContent(m)}</div></div>`;
  },

  _switchTab(t) {
    this._tab = t;
    const m = this.getMember(this._activeId);
    const body = document.getElementById('fm-tab-body');
    if (body && m) body.innerHTML = this._tabContent(m);
    document.querySelectorAll('#pg-family .cap-tab[data-tab]').forEach(btn => {
      const on = btn.dataset.tab === t;
      btn.classList.toggle('on', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  },

  _tabContent(m) {
    const id = m.id;

    if (this._tab === 'overview') {
      const banks = (S.banks || []).filter(b => b.ownerId === id);
      const cards = (S.cards || []).filter(c => c.ownerId === id);
      const docs  = (S.documents || []).filter(d => d.ownerId === id);
      const cash  = (S.cash || []).filter(c => c.ownerId === id);
      const inv   = (S.investments || []).filter(i => i.ownerId === id);
      const assets= (S.assets || []).filter(a => a.ownerId === id);
      const stats = [
        { n: banks.length,  l: 'Banks',       ic: 'bank', tab: 'banks' },
        { n: cards.length,  l: 'Cards',        ic: 'card', tab: 'cards' },
        { n: cash.length,   l: 'Cash',         ic: 'banknote', tab: 'cash' },
        { n: inv.length,    l: 'Investments',  ic: 'trending-up', tab: 'investments' },
        { n: assets.length, l: 'Assets',       ic: 'building', tab: 'assets' },
        { n: docs.length,   l: 'Documents',    ic: 'id-card', tab: 'documents' },
      ];
      const fields = [
        m.phone && ['Phone', escHtml(m.phone)],
        m.email && ['Email', escHtml(m.email)],
        ['Vault Role', this._roleLabel(m.role || (m.isHead ? 'admin' : 'viewer'))],
        m.notes && ['Notes', escHtml(m.notes)],
      ].filter(Boolean);
      return `<div class="cap-member-stats">
        ${stats.map(s => `<button type="button" class="cap-stat-tile" onclick="Family._switchTab('${s.tab}')">
          <div class="cap-stat-tile-val">${s.n}</div>
          <div class="cap-stat-tile-lbl"><span class="chip-ic">${VC.icon(s.ic,12)}</span>${s.l}</div>
        </button>`).join('')}
      </div>
      ${fields.map(([k, v]) => `<div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)"><span style="font-size:13px;color:var(--text3);flex-shrink:0;min-width:80px">${k}</span><span style="font-size:13px;color:var(--text);flex:1">${v}</span></div>`).join('')}`;
    }

    if (this._tab === 'banks') {
      const items = (S.banks || []).filter(b => b.ownerId === id);
      return `<button type="button" onclick="Family.addEntity('banks')" class="btn btn-p" style="width:100%;margin-bottom:12px">+ Add Bank</button>` +
        (items.length ? items.map(b => this._bankRow(b)).join('') : '<div style="text-align:center;padding:24px;color:var(--text3)">No banks added yet</div>');
    }

    if (this._tab === 'cards') {
      const items = (S.cards || []).filter(c => c.ownerId === id);
      return `<button type="button" onclick="Family.addEntity('cards')" class="btn btn-p" style="width:100%;margin-bottom:12px">+ Add Card</button>` +
        (items.length ? items.map(c => this._cardRow(c)).join('') : '<div style="text-align:center;padding:24px;color:var(--text3)">No cards added yet</div>');
    }

    if (this._tab === 'cash') {
      const items = (S.cash || []).filter(c => c.ownerId === id);
      return `<button type="button" onclick="Family.addEntity('cash')" class="btn btn-p" style="width:100%;margin-bottom:12px">+ Add Cash</button>` +
        (items.length ? items.map(c => this._cashRow(c)).join('') : '<div style="text-align:center;padding:24px;color:var(--text3)">No cash entries yet</div>');
    }

    if (this._tab === 'investments') {
      const items = (S.investments || []).filter(i => i.ownerId === id);
      return `<button type="button" onclick="Family.addEntity('investments')" class="btn btn-p" style="width:100%;margin-bottom:12px">+ Add Investment</button>` +
        (items.length ? items.map(i => this._invRow(i)).join('') : '<div style="text-align:center;padding:24px;color:var(--text3)">No investments added yet</div>');
    }

    if (this._tab === 'assets') {
      const items = (S.assets || []).filter(a => a.ownerId === id);
      return `<button type="button" onclick="Family.addEntity('assets')" class="btn btn-p" style="width:100%;margin-bottom:12px">+ Add Asset</button>` +
        (items.length ? items.map(a => this._assetRow(a)).join('') : '<div style="text-align:center;padding:24px;color:var(--text3)">No assets added yet</div>');
    }

    if (this._tab === 'documents') {
      const items = (S.documents || []).filter(d => d.ownerId === id);
      return `<button type="button" onclick="Family.addEntity('documents')" class="btn btn-p" style="width:100%;margin-bottom:12px">+ Add Document</button>` +
        (items.length ? items.map(d => this._docRow(d)).join('') : '<div style="text-align:center;padding:24px;color:var(--text3)">No documents added yet</div>');
    }

    if (this._tab === 'notes') {
      return `<div class="fg"><label class="fl">Private notes for ${escHtml(m.name)}</label>
        <textarea class="inp" id="fam-member-notes" rows="6" placeholder="Medical info, emergency contacts, school details…">${escHtml(m.notes || '')}</textarea></div>
        <button type="button" class="btn btn-p btn-full" style="margin-top:10px" onclick="Family._saveNotes('${id}')">Save Notes</button>`;
    }

    return '';
  },

  _visibleTabs() {
    const all = [
      { id:'overview',     label:'Overview',     icon:'chart', prefKey:'overview' },
      { id:'banks',        label:'Banks',         icon:'bank', prefKey:'banks' },
      { id:'cards',        label:'Cards',         icon:'card', prefKey:'cards' },
      { id:'cash',         label:'Cash',          icon:'banknote', prefKey:'cash' },
      { id:'investments',  label:'Investments',   icon:'trending-up', prefKey:'investments' },
      { id:'assets',       label:'Assets',        icon:'building', prefKey:'assets' },
      { id:'documents',    label:'Documents',     icon:'id-card', prefKey:'docs' },
      { id:'notes',        label:'Notes',         icon:'pencil', prefKey:'notes' },
    ];
    let hidden = [];
    try { hidden = JSON.parse(localStorage.getItem('vo_family_tab_prefs') || '{}').hiddenTabs || []; } catch(e) {}
    const visible = all.filter(t => !hidden.includes(t.prefKey));
    if (!visible.find(t => t.id === this._tab)) this._tab = visible[0]?.id || 'overview';
    return visible.length ? visible : all;
  },

  _saveNotes(id) {
    const notes = document.getElementById('fam-member-notes')?.value?.trim() || '';
    S.familyMembers = (S.familyMembers || []).map(m => m.id === id ? { ...m, notes, updatedAt: new Date().toISOString() } : m);
    Store.save();
    Toast.show('Notes saved', 'success');
  },

  // ── Entity row renderers (use same full-module edit functions) ────────────
  _bankRow(b) {
    const bal = b.balance ? (b.currency || '') + ' ' + U.fmt(b.balance) : '';
    return `<div class="entry"><div class="entry-main">
      <div class="entry-ic" style="padding:0;overflow:hidden;border-radius:10px;flex-shrink:0">${typeof getBankLogo !== 'undefined' ? getBankLogo(b.bankName, 36) : VC.icon('bank', 18)}</div>
      <div class="entry-body">
        <div class="entry-name">${escHtml(b.bankName || 'Bank')}</div>
        <div class="entry-sub">${escHtml(b.accountType || '')} · ${escHtml(b.currency || '')}${bal ? ' · ' + bal : ''}</div>
        <div class="entry-meta"><span class="badge b-muted">${escHtml(b.bankType || 'bank')}</span>${b.tags?.slice(0,2).map(t=>`<span class="badge b-muted">${t}</span>`).join('')||''}</div>
      </div>
      <div class="entry-acts">
        ${U.icb('pencil',{onclick:`Family._editEntity('banks','${b.id}')`,ariaLabel:'Edit'})}${U.icb('trash',{onclick:`Family._delEntity('banks','${b.id}')`,ariaLabel:'Delete',class:'del'})}
      </div>
    </div></div>`;
  },

  _cardRow(c) {
    const expSt = typeof U !== 'undefined' && U.expSt ? U.expSt(c.expiry) : 'ok';
    const expBadge = c.expiry ? `<span class="badge ${expSt === 'ok' ? 'b-muted' : expSt === 'soon' ? 'b-warn' : 'b-err'}">${escHtml(c.expiry)}</span>` : '';
    return `<div class="entry"><div class="entry-main">
      <div class="entry-ic">${VC.icon('card', 18)}</div>
      <div class="entry-body">
        <div class="entry-name">${escHtml(c.cardName || 'Card')}</div>
        <div class="entry-sub">${escHtml(c.network || '')}${c.last4 ? ' · ****' + escHtml(c.last4) : ''}${c.cardType ? ' · ' + escHtml(c.cardType) : ''}</div>
        <div class="entry-meta">${expBadge}${c.tags?.slice(0,2).map(t=>`<span class="badge b-muted">${t}</span>`).join('')||''}</div>
      </div>
      <div class="entry-acts">
        ${U.icb('pencil',{onclick:`Family._editEntity('cards','${c.id}')`,ariaLabel:'Edit'})}${U.icb('trash',{onclick:`Family._delEntity('cards','${c.id}')`,ariaLabel:'Delete',class:'del'})}
      </div>
    </div></div>`;
  },

  _cashRow(c) {
    return `<div class="entry"><div class="entry-main">
      <div class="entry-ic">${VC.icon('banknote', 18)}</div>
      <div class="entry-body">
        <div class="entry-name">${escHtml(c.location || 'Cash')}</div>
        <div class="entry-sub sens">${U.fmt(c.amount || 0)} ${escHtml(c.currency || '')}${c.notes ? ' · ' + escHtml(c.notes) : ''}</div>
        <div class="entry-meta">${c.tags?.slice(0,2).map(t=>`<span class="badge b-muted">${t}</span>`).join('')||''}</div>
      </div>
      <div class="entry-acts">
        ${U.icb('pencil',{onclick:`Family._editEntity('cash','${c.id}')`,ariaLabel:'Edit'})}${U.icb('trash',{onclick:`Family._delEntity('cash','${c.id}')`,ariaLabel:'Delete',class:'del'})}
      </div>
    </div></div>`;
  },

  _invRow(i) {
    return `<div class="entry"><div class="entry-main">
      <div class="entry-ic">${VC.investIcon(i.type, 18)}</div>
      <div class="entry-body">
        <div class="entry-name">${escHtml(i.investmentName || i.broker || 'Investment')}</div>
        <div class="entry-sub">${escHtml(i.broker || '')} · ${escHtml(i.type || '')} · ${escHtml(i.currency || '')}</div>
        <div class="entry-meta">${i.currentValue ? `<span class="badge b-acc sens">${U.fmt(i.currentValue)} ${i.currency || ''}</span>` : ''}${i.tags?.slice(0,2).map(t=>`<span class="badge b-muted">${t}</span>`).join('')||''}</div>
      </div>
      <div class="entry-acts">
        ${U.icb('pencil',{onclick:`Family._editEntity('investments','${i.id}')`,ariaLabel:'Edit'})}${U.icb('trash',{onclick:`Family._delEntity('investments','${i.id}')`,ariaLabel:'Delete',class:'del'})}
      </div>
    </div></div>`;
  },

  _assetRow(a) {
    return `<div class="entry"><div class="entry-main">
      <div class="entry-ic">${VC.assetIcon(a.assetType, 18)}</div>
      <div class="entry-body">
        <div class="entry-name">${escHtml(a.name || 'Asset')}</div>
        <div class="entry-sub">${escHtml(a.assetType || '')} · ${escHtml(a.currency || '')}${a.currentValue ? ' · ' + U.fmt(a.currentValue) : ''}</div>
        <div class="entry-meta">${a.tags?.slice(0,2).map(t=>`<span class="badge b-muted">${t}</span>`).join('')||''}</div>
      </div>
      <div class="entry-acts">
        ${U.icb('pencil',{onclick:`Family._editEntity('assets','${a.id}')`,ariaLabel:'Edit'})}${U.icb('trash',{onclick:`Family._delEntity('assets','${a.id}')`,ariaLabel:'Delete',class:'del'})}
      </div>
    </div></div>`;
  },

  _docRow(d) {
    const schema = typeof DOC_SCHEMAS !== 'undefined' ? (DOC_SCHEMAS[d.docType] || DOC_SCHEMAS.other) : { ic:'id-card', label: d.docType || 'Document' };
    const now = new Date();
    const exp = d.expiryDate ? new Date(d.expiryDate) : null;
    const daysLeft = exp ? Math.ceil((exp - now) / 864e5) : null;
    const expBadge = daysLeft !== null ? `<span class="badge ${daysLeft < 0 ? 'b-err' : daysLeft <= 30 ? 'b-warn' : 'b-muted'}">${daysLeft < 0 ? 'Expired' : 'Exp ' + exp.toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'2-digit'})}</span>` : '';
    return `<div class="entry"><div class="entry-main">
      <div class="entry-ic">${VC.iconKey(schema.ic || 'id-card', 18)}</div>
      <div class="entry-body">
        <div class="entry-name">${schema.label || escHtml(d.docType || 'Document')}</div>
        <div class="entry-sub">${escHtml(d.holderName || '')}${d.docNumber ? ' · ' + escHtml(d.docNumber) : ''}</div>
        <div class="entry-meta">${expBadge}${d.tags?.slice(0,2).map(t=>`<span class="badge b-muted">${t}</span>`).join('')||''}</div>
      </div>
      <div class="entry-acts">
        ${U.icb('pencil',{onclick:`Family._editEntity('documents','${d.id}')`,ariaLabel:'Edit'})}${U.icb('trash',{onclick:`Family._delEntity('documents','${d.id}')`,ariaLabel:'Delete',class:'del'})}
      </div>
    </div></div>`;
  },

  // ── Entity actions ────────────────────────────────────────────────────────
  addEntity(type) {
    const m = this.getMember(this._activeId);
    if (!m) return;
    const prefill = { ownerId: m.id, ownerName: m.name };
    if (type === 'banks'       && typeof Banks !== 'undefined')      { Banks.openAdd(prefill); }
    else if (type === 'cards'  && typeof Cards !== 'undefined')      { Cards.openAdd(prefill); }
    else if (type === 'cash'   && typeof Cash !== 'undefined')       { Cash.openAdd(prefill); }
    else if (type === 'investments' && typeof Inv !== 'undefined')   { Inv.openAdd(prefill); }
    else if (type === 'assets' && typeof Assets !== 'undefined')     { Assets.openAdd(prefill); }
    else if (type === 'documents' && typeof DocsModule !== 'undefined') { DocsModule.openAdd(prefill); }
  },

  _editEntity(type, id) {
    // Store current family context so we can re-render after save
    window._familyEditCtx = { memberId: this._activeId, tab: this._tab };
    if (type === 'banks'       && typeof Banks !== 'undefined')      Banks.edit(id);
    else if (type === 'cards'  && typeof Cards !== 'undefined')      Cards.edit(id);
    else if (type === 'cash'   && typeof Cash !== 'undefined')       Cash.edit(id);
    else if (type === 'investments' && typeof Inv !== 'undefined')   Inv.edit(id);
    else if (type === 'assets' && typeof Assets !== 'undefined')     Assets.edit(id);
    else if (type === 'documents' && typeof DocsModule !== 'undefined') DocsModule.edit(id);
  },

  _delEntity(type, id) {
    if (!window.__vos_confirm('Move this item to Trash?')) return;
    const arr = S[type === 'documents' ? 'documents' : type];
    if (!arr) return;
    const item = arr.find(x => x.id === id);
    if (!item) return;
    S.trash = S.trash || [];
    S.trash.push({ id: U.id(), type, data: item, deletedAt: new Date().toISOString() });
    if (type === 'documents') { S.documents = S.documents.filter(x => x.id !== id); }
    else { S[type] = arr.filter(x => x.id !== id); }
    Store.save();
    this.render();
    Toast.show('Moved to Trash', 'info');
  },

  // ── Member CRUD ────────────────────────────────────────────────────────────
  openMember(id) {
    this._activeId = id;
    this._tab = 'overview';
    this.render();
  },

  openAddMember(isHead) {
    const p = isHead ? this._profileSnapshot() : { name:'', dob:'', phone:'', email:'' };
    Modal.open(isHead ? 'Head of Family' : 'Add Family Member',
      `${isHead && p.name ? `<p style="font-size:12px;color:var(--text2);line-height:1.5;margin-bottom:10px">Prefilled from your profile — edit anything before saving.</p>` : ''}
      <div style="display:flex;flex-direction:column;gap:10px">
        <div class="fg"><label class="fl">Name *</label><input class="inp" id="fam-name" value="${escHtml(p.name || '')}" placeholder="Full name" oninput="Family._syncAvatarPreview(this.value)"></div>
        ${this._avatarFieldHtml(p.name || '')}
        ${!isHead ? `<div class="fg"><label class="fl">Relationship</label><datalist id="fRelDL3"><option>Spouse</option><option>Son</option><option>Daughter</option><option>Father</option><option>Mother</option><option>Brother</option><option>Sister</option><option>Grandparent</option></datalist><input class="inp" id="fam-rel" value="" list="fRelDL3" placeholder="Spouse, Son, Daughter..."></div>` : ''}
        <div class="fr">
          <div class="fg"><label class="fl">Date of Birth</label><input class="inp" id="fam-dob" type="date" value="${escHtml(p.dob || '')}"></div>
          <div class="fg"><label class="fl">Phone</label><input class="inp" id="fam-phone" value="${escHtml(p.phone || '')}" placeholder="+44..."></div>
        </div>
        <div class="fg"><label class="fl">Email</label><input class="inp" id="fam-email" value="${escHtml(p.email || '')}" placeholder="email@example.com"></div>
        <div class="fg"><label class="fl">Vault Role</label><select class="inp" id="fam-role"><option value="admin"${isHead ? ' selected' : ''}>Admin — can manage family vault</option><option value="viewer"${!isHead ? ' selected' : ''}>Viewer — label only (not enforced yet)</option></select></div>
        <div class="fg"><label class="fl">Notes</label><textarea class="inp" id="fam-notes" rows="2"></textarea></div>
      </div>`,
      `<button type="button" class="btn btn-g" onclick="Modal.close()">Cancel</button>` +
      `<button type="button" class="btn btn-p" onclick="Family._saveNewMember(${isHead})">Save</button>`
    );
  },

  _saveNewMember(isHead) {
    const name = (document.getElementById('fam-name')?.value || '').trim();
    if (!name) { Toast.show('Name required', 'warning'); return; }
    const now = new Date().toISOString();
    const member = {
      id: U.id(),
      name,
      avatar: this._initials(name),
      relation: isHead ? 'Head of Family' : (document.getElementById('fam-rel')?.value?.trim() || ''),
      isHead: !!isHead,
      role: isHead ? 'admin' : (document.getElementById('fam-role')?.value || 'viewer'),
      dob:   document.getElementById('fam-dob')?.value   || '',
      phone: document.getElementById('fam-phone')?.value?.trim() || '',
      email: document.getElementById('fam-email')?.value?.trim() || '',
      notes: document.getElementById('fam-notes')?.value?.trim() || '',
      createdAt: now, updatedAt: now,
    };
    if (!S.familyMembers) S.familyMembers = [];
    // Only one head allowed
    if (isHead) S.familyMembers = S.familyMembers.map(m => ({ ...m, isHead: false }));
    S.familyMembers.push(member);
    if (isHead) this.syncProfileFromHead();
    Store.save();
    Modal.close();
    this.render();
    Toast.show('Member added', 'success');
  },

  editMember(id) {
    const m = this.getMember(id);
    if (!m) return;
    Modal.open(m.isHead ? 'Edit Head of Family' : 'Edit Member',
      `<div style="display:flex;flex-direction:column;gap:10px">
        <div class="fg"><label class="fl">Name *</label><input class="inp" id="fam-name" value="${escHtml(m.name)}" placeholder="Full name" oninput="Family._syncAvatarPreview(this.value)"></div>
        ${this._avatarFieldHtml(m.name)}
        ${!m.isHead ? `<div class="fg"><label class="fl">Relationship</label><datalist id="fRelDL4"><option>Spouse</option><option>Son</option><option>Daughter</option><option>Father</option><option>Mother</option><option>Brother</option><option>Sister</option></datalist><input class="inp" id="fam-rel" value="${escHtml(m.relation || '')}" list="fRelDL4" placeholder="Spouse, Son, Daughter..."></div>` : ''}
        <div class="fr">
          <div class="fg"><label class="fl">Date of Birth</label><input class="inp" id="fam-dob" type="date" value="${escHtml(m.dob || '')}"></div>
          <div class="fg"><label class="fl">Phone</label><input class="inp" id="fam-phone" value="${escHtml(m.phone || '')}" placeholder="+92..."></div>
        </div>
        <div class="fg"><label class="fl">Email</label><input class="inp" id="fam-email" value="${escHtml(m.email || '')}" placeholder="email@example.com"></div>
        <div class="fg"><label class="fl">Vault Role</label><select class="inp" id="fam-role"><option value="admin"${(m.role || (m.isHead ? 'admin' : 'viewer')) === 'admin' ? ' selected' : ''}>Admin — can manage family vault</option><option value="viewer"${(m.role || (m.isHead ? 'admin' : 'viewer')) === 'viewer' ? ' selected' : ''}>Viewer — label only (not enforced yet)</option></select></div>
        <div class="fg"><label class="fl">Notes</label><textarea class="inp" id="fam-notes" rows="2">${escHtml(m.notes || '')}</textarea></div>
      </div>`,
      `<button type="button" class="btn btn-g" onclick="Modal.close()">Cancel</button>` +
      (!m.isHead ? `<button type="button" class="btn btn-d btn-sm" onclick="Family._deleteMember('${id}')">Delete</button>` : '') +
      `<button type="button" class="btn btn-p" onclick="Family._updateMember('${id}')">Save</button>`
    );
  },

  _updateMember(id) {
    const name = (document.getElementById('fam-name')?.value || '').trim();
    if (!name) { Toast.show('Name required', 'warning'); return; }
    S.familyMembers = (S.familyMembers || []).map(m => {
      if (m.id !== id) return m;
      return {
        ...m,
        name,
        avatar: this._initials(name),
        relation: m.isHead ? 'Head of Family' : (document.getElementById('fam-rel')?.value?.trim() || m.relation || ''),
        role: document.getElementById('fam-role')?.value || m.role || (m.isHead ? 'admin' : 'viewer'),
        dob:   document.getElementById('fam-dob')?.value   || m.dob,
        phone: document.getElementById('fam-phone')?.value?.trim() || m.phone,
        email: document.getElementById('fam-email')?.value?.trim() || m.email,
        notes: document.getElementById('fam-notes')?.value?.trim() || m.notes,
        updatedAt: new Date().toISOString(),
      };
    });
    const updated = S.familyMembers.find(m => m.id === id);
    if (updated?.isHead) this.syncProfileFromHead();
    Store.save();
    Modal.close();
    this.render();
    Toast.show('Member updated', 'success');
  },

  _deleteMember(id) {
    if (!window.__vos_confirm('Remove this family member? Their financial records will remain in the vault with their owner tag.')) return;
    S.familyMembers = (S.familyMembers || []).filter(m => m.id !== id);
    Store.save();
    this._activeId = null;
    Modal.close();
    this.render();
    Toast.show('Member removed', 'success');
  },
};
window.Family = Family;
