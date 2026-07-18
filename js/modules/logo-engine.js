'use strict';
/**
 * LogoEngine — privacy-first bank logos (mirrors RatesEngine pattern).
 *
 * Resolve order:
 *  1. Bundled local file  assets/banks/{slug}.png   (zero network)
 *  2. IndexedDB cache      (prior privacy-proxy fetch)
 *  3. Privacy proxy        (optional CF worker — server fetches, client never hits Google)
 *  4. Initials tile        (last resort; branded color when known)
 *
 * Client never calls google.com / clearbit / duckduckgo directly.
 */
const LogoEngine = {
  _DB: 'vaultcap_logos',
  _STORE: 'logos',
  _PROXY_KEY: 'vo_logo_proxy',
  _DEFAULT_PROXY: 'https://vaultos-llm-proxy.shamikhahmed.workers.dev',
  _mem: Object.create(null),
  _pending: Object.create(null),
  _dbp: null,

  slug(domain) {
    return String(domain || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  },

  localUrl(domain) {
    if (!domain) return null;
    return `assets/banks/${this.slug(domain)}.png`;
  },

  proxyUrl() {
    try {
      const u = (S && S.user && S.user.logoProxyUrl) || localStorage.getItem(this._PROXY_KEY) || '';
      if (u.trim()) return u.trim().replace(/\/$/, '');
    } catch (e) {}
    return this._DEFAULT_PROXY;
  },

  setProxyUrl(url) {
    try {
      localStorage.setItem(this._PROXY_KEY, String(url || '').trim());
      if (typeof S !== 'undefined' && S.user) S.user.logoProxyUrl = String(url || '').trim();
    } catch (e) {}
  },

  domainFor(bankName) {
    if (!bankName) return null;
    if (typeof bankDomain === 'function') {
      const d = bankDomain(bankName);
      if (d) return d;
    }
    const cat = (typeof BANK_CATALOG !== 'undefined') ? BANK_CATALOG : {};
    const n = String(bankName).trim();
    if (cat[n]) return cat[n];
    const lc = n.toLowerCase();
    for (const [k, v] of Object.entries(cat)) {
      if (k.toLowerCase() === lc) return v;
      if (lc.includes(k.toLowerCase()) || k.toLowerCase().includes(lc)) return v;
    }
    return null;
  },

  _db() {
    if (this._dbp) return this._dbp;
    this._dbp = new Promise((resolve, reject) => {
      const req = indexedDB.open(this._DB, 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this._STORE)) db.createObjectStore(this._STORE);
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = (e) => reject(e.target.error);
    });
    return this._dbp;
  },

  async _cacheGet(domain) {
    try {
      const db = await this._db();
      return await new Promise((resolve, reject) => {
        const r = db.transaction(this._STORE, 'readonly').objectStore(this._STORE).get(domain);
        r.onsuccess = () => resolve(r.result || null);
        r.onerror = () => reject(r.error);
      });
    } catch (e) {
      return null;
    }
  },

  async _cachePut(domain, blobUrl) {
    try {
      const db = await this._db();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(this._STORE, 'readwrite');
        tx.objectStore(this._STORE).put({ url: blobUrl, at: Date.now() }, domain);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {}
  },

  async _fetchViaProxy(domain) {
    const base = this.proxyUrl();
    if (!base) return null;
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(`${base}/logo?domain=${encodeURIComponent(domain)}&sz=128`, {
        signal: ctrl.signal,
        credentials: 'omit',
      });
      clearTimeout(t);
      if (!res.ok) return null;
      const blob = await res.blob();
      if (!blob || blob.size < 64) return null;
      return URL.createObjectURL(blob);
    } catch (e) {
      return null;
    }
  },

  /** Resolve display URL for a bank. Never calls Google from client. */
  async resolve(bankName) {
    const domain = this.domainFor(bankName);
    if (!domain) return { kind: 'none', url: null, domain: null };

    if (this._mem[domain]) return this._mem[domain];
    if (this._pending[domain]) return this._pending[domain];

    this._pending[domain] = (async () => {
      const local = this.localUrl(domain);
      // Prefer local bundled asset — verify it loads
      const localOk = await this._probe(local);
      if (localOk) {
        const hit = { kind: 'local', url: local, domain };
        this._mem[domain] = hit;
        return hit;
      }

      const cached = await this._cacheGet(domain);
      if (cached && cached.url) {
        const hit = { kind: 'cache', url: cached.url, domain };
        this._mem[domain] = hit;
        return hit;
      }

      const proxied = await this._fetchViaProxy(domain);
      if (proxied) {
        await this._cachePut(domain, proxied);
        const hit = { kind: 'proxy', url: proxied, domain };
        this._mem[domain] = hit;
        return hit;
      }

      const miss = { kind: 'none', url: null, domain };
      this._mem[domain] = miss;
      return miss;
    })();

    try {
      return await this._pending[domain];
    } finally {
      delete this._pending[domain];
    }
  },

  _probe(url) {
    return new Promise((resolve) => {
      if (!url) return resolve(false);
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      setTimeout(() => resolve(false), 2500);
    });
  },

  /** Sync HTML for list renders — local path first; async upgrade via data-logo-bank. */
  html(bankName, size) {
    size = size || 36;
    const s = size + 'px';
    const r = Math.round(size * 0.28) + 'px';
    const domain = this.domainFor(bankName);
    const initials = String(bankName || 'BK').split(/\s+/).map((w) => w[0] || '').join('').toUpperCase().slice(0, 3) || 'BK';
    const color = (typeof brandColor === 'function') ? brandColor(bankName) : '#1a1a2e';
    const fs = Math.round(size * (initials.length > 2 ? 0.28 : 0.35)) + 'px';
    const safeName = String(bankName || '').replace(/"/g, '&quot;');
    const placeholder =
      `<div data-logo-bank="${safeName}" style="width:${s};height:${s};border-radius:${r};background:${color};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:${fs};font-weight:900;color:#fff;font-family:Arial;letter-spacing:-0.5px;overflow:hidden">${initials}</div>`;

    if (!domain) return placeholder;

    const local = this.localUrl(domain);
    // Optimistic local img; onerror keeps initials parent; LogoEngine.hydrate upgrades later
    return `<div data-logo-bank="${safeName}" style="width:${s};height:${s};border-radius:${r};overflow:hidden;flex-shrink:0;background:${color};display:flex;align-items:center;justify-content:center">` +
      `<img src="${local}" alt="" width="${size}" height="${size}" style="border-radius:${r};object-fit:cover;display:block" ` +
      `data-act-error="ActHelpers.hideImgShowNext(this)"` +
      `>` +
      `<span style="display:none;font-size:${fs};font-weight:900;color:#fff;font-family:Arial">${initials}</span>` +
      `</div>`;
  },

  /** After render: upgrade any data-logo-bank nodes via resolve (cache/proxy). */
  hydrate(root) {
    const scope = root || document;
    const nodes = scope.querySelectorAll('[data-logo-bank]');
    nodes.forEach((el) => {
      const name = el.getAttribute('data-logo-bank');
      if (!name) return;
      this.resolve(name).then((hit) => {
        if (!hit || !hit.url || hit.kind === 'local') return; // local already in img
        if (hit.kind === 'none') return;
        const img = el.querySelector('img');
        if (img) {
          img.style.display = 'block';
          img.src = hit.url;
          const span = el.querySelector('span');
          if (span) span.style.display = 'none';
        } else {
          el.innerHTML = '';
          const i = document.createElement('img');
          i.src = hit.url;
          i.alt = '';
          i.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block';
          el.appendChild(i);
        }
      }).catch(() => {});
    });
  },
};

window.LogoEngine = LogoEngine;
