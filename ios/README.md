# VaultCap iOS (Capacitor 8)

Store-readiness scaffold. **xcodebuild requires full Xcode** (not CLT-only) — treat compile/archive as BLOCKED-EXTERNAL on machines without Xcode.app.

## Setup (when Xcode is available)
```bash
npm i
npx cap sync ios
open ios/App/App.xcodeproj
```

- App ID: `com.capricorn.vaultcap`
- Privacy: `App/App/PrivacyInfo.xcprivacy`
- Encryption: `ITSAppUsesNonExemptEncryption = false` (standard WebCrypto / OS crypto)
- Store pack: `docs/store/`
