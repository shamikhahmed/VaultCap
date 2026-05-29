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
  },
  row(b){
    const tIc={commercial:'🏦',islamic:'🕌',digital:'📱',microfinance:'🏪',international:'🌐',government:'🏛️',investment:'📊'};
    return `<div class="entry"><div class="entry-main"><div class="entry-ic">${tIc[b.bankType]||'🏦'}</div><div class="entry-body"><div class="entry-name">${b.bankName}${b.ownership==='business'?' <span style="font-size:9px;color:var(--warn)">🏢</span>':''}</div><div class="entry-sub">${b.accountType||''} · ${b.currency||''} ${b.last4?'· ****'+b.last4:''}</div><div class="entry-meta"><span class="badge b-muted">${b.bankType||'bank'}</span>${b.twoFA?'<span class="badge b-ok">2FA</span>':''} ${b.tags?.slice(0,2).map(t=>`<span class="badge b-muted">${t}</span>`).join('')||''}</div></div><div class="entry-acts"><button class="icb fav${b.favorite?' on':''}" onclick="Banks.fav('${b.id}')">⭐</button><button class="icb" onclick="Banks.detail('${b.id}')">👁️</button><button class="icb" onclick="Banks.edit('${b.id}')">✏️</button><button class="icb del" onclick="Banks.del('${b.id}')">🗑️</button></div></div></div>`;
  },
  emptyState(){return `<div class="empty"><div class="empty-ic">🏦</div><h3>No banks yet</h3><p>Track all your bank accounts in one place</p><div class="empty-guide"><div class="guide-step"><div class="gst-num">1</div><div class="gst-body"><h4>Tap "Add" above</h4><p>Enter your bank name and account details</p></div></div><div class="guide-step"><div class="gst-num">2</div><div class="gst-body"><h4>Add login credentials</h4><p>Store username, password hints and 2FA info securely</p></div></div><div class="guide-step"><div class="gst-num">3</div><div class="gst-body"><h4>Use filters above</h4><p>Filter by type — Commercial, Islamic, Digital and more</p></div></div></div><button class="btn btn-p" style="margin-top:14px" onclick="Banks.openAdd()">🏦 Add Your First Bank</button></div>`;},
  openAdd(){Modal.open('🏦 Add Bank',this.form(),`<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Banks.save()">Save</button>`);this.bindCC();},
  form(b={}){
    return `<datalist id="bkDL">${U.bankOpts(b.country||'')}</datalist>
    <div class="fg"><label class="fl">Bank Name *</label><input class="inp" id="bf-name" value="${b.bankName||''}" list="bkDL" placeholder="e.g. HSBC, HBL..." autocomplete="off"></div>
    <div class="fr"><div class="fg"><label class="fl">Country *</label><select class="inp" id="bf-cc">${U.countries()}</select></div><div class="fg"><label class="fl">Type</label><datalist id="bfTypeDL"><option>commercial</option><option>islamic</option><option>microfinance</option><option>digital</option><option>international</option><option>government</option><option>investment</option></datalist><input class="inp" id="bf-type" value="${b.bankType||''}" list="bfTypeDL" placeholder="commercial, islamic, digital..."></div></div>
    <div class="fr"><div class="fg"><label class="fl">Account Type</label><datalist id="bfAtypeDL"><option>Current</option><option>Savings</option><option>Business</option><option>Joint</option><option>Multi-Currency</option><option>Islamic</option><option>Student</option><option>Fixed Deposit</option><option>Other</option></datalist><input class="inp" id="bf-atype" value="${b.accountType||''}" list="bfAtypeDL" placeholder="Current, Savings, Business..."></div><div class="fg"><label class="fl">Currency</label><select class="inp" id="bf-cur">${U.currencies()}</select></div></div>
    <div class="fr"><div class="fg"><label class="fl">Last 4 Digits</label><input class="inp" id="bf-l4" value="${b.last4||''}" maxlength="4" inputmode="numeric" placeholder="1234"></div><div class="fg"><label class="fl">Balance</label><input class="inp" id="bf-bal" value="${b.balance||''}" type="number" placeholder="0"></div></div>
    <div class="fr"><div class="fg"><label class="fl">IBAN</label><input class="inp" id="bf-iban" value="${b.iban||''}" placeholder="GB29..."></div><div class="fg"><label class="fl">Sort / SWIFT</label><input class="inp" id="bf-sort" value="${b.sortCode||''}" placeholder="12-34-56"></div></div>
    <div class="fr"><div class="fg"><label class="fl">Account Holder</label><input class="inp" id="bf-holder" value="${b.holderName||S.user.name||''}" placeholder="Full name"></div><div class="fg"><label class="fl">Ownership</label><select class="inp" id="bf-own"><option value="personal"${b.ownership!=='business'?' selected':''}>👤 Personal</option><option value="business"${b.ownership==='business'?' selected':''}>🏢 Business</option><option value="joint"${b.ownership==='joint'?' selected':''}>👥 Joint</option></select></div></div>
    <div class="fr"><div class="fg"><label class="fl">Registered Email</label><input class="inp" id="bf-email" value="${b.email||''}" type="email" placeholder="email@..."></div><div class="fg"><label class="fl">Registered Phone</label><input class="inp" id="bf-phone" value="${b.phone||''}" placeholder="+44..."></div></div>
    <div style="font-size:11px;font-weight:700;color:var(--text2);margin:12px 0 8px;letter-spacing:.5px">LOGIN DETAILS</div>
    ${U.loginFields(b)}
    <div class="fg"><label class="fl">Notes</label><textarea class="inp" id="bf-notes" rows="2">${b.notes||''}</textarea></div>
    <div class="fg"><label class="fl">Tags</label>${U.tags(b.tags||[])}</div>
    <label style="display:flex;align-items:center;gap:9px;cursor:pointer;margin-top:4px"><input type="checkbox" id="bf-fav" ${b.favorite?'checked':''}><span style="font-size:13px">⭐ Favourite</span></label>`;
  },
  bindCC(){setTimeout(()=>{const cc=document.getElementById('bf-cc');const cur=document.getElementById('bf-cur');if(cc)cc.onchange=()=>{document.getElementById('bkDL').innerHTML=U.bankOpts(cc.value);};if(cur)cur.value='GBP';},60);},
  save(editId=null){
    const name=document.getElementById('bf-name').value.trim();if(!name){Toast.show('Bank name required','warning');return;}
    const lf=U.getLF();
    const item={id:editId||U.id(),bankName:name,country:document.getElementById('bf-cc').value,bankType:document.getElementById('bf-type').value,accountType:document.getElementById('bf-atype').value,currency:document.getElementById('bf-cur').value,last4:document.getElementById('bf-l4').value.trim(),balance:parseFloat(document.getElementById('bf-bal').value)||0,iban:document.getElementById('bf-iban').value.trim(),sortCode:document.getElementById('bf-sort').value.trim(),holderName:document.getElementById('bf-holder').value.trim(),ownership:document.getElementById('bf-own').value,email:document.getElementById('bf-email').value.trim(),phone:document.getElementById('bf-phone').value.trim(),...lf,notes:document.getElementById('bf-notes').value.trim(),tags:U.getTags(),favorite:document.getElementById('bf-fav').checked,createdAt:editId?S.banks.find(x=>x.id===editId)?.createdAt:new Date().toISOString()};
    if(editId)S.banks=S.banks.map(x=>x.id===editId?item:x);else S.banks.push(item);
    Activity.log((editId?'Edited':'Added')+' bank',name);Store.save();Modal.close();this.render();Toast.show(`${editId?'Updated':'Added'}: ${name}`,'success');
    if(!editId)promptAddAnother('Bank','Banks.openAdd');
  },
  openBulkAdd(){
    const rows=Array.from({length:5},(_,i)=>`<div style="display:flex;gap:6px;margin-bottom:6px;align-items:center"><span style="font-size:11px;color:var(--text3);width:16px">${i+1}</span><input class="inp" id="bulk-b-name-${i}" placeholder="Bank name" style="flex:2"><input class="inp" id="bulk-b-type-${i}" placeholder="Type" style="flex:1"><select class="inp" id="bulk-b-cur-${i}" style="flex:1">${U.currencies()}</select></div>`).join('');
    Modal.open('🏦 Bulk Add Banks',`<p style="font-size:12px;color:var(--text2);margin-bottom:12px">Fill as many rows as you need. Empty rows are ignored.</p>${rows}`,`<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Banks.saveBulk()">Save All</button>`);
  },
  saveBulk(){
    let n=0;
    for(let i=0;i<5;i++){const name=(document.getElementById('bulk-b-name-'+i)?.value||'').trim();if(!name)continue;const item={id:U.id(),bankName:name,country:'GB',bankType:(document.getElementById('bulk-b-type-'+i)?.value||'commercial'),currency:(document.getElementById('bulk-b-cur-'+i)?.value||'GBP'),tags:[],createdAt:new Date().toISOString()};S.banks.push(item);n++;}
    if(n){Activity.log('Bulk added '+n+' banks');Store.save();Modal.close();this.render();Toast.show('Added '+n+' bank'+(n!==1?'s':''),'success');}else{Toast.show('No banks to add','warning');}
  },
  edit(id){const b=S.banks.find(x=>x.id===id);if(!b)return;Modal.open('✏️ Edit Bank',this.form(b),`<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-d btn-sm" onclick="Banks.del('${id}',true)">Delete</button><button class="btn btn-p" onclick="Banks.save('${id}')">Update</button>`);setTimeout(()=>{[['bf-cc',b.country||'GB'],['bf-type',b.bankType||'commercial'],['bf-atype',b.accountType||'Current'],['bf-cur',b.currency||'GBP'],['bf-own',b.ownership||'personal']].forEach(([i,v])=>{const el=document.getElementById(i);if(el)el.value=v;});U.setLF(b);},60);},
  detail(id){const b=S.banks.find(x=>x.id===id);if(!b)return;Modal.open(`🏦 ${b.bankName}`,`<div>${[['Bank',b.bankName],['Country',U.flag(b.country)+' '+U.cname(b.country)],['Type',b.bankType],['Account Type',b.accountType],['Currency',b.currency],['Last 4','****'+(b.last4||'—')],['IBAN',b.iban?'••••':'-',b.iban],['Sort/SWIFT',b.sortCode||'—'],['Holder',b.holderName||'—'],['Email',b.email?'••••':'-',b.email],['Phone',b.phone?'••••':'-',b.phone],['Username',b.username?'••••':'-',b.username],['App PIN',b.appPin?'••••':'-',b.appPin],['2FA',b.twoFA||'None'],['Pwd Hint',b.pwdHint||'—'],['Ownership',b.ownership||'Personal'],['Balance',b.balance?U.fmt(b.balance)+' '+b.currency:'—'],['Notes',b.notes||'—']].map(([k,v,s])=>U.drRow(k,v,s)).join('')}</div>`,`<button class="btn btn-g" onclick="Modal.close()">Close</button><button class="btn btn-p" onclick="Banks.edit('${id}');Modal.close()">Edit</button>`);},
  fav(id){const b=S.banks.find(x=>x.id===id);if(!b)return;b.favorite=!b.favorite;Store.save();this.render();},
  del(id,fm=false){if(!window.__vos_confirm('Delete this bank?'))return;const b=S.banks.find(x=>x.id===id);S.banks=S.banks.filter(x=>x.id!==id);Activity.log('Deleted bank',b?.bankName);Store.save();if(fm)Modal.close();this.render();Toast.show('Deleted','info');}
};
