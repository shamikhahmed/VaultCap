const CACHE = 'vaultcap-v32';
// Relative paths work on custom domain (/) and GitHub Pages (/VaultCap/)
const ASSETS = [
  './css/capricorn-core.css',
  './',
  './index.html',
  './landing.html',
  './presentation.html',
  './pitch.html',
  './docs/GUIDE.md',
  './vendor/tesseract.min.js',
  './icon-192.png',
  './icon-512.png',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './css/themes.css',
  './js/storage.js',
  './js/app.js',
  './js/ui.js',
  './js/core/constants.js',
  './js/core/schema.js',
  './js/core/utils.js',
  './js/core/validators.js',
  './js/core/vault-meta.js',
  './js/core/family-pickers.js',
  './js/modules/rates.js',
  './js/modules/banks.js',
  './js/modules/cards.js',
  './js/modules/sims.js',
  './js/modules/investments.js',
  './js/modules/cash.js',
  './js/modules/loans.js',
  './js/modules/friends.js',
  './js/modules/family.js',
  './js/modules/assets.js',
  './js/modules/expenses.js',
  './js/modules/documents.js',
  './js/modules/emails.js',
  './js/modules/gadgets.js',
  './js/modules/digital.js',
  './js/modules/alerts.js',
  './js/modules/timeline.js',
  './js/modules/security.js',
  './js/modules/search.js',
  './js/modules/vehicles.js',
  './js/modules/reminders.js',
  './js/modules/ai-import.js',
  './js/config/llm-bundled.js',
  './js/modules/llm-assist.js',
  './js/modules/trash.js',
  './js/modules/currency.js',
  './js/modules/currency-engine.js',
  './js/modules/gold.js',
  './js/modules/zakat.js',
  './js/modules/bc.js',
  './js/modules/bonds.js',
  './js/modules/tax.js',
  './js/modules/creditScore.js',
  './manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).catch(() => caches.match('./index.html'));
    })
  );
});
