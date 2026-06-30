'use strict';
/* Activity, autoLink, autoTags */

const Activity = {
  log(a, d = '') {
    const last = S.activity[0];
    if (last && last.a === a && (Date.now() - new Date(last.t).getTime()) < 30 * 60 * 1000) {
      last.t = new Date().toISOString();
      Store.save();
      return;
    }
    S.activity.unshift({ id: Date.now(), a, d, t: new Date().toISOString() });
    if (S.activity.length > 80) S.activity.pop();
    Store.save();
  },
  ago(iso) {
    const diff = Date.now() - new Date(iso);
    if (diff < 60000)   return 'just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return new Date(iso).toLocaleDateString();
  }
};

// ===================== DUPLICATE CHECKER =====================
/* → js/core/data-integrity.js (checkDuplicate + _BANK_ALIAS_GROUPS) */
// ===================== AUTO LINK =====================
function autoLink(module, item) {
  const n = s => (s||'').toLowerCase().trim();
  S._pendingLinks = S._pendingLinks || [];

  if (module === 'card') {
    const cardLow = n(item.cardName || '');
    const bank = (S.banks||[]).find(b => {
      const bn = n(b.bankName);
      return bn && (cardLow.includes(bn) || bn.includes(cardLow.split(' ')[0]));
    });
    if (bank) {
      item.linkedBankId = bank.id;
    } else if (cardLow) {
      S._pendingLinks.push({ type:'card', id:item.id, matchName:cardLow, field:'linkedBankId', targetModule:'banks' });
    }
  }

  if (module === 'bank') {
    const bankLow = n(item.bankName || '');
    const stillPending = [];
    S._pendingLinks.forEach(link => {
      if ((link.type === 'card' || link.type === 'expense') && link.matchName &&
          (link.matchName.includes(bankLow) || bankLow.includes(link.matchName.split(' ')[0]))) {
        const arr = link.type === 'card' ? S.cards : S.expenses;
        const target = (arr||[]).find(x => x.id === link.id);
        if (target) target[link.field] = item.id;
      } else {
        stillPending.push(link);
      }
    });
    S._pendingLinks = stillPending;
  }

  if (module === 'loan') {
    const person = n(item.person || item.personName || '');
    if (person) {
      const friend = (S.friends||[]).find(f => n(f.name) === person);
      if (friend) item.linkedFriendId = friend.id;
    }
  }

  if (module === 'sim') {
    const network = n(item.network || '');
    if (network) {
      const expense = (S.expenses||[]).find(e => {
        const en = n(e.name);
        return en.includes(network) || network.includes(en);
      });
      if (expense) item.linkedExpenseId = expense.id;
    }
  }
}

// ===================== AUTO TAGS =====================
function autoTags(type, data) {
  const tags = [];
  if (type === 'bank') {
    if (data.bankType === 'islamic') { tags.push('islamic'); tags.push('halal'); }
    if (data.bankType === 'digital') tags.push('digital');
    if (data.country === 'PK') tags.push('pakistan');
    if (data.country === 'GB') tags.push('uk');
    if (data.country === 'AE') tags.push('uae');
    if ((data.balance||0) > 100000) tags.push('high-value');
  } else if (type === 'card') {
    if (data.network === 'American Express') { tags.push('amex'); tags.push('travel'); }
    if ((data.cardType||'').toLowerCase() === 'credit') tags.push('credit');
    if ((data.cardType||'').toLowerCase() === 'debit') tags.push('debit');
    if (data.network === 'Visa') tags.push('visa');
    if (data.network === 'Mastercard') tags.push('mastercard');
    if ((data.annualFee||0) > 0) tags.push('paid');
    if (data.category === 'Crypto') tags.push('crypto');
    if (data.category === 'International' || data.country !== (S.user.currency||'GBP').slice(0,2)) tags.push('international');
  } else if (type === 'investment') {
    if (data.type === 'Crypto') { tags.push('crypto'); tags.push('high-risk'); }
    if (data.type === 'Sukuk') { tags.push('islamic'); tags.push('halal'); }
    if (data.type === 'Mutual Funds') tags.push('fund');
    if (data.country === 'PK') tags.push('psx');
  } else if (type === 'sim') {
    const ccMap = {PK:'pakistan',GB:'uk',AE:'uae',US:'usa',CA:'canada',AU:'australia',IN:'india'};
    if (ccMap[data.country]) tags.push(ccMap[data.country]);
    if (data.simType === 'eSIM') tags.push('esim');
  }
  return tags;
}

// ===================== UTILS =====================
