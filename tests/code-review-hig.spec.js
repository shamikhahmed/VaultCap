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
      // Use ?? so a valid cache of 0 is not treated as missing
      const cache = window._scrollCache?.dashboard ?? null;
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

  // Pull-to-refresh is deliberately removed (owner: the app must never "refresh" on a swipe).
  test('downward swipe at the top neither reloads nor re-renders', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('load');
    await page.waitForFunction(() => typeof R !== 'undefined', { timeout: 30000 });
    await unlockDemoVault(page);
    await dismissOverlays(page);
    const before = await page.evaluate(() => {
      window.__noReload = 1;
      window.scrollTo(0, 0);
      // Mark rendered content (not the container): a re-render replaces it and drops the mark
      const body = document.getElementById('dashBody') || document.querySelector('.page.on');
      body.firstElementChild.dataset.swipeProbe = '1';
      return { hasPtr: !!document.getElementById('ptrDocInd') || !!window._ptrDocInited };
    });
    expect(before.hasPtr).toBe(false);
    await page.evaluate(async () => {
      const t = (y) => new Touch({ identifier: 1, target: document.body, clientX: 200, clientY: y });
      const fire = (type, y) => document.body.dispatchEvent(new TouchEvent(type, {
        bubbles: true, cancelable: true, touches: type === 'touchend' ? [] : [t(y)], changedTouches: [t(y)],
      }));
      fire('touchstart', 120);
      for (let y = 140; y <= 420; y += 20) fire('touchmove', y);
      fire('touchend', 420);
      await new Promise((r) => setTimeout(r, 800));
    });
    const after = await page.evaluate(() => {
      const body = document.getElementById('dashBody') || document.querySelector('.page.on');
      return { marker: window.__noReload, probe: body && body.firstElementChild && body.firstElementChild.dataset.swipeProbe };
    });
    expect(after.marker).toBe(1);
    expect(after.probe).toBe('1');
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
    // Boot globals — do not wait on __APP_READY__ (set early by boot-cache before ThemeEngine).
    await page.waitForFunction(
      () =>
        typeof R !== 'undefined' &&
        typeof ThemeEngine !== 'undefined' &&
        typeof ThemeEngine.openPicker === 'function' &&
        typeof FocusTrap !== 'undefined' &&
        typeof FocusTrap.trap === 'function',
      { timeout: 45000 },
    );
    await page.evaluate(() => ThemeEngine.openPicker());
    await expect(page.locator('#themeOv.on')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#themeOv.on')).toHaveCount(0);
  });

  test('hub sheet tiles use phrasing spans inside buttons', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('load');
    await page.waitForFunction(() => typeof R !== 'undefined', { timeout: 30000 });
    await unlockDemoVault(page);
    await dismissOverlays(page);
    await page.evaluate(() => openMoneySheet());
    const bad = await page.evaluate(() => {
      const tiles = [...document.querySelectorAll('#moneySheet .vc-sheet-tile')];
      return tiles.filter((btn) => [...btn.children].some((c) => c.tagName === 'DIV')).length;
    });
    expect(bad).toBe(0);
    await page.evaluate(() => document.getElementById('moneySheet')?.remove());
  });

  test('home theme dots use ui-segmented markup', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('load');
    await page.waitForFunction(() => typeof ThemeEngine !== 'undefined', { timeout: 30000 });
    await page.evaluate(() => ThemeEngine.renderDots());
    const seg = page.locator('#homeThemes .ui-segmented');
    await expect(seg).toHaveCount(1);
    await expect(seg.locator('button')).toHaveCount(3);
    await expect(seg).toHaveAttribute('aria-label', 'Appearance');
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
