const FX={PKR:1,GBP:350,AED:75,USD:280,EUR:320,SAR:74,CAD:210,AUD:185,SGD:210,INR:3.3,QAR:77,USDT:280,BTC:0,ETH:0};
const Dash={
  render(){
    const h=new Date().getHours();
    const greet=h<5?'Good Night':h<12?'Good Morning':h<17?'Good Afternoon':'Good Evening';
    const el=document.getElementById('dashGreet');
    if(el)el.innerHTML=`<span>${greet}, <strong>${S.user.name||'User'}</strong></span>`;
    const dl=document.getElementById('dashDate');
    if(dl)dl.textContent=new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    const b=document.getElementById('dashBody');
    if(!b)return;
    const cur=S.user.currency||'PKR';
    const btn=document.getElementById('currBtn');if(btn)btn.textContent=cur;
    if(S.banks.length===0&&S.cards.length===0&&S.investments.length===0){
      b.innerHTML=`<div style="display:flex;flex-direction:column;align-items:center;text-align:center;padding:20px 0 40px">
        <div style="font-size:40px;margin-bottom:14px;animation:float 4s ease-in-out infinite">🎉</div>
        <div style="font-size:20px;font-weight:800;letter-spacing:-.5px;margin-bottom:6px">${greet}, ${S.user.name||'User'}!</div>
        <div style="font-size:13px;color:var(--text2);margin-bottom:24px;max-width:300px;line-height:1.6">Your private vault is ready. Track your financial life — all encrypted, offline, zero-knowledge.</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;margin-bottom:20px">
          <div onclick="Banks.openAdd()" style="background:var(--glass);border:1px solid var(--border);border-radius:16px;padding:16px 14px;cursor:pointer;text-align:left;transition:background .15s" onmouseover="this.style.background='var(--glass2)'" onmouseout="this.style.background='var(--glass)'">
            <div style="font-size:26px;margin-bottom:8px">🏦</div>
            <div style="font-size:13px;font-weight:700;margin-bottom:3px">Add a Bank</div>
            <div style="font-size:11px;color:var(--text3);line-height:1.4">Accounts, IBANs &amp; logins</div>
            <div style="margin-top:8px;font-size:12px;color:var(--accent);font-weight:700">+ Add →</div>
          </div>
          <div onclick="Cards.openAdd()" style="background:var(--glass);border:1px solid var(--border);border-radius:16px;padding:16px 14px;cursor:pointer;text-align:left;transition:background .15s" onmouseover="this.style.background='var(--glass2)'" onmouseout="this.style.background='var(--glass)'">
            <div style="font-size:26px;margin-bottom:8px">💳</div>
            <div style="font-size:13px;font-weight:700;margin-bottom:3px">Add a Card</div>
            <div style="font-size:11px;color:var(--text3);line-height:1.4">Debit, credit &amp; digital cards</div>
            <div style="margin-top:8px;font-size:12px;color:var(--accent);font-weight:700">+ Add →</div>
          </div>
          <div onclick="Inv.openAdd()" style="background:var(--glass);border:1px solid var(--border);border-radius:16px;padding:16px 14px;cursor:pointer;text-align:left;transition:background .15s" onmouseover="this.style.background='var(--glass2)'" onmouseout="this.style.background='var(--glass)'">
            <div style="font-size:26px;margin-bottom:8px">📈</div>
            <div style="font-size:13px;font-weight:700;margin-bottom:3px">Add Investment</div>
            <div style="font-size:11px;color:var(--text3);line-height:1.4">Stocks, funds &amp; crypto</div>
            <div style="margin-top:8px;font-size:12px;color:var(--accent);font-weight:700">+ Add →</div>
          </div>
          <div onclick="Cash.openAdd()" style="background:var(--glass);border:1px solid var(--border);border-radius:16px;padding:16px 14px;cursor:pointer;text-align:left;transition:background .15s" onmouseover="this.style.background='var(--glass2)'" onmouseout="this.style.background='var(--glass)'">
            <div style="font-size:26px;margin-bottom:8px">💵</div>
            <div style="font-size:13px;font-weight:700;margin-bottom:3px">Track Cash</div>
            <div style="font-size:11px;color:var(--text3);line-height:1.4">Physical cash by location</div>
            <div style="margin-top:8px;font-size:12px;color:var(--accent);font-weight:700">+ Add →</div>
          </div>
        </div>
        <button class="btn btn-g" onclick="Settings.loadDemo()" style="width:100%;font-size:13px">🎮 Load Demo Data — see what a full vault looks like</button>
      </div>`;
      return;
    }
    const toB=(a,c)=>(a||0)*(FX[c]||1);
    const toCur=(pkr,c)=>pkr/(FX[c]||1);
    const invPKR=S.investments.reduce((a,i)=>a+toB(i.currentValue||0,i.currency||cur),0);
    const asPKR=S.assets.reduce((a,x)=>a+toB(x.currentValue||0,x.currency||cur),0);
    const cashPKR=S.cash.reduce((a,c)=>a+toB(c.amount||0,c.currency||cur),0);
    const debtPKR=S.loans.filter(l=>l.type==='borrowed'&&l.status!=='Settled').reduce((a,l)=>a+toB(l.amount||0,l.currency||cur),0);
    const nwPKR=invPKR+asPKR+cashPKR-debtPKR;
    const nwDisplay=Math.round(toCur(nwPKR,cur));
    const exp=S.cards.filter(c=>{const s=U.expSt(c.expiry);return s!=='ok';});
    const wCards=S.cards.filter(c=>S.wallet.includes(c.id));
    const monthlyExp=S.expenses.filter(e=>e.active).reduce((a,e)=>a+(parseFloat(e.amount)||0),0);
    const simRem=S.sims.filter(s=>s.rechargeReminder&&s.status==='Active');
    const secScore=this.security();
    // trend
    const hist=S.user.nwHistory||[];
    const prevV=hist.length>=2?hist[hist.length-1].v:null;
    const trendDir=prevV!==null?(nwDisplay>prevV?1:nwDisplay<prevV?-1:0):0;
    const trendArrow=trendDir>0?`<span class="dash-nw-trend up">↑</span>`:trendDir<0?`<span class="dash-nw-trend down">↓</span>`:'';
    const fmtN=n=>cur==='PKR'?U.fmtPKR(n):U.fmt(n);
    // nw subtitle
    const nwSub=debtPKR>0?`${cur} ${fmtN(Math.round(toCur(invPKR+asPKR+cashPKR,cur)))} assets − ${fmtN(Math.round(toCur(debtPKR,cur)))} debt`:`Investments · Assets · Cash`;
    // allocation donut
    const allocData=[
      {l:'Investments',v:Math.round(toCur(invPKR,cur)),col:'var(--accent)'},
      {l:'Assets',v:Math.round(toCur(asPKR,cur)),col:'var(--ok)'},
      {l:'Cash',v:Math.round(toCur(cashPKR,cur)),col:'var(--warn)'},
    ].filter(d=>d.v>0);
    const totAlloc=allocData.reduce((a,d)=>a+d.v,0)||1;
    const donutSVG=this.donut(allocData,totAlloc);
    // active modules grid
    const activeMods=ALL_MODULES.filter(m=>S.modules[m.id]&&S[m.id]);
    const modGrid=activeMods.map(m=>`<div class="dash-mod-item" onclick="R.goto('${m.id}')"><div class="dmi-ic">${m.ic}</div><div class="dmi-count">${S[m.id]?.length||0}</div><div class="dmi-name">${m.n}</div></div>`).join('');

    b.innerHTML=`
    <!-- Net Worth Card -->
    <div class="dash-card dash-hero">
      <div class="dash-label" style="display:flex;align-items:center;gap:6px">NET WORTH <button onclick="Dash.showNWBreakdown()" style="width:18px;height:18px;border-radius:50%;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);cursor:pointer;font-size:10px;display:inline-flex;align-items:center;justify-content:center;padding:0;line-height:1" title="See breakdown">ℹ️</button></div>
      <div class="dash-nw-amount sens">${trendArrow}${cur} ${fmtN(nwDisplay)}</div>
      <div class="dash-nw-sub sens">${nwSub}</div>
      <div class="dash-hero-acts">
        <button class="btn btn-g btn-sm" onclick="Dash.toggleCurrency()">${cur}</button>
        <button class="btn btn-g btn-sm" onclick="Dash.snap()">Snapshot</button>
        <button class="btn btn-g btn-sm" onclick="ExIm.export('vault')">Backup</button>
      </div>
    </div>

    <!-- 2-column quick stats -->
    <div class="dash-stats">
      <div class="dash-stat" onclick="R.goto('banks')">
        <div class="dash-stat-n">${S.banks.length}</div>
        <div class="dash-stat-l">Banks</div>
      </div>
      <div class="dash-stat" onclick="R.goto('cards')">
        <div class="dash-stat-n">${S.cards.length}</div>
        <div class="dash-stat-l">Cards</div>
      </div>
      <div class="dash-stat" onclick="R.goto('investments')">
        <div class="dash-stat-n sens">${fmtN(Math.round(toCur(invPKR,cur)))}</div>
        <div class="dash-stat-l">Invested (${cur})</div>
      </div>
      <div class="dash-stat" onclick="R.goto('cash')">
        <div class="dash-stat-n sens">${fmtN(Math.round(toCur(cashPKR,cur)))}</div>
        <div class="dash-stat-l">Cash (${cur})</div>
      </div>
    </div>

    <!-- Wallet -->
    ${S.modules.cards?`<div class="widget"><div class="wh">Wallet<button class="btn btn-g btn-sm wh-act" onclick="Dash.editWallet()">Edit</button></div>${wCards.length>0?`<div class="wallet-row">${wCards.map(c=>this.miniCard(c)).join('')}</div>`:`<div style="font-size:12px;color:var(--text3);padding:2px 0">No cards selected — tap Edit to choose today's cards</div>`}</div>`:''}

    <!-- Alerts -->
    ${exp.length>0||simRem.length>0?`<div class="widget"><div class="wh">Alerts</div>${exp.map(c=>`<div class="insight err"><div class="insight-ic">💳</div><div class="insight-body"><div class="insight-title">${c.cardName}</div><div class="insight-sub">Expires ${c.expiry}</div></div>${U.expBadge(c.expiry)}</div>`).join('')}${simRem.map(s=>`<div class="insight warn"><div class="insight-ic">📱</div><div class="insight-body"><div class="insight-title">${s.network}</div><div class="insight-sub">Recharge by ${s.nextRecharge||'soon'}</div></div></div>`).join('')}</div>`:''}

    <!-- Allocation -->
    ${allocData.length>0?`<div class="widget"><div class="wh">Asset Allocation</div><div class="donut-wrap"><svg width="84" height="84" viewBox="0 0 84 84">${donutSVG}</svg><div class="dl">${allocData.map(d=>`<div class="dli"><div class="dld" style="background:${d.col}"></div><div class="dlk">${d.l}</div><div class="dlv">${((d.v/totAlloc)*100).toFixed(0)}%</div></div>`).join('')}</div></div></div>`:''}

    <!-- Monthly expenses -->
    ${S.modules.expenses&&monthlyExp>0?`<div class="widget"><div class="wh">Monthly Expenses</div><div style="font-size:26px;font-weight:800;letter-spacing:-1px;font-variant-numeric:tabular-nums">${U.fmt(Math.round(monthlyExp))} <span style="font-size:13px;color:var(--text3);font-weight:400">${S.user.currency}/mo</span></div><div style="font-size:11px;color:var(--text3);margin-top:3px">${U.fmt(Math.round(monthlyExp*12))}/year · ${S.expenses.filter(e=>e.active).length} active</div></div>`:''}

    <!-- Security -->
    <div class="widget"><div class="wh">Security Score</div><div style="display:flex;gap:14px;align-items:center"><div class="sring"><svg width="72" height="72" viewBox="0 0 72 72"><circle cx="36" cy="36" r="28" fill="none" stroke="var(--border2)" stroke-width="6"/><circle cx="36" cy="36" r="28" fill="none" stroke="var(--accent)" stroke-width="6" stroke-linecap="round" stroke-dasharray="${secScore*1.759} 1000" transform="rotate(-90 36 36)"/></svg><div class="snum">${secScore}</div></div><div style="flex:1;font-size:12px;color:var(--text2);line-height:1.7">${secScore>=85?'Excellent — vault fully secured':secScore>=70?'Good — consider enabling more protections':'Review your security settings'}</div></div></div>

    <!-- Recent activity -->
    ${S.activity.length>0?`<div class="widget" style="margin-bottom:12px"><div class="wh">Recent Activity</div>${S.activity.slice(0,6).map(a=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--border)"><div><div style="font-size:12px;font-weight:500">${a.a}</div>${a.d?`<div style="font-size:11px;color:var(--text3)">${a.d}</div>`:''}</div><div style="font-size:10px;color:var(--text3)">${Activity.ago(a.t)}</div></div>`).join('')}</div>`:''}

    <!-- Module grid -->
    ${activeMods.length>0?`<div class="dash-sec-label">Modules</div><div class="dash-mod-grid">${modGrid}</div>`:''}`;
  },
  donut(data,total){
    const r=30,cx=42,cy=42;let angle=-Math.PI/2;let paths='';
    data.forEach(d=>{const pct=d.v/total;const sw=pct*2*Math.PI;const x1=cx+r*Math.cos(angle),y1=cy+r*Math.sin(angle),x2=cx+r*Math.cos(angle+sw),y2=cy+r*Math.sin(angle+sw);const large=sw>Math.PI?1:0;paths+=`<path d="M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r},0,${large},1,${x2.toFixed(1)},${y2.toFixed(1)}Z" fill="${d.col}" opacity="0.85"/>`;angle+=sw;});
    return paths;
  },
  miniCard(c){
    const g={Visa:'135deg,#1a237e,#283593','American Express':'135deg,#1b5e20,#2e7d32',Mastercard:'135deg,#880e4f,#c2185b',Crypto:'135deg,#e65100,#f57c00',BNPL:'135deg,#6a1b9a,#8e24aa'};
    const bg=`linear-gradient(${g[c.network]||'135deg,#263238,#37474f'})`;
    const st=U.expSt(c.expiry);
    return `<div class="ccard" style="background:${bg}" onclick="Cards.openDetail('${c.id}')">
      ${st!=='ok'?`<div class="cc-status ${st}"></div>`:''}
      <div class="cc-type" style="font-size:8px;padding:2px 7px">${c.cardType||'Card'}</div>
      <div class="cc-bank" style="font-size:10px">${c.cardName}</div>
      <div class="cc-chip" style="width:26px;height:19px;margin:8px 0 7px"></div>
      <div class="cc-num sens" style="font-size:11px;letter-spacing:1.5px;margin-bottom:8px">${c.last4?'**** '+c.last4:'•••• ••••'}</div>
      <div class="cc-bot">
        <div><div class="cc-bl">Exp</div><div class="cc-exp" style="font-size:10px">${c.expiry||'--/--'}</div></div>
        <div style="max-width:80px"><div class="cc-bl">Holder</div><div class="cc-holder" style="font-size:9px;max-width:80px">${(c.holderName||'CARDHOLDER').toUpperCase().slice(0,14)}</div></div>
      </div>
      <div class="cc-net" style="font-size:9px;bottom:12px;right:14px">${c.network||''}</div>
    </div>`;
  },
  editWallet(){
    Modal.open('👝 Carrying Today',`<p style="font-size:12px;color:var(--text2);margin-bottom:12px">Select which cards you have on you today</p><div style="display:flex;flex-direction:column;gap:7px">${S.cards.map(c=>`<label style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--glass);border-radius:var(--rsm);cursor:pointer"><input type="checkbox" ${S.wallet.includes(c.id)?'checked':''} onchange="if(this.checked){S.wallet=[...new Set([...S.wallet,'${c.id}'])]}else{S.wallet=S.wallet.filter(x=>x!=='${c.id}')}"><span style="font-size:16px">💳</span><div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.cardName}</div><div style="font-size:11px;color:var(--text3)">${c.network||''} ${c.last4?'****'+c.last4:''}</div></div></label>`).join('')||'<div class="empty"><div class="empty-ic">💳</div><h3>No cards yet</h3></div>'}`,`<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Store.save();Modal.close();Dash.render()">Save</button>`);
  },
  editNW(){
    Modal.open('💰 Net Worth',`<div class="fg"><label class="fl">Amount</label><input class="inp" id="nwv" type="number" value="${S.user.netWorth}"></div><div class="fg"><label class="fl">Currency</label><select class="inp" id="nwc">${U.currencies()}</select></div>`,`<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="S.user.netWorth=parseFloat(document.getElementById('nwv').value)||0;S.user.currency=document.getElementById('nwc').value;Store.save();Modal.close();Dash.render();Toast.show('Updated','success')">Save</button>`);
    setTimeout(()=>{const c=document.getElementById('nwc');if(c)c.value=S.user.currency||'GBP';},50);
  },
  snap(){S.user.nwHistory.push({v:S.user.netWorth,d:new Date().toISOString().slice(0,10)});if(S.user.nwHistory.length>24)S.user.nwHistory.shift();Store.save();Toast.show('Snapshot saved','success');},
  toggleCurrency(){const order=['PKR','GBP','AED','USD'];const idx=order.indexOf(S.user.currency||'PKR');S.user.currency=order[(idx+1)%order.length];Store.save();this.render();},
  security(){let s=50;if(S.autoLock)s+=15;if(S.lockMins<=10)s+=10;if(S.clipSecs<=30)s+=10;if(S.banks.length)s+=5;if(S.cards.length)s+=5;if(S.pin!=='123456')s+=5;return Math.min(s,100);},
  showNWBreakdown(){
    const cur=S.user.currency||'PKR';
    const toB=(a,c)=>(a||0)*(FX[c]||1);
    const toCur=(pkr,c)=>pkr/(FX[c]||1);
    const fmtN=n=>cur==='PKR'?U.fmtPKR(n):U.fmt(n);
    const fmt=v=>`${cur} ${fmtN(Math.round(toCur(v,cur)))}`;
    const invPKR=S.investments.reduce((a,i)=>a+toB(i.currentValue||0,i.currency||cur),0);
    const asPKR=S.assets.reduce((a,x)=>a+toB(x.currentValue||0,x.currency||cur),0);
    const cashPKR=S.cash.reduce((a,c)=>a+toB(c.amount||0,c.currency||cur),0);
    const debtPKR=S.loans.filter(l=>l.type==='borrowed'&&l.status!=='Settled').reduce((a,l)=>a+toB(l.amount||0,l.currency||cur),0);
    const nwPKR=invPKR+asPKR+cashPKR-debtPKR;
    const row=(ic,label,val,col,prefix='')=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)"><div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text2)"><span>${ic}</span>${label}</div><div style="font-size:14px;font-weight:700;color:${col}">${prefix}${fmt(val)}</div></div>`;
    Modal.open('💰 Net Worth Breakdown',`
    <div style="padding:0 2px">
      ${row('📈','Investments',invPKR,'var(--accent)')}
      ${row('🏠','Assets',asPKR,'var(--accent)')}
      ${row('💵','Cash',cashPKR,'var(--accent)')}
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)"><div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text2)"><span>💸</span>Loans (owed)</div><div style="font-size:14px;font-weight:700;color:var(--err)">− ${fmt(debtPKR)}</div></div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 0 6px"><div style="font-size:14px;font-weight:700">Net Worth</div><div style="font-size:20px;font-weight:800;color:${nwPKR>=0?'var(--ok)':'var(--err)'}">${fmt(nwPKR)}</div></div>
    </div>
    <div style="margin-top:10px;padding:12px;background:var(--glass);border-radius:var(--r);border:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text3);margin-bottom:8px">Exchange Rates (vs PKR)</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;font-size:11px;color:var(--text2)">
        ${Object.entries(FX).filter(([c,r])=>r>0&&c!=='PKR').slice(0,9).map(([c,r])=>`<div style="display:flex;justify-content:space-between;padding:3px 0"><span>${c}</span><span style="font-weight:600">${U.fmt(r)}</span></div>`).join('')}
      </div>
    </div>`,
    `<button class="btn btn-p btn-full" onclick="Modal.close()">Close</button>`);
  }
};

// ===================== SETTINGS =====================
const Settings={
  render(){
    const b=document.getElementById('settBody');if(!b)return;
    b.innerHTML=`
    <div class="set-sec"><div class="set-title">👤 Profile</div><div class="set-card">
      <div class="si" onclick="Settings.editProfile()" style="cursor:pointer">
        <div style="display:flex;align-items:center;gap:12px;flex:1"><div style="width:44px;height:44px;border-radius:50%;background:var(--glass2);display:flex;align-items:center;justify-content:center;font-size:22px">${S.user.avatar||'💼'}</div><div><div class="name">${S.user.name||'User'}</div><div class="desc">${S.user.email||'Tap to add email'} ${S.user.phone?'· '+S.user.phone:''}</div></div></div><span style="color:var(--text3)">›</span>
      </div>
      <div class="si"><div class="sil"><div class="name">Home Address</div><div class="desc">${S.user.homeAddr||'Not set'}</div></div><button class="btn btn-g btn-sm" onclick="Settings.editProfile()">Edit</button></div>
      <div class="si"><div class="sil"><div class="name">Work Address</div><div class="desc">${S.user.workAddr||'Not set'}</div></div><button class="btn btn-g btn-sm" onclick="Settings.editProfile()">Edit</button></div>
    </div></div>

    <div class="set-sec"><div class="set-title">🧩 Active Modules</div><div class="set-card">
      ${ALL_MODULES.map(m=>`<div class="si"><div style="display:flex;align-items:center;gap:10px;flex:1"><span style="font-size:18px">${m.ic}</span><div class="sil"><div class="name">${m.n}</div><div class="desc">${m.desc}</div></div></div><label class="tog"><input type="checkbox" ${S.modules[m.id]?'checked':''} onchange="Settings.toggleMod('${m.id}',this.checked)"><span class="ts"></span></label></div>`).join('')}
      <div class="si"><div class="sil"><div class="name" style="font-size:12px;color:var(--text3)">Changes take effect after toggling — hidden modules stay in data but don't appear in nav</div></div></div>
    </div></div>

    <div class="set-sec"><div class="set-title">🎨 Appearance</div><div class="set-card">
      <div class="si"><div class="sil"><div class="name">Theme</div><div class="desc">${THEMES.find(t=>t.id===S.user.theme)?.n||'Midnight'}</div></div><button class="btn btn-g btn-sm" onclick="ThemeEngine.openPicker()">Change</button></div>
      <div class="si" style="flex-wrap:wrap;gap:8px"><div class="sil"><div class="name">Quick Switch</div></div><div style="display:flex;gap:7px;flex-wrap:wrap">${THEMES.map(t=>`<div class="tdot${t.id===S.user.theme?' on':''}" style="background:${t.ac}" onclick="ThemeEngine.apply('${t.id}')" title="${t.n}"></div>`).join('')}</div></div>
    </div></div>

    <div class="set-sec"><div class="set-title">🔒 Security</div><div class="set-card">
      <div class="si"><div class="sil"><div class="name">Change PIN</div><div class="desc">Update your 6-digit vault PIN</div></div><button class="btn btn-g btn-sm" onclick="Settings.changePIN()">Change</button></div>
      <div class="si"><div class="sil"><div class="name">Master Key</div><div class="desc">Emergency bypass — store this somewhere safe</div></div><button class="btn btn-g btn-sm" onclick="Settings.showMasterKey()">View</button></div>
      <div class="si"><div class="sil"><div class="name">Decoy PIN</div><div class="desc">${(S.decoyPin||VaultDB?.hasDecoy||false)?'✅ Set — shows convincing fake vault':'Not set'}</div></div><button class="btn btn-g btn-sm" onclick="Settings.setDecoyPIN()">${(S.decoyPin||VaultDB?.hasDecoy||false)?'Change':'Set'}</button></div>
      <div class="si"><div class="sil"><div class="name">No PIN Mode</div><div class="desc">Open vault without PIN ⚠️</div></div><label class="tog"><input type="checkbox" ${S.noPin?'checked':''} onchange="S.noPin=this.checked;Store.save();Toast.show('No-PIN '+(S.noPin?'enabled':'disabled'))"><span class="ts"></span></label></div>
      <div class="si"><div class="sil"><div class="name">Auto-Lock</div><div class="desc">Lock vault when phone sleeps</div></div><label class="tog"><input type="checkbox" ${S.autoLock?'checked':''} onchange="S.autoLock=this.checked;Store.save()"><span class="ts"></span></label></div>
      <div class="si"><div class="sil"><div class="name">Lock Timeout</div></div><select class="inp btn-sm" style="width:auto;padding:5px 9px" onchange="S.lockMins=parseInt(this.value);Store.save()">${[1,5,10,30,60].map(m=>`<option value="${m}"${S.lockMins===m?' selected':''}>${m} min</option>`).join('')}<option value="0"${S.lockMins===0?' selected':''}>Never</option></select></div>
      <div class="si"><div class="sil"><div class="name">Clipboard Clear</div><div class="desc">Auto-clear after copying sensitive data</div></div><select class="inp btn-sm" style="width:auto;padding:5px 9px" onchange="S.clipSecs=parseInt(this.value);Store.save()">${[15,30,60,120].map(s=>`<option value="${s}"${S.clipSecs===s?' selected':''}>${s}s</option>`).join('')}</select></div>
      <div class="si"><div class="sil"><div class="name">Privacy Mode</div><div class="desc">Blur all sensitive values on screen</div></div><label class="tog"><input type="checkbox" ${S.privacyMode?'checked':''} onchange="S.privacyMode=this.checked;document.body.classList.toggle('privacy',S.privacyMode);Store.save()"><span class="ts"></span></label></div>
    </div></div>

    <div class="set-sec"><div class="set-title">💾 Backup & Export</div><div class="set-card">
      <div class="si"><div class="sil"><div class="name">Last Backup</div><div class="desc">${S.user.lastBackup?Activity.ago(S.user.lastBackup):'Never backed up'}</div></div></div>
      <div style="padding:12px 14px;display:flex;flex-direction:column;gap:8px">
        <button class="btn btn-p btn-full btn-sm" onclick="ExIm.export('vault')">📤 Export Encrypted Vault (.vault)</button>
        <button class="btn btn-s btn-full btn-sm" onclick="ExIm.export('json')">📄 Export as JSON (readable)</button>
        <button class="btn btn-s btn-full btn-sm" onclick="ExIm.export('csv')">📊 Export as CSV (spreadsheet)</button>
        <button class="btn btn-g btn-full btn-sm" onclick="document.getElementById('importF-global').click()">📥 Import / Restore Vault</button>
        <input type="file" id="importF" accept=".vault,.json" style="display:none" onchange="ExIm.import(event)">
        <button class="btn btn-g btn-full btn-sm" onclick="ExIm.share()">📲 Share via Files / AirDrop</button>
      </div>
    </div></div>

    <div class="set-sec"><div class="set-title">📊 Data Summary</div><div class="set-card">
      ${[...(typeof ALL_MODULES!=='undefined'?ALL_MODULES:[]).map(m=>[m.n,S[m.id]?.length||0,m.ic]),['Activity',S.activity.length,'📋']].map(([n,c,ic])=>`<div class="si"><div class="name">${ic} ${n}</div><div style="font-weight:700;color:var(--accent)">${c}</div></div>`).join('')}
    </div></div>

    <div class="set-sec"><div class="set-title">⚙️ Data Management</div><div class="set-card">
      <div style="padding:12px 14px;display:flex;flex-direction:column;gap:8px">
        <button class="btn btn-g btn-full btn-sm" onclick="S.activity=[];Store.save();Settings.render();Toast.show('Activity cleared')">🗑️ Clear Activity Log</button>
        <button class="btn btn-s btn-full btn-sm" onclick="Settings.loadDemo()">🎮 Load Demo Data (fictional)</button>
        <button class="btn btn-d btn-full btn-sm" onclick="Settings.resetVault()">⚠️ Reset Entire Vault</button>
      </div>
    </div></div>

    <div class="set-sec" style="margin-bottom:40px"><div class="set-title">ℹ️ About VaultOS</div><div class="set-card">
      ${[['Version','v4.0 — Enterprise Edition'],['Storage','Local device only — never sent anywhere'],['Encryption','Client-side (localStorage)'],['Created by','Shamikh Ahmed'],['Demo PIN','123456']].map(([k,v])=>`<div class="si"><div class="name">${k}</div><div style="color:var(--text2);font-size:12px;text-align:right;flex:1">${v}</div></div>`).join('')}
      <div class="si"><div class="name" style="font-size:12px;color:var(--text3)">💡 Tip: On iPhone — open in Safari → Share → Add to Home Screen for the full app experience</div></div>
    </div></div>`;
  },
  toggleMod(id,v){S.modules[id]=v;Store.save();buildNav();Toast.show(`${v?'Enabled':'Hidden'}: ${ALL_MODULES.find(m=>m.id===id)?.n}`,'info',1500);},
  editProfile(){
    Modal.open('👤 Edit Profile',`
    <div class="fr"><div class="fg"><label class="fl">Your Name</label><input class="inp" id="pp-name" value="${S.user.name||''}"></div><div class="fg"><label class="fl">Avatar Emoji</label><input class="inp" id="pp-avatar" value="${S.user.avatar||'💼'}" style="font-size:22px;text-align:center"></div></div>
    <div class="fr"><div class="fg"><label class="fl">Email</label><input class="inp" id="pp-email" type="email" value="${S.user.email||''}" placeholder="your@email.com"></div><div class="fg"><label class="fl">Phone</label><input class="inp" id="pp-phone" value="${S.user.phone||''}" placeholder="+44 7700..."></div></div>
    <div class="fr"><div class="fg"><label class="fl">Date of Birth</label><input class="inp" id="pp-dob" type="date" value="${S.user.dob||''}"></div><div class="fg"><label class="fl">Default Currency</label><select class="inp" id="pp-cur">${U.currencies()}</select></div></div>
    <div class="fg"><label class="fl">Home Address</label><textarea class="inp" id="pp-home" rows="2">${S.user.homeAddr||''}</textarea></div>
    <div class="fg"><label class="fl">Work / Office Address</label><textarea class="inp" id="pp-work" rows="2">${S.user.workAddr||''}</textarea></div>`,
    `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Settings.saveProfile()">Save Profile</button>`);
    setTimeout(()=>{const c=document.getElementById('pp-cur');if(c)c.value=S.user.currency||'GBP';},50);
  },
  saveProfile(){
    const g=id=>{const e=document.getElementById(id);return e?e.value.trim():''};
    S.user.name=g('pp-name')||S.user.name;S.user.avatar=g('pp-avatar')||S.user.avatar;
    S.user.email=g('pp-email');S.user.phone=g('pp-phone');S.user.dob=g('pp-dob');
    S.user.currency=document.getElementById('pp-cur')?.value||S.user.currency;
    S.user.homeAddr=g('pp-home');S.user.workAddr=g('pp-work');
    Store.save();Modal.close();this.render();buildNav();Toast.show('Profile updated','success');
  },
  changePIN(){
    Modal.open('🔑 Change PIN',`
    <div class="fg"><label class="fl">Current PIN</label><input class="inp" id="cp-cur" type="password" maxlength="6" inputmode="numeric" placeholder="••••••"></div>
    <div class="fg"><label class="fl">New PIN (6 digits)</label><input class="inp" id="cp-new" type="password" maxlength="6" inputmode="numeric" placeholder="••••••"></div>
    <div class="fg"><label class="fl">Confirm New PIN</label><input class="inp" id="cp-con" type="password" maxlength="6" inputmode="numeric" placeholder="••••••"></div>
    <div class="ferr" id="cp-err"></div>`,
    `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Settings.savePIN()">Change PIN</button>`);
  },
  savePIN(){
    const o=document.getElementById('cp-cur').value,n=document.getElementById('cp-new').value,c=document.getElementById('cp-con').value;
    if(!/^\d{6}$/.test(n)){document.getElementById('cp-err').textContent='New PIN must be 6 digits';return;}
    if(n!==c){document.getElementById('cp-err').textContent='PINs do not match';return;}
    // Verify old PIN via VaultDB (PIN not kept in S after first unlock)
    VaultDB.tryPin(o).then(result=>{
      if(!result){document.getElementById('cp-err').textContent='Current PIN incorrect';return;}
      VaultDB.changePin(o,n).then(()=>{Store.save();}).catch(e=>{Store.save();console.warn('[VaultDB] changePin error:',e);});
      Modal.close();Activity.log('PIN changed');Toast.show('PIN updated successfully!','success');
    });
  },
  showMasterKey(){
    const raw=btoa(unescape(encodeURIComponent(S.pin+':'+S.user.name+':VaultOS3')));
    const key=(raw.replace(/[^A-Za-z0-9]/g,'').slice(0,6)+'-'+raw.slice(4,10).toUpperCase()+'-'+raw.slice(10,16).toUpperCase()).toUpperCase();
    Modal.open('🗝️ Master Emergency Key',`
    <div style="text-align:center;padding:8px 0">
      <p style="font-size:12px;color:var(--text2);margin-bottom:14px;line-height:1.6">This key can bypass lockouts and reset your PIN. It is derived from your PIN + name — it is NOT stored anywhere. Write it down and keep it somewhere physically safe.</p>
      <div style="font-size:22px;font-weight:900;letter-spacing:4px;color:var(--accent);background:var(--glass2);padding:18px;border-radius:var(--r);font-family:var(--mono);margin-bottom:14px;word-break:break-all">${key}</div>
      <button class="btn btn-s btn-full" onclick="U.copy('${key}','Master key')">📋 Copy Key</button>
      <p style="font-size:11px;color:var(--text3);margin-top:10px">If your PIN or name changes, this key changes too. Re-view it after any changes.</p>
    </div>`,`<button class="btn btn-p btn-full" onclick="Modal.close()">✅ I've stored it safely</button>`);
  },
  setDecoyPIN(){
    Modal.open('🎭 Set Decoy PIN',`
    <p style="font-size:12px;color:var(--text2);margin-bottom:14px;line-height:1.6">When someone enters this PIN, they see a convincing fake vault with realistic-looking data. Your real data stays hidden. Perfect for coercion or border device inspections.</p>
    <div class="fg"><label class="fl">Decoy PIN (6 digits, must differ from real PIN)</label><input class="inp" id="dp-pin" type="password" maxlength="6" inputmode="numeric" placeholder="••••••"></div>
    <div class="ferr" id="dp-err"></div>`,
    `<button class="btn btn-g" onclick="Modal.close()">Cancel</button>${S.decoyPin?'<button class="btn btn-d btn-sm" onclick="S.decoyPin=\'\';Store.save();Modal.close();Settings.render();Toast.show(\'Decoy PIN removed\')">Remove</button>':''}<button class="btn btn-p" onclick="Settings.saveDecoy()">Set Decoy PIN</button>`);
  },
  saveDecoy(){
    const p=document.getElementById('dp-pin').value;
    if(!/^\d{6}$/.test(p)){document.getElementById('dp-err').textContent='Must be exactly 6 digits';return;}
    if(p===S.pin){document.getElementById('dp-err').textContent='Must be different from your real PIN';return;}
    S.decoyPin=p;Store.save();
    // Persist decoy slot in VaultDB so it's recognised on next unlock
    VaultDB.saveDecoySlot(p,{_decoy:true}).catch(e=>console.warn('[VaultDB] decoy slot error:',e));
    Modal.close();this.render();Toast.show('Decoy PIN set — entering it shows empty vault','success');
  },
  forgotPIN(){
    Modal.open('🔑 Forgot PIN',`
    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="background:var(--glass);border:1px solid var(--border);border-radius:var(--r);padding:14px;cursor:pointer" onclick="Settings.useMasterKey()"><div style="font-weight:600;margin-bottom:4px">🗝️ Use Master Key</div><div style="font-size:12px;color:var(--text2)">Enter the master key you saved when setting up</div></div>
      <div style="background:var(--glass);border:1px solid var(--border);border-radius:var(--r);padding:14px;cursor:pointer" onclick="document.getElementById('importF-global').click();Modal.close()"><div style="font-weight:600;margin-bottom:4px">📥 Restore from Backup</div><div style="font-size:12px;color:var(--text2)">Import a .vault backup file</div></div>
      <div style="background:rgba(255,64,96,.05);border:1px solid rgba(255,64,96,.2);border-radius:var(--r);padding:14px;cursor:pointer" onclick="Settings.resetVault()"><div style="font-weight:600;color:var(--err);margin-bottom:4px">⚠️ Reset Vault</div><div style="font-size:12px;color:var(--text2)">Last resort — wipes all data</div></div>
    </div>`,`<button class="btn btn-g btn-full" onclick="Modal.close()">Cancel</button>`);
  },
  useMasterKey(){
    Modal.open('🗝️ Enter Master Key',`
    <div class="fg"><label class="fl">Your Master Key</label><input class="inp" id="mk-in" placeholder="XXXXXX-XXXXXX-XXXXXX" style="font-family:var(--mono);letter-spacing:2px;text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="ferr" id="mk-err"></div>`,
    `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Settings.verifyMasterKey()">Verify & Reset PIN</button>`);
  },
  verifyMasterKey(){
    const input=document.getElementById('mk-in').value.trim().toUpperCase();
    const raw=btoa(unescape(encodeURIComponent(S.pin+':'+S.user.name+':VaultOS3')));
    const expected=(raw.replace(/[^A-Za-z0-9]/g,'').slice(0,6)+'-'+raw.slice(4,10).toUpperCase()+'-'+raw.slice(10,16).toUpperCase()).toUpperCase();
    if(input===expected){Modal.close();this.changePIN();Toast.show('Master key verified — set your new PIN','success');}
    else{document.getElementById('mk-err').textContent='Invalid master key — check and try again';}
  },
  loadDemo(){
    if(!window.__vos_confirm('Load fictional demo data?'))return;
    loadDemoData();
    localStorage.setItem('vos_demo_mode','1');
    buildNav();Toast.show('Demo data loaded!','success');this.render();
  },
  resetVault(){
    if(!window.__vos_confirm('⚠️ This will permanently delete ALL your vault data.'))return;
    if(!window.__vos_confirm('Final confirmation — this CANNOT be undone. Reset entire vault?'))return;
    Store.clear().then(()=>{
      if(window.caches)caches.keys().then(keys=>keys.forEach(k=>caches.delete(k)));
      Toast.show('Vault cleared — reloading...','warning',1500);
      setTimeout(()=>location.reload(),1600);
    });
  }
};

