// VaultOS — © 2026 Shamikh Ahmed. Source-available. See LICENSE.
// Core utility functions — canonical definitions loaded before app.js bootstrap.

const escHtml = str => String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

function mkEntity(type, fields = {}) {
  return {
    id: fields.id || (Math.random().toString(36).slice(2)),
    type,
    createdAt: fields.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: fields.tags || [],
    linkedEntities: fields.linkedEntities || [],
    archived: fields.archived || false,
    favorite: fields.favorite || false,
    ...fields,
  };
}

function compressImage(dataUrl, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image')) { resolve(dataUrl); return; }
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function debounce(fn, ms) {
  let t;
  return function(...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), ms); };
}

const Tags = {
  chips(tags = [], opts = {}) {
    if (!tags.length) return '';
    return tags.map(t => `<span style="display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:600;padding:2px 7px;border-radius:var(--r-pill,999px);background:rgba(123,95,255,.15);color:rgba(150,120,255,1);border:1px solid rgba(123,95,255,.25)">${t}${opts.removable ? `<span onclick="${opts.onRemove}('${t}')" style="cursor:pointer;margin-left:2px;opacity:.7">×</span>` : ''}</span>`).join(' ');
  },
  parse(str) {
    return (str || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
  },
  PRESETS: ['personal', 'business', 'uk', 'pakistan', 'uae', 'halal', 'urgent', 'archived', 'family', 'tax-related', 'investment'],
};
