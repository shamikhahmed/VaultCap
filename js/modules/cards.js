const Cards={
  render(){
    const q=(document.getElementById('cQ')?.value||'').toLowerCase();
    const sort=document.getElementById('cSort')?.value||'name';
    const f=S.cF;
    const chips=[['all','All'],['credit','Credit'],['debit','Debit'],['amex','Amex'],['visa','Visa'],['mc','MC'],['crypto','₿ Crypto'],['bnpl','BNPL'],['expiring','⚠️ Exp.'],['fav','⭐']];
    const ci=document.getElementById('cChips');
    if(ci)ci.innerHTML=chips.map(([v,l])=>`<div class="chip${v===f?' on':''}" onclick="S.cF='${v}';Cards.render()">${l}</div>`).join('');
    // Wallet
    const we=document.getElementById('cWallet');
    const wc=S.cards.filter(c=>S.wallet.includes(c.id));
    if(we)we.innerHTML=wc.length>0?`<div class="widget"><div class="wh"><span>👝</span>Carrying Today<button class="btn btn-g btn-sm wh-act" onclick="Dash.editWallet()">Edit</button></div><div class="wallet-row">${wc.map(c=>Dash.miniCard(c)).join('')}</div></div>`:'';
    let data=S.cards.filter(c=>{
      if(f==='fav'&&!c.favorite)return false;
      if(f==='credit'&&c.cardType!=='Credit')return false;
      if(f==='debit'&&c.cardType!=='Debit')return false;
      if(f==='amex'&&c.network!=='American Express')return false;
      if(f==='visa'&&c.network!=='Visa')return false;
      if(f==='mc'&&c.network!=='Mastercard')return false;
      if(f==='crypto'&&c.category!=='Crypto')return false;
      if(f==='bnpl'&&c.category!=='BNPL')return false;
      if(f==='expiring'){const s=U.expSt(c.expiry);if(s==='ok')return false;}
      return !q||JSON.stringify(c).toLowerCase().includes(q);
    });
    if(sort==='name')data.sort((a,b)=>a.cardName.localeCompare(b.cardName));
    else if(sort==='expiry')data.sort((a,b)=>(a.expiry||'99/99').localeCompare(b.expiry||'99/99'));
    else if(sort==='network')data.sort((a,b)=>(a.network||'').localeCompare(b.network||''));
    else if(sort==='recent')data.sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));
    const el=document.getElementById('cItems');if(!el)return;
    if(!data.length){el.innerHTML=`<div style="display:flex;flex-direction:column;align-items:center;text-align:center;padding:40px 20px"><div style="width:56px;height:56px;border-radius:16px;background:var(--glass2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:16px">💳</div><h3 style="font-size:17px;font-weight:700;margin-bottom:6px">No cards yet</h3><p style="font-size:13px;color:var(--text2);margin-bottom:20px;line-height:1.5">Add your debit, credit, or digital cards here</p><button class="btn btn-p" onclick="Cards.openAdd()" style="padding:14px 28px;font-size:15px;font-weight:700;border-radius:14px">+ Add Card</button></div>`;return;}
    const byNet={};data.forEach(c=>{(byNet[c.network||'Other']=byNet[c.network||'Other']||[]).push(c);});
    el.innerHTML=Object.entries(byNet).map(([net,items])=>`<div class="sdiv">${net} <span style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--text3)">(${items.length})</span></div>${items.map(c=>this.row(c)).join('')}`).join('');
  },
  row(c){
    const carrying=S.wallet.includes(c.id);
    return `<div class="entry"><div class="entry-main"><div class="entry-ic" style="background:${c.category==='Crypto'?'rgba(247,147,26,.12)':c.category==='BNPL'?'rgba(168,85,247,.12)':'var(--glass2)'}">💳</div><div class="entry-body"><div class="entry-name">${c.cardName}${carrying?' <span style="font-size:11px">👝</span>':''}</div><div class="entry-sub">${c.cardType||''} ${c.network?'· '+c.network:''} ${c.last4?'· ****'+c.last4:''} ${c.expiry?'· '+c.expiry:''}</div><div class="entry-meta">${U.expBadge(c.expiry)} ${c.category==='Crypto'?'<span class="badge b-warn">₿</span>':''} ${c.category==='BNPL'?'<span class="badge b-info">BNPL</span>':''} ${c.ownership==='business'?'<span class="badge b-warn">🏢</span>':''} ${c.rewardsPoints?`<span class="badge b-acc">⭐ ${U.fmt(c.rewardsPoints)}pts</span>`:''}</div></div><div class="entry-acts"><button class="icb${carrying?' on':''}" style="${carrying?'color:var(--accent)':''}" onclick="Cards.toggleCarry('${c.id}')" title="Carrying">👝</button><button class="icb fav${c.favorite?' on':''}" onclick="Cards.fav('${c.id}')">⭐</button><button class="icb" onclick="Cards.openDetail('${c.id}')">👁️</button><button class="icb" onclick="Cards.edit('${c.id}')">✏️</button><button class="icb del" onclick="Cards.del('${c.id}')">🗑️</button></div></div></div>`;
  },
  toggleCarry(id){if(S.wallet.includes(id))S.wallet=S.wallet.filter(x=>x!==id);else S.wallet.push(id);Store.save();this.render();Toast.show(S.wallet.includes(id)?'Added to wallet':'Removed from wallet','info',1500);},
  openAdd(){Modal.open('💳 Add Card',this.form(),`<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Cards.save()">Save</button>`);},
  form(c={}){
    const isEdit=!!c.id;
    const cardNames=SMART_DB.cards.map(x=>`<option value="${x.name}">`).join('');
    return `
    <datalist id="cardDL">${cardNames}</datalist>
    <datalist id="cfNetDL"><option>Visa</option><option>Mastercard</option><option>American Express</option><option>JCB</option><option>UnionPay</option></datalist>
    <!-- REQUIRED -->
    <div class="fg"><label class="fl">Card Name *</label><input class="inp" id="cf-name" list="cardDL" placeholder="e.g. Amex Gold, Sadapay…" autocomplete="off" oninput="SMART_DB.fillCard(this.value)" value="${c.cardName||''}"></div>
    <div class="fr"><div class="fg"><label class="fl">Network *</label><input class="inp" id="cf-net" value="${c.network||''}" list="cfNetDL" placeholder="Visa, Mastercard…"></div><div class="fg"><label class="fl">Last 4 Digits</label><input class="inp" id="cf-l4" value="${c.last4||''}" maxlength="4" inputmode="numeric" placeholder="1234"></div></div>
    <!-- MORE DETAILS -->
    <details${isEdit?' open':''} style="margin-top:10px">
      <summary style="cursor:pointer;font-size:12px;font-weight:700;color:var(--text2);padding:6px 0;list-style:none;display:flex;align-items:center;gap:6px">
        <span style="flex:1">More details</span><span style="font-size:10px;color:var(--text3)">▾</span>
      </summary>
      <div style="padding-top:10px">
        <div class="fr"><div class="fg"><label class="fl">Type</label><datalist id="cfTypeDL"><option>Credit</option><option>Debit</option><option>Prepaid</option><option>Corporate</option><option>Virtual</option></datalist><input class="inp" id="cf-type" value="${c.cardType||''}" list="cfTypeDL" placeholder="Credit, Debit…"></div><div class="fg"><label class="fl">Category</label><datalist id="cfCatDL"><option>Standard</option><option>Premium</option><option>Travel</option><option>Cashback</option><option>Rewards</option><option>Business</option><option>Crypto</option><option>BNPL</option><option>Islamic</option><option>Digital</option></datalist><input class="inp" id="cf-cat" value="${c.category||''}" list="cfCatDL" placeholder="Standard, Premium…"></div></div>
        <div class="fr"><div class="fg"><label class="fl">Country</label><select class="inp" id="cf-cc">${U.countries()}</select></div><div class="fg"><label class="fl">Expiry (MM/YY)</label><input class="inp" id="cf-exp" value="${c.expiry||''}" placeholder="12/28" maxlength="5"></div></div>
        <div class="fr"><div class="fg"><label class="fl">CVV</label><input class="inp" id="cf-cvv" value="${c.cvv||''}" maxlength="4" type="password" inputmode="numeric" placeholder="•••"></div><div class="fg"><label class="fl">Card PIN</label><input class="inp" id="cf-cpin" value="${c.cardPin||''}" maxlength="6" type="password" inputmode="numeric" placeholder="••••"></div></div>
        <div class="fg"><label class="fl">Cardholder Name</label><input class="inp" id="cf-holder" value="${c.holderName||S.user.name||''}" placeholder="Name on card"></div>
        <div class="fr"><div class="fg"><label class="fl">Rewards Program</label><input class="inp" id="cf-rprog" value="${c.rewardsProgram||''}" placeholder="Avios, MR…"></div><div class="fg"><label class="fl">Points Balance</label><input class="inp" id="cf-pts" value="${c.rewardsPoints||''}" type="number" placeholder="50000"></div></div>
        <div class="fr"><div class="fg"><label class="fl">Ownership</label><select class="inp" id="cf-own"><option value="personal"${c.ownership!=='business'?' selected':''}>👤 Personal</option><option value="business"${c.ownership==='business'?' selected':''}>🏢 Business</option></select></div><div class="fg"><label class="fl">Annual Fee</label><input class="inp" id="cf-fee" value="${c.annualFee||''}" type="number" placeholder="0"></div></div>
        <div class="fr"><div class="fg"><label class="fl">Online Username</label><input class="inp" id="cf-user" value="${c.username||''}" placeholder="Username"></div><div class="fg"><label class="fl">Password Hint</label><input class="inp" id="cf-pwd" value="${c.pwdHint||''}" placeholder="'Email+!'"></div></div>
        <div class="fg"><label class="fl">Notes / Benefits</label><textarea class="inp" id="cf-notes" rows="2">${c.notes||''}</textarea></div>
        <div class="fg"><label class="fl">Tags</label>${U.tags(c.tags||[])}</div>
        <div style="display:flex;gap:16px;margin-top:4px">
          <label style="display:flex;align-items:center;gap:7px;cursor:pointer;font-size:13px"><input type="checkbox" id="cf-fav" ${c.favorite?'checked':''}> ⭐ Favourite</label>
          <label style="display:flex;align-items:center;gap:7px;cursor:pointer;font-size:13px"><input type="checkbox" id="cf-carry" ${S.wallet.includes(c.id)?'checked':''}> 👝 Carrying</label>
        </div>
      </div>
    </details>`;
  },
  save(editId=null){
    const name=document.getElementById('cf-name').value.trim();if(!name){Toast.show('Card name required','warning');return;}
    const _l4v=document.getElementById('cf-l4').value.trim();
    if(!editId){const dup=checkDuplicate('card',{cardName:name,last4:_l4v});if(dup.isDuplicate&&!window.__vos_confirm(dup.message))return;}
    const id2=editId||U.id();
    const carry=document.getElementById('cf-carry').checked;
    if(carry&&!S.wallet.includes(id2))S.wallet.push(id2);else if(!carry)S.wallet=S.wallet.filter(x=>x!==id2);
    const item={id:id2,cardName:name,network:document.getElementById('cf-net').value,cardType:document.getElementById('cf-type').value,category:document.getElementById('cf-cat').value,country:document.getElementById('cf-cc').value,holderName:document.getElementById('cf-holder').value.trim(),last4:document.getElementById('cf-l4').value.trim(),expiry:document.getElementById('cf-exp').value.trim(),cvv:document.getElementById('cf-cvv').value.trim(),cardPin:document.getElementById('cf-cpin').value.trim(),rewardsProgram:document.getElementById('cf-rprog').value.trim(),rewardsPoints:parseInt(document.getElementById('cf-pts').value)||0,ownership:document.getElementById('cf-own').value,annualFee:parseFloat(document.getElementById('cf-fee').value)||0,username:document.getElementById('cf-user').value.trim(),pwdHint:document.getElementById('cf-pwd').value.trim(),notes:document.getElementById('cf-notes').value.trim(),tags:U.getTags(),favorite:document.getElementById('cf-fav').checked,issuer:name.split(' ')[0],createdAt:editId?S.cards.find(x=>x.id===editId)?.createdAt:new Date().toISOString()};
    const auto=autoTags('card',item);item.tags=[...new Set([...(item.tags||[]),...auto])];
    if(editId)S.cards=S.cards.map(x=>x.id===editId?item:x);else S.cards.push(item);
    Activity.log((editId?'Edited':'Added')+' card',name);Store.save();Modal.close();this.render();Toast.show(`${editId?'Updated':'Added'}: ${name}`,'success');
    if(!editId){
      // Auto-add bank if recognized and not already in S.banks
      const cLow=name.toLowerCase();
      const bMatch=SMART_DB.banks.find(b=>cLow.includes(b.name.toLowerCase()));
      if(bMatch){
        const bExists=(S.banks||[]).some(b=>b.bankName.toLowerCase()===bMatch.name.toLowerCase());
        if(!bExists){
          S.banks.push({id:U.id(),bankName:bMatch.name,country:bMatch.country,currency:bMatch.currency,bankType:bMatch.type,accountType:'Current',createdAt:new Date().toISOString()});
          Store.save();Toast.show(`${bMatch.name} added to Banks`,'info',3000);
        }
      }
      promptAddAnother('Card','Cards.openAdd');
    }
  },
  edit(id){const c=S.cards.find(x=>x.id===id);if(!c)return;Modal.open('✏️ Edit Card',this.form(c),`<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-d btn-sm" onclick="Cards.del('${id}',true)">Delete</button><button class="btn btn-p" onclick="Cards.save('${id}')">Update</button>`);setTimeout(()=>{[['cf-net',c.network||'Visa'],['cf-type',c.cardType||'Credit'],['cf-cat',c.category||'Standard'],['cf-cc',c.country||'GB'],['cf-own',c.ownership||'personal']].forEach(([i,v])=>{const el=document.getElementById(i);if(el)el.value=v;});},60);},
  openDetail(id){const c=S.cards.find(x=>x.id===id);if(!c)return;Modal.open(`💳 ${c.cardName}`,`<div>${[['Card',c.cardName],['Network',c.network||'—'],['Type',c.cardType||'—'],['Category',c.category||'—'],['Country',U.flag(c.country)+' '+U.cname(c.country)],['Last 4','****'+(c.last4||'—')],['Expiry',c.expiry||'—'],['CVV',c.cvv?'•••':'-',c.cvv],['Card PIN',c.cardPin?'••••':'-',c.cardPin],['Rewards',c.rewardsProgram||'—'],['Points',c.rewardsPoints?U.fmt(c.rewardsPoints):'—'],['Annual Fee',c.annualFee?c.annualFee+'':'-'],['Username',c.username?'••••':'-',c.username],['Pwd Hint',c.pwdHint||'—'],['Ownership',c.ownership||'Personal'],['Notes',c.notes||'—']].map(([k,v,s])=>U.drRow(k,v,s)).join('')}</div>`,`<button class="btn btn-g" onclick="Modal.close()">Close</button><button class="btn btn-p" onclick="Cards.edit('${id}');Modal.close()">Edit</button>`);},
  fav(id){const c=S.cards.find(x=>x.id===id);if(!c)return;c.favorite=!c.favorite;Store.save();this.render();},
  del(id,fm=false){
    if(!window.__vos_confirm('Move to Trash?'))return;
    const c=S.cards.find(x=>x.id===id);if(!c)return;
    S.trash.push({id:U.id(),type:'cards',data:c,deletedAt:new Date().toISOString()});
    S.cards=S.cards.filter(x=>x.id!==id);S.wallet=S.wallet.filter(x=>x!==id);
    Activity.log('Trashed card',c.cardName);Store.save();if(fm)Modal.close();this.render();
    Toast.show(`Moved to Trash — <button class="cpbtn" onclick="Trash.restore('${S.trash[S.trash.length-1].id}');this.closest('.toast').remove()">Undo</button>`,'info',6000);
  }
};
