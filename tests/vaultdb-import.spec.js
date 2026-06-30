// @ts-check
const { test, expect } = require('@playwright/test');
const { unlockDemoVault } = require('./demo-unlock');

test.describe('VaultDB binary .vos import', () => {
  test.beforeEach(async ({ page }) => {
    await unlockDemoVault(page);
  });

  test('exportEncrypted blob round-trips via importEncrypted', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const pin = '123456';
      const marker = 'idb_bank_' + Date.now();
      const payload = {
        user: { name: 'IDB Roundtrip', currency: 'GBP', onboardingComplete: true },
        modules: S.modules || {},
        banks: [{
          id: marker,
          bankName: 'IDB Import Bank',
          accountType: 'current',
          balance: 4242,
          currency: 'GBP',
          country: 'GB',
          createdAt: new Date().toISOString(),
        }],
        cards: [],
        investments: [],
        cash: [],
        loans: [],
        friends: [],
        sims: [],
        assets: [],
        expenses: [],
        emails: [],
        digital: [],
        documents: [],
        tags: [],
        familyMembers: [],
        vaultMeta: {},
      };

      const readMainBlob = (dbName) => new Promise((resolve, reject) => {
        const req = indexedDB.open(dbName, 1);
        req.onupgradeneeded = (e) => e.target.result.createObjectStore('vault');
        req.onsuccess = (e) => {
          const tx = e.target.result.transaction('vault', 'readonly');
          const get = tx.objectStore('vault').get('main');
          get.onsuccess = () => resolve(get.result || null);
          get.onerror = () => reject(get.error);
        };
        req.onerror = () => reject(req.error);
      });

      await VaultDB.init(pin);
      await VaultDB.save(payload);
      const dbName = VaultDB.databaseName();
      const buf = await readMainBlob(dbName);
      if (!buf || !(buf instanceof Uint8Array) && !ArrayBuffer.isView(buf)) {
        return { ok: false, step: 'encrypt', reason: 'no-blob' };
      }

      await VaultDB.wipe();
      const file = new File([buf], 'roundtrip.vos', { type: 'application/octet-stream' });
      const imported = await VaultDB.importEncrypted(file, pin);
      const bank = (imported.banks || []).find((b) => b.id === marker);

      await VaultDB.wipe();
      VaultDB.sessionKey = null;

      return {
        ok: !!bank,
        step: bank ? 'done' : 'import',
        name: bank?.bankName,
        balance: bank?.balance,
        dbName,
      };
    });

    expect(result.ok).toBe(true);
    expect(result.name).toBe('IDB Import Bank');
    expect(result.balance).toBe(4242);
  });

  test('importEncrypted rejects wrong PIN', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const pin = '123456';
      const payload = { user: { name: 'Wrong PIN Test' }, banks: [], cards: [] };
      await VaultDB.init(pin);
      await VaultDB.save(payload);
      const dbName = VaultDB.databaseName();
      const buf = await new Promise((resolve, reject) => {
        const req = indexedDB.open(dbName, 1);
        req.onsuccess = (e) => {
          const get = e.target.result.transaction('vault', 'readonly').objectStore('vault').get('main');
          get.onsuccess = () => resolve(get.result);
          get.onerror = () => reject(get.error);
        };
        req.onerror = () => reject(req.error);
      });
      await VaultDB.wipe();
      const file = new File([buf], 'bad.vos', { type: 'application/octet-stream' });
      let err = '';
      try {
        await VaultDB.importEncrypted(file, '000000');
      } catch (e) {
        err = e.message || String(e);
      }
      VaultDB.sessionKey = null;
      return { rejected: /wrong PIN|Decryption failed/i.test(err), err };
    });
    expect(result.rejected).toBe(true);
  });
});
