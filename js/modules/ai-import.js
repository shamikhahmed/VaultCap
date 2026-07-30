'use strict';
// VaultOS Smart Import — offline pattern engine (no AI / no API key required)

const SmartParser = {
  _currency(text) {
    const t = text.toLowerCase();
    if (/pkr|pakistan|rs\.?\s*\d/i.test(t)) return 'PKR';
    if (/gbp|£|uk\b|british/i.test(t)) return 'GBP';
    if (/aed|uae|dirham|dhs/i.test(t)) return 'AED';
    if (/eur|€|euro/i.test(t)) return 'EUR';
    if (/sar|riyal|saudi/i.test(t)) return 'SAR';
    if (/cad|canada/i.test(t)) return 'CAD';
    if (/aud|australia/i.test(t)) return 'AUD';
    if (/inr|india|₹/i.test(t)) return 'INR';
    if (/usd|\$|dollar/i.test(t)) return 'USD';
    return (typeof S !== 'undefined' && S.user && S.user.currency) ? S.user.currency : 'USD';
  },

  _amount(text) {
    const m = text.match(/(?:PKR|GBP|USD|AED|EUR|SAR|CAD|AUD|INR|£|\$|€|₹|Rs\.?)\s*([\d,]+(?:\.\d+)?)/i)
      || text.match(/\b([\d,]+(?:\.\d+)?)\s*(?:PKR|GBP|USD|AED|EUR|month|mo|\/mo)/i)
      || text.match(/\b([\d,]+(?:\.\d+)?)\b/);
    return m ? parseFloat(m[1].replace(/,/g, '')) : 0;
  },

  _country(text) {
    const t = text.toLowerCase();
    if (/pakistan|pkr|\+92|hbl|ubl|meezan|jazz\b/i.test(t)) return 'PK';
    if (/uae|aed|\+971|emirates|fab\b|adcb/i.test(t)) return 'AE';
    if (/uk|gbp|\+44|barclays|monzo|lloyds|natwest/i.test(t)) return 'GB';
    if (/usa|usd|\+1|chase|wells fargo|bank of america/i.test(t)) return 'US';
    if (/canada|cad/i.test(t)) return 'CA';
    if (/australia|aud/i.test(t)) return 'AU';
    if (/saudi|sar/i.test(t)) return 'SA';
    if (/india|inr|\+91/i.test(t)) return 'IN';
    return (typeof S !== 'undefined' && S.user && S.user.country) ? S.user.country : 'US';
  },

  _findBank(text) {
    if (typeof SMART_DB === 'undefined' || !SMART_DB.banks) return '';
    const t = text.toLowerCase();
    for (const b of SMART_DB.banks) {
      const names = [b.name, ...(b.aliases || [])];
      for (const n of names) {
        if (n.length > 2 && t.includes(n.toLowerCase())) return b.name;
      }
    }
    if (typeof BANKS_DB !== 'undefined') {
      for (const b of BANKS_DB) {
        if (b.n.length > 2 && t.includes(b.n.toLowerCase())) return b.n;
      }
    }
    const m = text.match(/([A-Z][A-Za-z\s&]{2,28})\s+(?:bank|account)/i);
    return m ? m[1].trim() : '';
  },

  _toDetected(items) {
    return items.map(item => ({
      type: item.type,
      data: item.data || {},
      confidence: item.confidence === 'high' ? 0.95 : item.confidence === 'medium' ? 0.75 : 0.55,
    }));
  },

  parse(text) {
    const raw = (text || '').trim();
    if (!raw) return [];

    if (typeof ImportEngine !== 'undefined' && ImportEngine.parseOCRText) {
      const fromEngine = ImportEngine.parseOCRText(raw);
      if (fromEngine.length) return this._toDetected(fromEngine);
    }

    const detected = [];
    const t = raw.toLowerCase();
    const cur = this._currency(raw);
    const country = this._country(raw);

    // Bank
    if (/bank|account|balance|iban|savings|current|deposit/i.test(t)) {
      const bankName = this._findBank(raw) || 'Bank Account';
      detected.push({
        type: 'bank',
        confidence: bankName !== 'Bank Account' ? 'high' : 'medium',
        data: {
          bankName,
          accountType: /savings/i.test(t) ? 'savings' : 'current',
          balance: this._amount(raw),
          currency: cur,
          country,
        },
      });
    }

    // Card
    if (/card|visa|mastercard|amex|credit|debit|ending|last 4|expir/i.test(t)) {
      const last4 = (raw.match(/(?:ending|last\s*4|xxxx|\*{4})\s*(\d{4})/i) || raw.match(/\b(\d{4})\s*(?:exp|expires)/i) || [])[1] || '';
      const exp = (raw.match(/\b(0[1-9]|1[0-2])\s*[\/\-]\s*(\d{2}|\d{4})\b/) || [])[0] || '';
      let net = 'Visa';
      if (/mastercard|master card/i.test(t)) net = 'Mastercard';
      else if (/amex|american express/i.test(t)) net = 'American Express';
      detected.push({
        type: 'card',
        confidence: last4 ? 'high' : 'medium',
        data: {
          cardName: (this._findBank(raw) || 'Card') + ' ' + net,
          last4,
          expiry: exp.replace(/\s/g, ''),
          type: net,
          currency: cur,
          limit: this._amount(raw),
        },
      });
    }

    // Loan
    if (/lent|borrowed|owe|loan|due|pay back|repay/i.test(t)) {
      const person = (raw.match(/(?:to|from|with)\s+([A-Za-z][A-Za-z\s]{1,24})/i) || [])[1];
      detected.push({
        type: 'loan',
        confidence: person ? 'high' : 'medium',
        data: {
          person: (person || '').trim(),
          amount: this._amount(raw),
          currency: cur,
          type: /i owe|borrowed|owe/i.test(t) ? 'borrowed' : 'lent',
          dueDate: (raw.match(/(\d{4}-\d{2}-\d{2})/) || raw.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}/i) || [])[0] || '',
          notes: raw.slice(0, 120),
        },
      });
    }

    // Expense / subscription
    if (/monthly|subscription|\/mo|per month|netflix|spotify|prime|bill/i.test(t) || (typeof SUBS_DB !== 'undefined' && SUBS_DB.some(s => t.includes(s.n.toLowerCase())))) {
      let name = 'Subscription';
      if (typeof SUBS_DB !== 'undefined') {
        const sub = SUBS_DB.find(s => t.includes(s.n.toLowerCase()));
        if (sub) name = sub.n;
      }
      const named = raw.match(/^([A-Za-z0-9][A-Za-z0-9\s&.+]{1,30})\s+(?:£|\$|€|PKR|GBP)/i);
      if (named) name = named[1].trim();
      detected.push({
        type: 'expense',
        confidence: 'medium',
        data: { name, amount: this._amount(raw), currency: cur, frequency: 'monthly' },
      });
    }

    // SIM
    if (/sim|mobile|phone|jazz|zong|vodafone|ee\b|etisalat|\+?\d{10,}/i.test(t)) {
      const phone = (raw.match(/(\+\d[\d\s\-]{8,18}\d)/) || [])[1] || '';
      detected.push({
        type: 'sim',
        confidence: phone ? 'high' : 'medium',
        data: {
          network: (raw.match(/(jazz|zong|ufone|telenor|o2|ee|vodafone|three|etisalat|du|jio|airtel)/i) || [])[1] || 'Mobile',
          phone: phone.trim(),
          country,
          simType: /esim/i.test(t) ? 'eSIM' : 'Physical',
        },
      });
    }

    // Investment
    if (/invest|stock|crypto|fund|broker|etf|shares|portfolio|binance|coinbase|trading 212/i.test(t)) {
      detected.push({
        type: 'investment',
        confidence: 'medium',
        data: {
          investmentName: (raw.match(/([A-Za-z0-9][A-Za-z0-9\s&]{2,30})/) || [])[1] || 'Investment',
          type: /crypto|bitcoin|eth/i.test(t) ? 'Crypto' : /fund|etf|mutual/i.test(t) ? 'Mutual Fund' : 'Stocks',
          currentValue: this._amount(raw),
          currency: cur,
          broker: (raw.match(/(binance|coinbase|trading 212|interactive brokers|fidelity|vanguard|etoro)/i) || [])[1] || '',
        },
      });
    }

    // Gold / precious metals
    if (/gold|silver|tola|troy|jewell?ery|precious/i.test(t)) {
      const weight = (raw.match(/([\d.]+)\s*(tola|g|gram|oz|kg)/i) || []);
      detected.push({
        type: 'gold',
        confidence: 'medium',
        data: {
          label: raw.slice(0, 40),
          metal: /silver/i.test(t) ? 'silver' : 'gold',
          weight: weight[1] ? parseFloat(weight[1]) : 0,
          unit: (weight[2] || 'g').toLowerCase(),
        },
      });
    }

    // BC / committee
    if (/committee|bc\b|pardner|jamiya|susu|rotating savings/i.test(t)) {
      detected.push({
        type: 'bc',
        confidence: 'medium',
        data: {
          name: (raw.match(/([A-Za-z0-9][A-Za-z0-9\s]{2,30})\s+(?:bc|committee)/i) || [])[1] || 'Committee',
          type: 'ballot',
          members: parseInt((raw.match(/(\d+)\s*members?/i) || [])[1]) || 0,
          contribution: this._amount(raw),
          currency: cur,
          frequency: 'monthly',
        },
      });
    }

    // Prize bonds
    if (/prize bond|premium bond|bond number|nss|savings certificate/i.test(t)) {
      detected.push({
        type: 'bond',
        confidence: 'medium',
        data: {
          name: 'Prize Bonds',
          typeId: 'generic',
          quantity: (raw.match(/(\d+)\s*(?:bonds?|numbers?)/i) || [])[1] || 1,
          faceValue: this._amount(raw) || 0,
          currency: cur,
          country,
        },
      });
    }

    // Document
    if (/passport|driving|licen[cs]e|nic|cnic|visa|id card|national id/i.test(t)) {
      detected.push({
        type: 'document',
        confidence: 'medium',
        data: {
          docType: /passport/i.test(t) ? 'Passport' : /driv/i.test(t) ? 'Driving Licence' : /visa/i.test(t) ? 'Visa' : 'ID Card',
          holderName: (raw.match(/(?:for|name:)\s*([A-Za-z\s]{2,30})/i) || [])[1] || '',
          docNumber: (raw.match(/\b([A-Z0-9]{4,12})\b/) || [])[1] || '',
          expiry: (raw.match(/(\d{4}-\d{2}-\d{2})/) || [])[1] || '',
          country,
        },
      });
    }

    // Cash
    if (/cash|wallet|safe|physical|notes|bills/i.test(t) && !detected.length) {
      detected.push({
        type: 'cash',
        confidence: 'medium',
        data: {
          location: /safe/i.test(t) ? 'safe' : /home/i.test(t) ? 'home' : 'wallet',
          amount: this._amount(raw),
          currency: cur,
          notes: raw.slice(0, 80),
        },
      });
    }

    const unique = [...new Map(detected.map(r => [JSON.stringify(r.data), r])).values()];
    return this._toDetected(unique);
  },

  parseOne(text) {
    const items = this.parse(text);
    if (!items.length) return null;
    const best = items[0];
    return { module: best.type === 'expense' ? 'expense' : best.type, fields: best.data || {} };
  },
};

