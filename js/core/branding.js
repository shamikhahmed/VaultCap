// VaultCap — © 2026 Shamikh Ahmed. Source-available. See LICENSE.
// Bank branding — logo domains, brand colors, card gradients — extracted from app.js (refactor 4.4.0)

// ── Bank logo / brand helpers ──
const BANK_DOMAINS={
  'HBL':'hbl.com','Habib Bank':'hbl.com','HBL Bank':'hbl.com',
  'Meezan Bank':'meezanbank.com','Meezan':'meezanbank.com',
  'UBL':'ubl.com','MCB Bank':'mcb.com.pk','MCB':'mcb.com.pk',
  'Bank Alfalah':'bankalfalah.com','Alfalah':'bankalfalah.com',
  'Allied Bank':'abl.com','Allied':'abl.com',
  'Askari Bank':'askaribank.com','Askari':'askaribank.com',
  'Bank Al Habib':'bankalhabib.com','BAHL':'bankalhabib.com',
  'Habib Metro Bank':'habibmetro.com','Habib Metro':'habibmetro.com',
  'Faysal Bank':'faysalbank.com','Faysal':'faysalbank.com',
  'Bank Islami':'bankislami.com','Islami':'bankislami.com',
  'Sadapay':'sadapay.com','NayaPay':'nayapay.com','Zindigi':'zindigi.com',
  'JazzCash':'jazzcash.com.pk','EasyPaisa':'easypaisa.com',
  'NBP':'nbp.com.pk','Bank of Punjab':'bop.com.pk',
  'Silkbank':'silkbank.com','Silk Bank':'silkbank.com',
  'Soneri Bank':'soneribank.com','Soneri':'soneribank.com',
  'JS Bank':'jsbl.com','JS':'jsbl.com',
  'Standard Chartered PK':'sc.com','Standard Chartered':'sc.com',
  'HSBC':'hsbc.com','HSBC UK':'hsbc.co.uk',
  'Monzo':'monzo.com',
  'Starling Bank':'starlingbank.com','Starling':'starlingbank.com',
  'Revolut':'revolut.com','Wise':'wise.com',
  'Barclays':'barclays.co.uk','Barclaycard':'barclays.co.uk',
  'NatWest':'natwest.com',
  'Lloyds Bank':'lloydsbank.com','Lloyds':'lloydsbank.com',
  'Santander UK':'santander.co.uk','Santander':'santander.co.uk',
  'Halifax':'halifax.co.uk','Nationwide':'nationwide.co.uk',
  'Metro Bank':'metrobankonline.co.uk','TSB':'tsb.co.uk','TSB Bank':'tsb.co.uk',
  'Chase UK':'chase.co.uk','First Direct':'firstdirect.com',
  'Atom Bank':'atombank.co.uk','Atom':'atombank.co.uk',
  'Emirates NBD':'emiratesnbd.com','ENBD':'emiratesnbd.com','Emirates':'emiratesnbd.com',
  'FAB':'bankfab.com','ADCB':'adcb.com',
  'Mashreq Bank':'mashreq.com','Mashreq':'mashreq.com',
  'ADIB':'adib.ae','Dubai Islamic Bank':'dib.ae','DIB':'dib.ae',
  'RAKBank':'rakbank.ae','RAK Bank':'rakbank.ae','RAKBANK':'rakbank.ae',
  'Wio Bank':'wio.com','Wio':'wio.com',
  'Liv.':'liv.ae','Liv':'liv.ae',
  'Al Rayan Bank':'alrayanbank.co.uk',
  'Citibank':'citibank.com','Citi':'citibank.com','Citi Bank':'citibank.com',
  'Chase':'chase.com','Chase Bank':'chase.com',
  'Bank of America':'bankofamerica.com',
  'Wells Fargo':'wellsfargo.com','Wells':'wellsfargo.com',
};

const BANK_COLORS={
  'HBL':'#1a3a6b','Meezan Bank':'#006400','UBL':'#8b0000','MCB Bank':'#1a1a2e',
  'Bank Alfalah':'#003366','Allied Bank':'#004225','Sadapay':'#6b21a8',
  'NayaPay':'#ea580c','Monzo':'#ff3464','Starling Bank':'#6935d3','Revolut':'#191c1f',
  'Wise':'#00b67a','Barclays':'#00aeef','HSBC':'#db0011','HSBC UK':'#db0011',
  'NatWest':'#5a0096','Lloyds Bank':'#006a4e','Emirates NBD':'#c8972a',
  'FAB':'#00a651','ADCB':'#cc0000','Dubai Islamic Bank':'#006400',
};

