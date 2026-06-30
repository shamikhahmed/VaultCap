'use strict';
/* U (utils), entityDefaults, formatNumberInput */

/** Escape text for safe HTML interpolation (global for inline handlers). */
function escHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
window.escHtml = escHtml;

/** Document expiry — canonical field is expiryDate; legacy expiry supported. */
function docExpiry(d) {
  if (!d) return '';
  return d.expiryDate || d.expiry || '';
}
window.docExpiry = docExpiry;

function escAttr(str) { return escHtml(str); }
window.escAttr = escAttr;

const U = {
  esc: escHtml,
  escAttr,
  fv: escAttr,
  /** Generates a unique entity ID prefixed with 'i' using timestamp and random suffix. */
  id:       () => 'i' + Date.now() + Math.random().toString(36).slice(2, 5),
  flag:     c  => COUNTRIES.find(x => x.c === c)?.f || '🌐',
  cname:    c  => COUNTRIES.find(x => x.c === c)?.n || c,
  phone:    c  => COUNTRIES.find(x => x.c === c)?.p || '+0',
  fmt:      n  => new Intl.NumberFormat().format(n || 0),
  curSym:   c  => CUR_SYM[(c || 'GBP').toUpperCase()] || ((c || 'GBP').toUpperCase() + ' '),
  /** Formats a base-PKR value into the user's display currency with K/M suffix. */
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
  /** Returns a coloured HTML P&L string showing gain/loss amount and percentage. */
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
  /** Copies text to clipboard (Clipboard API with execCommand fallback) and shows a toast. */
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
  /** Temporarily reveals a masked secret in an element and copies it to clipboard, then re-masks after 5s. */
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
    all.forEach(t => { const safe = escHtml(t); html += `<span class="tag${sel.indexOf(t) >= 0 ? ' on' : ''}" onclick="this.classList.toggle('on')">${safe}</span>`; });
    html += '</div>';
    html += '<div style="display:flex;gap:7px;margin-top:7px">';
    html += '<input class="inp" id="custTagIn" placeholder="Add tag..." style="flex:1" onkeydown="if(event.key===\'Enter\')U.addTag()">';
    html += '<button type="button" class="btn btn-g btn-sm" onclick="U.addTag()">+</button></div>';
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
  drRow: (label, val, secret = '') => {
    const lid = String(label).replace(/\W/g, '');
    const safeLabel = escHtml(label);
    const safeVal = escHtml(val);
    const secJs = secret ? String(secret).replace(/\\/g, '\\\\').replace(/'/g, "\\'") : '';
    return `<div class="dr"><div class="dk">${safeLabel}</div><div class="dv"><span id="dr-${lid}" class="sens">${safeVal}</span>${secret ? `<button type="button" class="cpbtn" onclick="U.reveal('dr-${lid}','${secJs}','${safeLabel.replace(/'/g, "\\'")}')">👁️</button>` : ''}</div></div>`;
  },
  loginFields: (obj = {}) => `<div class="fr">
    <div class="fg"><label class="fl">App / Web Username</label><input class="inp" id="lf-user" value="${escAttr(obj.username||'')}" placeholder="Username"></div>
    <div class="fg"><label class="fl">Password Hint</label><input class="inp" id="lf-pwd" value="${escAttr(obj.pwdHint||'')}" placeholder="e.g. 'Email+DOB'"></div>
  </div><div class="fr">
    <div class="fg"><label class="fl">App PIN / Passcode</label><input class="inp" id="lf-pin" type="password" value="${escAttr(obj.appPin||'')}" placeholder="App PIN"></div>
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
    <button type="button" class="btn btn-p btn-sm" onclick="document.getElementById('add-another-bar').remove();(${openFn})()">Yes</button>
    <button type="button" class="btn btn-g btn-sm" onclick="document.getElementById('add-another-bar').remove()">No</button>`;
  document.body.appendChild(bar);
  // Auto-dismiss after 8s
  setTimeout(() => { if (bar.isConnected) bar.remove(); }, 8000);
}

// ===================== iOS INTERACTION UTILS =====================

