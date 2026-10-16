#!/usr/bin/env node
/**
 * Rasterize VaultCap family icon (midnight / gold shield) from icon.svg.
 * Maskable variants use a full-bleed square (no rx) so adaptive icons crop cleanly.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const svgPath = path.join(root, 'icon.svg');

const PW_CORE = process.env.PW_CORE || path.join(root, '../MasteryCap/node_modules/playwright-core');
const executablePath = chromium.executablePath();

const specs = [
  { file: 'icon-192.png', size: 192, maskable: false },
  { file: 'icon-512.png', size: 512, maskable: false },
  { file: 'icon-1024.png', size: 1024, maskable: false },
  { file: 'apple-touch-icon.png', size: 180, maskable: false },
  { file: 'icon-maskable-512.png', size: 512, maskable: true },
  { file: 'icon-maskable-192.png', size: 192, maskable: true },
];

const copyTargets = [
  ['icons', 'icon-192.png'],
  ['icons', 'icon-512.png'],
  ['icons', 'icon-1024.png'],
  ['icons', 'icon-maskable-512.png'],
  ['icons', 'icon-maskable-192.png'],
  ['assets', 'icon-192.png'],
  ['assets', 'icon-512.png'],
  ['assets', 'icon-1024.png'],
  ['assets', 'icon-maskable-512.png'],
  ['assets', 'icon-maskable-192.png'],
];

function prepareSvg(raw, { size, maskable }) {
  let svg = raw
    .replace(/<svg\b([^>]*)>/, (_, attrs) => {
      const cleaned = attrs
        .replace(/\swidth="[^"]*"/g, '')
        .replace(/\sheight="[^"]*"/g, '');
      return `<svg width="${size}" height="${size}"${cleaned}>`;
    });
  if (maskable) {
    // Full-bleed square for Android adaptive safe-zone crop
    svg = svg.replace(/rx="112"/, 'rx="0"');
  }
  return svg;
}

const svgRaw = fs.readFileSync(svgPath, 'utf8');

function resolveChrome() {
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
    return process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  }
  const home = process.env.HOME || '';
  const arm = `${home}/Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;
  if (fs.existsSync(arm)) return arm;
  return executablePath;
}

const browser = await chromium.launch({
  executablePath: resolveChrome(),
  args: ['--disable-dev-shm-usage'],
});

for (const { file, size, maskable } of specs) {
  const page = await browser.newPage();
  const svg = prepareSvg(svgRaw, { size, maskable });
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<!DOCTYPE html><html><head><style>
      html,body{margin:0;padding:0;width:${size}px;height:${size}px;overflow:hidden;background:transparent}
      svg{display:block}
    </style></head><body>${svg}</body></html>`,
    { waitUntil: 'load' },
  );
  const outPath = path.join(root, file);
  await page.screenshot({ path: outPath, type: 'png', omitBackground: false });
  await page.close();
  console.log('wrote', file, `${size}x${size}`, maskable ? '(maskable)' : '');
}

await browser.close();

// Mirror apple-touch into icons/ and assets/ under the 180 name used by HTML
const appleSrc = path.join(root, 'apple-touch-icon.png');
for (const dir of ['icons', 'assets']) {
  const dest = path.join(root, dir, 'apple-touch-icon-180.png');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(appleSrc, dest);
  console.log('copied', path.relative(root, dest));
}

for (const [dir, file] of copyTargets) {
  const src = path.join(root, file);
  const dest = path.join(root, dir, file);
  if (!fs.existsSync(src)) continue;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log('copied', path.join(dir, file));
}

console.log('PWA icons ready (family midnight/gold from icon.svg).');
console.log('PW_CORE hint:', PW_CORE);
