# VaultCap — Persona-based test plan (native iOS + web)

Goal: every module and every cross-cutting feature is exercised by at least two different users with realistic, different data, on real screen classes, before each App Store submission.

Modules in scope (from `js/core/module-registry.js`): banks, cards, cash, investments, bonds, assets, loans, expenses, bc (committees), family, friends (contacts), sims, documents, emails, digital (logins), credit, zakat, tax, currency, alerts, timeline, reminders, import (Smart Import + optional AI), trash, emergency, recovery-center, help.
Cross-cutting: onboarding (full + quick), PIN / passphrase unlock, recovery key, lockout, decoy PIN, panic lock, auto-lock, privacy mode, vault profiles + Switch Vault, demo vault, backup export / verify / import, search, themes (dark / light / system / high-contrast / large text / reduce motion), settings tabs (Account, General, Appearance, Access, Alerts, Privacy, About), optional network features (FX, logos, AI), native shell (launch, background, app switcher, clipboard, share, files, status bar, keyboard).

## 1. Personas (seed each as a fixture file under `tests/fixtures/personas/`)

| ID | Persona | Data shape (seed) | Unlock | Primary devices | Must exercise |
|---|---|---|---|---|---|
| P01 | **First-timer, empty vault** | nothing | PIN via Quick setup | iPhone SE 3, iPhone 17 | Splash → welcome → quick setup → recovery key → empty states of every module, "add first item" CTAs, help, privacy policy, first backup prompt |
| P02 | **Pakistan salaried** | 3 PK banks (HBL, Meezan, UBL), 2 cards, 1 BC committee, 2 SIMs, CNIC + passport docs, zakat state | PIN (full onboarding) | iPhone 15, 13 mini | Bank picker per country, PKR formatting, BC payouts, zakat calc, CNIC expiry reminders, Urdu/long names |
| P03 | **UK professional** | Monzo, Barclays, ISA investment, credit score, 1 loan, council tax bills | PIN | iPhone 16 Pro, Air | GBP, sort code / IBAN validation, credit-score module, UK tax calc, bills + reminders |
| P04 | **UAE expat, multi-currency** | Emirates NBD (AED), HBL (PKR), Monzo (GBP), gold holding, Emirates ID + visa | PIN | iPhone 18 Pro Max, Duo | Currency engine (AED/PKR/GBP/USD), net-worth roll-up, gold/metals, visa + Emirates ID expiry alerts, country switching (UX-1 regression) |
| P05 | **Family head (family vault)** | Head + spouse + 2 children + parent; per-member banks/cards/docs/assets; hide balances on | PIN | iPad Pro 13, iPhone 17 Pro | Family tabs per member, add/edit/remove member, avatar, per-member net worth, `familyHideBalances`, member documents, emergency info on lock screen |
| P06 | **Family member viewer** | Same vault as P05 restored on a second device from `.vos` | PIN (different) | iPad mini, iPhone 12 mini | Backup export → share sheet → restore on second device, data parity, recovery key on new device |
| P07 | **Power user (scale)** | 600 records across all modules, 200 activity items, 150 docs w/ photos (synthetic) | Passphrase mode | iPhone 11 Pro Max (oldest perf), iPad 10th | Search speed, list virtualisation, dashboard render time, export size, memory, battery-sim; no jank > 100 ms |
| P08 | **Privacy maximalist** | P03 data | PIN + decoy PIN + panic lock + privacy mode + auto-lock 1 min + clipboard 10 s | iPhone 16 Pro | Decoy vault indistinguishable, panic lock, app-switcher cover (SEC-1), clipboard expiry (SEC-2), all network toggles stay off, no network requests (proxy log) |
| P09 | **Forgetful user / recovery** | P02 data | PIN, then 10 wrong attempts | iPhone 15 | Lockout timing, "Forgot PIN?" after 3 fails, recovery-key restore, wrong recovery key, restore from `.vos` with wrong backup key |
| P10 | **Accessibility user** | P03 data | PIN | iPhone 17 (VoiceOver), iPhone SE (largest text) | VoiceOver labels on every control, focus order, 44 pt targets, high-contrast + large-text + reduce-motion settings, Dynamic Type |
| P11 | **Demo explorer / App Reviewer** | Built-in demo vault | Demo PIN 123456 | iPad Air 11 (reviewers use iPad), iPhone 17 | Guided demo end-to-end, every tab reachable, no web/PWA wording, privacy link works, nothing broken in 5 minutes of random tapping |
| P12 | **Migrating web → iOS user** | `.vos` exported from the PWA (older schema v10–v13) | Imported PIN | iPhone 15 Pro Max | Import old schema, migration, KDF 310k→600k upgrade, data integrity report |
| P13 | **AI import opt-in** | Pasted bank statement text, PDF, XLSX | PIN | iPhone 16 Pro | Smart Parser offline vs opt-in AI path, explicit consent text, per-use confirm, offline fallback when network off |
| P14 | **Light-mode / RTL-ish names** | P02 data with Arabic + Urdu names | PIN | iPhone 14 Plus | Light theme contrast, status-bar readability (UX-9), mixed-script text wrapping |

## 2. Feature × persona coverage (minimum two personas each)

