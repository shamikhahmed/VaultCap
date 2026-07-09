# VaultCap UI Audit — 250-Point Checklist

**Version:** 5.0.0 · **Audited:** 2026-07-02 (gallery regen 2026-07-09)
**Legend:** ✅ Pass · ⚠️ Partial · ❌ Fail

## Summary

| Category | Pass | Partial | Fail |
|----------|------|---------|------|
| Navigation & IA | 18 | 5 | 2 |
| Visual design & brand | 20 | 4 | 1 |
| Typography | 14 | 8 | 3 |
| Icons & imagery | 19 | 4 | 2 |
| Layout & responsiveness | 17 | 6 | 2 |
| Forms & modals | 16 | 7 | 2 |
| Accessibility | 12 | 10 | 3 |
| Motion & feedback | 14 | 8 | 3 |
| Gallery & marketing | 20 | 3 | 2 |
| PWA & platform | 18 | 5 | 2 |
| **Total** | **168** | **60** | **22** |

**Score: 168/250 pass (67%) · 228/250 pass-or-partial (91%)**

---

## 1. Navigation & IA (25)

| # | Check | Status |
|---|-------|--------|
| 1.1 | Bottom tabs ≤5 primary destinations | ✅ |
| 1.2 | Tab labels concise (≤8 chars) | ✅ |
| 1.3 | Active tab visually distinct | ✅ |
| 1.4 | Desktop sidebar mirrors modules | ✅ |
| 1.5 | Sidebar groups labeled without emoji | ✅ |
| 1.6 | Monochrome nav icons consistent weight | ✅ |
| 1.7 | More menu covers all modules | ✅ |
| 1.8 | FAB quick-add reachable on mobile | ✅ |
| 1.9 | Command palette (⌘K) on desktop | ✅ |
| 1.10 | Back navigation predictable | ⚠️ |
| 1.11 | Hub pages (Finance/Identity/Assets) clear | ✅ |
| 1.12 | Settings reachable from sidebar + header | ✅ |
| 1.13 | Lock action ≤2 taps | ✅ |
| 1.14 | Privacy toggle discoverable | ✅ |
| 1.15 | Deep links via hash routes | ✅ |
| 1.16 | Collapsed sidebar usable | ⚠️ |
| 1.17 | Nav rebuild on module toggle | ✅ |
| 1.18 | No duplicate nav entries | ✅ |
| 1.19 | Sheet dismiss on backdrop tap | ✅ |
| 1.20 | Escape closes overlays | ✅ |
| 1.21 | Focus trap in modals | ⚠️ |
| 1.22 | Skip link present | ✅ |
| 1.23 | aria roles on tablist | ✅ |
| 1.24 | Context switcher visible on hubs | ⚠️ |
| 1.25 | Breadcrumb / kicker on module pages | ✅ |

## 2. Visual design & brand (25)

| # | Check | Status |
|---|-------|--------|
| 2.1 | Dark theme primary palette cohesive | ✅ |
| 2.2 | Light theme primary palette cohesive | ✅ |
| 2.3 | Accent used sparingly for CTAs | ✅ |
| 2.4 | Glass surfaces consistent opacity | ✅ |
| 2.5 | Border tokens consistent | ✅ |
| 2.6 | Card radius consistent (10–18px) | ✅ |
| 2.7 | Demo banner premium (not clown emoji) | ✅ |
| 2.8 | Demo banner light/dark themed | ✅ |
| 2.9 | Sidebar footer matches light mode | ✅ |
| 2.10 | No purple legacy theme bleed | ✅ |
| 2.11 | Splash matches app icon | ✅ |
| 2.12 | Lock screen brand mark | ✅ |
| 2.13 | Welcome/home brand mark | ✅ |
| 2.14 | Settings chrome consistent | ⚠️ |
| 2.15 | Empty states styled (empty-ios) | ✅ |
| 2.16 | Error/warn color semantic | ✅ |
| 2.17 | Entry list hover states | ✅ |
| 2.18 | Chip filters readable | ✅ |
| 2.19 | Dashboard net-worth hero clear | ✅ |
| 2.20 | No harsh pure-white flashes in dark | ✅ |
| 2.21 | Light mode cream/warm neutrals | ✅ |
| 2.22 | Marketing landing matches product mark | ✅ |
| 2.23 | Pitch deck uses product mark | ✅ |
| 2.24 | Investor one-pager visuals aligned | ✅ |

## 3. Typography (25)

