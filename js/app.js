const THEMES=[
  {id:'dark',     n:'Midnight',  g:'dark',  bg:'#080808', ac:'#0080ff', gl:'rgba(0,128,255,.2)',    cls:''},
  {id:'ocean',    n:'Ocean',     g:'dark',  bg:'#04101e', ac:'#0ea5e9', gl:'rgba(14,165,233,.2)',   cls:'ocean'},
  {id:'forest',   n:'Forest',    g:'dark',  bg:'#040e08', ac:'#10b981', gl:'rgba(16,185,129,.2)',   cls:'forest'},
  {id:'aurora',   n:'Aurora',    g:'dark',  bg:'#08040e', ac:'#d946ef', gl:'rgba(217,70,239,.2)',   cls:'aurora'},
  {id:'ironman',  n:'Iron Man',  g:'bold',  bg:'#050200', ac:'#ff6b00', gl:'rgba(255,107,0,.2)',    cls:'ironman'},
  {id:'light',    n:'Light',     g:'light', bg:'#f5f5f7', ac:'#0080ff', gl:'rgba(0,128,255,.12)',   cls:'light'},
  {id:'rosegold', n:'Rose Gold', g:'dark',  bg:'#1a0f0e', ac:'#e8a598', gl:'rgba(232,165,152,.2)', cls:'rosegold'},
  {id:'titanium', n:'Titanium',  g:'dark',  bg:'#0d0f11', ac:'#b4bcc8', gl:'rgba(180,188,200,.15)',cls:'titanium'},
];

const ALL_MODULES=[
  {id:'banks',  n:'Banks',       ic:'🏦', desc:'Accounts, IBAN, login details',      group:'Finance'},
  {id:'cards',  n:'Cards',       ic:'💳', desc:'Debit, credit, crypto & BNPL',       group:'Finance'},
  {id:'investments',n:'Investments',ic:'📈',desc:'Stocks, funds, bonds, crypto',      group:'Finance'},
  {id:'cash',    n:'Cash',        ic:'💵', desc:'Physical cash by location',          group:'Finance'},
  {id:'loans',   n:'Loans',       ic:'🤝', desc:'Money lent & borrowed',              group:'Finance'},
  {id:'expenses',n:'Expenses',   ic:'📋', desc:'Subscriptions & recurring bills',    group:'Finance'},
  {id:'assets', n:'Assets',      ic:'🏠', desc:'Property, vehicles, valuables',      group:'Assets'},
  {id:'friends', n:'Friends',     ic:'👥', desc:'Contacts & people',                  group:'Identity'},
  {id:'sims',   n:'SIM Cards',   ic:'📱', desc:'Mobile numbers & networks',          group:'Identity'},
  {id:'documents',n:'Documents',ic:'🪪', desc:'IDs, passports, visas, contracts',   group:'Identity'},
  {id:'emails', n:'Emails',      ic:'📧', desc:'All email identities & security',    group:'Identity'},
  {id:'gadgets',n:'Gadgets',     ic:'💻', desc:'Devices, IMEI, warranty',            group:'Identity'},
  {id:'digital',n:'Digital',     ic:'💼', desc:'Logins, wallets, social media',      group:'Identity'},
  {id:'vehicles',n:'Vehicles',   ic:'🚗', desc:'Cars, fuel, service, insurance',     group:'Assets'},
  {id:'reminders',  n:'Reminders',  ic:'🔔', desc:'Expiry alerts & upcoming dues',      group:'Tools'},
  {id:'ai-import',  n:'AI Import',  ic:'🤖', desc:'Smart pattern-matching data import', group:'Tools'},
  {id:'trash',      n:'Trash',      ic:'🗑️', desc:'Deleted items — restore or purge',    group:'Tools'},
];

const COUNTRIES=[
  {c:'PK',n:'Pakistan',f:'🇵🇰',p:'+92'},{c:'GB',n:'United Kingdom',f:'🇬🇧',p:'+44'},
  {c:'AE',n:'UAE',f:'🇦🇪',p:'+971'},{c:'US',n:'United States',f:'🇺🇸',p:'+1'},
  {c:'CA',n:'Canada',f:'🇨🇦',p:'+1'},{c:'AU',n:'Australia',f:'🇦🇺',p:'+61'},
  {c:'SG',n:'Singapore',f:'🇸🇬',p:'+65'},{c:'IN',n:'India',f:'🇮🇳',p:'+91'},
  {c:'SA',n:'Saudi Arabia',f:'🇸🇦',p:'+966'},{c:'QA',n:'Qatar',f:'🇶🇦',p:'+974'},
  {c:'OTHER',n:'Other',f:'🌐',p:'+0'},
];

const CURRENCIES=['PKR','GBP','USD','AED','EUR','SAR','CAD','AUD','SGD','INR','QAR','BTC','ETH','USDT'];

const BANKS_DB=[
  {n:'HBL',c:'PK',t:'commercial'},{n:'UBL',c:'PK',t:'commercial'},{n:'MCB Bank',c:'PK',t:'commercial'},
  {n:'Bank Alfalah',c:'PK',t:'commercial'},{n:'Allied Bank',c:'PK',t:'commercial'},{n:'Askari Bank',c:'PK',t:'commercial'},
  {n:'Meezan Bank',c:'PK',t:'islamic'},{n:'Bank Islami',c:'PK',t:'islamic'},{n:'Faysal Bank',c:'PK',t:'islamic'},
  {n:'Zindigi',c:'PK',t:'digital'},{n:'Sadapay',c:'PK',t:'digital'},{n:'NayaPay',c:'PK',t:'digital'},
  {n:'JazzCash',c:'PK',t:'microfinance'},{n:'EasyPaisa',c:'PK',t:'microfinance'},
  {n:'NBP',c:'PK',t:'government'},{n:'Bank of Punjab',c:'PK',t:'government'},
  {n:'HSBC',c:'GB',t:'commercial'},{n:'Barclays',c:'GB',t:'commercial'},{n:'NatWest',c:'GB',t:'commercial'},
  {n:'Lloyds Bank',c:'GB',t:'commercial'},{n:'Santander UK',c:'GB',t:'commercial'},{n:'Halifax',c:'GB',t:'commercial'},
  {n:'Nationwide',c:'GB',t:'commercial'},{n:'TSB Bank',c:'GB',t:'commercial'},{n:'Metro Bank',c:'GB',t:'commercial'},
  {n:'Monzo',c:'GB',t:'digital'},{n:'Starling Bank',c:'GB',t:'digital'},{n:'Revolut',c:'GB',t:'digital'},
  {n:'Wise',c:'GB',t:'international'},{n:'Chase UK',c:'GB',t:'digital'},{n:'First Direct',c:'GB',t:'digital'},
  {n:'Emirates NBD',c:'AE',t:'commercial'},{n:'ADCB',c:'AE',t:'commercial'},{n:'FAB',c:'AE',t:'commercial'},
  {n:'Mashreq Bank',c:'AE',t:'commercial'},{n:'RAKBANK',c:'AE',t:'commercial'},
  {n:'Dubai Islamic Bank',c:'AE',t:'islamic'},{n:'ADIB',c:'AE',t:'islamic'},
  {n:'Mashreq Neo',c:'AE',t:'digital'},{n:'Liv.',c:'AE',t:'digital'},{n:'Wio Bank',c:'AE',t:'digital'},
  {n:'Chase',c:'US',t:'commercial'},{n:'Bank of America',c:'US',t:'commercial'},{n:'Wells Fargo',c:'US',t:'commercial'},
  {n:'Citibank',c:'US',t:'commercial'},{n:'Capital One',c:'US',t:'commercial'},
  {n:'Bank Al Habib',c:'PK',t:'commercial'},{n:'Habib Metro Bank',c:'PK',t:'commercial'},
  {n:'JS Bank',c:'PK',t:'commercial'},{n:'Soneri Bank',c:'PK',t:'commercial'},
  {n:'Standard Chartered PK',c:'PK',t:'international'},{n:'Citibank PK',c:'PK',t:'international'},
  {n:'Dubai Islamic Bank PK',c:'PK',t:'islamic'},{n:'Al Baraka Bank',c:'PK',t:'islamic'},
  {n:'HBL Konnect',c:'PK',t:'digital'},{n:'UMicro',c:'PK',t:'microfinance'},
  {n:'Khushhali MFB',c:'PK',t:'microfinance'},{n:'FINCA MFB',c:'PK',t:'microfinance'},
  {n:'Co-operative Bank',c:'GB',t:'commercial'},{n:'Virgin Money',c:'GB',t:'commercial'},
  {n:'Santander',c:'GB',t:'commercial'},{n:'Atom Bank',c:'GB',t:'digital'},
  {n:'Zopa Bank',c:'GB',t:'digital'},{n:'Bunq',c:'GB',t:'digital'},
  {n:'Monese',c:'GB',t:'digital'},{n:'Cashplus',c:'GB',t:'digital'},
  {n:'HSBC Kinetic',c:'GB',t:'digital'},{n:'Lloyds Business',c:'GB',t:'commercial'},
  {n:'National Bank of Ras Al-Khaimah',c:'AE',t:'commercial'},{n:'Commercial Bank of Dubai',c:'AE',t:'commercial'},
  {n:'United Arab Bank',c:'AE',t:'commercial'},{n:'Ajman Bank',c:'AE',t:'islamic'},
  {n:'Sharjah Islamic Bank',c:'AE',t:'islamic'},{n:'Alinma Bank',c:'AE',t:'islamic'},
  {n:'Al Rajhi Bank',c:'SA',t:'islamic'},{n:'Saudi National Bank',c:'SA',t:'commercial'},
  {n:'Riyad Bank',c:'SA',t:'commercial'},{n:'Saudi British Bank (SABB)',c:'SA',t:'commercial'},
  {n:'HDFC Bank',c:'IN',t:'commercial'},{n:'ICICI Bank',c:'IN',t:'commercial'},
  {n:'State Bank of India',c:'IN',t:'government'},{n:'Axis Bank',c:'IN',t:'commercial'},
  {n:'DBS Bank',c:'SG',t:'commercial'},{n:'OCBC',c:'SG',t:'commercial'},
  {n:'Maybank',c:'MY',t:'commercial'},{n:'CIMB',c:'MY',t:'commercial'},
  {n:'Silk Bank',c:'PK',t:'commercial'},{n:'Summit Bank',c:'PK',t:'commercial'},
  {n:'First Women Bank',c:'PK',t:'government'},{n:'Bank of Khyber',c:'PK',t:'government'},
  {n:'Zarai Taraqiati Bank',c:'PK',t:'government'},{n:'SME Bank',c:'PK',t:'government'},
  {n:'Industrial Development Bank',c:'PK',t:'government'},{n:'Punjab Provincial Cooperative Bank',c:'PK',t:'cooperative'},
  {n:'MCB Islamic',c:'PK',t:'islamic'},{n:'UBL Ameen',c:'PK',t:'islamic'},{n:'HBL Islamic',c:'PK',t:'islamic'},
  {n:'Deutsche Bank PK',c:'PK',t:'international'},{n:'Taam',c:'PK',t:'microfinance'},
  {n:'U Microfinance',c:'PK',t:'microfinance'},{n:'NRSP',c:'PK',t:'microfinance'},
  {n:'Apna Microfinance',c:'PK',t:'microfinance'},{n:'Akhuwat',c:'PK',t:'microfinance'},
  {n:'Tide',c:'GB',t:'digital'},{n:'Anna Money',c:'GB',t:'digital'},{n:'Zempler',c:'GB',t:'digital'},
  {n:'Kroo',c:'GB',t:'digital'},{n:'Pockit',c:'GB',t:'digital'},{n:'Suits Me',c:'GB',t:'digital'},
  {n:'Chip',c:'GB',t:'digital'},{n:'Plum',c:'GB',t:'digital'},{n:'Tandem',c:'GB',t:'digital'},
  {n:'Cynergy Bank',c:'GB',t:'commercial'},
  {n:'Abu Dhabi Commercial Bank',c:'AE',t:'commercial'},{n:'National Bank of Fujairah',c:'AE',t:'commercial'},
  {n:'Al Hilal Bank',c:'AE',t:'islamic'},{n:'Bank of Sharjah',c:'AE',t:'commercial'},
  {n:'Invest Bank',c:'AE',t:'commercial'},{n:'Finance House',c:'AE',t:'commercial'},
  {n:'Aafaq Islamic',c:'AE',t:'islamic'},
];

const NETWORKS_DB=[
  {n:'Jazz',c:'PK'},{n:'Zong',c:'PK'},{n:'Ufone',c:'PK'},{n:'Telenor PK',c:'PK'},{n:'SCOM',c:'PK'},
  {n:'O2',c:'GB'},{n:'EE',c:'GB'},{n:'Vodafone UK',c:'GB'},{n:'Three UK',c:'GB'},{n:'Sky Mobile',c:'GB'},
  {n:'giffgaff',c:'GB'},{n:'Lebara UK',c:'GB'},{n:'Lyca Mobile',c:'GB'},{n:'Smarty',c:'GB'},
  {n:'Etisalat (e&)',c:'AE'},{n:'du',c:'AE'},{n:'Virgin Mobile UAE',c:'AE'},
  {n:'AT&T',c:'US'},{n:'Verizon',c:'US'},{n:'T-Mobile US',c:'US'},
  {n:'Airalo',c:'OTHER'},{n:'Holafly',c:'OTHER'},{n:'Nomad eSIM',c:'OTHER'},
  {n:'Ubigi',c:'OTHER'},{n:'Saily',c:'OTHER'},{n:'eSIM.me',c:'OTHER'},
  {n:'STC',c:'SA'},{n:'Mobily',c:'SA'},{n:'Zain KSA',c:'SA'},
  {n:'Ooredoo Qatar',c:'QA'},{n:'Vodafone Qatar',c:'QA'},
  {n:'Zain Kuwait',c:'KW'},{n:'Ooredoo Kuwait',c:'KW'},{n:'STC Kuwait',c:'KW'},
  {n:'Jio',c:'IN'},{n:'Airtel IN',c:'IN'},{n:'Vi (Vodafone Idea)',c:'IN'},{n:'BSNL',c:'IN'},
  {n:'Rogers',c:'CA'},{n:'Bell Canada',c:'CA'},{n:'Telus',c:'CA'},
  {n:'Telstra',c:'AU'},{n:'Optus',c:'AU'},{n:'Vodafone AU',c:'AU'},
];

