// @ts-check
/* Worldwide features: country-neutral tax, display-currency rates, payment handles,
   remittances, giving, savings circles by region, ID-number checks, second calendar. */
const { test, expect } = require('@playwright/test');
const { unlockDemoVault, dismissOverlays } = require('./demo-unlock');

async function go(page, pg) {
  await page.evaluate((p) => R.goto(p, true), pg);
  await expect(page.locator('#pg-' + pg + '.on')).toBeVisible({ timeout: 10000 });
}

test.describe('Worldwide — tax', () => {
  test.beforeEach(async ({ page }) => {
    page._errs = [];
    page.on('pageerror', (e) => page._errs.push(e.message));
    await unlockDemoVault(page);
  });

  test('preset engine computes known results', async ({ page }) => {
    await go(page, 'tax');
    await page.waitForFunction(() => typeof computePresetTax === 'function', null, { timeout: 10000 });
    const r = await page.evaluate(() => ({
      // US single, $100,000: taxable 84,250 → 1192.50 + 4386 + 7870.50 = 13,449
      us: computePresetTax(TAX_PRESETS.US, 100000).total,
      // India ₹12.75 L salary → taxable 12 L → rebate wipes tax
      inZero: computePresetTax(TAX_PRESETS.IN, 1275000).total,
      // Kenya: personal relief applies
      ke: computePresetTax(TAX_PRESETS.KE, 600000).total,
      // South Africa below threshold → 0
      za: computePresetTax(TAX_PRESETS.ZA, 90000).total,
      count: Object.keys(TAX_PRESETS).length,
    }));
    expect(Math.round(r.us)).toBe(13449);
    expect(r.inZero).toBe(0);
    expect(r.ke).toBeGreaterThan(0);
    expect(r.za).toBe(0);
    expect(r.count).toBeGreaterThanOrEqual(20);
  });

  test('home country with a preset opens on that preset; any country can be picked', async ({ page }) => {
    await page.evaluate(() => { S.user.country = 'NG'; VaultMeta.set('taxCalc', {}); if (window.Tax) Tax._country = null; });
    await go(page, 'tax');
    await expect(page.locator('#tax-country')).toHaveValue('NG');
    await page.fill('#tax-income', '5000000');
    await page.locator('button:has-text("Calculate Tax")').click();
    await expect(page.locator('#tax-report')).toContainText('Nigeria');
    await expect(page.locator('#tax-takehome')).toContainText('NGN');
    // Gulf: no personal income tax
    await page.selectOption('#tax-country', 'SA');
    await expect(page.locator('#pg-tax-body')).toContainText('GOSI');
    // Country with no preset: custom bracket editor, saved per country
    await page.selectOption('#tax-country', 'IS');
    await expect(page.locator('#tax-custom-empty')).toBeVisible();
    await page.locator('#tax-custom-empty button').click();
    await page.locator('.tax-slab-row [data-f=max]').first().fill('1000000');
    await page.locator('.tax-slab-row [data-f=rate]').first().fill('10');
    await page.locator('button:has-text("+ Add Slab")').click();
    await page.locator('.tax-slab-row [data-f=rate]').nth(1).fill('30');
    await page.locator('[data-act="Tax._saveSlabs()"]').click();
    await page.fill('#tax-income', '2000000');
    await page.locator('button:has-text("Calculate Tax")').click();
    // 1,000,000 × 10% + 1,000,000 × 30% = 400,000 tax
    await expect(page.locator('#tax-report')).toContainText('400,000');
    // Edited brackets survive a save/reload round-trip (Infinity → null in JSON)
    const top = await page.evaluate(() => JSON.parse(JSON.stringify(VaultMeta.get('taxSlabs_IS_income_2025-26'))).pop().max);
    expect(top).toBeNull();
    expect(page._errs).toEqual([]);
  });

  test('UK detailed calculator still works', async ({ page }) => {
    await page.evaluate(() => { VaultMeta.set('taxCalc', {}); if (window.Tax) Tax._country = null; S.user.country = 'GB'; });
    await go(page, 'tax');
    await page.fill('#tax-income', '50000');
    await page.locator('button:has-text("Calculate Tax")').click();
    await expect(page.locator('#tax-report')).toContainText('7,486');
  });
});

test.describe('Worldwide — currency', () => {
  test.beforeEach(async ({ page }) => { await unlockDemoVault(page); });

  test('rates are quoted in the display currency, not PKR', async ({ page }) => {
    await page.evaluate(() => { S.user.currency = 'EUR'; Currency._query = ''; Currency._showAll = false; });
    await go(page, 'currency');
    await expect(page.locator('#cur-base-line')).toContainText('EUR');
    const usd = page.locator('.cur-row[data-code="USD"]');
    await expect(usd).toContainText('1 USD =');
    await expect(usd).toContainText('EUR');
    await expect(page.locator('#cur-rows')).not.toContainText(' PKR ·');
    // search the world list
    await page.fill('#cur-search', 'yen');
    await expect(page.locator('.cur-row[data-code="JPY"]')).toBeVisible();
  });

  test('manual rate is entered in display currency and used app-wide', async ({ page }) => {
    await page.evaluate(() => { S.user.currency = 'GBP'; localStorage.removeItem('vo_currency_manual'); Currency._query = ''; });
    await go(page, 'currency');
    const inp = page.locator('.cur-row[data-code="USD"] input');
    await inp.fill('0.5');
    await inp.dispatchEvent('change');
    const v = await page.evaluate(() => RatesEngine.convert(100, 'USD', 'GBP'));
    expect(Math.round(v)).toBe(50);
    await page.evaluate(() => localStorage.removeItem('vo_currency_manual'));
  });
});