function bankDomain(name){
  if(!name)return null;
  const n=name.trim();
  if(BANK_DOMAINS[n])return BANK_DOMAINS[n];
  const lc=n.toLowerCase();
  // Case-insensitive exact match
  for(const[k,v]of Object.entries(BANK_DOMAINS)){
    if(k.toLowerCase()===lc)return v;
  }
  // First word of bank name starts any key
  const firstWord=lc.split(' ')[0];
  for(const[k,v]of Object.entries(BANK_DOMAINS)){
    if(k.toLowerCase().startsWith(firstWord))return v;
  }
  // Bank name starts with any key
  for(const[k,v]of Object.entries(BANK_DOMAINS)){
    if(lc.startsWith(k.toLowerCase()))return v;
  }
  // Any key contains or is contained in bank name
  for(const[k,v]of Object.entries(BANK_DOMAINS)){
    const kl=k.toLowerCase();
    if(lc.includes(kl)||kl.includes(lc))return v;
  }
  return null;
}

function brandColor(name){
  if(!name)return '#1a1a2e';
  const n=name.trim();
  if(BANK_COLORS[n])return BANK_COLORS[n];
  const lc=n.toLowerCase();
  for(const[k,v]of Object.entries(BANK_COLORS)){
    if(lc.includes(k.toLowerCase()))return v;
  }
  return '#1a1a2e';
}

function bankLogo(bankName,country){
  const domain=bankDomain(bankName);
  if(!domain)return '';
  return `<img src="https://www.google.com/s2/favicons?domain=${domain}&sz=64" alt="" style="width:36px;height:36px;border-radius:8px;object-fit:cover" onerror="this.style.display='none'" loading="lazy">`;
}

