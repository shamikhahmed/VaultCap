'use strict';
const Tax = {
  _country: 'PK',
  _filing: null,
  _taxYear: '2024-25',

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
        },
        cgt: {
          name:'Capital Gains Tax',
          year:'2024/25',
          note:'CGT applies to profits from selling assets above the £3,000 annual exempt amount. Rates changed October 30, 2024.',
          isCGT: true,
          annualExempt: 3000,
          rates: { basic:{ property:0.18, other:0.18 }, higher:{ property:0.24, other:0.24 } }
        },
        dividend: {
          name:'Dividend Tax',
          year:'2024/25',
          note:'Tax on dividends received above the £500 annual dividend allowance.',
          isDividend: true,
          allowance: 500,
          rates: { basic:0.0875, higher:0.3375, additional:0.3935 }
        },
        iht: {
          name:'Inheritance Tax',
          year:'2024/25',
          note:'IHT applies to estates above the nil-rate band. Married couples can combine allowances up to £1,000,000 with residence nil-rate band.',
          isIHT: true,
          nilRateBand: 325000,
          residenceNilRate: 175000,
          rate: 0.40
        },
        stampduty: {
          name:'Stamp Duty (SDLT)',
          year:'2025 (from April 2025)',
          note:'SDLT on residential property in England & Northern Ireland. Scotland uses LBTT, Wales uses LTT — different rates apply.',
          isSDLT: true,
          slabs:[
            {min:0,max:250000,rate:0},
            {min:250000,max:925000,rate:0.05},
            {min:925000,max:1500000,rate:0.10},
            {min:1500000,max:Infinity,rate:0.12}
          ],
          firstTimeBuyerSlabs:[
            {min:0,max:300000,rate:0},
            {min:300000,max:500000,rate:0.05}
          ],
          additionalPropertySurcharge: 0.03
        },
        vat: {
          name:'VAT Calculator',
          year:'2024/25',
          note:'UK VAT registration threshold: £90,000 annual turnover. Mandatory registration required above this.',
          isVAT: true,
          isGbVAT: true,
          rates: { standard:0.20, reduced:0.05, zero:0 }
        }
      }
    },
    PK: {
      name:'Pakistan', currency:'PKR', symbol:'PKR ',
      surchargeNote:'Additional 10% surcharge on taxable income exceeding Rs.10 million for salaried individuals and AOPs (Finance Act 2024).',
      filings: {
        salaried: {
          name:'Salaried Individual',
          year:'2024-25 / 2025-26',
          note:'Salary constitutes >75% of total income. Select tax year below.',
          taxYears: {
            '2024-25': {
              slabs:[
                {label:'Exempt',min:0,max:600000,rate:0},
                {label:'Slab 1',min:600000,max:1200000,rate:0.05},
                {label:'Slab 2',min:1200000,max:2200000,rate:0.15},
                {label:'Slab 3',min:2200000,max:3200000,rate:0.25},
                {label:'Slab 4',min:3200000,max:4100000,rate:0.30},
                {label:'Slab 5',min:4100000,max:Infinity,rate:0.35}
              ]
            },
            '2025-26': {
              slabs:[
                {label:'Exempt',min:0,max:600000,rate:0},
                {label:'Slab 1',min:600000,max:1200000,rate:0.01},
                {label:'Slab 2',min:1200000,max:2200000,rate:0.11},
                {label:'Slab 3',min:2200000,max:3200000,rate:0.23},
                {label:'Slab 4',min:3200000,max:4100000,rate:0.30},
                {label:'Slab 5',min:4100000,max:Infinity,rate:0.35}
              ]
            }
          },
          ni:[], extras:[]
        },
        business: {
          name:'Business / AOP (Non-Salaried)',
          year:'2024-25',
          note:'Non-salaried individuals and Association of Persons. Higher rates than salaried. Top rate 45% for AOPs above Rs.10m.',
          slabs:[
            {label:'Exempt',min:0,max:600000,rate:0},
            {label:'Slab 1',min:600000,max:1200000,rate:0.15},
            {label:'Slab 2',min:1200000,max:2400000,rate:0.20},
            {label:'Slab 3',min:2400000,max:3600000,rate:0.25},
            {label:'Slab 4',min:3600000,max:6000000,rate:0.30},
            {label:'Slab 5',min:6000000,max:Infinity,rate:0.35}
          ],
          ni:[], extras:[]
        },
        nonfiler: {
          name:'Non-Filer',
          year:'2024-25',
          note:'Warning: Non-filers pay significantly higher rates. File your return to reduce your tax burden. Subject to additional withholding taxes on banking, property, and vehicle transactions.',
          slabs:[
            {label:'Exempt',min:0,max:600000,rate:0},
            {label:'Slab 1',min:600000,max:1200000,rate:0.075},
            {label:'Slab 2',min:1200000,max:2200000,rate:0.225},
            {label:'Slab 3',min:2200000,max:3200000,rate:0.295},
            {label:'Slab 4',min:3200000,max:4100000,rate:0.325},
            {label:'Slab 5',min:4100000,max:Infinity,rate:0.375}
          ],
          ni:[], extras:[]
        },
        freelancer: {
          name:'Freelancer / IT Export',
          year:'2024-25',
          note:'0.25% final tax on foreign remittances received through banking channels. Warning: Only applies to income remitted via proper banking channels (SWIFT, Raast, bank transfers). Cash or informal transfers do not qualify. Must register as IT exporter with PSEB/STZA for exemption.',
          isFlat: true,
          flatRate: 0.0025,
          ni:[], extras:[]
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
          ni:[], extras:[]
        },
        corporate: {
          name:'Business (Corporate Tax)',
          year:'2024',
          note:'Corporate Tax at 9% on taxable profits above AED 375,000. Qualifying Free Zone Persons may be eligible for 0% rate.',
          slabs:[
            {label:'Exempt (below threshold)',min:0,max:375000,rate:0},
            {label:'Corporate Tax',min:375000,max:Infinity,rate:0.09}
          ],
          ni:[], extras:[]
        },
        vat: {
          name:'VAT Calculator',
          year:'2024',
          note:'UAE VAT rate is 5%. Businesses with annual turnover > AED 375,000 must register for VAT.',
          slabs:[{label:'VAT',min:0,max:Infinity,rate:0.05}],
          ni:[], extras:[],
          isVAT: true
        },
        excise: {
          name:'Excise Tax',
          year:'2024',
          note:'Excise duty on specific goods. Added at import or production stage.',
          isExcise: true,
          rates:[
            {label:'Tobacco products', rate:1.00},
            {label:'Energy drinks', rate:1.00},
            {label:'Carbonated drinks', rate:0.50},
            {label:'Electronic cigarettes / vaping', rate:1.00},
            {label:'Sweetened beverages', rate:0.50}
          ]
        },
        freezone: {
          name:'Free Zone Corporate Tax',
          year:'2024',
          note:'0% corporate tax on Qualifying Income for Qualifying Free Zone Persons (QFZPs). Non-qualifying income taxed at 9%. Must meet FTA substance requirements. Seek professional advice for QFZP status confirmation.',
          isFreezone: true
        }
      }
    }
  },

  _getActiveSlabs(filing) {
    const key = this._slabsKey();
    const custom = typeof VaultMeta !== 'undefined' ? VaultMeta.get(key) : null;
    if (custom && custom.length) return custom;
    if (filing.taxYears) return (filing.taxYears[this._taxYear] || filing.taxYears['2024-25'] || {}).slabs || [];
    return filing.slabs || [];
  },

  _slabsKey() {
    return `taxSlabs_${this._country}_${this._filing}_${this._taxYear || ''}`;
  },

  _setTaxYear(year) {
    this._taxYear = year;
    this.render();
  },

  render() {
    const body = document.getElementById('pg-tax-body');
    if(!body) return;
    if (!this._countryInit && S.user?.country) {
      this._countryInit = true;
      if (S.user.country === 'GB') this._country = 'GB';
      else if (S.user.country === 'AE') this._country = 'AE';
      else if (S.user.country === 'PK') this._country = 'PK';
    }
    const saved = typeof VaultMeta !== 'undefined' ? VaultMeta.get('taxCalc') : {};
    if(saved.country) this._country = saved.country;
    if(saved.taxYear) this._taxYear = saved.taxYear;
    const cc = this._country;
    const cfg = this.config[cc];
    if(!this._filing || !cfg.filings[this._filing]) this._filing = Object.keys(cfg.filings)[0];
    const filing = cfg.filings[this._filing];
    const slabs = this._getActiveSlabs(filing);
    const surcharge = cc === 'PK' ? cfg.surchargeNote : '';

    const formHtml = (() => {
      if (filing.isExcise)  return this._exciseForm(saved);
      if (filing.isFreezone) return this._freezoneForm();
      if (filing.isCGT)     return this._cgtForm(saved);
      if (filing.isDividend) return this._dividendForm(saved);
      if (filing.isIHT)     return this._ihtForm(saved);
      if (filing.isSDLT)    return this._sdltForm(saved);
      if (filing.isGbVAT)   return this._gbVatForm(saved);
      if (filing.isVAT)     return this._vatForm(saved);
      return this._incomeForm(saved, cfg.symbol, filing);
    })();

    const showBrackets = slabs.length > 0 && !filing.isCGT && !filing.isDividend && !filing.isIHT && !filing.isExcise && !filing.isFreezone;

    body.innerHTML = `<div class="vc-ix-209">
      <div style="display:flex;gap:6px;margin-bottom:16px">
        ${['GB','PK','AE'].map(c=>`<button type="button" data-act="Tax._country='${c}';Tax._filing=null;Tax.render()" style="flex:1;padding:10px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;touch-action:manipulation;border:1px solid ${cc===c?'rgba(0,213,255,.6)':'var(--border)'};background:${cc===c?'rgba(0,213,255,.15)':'transparent'};color:${cc===c?'var(--info)':'var(--text3)'}">${c==='GB'?'🇬🇧 UK':c==='PK'?'🇵🇰 PK':'🇦🇪 UAE'}</button>`).join('')}
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">
        ${Object.entries(cfg.filings).map(([k,f])=>`<button type="button" data-act="Tax._filing='${k}';Tax.render()" style="flex-shrink:0;padding:8px 14px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation;white-space:nowrap;border:1px solid ${this._filing===k?'var(--accent)':'var(--border)'};background:${this._filing===k?'rgba(0,213,255,.2)':'transparent'};color:${this._filing===k?'var(--accent)':'var(--text3)'}">${f.name}</button>`).join('')}
      </div>
      <div style="background:var(--glass);border:1px solid var(--border);border-radius:12px;padding:12px;margin-bottom:16px;font-size:12px;color:var(--text3);line-height:1.7">
        ${filing.note}<br>
        <span style="color:var(--info);font-weight:600">${filing.year} rates</span>
        ${slabs.length ? `<button type="button" data-act="Tax.openEditSlabs()" style="margin-left:10px;font-size:11px;color:var(--accent);background:none;border:none;cursor:pointer;touch-action:manipulation;font-weight:600">Edit slabs</button>` : ''}
        ${surcharge ? `<div style="margin-top:6px;color:var(--warning);font-size:11px">Warning: ${surcharge}</div>` : ''}
      </div>
      ${formHtml}
      ${showBrackets ? `<div style="margin-top:20px">
        <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">Tax Brackets</div>
        ${slabs.map(s=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px"><span class="vc-ix-1">${s.label}</span><span style="font-weight:700;color:${s.rate===0?'var(--success)':s.rate<=0.2?'var(--info)':s.rate<=0.3?'var(--warning)':'var(--danger)'}">${(s.rate*100).toFixed(2).replace(/\.?0+$/,'')}%</span></div>`).join('')}
      </div>` : ''}
    </div>`;
    setTimeout(function() {
      const cur = (S.user && S.user.currency) || 'PKR';
      ['tax-income','iht-estate','iht-home','sdlt-price'].forEach(function(id) {
        const el = document.getElementById(id);
        if (el) U.numInput(el, cur);
      });
    }, 80);
  },

  _incomeForm(saved, symbol, filing) {
    const isSalariedPK = this._country === 'PK' && this._filing === 'salaried';
    const ty = this._taxYear;
    const yearToggle = isSalariedPK ? `<div class="vc-ix-60">
      <button type="button" data-act="Tax._setTaxYear('2024-25')" style="flex:1;padding:8px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;touch-action:manipulation;border:1px solid ${ty==='2024-25'?'rgba(0,213,255,.6)':'var(--border)'};background:${ty==='2024-25'?'rgba(0,213,255,.2)':'transparent'};color:${ty==='2024-25'?'var(--info)':'var(--text3)'}">2024-25</button>
      <button type="button" data-act="Tax._setTaxYear('2025-26')" style="flex:1;padding:8px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;touch-action:manipulation;border:1px solid ${ty==='2025-26'?'rgba(0,213,255,.6)':'var(--border)'};background:${ty==='2025-26'?'rgba(0,213,255,.2)':'transparent'};color:${ty==='2025-26'?'var(--info)':'var(--text3)'}">2025-26</button>
    </div>` : '';
    const isFlat = filing && filing.isFlat;
    return `${yearToggle}<div class="vc-ix-43">
      <label class="vc-ix-11">${isFlat?'IT Export Proceeds / Remittances':'Annual Income'} (${(symbol||'').trim()})</label>
      <input class="vc-ix-44" id="tax-income" type="text" inputmode="decimal" value="${escAttr(saved.income||'')}" placeholder="Enter amount"
       >
    </div>
    <button class="vc-ix-29" type="button" data-act="Tax.calculate()">Calculate Tax</button>
    <div class="vc-ix-19" id="tax-result"></div>`;
  },

  _vatForm(saved) {
    return `<div class="vc-ix-43">
      <label class="vc-ix-11">Amount (AED) — exclusive of VAT</label>
      <input class="vc-ix-44" id="tax-income" type="text" inputmode="decimal" value="${escAttr(saved.income||'')}" placeholder="Enter amount"
       >
    </div>
    <button class="vc-ix-29" type="button" data-act="Tax.calculateVAT()">Calculate VAT (5%)</button>
    <div class="vc-ix-19" id="tax-result"></div>`;
  },

  _gbVatForm(saved) {
    const rate = saved.gbVatRate || 'standard';
    return `<div class="vc-ix-9">
      <label class="vc-ix-11">VAT Rate</label>
      <div class="vc-ix-60">
        ${[['standard','Standard (20%)'],['reduced','Reduced (5%)'],['zero','Zero (0%)']].map(([v,l])=>`<button type="button" data-act="ActHelpers.taxVat('${v}',this)" class="gbvat-btn" style="flex:1;padding:8px;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;touch-action:manipulation;border:1px solid var(--border);background:${rate===v?'rgba(0,213,255,.2)':'transparent'};color:var(--text3)">${l}</button>`).join('')}
      </div>
      <input type="hidden" id="gbvat-rate" value="${escAttr(rate)}">
    </div>
    <div class="vc-ix-43">
      <label class="vc-ix-11">Net Amount (£) — exclusive of VAT</label>
      <input class="vc-ix-44" id="tax-income" type="text" inputmode="decimal" value="${escAttr(saved.income||'')}" placeholder="Enter amount"
       >
    </div>
    <button class="vc-ix-29" type="button" data-act="Tax.calculateGbVAT()">Calculate VAT</button>
    <div class="vc-ix-19" id="tax-result"></div>`;
  },

  _cgtForm(saved) {
    const b = saved.cgtBand||'basic', t = saved.cgtType||'other';
    return `<div class="vc-ix-9">
      <label class="vc-ix-11">Income Tax Band</label>
      <div class="vc-ix-60">
        <button type="button" data-act="ActHelpers.taxChip('cgt-band','cgt-band','basic','rgba(0,213,255,.2)',this)" class="cgt-band" style="flex:1;padding:8px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation;border:1px solid var(--border);background:${b==='basic'?'rgba(0,213,255,.2)':'transparent'};color:var(--text3)">Basic Rate</button>
        <button type="button" data-act="ActHelpers.taxChip('cgt-band','cgt-band','higher','rgba(0,213,255,.2)',this)" class="cgt-band" style="flex:1;padding:8px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation;border:1px solid var(--border);background:${b==='higher'?'rgba(0,213,255,.2)':'transparent'};color:var(--text3)">Higher / Additional</button>
      </div>
      <input type="hidden" id="cgt-band" value="${escAttr(b)}">
    </div>
    <div class="vc-ix-9">
      <label class="vc-ix-11">Asset Type</label>
      <div class="vc-ix-60">
        <button type="button" data-act="ActHelpers.taxChip('cgt-type','cgt-type','property','rgba(0,213,255,.2)',this)" class="cgt-type" style="flex:1;padding:8px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation;border:1px solid var(--border);background:${t==='property'?'rgba(0,213,255,.2)':'transparent'};color:var(--text3)">Property</button>
        <button type="button" data-act="ActHelpers.taxChip('cgt-type','cgt-type','other','rgba(0,213,255,.2)',this)" class="cgt-type" style="flex:1;padding:8px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation;border:1px solid var(--border);background:${t==='other'?'rgba(0,213,255,.2)':'transparent'};color:var(--text3)">Other Assets</button>
      </div>
      <input type="hidden" id="cgt-type" value="${escAttr(t)}">
    </div>
    <div class="vc-ix-43">
      <label class="vc-ix-11">Total Capital Gain (£)</label>
      <input class="vc-ix-44" id="tax-income" type="text" inputmode="decimal" value="${escAttr(saved.income||'')}" placeholder="Enter total gain"
       >
    </div>
    <button class="vc-ix-29" type="button" data-act="Tax.calculateCGT()">Calculate CGT</button>
    <div class="vc-ix-19" id="tax-result"></div>`;
  },

  _dividendForm(saved) {
    const dv = saved.divBand||'basic';
    return `<div class="vc-ix-9">
      <label class="vc-ix-11">Income Tax Band</label>
      <div class="vc-ix-60">
        ${[['basic','Basic (8.75%)'],['higher','Higher (33.75%)'],['additional','Additional (39.35%)']].map(([v,l])=>`<button type="button" data-act="ActHelpers.taxChip('div-band','div-band','${v}','rgba(0,213,255,.2)',this)" class="div-band" style="flex:1;padding:8px;border-radius:8px;font-size:10px;font-weight:600;cursor:pointer;touch-action:manipulation;border:1px solid var(--border);background:${dv===v?'rgba(0,213,255,.2)':'transparent'};color:var(--text3)">${l}</button>`).join('')}
      </div>
      <input type="hidden" id="div-band" value="${escAttr(dv)}">
    </div>
    <div class="vc-ix-43">
      <label class="vc-ix-11">Total Dividend Income (£)</label>
      <input class="vc-ix-44" id="tax-income" type="text" inputmode="decimal" value="${escAttr(saved.income||'')}" placeholder="Enter dividend income"
       >
    </div>
    <button class="vc-ix-29" type="button" data-act="Tax.calculateDividend()">Calculate Dividend Tax</button>
    <div class="vc-ix-19" id="tax-result"></div>`;
  },

  _ihtForm(saved) {
    const sp = saved.ihtSpouse||'no';
    return `<div class="vc-ix-9">
      <label class="vc-ix-11">Estate Value (£)</label>
      <input class="vc-ix-116" id="iht-estate" type="text" inputmode="decimal" value="${escAttr(saved.ihtEstate||'')}" placeholder="Total estate value"
       >
      <label class="vc-ix-11">Primary Home Value (£) — for Residence NRB</label>
      <input class="vc-ix-116" id="iht-home" type="text" inputmode="decimal" value="${escAttr(saved.ihtHome||'')}" placeholder="Value of primary residence"
       >
    </div>
    <div class="vc-ix-213">
      <button type="button" data-act="ActHelpers.taxChip('iht-sp','iht-spouse','yes','rgba(0,213,255,.2)',this)" class="iht-sp" style="flex:1;padding:8px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation;border:1px solid var(--border);background:${sp==='yes'?'rgba(0,213,255,.2)':'transparent'};color:var(--text3)">Transferring spouse NRB</button>
      <button type="button" data-act="ActHelpers.taxChip('iht-sp','iht-spouse','no','rgba(0,213,255,.2)',this)" class="iht-sp" style="flex:1;padding:8px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation;border:1px solid var(--border);background:${sp==='no'?'rgba(0,213,255,.2)':'transparent'};color:var(--text3)">Single / No transfer</button>
    </div>
    <input type="hidden" id="iht-spouse" value="${escAttr(sp)}">
    <button class="vc-ix-29" type="button" data-act="Tax.calculateIHT()">Calculate IHT</button>
    <div class="vc-ix-19" id="tax-result"></div>`;
  },

  _sdltForm(saved) {
    const ft = saved.sdltFtb||'no', ad = saved.sdltAdd||'no';
    return `<div class="vc-ix-9">
      <label class="vc-ix-11">Property Purchase Price (£)</label>
      <input class="vc-ix-116" id="sdlt-price" type="text" inputmode="decimal" value="${escAttr(saved.sdltPrice||'')}" placeholder="Enter purchase price"
       >
    </div>
    <div style="display:flex;gap:8px;margin-bottom:8px">
      <button type="button" data-act="ActHelpers.taxChip('sdlt-ftb','sdlt-ftb','yes','rgba(0,213,255,.2)',this)" class="sdlt-ftb" style="flex:1;padding:8px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation;border:1px solid var(--border);background:${ft==='yes'?'rgba(0,213,255,.2)':'transparent'};color:var(--text3)">First-Time Buyer</button>
      <button type="button" data-act="ActHelpers.taxChip('sdlt-ftb','sdlt-ftb','no','rgba(0,213,255,.2)',this)" class="sdlt-ftb" style="flex:1;padding:8px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation;border:1px solid var(--border);background:${ft==='no'?'rgba(0,213,255,.2)':'transparent'};color:var(--text3)">Standard</button>
    </div>
    <div class="vc-ix-213">
      <button type="button" data-act="ActHelpers.taxChip('sdlt-add','sdlt-add','yes','rgba(255,152,0,.2)',this)" class="sdlt-add" style="flex:1;padding:8px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation;border:1px solid var(--border);background:${ad==='yes'?'rgba(255,152,0,.2)':'transparent'};color:var(--text3)">Additional Property (+3%)</button>
      <button type="button" data-act="ActHelpers.taxChip('sdlt-add','sdlt-add','no','rgba(255,152,0,.2)',this)" class="sdlt-add" style="flex:1;padding:8px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation;border:1px solid var(--border);background:${ad==='no'?'rgba(255,152,0,.2)':'transparent'};color:var(--text3)">Main Residence</button>
    </div>
    <input type="hidden" id="sdlt-ftb" value="${escAttr(ft)}">
    <input type="hidden" id="sdlt-add" value="${escAttr(ad)}">
    <button class="vc-ix-29" type="button" data-act="Tax.calculateSDLT()">Calculate SDLT</button>
    <div class="vc-ix-19" id="tax-result"></div>`;
  },

  _exciseForm(saved) {
    const ex = this.config.AE.filings.excise;
    return `<div class="vc-ix-9">
      <label class="vc-ix-11">Product Category</label>
      <select id="excise-cat" style="width:100%;background:var(--input);border:1px solid var(--border);border-radius:10px;padding:12px;color:var(--text);font-size:14px;margin-bottom:12px">
        ${ex.rates.map(r=>`<option value="${escAttr(r.rate)}">${r.label} (${(r.rate*100).toFixed(0)}%)</option>`).join('')}
      </select>
      <label class="vc-ix-11">Amount (AED) — exclusive of excise</label>
      <input class="vc-ix-44" id="tax-income" type="text" inputmode="decimal" value="${escAttr(saved.income||'')}" placeholder="Enter amount"
       >
    </div>
    <button class="vc-ix-29" type="button" data-act="Tax.calculateExcise()">Calculate Excise Tax</button>
    <div class="vc-ix-19" id="tax-result"></div>`;
  },

  _freezoneForm() {
    return `<div style="background:linear-gradient(135deg,rgba(0,213,255,.1),rgba(0,213,255,.2));border:1px solid rgba(0,213,255,.3);border-radius:16px;padding:20px;margin-bottom:16px">
      <div style="font-size:15px;font-weight:800;color:var(--info);margin-bottom:12px">Free Zone Corporate Tax — Key Facts</div>
      <div style="display:flex;flex-direction:column;gap:10px;font-size:13px">
        ${[['Qualifying Income Rate','0% — Zero corporate tax'],['Non-Qualifying Income','9% — Standard CT rate applies'],['QFZP Requirements','Adequate UAE substance, qualifying activities, group revenue < AED 750m'],['Registration','Must register with FTA as Qualifying Free Zone Person'],['Qualifying Activities','Manufacturing, logistics, distribution, fund management, qualified IP income']].map(([k,v])=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span class="vc-ix-1">${k}</span><span style="font-weight:700;color:var(--text);text-align:right;max-width:55%">${v}</span></div>`).join('')}
      </div>
      <div style="margin-top:14px;padding:10px;background:rgba(255,152,0,.1);border:1px solid rgba(255,152,0,.3);border-radius:10px;font-size:12px;color:var(--warning)">
        Warning: Seek a qualified UAE tax advisor to confirm QFZP eligibility — self-assessment is complex.
      </div>
    </div>
    <div id="tax-result"></div>`;
  },

  calculate() {
    const cc = this._country;
    const cfg = this.config[cc];
    const filing = cfg.filings[this._filing];
    const income = parseFloat((document.getElementById('tax-income')?.value||'').replace(/,/g,''))||0;
    if(!income){ if(window.Toast) Toast.show('Enter income','error'); return; }
    const sym = cfg.symbol;
    const fmt = n => sym + Math.round(n).toLocaleString();

    if (filing.isFlat) {
      const tax = income * filing.flatRate;
      const takeHome = income - tax;
      const saved = {country:cc, filing:this._filing, income};
      VaultMeta.set('taxCalc', saved);
      const res = document.getElementById('tax-result');
      if(!res) return;
      res.innerHTML = `<div class="vc-ix-45" id="tax-report">
        <div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:16px">Tax Report — ${filing.name}</div>
        <div class="vc-ix-46">
          <div class="vc-ix-2"><span class="vc-ix-1">IT Export Proceeds</span><span class="vc-ix-15">${fmt(income)}</span></div>
          <div class="vc-ix-2"><span class="vc-ix-1">Final Tax (${(filing.flatRate*100).toFixed(2)}%)</span><span class="vc-ix-214">− ${fmt(tax)}</span></div>
          <div style="display:flex;justify-content:space-between;padding:12px;background:rgba(0,255,136,.1);border-radius:10px;margin-top:4px">
            <span class="vc-ix-47">Net Proceeds</span>
            <span class="vc-ix-215">${fmt(takeHome)}</span>
          </div>
          <div class="vc-ix-2"><span class="vc-ix-1">Effective Rate</span><span class="vc-ix-83">${(filing.flatRate*100).toFixed(2)}%</span></div>
        </div>
      </div>`;
      return;
    }

    const slabs = this._getActiveSlabs(filing);
    let tax = 0;
    const breakdown = [];
    slabs.forEach(slab=>{
      const from = slab.min;
      const to = slab.max===Infinity ? income : Math.min(slab.max, income);
      if(to<=from || income<=from) return;
      const taxable = to - from;
      const slabTax = taxable * slab.rate;
      if(slabTax > 0) breakdown.push({label:slab.label, rate:slab.rate, taxable, tax:slabTax});
      tax += slabTax;
    });

    let ni = 0;
    (filing.ni||[]).forEach(band=>{
      const niIncome = Math.min(income, band.max) - band.min;
      if(niIncome>0) ni += niIncome * band.rate;
    });
    let extras = 0;
    (filing.extras||[]).forEach(e=>extras+=e.annual||0);

    const total = tax + ni + extras;
    const takeHome = income - total;
    const effectiveRate = income>0?((total/income)*100).toFixed(1):0;
    const yearLabel = filing.taxYears ? ` (${this._taxYear})` : '';

    const saved = {country:cc, filing:this._filing, income, taxYear:this._taxYear};
    VaultMeta.set('taxCalc', saved);

    const res = document.getElementById('tax-result');
    if(!res) return;
    res.innerHTML = `<div class="vc-ix-45" id="tax-report">
      <div class="vc-ix-34">
        <div class="vc-ix-61">Tax Report — ${filing.name}${yearLabel}</div>
        <button class="vc-ix-35" type="button" data-act="Tax.printReport()">Print</button>
      </div>
      <div class="vc-ix-46">
        <div class="vc-ix-2"><span class="vc-ix-1">Gross Income</span><span class="vc-ix-15">${fmt(income)}</span></div>
        <div class="vc-ix-2"><span class="vc-ix-1">Income Tax</span><span class="vc-ix-214">− ${fmt(tax)}</span></div>
        ${ni>0?`<div class="vc-ix-2"><span class="vc-ix-1">National Insurance</span><span class="vc-ix-62">− ${fmt(ni)}</span></div>`:''}
        ${extras>0?`<div class="vc-ix-2"><span class="vc-ix-1">Other charges</span><span class="vc-ix-62">− ${fmt(extras)}</span></div>`:''}
        <div class="vc-ix-63"></div>
        <div style="display:flex;justify-content:space-between;padding:12px;background:rgba(0,255,136,.1);border-radius:10px">
          <span class="vc-ix-47">Take-Home Pay</span>
          <span class="vc-ix-215">${fmt(takeHome)}</span>
        </div>
        <div class="vc-ix-2"><span class="vc-ix-1">Effective Rate</span><span class="vc-ix-83">${effectiveRate}%</span></div>
        <div class="vc-ix-2"><span class="vc-ix-1">Monthly Take-Home</span><span class="vc-ix-15">${fmt(takeHome/12)}</span></div>
        <div class="vc-ix-2"><span class="vc-ix-1">Weekly Take-Home</span><span class="vc-ix-15">${fmt(takeHome/52)}</span></div>
      </div>
      ${breakdown.length?`<div style="margin-top:14px;border-top:1px solid var(--border);padding-top:12px">
        <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">Band Breakdown</div>
        ${breakdown.map(b=>`<div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;color:var(--text3)"><span>${b.label} (${(b.rate*100).toFixed(0)}%)</span><span>${fmt(b.tax)}</span></div>`).join('')}
      </div>`:''}
    </div>`;
  },

  calculateVAT() {
    const amount = parseFloat((document.getElementById('tax-income')?.value||'').replace(/,/g,''))||0;
    if(!amount){ if(window.Toast) Toast.show('Enter amount','error'); return; }
    const vat = amount * 0.05;
    const total = amount + vat;
    const res = document.getElementById('tax-result');
    if(!res) return;
    res.innerHTML = `<div class="vc-ix-117" id="tax-report">
      <div class="vc-ix-34">
        <div class="vc-ix-216">VAT Report (5%)</div>
        <button class="vc-ix-35" type="button" data-act="Tax.printReport()">Print</button>
      </div>
      <div class="vc-ix-118">
        <div class="vc-ix-2"><span class="vc-ix-1">Net Amount</span><span>AED ${amount.toLocaleString()}</span></div>
        <div class="vc-ix-2"><span class="vc-ix-1">VAT (5%)</span><span class="vc-ix-119">AED ${vat.toLocaleString()}</span></div>
        <div class="vc-ix-120"><span class="vc-ix-121">Total (VAT inclusive)</span><span class="vc-ix-122">AED ${total.toLocaleString()}</span></div>
      </div>
    </div>`;
  },

  calculateGbVAT() {
    const amount = parseFloat((document.getElementById('tax-income')?.value||'').replace(/,/g,''))||0;
    if(!amount){ if(window.Toast) Toast.show('Enter amount','error'); return; }
    const rateKey = document.getElementById('gbvat-rate')?.value || 'standard';
    const rateMap = {standard:0.20, reduced:0.05, zero:0};
    const rateLabels = {standard:'Standard (20%)', reduced:'Reduced (5%)', zero:'Zero (0%)'};
    const rate = rateMap[rateKey] || 0.20;
    const vat = amount * rate;
    const total = amount + vat;
    const res = document.getElementById('tax-result');
    if(!res) return;
    res.innerHTML = `<div class="vc-ix-117" id="tax-report">
      <div class="vc-ix-34">
        <div class="vc-ix-216">VAT Report — ${rateLabels[rateKey]}</div>
        <button class="vc-ix-35" type="button" data-act="Tax.printReport()">Print</button>
      </div>
      <div class="vc-ix-118">
        <div class="vc-ix-2"><span class="vc-ix-1">Net Amount</span><span>£${amount.toLocaleString()}</span></div>
        <div class="vc-ix-2"><span class="vc-ix-1">VAT (${(rate*100).toFixed(0)}%)</span><span class="vc-ix-119">£${vat.toLocaleString()}</span></div>
        <div class="vc-ix-120"><span class="vc-ix-121">Total (VAT inclusive)</span><span class="vc-ix-122">£${total.toLocaleString()}</span></div>
      </div>
    </div>`;
  },

  calculateCGT() {
    const gain = parseFloat((document.getElementById('tax-income')?.value||'').replace(/,/g,''))||0;
    if(!gain){ if(window.Toast) Toast.show('Enter gain amount','error'); return; }
    const filing = this.config.GB.filings.cgt;
    const band = document.getElementById('cgt-band')?.value || 'basic';
    const assetType = document.getElementById('cgt-type')?.value || 'other';
    const taxableGain = Math.max(0, gain - filing.annualExempt);
    const rate = filing.rates[band][assetType];
    const tax = taxableGain * rate;
    const fmt = n => '£'+Math.round(n).toLocaleString();
    const saved = {country:'GB', filing:'cgt', income:gain, cgtBand:band, cgtType:assetType};
    VaultMeta.set('taxCalc', saved);
    const res = document.getElementById('tax-result');
    if(!res) return;
    res.innerHTML = `<div class="vc-ix-45" id="tax-report">
      <div class="vc-ix-34">
        <div class="vc-ix-61">CGT Report</div>
        <button class="vc-ix-35" type="button" data-act="Tax.printReport()">Print</button>
      </div>
      <div class="vc-ix-46">
        <div class="vc-ix-2"><span class="vc-ix-1">Total Gain</span><span class="vc-ix-15">${fmt(gain)}</span></div>
        <div class="vc-ix-2"><span class="vc-ix-1">Annual Exempt Amount</span><span class="vc-ix-64">− ${fmt(filing.annualExempt)}</span></div>
        <div class="vc-ix-2"><span class="vc-ix-1">Taxable Gain</span><span class="vc-ix-15">${fmt(taxableGain)}</span></div>
        <div class="vc-ix-2"><span class="vc-ix-1">CGT Rate (${band}, ${assetType})</span><span class="vc-ix-62">${(rate*100).toFixed(0)}%</span></div>
        <div class="vc-ix-63"></div>
        <div class="vc-ix-123">
          <span class="vc-ix-47">CGT Due</span>
          <span class="vc-ix-124">${fmt(tax)}</span>
        </div>
        <div class="vc-ix-2"><span class="vc-ix-1">Effective Rate on Total Gain</span><span class="vc-ix-83">${gain>0?((tax/gain)*100).toFixed(1):0}%</span></div>
      </div>
    </div>`;
  },

  calculateDividend() {
    const income = parseFloat((document.getElementById('tax-income')?.value||'').replace(/,/g,''))||0;
    if(!income){ if(window.Toast) Toast.show('Enter dividend income','error'); return; }
    const filing = this.config.GB.filings.dividend;
    const band = document.getElementById('div-band')?.value || 'basic';
    const taxable = Math.max(0, income - filing.allowance);
    const rate = filing.rates[band];
    const tax = taxable * rate;
    const fmt = n => '£'+Math.round(n).toLocaleString();
    const rateLabels = {basic:'Basic (8.75%)', higher:'Higher (33.75%)', additional:'Additional (39.35%)'};
    const saved = {country:'GB', filing:'dividend', income, divBand:band};
    VaultMeta.set('taxCalc', saved);
    const res = document.getElementById('tax-result');
    if(!res) return;
    res.innerHTML = `<div class="vc-ix-45" id="tax-report">
      <div class="vc-ix-34">
        <div class="vc-ix-61">Dividend Tax Report</div>
        <button class="vc-ix-35" type="button" data-act="Tax.printReport()">Print</button>
      </div>
      <div class="vc-ix-46">
        <div class="vc-ix-2"><span class="vc-ix-1">Total Dividends</span><span class="vc-ix-15">${fmt(income)}</span></div>
        <div class="vc-ix-2"><span class="vc-ix-1">Dividend Allowance</span><span class="vc-ix-64">− ${fmt(filing.allowance)}</span></div>
        <div class="vc-ix-2"><span class="vc-ix-1">Taxable Dividends</span><span class="vc-ix-15">${fmt(taxable)}</span></div>
        <div class="vc-ix-2"><span class="vc-ix-1">Rate (${rateLabels[band]})</span><span class="vc-ix-62">${(rate*100).toFixed(2)}%</span></div>
        <div class="vc-ix-63"></div>
        <div class="vc-ix-123">
          <span class="vc-ix-47">Dividend Tax Due</span>
          <span class="vc-ix-124">${fmt(tax)}</span>
        </div>
      </div>
    </div>`;
  },

  calculateIHT() {
    const estate = parseFloat((document.getElementById('iht-estate')?.value||'').replace(/,/g,''))||0;
    if(!estate){ if(window.Toast) Toast.show('Enter estate value','error'); return; }
    const filing = this.config.GB.filings.iht;
    const homeVal = parseFloat((document.getElementById('iht-home')?.value||'').replace(/,/g,''))||0;
    const spouse = document.getElementById('iht-spouse')?.value === 'yes';
    const mult = spouse ? 2 : 1;
    const nrb = filing.nilRateBand * mult;
    const rnrb = Math.min(homeVal, filing.residenceNilRate) * mult;
    const totalAllowance = nrb + rnrb;
    const taxableEstate = Math.max(0, estate - totalAllowance);
    const tax = taxableEstate * filing.rate;
    const fmt = n => '£'+Math.round(n).toLocaleString();
    const saved = {country:'GB', filing:'iht', ihtEstate:estate, ihtHome:homeVal, ihtSpouse:spouse?'yes':'no'};
    VaultMeta.set('taxCalc', saved);
    const res = document.getElementById('tax-result');
    if(!res) return;
    res.innerHTML = `<div class="vc-ix-45" id="tax-report">
      <div class="vc-ix-34">
        <div class="vc-ix-61">IHT Report</div>
        <button class="vc-ix-35" type="button" data-act="Tax.printReport()">Print</button>
      </div>
      <div class="vc-ix-46">
        <div class="vc-ix-2"><span class="vc-ix-1">Estate Value</span><span class="vc-ix-15">${fmt(estate)}</span></div>
        <div class="vc-ix-2"><span class="vc-ix-1">Nil Rate Band${spouse?' (×2)':''}</span><span class="vc-ix-64">− ${fmt(nrb)}</span></div>
        ${rnrb>0?`<div class="vc-ix-2"><span class="vc-ix-1">Residence NRB${spouse?' (×2)':''}</span><span class="vc-ix-64">− ${fmt(rnrb)}</span></div>`:''}
        <div class="vc-ix-2"><span class="vc-ix-1">Total Allowance</span><span class="vc-ix-64">${fmt(totalAllowance)}</span></div>
        <div class="vc-ix-2"><span class="vc-ix-1">Taxable Estate</span><span class="vc-ix-15">${fmt(taxableEstate)}</span></div>
        <div class="vc-ix-63"></div>
        <div style="display:flex;justify-content:space-between;padding:12px;background:${tax>0?'rgba(255,69,58,.1)':'rgba(0,255,136,.1)'};border-radius:10px">
          <span class="vc-ix-47">IHT Due (40%)</span>
          <span style="font-size:22px;font-weight:900;color:${tax>0?'var(--danger)':'var(--success)'}">${fmt(tax)}</span>
        </div>
        ${tax===0?'<div style="font-size:12px;color:var(--success);text-align:center">Below nil-rate band — no IHT due</div>':''}
      </div>
    </div>`;
  },

  calculateSDLT() {
    const price = parseFloat((document.getElementById('sdlt-price')?.value||'').replace(/,/g,''))||0;
    if(!price){ if(window.Toast) Toast.show('Enter property price','error'); return; }
    const filing = this.config.GB.filings.stampduty;
    const ftb = document.getElementById('sdlt-ftb')?.value === 'yes';
    const additional = document.getElementById('sdlt-add')?.value === 'yes';
    const fmt = n => '£'+Math.round(n).toLocaleString();
    let tax = 0;
    const breakdown = [];
    const useSlabs = (ftb && price <= 500000) ? filing.firstTimeBuyerSlabs : filing.slabs;
    useSlabs.forEach(slab => {
      const from = slab.min;
      const to = slab.max === Infinity ? price : Math.min(slab.max, price);
      if (to <= from || price <= from) return;
      const taxable = to - from;
      const slabTax = taxable * slab.rate;
      if (slabTax > 0) breakdown.push({label:`${fmt(from)}–${slab.max===Infinity?'above':fmt(slab.max)}`, rate:slab.rate, tax:slabTax});
      tax += slabTax;
    });
    const surcharge = additional ? price * filing.additionalPropertySurcharge : 0;
    const total = tax + surcharge;
    const saved = {country:'GB', filing:'stampduty', sdltPrice:price, sdltFtb:ftb?'yes':'no', sdltAdd:additional?'yes':'no'};
    VaultMeta.set('taxCalc', saved);
    const res = document.getElementById('tax-result');
    if(!res) return;
    res.innerHTML = `<div class="vc-ix-45" id="tax-report">
      <div class="vc-ix-34">
        <div class="vc-ix-61">SDLT Report</div>
        <button class="vc-ix-35" type="button" data-act="Tax.printReport()">Print</button>
      </div>
      <div class="vc-ix-46">
        <div class="vc-ix-2"><span class="vc-ix-1">Property Price</span><span class="vc-ix-15">${fmt(price)}</span></div>
        <div class="vc-ix-2"><span class="vc-ix-1">Buyer Type</span><span class="vc-ix-15">${ftb?'First-Time Buyer':'Standard'}</span></div>
        ${breakdown.map(b=>`<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text3)"><span>${b.label} @ ${(b.rate*100).toFixed(0)}%</span><span>${fmt(b.tax)}</span></div>`).join('')}
        <div class="vc-ix-2"><span class="vc-ix-1">Standard SDLT</span><span class="vc-ix-15">${fmt(tax)}</span></div>
        ${additional?`<div class="vc-ix-2"><span class="vc-ix-1">Additional Property Surcharge (3%)</span><span class="vc-ix-62">${fmt(surcharge)}</span></div>`:''}
        <div class="vc-ix-63"></div>
        <div class="vc-ix-123">
          <span class="vc-ix-47">Total SDLT</span>
          <span class="vc-ix-124">${fmt(total)}</span>
        </div>
        <div class="vc-ix-2"><span class="vc-ix-1">Effective Rate</span><span class="vc-ix-83">${price>0?((total/price)*100).toFixed(2):0}%</span></div>
      </div>
    </div>`;
  },

  calculateExcise() {
    const amount = parseFloat((document.getElementById('tax-income')?.value||'').replace(/,/g,''))||0;
    if(!amount){ if(window.Toast) Toast.show('Enter amount','error'); return; }
    const catEl = document.getElementById('excise-cat');
    const rate = parseFloat(catEl?.value||1.0);
    const catLabel = catEl?.options[catEl?.selectedIndex]?.text || '';
    const excise = amount * rate;
    const total = amount + excise;
    const res = document.getElementById('tax-result');
    if(!res) return;
    res.innerHTML = `<div class="vc-ix-117" id="tax-report">
      <div style="font-size:14px;font-weight:800;margin-bottom:12px">Excise Tax Report</div>
      <div class="vc-ix-118">
        <div class="vc-ix-2"><span class="vc-ix-1">Product</span><span style="font-weight:700;text-align:right;max-width:60%">${catLabel}</span></div>
        <div class="vc-ix-2"><span class="vc-ix-1">Net Amount</span><span>AED ${amount.toLocaleString()}</span></div>
        <div class="vc-ix-2"><span class="vc-ix-1">Excise Tax (${(rate*100).toFixed(0)}%)</span><span class="vc-ix-119">AED ${excise.toLocaleString()}</span></div>
        <div class="vc-ix-120"><span class="vc-ix-121">Total (inclusive)</span><span class="vc-ix-122">AED ${total.toLocaleString()}</span></div>
      </div>
    </div>`;
  },

  printReport() {
    const report = document.getElementById('tax-report');
    if(!report) return;
    const cc = this._country;
    const cfg = this.config[cc];
    const filing = cfg?.filings[this._filing];
    const w = window.open('', '_blank');
    if (!w) { if(window.Toast) Toast.show('Allow pop-ups to print', 'warning'); return; }
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Tax Report — VaultCap</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,Arial,sans-serif;background:#fff;color:#1a1a2e}.page{max-width:600px;margin:0 auto;padding:40px 32px}.header{background:linear-gradient(135deg,#1a237e,#283593);color:white;padding:28px 32px;border-radius:16px;margin-bottom:28px}.header h1{font-size:24px;font-weight:900;margin-bottom:4px}.header .sub{font-size:13px;opacity:.8}.meta{background:#f1f3f5;border-radius:10px;padding:14px 16px;margin-bottom:16px;font-size:13px;color:#555;line-height:1.7}.section{background:#f8f9fa;border-radius:12px;padding:20px;margin-bottom:16px}.section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#666;margin-bottom:14px}.row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #e9ecef;font-size:14px}.row:last-child{border-bottom:none}.row .label{color:#555}.row .value{font-weight:600}.footer{text-align:center;font-size:11px;color:#999;margin-top:28px;padding-top:16px;border-top:1px solid #eee}.no-print{display:flex;gap:10px;justify-content:center;margin:20px 0}.btn{padding:12px 28px;border-radius:10px;border:none;font-size:14px;font-weight:700;cursor:pointer}.btn-print{background:#1a237e;color:white}.btn-close{background:#f1f3f5;color:#333}@media print{.no-print{display:none!important}body{padding:0}.page{padding:20px}}</style></head><body><div class="page"><div class="no-print"><button type="button" class="btn btn-print" data-act="window.print()">Print</button><button type="button" class="btn btn-close" data-act="window.close()">Close</button></div><div class="header"><h1>Tax Report</h1><div class="sub">Generated by VaultCap · ${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</div></div><div class="meta">Country: ${cfg?.name||''} &nbsp;|&nbsp; Filing: ${filing?.name||''} &nbsp;|&nbsp; Tax Year: ${filing?.year||''}</div><div class="section"><div class="section-title">Tax Calculation</div>${report.innerText.trim().split('\n').filter(l=>l.trim()&&!l.includes('Print')&&!l.includes('Tax Report')).map(l=>{const p=l.split(/\s{2,}|\t/);return p.length>=2?'<div class="row"><span class="label">'+p[0]+'</span><span class="value">'+p.slice(1).join(' ')+'</span></div>':'<div class="row"><span>'+l+'</span></div>';}).join('')}</div><div class="footer">VaultCap — Your Personal Financial Vault<br>For guidance only — consult a qualified tax professional.</div><div class="no-print" style="margin-top:16px"><button type="button" class="btn btn-close" data-act="window.close()">Close Window</button></div></div></body></html>`);
    w.document.close();
  },

  openEditSlabs() {
    const filing = this.config[this._country]?.filings[this._filing];
    if (!filing) return;
    const slabs = this._getActiveSlabs(filing).map(s => ({ ...s }));
    if (!slabs.length) slabs.push({ label: 'Slab 1', min: 0, max: Infinity, rate: 0 });
    const rowHtml = (s, i) => `<div class="tax-slab-row" data-i="${i}" style="display:grid;grid-template-columns:1fr 72px 72px 64px 32px;gap:6px;align-items:center;margin-bottom:8px">
      <input data-f="label" class="inp vc-ix-48" value="${escHtml(s.label || '')}" placeholder="Label">
      <input data-f="min" type="number" class="inp vc-ix-48" value="${escAttr(s.min === 0 ? 0 : (s.min || ''))}" placeholder="From">
      <input data-f="max" type="number" class="inp vc-ix-48" value="${escAttr(s.max === Infinity ? '' : (s.max || ''))}" placeholder="To (∞)">
      <input data-f="rate" type="number" class="inp vc-ix-217" value="${escAttr((s.rate * 100).toFixed(2))}" min="0" max="100" step="0.01">
      <button class="vc-ix-218" type="button" data-act="this.closest('.tax-slab-row').remove()" aria-label="Remove slab">×</button>
    </div>`;
  Modal.open('Edit Tax Slabs',
      `<div class="vc-ix-158">Adjust official brackets or add custom slabs. Leave <strong>To</strong> blank for no upper limit. Rates as % (e.g. 20).</div>
      <div style="display:grid;grid-template-columns:1fr 72px 72px 64px 32px;gap:6px;font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;margin-bottom:6px">
        <span>Label</span><span>From</span><span>To</span><span>Rate</span><span></span>
      </div>
      <div id="tax-slab-rows">${slabs.map(rowHtml).join('')}</div>
      <button type="button" class="btn btn-g btn-sm vc-ix-151" data-act="Tax._addSlabRow()">+ Add Slab</button>`,
      `<button type="button" class="btn btn-g" data-act="Modal.close()">Cancel</button><button type="button" class="btn btn-p" data-act="Tax._saveSlabs()">Save</button>`);
  },

  _addSlabRow() {
    const wrap = document.getElementById('tax-slab-rows');
    if (!wrap) return;
    const rows = wrap.querySelectorAll('.tax-slab-row');
    const last = rows[rows.length - 1];
    const min = last ? (parseFloat(last.querySelector('[data-f=max]')?.value) || parseFloat(last.querySelector('[data-f=min]')?.value) || 0) : 0;
    const i = rows.length;
    const div = document.createElement('div');
    div.className = 'tax-slab-row';
    div.dataset.i = String(i);
    div.style.cssText = 'display:grid;grid-template-columns:1fr 72px 72px 64px 32px;gap:6px;align-items:center;margin-bottom:8px';
    div.innerHTML = `<input data-f="label" class="inp vc-ix-48" value="Slab ${i + 1}" placeholder="Label">
      <input data-f="min" type="number" class="inp vc-ix-48" value="${escAttr(min || '')}" placeholder="From">
      <input data-f="max" type="number" class="inp vc-ix-48" value="" placeholder="To (∞)">
      <input data-f="rate" type="number" class="inp vc-ix-217" value="0" min="0" max="100" step="0.01">
      <button class="vc-ix-218" type="button" data-act="this.closest('.tax-slab-row').remove()" aria-label="Remove slab">×</button>`;
    wrap.appendChild(div);
  },

  _saveSlabs() {
    const wrap = document.getElementById('tax-slab-rows');
    if (!wrap) return;
    const slabs = [...wrap.querySelectorAll('.tax-slab-row')].map((row, i) => {
      const maxVal = row.querySelector('[data-f=max]')?.value;
      return {
        label: row.querySelector('[data-f=label]')?.value || `Slab ${i + 1}`,
        min: parseFloat(row.querySelector('[data-f=min]')?.value) || 0,
        max: maxVal === '' || maxVal == null ? Infinity : parseFloat(maxVal),
        rate: parseFloat(row.querySelector('[data-f=rate]')?.value || 0) / 100,
      };
    }).sort((a, b) => a.min - b.min);
    if (typeof VaultMeta !== 'undefined') VaultMeta.set(this._slabsKey(), slabs);
    Modal.close();
    if (window.Toast) Toast.show('Tax slabs updated', 'success');
    this.render();
  }
};
window.Tax = Tax;
