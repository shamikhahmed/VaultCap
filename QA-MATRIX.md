# VaultCap QA Matrix (core journeys)

**App:** 5.1.24 · **Scope:** core interactive paths + device-matrix majors · **Runner:** Playwright chromium + live DOM

| Screen | Element | Expected | Actual | Pass |
|--------|---------|----------|--------|------|
| Lock | PIN keypad | Unlock demo with 123456 | smoke + demo-unlock | Pass |
| Device matrix | 16 devices × 7 majors | Shell BP 700; iPad mini sidebar; no overflow | device-matrix REPORT | Pass |
| Crypto | DEK wrap | After unlock `vos_kdf_mode=wrapped`; re-unlock keeps banks | vault-kdf-wrap | Pass |
| Lock | Switch Vault | Always visible; opens profiles | vault-switch.spec | Pass |
| Click-all | Pages+sheets+forms+settings | No fatal errors; docs PDF toolbar | click-all.spec | Pass |
| Vault Profiles | Demo / My Vault row | Flush then reload; `vo_active_profile` flips | vault-switch.spec | Pass |
| Home | Nav modules | Reach banks/cards/docs ≤2 taps | smoke / full-navigation | Pass |
| Documents | Select | Enter multi-select mode | doc-pdf.spec | Pass |
| Documents | Export visible PDF | Popup HTML with Print / Save PDF | doc-pdf.spec | Pass |
| Documents | Export selected (N) | N sections + holder names | doc-pdf.spec | Pass |
| Document detail | Export PDF | Single-doc pack with photos | buildPdfHtml unit via evaluate | Pass |
| Settings | 7 tabs | Account…About order | settings-tabs / click-all | Pass |
| Settings | Switch (Vault Profiles) | Opens same switcher | Settings row wired | Pass |
| Privacy | Financial Summary PDF | Existing ExIm.exportPDF | export-security / GUIDE | Pass |
| Privacy | Plaintext export | Requires `EXPORT PLAINTEXT` | export-security | Pass |
| Install banner | Close | Dismisses + LS flag | install-banner.spec | Pass |
| Install banner | Bundle under SW | JS not HTML | install-banner poison test | Pass |
| A11y | Sheets / FAB / reduced-motion | Landmarks + ≥40px targets | a11y.spec | Pass |
| Offline | Warm cache re-nav | banks↔cards without network | perf-offline | Pass |
| Theme | Light accent | Ink `#0a1220` not fad blue | theme-audit | Pass |

## Failures fixed this wave
- PIN-as-KDF offline entropy → **DEK wrap**
- Vault switch without flush → fixed earlier
- Document PDF missing → fixed earlier
- Inline style debt → **57% extracted** to `vc-ix-*`

## Out of scope (still L)
- Drop `style-src 'unsafe-inline'` (residual uniques)
- Every hover micro-state
- App stores