const CARDS_DB=[
  {n:'Amex Centurion (Black)',net:'American Express',cat:'Premium'},
  {n:'Amex Platinum',net:'American Express',cat:'Premium'},
  {n:'Amex Gold',net:'American Express',cat:'Premium'},
  {n:'Amex Blue',net:'American Express',cat:'Standard'},
  {n:'British Airways Amex',net:'American Express',cat:'Travel'},
  {n:'Marriott Bonvoy Amex',net:'American Express',cat:'Travel'},
  {n:'NatWest Debit Visa',net:'Visa',cat:'Debit'},
  {n:'Monzo Debit Visa',net:'Visa',cat:'Debit'},
  {n:'Starling Debit Visa',net:'Visa',cat:'Debit'},
  {n:'Chase Sapphire Reserve',net:'Visa',cat:'Premium'},
  {n:'Wise Debit',net:'Visa',cat:'Debit'},
  {n:'Revolut Premium Visa',net:'Visa',cat:'Premium'},
  {n:'Virgin Atlantic Visa',net:'Visa',cat:'Travel'},
  {n:'Zable Visa',net:'Visa',cat:'Standard'},
  {n:'Barclaycard Mastercard',net:'Mastercard',cat:'Standard'},
  {n:'Aqua Card',net:'Mastercard',cat:'Standard'},
  {n:'Capital One Classic',net:'Mastercard',cat:'Standard'},
  {n:'Tesco Clubcard MC',net:'Mastercard',cat:'Rewards'},
  {n:'Monzo Credit Card',net:'Mastercard',cat:'Standard'},
  {n:'HBL Premier World Elite',net:'Mastercard',cat:'Premium'},
  {n:'HBL Debit Mastercard',net:'Mastercard',cat:'Debit'},
  {n:'UBL Debit Mastercard',net:'Mastercard',cat:'Debit'},
  {n:'Meezan Debit Visa',net:'Visa',cat:'Debit'},
  {n:'Emirates NBD Prestige',net:'Mastercard',cat:'Premium'},
  {n:'FAB Signature Visa',net:'Visa',cat:'Premium'},
  {n:'ADCB Prestige MC',net:'Mastercard',cat:'Premium'},
  {n:'Crypto.com Ruby',net:'Visa',cat:'Crypto'},
  {n:'Crypto.com Jade',net:'Visa',cat:'Crypto'},
  {n:'Crypto.com Obsidian',net:'Visa',cat:'Crypto'},
  {n:'Binance Visa',net:'Visa',cat:'Crypto'},
  {n:'Wirex Visa',net:'Visa',cat:'Crypto'},
  {n:'Klarna Card',net:'Visa',cat:'BNPL'},
  {n:'Clearpay Card',net:'Mastercard',cat:'BNPL'},
  {n:'Tabby Card',net:'Visa',cat:'BNPL'},
  {n:'Meezan Visa Debit',net:'Visa',cat:'Debit'},
  {n:'Bank Alfalah Visa Debit',net:'Visa',cat:'Debit'},
  {n:'Allied Bank MC Debit',net:'Mastercard',cat:'Debit'},
  {n:'UBL Visa Debit',net:'Visa',cat:'Debit'},
  {n:'HBL Platinum MC',net:'Mastercard',cat:'Premium'},
  {n:'HBL Islamic Visa',net:'Visa',cat:'Standard'},
  {n:'Sadapay MC',net:'Mastercard',cat:'Debit'},
  {n:'Zindigi MC',net:'Mastercard',cat:'Debit'},
  {n:'NayaPay Visa',net:'Visa',cat:'Debit'},
  {n:'Bank Al Habib Visa',net:'Visa',cat:'Debit'},
  {n:'Monese MC',net:'Mastercard',cat:'Debit'},
  {n:'Zempler MC',net:'Mastercard',cat:'Debit'},
  {n:'Tide Business Visa',net:'Visa',cat:'Debit'},
  {n:'Kroo Visa',net:'Visa',cat:'Debit'},
  {n:'Anna Business MC',net:'Mastercard',cat:'Debit'},
  {n:'Emirates Islamic Visa',net:'Visa',cat:'Standard'},
  {n:'Al Hilal Islamic Visa',net:'Visa',cat:'Standard'},
  {n:'ADCB Traveller Visa',net:'Visa',cat:'Travel'},
  {n:'Mashreq Neo Visa',net:'Visa',cat:'Debit'},
  {n:'FAB Islamic MC',net:'Mastercard',cat:'Standard'},
];

const BROKERS_DB=['Hargreaves Lansdown','AJ Bell','Trading 212','Freetrade','eToro','Vanguard UK','Sarwa','Baraka','Al Meezan','AKD Securities','JS Global','Binance','Coinbase','Kraken','Bybit','OKX',
  'Rafi Securities','JS Global Capital','Arif Habib Limited','Topline Securities','Alfalah Securities',
  'Next Capital','Sherman Securities','Ismail Iqbal Securities','IGI Securities','KASB Securities',
  'Optimus Capital','Pearl Securities','Vector Securities','CDC Pakistan','UBL Fund Managers',
  'Al Meezan Investments','NBP Funds','MCB Arif Habib Savings','Faysal Asset Management',
  'Atlas Asset Management','HBL Asset Management','NAFA Funds','Meezan Islamic Fund',
  'ABL Asset Management','Lakson Investments'];

// ===================== SMART AUTOCOMPLETE DB =====================
const SMART_DB = {
  banks:[
    {name:'HBL',country:'PK',currency:'PKR',type:'commercial',swift:'HABBPKKA'},
    {name:'Habib Bank Limited',country:'PK',currency:'PKR',type:'commercial',swift:'HABBPKKA'},
    {name:'Meezan Bank',country:'PK',currency:'PKR',type:'islamic',swift:'MEZNPKKA'},
    {name:'UBL',country:'PK',currency:'PKR',type:'commercial',swift:'UNILPKKA'},
    {name:'United Bank Limited',country:'PK',currency:'PKR',type:'commercial',swift:'UNILPKKA'},
    {name:'MCB Bank',country:'PK',currency:'PKR',type:'commercial',swift:'MCIBPKKA'},
    {name:'Bank Alfalah',country:'PK',currency:'PKR',type:'commercial',swift:'ALFHPKKA'},
    {name:'Allied Bank',country:'PK',currency:'PKR',type:'commercial',swift:'ABPAPKKA'},
    {name:'Askari Bank',country:'PK',currency:'PKR',type:'commercial',swift:'ASCMPKKA'},
    {name:'Bank Al Habib',country:'PK',currency:'PKR',type:'commercial',swift:'BAHLPKKA'},
    {name:'Faysal Bank',country:'PK',currency:'PKR',type:'islamic',swift:'FAYSPKKA'},
    {name:'Bank Islami',country:'PK',currency:'PKR',type:'islamic',swift:null},
    {name:'Sadapay',country:'PK',currency:'PKR',type:'digital',swift:null},
    {name:'NayaPay',country:'PK',currency:'PKR',type:'digital',swift:null},
    {name:'Zindigi',country:'PK',currency:'PKR',type:'digital',swift:null},
    {name:'JazzCash',country:'PK',currency:'PKR',type:'microfinance',swift:null},
    {name:'EasyPaisa',country:'PK',currency:'PKR',type:'microfinance',swift:null},
    {name:'NBP',country:'PK',currency:'PKR',type:'government',swift:'NBPKPKKA'},
    {name:'Bank of Punjab',country:'PK',currency:'PKR',type:'government',swift:null},
    {name:'Monzo',country:'GB',currency:'GBP',type:'digital',swift:'MONZGB2L'},
    {name:'Starling Bank',country:'GB',currency:'GBP',type:'digital',swift:'SRLGGB3L'},
    {name:'Revolut',country:'GB',currency:'GBP',type:'digital',swift:'REVOGB21'},
    {name:'Wise',country:'GB',currency:'GBP',type:'digital',swift:'TRWIGB22'},
    {name:'Barclays',country:'GB',currency:'GBP',type:'commercial',swift:'BARCGB22'},
    {name:'HSBC',country:'GB',currency:'GBP',type:'commercial',swift:'MIDLGB22'},
    {name:'NatWest',country:'GB',currency:'GBP',type:'commercial',swift:'NWBKGB2L'},
    {name:'Lloyds Bank',country:'GB',currency:'GBP',type:'commercial',swift:'LOYDGB2L'},
    {name:'Santander UK',country:'GB',currency:'GBP',type:'commercial',swift:'ABBYGB2L'},
    {name:'Emirates NBD',country:'AE',currency:'AED',type:'commercial',swift:'EBILAEAD'},
    {name:'FAB',country:'AE',currency:'AED',type:'commercial',swift:'FABEAEAD'},
    {name:'ADCB',country:'AE',currency:'AED',type:'commercial',swift:'ADCBAEAD'},
    {name:'Mashreq Bank',country:'AE',currency:'AED',type:'commercial',swift:'BOMLAEAD'},
    {name:'ADIB',country:'AE',currency:'AED',type:'islamic',swift:'ADIBAEAA'},
    {name:'Dubai Islamic Bank',country:'AE',currency:'AED',type:'islamic',swift:'DUIBAEAD'},
    {name:'RAKBank',country:'AE',currency:'AED',type:'commercial',swift:'RAKBAEAD'},
    {name:'Chase',country:'US',currency:'USD',type:'commercial',swift:'CHASUS33'},
    {name:'Bank of America',country:'US',currency:'USD',type:'commercial',swift:'BOFAUS3N'},
    {name:'Wells Fargo',country:'US',currency:'USD',type:'commercial',swift:'WFBIUS6S'},
  ],
  cards:[
    {name:'Sadapay Mastercard',network:'Mastercard',type:'Debit',country:'PK',category:'Digital'},
    {name:'Zindigi Mastercard',network:'Mastercard',type:'Debit',country:'PK',category:'Digital'},
    {name:'NayaPay Visa',network:'Visa',type:'Debit',country:'PK',category:'Digital'},
    {name:'HBL Debit Visa',network:'Visa',type:'Debit',country:'PK',category:'Standard'},
    {name:'HBL Credit Mastercard',network:'Mastercard',type:'Credit',country:'PK',category:'Standard'},
    {name:'Meezan Visa Debit',network:'Visa',type:'Debit',country:'PK',category:'Islamic'},
    {name:'Meezan Platinum Visa',network:'Visa',type:'Credit',country:'PK',category:'Islamic'},
    {name:'Bank Alfalah Visa',network:'Visa',type:'Credit',country:'PK',category:'Standard'},
    {name:'UBL Visa Debit',network:'Visa',type:'Debit',country:'PK',category:'Standard'},
    {name:'MCB Visa',network:'Visa',type:'Credit',country:'PK',category:'Standard'},
    {name:'Allied Bank Mastercard',network:'Mastercard',type:'Debit',country:'PK',category:'Standard'},
    {name:'Monzo Visa',network:'Visa',type:'Debit',country:'GB',category:'Digital'},
    {name:'Starling Mastercard',network:'Mastercard',type:'Debit',country:'GB',category:'Digital'},
    {name:'Revolut Visa',network:'Visa',type:'Debit',country:'GB',category:'Digital'},
    {name:'Wise Mastercard',network:'Mastercard',type:'Debit',country:'GB',category:'Digital'},
    {name:'Amex Gold',network:'American Express',type:'Credit',country:'GB',category:'Premium'},
    {name:'Barclays Visa',network:'Visa',type:'Credit',country:'GB',category:'Standard'},
    {name:'HSBC Premier Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Premium'},
    {name:'Emirates NBD Visa',network:'Visa',type:'Credit',country:'AE',category:'Standard'},
    {name:'FAB Mastercard',network:'Mastercard',type:'Credit',country:'AE',category:'Standard'},
    {name:'ADCB Visa',network:'Visa',type:'Credit',country:'AE',category:'Standard'},
    {name:'ADIB Visa',network:'Visa',type:'Debit',country:'AE',category:'Islamic'},
  ],
  sims:[
    {network:'Jazz',country:'PK',prefixes:['300','306','307','308'],type:'Physical'},
    {network:'Telenor Pakistan',country:'PK',prefixes:['340','341','342','343','344','345','346'],type:'Physical'},
    {network:'Ufone',country:'PK',prefixes:['333','331','332'],type:'Physical'},
    {network:'Zong',country:'PK',prefixes:['310','311','312','313','314','315'],type:'Physical'},
    {network:'SCOM',country:'PK',prefixes:['320'],type:'Physical'},
    {network:'EVO',country:'PK',prefixes:[],type:'Physical'},
    {network:'EE',country:'GB',prefixes:['7'],type:'Physical'},
    {network:'O2',country:'GB',prefixes:['7'],type:'Physical'},
    {network:'Vodafone UK',country:'GB',prefixes:['7'],type:'Physical'},
    {network:'Three',country:'GB',prefixes:['7'],type:'Physical'},
    {network:'du',country:'AE',prefixes:['5'],type:'Physical'},
    {network:'Etisalat',country:'AE',prefixes:['5'],type:'Physical'},
    {network:'e&',country:'AE',prefixes:['5'],type:'Physical'},
    {network:'Virgin Mobile AE',country:'AE',prefixes:['5'],type:'Physical'},
    {network:'Lebara UAE',country:'AE',prefixes:['5'],type:'Physical'},
  ],
  investments:[
    {name:'Engro Corporation',ticker:'ENGRO',exchange:'PSX',type:'Stocks',country:'PK',currency:'PKR',broker:''},
    {name:'Lucky Cement',ticker:'LUCK',exchange:'PSX',type:'Stocks',country:'PK',currency:'PKR',broker:''},
    {name:'HBL',ticker:'HBL',exchange:'PSX',type:'Stocks',country:'PK',currency:'PKR',broker:''},
    {name:'MCB Bank',ticker:'MCB',exchange:'PSX',type:'Stocks',country:'PK',currency:'PKR',broker:''},
    {name:'UBL',ticker:'UBL',exchange:'PSX',type:'Stocks',country:'PK',currency:'PKR',broker:''},
    {name:'OGDC',ticker:'OGDC',exchange:'PSX',type:'Stocks',country:'PK',currency:'PKR',broker:''},
    {name:'PPL',ticker:'PPL',exchange:'PSX',type:'Stocks',country:'PK',currency:'PKR',broker:''},
    {name:'PSO',ticker:'PSO',exchange:'PSX',type:'Stocks',country:'PK',currency:'PKR',broker:''},
    {name:'Fauji Fertilizer',ticker:'FFC',exchange:'PSX',type:'Stocks',country:'PK',currency:'PKR',broker:''},
    {name:'Hub Power',ticker:'HUBC',exchange:'PSX',type:'Stocks',country:'PK',currency:'PKR',broker:''},
    {name:'Maple Leaf',ticker:'MLCF',exchange:'PSX',type:'Stocks',country:'PK',currency:'PKR',broker:''},
    {name:'Systems Ltd',ticker:'SYS',exchange:'PSX',type:'Stocks',country:'PK',currency:'PKR',broker:''},
    {name:'TRG Pakistan',ticker:'TRG',exchange:'PSX',type:'Stocks',country:'PK',currency:'PKR',broker:''},
    {name:'K-Electric',ticker:'KEL',exchange:'PSX',type:'Stocks',country:'PK',currency:'PKR',broker:''},
    {name:'Sui Northern',ticker:'SNGP',exchange:'PSX',type:'Stocks',country:'PK',currency:'PKR',broker:''},
    {name:'Lloyds Banking Group',ticker:'LLOY',exchange:'LSE',type:'Stocks',country:'GB',currency:'GBP',broker:''},
    {name:'Barclays',ticker:'BARC',exchange:'LSE',type:'Stocks',country:'GB',currency:'GBP',broker:''},
    {name:'HSBC Holdings',ticker:'HSBA',exchange:'LSE',type:'Stocks',country:'GB',currency:'GBP',broker:''},
    {name:'Al Meezan Islamic Fund',ticker:null,exchange:null,type:'Mutual Funds',country:'PK',currency:'PKR',broker:'Al Meezan Investments'},
    {name:'NBP Income Fund',ticker:null,exchange:null,type:'Mutual Funds',country:'PK',currency:'PKR',broker:'NBP Funds'},
    {name:'UBL Stock Advantage Fund',ticker:null,exchange:null,type:'Mutual Funds',country:'PK',currency:'PKR',broker:'UBL Fund Managers'},
    {name:'Bitcoin',ticker:'BTC',exchange:null,type:'Crypto',country:'',currency:'USD',broker:''},
    {name:'Ethereum',ticker:'ETH',exchange:null,type:'Crypto',country:'',currency:'USD',broker:''},
    {name:'USDT',ticker:'USDT',exchange:null,type:'Crypto',country:'',currency:'USD',broker:''},
  ],
  documents:[
    {name:'Pakistani CNIC',type:'cnic',numberFormat:'00000-0000000-0',hasExpiry:true},
    {name:'Pakistani Passport',type:'passport',numberFormat:'AB1234567',hasExpiry:true},
    {name:'Pakistani Driving Licence',type:'driving_licence',numberFormat:'',hasExpiry:true},
    {name:'NTN',type:'ntn',numberFormat:'0000000-0',hasExpiry:false},
    {name:'UK Passport',type:'passport',numberFormat:'123456789',hasExpiry:true},
    {name:'UK Driving Licence',type:'driving_licence',numberFormat:'',hasExpiry:true},
    {name:'UAE Residence Visa',type:'visa',numberFormat:'',hasExpiry:true},
    {name:'UAE Emirates ID',type:'emirates_id',numberFormat:'784-0000-0000000-0',hasExpiry:true},
    {name:'International Vaccination Card',type:'vaccination',numberFormat:'',hasExpiry:false},
  ],
  // Auto-fill helpers
  fillBank(val) {
    const match = this.banks.find(b => b.name.toLowerCase().includes(val.toLowerCase()));
    if (!match) return;
    setTimeout(() => {
      const cc = document.getElementById('bf-cc'); if (cc) cc.value = match.country;
      const cur = document.getElementById('bf-cur'); if (cur) cur.value = match.currency;
      const type = document.getElementById('bf-type'); if (type) type.value = match.type;
      const swift = document.getElementById('bf-swift'); if (swift && match.swift) swift.value = match.swift;
    }, 50);
  },
  fillCard(val) {
    const match = this.cards.find(c => c.name.toLowerCase().includes(val.toLowerCase()));
    if (!match) return;
    setTimeout(() => {
      const net = document.getElementById('cf-net'); if (net) net.value = match.network;
      const type = document.getElementById('cf-type'); if (type) type.value = match.type;
      const cat = document.getElementById('cf-cat'); if (cat) cat.value = match.category;
      const cc = document.getElementById('cf-cc'); if (cc) cc.value = match.country;
    }, 50);
  },
  fillSim(val) {
    const match = this.sims.find(s => s.network.toLowerCase().includes(val.toLowerCase()));
    if (!match) return;
    setTimeout(() => {
      const cc = document.getElementById('sf-cc'); if (cc) { cc.value = match.country; cc.dispatchEvent(new Event('change')); }
      const pfx = document.getElementById('sf-pfx'); if (pfx) pfx.textContent = U.phone(match.country);
    }, 50);
  },
  fillInv(val) {
    const match = this.investments.find(i => i.name.toLowerCase().includes(val.toLowerCase()) || (i.ticker && i.ticker.toLowerCase() === val.toLowerCase()));
    if (!match) return;
    setTimeout(() => {
      const tick = document.getElementById('if-tick'); if (tick && match.ticker) tick.value = match.ticker;
      const type = document.getElementById('if-type'); if (type) type.value = match.type;
      const cc = document.getElementById('if-cc'); if (cc && match.country) cc.value = match.country;
      const cur = document.getElementById('if-cur'); if (cur) cur.value = match.currency;
      const broker = document.getElementById('if-broker'); if (broker && match.broker) broker.value = match.broker;
    }, 50);
  },
};

