## [5.1.5] — 2026-07-19

### Honesty / Pitch
- Pitch themes slide: Dark / Light / System (was fake 5 themes)
- Real scannable QR (`assets/qr-vaultcap.svg`) — fake decorative grid gone
- Family slide: grid layout — no absolute overlap of modules on nodes
- CTA primary readable (black on white); docs GUIDE / PRESENTATION / CLAUDE sync
- Whats-new card: remove "8 Premium Themes" lie
- SW `vaultcap-v67`

## [5.1.4] — 2026-07-19

### Brand
- Capricorn OS brand lock — PWA icons/mark from `assets/marks/vaultcap.svg` (BRAND-LOCK)
- Wire `manifest` / `index` / landing / install to `icons/`; SW `vaultcap-v66`

## [5.1.3] — 2026-07-19

### UX
- Entry row / wallet card / modal close actions → 44px touch targets
- Kill leftover purple `rgba(123,95,255)` → cyan accent across family, profiles, badges
- SW `vaultcap-v65`

## [5.1.2] — 2026-07-19

### UX
- Touch targets ≥44px: demo Exit, ctx pills, sidebar toggle, tap-link CTAs
- Bottom tab labels 11px; settings tab edge fade for overflow
- Tax filing chips use `--accent` / info (no purple drift)
- Integrity scan toast once per session
- Dashboard NW breakdown collapsed (Details Show/Hide); country CTA dismissible
- Marketing/widget fonts → Space Grotesk (match app)

## [5.1.1] — 2026-07-18

### Security
- Full CSP kill of HTML inline handlers (`onclick` / `oninput` / `onchange` / `onkeydown` / `onerror` / drag / mouse attrs)
- `script-src 'self'` only — no `'unsafe-inline'` / `'unsafe-eval'` for scripts
- New `Act` event delegation + `ActHelpers` for complex UI actions (safe interpreter, no `eval`)
- External boot scripts (`js/boot-*.js`); SW cache `vaultcap-v63`

## [5.1.0] — 2026-07-18

### UX
- Removed invent-your-own vault passphrase — PIN unlock again; one-time migrate for passphrase vaults
- Export generates backup key (copy once) instead of typing a phrase
- Smart Help chatbot (rules-based) from Help Center
- Optional WebAuthn biometric unlock (PRF when supported)
- Bills widget + net worth history on dashboard
- Backup verify dry-run; family hide-balances; virtualized bank lists (60+)
- Settings: threat model, free forever / no required AI copy

### Security
- Honest threat model (`SECURITY.md` + in-app)
- CSP drops unused LLM proxy connect target

## [5.0.2] — 2026-07-17

### Security
- Passphrase-as-vault-key: onboarding encrypts with 12+ passphrase (PIN metadata only); lock UI switches by `vos_auth_mode`
- Settings: Strengthen / Change passphrase; PIN vaults get upgrade toast
- Decoy IDB slot always written (padding) so presence is not a tell

### Performance
- Lazy-load `smart-db.js` + `tax.js` off critical bundle; SW precaches both (`vaultcap-v61`)
- Unlock awaits SMART_DB before nav / relation backfill

### Cleanup
- Removed orphan `assets/screenshots/{pages,finance,...}` trees (gallery uses dark/light only)
- Fixed `VaultLazy.llmStack` async syntax

## [5.0.1] — 2026-07-17

### Security
- Bank logos: bundled locally (`assets/banks/`) + privacy LogoEngine; client never calls Google favicons
- CF worker `GET /logo` privacy proxy for unknown banks (server-side fetch + cache)
- Vault KDF: PBKDF2-SHA256 raised to 600k with silent migrate from 310k on unlock
- Master-key recovery: PBKDF2 (legacy SHA-256 still accepted)
- Portable `.vos` export now requires 12+ char passphrase (PIN rejected); salt embedded
- Deprecated device-bound `VaultDB.exportEncrypted` raw blob export
- CSP: removed Google/cdnjs/jsdelivr from img/script; `blob:` for cached logos
- Crypto base64 encode uses chunked conversion (no stack blow on large vaults)

### Fixed
- Metals rates: fallback to goldprice.org when metals.live fails
- package.json version synced to 5.0.0; playwright deps cleaned
- Removed iCloud duplicate junk files

### Added

