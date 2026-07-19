#!/usr/bin/env node
/**
 * Build-time only: download bank logos into assets/banks/.
 * Runtime never hits Google — privacy leak lives here (dev machine), not user devices.
 *
 * Sources (tried in order per domain):
 *  1. Clearbit logo API (often real mark)
 *  2. Google s2 favicons sz=128
 *  3. DuckDuckGo ip3 icons
 *
 * Usage:
 *   node scripts/fetch-bank-logos.mjs           # fill missing + upgrade weak (<800B)
 *   node scripts/fetch-bank-logos.mjs --all     # re-fetch every domain
 *   node scripts/fetch-bank-logos.mjs --min=1200
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'assets', 'banks');
const mapPath = path.join(outDir, 'manifest.json');

const args = new Set(process.argv.slice(2));
const fetchAll = args.has('--all');
const minArg = [...args].find((a) => a.startsWith('--min='));
const WEAK_MAX = minArg ? Number(minArg.split('=')[1]) : 800;

/** Hand-crafted / high-quality assets — never overwrite unless --force-override */
const PROTECTED = new Set(['barclays-co-uk.png']);

function slug(domain) {
  return String(domain).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function extractDomains() {
  const domains = new Set();
  const files = [
    path.join(root, 'js/core/bank-catalog.js'),
    path.join(root, 'js/core/branding.js'),
  ];
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const src = fs.readFileSync(file, 'utf8');
    for (const m of src.matchAll(/['"]([a-z0-9][a-z0-9.-]+\.[a-z]{2,})['"]/gi)) {
      const d = m[1].toLowerCase();
      if (d.includes('example') || d.includes('w3.org') || d.includes('googleapis')) continue;
      if (d.split('.').length < 2) continue;
      domains.add(d);
    }
  }
  return [...domains].sort();
}

async function fetchBytes(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'VaultCap-LogoFetcher/1.1 (+https://github.com/shamikhahmed/VaultCap)' },
      redirect: 'follow',
    });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 64 || buf.length > 2_000_000) return null;
    return buf;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function fetchLogo(domain) {
  const sources = [
    `https://logo.clearbit.com/${encodeURIComponent(domain)}`,
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`,
    `https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`,
  ];
  let best = null;
  for (const url of sources) {
    const buf = await fetchBytes(url);
    if (!buf) continue;
    const source = url.split('/')[2];
    if (!best || buf.length > best.buf.length) best = { buf, source };
    // Clearbit wins early if decent size
    if (source.includes('clearbit') && buf.length >= 800) return best;
  }
  return best;
}

function shouldFetch(dest) {
  if (fetchAll) return true;
  if (!fs.existsSync(dest)) return true;
  return fs.statSync(dest).size < WEAK_MAX;
}

fs.mkdirSync(outDir, { recursive: true });
const domains = extractDomains();
console.log(`Logo fetch: ${domains.length} domains → ${outDir} (all=${fetchAll}, weak<${WEAK_MAX})`);

const prev = fs.existsSync(mapPath) ? JSON.parse(fs.readFileSync(mapPath, 'utf8')) : { logos: {} };
const manifest = { version: 2, updated: new Date().toISOString().slice(0, 10), logos: { ...(prev.logos || {}) } };
let ok = 0;
let skip = 0;
let fail = 0;
let upgraded = 0;

for (const domain of domains) {
  const id = slug(domain);
  const file = `${id}.png`;
  const dest = path.join(outDir, file);

  if (PROTECTED.has(file) && fs.existsSync(dest) && !args.has('--force-override')) {
    console.log(`  ${domain} … PROTECTED (keep ${fs.statSync(dest).size}B)`);
    skip++;
    continue;
  }

  if (!shouldFetch(dest)) {
    skip++;
    continue;
  }

  const before = fs.existsSync(dest) ? fs.statSync(dest).size : 0;
  process.stdout.write(`  ${domain} … `);
  const hit = await fetchLogo(domain);
  if (!hit) {
    console.log('FAIL');
    fail++;
    continue;
  }
  // Keep existing if new is worse
  if (before && hit.buf.length < before && before >= WEAK_MAX) {
    console.log(`keep (${before}B > new ${hit.buf.length}B)`);
    skip++;
    continue;
  }
  fs.writeFileSync(dest, hit.buf);
  manifest.logos[domain] = { file, bytes: hit.buf.length, source: hit.source };
  if (before && hit.buf.length > before) upgraded++;
  console.log(`ok (${hit.source}, ${hit.buf.length}B${before ? ` was ${before}B` : ''})`);
  ok++;
  await new Promise((r) => setTimeout(r, 100));
}

fs.writeFileSync(mapPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Done: ${ok} written, ${upgraded} upgraded, ${skip} skipped, ${fail} fail. Manifest → ${mapPath}`);
if (ok === 0 && fail > 0 && skip === 0) process.exit(1);