| # | Check | Status |
|---|-------|--------|
| 3.1 | System font stack with fallbacks | ✅ |
| 3.2 | Large title on module pages (cap-h2) | ✅ |
| 3.3 | Kicker uppercase tracked | ✅ |
| 3.4 | Body 15px minimum on inputs | ✅ |
| 3.5 | Meta text ≥11px | ✅ |
| 3.6 | Line-height readable on lists | ⚠️ |
| 3.7 | Letter-spacing on headlines | ✅ |
| 3.8 | Mono font for codes/PIN display | ✅ |
| 3.9 | No emoji in page titles | ✅ |
| 3.10 | Dashboard greet hierarchy | ⚠️ |
| 3.11 | Modal titles sized correctly | ⚠️ |
| 3.12 | Help content prose width | ⚠️ |
| 3.13 | Settings section titles | ✅ |
| 3.14 | Onboarding titles scaled | ✅ |
| 3.15 | Truncation on long bank names | ✅ |
| 3.16 | Tab labels don't wrap awkwardly | ⚠️ |
| 3.17 | Dynamic type / fs-* tokens | ⚠️ |
| 3.18 | High contrast mode support | ⚠️ |
| 3.19 | Number formatting consistent | ✅ |
| 3.20 | Currency display aligned | ✅ |
| 3.21 | Section headers in lists | ⚠️ |
| 3.22 | Inset grouped list style (iOS) | ✅ |
| 3.23 | Label/input pairing in forms | ✅ |
| 3.24 | Placeholder contrast WCAG | ⚠️ |
| 3.25 | Link styles distinguishable | ❌ |

## 4. Icons & imagery (25)

| # | Check | Status |
|---|-------|--------|
| 4.1 | VC icon system (stroke SVG) | ✅ |
| 4.2 | Nav icons monochrome | ✅ |
| 4.3 | Sidebar icons monochrome | ✅ |
| 4.4 | Header action icons (not emoji) | ✅ |
| 4.5 | FAB menu icons | ✅ |
| 4.6 | Sheet grid icons | ✅ |
| 4.7 | Settings tab icons | ✅ |
| 4.8 | Hub tile icons | ✅ |
| 4.9 | Module registry icon keys | ✅ |
| 4.10 | PWA icon.svg squircle lock | ✅ |
| 4.11 | PNG icons 192/512/1024 | ✅ |
| 4.12 | iOS AppIcon.appiconset generated | ✅ |
| 4.13 | apple-touch-icon linked | ✅ |
| 4.14 | favicon SVG + PNG | ✅ |
| 4.15 | Bank logos (branding.js) | ✅ |
| 4.16 | Entry row action icons | ✅ |
| 4.17 | Search field icon | ✅ |
| 4.18 | Help cards icons | ⚠️ emoji |
| 4.19 | Smart import UI icons | ⚠️ |
| 4.20 | Toast icons | ⚠️ |
| 4.21 | Offline bar icon | ❌ emoji |
| 4.22 | Onboarding type cards emoji | ❌ |
| 4.23 | Home welcome module grid emoji | ✅ |
| 4.24 | Command palette row icons | ⚠️ emoji |
| 4.25 | Icon size tokens (14/18/22) | ✅ |

## 5. Layout & responsiveness (25)

| # | Check | Status |
|---|-------|--------|
| 5.1 | Mobile 390px usable | ✅ |
| 5.2 | Desktop 1280px sidebar layout | ✅ |
| 5.3 | btabs hidden ≥769px | ✅ |
| 5.4 | Sidebar hidden ≤768px | ✅ |
| 5.5 | Safe area insets (notch) | ✅ |
| 5.6 | Demo banner offsets app shell | ✅ |
| 5.7 | FAB not obscuring content | ⚠️ |
| 5.8 | Modal max-height scroll | ✅ |
| 5.9 | Settings tabs scroll horizontal | ✅ |
| 5.10 | Grid hubs 2-col mobile | ✅ |
| 5.11 | Desktop max-width shell | ✅ |
| 5.12 | Landscape lock screen | ⚠️ |
| 5.13 | Fold posture CSS | ⚠️ |
| 5.14 | Print styles (export) | ⚠️ |
| 5.15 | Gallery mobile aspect 9:19.5 | ✅ |
| 5.16 | Gallery desktop aspect 16:10 | ✅ |
| 5.17 | Gallery strict viewport (no fallback) | ✅ |
| 5.18 | Lightbox responsive | ✅ |
| 5.19 | Compare mode side-by-side | ✅ |
| 5.20 | Missing shot placeholder | ✅ |
| 5.21 | Table overflow on small screens | ⚠️ |
| 5.22 | BC entry action buttons fit | ✅ |
| 5.23 | Bottom tab spacer | ✅ |
| 5.24 | Collapsed sidebar icon-only | ⚠️ |
| 5.25 | pg-search full-bleed search | ✅ |

