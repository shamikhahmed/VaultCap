'use strict';
/* World bank catalog — lazy-loaded so ~2,300 institutions for 205 countries stay
   out of the boot bundle. Source + research: data/world-banks/*.txt →
   scripts/build-world-banks.mjs → assets/data/world-banks.min.json
   (rows: [name, countryCode, type, logoDomain]).
   Same-origin fetch only; logos resolve through LogoEngine (bundled file → initials). */
const WorldBanks = {
  URL: 'assets/data/world-banks.min.json',
  rows: null,
  _p: null,
  _byName: null,

  /** Starts the fetch once; resolves to the rows (or [] when offline / blocked). */
  load() {
    if (this.rows) return Promise.resolve(this.rows);
    if (this._p) return this._p;
    if (typeof fetch !== 'function') return Promise.resolve([]);
    this._p = fetch(this.URL, { cache: 'force-cache' })
      .then(r => (r.ok ? r.json() : []))
      .catch(() => [])
      .then(rows => {
        this.rows = Array.isArray(rows) ? rows : [];
        this._byName = Object.create(null);
        for (const [n, , , d] of this.rows) if (d && !this._byName[n.toLowerCase()]) this._byName[n.toLowerCase()] = d;
        try { document.dispatchEvent(new CustomEvent('vc:world-banks')); } catch (_) {}
        return this.rows;
      });
    return this._p;
  },

  /** Banks for a country as {n,c,t} (empty until loaded). */
  forCountry(cc) {
    if (!this.rows || !cc) return [];
    const out = [];
    for (const r of this.rows) if (r[1] === cc) out.push({ n: r[0], c: r[1], t: r[2] });
    return out;
  },

  /** Website domain for a bank name, for logo lookup. */
  domain(name) {
    if (!this._byName || !name) return null;
    return this._byName[String(name).trim().toLowerCase()] || null;
  },
};

// Warm the catalog after first paint; pickers re-read it when they next render.
if (typeof window !== 'undefined') {
  const warm = () => WorldBanks.load();
  if ('requestIdleCallback' in window) requestIdleCallback(warm, { timeout: 4000 });
  else setTimeout(warm, 1500);
}
