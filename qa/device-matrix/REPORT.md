# VaultCap device-matrix QA report

**Date:** 2026-07-30  
**App:** VaultCap **v5.1.24** · SW `vaultcap-v86`  
**Prompt:** [qa/DEVICE-MATRIX-QA-MASTER-PROMPT.md](../DEVICE-MATRIX-QA-MASTER-PROMPT.md)  
**Harness:** `DEVICE_MATRIX=1 npx playwright test tests/device-matrix.spec.js`  
**Shots:** 112 under `qa/device-matrix/{iphone|ipad|browser}/` · `meta.json`

Shell breakpoint: **tabs &lt;700px · sidebar ≥700px** (iPad mini 744 → sidebar).

---

## 1. Matrix summary (post-fix)

| device-id | layout | overflow | verdict |
|-----------|--------|----------|---------|
| iphone-se … iphone-16-pro-max | mobile-tabs | no | **OK** |
| browser-phone-360 | mobile-tabs | no | **OK** |
| **ipad-mini** | **sidebar** | no | **OK** (was phone tabs) |
| ipad-air-11 … ipad-pro-13-land | sidebar | no | **OK** |
| browser-sm-laptop … ultrawide | sidebar | no | **OK** · VER `v5.1.24` |

`ALL_LAYOUT_OK` from meta probe. Viewport + smoke: **14 passed**.

---

## 2. Fixed this loop

| Issue | Fix |
|-------|-----|
| iPad mini phone chrome | Shell media **699/700** (sidebar/tabs/FAB/toast/main) |
| Toast double safe-area | `.tw` = `var(--tabh) + 12px` only |
| Toast on lock keypad | `body.on-lock`; clear `#toastWrap` in `showLock`; `Toast.show` no-op on lock; integrity toast only if app visible |
| Toast on hide-btabs settings | `body.hide-btabs .tw` safe-bottom only |
| SE lock clock clip | `#lkClock` compact `@media (max-height:720px)` + demo-banner lock pad |
| DEMO vs island | `#demoBanner` `padding-top: env(safe-area-inset-top)` |
| Tab label clip (OCR “Moneu”) | Tighter `.ti` type + letter-spacing |
| DetailsShow glue | `.tap-link { gap: 4px }` |
| Sidebar VER 5.1.22 | `boot-ver` / constants → **5.1.24** |
| Sidebar foot cramped | `.sb-bot` safe-bottom + 44px targets |

---

## 3. What looks RIGHT (evidence)

- SE lock: full keypad (0 / ⌫ / grid) visible; clock not clipped (`iphone-se/lock.png`)
- SE / Pro dashboards: Home · Money · Wealth · Identity · More readable; no integrity toast covering tabs
- iPad mini: desktop sidebar + `v5.1.24` (`ipad-mini/dashboard.png`)
- Laptop settings: sidebar + Account tabs; version synced
- Zero horizontal overflow across matrix

---

## 4. Residual (Low — deferred)

None blocking. Spot later: ultrawide inspector density (optional).

---

## 5. Loop prompt

Use **LOOPING** master prompt: `qa/DEVICE-MATRIX-QA-MASTER-PROMPT.md` (also Brain `AI/Cursor/Cap-Device-Matrix-QA-MASTER-PROMPT.md`). Exit only when exit criteria all true.
