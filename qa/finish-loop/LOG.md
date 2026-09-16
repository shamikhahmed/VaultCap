
## C-01/C-02 — 2026-09-14
- Fixed SW install: removed gitignored `widget-data.json` from precache; resilient per-asset add.
- Released **5.2.0** / `vaultcap-v91`. CI green run 34878722406. Pages after CI run 34879053431.
- Live smoke: `https://shamikhahmed.github.io/VaultCap/sw-v51.js` serves `vaultcap-v91`; VERSION.json 5.2.0.

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

## 2026-09-15 — Tier 1 automated PASS
- CI green: https://github.com/shamikhahmed/VaultCap/actions/runs/34960909352
- VO ⛔ not linked · Xcode ⛔ BLOCKED-EXTERNAL
- Next: MasteryCap (order §14)

### 2026-09-15 VaultCap gallery regen
- First run SIGTERM (~13.6m) mid-capture; port conflict then VaultDB race on retry
- Fixed tests/screenshots.spec.js: guard Store.save until VaultDB ready + wait for VaultDB/Store
- `npm run gallery` PASS (1 test, ~9.3m) — 89 screens embedded into screen-gallery.html

## 2026-09-16 — kill-list (C-29 hardened)
- Branch: finish/vaultcap-killlist
- Before: rawHex 382 / sub11 4 / important 91
- After: rawHex 0 / sub11 0 / important 0 (outline-none still open)
- Approach: bank/card gradients → js/brand/colors.js; theme vars → css/tokens.css; strip non-media !important; type floors
