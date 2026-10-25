#!/usr/bin/env node
/**
 * iPhone/WebKit behaviour check (Cap fleet mobile bugs), adapted from ScentCap scripts/ios-behaviour-check.mjs.
 * Usage: npm run serve  →  node scripts/ios-behaviour-check.mjs [baseUrl]   (default http://127.0.0.1:8765/)
 * Checks: tab bar + header controls tappable, no sideways overflow, the document (not an inner box) scrolls,
 * navigation opens at top without reloading, sheets keep the page position, inputs ≥16px, SW doesn't self-activate.
 */
import { webkit, chromium, devices } from '@playwright/test';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromiumLaunchOptions } = require('./chromium-launch-options.cjs');

const BASE = process.argv[2] || 'http://127.0.0.1:8765/';
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok, detail });
const step = async (name, fn) => {
  try {
    await fn();
  } catch (e) {
    check(name, false, String(e.message || e).split('\n')[0]);
  }
};

const iphone = devices['iPhone 15 Pro'];
const { defaultBrowserType, ...iphoneCtx } = iphone;
let browser;
try {
  browser = await webkit.launch();
} catch (e) {
  console.warn(`WebKit unavailable (${e.message?.split('\n')[0]}); using Chromium + iPhone 15 Pro metrics`);
  browser = await chromium.launch(chromiumLaunchOptions());
}
const ctx = await browser.newContext({ ...iphoneCtx, serviceWorkers: 'block' });
const page = await ctx.newPage();
page.setDefaultTimeout(8000);
await page.addInitScript(() => {
  localStorage.setItem('vo_active_profile', 'demo');
  localStorage.setItem('vo_used_demo', '1');
  localStorage.setItem('vo_demo_guide_seen', '1');
  localStorage.removeItem('vo_demo_guide_pending');
});

await page.goto(BASE + '?demo=1');
await page.waitForFunction(() => typeof loadDemoProfile === 'function' && typeof R !== 'undefined', { timeout: 45000 });
await page.evaluate(() => {
  loadDemoProfile('business');
  S.user.onboardingComplete = true;
  S.pin = '123456';
  Store.save();
  localStorage.setItem('vos_wn_ver', window.VER);
  document.getElementById('splashScreen')?.remove();
  R.showLock();
});
// Real taps on the keypad (the 5.x demo overlay used to sit above it)
let unlocked = false;
try {
  for (const d of '123456') await page.locator(`#pgLock button.key[data-act="PIN.in('${d}')"]`).tap();
  unlocked = await page
    .waitForFunction(() => document.getElementById('app')?.style.display === 'flex', { timeout: 15000 })
    .then(() => true, () => false);
} catch (e) {
  check('PIN keypad tap reaches keys', false, String(e.message).split('\n').find((l) => /intercepts/.test(l)) || 'tap failed');
}
check('PIN keypad unlocks by tapping', unlocked);
if (!unlocked) await page.evaluate(() => { document.getElementById('pgHome').style.setProperty('display', 'none', 'important'); R.unlock(); });
await page.evaluate(() => { if (typeof Modal !== 'undefined') Modal.close(); });
await page.waitForTimeout(1500);
await page.evaluate(() => { window.__noReload = 1; });

// 1. Tabs and dashboard header controls are the topmost element at their centre
const covered = await page.evaluate(() =>
  [...document.querySelectorAll('#btabs .ti, #pg-dashboard .ph button:not([hidden]):not([role="menuitem"])')]
    .filter((t) => t.offsetParent !== null)
    .filter((t) => {
      const r = t.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !t.contains(hit);
    })
    .map((t) => t.getAttribute('aria-label') || t.textContent.trim()),
);
check('tab bar + header controls tappable', covered.length === 0, covered.join(','));

const small = await page.evaluate(() =>
  [...document.querySelectorAll('#btabs .ti, #pg-dashboard .ph button:not([role="menuitem"])')]
    .filter((t) => t.offsetParent !== null)
    .filter((t) => { const r = t.getBoundingClientRect(); return r.width < 44 || r.height < 44; }).length,
);
check('hit areas ≥44pt (tabs, header)', small === 0, `${small} small`);

