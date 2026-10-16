# VaultCap — App Store pack (readiness only; no submission)

| Field | Value |
|---|---|
| **Name (≤30)** | VaultCap |
| **Subtitle (≤30)** | Encrypted life vault |
| **Bundle ID** | `com.capricorn.vaultcap` |
| **SKU** | `vaultcap-ios` |
| **Version** | 5.3.1 (build 531) |
| **Primary category** | Productivity |
| **Age rating** | 4+ |
| **Pricing** | Free — no IAP (G-2) |

## Description

Everything you own, encrypted on your device. Banks, cards, documents, and more — offline-first with an optional opt-in network layer for logos and rates.

## Keywords

vault, encrypted, documents, banks, cards, offline, password

## URLs

- **Support:** https://shamikhahmed.github.io/support.html
- **Privacy:** https://shamikhahmed.github.io/VaultCap/privacy.html

## Review notes

No account. Demo vault PIN `123456`. Network features default off. Your vault is encrypted on this device with your PIN. If you forget it, your data can't be recovered — keep an export somewhere safe.

## Encryption

`ITSAppUsesNonExemptEncryption` = false (standard WebCrypto / OS crypto; see `SECURITY.md`).

## Native

Capacitor 8 iOS under `ios/` (CapApp-SPM → `capacitor-swift-pm` 8.4.0). See [`TESTFLIGHT.md`](./TESTFLIGHT.md) and [`../IOS-BUILD.md`](../IOS-BUILD.md).
