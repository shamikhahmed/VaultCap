const Tax = {
  countries: {
    GB: {
      name: 'United Kingdom',
      year: '2024/25',
      currency: 'GBP',
      slabs: [
        { min: 0, max: 12570, rate: 0, label: 'Personal Allowance' },
        { min: 12570, max: 50270, rate: 0.20, label: 'Basic Rate' },
        { min: 50270, max: 125140, rate: 0.40, label: 'Higher Rate' },
        { min: 125140, max: Infinity, rate: 0.45, label: 'Additional Rate' }
      ],
      ni: [
        { min: 0, max: 12570, rate: 0 },
        { min: 12570, max: 50270, rate: 0.08 },
        { min: 50270, max: Infinity, rate: 0.02 }
      ],
      note: 'Based on HMRC 2024/25 rates. Includes National Insurance Class 1.'
    },
    PK: {
      name: 'Pakistan',
      year: '2024-25',
      currency: 'PKR',
      slabs: [
        { min: 0, max: 600000, rate: 0, label: 'Exempt' },
        { min: 600000, max: 1200000, rate: 0.05, label: '5% Slab' },
        { min: 1200000, max: 2200000, rate: 0.15, label: '15% Slab' },
        { min: 2200000, max: 3200000, rate: 0.25, label: '25% Slab' },
        { min: 3200000, max: 4100000, rate: 0.30, label: '30% Slab' },
        { min: 4100000, max: Infinity, rate: 0.35, label: '35% Slab' }
      ],
      ni: [],
      note: 'Based on FBR Finance Act 2024-25 for salaried individuals.'
    },
    AE: {
      name: 'UAE',
      year: '2024',
      currency: 'AED',
      slabs: [{ min: 0, max: Infinity, rate: 0, label: 'No Income Tax' }],
      ni: [],
      note: 'UAE has no personal income tax. Corporate tax 9% on profits above AED 375,000 (not calculated here).'
    }
  },

  render() {
    const body = document.getElementById('pg-tax-body');
    if (!body) return;
    const saved = JSON.parse(localStorage.getItem('vo_tax_calc') || '{"country":"GB"}');
    const c = saved.country || 'GB';
    const country = this.countries[c];
    body.innerHTML = `
      <div style="padding:16px">
        <div style="display:flex;gap:8px;margin-bottom:16px">
          ${Object.keys(this.countries).map(k => `<button onclick="Tax._setCountry('${k}')" style="flex:1;padding:10px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:1px solid ${c===k?'var(--info)':'var(--border)'};background:${c===k?'rgba(0,213,255,.15)':'transparent'};color:${c===k?'var(--info)':'var(--text3)'}">${k==='GB'?'🇬🇧':k==='PK'?'🇵🇰':'🇦🇪'} ${this.countries[k].name}</button>`).join('')}
        </div>
        <div style="background:var(--glass);border-radius:var(--r);padding:12px 14px;margin-bottom:16px;font-size:12px;color:var(--text3);line-height:1.6">
          📋 ${country.note}<br><span style="color:var(--info);font-weight:600">${country.year} rates</span>
          <button onclick="Tax.openEditSlabs('${c}')" style="margin-left:8px;font-size:11px;color:var(--purple,#7b5fff);background:none;border:none;cursor:pointer">Edit rates ✏️</button>
        </div>
        <div style="margin-bottom:20px">
          <label style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;display:block;margin-bottom:8px">Annual Income (${country.currency})</label>
          <input id="tax-income" type="number" value="${saved.income||''}" placeholder="Enter your annual income" min="0"
            style="width:100%;background:var(--input,var(--bg2));border:1px solid var(--border);border-radius:8px;padding:12px;color:var(--text);font-size:16px;box-sizing:border-box">
        </div>
        <button class="btn btn-g" style="width:100%;margin-bottom:12px" onclick="Tax.calculate('${c}')">Calculate Tax</button>
        <div id="tax-result"></div>
        <div style="margin-top:20px">
          <div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">Tax Brackets</div>
          ${country.slabs.map(s => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px">
            <span style="color:var(--text2)">${s.label}</span>
            <span style="font-weight:700;color:${s.rate===0?'var(--ok)':s.rate<=0.2?'var(--info)':s.rate<=0.3?'var(--warn)':'var(--err)'}">${(s.rate*100).toFixed(0)}%</span>
          </div>`).join('')}
        </div>
      </div>`;
  },

  calculate(countryCode) {
    const country = this.countries[countryCode];
    const income = parseFloat(document.getElementById('tax-income')?.value || 0);
    if (!income) { Toast.show('Enter your income', 'error'); return; }

    let totalTax = 0;
    const breakdown = [];

    country.slabs.forEach(slab => {
      const slabIncome = Math.min(income, slab.max) - slab.min;
      if (slabIncome <= 0) return;
      const tax = slabIncome * slab.rate;
      breakdown.push({ label: slab.label, rate: slab.rate, income: slabIncome, tax });
      totalTax += tax;
    });

    let niTotal = 0;
    if (countryCode === 'GB') {
      country.ni.forEach(band => {
        const niIncome = Math.min(income, band.max) - band.min;
        if (niIncome > 0) niTotal += niIncome * band.rate;
      });
    }

    const takeHome = income - totalTax - niTotal;
    const effectiveRate = income > 0 ? ((totalTax / income) * 100).toFixed(1) : 0;
    const cur = country.currency;
    const fmt = n => cur + ' ' + Math.round(n).toLocaleString();

    const saved = JSON.parse(localStorage.getItem('vo_tax_calc') || '{}');
    saved.country = countryCode; saved.income = income;
    localStorage.setItem('vo_tax_calc', JSON.stringify(saved));

    const res = document.getElementById('tax-result');
    if (!res) return;
    res.innerHTML = `
      <div style="background:linear-gradient(135deg,rgba(0,213,255,.1),rgba(123,95,255,.1));border:1px solid rgba(0,213,255,.3);border-radius:var(--r);padding:20px">
        <div style="font-size:12px;color:var(--text3);margin-bottom:16px;text-transform:uppercase;letter-spacing:.08em">Tax Report — ${country.year}</div>
        <div style="display:flex;flex-direction:column;gap:10px;font-size:13px">
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Gross Income</span><span style="font-weight:700">${fmt(income)}</span></div>
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Income Tax</span><span style="font-weight:700;color:var(--err)">-${fmt(totalTax)}</span></div>
          ${countryCode==='GB'?`<div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">National Insurance</span><span style="font-weight:700;color:var(--warn)">-${fmt(niTotal)}</span></div>`:''}
          <div style="display:flex;justify-content:space-between;padding-top:10px;border-top:1px solid var(--border)"><span style="font-size:15px;font-weight:800">Take-Home Pay</span><span style="font-size:20px;font-weight:900;color:var(--ok)">${fmt(takeHome)}</span></div>
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Effective Tax Rate</span><span style="font-weight:700;color:var(--info)">${effectiveRate}%</span></div>
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Monthly Take-Home</span><span style="font-weight:700">${fmt(takeHome/12)}</span></div>
        </div>
        <div style="margin-top:16px;font-size:11px;color:var(--text3)">Breakdown by band:</div>
        ${breakdown.filter(b => b.tax > 0).map(b => `<div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;color:var(--text3)"><span>${b.label} (${(b.rate*100).toFixed(0)}%)</span><span>${fmt(b.tax)}</span></div>`).join('')}
      </div>`;
  },

  _setCountry(c) {
    const saved = JSON.parse(localStorage.getItem('vo_tax_calc') || '{}');
    saved.country = c;
    localStorage.setItem('vo_tax_calc', JSON.stringify(saved));
    this.render();
  },

  openEditSlabs(c) {
    const country = this.countries[c];
    Modal.open('✏️ Edit Tax Rates — ' + country.name,
      `<div style="font-size:13px;color:var(--text2);margin-bottom:12px">Update tax percentages if rates have changed. Enter as percentage (e.g. 20 for 20%).</div>
      ${country.slabs.map((s, i) => `<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <div style="flex:1;font-size:13px;color:var(--text)">${s.label}</div>
        <input id="slab-${i}" type="number" value="${(s.rate*100).toFixed(0)}" min="0" max="100" style="width:70px;background:var(--input,var(--bg2));border:1px solid var(--border);border-radius:8px;padding:8px;color:var(--text);text-align:right">
        <span style="font-size:13px;color:var(--text3)">%</span>
      </div>`).join('')}`,
      `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Tax._saveSlabs('${c}')">Save</button>`);
  },

  _saveSlabs(c) {
    const country = this.countries[c];
    country.slabs.forEach((s, i) => {
      const el = document.getElementById('slab-' + i);
      if (el) s.rate = parseFloat(el.value || 0) / 100;
    });
    Modal.close();
    Toast.show('Tax rates updated', 'success');
    this.render();
  }
};
window.Tax = Tax;
