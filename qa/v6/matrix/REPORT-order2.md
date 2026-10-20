# VaultCap — WebKit matrix Order 2 (2026-10-20)
Harness: `build/qa/webkit-matrix/` (Playwright WebKit emulation). Full shots/results live under `build/qa/webkit-matrix/` (gitignored).
## Totals (probe classify; no stale manual FAIL overrides)
- **light:** 533 ✅ · 203 ⚠️ · 0 ❌ over 46 viewports
- **dark:** 476 ✅ · 260 ⚠️ · 0 ❌ over 46 viewports

## FAIL

**0 FAIL cells** after Duo-open lock padding fix (`css/layout.css` `.lk-bot` + safe-area +8).

## WARN decisions

| WARN | Decision |
|---|---|
| targets <44pt (`.btn-sm`, chips, sheet close) | **accept** — primary CTAs 44; compact chrome |
| text ellipsis on entry-sub / narrow lists | **accept** — intentional truncation; titles wrap at ≤420px |
| contrast <3:1 decorative (`.vc-key-sep`, fav star) | **accept** — separators/decoration only |
| control covered by FAB at scroll-top | **accept** — clears at scroll end |
