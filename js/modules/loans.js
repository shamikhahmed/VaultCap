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
    const msPerDay = 86400000;

    const borrowed = all.filter(l => l.type === 'borrowed');
    const lent     = all.filter(l => l.type === 'lent');

    const fx = typeof getFX === 'function' ? getFX() : (typeof FX !== 'undefined' ? FX : {PKR:1,GBP:355,AED:76,USD:280});
    const toBaseCur = (amt, cur) => (amt||0) * (fx[cur] || 1);
    const userCur = S.user?.currency || 'PKR';
    const totalOwe  = borrowed.filter(l => l.status !== 'Settled').reduce((a, l) => a + toBaseCur(l.amount||0, l.currency||userCur), 0);
    const totalOwed = lent.filter(l => l.status !== 'Settled').reduce((a, l) => a + toBaseCur(l.amount||0, l.currency||userCur), 0);
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
      const dueDate = l.dueDate ? new Date(l.dueDate) : null;
      const overdue = l.status === 'Active' && dueDate && dueDate < now;
      const daysOverdue = overdue ? Math.round((now - dueDate) / msPerDay) : 0;
      const daysUntilDue = dueDate && !overdue && l.status === 'Active' ? Math.round((dueDate - now) / msPerDay) : null;
      const soonDue = daysUntilDue !== null && daysUntilDue <= 7;

      const status  = l.status === 'Settled' ? 'Settled' : overdue ? 'Overdue' : 'Active';
      const badge   = { Active: 'b-ok', Overdue: 'b-err', Settled: 'b-muted' }[status] || 'b-muted';

      let duePart = '';
      if (l.status !== 'Settled' && dueDate) {
        if (overdue) {
          duePart = `<span class="badge b-err">⚠️ OVERDUE ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}</span>`;
        } else if (soonDue) {
          duePart = `<span class="badge b-warn">⏰ Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}</span>`;
        } else {
          duePart = `<span class="badge b-warn">Due ${l.dueDate}</span>`;
        }
      } else if (l.status === 'Settled') {
        duePart = `<span class="badge b-muted">✓ Settled</span>`;
      }

      const payments = l.payments || [];
      const paid = payments.reduce((a, p) => a + (p.amount || 0), 0);
      const remaining = Math.max(0, (l.amount || 0) - paid);
      const hasPaid = paid > 0;
      const cur = l.currency || userCur;

      const settle  = status !== 'Settled'
        ? `<button type="button" class="icb" aria-label="Mark settled" title="Mark settled" onclick="Loans.settle('${l.id}')">✔</button>`
        : '';
      const payBtn = status !== 'Settled'
        ? `<button type="button" class="icb" aria-label="Record payment" title="Record payment" onclick="Loans.recordPayment('${l.id}')">💰</button>`
        : '';

      return `<div class="entry" data-id="${l.id}">
        <div class="entry-main">
          <div class="entry-ic">${l.type === 'lent' ? '💸' : '🤲'}</div>
          <div class="entry-body">
            <div class="entry-name">${l.person || 'Unknown'}</div>
            <div class="entry-sub">${l.date || ''}</div>
            <div class="entry-meta">
              <span class="badge b-acc sens">${cur} ${Math.round(l.amount || 0).toLocaleString()}</span>
              <span class="badge ${badge}">${status}</span>
              ${duePart}
              ${(l.tags||[]).slice(0,2).map(t=>`<span class="badge b-muted">${t}</span>`).join('')}
            </div>
            ${hasPaid ? `<div style="font-size:11px;color:var(--text3);padding-top:3px">Paid: <span class="sens">${cur} ${Math.round(paid).toLocaleString()}</span> · Remaining: <span class="sens" style="color:${remaining===0?'var(--ok)':'var(--warn)'}">${cur} ${Math.round(remaining).toLocaleString()}</span></div>` : ''}
          </div>
          <div class="entry-acts">${payBtn}${settle}<button type="button" class="icb" aria-label="Edit" onclick="Loans.edit('${l.id}')">✏️</button><button type="button" class="icb del" aria-label="Delete" onclick="Loans.del('${l.id}')">🗑️</button></div>
        </div>
        ${l.notes ? `<div style="padding:4px 12px 8px 52px;font-size:11px;color:var(--text3)">${l.notes}</div>` : ''}
      </div>`;
    };

    const renderSection = (loans, kind) => {
      const overdue  = loans.filter(l => l.status === 'Active' && l.dueDate && new Date(l.dueDate) < now);
      const active   = loans.filter(l => l.status === 'Active' && !(l.dueDate && new Date(l.dueDate) < now));
      const settled  = loans.filter(l => l.status === 'Settled');
      const liveAll  = [...overdue, ...active];
      const totalAmt = loans.filter(l => l.status !== 'Settled').reduce((a, l) => a + toBaseCur(l.amount||0, l.currency||userCur), 0);
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
          <button type="button" class="btn btn-p btn-sm" onclick="Loans.openAdd('${addType}')">+ Add</button>
        </div>`;

      if (liveAll.length === 0 && settled.length === 0) {
        html += `<div class="empty-ios"><div class="ei-ic">💳</div><div class="ei-title">No loans yet</div><div class="ei-sub">Track mortgages, personal loans, car finance — repayment schedules and interest calculations</div><div style="display:flex;gap:10px;justify-content:center;margin-top:16px;flex-wrap:wrap"><button type="button" class="btn btn-p" onclick="Loans.openAdd()">+ Add Loan</button></div></div>`;
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
    Modal.open(title, this.form({ type }), `<button type="button" class="btn btn-g" onclick="Modal.close()">Cancel</button><button type="button" class="btn btn-p" onclick="Loans.save()">Save</button>`);
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
    <div class="fg"><label class="fl">Notes (optional)</label><textarea class="inp" id="lf-notes" rows="2">${l.notes || ''}</textarea></div>
    <div class="fg"><label class="fl">Tags</label>${U.tags(l.tags||[])}</div>`;
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
      payments: existing?.payments || [],
      amount:   amt,
      currency: document.getElementById('lf-cur').value,
      date:     document.getElementById('lf-date').value,
      dueDate:  document.getElementById('lf-due').value,
      notes:    document.getElementById('lf-notes').value.trim(),
      tags:     U.getTags(),
      ownerId: 'self',
      country: (S.user && S.user.country) || 'PK',
      updatedAt: new Date().toISOString(),
      createdAt: editId ? existing?.createdAt : new Date().toISOString()
    };
    if (!S.loans) S.loans = [];
    if (editId) S.loans = S.loans.map(x => x.id === editId ? item : x);
    else S.loans.push(item);
    if (typeof autoLink === 'function') autoLink('loan', item);
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
        Toast.show(`${person} added to Friends. <button type="button" class="cpbtn" onclick="S.friends=S.friends.filter(f=>f.id!=='${friendId}');Store.save();this.closest('.toast').remove();Toast.show('Removed from Friends','info',1800)">Undo</button>`, 'info', 5000);
      }
      promptAddAnother('Loan', `Loans.openAdd('${type}')`);
    }
  },

  edit(id) {
    const l = (S.loans || []).find(x => x.id === id); if (!l) return;
    Modal.open('✏️ Edit Loan', this.form(l), `<button type="button" class="btn btn-g" onclick="Modal.close()">Cancel</button><button type="button" class="btn btn-d btn-sm" onclick="Loans.del('${id}',true)">Delete</button><button type="button" class="btn btn-p" onclick="Loans.save('${id}')">Update</button>`);
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

  recordPayment(id) {
    const l = (S.loans || []).find(x => x.id === id); if (!l) return;
    const payments = l.payments || [];
    const paid = payments.reduce((a, p) => a + (p.amount || 0), 0);
    const remaining = Math.max(0, (l.amount || 0) - paid);
    const cur = l.currency || S.user?.currency || 'PKR';
    Modal.open('💰 Record Payment',
      `<div class="fg"><label class="fl">Amount Paid *</label><input class="inp num-inp" id="lp-amt" type="text" inputmode="decimal" pattern="[0-9,\\.]*" placeholder="0"></div>
      <div class="fg"><label class="fl">Date</label><input class="inp" id="lp-date" type="date" value="${new Date().toISOString().split('T')[0]}"></div>
      <div class="fg"><label class="fl">Notes (optional)</label><input class="inp" id="lp-notes" placeholder="Transfer, cash…"></div>
      <div style="background:var(--glass);border-radius:var(--r);padding:10px 12px;font-size:12px;color:var(--text2);margin-top:4px">
        <div>Original: <strong>${cur} ${Math.round(l.amount||0).toLocaleString()}</strong></div>
        <div>Paid so far: <strong>${cur} ${Math.round(paid).toLocaleString()}</strong></div>
        <div>Remaining: <strong style="color:${remaining===0?'var(--ok)':'var(--warn)'}">${cur} ${Math.round(remaining).toLocaleString()}</strong></div>
      </div>`,
      `<button type="button" class="btn btn-g" onclick="Modal.close()">Cancel</button><button type="button" class="btn btn-p" onclick="Loans.savePayment('${id}')">Record</button>`
    );
    setTimeout(() => {
      const amtEl = document.getElementById('lp-amt');
      if (amtEl) U.numInput(amtEl, cur);
    }, 60);
  },

  savePayment(id) {
    const rawAmt = (document.getElementById('lp-amt')?.value || '').replace(/,/g, '');
    const amt = parseFloat(rawAmt) || 0;
    if (!amt) { Toast.show('Enter an amount', 'warning'); return; }
    const l = (S.loans || []).find(x => x.id === id); if (!l) return;
    if (!l.payments) l.payments = [];
    l.payments.push({
      amount: amt,
      date: document.getElementById('lp-date')?.value || new Date().toISOString().split('T')[0],
      notes: (document.getElementById('lp-notes')?.value || '').trim(),
      recordedAt: new Date().toISOString()
    });
    const totalPaid = l.payments.reduce((a, p) => a + (p.amount || 0), 0);
    if (totalPaid >= (l.amount || 0)) {
      l.status = 'Settled';
      Toast.show(`🎉 Fully paid! Settled with ${l.person}`, 'success');
    } else {
      const remaining = Math.round((l.amount || 0) - totalPaid);
      Toast.show(`Payment recorded. Remaining: ${l.currency || ''} ${remaining.toLocaleString()}`, 'success');
    }
    Activity.log('Recorded payment', l.person);
    Store.save(); Modal.close(); this.render();
  },

  settle(id) {
    const l = (S.loans || []).find(x => x.id === id); if (!l) return;
    if (!window.__vos_confirm(`Mark loan with ${l.person} as fully settled?`)) return;
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
