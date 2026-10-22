# VaultCap — Lighthouse mobile (v7-fix defect 6)

**Date:** 2026-10-22 · **App:** 5.4.3 · **URL:** `http://127.0.0.1:8765/?demo=1`  
**Raw JSON:** `build/qa/v7/lighthouse/` (gitignored) · `SUMMARY.json` · runner: `scripts/lh-mobile-v7.mjs`

## Scores (3× honest mobile)

| Run | perf | a11y | bp | seo | LCP | FCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| 1 | 95 | 100 | 100 | 100 | 2.9 s | 1.2 s | ~10 ms | 0.041 |
| 2 | 95 | 100 | 100 | 100 | 2.9 s | 1.2 s | ~10 ms | 0.041 |
| 3 | 95 | 100 | 100 | 100 | 2.9 s | 1.2 s | ~10 ms | 0.041 |
| **Median** | **95** | **100** | | | **2.9 s** | **1.2 s** | | |

**Gate ≥90: met** (honest median **95**; best **95** / LCP **2.9 s**; prior 5.4.2 median was **70**).

## Top 3 LCP causes (run 1 / typical, numbers)

1. **Element render delay ~0.25–1.1 s** — LCP node `h1.vault-display-title.vault-home-title` on `#pgHome`; remaining delay is boot parse after first paint (not blocking CSS).
2. **Boot JS unused ~97 KB of ~126 KB** — `vaultcap.boot.js` still flagged by unused-javascript on cold home (trim remaining: vault-utils / act-delegate / router surface).
3. **Head sync scripts ~300 ms est. RB** — `boot-cache.js` + `boot-load.js` still on critical path (required for demo flag / deferred inject).

## Shipped improvements (5.4.3)

- Defer `base` / `layout` / `components` (+ prior cosmetic sheets) via `media=print` until 5.5s or first input
- Critical shell CSS: opaque LCP title, skip-link, focus-visible, home CTA/pills, install-banner touch targets; hide closed `#cmdPal`
- `storage.js` injected after first paint (with boot) — no longer sync in HTML
- Boot trim: `migrate` / `demo-profiles` / `onboarding-flow` / `icons` → app chunk (~123 KB boot)
- a11y: closed overlays `aria-hidden`; byline contrast; install banner gated until CSS ready
- SW `vaultcap-v99`

## Remaining (optional polish)

Further boot shrink + move head boot-cache work off the critical path without losing demo-before-paint.