// ===================== EXPORT / IMPORT =====================
const ExIm={
  export(fmt='vault'){if(fmt==='vos')fmt='vault';
    if(fmt==='vault'&&Crypto.available()){
      const pw=S.pin+'_vos4_'+S.user.name;
      const data={ver:'4.0',exported:new Date().toISOString(),user:S.user,modules:S.modules,banks:S.banks,cards:S.cards,investments:S.investments,sims:S.sims,assets:S.assets,expenses:S.expenses,emails:S.emails,gadgets:S.gadgets,digital:S.digital,documents:S.documents||[],tags:S.tags,wallet:S.wallet};
      S.user.lastBackup=new Date().toISOString();Store.save();
      Crypto.encrypt(JSON.stringify(data),pw).then(enc=>{
        this.dl('VaultOS-'+(new Date().toISOString().slice(0,10))+'.vos','application/octet-stream','VAULTOS_AES256::'+enc);
        Activity.log('Exported','AES-256-GCM encrypted .vos');
        Toast.show('Exported — AES-256-GCM encrypted','success');
      }).catch(()=>{this._exportPlain(data);});
      return;
    }
    const data={ver:'3.0',exported:new Date().toISOString(),user:S.user,modules:S.modules,banks:S.banks,cards:S.cards,investments:S.investments,sims:S.sims,assets:S.assets,expenses:S.expenses,emails:S.emails,gadgets:S.gadgets,digital:S.digital,documents:S.documents||[],tags:S.tags,wallet:S.wallet};
    S.user.lastBackup=new Date().toISOString();Store.save();
    if(fmt==='csv'){
      let csv='Type,Name,Country,Currency,Value,Notes\n';
      S.banks.forEach(b=>csv+=`Bank,"${b.bankName}","${b.country}","${b.currency}","${b.balance||0}","${(b.notes||'').replace(/"/g,'""')}"\n`);
      S.cards.forEach(c=>csv+=`Card,"${c.cardName}","${c.country||''}","${c.currency||''}","${c.rewardsPoints||0} pts","${(c.notes||'').replace(/"/g,'""')}"\n`);
      S.investments.forEach(i=>csv+=`Investment,"${i.investmentName||i.broker}","${i.country||''}","${i.currency}","${i.currentValue||0}","P&L: ${i.currentValue&&i.amountInvested?i.currentValue-i.amountInvested:0}"\n`);
      S.expenses.forEach(e=>csv+=`Expense,"${e.name}","","${e.currency}","${e.amount}/mo","${e.from||''}"\n`);
      S.gadgets.forEach(g=>csv+=`Device,"${g.name}","","${g.currency||''}","${g.purchasePrice||0}","${g.warranty?'Warranty: '+g.warranty:''}"\n`);
      this.dl('VaultOS-export.csv','text/csv',csv);Toast.show('CSV exported','success');return;
    }
    const data2={ver:'4.0',exported:new Date().toISOString(),user:S.user,modules:S.modules,banks:S.banks,cards:S.cards,investments:S.investments,sims:S.sims,assets:S.assets,expenses:S.expenses,emails:S.emails,gadgets:S.gadgets,digital:S.digital,documents:S.documents||[],tags:S.tags,wallet:S.wallet};S.user.lastBackup=new Date().toISOString();Store.save();
    const content=JSON.stringify(data2,null,fmt==='json'?2:0);
    this.dl('VaultOS-backup-'+(new Date().toISOString().slice(0,10))+'.'+(fmt==='json'?'json':'json'),fmt==='json'?'application/json':'application/octet-stream',content);
    Activity.log('Exported',fmt.toUpperCase());Toast.show('Exported as '+fmt,'success');
    return;},
  _exportPlain(data,fmt){},
  dl(name,mime,content){const b=new Blob([content],{type:mime});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(()=>URL.revokeObjectURL(a.href),1000);},
  share(){
    const data={ver:'3.0',exported:new Date().toISOString(),banks:S.banks,cards:S.cards,investments:S.investments,sims:S.sims,assets:S.assets,expenses:S.expenses,emails:S.emails,gadgets:S.gadgets,digital:S.digital};
    const blob=new Blob([JSON.stringify(data)],{type:'application/octet-stream'});
    const file=new File([blob],'VaultOS-backup.vault',{type:'application/octet-stream'});
    if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){navigator.share({files:[file],title:'VaultOS Backup'}).catch(err=>{if(err.name!=='AbortError')this.export('vault');});}
    else{this.export('vault');Toast.show('Share not available — downloaded instead','info');}
  },
  import(ev){
    const file=ev.target.files[0];if(!file)return;
    const r=new FileReader();
    r.onload=e=>{
      try{
        let raw=e.target.result;
        const doImport=(raw2)=>{
          try{
            const data=JSON.parse(raw2);
            if(!data.banks&&!data.cards&&!data.emails&&!data.gadgets&&!data.expenses){Toast.show('Invalid vault file','error');return;}
            const counts=[`${(data.banks||[]).length} banks`,`${(data.cards||[]).length} cards`,`${(data.emails||[]).length} emails`,`${(data.gadgets||[]).length} devices`,`${(data.expenses||[]).length} expenses`].join(', ');
            if(!window.__vos_confirm(`Import vault?\n\n${counts}\n\nMerges with existing data.`))return;
            ['banks','cards','investments','sims','assets','expenses','emails','gadgets','digital','documents','tags'].forEach(k=>{if(Array.isArray(data[k]))S[k]=[...(S[k]||[]),...data[k].filter(x=>!S[k]?.find(y=>y.id===x.id))];});
            if(data.modules)Object.assign(S.modules,data.modules);
            Store.save();buildNav();Activity.log('Vault imported');Toast.show('Import successful!','success');R.goto(S.currentPage||'dashboard');
          }catch(err){Toast.show('Failed: '+err.message,'error');}
        };
        if(raw.startsWith('VAULTOS_AES256::')&&Crypto.available()){
          const enc=raw.replace('VAULTOS_AES256::','');
          const pw=S.pin+'_vos4_'+S.user.name;
          Crypto.decrypt(enc,pw).then(doImport).catch(()=>{
            Toast.show('Decryption failed — wrong PIN or corrupted file','error');
          });
          return;
        }
        if(raw.startsWith('VAULTOS4_ENC::'))raw=atob(raw.replace('VAULTOS4_ENC::',''));
        doImport(raw);
        return;
        const data=JSON.parse(raw);
        if(!data.banks&&!data.cards&&!data.emails&&!data.gadgets&&!data.expenses){Toast.show('Invalid vault file — is this a VaultOS backup?','error');return;}
        const counts=[`${(data.banks||[]).length} banks`,`${(data.cards||[]).length} cards`,`${(data.emails||[]).length} emails`,`${(data.gadgets||[]).length} devices`,`${(data.expenses||[]).length} expenses`].join(', ');
        if(!window.__vos_confirm(`Import vault backup?\n\n${counts}\n\nThis will MERGE with your existing data (no deletions).`))return;
        ['banks','cards','investments','sims','assets','expenses','emails','gadgets','digital','documents','tags'].forEach(k=>{if(Array.isArray(data[k]))S[k]=[...(S[k]||[]),...data[k].filter(x=>!S[k]?.find(y=>y.id===x.id))];});
        if(data.modules)Object.assign(S.modules,data.modules);
        Store.save();buildNav();Activity.log('Vault imported from file');Toast.show('Import successful!','success');R.goto(S.currentPage||'dashboard');
      }catch(err){Toast.show('Failed to read file: '+err.message,'error');}
    };
    r.readAsText(file);ev.target.value='';
  }
};

