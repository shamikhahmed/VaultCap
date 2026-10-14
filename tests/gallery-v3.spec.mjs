/**
 * VaultCap gallery v3 — schema-v2 primary screens (Perfection Loop §9).
 * Run: npm run gallery:v3
 */
import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync, existsSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import {
  GALLERY_VIEWPORTS,
  GALLERY_FREEZE_CSS,
  galleryClockInitScript,
  isGalleryCapture,
  shotEntry,
  shotRelativePath,
} from './helpers/gallery-capture-helpers.mjs';

const require = createRequire(import.meta.url);
const { dismissOverlays, hideDemoBanner } = require('./demo-unlock.js');

const GALLERY_DIR = join(process.cwd(), 'docs', 'screenshots', 'gallery');
const MANIFEST = join(GALLERY_DIR, 'gallery-manifest.json');
const ACCENT = '#c9a227';

const SCREENS = [
  { nav: 'dashboard', group: 'Finance', screen: 'Dashboard', state: 'demo', caption: 'Net worth command center with demo data.' },
  { nav: 'banks', group: 'Finance', screen: 'Banks', state: 'demo', caption: 'Every bank account, encrypted on this device.' },
  { nav: 'family', group: 'Identity', screen: 'Family', state: 'demo', caption: 'Family vault profiles and shared access.' },
  { nav: 'documents', group: 'Identity', screen: 'Documents', state: 'demo', caption: 'Passports, IDs, and secure papers.' },
  { nav: 'assets', group: 'Assets', screen: 'Assets', state: 'demo', caption: 'Property, vehicles, and valuables.' },
  { nav: 'settings', group: 'System', screen: 'Settings', state: 'demo', caption: 'Profile, security, appearance, modules.' },
];

const DEVICES = ['iphone', 'ipad', 'mac'];
const THEMES = ['light', 'dark'];
const PAGE_ALIASES = { gold: 'assets', gadgets: 'assets', vehicles: 'assets' };

test.describe('VaultCap gallery v3', () => {
  test.skip(!isGalleryCapture(), 'Run via CAPTURE_GALLERY=1 (npm run gallery:v3)');

  test.beforeEach(async ({ context }) => {
    await context.addInitScript(galleryClockInitScript());
    await context.addInitScript(() => {
      localStorage.setItem('vo_active_profile', 'demo');
      localStorage.setItem('vo_used_demo', '1');
      localStorage.removeItem('vo_demo_guide_pending');
      localStorage.setItem('vo_demo_guide_seen', '1');
      localStorage.removeItem('vc_lockout_v1_demo');
    });
  });

  test('primary screens × light/dark × iphone/ipad/mac', async ({ page }) => {
    test.setTimeout(600_000);

    await page.goto('/?demo=1');
    await page.waitForLoadState('load');
    await page.waitForFunction(
      () => typeof loadDemoProfile === 'function' && typeof R !== 'undefined' && typeof VaultDB !== 'undefined',
      { timeout: 45000 },
    );
    await page.evaluate(() => {
      if (window.VER) localStorage.setItem('vos_wn_ver', window.VER);
      loadDemoProfile('business');
      S.user.onboardingComplete = true;
      if (S.modules) S.modules.family = true;
      S.pin = '123456';
      Store.save();
      document.getElementById('splashScreen')?.remove();
      R.unlock();
    });
    await page.waitForFunction(() => document.getElementById('app')?.style.display === 'flex', { timeout: 20000 });
    await dismissOverlays(page);
    await hideDemoBanner(page);

    const shots = [];

    for (const device of DEVICES) {
      const vp = GALLERY_VIEWPORTS[device];
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.evaluate(() => {
        if (typeof buildNav === 'function') buildNav();
        window.dispatchEvent(new Event('resize'));
      });
      await page.waitForTimeout(200);

      for (const theme of THEMES) {
        await setAppTheme(page, theme);
        await prepareShot(page, theme);

        for (const screen of SCREENS) {
          await goScreen(page, screen.nav);
          await prepareShot(page, theme);

          const rel = shotRelativePath({
            theme,
            device,
            group: screen.group,
            screen: screen.screen,
            state: screen.state,
            ext: 'webp',
          });
          const webpPath = join(GALLERY_DIR, rel);
          const pngPath = webpPath.replace(/\.webp$/, '.png');
          mkdirSync(dirname(pngPath), { recursive: true });
          await page.screenshot({ path: pngPath, fullPage: false, animations: 'disabled' });
          pngToWebp(pngPath, webpPath);

          shots.push(
            shotEntry({
              id: `${screen.group}--${screen.screen}--${screen.state}`
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, ''),
              group: screen.group,
              screen: screen.screen,
              state: screen.state,
              theme,
              device,
              file: rel,
              route: `#/${screen.nav}`,
              caption: screen.caption,
              w: vp.width * vp.deviceScaleFactor,
              h: vp.height * vp.deviceScaleFactor,
            }),
          );
        }
      }
    }

    writeManifest(shots);
    expect(shots.length).toBe(SCREENS.length * DEVICES.length * THEMES.length);
  });
});