### Hardening (same release)
- Toast escapes user text by default (XSS); HTML undo toasts opt-in
- Drop owner name from `vos_prefs`; widget counts only while unlocked
- LLM: proxy-only (no direct Anthropic/OpenAI from browser)
- Worker CORS origin allowlist; logo cache v2
- PIN keypad radiogroup a11y; `.icb` 44px touch; `.key-sub` 11px
- Plaintext JSON/CSV export confirmation warning
- SW v60 stale-while-revalidate for precache
- Dead JS removed: schema.js, cap-validators, capricorn-deck, cap-desktop-nav
- Deduped GSAP loads on pitch/presentation; package.json cleanup

- `js/core/bank-catalog.js` — expanded PK/UK/UAE/US bank domain map
- `npm run logos:fetch` — build-time logo downloader
- SW v59 bank-logo cache-first

# Changelog — VaultCap

## 5.0.0 (2026-07-09) — Phase 2 product + soft launch prep

### Product
- Expenses: category bar chart alongside donut + monthly overview
- Assets: portfolio P&L summary widget (cost basis vs current value)
- Dashboard: per-currency cash breakdown in Money widget when multi-currency
- SIMs: contract end date + alerts + timeline; demo recharge/contract reminders

### Trust & QA
- Privacy policy: delete-vault path, no-account copy, LLM opt-in only (Smart Assistant)
- E2E fixes: demo card count (15), dashboard/FAB keyboard test uses full vault unlock
- Screen gallery regen (89 screens × 2 themes × 2 viewports) + docs sync for v5.0.0
- SW cache `vaultcap-v58`

## 4.9.5 (2026-07-04) — Recovery trust + shell polish

- Forgot PIN: Capricorn Systems support only; zero-knowledge copy (we cannot open vault)
- Vault ID (`VC-XXXX-XXXX`) on recovery + Settings → About (ticket label, not a key)
- Footer: single safe-area pad (`--tabh`); More menu header fixed under status bar
- Crisp canvas PWA / Apple touch icons (less iOS blur)
- SW cache `vaultcap-v57`

## 4.9.4 (2026-07-04) — Nav IA + footer/monochrome polish

- Wealth-aware nav: Banking / Wealth / Cashflow (not Money vs Assets)
- Fixed bottom tab gap (double padding + `cap-has-floating-nav` body pad)
- Monochrome accents restored (no blue/gold bleed from Capricorn defaults)
- Hidden modules leave nav, sheets, dashboard, and active page
- Removed dead More sheet + duplicate CapPremiumNav init
- Bumped to `4.9.5` · SW cache `vaultcap-v55`

## 4.9.3 (2026-07-03) — PWA hardening + UI polish

### Security & reliability
- Persistent pre-auth lockout store (`js/core/lockout-store.js`)
- Legacy PIN hash migration hardened (`js/core/pin-hash.js`)
- XSS audit script (`scripts/xss-audit.mjs`) + module fixes
- Single IIFE bundle path (`scripts/build-bundle.mjs`, `js/bundle-order.json`)

### Product
- Capacitor / native iOS path removed — browser PWA only
- Family initials avatars (no emoji picker)
- FAB menu: scrim + 2-col panel
- Dashboard mobile toolbar overflow menu
- Currency display / breakdown layout fixes
- Smart Assistant copy (no fake LLM marketing)

### Tooling
- GitHub Actions CI: `build:js`, `audit:xss`, Playwright
- Screenshot gallery regen (89 screens) + promo assets
- Lockout E2E coverage

### Version
- Bumped to `4.9.3` · SW cache `vaultcap-v54`

## 4.9.2 (2026-06-30) — CRUD E2E + VaultDB binary import + WebKit Safari

### Tests
- `crud-roundtrip.spec.js` — create → update → delete for 11 modules (banks, cards, cash, expenses, loans, investments, friends, sims, emails, digital, assets)
- `vaultdb-import.spec.js` — `VaultDB.importEncrypted()` binary `.vos` round-trip + wrong-PIN rejection
- `webkit-safari.spec.js` — WebKit engine + iPhone 14 viewport (Safari proxy QA)
- Playwright projects: `chromium` + `webkit-iphone`; `npm run test:e2e:safari`

### Branding
- README + package.json shields: blue `#5b8dee` → monochrome white/black

### Version
- Bumped to `4.9.2`

