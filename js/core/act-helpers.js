'use strict';
/* Named helpers for handlers too complex for Act interpreter */

const ActHelpers = {
  toggleAdv(sectionId, btnId, openDisplay, showLabel, hideLabel) {
    const a = document.getElementById(sectionId);
    const t = document.getElementById(btnId);
    if (!a) return;
    const openDisp = openDisplay || 'flex';
    const open = a.style.display === openDisp || a.style.display === 'block';
    a.style.display = open ? 'none' : openDisp;
    if (t) t.textContent = open ? (showLabel || 'Show advanced') : (hideLabel || 'Hide advanced');
  },

  toggleJointSection(sectionId, checked) {
    const s = document.getElementById(sectionId);
    if (s) s.style.display = checked ? 'block' : 'none';
  },

  forgotPin() {
    if (typeof forgotPINFromLock === 'function') forgotPINFromLock();
    else if (window.Settings && typeof Settings.forgotPIN === 'function') Settings.forgotPIN();
    else alert('To recover your vault: go to Settings → Security → Forgot PIN');
  },

  setAiResult(i, key, value) {
    if (typeof AIImport === 'undefined' || !AIImport._results) return;
    if (!AIImport._results[i]) return;
    if (!AIImport._results[i].data) AIImport._results[i].data = {};
    AIImport._results[i].data[key] = value;
  },

  setIeResult(i, key, value) {
    if (typeof ImportEngine === 'undefined' || !ImportEngine._results) return;
    if (!ImportEngine._results[i]) return;
    if (!ImportEngine._results[i].data) ImportEngine._results[i].data = {};
    ImportEngine._results[i].data[key] = value;
  },

  gotoSettingsTab(tab) {
    if (typeof R !== 'undefined') R.goto('settings');
    setTimeout(function () {
      if (typeof SettingsNav !== 'undefined') SettingsNav.show(tab || 'profile');
    }, 80);
  },

  /** Locked welcome grid: unlock first, then open module. */
  homeModGoto(page) {
    if (window._vosUnlocked && typeof R !== 'undefined') {
      R.goto(page);
      return;
    }
    if (typeof Toast !== 'undefined') Toast.show('Unlock vault to open', 'info');
    if (typeof R !== 'undefined') R.showLock();
  },

  closeSheetGotoModules(sheetId) {
    const el = document.getElementById(sheetId);
    if (el) el.remove();
    this.gotoSettingsTab('modules');
  },

  closeSheetGoto(sheetId, pageId) {
    const el = document.getElementById(sheetId);
    if (el) el.remove();
    if (pageId && typeof R !== 'undefined') R.goto(pageId);
  },

  copyText(text) {
    const t = String(text || '');
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      if (typeof Toast !== 'undefined') Toast.show('Copy failed', 'warn');
      return;
    }
    navigator.clipboard.writeText(t).then(function () {
      if (typeof Toast !== 'undefined') Toast.show('Copied', 'success');
    }).catch(function () {
      if (typeof Toast !== 'undefined') Toast.show('Copy failed', 'warn');
    });
  },

  copyExportKey() {
    this.copyText(window._vosExportKey || '');
  },

  clearExportKey() {
    window._vosExportKey = null;
  },

  toggleSecondaryCountry(code) {
    if (typeof Onboarding === 'undefined') return;
    const arr = Onboarding._secondaryCountries || (Onboarding._secondaryCountries = []);
    const i = arr.indexOf(code);
    if (i > -1) arr.splice(i, 1);
    else arr.push(code);
    if (typeof Onboarding._renderCountries === 'function') Onboarding._renderCountries();
    else if (typeof Onboarding.render === 'function') Onboarding.render();
  },

  clearSecondaryCountries() {
    if (typeof Onboarding === 'undefined') return;
    Onboarding._secondaryCountries = [];
    document.querySelectorAll('.ob-sec').forEach(function (el) {
      el.style.borderColor = 'var(--border)';
      el.style.background = 'var(--glass)';
    });
  },

  clearSecondaryAndStyle(el) {
    this.clearSecondaryCountries();
    if (el) {
      el.style.borderColor = 'var(--accent)';
      el.style.background = 'var(--glass2)';
    }
  },

  selectPrimaryCountry(code, el) {
    if (typeof Onboarding === 'undefined') return;
    Onboarding._primaryCountry = code;
    document.querySelectorAll('.ob-country').forEach(function (node) {
      node.style.borderColor = 'var(--border)';
      node.setAttribute('aria-pressed', 'false');
    });
    if (el) {
      el.style.borderColor = 'var(--accent)';
      el.setAttribute('aria-pressed', 'true');
    }
  },

  toggleObModule(key, el) {
    if (typeof Onboarding === 'undefined' || !Onboarding._modules) return;
    Onboarding._modules[key] = !Onboarding._modules[key];
    const on = !!Onboarding._modules[key];
    if (el) {
      el.style.borderColor = on ? 'var(--accent)' : 'var(--border)';
      const check = el.querySelector('.mod-check');
      if (check) check.style.background = on ? 'var(--accent)' : 'transparent';
    }
  },

  remindersEnable() {
    if (typeof Reminders === 'undefined') return;
    Reminders.requestPermission().then(function () { Reminders.render(); });
  },

  upperAlnumDash(el) {
    if (!el) return;
    el.value = String(el.value || '').toUpperCase().replace(/[^A-Z0-9-]/g, '');
  },

  hideEl(el) {
    if (el) el.style.display = 'none';
  },

  hideImgShowNext(el) {
    if (!el) return;
    el.style.display = 'none';
    if (el.nextElementSibling) el.nextElementSibling.style.display = 'flex';
  },

  dismissRestoreOffer() {
    try { sessionStorage.setItem('vo_restore_offer_dismissed', '1'); } catch (e) {}
    if (typeof Modal !== 'undefined') Modal.close();
  },

  addAnother(callExpr) {
    const bar = document.getElementById('add-another-bar');
    if (bar) bar.remove();
    if (typeof Act !== 'undefined' && Act.run) {
      Act.run(String(callExpr || ''), { el: null, event: null });
    }
  },

  addAnotherFromBtn(btn) {
    const callExpr = btn && btn.getAttribute ? btn.getAttribute('data-open-fn') : '';
    this.addAnother(callExpr);
  },

  pickBankTile(name, cc, el) {
    const nameEl = document.getElementById('bf-name');
    if (nameEl) nameEl.value = name;
    const s = document.getElementById('bf-bank-sel');
    if (s) s.value = name;
    if (typeof SMART_DB !== 'undefined' && SMART_DB.fillBank) SMART_DB.fillBank(name, cc);
    const grid = document.getElementById('bf-tiles-grid');
    if (grid) grid.querySelectorAll('div').forEach(function (t) { t.style.borderColor = ''; });
    if (el) el.style.borderColor = 'var(--accent)';
  },

  taxChip(groupClass, fieldId, value, bg, el) {
    document.querySelectorAll('.' + groupClass).forEach(function (x) {
      x.style.background = 'transparent';
    });
    if (el) el.style.background = bg || 'rgba(0,213,255,.2)';
    const field = document.getElementById(fieldId);
    if (field) field.value = value;
  },

  taxVat(rate, el) {
    if (typeof Tax !== 'undefined') Tax._gbVatRate = rate;
    this.taxChip('gbvat-btn', 'gbvat-rate', rate, 'rgba(0,213,255,.2)', el);
  },

  toggleWallet(cardId, checked) {
    if (typeof S === 'undefined') return;
    if (!Array.isArray(S.wallet)) S.wallet = [];
    if (checked) {
      if (S.wallet.indexOf(cardId) < 0) S.wallet.push(cardId);
    } else {
      S.wallet = S.wallet.filter(function (x) { return x !== cardId; });
    }
  },

  privacyMode(checked) {
    if (typeof S === 'undefined') return;
    S.privacyMode = !!checked;
    document.body.classList.toggle('privacy', !!checked);
    if (typeof Store !== 'undefined') Store.save();
  },

  toggleEditPanel(btn) {
    if (!btn) return;
    const panel = btn.closest('div') && btn.closest('div').nextElementSibling;
    if (!panel) return;
    const hide = panel.style.display === 'none' || !panel.style.display;
    panel.style.display = hide ? 'block' : 'none';
    btn.textContent = btn.textContent === 'Edit' ? 'Hide' : 'Edit';
  },

  removeFriendUndo(friendId, el) {
    if (typeof S === 'undefined') return;
    S.friends = (S.friends || []).filter(function (f) { return f.id !== friendId; });
    if (typeof Store !== 'undefined') Store.save();
    if (el && el.closest) {
      const toast = el.closest('.toast');
      if (toast) toast.remove();
    }
    if (typeof Toast !== 'undefined') Toast.show('Removed from Friends', 'info', 1800);
  },

  zakatInvType(invId, value) {
    if (typeof Zakat === 'undefined') return;
    if (!Zakat._investmentType) Zakat._investmentType = {};
    Zakat._investmentType[invId] = value;
    if (Zakat._saveState) Zakat._saveState();
    if (Zakat._recalculate) Zakat._recalculate();
  },

  classToggle(el, cls) {
    if (el && el.classList) el.classList.toggle(cls);
  },

  toggleDisplay(id, btn) {
    const el = document.getElementById(id);
    if (!el) return;
    const open = el.style.display === 'none' || !el.style.display;
    el.style.display = open ? 'block' : 'none';
    if (btn) {
      const caret = btn.querySelector('.tap-link-caret');
      if (caret) caret.textContent = open ? 'Hide' : 'Show';
    }
  },

  dismissCtxCta() {
    try { sessionStorage.setItem('vos_ctx_cta_dismissed', '1'); } catch (e) {}
    if (typeof Dash !== 'undefined' && Dash.render) Dash.render();
    else if (typeof R !== 'undefined' && R.goto && typeof S !== 'undefined') R.goto(S.currentPage || 'dashboard');
  },

  bindImportDrop(zone) {
    if (!zone || zone.__vosDropBound) return;
    zone.__vosDropBound = true;
    zone.addEventListener('dragover', function (e) {
      e.preventDefault();
      zone.style.borderColor = 'var(--accent)';
      zone.style.background = 'var(--glow)';
    });
    zone.addEventListener('dragleave', function () {
      zone.style.borderColor = 'var(--border2)';
      zone.style.background = 'var(--glass)';
    });
    zone.addEventListener('drop', function (e) {
      if (typeof ImportEngine !== 'undefined' && ImportEngine.handleDrop) ImportEngine.handleDrop(e);
    });
  },
};

window.ActHelpers = ActHelpers;
