const _fuzzC = (str, q) => {
  if (!q) return true;
  const s = (str || '').toLowerCase();
  const ql = q.toLowerCase();
  if (s.includes(ql)) return true;
  if (ql.length < 3) return false;
  const maxD = ql.length <= 5 ? 1 : 2;
  return s.split(/\s+/).some(word => {
    if (Math.abs(word.length - ql.length) > maxD + 1) return false;
    const m = word.length, n = ql.length;
    const dp = Array.from({length: m+1}, (_, i) => Array.from({length: n+1}, (_, j) => i === 0 ? j : j === 0 ? i : 0));
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) dp[i][j] = word[i-1] === ql[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    return dp[m][n] <= maxD;
  });
};

const _cardLimit = (c) => c.limit || c.creditLimit || 0;

const Cards={
  _showArchived: false,
  render(){
    const q=(document.getElementById('cQ')?.value||'').toLowerCase();
    const sort=document.getElementById('cSort')?.value||'name';
    const f=S.cF;
    const chips=[['all','All'],['credit','Credit'],['debit','Debit'],['amex','Amex'],['visa','Visa'],['mc','MC'],['paypak','PayPak'],['crypto','Crypto'],['bnpl','BNPL'],['expiring','Expiring'],['fav','Favourites']];
    const ci=document.getElementById('cChips');
    if(ci)ci.innerHTML=chips.map(([v,l])=>`<div class="chip${v===f?' on':''}" onclick="S.cF='${v}';Cards.render()">${l}</div>`).join('');
    const we=document.getElementById('cWallet');
    const wc=S.cards.filter(c=>S.wallet.includes(c.id));
    if(we)we.innerHTML=wc.length>0?`<div class="widget"><div class="wh"><span class="chip-ic">${VC.icon('wallet',14)}</span>Carrying Today<button type="button" class="btn btn-g btn-sm wh-act" onclick="Dash.editWallet()">Edit</button></div><div class="wallet-row">${wc.map(c=>Dash.miniCard(c,114)).join('')}</div></div>`:'';
    const archivedCount=(S.cards||[]).filter(c=>c.archived).length;
    let data=S.cards.filter(c=>{
      if(c.archived&&!Cards._showArchived)return false;
      if(f==='fav'&&!c.favorite)return false;
      if(f==='credit'&&c.cardType!=='Credit')return false;
      if(f==='debit'&&c.cardType!=='Debit')return false;
      if(f==='amex'&&c.network!=='American Express')return false;
      if(f==='visa'&&c.network!=='Visa')return false;
      if(f==='mc'&&c.network!=='Mastercard')return false;
      if(f==='paypak'&&c.network!=='PayPak')return false;
      if(f==='crypto'&&c.category!=='Crypto')return false;
      if(f==='bnpl'&&c.category!=='BNPL')return false;
      if(f==='expiring'){const s=U.expSt(c.expiry);if(s==='ok')return false;}
      return !q||_fuzzC(c.cardName,q)||_fuzzC(c.last4,q)||_fuzzC(c.network,q)||_fuzzC(c.cardType,q)||_fuzzC(c.linkedBank,q)||_fuzzC(c.notes,q)||(c.tags||[]).some(t=>_fuzzC(t,q));
    });
    if(typeof ContextSwitcher!=='undefined'&&ContextSwitcher.get()!=='ALL'){data=data.filter(c=>(c.country||'').toUpperCase()===ContextSwitcher.get());}
    if(sort==='name')data.sort((a,b)=>a.cardName.localeCompare(b.cardName));
    else if(sort==='expiry')data.sort((a,b)=>(a.expiry||'99/99').localeCompare(b.expiry||'99/99'));
    else if(sort==='network')data.sort((a,b)=>(a.network||'').localeCompare(b.network||''));
    else if(sort==='recent')data.sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));
    const el=document.getElementById('cItems');if(!el)return;
    // Wallet strip — horizontal scroll of all cards (shown even when list is filtered)
    const walletHtml=S.cards.length>0
      ?'<div style="overflow-x:auto;display:flex;gap:12px;padding:4px 4px 12px;scrollbar-width:none;-webkit-overflow-scrolling:touch;margin-bottom:4px">'+
        S.cards.filter(c=>!c.archived).map(c=>{
          const GRADS={Visa:'linear-gradient(135deg,#1a1f71,#2575fc)',Mastercard:'linear-gradient(135deg,#eb001b,#f79e1b)','American Express':'linear-gradient(135deg,#007b5e,#00b894)',UnionPay:'linear-gradient(135deg,#c0392b,#e74c3c)',PayPak:'linear-gradient(135deg,#007a3d,#00b463)'};
          const bg=GRADS[c.network]||cardGradient(c)||'linear-gradient(135deg,rgba(123,95,255,.8),rgba(0,213,255,.6))';
          const last4=c.last4||'····';
          return '<div onclick="Cards.openDetail(\''+c.id+'\')" style="flex-shrink:0;width:240px;height:148px;border-radius:16px;background:'+bg+';position:relative;overflow:hidden;cursor:pointer;touch-action:manipulation;box-shadow:0 6px 24px rgba(0,0,0,.4)">'+
            '<div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.12) 0%,transparent 55%);pointer-events:none"></div>'+
            '<div style="position:absolute;top:14px;left:14px;font-size:12px;font-weight:700;color:rgba(255,255,255,.92);max-width:140px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+escHtml(c.cardName||'Card')+'</div>'+
            '<div style="position:absolute;top:12px;right:12px;font-size:10px;font-weight:800;color:rgba(255,255,255,.85);letter-spacing:.1em">'+escHtml((c.network||'').toUpperCase())+'</div>'+
            '<div style="position:absolute;bottom:30px;left:14px;font-size:13px;font-weight:600;color:rgba(255,255,255,.9);letter-spacing:.18em;font-family:var(--mono,monospace)">**** **** **** '+escHtml(last4)+'</div>'+
            '<div style="position:absolute;bottom:11px;left:14px;font-size:10px;color:rgba(255,255,255,.65)">'+escHtml(c.holderName||'')+'</div>'+
            (c.expiry?'<div style="position:absolute;bottom:11px;right:12px;font-size:10px;color:rgba(255,255,255,.65)">Exp '+escHtml(c.expiry)+'</div>':'')+
            '</div>';
        }).join('')+
        '</div>'
      :'';
    if(!data.length&&!archivedCount){el.innerHTML=walletHtml+(S.cards.length?'<div style="font-size:13px;color:var(--text3);text-align:center;padding:16px 0">No cards match the filter</div>':`<div class="empty-ios"><div class="ei-ic">${VC.icon('card',32)}</div><div class="ei-title">No cards yet</div><div class="ei-sub">Track debit, credit, prepaid & crypto cards — expiry alerts, network detection, photo storage</div><div style="display:flex;gap:10px;justify-content:center;margin-top:16px;flex-wrap:wrap"><button type="button" class="btn btn-p" onclick="Cards.openAdd()">+ Add Card</button><button type="button" class="btn btn-g" onclick="Cards._showExample()">See example</button></div></div>`);return;}
    const archiveToggle=archivedCount?`<div style="text-align:center;margin-bottom:10px"><button type="button" class="btn btn-g btn-sm" onclick="Cards._showArchived=!Cards._showArchived;Cards.render()">${Cards._showArchived?'Hide':'Show'} ${archivedCount} archived</button></div>`:'';
    const totalLimitPKR = S.cards
      .filter(c => c.cardType === 'Credit' && _cardLimit(c))
      .reduce((a, c) => a + (typeof CurrencyEngine !== 'undefined'
        ? CurrencyEngine.toBase(_cardLimit(c), c.currency || S.user.currency || 'PKR')
        : _cardLimit(c)), 0);
    const _cur = S.user.currency || 'GBP';
    const limitBanner = totalLimitPKR > 0
      ? `<div style="background:var(--glass);border-radius:var(--r);padding:12px 16px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center"><span style="font-size:13px;color:var(--text2)">Total Credit Limit</span><span style="font-size:16px;font-weight:800;color:var(--info)" class="sens">${U.fmtCur(totalLimitPKR, _cur)}</span></div>`
      : '';
    const carrying=data.filter(c=>S.wallet.includes(c.id));
    const rest=data.filter(c=>!S.wallet.includes(c.id));
    const byNet={};rest.forEach(c=>{(byNet[c.network||'Other']=byNet[c.network||'Other']||[]).push(c);});
    const carrySection=carrying.length?`<div class="sdiv"><span class="chip-ic">${VC.icon('card',12)}</span> Carrying Today <span style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--text3)">(${carrying.length})</span></div>${carrying.map(c=>this.row(c)).join('')}`:'';
    const restSection=Object.entries(byNet).map(([net,items])=>`<div class="sdiv">${net} <span style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--text3)">(${items.length})</span></div>${items.map(c=>this.row(c)).join('')}`).join('');
    el.innerHTML=walletHtml+archiveToggle+limitBanner+carrySection+restSection;
    initSwipeDelete(el);
    initLongPress(el, id => {
      const c = S.cards.find(x => x.id === id); if (!c) return [];
      return [
        {label:'Edit', ic:'pencil', action: () => Cards.edit(id)},
        {label:'View Details', ic:'eye', action: () => Cards.openDetail(id)},
        {label:'Toggle Carry', ic:'wallet', action: () => Cards.toggleCarry(id)},
        {label:'Delete', ic:'trash', destructive: true, action: () => Cards.del(id)},
      ];
    });
  },
  row(c){
    const carrying=S.wallet.includes(c.id);
    const gradient=cardGradient(c);
    const last4=c.last4||'????';
    const holderName=((c.holderName||S.user&&S.user.name||'CARDHOLDER')+'').toUpperCase().slice(0,22);
    const bankName=c.issuer||((c.cardName||'').split(' ')[0]);
    const typeLabel=(c.cardType||'CARD').toUpperCase();

    // Bank logo — pill with favicon + initials fallback
    const _dom=bankDomain(c.cardName||bankName,c.country);
    const _initials=(bankName||'?').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)||'?';
    const logoHtml=_dom
      ? `<div class="wcard-logo-pill"><img src="https://www.google.com/s2/favicons?sz=32&domain=${_dom}" alt="" width="18" height="18" style="border-radius:3px;display:block" onerror="this.parentElement.innerHTML='<span style=\\'font-size:11px;font-weight:700;color:#fff\\'>${_initials}</span>'"></div>`
      : `<div class="wcard-logo-pill" style="font-size:11px;font-weight:700;color:#fff;background:rgba(0,0,0,.3);min-width:28px;text-align:center;padding:0 6px">${_initials}</div>`;

    // EMV chip SVG
    const chip=`<svg width="38" height="30" viewBox="0 0 38 30" class="wcard-chip-svg">
      <rect width="38" height="30" rx="4" fill="#c9a227"/>
      <rect x="14" y="0" width="10" height="30" fill="rgba(0,0,0,.18)"/>
      <rect x="0" y="10" width="38" height="10" fill="rgba(0,0,0,.18)"/>
      <rect x="14" y="10" width="10" height="10" fill="#f0c040"/>
      <rect x="5" y="0" width="2" height="30" fill="rgba(0,0,0,.09)"/>
      <rect x="31" y="0" width="2" height="30" fill="rgba(0,0,0,.09)"/>
    </svg>`;

    // Network logos
    const netSvg={
      'Visa':`<svg viewBox="0 0 80 26" width="46" height="16" style="display:block"><text x="0" y="22" font-family="Arial,sans-serif" font-weight="900" font-size="26" fill="white" letter-spacing="-1" font-style="italic">VISA</text></svg>`,
      'Mastercard':`<div style="position:relative;width:38px;height:24px;flex-shrink:0;display:flex;align-items:center"><div style="position:absolute;left:0;width:22px;height:22px;border-radius:50%;background:rgba(235,0,27,.92)"></div><div style="position:absolute;left:12px;width:22px;height:22px;border-radius:50%;background:rgba(255,95,0,.85)"></div></div>`,
      'American Express':`<svg width="38" height="16" style="display:block"><text y="13" font-family="Arial,sans-serif" font-weight="800" font-size="11" fill="white" letter-spacing=".5">AMEX</text></svg>`,
      'UnionPay':`<svg width="38" height="16" style="display:block"><text y="13" font-family="Arial,sans-serif" font-weight="700" font-size="10" fill="white">UnionPay</text></svg>`,
      'JCB':`<svg width="38" height="16" style="display:block"><text y="13" font-family="Arial,sans-serif" font-weight="800" font-size="12" fill="white">JCB</text></svg>`,
      'PayPak':`<svg width="52" height="16" style="display:block"><rect width="52" height="16" rx="3" fill="#007a3d"/><text x="4" y="12" font-family="Arial,sans-serif" font-weight="800" font-size="10" fill="white" letter-spacing=".3">PayPak</text></svg>`,
    };

    const carryBorder=carrying?'animation:cardGlow 2.5s ease-in-out infinite':'box-shadow:0 8px 28px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.12)';

    return `<div class="wcard sens" data-id="${c.id}" onclick="Cards.openDetail('${c.id}')" style="background:${gradient};${carryBorder}">
  <div class="wcard-shine"></div>
  <div class="wcard-inner">
    <div class="wcard-top">
      <div style="display:flex;align-items:center;gap:7px">
        ${logoHtml}
        <span style="font-size:13px;font-weight:700;color:rgba(255,255,255,.92);letter-spacing:.2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px">${bankName}</span>
      </div>
      <div class="wcard-type-badge">${typeLabel}${carrying?' · Wallet':''}${(c.owners||[]).filter(o=>o!=='self').length?' · Shared':''}</div>
    </div>
    <div class="wcard-chip">${chip}</div>
    <div class="wcard-number">**** **** **** ${last4}</div>
    <div class="wcard-bottom">
      <div>
        <div style="font-size:8px;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,.45);margin-bottom:2px">Card Holder</div>
        <div class="wcard-holder">${holderName}</div>
      </div>
      <div style="text-align:center">
        ${c.expiry?`<div style="font-size:7px;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,.45);margin-bottom:2px">Valid Thru</div><div style="font-size:11px;font-weight:600;color:rgba(255,255,255,.85);font-family:monospace">${c.expiry}</div>`:''}
      </div>
      <div class="wcard-net">${netSvg[c.network]||`<span style="font-size:10px;font-weight:800;color:rgba(255,255,255,.6);letter-spacing:.5px">${c.network||''}</span>`}</div>
    </div>
  </div>
  <div class="wcard-actions">
    ${U.icb('wallet',{onclick:`event.stopPropagation();Cards.toggleCarry('${c.id}')`,title:'Toggle carry',class:'wc-act-btn'})}
    ${U.icb('pencil',{onclick:`event.stopPropagation();Cards.edit('${c.id}')`,title:'Edit',class:'wc-act-btn'})}
    ${U.icb('archive',{onclick:`event.stopPropagation();Cards.archive('${c.id}')`,title:c.archived?'Unarchive':'Archive',class:'wc-act-btn'})}
    ${U.icb('trash',{onclick:`event.stopPropagation();Cards.del('${c.id}')`,title:'Delete',class:'wc-act-btn del'})}
  </div>
</div>`;
  },
  _showExample(){Modal.open('Example Card Entry',`<div style="background:linear-gradient(135deg,#1a3a6b,#2d5aa0);border-radius:16px;padding:16px;margin-bottom:14px;color:#fff"><div style="font-size:13px;font-weight:700;margin-bottom:8px">HBL Premier World Elite</div><div style="font-size:18px;font-weight:600;letter-spacing:4px;font-family:monospace;margin-bottom:8px">**** **** **** 4821</div><div style="display:flex;justify-content:space-between;font-size:11px"><span>AHMED KARIMI</span><span>09/27</span></div></div><div style="padding:12px;background:var(--glass);border-radius:var(--r);font-size:12px;line-height:1.8;color:var(--text2)">Card name: HBL Premier World Elite<br>Network: Mastercard<br>Type: Credit · Premium<br>Last 4: 4821<br>Expiry: 09/27</div><p style="font-size:11px;color:var(--text3);margin-top:10px">This is a preview — nothing is saved.</p>`,`<button type="button" class="btn btn-g" onclick="Modal.close()">Close</button><button type="button" class="btn btn-p" onclick="Modal.close();Cards.openAdd()">+ Add My Card</button>`);},
  _fmtCardNum(input){
    let v=input.value.replace(/\D/g,'').slice(0,16);
    input.value=v.replace(/(.{4})/g,'$1 ').trim();
    const first=v.charAt(0);
    const netEl=document.getElementById('cf-net');
    if(netEl&&v.length>=1){
      const net=first==='4'?'Visa':first==='5'?'Mastercard':(v.startsWith('34')||v.startsWith('37'))?'American Express':v.startsWith('62')?'UnionPay':first==='9'?'PayPak':'';
      if(net)netEl.value=net;
    }
    if(v.length>=4){const l4El=document.getElementById('cf-l4');if(l4El)l4El.value=v.slice(-4);}
  },
  toggleCarry(id){if(S.wallet.includes(id))S.wallet=S.wallet.filter(x=>x!==id);else S.wallet.push(id);Store.save();this.render();Toast.show(S.wallet.includes(id)?'Added to wallet':'Removed from wallet','info',1500);},
  _pendingOwnerId: null,
  openAdd(prefill={}){
    Cards._pendingOwnerId = prefill.ownerId || null;
    const title = (prefill.ownerName||prefill._ownerName) ? `Add Card — ${escHtml(prefill.ownerName||prefill._ownerName)}` : 'Add Card';
    const scanBtn = prefill.ownerId ? '' : `<div style="margin-bottom:12px"><button type="button" class="btn btn-g btn-full" onclick="Cards.scanCard()" style="gap:8px">📷 Scan Card with Camera</button></div>`;
    Modal.open(title, scanBtn + this.form(), `<button type="button" class="btn btn-g" onclick="Modal.close()">Cancel</button><button type="button" class="btn btn-p" onclick="Cards.save()">Save</button>`);
  },

  // ── Camera scan (QR auto + manual capture for OCR) ────────────────────────
  scanCard(){
    const overlay=document.createElement('div');
    overlay.style.cssText='position:fixed;inset:0;z-index:2000;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;';
    overlay.innerHTML=[
      '<style>@keyframes scan{from{top:20%}to{top:80%}}</style>',
      '<div style="position:relative;width:100%;max-width:420px">',
      '<video id="_scanVid" autoplay playsinline style="width:100%;max-width:420px;border-radius:12px;display:block;background:#000"></video>',
      '<div style="position:absolute;inset:0;border:2px solid rgba(255,255,255,.25);border-radius:12px;pointer-events:none"></div>',
      '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);border:2px solid rgba(100,200,255,.7);width:82%;height:56%;border-radius:8px;pointer-events:none"></div>',
      '<div style="position:absolute;left:9%;width:82%;height:2px;background:linear-gradient(90deg,transparent,#0A84FF,transparent);animation:scan 2s ease-in-out infinite alternate;pointer-events:none"></div>',
      '</div>',
      '<canvas id="_scanCanvas" style="display:none"></canvas>',
      '<div id="_scanStatus" style="color:rgba(255,255,255,.85);font-size:13px;margin-top:16px;text-align:center;padding:0 24px;line-height:1.5">Point at card for QR scan (auto) · Tap Capture for manual entry</div>',
      '<div style="display:flex;gap:12px;margin-top:20px">',
      '<button type="button" id="_scanCaptureBtn" onclick="Cards._doCapture()" style="padding:16px 36px;background:#0A84FF;border:none;border-radius:99px;color:#fff;font-size:16px;font-weight:700;cursor:pointer;min-width:160px;box-shadow:0 4px 20px rgba(10,132,255,.5)">📷 Capture</button>',
      '<button type="button" onclick="Cards._stopScan()" style="padding:16px 24px;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);border-radius:99px;color:#fff;font-size:14px;font-weight:600;cursor:pointer">Cancel</button>',
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
    // Try jsQR first for cards with QR codes
    const imgData=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height);
    const qr=window.jsQR&&window.jsQR(imgData.data,imgData.width,imgData.height);
    if(qr){Cards._onScanResult(qr.data);return;}
    // Run Tesseract OCR
    if(typeof Tesseract!=='undefined'){
      if(statusEl)statusEl.innerHTML='<span style="color:#60a5fa">🔍 Reading card…</span>';
      if(btn)btn.disabled=true;
      Tesseract.recognize(canvas,'eng',{logger:function(){}}).then(function(result){
        Cards._stopScan();
        const parsed=Cards._parseCardOCR(result.data.text);
        Modal.open('Add Card',Cards.form(),`<button type="button" class="btn btn-g" onclick="Modal.close()">Cancel</button><button type="button" class="btn btn-p" onclick="Cards.save()">Save</button>`);
        setTimeout(function(){Cards._fillFromOCR(parsed);},200);
      }).catch(function(){
        Cards._stopScan();
        Toast.show('OCR failed — fill in details below','warning',3000);
        Modal.open('Add Card',Cards.form(),`<button type="button" class="btn btn-g" onclick="Modal.close()">Cancel</button><button type="button" class="btn btn-p" onclick="Cards.save()">Save</button>`);
      });
    } else {
      if(statusEl)statusEl.innerHTML='<span style="color:#fbbf24">Tap Capture again or fill below.</span>';
      setTimeout(function(){Cards._stopScan();Toast.show('Fill in the details below','info',2500);Modal.open('Add Card',Cards.form(),`<button type="button" class="btn btn-g" onclick="Modal.close()">Cancel</button><button type="button" class="btn btn-p" onclick="Cards.save()">Save</button>`);},1200);
    }
  },
  _parseCardOCR(text){
    const out={};
    const numMatch=text.match(/\b(\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4})\b/);
    if(numMatch){
      const digits=numMatch[1].replace(/\D/g,'');
      out.cardNumber=digits;out.last4=digits.slice(-4);
      const f=digits.charAt(0);
      out.network=f==='4'?'Visa':f==='5'?'Mastercard':(digits.startsWith('34')||digits.startsWith('37'))?'American Express':f==='6'?'Discover':'';
    }
    const expMatch=text.match(/\b(0[1-9]|1[0-2])\s*[\/\-]\s*(\d{2,4})\b/);
    if(expMatch){out.expiryDate=expMatch[1]+'/'+(expMatch[2].length===4?expMatch[2].slice(-2):expMatch[2]);}
    const lines=text.split('\n').map(function(l){return l.trim();}).filter(function(l){return l;});
    for(var i=0;i<lines.length;i++){
      const line=lines[i];
      if(/^[A-Z][A-Z\s\.]{5,}$/.test(line)&&!/\d/.test(line)&&line.split(' ').length>=2){out.cardholderName=line.trim();break;}
    }
    return out;
  },
  _onScanResult(raw){
    Cards._stopScan();
    const digits=raw.replace(/\D/g,'');
    const last4=digits.slice(-4);
    const first=digits.charAt(0);
    const network=first==='4'?'Visa':first==='5'?'Mastercard':(raw.startsWith('34')||raw.startsWith('37'))?'American Express':raw.startsWith('62')?'UnionPay':first==='9'?'PayPak':'';
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
      '<button type="button" onclick="Cards._doPhotoCapture(\''+targetId+'\')" style="padding:14px 32px;background:var(--accent,#6c63ff);border:none;border-radius:99px;color:#fff;font-size:15px;font-weight:700;cursor:pointer">📷 Capture</button>',
      '<button type="button" onclick="Cards._stopPhoto()" style="padding:14px 24px;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);border-radius:99px;color:#fff;font-size:14px;cursor:pointer">Cancel</button>',
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
      thumbEl.innerHTML='<img src="'+dataUrl+'" alt="Card photo" style="width:100%;max-width:120px;border-radius:8px;border:2px solid var(--accent);cursor:pointer;margin-top:6px" onclick="Cards._viewPhotoData(\''+targetId+'\')" title="Tap to view full size">';
      thumbEl.dataset.photo=base64;
    }
    Toast.show('Photo saved — fill in the details below','info',2000);
  },
  _viewPhotoData(targetId){
    const thumbEl=document.getElementById('cf-photo-'+targetId);
    const b64=thumbEl&&thumbEl.dataset&&thumbEl.dataset.photo;
    if(!b64)return;
    const v=document.createElement('div');
    v.style.cssText='position:fixed;inset:0;z-index:3000;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;cursor:pointer';
    v.onclick=function(){v.remove();};
    v.innerHTML='<img src="data:image/jpeg;base64,'+b64+'" alt="Card photo" style="max-width:95vw;max-height:90vh;border-radius:12px;object-fit:contain">';
    document.body.appendChild(v);
  },
  _viewPhotoB64(base64){
    const v=document.createElement('div');
    v.style.cssText='position:fixed;inset:0;z-index:3000;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;cursor:pointer';
    v.onclick=function(){v.remove();};
    v.innerHTML='<img src="data:image/jpeg;base64,'+base64+'" alt="Card photo" style="max-width:95vw;max-height:90vh;border-radius:12px;object-fit:contain">';
    document.body.appendChild(v);
  },

  form(c={}){
    const isEdit=!!c.id;
    const isVirtual=(c.category||'').toLowerCase()==='virtual'||(c.category||'').toLowerCase()==='digital';
    const cardNames=SMART_DB.cards.map(x=>'<option value="'+x.name+'">').join('');
    const myBanks=(window.S?.banks||[]);
    const bankOptions=myBanks.length?myBanks.map(b=>`<option value="${escAttr(b.bankName)}">${b.bankName}</option>`).join(''):'';
    const bankPicker=myBanks.length?'<div style="margin-bottom:12px"><label style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;display:block;margin-bottom:6px">Your Bank</label><select id="cf-mybank" onchange="Cards._bankSelected(this.value)" style="width:100%;background:var(--input);border:1px solid var(--border);border-radius:10px;padding:12px;color:var(--text)"><option value="">Select your bank (optional)</option>'+bankOptions+'<option value="__other__">Other / Not listed</option></select></div>':'';
    return '<datalist id="cfNameDL">'+cardNames+'</datalist>'
      +'<datalist id="cfNetDL"><option>Visa</option><option>Mastercard</option><option>American Express</option><option>JCB</option><option>UnionPay</option><option>PayPak</option></datalist>'
      +bankPicker
      +'<div class="fg"><label class="fl">Card Name *</label><input class="inp" id="cf-name" list="cfNameDL" placeholder="e.g. Amex Gold, Sadapay…" autocomplete="off" oninput="SMART_DB.fillCard(this.value)" value="'+(c.cardName||'')+'"></div>'
      +'<div class="fg"><label class="fl">Card Number (optional)</label><input class="inp" id="cf-fullnum" value="'+(c.cardNumber?'•••• •••• •••• '+c.last4:'')+'" maxlength="19" inputmode="numeric" placeholder="1234 5678 9012 3456" oninput="Cards._fmtCardNum(this)" autocomplete="cc-number"></div>'
      +'<div class="fr"><div class="fg"><label class="fl">Network *</label><input class="inp" id="cf-net" value="'+(c.network||'')+'" list="cfNetDL" placeholder="Visa, Mastercard…"></div><div class="fg"><label class="fl">Last 4 Digits</label><input class="inp" id="cf-l4" value="'+(c.last4||'')+'" maxlength="4" inputmode="numeric" placeholder="1234 (auto-filled)"></div></div>'
      +'<div style="margin:10px 0;display:flex;gap:10px;align-items:flex-start;flex-wrap:wrap">'
      +'<div><button type="button" class="btn btn-g btn-sm" onclick="Cards._capturePhoto(\'front\')" style="gap:6px">📷 Front</button><div id="cf-photo-front" style="margin-top:4px">'+(c.frontPhoto?'<img src="data:image/jpeg;base64,'+c.frontPhoto+'" alt="Card front" style="width:100%;max-width:120px;border-radius:8px;border:2px solid var(--accent);cursor:pointer;margin-top:6px" onclick="Cards._viewPhotoB64(\''+c.frontPhoto+'\')" title="Tap to view">':'')+'</div></div>'
      +(isVirtual?'':'<div><button type="button" class="btn btn-g btn-sm" onclick="Cards._capturePhoto(\'back\')" style="gap:6px">📷 Back</button><div id="cf-photo-back" style="margin-top:4px">'+(c.backPhoto?'<img src="data:image/jpeg;base64,'+c.backPhoto+'" alt="Card back" style="width:100%;max-width:120px;border-radius:8px;border:2px solid var(--accent);cursor:pointer;margin-top:6px" onclick="Cards._viewPhotoB64(\''+c.backPhoto+'\')" title="Tap to view">':'')+'</div></div>')
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
      +'<div class="fg"><label class="fl">Joint Card?</label><div style="display:flex;align-items:center;gap:12px;margin-top:6px"><input type="checkbox" id="cf-joint" onchange="var s=document.getElementById(\'cf-joint-section\');if(s)s.style.display=this.checked?\'block\':\'none\'" style="width:20px;height:20px;cursor:pointer" '+(c.jointAccount?'checked':'')+' ><label for="cf-joint" style="font-size:14px;color:var(--text2)">This is a joint card</label></div><div id="cf-joint-section" style="display:'+(c.jointAccount?'block':'none')+';margin-top:10px"><select id="cf-joint-person" style="width:100%;background:var(--input);border:1px solid var(--border);border-radius:10px;padding:12px;color:var(--text);font-size:14px"><option value="">Select person...</option>'+(typeof familyJointOptionsHtml==='function'?familyJointOptionsHtml(c.jointWith||''):'')+'</select></div></div>'
      +'<div class="fg"><label class="fl">Credit Limit (optional)</label><input class="inp" id="cf-limit" value="'+(_cardLimit(c)||'')+'" type="number" min="0" placeholder="e.g. 500000"></div>'
      +'<div class="fr"><div class="fg"><label class="fl">Online Username</label><input class="inp" id="cf-user" value="'+(c.username||'')+'" placeholder="Username"></div><div class="fg"><label class="fl">Password Hint</label><input class="inp" id="cf-pwd" value="'+(c.pwdHint||'')+'" placeholder="\'Email+!\'"></div></div>'
      +'<div class="fg"><label class="fl">Notes / Benefits</label><textarea class="inp" id="cf-notes" rows="2">'+(c.notes||'')+'</textarea></div>'
      +'<div class="fg"><label class="fl">Tags</label>'+U.tags(c.tags||[])+'</div>'
      +'<div style="display:flex;gap:16px;margin-top:4px"><label style="display:flex;align-items:center;gap:7px;cursor:pointer;font-size:13px"><input type="checkbox" id="cf-fav" '+(c.favorite?'checked':'')+'>  Favourite</label><label style="display:flex;align-items:center;gap:7px;cursor:pointer;font-size:13px"><input type="checkbox" id="cf-carry" '+(S.wallet.includes(c.id)?'checked':'')+'>  Carrying</label></div>'
      +'</div></details>';
  },
  _bankSelected(bankName){
    const dl=document.getElementById('cfNameDL');
    if(!dl)return;
    const allCards=(window.SMART_DB?.cards||[]);
    if(!bankName||bankName==='__other__'){
      dl.innerHTML=allCards.map(c=>`<option value="${escAttr(c.name)}"></option>`).join('');
      return;
    }
    const key=bankName.toLowerCase().split(' ')[0];
    const filtered=allCards.filter(c=>c.name.toLowerCase().includes(key));
    dl.innerHTML=(filtered.length?filtered:allCards).map(c=>`<option value="${escAttr(c.name)}"></option>`).join('');
    const bankField=document.getElementById('cf-bank');
    if(bankField)bankField.value=bankName;
  },
  save(editId=null){
    const name=document.getElementById('cf-name').value.trim();if(!name){Toast.show('Card name required','warning');return;}
    const fullNumRaw=(document.getElementById('cf-fullnum')?.value||'').replace(/\D/g,'');
    const _l4v=fullNumRaw.length>=4?fullNumRaw.slice(-4):(document.getElementById('cf-l4').value.trim());
    if(!editId){const dup=checkDuplicate('card',{cardName:name,last4:_l4v});if(dup.isDuplicate&&!window.__vos_confirm(dup.message))return;}
    const id2=editId||U.id();
    const carry=document.getElementById('cf-carry').checked;
    if(carry&&!S.wallet.includes(id2))S.wallet.push(id2);else if(!carry)S.wallet=S.wallet.filter(x=>x!==id2);
    const frontEl=document.getElementById('cf-photo-front');
    const backEl=document.getElementById('cf-photo-back');
    const prev=editId?S.cards.find(x=>x.id===editId):null;
    const frontPhoto=(frontEl&&frontEl.dataset&&frontEl.dataset.photo)||prev&&prev.frontPhoto||'';
    const backPhoto=(backEl&&backEl.dataset&&backEl.dataset.photo)||prev&&prev.backPhoto||'';
    const _linkedBankName=document.getElementById('cf-bank')?.value||document.getElementById('cf-mybank')?.value||'';
    const _oid = editId ? (S.cards.find(x=>x.id===editId)?.ownerId||'self') : (Cards._pendingOwnerId||'self');
    if (!editId) Cards._pendingOwnerId = null;
    const item={id:id2,cardName:name,network:document.getElementById('cf-net').value,cardType:document.getElementById('cf-type').value,category:document.getElementById('cf-cat').value,country:document.getElementById('cf-cc').value,holderName:document.getElementById('cf-holder').value.trim(),last4:_l4v,cardNumber:fullNumRaw||'',expiry:document.getElementById('cf-exp').value.trim(),cvv:document.getElementById('cf-cvv').value.trim(),cardPin:document.getElementById('cf-cpin').value.trim(),rewardsProgram:document.getElementById('cf-rprog').value.trim(),rewardsPoints:parseInt(document.getElementById('cf-pts').value)||0,ownership:document.getElementById('cf-own').value,annualFee:parseFloat(document.getElementById('cf-fee').value)||0,limit:parseFloat(document.getElementById('cf-limit')?.value)||0,username:document.getElementById('cf-user').value.trim(),pwdHint:document.getElementById('cf-pwd').value.trim(),notes:document.getElementById('cf-notes').value.trim(),tags:U.getTags(),favorite:document.getElementById('cf-fav').checked,jointAccount:document.getElementById('cf-joint')?.checked||false,jointWith:document.getElementById('cf-joint-person')?.value||'',issuer:name.split(' ')[0],linkedBankId:(_linkedBankName?(S.banks.find(b=>b.bankName===_linkedBankName)?.id||''):''),frontPhoto,backPhoto,ownerId:_oid,owners:[_oid],updatedAt:new Date().toISOString(),createdAt:editId?S.cards.find(x=>x.id===editId)?.createdAt:new Date().toISOString()};
    if(typeof Validators!=='undefined'&&!Validators.run(item,'card'))return;
    const auto=autoTags('card',item);item.tags=[...new Set([...(item.tags||[]),...auto])];
    if(editId){S.cards=S.cards.map(x=>x.id===editId?item:x);if(typeof Audit!=='undefined')Audit.log(item,'edited');}else{S.cards.push(item);if(typeof Audit!=='undefined')Audit.log(item,'created');}
    const _cPhotoBytes=S.cards.reduce((a,c)=>a+(c.frontPhoto||'').length+(c.backPhoto||'').length,0)/1.37;
    if(_cPhotoBytes>10*1024*1024)Toast.show('Storage is getting large. Consider removing old photos.','warning',5000);
    Activity.log((editId?'Edited':'Added')+' card',name);Store.save();Modal.close();this.render();Toast.show((editId?'Updated':'Added')+': '+name,'success');
    if(typeof Haptic!=='undefined')Haptic.save();
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
    Modal.open('Edit Card',this.form(c),`<button type="button" class="btn btn-g" onclick="Modal.close()">Cancel</button><button type="button" class="btn btn-d btn-sm" onclick="Cards.del('${id}',true)">Delete</button><button type="button" class="btn btn-p" onclick="Cards.save('${id}')">Update</button>`);
    setTimeout(()=>{[['cf-net',c.network||'Visa'],['cf-type',c.cardType||'Credit'],['cf-cat',c.category||'Standard'],['cf-cc',c.country||'GB'],['cf-own',c.ownership||'personal']].forEach(([i,v])=>{const el=document.getElementById(i);if(el)el.value=v;});},60);
  },
  openDetail(id){
    const c=S.cards.find(x=>x.id===id);if(!c)return;
    let photoHtml='';
    if(c.frontPhoto||c.backPhoto){
      photoHtml='<div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap">'
        +(c.frontPhoto?'<div><div style="font-size:10px;color:var(--text3);margin-bottom:4px">Front</div><img src="data:image/jpeg;base64,'+c.frontPhoto+'" alt="Card front" style="width:120px;border-radius:8px;cursor:pointer" onclick="Cards._viewPhotoB64(\''+c.frontPhoto+'\')"></div>':'')
        +(c.backPhoto?'<div><div style="font-size:10px;color:var(--text3);margin-bottom:4px">Back</div><img src="data:image/jpeg;base64,'+c.backPhoto+'" alt="Card back" style="width:120px;border-radius:8px;cursor:pointer" onclick="Cards._viewPhotoB64(\''+c.backPhoto+'\')"></div>':'')
        +'</div>';
    }
    const cardNumRow=c.cardNumber&&c.cardNumber.length>=4?`<div class="dr"><span class="drk">Card Number</span><span class="drv sens" id="cdnum-disp">•••• •••• •••• ${c.last4||'????'}</span>${U.icb('eye',{onclick:`(function(){const el=document.getElementById('cdnum-disp');const num='${c.cardNumber}'.replace(/(\\d{4})/g,'$1 ').trim();if(el.dataset.shown){el.textContent='•••• •••• •••• ${c.last4||'????'}';delete el.dataset.shown;}else{el.textContent=num;el.dataset.shown='1';}})()`,ariaLabel:'Reveal card number',size:14})}${U.icb('copy',{onclick:`U.copy('${c.cardNumber}','Card number')`,ariaLabel:'Copy card number',size:14})}</div>`:U.drRow('Last 4','****'+(c.last4||'—'));
    Modal.open('+c.cardName,'<div>'+[['Card',c.cardName],['Network',c.network||'—'],['Type',c.cardType||'—'],['Category',c.category||'—'],['Country',U.flag(c.country)+' '+U.cname(c.country)]].map(([k,v])=>U.drRow(k,v)).join('')+cardNumRow+[['Expiry',c.expiry||'—'],['CVV',c.cvv?'•••':'-',c.cvv],['Card PIN',c.cardPin?'••••':'-',c.cardPin],['Credit Limit',_cardLimit(c)?U.fmtCur(typeof CurrencyEngine!=='undefined'?CurrencyEngine.toBase(_cardLimit(c),c.currency||'GBP'):_cardLimit(c),S.user.currency||'GBP'):'—'],['Rewards',c.rewardsProgram||'—'],['Points',c.rewardsPoints?U.fmt(c.rewardsPoints):'—'],['Annual Fee',c.annualFee?c.annualFee+'':'-'],['Username',c.username?'••••':'-',c.username],['Pwd Hint',c.pwdHint||'—'],['Ownership',c.ownership||'Personal'],['Notes',c.notes||'—']].map(([k,v,s])=>U.drRow(k,v,s)).join('')+photoHtml+'</div>',`<button type="button" class="btn btn-g" onclick="Modal.close()">Close</button><button type="button" class="btn btn-p" onclick="Cards.edit('${id}');Modal.close()">Edit</button>`);
  },
  fav(id){const c=S.cards.find(x=>x.id===id);if(!c)return;c.favorite=!c.favorite;Store.save();this.render();},
  archive(id){const c=S.cards.find(x=>x.id===id);if(!c)return;c.archived=!c.archived;c.updatedAt=new Date().toISOString();Store.save();this.render();Toast.show(c.archived?'Archived':'Unarchived','info');},
  del(id,fm=false){
    if(!window.__vos_confirm('Move to Trash?'))return;
    const c=S.cards.find(x=>x.id===id);if(!c)return;
    if(typeof Haptic!=='undefined')Haptic.del();
    S.trash.push({id:U.id(),type:'cards',data:c,deletedAt:new Date().toISOString()});
    S.cards=S.cards.filter(x=>x.id!==id);S.wallet=S.wallet.filter(x=>x!==id);
    Activity.log('Trashed card',c.cardName);Store.save();if(fm)Modal.close();this.render();
    Toast.show('Moved to Trash — <button type="button" class="cpbtn" onclick="Trash.restore(\''+S.trash[S.trash.length-1].id+'\');this.closest(\'.toast\').remove()">Undo</button>','info',6000);
  }
};
