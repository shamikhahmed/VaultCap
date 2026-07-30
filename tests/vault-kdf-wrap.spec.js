// @ts-check
const { test, expect } = require('@playwright/test');
const { unlockDemoVault, dismissOverlays } = require('./demo-unlock');

test.describe('VaultCap DEK wrap (PIN wraps key)', () => {
  test('demo unlock migrates to wrapped mode; re-unlock keeps data', async ({ page }) => {
    await unlockDemoVault(page);
    await dismissOverlays(page);

    const after = await page.evaluate(async () => {
      const mode = localStorage.getItem('vos_kdf_mode_demo') || localStorage.getItem('vos_kdf_mode');
      const hasWrap = !!(await indexedDB.databases?.());
      // Probe via VaultDB
      return {
        wrapped: VaultDB.isWrappedMode && VaultDB.isWrappedMode(),
        lsMode: mode,
        banks: (S.banks || []).length,
        unlocked: !!S.unlocked,
      };
    });
    expect(after.unlocked).toBe(true);
    expect(after.banks).toBeGreaterThan(0);
    // Silent migrate on unlock — demo profile key
    const wrapOk = await page.evaluate(async () => {
      const p = localStorage.getItem('vo_active_profile') || 'personal';
      const modeKey = p === 'personal' ? 'vos_kdf_mode' : 'vos_kdf_mode_' + p;
      return localStorage.getItem(modeKey) === 'wrapped' || (VaultDB.isWrappedMode && VaultDB.isWrappedMode());
    });
    expect(wrapOk).toBe(true);

    // Lock + unlock again — still works
    await page.evaluate(() => R.lock());
    await expect(page.locator('#pgLock')).toBeVisible({ timeout: 10000 });
    for (const d of '123456') {
      await page.locator(`#pgLock button.key[data-act="PIN.in('${d}')"]`).click();
    }
    await page.waitForFunction(() => document.getElementById('app')?.style.display === 'flex', null, { timeout: 20000 });
    const banks2 = await page.evaluate(() => (S.banks || []).length);
    expect(banks2).toBe(after.banks);
  });
});
