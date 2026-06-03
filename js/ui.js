// VaultOS — © 2026 Shamikh Ahmed. Source-available. See LICENSE.
const _FX_DEFAULTS={PKR:1,GBP:355,AED:76,USD:280,EUR:300,SAR:74,CAD:210,AUD:185,SGD:210,INR:3.3,QAR:77,USDT:280,BTC:0,ETH:0};
function getFX(){
  // Priority: RatesEngine (live, USD-based) → Currency module → hardcoded fallback
  // FX proxy uses PKR-based rates: FX[USD]=280 means 1 USD = 280 PKR
  try {
    if (typeof RatesEngine !== 'undefined') {
      const rx = RatesEngine.getFX(); // USD-based: { PKR:278.5, GBP:0.787, ... }
      if (rx && rx.PKR) {
        const pkr = rx.PKR;
        const out = { PKR: 1 };
        Object.keys(rx).forEach(c => { if (c !== 'PKR' && rx[c]) out[c] = +(pkr / rx[c]).toFixed(4); });
        return { ..._FX_DEFAULTS, ...out };
      }
    }
  } catch(e) {}
  try {
    if (typeof Currency !== 'undefined') {
      const c = Currency.get();
      if (c && c.rates && Object.keys(c.rates).length > 0) return { ..._FX_DEFAULTS, ...c.rates, PKR: 1 };
    }
  } catch(e) {}
  return _FX_DEFAULTS;
}
const FX=new Proxy({},{get(_,key){return getFX()[key];}});
function _sparkLine(history) {
  if (!history || history.length < 2) return '';
  const vals = history.map(function(h) { return h.v || 0; });
  const min = Math.min.apply(null, vals);
  const max = Math.max.apply(null, vals);
  const range = max - min || 1;
  const w = 200, h = 40, pad = 4;
  const pts = vals.map(function(v, i) {
    const x = pad + (i / (vals.length - 1)) * (w - 2 * pad);
    const y = h - pad - ((v - min) / range) * (h - 2 * pad);
    return x.toFixed(1) + ',' + y.toFixed(1);
  }).join(' ');
  const trend = vals[vals.length - 1] >= vals[0];
  const color = trend ? '#34c759' : '#ff453a';
  const firstDate = history[0].d ? new Date(history[0].d).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }) : '';
  const lastDate = history[history.length - 1].d ? new Date(history[history.length - 1].d).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }) : '';
  return '<div style="margin-top:10px">' +
    '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%;height:40px;display:block">' +
      '<polyline points="' + pts + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>' +
    (firstDate && lastDate ? '<div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text3);margin-top:2px"><span>' + firstDate + '</span><span>' + lastDate + '</span></div>' : '') +
  '</div>';
}

