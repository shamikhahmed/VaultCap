const _FX = typeof FX !== 'undefined' ? FX : {PKR:1,GBP:350,AED:75,USD:280,EUR:320};

const Cash = {
  render() {
    const el = document.getElementById('cashItems'); if (!el) return;
    const sm = document.getElementById('cashSummary');
    const data = (S.cash || []).slice().sort((a, b) => (b.amount || 0) - (a.amount || 0));
    if (sm) {
      if (data.length) {
        const byCur = {};
        data.forEach(c => { byCur[c.currency] = (byCur[c.currency] || 0) + (c.amount || 0); });
        const userCur = S.user.currency || 'PKR';
        const totalPKR = data.reduce((a, c) => a + (c.amount || 0) * (_FX[c.currency] || 1), 0);
        const totalUser = totalPKR / (_FX[userCur] || 1);
        const byLocStr = Object.entries(byCur).map(([cur, v]) => `<div class="sens" style="font-size:15px;font-weight:700">${U.fmt(v)} ${cur}</div>`).join('');
        const convLine = Object.keys(byCur).length > 1 || Object.keys(byCur)[0] !== userCur
          ? `<div style="font-size:11px;color:var(--text3);margin-top:2px">≈ ${U.fmt(Math.round(totalUser))} ${userCur} total</div>` : '';
        sm.innerHTML = `<div class="widget" style="margin-bottom:12px;text-align:center"><div style="font-size:10px;color:var(--text3);margin-bottom:6px;letter-spacing:.5px;text-transform:uppercase;font-weight:700">Total Cash on Hand</div>${byLocStr}${convLine}</div>`;
      } else { sm.innerHTML = ''; }
    }
    if (!data.length) {
      el.innerHTML = `<div class="empty"><div class="empty-ic">💵</div><h3>No cash entries</h3><p>Track physical cash across your wallet, home, office and more</p><button class="btn btn-p" style="margin-top:12px" onclick="Cash.openAdd()">💵 Add Cash</button></div>`;
      return;
    }
    const locIc = { Wallet:'👛', Home:'🏠', Office:'🏢', Car:'🚗', Other:'📦' };
    const locColor = { Wallet:'b-acc', Home:'b-ok', Office:'b-info', Car:'b-warn', Other:'b-muted' };
    el.innerHTML = data.map(c => `<div class="entry"><div class="entry-main"><div class="entry-ic">${locIc[c.location] || '💵'}</div><div class="entry-body"><div class="entry-name">${c.location || 'Cash'}</div><div class="entry-sub sens">${(c.amount || 0).toLocaleString()} ${c.currency || ''}${c.notes ? ' · ' + c.notes : ''}</div><div class="entry-meta"><span class="badge ${locColor[c.location]||'b-muted'} sens">${(c.amount || 0).toLocaleString()} ${c.currency || ''}</span>${(c.tags||[]).slice(0,2).map(t=>`<span class="badge b-muted">${t}</span>`).join('')}</div></div><div class="entry-acts"><button class="icb" title="Transfer" onclick="Cash.transfer('${c.id}')">→</button><button class="icb" onclick="Cash.edit('${c.id}')">✏️</button><button class="icb del" onclick="Cash.del('${c.id}')">🗑️</button></div></div></div>`).join('');
  },
  openAdd() {
    Modal.open('💵 Add Cash', this.form(), `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Cash.save()">Save</button>`);
    setTimeout(() => { const el = document.getElementById('cf-amt'); if (el) U.numInput(el, S.user.currency || 'PKR'); }, 60);
  },
  form(c = {}) {
    return `<div class="fg"><label class="fl">Location *</label><select class="inp" id="cf-loc"><option value="Wallet">👛 Wallet</option><option value="Home">🏠 Home</option><option value="Office">🏢 Office</option><option value="Car">🚗 Car</option><option value="Other">📦 Other</option></select></div>
    <div class="fr"><div class="fg"><label class="fl">Amount *</label><input class="inp num-inp" id="cf-amt" type="text" inputmode="decimal" pattern="[0-9,\\.]*" value="${c.amount || ''}" placeholder="0"></div><div class="fg"><label class="fl">Currency</label><select class="inp" id="cf-cur">${U.currencies()}</select></div></div>
    <div class="fg"><label class="fl">Notes</label><textarea class="inp" id="cf-notes" rows="2">${c.notes || ''}</textarea></div>
    <div class="fg"><label class="fl">Tags</label>${U.tags(c.tags||[])}</div>`;
  },
  save(editId = null) {
    const loc = document.getElementById('cf-loc').value;
    const amt = parseFloat((document.getElementById('cf-amt').value || '').replace(/,/g, '')) || 0;
    if (!amt) { Toast.show('Enter an amount', 'warning'); return; }
    const cur = document.getElementById('cf-cur').value;
    const notes = document.getElementById('cf-notes').value.trim();
    const prev = (S.cash || []).find(x => x.id === editId);
    const item = { id: editId || U.id(), location: loc, amount: amt, currency: cur, notes, tags: U.getTags(), createdAt: editId ? prev?.createdAt : new Date().toISOString() };
    if (!S.cash) S.cash = [];
    if (editId) S.cash = S.cash.map(x => x.id === editId ? item : x); else S.cash.push(item);
    Activity.log((editId ? 'Edited' : 'Added') + ' cash', loc);
    Store.save(); Modal.close(); this.render();
    Toast.show(`${editId ? 'Updated' : 'Added'}: ${loc}`, 'success');
    if (!editId) promptAddAnother('Cash entry', 'Cash.openAdd');
  },
  edit(id) {
    const c = (S.cash || []).find(x => x.id === id); if (!c) return;
    Modal.open('✏️ Edit Cash', this.form(c), `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-d btn-sm" onclick="Cash.del('${id}',true)">Delete</button><button class="btn btn-p" onclick="Cash.save('${id}')">Update</button>`);
    setTimeout(() => {
      const loc = document.getElementById('cf-loc'); if (loc) loc.value = c.location || 'Wallet';
      const cur = document.getElementById('cf-cur'); if (cur) cur.value = c.currency || 'PKR';
      const amtEl = document.getElementById('cf-amt');
      if (amtEl) U.numInput(amtEl, c.currency || 'PKR');
    }, 60);
  },
  transfer(id) {
    const src = (S.cash || []).find(x => x.id === id); if (!src) return;
    const others = (S.cash || []).filter(x => x.id !== id);
    const locOpts = ['Wallet','Home','Office','Car','Other'].filter(l => l !== src.location);
    const otherEntries = others.filter(o => o.currency === src.currency);
    const destOpts = [
      ...locOpts.map(l => `<option value="__new__${l}">${l} (new entry)</option>`),
      ...(otherEntries.length ? ['<option disabled>── existing ──</option>', ...otherEntries.map(o => `<option value="${o.id}">${o.location} (${(o.amount||0).toLocaleString()} ${o.currency})</option>`)] : [])
    ].join('');
    Modal.open('→ Transfer Cash', `
      <div class="fg"><label class="fl">From</label><input class="inp" value="${src.location} · ${(src.amount||0).toLocaleString()} ${src.currency}" readonly style="opacity:.6"></div>
      <div class="fg"><label class="fl">To *</label><select class="inp" id="ct-dest">${destOpts}</select></div>
      <div class="fr">
        <div class="fg"><label class="fl">Amount *</label><input class="inp num-inp" id="ct-amt" type="text" inputmode="decimal" value="${src.amount||''}" placeholder="0"></div>
        <div class="fg"><label class="fl">Currency</label><input class="inp" value="${src.currency||''}" readonly style="opacity:.6"></div>
      </div>
      <div class="fg"><label class="fl">Note (optional)</label><input class="inp" id="ct-note" placeholder="reason…"></div>
    `, `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Cash._doTransfer('${id}')">Transfer</button>`);
    setTimeout(() => { const a = document.getElementById('ct-amt'); if (a) U.numInput(a, src.currency || 'PKR'); }, 60);
  },
  _doTransfer(srcId) {
    const src = (S.cash || []).find(x => x.id === srcId); if (!src) return;
    const rawAmt = (document.getElementById('ct-amt').value || '').replace(/,/g, '');
    const amt = parseFloat(rawAmt) || 0;
    if (!amt || amt <= 0) { Toast.show('Enter a valid amount', 'warning'); return; }
    if (amt > (src.amount || 0)) { Toast.show('Amount exceeds available cash', 'warning'); return; }
    const destVal = document.getElementById('ct-dest').value;
    const note = document.getElementById('ct-note').value.trim();
    // Reduce source
    if (amt >= (src.amount || 0)) { S.cash = (S.cash || []).filter(x => x.id !== srcId); }
    else { src.amount = parseFloat(((src.amount || 0) - amt).toFixed(2)); }
    // Add to destination
    if (destVal.startsWith('__new__')) {
      const destLoc = destVal.replace('__new__', '');
      S.cash.push({ id: U.id(), location: destLoc, amount: amt, currency: src.currency, notes: note, createdAt: new Date().toISOString() });
    } else {
      const dest = (S.cash || []).find(x => x.id === destVal);
      if (dest) { dest.amount = parseFloat(((dest.amount || 0) + amt).toFixed(2)); }
      else { S.cash.push({ id: U.id(), location: 'Other', amount: amt, currency: src.currency, notes: note, createdAt: new Date().toISOString() }); }
    }
    Activity.log('Cash transfer', `${amt} ${src.currency} from ${src.location}`);
    Store.save(); Modal.close(); this.render();
    Toast.show(`Moved ${src.currency} ${amt.toLocaleString()} from ${src.location}`, 'success');
  },
  del(id, fm = false) {
    if (!window.__vos_confirm('Delete this cash entry?')) return;
    const c = (S.cash || []).find(x => x.id === id);
    S.cash = (S.cash || []).filter(x => x.id !== id);
    Activity.log('Deleted cash', c?.location);
    Store.save(); if (fm) Modal.close(); this.render();
  }
};
