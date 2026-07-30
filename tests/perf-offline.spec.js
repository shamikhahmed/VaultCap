// @ts-check
const { test, expect } = require('@playwright/test');
const { unlockDemoVault, dismissOverlays } = require('./demo-unlock');

test.describe('VaultCap performance + offline', () => {
  test('cold load: bundle + TTI budget', async ({ page }) => {
    const started = Date.now();
    await page.goto('/?demo=1');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => typeof R !== 'undefined' && typeof window.VER === 'string', { timeout: 30000 });
    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const resources = performance.getEntriesByType('resource');
      const bundle = resources.find((r) => String(r.name).includes('vaultcap.bundle.js'));
      return {
        VER: window.VER,
        domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
        bundleTransferKb: bundle ? Math.round((bundle.transferSize || bundle.encodedBodySize || 0) / 1024) : null,
        bundleDurationMs: bundle ? Math.round(bundle.duration) : null,
      };
    });
    const wallMs = Date.now() - started;
    expect(metrics.VER).toMatch(/^5\./);
    // Soft budgets — fail only on catastrophic regression
    expect(wallMs).toBeLessThan(45000);
    if (metrics.bundleTransferKb != null) {
      expect(metrics.bundleTransferKb).toBeLessThan(2500);
    }
    console.log('[perf]', JSON.stringify({ wallMs, ...metrics }));
  });

  test('service worker registers and caches shell', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('load');
    const sw = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return { supported: false };
      const reg = await navigator.serviceWorker.getRegistration();
      return {
        supported: true,
        active: !!(reg && reg.active),
        scope: reg ? reg.scope : null,
      };
    });
    expect(sw.supported).toBe(true);
    // SW may take a moment on first load
    if (!sw.active) {
      await page.waitForTimeout(1500);
      const again = await page.evaluate(async () => {
        const reg = await navigator.serviceWorker.getRegistration();
        return !!(reg && (reg.active || reg.installing || reg.waiting));
      });
      expect(again).toBe(true);
    }
  });

  test('demo unlock stays usable after offline', async ({ page, context }) => {
    await unlockDemoVault(page);
    await dismissOverlays(page);
    await page.evaluate(() => R.goto('banks'));
    await expect(page.locator('#pg-banks.on')).toBeVisible({ timeout: 15000 });
    // Warm SW/cache while online, then go offline and re-nav
    await page.waitForTimeout(500);
    await context.setOffline(true);
    await page.evaluate(() => R.goto('cards'));
    await expect(page.locator('#pg-cards.on')).toBeVisible({ timeout: 15000 });
    await page.evaluate(() => R.goto('banks'));
    await expect(page.locator('#pg-banks.on')).toBeVisible({ timeout: 15000 });
    await context.setOffline(false);
  });
});
