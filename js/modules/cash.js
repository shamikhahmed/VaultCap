const Cash = {
  render() {
    const el = document.getElementById('cashItems'); if (!el) return;
    const sm = document.getElementById('cashSummary');
    const data = (S.cash || []).slice().sort((a, b) => (b.amount || 0) - (a.amount || 0));
    if (sm) {
      if (data.length) {
        const byCur = {};
        data.forEach(c => { byCur[c.currency] = (byCur[c.currency] || 0) + (c.amount || 0); });
        const totStr = Object.entries(byCur).map(([cur, v]) => `${v.toLocaleString()} ${cur}`).join(' &nbsp;+&nbsp; ');
        sm.innerHTML = `<div class="widget" style="margin-bottom:12px;text-align:center"><div style="font-size:10px;color:var(--text3);margin-bottom:4px;letter-spacing:.5px;text-transform:uppercase;font-weight:700">Total Cash on Hand</div><div class="sens" style="font-size:22px;font-weight:800">${totStr}</div></div>`;
      } else { sm.innerHTML = ''; }
    }
    if (!data.length) {
      el.innerHTML = `<div class="empty"><div class="empty-ic">💵</div><h3>No cash entries</h3><p>Track physical cash across your wallet, home, office and more</p><button class="btn btn-p" style="margin-top:12px" onclick="Cash.openAdd()">💵 Add Cash</button></div>`;
      return;
    }
    const locIc = { Wallet:'👛', Home:'🏠', Office:'🏢', Car:'🚗', Other:'📦' };
    el.innerHTML = data.map(c => `<div class="entry"><div class="entry-main"><div class="entry-ic">${locIc[c.location] || '💵'}</div><div class="entry-body"><div class="entry-name">${c.location || 'Cash'}</div><div class="entry-sub sens">${(c.amount || 0).toLocaleString()} ${c.currency || ''}${c.notes ? ' · ' + c.notes : ''}</div><div class="entry-meta"><span class="badge b-ok sens">${(c.amount || 0).toLocaleString()} ${c.currency || ''}</span></div></div><div class="entry-acts"><button class="icb" onclick="Cash.edit('${c.id}')">✏️</button><button class="icb del" onclick="Cash.del('${c.id}')">🗑️</button></div></div></div>`).join('');
  },
  openAdd() {
    Modal.open('💵 Add Cash', this.form(), `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Cash.save()">Save</button>`);
  },
  form(c = {}) {
    return `<div class="fg"><label class="fl">Location *</label><select class="inp" id="cf-loc"><option value="Wallet">👛 Wallet</option><option value="Home">🏠 Home</option><option value="Office">🏢 Office</option><option value="Car">🚗 Car</option><option value="Other">📦 Other</option></select></div>
    <div class="fr"><div class="fg"><label class="fl">Amount *</label><input class="inp" id="cf-amt" type="number" value="${c.amount || ''}" placeholder="0" min="0" step="any"></div><div class="fg"><label class="fl">Currency</label><select class="inp" id="cf-cur">${U.currencies()}</select></div></div>
    <div class="fg"><label class="fl">Notes</label><textarea class="inp" id="cf-notes" rows="2">${c.notes || ''}</textarea></div>`;
  },
  save(editId = null) {
    const loc = document.getElementById('cf-loc').value;
    const amt = parseFloat(document.getElementById('cf-amt').value) || 0;
    if (!amt) { Toast.show('Enter an amount', 'warning'); return; }
    const cur = document.getElementById('cf-cur').value;
    const notes = document.getElementById('cf-notes').value.trim();
    const prev = (S.cash || []).find(x => x.id === editId);
    const item = { id: editId || U.id(), location: loc, amount: amt, currency: cur, notes, createdAt: editId ? prev?.createdAt : new Date().toISOString() };
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
    }, 60);
  },
  del(id, fm = false) {
    if (!window.__vos_confirm('Delete this cash entry?')) return;
    const c = (S.cash || []).find(x => x.id === id);
    S.cash = (S.cash || []).filter(x => x.id !== id);
    Activity.log('Deleted cash', c?.location);
    Store.save(); if (fm) Modal.close(); this.render();
  }
};
