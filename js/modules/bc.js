'use strict';
// VaultOS Savings Circles (ROSCA: BC, committee, tontine, tanda, susu, chit, stokvel…) — © 2026 Shamikh Ahmed
/* Same record shape as the original BC module (S.bc) — only the names, currencies and
   bid maths became worldwide. Local names: docs/research/worldwide-features.md §1.1. */
const ROSCA_NAMES = [
  [['PK', 'IN', 'NP'], 'Committee (BC)', 'Committees'],
  [['LK'], 'Seettu', 'Seettu circles'],
  [['BD'], 'Samity', 'Samities'],
  [['NG'], 'Esusu / Ajo', 'Esusu / Ajo groups'],
  [['GH', 'SL', 'LR'], 'Susu', 'Susu groups'],
  [['KE', 'UG', 'RW'], 'Chama', 'Chamas'],
  [['TZ', 'ZM', 'MW'], 'Upatu', 'Upatu groups'],
  [['ZA', 'BW', 'LS', 'SZ', 'NA', 'ZW'], 'Stokvel', 'Stokvels'],
  [['ET', 'ER'], 'Ekub', 'Ekubs'],
  [['SO', 'DJ'], 'Hagbad', 'Hagbads'],
  [['EG', 'SD'], 'Gameya', 'Gameyas'],
  [['SA', 'AE', 'JO', 'LB', 'KW', 'QA', 'BH', 'OM', 'SY', 'IQ', 'PS', 'YE', 'LY', 'TN', 'DZ', 'MA'], "Jam'iya", "Jam'iyas"],
  [['CI', 'CM', 'SN', 'ML', 'BF', 'BJ', 'TG', 'GA', 'CD', 'CG', 'NE', 'TD', 'GN', 'CF', 'FR', 'BE', 'MG', 'HT'], 'Tontine', 'Tontines'],
  [['DO'], 'San', 'Sanes'],
  [['MX', 'GT', 'SV', 'HN', 'NI', 'CR', 'PA', 'US'], 'Tanda', 'Tandas'],
  [['CO', 'VE'], 'Natillera', 'Natilleras'],
  [['PE', 'BO', 'EC'], 'Pandero', 'Panderos'],
  [['JM', 'TT', 'BB', 'GY', 'BS', 'LC', 'GD', 'VC', 'DM', 'AG', 'KN', 'GB'], 'Pardner / Susu', 'Pardners'],
  [['ID'], 'Arisan', 'Arisans'],
  [['PH'], 'Paluwagan', 'Paluwagans'],
  [['MY', 'SG', 'BN'], 'Kutu', 'Kutu groups'],
  [['CN', 'TW', 'HK', 'VN', 'TH'], 'Hui', 'Hui groups'],
  [['KR'], 'Kye', 'Kye groups'],
  [['JP'], 'Tanomoshi', 'Tanomoshi groups'],
  [['TR', 'AZ'], 'Gün', 'Gün groups'],
];

