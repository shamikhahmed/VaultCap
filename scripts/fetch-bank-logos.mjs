#!/usr/bin/env node
/**
 * Build-time only: download bank logos into assets/banks/.
 * Runtime never hits Google — privacy leak lives here (dev machine), not user devices.
 *
 * Sources (tried in order per domain):
 *  1. Google s2 favicons sz=128 (best coverage)
 *  2. DuckDuckGo ip3 icons
 *  3. Clearbit logo API
 *
 * Usage: node scripts/fetch-bank-logos.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'assets', 'banks');
const mapPath = path.join(outDir, 'manifest.json');

function slug(domain) {
  return String(domain).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function extractDomains() {
  const domains = new Set();
  const files = [
    path.join(root, 'js/core/branding.js'),
    path.join(root, 'js/modules/banks.js'),
    path.join(root, 'js/core/bank-catalog.js'),
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
      headers: { 'User-Agent': 'VaultCap-LogoFetcher/1.0 (+https://github.com/shamikhahmed/VaultCap)' },
      redirect: 'follow',
    });
    if (!res.ok) return null;
    const ct = (res.headers.get('content-type') || '').toLowerCase();
    if (!ct.includes('image') && !ct.includes('octet-stream') && !ct.includes('icon')) {
      // some CDNs omit content-type; still accept small bodies
    }
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
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`,
    `https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`,
    `https://logo.clearbit.com/${encodeURIComponent(domain)}`,
  ];
  for (const url of sources) {
    const buf = await fetchBytes(url);
    if (buf) return { buf, source: url.split('/')[2] };
  }
  return null;
}

fs.mkdirSync(outDir, { recursive: true });
const domains = extractDomains();
console.log(`Fetching logos for ${domains.length} domains → ${outDir}`);

const manifest = { version: 1, updated: new Date().toISOString().slice(0, 10), logos: {} };
let ok = 0;
let fail = 0;

for (const domain of domains) {
  const id = slug(domain);
  const file = `${id}.png`;
  const dest = path.join(outDir, file);
  process.stdout.write(`  ${domain} … `);
  const hit = await fetchLogo(domain);
  if (!hit) {
    console.log('FAIL');
    fail++;
    continue;
  }
  fs.writeFileSync(dest, hit.buf);
  manifest.logos[domain] = { file, bytes: hit.buf.length, source: hit.source };
  console.log(`ok (${hit.source}, ${hit.buf.length}B)`);
  ok++;
  await new Promise((r) => setTimeout(r, 120)); // gentle rate limit
}

fs.writeFileSync(mapPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Done: ${ok} ok, ${fail} fail. Manifest → ${mapPath}`);
if (ok === 0) process.exit(1);
