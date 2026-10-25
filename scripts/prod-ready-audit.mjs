#!/usr/bin/env node
/**
 * Prod-ready audit harness (Chromium + iPhone 15 Pro metrics — WebKit may fail in sandbox).
 * Usage: node scripts/prod-ready-audit.mjs [baseUrl]
 * Writes qa/prod-ready/audit-findings.json + shots/*.png
 */
import { chromium, devices } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromiumLaunchOptions } = require('./chromium-launch-options.cjs');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'qa', 'prod-ready');
const SHOTS = path.join(OUT, 'shots');
const BASE = process.argv[2] || 'http://127.0.0.1:8840/';

fs.mkdirSync(SHOTS, { recursive: true });

const PAGES = [
  'dashboard', 'family', 'finance-home', 'banks', 'cards', 'cash', 'loans', 'expenses', 'bc',
  'assets-home', 'investments', 'bonds', 'assets', 'vehicles', 'gadgets', 'gold',
  'vault-home', 'friends', 'sims', 'documents', 'emails', 'digital',
  'currency', 'zakat', 'credit', 'tax',
  'alerts', 'reminders', 'timeline', 'import', 'search', 'trash', 'emergency',
  'recovery', 'recovery-center', 'workspace', 'sync', 'security', 'backup', 'help', 'settings',
];

const VIEWPORTS = [
  { name: 'iphone-se', w: 375, h: 812 },
  { name: 'iphone-14', w: 390, h: 844 },
  { name: 'iphone-15', w: 430, h: 932 },
  { name: 'ipad-mini', w: 744, h: 1133 },
  { name: 'ipad-land', w: 1180, h: 820 },
  { name: 'desktop', w: 1440, h: 900 },
];

const findings = [];
const note = (sev, area, screen, msg, extra = {}) =>
  findings.push({ sev, area, screen, msg, ...extra });

let shotCount = 0;
async function shot(page, name) {
  if (shotCount >= 40) return;
  const file = path.join(SHOTS, `${String(++shotCount).padStart(2, '0')}-${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  return file;
}

async function unlockDemo(page) {
  await page.addInitScript(() => {
    localStorage.setItem('vo_active_profile', 'demo');
    localStorage.setItem('vo_used_demo', '1');
    localStorage.setItem('vo_demo_guide_seen', '1');
    localStorage.removeItem('vo_demo_guide_pending');
  });
  await page.goto(BASE + '?demo=1', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof loadDemoProfile === 'function' && typeof R !== 'undefined', { timeout: 60000 });
  await page.evaluate(() => {
    loadDemoProfile('personal');
    S.user.onboardingComplete = true;
    S.pin = '123456';
    Store.save();
    localStorage.setItem('vos_wn_ver', window.VER);
    document.getElementById('splashScreen')?.remove();
    R.showLock();
  });
  let unlocked = false;
  try {
    for (const d of '123456') {
      await page.locator(`#pgLock button.key[data-act="PIN.in('${d}')"]`).tap({ timeout: 5000 });
    }
    unlocked = await page
      .waitForFunction(() => document.getElementById('app')?.style.display === 'flex', { timeout: 15000 })
      .then(() => true, () => false);
  } catch (_) { /* fall through */ }
  if (!unlocked) {
    await page.evaluate(() => {
      document.getElementById('pgHome')?.style.setProperty('display', 'none', 'important');
      R.unlock();
    });
  }
  await page.evaluate(() => { if (typeof Modal !== 'undefined') Modal.close(); });
  await page.waitForTimeout(800);
}

