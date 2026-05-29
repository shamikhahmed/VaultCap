const GlobalSearch={
  activeFilter:'all',
  render(){
    const b=document.getElementById('searchBody');if(!b)return;
    b.innerHTML=`
    <div style="padding:14px 14px 0;position:sticky;top:0;z-index:10;background:var(--bg2);padding-bottom:10px">
      <div style="position:relative;margin-bottom:10px">
        <span style="position:absolute;left:13px;top:50%;transform:translateY(-50%);font-size:16px;pointer-events:none">🔍</span>
        <input id="gs-input" class="inp" placeholder="Search everything — cards, banks, devices, docs..." style="padding-left:40px;font-size:15px;border-radius:14px" oninput="GlobalSearch.search(this.value)" autocomplete="off">
        <button onclick="document.getElementById('gs-input').value='';GlobalSearch.search('')" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:16px;color:var(--text3)">✕</button>
      </div>
      <div style="display:flex;overflow-x:auto;gap:6px;scrollbar-width:none;padding-bottom:2px">
        ${['all','bank','card','investment','sim','asset','expense','email','gadget','digital'].map(f=>`<div class="search-chip${GlobalSearch.activeFilter===f?' on':''}" onclick="GlobalSearch.setFilter('${f}')">${{all:'All',bank:'🏦 Banks',card:'💳 Cards',investment:'📈 Invest',sim:'📱 SIMs',asset:'🏠 Assets',expense:'🔄 Subs',email:'📧 Emails',gadget:'💻 Devices',digital:'💼 Logins'}[f]}</div>`).join('')}
      </div>
    </div>
    <div id="gs-results" style="padding:8px 0"></div>`;
    setTimeout(()=>this.search(''),0);
  },
  setFilter(f){this.activeFilter=f;this.render();setTimeout(()=>document.getElementById('gs-input')?.focus(),60);},
  highlight(text,q){
    if(!q||!text)return text||'';
    const idx=text.toLowerCase().indexOf(q.toLowerCase());
    if(idx<0)return text;
    return text.slice(0,idx)+'<mark class="hl">'+text.slice(idx,idx+q.length)+'</mark>'+text.slice(idx+q.length);
  },
  search(q){
    const el=document.getElementById('gs-results');if(!el)return;
    const ql=q.toLowerCase();
    const f=this.activeFilter;
    const matches=[];
    const match=(text)=>!q||text.toLowerCase().includes(ql);
    const addM=(type,icon,name,sub,id,action)=>{
      if(f!=='all'&&f!==type)return;
      if(!match(name)&&!match(sub||''))return;
      matches.push({type,icon,name:this.highlight(name,q),sub:this.highlight(sub||'',q),id,action});
    };
    S.banks.forEach(b=>addM('bank','🏦',b.bankName||'',b.currency+' '+b.country+(b.last4?' ****'+b.last4:''),b.id,()=>Banks.detail(b.id)));
    S.cards.forEach(cv=>addM('card','💳',cv.cardName||'',cv.network+' '+(cv.last4?'****'+cv.last4:'')+(cv.expiry?' exp '+cv.expiry:''),cv.id,()=>Cards.openDetail(cv.id)));
    S.investments.forEach(i=>addM('investment','📈',i.investmentName||i.broker||'',i.broker+(i.ticker?' · '+i.ticker:'')+(i.currentValue?' · '+i.currency+' '+i.currentValue:''),i.id,()=>Inv.edit(i.id)));
    S.sims.forEach(s=>addM('sim','📱',s.network||'',s.phone||''+(s.country?' · '+s.country:''),s.id,()=>Sims.detail(s.id)));
    S.assets.forEach(a=>addM('asset',{property:'🏠',vehicle:'🚗',watch:'⌚',document:'🪪',precious:'🥇',subscription:'🔄',insurance:'🛡️',loan:'💰',other:'📦'}[a.assetType]||'📦',a.name||'',a.assetType+(a.location?' · '+a.location:'')+(a.currentValue?' · '+a.currency+' '+a.currentValue:''),a.id,()=>Assets.edit(a.id)));
    S.expenses.forEach(e=>addM('expense',e.icon||'🔄',e.name||'',e.category+(e.amount?' · '+e.currency+' '+e.amount+'/mo':'')+(e.from?' · '+e.from:''),e.id,()=>Exp.edit(e.id)));
    S.emails.forEach(e=>addM('email','📧',e.email||'',e.provider+' · '+e.purpose+(e.mfaEnabled?' · 2FA✓':''),e.id,()=>Emails.detail(e.id)));
    S.gadgets.forEach(g=>addM('gadget',g.ic||'💻',g.name||'',g.brand+(g.storage?' · '+g.storage:'')+(g.serialNum?' · S/N '+g.serialNum:''),g.id,()=>Gadgets.detail(g.id)));
    S.digital.forEach(d=>addM('digital','💼',d.serviceName||'',(d.username?'@'+d.username:'')+' '+d.category,d.id,()=>Digital.detail(d.id)));
    const label={bank:'Bank',card:'Card',investment:'Investment',sim:'SIM',asset:'Asset',expense:'Subscription',email:'Email',gadget:'Device',digital:'Login'};
    if(!matches.length){
      el.innerHTML=`<div class="empty"><div class="empty-ic">🔍</div><h3>${q?'Nothing found for "'+q+'"':'Your vault is empty'}</h3><p>${q?'Try different keywords or change the filter':'Add entries from the + button or any module tab'}</p></div>`;
      return;
    }
    el.innerHTML=`<div style="font-size:12px;color:var(--text3);padding:4px 14px 8px">${matches.length} result${matches.length!==1?'s':''}</div>`+
    matches.map(m=>`<div class="search-result-row" onclick="Modal.close();(${m.action.toString()})()">
      <div class="sr-ic">${m.icon}</div>
      <div class="sr-body">
        <div class="sr-name">${m.name}</div>
        <div class="sr-meta">${m.sub}</div>
      </div>
      <div class="sr-type">${label[m.type]||m.type}</div>
    </div>`).join('');
  }
};
