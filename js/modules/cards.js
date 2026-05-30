const Cards={
  render(){
    const q=(document.getElementById('cQ')?.value||'').toLowerCase();
    const sort=document.getElementById('cSort')?.value||'name';
    const f=S.cF;
    const chips=[['all','All'],['credit','Credit'],['debit','Debit'],['amex','Amex'],['visa','Visa'],['mc','MC'],['crypto','₿ Crypto'],['bnpl','BNPL'],['expiring','⚠️ Exp.'],['fav','⭐']];
    const ci=document.getElementById('cChips');
    if(ci)ci.innerHTML=chips.map(([v,l])=>`<div class="chip${v===f?' on':''}" onclick="S.cF='${v}';Cards.render()">${l}</div>`).join('');
    const we=document.getElementById('cWallet');
    const wc=S.cards.filter(c=>S.wallet.includes(c.id));
    if(we)we.innerHTML=wc.length>0?`<div class="widget"><div class="wh"><span>👝</span>Carrying Today<button class="btn btn-g btn-sm wh-act" onclick="Dash.editWallet()">Edit</button></div><div class="wallet-row">${wc.map(c=>Dash.miniCard(c,114)).join('')}</div></div>`:'';
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
    if(!data.length){el.innerHTML=`<div class="empty-ios"><div class="ei-ic">💳</div><div class="ei-title">No Cards Yet</div><div class="ei-sub">Add your debit, credit, or digital cards here</div><button class="btn btn-p" onclick="Cards.openAdd()">+ Add Card</button></div>`;return;}
    const byNet={};data.forEach(c=>{(byNet[c.network||'Other']=byNet[c.network||'Other']||[]).push(c);});
    el.innerHTML=Object.entries(byNet).map(([net,items])=>`<div class="sdiv">${net} <span style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--text3)">(${items.length})</span></div>${items.map(c=>this.row(c)).join('')}`).join('');
    initSwipeDelete(el);
    initLongPress(el, id => {
      const c = S.cards.find(x => x.id === id); if (!c) return [];
      return [
        {label:'Edit', icon:'✏️', action: () => Cards.edit(id)},
        {label:'View Details', icon:'👁️', action: () => Cards.openDetail(id)},
        {label:'Toggle Carry', icon:'👝', action: () => Cards.toggleCarry(id)},
        {label:'Delete', icon:'🗑️', destructive: true, action: () => Cards.del(id)},
      ];
    });
  },
  row(c){
    const carrying=S.wallet.includes(c.id);
    const gradient=cardGradient(c);
    const last4=c.last4||'????';
    const holderName=((c.holderName||S.user&&S.user.name||'CARDHOLDER')+'').toUpperCase().slice(0,22);
    const bankName=c.issuer||((c.cardName||'').split(' ')[0]);
    const logo=bankLogo(c.cardName||bankName,c.country);
    const typeLabel=(c.cardType||'CARD').toUpperCase();
    const chip='<svg width="36" height="28" viewBox="0 0 36 28"><rect width="36" height="28" rx="4" fill="#d4a017"/><rect x="13" y="0" width="10" height="28" fill="#b8860b" opacity="0.5"/><rect x="0" y="9" width="36" height="10" fill="#b8860b" opacity="0.5"/><rect x="13" y="9" width="10" height="10" fill="#ffd700" opacity="0.8"/></svg>';
    const netSvg={
      'Visa':'<svg viewBox="0 0 100 32" width="48" height="16"><text x="0" y="26" font-family="Arial" font-weight="900" font-size="32" fill="white" letter-spacing="-2">VISA</text></svg>',
      'Mastercard':'<div style="position:relative;width:40px;height:24px;flex-shrink:0"><div style="position:absolute;left:0;width:24px;height:24px;border-radius:50%;background:rgba(235,0,27,.9)"></div><div style="position:absolute;left:14px;width:24px;height:24px;border-radius:50%;background:rgba(255,95,0,.9)"></div></div>',
      'American Express':'<svg width="40" height="16"><text y="13" font-family="Arial" font-weight="700" font-size="11" fill="white">AMEX</text></svg>',
      'UnionPay':'<svg width="40" height="16"><text y="13" font-family="Arial" font-weight="700" font-size="11" fill="white">UnionPay</text></svg>',
    };
    const carryGlow=carrying?';box-shadow:0 8px 32px rgba(0,0,0,.4),0 0 0 2.5px rgba(255,255,255,.45),inset 0 1px 0 rgba(255,255,255,.15)':'';
    return `<div class="wallet-card sens" data-id="${c.id}" onclick="Cards.openDetail('${c.id}')" style="background:${gradient}${carryGlow}">
  <div class="wc-top">
    <div class="wc-bank">${logo}<span>${bankName}</span></div>
    <div class="wc-type">${typeLabel}${carrying?' 👝':''}</div>
  </div>
  <div class="wc-chip">${chip}</div>
  <div class="wc-number">**** **** **** ${last4}</div>
  <div class="wc-bottom">
    <div class="wc-holder">${holderName}</div>
    <div class="wc-exp">${c.expiry?'Exp '+c.expiry:''}</div>
    <div class="wc-net">${netSvg[c.network]||''}</div>
  </div>
  <div class="wc-actions">
    <button class="wc-act-btn" onclick="event.stopPropagation();Cards.toggleCarry('${c.id}')" title="Toggle carry">👝</button>
    <button class="wc-act-btn" onclick="event.stopPropagation();Cards.edit('${c.id}')" title="Edit">✏️</button>
    <button class="wc-act-btn" onclick="event.stopPropagation();Cards.del('${c.id}')" title="Delete">🗑️</button>
  </div>
</div>`;
  },
  toggleCarry(id){if(S.wallet.includes(id))S.wallet=S.wallet.filter(x=>x!==id);else S.wallet.push(id);Store.save();this.render();Toast.show(S.wallet.includes(id)?'Added to wallet':'Removed from wallet','info',1500);},
  openAdd(){
    Modal.open('💳 Add Card',
      `<div style="margin-bottom:12px"><button class="btn btn-g btn-full" onclick="Cards.scanCard()" style="gap:8px">📷 Scan Card with Camera</button></div>` + this.form(),
      `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Cards.save()">Save</button>`
    );
  },

  // ── Camera scan (QR auto + manual capture for OCR) ────────────────────────
  scanCard(){
    const overlay=document.createElement('div');
    overlay.style.cssText='position:fixed;inset:0;z-index:2000;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;';
    overlay.innerHTML=[
      '<div style="position:relative;width:100%;max-width:400px">',
      '<video id="_scanVid" autoplay playsinline style="width:100%;border-radius:12px;display:block"></video>',
      '<div style="position:absolute;inset:0;border:2px solid rgba(255,255,255,.25);border-radius:12px;pointer-events:none"></div>',
      '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);border:2px solid rgba(100,200,255,.7);width:82%;height:56%;border-radius:8px;pointer-events:none"></div>',
      '</div>',
      '<canvas id="_scanCanvas" style="display:none"></canvas>',
      '<div id="_scanStatus" style="color:rgba(255,255,255,.85);font-size:13px;margin-top:16px;text-align:center;padding:0 24px;line-height:1.5">Point camera at card face · QR auto-detects</div>',
      '<div style="display:flex;gap:12px;margin-top:20px">',
      '<button id="_scanCaptureBtn" onclick="Cards._doCapture()" style="padding:14px 32px;background:var(--accent,#6c63ff);border:none;border-radius:99px;color:#fff;font-size:15px;font-weight:700;cursor:pointer;min-width:140px">📷 Capture</button>',
      '<button onclick="Cards._stopScan()" style="padding:14px 24px;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);border-radius:99px;color:#fff;font-size:14px;font-weight:600;cursor:pointer">Cancel</button>',
      '</div>'
    ].join('');
    document.body.appendChild(overlay);
    Cards._scanOverlay=overlay;
    navigator.mediaDevices&&navigator.mediaDevices.getUserMedia({video:{facingMode:'environment',width:{ideal:1280},height:{ideal:720}}}).then(function(stream){
      const vid=document.getElementById('_scanVid');
      if(!vid)return;
      vid.srcObject=stream;
      Cards._scanStream=stream;
      Cards._scanInterval=setInterval(function(){
        const canvas=document.getElementById('_scanCanvas');
        const v=document.getElementById('_scanVid');
        if(!v||!v.videoWidth||!canvas)return;
        canvas.width=v.videoWidth;canvas.height=v.videoHeight;
        canvas.getContext('2d').drawImage(v,0,0);
        const imgData=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height);
        const qr=window.jsQR&&window.jsQR(imgData.data,imgData.width,imgData.height);
        if(qr)Cards._onScanResult(qr.data);
      },2000);
    }).catch(function(){overlay.remove();Toast.show('Camera not available','warning');});
  },
  _stopScan(){
    clearInterval(Cards._scanInterval);
    if(Cards._scanStream)Cards._scanStream.getTracks().forEach(function(t){t.stop();});
    if(Cards._scanOverlay)Cards._scanOverlay.remove();
  },
  _doCapture(){
    const vid=document.getElementById('_scanVid');
    const canvas=document.getElementById('_scanCanvas');
    const statusEl=document.getElementById('_scanStatus');
    const btn=document.getElementById('_scanCaptureBtn');
    if(!vid||!vid.videoWidth||!canvas)return;
    canvas.width=vid.videoWidth;canvas.height=vid.videoHeight;
    canvas.getContext('2d').drawImage(vid,0,0);
    const imgData=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height);
    const qr=window.jsQR&&window.jsQR(imgData.data,imgData.width,imgData.height);
    if(qr){Cards._onScanResult(qr.data);return;}
    const key=S.user&&S.user.claudeKey;
    if(!key){Cards._stopScan();Toast.show('Add Claude API key in Settings to use OCR','warning',4000);return;}
    if(btn){btn.disabled=true;btn.textContent='⏳ Reading…';}
    if(statusEl)statusEl.textContent='Sending to Claude AI — please wait…';
    const base64=canvas.toDataURL('image/jpeg',0.7).split(',')[1];
    fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:256,messages:[{role:'user',content:[
        {type:'image',source:{type:'base64',media_type:'image/jpeg',data:base64}},
        {type:'text',text:'Extract card details from this image. Return JSON only: {"cardNumber":"","expiryDate":"","cardholderName":"","network":"","last4":""} or null if no card visible.'}
      ]}]})
    }).then(function(resp){
      if(!resp.ok)throw new Error(resp.statusText);
      return resp.json();
    }).then(function(data){
      const raw=(data.content&&data.content[0]&&data.content[0].text)||'';
      let parsed=null;
      try{parsed=JSON.parse(raw.trim());}catch(e){const m=raw.match(/\{[\s\S]*\}/);if(m)try{parsed=JSON.parse(m[0]);}catch(e2){}}
      if(parsed&&typeof parsed==='object'){
        Cards._stopScan();
        Cards._fillFromOCR(parsed);
      }else{
        if(btn){btn.disabled=false;btn.textContent='📷 Capture';}
        if(statusEl)statusEl.textContent='No card detected — adjust and try again';
      }
    }).catch(function(e){
      Cards._stopScan();
      Toast.show('OCR error: '+e.message,'error',4000);
    });
  },
  _onScanResult(raw){
    Cards._stopScan();
    const digits=raw.replace(/\D/g,'');
    const last4=digits.slice(-4);
    const first=digits.charAt(0);
    const network=first==='4'?'Visa':first==='5'?'Mastercard':(raw.startsWith('34')||raw.startsWith('37'))?'American Express':raw.startsWith('62')?'UnionPay':'';
    const nEl=document.getElementById('cf-net');if(nEl&&network){nEl.value=network;nEl.style.outline='2px solid var(--info)';nEl.style.outlineOffset='2px';}
    const l4El=document.getElementById('cf-l4');if(l4El&&last4){l4El.value=last4;l4El.style.outline='2px solid var(--info)';l4El.style.outlineOffset='2px';}
    Toast.show('Detected: '+(network||'Card')+' ****'+(last4||'?'),'success',3000);
  },
  _fillFromOCR(data){
    const digits=(data.cardNumber||'').replace(/\D/g,'');
    const last4=data.last4||(digits.length>=4?digits.slice(-4):'');
    const network=data.network||(digits.charAt(0)==='4'?'Visa':digits.charAt(0)==='5'?'Mastercard':'');
    const hi='outline:2px solid var(--info);outline-offset:2px';
    const nEl=document.getElementById('cf-net');if(nEl&&network){nEl.value=network;nEl.style.cssText+=hi;}
    const l4El=document.getElementById('cf-l4');if(l4El&&last4){l4El.value=last4;l4El.style.cssText+=hi;}
    const expEl=document.getElementById('cf-exp');if(expEl&&data.expiryDate){expEl.value=data.expiryDate;expEl.style.cssText+=hi;}
    const holderEl=document.getElementById('cf-holder');if(holderEl&&data.cardholderName){holderEl.value=data.cardholderName;holderEl.style.cssText+=hi;}
    Toast.show('Card scanned: '+(network||'Card')+' ****'+(last4||'?'),'success',3000);
  },

  // ── Photo capture (front + back) ──────────────────────────────────────────
  _capturePhoto(targetId){
    const overlay=document.createElement('div');
    overlay.style.cssText='position:fixed;inset:0;z-index:2001;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;';
    overlay.innerHTML=[
      '<video id="_photoVid" autoplay playsinline style="width:100%;max-width:400px;border-radius:12px;display:block"></video>',
      '<canvas id="_photoCanvas" style="display:none"></canvas>',
      '<div id="_photoStatus" style="color:rgba(255,255,255,.8);font-size:13px;margin-top:14px;text-align:center">Position card in frame then tap Capture</div>',
      '<div style="display:flex;gap:12px;margin-top:18px">',
      '<button onclick="Cards._doPhotoCapture(\''+targetId+'\')" style="padding:14px 32px;background:var(--accent,#6c63ff);border:none;border-radius:99px;color:#fff;font-size:15px;font-weight:700;cursor:pointer">📷 Capture</button>',
      '<button onclick="Cards._stopPhoto()" style="padding:14px 24px;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);border-radius:99px;color:#fff;font-size:14px;cursor:pointer">Cancel</button>',
      '</div>'
    ].join('');
    document.body.appendChild(overlay);
    Cards._photoOverlay=overlay;
    navigator.mediaDevices&&navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}).then(function(stream){
      const vid=document.getElementById('_photoVid');
      if(!vid)return;
      vid.srcObject=stream;
      Cards._photoStream=stream;
    }).catch(function(){overlay.remove();Toast.show('Camera not available','warning');});
  },
  _stopPhoto(){
    if(Cards._photoStream)Cards._photoStream.getTracks().forEach(function(t){t.stop();});
    if(Cards._photoOverlay)Cards._photoOverlay.remove();
  },
  _doPhotoCapture(targetId){
    const vid=document.getElementById('_photoVid');
    const canvas=document.getElementById('_photoCanvas');
    if(!vid||!vid.videoWidth||!canvas)return;
    canvas.width=vid.videoWidth;canvas.height=vid.videoHeight;
    canvas.getContext('2d').drawImage(vid,0,0);
    let quality=0.6;
    let dataUrl=canvas.toDataURL('image/jpeg',quality);
    while(dataUrl.length>270000&&quality>0.2){quality-=0.1;dataUrl=canvas.toDataURL('image/jpeg',quality);}
    Cards._stopPhoto();
    const base64=dataUrl.split(',')[1];
    const thumbEl=document.getElementById('cf-photo-'+targetId);
    if(thumbEl){
      thumbEl.innerHTML='<img src="'+dataUrl+'" style="width:100%;max-width:120px;border-radius:8px;border:2px solid var(--accent);cursor:pointer;margin-top:6px" onclick="Cards._viewPhotoData(\''+targetId+'\')" title="Tap to view full size">';
      thumbEl.dataset.photo=base64;
    }
    const key=S.user&&S.user.claudeKey;
    if(!key){Toast.show('Photo saved — add API key in Settings for auto-fill','info',3000);return;}
    Toast.show('Reading card…','info',2000);
    fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:256,messages:[{role:'user',content:[
        {type:'image',source:{type:'base64',media_type:'image/jpeg',data:base64}},
        {type:'text',text:'Extract card details from this image. Return JSON only: {"cardNumber":"","expiryDate":"","cardholderName":"","network":"","last4":""} or null if no card visible.'}
      ]}]})
    }).then(function(resp){
      if(!resp.ok)throw new Error(resp.statusText);
      return resp.json();
    }).then(function(data){
      const raw=(data.content&&data.content[0]&&data.content[0].text)||'';
      let parsed=null;
      try{parsed=JSON.parse(raw.trim());}catch(e){const m=raw.match(/\{[\s\S]*\}/);if(m)try{parsed=JSON.parse(m[0]);}catch(e2){}}
      if(parsed&&typeof parsed==='object')Cards._fillFromOCR(parsed);
      else Toast.show('Could not read automatically — please fill in manually','info',3500);
    }).catch(function(e){Toast.show('OCR failed: '+e.message,'warning',3000);});
  },
  _viewPhotoData(targetId){
    const thumbEl=document.getElementById('cf-photo-'+targetId);
    const b64=thumbEl&&thumbEl.dataset&&thumbEl.dataset.photo;
    if(!b64)return;
    const v=document.createElement('div');
    v.style.cssText='position:fixed;inset:0;z-index:3000;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;cursor:pointer';
    v.onclick=function(){v.remove();};
    v.innerHTML='<img src="data:image/jpeg;base64,'+b64+'" style="max-width:95vw;max-height:90vh;border-radius:12px;object-fit:contain">';
    document.body.appendChild(v);
  },
  _viewPhotoB64(base64){
    const v=document.createElement('div');
    v.style.cssText='position:fixed;inset:0;z-index:3000;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;cursor:pointer';
    v.onclick=function(){v.remove();};
    v.innerHTML='<img src="data:image/jpeg;base64,'+base64+'" style="max-width:95vw;max-height:90vh;border-radius:12px;object-fit:contain">';
    document.body.appendChild(v);
  },

  form(c={}){
    const isEdit=!!c.id;
    const isVirtual=(c.category||'').toLowerCase()==='virtual'||(c.category||'').toLowerCase()==='digital';
    const cardNames=SMART_DB.cards.map(x=>'<option value="'+x.name+'">').join('');
    return '<datalist id="cardDL">'+cardNames+'</datalist>'
      +'<datalist id="cfNetDL"><option>Visa</option><option>Mastercard</option><option>American Express</option><option>JCB</option><option>UnionPay</option></datalist>'
      +'<div class="fg"><label class="fl">Card Name *</label><input class="inp" id="cf-name" list="cardDL" placeholder="e.g. Amex Gold, Sadapay…" autocomplete="off" oninput="SMART_DB.fillCard(this.value)" value="'+(c.cardName||'')+'"></div>'
      +'<div class="fr"><div class="fg"><label class="fl">Network *</label><input class="inp" id="cf-net" value="'+(c.network||'')+'" list="cfNetDL" placeholder="Visa, Mastercard…"></div><div class="fg"><label class="fl">Last 4 Digits</label><input class="inp" id="cf-l4" value="'+(c.last4||'')+'" maxlength="4" inputmode="numeric" placeholder="1234"></div></div>'
      +'<div style="margin:10px 0;display:flex;gap:10px;align-items:flex-start;flex-wrap:wrap">'
      +'<div><button type="button" class="btn btn-g btn-sm" onclick="Cards._capturePhoto(\'front\')" style="gap:6px">📷 Front</button><div id="cf-photo-front" style="margin-top:4px">'+(c.frontPhoto?'<img src="data:image/jpeg;base64,'+c.frontPhoto+'" style="width:100%;max-width:120px;border-radius:8px;border:2px solid var(--accent);cursor:pointer;margin-top:6px" onclick="Cards._viewPhotoB64(\''+c.frontPhoto+'\')" title="Tap to view">':'')+'</div></div>'
      +(isVirtual?'':'<div><button type="button" class="btn btn-g btn-sm" onclick="Cards._capturePhoto(\'back\')" style="gap:6px">📷 Back</button><div id="cf-photo-back" style="margin-top:4px">'+(c.backPhoto?'<img src="data:image/jpeg;base64,'+c.backPhoto+'" style="width:100%;max-width:120px;border-radius:8px;border:2px solid var(--accent);cursor:pointer;margin-top:6px" onclick="Cards._viewPhotoB64(\''+c.backPhoto+'\')" title="Tap to view">':'')+'</div></div>')
      +'</div>'
      +'<details'+(isEdit?' open':'')+' style="margin-top:10px">'
      +'<summary style="cursor:pointer;font-size:12px;font-weight:700;color:var(--text2);padding:6px 0;list-style:none;display:flex;align-items:center;gap:6px"><span style="flex:1">More details</span><span style="font-size:10px;color:var(--text3)">▾</span></summary>'
      +'<div style="padding-top:10px">'
      +'<div class="fr"><div class="fg"><label class="fl">Type</label><datalist id="cfTypeDL"><option>Credit</option><option>Debit</option><option>Prepaid</option><option>Corporate</option><option>Virtual</option></datalist><input class="inp" id="cf-type" value="'+(c.cardType||'')+'" list="cfTypeDL" placeholder="Credit, Debit…"></div><div class="fg"><label class="fl">Category</label><datalist id="cfCatDL"><option>Standard</option><option>Premium</option><option>Travel</option><option>Cashback</option><option>Rewards</option><option>Business</option><option>Crypto</option><option>BNPL</option><option>Islamic</option><option>Digital</option><option>Virtual</option></datalist><input class="inp" id="cf-cat" value="'+(c.category||'')+'" list="cfCatDL" placeholder="Standard, Premium…"></div></div>'
      +'<div class="fr"><div class="fg"><label class="fl">Country</label><select class="inp" id="cf-cc">'+U.countries()+'</select></div><div class="fg"><label class="fl">Expiry (MM/YY)</label><input class="inp" id="cf-exp" value="'+(c.expiry||'')+'" placeholder="12/28" maxlength="5"></div></div>'
      +'<div class="fr"><div class="fg"><label class="fl">CVV</label><input class="inp" id="cf-cvv" value="'+(c.cvv||'')+'" maxlength="4" type="password" inputmode="numeric" placeholder="•••"></div><div class="fg"><label class="fl">Card PIN</label><input class="inp" id="cf-cpin" value="'+(c.cardPin||'')+'" maxlength="6" type="password" inputmode="numeric" placeholder="••••"></div></div>'
      +'<div class="fg"><label class="fl">Cardholder Name</label><input class="inp" id="cf-holder" value="'+(c.holderName||S.user.name||'')+'" placeholder="Name on card"></div>'
      +'<div class="fr"><div class="fg"><label class="fl">Rewards Program</label><input class="inp" id="cf-rprog" value="'+(c.rewardsProgram||'')+'" placeholder="Avios, MR…"></div><div class="fg"><label class="fl">Points Balance</label><input class="inp" id="cf-pts" value="'+(c.rewardsPoints||'')+'" type="number" placeholder="50000"></div></div>'
      +'<div class="fr"><div class="fg"><label class="fl">Ownership</label><select class="inp" id="cf-own"><option value="personal"'+(c.ownership!=='business'?' selected':'')+'>👤 Personal</option><option value="business"'+(c.ownership==='business'?' selected':'')+'>🏢 Business</option></select></div><div class="fg"><label class="fl">Annual Fee</label><input class="inp" id="cf-fee" value="'+(c.annualFee||'')+'" type="number" placeholder="0"></div></div>'
      +'<div class="fr"><div class="fg"><label class="fl">Online Username</label><input class="inp" id="cf-user" value="'+(c.username||'')+'" placeholder="Username"></div><div class="fg"><label class="fl">Password Hint</label><input class="inp" id="cf-pwd" value="'+(c.pwdHint||'')+'" placeholder="\'Email+!\'"></div></div>'
      +'<div class="fg"><label class="fl">Notes / Benefits</label><textarea class="inp" id="cf-notes" rows="2">'+(c.notes||'')+'</textarea></div>'
      +'<div class="fg"><label class="fl">Tags</label>'+U.tags(c.tags||[])+'</div>'
      +'<div style="display:flex;gap:16px;margin-top:4px"><label style="display:flex;align-items:center;gap:7px;cursor:pointer;font-size:13px"><input type="checkbox" id="cf-fav" '+(c.favorite?'checked':'')+'>  Favourite</label><label style="display:flex;align-items:center;gap:7px;cursor:pointer;font-size:13px"><input type="checkbox" id="cf-carry" '+(S.wallet.includes(c.id)?'checked':'')+'>  Carrying</label></div>'
      +'</div></details>';
  },
  save(editId=null){
    const name=document.getElementById('cf-name').value.trim();if(!name){Toast.show('Card name required','warning');return;}
    const _l4v=document.getElementById('cf-l4').value.trim();
    if(!editId){const dup=checkDuplicate('card',{cardName:name,last4:_l4v});if(dup.isDuplicate&&!window.__vos_confirm(dup.message))return;}
    const id2=editId||U.id();
    const carry=document.getElementById('cf-carry').checked;
    if(carry&&!S.wallet.includes(id2))S.wallet.push(id2);else if(!carry)S.wallet=S.wallet.filter(x=>x!==id2);
    const frontEl=document.getElementById('cf-photo-front');
    const backEl=document.getElementById('cf-photo-back');
    const prev=editId?S.cards.find(x=>x.id===editId):null;
    const frontPhoto=(frontEl&&frontEl.dataset&&frontEl.dataset.photo)||prev&&prev.frontPhoto||'';
    const backPhoto=(backEl&&backEl.dataset&&backEl.dataset.photo)||prev&&prev.backPhoto||'';
    const item={id:id2,cardName:name,network:document.getElementById('cf-net').value,cardType:document.getElementById('cf-type').value,category:document.getElementById('cf-cat').value,country:document.getElementById('cf-cc').value,holderName:document.getElementById('cf-holder').value.trim(),last4:document.getElementById('cf-l4').value.trim(),expiry:document.getElementById('cf-exp').value.trim(),cvv:document.getElementById('cf-cvv').value.trim(),cardPin:document.getElementById('cf-cpin').value.trim(),rewardsProgram:document.getElementById('cf-rprog').value.trim(),rewardsPoints:parseInt(document.getElementById('cf-pts').value)||0,ownership:document.getElementById('cf-own').value,annualFee:parseFloat(document.getElementById('cf-fee').value)||0,username:document.getElementById('cf-user').value.trim(),pwdHint:document.getElementById('cf-pwd').value.trim(),notes:document.getElementById('cf-notes').value.trim(),tags:U.getTags(),favorite:document.getElementById('cf-fav').checked,issuer:name.split(' ')[0],frontPhoto,backPhoto,createdAt:editId?S.cards.find(x=>x.id===editId)?.createdAt:new Date().toISOString()};
    const auto=autoTags('card',item);item.tags=[...new Set([...(item.tags||[]),...auto])];
    if(editId)S.cards=S.cards.map(x=>x.id===editId?item:x);else S.cards.push(item);
    Activity.log((editId?'Edited':'Added')+' card',name);Store.save();Modal.close();this.render();Toast.show((editId?'Updated':'Added')+': '+name,'success');
    if(!editId){
      const cLow=name.toLowerCase();
      const bMatch=SMART_DB.banks.find(b=>cLow.includes(b.name.toLowerCase()));
      if(bMatch){
        const bExists=(S.banks||[]).some(b=>b.bankName.toLowerCase()===bMatch.name.toLowerCase());
        if(!bExists){S.banks.push({id:U.id(),bankName:bMatch.name,country:bMatch.country,currency:bMatch.currency,bankType:bMatch.type,accountType:'Current',createdAt:new Date().toISOString()});Store.save();Toast.show(bMatch.name+' added to Banks','info',3000);}
      }
      promptAddAnother('Card','Cards.openAdd');
    }
  },
  edit(id){
    const c=S.cards.find(x=>x.id===id);if(!c)return;
    Modal.open('✏️ Edit Card',this.form(c),`<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-d btn-sm" onclick="Cards.del('${id}',true)">Delete</button><button class="btn btn-p" onclick="Cards.save('${id}')">Update</button>`);
    setTimeout(()=>{[['cf-net',c.network||'Visa'],['cf-type',c.cardType||'Credit'],['cf-cat',c.category||'Standard'],['cf-cc',c.country||'GB'],['cf-own',c.ownership||'personal']].forEach(([i,v])=>{const el=document.getElementById(i);if(el)el.value=v;});},60);
  },
  openDetail(id){
    const c=S.cards.find(x=>x.id===id);if(!c)return;
    let photoHtml='';
    if(c.frontPhoto||c.backPhoto){
      photoHtml='<div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap">'
        +(c.frontPhoto?'<div><div style="font-size:10px;color:var(--text3);margin-bottom:4px">Front</div><img src="data:image/jpeg;base64,'+c.frontPhoto+'" style="width:120px;border-radius:8px;cursor:pointer" onclick="Cards._viewPhotoB64(\''+c.frontPhoto+'\')"></div>':'')
        +(c.backPhoto?'<div><div style="font-size:10px;color:var(--text3);margin-bottom:4px">Back</div><img src="data:image/jpeg;base64,'+c.backPhoto+'" style="width:120px;border-radius:8px;cursor:pointer" onclick="Cards._viewPhotoB64(\''+c.backPhoto+'\')"></div>':'')
        +'</div>';
    }
    Modal.open('💳 '+c.cardName,'<div>'+[['Card',c.cardName],['Network',c.network||'—'],['Type',c.cardType||'—'],['Category',c.category||'—'],['Country',U.flag(c.country)+' '+U.cname(c.country)],['Last 4','****'+(c.last4||'—')],['Expiry',c.expiry||'—'],['CVV',c.cvv?'•••':'-',c.cvv],['Card PIN',c.cardPin?'••••':'-',c.cardPin],['Rewards',c.rewardsProgram||'—'],['Points',c.rewardsPoints?U.fmt(c.rewardsPoints):'—'],['Annual Fee',c.annualFee?c.annualFee+'':'-'],['Username',c.username?'••••':'-',c.username],['Pwd Hint',c.pwdHint||'—'],['Ownership',c.ownership||'Personal'],['Notes',c.notes||'—']].map(([k,v,s])=>U.drRow(k,v,s)).join('')+photoHtml+'</div>',`<button class="btn btn-g" onclick="Modal.close()">Close</button><button class="btn btn-p" onclick="Cards.edit('${id}');Modal.close()">Edit</button>`);
  },
  fav(id){const c=S.cards.find(x=>x.id===id);if(!c)return;c.favorite=!c.favorite;Store.save();this.render();},
  del(id,fm=false){
    if(!window.__vos_confirm('Move to Trash?'))return;
    const c=S.cards.find(x=>x.id===id);if(!c)return;
    S.trash.push({id:U.id(),type:'cards',data:c,deletedAt:new Date().toISOString()});
    S.cards=S.cards.filter(x=>x.id!==id);S.wallet=S.wallet.filter(x=>x!==id);
    Activity.log('Trashed card',c.cardName);Store.save();if(fm)Modal.close();this.render();
    Toast.show('Moved to Trash — <button class="cpbtn" onclick="Trash.restore(\''+S.trash[S.trash.length-1].id+'\');this.closest(\'.toast\').remove()">Undo</button>','info',6000);
  }
};
