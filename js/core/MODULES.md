# VaultCap Core Module Load Order

## Layer 0 — Data (no deps)
- constants.js, lookup-data.js, doc-schemas.js

## Layer 1 — Utilities (depends on Layer 0)
- utils.js, vault-utils.js, validators.js

## Layer 2 — Storage (depends on Layer 1)
- crypto.js, store-engine.js, smart-db.js, migrate.js

## Layer 3 — Core Services (depends on Layer 2)
- schema.js, vault-meta.js, module-registry.js, branding.js
- vault-relations.js, data-integrity.js, vault-safety.js
- vault-health.js, focus-trap.js

## Layer 4 — Feature Modules (depends on Layer 3)
- theme.js, pin.js, router.js, lazy-loader.js
- modal.js, activity.js, nav-ui.js, smart-actions.js
- emergency.js, ios-interactions.js, workspace-security.js
- onboarding-flow.js, onboarding-wizard.js, demo-boot.js
- demo-profiles.js, app-helpers.js, lock-recovery.js
- vault-profiles.js, family-pickers.js

## Layer 5 — Bootstrap
- app.js (depends on all layers above)

## Notes

### Cross-references (intentional — bootstrapped via global scope)
- `modal.js` references `window._familyEditCtx` set by `family-pickers.js` (Layer 4 → Layer 4 cross-ref)
- `smart-actions.js` references `window.Banks`, `window.Cards`, etc. — module globals set by js/modules/ after Layer 4 loads
- `vault-utils.js` references `window.S` (store state), `window.Toast`, `window.Store`, `window.CurrencyEngine` — all bootstrapped via global scope before use
- `lock-recovery.js` references `window._verifyMasterKey`, `window._confirmReset` — defined in modal.js; cross-reference: intentional (bootstrapped via global scope)
- `app-helpers.js` references `window.InstallPrompt`, `window.Haptic` — self-registers to global; cross-reference: intentional (bootstrapped via global scope)
