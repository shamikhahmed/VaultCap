const Trash = {
  render() {
    const el = document.getElementById('trashBody'); if (!el) return;
    const items = (S.trash || []).sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
    if (!items.length) {
      el.innerHTML = `<div class="empty"><div class="empty-ic">🗑️</div><h3>Trash is empty</h3><p>Deleted items appear here for 30 days. Tap Restore to recover them.</p></div>`;
      return;
    }
    const typeIc = { banks:'🏦', cards:'💳', investments:'📈', cash:'💵', sims:'📱', assets:'🏠', expenses:'📋', friends:'👥', emails:'📧', gadgets:'💻', digital:'💼', loans:'🤝', vehicles:'🚗' };
    const grouped = {};
    items.forEach(i => { (grouped[i.type] = grouped[i.type] || []).push(i); });
    const age = iso => {
      const d = Math.floor((Date.now() - new Date(iso)) / 86400000);
      return d === 0 ? 'today' : d === 1 ? 'yesterday' : d + ' days ago';
    };
    const daysLeft = iso => {
      const d = Math.floor((Date.now() - new Date(iso)) / 86400000);
      const left = 30 - d;
      if (left <= 0) return '<span style="color:var(--err);font-size:10px;font-weight:700">Expiring now</span>';
      if (left <= 7) return `<span style="color:var(--err);font-size:10px;font-weight:700">${left}d left</span>`;
      if (left <= 14) return `<span style="color:var(--warn);font-size:10px">${left}d left</span>`;
      return `<span style="color:var(--text3);font-size:10px">${left}d left</span>`;
    };
    const emptyBtn = `<div style="padding:0 0 14px"><button class="btn btn-d btn-sm" onclick="Trash.emptyAll()">🗑️ Empty Trash</button></div>`;
    el.innerHTML = emptyBtn + Object.entries(grouped).map(([type, arr]) => `
      <div class="sdiv">${typeIc[type] || '📦'} ${type.charAt(0).toUpperCase() + type.slice(1)} <span style="font-weight:400;color:var(--text3)">(${arr.length})</span></div>
      ${arr.map(item => {
        const label = item.data?.bankName || item.data?.cardName || item.data?.investmentName || item.data?.network || item.data?.name || item.data?.serviceName || item.data?.email || item.id;
        return `<div class="entry">
          <div class="entry-main">
            <div class="entry-ic">${typeIc[item.type] || '📦'}</div>
            <div class="entry-body">
              <div class="entry-name">${label}</div>
              <div class="entry-sub">Deleted ${age(item.deletedAt)} · ${daysLeft(item.deletedAt)}</div>
            </div>
            <div class="entry-acts">
              <button class="icb" onclick="Trash.restore('${item.id}')" title="Restore">↩️</button>
              <button class="icb del" onclick="Trash.purge('${item.id}')" title="Delete permanently">✕</button>
            </div>
          </div>
        </div>`;
      }).join('')}
    `).join('');
  },
  restore(trashId) {
    const idx = (S.trash || []).findIndex(x => x.id === trashId);
    if (idx < 0) return;
    const item = S.trash[idx];
    if (Array.isArray(S[item.type])) {
      // Restore: remove from trash, add back to module
      S[item.type].push(item.data);
    }
    S.trash.splice(idx, 1);
    Store.save();
    this.render();
    Toast.show('Restored', 'success');
  },
  purge(trashId) {
    if (!window.__vos_confirm('Permanently delete this item?')) return;
    S.trash = (S.trash || []).filter(x => x.id !== trashId);
    Store.save(); this.render();
    Toast.show('Permanently deleted', 'info');
  },
  emptyAll() {
    if (!window.__vos_confirm('Permanently delete all items in Trash?')) return;
    S.trash = [];
    Store.save(); this.render();
    Toast.show('Trash emptied', 'info');
  }
};
