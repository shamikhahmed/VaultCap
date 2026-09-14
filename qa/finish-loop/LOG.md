
## C-01/C-02 — 2026-09-14
- Fixed SW install: removed gitignored `widget-data.json` from precache; resilient per-asset add.
- Released **5.2.0** / `vaultcap-v90`. CI green run 34878722406. Pages after CI run 34879053431.
- Live smoke: `https://shamikhahmed.github.io/VaultCap/sw-v51.js` serves `vaultcap-v90`; VERSION.json 5.2.0.

### VLT-P0-02 network opt-in ✅
Logos / rates / LLM default off; Privacy toggles; network-default-off e2e green.

### VLT-P0-03 KDF docs ✅
SECURITY.md documents 600k target + 310k re-wrap.

### VLT-P1-01 privacy.html marketing JS ✅
### VLT-P1-03 sub-11px (css pass) ✅ in progress

### VLT-P1-05 store pack (partial) ✅
docs/store/* + PrivacyInfo.xcprivacy scaffold.
⛔ BLOCKED-EXTERNAL: Capacitor 8 Xcode 26 build needs full Xcode (CLT only here).
### VLT-P1-07 VaultPro ✅
No VaultPro / LAUNCH_PREVIEW gating found.
