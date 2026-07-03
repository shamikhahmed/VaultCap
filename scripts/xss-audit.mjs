#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dirs = ['js/modules', 'js/core', 'js'];
const risky = [
  /value="'\+\([^)]+\)/,
  /value=""\+\([^e][^s][^c]/,
  /<textarea[^>]*>'\+\([a-z]/i,
];
const allow = /escHtml|escAttr|_v\(|encodeURIComponent|JSON\.stringify|btoa|dataUrl|data:image|typeof VC|_uiIcon|U\.tags|Activity\.|PinHash|LockoutStore/;

let hits = 0;
for (const dir of dirs) {
  const absDir = path.join(root, dir);
  if (!fs.existsSync(absDir)) continue;
  for (const name of fs.readdirSync(absDir)) {
    if (!name.endsWith('.js')) continue;
    const file = path.join(absDir, name);
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (allow.test(line)) return;
      for (const re of risky) {
        if (re.test(line)) {
          console.error(`${path.relative(root, file)}:${i + 1}: ${line.trim().slice(0, 120)}`);
          hits++;
          break;
        }
      }
    });
  }
}

if (hits) {
  console.error(`xss-audit: ${hits} risky pattern(s)`);
  process.exit(1);
}
console.log('xss-audit: ok');
