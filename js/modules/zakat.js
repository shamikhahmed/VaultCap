'use strict';
// VaultOS Zakat Calculator — © 2026 Shamikh Ahmed
// Islamic calculations based on AAOIFI standards and classical fiqh
const Zakat = {
  _nisabType: 'silver',   // 'silver' | 'gold'
  _madhab: 'hanafi',      // 'hanafi' | 'other'
  _mode: 'personal',      // 'personal' | 'fbr'
  _includeJewellery: true, // Hanafi: yes, others: optional
  _hawlDate: null,        // ISO date string when wealth crossed nisab
  _investmentType: {},    // { [investmentId]: 'trading' | 'longterm' }

  _userCur() {
    return (typeof S !== 'undefined' && S.user && S.user.currency) ? S.user.currency : 'PKR';
  },

  _nisabValue(currency) {
    if (typeof RatesEngine === 'undefined') {
      return this._nisabType === 'gold' ? 1400000 : 140000;
    }
    return RatesEngine.nisab(this._nisabType, currency);
  },

  _vaultCash(currency) {
    if (typeof S === 'undefined') return 0;
    let total = 0;
    (S.cash || []).forEach(function(c) {
      total += typeof RatesEngine !== 'undefined'
        ? RatesEngine.convert(c.amount || 0, c.currency || 'PKR', currency)
        : (c.amount || 0);
    });
    return total;
  },

  _vaultBanks(currency) {
    if (typeof S === 'undefined') return 0;
    let total = 0;
    (S.banks || []).forEach(function(b) {
      const bal = b.balance || 0;
      const cur = b.currency || 'PKR';
      total += typeof RatesEngine !== 'undefined'
        ? RatesEngine.convert(bal, cur, currency)
        : bal;
    });
    return total;
  },

  _vaultInvestments(currency) {
    if (typeof S === 'undefined') return 0;
    const self = this;
    let total = 0;
    (S.investments || []).forEach(function(inv) {
      const val = inv.currentValue || inv.amountInvested || 0;
      const cur = inv.currency || 'PKR';
      const inCur = typeof RatesEngine !== 'undefined'
        ? RatesEngine.convert(val, cur, currency) : val;
      const type = self._investmentType[inv.id] || 'longterm';
      const zakatablePercent = inv.type === 'Crypto' ? 1.0
        : inv.type === 'Sukuk' ? 1.0
        : inv.type === 'Fixed Deposit' ? 1.0
        : type === 'trading' ? 1.0 : 0.25;
      total += inCur * zakatablePercent;
    });
    return total;
  },

  _vaultGold(currency) {
    if (typeof Gold === 'undefined' || typeof RatesEngine === 'undefined') return 0;
    const items = Gold.get();
    let total = 0;
    items.forEach(function(x) {
      if (x.metal !== 'gold') return;
      const pricePerGram = RatesEngine.goldInCurrency(currency, 'gram');
      let grams = x.weight || 0;
      if (x.unit === 'tola') grams *= 11.6638;
      else if (x.unit === 'oz') grams *= 31.1035;
      else if (x.unit === 'kg') grams *= 1000;
      total += grams * pricePerGram;
    });
    return total;
  },

  _vaultSilver(currency) {
    if (typeof Gold === 'undefined' || typeof RatesEngine === 'undefined') return 0;
    const items = Gold.get();
    let total = 0;
    items.forEach(function(x) {
      if (x.metal !== 'silver') return;
      const pricePerGram = RatesEngine.silverInCurrency(currency, 'gram');
      let grams = x.weight || 0;
      if (x.unit === 'tola') grams *= 11.6638;
      else if (x.unit === 'oz') grams *= 31.1035;
      else if (x.unit === 'kg') grams *= 1000;
      total += grams * pricePerGram;
    });
    return total;
  },

  _vaultLoansGiven(currency) {
    if (typeof S === 'undefined') return 0;
    let total = 0;
    (S.loans || []).forEach(function(l) {
      if (l.type !== 'lent' || l.settled) return;
      total += typeof RatesEngine !== 'undefined'
        ? RatesEngine.convert(l.amount || 0, l.currency || 'PKR', currency)
        : (l.amount || 0);
    });
    return total;
  },

  _vaultLoansOwed(currency) {
    if (typeof S === 'undefined') return 0;
    let total = 0;
    (S.loans || []).forEach(function(l) {
      if (l.type !== 'borrowed' || l.settled) return;
      total += typeof RatesEngine !== 'undefined'
        ? RatesEngine.convert(l.amount || 0, l.currency || 'PKR', currency)
        : (l.amount || 0);
    });
    return total;
  },

  _hawlStatus() {
    if (!this._hawlDate) return { complete: false, days: 0, remaining: 354, label: 'Not set' };
    const daysPassed = Math.floor((Date.now() - new Date(this._hawlDate).getTime()) / (1000 * 60 * 60 * 24));
    const lunarYear = 354;
    if (daysPassed >= lunarYear) {
      return { complete: true, days: daysPassed, remaining: 0, label: 'Hawl complete — Zakat is due' };
    }
    return {
      complete: false,
      days: daysPassed,
      remaining: lunarYear - daysPassed,
      label: (lunarYear - daysPassed) + ' days remaining until hawl',
    };
  },

  _saveState() {
    if (typeof VaultMeta === 'undefined') return;
    VaultMeta.set('zakatState', {
      nisabType: this._nisabType,
      madhab: this._madhab,
      includeJewellery: this._includeJewellery,
      hawlDate: this._hawlDate,
      investmentType: this._investmentType,
      mode: this._mode,
    });
  },

  _loadState() {
    try {
      const saved = typeof VaultMeta !== 'undefined' ? VaultMeta.get('zakatState') : {};
      if (saved.nisabType) this._nisabType = saved.nisabType;
      if (saved.madhab) this._madhab = saved.madhab;
      if (saved.includeJewellery !== undefined) this._includeJewellery = saved.includeJewellery;
      if (saved.hawlDate) this._hawlDate = saved.hawlDate;
      if (saved.investmentType) this._investmentType = saved.investmentType;
      if (saved.mode) this._mode = saved.mode;
    } catch(e) {}
  },

  render() {
    const body = document.getElementById('pg-zakat-body');
    if (!body) return;
    this._loadState();
    if (this._mode === 'fbr') {
      this._renderFBR(body);
      return;
    }
    this._renderPersonal(body);
  },

  _renderPersonal(body) {
    const cur = this._userCur();
    const live = typeof RatesEngine !== 'undefined';
    const nisabGold = live ? RatesEngine.nisab('gold', cur) : (cur === 'GBP' ? 5200 : cur === 'AED' ? 23000 : 1400000);
    const nisabSilver = live ? RatesEngine.nisab('silver', cur) : (cur === 'GBP' ? 350 : cur === 'AED' ? 1550 : 95000);
    const lastUpdated = live ? RatesEngine.lastUpdated() : 'Unknown';
    const isStale = live ? RatesEngine.isStale() : true;
    const hawl = this._hawlStatus();
    const fmt = function(n) { return cur + ' ' + Math.round(n).toLocaleString(); };

    const cashTotal = this._vaultCash(cur);
    const banksTotal = this._vaultBanks(cur);
    const investTotal = this._vaultInvestments(cur);
    const goldTotal = this._vaultGold(cur);
    const silverTotal = this._vaultSilver(cur);
    const loansGiven = this._vaultLoansGiven(cur);
    const loansOwed = this._vaultLoansOwed(cur);

    let hasSavedManual = typeof VaultMeta !== 'undefined' ? VaultMeta.get('zakatCalc') : {};

    const mCash = hasSavedManual.cash !== undefined ? hasSavedManual.cash : Math.round(cashTotal + banksTotal);
    const mInvest = hasSavedManual.invest !== undefined ? hasSavedManual.invest : Math.round(investTotal);
    const mGold = hasSavedManual.gold !== undefined ? hasSavedManual.gold : Math.round(goldTotal);
    const mSilver = hasSavedManual.silver !== undefined ? hasSavedManual.silver : Math.round(silverTotal);
    const mLoansGiven = hasSavedManual.loansGiven !== undefined ? hasSavedManual.loansGiven : Math.round(loansGiven);
    const mLoansOwed = hasSavedManual.loansOwed !== undefined ? hasSavedManual.loansOwed : Math.round(loansOwed);
    const mBusiness = hasSavedManual.business || 0;
    const mOther = hasSavedManual.other || 0;
    const mDeductions = hasSavedManual.deductions || 0;

    const bcZakatable = typeof BCModule !== 'undefined' ? BCModule.getZakatableAmount(cur) : 0;
    const bondsZakatable = typeof BondsModule !== 'undefined' ? BondsModule.getZakatableAmount(cur) : 0;
    const mBc = hasSavedManual.bc !== undefined ? hasSavedManual.bc : Math.round(bcZakatable);
    const mBonds = hasSavedManual.bonds !== undefined ? hasSavedManual.bonds : Math.round(bondsZakatable);

    const investments = typeof S !== 'undefined' ? (S.investments || []) : [];

    const zakatDueDate = this._hawlDate ? new Date(new Date(this._hawlDate).getTime() + 354 * 86400000) : null;
    const zakatDaysLeft = zakatDueDate ? Math.ceil((zakatDueDate - Date.now()) / 86400000) : null;
    const zakatReminder = (zakatDaysLeft !== null && zakatDaysLeft <= 30 && zakatDaysLeft >= 0)
      ? '<div style="background:rgba(255,159,10,.12);border:1px solid rgba(255,159,10,.4);border-radius:14px;padding:14px;display:flex;align-items:center;gap:12px"><div style="font-size:24px">🌙</div><div><div style="font-size:14px;font-weight:700;color:var(--text)">Zakat Due in ' + zakatDaysLeft + ' day' + (zakatDaysLeft !== 1 ? 's' : '') + '</div><div style="font-size:12px;color:var(--text3);margin-top:2px">Review your zakatable assets below</div></div></div>'
      : '';

    body.innerHTML =
      '<div style="padding:16px;display:flex;flex-direction:column;gap:14px">' +
      zakatReminder +

      '<div style="background:linear-gradient(135deg,rgba(76,175,80,.15),rgba(0,150,136,.1));border:1px solid rgba(76,175,80,.3);border-radius:16px;padding:16px">' +
        '<div style="font-size:15px;font-weight:800;color:#4caf50;margin-bottom:4px">🌙 Zakat Calculator</div>' +
        '<div style="font-size:12px;color:var(--text3);line-height:1.7">' +
          'Zakat is due on wealth above nisab held for one full lunar year (hawl). Rate: <strong style="color:#4caf50">2.5%</strong>' +
        '</div>' +
        '<div style="font-size:10px;color:' + (isStale ? 'var(--warn)' : 'var(--ok)') + ';margin-top:8px">' +
          (isStale ? '⚠️ ' : '✓ ') + 'Rates: ' + lastUpdated +
        '</div>' +
        '<div style="display:flex;gap:8px;margin-top:10px">' +
          '<button type="button" onclick="Zakat._mode=\'fbr\';Zakat._saveState();Zakat.render()" style="background:var(--glass2);border:1px solid var(--border);color:var(--text2);border-radius:8px;padding:6px 12px;font-size:11px;cursor:pointer;touch-action:manipulation">FBR Tax Mode →</button>' +
        '</div>' +
      '</div>' +

      '<div style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px">' +
        '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text3);margin-bottom:10px">Settings</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">' +
          '<div style="font-size:12px;color:var(--text2);align-self:center">Nisab standard:</div>' +
          '<button type="button" onclick="Zakat._nisabType=\'silver\';Zakat._saveState();Zakat.render()" style="padding:6px 12px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;touch-action:manipulation;background:' + (this._nisabType === 'silver' ? 'var(--accent)' : 'var(--glass2)') + ';color:' + (this._nisabType === 'silver' ? '#fff' : 'var(--text2)') + ';border:1px solid var(--border)">Silver (52.5 tola)</button>' +
          '<button type="button" onclick="Zakat._nisabType=\'gold\';Zakat._saveState();Zakat.render()" style="padding:6px 12px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;touch-action:manipulation;background:' + (this._nisabType === 'gold' ? 'var(--accent)' : 'var(--glass2)') + ';color:' + (this._nisabType === 'gold' ? '#fff' : 'var(--text2)') + ';border:1px solid var(--border)">Gold (7.5 tola)</button>' +
        '</div>' +
        '<div style="font-size:11px;color:var(--text3);margin-bottom:10px">' +
          'Silver nisab: ' + fmt(nisabSilver) + ' · Gold nisab: ' + fmt(nisabGold) +
        '</div>' +
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-top:1px solid var(--border)">' +
          '<div><div style="font-size:13px;color:var(--text)">Include gold jewellery</div>' +
          '<div style="font-size:11px;color:var(--text3)">Hanafi: zakatable · Other madhabs: only if for investment</div></div>' +
          '<label class="tog"><input type="checkbox"' + (this._includeJewellery ? ' checked' : '') + ' onchange="Zakat._includeJewellery=this.checked;Zakat._saveState();Zakat.render()"><span class="ts"></span></label>' +
        '</div>' +
      '</div>' +

      '<div style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px">' +
        '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text3);margin-bottom:10px">Hawl (Lunar Year) Tracker</div>' +
        '<div style="font-size:12px;color:var(--text2);margin-bottom:10px;line-height:1.6">Enter the date when your wealth first crossed the nisab threshold and remained above it continuously.</div>' +
        '<div class="fr"><div class="fg" style="flex:1"><label class="fl">Date wealth crossed nisab</label>' +
        '<input class="inp" type="date" id="zakat-hawl-date" value="' + (this._hawlDate || '') + '" onchange="Zakat._hawlDate=this.value;Zakat._saveState();Zakat.render()"></div></div>' +
        (this._hawlDate ? (
          '<div style="margin-top:10px;padding:10px 12px;border-radius:10px;background:' + (hawl.complete ? 'rgba(76,175,80,.1)' : 'rgba(255,152,0,.1)') + ';border:1px solid ' + (hawl.complete ? 'rgba(76,175,80,.3)' : 'rgba(255,152,0,.3)') + '">' +
            '<div style="font-size:13px;font-weight:700;color:' + (hawl.complete ? 'var(--ok)' : 'var(--warn)') + '">' + (hawl.complete ? '✓' : '⏳') + ' ' + hawl.label + '</div>' +
            (!hawl.complete ? '<div style="margin-top:6px;height:6px;background:rgba(255,255,255,.1);border-radius:999px"><div style="height:100%;width:' + Math.round((hawl.days / 354) * 100) + '%;background:var(--warn);border-radius:999px"></div></div>' : '') +
          '</div>'
        ) : '') +
      '</div>' +

      '<div style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px">' +
        '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text3);margin-bottom:10px">Zakatable Wealth</div>' +
        '<div style="font-size:11px;color:var(--text3);margin-bottom:12px">Auto-filled from your vault. Edit if needed.</div>' +
        this._zakatField('Cash & Savings', 'z-cash', mCash, 'Bank balances + physical cash from your vault', Math.round(cashTotal + banksTotal) === mCash) +
        this._zakatField('Investments', 'z-invest', mInvest, 'Stocks/funds: trading=100%, long-term=25%, crypto=100%, sukuk=100%', Math.round(investTotal) === mInvest) +
        this._zakatField('Gold (zakatable)', 'z-gold', mGold, (this._includeJewellery ? 'All gold including jewellery (Hanafi)' : 'Investment gold only') + ' · from your vault', Math.round(goldTotal) === mGold) +
        this._zakatField('Silver', 'z-silver', mSilver, 'Silver holdings from your vault', Math.round(silverTotal) === mSilver) +
        this._zakatField('Loans given out', 'z-loans-given', mLoansGiven, 'Money owed TO you that is likely to be repaid', Math.round(loansGiven) === mLoansGiven) +
        this._zakatField('Business inventory', 'z-business', mBusiness, 'Goods/stock held for sale (manual entry)', false) +
        this._zakatField('BC / Committee (paid in)', 'z-bc', mBc, 'Money paid into rotating committees (receivable)', Math.round(bcZakatable) === mBc) +
        this._zakatField('Prize Bonds & Savings', 'z-bonds', mBonds, 'Prize bonds and govt securities at face value', Math.round(bondsZakatable) === mBonds) +
        this._zakatField('Other zakatable assets', 'z-other', mOther, 'Any other zakatable wealth not listed above', false) +
        '<div style="border-top:1px solid var(--border);margin:10px 0"></div>' +
        '<div style="font-size:11px;font-weight:700;color:var(--err);margin-bottom:8px">Deductions</div>' +
        this._zakatField('Loans owed by you', 'z-loans-owed', mLoansOwed, 'Money you owe to others (deducted)', Math.round(loansOwed) === mLoansOwed) +
        this._zakatField('Immediate liabilities', 'z-deductions', mDeductions, 'Essential bills/expenses due now (manual)', false) +
      '</div>' +

      (investments.length > 0 ? (
        '<div style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px">' +
          '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text3);margin-bottom:10px">Investment Types (for Zakat %)</div>' +
          investments.map(function(inv) {
            const t = Zakat._investmentType[inv.id] || 'longterm';
            return '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">' +
              '<div><div style="font-size:13px;color:var(--text)">' + (inv.investmentName || inv.broker || 'Investment') + '</div>' +
              '<div style="font-size:11px;color:var(--text3)">' + (inv.type || '') + '</div></div>' +
              '<select onchange="Zakat._investmentType[\'' + inv.id + '\']=this.value;Zakat._saveState();Zakat._recalculate()" ' +
                'style="background:var(--glass2);border:1px solid var(--border);border-radius:8px;padding:5px 8px;color:var(--text);font-size:12px">' +
                '<option value="longterm"' + (t === 'longterm' ? ' selected' : '') + '>Long-term (25%)</option>' +
                '<option value="trading"' + (t === 'trading' ? ' selected' : '') + '>Trading (100%)</option>' +
              '</select></div>';
          }).join('') +
        '</div>'
      ) : '') +

      '<button type="button" class="btn btn-p" style="width:100%" onclick="Zakat._recalculate()">Calculate Zakat</button>' +

      '<div id="zakat-result" style="display:none;background:linear-gradient(135deg,rgba(76,175,80,.15),rgba(0,150,136,.08));border:1px solid rgba(76,175,80,.3);border-radius:16px;padding:20px;text-align:center">' +
        '<div id="zakat-result-inner"></div>' +
      '</div>' +

      '<details style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px">' +
        '<summary style="font-size:13px;font-weight:700;color:var(--text);cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between">📖 Quranic & Hadith References <span style="color:var(--text3)">▾</span></summary>' +
        '<div style="margin-top:12px;font-size:12px;color:var(--text2);line-height:1.8">' +
          '<div style="margin-bottom:10px"><strong style="color:var(--accent)">Surah At-Tawbah 9:103</strong><br>"Take from their wealth a charity by which you cleanse them and purify them."</div>' +
          '<div style="margin-bottom:10px"><strong style="color:var(--accent)">Surah Al-Baqarah 2:177</strong><br>"...and gave wealth, in spite of love for it, to relatives, orphans, the needy..."</div>' +
          '<div><strong style="color:var(--accent)">Hadith (Bukhari)</strong><br>"There is no Zakat on less than five camels... no Zakat on less than five awsaq (silver)..."</div>' +
        '</div>' +
      '</details>' +

      '</div>';

    setTimeout(function() {
      document.querySelectorAll('#zakat-body .num-inp, #zakat-body input[inputmode="decimal"]').forEach(function(el) {
        if (el.id && typeof U !== 'undefined' && U.numInput) U.numInput(el, (typeof S !== 'undefined' && S.user && S.user.currency) || 'PKR');
      });
    }, 80);
    this._recalculate();
  },

  _zakatField(label, id, value, hint, isAuto) {
    const badge = isAuto ? '<span style="font-size:9px;background:rgba(91,141,238,.15);color:var(--accent);border-radius:4px;padding:1px 5px;margin-left:4px">Auto</span>' : '';
    return '<div style="margin-bottom:10px">' +
      '<label style="font-size:12px;color:var(--text2);display:flex;align-items:center;gap:4px;margin-bottom:4px">' + label + badge + '</label>' +
      '<input class="inp num-inp" type="text" inputmode="decimal" id="' + id + '" value="' + Math.round(value) + '" ' +
        'style="width:100%" oninput="Zakat._onFieldChange(\'' + id + '\')" placeholder="0">' +
      '<div style="font-size:10px;color:var(--text3);margin-top:3px">' + hint + '</div>' +
    '</div>';
  },

  _onFieldChange(id) {
    try {
      let saved = typeof VaultMeta !== 'undefined' ? { ...VaultMeta.get('zakatCalc') } : {};
      const fieldMap = {
        'z-cash': 'cash', 'z-invest': 'invest', 'z-gold': 'gold',
        'z-silver': 'silver', 'z-loans-given': 'loansGiven',
        'z-loans-owed': 'loansOwed', 'z-business': 'business',
        'z-bc': 'bc', 'z-bonds': 'bonds',
        'z-other': 'other', 'z-deductions': 'deductions',
      };
      const key = fieldMap[id];
      if (key) {
        const el = document.getElementById(id);
        saved[key] = parseFloat(el ? (el.value + '').replace(/,/g, '') : 0) || 0;
        if (typeof VaultMeta !== 'undefined') VaultMeta.set('zakatCalc', saved);
      }
    } catch(e) {}
    this._recalculate();
  },

  _recalculate() {
    const cur = this._userCur();
    const live = typeof RatesEngine !== 'undefined';
    const nisabValue = this._nisabType === 'gold'
      ? (live ? RatesEngine.nisab('gold', cur) : 1400000)
      : (live ? RatesEngine.nisab('silver', cur) : 95000);

    const g = function(id) {
      const el = document.getElementById(id);
      return parseFloat(el ? (el.value + '').replace(/,/g, '') : 0) || 0;
    };
    const cash = g('z-cash');
    const invest = g('z-invest');
    const gold = g('z-gold');
    const silver = g('z-silver');
    const loansGiven = g('z-loans-given');
    const business = g('z-business');
    const bc = g('z-bc');
    const bonds = g('z-bonds');
    const other = g('z-other');
    const loansOwed = g('z-loans-owed');
    const deductions = g('z-deductions');

    const total = cash + invest + gold + silver + loansGiven + business + bc + bonds + other;
    const netZakatable = total - loansOwed - deductions;
    const aboveNisab = netZakatable >= nisabValue;
    const hawl = this._hawlStatus();
    const zakatDue = aboveNisab ? netZakatable * 0.025 : 0;
    const fmt = function(n) { return cur + ' ' + Math.round(n).toLocaleString(); };

    const resultEl = document.getElementById('zakat-result');
    const innerEl = document.getElementById('zakat-result-inner');
    if (!resultEl || !innerEl) return;
    resultEl.style.display = 'block';

    if (!aboveNisab) {
      innerEl.innerHTML =
        '<div style="font-size:18px;font-weight:800;color:var(--ok);margin-bottom:8px">✓ No Zakat Due</div>' +
        '<div style="font-size:13px;color:var(--text2)">Your zakatable wealth (' + fmt(netZakatable) + ') is below the nisab threshold (' + fmt(nisabValue) + ').</div>';
      return;
    }

    const inGBP = live ? RatesEngine.convert(zakatDue, cur, 'GBP') : 0;
    const inAED = live ? RatesEngine.convert(zakatDue, cur, 'AED') : 0;
    const inPKR = live ? RatesEngine.convert(zakatDue, cur, 'PKR') : 0;

    innerEl.innerHTML =
      '<div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);margin-bottom:8px">Zakat Due</div>' +
      '<div style="font-size:40px;font-weight:900;color:#4caf50;letter-spacing:-1px;margin-bottom:4px" id="zakat-due-amount">' + fmt(zakatDue) + '</div>' +
      (live ? (
        '<div style="font-size:13px;color:var(--text3);margin-bottom:12px">≈ £' + Math.round(inGBP).toLocaleString() + ' · د.إ' + Math.round(inAED).toLocaleString() + ' · ₨' + Math.round(inPKR).toLocaleString() + '</div>'
      ) : '') +
      '<div style="font-size:12px;color:var(--text2);margin-bottom:8px">On zakatable wealth of ' + fmt(netZakatable) + ' @ 2.5%</div>' +
      (!hawl.complete ? (
        '<div style="background:rgba(255,152,0,.15);border:1px solid rgba(255,152,0,.3);border-radius:10px;padding:10px;margin-bottom:10px">' +
          '<div style="font-size:12px;color:var(--warn);font-weight:700">⏳ Hawl not yet complete</div>' +
          '<div style="font-size:11px;color:var(--text3);margin-top:4px">Zakat will be due in ' + hawl.remaining + ' days if wealth remains above nisab. Set your hawl date above.</div>' +
        '</div>'
      ) : '') +
      '<button type="button" onclick="Zakat._printReport()" style="background:rgba(76,175,80,.2);border:1px solid rgba(76,175,80,.4);color:#4caf50;border-radius:10px;padding:10px 20px;font-size:13px;font-weight:700;cursor:pointer;touch-action:manipulation;width:100%">📄 Print / Save Report</button>';
  },

  _renderFBR(body) {
    body.innerHTML = '<div style="padding:16px">' +
      '<button type="button" onclick="Zakat._mode=\'personal\';Zakat._saveState();Zakat.render()" style="margin-bottom:16px;background:var(--glass2);border:1px solid var(--border);color:var(--text2);border-radius:8px;padding:8px 16px;font-size:12px;cursor:pointer;touch-action:manipulation">← Back to Zakat Calculator</button>' +
      '<div style="background:linear-gradient(135deg,rgba(2,132,199,.15),rgba(56,189,248,.08));border:1px solid rgba(2,132,199,.3);border-radius:16px;padding:16px;margin-bottom:16px">' +
        '<div style="font-size:15px;font-weight:800;color:#38bdf8;margin-bottom:4px">🇵🇰 FBR Wealth Tax</div>' +
        '<div style="font-size:12px;color:var(--text3)">Pakistan Federal Board of Revenue — Wealth Statement calculation. This is a tax, not Zakat.</div>' +
      '</div>' +
      '<div style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px">' +
        '<div style="font-size:13px;color:var(--text2);line-height:1.8">FBR Wealth Tax applies to net movable assets above PKR 5 crore (50 million). Rate: 1% of excess above threshold.<br><br>' +
        'Enter your total taxable wealth below for a quick estimate.</div>' +
        '<div class="fg" style="margin-top:12px"><label class="fl">Total Net Wealth (PKR)</label>' +
          '<input class="inp num-inp" type="text" inputmode="decimal" id="fbr-wealth" placeholder="0" oninput="Zakat._calcFBR()"></div>' +
        '<div id="fbr-result" style="margin-top:12px;display:none;padding:14px;background:rgba(2,132,199,.1);border:1px solid rgba(2,132,199,.3);border-radius:12px;text-align:center"></div>' +
      '</div>' +
      '</div>';
  },

  _calcFBR() {
    const el = document.getElementById('fbr-wealth');
    const wealth = parseFloat(el ? (el.value + '').replace(/,/g, '') : 0) || 0;
    const res = document.getElementById('fbr-result');
    if (!res) return;
    const threshold = 50000000;
    res.style.display = 'block';
    if (wealth <= threshold) {
      res.innerHTML = '<div style="font-size:16px;font-weight:700;color:var(--ok)">✓ No wealth tax due</div><div style="font-size:12px;color:var(--text3);margin-top:4px">Wealth is below PKR 5 crore threshold</div>';
    } else {
      const tax = (wealth - threshold) * 0.01;
      res.innerHTML = '<div style="font-size:12px;color:var(--text3);margin-bottom:4px">FBR Wealth Tax Due</div><div style="font-size:28px;font-weight:900;color:#38bdf8">₨' + Math.round(tax).toLocaleString() + '</div><div style="font-size:12px;color:var(--text3)">1% of ₨' + Math.round(wealth - threshold).toLocaleString() + ' above threshold</div>';
    }
  },

  _printReport() {
    const cur = this._userCur();
    const g = function(id) {
      const el = document.getElementById(id);
      return parseFloat(el ? (el.value + '').replace(/,/g, '') : 0) || 0;
    };
    const lines = [
      'VaultCap Zakat Report — ' + new Date().toLocaleDateString(),
      'Currency: ' + cur,
      'Nisab Standard: ' + (this._nisabType === 'gold' ? 'Gold (7.5 tola)' : 'Silver (52.5 tola)'),
      '',
      'Cash & Savings: ' + cur + ' ' + g('z-cash').toLocaleString(),
      'Investments: ' + cur + ' ' + g('z-invest').toLocaleString(),
      'Gold: ' + cur + ' ' + g('z-gold').toLocaleString(),
      'Silver: ' + cur + ' ' + g('z-silver').toLocaleString(),
      'Loans given: ' + cur + ' ' + g('z-loans-given').toLocaleString(),
      'Business: ' + cur + ' ' + g('z-business').toLocaleString(),
      'BC / Committee: ' + cur + ' ' + g('z-bc').toLocaleString(),
      'Prize Bonds & Savings: ' + cur + ' ' + g('z-bonds').toLocaleString(),
      'Other: ' + cur + ' ' + g('z-other').toLocaleString(),
      'Loans owed: -' + cur + ' ' + g('z-loans-owed').toLocaleString(),
      'Immediate liabilities: -' + cur + ' ' + g('z-deductions').toLocaleString(),
      '',
      'Net Zakatable: ' + cur + ' ' + (g('z-cash') + g('z-invest') + g('z-gold') + g('z-silver') + g('z-loans-given') + g('z-business') + g('z-bc') + g('z-bonds') + g('z-other') - g('z-loans-owed') - g('z-deductions')).toLocaleString(),
    ];
    const amountEl = document.getElementById('zakat-due-amount');
    if (amountEl) lines.push('Zakat Due (2.5%): ' + amountEl.textContent);
    const w = window.open('', '_blank');
    if (w) {
      w.document.write('<html><head><title>Zakat Report</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#111;background:#fff}h1{color:#4caf50}pre{font-size:14px;line-height:1.8}</style></head><body><h1>🌙 Zakat Report</h1><pre>' + lines.join('\n') + '</pre></body></html>');
      w.print();
    }
  },
};
window.Zakat = Zakat;
