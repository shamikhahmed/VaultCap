const Friends = {
  render() {
    const el = document.getElementById('friendItems'); if (!el) return;
    const allFriends = S.friends || [];
    const activeLoans = (S.loans || []).filter(l => l.status !== 'Settled');
    const friendLoans = activeLoans.filter(l => allFriends.some(f => f.name === l.person));
    const owedToYou = friendLoans.filter(l => l.type === 'lent').reduce((a, l) => a + (l.amount || 0), 0);
    const youOwe = friendLoans.filter(l => l.type === 'borrowed').reduce((a, l) => a + (l.amount || 0), 0);
    const sm = document.getElementById('friendSummary');
    if (sm && allFriends.length > 0) {
      sm.innerHTML = `<div class="widget" style="margin-bottom:12px"><div style="display:flex"><div style="flex:1;text-align:center;padding:10px 0;border-right:1px solid var(--border)"><div style="font-size:10px;color:var(--text3);margin-bottom:2px">Friends</div><div style="font-size:22px;font-weight:800">${allFriends.length}</div></div><div style="flex:1;text-align:center;padding:10px 0;border-right:1px solid var(--border)"><div style="font-size:10px;color:var(--text3);margin-bottom:2px">They owe me</div><div style="font-size:16px;font-weight:700;color:var(--ok)" class="sens">${U.fmt(owedToYou)}</div></div><div style="flex:1;text-align:center;padding:10px 0"><div style="font-size:10px;color:var(--text3);margin-bottom:2px">I owe them</div><div style="font-size:16px;font-weight:700;color:var(--err)" class="sens">${U.fmt(youOwe)}</div></div></div></div>`;
    } else if (sm) { sm.innerHTML = ''; }
    const q = (document.getElementById('friendQ')?.value || '').toLowerCase();
    const data = allFriends.filter(f => !q || JSON.stringify(f).toLowerCase().includes(q))
      .slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    if (!data.length) {
      el.innerHTML = `<div class="empty"><div class="empty-ic">👥</div><h3>No friends yet</h3><p>Add people you lend or borrow money from, or just keep contacts here</p><button class="btn btn-p" style="margin-top:12px" onclick="Friends.openAdd()">👥 Add Friend</button></div>`;
      return;
    }
    el.innerHTML = data.map(f => {
      const loans = (S.loans || []).filter(l => l.person === f.name && l.status !== 'Settled');
      const badge = loans.length ? `<span class="badge b-warn">${loans.length} loan${loans.length > 1 ? 's' : ''}</span>` : '';
      return `<div class="entry"><div class="entry-main"><div class="entry-ic">👤</div><div class="entry-body"><div class="entry-name">${f.name}</div><div class="entry-sub">${f.phone || ''}${f.notes ? (f.phone ? ' · ' : '') + f.notes : ''}</div><div class="entry-meta">${badge}</div></div><div class="entry-acts"><button class="icb" onclick="Friends.edit('${f.id}')">✏️</button><button class="icb del" onclick="Friends.del('${f.id}')">🗑️</button></div></div></div>`;
    }).join('');
  },
  openAdd() {
    Modal.open('👥 Add Friend', this.form(), `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-p" onclick="Friends.save()">Save</button>`);
  },
  form(f = {}) {
    return `<div class="fg"><label class="fl">Name *</label><input class="inp" id="ff-name" value="${f.name || ''}" placeholder="Full name"></div>
    <div class="fg"><label class="fl">Phone</label><input class="inp" id="ff-phone" value="${f.phone || ''}" placeholder="+92 300 ..."></div>
    <div class="fg"><label class="fl">Notes</label><textarea class="inp" id="ff-notes" rows="2">${f.notes || ''}</textarea></div>`;
  },
  save(editId = null) {
    const name = document.getElementById('ff-name').value.trim();
    if (!name) { Toast.show('Name required', 'warning'); return; }
    const item = { id: editId || U.id(), name, phone: document.getElementById('ff-phone').value.trim(), notes: document.getElementById('ff-notes').value.trim(), createdAt: editId ? (S.friends || []).find(x => x.id === editId)?.createdAt : new Date().toISOString() };
    if (!S.friends) S.friends = [];
    if (editId) S.friends = S.friends.map(x => x.id === editId ? item : x); else S.friends.push(item);
    Activity.log((editId ? 'Edited' : 'Added') + ' friend', name);
    Store.save(); Modal.close(); this.render();
    Toast.show(`${editId ? 'Updated' : 'Added'}: ${name}`, 'success');
  },
  edit(id) {
    const f = (S.friends || []).find(x => x.id === id); if (!f) return;
    Modal.open('✏️ Edit Friend', this.form(f), `<button class="btn btn-g" onclick="Modal.close()">Cancel</button><button class="btn btn-d btn-sm" onclick="Friends.del('${id}',true)">Delete</button><button class="btn btn-p" onclick="Friends.save('${id}')">Update</button>`);
  },
  del(id, fm = false) {
    if (!window.__vos_confirm('Move to Trash?')) return;
    const f = (S.friends || []).find(x => x.id === id); if (!f) return;
    S.trash.push({id: U.id(), type: 'friends', data: f, deletedAt: new Date().toISOString()});
    S.friends = (S.friends || []).filter(x => x.id !== id);
    Activity.log('Trashed friend', f.name);
    Store.save(); if (fm) Modal.close(); this.render();
    Toast.show(`Moved to Trash — <button class="cpbtn" onclick="Trash.restore('${S.trash[S.trash.length-1].id}');this.closest('.toast').remove()">Undo</button>`,'info',6000);
  }
};
