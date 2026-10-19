# iPad Pro 12.9 retest (2026-10-19)

Quiet machine after `xcrun simctl shutdown all`. App: `build/qa/v6/dd/.../App.app` (minified web sync).

| Device | iOS | Alive | Brightness t16 / t45 / dark | Notes |
|---|---|---|---|---|
| iPad Pro (12.9-inch) (4th generation) | 27.0 | ✅ | 4.2 / **19.3** / 19.2 | Prior Network Process crash **not reproduced**; content painted by 45s |
| iPad Pro (12.9-inch) (6th generation) | 27.0 | ✅ | **19.5** / 19.3 / 19.2 | First successful run this cycle; painted by 16s |

Raw screenshots + logs: `build/qa/v6/sim/ipad-retry/` (gitignored).
