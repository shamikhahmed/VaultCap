'use strict';
// VaultOS AI Import Engine — © 2026 Shamikh Ahmed
const AIImport = {
  _results: [],

  render() {
    const body = document.getElementById('aiImportBody') || document.getElementById('importBody');
    if (!body) return;
    body.innerHTML =
      '<div style="padding:16px;display:flex;flex-direction:column;gap:14px">' +

      '<div style="background:linear-gradient(135deg,rgba(91,141,238,.15),rgba(91,141,238,.05));border:1px solid rgba(91,141,238,.25);border-radius:16px;padding:16px">' +
        '<div style="font-size:15px;font-weight:800;color:var(--accent);margin-bottom:4px">🤖 AI Import</div>' +
        '<div style="font-size:12px;color:var(--text3);line-height:1.7">Paste text from a bank statement, screenshot description, or any financial document. AI will detect and extract the data automatically.</div>' +
        '<div style="font-size:11px;color:var(--text3);margin-top:6px">Supports: Banks · Cards · Loans · Documents · Cash · Investments · Gold · Committees · Prize Bonds</div>' +
      '</div>' +

      '<div class="fg">' +
        '<label class="fl">Paste text, screenshot content, or describe your financial data</label>' +
        '<textarea class="inp" id="ie-paste" rows="6" placeholder="Examples:&#10;• HBL Current Account - Balance PKR 245,000&#10;• Barclays Visa ending 4521, expires 09/26, limit £5000&#10;• Lent £500 to Ahmed on 15 Jan, due back in March&#10;• 5 tola gold jewellery (wedding set)&#10;• Prize bonds: 200 denomination, numbers 123456 789012 345678"></textarea>' +
      '</div>' +

      '<div id="ie-drop" style="border:2px dashed var(--border);border-radius:14px;padding:24px;text-align:center;cursor:pointer;transition:all .2s" ' +
        'ondragover="event.preventDefault();this.style.borderColor=\'var(--accent)\'" ' +
        'ondragleave="this.style.borderColor=\'var(--border)\'" ' +
        'ondrop="AIImport.handleDrop(event)" ' +
        'onclick="document.getElementById(\'ie-file\').click()">' +
        '<div style="font-size:28px;margin-bottom:8px">📎</div>' +
        '<div style="font-size:13px;color:var(--text2);font-weight:600">Drop a file or tap to upload</div>' +
        '<div style="font-size:11px;color:var(--text3);margin-top:4px">PDF, image, CSV, or any document</div>' +
        '<input type="file" id="ie-file" style="display:none" accept="image/*,.csv,.json,.txt,.pdf,.xlsx,.docx" onchange="AIImport.handleFile(this.files[0])">' +
      '</div>' +

      '<button class="btn btn-p" style="width:100%" id="ie-detect-btn" onclick="AIImport.detect()">🔍 Detect &amp; Extract Data</button>' +

      '<div id="ie-results"></div>' +

      '</div>';
  },

  async handleFile(file) {
    if (!file) return;
    const paste = document.getElementById('ie-paste');
    if (!paste) return;
    if (file.type.startsWith('text') || file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
      const text = await file.text();
      paste.value = text.slice(0, 3000);
      Toast.show('File loaded — click Detect to extract data', 'info');
    } else {
      paste.value = (paste.value ? paste.value + '\n\n' : '') + '[File: ' + file.name + ' — ' + file.type + ']';
      Toast.show('File noted — add any text context and click Detect', 'info');
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
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Analysing...'; }
    if (resultsEl) resultsEl.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text3)">🤖 AI is reading your data...</div>';

    try {
      const userCur = (typeof S !== 'undefined' && S.user && S.user.currency) ? S.user.currency : 'PKR';
      const userCountry = (typeof S !== 'undefined' && S.user && S.user.country) ? S.user.country : 'PK';

      const systemPrompt = `You are a financial data extraction AI for VaultOS, a personal finance vault app. Extract ALL financial items from the user's text.

User context: currency=${userCur}, country=${userCountry}

Return ONLY a valid JSON object with NO markdown, NO explanation, NO backticks. Format:
{"detected":[{"type":"TYPE","data":{...},"confidence":0.0-1.0}]}

Types and required data fields:

"bank": {"bankName":"","accountType":"current|savings|isa|basic","accountNumber":"last 4 digits only","balance":0,"currency":"${userCur}","country":"${userCountry}"}

"card": {"cardName":"","last4":"","expiry":"MM/YY","type":"Visa|Mastercard|Amex|Other","creditLimit":0,"currency":"${userCur}","bank":""}

"loan": {"person":"","amount":0,"currency":"${userCur}","type":"lent|borrowed","dueDate":"YYYY-MM-DD or empty","notes":""}

"document": {"docType":"Passport|NIC|CNIC|Driving Licence|Visa|Insurance|Other","holderName":"","docNumber":"show only last 4 chars","expiry":"YYYY-MM-DD or empty","country":"${userCountry}"}

"cash": {"location":"wallet|home|office|safe|other","amount":0,"currency":"${userCur}","notes":""}

"investment": {"investmentName":"","type":"Stocks|Crypto|Mutual Fund|Sukuk|Fixed Deposit|ETF|Other","currentValue":0,"currency":"${userCur}","broker":"","notes":""}

"gold": {"label":"","metal":"gold|silver","weight":0,"unit":"g|tola|oz|kg","notes":""}

"bc": {"name":"","type":"ballot|fixed|bid|auto","members":0,"contribution":0,"currency":"${userCur}","myTurnRound":null,"frequency":"monthly","organiser":"","notes":""}

"bond": {"name":"","typeId":"pb_200|pb_750|pb_1500|pb_7500|pb_15000|pb_25000|pb_40000|premium|nsi_fixed|generic","quantity":1,"faceValue":0,"currency":"${userCur}","country":"${userCountry}","bondNumbers":[],"notes":""}

confidence: 1.0=all fields clear and explicit, 0.8=most fields clear, 0.6=some fields inferred, 0.4=guessed from context

Rules:
- NEVER store full account/card/document numbers — only last 4 digits
- If currency not mentioned, use ${userCur}
- If country not mentioned, use ${userCountry}
- Extract ALL items you can find, even if confidence is low
- For gold: 1 tola = 11.66g, common in PK; oz = troy ounce
- For BC: if user says "committee" or "BC" or "pardner" treat as bc type
- For prize bonds: detect denomination from amount mentioned`;

      const apiKey = localStorage.getItem('vo_claude_key') || '';
      const headers = { 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01', 'anthropic-dangerous-allow-browser': 'true' };
      if (apiKey) headers['x-api-key'] = apiKey;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1500,
          system: systemPrompt,
          messages: [{ role: 'user', content: 'Extract all financial data from this text:\n\n' + text }],
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        if (response.status === 401) throw new Error('API key required — set your Claude API key in Settings → AI Import Key');
        throw new Error((err.error && err.error.message) || 'API error ' + response.status);
      }

      const data = await response.json();
      const raw = (data.content || []).map(function(c) { return c.text || ''; }).join('');

      let parsed;
      try {
        const clean = raw.replace(/```json|```/g, '').trim();
        parsed = JSON.parse(clean);
      } catch(e) {
        throw new Error('AI returned invalid JSON. Try rephrasing your input.');
      }

      const detected = parsed.detected || [];
      if (!detected.length) {
        if (resultsEl) resultsEl.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text3)">No financial data detected. Try being more specific.</div>';
        return;
      }

      this._results = detected;
      this._renderResults(detected, resultsEl);

    } catch(e) {
      if (resultsEl) resultsEl.innerHTML = '<div style="background:rgba(255,69,58,.1);border:1px solid rgba(255,69,58,.3);border-radius:12px;padding:14px;color:var(--err);font-size:13px">❌ ' + (e.message || 'Detection failed') + '</div>';
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = '🔍 Detect & Extract Data'; }
    }
  },

  _renderResults(detected, container) {
    if (!container) return;
    const typeLabels = { bank:'🏦 Bank', card:'💳 Card', loan:'🤝 Loan', document:'🪪 Document', cash:'💵 Cash', investment:'📈 Investment', gold:'🥇 Metal', bc:'🤝 Committee', bond:'🎫 Bond' };
    const typeColors = { bank:'rgba(91,141,238,.15)', card:'rgba(52,199,89,.15)', loan:'rgba(255,159,10,.15)', document:'rgba(91,141,238,.15)', cash:'rgba(52,199,89,.15)', investment:'rgba(122,168,245,.15)', gold:'rgba(201,168,76,.15)', bc:'rgba(91,141,238,.15)', bond:'rgba(201,168,76,.15)' };

    let html = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
      '<div style="font-size:13px;font-weight:700;color:var(--text)">Found ' + detected.length + ' item' + (detected.length > 1 ? 's' : '') + '</div>' +
      '<button class="btn btn-p btn-sm" onclick="AIImport.importSelected()">✅ Import Selected</button>' +
    '</div>';

    html += detected.map(function(item, i) {
      const conf = item.confidence || 0;
      const borderColor = conf >= 0.9 ? 'rgba(52,199,89,.5)' : conf >= 0.7 ? 'rgba(255,159,10,.5)' : 'rgba(255,69,58,.5)';
      const confLabel = conf >= 0.9 ? '✓ High confidence' : conf >= 0.7 ? '~ Medium confidence' : '? Low confidence — please verify';
      const confColor = conf >= 0.9 ? 'var(--ok)' : conf >= 0.7 ? 'var(--warn)' : 'var(--err)';
      const fields = Object.entries(item.data || {}).filter(function(e) { return e[1] !== null && e[1] !== '' && e[1] !== 0 && !(Array.isArray(e[1]) && !e[1].length); });

      return '<div style="background:' + (typeColors[item.type] || 'var(--glass)') + ';border:1px solid ' + borderColor + ';border-radius:14px;padding:14px;margin-bottom:10px">' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">' +
          '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;flex:1">' +
            '<input type="checkbox" id="ie-chk-' + i + '" checked style="width:18px;height:18px;cursor:pointer">' +
            '<div style="font-size:14px;font-weight:700;color:var(--text)">' + (typeLabels[item.type] || item.type) + '</div>' +
          '</label>' +
          '<div style="font-size:10px;color:' + confColor + ';font-weight:600">' + confLabel + '</div>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:6px">' +
          fields.map(function(e) {
            const key = e[0], val = e[1];
            const displayVal = Array.isArray(val) ? val.join(', ') : String(val);
            return '<div style="display:flex;align-items:center;gap:8px">' +
              '<div style="font-size:11px;color:var(--text3);min-width:100px;text-transform:capitalize">' + key.replace(/([A-Z])/g, ' $1').trim() + '</div>' +
              '<input style="flex:1;background:var(--glass2);border:1px solid var(--border);border-radius:8px;padding:6px 10px;color:var(--text);font-size:12px" ' +
                'value="' + displayVal.replace(/"/g, '&quot;') + '" ' +
                'oninput="AIImport._results[' + i + '].data[\'' + key + '\']=this.value">' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>';
    }).join('');

    html += '<button class="btn btn-p" style="width:100%;margin-top:4px" onclick="AIImport.importSelected()">✅ Import All Selected Items</button>';
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
        S.banks.push({ id, bankName: d.bankName||'', accountType: d.accountType||'current', accountNumber: d.accountNumber||'', balance: parseFloat(d.balance)||0, currency: d.currency||'PKR', country: d.country||'PK', createdAt: now });
        count++;
      } else if (item.type === 'card') {
        if (!S.cards) S.cards = [];
        S.cards.push({ id, cardName: d.cardName||'', last4: d.last4||'', expiry: d.expiry||'', type: d.type||'Visa', creditLimit: parseFloat(d.creditLimit)||0, currency: d.currency||'PKR', bank: d.bank||'', createdAt: now });
        count++;
      } else if (item.type === 'loan') {
        if (!S.loans) S.loans = [];
        S.loans.push({ id, person: d.person||'', amount: parseFloat(d.amount)||0, currency: d.currency||'PKR', type: d.type||'lent', dueDate: d.dueDate||'', notes: d.notes||'', status: 'Active', createdAt: now });
        count++;
      } else if (item.type === 'document') {
        if (!S.documents) S.documents = [];
        S.documents.push({ id, docType: d.docType||'Other', holderName: d.holderName||'', docNumber: d.docNumber||'', expiryDate: d.expiry||'', country: d.country||'PK', createdAt: now });
        count++;
      } else if (item.type === 'cash') {
        if (!S.cash) S.cash = [];
        S.cash.push({ id, location: d.location||'wallet', amount: parseFloat(d.amount)||0, currency: d.currency||'PKR', notes: d.notes||'', createdAt: now });
        count++;
      } else if (item.type === 'investment') {
        if (!S.investments) S.investments = [];
        S.investments.push({ id, investmentName: d.investmentName||'', type: d.type||'Stocks', currentValue: parseFloat(d.currentValue)||0, amountInvested: parseFloat(d.currentValue)||0, currency: d.currency||'PKR', broker: d.broker||'', notes: d.notes||'', createdAt: now });
        count++;
      } else if (item.type === 'gold') {
        const goldItems = JSON.parse(localStorage.getItem('vo_gold') || '[]');
        goldItems.push({ label: d.label||'', metal: d.metal||'gold', weight: parseFloat(d.weight)||0, unit: d.unit||'g', useManualPrice: false, pricePerUnit: 0, notes: d.notes||'', updatedAt: now });
        localStorage.setItem('vo_gold', JSON.stringify(goldItems));
        count++;
      } else if (item.type === 'bc') {
        if (!S.bc) S.bc = [];
        S.bc.push({ id, name: d.name||'', type: d.type||'ballot', members: parseInt(d.members)||0, contribution: parseFloat(d.contribution)||0, currency: d.currency||'PKR', frequency: d.frequency||'monthly', myTurnRound: d.myTurnRound||null, totalRounds: parseInt(d.members)||0, currentRound: 1, organiser: d.organiser||'', notes: d.notes||'', memberList: [], paymentHistory: [], createdAt: now, updatedAt: now });
        count++;
      } else if (item.type === 'bond') {
        if (!S.bonds) S.bonds = [];
        S.bonds.push({ id, name: d.name||'Bond', typeId: d.typeId||'generic', quantity: parseInt(d.quantity)||1, faceValue: parseFloat(d.faceValue)||0, amount: parseFloat(d.faceValue)||0, currency: d.currency||'PKR', country: d.country||'PK', bondNumbers: Array.isArray(d.bondNumbers) ? d.bondNumbers : [], notes: d.notes||'', purchaseDate: '', maturityDate: '', annualRate: 0, createdAt: now, updatedAt: now });
        count++;
      }
    });

    if (count > 0) {
      Store.save();
      if (typeof buildNav === 'function') buildNav();
      Toast.show('Imported ' + count + ' item' + (count > 1 ? 's' : '') + ' ✓', 'success');
      this._results = [];
      const resultsEl = document.getElementById('ie-results');
      if (resultsEl) resultsEl.innerHTML = '<div style="background:rgba(52,199,89,.1);border:1px solid rgba(52,199,89,.3);border-radius:12px;padding:14px;text-align:center;color:var(--ok);font-size:14px;font-weight:700">✓ ' + count + ' item' + (count > 1 ? 's' : '') + ' imported successfully</div>';
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
window.AIImport = AIImport;
