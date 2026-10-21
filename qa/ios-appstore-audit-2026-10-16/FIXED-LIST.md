# VaultCap — everything fixed (iOS App Store pass, 16–17 Oct 2026)

Branch `fix/ios-native-shell`. Commit `06132ca` = batch 1–2. Batch 3–4 (sections below marked 🆕) verified, not yet committed.
Evidence: simulator checks on iPhone 16 Pro / SE 3 / 12 mini … Duo, WebKit matrix (38 viewports), Playwright e2e.

## App Store blockers
| # | Problem | Fix | Verified |
|---|---|---|---|
| 1 | Backup export saved nothing but said "saved" | Native share sheet (Save to Files / AirDrop); "Backed up" only after a real save; cancel/error messages | ✅ `.vos` file found in Files on simulator |
| 2 | Privacy Policy / License links did nothing in the app | Open in an in-app sheet; external links in in-app browser | ✅ simulator |
| 3 | Print / Save PDF / tax & zakat reports did nothing | Native iOS print sheet | ✅ print sheet with preview on simulator |
| 4 | Website/PWA wording inside the app ("Add to Home Screen", "open in any browser", "visit …github.io") | App-aware copy; install banner + feature catalogue hidden in the app | ✅ |
| 5 | Marketing pages + 71 MB of screenshots shipped in the app | Native bundle only ships the app (≈8 MB) | ✅ |
| 6 | Privacy policy written for the website, wrong delete path, AI provider not named | Rewritten for iPhone/iPad; AI = Cloudflare Workers AI (read from the proxy code); exact delete path | ✅ |
| 7 | Info.plist: Face ID declared but unused, armv7, version 5.3.0 | Removed, arm64, 5.3.1 (531), iOS 17.0 explicit | ✅ built plist |
| 8 | No launch screen image (blank dark screen for seconds) | Gold shield launch screen | ✅ |

## Security & privacy
| # | Problem | Fix | Verified |
|---|---|---|---|
| 9 | App switcher showed vault contents | Native privacy cover (midnight + gold mark) | ✅ simulator app switcher |
| 10 | Copied keys never left the clipboard; synced to other devices | iOS clipboard item expires (your setting, 30 s default) and stays on this device | ✅ gone after 33 s |
| 11 | Security score jumped 47 ↔ 67 % | Custom-PIN check uses a stored "weak PIN" flag instead of an in-memory PIN | ✅ |
| 12 | AI import consent didn't say where text goes | Consent + settings name the provider; AI + logo fetch hidden in the iOS app | ✅ |

## Usability bugs
| # | Problem | Fix |
|---|---|---|
| 13 | **Drop-downs (banks, document types, account types, networks, 53 fields) only showed keyboard suggestions** | New searchable drop-down for every such field: tap = full list, type = filter, chevron button, works with autofill |
| 14 | Typing a bank name ("Tes…") switched country to UAE/AED | Partial typing only matches within the chosen country |
| 15 | Demo vault showed "10 issues found" | Duplicate check no longer flags different cards/accounts at the same bank |
| 16 | "PINs do not match" stayed under "PINs match" | Cleared while typing |
| 17 | Close buttons showed "+" | Proper × icon; toast icons fixed |
| 18 | Lock: Switch Vault overlapped keypad; logo looked bad | In-flow row; gold brand mark; scrolls on short screens; iPad safe area |
| 19 | DEMO banner covered More menu header + panic button | Offsets added |
| 20 | Buttons under 44 pt; + button covered list actions | 44 pt everywhere; page padding clears the + button |
| 21 | Onboarding under the status bar on iPhone SE; toast covered "Create vault" | Safe centring; toast removed |
| 22 | Status bar unreadable in light mode | Follows the app theme |
| 23 | No haptics on iPhone (vibrate API doesn't exist) | Taptic Engine: key press, unlock, wrong PIN |
| 24 | Settings row titles cut off; double arrow on bank picker | Titles wrap; extra marker hidden |

## Design & accessibility
| # | Change |
|---|---|
| 25 | Luxury design layer: deeper midnight surfaces, warm ivory text, gold only for primary action + brand, gradient buttons, soft cards, frosted tab bar, refined sheets/toasts/inputs |
| 26 | **Dynamic Type**: all 888 text sizes now follow the iPhone text-size setting (up to 160%), banners/tab labels capped like iOS; tested 100/130/160 % on SE + standard iPhone with zero overflow |
| 27 | Welcome: "Create my vault" is the main path (PIN → recovery key → done), personalisation optional |
| 28 | Dashboard: net worth leads when you have data; empty vault leads with "add your first item"; calmer wording |
| 29 | Settings: all 7 sections visible on phones (grid), no sideways scrolling |
| 30 | Lock screen: no oversized clock; gold keypad feedback; calmer layout |

## 🆕 Batch 3–4 (17 Oct)
| # | Problem | Fix | Verified |
|---|---|---|---|
| 31 | Welcome screen showed "Demo PIN: 123456 (6 digits)" and repeated taglines | Clean welcome: logo, one line, **Open My Vault**, quiet "Explore a sample vault" link | ✅ simulator |
| 32 | Entering the sample vault landed on the same welcome with "Explore…" and "Open My Vault" | Sample-aware welcome: "A sample household — explore freely", **Open sample vault** | ✅ simulator |
| 33 | Sample lock screen printed the PIN | "Sample vault — fictional data" + one-tap **Use sample PIN** | ✅ simulator |
| 34 | Guided demo sheet: duplicated title, PIN box after unlocking | Proper sample-vault welcome: mark, title, 3 highlights with live counts, **Start exploring** | ✅ simulator |
| 35 | Sample banner showed the PIN; wrapped at large sizes | "SAMPLE · Fictional data only · Exit", single line, capped for Dynamic Type | ✅ |
| 36 | Sample net worth showed −43% crash (history seeded at the wrong scale) | History calibrated → +3% steady growth | ✅ |
| 37 | Empty dashboard: "Start here" + "Finish profile setup" + empty tiles filled the screen | One compact start card with an inline "Set your countries & currency →" link; zero-count tiles hidden; with data, net worth leads | ✅ |
| 38 | Backup key invisible in light mode | Key box follows theme | ✅ WebKit |
| 39 | Switching theme dropped the sample-banner offset (headers slid under it) | Theme switch only swaps theme classes | ✅ WebKit |
| 40 | List names collapsed to 0 px on 320 pt screens (Documents titles vanished) | Row actions move under the name on narrow screens | ✅ 188 pt names at 320 |
| 41 | Small buttons 36 pt, sheet close 36 pt, chips 36 pt | 44 pt (chips keep a compact look with a 44 pt hit area) | ✅ |
| 42 | Secondary text below WCAG AA in both themes | Darker/lighter tertiary text, darker gold for light chips | ✅ |
| 43 | Offline bar under the status bar; lock dead band on tall phones; Duo lock row in home-indicator zone | Safe-area padding; centred lock on tall screens; extra bottom margin | ✅ |
| 44 | Header gap under the sample banner | Headers don't add the status-bar inset twice | ✅ |
| 45 | Large text: greeting truncated, quick-add buttons spilled off the card | Greeting wraps; quick-add reflows to one column | ✅ simulator (Accessibility Medium) |

## Not done (needs you or a later phase)
- Sign in to Xcode with the Apple Developer account (required to upload).
- Face ID unlock + Keychain-wrapped key (changes encryption; needs a migration plan).
- Real-device TestFlight check (launch speed, camera, share sheet).
- App Store Connect metadata, screenshots, privacy label, review notes.
