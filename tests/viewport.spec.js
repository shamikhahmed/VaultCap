// @ts-check
const { test, expect } = require('@playwright/test');
const { unlockDemoVault } = require('./demo-unlock');

/** Shell chrome breakpoint: tabs &lt;700, sidebar ≥700 (iPad mini 744 → sidebar) */
const SHELL_BP = 700;

/** @param {import('@playwright/test').Page} page */
async function resize(page, width, height) {
  await page.setViewportSize({ width, height });
  await page.waitForTimeout(120);
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Expect} ex
 */
async function assertVaultCapMobile(page, ex) {
  await ex(page.locator('#sidebar')).toBeHidden();
  await ex(page.locator('.btabs')).toBeVisible();
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Expect} ex
 */
async function assertVaultCapDesktop(page, ex) {
  await ex(page.locator('#sidebar')).toBeVisible();
  await ex(page.locator('.btabs')).toBeHidden();
}

test.describe('VaultCap viewport contract', () => {
  test.beforeEach(async ({ page }) => {
    await unlockDemoVault(page);
  });

  test('320px — no horizontal overflow on dashboard', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.evaluate(() => R.goto('dashboard'));
    const overflow = await page.evaluate(() => {
      const el = document.getElementById('dashBody') || document.body;
      return el.scrollWidth > el.clientWidth + 2;
    });
    expect(overflow).toBe(false);
  });

  test('390px — bottom tabs visible', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await assertVaultCapMobile(page, expect);
  });

  test('iPad mini 744 — sidebar visible, bottom tabs hidden', async ({ page }) => {
    await page.setViewportSize({ width: 744, height: 1133 });
    await page.evaluate(() => R.goto('dashboard'));
    await expect(page.locator('#app')).toBeVisible();
    await assertVaultCapDesktop(page, expect);
  });

  test(`${SHELL_BP}px — sidebar visible, bottom tabs hidden`, async ({ page }) => {
    await page.setViewportSize({ width: SHELL_BP, height: 1024 });
    await page.evaluate(() => R.goto('dashboard'));
    await expect(page.locator('#app')).toBeVisible();
    await assertVaultCapDesktop(page, expect);
  });

  test('375px — bottom tabs, sidebar hidden', async ({ page }) => {
    await resize(page, 375, 812);
    await assertVaultCapMobile(page, expect);
  });

  test('1280px — sidebar visible, bottom tabs hidden', async ({ page }) => {
    await resize(page, 1280, 800);
    await assertVaultCapDesktop(page, expect);
  });

  test('375px — no content clipped behind bottom tabs on primary pages', async ({ page }) => {
    await resize(page, 375, 812);
    for (const pageId of ['dashboard', 'banks', 'cards', 'cash']) {
      await page.evaluate((id) => R.goto(id), pageId);
      await page.waitForTimeout(300);
      const ok = await page.evaluate(() => {
        const screen = document.querySelector('.page.on');
        const nav = document.querySelector('.btabs');
        const body = screen?.querySelector(':scope > .pb') || screen;
        if (!screen || !nav || !body) return false;
        const scroller = screen.scrollHeight > screen.clientHeight ? screen : document.documentElement;
        scroller.scrollTop = scroller.scrollHeight;
        // .pb padding-bottom is the anti-clip contract (layout.css — var(--tabh)+12).
        const pad = parseFloat(getComputedStyle(body).paddingBottom) || 0;
        const navH = nav.getBoundingClientRect().height;
        if (pad + 1 < navH) return false;
        let el = body;
        while (el.lastElementChild) {
          const kids = [...el.children].filter((c) => {
            const s = getComputedStyle(c);
            return s.display !== 'none' && s.visibility !== 'hidden';
          });
          if (!kids.length) break;
          el = kids[kids.length - 1];
        }
        const contentBottom = body.getBoundingClientRect().bottom - pad;
        return contentBottom <= nav.getBoundingClientRect().top + 2;
      });
      expect(ok, `page ${pageId}: content clear of bottom tabs`).toBe(true);
    }
  });
});
