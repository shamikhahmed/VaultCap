// @ts-check
const { test, expect } = require('@playwright/test');

const SATELLITE_PAGES = [
  '/landing.html',
  '/pitch.html',
  '/presentation.html',
  '/changelog.html',
  '/privacy.html',
];

test.describe('VaultCap satellite pages', () => {
  for (const path of SATELLITE_PAGES) {
    test(`loads ${path} without blue accent`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(path);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveTitle(/VaultCap|Privacy/i);
      const themeColor = await page.evaluate(() => {
        const meta = document.querySelector('meta[name="theme-color"]');
        const style = document.documentElement.innerHTML;
        return {
          theme: meta?.getAttribute('content') || '',
          hasBlue: /5b8dee|0055cc|3d6fd4|3a6fd8/i.test(style),
        };
      });
      expect(themeColor.theme.toLowerCase()).not.toBe('#5b8dee');
      expect(themeColor.hasBlue).toBe(false);
      expect(errors.filter((e) => /SyntaxError|ReferenceError/i.test(e))).toEqual([]);
    });
  }

  test('widget.html loads snapshot shell', async ({ page }) => {
    await page.goto('/widget.html');
    await page.waitForLoadState('domcontentloaded');
    const html = await page.content();
    expect(html.length).toBeGreaterThan(200);
    expect(html).not.toMatch(/#5b8dee|rgba\(91,141,238/i);
  });
});
