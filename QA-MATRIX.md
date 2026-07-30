# VaultCap QA Matrix (core journeys)

**App:** 5.1.22 · **Scope:** core interactive paths (not every pixel) · **Runner:** Playwright chromium + live DOM

| Screen | Element | Expected | Actual | Pass |
|--------|---------|----------|--------|------|
| Lock | PIN keypad | Unlock demo with 123456 | smoke + demo-unlock | Pass |
| Lock | Switch Vault | Always visible; opens profiles | vault-switch.spec | Pass |
| Vault Profiles | Demo / My Vault row | Flush then reload; `vo_active_profile` flips | vault-switch.spec | Pass |
| Home | Nav modules | Reach banks/cards/docs ≤2 taps | smoke / full-navigation | Pass |
| Documents | Select | Enter multi-select mode | doc-pdf.spec | Pass |
| Documents | Export visible PDF | Popup HTML with Print / Save PDF | doc-pdf.spec | Pass |
| Documents | Export selected (N) | N sections + holder names | doc-pdf.spec | Pass |
| Document detail | Export PDF | Single-doc pack with photos | buildPdfHtml unit via evaluate | Pass |
| Settings | 7 tabs | Account…About order | settings-tabs | Pass |
| Settings | Switch (Vault Profiles) | Opens same switcher | Settings row wired | Pass |
| Privacy | Financial Summary PDF | Existing ExIm.exportPDF | export-security / GUIDE | Pass |
| Privacy | Plaintext export | Requires `EXPORT PLAINTEXT` | export-security | Pass |
| Install banner | Close | Dismisses + LS flag | install-banner.spec | Pass |
| Install banner | Bundle under SW | JS not HTML | install-banner poison test | Pass |
| A11y | Sheets / FAB / reduced-motion | Landmarks + ≥40px targets | a11y.spec | Pass |
| Offline | Warm cache re-nav | banks↔cards without network | perf-offline | Pass |
| Theme | Light accent | Ink `#0a1220` not fad blue | theme-audit | Pass |

## Failures fixed this wave
- Vault switch without flush → cross-DB write risk → **fixed** flush + drop sessionKey
- Switch button hidden for fresh personal users → **always show**
- Document PDF missing → **added** single + multi print pack

## Out of scope (deferred L)
- Exhaustive every-control click of all modules
- Full screen-reader pass every flow
- Gallery CAPTURE regen (~62MB)