const SUBS_DB=[
  {n:'Netflix',c:'Streaming',ic:'🎬'},{n:'Disney+',c:'Streaming',ic:'🏰'},{n:'Amazon Prime',c:'Streaming',ic:'📦'},
  {n:'Apple TV+',c:'Streaming',ic:'🍎'},{n:'YouTube Premium',c:'Streaming',ic:'▶️'},{n:'HBO Max',c:'Streaming',ic:'🎭'},
  {n:'Spotify',c:'Music',ic:'🎵'},{n:'Apple Music',c:'Music',ic:'🎶'},{n:'Tidal',c:'Music',ic:'🌊'},
  {n:'NordVPN',c:'VPN',ic:'🔒'},{n:'ExpressVPN',c:'VPN',ic:'🔒'},{n:'Surfshark',c:'VPN',ic:'🦈'},{n:'ProtonVPN',c:'VPN',ic:'⚛️'},
  {n:'iCloud+',c:'Cloud',ic:'☁️'},{n:'Google One',c:'Cloud',ic:'💾'},{n:'Dropbox',c:'Cloud',ic:'📦'},
  {n:'Microsoft 365',c:'Productivity',ic:'💼'},{n:'Adobe CC',c:'Productivity',ic:'🎨'},{n:'Notion',c:'Productivity',ic:'📝'},
  {n:'1Password',c:'Security',ic:'🔑'},{n:'Bitwarden',c:'Security',ic:'🛡️'},
  {n:'Pure Gym',c:'Fitness',ic:'🏋️'},{n:'David Lloyd',c:'Fitness',ic:'🎾'},{n:'Apple Fitness+',c:'Fitness',ic:'🍎'},{n:'Planet Fitness',c:'Fitness',ic:'🏋️'},
  {n:'PlayStation Plus',c:'Gaming',ic:'🎮'},{n:'Xbox Game Pass',c:'Gaming',ic:'🎮'},{n:'Nintendo Online',c:'Gaming',ic:'🎮'},
  {n:'LinkedIn Premium',c:'Business',ic:'💼'},{n:'ChatGPT Plus',c:'AI',ic:'🤖'},{n:'Claude Pro',c:'AI',ic:'🧠'},
  {n:'Canva Pro',c:'Design',ic:'🎨'},{n:'Figma',c:'Design',ic:'🖌️'},{n:'Grammarly',c:'Tools',ic:'✍️'},
  {n:'FT',c:'News',ic:'📰'},{n:'The Times',c:'News',ic:'📰'},
];

const EMAIL_PROVIDERS=[
  {n:'Gmail',ic:'📧',color:'#ea4335'},{n:'Outlook/Hotmail',ic:'📮',color:'#0078d4'},
  {n:'Apple iCloud Mail',ic:'🍎',color:'#555'},{n:'ProtonMail',ic:'🔒',color:'#6d4aff'},
  {n:'Yahoo Mail',ic:'💜',color:'#720e9e'},{n:'Tutanota',ic:'🛡️',color:'#c63927'},
  {n:'Zoho Mail',ic:'💼',color:'#cc4b00'},{n:'FastMail',ic:'⚡',color:'#2272b2'},
  {n:'Custom Domain',ic:'🌐',color:'#666'},{n:'Other',ic:'📧',color:'#888'},
];

const GADGET_TYPES=[
  {n:'iPhone',ic:'📱',cat:'Phone'},{n:'Android Phone',ic:'📱',cat:'Phone'},{n:'Samsung Galaxy',ic:'📱',cat:'Phone'},
  {n:'iPad',ic:'📲',cat:'Tablet'},{n:'iPad Pro',ic:'📲',cat:'Tablet'},{n:'Android Tablet',ic:'📲',cat:'Tablet'},
  {n:'MacBook Air',ic:'💻',cat:'Laptop'},{n:'MacBook Pro',ic:'💻',cat:'Laptop'},{n:'Windows Laptop',ic:'💻',cat:'Laptop'},
  {n:'iMac',ic:'🖥️',cat:'Desktop'},{n:'Mac Mini',ic:'🖥️',cat:'Desktop'},{n:'Mac Pro',ic:'🖥️',cat:'Desktop'},
  {n:'Apple Watch',ic:'⌚',cat:'Wearable'},{n:'Samsung Watch',ic:'⌚',cat:'Wearable'},{n:'Garmin Watch',ic:'⌚',cat:'Wearable'},
  {n:'AirPods',ic:'🎧',cat:'Audio'},{n:'AirPods Pro',ic:'🎧',cat:'Audio'},{n:'Sony WH-1000XM5',ic:'🎧',cat:'Audio'},
  {n:'PlayStation 5',ic:'🎮',cat:'Gaming'},{n:'Xbox Series X',ic:'🎮',cat:'Gaming'},{n:'Nintendo Switch',ic:'🎮',cat:'Gaming'},
  {n:'Amazon Echo',ic:'📢',cat:'Smart Home'},{n:'Google Nest',ic:'🏠',cat:'Smart Home'},{n:'Apple HomePod',ic:'🔊',cat:'Smart Home'},
  {n:'External SSD',ic:'💾',cat:'Storage'},{n:'External HDD',ic:'💾',cat:'Storage'},{n:'USB Hub',ic:'🔌',cat:'Accessory'},
  {n:'Camera (DSLR)',ic:'📷',cat:'Camera'},{n:'Camera (Mirrorless)',ic:'📷',cat:'Camera'},
  {n:'Router/Mesh',ic:'📡',cat:'Network'},{n:'NAS Drive',ic:'🗄️',cat:'Network'},
];

const DIGITAL_SVCS=['PayPal','Wise','Revolut','Stripe','Crypto.com','Coinbase','Binance','Kraken','Cash App','Monzo','PayPay','Western Union','MoneyGram','Remitly','WorldRemit','Skrill','Neteller','Payoneer','Brex','JazzCash','EasyPaisa','NayaPay','Bybit','OKX'];

const IPHONE_MODELS=['iPhone 16 Pro Max','iPhone 16 Pro','iPhone 16 Plus','iPhone 16','iPhone 15 Pro Max','iPhone 15 Pro','iPhone 15','iPhone 14 Pro Max','iPhone 14 Pro','iPhone 14','iPhone 13 Pro Max','iPhone 13 Pro','iPhone 13','iPhone SE (3rd gen)','iPhone 12 Pro Max','iPhone 12','iPhone 11 Pro Max','iPhone 11'];
const MACBOOK_MODELS=['MacBook Pro 16" M4 Max','MacBook Pro 16" M4 Pro','MacBook Pro 14" M4 Max','MacBook Pro 14" M4 Pro','MacBook Air 15" M3','MacBook Air 13" M3','MacBook Pro 16" M3 Max','MacBook Pro 14" M3','MacBook Air M2 15"','MacBook Air M2 13"','MacBook Pro 13" M2','MacBook Air M1','MacBook Pro 13" M1'];
const SAMSUNG_MODELS=['Galaxy S25 Ultra','Galaxy S25+','Galaxy S25','Galaxy S24 Ultra','Galaxy S24+','Galaxy S24','Galaxy Z Fold 6','Galaxy Z Flip 6','Galaxy A55 5G','Galaxy A35 5G'];
const IPAD_MODELS=['iPad Pro 13" M4','iPad Pro 11" M4','iPad Air 13" M2','iPad Air 11" M2','iPad mini 7','iPad (10th gen)','iPad Pro 12.9" M2','iPad Pro 11" M2'];
const ALL_GADGET_MODELS=[...IPHONE_MODELS,...MACBOOK_MODELS,...SAMSUNG_MODELS,...IPAD_MODELS,'Apple Watch Series 10','Apple Watch Ultra 2','Apple Watch SE (3rd gen)','AirPods Pro (2nd gen)','AirPods 4','AirPods Max','iPad mini 7','PlayStation 5','Xbox Series X','Nintendo Switch OLED','Amazon Echo','Google Nest Hub','Sony WH-1000XM5','Bose QC45'];

const DIGITAL_CATS=['Social Media','Messaging','Email Service','Streaming','Banking / Finance','Shopping / E-commerce','Travel','Developer / Tech','AI Tools','VPN / Security','Cloud Storage','Productivity','Gaming','Health & Fitness','Government / Official','Crypto / Web3','News / Media','Dating','Education','Other'];
const COMMON_SERVICES=['Instagram','Twitter / X','TikTok','Facebook','LinkedIn','Snapchat','WhatsApp','Telegram','Discord','Reddit','Pinterest','YouTube','Twitch','BeReal','Threads','Signal','WeChat','ChatGPT','Claude','Gemini','Midjourney','Copilot','Perplexity','GitHub','GitLab','Vercel','Netlify','AWS','Google Cloud','Heroku','Figma','Canva','Adobe CC','Netflix','Spotify','Apple Music','Amazon','eBay','AliExpress','Noon','Namshi','Shopify','Etsy','PayPal','Stripe','Revolut','Wise','Binance','Coinbase','Kraken','OpenSea','Google','Apple ID','Microsoft','Dropbox','OneDrive','Notion','Trello','Slack','Zoom','Expedia','Booking.com','Airbnb','Uber','Lyft','Careem','Deliveroo','Just Eat','Uber Eats','Duolingo','Coursera','Udemy'];

const WORKSPACE_PRESETS={
  default:{name:'Default',ic:'🏠',desc:'All modules enabled',modules:{banks:true,cards:true,investments:true,sims:true,assets:true,expenses:true,emails:true,gadgets:true,digital:true,import:true,timeline:true,security:true,backup:true,recovery:true,workspace:true}},
  minimal:{name:'Minimal',ic:'⚡',desc:'Cards, expenses, SIMs only',modules:{banks:true,cards:true,investments:false,sims:true,assets:false,expenses:true,emails:false,gadgets:false,digital:false,import:false,timeline:true,security:true,backup:true,recovery:true,workspace:true}},
  finance:{name:'Finance Pro',ic:'💰',desc:'Banks, cards, investments, expenses',modules:{banks:true,cards:true,investments:true,sims:false,assets:true,expenses:true,emails:false,gadgets:false,digital:true,import:true,timeline:true,security:true,backup:true,recovery:true,workspace:true}},
  traveler:{name:'Traveler',ic:'✈️',desc:'Cards, SIMs, documents, emails',modules:{banks:true,cards:true,investments:false,sims:true,assets:true,expenses:true,emails:true,gadgets:true,digital:false,import:true,timeline:true,security:true,backup:true,recovery:true,workspace:true}},
  privacy:{name:'Privacy First',ic:'🔒',desc:'Essential modules only, no import/tools',modules:{banks:true,cards:true,investments:false,sims:true,assets:false,expenses:true,emails:true,gadgets:false,digital:true,import:false,timeline:false,security:true,backup:true,recovery:true,workspace:true}},
  business:{name:'Business',ic:'🏢',desc:'Full suite for professionals',modules:{banks:true,cards:true,investments:true,sims:true,assets:true,expenses:true,emails:true,gadgets:true,digital:true,import:true,timeline:true,security:true,backup:true,recovery:true,workspace:true}},
  family:{name:'Family',ic:'👨‍👩‍👧',desc:'Assets, subscriptions, documents',modules:{banks:true,cards:true,investments:false,sims:true,assets:true,expenses:true,emails:true,gadgets:true,digital:false,import:false,timeline:true,security:true,backup:true,recovery:true,workspace:true}},
};

