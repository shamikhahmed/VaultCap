// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { dismissOverlays, fastGalleryUnlock, polishGalleryFrame, prepareGalleryShot, refreshPageAfterTheme } = require('./demo-unlock');

const SHOT_ROOT = path.join(__dirname, '..', 'assets', 'screenshots');
const THEMES = ['dark', 'light'];
const VIEWPORTS = ['mobile', 'desktop'];
const VIEWPORT_SIZES = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1280, height: 900 },
};
const SCROLL_MIN = 80;

const APP_PAGES = {
  hubs: {
    title: 'Hubs & dashboard',
    items: [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'finance-home', label: 'Finance hub' },
      { id: 'vault-home', label: 'Identity hub' },
      { id: 'assets-home', label: 'Assets hub' },
    ],
  },
  finance: {
    title: 'Finance modules',
    items: [
      { id: 'banks', label: 'Banks' },
      { id: 'cards', label: 'Cards' },
      { id: 'cash', label: 'Cash' },
      { id: 'investments', label: 'Investments' },
      { id: 'loans', label: 'Loans' },
      { id: 'expenses', label: 'Expenses' },
      { id: 'bc', label: 'Committee (BC)' },
      { id: 'bonds', label: 'Prize bonds' },
      { id: 'currency', label: 'Currency' },
      { id: 'credit', label: 'Credit score' },
      { id: 'tax', label: 'Tax calculator' },
      { id: 'zakat', label: 'Zakat' },
    ],
  },
  identity: {
    title: 'Identity & family',
    items: [
      { id: 'documents', label: 'Documents' },
      { id: 'digital', label: 'Digital services' },
      { id: 'emails', label: 'Email identities' },
      { id: 'sims', label: 'SIM cards' },
      { id: 'friends', label: 'Contacts' },
      { id: 'family', label: 'Family vault' },
      { id: 'emergency', label: 'Emergency info' },
    ],
  },
  assets: {
    title: 'Assets & property',
    items: [
      { id: 'assets', label: 'Property & assets' },
      { id: 'vehicles', label: 'Vehicles' },
      { id: 'gadgets', label: 'Gadgets' },
      { id: 'gold', label: 'Precious metals' },
    ],
  },
  tools: {
    title: 'Tools & utility',
    items: [
      { id: 'search', label: 'Search' },
      { id: 'import', label: 'Smart import' },
      { id: 'timeline', label: 'Timeline' },
      { id: 'security', label: 'Security center' },
      { id: 'backup', label: 'Backup center' },
      { id: 'recovery', label: 'Recovery' },
      { id: 'recovery-center', label: 'Vault recovery' },
      { id: 'workspace', label: 'Workspaces' },
      { id: 'trash', label: 'Trash' },
      { id: 'sync', label: 'Sync devices' },
      { id: 'reminders', label: 'Reminders' },
      { id: 'alerts', label: 'Alerts' },
      { id: 'help', label: 'Help & guide' },
      { id: 'settings', label: 'Settings (profile)' },
    ],
  },
};

const AUTH_SCREENS = [
  { id: 'welcome', label: 'Welcome screen' },
  { id: 'lock', label: 'Lock screen' },
  { id: 'lock-partial', label: 'Lock screen (PIN entered)' },
];

const ONBOARDING_STEPS = [
  { step: 1, id: 'step-1', label: 'Onboarding — welcome', file: 'step-01-welcome' },
  { step: 2, id: 'step-2', label: 'Onboarding — user type', file: 'step-02-user-type' },
  { step: 3, id: 'step-3', label: 'Onboarding — countries', file: 'step-03-countries' },
  { step: 4, id: 'step-4', label: 'Onboarding — modules', file: 'step-04-modules' },
  { step: 5, id: 'step-5', label: 'Onboarding — create PIN', file: 'step-05-pin' },
  { step: 6, id: 'step-6', label: 'Onboarding — recovery key', file: 'step-06-recovery-key' },
  { step: 7, id: 'step-7', label: 'Onboarding — ready', file: 'step-07-ready' },
];

const SETTINGS_TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'security', label: 'Security' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'modules', label: 'Modules' },
  { id: 'backup', label: 'Backup & export' },
  { id: 'import', label: 'Import' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'about', label: 'About' },
];

