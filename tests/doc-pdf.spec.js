// @ts-check
const { test, expect } = require('@playwright/test');
const { unlockDemoVault, dismissOverlays } = require('./demo-unlock');

/** Minimal valid JPEG (1×1) as raw base64 (no data: prefix) */
const TINY_JPEG =
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGcP//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEABj8Cf//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8hf//Z';

test.describe('VaultCap document PDF', () => {
  test('buildPdfHtml includes vault name, holder, photo for single doc', async ({ page }) => {
    await unlockDemoVault(page);
    await dismissOverlays(page);

    const html = await page.evaluate((jpeg) => {
      const doc = {
        id: 'test-pdf-doc',
        docType: 'passport',
        holderName: 'Ada Lovelace',
        docNumber: 'P1234567',
        issuingCountry: 'UK',
        expiryDate: '2030-12-31',
        notes: 'Test note',
        frontPhoto: jpeg,
        tags: ['travel'],
      };
      return DocsModule.buildPdfHtml([doc]);
    }, TINY_JPEG);

    expect(html).toContain('Ada Lovelace');
    expect(html).toContain('P1234567');
    expect(html).toContain('VaultCap');
    expect(html).toContain('data:image/jpeg;base64,' + TINY_JPEG.slice(0, 20));
    expect(html).toContain('Print / Save PDF');
    expect(html).toContain('onclick="window.print()"');
  });

  test('exportSelectedPdf opens popup with N sections', async ({ page }) => {
    await unlockDemoVault(page);
    await dismissOverlays(page);

    const popupPromise = page.waitForEvent('popup', { timeout: 10000 });

    await page.evaluate((jpeg) => {
      if (!S.documents) S.documents = [];
      S.documents.push(
        { id: 'pdf-a', docType: 'nic', holderName: 'Person A', docNumber: '111', frontPhoto: jpeg },
        { id: 'pdf-b', docType: 'visa', holderName: 'Person B', docNumber: '222', frontPhoto: jpeg }
      );
      DocsModule.selected = { 'pdf-a': true, 'pdf-b': true };
      DocsModule.exportSelectedPdf();
    }, TINY_JPEG);

    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded');
    const body = await popup.content();
    expect(body).toContain('Person A');
    expect(body).toContain('Person B');
    expect(body).toContain('Document 1 of 2');
    expect(body).toContain('Document 2 of 2');
    await popup.close();
  });

  test('Documents list shows Select and Export visible PDF', async ({ page }) => {
    await unlockDemoVault(page);
    await dismissOverlays(page);
    await page.evaluate(() => {
      if (typeof R !== 'undefined') R.goto('documents');
    });
    await expect(page.locator('#pg-documents')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Select' })).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole('button', { name: 'Export visible PDF' })).toBeVisible();
  });
});
