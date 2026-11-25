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

test.describe('Worldwide — payment handles, remittances, giving', () => {
  test.beforeEach(async ({ page }) => {
    page._errs = [];
    page.on('pageerror', (e) => page._errs.push(e.message));
    await unlockDemoVault(page);
  });

  test('payment handle: add, share card, search, trash + restore', async ({ page }) => {
    await page.evaluate(() => { S.user.country = 'IN'; });
    await go(page, 'payids');
    await page.locator('#payids-add').click();
    await expect(page.locator('#wl-rail')).toHaveValue('upi'); // home-country rail first
    await page.fill('#wl-value', 'alex@okaxis');
    await page.fill('#wl-label', 'Salary UPI');
    await page.locator('#wl-save').click();
    await expect(page.locator('#pg-payids-body')).toContainText('Salary UPI');
    // seed phrases are refused
    await page.locator('#payids-add').click();
    await page.selectOption('#wl-rail', 'crypto');
    await page.fill('#wl-value', 'abandon ability able about above absent absorb abstract absurd abuse access accident');
    await page.locator('#wl-save').click();
    await expect(page.locator('#wl-save')).toBeVisible();
    await page.evaluate(() => Modal.close());
    // share card lists handles marked for sharing
    const share = await page.evaluate(() => PayIDs.shareText());
    expect(share).toContain('alex@okaxis');
    // global search finds it
    const found = await page.evaluate(() => {
      let el = document.getElementById('gs-results'), made = false;
      if (!el) { el = document.createElement('div'); el.id = 'gs-results'; document.body.appendChild(el); made = true; }
      GlobalSearch.search('okaxis'); const t = el.textContent; if (made) el.remove(); return t;
    });
    expect(found).toContain('Salary UPI');
    // trash + restore
    const id = await page.evaluate(() => S.payids.find(p => p.value === 'alex@okaxis').id);
    await page.evaluate((i) => { window.__vos_confirm = async () => true; return PayIDs.del(i); }, id);
    expect(await page.evaluate((i) => S.payids.some(p => p.id === i), id)).toBe(false);
    await page.evaluate((i) => { const t = S.trash.find(x => x.type === 'payids' && x.data.id === i); Trash.restore(t.id); }, id);
    expect(await page.evaluate((i) => S.payids.some(p => p.id === i), id)).toBe(true);
    expect(page._errs).toEqual([]);
  });

  test('remittance true cost vs SDG target, summary and monthly reminder', async ({ page }) => {
    await go(page, 'remits');
    await expect(page.locator('#remits-summary')).toBeVisible();
    const r = await page.evaluate(() => {
      const cheap = S.remits.find(x => x.provider === 'Wise');
      const dear = S.remits.find(x => x.provider === 'Western Union');
      return { cheap: Remits.def.costOf(cheap), dear: Remits.def.costOf(dear), rem: WorldLedgers.reminderItems().filter(x => x.category === 'Remittance').length };
    });
    expect(r.cheap.pct).toBeLessThan(3);
    expect(r.dear.pct).toBeGreaterThan(6.5);
    expect(r.rem).toBeGreaterThan(0);
    await expect(page.locator('#pg-remits-body')).toContainText('Western Union');
    expect(page._errs).toEqual([]);
  });

  test('giving: target progress and pledge reminder', async ({ page }) => {
    await go(page, 'giving');
    await expect(page.locator('#giving-summary')).toBeVisible();
    await page.locator('#giving-target').click();
    await page.locator('#gt-save').click();
    const t = await page.evaluate(() => VaultMeta.get('givingTarget'));
    expect(t).toBeTruthy();
    const rem = await page.evaluate(() => WorldLedgers.reminderItems().filter(x => x.category === 'Giving').length);
    expect(rem).toBeGreaterThan(0);
    await go(page, 'reminders').catch(() => {});
    expect(page._errs).toEqual([]);
  });

  test('new ledgers are in backups and exports', async ({ page }) => {
    const keys = await page.evaluate(() => Object.keys(Store._data()));
    for (const k of ['payids', 'remits', 'giving']) expect(keys).toContain(k);
    const n = await page.evaluate(() => { const d = Store._data(); return d.payids.length + d.remits.length + d.giving.length; });
    expect(n).toBeGreaterThan(0);
  });
});

