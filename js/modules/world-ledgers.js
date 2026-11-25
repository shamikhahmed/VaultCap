'use strict';
// VaultCap worldwide ledgers — Payment handles, Remittances, Giving. © 2026 Shamikh Ahmed.
/* Three small record types that people in most countries keep somewhere, built on one
   schema-driven engine so they share forms, trash/undo, search, reminders and timeline.
   Research: docs/research/worldwide-features.md §1.2, §1.3, §2.1. */

/* ── Payment rails: what the handle looks like and where it is used ── */
const PAY_RAILS = [
  { id: 'upi', n: 'UPI', cc: ['IN'], types: ['UPI ID (VPA)', 'Mobile number'], ph: 'name@okhdfc', check: v => /^[\w.\-]{2,256}@[A-Za-z][\w.]{1,63}$/.test(v) || 'A UPI ID looks like name@bank' },
  { id: 'pix', n: 'Pix', cc: ['BR'], types: ['CPF', 'CNPJ', 'Phone', 'Email', 'Random key'], ph: 'CPF, phone, email or random key' },
  { id: 'paynow', n: 'PayNow', cc: ['SG'], types: ['Mobile number', 'NRIC / FIN', 'UEN', 'VPA'], ph: '+65 …' },
  { id: 'raast', n: 'Raast', cc: ['PK'], types: ['Raast ID (mobile)', 'IBAN'], ph: '03xx xxxxxxx' },
  { id: 'mpesa', n: 'M-Pesa', cc: ['KE', 'TZ', 'MZ', 'CD', 'GH', 'EG', 'LS'], types: ['Phone number', 'Paybill + account', 'Till number'], ph: '07xx xxx xxx' },
  { id: 'mtn', n: 'MTN MoMo', cc: ['GH', 'UG', 'CM', 'CI', 'RW', 'ZM', 'BJ', 'CG', 'GN', 'LR', 'ZA', 'NG'], types: ['Phone number', 'Merchant ID'], ph: 'Mobile number' },
  { id: 'airtel', n: 'Airtel Money', cc: ['KE', 'UG', 'TZ', 'ZM', 'MW', 'RW', 'NG', 'CD', 'MG', 'NE', 'TD', 'GA', 'CG', 'SC'], types: ['Phone number'], ph: 'Mobile number' },
  { id: 'orange', n: 'Orange Money', cc: ['SN', 'CI', 'ML', 'CM', 'BF', 'GN', 'MG', 'CD', 'BW', 'LR', 'SL', 'JO', 'EG', 'MA', 'TN'], types: ['Phone number'], ph: 'Mobile number' },
  { id: 'wave', n: 'Wave', cc: ['SN', 'CI', 'ML', 'BF', 'UG', 'GM'], types: ['Phone number'], ph: 'Mobile number' },
  { id: 'bkash', n: 'bKash', cc: ['BD'], types: ['Phone number'], ph: '01xxx xxxxxx' },
  { id: 'nagad', n: 'Nagad', cc: ['BD'], types: ['Phone number'], ph: '01xxx xxxxxx' },
  { id: 'jazzcash', n: 'JazzCash', cc: ['PK'], types: ['Phone number'], ph: '03xx xxxxxxx' },
  { id: 'easypaisa', n: 'Easypaisa', cc: ['PK'], types: ['Phone number'], ph: '03xx xxxxxxx' },
  { id: 'gcash', n: 'GCash', cc: ['PH'], types: ['Phone number'], ph: '09xx xxx xxxx' },
  { id: 'maya', n: 'Maya', cc: ['PH'], types: ['Phone number'], ph: '09xx xxx xxxx' },
  { id: 'promptpay', n: 'PromptPay', cc: ['TH'], types: ['Phone number', 'National ID', 'e-Wallet ID'], ph: '08x xxx xxxx' },
  { id: 'duitnow', n: 'DuitNow', cc: ['MY'], types: ['Mobile number', 'MyKad', 'Business reg. no.', 'Passport'], ph: '+60 …' },
  { id: 'qris', n: 'QRIS / e-wallet', cc: ['ID'], types: ['GoPay / OVO / DANA phone', 'Merchant ID'], ph: '08xx xxxx xxxx' },
  { id: 'spei', n: 'SPEI', cc: ['MX'], types: ['CLABE', 'Debit card', 'Phone (CoDi / DiMo)'], ph: '18-digit CLABE', check: (v, t) => t !== 'CLABE' || /^\d{18}$/.test(v.replace(/\s/g, '')) || 'A CLABE has 18 digits' },
  { id: 'fps', n: 'FPS', cc: ['HK'], types: ['Mobile number', 'Email', 'FPS ID'], ph: 'FPS ID or phone' },
  { id: 'alipay', n: 'Alipay', cc: ['CN'], types: ['Account (phone / email)'], ph: 'Phone or email' },
  { id: 'wechat', n: 'WeChat Pay', cc: ['CN'], types: ['WeChat ID'], ph: 'WeChat ID' },
  { id: 'paypay', n: 'PayPay', cc: ['JP'], types: ['PayPay ID', 'Phone number'], ph: 'PayPay ID' },
  { id: 'kakaopay', n: 'KakaoPay / Toss', cc: ['KR'], types: ['Phone number', 'Account'], ph: '010-xxxx-xxxx' },
  { id: 'bizum', n: 'Bizum', cc: ['ES'], types: ['Phone number'], ph: '+34 6xx xxx xxx' },
  { id: 'swish', n: 'Swish', cc: ['SE'], types: ['Phone number', 'Swish number'], ph: '07x xxx xx xx' },
  { id: 'mobilepay', n: 'MobilePay / Vipps', cc: ['DK', 'FI', 'NO'], types: ['Phone number', 'Box number'], ph: 'Phone number' },
  { id: 'blik', n: 'BLIK', cc: ['PL'], types: ['Phone number'], ph: '+48 …' },
  { id: 'twint', n: 'TWINT', cc: ['CH', 'LI'], types: ['Phone number'], ph: '+41 …' },
  { id: 'interac', n: 'Interac e-Transfer', cc: ['CA'], types: ['Email', 'Phone number'], ph: 'Email or phone' },
  { id: 'zelle', n: 'Zelle', cc: ['US'], types: ['Email', 'Phone number'], ph: 'Email or phone' },
  { id: 'venmo', n: 'Venmo', cc: ['US'], types: ['@username', 'Phone number'], ph: '@username' },
  { id: 'cashapp', n: 'Cash App', cc: ['US', 'GB'], types: ['$Cashtag'], ph: '$cashtag', check: (v, t) => t !== '$Cashtag' || /^\$\w{1,20}$/.test(v) || 'A $Cashtag starts with $' },
  { id: 'paypal', n: 'PayPal', cc: [], types: ['Email', 'PayPal.Me link', 'Phone number'], ph: 'Email or paypal.me/name' },
  { id: 'wise', n: 'Wise', cc: [], types: ['Wisetag', 'Email', 'Account details'], ph: '@wisetag' },
  { id: 'revolut', n: 'Revolut', cc: [], types: ['Revtag', 'Phone number'], ph: '@revtag' },
  { id: 'iban', n: 'IBAN / bank transfer', cc: [], types: ['IBAN', 'Account + sort code', 'Account + routing'], ph: 'IBAN or account details' },
  { id: 'crypto', n: 'Crypto address', cc: [], types: ['Wallet address', 'ENS / handle'], ph: 'Public address only — never a seed phrase' },
  { id: 'other', n: 'Other', cc: [], types: ['Handle', 'Phone number', 'Email'], ph: 'Handle' },
];

