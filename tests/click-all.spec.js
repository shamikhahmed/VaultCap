// @ts-check
/**
 * Exhaustive click-all of primary surfaces (core journeys).
 * Complements full-navigation / forms-coverage with one pass + QA-MATRIX evidence.
 */
const { test, expect } = require('@playwright/test');
const { unlockDemoVault, dismissOverlays } = require('./demo-unlock');

const PAGES = [
  'dashboard', 'banks', 'cards', 'investments', 'cash', 'loans', 'friends', 'sims',
  'assets', 'expenses', 'emails', 'digital', 'alerts', 'documents',
  'search', 'import', 'timeline', 'security', 'backup', 'recovery', 'workspace',
  'reminders', 'trash', 'emergency', 'recovery-center', 'help',
  'currency', 'bc', 'bonds', 'zakat', 'credit', 'tax', 'family', 'sync', 'settings',
];

const FORM_OPENS = [
  'Banks.openAdd', 'Cards.openAdd', 'Inv.openAdd', 'Cash.openAdd', 'Loans.openAdd',
  'Friends.openAdd', 'Sims.openAdd', 'Assets.openAdd', 'Exp.openAdd',
  'Emails.openAdd', 'Digital.openAdd', 'DocsModule.openAdd',
];

const SETTINGS_TABS = ['account', 'general', 'appearance', 'access', 'alerts', 'privacy', 'about'];

test.describe('VaultCap click-all', () => {
  test.setTimeout(180000);

  test('every primary page, sheet, form open, settings tab', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await unlockDemoVault(page);
    await dismissOverlays(page);

    for (const pg of PAGES) {
      await dismissOverlays(page);
      await page.evaluate((id) => R.goto(id, true), pg);
      await expect(page.locator(`#pg-${pg}.on`)).toBeVisible({ timeout: 12000 });
    }

    // Sheets
    for (const fn of ['openMoneySheet', 'openAssetsSheet', 'openIdentitySheet']) {
      await dismissOverlays(page);
      await page.evaluate((name) => { if (typeof window[name] === 'function') window[name](); }, fn);
      await page.waitForTimeout(250);
      const tiles = page.locator('.vc-sheet-tile, .sheet-tile, [data-act*="goto"]');
      const n = await tiles.count();
      expect(n, fn).toBeGreaterThan(0);
      await page.evaluate(() => {
        if (typeof Modal !== 'undefined') Modal.close();
        document.querySelectorAll('.vc-sheet-overlay, .sheet-overlay, #moneySheet, #assetsSheet, #identitySheet')
          .forEach((el) => el.remove());
      });
    }

    // Forms — open then close
    for (const call of FORM_OPENS) {
      await dismissOverlays(page);
      await page.evaluate((c) => {
        const [obj, meth] = c.split('.');
        if (window[obj] && typeof window[obj][meth] === 'function') window[obj][meth]();
      }, call);
      await page.waitForTimeout(200);
      await page.evaluate(() => { if (typeof Modal !== 'undefined') Modal.close(); });
    }

    // Settings tabs
    await dismissOverlays(page);
    await page.evaluate(() => R.goto('settings', true));
    await expect(page.locator('#pg-settings.on')).toBeVisible();
    for (const tab of SETTINGS_TABS) {
      await page.evaluate((t) => SettingsNav.show(t), tab);
      await page.waitForTimeout(150);
    }

    // Documents PDF toolbar
    await page.evaluate(() => R.goto('documents', true));
    await expect(page.getByRole('button', { name: 'Select' })).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole('button', { name: 'Export visible PDF' })).toBeVisible();

    // Switch vault control on lock
    await page.evaluate(() => R.lock());
    await expect(page.locator('#switchProfileBtn')).toBeVisible({ timeout: 10000 });

    const fatal = errors.filter((e) =>
      /ReferenceError|SyntaxError|Unexpected token|is not defined/i.test(e),
    );
    expect(fatal, fatal.join('\n')).toEqual([]);
  });
});
