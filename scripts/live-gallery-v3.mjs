#!/usr/bin/env node
/**
 * Minimal live-URL gallery v3 capture (§9). No local server.
 */
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync, readFileSync, existsSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const GALLERY_DIR = join(ROOT, 'docs', 'screenshots', 'gallery');
const MANIFEST = join(GALLERY_DIR, 'gallery-manifest.json');
const BASE = process.env.GALLERY_BASE_URL || 'https://shamikhahmed.github.io/VaultCap/?demo=1';
const ACCENT = '#c9a227';
const CAPTURED_AT = '2026-10-14T09:41:00Z';
const CLOCK_MS = Date.parse('2026-10-14T09:41:00.000Z');

const VIEWPORTS = {
  iphone: { width: 390, height: 844, deviceScaleFactor: 3 },
  ipad: { width: 1180, height: 820, deviceScaleFactor: 2 },
  mac: { width: 1440, height: 900, deviceScaleFactor: 2 },
};

const SCREENS = [
  { nav: 'dashboard', group: 'Finance', screen: 'Dashboard', caption: 'Net worth command center (demo).' },
  { nav: 'banks', group: 'Finance', screen: 'Banks', caption: 'Bank accounts on-device.' },
  { nav: 'settings', group: 'System', screen: 'Settings', caption: 'Profile, security, appearance.' },
];

function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function shotPath(theme, device, group, screen) {
  return `${theme}/${device}/${slug(group)}--${slug(screen)}--demo.webp`;
}

function pngToWebp(pngPath, webpPath) {
  mkdirSync(dirname(webpPath), { recursive: true });
  if (spawnSync('cwebp', ['-q', '82', pngPath, '-o', webpPath]).status === 0 && existsSync(webpPath)) {
    try {
      unlinkSync(pngPath);
    } catch {
      /* keep */
    }
    return;
  }
  spawnSync('cp', [pngPath, webpPath]);
}

async function fastUnlock(page) {
  await page.waitForFunction(
    () => typeof loadDemoProfile === 'function' && typeof R !== 'undefined',
    null,
    { timeout: 45000 },
  );
  await page.evaluate(() => {
    loadDemoProfile('business');
    S.user.onboardingComplete = true;
    if (S.modules) S.modules.family = true;
    S.pin = '123456';
    if (typeof Store !== 'undefined') Store.save();
    localStorage.removeItem('vo_demo_guide_pending');
    localStorage.setItem('vo_demo_guide_seen', '1');
    if (window.VER) localStorage.setItem('vos_wn_ver', window.VER);
    document.getElementById('splashScreen')?.remove();
    ['pgHome', 'pgLock', 'pgOnboard', 'pgProfilePicker'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    R.unlock();
    const b = document.getElementById('demoBanner');
    if (b) b.hidden = true;
    document.body.classList.remove('demo-banner-active');
    if (typeof Modal !== 'undefined') Modal.close();
    document.getElementById('overlay')?.classList.remove('on');
  });
  await page.waitForFunction(
    () => document.getElementById('app')?.style.display === 'flex',
    null,
    { timeout: 25000 },
  );
  await page.waitForFunction(
    () => (document.getElementById('dashGreet')?.textContent?.trim().length ?? 0) > 0,
    null,
    { timeout: 25000 },
  );
  await page.waitForTimeout(600);
}

async function setTheme(page, theme) {
  await page.emulateMedia({ colorScheme: theme });
  await page.evaluate((t) => {
    if (typeof ThemeEngine !== 'undefined') ThemeEngine.apply(t);
    document.body.classList.toggle('light', t === 'light');
    if (typeof S !== 'undefined' && S.user) S.user.theme = t;
  }, theme);
  await page.waitForTimeout(180);
}

async function goNav(page, navId) {
  await page.evaluate((id) => {
    if (typeof R !== 'undefined') R.goto(id, true);
    if (id === 'settings' && typeof SettingsNav !== 'undefined') SettingsNav.show('account');
    else if (id === 'dashboard' && typeof Dash !== 'undefined') Dash.render();
  }, navId);
  await page.waitForTimeout(700);
}

async function main() {
  const shots = [];
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [device, vp] of Object.entries(VIEWPORTS)) {
      for (const theme of ['light', 'dark']) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          deviceScaleFactor: vp.deviceScaleFactor,
          colorScheme: theme,
          isMobile: device !== 'mac',
          hasTouch: device !== 'mac',
        });
        await context.addInitScript((ms) => {
          localStorage.setItem('vo_active_profile', 'demo');
          localStorage.setItem('vo_used_demo', '1');
          localStorage.removeItem('vo_demo_guide_pending');
          const RealDate = Date;
          class FakeDate extends RealDate {
            constructor(...args) {
              if (args.length === 0) super(ms);
              else super(...args);
            }
            static now() {
              return ms;
            }
          }
          FakeDate.prototype = RealDate.prototype;
          window.Date = FakeDate;
        }, CLOCK_MS);
        const page = await context.newPage();
        await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await fastUnlock(page);
        await setTheme(page, theme);

        for (const scr of SCREENS) {
          await goNav(page, scr.nav);
          await setTheme(page, theme);
          const rel = shotPath(theme, device, scr.group, scr.screen);
          const webpPath = join(GALLERY_DIR, rel);
          const pngPath = webpPath.replace(/\.webp$/, '.png');
          mkdirSync(dirname(pngPath), { recursive: true });
          await page.screenshot({ path: pngPath, animations: 'disabled' });
          pngToWebp(pngPath, webpPath);
          shots.push({
            id: `${slug(scr.group)}--${slug(scr.screen)}--demo`,
            group: scr.group,
            screen: scr.screen,
            state: 'demo',
            theme,
            device,
            file: rel,
            route: `#/${scr.nav}`,
            caption: scr.caption,
            w: vp.width * vp.deviceScaleFactor,
            h: vp.height * vp.deviceScaleFactor,
          });
          process.stdout.write(`✓ ${theme}/${device}/${scr.nav}\n`);
        }
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }

  const version = JSON.parse(readFileSync(join(ROOT, 'VERSION.json'), 'utf8')).version;
  mkdirSync(GALLERY_DIR, { recursive: true });
  writeFileSync(
    MANIFEST,
    JSON.stringify(
      { app: 'VaultCap', version, capturedAt: CAPTURED_AT, accent: ACCENT, schema: 2, shots },
      null,
      2,
    ),
  );
  console.log(`\nVaultCap gallery v3: ${shots.length} shots → ${MANIFEST}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