const WhatsNew={
  check(){
    const lastShown=localStorage.getItem('vos_wn_ver');
    if(lastShown===VER) return; // Already shown this version
    localStorage.setItem('vos_wn_ver',VER); // Mark as shown immediately
    setTimeout(()=>this.show(), 1200);
  },
  show(){
    localStorage.setItem('vos_wn_ver',VER);
    Modal.open('✨ Welcome to VaultOS v'+VER,`
    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="padding:12px;background:var(--glass);border-radius:var(--r);border:1px solid var(--border)">
        <div style="font-size:13px;font-weight:700;margin-bottom:4px">🪪 Standalone Documents Module</div>
        <div style="font-size:12px;color:var(--text2)">Passports, IDs, Visas, Contracts, Tax docs — 13 adaptive schemas with intelligent fields</div>
      </div>
      <div style="padding:12px;background:var(--glass);border-radius:var(--r);border:1px solid var(--border)">
        <div style="font-size:13px;font-weight:700;margin-bottom:4px">📥 Smart Bulk Import</div>
        <div style="font-size:12px;color:var(--text2)">Paste text, Excel, Word, CSV, PDF — auto-detects banks, cards, investments, SIMs. Edit before importing.</div>
      </div>
      <div style="padding:12px;background:var(--glass);border-radius:var(--r);border:1px solid var(--border)">
        <div style="font-size:13px;font-weight:700;margin-bottom:4px">⚙️ Tabbed Settings Center</div>
        <div style="font-size:12px;color:var(--text2)">8-section Settings: Profile, Security, Appearance, Modules, Backup, Import, Accessibility, About</div>
      </div>
      <div style="padding:12px;background:var(--glass);border-radius:var(--r);border:1px solid var(--border)">
        <div style="font-size:13px;font-weight:700;margin-bottom:4px">🔍 Self-Check Engine</div>
        <div style="font-size:12px;color:var(--text2)">Auto-detects and repairs data integrity issues. Runs every 5 min. ⌘K → Run Self-Check.</div>
      </div>
      <div style="padding:12px;background:var(--glass);border-radius:var(--r);border:1px solid var(--border)">
        <div style="font-size:13px;font-weight:700;margin-bottom:4px">🎨 8 New Premium Themes</div>
        <div style="font-size:12px;color:var(--text2)">Rose Gold, Lavender, Titanium, Midnight Sapphire, Pearl, Peach — Settings → Appearance</div>
      </div>
    </div>`,
    `<button class="btn btn-p btn-full" onclick="Modal.close()">Start Using VaultOS →</button>`);
  }
};

