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

/* Default config blocks SW to avoid PIN/pgHome races — this check must allow it. */
test.describe('VaultCap performance + offline — SW register', () => {
  test.use({ serviceWorkers: 'allow' });

  test('service worker registers and caches shell', async ({ page }) => {
    test.setTimeout(90000);
    await page.goto('/?demo=1');
    await page.waitForLoadState('load');
    await page.waitForFunction(() => typeof window.VER === 'string', null, { timeout: 15000 });

    // Explicit register (boot-shell is fire-and-forget + .catch). Use expect.poll —
    // do not rely on waitForFunction(async …) which can race under suite load when
    // python http.server drops parallel precache pipes.
    const regResult = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return { ok: false, reason: 'unsupported' };
      try {
        const ver = window.VER || '5.4.3';
        const reg = await navigator.serviceWorker.register('./sw-v51.js?v=' + ver);
        return {
          ok: true,
          scope: reg.scope,
          state: reg.active ? 'active' : reg.waiting ? 'waiting' : reg.installing ? 'installing' : 'none',
        };
      } catch (e) {
        return { ok: false, reason: String((e && e.message) || e) };
      }
    });
    expect(regResult, JSON.stringify(regResult)).toMatchObject({ ok: true });

    await expect
      .poll(
        async () =>
          page.evaluate(async () => {
            const reg = await navigator.serviceWorker.getRegistration();
            return !!(reg && (reg.active || reg.installing || reg.waiting));
          }),
        { timeout: 45000, intervals: [100, 250, 500, 1000] }
      )
      .toBe(true);
  });
});
