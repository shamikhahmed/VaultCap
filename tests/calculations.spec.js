// @ts-check
const { test, expect } = require('@playwright/test');
const { unlockDemoVault } = require('./demo-unlock');

test.describe('VaultCap calculation audit', () => {
  test.beforeEach(async ({ page }) => {
    await unlockDemoVault(page);
  });

  test('Tax.computeSlabTax — PK salaried 2024-25 slabs', async ({ page }) => {
    const result = await page.evaluate(() => {
      const filing = Tax.config.PK.filings.salaried;
      const slabs = filing.taxYears['2024-25'].slabs;
      return Tax.computeSlabTax(1500000, slabs, filing.ni, filing.extras);
    });
    expect(result.tax).toBe(75000);
    expect(result.total).toBe(75000);
    expect(result.takeHome).toBe(1425000);
    expect(result.breakdown.length).toBeGreaterThan(0);
  });

  test('Tax.computeSlabTax — GB employed with NI', async ({ page }) => {
    const result = await page.evaluate(() => {
      const filing = Tax.config.GB.filings.employed;
      return Tax.computeSlabTax(50000, filing.slabs, filing.ni, filing.extras);
    });
    expect(result.tax).toBe(7486);
    expect(result.ni).toBeCloseTo(2994.4, 1);
    expect(result.total).toBeCloseTo(10480.4, 1);
    expect(result.takeHome).toBeCloseTo(39519.6, 1);
  });

  test('Tax.computeSlabTax — UAE zero income tax', async ({ page }) => {
    const result = await page.evaluate(() => {
      const filing = Tax.config.AE.filings.individual;
      return Tax.computeSlabTax(500000, filing.slabs, filing.ni, filing.extras);
    });
    expect(result.tax).toBe(0);
    expect(result.takeHome).toBe(500000);
  });

  test('Zakat.computeZakatDue — 2.5% above nisab', async ({ page }) => {
    const result = await page.evaluate(() => Zakat.computeZakatDue({
      cash: 500000,
      invest: 500000,
      nisabValue: 200000,
    }));
    expect(result.netZakatable).toBe(1000000);
    expect(result.aboveNisab).toBe(true);
    expect(result.zakatDue).toBe(25000);
  });

  test('Zakat.computeZakatDue — below nisab returns zero', async ({ page }) => {
    const result = await page.evaluate(() => Zakat.computeZakatDue({
      cash: 100000,
      nisabValue: 200000,
    }));
    expect(result.aboveNisab).toBe(false);
    expect(result.zakatDue).toBe(0);
  });

  test('BCModule.computePot and computePaid', async ({ page }) => {
    const result = await page.evaluate(() => ({
      pot: BCModule.computePot(10, 10000),
      paid: BCModule.computePaid(3, 10, 10, 10000),
    }));
    expect(result.pot).toBe(100000);
    expect(result.paid).toBe(30000);
  });

  test('Loans.computeRemaining', async ({ page }) => {
    const result = await page.evaluate(() => ({
      partial: Loans.computeRemaining(5000, 2000),
      settled: Loans.computeRemaining(5000, 5000),
      overpaid: Loans.computeRemaining(5000, 6000),
    }));
    expect(result.partial).toBe(3000);
    expect(result.settled).toBe(0);
    expect(result.overpaid).toBe(0);
  });

  test('net worth identity holds on demo vault', async ({ page }) => {
    const ok = await page.evaluate(() => {
      const nw = CurrencyEngine.computeNetWorthPKR();
      const sum = nw.bankPKR + nw.invPKR + nw.asPKR + nw.cashPKR + nw.bcPKR + nw.bondsPKR - nw.debtPKR;
      return Math.abs(sum - nw.nwPKR) < 1;
    });
    expect(ok).toBe(true);
  });
});
