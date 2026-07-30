// @ts-check
const { test, expect } = require('@playwright/test');
const { unlockDemoVault, dismissOverlays } = require('./demo-unlock');

test.describe('VaultCap vault switch', () => {
  test('Switch Vault always visible on lock after demo unlock', async ({ page }) => {
    await unlockDemoVault(page);
    await dismissOverlays(page);
    await page.evaluate(() => { if (typeof R !== 'undefined' && R.lock) R.lock(); });
    await expect(page.locator('#pgLock')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#switchProfileBtn')).toBeVisible();
    await expect(page.locator('#switchProfileBtn')).toHaveText(/Switch Vault/i);
  });

  test('VaultProfiles.switch flushes and uses vaultos DB names', async ({ page }) => {
    await unlockDemoVault(page);
    await dismissOverlays(page);
    const meta = await page.evaluate(() => {
      const src = String(VaultProfiles.switch);
      return {
        hasFlush: src.includes('Store.flush'),
        clearsKey: src.includes('sessionKey'),
        dbName: VaultProfiles.dbName(),
        active: VaultProfiles.active(),
      };
    });
    expect(meta.hasFlush).toBe(true);
    expect(meta.clearsKey).toBe(true);
    expect(meta.dbName).toBe('vaultos_demo');
    expect(meta.active).toBe('demo');
  });

  test('switch to personal updates profile (no demo init override)', async ({ page }) => {
    // No unlockDemoVault initScript — it would force demo on every nav
    await page.goto('/?demo=1');
    await page.waitForFunction(() => typeof VaultProfiles !== 'undefined', null, { timeout: 15000 });
    await page.evaluate(async () => {
      if (typeof Store !== 'undefined' && Store.flush) await Store.flush();
      if (typeof VaultDB !== 'undefined') VaultDB.sessionKey = null;
      localStorage.setItem('vo_active_profile', 'personal');
      localStorage.setItem('vo_used_demo', '1');
    });
    await page.goto('./index.html');
    await page.waitForFunction(() => localStorage.getItem('vo_active_profile') === 'personal', null, { timeout: 10000 });
    const active = await page.evaluate(() => VaultProfiles.active());
    expect(active).toBe('personal');
    expect(await page.evaluate(() => VaultProfiles.dbName())).toBe('vaultos');
  });
});