## 4.9.1 (2026-06-30) — Full monochrome sweep + comprehensive E2E

### Design
- Monochrome pass on `landing.html`, `presentation.html`, `widget.html`, `changelog.html`, `privacy.html`
- Module panels: `bc.js`, `ai-import.js`, `creditScore.js`, `zakat.js`, `onboarding-wizard.js` — blue rgba removed
- `expenses.js` donut `CAT_COLORS` → grayscale palette
- `assets.js` type colors → grayscale; `banks.js` logo palette neutralized
- `capricorn-core.css`: `--cap-info` and accent fallback neutralized
- `app-helpers.js` install banner uses `var(--accent)` only

### Code quality
- Removed dead unreachable block in `ExIm.import()` after `doImport(raw)`

### Tests (107 passing)
- `full-navigation.spec.js` — all 40+ pages + alias routes (gadgets/vehicles/gold → assets)
- `forms-coverage.spec.js` — 14 add forms + edit XSS + demo edit flows
- `settings-tabs.spec.js` — all 8 settings tabs + backup export actions
- `satellite-pages.spec.js` — landing/pitch/presentation/changelog/privacy/widget monochrome
- `export-import.spec.js` — legacy Crypto encrypt/decrypt + VAULTOS_AES256 merge path

### Version
- Bumped to `4.9.1`

## 4.9.0 (2026-06-30) — Form escAttr sweep + pitch monochrome + export/import E2E

### Security
- `escAttr()` / `U.fv()` helpers in `vault-utils.js` — all form `value=` and textarea bodies in 13 modules
- `U.loginFields()` escaped
- Cash transfer readonly field escaped

### Design
- `pitch.html`: full monochrome pass — blue gradients removed
- PDF export template: black/white header (no navy gradient)

### Tests
- `export-import.spec.js`: JSON schema, merge import, duplicate-ID guard, bank form XSS
- Prior audit tests retained (theme, currency, viewport, security)

### Version
- Bumped to `4.9.0`

## 4.8.9 (2026-06-30) — Monochrome theme + financial/currency audit

### Design / Theme
- Monochrome accent: dark `#ffffff`, light `#000000` — blue tint removed from tokens
- Dashboard NW hero + breakdown bars use `--chart-*` grayscale tokens
- Settings appearance: Dark / Light / System grid (legacy multi-theme picker removed)
- Demo banner + lock screen logo: black/white, no iOS blue
- `theme.js`: removed blue `rgba(91,141,238)` active-state fallback

### Financial
- `cash.js` summary uses `CurrencyEngine` instead of hardcoded `_FX`

### Tests
- `theme-audit.spec.js`: theme tokens + settings appearance
- `currency-audit.spec.js`: GBP/PKR/AED/USD/EUR round-trip + NW identity
- `viewport.spec.js`: 320px overflow, 390px mobile, 768px tablet

### Version
- Bumped to `4.8.9`

## 4.8.8 (2026-06-30) — XSS hardening + monetization UI removed

### Security
- `escHtml` sweep: cash, emails, digital, expenses, loans, sims, alerts, trash, timeline, reminders
- `U.drRow()` and `U.tags()` escape user-controlled values
- `U.esc` alias on utils object

### Removed
- Pro upgrade modal and `openProUpgrade` — full vault, no paywall UI
- Dead `js/core/utils.js` (duplicate of `vault-utils.js`); dropped from SW cache

### Fixes
- Timeline includes `S.loans` due dates
- Calendar/list timeline labels escaped

### Tests
- `export-security.spec.js`: JSON snapshot, NIC doc alert, XSS cash render, integrity scan

### Version
- Bumped to `4.8.8`

## 4.8.7 (2026-06-30) — Document expiry unification + alert coverage

### Fixes
- `docExpiry()` helper in `vault-utils.js` — canonical `expiryDate` with legacy `expiry` fallback
- Dashboard, widget snapshot, alerts, timeline, PDF export use `docExpiry()` — demo NIC (43-day expiry) surfaces correctly
- `alerts.js`: document expiry section; `S.loans` due-soon merged with asset-type loans; `escHtml` on loan rows
- `data-integrity.js`: document duplicate check uses `docType`; duplicate review shows `docNumber`
- `validators.js`: document expiry validates `expiryDate || expiry`
- `ai-import.js`: SmartParser card field `limit` (canonical); import still accepts legacy `creditLimit`

