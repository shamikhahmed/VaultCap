# VaultCap — Perfection Loop v3 · ITEMS

Seeded from CURSOR-PERFECTION-LOOP.md §13.1.

### VLT-V3-1 — "Skip to content" link target &lt; 32px
severity: P1 · status: ✅ FIXED  
Where: all touch devices · WebKit+Chromium · lock/home after `?demo=1`  
Evidence: fleet live scan (1×1 clip) → `qa/perfection/baseline/device-qa.json` (tapUnder32=0)  
Cause: `.cap-skip-link` used 1×1 clip-path hide; focused padding ~34px tall — device-qa counted the clipped box  
Fix: park off-screen with `translateY(-200%)`, `min-height/min-width: 44px`, inline-flex; themes.css reinforces vault tokens (capricorn-core + themes)  
Test: device-qa baseline/post-fix · a11y `.cap-skip-link` count  
Auditor: —

### VLT-V3-2 — merge finish/vaultcap-stepR + review wip/vaultcap-2026-09
severity: P1 · status: ✅ FIXED  
Where: fleet Phase 0 + Builder Phase B  
Cause: finish already on `main` @ `ec839d8`; wip held LCP / P-VLT-1 / demo-path improvements  
Fix: Phase 0 merge (Conductor); Builder integrated wip hunks into `perfection/vaultcap-v3` (identity, tokens, index, app.js, demo-boot, bundle-order). **Did not delete** `wip/vaultcap-2026-09`. LLM modules remain loadable via `VaultLazy.llmStack()` (not removed as a feature).  
Auditor: —

### VLT-V3-3 — gallery manifest v3 (0 parseable v2 shots)
severity: P2 · status: ⏳ OPEN  
Where: screen gallery / Phase G  
Cause: v2 schema empty  
Fix: — (Phase G full capture both themes × devices)  
Auditor: —

### VLT-V3-4 — residual `style-src 'unsafe-inline'` (~800 inline styles)
severity: P2 · status: ⏳ OPEN (L later if high risk)  
Where: CSP + inline style attributes  
Cause: historical inline styles in templates  
Fix: reduce where safe; document remainder (Phase E/H)  
Auditor: —

### VLT-V3-5 — demo Exit / panic target race (transient &lt;32px)
severity: P2 · status: ✅ FIXED (hardening)  
Where: Chromium Android mid-boot (flaky); Exit media query had min-height 40px  
Cause: race before layout CSS applied; `@media (max-width:400px)` Exit min-height 40px  
Fix: Exit media query → 44×44; panic-btn explicit min 44 + box-sizing  
Evidence: post-fix android tapUnder32=0  
Auditor: —