const FORM_SHOTS = [
  { id: 'bank-add', label: 'Form — add bank', call: 'Banks.openAdd()' },
  { id: 'bank-edit', label: 'Form — edit bank', call: 'Banks.edit(S.banks[0].id)' },
  { id: 'card-add', label: 'Form — add card', call: 'Cards.openAdd()' },
  { id: 'cash-add', label: 'Form — add cash', call: 'Cash.openAdd()' },
  { id: 'investment-add', label: 'Form — add investment', call: 'Inv.openAdd()' },
  { id: 'loan-borrowed', label: 'Form — loan (I owe)', call: "Loans.openAdd('borrowed')" },
  { id: 'loan-lent', label: 'Form — loan (they owe me)', call: "Loans.openAdd('lent')" },
  { id: 'sim-add', label: 'Form — add SIM', call: 'Sims.openAdd()' },
  { id: 'expense-add', label: 'Form — add expense', call: 'Exp.openAdd()' },
  { id: 'friend-add', label: 'Form — add contact', call: 'Friends.openAdd()' },
  { id: 'digital-add', label: 'Form — add digital account', call: 'Digital.openAdd()' },
  { id: 'email-add', label: 'Form — add email', call: 'Emails.openAdd()' },
  { id: 'asset-add', label: 'Form — add asset', call: 'Assets.openAdd()' },
  { id: 'document-add', label: 'Form — add document', call: 'DocsModule.openAdd()' },
  { id: 'bc-add', label: 'Form — add committee', call: 'BCModule.openAdd()' },
  { id: 'bond-add', label: 'Form — add bond', call: 'BondsModule.openAdd()' },
  { id: 'gadget-add', label: 'Form — add gadget', call: 'Gadgets.openAdd()' },
  { id: 'vehicle-add', label: 'Form — add vehicle', call: 'Vehicles.openAdd()' },
  { id: 'family-add', label: 'Form — add family member', call: 'Family.openAddMember(false)' },
];

const SHEET_SHOTS = [
  { id: 'money-sheet', label: 'Sheet — money modules', call: 'openMoneySheet()', wait: '#moneySheet' },
  { id: 'assets-sheet', label: 'Sheet — assets modules', call: 'openAssetsSheet()', wait: '#assetsSheet' },
  { id: 'identity-sheet', label: 'Sheet — identity modules', call: 'openIdentitySheet()', wait: '#identitySheet' },
  { id: 'more-menu', label: 'Sheet — more menu', call: 'openMore()', wait: '#moreOverlay' },
  { id: 'fab-menu', label: 'Sheet — quick add (FAB)', call: 'FAB.toggle()', wait: '#fabMenu.on' },
  { id: 'command-palette', label: 'Command palette', call: 'CMD.open()', wait: '#cmdPal.on' },
];

const HELP_TOPICS = [
  { id: 'getting-started', label: 'Help — getting started' },
  { id: 'banks-cards', label: 'Help — banks & cards' },
  { id: 'backup', label: 'Help — backup & restore' },
  { id: 'security', label: 'Help — security & PIN' },
  { id: 'faq', label: 'Help — FAQ' },
];

const PAGE_ALIASES = {
  gadgets: 'assets',
  vehicles: 'assets',
  gold: 'assets',
};

/** @param {string} dir */
function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/** @param {import('@playwright/test').Page} page @param {string} filePath */
async function shot(page, filePath) {
  ensureDir(path.dirname(filePath));
  await page.screenshot({ path: filePath, fullPage: false });
}
function ensureItem(section, id, label) {
  let item = section.items.find((i) => i.id === id);
  if (!item) {
    item = { id, label, files: {}, scroll: {} };
    section.items.push(item);
  }
  return item;
}

/** @param {object} item @param {'dark'|'light'} theme @param {'mobile'|'desktop'} viewport @param {string} relPath @param {boolean} [scroll] */
function setShotRef(item, theme, viewport, relPath, scroll = false) {
  const field = scroll ? 'scroll' : 'files';
  const cur = item[field][theme];
  if (!cur || typeof cur === 'string') {
    item[field][theme] = typeof cur === 'string' ? { mobile: cur } : {};
  }
  item[field][theme][viewport] = relPath;
}

/** @param {import('@playwright/test').Page} page @param {'mobile'|'desktop'} viewport */
async function setGalleryViewport(page, viewport) {
  await page.setViewportSize(VIEWPORT_SIZES[viewport]);
  await page.evaluate(() => {
    if (typeof buildNav === 'function') buildNav();
    window.dispatchEvent(new Event('resize'));
  });
  await page.waitForTimeout(300);
  const appVisible = await page.locator('#app').isVisible();
  if (!appVisible) return;
  if (viewport === 'desktop') {
    await expect(page.locator('#sidebar')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('.btabs')).toBeHidden({ timeout: 3000 });
  } else {
    await expect(page.locator('.btabs')).toBeVisible({ timeout: 5000 });
  }
}

