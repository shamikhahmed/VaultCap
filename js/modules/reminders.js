const Reminders = {
  render() {
    const body = document.getElementById('reminderBody');
    if (!body) return;
    const notifBanner = ('Notification' in window && Notification.permission === 'default')
      ? `<button onclick="Reminders.requestPermission().then(()=>Reminders.render())" class="btn btn-g" style="width:100%;margin-bottom:14px">🔔 Enable Notifications</button>`
      : '';
    const items = this._collect();

    const groups = [
      { key: 'overdue', label: '🔴 Overdue',   filter: function(r) { return r.daysLeft < 0; } },
      { key: 'week',    label: '🟠 This Week',  filter: function(r) { return r.daysLeft >= 0 && r.daysLeft <= 7; } },
      { key: 'month',   label: '🟡 This Month', filter: function(r) { return r.daysLeft > 7 && r.daysLeft <= 30; } },
      { key: 'later',   label: '🟢 Later',      filter: function(r) { return r.daysLeft > 30; } },
    ];

    let html = notifBanner;
    let totalCount = 0;

    groups.forEach(function(group) {
      const groupItems = items.filter(group.filter);
      if (!groupItems.length) return;
      totalCount += groupItems.length;
      html += '<div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);padding:14px 0 6px">' + group.label + '</div>';
      html += groupItems.map(function(r) {
        const badge = r.daysLeft < 0 ? 'b-err' : r.daysLeft <= 7 ? 'b-err' : r.daysLeft <= 30 ? 'b-warn' : 'b-ok';
        const col = r.daysLeft < 0 ? 'var(--err)' : r.daysLeft <= 7 ? 'var(--err)' : r.daysLeft <= 30 ? 'var(--warn)' : 'var(--ok)';
        const daysLabel = r.daysLeft < 0 ? Math.abs(r.daysLeft) + 'd overdue' : r.daysLeft === 0 ? 'Today' : r.daysLeft + 'd left';
        return '<div class="entry" style="border-left:3px solid ' + col + '">' +
          '<div class="entry-main">' +
            '<div class="entry-ic">' + (r.icon || '⚠️') + '</div>' +
            '<div class="entry-body">' +
              '<div class="entry-name">' + (r.title || r.label || '') + '</div>' +
              '<div class="entry-sub">' + (r.sub || '') + '</div>' +
              '<div class="entry-meta"><span class="badge ' + badge + '">' + daysLabel + '</span><span class="badge b-muted">' + (r.category || '') + '</span></div>' +
            '</div>' +
            (r.page ? '<button class="icb" onclick="R.goto(\'' + r.page + '\')" title="Go to">›</button>' : '') +
          '</div>' +
        '</div>';
      }).join('');
    });

    if (totalCount === 0) {
      html += '<div class="empty-ios"><div class="ei-ic">✅</div><div class="ei-title">All Clear!</div><div class="ei-sub">No upcoming reminders or expiring items.</div></div>';
    }

    body.innerHTML = html;
    this._badge(items.filter(function(r) { return r.daysLeft <= 7; }).length);
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
      const name = v.make ? (v.make + ' ' + (v.model || '')).trim() : (v.nickname || 'Vehicle');
      // Insurance — array format
      (v.insurance || []).forEach(ins => {
        if (!ins.expiryDate) return;
        const days = this._daysLeft(ins.expiryDate);
        if (days !== null && days < 30) {
          items.push({ icon:'🛡️', title:`${name} insurance expiring`, sub:`${ins.provider||'Insurer'} · Exp ${ins.expiryDate}`, daysLeft:days, category:'Vehicle', page:'vehicles' });
        }
      });
      // Insurance — flat field
      if (v.insuranceExpiry) {
        const days = this._daysLeft(v.insuranceExpiry);
        if (days !== null && days <= 30) {
          items.push({ icon:'🛡️', title:`${name} — Insurance`, sub:`Expires ${new Date(v.insuranceExpiry).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}`, daysLeft:days, category:'Vehicle', page:'vehicles' });
        }
      }
      const d = v.documents || {};
      if (d.regExpiry) {
        const days = this._daysLeft(d.regExpiry);
        if (days !== null && days < 30) {
          items.push({ icon:'🚗', title:`${name} registration expiring`, sub:`Reg expires ${d.regExpiry}`, daysLeft:days, category:'Vehicle', page:'vehicles' });
        }
      }
      // MOT — explicit expiry (60-day window)
      if (v.motExpiry) {
        const days = this._daysLeft(v.motExpiry);
        if (days !== null && days <= 60) {
          items.push({ icon:'🔧', title:`${name} MOT due`, sub:`MOT expires ${v.motExpiry}${v.regNumber?' · '+v.regNumber:''}`, daysLeft:days, category:'Vehicle', page:'vehicles' });
        }
      } else if (v.motDate) {
        // Fallback: MOT lasts 12 months from test date
        const motExp = new Date(v.motDate);
        motExp.setFullYear(motExp.getFullYear() + 1);
        const days = this._daysLeft(motExp.toISOString());
        if (days !== null && days <= 60) {
          items.push({ icon:'🚗', title:`${name} — MOT`, sub:`Due ${motExp.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}`, daysLeft:days, category:'Vehicle', page:'vehicles' });
        }
      }
      // Road tax — taxExpiry or taxDue
      const taxField = v.taxExpiry || v.taxDue;
      if (taxField) {
        const days = this._daysLeft(taxField);
        if (days !== null && days <= 30) {
          items.push({ icon:'📋', title:`${name} road tax due`, sub:`Road tax expires ${taxField}`, daysLeft:days, category:'Vehicle', page:'vehicles' });
        }
      }
    });

    // SIM cards — contract/expiry within 30 days
    (S.sims || []).forEach(function(sim) {
      const expField = sim.contractEnd || sim.expiryDate || sim.renewalDate;
      if (!expField) return;
      const days = Reminders._daysLeft(expField);
      if (days !== null && days <= 30) {
        items.push({
          icon: '📱',
          title: (sim.network || 'SIM') + ' — Contract ending',
          sub: 'Expires ' + new Date(expField).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'}),
          daysLeft: days,
          page: 'sims',
          category: 'SIM',
        });
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

    // BC committee payments
    (S.bc || []).forEach(function(bc) {
      if (!bc.paymentDay) return;
      const daysToPayment = typeof BCModule !== 'undefined' ? BCModule._daysToPaymentDay(bc.paymentDay) : null;
      if (daysToPayment === null) return;
      items.push({
        icon: '🤝',
        title: (bc.name || 'BC') + ' payment',
        sub: (bc.currency || 'PKR') + ' ' + (bc.contribution || 0).toLocaleString() + ' due',
        daysLeft: daysToPayment,
        page: 'bc',
        category: 'BC',
      });
    });

    // Prize bond draws
    (S.bonds || []).forEach(function(b) {
      if (typeof BondsModule === 'undefined') return;
      const type = BondsModule._getType ? BondsModule._getType(b.typeId) : null;
      if (!type || !type.drawMonths || !type.drawMonths.length) return;
      const now = new Date();
      const month = now.getMonth() + 1;
      const nextDrawMonth = type.drawMonths.find(function(m) { return m >= month; }) || type.drawMonths[0];
      const nextDrawYear = nextDrawMonth >= month ? now.getFullYear() : now.getFullYear() + 1;
      const drawDate = new Date(nextDrawYear, nextDrawMonth - 1, 15);
      const daysLeft = Math.ceil((drawDate.getTime() - now.getTime()) / 86400000);
      if (daysLeft <= 30) {
        items.push({
          icon: '🎫',
          title: b.name || 'Prize Bond Draw',
          sub: 'Draw date approaching',
          daysLeft: daysLeft,
          page: 'bonds',
          category: 'Bonds',
        });
      }
    });

    // Credit score — remind to check every 30 days
    try {
      const cs = JSON.parse(localStorage.getItem('vo_credit_score') || '{}');
      if (cs.lastChecked) {
        const daysSince = Math.floor((Date.now() - new Date(cs.lastChecked).getTime()) / 86400000);
        if (daysSince >= 30) {
          items.push({
            icon: '📊',
            title: 'Check Credit Score',
            sub: 'Last checked ' + daysSince + ' days ago',
            daysLeft: -(daysSince - 30),
            page: 'credit',
            category: 'Credit',
          });
        }
      }
    } catch(e) {}

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

  async requestPermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  },

  checkAndNotify() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const now = Date.now();
    const in7 = now + 7 * 24 * 60 * 60 * 1000;
    const items = [];

    (S.documents || []).forEach(function(d) {
      if (!d.expiryDate) return;
      const exp = new Date(d.expiryDate).getTime();
      if (exp > now && exp < in7) {
        const days = Math.ceil((exp - now) / 86400000);
        items.push({ title: d.holderName ? d.holderName + ' · ' + (d.docType||'Document') : (d.docType||'Document'), days: days, type: 'document' });
      }
    });

    (S.cards || []).forEach(function(c) {
      if (!c.expiry) return;
      try {
        const parts = c.expiry.split('/');
        const exp = new Date(2000 + parseInt(parts[1]), parseInt(parts[0]), 0).getTime();
        if (exp > now && exp < in7 + 23 * 24 * 60 * 60 * 1000) {
          const days = Math.ceil((exp - now) / 86400000);
          items.push({ title: c.cardName || 'Card', days: days, type: 'card' });
        }
      } catch(e) {}
    });

    (S.loans || []).forEach(function(l) {
      if (!l.dueDate || l.status === 'Settled') return;
      const exp = new Date(l.dueDate).getTime();
      if (exp > now && exp < in7) {
        const days = Math.ceil((exp - now) / 86400000);
        items.push({ title: 'Loan with ' + (l.person || 'contact'), days: days, type: 'loan' });
      }
    });

    (S.bc || []).forEach(function(bc) {
      if (!bc.paymentDay) return;
      const daysToPayment = typeof BCModule !== 'undefined' ? BCModule._daysToPaymentDay(bc.paymentDay) : null;
      if (daysToPayment !== null && daysToPayment <= 3) {
        items.push({ title: (bc.name || 'BC') + ' payment due', days: daysToPayment, type: 'bc' });
      }
    });

    const icons = { document: '🪪', card: '💳', loan: '🤝', bc: '🤝', vehicle: '🚗' };
    items.slice(0, 3).forEach(function(item) {
      try {
        new Notification('VaultOS Alert', {
          body: (icons[item.type] || '⚠️') + ' ' + item.title + ' — ' + (item.days === 0 ? 'today' : 'in ' + item.days + ' day' + (item.days > 1 ? 's' : '')),
          icon: '/icons/icon-192.png',
          tag: 'vaultos-' + item.type + '-' + item.title,
          silent: false,
        });
      } catch(e) {}
    });
  },
};