const AIImport = {
  _results: [],

  parse(text) { return SmartParser.parse(text); },

  openImportModal() {
    if (typeof R !== 'undefined' && R.goto) R.goto('import');
    else this.render();
  },

  render() {
    const body = document.getElementById('aiImportBody') || document.getElementById('importBody');
    if (!body) return;
    body.innerHTML =
      '<div class="vc-ix-59">' +

      '<div class="u-highlight-card">' +
        '<div class="vc-ix-207">Paste text from statements, messages, or notes. Smart Parser works offline; optional LLM in Settings improves accuracy when you add your own API key.</div>' +
        '<div style="font-size:11px;color:var(--text3);margin-top:6px">Works globally · Banks · Cards · Loans · Cash · Investments · Documents · SIMs · Expenses</div>' +
      '</div>' +

      '<div class="fg">' +
        '<label class="fl">Paste text or describe your data</label>' +
        '<textarea class="inp" id="ie-paste" rows="6" placeholder="Examples:&#10;• Chase checking account — USD 12,500 balance&#10;• Visa ending 4521, expires 09/26&#10;• Lent $500 to Alex, due March 2026&#10;• Netflix $17.99 monthly&#10;• Jazz SIM +92 300 1234567"></textarea>' +
      '</div>' +

      '<div id="ie-drop" style="border:2px dashed var(--border);border-radius:14px;padding:24px;text-align:center;cursor:pointer;transition:all .2s" ' +
        'ondragover="event.preventDefault();this.style.borderColor=\'var(--accent)\'" ' +
        'ondragleave="this.style.borderColor=\'var(--border)\'" ' +
        'ondrop="AIImport.handleDrop(event)" ' +
        'data-act="document.getElementById(\'ie-file\').click()">' +
        '<div class="vc-ix-130">' + (typeof VC !== 'undefined' ? VC.icon('download', 28) : '') + '</div>' +
        '<div style="font-size:13px;color:var(--text2);font-weight:600">Drop a file or tap to upload</div>' +
        '<div class="vc-ix-114">CSV, text, or image (OCR via Import page)</div>' +
        '<input class="vc-ix-17" type="file" id="ie-file" accept="image/*,.csv,.json,.txt,.pdf,.xlsx,.docx" data-act-change="AIImport.handleFile(this.files[0])">' +
      '</div>' +

      '<button type="button" class="btn btn-p vc-ix-16" id="ie-detect-btn" data-act="AIImport.detect()">Detect &amp; Extract</button>' +

      '<div class="vc-ix-148" id="ie-status">' +
        '<div class="vc-ix-10" id="ie-status-text"></div>' +
        '<div class="vc-ix-149"><div class="vc-ix-150" id="ie-progress"></div></div>' +
      '</div>' +

      '<div id="llm-health-import" style="font-size:11px;color:var(--text3);line-height:1.5;padding:0 2px"></div>' +

      '<div id="ie-results"></div>' +

      '</div>';
    if (typeof LlmAssist !== 'undefined') {
      setTimeout(() => LlmAssist.renderHealthEl('llm-health-import'), 0);
    }
  },

  async handleFile(file) {
    if (!file) return;
    const paste = document.getElementById('ie-paste');
    if (!paste) return;
    if (file.type.startsWith('text') || file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
      const text = await file.text();
      paste.value = text.slice(0, 8000);
      Toast.show('File loaded — tap Detect', 'info');
    } else if (typeof ImportEngine !== 'undefined') {
      Toast.show('Opening full import for this file type…', 'info');
      if (typeof R !== 'undefined') R.goto('import');
      setTimeout(() => ImportEngine.handleFile && ImportEngine.handleFile(file), 300);
    } else {
      paste.value = (paste.value ? paste.value + '\n\n' : '') + '[File: ' + file.name + ']';
    }
  },

  handleDrop(event) {
    event.preventDefault();
    const drop = document.getElementById('ie-drop');
    if (drop) drop.style.borderColor = 'var(--border)';
    const file = event.dataTransfer.files[0];
    if (file) this.handleFile(file);
  },

  async detect() {
    const pasteEl = document.getElementById('ie-paste');
    const text = (pasteEl ? pasteEl.value : '').trim();
    if (!text) { Toast.show('Paste some text first', 'warn'); return; }

    const btn = document.getElementById('ie-detect-btn');
    const resultsEl = document.getElementById('ie-results');
    if (btn) { btn.disabled = true; btn.textContent = 'Analysing…'; }

    try {
      let detected = null;
      let llmProxyDown = false;
      if (typeof LlmAssist !== 'undefined' && LlmAssist.getConfig().enabled) {
        const cfg = LlmAssist.getConfig();
        if (cfg.proxyUrl) {
          const health = await LlmAssist.checkProxyHealth();
          if (health.status === 'error') {
            llmProxyDown = true;
            if (resultsEl) {
              resultsEl.innerHTML = '<div style="background:rgba(255,159,10,.12);border:1px solid rgba(255,159,10,.35);border-radius:12px;padding:14px;margin-bottom:10px;font-size:12px;line-height:1.55;color:var(--text2)">' +
                '<strong style="color:var(--warn)">LLM proxy offline</strong><br>' +
                escHtml(health.message) + '<br><span class="vc-ix-4">Continuing with offline Smart Parser…</span></div>';
            }
            Toast.show('LLM proxy offline — using Smart Parser only', 'warning', 5000);
          }
        }
        try {
          detected = await LlmAssist.parseText(text);
        } catch (e) {
          if (e.message === 'LLM_PROXY_DOWN') {
            llmProxyDown = true;
            detected = null;
          } else throw e;
        }
      }
      if (!detected || !detected.length) detected = SmartParser.parse(text);
      if (!detected.length) {
        const emptyMsg = llmProxyDown
          ? 'Smart Parser found nothing. LLM enhanced parsing was unavailable because the proxy is down — try again later or add more detail (bank name, amount, currency).'
          : 'No financial data detected. Try including amounts, bank names, or card details.';
        if (resultsEl) resultsEl.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text3);line-height:1.55">' + emptyMsg + '</div>';
        Toast.show(llmProxyDown ? 'Proxy down — Smart Parser found nothing' : 'Nothing detected — add more detail', 'warn');
      } else {
        this._results = detected;
        this._renderResults(detected, resultsEl);
        Toast.show('Found ' + detected.length + ' item' + (detected.length > 1 ? 's' : ''), 'success');
      }
    } catch (e) {
      if (resultsEl) resultsEl.innerHTML = '<div style="color:var(--err);font-size:13px;padding:14px">Detection failed — ' + (e.message || 'unknown error') + '</div>';
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Detect & Extract'; }
    }
  },

  _renderResults(detected, container) {
    if (!container) return;
    const typeLabels = { bank:'Bank', card:'Card', loan:'Loan', document:'Document', cash:'Cash', investment:'Investment', gold:'Metal', bc:'Committee', bond:'Bond', expense:'Expense', sim:'SIM', email:'Email' };
    const typeIcons = { bank:'bank', card:'card', loan:'handshake', document:'id-card', cash:'banknote', investment:'chart', gold:'gem', bc:'handshake', bond:'ticket', expense:'repeat', sim:'smartphone', email:'mail' };
    const typeColors = { bank:'rgba(255,255,255,.15)', card:'rgba(52,199,89,.15)', loan:'rgba(255,159,10,.15)', document:'rgba(255,255,255,.15)', cash:'rgba(52,199,89,.15)', investment:'rgba(122,168,245,.15)', gold:'rgba(201,168,76,.15)', bc:'rgba(255,255,255,.15)', bond:'rgba(201,168,76,.15)', expense:'rgba(233,30,140,.12)', sim:'rgba(255,255,255,.12)' };

    let html = '<div class="vc-ix-136">' +
      '<div class="vc-ix-56">Found ' + detected.length + ' item' + (detected.length > 1 ? 's' : '') + '</div>' +
      '<button type="button" class="btn btn-p btn-sm" data-act="AIImport.importSelected()">Import Selected</button>' +
    '</div>';

    html += detected.map(function(item, i) {
      const conf = item.confidence || 0;
      const borderColor = conf >= 0.9 ? 'rgba(52,199,89,.5)' : conf >= 0.7 ? 'rgba(255,159,10,.5)' : 'rgba(255,69,58,.5)';
      const confLabel = conf >= 0.9 ? 'High confidence' : conf >= 0.7 ? 'Medium confidence' : 'Review carefully';
      const typeIc = typeof VC !== 'undefined' ? VC.icon(typeIcons[item.type] || 'file', 14) : '';
      const typeLabel = typeLabels[item.type] || item.type;
      const confColor = conf >= 0.9 ? 'var(--ok)' : conf >= 0.7 ? 'var(--warn)' : 'var(--err)';
      const fields = Object.entries(item.data || {}).filter(function(e) { return e[1] !== null && e[1] !== '' && e[1] !== 0 && !(Array.isArray(e[1]) && !e[1].length); });

      return '<div style="background:' + (typeColors[item.type] || 'var(--glass)') + ';border:1px solid ' + borderColor + ';border-radius:14px;padding:14px;margin-bottom:10px">' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">' +
          '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;flex:1">' +
            '<input type="checkbox" id="ie-chk-' + i + '" checked style="width:18px;height:18px;cursor:pointer">' +
            '<div style="font-size:14px;font-weight:700;color:var(--text);display:flex;align-items:center;gap:6px"><span class="chip-ic">' + typeIc + '</span>' + typeLabel + '</div>' +
          '</label>' +
          '<div style="font-size:10px;color:' + confColor + ';font-weight:600">' + confLabel + '</div>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:6px">' +
          fields.map(function(e) {
            const key = e[0], val = e[1];
            const displayVal = Array.isArray(val) ? val.join(', ') : String(val);
            return '<div class="vc-ix-161">' +
              '<div style="font-size:11px;color:var(--text3);min-width:100px;text-transform:capitalize">' + key.replace(/([A-Z])/g, ' $1').trim() + '</div>' +
              '<input style="flex:1;background:var(--glass2);border:1px solid var(--border);border-radius:8px;padding:6px 10px;color:var(--text);font-size:12px" ' +
                'value="' + displayVal.replace(/"/g, '&quot;') + '" ' +
                'data-act-input="ActHelpers.setAiResult(' + i + ',\'' + key + '\',this.value)">' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>';
    }).join('');

    html += '<button type="button" class="btn btn-p" style="width:100%;margin-top:4px" data-act="AIImport.importSelected()">Import All Selected Items</button>';
    container.innerHTML = html;
  },

  importSelected() {
    const results = this._results;
    if (!results || !results.length) { Toast.show('Nothing to import', 'warn'); return; }

    let count = 0;
    const now = new Date().toISOString();

    results.forEach(function(item, i) {
      const chk = document.getElementById('ie-chk-' + i);
      if (chk && !chk.checked) return;

      const d = item.data || {};
      const id = Math.random().toString(36).slice(2);

      if (item.type === 'bank') {
        if (!S.banks) S.banks = [];
        S.banks.push({ id, bankName: d.bankName||'', accountType: d.accountType||'current', accountNumber: d.accountNumber||'', balance: parseFloat(d.balance)||0, currency: d.currency||'USD', country: d.country||'US', createdAt: now });
        count++;
      } else if (item.type === 'card') {
        if (!S.cards) S.cards = [];
        S.cards.push({ id, cardName: d.cardName||'', last4: d.last4||'', expiry: d.expiry||'', type: d.type||'Visa', limit: parseFloat(d.creditLimit||d.limit)||0, currency: d.currency||'USD', bank: d.bank||'', createdAt: now });
        count++;
      } else if (item.type === 'loan') {
        if (!S.loans) S.loans = [];
        S.loans.push({ id, person: d.person||'', amount: parseFloat(d.amount)||0, currency: d.currency||'USD', type: d.type||'lent', dueDate: d.dueDate||'', notes: d.notes||'', status: 'Active', createdAt: now });
        count++;
      } else if (item.type === 'document') {
        if (!S.documents) S.documents = [];
        S.documents.push({ id, docType: d.docType||'Other', holderName: d.holderName||'', docNumber: d.docNumber||'', expiryDate: d.expiry||'', country: d.country||'US', createdAt: now });
        count++;
      } else if (item.type === 'cash') {
        if (!S.cash) S.cash = [];
        S.cash.push({ id, location: d.location||'wallet', amount: parseFloat(d.amount)||0, currency: d.currency||'USD', notes: d.notes||'', createdAt: now });
        count++;
      } else if (item.type === 'investment') {
        if (!S.investments) S.investments = [];
        S.investments.push({ id, investmentName: d.investmentName||'', type: d.type||'Stocks', currentValue: parseFloat(d.currentValue)||0, amountInvested: parseFloat(d.currentValue)||0, currency: d.currency||'USD', broker: d.broker||'', notes: d.notes||'', createdAt: now });
        count++;
      } else if (item.type === 'expense') {
        if (!S.expenses) S.expenses = [];
        S.expenses.push({ id, name: d.name||'Expense', amount: parseFloat(d.amount)||0, currency: d.currency||'USD', frequency: d.frequency||'monthly', active: true, createdAt: now });
        count++;
      } else if (item.type === 'sim') {
        if (!S.sims) S.sims = [];
        S.sims.push({ id, network: d.network||'', phone: d.phone||'', country: d.country||'US', simType: d.simType||'Physical', status: 'Active', createdAt: now });
        count++;
      } else if (item.type === 'gold') {
        S.assets = S.assets || [];
        S.assets.push({
          id: 'ast_' + Date.now() + '_' + Math.random().toString(36).slice(2,7),
          assetType: 'precious_metals',
          name: d.label || ((d.metal || 'Gold') + (d.weight ? ' ' + d.weight + (d.unit||'g') : '')),
          metalType: d.metal || 'Gold',
          weight: parseFloat(d.weight)||0,
          unit: d.unit || 'g',
          purity: d.purity || '24K',
          purchasePrice: parseFloat(d.purchasePrice)||0,
          currency: d.currency || (S.user && S.user.currency) || 'USD',
          country: d.country || (S.user && S.user.country) || 'US',
          ownerId: 'self',
          createdAt: now,
          updatedAt: now,
        });
        count++;
      } else if (item.type === 'bc') {
        if (!S.bc) S.bc = [];
        S.bc.push({ id, name: d.name||'', type: d.type||'ballot', members: parseInt(d.members)||0, contribution: parseFloat(d.contribution)||0, currency: d.currency||'USD', frequency: d.frequency||'monthly', myTurnRound: d.myTurnRound||null, totalRounds: parseInt(d.members)||0, currentRound: 1, organiser: d.organiser||'', notes: d.notes||'', memberList: [], paymentHistory: [], createdAt: now, updatedAt: now });
        count++;
      } else if (item.type === 'bond') {
        if (!S.bonds) S.bonds = [];
        S.bonds.push({ id, name: d.name||'Bond', typeId: d.typeId||'generic', quantity: parseInt(d.quantity)||1, faceValue: parseFloat(d.faceValue)||0, amount: parseFloat(d.faceValue)||0, currency: d.currency||'USD', country: d.country||'US', bondNumbers: Array.isArray(d.bondNumbers) ? d.bondNumbers : [], notes: d.notes||'', purchaseDate: '', maturityDate: '', annualRate: 0, createdAt: now, updatedAt: now });
        count++;
      }
    });

    if (count > 0) {
      Store.save();
      if (typeof buildNav === 'function') buildNav();
      Toast.show('Imported ' + count + ' item' + (count > 1 ? 's' : ''), 'success');
      this._results = [];
      const resultsEl = document.getElementById('ie-results');
      if (resultsEl) resultsEl.innerHTML = '<div style="background:rgba(52,199,89,.1);border:1px solid rgba(52,199,89,.3);border-radius:12px;padding:14px;text-align:center;color:var(--ok);font-size:14px;font-weight:700">' + count + ' item' + (count > 1 ? 's' : '') + ' imported successfully</div>';
    } else {
      Toast.show('No items selected', 'warn');
    }
  },

  parseText(text) {
    const el = document.getElementById('ie-paste');
    if (el) el.value = text;
    this.detect();
  },
};

window.SmartParser = SmartParser;
window.AIImport = AIImport;