const REMIT_PROVIDERS = ['Wise', 'Remitly', 'Western Union', 'MoneyGram', 'WorldRemit', 'Taptap Send', 'Sendwave', 'Ria', 'Xoom (PayPal)', 'Revolut', 'Lemfi', 'ACE Money Transfer', 'Al Ansari Exchange', 'UAE Exchange / Unimoni', 'Bank transfer (SWIFT)', 'Hawala / hundi agent', 'Crypto / stablecoin', 'Cash carried'];
const REMIT_METHODS = { bank: 'Bank deposit', cash: 'Cash pickup', wallet: 'Mobile wallet', home: 'Home delivery', agent: 'Hawala / hundi agent', crypto: 'Crypto', card: 'Card' };
const REMIT_PURPOSES = ['Family support', 'Education', 'Medical', 'Property / construction', 'Savings / investment', 'Zakat / charity', 'Committee / savings circle', 'Wedding / event', 'Business', 'Loan repayment', 'Other'];

/* Giving traditions: default target % and the base it applies to (research §2.1). */
const GIVING_KINDS = {
  zakat:    { n: 'Zakat', pct: 2.5, base: 'zakatable wealth' },
  fitrana:  { n: 'Zakat al-Fitr / Fitrana', pct: 0, base: 'per household member' },
  sadaqah:  { n: 'Sadaqah', pct: 0, base: 'voluntary' },
  tithe:    { n: 'Tithe', pct: 10, base: 'income' },
  maaser:   { n: "Ma'aser / Tzedakah", pct: 10, base: 'net income' },
  dasvandh: { n: 'Dasvandh', pct: 10, base: 'earnings' },
  dana:     { n: 'Dana', pct: 0, base: 'voluntary' },
  huquq:    { n: "Huqúqu'lláh", pct: 19, base: 'surplus wealth' },
  charity:  { n: 'Charity / donation', pct: 0, base: 'voluntary' },
  gift:     { n: 'Gift to family / friends', pct: 0, base: 'voluntary' },
};
const GIVING_RELIEF = { none: 'No tax relief', giftaid: 'UK Gift Aid', us501c3: 'US 501(c)(3) deductible', in80g: 'India 80G', ca: 'Canada donation credit', au: 'Australia DGR', other: 'Other tax relief' };