const DOC_SCHEMAS = {
  passport:{
    label:'Passport',ic:'📘',
    fields:[
      {id:'docNumber',label:'Passport Number',ph:'e.g. AB1234567'},
      {id:'issuingCountry',label:'Issuing Country',ph:'e.g. United Kingdom'},
      {id:'nationality',label:'Nationality',ph:'e.g. British'},
      {id:'holderName',label:'Full Name (as printed)',ph:'Full name on passport'},
      {id:'dob',label:'Date of Birth',type:'date'},
      {id:'issueDate',label:'Issue Date',type:'date'},
      {id:'expiryDate',label:'Expiry Date',type:'date'},
      {id:'issuingAuthority',label:'Issuing Authority',ph:'Passport Office'},
      {id:'mrzLine',label:'MRZ Line (optional)',ph:'Machine readable zone line 1'},
      {id:'storageLocation',label:'Physical Storage',ph:'Safe, drawer, wallet...'},
    ]
  },
  nic:{
    label:'National ID',ic:'🪪',
    fields:[
      {id:'docNumber',label:'ID Number',ph:'National ID number'},
      {id:'issuingCountry',label:'Issuing Country',ph:'Issuing country'},
      {id:'holderName',label:'Full Name',ph:'Name on document'},
      {id:'dob',label:'Date of Birth',type:'date'},
      {id:'issueDate',label:'Issue Date',type:'date'},
      {id:'expiryDate',label:'Expiry Date',type:'date'},
      {id:'storageLocation',label:'Storage Location',ph:'Wallet, safe...'},
    ]
  },
  driving_license:{
    label:'Driving Licence',ic:'🚗',
    fields:[
      {id:'docNumber',label:'Licence Number',ph:'Driving licence number'},
      {id:'issuingCountry',label:'Issuing Country',ph:'Country'},
      {id:'holderName',label:'Full Name',ph:'Name on licence'},
      {id:'dob',label:'Date of Birth',type:'date'},
      {id:'issueDate',label:'Issue Date',type:'date'},
      {id:'expiryDate',label:'Expiry Date',type:'date'},
      {id:'vehicleCategories',label:'Categories',ph:'B, C, D...'},
      {id:'storageLocation',label:'Storage',ph:'Wallet, glove box...'},
    ]
  },
  visa:{
    label:'Visa / Entry Permit',ic:'✈️',
    fields:[
      {id:'docNumber',label:'Visa Number',ph:'Visa reference number'},
      {id:'visaType',label:'Visa Type',ph:'Tourist, Work, Student, ILR...',list:'Student,Work/Skilled Worker,Tourist,Family/Spouse,Student,Indefinite Leave to Remain,Business,Transit,Investor'},
      {id:'issuingCountry',label:'Issuing Country',ph:'Country that issued visa'},
      {id:'holderName',label:'Holder Name',ph:'Full name'},
      {id:'issueDate',label:'Issue Date',type:'date'},
      {id:'expiryDate',label:'Expiry Date',type:'date'},
      {id:'validEntries',label:'Entry Type',ph:'Single, Multiple, Multiple (2 years)...'},
      {id:'linkedPassportNum',label:'Linked Passport No.',ph:'Passport this visa is in'},
      {id:'storageLocation',label:'Storage',ph:'In passport, safe...'},
    ]
  },
  property_doc:{
    label:'Property Document',ic:'🏠',
    fields:[
      {id:'docSubType',label:'Document Type',ph:'Title deed, Sale agreement, Mortgage docs...',list:'Title Deed,Sale Agreement,Mortgage Documents,Property Survey,Planning Permission,Lease Agreement,Building Certificate,Insurance Policy'},
      {id:'propertyRef',label:'Property / Address',ph:'Which property does this relate to?'},
      {id:'ownerName',label:'Owner Name',ph:'Registered owner(s)'},
      {id:'plotNumber',label:'Plot / Unit Number',ph:'Plot or unit reference'},
      {id:'handoverDate',label:'Handover Date',type:'date'},
      {id:'developer',label:'Developer / Seller',ph:'Developer or seller name'},
      {id:'registrationRef',label:'Registration / Registry Ref',ph:'Land registry or title ref'},
      {id:'issueDate',label:'Document Date',type:'date'},
      {id:'expiryDate',label:'Expiry Date (if applicable)',type:'date'},
      {id:'storageLocation',label:'Storage',ph:'Safe, solicitor, bank...'},
    ]
  },
  insurance_doc:{
    label:'Insurance Document',ic:'🛡️',
    fields:[
      {id:'docSubType',label:'Insurance Type',ph:'Health, Auto, Home, Life...',list:'Health,Auto/Car,Home,Life,Travel,Business,Pet,Gadget'},
      {id:'policyNumber',label:'Policy Number',ph:'Policy reference'},
      {id:'provider',label:'Insurance Provider',ph:'Company name'},
      {id:'holderName',label:'Policy Holder',ph:'Name on policy'},
      {id:'beneficiary',label:'Beneficiary',ph:'Who benefits'},
      {id:'coverAmount',label:'Cover Amount',ph:'e.g. 250000'},
      {id:'premium',label:'Premium (per period)',ph:'Monthly or annual premium'},
      {id:'issueDate',label:'Start Date',type:'date'},
      {id:'expiryDate',label:'Renewal Date',type:'date'},
      {id:'storageLocation',label:'Storage',ph:'Email, safe, broker...'},
    ]
  },
  vehicle_reg:{
    label:'Vehicle Registration',ic:'🚗',
    fields:[
      {id:'regNumber',label:'Registration / Plate No.',ph:'e.g. ABC-1234'},
      {id:'vehicleMake',label:'Make / Brand',ph:'Toyota, BMW, Mercedes...'},
      {id:'vehicleModel',label:'Model',ph:'Corolla, 3 Series...'},
      {id:'vin',label:'VIN / Chassis Number',ph:'17-character VIN'},
      {id:'ownerName',label:'Registered Owner',ph:'Owner name'},
      {id:'issueDate',label:'Registration Date',type:'date'},
      {id:'expiryDate',label:'Expiry / Renewal Date',type:'date'},
      {id:'issuingAuthority',label:'Issuing Authority',ph:'DVLA, RTA, MTMIS...'},
      {id:'storageLocation',label:'Storage',ph:'Glove box, safe...'},
    ]
  },
  tax:{
    label:'Tax Document',ic:'📋',
    fields:[
      {id:'docSubType',label:'Tax Doc Type',ph:'Tax Return, Tax Certificate, VAT Reg...',list:'Income Tax Return,Tax Certificate,VAT Registration,NTN Certificate,Tax Clearance,CNIC Tax Filing,Corporate Tax'},
      {id:'taxYear',label:'Tax Year / Period',ph:'e.g. 2023-24'},
      {id:'referenceNum',label:'Reference Number',ph:'Tax reference or UTR'},
      {id:'issuingAuthority',label:'Issuing Authority',ph:'HMRC, FBR, IRS...'},
      {id:'holderName',label:'Taxpayer Name',ph:'Your name or company'},
      {id:'issueDate',label:'Issue / Filing Date',type:'date'},
      {id:'expiryDate',label:'Expiry (if applicable)',type:'date'},
      {id:'storageLocation',label:'Storage',ph:'Accountant, cloud, safe...'},
    ]
  },
  medical:{
    label:'Medical Record',ic:'🏥',
    fields:[
      {id:'docSubType',label:'Record Type',ph:'Prescription, Test Result, Vaccination...',list:'Prescription,Test Results,Vaccination Record,Medical Report,Discharge Summary,Dental Records,Blood Type Card,Allergy Info'},
      {id:'holderName',label:'Patient Name',ph:'Patient name'},
      {id:'doctor',label:'Doctor / Hospital',ph:'Name of doctor or hospital'},
      {id:'issueDate',label:'Date',type:'date'},
      {id:'expiryDate',label:'Valid Until (if applicable)',type:'date'},
      {id:'notes',label:'Notes',ph:'Brief description of document',multi:true},
      {id:'storageLocation',label:'Storage',ph:'Physical or digital location'},
    ]
  },
  warranty:{
    label:'Warranty / Receipt',ic:'🧾',
    fields:[
      {id:'productName',label:'Product Name',ph:'What is covered?'},
      {id:'serialNum',label:'Serial / Model Number',ph:'Product serial number'},
      {id:'retailer',label:'Retailer / Seller',ph:'Where purchased'},
      {id:'purchasePrice',label:'Purchase Price',ph:'Amount paid'},
      {id:'issueDate',label:'Purchase Date',type:'date'},
      {id:'expiryDate',label:'Warranty Expiry',type:'date'},
      {id:'warrantyProvider',label:'Warranty Provider',ph:'Brand or extended warranty company'},
      {id:'claimProcess',label:'How to Claim',ph:'Warranty claim process or URL'},
      {id:'storageLocation',label:'Storage',ph:'Drawer, email, safe...'},
    ]
  },
  contract:{
    label:'Contract / Agreement',ic:'📝',
    fields:[
      {id:'contractTitle',label:'Contract Title',ph:'e.g. Employment Agreement, NDA...'},
      {id:'parties',label:'Parties Involved',ph:'Names of all parties'},
      {id:'issueDate',label:'Signing Date',type:'date'},
      {id:'expiryDate',label:'Expiry Date (if applicable)',type:'date'},
      {id:'keyTerms',label:'Key Terms / Summary',ph:'Brief summary of key points',multi:true},
      {id:'lawyer',label:'Lawyer / Solicitor',ph:'Legal representative'},
      {id:'storageLocation',label:'Storage',ph:'Safe, solicitor, email...'},
    ]
  },
  certificate:{
    label:'Certificate / Award',ic:'🎓',
    fields:[
      {id:'certTitle',label:'Certificate Name',ph:'e.g. Bachelor of Science, AWS Certified...'},
      {id:'holderName',label:'Holder Name',ph:'Your name on certificate'},
      {id:'issuingAuthority',label:'Issued By',ph:'University, company, body...'},
      {id:'issueDate',label:'Issue Date',type:'date'},
      {id:'expiryDate',label:'Expiry / Renewal',type:'date'},
      {id:'certNumber',label:'Certificate Number',ph:'Reference number (if any)'},
      {id:'storageLocation',label:'Storage',ph:'Frame, folder, cloud...'},
    ]
  },
  other:{
    label:'Other Document',ic:'📄',
    fields:[
      {id:'docSubType',label:'Document Description',ph:'What is this document?'},
      {id:'holderName',label:'Related Person/Entity',ph:'Who does this relate to?'},
      {id:'referenceNum',label:'Reference Number',ph:'Any reference or ID number'},
      {id:'issueDate',label:'Date Issued',type:'date'},
      {id:'expiryDate',label:'Expiry Date',type:'date'},
      {id:'issuingAuthority',label:'Issued By',ph:'Authority or organization'},
      {id:'notes',label:'Notes',ph:'Additional details',multi:true},
      {id:'storageLocation',label:'Storage',ph:'Where is this kept?'},
    ]
  },
};

const DOC_TYPES=Object.keys(DOC_SCHEMAS);

'use strict';

// ── VaultOS safe confirm — works in sandboxed iframe and native ──
window.__vos_confirm = function(msg) {
  try { return window.confirm(msg); }
  catch(e) {
    console.log('[VaultOS] Auto-confirmed (sandboxed):', msg.slice(0, 50));
    return true;
  }
};

const VER = '4.0';

// ===================== CRYPTO ENGINE (AES-256-GCM + PBKDF2) =====================
const Crypto = {
  async deriveKey(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 310000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false, ['encrypt', 'decrypt']
    );
  },
  async encrypt(data, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv   = crypto.getRandomValues(new Uint8Array(12));
    const key  = await this.deriveKey(password, salt);
    const enc  = new TextEncoder();
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(data));
    const buf = new Uint8Array(16 + 12 + ciphertext.byteLength);
    buf.set(salt, 0); buf.set(iv, 16); buf.set(new Uint8Array(ciphertext), 28);
    return btoa(String.fromCharCode(...buf));
  },
  async decrypt(b64, password) {
    const buf  = new Uint8Array(atob(b64).split('').map(c => c.charCodeAt(0)));
    const salt = buf.slice(0, 16);
    const iv   = buf.slice(16, 28);
    const ct   = buf.slice(28);
    const key  = await this.deriveKey(password, salt);
    const dec  = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    return new TextDecoder().decode(dec);
  },
  available() { return !!window.crypto?.subtle; }
};

// ===================== SCHEMA MIGRATION =====================
const SCHEMA_VERSION = 4;

const Migrate = {
  run() {
    const stored = Store.loadRaw();
    if (!stored) return;
    const sv = stored.schemaVersion || 1;
    if (sv >= SCHEMA_VERSION) return;
    console.log(`VaultOS: migrating schema v${sv} → v${SCHEMA_VERSION}`);
    if (sv < 2 && !stored.modules) {
      stored.modules = { banks:true, cards:true, investments:true, sims:true, assets:true, expenses:true, emails:true, gadgets:true, digital:true, import:true, timeline:true, security:true };
    }
    if (sv < 3 && !stored.wallet) stored.wallet = [];
    if (sv < 4) {
      if (!stored.tags)     stored.tags = [];
      if (!stored.emails)   stored.emails = [];
      if (!stored.gadgets)  stored.gadgets = [];
      if (!stored.digital)  stored.digital = [];
      if (!stored.expenses) stored.expenses = [];
      if (!stored.activity) stored.activity = [];
      if (stored.assets)  stored.assets  = stored.assets.map(a => ({ ...a, assetType: a.assetType || 'other' }));
      if (stored.cards)   stored.cards   = stored.cards.map(c => ({ ...c, issuer: c.issuer || (c.cardName || '').split(' ')[0] }));
    }
    stored.schemaVersion = SCHEMA_VERSION;
    // Write back to localStorage only during migration phase (before VaultDB is active)
    try { localStorage.setItem('vos3', JSON.stringify(stored)); } catch(e) {}
  }
};

// ===================== STATE =====================
let S = {
  unlocked: false, decoy: false,
  user: { name:'', avatar:'💼', theme:'dark', currency:'GBP', netWorth:0, nwHistory:[], email:'', phone:'', homeAddr:'', workAddr:'', dob:'', lastBackup:'' },
  pin: '123456', decoyPin: '', noPin: false,
  modules: { banks:true, cards:true, investments:true, cash:true, loans:true, sims:true, friends:true, assets:true, expenses:true, emails:true, gadgets:true, digital:true, documents:true, search:true, import:true, timeline:true, security:true, backup:true, recovery:true, workspace:true, vehicles:true, reminders:true },
  banks:[], cards:[], investments:[], cash:[], loans:[], friends:[], sims:[], assets:[], expenses:[], emails:[], gadgets:[], digital:[], documents:[], vehicles:[], activity:[], tags:[], trash:[],
  loanF:'all',
  wallet:[],
  fails:0, lockedUntil:0, autoLock:true, lockMins:10, clipSecs:30, privacyMode:false, workspace:'default', panicEnabled:true, fontScale:'md', highContrast:false,
  bF:'all', cF:'all', invF:'all', simF:'all', aF:'all', expF:'all', gF:'all',
  _timer:null, _clockTimer:null,
};

