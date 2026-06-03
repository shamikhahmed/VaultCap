'use strict';
// VaultOS — © 2026 Shamikh Ahmed. Source-available. See LICENSE.
const Gold = {
  get() {
    try { return JSON.parse(localStorage.getItem('vo_gold') || '[]'); }
    catch(e) { return []; }
  },
  save(d) {
    try { localStorage.setItem('vo_gold', JSON.stringify(d)); } catch(e) {}
  },

  _userCur() { return (typeof S !== 'undefined' && S.user && S.user.currency) ? S.user.currency : 'PKR'; },

  _prices(cur) {
    const live = typeof RatesEngine !== 'undefined';
    return {
      goldGram:   live ? RatesEngine.goldInCurrency(cur, 'gram') : 76.5,
      goldTola:   live ? RatesEngine.goldInCurrency(cur, 'tola') : 892,
      goldOz:     live ? RatesEngine.goldInCurrency(cur, 'oz')   : 2380,
      gold10g:    live ? RatesEngine.goldInCurrency(cur, '10g')  : 765,
      silverGram: live ? RatesEngine.silverInCurrency(cur, 'gram') : 0.927,
      silverTola: live ? RatesEngine.silverInCurrency(cur, 'tola') : 10.8,
      silverOz:   live ? RatesEngine.silverInCurrency(cur, 'oz')   : 28.8,
    };
  },

  render() {
    const body = document.getElementById('pg-gold-body');
    if (!body) return;
    const items = this.get();
    const cur = this._userCur();
    const live = typeof RatesEngine !== 'undefined';
    const p = this._prices(cur);
    const lastUpdated = live ? RatesEngine.lastUpdated() : 'Unknown';
    const isStale = live ? RatesEngine.isStale() : true;
    const fmt = function(n) { return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }); };
    const staleColor = isStale ? 'var(--warn)' : 'var(--ok)';
    const staleIcon = isStale ? '⚠️' : '✓';

    const totalValue = items.reduce(function(sum, x) {
      var lp = x.metal === 'silver'
        ? (x.unit === 'oz' ? p.silverOz : x.unit === 'tola' ? p.silverTola : p.silverGram)
        : (x.unit === 'oz' ? p.goldOz : x.unit === 'tola' ? p.goldTola : p.goldGram);
      var price = (x.useManualPrice && x.pricePerUnit) ? x.pricePerUnit : lp;
      return sum + (x.weight || 0) * price;
    }, 0);

    var goldGrid = '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">';
    [['Per Gram', fmt(p.goldGram)], ['Per Tola', fmt(p.goldTola)], ['Per 10g', fmt(p.gold10g)], ['Per Oz', fmt(p.goldOz)]].forEach(function(row) {
      goldGrid += '<div style="background:rgba(201,168,76,.08);border-radius:10px;padding:10px 12px"><div style="font-size:10px;color:rgba(201,168,76,.6);text-transform:uppercase;letter-spacing:.04em">' + row[0] + '</div><div style="font-size:16px;font-weight:800;color:#c9a84c;margin-top:2px">' + row[1] + '</div></div>';
    });
    goldGrid += '</div>';

    var silverGrid = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">';
    [['Per Gram', fmt(p.silverGram)], ['Per Tola', fmt(p.silverTola)], ['Per Oz', fmt(p.silverOz)]].forEach(function(row) {
      silverGrid += '<div style="background:rgba(180,180,200,.08);border-radius:10px;padding:10px 12px"><div style="font-size:10px;color:rgba(180,180,200,.5);text-transform:uppercase;letter-spacing:.04em">' + row[0] + '</div><div style="font-size:16px;font-weight:800;color:#c0c0d0;margin-top:2px">' + row[1] + '</div></div>';
    });
    silverGrid += '</div>';

    var portfolioCard = '';
    if (items.length > 0) {
      portfolioCard = '<div style="background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:14px 16px;display:flex;align-items:center;justify-content:space-between"><div><div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em">Portfolio Value</div><div style="font-size:22px;font-weight:900;color:var(--text);letter-spacing:-.5px">' + cur + ' ' + fmt(totalValue) + '</div></div><div style="font-size:28px">🏦</div></div>';
    }

    var holdingsList = '';
    if (items.length === 0) {
      holdingsList = '<div class="empty-ios"><div class="ei-ic">🥇</div><div class="ei-title">No precious metals yet</div><div class="ei-sub">Track your gold and silver holdings with live price valuation</div></div>';
    } else {
      holdingsList = '<div style="display:flex;flex-direction:column;gap:10px">';
      items.forEach(function(x, i) {
        var isSilver = x.metal === 'silver';
        var lp = isSilver
          ? (x.unit === 'oz' ? p.silverOz : x.unit === 'tola' ? p.silverTola : p.silverGram)
          : (x.unit === 'oz' ? p.goldOz : x.unit === 'tola' ? p.goldTola : p.goldGram);
        var price = (x.useManualPrice && x.pricePerUnit) ? x.pricePerUnit : lp;
        var value = (x.weight || 0) * price;
        var priceBadge = x.useManualPrice ? '<span class="badge b-warn">Manual price</span>' : '<span class="badge b-ok">Live price</span>';
        holdingsList += '<div class="entry"><div class="entry-main">' +
          '<div class="entry-ic" style="background:' + (isSilver ? 'rgba(180,180,200,.15)' : 'rgba(201,168,76,.15)') + '">' + (isSilver ? '🥈' : '🥇') + '</div>' +
          '<div class="entry-body">' +
            '<div class="entry-name">' + (x.label || (isSilver ? 'Silver' : 'Gold')) + '</div>' +
            '<div class="entry-sub">' + x.weight + ' ' + (x.unit || 'g') + ' · ' + (isSilver ? 'Silver' : 'Gold') + '</div>' +
            '<div class="entry-meta"><span class="badge b-acc">' + cur + ' ' + fmt(value) + '</span><span class="badge b-muted">' + cur + ' ' + fmt(price) + '/' + (x.unit || 'g') + '</span>' + priceBadge + '</div>' +
          '</div>' +
          '<div class="entry-acts"><button class="icb" onclick="Gold.edit(' + i + ')">✏️</button><button class="icb del" onclick="Gold.del(' + i + ')">🗑️</button></div>' +
        '</div></div>';
      });
      holdingsList += '</div>';
    }

    body.innerHTML =
      '<div style="padding:16px;display:flex;flex-direction:column;gap:14px">' +
        '<div style="background:linear-gradient(135deg,rgba(201,168,76,.15),rgba(201,168,76,.05));border:1px solid rgba(201,168,76,.3);border-radius:16px;padding:16px">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">' +
            '<div style="font-size:14px;font-weight:800;color:#c9a84c">🥇 Live Metal Prices</div>' +
            '<button onclick="Gold._refreshRates()" style="background:rgba(201,168,76,.15);border:1px solid rgba(201,168,76,.3);color:#c9a84c;border-radius:8px;padding:5px 12px;font-size:11px;font-weight:700;cursor:pointer;touch-action:manipulation">↻ Refresh</button>' +
          '</div>' +
          '<div style="font-size:10px;color:' + staleColor + ';margin-bottom:12px">' + staleIcon + ' Last updated: ' + lastUpdated + ' · Prices in ' + cur + '</div>' +
          '<div style="margin-bottom:10px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:rgba(201,168,76,.8);margin-bottom:6px">Gold (24K)</div>' + goldGrid + '</div>' +
          '<div><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:rgba(180,180,200,.8);margin-bottom:6px">Silver</div>' + silverGrid + '</div>' +
        '</div>' +
        portfolioCard +
        '<button class="btn btn-p" style="width:100%" onclick="Gold.openAdd()">+ Add Gold / Silver</button>' +
        holdingsList +
      '</div>';
  },

  openAdd(editIdx) {
    var items = this.get();
    var x = (editIdx != null) ? items[editIdx] : {};
    var cur = this._userCur();
    var live = typeof RatesEngine !== 'undefined';
    var goldGram = live ? RatesEngine.goldInCurrency(cur, 'gram') : 0;
    var silverGram = live ? RatesEngine.silverInCurrency(cur, 'gram') : 0;
    var title = (editIdx != null) ? '✏️ Edit Metal' : '➕ Add Precious Metal';

    Modal.open(title,
      '<div class="fg"><label class="fl">Metal</label>' +
        '<select class="inp" id="gm-metal" onchange="Gold._updatePriceHint()">' +
          '<option value="gold"' + (x.metal !== 'silver' ? ' selected' : '') + '>🥇 Gold</option>' +
          '<option value="silver"' + (x.metal === 'silver' ? ' selected' : '') + '>🥈 Silver</option>' +
        '</select></div>' +
      '<div class="fg"><label class="fl">Label (optional)</label>' +
        '<input class="inp" id="gm-label" value="' + (x.label || '') + '" placeholder="e.g. Wedding jewellery, Coin collection"></div>' +
      '<div class="fr">' +
        '<div class="fg"><label class="fl">Weight</label>' +
          '<input class="inp num-inp" id="gm-weight" type="text" inputmode="decimal" value="' + (x.weight || '') + '" placeholder="0"></div>' +
        '<div class="fg"><label class="fl">Unit</label>' +
          '<select class="inp" id="gm-unit" onchange="Gold._updatePriceHint()">' +
            '<option value="g"' + ((x.unit || 'g') === 'g' ? ' selected' : '') + '>Grams (g)</option>' +
            '<option value="tola"' + (x.unit === 'tola' ? ' selected' : '') + '>Tola</option>' +
            '<option value="oz"' + (x.unit === 'oz' ? ' selected' : '') + '>Troy Oz</option>' +
            '<option value="kg"' + (x.unit === 'kg' ? ' selected' : '') + '>Kilograms (kg)</option>' +
          '</select></div>' +
      '</div>' +
      '<div style="background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.2);border-radius:12px;padding:12px;margin-bottom:14px" id="gm-price-hint">' +
        '<div style="font-size:11px;color:rgba(201,168,76,.8);font-weight:700;margin-bottom:4px">Live Price Reference</div>' +
        '<div style="font-size:13px;color:var(--text)" id="gm-hint-text">Gold: ' + cur + ' ' + goldGram.toLocaleString() + '/g</div>' +
      '</div>' +
      '<div class="fg"><label class="fl" style="display:flex;align-items:center;gap:8px">Price per unit ' +
        '<label style="display:flex;align-items:center;gap:6px;font-weight:400;font-size:12px;color:var(--text3)">' +
          '<input type="checkbox" id="gm-manual"' + (x.useManualPrice ? ' checked' : '') + ' onchange="Gold._toggleManual(this.checked)"> Enter manually' +
        '</label></label>' +
        '<input class="inp num-inp" id="gm-price" type="text" inputmode="decimal" ' +
          'value="' + (x.useManualPrice ? (x.pricePerUnit || '') : '') + '" ' +
          'placeholder="Leave blank to use live price"' +
          (x.useManualPrice ? '' : ' style="opacity:.5" readonly') + '></div>' +
      '<div class="fg"><label class="fl">Notes</label><textarea class="inp" id="gm-notes" rows="2">' + (x.notes || '') + '</textarea></div>' +
      '<div style="font-size:11px;color:var(--text3);text-align:center">Live: Gold ~' + cur + ' ' + goldGram.toLocaleString(undefined, { maximumFractionDigits: 2 }) + '/g · Silver ~' + cur + ' ' + silverGram.toLocaleString(undefined, { maximumFractionDigits: 2 }) + '/g</div>',
      '<button class="btn btn-g" onclick="Modal.close()">Cancel</button>' +
      '<button class="btn btn-p" onclick="Gold.save_item(' + (editIdx != null ? editIdx : 'null') + ')">Save</button>'
    );
    setTimeout(function() {
      var priceEl = document.getElementById('gm-price');
      if (priceEl) U.numInput(priceEl, Gold._userCur());
    }, 50);
  },

  _updatePriceHint() {
    var metal = ((document.getElementById('gm-metal') || {}).value) || 'gold';
    var unit = ((document.getElementById('gm-unit') || {}).value) || 'g';
    var cur = this._userCur();
    var price = 0;
    if (typeof RatesEngine !== 'undefined') {
      if (metal === 'silver') {
        price = unit === 'oz' ? RatesEngine.silverInCurrency(cur, 'oz') : unit === 'tola' ? RatesEngine.silverInCurrency(cur, 'tola') : RatesEngine.silverInCurrency(cur, 'gram');
      } else {
        price = unit === 'oz' ? RatesEngine.goldInCurrency(cur, 'oz') : unit === 'tola' ? RatesEngine.goldInCurrency(cur, 'tola') : unit === 'kg' ? RatesEngine.goldInCurrency(cur, 'gram') * 1000 : RatesEngine.goldInCurrency(cur, 'gram');
      }
    }
    var hint = document.getElementById('gm-hint-text');
    if (hint) hint.textContent = (metal === 'silver' ? 'Silver' : 'Gold') + ': ' + cur + ' ' + price.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' per ' + unit;
  },

  _toggleManual(checked) {
    var inp = document.getElementById('gm-price');
    if (!inp) return;
    inp.readOnly = !checked;
    inp.style.opacity = checked ? '1' : '.5';
    if (!checked) inp.value = '';
  },

  save_item(editIdx) {
    var metal = ((document.getElementById('gm-metal') || {}).value) || 'gold';
    var label = (((document.getElementById('gm-label') || {}).value) || '').trim();
    var weight = parseFloat(((document.getElementById('gm-weight') || {}).value) || 0);
    var unit = ((document.getElementById('gm-unit') || {}).value) || 'g';
    var useManualPrice = ((document.getElementById('gm-manual') || {}).checked) || false;
    var pricePerUnit = useManualPrice ? (parseFloat((((document.getElementById('gm-price') || {}).value) || '').replace(/,/g,'')) || 0) : 0;
    var notes = (((document.getElementById('gm-notes') || {}).value) || '').trim();
    if (!weight) { Toast.show('Weight is required', 'error'); return; }
    var items = this.get();
    var item = { metal: metal, label: label, weight: weight, unit: unit, useManualPrice: useManualPrice, pricePerUnit: pricePerUnit, notes: notes, updatedAt: new Date().toISOString() };
    if (editIdx != null) { items[editIdx] = item; } else { items.push(item); }
    this.save(items);
    Modal.close();
    this.render();
    Toast.show(editIdx != null ? 'Updated' : 'Added', 'success');
  },

  edit(i) { this.openAdd(i); },

  del(i) {
    if (!window.__vos_confirm('Delete this entry?')) return;
    var items = this.get();
    items.splice(i, 1);
    this.save(items);
    this.render();
    Toast.show('Deleted', 'info');
  },

  async _refreshRates() {
    if (typeof RatesEngine === 'undefined') { Toast.show('Rates engine not available', 'warn'); return; }
    Toast.show('Fetching live prices...', 'info', 2000);
    var ok = await RatesEngine.fetch();
    if (ok) { Toast.show('Prices updated ✓', 'success'); this.render(); }
    else { Toast.show('Could not fetch prices — using cached data', 'warn'); }
  },
};
window.Gold = Gold;
