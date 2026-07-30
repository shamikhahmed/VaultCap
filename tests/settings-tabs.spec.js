// @ts-check
const { test, expect } = require('@playwright/test');
const { unlockDemoVault, dismissOverlays } = require('./demo-unlock');

const SETTINGS_TABS = [
  'account',
  'general',
  'appearance',
  'accessibility',
  'notifications',
  'privacy',
  'about',
];

const LEGACY_ALIASES = [
  ['profile', 'account'],
  ['security', 'account'],
  ['modules', 'general'],
  ['backup', 'privacy'],
  ['import', 'privacy'],
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
      const cur = await page.evaluate(() => SettingsNav.current);
      expect(cur).toBe(tab);
    });
  }

  for (const [legacy, home] of LEGACY_ALIASES) {
    test(`legacy alias ${legacy} → ${home}`, async ({ page }) => {
      await page.evaluate((id) => SettingsNav.show(id), legacy);
      await page.waitForTimeout(200);
      const cur = await page.evaluate(() => SettingsNav.current);
      expect(cur).toBe(home);
    });
  }

  test('privacy tab shows export actions', async ({ page }) => {
    await page.evaluate(() => SettingsNav.show('privacy'));
    await expect(page.getByRole('button', { name: /Export as CSV/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Export Encrypted Vault/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Export Financial Summary PDF/i })).toBeVisible();
  });

  test('appearance has theme only (no large-text dupe)', async ({ page }) => {
    await page.evaluate(() => SettingsNav.show('appearance'));
    await expect(page.getByRole('radio', { name: /Dark/i })).toBeVisible();
    await expect(page.locator('#settBody')).not.toContainText('Large text');
  });

  test('accessibility owns large text + reduce motion', async ({ page }) => {
    await page.evaluate(() => SettingsNav.show('accessibility'));
    await expect(page.locator('#settBody')).toContainText('Large Text');
    await expect(page.locator('#settBody')).toContainText('Reduce Motion');
    await expect(page.locator('#settBody')).not.toContainText('Privacy Mode');
  });
});
