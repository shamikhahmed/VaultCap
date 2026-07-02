'use strict';

const ASSET_TYPES_MAP = {
  property:        { label:'Property',        ic:'building', color:'#e8e8e8' },
  vehicle:         { label:'Vehicle',         ic:'car', color:'#d0d0d0' },
  electronics:     { label:'Electronics',     ic:'laptop', color:'#b8b8b8' },
  gadget:          { label:'Gadget',          ic:'laptop', color:'#b8b8b8' },
  precious_metals: { label:'Precious Metals', ic:'gem', color:'#a0a0a0' },
  precious:        { label:'Precious Metals', ic:'gem', color:'#a0a0a0' },
  watch:           { label:'Watch',           ic:'watch', color:'#888888' },
  jewelry:         { label:'Jewellery',       ic:'ring', color:'#707070' },
  subscription:    { label:'Subscription',   ic:'repeat', color:'#636366' },
  insurance:       { label:'Insurance',      ic:'shield', color:'#585858' },
  business:        { label:'Business',       ic:'building-2', color:'#484848' },
  loan:            { label:'Loan Asset',     ic:'banknote', color:'#383838' },
  other:           { label:'Other',          ic:'package', color:'#9e9e9e' }
};
window.ASSET_TYPES_MAP = ASSET_TYPES_MAP;