const ImportEngine={
  render(){
    const b=document.getElementById('importBody');if(!b)return;
    b.innerHTML=`
    <div style="display:flex;flex-direction:column;gap:14px;padding-bottom:40px">
      <!-- DRAG/UPLOAD ZONE -->
      <div id="ie-dropzone" style="border:2px dashed var(--border2);border-radius:20px;padding:32px 20px;text-align:center;cursor:pointer;transition:all .2s var(--ease);background:var(--glass)"
        ondragover="event.preventDefault();this.style.borderColor='var(--accent)';this.style.background='var(--glow)'"
        ondragleave="this.style.borderColor='var(--border2)';this.style.background='var(--glass)'"
        ondrop="ImportEngine.handleDrop(event)" onclick="document.getElementById('ie-file').click()" style="border:2px dashed var(--border2);border-radius:20px;padding:28px 20px;text-align:center;cursor:pointer;transition:all .2s var(--ease);background:var(--glass)">
        <div style="font-size:44px;margin-bottom:12px">📥</div>
        <div style="font-size:16px;font-weight:700;margin-bottom:6px">Drop files here or tap to browse</div>
        <div style="font-size:12px;color:var(--text2);margin-bottom:14px">Images · CSV · JSON · Text · Vault files</div>
        <div style="display:flex;flex-wrap:wrap;gap:7px;justify-content:center">
          <span style="padding:4px 12px;border-radius:99px;background:var(--glass2);border:1px solid var(--border);font-size:11px;color:var(--text2)">📷 Photos</span>
          <span style="padding:4px 12px;border-radius:99px;background:var(--glass2);border:1px solid var(--border);font-size:11px;color:var(--text2)">📄 PDFs</span>
          <span style="padding:4px 12px;border-radius:99px;background:var(--glass2);border:1px solid var(--border);font-size:11px;color:var(--text2)">📊 CSV</span>
          <span style="padding:4px 12px;border-radius:99px;background:var(--glass2);border:1px solid var(--border);font-size:11px;color:var(--text2)">📊 Excel</span>
          <span style="padding:4px 12px;border-radius:99px;background:var(--glass2);border:1px solid var(--border);font-size:11px;color:var(--text2)">📝 Word</span>
          <span style="padding:4px 12px;border-radius:99px;background:var(--glass2);border:1px solid var(--border);font-size:11px;color:var(--text2)">📋 Text/PDF</span>
          <span style="padding:4px 12px;border-radius:99px;background:var(--glass2);border:1px solid var(--border);font-size:11px;color:var(--text2)">🔒 .vos Vault</span>
        </div>
      </div>
      <input type="file" id="ie-file" accept="image/*,.csv,.json,.txt,.vos,.vault,.xlsx,.xls,.docx,.doc,.pdf" style="display:none" onchange="ImportEngine.handleFile(this.files[0])">
      <!-- STATUS -->
      <div id="ie-status" style="display:none;background:var(--glass);border:1px solid var(--border);border-radius:var(--r);padding:14px;text-align:center">
        <div id="ie-status-text" style="font-size:13px;color:var(--text2)"></div>
        <div style="background:var(--border);border-radius:2px;height:4px;margin-top:10px;overflow:hidden"><div id="ie-progress" style="height:100%;background:var(--accent);border-radius:2px;width:0%;transition:width .3s var(--ease)"></div></div>
      </div>
      <!-- RESULTS -->
      <div id="ie-results" style="display:none"></div>
      <!-- MANUAL PARSE SECTION -->
      <div style="background:var(--glass);border:1px solid var(--border);border-radius:var(--r);padding:14px">
        <div style="font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--text3);margin-bottom:10px">✏️ Paste Text to Import</div>
        <textarea class="inp" id="ie-paste" rows="5" placeholder="Paste bank statement, card details, subscription list, or any text...&#10;&#10;VaultOS will detect and auto-fill entries from it." style="resize:vertical;min-height:80px;font-size:13px;line-height:1.6"></textarea>
        <button class="btn btn-p btn-sm" onclick="ImportEngine.parseText(document.getElementById('ie-paste').value)" style="margin-top:8px;width:100%">🔍 Detect & Import</button>
      </div>
      <!-- HISTORY -->
      ${S.activity.filter(a=>a.a.includes('import')||a.a.includes('Import')).length>0?`
      <div class="widget">
        <div class="wh"><span>📋</span>Import History</div>
        ${S.activity.filter(a=>a.a.includes('import')||a.a.includes('Import')).slice(0,5).map(a=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px"><span>${a.a}</span><span style="color:var(--text3)">${Activity.ago(a.t)}</span></div>`).join('')}
      </div>`:''}
    </div>`;
  },
  setStatus(msg, pct=null){
    const s=document.getElementById('ie-status');
    const t=document.getElementById('ie-status-text');
    const p=document.getElementById('ie-progress');
    if(s)s.style.display='block';
    if(t)t.textContent=msg;
    if(p&&pct!==null)p.style.width=pct+'%';
  },
  handleDrop(e){
    e.preventDefault();
    const el=document.getElementById('ie-dropzone');
    if(el){el.style.borderColor='var(--border2)';el.style.background='var(--glass)';}
    const file=e.dataTransfer.files[0];
    if(file)this.handleFile(file);
  },
  handleFile(file){
    if(!file)return;
    const name=file.name.toLowerCase();
    if(name.endsWith('.vos')||name.endsWith('.vault')){this.importVault(file);return;}
    if(name.endsWith('.csv')){this.importCSV(file);return;}
    if(name.endsWith('.json')){this.importJSON(file);return;}
    if(name.endsWith('.txt')||name.endsWith('.md')){this.readText(file,t=>this.parseText(t));return;}
    if(name.endsWith('.xlsx')||name.endsWith('.xls')){this.importExcel(file);return;}
    if(name.endsWith('.docx')||name.endsWith('.doc')){this.importWord(file);return;}
    if(name.endsWith('.pdf')){this.importPDF(file);return;}
    if(file.type.startsWith('image/')){this.runOCR(file);return;}
    // Try text as fallback
    this.readText(file,t=>this.parseText(t));
  },
  importExcel(file){
    this.setStatus('Loading Excel parser...',10);
    // Load SheetJS dynamically
    if(typeof XLSX==='undefined'){
      const s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
      s.onload=()=>this._readExcel(file);
      s.onerror=()=>{Toast.show('Could not load Excel parser — try CSV export','error');};
      document.head.appendChild(s);
    } else {this._readExcel(file);}
  },
  _readExcel(file){
    this.setStatus('Reading Excel file...',30);
    const r=new FileReader();
    r.onload=e=>{
      try{
        const wb=XLSX.read(e.target.result,{type:'binary'});
        let allRows=[];
        wb.SheetNames.forEach(name=>{
          const ws=wb.Sheets[name];
          const rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:''});
          allRows=[...allRows,...rows];
        });
        this.setStatus('Parsing '+allRows.length+' rows...',60);
        const results=[];
        allRows.forEach(row=>{
          const line=row.filter(Boolean).join(' ');
          if(line.length<3)return;
          const guessed=this.parseOCRText(line);
          results.push(...guessed);
        });
        const unique=[...new Map(results.map(r=>[JSON.stringify(r.data),r])).values()];
        this.setStatus('Found '+unique.length+' items in Excel',100);
        this.showResults(unique);
      }catch(err){Toast.show('Excel parse error: '+err.message,'error');}
    };
    r.readAsBinaryString(file);
  },
  importWord(file){
    this.setStatus('Reading Word document...',20);
    // Load mammoth.js for .docx
    if(typeof mammoth==='undefined'){
      const s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js';
      s.onload=()=>this._readWord(file);
      s.onerror=()=>{
        // Fallback: read as text
        this.readText(file,t=>this.parseText(t));
      };
      document.head.appendChild(s);
    } else {this._readWord(file);}
  },
  _readWord(file){
    const r=new FileReader();
    r.onload=e=>{
      mammoth.extractRawText({arrayBuffer:e.target.result})
        .then(result=>{this.setStatus('Extracted text from Word doc',70);this.parseText(result.value);})
        .catch(()=>this.readText(file,t=>this.parseText(t)));
    };
    r.readAsArrayBuffer(file);
  },
  importPDF(file){
    this.setStatus('PDF detected — extracting text via OCR...',10);
    // For PDF, convert to image and OCR, or use text extraction
    const r=new FileReader();
    r.onload=e=>{
      // Try as text first (text-based PDFs)
      const textContent=new TextDecoder('utf-8',{fatal:false}).decode(new Uint8Array(e.target.result).slice(0,50000));
      const extracted=textContent.split('').filter(ch=>ch.charCodeAt(0)>=32&&ch.charCodeAt(0)<=126||ch==='\n').join('').replace(/\s+/g,' ').trim();
      if(extracted.length>50){
        this.setStatus('Parsing PDF text content...',70);
        this.parseText(extracted);
      } else {
        Toast.show('PDF is image-based — use OCR scan','warning');
        this.setStatus('Upload image scan of PDF pages for OCR',0);
      }
    };
    r.readAsArrayBuffer(file);
  },
  importVault(file){
    const r=new FileReader();
    r.onload=e=>{
      const raw=e.target.result;
      if(raw.startsWith('VAULTOS_AES256::')&&Crypto.available()){
        const enc=raw.replace('VAULTOS_AES256::','');
        const pw=prompt('Enter vault PIN to decrypt:');
        if(!pw)return;
        const derivedPw=pw+'_vos4_'+S.user.name;
        Crypto.decrypt(enc,derivedPw).then(plain=>this.mergeVault(JSON.parse(plain))).catch(()=>Toast.show('Wrong PIN or corrupted file','error'));
      } else {
        try{this.mergeVault(JSON.parse(raw));}catch(e){Toast.show('Invalid vault file','error');}
      }
    };
    r.readAsText(file);
  },
  mergeVault(data){
    if(!data.banks&&!data.cards){Toast.show('Not a valid VaultOS file','error');return;}
    const total=['banks','cards','investments','sims','assets','expenses','emails','gadgets','digital'].reduce((a,k)=>{
      if(Array.isArray(data[k])){const new_=data[k].filter(x=>!S[k]?.find(y=>y.id===x.id));S[k]=[...(S[k]||[]),...new_];return a+new_.length;}return a;
    },0);
    Store.save();buildNav();Activity.log('Vault merged',''+total+' new entries');
    Toast.show('Imported '+total+' new entries','success');this.render();
  },
  importCSV(file){
    this.setStatus('Reading CSV...',20);
    const r=new FileReader();
    r.onload=e=>{
      const lines=e.target.result.split('\n').filter(l=>l.trim());
      this.setStatus('Parsing '+lines.length+' rows...',50);
      const results=[];
      lines.slice(1).forEach(line=>{
        const parts=line.split(',').map(p=>p.replace(/^"|"$/g,'').trim());
        if(!parts[0])return;
        const guessed=this.guessType(parts.join(' '));
        if(guessed)results.push(guessed);
      });
      this.setStatus('Done — '+results.length+' items detected',100);
      this.showResults(results);
    };
    r.readAsText(file);
  },
  importJSON(file){
    this.setStatus('Reading JSON...',30);
    const r=new FileReader();
    r.onload=e=>{
      try{const data=JSON.parse(e.target.result);if(data.banks||data.cards){this.mergeVault(data);}else{Toast.show('Unrecognized JSON format','warning');}}
      catch(err){Toast.show('Invalid JSON','error');}
    };
    r.readAsText(file);
  },
  readText(file,cb){
    const r=new FileReader();r.onload=e=>cb(e.target.result);r.readAsText(file);
  },
  runOCR(file){
    if(typeof Tesseract==='undefined'){Toast.show('OCR loading... please wait a moment','info');setTimeout(()=>this.runOCR(file),2000);return;}
    this.setStatus('📷 Scanning image with OCR...',10);
    const r=new FileReader();
    r.onload=e=>{
      Tesseract.recognize(e.target.result,'eng',{logger:m=>{if(m.status==='recognizing text')this.setStatus('OCR: '+Math.round(m.progress*100)+'%...',Math.round(m.progress*90));}})
        .then(({data:{text,confidence}})=>{
          this.setStatus('✅ OCR complete — confidence '+Math.round(confidence)+'%',100);
          const results=this.parseOCRText(text);
          this.showResults(results,text);
        })
        .catch(()=>{this.setStatus('❌ OCR failed — try a clearer image',0);});
    };
    r.readAsDataURL(file);
  },
  parseText(text){
    if(!text.trim()){Toast.show('Please enter some text first','warning');return;}
    this.setStatus('Analysing text...',20);
    // Try TSV/CSV table detection first (most structured)
    const tsvResults=this.parseTSV(text);
    if(tsvResults.length>0){
      this.setStatus('Detected structured table — found '+tsvResults.length+' items',100);
      this.showResults(tsvResults,text);
      return;
    }
    // Fall back to OCR text parsing
    const results=this.parseOCRText(text);
    this.setStatus('Found '+results.length+' items',100);
    this.showResults(results,text);
  },
  parseTSV(text){
    const results=[];
    // Split into lines, detect separator
    const lines=text.split('\n').map(l=>l.trim()).filter(l=>l.length>0);
    if(lines.length<2)return[];
    // Detect separator: tab or comma
    const sep=lines[0].includes('\t')?'\t':lines[0].split(',').length>3?',':null;
    if(!sep)return[];
    // Split all rows
    const rows=lines.map(l=>l.split(sep).map(c=>c.trim()));
    // Find header rows and data sections
    // Multiple tables can be pasted — detect by header rows containing keywords
    const bankKeywords=['bank name','bank','category','account type','branch','last 4','digits','account name'];
    const cardKeywords=['card name','network','visa','mastercard','amex','credit limit','billing','rewards','provider'];
    const investKeywords=['platform','broker','stocks','crypto','funds','mutual','securities','approx value'];
    const simKeywords=['network','sim','phone','recharge','provider'];
    const isHeader=(row)=>{
      const text=row.join(' ').toLowerCase();
      return bankKeywords.some(k=>text.includes(k))||cardKeywords.some(k=>text.includes(k))||investKeywords.some(k=>text.includes(k));
    };
    let currentType=null;let headers=[];let dataRows=[];
    const flush=()=>{
      if(!headers.length||!dataRows.length)return;
      const bankH=headers.join(' ').toLowerCase();
      const isBank=bankKeywords.some(k=>bankH.includes(k))&&!cardKeywords.some(k=>bankH.includes(k));
      const isCard=cardKeywords.some(k=>bankH.includes(k));
      const isInvest=investKeywords.some(k=>bankH.includes(k));
      // Map columns
      const getCol=(row,keywords)=>{
        for(const kw of keywords){
          const ci=headers.findIndex(h=>h.toLowerCase().includes(kw.toLowerCase()));
          if(ci>=0&&row[ci]&&row[ci].trim()&&row[ci].trim()!=='-')return row[ci].trim();
        }
        return '';
      };
      dataRows.forEach(row=>{
        if(!row||row.every(c=>!c.trim()))return;
        if(row.join('').trim().length<2)return;
        if(isCard){
          const provider=getCol(row,['provider','issuer','bank']);
          const cardName=getCol(row,['card name','name']);
          const network=getCol(row,['network','visa','mastercard','amex']);
          const last4=getCol(row,['last 4','digits','last4','****']);
          const limit=getCol(row,['credit limit','limit']);
          const rewards=getCol(row,['rewards','reward type']);
          const notes=getCol(row,['notes','note','category']);
          if(provider||cardName){
            const name=(provider&&cardName)?provider+' '+cardName:(provider||cardName);
            results.push({type:'card',confidence:'high',data:{
              cardName:name,
              network:network&&['visa','mastercard','amex'].find(n=>network.toLowerCase().includes(n))?network.charAt(0).toUpperCase()+network.slice(1):'',
              last4:last4&&last4.length<=4?last4:'',
              category:notes||rewards||'',
              cardType:bankH.includes('bnpl')||notes.toLowerCase().includes('bnpl')?'BNPL':'Credit',
            }});
          }
        } else if(isInvest){
          const country=getCol(row,['country']);
          const broker=getCol(row,['platform','broker','company']);
          const type=getCol(row,['type','stocks','crypto','funds']);
          const email=getCol(row,['email','account email']);
          const val=getCol(row,['value','approx value']);
          const term=getCol(row,['term','long','short']);
          if(broker){
            results.push({type:'investment',confidence:'high',data:{
              investmentName:broker+(type?' — '+type:''),
              broker,type:type||'Stocks',currency:'USD',
              country:country||'',amountInvested:0,
            }});
          }
        } else {
          // Bank (default)
          const bankName=getCol(row,['bank name','bank','name','company']);
          const acType=getCol(row,['account type','type','account name']);
          const category=getCol(row,['category','size','big','small','digital','islamic']);
          const last4=getCol(row,['last 4','digits','last4']);
          const phone=getCol(row,['phone','mobile','registered phone']);
          const email=getCol(row,['email','registered email']);
          const notes=getCol(row,['notes','note']);
          const branch=getCol(row,['branch']);
          if(bankName&&bankName.length>1){
            // Determine currency from context
            const rowText=row.join(' ').toLowerCase();
            const currency=rowText.includes('pkr')||rowText.includes('pakistan')?'PKR':rowText.includes('gbp')||rowText.includes('gbp')||bankH.includes('uk')?'GBP':rowText.includes('aed')||rowText.includes('uae')?'AED':'USD';
            // Determine bank type
            const bankType=category.toLowerCase().includes('islamic')?'islamic':category.toLowerCase().includes('digital')?'digital':category.toLowerCase().includes('big')?'commercial':'commercial';
            results.push({type:'bank',confidence:'high',data:{
              bankName:bankName+(acType&&acType!==bankName?' ('+acType+')':''),
              bankType,
              accountType:acType||'Current',
              currency,last4:last4||'',
              phone:phone||'',email:email||'',
              notes:(notes||branch?[notes,branch].filter(Boolean).join(' · '):''),
              country:rowText.includes('pakistan')||rowText.includes('ubL')||category.toLowerCase().includes('pk')?'PK':rowText.includes('uae')||rowText.includes('mashreq')?'AE':'GB',
              favorite:getCol(row,['priority']).toLowerCase()==='high',
            }});
          }
        }
      });
    };
    for(const row of rows){
      if(isHeader(row)){
        flush();headers=row;dataRows=[];
      } else {
        if(headers.length>0)dataRows.push(row);
      }
    }
    flush();
    return[...new Map(results.map(r=>[JSON.stringify(r.data),r])).values()];
  },
  parseOCRText(text){
    const results=[];const all=text.replace(/\n/g,' ');
    // Card number detection
    const cardNums=all.match(/\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g)||[];
    cardNums.forEach(cn=>{
      const last4=cn.replace(/[\s\-]/g,'').slice(-4);
      const exp=all.match(/(0[1-9]|1[0-2])[\/\-](\d{2,4})/);
      let net='',name='';
      if(/amex|american express/i.test(all))net='American Express';
      else if(/visa/i.test(all))net='Visa';
      else if(/mastercard|master card/i.test(all))net='Mastercard';
      BANKS_DB.forEach(b=>{if(new RegExp(b.n.split(' ')[0],'i').test(all)&&b.n.split(' ')[0].length>2)name=b.n;});
      results.push({type:'card',confidence:'high',data:{cardName:(name||'Detected')+' Card',network:net,last4,expiry:exp?exp[1]+'/'+(exp[2].length===4?exp[2].slice(-2):exp[2]):'',cardType:'Credit'}});
    });
    // IBAN / account number
    const ibans=all.match(/\b[A-Z]{2}\d{2}[\sA-Z0-9]{4,30}\b/g)||[];
    ibans.forEach(ib=>{
      const cc=ib.slice(0,2);const country=COUNTRIES.find(x=>x.c===cc);
      if(country)results.push({type:'bank',confidence:'medium',data:{bankName:country.n+' Bank Account',country:cc,iban:ib.replace(/\s/g,''),currency:cc==='GB'?'GBP':cc==='AE'?'AED':cc==='PK'?'PKR':''}});
    });
    // Phone numbers → SIM
    const phones=all.match(/\+?(\d[\s\-]?){10,15}/g)||[];
    phones.filter(p=>p.replace(/\D/g,'').length>=10).forEach(ph=>{
      const digits=ph.replace(/\D/g,'');
      let cc='',net='';
      if(digits.startsWith('92')||digits.startsWith('0092'))cc='PK';
      else if(digits.startsWith('44')||digits.startsWith('0044'))cc='GB';
      else if(digits.startsWith('971'))cc='AE';
      if(cc)results.push({type:'sim',confidence:'medium',data:{network:'Detected '+COUNTRIES.find(x=>x.c===cc)?.n+' SIM',country:cc,phone:ph.trim(),status:'Active',simType:'Physical'}});
    });
    // Email addresses
    const emails=all.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g)||[];
    emails.forEach(em=>{
      let prov='Other';
      if(/@gmail/i.test(em))prov='Gmail';else if(/@hotmail|@outlook/i.test(em))prov='Outlook / Hotmail';
      else if(/@icloud|@me\.com|@mac\.com/i.test(em))prov='Apple iCloud Mail';else if(/@proton/i.test(em))prov='ProtonMail';
      results.push({type:'email',confidence:'high',data:{email:em,provider:prov,purpose:'Detected',mfaEnabled:false}});
    });
    // Subscription keywords
    const subs=SUBS_DB.filter(s=>new RegExp(s.n.replace(/[+.]/g,'\\$&'),'i').test(all));
    subs.forEach(s=>{const amt=all.match(new RegExp(s.n+'.*?\\$?€?£?(\\d+\\.?\\d*)','i'));results.push({type:'expense',confidence:'medium',data:{name:s.n,icon:s.ic,category:s.c,amount:amt?parseFloat(amt[1]):0,currency:'GBP',active:true}});});
    return [...new Map(results.map(r=>[JSON.stringify(r.data),r])).values()];
  },
  guessType(line){
    const l=line.toLowerCase();
    if(/bank|iban|account|bic|swift/.test(l))return {type:'bank',confidence:'low',data:{bankName:line.slice(0,40),country:'',currency:''}};
    if(/card|visa|mastercard|credit|debit/.test(l))return {type:'card',confidence:'low',data:{cardName:line.slice(0,40),network:''}};
    if(/netflix|spotify|amazon|apple|google/.test(l))return {type:'expense',confidence:'low',data:{name:line.slice(0,30),amount:0,active:true}};
    return null;
  },
  showResults(results, rawText=''){
    const el=document.getElementById('ie-results');if(!el)return;
    if(!results.length){el.style.display='block';el.innerHTML='<div class="empty"><div class="empty-ic">🔍</div><h3>Nothing detected</h3><p>Try a clearer image or paste the text manually below</p></div>';return;}
    const typeIc={card:'💳',bank:'🏦',sim:'📱',email:'📧',expense:'🔄',gadget:'💻'};
    el.style.display='block';
    el.innerHTML=`<div class="widget"><div class="wh"><span>✨</span>Detected ${results.length} item${results.length>1?'s':''} — review & import</div>
    ${results.map((r,i)=>`<div style="background:var(--glass);border:1px solid var(--border);border-radius:14px;margin-bottom:8px;overflow:hidden">
      <div style="display:flex;align-items:center;gap:10px;padding:12px 14px">
        <input type="checkbox" id="ie-check-${i}" checked style="width:18px;height:18px;accent-color:var(--accent);flex-shrink:0">
        <div style="font-size:20px;flex-shrink:0">${typeIc[r.type]||'📋'}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--accent);letter-spacing:.5px">${r.type} · <span style="color:${r.confidence==='high'?'var(--ok)':r.confidence==='medium'?'var(--warn)':'var(--text3)'}">${r.confidence}</span></div>
          <div style="font-size:13px;font-weight:600;margin-top:2px">${Object.values(r.data).filter(Boolean)[0]||'—'}</div>
        </div>
        <button onclick="this.closest('div').nextElementSibling.style.display=this.closest('div').nextElementSibling.style.display==='none'?'block':'none';this.textContent=this.textContent==='✏️'?'▲':'✏️'" style="background:var(--glass2);border:1px solid var(--border);border-radius:8px;padding:5px 10px;cursor:pointer;font-size:13px;color:var(--text2)">✏️</button>
      </div>
      <div style="display:none;padding:0 14px 12px;border-top:1px solid var(--border);background:var(--glass)">
        ${Object.entries(r.data).map(([k,v])=>`<div style="margin-bottom:6px"><label style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text3);display:block;margin-bottom:3px">${k}</label><input class="inp" value="${String(v||'').replace(/"/g,'&quot;')}" oninput="ImportEngine._results[${i}].data['${k}']=this.value" style="padding:7px 10px;font-size:12px"></div>`).join('')}
      </div>
    </div>`).join('')}
    <button class="btn btn-p btn-full" onclick="ImportEngine.importSelected(${JSON.stringify(results).replace(/"/g,'&quot;')})">✅ Import Selected Items</button>
    </div>`;
    ImportEngine._results=results;
  },
  importSelected(results){
    if(!results)results=this._results;
    const checks=document.querySelectorAll('[id^="ie-check-"]');
    let count=0;
    results.forEach((r,i)=>{
      if(checks[i]&&!checks[i].checked)return;
      const id=U.id(),ts=new Date().toISOString();
      if(r.type==='card'&&r.data.cardName)S.cards.push({id,...r.data,issuer:r.data.cardName.split(' ')[0],createdAt:ts});
      else if(r.type==='bank'&&r.data.bankName)S.banks.push({id,...r.data,accountType:'Current',createdAt:ts});
      else if(r.type==='sim'&&r.data.network)S.sims.push({id,...r.data,createdAt:ts});
      else if(r.type==='email'&&r.data.email)S.emails.push({id,...r.data,createdAt:ts});
      else if(r.type==='expense'&&r.data.name)S.expenses.push({id,...r.data,icon:r.data.icon||'🔄',createdAt:ts});
      count++;
    });
    Store.save();Activity.log('Smart import',''+count+' items from import engine');
    Toast.show('Imported '+count+' items — review in each module','success');
    document.getElementById('ie-results').style.display='none';
    document.getElementById('ie-status').style.display='none';
  }
};

