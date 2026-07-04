#!/usr/bin/env node
/** Regenerate PNG PWA icons from icon.svg */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const svgRaw = fs.readFileSync(path.join(root, 'icon.svg'), 'utf8');

/** @type {{ file: string, size: number, maskable?: boolean }[]} */
const specs = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'icon-1024.png', size: 1024 },
  { file: 'apple-touch-icon.png', size: 180 },
  // Maskable: same art (full-bleed black already safe); dedicated file for manifest clarity
  { file: 'icon-maskable-512.png', size: 512, maskable: true },
];

const browser = await chromium.launch();

for (const { file, size } of specs) {
  const page = await browser.newPage();
  const svg = svgRaw.replace('<svg ', `<svg width="${size}" height="${size}" `);
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<!DOCTYPE html><html><head><style>
      html,body{margin:0;padding:0;width:${size}px;height:${size}px;overflow:hidden;background:#000}
      svg{display:block}
    </style></head><body>${svg}</body></html>`
  );
  const out = path.join(root, file);
  await page.screenshot({ path: out, type: 'png' });
  await page.close();
  console.log('wrote', out, `${size}x${size}`);
}

await browser.close();
console.log('PWA icons ready.');