/** @param {object} files @param {'dark'|'light'} theme @param {'mobile'|'desktop'} [viewport] */
function pickThemePath(files, theme, viewport = 'mobile') {
  const bucket = files?.[theme];
  if (!bucket) return '';
  if (typeof bucket === 'string') return bucket;
  return bucket[viewport] || '';
}

/** @param {import('@playwright/test').Page} page @param {'dark'|'light'} theme */
async function applyTheme(page, theme) {
  await page.evaluate((t) => {
    if (typeof ThemeEngine !== 'undefined') ThemeEngine.apply(t);
    const extra = (document.body.className.match(/\b(fs-\w+|hc)\b/g) || []).join(' ');
    document.body.className = [t === 'light' ? 'light' : '', extra].filter(Boolean).join(' ');
    if (typeof S !== 'undefined' && S.user) {
      S.user.theme = t;
      if (typeof Store !== 'undefined') Store.save();
    }
    const meta = document.getElementById('themeColorMeta');
    if (meta) meta.content = t === 'light' ? '#ffffff' : '#000000';
  }, theme);
  await page.waitForFunction(
    (t) => document.body.classList.contains('light') === (t === 'light'),
    theme,
    { timeout: 5000 },
  );
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.waitForTimeout(200);
}

/** @param {import('@playwright/test').Page} page @param {'dark'|'light'} theme */
async function verifyThemeBeforeShot(page, theme) {
  const bg = await page.evaluate((t) => {
    const isLight = document.body.classList.contains('light');
    const rgb = getComputedStyle(document.body).backgroundColor;
    return { isLight, rgb, ok: isLight === (t === 'light') };
  }, theme);
  if (!bg.ok) {
    throw new Error(`Theme mismatch before shot: wanted ${theme}, body.light=${bg.isLight}, bg=${bg.rgb}`);
  }
}

/** @param {import('@playwright/test').Page} page */
async function syncDemoBanner(page) {
  await page.evaluate(() => {
    const banner = document.getElementById('demoBanner');
    if (banner && !banner.hidden) {
      document.body.classList.add('demo-banner-active');
      document.documentElement.style.setProperty('--demo-banner-h', `${banner.offsetHeight}px`);
    }
  });
}

/** @param {import('@playwright/test').Page} page */
async function hideDemoBanner(page) {
  await page.evaluate(() => {
    const banner = document.getElementById('demoBanner');
    if (banner) banner.hidden = true;
    document.body.classList.remove('demo-banner-active');
    document.documentElement.style.removeProperty('--demo-banner-h');
  });
}

/** @param {import('@playwright/test').Page} page @param {'page'|'modal'} target */
async function findScrollTarget(page, target) {
  return page.evaluate((kind) => {
    if (kind === 'modal') {
      const el = document.getElementById('mBody');
      if (!el) return null;
      const overflow = el.scrollHeight - el.clientHeight;
      return overflow > 0 ? { kind: 'modal', overflow } : null;
    }
    const candidates = [
      '.page.on .pb',
      '.page.on #dashBody',
      '.page.on',
    ];
    let best = null;
    for (const sel of candidates) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const overflow = el.scrollHeight - el.clientHeight;
      if (!best || overflow > best.overflow) best = { kind: 'page', selector: sel, overflow };
    }
    return best && best.overflow > 0 ? best : null;
  }, target);
}

/** @param {import('@playwright/test').Page} page @param {object} target */
async function scrollTargetToEnd(page, target) {
  await page.evaluate((t) => {
    let el = null;
    if (t.kind === 'modal') el = document.getElementById('mBody');
    else if (t.selector) el = document.querySelector(t.selector);
    if (el) el.scrollTop = el.scrollHeight;
  }, target);
}

/** @param {import('@playwright/test').Page} page @param {string} relPath @param {object} item @param {'dark'|'light'} theme @param {'mobile'|'desktop'} viewport @param {'page'|'modal'} target */
async function maybeScrollShot(page, relPath, item, theme, viewport, target = 'page') {
  const scrollTarget = await findScrollTarget(page, target);
  if (!scrollTarget || scrollTarget.overflow < SCROLL_MIN) return null;

  await scrollTargetToEnd(page, scrollTarget);
  await page.waitForTimeout(250);

  const scrollRel = relPath.replace(/\.png$/, '-scroll.png');
  await shot(page, path.join(SHOT_ROOT, scrollRel));
  setShotRef(item, theme, viewport, scrollRel, true);
  return scrollRel;
}

