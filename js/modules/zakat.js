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
        <button onclick="Zakat._nisabType='silver';Zakat.render()" style="flex:1;padding:10px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation;border:1px solid ${this._nisabType==='silver'?'rgba(0,150,136,.6)':'var(--border)'};background:${this._nisabType==='silver'?'rgba(0,150,136,.2)':'transparent'};color:${this._nisabType==='silver'?'#4caf50':'var(--text3)'}">🥈 Silver (612.36g)<br><span style="font-size:10px;font-weight:400">Most common — Hanafi</span></button>
        <button onclick="Zakat._nisabType='gold';Zakat.render()" style="flex:1;padding:10px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation;border:1px solid ${this._nisabType==='gold'?'rgba(0,150,136,.6)':'var(--border)'};background:${this._nisabType==='gold'?'rgba(0,150,136,.2)':'transparent'};color:${this._nisabType==='gold'?'#4caf50':'var(--text3)'}">🥇 Gold (87.48g)<br><span style="font-size:10px;font-weight:400">Conservative standard</span></button>
      </div>

      <div style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px;margin-bottom:16px">
        <div style="font-size:12px;color:var(--text3);margin-bottom:12px;text-transform:uppercase;letter-spacing:.08em">Current Prices (Enter Manually)</div>
        <div style="display:flex;flex-direction:column;gap:10px">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:20px">🥇</span>
            <div style="flex:1;font-size:13px;color:var(--text)">Gold per gram</div>
            <input id="zk-gprice" type="number" value="${saved.goldPrice||''}" placeholder="e.g. 18500"
              style="width:130px;background:var(--input);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);text-align:right;font-size:16px">
          </div>
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:20px">🥈</span>
            <div style="flex:1;font-size:13px;color:var(--text)">Silver per gram</div>
            <input id="zk-sprice" type="number" value="${saved.silverPrice||''}" placeholder="e.g. 250"
              style="width:130px;background:var(--input);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);text-align:right;font-size:16px">
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
              style="width:130px;background:var(--input);border:1px solid ${isDeduct(id)?'rgba(255,69,58,.3)':'var(--border)'};border-radius:8px;padding:10px;color:var(--text);text-align:right;font-size:16px">
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
    const report = document.getElementById('zk-result');
    if (!report) return;
    const w = window.open('', '_blank');
    if (!w) { if(window.Toast) Toast.show('Allow pop-ups to print', 'warning'); return; }
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Zakat Report — VaultOS</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, Arial, sans-serif; background: #fff; color: #1a1a2e; padding: 0; }
    .page { max-width: 600px; margin: 0 auto; padding: 40px 32px; }
    .header { background: linear-gradient(135deg, #00897b, #4caf50); color: white; padding: 28px 32px; border-radius: 16px; margin-bottom: 28px; }
    .header h1 { font-size: 24px; font-weight: 900; margin-bottom: 4px; }
    .header .sub { font-size: 13px; opacity: .8; }
    .section { background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: #666; margin-bottom: 14px; }
    .row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e9ecef; font-size: 14px; }
    .row:last-child { border-bottom: none; }
    .row .label { color: #555; }
    .row .value { font-weight: 600; }
    .footer { text-align: center; font-size: 11px; color: #999; margin-top: 28px; padding-top: 16px; border-top: 1px solid #eee; }
    .no-print { display: flex; gap: 10px; justify-content: center; margin: 20px 0; }
    .btn { padding: 12px 28px; border-radius: 10px; border: none; font-size: 14px; font-weight: 700; cursor: pointer; }
    .btn-print { background: #00897b; color: white; }
    .btn-close { background: #f1f3f5; color: #333; }
    @media print { .no-print { display: none !important; } body { padding: 0; } .page { padding: 20px; } }
  </style>
  </head><body>
  <div class="page">
    <div class="no-print">
      <button class="btn btn-print" onclick="window.print()">🖨️ Print</button>
      <button class="btn btn-close" onclick="window.close()">✕ Close</button>
    </div>
    <div class="header">
      <h1>🌙 Zakat Report</h1>
      <div class="sub">Generated by VaultOS · ${new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}</div>
    </div>
    <div class="section">
      <div class="section-title">Calculation Details</div>
      ${report.innerText.trim().split('\n').filter(l => l.trim() && !l.includes('Print') && !l.includes('🖨')).map(l => {
        const parts = l.split(/\s{2,}|\t/);
        if (parts.length >= 2) {
          return '<div class="row"><span class="label">'+parts[0]+'</span><span class="value">'+parts.slice(1).join(' ')+'</span></div>';
        }
        return '<div class="row"><span>'+l+'</span></div>';
      }).join('')}
    </div>
    <div class="footer">
      VaultOS — Your Personal Financial Vault<br>
      This report is for reference only. Consult a qualified Islamic scholar for authoritative Zakat rulings.
    </div>
    <div class="no-print" style="margin-top:16px">
      <button class="btn btn-close" onclick="window.close()">✕ Close Window</button>
    </div>
  </div>
  </body></html>`);
    w.document.close();
  }
};
window.Zakat = Zakat;