// ===================== STORAGE ENGINE =====================
const Store = {
  // Legacy localStorage accessor (migration only)
  loadRaw() { try { return JSON.parse(localStorage.getItem('vos3')); } catch(e) {} return null; },

  // Build the serialisable data object from S
  _data() {
    return {
      schemaVersion: SCHEMA_VERSION,
      user: S.user, noPin: S.noPin,
      modules: S.modules,
      banks: S.banks, cards: S.cards, investments: S.investments, cash: S.cash, loans: S.loans, friends: S.friends, sims: S.sims,
      assets: S.assets, expenses: S.expenses, emails: S.emails, gadgets: S.gadgets,
      digital: S.digital, vehicles: S.vehicles, activity: S.activity.slice(0, 80), tags: S.tags, wallet: S.wallet, trash: S.trash,
      fails: S.fails, lockedUntil: S.lockedUntil,
      autoLock: S.autoLock, lockMins: S.lockMins, clipSecs: S.clipSecs
    };
  },

  // Save non-sensitive prefs to localStorage (for startup display before unlock)
  _savePrefs() {
    try {
      localStorage.setItem('vos_prefs', JSON.stringify({
        theme: S.user.theme, fontScale: S.fontScale, highContrast: S.highContrast,
        name: S.user.name, hasVault: true
      }));
    } catch(e) {}
  },

  loadPrefs() { try { return JSON.parse(localStorage.getItem('vos_prefs')); } catch(e) {} return null; },

  // Fire-and-forget: encrypt and persist to IndexedDB.
  // Callers remain synchronous — VaultDB.save runs in background.
  save() {
    const data = this._data();
    this._savePrefs();
    if (VaultDB.sessionKey) {
      VaultDB.save(data).catch(e => console.warn('[VaultDB] save error:', e));
    }
  },

  // Load from VaultDB (async). Called after VaultDB.init() in PIN flow.
  async load() {
    try {
      const d = await VaultDB.load();
      if (d) { Object.assign(S, d); return true; }
    } catch(e) {}
    return false;
  },

  async clear() {
    try { await VaultDB.clear(); } catch(e) {}
    try { sessionStorage.clear(); } catch(e) {}
    try {
      ['vos3', 'vos_prefs'].forEach(k => localStorage.removeItem(k));
    } catch(e) {}
    S.banks=[]; S.cards=[]; S.investments=[]; S.cash=[]; S.loans=[]; S.friends=[]; S.sims=[]; S.assets=[];
    S.expenses=[]; S.emails=[]; S.gadgets=[]; S.digital=[]; S.documents=[]; S.vehicles=[];
    S.activity=[]; S.tags=[]; S.wallet=[]; S.trash=[];
    S.user = { name:'', avatar:'💼', theme:'dark', currency:'USD', netWorth:0, nwHistory:[], email:'', phone:'', homeAddr:'', workAddr:'', dob:'', lastBackup:null };
    S.pin=''; S.decoyPin=''; S.fails=0; S.unlocked=false; S.decoy=false;
  }
};

// ===================== THEME ENGINE =====================
const ThemeEngine = {
  _mqListener: null,
  apply(id) {
    if (id === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const resolved = prefersDark ? 'dark' : 'light';
      const t = THEMES.find(x => x.id === resolved) || THEMES[0];
      // Preserve font-scale and high-contrast classes
      const extra = (document.body.className.match(/\b(fs-\w+|hc)\b/g) || []).join(' ');
      document.body.className = [t.cls || '', extra].filter(Boolean).join(' ');
      S.user.theme = 'auto';
      document.getElementById('themeColorMeta').content = t.ac;
      Store.save();
      this.renderDots();
      // Register system preference listener once
      if (!this._mqListener) {
        this._mqListener = () => { if (S.user.theme === 'auto') ThemeEngine.apply('auto'); };
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', this._mqListener);
      }
      return;
    }
    const t = THEMES.find(x => x.id === id) || THEMES[0];
    const extra = (document.body.className.match(/\b(fs-\w+|hc)\b/g) || []).join(' ');
    document.body.className = [t.cls || '', extra].filter(Boolean).join(' ');
    S.user.theme = id;
    document.getElementById('themeColorMeta').content = t.ac;
    Store.save();
    this.renderDots();
  },
  renderDots() {
    ['homeThemes'].forEach(elId => {
      const e = document.getElementById(elId);
      if (e) e.innerHTML = THEMES.map(t =>
        `<div class="tdot${t.id === S.user.theme ? ' on' : ''}" style="background:${t.ac}" title="${t.n}" onclick="ThemeEngine.apply('${t.id}')"></div>`
      ).join('');
    });
  },
  openPicker() {
    const gs = { dark:'🌙 Dark', bold:'⚡ Bold', light:'🌸 Light' };
    document.getElementById('themePicker').innerHTML = Object.entries(gs).map(([g, label]) => `
      <div style="margin-bottom:16px"><div class="set-title">${label}</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">
        ${THEMES.filter(t => t.g === g).map(t =>
          `<div onclick="ThemeEngine.apply('${t.id}');ThemeEngine.closePicker()" style="background:${t.bg};border:2px solid ${t.id === S.user.theme ? t.ac : 'rgba(255,255,255,0.08)'};border-radius:var(--r);padding:12px;cursor:pointer;transition:var(--t)">
            <div style="width:16px;height:16px;border-radius:50%;background:${t.ac};margin-bottom:6px;box-shadow:0 0 8px ${t.gl}"></div>
            <div style="font-size:11px;font-weight:600;color:${t.ac}">${t.n}</div>
          </div>`
        ).join('')}
      </div></div>`
    ).join('');
    document.getElementById('themeOv').classList.add('on');
  },
  closePicker() { document.getElementById('themeOv').classList.remove('on'); }
};

