#!/usr/bin/env node
/** Crisp PWA icons — canvas draw (no soft SVG screenshot blur on iOS). */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const specs = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'icon-1024.png', size: 1024 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'icon-maskable-512.png', size: 512 },
];

function drawIcon(ctx, size) {
  const s = size / 512;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, size, size);

  // White plate
  const pr = 96 * s;
  const px = 64 * s;
  const pw = 384 * s;
  roundRect(ctx, px, px, pw, pw, pr);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  // Lock body
  const bx = 152 * s;
  const by = 232 * s;
  const bw = 208 * s;
  const bh = 152 * s;
  const br = 40 * s;
  roundRect(ctx, bx, by, bw, bh, br);
  ctx.fillStyle = '#000000';
  ctx.fill();

  // Shackle
  ctx.beginPath();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 32 * s;
  ctx.lineCap = 'round';
  const cx = 256 * s;
  const shackleR = 64 * s;
  const shackleY = 192 * s;
  ctx.arc(cx, shackleY, shackleR, Math.PI, 0, false);
  ctx.stroke();
  // legs into body
  ctx.beginPath();
  ctx.moveTo(cx - shackleR, shackleY);
  ctx.lineTo(cx - shackleR, by);
  ctx.moveTo(cx + shackleR, shackleY);
  ctx.lineTo(cx + shackleR, by);
  ctx.stroke();

  // Keyhole
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(256 * s, 288 * s, 24 * s, 0, Math.PI * 2);
  ctx.fill();
  roundRect(ctx, 244 * s, 288 * s, 24 * s, 48 * s, 12 * s);
  ctx.fill();
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

const browser = await chromium.launch();
const page = await browser.newPage();

for (const { file, size } of specs) {
  // Render at 2× then downscale for sharper edges on retina home screens
  const scale = 2;
  const big = size * scale;
  await page.setViewportSize({ width: big, height: big });
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0">
    <canvas id="c" width="${big}" height="${big}"></canvas>
    <script>
      const canvas = document.getElementById('c');
      const ctx = canvas.getContext('2d');
      (${drawIcon.toString()})(ctx, ${big});
      (${roundRect.toString()});
    </script>
  </body></html>`);
  // Re-inject properly — functions need to be in page scope
  await page.evaluate(({ size: bigSize }) => {
    function roundRect(ctx, x, y, w, h, r) {
      const rr = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x + w, y, x + w, y + h, rr);
      ctx.arcTo(x + w, y + h, x, y + h, rr);
      ctx.arcTo(x, y + h, x, y, rr);
      ctx.arcTo(x, y, x + w, y, rr);
      ctx.closePath();
    }
    function drawIcon(ctx, size) {
      const s = size / 512;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, size, size);
      const pr = 96 * s;
      const px = 64 * s;
      const pw = 384 * s;
      roundRect(ctx, px, px, pw, pw, pr);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      const bx = 152 * s;
      const by = 232 * s;
      const bw = 208 * s;
      const bh = 152 * s;
      const br = 40 * s;
      roundRect(ctx, bx, by, bw, bh, br);
      ctx.fillStyle = '#000000';
      ctx.fill();
      ctx.beginPath();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 32 * s;
      ctx.lineCap = 'round';
      const cx = 256 * s;
      const shackleR = 64 * s;
      const shackleY = 192 * s;
      ctx.arc(cx, shackleY, shackleR, Math.PI, 0, false);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - shackleR, shackleY);
      ctx.lineTo(cx - shackleR, by);
      ctx.moveTo(cx + shackleR, shackleY);
      ctx.lineTo(cx + shackleR, by);
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(256 * s, 288 * s, 24 * s, 0, Math.PI * 2);
      ctx.fill();
      roundRect(ctx, 244 * s, 288 * s, 24 * s, 48 * s, 12 * s);
      ctx.fill();
    }
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    drawIcon(ctx, bigSize);
  }, { size: big });

  const buf = await page.evaluate(async ({ outSize, bigSize }) => {
    const src = document.getElementById('c');
    const out = document.createElement('canvas');
    out.width = outSize;
    out.height = outSize;
    const octx = out.getContext('2d');
    octx.imageSmoothingEnabled = true;
    octx.imageSmoothingQuality = 'high';
    octx.drawImage(src, 0, 0, bigSize, bigSize, 0, 0, outSize, outSize);
    const blob = await new Promise((r) => out.toBlob(r, 'image/png'));
    const ab = await blob.arrayBuffer();
    return Array.from(new Uint8Array(ab));
  }, { outSize: size, bigSize: big });

  fs.writeFileSync(path.join(root, file), Buffer.from(buf));
  console.log('wrote', file, `${size}x${size}`);
}

await browser.close();

// Keep icon.svg in sync for favicon
console.log('PWA icons ready (crisp canvas).');
