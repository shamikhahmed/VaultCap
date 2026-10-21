import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { dismissOverlays, prepareGalleryShot } = require('../tests/demo-unlock.js');

const BASE = 'http://127.0.0.1:8765';
const outDir = path.join('build/qa/v6/videos/per-app');
fs.mkdirSync(outDir, { recursive: true });
for (const f of fs.readdirSync(outDir)) {
  if (f.endsWith('.webm') && !f.startsWith('VaultCap-')) fs.unlinkSync(path.join(outDir, f));
}

const browser = await chromium.launch();
const context = await browser.newContext({
  baseURL: BASE,
  viewport: { width: 390, height: 844 },
  recordVideo: { dir: outDir, size: { width: 390, height: 844 } },
  colorScheme: 'dark',
});
const page = await context.newPage();
await page.addInitScript(() => {
  localStorage.setItem('vo_active_profile', 'demo');
  localStorage.setItem('vo_used_demo', '1');
  localStorage.removeItem('vo_demo_guide_pending');
  localStorage.setItem('vo_demo_guide_seen', '1');
  localStorage.setItem('vos_wn_ver', '5.3.1');
});
await page.goto('/?demo=1');
await page.waitForFunction(() => typeof loadDemoProfile === 'function' && typeof R !== 'undefined', { timeout: 30000 });
await dismissOverlays(page);
await page.evaluate(() => {
  loadDemoProfile('business');
  S.user.onboardingComplete = true;
  if (S.modules) S.modules.family = true;
  S.pin = '123456';
  Store.save();
  localStorage.setItem('vo_demo_guide_seen', '1');
  if (window.VER) localStorage.setItem('vos_wn_ver', window.VER);
  document.getElementById('splashScreen')?.remove();
  ['pgHome', 'pgLock', 'pgOnboard', 'pgProfilePicker'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  R.unlock();
});
await page.waitForFunction(() => document.getElementById('app')?.style.display === 'flex', { timeout: 20000 });
await page.waitForTimeout(900);
await prepareGalleryShot(page);
await page.evaluate(() => R.goto('banks'));
await page.waitForTimeout(1400);
await page.evaluate(() => R.goto('documents'));
await page.waitForTimeout(1200);
await page.evaluate(() => R.goto('dashboard'));
await page.waitForTimeout(1100);
await context.close();
await browser.close();
const vids = fs.readdirSync(outDir).filter((f) => f.endsWith('.webm'));
const latest = vids.map((f) => ({ f, m: fs.statSync(path.join(outDir, f)).mtimeMs })).sort((a, b) => b.m - a.m)[0];
const dest = path.join(outDir, 'VaultCap-sample-unlock-demo.webm');
fs.renameSync(path.join(outDir, latest.f), dest);
const st = fs.statSync(dest);
console.log('VIDEO', dest, st.size);
if (st.size < 50_000) process.exit(2);