const Links={
  getOptions(excludeId=''){
    const opts=[];
    const add=(arr,type,ic)=>arr.forEach(x=>{if(x.id!==excludeId)opts.push({id:x.id,type,ic,label:(x.name||x.bankName||x.cardName||x.network||x.email||x.serviceName||x.investmentName||'Unnamed')});});
    add(S.banks,'bank','🏦');add(S.cards,'card','💳');add(S.investments,'inv','📈');
    add(S.sims,'sim','📱');add(S.assets,'asset','🏠');add(S.expenses,'expense','🔄');
    add(S.emails,'email','📧');add(S.gadgets,'gadget','💻');add(S.digital,'digital','💼');
    return opts;
  },
  openLinkModal(entryId, entryType, entryArr){
    const entry=entryArr.find(x=>x.id===entryId);if(!entry)return;
    const linked=entry.linkedIds||[];
    const opts=this.getOptions(entryId);
    Modal.open('🔗 Link Related Items',`
    <p style="font-size:12px;color:var(--text2);margin-bottom:12px">Connect related entries — property with insurance, card with bank, device with email account...</p>
    <div style="max-height:340px;overflow-y:auto;display:flex;flex-direction:column;gap:7px">
      ${opts.map(o=>`<label style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--glass);border-radius:10px;cursor:pointer;border:1px solid var(--border)">
        <input type="checkbox" ${linked.includes(o.id)?'checked':''} data-lid="${o.id}" style="width:18px;height:18px;accent-color:var(--accent)">
        <span style="font-size:18px">${o.ic}</span>
        <div><div style="font-size:13px;font-weight:500">${o.label}</div><div style="font-size:11px;color:var(--text3)">${o.type}</div></div>
      </label>`).join('') || '<div style="text-align:center;color:var(--text3);font-size:13px;padding:20px">No other entries to link to yet</div>'}
    </div>`,
    `<button class="btn btn-g" onclick="Modal.close()">Cancel</button>
     <button class="btn btn-p" onclick="Links.savLinks('${entryId}',${JSON.stringify(entryArr===S.banks?'banks':entryArr===S.cards?'cards':entryArr===S.investments?'investments':entryArr===S.sims?'sims':entryArr===S.assets?'assets':entryArr===S.expenses?'expenses':entryArr===S.emails?'emails':entryArr===S.gadgets?'gadgets':'digital')})">Save Links</button>`);
  },
  savLinks(entryId, arrName){
    const arr=S[arrName];const entry=arr.find(x=>x.id===entryId);if(!entry)return;
    entry.linkedIds=[...document.querySelectorAll('[data-lid]:checked')].map(c=>c.dataset.lid);
    Store.save();Modal.close();Toast.show('Links saved — '+entry.linkedIds.length+' connected','success');
  },
  renderLinked(entry){
    if(!entry.linkedIds?.length)return '';
    const linked=entry.linkedIds.map(id=>{
      const allArr=[...S.banks,...S.cards,...S.investments,...S.sims,...S.assets,...S.expenses,...S.emails,...S.gadgets,...S.digital];
      const found=allArr.find(x=>x.id===id);
      return found?{label:found.name||found.bankName||found.cardName||found.network||found.email||found.serviceName||'Entry'}:null;
    }).filter(Boolean);
    if(!linked.length)return '';
    return `<div style="margin-top:8px"><div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">🔗 Linked</div><div style="display:flex;flex-wrap:wrap;gap:5px">${linked.map(l=>`<span style="padding:3px 10px;border-radius:99px;background:var(--glass2);border:1px solid var(--border);font-size:11px;color:var(--text2)">${l.label}</span>`).join('')}</div></div>`;
  }
};

