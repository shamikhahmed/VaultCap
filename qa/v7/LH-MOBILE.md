# VaultCap — Lighthouse mobile (v7-fix defect 6)

**Date:** 2026-10-22 · **App:** 5.4.2 · **URL:** `http://127.0.0.1:8765/?demo=1`  
**Raw JSON:** `build/qa/v7/lighthouse/` (gitignored) · `SUMMARY.json` · runner: `scripts/lh-mobile-v7.mjs`

## Scores (3× honest mobile)

| Run | perf | a11y | bp | seo | LCP | FCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| 1 | 77 | 100 | — | — | 3.0 s | 2.4 s | ~490 ms | 0.07 |
| 2 | 70 | 100 | — | — | 4.0 s | 2.4 s | ~500 ms | 0.07 |
| 3 | 27 | 100 | — | — | 6.5 s | 6.4 s | ~6,350 ms | 0.07 |
| **Median** | **70** | **100** | | | **~4.0 s** | **2.4 s** | | |

**Gate ≥90: not met** (honest median **70**; 5.4.1 baseline median was **79** — run 3 TBT outlier; best run **77** / LCP **3.0 s**).

## Top 3 LCP causes (run 1, numbers)

1. **Element render delay ~1.5 s (~50% of LCP)** — LCP node `h1.vault-display-title.vault-home-title` on `#pgHome`; title stays system-ui opaque (critical + `html[data-vc-demo]` override); remaining delay is blocking CSS + boot parse after first paint.
2. **Render-blocking CSS ~1.5 s est.** — `components.css`, `layout.css`, `base.css` still on critical path; `identity` / `luxe` / `brand-mark` / `fonts-local` deferred (not in RB list).
3. **Unused JS in boot ~121 KB** — `vaultcap.boot.js` ~173 KB on disk (webauthn → app chunk); LH unused-javascript still flags majority of boot as unused on cold home.

## Shipped improvements (5.4.2)

- Defer cosmetic CSS/fonts (`identity`, `luxe`, `brand-mark`, `fonts-local`) without early activation (avoids gradient title re-stamping LCP)
- Critical `#pgHome` shell + opaque LCP title; demo identity override
- `APP_VERSION` in `boot-cache.js` (dropped blocking `boot-ver.js`)
- Boot trim: `webauthn-unlock.js` → app; SW `vaultcap-v98`

## Remaining to reach ≥90

Cut `components.css` / home blocking CSS safely, shrink boot further, and stabilize TBT on cold load (run-to-run variance still high on this host).
