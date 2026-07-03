import { chromium } from 'playwright';
import { unlockDemoVault, dismissOverlays } from '../tests/demo-unlock.js';

const BASE = 'http://127.0.0.1:8765';
const PAGES = [
  'dashboard',
  'banks',
  'cards',
  'backup',
  'alerts',
  'bc',
  'import',
  { id: 'settings', tab: 'appearance' },
  'finance-home',
  'family',
];

const LIGHT_PAGES = ['dashboard', 'backup', 'alerts'];

function pageKey(p) {
  return typeof p === 'string' ? p : `${p.id} (${p.tab})`;
}

async function gotoPage(page, spec) {
  const id = typeof spec === 'string' ? spec : spec.id;
  await dismissOverlays(page);
  await page.evaluate((routeId) => R.goto(routeId, true), id);
  if (typeof spec === 'object' && spec.tab) {
    await page.waitForSelector('#pg-settings.on', { timeout: 15000 });
    await page.evaluate((tabId) => {
      if (typeof SettingsNav !== 'undefined') SettingsNav.show(tabId);
    }, spec.tab);
  } else {
    await page.waitForSelector(`#pg-${id}.on`, { timeout: 15000 });
  }
  await page.waitForTimeout(400);
}

async function measurePb(page) {
  return page.evaluate(() => {
    const pg = document.querySelector('.page.on');
    const pb = pg?.querySelector('.pb');
    if (!pb) return { ok: false, reason: 'no .pb on active page' };
    const sh = pb.scrollHeight;
    const ch = pb.clientHeight;
    return { ok: true, scrollHeight: sh, clientHeight: ch, overflowPx: Math.max(0, sh - ch) };
  });
}

function parseRgb(str) {
  const s = str.trim();
  let m = s.match(/^#([0-9a-f]{3,8})$/i);
  if (m) {
    let h = m[1];
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h.slice(0, 6), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
  }
  m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (m) return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 };
  return null;
}

function relLum({ r, g, b }) {
  const f = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrastRatio(fg, bg) {
  const L1 = relLum(fg);
  const L2 = relLum(bg);
  const hi = Math.max(L1, L2);
  const lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}

async function lightContrastCheck(page, routeId) {
  await gotoPage(page, routeId);
  return page.evaluate(() => {
    ThemeEngine.apply('light');
    const body = document.body;
    const isLight = body.classList.contains('light');
    const root = getComputedStyle(body);
    const text3Var = root.getPropertyValue('--text3').trim();
    const bgVar = root.getPropertyValue('--bg').trim();
    const text3Resolved = getComputedStyle(document.querySelector('.t-meta, .t-label, .sc-l') || body).color;

    const sampleEls = [...document.querySelectorAll('.t-meta, .t-label, .sc-l, .field-hint, .hero-label')].slice(0, 12);
    const samples = sampleEls.map((el) => {
      const cs = getComputedStyle(el);
      const color = cs.color;
      let bg = cs.backgroundColor;
      let node = el;
      while (node && (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) {
        node = node.parentElement;
        if (node) bg = getComputedStyle(node).backgroundColor;
      }
      return { tag: el.className, color, bg: bg || 'unknown' };
    });

    return { isLight, text3Var, bgVar, text3Resolved, samples };
  });
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ baseURL: BASE, viewport: { width: 390, height: 844 } });
const page = await context.newPage();

await unlockDemoVault(page);

const overflowRows = [];
for (const spec of PAGES) {
  const key = pageKey(spec);
  await gotoPage(page, spec);
  const m = await measurePb(page);
  overflowRows.push({
    page: key,
    scrollHeight: m.scrollHeight ?? '—',
    clientHeight: m.clientHeight ?? '—',
    overflowPx: m.ok ? m.overflowPx : m.reason,
  });
}

const contrastRows = [];
for (const routeId of LIGHT_PAGES) {
  const data = await lightContrastCheck(page, routeId);
  const fg = parseRgb(data.text3Var) || parseRgb(data.text3Resolved);
  const bg = parseRgb(data.bgVar) || { r: 255, g: 255, b: 255, a: 1 };
  let ratio = fg ? contrastRatio(fg, bg) : null;
  const issues = [];
  if (!data.isLight) issues.push('body.light missing after apply');
  if (ratio !== null && ratio < 4.5) issues.push(`--text3 on --bg ratio ${ratio.toFixed(2)} (<4.5)`);
  for (const s of data.samples) {
    const f = parseRgb(s.color);
    const b = parseRgb(s.bg);
    if (f && b && b.a > 0.1) {
      const r = contrastRatio(f, b);
      if (r < 3) issues.push(`${s.tag}: ${r.toFixed(2)} (${s.color} on ${s.bg})`);
    }
  }
  contrastRows.push({
    page: routeId,
    text3Var: data.text3Var,
    bgVar: data.bgVar,
    text3Computed: data.text3Resolved,
    ratioOnBg: ratio !== null ? ratio.toFixed(2) : 'n/a',
    issues: issues.length ? issues.join('; ') : 'none obvious',
  });
}

await browser.close();

console.log('\n=== .pb overflow (scrollHeight > clientHeight) ===');
console.table(overflowRows);

console.log('\n=== Light mode --text3 (ThemeEngine.apply light) ===');
console.table(contrastRows);