/* ── Engine ─────────────────────────────────────────────────────────── */
const WorldLedgers = (() => {
  const reg = {};
  const esc = s => (typeof escHtml === 'function' ? escHtml(s) : String(s ?? ''));
  const disp = () => (typeof S !== 'undefined' && S.user && S.user.currency) || 'USD';
  const conv = (n, from, to) => (typeof RatesEngine !== 'undefined' ? RatesEngine.convert(+n || 0, from || to, to) : +n || 0);
  const money = (n, cur) => {
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur || disp(), maximumFractionDigits: Math.abs(n) >= 100 ? 0 : 2 }).format(+n || 0); }
    catch (e) { return (cur || '') + ' ' + Math.round(+n || 0).toLocaleString(); }
  };
  const today = () => new Date().toISOString().slice(0, 10);
  const daysUntil = d => { const t = new Date(d); if (isNaN(t)) return null; const n = new Date(); n.setHours(0, 0, 0, 0); return Math.round((t - n) / 86400000); };
  const addMonths = (iso, m) => { const d = new Date(iso); if (isNaN(d)) return null; const day = d.getDate(); d.setMonth(d.getMonth() + m); if (d.getDate() < day) d.setDate(0); return d.toISOString().slice(0, 10); };

  function curOpts(sel) {
    const list = typeof CURRENCIES !== 'undefined' ? CURRENCIES : ['USD', 'EUR', 'GBP'];
    return list.map(c => `<option value="${c}"${c === sel ? ' selected' : ''}>${c}</option>`).join('');
  }
  function countryOpts(sel) {
    return typeof U !== 'undefined' && U.countries ? U.countries(sel) : '';
  }

  function fieldHtml(f, v) {
    const id = 'wl-' + f.id;
    const val = v == null ? '' : v;
    const lbl = `<label class="fl" for="${id}">${esc(f.label)}${f.req ? ' *' : ''}</label>`;
    const ch = f.onChange ? ` data-act-change="${f.onChange}"` : '';
    let input;
    if (f.type === 'select') {
      const opts = typeof f.opts === 'function' ? f.opts() : f.opts;
      input = `<select class="inp" id="${id}"${ch}>${opts.map(o => { const [k, n] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(k)}"${String(k) === String(val) ? ' selected' : ''}>${esc(n)}</option>`; }).join('')}</select>`;
    } else if (f.type === 'currency') {
      input = `<select class="inp" id="${id}"${ch}>${curOpts(val || disp())}</select>`;
    } else if (f.type === 'country') {
      input = `<select class="inp" id="${id}"${ch}>${countryOpts(val || undefined)}</select>`;
    } else if (f.type === 'textarea') {
      input = `<textarea class="inp" id="${id}" rows="2" dir="auto" placeholder="${esc(f.ph || '')}">${esc(val)}</textarea>`;
    } else if (f.type === 'check') {
      return `<div class="fg"><label class="vc-check" style="display:flex;gap:10px;align-items:center;min-height:44px"><input type="checkbox" id="${id}"${val ? ' checked' : ''}> <span>${esc(f.label)}</span></label></div>`;
    } else if (f.type === 'bank') {
      const banks = (typeof S !== 'undefined' && S.banks) || [];
      input = `<select class="inp" id="${id}"><option value="">— None —</option>${banks.map(b => `<option value="${esc(b.id)}"${b.id === val ? ' selected' : ''}>${esc(b.bankName || 'Bank')}${b.last4 ? ' ••' + esc(b.last4) : ''}</option>`).join('')}</select>`;
    } else {
      const type = f.type === 'number' ? 'text" inputmode="decimal' : f.type === 'date' ? 'date' : 'text';
      const list = f.list ? ` list="${id}-dl"` : '';
      const dl = f.list ? `<datalist id="${id}-dl">${(typeof f.list === 'function' ? f.list() : f.list).map(o => `<option value="${esc(o)}"></option>`).join('')}</datalist>` : '';
      const mono = f.mono ? ' style="font-family:var(--mono,ui-monospace,monospace)" dir="ltr" autocapitalize="off" autocomplete="off" spellcheck="false"' : ' dir="auto"';
      input = `<input class="inp" id="${id}" type="${type}" value="${esc(val)}" placeholder="${esc(f.ph || '')}"${list}${mono}${ch}>${dl}`;
    }
    const hint = f.hint ? `<div class="vc-ix-221" id="${id}-hint">${esc(f.hint)}</div>` : `<div class="vc-ix-221" id="${id}-hint" aria-live="polite"></div>`;
    return `<div class="fg">${lbl}${input}${hint}</div>`;
  }

  function readField(f) {
    const el = document.getElementById('wl-' + f.id);
    if (!el) return undefined;
    if (f.type === 'check') return !!el.checked;
    const v = (el.value || '').trim();
    if (f.type === 'number') { const n = parseFloat(v.replace(/[,\s]/g, '')); return isNaN(n) ? null : n; }
    return v;
  }

  function make(def) {
    const key = def.key;
    const list = () => { if (!Array.isArray(S[key])) S[key] = []; return S[key]; };
    const find = id => list().find(x => x.id === id);
    const mod = {
      def,
      list,
      find,
      render() {
        const el = document.getElementById('pg-' + def.page + '-body');
        if (!el) return;
        const items = list().slice().sort(def.sort || ((a, b) => String(b.date || b.createdAt || '').localeCompare(String(a.date || a.createdAt || ''))));
        const name = def.global;
        el.innerHTML = `<div class="wl-page" style="padding:16px 16px 28px;display:flex;flex-direction:column;gap:14px">
          ${items.length && def.summary ? def.summary(items) : ''}
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button type="button" class="btn btn-p" style="flex:1" id="${def.page}-add" data-act="${name}.openAdd()">+ ${esc(def.addLabel || 'Add ' + def.noun)}</button>
            ${def.extraButtons ? def.extraButtons(items) : ''}
          </div>
          ${items.length ? `<div class="wl-list" role="list">${items.map(it => mod._row(it)).join('')}</div>`
            : `<div class="empty-ios"><div class="ei-ic">${typeof VC !== 'undefined' ? VC.icon(def.icon, 32) : ''}</div><div class="ei-title">${esc(def.emptyTitle)}</div><div class="ei-sub">${esc(def.emptySub)}</div></div>`}
          ${def.footer ? def.footer(items) : ''}
        </div>`;
      },
      _row(it) {
        const sid = U.actId(it.id);
        const badges = def.badges ? def.badges(it) : '';
        const right = def.right ? def.right(it) : '';
        return `<div class="entry" role="listitem" data-id="${esc(sid)}">
          <div class="entry-main">
            <div class="entry-ic">${typeof VC !== 'undefined' ? VC.icon(def.rowIcon ? def.rowIcon(it) : def.icon, 18) : ''}</div>
            <div class="entry-body">
              <div class="entry-name entry-name--wrap" dir="auto">${esc(def.title(it))}</div>
              <div class="entry-sub entry-sub--wrap">${def.sub(it)}</div>
              ${badges ? `<div class="entry-meta">${badges}</div>` : ''}
            </div>
            ${right ? `<div class="wl-right" style="text-align:end;font-weight:800;white-space:nowrap">${right}</div>` : ''}
            <div class="entry-acts">${U.actsViewEditDel(def.global, it.id)}</div>
          </div>
        </div>`;
      },
      openAdd(id) {
        const it = id ? (find(id) || {}) : (def.defaults ? def.defaults() : {});
        const fields = def.fields(it);
        mod._editing = id || null;
        Modal.open(id ? 'Edit ' + def.noun : (def.addLabel || 'Add ' + def.noun),
          `<div class="wl-form" data-ledger="${key}">${fields.map(f => fieldHtml(f, it[f.id])).join('')}</div>`,
          `<button type="button" class="btn btn-g" data-act="Modal.close()">Cancel</button><button type="button" class="btn btn-p" id="wl-save" data-act="${def.global}._save()">Save</button>`);
        if (def.afterOpen) setTimeout(() => def.afterOpen(it), 0);
      },
      edit(id) { mod.openAdd(id); },
      _save() {
        const id = mod._editing;
        const prev = id ? find(id) : null;
        const fields = def.fields(prev || {});
        const rec = { ...(prev || {}) };
        fields.forEach(f => { const v = readField(f); if (v !== undefined) rec[f.id] = v; });
        const missing = fields.find(f => f.req && (rec[f.id] === '' || rec[f.id] == null));
        if (missing) { Toast.show(missing.label + ' is required', 'error'); document.getElementById('wl-' + missing.id)?.focus(); return; }
        if (def.validate) { const err = def.validate(rec); if (err) { Toast.show(err, 'error'); return; } }
        if (def.beforeSave) def.beforeSave(rec, prev);
        const now = new Date().toISOString();
        if (!prev) {
          rec.id = U.id(); rec.createdAt = now;
          if (typeof entityDefaults === 'function') Object.assign(rec, { ...entityDefaults(rec.country), ...rec });
          list().push(rec);
        } else {
          Object.assign(prev, rec);
        }
        rec.updatedAt = now;
        if (typeof Activity !== 'undefined') Activity.log((prev ? 'Edited ' : 'Added ') + def.noun.toLowerCase(), def.title(rec));
        Store.save();
        Modal.close();
        mod.render();
        Toast.show((prev ? 'Updated' : 'Added') + ': ' + esc(def.title(rec)), 'success');
      },
      async del(id) {
        if (!await window.__vos_confirm('Move to Trash?')) return;
        const it = find(id); if (!it) return;
        S.trash = S.trash || [];
        S.trash.push({ id: U.id(), type: key, data: it, deletedAt: new Date().toISOString() });
        S[key] = list().filter(x => x.id !== id);
        if (typeof Activity !== 'undefined') Activity.log('Trashed ' + def.noun.toLowerCase(), def.title(it));
        Store.save();
        Modal.close();
        mod.render();
        Toast.show(`Moved to Trash — <button type="button" class="cpbtn" data-act="Trash.restore('${U.actId(S.trash[S.trash.length - 1].id)}');this.closest('.toast').remove()">Undo</button>`, 'info', 6000, true);
      },
      detail(id) {
        const it = find(id); if (!it) return;
        const rows = def.detailRows(it).filter(r => r && r[1] !== '' && r[1] != null);
        const sid = U.actId(id);
        Modal.open(def.title(it),
          `<div class="wl-detail">${rows.map(([k, v, secret]) => U.drRow(k, v, secret)).join('')}${def.detailExtra ? def.detailExtra(it) : ''}</div>`,
          `<button type="button" class="btn btn-g" data-act="Modal.close()">Close</button><button type="button" class="btn btn-p" data-act="Modal.close();${def.global}.edit('${sid}')">Edit</button>`);
      },
      openDetail(id) { mod.detail(id); },
    };
    reg[key] = mod;
    return mod;
  }

  /** Reminder rows (shape used by Reminders.render). */
  function reminderItems() {
    const out = [];
    Object.values(reg).forEach(m => { if (m.def.reminders && isOn(m.def.key)) m.def.reminders(m.list()).forEach(x => out.push(x)); });
    return out;
  }
  /** Timeline events: add(date, label, type, icon, action). */
  function timeline(add) {
    Object.values(reg).forEach(m => { if (m.def.timeline && isOn(m.def.key)) m.def.timeline(m.list(), add); });
  }
  function isOn(key) { return typeof isModOn !== 'function' || isModOn(key); }

  return { make, reg, has: k => !!reg[k], mod: k => reg[k], reminderItems, timeline, money, conv, disp, esc, today, daysUntil, addMonths, fieldHtml };
})();

/* ── Payment handles ───────────────────────────────────────────────── */
const PayIDs = WorldLedgers.make({
  key: 'payids', page: 'payids', global: 'PayIDs', noun: 'Payment handle', addLabel: 'Add payment handle', icon: 'qr',
  emptyTitle: 'No payment handles yet',
  emptySub: 'Keep your UPI ID, Pix keys, PayNow, Raast, M-Pesa, mobile-money numbers, Zelle, Bizum, Wise and other handles in one encrypted place — and share them in one tap.',
  rail: id => PAY_RAILS.find(r => r.id === id) || PAY_RAILS[PAY_RAILS.length - 1],
  railsFor() {
    const home = typeof U !== 'undefined' && U.homeCC ? U.homeCC() : 'US';
    const local = PAY_RAILS.filter(r => r.cc.includes(home));
    const rest = PAY_RAILS.filter(r => !r.cc.includes(home));
    return local.concat(rest).map(r => [r.id, r.n + (r.cc.length && r.cc.length <= 3 ? ' (' + r.cc.join(', ') + ')' : '')]);
  },
  defaults() { const r = PayIDs.def.railsFor()[0]; return { rail: r ? r[0] : 'other', primary: true }; },
  fields(it) {
    const rail = PayIDs.def.rail(it.rail || PayIDs.def.defaults().rail);
    return [
      { id: 'rail', label: 'Payment system', type: 'select', opts: PayIDs.def.railsFor, req: true, onChange: 'PayIDs.def.onRail()' },
      { id: 'idType', label: 'Handle type', type: 'select', opts: rail.types },
      { id: 'value', label: 'Handle / ID', req: true, mono: true, ph: rail.ph, onChange: 'PayIDs.def.onValue()' },
      { id: 'label', label: 'Label', ph: 'Personal, business, salary account…' },
      { id: 'holder', label: 'Name shown to payers', ph: 'Account holder name' },
      { id: 'linkedBankId', label: 'Linked bank account', type: 'bank' },
      { id: 'primary', label: 'Include in “Share my handles” card', type: 'check' },
      { id: 'notes', label: 'Notes', type: 'textarea', ph: 'e.g. use for rent only' },
    ];
  },
  onRail() {
    const r = PayIDs.def.rail(document.getElementById('wl-rail')?.value);
    const t = document.getElementById('wl-idType');
    if (t) t.innerHTML = r.types.map(x => `<option value="${WorldLedgers.esc(x)}">${WorldLedgers.esc(x)}</option>`).join('');
    const v = document.getElementById('wl-value');
    if (v) v.placeholder = r.ph || '';
    PayIDs.def.onValue();
  },
  onValue() {
    const r = PayIDs.def.rail(document.getElementById('wl-rail')?.value);
    const v = (document.getElementById('wl-value')?.value || '').trim();
    const t = document.getElementById('wl-idType')?.value || '';
    const h = document.getElementById('wl-value-hint');
    if (!h) return;
    let msg = '';
    if (v && r.check) { const ok = r.check(v, t); if (ok !== true) msg = '⚠︎ ' + ok + ' — saved anyway if you are sure.'; }
    if (!msg && v && r.id === 'pix' && t === 'CPF' && typeof IdCheck !== 'undefined') { const c = IdCheck.check('BR', 'cpf', v); if (c && c.ok === false) msg = '⚠︎ ' + c.msg; }
    if (!msg && r.id === 'crypto' && /\b(\w+\s+){11,}\w+\b/.test(v)) msg = '⚠︎ This looks like a seed phrase. Store only the public address here.';
    h.textContent = msg;
  },
  validate(rec) {
    if (rec.rail === 'crypto' && /\b(\w+\s+){11,}\w+\b/.test(rec.value || '')) return 'That looks like a seed phrase — store only the public address';
    return '';
  },
  title: it => (it.label ? it.label + ' · ' : '') + PayIDs.def.rail(it.rail).n,
  sub: it => `<span dir="ltr" style="font-family:var(--mono,ui-monospace,monospace)">${WorldLedgers.esc(it.value || '')}</span>${it.idType ? ' · ' + WorldLedgers.esc(it.idType) : ''}`,
  badges(it) {
    const bank = it.linkedBankId && (S.banks || []).find(b => b.id === it.linkedBankId);
    return (it.primary ? '<span class="badge b-acc">Shared</span>' : '') + (bank ? `<span class="badge">${WorldLedgers.esc(bank.bankName)}</span>` : '');
  },
  right: it => `<button type="button" class="icb" aria-label="Copy ${WorldLedgers.esc(PayIDs.def.rail(it.rail).n)} handle" data-act="PayIDs.copy('${U.actId(it.id)}')">${typeof VC !== 'undefined' ? VC.icon('copy', 16) : 'Copy'}</button>`,
  sort: (a, b) => (b.primary ? 1 : 0) - (a.primary ? 1 : 0) || String(a.rail).localeCompare(String(b.rail)),
  summary(items) {
    const rails = [...new Set(items.map(i => PayIDs.def.rail(i.rail).n))];
    return `<div class="u-highlight-card"><div class="vc-ix-187">Payment handles</div>
      <div style="font-size:1.25rem;font-weight:900">${items.length} handle${items.length === 1 ? '' : 's'}</div>
      <div class="vc-ix-221">${WorldLedgers.esc(rails.join(' · '))}</div></div>`;
  },
  extraButtons: items => items.some(i => i.primary) ? `<button type="button" class="btn btn-g" id="payids-share" data-act="PayIDs.shareCard()">Share my handles</button>` : '',
  footer: () => `<div class="vc-ix-219"><div class="vc-ix-220">Heirs can find these</div><div class="vc-ix-90">Wallet balances on mobile-money and payment apps are easy to lose when a phone or SIM is lost. Link each handle to its bank or SIM, and keep the vault backed up.</div></div>`,
  detailRows: it => {
    const bank = it.linkedBankId && (S.banks || []).find(b => b.id === it.linkedBankId);
    return [['Payment system', PayIDs.def.rail(it.rail).n], ['Type', it.idType], ['Handle', '••••', it.value], ['Label', it.label], ['Name', it.holder], ['Linked bank', bank ? bank.bankName : ''], ['Notes', it.notes]];
  },
});
PayIDs.copy = function (id) {
  const it = PayIDs.find(id); if (!it) return;
  U.copy(it.value, PayIDs.def.rail(it.rail).n);
};
PayIDs.shareText = function () {
  const name = (S.user && S.user.name) || '';
  const lines = PayIDs.list().filter(i => i.primary).map(i => `${PayIDs.def.rail(i.rail).n}${i.idType ? ' (' + i.idType + ')' : ''}: ${i.value}${i.holder ? ' — ' + i.holder : ''}`);
  return (name ? 'Pay ' + name + '\n' : 'Pay me\n') + lines.join('\n');
};
PayIDs.shareCard = function () {
  const text = PayIDs.shareText();
  Modal.open('Share my handles',
    `<div class="vc-ix-158">Only handles marked “Include in share card” appear here. Nothing is sent anywhere until you copy or share it.</div>
     <pre id="payids-share-text" dir="auto" style="white-space:pre-wrap;background:var(--glass);border:1px solid var(--border);border-radius:12px;padding:12px;font-size:0.875rem;line-height:1.6">${WorldLedgers.esc(text)}</pre>`,
    `<button type="button" class="btn btn-g" data-act="Modal.close()">Close</button><button type="button" class="btn btn-p" data-act="PayIDs.copyShare()">Copy text</button>`);
};
PayIDs.copyShare = function () { U.copy(PayIDs.shareText(), 'Payment handles'); };

/* ── Remittances ───────────────────────────────────────────────────── */
const REMIT_BENCH = { sdg: 3, world: 6.5 };
const Remits = WorldLedgers.make({
  key: 'remits', page: 'remits', global: 'Remits', noun: 'Transfer', addLabel: 'Log a transfer', icon: 'send',
  emptyTitle: 'No transfers logged',
  emptySub: 'Record money you send abroad — amount, fee and what arrived — and see the true cost of each transfer against the world average (about 6.5%) and the UN 3% target.',
  defaults() {
    const last = Remits.list().slice().sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
    const home = WorldLedgers.disp();
    return last ? { date: WorldLedgers.today(), sentCur: last.sentCur, recvCur: last.recvCur, provider: last.provider, method: last.method, recipient: last.recipient, recipientCountry: last.recipientCountry, purpose: last.purpose }
      : { date: WorldLedgers.today(), sentCur: home, recvCur: home === 'USD' ? 'EUR' : 'USD', method: 'bank' };
  },
  fields: () => [
    { id: 'date', label: 'Date sent', type: 'date', req: true },
    { id: 'recipient', label: 'Recipient', req: true, ph: 'Name', list: () => [...new Set((S.familyMembers || []).map(f => f.name).concat((S.friends || []).map(f => f.name)).filter(Boolean))] },
    { id: 'recipientCountry', label: 'Recipient country', type: 'country' },
    { id: 'sent', label: 'Amount sent (before fee)', type: 'number', req: true, ph: '0', onChange: 'Remits.def.preview()' },
    { id: 'sentCur', label: 'Sent in', type: 'currency', onChange: 'Remits.def.preview()' },
    { id: 'fee', label: 'Transfer fee', type: 'number', ph: '0', onChange: 'Remits.def.preview()' },
    { id: 'received', label: 'Amount received', type: 'number', ph: 'What arrived', onChange: 'Remits.def.preview()' },
    { id: 'recvCur', label: 'Received in', type: 'currency', onChange: 'Remits.def.preview()' },
    { id: 'midRate', label: 'Mid-market rate (optional)', type: 'number', ph: 'Auto from saved rates', onChange: 'Remits.def.preview()', hint: '' },
    { id: 'provider', label: 'Provider', list: REMIT_PROVIDERS, ph: 'Wise, Western Union, bank…' },
    { id: 'method', label: 'Delivery', type: 'select', opts: Object.entries(REMIT_METHODS) },
    { id: 'purpose', label: 'Purpose', type: 'select', opts: [''].concat(REMIT_PURPOSES).map(p => [p, p || '—']) },
    { id: 'reference', label: 'Reference / MTCN', mono: true, ph: 'Tracking number' },
    { id: 'repeat', label: 'Remind me to send this every month', type: 'check' },
    { id: 'notes', label: 'Notes', type: 'textarea', ph: 'Agent name and phone, code word, promised rate…' },
  ],
  afterOpen() { Remits.def.preview(); },
  /** Mid-market rate (received-currency units per 1 sent-currency unit). */
  mid(it) { return +it.midRate > 0 ? +it.midRate : (it.sentCur === it.recvCur ? 1 : WorldLedgers.conv(1, it.sentCur, it.recvCur)); },
  /** True cost % = (fee + FX margin) / amount sent. FX margin = sent − received ÷ mid. */
  cost(it) {
    const sent = +it.sent || 0, fee = +it.fee || 0, recv = +it.received || 0;
    if (!sent) return null;
    const mid = Remits.def.mid(it);
    const margin = recv > 0 && mid > 0 ? Math.max(0, sent - recv / mid) : 0;
    return { fee, margin, total: fee + margin, pct: ((fee + margin) / sent) * 100, hasRecv: recv > 0 };
  },
  preview() {
    const g = id => document.getElementById('wl-' + id);
    const it = { sent: parseFloat((g('sent')?.value || '').replace(/,/g, '')), fee: parseFloat((g('fee')?.value || '').replace(/,/g, '')), received: parseFloat((g('received')?.value || '').replace(/,/g, '')), sentCur: g('sentCur')?.value, recvCur: g('recvCur')?.value, midRate: parseFloat(g('midRate')?.value) };
    const h = g('midRate-hint'); if (!h) return;
    const mid = Remits.def.mid(it);
    const c = Remits.def.cost(it);
    h.innerHTML = `1 ${WorldLedgers.esc(it.sentCur)} ≈ ${mid ? mid.toLocaleString(undefined, { maximumFractionDigits: 4 }) : '—'} ${WorldLedgers.esc(it.recvCur)} mid-market` + (c && c.hasRecv ? ` · <strong>true cost ${c.pct.toFixed(1)}%</strong>` : '');
  },
  beforeSave(rec) {
    // Freeze the rate used, so history never changes when rates move (research §1.4).
    if (!(+rec.midRate > 0)) rec.midRateAuto = Remits.def.mid(rec);
    else delete rec.midRateAuto;
    if (rec.repeat) rec.nextDue = WorldLedgers.addMonths(rec.date, 1);
  },
  mid2(it) { return +it.midRate > 0 ? +it.midRate : (+it.midRateAuto > 0 ? +it.midRateAuto : Remits.def.mid(it)); },
  costOf(it) { const r = { ...it, midRate: Remits.def.mid2(it) }; return Remits.def.cost(r); },
  badge(pct) {
    if (pct == null) return '';
    if (pct <= REMIT_BENCH.sdg) return `<span class="badge b-ok" title="At or under the UN SDG 10.c target of 3%">${pct.toFixed(1)}% · under 3% target</span>`;
    if (pct <= REMIT_BENCH.world) return `<span class="badge b-warn" title="Below the world average cost of about 6.5%">${pct.toFixed(1)}% · below world avg</span>`;
    return `<span class="badge b-err" title="Above the world average cost of about 6.5%">${pct.toFixed(1)}% · above world avg</span>`;
  },
  title: it => (it.recipient || 'Transfer') + (it.recipientCountry ? ' ' + (U.flag ? U.flag(it.recipientCountry) : '') : ''),
  sub: it => WorldLedgers.esc([it.date, it.provider, REMIT_METHODS[it.method], it.purpose].filter(Boolean).join(' · ')),
  badges: it => { const c = Remits.def.costOf(it); return c && c.hasRecv ? Remits.def.badge(c.pct) : (it.repeat ? '<span class="badge">Monthly</span>' : ''); },
  right: it => `<div>${WorldLedgers.money(it.sent, it.sentCur)}</div>${+it.received ? `<div class="vc-ix-3">→ ${WorldLedgers.money(it.received, it.recvCur)}</div>` : ''}`,
  summary(items) {
    const D = WorldLedgers.disp();
    const y = String(new Date().getFullYear());
    const yr = items.filter(i => String(i.date || '').startsWith(y));
    const sum = (arr, f) => arr.reduce((a, i) => a + WorldLedgers.conv(f(i), i.sentCur, D), 0);
    const sent = sum(yr, i => +i.sent || 0);
    const costs = sum(yr, i => { const c = Remits.def.costOf(i); return c ? c.total : 0; });
    const withRecv = yr.filter(i => +i.received > 0);
    const avg = withRecv.length ? withRecv.reduce((a, i) => a + Remits.def.costOf(i).pct, 0) / withRecv.length : null;
    const byR = {};
    yr.forEach(i => { byR[i.recipient || '—'] = (byR[i.recipient || '—'] || 0) + WorldLedgers.conv(+i.sent || 0, i.sentCur, D); });
    const top = Object.entries(byR).sort((a, b) => b[1] - a[1]).slice(0, 3);
    return `<div class="u-highlight-card" id="remits-summary"><div class="vc-ix-187">Sent in ${y}</div>
      <div class="vc-ix-89">
        <div class="vc-ix-109"><div class="vc-ix-3">Total sent</div><div style="font-size:1.25rem;font-weight:900">${WorldLedgers.money(sent, D)}</div></div>
        <div class="vc-ix-109"><div class="vc-ix-3">Fees + FX margin</div><div style="font-size:1.25rem;font-weight:900;color:var(--warn)">${WorldLedgers.money(costs, D)}</div></div>
      </div>
      ${avg != null ? `<div style="margin-top:10px">Average true cost: ${Remits.def.badge(avg)}</div>` : ''}
      ${top.length ? `<div class="vc-ix-221" style="margin-top:8px">${top.map(([n, v]) => WorldLedgers.esc(n) + ' ' + WorldLedgers.money(v, D)).join(' · ')}</div>` : ''}
    </div>`;
  },
  footer: () => `<div class="vc-ix-219"><div class="vc-ix-220">How true cost is worked out</div><div class="vc-ix-90">Fee plus the exchange-rate margin: what you sent, minus what arrived converted back at the mid-market rate. The world average is about 6.5% (World Bank, 2025); the UN target is 3% by 2030. The rate is frozen when you save, so old transfers keep their numbers.</div></div>`,
  detailRows(it) {
    const c = Remits.def.costOf(it);
    return [['Date', it.date], ['Recipient', it.recipient], ['Country', it.recipientCountry ? (U.flag(it.recipientCountry) + ' ' + U.cname(it.recipientCountry)) : ''],
      ['Sent', WorldLedgers.money(it.sent, it.sentCur)], ['Fee', +it.fee ? WorldLedgers.money(it.fee, it.sentCur) : ''], ['Received', +it.received ? WorldLedgers.money(it.received, it.recvCur) : ''],
      ['Mid-market rate', '1 ' + it.sentCur + ' = ' + (+Remits.def.mid2(it)).toLocaleString(undefined, { maximumFractionDigits: 4 }) + ' ' + it.recvCur],
      ['FX margin', c && c.hasRecv ? WorldLedgers.money(c.margin, it.sentCur) : ''], ['True cost', c && c.hasRecv ? c.pct.toFixed(2) + '%' : ''],
      ['Provider', it.provider], ['Delivery', REMIT_METHODS[it.method]], ['Purpose', it.purpose], ['Reference', it.reference ? '••••' : '', it.reference], ['Repeats', it.repeat ? 'Monthly · next ' + (it.nextDue || '') : ''], ['Notes', it.notes]];
  },
  reminders(list) {
    return list.filter(i => i.repeat && i.nextDue).map(i => ({ icon: 'send', title: 'Send to ' + (i.recipient || 'recipient'), sub: WorldLedgers.money(i.sent, i.sentCur) + (i.provider ? ' via ' + i.provider : ''), daysLeft: WorldLedgers.daysUntil(i.nextDue), page: 'remits', category: 'Remittance' }))
      .filter(x => x.daysLeft != null && x.daysLeft <= 30);
  },
  timeline(list, add) { list.filter(i => i.repeat && i.nextDue).forEach(i => add(i.nextDue, 'Send to ' + (i.recipient || 'recipient'), 'remit', 'send', () => Remits.detail(i.id))); },
});

/* ── Giving ────────────────────────────────────────────────────────── */
const Giving = WorldLedgers.make({
  key: 'giving', page: 'giving', global: 'Giving', noun: 'Gift', addLabel: 'Record giving', icon: 'heart',
  emptyTitle: 'No giving recorded',
  emptySub: 'Track sadaqah, fitrana, tithe, ma’aser, dasvandh, dana, Huqúqu’lláh or any donation — with pledges, a yearly target and receipts for tax relief.',
  defaults() {
    const c = Giving.commitment();
    return { date: WorldLedgers.today(), currency: WorldLedgers.disp(), kind: c.kind || Giving.defaultKind(), status: 'paid', taxRelief: 'none' };
  },
  fields: () => [
    { id: 'kind', label: 'Type', type: 'select', opts: Object.entries(GIVING_KINDS).map(([k, v]) => [k, v.n]) },
    { id: 'status', label: 'Status', type: 'select', opts: [['paid', 'Given'], ['pledged', 'Pledged (to give)']] },
    { id: 'date', label: 'Date (given, or due for a pledge)', type: 'date', req: true },
    { id: 'amount', label: 'Amount', type: 'number', req: true, ph: '0' },
    { id: 'currency', label: 'Currency', type: 'currency' },
    { id: 'recipient', label: 'Recipient', ph: 'Charity, mosque, church, temple, gurdwara, person…' },
    { id: 'regNo', label: 'Charity registration no.', mono: true, ph: 'For tax receipts' },
    { id: 'taxRelief', label: 'Tax relief', type: 'select', opts: Object.entries(GIVING_RELIEF) },
    { id: 'receipt', label: 'Receipt / reference', mono: true },
    { id: 'notes', label: 'Notes', type: 'textarea' },
  ],
  title: it => (GIVING_KINDS[it.kind] || GIVING_KINDS.charity).n + (it.recipient ? ' · ' + it.recipient : ''),
  sub: it => WorldLedgers.esc([it.date, it.status === 'pledged' ? 'Pledged' : 'Given', it.taxRelief && it.taxRelief !== 'none' ? GIVING_RELIEF[it.taxRelief] : ''].filter(Boolean).join(' · ')),
  badges: it => {
    if (it.status !== 'pledged') return '';
    const d = WorldLedgers.daysUntil(it.date);
    return d != null && d < 0 ? '<span class="badge b-err">Pledge overdue</span>' : '<span class="badge b-warn">Pledge</span>';
  },
  rowIcon: () => 'heart',
  right: it => WorldLedgers.money(it.amount, it.currency),
  summary(items) {
    const D = WorldLedgers.disp();
    const y = String(new Date().getFullYear());
    const paid = items.filter(i => i.status !== 'pledged' && String(i.date || '').startsWith(y));
    const total = paid.reduce((a, i) => a + WorldLedgers.conv(+i.amount || 0, i.currency, D), 0);
    const pledged = items.filter(i => i.status === 'pledged').reduce((a, i) => a + WorldLedgers.conv(+i.amount || 0, i.currency, D), 0);
    const relief = paid.filter(i => i.taxRelief && i.taxRelief !== 'none').reduce((a, i) => a + WorldLedgers.conv(+i.amount || 0, i.currency, D), 0);
    const c = Giving.commitment();
    const target = c.pct > 0 && c.income > 0 ? WorldLedgers.conv(c.income * c.pct / 100, c.currency || D, D) : 0;
    const pct = target ? Math.min(100, Math.round(total / target * 100)) : 0;
    return `<div class="u-highlight-card" id="giving-summary"><div class="vc-ix-187">Given in ${y}</div>
      <div class="vc-ix-89">
        <div class="vc-ix-109"><div class="vc-ix-3">Given</div><div style="font-size:1.25rem;font-weight:900;color:var(--ok)">${WorldLedgers.money(total, D)}</div></div>
        <div class="vc-ix-109"><div class="vc-ix-3">Pledged</div><div style="font-size:1.25rem;font-weight:900">${WorldLedgers.money(pledged, D)}</div></div>
      </div>
      ${target ? `<div style="margin-top:10px;font-size:0.75rem;color:var(--text3)">${WorldLedgers.esc((GIVING_KINDS[c.kind] || {}).n || 'Target')} target ${c.pct}% of ${WorldLedgers.money(c.income, c.currency || D)}: <strong>${WorldLedgers.money(target, D)}</strong> · ${pct}%${total < target ? ' · ' + WorldLedgers.money(target - total, D) + ' to go' : ' · met'}</div>
        <div style="height:6px;background:var(--border);border-radius:999px;margin-top:6px" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="Giving target progress"><div style="height:100%;width:${pct}%;background:var(--ok);border-radius:999px"></div></div>` : ''}
      ${relief ? `<div class="vc-ix-221" style="margin-top:8px">Eligible for tax relief: ${WorldLedgers.money(relief, D)}</div>` : ''}
    </div>`;
  },
  extraButtons: () => `<button type="button" class="btn btn-g" id="giving-target" data-act="Giving.openTarget()">Yearly target</button>`,
  footer: () => `<div class="vc-ix-219"><div class="vc-ix-220">Zakat has its own calculator</div><div class="vc-ix-90">Use Zakat for the 2.5% on wealth held a lunar year. Record what you actually pay here as “Zakat” to keep one giving history.</div></div>`,
  detailRows: it => [['Type', (GIVING_KINDS[it.kind] || {}).n], ['Status', it.status === 'pledged' ? 'Pledged' : 'Given'], ['Date', it.date], ['Amount', WorldLedgers.money(it.amount, it.currency)], ['Recipient', it.recipient], ['Registration no.', it.regNo], ['Tax relief', GIVING_RELIEF[it.taxRelief]], ['Receipt', it.receipt], ['Notes', it.notes]],
  reminders(list) {
    return list.filter(i => i.status === 'pledged').map(i => ({ icon: 'heart', title: (GIVING_KINDS[i.kind] || GIVING_KINDS.charity).n + ' pledge' + (i.recipient ? ' — ' + i.recipient : ''), sub: WorldLedgers.money(i.amount, i.currency) + ' pledged', daysLeft: WorldLedgers.daysUntil(i.date), page: 'giving', category: 'Giving' }))
      .filter(x => x.daysLeft != null && x.daysLeft <= 30);
  },
  timeline(list, add) { list.filter(i => i.status === 'pledged').forEach(i => add(i.date, (GIVING_KINDS[i.kind] || GIVING_KINDS.charity).n + ' pledge', 'giving', 'heart', () => Giving.detail(i.id))); },
});
Giving.commitment = function () {
  try { return (typeof VaultMeta !== 'undefined' && VaultMeta.get('givingTarget')) || {}; } catch (e) { return {}; }
};
/** Sensible first suggestion from the vault's own context, never assumed from a country. */
Giving.defaultKind = function () {
  const used = Giving.list().map(i => i.kind);
  if (used.length) return used[used.length - 1];
  return (S.modules && S.modules.zakat !== false && (S.vaultMeta && S.vaultMeta.zakatCalc && Object.keys(S.vaultMeta.zakatCalc).length)) ? 'sadaqah' : 'charity';
};
Giving.openTarget = function () {
  const c = Giving.commitment();
  const f = WorldLedgers.fieldHtml;
  Modal.open('Yearly giving target',
    `<div class="vc-ix-158">Optional. Many traditions set a share of income: tithe, ma’aser and dasvandh 10%; Huqúqu’lláh 19% of surplus. Leave at 0 for no target.</div>
     ${f({ id: 'gt-kind', label: 'Tradition', type: 'select', opts: Object.entries(GIVING_KINDS).map(([k, v]) => [k, v.n + (v.pct ? ' (' + v.pct + '% of ' + v.base + ')' : '')]), onChange: 'Giving._targetKind()' }, c.kind || Giving.defaultKind())}
     ${f({ id: 'gt-pct', label: 'Target %', type: 'number', ph: '10' }, c.pct || '')}
     ${f({ id: 'gt-income', label: 'Yearly income (or base)', type: 'number', ph: 'Gross or net — your choice' }, c.income || '')}
     ${f({ id: 'gt-currency', label: 'Currency', type: 'currency' }, c.currency || WorldLedgers.disp())}`,
    `<button type="button" class="btn btn-g" data-act="Modal.close()">Cancel</button><button type="button" class="btn btn-p" id="gt-save" data-act="Giving._saveTarget()">Save</button>`);
};
Giving._targetKind = function () {
  const k = document.getElementById('wl-gt-kind')?.value;
  const p = document.getElementById('wl-gt-pct');
  if (p && k && GIVING_KINDS[k] && GIVING_KINDS[k].pct && !p.value) p.value = GIVING_KINDS[k].pct;
};
Giving._saveTarget = function () {
  const g = id => document.getElementById('wl-' + id);
  const num = id => { const n = parseFloat((g(id)?.value || '').replace(/,/g, '')); return isNaN(n) ? 0 : n; };
  const pct = num('gt-pct');
  if (pct < 0 || pct > 100) { Toast.show('Target must be between 0 and 100%', 'error'); return; }
  VaultMeta.set('givingTarget', { kind: g('gt-kind')?.value, pct, income: num('gt-income'), currency: g('gt-currency')?.value });
  Store.save();
  Modal.close();
  Giving.render();
  Toast.show('Giving target saved', 'success');
};

window.PAY_RAILS = PAY_RAILS;
window.GIVING_KINDS = GIVING_KINDS;
window.WorldLedgers = WorldLedgers;
window.PayIDs = PayIDs;
window.Remits = Remits;
window.Giving = Giving;
