const Banks={
  render(){
    const q=(document.getElementById('bQ')?.value||'').toLowerCase();
    const sort=document.getElementById('bSort')?.value||'name';
    const f=S.bF;
    // Chips
    const chips=[['all','All'],['commercial','🏛️ Commercial'],['islamic','🕌 Islamic'],['digital','📱 Digital'],['international','🌐 International'],['microfinance','🏪 MFB'],['fav','⭐ Fav']];
    const ci=document.getElementById('bChips');
    if(ci&&!ci.dataset.built){ci.innerHTML=chips.map(([v,l])=>`<div class="chip${v===f?' on':''}" onclick="S.bF='${v}';Banks.render()">${l}</div>`).join('');ci.dataset.built='1';}
    else if(ci)ci.querySelectorAll('.chip').forEach((c,i)=>c.classList.toggle('on',chips[i][0]===f));
    let data=S.banks.filter(b=>{
      if(f==='fav'&&!b.favorite)return false;
      if(['PK','GB','AE','US'].includes(f)&&b.country!==f)return false;
      if(f==='islamic'&&b.bankType!=='islamic')return false;
      if(f==='digital'&&b.bankType!=='digital')return false;
      if(f==='microfinance'&&b.bankType!=='microfinance')return false;
      return !q||JSON.stringify(b).toLowerCase().includes(q);
    });
    if(sort==='name')data.sort((a,b)=>a.bankName.localeCompare(b.bankName));
    else if(sort==='country')data.sort((a,b)=>a.country.localeCompare(b.country));
    else if(sort==='fav')data.sort((a,b)=>b.favorite-a.favorite);
    else if(sort==='recent')data.sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));
    const el=document.getElementById('bItems');if(!el)return;
    if(!data.length){el.innerHTML=this.emptyState();return;}
    const byCC={};data.forEach(b=>{const k=b.country||'OTHER';(byCC[k]=byCC[k]||[]).push(b);});
    el.innerHTML=Object.entries(byCC).map(([cc,items])=>`<div><div class="csec-h"><span style="font-size:18px">${U.flag(cc)}</span><span class="csec-name">${U.cname(cc)}</span><span class="csec-cnt">${items.length}</span></div>${items.map(b=>this.row(b)).join('')}</div>`).join('');
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
    const tIc={commercial:'🏦',islamic:'🕌',digital:'📱',microfinance:'🏪',international:'🌐',government:'🏛️',investment:'📊'};
    return `<div class="entry" data-id="${b.id}"><div class="entry-main"><div class="entry-ic">${tIc[b.bankType]||'🏦'}</div><div class="entry-body"><div class="entry-name">${b.bankName}${b.ownership==='business'?' <span style="font-size:9px;color:var(--warn)">🏢</span>':''}</div><div class="entry-sub">${b.accountType||''} · ${b.currency||''} ${b.last4?'· ****'+b.last4:''}</div><div class="entry-meta"><span class="badge b-muted">${b.bankType||'bank'}</span>${b.twoFA?'<span class="badge b-ok">2FA</span>':''} ${b.tags?.slice(0,2).map(t=>`<span class="badge b-muted">${t}</span>`).join('')||''}</div></div><div class="entry-acts"><button class="icb fav${b.favorite?' on':''}" onclick="Banks.fav('${b.id}')">⭐</button><button class="icb" onclick="Banks.detail('${b.id}')">👁️</button><button class="icb" onclick="Banks.edit('${b.id}')">✏️</button><button class="icb del" onclick="Banks.del('${b.id}')">🗑️</button></div></div></div>`;
  },
  emptyState(){return `<div class="empty-ios"><div class="ei-ic">🏦</div><div class="ei-title">No Banks Yet</div><div class="ei-sub">Add your bank accounts to track balances, IBANs, and login details</div><button class="btn btn-p" onclick="Banks.openAdd()">+ Add Bank</button></div>`;},
  openAdd(){
    const ctries=[{c:'PK',f:'🇵🇰',n:'Pakistan'},{c:'GB',f:'🇬🇧',n:'UK'},{c:'AE',f:'🇦🇪',n:'UAE'},{c:'US',f:'🇺🇸',n:'US'},{c:'OTHER',f:'🌍',n:'Other'}];
    Modal.open('🏦 Add Bank',`
      <div style="margin-bottom:4px"><div style="font-size:11px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.3px;margin-bottom:10px">Select Country</div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:12px">
        ${ctries.map(c=>`<div onclick="Banks._openWithCountry('${c.c}')" style="text-align:center;padding:12px 4px;background:var(--glass);border:1px solid var(--border);border-radius:var(--r);cursor:pointer;transition:border-color .15s" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'"><div style="font-size:24px;margin-bottom:4px">${c.f}</div><div style="font-size:10px;font-weight:600;color:var(--text2)">${c.n}</div></div>`).join('')}
      </div>
      <div style="text-align:center"><button class="btn btn-g btn-sm" onclick="Banks._openWithCountry('')">✏️ Enter manually</button></div></div>
    `,`<button class="btn btn-g" onclick="Modal.close()">Cancel</button>`);
  },
  _openWithCountry(cc){
    Modal.open('🏦 Add Bank',this.form(),`<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Banks.save()">Save</button>`);
    this.bindCC();
    if(cc){setTimeout(()=>{const el=document.getElementById('bf-cc');if(el){el.value=cc;el.dispatchEvent(new Event('change'));}Banks._showBankChips(cc);},80);}
  },
  _bankIcons:{HBL:'🏦',UBL:'🏛️','MCB Bank':'🏦','Bank Alfalah':'🔵','Allied Bank':'🟢','Askari Bank':'🪖','Meezan Bank':'🕌','Bank Al Habib':'🏦','Habib Metro Bank':'🏦','Faysal Bank':'🕌','Bank Islami':'☪️','Sadapay':'💜','NayaPay':'🔶','Zindigi':'⚡','JazzCash':'🟠','EasyPaisa':'🟢','NBP':'🏛️','Bank of Punjab':'🏛️','Monzo':'🔴','Starling Bank':'💙','Revolut':'⚫','Wise':'💚','Barclays':'🔵','HSBC':'🔴','NatWest':'🟣','Lloyds Bank':'🟢','Santander UK':'🔥','Halifax':'🏠','Nationwide':'🟡','Metro Bank':'🔴','First Direct':'🔵','Chase UK':'🔵','TSB':'🔵','Emirates NBD':'🟠','FAB':'🔷','ADCB':'🔵','Mashreq Bank':'🟦','ADIB':'🕌','Dubai Islamic Bank':'🕌','RAKBank':'🔴','Wio Bank':'🟢','Liv.':'💛','Commercial Bank of Dubai':'🏦','Chase':'🟦','Bank of America':'🔴','Wells Fargo':'🟡','Citibank':'🔵'},
  _showBankChips(cc){
    const banks=SMART_DB.banks.filter(b=>b.country===cc).slice(0,16);
    if(!banks.length)return;
    const inp=document.getElementById('bf-name');if(!inp)return;
    const existing=inp.parentElement.querySelector('.bank-tiles');if(existing)existing.remove();
    const ct=document.createElement('div');ct.className='bank-tiles';
    ct.style.cssText='display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:7px;margin-bottom:12px';
    ct.innerHTML=banks.map(b=>{
      const ic=this._bankIcons[b.name]||'🏦';
      const typeLabel={commercial:'',islamic:'Islamic',digital:'Digital',microfinance:'MFB',government:'Gov',international:'Intl'}[b.type]||'';
      return `<div onclick="document.getElementById('bf-name').value='${b.name.replace(/'/g,"\\'")}';SMART_DB.fillBank('${b.name.replace(/'/g,"\\'")}');this.closest('.bank-tiles').querySelectorAll('div').forEach(t=>t.style.borderColor='');this.style.borderColor='var(--accent)'" style="cursor:pointer;background:var(--glass2);border:1.5px solid var(--border);border-radius:var(--r);padding:10px 8px;text-align:center;transition:border-color .15s">
        <div style="font-size:22px;margin-bottom:4px">${ic}</div>
        <div style="font-size:10px;font-weight:600;line-height:1.3;color:var(--text)">${b.name}</div>
        ${typeLabel?`<div style="font-size:9px;color:var(--text3);margin-top:2px">${typeLabel}</div>`:''}
      </div>`;
    }).join('');
    inp.parentElement.insertBefore(ct,inp);
  },
  form(b={}){
    const isEdit=!!b.id;
    const bankNames=SMART_DB.banks.map(x=>`<option value="${x.name}">`).join('');
    return `
    <datalist id="bankDL">${bankNames}</datalist>
    <datalist id="bfTypeDL"><option>commercial</option><option>islamic</option><option>microfinance</option><option>digital</option><option>international</option><option>government</option></datalist>
    <!-- REQUIRED -->
    <div class="fg"><label class="fl">Bank Name *</label><input class="inp" id="bf-name" list="bankDL" placeholder="e.g. HBL, Monzo, Emirates NBD…" autocomplete="off" oninput="SMART_DB.fillBank(this.value)" value="${b.bankName||''}"></div>
    <div class="fr"><div class="fg"><label class="fl">Country *</label><select class="inp" id="bf-cc">${U.countries()}</select></div><div class="fg"><label class="fl">Currency *</label><select class="inp" id="bf-cur">${U.currencies()}</select></div></div>
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
        <div class="fr"><div class="fg"><label class="fl">Registered Email</label><input class="inp" id="bf-email" value="${b.email||''}" type="email" placeholder="email@…"></div><div class="fg"><label class="fl">Registered Phone</label><input class="inp" id="bf-phone" value="${b.phone||''}" placeholder="+44…"></div></div>
        ${U.loginFields(b)}
        <div class="fg"><label class="fl">Notes</label><textarea class="inp" id="bf-notes" rows="2">${b.notes||''}</textarea></div>
        <div class="fg"><label class="fl">Tags</label>${U.tags(b.tags||[])}</div>
        <label style="display:flex;align-items:center;gap:9px;cursor:pointer;margin-top:4px"><input type="checkbox" id="bf-fav" ${b.favorite?'checked':''}><span style="font-size:13px">⭐ Favourite</span></label>
      </div>
    </details>`;
  },
  bindCC(){setTimeout(()=>{const cc=document.getElementById('bf-cc');const cur=document.getElementById('bf-cur');if(cc){cc.onchange=()=>{document.getElementById('bankDL').innerHTML=SMART_DB.banks.filter(b=>b.country===cc.value).map(b=>`<option value="${b.name}">`).join('');const pfxMap={PK:'PKR',GB:'GBP',AE:'AED',US:'USD'};const c=document.getElementById('bf-cur');if(c)c.value=pfxMap[cc.value]||'GBP';};}if(cur)cur.value=S.user.currency||'GBP';const balEl=document.getElementById('bf-bal');if(balEl)U.numInput(balEl,S.user.currency||'GBP');},60);},
  save(editId=null){
    const name=document.getElementById('bf-name').value.trim();if(!name){Toast.show('Bank name required','warning');return;}
    if(!editId){const dup=checkDuplicate('bank',{bankName:name});if(dup.isDuplicate&&!window.__vos_confirm(dup.message))return;}
    const lf=U.getLF();
    const g=id=>{const e=document.getElementById(id);return e?e.value.trim():''};
    const item={id:editId||U.id(),bankName:name,country:document.getElementById('bf-cc').value,bankType:g('bf-type'),accountType:g('bf-atype'),currency:document.getElementById('bf-cur').value,last4:g('bf-l4'),balance:parseFloat((g('bf-bal')||'').replace(/,/g,''))||0,iban:g('bf-iban'),sortCode:g('bf-swift'),holderName:g('bf-holder')||S.user.name||'',ownership:document.getElementById('bf-own')?.value||'personal',email:g('bf-email'),phone:g('bf-phone'),...lf,notes:g('bf-notes'),tags:U.getTags(),favorite:document.getElementById('bf-fav')?.checked||false,createdAt:editId?S.banks.find(x=>x.id===editId)?.createdAt:new Date().toISOString()};
    const auto=autoTags('bank',item);item.tags=[...new Set([...(item.tags||[]),...auto])];
    if(editId)S.banks=S.banks.map(x=>x.id===editId?item:x);else S.banks.push(item);
    Activity.log((editId?'Edited':'Added')+' bank',name);Store.save();Modal.close();this.render();Toast.show(`${editId?'Updated':'Added'}: ${name}`,'success');
    if(!editId)promptAddAnother('Bank','Banks.openAdd');
  },
  edit(id){const b=S.banks.find(x=>x.id===id);if(!b)return;Modal.open('✏️ Edit Bank',this.form(b),`<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-d btn-sm" onclick="Banks.del('${id}',true)">Delete</button><button class="btn btn-p" onclick="Banks.save('${id}')">Update</button>`);setTimeout(()=>{[['bf-cc',b.country||'GB'],['bf-type',b.bankType||'commercial'],['bf-atype',b.accountType||'Current'],['bf-cur',b.currency||'GBP'],['bf-own',b.ownership||'personal']].forEach(([i,v])=>{const el=document.getElementById(i);if(el)el.value=v;});U.setLF(b);this.bindCC();},60);},
  detail(id){const b=S.banks.find(x=>x.id===id);if(!b)return;Modal.open(`🏦 ${b.bankName}`,`<div>${[['Bank',b.bankName],['Country',U.flag(b.country)+' '+U.cname(b.country)],['Type',b.bankType],['Account Type',b.accountType],['Currency',b.currency],['Last 4','****'+(b.last4||'—')],['IBAN',b.iban?'••••':'-',b.iban],['Sort/SWIFT',b.sortCode||'—'],['Holder',b.holderName||'—'],['Email',b.email?'••••':'-',b.email],['Phone',b.phone?'••••':'-',b.phone],['Username',b.username?'••••':'-',b.username],['App PIN',b.appPin?'••••':'-',b.appPin],['2FA',b.twoFA||'None'],['Pwd Hint',b.pwdHint||'—'],['Ownership',b.ownership||'Personal'],['Balance',b.balance?U.fmt(b.balance)+' '+b.currency:'—'],['Notes',b.notes||'—']].map(([k,v,s])=>U.drRow(k,v,s)).join('')}</div>`,`<button class="btn btn-g" onclick="Modal.close()">Close</button><button class="btn btn-p" onclick="Banks.edit('${id}');Modal.close()">Edit</button>`);},
  fav(id){const b=S.banks.find(x=>x.id===id);if(!b)return;b.favorite=!b.favorite;Store.save();this.render();},
  del(id,fm=false){
    if(!window.__vos_confirm('Move to Trash?'))return;
    const b=S.banks.find(x=>x.id===id);if(!b)return;
    S.trash.push({id:U.id(),type:'banks',data:b,deletedAt:new Date().toISOString()});
    S.banks=S.banks.filter(x=>x.id!==id);
    Activity.log('Trashed bank',b.bankName);Store.save();if(fm)Modal.close();this.render();
    Toast.show(`Moved to Trash — <button class="cpbtn" onclick="Trash.restore('${S.trash[S.trash.length-1].id}');this.closest('.toast').remove()">Undo</button>`,'info',6000);
  }
};
