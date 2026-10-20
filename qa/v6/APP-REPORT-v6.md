# VaultCap — Perfection Loop v6 report

Version: **5.3.1** (build 531) · Branch: `perfection/v6-appstore`  
Date: 2026-10-20 (Order 2 J/K)

## Gates

| Gate | Result | Evidence |
|---|---|---|
| A Inventory | ✅ | `qa/v6/INVENTORY.md` |
| B Baseline | ✅ | prior WebKit + e2e |
| C Native shell | ✅ | FIXED-LIST #1–12; ios/ |
| D Platform behaviour | ✅ | FIXED #1–4, #9–10 |
| E Inputs / pickers | ✅ | ComboPicker FIXED #13–14 |
| F Dynamic Type | ✅ | FIXED #26, #40–45 |
| G Luxury / alignment | ✅ | luxe.css; gallery regen 2026-10-19 |
| H Structure / sample | ✅ | FIXED #31–37 |
| I App Store pack | ✅ | `qa/v6/APP-STORE.md` Finance + claim↔code |
| J Verification | ✅ | e2e prior 165/165; axe 0 serious; **LH mobile 3× median perf 82** (honest, not ≥90); a11y **100**; first-load JS **203 KB** (<250); WebKit matrix Order 2 **0 FAIL** — `qa/v6/matrix/REPORT-order2.md` |
| K Docs / release | ✅ | CHANGELOG/HANDOVER/VERSION/Brain/PROGRESS; tag/push owner-only |

## Bundle split (Order 2)

| Asset | Before | After |
|---|---|---|
| First-load JS (index scripts) | ~911 KB (`vaultcap.bundle.js` 887 KB + boot crumbs) | **203 KB** (`vaultcap.boot.js` 198 KB + storage/boot-*) |
| Deferred | — | `vaultcap.app.js` ~605 KB; tax/zakat/family/documents/ai-import/smart-db via VaultLazy |
| CSP | `script-src 'self'` | unchanged |

## Lighthouse mobile (honest, 3×)

Dir: `build/qa/v6/lighthouse/order2-split/`

| Run | perf | a11y | bp | seo | LCP | JSON |
|---|---|---|---|---|---|---|
| 1 | 82 | 100 | 96 | 100 | 4.1 s | `mobile-run1.report.json` |
| 2 | 82 | 96* | 96 | 100 | 4.1 s | `mobile-run2.report.json` |
| 3 | 81 | 100 | 96 | 100 | 4.2 s | `mobile-run3.report.json` |
| **Median** | **82** | **100** | 96 | 100 | ~4.1 s | `SUMMARY.json` |

\*Run 2 a11y 96 was install-banner gold contrast (before navy/white CTA fix). Post-fix: `mobile-a11y-recheck.report.json` → a11y **100**, contrast **1**.

### Top 3 LCP causes (run 1, numbers)

1. **Render delay 3603 ms (89% of LCP)** — LCP node `img.vc-mark` on `#pgHome`; image load time 0 ms; paint waits on boot/demo shell.
2. **Render-blocking CSS ~1500 ms est.** — `capricorn-core.css` wastedMs **1506**; `luxe.css` **606**; `identity.css` **456**.
3. **Unused JS in boot 145 KB (72% of boot)** — `vaultcap.boot.js` totalBytes **202163**, wastedBytes **144866** (LH unused-javascript).

bp 96 = legible font-size audit (`.home-pill` / 11px labels) — accepted cosmetic.

## Device matrix

| Class | Result | Evidence |
|---|---|---|
| WebKit viewport matrix Order 2 | ✅ 0 FAIL | `qa/v6/matrix/REPORT-order2.md` + `build/qa/webkit-matrix/` (light 533✅/203⚠️/0❌ · dark 476✅/260⚠️/0❌) |
| iPad Pro 12.9 prior | ✅ | `qa/v6/evidence/IPAD-RETRY-2026-10-19.md` |
| MacBook WebKit prior | ✅ | `qa/v6/evidence/MACBOOK-MATRIX-2026-10-19.md` |

## WARN decisions (matrix — layout probe)

| WARN class | Decision |
|---|---|
| N4 `.btn-sm` 36 pt / chips under 44 | **accept** — visual compact; hit-area extended via `::after` where present; full 44 on primary CTAs |
| N5 sheet close 36×44 | **accept** — height 44; width cosmetic on sheet chrome |
| N6 `--lx-text-3` secondary contrast | **accept** with note — decorative/meta labels; primary body uses `--lx-text` / `--lx-text-2` |
| N9 tall lock dead band | **accept** — design (centred lock on tall viewports) |
| Install banner over sheets (web) | **accept** — Capacitor suppresses; web-only PWA prompt |

## Owner-only blockers

- Apple Developer sign-in + signing team  
- ASC submit / TestFlight device  
- Face ID + Keychain-wrapped key (design lock)  
- Push `main` / tag release  
- LH mobile ≥90 (remaining: render-delay on home mark + CSS/boot weight — not claimed)

## Experience Lab

| Area | Status |
|---|---|
| Feature matrix | `qa/v6/FEATURE-MATRIX.md` |
| Personas / motion / pptx / webm | prior v6 evidence under `build/qa/v6/` |
| axe | 0 serious/critical (`build/qa/v6/axe/`) |
| Lighthouse | desktop prior 94; mobile median **82** / a11y **100** (Order 2) |
