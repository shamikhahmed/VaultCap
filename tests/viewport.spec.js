// @ts-check
const { test, expect } = require('@playwright/test');
const { unlockDemoVault } = require('./demo-unlock');

const VIEWPORTS = {
  mobile: { width: 375, height: 812 },
  desktop: { width: 1280, height: 800 },
};

/** @param {import('@playwright/test').Page} page */
async function resize(page, name) {
  const vp = VIEWPORTS[name];
  if (!vp) throw new Error(`Unknown viewport: ${name}`);
  await page.setViewportSize(vp);
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
