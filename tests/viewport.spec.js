// @ts-check
const { test, expect } = require('@playwright/test');
const {
  resize,
  assertVaultCapMobile,
  assertVaultCapDesktop,
} = require('../../capricorn-tooling/shared/testing/viewport-helpers');
const { unlockDemoVault } = require('./demo-unlock');

test.describe('VaultCap viewport contract', () => {
  test.beforeEach(async ({ page }) => {
    await unlockDemoVault(page);
  });

  test('375px — bottom tabs, sidebar hidden', async ({ page }) => {
    await resize(page, 'mobile');
    await assertVaultCapMobile(page, expect);
  });

  test('1280px — sidebar visible, bottom tabs hidden', async ({ page }) => {
    await resize(page, 'desktop');
    await assertVaultCapDesktop(page, expect);
  });
});
