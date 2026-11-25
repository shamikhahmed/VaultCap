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

  test('netOpts suggests SIM carriers for every country plus global eSIMs', async ({ page }) => {
    const rows = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/world-carriers.min.json'), 'utf8'));
    expect(new Set(rows.map(r => r[1])).size).toBeGreaterThanOrEqual(206); // 205 countries + OTHER
    await page.goto('/');
    await page.waitForFunction(() => typeof WorldCarriers !== 'undefined' && typeof U !== 'undefined');
    await page.evaluate(() => WorldCarriers.load());
    const r = await page.evaluate(() => ({ ke: U.netOpts('KE'), jp: U.netOpts('JP'), pk: U.netOpts('PK') }));
    expect(r.ke).toContain('Safaricom');
    expect(r.ke).toContain('Airalo');
    expect(r.jp).toContain('NTT docomo');
    expect((r.pk.match(/value="Jazz"/g) || []).length).toBe(1);
  });

  test('brokerOpts suggests local and global investment platforms', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => typeof WorldBrokers !== 'undefined' && typeof U !== 'undefined');
    await page.evaluate(() => WorldBrokers.load());
    const r = await page.evaluate(() => ({ ke: U.brokerOpts('KE'), us: U.brokerOpts('US'), none: U.brokerOpts('') }));
    expect(r.ke).toContain('Genghis Capital');
    expect(r.ke).toContain('Interactive Brokers');
    expect(r.ke).not.toContain('Nairobi Securities Exchange'); // reference-only rows stay out of pickers
    expect(r.us).toContain('Fidelity');
    expect((r.us.match(/value="eToro"/g) || []).length).toBe(1);
    expect(r.none).toContain('AJ Bell'); // curated list still shown without a country
  });
});
