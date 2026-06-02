'use strict';
const Tax = {
  _country: 'PK',
  _filing: null,

  config: {
    GB: {
      name:'United Kingdom', currency:'GBP', symbol:'£',
      filings: {
        employed: {
          name:'Employed (PAYE)',
          year:'2024/25',
          note:'Standard PAYE employment. Personal allowance £12,570. Includes National Insurance Class 1.',
          slabs:[
            {label:'Personal Allowance',min:0,max:12570,rate:0},
            {label:'Basic Rate',min:12570,max:50270,rate:0.20},
            {label:'Higher Rate',min:50270,max:125140,rate:0.40},
            {label:'Additional Rate',min:125140,max:Infinity,rate:0.45}
          ],
          ni:[{min:0,max:12570,rate:0},{min:12570,max:50270,rate:0.08},{min:50270,max:Infinity,rate:0.02}],
          extras:[]
        },
        selfemployed: {
          name:'Self-Employed',
          year:'2024/25',
          note:'Self Assessment. Same income tax bands. NI Class 2 (£3.45/week if profit > £12,570) + Class 4.',
          slabs:[
            {label:'Personal Allowance',min:0,max:12570,rate:0},
            {label:'Basic Rate',min:12570,max:50270,rate:0.20},
            {label:'Higher Rate',min:50270,max:125140,rate:0.40},
            {label:'Additional Rate',min:125140,max:Infinity,rate:0.45}
          ],
          ni:[{min:0,max:12570,rate:0},{min:12570,max:50270,rate:0.09},{min:50270,max:Infinity,rate:0.02}],
          extras:[{label:'NI Class 2 (if profit > £12,570)',annual:179.40}]
        },
        landlord: {
          name:'Landlord (Rental Income)',
          year:'2024/25',
          note:'Rental income taxed as income. Mortgage interest relief capped at 20%. No NI on rental income.',
          slabs:[
            {label:'Personal Allowance',min:0,max:12570,rate:0},
            {label:'Basic Rate',min:12570,max:50270,rate:0.20},
            {label:'Higher Rate',min:50270,max:125140,rate:0.40},
            {label:'Additional Rate',min:125140,max:Infinity,rate:0.45}
          ],
          ni:[],
          extras:[]
        }
      }
    },
    PK: {
      name:'Pakistan', currency:'PKR', symbol:'PKR ',
      filings: {
        salaried: {
          name:'Salaried Individual',
          year:'2024-25',
          note:'FBR Finance Act 2024-25. Salaried persons get 25% rebate on tax payable vs non-salaried.',
          slabs:[
            {label:'Exempt',min:0,max:600000,rate:0},
            {label:'Slab 1',min:600000,max:1200000,rate:0.05},
            {label:'Slab 2',min:1200000,max:2200000,rate:0.15},
            {label:'Slab 3',min:2200000,max:3200000,rate:0.25},
            {label:'Slab 4',min:3200000,max:4100000,rate:0.30},
            {label:'Slab 5',min:4100000,max:Infinity,rate:0.35}
          ],
          ni:[],
          extras:[],
          rebate: 0.25
        },
        business: {
          name:'Business / AOP',
          year:'2024-25',
          note:'FBR non-salaried / AOP rates. No 25% rebate. Higher effective rate.',
          slabs:[
            {label:'Exempt',min:0,max:600000,rate:0},
            {label:'Slab 1',min:600000,max:1200000,rate:0.075},
            {label:'Slab 2',min:1200000,max:1600000,rate:0.15},
            {label:'Slab 3',min:1600000,max:3200000,rate:0.20},
            {label:'Slab 4',min:3200000,max:5600000,rate:0.25},
            {label:'Slab 5',min:5600000,max:Infinity,rate:0.35}
          ],
          ni:[],
          extras:[]
        },
        nonfiler: {
          name:'Non-Filer',
          year:'2024-25',
          note:'Non-filers face higher withholding tax rates. Filing is strongly recommended. Penalty applies.',
          slabs:[
            {label:'Exempt',min:0,max:600000,rate:0},
            {label:'Slab 1',min:600000,max:1200000,rate:0.075},
            {label:'Slab 2',min:1200000,max:2200000,rate:0.175},
            {label:'Slab 3',min:2200000,max:3200000,rate:0.275},
            {label:'Slab 4',min:3200000,max:Infinity,rate:0.40}
          ],
          ni:[],
          extras:[{label:'Non-filer surcharge / higher WHT applies on transactions',annual:0}]
        },
        freelancer: {
          name:'Freelancer / IT Export',
          year:'2024-25',
          note:'IT exports & freelancers: Fixed tax @ 0.25% of export proceeds (remitted through banking). Highly favorable rate.',
          slabs:[
            {label:'IT Export Fixed Rate',min:0,max:Infinity,rate:0.0025}
          ],
          ni:[],
          extras:[]
        }
      }
    },
    AE: {
      name:'UAE', currency:'AED', symbol:'AED ',
      filings: {
        individual: {
          name:'Individual',
          year:'2024',
          note:'UAE has zero personal income tax. Individuals pay no tax on salary, investments or capital gains.',
          slabs:[{label:'No Income Tax',min:0,max:Infinity,rate:0}],
          ni:[],
          extras:[]
        },
        corporate: {
          name:'Business (Corporate Tax)',
          year:'2024',
          note:'Corporate Tax at 9% on taxable profits above AED 375,000. Qualifying Free Zone Persons may be eligible for 0% rate.',
          slabs:[
            {label:'Exempt (below threshold)',min:0,max:375000,rate:0},
            {label:'Corporate Tax',min:375000,max:Infinity,rate:0.09}
          ],
          ni:[],
          extras:[]
        },
        vat: {
          name:'VAT Calculator',
          year:'2024',
          note:'UAE VAT rate is 5%. Businesses with annual turnover > AED 375,000 must register for VAT.',
          slabs:[{label:'VAT',min:0,max:Infinity,rate:0.05}],
          ni:[],
          extras:[],
          isVAT: true
        }
      }
    }
  },

  render() {
    const body = document.getElementById('pg-tax-body');
    if(!body) return;
    const saved = JSON.parse(localStorage.getItem('vo_tax_calc')||'{}');
    if(saved.country) this._country=saved.country;
    const cc = this._country;
    const cfg = this.config[cc];
    if(!this._filing || !cfg.filings[this._filing]) this._filing=Object.keys(cfg.filings)[0];
    const filing = cfg.filings[this._filing];

    body.innerHTML = `<div style="padding:16px">
      <div style="display:flex;gap:6px;margin-bottom:16px">
        ${['GB','PK','AE'].map(c=>`<button onclick="Tax._country='${c}';Tax._filing=null;Tax.render()" style="flex:1;padding:10px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;touch-action:manipulation;border:1px solid ${cc===c?'rgba(0,213,255,.6)':'var(--border)'};background:${cc===c?'rgba(0,213,255,.15)':'transparent'};color:${cc===c?'var(--info)':'var(--text3)'}">${c==='GB'?'🇬🇧 UK':c==='PK'?'🇵🇰 PK':'🇦🇪 UAE'}</button>`).join('')}
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">
        ${Object.entries(cfg.filings).map(([k,f])=>`<button onclick="Tax._filing='${k}';Tax.render()" style="flex-shrink:0;padding:8px 14px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation;white-space:nowrap;border:1px solid ${this._filing===k?'var(--purple)':'var(--border)'};background:${this._filing===k?'rgba(123,95,255,.2)':'transparent'};color:${this._filing===k?'var(--purple)':'var(--text3)'}">${f.name}</button>`).join('')}
      </div>
      <div style="background:var(--glass);border:1px solid var(--border);border-radius:12px;padding:12px;margin-bottom:16px;font-size:12px;color:var(--text3);line-height:1.7">
        📋 ${filing.note}<br>
        <span style="color:var(--info);font-weight:600">${filing.year} rates</span>
        <button onclick="Tax.openEditSlabs()" style="margin-left:10px;font-size:11px;color:var(--purple);background:none;border:none;cursor:pointer;touch-action:manipulation;font-weight:600">Edit rates ✏️</button>
      </div>
      ${filing.isVAT ? this._vatForm(saved) : this._incomeForm(saved, cfg.symbol)}
      <div style="margin-top:20px">
        <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">Tax Brackets</div>
        ${filing.slabs.map(s=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px"><span style="color:var(--text2)">${s.label}</span><span style="font-weight:700;color:${s.rate===0?'var(--success)':s.rate<=0.2?'var(--info)':s.rate<=0.3?'var(--warning)':'var(--danger)'}">${(s.rate*100).toFixed(2).replace(/\.?0+$/,'')}%</span></div>`).join('')}
      </div>
    </div>`;
  },

  _incomeForm(saved, symbol) {
    return `<div style="margin-bottom:16px">
      <label style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;display:block;margin-bottom:8px">Annual Income (${symbol.trim()})</label>
      <input id="tax-income" type="number" value="${saved.income||''}" placeholder="Enter annual income" min="0"
        style="width:100%;background:var(--input);border:1px solid var(--border);border-radius:10px;padding:14px;color:var(--text);font-size:16px">
    </div>
    <button onclick="Tax.calculate()" style="width:100%;padding:14px;border-radius:12px;background:linear-gradient(135deg,var(--purple),var(--info));border:none;color:#fff;font-size:15px;font-weight:800;cursor:pointer;touch-action:manipulation">Calculate Tax</button>
    <div id="tax-result" style="margin-top:14px"></div>`;
  },

  _vatForm(saved) {
    return `<div style="margin-bottom:16px">
      <label style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;display:block;margin-bottom:8px">Amount (AED) — exclusive of VAT</label>
      <input id="tax-income" type="number" value="${saved.income||''}" placeholder="Enter amount" min="0"
        style="width:100%;background:var(--input);border:1px solid var(--border);border-radius:10px;padding:14px;color:var(--text);font-size:16px">
    </div>
    <button onclick="Tax.calculateVAT()" style="width:100%;padding:14px;border-radius:12px;background:linear-gradient(135deg,var(--purple),var(--info));border:none;color:#fff;font-size:15px;font-weight:800;cursor:pointer;touch-action:manipulation">Calculate VAT</button>
    <div id="tax-result" style="margin-top:14px"></div>`;
  },

  calculate() {
    const cc = this._country;
    const cfg = this.config[cc];
    const filing = cfg.filings[this._filing];
    const income = parseFloat(document.getElementById('tax-income')?.value||0);
    if(!income){ if(window.Toast) Toast.show('Enter income','error'); return; }

    let tax = 0;
    const breakdown = [];
    filing.slabs.forEach(slab=>{
      const from = slab.min;
      const to = slab.max===Infinity ? income : Math.min(slab.max, income);
      if(to<=from) return;
      const taxable = to - from;
      const slabTax = taxable * slab.rate;
      if(income > from) breakdown.push({label:slab.label,rate:slab.rate,taxable:Math.min(income,to)-from,tax:Math.max(0,slabTax)});
      tax += Math.max(0,slabTax);
    });

    if(this._filing==='salaried' && filing.rebate) tax = tax * (1 - filing.rebate);

    let ni = 0;
    filing.ni.forEach(band=>{
      const niIncome = Math.min(income, band.max) - band.min;
      if(niIncome>0) ni += niIncome * band.rate;
    });

    let extras = 0;
    (filing.extras||[]).forEach(e=>extras+=e.annual||0);

    const total = tax + ni + extras;
    const takeHome = income - total;
    const effectiveRate = income>0?((total/income)*100).toFixed(1):0;
    const sym = cfg.symbol;
    const fmt = n => sym + Math.round(n).toLocaleString();

    const saved = {country:cc,filing:this._filing,income};
    localStorage.setItem('vo_tax_calc',JSON.stringify(saved));

    const res = document.getElementById('tax-result');
    if(!res) return;
    res.innerHTML = `<div id="tax-report" style="background:linear-gradient(135deg,rgba(0,213,255,.08),rgba(123,95,255,.08));border:1px solid rgba(0,213,255,.3);border-radius:16px;padding:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div style="font-size:14px;font-weight:800;color:var(--text)">🧾 Tax Report — ${filing.name}</div>
        <button onclick="Tax.printReport()" style="font-size:12px;color:var(--info);background:rgba(0,213,255,.1);border:1px solid rgba(0,213,255,.3);border-radius:8px;padding:6px 12px;cursor:pointer;touch-action:manipulation">🖨️ Print</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;font-size:13px">
        <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Gross Income</span><span style="font-weight:700">${fmt(income)}</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Income Tax</span><span style="font-weight:700;color:var(--danger)">− ${fmt(tax)}</span></div>
        ${ni>0?`<div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">National Insurance</span><span style="font-weight:700;color:var(--warning)">− ${fmt(ni)}</span></div>`:''}
        ${extras>0?`<div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Other charges</span><span style="font-weight:700;color:var(--warning)">− ${fmt(extras)}</span></div>`:''}
        <div style="height:1px;background:var(--border);margin:4px 0"></div>
        <div style="display:flex;justify-content:space-between;padding:12px;background:rgba(0,255,136,.1);border-radius:10px">
          <span style="font-size:15px;font-weight:800">Take-Home Pay</span>
          <span style="font-size:22px;font-weight:900;color:var(--success)">${fmt(takeHome)}</span>
        </div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Effective Rate</span><span style="font-weight:700;color:var(--info)">${effectiveRate}%</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Monthly Take-Home</span><span style="font-weight:700">${fmt(takeHome/12)}</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Weekly Take-Home</span><span style="font-weight:700">${fmt(takeHome/52)}</span></div>
      </div>
      ${breakdown.filter(b=>b.tax>0).length?`<div style="margin-top:14px;border-top:1px solid var(--border);padding-top:12px">
        <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">Band Breakdown</div>
        ${breakdown.filter(b=>b.tax>0).map(b=>`<div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;color:var(--text3)"><span>${b.label} (${(b.rate*100).toFixed(0)}%)</span><span>${fmt(b.tax)}</span></div>`).join('')}
      </div>`:''}
    </div>`;
  },

  calculateVAT() {
    const amount = parseFloat(document.getElementById('tax-income')?.value||0);
    if(!amount){ if(window.Toast) Toast.show('Enter amount','error'); return; }
    const vat = amount * 0.05;
    const total = amount + vat;
    const res = document.getElementById('tax-result');
    if(!res) return;
    res.innerHTML = `<div id="tax-report" style="background:var(--glass);border:1px solid var(--border);border-radius:16px;padding:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div style="font-size:14px;font-weight:800">🧾 VAT Report (5%)</div>
        <button onclick="Tax.printReport()" style="font-size:12px;color:var(--info);background:rgba(0,213,255,.1);border:1px solid rgba(0,213,255,.3);border-radius:8px;padding:6px 12px;cursor:pointer;touch-action:manipulation">🖨️ Print</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;font-size:14px">
        <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Net Amount</span><span>AED ${amount.toLocaleString()}</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">VAT (5%)</span><span style="color:var(--warning)">AED ${vat.toLocaleString()}</span></div>
        <div style="display:flex;justify-content:space-between;padding:12px;background:rgba(0,213,255,.1);border-radius:10px"><span style="font-weight:800">Total (VAT inclusive)</span><span style="font-size:20px;font-weight:900;color:var(--info)">AED ${total.toLocaleString()}</span></div>
      </div>
    </div>`;
  },

  printReport() {
    const report = document.getElementById('tax-report');
    if(!report) return;
    const cfg = this.config[this._country];
    const filing = cfg?.filings[this._filing];
    const w = window.open('','_blank');
    w.document.write(`<html><head><title>Tax Report</title><style>body{font-family:Arial,sans-serif;padding:30px;max-width:600px;margin:0 auto;color:#222}h1{color:#1a237e}.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;font-size:14px}.total{background:#e8f5e9;padding:14px;border-radius:8px;font-size:18px;font-weight:900;color:#2e7d32;display:flex;justify-content:space-between;margin:12px 0}.meta{background:#f5f5f5;padding:12px;border-radius:8px;font-size:12px;color:#666;margin-bottom:20px}</style></head><body>
      <h1>🧾 Tax Report</h1>
      <div class="meta">Country: ${cfg?.name||''} &nbsp;|&nbsp; Filing: ${filing?.name||''} &nbsp;|&nbsp; Year: ${filing?.year||''}<br>Generated: ${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</div>
      ${report.innerText.split('\n').filter(l=>l.trim()).map(l=>`<div class="row">${l}</div>`).join('')}
      <p style="margin-top:30px;font-size:11px;color:#999">Generated by VaultOS. For guidance only — consult a qualified tax professional for advice.</p>
      </body></html>`);
    w.document.close();
    w.print();
  },

  openEditSlabs() {
    const filing = this.config[this._country]?.filings[this._filing];
    if(!filing) return;
    Modal.open('✏️ Edit Tax Rates',
      `<div style="font-size:12px;color:var(--text3);margin-bottom:12px">Update if rates have changed. Enter as percentage (e.g. 20 for 20%).</div>
      ${filing.slabs.map((s,i)=>`<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <div style="flex:1;font-size:13px;color:var(--text)">${s.label}</div>
        <input id="slb-${i}" type="number" value="${(s.rate*100).toFixed(2)}" min="0" max="100" step="0.01"
          style="width:80px;background:var(--input);border:1px solid var(--border);border-radius:8px;padding:8px;color:var(--text);text-align:right;font-size:16px">
        <span style="color:var(--text3)">%</span>
      </div>`).join('')}`,
      `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Tax._saveSlabs()">Save</button>`);
  },

  _saveSlabs() {
    const filing = this.config[this._country]?.filings[this._filing];
    if(!filing) return;
    filing.slabs.forEach((s,i)=>{
      const el=document.getElementById('slb-'+i);
      if(el) s.rate=parseFloat(el.value||0)/100;
    });
    Modal.close();
    if(window.Toast) Toast.show('Rates updated','success');
    this.render();
  }
};
window.Tax = Tax;
