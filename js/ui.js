const Dash={
  render(){
    const h=new Date().getHours();
    const greet=h<5?'🌙 Good Night':h<12?'🌅 Good Morning':h<17?'☀️ Good Afternoon':'🌆 Good Evening';
    const el=document.getElementById('dashGreet');
    if(el)el.innerHTML=`<span>${greet}, <strong>${S.user.name||'User'}</strong></span>`;
    const dl=document.getElementById('dashDate');
    if(dl)dl.textContent=new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    const b=document.getElementById('dashBody');
    const totalInv=S.investments.reduce((a,i)=>a+(i.amountInvested||0),0);
    const curInv=S.investments.reduce((a,i)=>a+(i.currentValue||0),0);
    const pnl=curInv-totalInv;
    const exp=S.cards.filter(c=>{const s=U.expSt(c.expiry);return s!=='ok';});
    const wCards=S.cards.filter(c=>S.wallet.includes(c.id));
    const monthlyExp=S.expenses.filter(e=>e.active).reduce((a,e)=>a+(parseFloat(e.amount)||0),0);
    const simRem=S.sims.filter(s=>s.rechargeReminder&&s.status==='Active');
    // Stats
    const modStats=ALL_MODULES.filter(m=>S.modules[m.id]).map(m=>`<div class="stat-card" onclick="R.goto('${m.id}')"><div class="sc-ic">${m.ic}</div><div class="sc-n">${S[m.id]?.length||0}</div><div class="sc-l">${m.n}</div></div>`).join('');
    // Donut data
    const allocData=[
      {l:'Investments',v:curInv,col:'#0080ff'},{l:'Assets',v:S.assets.reduce((a,x)=>a+(x.currentValue||0),0),col:'#10b981'},
      {l:'Other',v:S.user.netWorth*0.15,col:'#d4af37'}
    ].filter(d=>d.v>0);
    const totAlloc=allocData.reduce((a,d)=>a+d.v,0)||1;
    const donutSVG=this.donut(allocData,totAlloc);
    const secScore=this.security();
    b.innerHTML=`
    <div class="hero">
      <div class="hero-label">Net Worth</div>
      <div class="hero-amount sens">${S.user.currency} ${U.fmt(S.user.netWorth)}</div>
      <div class="hero-sub sens">${totalInv>0?`Portfolio ${U.fmt(curInv)} · P&L ${pnl>=0?'+':''}${U.fmt(Math.round(pnl))}`:'Add investments to track your portfolio'}</div>
      <div class="hero-acts">
        <button class="btn btn-p btn-sm" onclick="Dash.editNW()">✏️ Update</button>
        <button class="btn btn-s btn-sm" onclick="Dash.snap()">📸 Snapshot</button>
        <button class="btn btn-s btn-sm" onclick="ExIm.export('vault')">📤 Backup</button>
      </div>
    </div>
    <div class="stat-row">${modStats}</div>
    ${S.modules.cards&&wCards.length>0?`<div class="widget"><div class="wh"><span>👝</span>Carrying Today<button class="btn btn-g btn-sm wh-act" onclick="Dash.editWallet()">Edit</button></div><div class="wallet-row">${wCards.map(c=>this.miniCard(c)).join('')}</div></div>`:`<div class="widget"><div class="wh"><span>👝</span>Wallet — Today's Cards<button class="btn btn-g btn-sm wh-act" onclick="Dash.editWallet()">Edit</button></div><div style="font-size:12px;color:var(--text3);padding:4px 0">No cards selected — tap Edit to choose cards you're carrying today</div></div>`}
    ${allocData.length>0?`<div class="widget"><div class="wh"><span>📊</span>Asset Allocation</div><div class="donut-wrap"><svg width="84" height="84" viewBox="0 0 84 84">${donutSVG}</svg><div class="dl">${allocData.map(d=>`<div class="dli"><div class="dld" style="background:${d.col}"></div><div class="dlk">${d.l}</div><div class="dlv">${((d.v/totAlloc)*100).toFixed(0)}%</div></div>`).join('')}</div></div></div>`:''}
    ${S.modules.expenses&&monthlyExp>0?`<div class="widget"><div class="wh"><span>📋</span>Monthly Fixed Expenses</div><div style="font-size:28px;font-weight:900;color:var(--accent)">${U.fmt(Math.round(monthlyExp))} <span style="font-size:14px;color:var(--text3);font-weight:400">${S.user.currency}/mo</span></div><div style="font-size:12px;color:var(--text3);margin-top:2px">${U.fmt(Math.round(monthlyExp*12))}/year · ${S.expenses.filter(e=>e.active).length} active</div></div>`:''}
    ${exp.length>0?`<div class="widget"><div class="wh"><span>⚠️</span>Card Expiry Alerts</div>${exp.map(c=>`<div class="insight err"><div class="insight-ic">💳</div><div class="insight-body"><div class="insight-title">${c.cardName}</div><div class="insight-sub">Expires ${c.expiry}</div></div>${U.expBadge(c.expiry)}</div>`).join('')}</div>`:''}
    ${simRem.length>0?`<div class="widget"><div class="wh"><span>📱</span>SIM Recharge Reminders</div>${simRem.map(s=>`<div class="insight warn"><div class="insight-ic">📱</div><div class="insight-body"><div class="insight-title">${s.network}</div><div class="insight-sub">Recharge by ${s.nextRecharge||'soon'}</div></div><button class="btn btn-g btn-sm" onclick="Sims.edit('${s.id}')">Edit</button></div>`).join('')}</div>`:''}
    <div class="widget"><div class="wh"><span>🛡️</span>Vault Security</div><div style="display:flex;gap:14px;align-items:center"><div class="sring"><svg width="72" height="72" viewBox="0 0 72 72"><circle cx="36" cy="36" r="28" fill="none" stroke="var(--border2)" stroke-width="6"/><circle cx="36" cy="36" r="28" fill="none" stroke="var(--accent)" stroke-width="6" stroke-linecap="round" stroke-dasharray="${secScore*1.759} 1000" transform="rotate(-90 36 36)"/></svg><div class="snum">${secScore}</div></div><div style="flex:1;font-size:12px;color:var(--text2);line-height:1.7">${secScore>=85?'🔒 Excellent security!':secScore>=70?'⚠️ Good — consider enabling more protections':'❌ Review your security settings'}</div></div></div>
    ${S.activity.length>0?`<div class="widget" style="margin-bottom:0"><div class="wh"><span>📋</span>Recent Activity</div>${S.activity.slice(0,6).map(a=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--border)"><div><div style="font-size:12px;font-weight:500">${a.a}</div>${a.d?`<div style="font-size:11px;color:var(--text3)">${a.d}</div>`:''}</div><div style="font-size:10px;color:var(--text3)">${Activity.ago(a.t)}</div></div>`).join('')}</div>`:''}`;
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
  security(){let s=50;if(S.autoLock)s+=15;if(S.lockMins<=10)s+=10;if(S.clipSecs<=30)s+=10;if(S.banks.length)s+=5;if(S.cards.length)s+=5;if(S.pin!=='123456')s+=5;return Math.min(s,100);}
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
      <div class="si"><div class="sil"><div class="name">Decoy PIN</div><div class="desc">${S.decoyPin?'✅ Set — shows convincing fake vault':'Not set'}</div></div><button class="btn btn-g btn-sm" onclick="Settings.setDecoyPIN()">${S.decoyPin?'Change':'Set'}</button></div>
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
      ${[...ALL_MODULES.map(m=>[m.n,S[m.id]?.length||0,m.ic]),['Activity',S.activity.length,'📋']].map(([n,c,ic])=>`<div class="si"><div class="name">${ic} ${n}</div><div style="font-weight:700;color:var(--accent)">${c}</div></div>`).join('')}
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
    if(o!==S.pin){document.getElementById('cp-err').textContent='Current PIN incorrect';return;}
    if(!/^\d{6}$/.test(n)){document.getElementById('cp-err').textContent='New PIN must be 6 digits';return;}
    if(n!==c){document.getElementById('cp-err').textContent='PINs do not match';return;}
    S.pin=n;Store.save();Modal.close();Activity.log('PIN changed');Toast.show('PIN updated successfully!','success');
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
    S.decoyPin=p;Store.save();Modal.close();this.render();Toast.show('Decoy PIN set — entering it shows empty vault','success');
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
    Store.clear();
    // Clear all caches
    if(window.caches)caches.keys().then(keys=>keys.forEach(k=>caches.delete(k)));
    Toast.show('Vault cleared — reloading...','warning',1500);
    setTimeout(()=>location.reload(),1600);
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
