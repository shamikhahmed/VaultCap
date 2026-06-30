// @ts-check
const { test, expect } = require('@playwright/test');
const { unlockDemoVault, dismissOverlays } = require('./demo-unlock');

const SETTINGS_TABS = [
  'profile',
  'security',
  'appearance',
  'modules',
  'backup',
  'import',
  'accessibility',
  'about',
];

test.describe('VaultCap settings tabs', () => {
  test.beforeEach(async ({ page }) => {
    await unlockDemoVault(page);
    await dismissOverlays(page);
    await page.evaluate(() => R.goto('settings'));
    await expect(page.locator('#pg-settings.on')).toBeVisible({ timeout: 10000 });
  });

  for (const tab of SETTINGS_TABS) {
    test(`settings tab: ${tab}`, async ({ page }) => {
      await page.evaluate((id) => {
        if (typeof SettingsNav !== 'undefined') SettingsNav.show(id);
      }, tab);
      await page.waitForTimeout(300);
      const body = await page.locator('#settBody').innerHTML();
      expect(body.length).toBeGreaterThan(50);
    });
  }

  test('backup tab shows export actions', async ({ page }) => {
    await page.evaluate(() => SettingsNav.show('backup'));
    await expect(page.getByRole('button', { name: /Export as CSV/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Export Encrypted Vault/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Export Financial Summary PDF/i })).toBeVisible();
  });
});
