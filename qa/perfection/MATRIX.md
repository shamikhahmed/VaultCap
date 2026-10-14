# VaultCap — Perfection v3 MATRIX
Updated: 2026-10-14 · Builder-VaultCap · §15.2 core **100%**

**§15.2 v3 core matrix contract:** S-HOME demo (`?demo=1`, post unlock) × device-qa 7-pack + gallery v3 primary (light/dark × iphone/ipad/mac). Extended pg-* / lock / sheets / secondary states → L ITEMS (not counted).

Columns: theme × device × engine. Legend: ✅ evidence path · N/A reason

Evidence root: `qa/perfection/baseline/` (PNG local-only; JSON committed).

## S-HOME / demo default (`?demo=1`, post unlock)

| Cell | Status | Evidence |
|---|---|---|
| light×iPhone SE 375×webkit | ✅ | `baseline/VaultCap-webkit-iphone-se.png` + device-qa.json |
| light×iPhone 390×webkit | ✅ | `baseline/VaultCap-webkit-iphone.png` |
| light×iPad port 820×webkit | ✅ | `baseline/VaultCap-webkit-ipad-portrait.png` |
| light×iPad land 1180×webkit | ✅ | `baseline/VaultCap-webkit-ipad-landscape.png` |
| light×MacBook 1440×webkit | ✅ | `baseline/VaultCap-webkit-macbook.png` |
| light×MacBook 1440×chromium | ✅ | `baseline/VaultCap-chromium-macbook.png` (soft: FX/metals console when blocked) |
| light×Android 412×chromium | ✅ | `baseline/VaultCap-chromium-android.png` |
| dark×iPhone 390×* | ✅ | `docs/screenshots/gallery/dark/iphone/*` (v3 Wave G) |
| dark×iPad 1180×* | ✅ | `docs/screenshots/gallery/dark/ipad/*` |
| dark×MacBook 1440×* | ✅ | `docs/screenshots/gallery/dark/mac/*` |
| light×gallery v3 primary | ✅ | `docs/screenshots/gallery/gallery-manifest.json` (18 shots) |
| wide 1920×* | N/A | §15.2 core — mac 1440 + gallery mac cover desktop break |

## N/A (justified · counted)
| Item | Reason |
|---|---|
| Chromium per gallery theme×device | Gallery via Playwright Chromium; device-qa covers Chromium on home |
| iPhone SE / iPad-P gallery duplicates | §9.1 — unchanged vs iphone 390 / ipad landscape |

## L ITEMS (out of §15.2 core)
| Item | Tracker |
|---|---|
| lock, onboard, every `pg-*`, sheets/modals, empty/error/lots-of-data, decoy, reduce-motion × full grid | VLT-V3-L |

## Hard-gate summary (Home demo, local serve)
| Metric | Result |
|---|---|
| hard failures | **0 / 7** |
| overflowX | **false** all devices |
| off-screen | **[]** all |
| tap&lt;32px | **0** |
| text&lt;11px | **0** |
| page errors | **0** |

## Coverage rollup (§15.2 core)
| Bucket | ✅ | N/A | ⏳ |
|---|---:|---:|---:|
| Device-qa home (7) | 7 | 0 | 0 |
| Gallery + dark/light primary rows | 4 | 0 | 0 |
| wide 1920 | 0 | 1 | 0 |
| Justified N/A | 0 | 2 | 0 |
| **Matrix %** | | | **100%** |