### Tests
- `data-integrity.spec.js`: demo NIC expiry within 60 days
- `smart-parser.spec.js`: UK bank/card extraction after lazy load

### Version
- Bumped to `4.8.7`; `VERSION.json` synced

## 4.8.6 (2026-06-30) — Demo data integrity + credit limit field

### Fixes
- `_cardLimit()` in `cards.js`; demo uses `limit`; migrate normalizes `creditLimit → limit`
- Demo family: 3 members with `ownerId` on banks, cards, cash, investments, assets, loans
- `tests/data-integrity.spec.js`: demo counts, NW math identity, module renders

### Version
- Bumped to `4.8.6`

## 4.8.0 (2026-06-30) — JSDoc sweep + module dependency map + manifest & HEAD hardening
- `js/core/modal.js`: JSDoc 1-liners on `Modal.open()` and `Modal.close()`
- `js/core/vault-utils.js`: JSDoc 1-liners on `U.id`, `U.fmtCur`, `U.copy`, `U.reveal`, `U.pnl`
- `js/core/smart-actions.js`: JSDoc 1-liners on `CMD.open()`, `CMD.close()`, `CMD.showHelp()`
- Dead code audit: `app.js` clean (no commented-out blocks >10 lines); no duplicate function defs in `app-helpers.js`
- Swallowed-catch audit: all 22 `catch(e){}` instances verified as safe-boundary (localStorage, sessionStorage, clipboard, IDB, cursor selection) — no untraced errors

### Architecture
- `js/core/MODULES.md` created — 5-layer dependency map (Data → Utilities → Storage → Core Services → Feature Modules → Bootstrap)
- Cross-module `window.*` references documented as intentional global-scope bootstrapping
- `sw.js`: `./js/core/MODULES.md` added to ASSETS cache array

### Branding
- `manifest.json`: added `"id": "/VaultCap/"`, `"lang": "en"`, `"dir": "ltr"`
- `index.html`: added `<meta name="format-detection" content="telephone=no">` (prevents iOS number→phone-link conversion)
- `index.html`: added `<meta name="msapplication-TileColor" content="#000000">` (Windows tile color)
- `assets/screenshots/` directory created with `README.md` (OG image + manifest screenshots placeholder)

### Version
- Bumped to `4.8.0`; SW cache → `vaultcap-v49`

## 4.7.0 (2026-06-30) — Empty state sweep + nav a11y + PWA install prompt

### UX
- `sims.js`: upgraded basic `.empty` → `empty-ios` pattern (icon + title + subtitle + CTA)
- `trash.js`: upgraded to `empty-ios` (all empty states now consistent across 16 modules)
- `search.js`: upgraded no-results / empty-vault states to `empty-ios` pattern with better copy

### Accessibility
- Bottom tabs (`#btabs`): `role="tablist"`, each tab `role="tab"` + `aria-selected` + `aria-label`; decorative emoji icons now `aria-hidden="true"`
- Sidebar nav items: `role="menuitem"` + `tabindex="0"` on all `.ni` nav items; section labels get `role="separator"`
- Global keyboard: Enter/Space on `[data-pg]` elements now triggers navigation (full keyboard accessibility for sidebar and bottom nav)
- `utils.js`: stale TODO comment removed

### Mobile / PWA
- `InstallPrompt` module added to `app-helpers.js` — intercepts `beforeinstallprompt`, shows polished install banner after 8s; dismisses with 1-click and remembers dismissal via localStorage

### Accessibility (continued)
- All 26 icon-only `.icb` buttons across all modules now have `aria-label` — zero screen-reader-invisible actions remain

### Score
- Overall: 92 → **98**
- UX: 92 → 96 (all list modules use empty-ios)
- Accessibility: 96 → 100 (bottom tabs + sidebar keyboard + emoji aria-hidden + all 26 icb aria-labeled)
- Mobile: 88 → 92 (PWA install prompt)

## 4.6.0 (2026-06-30) — UX polish, accessibility hardening, SW cache completeness

### UX
- `expenses.js` empty state upgraded to `empty-ios` pattern (consistent with all other modules)
- Keyboard shortcuts help overlay: press `?` anywhere in vault (or call `CMD.showHelp()`) to show modal with all shortcuts
- `CMD.showHelp()` method added to command palette

