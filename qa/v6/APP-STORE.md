# VaultCap — App Store Connect sheet (v6)

Version **5.3.1** (build **531**) · Bundle ID `com.capricorn.vaultcap` · SKU `vaultcap-ios`  
Privacy policy claims traced to code 2026-10-19 (see gate table below).

## Listing

| Field | Value |
|---|---|
| **Name (≤30)** | VaultCap |
| **Subtitle (≤30)** | Private encrypted life vault |
| **Primary category** | Finance |
| **Secondary** | Productivity (optional) |
| **Age rating** | 4+ (no unrestricted web, no gambling, no mature themes beyond personal finance records) |
| **Pricing** | Free — no IAP, no subscriptions |

## Description (App Store)

VaultCap is a private life vault for your banks, cards, documents, family records, and planning tools. Everything is encrypted on your device. There is no account and no cloud copy of your vault.

- Offline-first: works without a network
- Optional live FX / metal rates (off by default) — public rates only, never vault contents
- Encrypted `.vos` backups via the iOS share sheet
- Sample vault for a safe first look (fictional data)

VaultCap is not a bank, broker, or financial adviser. Figures and rates are for your own records; they are not financial advice.

## Keywords (≤100 chars)

vault,encrypted,finance,banks,cards,documents,offline,zakat,networth,backup

## URLs

| Role | URL |
|---|---|
| **Privacy** | https://shamikhahmed.github.io/VaultCap/privacy.html |
| **Support** | https://shamikhahmed.github.io/support.html |
| **Marketing (optional)** | https://shamikhahmed.github.io/VaultCap/ |

## Age rating answers (summary)

- Unrestricted web access: **No** (in-app browser only for links the user opens)
- Gambling / contests: **No** (prize-bond *tracker* only; no wagering)
- Contests: **No**
- Medical / drug: **No**
- Profanity / mature: **None**
- Horror / mature themes: **None**

## Privacy nutrition labels (App Store Connect)

Publisher does **not** collect data for tracking or advertising. On-device vault contents are not transmitted to Capricorn.

| Data type | Collected? | Linked to user? | Tracking? | Purpose |
|---|---|---|---|---|
| Photos or Videos | Optional (user attaches) | No | No | App Functionality — stored encrypted on device |
| Financial Info | On device only | No | No | App Functionality |
| Other User Content | On device only | No | No | App Functionality |
| Product Interaction | Local prefs only | No | No | App Functionality |

**Optional network (user enables):** FX/metals rate requests (no vault data). AI Smart Import and logo proxy are **web app only** and off by default — not offered in the iPhone/iPad build.

Do **not** select “Data Not Collected” if Apple treats optional photo attachments as collected data types — declare Photos as above.

Contact: support@capricornsystems.com · Privacy URL above.

## Review notes (paste into ASC)

```
No account / no sign-in.

To explore without creating a vault:
1. On the welcome screen tap “Explore a sample vault”.
2. On the lock screen tap “Use sample PIN” (fictional data only).
3. Tap “Start exploring”.

Sample banner reads “SAMPLE · Fictional data only”. Exit returns to a normal empty vault flow.

Network features default OFF (Settings → Privacy). The iOS build does not expose AI import or logo fetch.

Encrypted backup: Settings / Backup → export → iOS share sheet (Save to Files / AirDrop). “Backed up” only after a successful save.

Privacy Policy and License open inside the app (Settings → About).

Not financial advice. Indicative rates only when the optional rates toggle is on.
```

## Screenshot set (required sizes)

Capture from sample vault, light theme preferred for ASC; also keep dark for marketing.

| Size | Device class | Scenes |
|---|---|---|
| 6.9" | iPhone 16 Pro Max / 17 Pro Max class | Lock (sample), Dashboard, Banks, Documents, Settings → Privacy (toggles off), About |
| 6.5" | iPhone 15 Plus / 14 Plus class | Same |
| 13" iPad | iPad Pro 12.9 / 13 | Dashboard + Banks (sidebar / wide layout) |

Pipeline: `npm run gallery` → curated ASC crops from `build/qa/v6/` simulator shots. Status: regenerate after welcome/sample/luxe (banks.png dirty on branch).

## Encryption declaration

`ITSAppUsesNonExemptEncryption` = **false** (standard HTTPS + on-device WebCrypto / OS crypto). See `SECURITY.md` / `docs/store/TESTFLIGHT.md`.

## Claim ↔ code gate (Phase I)

| Claim | Evidence |
|---|---|
| No accounts / no analytics SDK | No auth API; no analytics package in `package.json` |
| Vault encrypted on device | `js/storage.js` VaultDB AES-GCM; PIN KDF PBKDF2 600k |
| Optional rates only | `RatesEngine.networkAllowed()` + Settings toggle |
| AI / logos web-only on native | `isNativeApp()` hides toggles in `js/ui.js` Settings Privacy |
| Privacy destinations ⊆ CSP | `privacy.html` table ⊆ `index.html` `connect-src` |
| Sample PIN not printed | `PIN.fillDemo` + `#demoPinBtn`; FIXED-LIST #31–35 |
| Not financial advice | Settings About copy + this listing |

## Owner-only (do not attempt in Cursor)

- Apple Developer sign-in / signing team
- ASC app record, privacy labels submit, binary upload
- TestFlight on a physical iPhone
- Face ID + Keychain-wrapped key (encryption change)
- Push to `main` / release tag (prepare only; owner approves)
