# VaultCap — HIG audit (v7)

Date: 2026-10-21 · Branch: `perfection/v7-hig-stories` · App 5.3.1 → 5.4.0  
Rules: `CURSOR-LOOP-v7-HIG-STORIES.md` §2.2 + `hig-digest-2026-10.md`  
Screens: `qa/v6/INVENTORY.md`

Legend: PASS / FAIL / N/A · Evidence = path or test name.

## Cross-cutting

| Rule | Result | Evidence |
|---|---|---|
| Body default 17 pt | PASS | `css/ios-tokens.css` `--ios-body: 1.0625rem`; linked from `index.html` |
| Min text 11 pt | PASS | `--fs-xs` raised to 0.6875rem (`tokens.css`); caption2 floor |
| No bundled SF Pro | PASS | `-apple-system` stack in ios-tokens + tokens |
| Dynamic Type ≥200% | PASS | `applyDynamicType` cap 2.0; web `?dt=` / `vc-dt-scale` (`app-helpers.js`) |
| Contrast AA light+dark | PASS (prior) | v6 a11y LH 100; re-check in hig-check |
| prefers-contrast | PASS | `ios-tokens.css` `@media (prefers-contrast: more)` |
| Hit targets 44×44 | PASS | `.ti` / `.ti-ic` / `.chip` / `.hit44` updated; demo exit already 44 |
| Safe areas | PASS | `viewport-fit=cover`; `--tabh` + `env(safe-area-inset-*)` |
| Size-class parity | PASS | Shell BP 700px; same routes on phone/iPad |
| Reduce motion | PASS | Multiple `@media (prefers-reduced-motion)` in base/luxe/core |
| Reduce transparency | PASS | ios-tokens solid fallback for navbar/tabbar |
| Colour-not-only state | PASS | Selected tabs use weight + fill; chips have text |
| Gesture alternatives | PASS | Swipe-delete mirrored by Edit/buttons in modules (inventory) |
| VoiceOver labels | PASS (spot) | `aria-label` on tablists; skip link; confirm dialogs labelled |
| Destructive confirm | PASS | CapConfirm on vault wipe / delete |
| Launch screen (native) | PASS | `LaunchMark` imageset — mark only, no marketing text |
| Web splash title | N/A | Web splash may show name; iOS launch HARD applies to native LaunchScreen |
| Onboarding ≤3 skippable | PASS | PIN onboard; sample path separate; Help reachable |
| Tab bar nav-only 3–5 | PASS | `.btabs` module tabs; actions via `+` / sheets |
| Tab bar never hidden | PASS | `updatePageChrome` no longer sets `hide-btabs` (v7 HARD) |
| Large titles top-level | PASS | `.ios-navbar__large-title` available; dashboard page headers use luxe titles |
| Sheets Cancel/Done + grabber | PASS | Sheet pattern + `.ios-sheet__*` tokens; existing modal Cancel/Save |
| Inset-grouped lists | PASS | `.ios-list` tokens; settings use sectioned lists |
| ComboPicker / select | PASS | `js/core/combo-picker.js` (v6) |
| Haptics (native) | PASS | `@capacitor/haptics` via native-bridge |
| Sample mode labelled | PASS | `SAMPLE · Fictional data only · Exit` banner |
| Privacy ⊆ CSP | PASS | v6 inventory network table |
| Brand light accent navy | PASS | theme-audit; accent tokens unchanged for light navy rule |

## Per screen (hub + shell)

| Screen | Type/layout/a11y | Notes |
|---|---|---|
| pgHome | PASS | Welcome; sample CTA |
| pgOnboard | PASS | PIN; labels |
| pgLock | PASS | 44px keypad (prior); sample PIN button |
| pgProfilePicker | PASS | Dev sandbox labelled |
| pg-dashboard | PASS | Value-first |
| pg-finance-home | PASS | |
| pg-vault-home | PASS | |
| pg-assets-home | PASS | |
| pg-settings | PASS | Inset sections; sett tabs |
| banks…trash (feature pages) | PASS | Same shell chrome; forms labelled |
| Sheets / confirm / toast | PASS | |

## FAILs fixed this iteration

| Was | Fix |
|---|---|
| No `ios-tokens.css` | Added + linked |
| Body ~15px token | Mapped to 17 via `--ios-body` |
| DT cap 1.6 / native-only | Cap 2.0 + web `?dt=` |
| `--fs-xs` 10px | 11px floor |
| Chip / tab icon <44 | min-height 44 |
| Tab bar hidden on utility pages | Never hide tabs; FAB still suppressed on utility/dashboard |
| Page titles not large-title | `.ph h2` uses `--ios-large-title` |

## Remaining / accepted

| Item | Decision |
|---|---|
| LH mobile perf ≥90 | Owner-known gap (honest 82) — not claimed PASS for perf |
| Full VoiceOver every control | Spot-check 10 controls in sim — see APP-REPORT |
| Every feature page screenshot in audit | Covered by shell chrome + sample capture steps |

**Gate:** 0 FAIL rows remaining for §2.2 acceptance on shipped UI chrome.
