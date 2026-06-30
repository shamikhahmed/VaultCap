// @ts-check
const { test, expect } = require('@playwright/test');
const { unlockDemoVault, dismissOverlays } = require('./demo-unlock');

/**
 * WebKit engine (Safari) + iPhone 14 viewport — closest automated proxy for real-device Safari QA.
 * Run with: npx playwright test --project=webkit-iphone
 */

const SAFARI_PAGES = [
  'dashboard', 'banks', 'cards', 'cash', 'expenses', 'documents', 'settings', 'import',
];

test.describe('VaultCap WebKit / iPhone Safari', () => {
  test('demo unlock and dashboard render on WebKit', async ({ page }) => {
    await unlockDemoVault(page);
    await expect(page.locator('#dashGreet')).not.toBeEmpty();
    await expect(page.locator('#app')).toBeVisible();
  });

  for (const pg of SAFARI_PAGES) {
    test(`WebKit navigates to ${pg}`, async ({ page }) => {
      await unlockDemoVault(page);
      await dismissOverlays(page);
      await page.evaluate((id) => R.goto(id, true), pg);
      const target = ['gadgets', 'vehicles', 'gold'].includes(pg) ? 'assets' : pg;
      await expect(page.locator(`#pg-${target}.on`)).toBeVisible({ timeout: 15000 });
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.waitForTimeout(400);
      const fatal = errors.filter((e) => /ReferenceError|SyntaxError/i.test(e));
      expect(fatal).toEqual([]);
    });
  }

  test('WebKit bank add form saves and deletes', async ({ page }) => {
    await unlockDemoVault(page);
    const ok = await page.evaluate(() => {
      window.__vos_confirm = () => true;
      const tag = 'WebKit Bank ' + Date.now();
      Banks.openAdd();
      document.getElementById('bf-name').value = tag;
      document.getElementById('bf-cc').value = 'GB';
      document.getElementById('bf-cur').value = 'GBP';
      Banks.save();
      const b = S.banks.find((x) => x.bankName === tag);
      if (!b) return false;
      Banks.del(b.id, true);
      S.trash = S.trash.filter((t) => t.data?.bankName !== tag);
      return true;
    });
    expect(ok).toBe(true);
  });

  test('WebKit touch viewport has no horizontal overflow on dashboard', async ({ page }) => {
    await unlockDemoVault(page);
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth > doc.clientWidth + 2;
    });
    expect(overflow).toBe(false);
  });
});
