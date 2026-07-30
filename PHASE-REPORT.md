# VaultCap Phase 1–13 Report

**Shipped:** 2026-07-30 · **App:** `5.1.22` · **SW:** `vaultcap-v84`  
**Evidence:** Playwright + live DOM · see `PERF.md`, `QA-MATRIX.md`

### Hotfix / features (5.1.22)
- **Document PDF:** single + multi/visible export via print HTML (name, fields, photos). Local only.
- **Vault switch:** `Store.flush` + drop `sessionKey` before `vo_active_profile` flip; Switch always on lock.

### Prior hotfix (5.1.21)
SW HTML-poison for JS → `InstallPrompt` dead — fixed `offlineAsset` + `window.InstallPrompt`.

---

## Phase status (honest)

| Phase | Status |
|-------|--------|
| 1 Discover | Done — `AUDIT.md` |
| 2 Code health | Partial — SSOT/CSP; ~1470 inline styles deferred L |
| 3 IA | Done — Settings + `IA-RATIONALE.md` |
| 4 Design system | Partial — sheet tokens; not every screen rebuild |
| 5 Forms | Verified existing |
| 6 Platforms | Partial — viewport/theme tests |
| 7 A11y | Partial — suite extended |
| 8 Perf | Done budgets doc — `PERF.md` |
| 9 Security | Mostly — plaintext gate; PIN=KDF = L |
| 10 Offline/API | Partial — SW tests; rates network optional |
| 11 Personas | Partial — suite cover |
| 12 Docs/gallery | Docs done; gallery CAPTURE = L |
| 13 Final | Bounded closeout + QA-MATRIX core |

## Appendices
- A/B/C: partial / pre-exist / docs updated  
- D: `QA-MATRIX.md` core journeys (not exhaustive every control)  
- E auth cloud: SKIP (local PIN)  
- F: `PERF.md`  
- G: integrity/currency suites; full NW independent recompute = L  
- H: icons OK; gallery regen = L  
- I push: SKIP  
- J i18n: SKIP EN-only  
- K analytics: SKIP privacy  
- L update: v5.1.22 + SW v84; push with this wave  

## Deferred L
PIN-as-KDF · full inline-style purge · full gallery CAPTURE · exhaustive click-all

## Commits (wave)
See `git log` — includes AUDIT → IA → polish → banner → **docs PDF + vault switch 5.1.22**
