// @ts-check
const { expect } = require('@playwright/test');

const DEMO_PIN = '123456';

/** @param {import('@playwright/test').Page} page */
async function enterPin(page, pin) {
  for (const digit of pin) {
    await page.locator('button.key', { hasText: new RegExp(`^${digit}$`) }).click();
  }
}

/** @param {import('@playwright/test').Page} page */
async function dismissOverlays(page) {
  await page.evaluate(() => {
    document.getElementById('splashScreen')?.remove();
    if (typeof Modal !== 'undefined') Modal.close();
    document.querySelectorAll('.modal-overlay.on').forEach(el => el.classList.remove('on'));
  });
  await page.locator('.modal-overlay.on').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
}

/** @param {import('@playwright/test').Page} page */
async function unlockDemoVault(page) {
  await page.addInitScript(() => {
    localStorage.setItem('vo_active_profile', 'demo');
    localStorage.setItem('vo_used_demo', '1');
    localStorage.removeItem('vo_demo_guide_pending');
  });
  await page.goto('/?demo=1');
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => typeof window.loadDemoProfile === 'function', { timeout: 15000 });

  async function seedDemoAndUnlock() {
    await page.evaluate(() => {
      loadDemoProfile('business');
      S.user.onboardingComplete = true;
      if (S.modules) S.modules.family = true;
      S.pin = '123456';
      Store.save();
      const ob = document.getElementById('pgOnboard');
      const home = document.getElementById('pgHome');
      if (ob) ob.style.display = 'none';
      if (home) home.style.display = 'none';
      R.unlock();
    });
  }

  if (await page.locator('#pgOnboard').isVisible().catch(() => false)) {
    await seedDemoAndUnlock();
  } else if (await page.locator('#pgHome').isVisible().catch(() => false)) {
    const guided = page.getByRole('button', { name: /Take the guided demo|Open demo vault/i });
    if (await guided.isVisible().catch(() => false)) {
      await guided.click();
      await page.waitForLoadState('networkidle');
    }
    if (await page.locator('#pgOnboard').isVisible().catch(() => false)) {
      await seedDemoAndUnlock();
    }
  }

  if (await page.getByRole('button', { name: /Start exploring/i }).isVisible().catch(() => false)) {
    await page.getByRole('button', { name: /Start exploring/i }).click();
  }

  if (await page.locator('#pgLock').isVisible().catch(() => false)) {
    await enterPin(page, DEMO_PIN);
  }

  await expect(page.locator('#app')).toBeVisible({ timeout: 15000 });
  await dismissOverlays(page);
}

module.exports = { DEMO_PIN, enterPin, dismissOverlays, unlockDemoVault };
