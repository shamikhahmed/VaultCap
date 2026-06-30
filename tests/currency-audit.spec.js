// @ts-check
const { test, expect } = require('@playwright/test');
const { unlockDemoVault } = require('./demo-unlock');

const CURRENCIES = ['GBP', 'PKR', 'AED', 'USD', 'EUR'];

test.describe('VaultCap currency engine', () => {
  test('multi-currency round-trip and NW identity hold', async ({ page }) => {
    await unlockDemoVault(page);
    const result = await page.evaluate((codes) => {
      const out = { roundTrips: [], nwOk: false, cashOk: false };
      const sample = 10000;
      codes.forEach((code) => {
        const pkr = CurrencyEngine.toBase(sample, code);
        const back = CurrencyEngine.convert(pkr, 'PKR', code);
        out.roundTrips.push({ code, sample, pkr, back, drift: Math.abs(back - sample) });
      });
      const nw = CurrencyEngine.computeNetWorthPKR();
      out.nwOk = Math.abs(
        nw.bankPKR + nw.invPKR + nw.asPKR + nw.cashPKR + nw.bcPKR + nw.bondsPKR - nw.debtPKR - nw.nwPKR
      ) < 1;

      const cashPKR = (S.cash || []).reduce((a, c) => a + CurrencyEngine.toBase(c.amount || 0, c.currency), 0);
      out.cashOk = Math.abs(cashPKR - nw.cashPKR) < 1;
      out.nw = nw;
      return out;
    }, CURRENCIES);

    result.roundTrips.forEach((rt) => {
      expect(rt.pkr).toBeGreaterThan(0);
      expect(rt.drift).toBeLessThan(2);
    });
    expect(result.nwOk).toBe(true);
    expect(result.cashOk).toBe(true);
    expect(result.nw.nwPKR).toBeGreaterThan(0);
  });
});
