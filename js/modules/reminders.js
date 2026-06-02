const Reminders = {
  render() {
    const body = document.getElementById('reminderBody');
    if (!body) return;
    const items = this._collect();
    if (!items.length) {
      body.innerHTML = `<div class="empty-ios"><div class="ei-ic">✅</div><div class="ei-title">All Clear!</div><div class="ei-sub">No upcoming reminders or expiring items. Add cards, documents, loans and vehicles to get alerts.</div></div>`;
      this._badge(0);
      return;
    }
    const urgentCount = items.filter(r => r.daysLeft <= 7).length;
    body.innerHTML = `<div style="font-size:11px;color:var(--text3);padding:0 0 12px;font-weight:600">${items.length} reminder${items.length !== 1 ? 's' : ''} — sorted by urgency${urgentCount ? ` · <span style="color:var(--err)">${urgentCount} urgent</span>` : ''}</div>` +
      items.map(r => {
        const col = r.daysLeft < 0 ? 'var(--err)' : r.daysLeft <= 7 ? 'var(--err)' : r.daysLeft <= 30 ? 'var(--warn)' : 'var(--ok)';
        const badge = r.daysLeft < 0 ? 'b-err' : r.daysLeft <= 7 ? 'b-err' : r.daysLeft <= 30 ? 'b-warn' : 'b-ok';
        const label = r.daysLeft < 0 ? `${Math.abs(r.daysLeft)}d overdue` : r.daysLeft === 0 ? 'Today!' : `${r.daysLeft}d left`;
        return `<div class="entry" style="border-left:3px solid ${col}">
          <div class="entry-main">
            <div class="entry-ic">${r.icon}</div>
            <div class="entry-body">
              <div class="entry-name">${r.title}</div>
              <div class="entry-sub">${r.sub}</div>
              <div class="entry-meta"><span class="badge ${badge}">${label}</span><span class="badge b-muted">${r.category}</span></div>
            </div>
          </div>
        </div>`;
      }).join('');
    this._badge(urgentCount);
  },

  _daysLeft(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d)) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    return Math.round((d - today) / 86400000);
  },

  _cardExpiry(expStr) {
    if (!expStr) return null;
    const parts = expStr.split('/');
    if (parts.length !== 2) return null;
    const m = parseInt(parts[0]), y = parseInt(parts[1]);
    if (isNaN(m) || isNaN(y)) return null;
    const d = new Date(2000 + y, m, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((d - today) / 86400000);
  },

  _collect() {
    const items = [];

    // Cards expiring within 60 days
    (S.cards || []).forEach(c => {
      const days = this._cardExpiry(c.expiry);
      if (days !== null && days < 60) {
        items.push({ icon:'💳', title:`${c.cardName} expiring`, sub:`Expires ${c.expiry} · ${c.network||''}`, daysLeft:days, category:'Card' });
      }
    });

    // Documents expiring within 90 days
    (S.documents || []).forEach(d => {
      if (!d.expiryDate) return;
      const days = this._daysLeft(d.expiryDate);
      if (days !== null && days < 90) {
        const schema = (typeof DOC_SCHEMAS !== 'undefined' && DOC_SCHEMAS[d.docType]) || {};
        const label = schema.label || d.docType || 'Document';
        items.push({ icon: schema.ic || '🪪', title:`${d.holderName ? d.holderName + ' · ' : ''}${label} expiring`, sub:`Expires ${d.expiryDate}`, daysLeft:days, category:'Document' });
      }
    });

    // Loans past due
    (S.loans || []).forEach(l => {
      if (l.status === 'Settled') return;
      const days = this._daysLeft(l.dueDate);
      if (days !== null && days < 0) {
        const dir = l.type === 'borrowed' ? 'You owe' : 'Owed to you';
        items.push({ icon:'🤝', title:`Loan overdue: ${l.person||'Unknown'}`, sub:`${dir} · ${l.currency||''} ${U.fmt(l.amount||0)} · Due ${l.dueDate}`, daysLeft:days, category:'Loan' });
      }
    });

    // Vehicle insurance / registration expiring within 30 days
    (S.vehicles || []).forEach(v => {
      const name = `${v.make} ${v.model}`;
      (v.insurance || []).forEach(ins => {
        if (!ins.expiryDate) return;
        const days = this._daysLeft(ins.expiryDate);
        if (days !== null && days < 30) {
          items.push({ icon:'🛡️', title:`${name} insurance expiring`, sub:`${ins.provider||'Insurer'} · Exp ${ins.expiryDate}`, daysLeft:days, category:'Vehicle' });
        }
      });
      const d = v.documents || {};
      if (d.regExpiry) {
        const days = this._daysLeft(d.regExpiry);
        if (days !== null && days < 30) {
          items.push({ icon:'🚗', title:`${name} registration expiring`, sub:`Reg expires ${d.regExpiry}`, daysLeft:days, category:'Vehicle' });
        }
      }
      if (v.motExpiry) {
        const days = this._daysLeft(v.motExpiry);
        if (days !== null && days < 30) {
          items.push({ icon:'🔧', title:`${name} MOT due`, sub:`MOT expires ${v.motExpiry}${v.regNumber?' · '+v.regNumber:''}`, daysLeft:days, category:'Vehicle' });
        }
      }
      if (v.taxExpiry) {
        const days = this._daysLeft(v.taxExpiry);
        if (days !== null && days < 30) {
          items.push({ icon:'🚘', title:`${name} road tax due`, sub:`Road tax expires ${v.taxExpiry}`, daysLeft:days, category:'Vehicle' });
        }
      }
    });

    // Subscriptions renewing within 7 days
    (S.expenses || []).filter(e => e.active && e.renewalDate).forEach(e => {
      const days = this._daysLeft(e.renewalDate);
      if (days !== null && days < 7) {
        items.push({ icon:e.icon||'🔄', title:`${e.name} renewing soon`, sub:`${e.currency||''} ${e.amount||''}/mo · Renews ${e.renewalDate}`, daysLeft:days, category:'Subscription' });
      }
    });
    // Also check subscription-type assets
    (S.assets || []).filter(a => a.assetType === 'subscription' && a.renewalDate).forEach(a => {
      const days = this._daysLeft(a.renewalDate);
      if (days !== null && days < 7) {
        const sub = SUBS_DB ? (SUBS_DB.find(s => s.n === a.name) || {}) : {};
        items.push({ icon:sub.ic||'🔄', title:`${a.name} renewing soon`, sub:`${a.currency||''} ${U.fmt(a.monthlyCost||0)}/mo · Renews ${a.renewalDate}`, daysLeft:days, category:'Subscription' });
      }
    });

    items.sort((a, b) => a.daysLeft - b.daysLeft);
    return items;
  },

  _badge(count) {
    document.querySelectorAll('[data-pg="reminders"]').forEach(el => {
      let b = el.querySelector('.ni-badge');
      if (count > 0) {
        if (!b) { b = document.createElement('span'); b.className = 'ni-badge'; el.appendChild(b); }
        b.textContent = count;
      } else if (b) {
        b.remove();
      }
    });
  },

  count() {
    return this._collect().filter(r => r.daysLeft <= 7).length;
  },
};
