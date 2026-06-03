const _fuzz = (str, q) => {
  if (!q) return true;
  const s = (str || '').toLowerCase();
  const ql = q.toLowerCase();
  if (s.includes(ql)) return true;
  if (ql.length < 3) return false;
  const maxD = ql.length <= 5 ? 1 : 2;
  return s.split(/\s+/).some(word => {
    if (Math.abs(word.length - ql.length) > maxD + 1) return false;
    const m = word.length, n = ql.length;
    const dp = Array.from({length: m+1}, (_, i) => Array.from({length: n+1}, (_, j) => i === 0 ? j : j === 0 ? i : 0));
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) dp[i][j] = word[i-1] === ql[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    return dp[m][n] <= maxD;
  });
};

function _svgLogo(size, bg, content) {
  const s = size + 'px', r = Math.round(size * 0.28) + 'px';
  return `<div style="width:${s};height:${s};border-radius:${r};overflow:hidden;flex-shrink:0"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg"><rect width="${size}" height="${size}" rx="${Math.round(size*0.28)}" fill="${bg}"/>${content}</svg></div>`;
}
function _initialsLogo(initials, color, size) {
  const s = size + 'px', r = Math.round(size * 0.28) + 'px';
  const fs = Math.round(size * (initials.length > 2 ? 0.28 : 0.35)) + 'px';
  return `<div style="width:${s};height:${s};border-radius:${r};background:${color};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:${fs};font-weight:900;color:#fff;font-family:Arial;letter-spacing:-0.5px">${initials}</div>`;
}
function getBankLogo(bankName, size) {
  size = size || 36;
  if (!bankName) return _initialsLogo('BK', '#5b8dee', size);
  const name = bankName.toUpperCase();
  const fs = (size <= 28 ? Math.round(size * 0.32) : Math.round(size * 0.35)) + 'px';
  const fs3 = Math.round(size * 0.28) + 'px';
  // Pakistan
  if (name.includes('HBL') || name.includes('HABIB')) return _svgLogo(size, '#006837', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">HBL</text>`);
  if (name.includes('UBL') || name.includes('UNITED BANK')) return _svgLogo(size, '#003087', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">UBL</text>`);
  if (name.includes('MCB')) return _svgLogo(size, '#c41e3a', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">MCB</text>`);
  if (name.includes('ABL') || name.includes('ALLIED')) return _svgLogo(size, '#1a237e', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">ABL</text>`);
  if (name.includes('NBP') || name.includes('NATIONAL BANK')) return _svgLogo(size, '#004d40', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">NBP</text>`);
  if (name.includes('MEEZAN')) return _svgLogo(size, '#00695c', `<rect x="20%" y="20%" width="60%" height="60%" rx="4" fill="none" stroke="white" stroke-width="2"/><text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs3}" font-weight="900" font-family="Arial" fill="white">MBL</text>`);
  if (name.includes('FAYSAL')) return _svgLogo(size, '#e65100', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">FYS</text>`);
  if (name.includes('ASKARI')) return _svgLogo(size, '#37474f', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">ASK</text>`);
  if (name.includes('ALFALAH') || name.includes('BANK ALFALAH')) return _svgLogo(size, '#880e4f', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">BAF</text>`);
  if (name.includes('SUMMIT')) return _svgLogo(size, '#4a148c', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">SBL</text>`);
  if (name.includes('SILK')) return _svgLogo(size, '#1565c0', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">SILK</text>`);
  if (name.includes('JAZZCASH') || name.includes('JAZZ CASH')) return _svgLogo(size, '#e53935', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">JCH</text>`);
  if (name.includes('EASYPAISA')) return _svgLogo(size, '#00897b', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">EP</text>`);
  if (name.includes('SADAQAT') || name.includes('SAMBA') || name.includes('SADAPAY')) return _svgLogo(size, '#b71c1c', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">SBP</text>`);
  if (name.includes('NAYAPAY')) return _svgLogo(size, '#e65100', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">NYP</text>`);
  if (name.includes('ZINDIGI')) return _svgLogo(size, '#1a237e', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">ZDG</text>`);
  // UK
  if (name.includes('BARCLAYS')) return _svgLogo(size, '#00aeef', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">BARC</text>`);
  if (name.includes('LLOYDS')) return _svgLogo(size, '#006a4e', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">LYDS</text>`);
  if (name.includes('NATWEST') || name.includes('NAT WEST')) return _svgLogo(size, '#5a1958', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">NWB</text>`);
  if (name.includes('HSBC')) return _svgLogo(size, '#db0011', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs3}" font-weight="900" font-family="Arial" fill="white">HSBC</text>`);
  if (name.includes('SANTANDER')) return _svgLogo(size, '#ec0000', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">SAN</text>`);
  if (name.includes('NATIONWIDE')) return _svgLogo(size, '#0e2f5b', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">NBS</text>`);
  if (name.includes('MONZO')) return _svgLogo(size, '#ff6b6b', `<circle cx="50%" cy="50%" r="35%" fill="none" stroke="white" stroke-width="3"/><text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">M</text>`);
  if (name.includes('STARLING')) return _svgLogo(size, '#6200ea', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">SB</text>`);
  if (name.includes('REVOLUT')) return _svgLogo(size, '#1a1a2e', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">REV</text>`);
  if (name.includes('WISE')) return _svgLogo(size, '#9fe870', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="#1a1a1a">W</text>`);
  if (name.includes('MONESE')) return _svgLogo(size, '#6c47ff', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">MNS</text>`);
  if (name.includes('HALIFAX')) return _svgLogo(size, '#009fdb', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">HFX</text>`);
  if (name.includes('FIRST DIRECT')) return _svgLogo(size, '#000000', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs3}" font-weight="900" font-family="Arial" fill="white">1st</text>`);
  if (name.includes('METRO')) return _svgLogo(size, '#ed1c24', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">MBK</text>`);
  if (name.includes('TSB')) return _svgLogo(size, '#2b6cb0', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">TSB</text>`);
  if (name.includes('CO-OP') || name.includes('COOP')) return _svgLogo(size, '#007dc5', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">COP</text>`);
  if (name.includes('VIRGIN')) return _svgLogo(size, '#e10a0a', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">VM</text>`);
  if (name.includes('STANDARD CHARTERED') || name.includes('SCB')) return _svgLogo(size, '#0000a0', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">SCB</text>`);
  if (name.includes('CHASE UK') || (name.includes('CHASE') && !name.includes('JPMORGAN'))) return _svgLogo(size, '#117ec9', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">CHK</text>`);
  // UAE
  if (name.includes('EMIRATES NBD') || name.includes('ENBD')) return _svgLogo(size, '#e31837', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs3}" font-weight="900" font-family="Arial" fill="white">ENBD</text>`);
  if (name.includes('FAB') || name.includes('FIRST ABU DHABI')) return _svgLogo(size, '#006835', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">FAB</text>`);
  if (name.includes('ADCB')) return _svgLogo(size, '#ef7d00', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs3}" font-weight="900" font-family="Arial" fill="white">ADCB</text>`);
  if (name.includes('RAKBANK') || name.includes('RAK BANK')) return _svgLogo(size, '#e4002b', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">RAK</text>`);
  if (name.includes('MASHREQ')) return _svgLogo(size, '#e4002b', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs3}" font-weight="900" font-family="Arial" fill="white">MASH</text>`);
  if (name.includes('DIB') || name.includes('DUBAI ISLAMIC')) return _svgLogo(size, '#005a9c', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">DIB</text>`);
  if (name.includes('ADIB') || name.includes('ABU DHABI ISLAMIC')) return _svgLogo(size, '#c8a951', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs3}" font-weight="900" font-family="Arial" fill="white">ADIB</text>`);
  if (name.includes('CBD') || name.includes('COMMERCIAL BANK DUBAI')) return _svgLogo(size, '#00538b', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">CBD</text>`);
  if (name.includes('NOOR')) return _svgLogo(size, '#4caf50', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">NOOR</text>`);
  if (name.includes('WIO')) return _svgLogo(size, '#00897b', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">WIO</text>`);
  // International
  if (name.includes('CITI')) return _svgLogo(size, '#003b8e', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">CITI</text>`);
  if (name.includes('DEUTSCHE')) return _svgLogo(size, '#0018a8', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">DB</text>`);
  if (name.includes('JPMORGAN') || name.includes('JP MORGAN')) return _svgLogo(size, '#117ec9', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">JPM</text>`);
  if (name.includes('AMEX') || name.includes('AMERICAN EXPRESS')) return _svgLogo(size, '#016fd0', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs3}" font-weight="900" font-family="Arial" fill="white">AMEX</text>`);
  if (name.includes('BANK OF AMERICA')) return _svgLogo(size, '#e31837', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">BOA</text>`);
  if (name.includes('WELLS FARGO')) return _svgLogo(size, '#d4a017', `<text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" font-weight="900" font-family="Arial" fill="white">WF</text>`);
  // Fallback: colored initials
  const initials = bankName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3);
  const colors = ['#5b8dee','#e91e8c','#00897b','#e65100','#6200ea','#c62828','#1565c0'];
  const color = colors[bankName.charCodeAt(0) % colors.length];
  return _initialsLogo(initials, color, size);
}

const Banks={
  _showArchived: false,
  render(){
    if (!S._bankFilterInit && S.user?.country && ['PK','GB','AE','US'].includes(S.user.country)) {
      S.bF = S.user.country;
      S._bankFilterInit = true;
    }
    const q=(document.getElementById('bQ')?.value||'').toLowerCase();
    const sort=document.getElementById('bSort')?.value||'name';
    const f=S.bF;
    // Chips
    const chips=[['all','All'],['commercial','🏛️ Commercial'],['islamic','🕌 Islamic'],['digital','📱 Digital'],['international','🌐 International'],['microfinance','🏪 MFB'],['fav','⭐ Fav']];
    const ci=document.getElementById('bChips');
    if(ci&&!ci.dataset.built){ci.innerHTML=chips.map(([v,l])=>`<div class="chip${v===f?' on':''}" onclick="S.bF='${v}';Banks.render()">${l}</div>`).join('');ci.dataset.built='1';}
    else if(ci)ci.querySelectorAll('.chip').forEach((c,i)=>c.classList.toggle('on',chips[i][0]===f));
    const archivedCount=(S.banks||[]).filter(b=>b.archived).length;
    let data=S.banks.filter(b=>{
      if(b.archived&&!Banks._showArchived)return false;
      if(f==='fav'&&!b.favorite)return false;
      if(['PK','GB','AE','US'].includes(f)&&b.country!==f)return false;
      if(f==='islamic'&&b.bankType!=='islamic')return false;
      if(f==='digital'&&b.bankType!=='digital')return false;
      if(f==='microfinance'&&b.bankType!=='microfinance')return false;
      return !q||_fuzz(b.bankName,q)||_fuzz(b.accountType,q)||_fuzz(b.country,q)||_fuzz(b.bankType,q)||_fuzz(b.notes,q)||_fuzz(b.holderName,q)||(b.tags||[]).some(t=>_fuzz(t,q));
    });
    if(typeof ContextSwitcher!=='undefined'&&ContextSwitcher.get()!=='ALL'){data=data.filter(b=>(b.country||'').toUpperCase()===ContextSwitcher.get());}
    if(sort==='name')data.sort((a,b)=>a.bankName.localeCompare(b.bankName));
    else if(sort==='country')data.sort((a,b)=>a.country.localeCompare(b.country));
    else if(sort==='fav')data.sort((a,b)=>b.favorite-a.favorite);
    else if(sort==='recent')data.sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));
    const el=document.getElementById('bItems');if(!el)return;
    if(!data.length&&!archivedCount){el.innerHTML=this.emptyState();return;}
    const archiveToggle=archivedCount?`<div style="text-align:center;margin-bottom:10px"><button class="btn btn-g btn-sm" onclick="Banks._showArchived=!Banks._showArchived;Banks.render()">${Banks._showArchived?'Hide':'Show'} ${archivedCount} archived</button></div>`:'';
    const byCC={};data.forEach(b=>{const k=b.country||'OTHER';(byCC[k]=byCC[k]||[]).push(b);});
    el.innerHTML=archiveToggle+Object.entries(byCC).map(([cc,items])=>`<div><div class="csec-h"><span style="font-size:18px">${U.flag(cc)}</span><span class="csec-name">${U.cname(cc)}</span><span class="csec-cnt">${items.length}</span></div>${items.map(b=>this.row(b)).join('')}</div>`).join('');
    initSwipeDelete(el);
    initLongPress(el, id => {
      const b = S.banks.find(x => x.id === id); if (!b) return [];
      return [
        {label:'Edit', icon:'✏️', action: () => Banks.edit(id)},
        {label:'Copy IBAN', icon:'📋', action: () => b.iban && U.copy(b.iban)},
        {label:'View Details', icon:'👁️', action: () => Banks.detail(id)},
        {label:'Delete', icon:'🗑️', destructive: true, action: () => Banks.del(id)},
      ];
    });
  },
  row(b){
    const logoHtml=getBankLogo(b.bankName,36);
    return `<div class="entry" data-id="${b.id}"><div class="entry-main"><div class="entry-ic" style="padding:0;overflow:hidden;border-radius:10px;flex-shrink:0">${logoHtml}</div><div class="entry-body"><div class="entry-name">${b.bankName}${b.ownership==='business'?' <span style="font-size:9px;color:var(--warn)">🏢</span>':''}${b.jointAccount&&b.jointWith?' <span style="font-size:10px;background:rgba(0,213,255,.15);color:var(--info);border:1px solid rgba(0,213,255,.3);border-radius:4px;padding:1px 5px">👥 '+(b.jointWith.split(':')[1]||b.jointWith)+'</span>':''}</div><div class="entry-sub">${b.accountType||''} · ${b.currency||''} ${b.last4?'· ****'+b.last4:''}</div><div class="entry-meta"><span class="badge b-muted">${b.bankType||'bank'}</span>${b.twoFA?'<span class="badge b-ok">2FA</span>':''} ${b.tags?.slice(0,2).map(t=>`<span class="badge b-muted">${t}</span>`).join('')||''}</div></div><div class="entry-acts"><button class="icb fav${b.favorite?' on':''}" onclick="Banks.fav('${b.id}')">⭐</button><button class="icb" onclick="Banks.detail('${b.id}')">👁️</button><button class="icb" onclick="Banks.edit('${b.id}')">✏️</button><button class="icb" onclick="Banks.archive('${b.id}')" title="${b.archived?'Unarchive':'Archive'}">${b.archived?'📦':'🗂️'}</button><button class="icb del" onclick="Banks.del('${b.id}')">🗑️</button></div></div></div>`;
  },
  emptyState(){return `<div class="empty-ios"><div class="ei-ic">🏦</div><div class="ei-title">No banks yet</div><div class="ei-sub">Add your first bank account — track balances, IBANs, and card links across PK, UK & UAE</div><div style="display:flex;gap:10px;justify-content:center;margin-top:16px;flex-wrap:wrap"><button class="btn btn-p" onclick="Banks.openAdd()">+ Add Bank</button><button class="btn btn-g" onclick="Settings.loadDemo()">🎮 Try Demo</button></div></div>`;},
  _showExample(){Modal.open('🏦 Example Bank Entry',`<div class="entry-main" style="padding:0 0 14px"><div class="entry-ic" style="background:var(--glass2,rgba(26,58,107,.9));width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">🏦</div><div class="entry-body"><div class="entry-name">HBL — Main Current</div><div class="entry-sub">PKR · IBAN: PK36HABB…0000</div><div class="entry-meta"><span class="badge b-muted">commercial</span><span class="badge b-ok">Primary</span></div></div></div><div style="padding:12px;background:var(--glass);border-radius:var(--r);font-size:12px;line-height:1.8;color:var(--text2)">Bank name: HBL<br>Country: 🇵🇰 Pakistan<br>Type: Commercial<br>Currency: PKR<br>IBAN: PK36HABB0000000000000000<br>Balance: PKR 125,000</div><p style="font-size:11px;color:var(--text3);margin-top:10px">This is a preview — nothing is saved.</p>`,`<button class="btn btn-g" onclick="Modal.close()">Close</button><button class="btn btn-p" onclick="Modal.close();Banks.openAdd()">+ Add My Bank</button>`);},
  openAdd(){
    Banks._openWithCountry(S.user.country||'PK');
  },
  _openWithCountry(cc){
    Modal.open('🏦 Add Bank',this.form(),`<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Banks.save()">Save</button>`);
    this.bindCC();
    if(cc){setTimeout(()=>{const el=document.getElementById('bf-cc');if(el){el.value=cc;Banks._onCountryChange(cc);}},80);}
  },
  _bankIcons:{HBL:'🏦',UBL:'🏛️','MCB Bank':'🏦','Bank Alfalah':'🔵','Allied Bank':'🟢','Askari Bank':'🪖','Meezan Bank':'🕌','Bank Al Habib':'🏦','Habib Metro Bank':'🏦','Faysal Bank':'🕌','Bank Islami':'☪️','Sadapay':'💜','NayaPay':'🔶','Zindigi':'⚡','JazzCash':'🟠','EasyPaisa':'🟢','NBP':'🏛️','Bank of Punjab':'🏛️','Monzo':'🔴','Starling Bank':'💙','Revolut':'⚫','Wise':'💚','Barclays':'🔵','HSBC':'🔴','NatWest':'🟣','Lloyds Bank':'🟢','Santander UK':'🔥','Halifax':'🏠','Nationwide':'🟡','Metro Bank':'🔴','First Direct':'🔵','Chase UK':'🔵','TSB':'🔵','Emirates NBD':'🟠','FAB':'🔷','ADCB':'🔵','Mashreq Bank':'🟦','ADIB':'🕌','Dubai Islamic Bank':'🕌','RAKBank':'🔴','Wio Bank':'🟢','Liv.':'💛','Commercial Bank of Dubai':'🏦','Chase':'🟦','Bank of America':'🔴','Wells Fargo':'🟡','Citibank':'🔵'},
  _popularOrder:{
    PK:['HBL','Meezan Bank','UBL','MCB Bank','Bank Alfalah','Allied Bank','Faysal Bank','Bank Al Habib','Askari Bank','Sadapay','NayaPay','Zindigi','JazzCash','EasyPaisa','NBP','Bank of Punjab'],
    GB:['Monzo','Starling Bank','Barclays','HSBC UK','Lloyds Bank','NatWest','Revolut','Wise','Chase UK','Nationwide'],
    AE:['Emirates NBD','FAB','ADCB','Dubai Islamic Bank','Mashreq Bank','ADIB','RAKBank','Wio Bank','Liv.'],
    US:['Chase','Bank of America','Wells Fargo','Citibank']
  },
  _showBankChips(cc){
    const wrap=document.getElementById('bf-bank-picker-wrap');
    if(!wrap)return;
    const allBanks=SMART_DB.banks.filter(b=>b.country===cc);
    if(!allBanks.length){wrap.innerHTML='';return;}
    const popularNames=this._popularOrder[cc]||[];
    const popular=popularNames.map(n=>allBanks.find(b=>b.name===n)).filter(Boolean).slice(0,8);
    const popularSet=new Set(popular.map(b=>b.name));
    const grouped={commercial:[],islamic:[],digital:[],microfinance:[],government:[],international:[]};
    allBanks.filter(b=>!popularSet.has(b.name)).forEach(b=>{
      const g=grouped[b.type];
      if(g)g.push(b);else grouped.commercial.push(b);
    });
    const typeLabels={commercial:'Commercial',islamic:'Islamic',digital:'Digital',microfinance:'Microfinance',government:'Government',international:'International'};
    let optgroups='';
    if(popular.length)optgroups+=`<optgroup label="Popular">${popular.map(b=>`<option value="${b.name}">${b.name}</option>`).join('')}</optgroup>`;
    Object.entries(grouped).forEach(([type,banks])=>{
      if(!banks.length)return;
      banks.sort((a,b)=>a.name.localeCompare(b.name));
      optgroups+=`<optgroup label="${typeLabels[type]||type}">${banks.map(b=>`<option value="${b.name}">${b.name}</option>`).join('')}</optgroup>`;
    });
    const tiles=popularNames.slice(0,16).map(n=>allBanks.find(b=>b.name===n)).filter(Boolean);
    const safeCC=cc.replace(/'/g,"\\'");
    wrap.innerHTML=`
      <div class="fg" style="margin-bottom:10px">
        <label class="fl">Select Bank</label>
        <div style="position:relative">
          <select class="inp" id="bf-bank-sel" onchange="Banks._onBankSelect(this.value)" style="padding-right:32px">
            <option value="">— Choose a bank —</option>
            ${optgroups}
          </select>
          <span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--text3);font-size:11px">▾</span>
        </div>
      </div>
      <details style="margin-bottom:10px">
        <summary style="cursor:pointer;font-size:11px;font-weight:700;color:var(--text3);padding:4px 0;list-style:none;display:flex;align-items:center;gap:5px"><span style="flex:1">▸ Show all banks as tiles</span></summary>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:7px;margin-top:8px" id="bf-tiles-grid">
          ${tiles.map(b=>{
            const safeName=b.name.replace(/'/g,"\\'");
            const logoEl=getBankLogo(b.name,32);
            return `<div onclick="document.getElementById('bf-name').value='${safeName}';const s=document.getElementById('bf-bank-sel');if(s)s.value='${safeName}';SMART_DB.fillBank('${safeName}','${safeCC}');document.getElementById('bf-tiles-grid')&&document.getElementById('bf-tiles-grid').querySelectorAll('div').forEach(t=>t.style.borderColor='');this.style.borderColor='var(--accent)'" style="cursor:pointer;background:var(--glass2);border:1.5px solid var(--border);border-radius:var(--r);padding:10px 8px;text-align:center;transition:border-color .15s;display:flex;flex-direction:column;align-items:center;gap:4px">${logoEl}<div style="font-size:9px;font-weight:600;line-height:1.3;color:var(--text)">${b.name}</div></div>`;
          }).join('')}
        </div>
      </details>`;
  },
  _onBankSelect(name){
    if(!name)return;
    const nameEl=document.getElementById('bf-name');
    if(nameEl)nameEl.value=name;
    const cc=document.getElementById('bf-cc')?.value||'';
    SMART_DB.fillBank(name,cc);
  },
  _onCountryChange(cc){
    const pfxMap={PK:'PKR',GB:'GBP',AE:'AED',US:'USD'};
    const curEl=document.getElementById('bf-cur');
    if(curEl&&pfxMap[cc])curEl.value=pfxMap[cc];
    const dl=document.getElementById('bankDL');
    if(dl)dl.innerHTML=SMART_DB.banks.filter(b=>b.country===cc).map(b=>`<option value="${b.name}">`).join('');
    this._showBankChips(cc);
  },
  form(b={}){
    const isEdit=!!b.id;
    const bankNames=SMART_DB.banks.map(x=>`<option value="${x.name}">`).join('');
    return `
    <datalist id="bankDL">${bankNames}</datalist>
    <datalist id="bfTypeDL"><option>Commercial</option><option>Islamic</option><option>Digital</option><option>Microfinance</option><option>Government</option><option>International</option><option>Investment</option></datalist>
    <!-- COUNTRY FIRST -->
    <div class="fr"><div class="fg"><label class="fl">Country *</label><select class="inp" id="bf-cc" onchange="Banks._onCountryChange(this.value)">${U.countries()}</select></div><div class="fg"><label class="fl">Currency *</label><select class="inp" id="bf-cur">${U.currencies()}</select></div></div>
    <!-- Bank picker injected here by _showBankChips() -->
    <div id="bf-bank-picker-wrap"></div>
    <!-- REQUIRED -->
    <div class="fg"><label class="fl">Bank Name *</label><input class="inp" id="bf-name" list="bankDL" placeholder="e.g. HBL, Monzo, Emirates NBD…" autocomplete="off" oninput="SMART_DB.fillBank(this.value,document.getElementById('bf-cc')?.value)" value="${b.bankName||''}"></div>
    <!-- MORE DETAILS -->
    <details${isEdit?' open':''} style="margin-top:10px">
      <summary style="cursor:pointer;font-size:12px;font-weight:700;color:var(--text2);padding:6px 0;list-style:none;display:flex;align-items:center;gap:6px">
        <span style="flex:1">More details</span><span style="font-size:10px;color:var(--text3)">▾</span>
      </summary>
      <div style="padding-top:10px">
        <div class="fr"><div class="fg"><label class="fl">Account Type</label><datalist id="bfAtypeDL"><option>Current</option><option>Savings</option><option>Business</option><option>Joint</option><option>Islamic</option><option>Fixed Deposit</option></datalist><input class="inp" id="bf-atype" value="${b.accountType||''}" list="bfAtypeDL" placeholder="Current, Savings…"></div><div class="fg"><label class="fl">Bank Type</label><input class="inp" id="bf-type" value="${b.bankType||''}" list="bfTypeDL" placeholder="commercial, digital…"></div></div>
        <div class="fr"><div class="fg"><label class="fl">Last 4 Digits</label><input class="inp" id="bf-l4" value="${b.last4||''}" maxlength="4" inputmode="numeric" placeholder="1234"></div><div class="fg"><label class="fl">Balance</label><input class="inp num-inp" id="bf-bal" type="text" inputmode="decimal" pattern="[0-9,\\.]*" value="${b.balance||''}" placeholder="0"></div></div>
        <div class="fr"><div class="fg"><label class="fl">IBAN</label><input class="inp" id="bf-iban" value="${b.iban||''}" placeholder="GB29…"></div><div class="fg"><label class="fl">SWIFT / Sort Code</label><input class="inp" id="bf-swift" value="${b.sortCode||''}" placeholder="12-34-56 or SWIFT"></div></div>
        <div class="fr"><div class="fg"><label class="fl">Account Holder</label><input class="inp" id="bf-holder" value="${b.holderName||S.user.name||''}" placeholder="Full name"></div><div class="fg"><label class="fl">Ownership</label><select class="inp" id="bf-own"><option value="personal"${b.ownership!=='business'?' selected':''}>👤 Personal</option><option value="business"${b.ownership==='business'?' selected':''}>🏢 Business</option><option value="joint"${b.ownership==='joint'?' selected':''}>👥 Joint</option></select></div></div>
        <div class="fg"><label class="fl">Joint Account?</label><div style="display:flex;align-items:center;gap:12px;margin-top:6px"><input type="checkbox" id="bf-joint" onchange="Banks._toggleJoint(this.checked)" style="width:20px;height:20px;cursor:pointer" ${b.jointAccount?'checked':''}><label for="bf-joint" style="font-size:14px;color:var(--text2)">This is a joint account</label></div><div id="b-joint-section" style="display:${b.jointAccount?'block':'none'};margin-top:10px"><div style="font-size:12px;color:var(--text3);margin-bottom:8px">Joint with (select from Family or Contacts):</div><select id="b-joint-person" style="width:100%;background:var(--input);border:1px solid var(--border);border-radius:10px;padding:12px;color:var(--text);font-size:14px"><option value="">Select person...</option>${(()=>{try{const fam=JSON.parse(localStorage.getItem('vo_family')||'{}');const members=(fam.members||[]).map(m=>`<option value="family:${m.name}"${b.jointWith==='family:'+m.name?' selected':''}>${m.name} (Family)</option>`).join('');const contacts=(typeof S!=='undefined'?S.friends||[]:[]).map(f=>`<option value="contact:${f.name}"${b.jointWith==='contact:'+f.name?' selected':''}>${f.name} (Contact)</option>`).join('');return members+contacts;}catch(e){return '';}})()}</select><div style="font-size:11px;color:var(--text3);margin-top:6px;padding:8px;background:rgba(0,213,255,.06);border-radius:8px;border:1px solid rgba(0,213,255,.2)">ℹ️ Joint accounts count 100% toward your net worth — avoiding double-counting.</div></div></div>
        <div class="fr"><div class="fg"><label class="fl">Registered Email</label><input class="inp" id="bf-email" value="${b.email||''}" type="email" placeholder="email@…"></div><div class="fg"><label class="fl">Registered Phone</label><input class="inp" id="bf-phone" value="${b.phone||''}" placeholder="+44…"></div></div>
        ${U.loginFields(b)}
        <div class="fg"><label class="fl">Notes</label><textarea class="inp" id="bf-notes" rows="2">${b.notes||''}</textarea></div>
        <div class="fg"><label class="fl">Tags</label>${U.tags(b.tags||[])}</div>
        <label style="display:flex;align-items:center;gap:9px;cursor:pointer;margin-top:4px"><input type="checkbox" id="bf-fav" ${b.favorite?'checked':''}><span style="font-size:13px">⭐ Favourite</span></label>
      </div>
    </details>`;
  },
  _toggleJoint(checked){const s=document.getElementById('b-joint-section');if(s)s.style.display=checked?'block':'none';},
  bindCC(){setTimeout(()=>{const cur=document.getElementById('bf-cur');if(cur)cur.value=S.user.currency||'GBP';const balEl=document.getElementById('bf-bal');if(balEl)U.numInput(balEl,S.user.currency||'GBP');},60);},
  save(editId=null){
    const name=document.getElementById('bf-name').value.trim();if(!name){Toast.show('Bank name required','warning');return;} // TODO: formalize via Validators.run(item,'bank') in js/core/validators.js
    if(!editId){const dup=checkDuplicate('bank',{bankName:name});if(dup.isDuplicate&&!window.__vos_confirm(dup.message))return;}
    const lf=U.getLF();
    const g=id=>{const e=document.getElementById(id);return e?e.value.trim():''};
    const item={id:editId||U.id(),bankName:name,country:document.getElementById('bf-cc').value,bankType:g('bf-type'),accountType:g('bf-atype'),currency:document.getElementById('bf-cur').value,last4:g('bf-l4'),balance:parseFloat((g('bf-bal')||'').replace(/,/g,''))||0,iban:g('bf-iban'),sortCode:g('bf-swift'),holderName:g('bf-holder')||S.user.name||'',ownership:document.getElementById('bf-own')?.value||'personal',jointAccount:document.getElementById('bf-joint')?.checked||false,jointWith:document.getElementById('b-joint-person')?.value||'',email:g('bf-email'),phone:g('bf-phone'),...lf,notes:g('bf-notes'),tags:U.getTags(),favorite:document.getElementById('bf-fav')?.checked||false,createdAt:editId?S.banks.find(x=>x.id===editId)?.createdAt:new Date().toISOString()};
    const auto=autoTags('bank',item);item.tags=[...new Set([...(item.tags||[]),...auto])];
    if(editId){S.banks=S.banks.map(x=>x.id===editId?item:x);if(typeof Audit!=='undefined')Audit.log(item,'edited');}else{S.banks.push(item);if(typeof Audit!=='undefined')Audit.log(item,'created');}
    Activity.log((editId?'Edited':'Added')+' bank',name);Store.save();Modal.close();this.render();Toast.show(`${editId?'Updated':'Added'}: ${name}`,'success');
    if(typeof Haptic!=='undefined')Haptic.save();
    if(!editId){promptAddAnother('Bank','Banks.openAdd');setTimeout(()=>Toast.show(`Added ${name} — <button class="cpbtn" onclick="Cards.openAdd()">Add a card for this bank?</button>`,'info',6000),800);}
  },
  edit(id){const b=S.banks.find(x=>x.id===id);if(!b)return;Modal.open('✏️ Edit Bank',this.form(b),`<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-d btn-sm" onclick="Banks.del('${id}',true)">Delete</button><button class="btn btn-p" onclick="Banks.save('${id}')">Update</button>`);setTimeout(()=>{[['bf-cc',b.country||'GB'],['bf-type',b.bankType||'commercial'],['bf-atype',b.accountType||'Current'],['bf-cur',b.currency||'GBP'],['bf-own',b.ownership||'personal']].forEach(([i,v])=>{const el=document.getElementById(i);if(el)el.value=v;});U.setLF(b);this.bindCC();if(b.country)this._showBankChips(b.country);},80);},
  detail(id){
    const b=S.banks.find(x=>x.id===id);if(!b)return;
    const linkedCards=(typeof VaultRelations!=='undefined')?VaultRelations.cardsForBank(b.id):[];
    const linkedCardsHtml=linkedCards.length?`<div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border)"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);margin-bottom:8px">Linked Cards (${linkedCards.length})</div>${linkedCards.map(c=>`<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)"><span style="font-size:16px">💳</span><div><div style="font-size:13px;font-weight:600;color:var(--text)">${c.cardName||'Card'}</div><div style="font-size:11px;color:var(--text3)">${c.network||''} · ${c.cardType||''} ${c.last4?'· ****'+c.last4:''}</div></div></div>`).join('')}</div>`:'';
    const auditHtml=typeof Audit!=='undefined'?Audit.render(b):'';
    Modal.open(`🏦 ${b.bankName}`,`<div>${[['Bank',b.bankName],['Country',U.flag(b.country)+' '+U.cname(b.country)],['Type',b.bankType],['Account Type',b.accountType],['Currency',b.currency],['Last 4','****'+(b.last4||'—')],['IBAN',b.iban?'••••':'-',b.iban],['Sort/SWIFT',b.sortCode||'—'],['Holder',b.holderName||'—'],['Email',b.email?'••••':'-',b.email],['Phone',b.phone?'••••':'-',b.phone],['Username',b.username?'••••':'-',b.username],['App PIN',b.appPin?'••••':'-',b.appPin],['2FA',b.twoFA||'None'],['Pwd Hint',b.pwdHint||'—'],['Ownership',b.ownership||'Personal'],['Balance',b.balance?U.fmt(b.balance)+' '+b.currency:'—'],['Notes',b.notes||'—']].map(([k,v,s])=>U.drRow(k,v,s)).join('')}${linkedCardsHtml}${auditHtml}</div>`,`<button class="btn btn-g" onclick="Modal.close()">Close</button><button class="btn btn-p" onclick="Banks.edit('${id}');Modal.close()">Edit</button>`);
  },
  fav(id){const b=S.banks.find(x=>x.id===id);if(!b)return;b.favorite=!b.favorite;Store.save();this.render();},
  archive(id){const b=S.banks.find(x=>x.id===id);if(!b)return;b.archived=!b.archived;b.updatedAt=new Date().toISOString();Store.save();this.render();Toast.show(b.archived?'Archived':'Unarchived','info');},
  del(id,fm=false){
    if(!window.__vos_confirm('Move to Trash?'))return;
    const b=S.banks.find(x=>x.id===id);if(!b)return;
    S.trash.push({id:U.id(),type:'banks',data:b,deletedAt:new Date().toISOString()});
    S.banks=S.banks.filter(x=>x.id!==id);
    if(typeof Haptic!=='undefined')Haptic.del();
    Activity.log('Trashed bank',b.bankName);Store.save();if(fm)Modal.close();this.render();
    Toast.show(`Moved to Trash — <button class="cpbtn" onclick="Trash.restore('${S.trash[S.trash.length-1].id}');this.closest('.toast').remove()">Undo</button>`,'info',6000);
  }
};