const BCModule = {
  /** Name people use for a rotating savings group where the user lives. */
  localName(cc) {
    const home = cc || ((typeof U !== 'undefined' && U.homeCC) ? U.homeCC() : '');
    const hit = ROSCA_NAMES.find(r => r[0].includes(home));
    return hit ? { one: hit[1], plural: hit[2] } : { one: 'Savings circle', plural: 'Savings Circles' };
  },
  _n() { return this.localName().one; },

  /** Accepts a record id (search, links) or the legacy array index. */
  _idx(x) {
    const list = S.bc || [];
    if (typeof x === 'number' && list[x]) return x;
    const byId = list.findIndex(b => b && b.id === x);
    if (byId >= 0) return byId;
    const n = parseInt(x, 10);
    return !isNaN(n) && String(n) === String(x) && list[n] ? n : -1;
  },

  /** Bid / auction round (chit fund, bidding hui/kye): prize, organiser fee, dividend each. */
  bidMath(bc, discount) {
    const members = bc.members || 1, pot = members * (bc.contribution || 0);
    const d = Math.max(0, +discount || 0);
    const fee = pot * ((+bc.feePct || 0) / 100);
    const dividend = Math.max(0, d - fee) / members;
    return { pot, discount: d, prize: pot - d, fee, dividend, instalment: (bc.contribution || 0) - dividend };
  },

  TYPES: {
    ballot: 'Lottery draw (random)',
    fixed: 'Fixed order (pre-agreed)',
    bid: 'Bid / auction (discount)',
    shared: 'Shared payout (grocery / year-end)',
    auto: 'Auto-deduction',
  },

  ROLES: {
    organiser: 'Organiser',
    participant: 'Participant',
  },

  render() {
    const el = document.getElementById('pg-bc-body');
    if (!el) return;
    const t = document.getElementById('bc-title');
    if (t) t.textContent = this.localName().plural;
    const bcs = S.bc || [];

    const totalCommitted = bcs.reduce((sum, bc) => {
      const paid = (bc.currentRound || 1) * (bc.contribution || 0);
      return sum + (typeof RatesEngine !== 'undefined'
        ? RatesEngine.convert(paid, bc.currency || 'USD', S.user.currency || 'USD')
        : paid);
    }, 0);

    const totalReceived = bcs.reduce((sum, bc) => {
      if (!bc.myTurnRound || bc.currentRound < bc.myTurnRound) return sum;
      const received = (bc.members || 1) * (bc.contribution || 0);
      return sum + (typeof RatesEngine !== 'undefined'
        ? RatesEngine.convert(received, bc.currency || 'USD', S.user.currency || 'USD')
        : received);
    }, 0);

    const fmt = n => (S.user.currency || 'USD') + ' ' + Math.round(n).toLocaleString();

    el.innerHTML =
      '<div style="padding:16px 16px 28px;display:flex;flex-direction:column;gap:14px">' +

      (bcs.length > 0 ? (
        '<div class="u-highlight-card">' +
          '<div class="vc-ix-187">' + escHtml(BCModule.localName().plural) + ' summary</div>' +
          '<div class="vc-ix-89">' +
            '<div class="vc-ix-109"><div class="vc-ix-3">Total Paid In</div><div style="font-size:1.25rem;font-weight:900;color:var(--text)">' + fmt(totalCommitted) + '</div></div>' +
            '<div class="vc-ix-109"><div class="vc-ix-3">Total Received</div><div style="font-size:1.25rem;font-weight:900;color:var(--ok)">' + fmt(totalReceived) + '</div></div>' +
          '</div>' +
          '<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);font-size:0.75rem;color:var(--text3)">Net position: <strong style="color:' + (totalReceived - totalCommitted >= 0 ? 'var(--ok)' : 'var(--err)') + '">' + fmt(totalReceived - totalCommitted) + '</strong></div>' +
        '</div>'
      ) : '') +

      '<button type="button" class="btn btn-p vc-ix-16" data-act="BCModule.openAdd()">+ Join / start a ' + escHtml(BCModule._n()) + '</button>' +

      (bcs.length === 0 ?
        '<div class="empty-ios"><div class="ei-ic">' + VC.icon('handshake', 32) + '</div><div class="ei-title">No savings circles yet</div><div class="ei-sub">Track any rotating savings group — BC, chit fund, tontine, tanda, susu, stokvel, chama, arisan, paluwagan, hui, kye, jam\'iya, pardner — in any currency.</div></div>'
        :
        bcs.map((bc, i) => BCModule._bcCard(bc, i)).join('')
      ) +

      '<div class="vc-ix-219">' +
        '<div class="vc-ix-220">Zakat Note</div>' +
        '<div class="vc-ix-90">Money paid into a circle that you haven\'t received yet is zakatable as a receivable (you still own it). This is auto-added to your Zakat calculator.</div>' +
      '</div>' +

      '</div>';
  },

  _bcCard(bc, i) {
    const cur = bc.currency || 'USD';
    const displayCur = (S.user && S.user.currency) || 'USD';
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
    const statusText = myTurnDone ? 'Turn complete' : myTurnNext ? 'Your turn!' : bc.myTurnRound ? 'Turn: Round ' + bc.myTurnRound : 'Turn: TBD';

    return '<div class="entry" style="flex-direction:column;align-items:stretch">' +
      '<div class="entry-main">' +
        '<div class="entry-ic">' + VC.icon('refresh-cw', 18) + '</div>' +
        '<div class="entry-body">' +
          '<div class="entry-name entry-name--wrap">' + escHtml(bc.name || BCModule._n()) + '</div>' +
          '<div class="entry-sub entry-sub--wrap">' + escHtml(BCModule.TYPES[bc.type] || bc.type || 'Ballot') + ' · ' + escHtml(String(bc.members || '?')) + ' members · ' + fmt(bc.contribution || 0) + '/round</div>' +
          '<div class="entry-meta">' +
            '<span class="badge b-acc">' + fmt(pot) + ' pot</span>' +
            '<span class="badge" style="background:rgba(255,255,255,.1);color:' + statusColor + '">' + statusText + '</span>' +
            (bc.role === 'organiser' ? '<span class="badge b-warn">Organiser</span>' : '') +
            (bc.type === 'bid' ? '<span class="badge b-warn">Bid-based</span>' : '') +
          '</div>' +
        '</div>' +
        '<div class="entry-acts">' +
          U.actsViewEditDel('BCModule', i, 'openDetail') +
        '</div>' +
      '</div>' +
      '<div style="padding:0 14px 12px">' +
        '<div style="display:flex;justify-content:space-between;font-size:0.6875rem;color:var(--text3);margin-bottom:4px">' +
          '<span>Round ' + (bc.currentRound || 1) + ' of ' + (bc.totalRounds || bc.members || '?') + '</span>' +
          '<span>' + progress + '% complete</span>' +
        '</div>' +
        '<div style="height:4px;background:var(--border);border-radius:999px"><div style="height:100%;width:' + progress + '%;background:var(--accent);border-radius:999px;transition:width .5s"></div></div>' +
        (daysToNext !== null ? '<div class="vc-ix-221">Next payment: ' + (daysToNext === 0 ? 'Today' : daysToNext + ' days') + '</div>' : '') +
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
    if (editIdx != null) { editIdx = this._idx(editIdx); if (editIdx < 0) editIdx = null; }
    const bc = editIdx != null ? (S.bc || [])[editIdx] : {};
    const cur = S.user.currency || 'USD';
    const nm = this._n();
    const curList = typeof CURRENCIES !== 'undefined' ? CURRENCIES : ['USD', 'EUR', 'GBP'];
    Modal.open(editIdx != null ? 'Edit ' + nm : 'Join / start a ' + nm,
      '<div class="fg"><label class="fl" for="bc-name">Name</label>' +
        '<input class="inp" id="bc-name" dir="auto" value="' + escAttr(bc.name || '') + '" placeholder="e.g. Family ' + escAttr(nm) + ', Office circle 2026"></div>' +

      '<div class="fr">' +
        '<div class="fg"><label class="fl">Your Role</label>' +
          '<select class="inp" id="bc-role">' +
            '<option value="participant"' + (bc.role !== 'organiser' ? ' selected' : '') + '>Participant</option>' +
            '<option value="organiser"' + (bc.role === 'organiser' ? ' selected' : '') + '>Organiser</option>' +
          '</select></div>' +
        '<div class="fg"><label class="fl">Payout order</label>' +
          '<select class="inp" id="bc-type" data-act-change="BCModule._onTypeChange()">' +
            Object.entries(BCModule.TYPES).map(function(e) {
              return '<option value="' + e[0] + '"' + (bc.type === e[0] ? ' selected' : '') + '>' + e[1] + '</option>';
            }).join('') +
          '</select></div>' +
      '</div>' +

      '<div id="bc-bid-warning" style="display:' + (bc.type === 'bid' ? 'block' : 'none') + ';background:rgba(255,152,0,.1);border:1px solid rgba(255,152,0,.3);border-radius:10px;padding:10px;margin-bottom:10px;font-size:0.6875rem;color:var(--warn)">' +
        'In a bid circle the member who takes the pot early accepts a discount, which is shared out as a dividend. Some places regulate this (India caps the discount at 40% under the Chit Funds Act), and many Islamic scholars consider it impermissible.' +
        '<div class="fr" style="margin-top:8px">' +
          '<div class="fg"><label class="fl" for="bc-discount">This round\'s winning discount</label><input class="inp num-inp" type="text" inputmode="decimal" id="bc-discount" value="' + escAttr(bc.bidDiscount || '') + '" placeholder="0" data-act-input="BCModule._updatePot()"></div>' +
          '<div class="fg"><label class="fl" for="bc-fee">Organiser fee (% of pot)</label><input class="inp num-inp" type="text" inputmode="decimal" id="bc-fee" value="' + escAttr(bc.feePct || '') + '" placeholder="e.g. 5" data-act-input="BCModule._updatePot()"></div>' +
        '</div>' +
      '</div>' +

      '<div class="fr">' +
        '<div class="fg"><label class="fl">Total Members</label>' +
          '<input class="inp num-inp" type="number" id="bc-members" min="2" value="' + escAttr(bc.members || '') + '" placeholder="e.g. 10" data-act-input="BCModule._updatePot()"></div>' +
        '<div class="fg"><label class="fl">Contribution/Round</label>' +
          '<input class="inp num-inp" type="text" inputmode="decimal" pattern="[0-9,\\.]*" id="bc-contribution" value="' + escAttr(bc.contribution || '') + '" placeholder="e.g. 10,000" data-act-input="BCModule._updatePot()"></div>' +
      '</div>' +

      '<div class="fr">' +
        '<div class="fg"><label class="fl">Currency</label>' +
          '<select class="inp" id="bc-currency" data-act-change="BCModule._updatePot()">' +
            curList.map(function(c) {
              return '<option value="' + c + '"' + ((bc.currency || cur) === c ? ' selected' : '') + '>' + c + '</option>';
            }).join('') +
          '</select></div>' +
        '<div class="fg"><label class="fl">Frequency</label>' +
          '<select class="inp" id="bc-freq">' +
            '<option value="monthly"' + ((bc.frequency || 'monthly') === 'monthly' ? ' selected' : '') + '>Monthly</option>' +
            '<option value="fortnightly"' + (bc.frequency === 'fortnightly' ? ' selected' : '') + '>Every 2 weeks</option>' +
            '<option value="weekly"' + (bc.frequency === 'weekly' ? ' selected' : '') + '>Weekly</option>' +
            '<option value="daily"' + (bc.frequency === 'daily' ? ' selected' : '') + '>Daily</option>' +
            '<option value="bimonthly"' + (bc.frequency === 'bimonthly' ? ' selected' : '') + '>Every 2 months</option>' +
          '</select></div>' +
      '</div>' +

      '<div id="bc-pot-display" style="background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);border-radius:10px;padding:10px;text-align:center;margin-bottom:10px;font-size:0.8125rem;color:var(--accent);font-weight:700">Pot: Enter members and contribution</div>' +

      '<div class="fr">' +
        '<div class="fg"><label class="fl">My Turn (Round #)</label>' +
          '<input class="inp num-inp" type="number" id="bc-myturn" min="1" value="' + escAttr(bc.myTurnRound || '') + '" placeholder="Leave blank if not drawn yet"></div>' +
        '<div class="fg"><label class="fl">Current Round</label>' +
          '<input class="inp num-inp" type="number" id="bc-current" min="1" value="' + escAttr(bc.currentRound || 1) + '" placeholder="1"></div>' +
      '</div>' +

      '<div class="fr">' +
        '<div class="fg"><label class="fl">Start Date</label>' +
          '<input class="inp" type="date" id="bc-start" value="' + escAttr(bc.startDate || '') + '"></div>' +
        '<div class="fg"><label class="fl">Payment Day of Month</label>' +
          '<input class="inp num-inp" type="number" id="bc-payday" min="1" max="28" value="' + escAttr(bc.paymentDay || '') + '" placeholder="e.g. 1"></div>' +
      '</div>' +

      '<div class="fg"><label class="fl">Organiser / Contact (optional)</label>' +
        (typeof familyOrganiserDatalistHtml === 'function' ? familyOrganiserDatalistHtml() : '') +
        '<input class="inp" id="bc-organiser" dir="auto" value="' + escAttr(bc.organiser || '') + '" list="bcOrgDL" placeholder="Name or phone number"></div>' +

      '<div class="fg"><label class="fl">Notes</label>' +
        '<textarea class="inp" id="bc-notes" rows="2" dir="auto">' + escHtml(bc.notes || '') + '</textarea></div>' +

      '<div class="vc-ix-222">Money paid in but not yet received counts toward net worth' + (S.modules && S.modules.zakat !== false ? ' and as a zakatable receivable' : '') + '.</div>',

      '<button type="button" class="btn btn-g" data-act="Modal.close()">Cancel</button>' +
      '<button type="button" class="btn btn-p" data-act="BCModule.save(' + (editIdx != null ? editIdx : 'null') + ')">Save</button>'
    );
    setTimeout(function() {
      BCModule._updatePot();
      var contrib = document.getElementById('bc-contribution');
      if (contrib) U.numInput(contrib, document.getElementById('bc-currency')?.value || (S.user && S.user.currency) || 'USD');
    }, 50);
  },

  _onTypeChange() {
    const type = (document.getElementById('bc-type') || {}).value;
    const warn = document.getElementById('bc-bid-warning');
    if (warn) warn.style.display = type === 'bid' ? 'block' : 'none';
    this._updatePot();
  },

  _updatePot() {
    const members = parseInt((document.getElementById('bc-members') || {}).value) || 0;
    const contribution = parseFloat(((document.getElementById('bc-contribution') || {}).value || '').replace(/,/g,'')) || 0;
    const currency = (document.getElementById('bc-currency') || {}).value || 'USD';
    const el = document.getElementById('bc-pot-display');
    if (el && members && contribution) {
      const pot = members * contribution;
      let txt = 'Pot: ' + currency + ' ' + pot.toLocaleString() + ' · ' + members + ' members × ' + currency + ' ' + contribution.toLocaleString();
      const type = (document.getElementById('bc-type') || {}).value;
      const disc = parseFloat(((document.getElementById('bc-discount') || {}).value || '').replace(/,/g, '')) || 0;
      const fee = parseFloat(((document.getElementById('bc-fee') || {}).value || '').replace(/,/g, '')) || 0;
      if (type === 'bid' && (disc || fee)) {
        const m = this.bidMath({ members, contribution, feePct: fee }, disc);
        txt += ' — winner takes ' + currency + ' ' + Math.round(m.prize).toLocaleString() + ', dividend ' + currency + ' ' + Math.round(m.dividend).toLocaleString() + ' each, so everyone pays ' + currency + ' ' + Math.round(m.instalment).toLocaleString() + ' this round';
        if (disc > pot * 0.4) txt += ' ⚠︎ discount is over 40% of the pot';
      }
      el.textContent = txt;
    }
  },

  save(editIdx) {
    if (editIdx != null) { editIdx = this._idx(editIdx); if (editIdx < 0) editIdx = null; }
    const name = ((document.getElementById('bc-name') || {}).value || '').trim();
    if (!name) { Toast.show('Name is required', 'error'); return; }
    const members = parseInt((document.getElementById('bc-members') || {}).value) || 0;
    const contribution = parseFloat(((document.getElementById('bc-contribution') || {}).value || '').replace(/,/g,'')) || 0;
    if (!members || !contribution) { Toast.show('Members and contribution amount are required', 'error'); return; }

    const existing = editIdx != null ? (S.bc || [])[editIdx] : null;
    const item = {
      ...(existing || {}),
      id: existing ? existing.id : U.id(),
      name,
      role: (document.getElementById('bc-role') || {}).value || 'participant',
      type: (document.getElementById('bc-type') || {}).value || 'ballot',
      members,
      contribution,
      currency: (document.getElementById('bc-currency') || {}).value || 'USD',
      bidDiscount: parseFloat(((document.getElementById('bc-discount') || {}).value || '').replace(/,/g, '')) || null,
      feePct: parseFloat(((document.getElementById('bc-fee') || {}).value || '').replace(/,/g, '')) || null,
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
    Toast.show(editIdx != null ? 'Updated' : 'Added: ' + escHtml(name), 'success');
  },

  edit(i) { this.openAdd(i); },
  detail(i) { this.openDetail(i); },

  async del(i) {
    i = this._idx(i);
    if (i < 0) return;
    if (!await window.__vos_confirm('Delete this ' + this._n() + '?')) return;
    S.bc.splice(i, 1);
    Store.save();
    this.render();
    Toast.show('Deleted', 'info');
  },

  openDetail(i) {
    i = this._idx(i);
    const bc = (S.bc || [])[i];
    if (!bc) return;
    const cur = bc.currency || 'USD';
    const fmt = n => cur + ' ' + Math.round(n).toLocaleString();
    const pot = (bc.members || 1) * (bc.contribution || 0);
    const paid = Math.min(bc.currentRound || 1, bc.totalRounds || bc.members || 1) * (bc.contribution || 0);
    const myTurnDone = bc.myTurnRound && (bc.currentRound || 1) >= bc.myTurnRound;
    const received = myTurnDone ? pot : 0;
    const net = received - paid;

    Modal.open(bc.name || this._n(),
      '<div class="vc-ix-14">' +

      '<div class="vc-ix-133">' +
        ['Pot', fmt(pot), 'Members', bc.members || '?',
         'Contribution', fmt(bc.contribution || 0), 'Frequency', bc.frequency || 'monthly',
         'Paid so far', fmt(paid), 'Received', myTurnDone ? fmt(received) : 'Not yet',
         'Net', fmt(net), 'Round', (bc.currentRound || 1) + ' / ' + (bc.totalRounds || bc.members || '?')
        ].reduce(function(acc, val, idx, arr) {
          if (idx % 2 === 0) acc.push('<div style="background:var(--glass);border-radius:10px;padding:10px"><div class="vc-ix-18">' + val + '</div><div class="vc-ix-25">' + arr[idx+1] + '</div></div>');
          return acc;
        }, []).join('') +
      '</div>' +

      (bc.myTurnRound ? (
        '<div style="background:' + (myTurnDone ? 'rgba(76,175,80,.1)' : 'rgba(255,255,255,.1)') + ';border:1px solid ' + (myTurnDone ? 'rgba(76,175,80,.3)' : 'rgba(255,255,255,.3)') + ';border-radius:12px;padding:12px;text-align:center">' +
          '<div style="font-size:0.8125rem;font-weight:700;color:' + (myTurnDone ? 'var(--ok)' : 'var(--accent)') + '">' + (myTurnDone ? 'You received your turn' : 'Your turn: Round ' + bc.myTurnRound) + '</div>' +
          (myTurnDone ? '<div class="vc-ix-73">You received ' + fmt(pot) + '</div>' : '') +
        '</div>'
      ) : '<div style="background:rgba(255,152,0,.08);border:1px solid rgba(255,152,0,.2);border-radius:12px;padding:12px;text-align:center;font-size:0.8125rem;color:var(--warn)">Turn not yet assigned — ballot pending</div>') +

      (bc.type === 'ballot' && bc.role === 'organiser' ?
        '<button type="button" data-act="BCModule.runBallot(' + i + ')" class="btn btn-p vc-ix-16">Run Ballot Draw</button>'
        : '') +

      '<button type="button" data-act="BCModule.advanceRound(' + i + ')" class="btn btn-g vc-ix-16">→ Advance to Next Round</button>' +

      (bc.type === 'bid' && (bc.bidDiscount || bc.feePct) ? (function () { const m = BCModule.bidMath(bc, bc.bidDiscount); return '<div class="vc-ix-222" id="bc-bid-detail">Bid round: winner takes ' + fmt(m.prize) + ' · organiser fee ' + fmt(m.fee) + ' · dividend ' + fmt(m.dividend) + ' each · instalment ' + fmt(m.instalment) + '</div>'; })() : '') +
      (bc.notes ? '<div style="font-size:0.75rem;color:var(--text2);padding:8px 0" dir="auto">' + escHtml(bc.notes) + '</div>' : '') +

      (!myTurnDone && paid > 0 ?
        '<div class="vc-ix-222">Zakat: ' + fmt(paid) + ' is zakatable as receivable</div>'
        : '') +

      '</div>',
      '<button type="button" class="btn btn-g" data-act="Modal.close()">Close</button><button type="button" class="btn btn-p" data-act="BCModule.edit(' + i + ');Modal.close()">Edit</button>'
    );
  },

  advanceRound(i) {
    i = this._idx(i);
    const bc = (S.bc || [])[i];
    if (!bc) return;
    const maxRound = bc.totalRounds || bc.members || 1;
    if ((bc.currentRound || 1) >= maxRound) { Toast.show('Complete — all rounds done', 'info'); return; }
    bc.currentRound = (bc.currentRound || 1) + 1;
    bc.updatedAt = new Date().toISOString();
    Store.save();
    Modal.close();
    this.render();
    Toast.show('Advanced to round ' + bc.currentRound, 'success');
  },

  runBallot(i) {
    i = this._idx(i);
    const bc = (S.bc || [])[i];
    if (!bc) return;
    const currentRound = bc.currentRound || 1;
    const winnerNum = Math.floor(Math.random() * (bc.members || 1)) + 1;

    Modal.open('Ballot Draw — Round ' + currentRound,
      '<div style="text-align:center;padding:20px">' +
        '<div style="margin-bottom:16px;display:flex;justify-content:center" id="ballot-icon">' + VC.icon('target', 48) + '</div>' +
        '<div style="font-size:1rem;color:var(--text3);margin-bottom:20px">Drawing for Round ' + currentRound + '...</div>' +
        '<div class="vc-ix-17" id="ballot-result">' +
          '<div style="font-size:0.8125rem;color:var(--text3);margin-bottom:8px">This round goes to:</div>' +
          '<div style="font-size:3rem;font-weight:900;color:var(--accent);letter-spacing:-2px">Member ' + winnerNum + '</div>' +
          '<div style="font-size:0.8125rem;color:var(--text2);margin-top:8px">Pot: ' + (bc.currency || 'PKR') + ' ' + ((bc.members || 1) * (bc.contribution || 0)).toLocaleString() + '</div>' +
        '</div>' +
        '<button type="button" data-act="BCModule._animateBallot(' + winnerNum + ')" class="btn btn-p vc-ix-16" id="ballot-btn">Draw!</button>' +
      '</div>',
      '<button type="button" class="btn btn-g" data-act="Modal.close()">Close</button>'
    );
  },

  _animateBallot(winner) {
    const btn = document.getElementById('ballot-btn');
    const icon = document.getElementById('ballot-icon');
    const result = document.getElementById('ballot-result');
    if (btn) btn.style.display = 'none';
    if (icon) icon.innerHTML = VC.icon('target', 48);
    let count = 0;
    const icons = ['target', 'star', 'sparkles', 'gem', 'chart', 'target'];
    const interval = setInterval(function() {
      if (icon) icon.innerHTML = VC.icon(icons[count % icons.length], 48);
      count++;
      if (count > 15) {
        clearInterval(interval);
        if (icon) icon.innerHTML = VC.icon('star', 48);
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
