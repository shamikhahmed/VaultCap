// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('VaultCap lockout persistence', () => {
  test('localStorage lockout survives sessionStorage clear', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.evaluate(() => {
      localStorage.setItem('vc_lockout_v1_personal', JSON.stringify({
        fails: 3,
        lockedUntil: Date.now() + 60000,
        at: Date.now(),
      }));
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    const state = await page.evaluate(() => ({
      fails: typeof S !== 'undefined' ? S.fails : -1,
      lockedUntil: typeof S !== 'undefined' ? S.lockedUntil : 0,
    }));
    expect(state.fails).toBe(3);
    expect(state.lockedUntil).toBeGreaterThan(Date.now());
    await page.evaluate(() => {
      localStorage.removeItem('vc_lockout_v1_personal');
      if (typeof S !== 'undefined') { S.fails = 0; S.lockedUntil = 0; }
    });
  });
});
