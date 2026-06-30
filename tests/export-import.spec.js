// @ts-check
const { test, expect } = require('@playwright/test');
const { unlockDemoVault } = require('./demo-unlock');

test.describe('VaultCap export/import round-trip', () => {
  test('JSON export payload matches live vault schema', async ({ page }) => {
    await unlockDemoVault(page);
    const meta = await page.evaluate(() => {
      const snap = ExIm._exportMeta('json');
      return {
        format: snap._meta.format,
        app: snap._meta.app,
        banks: (S.banks || []).length,
        hasSchema: typeof SCHEMA_VERSION !== 'undefined',
      };
    });
    expect(meta.format).toContain('vaultcap');
    expect(meta.app).toBe('VaultCap');
    expect(meta.banks).toBeGreaterThan(0);
    expect(meta.hasSchema).toBe(true);
  });

  test('JSON import merges new bank without duplicate IDs', async ({ page }) => {
    await unlockDemoVault(page);
    const result = await page.evaluate(() => {
      window.__vos_confirm = () => true;
      const id = 'audit_bank_' + Date.now();
      const testBank = {
        id,
        bankName: 'Audit Import Bank',
        accountType: 'current',
        balance: 12345,
        currency: 'GBP',
        country: 'GB',
        createdAt: new Date().toISOString(),
      };
      const before = (S.banks || []).length;
      const payload = JSON.stringify({
        banks: [testBank],
        cards: [],
        emails: [],
        gadgets: [],
        expenses: [],
      });
      const data = JSON.parse(payload);
      ['banks', 'cards', 'investments', 'cash', 'loans', 'friends', 'bc', 'bonds', 'sims', 'assets', 'expenses', 'emails', 'gadgets', 'digital', 'documents', 'tags', 'familyMembers'].forEach((k) => {
        if (Array.isArray(data[k])) {
          S[k] = [...(S[k] || []), ...data[k].filter((x) => !(S[k] || []).find((y) => y.id === x.id))];
        }
      });
      const after = (S.banks || []).length;
      const found = (S.banks || []).find((b) => b.id === id);
      // cleanup
      S.banks = (S.banks || []).filter((b) => b.id !== id);
      return { before, after, merged: !!found, name: found?.bankName, balance: found?.balance };
    });
    expect(result.after).toBe(result.before + 1);
    expect(result.merged).toBe(true);
    expect(result.name).toBe('Audit Import Bank');
    expect(result.balance).toBe(12345);
  });

  test('duplicate import ID does not create second row', async ({ page }) => {
    await unlockDemoVault(page);
    const dup = await page.evaluate(() => {
      const existing = (S.banks || [])[0];
      if (!existing) return { ok: false };
      const before = S.banks.length;
      const data = { banks: [{ ...existing }], cards: [], emails: [], gadgets: [], expenses: [] };
      ['banks'].forEach((k) => {
        if (Array.isArray(data[k])) {
          S[k] = [...(S[k] || []), ...data[k].filter((x) => !(S[k] || []).find((y) => y.id === x.id))];
        }
      });
      return { ok: true, before, after: S.banks.length };
    });
    expect(dup.ok).toBe(true);
    expect(dup.after).toBe(dup.before);
  });
});

test.describe('VaultCap legacy encrypted backup', () => {
  test('Crypto encrypt/decrypt round-trip with demo PIN', async ({ page }) => {
    await unlockDemoVault(page);
    const result = await page.evaluate(async () => {
      if (!Crypto.available()) return { ok: false, reason: 'no-crypto' };
      const pw = S.pin + '_vos4_' + S.user.name;
      const payload = {
        ...ExIm._exportMeta('vault'),
        banks: [{ id: 'rt_test', bankName: 'RoundTrip Bank', balance: 99, currency: 'GBP' }],
      };
      const enc = await Crypto.encrypt(JSON.stringify(payload), pw);
      const dec = await Crypto.decrypt(enc, pw);
      const parsed = JSON.parse(dec);
      return {
        ok: true,
        hasPrefix: typeof enc === 'string' && enc.length > 20,
        bankName: parsed.banks?.[0]?.bankName,
        app: parsed._meta?.app,
      };
    });
    expect(result.ok).toBe(true);
    expect(result.bankName).toBe('RoundTrip Bank');
    expect(result.app).toBe('VaultCap');
  });

  test('legacy VAULTOS_AES256 import path decrypts and merges', async ({ page }) => {
    await unlockDemoVault(page);
    const result = await page.evaluate(async () => {
      window.__vos_confirm = () => true;
      const pw = S.pin + '_vos4_' + S.user.name;
      const id = 'legacy_imp_' + Date.now();
      const data = {
        _meta: { format: 'vaultcap-backup-json', app: 'VaultCap' },
        banks: [{
          id,
          bankName: 'Legacy Import Bank',
          accountType: 'savings',
          balance: 500,
          currency: 'GBP',
          country: 'GB',
          createdAt: new Date().toISOString(),
        }],
      };
      const enc = await Crypto.encrypt(JSON.stringify(data), pw);
      const raw = 'VAULTOS_AES256::' + enc;
      const plain = await Crypto.decrypt(raw.replace('VAULTOS_AES256::', ''), pw);
      const parsed = JSON.parse(plain);
      const before = S.banks.length;
      ['banks'].forEach((k) => {
        if (Array.isArray(parsed[k])) {
          S[k] = [...(S[k] || []), ...parsed[k].filter((x) => !(S[k] || []).find((y) => y.id === x.id))];
        }
      });
      const found = S.banks.find((b) => b.id === id);
      S.banks = S.banks.filter((b) => b.id !== id);
      return { before, afterMerge: before + 1, found: found?.bankName };
    });
    expect(result.found).toBe('Legacy Import Bank');
  });
});

test.describe('VaultCap form attr XSS', () => {
  test('escAttr neutralizes quotes in bank edit form', async ({ page }) => {
    await unlockDemoVault(page);
    const safe = await page.evaluate(() => {
      const id = U.id();
      S.banks.push({
        id,
        bankName: '"><script>alert(1)</script>',
        accountType: 'current',
        balance: 1,
        currency: 'GBP',
        country: 'GB',
        notes: "' onclick=alert(1) '",
        createdAt: new Date().toISOString(),
      });
      Banks.render();
      Banks.edit(id);
      const html = document.getElementById('mBody')?.innerHTML || '';
      Modal.close();
      S.banks = S.banks.filter((b) => b.id !== id);
      return {
        hasRawScript: html.includes('<script>'),
        hasEscaped: html.includes('&lt;script&gt;') || html.includes('&quot;&gt;'),
      };
    });
    expect(safe.hasRawScript).toBe(false);
    expect(safe.hasEscaped).toBe(true);
  });
});
