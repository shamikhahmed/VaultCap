// @ts-check
const { test, expect } = require('@playwright/test');
const { unlockDemoVault, dismissOverlays } = require('./demo-unlock');

/** @param {import('@playwright/test').Page} page */
async function openFormAndAssert(page, label, fn) {
  await dismissOverlays(page);
  await page.evaluate((call) => {
    // eslint-disable-next-line no-eval
    eval(call);
  }, fn);
  await expect(page.locator('#mBody')).toBeVisible({ timeout: 10000 });
  const html = await page.locator('#mBody').innerHTML();
  expect(html.length, `${label} form empty`).toBeGreaterThan(30);
  expect(html.includes('<script>'), `${label} has raw script`).toBe(false);
  await page.evaluate(() => Modal.close());
  await page.waitForTimeout(150);
}

test.describe('VaultCap forms', () => {
  test.beforeEach(async ({ page }) => {
    await unlockDemoVault(page);
  });

  const addForms = [
    ['Banks', 'Banks.openAdd()'],
    ['Cards', 'Cards.openAdd()'],
    ['Cash', 'Cash.openAdd()'],
    ['Investments', 'Inv.openAdd()'],
    ['Loans', 'Loans.openAdd()'],
    ['Sims', 'Sims.openAdd()'],
    ['Expenses', 'Exp.openAdd()'],
    ['Friends', 'Friends.openAdd()'],
    ['Digital', 'Digital.openAdd()'],
    ['Emails', 'Emails.openAdd()'],
    ['Assets', 'Assets.openAdd()'],
    ['Documents', 'DocsModule.openAdd()'],
    ['BC', 'BCModule.openAdd()'],
    ['Bonds', 'BondsModule.openAdd()'],
  ];

  for (const [label, call] of addForms) {
    test(`add form: ${label}`, async ({ page }) => {
      await openFormAndAssert(page, label, call);
    });
  }

  test('edit forms open with escAttr on bank XSS payload', async ({ page }) => {
    await dismissOverlays(page);
    const safe = await page.evaluate(() => {
      const id = U.id();
      S.banks.push({
        id,
        bankName: '"><img src=x onerror=alert(1)>',
        accountType: 'current',
        balance: 1,
        currency: 'GBP',
        country: 'GB',
        notes: "' onclick=alert(1) '",
        createdAt: new Date().toISOString(),
      });
      Banks.edit(id);
      const html = document.getElementById('mBody')?.innerHTML || '';
      Modal.close();
      S.banks = S.banks.filter((b) => b.id !== id);
      return { hasRaw: html.includes('<img src=x'), hasEscaped: html.includes('&lt;img') || html.includes('&quot;&gt;') };
    });
    expect(safe.hasRaw).toBe(false);
    expect(safe.hasEscaped).toBe(true);
  });

  test('edit first demo bank opens populated form', async ({ page }) => {
    await page.evaluate(() => {
      const b = (S.banks || [])[0];
      if (b) Banks.edit(b.id);
    });
    await expect(page.locator('#bf-name')).toBeVisible({ timeout: 8000 });
    const val = await page.locator('#bf-name').inputValue();
    expect(val.length).toBeGreaterThan(0);
    await page.evaluate(() => Modal.close());
  });

  test('edit first demo card opens populated form', async ({ page }) => {
    await page.evaluate(() => {
      const c = (S.cards || [])[0];
      if (c) Cards.edit(c.id);
    });
    await expect(page.locator('#mBody input, #mBody select').first()).toBeVisible({ timeout: 8000 });
    await page.evaluate(() => Modal.close());
  });
});
