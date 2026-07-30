const CACHE = 'vaultcap-v86';
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

const PRECACHE_PATHS = new Set(
  ASSETS.map((p) => new URL(p, self.location).pathname)
);

function isCodeAsset(url) {
  return /\.(js|css)(\?|$)/i.test(url.pathname);
}

function isPrecachePath(url) {
  return PRECACHE_PATHS.has(url.pathname);
}

/** Never serve HTML for JS/CSS — that poisons the app (InstallPrompt undefined, etc.). */
function offlineAsset(url) {
  const type = /\.css(\?|$)/i.test(url.pathname)
    ? 'text/css'
    : 'application/javascript';
  return new Response('/* VaultCap offline — asset unavailable */\n', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': type, 'Cache-Control': 'no-store' },
  });
}

function matchIgnoreSearch(request) {
  return caches.match(request, { ignoreSearch: true });
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
      matchIgnoreSearch(e.request).then((cached) => {
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

  // Navigations only — SPA/offline shell fallback to index.html
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put('./index.html', copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  if (isPrecachePath(url) || isCodeAsset(url)) {
    e.respondWith(
      matchIgnoreSearch(e.request).then((cached) => {
        const net = fetch(e.request)
          .then((res) => {
            if (res && res.ok) {
              const copy = res.clone();
              // Store under path without query so ?v= bumps still hit ignoreSearch
              const clean = new Request(url.origin + url.pathname);
              caches.open(CACHE).then((c) => c.put(clean, copy)).catch(() => {});
            }
            return res;
          })
          .catch(() => cached || offlineAsset(url));
        return cached || net;
      })
    );
    return;
  }

  e.respondWith(
    matchIgnoreSearch(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).catch(() => {
        if (isCodeAsset(url)) return offlineAsset(url);
        return caches.match('./index.html');
      });
    })
  );
});
