'use strict';
/* World catalogs — lazy-loaded so thousands of per-country entries stay out of the
   boot bundle. Each runtime file is built from researched sources:
     banks    data/world-banks/*.txt   → scripts/build-world-banks.mjs    → assets/data/world-banks.min.json
     carriers data/world-carriers.txt  → scripts/build-world-carriers.mjs → assets/data/world-carriers.min.json
   Rows: [name, countryCode, type, logoDomain]. Same-origin fetch only; logos resolve
   through LogoEngine (bundled file → initials tile), never a third-party service. */
const WorldCatalog = {
  make(url, evt) {
    return {
      URL: url,
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
            try { document.dispatchEvent(new CustomEvent(evt)); } catch (_) {}
            return this.rows;
          });
        return this._p;
      },
      /** Entries for a country as {n,c,t} (empty until loaded). */
      forCountry(cc) {
        if (!this.rows || !cc) return [];
        const out = [];
        for (const r of this.rows) if (r[1] === cc) out.push({ n: r[0], c: r[1], t: r[2] });
        return out;
      },
      /** Website domain for a name, for logo lookup. */
      domain(name) {
        if (!this._byName || !name) return null;
        return this._byName[String(name).trim().toLowerCase()] || null;
      },
    };
  },

  /** Curated list first, then world entries for the country (and global "OTHER") not already present. */
  merge(base, world, cc) {
    if (world && !world.rows) world.load();
    if (!world || !cc) return base;
    const seen = new Set(base.map(b => b.n.toLowerCase()));
    const extra = world.forCountry(cc).concat(cc === 'OTHER' ? [] : world.forCountry('OTHER'))
      .filter(b => !seen.has(b.n.toLowerCase()) && seen.add(b.n.toLowerCase()));
    return base.concat(extra);
  },
};

const WorldBanks = WorldCatalog.make('assets/data/world-banks.min.json', 'vc:world-banks');
const WorldCarriers = WorldCatalog.make('assets/data/world-carriers.min.json', 'vc:world-carriers');

// Warm the catalogs after first paint; pickers re-read them when they next render.
if (typeof window !== 'undefined') {
  const warm = () => { WorldBanks.load(); WorldCarriers.load(); };
  if ('requestIdleCallback' in window) requestIdleCallback(warm, { timeout: 4000 });
  else setTimeout(warm, 1500);
}
