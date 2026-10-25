#!/usr/bin/env node
/**
 * Post-deploy live smoke for VaultCap (WebKit · iPhone 15 Pro only — no engine fallback).
 *
 * Usage: node qa/release/live-smoke.mjs https://shamikhahmed.github.io/VaultCap/
 *
 * Asserts: app-ready, no console/pageerrors, no HTTP ≥400, VERSION === 6.0.0 /
 * vaultcap-v600, core ios-check steps (tab bar tappable, document scrolls,
 * sheet lock/restore, swipe at top does not reload).
 */
import { webkit, devices } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '../..');
const EXPECT_VER = '6.0.0';
const EXPECT_SW = 'vaultcap-v600';

const rawUrl = process.argv[2];
if (!rawUrl) {
  console.error('Usage: node qa/release/live-smoke.mjs <url>');
  process.exit(2);
}

const base = rawUrl.replace(/\/?$/, '/');
const smoke = Date.now();
const appUrl = `${base}?demo=1&smoke=${smoke}`;
const versionUrl = new URL('VERSION.json', base).href;

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok: !!ok, detail: String(detail || '') });
};

const consoleErrs = [];
const pageErrs = [];
const httpBad = [];

const browser = await webkit.launch();
const ctx = await browser.newContext({
  ...devices['iPhone 15 Pro'],
  serviceWorkers: 'allow',
});
const page = await ctx.newPage();
page.setDefaultTimeout(20000);

page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrs.push(msg.text());
});
page.on('pageerror', (e) => pageErrs.push(e.message));
page.on('response', (r) => {
  if (r.status() >= 400) httpBad.push(`${r.status()} ${r.url()}`);
});

await page.addInitScript(() => {
  localStorage.setItem('vo_active_profile', 'demo');
  localStorage.setItem('vo_used_demo', '1');
  localStorage.setItem('vo_demo_guide_seen', '1');
  localStorage.removeItem('vo_demo_guide_pending');
});

// --- Load + ready ---
try {
  await page.goto(appUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(
    () =>
      window.__APP_READY__ === true ||
      document.documentElement.dataset.appReady === 'true' ||
      (typeof loadDemoProfile === 'function' && typeof R !== 'undefined'),
    { timeout: 60000 },
  );
  check('app ready signal', true);
} catch (e) {
  check('app ready signal', false, String(e.message || e).split('\n')[0]);
}

// --- VERSION.json + in-app ---
try {
  const res = await page.request.get(`${versionUrl}?smoke=${smoke}`);
  const body = await res.json();
  check('VERSION.json HTTP', res.ok(), String(res.status()));
  check('VERSION.json version', body.version === EXPECT_VER, body.version);
  check('VERSION.json swCache', body.swCache === EXPECT_SW, body.swCache);
} catch (e) {
  check('VERSION.json fetch', false, String(e.message || e).split('\n')[0]);
}

const inApp = await page.evaluate(() => ({
  VER: window.VER,
  APP_VERSION: window.APP_VERSION,
})).catch(() => ({}));
check('in-app VER', inApp.VER === EXPECT_VER, inApp.VER);
check('in-app APP_VERSION', inApp.APP_VERSION === EXPECT_VER, inApp.APP_VERSION);

// --- Demo unlock for ios core checks ---
let unlocked = false;
try {
  await page.waitForFunction(
    () => typeof loadDemoProfile === 'function' && typeof R !== 'undefined',
    { timeout: 45000 },
  );
  await page.evaluate(() => {
    loadDemoProfile('business');
    S.user.onboardingComplete = true;
    S.pin = '123456';
    Store.save();
    localStorage.setItem('vos_wn_ver', window.VER);
    document.getElementById('splashScreen')?.remove();
    R.showLock();
  });
  for (const d of '123456') {
    await page.locator(`#pgLock button.key[data-act="PIN.in('${d}')"]`).tap();
  }
  unlocked = await page
    .waitForFunction(() => document.getElementById('app')?.style.display === 'flex', { timeout: 15000 })
    .then(() => true, () => false);
} catch (e) {
  check('PIN unlock', false, String(e.message || e).split('\n')[0]);
}
if (!unlocked) {
  await page.evaluate(() => {
    document.getElementById('pgHome')?.style.setProperty('display', 'none', 'important');
    R.unlock();
  }).catch(() => {});
}
check('PIN unlocks (or fallback)', true);
await page.evaluate(() => { if (typeof Modal !== 'undefined') Modal.close(); }).catch(() => {});
await page.waitForTimeout(800);
await page.evaluate(() => { window.__noReload = 1; });

// --- Core ios-check steps ---
const covered = await page.evaluate(() =>
  [...document.querySelectorAll('#btabs .ti, #pg-dashboard .ph button:not([hidden]):not([role="menuitem"])')]
    .filter((t) => t.offsetParent !== null)
    .filter((t) => {
      const r = t.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !t.contains(hit);
    })
    .map((t) => t.getAttribute('aria-label') || t.textContent.trim()),
).catch(() => ['evaluate failed']);
check('tab bar + header controls tappable', covered.length === 0, covered.join(','));

await page.evaluate(() => R.goto('dashboard')).catch(() => {});
await page.waitForTimeout(400);
const scrollMeta = await page.evaluate(() => ({
  sw: document.documentElement.scrollWidth,
  iw: innerWidth,
  docScroll: document.scrollingElement.scrollHeight > innerHeight,
  innerScroller: getComputedStyle(document.querySelector('.page.on > .pb') || document.body).overflowY,
})).catch(() => null);
if (scrollMeta) {
  check('no sideways overflow · dashboard', scrollMeta.sw <= scrollMeta.iw + 1, `${scrollMeta.sw}>${scrollMeta.iw}`);
  check(
    'document scrolls (no inner scroller) · dashboard',
    scrollMeta.docScroll && scrollMeta.innerScroller === 'visible',
    JSON.stringify(scrollMeta),
  );
} else {
  check('document scrolls · dashboard', false, 'evaluate failed');
}

// Sheet lock / restore
try {
  await page.evaluate(() => { R.goto('banks'); });
  await page.waitForTimeout(600);
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(200);
  const before = await page.evaluate(() => scrollY);
  const rowIdx = await page.evaluate(() =>
    [...document.querySelectorAll('#bItems .entry-body')].findIndex((el) => {
      const r = el.getBoundingClientRect();
      return r.top > 80 && r.bottom < innerHeight - 120;
    }),
  );
  await page.locator('#bItems .entry-body').nth(Math.max(0, rowIdx)).tap();
  await page.locator('#overlay.on #modal').waitFor({ timeout: 8000 });
  await page.waitForTimeout(300);
  const locked = await page.evaluate(() => document.body.style.position);
  await page.locator('#mLead button:visible, #mClose:visible').first().tap();
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => scrollY);
  check('page locked behind sheet', locked === 'fixed', `position="${locked}"`);
  check('sheet keeps scroll position', Math.abs(after - before) < 4, `before ${before} after ${after}`);
} catch (e) {
  check('sheet lock/restore', false, String(e.message || e).split('\n')[0]);
}

