# VaultCap — Lighthouse mobile (v7-fix Order defect 6)

**Date:** 2026-10-21 · **App:** 5.4.1 · **URL:** `http://127.0.0.1:8765/?demo=1`  
**Tooling:** Chrome headless + Lighthouse (MasteryCap `node_modules`), automation flag hidden  
**Raw JSON:** `build/qa/v7/lighthouse/` (gitignored) · `SUMMARY.json`

## Scores (3× mobile)

| Run | perf | a11y | bp | seo | LCP | FCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| 1 | 80 | 100 | 96 | 100 | 4.2 s | 2.7 s | 0 ms | 0.091 |
| 2 | 87 | 100 | 96 | 100 | 3.0 s | 2.6 s | 0 ms | 0.11 |
| 3 | 81 | 100 | 96 | 100 | 4.0 s | 2.6 s | 0 ms | 0.11 |
| **Median** | **81** | **100** | 96 | 100 | ~4.0 s | | | |

**Gate ≥90:** not met (honest median **81**; best single run **87**).

## Changes shipped (vs v6 Order 2 median 82)

- Early demo home via blocking `boot-cache.js` → `html[data-vc-demo]` + critical CSS (before boot parse)
- `boot-load.js`: double-rAF then inject `vaultcap.boot.js` (boot ~180 KB minified; branding/onboarding-wizard moved to app chunk)
- Demo banner delayed 5s (was inflating CLS)
- Hero mark: inline SVG; filter/float deferred via `.vc-mark-ready`
- `font-display: optional` on local fonts
- SW `vaultcap-v97`

## Top 3 LCP causes (still &lt;90) — numbers from run 1 / shared

1. **Render delay 3738 ms (89% of LCP)** — LCP node `h1.vault-display-title` on `#pgHome`; element is in DOM early but final LCP timestamp waits on main-thread/CSS path after FCP (~2.7 s).
2. **Render-blocking CSS ~1.5–1.8 s est.** — worst offenders: `components.css` wastedMs **~1660–1810**; `luxe.css` **~760–910**; `identity.css` **~600–610**.
3. **Unused JS in boot ~129 KB (70%)** — `vaultcap.boot.js` totalBytes **184706**, wastedBytes **128572** (LH unused-javascript).

## Next levers (not in this diff)

- Further split boot (PIN/crypto only) or stream critical CSS for home-only
- Avoid late LCP candidate upgrades after boot shell polish
- Measure again after components.css home-critical extract
