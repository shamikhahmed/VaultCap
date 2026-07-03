// VaultCap — © 2026 Shamikh Ahmed. Source-available. See LICENSE.
// Cross-entity query helpers — bank↔card linking is the core path.

// ===================== VAULT RELATIONS =====================
const VaultRelations = {
  // Card-name tokens → canonical bank name (lower). Covers catalog + common brands.
  _ISSUER_ALIASES: {
    barclaycard: 'barclays',
    barclays: 'barclays',
    enbd: 'emirates nbd',
    'emirates nbd': 'emirates nbd',
    amex: 'american express',
    'american express': 'american express',
    mcb: 'mcb bank',
    'mcb bank': 'mcb bank',
    abl: 'allied bank',
    'allied bank': 'allied bank',
    bahl: 'bank al habib',
    'bank al habib': 'bank al habib',
    'al habib': 'bank al habib',
    alfalah: 'bank alfalah',
    'bank alfalah': 'bank alfalah',
    sc: 'standard chartered',
    'standard chartered': 'standard chartered',
    fab: 'first abu dhabi bank',
    'first abu dhabi': 'first abu dhabi bank',
    hsbc: 'hsbc',
    lloyds: 'lloyds bank',
    'lloyds bank': 'lloyds bank',
    natwest: 'natwest',
    rbs: 'natwest',
    monzo: 'monzo',
    starling: 'starling',
    revolut: 'revolut',
    wise: 'wise',
    hbl: 'hbl',
    ubl: 'ubl',
    meezan: 'meezan bank',
    'meezan bank': 'meezan bank',
    faysal: 'faysal bank',
    'faysal bank': 'faysal bank',
    sadapay: 'sadapay',
    nayapay: 'nayapay',
    zindigi: 'zindigi',
    jazzcash: 'jazzcash',
    easypaisa: 'easypaisa',
    chase: 'chase',
    'bank of america': 'bank of america',
    bofa: 'bank of america',
    'wells fargo': 'wells fargo',
    citi: 'citi',
    citibank: 'citi',
    santander: 'santander',
    halifax: 'halifax',
    nationwide: 'nationwide',
    tsb: 'tsb',
    metro: 'metro bank',
    'metro bank': 'metro bank',
    dib: 'dubai islamic bank',
    'dubai islamic': 'dubai islamic bank',
    adcb: 'adcb',
    mashreq: 'mashreq',
    rakbank: 'rakbank',
    rak: 'rakbank',
    ei: 'emirates islamic',
    'emirates islamic': 'emirates islamic',
    liv: 'liv',
    stanchart: 'standard chartered',
    'stan chart': 'standard chartered',
    capitalone: 'capital one',
    'capital one': 'capital one',
    aqua: 'aqua',
    vanquis: 'vanquis',
    curve: 'curve',
    caxton: 'caxton',
    fairfx: 'fairfx',
    tesco: 'tesco bank',
    'tesco bank': 'tesco bank',
    'm and s': 'm&s bank',
    'marks and spencer': 'm&s bank',
    sainsbury: 'sainsbury s bank',
    asda: 'asda money',
    'post office': 'post office money',
    'john lewis': 'john lewis',
    marbles: 'marbles',
    aa: 'aa finance',
    rac: 'rac finance',
  },

  _norm(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  },

  _hasToken(hay, token) {
    if (!hay || !token) return false;
    if (token.length <= 3) {
      return new RegExp(`(?:^|\\s)${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\s|$)`).test(hay);
    }
    return hay.includes(token);
  },

  /** All match keys for a bank (name, first token, SMART_DB aliases, issuer aliases). */
  bankMatchKeys(bank) {
    const keys = new Set();
    const name = this._norm(bank.bankName || bank.name);
    if (!name) return [];
    keys.add(name);
    const parts = name.split(' ').filter(Boolean);
    if (parts[0] && parts[0].length >= 3) keys.add(parts[0]);
    if (parts.length > 1) keys.add(parts.slice(0, 2).join(' '));

    const catalog = (typeof SMART_DB !== 'undefined' ? SMART_DB.banks : []).find((b) => {
      const bn = this._norm(b.name);
      return bn === name || (b.aliases || []).some((a) => this._norm(a) === name);
    });
    if (catalog) {
      keys.add(this._norm(catalog.name));
      (catalog.aliases || []).forEach((a) => {
        const ak = this._norm(a);
        if (ak) keys.add(ak);
        const af = ak.split(' ')[0];
        if (af && af.length >= 3) keys.add(af);
      });
    }

    Object.entries(this._ISSUER_ALIASES).forEach(([alias, target]) => {
      if (name === target || name.includes(target) || target.includes(name)) keys.add(alias);
    });

    return [...keys].filter(Boolean);
  },

  /** Best matching bank in `banks` for a card name, or null. */
  matchBankForCard(cardName, banks) {
    const list = banks || S.banks || [];
    const card = this._norm(cardName);
    if (!card || !list.length) return null;

    const cardFirst = card.split(' ')[0] || '';
    let best = null;
    let bestScore = 0;
    for (const bank of list) {
      for (const key of this.bankMatchKeys(bank)) {
        if (!key || key.length < 2) continue;
        if (!this._hasToken(card, key)) continue;
        let score = key.length * 10;
        if (card === key || card.startsWith(key + ' ')) score += 40;
        if (cardFirst && (cardFirst === key || key.startsWith(cardFirst) || cardFirst.startsWith(key))) score += 80;
        if (score > bestScore) {
          bestScore = score;
          best = bank;
        }
      }
    }
    // Need at least a 3-char token match (score 30)
    return bestScore >= 30 ? best : null;
  },

  /** Catalog bank entry for a card name (even if user has no bank yet). */
  catalogBankForCard(cardName, preferCountry) {
    const card = this._norm(cardName);
    if (!card || typeof SMART_DB === 'undefined') return null;
    const banks = SMART_DB.banks || [];
    const cardMeta = (SMART_DB.cards || []).find((c) => this._norm(c.name) === card);
    const country = preferCountry || (cardMeta && cardMeta.country) || '';

    const cardFirst = card.split(' ')[0] || '';
    let best = null;
    let bestScore = 0;
    for (const b of banks) {
      const keys = [b.name, ...(b.aliases || [])].map((k) => this._norm(k)).filter(Boolean);
      // Reverse issuer aliases that point at this bank
      Object.entries(this._ISSUER_ALIASES).forEach(([alias, target]) => {
        const bn = this._norm(b.name);
        if (bn === target || bn.includes(target) || target.includes(bn)) keys.push(alias);
      });
      for (const key of [...new Set(keys)]) {
        if (key.length < 2 || !this._hasToken(card, key)) continue;
        let score = key.length * 10;
        if (card.startsWith(key + ' ') || card === key) score += 40;
        if (cardFirst && (cardFirst === key || key.startsWith(cardFirst) || cardFirst.startsWith(key))) score += 80;
        if (country && b.country === country) score += 60;
        if (score > bestScore) {
          bestScore = score;
          best = b;
        }
      }
    }
    return bestScore >= 30 ? best : null;
  },

  /** Match existing bank, or create one from SMART_DB catalog. */
  ensureBankForCard(cardName) {
    let bank = this.matchBankForCard(cardName);
    if (bank) return bank;
    const catalog = this.catalogBankForCard(cardName);
    if (!catalog) return null;
    bank = {
      id: typeof U !== 'undefined' ? U.id() : 'bk_' + Math.random().toString(36).slice(2, 10),
      bankName: catalog.name,
      country: catalog.country || 'GB',
      currency: catalog.currency || 'GBP',
      bankType: catalog.type || 'commercial',
      accountType: 'Current',
      balance: 0,
      tags: [],
      ownerId: 'self',
      owners: ['self'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    S.banks = S.banks || [];
    S.banks.push(bank);
    return bank;
  },

  applyLink(card, bank) {
    if (!card || !bank) return false;
    card.linkedBankId = bank.id;
    card.linkedBank = bank.bankName;
    return true;
  },

  /**
   * Link one card to its bank.
   * @param {{ createBank?: boolean }} opts createBank=true will add catalog bank if missing
   */
  linkCard(card, opts = {}) {
    if (!card) return null;
    const createBank = !!opts.createBank;

    if (card.linkedBankId) {
      const existing = (S.banks || []).find((b) => b.id === card.linkedBankId);
      if (existing) {
        card.linkedBank = existing.bankName;
        return existing;
      }
    }
    if (card.linkedBank) {
      const byName = (S.banks || []).find((b) => b.bankName === card.linkedBank);
      if (byName) {
        card.linkedBankId = byName.id;
        return byName;
      }
    }

    const bank = createBank ? this.ensureBankForCard(card.cardName) : this.matchBankForCard(card.cardName);
    if (bank) this.applyLink(card, bank);
    return bank || null;
  },

  /** Link all cards missing a valid bank link. Returns count newly linked. */
  linkOrphanCards(opts = {}) {
    let n = 0;
    (S.cards || []).forEach((c) => {
      const had = c.linkedBankId && (S.banks || []).some((b) => b.id === c.linkedBankId);
      const bank = this.linkCard(c, opts);
      if (bank && !had) n++;
    });
    return n;
  },

  /** When a bank is added/updated, attach matching orphan cards. */
  linkCardsToBank(bank) {
    if (!bank) return 0;
    let n = 0;
    (S.cards || []).forEach((c) => {
      const hasValid = c.linkedBankId && (S.banks || []).some((b) => b.id === c.linkedBankId);
      if (hasValid) return;
      if (this.matchBankForCard(c.cardName, [bank])) {
        this.applyLink(c, bank);
        n++;
      }
    });
    return n;
  },

  cardsForBank(bankId) {
    const bank = (S.banks || []).find((b) => b.id === bankId);
    return (S.cards || []).filter(
      (c) => c.linkedBankId === bankId || (bank && c.linkedBank === bank.bankName)
    );
  },

  loansForContact(contactId) {
    return (S.loans || []).filter((l) => {
      const contact = (S.friends || []).find((f) => f.id === contactId);
      return contact && l.person === contact.name;
    });
  },

  docsForMember(memberId) {
    if (!memberId) return [];
    return (S.documents || []).filter((d) => d.ownerId === memberId);
  },

  bankSummary(bankId) {
    const bank = (S.banks || []).find((b) => b.id === bankId);
    if (!bank) return null;
    const cards = this.cardsForBank(bankId);
    return { bank, cards, cardCount: cards.length, jointWith: bank.jointWith || null };
  },

  byTag(tag) {
    const results = [];
    const search = (arr, type) =>
      (arr || [])
        .filter((x) => (x.tags || []).includes(tag))
        .forEach((x) => results.push({ ...x, _type: type }));
    search(S.banks, 'bank');
    search(S.cards, 'card');
    search(S.documents, 'document');
    search(S.investments, 'investment');
    search(S.loans, 'loan');
    search(S.cash, 'cash');
    return results;
  },

  loanNetImpact() {
    const fx = typeof getFX === 'function' ? getFX() : { PKR: 1, GBP: 355, USD: 280, AED: 76 };
    const toBase = (amt, cur) => (amt || 0) * (fx[cur] || 1);
    const owe = (S.loans || [])
      .filter((l) => l.type === 'borrowed' && l.status !== 'Settled')
      .reduce((a, l) => a + toBase(l.amount, l.currency || 'PKR'), 0);
    const owed = (S.loans || [])
      .filter((l) => l.type === 'lent' && l.status !== 'Settled')
      .reduce((a, l) => a + toBase(l.amount, l.currency || 'PKR'), 0);
    return { owe, owed, net: owed - owe };
  },
};
