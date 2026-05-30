const Loans = {
  _friendName: '',

  addFriend(btnEl) {
    const name = this._friendName;
    if (!name) return;
    if (!(S.friends || []).some(f => f.name === name)) {
      S.friends = S.friends || [];
      S.friends.push({ id: U.id(), name, createdAt: new Date().toISOString() });
      Store.save();
      Toast.show(`${name} added to Friends`, 'success');
    }
    if (btnEl) btnEl.closest('.toast')?.remove();
    this._friendName = '';
  },

  render() {
    const el = document.getElementById('loanItems');
    if (!el) return;

    const all = S.loans || [];
    const now = new Date();

    const borrowed = all.filter(l => l.type === 'borrowed');
    const lent     = all.filter(l => l.type === 'lent');

    const totalOwe  = borrowed.filter(l => l.status !== 'Settled').reduce((a, l) => a + (l.amount || 0), 0);
    const totalOwed = lent.filter(l => l.status !== 'Settled').reduce((a, l) => a + (l.amount || 0), 0);
    const net       = totalOwed - totalOwe;

    const sm = document.getElementById('loanSummary');
    if (sm) {
      sm.innerHTML = `<div class="widget" style="margin-bottom:12px"><div class="fr" style="gap:0">
        <div style="flex:1;text-align:center;padding:6px 8px;border-right:1px solid var(--border)">
          <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">I Owe</div>
          <div style="font-size:20px;font-weight:800;color:var(--err)" class="sens">${U.fmt(totalOwe)}</div>
        </div>
        <div style="flex:1;text-align:center;padding:6px 8px;border-right:1px solid var(--border)">
          <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">Net</div>
          <div style="font-size:20px;font-weight:800;color:${net >= 0 ? 'var(--ok)' : 'var(--err)'}" class="sens">${net >= 0 ? '+' : ''}${U.fmt(net)}</div>
        </div>
        <div style="flex:1;text-align:center;padding:6px 8px">
          <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">They Owe</div>
          <div style="font-size:20px;font-weight:800;color:var(--ok)" class="sens">${U.fmt(totalOwed)}</div>
        </div>
      </div></div>`;
    }

    const renderCard = l => {
      const overdue = l.status === 'Active' && l.dueDate && new Date(l.dueDate) < now;
      const status  = l.status === 'Settled' ? 'Settled' : overdue ? 'Overdue' : 'Active';
      const badge   = { Active: 'b-ok', Overdue: 'b-err', Settled: 'b-muted' }[status] || 'b-muted';
      const duePart = l.dueDate
        ? `<span class="badge ${overdue ? 'b-err' : 'b-warn'}">Due ${l.dueDate}</span>`
        : '';
      const settle  = status !== 'Settled'
        ? `<button class="icb" title="Mark settled" onclick="Loans.settle('${l.id}')">✔</button>`
        : '';
      return `<div class="entry" data-id="${l.id}">
        <div class="entry-main">
          <div class="entry-ic">${l.type === 'lent' ? '💸' : '🤲'}</div>
          <div class="entry-body">
            <div class="entry-name">${l.person || 'Unknown'}</div>
            <div class="entry-sub">${l.date || ''}</div>
            <div class="entry-meta">
              <span class="badge b-acc sens">${U.fmt(l.amount || 0)} ${l.currency || ''}</span>
              <span class="badge ${badge}">${status}</span>
              ${duePart}
            </div>
          </div>
          <div class="entry-acts">${settle}<button class="icb" onclick="Loans.edit('${l.id}')">✏️</button><button class="icb del" onclick="Loans.del('${l.id}')">🗑️</button></div>
        </div>
        ${l.notes ? `<div style="padding:4px 12px 8px 52px;font-size:11px;color:var(--text3)">${l.notes}</div>` : ''}
      </div>`;
    };

    const renderSection = (loans, kind) => {
      const overdue  = loans.filter(l => l.status === 'Active' && l.dueDate && new Date(l.dueDate) < now);
      const active   = loans.filter(l => l.status === 'Active' && !(l.dueDate && new Date(l.dueDate) < now));
      const settled  = loans.filter(l => l.status === 'Settled');
      const liveAll  = [...overdue, ...active];
      const totalAmt = loans.filter(l => l.status !== 'Settled').reduce((a, l) => a + (l.amount || 0), 0);
      const title    = kind === 'borrowed' ? '🤲 I Owe' : '💸 They Owe Me';
      const color    = kind === 'borrowed' ? 'var(--err)' : 'var(--ok)';
      const addType  = kind;

      let html = `<div style="margin-bottom:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;padding:0 2px">
          <div>
            <div style="font-size:14px;font-weight:700">${title}</div>
            ${totalAmt > 0
              ? `<div style="font-size:12px;color:var(--text3)">${loans.filter(l => l.status !== 'Settled').length} active · <span class="sens" style="color:${color}">${U.fmt(totalAmt)} ${S.user.currency || ''}</span></div>`
              : `<div style="font-size:12px;color:var(--text3)">Nothing here yet</div>`}
          </div>
          <button class="btn btn-p btn-sm" onclick="Loans.openAdd('${addType}')">+ Add</button>
        </div>`;

      if (liveAll.length === 0 && settled.length === 0) {
        html += `<div style="padding:12px;background:var(--glass);border-radius:var(--r);text-align:center;font-size:12px;color:var(--text3)">No entries yet — tap + Add above</div>`;
      } else {
        html += liveAll.map(renderCard).join('');
        if (settled.length > 0) {
          html += `<details style="margin-top:6px"><summary style="cursor:pointer;font-size:12px;color:var(--text3);padding:6px 0;list-style:none;display:flex;align-items:center;gap:6px"><span style="flex:1">✔ Settled (${settled.length})</span><span style="font-size:10px">▾</span></summary>${settled.map(renderCard).join('')}</details>`;
        }
      }
      html += `</div>`;
      return html;
    };

    el.innerHTML = renderSection(borrowed, 'borrowed')
      + `<div style="height:1px;background:var(--border);margin:4px 0 16px"></div>`
      + renderSection(lent, 'lent');
    initSwipeDelete(el);
  },

  openAdd(type = 'borrowed') {
    const title = type === 'borrowed' ? '🤲 I Owe (Borrowed)' : '💸 They Owe Me (Lent)';
    Modal.open(title, this.form({ type }), `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Loans.save()">Save</button>`);
    setTimeout(() => {
      const cur = document.getElementById('lf-cur');
      if (cur) cur.value = S.user.currency || 'PKR';
      const amtEl = document.getElementById('lf-amt');
      if (amtEl) U.numInput(amtEl, S.user.currency || 'PKR');
    }, 60);
  },

  form(l = {}) {
    const friendOpts = (S.friends || []).map(f => `<option value="${f.name}">`).join('');
    const today = new Date().toISOString().split('T')[0];
    const type  = l.type || 'borrowed';
    return `<datalist id="loanFriendsDL">${friendOpts}</datalist>
    <input type="hidden" id="lf-type" value="${type}">
    <div class="fg"><label class="fl">Person *</label><input class="inp" id="lf-person" value="${l.person || ''}" list="loanFriendsDL" placeholder="Who did you borrow from / lend to?"></div>
    <div class="fr"><div class="fg"><label class="fl">Amount *</label><input class="inp num-inp" id="lf-amt" type="text" inputmode="decimal" pattern="[0-9,\\.]*" value="${l.amount || ''}" placeholder="0"></div><div class="fg"><label class="fl">Currency</label><select class="inp" id="lf-cur">${U.currencies()}</select></div></div>
    <div class="fr"><div class="fg"><label class="fl">Date</label><input class="inp" id="lf-date" type="date" value="${l.date || today}"></div><div class="fg"><label class="fl">Due Date (optional)</label><input class="inp" id="lf-due" type="date" value="${l.dueDate || ''}"></div></div>
    <div class="fg"><label class="fl">Notes (optional)</label><textarea class="inp" id="lf-notes" rows="2">${l.notes || ''}</textarea></div>`;
  },

  save(editId = null) {
    const person  = document.getElementById('lf-person').value.trim();
    const rawAmt  = (document.getElementById('lf-amt').value || '').replace(/,/g, '');
    const amt     = parseFloat(rawAmt) || 0;
    if (!person) { Toast.show('Person required', 'warning'); return; }
    if (!amt)    { Toast.show('Enter an amount', 'warning'); return; }
    const type    = document.getElementById('lf-type').value;
    const existing = editId ? (S.loans || []).find(x => x.id === editId) : null;
    const item = {
      id: editId || U.id(), person, type,
      status:   existing?.status || 'Active',
      amount:   amt,
      currency: document.getElementById('lf-cur').value,
      date:     document.getElementById('lf-date').value,
      dueDate:  document.getElementById('lf-due').value,
      notes:    document.getElementById('lf-notes').value.trim(),
      createdAt: editId ? existing?.createdAt : new Date().toISOString()
    };
    if (!S.loans) S.loans = [];
    if (editId) S.loans = S.loans.map(x => x.id === editId ? item : x);
    else S.loans.push(item);
    Activity.log((editId ? 'Edited' : 'Added') + ' loan', `${type === 'lent' ? 'lent to' : 'borrowed from'} ${person}`);
    Store.save(); Modal.close(); this.render();
    Toast.show(`${editId ? 'Updated' : 'Added'}: ${person}`, 'success');
    if (!editId) {
      const alreadyFriend = (S.friends || []).some(f => f.name === person);
      if (!alreadyFriend) {
        S.friends = S.friends || [];
        const friendId = U.id();
        S.friends.push({ id: friendId, name: person, createdAt: new Date().toISOString() });
        Store.save();
        Toast.show(`${person} added to Friends. <button class="cpbtn" onclick="S.friends=S.friends.filter(f=>f.id!=='${friendId}');Store.save();this.closest('.toast').remove();Toast.show('Removed from Friends','info',1800)">Undo</button>`, 'info', 5000);
      }
      promptAddAnother('Loan', `Loans.openAdd('${type}')`);
    }
  },

  edit(id) {
    const l = (S.loans || []).find(x => x.id === id); if (!l) return;
    Modal.open('✏️ Edit Loan', this.form(l), `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-d btn-sm" onclick="Loans.del('${id}',true)">Delete</button><button class="btn btn-p" onclick="Loans.save('${id}')">Update</button>`);
    setTimeout(() => {
      const cur = document.getElementById('lf-cur');
      if (cur) cur.value = l.currency || S.user.currency || 'PKR';
      const amtEl = document.getElementById('lf-amt');
      if (amtEl && l.amount) {
        const c = l.currency || S.user.currency || 'PKR';
        amtEl.value = c === 'PKR'
          ? new Intl.NumberFormat('en-IN').format(l.amount)
          : new Intl.NumberFormat('en-US').format(l.amount);
        U.numInput(amtEl, c);
      }
    }, 60);
  },

  settle(id) {
    const l = (S.loans || []).find(x => x.id === id); if (!l) return;
    l.status = 'Settled';
    Activity.log('Settled loan', l.person);
    Store.save(); this.render();
    Toast.show(`🎉 Settled with ${l.person}!`, 'success');
  },

  del(id, fm = false) {
    if (!window.__vos_confirm('Move to Trash?')) return;
    const l = (S.loans || []).find(x => x.id === id);
    if (l) {
      S.trash = S.trash || [];
      S.trash.push({ id: U.id(), type: 'loans', data: l, deletedAt: new Date().toISOString() });
    }
    S.loans = (S.loans || []).filter(x => x.id !== id);
    Activity.log('Trashed loan', l?.person);
    Store.save(); if (fm) Modal.close(); this.render();
  }
};
