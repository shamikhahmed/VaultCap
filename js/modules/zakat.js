const Zakat = {
  render() {
    const body = document.getElementById('pg-zakat-body');
    if (!body) return;
    const saved = JSON.parse(localStorage.getItem('vo_zakat_calc')||'{}');
    body.innerHTML = `
      <div style="padding:16px">
        <div style="background:linear-gradient(135deg,rgba(0,150,136,.15),rgba(76,175,80,.1));border:1px solid rgba(0,150,136,.3);border-radius:var(--r);padding:16px;margin-bottom:20px">
          <div style="font-size:14px;font-weight:700;color:#4caf50;margin-bottom:4px">🌙 Zakat Calculator</div>
          <div style="font-size:12px;color:var(--text3);line-height:1.6">Nisab threshold: 85g of gold or 595g of silver. Zakat = 2.5% of net zakatable wealth held for one lunar year.</div>
        </div>

        <div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">Enter Current Prices (Manual)</div>
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:140px;font-size:13px;color:var(--text)">Gold price per gram</div>
            <input id="zk-gold-price" type="number" value="${saved.goldPrice||''}" placeholder="e.g. 20000 PKR" style="flex:1;background:var(--input);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text)">
          </div>
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:140px;font-size:13px;color:var(--text)">Silver price per gram</div>
            <input id="zk-silver-price" type="number" value="${saved.silverPrice||''}" placeholder="e.g. 250 PKR" style="flex:1;background:var(--input);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text)">
          </div>
        </div>

        <div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">Your Zakatable Assets</div>
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px">
          ${[
            ['zk-cash','Cash & Bank Balances'],
            ['zk-gold-val','Gold Value (market price)'],
            ['zk-silver-val','Silver Value (market price)'],
            ['zk-investments','Stocks & Investments (current value)'],
            ['zk-receivable','Money owed to you'],
            ['zk-stock','Business inventory / stock'],
          ].map(([id,label])=>`
            <div style="display:flex;align-items:center;gap:10px">
              <div style="flex:1;font-size:13px;color:var(--text)">${label}</div>
              <input id="${id}" type="number" value="${saved[id]||''}" placeholder="0" min="0"
                style="width:140px;background:var(--input);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);text-align:right">
            </div>`).join('')}
        </div>

        <div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">Deductible Liabilities</div>
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px">
          ${[
            ['zk-debts','Debts you owe (immediate)'],
            ['zk-expenses','Immediate expenses due'],
          ].map(([id,label])=>`
            <div style="display:flex;align-items:center;gap:10px">
              <div style="flex:1;font-size:13px;color:var(--text)">${label}</div>
              <input id="${id}" type="number" value="${saved[id]||''}" placeholder="0" min="0"
                style="width:140px;background:var(--input);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);text-align:right">
            </div>`).join('')}
        </div>

        <button class="btn btn-g" style="width:100%;margin-bottom:12px" onclick="Zakat.calculate()">Calculate Zakat</button>
        <div id="zk-result"></div>
      </div>`;
  },

  calculate() {
    const g = id => parseFloat(document.getElementById(id)?.value||0);
    const goldPrice = g('zk-gold-price');
    const silverPrice = g('zk-silver-price');
    const fields = ['zk-cash','zk-gold-val','zk-silver-val','zk-investments','zk-receivable','zk-stock'];
    const deductions = ['zk-debts','zk-expenses'];
    const totalAssets = fields.reduce((a,id)=>a+g(id),0);
    const totalDebts = deductions.reduce((a,id)=>a+g(id),0);
    const netWealth = totalAssets - totalDebts;

    const nisabGold = 85 * goldPrice;
    const nisabSilver = 595 * silverPrice;
    const nisab = nisabSilver > 0 ? nisabSilver : nisabGold;

    const zakatDue = netWealth >= nisab ? netWealth * 0.025 : 0;
    const cur = Currency.get();

    const saved = {};
    ['zk-gold-price','zk-silver-price','zk-cash','zk-gold-val','zk-silver-val','zk-investments','zk-receivable','zk-stock','zk-debts','zk-expenses'].forEach(id=>{
      saved[id] = document.getElementById(id)?.value||'';
    });
    saved.goldPrice = goldPrice; saved.silverPrice = silverPrice;
    localStorage.setItem('vo_zakat_calc', JSON.stringify(saved));

    const res = document.getElementById('zk-result');
    if (!res) return;
    const eligible = netWealth >= nisab;
    res.innerHTML = `
      <div style="background:${eligible?'linear-gradient(135deg,rgba(0,150,136,.2),rgba(76,175,80,.1))':'linear-gradient(135deg,rgba(255,152,0,.15),rgba(255,193,7,.1))'};border:1px solid ${eligible?'rgba(76,175,80,.4)':'rgba(255,193,7,.4)'};border-radius:var(--r);padding:20px;margin-top:4px">
        <div style="font-size:12px;color:var(--text3);margin-bottom:16px;text-transform:uppercase;letter-spacing:.08em">Zakat Report</div>
        <div style="display:flex;flex-direction:column;gap:10px;font-size:13px">
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Total Assets</span><span style="font-weight:700">${Currency.format(totalAssets,cur.base)}</span></div>
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Total Liabilities</span><span style="font-weight:700;color:var(--danger)">-${Currency.format(totalDebts,cur.base)}</span></div>
          <div style="display:flex;justify-content:space-between;padding-top:10px;border-top:1px solid var(--border)"><span style="color:var(--text2)">Net Zakatable Wealth</span><span style="font-weight:800;font-size:15px">${Currency.format(netWealth,cur.base)}</span></div>
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Nisab Threshold (Silver)</span><span>${Currency.format(nisab,cur.base)}</span></div>
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Zakat Eligible?</span><span style="font-weight:700;color:${eligible?'#4caf50':'#ff9800'}">${eligible?'✅ Yes':'❌ Not yet'}</span></div>
          ${eligible?`<div style="display:flex;justify-content:space-between;padding-top:10px;border-top:1px solid var(--border)"><span style="font-size:15px;font-weight:800;color:#4caf50">Zakat Due (2.5%)</span><span style="font-size:22px;font-weight:900;color:#4caf50">${Currency.format(zakatDue,cur.base)}</span></div>`:''}
        </div>
      </div>`;
  }
};
window.Zakat = Zakat;
