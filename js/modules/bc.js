'use strict';
// VaultOS BC (Committee/ROSCA) Module — © 2026 Shamikh Ahmed
const BCModule = {

  TYPES: {
    ballot: 'Ballot Draw (Random)',
    fixed: 'Fixed Order (Pre-agreed)',
    bid: 'Bid-based (Premium)',
    auto: 'Auto-deduction',
  },

  ROLES: {
    organiser: 'Organiser',
    participant: 'Participant',
  },

  render() {
    const el = document.getElementById('pg-bc-body');
    if (!el) return;
    const bcs = S.bc || [];

    const totalCommitted = bcs.reduce((sum, bc) => {
      const paid = (bc.currentRound || 1) * (bc.contribution || 0);
      return sum + (typeof RatesEngine !== 'undefined'
        ? RatesEngine.convert(paid, bc.currency || 'PKR', S.user.currency || 'PKR')
        : paid);
    }, 0);

    const totalReceived = bcs.reduce((sum, bc) => {
      if (!bc.myTurnRound || bc.currentRound < bc.myTurnRound) return sum;
      const received = (bc.members || 1) * (bc.contribution || 0);
      return sum + (typeof RatesEngine !== 'undefined'
        ? RatesEngine.convert(received, bc.currency || 'PKR', S.user.currency || 'PKR')
        : received);
    }, 0);

    const fmt = n => (S.user.currency || 'PKR') + ' ' + Math.round(n).toLocaleString();

    el.innerHTML =
      '<div style="padding:16px;display:flex;flex-direction:column;gap:14px">' +

      (bcs.length > 0 ? (
        '<div style="background:linear-gradient(135deg,rgba(91,141,238,.15),rgba(91,141,238,.05));border:1px solid rgba(91,141,238,.25);border-radius:16px;padding:16px">' +
          '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);margin-bottom:10px">BC Summary</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
            '<div style="text-align:center"><div style="font-size:11px;color:var(--text3)">Total Paid In</div><div style="font-size:20px;font-weight:900;color:var(--text)">' + fmt(totalCommitted) + '</div></div>' +
            '<div style="text-align:center"><div style="font-size:11px;color:var(--text3)">Total Received</div><div style="font-size:20px;font-weight:900;color:var(--ok)">' + fmt(totalReceived) + '</div></div>' +
          '</div>' +
          '<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);font-size:12px;color:var(--text3)">Net position: <strong style="color:' + (totalReceived - totalCommitted >= 0 ? 'var(--ok)' : 'var(--err)') + '">' + fmt(totalReceived - totalCommitted) + '</strong></div>' +
        '</div>'
      ) : '') +

      '<button type="button" class="btn btn-p" style="width:100%" onclick="BCModule.openAdd()">+ Join / Create a BC</button>' +

      (bcs.length === 0 ?
        '<div class="empty-ios"><div class="ei-ic">🤝</div><div class="ei-title">No committees yet</div><div class="ei-sub">Track your BC (ballot committees), pardner schemes, jamiya, susu — rotating savings groups across PK, UK, UAE</div></div>'
        :
        bcs.map((bc, i) => BCModule._bcCard(bc, i)).join('')
      ) +

      '<div style="background:rgba(76,175,80,.06);border:1px solid rgba(76,175,80,.15);border-radius:12px;padding:12px">' +
        '<div style="font-size:11px;font-weight:700;color:var(--ok);margin-bottom:4px">🌙 Zakat Note</div>' +
        '<div style="font-size:11px;color:var(--text3);line-height:1.6">Money paid into a BC that you haven\'t received yet is zakatable as a receivable (you still own it). This is auto-added to your Zakat calculator.</div>' +
      '</div>' +

      '</div>';
  },

  _bcCard(bc, i) {
    const cur = bc.currency || 'PKR';
    const displayCur = (S.user && S.user.currency) || 'PKR';
    const fmt = n => {
      if (typeof RatesEngine !== 'undefined' && cur !== displayCur) {
        return displayCur + ' ' + Math.round(RatesEngine.convert(n, cur, displayCur)).toLocaleString();
      }
      return cur + ' ' + Math.round(n).toLocaleString();
    };
    const pot = (bc.members || 1) * (bc.contribution || 0);
    const myTurnDone = bc.myTurnRound && (bc.currentRound || 1) >= bc.myTurnRound;
    const myTurnNext = bc.myTurnRound && (bc.currentRound || 1) === bc.myTurnRound - 1;
    const daysToNext = bc.paymentDay ? BCModule._daysToPaymentDay(bc.paymentDay) : null;
    const progress = Math.round(((bc.currentRound || 1) / (bc.totalRounds || bc.members || 1)) * 100);

    const statusColor = myTurnDone ? 'var(--ok)' : myTurnNext ? 'var(--warn)' : 'var(--accent)';
    const statusText = myTurnDone ? '✓ Turn complete' : myTurnNext ? '🔔 Your turn next!' : bc.myTurnRound ? 'Turn: Round ' + bc.myTurnRound : 'Turn: TBD';

    return '<div class="entry" style="flex-direction:column;align-items:stretch">' +
      '<div class="entry-main">' +
        '<div class="entry-ic" style="background:rgba(91,141,238,.15);font-size:20px">🤝</div>' +
        '<div class="entry-body">' +
          '<div class="entry-name">' + escHtml(bc.name || 'BC') + '</div>' +
          '<div class="entry-sub">' + escHtml(BCModule.TYPES[bc.type] || bc.type || 'Ballot') + ' · ' + escHtml(String(bc.members || '?')) + ' members · ' + fmt(bc.contribution || 0) + '/round</div>' +
          '<div class="entry-meta">' +
            '<span class="badge b-acc">' + fmt(pot) + ' pot</span>' +
            '<span class="badge" style="background:rgba(91,141,238,.1);color:' + statusColor + '">' + statusText + '</span>' +
            (bc.role === 'organiser' ? '<span class="badge b-warn">Organiser</span>' : '') +
            (bc.type === 'bid' ? '<span class="badge b-warn">⚠️ Bid-based</span>' : '') +
          '</div>' +
        '</div>' +
        '<div class="entry-acts">' +
          '<button type="button" class="icb" aria-label="View details" onclick="BCModule.openDetail(' + i + ')">👁️</button>' +
          '<button type="button" class="icb" aria-label="Edit" onclick="BCModule.edit(' + i + ')">✏️</button>' +
          '<button type="button" class="icb del" aria-label="Delete" onclick="BCModule.del(' + i + ')">🗑️</button>' +
        '</div>' +
      '</div>' +
      '<div style="padding:0 14px 12px">' +
        '<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3);margin-bottom:4px">' +
          '<span>Round ' + (bc.currentRound || 1) + ' of ' + (bc.totalRounds || bc.members || '?') + '</span>' +
          '<span>' + progress + '% complete</span>' +
        '</div>' +
        '<div style="height:4px;background:var(--border);border-radius:999px"><div style="height:100%;width:' + progress + '%;background:var(--accent);border-radius:999px;transition:width .5s"></div></div>' +
        (daysToNext !== null ? '<div style="font-size:10px;color:var(--text3);margin-top:4px">Next payment: ' + (daysToNext === 0 ? 'Today' : daysToNext + ' days') + '</div>' : '') +
      '</div>' +
    '</div>';
  },

  _daysToPaymentDay(day) {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), day);
    if (thisMonth >= today) return Math.ceil((thisMonth - today) / 86400000);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, day);
    return Math.ceil((nextMonth - today) / 86400000);
  },

  openAdd(editIdx) {
    const bc = editIdx != null ? (S.bc || [])[editIdx] : {};
    const cur = S.user.currency || 'PKR';
    Modal.open(editIdx != null ? '✏️ Edit BC' : '🤝 Join / Create a BC',
      '<div class="fg"><label class="fl">BC Name</label>' +
        '<input class="inp" id="bc-name" value="' + (bc.name || '') + '" placeholder="e.g. Family BC, Office Committee 2026"></div>' +

      '<div class="fr">' +
        '<div class="fg"><label class="fl">Your Role</label>' +
          '<select class="inp" id="bc-role">' +
            '<option value="participant"' + (bc.role !== 'organiser' ? ' selected' : '') + '>Participant</option>' +
            '<option value="organiser"' + (bc.role === 'organiser' ? ' selected' : '') + '>Organiser</option>' +
          '</select></div>' +
        '<div class="fg"><label class="fl">BC Type</label>' +
          '<select class="inp" id="bc-type" onchange="BCModule._onTypeChange()">' +
            Object.entries(BCModule.TYPES).map(function(e) {
              return '<option value="' + e[0] + '"' + (bc.type === e[0] ? ' selected' : '') + '>' + e[1] + '</option>';
            }).join('') +
          '</select></div>' +
      '</div>' +

      '<div id="bc-bid-warning" style="display:' + (bc.type === 'bid' ? 'block' : 'none') + ';background:rgba(255,152,0,.1);border:1px solid rgba(255,152,0,.3);border-radius:10px;padding:10px;margin-bottom:10px;font-size:11px;color:var(--warn)">⚠️ Bid-based BCs are considered impermissible by many scholars (resembles riba). Consider using a fixed-order BC instead.</div>' +

      '<div class="fr">' +
        '<div class="fg"><label class="fl">Total Members</label>' +
          '<input class="inp num-inp" type="number" id="bc-members" min="2" value="' + (bc.members || '') + '" placeholder="e.g. 10" oninput="BCModule._updatePot()"></div>' +
        '<div class="fg"><label class="fl">Contribution/Round</label>' +
          '<input class="inp num-inp" type="text" inputmode="decimal" pattern="[0-9,\\.]*" id="bc-contribution" value="' + (bc.contribution || '') + '" placeholder="e.g. 10,000" oninput="BCModule._updatePot()"></div>' +
      '</div>' +

      '<div class="fr">' +
        '<div class="fg"><label class="fl">Currency</label>' +
          '<select class="inp" id="bc-currency">' +
            ['PKR','GBP','AED','USD','SAR','QAR','EUR'].map(function(c) {
              return '<option value="' + c + '"' + ((bc.currency || cur) === c ? ' selected' : '') + '>' + c + '</option>';
            }).join('') +
          '</select></div>' +
        '<div class="fg"><label class="fl">Frequency</label>' +
          '<select class="inp" id="bc-freq">' +
            '<option value="monthly"' + ((bc.frequency || 'monthly') === 'monthly' ? ' selected' : '') + '>Monthly</option>' +
            '<option value="weekly"' + (bc.frequency === 'weekly' ? ' selected' : '') + '>Weekly</option>' +
            '<option value="bimonthly"' + (bc.frequency === 'bimonthly' ? ' selected' : '') + '>Every 2 months</option>' +
          '</select></div>' +
      '</div>' +

      '<div id="bc-pot-display" style="background:rgba(91,141,238,.08);border:1px solid rgba(91,141,238,.2);border-radius:10px;padding:10px;text-align:center;margin-bottom:10px;font-size:13px;color:var(--accent);font-weight:700">Pot: Enter members and contribution</div>' +

      '<div class="fr">' +
        '<div class="fg"><label class="fl">My Turn (Round #)</label>' +
          '<input class="inp num-inp" type="number" id="bc-myturn" min="1" value="' + (bc.myTurnRound || '') + '" placeholder="Leave blank if not drawn yet"></div>' +
        '<div class="fg"><label class="fl">Current Round</label>' +
          '<input class="inp num-inp" type="number" id="bc-current" min="1" value="' + (bc.currentRound || 1) + '" placeholder="1"></div>' +
      '</div>' +

      '<div class="fr">' +
        '<div class="fg"><label class="fl">Start Date</label>' +
          '<input class="inp" type="date" id="bc-start" value="' + (bc.startDate || '') + '"></div>' +
        '<div class="fg"><label class="fl">Payment Day of Month</label>' +
          '<input class="inp num-inp" type="number" id="bc-payday" min="1" max="28" value="' + (bc.paymentDay || '') + '" placeholder="e.g. 1"></div>' +
      '</div>' +

      '<div class="fg"><label class="fl">Organiser / Contact (optional)</label>' +
        (typeof familyOrganiserDatalistHtml === 'function' ? familyOrganiserDatalistHtml() : '') +
        '<input class="inp" id="bc-organiser" value="' + (bc.organiser || '') + '" list="bcOrgDL" placeholder="Name or phone number"></div>' +

      '<div class="fg"><label class="fl">Notes</label>' +
        '<textarea class="inp" id="bc-notes" rows="2">' + (bc.notes || '') + '</textarea></div>' +

      '<div style="background:rgba(76,175,80,.06);border:1px solid rgba(76,175,80,.15);border-radius:10px;padding:10px;font-size:11px;color:var(--text3)">💡 Your BC payments are tracked as zakatable receivables in the Zakat calculator</div>',

      '<button type="button" class="btn btn-g" onclick="Modal.close()">Cancel</button>' +
      '<button type="button" class="btn btn-p" onclick="BCModule.save(' + (editIdx != null ? editIdx : 'null') + ')">Save</button>'
    );
    setTimeout(function() {
      BCModule._updatePot();
      var contrib = document.getElementById('bc-contribution');
      if (contrib) U.numInput(contrib, document.getElementById('bc-currency')?.value || (S.user && S.user.currency) || 'PKR');
    }, 50);
  },

  _onTypeChange() {
    const type = (document.getElementById('bc-type') || {}).value;
    const warn = document.getElementById('bc-bid-warning');
    if (warn) warn.style.display = type === 'bid' ? 'block' : 'none';
  },

  _updatePot() {
    const members = parseInt((document.getElementById('bc-members') || {}).value) || 0;
    const contribution = parseFloat(((document.getElementById('bc-contribution') || {}).value || '').replace(/,/g,'')) || 0;
    const currency = (document.getElementById('bc-currency') || {}).value || 'PKR';
    const el = document.getElementById('bc-pot-display');
    if (el && members && contribution) {
      const pot = members * contribution;
      el.textContent = 'Pot: ' + currency + ' ' + pot.toLocaleString() + ' · ' + members + ' members × ' + currency + ' ' + contribution.toLocaleString();
    }
  },

  save(editIdx) {
    const name = ((document.getElementById('bc-name') || {}).value || '').trim();
    if (!name) { Toast.show('BC name is required', 'error'); return; }
    const members = parseInt((document.getElementById('bc-members') || {}).value) || 0;
    const contribution = parseFloat(((document.getElementById('bc-contribution') || {}).value || '').replace(/,/g,'')) || 0;
    if (!members || !contribution) { Toast.show('Members and contribution amount are required', 'error'); return; }

    const existing = editIdx != null ? (S.bc || [])[editIdx] : null;
    const item = {
      id: existing ? existing.id : Math.random().toString(36).slice(2),
      name,
      role: (document.getElementById('bc-role') || {}).value || 'participant',
      type: (document.getElementById('bc-type') || {}).value || 'ballot',
      members,
      contribution,
      currency: (document.getElementById('bc-currency') || {}).value || 'PKR',
      frequency: (document.getElementById('bc-freq') || {}).value || 'monthly',
      totalRounds: members,
      myTurnRound: parseInt((document.getElementById('bc-myturn') || {}).value) || null,
      currentRound: parseInt((document.getElementById('bc-current') || {}).value) || 1,
      startDate: (document.getElementById('bc-start') || {}).value || '',
      paymentDay: parseInt((document.getElementById('bc-payday') || {}).value) || null,
      organiser: ((document.getElementById('bc-organiser') || {}).value || '').trim(),
      notes: ((document.getElementById('bc-notes') || {}).value || '').trim(),
      memberList: existing ? (existing.memberList || []) : [],
      paymentHistory: existing ? (existing.paymentHistory || []) : [],
      createdAt: existing ? (existing.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!S.bc) S.bc = [];
    if (editIdx != null) { S.bc[editIdx] = item; } else { S.bc.push(item); }
    Store.save();
    Modal.close();
    this.render();
    Toast.show(editIdx != null ? 'BC updated' : 'BC added', 'success');
  },

  edit(i) { this.openAdd(i); },

  del(i) {
    if (!window.__vos_confirm('Delete this BC?')) return;
    S.bc.splice(i, 1);
    Store.save();
    this.render();
    Toast.show('Deleted', 'info');
  },

  openDetail(i) {
    const bc = (S.bc || [])[i];
    if (!bc) return;
    const cur = bc.currency || 'PKR';
    const fmt = n => cur + ' ' + Math.round(n).toLocaleString();
    const pot = (bc.members || 1) * (bc.contribution || 0);
    const paid = Math.min(bc.currentRound || 1, bc.totalRounds || bc.members || 1) * (bc.contribution || 0);
    const myTurnDone = bc.myTurnRound && (bc.currentRound || 1) >= bc.myTurnRound;
    const received = myTurnDone ? pot : 0;
    const net = received - paid;

    Modal.open('🤝 ' + bc.name,
      '<div style="display:flex;flex-direction:column;gap:12px">' +

      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
        ['Pot', fmt(pot), 'Members', bc.members || '?',
         'Contribution', fmt(bc.contribution || 0), 'Frequency', bc.frequency || 'monthly',
         'Paid so far', fmt(paid), 'Received', myTurnDone ? fmt(received) : 'Not yet',
         'Net', fmt(net), 'Round', (bc.currentRound || 1) + ' / ' + (bc.totalRounds || bc.members || '?')
        ].reduce(function(acc, val, idx, arr) {
          if (idx % 2 === 0) acc.push('<div style="background:var(--glass);border-radius:10px;padding:10px"><div style="font-size:10px;color:var(--text3)">' + val + '</div><div style="font-size:14px;font-weight:700;color:var(--text)">' + arr[idx+1] + '</div></div>');
          return acc;
        }, []).join('') +
      '</div>' +

      (bc.myTurnRound ? (
        '<div style="background:' + (myTurnDone ? 'rgba(76,175,80,.1)' : 'rgba(91,141,238,.1)') + ';border:1px solid ' + (myTurnDone ? 'rgba(76,175,80,.3)' : 'rgba(91,141,238,.3)') + ';border-radius:12px;padding:12px;text-align:center">' +
          '<div style="font-size:13px;font-weight:700;color:' + (myTurnDone ? 'var(--ok)' : 'var(--accent)') + '">' + (myTurnDone ? '✓ You received your turn' : 'Your turn: Round ' + bc.myTurnRound) + '</div>' +
          (myTurnDone ? '<div style="font-size:12px;color:var(--text3);margin-top:4px">You received ' + fmt(pot) + '</div>' : '') +
        '</div>'
      ) : '<div style="background:rgba(255,152,0,.08);border:1px solid rgba(255,152,0,.2);border-radius:12px;padding:12px;text-align:center;font-size:13px;color:var(--warn)">Turn not yet assigned — ballot pending</div>') +

      (bc.type === 'ballot' && bc.role === 'organiser' ?
        '<button type="button" onclick="BCModule.runBallot(' + i + ')" class="btn btn-p" style="width:100%">🎲 Run Ballot Draw</button>'
        : '') +

      '<button type="button" onclick="BCModule.advanceRound(' + i + ')" class="btn btn-g" style="width:100%">→ Advance to Next Round</button>' +

      (bc.notes ? '<div style="font-size:12px;color:var(--text2);padding:8px 0">' + bc.notes + '</div>' : '') +

      (!myTurnDone && paid > 0 ?
        '<div style="background:rgba(76,175,80,.06);border:1px solid rgba(76,175,80,.15);border-radius:10px;padding:10px;font-size:11px;color:var(--text3)">🌙 Zakat: ' + fmt(paid) + ' is zakatable as receivable</div>'
        : '') +

      '</div>',
      '<button type="button" class="btn btn-g" onclick="Modal.close()">Close</button><button type="button" class="btn btn-p" onclick="BCModule.edit(' + i + ');Modal.close()">Edit</button>'
    );
  },

  advanceRound(i) {
    const bc = (S.bc || [])[i];
    if (!bc) return;
    const maxRound = bc.totalRounds || bc.members || 1;
    if ((bc.currentRound || 1) >= maxRound) { Toast.show('BC is complete — all rounds done', 'info'); return; }
    bc.currentRound = (bc.currentRound || 1) + 1;
    bc.updatedAt = new Date().toISOString();
    Store.save();
    Modal.close();
    this.render();
    Toast.show('Advanced to round ' + bc.currentRound, 'success');
  },

  runBallot(i) {
    const bc = (S.bc || [])[i];
    if (!bc) return;
    const currentRound = bc.currentRound || 1;
    const winnerNum = Math.floor(Math.random() * (bc.members || 1)) + 1;

    Modal.open('🎲 Ballot Draw — Round ' + currentRound,
      '<div style="text-align:center;padding:20px">' +
        '<div style="font-size:48px;margin-bottom:16px" id="ballot-icon">🎲</div>' +
        '<div style="font-size:16px;color:var(--text3);margin-bottom:20px">Drawing for Round ' + currentRound + '...</div>' +
        '<div id="ballot-result" style="display:none">' +
          '<div style="font-size:13px;color:var(--text3);margin-bottom:8px">This round goes to:</div>' +
          '<div style="font-size:48px;font-weight:900;color:var(--accent);letter-spacing:-2px">Member ' + winnerNum + '</div>' +
          '<div style="font-size:13px;color:var(--text2);margin-top:8px">Pot: ' + (bc.currency || 'PKR') + ' ' + ((bc.members || 1) * (bc.contribution || 0)).toLocaleString() + '</div>' +
        '</div>' +
        '<button type="button" onclick="BCModule._animateBallot(' + winnerNum + ')" class="btn btn-p" style="width:100%" id="ballot-btn">🎲 Draw!</button>' +
      '</div>',
      '<button type="button" class="btn btn-g" onclick="Modal.close()">Close</button>'
    );
  },

  _animateBallot(winner) {
    const btn = document.getElementById('ballot-btn');
    const icon = document.getElementById('ballot-icon');
    const result = document.getElementById('ballot-result');
    if (btn) btn.style.display = 'none';
    if (icon) icon.textContent = '🎲';
    let count = 0;
    const emojis = ['🎲', '🎯', '🏆', '💫', '⭐', '🌟'];
    const interval = setInterval(function() {
      if (icon) icon.textContent = emojis[count % emojis.length];
      count++;
      if (count > 15) {
        clearInterval(interval);
        if (icon) icon.textContent = '🏆';
        if (result) result.style.display = 'block';
      }
    }, 120);
  },

  getZakatableAmount(currency) {
    const bcs = S.bc || [];
    let total = 0;
    bcs.forEach(function(bc) {
      const myTurnDone = bc.myTurnRound && (bc.currentRound || 1) >= bc.myTurnRound;
      if (myTurnDone) return;
      const paid = Math.min(bc.currentRound || 1, bc.totalRounds || bc.members || 1) * (bc.contribution || 0);
      total += typeof RatesEngine !== 'undefined'
        ? RatesEngine.convert(paid, bc.currency || 'PKR', currency)
        : paid;
    });
    return total;
  },
};
window.BCModule = BCModule;
