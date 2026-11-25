'use strict';
// VaultCap — researched personal income-tax presets. © 2026 Shamikh Ahmed. Source-available.
/* One entry per country: resident, single, employment income, annual, local currency.
   b: marginal bands as [upperBound, rate] (upper null = no limit), applied to taxable income.
   ded: allowance deducted before the bands. credit: tax credit = ded-like amount × lowest rate.
   flatCredit: fixed amount off the tax. rebate: {maxTaxable, max} (India 87A).
   sur: [{label, ofTax|ofIncome}] added after credits. verify: figure not confirmed against the
   official text. approx: the real rule is a formula or regional; bands only approximate it.
   Research and sources: docs/research/worldwide-features.md §2.2. Never roll a preset forward
   silently — add a new year instead. */
const TAX_PRESETS = {
  US: { year: '2025', cur: 'USD', ded: 15750, label: 'Federal income tax (single)', src: 'https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2025',
    note: 'Federal only, single filer, standard deduction $15,750. State income tax, Social Security and Medicare (FICA) are extra.',
    b: [[11925, .10], [48475, .12], [103350, .22], [197300, .24], [250525, .32], [626350, .35], [null, .37]] },
  CA: { year: '2025', cur: 'CAD', credit: 16129, label: 'Federal income tax', src: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/canadian-income-tax-rates-individuals-current-previous-years.html',
    note: 'Federal only — your province or territory adds its own tax. Lowest rate is the 2025 blended 14.5% (15% cut to 14% from 1 July). Basic personal amount taken as a credit.',
    b: [[57375, .145], [114750, .205], [177882, .26], [253414, .29], [null, .33]] },
  AU: { year: '2025-26', cur: 'AUD', label: 'Resident income tax', src: 'https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents',
    note: 'Australian residents. Includes the 2% Medicare levy (low-income reductions not modelled).',
    b: [[18200, 0], [45000, .16], [135000, .30], [190000, .37], [null, .45]], sur: [{ label: 'Medicare levy (2%)', ofIncome: .02 }] },
  IN: { year: 'FY 2025-26', cur: 'INR', ded: 75000, rebate: { maxTaxable: 1200000, max: 60000 }, label: 'New regime (s.115BAC)', src: 'https://incometaxindia.gov.in',
    note: 'New tax regime, salaried: ₹75,000 standard deduction and the s.87A rebate (no tax up to ₹12 lakh taxable). 4% health & education cess included. Marginal relief and surcharge above ₹50 lakh not modelled.',
    b: [[400000, 0], [800000, .05], [1200000, .10], [1600000, .15], [2000000, .20], [2400000, .25], [null, .30]], sur: [{ label: 'Health & education cess (4%)', ofTax: .04 }] },
  NG: { year: '2026', cur: 'NGN', verify: true, label: 'Personal income tax (Nigeria Tax Act 2025)', src: 'https://taxsummaries.pwc.com/nigeria/individual/taxes-on-personal-income',
    note: 'Nigeria Tax Act 2025, in force 1 January 2026. Consolidated relief is abolished; rent relief (20% of rent, max ₦500,000) and pension/NHF/NHIS contributions are deductible — subtract them from income first.',
    b: [[800000, 0], [3000000, .15], [12000000, .18], [25000000, .21], [50000000, .23], [null, .25]] },
  KE: { year: '2025', cur: 'KES', flatCredit: 28800, label: 'PAYE (annualised)', src: 'https://www.kra.go.ke/individual/filing-paying/types-of-taxes/paye',
    note: 'Monthly PAYE bands × 12 with personal relief KES 2,400/month. SHIF, Housing Levy and NSSF are deductible — subtract them from income first.',
    b: [[288000, .10], [387996, .25], [6000000, .30], [9600000, .325], [null, .35]] },
  ZA: { year: '2025/26', cur: 'ZAR', flatCredit: 17235, label: 'Income tax (under 65)', src: 'https://www.sars.gov.za/tax-rates/income-tax/rates-of-tax-for-individuals/',
    note: 'Under-65 primary rebate R17,235 (tax threshold R95,750). Secondary/tertiary rebates for 65+ not included.',
    b: [[237100, .18], [370500, .26], [512800, .31], [673000, .36], [857900, .39], [1817000, .41], [null, .45]] },
  BR: { year: '2025', cur: 'BRL', label: 'IRPF (annualised monthly table)', src: 'https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas/2025',
    note: 'Monthly IRPF table from May 2025 × 12. INSS contributions and the simplified discount are not modelled; the 2026 reform exempting up to R$5,000/month is not included.',
    b: [[29145.60, 0], [33919.80, .075], [45012.60, .15], [55976.16, .225], [null, .275]] },
  MX: { year: '2025', cur: 'MXN', label: 'ISR (annual)', src: 'https://www.sat.gob.mx',
    note: 'Annual ISR table (Anexo 8 RMF). Employment subsidy not modelled.',
    b: [[8952.49, .0192], [75984.55, .064], [133536.07, .1088], [155229.80, .16], [185852.57, .1792], [374837.88, .2136], [590795.99, .2352], [1127926.84, .30], [1503902.46, .32], [4511707.37, .34], [null, .35]] },
  ID: { year: '2025', cur: 'IDR', ded: 54000000, label: 'PPh 21 (UU HPP)', src: 'https://www.pajak.go.id',
    note: 'Single person PTKP Rp54 million (add Rp4.5 million per dependant yourself). Monthly withholding uses TER tables; this is the annual reconciliation.',
    b: [[60000000, .05], [250000000, .15], [500000000, .25], [5000000000, .30], [null, .35]] },
  PH: { year: '2023+', cur: 'PHP', label: 'Income tax (TRAIN)', src: 'https://www.bir.gov.ph/income-tax',
    note: 'Graduated rates for compensation income from 2023 onwards.',
    b: [[250000, 0], [400000, .15], [800000, .20], [2000000, .25], [8000000, .30], [null, .35]] },
  BD: { year: 'FY 2025-26', cur: 'BDT', verify: true, label: 'Income tax', src: 'https://nbr.gov.bd',
    note: 'Tax-free threshold Tk 350,000 (women and 65+: Tk 400,000 — edit the first band). Minimum tax not modelled.',
    b: [[350000, 0], [450000, .05], [850000, .10], [1350000, .15], [1850000, .20], [3850000, .25], [null, .30]] },
  EG: { year: '2024+', cur: 'EGP', ded: 20000, verify: true, approx: true, label: 'Income tax (Law 7/2024)', src: 'https://taxsummaries.pwc.com/egypt/individual/taxes-on-personal-income',
    note: 'Personal exemption EGP 20,000. High earners lose the lower bands step by step (above EGP 1.2 million all income is taxed at 27.5%) — not modelled.',
    b: [[40000, 0], [55000, .10], [70000, .15], [200000, .20], [400000, .225], [1200000, .25], [null, .275]] },
  JP: { year: '2025', cur: 'JPY', ded: 580000, label: 'National income tax', src: 'https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2260.htm',
    note: 'Basic deduction ¥580,000 (higher for low incomes in 2025–26) and the 2.1% reconstruction surtax. Employment-income deduction and local inhabitant tax (~10%) not included — enter income after employment deduction.',
    b: [[1950000, .05], [3300000, .10], [6950000, .20], [9000000, .23], [18000000, .33], [40000000, .40], [null, .45]], sur: [{ label: 'Reconstruction surtax (2.1%)', ofTax: .021 }] },
  SG: { year: 'YA 2025', cur: 'SGD', label: 'Resident income tax', src: 'https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-residency-and-tax-rates/individual-income-tax-rates',
    note: 'Resident rates on chargeable income (after reliefs). YA 2025 rebate (60% up to S$200) not included.',
    b: [[20000, 0], [30000, .02], [40000, .035], [80000, .07], [120000, .115], [160000, .15], [200000, .18], [240000, .19], [280000, .195], [320000, .20], [500000, .22], [1000000, .23], [null, .24]] },
  MY: { year: 'YA 2025', cur: 'MYR', ded: 9000, label: 'Resident income tax', src: 'https://www.hasil.gov.my/en/individual/individual-life-cycle/how-to-declare-income/tax-rate/',
    note: 'Self relief RM9,000. Other reliefs (EPF, insurance, lifestyle) and the RM400 rebate not included.',
    b: [[5000, 0], [20000, .01], [35000, .03], [50000, .06], [70000, .11], [100000, .19], [400000, .25], [600000, .26], [2000000, .28], [null, .30]] },
  TR: { year: '2025', cur: 'TRY', label: 'Income tax (wages)', src: 'https://www.gib.gov.tr',
    note: 'Wage-income bands. Minimum-wage exemption not modelled. Non-wage income uses a wider 27% band.',
    b: [[158000, .15], [330000, .20], [800000, .27], [4300000, .35], [null, .40]] },
  ES: { year: '2025', cur: 'EUR', ded: 5550, approx: true, label: 'IRPF (state + average region)', src: 'https://sede.agenciatributaria.gob.es',
    note: 'Approximation: state scale plus an average regional scale. Your autonomous community (Madrid, Catalonia, Valencia…) differs — edit the bands. Personal minimum €5,550.',
    b: [[12450, .19], [20200, .24], [35200, .30], [60000, .37], [300000, .45], [null, .47]] },
  IT: { year: '2025', cur: 'EUR', label: 'IRPEF', src: 'https://www.agenziaentrate.gov.it/portale/web/guest/irpef-aliquote',
    note: 'National IRPEF bands. Employee tax credits (no-tax area ~€8,500) and regional/municipal surcharges not modelled.',
    b: [[28000, .23], [50000, .35], [null, .43]] },
  NL: { year: '2025', cur: 'EUR', label: 'Box 1 (below state-pension age)', src: 'https://www.belastingdienst.nl/wps/wcm/connect/nl/werk-en-inkomen/content/hoeveel-inkomstenbelasting-betalen',
    note: 'Box 1 including national insurance, below AOW age. General and labour tax credits not modelled, so this overstates tax.',
    b: [[38441, .3582], [76817, .3748], [null, .495]] },
  NZ: { year: '2025-26', cur: 'NZD', label: 'Income tax', src: 'https://www.ird.govt.nz/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals/tax-rates-for-individuals',
    note: 'Rates from 31 July 2024. No tax-free allowance. ACC levy not included.',
    b: [[15600, .105], [53500, .175], [78100, .30], [180000, .33], [null, .39]] },
  DE: { year: '2025', cur: 'EUR', approx: true, label: 'Einkommensteuer (approx.)', src: 'https://www.gesetze-im-internet.de/estg/__32a.html',
    note: 'Approximation of the §32a formula: Grundfreibetrag €12,096, then two linear-progressive zones shown as average rates, 42% and 45%. Solidarity surcharge and church tax not included.',
    b: [[12096, 0], [17443, .19], [68480, .33], [277825, .42], [null, .45]] },
  FR: { year: '2025', cur: 'EUR', approx: true, label: 'Impôt sur le revenu (1 part)', src: 'https://www.service-public.fr/particuliers/vosdroits/F1419',
    note: 'Barème 2025 for one part. Quotient familial (divide income by your parts), the 10% expense deduction and décote are not modelled.',
    b: [[11497, 0], [29315, .11], [83823, .30], [180294, .41], [null, .45]] },
};

