# MacBook / desktop WebKit matrix (2026-10-19)

Harness: `build/qa/webkit-matrix` with `qa/v6/matrix/devices.js` DESKTOPS. Themes dark + light.

| Device id | Size | Dark | Light | Overflow |
|---|---|---|---|---|
| mac-desk-1280 | 1280×800 | ✅ | ✅ | 0 |
| mac-mb-air13 | 1470×956 | ✅ | ✅ | 0 |
| mac-mb-pro14 | 1512×982 | ✅ | ✅ | 0 |
| mac-mb-air15 | 1710×1107 | ✅ | ✅ | 0 |
| mac-mb-pro16 | 1728×1117 | ✅ | ✅ | 0 |
| mac-desk-1440 | 1440×900 | ✅ | ✅ | 0 |
| mac-desk-1080 | 1920×1080 | ✅ | ✅ | 0 |
| mac-desk-1440q | 2560×1440 | ✅ | ✅ | 0 |

16 screens × 8 devices × 2 themes = **256 probe rows**, **0 doc/body/pb overflow**, **0 wide** in this pass.

Browser zoom 150%/200% and Firefox/Chrome not yet in this harness run (Playwright WebKit only here).
