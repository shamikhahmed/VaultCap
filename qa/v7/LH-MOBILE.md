# VaultCap — Lighthouse mobile (v7-fix)

Attempted further early-paint / boot-cache changes on top of Order 2 split.
**Those changes regressed** median perf to **50** (CLS ~0.49) and were stashed — not shipped.

## Baseline (Order 2, kept on main)

| Metric | Value | Evidence |
|---|---|---|
| Median perf | **82** | `build/qa/v6/lighthouse/order2-split/` |
| a11y | 100 | same |
| First-load JS | ~203 KB boot | `vaultcap.boot.js` |

## Top 3 LCP causes (Order 2 run 1 — numbers)

1. **Render delay 3603 ms (89% of LCP)** — LCP node `img.vc-mark` / home shell; paint waits on boot.
2. **Render-blocking CSS ~1500 ms** — `capricorn-core` ~1506 ms, `luxe` ~606 ms, `identity` ~456 ms wasted.
3. **Unused JS in boot ~145 KB (72% of boot)** — `vaultcap.boot.js` total ~202 KB, wasted ~145 KB.

## v7-fix attempt (stashed)

| Run | perf | a11y | bp | seo | LCP |
|---|---|---|---|---|---|
| 1 | 58 | 100 | 100 | 100 | 4.4 s |
| 2 | 29 | 100 | 100 | 100 | 4.5 s |
| 3 | 50 | 100 | 100 | 100 | 4.4 s |

Median **50** — worse than baseline; stash `v7-fix LH experiment regress median50`. Still **not ≥90**.

Gate: honest documentation complete; ≥90 remains open (owner backlog / further CSS critical-path work without CLS).
