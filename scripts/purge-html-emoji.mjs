#!/usr/bin/env node
/** One-shot HTML emoji → data-vc-icon hydrator markup */
import { readFileSync, writeFileSync } from 'fs';

const MAP = {
  '🏦': 'bank', '💳': 'card', '📈': 'chart', '💵': 'banknote', '🤝': 'handshake', '📋': 'list',
  '🔄': 'repeat', '🏠': 'building', '🚗': 'car', '💻': 'laptop', '📱': 'smartphone', '📧': 'mail',
  '💼': 'briefcase', '🪪': 'id-card', '👥': 'users', '👤': 'user', '📦': 'package', '🥇': 'gem',
  '🥈': 'star', '🛡️': 'shield', '🔒': 'lock', '🔑': 'key', '📊': 'chart', '📝': 'pencil',
  '✏️': 'pencil', '➕': 'plus', '🗑️': 'trash', '🔔': 'bell', '📅': 'calendar', '✨': 'sparkles',
  '⚙️': 'settings', '📤': 'share', '📥': 'download', '🙈': 'eye-off', '💾': 'archive',
  '🎫': 'ticket', '📘': 'id-card', '✈️': 'arrows', '🏥': 'cross', '🧾': 'receipt', '🎓': 'star',
  '📄': 'file', '⌚': 'watch', '💍': 'ring', '🏢': 'building-2', '💰': 'banknote', '🔍': 'search',
  '🚨': 'cross', '🎬': 'chart', '🎵': 'star', '☁️': 'archive', '🤖': 'sparkles', '🎮': 'grid',
  '📰': 'book', '💸': 'arrow-right', '🤲': 'undo', '👑': 'star', '🔋': 'gauge', '📡': 'smartphone',
  '🎧': 'smartphone', '📷': 'file', '🗓️': 'calendar', '⚠️': 'bell', '✓': 'target', '✔': 'target',
  '✅': 'target', '🎲': 'target', '🎯': 'target', '📴': 'smartphone', '🎨': 'grid', '🆘': 'cross',
  '📁': 'file', '🌍': 'arrows', '🌐': 'arrows', '💡': 'sparkles', '💔': 'cross', '👁️': 'eye',
  '☪️': 'moon', '☪': 'moon', '🕌': 'moon', '📿': 'moon', '⚡': 'sparkles', '🛣️': 'car', '⛽': 'gauge',
  '🔧': 'settings', '🗂️': 'archive', '🔗': 'share', '🎭': 'eye-off', '🗝️': 'key', '🧳': 'briefcase',
  '👨‍👩‍👧‍👦': 'users', '👨‍💼': 'briefcase', '👩': 'user', '👧': 'user', '👴': 'user',
  '🌸': 'sparkles', '💗': 'sparkles', '📖': 'book', '📜': 'receipt', '⚖️': 'gauge', '♾️': 'repeat',
  '🔏': 'lock', '🔴': 'bell', '🟡': 'bell', '🌳': 'users', '📸': 'file', '💱': 'arrows',
};

const FLAG_RE = /🇵🇰|🇬🇧|🇦🇪|🇺🇸|🇨🇦|🇦🇺|🇸🇦|🇶🇦/g;

function emojiSize(ctx, emoji) {
  const m = ctx.match(/font-size:\s*(\d+)px/);
  if (m) return m[1];
  const m2 = ctx.match(/font-size:\s*([\d.]+)rem/);
  if (m2) return String(Math.round(parseFloat(m2[1]) * 16));
  if (ctx.includes('s2-card-emoji') || ctx.includes('feat-card-icon') || ctx.includes('persona-emoji')) return '32';
  if (ctx.includes('step-icon') || ctx.includes('backup-node-icon') || ctx.includes('id-card-icon')) return '28';
  if (ctx.includes('s5-badge') || ctx.includes('fmod')) return '14';
  if (ctx.includes('spec-check')) return '20';
  if (ctx.includes('family-node-icon')) return '36';
  if (emoji.length > 1) return '28';
  return '24';
}

function replaceEmojiInHtml(html, { keepOnboardingAvatars = false } = {}) {
  let out = html;
  const sorted = Object.keys(MAP).sort((a, b) => b.length - a.length);

  for (const emoji of sorted) {
    const icon = MAP[emoji];
    const esc = emoji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(esc, 'g');
    out = out.replace(re, (match, offset) => {
      if (keepOnboardingAvatars) {
        const slice = out.slice(Math.max(0, offset - 400), offset + 400);
        if (slice.includes('ob-type-card') && /aria-hidden="true"/.test(slice)) return match;
      }
      const before = out.slice(Math.max(0, offset - 120), offset);
      const after = out.slice(offset, offset + 120);
      if (FLAG_RE.test(after.slice(0, 20))) return match;
      const size = emojiSize(before + after, emoji);
      const inline = `<span data-vc-icon="${icon}" data-vc-size="${size}" class="vc-ic-inline" style="display:inline-flex;vertical-align:middle;margin-right:.35em"></span>`;
      const solo = `<span data-vc-icon="${icon}" data-vc-size="${size}" style="display:inline-flex;align-items:center;justify-content:center"></span>`;

      const prev = out[offset - 1];
      const next = out[offset + emoji.length];
      const soloBefore = /[>\s]/.test(prev || '') && (next === '<' || next === undefined || /\s/.test(next));
      if (soloBefore && (before.endsWith('>') || before.match(/class="[^"]*-(emoji|icon)[^"]*"\s*>$/))) {
        return solo.replace('class="vc-ic-inline"', '');
      }
      if (before.match(/>\s*$/) && (next === '<' || !next || /\s/.test(next))) {
        return solo;
      }
      return inline;
    });
  }
  return out;
}

const files = [
  { path: 'landing.html' },
  { path: 'pitch.html' },
  { path: 'presentation.html' },
  { path: 'index.html', keepOnboardingAvatars: true },
];

for (const f of files) {
  const p = new URL(`../${f.path}`, import.meta.url).pathname;
  const src = readFileSync(p, 'utf8');
  const next = replaceEmojiInHtml(src, f);
  if (next !== src) {
    writeFileSync(p, next);
    console.log('updated', f.path);
  } else {
    console.log('unchanged', f.path);
  }
}