/** @param {import('@playwright/test').Page} page @param {number} step */
async function showOnboardingStep(page, step) {
  await hideDemoBanner(page);
  await page.evaluate((targetStep) => {
    document.getElementById('splashScreen')?.remove();
    ['app', 'pgLock', 'pgHome', 'pgProfilePicker'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    if (typeof OB !== 'undefined') {
      OB.init();
      for (let s = 1; s < targetStep; s++) OB.next(s);
      if (targetStep === 6) {
        const rk = document.getElementById('ob-recovery-key');
        if (rk) rk.textContent = 'AB12CD-34EF56-78GH90-IJ12KL';
      }
      if (targetStep === 7) OB._renderReadyStats();
    }
  }, step);
}

/** @param {import('@playwright/test').Page} page */
async function closeOverlays(page) {
  await page.evaluate(() => {
    ['moneySheet', 'assetsSheet', 'identitySheet', 'moreOverlay'].forEach((id) => {
      document.getElementById(id)?.remove();
    });
    const moreSheet = document.getElementById('moreSheet');
    if (moreSheet) moreSheet.style.display = 'none';
    if (typeof closeMore === 'function') closeMore();
    if (typeof CMD !== 'undefined') CMD.close();
    if (typeof Modal !== 'undefined') Modal.close();
    if (typeof FAB !== 'undefined') FAB.close();
  });
  await page.locator('#overlay.on, #cmdPal.on').waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
}

/** @param {import('@playwright/test').Page} page */
async function scrollPageTop(page) {
  await page.evaluate(() => {
    document.querySelectorAll('.page.on .pb, .page.on #dashBody, .page.on').forEach((el) => { el.scrollTop = 0; });
    document.getElementById('mBody') && (document.getElementById('mBody').scrollTop = 0);
    document.querySelector('.page.on')?.querySelectorAll('[style*="overflow-x"]').forEach((el) => { el.scrollLeft = 0; });
  });
}

/** @param {import('@playwright/test').Page} page */
async function ensureGalleryUnlocked(page) {
  await page.evaluate(() => {
    const app = document.getElementById('app');
    if (!app || getComputedStyle(app).display === 'none') {
      if (typeof S !== 'undefined') {
        S.unlocked = true;
        S.fails = 0;
        S.lockedUntil = 0;
      }
      window._vosUnlocked = true;
      ['pgLock', 'pgHome', 'pgOnboard', 'pgProfilePicker'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });
      if (app) app.style.display = 'flex';
      const fab = document.getElementById('fab');
      if (fab) fab.style.display = 'flex';
    }
  });
}

