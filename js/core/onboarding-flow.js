// VaultCap — first-run onboarding wizard (extracted from app.js)

// ===================== ONBOARDING =====================
let obStep = 1;
let obCountries = [];
let obCats = { money: true, assets: false, identity: true, family: true };
let obUserType = 'personal';
let obProfileSkipped = false;

const OB = {
  init() {
    obStep = 1;
    obProfileSkipped = false;
    obCountries = S.user && S.user.country ? [S.user.country] : [];
    obCats = { money: true, assets: false, identity: true, family: true };
    obUserType = 'personal';
    document.getElementById('pgOnboard').style.display = 'flex';
    document.getElementById('pgHome').style.display = 'none';
    this.renderProg();
    this.renderCountries();
    this.renderCats();
  },
  renderProg() {
    document.getElementById('obProg').innerHTML = Array.from({ length: 7 }, (_, i) =>
      `<div class="ob-pd${i < obStep ? ' on' : ''}"></div>`
    ).join('');
  },
  renderCountries() {
    const COUNTRIES = [
      { code:'PK', flag:'🇵🇰', name:'Pakistan' },
      { code:'GB', flag:'🇬🇧', name:'United Kingdom' },
      { code:'AE', flag:'🇦🇪', name:'UAE' },
      { code:'US', flag:'🇺🇸', name:'USA' },
    ];
    const el = document.getElementById('ob-countries');
    if (!el) return;
    el.innerHTML = COUNTRIES.map(c =>
      `<div onclick="OB.toggleCountry('${c.code}',this)"
        style="padding:14px 12px;border-radius:14px;background:${obCountries.includes(c.code)?'var(--glass2)':'var(--glass)'};border:2px solid ${obCountries.includes(c.code)?'var(--accent)':'var(--border)'};cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:10px;transition:.15s">
        <span style="font-size:22px">${c.flag}</span>
        <span style="font-size:13px;font-weight:600;color:var(--text)">${c.name}</span>
      </div>`
    ).join('');
  },
  toggleCountry(code, el) {
    const i = obCountries.indexOf(code);
    if (i > -1) obCountries.splice(i, 1); else obCountries.push(code);
    const on = obCountries.includes(code);
    el.style.borderColor = on ? 'var(--accent)' : 'var(--border)';
    el.style.background = on ? 'var(--glass2)' : 'var(--glass)';
  },
  renderCats() {
    const cats = [
      { key:'money',    icon:'banknote', label:'Money',    desc:'Banks, cards, investments' },
      { key:'assets',   icon:'building', label:'Assets',   desc:'Property, vehicles, valuables' },
      { key:'identity', icon:'id-card', label:'Identity', desc:'Documents, SIMs, digital' },
      { key:'family',   icon:'users', label:'Family',   desc:'Manage family finances' },
    ];
    const el = document.getElementById('ob-cats');
    if (!el) return;
    el.innerHTML = cats.map(c =>
      `<div onclick="OB.toggleCat('${c.key}',this)"
        role="checkbox" tabindex="0" aria-checked="${obCats[c.key]?'true':'false'}"
        style="padding:16px 12px;border-radius:16px;background:${obCats[c.key]?'var(--glass2)':'var(--glass)'};border:2px solid ${obCats[c.key]?'var(--accent)':'var(--border)'};cursor:pointer;touch-action:manipulation;display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;position:relative;transition:.15s">
        <span class="chip-ic" style="display:flex;justify-content:center" aria-hidden="true">${typeof VC !== 'undefined' ? VC.icon(c.icon, 30) : ''}</span>
        <div style="font-size:13px;font-weight:700;color:var(--text)">${c.label}</div>
        <div style="font-size:10px;color:var(--text3);line-height:1.3">${c.desc}</div>
        <div aria-hidden="true" style="position:absolute;top:8px;right:10px;width:18px;height:18px;border-radius:50%;background:${obCats[c.key]?'var(--accent)':'transparent'};border:2px solid ${obCats[c.key]?'var(--accent)':'var(--border)'};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff">${obCats[c.key]?'✓':''}</div>
      </div>`
    ).join('');
  },
  selectUserType(type, el) {
    obUserType = type;
    document.querySelectorAll('.ob-type-card').forEach(c => {
      c.style.borderColor = 'var(--border)';
      c.style.background = 'var(--glass)';
      c.setAttribute('aria-checked', 'false');
    });
    if (el) { el.style.borderColor = 'var(--accent)'; el.style.background = 'var(--glass2)'; el.setAttribute('aria-checked', 'true'); }
  },
  toggleCat(key, el) {
    obCats[key] = !obCats[key];
    const on = obCats[key];
    el.style.borderColor = on ? 'var(--accent)' : 'var(--border)';
    el.style.background = on ? 'var(--glass2)' : 'var(--glass)';
    el.setAttribute('aria-checked', on ? 'true' : 'false');
    const check = el.querySelector('div:last-child');
    if (check) {
      check.style.background = on ? 'var(--accent)' : 'transparent';
      check.style.borderColor = on ? 'var(--accent)' : 'var(--border)';
      check.textContent = on ? '✓' : '';
    }
  },
  checkPIN() {
    const p1 = document.getElementById('ob-pin')?.value;
    const p2 = document.getElementById('ob-pin2')?.value;
    const m  = document.getElementById('ob-pinmatch');
    if (!m || !p2) return;
    if (p2.length === 0) { m.textContent = ''; return; }
    if (p1 === p2 && p1.length === 6) { m.innerHTML = '<span style="color:var(--ok)">PINs match</span>'; }
    else if (p1.startsWith(p2) || p2.length < 6) { m.innerHTML = '<span style="color:var(--text3)">Typing...</span>'; }
    else { m.innerHTML = '<span style="color:var(--err)">PINs do not match</span>'; }
  },
  copyRecoveryKey() {
    const mk = window._obRecoveryKey;
    const el = document.getElementById('ob-recovery-key');
    const text = mk || (el ? el.textContent : '');
    if (!text || text.includes('Generating') || text.includes('Error')) {
      Toast.show('Key not ready yet', 'warn');
      return;
    }
    const fmt = mk ? mk.match(/.{1,6}/g).join('-') : text;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fmt).then(() => Toast.show('Recovery key copied — store it safely', 'success', 4000));
    } else {
      Toast.show('Copy: ' + fmt, 'info', 8000);
    }
  },
  next(step) {
    obStep = step + 1;
    document.querySelectorAll('.ob-step').forEach((el, i) => el.classList.toggle('on', i + 1 === obStep));
    this.renderProg();
    if (obStep === 7) this._renderReadyStats();
  },
  back() {
    if (obStep <= 1) return;
    obStep--;
    document.querySelectorAll('.ob-step').forEach((el, i) => el.classList.toggle('on', i + 1 === obStep));
    this.renderProg();
  },
  skipToPin() {
    obProfileSkipped = true;
    obStep = 5;
    document.querySelectorAll('.ob-step').forEach((el, i) => el.classList.toggle('on', i + 1 === obStep));
    this.renderProg();
    Toast.show('Profile setup saved for later — finish anytime in Settings', 'info', 4000);
  },
  _renderReadyStats() {
    const CNAMES = { PK:'🇵🇰 Pakistan', GB:'🇬🇧 UK', AE:'🇦🇪 UAE', US:'🇺🇸 USA' };
    const el = document.getElementById('ob-ready-stats');
    if (!el) return;
    const countries = obCountries.length ? obCountries.map(c => CNAMES[c] || c).join(', ') : 'Not set';
    const CATLABELS = { money:'Money', assets:'Assets', identity:'Identity', family:'Family' };
    const cats = Object.entries(obCats).filter(([, v]) => v).map(([k]) => CATLABELS[k]).join(', ') || 'None selected';
    const TYPE_LABELS = { personal:'Personal', family:'Family Manager', business:'Business Owner', expat:'Global Expat' };
    el.innerHTML = `
      <div style="font-size:10px;font-weight:700;letter-spacing:.5px;color:var(--text3);margin-bottom:10px;text-transform:uppercase">Your Setup</div>
      <div style="font-size:13px;color:var(--text2);margin-bottom:6px">Type: ${TYPE_LABELS[obUserType] || obUserType}</div>
      <div style="font-size:13px;color:var(--text2);margin-bottom:6px">Countries: ${countries}</div>
      <div style="font-size:13px;color:var(--text2)">Tracking: ${cats}</div>`;
  },
  finish() {
    const p  = document.getElementById('ob-pin').value;
    const p2 = document.getElementById('ob-pin2').value;
    if (!/^\d{6}$/.test(p)) { document.getElementById('ob-perr').textContent = 'PIN must be 6 digits'; return; }
    if (p !== p2) { document.getElementById('ob-perr').textContent = 'PINs do not match'; return; }
    S.pin = p; S.noPin = false;
    // Move to recovery key screen immediately
    obStep = 6;
    document.querySelectorAll('.ob-step').forEach((el, i) => el.classList.toggle('on', i + 1 === obStep));
    this.renderProg();
    const rkEl = document.getElementById('ob-recovery-key');
    if (rkEl) rkEl.textContent = 'Generating…';
    VaultDB.init(p).then(async () => {
      Store.save();
      delete S.pin;
      if (!localStorage.getItem(recoveryKeyStorageKey())) {
        const mk = generateMasterKey();
        await storeMasterKeyHash(mk);
        await VaultDB.saveRecovery(mk);
        const fmt = mk.match(/.{1,6}/g).join('-');
        window._obRecoveryKey = mk;
        const el = document.getElementById('ob-recovery-key');
        if (el) {
          el.textContent = fmt;
          el.style.fontSize = '0.95rem';
          el.style.lineHeight = '1.5';
        }
        const copyBtn = document.getElementById('ob-recovery-copy');
        if (copyBtn) copyBtn.style.display = 'flex';
        if (navigator.vibrate) navigator.vibrate([20, 40, 20]);
        Toast.show('Recovery key ready — write it down now', 'warning', 6000);
      } else {
        const el = document.getElementById('ob-recovery-key');
        if (el) el.textContent = '(Recovery key already configured)';
      }
    }).catch(e => {
      console.warn('[VaultDB] init error:', e);
      const el = document.getElementById('ob-recovery-key');
      if (el) el.textContent = 'Error generating key — please retry';
    });
  },
  complete() {
    if (obCountries.length > 0) {
      S.user.country = obCountries[0];
      S.user.currency = COUNTRY_CUR[obCountries[0]] || 'USD';
      S.user.secondaryCountries = obCountries.slice(1);
    }
    S.user.userType = obUserType;
    // Apply onboarding category choices to modules
    const moneyMods = ['banks','cards','investments','cash','loans','expenses','bc','bonds','credit','currency','zakat','tax'];
    const assetMods = ['assets','vehicles','gold'];
    const identityMods = ['documents','sims','emails','digital','friends'];
    if (!obCats.money) moneyMods.forEach(id => { S.modules[id] = false; });
    if (!obCats.assets) assetMods.forEach(id => { S.modules[id] = false; });
    if (!obCats.identity) identityMods.forEach(id => { S.modules[id] = false; });
    // Apply module presets based on user type
    if (obUserType === 'family') {
      S.modules.family = true;
      obCats.family = true;
    } else if (obUserType === 'business') {
      S.modules.tax = true; S.modules.bc = true; S.modules.bonds = true; S.modules.credit = true;
    } else if (obUserType === 'expat') {
      S.modules.family = true; S.modules.currency = true;
    }
    if (!obCats.family) S.modules.family = false;
    S.autoLock = true; S.lockMins = 10; S.clipSecs = 30;
    const name = document.getElementById('ob-name')?.value.trim();
    if (name) S.user.name = name;
    if (S.modules.family && typeof Family !== 'undefined') {
      Family.ensureHeadFromProfile({ silent: true });
    }
    S.user.onboardingComplete = true;
    S.user.setupProgress = {
      pinSet: true,
      recoveryAck: true,
      profileDone: !obProfileSkipped,
    };
    Store.save();
    if (typeof buildNav === 'function') buildNav();
    document.getElementById('pgOnboard').style.display = 'none';
    Toast.show(`Welcome to VaultCap${name ? ', ' + name : ''}!`, 'success');
    R.unlock();
    setTimeout(() => {
      const ov = document.createElement('div');
      ov.id = 'quickStartOv';
      ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:1000;display:flex;flex-direction:column;align-items:center;justify-content:center;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);padding:24px';
      ov.innerHTML = `
        <div style="font-size:22px;font-weight:800;margin-bottom:6px;text-align:center">Quick Start</div>
        <div style="font-size:13px;color:var(--text2);margin-bottom:20px;text-align:center">Tap a card to add your first entry</div>
        <div style="display:flex;flex-direction:column;gap:10px;width:100%;max-width:320px">
          <div onclick="Banks.openAdd();document.getElementById('quickStartOv').remove()" style="background:var(--glass2);border:1px solid var(--border2);border-radius:var(--r);padding:14px 16px;cursor:pointer;display:flex;align-items:center;gap:12px;animation:obIn .35s .05s both">
            <span class="chip-ic">${typeof VC !== 'undefined' ? VC.icon('bank', 26) : ''}</span><div style="flex:1"><div style="font-weight:700;font-size:14px">Add your first bank</div><div style="font-size:12px;color:var(--text2)">Accounts, IBANs &amp; login details</div></div><span style="color:var(--accent)">→</span>
          </div>
          <div onclick="DocsModule.openAdd();document.getElementById('quickStartOv').remove()" style="background:var(--glass2);border:1px solid var(--border2);border-radius:var(--r);padding:14px 16px;cursor:pointer;display:flex;align-items:center;gap:12px;animation:obIn .35s .15s both">
            <span class="chip-ic">${typeof VC !== 'undefined' ? VC.icon('id-card', 26) : ''}</span><div style="flex:1"><div style="font-weight:700;font-size:14px">Add your ID</div><div style="font-size:12px;color:var(--text2)">Passport, NIC, driving licence</div></div><span style="color:var(--accent)">→</span>
          </div>
          <div onclick="Sims.openAdd();document.getElementById('quickStartOv').remove()" style="background:var(--glass2);border:1px solid var(--border2);border-radius:var(--r);padding:14px 16px;cursor:pointer;display:flex;align-items:center;gap:12px;animation:obIn .35s .25s both">
            <span class="chip-ic">${typeof VC !== 'undefined' ? VC.icon('smartphone', 26) : ''}</span><div style="flex:1"><div style="font-weight:700;font-size:14px">Add your SIM</div><div style="font-size:12px;color:var(--text2)">Mobile numbers &amp; networks</div></div><span style="color:var(--accent)">→</span>
          </div>
        </div>
        <button type="button" onclick="document.getElementById('quickStartOv').remove()" style="margin-top:18px;background:none;border:none;color:var(--text3);font-size:13px;cursor:pointer;padding:10px">Skip, go to dashboard →</button>
      `;
      document.body.appendChild(ov);
      setTimeout(() => { const e = document.getElementById('quickStartOv'); if (e) e.remove(); }, 8000);
    }, 400);
  }
};
window.OB = OB;
