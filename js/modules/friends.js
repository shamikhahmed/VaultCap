const Friends = {
  render() {
    const el = document.getElementById('friendItems'); if (!el) return;
    const allFriends = S.friends || [];
    const activeLoans = (S.loans || []).filter(l => l.status !== 'Settled');
    const friendLoans = activeLoans.filter(l => allFriends.some(f => f.name === l.person));
    const sumFriendPKR = (type) => friendLoans
      .filter(l => l.type === type)
      .reduce((a, l) => a + (typeof CurrencyEngine !== 'undefined'
        ? CurrencyEngine.toBase(l.amount || 0, l.currency || 'PKR')
        : (l.amount || 0)), 0);
    const owedToYou = sumFriendPKR('lent');
    const youOwe = sumFriendPKR('borrowed');
    const cur = S.user?.currency || 'PKR';
    const sm = document.getElementById('friendSummary');
    if (sm && allFriends.length > 0) {
      sm.innerHTML = `<div class="widget" style="margin-bottom:12px"><div style="display:flex"><div style="flex:1;text-align:center;padding:10px 0;border-right:1px solid var(--border)"><div style="font-size:10px;color:var(--text3);margin-bottom:2px">Friends</div><div style="font-size:22px;font-weight:800">${allFriends.length}</div></div><div style="flex:1;text-align:center;padding:10px 0;border-right:1px solid var(--border)"><div style="font-size:10px;color:var(--text3);margin-bottom:2px">They owe me</div><div style="font-size:16px;font-weight:700;color:var(--ok)" class="sens">${U.fmtCur(owedToYou, cur)}</div></div><div style="flex:1;text-align:center;padding:10px 0"><div style="font-size:10px;color:var(--text3);margin-bottom:2px">I owe them</div><div style="font-size:16px;font-weight:700;color:var(--err)" class="sens">${U.fmtCur(youOwe, cur)}</div></div></div></div>`;
    } else if (sm) { sm.innerHTML = ''; }
    const q = (document.getElementById('friendQ')?.value || '').toLowerCase();
    const data = allFriends.filter(f => !q || JSON.stringify(f).toLowerCase().includes(q))
      .slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    if (!data.length) {
      el.innerHTML = `<div class="empty-ios"><div class="ei-ic">${VC.icon('users', 32)}</div><div class="ei-title">No Friends Yet</div><div class="ei-sub">Add people you share loans with or just keep as contacts</div><button type="button" class="btn btn-p" onclick="Friends.openAdd()">Add Friend</button></div>`;
      return;
    }
    el.innerHTML = data.map(f => {
      const loans = (S.loans || []).filter(l => l.status !== 'Settled' && (l.friendId === f.id || (!l.friendId && l.person === f.name)));
      const badge = loans.length ? `<span class="badge b-warn">${loans.length} loan${loans.length > 1 ? 's' : ''}</span>` : '';
      return `<div class="entry"><div class="entry-main"><div class="entry-ic">${VC.icon('user', 18)}</div><div class="entry-body"><div class="entry-name">${escHtml(f.name)}</div><div class="entry-sub">${escHtml(f.phone || '')}${f.notes ? (f.phone ? ' · ' : '') + escHtml(f.notes) : ''}</div><div class="entry-meta">${badge}</div></div><div class="entry-acts">${U.actsEditDel('Friends', f.id)}</div></div></div>`;
    }).join('');
  },
  openAdd() {
    Modal.open('Add Friend', this.form(), `<button type="button" class="btn btn-g" onclick="Modal.close()">Cancel</button><button type="button" class="btn btn-p" onclick="Friends.save()">Save</button>`);
  },
  form(f = {}) {
    return `<div class="fg"><label class="fl">Name *</label><input class="inp" id="ff-name" value="${escAttr(f.name || '')}" placeholder="Full name"></div>
    <div class="fg"><label class="fl">Phone</label><input class="inp" id="ff-phone" value="${escAttr(f.phone || '')}" placeholder="+92 300 ..."></div>
    <div class="fg"><label class="fl">Notes</label><textarea class="inp" id="ff-notes" rows="2">${escAttr(f.notes || '')}</textarea></div>`;
  },
  save(editId = null) {
    const name = document.getElementById('ff-name').value.trim();
    if (!name) { Toast.show('Name required', 'warning'); return; }
    const prev = editId ? (S.friends || []).find(x => x.id === editId) : null;
    const item = { id: editId || U.id(), name, phone: document.getElementById('ff-phone').value.trim(), notes: document.getElementById('ff-notes').value.trim(), createdAt: prev?.createdAt || new Date().toISOString() };
    if (!S.friends) S.friends = [];
    if (editId) {
      S.friends = S.friends.map(x => x.id === editId ? item : x);
      // Keep loan person labels in sync when contact renamed
      if (prev && prev.name !== name) {
        (S.loans || []).forEach(l => {
          if (l.friendId === editId || (!l.friendId && l.person === prev.name)) {
            l.person = name;
            l.friendId = editId;
          }
        });
      }
    } else {
      S.friends.push(item);
      // Attach orphan loans that already use this name
      (S.loans || []).forEach(l => {
        if (!l.friendId && (l.person || '').toLowerCase() === name.toLowerCase()) l.friendId = item.id;
      });
    }
    Activity.log((editId ? 'Edited' : 'Added') + ' friend', name);
    Store.save(); Modal.close(); this.render();
    Toast.show(`${editId ? 'Updated' : 'Added'}: ${name}`, 'success');
  },
  edit(id) {
    const f = (S.friends || []).find(x => x.id === id); if (!f) return;
    Modal.open('Edit Friend', this.form(f), `<button type="button" class="btn btn-g" onclick="Modal.close()">Cancel</button><button type="button" class="btn btn-d btn-sm" onclick="Friends.del('${id}',true)">Delete</button><button type="button" class="btn btn-p" onclick="Friends.save('${id}')">Update</button>`);
  },
  del(id, fm = false) {
    if (!window.__vos_confirm('Move to Trash?')) return;
    const f = (S.friends || []).find(x => x.id === id); if (!f) return;
    S.trash.push({id: U.id(), type: 'friends', data: f, deletedAt: new Date().toISOString()});
    S.friends = (S.friends || []).filter(x => x.id !== id);
    Activity.log('Trashed friend', f.name);
    Store.save(); if (fm) Modal.close(); this.render();
    Toast.show(`Moved to Trash — <button type="button" class="cpbtn" onclick="Trash.restore('${S.trash[S.trash.length-1].id}');this.closest('.toast').remove()">Undo</button>`,'info',6000, true);
  }
};
window.Contacts = Friends;
