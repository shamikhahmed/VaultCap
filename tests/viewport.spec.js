// @ts-check
const { test, expect } = require('@playwright/test');
const {
  resize,
  assertVaultCapMobile,
  assertVaultCapDesktop,
} = require('../../capricorn-tooling/shared/testing/viewport-helpers');
const { unlockDemoVault } = require('./demo-unlock');

test.describe('VaultCap viewport contract', () => {
  test.beforeEach(async ({ page }) => {
    await unlockDemoVault(page);
  });

  test('320px — no horizontal overflow on dashboard', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.evaluate(() => R.goto('dashboard'));
    const overflow = await page.evaluate(() => {
      const el = document.getElementById('dashBody') || document.body;
      return el.scrollWidth > el.clientWidth + 2;
    });
    expect(overflow).toBe(false);
  });

  test('390px — bottom tabs visible', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await assertVaultCapMobile(page, expect);
  });

  test('769px — sidebar visible, bottom tabs hidden', async ({ page }) => {
    await page.setViewportSize({ width: 769, height: 1024 });
    await page.evaluate(() => R.goto('dashboard'));
    await expect(page.locator('#app')).toBeVisible();
    await expect(page.locator('.sidebar')).toBeVisible();
    await expect(page.locator('.btabs')).toBeHidden();
  });

  test('375px — bottom tabs, sidebar hidden', async ({ page }) => {
    await resize(page, 'mobile');
    await assertVaultCapMobile(page, expect);
  });

  test('1280px — sidebar visible, bottom tabs hidden', async ({ page }) => {
    await resize(page, 'desktop');
    await assertVaultCapDesktop(page, expect);
  });
});
