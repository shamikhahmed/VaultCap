# VaultCap — iOS Build Guide

> Version 5.3.0 · Capacitor 8 · App Store / TestFlight readiness (no submission in finish program)

Matches ScentCap’s Capacitor 8 + CapApp-SPM setup (`capacitor-swift-pm` exact 8.4.0).

## Prerequisites

- macOS with **Xcode 26** (iOS 26 SDK)
- Apple Developer account (owner — TestFlight / App Store)
- Node.js 20+
- Full Xcode as active developer directory:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
xcodebuild -version
xcrun --sdk iphoneos --show-sdk-version
```

## Quick start

```bash
npm ci
npm run build:js
npx cap sync ios
npx cap open ios
```

Scripts:

```bash
npm run cap:sync    # build:js + cap sync ios
npm run cap:ios     # cap:sync + open Xcode
npm run cap:open    # open existing ios/ project
```

`webDir` is `.` (static PWA root). Sync copies the site into the native shell; keep sensitive `.env` / secrets out of the tree.

## Xcode 26 workflow

1. `npm run cap:ios`
2. Signing → Team; bundle `com.capricorn.vaultcap`
3. Clean Build Folder → Archive
4. Upload via Organizer (**owner**; outside finish program)

CLI smoke build:

```bash
xcodebuild -project ios/App/App.xcodeproj -scheme App \
  -configuration Release -sdk iphoneos \
  -destination 'generic/platform=iOS' \
  clean build CODE_SIGNING_ALLOWED=NO
```

## Info.plist

- `CFBundleDisplayName`: VaultCap
- `MARKETING_VERSION`: 5.3.0 · `CURRENT_PROJECT_VERSION`: 530
- `NSCameraUsageDescription` — document/card photos
- `NSPhotoLibraryUsageDescription` — attach photos
- `NSFaceIDUsageDescription` — optional biometric unlock
- `ITSAppUsesNonExemptEncryption`: false

See also [`IOS_INFO_PLIST.md`](./IOS_INFO_PLIST.md).

## Privacy manifest

`ios/App/App/PrivacyInfo.xcprivacy` — no tracking; UserDefaults / File Timestamp / Disk Space declared.

## Agent / CI machine status (2026-10-15)

⛔ **BLOCKED:** Command Line Tools only; no Xcode.app; no `iphoneos` SDK.

**Exact next step:** Install Xcode 26 → `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer` → re-run clean archive. Details: [`store/TESTFLIGHT.md`](./store/TESTFLIGHT.md).

## Pricing

Free. No IAP (G-2).
