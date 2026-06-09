// @ts-check
const { test, expect } = require('@playwright/test');

async function enterPin(page, pin) {
  for (const digit of pin) {
    await page.locator('button.key', { hasText: new RegExp(`^${digit}$`) }).click();
  }
}

test.describe('VaultOS smoke', () => {
  test('loads welcome or lock screen', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: 'VaultOS' })).toBeVisible({ timeout: 15000 });
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
});