/** @param {import('@playwright/test').Page} page @param {string} pageId */
async function waitForAppPage(page, pageId) {
  await ensureGalleryUnlocked(page);
  await page.waitForFunction(
    (pid) => {
      const el = document.getElementById(`pg-${pid}`);
      if (!el || !el.classList.contains('on')) return false;
      const style = getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && el.getBoundingClientRect().height > 0;
    },
    pageId,
    { timeout: 20000 },
  );
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {'dark'|'light'} theme
 * @param {'mobile'|'desktop'} viewport
 * @param {object} section
 * @param {string} id
 * @param {string} label
 * @param {string} relPath
 * @param {boolean} [allowScroll]
 * @param {string} [pageId]
 */
async function captureViewport(page, theme, viewport, section, id, label, relPath, allowScroll = true, pageId = id) {
  const filePath = path.join(SHOT_ROOT, relPath);
  await scrollPageTop(page);
  await prepareGalleryShot(page);
  await refreshPageAfterTheme(page, pageId);
  await verifyThemeBeforeShot(page, theme);
  await page.waitForTimeout(200);
  await shot(page, filePath);
  const item = ensureItem(section, id, label);
  setShotRef(item, theme, viewport, relPath, false);
  if (allowScroll) {
    await prepareGalleryShot(page);
    await maybeScrollShot(page, relPath, item, theme, viewport, 'page');
  }
}

test.describe('VaultCap screen gallery', () => {
  test.skip(() => process.env.CAPTURE_SCREENSHOTS !== '1', 'set CAPTURE_SCREENSHOTS=1 to regenerate');

  test('capture all screens for gallery', async ({ page }) => {
    test.setTimeout(2400000);

    const manifest = { generatedAt: new Date().toISOString(), themes: THEMES, viewports: VIEWPORTS, sections: [] };
    const sectionMap = {};

    const getSection = (id, title) => {
      if (!sectionMap[id]) {
        sectionMap[id] = { id, title, label: title, items: [] };
        manifest.sections.push(sectionMap[id]);
      }
      return sectionMap[id];
    };

    await page.goto('/?demo=1');
    await page.waitForLoadState('load');
    await page.waitForFunction(() => typeof R !== 'undefined', { timeout: 30000 });

    // ── Auth & onboarding per theme + viewport ──
    for (const theme of THEMES) {
      for (const viewport of VIEWPORTS) {
        await setGalleryViewport(page, viewport);
        await dismissOverlays(page);
        await applyTheme(page, theme);
        await hideDemoBanner(page);

        const authSection = getSection('auth', 'Auth & welcome');

        await page.evaluate(() => {
          document.getElementById('splashScreen')?.remove();
          document.getElementById('app').style.display = 'none';
          document.getElementById('pgLock').style.display = 'none';
          document.getElementById('pgOnboard').style.display = 'none';
          document.getElementById('pgHome').style.display = 'flex';
        });
        await captureViewport(page, theme, viewport, authSection, AUTH_SCREENS[0].id, AUTH_SCREENS[0].label, `${theme}/${viewport}/auth/welcome.png`, false);

        await page.evaluate(() => {
          document.getElementById('pgHome').style.display = 'none';
          document.getElementById('pgLock').style.display = 'flex';
          if (typeof PIN !== 'undefined') PIN.reset();
          if (typeof R !== 'undefined' && R.startClock) R.startClock();
        });
        await captureViewport(page, theme, viewport, authSection, AUTH_SCREENS[1].id, AUTH_SCREENS[1].label, `${theme}/${viewport}/auth/lock.png`, false);

        await page.evaluate(() => {
          for (const d of '123') {
            if (typeof PIN !== 'undefined') PIN.in(d);
          }
        });
        await captureViewport(page, theme, viewport, authSection, AUTH_SCREENS[2].id, AUTH_SCREENS[2].label, `${theme}/${viewport}/auth/lock-partial.png`, false);

        const onboardSection = getSection('onboarding', 'Onboarding wizard');
        for (const step of ONBOARDING_STEPS) {
          await showOnboardingStep(page, step.step);
          await page.waitForTimeout(300);
          await captureViewport(page, theme, viewport, onboardSection, step.id, step.label, `${theme}/${viewport}/onboarding/${step.file}.png`, false);
        }
      }
    }

    // ── Unlocked app ──
    await setGalleryViewport(page, 'mobile');
    await fastGalleryUnlock(page);
    await dismissOverlays(page);

    for (const theme of THEMES) {
      for (const viewport of VIEWPORTS) {
        await setGalleryViewport(page, viewport);
        await applyTheme(page, theme);
        await hideDemoBanner(page);

        for (const [sectionId, group] of Object.entries(APP_PAGES)) {
          const section = getSection(sectionId, group.title);
          for (const item of group.items) {
            await closeOverlays(page);
            await dismissOverlays(page);
            await ensureGalleryUnlocked(page);
            await page.evaluate((id) => R.goto(id, true), item.id);
            const pageId = PAGE_ALIASES[item.id] || item.id;
            if (item.id === 'settings') {
              await expect(page.locator('#pg-settings.on')).toBeVisible({ timeout: 15000 });
              await page.evaluate(() => { if (typeof SettingsNav !== 'undefined') SettingsNav.show('profile'); });
            } else {
              await waitForAppPage(page, pageId);
            }
            if (item.id === 'import') await page.waitForTimeout(800);
            await page.waitForTimeout(350);
            await prepareGalleryShot(page);
            await captureViewport(page, theme, viewport, section, item.id, item.label, `${theme}/${viewport}/${sectionId}/${item.id}.png`);
          }
        }

        const settingsSection = getSection('settings', 'Settings tabs');
        await dismissOverlays(page);
        await page.evaluate(() => R.goto('settings', true));
        await expect(page.locator('#pg-settings.on')).toBeVisible({ timeout: 10000 });
        for (const tab of SETTINGS_TABS) {
          await page.evaluate((id) => {
            if (typeof SettingsNav !== 'undefined') SettingsNav.show(id);
          }, tab.id);
          await page.waitForTimeout(350);
          const allowScroll = tab.id !== 'appearance';
          await captureViewport(
            page, theme, viewport, settingsSection, tab.id, tab.label,
            `${theme}/${viewport}/settings/${tab.id}.png`,
            allowScroll,
            'settings',
          );
        }

        const helpSection = getSection('help-topics', 'Help topics');
        await page.evaluate(() => R.goto('help', true));
        await expect(page.locator('#pg-help.on')).toBeVisible({ timeout: 10000 });
        await page.evaluate(() => {
          if (typeof HelpCenter !== 'undefined') HelpCenter.render();
        });
        for (const topic of HELP_TOPICS) {
          await page.evaluate((id) => {
            if (typeof HelpCenter === 'undefined') return;
            HelpCenter._section = id;
            HelpCenter._renderContent();
          }, topic.id);
          await page.waitForTimeout(350);
          await captureViewport(page, theme, viewport, helpSection, topic.id, topic.label, `${theme}/${viewport}/help/${topic.id}.png`);
        }

        const formsSection = getSection('forms', 'Forms & modals');
        for (const form of FORM_SHOTS) {
          await closeOverlays(page);
          await dismissOverlays(page);
          await polishGalleryFrame(page);
          await page.evaluate((call) => { eval(call); }, form.call);
          await expect(page.locator('#mBody')).toBeVisible({ timeout: 10000 });
          await expect(page.locator('#overlay')).toHaveClass(/on/);
          await page.waitForTimeout(300);
          const rel = `${theme}/${viewport}/forms/${form.id}.png`;
          await polishGalleryFrame(page);
          await verifyThemeBeforeShot(page, theme);
          await shot(page, path.join(SHOT_ROOT, rel));
          const formItem = ensureItem(formsSection, form.id, form.label);
          setShotRef(formItem, theme, viewport, rel, false);
          await maybeScrollShot(page, rel, formItem, theme, viewport, 'modal');
          await page.evaluate(() => Modal.close());
          await page.waitForTimeout(150);
        }

        const sheetsSection = getSection('sheets', 'Sheets & palettes');
        await closeOverlays(page);
        await dismissOverlays(page);
        await page.evaluate(() => R.goto('dashboard', true));
        await expect(page.locator('#pg-dashboard.on')).toBeVisible({ timeout: 10000 });
        for (const sheet of SHEET_SHOTS) {
          await closeOverlays(page);
          await dismissOverlays(page);
          await polishGalleryFrame(page);
          await page.evaluate((call) => { eval(call); }, sheet.call);
          await expect(page.locator(sheet.wait)).toBeVisible({ timeout: 10000 });
          await page.waitForTimeout(300);
          const rel = `${theme}/${viewport}/sheets/${sheet.id}.png`;
          await polishGalleryFrame(page);
          await verifyThemeBeforeShot(page, theme);
          await shot(page, path.join(SHOT_ROOT, rel));
          setShotRef(ensureItem(sheetsSection, sheet.id, sheet.label), theme, viewport, rel, false);
          await closeOverlays(page);
        }
      }
    }

    fs.writeFileSync(path.join(SHOT_ROOT, 'manifest.json'), JSON.stringify(manifest, null, 2));

    const darkDash = manifest.sections.find((s) => s.id === 'hubs')?.items.find((i) => i.id === 'dashboard');
    const darkBanks = manifest.sections.find((s) => s.id === 'finance')?.items.find((i) => i.id === 'banks');
    const dashDark = pickThemePath(darkDash?.files, 'dark', 'mobile');
    const banksDark = pickThemePath(darkBanks?.files, 'dark', 'mobile');
    const dashLight = pickThemePath(darkDash?.files, 'light', 'mobile');
    const banksLight = pickThemePath(darkBanks?.files, 'light', 'mobile');
    if (dashDark) {
      fs.copyFileSync(path.join(SHOT_ROOT, dashDark), path.join(SHOT_ROOT, 'vaultcap-1-dark.png'));
      fs.copyFileSync(path.join(SHOT_ROOT, dashDark), path.join(SHOT_ROOT, 'vaultcap.png'));
    }
    if (banksDark) fs.copyFileSync(path.join(SHOT_ROOT, banksDark), path.join(SHOT_ROOT, 'vaultcap-2-dark.png'));
    if (dashLight) fs.copyFileSync(path.join(SHOT_ROOT, dashLight), path.join(SHOT_ROOT, 'vaultcap-1-light.png'));
    if (banksLight) fs.copyFileSync(path.join(SHOT_ROOT, banksLight), path.join(SHOT_ROOT, 'vaultcap-2-light.png'));
  });
});
