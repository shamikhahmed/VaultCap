'use strict';
// VaultOS Prize Bonds & Government Securities — © 2026 Shamikh Ahmed
const BondsModule = {

  BOND_TYPES: {
    PK: [
      { id: 'pb_200',   name: 'Prize Bond PKR 200',    value: 200,    drawMonths: [1,4,7,10], currency: 'PKR', country: 'PK' },
      { id: 'pb_750',   name: 'Prize Bond PKR 750',    value: 750,    drawMonths: [1,4,7,10], currency: 'PKR', country: 'PK' },
      { id: 'pb_1500',  name: 'Prize Bond PKR 1,500',  value: 1500,   drawMonths: [2,5,8,11], currency: 'PKR', country: 'PK' },
      { id: 'pb_7500',  name: 'Prize Bond PKR 7,500',  value: 7500,   drawMonths: [2,5,8,11], currency: 'PKR', country: 'PK' },
      { id: 'pb_15000', name: 'Prize Bond PKR 15,000', value: 15000,  drawMonths: [3,6,9,12], currency: 'PKR', country: 'PK' },
      { id: 'pb_25000', name: 'Prize Bond PKR 25,000', value: 25000,  drawMonths: [3,6,9,12], currency: 'PKR', country: 'PK' },
      { id: 'pb_40000', name: 'Prize Bond PKR 40,000', value: 40000,  drawMonths: [3,6,9,12], currency: 'PKR', country: 'PK' },
      { id: 'nsc_3yr',  name: 'NSC 3-Year',            value: 0,      drawMonths: [], currency: 'PKR', country: 'PK', isFixed: true },
      { id: 'ssc',      name: 'Special Savings Certificate', value: 0, drawMonths: [], currency: 'PKR', country: 'PK', isFixed: true },
      { id: 'dsc',      name: 'Defence Savings Certificate', value: 0, drawMonths: [], currency: 'PKR', country: 'PK', isFixed: true },
      { id: 'behbood',  name: 'Behbood Savings Certificate', value: 0, drawMonths: [], currency: 'PKR', country: 'PK', isFixed: true },
      { id: 'pk_tbill', name: 'T-Bill (Pakistan)',     value: 0,      drawMonths: [], currency: 'PKR', country: 'PK', isFixed: true },
    ],
    GB: [
      { id: 'premium',  name: 'Premium Bonds (NS&I)',  value: 1,      drawMonths: [1,2,3,4,5,6,7,8,9,10,11,12], currency: 'GBP', country: 'GB' },
      { id: 'nsi_fixed',name: 'NS&I Fixed Rate Bond',  value: 0,      drawMonths: [], currency: 'GBP', country: 'GB', isFixed: true },
      { id: 'gilts',    name: 'UK Gilts (Govt Bond)',  value: 0,      drawMonths: [], currency: 'GBP', country: 'GB', isFixed: true },
      { id: 'isa_cash', name: 'Cash ISA',              value: 0,      drawMonths: [], currency: 'GBP', country: 'GB', isFixed: true },
    ],
    AE: [
      { id: 'uae_bond', name: 'UAE Savings Bond',      value: 0,      drawMonths: [], currency: 'AED', country: 'AE', isFixed: true },
      { id: 'ae_sukuk', name: 'UAE Government Sukuk',  value: 0,      drawMonths: [], currency: 'AED', country: 'AE', isFixed: true },
    ],
    OTHER: [
      { id: 'generic',  name: 'Other Govt Security',   value: 0,      drawMonths: [], currency: 'USD', country: 'OTHER', isFixed: true },
    ],
  },

  render() {
    const el = document.getElementById('pg-bonds-body');
    if (!el) return;
    const bonds = S.bonds || [];
    const cur = S.user.currency || 'PKR';
    const fmt = n => cur + ' ' + Math.round(n).toLocaleString();

    const totalValue = bonds.reduce(function(sum, b) {
      const fv = (b.quantity || 1) * (b.faceValue || b.amount || 0);
      return sum + (typeof RatesEngine !== 'undefined'
        ? RatesEngine.convert(fv, b.currency || 'PKR', cur) : fv);
    }, 0);

    const now = new Date();
    const upcoming = bonds.filter(function(b) {
      const type = BondsModule._getType(b.typeId);
      return type && type.drawMonths && type.drawMonths.length > 0 && !type.isFixed;
    });

    el.innerHTML =
      '<div style="padding:16px;display:flex;flex-direction:column;gap:14px">' +

      (bonds.length > 0 ? (
        '<div style="background:linear-gradient(135deg,rgba(201,168,76,.15),rgba(201,168,76,.05));border:1px solid rgba(201,168,76,.3);border-radius:16px;padding:16px">' +
          '<div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Total Holdings</div>' +
          '<div style="font-size:32px;font-weight:900;color:#c9a84c">' + fmt(totalValue) + '</div>' +
          '<div style="font-size:11px;color:var(--text3);margin-top:4px">' + bonds.length + ' holding' + (bonds.length > 1 ? 's' : '') + ' · Zakatable at face value</div>' +
        '</div>'
      ) : '') +

      (upcoming.length > 0 ? (
        '<div style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px">' +
          '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text3);margin-bottom:10px">🎯 Upcoming Draws</div>' +
          upcoming.map(function(b) {
            const type = BondsModule._getType(b.typeId);
            const nextDraw = BondsModule._nextDraw(type);
            return '<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border)">' +
              '<div><div style="font-size:13px;color:var(--text)">' + b.name + '</div>' +
              '<div style="font-size:11px;color:var(--text3)">' + (b.quantity || 1) + ' bond' + ((b.quantity || 1) > 1 ? 's' : '') + '</div></div>' +
              '<div style="text-align:right"><div style="font-size:12px;font-weight:700;color:var(--warn)">' + (nextDraw || 'Quarterly') + '</div>' +
              '<button onclick="BondsModule._checkResults(\'' + b.typeId + '\')" style="font-size:10px;color:var(--accent);background:none;border:none;cursor:pointer;touch-action:manipulation">Check Results →</button></div>' +
            '</div>';
          }).join('') +
        '</div>'
      ) : '') +

      '<button class="btn btn-p" style="width:100%" onclick="BondsModule.openAdd()">+ Add Bond / Security</button>' +
      '<button class="btn btn-g" style="width:100%" onclick="BondsModule.openBulkImport()">📋 Bulk Import Bond Numbers</button>' +

      (bonds.length === 0 ?
        '<div class="empty-ios"><div class="ei-ic">🎫</div><div class="ei-title">No bonds yet</div><div class="ei-sub">Track prize bonds, premium bonds, NSS certificates, government securities across PK, UK and UAE</div></div>'
        :
        bonds.map(function(b, i) { return BondsModule._bondCard(b, i); }).join('')
      ) +

      '<div style="background:rgba(76,175,80,.06);border:1px solid rgba(76,175,80,.15);border-radius:12px;padding:12px">' +
        '<div style="font-size:11px;font-weight:700;color:var(--ok);margin-bottom:4px">🌙 Zakat on Bonds</div>' +
        '<div style="font-size:11px;color:var(--text3);line-height:1.6">Prize bonds and government securities are zakatable at face value. Winnings received are zakatable as cash. This is auto-added to your Zakat calculator.</div>' +
      '</div>' +

      '</div>';
  },

  _bondCard(b, i) {
    const type = this._getType(b.typeId);
    const fv = (b.quantity || 1) * (b.faceValue || b.amount || 0);
    const cur = b.currency || 'PKR';
    const isDrawBond = type && !type.isFixed;
    const nextDraw = isDrawBond ? this._nextDraw(type) : null;

    return '<div class="entry">' +
      '<div class="entry-main">' +
        '<div class="entry-ic" style="background:rgba(201,168,76,.15)">🎫</div>' +
        '<div class="entry-body">' +
          '<div class="entry-name">' + (b.name || 'Bond') + '</div>' +
          '<div class="entry-sub">' + (b.quantity || 1) + ' × ' + cur + ' ' + (b.faceValue || b.amount || 0).toLocaleString() + ' · ' + (b.country || '') + '</div>' +
          '<div class="entry-meta">' +
            '<span class="badge b-acc">' + cur + ' ' + fv.toLocaleString() + '</span>' +
            (nextDraw ? '<span class="badge b-warn">Draw: ' + nextDraw + '</span>' : '') +
            (b.bondNumbers && b.bondNumbers.length > 0 ? '<span class="badge b-muted">' + b.bondNumbers.length + ' numbers</span>' : '') +
          '</div>' +
        '</div>' +
        '<div class="entry-acts">' +
          (isDrawBond ? '<button class="icb" onclick="BondsModule._checkResults(\'' + b.typeId + '\')" title="Check Results">🎯</button>' : '') +
          '<button class="icb" onclick="BondsModule.edit(' + i + ')">✏️</button>' +
          '<button class="icb del" onclick="BondsModule.del(' + i + ')">🗑️</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  },

  _getType(typeId) {
    for (const country in this.BOND_TYPES) {
      const found = this.BOND_TYPES[country].find(function(t) { return t.id === typeId; });
      if (found) return found;
    }
    return null;
  },

  _nextDraw(type) {
    if (!type || !type.drawMonths || !type.drawMonths.length) return null;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const next = type.drawMonths.find(function(m) { return m >= month; });
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    if (next) return months[next-1] + ' ' + year;
    return months[type.drawMonths[0]-1] + ' ' + (year + 1);
  },

  _checkResults(typeId) {
    const type = this._getType(typeId);
    if (!type) return;
    let url = 'https://www.savings.gov.pk/prize-bonds/';
    if (typeId === 'premium') url = 'https://www.nsandi.com/products/premium-bonds';
    window.open(url, '_blank');
  },

  openAdd(editIdx) {
    const b = editIdx != null ? (S.bonds || [])[editIdx] : {};
    const userCountry = S.user.country || 'PK';
    const allTypes = Object.values(this.BOND_TYPES).flat();

    Modal.open(editIdx != null ? '✏️ Edit Bond' : '🎫 Add Bond / Security',
      '<div class="fg"><label class="fl">Name / Label</label>' +
        '<input class="inp" id="bnd-name" value="' + (b.name || '') + '" placeholder="e.g. My Prize Bonds 2026"></div>' +

      '<div class="fg"><label class="fl">Type</label>' +
        '<select class="inp" id="bnd-type" onchange="BondsModule._onTypeChange()">' +
          allTypes.map(function(t) {
            return '<option value="' + t.id + '" data-currency="' + t.currency + '" data-value="' + t.value + '"' + (b.typeId === t.id ? ' selected' : '') + '>' + t.name + '</option>';
          }).join('') +
        '</select></div>' +

      '<div class="fr">' +
        '<div class="fg"><label class="fl">Quantity</label>' +
          '<input class="inp num-inp" type="number" id="bnd-qty" min="1" value="' + (b.quantity || 1) + '" oninput="BondsModule._updateTotal()"></div>' +
        '<div class="fg"><label class="fl">Face Value Each</label>' +
          '<input class="inp num-inp" type="text" inputmode="decimal" pattern="[0-9,\\.]*" id="bnd-fv" value="' + (b.faceValue || b.amount || '') + '" placeholder="0" oninput="BondsModule._updateTotal()"></div>' +
      '</div>' +

      '<div class="fr">' +
        '<div class="fg"><label class="fl">Currency</label>' +
          '<select class="inp" id="bnd-currency" onchange="BondsModule._updateTotal()">' +
            ['PKR','GBP','AED','USD'].map(function(c) {
              return '<option value="' + c + '"' + ((b.currency || 'PKR') === c ? ' selected' : '') + '>' + c + '</option>';
            }).join('') +
          '</select></div>' +
        '<div class="fg"><label class="fl">Country</label>' +
          '<select class="inp" id="bnd-country">' +
            ['PK','GB','AE','US','OTHER'].map(function(c) {
              return '<option value="' + c + '"' + ((b.country || userCountry) === c ? ' selected' : '') + '>' + c + '</option>';
            }).join('') +
          '</select></div>' +
      '</div>' +

      '<div id="bnd-total" style="background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.2);border-radius:10px;padding:10px;text-align:center;font-size:13px;color:#c9a84c;font-weight:700;margin-bottom:10px">Total: enter details above</div>' +

      '<div class="fg"><label class="fl">Purchase Date</label>' +
        '<input class="inp" type="date" id="bnd-date" value="' + (b.purchaseDate || '') + '"></div>' +

      '<div class="fg"><label class="fl">Bond Numbers (optional, one per line)</label>' +
        '<textarea class="inp" id="bnd-numbers" rows="3" placeholder="Optional: paste bond numbers here, one per line">' + ((b.bondNumbers || []).join('\n')) + '</textarea></div>' +

      '<div class="fg"><label class="fl">Maturity Date (for fixed securities)</label>' +
        '<input class="inp" type="date" id="bnd-maturity" value="' + (b.maturityDate || '') + '"></div>' +

      '<div class="fg"><label class="fl">Annual Return / Profit Rate (%)</label>' +
        '<input class="inp num-inp" type="number" id="bnd-rate" min="0" step="0.01" value="' + (b.annualRate || '') + '" placeholder="e.g. 15.5"></div>' +

      '<div class="fg"><label class="fl">Notes</label>' +
        '<textarea class="inp" id="bnd-notes" rows="2">' + (b.notes || '') + '</textarea></div>',

      '<button class="btn btn-g" onclick="Modal.close()">Cancel</button>' +
      '<button class="btn btn-p" onclick="BondsModule.save(' + (editIdx != null ? editIdx : 'null') + ')">Save</button>'
    );
    setTimeout(function() {
      BondsModule._updateTotal();
      var fv = document.getElementById('bnd-fv');
      if (fv) U.numInput(fv, document.getElementById('bnd-currency')?.value || (S.user && S.user.currency) || 'PKR');
    }, 50);
  },

  _onTypeChange() {
    const sel = document.getElementById('bnd-type');
    if (!sel) return;
    const opt = sel.options[sel.selectedIndex];
    const fvEl = document.getElementById('bnd-fv');
    const curEl = document.getElementById('bnd-currency');
    if (fvEl && opt.dataset.value && parseInt(opt.dataset.value) > 0) fvEl.value = opt.dataset.value;
    if (curEl && opt.dataset.currency) curEl.value = opt.dataset.currency;
    BondsModule._updateTotal();
  },

  _updateTotal() {
    const qty = parseInt((document.getElementById('bnd-qty') || {}).value) || 0;
    const fv = parseFloat(((document.getElementById('bnd-fv') || {}).value || '').replace(/,/g,'')) || 0;
    const cur = (document.getElementById('bnd-currency') || {}).value || 'PKR';
    const el = document.getElementById('bnd-total');
    if (el && qty && fv) {
      el.textContent = 'Total face value: ' + cur + ' ' + (qty * fv).toLocaleString();
    }
  },

  save(editIdx) {
    const name = ((document.getElementById('bnd-name') || {}).value || '').trim();
    const qty = parseInt((document.getElementById('bnd-qty') || {}).value) || 1;
    const fv = parseFloat(((document.getElementById('bnd-fv') || {}).value || '').replace(/,/g,'')) || 0;
    if (!name) { Toast.show('Name is required', 'error'); return; }
    if (!fv) { Toast.show('Face value is required', 'error'); return; }

    const numbersRaw = ((document.getElementById('bnd-numbers') || {}).value || '').trim();
    const bondNumbers = numbersRaw ? numbersRaw.split('\n').map(function(n) { return n.trim(); }).filter(Boolean) : [];

    const existing = editIdx != null ? (S.bonds || [])[editIdx] : null;
    const item = {
      id: existing ? existing.id : Math.random().toString(36).slice(2),
      name,
      typeId: (document.getElementById('bnd-type') || {}).value || 'generic',
      quantity: qty,
      faceValue: fv,
      amount: fv,
      currency: (document.getElementById('bnd-currency') || {}).value || 'PKR',
      country: (document.getElementById('bnd-country') || {}).value || 'PK',
      purchaseDate: (document.getElementById('bnd-date') || {}).value || '',
      maturityDate: (document.getElementById('bnd-maturity') || {}).value || '',
      annualRate: parseFloat((document.getElementById('bnd-rate') || {}).value) || 0,
      bondNumbers,
      notes: ((document.getElementById('bnd-notes') || {}).value || '').trim(),
      createdAt: existing ? (existing.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!S.bonds) S.bonds = [];
    if (editIdx != null) { S.bonds[editIdx] = item; } else { S.bonds.push(item); }
    Store.save();
    Modal.close();
    this.render();
    Toast.show(editIdx != null ? 'Updated' : 'Added', 'success');
  },

  edit(i) { this.openAdd(i); },

  del(i) {
    if (!window.__vos_confirm('Delete this bond?')) return;
    S.bonds.splice(i, 1);
    Store.save();
    this.render();
    Toast.show('Deleted', 'info');
  },

  openBulkImport() {
    Modal.open('📋 Bulk Import Bond Numbers',
      '<div style="font-size:12px;color:var(--text3);margin-bottom:12px;line-height:1.6">Paste your prize bond numbers below — one per line. Select the bond type and they\'ll be imported as a single holding.</div>' +
      '<div class="fg"><label class="fl">Bond Type</label>' +
        '<select class="inp" id="bulk-type">' +
          this.BOND_TYPES.PK.filter(function(t) { return !t.isFixed; }).map(function(t) {
            return '<option value="' + t.id + '" data-value="' + t.value + '">' + t.name + '</option>';
          }).join('') +
        '</select></div>' +
      '<div class="fg"><label class="fl">Bond Numbers (one per line)</label>' +
        '<textarea class="inp" id="bulk-numbers" rows="8" placeholder="123456&#10;789012&#10;345678&#10;..."></textarea></div>',
      '<button class="btn btn-g" onclick="Modal.close()">Cancel</button>' +
      '<button class="btn btn-p" onclick="BondsModule.processBulkImport()">Import</button>'
    );
  },

  processBulkImport() {
    const typeEl = document.getElementById('bulk-type');
    const numbersEl = document.getElementById('bulk-numbers');
    if (!typeEl || !numbersEl) return;
    const typeId = typeEl.value;
    const opt = typeEl.options[typeEl.selectedIndex];
    const fv = parseInt(opt.dataset.value) || 0;
    const numbers = numbersEl.value.split('\n').map(function(n) { return n.trim(); }).filter(Boolean);
    if (!numbers.length) { Toast.show('No bond numbers entered', 'error'); return; }
    const type = this._getType(typeId);
    const item = {
      id: Math.random().toString(36).slice(2),
      name: (type ? type.name : 'Prize Bond') + ' (' + numbers.length + ' bonds)',
      typeId,
      quantity: numbers.length,
      faceValue: fv,
      amount: fv,
      currency: type ? type.currency : 'PKR',
      country: type ? type.country : 'PK',
      bondNumbers: numbers,
      purchaseDate: '',
      maturityDate: '',
      annualRate: 0,
      notes: 'Bulk imported ' + numbers.length + ' bonds',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!S.bonds) S.bonds = [];
    S.bonds.push(item);
    Store.save();
    Modal.close();
    this.render();
    Toast.show('Imported ' + numbers.length + ' bond numbers', 'success');
  },

  getZakatableAmount(currency) {
    const bonds = S.bonds || [];
    let total = 0;
    bonds.forEach(function(b) {
      const fv = (b.quantity || 1) * (b.faceValue || b.amount || 0);
      total += typeof RatesEngine !== 'undefined'
        ? RatesEngine.convert(fv, b.currency || 'PKR', currency)
        : fv;
    });
    return total;
  },
};
window.BondsModule = BondsModule;
