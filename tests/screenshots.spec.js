// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
const { unlockDemoVault, dismissOverlays } = require('./demo-unlock');

const SHOT_DIR = path.join(__dirname, '..', 'assets', 'screenshots');

test.describe('VaultCap PWA screenshots', () => {
  test.skip(() => process.env.CAPTURE_SCREENSHOTS !== '1', 'set CAPTURE_SCREENSHOTS=1 to regenerate');

  test('capture manifest screenshots', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await unlockDemoVault(page);
    await dismissOverlays(page);
    await expect(page.locator('#dashGreet')).not.toBeEmpty({ timeout: 10000 });
    await page.screenshot({
      path: path.join(SHOT_DIR, 'vaultcap-1.png'),
      fullPage: false,
    });

    await page.evaluate(() => R.goto('banks'));
    await expect(page.locator('#pg-banks.on')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Banks' })).toBeVisible();
    await page.screenshot({
      path: path.join(SHOT_DIR, 'vaultcap-2.png'),
      fullPage: false,
    });
  });
});
