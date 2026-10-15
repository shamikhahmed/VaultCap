# VaultCap — TestFlight / App Store readiness (G-1 / D-01)

Readiness only. **Do not upload or submit** from this finish loop. Upload is an owner Apple-account action (**BLOCKED-EXTERNAL**).

## Status (Perfection v4)

| Step | Status |
|---|---|
| Capacitor 8 iOS project | ✅ `ios/` (matches ScentCap CapApp-SPM 8.4.0) |
| Store copy + fields | ✅ Ready — `APP-STORE.md` |
| Privacy labels | ✅ Ready — `PRIVACY-LABELS.md` |
| Screenshot shot list | ✅ Ready — `SCREENSHOTS.md` |
| Privacy manifest | ✅ `ios/App/App/PrivacyInfo.xcprivacy` |
| Info.plist purpose strings | ✅ Camera, Photos, Face ID |
| Export compliance | ✅ `ITSAppUsesNonExemptEncryption` = false |
| Xcode 26 / iOS 26 SDK clean build | ⛔ **BLOCKED** — see below |
| App Store Connect upload / TestFlight | ⛔ **BLOCKED-EXTERNAL** |

## App identity

| Field | Value |
|---|---|
| Name | VaultCap |
| Subtitle | Encrypted life vault |
| Bundle ID | `com.capricorn.vaultcap` |
| SKU | `vaultcap-ios` |
| Marketing version | 5.3.0 |
| Build | 530 |
| Primary category | Productivity |
| Age rating | 4+ |
| Pricing | Free (G-2 — no IAP) |

## Purpose strings (Info.plist)

- **Camera:** VaultCap uses the camera to photograph documents and cards stored encrypted in your vault.
- **Photo Library:** VaultCap lets you choose photos to attach to documents and cards. Photos stay encrypted on this device.
- **Face ID:** VaultCap can use Face ID to unlock your vault when you enable biometric unlock.

## Privacy manifest

`ios/App/App/PrivacyInfo.xcprivacy`:

- `NSPrivacyTracking` = false; no tracking domains
- Required Reason APIs: UserDefaults (CA92.1), File Timestamp (C617.1), Disk Space (E174.1)
- No collected data types (vault contents encrypted on device; optional network logos/rates/import are opt-in — D-08)

## Build — Xcode 26 / iOS 26 SDK

### Prerequisites (owner machine)

1. Install **Xcode 26**.
2. Accept license / components; set active toolchain:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
xcodebuild -version
xcrun --sdk iphoneos --show-sdk-version
```

3. Node.js 20+.

### Clean archive steps

```bash
cd /path/to/VaultCap
npm ci
npm run icons:ios   # if icons need refresh
npm run cap:sync    # stages www/ + syncs Capacitor iOS
npx cap open ios
```

In Xcode 26:

1. Signing → Team; bundle `com.capricorn.vaultcap`.
2. **Product → Clean Build Folder** → **Archive**.
3. Distribute → App Store Connect → Upload (**owner only**).
4. TestFlight → Internal Testing.

CLI smoke build:

```bash
xcodebuild -project ios/App/App.xcodeproj -scheme App \
  -configuration Release -sdk iphoneos \
  -destination 'generic/platform=iOS' \
  clean build CODE_SIGNING_ALLOWED=NO
```

### BLOCKED on this agent machine (2026-10-15)

| Check | Result |
|---|---|
| `/Applications/Xcode*.app` | Missing |
| `xcode-select` active | Command Line Tools only |
| `xcrun --sdk iphoneos` | SDK not found |

**Exact next step:** Install Xcode 26, run `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`, then the clean archive steps. Do not submit until the owner is ready.

## Demo / review notes

- No account. Demo vault PIN `123456`.
- Network features (bank logos, rates, Smart Import) default **off** (D-08).
- About disclaimer: vault encrypted with PIN; forgot PIN → data unrecoverable — keep an export.

## URLs

- Support: https://shamikhahmed.github.io/support.html
- Privacy: https://shamikhahmed.github.io/VaultCap/privacy.html
