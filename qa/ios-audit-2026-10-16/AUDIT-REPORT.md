# VaultCap iOS Audit Report — 2026-10-16

**App:** VaultCap 5.3.1 (live Pages + Capacitor 8 iOS shell)  
**Auditor mode:** Code + live WebView UI (iPhone 390×844). Native Simulator **blocked from Cursor agent sandbox**; Xcode opens successfully from user Terminal (`npm run cap:ios`).  
**Native stack:** Capacitor WebView — not SwiftUI. Swift files: `AppDelegate.swift`, `SceneDelegate.swift` only.

---

## 1. Executive summary

VaultCap is a mature encrypted offline life-vault **PWA wrapped for iOS**. Crypto design (AES-256-GCM + PBKDF2 600k + wrapped DEK) is serious. Mobile shell (tabs, sheets, lock keypad) is largely coherent on phone widths.

Biggest gaps for an “App Store–ready iOS vault”:
1. **Face ID claim vs reality** — Info.plist has `NSFaceIDUsageDescription`; unlock is **WebAuthn (web only, no Capacitor LocalAuthentication)**.
2. **iOS privacy surface** — demo banner shows PIN while unlocked; install PWA prompt can cover lock keypad; no native app-switcher privacy blur beyond CSS `app-blur`.
3. **Visual / IA metaphor debt** — “Chamber Floor”, gold-border tile grid, Tools→bell icon, ALL-CAPS kickers, dense dashboard.
4. **Version / store pack skew** — JS `5.3.1` vs Xcode `MARKETING_VERSION 5.3.0` / `CURRENT_PROJECT_VERSION 530`.
5. **Agent cannot drive Simulator** — CoreSimulator denied in Cursor sandbox; user Terminal works.

**Top 5 improvements:** (1) Wire true Face ID via Capacitor plugin or stop claiming it. (2) Hide demo PIN banner after unlock; never overlay install prompt on lock keypad. (3) Kill/rename “Chamber Floor”; fix Tools icon. (4) Sync native version to 5.3.1. (5) Resolve `--sp-*` token collision in `tokens.css`.

---

## 2. Architecture (accurate)

| Layer | Reality |
|-------|---------|
| UI | Vanilla JS SPA in WKWebView (`www/` → `ios/App/App/public/`) |
| State | Global `S` + `Store` / `VaultDB` (IndexedDB AES-GCM) |
| Auth | 6-digit PIN → KEK unwrap DEK; decoy PIN; optional WebAuthn PRF |
| Nav | Bottom tabs Home/Money/Wealth/Identity/More; hubs via sheets; sidebar ≥700px |
| Native | Capacitor 8.5.3 + Haptics only; no UITest target |

---

## 3. Screen inventory (condensed)

