# VaultCap device-matrix QA report

**Date:** 2026-07-31 (loop 2)  
**App:** VaultCap **v5.1.26** · SW `vaultcap-v88`  
**Prompt:** [qa/DEVICE-MATRIX-QA-MASTER-PROMPT.md](../DEVICE-MATRIX-QA-MASTER-PROMPT.md)  
**Harness:** `DEVICE_MATRIX=1 npx playwright test tests/device-matrix.spec.js`  
**Shots:** 112 under `qa/device-matrix/{iphone|ipad|browser}/` · `meta.json` (gitignored PNGs)

Shell breakpoint: **tabs &lt;700px · sidebar ≥700px** (iPad mini 744 → sidebar).

---

## 1. Matrix summary (post-fix loop)

| device-id | layout (majors*) | overflow | verdict |
|-----------|------------------|----------|---------|
| iphone-se … iphone-16-pro-max | mobile-tabs | no | **OK** |
| browser-phone-360 | mobile-tabs | no | **OK** |
| ipad-mini … ipad-pro-13-land | sidebar | no | **OK** |
| browser-sm-laptop … ultrawide | sidebar | no | **OK** · live VER `5.1.26` |

\*Lock + Settings hide tabs/sidebar by design (`neither` in meta — excluded from layout fail).  
`ALL_LAYOUT_OK` on dashboard/banks/family/documents/more-sheet. Viewport contract: **6 passed**.

---

## 2. Fixed this loop (v5.1.26)

| Severity | Issue | Fix |
|----------|-------|-----|
| **High** | `#pgLock` used `max(env(safe-area-inset-bottom, 24px), 24px)` (+ short-height `28px` min) → invented home-indicator gap on home-button SE when inset is 0. Matrix harness had masked it with `!important` inject. | Dual-path `max(env(...), var(--cap-safe-b, 0px))` — zero when safe-bottom is 0; short-height media same |
| — | SW stale CSS risk | CACHE → `vaultcap-v88` · VER **5.1.26** |

Live measure (no harness pad override): SE `padB=0px` · Pro Island `padB=34px`. Sidebar text: `Alex Khan · v5.1.26` matches `window.VER` / `VERSION.json`.

---

## 3. What looks RIGHT (evidence)

- SE lock: keypad full; clock below DEMO; **no fake home-indicator gap** (`padB=0`)
- Pro Island dash: tabs clear of safe-bottom; labels Home/Money/Wealth/Identity/More readable (56×79, not truncated)
- iPad mini: sidebar + VER synced
- Laptop settings: sidebar + Account tabs
- Ultrawide: intentional columns + inspector (no overflow)
- Zero horizontal overflow across 112 meta rows
- Light spot-check SE dashboard: no overflow

---

## 4. Residual (Low only)

| Item | Note |
|------|------|
| Ultrawide density | Optional polish — not blocking |
| Vision OCR on PNGs | Misreads `v5.1.26` as older — trust DOM probe |

**Critical / High open:** none.

---

## 5. Exit criteria

| Criterion | Status |
|-----------|--------|
| Correct layout mode all devices | **Pass** |
| Zero overflow majors | **Pass** |
| Lock / DEMO / island chrome | **Pass** (SE padB=0; Island pad measured) |
| Tabs/sidebar targets + safe-area once | **Pass** |
| Toast/FAB clear of tabs | **Pass** (FAB hidden on dash; prior toast fix) |
| Sidebar VER = VERSION.json | **Pass** (`5.1.26`) |
| Viewport contract | **Pass** |
| REPORT residual Low/empty | **Pass** |
| No Critical/High | **Pass** |

---

## 6. Plans (this change)

- **Architecture:** lock safe-area tokens match DEMO banner dual-path (`env` + `--cap-safe-*`).
- **Refactor:** none beyond `#pgLock` / short-height / switch-vault bottom.
- **Migration:** none.
- **Test:** viewport + DEVICE_MATRIX re-capture.
- **Rollback:** revert `layout.css` / SW `v88` → `v87` / VER `5.1.25`.