// ===================== TOAST =====================
const Toast = {
  show(msg, type = 'info', dur = 3200) {
    const w = document.getElementById('toastWrap');
    const t = document.createElement('div');
    const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
    const cls   = { success:'ok', error:'err', warning:'wrn', info:'inf' };
    t.className = `toast ${cls[type] || 'inf'}`;
    // msg is rendered as innerHTML so callers can embed buttons or strong tags
    t.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span style="flex:1;line-height:1.4;display:flex;align-items:center;gap:6px;flex-wrap:wrap">${msg}</span><button onclick="this.closest('.toast').remove()" style="background:none;border:none;cursor:pointer;color:var(--text2);font-size:15px;flex-shrink:0">×</button>`;
    w.appendChild(t);
    setTimeout(() => { t.style.animation = 'slideIn .25s reverse'; setTimeout(() => t.remove(), 240); }, dur);
  }
};

// ===================== MODAL =====================
const Modal = {
  open(title, body, foot = '') {
    document.getElementById('mTitle').textContent = title;
    document.getElementById('mBody').innerHTML = body;
    document.getElementById('mFoot').innerHTML = foot;
    document.getElementById('overlay').classList.add('on');
  },
  close() { document.getElementById('overlay').classList.remove('on'); }
};

// ===================== ROUTER =====================
const R = {
  showLock() {
    ['pgHome', 'pgOnboard', 'app'].forEach(id => { const e = document.getElementById(id); if (e) e.style.display = 'none'; });
    const lk = document.getElementById('pgLock');
    lk.style.display = 'flex';
    PIN.reset();
    this.startClock();
    const sub = document.getElementById('lkSub');
    if (sub && S.user.name) sub.textContent = `Welcome back, ${S.user.name}`;
  },
  showHome() {
    ['pgLock', 'pgOnboard', 'app'].forEach(id => { const e = document.getElementById(id); if (e) e.style.display = 'none'; });
    document.getElementById('pgHome').style.display = 'flex';
    const hw = document.getElementById('hWelcome');
    if (hw && S.user.name) hw.textContent = `Welcome back, ${S.user.name}! 👋`;
    ThemeEngine.renderDots();
  },
  unlock() {
    S.unlocked = true; S.decoy = false;
    ['pgLock', 'pgHome', 'pgOnboard'].forEach(id => { const e = document.getElementById(id); if (e) e.style.display = 'none'; });
    document.getElementById('app').style.display = 'flex';
    document.getElementById('fab').style.display = 'flex';
    buildNav();
    this.goto('dashboard');
    Activity.log('Vault unlocked');
    // Auto-purge trash items older than 30 days
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const before = (S.trash||[]).length;
    S.trash = (S.trash||[]).filter(item => new Date(item.deletedAt).getTime() > cutoff);
    if (S.trash.length < before) Store.save();
    if (S.autoLock) this.resetTimer();
    setTimeout(() => WhatsNew.check(), 800);
    if (S._clockTimer) clearInterval(S._clockTimer);
  },
  lock() {
    S.unlocked = false; clearTimeout(S._timer);
    VaultDB.sessionKey = null;           // clear in-memory key on lock
    document.getElementById('app').style.display = 'none';
    document.getElementById('fab').style.display = 'none';
    Modal.close();
    this.showHome();
    Activity.log('Vault locked');
  },
  goto(pg, force = false) {
    const prev = S.currentPage;
    S.currentPage = pg;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('on'));
    const el = document.getElementById('pg-' + pg);
    if (el) el.classList.add('on');
    document.querySelectorAll('.ni,[data-pg]').forEach(n => n.classList.toggle('on', n.dataset.pg === pg));
    if (prev === pg && !force) return;
    const renders = {
      dashboard:   () => Dash.render(),
      banks:       () => Banks.render(),
      cards:       () => Cards.render(),
      investments: () => Inv.render(),
      cash:        () => Cash.render(),
      loans:       () => Loans.render(),
      friends:     () => Friends.render(),
      sims:        () => Sims.render(),
      assets:      () => Assets.render(),
      expenses:    () => Exp.render(),
      emails:      () => Emails.render(),
      gadgets:     () => Gadgets.render(),
      digital:     () => Digital.render(),
      alerts:      () => renderAlerts(),
      documents:   () => DocsModule.render(),
      search:      () => GlobalSearch.render(),
      import:      () => ImportEngine.render(),
      timeline:    () => Timeline.render(),
      security:    () => SecurityCenter.render(),
      backup:      () => BackupCenter.render(),
      recovery:    () => RecoveryCenter.render(),
      workspace:   () => WorkspaceManager.render(),
      vehicles:    () => Vehicles.render(),
      reminders:   () => Reminders.render(),
      'ai-import': () => { if (typeof AIImport !== 'undefined') AIImport.render(); },
      'trash':     () => { if (typeof Trash !== 'undefined') Trash.render(); },
      settings:    () => {
        buildNav();
        buildSettTabs();
        if (typeof SettingsNav !== 'undefined') {
          setTimeout(() => { SettingsNav.show(SettingsNav.current || 'profile'); if (typeof SelfCheck !== 'undefined') SelfCheck.run(); }, 50);
        } else {
          Settings.render();
        }
      }
    };
    if (renders[pg]) renders[pg]();
    if (prev !== pg) buildNav();
  },
  resetTimer() {
    clearTimeout(S._timer);
    if (!S.lockMins) return;
    S._timer = setTimeout(() => {
      if (S.unlocked) { this.lock(); Toast.show('Auto-locked', 'warning'); }
    }, S.lockMins * 60000);
  },
  startClock() {
    const upd = () => {
      const n  = new Date();
      const cl = document.getElementById('lkClock');
      const dt = document.getElementById('lkDate');
      if (cl) cl.textContent = String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0');
      if (dt) dt.textContent = n.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' });
    };
    upd();
    if (S._clockTimer) clearInterval(S._clockTimer);
    S._clockTimer = setInterval(upd, 10000);
  }
};

// ===================== PIN / LOCK SYSTEM =====================
let pe = ''; let lt = null;
const PIN = {
  reset() {
    pe = '';
    [0,1,2,3,4,5].forEach(i => { const d = document.getElementById('pd' + i); if (d) d.className = 'pd'; });
    document.getElementById('pmsg').className = 'pin-msg';
    document.getElementById('pmsg').textContent = '';
    document.getElementById('lkBar').style.display = 'none';
  },
  in(n) {
    if (pe.length >= 6) return;
    if (Date.now() < S.lockedUntil) { this.showLo(); return; }
    if (S.noPin) { R.unlock(); return; }
    pe += n; this.dots();
    if (navigator.vibrate) navigator.vibrate(6);
    if (pe.length === 6) setTimeout(() => this.verify(), 130);
  },
  del() {
    pe = pe.slice(0, -1);
    const msg = document.getElementById('pmsg');
    if (msg) msg.className = 'pin-msg';
    this.dots();
  },
  dots() {
    [0,1,2,3,4,5].forEach(i => {
      const d = document.getElementById('pd' + i);
      if (d) d.className = 'pd' + (i < pe.length ? ' on' : '');
    });
    const msg = document.getElementById('pmsg');
    if (msg && !msg.classList.contains('err')) {
      msg.textContent = pe.length > 0 ? pe.length + ' of 6' : '';
    }
  },
  verify() {
    if (Date.now() < S.lockedUntil) { this.showLo(); pe = ''; this.dots(); return; }
    const entered = pe;
    pe = '';
    this.dots();
    // Show pending state
    [0,1,2,3,4,5].forEach(i => { const d = document.getElementById('pd' + i); if (d) d.classList.add('on'); });
    const msg = document.getElementById('pmsg');
    if (msg) { msg.className = 'pin-msg'; msg.textContent = 'Verifying…'; }

    this._verify(entered).then(result => {
      if (result === 'real') {
        S.fails = 0; Store.save();
        setTimeout(() => R.unlock(), 180);
      } else if (result === 'decoy') {
        S.decoy = true; S.fails = 0;
        loadDecoyData(); R.unlock();
      } else {
        // Wrong PIN — brute force protection
        S.fails++;
        // Persist fail count via legacy localStorage during migration, or via VaultDB if available
        if (VaultDB.sessionKey) { Store.save(); }
        else { try { localStorage.setItem('vos_fails', JSON.stringify({ fails: S.fails, lockedUntil: S.lockedUntil })); } catch(e) {} }

        [0,1,2,3,4,5].forEach(i => { const d = document.getElementById('pd' + i); if (d) d.className = 'pd err'; });
        if (msg) msg.className = 'pin-msg err';

        if (S.fails >= 10) {
          // Wipe vault after 10 fails
          msg.textContent = '⚠️ Too many attempts — wiping vault';
          Store.clear().then(() => setTimeout(() => location.reload(), 1500));
          return;
        } else if (S.fails >= 5) {
          const w = 300; // 5 min
          S.lockedUntil = Date.now() + w * 1000;
          if (msg) msg.textContent = `Too many attempts — locked ${w}s`;
          this.countdown(w);
        } else if (S.fails >= 3) {
          const w = 30;
          S.lockedUntil = Date.now() + w * 1000;
          if (msg) msg.textContent = `Too many attempts — locked ${w}s`;
          this.countdown(w);
        } else {
          if (msg) msg.textContent = `Wrong PIN — ${3 - Math.min(S.fails, 2)} attempts left`;
        }
        Activity.log('Failed PIN #' + S.fails);
        setTimeout(() => {
          [0,1,2,3,4,5].forEach(i => { const d = document.getElementById('pd' + i); if (d) d.className = 'pd'; });
          this.dots();
        }, 580);
      }
    }).catch(() => {
      // Unexpected error
      [0,1,2,3,4,5].forEach(i => { const d = document.getElementById('pd' + i); if (d) d.className = 'pd'; });
      if (msg) { msg.className = 'pin-msg err'; msg.textContent = 'Error — try again'; }
      this.dots();
    });
  },

  // Async PIN verification: migration path + VaultDB path
  async _verify(pin) {
    if (S.noPin) return 'real';

    // ── Migration path: old localStorage data ──────────────────────────────
    const oldData = Store.loadRaw();
    const hasVaultDB = await VaultDB.isInitialized();

    if (oldData && !hasVaultDB) {
      if (oldData.noPin || pin === String(oldData.pin)) {
        // Migrate: load old data into S, then encrypt to VaultDB
        Object.assign(S, oldData);
        try {
          await VaultDB.init(pin || '000000');
          await VaultDB.save(Store._data());
          localStorage.removeItem('vos3');
          Store._savePrefs();
        } catch(e) { console.warn('[VaultDB] migration error:', e); }
        return 'real';
      }
      if (oldData.decoyPin && pin === String(oldData.decoyPin)) {
        return 'decoy';
      }
      return null;
    }

    // ── VaultDB path: try main then decoy slot ─────────────────────────────
    const result = await VaultDB.tryPin(pin);
    if (!result) return null;
    if (result.slot === 'decoy') return 'decoy';
    Object.assign(S, result.data);
    return 'real';
  },
  countdown(s) {
    let r = s;
    const bar  = document.getElementById('lkBar');
    const fill = document.getElementById('lkFill');
    bar.style.display = 'block'; fill.style.width = '100%'; clearInterval(lt);
    lt = setInterval(() => {
      r--; fill.style.width = (r / s * 100) + '%';
      document.getElementById('pmsg').textContent = `Locked — ${r}s`;
      if (r <= 0) { clearInterval(lt); bar.style.display = 'none'; S.lockedUntil = 0; Store.save(); this.reset(); }
    }, 1000);
  },
  showLo() {
    const r = Math.ceil((S.lockedUntil - Date.now()) / 1000);
    document.getElementById('pmsg').textContent = `Locked — ${r}s`;
    document.getElementById('pmsg').className = 'pin-msg err';
  }
};

// ===================== ONBOARDING =====================
let obStep = 1, obSec = 'secure';
let obMods = { banks:true, cards:true, investments:true, sims:true, assets:true, expenses:true, emails:true, gadgets:true, digital:true };

const OB = {
  init() {
    document.getElementById('pgOnboard').style.display = 'flex';
    document.getElementById('pgHome').style.display = 'none';
    this.renderProg(); this.renderMods(); this.renderThemes();
  },
  renderProg() {
    document.getElementById('obProg').innerHTML = Array.from({ length:6 }, (_, i) =>
      `<div class="ob-pd${i < obStep ? ' on' : ''}"></div>`
    ).join('');
  },
  renderMods() {
    document.getElementById('modGrid').innerHTML = ALL_MODULES.map(m =>
      `<div class="mod-opt${obMods[m.id] ? ' on' : ''}" onclick="OB.toggleMod('${m.id}',this)">
        <div class="mic">${m.ic}</div><div class="mname">${m.n}</div><div class="mchk">✓</div>
      </div>`
    ).join('');
  },
  toggleMod(id, el) { obMods[id] = !obMods[id]; el.classList.toggle('on', obMods[id]); },
  renderThemes() {
    document.getElementById('ob-themes').innerHTML = THEMES.map(t =>
      `<div onclick="ThemeEngine.apply('${t.id}');document.querySelectorAll('[data-tid]').forEach(x=>x.style.borderColor='rgba(255,255,255,0.08)');this.style.borderColor='${t.ac}'" data-tid="${t.id}" style="background:${t.bg};border:2px solid ${t.id === S.user.theme ? t.ac : 'rgba(255,255,255,0.08)'};border-radius:var(--r);padding:11px;cursor:pointer;transition:var(--t)">
        <div style="width:16px;height:16px;border-radius:50%;background:${t.ac};margin-bottom:6px;box-shadow:0 0 8px ${t.gl}"></div>
        <div style="font-size:10px;font-weight:600;color:${t.ac}">${t.n}</div>
      </div>`
    ).join('');
  },
  setSec(s) {
    obSec = s;
    ['paranoid', 'secure', 'relaxed'].forEach(x => {
      const el = document.getElementById('so-' + x);
      if (el) el.classList.toggle('on', x === s);
    });
  },
  checkPIN() {
    const p1 = document.getElementById('ob-pin')?.value;
    const p2 = document.getElementById('ob-pin2')?.value;
    const m  = document.getElementById('ob-pinmatch');
    if (!m || !p2) return;
    if (p2.length === 0) { m.textContent = ''; return; }
    if (p1 === p2 && p1.length === 6) { m.innerHTML = '<span style="color:var(--ok)">✅ PINs match</span>'; }
    else if (p1.startsWith(p2) || p2.length < 6) { m.innerHTML = '<span style="color:var(--text3)">Typing...</span>'; }
    else { m.innerHTML = '<span style="color:var(--err)">❌ PINs do not match</span>'; }
  },
  next(step) {
    if (step === 1) {
      const n = document.getElementById('ob-name').value.trim();
      if (!n) { Toast.show('Please enter your name', 'warning'); return; }
      S.user.name = n;
    }
    if (step === 2) Object.assign(S.modules, obMods);
    if (step === 4) {
      const cfg = { paranoid:{ lockMins:1, clipSecs:15 }, secure:{ lockMins:10, clipSecs:30 }, relaxed:{ lockMins:30, clipSecs:60 } };
      const c = cfg[obSec]; S.autoLock = true; S.lockMins = c.lockMins; S.clipSecs = c.clipSecs;
    }
    obStep = step + 1;
    document.querySelectorAll('.ob-step').forEach((el, i) => el.classList.toggle('on', i + 1 === obStep));
    this.renderProg();
  },
  finish() {
    const p  = document.getElementById('ob-pin').value;
    const p2 = document.getElementById('ob-pin2').value;
    const d  = document.getElementById('ob-decoy').value;
    if (!/^\d{6}$/.test(p)) { document.getElementById('ob-perr').textContent = 'PIN must be 6 digits'; return; }
    if (p !== p2) { document.getElementById('ob-perr').textContent = 'PINs do not match'; return; }
    S.pin = p; S.decoyPin = d || ''; S.noPin = false;
    VaultDB.init(p).then(async () => {
      Store.save();
      if (d && /^\d{6}$/.test(d)) {
        await VaultDB.saveDecoySlot(d, { _decoy: true });
      }
      delete S.pin; delete S.decoyPin;
    }).catch(e => console.warn('[VaultDB] init error:', e));
    obStep = 6;
    document.querySelectorAll('.ob-step').forEach((el, i) => el.classList.toggle('on', i + 1 === obStep));
    this.renderProg();
  },
  complete() {
    document.getElementById('pgOnboard').style.display = 'none';
    Toast.show(`Welcome to VaultOS, ${S.user.name}! 🎉`, 'success');
    R.unlock();
  }
};

// ===================== ACTIVITY =====================
const Activity = {
  log(a, d = '') {
    S.activity.unshift({ id: Date.now(), a, d, t: new Date().toISOString() });
    if (S.activity.length > 80) S.activity.pop();
    Store.save();
  },
  ago(iso) {
    const diff = Date.now() - new Date(iso);
    if (diff < 60000)   return 'just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return new Date(iso).toLocaleDateString();
  }
};

// ===================== UTILS =====================
const U = {
  id:       () => 'i' + Date.now() + Math.random().toString(36).slice(2, 5),
  flag:     c  => COUNTRIES.find(x => x.c === c)?.f || '🌐',
  cname:    c  => COUNTRIES.find(x => x.c === c)?.n || c,
  phone:    c  => COUNTRIES.find(x => x.c === c)?.p || '+0',
  fmt:      n  => new Intl.NumberFormat().format(n || 0),
  fmtPKR(n) {
    n = Math.abs(Math.round(n || 0));
    if (n >= 10000000) return (n / 10000000).toFixed(2).replace(/\.?0+$/, '') + ' Cr';
    if (n >= 100000)   return (n / 100000).toFixed(2).replace(/\.?0+$/, '') + ' L';
    return new Intl.NumberFormat('en-PK').format(n);
  },
  expSt(e) {
    if (!e) return 'ok';
    const [m, y] = e.split('/');
    const d = new Date(2000 + parseInt(y), parseInt(m) - 1, 1);
    const mo = (d.getFullYear() - new Date().getFullYear()) * 12 + (d.getMonth() - new Date().getMonth());
    if (mo < 0) return 'err'; if (mo < 3) return 'err'; if (mo < 6) return 'warn'; return 'ok';
  },
  expBadge(e) {
    const s = U.expSt(e); if (!e) return '';
    if (s === 'err')  return '<span class="badge b-err">⚠️ Exp</span>';
    if (s === 'warn') return '<span class="badge b-warn">Soon</span>';
    return '<span class="badge b-ok">Valid</span>';
  },
  pnl(inv, cur) {
    if (!inv || !cur) return '—';
    const d = cur - inv, p = ((d / inv) * 100).toFixed(1), s = d >= 0 ? '+' : '';
    return `<span style="color:${d >= 0 ? 'var(--ok)' : 'var(--err)'}">${s}${U.fmt(Math.round(d))} (${s}${p}%)</span>`;
  },
  countries:   () => COUNTRIES.map(c  => `<option value="${c.c}">${c.f} ${c.n}</option>`).join(''),
  currencies:  () => CURRENCIES.map(c  => `<option value="${c}">${c}</option>`).join(''),
  bankOpts:    cc => (cc ? BANKS_DB.filter(b => b.c === cc || b.c === 'OTHER') : BANKS_DB).map(b => `<option value="${b.n}">`).join(''),
  cardOpts:    () => CARDS_DB.map(c  => `<option value="${c.n}">`).join(''),
  brokerOpts:  () => BROKERS_DB.map(b => `<option value="${b}">`).join(''),
  netOpts:     cc => (cc ? NETWORKS_DB.filter(n => n.c === cc || n.c === 'OTHER') : NETWORKS_DB).map(n => `<option value="${n.n}">`).join(''),
  copy(text, label = '') {
    // Try modern Clipboard API first, fall back to execCommand
    const doCopy = () => {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => _legacyCopy(text));
      } else {
        _legacyCopy(text);
      }
    };
    function _legacyCopy(t) {
      const ta = document.createElement('textarea');
      ta.value = t; ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;width:1px;height:1px';
      document.body.appendChild(ta); ta.focus(); ta.select();
      try { document.execCommand('copy'); } catch(e) {}
      document.body.removeChild(ta);
    }
    doCopy();
    Toast.show((label || 'Value') + ' copied!', 'success');
    // Auto-clear clipboard after configured delay
    _scheduleClipClear();
  },
  reveal(elId, secret, label = '') {
    const el = document.getElementById(elId); if (!el) return;
    const orig = el.textContent; el.textContent = secret; U.copy(secret, label);
    setTimeout(() => { el.textContent = orig; }, 5000);
  },
  tags(sel) {
    if (!sel) sel = [];
    const defaults = ['Personal','Business','Primary','Secondary','Joint','Emergency','Savings','Travel','Islamic','Backup','Crypto','Family'];
    const all = [...defaults, ...(S.tags || [])].filter((v, i, a) => v && a.indexOf(v) === i);
    let html = '<div class="tags" id="tagPick">';
    all.forEach(t => { html += `<span class="tag${sel.indexOf(t) >= 0 ? ' on' : ''}" onclick="this.classList.toggle('on')">${t}</span>`; });
    html += '</div>';
    html += '<div style="display:flex;gap:7px;margin-top:7px">';
    html += '<input class="inp" id="custTagIn" placeholder="Add tag..." style="flex:1" onkeydown="if(event.key===\'Enter\')U.addTag()">';
    html += '<button class="btn btn-g btn-sm" onclick="U.addTag()">+</button></div>';
    return html;
  },
  addTag() {
    const i = document.getElementById('custTagIn'); const v = i.value.trim(); if (!v) return;
    if (!S.tags.includes(v)) S.tags.push(v);
    const p = document.getElementById('tagPick');
    if (p) { const sp = document.createElement('span'); sp.className = 'tag on'; sp.textContent = v; sp.onclick = function() { this.classList.toggle('on'); }; p.appendChild(sp); }
    i.value = ''; Store.save();
  },
  getTags: () => [...document.querySelectorAll('#tagPick .tag.on')].map(t => t.textContent.trim()),
  drRow: (label, val, secret = '') =>
    `<div class="dr"><div class="dk">${label}</div><div class="dv"><span id="dr-${label.replace(/\W/g,'')}" class="sens">${val}</span>${secret ? `<button class="cpbtn" onclick="U.reveal('dr-${label.replace(/\W/g,'')}','${secret.replace(/'/g,"\\'")}','${label}')">👁️</button>` : ''}</div></div>`,
  loginFields: (obj = {}) => `<div class="fr">
    <div class="fg"><label class="fl">App / Web Username</label><input class="inp" id="lf-user" value="${obj.username||''}" placeholder="Username"></div>
    <div class="fg"><label class="fl">Password Hint</label><input class="inp" id="lf-pwd" value="${obj.pwdHint||''}" placeholder="e.g. 'Email+DOB'"></div>
  </div><div class="fr">
    <div class="fg"><label class="fl">App PIN / Passcode</label><input class="inp" id="lf-pin" type="password" value="${obj.appPin||''}" placeholder="App PIN"></div>
    <div class="fg"><label class="fl">2FA Method</label><select class="inp" id="lf-2fa"><option value="">None</option><option value="SMS">SMS</option><option value="Authenticator">Authenticator</option><option value="Email">Email</option><option value="Hardware Key">Hardware Key</option></select></div>
  </div>`,
  getLF:  () => ({ username: document.getElementById('lf-user')?.value.trim(), pwdHint: document.getElementById('lf-pwd')?.value.trim(), appPin: document.getElementById('lf-pin')?.value.trim(), twoFA: document.getElementById('lf-2fa')?.value }),
  setLF(obj) { setTimeout(() => { const t = document.getElementById('lf-2fa'); if (t) t.value = obj.twoFA || ''; }, 60); },
  numInput(el, currency) {
    if (!el) return;
    el.addEventListener('input', () => formatNumberInput(el, currency || S.user.currency || 'PKR'));
  }
};

// ===================== NUMBER INPUT FORMATTER =====================
function formatNumberInput(input, currency) {
  const raw   = (input.value || '').replace(/,/g, '');
  const parts = raw.split('.');
  const intPart = parts[0].replace(/\D/g, '');
  const hasDec  = raw.includes('.');
  const decPart = hasDec ? '.' + (parts[1] || '').replace(/\D/g, '').slice(0, 2) : '';

  if (!intPart && !hasDec) { return 0; }
  const n = parseInt(intPart || '0', 10);
  const formatted = (currency === 'PKR')
    ? new Intl.NumberFormat('en-IN').format(n)
    : new Intl.NumberFormat('en-US').format(n);

  const newVal = formatted + decPart;
  if (input.value !== newVal) {
    const pos = input.selectionStart + (newVal.length - input.value.length);
    input.value = newVal;
    try { input.setSelectionRange(pos, pos); } catch(e) {}
  }
  return parseFloat(raw) || 0;
}

// ===================== MEGA-ADD HELPER =====================
// After any module save, show a quick "Add another?" prompt at the bottom.
function promptAddAnother(moduleLabel, openFn) {
  // Cap at 3 prompts per module to avoid annoying users
  const key = 'vos_addcount_' + moduleLabel;
  const count = parseInt(localStorage.getItem(key) || '0');
  if (count >= 3) return;
  localStorage.setItem(key, count + 1);
  // Remove any existing prompt
  const existing = document.getElementById('add-another-bar');
  if (existing) existing.remove();

  const bar = document.createElement('div');
  bar.id = 'add-another-bar';
  bar.style.cssText = `
    position:fixed;bottom:calc(var(--tabh) + env(safe-area-inset-bottom) + 8px);left:50%;transform:translateX(-50%);
    background:var(--bg2);border:1px solid var(--border2);border-radius:var(--rfull);
    padding:10px 18px;display:flex;align-items:center;gap:12px;z-index:9999;
    box-shadow:var(--shadowlg);animation:slideIn .25s var(--spring);white-space:nowrap;
  `;
  bar.innerHTML = `<span style="font-size:13px;color:var(--text2)">Add another ${moduleLabel}?</span>
    <button class="btn btn-p btn-sm" onclick="document.getElementById('add-another-bar').remove();(${openFn})()">Yes</button>
    <button class="btn btn-g btn-sm" onclick="document.getElementById('add-another-bar').remove()">No</button>`;
  document.body.appendChild(bar);
  // Auto-dismiss after 8s
  setTimeout(() => { if (bar.isConnected) bar.remove(); }, 8000);
}

// ===================== MORE SHEET =====================
function openMore() {
  const el = document.getElementById('moreSheet');
  if (el) { el.style.display = 'block'; }
}
function closeMore() {
  const el = document.getElementById('moreSheet');
  if (el) { el.style.display = 'none'; }
}

// ===================== PRIVACY MODE =====================
function togglePrivacy() {
  S.privacyMode = !S.privacyMode;
  document.body.classList.toggle('privacy', S.privacyMode);
  document.getElementById('privBtn').textContent = S.privacyMode ? '👁️ Visible' : '🙈 Privacy';
}

// ===================== BUILD NAV =====================
function buildSettTabs() {
  const el = document.getElementById('settTabs');
  if (!el) return;
  const tabs = [
    ['profile','👤 Profile'],['security','🔒 Security'],['appearance','🎨 Appearance'],
    ['modules','🧩 Modules'],['backup','💾 Backup'],['import','📥 Import'],
    ['accessibility','♿ Accessibility'],['about','ℹ️ About']
  ];
  const cur = (typeof SettingsNav !== 'undefined' ? SettingsNav.current : null) || 'profile';
  el.innerHTML = tabs.map(([id, label]) =>
    `<div class="tab-pill${cur === id ? ' on' : ''}" onclick="SettingsNav.show('${id}')">${label}</div>`
  ).join('');
}

function buildNav() {
  const active = ALL_MODULES.filter(m => S.modules[m.id]);
  const extras = [{ id:'settings', n:'Settings', ic:'⚙️' }, { id:'trash', n:'Trash', ic:'🗑️' }, { id:'reminders', n:'Reminders', ic:'🔔' }];
  const all = [{ id:'dashboard', n:'Dashboard', ic:'📊' }, ...active, ...extras];

  const groups = { Finance:'💰 Finance', Assets:'🏠 Assets & Property', Identity:'🪪 Identity & Accounts', Tools:'⚙️ Tools & Security' };
  const grouped = {};
  active.forEach(m => { if (!grouped[m.group]) grouped[m.group] = []; grouped[m.group].push(m); });

  let sbHTML = `<div class="ni${S.currentPage === 'dashboard' ? ' on' : ''}" data-pg="dashboard" onclick="R.goto('dashboard')"><span class="ni-ic">📊</span>Dashboard</div>`;
  Object.entries(groups).forEach(([grp, label]) => {
    if (!grouped[grp] || !grouped[grp].length) return;
    sbHTML += `<div style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text3);padding:12px 14px 4px">${label}</div>`;
    sbHTML += grouped[grp].filter(m => !!document.getElementById('pg-' + m.id)).map(m =>
      `<div class="ni${S.currentPage === m.id ? ' on' : ''}" data-pg="${m.id}" onclick="R.goto('${m.id}')"><span class="ni-ic">${m.ic}</span>${m.n}</div>`
    ).join('');
  });
  sbHTML += `<div style="height:1px;background:var(--border);margin:8px 14px"></div>`;
  const activeModIds = new Set(active.map(m => m.id));
  sbHTML += extras.filter(m => !activeModIds.has(m.id)).map(m =>
    `<div class="ni${S.currentPage === m.id ? ' on' : ''}" data-pg="${m.id}" onclick="R.goto('${m.id}')"><span class="ni-ic">${m.ic}</span>${m.n}</div>`
  ).join('');
  document.getElementById('sbNav').innerHTML = sbHTML;

  const nameEl = document.getElementById('sbUser');
  if (nameEl) nameEl.textContent = (S.user.name || 'User') + ' · v' + VER;

  const hasPage = id => !!document.getElementById('pg-' + id);
  const navMods = [{ id:'dashboard', n:'Dashboard', ic:'📊' }, ...active.filter(m => hasPage(m.id))];
  const first5 = navMods.slice(0, 5);
  const overflow = navMods.slice(5);
  const moreItem = { id:'__more__', n:'More', ic:'⋯' };
  const tabs = overflow.length > 0 ? [...first5, moreItem] : [...first5, { id:'settings', n:'Settings', ic:'⚙️' }];

  // Populate moreGrid for the More sheet
  const mg = document.getElementById('moreGrid');
  if (mg) {
    const first5Ids = new Set(first5.map(m => m.id));
    const seenIds = new Set();
    const moreItems = [...overflow, ...extras].filter(m => {
      if (first5Ids.has(m.id)) return false;
      if (seenIds.has(m.id)) return false;
      seenIds.add(m.id);
      return true;
    });
    const getItemCount = id => {
      if (id === 'trash') return (S.trash || []).length;
      if (id === 'reminders') return (S.reminders || []).filter(r => !r.done && r.date && new Date(r.date) <= new Date()).length;
      const arr = S[id];
      return Array.isArray(arr) ? arr.length : 0;
    };
    mg.innerHTML = moreItems.map(m => {
      const cnt = getItemCount(m.id);
      const badge = cnt > 0 ? `<span style="position:absolute;top:-4px;right:-5px;background:var(--accent);color:#fff;font-size:9px;font-weight:800;padding:0 4px;border-radius:5px;min-width:14px;text-align:center;line-height:16px">${cnt}</span>` : '';
      return `<div onclick="R.goto('${m.id}');closeMore()" style="text-align:center;padding:12px 4px;background:var(--glass);border:1px solid var(--border);border-radius:12px;cursor:pointer">
        <div style="position:relative;display:inline-block;margin-bottom:5px"><span style="font-size:22px">${m.ic}</span>${badge}</div>
        <div style="font-size:10px;font-weight:600;color:var(--text2)">${m.n}</div>
      </div>`;
    }).join('');
  }

  document.getElementById('btabs').innerHTML = tabs.map(m =>
    `<div class="ti${S.currentPage === m.id ? ' on' : ''}" data-pg="${m.id}" onclick="${m.id==='__more__'?'openMore()':'R.goto(\''+m.id+'\')'}"><div class="ti-ic">${m.ic}</div><span>${m.n.length > 7 ? m.n.slice(0, 6) + '…' : m.n}</span></div>`
  ).join('');

  const modMap = { banks:'Banks', cards:'Cards', investments:'Inv', cash:'Cash', loans:'Loans', friends:'Friends', sims:'Sims', assets:'Assets', expenses:'Exp', emails:'Emails', gadgets:'Gadgets', digital:'Digital', vehicles:'Vehicles', trash:'Trash' };
  const quickAdds = [
    {id:'cash',  icon:'💵', label:'Cash',  obj:'Cash'},
    {id:'loans', icon:'🤝', label:'Loan',  obj:'Loans'},
    {id:'banks', icon:'🏦', label:'Bank',  obj:'Banks'},
    {id:'cards', icon:'💳', label:'Card',  obj:'Cards'},
  ].filter(q => S.modules[q.id] && document.getElementById('pg-' + q.id));
  const fabItems = [
    ...quickAdds.map(q => `<div class="fmi" onclick="${q.obj}.openAdd();FAB.close()">${q.icon} Add ${q.label}</div>`),
    '<div class="fmi" onclick="AIImport.openImportModal();FAB.close()">🤖 AI Import</div>',
    '<div class="fmi" onclick="CMD.open();FAB.close()">⌘ Search Everything</div>',
    '<div class="fmi" onclick="R.lock();FAB.close()">🔒 Lock Vault</div>'
  ];
  document.getElementById('fabMenu').innerHTML = fabItems.join('');
}

