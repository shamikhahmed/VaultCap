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

  test('bundle is JS even with active SW (no HTML poison)', async ({ page }) => {
    await page.goto('./index.html');
    await page.waitForFunction(
      () => !!window.VER && typeof window.InstallPrompt !== 'undefined',
      null,
      { timeout: 45000 },
    );
    // Warm SW with the live version query (sync poll — avoid async waitForFunction flakiness)
    await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return;
      const ver = window.VER || '6.0.0';
      try {
        await navigator.serviceWorker.register('./sw-v51.js?v=' + ver);
      } catch (e) { /* ignore */ }
    });
    // Registration may still be installing — poll getRegistration (sync waitForFunction can't await).
    await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return;
      for (let i = 0; i < 50; i++) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg && (reg.active || reg.installing || reg.waiting)) return;
        await new Promise((r) => setTimeout(r, 100));
      }
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(
      () => !!window.VER && typeof window.InstallPrompt !== 'undefined',
      null,
      { timeout: 45000 },
    );

    const probe = await page.evaluate(async () => {
      const r = await fetch('./dist/vaultcap.bundle.js?v=' + (window.VER || 'x'));
      const t = await r.text();
      return {
        status: r.status,
        head: t.slice(0, 40),
        isHtml: t.trimStart().startsWith('<') || t.trimStart().startsWith('<!--'),
        hasIP: typeof window.InstallPrompt !== 'undefined',
      };
    });
    expect(probe.isHtml, JSON.stringify(probe)).toBe(false);
    expect(probe.head).toMatch(/VaultCap bundle|\/\*/);
    expect(probe.hasIP).toBe(true);
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
