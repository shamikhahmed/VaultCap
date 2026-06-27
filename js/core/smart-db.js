// VaultCap — smart autocomplete database (extracted from app.js)

// ===================== SMART AUTOCOMPLETE DB =====================
const SMART_DB = {
  banks:[
    // ── PK COMMERCIAL BANKS ──
    {name:'HBL',aliases:['Habib Bank Limited','Habib Bank','HBL Konnect','HBL Islamic','HBL Pay'],country:'PK',currency:'PKR',type:'commercial',swift:'HABBPKKA'},
    {name:'UBL',aliases:['United Bank Limited','United Bank','UBL Ameen'],country:'PK',currency:'PKR',type:'commercial',swift:'UNILPKKA'},
    {name:'MCB Bank',aliases:['MCB','Muslim Commercial Bank','MCB Islamic','NIB Bank'],country:'PK',currency:'PKR',type:'commercial',swift:'MCIBPKKA'},
    {name:'Bank Alfalah',aliases:['Alfalah','BankAlfalah','Bank Alfalah Islamic','Alfalah Islamic'],country:'PK',currency:'PKR',type:'commercial',swift:'ALFHPKKA'},
    {name:'Allied Bank',aliases:['ABL','Allied Bank Limited','Allied Islamic','Allied Bank Islamic'],country:'PK',currency:'PKR',type:'commercial',swift:'ABPAPKKA'},
    {name:'Askari Bank',aliases:['ACBL','Askari'],country:'PK',currency:'PKR',type:'commercial',swift:'ASCMPKKA'},
    {name:'Bank Al Habib',aliases:['BAHL','Al Habib Bank'],country:'PK',currency:'PKR',type:'commercial',swift:'BAHLPKKA'},
    {name:'Habib Metro Bank',aliases:['Habib Metropolitan','Habib Metro'],country:'PK',currency:'PKR',type:'commercial',swift:'MPBLPKKA'},
    {name:'Standard Chartered PK',aliases:['Standard Chartered Pakistan','StanChart PK','SC Pakistan'],country:'PK',currency:'PKR',type:'international',swift:'SCBLPKKX'},
    {name:'Deutsche Bank PK',aliases:['Deutsche Bank Pakistan'],country:'PK',currency:'PKR',type:'international',swift:'DEUTPKKA'},
    {name:'Bank of China PK',aliases:['Bank of China Pakistan','BOC Pakistan'],country:'PK',currency:'PKR',type:'international',swift:'BKCHPKKA'},
    {name:'ICBC Pakistan',aliases:['Industrial and Commercial Bank of China PK','ICBC PK'],country:'PK',currency:'PKR',type:'international',swift:null},
    {name:'China Development Bank PK',aliases:['CDB Pakistan'],country:'PK',currency:'PKR',type:'international',swift:null},
    {name:'SAMBA Bank',aliases:['Samba Financial Group PK','SAMBA PK'],country:'PK',currency:'PKR',type:'commercial',swift:'SMBOPKKA'},
    {name:'Silkbank',aliases:['Silk Bank','SILK'],country:'PK',currency:'PKR',type:'commercial',swift:null},
    {name:'Soneri Bank',aliases:['Soneri'],country:'PK',currency:'PKR',type:'commercial',swift:'SONEPKKA'},
    {name:'Summit Bank',aliases:['Summit','Sindh Bank Summit'],country:'PK',currency:'PKR',type:'commercial',swift:null},
    {name:'JS Bank',aliases:['JSB','JS'],country:'PK',currency:'PKR',type:'commercial',swift:'JSBLPKKA'},
    // ── PK ISLAMIC BANKS ──
    {name:'Meezan Bank',aliases:['Meezan','Al Meezan Bank'],country:'PK',currency:'PKR',type:'islamic',swift:'MEZNPKKA'},
    {name:'Bank Islami',aliases:['BankIslami','KASB Bank','BIPL'],country:'PK',currency:'PKR',type:'islamic',swift:null},
    {name:'Dubai Islamic Bank PK',aliases:['DIB Pakistan','DIB PK'],country:'PK',currency:'PKR',type:'islamic',swift:null},
    {name:'Al Baraka Bank PK',aliases:['Al Baraka Pakistan','Albaraka Bank PK'],country:'PK',currency:'PKR',type:'islamic',swift:'ARAKPKKA'},
    {name:'Faysal Bank',aliases:['Faysal','FBL','Faysal Bank Islamic'],country:'PK',currency:'PKR',type:'islamic',swift:'FAYSPKKA'},
    // ── PK MICROFINANCE / DIGITAL ──
    {name:'Sadapay',aliases:['Sada Pay'],country:'PK',currency:'PKR',type:'digital',swift:null},
    {name:'NayaPay',aliases:['Naya Pay'],country:'PK',currency:'PKR',type:'digital',swift:null},
    {name:'Zindigi',aliases:['Jazz Zindigi'],country:'PK',currency:'PKR',type:'digital',swift:null},
    {name:'JazzCash',aliases:['Jazz Cash','Jazz Mobile Money'],country:'PK',currency:'PKR',type:'microfinance',swift:null},
    {name:'EasyPaisa',aliases:['Easy Paisa','Easypaisa','Telenor Microfinance'],country:'PK',currency:'PKR',type:'microfinance',swift:null},
    {name:'UPaisa',aliases:['U Paisa','Ufone Wallet','Ufone Mobile Paisa'],country:'PK',currency:'PKR',type:'microfinance',swift:null},
    {name:'TimePey',aliases:['Time Pey'],country:'PK',currency:'PKR',type:'microfinance',swift:null},
    {name:'Finja',aliases:['SimSim','Finja SimSim'],country:'PK',currency:'PKR',type:'digital',swift:null},
    {name:'HBL Pay',aliases:['HBL Mobile Wallet','HBL Konnect Digital'],country:'PK',currency:'PKR',type:'digital',swift:null},
    {name:'MCB Lite',aliases:['MCB Mobile','MCB Lite Prepaid','MCB Mobile App'],country:'PK',currency:'PKR',type:'digital',swift:null},
    {name:'PayFast',aliases:['Pay Fast PK'],country:'PK',currency:'PKR',type:'digital',swift:null},
    // ── PK GOVERNMENT / DFI BANKS ──
    {name:'NBP',aliases:['National Bank of Pakistan','National Bank'],country:'PK',currency:'PKR',type:'government',swift:'NBPKPKKA'},
    {name:'Bank of Punjab',aliases:['BOP','BoP'],country:'PK',currency:'PKR',type:'government',swift:null},
    {name:'First Women Bank',aliases:['FWBL'],country:'PK',currency:'PKR',type:'government',swift:null},
    {name:'Zarai Taraqiati Bank',aliases:['ZTBL','Agricultural Bank PK','ADBP'],country:'PK',currency:'PKR',type:'government',swift:null},
    {name:'SME Bank',aliases:['SME Bank Pakistan','Small and Medium Enterprise Bank'],country:'PK',currency:'PKR',type:'government',swift:null},
    {name:'Industrial Development Bank',aliases:['IDBP'],country:'PK',currency:'PKR',type:'government',swift:null},
    {name:'HBFC',aliases:['House Building Finance Company','House Building Finance Corporation'],country:'PK',currency:'PKR',type:'government',swift:null},
    // ── PK FOREIGN BANKS ──
    {name:'HSBC Pakistan',aliases:['HSBC PK'],country:'PK',currency:'PKR',type:'international',swift:'HSBCPKKA'},
    {name:'Citibank PK',aliases:['Citi Pakistan','Citibank Pakistan','Citi PK'],country:'PK',currency:'PKR',type:'international',swift:'CITIPKKA'},
    // ── PK ADDITIONAL MICROFINANCE / SPECIAL BANKS ──
    {name:'Khushhali Microfinance Bank',aliases:['KMBL','Khushhali Bank','KMB','Khushhali MFB'],country:'PK',currency:'PKR',type:'microfinance',swift:null},
    {name:'NRSP Microfinance Bank',aliases:['NRSP Bank','NRSP MFB'],country:'PK',currency:'PKR',type:'microfinance',swift:null},
    {name:'Apna Microfinance Bank',aliases:['Apna Bank','Apna MFB'],country:'PK',currency:'PKR',type:'microfinance',swift:null},
    {name:'Mobilink Microfinance Bank',aliases:['MMBL','Mobilink Bank','Mobilink MFB'],country:'PK',currency:'PKR',type:'microfinance',swift:null},
    {name:'Telenor Microfinance Bank',aliases:['TMB','Telenor MFB'],country:'PK',currency:'PKR',type:'microfinance',swift:null},
    {name:'U Microfinance Bank',aliases:['U Bank','UMicro','U MFB'],country:'PK',currency:'PKR',type:'microfinance',swift:null},
    {name:'FINCA Microfinance Bank',aliases:['FINCA Pakistan','FINCA MFB'],country:'PK',currency:'PKR',type:'microfinance',swift:null},
    {name:'First MicroFinance Bank',aliases:['FMFB','First Micro','First MFB'],country:'PK',currency:'PKR',type:'microfinance',swift:null},
    {name:'Kashf Microfinance Bank',aliases:['Kashf Bank','Kashf MFB','Kashf Foundation'],country:'PK',currency:'PKR',type:'microfinance',swift:null},
    {name:'Akhuwat Islamic Microfinance',aliases:['Akhuwat Bank','Akhuwat'],country:'PK',currency:'PKR',type:'microfinance',swift:null},
    {name:'Pak Oman Investment Company',aliases:['Pak Oman','POIC'],country:'PK',currency:'PKR',type:'investment',swift:null},
    {name:'Pak Kuwait Investment Company',aliases:['Pak Kuwait','PKIC'],country:'PK',currency:'PKR',type:'investment',swift:null},
    {name:'Pakistan Post Savings',aliases:['Pakistan Post Office Savings','PO Savings','Post Office Savings'],country:'PK',currency:'PKR',type:'government',swift:null},
    // ── UK TRADITIONAL BANKS ──
    {name:'Barclays',aliases:['Barclays Bank','Barclaycard','Barclays International'],country:'GB',currency:'GBP',type:'commercial',swift:'BARCGB22'},
    {name:'HSBC UK',aliases:['HSBC','HSBC Holdings','HSBC Kinetic'],country:'GB',currency:'GBP',type:'commercial',swift:'MIDLGB22'},
    {name:'NatWest',aliases:['National Westminster Bank','National Westminster'],country:'GB',currency:'GBP',type:'commercial',swift:'NWBKGB2L'},
    {name:'Lloyds Bank',aliases:['Lloyds','Lloyds Banking Group','Lloyds Business','Lloyds International'],country:'GB',currency:'GBP',type:'commercial',swift:'LOYDGB2L'},
    {name:'Santander UK',aliases:['Santander','Abbey National'],country:'GB',currency:'GBP',type:'commercial',swift:'ABBYGB2L'},
    {name:'Halifax',aliases:['Halifax Bank','Halifax Building Society'],country:'GB',currency:'GBP',type:'commercial',swift:'HLFXGB21'},
    {name:'Nationwide',aliases:['Nationwide Building Society'],country:'GB',currency:'GBP',type:'commercial',swift:'NAIAGB21'},
    {name:'Metro Bank',aliases:['Metro Bank UK'],country:'GB',currency:'GBP',type:'commercial',swift:'MYMBGB2L'},
    {name:'TSB',aliases:['TSB Bank'],country:'GB',currency:'GBP',type:'commercial',swift:'TSBSGB2A'},
    {name:'Bank of Scotland',aliases:['BoS Scotland','BOS'],country:'GB',currency:'GBP',type:'commercial',swift:'BOFSGB21'},
    {name:'Royal Bank of Scotland',aliases:['RBS','RBS Group'],country:'GB',currency:'GBP',type:'commercial',swift:'RBSSGB2L'},
    {name:'Ulster Bank',aliases:['Ulster Bank NI'],country:'GB',currency:'GBP',type:'commercial',swift:null},
    {name:'Yorkshire Bank',aliases:['Yorkshire','Clydesdale Yorkshire'],country:'GB',currency:'GBP',type:'commercial',swift:null},
    {name:'Clydesdale Bank',aliases:['Clydesdale'],country:'GB',currency:'GBP',type:'commercial',swift:'CLYDGB21'},
    {name:'Virgin Money',aliases:['Virgin Money UK','Virgin Bank UK'],country:'GB',currency:'GBP',type:'commercial',swift:null},
    {name:'Co-operative Bank',aliases:['Co-op Bank','The Co-operative Bank','Cooperative Bank'],country:'GB',currency:'GBP',type:'commercial',swift:'CPBKGB22'},
    {name:'Post Office Money',aliases:['Post Office Bank','PO Money'],country:'GB',currency:'GBP',type:'commercial',swift:null},
    // ── UK DIGITAL / CHALLENGER BANKS ──
    {name:'Monzo',aliases:['Monzo Bank'],country:'GB',currency:'GBP',type:'digital',swift:'MONZGB2L'},
    {name:'Starling Bank',aliases:['Starling'],country:'GB',currency:'GBP',type:'digital',swift:'SRLGGB3L'},
    {name:'Revolut',aliases:['Revolut Bank'],country:'GB',currency:'GBP',type:'digital',swift:'REVOGB21'},
    {name:'Wise',aliases:['TransferWise','Wise Bank'],country:'GB',currency:'GBP',type:'digital',swift:'TRWIGB22'},
    {name:'Chase UK',aliases:['Chase Bank UK','JPMorgan Chase UK'],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'First Direct',aliases:['firstdirect'],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'Atom Bank',aliases:['Atom'],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'Tandem Bank',aliases:['Tandem'],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'Cashplus',aliases:['Zempler Bank','Cashplus Bank'],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'Suits Me',aliases:['SuitsMe'],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'Pockit',aliases:[],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'ANNA Money',aliases:['ANNA Business'],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'Tide',aliases:['Tide Business','Tide Bank'],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'Allica Bank',aliases:['Allica'],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'OakNorth Bank',aliases:['OakNorth'],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'Monument Bank',aliases:['Monument'],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'Zopa Bank',aliases:['Zopa'],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'Paysend',aliases:['Dozens','Paysend UK'],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'Zabel',aliases:['Zable','Zabel Visa'],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'Yonder',aliases:['Yonder Credit'],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'Wirex',aliases:['Wirex Visa','Wirex Bank'],country:'GB',currency:'GBP',type:'digital',swift:null},
    {name:'Klarna',aliases:['Klarna Card','Klarna Bank'],country:'GB',currency:'GBP',type:'digital',swift:null},
    // ── UK ISLAMIC BANKS ──
    {name:'Al Rayan Bank',aliases:['Islamic Bank of Britain','Al Rayan'],country:'GB',currency:'GBP',type:'islamic',swift:null},
    {name:'Gatehouse Bank',aliases:['Gatehouse'],country:'GB',currency:'GBP',type:'islamic',swift:null},
    {name:'Ansar Finance',aliases:['Ansar Housing'],country:'GB',currency:'GBP',type:'islamic',swift:null},
    // ── UK INTERNATIONAL BANKS ──
    {name:'Citibank UK',aliases:['Citi UK'],country:'GB',currency:'GBP',type:'international',swift:'CITIGB2L'},
    {name:'JP Morgan UK',aliases:['JPMorgan UK','J.P. Morgan UK'],country:'GB',currency:'GBP',type:'international',swift:'CHASGB2L'},
    {name:'Goldman Sachs UK',aliases:['Marcus UK','Marcus by Goldman Sachs','Goldman Sachs Marcus'],country:'GB',currency:'GBP',type:'international',swift:null},
    // ── UAE COMMERCIAL BANKS ──
    {name:'Emirates NBD',aliases:['ENBD','Emirates NBD Bank','Emirates National Bank of Dubai'],country:'AE',currency:'AED',type:'commercial',swift:'EBILAEAD'},
    {name:'FAB',aliases:['First Abu Dhabi Bank','NBAD','National Bank of Abu Dhabi'],country:'AE',currency:'AED',type:'commercial',swift:'FABEAEAD'},
    {name:'ADCB',aliases:['Abu Dhabi Commercial Bank'],country:'AE',currency:'AED',type:'commercial',swift:'ADCBAEAD'},
    {name:'Mashreq Bank',aliases:['Mashreq','Mashreq Neo'],country:'AE',currency:'AED',type:'commercial',swift:'BOMLAEAD'},
    {name:'RAKBank',aliases:['RAKBANK','National Bank of Ras Al-Khaimah','NRAK'],country:'AE',currency:'AED',type:'commercial',swift:'RAKBAEAD'},
    {name:'Commercial Bank of Dubai',aliases:['CBD','CBD Dubai'],country:'AE',currency:'AED',type:'commercial',swift:'CBDUAEAD'},
    {name:'United Arab Bank',aliases:['UAB','UAB UAE'],country:'AE',currency:'AED',type:'commercial',swift:null},
    {name:'Bank of Sharjah',aliases:['BoS Sharjah','BOS Sharjah'],country:'AE',currency:'AED',type:'commercial',swift:null},
    {name:'Investbank',aliases:['Invest Bank UAE'],country:'AE',currency:'AED',type:'commercial',swift:null},
    {name:'National Bank of Fujairah',aliases:['NBF','NBF UAE'],country:'AE',currency:'AED',type:'commercial',swift:'NBFUAEAD'},
    {name:'National Bank of Umm Al Qaiwain',aliases:['NBQ','NBQ UAE'],country:'AE',currency:'AED',type:'commercial',swift:null},
    {name:'Arab Bank UAE',aliases:['Arab Bank Dubai'],country:'AE',currency:'AED',type:'commercial',swift:null},
    // ── UAE ISLAMIC BANKS ──
    {name:'ADIB',aliases:['Abu Dhabi Islamic Bank'],country:'AE',currency:'AED',type:'islamic',swift:'ADIBAEAA'},
    {name:'Dubai Islamic Bank',aliases:['DIB','DIB UAE'],country:'AE',currency:'AED',type:'islamic',swift:'DUIBAEAD'},
    {name:'Emirates Islamic',aliases:['EI Bank','Emirates Islamic Bank','EIB'],country:'AE',currency:'AED',type:'islamic',swift:null},
    {name:'Sharjah Islamic Bank',aliases:['SIB','SIB UAE'],country:'AE',currency:'AED',type:'islamic',swift:null},
    {name:'Alinma Abu Dhabi',aliases:['Alinma Bank UAE'],country:'AE',currency:'AED',type:'islamic',swift:null},
    // ── UAE DIGITAL BANKS ──
    {name:'Wio Bank',aliases:['Wio'],country:'AE',currency:'AED',type:'digital',swift:null},
    {name:'Liv.',aliases:['Liv Bank','Emirates NBD Liv','Liv by Emirates NBD'],country:'AE',currency:'AED',type:'digital',swift:null},
    {name:'YAP',aliases:['YAP UAE'],country:'AE',currency:'AED',type:'digital',swift:null},
    {name:'NOW Money',aliases:['Now Money UAE'],country:'AE',currency:'AED',type:'digital',swift:null},
    {name:'Zand Bank',aliases:['Zand'],country:'AE',currency:'AED',type:'digital',swift:null},
    {name:'Nomo Bank',aliases:['Nomo'],country:'AE',currency:'AED',type:'digital',swift:null},
    // ── UAE INTERNATIONAL BANKS ──
    {name:'Citibank UAE',aliases:['Citi UAE','Citibank Dubai'],country:'AE',currency:'AED',type:'international',swift:'CITIAEAD'},
    {name:'HSBC UAE',aliases:['HSBC Dubai','HSBC Abu Dhabi'],country:'AE',currency:'AED',type:'international',swift:'BBMEAEAD'},
    {name:'Standard Chartered UAE',aliases:['StanChart UAE','Standard Chartered Dubai'],country:'AE',currency:'AED',type:'international',swift:'SCBLAEAD'},
    {name:'Barclays UAE',aliases:['Barclays Dubai'],country:'AE',currency:'AED',type:'international',swift:null},
    // ── US BANKS ──
    {name:'Citibank',aliases:['Citi','Citigroup'],country:'US',currency:'USD',type:'commercial',swift:'CITIUS33'},
    {name:'Chase',aliases:['JPMorgan Chase','JP Morgan'],country:'US',currency:'USD',type:'commercial',swift:'CHASUS33'},
    {name:'Bank of America',aliases:['BofA','BoA'],country:'US',currency:'USD',type:'commercial',swift:'BOFAUS3N'},
    {name:'Wells Fargo',aliases:[],country:'US',currency:'USD',type:'commercial',swift:'WFBIUS6S'},
  ],
  cards:[
    // ── PK CARDS — HBL ──
    {name:'HBL Visa Debit',network:'Visa',type:'Debit',country:'PK',category:'Standard'},
    {name:'HBL Platinum Visa Credit',network:'Visa',type:'Credit',country:'PK',category:'Premium'},
    {name:'HBL Gold Mastercard',network:'Mastercard',type:'Credit',country:'PK',category:'Standard'},
    {name:'HBL Classic Visa',network:'Visa',type:'Credit',country:'PK',category:'Standard'},
    {name:'HBL CashBack Card',network:'Visa',type:'Credit',country:'PK',category:'Cashback'},
    {name:'HBL Konnect Wallet',network:'Mastercard',type:'Prepaid',country:'PK',category:'Digital'},
    // ── PK CARDS — UBL ──
    {name:'UBL Visa Debit',network:'Visa',type:'Debit',country:'PK',category:'Standard'},
    {name:'UBL Unionpay Debit',network:'UnionPay',type:'Debit',country:'PK',category:'Standard'},
    {name:'UBL Rewards Credit Card',network:'Visa',type:'Credit',country:'PK',category:'Rewards'},
    {name:'UBL Gold Visa Credit',network:'Visa',type:'Credit',country:'PK',category:'Standard'},
    {name:'UBL Business Card',network:'Visa',type:'Credit',country:'PK',category:'Business'},
    // ── PK CARDS — MCB ──
    {name:'MCB Visa Debit',network:'Visa',type:'Debit',country:'PK',category:'Standard'},
    {name:'MCB Mastercard Credit',network:'Mastercard',type:'Credit',country:'PK',category:'Standard'},
    {name:'MCB Lite Prepaid',network:'Visa',type:'Prepaid',country:'PK',category:'Digital'},
    {name:'MCB Gold Credit',network:'Mastercard',type:'Credit',country:'PK',category:'Standard'},
    {name:'MCB Titanium Credit',network:'Mastercard',type:'Credit',country:'PK',category:'Premium'},
    // ── PK CARDS — Bank Alfalah ──
    {name:'Alfalah Visa Debit',network:'Visa',type:'Debit',country:'PK',category:'Standard'},
    {name:'Alfalah Platinum Visa',network:'Visa',type:'Credit',country:'PK',category:'Premium'},
    {name:'Alfalah CashBack Mastercard',network:'Mastercard',type:'Credit',country:'PK',category:'Cashback'},
    {name:'Alfalah Alfa Rewards Card',network:'Visa',type:'Credit',country:'PK',category:'Rewards'},
    {name:'Alfalah Virtual Card',network:'Visa',type:'Prepaid',country:'PK',category:'Digital'},
    // ── PK CARDS — Meezan ──
    {name:'Meezan Visa Debit',network:'Visa',type:'Debit',country:'PK',category:'Islamic'},
    {name:'Meezan Platinum Card',network:'Visa',type:'Credit',country:'PK',category:'Islamic'},
    {name:'Meezan Islamic Credit Card',network:'Visa',type:'Credit',country:'PK',category:'Islamic'},
    {name:'Meezan Prepaid Card',network:'Visa',type:'Prepaid',country:'PK',category:'Islamic'},
    // ── PK CARDS — Allied Bank ──
    {name:'ABL Visa Debit',network:'Visa',type:'Debit',country:'PK',category:'Standard'},
    {name:'ABL Gold Credit',network:'Visa',type:'Credit',country:'PK',category:'Standard'},
    {name:'ABL Platinum Credit',network:'Visa',type:'Credit',country:'PK',category:'Premium'},
    // ── PK CARDS — Faysal Bank ──
    {name:'Faysal Visa Debit',network:'Visa',type:'Debit',country:'PK',category:'Islamic'},
    {name:'Faysal Islamic Credit Card',network:'Visa',type:'Credit',country:'PK',category:'Islamic'},
    {name:'Faysal Titanium Card',network:'Visa',type:'Credit',country:'PK',category:'Premium'},
    // ── PK CARDS — Digital/Fintech ──
    {name:'Sadapay Mastercard',network:'Mastercard',type:'Debit',country:'PK',category:'Digital'},
    {name:'NayaPay Visa Prepaid',network:'Visa',type:'Prepaid',country:'PK',category:'Digital'},
    {name:'Zindigi Mastercard',network:'Mastercard',type:'Debit',country:'PK',category:'Digital'},
    {name:'JazzCash Mastercard Prepaid',network:'Mastercard',type:'Prepaid',country:'PK',category:'Digital'},
    {name:'EasyPaisa Mastercard Prepaid',network:'Mastercard',type:'Prepaid',country:'PK',category:'Digital'},
    // ── PK CARDS — Standard Chartered ──
    {name:'SC Visa Debit',network:'Visa',type:'Debit',country:'PK',category:'Standard'},
    {name:'SC Smart Visa Credit',network:'Visa',type:'Credit',country:'PK',category:'Standard'},
    {name:'SC Ultimate Visa',network:'Visa',type:'Credit',country:'PK',category:'Premium'},
    {name:'SC Platinum Mastercard',network:'Mastercard',type:'Credit',country:'PK',category:'Premium'},
    // ── PK CARDS — Habib Metro ──
    {name:'Habib Metro Visa Debit',network:'Visa',type:'Debit',country:'PK',category:'Standard'},
    {name:'Habib Metro Mastercard Credit',network:'Mastercard',type:'Credit',country:'PK',category:'Standard'},
    // ── PK CARDS — Bank Al Habib ──
    {name:'BAHL Visa Debit',network:'Visa',type:'Debit',country:'PK',category:'Standard'},
    {name:'BAHL Gold Mastercard',network:'Mastercard',type:'Credit',country:'PK',category:'Standard'},
    // ── PK CARDS — JS Bank ──
    {name:'JS Bank Visa Debit',network:'Visa',type:'Debit',country:'PK',category:'Standard'},
    {name:'JS Bank Mastercard Credit',network:'Mastercard',type:'Credit',country:'PK',category:'Standard'},
    // ── PK CARDS — Soneri Bank ──
    {name:'Soneri Visa Debit',network:'Visa',type:'Debit',country:'PK',category:'Standard'},
    {name:'Soneri Mastercard Credit',network:'Mastercard',type:'Credit',country:'PK',category:'Standard'},
    // ── PK CARDS — Askari Bank ──
    {name:'ACBL Visa Debit',network:'Visa',type:'Debit',country:'PK',category:'Standard'},
    {name:'ACBL Gold Visa Credit',network:'Visa',type:'Credit',country:'PK',category:'Standard'},
    {name:'ACBL Titanium Card',network:'Visa',type:'Credit',country:'PK',category:'Premium'},
    // ── UK CARDS — Monzo ──
    {name:'Monzo Mastercard Debit',network:'Mastercard',type:'Debit',country:'GB',category:'Digital'},
    {name:'Monzo Plus Mastercard',network:'Mastercard',type:'Debit',country:'GB',category:'Digital'},
    {name:'Monzo Premium Metal',network:'Mastercard',type:'Debit',country:'GB',category:'Premium'},
    // ── UK CARDS — Starling ──
    {name:'Starling Mastercard Debit',network:'Mastercard',type:'Debit',country:'GB',category:'Digital'},
    {name:'Starling Business Mastercard',network:'Mastercard',type:'Debit',country:'GB',category:'Business'},
    // ── UK CARDS — Revolut ──
    {name:'Revolut Visa Debit',network:'Visa',type:'Debit',country:'GB',category:'Digital'},
    {name:'Revolut Metal Visa',network:'Visa',type:'Debit',country:'GB',category:'Premium'},
    {name:'Revolut Ultra Visa',network:'Visa',type:'Debit',country:'GB',category:'Premium'},
    // ── UK CARDS — Wise ──
    {name:'Wise Mastercard Debit',network:'Mastercard',type:'Debit',country:'GB',category:'Digital'},
    // ── UK CARDS — Barclays ──
    {name:'Barclays Visa Debit',network:'Visa',type:'Debit',country:'GB',category:'Standard'},
    {name:'Barclays Avios Visa Credit',network:'Visa',type:'Credit',country:'GB',category:'Rewards'},
    {name:'Barclays Platinum Visa',network:'Visa',type:'Credit',country:'GB',category:'Premium'},
    {name:'Barclaycard Cashback Visa',network:'Visa',type:'Credit',country:'GB',category:'Cashback'},
    {name:'Barclays Business Debit',network:'Visa',type:'Debit',country:'GB',category:'Business'},
    // ── UK CARDS — HSBC ──
    {name:'HSBC Visa Debit',network:'Visa',type:'Debit',country:'GB',category:'Standard'},
    {name:'HSBC Premier Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Premium'},
    {name:'HSBC Rewards Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Rewards'},
    {name:'HSBC Balance Transfer Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Standard'},
    // ── UK CARDS — NatWest ──
    {name:'NatWest Visa Debit',network:'Visa',type:'Debit',country:'GB',category:'Standard'},
    {name:'NatWest Reward Black Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Premium'},
    {name:'NatWest Platinum Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Premium'},
    // ── UK CARDS — Lloyds ──
    {name:'Lloyds Visa Debit',network:'Visa',type:'Debit',country:'GB',category:'Standard'},
    {name:'Lloyds Avios Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Rewards'},
    {name:'Lloyds Cashback Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Cashback'},
    {name:'Lloyds Platinum Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Premium'},
    // ── UK CARDS — Santander ──
    {name:'Santander Visa Debit',network:'Visa',type:'Debit',country:'GB',category:'Standard'},
    {name:'Santander All in One Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Rewards'},
    {name:'Santander Everyday Cashback Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Cashback'},
    // ── UK CARDS — Halifax ──
    {name:'Halifax Visa Debit',network:'Visa',type:'Debit',country:'GB',category:'Standard'},
    {name:'Halifax Clarity Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Travel'},
    {name:'Halifax Cashback Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Cashback'},
    // ── UK CARDS — Chase / First Direct ──
    {name:'Chase Visa Debit',network:'Visa',type:'Debit',country:'GB',category:'Digital'},
    {name:'First Direct Visa Debit',network:'Visa',type:'Debit',country:'GB',category:'Digital'},
    {name:'First Direct Credit Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Standard'},
    // ── UK CARDS — American Express ──
    {name:'Amex Gold Rewards',network:'American Express',type:'Credit',country:'GB',category:'Rewards'},
    {name:'Amex Platinum',network:'American Express',type:'Credit',country:'GB',category:'Premium'},
    {name:'Amex BA Premium Plus',network:'American Express',type:'Credit',country:'GB',category:'Premium'},
    {name:'Amex Cashback Everyday',network:'American Express',type:'Credit',country:'GB',category:'Cashback'},
    {name:'Amex Nectar',network:'American Express',type:'Credit',country:'GB',category:'Rewards'},
    {name:'Amex Preferred Rewards Gold UK',network:'American Express',type:'Credit',country:'GB',category:'Rewards'},
    // ── UK CARDS — Nationwide ──
    {name:'Nationwide Visa Debit',network:'Visa',type:'Debit',country:'GB',category:'Standard'},
    {name:'Nationwide FlexPlus Visa',network:'Visa',type:'Debit',country:'GB',category:'Standard'},
    {name:'Nationwide Select Credit Card',network:'Visa',type:'Credit',country:'GB',category:'Standard'},
    // ── UK CARDS — Virgin Money ──
    {name:'Virgin Money Visa Debit',network:'Visa',type:'Debit',country:'GB',category:'Standard'},
    {name:'Virgin Money All Round Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Rewards'},
    // ── UK CARDS — Co-op Bank ──
    {name:'Co-op Bank Visa Debit',network:'Visa',type:'Debit',country:'GB',category:'Standard'},
    {name:'Co-op Bank Ethical Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Standard'},
    // ── UK CARDS — TSB ──
    {name:'TSB Spend & Save Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Cashback'},
    {name:'TSB Platinum Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Premium'},
    // ── UK CARDS — Metro Bank ──
    {name:'Metro Bank Mastercard Debit',network:'Mastercard',type:'Debit',country:'GB',category:'Standard'},
    {name:'Metro Bank Personal Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Standard'},
    // ── UK CARDS — Travel ──
    {name:'Curve Mastercard',network:'Mastercard',type:'Debit',country:'GB',category:'Digital'},
    {name:'Caxton Mastercard',network:'Mastercard',type:'Prepaid',country:'GB',category:'Travel'},
    {name:'FairFX Mastercard',network:'Mastercard',type:'Prepaid',country:'GB',category:'Travel'},
    {name:'Post Office Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Travel'},
    // ── UK CARDS — Retail / Partner ──
    {name:"Sainsbury's Bank Nectar Mastercard",network:'Mastercard',type:'Credit',country:'GB',category:'Rewards'},
    {name:'John Lewis Partnership Card',network:'Mastercard',type:'Credit',country:'GB',category:'Rewards'},
    {name:'M&S Bank Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Rewards'},
    {name:'Tesco Bank Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Cashback'},
    {name:'Asda Money Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Cashback'},
    {name:'AA Credit Card Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Standard'},
    {name:'RAC Credit Card Visa',network:'Visa',type:'Credit',country:'GB',category:'Standard'},
    // ── UK CARDS — Credit Building ──
    {name:'Capital One Classic Mastercard UK',network:'Mastercard',type:'Credit',country:'GB',category:'Standard'},
    {name:'Aqua Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Standard'},
    {name:'Marbles Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Standard'},
    {name:'Vanquis Visa',network:'Visa',type:'Credit',country:'GB',category:'Standard'},
    // ── UAE CARDS — Emirates NBD ──
    {name:'ENBD Visa Debit',network:'Visa',type:'Debit',country:'AE',category:'Standard'},
    {name:'ENBD Titanium Mastercard',network:'Mastercard',type:'Credit',country:'AE',category:'Standard'},
    {name:'ENBD Go4it Gold Visa',network:'Visa',type:'Credit',country:'AE',category:'Rewards'},
    {name:'ENBD Skywards Infinite Visa',network:'Visa',type:'Credit',country:'AE',category:'Premium'},
    // ── UAE CARDS — FAB ──
    {name:'FAB Visa Debit',network:'Visa',type:'Debit',country:'AE',category:'Standard'},
    {name:'FAB Cashback Platinum Visa',network:'Visa',type:'Credit',country:'AE',category:'Cashback'},
    {name:'FAB World Elite Mastercard',network:'Mastercard',type:'Credit',country:'AE',category:'Premium'},
    {name:'FAB Islamic Mastercard',network:'Mastercard',type:'Credit',country:'AE',category:'Islamic'},
    // ── UAE CARDS — ADCB ──
    {name:'ADCB Visa Debit',network:'Visa',type:'Debit',country:'AE',category:'Standard'},
    {name:'ADCB Lulu Mastercard',network:'Mastercard',type:'Credit',country:'AE',category:'Rewards'},
    {name:'ADCB SimplyLife Mastercard',network:'Mastercard',type:'Credit',country:'AE',category:'Standard'},
    {name:'ADCB Traveller Credit Card',network:'Visa',type:'Credit',country:'AE',category:'Travel'},
    // ── UAE CARDS — DIB ──
    {name:'DIB Visa Debit',network:'Visa',type:'Debit',country:'AE',category:'Islamic'},
    {name:'DIB Platinum Visa',network:'Visa',type:'Credit',country:'AE',category:'Islamic'},
    {name:'DIB Cashback Card',network:'Mastercard',type:'Credit',country:'AE',category:'Islamic'},
    {name:'DIB Islamic Credit Card',network:'Visa',type:'Credit',country:'AE',category:'Islamic'},
    // ── UAE CARDS — ADIB ──
    {name:'ADIB Visa Debit',network:'Visa',type:'Debit',country:'AE',category:'Islamic'},
    {name:'ADIB Cashback Visa',network:'Visa',type:'Credit',country:'AE',category:'Islamic'},
    // ── UAE CARDS — Mashreq ──
    {name:'Mashreq Neo Visa Debit',network:'Visa',type:'Debit',country:'AE',category:'Digital'},
    {name:'Mashreq Cashback Credit Visa',network:'Visa',type:'Credit',country:'AE',category:'Cashback'},
    {name:'Mashreq Solitaire Mastercard',network:'Mastercard',type:'Credit',country:'AE',category:'Premium'},
    // ── UAE CARDS — Wio / Liv. ──
    {name:'Wio Visa Debit',network:'Visa',type:'Debit',country:'AE',category:'Digital'},
    {name:'Liv. Mastercard Debit',network:'Mastercard',type:'Debit',country:'AE',category:'Digital'},
    // ── UAE CARDS — Emirates Islamic ──
    {name:'EI Visa Debit',network:'Visa',type:'Debit',country:'AE',category:'Islamic'},
    {name:'EI Cashback Card',network:'Visa',type:'Credit',country:'AE',category:'Islamic'},
    {name:'EI Business Card',network:'Visa',type:'Credit',country:'AE',category:'Business'},
    // ── UAE CARDS — RAKBank ──
    {name:'RAK Visa Debit',network:'Visa',type:'Debit',country:'AE',category:'Standard'},
    {name:'RAK MaxSaver Mastercard',network:'Mastercard',type:'Credit',country:'AE',category:'Rewards'},
    {name:'RAK Titanium Mastercard',network:'Mastercard',type:'Credit',country:'AE',category:'Premium'},
    // ── UAE CARDS — American Express ──
    {name:'Amex Gold UAE',network:'American Express',type:'Credit',country:'AE',category:'Rewards'},
    {name:'Amex Platinum UAE',network:'American Express',type:'Credit',country:'AE',category:'Premium'},
    {name:'Amex Marriott Bonvoy UAE',network:'American Express',type:'Credit',country:'AE',category:'Premium'},
    // ── UAE CARDS — Premium/Infinite additions ──
    {name:'FAB Infinite Visa',network:'Visa',type:'Credit',country:'AE',category:'Premium'},
    {name:'ADCB Traveller Visa Infinite',network:'Visa',type:'Credit',country:'AE',category:'Travel'},
    {name:'Mashreq Cashback World Mastercard',network:'Mastercard',type:'Credit',country:'AE',category:'Cashback'},
    {name:'DIB Infinite Visa',network:'Visa',type:'Credit',country:'AE',category:'Islamic'},
    // ── PK CARDS — Infinite/Prestige tier ──
    {name:'HBL Prestige Visa Infinite',network:'Visa',type:'Credit',country:'PK',category:'Premium'},
    {name:'HBL Meezan Infinity Visa',network:'Visa',type:'Credit',country:'PK',category:'Islamic'},
    {name:'Meezan Infinite Visa',network:'Visa',type:'Credit',country:'PK',category:'Islamic'},
    {name:'MCB Visa Infinite',network:'Visa',type:'Credit',country:'PK',category:'Premium'},
    {name:'UBL Platinum Mastercard',network:'Mastercard',type:'Credit',country:'PK',category:'Premium'},
    {name:'Faysal Islami Visa Infinite',network:'Visa',type:'Credit',country:'PK',category:'Islamic'},
    {name:'Bank Al Habib Visa Platinum',network:'Visa',type:'Credit',country:'PK',category:'Premium'},
    {name:'JS Bank Visa Infinite',network:'Visa',type:'Credit',country:'PK',category:'Premium'},
    // ── UK CARDS — Premium additions ──
    {name:'Yonder Credit Card',network:'Visa',type:'Credit',country:'GB',category:'Rewards'},
    {name:'Zabel Visa',network:'Visa',type:'Credit',country:'GB',category:'Standard'},
    {name:'HSBC Premier World Elite Mastercard',network:'Mastercard',type:'Credit',country:'GB',category:'Premium'},
    {name:'Virgin Money Rewards Visa',network:'Visa',type:'Credit',country:'GB',category:'Rewards'},
  ],
  sims:[
    // ── PK ──
    {network:'Jazz',country:'PK',prefixes:['300','306','307','308'],type:'Physical',currency:'PKR'},
    {network:'Zong',country:'PK',prefixes:['310','311','312','313','314','315'],type:'Physical',currency:'PKR'},
    {network:'Ufone',country:'PK',prefixes:['333','331','332'],type:'Physical',currency:'PKR'},
    {network:'Telenor Pakistan',country:'PK',prefixes:['340','341','342','343','344','345','346'],type:'Physical',currency:'PKR'},
    {network:'SCOM',country:'PK',prefixes:['320'],type:'Physical',currency:'PKR'},
    {network:'SCO',country:'PK',prefixes:['321'],type:'Physical',currency:'PKR'},
    {network:'EVO',country:'PK',prefixes:[],type:'Physical',currency:'PKR'},
    // ── UK ──
    {network:'EE',country:'GB',prefixes:['7'],type:'Physical',currency:'GBP'},
    {network:'O2',country:'GB',prefixes:['7'],type:'Physical',currency:'GBP'},
    {network:'Vodafone UK',country:'GB',prefixes:['7'],type:'Physical',currency:'GBP'},
    {network:'Three UK',country:'GB',prefixes:['7'],type:'Physical',currency:'GBP'},
    {network:'Sky Mobile',country:'GB',prefixes:['7'],type:'Physical',currency:'GBP'},
    {network:'Virgin Mobile UK',country:'GB',prefixes:['7'],type:'Physical',currency:'GBP'},
    {network:'iD Mobile',country:'GB',prefixes:['7'],type:'Physical',currency:'GBP'},
    {network:'SMARTY',country:'GB',prefixes:['7'],type:'Physical',currency:'GBP'},
    {network:'VOXI',country:'GB',prefixes:['7'],type:'Physical',currency:'GBP'},
    {network:'giffgaff',country:'GB',prefixes:['7'],type:'Physical',currency:'GBP'},
    {network:'Lebara UK',country:'GB',prefixes:['7'],type:'Physical',currency:'GBP'},
    {network:'Lycamobile UK',country:'GB',prefixes:['7'],type:'Physical',currency:'GBP'},
    {network:'Tesco Mobile',country:'GB',prefixes:['7'],type:'Physical',currency:'GBP'},
    {network:'BT Mobile',country:'GB',prefixes:['7'],type:'Physical',currency:'GBP'},
    {network:'Plusnet Mobile',country:'GB',prefixes:['7'],type:'Physical',currency:'GBP'},
    // ── UAE ──
    {network:'Etisalat',country:'AE',prefixes:['5'],type:'Physical',currency:'AED'},
    {network:'e&',country:'AE',prefixes:['5'],type:'Physical',currency:'AED'},
    {network:'du',country:'AE',prefixes:['5'],type:'Physical',currency:'AED'},
    {network:'Virgin Mobile UAE',country:'AE',prefixes:['5'],type:'Physical',currency:'AED'},
    {network:'Lebara UAE',country:'AE',prefixes:['5'],type:'Physical',currency:'AED'},
    {network:'C\'ME',country:'AE',prefixes:['5'],type:'Physical',currency:'AED'},
    // ── US ──
    {network:'AT&T',country:'US',prefixes:[],type:'Physical',currency:'USD'},
    {network:'Verizon',country:'US',prefixes:[],type:'Physical',currency:'USD'},
    {network:'T-Mobile',country:'US',prefixes:[],type:'Physical',currency:'USD'},
    {network:'Mint Mobile',country:'US',prefixes:[],type:'Physical',currency:'USD'},
    {network:'Google Fi',country:'US',prefixes:[],type:'Physical',currency:'USD'},
    {network:'Cricket Wireless',country:'US',prefixes:[],type:'Physical',currency:'USD'},
    {network:'Metro by T-Mobile',country:'US',prefixes:[],type:'Physical',currency:'USD'},
    {network:'Boost Mobile',country:'US',prefixes:[],type:'Physical',currency:'USD'},
    // ── India ──
    {network:'Airtel India',country:'IN',prefixes:[],type:'Physical',currency:'INR'},
    {network:'Jio',country:'IN',prefixes:[],type:'Physical',currency:'INR'},
    {network:'BSNL',country:'IN',prefixes:[],type:'Physical',currency:'INR'},
    // ── Saudi Arabia ──
    {network:'STC',country:'SA',prefixes:[],type:'Physical',currency:'SAR'},
    {network:'Mobily',country:'SA',prefixes:[],type:'Physical',currency:'SAR'},
    {network:'Zain Saudi',country:'SA',prefixes:[],type:'Physical',currency:'SAR'},
    // ── Other GCC ──
    {network:'Zain Kuwait',country:'KW',prefixes:[],type:'Physical',currency:'KWD'},
    {network:'Ooredoo Qatar',country:'QA',prefixes:[],type:'Physical',currency:'QAR'},
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
  fillBank(val, country) {
    const lv = val.toLowerCase();
    const _find = list => list.find(b => {
      if (b.name.toLowerCase().includes(lv)) return true;
      if (b.aliases && b.aliases.some(a => a.toLowerCase().includes(lv))) return true;
      return false;
    });
    const match = (country ? _find(this.banks.filter(b => b.country === country)) : null) || _find(this.banks);
    if (!match) return;
    setTimeout(() => {
      const cc = document.getElementById('bf-cc'); if (cc) cc.value = match.country;
      const cur = document.getElementById('bf-cur'); if (cur) cur.value = match.currency;
      const type = document.getElementById('bf-type'); if (type && match.type) type.value = match.type.charAt(0).toUpperCase() + match.type.slice(1);
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
window.SMART_DB = SMART_DB;