async function setAppTheme(page, theme) {
  await page.evaluate((t) => {
    if (typeof ThemeEngine !== 'undefined') ThemeEngine.apply(t);
    const extra = (document.body.className.match(/\b(fs-\w+|hc)\b/g) || []).join(' ');
    document.body.className = [t === 'light' ? 'light' : '', extra].filter(Boolean).join(' ');
    if (typeof S !== 'undefined' && S.user) {
      S.user.theme = t;
      if (typeof Store !== 'undefined' && typeof VaultDB !== 'undefined') Store.save();
    }
  }, theme);
  await page.waitForFunction((t) => document.body.classList.contains('light') === (t === 'light'), theme, {
    timeout: 8000,
  });
}

async function prepareShot(page, theme) {
  await page.emulateMedia({ colorScheme: theme });
  await page.addStyleTag({ content: GALLERY_FREEZE_CSS }).catch(() => {});
  await setAppTheme(page, theme);
  await page.evaluate(() => document.fonts?.ready).catch(() => {});
  await page.waitForTimeout(60);
}

async function ensureGalleryUnlocked(page) {
  await page.evaluate(() => {
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
    const app = document.getElementById('app');
    if (app) app.style.display = 'flex';
  });
}

async function goScreen(page, navId) {
  await dismissOverlays(page);
  await hideDemoBanner(page);
  await ensureGalleryUnlocked(page);
  await page.evaluate((id) => R.goto(id, true), navId);
  const pageId = PAGE_ALIASES[navId] || navId;
  if (navId === 'settings') {
    await expect(page.locator('#pg-settings.on')).toBeVisible({ timeout: 12000 });
    await page.evaluate(() => {
      if (typeof SettingsNav !== 'undefined') SettingsNav.show('account');
    });
  } else {
    await expect(page.locator(`#pg-${pageId}.on`)).toBeVisible({ timeout: 12000 });
  }
  await page.waitForTimeout(100);
}

function pngToWebp(pngPath, webpPath) {
  mkdirSync(dirname(webpPath), { recursive: true });
  const cwebp = spawnSync('cwebp', ['-q', '82', pngPath, '-o', webpPath], { encoding: 'utf8' });
  if (cwebp.status === 0 && existsSync(webpPath)) {
    try {
      unlinkSync(pngPath);
    } catch {
      /* keep png */
    }
    return;
  }
  spawnSync('cp', [pngPath, webpPath]);
}

function writeManifest(shots) {
  mkdirSync(GALLERY_DIR, { recursive: true });
  const version = JSON.parse(readFileSync(join(process.cwd(), 'VERSION.json'), 'utf8')).version;
  writeFileSync(
    MANIFEST,
    JSON.stringify(
      {
        app: 'VaultCap',
        version,
        capturedAt: '2026-10-14T09:41:00Z',
        accent: ACCENT,
        schema: 2,
        shots: shots.sort((a, b) => String(a.file).localeCompare(String(b.file))),
      },
      null,
      2,
    ),
  );
}
