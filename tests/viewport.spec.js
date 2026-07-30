// @ts-check
const { test, expect } = require('@playwright/test');
const { unlockDemoVault } = require('./demo-unlock');

/** Shell chrome breakpoint: tabs &lt;700, sidebar ≥700 (iPad mini 744 → sidebar) */
const SHELL_BP = 700;

/** @param {import('@playwright/test').Page} page */
async function resize(page, width, height) {
  await page.setViewportSize({ width, height });
  await page.waitForTimeout(120);
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Expect} ex
 */
async function assertVaultCapMobile(page, ex) {
  await ex(page.locator('#sidebar')).toBeHidden();
  await ex(page.locator('.btabs')).toBeVisible();
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Expect} ex
 */
async function assertVaultCapDesktop(page, ex) {
  await ex(page.locator('#sidebar')).toBeVisible();
  await ex(page.locator('.btabs')).toBeHidden();
}

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

  test('iPad mini 744 — sidebar visible, bottom tabs hidden', async ({ page }) => {
    await page.setViewportSize({ width: 744, height: 1133 });
    await page.evaluate(() => R.goto('dashboard'));
    await expect(page.locator('#app')).toBeVisible();
    await assertVaultCapDesktop(page, expect);
  });

  test(`${SHELL_BP}px — sidebar visible, bottom tabs hidden`, async ({ page }) => {
    await page.setViewportSize({ width: SHELL_BP, height: 1024 });
    await page.evaluate(() => R.goto('dashboard'));
    await expect(page.locator('#app')).toBeVisible();
    await assertVaultCapDesktop(page, expect);
  });

  test('375px — bottom tabs, sidebar hidden', async ({ page }) => {
    await resize(page, 375, 812);
    await assertVaultCapMobile(page, expect);
  });

  test('1280px — sidebar visible, bottom tabs hidden', async ({ page }) => {
    await resize(page, 1280, 800);
    await assertVaultCapDesktop(page, expect);
  });
});
