# World catalog logos (offline / zero-knowledge)

VaultCap never fetches logos from Google, Clearbit, or DuckDuckGo **at runtime**.
`LogoEngine` resolves: bundled `assets/banks/{slug}.png` → optional privacy proxy (user opt-in) → initials tile.

## Build-time pipeline

```bash
npm run logos:fetch
# = node scripts/fetch-bank-logos.mjs
```

`scripts/fetch-bank-logos.mjs` (developer machine only) pulls marks into `assets/banks/` from:

1. Curated domains in `js/core/bank-catalog.js` + `branding.js`
2. `web` fields on `data/world-*.json` (banks, carriers, brokers, cards, emails, subs)

Cities (`world-cities.json`) are skipped — no website domains.

Network calls stay on the build machine. Commit only curated / reviewed PNGs; do not mass-commit thousands of weak favicons without a review pass.

## Zero-knowledge lock

- No runtime CDN logo fetches on the client
- Optional Cloudflare logo proxy remains opt-in (`LogoEngine` privacy proxy), off by default path prefers local files
- Extending `extractDomains()` does not change client network behaviour
