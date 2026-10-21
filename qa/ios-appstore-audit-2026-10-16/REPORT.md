# VaultCap iOS — App Store readiness audit (interim, 2026-10-16)

Status: **fix pass done 2026-10-17** (see §0). Nothing committed. Branch: `fix/ios-native-shell`.

## 0. Fix status (2026-10-17) — verified on iPhone 16 Pro simulator unless noted

| ID | Status | How it was fixed / verified |
|---|---|---|
| AS-1 backup export no-op | ✅ Fixed | `ExIm.dl` → `VaultNative.saveAndShare` (Filesystem + Share). Verified: share sheet → Save to Files → `VaultCap-YYYY-MM-DD.vos` (encrypted `VAULTOS_AES256::`) exists in Files. `lastBackup` stamped only after a real save; cancel/error toasts. |
| AS-2 privacy link dead | ✅ Fixed | In-app sheet (`ActHelpers.openPrivacy`); License sheet; external links via `@capacitor/browser`. Verified on device. |
| AS-3 signing team | ⛔ Owner | Sign in to Xcode with the Apple Developer account and set the team. |
| AS-4 web/PWA wording | ✅ Fixed | `isNativeApp()` swaps About/Help/lost-phone copy; no install banner/tip; pre-unlock home hides feature catalogue + theme picker in the app; marketing pages + screenshots removed from the native bundle (`www` 71 MB → 8 MB). |
| AS-5 print / PDF / tax / zakat | ✅ Fixed | `printReport()` → native `UIPrintInteractionController` (VaultNative plugin). Verified: Financial Summary opens iOS print sheet with preview. |
| AS-6 / AS-9 privacy copy + policy | ✅ Fixed | `privacy.html` rewritten for iOS (storage, opt-in table, AI provider = **Cloudflare Workers AI** — corrected from the app's "claude-haiku" label after reading `worker/llm-proxy.js`, backups, clipboard, camera, deletion path, children, contact). AI consent prompt names the provider. Logo + AI opt-ins hidden in the iOS app. |
| AS-7 plist/version | ✅ Fixed | 5.3.1 (531), min iOS 17.0 explicit, arm64, Face ID string removed (no biometric feature). |
| AS-8 iPad | 🔄 Re-verify | Lock-screen safe area fixed; iPad sweep to re-run on new build. |
| SEC-1 app switcher | ✅ Fixed | `SceneDelegate` cover (midnight + gold mark). Verified in app switcher. |
| SEC-2 clipboard | ✅ Fixed | Native pasteboard `localOnly` + `expirationDate`; all copy paths routed through `U.copy`. Verified: key on clipboard at 1 s, gone at 33 s. |
| SEC-3 PIN-derived key | ⏸ Deferred | Needs Keychain-wrapped DEK + migration plan (with Face ID). |
| UX-1 bank autofill | ✅ Fixed | Exact name/alias may change country; partial typing only within chosen country (prefix, ≥3 chars). |
| UX-2 stale PIN error | ✅ Fixed | `checkPIN` clears `#ob-perr`. |
| UX-3 close "+" | ✅ Fixed | New `xmark`/`info`/`alert` icons; modal close, toast icons, trash purge. |
| UX-4 profile card | ✅ Fixed | Padding. Verified on device. |
| UX-5 export sheet | ✅ Fixed | Grouped key (no orphan wrap), 22 pt checkbox row. Verified on device. |
| UX-6 `<summary>` marker | ✅ Fixed | `summary::-webkit-details-marker{display:none}`. |
| UX-7 ⌘K on phone | ✅ Fixed | Copy changed. (Score 47/67% drift not yet investigated.) |
| UX-8 Dynamic Type / zoom | ◐ Partial | Pinch-zoom disabled in app; Dynamic Type deferred (842 px sizes). |
| UX-9 status bar | ✅ Fixed | Follows app theme via `@capacitor/status-bar`. Verified with system Light. |
| UX-10 slow launch | ✅ Mitigated | Native LaunchScreen with gold mark (no blank screen). Real timing → TestFlight. |
| UX-11 SE onboarding under status bar | ✅ Fixed | Safe centring + env() insets. |
| UX-12 toast over CTA | ✅ Fixed | Toast removed. |
| UX-13 duplicate CSS links | ⏸ Left | Harmless (preload + stylesheet pairs). |
| UX-14 demo banner over More header | ✅ Fixed | `body.demo-banner-active .vc-more-header` offset. |
| UX-15 panic button under banner / 34 pt | ✅ Fixed | 44 pt, offset below banner. |
| UX-16 list targets / FAB overlap | ✅ Fixed | 44 pt row actions; page bottom padding clears the FAB. |
| UX-17 truncation | ◐ Partial | Settings rows wrap; list sub-lines still ellipsize by design. |
| Lock Switch Vault (D2/D5) | ✅ Fixed | Lock scrolls on short screens; iPad bottom inset restored. |
| Luxury redesign | ✅ Phase 1 | `css/luxe.css` (tokens, type, surfaces, buttons, inputs, cards, sheets, toasts, lock, onboarding, dashboard, tab bar), lock clock removed, greeting without "User", gold-mark launch screen. Light theme keeps navy accent (brand rule in `tests/theme-audit.spec.js`). |

Environment: Xcode 27.1, iOS sim runtimes 27.1 (iPhone Duo only), 27.0, 18.1. iOS 15–17 runtimes are not downloadable for Xcode 27.1 → iPhone 6s/7/8/X/SE1, iPad Air 2/mini 4 cannot be booted natively (WebKit viewport emulation only). iOS 26.0 download failed (Apple catalog host unreachable). Host has 8 GB RAM → one simulator at a time; Spotlight was indexing the new runtimes (load avg ~700).

## 1. App Store blockers (fix before submission)

| ID | Sev | Guideline | Problem (verified on iPhone 16 Pro sim unless noted) | Fix |
|---|---|---|---|---|
| AS-1 | P0 | 2.1 / data loss | **Backup export saves nothing.** "Export Encrypted Vault (.vos)" → toast "Encrypted backup saved" and Last Backup = "Backed up today", but no file exists anywhere in the sim container. `UI.dl()` (`js/ui.js:953`) uses a blob `<a download>`, which WKWebView ignores; success toast is unconditional (`js/ui.js:909`). | Native path: `@capacitor/filesystem` write to cache + `@capacitor/share` (iOS share sheet → Save to Files/AirDrop). Only mark "backed up" after share completes. Needs 2 deps (approval). |
| AS-2 | P0 | 5.1.1 | **Privacy Policy link does nothing** in the app (`window.open('privacy.html')`, `js/ui.js:2386`). License link same, and `LICENSE` is not shipped in `www/` at all. | Open in-app (navigate/modal) or open the https URL via `@capacitor/browser`; ship LICENSE text. |
| AS-3 | P0 | Account | **No signing identity / no DEVELOPMENT_TEAM** on this Mac → cannot archive or upload. | Sign into Xcode with the Apple Developer Program account; set team. |
| AS-4 | P1 | 4.2 | Web-wrapper signals in UI: Settings → About "Tip: Safari → Share → Add to Home Screen"; About "Even if this URL stops working… Any browser can open a .vos"; Help "install it as a PWA"; recovery steps "visit shamikhahmed.github.io/VaultCap"; "Web Crypto API". Marketing pages (pitch, presentation, landing, screen-gallery, install, widget) ship inside the app (71 MB `www`). | Native flag (`Capacitor.isNativePlatform()`) to swap copy; native staging allowlist without marketing pages/screenshots. Add native value: Face ID unlock, share sheet, app-switcher privacy, haptics already present. |
| AS-5 | P1 | 2.1 | `window.print()` "Print / Save PDF" (`js/ui.js:1020`, `js/modules/documents.js:378`) and Tax report `window.open`+`document.write` (`js/modules/tax.js:771`) — Capacitor has no print handler; expected to do nothing. **Not yet tapped on device.** | Generate PDF → share sheet, or hide in native. |
| AS-6 | P1 | 2.3 / 5.1.2 | Copy says "Local device only — never sent anywhere" while opt-in FX/logo/AI features exist; AI import sends text to a Claude proxy → needs explicit third-party AI consent wording and privacy-label disclosure. | Adjust copy; App Privacy label must disclose optional AI text sharing. |
| AS-7 | P2 | 2.3 | `MARKETING_VERSION 5.3.0` vs app 5.3.1; `UIRequiredDeviceCapabilities = armv7` (obsolete); `NSFaceIDUsageDescription` declared but no biometric plugin; demo link `vaultcap.app` does not resolve. | Align versions; `arm64`; ship Face ID or drop string; fix demo URL. |
| AS-9 | P1 | 5.1.1 / 5.1.2 | `privacy.html` is web-only: "Progressive Web App", "your browser", "clear site data", "Uninstalling the PWA", "GitHub Pages"; no iOS storage/uninstall/iCloud-backup section; AI import names only "Cloudflare Worker proxy", not the AI provider (Anthropic Claude) — Apple requires naming third-party AI and explicit consent; delete path "Settings → Security → Delete Vault" does not exist (tabs are Account/General/Appearance/Access/Alerts/Privacy/About); contact = GitHub issues only while app shows support@capricornsystems.com; marketing nav links (Presentation, Pitch) on the page. | Write an iOS section, name the AI provider + consent, fix paths, add support email + Support URL, drop marketing links in the app build. |
| AS-8 | P2 | iPad | TARGETED_DEVICE_FAMILY = 1,2 → iPad screenshots required, reviewers test iPad + Split View. iPad sweep in progress; 16 GB-RAM iPad models cannot boot on this 8 GB host. | Finish iPad pass or ship iPhone-only for v1. Opt out of Mac "Designed for iPad" until tested. |

## 2. Security / privacy findings (verified)

| ID | Sev | Finding | Fix |
|---|---|---|---|
| SEC-1 | P1 | **App switcher snapshot shows live vault content** (JS blur on `visibilitychange` is too late). | Native cover view in `SceneDelegate.sceneWillResignActive`, remove in `sceneDidBecomeActive`. |
| SEC-2 | P1 | **Clipboard not cleared**: backup key still on clipboard >60 s despite 30 s setting; Universal Clipboard may sync it to other devices. | Native pasteboard write with `expirationDate` + `localOnly`, or route all copies through the clear helper. |
| SEC-3 | P2 | Vault data key wrapped by PBKDF2(600k) of a 6-digit PIN → offline brute force feasible if IndexedDB is extracted (backup/jailbreak). | Wrap DEK with a Keychain / Secure Enclave key on iOS; keep PIN as gate + lockout. |
| OK | — | AES-256-GCM, random DEK, pinHash only inside ciphertext, network features off by default, auto-lock on background (verified), relaunch lands on PIN screen (verified), no protected content before unlock. | — |

## 3. Functional / UX defects found on device

| ID | Sev | Screen | Problem |
|---|---|---|---|
| UX-1 | P1 | Add Bank | `SMART_DB.fillBank()` substring-matches every keystroke and falls back to any country: typing "Tes" → Emirates NBD → Country/Currency silently flip to UAE/AED (`js/core/smart-db.js:2376`). |
| UX-2 | P2 | Onboarding PIN | Stale "PINs do not match" stays under green "PINs match" (`checkPIN` never clears `#ob-perr`). |
| UX-3 | P2 | Sheets | Close button renders "+" instead of "×" (`cross` icon is a plus: `js/core/icons.js:54`). |
| UX-4 | P2 | Settings → Account | "Complete your profile" card has no inner padding; button bleeds past border. |
| UX-5 | P2 | Export sheet | Oversized white checkbox misaligned with label; key wraps 1–2-char orphan; no "Copied" feedback. |
| UX-6 | P3 | Bank form | Double disclosure arrow on `<summary>` (WebKit marker not hidden). |
| UX-7 | P3 | Dashboard | Security score 47% vs 67% across renders with no change; "⌘K" hint on phone. |
| UX-8 | P3 | Global | No Dynamic Type (842 px font sizes); pinch-zoom enabled in native shell. |
| UX-9 | P2 | Global (iPad sweep) | System Light appearance → status-bar text dark on the app's dark background (unreadable). Force light-content status bar (e.g. `@capacitor/status-bar` style Dark, or native `preferredStatusBarStyle`). |
| UX-10 | P1 (verify on device) | Launch, all iOS 27.0/18.1 sims | Blank dark screen ~12–13 s on launch (also warm relaunch). Trace on iPhone SE 3 / iOS 27.0: ~3.3 s native init → `loadRequest`, ~2.9 s WebKit network/GPU/content process spawn, page itself DCL 0.5 s / load 0.6 s, first composite ~13 s. Plain WebKit renders the same page in 0.16–0.43 s → overhead is in the native/WebKit spin-up, much of it simulator-specific. **Must be measured on a physical iPhone via TestFlight.** Mitigation regardless: native LaunchScreen with the gold mark (currently empty `Splash.imageset`). iPad Pro 13 "blank" was the same symptom. |
| UX-11 | P2 | Onboarding, iPhone SE (home-button) | Step dots / content render under the status bar (no top inset on 20 pt status-bar phones). |
| UX-12 | P2 | Onboarding PIN | Toast "Profile setup saved for later…" covers the "Create vault" button; toast uses a magnifier icon for info. |
| UX-13 | P3 | index.html | `css/tokens.css` and `css/base.css` linked twice. |
| UX-14 | P1 | More overlay (demo) | **DEMO banner covers the More overlay header and its Close ×** on all 38 viewports — reviewer-visible on the demo path. `.vc-more-header` (`css/components.css:1502-1507`) ignores `--demo-banner-h` (`#demoBanner`, `css/layout.css:130`). (WebKit matrix D1) |
| UX-15 | P2 | Lock (demo) | Red emergency/panic button sits under the DEMO banner's Exit button; 34×34 (< 44). `css/layout.css:366-368`. (D3) |
| UX-16 | P2 | Lists (Banks, Documents) | Row action buttons 36–40 pt (< 44) and the FAB covers the right-most row action at scroll-top on 7–10 phone sizes; filter chips 29 pt tall; Banks sort select 73×18. `css/components.css:54-63, 303`. (D6) |
| UX-17 | P3 | Lists / Settings, ≤ 390 pt and Split View | Ellipsis truncation of bank names/sub-lines and settings row titles (`.entry-sub`, `.si .name` nowrap). (D12) |

WebKit viewport matrix (all models incl. old 6s/7/8/X/SE1 sizes, iPad portrait/landscape, Split View 320/375/507/678): 38 viewports × 16 screens = 608 captures, 0 errors; no horizontal overflow, no element wider than viewport, no content hidden behind the tab bar, no page header in the status-bar zone anywhere. Full report: `test-results/webkit-matrix/REPORT.md` (gitignored). UX-3/4/5/6 confirmed at every size (D7/D9/D8/D10; D10 iOS-only).

**Lock-screen follow-up fix (this session, D2/D5):** `#pgLock` now scrolls (`overflow-y:auto`), short-viewport compact layout extended to ≤ 800 pt tall with auto-margin "safe" centring, and the iPad rule that zeroed bottom safe-area padding removed. Verified in WebKit: iPad Pro 13 portrait row now ends at the home-indicator line; iPad 768-tall landscape fits; iPhone SE 2/3, 8 Plus, 15 unchanged; iPad mini 6 landscape (744) dips ~15 pt into the home-indicator zone at scroll-top; iPhone Duo open row is just below the fold but reachable by scrolling. Regression tests: chromium vault-switch + smoke 11/11, webkit-iphone 11/11.

## 4. Tests run

- Playwright full e2e: **165 passed, 3 skipped, 0 failed**. WebKit-iPhone project 11/11. XSS audit OK.
- Native (iPhone 16 Pro, iOS 18.1): onboarding PIN → recovery key → dashboard; relaunch → lock; background → lock ✅; app switcher ✅ functional / ❌ privacy; export ❌; copy key ✅ / auto-clear ❌; privacy link ❌; add-bank form (UX-1).
- iPhone Duo (27.1): boots, app installs/launches, screen captures black under host load — **inconclusive**, retest.
- iPad sweep: 3 devices logged so far (`test-results/ios-sweep/ipad/`); WebKit matrix: started (`test-results/webkit-matrix/`). Both paused at 21:40.

## 4b. Companion documents

- [TEST-PLAN.md](TEST-PLAN.md) — 14 personas (incl. family head + member on second device, decoy/panic, power user, App Reviewer), feature × persona coverage for all 27 modules, device matrix, automation to add, gaps and feature ideas.
- [DESIGN-PROPOSALS.md](DESIGN-PROPOSALS.md) — premium direction for launch/splash, welcome (3 screens), lock, pre-unlock home, dashboard, sheets/forms/settings, iPad; foundations (type scale, surfaces, spacing, icons, motion, haptics).

## 4c. Repo changes not made by this session (need owner decision)

Made ~18:21–18:26 (likely the parallel Cursor run): `ios/App/App/Info.plist` reorders keys and adds `ITSAppUsesNonExemptEncryption=false` (verified in the built app: `UILaunchStoryboardName` and `NSPhotoLibraryUsageDescription` are still present — no launch-screen risk); `project.pbxproj` sets `IPHONEOS_DEPLOYMENT_TARGET = $(RECOMMENDED_IPHONEOS_DEPLOYMENT_TARGET)` → built `MinimumOSVersion = 17.0` (was 15.0): oldest supported iPhone becomes XS/XR, so 6s/7/8/X/SE1 can no longer install — product decision; if kept, the "unbootable old models" gap in §4 disappears. Built app still reports `CFBundleShortVersionString 5.3.0` and `UIRequiredDeviceCapabilities armv7` (AS-7). Also `LastUpgradeCheck 2710`; plus `scripts/ios-sim-run-and-audit.sh`, `qa/ios-audit-2026-10-16/`, `.derivedData/`, a regenerated `assets/screenshots/.../banks.png`. Left untouched.

## 5. Next session plan

1. Resume iPad sweep + WebKit matrix (one at a time; ask user to exclude `/Library/Developer/CoreSimulator` from Spotlight first).
2. Visible tour, one iPhone per screen class: SE 3, 12 mini, 13, 14 Plus, 15, 15 Pro Max, 17 Pro, 18 Pro, 18 Pro Max, Air, 17e, 11 Pro Max, Xs (18.1), Duo.
3. Tap-verify print / tax report / reminders notifications / import file picker / WebAuthn option.
4. **Persona test plan** (each persona seeded via fixture, every module exercised): empty new user; single PK expat; UK salaried; UAE multi-currency; heavy power user (500+ records, perf); family vault head + 3 members (hide-balances, member switching); demo vault; decoy-PIN user; lockout → recovery-key restore; passphrase-mode user; backup/restore across devices; light/dark/high-contrast/large-text users.
5. Premium design pass (splash, welcome, lock, home, dashboard): proposals + mockups for approval before code.
6. Then fix in batches: AS-1/AS-2/SEC-1/SEC-2 first.

## 6. Uncommitted changes on `fix/ios-native-shell`

- `capacitor.config.json`: `contentInset: never`, `backgroundColor: #060a12` (white strip + white flash fix).
- `ios/App/App/Base.lproj/LaunchScreen.storyboard`: dark launch background.
- `js/core/app-helpers.js`: no PWA install banner inside Capacitor native.
- `css/capricorn-core.css`: skip-link parked fully off-screen under notch/Island.
- `index.html` + `css/layout.css`: lock screen uses gold brand mark; Switch Vault + Emergency moved into in-flow row under keypad (no overlap).
- `ios/.../Package.resolved`: capacitor-swift-pm 8.4.0 → 8.5.3 (matches JS).
- Pre-existing user edit (not mine): `tests/viewport.spec.js`.
