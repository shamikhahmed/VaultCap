// Smart pattern-matching import engine — no external API required

const AIImport = (() => {

  // ── Pattern libraries ──────────────────────────────────────────────────────

  const BANK_NAMES = BANKS_DB.map(b => b.n.toLowerCase());
  const BROKER_NAMES = BROKERS_DB.map(b => b.toLowerCase());

  const CURRENCY_RE   = /\b(PKR|GBP|USD|AED|EUR|SAR|CAD|AUD|SGD|INR|QAR|BTC|ETH|USDT)\b/gi;
  const AMOUNT_RE     = /(?:PKR|GBP|£|\$|€|AED|USD|INR|SAR)?\s*([\d,]+(?:\.\d{1,2})?)/g;
  const CARD_NUM_RE   = /\b(\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}|\*{4}\s?\d{4}|\d{4})\b/g;
  const DATE_RE       = /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.](\d{2}|\d{4})|\d{2}\/\d{2}|\d{4}-\d{2}-\d{2})\b/g;
  const IBAN_RE       = /\b(PK\d{2}[A-Z0-9]{18}|GB\d{2}[A-Z]{4}\d{14})\b/gi;
  const PHONE_RE      = /(?:\+?\d{1,3}[\s\-]?)?\(?\d{2,4}\)?[\s\-]?\d{3,4}[\s\-]?\d{4,7}/g;
  const EMAIL_RE      = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
  const ACCOUNT_RE    = /\b\d{8,18}\b/g;
  const NAME_RE       = /\b([A-Z][a-z]{2,}(?:\s[A-Z][a-z]{2,}){1,3})\b/g;

  // ── Helpers ────────────────────────────────────────────────────────────────

  function _clean(t) { return (t || '').replace(/\s+/g, ' ').trim(); }

  function _firstMatch(text, re) {
    re.lastIndex = 0;
    const m = re.exec(text);
    return m ? _clean(m[0]) : null;
  }

  function _allMatches(text, re) {
    re.lastIndex = 0;
    const out = []; let m;
    while ((m = re.exec(text)) !== null) out.push(_clean(m[0]));
    return [...new Set(out)];
  }

  function _matchBank(text) {
    const lower = text.toLowerCase();
    for (const bn of BANK_NAMES) {
      if (lower.includes(bn)) return BANKS_DB[BANK_NAMES.indexOf(bn)]?.n || bn;
    }
    return null;
  }

  function _matchBroker(text) {
    const lower = text.toLowerCase();
    for (const br of BROKER_NAMES) {
      if (lower.includes(br)) return BROKERS_DB[BROKER_NAMES.indexOf(br)] || br;
    }
    return null;
  }

  function _detectCurrencies(text) {
    return _allMatches(text, CURRENCY_RE).map(c => c.toUpperCase());
  }

  function _detectAmounts(text) {
    const out = [];
    AMOUNT_RE.lastIndex = 0;
    let m;
    while ((m = AMOUNT_RE.exec(text)) !== null) {
      const n = parseFloat(m[1].replace(/,/g, ''));
      if (!isNaN(n) && n > 0) out.push(n);
    }
    return out;
  }

  function _detectLast4(text) {
    const nums = _allMatches(text, CARD_NUM_RE);
    for (const n of nums) {
      const digits = n.replace(/\D/g, '');
      if (digits.length === 16) return digits.slice(-4);
      if (digits.length === 4)  return digits;
    }
    return null;
  }

  function _confidence(detected, required) {
    const found = required.filter(k => !!detected[k]);
    return +(found.length / required.length).toFixed(2);
  }

  // ── Core parser ────────────────────────────────────────────────────────────

  function parse(rawText) {
    const text   = rawText || '';
    const lower  = text.toLowerCase();
    const items  = [];

    const bankName   = _matchBank(text);
    const currencies = _detectCurrencies(text);
    const amounts    = _detectAmounts(text);
    const dates      = _allMatches(text, DATE_RE);
    const ibans      = _allMatches(text, IBAN_RE);
    const phones     = _allMatches(text, PHONE_RE).slice(0, 4);
    const emails     = _allMatches(text, EMAIL_RE).slice(0, 4);
    const names      = _allMatches(text, NAME_RE).slice(0, 3);
    const last4      = _detectLast4(text);
    const broker     = _matchBroker(text);

    // ── Bank ──────────────────────────────────────────────────────────────────
    if (bankName || ibans.length || (lower.includes('account') && (amounts.length || currencies.length))) {
      const fields = {
        bankName:    bankName || '',
        iban:        ibans[0] || '',
        currency:    currencies[0] || 'GBP',
        balance:     amounts[0] || '',
        last4:       last4 || '',
        holderName:  names[0] || '',
        phone:       phones[0] || '',
        email:       emails[0] || '',
      };
      items.push({
        type: 'bank',
        label: `Bank — ${fields.bankName || 'Unknown'}`,
        confidence: _confidence(fields, ['bankName', 'currency']),
        fields,
        raw: text.slice(0, 200)
      });
    }

    // ── Card ──────────────────────────────────────────────────────────────────
    if (last4 || lower.includes('card') || lower.includes('visa') || lower.includes('mastercard') || lower.includes('amex')) {
      const network = /mastercard/i.test(text) ? 'Mastercard' : /visa/i.test(text) ? 'Visa' : /amex|american express/i.test(text) ? 'American Express' : '';
      const cardType = /credit/i.test(text) ? 'Credit' : /debit/i.test(text) ? 'Debit' : '';
      const fields = {
        cardName:   bankName ? bankName + ' ' + (cardType || 'Card') : '',
        network,
        cardType,
        last4:      last4 || '',
        expiry:     dates.find(d => /^\d{2}\/\d{2}$/.test(d)) || dates[0] || '',
        holderName: names[0] || '',
        currency:   currencies[0] || 'GBP',
      };
      items.push({
        type: 'card',
        label: `Card — ${fields.cardName || network || 'Unknown'}`,
        confidence: _confidence(fields, ['last4', 'network']),
        fields,
        raw: text.slice(0, 200)
      });
    }

    // ── Investment ─────────────────────────────────────────────────────────────
    if (broker || lower.includes('stock') || lower.includes('fund') || lower.includes('portfolio') || lower.includes('invest')) {
      const ticker = (_firstMatch(text, /\b([A-Z]{2,5})\b/g) || '');
      const fields = {
        investmentName: names[0] || ticker || '',
        broker:         broker || '',
        type:           /crypto/i.test(text) ? 'Crypto' : /fund/i.test(text) ? 'Fund' : 'Stocks',
        currency:       currencies[0] || 'GBP',
        amountInvested: amounts[0] || '',
        currentValue:   amounts[1] || amounts[0] || '',
        ticker,
      };
      items.push({
        type: 'investment',
        label: `Investment — ${fields.investmentName || broker || 'Unknown'}`,
        confidence: _confidence(fields, ['amountInvested', 'type']),
        fields,
        raw: text.slice(0, 200)
      });
    }

    // ── SIM ────────────────────────────────────────────────────────────────────
    if (lower.includes('sim') || lower.includes('mobile') || lower.includes('network') || phones.length > 0) {
      const network = NETWORKS_DB.find(n => lower.includes(n.n.toLowerCase()))?.n || '';
      const fields = {
        phone:    phones[0] || '',
        network,
        simType:  /esim/i.test(text) ? 'eSIM' : 'Physical',
        status:   /active/i.test(text) ? 'Active' : 'Inactive',
        country:  /uk|united kingdom/i.test(text) ? 'GB' : /pak/i.test(text) ? 'PK' : /uae/i.test(text) ? 'AE' : 'GB',
      };
      items.push({
        type: 'sim',
        label: `SIM — ${fields.phone || network || 'Unknown'}`,
        confidence: _confidence(fields, ['phone', 'network']),
        fields,
        raw: text.slice(0, 200)
      });
    }

    // ── Cash ───────────────────────────────────────────────────────────────────
    if (lower.includes('cash') || lower.includes('wallet') || lower.includes('pocket')) {
      const fields = {
        label:    'Cash',
        amount:   amounts[0] || '',
        currency: currencies[0] || 'GBP',
        location: /wallet/i.test(text) ? 'Wallet' : /safe/i.test(text) ? 'Safe' : 'Wallet',
      };
      items.push({
        type: 'cash',
        label: `Cash — ${fields.currency} ${fields.amount || '?'}`,
        confidence: _confidence(fields, ['amount', 'currency']),
        fields,
        raw: text.slice(0, 200)
      });
    }

    // ── Loan ───────────────────────────────────────────────────────────────────
    if (lower.includes('loan') || lower.includes('lent') || lower.includes('owe') || lower.includes('borrow')) {
      const fields = {
        personName: names[0] || '',
        amount:     amounts[0] || '',
        currency:   currencies[0] || 'GBP',
        type:       /owe|borrowed/i.test(text) ? 'borrowed' : 'lent',
        dueDate:    dates[0] || '',
      };
      items.push({
        type: 'loan',
        label: `Loan — ${fields.personName || 'Unknown'} ${fields.type}`,
        confidence: _confidence(fields, ['amount', 'personName']),
        fields,
        raw: text.slice(0, 200)
      });
    }

    // Deduplicate: keep best-confidence item per type
    const best = {};
    items.forEach(it => {
      if (!best[it.type] || it.confidence > best[it.type].confidence) best[it.type] = it;
    });

    return Object.values(best).sort((a, b) => b.confidence - a.confidence);
  }

  // ── CSV / plain-text parser ────────────────────────────────────────────────

  function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    return lines.map(line => parse(line)).flat().filter(it => it.confidence > 0.1);
  }

  // ── Module save router ─────────────────────────────────────────────────────

  function _saveItem(item) {
    const f = item.fields;
    try {
      if (item.type === 'bank' && typeof Banks !== 'undefined') {
        const rec = { id: U.id(), bankName: f.bankName, country: 'GB', bankType: 'commercial', currency: f.currency || 'GBP', iban: f.iban, last4: f.last4, balance: parseFloat(f.balance) || 0, holderName: f.holderName, phone: f.phone, email: f.email, tags: ['AI Import'], createdAt: new Date().toISOString() };
        S.banks.push(rec); Activity.log('AI Import: bank', f.bankName); Store.save();
        return true;
      }
      if (item.type === 'card' && typeof Cards !== 'undefined') {
        const rec = { id: U.id(), cardName: f.cardName, network: f.network, cardType: f.cardType, last4: f.last4, expiry: f.expiry, holderName: f.holderName, currency: f.currency || 'GBP', tags: ['AI Import'], createdAt: new Date().toISOString() };
        S.cards.push(rec); Activity.log('AI Import: card', f.cardName); Store.save();
        return true;
      }
      if (item.type === 'investment' && typeof Inv !== 'undefined') {
        const rec = { id: U.id(), investmentName: f.investmentName, broker: f.broker, type: f.type, ticker: f.ticker, currency: f.currency || 'GBP', amountInvested: parseFloat(f.amountInvested) || 0, currentValue: parseFloat(f.currentValue) || 0, riskLevel: 'Medium', ownership: 'personal', tags: ['AI Import'], createdAt: new Date().toISOString() };
        S.investments.push(rec); Activity.log('AI Import: investment', f.investmentName); Store.save();
        return true;
      }
      if (item.type === 'sim' && typeof Sims !== 'undefined') {
        const rec = { id: U.id(), network: f.network, country: f.country, simType: f.simType, status: f.status, phone: f.phone, tags: ['AI Import'], createdAt: new Date().toISOString() };
        S.sims.push(rec); Activity.log('AI Import: SIM', f.phone); Store.save();
        return true;
      }
      if (item.type === 'cash' && typeof Cash !== 'undefined') {
        const rec = { id: U.id(), label: f.label || 'Cash', amount: parseFloat(f.amount) || 0, currency: f.currency || 'GBP', location: f.location, createdAt: new Date().toISOString() };
        S.cash.push(rec); Activity.log('AI Import: cash'); Store.save();
        return true;
      }
      if (item.type === 'loan' && typeof Loans !== 'undefined') {
        const rec = { id: U.id(), personName: f.personName, amount: parseFloat(f.amount) || 0, currency: f.currency || 'GBP', type: f.type, dueDate: f.dueDate, status: 'Active', tags: ['AI Import'], createdAt: new Date().toISOString() };
        S.loans.push(rec); Activity.log('AI Import: loan', f.personName); Store.save();
        return true;
      }
    } catch(e) { console.warn('AI Import save error:', e); }
    return false;
  }

  // ── Confirmation modal ─────────────────────────────────────────────────────

  function showConfirmation(items) {
    if (!items.length) { Toast.show('Nothing detected — try more text', 'warning'); return; }

    const typeIcons = { bank:'🏦', card:'💳', investment:'📈', sim:'📱', cash:'💵', loan:'🤝' };
    const confColor = c => c >= 0.7 ? 'var(--ok)' : c >= 0.4 ? 'var(--warn)' : 'var(--err)';

    const rows = items.map((it, idx) => {
      const ic = typeIcons[it.type] || '📋';
      const confPct = Math.round(it.confidence * 100);
      const fields = Object.entries(it.fields).filter(([,v]) => v).map(([k, v]) =>
        `<div class="fr" style="margin-bottom:4px"><div class="fg"><label class="fl" style="font-size:10px">${k}</label><input class="inp" id="ai-f-${idx}-${k}" value="${String(v).replace(/"/g,'&quot;')}" style="padding:6px 8px;font-size:12px"></div></div>`
      ).join('');
      return `<div style="background:var(--glass);border:1px solid var(--border);border-radius:var(--r);padding:12px;margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <input type="checkbox" id="ai-chk-${idx}" checked style="width:16px;height:16px;accent-color:var(--accent)">
          <span style="font-size:20px">${ic}</span>
          <div style="flex:1"><div style="font-size:13px;font-weight:600">${it.label}</div><div style="font-size:11px;color:${confColor(it.confidence)};margin-top:2px">Confidence: ${confPct}%</div></div>
        </div>
        ${fields}
      </div>`;
    }).join('');

    Modal.open('🤖 AI Import — Review', `
      <p style="font-size:12px;color:var(--text2);margin-bottom:14px;line-height:1.6">Review and edit detected fields below. Uncheck items you don't want to import.</p>
      ${rows}
    `, `<button class="btn btn-g" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-p" onclick="AIImport.confirmSelected(${JSON.stringify(items).replace(/"/g,'&quot;')})">✅ Import Selected</button>`);

    // Patch: pass items reference via closure stored on window
    window._aiImportItems = items;
    document.querySelector('.mf .btn-p').onclick = () => confirmSelected(items);
  }

  function confirmSelected(items) {
    let saved = 0;
    items.forEach((it, idx) => {
      const chk = document.getElementById('ai-chk-' + idx);
      if (!chk || !chk.checked) return;
      // Read back edited field values
      Object.keys(it.fields).forEach(k => {
        const el = document.getElementById(`ai-f-${idx}-${k}`);
        if (el) it.fields[k] = el.value;
      });
      if (_saveItem(it)) saved++;
    });
    Modal.close();
    Toast.show(`Imported ${saved} item${saved !== 1 ? 's' : ''}`, 'success');
    // Refresh current page if applicable
    const pg = S.currentPage;
    if (pg && typeof R !== 'undefined') setTimeout(() => R.goto(pg), 300);
  }

  // ── Main import modal ──────────────────────────────────────────────────────

  function openImportModal() {
    Modal.open('🤖 AI Import', `
      <p style="font-size:12px;color:var(--text2);margin-bottom:14px;line-height:1.6">
        Paste any text — bank statements, SMS, screenshots, spreadsheet data — and the engine will detect banks, cards, investments, SIMs, cash and loans automatically.
      </p>
      <div class="fg">
        <label class="fl">Paste text or bank statement</label>
        <textarea class="inp" id="ai-paste" rows="7" placeholder="Paste anything here…&#10;&#10;Bank: HBL&#10;IBAN: PK36HABB0000000000000000&#10;Balance: PKR 45,000&#10;&#10;Card: **** 4321 Visa Mastercard expiry 03/28&#10;…" style="font-family:var(--mono);font-size:12px"></textarea>
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin:10px 0">
        <div style="flex:1;height:1px;background:var(--border)"></div>
        <span style="font-size:11px;color:var(--text3)">OR</span>
        <div style="flex:1;height:1px;background:var(--border)"></div>
      </div>
      <div id="ai-drop-zone" style="border:2px dashed var(--border2);border-radius:var(--r);padding:20px;text-align:center;cursor:pointer;transition:var(--t)" onclick="document.getElementById('ai-file-in').click()" ondragover="event.preventDefault();this.style.borderColor='var(--accent)'" ondragleave="this.style.borderColor=''" ondrop="AIImport.handleDrop(event)">
        <div style="font-size:28px;margin-bottom:8px">📂</div>
        <div style="font-size:13px;font-weight:600;margin-bottom:4px">Drop CSV or text file here</div>
        <div style="font-size:11px;color:var(--text3)">.csv · .txt supported</div>
      </div>
      <input type="file" id="ai-file-in" accept=".csv,.txt,.tsv" style="display:none" onchange="AIImport.handleFile(event)">
    `, `<button class="btn btn-g" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-p" onclick="AIImport.runParse()">🔍 Detect & Import</button>`);
  }

  function runParse() {
    const text = document.getElementById('ai-paste')?.value || '';
    if (!text.trim()) { Toast.show('Paste some text first', 'warning'); return; }
    const items = parse(text);
    showConfirmation(items);
  }

  function handleFile(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target.result;
      const items = parseCSV(text);
      showConfirmation(items);
    };
    reader.readAsText(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0]; if (!file) return;
    document.getElementById('ai-drop-zone').style.borderColor = '';
    const reader = new FileReader();
    reader.onload = ev => {
      const items = parseCSV(ev.target.result);
      showConfirmation(items);
    };
    reader.readAsText(file);
  }

  // ── Page render ────────────────────────────────────────────────────────────

  function render() {
    const el = document.getElementById('aiImportBody'); if (!el) return;
    el.innerHTML = `
      <div style="max-width:600px">
        <div style="background:linear-gradient(135deg,var(--glass),var(--glass2));border:1px solid var(--border);border-radius:var(--rlg);padding:20px;margin-bottom:16px;text-align:center">
          <div style="font-size:48px;margin-bottom:12px">🤖</div>
          <h3 style="font-size:18px;font-weight:700;margin-bottom:8px">Smart Import Engine</h3>
          <p style="font-size:13px;color:var(--text2);line-height:1.6;margin-bottom:16px">Paste text from bank statements, SMS messages, or any document. The engine detects banks, cards, investments, SIMs, cash and loans automatically — no external API needed.</p>
          <button class="btn btn-p" onclick="AIImport.openImportModal()" style="width:100%;max-width:280px;padding:14px;font-size:16px">📋 Start Import</button>
          <button class="btn btn-s" onclick="ExcelImport.open()" style="width:100%;max-width:280px;padding:12px;font-size:14px;margin-top:8px">📊 Import Excel / Spreadsheet</button>
        </div>

        <div style="background:var(--glass);border:1px solid var(--border);border-radius:var(--r);padding:14px;margin-bottom:12px">
          <div style="font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:var(--text3);margin-bottom:10px">What it detects</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
            ${[['🏦','Banks & IBANs'],['💳','Cards & last 4'],['📈','Investments'],['📱','SIM cards'],['💵','Cash amounts'],['🤝','Loans']].map(([ic,l])=>`<div style="text-align:center;padding:10px 6px;background:var(--glass2);border-radius:var(--rsm)"><div style="font-size:20px;margin-bottom:4px">${ic}</div><div style="font-size:11px;color:var(--text2)">${l}</div></div>`).join('')}
          </div>
        </div>

        <div style="background:var(--glass);border:1px solid var(--border);border-radius:var(--r);padding:14px">
          <div style="font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:var(--text3);margin-bottom:8px">Example input</div>
          <pre style="font-family:var(--mono);font-size:11px;color:var(--text2);line-height:1.6;white-space:pre-wrap">HBL Account — IBAN: PK36HABB0000000000000000
Balance: PKR 45,000 · Currency: PKR

Monzo Card **** 4829 Visa Debit expiry 09/27
Holder: John Smith

Jazz +92 300 1234567 Active SIM Pakistan</pre>
        </div>
      </div>`;
  }

  // ── Public ─────────────────────────────────────────────────────────────────

  return { parse, parseCSV, showConfirmation, confirmSelected, openImportModal, runParse, handleFile, handleDrop, render };

})();

