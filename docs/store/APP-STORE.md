# VaultCap — App Store pack (readiness only; no submission)

Canonical v6 sheet: [`qa/v6/APP-STORE.md`](../../qa/v6/APP-STORE.md).

| Field | Value |
|---|---|
| **Name (≤30)** | VaultCap |
| **Subtitle (≤30)** | Private encrypted life vault |
| **Bundle ID** | `com.capricorn.vaultcap` |
| **SKU** | `vaultcap-ios` |
| **Version** | 5.3.1 (build 531) |
| **Primary category** | Finance |
| **Age rating** | 4+ |
| **Pricing** | Free — no IAP (G-2) |

## Description

Everything you own, encrypted on your device. Banks, cards, documents, and more — offline-first with an optional opt-in network layer for public FX/metal rates. Not financial advice.

## Keywords

vault,encrypted,finance,banks,cards,documents,offline,zakat,networth,backup

## URLs

- **Support:** https://shamikhahmed.github.io/support.html
- **Privacy:** https://shamikhahmed.github.io/VaultCap/privacy.html

## Review notes

No account. Welcome → **Explore a sample vault** → lock → **Use sample PIN** → **Start exploring**. Network features default off. Vault encrypted on device with your PIN — if you forget it, data cannot be recovered; keep a `.vos` export.

## Encryption

`ITSAppUsesNonExemptEncryption` = false (standard WebCrypto / OS crypto; see `SECURITY.md`).

## Native

Capacitor 8 iOS under `ios/` (CapApp-SPM → `capacitor-swift-pm` 8.4.0). See [`TESTFLIGHT.md`](./TESTFLIGHT.md) and [`../IOS-BUILD.md`](../IOS-BUILD.md).
