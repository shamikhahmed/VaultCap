// VaultOS — © 2026 Shamikh Ahmed. Source-available. See LICENSE.
// Entity validators — call Validators.run(entity, 'bank') before saving

const Validators = {
  bank(b) {
    const errors = [];
    if (!b.bankName?.trim()) errors.push('Bank name is required');
    if (!b.country) errors.push('Country is required');
    if (b.iban && !/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(b.iban.replace(/\s/g,''))) errors.push('Invalid IBAN format');
    return errors;
  },
  card(c) {
    const errors = [];
    if (!c.cardName?.trim()) errors.push('Card name is required');
    if (c.last4 && !/^\d{4}$/.test(c.last4)) errors.push('Last 4 digits must be exactly 4 numbers');
    if (c.expiry && !/^\d{2}\/\d{2}$/.test(c.expiry)) errors.push('Expiry must be MM/YY format');
    return errors;
  },
  document(d) {
    const errors = [];
    if (!d.docType) errors.push('Document type is required');
    if (d.expiry && isNaN(new Date(d.expiry))) errors.push('Invalid expiry date');
    return errors;
  },
  loan(l) {
    const errors = [];
    if (!l.person?.trim()) errors.push('Person name is required');
    if (!l.amount || l.amount <= 0) errors.push('Amount must be greater than 0');
    return errors;
  },
  investment(i) {
    const errors = [];
    if (!i.investmentName?.trim()) errors.push('Investment name is required');
    if (i.currentValue === undefined || i.currentValue < 0) errors.push('Current value must be 0 or greater');
    return errors;
  },
  run(entity, type) {
    const errors = this[type] ? this[type](entity) : [];
    if (errors.length) {
      if (typeof Toast !== 'undefined') Toast.show(errors[0], 'error');
      return false;
    }
    return true;
  },
};