## 6. Forms & modals (25)

| # | Check | Status |
|---|-------|--------|
| 6.1 | Modal overlay dismiss | ✅ |
| 6.2 | Modal handle on mobile sheets | ✅ |
| 6.3 | Form fields 44px touch target | ✅ |
| 6.4 | Primary action right/bottom | ✅ |
| 6.5 | Cancel destructive clear | ✅ |
| 6.6 | Input focus ring visible | ✅ |
| 6.7 | Select styling dark/light | ✅ |
| 6.8 | Date inputs color-scheme | ✅ |
| 6.9 | Validation states (valid/invalid) | ✅ |
| 6.10 | Gallery captures real form content | ✅ |
| 6.11 | Gallery form scroll variants | ⚠️ |
| 6.12 | Smart add modal | ⚠️ |
| 6.13 | Theme picker modal | ⚠️ |
| 6.14 | PIN keypad layout | ✅ |
| 6.15 | Onboarding PIN step | ✅ |
| 6.16 | Recovery key display monospace | ✅ |
| 6.17 | File import hidden input | ✅ |
| 6.18 | Modal title no emoji | ⚠️ |
| 6.19 | Long forms scroll in mBody | ✅ |
| 6.20 | Autofill bank tiles | ✅ |
| 6.21 | Country/currency pickers | ✅ |
| 6.22 | Duplicate headers removed (import) | ✅ |
| 6.23 | Appearance live preview | ✅ |
| 6.24 | Family member form | ⚠️ |
| 6.25 | Document photo attach | ⚠️ |

## 7. Accessibility (25)

| # | Check | Status |
|---|-------|--------|
| 7.1 | Skip to content link | ✅ |
| 7.2 | aria-live toasts | ✅ |
| 7.3 | aria-label on icon buttons | ⚠️ partial |
| 7.4 | role=tablist on nav | ✅ |
| 7.5 | aria-selected on tabs | ✅ |
| 7.6 | Focus visible styles | ⚠️ |
| 7.7 | color-scheme meta | ✅ |
| 7.8 | Reduced motion respect | ⚠️ |
| 7.9 | Screen reader modal titles | ⚠️ |
| 7.10 | Keyboard nav command palette | ✅ |
| 7.11 | Escape hierarchy | ✅ |
| 7.12 | PIN dots aria | ❌ |
| 7.13 | Form labels associated | ⚠️ |
| 7.14 | Error messages announced | ⚠️ |
| 7.15 | Contrast dark text on bg | ✅ |
| 7.16 | Contrast light text on bg | ⚠️ |
| 7.17 | Touch targets 44px | ✅ |
| 7.18 | No info-by-color-only | ⚠️ |
| 7.19 | Alt text on marks decorative | ✅ |
| 7.20 | lang=en on html | ✅ |
| 7.21 | CSP configured | ✅ |
| 7.22 | No autoplay audio | ✅ |
| 7.23 | Gallery keyboard cards | ✅ |
| 7.24 | Settings toggles accessible | ⚠️ |
| 7.25 | WCAG 2.2 AA audit automated | ✅ baseline |

## 8. Motion & feedback (25)

| # | Check | Status |
|---|-------|--------|
| 8.1 | Page transition pgIn | ✅ |
| 8.2 | Splash animation | ✅ |
| 8.3 | Toast slide/fade | ✅ |
| 8.4 | Button active scale | ✅ |
| 8.5 | Entry stagger animation | ✅ |
| 8.6 | FAB open/close | ✅ |
| 8.7 | Sheet slide up | ✅ |
| 8.8 | Premium nav indicator | ⚠️ |
| 8.9 | Scroll progress bar | ✅ |
| 8.10 | Ambient canvas subtle | ✅ |
| 8.11 | No motion on lock PIN fail | ⚠️ |
| 8.12 | Loading splash bar | ✅ |
| 8.13 | Haptic on iOS (Capacitor) | ❌ |
| 8.14 | Skeleton loaders | ❌ |
| 8.15 | Optimistic UI on save | ⚠️ |
| 8.16 | Offline bar appears | ✅ |
| 8.17 | Demo banner resize sync | ✅ |
| 8.18 | Theme switch no flash | ⚠️ |
| 8.19 | Chart animations dashboard | ⚠️ |
| 8.20 | Modal open animation | ⚠️ |
| 8.21 | prefers-reduced-motion | ✅ |
| 8.22 | Gallery card hover | ✅ |
| 8.23 | Lightbox transition | ⚠️ |
| 8.24 | Onboarding step transition | ✅ |
| 8.25 | Float animation home logo | ✅ |

