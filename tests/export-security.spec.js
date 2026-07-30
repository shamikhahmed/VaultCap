// @ts-check
const { test, expect } = require('@playwright/test');
const { unlockDemoVault } = require('./demo-unlock');

test.describe('VaultCap export', () => {
  test('JSON export payload includes core demo entities', async ({ page }) => {
    await unlockDemoVault(page);
    const payload = await page.evaluate(() => {
      const snap = JSON.parse(JSON.stringify(S));
      return {
        banks: (snap.banks || []).length,
        cards: (snap.cards || []).length,
        documents: (snap.documents || []).length,
        family: (snap.familyMembers || snap.family || []).length,
        hasUser: !!snap.user,
      };
    });
    expect(payload.banks).toBeGreaterThan(0);
    expect(payload.cards).toBeGreaterThan(0);
    expect(payload.documents).toBeGreaterThan(0);
    expect(payload.family).toBeGreaterThan(0);
    expect(payload.hasUser).toBe(true);
  });
});

test.describe('VaultCap alerts', () => {
  test('demo shows expiring NIC document alert', async ({ page }) => {
    await unlockDemoVault(page);
    await page.evaluate(() => R.goto('alerts'));
    await expect(page.locator('#pg-alerts.on')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#alertBody')).toContainText(/Document Expiry|42301|Alex Khan/i);
  });
});

test.describe('VaultCap security', () => {
  test('escHtml neutralizes script in cash list render', async ({ page }) => {
    await unlockDemoVault(page);
    const injected = await page.evaluate(() => {
      const id = U.id();
      S.cash.push({ id, location: '<img onerror=alert(1)>', amount: 1, currency: 'GBP', notes: '<script>x</script>', tags: ['<b>ok</b>'], createdAt: new Date().toISOString() });
      Cash.render();
      const html = document.getElementById('cashItems')?.innerHTML || '';
      S.cash = S.cash.filter((c) => c.id !== id);
      Cash.render();
      return { hasRawScript: html.includes('<script>'), hasEscaped: html.includes('&lt;') };
    });
    expect(injected.hasRawScript).toBe(false);
    expect(injected.hasEscaped).toBe(true);
  });

  test('data integrity scan runs without error on demo', async ({ page }) => {
    await unlockDemoVault(page);
    const result = await page.evaluate(() => {
      if (typeof DataIntegrity === 'undefined') return { ok: false };
      const r = DataIntegrity.check();
      return { ok: true, high: r.highCount, possible: r.posCount };
    });
    expect(result.ok).toBe(true);
    expect(result.high).toBe(0);
  });

  test('plaintext export does not stamp lastBackup', async ({ page }) => {
    await unlockDemoVault(page);
    const result = await page.evaluate(async () => {
      const before = S.user.lastBackup || null;
      window.__vos_confirm = () => true;
      window.prompt = () => 'EXPORT PLAINTEXT';
      const origDl = ExIm.dl;
      let name = '';
      ExIm.dl = (n) => { name = n; };
      ExIm.export('json');
      ExIm.dl = origDl;
      return {
        lastBackupUnchanged: (S.user.lastBackup || null) === before,
        filename: name,
      };
    });
    expect(result.lastBackupUnchanged).toBe(true);
    expect(result.filename).toMatch(/plaintext/i);
  });

  test('CSP connect-src allows LLM proxy', async ({ page }) => {
    await page.goto('/');
    const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
    expect(csp).toContain('vaultos-llm-proxy.shamikhahmed.workers.dev');
    expect(csp).not.toContain('frankfurter');
  });
});