const BackupCenter={
  render(){
    const b=document.getElementById('backupBody');if(!b)return;
    const lastBackup=S.user.lastBackup;
    const backupAge=lastBackup?Math.floor((Date.now()-new Date(lastBackup))/864e5):null;
    const backupStatus=!lastBackup?'Never backed up':backupAge===0?'Backed up today':backupAge<=7?'Backed up '+backupAge+' day'+(backupAge>1?'s':'')+' ago':'⚠️ Last backup '+backupAge+' days ago';
    const backupOk=lastBackup&&backupAge<=7;
    const history=JSON.parse(localStorage.getItem('vos_backup_history')||'[]');
    b.innerHTML=`
    <!-- STATUS HERO -->
    <div class="hero" style="text-align:center;margin-bottom:14px">
      <div style="font-size:44px;margin-bottom:10px">${backupOk?'✅':'⚠️'}</div>
      <div style="font-size:18px;font-weight:700;margin-bottom:4px">${backupOk?'Vault Protected':'Backup Recommended'}</div>
      <div style="font-size:13px;color:var(--text2)">${backupStatus}</div>
      ${!backupOk?'<div style="font-size:12px;color:var(--err);margin-top:6px">Your vault data exists only on this device</div>':''}
    </div>
    <!-- BACKUP OPTIONS -->
    <div class="set-sec"><div class="set-title">Create Backup</div><div class="set-card">
      <div class="si" onclick="BackupCenter.exportVOS()" style="cursor:pointer">
        <div style="display:flex;align-items:center;gap:12px;flex:1">
          <div style="width:40px;height:40px;border-radius:10px;background:var(--glow);display:flex;align-items:center;justify-content:center;font-size:20px">🔐</div>
          <div class="sil"><div class="name">Encrypted Vault (.vos)</div><div class="desc">AES-256-GCM encrypted — recommended</div></div>
        </div><span style="color:var(--accent);font-size:13px;font-weight:600">Export →</span>
      </div>
      <div class="si" onclick="ExIm.export('json')" style="cursor:pointer">
        <div style="display:flex;align-items:center;gap:12px;flex:1">
          <div style="width:40px;height:40px;border-radius:10px;background:var(--glass2);display:flex;align-items:center;justify-content:center;font-size:20px">📄</div>
          <div class="sil"><div class="name">Plain JSON</div><div class="desc">Human-readable — keep secure!</div></div>
        </div><span style="color:var(--text2);font-size:13px">Export →</span>
      </div>
      <div class="si" onclick="ExIm.export('csv')" style="cursor:pointer">
        <div style="display:flex;align-items:center;gap:12px;flex:1">
          <div style="width:40px;height:40px;border-radius:10px;background:var(--glass2);display:flex;align-items:center;justify-content:center;font-size:20px">📊</div>
          <div class="sil"><div class="name">CSV Spreadsheet</div><div class="desc">For reference — no passwords exported</div></div>
        </div><span style="color:var(--text2);font-size:13px">Export →</span>
      </div>
      <div class="si" onclick="ExIm.share()" style="cursor:pointer">
        <div style="display:flex;align-items:center;gap:12px;flex:1">
          <div style="width:40px;height:40px;border-radius:10px;background:var(--glass2);display:flex;align-items:center;justify-content:center;font-size:20px">📲</div>
          <div class="sil"><div class="name">Share via AirDrop / Files</div><div class="desc">iOS share sheet — sends encrypted .vos</div></div>
        </div><span style="color:var(--text2);font-size:13px">Share →</span>
      </div>
    </div></div>
    <!-- RESTORE -->
    <div class="set-sec"><div class="set-title">Restore</div><div class="set-card">
      <div class="si" onclick="document.getElementById('importF-global').click()" style="cursor:pointer">
        <div style="display:flex;align-items:center;gap:12px;flex:1">
          <div style="width:40px;height:40px;border-radius:10px;background:var(--glass2);display:flex;align-items:center;justify-content:center;font-size:20px">📥</div>
          <div class="sil"><div class="name">Import / Restore Backup</div><div class="desc">Merge .vos, .json, or CSV into vault</div></div>
        </div><span style="color:var(--accent);font-size:13px;font-weight:600">Import →</span>
      </div>
    </div></div>
    <!-- BACKUP TIPS -->
    <div class="set-sec"><div class="set-title">Backup Strategy</div><div class="set-card">
      ${[
        {ic:'☁️',t:'iCloud Drive',d:'Export .vos → save to Files → iCloud Drive'},
        {ic:'📦',t:'Google Drive',d:'Export .vos → upload manually to Drive'},
        {ic:'💽',t:'External SSD / USB',d:'Drag .vos file to external drive'},
        {ic:'💻',t:'Mac / Windows',d:'AirDrop or USB transfer — files app'},
        {ic:'🗄️',t:'NAS / Home Server',d:'Transfer .vos via Wi-Fi file sharing'},
      ].map(({ic,t,d})=>`<div class="si"><div style="display:flex;align-items:center;gap:10px;flex:1"><span style="font-size:22px">${ic}</span><div class="sil"><div class="name">${t}</div><div class="desc">${d}</div></div></div></div>`).join('')}
      <div style="padding:12px 16px;font-size:11px;color:var(--text3);line-height:1.6;border-top:1px solid var(--border)">🔐 All exports are encrypted with AES-256-GCM before leaving your device. No cloud servers involved. Only you hold the key (derived from your PIN).</div>
    </div></div>
    <!-- BACKUP HISTORY -->
    ${history.length?`<div class="set-sec"><div class="set-title">Export History</div><div class="set-card">
      ${history.slice(0,8).map(h=>`<div class="si"><div class="sil"><div class="name">${h.type} backup</div><div class="desc">${new Date(h.date).toLocaleString('en-GB')}</div></div><span class="badge b-ok">Done</span></div>`).join('')}
    </div></div>`:''}
    <!-- DATA SUMMARY -->
    <div class="set-sec" style="margin-bottom:40px"><div class="set-title">What Gets Backed Up</div><div class="set-card">
      ${[...ALL_MODULES.map(m=>[m.n,S[m.id]?.length||0,m.ic]),['Activity log',S.activity.length,'📋'],['Custom tags',S.tags.length,'🏷️']].map(([n,c,ic])=>`<div class="si"><div style="display:flex;align-items:center;gap:8px;flex:1"><span>${ic}</span><div class="name">${n}</div></div><span style="font-weight:700;color:var(--accent)">${c}</span></div>`).join('')}
      <div class="si"><div class="name">Total entries</div><div style="font-weight:800;font-size:16px;color:var(--accent)">${ALL_MODULES.reduce((a,m)=>a+(S[m.id]?.length||0),0)}</div></div>
    </div></div>`;
  },
  exportVOS(){
    ExIm.export('vault');
    const h=JSON.parse(localStorage.getItem('vos_backup_history')||'[]');
    h.unshift({type:'Encrypted .vos',date:new Date().toISOString()});
    localStorage.setItem('vos_backup_history',JSON.stringify(h.slice(0,20)));
    setTimeout(()=>this.render(),500);
  }
};

