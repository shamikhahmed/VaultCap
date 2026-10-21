#!/usr/bin/env node
/** 3× honest mobile Lighthouse for VaultCap demo home → build/qa/v7/lighthouse/ */
import { mkdirSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const NM = process.env.LIGHTHOUSE_DIR || join(root, '../MasteryCap/node_modules');
const imp = (p) => import(pathToFileURL(join(NM, p)).href);
const { default: lighthouse } = await imp('lighthouse/core/index.js');
const chromeLauncher = await imp('chrome-launcher/dist/index.js');
const chromePath =
  process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const outDir = join(root, 'build/qa/v7/lighthouse');
mkdirSync(outDir, { recursive: true });
const url = process.env.LH_URL || 'http://127.0.0.1:8765/?demo=1';
const pct = (c) => Math.round((c?.score ?? 0) * 100);

function pickRun(lhr, run) {
  const a = lhr.audits;
  const c = lhr.categories;
  const lcpAudit = a['largest-contentful-paint'];
  const rb = a['render-blocking-resources'];
  const rbTop = (rb?.details?.items || [])
    .slice(0, 8)
    .map((i) => ({ url: (i.url || '').split('/').pop(), wastedMs: Math.round(i.wastedMs || 0) }))
    .filter((x) => x.wastedMs > 0);
  const unused = a['unused-javascript']?.details?.items?.find((i) => (i.url || '').includes('vaultcap.boot'));
  let lcpPhases = [];
  const table = a['lcp-breakdown-insight']?.details?.items?.[0]?.items;
  if (table) {
    lcpPhases = table.map((it) => ({
      phase: it.label || it.subpart,
      timing: Math.round(it.duration || 0),
      percent: lcpAudit.numericValue
        ? `${Math.round(((it.duration || 0) / lcpAudit.numericValue) * 100)}%`
        : undefined,
    }));
  }
  const lcpNode =
    a['largest-contentful-paint-element']?.details?.items?.[0]?.node?.snippet ||
    a['lcp-breakdown-insight']?.details?.items?.[1]?.snippet ||
    '';
  return {
    run,
    perf: pct(c.performance),
    a11y: pct(c.accessibility),
    bp: pct(c['best-practices']),
    seo: pct(c.seo),
    lcp: lcpAudit.displayValue,
    lcpMs: lcpAudit.numericValue,
    cls: a['cumulative-layout-shift'].displayValue,
    tbt: a['total-blocking-time'].displayValue,
    fcp: a['first-contentful-paint'].displayValue,
    rb: rb?.displayValue || '',
    lcpPhases,
    lcpNode,
    unusedBoot: unused ? { total: unused.totalBytes, wasted: unused.wastedBytes } : null,
    rbTop,
  };
}

async function oneRun(run) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const chrome = await chromeLauncher.launch({
      chromePath,
      chromeFlags: ['--headless=new', '--no-first-run', '--disable-blink-features=AutomationControlled'],
    });
    try {
      const r = await lighthouse(url, { port: chrome.port, output: 'json', logLevel: 'error' });
      writeFileSync(join(outDir, `mobile-run${run}.report.json`), JSON.stringify(r.lhr));
      return pickRun(r.lhr, run);
    } catch (e) {
      if (attempt === 3) throw e;
    } finally {
      try {
        await Promise.resolve(chrome.kill());
      } catch {
        /* ignore */
      }
    }
  }
}

const scores = [];
for (let run = 1; run <= 3; run++) {
  const row = await oneRun(run);
  scores.push(row);
  console.log(
    `run ${run}: perf ${row.perf} a11y ${row.a11y} FCP ${row.fcp} LCP ${row.lcp} CLS ${row.cls}`,
  );
  await new Promise((r) => setTimeout(r, 4000));
}

const med = (arr) => {
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};
const summary = {
  url,
  scores,
  medianPerf: med(scores.map((s) => s.perf)),
  medianA11y: med(scores.map((s) => s.a11y)),
  bootBytes: statSync(join(root, 'dist/vaultcap.boot.js')).size,
};
writeFileSync(join(outDir, 'SUMMARY.json'), JSON.stringify(summary, null, 2));
console.log(`median perf ${summary.medianPerf} · boot ${(summary.bootBytes / 1024).toFixed(1)} KB`);
