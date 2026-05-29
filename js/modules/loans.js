const Loans = {
  render() {
    const el = document.getElementById('loanItems'); if (!el) return;
    const f = S.loanF || 'all';
    const chips = [['all','All'],['Active','✅ Active'],['Overdue','🔴 Overdue'],['Settled','✔ Settled'],['lent','💸 I Lent'],['borrowed','🤲 I Borrowed']];
    const ci = document.getElementById('loanChips');
    if (ci) ci.innerHTML = chips.map(([v, l]) => `<div class="chip${v === f ? ' on' : ''}" onclick="S.loanF='${v}';Loans.render()">${l}</div>`).join('');

    const all = S.loans || [];
    const data = all.filter(l => {
      if (f === 'lent') return l.type === 'lent';
      if (f === 'borrowed') return l.type === 'borrowed';
      if (f === 'all') return true;
      return l.status === f;
    }).slice().sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    const sm = document.getElementById('loanSummary');
    if (sm) {
      const active = all.filter(l => l.status !== 'Settled');
      if (active.length) {
        const lent = active.filter(l => l.type === 'lent').reduce((a, l) => a + (l.amount || 0), 0);
        const borrowed = active.filter(l => l.type === 'borrowed').reduce((a, l) => a + (l.amount || 0), 0);
        const net = lent - borrowed;
        sm.innerHTML = `<div class="widget" style="margin-bottom:12px"><div class="fr" style="gap:0">
          <div style="flex:1;text-align:center;padding:4px 8px;border-right:1px solid var(--border)"><div style="font-size:10px;color:var(--text3)">I Lent</div><div style="font-size:18px;font-weight:700;color:var(--ok)" class="sens">${U.fmt(lent)}</div></div>
          <div style="flex:1;text-align:center;padding:4px 8px;border-right:1px solid var(--border)"><div style="font-size:10px;color:var(--text3)">I Borrowed</div><div style="font-size:18px;font-weight:700;color:var(--err)" class="sens">${U.fmt(borrowed)}</div></div>
          <div style="flex:1;text-align:center;padding:4px 8px"><div style="font-size:10px;color:var(--text3)">Net</div><div style="font-size:18px;font-weight:700;color:${net >= 0 ? 'var(--ok)' : 'var(--err)'}" class="sens">${net >= 0 ? '+' : ''}${U.fmt(net)}</div></div>
        </div></div>`;
      } else { sm.innerHTML = ''; }
    }

    if (!data.length) {
      el.innerHTML = `<div class="empty"><div class="empty-ic">🤝</div><h3>No loans</h3><p>Track money you lend to friends or borrow from others</p><button class="btn btn-p" style="margin-top:12px" onclick="Loans.openAdd()">🤝 Add Loan</button></div>`;
      return;
    }

    const now = new Date();
    const stBadge = { Active:'b-ok', Overdue:'b-err', Settled:'b-muted' };
    el.innerHTML = data.map(l => {
      const overdue = l.status === 'Active' && l.dueDate && new Date(l.dueDate) < now;
      const status = overdue ? 'Overdue' : (l.status || 'Active');
      const typeLabel = l.type === 'lent' ? '💸 Lent' : '🤲 Borrowed';
      const duePart = l.dueDate ? `<span class="badge ${overdue ? 'b-err' : 'b-warn'}">Due ${l.dueDate}</span>` : '';
      return `<div class="entry"><div class="entry-main"><div class="entry-ic">${l.type === 'lent' ? '💸' : '🤲'}</div><div class="entry-body"><div class="entry-name">${l.person || 'Unknown'}</div><div class="entry-sub">${typeLabel} · ${l.currency || ''} · ${l.date || ''}</div><div class="entry-meta"><span class="badge b-acc sens">${U.fmt(l.amount || 0)} ${l.currency || ''}</span><span class="badge ${stBadge[status] || 'b-muted'}">${status}</span>${duePart}</div></div><div class="entry-acts">${status !== 'Settled' ? `<button class="icb" title="Mark settled" onclick="Loans.settle('${l.id}')">✔</button>` : ''}<button class="icb" onclick="Loans.edit('${l.id}')">✏️</button><button class="icb del" onclick="Loans.del('${l.id}')">🗑️</button></div></div>${l.notes ? `<div style="padding:4px 12px 8px 52px;font-size:11px;color:var(--text3)">${l.notes}</div>` : ''}</div>`;
    }).join('');
  },
  openAdd() {
    Modal.open('🤝 Add Loan', this.form(), `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Loans.save()">Save</button>`);
  },
  form(l = {}) {
    const friendOpts = (S.friends || []).map(f => `<option value="${f.name}">`).join('');
    const today = new Date().toISOString().split('T')[0];
    return `<datalist id="loanFriendsDL">${friendOpts}</datalist>
    <div class="fg"><label class="fl">Person *</label><input class="inp" id="lf-person" value="${l.person || ''}" list="loanFriendsDL" placeholder="Name — or pick from Friends"></div>
    <div class="fr"><div class="fg"><label class="fl">Type *</label><select class="inp" id="lf-type"><option value="lent"${(l.type || 'lent') === 'lent' ? ' selected' : ''}>💸 I Lent</option><option value="borrowed"${l.type === 'borrowed' ? ' selected' : ''}>🤲 I Borrowed</option></select></div><div class="fg"><label class="fl">Status</label><select class="inp" id="lf-status"><option value="Active"${(l.status || 'Active') === 'Active' ? ' selected' : ''}>Active</option><option value="Settled"${l.status === 'Settled' ? ' selected' : ''}>Settled</option><option value="Overdue"${l.status === 'Overdue' ? ' selected' : ''}>Overdue</option></select></div></div>
    <div class="fr"><div class="fg"><label class="fl">Amount *</label><input class="inp" id="lf-amt" type="number" value="${l.amount || ''}" placeholder="0" min="0" step="any"></div><div class="fg"><label class="fl">Currency</label><select class="inp" id="lf-cur">${U.currencies()}</select></div></div>
    <div class="fr"><div class="fg"><label class="fl">Date</label><input class="inp" id="lf-date" type="date" value="${l.date || today}"></div><div class="fg"><label class="fl">Due Date</label><input class="inp" id="lf-due" type="date" value="${l.dueDate || ''}"></div></div>
    <div class="fg"><label class="fl">Notes</label><textarea class="inp" id="lf-notes" rows="2">${l.notes || ''}</textarea></div>`;
  },
  save(editId = null) {
    const person = document.getElementById('lf-person').value.trim();
    const amt = parseFloat(document.getElementById('lf-amt').value) || 0;
    if (!person) { Toast.show('Person required', 'warning'); return; }
    if (!amt) { Toast.show('Enter an amount', 'warning'); return; }
    const item = {
      id: editId || U.id(), person, type: document.getElementById('lf-type').value,
      status: document.getElementById('lf-status').value, amount: amt,
      currency: document.getElementById('lf-cur').value,
      date: document.getElementById('lf-date').value,
      dueDate: document.getElementById('lf-due').value,
      notes: document.getElementById('lf-notes').value.trim(),
      createdAt: editId ? (S.loans || []).find(x => x.id === editId)?.createdAt : new Date().toISOString()
    };
    if (!S.loans) S.loans = [];
    if (editId) S.loans = S.loans.map(x => x.id === editId ? item : x); else S.loans.push(item);
    Activity.log((editId ? 'Edited' : 'Added') + ' loan', `${item.type === 'lent' ? 'lent to' : 'borrowed from'} ${person}`);
    Store.save(); Modal.close(); this.render();
    Toast.show(`${editId ? 'Updated' : 'Added'}: ${person}`, 'success');
  },
  edit(id) {
    const l = (S.loans || []).find(x => x.id === id); if (!l) return;
    Modal.open('✏️ Edit Loan', this.form(l), `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-d btn-sm" onclick="Loans.del('${id}',true)">Delete</button><button class="btn btn-p" onclick="Loans.save('${id}')">Update</button>`);
    setTimeout(() => {
      const cur = document.getElementById('lf-cur'); if (cur) cur.value = l.currency || S.user.currency || 'PKR';
    }, 60);
  },
  settle(id) {
    const l = (S.loans || []).find(x => x.id === id); if (!l) return;
    l.status = 'Settled';
    Activity.log('Settled loan', l.person);
    Store.save(); this.render();
    Toast.show(`Settled with ${l.person}`, 'success');
  },
  del(id, fm = false) {
    if (!window.__vos_confirm('Delete this loan?')) return;
    const l = (S.loans || []).find(x => x.id === id);
    S.loans = (S.loans || []).filter(x => x.id !== id);
    Activity.log('Deleted loan', l?.person);
    Store.save(); if (fm) Modal.close(); this.render();
  }
};
