function renderAlerts(){
  const b=document.getElementById('alertBody');if(!b)return;
  const expCards=S.cards.filter(c=>{const s=U.expSt(c.expiry);return s!=='ok';});
  const simR=S.sims.filter(s=>s.rechargeReminder&&s.nextRecharge);
  const insR=S.assets.filter(a=>a.assetType==='insurance'&&a.renewalDate);
  const subR=S.expenses.filter(e=>e.renewalDate&&e.active);
  const mortgProp=S.assets.filter(a=>a.assetType==='property'&&a.mortgType&&a.mortgType!=='None'&&a.mortgBalance>0);
  const warnGadgets=S.gadgets.filter(g=>g.warranty&&new Date(g.warranty)<new Date(Date.now()+30*864e5));
  const loansDue=S.assets.filter(a=>a.assetType==='loan'&&a.dueDate&&new Date(a.dueDate)<new Date(Date.now()+7*864e5));
  const noSec=S.emails.filter(e=>!e.mfaEnabled);
  const noAlerts=[expCards,simR,insR,subR,warnGadgets,loansDue].every(a=>!a.length);
  b.innerHTML=`
  ${expCards.length?`<div class="set-sec"><div class="set-title">💳 Card Expiry</div><div class="set-card">${expCards.map(c=>`<div class="si"><div class="sil"><div class="name">${c.cardName}</div><div class="desc">Expires ${c.expiry}</div></div>${U.expBadge(c.expiry)}<button class="btn btn-g btn-sm" onclick="Cards.edit('${c.id}')">Update</button></div>`).join('')}</div></div>`:''}
  ${simR.length?`<div class="set-sec"><div class="set-title">📱 SIM Recharge</div><div class="set-card">${simR.map(s=>`<div class="si"><div class="sil"><div class="name">${s.network} (${U.flag(s.country)})</div><div class="desc">Recharge by ${s.nextRecharge}</div></div><button class="btn btn-g btn-sm" onclick="Sims.edit('${s.id}')">Update</button></div>`).join('')}</div></div>`:''}
  ${insR.length?`<div class="set-sec"><div class="set-title">🛡️ Insurance Renewals</div><div class="set-card">${insR.map(a=>`<div class="si"><div class="sil"><div class="name">${a.name}</div><div class="desc">${a.insuranceType||''} · Renews ${a.renewalDate}</div></div><button class="btn btn-g btn-sm" onclick="Assets.edit('${a.id}')">Update</button></div>`).join('')}</div></div>`:''}
  ${subR.length?`<div class="set-sec"><div class="set-title">🔄 Subscription Renewals</div><div class="set-card">${subR.map(e=>`<div class="si"><div class="sil"><div class="name">${e.icon||'🔄'} ${e.name}</div><div class="desc">Renews ${e.renewalDate} · ${e.currency||''} ${U.fmt(e.amount)}/mo</div></div><button class="btn btn-g btn-sm" onclick="Exp.edit('${e.id}')">Update</button></div>`).join('')}</div></div>`:''}
  ${warnGadgets.length?`<div class="set-sec"><div class="set-title">💻 Warranty Expiring (30 days)</div><div class="set-card">${warnGadgets.map(g=>`<div class="si"><div class="sil"><div class="name">${g.ic||'💻'} ${g.name}</div><div class="desc">Warranty expires ${new Date(g.warranty).toLocaleDateString('en-GB')}</div></div><button class="btn btn-g btn-sm" onclick="Gadgets.edit('${g.id}')">Update</button></div>`).join('')}</div></div>`:''}
  ${loansDue.length?`<div class="set-sec"><div class="set-title">💰 Loans Due Soon</div><div class="set-card">${loansDue.map(a=>`<div class="si"><div class="sil"><div class="name">${a.name}</div><div class="desc">Due ${a.dueDate} · ${a.currency||''} ${U.fmt(a.loanBalance||0)} outstanding</div></div><button class="btn btn-g btn-sm" onclick="Assets.edit('${a.id}')">Update</button></div>`).join('')}</div></div>`:''}
  ${mortgProp.length?`<div class="set-sec"><div class="set-title">🏦 Mortgage Overview</div><div class="set-card">${mortgProp.map(a=>`<div class="si"><div class="sil"><div class="name">${a.name}</div><div class="desc">${a.mortgLender||''} · ${a.currency||''} ${U.fmt(a.mortgBalance)} outstanding · ${a.mortgRate||0}% rate</div></div><span class="badge b-warn">${a.currency||''} ${U.fmt(a.mortgPayment||0)}/mo</span></div>`).join('')}</div></div>`:''}
  ${noSec.length?`<div class="set-sec"><div class="set-title">🔒 Security — Emails Without 2FA</div><div class="set-card">${noSec.map(e=>`<div class="si"><div class="sil"><div class="name">${e.email}</div><div class="desc">${e.purpose||''} — No 2FA enabled</div></div><button class="btn btn-g btn-sm" onclick="Emails.edit('${e.id}')">Fix</button></div>`).join('')}</div></div>`:''}
  ${noAlerts&&!noSec.length?'<div class="empty"><div class="empty-ic">✅</div><h3>All clear!</h3><p>No alerts right now. Keep your details updated to stay on top of renewals and reminders.</p></div>':''}`;
}
