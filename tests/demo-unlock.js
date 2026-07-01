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
    ['moneySheet', 'assetsSheet', 'identitySheet', 'moreOverlay'].forEach((id) => {
      document.getElementById(id)?.remove();
    });
    const moreSheet = document.getElementById('moreSheet');
    if (moreSheet) moreSheet.style.display = 'none';
    if (typeof closeMore === 'function') closeMore();
    if (typeof CMD !== 'undefined') CMD.close();
    if (typeof FAB !== 'undefined') FAB.close();
  });
  await page.locator('#overlay.on, .modal-overlay.on').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
}

/** Non-destructive frame polish — safe before modal/sheet screenshots */
/** @param {import('@playwright/test').Page} page */
async function polishGalleryFrame(page) {
  await page.evaluate(() => {
    const ver = typeof VER !== 'undefined' ? VER : '4.9.2';
    localStorage.removeItem('vo_demo_guide_pending');
    localStorage.setItem('vos_wn_ver', ver);
    if (document.activeElement && document.activeElement !== document.body) {
      document.activeElement.blur();
    }
    document.querySelectorAll('span[style*="word-break"], .desc, .set-card div').forEach((el) => {
      if (el.children.length) return;
      const t = el.textContent || '';
      if (/127\.0\.0\.1|localhost/i.test(t)) {
        el.textContent = t.replace(/https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\/?\?demo=1/gi, 'https://vaultcap.app/?demo=1');
      }
    });
  });
  await page.waitForTimeout(120);
}

/** Dismiss tour modals, changelog, sheets — call immediately before each gallery screenshot */
/** @param {import('@playwright/test').Page} page @param {{ preserveOverlays?: boolean }} [options] */
async function prepareGalleryShot(page, options = {}) {
  if (options.preserveOverlays) {
    await polishGalleryFrame(page);
    return;
  }
  await page.evaluate(() => {
    const ver = typeof VER !== 'undefined' ? VER : '4.9.2';
    localStorage.removeItem('vo_demo_guide_pending');
    localStorage.setItem('vos_wn_ver', ver);
    if (typeof Modal !== 'undefined') Modal.close();
    const overlay = document.getElementById('overlay');
    if (overlay) overlay.classList.remove('on');
    document.querySelectorAll('.modal-overlay.on, .overlay.on').forEach((el) => el.classList.remove('on'));
    ['moneySheet', 'assetsSheet', 'identitySheet', 'moreOverlay'].forEach((id) => {
      document.getElementById(id)?.remove();
    });
    const moreSheet = document.getElementById('moreSheet');
    if (moreSheet) moreSheet.style.display = 'none';
    if (typeof closeMore === 'function') closeMore();
    if (typeof CMD !== 'undefined') CMD.close();
    if (typeof FAB !== 'undefined') FAB.close();
    if (document.activeElement && document.activeElement !== document.body) {
      document.activeElement.blur();
    }
    document.querySelectorAll('span[style*="word-break"], .desc, .set-card div').forEach((el) => {
      if (el.children.length) return;
      const t = el.textContent || '';
      if (/127\.0\.0\.1|localhost/i.test(t)) {
        el.textContent = t.replace(/https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\/?\?demo=1/gi, 'https://vaultcap.app/?demo=1');
      }
    });
  });
  await page.locator('#overlay.on, .modal-overlay.on').waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(120);
}

/** @param {import('@playwright/test').Page} page @param {string} [pageId] */
async function refreshPageAfterTheme(page, pageId) {
  await page.evaluate((id) => {
    if (typeof buildNav === 'function') buildNav();
    const renders = {
      dashboard: () => typeof Dash !== 'undefined' && Dash.render(),
      family: () => typeof Family !== 'undefined' && Family.render(),
      'finance-home': () => typeof renderFinanceHome === 'function' && renderFinanceHome(),
      settings: () => typeof SettingsNav !== 'undefined' && SettingsNav.show(SettingsNav.current || 'profile'),
    };
    if (id && renders[id]) renders[id]();
  }, pageId || '');
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

/** Fast path for screenshot gallery — skips PIN UI after auth/onboarding staging */
/** @param {import('@playwright/test').Page} page */
async function fastGalleryUnlock(page) {
  await page.addInitScript(() => {
    localStorage.setItem('vo_active_profile', 'demo');
    localStorage.setItem('vo_used_demo', '1');
    localStorage.removeItem('vo_demo_guide_pending');
    localStorage.setItem('vos_wn_ver', '4.9.2');
  });
  await page.goto('/?demo=1');
  await page.waitForLoadState('load');
  await page.waitForFunction(
    () => typeof loadDemoProfile === 'function' && typeof R !== 'undefined',
    { timeout: 30000 },
  );
  await dismissOverlays(page);
  await page.evaluate(() => {
    loadDemoProfile('business');
    S.user.onboardingComplete = true;
    if (S.modules) S.modules.family = true;
    S.pin = '123456';
    Store.save();
    localStorage.removeItem('vo_demo_guide_pending');
    localStorage.setItem('vo_demo_guide_seen', '1');
    localStorage.setItem('vos_wn_ver', typeof VER !== 'undefined' ? VER : '4.9.2');
    document.getElementById('splashScreen')?.remove();
    ['pgHome', 'pgLock', 'pgOnboard', 'pgProfilePicker'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    R.unlock();
  });
  await page.waitForFunction(
    () => document.getElementById('app')?.style.display === 'flex',
    { timeout: 20000 },
  );
  await page.waitForFunction(
    () => document.getElementById('dashGreet')?.textContent?.trim().length > 0,
    { timeout: 20000 },
  );
  await dismissOverlays(page);
  await page.waitForTimeout(1600);
  await prepareGalleryShot(page);
}

/** @param {import('@playwright/test').Page} page */
async function unlockDemoVault(page) {
  await page.addInitScript(() => {
    localStorage.setItem('vo_active_profile', 'demo');
    localStorage.setItem('vo_used_demo', '1');
    localStorage.removeItem('vo_demo_guide_pending');
    localStorage.setItem('vos_wn_ver', '4.9.2');
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

module.exports = { DEMO_PIN, enterPin, dismissOverlays, polishGalleryFrame, prepareGalleryShot, refreshPageAfterTheme, unlockDemoVault, fastGalleryUnlock };
