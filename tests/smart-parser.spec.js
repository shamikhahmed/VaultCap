// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('SmartParser', () => {
  test('extracts UK bank and card from messy text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');
    await page.addScriptTag({ url: 'js/modules/ai-import.js' });
    await page.waitForFunction(() => typeof SmartParser !== 'undefined', { timeout: 15000 });
    const out = await page.evaluate(() => {
      const raw = 'Barclays current account ****4821 balance £8,450. Barclaycard Visa ends 3391 exp 04/27 limit £8000';
      return SmartParser.parse(raw);
    });
    expect(out.length).toBeGreaterThan(0);
    const types = out.map((x) => x.type);
    expect(types.some((t) => /bank|card/i.test(String(t)))).toBe(true);
  });
});
