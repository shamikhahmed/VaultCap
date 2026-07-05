// @ts-check
const { test, expect } = require('@playwright/test');
const { unlockDemoVault, dismissOverlays, enterPin } = require('./demo-unlock');

const DEMO_PIN = '123456';
const DEMO_DECOY_PIN = '000000';
const TINY_JPEG = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKjcoHyMmKTM0MTExMTYxOjs+9v/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=';

/** @param {import('@playwright/test').Page} page */
async function seedDemoDecoySlot(page) {
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

/** @param {import('@playwright/test').Page} page */
async function lockAndEnterDecoyPin(page) {
  await page.evaluate(() => R.lock());
  await expect(page.locator('#pgLock')).toBeVisible({ timeout: 10000 });
  await enterPin(page, DEMO_DECOY_PIN);
  await dismissOverlays(page);
}

test.describe('Beta security & export features', () => {
  test('decoy PIN shows fake vault without real documents', async ({ page }) => {
    await unlockDemoVault(page);
    const realDocCount = await page.evaluate(() => (S.documents || []).length);
    expect(realDocCount).toBeGreaterThan(0);

    await seedDemoDecoySlot(page);
    await lockAndEnterDecoyPin(page);

    const decoyState = await page.evaluate(() => ({
      decoy: S.decoy,
      docCount: (S.documents || []).length,
      bankCount: (S.banks || []).length,
    }));

    expect(decoyState.decoy).toBe(true);
    expect(decoyState.docCount).toBe(0);
    expect(decoyState.bankCount).toBeGreaterThan(0);
  });

  test('document PDF export opens print window when photos exist', async ({ page }) => {
    await unlockDemoVault(page);
    await dismissOverlays(page);

    const popupPromise = page.waitForEvent('popup');
    await page.evaluate((jpeg) => {
      const doc = (S.documents || [])[0];
      if (!doc) throw new Error('No demo documents');
      doc.frontPhoto = jpeg;
      DocsModule.exportPhotosPDF(doc.id);
    }, TINY_JPEG);

    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded');
    await expect(popup.locator('h1')).toBeVisible();
    await popup.close();
  });

  test('document export blocked in decoy mode', async ({ page }) => {
    await unlockDemoVault(page);
    await seedDemoDecoySlot(page);
    await lockAndEnterDecoyPin(page);

    const blocked = await page.evaluate((jpeg) => {
      S.documents = [{ id: 'x', docType: 'passport', frontPhoto: jpeg }];
      DocsModule.exportPhotosPDF('x');
      return S.decoy;
    }, TINY_JPEG);

    expect(blocked).toBe(true);
    const toastText = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.toast, [class*="toast"], #pmsg'))
        .map(el => el.textContent || '')
        .join(' ')
        .toLowerCase();
    });
    expect(toastText).toContain('decoy');
  });
});