async function layoutIssues(page, screen) {
  return page.evaluate((scr) => {
    const issues = [];
    const docW = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth > docW + 2) {
      issues.push({ type: 'h-scroll', detail: `scrollWidth ${document.documentElement.scrollWidth} > ${docW}` });
    }
    const bar = document.querySelector('#btabs');
    const barH = bar?.getBoundingClientRect().height || 0;
    const safe = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)')) || 0;
    // content padding check — main pages bottom padding vs tab bar
    const on = document.querySelector('.page.on .pb') || document.querySelector('.page.on');
    if (on && bar && bar.offsetParent) {
      const pad = parseFloat(getComputedStyle(on).paddingBottom) || 0;
      if (pad < barH + 24) {
        issues.push({ type: 'tabbar-pad', detail: `pb pad ${pad} < bar ${barH}+24` });
      }
    }
    // truncated / overlapping heuristic: visible buttons with zero size
    [...document.querySelectorAll('.page.on button, .page.on a, #btabs .ti')].forEach((el) => {
      if (el.offsetParent === null) return;
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && (r.width < 20 || r.height < 20) && el.matches('button,a,.ti')) {
        // ignore tiny decorative
      }
      if (r.bottom > window.innerHeight - 4 && r.top < window.innerHeight - barH - 8 && el.closest('#btabs') === null) {
        // near bottom under tab bar?
        const midY = r.top + r.height / 2;
        if (bar && midY > bar.getBoundingClientRect().top && !bar.contains(el) && !el.closest('.modal.open,.modal.on')) {
          const hit = document.elementFromPoint(Math.min(r.left + r.width / 2, docW - 2), Math.min(midY, window.innerHeight - 2));
          if (hit && bar.contains(hit) && !el.contains(hit)) {
            issues.push({ type: 'under-tabbar', detail: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40) });
          }
        }
      }
    });
    // inputs < 16px
    [...document.querySelectorAll('.page.on input, .page.on textarea, .page.on select')].forEach((el) => {
      if (el.offsetParent === null) return;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < 16) issues.push({ type: 'zoom-risk', detail: `${el.id || el.name || el.className} fs=${fs}` });
    });
    return { screen: scr, issues };
  }, screen);
}

async function consoleWatch(page) {
  const errs = [];
  page.on('pageerror', (e) => errs.push({ type: 'pageerror', msg: e.message }));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errs.push({ type: 'console', msg: msg.text() });
  });
  // A bare "Failed to load resource" says nothing; record the URL that failed
  page.on('response', (r) => {
    if (r.status() >= 400) errs.push({ type: 'http', msg: `${r.status()} ${r.url().replace(/^https?:\/\/[^/]+/, '')}` });
  });
  return errs;
}

async function runAxe(page, screen, theme) {
  try {
    // preload:false — axe stylesheet clone re-resolves @import against / → /base.css 404 artifact
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .disableRules(['color-contrast']) // contrast checked separately / flaky on glass
      .options({ preload: false })
      .analyze();
    const bad = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    return bad.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.length,
      help: v.help,
      screen,
      theme,
    }));
  } catch (e) {
    return [{ id: 'axe-error', impact: 'serious', help: String(e.message), screen, theme, nodes: 0 }];
  }
}

async function deadActs(page) {
  return page.evaluate(() => {
    const dead = [];
    [...document.querySelectorAll('[data-act]')].forEach((el) => {
      if (el.offsetParent === null && !el.closest('#fabMenu,.dash-more-menu,#modal')) return;
      const act = el.getAttribute('data-act') || '';
      if (!act.trim()) dead.push({ reason: 'empty', text: (el.textContent || '').trim().slice(0, 40) });
    });
    return dead;
  });
}

async function tapVisibleControls(page, limit = 40) {
  const results = [];
  const handles = await page.evaluate(() =>
    [...document.querySelectorAll('.page.on button[data-act], #btabs .ti, .page.on .ph button')]
      .filter((el) => el.offsetParent !== null)
      .slice(0, 80)
      .map((el, i) => {
        el.setAttribute('data-audit-i', String(i));
        return { i, act: el.getAttribute('data-act') || '', label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 50) };
      }),
  );
  let n = 0;
  for (const h of handles) {
    if (n >= limit) break;
    if (/R\.lock|Reset|purge|delete|ExIm\.|export|import/i.test(h.act)) continue;
    if (/PIN\.|showLock|VaultProfiles\.switch/i.test(h.act)) continue;
    try {
      const before = await page.evaluate(() => location.href + '|' + (S?.currentPage || '') + '|' + !!document.querySelector('.modal.open,.modal.on,#themeOverlay[style*="flex"]'));
      await page.locator(`[data-audit-i="${h.i}"]`).first().click({ timeout: 2000, force: false });
      await page.waitForTimeout(200);
      const after = await page.evaluate(() => location.href + '|' + (S?.currentPage || '') + '|' + !!document.querySelector('.modal.open,.modal.on,#themeOverlay[style*="flex"]'));
      // close any sheet opened
      await page.keyboard.press('Escape');
      await page.evaluate(() => { if (typeof Modal !== 'undefined') Modal.close(); ThemeEngine?.closePicker?.(); });
      results.push({ label: h.label, act: h.act, changed: before !== after });
      n++;
    } catch (e) {
      results.push({ label: h.label, act: h.act, error: String(e.message).split('\n')[0] });
      n++;
    }
  }
  return results;
}