const RecoveryCenter={
  render(){
    const b=document.getElementById('recoveryBody');if(!b)return;
    const raw=btoa(unescape(encodeURIComponent(S.pin+':'+S.user.name+':VaultOS3')));
    const masterKey=(raw.replace(/[^A-Za-z0-9]/g,'').slice(0,6)+'-'+raw.slice(4,10).toUpperCase()+'-'+raw.slice(10,16).toUpperCase()).toUpperCase();
    b.innerHTML=`
    <!-- MASTER KEY -->
    <div class="hero" style="margin-bottom:14px">
      <div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text3);margin-bottom:8px">🗝️ Emergency Master Key</div>
      <div style="font-size:11px;color:var(--text2);margin-bottom:14px;line-height:1.6">This key can unlock your vault if you forget your PIN. It is mathematically derived from your PIN and name — it is NOT stored anywhere on this device or any server. Write it down now.</div>
      <div id="masterKeyDisplay" style="font-size:20px;font-weight:900;letter-spacing:5px;color:var(--accent);text-align:center;padding:18px;background:rgba(0,0,0,.4);border-radius:12px;font-family:var(--mono);filter:blur(8px);cursor:pointer;transition:filter .3s" onclick="this.style.filter='none';document.getElementById('rc-copy').style.display='flex'" title="Tap to reveal">
        ${masterKey}
      </div>
      <div style="text-align:center;font-size:11px;color:var(--text3);margin-top:8px">Tap to reveal · Keep this private</div>
      <div id="rc-copy" style="display:none;gap:8px;margin-top:12px">
        <button class="btn btn-s btn-sm" style="flex:1" onclick="U.copy('${masterKey}','Master key')">📋 Copy</button>
        <button class="btn btn-s btn-sm" style="flex:1" onclick="RecoveryCenter.printKey('${masterKey}')">🖨️ Print Card</button>
      </div>
    </div>
    <!-- RECOVERY OPTIONS -->
    <div class="set-sec"><div class="set-title">Recovery Methods</div><div class="set-card">
      <div class="si" onclick="Settings.useMasterKey()" style="cursor:pointer"><div class="sil"><div class="name">Use Master Key</div><div class="desc">Enter master key to reset your PIN</div></div><button class="btn btn-g btn-sm">Enter Key →</button></div>
      <div class="si" onclick="document.getElementById('importF-global').click()" style="cursor:pointer"><div class="sil"><div class="name">Restore from Backup</div><div class="desc">Import .vos vault to recover data</div></div><button class="btn btn-g btn-sm">Import →</button></div>
      <div class="si" onclick="Settings.resetVault()" style="cursor:pointer"><div class="sil"><div class="name">Reset Vault</div><div class="desc">⚠️ Delete all data — cannot be undone</div></div><button class="btn btn-d btn-sm">Reset</button></div>
    </div></div>
    <!-- SECURITY CHECKLIST -->
    <div class="set-sec"><div class="set-title">Recovery Checklist</div><div class="set-card">
      ${[
        {done:S.user.name,label:'Name set',tip:'Required for master key derivation'},
        {done:S.pin!=='123456',label:'Custom PIN set',tip:'Change from default PIN 123456'},
        {done:!!S.decoyPin,label:'Decoy PIN configured',tip:'Shows fake vault under coercion'},
        {done:!!S.user.lastBackup,label:'Vault backed up',tip:'Export encrypted backup to safe location'},
        {done:S.autoLock,label:'Auto-lock enabled',tip:'Vault locks automatically when idle'},
      ].map(({done,label,tip})=>`<div class="si"><div style="display:flex;align-items:center;gap:10px;flex:1"><div class="status-dot ${done?'ok':'err'}"></div><div class="sil"><div class="name">${label}</div><div class="desc">${tip}</div></div></div>${done?'<span style="color:var(--ok);font-weight:700">✓</span>':'<span style="color:var(--err);font-size:11px">Needed</span>'}</div>`).join('')}
    </div></div>
    <!-- VAULT HEALTH -->
    <div class="set-sec" style="margin-bottom:40px"><div class="set-title">Vault Diagnostics</div><div class="set-card">
      ${[
        {label:'Schema version',val:'v'+SCHEMA_VERSION},
        {label:'Encryption',val:Crypto.available()?'AES-256-GCM ✅':'Basic'},
        {label:'Total entries',val:ALL_MODULES.reduce((a,m)=>a+(S[m.id]?.length||0),0)+''},
        {label:'Activity records',val:S.activity.length+''},
        {label:'Last backup',val:S.user.lastBackup?Activity.ago(S.user.lastBackup):'Never'},
        {label:'App version',val:'VaultOS v'+VER},
      ].map(({label,val})=>`<div class="si"><div class="name">${label}</div><div style="color:var(--text2);font-size:12px">${val}</div></div>`).join('')}
    </div></div>`;
  },
  printKey(key){
    const win=window.open('','_blank');
    if(!win)return;
    win.document.write(`<html><head><title>VaultOS Recovery Key</title><style>body{font-family:monospace;padding:40px;max-width:400px}h2{font-size:18px}p{font-size:12px;color:#666}.key{font-size:24px;font-weight:bold;letter-spacing:4px;padding:20px;border:2px solid #333;border-radius:8px;margin:20px 0}.warn{color:#c00;font-size:11px;margin-top:20px;border-top:1px solid #eee;padding-top:12px}</style></head><body><h2>🔐 VaultOS Emergency Recovery Key</h2><p>Generated: ${new Date().toLocaleString()}<br>Owner: ${S.user.name}</p><div class="key">${key}</div><p><strong>Instructions:</strong></p><ul><li>Open VaultOS and tap "Forgot PIN?"</li><li>Choose "Use Master Key"</li><li>Enter this code exactly</li></ul><div class="warn">⚠️ KEEP THIS CARD SECURE. Anyone with this key can reset your vault. Store in a safe place separate from your device.</div>`);
    win.print();
  }
};