const Assets = {
  _valueInPKR(a) {
    if (!a) return 0;
    const cur = a.currency || 'PKR';
    if ((a.assetType === 'precious_metals' || a.assetType === 'precious') && a.weight && typeof RatesEngine !== 'undefined') {
      let grams = parseFloat(a.weight) || 0;
      const unit = a.unit || a.weightUnit || 'g';
      if (unit === 'tola') grams *= 11.6638;
      else if (unit === 'oz' || unit === 'troy oz') grams *= 31.1035;
      else if (unit === 'kg') grams *= 1000;
      else if (unit === 'lbs') grams *= 453.592;
      if (a.useManualPrice && a.pricePerUnit) {
        return typeof CurrencyEngine !== 'undefined' ? CurrencyEngine.toBase(grams * parseFloat(a.pricePerUnit), cur) : grams * parseFloat(a.pricePerUnit);
      }
      const metal = (a.metal || a.metalType || 'gold').toLowerCase();
      const ppg = metal === 'silver' ? RatesEngine.silverInCurrency('PKR', 'gram') : RatesEngine.goldInCurrency('PKR', 'gram');
      return grams * ppg;
    }
    const val = parseFloat(a.currentValue || a.resaleValue || 0);
    return typeof CurrencyEngine !== 'undefined' ? CurrencyEngine.toBase(val, cur) : val;
  },

  totalPKR() {
    return (S.assets || []).reduce((sum, a) => sum + this._valueInPKR(a), 0);
  },

  byType(type) {
    return (S.assets || []).filter(a => a.assetType === type);
  },

  render() {
    const f = S.aF || 'all';
    const chips = [
      ['all','All','layers'],['property','Property','building'],['vehicle','Vehicles','car'],['electronics','Electronics','laptop'],
      ['precious_metals','Metals','gem'],['watch','Watches','watch'],['jewelry','Jewellery','ring'],
      ['subscription','Subs','repeat'],['insurance','Insurance','shield'],['business','Business','building-2'],
      ['loan','Loans','banknote'],['other','Other','package']
    ];
    const ci = document.getElementById('aChips');
    if (ci) ci.innerHTML = chips.map(([v,l,ic]) => `<div class="chip${v===f?' on':''}" onclick="S.aF='${v}';Assets.render()"><span class="chip-ic">${VC.icon(ic, 12)}</span>${l}</div>`).join('');
    let data = (S.assets||[]).filter(a => f==='all' || a.assetType===f || (f==='precious_metals' && a.assetType==='precious'));
    if(typeof ContextSwitcher!=='undefined'&&ContextSwitcher.get()!=='ALL'){data=data.filter(a=>(a.country||'').toUpperCase()===ContextSwitcher.get());}
    const el = document.getElementById('aItems'); if (!el) return;
    if (!data.length) {
      const typeInfo = ASSET_TYPES_MAP[f] || ASSET_TYPES_MAP.other;
      el.innerHTML = `<div class="empty-ios"><div class="ei-ic">${VC.assetIcon(f==='all'?'other':f, 32)}</div><div class="ei-title">No ${typeInfo.label} Yet</div><div class="ei-sub">Track property, vehicles, electronics, metals and more</div><button type="button" class="btn btn-p" onclick="Assets.openAdd('${f==='all'?'':f}')">+ Add Asset</button></div>`;
      return;
    }
    const cur = S.user.currency || 'PKR';
    el.innerHTML = data.map(a => {
      const typeInfo = ASSET_TYPES_MAP[a.assetType] || ASSET_TYPES_MAP.other;
      let sub = '';
      if (a.assetType==='property') sub=(a.location||'')+(a.propertyType?' · '+a.propertyType:'')+(a.rentalIncome?' · Rent: '+U.fmt(a.rentalIncome)+'/mo':'')+(a.mortgType&&a.mortgType!=='None'?' · '+a.mortgType:'');
      else if (a.assetType==='vehicle') sub=[a.make,a.model,a.year,(a.registration||a.regNumber)?'· '+(a.registration||a.regNumber):''].filter(Boolean).join(' ');
      else if (a.assetType==='electronics') sub=[a.brand,a.model,a.serialNum?'· S/N ••••':''].filter(Boolean).join(' ');
      else if (a.assetType==='watch') sub=[a.brand,a.modelName,a.serialNum?'· S/N ••••':''].filter(Boolean).join(' ');
      else if (a.assetType==='subscription') sub=(a.currency||'')+' '+U.fmt(a.monthlyCost||0)+'/mo'+(a.from?' · '+a.from:'');
      else if (a.assetType==='insurance') sub=(a.insuranceType||'')+(a.insProvider?' · '+a.insProvider:'')+(a.renewalDate?' · Exp '+a.renewalDate:'');
      else if (a.assetType==='precious'||a.assetType==='precious_metals') sub=((a.metal||a.metalType)||'')+(a.purity?' · '+a.purity:'')+(a.weight?' · '+a.weight+(a.unit||a.weightUnit||'g'):'');
      let valDisplay = a.currentValue;
      let displayCur = a.currency || '';
      if ((a.assetType==='precious_metals'||a.assetType==='precious') && a.weight && typeof RatesEngine!=='undefined') {
        valDisplay = Math.round(typeof CurrencyEngine!=='undefined' ? CurrencyEngine.fromBase(this._valueInPKR(a), cur) : this._valueInPKR(a));
        displayCur = cur;
      }
      const _pnl=(a.currentValue>0&&a.purchasePrice>0)?a.currentValue-a.purchasePrice:null;
      const _pnlPct=_pnl!==null?(_pnl/a.purchasePrice*100).toFixed(1):null;
      const _pnlHtml=_pnl!==null?`<span class="badge" style="color:${_pnl>=0?'var(--ok)':'var(--err)'}">${_pnl>=0?'+':''}${U.fmt(Math.round(Math.abs(_pnl)))} (${_pnl>=0?'+':''}${_pnlPct}%)</span>`:'';
      return `<div class="entry"><div class="entry-main"><div class="entry-ic">${VC.assetIcon(a.assetType, 18)}</div><div class="entry-body"><div class="entry-name">${escHtml(a.name||'Asset')}</div><div class="entry-sub">${sub||a.notes?.slice(0,60)||''}</div><div class="entry-meta">${valDisplay?`<span class="badge b-acc">${displayCur} ${U.fmt(valDisplay)}</span>`:''} ${_pnlHtml} <span class="badge b-muted">${a.ownership==='business'?'Business':'Personal'}</span>${a.assetType==='vehicle'&&a.staffAssigned?` <span class="badge b-muted">${escHtml(a.staffAssigned)}</span>`:''}</div></div><div class="entry-acts">${U.icb('star',{onclick:`Assets.fav('${a.id}')`,class:'fav'+(a.favorite?' on':'')})}${U.actsViewEditDel('Assets', a.id)}</div></div></div>`;
    }).join('');
  },

  _pendingOwnerId: null,
  openAdd(typeOrPrefill) {
    let preType = '';
    if (typeOrPrefill && typeof typeOrPrefill === 'object') {
      Assets._pendingOwnerId = typeOrPrefill.ownerId || null;
    } else {
      Assets._pendingOwnerId = null;
      preType = (typeOrPrefill && typeOrPrefill !== 'all') ? typeOrPrefill : '';
    }
    const ownerLabel = Assets._pendingOwnerId && typeof Family !== 'undefined' ? Family.ownerName(Assets._pendingOwnerId) : '';
    const title = ownerLabel ? `Add Asset — ${escHtml(ownerLabel)}` : 'Add Asset';
    Modal.open(title, this.form(preType ? {assetType:preType} : {}), `<button type="button" class="btn btn-g" onclick="Modal.close()">Cancel</button><button type="button" class="btn btn-p" onclick="Assets.save()">Save</button>`);
    setTimeout(() => {
      const t = document.getElementById('af-type');
      if (t) {
        if (preType) { t.value = preType; this.subFields(preType); }
        t.oninput = () => this.subFields(this.getType());
      }
    }, 60);
  },

  getType() { const el = document.getElementById('af-type'); return el ? el.value : 'other'; },

  subFields(type) {
    const sf = document.getElementById('af-sub'); if (!sf) return;
    const subs = {
      property: `<div class="fr"><div class="fg"><label class="fl">Property Type *</label><datalist id="sf2ptDL"><option>Apartment</option><option>House</option><option>Villa</option><option>Townhouse</option><option>Commercial</option><option>Land / Plot</option><option>Office</option><option>Warehouse</option><option>Shop</option><option>Development Project</option><option>Penthouse</option></datalist><input class="inp" id="sf2-pt" value="" list="sf2ptDL" placeholder="Apartment, House, Development Project..." oninput="Assets.togglePropMode(this.value)"></div><div class="fg"><label class="fl">Location</label><input class="inp" id="sf2-loc" placeholder="City, Country"></div></div><div class="fr"><div class="fg"><label class="fl">Area (sq ft)</label><input class="inp" id="sf2-area" type="number" placeholder="1200"></div><div class="fg"><label class="fl">Rental Income / mo</label><input class="inp" id="sf2-rent" type="number" placeholder="0"></div></div><div id="propStdFields"><div style="background:var(--glass);border:1px solid var(--border);border-radius:var(--rsm);padding:11px;margin-top:6px"><div style="font-size:10px;font-weight:700;color:var(--text2);margin-bottom:9px;letter-spacing:.5px">MORTGAGE / FINANCING</div><div class="fr"><div class="fg"><label class="fl">Type</label><datalist id="mortgTypeDL"><option>None</option><option>Mortgage</option><option>EMI/Installment</option><option>Islamic Finance</option><option>Lease</option></datalist><input class="inp" id="sf2-mortg" value="" list="mortgTypeDL" placeholder="None, Mortgage, EMI..."></div><div class="fg"><label class="fl">Monthly Payment</label><input class="inp" id="sf2-mortgpmt" type="number" placeholder="0"></div></div><div class="fr"><div class="fg"><label class="fl">Lender</label><input class="inp" id="sf2-mortglender" placeholder="Bank name"></div><div class="fg"><label class="fl">Outstanding Balance</label><input class="inp" id="sf2-mortgbal" type="number" placeholder="0"></div></div><div class="fr"><div class="fg"><label class="fl">Rate %</label><input class="inp" id="sf2-mortgrate" type="number" step="0.01" placeholder="3.5"></div><div class="fg"><label class="fl">End Date</label><input class="inp" id="sf2-mortgend" type="date"></div></div></div></div><div id="propDevFields" style="display:none"><div style="background:rgba(0,128,255,.06);border:1px solid rgba(0,128,255,.2);border-radius:var(--rsm);padding:11px;margin-top:6px"><div style="font-size:10px;font-weight:700;color:var(--accent);margin-bottom:9px;letter-spacing:.5px">DEVELOPMENT PROJECT</div><div class="fr"><div class="fg"><label class="fl">Developer Name</label><input class="inp" id="sf2-dev" placeholder="Developer / builder"></div><div class="fg"><label class="fl">Unit Number</label><input class="inp" id="sf2-unit" placeholder="Unit / apt number"></div></div><div class="fr"><div class="fg"><label class="fl">Booking ID</label><input class="inp" id="sf2-bookid" placeholder="Reference number"></div><div class="fg"><label class="fl">Handover Date</label><input class="inp" id="sf2-handover" type="date"></div></div><div class="fr"><div class="fg"><label class="fl">Total Amount</label><input class="inp" id="sf2-devtotal" type="number" placeholder="0"></div><div class="fg"><label class="fl">Amount Paid</label><input class="inp" id="sf2-devpaid" type="number" placeholder="0"></div></div><div class="fr"><div class="fg"><label class="fl">Payment Frequency</label><datalist id="devFreqDL"><option>Monthly</option><option>Quarterly</option><option>Semi-annual</option><option>Annual</option><option>Milestone-based</option></datalist><input class="inp" id="sf2-devfreq" value="" list="devFreqDL" placeholder="Monthly, Quarterly..."></div><div class="fg"><label class="fl">Installment Amount</label><input class="inp" id="sf2-devinst" type="number" placeholder="0"></div></div><div class="fr"><div class="fg"><label class="fl">Construction Progress %</label><input class="inp" id="sf2-devprog" type="number" min="0" max="100" placeholder="0"></div><div class="fg"><label class="fl">Possession Status</label><datalist id="devStatDL"><option>Booking Done</option><option>Under Construction</option><option>Nearing Completion</option><option>Handed Over</option><option>Delayed</option></datalist><input class="inp" id="sf2-devstat" value="" list="devStatDL" placeholder="Under Construction..."></div></div></div></div>`,
      vehicle: `<div class="fr"><div class="fg"><label class="fl">Make</label><datalist id="sf2makeDL"><option>Toyota</option><option>Honda</option><option>Suzuki</option><option>Mercedes-Benz</option><option>BMW</option><option>Audi</option><option>Volkswagen</option><option>Hyundai</option><option>Kia</option><option>Nissan</option><option>Ford</option><option>Range Rover</option><option>Land Rover</option><option>Porsche</option><option>Tesla</option><option>Lexus</option><option>Mitsubishi</option><option>Jeep</option><option>Chevrolet</option><option>Rolls-Royce</option></datalist><input class="inp" id="sf2-make" value="" list="sf2makeDL" placeholder="Toyota, BMW..."></div><div class="fg"><label class="fl">Model</label><input class="inp" id="sf2-model" placeholder="Corolla, 3 Series..."></div></div><div class="fr"><div class="fg"><label class="fl">Year</label><input class="inp" id="sf2-year" type="number" placeholder="2023" min="1900" max="2030"></div><div class="fg"><label class="fl">Registration No.</label><input class="inp" id="sf2-reg" placeholder="ABC-123"></div></div><div class="fr"><div class="fg"><label class="fl">Fuel Type</label><datalist id="sf2fuelDL"><option>Petrol</option><option>Diesel</option><option>Electric</option><option>Hybrid</option><option>CNG</option><option>LPG</option><option>Hydrogen</option></datalist><input class="inp" id="sf2-fuel" value="" list="sf2fuelDL" placeholder="Petrol, Electric..."></div><div class="fg"><label class="fl">Colour</label><input class="inp" id="sf2-col" placeholder="Pearl White"></div></div><div class="fr"><div class="fg"><label class="fl">Ownership</label><datalist id="sf2vownDL"><option>Personal</option><option>Company Vehicle</option><option>Staff Vehicle</option><option>Business Fleet</option></datalist><input class="inp" id="sf2-vown" value="" list="sf2vownDL" placeholder="Personal, Company..."></div><div class="fg"><label class="fl">Assigned to Staff</label><input class="inp" id="sf2-staff" placeholder="Staff name (if company)"></div></div>`,
      electronics: `<div class="fr"><div class="fg"><label class="fl">Brand</label><datalist id="sf2elBrandDL"><option>Apple</option><option>Samsung</option><option>Google</option><option>Sony</option><option>LG</option><option>OnePlus</option><option>Xiaomi</option><option>Huawei</option><option>Microsoft</option><option>Dell</option><option>HP</option><option>Lenovo</option><option>ASUS</option></datalist><input class="inp" id="sf2-brand" value="" list="sf2elBrandDL" placeholder="Apple, Samsung..."></div><div class="fg"><label class="fl">Model</label><input class="inp" id="sf2-elmodel" placeholder="iPhone 15 Pro, M3 MacBook..."></div></div><div class="fr"><div class="fg"><label class="fl">Category</label><datalist id="sf2elCatDL"><option>Phone</option><option>Tablet</option><option>Laptop</option><option>Desktop</option><option>Wearable</option><option>Audio</option><option>Gaming</option><option>Camera</option><option>Network</option></datalist><input class="inp" id="sf2-elcat" value="" list="sf2elCatDL" placeholder="Phone, Laptop..."></div><div class="fg"><label class="fl">Serial No.</label><input class="inp" id="sf2-serial" placeholder="S/N"></div></div><div class="fr"><div class="fg"><label class="fl">IMEI (phones)</label><input class="inp" id="sf2-imei" placeholder="15-digit IMEI"></div><div class="fg"><label class="fl">Warranty Until</label><input class="inp" id="sf2-warranty" type="date"></div></div>`,
      precious_metals: `<div class="fr"><div class="fg"><label class="fl">Metal</label><select class="inp" id="sf2-met2"><option value="gold">🥇 Gold</option><option value="silver">🥈 Silver</option><option value="platinum">🔘 Platinum</option></select></div><div class="fg"><label class="fl">Weight</label><input class="inp" id="sf2-wt2" type="number" step="0.001" placeholder="100"></div></div><div class="fr"><div class="fg"><label class="fl">Unit</label><select class="inp" id="sf2-wu2"><option value="g">Grams</option><option value="tola">Tola (11.66g)</option><option value="oz">Troy Oz (31.1g)</option><option value="kg">Kilograms</option></select></div><div class="fg"><label class="fl">Purity</label><datalist id="sf2purDL2"><option>24K (999)</option><option>22K (916)</option><option>18K (750)</option><option>999 Fine</option><option>925 Sterling</option></datalist><input class="inp" id="sf2-pur2" value="" list="sf2purDL2" placeholder="24K, 22K..."></div></div><div class="fg"><label class="fl">Storage Location</label><input class="inp" id="sf2-store2" placeholder="Home safe, bank vault..."></div>`,
      watch: `<div class="fr"><div class="fg"><label class="fl">Brand</label><datalist id="sf2brandDL"><option>Rolex</option><option>Omega</option><option>Patek Philippe</option><option>Audemars Piguet</option><option>Cartier</option><option>IWC</option><option>Breitling</option><option>TAG Heuer</option><option>Longines</option><option>Seiko</option><option>Citizen</option><option>Apple</option><option>Samsung</option><option>Garmin</option></datalist><input class="inp" id="sf2-brand" value="" list="sf2brandDL" placeholder="Rolex, Omega, Patek..."></div><div class="fg"><label class="fl">Model / Reference</label><input class="inp" id="sf2-wmod" placeholder="Submariner, Speedmaster..."></div></div><div class="fr"><div class="fg"><label class="fl">Serial No.</label><input class="inp" id="sf2-serial" placeholder="Serial #"></div><div class="fg"><label class="fl">Condition</label><datalist id="sf2condDL"><option>Mint/Unworn</option><option>Excellent</option><option>Good</option><option>Fair</option><option>Poor</option></datalist><input class="inp" id="sf2-cond" value="" list="sf2condDL" placeholder="Mint, Excellent..."></div></div><label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;margin-top:4px"><input type="checkbox" id="sf2-papers"> Box & Papers included</label>`,
      jewelry: `<div class="fr"><div class="fg"><label class="fl">Type</label><datalist id="sf2jtypeDL"><option>Ring</option><option>Necklace</option><option>Bracelet</option><option>Earrings</option><option>Pendant</option><option>Bangle</option><option>Brooch</option><option>Set</option></datalist><input class="inp" id="sf2-jtype" value="" list="sf2jtypeDL" placeholder="Ring, Necklace..."></div><div class="fg"><label class="fl">Material / Stones</label><datalist id="sf2jmatDL"><option>22K Gold</option><option>18K Gold</option><option>24K Gold</option><option>White Gold</option><option>Platinum</option><option>Diamond</option><option>Ruby</option><option>Emerald</option><option>Sapphire</option></datalist><input class="inp" id="sf2-jmat" value="" list="sf2jmatDL" placeholder="Gold, Diamond..."></div></div><div class="fr"><div class="fg"><label class="fl">Weight (grams)</label><input class="inp" id="sf2-jw" type="number" step="0.01" placeholder="10"></div><div class="fg"><label class="fl">Occasion / For</label><input class="inp" id="sf2-jocc" placeholder="Wedding, Gift..."></div></div>`,
      precious: `<div class="fr"><div class="fg"><label class="fl">Metal</label><datalist id="sf2metDL"><option>Gold</option><option>Silver</option><option>Platinum</option><option>Palladium</option><option>Rhodium</option></datalist><input class="inp" id="sf2-met" value="" list="sf2metDL" placeholder="Gold, Silver..."></div><div class="fg"><label class="fl">Purity</label><datalist id="sf2purDL"><option>24K (999)</option><option>22K (916)</option><option>18K (750)</option><option>14K (585)</option><option>999 Fine</option><option>925 Sterling</option></datalist><input class="inp" id="sf2-pur" value="" list="sf2purDL" placeholder="24K, 22K, 999..."></div></div><div class="fr"><div class="fg"><label class="fl">Weight</label><input class="inp" id="sf2-wt" type="number" step="0.001" placeholder="100"></div><div class="fg"><label class="fl">Unit</label><datalist id="sf2wuDL"><option>grams</option><option>troy oz</option><option>tola</option><option>kg</option><option>lbs</option></datalist><input class="inp" id="sf2-wu" value="" list="sf2wuDL" placeholder="grams, tola, troy oz..."></div></div><div class="fg"><label class="fl">Storage Location</label><input class="inp" id="sf2-store" placeholder="Home safe, bank vault..."></div>`,
      subscription: `<datalist id="subDL">${typeof SUBS_DB!=='undefined'?SUBS_DB.map(s=>`<option value="${escAttr(s.n)}">`).join(''):''}</datalist><div class="fr"><div class="fg"><label class="fl">Service Name</label><input class="inp" id="sf2-svc" list="subDL" placeholder="Netflix, Spotify, Gym..." oninput="Assets.autofillSub(this.value)" autocomplete="off"></div><div class="fg"><label class="fl">Category</label><input class="inp" id="sf2-scat" placeholder="Streaming, VPN, Fitness..."></div></div><div class="fr"><div class="fg"><label class="fl">Monthly Cost</label><input class="inp" id="sf2-mc" type="number" step="0.01" placeholder="9.99"></div><div class="fg"><label class="fl">Renewal Date</label><input class="inp" id="sf2-ren" type="date"></div></div><div class="fg"><label class="fl">Billed From (Card / Bank)</label><select class="inp" id="sf2-from"><option value="">— Not linked —</option>${(S.cards||[]).map(c=>`<option value="Card: ${c.cardName} ${c.last4?'****'+c.last4:''}">Card: ${c.cardName} ${c.last4?'****'+c.last4:''}</option>`).join('')}${(S.banks||[]).map(b=>`<option value="Bank: ${b.bankName}">Bank: ${b.bankName} (${b.currency})</option>`).join('')}</select></div><div class="fg"><label class="fl">Account / Username</label><input class="inp" id="sf2-svcuser" placeholder="Subscribed email/username"></div>`,
      insurance: `<div class="fr"><div class="fg"><label class="fl">Insurance Type</label><datalist id="sf2insDL"><option>Life</option><option>Health</option><option>Auto</option><option>Home</option><option>Travel</option><option>Business</option><option>Pet</option><option>Gadget</option><option>Critical Illness</option><option>Income Protection</option></datalist><input class="inp" id="sf2-ins" value="" list="sf2insDL" placeholder="Life, Health, Auto..."></div><div class="fg"><label class="fl">Provider</label><input class="inp" id="sf2-prov" placeholder="Insurance company"></div></div><div class="fr"><div class="fg"><label class="fl">Policy Number</label><input class="inp" id="sf2-pol" placeholder="Policy #"></div><div class="fg"><label class="fl">Renewal Date</label><input class="inp" id="sf2-iren" type="date"></div></div><div class="fr"><div class="fg"><label class="fl">Premium / mo</label><input class="inp" id="sf2-prem" type="number" placeholder="0"></div><div class="fg"><label class="fl">Coverage Amount</label><input class="inp" id="sf2-cov" type="number" placeholder="0"></div></div><div class="fg"><label class="fl">Beneficiary</label><input class="inp" id="sf2-bene" placeholder="Beneficiary name"></div>`,
      business: `<div class="fr"><div class="fg"><label class="fl">Industry</label><input class="inp" id="sf2-ind" placeholder="Tech, Retail, Real Estate..."></div><div class="fg"><label class="fl">Your Ownership %</label><input class="inp" id="sf2-own2" type="number" placeholder="100" min="0" max="100"></div></div><div class="fr"><div class="fg"><label class="fl">Annual Revenue</label><input class="inp" id="sf2-rev" type="number" placeholder="0"></div><div class="fg"><label class="fl">Stage</label><datalist id="sf2stageDL"><option>Idea</option><option>Startup</option><option>Growth</option><option>Mature</option><option>Exited</option></datalist><input class="inp" id="sf2-stage" value="" list="sf2stageDL" placeholder="Startup, Growth..."></div></div><div class="fg"><label class="fl">Co-owners / Partners</label><input class="inp" id="sf2-partners" placeholder="Names and % splits"></div>`,
      loan: `<div class="fr"><div class="fg"><label class="fl">Debtor / Lender</label><input class="inp" id="sf2-deb" placeholder="Who owes you / who you owe"></div><div class="fg"><label class="fl">Direction</label><select class="inp" id="sf2-ldir"><option value="owed_to_me">💰 Owed to me</option><option value="i_owe">📤 I owe them</option></select></div></div><div class="fr"><div class="fg"><label class="fl">Original Amount</label><input class="inp" id="sf2-lorig" type="number" placeholder="0"></div><div class="fg"><label class="fl">Outstanding Balance</label><input class="inp" id="sf2-lbal" type="number" placeholder="0"></div></div><div class="fr"><div class="fg"><label class="fl">Due Date</label><input class="inp" id="sf2-due" type="date"></div><div class="fg"><label class="fl">Interest Rate %</label><input class="inp" id="sf2-lint" type="number" step="0.01" placeholder="0"></div></div>`,
      other: `<div class="fg"><label class="fl">Description</label><textarea class="inp" id="sf2-desc" rows="3" placeholder="Describe the asset..."></textarea></div><div class="fg"><label class="fl">Location / Storage</label><input class="inp" id="sf2-otherloc" placeholder="Where is it?"></div>`
    };
    sf.innerHTML = subs[type] || subs.other;
  },

  togglePropMode(val) {
    const dev = (val||'').toLowerCase().includes('development') || (val||'').toLowerCase().includes('project');
    const s = document.getElementById('propStdFields'), d = document.getElementById('propDevFields');
    if (s) s.style.display = dev ? 'none' : 'block';
    if (d) d.style.display = dev ? 'block' : 'none';
  },

  autofillSub(n) {
    if (typeof SUBS_DB === 'undefined') return;
    const s = SUBS_DB.find(x => x.n.toLowerCase() === n.toLowerCase());
    if (!s) return;
    const c = document.getElementById('sf2-scat'); if (c && !c.value) c.value = s.c;
  },

  form(a = {}) {
    return `<div class="fr"><div class="fg"><label class="fl">Asset Type *</label><datalist id="afTypeDL"><option>property</option><option>vehicle</option><option>electronics</option><option>precious_metals</option><option>watch</option><option>jewelry</option><option>precious</option><option>subscription</option><option>insurance</option><option>business</option><option>loan</option><option>other</option></datalist><input class="inp" id="af-type" value="${escAttr(a.assetType||'')}" list="afTypeDL" placeholder="property, vehicle, electronics..." oninput="Assets.subFields(document.getElementById('af-type').value)"></div><div class="fg"><label class="fl">Ownership</label><select class="inp" id="af-own"><option value="personal"${a.ownership!=='business'?' selected':''}>👤 Personal</option><option value="business"${a.ownership==='business'?' selected':''}>🏢 Business</option></select></div></div>
    <div class="fg"><label class="fl">Name *</label><input class="inp" id="af-name" value="${escHtml(a.name||'')}" placeholder="e.g. London Flat, BMW 3 Series, iPhone 15 Pro..."></div>
    <div class="fr"><div class="fg"><label class="fl">Purchase Price</label><input class="inp" id="af-pp" value="${escAttr(a.purchasePrice||'')}" type="number" placeholder="0"></div><div class="fg"><label class="fl">Current Value</label><input class="inp" id="af-cv" value="${escAttr(a.currentValue||'')}" type="number" placeholder="0"></div></div>
    <div class="fr"><div class="fg"><label class="fl">Currency</label><select class="inp" id="af-cur">${U.currencies()}</select></div><div class="fg"><label class="fl">Purchase Date</label><input class="inp" id="af-date" value="${escAttr(a.purchaseDate||'')}" type="date"></div></div>
    <div id="af-sub" style="margin-top:4px"></div>
    <div class="fg" style="margin-top:8px"><label class="fl">Notes</label><textarea class="inp" id="af-notes" rows="2">${escHtml(a.notes||'')}</textarea></div>
    <div class="fg"><label class="fl">Tags</label>${U.tags(a.tags||[])}</div>
    <label style="display:flex;align-items:center;gap:7px;cursor:pointer;font-size:13px;margin-top:4px"><input type="checkbox" id="af-fav" ${a.favorite?'checked':''}> ⭐ Favourite</label>`;
  },

  save(editId = null) {
    const name = document.getElementById('af-name').value.trim();
    if (!name) { Toast.show('Asset name required', 'warning'); return; }
    const type = document.getElementById('af-type').value.trim().toLowerCase();
    const g = id => { const e = document.getElementById(id); return e ? e.value : ''; };
    const gc = id => { const e = document.getElementById(id); return e ? e.checked : false; };
    const extra = {};
    if (type==='property') { extra.propertyType=g('sf2-pt');extra.location=g('sf2-loc');extra.area=parseFloat(g('sf2-area'))||0;extra.rentalIncome=parseFloat(g('sf2-rent'))||0;extra.mortgType=g('sf2-mortg');extra.mortgPayment=parseFloat(g('sf2-mortgpmt'))||0;extra.mortgLender=g('sf2-mortglender');extra.mortgBalance=parseFloat(g('sf2-mortgbal'))||0;extra.mortgRate=parseFloat(g('sf2-mortgrate'))||0;extra.mortgEnd=g('sf2-mortgend');extra.developer=g('sf2-dev');extra.unitNumber=g('sf2-unit');extra.bookingId=g('sf2-bookid');extra.handoverDate=g('sf2-handover');extra.devTotal=parseFloat(g('sf2-devtotal'))||0;extra.devPaid=parseFloat(g('sf2-devpaid'))||0;extra.devFrequency=g('sf2-devfreq');extra.devInstallment=parseFloat(g('sf2-devinst'))||0;extra.constructionProg=parseInt(g('sf2-devprog'))||0;extra.possessionStatus=g('sf2-devstat'); }
    if (type==='vehicle') { extra.make=g('sf2-make');extra.model=g('sf2-model');extra.year=g('sf2-year');extra.registration=g('sf2-reg');extra.fuelType=g('sf2-fuel');extra.vehicleColour=g('sf2-col');extra.vehicleOwnership=g('sf2-vown');extra.staffAssigned=g('sf2-staff'); }
    if (type==='electronics') { extra.brand=g('sf2-brand');extra.model=g('sf2-elmodel');extra.category=g('sf2-elcat');extra.serialNum=g('sf2-serial');extra.imei=g('sf2-imei');extra.warranty=g('sf2-warranty'); }
    if (type==='precious_metals') { extra.metal=g('sf2-met2')||'gold';extra.weight=parseFloat(g('sf2-wt2'))||0;extra.unit=g('sf2-wu2')||'g';extra.purity=g('sf2-pur2');extra.storageLocation=g('sf2-store2'); }
    if (type==='watch') { extra.brand=g('sf2-brand');extra.modelName=g('sf2-wmod');extra.serialNum=g('sf2-serial');extra.condition=g('sf2-cond');extra.papers=gc('sf2-papers'); }
    if (type==='jewelry') { extra.jewType=g('sf2-jtype');extra.material=g('sf2-jmat');extra.jewWeight=g('sf2-jw');extra.occasion=g('sf2-jocc'); }
    if (type==='precious') { extra.metalType=g('sf2-met');extra.purity=g('sf2-pur');extra.weight=g('sf2-wt');extra.weightUnit=g('sf2-wu');extra.storageLocation=g('sf2-store'); }
    if (type==='subscription') { extra.serviceName=g('sf2-svc')||name;extra.subCategory=g('sf2-scat');extra.monthlyCost=parseFloat(g('sf2-mc'))||0;extra.renewalDate=g('sf2-ren');extra.from=g('sf2-from');extra.svcUsername=g('sf2-svcuser');if(extra.monthlyCost>0&&typeof SUBS_DB!=='undefined'&&!S.expenses.find(e=>e.name===extra.serviceName)){S.expenses.push({id:U.id(),name:extra.serviceName,icon:SUBS_DB.find(s=>s.n===extra.serviceName)?.ic||'repeat',category:extra.subCategory||'Other',amount:extra.monthlyCost,currency:document.getElementById('af-cur').value,from:extra.from,active:true,createdAt:new Date().toISOString()});} }
    if (type==='insurance') { extra.insuranceType=g('sf2-ins');extra.insProvider=g('sf2-prov');extra.policyNumber=g('sf2-pol');extra.renewalDate=g('sf2-iren');extra.premium=parseFloat(g('sf2-prem'))||0;extra.coverage=parseFloat(g('sf2-cov'))||0;extra.beneficiary=g('sf2-bene'); }
    if (type==='business') { extra.industry=g('sf2-ind');extra.ownershipPct=g('sf2-own2');extra.annualRevenue=parseFloat(g('sf2-rev'))||0;extra.bizStage=g('sf2-stage');extra.partners=g('sf2-partners'); }
    if (type==='loan') { extra.debtor=g('sf2-deb');extra.loanDirection=g('sf2-ldir');extra.loanOriginal=parseFloat(g('sf2-lorig'))||0;extra.loanBalance=parseFloat(g('sf2-lbal'))||0;extra.dueDate=g('sf2-due');extra.loanInterest=parseFloat(g('sf2-lint'))||0; }

    const _oid = editId ? ((S.assets||[]).find(x=>x.id===editId)?.ownerId||'self') : (Assets._pendingOwnerId||'self');
    if (!editId) Assets._pendingOwnerId = null;
    const item = { id:editId||U.id(), name, assetType:type, ownership:document.getElementById('af-own').value, purchasePrice:parseFloat(document.getElementById('af-pp').value)||0, currentValue:parseFloat(document.getElementById('af-cv').value)||0, currency:document.getElementById('af-cur').value, purchaseDate:document.getElementById('af-date').value, notes:document.getElementById('af-notes').value.trim(), tags:U.getTags(), favorite:document.getElementById('af-fav').checked, ownerId:_oid, updatedAt:new Date().toISOString(), createdAt:editId?(S.assets||[]).find(x=>x.id===editId)?.createdAt||new Date().toISOString():new Date().toISOString(), ...extra };
    if (!S.assets) S.assets = [];
    if (editId) S.assets = S.assets.map(x => x.id===editId ? item : x); else S.assets.push(item);
    Activity.log((editId?'Edited':'Added')+' asset', name);
    Store.save(); Modal.close(); this.render();
    Toast.show(`${editId?'Updated':'Added'}: ${name}`, 'success');
  },

  detail(id) {
    const a = (S.assets||[]).find(x => x.id===id); if (!a) return;
    const typeInfo = ASSET_TYPES_MAP[a.assetType] || ASSET_TYPES_MAP.other;
    const aName = (a.name||'').toLowerCase();
    const relatedDocs = (S.documents||[]).filter(d =>
      aName.length > 2 && (
        (d.tags||[]).some(t => (t||'').toLowerCase().includes(aName) || aName.includes((t||'').toLowerCase().trim())) ||
        (d.notes||'').toLowerCase().includes(aName)
      )
    );
    const relatedReminders = (S.assets||[]).filter(r => r.assetType === 'reminder' && (r.notes||'').toLowerCase().includes(aName));
    const docsHtml = relatedDocs.length
      ? `<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border)"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);margin-bottom:8px">Related Documents (${relatedDocs.length})</div>${relatedDocs.map(d=>`<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)"><span style="font-size:16px">📄</span><div><div style="font-size:13px;font-weight:600;color:var(--text)">${d.name||d.docName||'Document'}</div><div style="font-size:11px;color:var(--text3)">${d.docType||''} ${d.expiryDate?'· Exp '+d.expiryDate:''}</div></div></div>`).join('')}</div>`
      : '';
    const remHtml = relatedReminders.length
      ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);margin-bottom:8px">Linked Reminders (${relatedReminders.length})</div>${relatedReminders.map(r=>`<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)"><span style="font-size:16px">🔔</span><div><div style="font-size:13px;font-weight:600;color:var(--text)">${r.name||'Reminder'}</div><div style="font-size:11px;color:var(--text3)">${r.renewalDate||''}</div></div></div>`).join('')}</div>`
      : '';
    const noRelated = !relatedDocs.length && !relatedReminders.length
      ? '<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border);font-size:12px;color:var(--text3);text-align:center;padding-bottom:4px">No related documents or reminders found</div>'
      : '';
    Modal.open(`${typeInfo.label} — ${a.name||'Asset'}`,
      `<div>${[['Type',typeInfo.label],['Value',(a.currentValue?(a.currency||'')+' '+U.fmt(a.currentValue):'—')],['Ownership',a.ownership||'personal'],['Notes',a.notes||'—']].map(([k,v])=>U.drRow(k,v)).join('')}${docsHtml}${remHtml}${noRelated}</div>`,
      `<button type="button" class="btn btn-g" onclick="Modal.close()">Close</button><button type="button" class="btn btn-p" onclick="Assets.edit('${id}');Modal.close()">Edit</button>`
    );
  },

  edit(id) {
    const a = (S.assets||[]).find(x => x.id===id); if (!a) return;
    Modal.open('Edit Asset', this.form(a), `<button type="button" class="btn btn-g" onclick="Modal.close()">Cancel</button><button type="button" class="btn btn-d btn-sm" onclick="Assets.del('${id}',true)">Delete</button><button type="button" class="btn btn-p" onclick="Assets.save('${id}')">Update</button>`);
    setTimeout(() => {
      const cur = document.getElementById('af-cur'); const own = document.getElementById('af-own');
      if (cur) cur.value = a.currency || 'GBP'; if (own) own.value = a.ownership || 'personal';
      this.subFields(a.assetType || 'other');
      setTimeout(() => {
        const g = (id, v) => { const e = document.getElementById(id); if (e) e.value = v || ''; };
        if (a.assetType==='property') { g('sf2-pt',a.propertyType);g('sf2-loc',a.location);g('sf2-area',a.area);g('sf2-rent',a.rentalIncome);g('sf2-mortg',a.mortgType);g('sf2-mortgpmt',a.mortgPayment);g('sf2-mortglender',a.mortgLender);g('sf2-mortgbal',a.mortgBalance);g('sf2-mortgrate',a.mortgRate);g('sf2-mortgend',a.mortgEnd); }
        if (a.assetType==='vehicle') { g('sf2-make',a.make);g('sf2-model',a.model);g('sf2-year',a.year);g('sf2-reg',a.registration||a.regNumber);g('sf2-fuel',a.fuelType);g('sf2-col',a.vehicleColour||a.color);g('sf2-vown',a.vehicleOwnership);g('sf2-staff',a.staffAssigned); }
        if (a.assetType==='electronics') { g('sf2-brand',a.brand);g('sf2-elmodel',a.model);g('sf2-elcat',a.category);g('sf2-serial',a.serialNum);g('sf2-imei',a.imei);g('sf2-warranty',a.warranty); }
        if (a.assetType==='precious_metals') { const met=document.getElementById('sf2-met2');if(met)met.value=a.metal||'gold';g('sf2-wt2',a.weight);const wu=document.getElementById('sf2-wu2');if(wu)wu.value=a.unit||'g';g('sf2-pur2',a.purity);g('sf2-store2',a.storageLocation); }
        if (a.assetType==='watch') { g('sf2-brand',a.brand);g('sf2-wmod',a.modelName);g('sf2-serial',a.serialNum);g('sf2-cond',a.condition); }
        if (a.assetType==='subscription') { g('sf2-svc',a.serviceName||a.name);g('sf2-scat',a.subCategory);g('sf2-mc',a.monthlyCost);g('sf2-ren',a.renewalDate);g('sf2-svcuser',a.svcUsername);const fr=document.getElementById('sf2-from');if(fr)fr.value=a.from||''; }
        if (a.assetType==='insurance') { g('sf2-ins',a.insuranceType);g('sf2-prov',a.insProvider);g('sf2-pol',a.policyNumber);g('sf2-iren',a.renewalDate);g('sf2-prem',a.premium);g('sf2-cov',a.coverage);g('sf2-bene',a.beneficiary); }
        if (a.assetType==='precious') { g('sf2-met',a.metalType);g('sf2-pur',a.purity);g('sf2-wt',a.weight);g('sf2-wu',a.weightUnit); }
        if (a.assetType==='business') { g('sf2-ind',a.industry);g('sf2-own2',a.ownershipPct);g('sf2-rev',a.annualRevenue);g('sf2-stage',a.bizStage);g('sf2-partners',a.partners); }
        if (a.assetType==='loan') { g('sf2-deb',a.debtor);g('sf2-lorig',a.loanOriginal);g('sf2-lbal',a.loanBalance);g('sf2-due',a.dueDate);g('sf2-lint',a.loanInterest);const ld=document.getElementById('sf2-ldir');if(ld)ld.value=a.loanDirection||'owed_to_me'; }
      }, 120);
    }, 60);
  },

  fav(id) { const a = (S.assets||[]).find(x => x.id===id); if (!a) return; a.favorite = !a.favorite; Store.save(); this.render(); },

  del(id, fm = false) {
    if (!window.__vos_confirm('Move to Trash?')) return;
    const a = (S.assets||[]).find(x => x.id===id); if (!a) return;
    if (a.assetType==='subscription') S.expenses = S.expenses.filter(e => e.name!==a.serviceName && e.name!==a.name);
    S.trash.push({ id:U.id(), type:'assets', data:a, deletedAt:new Date().toISOString() });
    S.assets = S.assets.filter(x => x.id!==id);
    Activity.log('Trashed asset', a.name);
    Store.save(); if (fm) Modal.close(); this.render();
    Toast.show(`Moved to Trash — <button type="button" class="cpbtn" onclick="Trash.restore('${S.trash[S.trash.length-1].id}');this.closest('.toast').remove()">Undo</button>`, 'info', 6000);
  }
};
