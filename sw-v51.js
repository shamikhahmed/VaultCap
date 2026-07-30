const CACHE = 'vaultcap-v80';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './widget-data.json',
  './icon.svg',
  './icon-mark.svg',
  './mark.svg',
  './favicon.svg',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-192.png',
  './icon-maskable-512.png',
  './icon-1024.png',
  './apple-touch-icon.png',
  './icons/mark.svg',
  './icons/favicon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/icon-1024.png',
  './icons/apple-touch-icon-180.png',
  './css/capricorn-core.css',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './css/themes.css',
  './css/identity.css',
  './js/boot-cache.js',
  './js/boot-ver.js',
  './js/boot-shell.js',
  './js/storage.js',
  './js/core/smart-db.js',
  './js/modules/tax.js',
  './dist/vaultcap.bundle.js',
];

const PRECACHE = new Set(ASSETS.map((p) => new URL(p, self.location).href));

function isCodeAsset(url) {
  return /\.(js|css|html)(\?|$)/i.test(url.pathname);
}

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  // Bank logos — cache-first, never hit Google from client
  if (url.pathname.includes('/assets/banks/')) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        if (cached) return cached;
        return fetch(e.request).then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
          }
          return res;
        });
      })
    );
    return;
  }

  if (PRECACHE.has(url.href)) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        const net = fetch(e.request).then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
          }
          return res;
        }).catch(() => cached || caches.match('./index.html'));
        // Stale-while-revalidate: return cache immediately when present
        return cached || net;
      })
    );
    return;
  }

  if (isCodeAsset(url)) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(e.request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).catch(() => caches.match('./index.html'));
    })
  );
});
