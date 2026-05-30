const Inv={
  render(){
    const f=S.invF;const q=(document.getElementById('invQ')?.value||'').toLowerCase();const sort=document.getElementById('invSort')?.value||'name';
    const chips=[['all','All'],['Stocks','📊 Stocks'],['Mutual Funds','📁 Funds'],['Bonds','📜 Bonds'],['Crypto','₿ Crypto'],['Fixed Deposit','🏛️ FD'],['fav','⭐']];
    const ci=document.getElementById('invChips');if(ci)ci.innerHTML=chips.map(([v,l])=>`<div class="chip${v===f?' on':''}" onclick="S.invF='${v}';Inv.render()">${l}</div>`).join('');
    let data=S.investments.filter(i=>{if(f==='fav'&&!i.favorite)return false;if(!['all','fav'].includes(f)&&i.type!==f)return false;return !q||JSON.stringify(i).toLowerCase().includes(q);});
    if(sort==='name')data.sort((a,b)=>(a.investmentName||a.broker||'').localeCompare(b.investmentName||b.broker||''));
    else if(sort==='value')data.sort((a,b)=>(b.currentValue||0)-(a.currentValue||0));
    else if(sort==='pnl')data.sort((a,b)=>((b.currentValue||0)-(b.amountInvested||0))-((a.currentValue||0)-(a.amountInvested||0)));
    const sm=document.getElementById('invSummary');
    if(sm){const ti=S.investments.reduce((a,i)=>a+(i.amountInvested||0),0);const tc=S.investments.reduce((a,i)=>a+(i.currentValue||0),0);sm.innerHTML=S.investments.length?`<div class="widget" style="margin-bottom:12px"><div class="fr" style="gap:0"><div style="flex:1;text-align:center"><div style="font-size:10px;color:var(--text3)">Invested</div><div style="font-size:18px;font-weight:700">${U.fmt(ti)}</div></div><div style="flex:1;text-align:center"><div style="font-size:10px;color:var(--text3)">Current</div><div style="font-size:18px;font-weight:700">${U.fmt(tc)}</div></div><div style="flex:1;text-align:center"><div style="font-size:10px;color:var(--text3)">P&L</div><div style="font-size:16px">${ti>0?U.pnl(ti,tc):'—'}</div></div></div></div>`:'';};
    const el=document.getElementById('invItems');if(!el)return;
    if(!data.length){el.innerHTML=`<div class="empty-ios"><div class="ei-ic">📈</div><div class="ei-title">No Investments</div><div class="ei-sub">Track stocks, mutual funds, crypto, bonds and more</div><button class="btn btn-p" onclick="Inv.openAdd()">📈 Add Investment</button></div>`;return;}
    el.innerHTML=data.map(i=>{const r={Low:'b-ok',Medium:'b-warn',High:'b-err'};const ic={Stocks:'📊','Mutual Funds':'📁',ETFs:'📈',Bonds:'📜',Sukuk:'🕌',Crypto:'₿','Fixed Deposit':'🏛️',Pension:'👴',Other:'💼'};return `<div class="entry" data-id="${i.id}"><div class="entry-main"><div class="entry-ic">${ic[i.type]||'📈'}</div><div class="entry-body"><div class="entry-name">${i.investmentName||i.broker||'Investment'}</div><div class="entry-sub">${i.broker||''} · ${i.type||''} · ${i.currency||''}</div><div class="entry-meta">${i.riskLevel?`<span class="badge ${r[i.riskLevel]||'b-muted'}">${i.riskLevel}</span>`:''} ${i.amountInvested&&i.currentValue?`<span style="font-size:11px">${U.pnl(i.amountInvested,i.currentValue)}</span>`:i.currentValue?`<span class="badge b-acc">${U.fmt(i.currentValue)}</span>`:''} ${i.ownership==='business'?'<span class="badge b-warn">🏢</span>':''}</div></div><div class="entry-acts"><button class="icb fav${i.favorite?' on':''}" onclick="Inv.fav('${i.id}')">⭐</button><button class="icb" onclick="Inv.edit('${i.id}')">✏️</button><button class="icb del" onclick="Inv.del('${i.id}')">🗑️</button></div></div></div>`;}).join('');
    initSwipeDelete(el);
  },
  openAdd(){Modal.open('📈 Add Investment',this.form(),`<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Inv.save()">Save</button>`);setTimeout(()=>{const c=S.user.currency||'PKR';['if-inv','if-cur2'].forEach(id=>{const el=document.getElementById(id);if(el)U.numInput(el,c);});},60);},
  form(i={}){
    const isEdit=!!i.id;
    const invNames=SMART_DB.investments.map(x=>`<option value="${x.name}">`).join('');
    return `
    <datalist id="invDL">${invNames}</datalist>
    <datalist id="brDL">${U.brokerOpts()}</datalist>
    <datalist id="ifTypeDL"><option>Stocks</option><option>Mutual Funds</option><option>ETFs</option><option>Bonds</option><option>Sukuk</option><option>Crypto</option><option>Fixed Deposit</option><option>Pension</option><option>REITs</option><option>Other</option></datalist>
    <!-- REQUIRED -->
    <div class="fg"><label class="fl">Investment Name *</label><input class="inp" id="if-name" list="invDL" placeholder="e.g. ENGRO, Bitcoin, Meezan Fund…" autocomplete="off" oninput="SMART_DB.fillInv(this.value)" value="${i.investmentName||''}"></div>
    <div class="fr"><div class="fg"><label class="fl">Type *</label><input class="inp" id="if-type" value="${i.type||''}" list="ifTypeDL" placeholder="Stocks, Crypto, Fund…"></div><div class="fg"><label class="fl">Amount Invested *</label><input class="inp num-inp" id="if-inv" type="text" inputmode="decimal" pattern="[0-9,\\.]*" value="${i.amountInvested||''}" placeholder="0"></div></div>
    <!-- MORE DETAILS -->
    <details${isEdit?' open':''} style="margin-top:10px">
      <summary style="cursor:pointer;font-size:12px;font-weight:700;color:var(--text2);padding:6px 0;list-style:none;display:flex;align-items:center;gap:6px">
        <span style="flex:1">More details</span><span style="font-size:10px;color:var(--text3)">▾</span>
      </summary>
      <div style="padding-top:10px">
        <div class="fr"><div class="fg"><label class="fl">Current Value</label><input class="inp num-inp" id="if-cur2" type="text" inputmode="decimal" pattern="[0-9,\\.]*" value="${i.currentValue||''}" placeholder="0"></div><div class="fg"><label class="fl">Currency</label><select class="inp" id="if-cur">${U.currencies()}</select></div></div>
        <div class="fr"><div class="fg"><label class="fl">Ticker / Symbol</label><input class="inp" id="if-tick" value="${i.ticker||''}" placeholder="ENGRO, BTC" oninput="Inv.lookupTicker(this.value)"><div id="if-tick-hint" style="font-size:11px;color:var(--text3);margin-top:3px;min-height:14px"></div></div><div class="fg"><label class="fl">Purchase Date</label><input class="inp" id="if-date" value="${i.purchaseDate||''}" type="date"></div></div>
        <div class="fr"><div class="fg"><label class="fl">Broker / Platform</label><input class="inp" id="if-broker" value="${i.broker||''}" list="brDL" placeholder="AKD, Binance…"></div><div class="fg"><label class="fl">Risk Level</label><datalist id="ifRiskDL"><option>Low</option><option>Medium</option><option>High</option><option>Very High</option></datalist><input class="inp" id="if-risk" value="${i.riskLevel||''}" list="ifRiskDL" placeholder="Low, Medium, High"></div></div>
        <div class="fr"><div class="fg"><label class="fl">Country</label><select class="inp" id="if-cc">${U.countries()}</select></div><div class="fg"><label class="fl">Ownership</label><select class="inp" id="if-own"><option value="personal"${i.ownership!=='business'?' selected':''}>👤 Personal</option><option value="business"${i.ownership==='business'?' selected':''}>🏢 Business</option></select></div></div>
        ${U.loginFields(i)}
        <div class="fg"><label class="fl">Notes</label><textarea class="inp" id="if-notes" rows="2">${i.notes||''}</textarea></div>
        <div class="fg"><label class="fl">Tags</label>${U.tags(i.tags||[])}</div>
        <label style="display:flex;align-items:center;gap:7px;cursor:pointer;font-size:13px;margin-top:4px"><input type="checkbox" id="if-fav" ${i.favorite?'checked':''}> ⭐ Favourite</label>
      </div>
    </details>`;
  },
  save(editId=null){const name=document.getElementById('if-name').value.trim(),broker=document.getElementById('if-broker').value.trim();if(!name&&!broker){Toast.show('Name or broker required','warning');return;}if(!editId){const dup=checkDuplicate('investment',{investmentName:name});if(dup.isDuplicate&&!window.__vos_confirm(dup.message))return;}const lf=U.getLF();const item={id:editId||U.id(),investmentName:name,broker,type:document.getElementById('if-type').value,riskLevel:document.getElementById('if-risk').value,currency:document.getElementById('if-cur').value,amountInvested:parseFloat((document.getElementById('if-inv').value||'').replace(/,/g,''))||0,currentValue:parseFloat((document.getElementById('if-cur2').value||'').replace(/,/g,''))||0,ticker:document.getElementById('if-tick').value.trim(),purchaseDate:document.getElementById('if-date').value,country:document.getElementById('if-cc').value,ownership:document.getElementById('if-own').value,...lf,notes:document.getElementById('if-notes').value.trim(),tags:U.getTags(),favorite:document.getElementById('if-fav').checked,createdAt:editId?S.investments.find(x=>x.id===editId)?.createdAt:new Date().toISOString()};const auto=autoTags('investment',item);item.tags=[...new Set([...(item.tags||[]),...auto])];if(editId)S.investments=S.investments.map(x=>x.id===editId?item:x);else S.investments.push(item);Activity.log((editId?'Edited':'Added')+' investment',name||broker);Store.save();Modal.close();this.render();Toast.show(`${editId?'Updated':'Added'}: ${name||broker}`,'success');if(!editId)promptAddAnother('Investment','Inv.openAdd');},
  edit(id){const i=S.investments.find(x=>x.id===id);if(!i)return;Modal.open('✏️ Edit Investment',this.form(i),`<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-d btn-sm" onclick="Inv.del('${id}',true)">Delete</button><button class="btn btn-p" onclick="Inv.save('${id}')">Update</button>`);setTimeout(()=>{[['if-type',i.type||'Stocks'],['if-risk',i.riskLevel||'Medium'],['if-cur',i.currency||'GBP'],['if-cc',i.country||'GB'],['if-own',i.ownership||'personal']].forEach(([el,v])=>{const e=document.getElementById(el);if(e)e.value=v;});U.setLF(i);const c=i.currency||'GBP';['if-inv','if-cur2'].forEach(id=>{const el=document.getElementById(id);if(el)U.numInput(el,c);});},60);},
  lookupTicker(ticker){
    const hint=document.getElementById('if-tick-hint');
    if(!ticker){if(hint)hint.textContent='';return;}
    const match=SMART_DB.investments.find(i=>i.ticker&&i.ticker.toUpperCase()===ticker.toUpperCase().trim());
    if(match){
      const nameEl=document.getElementById('if-name');if(nameEl&&!nameEl.value)nameEl.value=match.name;
      if(hint)hint.textContent=match.exchange?`📊 ${match.exchange} · ${match.currency}`:'';
    }else{if(hint)hint.textContent='';}
  },
  fav(id){const i=S.investments.find(x=>x.id===id);if(!i)return;i.favorite=!i.favorite;Store.save();this.render();},
  del(id,fm=false){if(!window.__vos_confirm('Move to Trash?'))return;const i=S.investments.find(x=>x.id===id);if(!i)return;S.trash.push({id:U.id(),type:'investments',data:i,deletedAt:new Date().toISOString()});S.investments=S.investments.filter(x=>x.id!==id);Activity.log('Trashed investment',i.investmentName);Store.save();if(fm)Modal.close();this.render();Toast.show(`Moved to Trash — <button class="cpbtn" onclick="Trash.restore('${S.trash[S.trash.length-1].id}');this.closest('.toast').remove()">Undo</button>`,'info',6000);}
};
