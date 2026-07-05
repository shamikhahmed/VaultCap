'use strict';
/* TravelMode — one-tap abroad layout: Traveler workspace, country filter, privacy, quick docs/wallet */

const TravelMode = {
  isActive() {
    return !!(S.user && S.user.travelModeActive);
  },

  _snapshot() {
    if (S.user.travelModeSnapshot) return;
    S.user.travelModeSnapshot = {
      modules: { ...S.modules },
      workspace: S.workspace || 'default',
      activeContext: S.user.activeContext || 'ALL',
      privacyMode: !!S.privacyMode,
    };
  },

  _restore() {
    const snap = S.user.travelModeSnapshot;
    if (!snap) return;
    Object.assign(S.modules, snap.modules);
    S.workspace = snap.workspace;
    S.user.activeContext = snap.activeContext;
    S.privacyMode = snap.privacyMode;
    document.body.classList.toggle('privacy', S.privacyMode);
    delete S.user.travelModeSnapshot;
  },

  _applyTravelerModules() {
    const preset = WORKSPACE_PRESETS.traveler;
    if (!preset) return;
    S.workspace = 'traveler';
    Object.assign(S.modules, preset.modules);
  },

  enable(countryCode) {
    if (S.decoy) {
      Toast.show('Travel Mode is not available in decoy vault', 'warn');
      return;
    }
    this._snapshot();
    this._applyTravelerModules();
    S.user.travelModeActive = true;
    if (countryCode && countryCode !== 'ALL') {
      S.user.travelCountry = countryCode;
      S.user.activeContext = countryCode;
    } else {
      S.user.travelCountry = S.user.travelCountry || S.user.country || 'ALL';
      if (S.user.travelCountry && S.user.travelCountry !== 'ALL') {
        S.user.activeContext = S.user.travelCountry;
      }
    }
    if (!S.privacyMode) {
      S.privacyMode = true;
      document.body.classList.add('privacy');
    }
    Store.save();
    buildNav();
    if (typeof R !== 'undefined' && S.unlocked) {
      R.goto('dashboard');
      setTimeout(() => { if (typeof Dash !== 'undefined') Dash.render(); }, 80);
    }
    Activity.log('Travel Mode enabled', S.user.travelCountry || '');
    Toast.show('Travel Mode on — cards, SIMs, documents prioritized', 'success', 3500);
  },

  disable() {
    if (!this.isActive()) return;
    this._restore();
    S.user.travelModeActive = false;
    delete S.user.travelCountry;
    Store.save();
    buildNav();
    if (typeof R !== 'undefined' && S.unlocked) {
      R.goto('dashboard');
      setTimeout(() => { if (typeof Dash !== 'undefined') Dash.render(); }, 80);
    }
    Activity.log('Travel Mode disabled');
    Toast.show('Travel Mode off — full vault restored', 'info', 3000);
  },

  toggle() {
    if (this.isActive()) this.disable();
    else this.openEnableModal();
  },

  openEnableModal() {
    const codes = [];
    if (S.user.country) codes.push(S.user.country);
    (S.user.secondaryCountries || []).forEach(c => { if (c && !codes.includes(c)) codes.push(c); });
    const pickList = codes.length
      ? codes.map(c => `<option value="${c}">${U.flag(c)} ${U.cname(c)}</option>`).join('') +
        '<option value="ALL">All countries</option>'
      : '<option value="ALL">All countries (set home country in Profile for filters)</option>';
    Modal.open('Enable Travel Mode',
      `<p style="font-size:13px;color:var(--text2);line-height:1.6;margin-bottom:14px">Optimizes VaultCap for being abroad: travel-focused modules, country filter, privacy blur, and quick access to documents and today's wallet.</p>
       <div class="fg"><label class="fl">Focus country (optional)</label>
         <select class="inp" id="tm-country">${pickList}</select></div>
       <ul style="font-size:12px;color:var(--text3);margin:12px 0 0 18px;line-height:1.7">
         <li>Traveler workspace — cards, SIMs, documents, emails</li>
         <li>Privacy mode on while traveling</li>
         <li>Dashboard shortcuts to passport/ID and wallet</li>
       </ul>`,
      `<button type="button" class="btn btn-g" onclick="Modal.close()">Cancel</button>
       <button type="button" class="btn btn-p" onclick="TravelMode.confirmEnable()">Enable Travel Mode</button>`
    );
    const sel = document.getElementById('tm-country');
    if (sel && S.user.travelCountry) sel.value = S.user.travelCountry;
    else if (sel && S.user.country) sel.value = S.user.country;
  },

  confirmEnable() {
    const code = document.getElementById('tm-country')?.value || 'ALL';
    Modal.close();
    this.enable(code === 'ALL' ? null : code);
  },

  bannerHtml() {
    if (!this.isActive()) return '';
    const country = S.user.travelCountry && S.user.travelCountry !== 'ALL'
      ? `${U.flag(S.user.travelCountry)} ${U.cname(S.user.travelCountry)}`
      : 'All countries';
    return `<div class="travel-banner" role="status">
      <div class="travel-banner-main">
        <span class="travel-banner-chip">Travel Mode</span>
        <span class="travel-banner-text">Focused on ${country} · privacy on</span>
      </div>
      <div class="travel-banner-actions">
        <button type="button" class="btn btn-g btn-sm" onclick="R.goto('documents')">Documents</button>
        <button type="button" class="btn btn-g btn-sm" onclick="Dash.editWallet()">Wallet</button>
        <button type="button" class="btn btn-g btn-sm" onclick="TravelMode.disable()">Exit</button>
      </div>
    </div>`;
  },

  settingsRow() {
    const on = this.isActive();
    return `<div class="si"><div class="sil"><div class="name">Travel Mode</div><div class="desc">${on ? 'Active — abroad layout with privacy blur' : 'One tap: traveler modules, country filter, document shortcuts'}</div></div>
      <button type="button" class="btn btn-g btn-sm" onclick="TravelMode.${on ? 'disable()' : 'openEnableModal()'}">${on ? 'Turn Off' : 'Enable'}</button></div>`;
  },
};

try { window.TravelMode = TravelMode; } catch (e) {}
