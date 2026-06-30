// VaultCap — © 2026 Shamikh Ahmed. Source-available. See LICENSE.
// Cross-entity query helpers — extracted from app.js (refactor 4.4.0)

// ===================== VAULT RELATIONS =====================
const VaultRelations = {
  cardsForBank(bankId) {
    return (S.cards || []).filter(c => c.linkedBankId === bankId || c.linkedBank === (S.banks||[]).find(b => b.id === bankId)?.bankName);
  },
  loansForContact(contactId) {
    return (S.loans || []).filter(l => {
      const contact = (S.friends || []).find(f => f.id === contactId);
      return contact && l.person === contact.name;
    });
  },
  docsForMember(memberId) {
    if (!memberId) return [];
    return (S.documents || []).filter(d => d.ownerId === memberId);
  },
  bankSummary(bankId) {
    const bank = (S.banks || []).find(b => b.id === bankId);
    if (!bank) return null;
    const cards = this.cardsForBank(bankId);
    return { bank, cards, cardCount: cards.length, jointWith: bank.jointWith || null };
  },
  byTag(tag) {
    const results = [];
    const search = (arr, type) => (arr || []).filter(x => (x.tags || []).includes(tag)).forEach(x => results.push({...x, _type: type}));
    search(S.banks, 'bank'); search(S.cards, 'card'); search(S.documents, 'document');
    search(S.investments, 'investment'); search(S.loans, 'loan'); search(S.cash, 'cash');
    return results;
  },
  loanNetImpact() {
    const fx = typeof getFX === 'function' ? getFX() : {PKR:1,GBP:355,USD:280,AED:76};
    const toBase = (amt, cur) => (amt || 0) * (fx[cur] || 1);
    const owe = (S.loans || []).filter(l => l.type === 'borrowed' && l.status !== 'Settled').reduce((a, l) => a + toBase(l.amount, l.currency || 'PKR'), 0);
    const owed = (S.loans || []).filter(l => l.type === 'lent' && l.status !== 'Settled').reduce((a, l) => a + toBase(l.amount, l.currency || 'PKR'), 0);
    return { owe, owed, net: owed - owe };
  },
};
