'use strict';
/* SmartAdd, CMD (command palette), FAB */

const SmartAdd = {
  open() {
    Modal.open('✨ Smart Add', `
      <p style="font-size:12px;color:var(--text2);margin-bottom:14px;line-height:1.6">Describe what to add in plain English. VaultCap detects the type and pre-fills the form — works offline, no AI needed.</p>
      <div class="fg">
        <label class="fl">What do you want to add?</label>
        <textarea class="inp" id="sa-text" rows="4" placeholder="Chase account USD 12,500 balance&#10;Lent $500 to Ahmed, due June 2026&#10;Netflix $17.99 monthly&#10;Vodafone SIM +44 7700 900123" style="font-size:13px;line-height:1.6"></textarea>
      </div>
      <div style="font-size:11px;color:var(--text3);margin-top:8px;line-height:1.5">Examples: bank + balance · card + last 4 · loan to someone · subscription · SIM number</div>
    `, `<button type="button" class="btn btn-g" onclick="Modal.close()">Cancel</button><button type="button" class="btn btn-p" id="sa-run-btn" onclick="SmartAdd.run()">✨ Detect &amp; Pre-fill</button>`);
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
  /** Opens the command palette, clears input, and focuses the search field. */
  open() {
    document.getElementById('cmdPal').classList.add('on');
    document.getElementById('cmdIn').value = '';
    this.search('');
    setTimeout(() => document.getElementById('cmdIn').focus(), 80);
  },
  /** Closes the command palette and resets the keyboard-navigation index. */
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
  },
  /** Closes the palette and opens a modal listing all keyboard shortcuts. */
  showHelp() {
    this.close();
    const row = (k, desc) => `<div style="display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border)"><span style="font-size:13px;color:var(--text2)">${desc}</span><span class="kbd">${k}</span></div>`;
    Modal.open('Keyboard Shortcuts',
      `<div style="margin:-4px 0">
        ${row('⌘K','Open command palette')}
        ${row('⌘N','Add new item')}
        ${row('⌘L','Lock vault')}
        ${row('⌘S','Settings')}
        ${row('⌘E','Export vault')}
        ${row('↑ ↓','Navigate results')}
        ${row('⏎','Select / confirm')}
        ${row('Esc','Close / dismiss')}
        ${row('?','Show this help')}
      </div>`
    );
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