const SelfCheck={
  errors:[],fixes:[],lastCheck:null,
  run(){
    this.errors=[];this.fixes=[];
    this.checkStateArrays();this.checkModuleFlags();
    this.checkCriticalDOM();this.checkDataIntegrity();
    this.autoRepair();this.lastCheck=new Date();
    if(this.errors.length)console.warn('[VaultOS SelfCheck]',this.errors);
    if(this.fixes.length)console.info('[VaultOS AutoFixed]',this.fixes);
    return{errors:this.errors,fixes:this.fixes};
  },
  checkStateArrays(){
    ['banks','cards','investments','sims','assets','expenses','emails','gadgets','digital','documents','activity','tags','wallet'].forEach(k=>{
      if(!Array.isArray(S[k])){this.errors.push('S.'+k+' corrupted');S[k]=[];this.fixes.push('Reset S.'+k);}
    });
  },
  checkModuleFlags(){
    ALL_MODULES.forEach(m=>{if(S.modules[m.id]===undefined){S.modules[m.id]=false;this.fixes.push('Module flag: '+m.id);}});
  },
  checkCriticalDOM(){
    if(!document.getElementById('importF-global')){
      const inp=document.createElement('input');inp.type='file';inp.id='importF-global';
      inp.accept='.vos,.vault,.json,.csv,.xlsx,.docx,.pdf,.txt';inp.style.display='none';
      inp.onchange=e=>ExIm.import(e);document.body.appendChild(inp);
      this.fixes.push('Created importF-global');
    }
  },
  checkDataIntegrity(){
    ['banks','cards','investments','sims','assets','expenses','emails','gadgets','digital'].forEach(k=>{
      const before=(S[k]||[]).length;
      S[k]=(S[k]||[]).filter(x=>x&&typeof x==='object'&&x.id);
      if(S[k].length<before)this.fixes.push('Removed '+(before-S[k].length)+' invalid '+k);
    });
    if(!Array.isArray(S.documents))S.documents=[];
  },
  autoRepair(){if(this.fixes.length)Store.save();},
  renderReport(){
    const r=this.run();
    Modal.open('🔍 VaultOS Diagnostic',`
    <div style="font-size:11px;color:var(--text3);margin-bottom:10px">Checked: ${this.lastCheck?.toLocaleTimeString()}</div>
    ${r.errors.length?`<div style="margin-bottom:10px">${r.errors.map(e=>`<div style="padding:6px 10px;background:rgba(255,64,64,.1);border-radius:8px;margin-bottom:4px;font-size:12px">❌ ${e}</div>`).join('')}</div>`:'<div style="padding:10px;background:rgba(0,200,100,.1);border-radius:10px;color:var(--ok);font-weight:600;margin-bottom:10px">✅ All systems healthy</div>'}
    ${r.fixes.length?`<div>${r.fixes.map(f=>`<div style="padding:5px 10px;background:rgba(0,200,100,.1);border-radius:8px;margin-bottom:3px;font-size:12px">🔧 ${f}</div>`).join('')}</div>`:''}
    <div style="margin-top:12px;padding:10px;background:var(--glass);border-radius:10px">
      ${['banks','cards','investments','sims','assets','expenses','emails','gadgets','digital'].map(k=>`<div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0"><span style="color:var(--text2)">${k}</span><strong>${(S[k]||[]).length}</strong></div>`).join('')}
      <div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0"><span style="color:var(--text2)">documents</span><strong>${(S.documents||[]).length}</strong></div>
    </div>`,
    `<button class="btn btn-g" onclick="Modal.close()">Close</button><button class="btn btn-p" onclick="SelfCheck.renderReport()">Re-run</button>`);
  }
};

// ===================== SETTINGS NAV (tabbed settings) =====================
const SettingsNav = {
  current: 'profile',

  show(section) {
    this.current = section;
    if (typeof buildSettTabs === 'function') buildSettTabs();
    const order = ['profile','security','appearance','modules','backup','import','accessibility','about'];
    document.querySelectorAll('#settTabs .tab-pill').forEach((p, i) => p.classList.toggle('on', order[i] === section));
    const b = document.getElementById('settBody');
    if (!b) return;
    if (section === 'backup') { b.innerHTML = this._backup(); return; }
    if (section === 'import') { b.innerHTML = this._import(); return; }
    b.innerHTML = this['_' + section]();
    if (typeof SelfCheck !== 'undefined') SelfCheck.run();
  },

  _profile() {
    return `<div class="set-sec"><div class="set-title">👤 Profile</div><div class="set-card">
      <div class="si" onclick="Settings.editProfile()" style="cursor:pointer">
        <div style="display:flex;align-items:center;gap:12px;flex:1"><div style="width:44px;height:44px;border-radius:50%;background:var(--glass2);display:flex;align-items:center;justify-content:center;font-size:22px">${S.user.avatar||'💼'}</div><div><div class="name">${S.user.name||'User'}</div><div class="desc">${S.user.email||'Tap to edit profile'} ${S.user.phone?'· '+S.user.phone:''}</div></div></div><span style="color:var(--text3)">›</span>
      </div>
      <div class="si"><div class="sil"><div class="name">Default Currency</div><div class="desc">${S.user.currency||'PKR'}</div></div><button class="btn btn-g btn-sm" onclick="Settings.editProfile()">Edit</button></div>
      <div class="si"><div class="sil"><div class="name">Home Address</div><div class="desc">${S.user.homeAddr||'Not set'}</div></div><button class="btn btn-g btn-sm" onclick="Settings.editProfile()">Edit</button></div>
      <div class="si"><div class="sil"><div class="name">Work Address</div><div class="desc">${S.user.workAddr||'Not set'}</div></div><button class="btn btn-g btn-sm" onclick="Settings.editProfile()">Edit</button></div>
    </div></div>
    <div class="set-sec"><div class="set-title">📊 Data Summary</div><div class="set-card">
      ${[...(typeof ALL_MODULES!=='undefined'?ALL_MODULES:[]).map(m=>[m.n,S[m.id]?.length||0,m.ic]),['Activity',S.activity.length,'📋']].map(([n,c,ic])=>`<div class="si"><div class="name">${ic} ${n}</div><div style="font-weight:700;color:var(--accent)">${c}</div></div>`).join('')}
    </div></div>
    <div class="set-sec" style="margin-bottom:40px"><div class="set-title">⚙️ Data Management</div><div class="set-card">
      <div style="padding:12px 14px;display:flex;flex-direction:column;gap:8px">
        <button class="btn btn-s btn-full btn-sm" onclick="Settings.loadDemo()">🎮 Load Demo Data (fictional)</button>
        <button class="btn btn-g btn-full btn-sm" onclick="S.activity=[];Store.save();SettingsNav.show('profile');Toast.show('Activity cleared')">🗑️ Clear Activity Log</button>
        <button class="btn btn-d btn-full btn-sm" onclick="Settings.resetVault()">⚠️ Reset Entire Vault</button>
      </div>
    </div></div>`;
  },

  _security() {
    return `<div class="set-sec"><div class="set-title">🔒 Security</div><div class="set-card">
      <div class="si"><div class="sil"><div class="name">Change PIN</div><div class="desc">Update your 6-digit vault PIN</div></div><button class="btn btn-g btn-sm" onclick="Settings.changePIN()">Change</button></div>
      <div class="si"><div class="sil"><div class="name">Master Key</div><div class="desc">Emergency bypass — store this somewhere safe</div></div><button class="btn btn-g btn-sm" onclick="Settings.showMasterKey()">View</button></div>
      <div class="si"><div class="sil"><div class="name">Decoy PIN</div><div class="desc">${(S.decoyPin||VaultDB?.hasDecoy||false)?'✅ Set — shows convincing fake vault':'Not set'}</div></div><button class="btn btn-g btn-sm" onclick="Settings.setDecoyPIN()">${(S.decoyPin||VaultDB?.hasDecoy||false)?'Change':'Set'}</button></div>
      <div class="si"><div class="sil"><div class="name">No PIN Mode</div><div class="desc">Open vault without PIN ⚠️</div></div><label class="tog"><input type="checkbox" ${S.noPin?'checked':''} onchange="S.noPin=this.checked;Store.save();Toast.show('No-PIN '+(S.noPin?'enabled':'disabled'))"><span class="ts"></span></label></div>
      <div class="si"><div class="sil"><div class="name">Auto-Lock</div><div class="desc">Lock vault when phone sleeps</div></div><label class="tog"><input type="checkbox" ${S.autoLock?'checked':''} onchange="S.autoLock=this.checked;Store.save()"><span class="ts"></span></label></div>
      <div class="si"><div class="sil"><div class="name">Lock Timeout</div></div><select class="inp btn-sm" style="width:auto;padding:5px 9px" onchange="S.lockMins=parseInt(this.value);Store.save()">${[1,5,10,30,60].map(m=>`<option value="${m}"${S.lockMins===m?' selected':''}>${m} min</option>`).join('')}<option value="0"${S.lockMins===0?' selected':''}>Never</option></select></div>
      <div class="si"><div class="sil"><div class="name">Clipboard Clear</div><div class="desc">Auto-clear after copying sensitive data</div></div><select class="inp btn-sm" style="width:auto;padding:5px 9px" onchange="S.clipSecs=parseInt(this.value);Store.save()">${[15,30,60,120].map(s=>`<option value="${s}"${S.clipSecs===s?' selected':''}>${s}s</option>`).join('')}</select></div>
      <div class="si"><div class="sil"><div class="name">Privacy Mode</div><div class="desc">Blur all sensitive values on screen</div></div><label class="tog"><input type="checkbox" ${S.privacyMode?'checked':''} onchange="S.privacyMode=this.checked;document.body.classList.toggle('privacy',S.privacyMode);Store.save()"><span class="ts"></span></label></div>
    </div></div>`;
  },

  _appearance() {
    return `<div class="set-sec"><div class="set-title">🎨 Appearance</div><div class="set-card">
      <div class="si"><div class="sil"><div class="name">Theme</div><div class="desc">${THEMES.find(t=>t.id===S.user.theme)?.n||'Midnight'}</div></div><button class="btn btn-g btn-sm" onclick="ThemeEngine.openPicker()">Change</button></div>
      <div class="si" style="flex-wrap:wrap;gap:8px"><div class="sil"><div class="name">Quick Switch</div></div><div style="display:flex;gap:7px;flex-wrap:wrap">${THEMES.map(t=>`<div class="tdot${t.id===S.user.theme?' on':''}" style="background:${t.ac}" onclick="ThemeEngine.apply('${t.id}')" title="${t.n}"></div>`).join('')}</div></div>
    </div></div>`;
  },

  _modules() {
    return `<div class="set-sec"><div class="set-title">🧩 Active Modules</div><div class="set-card">
      ${(typeof ALL_MODULES!=='undefined'?ALL_MODULES:[]).map(m=>`<div class="si"><div style="display:flex;align-items:center;gap:10px;flex:1"><span style="font-size:18px">${m.ic}</span><div class="sil"><div class="name">${m.n}</div><div class="desc">${m.desc}</div></div></div><label class="tog"><input type="checkbox" ${S.modules[m.id]?'checked':''} onchange="Settings.toggleMod('${m.id}',this.checked)"><span class="ts"></span></label></div>`).join('')}
      <div class="si"><div class="sil"><div class="name" style="font-size:12px;color:var(--text3)">Hidden modules stay in data but don't appear in navigation</div></div></div>
    </div></div>`;
  },

  _backup() {
    const lastBackup = S.user.lastBackup;
    const backupAge  = lastBackup ? Math.floor((Date.now()-new Date(lastBackup))/864e5) : null;
    const backupStatus = !lastBackup ? 'Never backed up' : backupAge===0 ? 'Backed up today' : backupAge<=7 ? 'Backed up '+backupAge+' days ago' : '⚠️ Last backup '+backupAge+' days ago';
    return `<div class="set-sec"><div class="set-title">💾 Backup & Export</div><div class="set-card">
      <div class="si"><div class="sil"><div class="name">Last Backup</div><div class="desc">${backupStatus}</div></div></div>
      <div style="padding:12px 14px;display:flex;flex-direction:column;gap:8px">
        <button class="btn btn-p btn-full btn-sm" onclick="ExIm.export('vault')">📤 Export Encrypted Vault (.vos)</button>
        <button class="btn btn-s btn-full btn-sm" onclick="ExIm.export('json')">📄 Export as JSON (readable)</button>
        <button class="btn btn-s btn-full btn-sm" onclick="ExIm.export('csv')">📊 Export as CSV (spreadsheet)</button>
        <button class="btn btn-g btn-full btn-sm" onclick="document.getElementById('importF-global').click()">📥 Import / Restore Vault</button>
        <button class="btn btn-g btn-full btn-sm" onclick="ExIm.share()">📲 Share via Files / AirDrop</button>
      </div>
    </div></div>
    <div class="set-sec" style="margin-bottom:40px"><div class="set-title">💡 Backup Strategy</div><div class="set-card">
      ${[{ic:'☁️',t:'iCloud Drive',d:'Export .vos → save to Files → iCloud Drive'},{ic:'📦',t:'Google Drive',d:'Export .vos → upload manually to Drive'},{ic:'💽',t:'External Drive / USB',d:'Drag .vos file to external drive'}].map(({ic,t,d})=>`<div class="si"><span style="font-size:22px">${ic}</span><div class="sil"><div class="name">${t}</div><div class="desc">${d}</div></div></div>`).join('')}
      <div style="padding:10px 14px;font-size:11px;color:var(--text3);line-height:1.6;border-top:1px solid var(--border)">🔐 All exports are AES-256-GCM encrypted before leaving your device. No cloud servers involved.</div>
    </div></div>`;
  },

  _import() {
    return `<div class="set-sec" style="margin-bottom:40px"><div class="set-title">📥 Import</div><div class="set-card">
      <div class="si" onclick="R.goto('import')" style="cursor:pointer"><div style="display:flex;align-items:center;gap:12px;flex:1"><div style="font-size:28px">📥</div><div class="sil"><div class="name">Smart Import Engine</div><div class="desc">Paste text, drop files, scan images — VaultOS detects and imports entries automatically</div></div></div><span style="color:var(--accent);font-size:16px">→</span></div>
      <div class="si" onclick="R.goto('ai-import')" style="cursor:pointer"><div style="display:flex;align-items:center;gap:12px;flex:1"><div style="font-size:28px">🤖</div><div class="sil"><div class="name">AI Import (Smart Pattern Matching)</div><div class="desc">Advanced pattern engine — detect banks, cards, SIMs, investments from any text snippet</div></div></div><span style="color:var(--accent);font-size:16px">→</span></div>
      <div class="si" onclick="document.getElementById('importF-global').click()" style="cursor:pointer"><div style="display:flex;align-items:center;gap:12px;flex:1"><div style="font-size:28px">🔒</div><div class="sil"><div class="name">Restore Vault Backup</div><div class="desc">Import a .vos encrypted backup file or JSON export</div></div></div><span style="color:var(--accent);font-size:16px">→</span></div>
    </div></div>`;
  },

  _accessibility() {
    return `<div class="set-sec"><div class="set-title">♿ Accessibility</div><div class="set-card">
      <div class="si"><div class="sil"><div class="name">Privacy Mode</div><div class="desc">Blur all sensitive values on screen</div></div><label class="tog"><input type="checkbox" ${S.privacyMode?'checked':''} onchange="S.privacyMode=this.checked;document.body.classList.toggle('privacy',S.privacyMode);Store.save()"><span class="ts"></span></label></div>
      <div class="si"><div class="sil"><div class="name">Reduce Motion</div><div class="desc">Minimize animations throughout the app</div></div><label class="tog"><input type="checkbox" ${S.reduceMotion?'checked':''} onchange="S.reduceMotion=this.checked;document.body.classList.toggle('reduce-motion',S.reduceMotion);Store.save();Toast.show('Reduce motion '+(S.reduceMotion?'on':'off'))"><span class="ts"></span></label></div>
      <div class="si"><div class="sil"><div class="name">Large Text</div><div class="desc">Slightly increase base font size</div></div><label class="tog"><input type="checkbox" ${S.largeText?'checked':''} onchange="S.largeText=this.checked;document.documentElement.style.fontSize=S.largeText?'17px':'15px';Store.save();Toast.show('Large text '+(S.largeText?'on':'off'))"><span class="ts"></span></label></div>
    </div></div>`;
  },

  _about() {
    return `<div class="set-sec" style="margin-bottom:40px"><div class="set-title">ℹ️ About VaultOS</div><div class="set-card">
      ${[['Version','v4.0 — Enterprise Edition'],['Storage','Local device only — never sent anywhere'],['Encryption','AES-256-GCM (Web Crypto API)'],['Created by','Shamikh Ahmed'],['Demo PIN','123456']].map(([k,v])=>`<div class="si"><div class="name">${k}</div><div style="color:var(--text2);font-size:12px;text-align:right;flex:1">${v}</div></div>`).join('')}
      <div class="si"><div class="name" style="font-size:12px;color:var(--text3)">💡 Tip: On iPhone — open in Safari → Share → Add to Home Screen for the full app experience</div></div>
      <div style="padding:10px 14px;display:flex;flex-direction:column;gap:8px">
        <button class="btn btn-g btn-full btn-sm" onclick="SelfCheck.renderReport()">🔍 Run Diagnostics</button>
        <button class="btn btn-g btn-full btn-sm" onclick="WhatsNew.show()">✨ What's New</button>
      </div>
    </div></div>`;
  }
};
