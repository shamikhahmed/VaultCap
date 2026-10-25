// @ts-check
const { test, expect } = require('@playwright/test');
const { AxeBuilder } = require('@axe-core/playwright');
const { unlockDemoVault, dismissOverlays } = require('./demo-unlock');

test.describe('prod-ready round 2 gates', () => {
  test('no root-relative stylesheet 404s while visiting key pages', async ({ page }) => {
    const bad = [];
    page.on('response', (r) => {
      if (r.status() !== 404) return;
      try {
        const u = new URL(r.url());
        const p = u.pathname;
        if (
          /^\/(base|layout|components|fonts-local|brand-mark|identity|luxe|themes|capricorn-core|ios-tokens)\.css$/.test(p) ||
          p === '/design/system.css' ||
          p === '/design/vaultcap.css'
        ) {
          bad.push(p);
        }
      } catch (_) { /* ignore */ }
    });

    await page.goto('/?demo=1');
    await page.waitForLoadState('load');
    await page.waitForFunction(() => typeof R !== 'undefined', { timeout: 30000 });
    await unlockDemoVault(page);
    await dismissOverlays(page);
    if (typeof page.evaluate === 'function') {
      await page.evaluate(() => {
        if (window.__vcActivateDeferredCss) window.__vcActivateDeferredCss();
      });
    }

    for (const pg of ['dashboard', 'banks', 'cards', 'investments', 'documents', 'settings', 'search', 'family']) {
      await page.evaluate((p) => R.goto(p, true), pg);
      await page.waitForTimeout(150);
    }

    expect(bad, `root-relative CSS 404s: ${bad.join(', ')}`).toEqual([]);
  });

  test('axe smoke: dashboard, banks, settings — no serious/critical', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/?demo=1');
    await page.waitForLoadState('load');
    await page.waitForFunction(() => typeof R !== 'undefined', { timeout: 30000 });
    await unlockDemoVault(page);
    await dismissOverlays(page);
    await page.evaluate(() => {
      if (window.__vcActivateDeferredCss) window.__vcActivateDeferredCss();
    });

    for (const pg of ['dashboard', 'banks', 'settings']) {
      await page.evaluate((p) => R.goto(p, true), pg);
      await page.waitForTimeout(250);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .disableRules(['color-contrast'])
        .options({ preload: false })
        .analyze();
      const bad = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
      expect(bad, `${pg}: ${bad.map((v) => v.id).join(', ')}`).toEqual([]);
    }
  });

  test('Banks + Add stays visible and opens sheet on phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/?demo=1');
    await page.waitForLoadState('load');
    await page.waitForFunction(() => typeof R !== 'undefined', { timeout: 30000 });
    await unlockDemoVault(page);
    await dismissOverlays(page);
    await page.evaluate(() => R.goto('banks', true));
    await page.waitForFunction(() => document.querySelector('#pg-banks.on'), { timeout: 10000 });

    await page.evaluate(() => window.scrollTo(0, 400));
    const add = page.locator('#pg-banks.on .ph [data-act="Banks.openAdd()"]').first();
    await expect(add).toBeVisible();
    await add.click();
    // Modal mounts #overlay.on and #modal together — assert the open overlay (strict-safe)
    await expect(page.locator('#overlay.on')).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('dialog', { name: /Add Bank/i })).toBeVisible({ timeout: 5000 });
  });
});