/* No personal income tax on employment income. UAE has its own detailed calculator. */
const TAX_FREE_COUNTRIES = {
  SA: 'Saudi nationals pay zakat and GOSI; foreign nationals are taxed only on business income.',
  QA: 'Qatar taxes business income (10%), not salaries.',
  KW: 'No personal income tax in Kuwait.',
  BH: 'No personal income tax in Bahrain.',
  OM: 'No personal income tax in Oman yet (a tax on high earners is planned from 2028).',
  BS: 'No personal income tax in the Bahamas.', BM: 'No personal income tax in Bermuda (payroll tax applies).',
  KY: 'No personal income tax in the Cayman Islands.', BN: 'No personal income tax in Brunei.',
  MC: 'No personal income tax for most Monaco residents (French nationals excepted).', VU: 'No personal income tax in Vanuatu.',
};

/** Pure: income (gross, local currency) → breakdown. slabs override the preset bands when given. */
function computePresetTax(p, income, slabs) {
  const ded = p.ded || 0;
  const taxable = Math.max(0, income - ded);
  let bands = slabs;
  if (!bands) {
    let lo = 0;
    bands = p.b.map(([hi, rate]) => { const s = { min: lo, max: hi == null ? Infinity : hi, rate }; lo = hi || lo; return s; });
  }
  let tax = 0;
  const breakdown = [];
  bands.forEach(s => {
    if (taxable <= s.min) return;
    const part = Math.min(taxable, s.max) - s.min;
    if (part <= 0) return;
    const t = part * s.rate;
    tax += t;
    if (t > 0) breakdown.push({ label: s.label || ('Band ' + (breakdown.length + 1)), rate: s.rate, taxable: part, tax: t });
  });
  const credits = [];
  if (p.credit) { const lowest = bands.find(s => s.rate > 0); const c = Math.min(tax, p.credit * (lowest ? lowest.rate : 0)); if (c) credits.push({ label: 'Personal amount credit', amount: c }); tax -= c; }
  if (p.flatCredit) { const c = Math.min(tax, p.flatCredit); if (c) credits.push({ label: 'Personal relief / rebate', amount: c }); tax -= c; }
  if (p.rebate && taxable <= p.rebate.maxTaxable) { const c = Math.min(tax, p.rebate.max); if (c) credits.push({ label: 'Rebate', amount: c }); tax -= c; }
  tax = Math.max(0, tax);
  const extras = (p.sur || []).map(s => ({ label: s.label, amount: s.ofTax ? tax * s.ofTax : taxable * (s.ofIncome || 0) })).filter(e => e.amount > 0);
  const total = tax + extras.reduce((a, e) => a + e.amount, 0);
  return { taxable, deduction: Math.min(ded, income), incomeTax: tax, credits, extras, total, breakdown };
}

window.TAX_PRESETS = TAX_PRESETS;
window.TAX_FREE_COUNTRIES = TAX_FREE_COUNTRIES;
window.computePresetTax = computePresetTax;
