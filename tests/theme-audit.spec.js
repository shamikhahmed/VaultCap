// @ts-check
const { test, expect } = require('@playwright/test');
const { unlockDemoVault } = require('./demo-unlock');

test.describe('VaultCap theme', () => {
  test.beforeEach(async ({ page }) => {
    await unlockDemoVault(page);
  });

  test('dark, light, and system themes apply without blue accent drift', async ({ page }) => {
    const check = async (themeId) => {
      await page.evaluate((id) => ThemeEngine.apply(id), themeId);
      return page.evaluate(() => {
        const accent = getComputedStyle(document.body).getPropertyValue('--accent').trim();
        const isLight = document.body.classList.contains('light');
        const hasBlue = /5b8dee|3a6fd8|0a84ff|91,\s*141,\s*238/i.test(accent);
        return { theme: S.user.theme, accent, isLight, hasBlue };
      });
    };

    const dark = await check('dark');
    expect(dark.theme).toBe('dark');
    expect(dark.isLight).toBe(false);
    expect(dark.hasBlue).toBe(false);

    const light = await check('light');
    expect(light.theme).toBe('light');
    expect(light.isLight).toBe(true);
    expect(light.accent.toLowerCase()).toMatch(/#000|#000000|rgb\(0,\s*0,\s*0\)/);
    expect(light.hasBlue).toBe(false);

    const auto = await check('auto');
    expect(auto.theme).toBe('auto');
  });

  test('settings appearance shows Dark, Light, System', async ({ page }) => {
    await page.evaluate(() => {
      R.goto('settings');
      if (typeof SettingsNav !== 'undefined') SettingsNav.show('appearance');
    });
    await expect(page.locator('#settBody')).toContainText('Dark');
    await expect(page.locator('#settBody')).toContainText('Light');
    await expect(page.locator('#settBody')).toContainText('System');
  });
});
