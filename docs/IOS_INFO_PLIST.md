# VaultCap — iOS Info.plist notes

Configured in `ios/App/App/Info.plist` (Capacitor 8 shell):

| Key | Value |
|---|---|
| `CFBundleDisplayName` | VaultCap |
| `NSCameraUsageDescription` | Photograph documents and cards stored encrypted in your vault |
| `NSPhotoLibraryUsageDescription` | Choose photos to attach; stay encrypted on device |
| `NSFaceIDUsageDescription` | Optional biometric unlock |
| `ITSAppUsesNonExemptEncryption` | `false` (standard HTTPS / WebCrypto / OS crypto) |

Privacy policy URL: https://shamikhahmed.github.io/VaultCap/privacy.html

Store pack: [`store/TESTFLIGHT.md`](./store/TESTFLIGHT.md)
