const GlobalSearch = {
  activeFilter: 'all',

  _TARGETS: [
    { key: 'banks',       label: 'Bank',        icon: '🏦', fields: ['bankName','accountType','iban','notes','last4'] },
    { key: 'cards',       label: 'Card',        icon: '💳', fields: ['cardName','network','last4','notes'] },
    { key: 'investments', label: 'Investment',  icon: '📈', fields: ['investmentName','broker','ticker','type','notes'] },
    { key: 'cash',        label: 'Cash',        icon: '💵', fields: ['label','currency','location','notes'] },
    { key: 'loans',       label: 'Loan',        icon: '💸', fields: ['person','type','notes'] },
    { key: 'documents',   label: 'Document',    icon: '🪪', fields: ['docType','holderName','docNumber','issuingCountry','notes'] },
    { key: 'assets',      label: 'Asset',       icon: '🏠', fields: ['name','assetType','make','model','notes'] },
    { key: 'friends',     label: 'Contact',     icon: '👥', fields: ['name','phone','email','notes'] },
    { key: 'sims',        label: 'SIM',         icon: '📱', fields: ['network','phone','country','notes'] },
    { key: 'emails',      label: 'Email',       icon: '📧', fields: ['email','provider','purpose','notes'] },
    { key: 'expenses',    label: 'Subscription',icon: '🔄', fields: ['name','category','notes'] },
    { key: 'gadgets',     label: 'Device',      icon: '💻', fields: ['name','brand','model','serialNum','notes'] },
    { key: 'digital',     label: 'Login',       icon: '💼', fields: ['serviceName','username','category','notes'] },
    { key: 'bc',          label: 'Committee',   icon: '🤝', fields: ['name','organiser','notes'] },
    { key: 'bonds',       label: 'Bond',        icon: '🎫', fields: ['name','typeId','issuer','notes'] },
  ],

  _FILTER_KEYS: {
    bank: 'Bank', card: 'Card', investment: 'Investment', cash: 'Cash',
    loan: 'Loan', document: 'Document', asset: 'Asset', contact: 'Contact',
    sim: 'SIM', email: 'Email', subscription: 'Subscription', device: 'Device',
    login: 'Login', committee: 'Committee', bond: 'Bond', family: 'Family',
  },

  render() {
    const b = document.getElementById('searchBody'); if (!b) return;
    const filters = ['all','bank','card','investment','cash','loan','document','asset','contact','sim','email','subscription','device','login','committee','bond','family'];
    const filterLabels = { all:'All', bank:'🏦 Banks', card:'💳 Cards', investment:'📈 Invest', cash:'💵 Cash', loan:'💸 Loans', document:'🪪 Docs', asset:'🏠 Assets', contact:'👥 Contacts', sim:'📱 SIMs', email:'📧 Emails', subscription:'🔄 Subs', device:'💻 Devices', login:'💼 Logins', committee:'🤝 BC', bond:'🎫 Bonds', family:'👨‍👩‍👧‍👦 Family' };
    b.innerHTML = `
    <div style="padding:14px 14px 0;position:sticky;top:0;z-index:10;background:var(--bg2);padding-bottom:10px">
      <div style="position:relative;margin-bottom:10px">
        <span style="position:absolute;left:13px;top:50%;transform:translateY(-50%);font-size:16px;pointer-events:none">🔍</span>
        <input id="gs-input" class="inp" placeholder="Search everything — cards, banks, devices, docs..." style="padding-left:40px;font-size:15px;border-radius:14px" oninput="GlobalSearch.search(this.value)" autocomplete="off">
        <button onclick="document.getElementById('gs-input').value='';GlobalSearch.search('')" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:16px;color:var(--text3)">✕</button>
      </div>
      <div style="display:flex;overflow-x:auto;gap:6px;scrollbar-width:none;padding-bottom:2px">
        ${filters.map(f => `<div class="search-chip${GlobalSearch.activeFilter === f ? ' on' : ''}" onclick="GlobalSearch.setFilter('${f}')">${filterLabels[f]}</div>`).join('')}
      </div>
    </div>
    <div id="gs-results" style="padding:8px 0"></div>`;
    setTimeout(() => this.search(''), 0);
  },

  setFilter(f) { this.activeFilter = f; this.render(); setTimeout(() => document.getElementById('gs-input')?.focus(), 60); },

  highlight(text, q) {
    if (!q || !text) return escHtml(text || '');
    const str = String(text);
    const idx = str.toLowerCase().indexOf(q.toLowerCase());
    if (idx < 0) return escHtml(str);
    return escHtml(str.slice(0, idx)) + '<mark class="hl">' + escHtml(str.slice(idx, idx + q.length)) + '</mark>' + escHtml(str.slice(idx + q.length));
  },

  _match(text, ql) {
    if (!ql) return true;
    if (!text) return false;
    const tl = text.toString().toLowerCase();
    if (tl.includes(ql)) return true;
    if (typeof CMD !== 'undefined' && CMD.fuzzyMatch) return CMD.fuzzyMatch(text, ql);
    return false;
  },

  _ownerLabel(item) {
    const ownerId = item.ownerId;
    if (!ownerId || ownerId === 'self') return '';
    const members = (typeof S !== 'undefined' && S.familyMembers) || [];
    const m = members.find(x => x.id === ownerId);
    return m ? m.name : ownerId;
  },

  _primaryField(item, fields) {
    for (const f of fields) {
      if (item[f]) return String(item[f]);
    }
    return '';
  },

  _secondaryField(item, fields, skipFirst) {
    let skipped = false;
    for (const f of fields) {
      const v = item[f];
      if (!v) continue;
      if (!skipped) { skipped = true; continue; }
      return String(v);
    }
    return '';
  },

  _filterKeyFor(label) {
    const map = {
      'Bank': 'bank', 'Card': 'card', 'Investment': 'investment', 'Cash': 'cash',
      'Loan': 'loan', 'Document': 'document', 'Asset': 'asset', 'Contact': 'contact',
      'SIM': 'sim', 'Email': 'email', 'Subscription': 'subscription', 'Device': 'device',
      'Login': 'login', 'Committee': 'committee', 'Bond': 'bond', 'Family Member': 'family',
    };
    return map[label] || 'all';
  },

  search(q) {
    const el = document.getElementById('gs-results'); if (!el) return;
    const ql = q.toLowerCase().trim();
    const f = this.activeFilter;
    const results = [];

    // Search entity modules
    this._TARGETS.forEach(t => {
      const filterKey = this._filterKeyFor(t.label);
      if (f !== 'all' && f !== filterKey) return;
      if (typeof S !== 'undefined' && S.modules && S.modules[t.key] === false) return;
      (S[t.key] || []).forEach(item => {
        const hit = !ql || t.fields.some(field => this._match(item[field], ql));
        if (!hit) return;
        const primary = this._primaryField(item, t.fields);
        const secondary = this._secondaryField(item, t.fields);
        const owner = this._ownerLabel(item);
        const valueStr = (() => {
          const c = item.currency || '';
          if (t.key === 'banks' && item.balance) return c + ' ' + Math.round(item.balance).toLocaleString();
          if (t.key === 'cash' && item.amount) return c + ' ' + Math.round(item.amount).toLocaleString();
          if (t.key === 'investments' && item.currentValue) return c + ' ' + Math.round(item.currentValue).toLocaleString();
          if (t.key === 'loans' && item.amount) return c + ' ' + Math.round(item.amount).toLocaleString();
          if (t.key === 'assets' && (item.currentValue || item.purchasePrice)) return c + ' ' + Math.round(item.currentValue || item.purchasePrice).toLocaleString();
          return '';
        })();
        results.push({ _label: t.label, _icon: t.icon, _key: t.key, _primary: primary, _secondary: secondary, _owner: owner, _id: item.id, _valueStr: valueStr });
      });
    });

    // Gold (localStorage)
    if (f === 'all' || f === 'asset') {
      try {
        const gi = JSON.parse(localStorage.getItem('vo_gold') || '[]');
        gi.forEach((g, i) => {
          const label = g.label || (g.metal === 'silver' ? 'Silver' : 'Gold');
          const sub = (g.metal === 'silver' ? 'Silver' : 'Gold') + ' · ' + g.weight + ' ' + (g.unit || 'g');
          if (!ql || this._match(label, ql) || this._match(sub, ql)) {
            results.push({ _label: 'Asset', _icon: g.metal === 'silver' ? '🥈' : '🥇', _key: 'gold', _primary: label, _secondary: sub, _owner: '', _id: 'gold_' + i, _valueStr: '' });
          }
        });
      } catch(e) {}
    }

    // Family members
    if (f === 'all' || f === 'family') {
      (S.familyMembers || []).forEach(m => {
        const hit = !ql || this._match(m.name, ql) || this._match(m.phone, ql) || this._match(m.email, ql) || this._match(m.notes, ql);
        if (!hit) return;
        results.push({ _label: 'Family Member', _icon: '👨‍👩‍👧‍👦', _key: 'family', _primary: m.name || '', _secondary: (m.relation || m.phone || ''), _owner: '', _id: m.id, _valueStr: '' });
      });
    }

    if (!results.length) {
      el.innerHTML = `<div class="empty"><div class="empty-ic">🔍</div><h3>${q ? 'Nothing found for "' + escHtml(q) + '"' : 'Your vault is empty'}</h3><p>${q ? 'Try different keywords or change the filter' : 'Add entries from the + button or any module tab'}</p></div>`;
      return;
    }

    // Group by label
    const groups = {};
    results.forEach(r => {
      if (!groups[r._label]) groups[r._label] = [];
      groups[r._label].push(r);
    });

    const _navAction = { bank:'Banks', card:'Cards', investment:'Investments', cash:'Cash', loan:'Loans', document:'Documents', asset:'Assets', contact:'Friends', sim:'Sims', email:'Emails', subscription:'Exp', device:'Gadgets', login:'Digital', committee:'BC', bond:'Bonds', 'Family Member':'Family' };
    const _gotoMap = { bank:'banks', card:'cards', investment:'investments', cash:'cash', loan:'loans', document:'documents', asset:'assets', contact:'friends', sim:'sims', email:'emails', subscription:'expenses', device:'gadgets', login:'digital', committee:'bc', bond:'bonds', 'Family Member':'family' };

    let html = `<div style="font-size:12px;color:var(--text3);padding:4px 14px 8px">${results.length} result${results.length !== 1 ? 's' : ''}${ql ? ' for "' + escHtml(q) + '"' : ''}</div>`;

    Object.entries(groups).forEach(([groupLabel, items]) => {
      const gotoKey = _gotoMap[groupLabel] || items[0]._key;
      html += `<div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;padding:8px 14px 4px">${escHtml(groupLabel)}s <span style="font-weight:400;opacity:.6">${items.length}</span></div>`;
      html += items.map(item => {
        const ownerBadge = item._owner ? ` · 👤 ${escHtml(item._owner)}` : '';
        const secLine = [item._secondary ? escHtml(item._secondary) : '', ownerBadge].filter(Boolean).join('');
        return `<div onclick="R.goto('${gotoKey}')" style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px 14px;margin:0 8px 8px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:12px;-webkit-tap-highlight-color:transparent" onmouseenter="this.style.background='var(--glass2)'" onmouseleave="this.style.background='var(--glass)'">
          <div style="font-size:26px;flex-shrink:0">${item._icon}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:14px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${ql ? this.highlight(item._primary, q) : escHtml(item._primary)}</div>
            ${secLine ? `<div style="font-size:12px;color:var(--text3);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${secLine}</div>` : ''}
          </div>
          ${item._valueStr ? `<div style="font-size:12px;font-weight:700;color:var(--accent);flex-shrink:0;text-align:right;max-width:100px;overflow:hidden;text-overflow:ellipsis" class="sens">${escHtml(item._valueStr)}</div>` : `<div style="font-size:16px;color:var(--text3);flex-shrink:0">›</div>`}
        </div>`;
      }).join('');
    });

    el.innerHTML = html;
  }
};
