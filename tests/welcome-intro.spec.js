// @ts-check
const { test, expect } = require('@playwright/test');

const freshProfileInit = () => {
  return `
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    try {
      localStorage.removeItem('vc_intro_seen');
      localStorage.removeItem('vos_prefs');
      localStorage.removeItem('vos3');
      localStorage.removeItem('vo_used_demo');
      localStorage.removeItem('vo_active_profile');
      sessionStorage.removeItem('vc_splash_seen');
    } catch (e) {}
  `;
};

test.describe('Welcome intro', () => {
  test('normal Playwright run never shows welcome intro (webdriver guard)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2500);
    await expect(page.locator('#welcomeIntro')).toBeHidden();
  });

  test.describe('forced first-run intro', () => {
    test.beforeEach(async ({ context }) => {
      await context.addInitScript(freshProfileInit());
    });

    test('shows on fresh profile, Skip dismisses, flag persists', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      const intro = page.locator('#welcomeIntro');
      await expect(intro).toBeVisible({ timeout: 20000 });
      await page.locator('#welcomeIntroSkip').click();
      await expect(intro).not.toBeAttached({ timeout: 8000 });
      await expect
        .poll(() => page.evaluate(() => localStorage.getItem('vc_intro_seen')))
        .toBe('1');
    });

    test('does not show again after reload', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      const intro = page.locator('#welcomeIntro');
      await expect(intro).toBeVisible({ timeout: 20000 });
      await page.locator('#welcomeIntroSkip').click();
      await expect(intro).not.toBeAttached({ timeout: 8000 });
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2500);
      await expect(intro).toBeHidden();
    });
  });
});