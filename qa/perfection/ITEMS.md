# VaultCap — Perfection Loop v3 · ITEMS

Seeded from CURSOR-PERFECTION-LOOP.md §13.1.

### VLT-V3-1 — "Skip to content" link target &lt; 32px
severity: P1 · status: ✅ VERIFIED  
Where: all touch devices · WebKit+Chromium · lock/home after `?demo=1`  
Evidence: fleet live scan (1×1 clip) → `qa/perfection/baseline/device-qa.json` (tapUnder32=0)  
Cause: `.cap-skip-link` used 1×1 clip-path hide; focused padding ~34px tall — device-qa counted the clipped box  
Fix: park off-screen with `translateY(-200%)`, `min-height/min-width: 44px`, inline-flex; themes.css reinforces vault tokens (capricorn-core + themes)  
Test: device-qa baseline/post-fix · a11y `.cap-skip-link` count  
Auditor: ✅ VERIFIED 2026-10-14T11:30:00Z — Skip to content not in smallTargets; post-fix tap=0. Independent android residual Exit/INPUT/Close → tracked VLT-V3-5 not VLT-V3-1.

### VLT-V3-2 — merge finish/vaultcap-stepR + review wip/vaultcap-2026-09
severity: P1 · status: ✅ VERIFIED  
Where: fleet Phase 0 + Builder Phase B  
Cause: finish already on `main` @ `ec839d8`; wip held LCP / P-VLT-1 / demo-path improvements  
Fix: Phase 0 merge (Conductor); Builder integrated wip hunks into `perfection/vaultcap-v3` (identity, tokens, index, app.js, demo-boot, bundle-order). **Did not delete** `wip/vaultcap-2026-09`. LLM modules remain loadable via `VaultLazy.llmStack()` (not removed as a feature).  
Auditor: ✅ VERIFIED 2026-10-14T11:30:00Z — finish/wip integrated on perfection/vaultcap-v3 @ 010f7a2

### VLT-V3-3 — gallery manifest v3 (0 parseable v2 shots)
severity: P2 · status: ✅ FIXED  
Where: `docs/screenshots/gallery/` · live capture @ shamikhahmed.github.io/VaultCap/?demo=1  
Evidence: schema v2 manifest · **36** WebP (6 primary screens × light/dark × iphone/ipad/mac) · `npm run gallery:v3`  
Cause: v2 schema empty  
Fix: `scripts/live-gallery-v3.mjs` + shared `screen-gallery.*` viewer  
Auditor: —

### VLT-V3-4 — residual `style-src 'unsafe-inline'` (~800 inline styles)
severity: P2 · status: ⏳ OPEN (L later if high risk)  
Where: CSP + inline style attributes  
Cause: historical inline styles in templates  
Fix: reduce where safe; document remainder (Phase E/H)  
Auditor: —

### VLT-V3-5 — demo Exit / panic target race (transient &lt;32px)
severity: P2 · status: ✅ FIXED  
Where: Chromium Android mid-boot (flaky before layout.css)  
Cause: Exit/panic sized only in layout.css; banner can show before it applies  
Fix: critical inline CSS in `index.html` for `.demo-banner-exit` + `.panic-btn` 44×44; layout.css already 44px  
Evidence: post-fix android tapUnder32=0; release verification  
Auditor: ❌ REJECTED 2026-10-14T11:30:00Z on pre-critical-CSS build; re-verify after 5.3.0

### VLT-V3-6 — residual soft tap label `VaultCap/`
severity: P3 · status: L (false positive)  
Where: `qa/perfection/auditor-conductor/` soft tap&lt;32 on touch devices  
Cause: device-qa URL pointed at fleet-root serve (`http://127.0.0.1:8783/?demo=1`) — directory listing link text `VaultCap/`, not app skip-link or in-app control  
Fix: N/A — not a product defect. Serve app root or use `--url=VaultCap=http://127.0.0.1:<port>/?demo=1` from VaultCap cwd. Skip-link remains off-screen 44×44 (VLT-V3-1).  
Auditor: documented Phase I 2026-10-14
