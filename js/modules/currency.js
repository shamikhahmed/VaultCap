const Currency = {
  defaults: { PKR: 1, USD: 280, GBP: 355, AED: 76, EUR: 300 },

  get() {
    const raw = localStorage.getItem('vo_currency');
    if (raw) return JSON.parse(raw);
    const ctx = typeof getUserContext === 'function' ? getUserContext() : { baseCurrency: 'PKR' };
    const base = ctx.baseCurrency || 'PKR';
    return { base, rates: { USD: 280, GBP: 355, AED: 76, EUR: 300 } };
  },
  save(d) { localStorage.setItem('vo_currency', JSON.stringify(d)); },

  convert(amount, from, to) {
    const c = this.get();
    const rates = c.rates;
    if (from === c.base) {
      const inUSD = amount / (rates.USD || 280);
      if (to === 'USD') return inUSD;
      if (to === c.base) return amount;
      return inUSD * (rates[to] || 1);
    }
    return amount;
  },

  format(amount, currency) {
    const symbols = { PKR: '₨', USD: '$', GBP: '£', AED: 'AED ', EUR: '€' };
    const sym = symbols[currency] || currency + ' ';
    return sym + Number(amount).toLocaleString('en', { maximumFractionDigits: 0 });
  },

  render() {
    const body = document.getElementById('pg-currency-body');
    if (!body) return;
    const c = this.get();
    body.innerHTML = `
      <div style="padding:16px">
        <div style="background:var(--glass);border-radius:var(--r);padding:16px;margin-bottom:16px">
          <div style="font-size:12px;color:var(--text3);margin-bottom:8px;text-transform:uppercase;letter-spacing:.08em">Base Currency</div>
          <select id="cur-base" style="width:100%;background:var(--input);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);font-size:15px" onchange="Currency._baseChange(this.value)">
            ${['PKR','USD','GBP','AED','EUR'].map(c2=>`<option value="${c2}" ${c.base===c2?'selected':''}>${c2}</option>`).join('')}
          </select>
        </div>
        <div style="background:var(--glass);border-radius:var(--r);padding:16px;margin-bottom:16px">
          <div style="font-size:12px;color:var(--text3);margin-bottom:12px;text-transform:uppercase;letter-spacing:.08em">Exchange Rates vs ${c.base}</div>
          <div style="font-size:11px;color:var(--text3);margin-bottom:12px">Enter how many ${c.base} = 1 unit of each currency. AED and GBP auto-calculate from USD.</div>
          ${['USD','GBP','AED','EUR'].filter(x=>x!==c.base).map(cur=>`
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
              <div style="width:48px;font-size:13px;font-weight:700;color:var(--text)">${cur}</div>
              <input type="number" id="rate-${cur}" value="${c.rates[cur]||''}" placeholder="Rate" min="0" step="0.01"
                style="flex:1;background:var(--input);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);font-size:14px"
                oninput="Currency._rateInput('${cur}',this.value)">
              <div style="font-size:11px;color:var(--text3);width:80px">1 ${cur} = ${c.base}</div>
            </div>`).join('')}
        </div>
        <button class="btn btn-g" style="width:100%" onclick="Currency._save()">Save Rates</button>
        <div style="margin-top:24px">
          <div style="font-size:12px;color:var(--text3);margin-bottom:12px;text-transform:uppercase;letter-spacing:.08em">Net Worth Summary</div>
          ${this._netWorthSummary(c)}
        </div>
      </div>`;
  },

  _baseChange(base) {
    const c = this.get(); c.base = base; this.save(c); this.render();
  },

  _rateInput(cur, val) {
    if (cur === 'USD') {
      const usdRate = parseFloat(val) || 0;
      const aedEl = document.getElementById('rate-AED');
      const gbpEl = document.getElementById('rate-GBP');
      if (aedEl && !aedEl.dataset.manual) aedEl.value = (usdRate / 3.67).toFixed(1);
      if (gbpEl && !gbpEl.dataset.manual) gbpEl.value = (usdRate * 0.79).toFixed(1);
    }
    document.getElementById('rate-'+cur)?.setAttribute('data-manual','1');
  },

  _save() {
    const c = this.get();
    ['USD','GBP','AED','EUR'].forEach(cur => {
      const el = document.getElementById('rate-'+cur);
      if (el && el.value) c.rates[cur] = parseFloat(el.value);
    });
    this.save(c);
    Toast.show('Currency rates saved','success');
    this.render();
  },

  _netWorthSummary(c) {
    const total = (S.assets||[]).reduce((a,x)=>a+(x.value||0),0)
                + (S.cash||[]).reduce((a,x)=>a+(x.amount||0),0)
                + (S.investments||[]).reduce((a,x)=>a+(x.value||0),0);
    return `<div style="background:linear-gradient(135deg,rgba(123,95,255,.15),rgba(0,213,255,.1));border:1px solid rgba(123,95,255,.3);border-radius:var(--r);padding:16px;text-align:center">
      <div style="font-size:12px;color:var(--text3);margin-bottom:4px">Estimated Net Worth</div>
      <div style="font-size:28px;font-weight:900;color:var(--purple)">${this.format(total, c.base)}</div>
      <div style="font-size:11px;color:var(--text3);margin-top:4px">Based on current data in ${c.base}</div>
    </div>`;
  }
};
window.Currency = Currency;
