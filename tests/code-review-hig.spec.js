// @ts-check
/** Cheap regression gates for design/hig-3 code-review fixes. */
const { test, expect } = require('@playwright/test');
const { unlockDemoVault, dismissOverlays } = require('./demo-unlock');

test.describe('code-review hig fixes', () => {
  test('resetScroll uses ScrollLock.scrollTo while body is pinned', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('load');
    await page.waitForFunction(() => typeof R !== 'undefined' && typeof ScrollLock !== 'undefined', { timeout: 30000 });
    await unlockDemoVault(page);
    await dismissOverlays(page);
    await page.evaluate(() => R.goto('dashboard', true));

    const result = await page.evaluate(() => {
      window.scrollTo(0, 400);
      ScrollLock.lock();
      const yBefore = ScrollLock.currentY();
      window.resetScroll('dashboard');
      const yAfter = ScrollLock.currentY();
      const cache = (window._scrollCache && window._scrollCache.dashboard) || null;
      ScrollLock.unlock();
      return { yBefore, yAfter, cache, lockedWasUpdated: yAfter === 0 };
    });

    expect(result.yBefore).toBeGreaterThan(0);
    expect(result.yAfter).toBe(0);
    expect(result.cache).toBe(0);
    expect(result.lockedWasUpdated).toBe(true);
  });

  test('dashboard Cash widget shows per-currency breakdown when >1 currency', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('load');
    await page.waitForFunction(() => typeof R !== 'undefined', { timeout: 30000 });
    await unlockDemoVault(page);
    await dismissOverlays(page);
    await page.evaluate(() => {
      S.cash = [
        { id: 'c1', amount: 1000, currency: 'PKR', location: 'Wallet' },
        { id: 'c2', amount: 50, currency: 'USD', location: 'Safe' },
      ];
      R.goto('dashboard', true);
    });
    const cashWidget = page.locator('#dash6-money, .dash6').locator('.ui-widget').filter({ hasText: 'Cash' }).first();
    await expect(cashWidget.locator('.ui-footnote .sens')).toHaveCount(2);
    await expect(cashWidget.locator('.ui-footnote')).toContainText('USD');
    await expect(cashWidget.locator('.ui-footnote')).toContainText('PKR');
  });

  test('document pull-to-refresh is armed after unlock', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('load');
    await page.waitForFunction(() => typeof R !== 'undefined', { timeout: 30000 });
    await unlockDemoVault(page);
    await dismissOverlays(page);
    const armed = await page.evaluate(() => !!window._ptrDocInited && !!document.getElementById('ptrDocInd'));
    expect(armed).toBe(true);
  });

  test('ScrollLock pins body for theme overlay while #app is hidden', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('load');
    await page.waitForFunction(() => typeof ScrollLock !== 'undefined' && typeof ThemeEngine !== 'undefined', { timeout: 30000 });
    const locked = await page.evaluate(() => {
      const app = document.getElementById('app');
      if (app) app.style.display = 'none';
      window.scrollTo(0, 120);
      ThemeEngine.openPicker();
      ScrollLock.sync();
      const pos = document.body.style.position;
      const isLocked = ScrollLock.isLocked();
      ThemeEngine.closePicker();
      ScrollLock.sync();
      return { pos, isLocked };
    });
    expect(locked.pos).toBe('fixed');
    expect(locked.isLocked).toBe(true);
  });

  test('FocusTrap Esc closes theme picker via onEscape', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('load');
    await page.waitForFunction(() => typeof ThemeEngine !== 'undefined' && typeof FocusTrap !== 'undefined', { timeout: 30000 });
    await page.evaluate(() => ThemeEngine.openPicker());
    await expect(page.locator('#themeOv.on')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#themeOv.on')).toHaveCount(0);
  });

  test('ScrollLock.sync is explicit — no body-wide MutationObserver', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('load');
    await page.waitForFunction(() => typeof ScrollLock !== 'undefined', { timeout: 30000 });
    const ok = await page.evaluate(() => {
      const src = ScrollLock.sync.toString();
      // Observer was removed; sync still locks when OPEN overlays exist.
      ThemeEngine.openPicker();
      const locked = ScrollLock.isLocked();
      ThemeEngine.closePicker();
      const unlocked = !ScrollLock.isLocked();
      return { locked, unlocked, hasObserverInit: /MutationObserver/.test(src) === false };
    });
    expect(ok.locked).toBe(true);
    expect(ok.unlocked).toBe(true);
    expect(ok.hasObserverInit).toBe(true);
  });

  test('FAB close keeps menu visible until transitionend (deferred hidden)', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('load');
    await page.waitForFunction(() => typeof R !== 'undefined', { timeout: 30000 });
    await unlockDemoVault(page);
    await dismissOverlays(page);
    await page.evaluate(() => {
      document.getElementById('fab').style.display = 'flex';
      FAB.toggle();
    });
    await expect(page.locator('#fabMenu.on')).toBeVisible();
    const midClose = await page.evaluate(() => {
      FAB.close();
      const m = document.getElementById('fabMenu');
      return {
        hasOn: m.classList.contains('on'),
        hidden: m.hidden,
        inert: m.hasAttribute('inert'),
        ariaHidden: m.getAttribute('aria-hidden'),
      };
    });
    expect(midClose.hasOn).toBe(false);
    expect(midClose.hidden).toBe(false);
    expect(midClose.inert).toBe(true);
    expect(midClose.ariaHidden).toBe('true');
    await page.waitForFunction(() => document.getElementById('fabMenu').hidden === true, { timeout: 1000 });
  });
});
