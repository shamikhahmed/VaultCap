#!/usr/bin/env node
/** Generate iOS AppIcon.appiconset from icon.svg for Capacitor */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'resources', 'ios', 'AppIcon.appiconset');
const svgRaw = fs.readFileSync(path.join(root, 'icon.svg'), 'utf8');

const specs = [
  { file: 'icon-20@2x.png', size: 40 },
  { file: 'icon-20@3x.png', size: 60 },
  { file: 'icon-29@2x.png', size: 58 },
  { file: 'icon-29@3x.png', size: 87 },
  { file: 'icon-40@2x.png', size: 80 },
  { file: 'icon-40@3x.png', size: 120 },
  { file: 'icon-60@2x.png', size: 120 },
  { file: 'icon-60@3x.png', size: 180 },
  { file: 'icon-76@2x.png', size: 152 },
  { file: 'icon-83.5@2x.png', size: 167 },
  { file: 'icon-1024.png', size: 1024 },
];

fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
for (const { file, size } of specs) {
  const page = await browser.newPage();
  const svg = svgRaw.replace('<svg ', `<svg width="${size}" height="${size}" `);
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<!DOCTYPE html><html><head><style>html,body{margin:0;padding:0;width:${size}px;height:${size}px;overflow:hidden;background:#000}</style></head><body>${svg}</body></html>`);
  await page.screenshot({ path: path.join(outDir, file), type: 'png' });
  await page.close();
  console.log('wrote', file, size);
}
await browser.close();

const contents = {
  images: [
    { size: '20x20', idiom: 'iphone', filename: 'icon-20@2x.png', scale: '2x' },
    { size: '20x20', idiom: 'iphone', filename: 'icon-20@3x.png', scale: '3x' },
    { size: '29x29', idiom: 'iphone', filename: 'icon-29@2x.png', scale: '2x' },
    { size: '29x29', idiom: 'iphone', filename: 'icon-29@3x.png', scale: '3x' },
    { size: '40x40', idiom: 'iphone', filename: 'icon-40@2x.png', scale: '2x' },
    { size: '40x40', idiom: 'iphone', filename: 'icon-40@3x.png', scale: '3x' },
    { size: '60x60', idiom: 'iphone', filename: 'icon-60@2x.png', scale: '2x' },
    { size: '60x60', idiom: 'iphone', filename: 'icon-60@3x.png', scale: '3x' },
    { size: '76x76', idiom: 'ipad', filename: 'icon-76@2x.png', scale: '2x' },
    { size: '83.5x83.5', idiom: 'ipad', filename: 'icon-83.5@2x.png', scale: '2x' },
    { size: '1024x1024', idiom: 'ios-marketing', filename: 'icon-1024.png', scale: '1x' },
  ],
  info: { version: 1, author: 'xcode' },
};

fs.writeFileSync(path.join(outDir, 'Contents.json'), JSON.stringify(contents, null, 2));
console.log('AppIcon.appiconset ready at', outDir);
