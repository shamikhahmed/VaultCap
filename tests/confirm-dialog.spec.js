// @ts-check
const { test, expect } = require('@playwright/test');
const { unlockDemoVault, dismissOverlays } = require('./demo-unlock');

test.describe('VLT-P1-02 ConfirmDialog', () => {
  test('CapConfirm replaces native confirm; Cancel keeps item', async ({ page }) => {
    await unlockDemoVault(page);
    await dismissOverlays(page);

    const hasApi = await page.evaluate(
      () => typeof window.CapConfirm === 'function' && typeof window.__vos_confirm === 'function'
    );
    expect(hasApi).toBe(true);

    const before = await page.evaluate(() => (S.banks || []).length);
    expect(before).toBeGreaterThan(0);

    const dialogPromise = page.waitForSelector('#vc-confirm-backdrop', { timeout: 8000 });
    await page.evaluate(() => {
      const b = (S.banks || [])[0];
      if (!b) throw new Error('no bank');
      Banks.del(b.id, false);
    });
    await dialogPromise;
    await expect(page.locator('#vc-dlg-title')).toBeVisible();
    await page.locator('#vc-confirm-backdrop button.btn').filter({ hasText: 'Cancel' }).click();
    await expect(page.locator('#vc-confirm-backdrop')).toHaveCount(0);
    const after = await page.evaluate(() => (S.banks || []).length);
    expect(after).toBe(before);
  });

  test('Settings switches expose role=switch', async ({ page }) => {
    await unlockDemoVault(page);
    await dismissOverlays(page);
    await page.evaluate(() => {
      if (typeof R !== 'undefined') R.goto('settings');
      if (typeof SettingsNav !== 'undefined') SettingsNav.show('privacy');
    });
    await expect(page.locator('label.tog input[role="switch"]').first()).toBeVisible({ timeout: 8000 });
  });
});