// 2. The document scrolls; no sideways overflow on primary screens
for (const pg of ['dashboard', 'banks', 'cards', 'investments', 'documents', 'settings']) {
  await page.evaluate((id) => R.goto(id), pg);
  await page.waitForTimeout(500);
  const m = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    iw: innerWidth,
    docScroll: document.scrollingElement.scrollHeight > innerHeight,
    innerScroller: getComputedStyle(document.querySelector('.page.on > .pb') || document.body).overflowY,
  }));
  check(`no sideways overflow · ${pg}`, m.sw <= m.iw + 1, `${m.sw} > ${m.iw}`);
  if (pg !== 'settings') check(`document scrolls (no inner scroller) · ${pg}`, m.docScroll && m.innerScroller === 'visible', JSON.stringify(m));
}

// 2b. The document really scrolls (and instantly — no smooth-scroll animation)
check('programmatic scroll lands instantly', await page.evaluate(() => { window.scrollTo(0, 300); const y = window.scrollY; window.scrollTo(0, 0); return y >= 250; }));

// 3. Navigation by tapping: shell stays, new screen opens at top, no reload
await step('navigation by tapping', async () => {
await page.evaluate(() => R.goto('dashboard'));
await page.waitForTimeout(400);
await page.evaluate(() => window.scrollTo(0, 600));
await page.waitForTimeout(200);
await page.locator('#btabs .ti[aria-label="Money"]').tap();
await page.locator('#moneySheet .vc-sheet-tile').first().waitFor();
await page.locator('#moneySheet .vc-sheet-tile').first().tap();
await page.waitForTimeout(700);
const nav = await page.evaluate(() => ({ y: scrollY, page: S.currentPage, tabs: !!document.querySelector('#btabs .ti'), marker: window.__noReload }));
check('tab → sheet → module keeps shell (no reload)', nav.tabs && nav.marker === 1, JSON.stringify(nav));
check('new screen opens at top', nav.y === 0, `scrollY ${nav.y} on ${nav.page}`);

});

let smallInputs = 0;
// 4. Sheet keeps the page position (Banks → Add → Cancel)
await step('sheet flow', async () => {
await page.evaluate(() => R.goto('banks'));
await page.waitForTimeout(600);
await page.evaluate(() => window.scrollTo(0, 400));
await page.waitForTimeout(200);
const before = await page.evaluate(() => scrollY);
// Tap the first bank row that is on screen (opens its detail sheet)
const rowIdx = await page.evaluate(() =>
  [...document.querySelectorAll('#bItems .entry-body')].findIndex((el) => {
    const r = el.getBoundingClientRect();
    return r.top > 80 && r.bottom < innerHeight - 120;
  }),
);
await page.locator('#bItems .entry-body').nth(Math.max(0, rowIdx)).tap();
await page.locator('#overlay.on #modal').waitFor();
await page.waitForTimeout(300);
const locked = await page.evaluate(() => document.body.style.position);
smallInputs = await page.evaluate(() =>
  [...document.querySelectorAll('#modal input, #modal select, #modal textarea')]
    .filter((el) => el.offsetParent !== null && parseFloat(getComputedStyle(el).fontSize) < 16).length,
);
await page.locator('#mLead button:visible, #mClose:visible').first().tap();
await page.waitForTimeout(400);
const after = await page.evaluate(() => scrollY);
check('page locked behind sheet', locked === 'fixed', `body position "${locked}"`);
check('sheet keeps scroll position', Math.abs(after - before) < 4, `before ${before} after ${after}`);

});

// 5. Add sheet: inputs ≥16px
await step('add sheet', async () => {
await page.evaluate(() => Banks.openAdd());
await page.locator('#overlay.on #modal').waitFor();
await page.waitForTimeout(300);
const smallAdd = await page.evaluate(() =>
  [...document.querySelectorAll('#modal input, #modal select, #modal textarea')]
    .filter((el) => el.offsetParent !== null && parseFloat(getComputedStyle(el).fontSize) < 16).length,
);
await page.evaluate(() => Modal.close());
check('inputs ≥16px (no zoom-on-focus)', smallInputs + smallAdd === 0, `${smallInputs + smallAdd} small`);
check('no reload during session', (await page.evaluate(() => window.__noReload)) === 1);

});

// 6. Service worker never self-activates over a running app
const sw = fs.readFileSync(new URL('../sw-v51.js', import.meta.url), 'utf8');
check('SW: no skipWaiting/clients.claim', !/skipWaiting\(\)|clients\.claim\(\)/.test(sw));

await browser.close();
let fail = 0;
for (const r of results) {
  if (!r.ok) fail++;
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.ok || !r.detail ? '' : `  (${r.detail})`}`);
}
process.exit(fail ? 1 : 0);
