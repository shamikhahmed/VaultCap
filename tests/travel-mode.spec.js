// @ts-check
const { test, expect } = require('@playwright/test');
const { unlockDemoVault, dismissOverlays } = require('./demo-unlock');

test.describe('Travel Mode', () => {
  test.beforeEach(async ({ page }) => {
    await unlockDemoVault(page);
    await dismissOverlays(page);
  });

  test('enables traveler workspace, privacy, and dashboard banner', async ({ page }) => {
    const before = await page.evaluate(() => ({
      workspace: S.workspace,
      privacy: S.privacyMode,
      modules: { ...S.modules },
    }));

    await page.evaluate(async () => { await TravelMode.enable('GB'); });

    const after = await page.evaluate(() => ({
      active: S.user.travelModeActive,
      workspace: S.workspace,
      context: S.user.activeContext,
      privacy: S.privacyMode,
      hasSnapshot: !!S.user.travelModeSnapshot,
      banksOn: S.modules.banks,
      investmentsOn: S.modules.investments,
    }));

    expect(after.active).toBe(true);
    expect(after.workspace).toBe('traveler');
    expect(after.context).toBe('GB');
    expect(after.privacy).toBe(true);
    expect(after.hasSnapshot).toBe(true);
    expect(after.banksOn).toBe(true);
    expect(after.investmentsOn).toBe(false);

    await page.evaluate(() => Dash.render());
    await expect(page.locator('.travel-banner')).toBeVisible();
    await expect(page.locator('.travel-banner')).toContainText('Travel Mode');

    await page.evaluate(async () => { await TravelMode.disable(); });

    const restored = await page.evaluate(() => ({
      active: S.user.travelModeActive,
      workspace: S.workspace,
      privacy: S.privacyMode,
      hasSnapshot: !!S.user.travelModeSnapshot,
    }));

    expect(restored.active).toBe(false);
    expect(restored.workspace).toBe(before.workspace);
    expect(restored.privacy).toBe(before.privacy);
    expect(restored.hasSnapshot).toBe(false);
  });

  test('command palette includes Travel Mode action', async ({ page }) => {
    await page.evaluate(() => { CMD.open(); CMD.search('travel'); });
    await expect(page.locator('#cmdList')).toContainText('Travel Mode');
  });

  test('settings security row toggles travel mode', async ({ page }) => {
    await page.evaluate(() => R.goto('settings'));
    await page.evaluate(() => SettingsNav.show('security'));
    await expect(page.locator('#settBody')).toContainText('Travel Mode');
  });
});
