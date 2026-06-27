// @ts-check
const { test, expect } = require('@playwright/test');
const { unlockDemoVault, dismissOverlays } = require('./demo-unlock');

const DEMO_PIN = '123456';

async function enterPin(page, pin) {
  for (const digit of pin) {
    await page.locator('button.key', { hasText: new RegExp(`^${digit}$`) }).click();
  }
}

async function openSettings(page) {
  await dismissOverlays(page);
  await page.evaluate(() => R.goto('settings'));
  await expect(page.locator('#pg-settings.on')).toBeVisible({ timeout: 10000 });
}

test.describe('VaultCap smoke', () => {
  test('loads welcome or lock screen', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: 'VaultCap' })).toBeVisible({ timeout: 15000 });
    const screen = page.locator('#pgLock:visible, #pgHome:visible, #pgOnboard:visible, #app:visible').first();
    await expect(screen).toBeVisible();
  });

  test('demo vault unlocks with PIN 123456', async ({ page }) => {
    await unlockDemoVault(page);
    await expect(page.locator('#dashGreet')).toBeVisible();
  });

  test('settings hides bottom tabs on utility pages', async ({ page }) => {
    await unlockDemoVault(page);
    await openSettings(page);
    await expect(page.locator('body')).toHaveClass(/hide-btabs/);
    await expect(page.locator('#settBody')).toBeVisible();
  });

  test('navigates to banks after unlock', async ({ page }) => {
    await unlockDemoVault(page);
    const banksTab = page.locator('[data-pg="banks"]').first();
    await expect(banksTab).toBeVisible();
    await banksTab.click();
    await expect(page.locator('#pg-banks.on')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Banks' })).toBeVisible();
  });

  test('opens security center page', async ({ page }) => {
    await unlockDemoVault(page);
    await page.evaluate(() => R.goto('security'));
    await expect(page.locator('#pg-security.on')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: /Security Center/i })).toBeVisible();
  });

  test('dashboard shows net worth greeting after unlock', async ({ page }) => {
    await unlockDemoVault(page);
    await page.locator('[data-pg="dashboard"]').first().click();
    await expect(page.locator('#pg-dashboard.on')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#dashGreet')).toBeVisible();
  });

  test('navigates to family module when enabled', async ({ page }) => {
    await unlockDemoVault(page);
    await page.locator('[data-pg="family"]').click();
    await expect(page.locator('#pg-family.on')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: /Family/i })).toBeVisible();
  });

  test('settings shows export backup buttons', async ({ page }) => {
    await unlockDemoVault(page);
    await openSettings(page);
    await page.evaluate(() => SettingsNav.show('backup'));
    await expect(page.getByRole('button', { name: /Export as CSV/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Export Encrypted Vault/i })).toBeVisible();
  });
});
