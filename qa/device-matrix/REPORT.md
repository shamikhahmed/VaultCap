# VaultCap device-matrix QA report

**Date:** 2026-07-30 (loop re-verify)  
**App:** VaultCap **v5.1.25** · SW `vaultcap-v87`  
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
| browser-sm-laptop … ultrawide | sidebar | no | **OK** · live VER `5.1.25` |

\*Lock + Settings hide tabs/sidebar by design (`neither` in meta — excluded from layout fail).  
`ALL_LAYOUT_OK` on dashboard/banks/family/documents/more-sheet. Viewport contract: **6 passed**.

---

## 2. Fixed this loop (v5.1.25)

| Severity | Issue | Fix |
|----------|-------|-----|
| **High** | DEMO banner ignored Chromium `--cap-safe-t` inject → Island/notch QA looked flush-top | `#demoBanner` + phone `.ph` use `max(env(safe-area-inset-top), var(--cap-safe-t))`; harness remounts `--demo-banner-h` after inject |
| — | SW stale CSS risk | CACHE → `vaultcap-v87` · VER **5.1.25** |

Live measure (iPhone 14 Pro): `padding-top: 67px` (= 8+59), `--cap-safe-t: 59px`. Sidebar text: `Alex Khan · v5.1.25` matches `window.VER` / `VERSION.json`.

---

## 3. What looks RIGHT (evidence)

- SE lock: keypad full; clock below DEMO; home-button (no fake home-indicator gap)
- Pro Island dash: tabs clear of safe-bottom; labels Home/Money/Wealth/Identity/More readable
- iPad mini: sidebar + VER synced
- Laptop settings: sidebar + Account tabs
- Ultrawide: intentional columns + inspector (no overflow)
- Zero horizontal overflow across 112 meta rows

---

## 4. Residual (Low only)

| Item | Note |
|------|------|
| Ultrawide density | Optional polish — not blocking |
| Vision OCR on PNGs | Misreads `v5.1.25` as `v5.1.20`/`v5.1.0` — trust DOM probe |

**Critical / High open:** none.

---

## 5. Exit criteria

| Criterion | Status |
|-----------|--------|
| Correct layout mode all devices | **Pass** |
| Zero overflow majors | **Pass** |
| Lock / DEMO / island chrome | **Pass** (pad measured) |
| Tabs/sidebar targets + safe-area once | **Pass** |
| Toast/FAB clear of tabs | **Pass** (prior + re-capture) |
| Sidebar VER = VERSION.json | **Pass** (`5.1.25`) |
| Viewport contract | **Pass** |
| REPORT residual Low/empty | **Pass** |
| No Critical/High | **Pass** |

---

## 6. Plans (this change)

- **Architecture:** safe-area token dual-path (`env` + `--cap-safe-t`) for real device + Chromium matrix.
- **Refactor:** none beyond banner/header CSS.
- **Migration:** none.
- **Test:** viewport + DEVICE_MATRIX re-capture.
- **Rollback:** revert `layout.css` / `device-matrix.js` / SW `v87` → `v86`.
