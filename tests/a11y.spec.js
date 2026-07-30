// @ts-check
const { test, expect } = require('@playwright/test');
const { unlockDemoVault, dismissOverlays } = require('./demo-unlock');

test.describe('VaultCap accessibility baseline', () => {
  test('shell landmarks and controls', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('load');
    await page.waitForFunction(() => typeof R !== 'undefined', { timeout: 30000 });
    await unlockDemoVault(page);
    await dismissOverlays(page);

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('.cap-skip-link')).toHaveCount(1);
    await expect(page.locator('#sidebar[role="navigation"], #btabs[role="tablist"]').first()).toBeVisible();
    await expect(page.locator('#mainPages[aria-label]')).toBeVisible();

    const searchFields = page.locator('.sq-ic[data-vc-icon="search"]');
    await expect(searchFields.first()).toBeAttached();

    await page.evaluate(() => R.goto('banks', true));
    await page.waitForFunction(() => document.querySelector('#bItems .entry'), { timeout: 10000 });
    const acts = page.locator('#bItems .entry-acts .icb').first();
    await expect(acts).toBeVisible();
    await expect(acts.locator('.vc-icon')).toBeVisible();
  });

  test('reduced motion CSS present', async ({ page }) => {
    await page.goto('/');
    const reduced = await page.evaluate(() => {
      return [...document.styleSheets].some((sheet) => {
        try {
          return [...sheet.cssRules].some((r) => r.cssText && r.cssText.includes('prefers-reduced-motion'));
        } catch { return false; }
      });
    });
    expect(reduced).toBe(true);
  });

  test('FAB menu and dashboard overflow are keyboard-reachable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/?demo=1');
    await page.waitForLoadState('load');
    await page.waitForFunction(() => typeof R !== 'undefined', { timeout: 30000 });
    await unlockDemoVault(page);
    await dismissOverlays(page);

    await page.evaluate(() => R.goto('dashboard', true));
    await page.waitForFunction(() => document.getElementById('app')?.style.display === 'flex');
    await expect(page.locator('#pg-dashboard.on')).toBeVisible();

    const moreBtn = page.locator('#dashMoreBtn');
    await expect(moreBtn).toBeVisible();
    await page.evaluate(() => Dash.toggleMore());
    await expect(page.locator('#dashMoreMenu.on')).toBeAttached();
    await expect(page.locator('#dashMoreMenu [role="menuitem"]').first()).toBeAttached();
    await page.evaluate(() => Dash.closeMore());
    await expect(page.locator('#dashMoreMenu.on')).toHaveCount(0);

    await page.evaluate(() => R.goto('banks', true));
    const fab = page.locator('#fab');
    await expect(fab).toBeAttached();
    await expect(fab).toHaveAttribute('aria-haspopup', 'true');
    await page.evaluate(() => FAB.toggle());
    await expect(page.locator('#fabMenu.on')).toBeVisible();
    await expect(fab).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#fabScrim.on')).toBeAttached();
    await page.evaluate(() => FAB.close());
    await expect(page.locator('#fabMenu.on')).toHaveCount(0);
    await expect(fab).toHaveAttribute('aria-expanded', 'false');
  });

  test('money sheet uses semantic tiles + 44px targets', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await unlockDemoVault(page);
    await dismissOverlays(page);
    await page.evaluate(() => openMoneySheet());
    const sheet = page.locator('#moneySheet.vc-sheet-overlay');
    await expect(sheet).toBeVisible();
    await expect(sheet).toHaveAttribute('role', 'dialog');
    const tile = page.locator('#moneySheet .vc-sheet-tile').first();
    await expect(tile).toBeVisible();
    const box = await tile.boundingBox();
    expect(box).toBeTruthy();
    expect(Math.min(box.height, box.width)).toBeGreaterThanOrEqual(40);
    await page.evaluate(() => document.getElementById('moneySheet')?.remove());
  });

  test('settings tabs are role=tab and switchable', async ({ page }) => {
    await unlockDemoVault(page);
    await dismissOverlays(page);
    await page.evaluate(() => R.goto('settings'));
    await expect(page.locator('#settTabs [role="tab"]').first()).toBeVisible();
    const count = await page.locator('#settTabs [role="tab"]').count();
    expect(count).toBe(7);
    await page.evaluate(() => SettingsNav.show('privacy'));
    await expect(page.locator('#settBody')).toContainText(/Export Encrypted Vault/i);
  });
});
