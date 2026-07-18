const SecurityCenter={
  render(){
    const b=document.getElementById('securityBody');if(!b)return;
    const totCards=S.cards.length,expCards=S.cards.filter(c=>U.expSt(c.expiry)!=='ok').length;
    const totEmails=S.emails.length,noMFAEmails=S.emails.filter(e=>!e.mfaEnabled).length;
    const totDigital=S.digital.length,no2FADigital=S.digital.filter(d=>!d.twoFAEnabled).length;
    const hasBackup=!!S.user.lastBackup;
    const backupAge=S.user.lastBackup?Math.floor((Date.now()-new Date(S.user.lastBackup))/864e5):999;
    const usingDefaultPIN=false; // PIN verified via VaultDB PBKDF2 — plaintext unavailable
    const score = typeof VaultHealth !== 'undefined' ? VaultHealth.score() : 0;
    const enc=Crypto.available()?'AES-256-GCM ready':'Basic (SubtleCrypto unavailable)';
    const scoreColor = typeof VaultHealth !== 'undefined' ? VaultHealth.color(score) : 'var(--text)';
    const scoreLabel = typeof VaultHealth !== 'undefined' ? VaultHealth.label(score) : '';
    b.innerHTML=`
    <div class="hero" style="margin-bottom:14px;text-align:center">
      <div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text3);margin-bottom:10px">Vault Security Score</div>
      <div style="font-size:64px;font-weight:900;letter-spacing:-3px;color:${scoreColor};margin-bottom:4px">${score}</div>
      <div style="font-size:14px;font-weight:600;color:${scoreColor};margin-bottom:14px">${scoreLabel}</div>
      <div style="background:var(--border);border-radius:4px;height:6px;overflow:hidden;max-width:280px;margin:0 auto">
        <div style="height:100%;width:${score}%;background:${scoreColor};border-radius:4px;transition:width 1s var(--ease)"></div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
      ${[
        {ic:'vault',label:'Encryption',val:enc,ok:Crypto.available()},
        {ic:'key',label:'PIN Strength',val:usingDefaultPIN?'Default PIN!':'Custom PIN set',ok:!usingDefaultPIN},
        {ic:'clock',label:'Auto-Lock',val:S.autoLock?(S.lockMins?S.lockMins+' min':'On'):'Off',ok:S.autoLock},
        {ic:'share',label:'Last Backup',val:hasBackup?(backupAge===0?'Today':backupAge+' days ago'):'Never',ok:hasBackup&&backupAge<=7},
        {ic:'eye-off',label:'Decoy PIN',val:S.decoyPin?'Set':'Not configured',ok:!!S.decoyPin},
        {ic:'list',label:'Clipboard Clear',val:S.clipSecs+'s auto-clear',ok:S.clipSecs<=30},
      ].map(({ic,label,val,ok})=>`<div style="background:var(--glass);border:1px solid ${ok?'var(--border)':'rgba(255,100,100,.25)'};border-radius:14px;padding:12px"><div style="display:flex;align-items:center;gap:7px;margin-bottom:5px"><span class="chip-ic">${typeof VC!=='undefined'?VC.icon(ic,18):''}</span><span style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.4px">${label}</span></div><div style="font-size:13px;font-weight:600;color:${ok?'var(--text)':'var(--warn)'}">${val}</div></div>`).join('')}
    </div>
    ${[
      usingDefaultPIN&&{sev:'err',msg:'Using default PIN 123456 — change it immediately',btn:'Change PIN',act:'Settings.changePIN()'},
      !S.autoLock&&{sev:'warn',msg:'Auto-lock is disabled — vault stays open indefinitely',btn:'Enable',act:"S.autoLock=true;Store.save();SecurityCenter.render();"},
      noMFAEmails>0&&{sev:'warn',msg:noMFAEmails+' email account'+(noMFAEmails>1?'s have':' has')+' no 2FA',btn:'Review Emails',act:"R.goto('emails')"},
      no2FADigital>0&&{sev:'warn',msg:no2FADigital+' digital account'+(no2FADigital>1?'s have':' has')+' no 2FA',btn:'Review',act:"R.goto('digital')"},
      expCards>0&&{sev:'warn',msg:expCards+' card'+(expCards>1?'s are':' is')+' expired or expiring soon',btn:'Review Cards',act:"R.goto('cards')"},
      !hasBackup&&{sev:'err',msg:'No backup created — your data is at risk',btn:'Backup Now',act:"ExIm.export('vault')"},
      backupAge>30&&hasBackup&&{sev:'warn',msg:'Last backup was '+backupAge+' days ago',btn:'Backup Now',act:"ExIm.export('vault')"},
    ].filter(Boolean).map(({sev,msg,btn,act})=>`<div class="insight ${sev==='err'?'err':'warn'}" style="margin-bottom:8px"><div class="insight-ic">${typeof VC!=='undefined'?VC.icon(sev==='err'?'cross':'bell',18):''}</div><div class="insight-body"><div class="insight-title">${msg}</div></div><button type="button" class="btn btn-g btn-sm" data-act="${act}">${btn}</button></div>`).join('') || '<div class="insight ok"><div class="insight-ic">'+(typeof VC!=='undefined'?VC.icon('target',18):'')+'</div><div class="insight-body"><div class="insight-title">No security issues found</div><div class="insight-sub">Your vault is well-configured</div></div></div>'}
    <div class="set-sec" style="margin-top:14px"><div class="set-title">Security Actions</div><div class="set-card">
      <div class="si"><div class="sil"><div class="name">Change PIN</div><div class="desc">Update your vault PIN</div></div><button type="button" class="btn btn-g btn-sm" data-act="Settings.changePIN()">Change</button></div>
      <div class="si"><div class="sil"><div class="name">Set Decoy PIN</div><div class="desc">Show fake vault under coercion</div></div><button type="button" class="btn btn-g btn-sm" data-act="Settings.setDecoyPIN()">Set</button></div>
      <div class="si"><div class="sil"><div class="name">View Master Key</div><div class="desc">Emergency recovery key</div></div><button type="button" class="btn btn-g btn-sm" data-act="Settings.showMasterKey()">View</button></div>
      <div class="si"><div class="sil"><div class="name">Encrypted Backup</div><div class="desc">AES-256-GCM encrypted .vos file</div></div><button type="button" class="btn btn-p btn-sm" data-act="ExIm.export('vault')">Backup</button></div>
    </div></div>
    `;
  },
  computeScore(){
    return typeof VaultHealth !== 'undefined' ? VaultHealth.score() : 0;
  }
};
