'use strict';
const Zakat = {
  _type: 'individual',
  _nisabType: 'silver',

  render() {
    const body = document.getElementById('pg-zakat-body');
    if (!body) return;
    const saved = JSON.parse(localStorage.getItem('vo_zakat_calc')||'{}');
    body.innerHTML = `
    <div style="padding:16px">
      <div style="background:linear-gradient(135deg,rgba(0,150,136,.15),rgba(76,175,80,.1));border:1px solid rgba(0,150,136,.3);border-radius:16px;padding:16px;margin-bottom:20px">
        <div style="font-size:15px;font-weight:800;color:#4caf50;margin-bottom:4px">🌙 Zakat Calculator</div>
        <div style="font-size:12px;color:var(--text3);line-height:1.7">Zakat is due on wealth held above nisab for one full lunar year (hawl). Rate: <strong style="color:#4caf50">2.5%</strong></div>
      </div>

      <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">Who is this for?</div>
      <div style="display:flex;gap:8px;margin-bottom:20px">
        ${[['individual','👤 Individual'],['business','🏪 Business / Partnership'],['farmer','🌾 Farmer / Agriculture']].map(([v,l])=>`
          <button onclick="Zakat._type='${v}';Zakat.render()" style="flex:1;padding:10px 6px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation;border:1px solid ${this._type===v?'rgba(0,150,136,.6)':'var(--border)'};background:${this._type===v?'rgba(0,150,136,.2)':'transparent'};color:${this._type===v?'#4caf50':'var(--text3)'}">${l}</button>`).join('')}
      </div>

      <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">Nisab Standard</div>
      <div style="display:flex;gap:8px;margin-bottom:20px">
        <button onclick="Zakat._nisabType='silver';Zakat.render()" style="flex:1;padding:10px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid ${this._nisabType==='silver'?'rgba(0,150,136,.6)':'var(--border)'};background:${this._nisabType==='silver'?'rgba(0,150,136,.2)':'transparent'};color:${this._nisabType==='silver'?'#4caf50':'var(--text3)'}">🥈 Silver (612.36g)<br><span style="font-size:10px;font-weight:400">Most common — Hanafi</span></button>
        <button onclick="Zakat._nisabType='gold';Zakat.render()" style="flex:1;padding:10px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid ${this._nisabType==='gold'?'rgba(0,150,136,.6)':'var(--border)'};background:${this._nisabType==='gold'?'rgba(0,150,136,.2)':'transparent'};color:${this._nisabType==='gold'?'#4caf50':'var(--text3)'}">🥇 Gold (87.48g)<br><span style="font-size:10px;font-weight:400">Conservative standard</span></button>
      </div>

      <div style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px;margin-bottom:16px">
        <div style="font-size:12px;color:var(--text3);margin-bottom:12px;text-transform:uppercase;letter-spacing:.08em">Current Prices (Enter Manually)</div>
        <div style="display:flex;flex-direction:column;gap:10px">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:20px">🥇</span>
            <div style="flex:1;font-size:13px;color:var(--text)">Gold per gram</div>
            <input id="zk-gprice" type="number" value="${saved.goldPrice||''}" placeholder="e.g. 18500"
              style="width:130px;background:var(--input);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);text-align:right">
          </div>
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:20px">🥈</span>
            <div style="flex:1;font-size:13px;color:var(--text)">Silver per gram</div>
            <input id="zk-sprice" type="number" value="${saved.silverPrice||''}" placeholder="e.g. 250"
              style="width:130px;background:var(--input);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);text-align:right">
          </div>
        </div>
      </div>

      ${this._assetFields(saved)}

      <button onclick="Zakat.calculate()" style="width:100%;padding:14px;border-radius:12px;background:linear-gradient(135deg,#00897b,#4caf50);border:none;color:#fff;font-size:15px;font-weight:800;cursor:pointer;touch-action:manipulation;margin-bottom:12px">Calculate Zakat</button>
      <div id="zk-result"></div>
    </div>`;
  },

  _assetFields(saved) {
    const individual = [
      ['💰','zk-cash','Cash & Bank Balances'],
      ['🥇','zk-gold','Gold Value (at current price)'],
      ['🥈','zk-silver','Silver Value (at current price)'],
      ['📈','zk-invest','Stocks & Investments (current market value)'],
      ['🤝','zk-recv','Money owed to you (receivables)'],
      ['🏭','zk-stock','Business inventory / goods for trade'],
      ['💸','zk-debts','− Debts you owe (immediate, deduct)'],
      ['📋','zk-exp','− Immediate expenses due (deduct)'],
    ];
    const business = [
      ['💰','zk-cash','Cash in hand & bank'],
      ['🏭','zk-stock','Inventory / stock for sale (cost price)'],
      ['🤝','zk-recv','Receivables / debtors'],
      ['📈','zk-invest','Investments & shares (market value)'],
      ['💸','zk-debts','− Business debts / creditors (deduct)'],
      ['📋','zk-exp','− Immediate liabilities (deduct)'],
    ];
    const farmer = [
      ['🌾','zk-produce','Value of agricultural produce (harvest)'],
      ['💰','zk-cash','Cash savings'],
      ['🐄','zk-livestock','Livestock value (cattle/sheep/camels for trade)'],
      ['💸','zk-debts','− Debts & expenses (deduct)'],
    ];
    const fields = this._type==='business'?business:this._type==='farmer'?farmer:individual;
    const isDeduct = id => id==='zk-debts'||id==='zk-exp';
    return `<div style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px;margin-bottom:16px">
      <div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">Your ${this._type==='farmer'?'Agricultural':this._type==='business'?'Business':'Zakatable'} Assets</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${fields.map(([icon,id,label])=>`
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:18px;flex-shrink:0">${icon}</span>
            <div style="flex:1;font-size:13px;color:${isDeduct(id)?'var(--danger)':'var(--text)'}">${label}</div>
            <input id="${id}" type="number" value="${saved[id]||''}" placeholder="0" min="0"
              style="width:130px;background:var(--input);border:1px solid ${isDeduct(id)?'rgba(255,69,58,.3)':'var(--border)'};border-radius:8px;padding:10px;color:var(--text);text-align:right">
          </div>`).join('')}
      </div>
    </div>`;
  },

  calculate() {
    const g = id => parseFloat(document.getElementById(id)?.value||0);
    const goldPrice = g('zk-gprice');
    const silverPrice = g('zk-sprice');

    const nisabGold = 87.48 * goldPrice;
    const nisabSilver = 612.36 * silverPrice;
    const nisab = this._nisabType==='silver' ? nisabSilver : nisabGold;

    const assetIds = ['zk-cash','zk-gold','zk-silver','zk-invest','zk-recv','zk-stock','zk-produce','zk-livestock'];
    const deductIds = ['zk-debts','zk-exp'];
    const totalAssets = assetIds.reduce((a,id)=>a+g(id),0);
    const totalDeduct = deductIds.reduce((a,id)=>a+g(id),0);
    const netWealth = Math.max(0, totalAssets - totalDeduct);
    const eligible = nisab > 0 && netWealth >= nisab;
    const zakatDue = eligible ? netWealth * 0.025 : 0;

    const cur = window.Currency ? Currency.get().base : 'PKR';
    const fmt = n => (cur==='GBP'?'£':cur==='USD'?'$':cur==='AED'?'AED ':'PKR ') + Math.round(n).toLocaleString();

    const saved = {};
    ['zk-gprice','zk-sprice','zk-cash','zk-gold','zk-silver','zk-invest','zk-recv','zk-stock','zk-produce','zk-livestock','zk-debts','zk-exp'].forEach(id=>{
      saved[id]=document.getElementById(id)?.value||'';
    });
    saved.goldPrice=goldPrice; saved.silverPrice=silverPrice;
    localStorage.setItem('vo_zakat_calc',JSON.stringify(saved));

    const res = document.getElementById('zk-result');
    if (!res) return;
    res.innerHTML = `
      <div id="zk-report" style="background:${eligible?'linear-gradient(135deg,rgba(0,150,136,.2),rgba(76,175,80,.1))':'linear-gradient(135deg,rgba(255,152,0,.1),rgba(255,193,7,.08))'};border:1px solid ${eligible?'rgba(76,175,80,.4)':'rgba(255,193,7,.4)'};border-radius:16px;padding:20px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <div style="font-size:13px;font-weight:800;color:var(--text)">🌙 Zakat Report</div>
          <button onclick="Zakat.printReport()" style="font-size:12px;color:var(--info);background:rgba(0,213,255,.1);border:1px solid rgba(0,213,255,.3);border-radius:8px;padding:6px 12px;cursor:pointer">🖨️ Print</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;font-size:13px">
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Filing Type</span><span style="font-weight:700;text-transform:capitalize">${this._type}</span></div>
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Nisab Standard</span><span style="font-weight:700">${this._nisabType==='silver'?'🥈 Silver (612.36g)':'🥇 Gold (87.48g)'}</span></div>
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Nisab Threshold</span><span style="font-weight:700">${fmt(nisab)}</span></div>
          <div style="height:1px;background:var(--border);margin:4px 0"></div>
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Total Assets</span><span style="font-weight:700">${fmt(totalAssets)}</span></div>
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Deductions</span><span style="font-weight:700;color:var(--danger)">− ${fmt(totalDeduct)}</span></div>
          <div style="display:flex;justify-content:space-between;padding-top:8px;border-top:1px solid var(--border)"><span style="font-weight:700">Net Zakatable Wealth</span><span style="font-size:16px;font-weight:900">${fmt(netWealth)}</span></div>
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Zakat Eligible?</span><span style="font-weight:800;color:${eligible?'#4caf50':'#ff9800'}">${eligible?'✅ Yes — Zakat is Due':'❌ Below Nisab — Not Due'}</span></div>
          ${eligible?`<div style="display:flex;justify-content:space-between;padding:12px;background:rgba(76,175,80,.15);border-radius:10px;margin-top:4px"><span style="font-size:15px;font-weight:800;color:#4caf50">Zakat Due @ 2.5%</span><span style="font-size:24px;font-weight:900;color:#4caf50">${fmt(zakatDue)}</span></div>`:''}
        </div>
        ${!eligible&&nisab===0?'<div style="margin-top:12px;font-size:12px;color:var(--warning)">⚠️ Enter gold/silver prices to calculate nisab threshold.</div>':''}
      </div>`;
  },

  printReport() {
    const report = document.getElementById('zk-report');
    if (!report) return;
    const w = window.open('','_blank');
    w.document.write(`<html><head><title>Zakat Report</title><style>body{font-family:Arial,sans-serif;padding:30px;max-width:600px;margin:0 auto}h1{color:#00897b}table{width:100%;border-collapse:collapse;margin:16px 0}td{padding:10px;border-bottom:1px solid #eee}td:last-child{text-align:right;font-weight:600}.total{font-size:18px;color:#00897b;font-weight:900}.header{background:#f0faf8;padding:16px;border-radius:8px;margin-bottom:20px}</style></head><body>
      <h1>🌙 Zakat Report</h1>
      <div class="header"><p>Generated: ${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</p></div>
      ${report.innerText.replace(/\n/g,'<br>')}
      <p style="margin-top:30px;font-size:12px;color:#999">Generated by VaultOS — your personal financial vault</p>
      </body></html>`);
    w.document.close();
    w.print();
  }
};
window.Zakat = Zakat;