test.describe('Worldwide — savings circles, IDs, calendar, storage', () => {
  test.beforeEach(async ({ page }) => { await unlockDemoVault(page); });

  test('savings circle uses the local name and bid math', async ({ page }) => {
    const r = await page.evaluate(() => ({
      in: BCModule.localName('MX').plural, ng: BCModule.localName('NG').one, xx: BCModule.localName('IS').plural,
      bid: BCModule.bidMath({ members: 10, contribution: 1000, feePct: 5 }, 2000),
    }));
    expect(r.in).toBe('Tandas');
    expect(r.ng.length).toBeGreaterThan(0);
    expect(r.xx).toBe('Savings Circles');
    // pot 10,000; 2,000 discount; fee 500; dividend (2000-500)/10 = 150
    expect(r.bid.prize).toBe(8000);
    expect(r.bid.dividend).toBe(150);
    expect(r.bid.instalment).toBe(850);
    await page.evaluate(() => { S.user.country = 'MX'; });
    await go(page, 'bc');
    await expect(page.locator('#bc-title')).toContainText('Tandas');
  });

  test('ID number checks', async ({ page }) => {
    const r = await page.evaluate(() => ({
      verhoeff: IdCheck.verhoeff('2363'), verhoeffBad: IdCheck.verhoeff('2364'),
      cpf: IdCheck.check('BR', 'cpf', '529.982.247-25').ok, cpfBad: IdCheck.check('BR', 'cpf', '529.982.247-26').ok,
      tckn: IdCheck.tckn('10000000146'), nric: IdCheck.nric('S1234567D'), dni: IdCheck.esId('12345678Z'),
      za: IdCheck.zaId('8001015009087'), ni: IdCheck.niNumber('AB123456C'), niBad: IdCheck.niNumber('BG123456C'),
      unknown: IdCheck.check('IS', 'nic', '123').ok,
    }));
    expect(r).toEqual({ verhoeff: true, verhoeffBad: false, cpf: true, cpfBad: false, tckn: true, nric: true, dni: true, za: true, ni: true, niBad: false, unknown: null });
  });

  test('document form shows a soft ID-number hint', async ({ page }) => {
    await page.evaluate(() => VaultLazy.documents());
    const hint = await page.evaluate(() => {
      const box = document.createElement('div');
      box.innerHTML = '<input id="df-issuingCountry" value="Brazil">' + DocsModule.buildForm(DOC_SCHEMAS.tax, {});
      document.body.appendChild(box);
      document.getElementById('df-referenceNum').value = '529.982.247-26';
      DocsModule._checkNum('referenceNum', 'tax');
      const t = document.getElementById('df-referenceNum-hint').textContent;
      box.remove();
      return t;
    });
    expect(hint).toContain('⚠');
  });

  test('second calendar shows beside reminder dates', async ({ page }) => {
    const ok = await page.evaluate(() => WorldCal.supported().some(([id]) => id === 'islamic-umalqura'));
    test.skip(!ok, 'Intl calendar not available');
    await go(page, 'settings').catch(() => {});
    await page.evaluate(() => WorldCal.openSettings());
    await page.selectOption('#wc-cal', 'islamic-umalqura');
    await expect(page.locator('#wc-preview')).toContainText('Today:');
    await page.locator('#wc-save').click();
    expect(await page.evaluate(() => S.user.altCalendar)).toBe('islamic-umalqura');
    const t = await page.evaluate(() => WorldCal.fmt('2025-03-01'));
    expect(t).toMatch(/1446/);
    await go(page, 'reminders');
    await expect(page.locator('.wc-alt').first()).toBeVisible();
    await page.evaluate(() => { S.user.altCalendar = ''; Store.save(); });
  });

  test('persistent storage status row', async ({ page }) => {
    const s = await page.evaluate(() => VaultStorage.status());
    expect(typeof s.supported).toBe('boolean');
    expect(await page.evaluate(() => VaultStorage.desc())).not.toBe('');
  });
});
