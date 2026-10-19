#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const orderPath = path.join(root, 'js/bundle-order.json');
const outPath = path.join(root, 'dist/vaultcap.bundle.js');
const files = JSON.parse(fs.readFileSync(orderPath, 'utf8'));

// /*! keeps the banner through esbuild minify (legal comment)
const parts = [`/*! VaultCap bundle — ${files.length} modules — do not edit; run npm run build:js */`];
for (const rel of files) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    console.error('Missing bundle file:', rel);
    process.exit(1);
  }
  const content = fs.readFileSync(abs, 'utf8');
  parts.push(`\n/* ===== ${rel} ===== */\n;(function(){\n`);
  parts.push(content);
  const exports = new Set();
  for (const m of content.matchAll(/^const ([A-Z][A-Za-z0-9_]*)\s*=/gm)) exports.add(m[1]);
  for (const m of content.matchAll(/^(?:async\s+)?function ([A-Za-z][A-Za-z0-9_]*)\s*\(/gm)) exports.add(m[1]);
  for (const m of content.matchAll(/^let ([A-Z][A-Za-z0-9_]*)\s*=/gm)) exports.add(m[1]);
  for (const name of exports) {
    if (!content.includes(`window.${name}`)) {
      parts.push(`\ntry{if(typeof ${name}!=='undefined')window.${name}=${name};}catch(e){}\n`);
    }
  }
  parts.push('\n})();\n');
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
const raw = parts.join('');
fs.writeFileSync(outPath, raw);
console.log('Wrote', outPath, '(' + (fs.statSync(outPath).size / 1024).toFixed(1) + ' KB)');

// Production minify (esbuild via npx) — keeps source maps off; skip when VC_NO_MINIFY=1
if (process.env.VC_NO_MINIFY !== '1') {
  const { spawnSync } = await import('node:child_process');
  const r = spawnSync(
    'npx',
    ['--yes', 'esbuild', outPath, '--minify', `--outfile=${outPath}`, '--allow-overwrite'],
    { cwd: root, encoding: 'utf8' },
  );
  if (r.status !== 0) {
    console.warn('minify skipped:', (r.stderr || r.stdout || '').slice(0, 400));
  } else {
    console.log('Minified', outPath, '(' + (fs.statSync(outPath).size / 1024).toFixed(1) + ' KB)');
  }
}
