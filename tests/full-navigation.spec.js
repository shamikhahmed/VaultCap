// @ts-check
const { test, expect } = require('@playwright/test');
const { unlockDemoVault, dismissOverlays } = require('./demo-unlock');

const ALL_PAGES = [
  'dashboard', 'banks', 'cards', 'investments', 'cash', 'loans', 'friends', 'sims',
  'assets', 'expenses', 'emails', 'digital', 'alerts', 'documents',
  'search', 'import', 'timeline', 'security', 'backup', 'workspace',
  'reminders', 'trash', 'emergency', 'recovery-center', 'help',
  'currency', 'bc', 'bonds', 'zakat', 'credit', 'tax', 'family', 'sync',
  'settings', 'finance-home', 'vault-home', 'assets-home',
];

const PAGE_ALIASES = {
  gadgets: 'assets',
  vehicles: 'assets',
  gold: 'assets',
};

/** @param {import('@playwright/test').Page} page */
function trackErrors(page) {
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  return errors;
}

/** @param {string[]} errors */
function assertNoFatal(errors) {
  const fatal = errors.filter((e) =>
    /ReferenceError|SyntaxError|escHtml is not defined|escAttr is not defined|Unexpected token/i.test(e),
  );
  expect(fatal, fatal.join('\n')).toEqual([]);
}

test.describe('VaultCap full navigation', () => {
  test.beforeEach(async ({ page }) => {
    page._errors = trackErrors(page);
    await unlockDemoVault(page);
  });

  for (const pg of ALL_PAGES) {
    test(`page "${pg}" renders without fatal errors`, async ({ page }) => {
      await dismissOverlays(page);
      await page.evaluate((id) => R.goto(id, true), pg);
      const target = PAGE_ALIASES[pg] || pg;
      await expect(page.locator(`#pg-${target}.on`)).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(400);
      assertNoFatal(page._errors || []);
      const bodyLen = await page.locator(`#pg-${target}`).innerHTML();
      expect(bodyLen.length).toBeGreaterThan(20);
    });
  }

  for (const alias of ['gadgets', 'vehicles', 'gold']) {
    test(`alias page "${alias}" routes to assets`, async ({ page }) => {
      await dismissOverlays(page);
      await page.evaluate((id) => R.goto(id, true), alias);
      await expect(page.locator('#pg-assets.on')).toBeVisible({ timeout: 15000 });
      assertNoFatal(page._errors || []);
    });
  }

  test('bottom tab sheets open without errors', async ({ page }) => {
    await dismissOverlays(page);
    for (const fn of ['openMoneySheet', 'openAssetsSheet', 'openIdentitySheet', 'openMore']) {
      await page.evaluate((name) => {
        if (typeof window[name] === 'function') window[name]();
      }, fn);
      await page.waitForTimeout(300);
      await page.evaluate(() => {
        document.querySelectorAll('.modal-overlay.on, .sheet-overlay.on').forEach((el) => {
          el.classList.remove('on');
        });
        if (typeof Modal !== 'undefined') Modal.close();
      });
    }
    assertNoFatal(page._errors || []);
  });
});