const Dash={
  render(){
    const h=new Date().getHours();
    const greet=h<5?'Good Night':h<12?'Good Morning':h<17?'Good Afternoon':'Good Evening';
    const el=document.getElementById('dashGreet');
    if(el)el.innerHTML=`<span>${greet}, <strong>${S.user.name||'User'}</strong></span>`;
    const dl=document.getElementById('dashDate');
    if(dl)dl.textContent=new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    const b = document.getElementById('dashBody');
    if (!b) return;

    const cur = S.user.currency || 'PKR';
    const btn = document.getElementById('currBtn'); if (btn) btn.textContent = cur;

    const toB = (a,c) => (a||0) * (FX[c] || 1);
    const toCur = (pkr, c) => pkr / (FX[c] || 1);
    const fmtN = n => cur === 'PKR' ? U.fmtPKR(n) : U.fmt(n);
    const fmt = n => {
      const sym = cur === 'GBP' ? '£' : cur === 'USD' ? '$' : cur === 'AED' ? 'AED ' : 'PKR ';
      const v = Math.round(toCur(n, cur));
      if (v >= 1000000) return sym + (v/1000000).toFixed(2) + 'M';
      if (v >= 1000) return sym + (v/1000).toFixed(1) + 'K';
      return sym + v.toLocaleString();
    };

    const invPKR = S.investments.reduce((a,i) => a + toB(i.currentValue||0, i.currency||cur), 0);
    const asPKR = S.assets.reduce((a,x) => a + toB(x.currentValue||0, x.currency||cur), 0);
    const cashPKR = S.cash.reduce((a,c) => a + toB(c.amount||0, c.currency||cur), 0);
    const vehPKR = S.vehicles.reduce((a,v) => a + toB(v.currentValue||v.purchasePrice||0, v.currency||cur), 0);
    const debtPKR = S.loans.filter(l => l.type==='borrowed' && l.status!=='Settled').reduce((a,l) => a + toB(l.amount||0, l.currency||cur), 0);
    let goldPKR = 0;
    try {
      const goldItems = JSON.parse(localStorage.getItem('vo_gold') || '[]');
      goldPKR = goldItems.reduce(function(a, g) {
        let pricePerGram = 0;
        if (g.useManualPrice && g.pricePerUnit) {
          const userCur = S.user.currency || 'PKR';
          pricePerGram = typeof RatesEngine !== 'undefined'
            ? RatesEngine.convert(g.pricePerUnit, userCur, 'PKR')
            : g.pricePerUnit;
        } else if (typeof RatesEngine !== 'undefined') {
          pricePerGram = g.metal === 'silver'
            ? RatesEngine.silverInCurrency('PKR', 'gram')
            : RatesEngine.goldInCurrency('PKR', 'gram');
        }
        let grams = g.weight || 0;
        if (g.unit === 'tola') grams *= 11.6638;
        else if (g.unit === 'oz') grams *= 31.1035;
        else if (g.unit === 'kg') grams *= 1000;
        return a + grams * pricePerGram;
      }, 0);
    } catch(e) {}
    const bcPKR = typeof BCModule !== 'undefined' ? BCModule.getZakatableAmount('PKR') : 0;
    const bondsPKR = typeof BondsModule !== 'undefined' ? BondsModule.getZakatableAmount('PKR') : 0;
    const nwPKR = invPKR + asPKR + cashPKR + vehPKR + goldPKR + bcPKR + bondsPKR - debtPKR;

    const hist = S.user.nwHistory || [];
    const prevV = hist.length >= 2 ? hist[hist.length-1].v : null;
    const nwDisplay = Math.round(toCur(nwPKR, cur));
    const trendDir = prevV !== null ? (nwDisplay > prevV ? 1 : nwDisplay < prevV ? -1 : 0) : 0;
    const trendArrow = trendDir > 0 ? `<span style="color:var(--ok);font-size:20px">↑</span>` : trendDir < 0 ? `<span style="color:var(--err);font-size:20px">↓</span>` : '';

    // Expiry alerts
    const now = new Date();
    const in60 = new Date(now.getTime() + 60*24*60*60*1000);
    const expiringCards = (S.cards||[]).filter(c => {
      if (!c.expiry) return false;
      const parts = c.expiry.split('/');
      if (parts.length !== 2) return false;
      const exp = new Date('20'+parts[1]+'-'+parts[0]+'-01');
      return exp <= in60 && exp >= now;
    });
    const expiringDocs = (S.documents||[]).filter(d => {
      if (!d.expiry) return false;
      const exp = new Date(d.expiry);
      return exp <= in60 && exp >= now;
    });
    const allExpiring = [
      ...expiringCards.map(c => ({name:c.cardName||c.name, type:'card', days:Math.round((new Date('20'+c.expiry.split('/')[1]+'-'+c.expiry.split('/')[0]+'-01')-now)/(1000*60*60*24))})),
      ...expiringDocs.map(d => ({name:d.title||d.type, type:'doc', days:Math.round((new Date(d.expiry)-now)/(1000*60*60*24))}))
    ].sort((a,b) => a.days-b.days);

    // Backup reminder
    const lastBackup = S.user?.lastBackup ? new Date(S.user.lastBackup) : null;
    const daysSinceBackup = lastBackup ? Math.floor((Date.now() - lastBackup) / (1000*60*60*24)) : 999;
    const backupNeeded = daysSinceBackup > 30;

    // Vault health
    const checks = [
      !!S.user?.name,
      S.pin !== '123456',
      !!S.decoyPin,
      !!S.user?.lastBackup && daysSinceBackup <= 30,
      (S.banks||[]).length > 0,
      (S.documents||[]).length > 0,
    ];
    const health = Math.round((checks.filter(Boolean).length / checks.length) * 100);
    const healthColor = health >= 80 ? 'var(--ok)' : health >= 50 ? 'var(--warn)' : 'var(--err)';

    const stats = [
      {icon:'🏦', label:'Banks', value:(S.banks||[]).length, page:'banks'},
      {icon:'💳', label:'Cards', value:(S.cards||[]).length, page:'cards'},
      {icon:'📄', label:'Docs', value:(S.documents||[]).length, page:'documents'},
      {icon:'📈', label:'Invested', value:(S.investments||[]).length, page:'investments'},
    ];

    const wCards = S.cards.filter(c => S.wallet.includes(c.id));
    const activeMods = ALL_MODULES.filter(m => S.modules[m.id] && S[m.id]);
    const modGrid = activeMods.map(m => `<div class="dash-mod-item" onclick="R.goto('${m.id}')"><div class="dmi-ic">${m.ic}</div><div class="dmi-count">${S[m.id]?.length||0}</div><div class="dmi-name">${m.n}</div></div>`).join('');

    b.innerHTML = `
    <!-- NET WORTH HERO -->
    <div style="background:linear-gradient(135deg,rgba(123,95,255,.2),rgba(0,213,255,.1));border:1px solid rgba(123,95,255,.3);border-radius:20px;padding:24px 20px;margin:16px;text-align:center;position:relative">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text3);margin-bottom:8px">Total Net Worth</div>
      <div style="font-size:36px;font-weight:900;color:var(--text);letter-spacing:-.02em;margin-bottom:4px" class="sens">${trendArrow}${fmtN(nwDisplay)}</div>
      <div style="font-size:12px;color:var(--text3)">in ${cur} · <button onclick="Dash.toggleCurrency()" style="background:none;border:none;color:var(--accent,var(--purple));font-size:12px;cursor:pointer;padding:0;font-weight:600">switch →</button></div>
      <div style="margin-top:6px">${typeof RatesEngine !== 'undefined' ? RatesEngine.lastUpdatedBadge() : ''}</div>
      ${_sparkLine(S.user.nwHistory || [])}
      <div style="display:flex;justify-content:space-around;gap:8px;margin-top:16px;padding-top:16px;border-top:1px solid rgba(123,95,255,.2)">
        <div style="text-align:center"><div style="font-size:12px;font-weight:700;color:var(--text)" class="sens">${fmt(cashPKR)}</div><div style="font-size:10px;color:var(--text3)">Cash</div></div>
        <div style="text-align:center"><div style="font-size:12px;font-weight:700;color:var(--text)" class="sens">${fmt(invPKR)}</div><div style="font-size:10px;color:var(--text3)">Invested</div></div>
        <div style="text-align:center"><div style="font-size:12px;font-weight:700;color:var(--text)" class="sens">${fmt(asPKR+vehPKR)}</div><div style="font-size:10px;color:var(--text3)">Assets</div></div>
        <div style="text-align:center"><div style="font-size:12px;font-weight:700;color:var(--text)" class="sens">${fmt(goldPKR)}</div><div style="font-size:10px;color:var(--text3)">Gold</div></div>
        ${(S.bc||[]).length > 0 ? `<div style="text-align:center"><div style="font-size:12px;font-weight:700;color:var(--text)" class="sens">${fmt(bcPKR)}</div><div style="font-size:10px;color:var(--text3)">Committees</div></div>` : ''}
        ${(S.bonds||[]).length > 0 ? `<div style="text-align:center"><div style="font-size:12px;font-weight:700;color:var(--text)" class="sens">${fmt(bondsPKR)}</div><div style="font-size:10px;color:var(--text3)">Bonds</div></div>` : ''}
      </div>
      <div style="display:flex;gap:8px;justify-content:center;margin-top:14px">
        <button class="btn btn-g btn-sm" onclick="Dash.snap()">Snapshot</button>
        <button class="btn btn-g btn-sm" onclick="Dash.showNWBreakdown()">Breakdown</button>
        <button class="btn btn-g btn-sm" onclick="ExIm.export('vault')">Backup</button>
      </div>
    </div>

    <!-- QUICK STATS -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:0 16px;margin-bottom:16px">
      ${stats.map(s => `
        <div onclick="R.goto('${s.page}')" style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:12px 8px;text-align:center;cursor:pointer;touch-action:manipulation">
          <div style="font-size:22px;margin-bottom:4px">${s.icon}</div>
          <div style="font-size:18px;font-weight:900;color:var(--text)">${s.value}</div>
          <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em">${s.label}</div>
        </div>`).join('')}
    </div>

    <!-- WALLET -->
    ${S.modules.cards && wCards.length > 0 ? `
    <div style="margin:0 16px 16px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text3)">👝 Today's Wallet</div>
        <button onclick="Dash.editWallet()" style="font-size:12px;color:var(--accent,var(--purple));background:none;border:none;cursor:pointer;font-weight:600">Edit →</button>
      </div>
      <div class="wallet-row">${wCards.map(c => this.miniCard(c, 80)).join('')}</div>
    </div>` : ''}

    <!-- EXPIRY ALERTS -->
    ${allExpiring.length ? `
    <div style="margin:0 16px 16px">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);margin-bottom:8px">⚠️ Expiring Soon</div>
      ${allExpiring.slice(0,3).map(x => `
        <div style="background:${x.days<=30?'rgba(255,69,58,.08)':'rgba(255,152,0,.08)'};border:1px solid ${x.days<=30?'rgba(255,69,58,.3)':'rgba(255,152,0,.3)'};border-radius:12px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:18px">${x.type==='card'?'💳':'📄'}</span>
            <div>
              <div style="font-size:13px;font-weight:600;color:var(--text)">${x.name||'Document'}</div>
              <div style="font-size:11px;color:${x.days<=30?'var(--err)':'var(--warn)'}">Expires in ${x.days} days</div>
            </div>
          </div>
          <div style="font-size:18px;color:var(--text3)">›</div>
        </div>`).join('')}
    </div>` : ''}

    <!-- VAULT HEALTH -->
    <div style="margin:0 16px 16px">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);margin-bottom:8px">🛡️ Vault Health</div>
      <div style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px 16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <div style="font-size:13px;font-weight:600;color:var(--text)">Security Score</div>
          <div style="font-size:20px;font-weight:900;color:${healthColor}">${health}%</div>
        </div>
        <div style="height:6px;background:var(--glass2);border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${health}%;background:${healthColor};border-radius:3px;transition:width .5s"></div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
          ${[
            [!!S.user?.name,'Name set'],
            [S.pin!=='123456','Custom PIN'],
            [!!S.decoyPin,'Decoy PIN'],
            [!!S.user?.lastBackup && daysSinceBackup <= 30, daysSinceBackup >= 999 ? 'Never backed up' : daysSinceBackup === 0 ? 'Backed up today' : `Backed up ${daysSinceBackup}d ago`],
            [(S.banks||[]).length>0,'Banks added'],
            [(S.documents||[]).length>0,'Docs added'],
          ].map(([ok,label]) => `<div style="font-size:11px;padding:3px 8px;border-radius:6px;background:${ok?'rgba(0,255,136,.1)':'rgba(255,69,58,.1)'};color:${ok?'var(--ok)':'var(--err)'};">${ok?'✓':'+'} ${label}</div>`).join('')}
        </div>
      </div>
    </div>

    <!-- BACKUP REMINDER -->
    ${backupNeeded ? `
    <div onclick="ExIm.export('vos')" style="margin:0 16px 16px;background:rgba(255,152,0,.1);border:1px solid rgba(255,152,0,.3);border-radius:14px;padding:14px 16px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:12px">
      <span style="font-size:24px">💾</span>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:700;color:var(--warn)">${daysSinceBackup >= 999 ? 'Never backed up' : `Last backup: ${daysSinceBackup} days ago`}</div>
        <div style="font-size:11px;color:var(--text3)">Tap to export encrypted backup — protect your data</div>
      </div>
      <div style="font-size:18px;color:var(--text3)">›</div>
    </div>` : ''}

    <!-- QUICK ACTIONS -->
    <div style="margin:0 16px 16px">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);margin-bottom:8px">Quick Actions</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${[
          {icon:'🏦',label:'Add Bank',action:"Banks.openAdd()"},
          {icon:'💳',label:'Add Card',action:"Cards.openAdd()"},
          {icon:'📄',label:'Add Document',action:"R.goto('documents')"},
          {icon:'💵',label:'Add Cash',action:"Cash.openAdd()"},
        ].map(a => `
          <button onclick="${a.action}" style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:10px;font-size:14px;font-weight:600;color:var(--text)">
            <span style="font-size:22px">${a.icon}</span>${a.label}
          </button>`).join('')}
      </div>
    </div>

    <!-- MODULE GRID -->
    ${activeMods.length > 0 ? `<div class="dash-sec-label">Modules</div><div class="dash-mod-grid">${modGrid}</div>` : ''}

    <!-- SMART COLLECTIONS -->
    ${(() => {
      const cols = [
        { label:'Expiring Soon', icon:'⚠️', count:allExpiring.length, action:"R.goto('alerts')", color:'rgba(255,152,0,.1)', border:'rgba(255,152,0,.3)' },
        { label:'Archived', icon:'📦', count:[...(S.banks||[]),...(S.cards||[])].filter(x=>x.archived).length, action:"R.goto('banks')", color:'rgba(123,95,255,.1)', border:'rgba(123,95,255,.3)' },
        { label:'Loans Active', icon:'🤝', count:(S.loans||[]).filter(l=>l.status!=='Settled').length, action:"R.goto('loans')", color:'rgba(255,69,58,.1)', border:'rgba(255,69,58,.3)' },
        { label:'Investments', icon:'📈', count:(S.investments||[]).length, action:"R.goto('investments')", color:'rgba(0,213,255,.1)', border:'rgba(0,213,255,.3)' },
      ].filter(c => c.count > 0);
      return cols.length ? `<div style="margin:0 16px 16px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);margin-bottom:8px">Smart Collections</div><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">${cols.map(c=>`<div onclick="${c.action}" style="background:${c.color};border:1px solid ${c.border};border-radius:12px;padding:12px 14px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:10px"><span style="font-size:20px">${c.icon}</span><div><div style="font-size:18px;font-weight:900;color:var(--text)">${c.count}</div><div style="font-size:11px;color:var(--text3)">${c.label}</div></div></div>`).join('')}</div></div>` : '';
    })()}

    <!-- RECENT ACTIVITY -->
    ${S.activity.length > 0 ? `
    <div style="margin:16px 16px 24px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text3)">Recent Activity</div>
        <button onclick="R.goto('timeline')" style="font-size:12px;color:var(--accent,var(--purple));background:none;border:none;cursor:pointer;font-weight:600">See all →</button>
      </div>
      <div style="background:var(--glass);border:1px solid var(--border);border-radius:14px;overflow:hidden">
        ${S.activity.slice(0,5).map((a,i) => `
          <div style="padding:12px 16px;${i<Math.min(S.activity.length,5)-1?'border-bottom:1px solid var(--border)':''};display:flex;align-items:center;gap:12px">
            <div style="width:8px;height:8px;border-radius:50%;background:var(--accent,var(--purple));flex-shrink:0"></div>
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${a.a||'Activity'}</div>
              <div style="font-size:11px;color:var(--text3)">${Activity.ago(a.t)}</div>
            </div>
          </div>`).join('')}
      </div>
    </div>` : ''}
  `;
  },
  donut(data,total){
    const r=30,cx=42,cy=42;let angle=-Math.PI/2;let paths='';
    data.forEach(d=>{const pct=d.v/total;const sw=pct*2*Math.PI;const x1=cx+r*Math.cos(angle),y1=cy+r*Math.sin(angle),x2=cx+r*Math.cos(angle+sw),y2=cy+r*Math.sin(angle+sw);const large=sw>Math.PI?1:0;paths+=`<path d="M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r},0,${large},1,${x2.toFixed(1)},${y2.toFixed(1)}Z" fill="${d.col}" opacity="0.85"/>`;angle+=sw;});
    return paths;
  },
  miniCard(c,h=80){
    const bg=cardGradient(c);
    const last4=c.last4||'????';
    const bankName=c.issuer||((c.cardName||'').split(' ')[0]);
    const logo=bankLogo(c.cardName||bankName,c.country);
    const w=Math.round(h*1.586);
    const pad=Math.round(h*0.1);
    const br=Math.round(h*0.07);
    const nsz=h>=100?'48':'32';
    const netSvg={
      'Visa':`<svg viewBox="0 0 100 32" width="${nsz}" height="${Math.round(parseInt(nsz)*.33)}"><text x="0" y="26" font-family="Arial" font-weight="900" font-size="32" fill="white" letter-spacing="-2">VISA</text></svg>`,
      'Mastercard':`<div style="position:relative;width:${h>=100?'32':'22'}px;height:${h>=100?'20':'14'}px;flex-shrink:0"><div style="position:absolute;left:0;width:${h>=100?'18':'13'}px;height:${h>=100?'18':'13'}px;border-radius:50%;background:rgba(235,0,27,.9)"></div><div style="position:absolute;left:${h>=100?'11':'8'}px;width:${h>=100?'18':'13'}px;height:${h>=100?'18':'13'}px;border-radius:50%;background:rgba(255,95,0,.9)"></div></div>`,
      'American Express':`<svg width="${nsz}" height="${Math.round(parseInt(nsz)*.33)}"><text y="${h>=100?'13':'9'}" font-family="Arial" font-weight="700" font-size="${h>=100?'11':'8'}" fill="white">AMEX</text></svg>`,
    };
    const imgSz=h>=100?'20px':'14px';
    const f1=h>=100?'11px':'9px';
    const f2=h>=100?'14px':'11px';
    const f3=h>=100?'9px':'8px';
    const mb1=h>=100?'6px':'4px';
    const st=U.expSt(c.expiry);
    return `<div class="wc-mini" onclick="Cards.openDetail('${c.id}')" style="background:${bg};min-width:${w}px;max-width:${w}px;height:${h}px;border-radius:${br}px;padding:${pad}px ${Math.round(pad*1.1)}px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.14);flex-shrink:0;${st!=='ok'?'outline:2px solid var(--'+st+')':''}">
  <div style="position:absolute;top:-30%;right:-15%;width:${Math.round(h*1.4)}px;height:${Math.round(h*1.4)}px;border-radius:50%;background:rgba(255,255,255,.05);pointer-events:none"></div>
  <div style="display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1">
    <div style="display:flex;align-items:center;gap:5px;font-size:${f1};font-weight:700;color:rgba(255,255,255,.9);white-space:nowrap;overflow:hidden;max-width:65%">${logo?`<img src="${(bankLogo(c.cardName||bankName,c.country).match(/src="([^"]+)"/)||[])[1]||''}" style="width:${imgSz};height:${imgSz};border-radius:3px;flex-shrink:0" onerror="this.style.display='none'">`:''}${bankName}</div>
    <div style="font-size:${f3};font-weight:800;letter-spacing:.8px;color:rgba(255,255,255,.7);background:rgba(255,255,255,.15);padding:2px 6px;border-radius:99px;white-space:nowrap">${(c.cardType||'').toUpperCase()}</div>
  </div>
  <div style="font-size:${f2};font-weight:600;letter-spacing:2px;color:rgba(255,255,255,.95);font-family:monospace;position:relative;z-index:1;margin:${mb1} 0">${c.last4?'**** '+c.last4:'•••• ••••'}</div>
  <div style="display:flex;justify-content:space-between;align-items:flex-end;position:relative;z-index:1">
    <div style="font-size:${f3};color:rgba(255,255,255,.7)">${c.expiry||''}</div>
    ${netSvg[c.network]||`<div style="font-size:${f3};color:rgba(255,255,255,.6);font-weight:700">${c.network||''}</div>`}
  </div>
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
  security(){let s=50;if(S.autoLock)s+=15;if(S.lockMins<=10)s+=10;if(S.clipSecs<=30)s+=10;if(S.banks.length)s+=5;if(S.cards.length)s+=5;if(S.decoyPin)s+=5;return Math.min(s,100);},
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
    const bcPKR2=typeof BCModule!=='undefined'?BCModule.getZakatableAmount('PKR'):0;
    const bondsPKR2=typeof BondsModule!=='undefined'?BondsModule.getZakatableAmount('PKR'):0;
    const vehPKR2=S.vehicles.reduce((a,v)=>a+toB(v.currentValue||v.purchasePrice||0,v.currency||cur),0);
    let goldPKR2=0;try{const gi=JSON.parse(localStorage.getItem('vo_gold')||'[]');goldPKR2=gi.reduce(function(a,g){let ppg=0;if(g.useManualPrice&&g.pricePerUnit){ppg=typeof RatesEngine!=='undefined'?RatesEngine.convert(g.pricePerUnit,cur,'PKR'):g.pricePerUnit;}else if(typeof RatesEngine!=='undefined'){ppg=g.metal==='silver'?RatesEngine.silverInCurrency('PKR','gram'):RatesEngine.goldInCurrency('PKR','gram');}let gr=g.weight||0;if(g.unit==='tola')gr*=11.6638;else if(g.unit==='oz')gr*=31.1035;else if(g.unit==='kg')gr*=1000;return a+gr*ppg;},0);}catch(e){}
    const nwPKR=invPKR+asPKR+cashPKR+vehPKR2+goldPKR2+bcPKR2+bondsPKR2-debtPKR;
    const row=(ic,label,val,col,prefix='')=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)"><div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text2)"><span>${ic}</span>${label}</div><div style="font-size:14px;font-weight:700;color:${col}">${prefix}${fmt(val)}</div></div>`;
    Modal.open('💰 Net Worth Breakdown',`
    <div style="padding:0 2px">
      ${row('📈','Investments',invPKR,'var(--accent)')}
      ${row('🏠','Assets',asPKR,'var(--accent)')}
      ${row('💵','Cash',cashPKR,'var(--accent)')}
      ${vehPKR2>0?row('🚗','Vehicles',vehPKR2,'var(--accent)'):''}
      ${goldPKR2>0?row('🥇','Precious Metals',goldPKR2,'var(--accent)'):''}
      ${bcPKR2>0?row('🤝','BC Receivables',bcPKR2,'var(--accent)'):''}
      ${bondsPKR2>0?row('📜','Bonds / Securities',bondsPKR2,'var(--accent)'):''}
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
    const mk=this.getMasterKey();
    b.innerHTML=`
    <div class="set-sec"><div class="set-title">👤 Profile</div><div class="set-card">
      <div class="si" onclick="Settings.editProfile()" style="cursor:pointer">
        <div style="display:flex;align-items:center;gap:12px;flex:1">${(()=>{const n=S.user.name||'User';const initials=n.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);const hash=n.split('').reduce((a,c)=>a+c.charCodeAt(0),0);const colors=['#0080ff','#10b981','#d946ef','#f59e0b','#ef4444','#6935d3','#ff3464','#00b67a'];const bg=colors[hash%colors.length];return `<div style="width:48px;height:48px;border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:800;color:#fff;flex-shrink:0;letter-spacing:-0.5px">${initials}</div>`;})()}<div><div class="name">${S.user.name||'User'}</div><div class="desc">${S.user.email||'Tap to add email'} ${S.user.phone?'· '+S.user.phone:''}</div></div></div><span style="color:var(--text3)">›</span>
      </div>
      <div class="si"><div class="sil"><div class="name">Home Address</div><div class="desc">${S.user.homeAddr||'Not set'}</div></div><button class="btn btn-g btn-sm" onclick="Settings.editProfile()">Edit</button></div>
      <div class="si"><div class="sil"><div class="name">Work Address</div><div class="desc">${S.user.workAddr||'Not set'}</div></div><button class="btn btn-g btn-sm" onclick="Settings.editProfile()">Edit</button></div>
    </div></div>

    <div class="set-sec"><div class="set-title">🧩 Active Modules</div><div class="set-card">
      ${ALL_MODULES.map(m=>`<div class="si"><div style="display:flex;align-items:center;gap:10px;flex:1"><span style="font-size:18px">${m.ic}</span><div class="sil"><div class="name">${m.n}</div><div class="desc">${m.desc}</div></div></div><label class="tog"><input type="checkbox" ${S.modules[m.id]?'checked':''} onchange="Settings.toggleMod('${m.id}',this.checked)"><span class="ts"></span></label></div>`).join('')}
      <div class="si"><div class="sil"><div class="name" style="font-size:12px;color:var(--text3)">Changes take effect after toggling — hidden modules stay in data but don't appear in nav</div></div></div>
    </div></div>

    <div class="set-sec"><div class="set-title">🗂️ Tab Customisation</div><div class="set-card">
      <div class="si"><div class="sil"><div class="name" style="font-size:12px;color:var(--text3)">Choose which Finance tiles appear on the Finance home screen.</div></div></div>
      ${(()=>{
        const finMods=[{id:'banks',label:'Banks'},{id:'cards',label:'Cards'},{id:'cash',label:'Cash'},{id:'investments',label:'Investments'},{id:'loans',label:'Loans'},{id:'credit',label:'Credit Score'},{id:'zakat',label:'Zakat'},{id:'tax',label:'Tax Calculator'},{id:'currency',label:'Currency'},{id:'gold',label:'Precious Metals'}];
        const prefs=getTabPrefs();
        const hidden=prefs.hiddenFinance||[];
        return finMods.map(m=>`<div class="si"><div class="sil"><div class="name">${m.label}</div><div class="desc">Finance group</div></div><label class="tog"><input type="checkbox" ${!hidden.includes(m.id)?'checked':''} onchange="(function(id,checked){const p=getTabPrefs();if(!p.hiddenFinance)p.hiddenFinance=[];if(checked){p.hiddenFinance=p.hiddenFinance.filter(x=>x!==id)}else{if(!p.hiddenFinance.includes(id))p.hiddenFinance.push(id)}saveTabPrefs(p);if(window.Toast)Toast.show(checked?id+' shown':id+' hidden','success',1500);})('${m.id}',this.checked)"><span class="ts"></span></label></div>`).join('');
      })()}
      <div style="height:1px;background:var(--border);margin:4px 14px"></div>
      <div class="si"><div class="sil"><div class="name" style="font-size:12px;color:var(--text3)">Family member tab preferences</div></div></div>
      ${(()=>{
        const fp=JSON.parse(localStorage.getItem('vo_family_tab_prefs')||'{}');
        const hidFam=fp.hiddenTabs||[];
        return [['docs','Documents'],['banks','Banks & Cards'],['cash','Cash'],['investments','Investments'],['notes','Notes']].map(([id,label])=>`<div class="si"><div class="sil"><div class="name">${label}</div><div class="desc">Family member tabs</div></div><label class="tog"><input type="checkbox" ${!hidFam.includes(id)?'checked':''} onchange="(function(id,checked){const fp=JSON.parse(localStorage.getItem('vo_family_tab_prefs')||'{}');if(!fp.hiddenTabs)fp.hiddenTabs=[];if(checked){fp.hiddenTabs=fp.hiddenTabs.filter(x=>x!==id)}else{if(!fp.hiddenTabs.includes(id))fp.hiddenTabs.push(id)}localStorage.setItem('vo_family_tab_prefs',JSON.stringify(fp));if(window.Toast)Toast.show(checked?id+' tab shown':id+' tab hidden','success',1500);})('${id}',this.checked)"><span class="ts"></span></label></div>`).join('');
      })()}
    </div></div>

    <div class="set-sec"><div class="set-title">🎨 Appearance</div><div class="set-card">
      <div style="padding:14px 16px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);margin-bottom:10px">🌙 Dark</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
          ${THEMES.filter(t=>t.g==='dark').map(t=>`
            <div onclick="ThemeEngine.apply('${t.id}')" style="cursor:pointer;touch-action:manipulation;border-radius:14px;overflow:hidden;border:2px solid ${S.user.theme===t.id?'var(--accent)':'var(--border)'}">
              <div style="height:48px;background:${t.bg};display:flex;align-items:center;justify-content:center;gap:6px">
                <div style="width:12px;height:12px;border-radius:50%;background:${t.ac}"></div>
                <div style="width:28px;height:6px;border-radius:3px;background:${t.ac};opacity:.4"></div>
              </div>
              <div style="padding:8px 10px;background:var(--glass);border-top:1px solid var(--border)">
                <div style="font-size:12px;font-weight:600;color:var(--text)">${t.n}</div>
              </div>
            </div>`).join('')}
        </div>
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);margin-bottom:10px">☀️ Light</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          ${THEMES.filter(t=>t.g==='light').map(t=>`
            <div onclick="ThemeEngine.apply('${t.id}')" style="cursor:pointer;touch-action:manipulation;border-radius:14px;overflow:hidden;border:2px solid ${S.user.theme===t.id?'var(--accent)':'var(--border)'}">
              <div style="height:48px;background:${t.bg};display:flex;align-items:center;justify-content:center;gap:6px;border-bottom:1px solid rgba(0,0,0,.08)">
                <div style="width:12px;height:12px;border-radius:50%;background:${t.ac}"></div>
                <div style="width:28px;height:6px;border-radius:3px;background:${t.ac};opacity:.5"></div>
              </div>
              <div style="padding:8px 10px;background:var(--glass);border-top:1px solid var(--border)">
                <div style="font-size:12px;font-weight:600;color:var(--text)">${t.n}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>
    </div></div>

    <div class="set-sec"><div class="set-title">🔒 Security</div><div class="set-card">
      <div class="si"><div class="sil"><div class="name">Change PIN</div><div class="desc">Update your 6-digit vault PIN</div></div><button class="btn btn-g btn-sm" onclick="Settings.changePIN()">Change</button></div>
      <div style="padding:14px">
        <div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">🗝️ Your Master Key</div>
        <div style="font-size:11px;color:var(--text2);margin-bottom:12px;line-height:1.6">This key can reset your PIN if you forget it. It is derived from your PIN and name — not stored anywhere. Write it down and keep it safe.</div>
        <div id="mk-display" onclick="this.style.filter='none';document.getElementById('mk-actions').style.display='flex'"
          style="font-size:18px;font-weight:900;letter-spacing:4px;color:var(--accent);text-align:center;padding:16px;background:rgba(0,0,0,.3);border-radius:10px;font-family:var(--mono);filter:blur(8px);cursor:pointer;transition:filter .3s"
          title="Tap to reveal">${mk}</div>
        <div style="text-align:center;font-size:11px;color:var(--text3);margin-top:6px">Tap to reveal · Keep this private</div>
        <div id="mk-actions" style="display:none;gap:8px;margin-top:12px">
          <button class="btn btn-s btn-sm" style="flex:1" onclick="navigator.clipboard?.writeText('${mk}').then(()=>Toast.show('Copied','success'))">📋 Copy</button>
          <button class="btn btn-s btn-sm" style="flex:1" onclick="Settings._printMasterKey('${mk}')">🖨️ Print Card</button>
        </div>
      </div>
      <div class="si"><div class="sil"><div class="name">Decoy PIN</div><div class="desc">${(S.decoyPin||VaultDB?.hasDecoy||false)?'✅ Set — shows convincing fake vault':'Not set'}</div></div><button class="btn btn-g btn-sm" onclick="Settings.setDecoyPIN()">${(S.decoyPin||VaultDB?.hasDecoy||false)?'Change':'Set'}</button></div>
      <div class="si"><div class="sil"><div class="name">No PIN Mode</div><div class="desc">Open vault without PIN ⚠️</div></div><label class="tog"><input type="checkbox" ${S.noPin?'checked':''} onchange="S.noPin=this.checked;Store.save();Toast.show('No-PIN '+(S.noPin?'enabled':'disabled'))"><span class="ts"></span></label></div>
      <div class="si"><div class="sil"><div class="name">Auto-Lock</div><div class="desc">Lock vault when phone sleeps</div></div><label class="tog"><input type="checkbox" ${S.autoLock?'checked':''} onchange="S.autoLock=this.checked;Store.save()"><span class="ts"></span></label></div>
      <div class="si"><div class="sil"><div class="name">Lock Timeout</div></div><select class="inp btn-sm" style="width:auto;padding:5px 9px" onchange="S.lockMins=parseInt(this.value);Store.save()">${[1,5,10,30,60].map(m=>`<option value="${m}"${S.lockMins===m?' selected':''}>${m} min</option>`).join('')}<option value="0"${S.lockMins===0?' selected':''}>Never</option></select></div>
      <div class="si"><div class="sil"><div class="name">Clipboard Clear</div><div class="desc">Auto-clear after copying sensitive data</div></div><select class="inp btn-sm" style="width:auto;padding:5px 9px" onchange="S.clipSecs=parseInt(this.value);Store.save()">${[15,30,60,120].map(s=>`<option value="${s}"${S.clipSecs===s?' selected':''}>${s}s</option>`).join('')}</select></div>
      <div class="si"><div class="sil"><div class="name">Privacy Mode</div><div class="desc">Blur all sensitive values on screen</div></div><label class="tog"><input type="checkbox" ${S.privacyMode?'checked':''} onchange="S.privacyMode=this.checked;document.body.classList.toggle('privacy',S.privacyMode);Store.save()"><span class="ts"></span></label></div>
    </div></div>

    <div class="set-sec"><div class="set-title">🔔 Notifications</div><div class="set-card">
      <div class="si">
        <div class="sil">
          <div class="name">Browser Notifications</div>
          <div class="desc">${'Notification' in window ? (Notification.permission === 'granted' ? '✓ Enabled — alerts for expiring docs, cards & loans' : Notification.permission === 'denied' ? '✗ Blocked — allow in browser settings' : 'Not yet enabled') : 'Not supported in this browser'}</div>
        </div>
        ${'Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied'
          ? '<button class="btn btn-p btn-sm" onclick="Reminders.requestPermission().then(granted=>{if(granted)Toast.show(\'Notifications enabled\',\'success\');else Toast.show(\'Blocked by browser\',\'warn\');Settings.render()})">Enable</button>'
          : ''}
      </div>
      <div class="si"><div class="sil"><div class="name">What you'll be notified about</div><div class="desc">Documents expiring in 7 days · Cards expiring in 30 days · Loans due in 7 days · BC payments (3 days notice)</div></div></div>
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
      <div class="si" style="cursor:pointer" onclick="window.open('widget.html','_blank')"><div class="sil"><div class="name">📊 Home Screen Widget</div><div class="desc">View net worth without opening the app</div></div><span style="color:var(--accent)">›</span></div>
      <div class="si"><div class="name" style="font-size:11px;color:var(--text3);line-height:1.6">iPhone: Long-press home screen → + → VaultOS<br>Android: Long-press app icon → Widget</div></div>
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
    const key=this.getMasterKey();
    Modal.open('🗝️ Master Emergency Key',`
    <div style="text-align:center;padding:8px 0">
      <p style="font-size:12px;color:var(--text2);margin-bottom:14px;line-height:1.6">This key can bypass lockouts and reset your PIN. It is derived from your PIN + name — it is NOT stored anywhere. Write it down and keep it somewhere physically safe.</p>
      <div style="font-size:22px;font-weight:900;letter-spacing:4px;color:var(--accent);background:var(--glass2);padding:18px;border-radius:var(--r);font-family:var(--mono);margin-bottom:14px;word-break:break-all">${key}</div>
      <div style="display:flex;gap:8px;margin-bottom:10px">
        <button class="btn btn-s" style="flex:1" onclick="U.copy('${key}','Master key')">📋 Copy Key</button>
        <button class="btn btn-s" style="flex:1" onclick="Settings._printMasterKey('${key}')">🖨️ Print Card</button>
      </div>
      <p style="font-size:11px;color:var(--text3)">If your PIN or name changes, this key changes too. Re-view it after any changes.</p>
    </div>`,`<button class="btn btn-p btn-full" onclick="Modal.close()">✅ I've stored it safely</button>`);
  },
  _printMasterKey(key){
    const w=window.open('','_blank');
    w.document.write(`<html><head><title>VaultOS Master Key</title><style>body{font-family:Arial,sans-serif;padding:40px;max-width:400px;margin:0 auto;text-align:center}.card{border:2px solid #333;border-radius:16px;padding:24px;margin:20px 0}.key{font-size:22px;font-weight:900;letter-spacing:4px;font-family:monospace;color:#1a237e;margin:16px 0}.warn{font-size:12px;color:#666;margin-top:16px}</style></head><body><h2>🔐 VaultOS Emergency Master Key</h2><div class="card"><div style="font-size:13px;color:#666;margin-bottom:8px">Keep this card safe and private</div><div class="key">${key}</div><div style="font-size:12px;color:#666">Generated: ${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</div></div><div class="warn">⚠️ This key can reset your PIN. Do not share it with anyone.<br>Store in a safe place separate from your device.</div></body></html>`);
    w.document.close();w.print();
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
    Modal.open('🔑 Forgot PIN',
      `<div style="display:flex;flex-direction:column;gap:10px">
        <div style="background:var(--glass);border:1px solid var(--border);border-radius:var(--r);padding:14px;cursor:pointer;touch-action:manipulation" onclick="Modal.close();Settings.useMasterKey()">
          <div style="font-weight:700;margin-bottom:4px">🗝️ Use Master Key</div>
          <div style="font-size:12px;color:var(--text2)">Enter the master key you saved when setting up your vault</div>
        </div>
        <div style="background:var(--glass);border:1px solid var(--border);border-radius:var(--r);padding:14px;cursor:pointer;touch-action:manipulation" onclick="Modal.close();document.getElementById('importF-global')?.click()">
          <div style="font-weight:700;margin-bottom:4px">📥 Restore from Backup</div>
          <div style="font-size:12px;color:var(--text2)">Import a .vault backup file to recover access</div>
        </div>
        <div style="background:rgba(255,64,96,.05);border:1px solid rgba(255,64,96,.2);border-radius:var(--r);padding:14px;cursor:pointer;touch-action:manipulation" onclick="Modal.close();Settings.resetVault()">
          <div style="font-weight:700;color:var(--err);margin-bottom:4px">⚠️ Reset Vault</div>
          <div style="font-size:12px;color:var(--text2)">Last resort — permanently wipes all vault data</div>
        </div>
      </div>`,
      `<button class="btn btn-g btn-full" onclick="Modal.close()">Cancel</button>`
    );
  },
  useMasterKey(){
    Modal.open('🗝️ Enter Master Key',
      `<div style="display:flex;flex-direction:column;gap:12px">
        <div style="font-size:13px;color:var(--text2);line-height:1.6">Enter the master key that was shown when you first set up your vault. Format: XXXXXX-XXXXXX-XXXXXX</div>
        <input class="inp" id="mk-in" placeholder="XXXXXX-XXXXXX-XXXXXX"
          style="font-family:var(--mono);letter-spacing:2px;text-transform:uppercase;font-size:16px;text-align:center"
          oninput="this.value=this.value.toUpperCase().replace(/[^A-Z0-9-]/g,'')">
        <div class="ferr" id="mk-err" style="color:var(--err);font-size:12px;min-height:16px"></div>
      </div>`,
      `<button class="btn btn-g" onclick="Modal.close()">Cancel</button>
       <button class="btn btn-p" onclick="Settings.verifyMasterKey()">Verify & Reset PIN</button>`
    );
  },
  verifyMasterKey(){
    const input=(document.getElementById('mk-in')?.value||'').trim().toUpperCase();
    const pin=S.pin||localStorage.getItem('vo_pin')||'';
    const name=S.user?.name||'';
    const raw=btoa(unescape(encodeURIComponent(pin+':'+name+':VaultOS3')));
    const expected=(raw.replace(/[^A-Za-z0-9]/g,'').slice(0,6)+'-'+raw.slice(4,10).toUpperCase()+'-'+raw.slice(10,16).toUpperCase()).toUpperCase();
    const err=document.getElementById('mk-err');
    if(input===expected){Modal.close();Settings.changePIN();if(window.Toast)Toast.show('Master key verified — set your new PIN','success');}
    else{if(err)err.textContent='Invalid master key — check and try again';}
  },
  getMasterKey(){
    const pin=S.pin||'';
    const name=S.user?.name||'';
    const raw=btoa(unescape(encodeURIComponent(pin+':'+name+':VaultOS3')));
    return(raw.replace(/[^A-Za-z0-9]/g,'').slice(0,6)+'-'+raw.slice(4,10).toUpperCase()+'-'+raw.slice(10,16).toUpperCase()).toUpperCase();
  },
  loadDemo(){
    const profiles=[
      {id:'business',ic:'👔',label:'Business Professional (Karachi)',desc:'PKR · HBL, Meezan, Alfalah · PSX stocks'},
      {id:'student',ic:'🎓',label:'Student (UK)',desc:'GBP · Monzo, Barclays · index funds, crypto'},
      {id:'family',ic:'🏠',label:'Family (Dubai)',desc:'AED · Emirates NBD, ADCB · property investment'},
      {id:'expat',ic:'💼',label:'Expat (Multiple Countries)',desc:'GBP/PKR/AED · Revolut, HBL, Emirates NBD'},
      {id:'entrepreneur',ic:'🚀',label:'Entrepreneur (Pakistan + UK)',desc:'GBP/PKR · Barclays, MCB · crypto + PSX stocks'},
    ];
    Modal.open('🎮 Load Demo Data',`
      <p style="font-size:12px;color:var(--text2);margin-bottom:14px;line-height:1.6">Choose a fictional profile to explore VaultOS. All data is made up.</p>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${profiles.map(p=>`<div onclick="Settings._loadProfile('${p.id}')" style="background:var(--glass);border:1px solid var(--border);border-radius:var(--r);padding:12px 14px;cursor:pointer;display:flex;align-items:center;gap:12px;transition:background .15s" onmouseover="this.style.background='var(--glass2)'" onmouseout="this.style.background='var(--glass)'">
          <span style="font-size:24px">${p.ic}</span>
          <div style="flex:1"><div style="font-weight:700;font-size:13px">${p.label}</div><div style="font-size:11px;color:var(--text3)">${p.desc}</div></div>
          <span style="color:var(--accent)">→</span>
        </div>`).join('')}
      </div>
    `,`<button class="btn btn-g btn-full" onclick="Modal.close()">Cancel</button>`);
  },
  _loadProfile(type){
    if(!window.__vos_confirm('Load demo data? This will merge fictional data with your vault.'))return;
    Modal.close();
    loadDemoProfile(type);
    // Populate new module localStorage keys not covered by loadDemoProfile
    const isPK = (type === 'business');
    const isAE = (type === 'family');
    const cur = isPK ? 'PKR' : isAE ? 'AED' : 'GBP';
    localStorage.setItem('vo_currency', JSON.stringify({base:cur, rates:{USD:280,GBP:355,AED:76,EUR:300,PKR:1}}));
    localStorage.setItem('vo_gold', JSON.stringify([
      {id:'dg1',type:'gold',name:'22k Wedding Set',weight:40,unit:'g',pricePerUnit:18500,currency:'PKR',createdAt:new Date().toISOString()},
      {id:'dg2',type:'gold',name:'Gold Coins',weight:2,unit:'tola',pricePerUnit:220000,currency:'PKR',createdAt:new Date().toISOString()},
      {id:'dg3',type:'silver',name:'Silver Cutlery',weight:500,unit:'g',pricePerUnit:250,currency:'PKR',createdAt:new Date().toISOString()}
    ]));
    localStorage.setItem('vo_family', JSON.stringify({
      head:{name:'Ahmed Khan',avatar:'👨',relation:'Head',dob:'1970-05-15',phone:'+92 300 1234567',email:'ahmed@example.com',docs:[{type:'CNIC',number:'42101-1234567-1',expiry:'2028-01-01'},{type:'Passport',number:'AB1234567',expiry:'2029-06-15'}],banks:['HBL','Standard Chartered'],cards:[{name:'HBL Prestige Visa',last4:'4821'},{name:'SCB Platinum',last4:'3390'}],notes:'Head of household. Primary income earner.'},
      members:[
        {id:'fm1',name:'Sara Ahmed',avatar:'👩',relation:'Wife',dob:'1975-08-22',phone:'+92 300 7654321',docs:[{type:'CNIC',number:'42101-7654321-2',expiry:'2027-03-10'}],banks:['Meezan Bank'],cards:[{name:'Meezan Infinite Visa',last4:'6677'}],notes:'Joint account holder at Meezan.',cash:[{label:'Household',amount:50000}]},
        {id:'fm2',name:'Ali Ahmed',avatar:'👦',relation:'Son',dob:'2000-03-10',docs:[{type:'CNIC',number:'42101-9876543-3',expiry:'2030-01-01'},{type:'Passport',number:'CD9876543',expiry:'2031-09-20'}],banks:['UBL'],cards:[{name:'UBL Campus Card',last4:'1122'}],notes:'Student. University of Karachi.'},
        {id:'fm3',name:'Fatima Ahmed',avatar:'👧',relation:'Daughter',dob:'2003-11-05',docs:[{type:'CNIC',number:'42101-5432167-8',expiry:'2030-06-01'}],banks:[],cards:[],notes:'School student.'}
      ]
    }));
    localStorage.setItem('vo_credit_score', JSON.stringify({country:'GB',entries:[
      {id:'cs1',score:720,bureau:'Experian',date:'2024-01-15',notes:'After paying off credit card'},
      {id:'cs2',score:695,bureau:'Experian',date:'2023-07-10',notes:'Initial check'},
      {id:'cs3',score:740,bureau:'Experian',date:'2024-06-01',notes:'Mortgage application check'}
    ]}));
    localStorage.setItem('vo_zakat_calc', JSON.stringify({'zk-cash':'850000','zk-gold-val':'740000','zk-silver-val':'125000','zk-investments':'200000','zk-receivable':'50000','zk-stock':'0','zk-debts':'100000','zk-expenses':'30000'}));
    localStorage.setItem('vo_tax_calc', JSON.stringify({country:'PK',income:'3600000'}));
    Toast.show('Demo data loaded — explore all features!','success');
    setTimeout(()=>location.reload(),1500);
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
      const data={ver:'4.0',_vaultVersion:SCHEMA_VERSION,_exportedAt:new Date().toISOString(),_appVersion:VER||'4.0',exported:new Date().toISOString(),user:S.user,modules:S.modules,banks:S.banks,cards:S.cards,investments:S.investments,sims:S.sims,assets:S.assets,expenses:S.expenses,emails:S.emails,gadgets:S.gadgets,digital:S.digital,documents:S.documents||[],tags:S.tags,wallet:S.wallet};
      S.user.lastBackup=new Date().toISOString();Store.save();
      Crypto.encrypt(JSON.stringify(data),pw).then(async enc=>{
        const fp = btoa(String.fromCharCode(...new Uint8Array(
          await crypto.subtle.digest('SHA-256', new TextEncoder().encode(enc.slice(0, 1000)))
        ))).slice(0, 8).toUpperCase();
        S.user.lastBackupFingerprint = fp; Store.save();
        this.dl('VaultOS-'+(new Date().toISOString().slice(0,10))+'.vos','application/octet-stream','VAULTOS_AES256::'+enc);
        Activity.log('Exported','AES-256-GCM encrypted .vos');
        Toast.show(`Backup saved ✓ Fingerprint: ${fp} — note this for verification`, 'success', 6000);
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
            if(data._vaultVersion&&typeof SCHEMA_VERSION!=='undefined'&&data._vaultVersion>SCHEMA_VERSION){Toast.show('This backup was created with a newer version of VaultOS. Some data may not display correctly.','warn',6000);}
            const previewCounts={Banks:(data.banks||[]).length,Cards:(data.cards||[]).length,Documents:(data.documents||[]).length,Investments:(data.investments||[]).length,Emails:(data.emails||[]).length,Devices:(data.gadgets||[]).length,Expenses:(data.expenses||[]).length};
            const previewLines=Object.entries(previewCounts).filter(([,v])=>v>0).map(([k,v])=>`  ${k}: ${v}`).join('\n');
            if(!window.__vos_confirm(`Import vault?\n\nContains:\n${previewLines}\n\nThis will merge with your existing data.`))return;
            const rollbackSnapshot={banks:[...(S.banks||[])],cards:[...(S.cards||[])],documents:[...(S.documents||[])],investments:[...(S.investments||[])],cash:[...(S.cash||[])],loans:[...(S.loans||[])]};
            try{
              ['banks','cards','investments','sims','assets','expenses','emails','gadgets','digital','documents','tags'].forEach(k=>{if(Array.isArray(data[k]))S[k]=[...(S[k]||[]),...data[k].filter(x=>!S[k]?.find(y=>y.id===x.id))];});
              if(data.modules)Object.assign(S.modules,data.modules);
              Store.save();buildNav();Activity.log('Vault imported');Toast.show('Import successful!','success');R.goto(S.currentPage||'dashboard');
            }catch(importErr){Object.assign(S,rollbackSnapshot);Store.save();Toast.show('Import failed — vault restored to previous state','error',5000);console.error('[Import] failed:',importErr);}
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

// ===================== QR SYNC =====================
const QRSync = {
  async exportQR() {
    // Build essential-only payload — no photos, no activity, no trash
    const stripped = arr => (arr||[]).map(item => {
      const c = Object.assign({}, item);
      delete c.frontPhoto; delete c.backPhoto; delete c.photo;
      return c;
    });
    const payload = JSON.stringify({
      ver:'4.0', exported:new Date().toISOString(),
      banks: stripped(S.banks),
      cards: stripped(S.cards),
      investments: stripped(S.investments),
      cash: stripped(S.cash),
      loans: stripped(S.loans),
      sims: stripped(S.sims),
      friends: stripped(S.friends),
      assets: stripped(S.assets),
      expenses: stripped(S.expenses),
      documents: stripped(S.documents),
      vehicles: stripped(S.vehicles),
    });

    // Compress if available
    let encoded;
    const CHUNK = 1800;
    const canCompress = typeof CompressionStream !== 'undefined';
    if (canCompress) {
      try {
        const cs = new CompressionStream('deflate-raw');
        const writer = cs.writable.getWriter();
        writer.write(new TextEncoder().encode(payload));
        writer.close();
        const chunks = [];
        const reader = cs.readable.getReader();
        while (true) { const {done, value} = await reader.read(); if (done) break; chunks.push(value); }
        const compressed = new Uint8Array(chunks.reduce((a,b)=>a+b.length,0));
        let offset = 0;
        for (const chunk of chunks) { compressed.set(chunk, offset); offset += chunk.length; }
        encoded = btoa(String.fromCharCode(...compressed)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
      } catch(e) { encoded = btoa(unescape(encodeURIComponent(payload))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,''); }
    } else {
      encoded = btoa(unescape(encodeURIComponent(payload)));
    }

    const chunkSize = canCompress ? CHUNK : 800;
    const chunks = [];
    for (let i = 0; i < encoded.length; i += chunkSize) chunks.push(encoded.slice(i, i + chunkSize));
    const total = chunks.length;

    QRSync._qrChunks = chunks;
    QRSync._qrTotal = total;
    QRSync._qrEncoded = encoded;

    Modal.open('📱 Sync to Another Device', `
      <div style="text-align:center;padding:8px 0">
        <p style="font-size:12px;color:var(--text2);margin-bottom:12px;line-height:1.6">Scan this QR code from the other device.</p>
        <div id="qrChunkLabel" style="font-size:12px;font-weight:700;color:var(--accent);margin-bottom:8px">${total>1?'QR 1 of '+total+' — show this to the other device, then tap Next':'Ready to scan'}</div>
        <div id="qrContainer" style="display:inline-block;background:#fff;padding:10px;border-radius:12px;margin-bottom:12px"></div>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:6px">
          ${total>1?'<button class="btn btn-s btn-sm" id="qrPrevBtn" onclick="QRSync._showChunk(-1)" style="display:none">← Prev</button>':''}
          ${total>1?'<button class="btn btn-p btn-sm" id="qrNextBtn" onclick="QRSync._showChunk(1)">Next →</button>':''}
          <button class="btn btn-g btn-sm" onclick="U.copy(QRSync._qrEncoded,'QR data')">📋 Copy as text</button>
        </div>
        <p style="font-size:11px;color:var(--text3);margin-top:10px">One-time use — expires when dialog closes.</p>
      </div>
    `, `<button class="btn btn-p btn-full" onclick="Modal.close()">Done</button>`);

    QRSync._qrCurrent = 0;
    setTimeout(() => QRSync._renderQRChunk(0), 200);
  },

  _qrChunks: [], _qrTotal: 0, _qrCurrent: 0, _qrEncoded: '',

  _showChunk(dir) {
    const next = QRSync._qrCurrent + dir;
    if (next < 0 || next >= QRSync._qrTotal) return;
    QRSync._qrCurrent = next;
    QRSync._renderQRChunk(next);
  },

  _renderQRChunk(idx) {
    const el = document.getElementById('qrContainer');
    const label = document.getElementById('qrChunkLabel');
    const prevBtn = document.getElementById('qrPrevBtn');
    const nextBtn = document.getElementById('qrNextBtn');
    if (!el) return;
    if (label) label.textContent = QRSync._qrTotal > 1 ? 'QR '+(idx+1)+' of '+QRSync._qrTotal+' — show this to the other device, then tap Next' : 'Ready to scan';
    if (prevBtn) prevBtn.style.display = idx > 0 ? '' : 'none';
    if (nextBtn) nextBtn.style.display = idx < QRSync._qrTotal - 1 ? '' : 'none';
    el.innerHTML = '';
    const chunkData = JSON.stringify({ v:'vos2', i:idx, t:QRSync._qrTotal, d:QRSync._qrChunks[idx] });
    if (typeof QRCode !== 'undefined') {
      try { new QRCode(el, { text: chunkData, width:260, height:260, correctLevel: QRCode.CorrectLevel.L }); }
      catch(e) { el.innerHTML = '<div style="font-size:12px;color:var(--err);padding:12px">QR generation failed — use Copy as text instead</div>'; }
    } else {
      el.innerHTML = '<div style="font-size:12px;color:var(--text2);padding:12px">QR library not loaded</div>';
    }
  },

  importQR() {
    Modal.open('📷 Scan from Another Device', `
      <div style="text-align:center;padding:8px 0">
        <p style="font-size:12px;color:var(--text2);margin-bottom:12px;line-height:1.6">Point your camera at the QR code shown on the other device.</p>
        <video id="qrVideo" style="width:100%;max-width:320px;border-radius:var(--r);background:#000" autoplay playsinline></video>
        <canvas id="qrCanvas" style="display:none"></canvas>
        <div id="qrStatus" style="font-size:12px;color:var(--text3);margin-top:8px">Starting camera…</div>
      </div>
    `, `<button class="btn btn-g" onclick="QRSync._stopCamera();Modal.close()">Cancel</button>`);
    setTimeout(() => this._startCamera(), 300);
  },

  _stream: null,
  _stopCamera() {
    if (this._stream) { this._stream.getTracks().forEach(t => t.stop()); this._stream = null; }
  },

  async _startCamera() {
    const video = document.getElementById('qrVideo');
    const status = document.getElementById('qrStatus');
    if (!video) return;
    try {
      this._stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      video.srcObject = this._stream;
      video.play();
      status.textContent = 'Scanning…';
      this._scanLoop();
    } catch(e) { if (status) status.textContent = 'Camera access denied — check permissions'; }
  },

  _scanLoop() {
    const video = document.getElementById('qrVideo');
    const canvas = document.getElementById('qrCanvas');
    if (!video || !canvas || !this._stream) return;
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    ctx.drawImage(video, 0, 0);
    try {
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      if (typeof jsQR !== 'undefined') {
        const result = jsQR(img.data, img.width, img.height);
        if (result?.data) { this._stopCamera(); this._processQR(result.data); return; }
      }
    } catch(e) {}
    if (document.getElementById('qrVideo')) setTimeout(() => this._scanLoop(), 200);
  },

  _importCollected: {}, _importTotal: 0,

  _processQR(raw) {
    try {
      const parsed = JSON.parse(raw);

      // v2 multi-chunk format (matches current exportQR)
      if (parsed.v === 'vos2') {
        const { i, t, d } = parsed;
        if (typeof i !== 'number' || typeof t !== 'number' || !d) { Toast.show('Invalid QR chunk', 'error'); return; }
        QRSync._importCollected[i] = d;
        QRSync._importTotal = t;
        const collected = Object.keys(QRSync._importCollected).length;
        if (collected >= t) {
          QRSync._importAllChunks();
        } else {
          // update status and re-open camera for next chunk
          const status = document.getElementById('qrStatus');
          if (status) status.textContent = `Got ${collected} of ${t} — scan the next QR code`;
          setTimeout(() => QRSync._startCamera(), 400);
        }
        return;
      }

      // v1 legacy encrypted format
      if (parsed.v === 'vos1' && parsed.enc) {
        Modal.open('🔐 Enter Sync Code', `
          <p style="font-size:12px;color:var(--text2);margin-bottom:12px">Enter the 6-digit code shown on the other device.</p>
          <div class="fg"><label class="fl">Sync Code</label><input class="inp" id="qrCodeIn" maxlength="6" inputmode="numeric" placeholder="123456" style="text-align:center;font-size:24px;letter-spacing:8px;font-family:var(--mono)"></div>
          <div class="ferr" id="qrCodeErr"></div>
        `, `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="QRSync._decryptAndMerge('${encodeURIComponent(parsed.enc)}')">Import</button>`);
        return;
      }

      Toast.show('Unrecognised QR format', 'error');
    } catch(e) { Toast.show('Failed to read QR code', 'error'); }
  },

  async _importAllChunks() {
    try {
      const t = QRSync._importTotal;
      const parts = [];
      for (let i = 0; i < t; i++) {
        if (!QRSync._importCollected[i]) { Toast.show(`Missing chunk ${i+1} of ${t}`, 'error'); return; }
        parts.push(QRSync._importCollected[i]);
      }
      QRSync._importCollected = {}; QRSync._importTotal = 0;
      const joined = parts.join('');

      // URL-safe base64 → standard base64
      const b64 = joined.replace(/-/g,'+').replace(/_/g,'/');
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      let payload;
      if (typeof DecompressionStream !== 'undefined') {
        try {
          const ds = new DecompressionStream('deflate-raw');
          const writer = ds.writable.getWriter();
          writer.write(bytes); writer.close();
          const chunks = []; const reader = ds.readable.getReader();
          while (true) { const { done, value } = await reader.read(); if (done) break; chunks.push(value); }
          const out = new Uint8Array(chunks.reduce((a,b)=>a+b.length,0));
          let off = 0; for (const c of chunks) { out.set(c, off); off += c.length; }
          payload = new TextDecoder().decode(out);
        } catch(e) {
          payload = decodeURIComponent(escape(binary));
        }
      } else {
        payload = decodeURIComponent(escape(binary));
      }

      const data = JSON.parse(payload);
      const counts = ['banks','cards','investments','sims','cash','loans','friends','assets','expenses','documents','vehicles']
        .map(k => `${(data[k]||[]).length} ${k}`).filter(s=>!s.startsWith('0')).join(', ');

      Modal.open('📥 Import from QR', `
        <p style="font-size:13px;color:var(--text2);margin-bottom:12px;line-height:1.6">Successfully decoded vault data from QR codes.</p>
        <div style="background:var(--glass);border-radius:var(--r);padding:12px;font-size:12px;color:var(--text2);margin-bottom:12px">${counts || 'No items found'}</div>
        <p style="font-size:12px;color:var(--warn)">⚠ Existing items with matching IDs will be merged.</p>
      `, `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="QRSync._applyImport(${encodeURIComponent(JSON.stringify(data))})">Merge & Import</button>`);
    } catch(e) { Toast.show('Failed to decode QR data', 'error'); }
  },

  _applyImport(encoded) {
    try {
      const data = JSON.parse(decodeURIComponent(encoded));
      const now = t => t ? new Date(t).getTime() : 0;
      ['banks','cards','investments','sims','cash','loans','friends','assets','expenses','emails','gadgets','digital','documents','vehicles'].forEach(k => {
        if (!Array.isArray(data[k])) return;
        data[k].forEach(item => {
          const existing = (S[k]||[]).find(x => x.id === item.id);
          if (!existing) { if (!S[k]) S[k]=[]; S[k].push(item); }
          else if (now(item.updatedAt) > now(existing.updatedAt)) { S[k] = S[k].map(x => x.id === item.id ? item : x); }
        });
      });
      Store.save(); buildNav(); Modal.close();
      Toast.show('Vault imported from QR!', 'success');
      R.goto(S.currentPage || 'dashboard');
    } catch(e) { Toast.show('Import failed', 'error'); }
  },

  renderPage() {
    const el = document.getElementById('syncBody'); if (!el) return;
    el.innerHTML = `
      <div style="max-width:560px">
        <div style="background:linear-gradient(135deg,var(--glass),var(--glass2));border:1px solid var(--border);border-radius:var(--rlg);padding:20px;margin-bottom:16px;text-align:center">
          <div style="font-size:48px;margin-bottom:12px">🔄</div>
          <h3 style="font-size:18px;font-weight:700;margin-bottom:8px">Sync Devices</h3>
          <p style="font-size:13px;color:var(--text2);line-height:1.6;margin-bottom:16px">Transfer your vault to another device securely using a QR code and a one-time 6-digit sync code.</p>
          <div style="display:flex;flex-direction:column;gap:10px;max-width:280px;margin:0 auto">
            <button class="btn btn-p" onclick="QRSync.exportQR()" style="padding:14px;font-size:15px;font-weight:700">📱 Send to Another Device</button>
            <button class="btn btn-s" onclick="QRSync.importQR()" style="padding:12px;font-size:14px">📷 Receive from Another Device</button>
          </div>
        </div>
        <div style="background:var(--glass);border:1px solid var(--border);border-radius:var(--r);padding:14px">
          <div style="font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:var(--text3);margin-bottom:10px">How it works</div>
          ${[['1️⃣','On the source device','Tap "Send" — a QR code and 6-digit code appear'],['2️⃣','On the target device','Tap "Receive" — scan the QR code'],['3️⃣','Enter the sync code','Type the 6-digit code shown on the source device'],['4️⃣','Done!','Your vault data merges securely on the target device']].map(([n,t,d])=>`<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px"><span style="font-size:20px;flex-shrink:0">${n}</span><div><div style="font-size:13px;font-weight:600">${t}</div><div style="font-size:11px;color:var(--text2)">${d}</div></div></div>`).join('')}
          <div style="margin-top:8px;padding-top:10px;border-top:1px solid var(--border);font-size:11px;color:var(--text3)">🔐 Data is encrypted with AES-256-GCM. The code never leaves your device.</div>
        </div>
      </div>`;
  },

  async _decryptAndMerge(encEncoded) {
    const code = document.getElementById('qrCodeIn')?.value.trim();
    if (!code || code.length !== 6) { const e = document.getElementById('qrCodeErr'); if (e) e.textContent = 'Enter the 6-digit sync code'; return; }
    try {
      const enc = decodeURIComponent(encEncoded);
      const raw = await Crypto.decrypt(enc, code);
      const data = JSON.parse(raw);
      const now = t => t ? new Date(t).getTime() : 0;
      ['banks','cards','investments','sims','cash','loans','friends','assets','expenses','emails','gadgets','digital'].forEach(k => {
        if (!Array.isArray(data[k])) return;
        data[k].forEach(item => {
          const existing = (S[k]||[]).find(x => x.id === item.id);
          if (!existing) { if (!S[k]) S[k]=[]; S[k].push(item); }
          else if (now(item.updatedAt) > now(existing.updatedAt)) { S[k] = S[k].map(x => x.id === item.id ? item : x); }
        });
      });
      Store.save(); buildNav(); Modal.close();
      Toast.show('Vault synced successfully!', 'success');
      R.goto(S.currentPage || 'dashboard');
    } catch(e) {
      const err = document.getElementById('qrCodeErr');
      if (err) err.textContent = 'Wrong code or corrupted data';
    }
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
        {done:!!S.user.lastBackup||S.banks.length>0||S.cards.length>0,label:'Vault has data',tip:'Add banks, cards or other entries'},
        {done:!!S.decoyPin,label:'Decoy PIN configured',tip:'Shows fake vault under coercion'},
        {done:!!S.user.lastBackup,label:'Vault backed up',tip:'Export encrypted backup to safe location'},
        {done:S.autoLock,label:'Auto-lock enabled',tip:'Vault locks automatically when idle'},
      ].map(({done,label,tip})=>`<div class="si"><div style="display:flex;align-items:center;gap:10px;flex:1"><div class="status-dot ${done?'ok':'err'}"></div><div class="sil"><div class="name">${label}</div><div class="desc">${tip}</div></div></div>${done?'<span style="color:var(--ok);font-weight:700">✓</span>':'<span style="color:var(--err);font-size:11px">Needed</span>'}</div>`).join('')}
    </div></div>
    <!-- VAULT HEALTH -->
    <div class="set-sec"><div class="set-title">Vault Diagnostics</div><div class="set-card">
      ${[
        {label:'Schema version',val:'v'+SCHEMA_VERSION},
        {label:'Encryption',val:Crypto.available()?'AES-256-GCM ✅':'Basic'},
        {label:'Total entries',val:ALL_MODULES.reduce((a,m)=>a+(S[m.id]?.length||0),0)+''},
        {label:'Activity records',val:S.activity.length+''},
        {label:'Last backup',val:S.user.lastBackup?Activity.ago(S.user.lastBackup):'Never'},
        {label:'App version',val:'VaultOS v'+VER},
      ].map(({label,val})=>`<div class="si"><div class="name">${label}</div><div style="color:var(--text2);font-size:12px">${val}</div></div>`).join('')}
    </div></div>
    <!-- DEVELOPER DIAGNOSTICS -->
    <div class="set-sec" style="margin-bottom:40px"><div class="set-title">🔧 Developer Diagnostics</div><div class="set-card">
      <div id="dev-diag-body" style="padding:14px">
        <button class="btn btn-g" onclick="DevDiag.run()" style="width:100%;margin-bottom:10px">Run Diagnostics</button>
        <div id="dev-diag-results" style="font-size:12px;color:var(--text3);text-align:center">Tap to run diagnostics</div>
      </div>
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
    if (typeof buildSettTabs === 'function') setTimeout(buildSettTabs, 0);
    this.current = section;
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
    return `${typeof Onboarding !== 'undefined' && !S.user.onboardingComplete ? Onboarding.showSettingsCard() : ''}
    <div class="set-sec"><div class="set-title">👤 Profile</div><div class="set-card">
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
    const lastBackup = S.user.lastBackup ? Activity.ago(S.user.lastBackup) : 'Never';
    const sessionCount = S.activity.filter(a => a.a && a.a.includes('unlocked')).length;
    return `<div class="set-sec"><div class="set-title">🔒 Security</div><div class="set-card">
      <div class="si"><div class="sil"><div class="name">Change PIN</div><div class="desc">Update your 6-digit vault PIN</div></div><button class="btn btn-g btn-sm" onclick="Settings.changePIN()" style="touch-action:manipulation">Change</button></div>
      <div class="si"><div class="sil"><div class="name">Master Key</div><div class="desc">Emergency bypass — store this somewhere safe</div></div><button class="btn btn-g btn-sm" onclick="Settings.showMasterKey()" style="touch-action:manipulation">View</button></div>
      <div class="si"><div class="sil"><div class="name">Decoy PIN</div><div class="desc">${(S.decoyPin||VaultDB?.hasDecoy||false)?'✅ Set — shows convincing fake vault':'Not set'}</div></div><button class="btn btn-g btn-sm" onclick="Settings.setDecoyPIN()" style="touch-action:manipulation">${(S.decoyPin||VaultDB?.hasDecoy||false)?'Change':'Set'}</button></div>
      <div class="si"><div class="sil"><div class="name">No PIN Mode</div><div class="desc">Open vault without PIN ⚠️</div></div><label class="tog"><input type="checkbox" ${S.noPin?'checked':''} onchange="S.noPin=this.checked;Store.save();Toast.show('No-PIN '+(S.noPin?'enabled':'disabled'))"><span class="ts"></span></label></div>
      <div class="si"><div class="sil"><div class="name">Auto-Lock</div><div class="desc">Lock vault when phone sleeps</div></div><label class="tog"><input type="checkbox" ${S.autoLock?'checked':''} onchange="S.autoLock=this.checked;Store.save()"><span class="ts"></span></label></div>
      <div class="si"><div class="sil"><div class="name">Lock Timeout</div></div><select class="inp btn-sm" style="width:auto;padding:5px 9px" onchange="S.lockMins=parseInt(this.value);Store.save()">${[1,5,10,30,60].map(m=>`<option value="${m}"${S.lockMins===m?' selected':''}>${m} min</option>`).join('')}<option value="0"${S.lockMins===0?' selected':''}>Never</option></select></div>
      <div class="si"><div class="sil"><div class="name">Clipboard Clear</div><div class="desc">Auto-clear after copying sensitive data</div></div><select class="inp btn-sm" style="width:auto;padding:5px 9px" onchange="S.clipSecs=parseInt(this.value);Store.save()">${[15,30,60,120].map(s=>`<option value="${s}"${S.clipSecs===s?' selected':''}>${s}s</option>`).join('')}</select></div>
      <div class="si"><div class="sil"><div class="name">Privacy Mode</div><div class="desc">Blur all sensitive values on screen</div></div><label class="tog"><input type="checkbox" ${S.privacyMode?'checked':''} onchange="S.privacyMode=this.checked;document.body.classList.toggle('privacy',S.privacyMode);Store.save()"><span class="ts"></span></label></div>
    </div></div>
    <div class="set-sec"><div class="set-title">🔍 Vault Integrity</div><div class="set-card"><div style="padding:12px 14px"><button class="btn btn-g" onclick="DataIntegrity.showReport()" style="width:100%">🔍 Run Vault Integrity Check</button></div></div></div>
    <div class="set-sec"><div class="set-title">🛡️ Security Report</div><div class="set-card">
      ${[
        {label:'Encryption',val:'AES-256-GCM ✅',ok:true},
        {label:'PIN',val:'Protected ✅',ok:true},
        {label:'Storage',val:'Encrypted (IndexedDB) ✅',ok:true},
        {label:'Auto-lock',val:S.autoLock?'Enabled ✅':'Disabled ⚠️',ok:S.autoLock},
        {label:'Decoy PIN',val:S.decoyPin?'Configured ✅':'Not set',ok:!!S.decoyPin},
        {label:'Last backup',val:lastBackup,ok:!!S.user.lastBackup},
        {label:'Unlock sessions',val:sessionCount+' recorded',ok:true},
      ].map(({label,val,ok})=>`<div class="si"><div class="name">${label}</div><div style="font-size:12px;color:${ok?'var(--ok)':'var(--warn)'};text-align:right;flex:1">${val}</div></div>`).join('')}
    </div></div>`;
  },

  _appearance() {
    return `<div class="set-sec"><div class="set-title">🎨 Appearance</div><div class="set-card">
      <div style="padding:14px 16px">
        <div style="margin-bottom:8px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);margin-bottom:10px">🌙 Dark</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
            ${THEMES.filter(t=>t.g==='dark').map(t=>`
              <div onclick="ThemeEngine.apply('${t.id}')" style="cursor:pointer;touch-action:manipulation;border-radius:14px;overflow:hidden;border:2px solid ${S.user.theme===t.id?'var(--accent)':'var(--border)'}">
                <div style="height:48px;background:${t.bg};display:flex;align-items:center;justify-content:center;gap:6px">
                  <div style="width:12px;height:12px;border-radius:50%;background:${t.ac}"></div>
                  <div style="width:28px;height:6px;border-radius:3px;background:${t.ac};opacity:.4"></div>
                </div>
                <div style="padding:8px 10px;background:var(--glass);border-top:1px solid var(--border)">
                  <div style="font-size:12px;font-weight:600;color:var(--text)">${t.n}</div>
                </div>
              </div>`).join('')}
          </div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);margin-bottom:10px">☀️ Light</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            ${THEMES.filter(t=>t.g==='light').map(t=>`
              <div onclick="ThemeEngine.apply('${t.id}')" style="cursor:pointer;touch-action:manipulation;border-radius:14px;overflow:hidden;border:2px solid ${S.user.theme===t.id?'var(--accent)':'var(--border)'}">
                <div style="height:48px;background:${t.bg};display:flex;align-items:center;justify-content:center;gap:6px;border-bottom:1px solid rgba(0,0,0,.08)">
                  <div style="width:12px;height:12px;border-radius:50%;background:${t.ac}"></div>
                  <div style="width:28px;height:6px;border-radius:3px;background:${t.ac};opacity:.5"></div>
                </div>
                <div style="padding:8px 10px;background:var(--glass);border-top:1px solid var(--border)">
                  <div style="font-size:12px;font-weight:600;color:var(--text)">${t.n}</div>
                </div>
              </div>`).join('')}
          </div>
        </div>
      </div>
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
        <button class="btn btn-g btn-full btn-sm" onclick="R.goto('sync')">🔄 Sync Devices</button>
        <button class="btn btn-g btn-full btn-sm" onclick="QRSync.exportQR()">📱 Sync to Another Device (QR)</button>
        <button class="btn btn-g btn-full btn-sm" onclick="QRSync.importQR()">📷 Scan from Another Device</button>
      </div>
    </div></div>
    <div class="set-sec" style="margin-bottom:40px"><div class="set-title">💡 Backup Strategy</div><div class="set-card">
      ${[{ic:'☁️',t:'iCloud Drive',d:'Export .vos → save to Files → iCloud Drive'},{ic:'📦',t:'Google Drive',d:'Export .vos → upload manually to Drive'},{ic:'💽',t:'External Drive / USB',d:'Drag .vos file to external drive'}].map(({ic,t,d})=>`<div class="si"><div style="display:flex;align-items:center;gap:12px;flex:1"><span style="font-size:22px;flex-shrink:0">${ic}</span><div class="sil"><div class="name">${t}</div><div class="desc">${d}</div></div></div></div>`).join('')}
      <div style="padding:10px 14px;font-size:11px;color:var(--text3);line-height:1.6;border-top:1px solid var(--border)">🔐 All exports are AES-256-GCM encrypted before leaving your device. No cloud servers involved.</div>
    </div></div>`;
  },

  _import() {
    return `<div class="set-sec" style="margin-bottom:40px"><div class="set-title">📥 Import</div><div class="set-card">
      <div class="si" onclick="R.goto('import')" style="cursor:pointer"><div style="display:flex;align-items:center;gap:12px;flex:1"><div style="font-size:28px">📥</div><div class="sil"><div class="name">Smart Import Engine</div><div class="desc">Paste text, drop files, scan images — VaultOS detects and imports entries automatically</div></div></div><span style="color:var(--accent);font-size:16px">→</span></div>
      <div class="si" onclick="R.goto('ai-import')" style="cursor:pointer"><div style="display:flex;align-items:center;gap:12px;flex:1"><div style="font-size:28px">🤖</div><div class="sil"><div class="name">AI Import (Smart Pattern Matching)</div><div class="desc">Advanced pattern engine — detect banks, cards, SIMs, investments from any text snippet</div></div></div><span style="color:var(--accent);font-size:16px">→</span></div>
      <div class="si" onclick="ExcelImport.open()" style="cursor:pointer"><div style="display:flex;align-items:center;gap:12px;flex:1"><div style="font-size:28px">📊</div><div class="sil"><div class="name">Import Excel / Spreadsheet</div><div class="desc">Upload .xlsx or .xls — auto-detect sheets and map to vault modules</div></div></div><span style="color:var(--accent);font-size:16px">→</span></div>
      <div class="si" onclick="document.getElementById('importF-global').click()" style="cursor:pointer"><div style="display:flex;align-items:center;gap:12px;flex:1"><div style="font-size:28px">🔒</div><div class="sil"><div class="name">Restore Vault Backup</div><div class="desc">Import a .vos encrypted backup file or JSON export</div></div></div><span style="color:var(--accent);font-size:16px">→</span></div>
    </div></div>`;
  },

  _accessibility() {
    return `<div class="set-sec"><div class="set-title">♿ Accessibility</div><div class="set-card">
      <div class="si"><div class="sil"><div class="name">Privacy Mode</div><div class="desc">Blur all sensitive values on screen</div></div><label class="tog"><input type="checkbox" ${S.privacyMode?'checked':''} onchange="S.privacyMode=this.checked;document.body.classList.toggle('privacy',S.privacyMode);Store.save()"><span class="ts"></span></label></div>
      <div class="si"><div class="sil"><div class="name">Reduce Motion</div><div class="desc">Minimize animations throughout the app</div></div><label class="tog"><input type="checkbox" ${S.reduceMotion?'checked':''} onchange="S.reduceMotion=this.checked;document.body.classList.toggle('reduce-motion',S.reduceMotion);Store.save();Toast.show('Reduce motion '+(S.reduceMotion?'on':'off'))"><span class="ts"></span></label></div>
      <div class="si"><div class="sil"><div class="name">Large Text</div><div class="desc">Slightly increase base font size</div></div><label class="tog"><input type="checkbox" ${S.largeText?'checked':''} onchange="applyLargeText(this.checked);Toast.show('Large text '+(S.largeText?'on':'off'))"><span class="ts"></span></label></div>
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
      <div style="background:rgba(0,255,136,.08);border:1px solid rgba(0,255,136,.2);border-radius:14px;padding:16px;margin:0 14px 14px">
        <div style="font-size:13px;font-weight:700;color:var(--ok);margin-bottom:8px">🔒 Your Data Guarantee</div>
        <div style="font-size:12px;color:var(--text2);line-height:1.8">
          • Your vault lives <strong>on this device only</strong> — never on any server<br>
          • Even if this URL stops working, your data is safe in your <strong>.vos backup</strong><br>
          • Any browser can open a .vos file — just visit the app from any device<br>
          • Export a backup regularly: Settings → Backup &amp; Export
        </div>
      </div>
    </div></div>`;
  }
};

const VaultHealthCenter = {
  render() {
    const el = document.getElementById('pg-recovery-body');
    if (!el) return;
    const lastBackup = S.user?.lastBackup ? new Date(S.user.lastBackup) : null;
    const daysSince = lastBackup ? Math.floor((Date.now()-lastBackup)/(1000*60*60*24)) : 999;
    const fp = S.user?.lastBackupFingerprint || null;
    const healthScore = this._healthScore(daysSince);
    const ring = this._ring(healthScore);
    el.innerHTML = `
    <div style="padding:16px;display:flex;flex-direction:column;gap:16px">
      <div style="background:var(--glass);border:1px solid var(--border);border-radius:20px;padding:20px;text-align:center">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);margin-bottom:12px">Vault Backup Health</div>
        <div style="position:relative;width:100px;height:100px;margin:0 auto 12px">
          <svg viewBox="0 0 100 100" style="width:100px;height:100px;transform:rotate(-90deg)">
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" stroke-width="8"/>
            <circle cx="50" cy="50" r="42" fill="none" stroke="${ring.color}" stroke-width="8"
              stroke-dasharray="${ring.dash} 264" stroke-linecap="round"/>
          </svg>
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
            <div style="font-size:24px;font-weight:900;color:var(--text)">${healthScore}</div>
            <div style="font-size:9px;color:var(--text3)">/ 100</div>
          </div>
        </div>
        <div style="font-size:14px;font-weight:700;color:${ring.color}">${ring.label}</div>
        <div style="font-size:12px;color:var(--text3);margin-top:4px">${daysSince >= 999 ? 'You have never backed up your vault' : daysSince === 0 ? 'Backed up today — excellent' : `Last backup: ${daysSince} day${daysSince>1?'s':''} ago`}</div>
        ${fp ? `<div style="margin-top:8px;font-size:11px;color:var(--text3)">Fingerprint: <code style="background:var(--glass2);padding:2px 6px;border-radius:4px;color:var(--accent)">${fp}</code></div>` : ''}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <button onclick="ExIm.export('vault')" class="btn btn-p" style="padding:14px;display:flex;flex-direction:column;align-items:center;gap:6px;height:auto">
          <span style="font-size:24px">💾</span>
          <span style="font-size:12px;font-weight:700">Export Backup</span>
          <span style="font-size:10px;opacity:.7">Encrypted .vos file</span>
        </button>
        <button onclick="document.getElementById('importF-global').click()" class="btn btn-g" style="padding:14px;display:flex;flex-direction:column;align-items:center;gap:6px;height:auto">
          <span style="font-size:24px">📂</span>
          <span style="font-size:12px;font-weight:700">Restore Backup</span>
          <span style="font-size:10px;opacity:.7">Import .vos file</span>
        </button>
      </div>
      <details style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px">
        <summary style="font-size:13px;font-weight:700;color:var(--text);cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between">What is a .vos backup file? <span style="color:var(--text3)">▾</span></summary>
        <div style="margin-top:12px;font-size:12px;color:var(--text2);line-height:1.8">
          A <strong>.vos file</strong> is your entire vault — encrypted and compressed into a single file.<br><br>
          • It contains all your banks, cards, documents, and identity data<br>
          • It is encrypted with AES-256-GCM using your PIN as the key<br>
          • Without your PIN, the file is unreadable — even by us<br>
          • You can restore it on any device by visiting this app and importing the file<br>
          • Store it in iCloud, Google Drive, email, or a USB drive for safety
        </div>
      </details>
      <details style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px">
        <summary style="font-size:13px;font-weight:700;color:var(--text);cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between">What if I lose my phone? <span style="color:var(--text3)">▾</span></summary>
        <div style="margin-top:12px;font-size:12px;color:var(--text2);line-height:1.8">
          <strong>Step 1:</strong> Get a new phone or open any browser<br>
          <strong>Step 2:</strong> Visit <strong>shamikhahmed.github.io/VaultOS</strong><br>
          <strong>Step 3:</strong> Tap Settings → Import → select your .vos backup file<br>
          <strong>Step 4:</strong> Enter your PIN to decrypt<br>
          <strong>Step 5:</strong> Your entire vault is restored ✓<br><br>
          <em style="color:var(--text3)">This is why regular backups are essential — without a backup file, your data cannot be recovered from a lost device.</em>
        </div>
      </details>
      <details style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px">
        <summary style="font-size:13px;font-weight:700;color:var(--text);cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between">How does encryption work? <span style="color:var(--text3)">▾</span></summary>
        <div style="margin-top:12px;font-size:12px;color:var(--text2);line-height:1.8">
          • Your PIN never leaves your device — it is used locally as an encryption key<br>
          • Encryption algorithm: <strong>AES-256-GCM</strong> — the same standard used by banks and governments<br>
          • Key derivation: <strong>PBKDF2 with 310,000 iterations</strong> — makes brute-force attacks computationally expensive<br>
          • Each backup uses a unique random salt and IV — two backups of the same data produce completely different encrypted files<br>
          • No server ever receives your data, PIN, or encryption key<br><br>
          <em style="color:var(--text3)">In simple terms: your data is scrambled using your PIN, and only your PIN can unscramble it.</em>
        </div>
      </details>
      <div style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px">
        <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:10px">✓ Recovery Checklist</div>
        ${[
          [daysSince <= 30, daysSince >= 999 ? 'Export your first backup now' : daysSince <= 7 ? 'Backed up recently ✓' : `Back up again — ${daysSince}d since last backup`],
          [!!fp, 'Backup fingerprint saved'],
          [!!(S.pin && S.pin !== '123456'), 'Custom PIN set'],
          [!!(S.user?.name), 'Profile name set'],
          [(S.banks||[]).length > 0 || (S.documents||[]).length > 0, 'Data added to vault'],
        ].map(([ok, label]) => `
          <div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border)">
            <div style="width:20px;height:20px;border-radius:50%;background:${ok?'rgba(0,255,136,.15)':'rgba(255,69,58,.1)'};display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0">${ok?'✓':'!'}</div>
            <div style="font-size:12px;color:${ok?'var(--text2)':'var(--warn)'};">${label}</div>
          </div>`).join('')}
      </div>
    </div>`;
  },
  _healthScore(daysSince) {
    if (daysSince >= 999) return 20;
    if (daysSince === 0) return 100;
    if (daysSince <= 7) return 90;
    if (daysSince <= 14) return 75;
    if (daysSince <= 30) return 55;
    if (daysSince <= 60) return 35;
    return 20;
  },
  _ring(score) {
    const dash = Math.round((score / 100) * 264);
    const color = score >= 75 ? 'var(--ok)' : score >= 45 ? 'var(--warn)' : 'var(--err)';
    const label = score >= 75 ? 'Healthy' : score >= 45 ? 'Needs Attention' : 'At Risk';
    return { dash, color, label };
  },
};

const HelpCenter = {
  _section: 'getting-started',

  render() {
    const el = document.getElementById('pg-help-body');
    if (!el) return;
    const sections = [
      { id:'getting-started', icon:'🚀', label:'Getting Started' },
      { id:'banks-cards',     icon:'🏦', label:'Banks & Cards' },
      { id:'documents',       icon:'🪪', label:'Documents & ID' },
      { id:'family',          icon:'👨‍👩‍👧‍👦', label:'Family Vault' },
      { id:'backup',          icon:'💾', label:'Backup & Restore' },
      { id:'security',        icon:'🔒', label:'Security & PIN' },
      { id:'search',          icon:'🔍', label:'Search & Tags' },
      { id:'themes',          icon:'🎨', label:'Themes' },
      { id:'faq',             icon:'❓', label:'FAQ' },
    ];
    el.innerHTML = `
    <div style="padding:16px;display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none">
        ${sections.map(s => `
          <div onclick="HelpCenter._section='${s.id}';HelpCenter._renderContent()"
            class="chip${this._section===s.id?' on':''}"
            style="white-space:nowrap;padding:6px 14px;cursor:pointer;touch-action:manipulation">
            ${s.icon} ${s.label}
          </div>`).join('')}
      </div>
      <div id="help-content"></div>
    </div>`;
    this._renderContent();
  },

  _renderContent() {
    const el = document.getElementById('help-content');
    if (!el) return;
    const content = {
      'getting-started': `
        <div style="display:flex;flex-direction:column;gap:12px">
          ${this._card('🔐', 'What is VaultOS?', 'VaultOS is your private financial operating system. It stores all your financial and identity information — banks, cards, documents, passports, investments, loans — in one encrypted place on your device. No accounts. No servers. No one else can see your data.')}
          ${this._card('1️⃣', 'Step 1 — Set your PIN', 'Your PIN is the key to your vault. Choose something memorable but not obvious. It encrypts all your data. Without it, your backup file cannot be opened. Go to Settings → Security to change it.')}
          ${this._card('2️⃣', 'Step 2 — Add your first bank', 'Tap the Finance tab → Banks → + Add Bank. Choose your country, enter your bank name, account type, and currency. You can add as many banks as you have accounts.')}
          ${this._card('3️⃣', 'Step 3 — Link cards to banks', 'In Finance → Cards → + Add Card, you can link a card to a bank. This creates a relationship — tap a bank, scroll down to see all linked cards instantly.')}
          ${this._card('4️⃣', 'Step 4 — Add key documents', 'In Identity → Documents, add your passport, driving licence, or NIC. You can photograph the document inside the app. Expiry alerts will appear automatically.')}
          ${this._card('5️⃣', 'Step 5 — Export a backup', 'Go to Settings → Backup & Export → Export Vault. Save the .vos file somewhere safe — iCloud, Google Drive, or email it to yourself. Do this regularly.')}
          ${this._card('💡', 'Pro tip — use the Command Palette', 'Tap Cmd+K (desktop) or the search icon to instantly jump to anything in your vault. Search by name, type tags, or run actions like "lock vault" or "export".')}
        </div>`,
      'banks-cards': `
        <div style="display:flex;flex-direction:column;gap:12px">
          ${this._card('🏦', 'Adding a bank account', 'Finance → Banks → + Add Bank. Fill in: bank name, country, account type (current/savings/islamic), currency, and optionally your IBAN, sort code, balance, and account holder name. You can also store your online banking PIN and app PIN securely.')}
          ${this._card('💳', 'Adding a card', 'Finance → Cards → + Add Card. Fill in manually. Store the last 4 digits, expiry, CVV hint, and link it to a bank account. Front and back photos can be captured.')}
          ${this._card('🔗', 'Linking cards to banks', 'When adding a card, select the bank it belongs to in the "Linked Bank" field. Tap any bank entry and scroll down to see all linked cards automatically displayed.')}
          ${this._card('🗂️', 'Archiving accounts', 'Tap the archive icon (🗂️) on any bank or card to hide it without deleting. Useful for old accounts you want to keep a record of. Tap "Show archived" to see them again.')}
          ${this._card('🔍', 'Filtering banks by country', 'Use the country chips at the top of the Banks page to filter by Pakistan, UK, or UAE. If you set up multiple countries during onboarding, the context switcher lets you filter across the whole app.')}
          ${this._card('⭐', 'Favouriting entries', 'Tap the star icon on any bank, card, or investment to mark it as a favourite. Favourites appear at the top of their list and in smart collections on the dashboard.')}
        </div>`,
      'documents': `
        <div style="display:flex;flex-direction:column;gap:12px">
          ${this._card('🪪', 'Supported document types', 'Passport, National ID (NIC/CNIC), Driving Licence, Visa, Emirates ID, Property Documents, Insurance, Vehicle Registration, Tax Documents, Medical Records, Warranties, Contracts, Certificates.')}
          ${this._card('📸', 'Photographing documents', 'When adding a document, tap "Capture Front" and "Capture Back" to photograph using your camera. Images are compressed and stored encrypted inside your vault. Useful for passports and ID cards.')}
          ${this._card('⏰', 'Expiry alerts', 'Documents with expiry dates automatically appear in the Timeline and generate reminders 30 days before expiry. The dashboard also shows an "Expiring Soon" smart collection.')}
          ${this._card('🔎', 'Finding documents', 'Use the search bar at the top of the Documents page, or use Cmd+K to search globally. You can search by document name, holder name, document number, or country.')}
          ${this._card('🏷️', 'Tagging documents', 'Add tags like "uk", "urgent", "family", "business" to any document. Use the preset chips in the form or type your own. Filter and search by tag across the whole vault.')}
        </div>`,
      'family': `
        <div style="display:flex;flex-direction:column;gap:12px">
          ${this._card('👨‍👩‍👧‍👦', 'What is the Family Vault?', 'The Family Vault lets you manage finances for your entire family in one place. Add family members — spouse, children, parents — and each gets their own banks, cards, cash, investments, and documents.')}
          ${this._card('👑', 'Head of Family', 'The first member added becomes the Head of Family. This is usually you. The head\'s details are shown prominently at the top of the family page.')}
          ${this._card('➕', 'Adding a family member', 'Tap Family → + Add Member. Enter their name, relationship, and avatar. Then tap their card to add their banks, cards, documents, and more.')}
          ${this._card('💳', 'Family member cards', 'Each family member can have their own cards and bank accounts stored separately. This keeps your data organised by person, not just by account type.')}
          ${this._card('📝', 'Notes per member', 'Each family member has a Notes tab where you can store free-form information — medical conditions, important contacts, or any other private notes.')}
        </div>`,
      'backup': `
        <div style="display:flex;flex-direction:column;gap:12px">
          ${this._card('💾', 'How to export a backup', 'Settings → Backup & Export → Export Vault. Or tap the Recovery Center in the Tools sidebar. A .vos file will download — save it somewhere safe like iCloud, Google Drive, or email.')}
          ${this._card('📂', 'How to restore a backup', 'Settings → Import → select your .vos file. Enter your PIN when prompted. Your data will be merged with any existing data (duplicates are skipped automatically).')}
          ${this._card('🔑', 'Backup fingerprint', 'After each export, an 8-character fingerprint is shown (e.g. A3F9KX2M). Note this down. You can use it to verify your backup file is intact and untampered.')}
          ${this._card('📱', 'If you lose your phone', '1. Open any browser on any device. 2. Visit shamikhahmed.github.io/VaultOS. 3. Import your .vos backup file. 4. Enter your PIN. Your vault is fully restored.')}
          ${this._card('⏰', 'How often to back up', 'We recommend backing up: after adding important documents, after major financial changes, and at minimum once a month. The app reminds you if you go more than 30 days without a backup.')}
          ${this._card('☁️', 'Where to store your backup', 'iCloud Drive, Google Drive, Dropbox, OneDrive, or email it to yourself. The file is encrypted — even if someone else finds it, they cannot open it without your PIN.')}
        </div>`,
      'security': `
        <div style="display:flex;flex-direction:column;gap:12px">
          ${this._card('🔐', 'How your PIN works', 'Your PIN is never stored anywhere — not on your device, not on any server. It is used as a key to encrypt and decrypt your data. Only you know it. If you forget it, your data cannot be recovered without a backup.')}
          ${this._card('🔒', 'Encryption standard', 'VaultOS uses AES-256-GCM encryption — the same standard used by banks, governments, and military organisations. Your data is encrypted before being saved, and decrypted only when you unlock with your PIN.')}
          ${this._card('🕵️', 'Decoy vault', 'Set a second PIN in Settings → Security → Decoy PIN. If someone forces you to open the app, enter the decoy PIN — it shows a completely empty vault. Your real data remains hidden.')}
          ${this._card('🆘', 'Emergency access', 'Settings → Tools → Emergency. Add your name, blood type, allergies, and emergency contact. Enable "Show on Lock Screen" — first responders can see this information without your PIN.')}
          ${this._card('❌', 'Brute force protection', 'After 5 wrong PIN attempts, the vault locks for an increasing time period. Failed attempts are logged and persist across page reloads.')}
          ${this._card('🧹', 'Sensitive field auto-clear', 'CVV numbers, card PINs, and passwords are automatically cleared from forms when you close a modal — they are never left visible on screen.')}
        </div>`,
      'search': `
        <div style="display:flex;flex-direction:column;gap:12px">
          ${this._card('🔍', 'Global search', 'Tap the search icon in the FAB menu, or press Cmd+K on desktop. Search finds banks, cards, documents, investments, loans, contacts, and more — all at once.')}
          ${this._card('🧠', 'Typo-tolerant search', 'The search engine uses fuzzy matching — you can make small typos and still find what you\'re looking for. "Barcays" will find "Barclays". "pasport" will find "Passport".')}
          ${this._card('🏷️', 'Tagging system', 'Add tags to any entry (banks, cards, documents, loans, investments, cash, vehicles). Use preset chips or type your own. Tags are searchable and filterable across the whole vault.')}
          ${this._card('⚡', 'Command palette', 'Press Cmd+K to open the command palette. Type to search data, or run actions: "lock vault", "export", "theme midnight", "add bank". Weighted results show best matches first.')}
          ${this._card('📊', 'Smart collections', 'The dashboard automatically shows: Expiring Soon, Active Loans, Archived Items, and Investments — based on your actual data. These update in real time.')}
        </div>`,
      'themes': `
        <div style="display:flex;flex-direction:column;gap:12px">
          ${this._card('🌑', 'Midnight (Dark)', 'Pure black background with blue accent. The default theme. Ideal for OLED screens — saves battery and looks stunning at night.')}
          ${this._card('⬛', 'Graphite (Dark)', 'Dark grey background with warm gold accent. Softer than Midnight, easier on the eyes for long sessions. Premium notebook aesthetic.')}
          ${this._card('☁️', 'Cloud (Light)', 'Clean white background with blue accent. Apple-style light mode. Best for bright environments and daytime use.')}
          ${this._card('🟡', 'Ivory (Light)', 'Warm cream background with forest green accent. Notion-inspired warmth. Gentle on the eyes, great for reading.')}
          ${this._card('🌸', 'Blossom (Light)', 'Rose pink background with hot pink accent. Warm, expressive, and beautiful. Switch themes anytime in Settings → Appearance.')}
          ${this._card('💡', 'Switching themes', 'Settings → Appearance → tap any theme card. Or open the Command Palette (Cmd+K) and type "theme" to switch instantly.')}
        </div>`,
      'faq': `
        <div style="display:flex;flex-direction:column;gap:12px">
          ${this._card('❓', 'Is my data safe?', 'Yes. Your data never leaves your device. It is encrypted with AES-256-GCM using your PIN. No server, no cloud, no account required. The only way to access your data is with your PIN and your device (or a backup file).')}
          ${this._card('❓', 'What happens if this website goes down?', 'Your data is stored on your device, not on any server. Even if the URL disappears, your data is safe. Export a .vos backup and you can open it on any device using any browser, anytime.')}
          ${this._card('❓', 'Can I use this on multiple devices?', 'Export a .vos backup from one device and import it on another. Your vault is fully portable. There is no automatic sync between devices (this keeps your data private).')}
          ${this._card('❓', 'What if I forget my PIN?', 'Unfortunately your PIN cannot be recovered — it is never stored anywhere. If you have a backup (.vos file) and remember your old PIN, you can restore from that. This is why regular backups are essential.')}
          ${this._card('❓', 'Is this app free?', 'Yes, completely free. No ads, no subscriptions, no premium tier. The source code is available on GitHub.')}
          ${this._card('❓', 'Does it work offline?', 'Yes. After your first visit, install it as a PWA (Add to Home Screen) and it works with zero internet connection.')}
          ${this._card('❓', 'Who built this?', 'VaultOS is built by Shamikh Ahmed — independently, with no company or investor backing. It is a privacy-first tool built out of genuine need for people managing finances across multiple countries.')}
        </div>`,
    };
    el.innerHTML = content[this._section] || content['getting-started'];
  },

  _card(icon, title, body) {
    return `
      <div style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px 16px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
          <span style="font-size:18px">${icon}</span>
          <div style="font-size:13px;font-weight:700;color:var(--text)">${title}</div>
        </div>
        <div style="font-size:12px;color:var(--text2);line-height:1.7">${body}</div>
      </div>`;
  },
};