async function networkHosts(page) {
  const hosts = new Set();
  page.on('request', (req) => {
    try {
      const u = new URL(req.url());
      if (u.origin !== new URL(BASE).origin) hosts.add(u.host);
    } catch (_) { /* ignore */ }
  });
  return hosts;
}

async function main() {
  const iphone = devices['iPhone 15 Pro'];
  const { defaultBrowserType, ...iphoneCtx } = iphone;
  const browser = await chromium.launch(chromiumLaunchOptions());
  const ctx = await browser.newContext({
    ...iphoneCtx,
    serviceWorkers: 'allow',
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(12000);
  const errs = await consoleWatch(page);
  const hosts = await networkHosts(page);

  // --- Demo unlock ---
  await unlockDemo(page);
  await shot(page, 'demo-dashboard-light-390');

  // Version coherence in UI
  const ver = await page.evaluate(() => ({
    VER: window.VER,
    APP_VERSION: window.APP_VERSION,
  }));
  note('info', 'A', 'boot', `in-app VER=${ver.VER}`);

  // Layout + axe light on key pages
  const axeAll = [];
  const layoutAll = [];
  for (const pg of PAGES) {
    await page.evaluate((p) => { R.goto(p, true); Modal.close?.(); }, pg);
    await page.waitForTimeout(250);
    const lay = await layoutIssues(page, pg);
    layoutAll.push(lay);
    lay.issues.forEach((iss) => note('med', 'C/F', pg, `${iss.type}: ${iss.detail}`));
    if (['dashboard', 'banks', 'cards', 'investments', 'documents', 'settings', 'family', 'search'].includes(pg)) {
      axeAll.push(...(await runAxe(page, pg, 'light')));
    }
  }
  await shot(page, 'demo-settings-light');

  // Dark theme
  await page.evaluate(() => {
    R.goto('dashboard', true);
    if (typeof ThemeEngine !== 'undefined') {
      ThemeEngine.apply?.('dark') || ThemeEngine.set?.('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
      localStorage.setItem('vo_theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  });
  await page.waitForTimeout(300);
  await shot(page, 'demo-dashboard-dark-390');
  for (const pg of ['dashboard', 'banks', 'settings', 'documents']) {
    await page.evaluate((p) => R.goto(p, true), pg);
    await page.waitForTimeout(200);
    axeAll.push(...(await runAxe(page, pg, 'dark')));
  }

  // Multi-viewport representative shots
  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.evaluate(() => R.goto('dashboard', true));
    await page.waitForTimeout(200);
    await shot(page, `dash-${vp.name}`);
    if (vp.w >= 700) {
      await page.evaluate(() => R.goto('banks', true));
      await page.waitForTimeout(200);
      await shot(page, `banks-${vp.name}`);
    }
  }
  // restore phone
  await page.setViewportSize({ width: 390, height: 844 });

  // Interaction pass on dashboard + banks
  await page.evaluate(() => R.goto('dashboard', true));
  const tapsDash = await tapVisibleControls(page, 25);
  await page.evaluate(() => R.goto('banks', true));
  await page.waitForTimeout(300);
  // open add sheet
  try {
    const addBank = page.locator('#pg-banks.on .ph [data-act="Banks.openAdd()"]').first();
    await addBank.scrollIntoViewIfNeeded();
    await addBank.waitFor({ state: 'visible', timeout: 12000 });
    await addBank.click({ timeout: 12000 });
    await page.waitForTimeout(400);
    await shot(page, 'sheet-add-bank');
    const modalOk = await page.evaluate(() => {
      const m = document.getElementById('modal');
      return {
        open: m?.classList.contains('open') || m?.classList.contains('on') || getComputedStyle(m).display !== 'none',
        ariaModal: m?.getAttribute('aria-modal'),
        labelled: !!m?.getAttribute('aria-labelledby'),
      };
    });
    if (!modalOk.ariaModal) note('high', 'G', 'banks-add', 'modal missing aria-modal');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    const closed = await page.evaluate(() => {
      const m = document.getElementById('modal');
      return !(m?.classList.contains('open') || m?.classList.contains('on'));
    });
    if (!closed) {
      await page.evaluate(() => Modal.close());
      note('med', 'D', 'banks-add', 'Esc did not close modal (closed via Modal.close)');
    }
  } catch (e) {
    note('high', 'D', 'banks-add', `Add bank failed: ${e.message}`);
  }

  const dead = await deadActs(page);
  dead.forEach((d) => note('med', 'D', 'any', `empty data-act: ${d.text}`));

  // Empty profile pass
  const page2 = await ctx.newPage();
  const errs2 = await consoleWatch(page2);
  await page2.goto(BASE + '?fresh=1', { waitUntil: 'domcontentloaded' });
  await page2.waitForFunction(() => typeof R !== 'undefined', { timeout: 60000 }).catch(() => {});
  await page2.evaluate(() => {
    try {
      Object.keys(localStorage).forEach((k) => localStorage.removeItem(k));
    } catch (_) {}
    document.getElementById('splashScreen')?.remove();
  });
  await page2.reload({ waitUntil: 'domcontentloaded' });
  await page2.waitForTimeout(2000);
  await shot(page2, 'fresh-boot');
  const freshState = await page2.evaluate(() => ({
    home: document.getElementById('pgHome')?.style.display,
    lock: document.getElementById('pgLock')?.style.display,
    onboard: document.getElementById('pgOnboard')?.style.display,
    app: document.getElementById('app')?.style.display,
  }));
  note('info', 'E', 'fresh', `surfaces ${JSON.stringify(freshState)}`);

  // Corrupted storage
  await page2.evaluate(() => {
    localStorage.setItem('vos_data', '{not-json');
    localStorage.setItem('vo_active_profile', '!!!');
  });
  let crashed = false;
  try {
    await page2.reload({ waitUntil: 'domcontentloaded' });
    await page2.waitForTimeout(1500);
    crashed = await page2.evaluate(() => !document.body);
  } catch (e) {
    crashed = true;
    note('high', 'J', 'corrupt-ls', e.message);
  }
  if (crashed) note('crit', 'J', 'corrupt-ls', 'page crashed on corrupt localStorage');
  else note('info', 'J', 'corrupt-ls', 'survived corrupt localStorage');
  await shot(page2, 'corrupt-ls');

  // Offline shell (after warm cache)
  await page.goto(BASE, { waitUntil: 'networkidle' }).catch(() => page.goto(BASE));
  await page.waitForTimeout(2000);
  await ctx.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' }).catch((e) => note('high', 'H', 'offline', e.message));
  await page.waitForTimeout(2000);
  const offlineOk = await page.evaluate(() => !!document.getElementById('pgLock') || !!document.getElementById('pgHome') || !!document.getElementById('app'));
  if (!offlineOk) note('high', 'H', 'offline', 'shell missing after offline reload');
  else note('info', 'H', 'offline', 'shell present offline');
  await shot(page, 'offline-reload');
  await ctx.setOffline(false);

  // Content scan
  const contentHits = await page.evaluate(() => {
    const t = document.body?.innerText || '';
    const hits = [];
    [/lorem ipsum/i, /\bTODO\b/, /\bFIXME\b/, /coming soon/i, /placeholder/i].forEach((re) => {
      if (re.test(t)) hits.push(String(re));
    });
    return hits;
  });
  contentHits.forEach((h) => note('med', 'K', 'visible', `content match ${h}`));

  // axe summary
  axeAll.forEach((v) => note(v.impact === 'critical' ? 'crit' : 'high', 'G', v.screen, `${v.id}: ${v.help} (${v.nodes})`, { theme: v.theme }));

  errs.forEach((e) => note('high', 'D', 'console', e.msg));
  errs2.forEach((e) => note('high', 'D', 'console-fresh', e.msg));

  const report = {
    base: BASE,
    browser: 'chromium + iPhone 15 Pro metrics (WebKit not used — sandbox)',
    ver,
    externalHosts: [...hosts],
    tapsDash: tapsDash.slice(0, 30),
    layoutIssueCount: layoutAll.reduce((n, l) => n + l.issues.length, 0),
    axeSerious: axeAll.length,
    findings,
    shotCount,
  };
  fs.writeFileSync(path.join(OUT, 'audit-findings.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ findings: findings.length, axe: axeAll.length, layout: report.layoutIssueCount, hosts: [...hosts], shots: shotCount }, null, 2));
  findings.filter((f) => f.sev === 'crit' || f.sev === 'high').forEach((f) => console.log(`[${f.sev}] ${f.area}/${f.screen}: ${f.msg}`));
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
