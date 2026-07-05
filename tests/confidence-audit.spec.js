// @ts-check
/** Targeted tests for areas with highest regression risk. */
const { test, expect } = require('@playwright/test');
const { unlockDemoVault, dismissOverlays, enterPin } = require('./demo-unlock');

const REAL_PIN = '123456';
const DECOY_PIN = '000000';
const TINY_JPEG = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKjcoHyMmKTM0MTExMTYxOjs+9v/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=';

async function seedDecoySlot(page) {
  await page.evaluate(async () => {
    if (typeof ensureDemoVaultReady === 'function') await ensureDemoVaultReady();
    await VaultDB.tryPin(VaultProfiles.DEMO_PIN);
    Store.save();
    await Store.flush();
    await VaultDB.saveDecoySlot('000000', { _decoy: true });
    S.decoyPin = '000000';
    Store.save();
    await Store.flush();
  });
}

test.describe('Confidence audit — decoy roundtrip', () => {
  test('decoy unlock then real PIN restores original documents and banks', async ({ page }) => {
    await unlockDemoVault(page);
    await seedDecoySlot(page);

    const before = await page.evaluate(() => ({
      docIds: (S.documents || []).map(d => d.id),
      bankCount: (S.banks || []).length,
      cardCount: (S.cards || []).length,
      passport: (S.documents || []).find(d => d.docType === 'passport')?.docNumber,
    }));
    expect(before.docIds.length).toBeGreaterThan(0);
    expect(before.bankCount).toBe(6);

    await page.evaluate(() => R.lock());
    await enterPin(page, DECOY_PIN);
    await dismissOverlays(page);

    const decoy = await page.evaluate(() => ({
      decoy: S.decoy,
      docs: (S.documents || []).length,
      banks: (S.banks || []).length,
    }));
    expect(decoy.decoy).toBe(true);
    expect(decoy.docs).toBe(0);

    // Store.save must not persist decoy state to main vault
    const saveBlocked = await page.evaluate(async () => {
      const beforeSave = (S.banks || []).length;
      S.banks.push({ id: 'fake-decoy-bank', bankName: 'Decoy Test Bank' });
      await Store.save();
      return { saveAttempted: true, banksAfter: (S.banks || []).length, decoy: S.decoy };
    });
    expect(saveBlocked.decoy).toBe(true);

    await page.evaluate(() => R.lock());
    await enterPin(page, REAL_PIN);
    await dismissOverlays(page);

    const restored = await page.evaluate(() => ({
      decoy: S.decoy,
      docIds: (S.documents || []).map(d => d.id),
      bankCount: (S.banks || []).length,
      cardCount: (S.cards || []).length,
      passport: (S.documents || []).find(d => d.docType === 'passport')?.docNumber,
      hasFakeBank: (S.banks || []).some(b => b.bankName === 'Decoy Test Bank'),
    }));

    expect(restored.decoy).toBe(false);
    expect(restored.docIds.length).toBe(before.docIds.length);
    expect(restored.bankCount).toBe(before.bankCount);
    expect(restored.cardCount).toBe(before.cardCount);
    expect(restored.passport).toBe(before.passport);
    expect(restored.hasFakeBank).toBe(false);
  });

  test('vault export blocked in decoy mode', async ({ page }) => {
    await unlockDemoVault(page);
    await seedDecoySlot(page);
    await page.evaluate(() => R.lock());
    await enterPin(page, DECOY_PIN);
    await dismissOverlays(page);

    const result = await page.evaluate(() => {
      ExIm.export('vault');
      return { decoy: S.decoy };
    });
    expect(result.decoy).toBe(true);
    const toastText = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.toast, [class*="toast"]'))
        .map(el => el.textContent || '').join(' ').toLowerCase()
    );
    expect(toastText).toMatch(/decoy|export disabled/);
  });
});

