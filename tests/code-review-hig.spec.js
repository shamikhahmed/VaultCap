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
});
