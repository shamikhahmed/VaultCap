const { test, expect } = require('@playwright/test');

test('default click-through makes zero requests to workers.dev', async ({ page }) => {
  const hits = [];
  page.on('request', (req) => {
    const u = req.url();
    if (u.includes('workers.dev')) hits.push(u);
  });
  await page.goto('/');
  await page.waitForTimeout(2500);
  // Try tapping through lock/demo without enabling network
  const demo = page.getByRole('button', { name: /demo|try|explore/i }).first();
  if (await demo.isVisible().catch(() => false)) await demo.click();
  await page.waitForTimeout(1500);
  expect(hits, hits.join('\n')).toEqual([]);
});