// ===================== COMMAND PALETTE =====================
let cmdRes = [], cmdIdx = -1;
const CMD = {
  open() {
    document.getElementById('cmdPal').classList.add('on');
    document.getElementById('cmdIn').value = '';
    this.search('');
    setTimeout(() => document.getElementById('cmdIn').focus(), 80);
  },
  close() { document.getElementById('cmdPal').classList.remove('on'); cmdIdx = -1; },
  fuzzyMatch(str, q) {
    str = str.toLowerCase(); q = q.toLowerCase();
    if (str.includes(q)) return true;
    let si = 0;
    for (let qi = 0; qi < q.length; qi++) { const idx = str.indexOf(q[qi], si); if (idx === -1) return false; si = idx + 1; }
    return true;
  },
  recentActions: [],
  addRecent(action) { this.recentActions = [action, ...this.recentActions.filter(a => a.label !== action.label)].slice(0, 8); },
  _allCmds: [
    {icon:'🏦',label:'Add Bank',action:()=>Banks.openAdd()},
    {icon:'💳',label:'Add Card',action:()=>Cards.openAdd()},
    {icon:'📈',label:'Add Investment',action:()=>Inv.openAdd()},
    {icon:'💵',label:'Add Cash',action:()=>Cash.openAdd()},
    {icon:'🤝',label:'Add Loan',action:()=>Loans.openAdd()},
    {icon:'📱',label:'Add SIM',action:()=>Sims.openAdd()},
    {icon:'🏠',label:'Add Asset',action:()=>Assets.openAdd()},
    {icon:'📋',label:'Add Expense',action:()=>Exp.openAdd()},
    {icon:'📧',label:'Add Email',action:()=>Emails.openAdd()},
    {icon:'💻',label:'Add Device',action:()=>Gadgets.openAdd()},
    {icon:'💼',label:'Add Login',action:()=>Digital.openAdd()},
    {icon:'🪪',label:'Add Document',action:()=>DocsModule.openAdd()},
    {icon:'📊',label:'Dashboard',action:()=>R.goto('dashboard')},
    {icon:'⚙️',label:'Settings',action:()=>R.goto('settings')},
    {icon:'🔒',label:'Lock Vault',action:()=>R.lock()},
    {icon:'🚨',label:'Panic Lock',action:()=>PanicLock.trigger()},
    {icon:'🎨',label:'Theme Dark',action:()=>ThemeEngine.apply('dark')},
    {icon:'🎨',label:'Theme Light',action:()=>ThemeEngine.apply('light')},
    {icon:'🎨',label:'Theme Ocean',action:()=>ThemeEngine.apply('ocean')},
    {icon:'🎨',label:'Theme Forest',action:()=>ThemeEngine.apply('forest')},
    {icon:'🎨',label:'Change Theme',action:()=>ThemeEngine.openPicker()},
    {icon:'📤',label:'Export Vault',action:()=>ExIm.export('vault')},
    {icon:'📸',label:'Net Worth Snapshot',action:()=>Dash.snap()},
    {icon:'🙈',label:'Privacy Mode',action:()=>togglePrivacy()},
    {icon:'🗑️',label:'Trash',action:()=>R.goto('trash')},
    {icon:'💾',label:'Backup',action:()=>R.goto('backup')},
    {icon:'🔔',label:'Reminders',action:()=>R.goto('reminders')},
    {icon:'🛡️',label:'Security',action:()=>R.goto('security')},
    {icon:'📅',label:'Timeline',action:()=>R.goto('timeline')},
    {icon:'📥',label:'Import',action:()=>R.goto('import')},
  ],
  search(q) {
    const ql = q.toLowerCase(); cmdRes = [];
    if (!q) {
      if (this.recentActions.length) {
        this.recentActions.forEach(a => cmdRes.push({ ...a, cat:'Recent' }));
      } else {
        [
          {icon:'⌘', label:'⌘K — command palette', cat:'Shortcuts', action:null},
          {icon:'⌘', label:'⌘L — lock vault', cat:'Shortcuts', action:()=>R.lock()},
          {icon:'⌘', label:'⌘F — search', cat:'Shortcuts', action:()=>R.goto('search')},
          {icon:'⎋', label:'Escape — close palette', cat:'Shortcuts', action:null},
          {icon:'💬', label:'Try: "add bank" · "lock" · "theme dark" · "reminders"', cat:'Shortcuts', action:null},
        ].forEach(a => cmdRes.push(a));
      }
      [
        { cat:'Navigate', items:[['📊','Dashboard',()=>R.goto('dashboard')],['🔔','Reminders',()=>R.goto('reminders')],['📅','Timeline',()=>R.goto('timeline')],['🛡️','Security',()=>R.goto('security')],['💾','Backup',()=>R.goto('backup')],['⚙️','Settings',()=>R.goto('settings')],['📥','Import',()=>R.goto('import')]] },
        { cat:'Add Entry', items:[['🏦','Add Bank',()=>Banks.openAdd()],['💳','Add Card',()=>Cards.openAdd()],['📈','Add Investment',()=>Inv.openAdd()],['📱','Add SIM',()=>Sims.openAdd()],['🏠','Add Asset',()=>Assets.openAdd()],['📋','Add Expense',()=>Exp.openAdd()],['📧','Add Email',()=>Emails.openAdd()],['💻','Add Device',()=>Gadgets.openAdd()],['💼','Add Login',()=>Digital.openAdd()]] },
        { cat:'Vault Actions', items:[['🎨','Change Theme',()=>ThemeEngine.openPicker()],['📤','Export Encrypted Vault',()=>ExIm.export('vault')],['📸','Net Worth Snapshot',()=>Dash.snap()],['👝','Edit Wallet',()=>Dash.editWallet()],['🙈','Toggle Privacy Mode',()=>togglePrivacy()],['🔒','Lock Vault',()=>R.lock()],['🚨','Panic Lock',()=>PanicLock.trigger()]] },
      ].forEach(({ cat, items }) => items.forEach(([i, l, a]) => cmdRes.push({ icon:i, label:l, action:a, cat })));
    } else {
      const fm = this.fuzzyMatch.bind(this);
      this._allCmds.filter(c => fm(c.label, ql)).slice(0, 5).forEach(c => cmdRes.push({...c, cat:'Actions'}));
      S.banks.filter(b => fm(b.bankName || '', ql)).slice(0, 4).forEach(b => cmdRes.push({ icon:'🏦', label:b.bankName + ' · ' + b.currency + (b.last4 ? ' ****' + b.last4 : ''), cat:'Banks', action:()=>Banks.detail(b.id) }));
      S.cards.filter(cv => fm(cv.cardName || '', ql) || fm(cv.last4 || '', ql)).slice(0, 4).forEach(cv => cmdRes.push({ icon:'💳', label:cv.cardName + (cv.last4 ? ' ****' + cv.last4 : ''), cat:'Cards', action:()=>Cards.openDetail(cv.id) }));
      S.investments.filter(i => fm(i.investmentName || '', ql) || fm(i.broker || '', ql)).slice(0, 3).forEach(i => cmdRes.push({ icon:'📈', label:i.investmentName || i.broker, cat:'Investments', action:()=>Inv.edit(i.id) }));
      S.emails.filter(e => fm(e.email, ql) || fm(e.provider || '', ql)).slice(0, 3).forEach(e => cmdRes.push({ icon:'📧', label:e.email, cat:'Emails', action:()=>Emails.detail(e.id) }));
      S.gadgets.filter(g => fm(g.name, ql) || fm(g.brand || '', ql) || fm(g.serialNum || '', ql)).slice(0, 3).forEach(g => cmdRes.push({ icon:g.ic || '💻', label:g.name + (g.storage ? ' · ' + g.storage : ''), cat:'Devices', action:()=>Gadgets.detail(g.id) }));
      S.digital.filter(d => fm(d.serviceName, ql) || fm(d.username || '', ql)).slice(0, 3).forEach(d => cmdRes.push({ icon:'💼', label:d.serviceName + (d.username ? ' · @' + d.username : ''), cat:'Logins', action:()=>Digital.detail(d.id) }));
      S.expenses.filter(e => fm(e.name, ql)).slice(0, 3).forEach(e => cmdRes.push({ icon:e.icon || '📋', label:e.name + ' · ' + e.currency + ' ' + e.amount + '/mo', cat:'Expenses', action:()=>Exp.edit(e.id) }));
      S.assets.filter(a => fm(a.name, ql) || fm(a.assetType || '', ql)).slice(0, 3).forEach(a => cmdRes.push({ icon:'🏠', label:a.name, cat:'Assets', action:()=>Assets.edit(a.id) }));
      S.sims.filter(s => fm(s.network, ql) || fm(s.phone || '', ql)).slice(0, 3).forEach(s => cmdRes.push({ icon:'📱', label:s.network + ' ' + U.flag(s.country), cat:'SIMs', action:()=>Sims.detail(s.id) }));
      if (!cmdRes.length) cmdRes.push({ icon:'🔍', label:`No results for "${q}"`, cat:'', action:null });
    }
    cmdIdx = -1;
    let html = '', lastCat = null;
    cmdRes.forEach((r, i) => {
      if (r.cat !== lastCat) {
        if (r.cat) html += `<div class="ci-cat">${r.cat}</div>`;
        lastCat = r.cat;
      }
      if (!r.action) {
        html += `<div class="ci ci-info" id="ci${i}"><span class="ci-ic">${r.icon}</span><span>${r.label}</span></div>`;
      } else {
        html += `<div class="ci" id="ci${i}" onclick="CMD.select(${i})"><span class="ci-ic">${r.icon}</span><span>${r.label}</span></div>`;
      }
    });
    document.getElementById('cmdList').innerHTML = html;
  },
  select(i) { const r = cmdRes[i]; if (r?.action) { this.addRecent(r); this.close(); r.action(); } },
  key(e) {
    const items = document.querySelectorAll('.ci');
    if (e.key === 'ArrowDown') cmdIdx = Math.min(cmdIdx + 1, items.length - 1);
    else if (e.key === 'ArrowUp') cmdIdx = Math.max(cmdIdx - 1, 0);
    else if (e.key === 'Enter') { this.select(cmdIdx >= 0 ? cmdIdx : 0); return; }
    else if (e.key === 'Escape') { this.close(); return; }
    items.forEach((el, i) => el.classList.toggle('hi', i === cmdIdx));
    if (cmdIdx >= 0) items[cmdIdx]?.scrollIntoView({ block:'nearest' });
  }
};

