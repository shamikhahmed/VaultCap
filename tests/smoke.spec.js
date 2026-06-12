// @ts-check
const { test, expect } = require('@playwright/test');

async function enterPin(page, pin) {
  for (const digit of pin) {
    await page.locator('button.key', { hasText: new RegExp(`^${digit}$`) }).click();
  }
}

test.describe('VaultCap smoke', () => {
  test('loads welcome or lock screen', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: 'VaultCap' })).toBeVisible({ timeout: 15000 });
    const screen = page.locator('#pgLock:visible, #pgHome:visible, #pgOnboard:visible, #app:visible').first();
    await expect(screen).toBeVisible();
  });

  test('unlocks with demo PIN when vault exists', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    if (!(await page.locator('#pgLock').isVisible())) {
      test.skip(true, 'No lock screen — complete onboarding first or use existing vault profile');
      return;
    }

    await enterPin(page, '123456');
    await expect(page.locator('#app')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#dashGreet')).toBeVisible();
  });

  test('settings hides bottom tabs on utility pages', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    if (await page.locator('#pgLock').isVisible()) {
      await enterPin(page, '123456');
      await expect(page.locator('#app')).toBeVisible({ timeout: 10000 });
    } else if (!(await page.locator('#app').isVisible())) {
      test.skip(true, 'App shell not available without vault unlock');
      return;
    }

    await page.locator('[data-pg="settings"]').first().click();
    await page.waitForTimeout(400);

    await expect(page.locator('#pg-settings.on')).toBeVisible();
    await expect(page.locator('body')).toHaveClass(/hide-btabs/);
    await expect(page.locator('#settBody')).toBeVisible();
  });

  test('navigates to banks after unlock', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    if (await page.locator('#pgLock').isVisible()) {
      await enterPin(page, '123456');
      await expect(page.locator('#app')).toBeVisible({ timeout: 10000 });
    } else if (!(await page.locator('#app').isVisible())) {
      test.skip(true, 'App shell not available without vault unlock');
      return;
    }

    const banksTab = page.locator('[data-pg="banks"]').first();
    if (!(await banksTab.isVisible())) {
      test.skip(true, 'Banks module not in navigation');
      return;
    }

    await banksTab.click();
    await expect(page.locator('#pg-banks.on')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Banks' })).toBeVisible();
  });

  test('opens security page from nav', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    if (await page.locator('#pgLock').isVisible()) {
      await enterPin(page, '123456');
      await expect(page.locator('#app')).toBeVisible({ timeout: 10000 });
    } else if (!(await page.locator('#app').isVisible())) {
      test.skip(true, 'App shell not available without vault unlock');
      return;
    }

    const securityTab = page.locator('[data-pg="security"]').first();
    if (!(await securityTab.isVisible())) {
      test.skip(true, 'Security not in bottom nav');
      return;
    }

    await securityTab.click();
    await expect(page.locator('#pg-security.on')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: /Security Center/i })).toBeVisible();
  });

  test('dashboard shows net worth greeting after unlock', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    if (await page.locator('#pgLock').isVisible()) {
      await enterPin(page, '123456');
      await expect(page.locator('#app')).toBeVisible({ timeout: 10000 });
    } else if (!(await page.locator('#app').isVisible())) {
      test.skip(true, 'App shell not available without vault unlock');
      return;
    }

    await page.locator('[data-pg="dashboard"]').first().click();
    await expect(page.locator('#pg-dashboard.on')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#dashGreet')).toBeVisible();
  });
});