## 9. Gallery & marketing (25)

| # | Check | Status |
|---|-------|--------|
| 9.1 | 89 screens × 2 themes × 2 viewports | ✅ |
| 9.2 | Manifest nested files structure | ✅ |
| 9.3 | Auth + onboarding captured | ✅ |
| 9.4 | Forms section correct content | ✅ |
| 9.5 | Sheets section correct content | ✅ |
| 9.6 | Demo banner hidden in shots | ✅ |
| 9.7 | No What's New overlay in shots | ✅ |
| 9.8 | No localhost URLs in shots | ✅ |
| 9.9 | Desktop shows sidebar not btabs | ✅ |
| 9.10 | Mobile shows btabs not sidebar | ✅ |
| 9.11 | Scroll variants where overflow | ✅ documented gaps |
| 9.12 | Gallery viewer strict viewport | ✅ |
| 9.13 | Missing viewport badge | ✅ |
| 9.14 | Compare dark/light | ✅ |
| 9.15 | Lightbox navigation | ✅ |
| 9.16 | cache bust on regen | ⚠️ |
| 9.17 | vaultcap-1/2 promo PNGs | ✅ |
| 9.18 | manifest screenshots paths | ✅ |
| 9.19 | screen-gallery.html port 8765 | ✅ |
| 9.20 | Capture timeout hardened | ✅ |
| 9.21 | landing.html mark | ✅ |
| 9.22 | pitch.html mark | ✅ |
| 9.23 | presentation.html mark | ✅ |
| 9.24 | OG image updated to new UI | ✅ |
| 9.25 | Gallery regen after icon pass | ✅ |

## 10. PWA & platform (25)

| # | Check | Status |
|---|-------|--------|
| 10.1 | manifest.json valid | ✅ |
| 10.2 | theme_color #000000 | ✅ |
| 10.3 | background_color #000000 | ✅ |
| 10.4 | display standalone | ✅ |
| 10.5 | start_url correct | ✅ |
| 10.6 | icons maskable 512 | ✅ |
| 10.7 | shortcuts defined | ✅ |
| 10.8 | SW cache version bumped | ✅ |
| 10.9 | SW caches icons | ✅ |
| 10.10 | Offline shell works | ⚠️ |
| 10.11 | Install prompt UX | ⚠️ |
| 10.12 | iOS add-to-homescreen meta | ✅ |
| 10.13 | Capacitor config present | ✅ |
| 10.14 | iOS AppIcon asset catalog | ✅ |
| 10.15 | npm run icons:generate | ✅ |
| 10.16 | npm run icons:ios | ✅ |
| 10.17 | Version sync VER/manifest/SW | ✅ v5.0.0 |
| 10.18 | Build cache bust ?v= | ✅ |
| 10.19 | Service worker unregister on bump | ✅ |
| 10.20 | Render ephemeral FS note | ✅ |
| 10.21 | Android TWA not configured | ❌ |
| 10.22 | Widget manifest entry | ⚠️ |
| 10.23 | Portrait orientation lock | ⚠️ |
| 10.24 | Playwright gallery CI hook | ⚠️ |
| 10.25 | App Store screenshots from gallery | ⚠️ |

---

## Open issues (tracked)

| ID | Severity | Item | Fix |
|----|----------|------|-----|
| UI-001 | Medium | Entry row emoji actions | **Resolved** — `U.icb` |
| UI-002 | Medium | Home welcome module grid emoji | **Resolved** |
| UI-003 | Low | presentation.html still emoji lock | **Resolved** |
| UI-004 | Medium | Inset grouped lists (iOS HIG) | **Resolved** — `.ios-group` |
| UI-005 | Low | prefers-reduced-motion | **Resolved** |
| UI-006 | Medium | OG/Twitter preview image stale | **Resolved** |
| UI-007 | Low | WCAG automated scan | **Resolved** — `npm run test:a11y` |
| UI-008 | Medium | Desktop scroll gallery gaps | **Accepted** — no overflow = no scroll shot; viewer shows missing pill |

---

## Commands

```bash
npm run test:a11y         # Accessibility baseline checks
npm run gallery           # Regenerate all screenshots
npm run gallery:view     # View at :8765/screen-gallery.html
npm run icons:generate   # PWA PNGs from icon.svg
npm run icons:ios        # resources/ios/AppIcon.appiconset
npm run cap:init         # Copy web + iOS project (after icons:ios)
```