test.describe('Confidence audit — Travel Mode persistence', () => {
  test('survives lock/unlock with real PIN', async ({ page }) => {
    await unlockDemoVault(page);
    await dismissOverlays(page);

    const before = await page.evaluate(() => ({
      workspace: S.workspace,
      privacy: S.privacyMode,
      investments: S.modules.investments,
    }));

    await page.evaluate(async () => {
      await TravelMode.enable('PK');
    });
    const beforeLock = await page.evaluate(async () => {
      await Store.flush();
      const loaded = await VaultDB.load();
      return {
        mem: S.user.travelModeActive,
        loaded: loaded?.user?.travelModeActive,
        session: !!VaultDB.sessionKey,
      };
    });
    expect(beforeLock.mem).toBe(true);
    expect(beforeLock.session).toBe(true);
    expect(beforeLock.loaded).toBe(true);

    await page.evaluate(() => Dash.render());

    await page.evaluate(() => R.lock());
    await enterPin(page, REAL_PIN);
    await dismissOverlays(page);
    await page.evaluate(() => Dash.render());

    const after = await page.evaluate(() => ({
      active: S.user.travelModeActive,
      workspace: S.workspace,
      context: S.user.activeContext,
      privacy: S.privacyMode,
      investments: S.modules.investments,
      hasBanner: !!document.querySelector('.travel-banner'),
    }));

    expect(after.active).toBe(true);
    expect(after.workspace).toBe('traveler');
    expect(after.context).toBe('PK');
    expect(after.privacy).toBe(true);
    expect(after.investments).toBe(false);
    expect(after.hasBanner).toBe(true);

    await page.evaluate(() => TravelMode.disable());
    const restored = await page.evaluate(() => ({
      active: S.user.travelModeActive,
      workspace: S.workspace,
      privacy: S.privacyMode,
      investments: S.modules.investments,
    }));
    expect(restored.active).toBe(false);
    expect(restored.workspace).toBe(before.workspace);
    expect(restored.privacy).toBe(before.privacy);
    expect(restored.investments).toBe(before.investments);
  });

  test('blocked in decoy vault', async ({ page }) => {
    await unlockDemoVault(page);
    await seedDecoySlot(page);
    await page.evaluate(() => R.lock());
    await enterPin(page, DECOY_PIN);
    await dismissOverlays(page);

    const result = await page.evaluate(() => {
      TravelMode.enable('GB');
      return {
        decoy: S.decoy,
        travelActive: S.user.travelModeActive,
      };
    });
    expect(result.decoy).toBe(true);
    expect(result.travelActive).toBeFalsy();
  });
});

test.describe('Confidence audit — Tax UI calculate()', () => {
  test.beforeEach(async ({ page }) => {
    await unlockDemoVault(page);
    await dismissOverlays(page);
    await page.evaluate(() => R.goto('tax'));
  });

  test('PK salaried slab calculation renders correct take-home', async ({ page }) => {
    await page.evaluate(() => {
      Tax._country = 'PK';
      Tax._filing = 'salaried';
      Tax._taxYear = '2024-25';
      Tax.render();
    });
    await page.locator('#tax-income').fill('1500000');
    await page.evaluate(() => Tax.calculate());

    const result = await page.evaluate(() => {
      const report = document.getElementById('tax-result')?.textContent || '';
      const calc = Tax.computeSlabTax(
        1500000,
        Tax.config.PK.filings.salaried.taxYears['2024-25'].slabs,
        [],
        []
      );
      return { report, takeHome: calc.takeHome, tax: calc.tax };
    });

    expect(result.tax).toBe(75000);
    expect(result.takeHome).toBe(1425000);
    expect(result.report).toContain('1,425,000');
    expect(result.report).toContain('75,000');
  });

  test('GB employed includes NI in report', async ({ page }) => {
    await page.evaluate(() => {
      Tax._country = 'GB';
      Tax._filing = 'employed';
      Tax.render();
    });
    await page.locator('#tax-income').fill('50000');
    await page.evaluate(() => Tax.calculate());

    const result = await page.evaluate(() => {
      const html = document.getElementById('tax-result')?.innerHTML || '';
      const calc = Tax.computeSlabTax(
        50000,
        Tax.config.GB.filings.employed.slabs,
        Tax.config.GB.filings.employed.ni,
        Tax.config.GB.filings.employed.extras
      );
      return { hasNI: html.includes('National Insurance'), ni: calc.ni, takeHome: calc.takeHome };
    });

    expect(result.hasNI).toBe(true);
    expect(result.ni).toBeCloseTo(2994.4, 0);
    expect(result.takeHome).toBeCloseTo(39519.6, 0);
  });
});

test.describe('Confidence audit — Zakat UI recalculate', () => {
  test('2.5% due shown when above nisab', async ({ page }) => {
    await unlockDemoVault(page);
    await dismissOverlays(page);
    await page.evaluate(() => R.goto('zakat'));

    await page.evaluate(() => {
      Zakat._mode = 'personal';
      Zakat.render();
      const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = String(val);
      };
      set('z-cash', 500000);
      set('z-invest', 500000);
      Zakat._recalculate();
    });

    const result = await page.evaluate(() => {
      const dueEl = document.getElementById('zakat-due-amount');
      const pure = Zakat.computeZakatDue({ cash: 500000, invest: 500000, nisabValue: 200000 });
      return {
        uiDue: dueEl?.textContent || '',
        pureDue: pure.zakatDue,
        inner: document.getElementById('zakat-result-inner')?.textContent || '',
      };
    });

    expect(result.pureDue).toBe(25000);
    expect(result.inner.toLowerCase()).toMatch(/zakat due|2\.5%/);
  });
});
