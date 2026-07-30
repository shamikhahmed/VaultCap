# VaultCap Performance Budgets

**App:** 5.1.22 · **Measured:** 2026-07-30 · **Env:** local `python3 -m http.server` (clean port)

## Hard budgets (fail phase if exceeded on cold local)

| Metric | Budget | Last measured | Status |
|--------|--------|---------------|--------|
| Bundle transfer (`dist/vaultcap.bundle.js`) | ≤ 1300 KB | ~1142 KB | Pass |
| DOMContentLoaded | ≤ 1000 ms | ~307 ms | Pass |
| Cold wall (nav → unlockable lock UI) | ≤ 2000 ms | ~768 ms | Pass |
| Bundle parse/download duration | ≤ 200 ms local | ~12 ms | Pass |

Evidence (prior wave):  
`[perf] {"wallMs":768,"VER":"5.1.20","domContentLoaded":307,"bundleTransferKb":1142,"bundleDurationMs":12}`

## Soft budgets

| Metric | Target | Notes |
|--------|--------|-------|
| Route transition | ≤ 100 ms feel | In-app `R.goto` — no full reload |
| List scroll | Steady 60 fps on mid phone | No virtualization yet; lists stay modest |
| SW code assets | Never HTML fallback | Fixed v5.1.21 (`offlineAsset` 503) |

## Known network (optional)

- FX / metals rates: open.er-api + metals — offline vault still works; rates degrade gracefully
- Bank logos: bundled `assets/banks/` + Workers `/logo` proxy — not on critical path for unlock

## Deferred

- Code-split remaining modules beyond `smart-db` / `tax`
- List virtualization for huge vaults
