#!/usr/bin/env node
/**
 * Convert inline on* handlers → data-act* attributes for CSP.
 * Rewrites .js / .html under repo (skips node_modules, dist, .git).
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const SKIP = new Set(['node_modules', 'dist', '.git', 'playwright-report', 'test-results', 'ios', 'www']);

const MAP = [
  ['onclick', 'data-act'],
  ['oninput', 'data-act-input'],
  ['onchange', 'data-act-change'],
  ['onkeydown', 'data-act-keydown'],
  ['onload', 'data-act-load'],
];

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(js|html)$/.test(name)) out.push(p);
  }
  return out;
}

function convert(text) {
  let n = 0;
  let out = text;
  for (const [from, to] of MAP) {
    // double-quoted
    const re1 = new RegExp(`\\b${from}\\s*=\\s*"([^"]*)"`, 'gi');
    out = out.replace(re1, (_, expr) => {
      n++;
      const esc = expr.replace(/"/g, '&quot;');
      return `${to}="${esc}"`;
    });
    // single-quoted
    const re2 = new RegExp(`\\b${from}\\s*=\\s*'([^']*)'`, 'gi');
    out = out.replace(re2, (_, expr) => {
      n++;
      const esc = expr.replace(/'/g, '&#39;');
      return `${to}='${esc}'`;
    });
  }
  return { text: out, n };
}

const files = walk(ROOT);
let total = 0;
const touched = [];
for (const f of files) {
  // Don't rewrite the migrator or act-delegate itself incorrectly
  if (f.includes('csp-migrate-handlers')) continue;
  const raw = fs.readFileSync(f, 'utf8');
  if (!/\bon(click|input|change|keydown|load)\s*=/i.test(raw)) continue;
  const { text, n } = convert(raw);
  if (n > 0 && text !== raw) {
    fs.writeFileSync(f, text);
    total += n;
    touched.push({ f: path.relative(ROOT, f), n });
  }
}
console.log(JSON.stringify({ total, files: touched.length, touched: touched.sort((a, b) => b.n - a.n) }, null, 2));