| Feature | Personas |
|---|---|
| Onboarding full / quick | P02 / P01 |
| Banks (add/edit/delete/logo/autofill/country) | P02, P03, P04 |
| Cards | P02, P03, P05 |
| Cash | P04, P07 |
| Investments / bonds / gold | P03, P04, P07 |
| Assets / vehicles / gadgets | P05, P07 |
| Loans | P03, P07 |
| Expenses / bills / subscriptions | P03, P07 |
| BC committees | P02, P07 |
| Family vault | P05, P06 |
| Contacts (friends) | P05, P07 |
| SIMs | P02, P04 |
| Documents (+ photo attach, PDF pack) | P02, P04, P05 |
| Emails / digital logins | P07, P08 |
| Credit score | P03, P07 |
| Zakat | P02, P04 |
| Tax (report popup) | P02, P03 |
| Currency | P04, P07 |
| Alerts / reminders / timeline | P02, P04, P09 |
| Smart Import / AI import | P13, P12 |
| Search | P07, P10 |
| Trash (restore / purge) | P07, P09 |
| Emergency info + lock-screen button | P05, P08 |
| Recovery center / recovery key | P09, P06 |
| Backup export / verify / import | P06, P12, P09 |
| Decoy PIN / panic lock / privacy mode | P08 |
| Vault profiles + Switch Vault | P05, P11 |
| Themes / accessibility settings | P10, P14 |
| Optional network (FX, logos, AI) | P08 (off), P13 (on) |

## 3. Per-persona script (same skeleton for each)

1. Fresh install on target device (simulator panel attached, visible).
2. Seed persona via fixture import (or manual entry for P01/P02 to test forms).
3. Walk every enabled module: list → add → edit → detail → delete → trash restore.
4. Cross-cutting: lock (manual), background → resume (must lock), app switcher (must be covered), relaunch (must lock), wrong PIN ×3, export backup (file must exist in Files), copy secret (clipboard must expire).
5. Visual pass: light + dark, smallest + largest text, portrait (+ landscape on iPad), keyboard open on every form.
6. Record: screenshots per screen, console errors, timing (launch to first paint, unlock to dashboard, search latency).

## 4. Device matrix per release

- Native (one simulator at a time, panel visible): iPhone SE 3, 12/13 mini, 13/14/16e/17e, 14 Plus, 15/16, 15 Pro Max, 16 Pro/17 Pro/18 Pro, 16/17/18 Pro Max, Air, Duo (unfolded + folded), Xs (iOS 18), iPad mini, iPad 10th/A16, iPad Air 11/13, iPad Pro 11/13 (portrait, landscape, Split View 1/3, 1/2, 2/3, Slide Over).
- Old models without runtimes (6s/7/8/X/SE1, iPad Air 2/mini 4): WebKit viewport matrix only — say so in release notes.
- Physical device (TestFlight) before every submission: launch time, Face ID, share sheet, Files, camera document capture.

## 5. Automation to add

- `tests/fixtures/personas/*.json` + `tests/persona-*.spec.js` (Playwright, Chromium + WebKit) running §3 headless for every persona.
- A native smoke script (`scripts/ios-sim-smoke.sh`) per device class: install, launch, first-paint timing, light/dark screenshots, JS-error scan.
- Regression tests for every confirmed defect: UX-1 (bank autofill must not change country on partial match), UX-2 (stale PIN error), AS-1 (export must produce a file / share), SEC-2 (clipboard expiry), lock-screen overlap (Switch Vault never intersects keypad at any viewport).

## 6. Gaps found and feature ideas

| Gap / idea | Why it matters | Effort | Security note |
|---|---|---|---|
| Native backup via share sheet + "Save to Files" | Current export is a no-op in the app (AS-1) | M | Keep `.vos` encrypted; never write plaintext |
| Face ID / Touch ID unlock (native, Keychain-wrapped key) | Expected in any iOS vault; also fixes SEC-3 and strengthens Guideline 4.2 | M | Biometric gates a Keychain key with `.biometryCurrentSet`; PIN fallback |
| App-switcher privacy cover | Vault content visible in switcher (SEC-1) | S | — |
| iCloud Keychain-free encrypted iCloud Drive backup (opt-in) | Users lose phones; manual `.vos` is easy to forget | L | Client-side encrypted only, opt-in, disclose in privacy label |
| Expiry centre (passport, visa, CNIC, cards, SIM) with local notifications | Web `Notification` API doesn't exist in WKWebView | M | Notification text must not include sensitive values |
| Home-screen widget (net worth hidden by default, next expiry) | Native value + retention | M | Redacted by default; respects privacy mode |
| Quick actions (long-press icon: Add bank, Lock, Search) | Native value | S | Lock action must not reveal data |
| Document scanner (VisionKit) for IDs and cards | Faster than typing; native value | M | Images encrypted before storage |
| Shared family vault with per-member PIN | Family vault exists but single-device | L | Separate keys per member; no plaintext sharing |
| Duplicate / template items | Faster entry for similar accounts | S | — |
| Undo toast after delete | Fewer accidental losses (trash exists) | S | — |
| Onboarding "import from previous device" first-class path | P06/P12 flows are hidden in Settings | S | — |
