// @ts-check
const { expect } = require('@playwright/test');

const DEMO_PIN = '123456';

/** @param {import('@playwright/test').Page} page */
async function enterPin(page, pin) {
  for (const digit of pin) {
    await page.locator(`#pgLock button.key[onclick="PIN.in('${digit}')"]`).click();
  }
  await page.waitForFunction(() => document.getElementById('app')?.style.display === 'flex', { timeout: 15000 });
}

/** @param {import('@playwright/test').Page} page */
async function dismissOverlays(page) {
  await page.evaluate(() => {
    document.getElementById('splashScreen')?.remove();
    if (typeof Modal !== 'undefined') Modal.close();
    const overlay = document.getElementById('overlay');
    if (overlay) overlay.classList.remove('on');
    document.querySelectorAll('.modal-overlay.on, .overlay.on').forEach(el => el.classList.remove('on'));
  });
  await page.locator('#overlay.on, .modal-overlay.on').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
}

/** @param {import('@playwright/test').Page} page */
async function seedDemoAndUnlock(page) {
  await page.evaluate(() => {
    loadDemoProfile('business');
    S.user.onboardingComplete = true;
    if (S.modules) S.modules.family = true;
    S.pin = '123456';
    Store.save();
    const ob = document.getElementById('pgOnboard');
    if (ob) ob.style.display = 'none';
    R.unlock();
  });
}

/** @param {import('@playwright/test').Page} page */
async function openVaultFromHome(page) {
  const openVault = page.getByRole('button', { name: /Open My Vault/i });
  if (await openVault.isVisible().catch(() => false)) {
    await openVault.click();
    await expect(page.locator('#pgLock')).toBeVisible({ timeout: 10000 });
  }
}

/** @param {import('@playwright/test').Page} page */
async function unlockDemoVault(page) {
  await page.addInitScript(() => {
    localStorage.setItem('vo_active_profile', 'demo');
    localStorage.setItem('vo_used_demo', '1');
    localStorage.removeItem('vo_demo_guide_pending');
    // Suppress delayed WhatsNew modal during e2e
    localStorage.setItem('vos_wn_ver', '9.9.9');
  });
  await page.goto('/?demo=1');
  await page.waitForLoadState('load');
  await page.waitForFunction(() => typeof window.loadDemoProfile === 'function', { timeout: 15000 });
  await page.evaluate(() => localStorage.removeItem('vo_demo_guide_pending'));
  await dismissOverlays(page);

  if (await page.locator('#pgOnboard').isVisible().catch(() => false)) {
    await seedDemoAndUnlock(page);
  } else if (await page.locator('#pgHome').isVisible().catch(() => false)) {
    const guided = page.getByRole('button', { name: /Take the guided demo|Open demo vault/i });
    if (await guided.isVisible().catch(() => false)) {
      await guided.click();
      await page.waitForLoadState('load');
    }
    if (await page.locator('#pgOnboard').isVisible().catch(() => false)) {
      await seedDemoAndUnlock(page);
    } else {
      await openVaultFromHome(page);
    }
  }

  if (await page.locator('#pgLock').isVisible().catch(() => false)) {
    await enterPin(page, DEMO_PIN);
  }

  const startExploring = page.getByRole('button', { name: /Start exploring/i });
  if (await startExploring.isVisible().catch(() => false)) {
    await startExploring.click();
  }

  await page.waitForFunction(
    () => document.getElementById('app')?.style.display === 'flex',
    { timeout: 15000 },
  );
  await page.waitForFunction(
    () => document.getElementById('dashGreet')?.textContent?.trim().length > 0,
    { timeout: 15000 },
  );
  await dismissOverlays(page);
}

module.exports = { DEMO_PIN, enterPin, dismissOverlays, unlockDemoVault };
