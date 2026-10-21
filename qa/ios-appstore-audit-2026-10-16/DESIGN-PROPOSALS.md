# VaultCap — premium design proposals (for approval before any code)

Keep: midnight `#060a12` + gold `#D4A017` identity, gold shield-keyhole mark (`icons/mark.svg`), dark-first. Change: make every first-impression screen feel like one calm, native, expensive product instead of a busy web page.

## 0. Foundations (applies everywhere)

| Area | Today (observed) | Proposal |
|---|---|---|
| Type | Mixed: Cinzel-style wide caps on home ("VAULTCAP"), SF bold on welcome ("VaultCap"), letter-spaced small caps on lock, 842 hard-coded `px` sizes, no Dynamic Type | One scale on SF Pro (system-ui): Large Title 34/41 bold, Title 1 28/34 bold, Title 2 22/28 semibold, Headline 17/22 semibold, Body 17/22, Callout 16/21, Subhead 15/20, Footnote 13/18, Caption 12/16. Base `html { font: -apple-system-body }` so iOS Text Size scales it. Wordmark only in the logo lockup, never as body text. Numbers: `font-variant-numeric: tabular-nums`. |
| Colour surfaces | Many cards with gold 1 px borders compete for attention | 3 surface levels only: `--bg #060a12`, `--surface #0d1524`, `--surface-raised #141e31`. Borders `rgba(255,255,255,.08)`. Gold reserved for **one** primary action per screen + brand mark + positive totals. |
| Radius / spacing | Two radius scales (`--r*` and `--r-*`), mixed card paddings (some 0, see Settings card) | Radius 12 (controls), 16 (cards), 24 (sheets). 8-pt spacing grid: 8/12/16/24/32. Card padding 16, section gap 24, screen gutter 16 (20 on Pro Max/Air/iPad). |
| Icons | Sheet close renders "+", toast info uses magnifier, mixed stroke widths | One line icon set at 1.75 stroke, 24 pt grid; close = "xmark", info = "info.circle". |
| Motion | `breathe`, float, slide-ins on many elements | One spring for screens (220 ms), one fade for content (150 ms); "breathe" only on the lock mark; honour Reduce Motion. |
| Haptics | Plugin installed, used sparingly | Light impact on key press, success notification on unlock/save, warning on wrong PIN. |

## 1. Launch screen + splash

- **Native LaunchScreen.storyboard**: midnight background with the gold mark centred (64 pt), nothing else. Shows instantly and covers the WebView spin-up, so the launch never looks frozen (current: empty `Splash.imageset`, plain dark for several seconds in the simulator).
- **Web splash** (first launch only, ≤ 600 ms): the same mark in the same position, so the hand-off is seamless. Then cross-fade to welcome. No progress bar, no tagline, no wordmark animation.

## 2. Welcome / onboarding

Current: 7-dot progress, three pill badges, two CTAs, long copy; on iPhone SE content runs under the status bar and a toast covers "Create vault".

Proposal (3 screens, not 7):
1. **Promise**: mark (56 pt) → Large Title "Your private vault" → one Body line "Banks, IDs and documents, encrypted on this iPhone." → three icon rows (Lock "Encrypted on device", Wifi-slash "Works offline", Person-slash "No account"), each Subhead. CTA "Create my vault" (gold, full-width, 52 pt, 16 radius). Secondary text button "Restore from backup".
2. **Set PIN**: native-feeling 6-dot PIN with the same keypad as the lock screen (no text fields, no keyboard), confirm on the second pass with a gentle shake on mismatch. Optional "Use Face ID" toggle below once native biometrics land.
3. **Recovery key**: key in a single-line monospace capsule split into 4×8 groups (no orphan wrap), "Copy" and "Save to Files" buttons, checkbox styled as iOS toggle row "I've stored this key safely". Then straight to dashboard with a one-time "Add your first item" sheet.
- Country/currency and modules move to a skippable "Personalise" card on the dashboard instead of blocking onboarding.
- No toasts during onboarding; inline helper text only.

## 3. Lock screen

Done today: gold mark, Switch Vault in-flow. Next:
- Remove the big 21:28 clock (iOS already shows time; it pushes the keypad down on small phones).
- Layout top→bottom: mark 56 pt, "VaultCap" Headline, greeting Subhead ("Welcome back, Sara"), 6 PIN dots (12 pt, 16 gap), keypad 3×4 with 76 pt circular keys and 16/24 gaps, bottom row: Face ID (left), 0, delete (right). Under keypad: one text row "Forgot PIN · Switch vault · Emergency" separated by middle dots (all 44 pt targets).
- The panic button (red top-right) moves into a long-press on the mark, so the screen has no red at rest.
- Wrong PIN: dots shake + warning haptic, counter text only after 3 failures.

## 4. Returning-user home (pre-unlock)

Current: home with feature grid + appearance picker before unlock (feels like a marketing page and reveals nothing useful). Proposal: skip it; go straight to the lock screen. Move "guided demo" to the welcome screen ("Explore a sample vault") and appearance to Settings.

## 5. Dashboard

Current: greeting + currency + menu, filter chips, "Finish profile" card, "Start here" card, "Vault needs attention 47/67%", "Chamber floor" tiles, backup toast on top of tiles.

Proposal:
- **Header**: Large Title "Good evening, Sara" (no "User" placeholder → use "Good evening" alone if no name), right side one avatar button (opens profile/settings), currency as a small segmented control inside the net-worth card.
- **Hero card**: Net worth (tabular, 34 pt bold) with privacy eye toggle, 30-day delta chip (green/red), sparkline. Long-press to hide.
- **Attention strip** (only when needed): one row, e.g. "Back up your vault · Last backup never" with gold "Back up" button. Replaces toast + "Vault needs attention" + "Finish profile" cards (merge into a single prioritised list of at most 3 items).
- **Your vault** grid: 2-column large tiles (Money, Wealth, Identity, Family) with count + last-updated line; drop "Chamber floor" wording.
- **Upcoming** list: next 3 expiries / bills / reminders with dates.
- Empty state: one illustration-free card "Add your first account" with 4 quick-add buttons (Bank, Card, Document, Investment).
- Bottom tab bar: keep 5 tabs; selected = gold icon + label, no gold pill background (more iOS-native).

## 6. Sheets, forms, settings

- Sheets: grabber, Title 2 centred, close "xmark" top-right (fixes "+" icon), primary button pinned above the home indicator.
- Forms: grouped inset rows like iOS Settings (label left, value right), country/currency as pickers in a single "Region" row, bank autofill only on exact/known match with a "Use Emirates NBD details?" confirmation chip (fixes UX-1).
- Settings: grouped list instead of 7 horizontal pill tabs (tabs scroll off-screen on phones). Sections: Account, Security (PIN, Face ID, auto-lock, decoy, panic), Backup, Privacy & network, Appearance, About & legal. Fix "Complete your profile" card padding.

## 7. iPad

- ≥ 700 pt width: sidebar (exists) + content max width 720 pt, centred; dashboard tiles 3–4 columns; lock screen keypad max width 360 pt centred; Split View 1/3 falls back to phone layout.

## 8. Delivery plan

1. Approve direction (this doc).
2. Static mockups for splash, welcome ×3, lock, dashboard (empty + populated), as an artifact for review.
3. Implement behind the existing CSS token system (tokens first, then screens), with visual regression via the WebKit matrix.
