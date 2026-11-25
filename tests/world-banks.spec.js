// @ts-check
/** World bank catalog: lazy-loaded, covers every country, feeds U.bankOpts. */
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

test.describe('world bank catalog', () => {
  test('data covers every ISO country in the catalog source', () => {
    const rows = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/world-banks.min.json'), 'utf8'));
    const full = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/world-banks.json'), 'utf8'));
    expect(rows.length).toBe(full.length);
    expect(new Set(rows.map(r => r[1])).size).toBeGreaterThanOrEqual(205);
    for (const b of full) {
      expect(b.n && b.c && b.t, JSON.stringify(b)).toBeTruthy();
      if (b.logo) expect(fs.existsSync(path.join(ROOT, b.logo)), b.logo).toBe(true);
    }
  });

  test('bankOpts suggests banks for countries beyond the curated list', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => typeof WorldBanks !== 'undefined' && typeof U !== 'undefined');
    await page.evaluate(() => WorldBanks.load());
    const r = await page.evaluate(() => ({
      ke: U.bankOpts('KE'),
      pk: U.bankOpts('PK'),
      missing: ['KE', 'BR', 'JP', 'NG', 'FJ', 'TV', 'VA', 'XK'].filter(cc => !WorldBanks.forCountry(cc).length),
      domain: WorldBanks.domain('Equity Bank'),
    }));
    expect(r.ke).toContain('Equity Bank');
    expect(r.ke).toContain('M-Pesa (Safaricom)');
    expect(r.pk).toContain('Meezan Bank');
    expect((r.pk.match(/value="Meezan Bank"/g) || []).length).toBe(1); // curated + world deduped
    expect(r.missing).toEqual([]);
    expect(r.domain).toBe('equitygroupholdings.com');
  });
});
