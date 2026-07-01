// @ts-check
const { test, expect } = require('@playwright/test');
const { unlockDemoVault, dismissOverlays } = require('./demo-unlock');

test.describe('VaultCap modules', () => {
  test.beforeEach(async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await unlockDemoVault(page);
    page._vaultErrors = errors;
  });

  function assertNoRuntimeErrors(page) {
    const errors = page._vaultErrors || [];
    const fatal = errors.filter((e) => /escHtml|ReferenceError|SyntaxError/i.test(e));
    expect(fatal, fatal.join('\n')).toEqual([]);
  }

  test('cards tab renders without escHtml crash', async ({ page }) => {
    await page.locator('[data-pg="cards"]').first().click();
    await expect(page.locator('#pg-cards.on')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#cItems')).toBeVisible();
    await page.waitForTimeout(300);
    assertNoRuntimeErrors(page);
    const html = await page.locator('#cItems').innerHTML();
    expect(html.length).toBeGreaterThan(10);
  });

  test('assets tab renders without escHtml crash', async ({ page }) => {
    await page.locator('[data-pg="assets"]').first().click();
    await expect(page.locator('#pg-assets.on')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#aItems')).toBeVisible();
    await page.waitForTimeout(300);
    assertNoRuntimeErrors(page);
    const html = await page.locator('#aItems').innerHTML();
    expect(html.length).toBeGreaterThan(10);
  });

  test('family tab renders member content', async ({ page }) => {
    await page.locator('[data-pg="family"]').first().click();
    await expect(page.locator('#pg-family.on')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(300);
    assertNoRuntimeErrors(page);
    const body = await page.locator('#pg-family-body, #familyList, #pg-family').first().innerHTML();
    expect(body.length).toBeGreaterThan(20);
  });

  test('loans tab renders summary', async ({ page }) => {
    await page.evaluate(() => R.goto('loans'));
    await expect(page.locator('#pg-loans.on, [id*="loan"]').first()).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(300);
    assertNoRuntimeErrors(page);
  });

  test('tax tab opens slab editor', async ({ page }) => {
    await page.evaluate(() => R.goto('tax'));
    await expect(page.locator('#pg-tax.on')).toBeVisible({ timeout: 10000 });
    await dismissOverlays(page);
    const editBtn = page.getByRole('button', { name: /Edit slabs/i });
    if (await editBtn.count()) {
      await editBtn.first().click();
      await expect(page.locator('#tax-slab-rows')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('button', { name: /Add Slab/i })).toBeVisible();
    }
    assertNoRuntimeErrors(page);
  });
});
