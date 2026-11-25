// @ts-check
const { test, expect } = require('@playwright/test');
const { unlockDemoVault, dismissOverlays } = require('./demo-unlock');

test.describe('VaultCap install banner', () => {
  test('Install and Close are clickable; Close dismisses', async ({ page }) => {
    await page.addInitScript(() => {
      try { localStorage.removeItem('vo_install_dismissed'); } catch (e) {}
    });
    await unlockDemoVault(page);
    await dismissOverlays(page);

    await page.evaluate(() => {
      if (typeof InstallPrompt === 'undefined') throw new Error('InstallPrompt missing on window');
      InstallPrompt._forceShow();
    });

    const banner = page.locator('#vaultInstallBanner');
    await expect(banner).toBeVisible({ timeout: 5000 });

    const close = page.locator('#vaultInstallClose');
    const install = page.locator('#vaultInstallBtn');
    await expect(close).toBeVisible();
    await expect(install).toBeVisible();

    const closeBox = await close.boundingBox();
    expect(closeBox).toBeTruthy();
    expect(closeBox.height).toBeGreaterThanOrEqual(40);
    expect(closeBox.width).toBeGreaterThanOrEqual(40);

    // Must be hittable (not covered / pointer-events none)
    await expect(close).toBeEnabled();
    await close.click({ force: false });
    await expect(banner).toHaveCount(0);

    const dismissed = await page.evaluate(() => localStorage.getItem('vo_install_dismissed'));
    expect(dismissed).toBe('1');
  });

  test('Install without native prompt opens install.html', async ({ page }) => {
    await page.addInitScript(() => {
      try { localStorage.removeItem('vo_install_dismissed'); } catch (e) {}
    });
    await unlockDemoVault(page);
    await dismissOverlays(page);
    await page.evaluate(() => InstallPrompt._forceShow());
    await expect(page.locator('#vaultInstallBanner')).toBeVisible();

    await Promise.all([
      page.waitForURL(/install\.html/, { timeout: 8000 }),
      page.locator('#vaultInstallBtn').click(),
    ]);
    await expect(page).toHaveTitle(/Install VaultCap/i);
  });
});

/* Default playwright.config blocks SW (PIN/pgHome races). This guard must allow SW. */
test.describe('VaultCap install banner — SW HTML poison guard', () => {
  test.use({ serviceWorkers: 'allow' });

  test('bundle is JS even with active SW (no HTML poison)', async ({ page }) => {
    test.setTimeout(90000);
    await page.goto('./index.html');
    await page.waitForFunction(() => window.VER, null, { timeout: 15000 });

    // Register (or reaffirm). Poll via expect.poll — avoid waitForFunction(async…) races.
    const regResult = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return { ok: false, reason: 'unsupported' };
      try {
        const ver = window.VER || '5.4.3';
        await navigator.serviceWorker.register('./sw-v51.js?v=' + ver);
        return { ok: true };
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

    // Need an active worker before reload so the next navigation is controlled.
    await expect
      .poll(
        async () =>
          page.evaluate(async () => {
            const reg = await navigator.serviceWorker.getRegistration();
            return !!(reg && reg.active);
          }),
        { timeout: 45000, intervals: [100, 250, 500, 1000] }
      )
      .toBe(true);

    await page.reload({ waitUntil: 'domcontentloaded' });
    // VER is early (boot-ver); InstallPrompt lands with app modules — wait for both.
    await page.waitForFunction(
      () =>
        typeof window.VER === 'string' &&
        (typeof window.InstallPrompt === 'object' || typeof window.InstallPrompt === 'function'),
      null,
      { timeout: 30000 }
    );

    const probe = await page.evaluate(async () => {
      const r = await fetch('./dist/vaultcap.bundle.js?v=' + (window.VER || 'x'));
      const t = await r.text();
      const head = t.slice(0, 80);
      return {
        status: r.status,
        head,
        isHtml: t.trimStart().startsWith('<') || t.trimStart().startsWith('<!--'),
        isOfflineStub: /VaultCap offline/.test(head),
        hasIP: typeof window.InstallPrompt === 'object' || typeof window.InstallPrompt === 'function',
      };
    });
    expect(probe.isHtml, JSON.stringify(probe)).toBe(false);
    expect(probe.isOfflineStub, JSON.stringify(probe)).toBe(false);
    // Real build banner (bundle currently shares the boot pack label)
    expect(probe.head).toMatch(/VaultCap (bundle|boot|app)/);
    expect(probe.hasIP).toBe(true);
  });
});
