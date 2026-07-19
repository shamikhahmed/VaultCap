// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const { unlockDemoVault, prepareGalleryShot } = require('./demo-unlock');

const OUT = path.join(__dirname, '..', 'assets', 'screenshots', 'dark', 'mobile', 'finance', 'banks.png');

test('capture banks dark mobile with logos', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await unlockDemoVault(page);
  await page.evaluate(() => {
    if (typeof ThemeEngine !== 'undefined') ThemeEngine.apply('dark');
    if (typeof R !== 'undefined' && R.goto) R.goto('banks');
    else if (typeof go === 'function') go('banks');
  });
  await page.waitForFunction(() => {
    const el = document.getElementById('bItems');
    return el && (el.querySelector('.entry') || el.querySelector('[data-logo-bank]'));
  }, { timeout: 20000 });
  await prepareGalleryShot(page);
  await page.evaluate(() => {
    if (typeof Banks !== 'undefined') Banks.render();
    if (typeof LogoEngine !== 'undefined') LogoEngine.hydrate(document.getElementById('bItems'));
  });
  await page.waitForTimeout(1200);
  const info = await page.evaluate(() => {
    const el = [...document.querySelectorAll('[data-logo-bank]')].find((e) =>
      (e.getAttribute('data-logo-bank') || '').toLowerCase().includes('barclays'),
    );
    const img = el?.querySelector('img');
    return {
      name: el?.getAttribute('data-logo-bank'),
      naturalWidth: img?.naturalWidth || 0,
      src: img?.getAttribute('src'),
      display: img?.style?.display,
    };
  });
  console.log('Barclays logo probe', info);
  expect(info.naturalWidth).toBeGreaterThan(0);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  await page.screenshot({ path: OUT, fullPage: false });
});
