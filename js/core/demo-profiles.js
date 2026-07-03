'use strict';
/* loadDemoProfile — demo data seeder */

function loadDemoProfile(type) {
  const id = U.id;
  const ts = new Date().toISOString();
  const now = new Date();
  const daysAgo = d => new Date(now - d*86400000).toISOString().split('T')[0];
  const daysFromNow = d => new Date(now.getTime() + d*86400000).toISOString().split('T')[0];

  // Reset all arrays
  ['banks','cards','investments','cash','loans','friends','sims','assets','expenses','emails','gadgets','digital','vehicles','documents','bc','bonds'].forEach(k => { S[k]=[]; });

  // ── Alex Khan — UK-based Pakistani professional (full demo) ──
  S.user.name = 'Alex Khan';
  S.user.currency = 'GBP';
  S.user.avatar = '👨‍💼';
  S.user.theme = 'dark';
  S.user.email = 'alex.khan@gmail.com';
  S.user.phone = '+44 7700 123456';
  S.user.dob = '1988-04-15';
  S.user.nwHistory = [
    {v:42000,d:'2025-12-01'},{v:44500,d:'2026-01-01'},{v:43800,d:'2026-02-01'},
    {v:46200,d:'2026-03-01'},{v:47800,d:'2026-04-01'},{v:51200,d:'2026-05-01'}
  ];

  // Banks (6) — stable IDs so cards link by linkedBankId
  const bankBarclays = id();
  const bankMonzo = id();
  const bankLloyds = id();
  const bankHbl = id();
  const bankMcb = id();
  const bankEnbd = id();
  S.banks.push({id:bankBarclays,bankName:'Barclays',country:'GB',bankType:'commercial',accountType:'Current',currency:'GBP',last4:'4821',balance:8450,holderName:'Alex Khan',tags:['Primary','UK'],favorite:true,createdAt:ts});
  S.banks.push({id:bankMonzo,bankName:'Monzo',country:'GB',bankType:'digital',accountType:'Current',currency:'GBP',last4:'7732',balance:3120,holderName:'Alex Khan',tags:['Digital'],createdAt:ts});
  S.banks.push({id:bankLloyds,bankName:'Lloyds Bank',country:'GB',bankType:'commercial',accountType:'Savings',currency:'GBP',last4:'5519',balance:22000,holderName:'Alex Khan',tags:['Savings'],createdAt:ts});
  S.banks.push({id:bankHbl,bankName:'HBL',country:'PK',bankType:'commercial',accountType:'Current',currency:'PKR',last4:'3310',balance:680000,holderName:'Alex Khan',tags:['Pakistan','Family'],createdAt:ts});
  S.banks.push({id:bankMcb,bankName:'MCB Bank',country:'PK',bankType:'commercial',accountType:'Savings',currency:'PKR',last4:'9901',balance:1250000,holderName:'Alex Khan',tags:['Pakistan','Savings'],createdAt:ts});
  S.banks.push({id:bankEnbd,bankName:'Emirates NBD',country:'AE',bankType:'commercial',accountType:'Savings',currency:'AED',last4:'6644',balance:18500,holderName:'Alex Khan',tags:['UAE'],createdAt:ts});

  // Cards — every bank linked; mix Standard / Digital / Virtual / Gold / Premium / Infinity / World Elite
  const _card = (o) => ({
    id: id(),
    holderName: 'ALEX KHAN',
    createdAt: ts,
    linkedBankId: o.bankId,
    linkedBank: o.bankName,
    cardName: o.cardName,
    network: o.network,
    cardType: o.cardType,
    category: o.category,
    country: o.country,
    last4: o.last4,
    expiry: o.expiry,
    currency: o.currency,
    limit: o.limit || 0,
    rewardsProgram: o.rewardsProgram || '',
    rewardsPoints: o.rewardsPoints || 0,
    annualFee: o.annualFee || 0,
    favorite: !!o.favorite,
    notes: o.notes || '',
    tags: o.tags || [],
  });
  S.cards.push(
    // Barclays
    _card({bankId:bankBarclays,bankName:'Barclays',cardName:'Barclays Visa Debit',network:'Visa',cardType:'Debit',category:'Standard',country:'GB',last4:'4821',expiry:'09/28',currency:'GBP',favorite:true}),
    _card({bankId:bankBarclays,bankName:'Barclays',cardName:'Barclaycard Avios Mastercard',network:'Mastercard',cardType:'Credit',category:'Rewards',country:'GB',last4:'3391',expiry:'04/27',currency:'GBP',limit:8000,rewardsProgram:'Avios',rewardsPoints:42000}),
    // Monzo — digital + small virtual
    _card({bankId:bankMonzo,bankName:'Monzo',cardName:'Monzo Visa Debit',network:'Visa',cardType:'Debit',category:'Digital',country:'GB',last4:'7732',expiry:'11/28',currency:'GBP'}),
    _card({bankId:bankMonzo,bankName:'Monzo',cardName:'Monzo Virtual Card',network:'Visa',cardType:'Virtual',category:'Virtual',country:'GB',last4:'9014',expiry:'11/28',currency:'GBP',notes:'Small virtual card for online spend'}),
    // Lloyds — premium platinum
    _card({bankId:bankLloyds,bankName:'Lloyds Bank',cardName:'Lloyds Platinum Mastercard',network:'Mastercard',cardType:'Credit',category:'Premium',country:'GB',last4:'5519',expiry:'02/29',currency:'GBP',limit:12000,annualFee:32}),
    // HBL — standard, gold, infinity, world elite
    _card({bankId:bankHbl,bankName:'HBL',cardName:'HBL Visa Debit',network:'Visa',cardType:'Debit',category:'Standard',country:'PK',last4:'3310',expiry:'07/27',currency:'PKR'}),
    _card({bankId:bankHbl,bankName:'HBL',cardName:'HBL Gold Mastercard',network:'Mastercard',cardType:'Credit',category:'Gold',country:'PK',last4:'8842',expiry:'08/28',currency:'PKR',limit:500000,annualFee:5000}),
    _card({bankId:bankHbl,bankName:'HBL',cardName:'HBL Meezan Infinity Visa',network:'Visa',cardType:'Credit',category:'Islamic',country:'PK',last4:'6620',expiry:'03/29',currency:'PKR',limit:1500000,annualFee:12000,notes:'Infinity tier — lounge + travel'}),
    _card({bankId:bankHbl,bankName:'HBL',cardName:'HBL Premier World Elite',network:'Mastercard',cardType:'Credit',category:'Premium',country:'PK',last4:'1108',expiry:'12/28',currency:'PKR',limit:2500000,annualFee:25000,favorite:true,notes:'World Elite — concierge + airport lounge'}),
    // MCB — gold
    _card({bankId:bankMcb,bankName:'MCB Bank',cardName:'MCB Gold Credit',network:'Mastercard',cardType:'Credit',category:'Gold',country:'PK',last4:'4477',expiry:'06/28',currency:'PKR',limit:750000,annualFee:6000}),
    // Emirates NBD — gold + premium
    _card({bankId:bankEnbd,bankName:'Emirates NBD',cardName:'ENBD Go4it Gold Visa',network:'Visa',cardType:'Credit',category:'Gold',country:'AE',last4:'2290',expiry:'05/28',currency:'AED',limit:40000,rewardsProgram:'Skywards',rewardsPoints:18500}),
    _card({bankId:bankEnbd,bankName:'Emirates NBD',cardName:'ENBD Infinite Mastercard',network:'Mastercard',cardType:'Credit',category:'Premium',country:'AE',last4:'7781',expiry:'01/29',currency:'AED',limit:120000,annualFee:1500,notes:'Premium infinite tier'})
  );

  // Cash (3)
  S.cash.push({id:id(),label:'Home Safe',location:'Home',amount:15000,currency:'PKR',notes:'Emergency PKR',createdAt:ts});
  S.cash.push({id:id(),label:'Wallet',location:'Wallet',amount:180,currency:'GBP',createdAt:ts});
  S.cash.push({id:id(),label:'Office Drawer',location:'Office',amount:25000,currency:'PKR',createdAt:ts});

  // Investments (6)
  S.investments.push({id:id(),investmentName:'Vanguard S&P 500 ETF',broker:'Hargreaves Lansdown',type:'Stocks',ticker:'VUSA',country:'GB',currency:'GBP',amountInvested:12000,currentValue:15840,riskLevel:'Medium',ownership:'personal',tags:['ISA','Index'],createdAt:ts});
  S.investments.push({id:id(),investmentName:'Bitcoin',broker:'Coinbase',type:'Crypto',ticker:'BTC',country:'GB',currency:'USD',amountInvested:3500,currentValue:6720,riskLevel:'High',ownership:'personal',tags:['Crypto'],createdAt:ts});
  S.investments.push({id:id(),investmentName:'Meezan Islamic Fund',broker:'Al Meezan Investments',type:'Mutual Funds',country:'PK',currency:'PKR',amountInvested:500000,currentValue:578000,riskLevel:'Low',ownership:'personal',tags:['Islamic'],createdAt:ts});
  S.investments.push({id:id(),investmentName:'UK Premium Bonds',broker:'NS&I',type:'Bonds',country:'GB',currency:'GBP',amountInvested:5000,currentValue:5000,riskLevel:'Low',ownership:'personal',tags:['NSANDI'],createdAt:ts});
  S.investments.push({id:id(),investmentName:'Tesla Inc',broker:'Trading 212',type:'Stocks',ticker:'TSLA',country:'GB',currency:'GBP',amountInvested:2200,currentValue:1980,riskLevel:'High',ownership:'personal',tags:['GIA'],createdAt:ts});
  S.investments.push({id:id(),investmentName:'iShares Gold ETF',broker:'Hargreaves Lansdown',type:'Stocks',ticker:'SGLN',country:'GB',currency:'GBP',amountInvested:3000,currentValue:3510,riskLevel:'Low',ownership:'personal',tags:['Commodities','ISA'],createdAt:ts});

  // Loans (4: 2 lent, 2 borrowed)
  S.loans.push({id:id(),person:'Usman Malik',type:'lent',amount:2500,currency:'GBP',status:'Active',date:'2025-09-10',dueDate:'2026-09-10',notes:'For car repairs',createdAt:ts});
  S.loans.push({id:id(),person:'Tariq (Brother)',type:'lent',amount:350000,currency:'PKR',status:'Active',date:'2025-06-01',dueDate:'2026-06-01',notes:'Business loan',createdAt:ts});
  S.loans.push({id:id(),person:'Barclays Mortgage',type:'borrowed',amount:185000,currency:'GBP',status:'Active',date:'2021-03-15',dueDate:'2046-03-15',notes:'Home mortgage — monthly £920',createdAt:ts});
  S.loans.push({id:id(),person:'HSBC Personal Loan',type:'borrowed',amount:8000,currency:'GBP',status:'Active',date:'2024-07-01',dueDate:'2027-07-01',notes:'Home renovation — £250/month',createdAt:ts});

  // Documents (5) — mix of expiring and not
  S.documents.push({id:id(),docType:'passport',docNumber:'P12345678',issuingCountry:'United Kingdom',nationality:'British',holderName:'Alex Khan',dob:'1988-04-15',issueDate:'2019-06-10',expiryDate:'2029-06-10',storageLocation:'Home safe',notes:'',tags:[],frontPhoto:'',backPhoto:'',createdAt:ts});
  S.documents.push({id:id(),docType:'nic',docNumber:'42301-7890123-4',issuingCountry:'Pakistan',holderName:'Alex Khan',dob:'1988-04-15',issueDate:'2018-03-01',expiryDate:daysFromNow(43),storageLocation:'Wallet',notes:'Expiring soon — renew at NADRA',tags:['urgent'],frontPhoto:'',backPhoto:'',createdAt:ts});
  S.documents.push({id:id(),docType:'driving_license',docNumber:'KHANA880415AX9XM',issuingCountry:'United Kingdom',holderName:'Alex Khan',dob:'1988-04-15',issueDate:'2010-05-20',expiryDate:'2030-04-15',vehicleCategories:'B',storageLocation:'Wallet',notes:'',tags:[],frontPhoto:'',backPhoto:'',createdAt:ts});
  S.documents.push({id:id(),docType:'visa',docNumber:'GBR-2024-78923',visaType:'Indefinite Leave to Remain',issuingCountry:'United Kingdom',holderName:'Alex Khan',issueDate:'2020-01-15',expiryDate:'',validEntries:'ILR — no expiry',linkedPassportNum:'P12345678',storageLocation:'Home safe',notes:'',tags:['ILR'],frontPhoto:'',backPhoto:'',createdAt:ts});
  S.documents.push({id:id(),docType:'nic',docNumber:'NI WC 12 34 56 A',issuingCountry:'United Kingdom',holderName:'Alex Khan',dob:'1988-04-15',issueDate:'2006-09-01',expiryDate:'',storageLocation:'Home safe',notes:'National Insurance card',tags:['NI'],frontPhoto:'',backPhoto:'',createdAt:ts});

  // Assets (3)
  S.assets.push({id:id(),name:'London Flat — East Ham',assetType:'property',currentValue:340000,currency:'GBP',purchasePrice:265000,purchaseDate:'2021-03-15',notes:'Primary residence. 2BR flat.',createdAt:ts});
  S.assets.push({id:id(),name:'Toyota Hilux (2022)',assetType:'vehicle',currentValue:22000,currency:'GBP',purchasePrice:28000,notes:'Paid off in 2025.',createdAt:ts});
  S.assets.push({id:id(),name:'MacBook Pro 16" M4',assetType:'gadget',currentValue:2800,currency:'GBP',purchasePrice:3499,notes:'Work machine.',createdAt:ts});

  // Vehicles (1) — MOT due in 60 days
  S.vehicles.push({id:id(),make:'Toyota',model:'Hilux',year:'2022',regPlate:'EH22 KHN',fuel:'Diesel',mileage:38000,motExpiry:daysFromNow(60),taxExpiry:daysFromNow(28),insuranceExpiry:daysFromNow(92),insuranceProvider:'Admiral',createdAt:ts});

  // SIMs (2)
  S.sims.push({id:id(),network:'O2',country:'GB',simType:'Physical',status:'Active',phone:'+44 7700 123456',dataPlan:30,planType:'Monthly',createdAt:ts});
  S.sims.push({id:id(),network:'Jazz',country:'PK',simType:'Physical',status:'Active',phone:'+92 300 1234567',dataPlan:10,planType:'Monthly',createdAt:ts});

  // Expenses (4)
  S.expenses.push({id:id(),name:'Netflix',amount:17.99,currency:'GBP',category:'Streaming',frequency:'monthly',active:true,createdAt:ts});
  S.expenses.push({id:id(),name:'PureGym',amount:22.99,currency:'GBP',category:'Fitness',frequency:'monthly',active:true,createdAt:ts});
  S.expenses.push({id:id(),name:'Council Tax',amount:142,currency:'GBP',category:'Housing',frequency:'monthly',active:true,createdAt:ts});
  S.expenses.push({id:id(),name:'O2 Phone Bill',amount:35,currency:'GBP',category:'Telecom',frequency:'monthly',active:true,createdAt:ts});

  // Friends (3)
  S.friends.push({id:id(),name:'Usman Malik',phone:'+44 7700 987654',notes:'Old uni friend, Manchester',createdAt:ts});
  S.friends.push({id:id(),name:'Tariq Khan',phone:'+92 321 9876543',notes:'Brother — in Lahore',createdAt:ts});
  S.friends.push({id:id(),name:'Sophie Williams',phone:'+44 7800 234567',notes:'Work colleague',createdAt:ts});

  // BC / Committees (2)
  S.bc.push({id:id(),name:'Family BC 2026',role:'participant',type:'ballot',members:10,contribution:10000,currency:'PKR',frequency:'monthly',totalRounds:10,myTurnRound:7,currentRound:4,startDate:'2026-01-01',paymentDay:5,organiser:'Ammi',notes:'Family rotating committee',memberList:[],paymentHistory:[],createdAt:ts,updatedAt:ts});
  S.bc.push({id:id(),name:'Office Pardner',role:'participant',type:'ballot',members:6,contribution:200,currency:'GBP',frequency:'monthly',totalRounds:6,myTurnRound:3,currentRound:2,startDate:'2026-04-01',paymentDay:1,organiser:'James (PM)',notes:'Office savings committee',memberList:[],paymentHistory:[],createdAt:ts,updatedAt:ts});

  // Prize Bonds (2)
  S.bonds.push({id:id(),name:'Prize Bond PKR 7500',typeId:'prize_bond',quantity:5,faceValue:7500,amount:7500,currency:'PKR',country:'PK',purchaseDate:'2025-01-10',maturityDate:'',annualRate:0,bondNumbers:['PB-001234','PB-001235','PB-001236','PB-001237','PB-001238'],notes:'Bought in Lahore',createdAt:ts,updatedAt:ts});
  S.bonds.push({id:id(),name:'UK Premium Bonds',typeId:'premium_bonds',quantity:500,faceValue:1,amount:1,currency:'GBP',country:'GB',purchaseDate:'2023-06-01',maturityDate:'',annualRate:0,bondNumbers:[],notes:'NS&I — eligible for monthly prize draw',createdAt:ts,updatedAt:ts});

  // Emails (2)
  S.emails.push({id:id(),email:'alex.khan@gmail.com',provider:'Gmail',purpose:'Personal',mfaEnabled:true,recoveryEmail:'tariq.khan@gmail.com',createdAt:ts});
  S.emails.push({id:id(),email:'a.khan@techcorp.co.uk',provider:'Microsoft 365',purpose:'Work',mfaEnabled:true,createdAt:ts});

  // Gadgets (2)
  S.gadgets.push({id:id(),name:'MacBook Pro 16" M4 Max',brand:'Apple',category:'Laptop',serialNum:'C02Z9ABCDE12',purchasePrice:3499,currency:'GBP',warranty:'2027-01',purchaseDate:'2025-01-15',insured:true,createdAt:ts});
  S.gadgets.push({id:id(),name:'iPhone 16 Pro Max',brand:'Apple',category:'Phone',serialNum:'F7X8K9M2P5',purchasePrice:1199,currency:'GBP',warranty:'2026-10',purchaseDate:'2024-10-05',insured:true,createdAt:ts});

  // Digital logins (2)
  S.digital.push({id:id(),serviceName:'LinkedIn',username:'alexkhan88',url:'linkedin.com',category:'Professional',mfaEnabled:true,passwordStrength:'strong',createdAt:ts});
  S.digital.push({id:id(),serviceName:'Barclays Online Banking',username:'alexkhan',url:'barclays.co.uk',category:'Banking',mfaEnabled:true,passwordStrength:'strong',createdAt:ts});

  // Precious metals demo (encrypted vault)
  S.assets.push(
    {id:id(),assetType:'precious_metals',name:'Gold Jewellery Set',metal:'gold',weight:5,unit:'tola',purity:'22k',notes:'Wife\'s jewellery',createdAt:ts,updatedAt:ts},
    {id:id(),assetType:'precious_metals',name:'Gold Bars',metal:'gold',weight:10,unit:'tola',purity:'24k',notes:'Investment — stored at home',createdAt:ts,updatedAt:ts}
  );
  if (typeof VaultMeta !== 'undefined') {
    VaultMeta.set('creditScore', {
      score:742,agency:'Experian',lastChecked:daysAgo(45),
      history:[{score:698,date:'2025-09-01'},{score:715,date:'2025-12-01'},{score:742,date:'2026-03-01'}]
    });
    VaultMeta.set('zakatState', { nisabType:'silver',hawlDate:daysAgo(250),includeJewellery:true,mode:'personal' });
  }

  S.user.netWorth = 0;
  S.user.lastBackup = daysAgo(3); // Recent backup → +20 to security score
  S.autoLock = true;
  S.lockMins = 5;
  S.decoyPin = '0000'; // Demo decoy → +8 to security score
  S.emergency = { enabled: true, name: 'Alex Khan', contact: '+44 7700 123456', notes: 'Keep calm and call family' };

  // Seed realistic activity history for demo
  const ago = (mins) => new Date(Date.now() - mins * 60000).toISOString();
  S.activity = [
    { id: Date.now()-1, a: 'Added Vanguard S&P 500 ETF investment', d: '', t: ago(12) },
    { id: Date.now()-2, a: 'Added Barclays mortgage loan', d: '', t: ago(45) },
    { id: Date.now()-3, a: 'Added Bitcoin investment', d: '', t: ago(90) },
    { id: Date.now()-4, a: 'Added Barclays bank account', d: '', t: ago(180) },
    { id: Date.now()-5, a: 'Added UK passport document', d: '', t: ago(360) },
    { id: Date.now()-6, a: 'Vault created', d: '', t: ago(720) },
  ];

  // Family vault (3 members) + link sample assets to owners
  const headId = id();
  const spouseId = id();
  const childId = id();
  S.familyMembers = [
    { id: headId, name: 'Alex Khan', avatar: 'AK', relation: 'Head of Family', isHead: true, role: 'admin', dob: '1988-04-15', phone: '+44 7700 123456', email: 'alex.khan@gmail.com', notes: 'Primary account holder', createdAt: ts, updatedAt: ts },
    { id: spouseId, name: 'Sara Khan', avatar: 'SK', relation: 'Spouse', isHead: false, role: 'viewer', phone: '+44 7700 654321', notes: 'Joint finances', createdAt: ts, updatedAt: ts },
    { id: childId, name: 'Ayaan Khan', avatar: 'AK', relation: 'Son', isHead: false, role: 'viewer', dob: '2015-08-22', notes: 'Junior ISA', createdAt: ts, updatedAt: ts },
  ];
  S.banks.forEach((b, i) => { b.ownerId = i < 3 ? headId : (i < 5 ? spouseId : headId); });
  S.cards.forEach((c, i) => { c.ownerId = i < 7 ? headId : spouseId; });
  S.cash.forEach((c, i) => { c.ownerId = i === 0 ? headId : spouseId; });
  S.investments.forEach((inv, i) => { inv.ownerId = i < 4 ? headId : spouseId; });
  S.assets.forEach((a, i) => { a.ownerId = i < 2 ? headId : spouseId; });
  S.loans.forEach((l, i) => { l.ownerId = headId; });

  Store.save();
  if (S.unlocked) { buildNav(); R.goto('dashboard'); }
}



// ===================== LARGE TEXT =====================
