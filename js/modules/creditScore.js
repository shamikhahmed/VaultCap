const CreditScore = {
  get() { return JSON.parse(localStorage.getItem('vo_credit_score')||'{"entries":[],"country":"GB"}'); },
  save(d) { localStorage.setItem('vo_credit_score',JSON.stringify(d)); },

  ranges: {
    GB: { bureaus: ['Experian','Equifax','TransUnion'], max: { Experian:999, Equifax:700, TransUnion:710 },
          bands: { Experian:[{min:0,max:560,label:'Very Poor',color:'#f44336'},{min:561,max:720,label:'Poor',color:'#ff9800'},{min:721,max:880,label:'Fair',color:'#ffc107'},{min:881,max:960,label:'Good',color:'#8bc34a'},{min:961,max:999,label:'Excellent',color:'#4caf50'}] } },
    PK: { bureaus: ['eCIB (SBP)'], max: { 'eCIB (SBP)': 900 },
          bands: { 'eCIB (SBP)': [{min:0,max:500,label:'Poor',color:'#f44336'},{min:501,max:650,label:'Fair',color:'#ff9800'},{min:651,max:750,label:'Good',color:'#8bc34a'},{min:751,max:900,label:'Excellent',color:'#4caf50'}] } },
    AE: { bureaus: ['AECB'], max: { AECB: 900 },
          bands: { AECB: [{min:300,max:619,label:'Poor',color:'#f44336'},{min:620,max:679,label:'Fair',color:'#ff9800'},{min:680,max:729,label:'Good',color:'#8bc34a'},{min:730,max:900,label:'Excellent',color:'#4caf50'}] } }
  },

  render() {
    const body = document.getElementById('pg-credit-body');
    if (!body) return;
    const d = this.get();
    const r = this.ranges[d.country] || this.ranges.GB;
    const latest = d.entries.length ? d.entries[d.entries.length-1] : null;
    body.innerHTML = `
      <div style="padding:16px">
        <div style="display:flex;gap:8px;margin-bottom:16px">
          ${['GB','PK','AE'].map(c=>`<button onclick="CreditScore._setCountry('${c}')" style="flex:1;padding:10px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:1px solid ${d.country===c?'var(--purple)':'var(--border)'};background:${d.country===c?'rgba(123,95,255,.2)':'transparent'};color:${d.country===c?'var(--purple)':'var(--text3)'}">${c==='GB'?'🇬🇧 UK':c==='PK'?'🇵🇰 PK':'🇦🇪 UAE'}</button>`).join('')}
        </div>
        ${latest ? this._scoreDisplay(latest,r) : '<div style="text-align:center;padding:30px;color:var(--text3)">No score recorded yet</div>'}
        <button class="btn btn-p" style="width:100%;margin:16px 0" onclick="CreditScore.openAdd()">+ Add Score Entry</button>
        ${d.entries.length > 1 ? this._history(d.entries,r) : ''}
      </div>`;
  },

  _scoreDisplay(entry, r) {
    const bands = r.bands[entry.bureau] || r.bands[Object.keys(r.bands)[0]];
    const max = r.max[entry.bureau] || 999;
    const band = bands.find(b=>entry.score>=b.min&&entry.score<=b.max) || bands[0];
    const pct = Math.round((entry.score/max)*100);
    return `<div style="background:var(--glass);border-radius:var(--r);padding:20px;margin-bottom:12px;text-align:center">
      <div style="font-size:11px;color:var(--text3);margin-bottom:8px;text-transform:uppercase;letter-spacing:.08em">${entry.bureau} Score</div>
      <div style="font-size:56px;font-weight:900;color:${band.color};line-height:1">${entry.score}</div>
      <div style="font-size:14px;font-weight:700;color:${band.color};margin-top:4px">${band.label}</div>
      <div style="margin:16px 0 4px;height:8px;background:rgba(255,255,255,.1);border-radius:4px;overflow:hidden">
        <div style="width:${pct}%;height:100%;background:${band.color};border-radius:4px;transition:width .8s ease"></div>
      </div>
      <div style="font-size:11px;color:var(--text3)">${entry.score} / ${max} · Recorded ${entry.date}</div>
    </div>`;
  },

  _history(entries, r) {
    return `<div style="margin-top:8px"><div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">History</div>
      ${[...entries].reverse().slice(0,10).map(e=>{
        const bands = r.bands[e.bureau]||r.bands[Object.keys(r.bands)[0]];
        const band = bands.find(b=>e.score>=b.min&&e.score<=b.max)||bands[0];
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
          <div><div style="font-size:13px;font-weight:700;color:${band.color}">${e.score}</div><div style="font-size:11px;color:var(--text3)">${e.bureau} · ${e.date}</div></div>
          <div style="font-size:12px;font-weight:600;color:${band.color}">${band.label}</div>
        </div>`;
      }).join('')}
    </div>`;
  },

  _setCountry(c) { const d=this.get(); d.country=c; this.save(d); this.render(); },

  openAdd() {
    const d = this.get();
    const r = this.ranges[d.country]||this.ranges.GB;
    Modal.open('📊 Add Credit Score',`
      <div style="display:flex;flex-direction:column;gap:12px">
        <select id="cs-bureau" style="background:var(--input);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text)">
          ${r.bureaus.map(b=>`<option>${b}</option>`).join('')}
        </select>
        <input id="cs-score" type="number" placeholder="Your score" min="0" max="999" style="background:var(--input);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text)">
        <input id="cs-date" type="date" value="${new Date().toISOString().slice(0,10)}" style="background:var(--input);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text)">
        <input id="cs-notes" placeholder="Notes (optional)" style="background:var(--input);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text)">
      </div>`,
      `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="CreditScore._saveEntry()">Save</button>`);
  },

  _saveEntry() {
    const score = parseInt(document.getElementById('cs-score')?.value||0);
    const bureau = document.getElementById('cs-bureau')?.value;
    const date = document.getElementById('cs-date')?.value;
    const notes = document.getElementById('cs-notes')?.value;
    if (!score) { Toast.show('Enter your score','error'); return; }
    const d = this.get();
    d.entries.push({ score, bureau, date, notes });
    this.save(d);
    Modal.close();
    this.render();
    Toast.show('Score saved','success');
  }
};
window.CreditScore = CreditScore;
