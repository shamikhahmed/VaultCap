#!/usr/bin/env node
/**
 * Embeds assets/screenshots/manifest.json into screen-gallery.html
 * so the gallery works offline (file://) without a local server.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = join(root, 'assets/screenshots/manifest.json');
const galleryPath = join(root, 'screen-gallery.html');
const markerStart = '<script type="application/json" id="gallery-manifest-embedded">';
const markerEnd = '</script><!-- gallery-manifest-embedded -->';

const manifest = readFileSync(manifestPath, 'utf8').trim();
let html = readFileSync(galleryPath, 'utf8');
const block = `${markerStart}${manifest}${markerEnd}`;

if (html.includes('id="gallery-manifest-embedded"')) {
  html = html.replace(
    /<script type="application\/json" id="gallery-manifest-embedded">[\s\S]*?<\/script><!-- gallery-manifest-embedded -->/,
    block
  );
} else {
  html = html.replace('</body>', `  ${block}\n</body>`);
}

writeFileSync(galleryPath, html);
const screens = JSON.parse(manifest).sections?.reduce((n, s) => n + (s.items?.length || 0), 0) ?? 0;
console.log(`Embedded manifest (${screens} screens) → screen-gallery.html`);
