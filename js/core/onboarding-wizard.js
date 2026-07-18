'use strict';
/* Onboarding — in-app wizard (distinct from onboarding-flow.js router) */

const Onboarding = {
  _step: 0,

  shouldShow() {
    return S.unlocked && !S.user.onboardingComplete;
  },

  show() {
    this._step = 0;
    this._render();
  },

  _countries: [
    { code: 'PK', name: 'Pakistan',        flag: '🇵🇰', currency: 'PKR', zakat: true  },
    { code: 'GB', name: 'United Kingdom',  flag: '🇬🇧', currency: 'GBP', zakat: false },
    { code: 'AE', name: 'UAE',             flag: '🇦🇪', currency: 'AED', zakat: false },
    { code: 'US', name: 'United States',   flag: '🇺🇸', currency: 'USD', zakat: false },
    { code: 'CA', name: 'Canada',          flag: '🇨🇦', currency: 'CAD', zakat: false },
    { code: 'AU', name: 'Australia',       flag: '🇦🇺', currency: 'AUD', zakat: false },
    { code: 'SA', name: 'Saudi Arabia',    flag: '🇸🇦', currency: 'SAR', zakat: true  },
    { code: 'QA', name: 'Qatar',           flag: '🇶🇦', currency: 'QAR', zakat: false },
    { code: 'OTHER', name: 'Other',        flag: '🌍', currency: 'USD', zakat: false },
  ],

  _primaryCountry: '',
  _secondaryCountries: [],
  _prefs: { zakat: false, family: false, business: false, investments: false },
  _modules: { banking:true, documents:true, family:false, investments:false, vehicles:false, expenses:false, zakat:false, tax:true, currency:false, loans:false },

  _render() {
    const existing = document.getElementById('onboarding-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'onboarding-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:9000;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;overflow-y:auto;animation:fadeIn .3s ease';

    const steps = ['welcome', 'country', 'secondary', 'modules', 'prefs', 'done'];
    const progress = `
      <div style="display:flex;gap:6px;margin-bottom:32px">
        ${steps.map((_, i) => `<div style="height:3px;flex:1;border-radius:2px;background:${i <= this._step ? 'var(--accent)' : 'var(--border)'}"></div>`).join('')}
      </div>`;

    let content = '';

    if (this._step === 0) {
      content = `
        <div style="font-size:40px;margin-bottom:16px">${typeof VC!=='undefined'?VC.icon('vault',40):''}</div>
        <div style="font-size:24px;font-weight:800;color:var(--text);margin-bottom:8px;text-align:center">Welcome to VaultCap</div>
        <div style="font-size:14px;color:var(--text3);text-align:center;line-height:1.7;max-width:320px;margin-bottom:32px">Your private financial vault. Takes 30 seconds to personalise.</div>
        <button type="button" data-act="Onboarding._next()" class="btn btn-p" style="width:100%;max-width:320px;padding:16px;font-size:15px;font-weight:700">Get Started →</button>
        <button type="button" data-act="Onboarding._skip()" style="margin-top:14px;background:none;border:none;color:var(--text3);font-size:13px;cursor:pointer;touch-action:manipulation">Skip for now</button>`;
    } else if (this._step === 1) {
      content = `
        <div style="font-size:22px;font-weight:800;color:var(--text);margin-bottom:6px;text-align:center">Where do you primarily live?</div>
        <div style="font-size:13px;color:var(--text3);text-align:center;margin-bottom:24px">Sets your currency, tax system, and banks</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;max-width:400px;margin-bottom:24px">
          ${this._countries.map(c => `
            <div data-act="ActHelpers.selectPrimaryCountry('${c.code}',this)"
              class="ob-country"
              role="button" tabindex="0" aria-pressed="${this._primaryCountry===c.code?'true':'false'}"
              style="padding:14px 12px;border-radius:14px;background:var(--glass);border:2px solid ${this._primaryCountry===c.code?'var(--accent)':'var(--border)'};cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:10px">
              <span style="font-size:20px" aria-hidden="true">${c.flag}</span>
              <span style="font-size:13px;font-weight:600;color:var(--text)">${c.name}</span>
            </div>`).join('')}
        </div>
        <button type="button" data-act="Onboarding._next()" class="btn btn-p" style="width:100%;max-width:400px;padding:14px;font-weight:700">Continue →</button>
        <button type="button" data-act="Onboarding._back()" style="margin-top:12px;background:none;border:none;color:var(--text3);font-size:13px;cursor:pointer;touch-action:manipulation">← Back</button>`;
    } else if (this._step === 2) {
      content = `
        <div style="font-size:22px;font-weight:800;color:var(--text);margin-bottom:6px;text-align:center">Any other countries?</div>
        <div style="font-size:13px;color:var(--text3);text-align:center;margin-bottom:24px">Multi-country support — add relevant banks</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;max-width:400px;margin-bottom:24px">
          <div id="ob-none-card" data-act="ActHelpers.clearSecondaryAndStyle(this)"
            class="ob-sec"
            style="padding:14px 12px;border-radius:14px;background:var(--glass2);border:2px solid var(--accent);cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:10px;grid-column:1/-1">
            <span style="font-size:20px;display:flex">${typeof VC!=='undefined'?VC.icon('cross',20):''}</span>
            <span style="font-size:13px;font-weight:600;color:var(--text)">None — I only manage money in one country</span>
          </div>
          ${this._countries.filter(c=>c.code!==this._primaryCountry).map(c => `
            <div data-act="ActHelpers.toggleSecondaryCountry('${c.code}')"
              class="ob-sec"
              style="padding:14px 12px;border-radius:14px;background:${this._secondaryCountries.includes(c.code)?'var(--glass2)':'var(--glass)'};border:2px solid ${this._secondaryCountries.includes(c.code)?'var(--accent)':'var(--border)'};cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:10px">
              <span style="font-size:20px">${c.flag}</span>
              <span style="font-size:13px;font-weight:600;color:var(--text)">${c.name}</span>
            </div>`).join('')}
        </div>
        <button type="button" data-act="Onboarding._next()" class="btn btn-p" style="width:100%;max-width:400px;padding:14px;font-weight:700">Continue →</button>
        <button type="button" data-act="Onboarding._secondaryCountries=[];Onboarding._next()" style="margin-top:8px;background:none;border:none;color:var(--text3);font-size:13px;cursor:pointer;touch-action:manipulation">Skip this step →</button>
        <button type="button" data-act="Onboarding._back()" style="margin-top:12px;background:none;border:none;color:var(--text3);font-size:13px;cursor:pointer;touch-action:manipulation">← Back</button>`;
    } else if (this._step === 3) {
      const moduleOptions = [
        { key:'banking',     icon:'bank', label:'Banking & Cards',    desc:'Banks, cards, cash, credit' },
        { key:'documents',   icon:'id-card', label:'Documents & ID',     desc:'Passport, licence, visas' },
        { key:'family',      icon:'users', label:'Family Vault',       desc:'Finance for family members' },
        { key:'investments', icon:'trending-up', label:'Investments',         desc:'Stocks, funds, crypto, bonds' },
        { key:'vehicles',    icon:'car', label:'Vehicles & Assets',   desc:'Cars, property, gadgets' },
        { key:'expenses',    icon:'arrow-right', label:'Expenses',            desc:'Daily spending tracker' },
        { key:'zakat',       icon:'moon', label:'Zakat',               desc:'Islamic wealth calculator' },
        { key:'tax',         icon:'receipt', label:'Tax Calculator',      desc:'PK, UK, UAE tax tools' },
        { key:'currency',    icon:'arrows', label:'Currency & Metals',   desc:'Exchange rates, gold, silver' },
        { key:'loans',       icon:'handshake', label:'Loans & Debts',       desc:'Money lent or borrowed' },
      ];
      content = `
        <div style="font-size:22px;font-weight:800;color:var(--text);margin-bottom:6px;text-align:center">What do you want to manage?</div>
        <div style="font-size:13px;color:var(--text3);text-align:center;margin-bottom:20px">You can change this anytime in Settings</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%;max-width:440px;margin-bottom:20px;max-height:55vh;overflow-y:auto;padding:2px">
          ${moduleOptions.map(m => `
            <div data-act="ActHelpers.toggleObModule('${m.key}',this)"
              style="padding:12px;border-radius:14px;background:var(--glass);border:2px solid ${this._modules[m.key]?'var(--accent)':'var(--border)'};cursor:pointer;touch-action:manipulation;display:flex;flex-direction:column;gap:4px;position:relative">
              <div style="display:flex;align-items:center;justify-content:space-between">
                <span style="display:flex;align-items:center">${VC.icon(m.icon,18)}</span>
                <div class="mod-check" style="width:20px;height:20px;border-radius:50%;border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;background:${this._modules[m.key]?'var(--accent)':'transparent'}"></div>
              </div>
              <div style="font-size:12px;font-weight:700;color:var(--text);line-height:1.2">${m.label}</div>
              <div style="font-size:10px;color:var(--text3);line-height:1.3">${m.desc}</div>
            </div>`).join('')}
        </div>
        <button type="button" data-act="Onboarding._next()" class="btn btn-p" style="width:100%;max-width:440px;padding:14px;font-weight:700">Continue →</button>
        <button type="button" data-act="Onboarding._back()" style="margin-top:12px;background:none;border:none;color:var(--text3);font-size:13px;cursor:pointer;touch-action:manipulation">← Back</button>`;
    } else if (this._step === 4) {
      const prefs = [
        { key: 'zakat',       icon: 'moon', label: 'Zakat Calculator', desc: 'Islamic annual wealth obligation' },
        { key: 'family',      icon: 'users', label: 'Family Vault',    desc: 'Manage finances for your family' },
        { key: 'business',    icon: 'building-2', label: 'Business Accounts', desc: 'Separate business finances' },
        { key: 'investments', icon: 'trending-up', label: 'Investments',       desc: 'Track stocks, funds, crypto' },
      ];
      content = `
        <div style="font-size:22px;font-weight:800;color:var(--text);margin-bottom:6px;text-align:center">What do you use?</div>
        <div style="font-size:13px;color:var(--text3);text-align:center;margin-bottom:24px">Personalise your vault — hide what you don't need</div>
        <div style="display:flex;flex-direction:column;gap:10px;width:100%;max-width:400px;margin-bottom:24px">
          ${prefs.map(p => `
            <div data-act="Onboarding._prefs['${p.key}']=!Onboarding._prefs['${p.key}'];this.style.borderColor=Onboarding._prefs['${p.key}']?'var(--accent)':'var(--border)'"
              style="padding:14px 16px;border-radius:14px;background:var(--glass);border:2px solid ${this._prefs[p.key]?'var(--accent)':'var(--border)'};cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:14px">
              <span style="display:flex;align-items:center">${VC.icon(p.icon,20)}</span>
              <div style="flex:1">
                <div style="font-size:14px;font-weight:600;color:var(--text)">${p.label}</div>
                <div style="font-size:12px;color:var(--text3)">${p.desc}</div>
              </div>
              <div class="pref-check" style="width:24px;height:24px;border-radius:50%;border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:var(--accent);background:${this._prefs[p.key]?'rgba(123,95,255,.15)':'transparent'}"></div>
            </div>`).join('')}
        </div>
        <button type="button" data-act="Onboarding._next()" class="btn btn-p" style="width:100%;max-width:400px;padding:16px;font-size:15px;font-weight:700">Continue →</button>
        <button type="button" data-act="Onboarding._back()" style="margin-top:12px;background:none;border:none;color:var(--text3);font-size:13px;cursor:pointer;touch-action:manipulation">← Back</button>`;
    } else if (this._step === 5) {
      const country = this._countries.find(c => c.code === this._primaryCountry);
      const flag = country ? country.flag : '';
      content = `
        <div style="font-size:56px;margin-bottom:16px;animation:pgIn .4s ease both;display:flex;justify-content:center">${country ? flag : (typeof VC !== 'undefined' ? VC.icon('vault', 48) : '')}</div>
        <div style="font-size:26px;font-weight:800;color:var(--text);margin-bottom:8px;text-align:center;letter-spacing:-0.5px">Your vault is ready.</div>
        <div style="font-size:14px;color:var(--text3);text-align:center;line-height:1.7;max-width:300px;margin-bottom:28px">Everything's set up. Here's what you can do right now:</div>
        <div style="width:100%;max-width:360px;display:flex;flex-direction:column;gap:10px;margin-bottom:32px">
          <div style="display:flex;align-items:flex-start;gap:12px;padding:13px 16px;background:var(--glass);border:1px solid var(--border);border-radius:14px">
            <span style="display:flex;align-items:center;flex-shrink:0">${VC.icon('bank',18)}</span>
            <div>
              <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:2px">Add your accounts</div>
              <div style="font-size:12px;color:var(--text3);line-height:1.5">Track banks, cards, cash, and investments in one place</div>
            </div>
          </div>
          <div style="display:flex;align-items:flex-start;gap:12px;padding:13px 16px;background:var(--glass);border:1px solid var(--border);border-radius:14px">
            <span style="display:flex;align-items:center;flex-shrink:0">${VC.icon('chart',18)}</span>
            <div>
              <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:2px">See your net worth</div>
              <div style="font-size:12px;color:var(--text3);line-height:1.5">Your dashboard shows a live total across all assets</div>
            </div>
          </div>
          <div style="display:flex;align-items:flex-start;gap:12px;padding:13px 16px;background:var(--glass);border:1px solid var(--border);border-radius:14px">
            <span style="display:flex;align-items:center;flex-shrink:0">${VC.icon('lock',18)}</span>
            <div>
              <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:2px">Stay private &amp; secure</div>
              <div style="font-size:12px;color:var(--text3);line-height:1.5">PIN lock, privacy blur, and offline-first — your data never leaves your device</div>
            </div>
          </div>
        </div>
        <button type="button" data-act="Onboarding._finish()" class="btn btn-p" style="width:100%;max-width:360px;padding:16px;font-size:16px;font-weight:700;border-radius:16px">Go to My Vault →</button>`;
    }

    overlay.innerHTML = `
      <div style="width:100%;max-width:440px;display:flex;flex-direction:column;align-items:center">
        ${progress}
        ${content}
      </div>`;

    document.body.appendChild(overlay);
  },

  _next() {
    if (this._step === 1 && !this._primaryCountry) {
      Toast.show('Please select your primary country', 'warning');
      return;
    }
    if (this._step === 4) {
      // Run finish logic then show completion screen
      this._applyPrefs();
      this._step = 5;
      this._render();
      return;
    }
    this._step = Math.min(this._step + 1, 5);
    this._render();
  },

  _back() {
    this._step = Math.max(this._step - 1, 0);
    this._render();
  },

  _skip() {
    S.user.onboardingComplete = true;
    Store.save();
    document.getElementById('onboarding-overlay')?.remove();
    Toast.show('You can personalise anytime in Settings → Profile', 'info', 4000);
  },

  _applyPrefs() {
    const country = this._countries.find(c => c.code === this._primaryCountry);
    if (country) {
      S.user.country = country.code;
      S.user.currency = country.currency;
      S.user.secondaryCountries = this._secondaryCountries;
    }
    {
      const zakatOn = this._prefs.zakat || this._modules.zakat;
      const prefs = getTabPrefs();
      prefs.hiddenFinance = [...(prefs.hiddenFinance || [])];
      if (zakatOn) {
        prefs.hiddenFinance = prefs.hiddenFinance.filter(m => m !== 'zakat');
      } else {
        if (!prefs.hiddenFinance.includes('zakat')) prefs.hiddenFinance.push('zakat');
      }
      saveTabPrefs(prefs);
    }
    if (!this._prefs.family) S.modules.family = false;

    // Apply module step selections
    const mtp = getTabPrefs();
    mtp.hiddenFinance = mtp.hiddenFinance || [];
    mtp.hiddenVault = mtp.hiddenVault || [];
    mtp.hiddenAssets = mtp.hiddenAssets || [];
    if (!this._modules.banking) { ['banks','cards','cash','credit'].forEach(m => { if(!mtp.hiddenFinance.includes(m)) mtp.hiddenFinance.push(m); }); }
    if (!this._modules.investments) { if(!mtp.hiddenFinance.includes('investments')) mtp.hiddenFinance.push('investments'); }
    if (!this._modules.expenses) { if(!mtp.hiddenFinance.includes('expenses')) mtp.hiddenFinance.push('expenses'); }
    if (!this._modules.zakat) { if(!mtp.hiddenFinance.includes('zakat')) mtp.hiddenFinance.push('zakat'); }
    if (!this._modules.tax) { if(!mtp.hiddenFinance.includes('tax')) mtp.hiddenFinance.push('tax'); }
    if (!this._modules.currency) { ['currency','gold'].forEach(m => { if(!mtp.hiddenFinance.includes(m)) mtp.hiddenFinance.push(m); }); }
    if (!this._modules.loans) { if(!mtp.hiddenFinance.includes('loans')) mtp.hiddenFinance.push('loans'); }
    if (!this._modules.family) S.modules.family = false;
    if (!this._modules.vehicles) { if(!mtp.hiddenAssets.includes('vehicles')) mtp.hiddenAssets.push('vehicles'); }
    if (!this._modules.documents) { if(!mtp.hiddenVault.includes('documents')) mtp.hiddenVault.push('documents'); }
    saveTabPrefs(mtp);
    S.user.modulePrefs = this._modules;

    S.user.onboardingComplete = true;
    S.user.showZakat = this._prefs.zakat || this._modules.zakat;
    S.user.hasBusiness = this._prefs.business;
    Store.save();
    buildNav();
  },

  _finish() {
    const country = this._countries.find(c => c.code === this._primaryCountry);
    document.getElementById('onboarding-overlay')?.remove();
    Toast.show('Vault personalised', 'success');
    if (country) {
      Toast.show(`Currency set to ${country.currency} · Banks filtered to ${country.name}`, 'info', 4000);
    }
  },

  showSettingsCard() {
    return `
      <div style="background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);border-radius:14px;padding:16px;margin:0 0 16px">
        <div style="font-size:13px;font-weight:700;color:var(--accent);margin-bottom:6px">Personalise Your Vault</div>
        <div style="font-size:12px;color:var(--text3);line-height:1.6;margin-bottom:12px">Set your country, currency, and preferences for a tailored experience.</div>
        <button type="button" data-act="Onboarding._primaryCountry=S.user.country||'';Onboarding._secondaryCountries=S.user.secondaryCountries||[];Onboarding.show()" class="btn btn-p btn-sm">Run Setup →</button>
      </div>`;
  },
};

/* → js/core/image-utils.js */

/* → js/core/lookup-data.js */

/* → js/core/doc-schemas.js */

/* → js/core/vault-safety.js */

// Crypto → js/core/crypto.js · Migrate → js/core/migrate.js (load before app.js)
