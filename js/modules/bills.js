'use strict';
/* Bills — upcoming recurring bills (30-day calendar-ish list) */

const Bills = {
  _ensureStore() {
    if (!Array.isArray(S.bills)) S.bills = [];
  },

  _monthlyAmount(item) {
    const a = parseFloat(String(item.amount || 0).replace(/,/g, '')) || 0;
    const freq = String(item.frequency || item.cycle || 'monthly').toLowerCase();
    if (freq.includes('year') || freq.includes('annual')) return a / 12;
    if (freq.includes('week')) return a * 52 / 12;
    if (freq.includes('quarter')) return a / 3;
    if (freq.includes('one') || freq.includes('once')) return 0;
    return a;
  },

  _dueDayFromExpense(e) {
    if (e.dueDay) return Math.min(31, Math.max(1, parseInt(e.dueDay, 10) || 1));
    if (e.renewalDate) {
      const d = new Date(e.renewalDate);
      if (!isNaN(d)) return d.getDate();
    }
    return 1;
  },

  _nextDueDate(dueDay, fromDate) {
    const base = fromDate ? new Date(fromDate) : new Date();
    base.setHours(0, 0, 0, 0);
    let y = base.getFullYear();
    let m = base.getMonth();
    const dim = new Date(y, m + 1, 0).getDate();
    let day = Math.min(dueDay, dim);
    let candidate = new Date(y, m, day);
    if (candidate < base) {
      m += 1;
      if (m > 11) { m = 0; y += 1; }
      const dim2 = new Date(y, m + 1, 0).getDate();
      day = Math.min(dueDay, dim2);
      candidate = new Date(y, m, day);
    }
    return candidate;
  },

  _collectUpcoming(days) {
    this._ensureStore();
    const horizon = days || 30;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(today.getTime() + horizon * 86400000);
    const items = [];

    (S.expenses || []).filter(e => e.active !== false).forEach(e => {
      const amt = this._monthlyAmount(e);
      if (amt <= 0 && !e.renewalDate) return;
      const dueDay = this._dueDayFromExpense(e);
      let due = e.renewalDate ? new Date(e.renewalDate) : this._nextDueDate(dueDay, today);
      due.setHours(0, 0, 0, 0);
      if (due < today) due = this._nextDueDate(dueDay, today);
      if (due > end) return;
      items.push({
        id: e.id,
        source: 'expense',
        name: e.name,
        amount: parseFloat(String(e.amount || 0).replace(/,/g, '')) || amt,
        currency: e.currency || S.user.currency || 'PKR',
        due,
        dueDay,
        category: e.category || 'Expense',
        icon: e.icon || 'repeat',
      });
    });

    S.bills.forEach(b => {
      const dueDay = Math.min(31, Math.max(1, parseInt(b.dueDay, 10) || 1));
      const due = this._nextDueDate(dueDay, today);
      if (due > end) return;
      items.push({
        id: b.id,
        source: 'bill',
        name: b.name,
        amount: parseFloat(String(b.amount || 0).replace(/,/g, '')) || 0,
        currency: b.currency || S.user.currency || 'PKR',
        due,
        dueDay,
        category: b.category || 'Bill',
        icon: 'calendar',
      });
    });

    return items.sort((a, b) => a.due - b.due);
  },

  renderWidget() {
    const upcoming = this._collectUpcoming(30).slice(0, 5);
    const userCur = S.user.currency || 'PKR';
    if (!upcoming.length) {
      return '<div class="widget"><div class="wh"><span class="vc-icon-wrap">' + (typeof VC !== 'undefined' ? VC.icon('calendar', 16) : '') + '</span>Bills<button type="button" class="btn btn-g btn-sm wh-act" onclick="Bills.openAdd()">+ Add</button></div>'
        + '<div style="padding:12px 14px;font-size:12px;color:var(--text3)">No bills due in 30 days. Add one or set expense renewal dates.</div></div>';
    }
    const rows = upcoming.map(b => {
      const daysLeft = Math.round((b.due - new Date().setHours(0, 0, 0, 0)) / 86400000);
      const amtStr = (typeof U !== 'undefined' ? U.fmt(b.amount) : b.amount) + ' ' + escHtml(b.currency || userCur);
      return '<div style="display:flex;justify-content:space-between;gap:8px;padding:8px 0;border-bottom:1px solid var(--border)"><div style="min-width:0"><div style="font-size:13px;font-weight:600;color:var(--text)">' + escHtml(b.name) + '</div><div style="font-size:11px;color:var(--text3)">' + (daysLeft <= 0 ? 'Due today' : daysLeft + 'd') + '</div></div><div style="font-size:12px;font-weight:700;color:var(--accent);white-space:nowrap" class="sens">' + amtStr + '</div></div>';
    }).join('');
    return '<div class="widget"><div class="wh"><span class="vc-icon-wrap">' + (typeof VC !== 'undefined' ? VC.icon('calendar', 16) : '') + '</span>Upcoming Bills<button type="button" class="btn btn-g btn-sm wh-act" onclick="Bills.openAdd()">+ Add</button></div><div style="padding:4px 14px 10px">' + rows + '</div></div>';
  },

  render() {
    const el = document.getElementById('billsWidget') || document.getElementById('pg-bills-body');
    if (!el) return;

    const upcoming = this._collectUpcoming(30);
    const userCur = S.user.currency || 'PKR';
    const monthTotal = upcoming.reduce((sum, b) => {
      const pkr = typeof CurrencyEngine !== 'undefined'
        ? CurrencyEngine.toBase(b.amount, b.currency)
        : b.amount;
      return sum + pkr;
    }, 0);
    const monthDisp = typeof CurrencyEngine !== 'undefined'
      ? CurrencyEngine.fromBase(monthTotal, userCur)
      : monthTotal;

    if (!upcoming.length) {
      el.innerHTML = '<div class="empty-ios"><div class="ei-ic">' + (typeof VC !== 'undefined' ? VC.icon('calendar', 32) : '') + '</div>'
        + '<div class="ei-title">No bills in next 30 days</div>'
        + '<div class="ei-sub">Add recurring expenses with renewal dates, or create a bill manually.</div>'
        + '<button type="button" class="btn btn-p" style="margin-top:14px" onclick="Bills.openAdd()">+ Add Bill</button></div>';
      return;
    }

    const byWeek = {};
    upcoming.forEach(b => {
      const key = b.due.toISOString().slice(0, 10);
      if (!byWeek[key]) byWeek[key] = [];
      byWeek[key].push(b);
    });

    let listHtml = '';
    Object.keys(byWeek).sort().forEach(dateKey => {
      const d = new Date(dateKey + 'T12:00:00');
      const label = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      const daysLeft = Math.round((d - new Date().setHours(0, 0, 0, 0)) / 86400000);
      const badge = daysLeft <= 0 ? 'b-err' : daysLeft <= 7 ? 'b-warn' : 'b-muted';
      listHtml += '<div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--text3);padding:12px 0 6px">' + escHtml(label) + '</div>';
      byWeek[dateKey].forEach(b => {
        const amtStr = escHtml(b.currency) + ' ' + (typeof U !== 'undefined' ? U.fmt(b.amount) : b.amount);
        listHtml += '<div class="entry"><div class="entry-main"><div class="entry-ic">' + (typeof VC !== 'undefined' ? VC.expenseIcon(b.icon, 18) : '') + '</div>'
          + '<div class="entry-body"><div class="entry-name">' + escHtml(b.name) + '</div>'
          + '<div class="entry-sub">' + escHtml(b.category) + (b.source === 'expense' ? ' · from Expenses' : '') + '</div>'
          + '<div class="entry-meta"><span class="badge b-acc">' + amtStr + '</span>'
          + '<span class="badge ' + badge + '">' + (daysLeft <= 0 ? 'Due' : daysLeft + 'd') + '</span></div></div>'
          + (b.source === 'bill' ? '<div class="entry-acts">' + U.actsEditDel('Bills', b.id) + '</div>' : '')
          + '</div></div>';
      });
    });

    el.innerHTML = '<div class="widget" style="margin-bottom:12px"><div class="wh"><span class="vc-icon-wrap">' + (typeof VC !== 'undefined' ? VC.icon('calendar', 16) : '') + '</span>Upcoming Bills (30 days)</div>'
      + '<div style="padding:12px 14px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">'
      + '<div><div style="font-size:10px;color:var(--text3)">Due this month</div>'
      + '<div style="font-size:20px;font-weight:900;color:var(--accent)">' + (typeof U !== 'undefined' ? U.fmt(Math.round(monthDisp)) : monthDisp) + ' <span style="font-size:12px;font-weight:400;color:var(--text3)">' + escHtml(userCur) + '</span></div></div>'
      + '<button type="button" class="btn btn-p btn-sm" onclick="Bills.openAdd()">+ Add</button></div>'
      + '<div style="padding:0 14px 14px">' + listHtml + '</div></div>';
  },

  openAdd() {
    if (typeof Modal === 'undefined') return;
    Modal.open('Add Bill',
      '<div class="fg"><label class="fl">Name *</label><input class="inp" id="bill-name" placeholder="Rent, Electricity, Insurance…"></div>'
      + '<div class="fr"><div class="fg"><label class="fl">Amount</label><input class="inp num-inp" id="bill-amt" inputmode="decimal" placeholder="0"></div>'
      + '<div class="fg"><label class="fl">Currency</label><select class="inp" id="bill-cur">' + U.currencies() + '</select></div></div>'
      + '<div class="fr"><div class="fg"><label class="fl">Due day (1–31)</label><input class="inp" id="bill-day" type="number" min="1" max="31" value="1"></div>'
      + '<div class="fg"><label class="fl">Category</label><input class="inp" id="bill-cat" placeholder="Utilities, Rent…"></div></div>',
      '<button type="button" class="btn btn-g" onclick="Modal.close()">Cancel</button>'
      + '<button type="button" class="btn btn-p" onclick="Bills.save()">Save</button>');
    setTimeout(() => {
      const c = document.getElementById('bill-cur');
      if (c) c.value = S.user.currency || 'PKR';
      document.getElementById('bill-name')?.focus();
    }, 60);
  },

  save(editId) {
    this._ensureStore();
    const name = document.getElementById('bill-name')?.value?.trim();
    if (!name) { Toast.show('Name required', 'warning'); return; }
    const item = {
      id: editId || U.id(),
      name,
      amount: parseFloat((document.getElementById('bill-amt')?.value || '').replace(/,/g, '')) || 0,
      currency: document.getElementById('bill-cur')?.value || S.user.currency || 'PKR',
      dueDay: Math.min(31, Math.max(1, parseInt(document.getElementById('bill-day')?.value, 10) || 1)),
      category: document.getElementById('bill-cat')?.value?.trim() || 'Bill',
      createdAt: editId ? (S.bills.find(x => x.id === editId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
    };
    if (editId) S.bills = S.bills.map(x => x.id === editId ? item : x);
    else S.bills.push(item);
    Store.save();
    Modal.close();
    this.render();
    Toast.show((editId ? 'Updated' : 'Added') + ': ' + name, 'success');
  },

  edit(id) {
    const b = S.bills.find(x => x.id === id);
    if (!b) return;
    this.openAdd();
    setTimeout(() => {
      document.getElementById('bill-name').value = b.name || '';
      document.getElementById('bill-amt').value = b.amount || '';
      document.getElementById('bill-cur').value = b.currency || S.user.currency || 'PKR';
      document.getElementById('bill-day').value = b.dueDay || 1;
      document.getElementById('bill-cat').value = b.category || '';
      const foot = document.getElementById('mFoot');
      if (foot) {
        foot.innerHTML = '<button type="button" class="btn btn-g" onclick="Modal.close()">Cancel</button>'
          + '<button type="button" class="btn btn-d btn-sm" onclick="Bills.del(\'' + id + '\',true)">Delete</button>'
          + '<button type="button" class="btn btn-p" onclick="Bills.save(\'' + id + '\')">Update</button>';
      }
    }, 80);
  },

  del(id, fromModal) {
    if (!window.__vos_confirm('Delete this bill?')) return;
    S.bills = (S.bills || []).filter(x => x.id !== id);
    Store.save();
    if (fromModal && typeof Modal !== 'undefined') Modal.close();
    this.render();
    Toast.show('Bill removed', 'info');
  },
};

window.Bills = Bills;