// ===================== FAB =====================
const FAB = {
  toggle() {
    const m = document.getElementById('fabMenu'), btn = document.getElementById('fab');
    const o = m.classList.toggle('on'); btn.classList.toggle('open', o); btn.textContent = o ? '✕' : '＋';
  },
  close() {
    const m = document.getElementById('fabMenu'), btn = document.getElementById('fab');
    m.classList.remove('on'); btn.classList.remove('open'); btn.textContent = '＋';
  }
};

// ===================== PANIC LOCK =====================
const PanicLock = {
  trigger() {
    if (!window.__vos_confirm('⚠️ PANIC LOCK: This will immediately lock the vault and clear the screen. Continue?')) return;
    document.querySelectorAll('.sens').forEach(el => el.textContent = '••••');
    R.lock();
    Toast.show('Vault panic-locked', 'warning', 2000);
    Activity.log('Panic lock triggered');
  }
};

(function() {
  const btn = document.createElement('button');
  btn.className = 'panic-btn'; btn.title = 'Panic Lock';
  btn.innerHTML = '🚨'; btn.onclick = () => PanicLock.trigger();
  btn.id = 'panicBtn'; document.body.appendChild(btn);
})();

// ===================== DECOY MODE =====================
function loadDecoyData() {
  S.banks=[]; S.cards=[]; S.investments=[]; S.cash=[]; S.loans=[]; S.friends=[]; S.sims=[]; S.assets=[];
  S.expenses=[]; S.emails=[]; S.gadgets=[]; S.digital=[]; S.activity=[]; S.wallet=[]; S.vehicles=[];
  const id = U.id, ts = () => new Date().toISOString();
  const names = ['Ali Hassan','Sara Ahmed','Omar Khan','Fatima Malik'];
  const dName = names[Math.floor(Math.random() * names.length)];
  const dFirst = dName.split(' ')[0];
  const rl4 = () => String(1000 + Math.floor(Math.random() * 8999));
  // 2 random PK commercial banks
  const pkBanks = BANKS_DB.filter(b => b.c === 'PK' && (b.t === 'commercial' || b.t === 'islamic'));
  const shuffled = [...pkBanks].sort(() => Math.random() - 0.5);
  const selBanks = shuffled.slice(0, 2);
  selBanks.forEach((b, i) => {
    S.banks.push({ id:id(), bankName:b.n, country:'PK', bankType:b.t, accountType:i===0?'Current':'Savings', currency:'PKR', last4:rl4(), holderName:dName, tags:[i===0?'Primary':'Secondary'], favorite:i===0, createdAt:ts() });
  });
  // 1 random debit card
  const selCard = CARDS_DB.filter(c => c.cat === 'Debit')[Math.floor(Math.random() * CARDS_DB.filter(c => c.cat === 'Debit').length)];
  const expYr = (new Date().getFullYear() - 2000 + 3);
  const expMo = String(Math.floor(Math.random() * 12) + 1).padStart(2,'0');
  S.cards.push({ id:id(), cardName:selCard.n, network:selCard.net, cardType:'Debit', category:'Standard', country:'PK', last4:rl4(), expiry:`${expMo}/${expYr}`, holderName:dName.toUpperCase(), issuer:selCard.n.split(' ')[0], tags:['Primary'], createdAt:ts() });
  // Jazz SIM
  S.sims.push({ id:id(), network:'Jazz', country:'PK', simType:'Physical', status:'Active', phone:`+92 300 ${Math.floor(1000000 + Math.random() * 8999999)}`, dataPlan:10, createdAt:ts() });
  // Small cash amount
  const cashAmt = Math.floor(2000 + Math.random() * 13000);
  S.cash.push({ id:id(), label:'Wallet', amount:cashAmt, currency:'PKR', location:'Wallet', createdAt:ts() });
  // 1 PSX stock
  const stocks = [
    {name:'Engro Corporation',ticker:'ENGRO',inv:150000,cur:163500},
    {name:'Lucky Cement',ticker:'LUCK',inv:90000,cur:97200},
    {name:'HBL',ticker:'HBL',inv:120000,cur:128400},
    {name:'MCB Bank',ticker:'MCB',inv:80000,cur:86400},
    {name:'Pakistan Petroleum',ticker:'PPL',inv:60000,cur:64800},
  ];
  const st = stocks[Math.floor(Math.random() * stocks.length)];
  S.investments.push({ id:id(), investmentName:st.name, broker:'Arif Habib Limited', type:'Stocks', ticker:st.ticker, country:'PK', currency:'PKR', amountInvested:st.inv, currentValue:st.cur, riskLevel:'Medium', ownership:'personal', tags:['PSX'], createdAt:ts() });
  S.user.name = dName;
  S.user.netWorth = cashAmt + st.cur;
  S.user.currency = 'PKR';
  Activity.log('Vault unlocked');
  Store.save();
  R.goto('dashboard');
}

// ===================== SECURITY HARDENING =====================

// Console suppression in production (non-localhost)
(function() {
  const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.hostname === '';
  if (!isLocal) {
    const noop = () => {};
    ['log', 'debug', 'info', 'warn'].forEach(m => { try { window.console[m] = noop; } catch(e) {} });
  }
})();

// Clipboard auto-clear helper — clear after clipSecs seconds
function _scheduleClipClear() {
  const secs = S.clipSecs || 30;
  setTimeout(() => {
    try { navigator.clipboard.writeText(''); } catch(e) {}
  }, secs * 1000);
}

// Anti-devtools: blur app when devtools likely open
(function() {
  let _dtOpen = false;
  function _checkDevtools() {
    const w = window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160;
    if (w && !_dtOpen) {
      _dtOpen = true;
      if (S.unlocked) document.body.classList.add('app-blur');
    } else if (!w && _dtOpen) {
      _dtOpen = false;
      document.body.classList.remove('app-blur');
    }
  }
  window.addEventListener('resize', _checkDevtools);
})();

// ===================== APP INIT =====================
async function App() {
  document.addEventListener('click', function(e) {
    const ni = e.target.closest('[data-pg]');
    if (ni && ni.dataset.pg) R.goto(ni.dataset.pg);
  });

  document.addEventListener('keydown', function(e) {
    if (S.unlocked) return;
    const lk = document.getElementById('pgLock');
    if (!lk || lk.style.display === 'none') return;
    if (e.key >= '0' && e.key <= '9') { e.preventDefault(); PIN.in(e.key); }
    else if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); PIN.del(); }
    else if (e.key === 'Enter') { e.preventDefault(); }
    else if (e.key === 'Escape') { PIN.reset(); }
  });

  document.addEventListener('keydown', function(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); if (S.unlocked) CMD.open(); }
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') { e.preventDefault(); if (S.unlocked) FAB.toggle(); }
    if ((e.metaKey || e.ctrlKey) && e.key === 'l') { e.preventDefault(); if (S.unlocked) R.lock(); }
    if ((e.metaKey || e.ctrlKey) && e.key === 'f') { e.preventDefault(); if (S.unlocked) { R.goto('search'); setTimeout(() => document.getElementById('gs-input')?.focus(), 200); } }
    if ((e.metaKey || e.ctrlKey) && e.key === '1') { e.preventDefault(); if (S.unlocked) R.goto('dashboard'); }
    if ((e.metaKey || e.ctrlKey) && e.key === '2') { e.preventDefault(); if (S.unlocked) R.goto('banks'); }
    if ((e.metaKey || e.ctrlKey) && e.key === '3') { e.preventDefault(); if (S.unlocked) R.goto('cards'); }
    if (e.key === 'Escape') { CMD.close(); Modal.close(); FAB.close(); ThemeEngine.closePicker(); }
  });

  // Auto-lock on tab/window hide; blur screenshot on hide
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      document.body.classList.add('app-blur');
      if (S.unlocked && S.autoLock) { R.lock(); }
    } else {
      document.body.classList.remove('app-blur');
    }
  });

  window.addEventListener('online',  function() { document.getElementById('offBar').classList.remove('on'); });
  window.addEventListener('offline', function() { document.getElementById('offBar').classList.add('on'); });
  if (!navigator.onLine) document.getElementById('offBar').classList.add('on');

  document.querySelectorAll('.key').forEach(function(k) {
    k.addEventListener('click', function() { if (navigator.vibrate) navigator.vibrate(6); });
  });

  // Restore brute-force state from lightweight localStorage (pre-unlock)
  try {
    const fc = JSON.parse(localStorage.getItem('vos_fails') || 'null');
    if (fc) { S.fails = fc.fails || 0; S.lockedUntil = fc.lockedUntil || 0; }
  } catch(e) {}

  // Load non-sensitive prefs for startup display (theme, font scale)
  const prefs = Store.loadPrefs();
  if (prefs) {
    if (prefs.theme)       S.user.theme    = prefs.theme;
    if (prefs.fontScale)   S.fontScale     = prefs.fontScale;
    if (prefs.highContrast) S.highContrast = prefs.highContrast;
    if (prefs.name)        S.user.name     = prefs.name;
  }

  const startTheme = S.user.theme || 'dark';
  ThemeEngine.apply(startTheme);
  const fs = S.fontScale || 'md';
  // Preserve theme class when adding font-scale; ThemeEngine.apply already preserves them on re-apply
  if (!document.body.className.includes('fs-')) {
    document.body.className = document.body.className.trim() + ' fs-' + fs;
  }
  if (S.highContrast && !document.body.classList.contains('hc')) document.body.classList.add('hc');

  // Check if old localStorage data exists (migration)
  const oldData = Store.loadRaw();
  if (oldData) { Migrate.run(); }

  // Determine startup screen
  const hasVaultDB = await VaultDB.isInitialized();
  const hasOldData = !!oldData;
  const hasData    = hasVaultDB || hasOldData;

  if (!hasData || !(prefs?.hasVault || oldData?.user?.name)) {
    document.getElementById('pgOnboard').style.display = 'flex';
    OB.init();
  } else {
    R.showHome();
  }
}

App();