function cardGradient(c){
  const g={
    'HBL':'linear-gradient(135deg,#0d2147 0%,#1a3a6b 50%,#2d5aa0 100%)',
    'Meezan Bank':'linear-gradient(135deg,#003d00 0%,#006400 50%,#228b22 100%)',
    'Meezan':'linear-gradient(135deg,#003d00 0%,#006400 50%,#228b22 100%)',
    'UBL':'linear-gradient(135deg,#5c0000 0%,#8b0000 50%,#cc0000 100%)',
    'MCB Bank':'linear-gradient(135deg,#0d0d1a 0%,#1a1a2e 50%,#16213e 100%)',
    'MCB':'linear-gradient(135deg,#0d0d1a 0%,#1a1a2e 50%,#16213e 100%)',
    'Bank Alfalah':'linear-gradient(135deg,#001a33 0%,#003366 50%,#0055a5 100%)',
    'Alfalah':'linear-gradient(135deg,#001a33 0%,#003366 50%,#0055a5 100%)',
    'Allied Bank':'linear-gradient(135deg,#001f0f 0%,#004225 50%,#006b3c 100%)',
    'ABL':'linear-gradient(135deg,#001f0f 0%,#004225 50%,#006b3c 100%)',
    'Sadapay':'linear-gradient(135deg,#4a0080 0%,#6b21a8 50%,#9333ea 100%)',
    'NayaPay':'linear-gradient(135deg,#7a2800 0%,#ea580c 50%,#f97316 100%)',
    'Monzo':'linear-gradient(135deg,#cc1040 0%,#ff3464 50%,#ff6b8a 100%)',
    'Starling':'linear-gradient(135deg,#3a1a80 0%,#6935d3 50%,#9b59b6 100%)',
    'Revolut':'linear-gradient(135deg,#0d0f10 0%,#191c1f 50%,#2d3436 100%)',
    'Wise':'linear-gradient(135deg,#005c3d 0%,#00b67a 50%,#9fe870 100%)',
    'Barclays':'linear-gradient(135deg,#001f40 0%,#003b7a 50%,#00aeef 100%)',
    'Barclaycard':'linear-gradient(135deg,#001f40 0%,#003b7a 50%,#00aeef 100%)',
    'HSBC':'linear-gradient(135deg,#6b0008 0%,#a00008 50%,#db0011 100%)',
    'NatWest':'linear-gradient(135deg,#1a0030 0%,#2d0048 50%,#5a0096 100%)',
    'Lloyds':'linear-gradient(135deg,#002214 0%,#004d38 50%,#006a4e 100%)',
    'Emirates NBD':'linear-gradient(135deg,#4a3500 0%,#8b6914 50%,#c8972a 100%)',
    'ENBD':'linear-gradient(135deg,#4a3500 0%,#8b6914 50%,#c8972a 100%)',
    'FAB':'linear-gradient(135deg,#003d1a 0%,#007a3d 50%,#00a651 100%)',
    'ADCB':'linear-gradient(135deg,#4d0000 0%,#990000 50%,#cc0000 100%)',
    'Dubai Islamic Bank':'linear-gradient(135deg,#002600 0%,#004d00 50%,#006400 100%)',
    'DIB':'linear-gradient(135deg,#002600 0%,#004d00 50%,#006400 100%)',
    'Chase':'linear-gradient(135deg,#001f40 0%,#003b7a 50%,#117aca 100%)',
    'Bank of America':'linear-gradient(135deg,#7a0012 0%,#c41230 50%,#e31837 100%)',
    'Wells Fargo':'linear-gradient(135deg,#6b000a 0%,#9a1422 50%,#d71921 100%)',
    'Santander':'linear-gradient(135deg,#6b0000 0%,#aa0000 50%,#ec0000 100%)',
    'Halifax':'linear-gradient(135deg,#002030 0%,#003d5c 50%,#005c8e 100%)',
    'Nationwide':'linear-gradient(135deg,#001f33 0%,#003a5e 50%,#00568c 100%)',
    'Metro Bank':'linear-gradient(135deg,#400000 0%,#8b0000 50%,#cc0000 100%)',
    'TSB':'linear-gradient(135deg,#003040 0%,#005a87 50%,#007db9 100%)',
    'First Direct':'linear-gradient(135deg,#000000 0%,#111 50%,#333 100%)',
    'Atom Bank':'linear-gradient(135deg,#1a0040 0%,#3d1a78 50%,#6b21a8 100%)',
    'RAKBank':'linear-gradient(135deg,#400000 0%,#8b0000 50%,#cc0000 100%)',
    'Wio Bank':'linear-gradient(135deg,#003d29 0%,#008a5c 50%,#00b67a 100%)',
    'Askari':'linear-gradient(135deg,#0a1f30 0%,#1a5276 50%,#2e86c1 100%)',
    'Faysal':'linear-gradient(135deg,#0a1f30 0%,#1a5276 50%,#2e86c1 100%)',
    'Bank Islami':'linear-gradient(135deg,#003d00 0%,#006400 50%,#228b22 100%)',
    'Zindigi':'linear-gradient(135deg,#3d1045 0%,#7b2d8b 50%,#a855f7 100%)',
    'JazzCash':'linear-gradient(135deg,#6b0000 0%,#cc0000 50%,#ff4500 100%)',
    'EasyPaisa':'linear-gradient(135deg,#003d1f 0%,#007a3d 50%,#00a651 100%)',
    'NBP':'linear-gradient(135deg,#002600 0%,#004d00 50%,#006400 100%)',
    'Bank of Punjab':'linear-gradient(135deg,#0d2147 0%,#1a3a6b 50%,#2d5aa0 100%)',
  };
  const n=(c.cardName||'').toLowerCase();
  for(const[k,v]of Object.entries(g)){if(n.includes(k.toLowerCase()))return v;}
  const ng={
    'Visa':'linear-gradient(135deg,#0d0d1a 0%,#1a1a2e 50%,#16213e 100%)',
    'Mastercard':'linear-gradient(135deg,#1a1a1a 0%,#2c2c2c 50%,#3d3d3d 100%)',
    'American Express':'linear-gradient(135deg,#003d2e 0%,#005a45 50%,#007b5e 100%)',
    'UnionPay':'linear-gradient(135deg,#5c0012 0%,#8b0000 50%,#c8102e 100%)',
  };
  if(ng[c.network])return ng[c.network];
  const tg={Debit:'linear-gradient(135deg,#1a1a2e 0%,#2c3e50 50%,#34495e 100%)',Credit:'linear-gradient(135deg,#1a1a2e 0%,#2c3e50 50%,#34495e 100%)',Prepaid:'linear-gradient(135deg,#1a1a2e 0%,#2d3436 50%,#636e72 100%)'};
  return tg[c.cardType]||'linear-gradient(135deg,#1a1a2e 0%,#2c3e50 50%,#34495e 100%)';
}
