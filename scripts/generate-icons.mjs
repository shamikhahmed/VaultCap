#!/usr/bin/env node
/** Regenerate PNG PWA icons from icon.svg */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const svgRaw = fs.readFileSync(path.join(root, 'icon.svg'), 'utf8');

const sizes = [192, 512, 1024];

const browser = await chromium.launch();

for (const size of sizes) {
  const page = await browser.newPage();
  const svg = svgRaw.replace('<svg ', `<svg width="${size}" height="${size}" `);
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<!DOCTYPE html><html><head><style>html,body{margin:0;padding:0;width:${size}px;height:${size}px;overflow:hidden;background:#000}</style></head><body>${svg}</body></html>`);
  const out = path.join(root, `icon-${size}.png`);
  await page.screenshot({ path: out, type: 'png' });
  await page.close();
  console.log('wrote', out, `${size}x${size}`);
}

await browser.close();