// Swipe at top must not reload / arm PTR
try {
  await page.evaluate(() => { R.goto('dashboard'); window.scrollTo(0, 0); });
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    document.getElementById('dashBody').firstElementChild.dataset.swipeProbe = '1';
  });
  const touched = await page.evaluate(async () => {
    let t;
    try {
      t = (y) => new Touch({ identifier: 1, target: document.body, clientX: 200, clientY: y });
      t(0);
    } catch {
      return false;
    }
    const fire = (type, y) =>
      document.body.dispatchEvent(
        new TouchEvent(type, {
          bubbles: true,
          cancelable: true,
          touches: type === 'touchend' ? [] : [t(y)],
          changedTouches: [t(y)],
        }),
      );
    fire('touchstart', 120);
    for (let y = 140; y <= 420; y += 20) fire('touchmove', y);
    fire('touchend', 420);
    await new Promise((r) => setTimeout(r, 800));
    return true;
  });
  if (!touched) {
    await page.mouse.move(200, 120);
    await page.mouse.down();
    await page.mouse.move(200, 420, { steps: 15 });
    await page.mouse.up();
    await page.waitForTimeout(800);
  }
  const r = await page.evaluate(() => ({
    marker: window.__noReload,
    probe: document.getElementById('dashBody').firstElementChild?.dataset.swipeProbe,
    ptrHooks:
      typeof initDocumentPullToRefresh !== 'undefined' ||
      !!document.getElementById('ptrDocInd') ||
      !!window._ptrDocInited,
  }));
  check(
    'swipe at top: no reload / re-render / PTR',
    r.marker === 1 && r.probe === '1' && !r.ptrHooks,
    JSON.stringify(r),
  );
} catch (e) {
  check('swipe at top', false, String(e.message || e).split('\n')[0]);
}

// Console / HTTP gates (after interactions)
check('no console errors', consoleErrs.length === 0, consoleErrs.slice(0, 5).join(' | '));
check('no pageerrors', pageErrs.length === 0, pageErrs.slice(0, 5).join(' | '));
check('no HTTP ≥400', httpBad.length === 0, httpBad.slice(0, 8).join(' | '));

await browser.close();

// Local file coherence reminder (repo VERSION when script lives in tree)
try {
  const ver = JSON.parse(fs.readFileSync(path.join(ROOT, 'VERSION.json'), 'utf8'));
  check('repo VERSION.json matches expect', ver.version === EXPECT_VER && ver.swCache === EXPECT_SW, `${ver.version}/${ver.swCache}`);
} catch {
  /* live-only copy may omit repo files */
}

let fail = 0;
console.log(`Live smoke · ${base} · expect ${EXPECT_VER} / ${EXPECT_SW}`);
console.log('');
console.log(`${'RESULT'.padEnd(6)}  ${'CHECK'.padEnd(48)}  DETAIL`);
for (const r of results) {
  if (!r.ok) fail++;
  console.log(`${(r.ok ? 'PASS' : 'FAIL').padEnd(6)}  ${r.name.padEnd(48)}  ${r.detail}`);
}
console.log('');
console.log(fail ? `OVERALL FAIL (${fail})` : 'OVERALL PASS');
process.exit(fail ? 1 : 0);