// ===================== EXCEL IMPORT =====================
const ExcelImport = (() => {

  const TYPE_KEYWORDS = {
    bank:       ['bank','account','iban','sort','balance','swift'],
    card:       ['card','visa','mastercard','amex','expiry','cvv','last4'],
    investment: ['invest','stock','fund','portfolio','broker','ticker','shares'],
    cash:       ['cash','wallet','pocket','notes','location'],
    loan:       ['loan','lent','borrow','debt','owe','repay'],
    sim:        ['sim','network','mobile','phone','number','plan'],
    expense:    ['expense','subscription','bill','recurring','monthly'],
  };

  function _detectSheetType(headers, rows) {
    const txt = headers.join(' ').toLowerCase() + ' ' + (rows[0] || []).join(' ').toLowerCase();
    let best = null, bestScore = 0;
    for (const [type, kws] of Object.entries(TYPE_KEYWORDS)) {
      const score = kws.reduce((a, k) => a + (txt.includes(k) ? 1 : 0), 0);
      if (score > bestScore) { bestScore = score; best = type; }
    }
    return bestScore > 0 ? best : 'unknown';
  }

  function _mapRow(type, headers, row) {
    const get = (keys) => {
      for (const k of keys) {
        const idx = headers.findIndex(h => h && h.toLowerCase().includes(k));
        if (idx >= 0 && row[idx] !== undefined && row[idx] !== '') return String(row[idx]).trim();
      }
      return '';
    };
    if (type === 'bank') return {
      bankName:    get(['bank','name','account name']),
      country:     get(['country','cc']),
      currency:    get(['currency','cur']),
      balance:     get(['balance','amount','bal']),
      iban:        get(['iban','account number','acc no']),
      bankType:    get(['type','bank type']),
      holderName:  get(['holder','name','owner']),
    };
    if (type === 'card') return {
      cardName:  get(['card name','name','card']),
      network:   get(['network','type','brand','visa','mc','mastercard']),
      cardType:  get(['card type','type']),
      last4:     get(['last 4','last4','ending','xxxx']),
      expiry:    get(['expiry','expiration','exp']),
      currency:  get(['currency']),
    };
    if (type === 'investment') return {
      investmentName: get(['name','investment','stock','fund','asset']),
      broker:         get(['broker','platform','exchange']),
      type:           get(['type','category','asset type']),
      ticker:         get(['ticker','symbol']),
      currency:       get(['currency']),
      amountInvested: get(['invested','cost','purchase','amount invested']),
      currentValue:   get(['current','value','current value']),
    };
    if (type === 'cash') return {
      label:    get(['label','name','location','wallet']),
      amount:   get(['amount','cash','balance']),
      currency: get(['currency','cur']),
      location: get(['location','place','where']),
    };
    if (type === 'loan') return {
      personName: get(['person','name','who','contact']),
      amount:     get(['amount','sum']),
      currency:   get(['currency']),
      type:       get(['type','direction','lent','borrowed']),
      dueDate:    get(['due','due date','repay']),
    };
    if (type === 'sim') return {
      network:  get(['network','carrier','operator','provider']),
      phone:    get(['phone','number','mobile']),
      country:  get(['country','cc']),
      simType:  get(['type','sim type']),
      status:   get(['status','active']),
    };
    if (type === 'expense') return {
      name:     get(['name','service','subscription']),
      amount:   get(['amount','cost','price']),
      currency: get(['currency']),
      category: get(['category','type']),
    };
    return {};
  }

  function _saveRow(type, data) {
    const id = U.id(), ts = new Date().toISOString();
    try {
      if (type === 'bank' && data.bankName) {
        S.banks.push({ id, bankName:data.bankName, country:data.country||'', bankType:data.bankType||'commercial', currency:data.currency||'', balance:parseFloat(data.balance)||0, iban:data.iban||'', holderName:data.holderName||'', tags:['Excel Import'], createdAt:ts }); return true;
      }
      if (type === 'card' && data.cardName) {
        S.cards.push({ id, cardName:data.cardName, network:data.network||'', cardType:data.cardType||'', last4:data.last4||'', expiry:data.expiry||'', currency:data.currency||'', tags:['Excel Import'], createdAt:ts }); return true;
      }
      if (type === 'investment' && data.investmentName) {
        S.investments.push({ id, investmentName:data.investmentName, broker:data.broker||'', type:data.type||'Stocks', ticker:data.ticker||'', currency:data.currency||'', amountInvested:parseFloat(data.amountInvested)||0, currentValue:parseFloat(data.currentValue)||0, riskLevel:'Medium', tags:['Excel Import'], createdAt:ts }); return true;
      }
      if (type === 'cash' && data.amount) {
        S.cash = S.cash || [];
        S.cash.push({ id, label:data.label||'Cash', location:data.location||'Wallet', amount:parseFloat(data.amount)||0, currency:data.currency||'', createdAt:ts }); return true;
      }
      if (type === 'loan' && data.personName && data.amount) {
        S.loans = S.loans || [];
        const ltype = (data.type||'').toLowerCase().includes('lent') ? 'lent' : 'borrowed';
        S.loans.push({ id, person:data.personName, type:ltype, amount:parseFloat(data.amount)||0, currency:data.currency||'', dueDate:data.dueDate||'', status:'Active', tags:['Excel Import'], createdAt:ts }); return true;
      }
      if (type === 'sim' && data.network) {
        S.sims = S.sims || [];
        S.sims.push({ id, network:data.network, phone:data.phone||'', country:data.country||'', simType:data.simType||'Physical', status:data.status||'Active', tags:['Excel Import'], createdAt:ts }); return true;
      }
      if (type === 'expense' && data.name) {
        S.expenses = S.expenses || [];
        S.expenses.push({ id, name:data.name, amount:parseFloat(data.amount)||0, currency:data.currency||'', category:data.category||'Other', active:true, createdAt:ts }); return true;
      }
    } catch(e) { console.warn('Excel import row error:', e); }
    return false;
  }

  function open() {
    if (typeof XLSX === 'undefined') {
      Toast.show('Excel library not loaded — check your connection', 'error'); return;
    }
    Modal.open('📊 Import Excel', `
      <p style="font-size:12px;color:var(--text2);margin-bottom:12px;line-height:1.6">Upload a .xlsx or .xls file. VaultOS will scan all sheets, detect what each contains, and let you choose which to import.</p>
      <div id="xl-drop" style="border:2px dashed var(--border2);border-radius:var(--r);padding:24px;text-align:center;cursor:pointer;transition:border-color .2s" onclick="document.getElementById('xl-file').click()" ondragover="event.preventDefault();this.style.borderColor='var(--accent)'" ondragleave="this.style.borderColor=''" ondrop="ExcelImport._onDrop(event)">
        <div style="font-size:32px;margin-bottom:8px">📊</div>
        <div style="font-size:13px;font-weight:600;margin-bottom:4px">Drop .xlsx / .xls here or tap to browse</div>
        <div style="font-size:11px;color:var(--text3)">.xlsx · .xls supported</div>
      </div>
      <input type="file" id="xl-file" accept=".xlsx,.xls" style="display:none" onchange="ExcelImport._onFile(this.files[0])">
      <div id="xl-preview" style="margin-top:14px"></div>
    `, `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" id="xl-confirm" style="display:none" onclick="ExcelImport._confirmImport()">✅ Import Selected</button>`);
  }

  function _onDrop(e) {
    e.preventDefault();
    document.getElementById('xl-drop').style.borderColor = '';
    const f = e.dataTransfer.files[0]; if (f) _onFile(f);
  }

  function _onFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'array' });
        _preview(wb);
      } catch(e) { Toast.show('Failed to read file: ' + e.message, 'error'); }
    };
    reader.readAsArrayBuffer(file);
  }

  window._xlSheets = [];
  function _preview(wb) {
    window._xlSheets = wb.SheetNames.map(name => {
      const ws = wb.Sheets[name];
      const rows = XLSX.utils.sheet_to_json(ws, { header:1, defval:'' }).filter(r => r.some(c => c !== ''));
      if (!rows.length) return null;
      const headers = (rows[0] || []).map(h => String(h||'').trim());
      const dataRows = rows.slice(1).filter(r => r.some(c => c !== ''));
      const type = _detectSheetType(headers, dataRows);
      return { name, headers, dataRows, type };
    }).filter(Boolean);

    const pr = document.getElementById('xl-preview');
    if (!pr) return;
    if (!window._xlSheets.length) { pr.innerHTML = '<div style="color:var(--err);font-size:12px">No usable sheets found</div>'; return; }

    pr.innerHTML = window._xlSheets.map((sh, i) => `
      <div style="background:var(--glass);border:1px solid var(--border);border-radius:var(--r);padding:12px;margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:10px">
          <input type="checkbox" id="xl-chk-${i}" checked style="width:16px;height:16px;accent-color:var(--accent)">
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600">${sh.name}</div>
            <div style="font-size:11px;color:var(--text2);margin-top:2px">${sh.dataRows.length} rows · Detected: <span style="color:var(--accent);font-weight:600">${sh.type === 'unknown' ? '❓ Unknown' : '✅ ' + sh.type}</span></div>
          </div>
          ${sh.type !== 'unknown' ? `<select class="inp btn-sm" id="xl-type-${i}" style="width:auto;padding:5px 9px;font-size:11px">
            ${['bank','card','investment','cash','loan','sim','expense'].map(t => `<option value="${t}" ${t===sh.type?'selected':''}>${t}</option>`).join('')}
          </select>` : `<select class="inp btn-sm" id="xl-type-${i}" style="width:auto;padding:5px 9px;font-size:11px">
            <option value="">skip</option>
            ${['bank','card','investment','cash','loan','sim','expense'].map(t => `<option value="${t}">${t}</option>`).join('')}
          </select>`}
        </div>
      </div>`).join('');

    const btn = document.getElementById('xl-confirm');
    if (btn) btn.style.display = '';
  }

  function _confirmImport() {
    if (!window._xlSheets || !window._xlSheets.length) return;
    let total = 0;
    window._xlSheets.forEach((sh, i) => {
      const chk = document.getElementById('xl-chk-' + i);
      if (!chk || !chk.checked) return;
      const typeEl = document.getElementById('xl-type-' + i);
      const type = typeEl ? typeEl.value : sh.type;
      if (!type || type === 'unknown') return;
      sh.dataRows.forEach(row => {
        const data = _mapRow(type, sh.headers, row);
        if (_saveRow(type, data)) total++;
      });
    });
    Store.save();
    if (typeof buildNav === 'function') buildNav();
    Activity.log('Excel Import', `${total} items from ${window._xlSheets.length} sheets`);
    Modal.close();
    Toast.show(`Imported ${total} item${total !== 1 ? 's' : ''} from Excel`, 'success');
    const pg = S.currentPage;
    if (pg) setTimeout(() => R.goto(pg), 300);
  }

  return { open, _onFile, _onDrop, _confirmImport };
})();

