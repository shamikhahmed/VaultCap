// @ts-check
/**
 * HIG 3.0 design gate — shell, dashboard, banks list + add sheet, settings.
 * Captures before/after evidence when HIG_SHOTS=<label> (writes build/qa/hig/<label>/).
 */
const { test, expect } = require('@playwright/test');
const path = require('path');
const { fastGalleryUnlock, prepareGalleryShot } = require('./demo-unlock');

const LABEL = process.env.HIG_SHOTS || '';
const OUT = path.join(__dirname, '..', 'build', 'qa', 'hig', LABEL || 'tmp');

async function shot(page, name) {
  if (!LABEL) return;
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(OUT, name + '.png') });
}

async function goto(page, id) {
  await page.evaluate((pg) => {
    document.documentElement.removeAttribute('data-vc-demo');
    if (window.__vcActivateDeferredCss) window.__vcActivateDeferredCss();
    R.goto(pg);
  }, id);
  await page.waitForTimeout(350);
  await prepareGalleryShot(page);
}

for (const theme of ['dark', 'light']) {
  test.describe(`HIG phone · ${theme}`, () => {
    test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });

    test(`welcome + lock (${theme})`, async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('vo_active_profile', 'demo');
        localStorage.setItem('vo_used_demo', '1');
      });
      await page.goto('/?demo=1');
      await page.waitForFunction(() => window.__APP_READY__ === true && typeof ThemeEngine !== 'undefined' && typeof R !== 'undefined', { timeout: 45000 });
      await page.evaluate((t) => {
        document.getElementById('splashScreen')?.remove();
        ThemeEngine.apply(t);
        R.showHome();
      }, theme);
      await page.waitForTimeout(3600);
      await shot(page, `phone-${theme}-00-welcome`);
      await page.evaluate(() => R.showLock());
      await expect(page.locator('#pgLock')).toBeVisible();
      await expect(page.locator('#pgHome')).toBeHidden();
      await shot(page, `phone-${theme}-00-lock`);
    });

    test(`shell, dashboard, banks, add, settings (${theme})`, async ({ page }) => {
      await fastGalleryUnlock(page);
      await page.evaluate((t) => ThemeEngine.apply(t), theme);
      await goto(page, 'dashboard');
      await shot(page, `phone-${theme}-01-dashboard`);

      const tabs = page.locator('#btabs [role="tab"]');
      await expect(tabs).toHaveCount(5);
      for (const box of await tabs.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height))) {
        expect(box).toBeGreaterThanOrEqual(44);
      }

      await goto(page, 'banks');
      await shot(page, `phone-${theme}-02-banks`);

      await page.evaluate(() => Banks.openAdd());
      await expect(page.locator('#overlay.on #modal')).toBeVisible();
      // HIG sheet bar: Cancel leading, Save trailing, close glyph hidden
      await expect(page.locator('#mLead button')).toHaveText(/Cancel/);
      await expect(page.locator('#mTrail .btn-p')).toHaveText(/Save/);
      await expect(page.locator('#mClose')).toBeHidden();
      await shot(page, `phone-${theme}-03-add-bank`);
      // Esc must close the overlay (FocusTrap → Modal.close), not leave #overlay.on
      await page.keyboard.press('Escape');
      await expect(page.locator('#overlay.on')).toHaveCount(0);
      await page.evaluate(() => { if (document.getElementById('overlay')?.classList.contains('on')) Modal.close(); });

      await goto(page, 'settings');
      await shot(page, `phone-${theme}-04-settings`);

      await page.evaluate(() => openMoneySheet());
      await page.waitForTimeout(300);
      await shot(page, `phone-${theme}-05-money-sheet`);
    });
  });
}

test.describe('HIG iPad · sidebar', () => {
  test.use({ viewport: { width: 1180, height: 820 }, deviceScaleFactor: 1 });

  test('sidebar shell + dashboard + banks', async ({ page }) => {
    await fastGalleryUnlock(page);
    await goto(page, 'dashboard');
    await expect(page.locator('#sidebar')).toBeVisible();
    await shot(page, 'ipad-dark-01-dashboard');
    await goto(page, 'banks');
    await shot(page, 'ipad-dark-02-banks');
    await page.evaluate(() => ThemeEngine.apply('light'));
    await goto(page, 'dashboard');
    await shot(page, 'ipad-light-01-dashboard');
  });
});
