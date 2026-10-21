# VaultCap — Lighthouse mobile (v7-fix defect 6)

**Date:** 2026-10-21 · **App:** 5.4.1 · **URL:** `http://127.0.0.1:8765/?demo=1`  
**Raw JSON:** `build/qa/v7/lighthouse/` (gitignored) · `SUMMARY.json`

## Scores (3× honest mobile)

| Run | perf | a11y | bp | seo | LCP | FCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| 1 | 81 | 100 | — | — | 4.0 s | 2.6 s | 0 ms | 0.11 |
| 2 | 79 | 100 | — | — | 3.9 s | 2.6 s | 0 ms | 0.14 |
| 3 | 79 | 100 | — | — | 3.9 s | 2.6 s | 0 ms | 0.14 |
| **Median** | **79** | **100** | | | ~3.9 s | | | |

**Gate ≥90: not met** (honest median **79**; prior v6 Order 2 median was **82**).

## Top 3 LCP causes (run 1, numbers)

1. **Render delay 3500 ms (89% of LCP)** — LCP node `h1.vault-display-title.vault-home-title` on `#pgHome`; load delay/time 0 ms; paint waits on CSS + deferred boot parse/apply.
2. **Render-blocking CSS on critical path** — remaining blocking sheets (`base` / `layout` / `components` / `identity` / `luxe`) keep FCP ~2.6 s; fleet sheets deferred (`capricorn-core`, `themes`, `ios-tokens`).
3. **Unused JS in boot ~128 KB** — `vaultcap.boot.js` ~185 KB on disk (trimmed from ~198 KB by moving branding + onboarding-wizard to app chunk); LH unused-javascript still flags majority of boot as unused on cold home.

## Shipped improvements (5.4.1)

- `data-vc-demo` early home paint (`boot-cache.js`) + critical `#pgHome` shell CSS
- Inline hero SVG (no mark network on LCP path)
- `boot-load.js` loads boot after double-rAF (parse off first paint)
- Fleet CSS deferred; `font-display: optional`; demo banner delayed 5 s; home polish deferred 3.2 s on demo
- Boot trim: branding + onboarding-wizard → app; SW `vaultcap-v97`

## Remaining to reach ≥90

Further cut render-blocking home CSS without reintroducing CLS, and/or shrink boot further so home LCP commits closer to FCP (~2.6 s → perf ~90).
