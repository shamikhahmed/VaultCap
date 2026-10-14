// VaultCap — © 2026 Shamikh Ahmed. Source-available. See LICENSE.
// Bank branding — logo domains, brand colors, card gradients — extracted from app.js (refactor 4.4.0)

// ── Bank logo / brand helpers ──
// Merges BANK_CATALOG (full list) with legacy aliases for older saved names.
const BANK_DOMAINS = Object.assign({}, (typeof BANK_CATALOG !== 'undefined' ? BANK_CATALOG : {}), {
  'UBL': 'ubl.com.pk',
  'Askari Bank': 'askaribank.com.pk',
  'Askari': 'askaribank.com.pk',
  'Bank Islami': 'bankislami.com.pk',
  'Islami': 'bankislami.com.pk',
  'EasyPaisa': 'easypaisa.com.pk',
  'Silkbank': 'silkbank.com.pk',
  'Silk Bank': 'silkbank.com.pk',
  'Wio Bank': 'wio.io',
  'Wio': 'wio.io',
  'HSBC': 'hsbc.co.uk',
});

const BANK_COLORS = (typeof VCBrand !== "undefined" && VCBrand.BANK_COLORS) ? VCBrand.BANK_COLORS : {};

function bankDomain(name){
  if(!name)return null;
  const n=name.trim();
  if(BANK_DOMAINS[n])return BANK_DOMAINS[n];
  if(typeof BANK_CATALOG!=='undefined'&&BANK_CATALOG[n])return BANK_CATALOG[n];
  const lc=n.toLowerCase();
  // Case-insensitive exact match
  for(const[k,v]of Object.entries(BANK_DOMAINS)){
    if(k.toLowerCase()===lc)return v;
  }
  if(typeof BANK_CATALOG!=='undefined'){
    for(const[k,v]of Object.entries(BANK_CATALOG)){
      if(k.toLowerCase()===lc)return v;
    }
  }
  // SMART_DB aliases → catalog keys (exact / case-insensitive)
  if(typeof SMART_DB!=='undefined'&&Array.isArray(SMART_DB.banks)){
    for(const b of SMART_DB.banks){
      const names=[b.name,...(b.aliases||[])];
      if(!names.some(x=>String(x).toLowerCase()===lc)) continue;
      for(const candidate of names){
        if(BANK_DOMAINS[candidate]) return BANK_DOMAINS[candidate];
        if(typeof BANK_CATALOG!=='undefined'&&BANK_CATALOG[candidate]) return BANK_CATALOG[candidate];
      }
      break;
    }
  }
  // Prefer longer catalog keys that match as prefix/contains (reduce false first-word hits)
  if(typeof BANK_CATALOG!=='undefined'){
    let best=null, bestLen=0;
    for(const[k,v]of Object.entries(BANK_CATALOG)){
      const kl=k.toLowerCase();
      if(kl.length<3) continue;
      if(lc===kl||lc.startsWith(kl)||kl.startsWith(lc)||lc.includes(kl)){
        if(kl.length>bestLen){ best=v; bestLen=kl.length; }
      }
    }
    if(best) return best;
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
  const fallback = (typeof VCBrand !== 'undefined' && VCBrand.FALLBACK_BANK) ? VCBrand.FALLBACK_BANK : VCBrand.h_1a1a2e;
  if(!name)return fallback;
  const n=name.trim();
  if(BANK_COLORS[n])return BANK_COLORS[n];
  const lc=n.toLowerCase();
  for(const[k,v]of Object.entries(BANK_COLORS)){
    if(lc.includes(k.toLowerCase()))return v;
  }
  return fallback;
}

function bankLogo(bankName, country) {
  if (typeof LogoEngine !== 'undefined') return LogoEngine.html(bankName, 36);
  const domain = bankDomain(bankName);
  if (!domain) return '';
  const local = `assets/banks/${String(domain).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.png`;
  return `<img src="${local}" alt="" style="width:36px;height:36px;border-radius:8px;object-fit:cover" data-act-error="ActHelpers.hideEl(this)" loading="lazy">`;
}

function cardGradient(c){
  const g = (typeof VCBrand !== 'undefined' && VCBrand.CARD_GRADIENTS) ? VCBrand.CARD_GRADIENTS : {};
  const n=(c.cardName||'').toLowerCase();
  for(const[k,v]of Object.entries(g)){if(n.includes(k.toLowerCase()))return v;}
  const ng = (typeof VCBrand !== 'undefined' && VCBrand.NETWORK_GRADIENTS) ? VCBrand.NETWORK_GRADIENTS : {};
  if(ng[c.network])return ng[c.network];
  const tg = (typeof VCBrand !== 'undefined' && VCBrand.TYPE_GRADIENTS) ? VCBrand.TYPE_GRADIENTS : {};
  return tg[c.cardType] || (typeof VCBrand !== 'undefined' && VCBrand.FALLBACK_CARD_GRADIENT) || 'linear-gradient(135deg,var(--navy),var(--steel))';
}