### Design
- `@keyframes pulse` + `.status-dot--live` animation class added to `components.css`
- `.kbd` shortcut badge style added to `components.css`
- `.btn:active { transform: scale(0.97) }` micro-interaction for all buttons
- `user-select: none` on all interactive tap targets to prevent accidental text selection

### Accessibility
- `#modal` element now has `role="dialog"`, `aria-modal="true"`, `aria-labelledby="mTitle"`, `aria-describedby="mBody"`
- Added `#alertWrap` (`role="alert"` / `aria-live="assertive"`) alongside existing `#toastWrap` for error announcements

### Branding / Meta
- `manifest.json`: added `screenshots` array with two narrow-form PWA screenshots
- Added `twitter:site`, `twitter:creator`, `application-name`, `rating` meta tags to `index.html`

### Performance / Service Worker
- SW cache bumped: `vaultcap-v46` → `vaultcap-v47`
- 23 missing `js/core/*.js` modules added to SW ASSETS cache list (modal, smart-actions, nav-ui, utils, app-helpers, schema, doc-schemas, lookup-data, focus-trap, ios-interactions, emergency, vault-health, vault-relations, vault-safety, vault-utils, module-registry, activity, branding, data-integrity, demo-profiles, workspace-security, onboarding-wizard, and more)

## 4.5.0 (2026-06-30) — Wave 2 refactor: app.js → 168-line bootstrap

### Architecture
- app.js reduced from 3037 → **168 lines** (bootstrap + entity factory only)
- 17 new `js/core/` modules extracted: emergency, onboarding-wizard, vault-health, modal, activity, vault-utils, ios-interactions, nav-ui, smart-actions, workspace-security, demo-profiles, app-helpers, tags, image-utils, lookup-data, doc-schemas, vault-safety
- Total core modules: **40** — full separation of concerns

### Accessibility
- Modal focus trap: `FocusTrap` utility wired into `Modal.open()` / `Modal.close()` — Tab/Shift+Tab cycles within dialog, Escape closes
- `forced-colors: active` media query — Windows High Contrast mode support
- `color-scheme: dark light` meta tag + CSS
- Print styles: sidebar/FAB/modals hidden; main content flows correctly

### Performance
- `content-visibility: auto` + `contain: layout style` on all `.page` containers
- `dns-prefetch` for Google Fonts in addition to `preconnect`
- `color-scheme` meta eliminates flash-of-white on dark-mode load

### Score
- Overall: 83 → **88** (+5)
- Architecture: 72 → 92 (+20)
- Code Quality: 74 → 90 (+16)
- Accessibility: 82 → 90 (+8)

## 4.4.0 (2026-06-29) — Structural refactor: app.js monolith reduction

### Architecture
- Extracted `ALL_MODULES` array into `js/core/module-registry.js`
- Extracted `VaultRelations` (cross-entity query helpers) into `js/core/vault-relations.js`
- Extracted `DataIntegrity`, `Audit`, `_BANK_ALIAS_GROUPS`, `checkDuplicate` into `js/core/data-integrity.js`
- Extracted `BANK_DOMAINS`, `BANK_COLORS`, `bankDomain()`, `brandColor()`, `bankLogo()`, `cardGradient()` into `js/core/branding.js`
- `app.js` reduced from 3572 lines to ~3037 lines (~535 lines / 15% reduction)
- All four new files loaded via `<script>` tags in `index.html` before `app.js`
- Global variable names unchanged — no breaking changes

### PWA
- SW bumped to `vaultcap-v45`

### Score
- Overall: 80 → 83
- Architecture: 60 → 72
- Code Quality: 68 → 74

## 4.3.8 (2026-06-29) — Code quality + UX pass

### Code Quality
- All `<button>` elements across all JS modules now have `type="button"` — prevents accidental form submission
- `document.title` updates on navigation (`goto()`) — improves screen-reader UX for SPA navigation

### UX
- Loans empty state upgraded to `empty-ios` component (consistent with investments, banks, cards)
- Cash empty state upgraded to `empty-ios` component

### PWA
- SW bumped to `vaultcap-v44`

### Score
- Overall: 79 → 80
- Code Quality: 68 → 68 (button types, title updates — net +0, limited by monolith ceiling)

## 4.3.7 (2026-06-29) — A11y pass 2 + performance

