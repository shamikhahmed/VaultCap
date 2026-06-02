const Timeline={
  render(){
    const b=document.getElementById('timelineBody');if(!b)return;
    const clearBar='<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px 0;margin-bottom:4px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text3)">'+(S.activity||[]).length+' entries</div><button onclick="if(confirm(\'Clear all activity log?\')) { S.activity=[]; if(typeof Store!==\'undefined\') Store.save(); Timeline.render(); Toast.show(\'Activity log cleared\',\'success\'); }" style="font-size:12px;color:var(--err);background:none;border:none;cursor:pointer;touch-action:manipulation;font-weight:600">🗑️ Clear Log</button></div>';
    const events=[];
    const now=new Date();
    const addEv=(date,label,type,icon,action)=>{
      if(!date)return;
      const d=new Date(date);if(isNaN(d))return;
      const diff=Math.ceil((d-now)/(1000*60*60*24));
      events.push({date:d,label,type,icon,diff,action,overdue:diff<0});
    };
    S.cards.forEach(c=>{
      if(c.expiry){const[m,y]=c.expiry.split('/');addEv(new Date(2000+parseInt(y),parseInt(m)-1,1),c.cardName+' expires','card','💳',()=>Cards.edit(c.id));}
    });
    S.sims.filter(s=>s.nextRecharge&&s.rechargeReminder).forEach(s=>{addEv(s.nextRecharge,s.network+' recharge','sim','📱',()=>Sims.edit(s.id));});
    S.assets.filter(a=>a.renewalDate).forEach(a=>{addEv(a.renewalDate,a.name+' renewal','asset','🛡️',()=>Assets.edit(a.id));});
    S.assets.filter(a=>a.assetType==='property'&&a.mortgEnd).forEach(a=>{addEv(a.mortgEnd,a.name+' mortgage ends','mortgage','🏦',()=>Assets.edit(a.id));});
    S.assets.filter(a=>a.assetType==='property'&&a.handoverDate).forEach(a=>{addEv(a.handoverDate,a.name+' handover','property','🏗️',()=>Assets.edit(a.id));});
    S.assets.filter(a=>a.assetType==='document'&&a.expiryDate).forEach(a=>{addEv(a.expiryDate,(a.docType||a.name)+' expires','doc','🪪',()=>Assets.edit(a.id));});
    S.gadgets.filter(g=>g.warranty).forEach(g=>{addEv(g.warranty,g.name+' warranty ends','warranty','💻',()=>Gadgets.edit(g.id));});
    S.expenses.filter(e=>e.renewalDate&&e.active).forEach(e=>{addEv(e.renewalDate,e.name+' renewal','expense',e.icon||'🔄',()=>Exp.edit(e.id));});
    S.assets.filter(a=>a.assetType==='loan'&&a.dueDate).forEach(a=>{addEv(a.dueDate,a.name+' due','loan','💰',()=>Assets.edit(a.id));});
    events.sort((a,b_)=>a.date-b_.date);
    if(!events.length){b.innerHTML=clearBar+'<div class="empty"><div class="empty-ic">📅</div><h3>No upcoming dates</h3><p>Add expiry dates to cards, documents, subscriptions, gadgets and assets to see them here</p></div>';return;}
    const overdue=events.filter(e=>e.overdue);
    const soon=events.filter(e=>!e.overdue&&e.diff<=30);
    const later=events.filter(e=>!e.overdue&&e.diff>30);
    const renderGroup=(title,evs,cls)=>evs.length?`<div class="sdiv">${title}</div>${evs.map(e=>`<div class="insight${cls}" style="cursor:pointer" onclick="Modal.close();${e.action.toString().replace(/\n/g,' ')}"><div class="insight-ic">${e.icon}</div><div class="insight-body"><div class="insight-title">${e.label}</div><div class="insight-sub">${e.overdue?'Overdue by '+Math.abs(e.diff)+' day'+(Math.abs(e.diff)!==1?'s':''):e.diff===0?'Today':e.diff===1?'Tomorrow':'In '+e.diff+' days — '+e.date.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</div></div><div style="font-size:11px;font-weight:700;color:${e.overdue?'var(--err)':e.diff<=7?'var(--warn)':'var(--text3)'}">${e.date.toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</div></div>`).join('')}`:'';
    b.innerHTML=clearBar+renderGroup('⚠️ Overdue',overdue,' err')+renderGroup('🔥 Next 30 Days',soon,' warn')+renderGroup('📅 Upcoming',later,' info');
  },
  calendarMode(){
    const b=document.getElementById('timelineBody');if(!b)return;
    const now=new Date();
    const year=now.getFullYear(),month=now.getMonth();
    const events={};
    const addEv=(date,label,icon)=>{
      if(!date)return;const d=new Date(date);if(isNaN(d))return;
      const key=d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate();
      if(!events[key])events[key]=[];events[key].push({label,icon});
    };
    S.cards.forEach(cv=>{if(cv.expiry){const[m,y]=cv.expiry.split('/');addEv(new Date(2000+parseInt(y),parseInt(m)-1,1),cv.cardName,'💳');}});
    S.sims.filter(s=>s.nextRecharge).forEach(s=>addEv(s.nextRecharge,s.network,'📱'));
    S.assets.filter(a=>a.renewalDate).forEach(a=>addEv(a.renewalDate,a.name,'🛡️'));
    S.gadgets.filter(g=>g.warranty).forEach(g=>addEv(g.warranty,g.name,'💻'));
    S.expenses.filter(e=>e.renewalDate).forEach(e=>addEv(e.renewalDate,e.name,e.icon||'🔄'));
    S.assets.filter(a=>a.expiryDate).forEach(a=>addEv(a.expiryDate,a.name||a.docType,'🪪'));
    S.assets.filter(a=>a.handoverDate).forEach(a=>addEv(a.handoverDate,a.name,'🏗️'));
    const firstDay=new Date(year,month,1).getDay();
    const daysInMonth=new Date(year,month+1,0).getDate();
    const monthName=now.toLocaleString('en-GB',{month:'long',year:'numeric'});
    let html=`<div style="padding:14px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <button class="btn btn-g btn-sm" onclick="Timeline.render()">← List View</button>
      <div style="font-size:16px;font-weight:700">${monthName}</div>
      <div style="width:80px"></div>
    </div>
    <div class="cal-grid" style="margin-bottom:8px">
      ${['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=>`<div class="cal-hd">${d}</div>`).join('')}
    </div>
    <div class="cal-grid">
      ${Array.from({length:firstDay},(_,i)=>`<div class="cal-day" style="opacity:0"></div>`).join('')}
      ${Array.from({length:daysInMonth},(_,i)=>{
        const day=i+1;
        const key=year+'-'+month+'-'+day;
        const isToday=year===now.getFullYear()&&month===now.getMonth()&&day===now.getDate();
        const evs=events[key]||[];
        return `<div class="cal-day${isToday?' today':''}${evs.length?' has-event':''}">
          <div style="font-size:12px;font-weight:${isToday?700:400};text-align:center;margin-bottom:2px;color:${isToday?'var(--accent)':'var(--text)'}">${day}</div>
          ${evs.slice(0,3).map(e=>`<div style="display:flex;align-items:center;gap:2px;margin-bottom:1px"><span style="font-size:8px">${e.icon}</span><span style="font-size:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text2)">${e.label.slice(0,8)}</span></div>`).join('')}
          ${evs.length>3?`<div style="font-size:8px;color:var(--accent)">+${evs.length-3}</div>`:''}
        </div>`;
      }).join('')}
    </div>
    ${Object.entries(events).length?`
    <div style="margin-top:18px"><div style="font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:var(--text3);margin-bottom:10px">This month</div>
    ${Object.entries(events).filter(([k])=>{const p=k.split('-');return parseInt(p[1])===month;}).sort(([a],[b])=>parseInt(a.split('-')[2])-parseInt(b.split('-')[2])).map(([key,evs])=>{const d=parseInt(key.split('-')[2]);return `<div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)"><div style="min-width:28px;text-align:center;font-size:13px;font-weight:700;color:var(--accent)">${d}</div><div>${evs.map(e=>`<div style="font-size:12px;margin-bottom:2px">${e.icon} ${e.label}</div>`).join('')}</div></div>`;}).join('')}
    </div>`:''}
  </div>`;
    b.innerHTML=html;
  }
};