| Screen | Source | Visual | Func | Security | Status |
|--------|--------|--------|------|----------|--------|
| Welcome `pgHome` | index.html | Needs improvement | Good | Demo PIN exposed | Live-tested |
| Lock `pgLock` | index.html + pin.js | Good (phone) | Good | Demo PIN duplicate; install overlay risk | Live-tested |
| Onboarding | pgOnboard | Needs improvement | Good | Master key once | Code |
| Dashboard | Dash.render | Needs improvement | Good | Security % alarmist | Live-tested |
| Money sheet | openMoneySheet | Good | Good | — | Live-tested |
| Banks list | Banks | Good | Good | Masked **** | Live-tested |
| Cards / Cash / Loans / … | modules/* | Needs improvement | Good | Forms untested this pass | Partial |
| Settings tabs | SettingsNav | Needs improvement | Good | No-PIN / decoy | Code |
| Security / Backup / Recovery | ui.js | Needs improvement | Good | Claims match crypto mostly | Code |
| WebAuthn enroll | webauthn-unlock.js | — | Partial on iOS WKWebView | **Not native Face ID** | Code |

Full page IDs: see `qa/perfection/INVENTORY.md`.

---

## 4. Issue register

| ID | Sev | Category | Where | Problem | Fix | Verify |
|----|-----|----------|-------|---------|-----|--------|
| VLT-IOS-01 | P1 | Security / honesty | Info.plist + webauthn-unlock.js | Face ID string implies native biometrics; code is WebAuthn-only | Add Capacitor biometric plugin wrapping Keychain DEK **or** soften plist/copy | Unlock with Face ID on device |
| VLT-IOS-02 | P1 | Privacy | demo banner | PIN `123456` visible while vault unlocked | Hide PIN from banner after unlock; never show on lock for real vaults | Screenshot unlocked |
| VLT-IOS-03 | P1 | UX | Install prompt | Can cover lock keypad / FAB | Suppress install UI on `#pgLock`; raise z-index rules | Lock + install |
| VLT-IOS-04 | P2 | Visual / IA | Dashboard | “CHAMBER FLOOR” unclear metaphor | Rename to plain “Sections” / remove label | Screenshot |
| VLT-IOS-05 | P2 | Icons | Chamber Tools tile | Bell icon for Tools | Use wrench/settings-grid icon | Visual |
| VLT-IOS-06 | P2 | Typography / a11y | `cap-h2` kickers | VoiceOver reads `BankingBanks` (concat) | Space/separate accessible name | axe / VO |
| VLT-IOS-07 | P2 | Design tokens | tokens.css | `--sp-1` defined as 8px then overwritten to 4px | Single spacing scale | Grep CSS |
| VLT-IOS-08 | P2 | Release | project.pbxproj | Native 5.3.0 vs app 5.3.1 | Bump MARKETING/CURRENT | Xcode General |
| VLT-IOS-09 | P2 | Security UX | Dashboard seal | Demo “Security 32%” + “NEEDS ATTENTION” feels broken | Calibrate demo score / softer copy | Demo home |
| VLT-IOS-10 | P2 | iOS privacy | app.js visibilitychange | CSS blur only; no `UITextField.isSecureTextEntry`-style snapshot API | Capacitor plugin or screenshot notify + blank overlay | App switcher |
| VLT-IOS-11 | P3 | Visual | Lock / Home | Heavy ALL-CAPS + gold grid | Reduce caps; quieter borders | Design pass |
| VLT-IOS-12 | P3 | Forms | Search+sort | Sort `<select>` inside search row is cramped (11px) | Separate sort control | Banks |
| VLT-IOS-13 | P1 | Product risk | Settings No-PIN | Opens vault without PIN (confirmed dialog exists) | Keep confirm; consider hide on iOS store builds | Toggle |
| VLT-IOS-14 | P2 | Native gap | Capacitor | No LocalAuthentication / Keychain DEK backup | Roadmap Stage 1 | Device |

---

## 5. Design review (observed)

### Typography
- Body: system-ui / Space Grotesk stack — fine on iOS.
- Overuse of **11px ALL-CAPS** kickers (`BANKING`, `CHAMBER FLOOR`, `NET WORTH`) — hard to scan, weak Dynamic Type story.
- Display clock on lock is strong; hierarchy elsewhere competes (seal vs net worth vs chamber).

### Spacing / alignment
- Phone lock keypad: **good**, centered, HIG-adjacent.
- Dashboard: chip row (`All` + country) crowded under greeting.
- Banks: country headers + cards well aligned; FAB overlaps last rows (expected pattern, watch safe-area).

### Color
- Gold accent `#D4A017` on near-black — brand-consistent.
- Red **32%** next to gold “needs attention” is loud for a demo vault.
- Tag chips (commercial/digital) may fail AA on glass backgrounds — spot-check.

### Components
- Entry cards (banks) look production-ready (logo, mask, tags, 3 actions).
- Chamber tiles: same treatment as Money sheet tiles — intentional but heavy borders.
- Install prompt: PWA leftover; awkward inside Capacitor binary.

---

## 6. Security findings

### Confirmed (code)
- Vault ciphertext in IndexedDB via AES-GCM; session key cleared on lock (`router.lock`).
- Fail lockout + wipe gate after 10 fails (`pin.js`).
- Auto-lock on `visibilitychange` when `S.autoLock` (`app.js`).
- WebAuthn explicitly **“web only, no Capacitor”**.

### Risks / gaps
- **Native Face ID not implemented** despite plist (VLT-IOS-01).
- **Demo PIN in chrome** while unlocked (VLT-IOS-02).
- **No-PIN mode** exists (dangerous if enabled by mistake) — confirm dialog present.
- App-switcher mitigation is CSS-only (VLT-IOS-10).
- iOS Keychain not used for DEK — expected for this architecture; document honestly in App Store privacy.

### Not claimed
Not penetration-tested. Not verified Face ID on device this session.

---

## 7. Functional tests (this session)

| ID | Feature | Result | Notes |
|----|---------|--------|-------|
| T01 | Live demo boot | Pass | github.io `?demo=1` |
| T02 | Lock screen layout (390×844) | Pass | Keypad readable |
| T03 | Unlock demo | Pass | Landed Dashboard |
| T04 | Money sheet | Pass | Banks/Cards/Cash/… |
| T05 | Banks list | Pass | UK group, logos, masks |
| T06 | More sheet | Pass | Full module list |
| T07 | Xcode `cap:ios` (user Terminal) | Pass | Workspace opened |
| T08 | Agent `simctl` / `xcodebuild` | **Blocked** | Cursor sandbox |
| T09 | Face ID | Not tested | No native path |
| T10 | Forms add/edit persist | Not tested | Deferred |

---

## 8. Xcode / Simulator blockers (agent)

1. Cursor agent sandbox → CoreSimulator / LaunchServices / AppleScript denied.
2. `Simulator.app` not under `Xcode.app/Contents/Applications/` in this install listing (platforms may still work when Xcode Run is used from GUI).
3. User Terminal `npm run cap:ios` **works** — continue Run (⌘R) there.

Helper script (unsandboxed Terminal):  
`bash scripts/ios-sim-run-and-audit.sh`

---

## 9. Roadmap

**Stage 1 — Trust:** Face ID honesty or real plugin; hide demo PIN when unlocked; install prompt never on lock; version sync 5.3.1.  
**Stage 2 — UX:** Rename Chamber Floor; Tools icon; quieter security seal on demo; a11y heading names.  
**Stage 3 — Design system:** Fix `--sp-*` collision; reduce ALL-CAPS; Dynamic Type pass.  
**Stage 4 — Native:** App-switcher blanking; optional Keychain wrap; UITest smoke.  
**Stage 5 — Product:** Faster add flows; recently accessed with privacy; clipboard clear.

---

## 10. Acceptance checklist (honest)

- [x] Screens inventoried (from code + live)
- [x] Typography / spacing / color reviewed on Home, Lock, Banks, Money sheet
- [ ] Full form matrix — not this session
- [x] Auth model reviewed in code
- [ ] Native Simulator screenshots from agent — **blocked**
- [x] Limitations documented

---

*Report generated 2026-10-16. No source changes applied (audit-only).*
