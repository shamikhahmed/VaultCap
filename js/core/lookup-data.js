'use strict';
/* Lookup data — COUNTRIES, CURRENCIES, BANKS_DB, CARDS_DB, NETWORKS_DB,
   BROKERS_DB, SUBS_DB, EMAIL_PROVIDERS, GADGET_TYPES, device models,
   DIGITAL_CATS, COMMON_SERVICES, WORKSPACE_PRESETS */

const COUNTRIES=[
  {c:'PK',n:'Pakistan',f:'🇵🇰',p:'+92'},{c:'GB',n:'United Kingdom',f:'🇬🇧',p:'+44'},
  {c:'AE',n:'UAE',f:'🇦🇪',p:'+971'},{c:'US',n:'United States',f:'🇺🇸',p:'+1'},
  {c:'CA',n:'Canada',f:'🇨🇦',p:'+1'},{c:'AU',n:'Australia',f:'🇦🇺',p:'+61'},
  {c:'SG',n:'Singapore',f:'🇸🇬',p:'+65'},{c:'IN',n:'India',f:'🇮🇳',p:'+91'},
  {c:'SA',n:'Saudi Arabia',f:'🇸🇦',p:'+966'},{c:'QA',n:'Qatar',f:'🇶🇦',p:'+974'},
  {c:'OTHER',n:'Other',f:'🌐',p:'+0'},
];

const CURRENCIES=['PKR','GBP','USD','AED','EUR','SAR','CAD','AUD','SGD','INR','QAR','BTC','ETH','USDT'];

// COUNTRY_CUR → js/core/constants.js · SMART_DB → js/core/smart-db.js

const CUR_SYM = { GBP:'£', USD:'$', EUR:'€', AED:'AED ', PKR:'PKR ', SAR:'SAR ', CAD:'CA$', AUD:'A$', SGD:'S$', INR:'₹', QAR:'QAR ' };

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
  {n:'HBL Prestige Visa Infinite',net:'Visa',cat:'Premium'},
  {n:'Meezan Infinite Visa',net:'Visa',cat:'Premium'},
  {n:'MCB Visa Infinite',net:'Visa',cat:'Premium'},
  {n:'UBL Platinum Mastercard',net:'Mastercard',cat:'Premium'},
  {n:'Faysal Islami Visa Infinite',net:'Visa',cat:'Premium'},
  {n:'JS Bank Visa Infinite',net:'Visa',cat:'Premium'},
  {n:'Askari Platinum Visa',net:'Visa',cat:'Premium'},
  {n:'Yonder Credit Card',net:'Visa',cat:'Rewards'},
  {n:'Zabel Visa',net:'Visa',cat:'Standard'},
  {n:'HSBC Premier World Elite Mastercard',net:'Mastercard',cat:'Premium'},
  {n:'FAB Infinite Visa',net:'Visa',cat:'Premium'},
  {n:'DIB Infinite Visa',net:'Visa',cat:'Premium'},
  {n:'Emirates NBD Skywards Infinite Visa',net:'Visa',cat:'Premium'},
  {n:'Mashreq Cashback World Mastercard',net:'Mastercard',cat:'Cashback'},
];

const BROKERS_DB=['Hargreaves Lansdown','AJ Bell','Trading 212','Freetrade','eToro','Vanguard UK','Sarwa','Baraka','Al Meezan','AKD Securities','JS Global','Binance','Coinbase','Kraken','Bybit','OKX',
  'Rafi Securities','JS Global Capital','Arif Habib Limited','Topline Securities','Alfalah Securities',
  'Next Capital','Sherman Securities','Ismail Iqbal Securities','IGI Securities','KASB Securities',
  'Optimus Capital','Pearl Securities','Vector Securities','CDC Pakistan','UBL Fund Managers',
  'Al Meezan Investments','NBP Funds','MCB Arif Habib Savings','Faysal Asset Management',
  'Atlas Asset Management','HBL Asset Management','NAFA Funds','Meezan Islamic Fund',
  'ABL Asset Management','Lakson Investments'];

// SMART_DB → js/core/smart-db.js

/* → js/core/branding.js */
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
