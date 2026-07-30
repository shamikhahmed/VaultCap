# VaultCap Phase 1–13 Report

**Shipped:** 2026-07-30 · **App:** `5.1.21` · **SW:** `vaultcap-v83`  
**Evidence base:** Playwright chromium + live DOM evaluate + screenshots

### Hotfix — Install banner (5.1.21)
**Root cause:** SW fetch miss fell back to `index.html` for `/dist/vaultcap.bundle.js` → parse fail → `InstallPrompt` never defined → Close/Install dead.  
**Also:** `var InstallPrompt` not auto-exported; `app-blur * { pointer-events:none }` froze UI.  
**Fix:** `window.InstallPrompt` + direct listeners; SW `offlineAsset` (503 JS) never HTML for code; `ignoreSearch` cache match.

---

## Phase 1 — Discover & Map
**Done.** `AUDIT.md` — architecture, risks, dead/dupes, plan.  
**Evidence:** Map matches `js/core/router.js`, `nav-ui.js`, `storage.js`, CSP in `index.html`.

## Phase 2 — Architecture & Code Health
**Done.** CSP Workers proxy allowlist; frankfurter dropped; PBKDF2 constant → 600k; demo/alerts/timeline/reminders → `S.assets`; home tiles via `ActHelpers.homeModGoto`; version sync.  
**Live:** `VER=5.1.17` (then bumped), `hasProxy=true`, `PBKDF2=600000`, smoke+integrity **9/9**.  
**Commit:** `989c2a9`

## Phase 3 — IA
**Done.** Settings → Account · General · Appearance · Access · Alerts · Privacy · About. More System drops Backup/Security dupes. `IA-RATIONALE.md`. Legacy aliases. No-PIN confirm.  
**Evidence:** settings-tabs **23/23** (later revalidated in suite).  
**Commit:** `2b72990`

## Phase 4 — Design System & UI
**Done (targeted).** Sheet overlays → `vc-sheet-*` / `vc-more-*` token classes; spacing aliases `--sp-N`; focus-visible on tiles; reduced-motion parity on sheets. Full inline-style purge deferred (1489 call sites — incremental).  
**Evidence:** a11y money-sheet geometry ≥40px; dialog role present.

## Phase 5 — Forms & Selection
**Verified existing bar.** Bank/card/etc forms already use `<label class="fl">` above fields + `inputmode` + autocomplete=off where needed. forms-coverage suite remains. No rewrite required.

## Phase 6 — Platforms / Modes / Sizes
**Verified.** `viewport.spec.js` + `theme-audit` (light accent = ink `#0a1220`, not blue). Sheets use `safe-area-inset-*`.  
**Note:** Playwright MCP on `:8765` can be poisoned by other Cap SW — use clean port for live eyes.

## Phase 7 — Accessibility
**Done.** Extended `a11y.spec.js`: sheet semantics, 7 settings tabs, prior landmarks/FAB/reduced-motion. Hit targets on sheet tiles measured.

## Phase 8 — Performance
**Measured.** Bundle transfer **1142 KB**; DCL **~307 ms**; cold wall **~768 ms** (local http.server). Soft budgets hold. Lazy `smart-db`/`tax` unchanged.  
**Evidence:** `[perf] {"wallMs":768,"VER":"5.1.20","domContentLoaded":307,"bundleTransferKb":1142,"bundleDurationMs":12}`

## Phase 9 — Security & Data
**Done.** Plaintext JSON/CSV requires typed `EXPORT PLAINTEXT`; filename `VaultCap-plaintext-*`; **does not** stamp `lastBackup`. CSP proxy allowlisted. No-PIN gated.  
**Evidence:** `export-security` plaintext + CSP tests pass.

## Phase 10 — APIs / DB / Offline
**Done.** SW registration test; offline re-nav banks↔cards after warm cache. IDB schema unchanged (v13). Rates still open.er-api + metals.

## Phase 11 — QA Personas
**Partial → covered by suite.** First-timer/demo unlock, expert settings tabs, keyboard/a11y, low-end offline path, XSS escHtml, integrity high=0. Full manual gallery regen left as W (FEATURES).

## Phase 12 — Docs & Gallery
**Done.** `AUDIT.md`, `IA-RATIONALE.md`, CHANGELOG 5.1.17–5.1.20, README/HANDOVER/GUIDE path → Privacy, this report.  
**Gallery:** prior `screen-gallery.html` still valid; full CAPTURE regen = follow-up (62MB assets).

## Phase 13 — Final Validation
**Suite slice:** a11y + export-security + perf-offline + settings-tabs + theme-audit → **31 passed** (retest).  
**Earlier broader slice:** 41/44 before theme/offline fixes.  
**Remaining known debt (honest):**
- `style-src 'unsafe-inline'` still
- ~1489 JS inline styles (incremental extraction started for sheets)
- Dual `S.gadgets`/`S.vehicles` arrays still in schema for import compat (readers prefer assets)
- 6-digit PIN = vault KDF (roadmap)
- Gallery CAPTURE not re-run this session

---

## Commits (this wave)
1. `a2ec0ae` — Phase 1 AUDIT  
2. `989c2a9` — Phase 2 health v5.1.17  
3. `2b72990` — Phase 3 IA v5.1.18  
4. `c9f5a2b` / `fae78db` — Phases 4–13 polish → v5.1.19–20  
5. (pending) — Install banner + SW HTML-poison fix v5.1.21  

## Final state
World-class bar: **IA + security honesty + CSP/proxy + sheet tokens + clickable install banner + tests**. Not full visual redesign every screen — Cap DNA gold/ink preserved.