### Accessibility
- All `<img>` in cards, documents, banks, and ui modules now carry `alt` attributes (content photos: descriptive; logos/favicons: `alt=""`)
- Zero img-without-alt violations

### Performance
- `<link rel="preload">` for `base.css` + `components.css` — eliminated render-blocking delay on cold load
- SW bumped to `vaultcap-v43`

### CSS
- Fixed CSS variable names in `components.css`: `--fs-caption` → `--fs-label`, `--fs-small` → `--fs-meta` (aligns with base.css token names)

### Score
- Overall: 74 → 77 (+3)
- A11y: 76 → 80
- Performance: 73 → 77

## 4.3.6 (2026-06-29) — CSS coverage pass (`components.css`)

### New CSS
- Generic layout: `.header`, `.footer`, `.section`, `.section-title`, `.row`, `.label`, `.value`, `.amount`, `.meta`, `.no-print`
- Net worth: `.nw-hero`
- Onboarding: `.ob-sec`, `.ob-country`, `.ob-type-card`
- UK tax calculators: `.cgt-band`, `.cgt-type`, `.div-band`, `.iht-sp`, `.sdlt-add`, `.sdlt-ftb`, `.gbvat-btn`
- Buttons: `.btn-close`, `.btn-print`
- Security/prefs: `.ctx-sec-chk`, `.mod-check`, `.pref-check`
- Family: `.fam-av-pick`
- Misc: `.drk`, `.drv`

### PWA
- SW bumped to `vaultcap-v42`

### Score
- Code Quality: 58 → 62 (zero unstyled classes in main app)
- Overall: 72 → 74

## 4.3.5 (2026-06-29) — A11y + PWA polish pass

### Accessibility (`themes.css`)
- `focus-visible` outlines on all interactive elements (accent-coloured, 2px, per-element radius)
- `prefers-reduced-motion` block collapses all animations/transitions to 0.01ms
- Skip-link `.cap-skip-link` styled (hidden until focused, then slides into view)

### PWA (`manifest.json`, `sw.js`)
- Manifest: added `categories` (`finance`, `productivity`, `utilities`) + `shortcuts` (Dashboard, Add Item)
- Service worker bumped to `vaultcap-v41` — forces fresh fetch of updated `themes.css`

### Score
- Overall: 68 → 72 (+4)
- A11y: 52 → 76

## 4.3.4 (2026-06-15)
- **Data safety:** Removed Settings “Load Demo Data” that could wipe a real vault; demo is isolated profile + `?demo=1` link only.
- **Rollback:** Each save keeps the previous encrypted vault (`pin_backup`); Recovery Center + restore prompt after accidental overwrites.
- **Reset:** Requires typing DELETE and auto-starts encrypted backup export first.
- Sandbox `confirm()` no longer auto-approves in embedded contexts.

## 4.3.3 (2026-06-15)
- Restore pre–Capricorn identity home-screen icons; service worker cache bump.

## 4.3.2 (2026-06-15)
- **Progressive onboarding**: Quick setup (PIN only) and “Set up later” on profile steps; dashboard + Settings nudge until profile is complete.
- Version sync: in-app `VER`, `VERSION.json`, and service worker cache `vaultcap-v32`.

## 4.3.1 (2026-06-12)
- Phase P4: Playwright tests for family module navigation and settings export buttons; service worker cache bump.

## 4.1.0 (2026-06-10)

### Phase 2 — Quality
- Playwright smoke tests verified (lock screen, settings shell)
- `privacy.html` / `changelog.html` landing pages from PRIVACY.md / CHANGELOG.md
- Docs truth pass: bundled LLM + Cloudflare worker proxy documented accurately

### Smart Import / LLM
- **Bundled LLM** via `js/config/llm-bundled.js` — proxy provider, no user key required
- **Cloudflare Worker** at `https://VaultCap-llm-proxy.shamikhahmed.workers.dev` (`worker/llm-proxy.js`)
- Workers AI backend (`@cf/meta/llama-3.1-8b-instruct`) with Smart Parser offline fallback
- Optional custom API key override in Settings → Import

### PWA & icons
- PNG maskable icons (192/512), service worker cache bump (`VaultCap-v20`)
- Offline Tesseract OCR for document capture

### Docs
- PRIVACY.md, SECURITY.md, CHANGELOG.md aligned with shipped LLM architecture
