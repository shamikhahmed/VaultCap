// @ts-check
const { test, expect } = require('@playwright/test');
const { unlockDemoVault } = require('./demo-unlock');

/** @param {import('@playwright/test').Page} page */
async function crud(page, fn) {
  const result = await page.evaluate(fn);
  expect(result.ok, `CRUD failed at ${result.step} (${result.tag || ''})`).toBe(true);
}

test.describe('VaultCap CRUD round-trip', () => {
  test.beforeEach(async ({ page }) => {
    await unlockDemoVault(page);
  });

  test('banks: create → update → delete', async ({ page }) => {
    await crud(page, () => {
      window.__vos_confirm = () => true;
      const tag = 'E2E Bank ' + Date.now();
      Banks.openAdd();
      document.getElementById('bf-name').value = tag;
      document.getElementById('bf-cc').value = 'GB';
      document.getElementById('bf-cur').value = 'GBP';
      document.getElementById('bf-bal').value = '1000';
      Banks.save();
      let b = S.banks.find((x) => x.bankName === tag);
      if (!b) return { ok: false, step: 'create', tag };
      Banks.edit(b.id);
      document.getElementById('bf-name').value = tag + ' Updated';
      Banks.save(b.id);
      b = S.banks.find((x) => x.id === b.id);
      if (!b || b.bankName !== tag + ' Updated') return { ok: false, step: 'update', tag };
      Banks.del(b.id, true);
      if (S.banks.find((x) => x.id === b.id)) return { ok: false, step: 'delete', tag };
      S.trash = S.trash.filter((t) => t.data?.bankName !== tag + ' Updated');
      return { ok: true, tag };
    });
  });

  test('expenses: create → update → delete', async ({ page }) => {
    await crud(page, () => {
      window.__vos_confirm = () => true;
      const tag = 'E2E Expense ' + Date.now();
      Exp.openAdd();
      document.getElementById('ef-name').value = tag;
      document.getElementById('ef-amt').value = '9.99';
      document.getElementById('ef-cur').value = 'GBP';
      document.getElementById('ef-cat').value = 'Other';
      Exp.save();
      let e = S.expenses.find((x) => x.name === tag);
      if (!e) return { ok: false, step: 'create', tag };
      Exp.edit(e.id);
      document.getElementById('ef-name').value = tag + ' Updated';
      Exp.save(e.id);
      e = S.expenses.find((x) => x.id === e.id);
      if (!e || e.name !== tag + ' Updated') return { ok: false, step: 'update', tag };
      Exp.del(e.id, true);
      S.trash = S.trash.filter((t) => t.data?.name !== tag + ' Updated');
      return { ok: true, tag };
    });
  });

  test('cash: create → update → delete', async ({ page }) => {
    await crud(page, () => {
      window.__vos_confirm = () => true;
      const tag = 'E2E Cash ' + Date.now();
      Cash.openAdd();
      document.getElementById('cf-loc').value = 'Wallet';
      document.getElementById('cf-amt').value = '500';
      document.getElementById('cf-cur').value = 'GBP';
      document.getElementById('cf-notes').value = tag;
      Cash.save();
      let c = S.cash.find((x) => x.notes === tag);
      if (!c) return { ok: false, step: 'create', tag };
      Cash.edit(c.id);
      document.getElementById('cf-notes').value = tag + ' Updated';
      Cash.save(c.id);
      c = S.cash.find((x) => x.id === c.id);
      if (!c || c.notes !== tag + ' Updated') return { ok: false, step: 'update', tag };
      Cash.del(c.id, true);
      S.trash = S.trash.filter((t) => t.data?.notes !== tag + ' Updated');
      return { ok: true, tag };
    });
  });

  test('friends: create → update → delete', async ({ page }) => {
    await crud(page, () => {
      window.__vos_confirm = () => true;
      const tag = 'E2E Friend ' + Date.now();
      Friends.openAdd();
      document.getElementById('ff-name').value = tag;
      document.getElementById('ff-phone').value = '+447700900123';
      Friends.save();
      let f = S.friends.find((x) => x.name === tag);
      if (!f) return { ok: false, step: 'create', tag };
      Friends.edit(f.id);
      document.getElementById('ff-name').value = tag + ' Updated';
      Friends.save(f.id);
      f = S.friends.find((x) => x.id === f.id);
      if (!f || f.name !== tag + ' Updated') return { ok: false, step: 'update', tag };
      Friends.del(f.id, true);
      S.trash = S.trash.filter((t) => t.data?.name !== tag + ' Updated');
      return { ok: true, tag };
    });
  });

  test('sims: create → update → delete', async ({ page }) => {
    await crud(page, () => {
      window.__vos_confirm = () => true;
      const tag = 'E2E Network ' + Date.now();
      Sims.openAdd();
      document.getElementById('sf-cc').value = 'GB';
      document.getElementById('sf-net').value = tag;
      Sims.save();
      let s = S.sims.find((x) => x.network === tag);
      if (!s) return { ok: false, step: 'create', tag };
      Sims.edit(s.id);
      document.getElementById('sf-net').value = tag + ' Updated';
      Sims.save(s.id);
      s = S.sims.find((x) => x.id === s.id);
      if (!s || s.network !== tag + ' Updated') return { ok: false, step: 'update', tag };
      Sims.del(s.id, true);
      S.trash = S.trash.filter((t) => t.data?.network !== tag + ' Updated');
      return { ok: true, tag };
    });
  });

  test('loans: create → update → delete', async ({ page }) => {
    await crud(page, () => {
      window.__vos_confirm = () => true;
      const tag = 'E2E Lender ' + Date.now();
      Loans.openAdd('lent');
      document.getElementById('lf-person').value = tag;
      document.getElementById('lf-amt').value = '2000';
      document.getElementById('lf-cur').value = 'GBP';
      Loans.save();
      let l = S.loans.find((x) => x.person === tag);
      if (!l) return { ok: false, step: 'create', tag };
      Loans.edit(l.id);
      document.getElementById('lf-person').value = tag + ' Updated';
      Loans.save(l.id);
      l = S.loans.find((x) => x.id === l.id);
      if (!l || l.person !== tag + ' Updated') return { ok: false, step: 'update', tag };
      Loans.del(l.id, true);
      S.trash = S.trash.filter((t) => t.data?.person !== tag + ' Updated');
      return { ok: true, tag };
    });
  });

  test('investments: create → update → delete', async ({ page }) => {
    await crud(page, () => {
      window.__vos_confirm = () => true;
      const tag = 'E2E Fund ' + Date.now();
      Inv.openAdd();
      document.getElementById('if-name').value = tag;
      document.getElementById('if-broker').value = 'E2E Broker';
      document.getElementById('if-cur').value = 'GBP';
      document.getElementById('if-inv').value = '1000';
      document.getElementById('if-cur2').value = '1100';
      Inv.save();
      let i = S.investments.find((x) => x.investmentName === tag);
      if (!i) return { ok: false, step: 'create', tag };
      Inv.edit(i.id);
      document.getElementById('if-name').value = tag + ' Updated';
      Inv.save(i.id);
      i = S.investments.find((x) => x.id === i.id);
      if (!i || i.investmentName !== tag + ' Updated') return { ok: false, step: 'update', tag };
      Inv.del(i.id, true);
      S.trash = S.trash.filter((t) => t.data?.investmentName !== tag + ' Updated');
      return { ok: true, tag };
    });
  });

  test('emails: create → update → delete', async ({ page }) => {
    await crud(page, () => {
      window.__vos_confirm = () => true;
      const tag = 'e2e' + Date.now() + '@audit.test';
      Emails.openAdd();
      document.getElementById('emf-addr').value = tag;
      document.getElementById('emf-prov').value = 'Gmail';
      Emails.save();
      let e = S.emails.find((x) => x.email === tag);
      if (!e) return { ok: false, step: 'create', tag };
      Emails.edit(e.id);
      document.getElementById('emf-prov').value = 'Outlook';
      Emails.save(e.id);
      e = S.emails.find((x) => x.id === e.id);
      if (!e || e.provider !== 'Outlook') return { ok: false, step: 'update', tag };
      Emails.del(e.id, true);
      S.trash = S.trash.filter((t) => t.data?.email !== tag);
      return { ok: true, tag };
    });
  });

  test('digital: create → update → delete', async ({ page }) => {
    await crud(page, () => {
      window.__vos_confirm = () => true;
      const tag = 'E2E Service ' + Date.now();
      Digital.openAdd();
      document.getElementById('df-name').value = tag;
      document.getElementById('df-cat').value = 'Other';
      Digital.save();
      let d = S.digital.find((x) => x.serviceName === tag);
      if (!d) return { ok: false, step: 'create', tag };
      Digital.edit(d.id);
      document.getElementById('df-name').value = tag + ' Updated';
      Digital.save(d.id);
      d = S.digital.find((x) => x.id === d.id);
      if (!d || d.serviceName !== tag + ' Updated') return { ok: false, step: 'update', tag };
      Digital.del(d.id, true);
      S.trash = S.trash.filter((t) => t.data?.serviceName !== tag + ' Updated');
      return { ok: true, tag };
    });
  });

  test('assets: create → update → delete', async ({ page }) => {
    await crud(page, () => {
      window.__vos_confirm = () => true;
      const tag = 'E2E Asset ' + Date.now();
      Assets.openAdd();
      document.getElementById('af-type').value = 'other';
      document.getElementById('af-name').value = tag;
      document.getElementById('af-cur').value = 'GBP';
      document.getElementById('af-pp').value = '100';
      document.getElementById('af-cv').value = '100';
      Assets.save();
      let a = S.assets.find((x) => x.name === tag);
      if (!a) return { ok: false, step: 'create', tag };
      Assets.edit(a.id);
      document.getElementById('af-name').value = tag + ' Updated';
      Assets.save(a.id);
      a = S.assets.find((x) => x.id === a.id);
      if (!a || a.name !== tag + ' Updated') return { ok: false, step: 'update', tag };
      Assets.del(a.id, true);
      S.trash = S.trash.filter((t) => t.data?.name !== tag + ' Updated');
      return { ok: true, tag };
    });
  });

  test('cards: create → update → delete', async ({ page }) => {
    await crud(page, () => {
      window.__vos_confirm = () => true;
      const tag = 'E2E Card ' + Date.now();
      Cards.openAdd();
      document.getElementById('cf-name').value = tag;
      document.getElementById('cf-net').value = 'Visa';
      document.getElementById('cf-l4').value = '4242';
      document.getElementById('cf-cc').value = 'GB';
      Cards.save();
      let c = S.cards.find((x) => x.cardName === tag);
      if (!c) return { ok: false, step: 'create', tag };
      Cards.edit(c.id);
      document.getElementById('cf-name').value = tag + ' Updated';
      Cards.save(c.id);
      c = S.cards.find((x) => x.id === c.id);
      if (!c || c.cardName !== tag + ' Updated') return { ok: false, step: 'update', tag };
      Cards.del(c.id, true);
      S.trash = S.trash.filter((t) => t.data?.cardName !== tag + ' Updated');
      return { ok: true, tag };
    });
  });
});
