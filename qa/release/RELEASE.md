# VaultCap 6.0.0 — Release

| | |
|---|---|
| **Version** | 6.0.0 |
| **SW cache** | `vaultcap-v600` |
| **Previous** | 5.4.3 / tag `v5.4.3` |
| **Branch** | `release/6.0.0` (cut from `origin/main`) |
| **PR** | [#7](https://github.com/shamikhahmed/VaultCap/pull/7) — HIG 6 design system + production-readiness audit (merged to main as 5.4.3 by mistake; this release versions it as 6.0.0) |
| **Live** | https://shamikhahmed.github.io/VaultCap/ |
| **Date** | 2026-10-25 |

## What changed

User-facing redesign to the Cap HIG 6 system: floating glass tab bar, rebuilt dashboard, Cancel/Title/Save sheets, document scrolling on iPhone, sheet scroll lock/restore, and pull-to-refresh removed (owner decision — keep removed). Production audit fixes (Esc closes sheets, a11y axe serious/critical, CSS load path, version coherence).

No new product features beyond what already landed on main via PR #7.

## Rollback

Revert the squash commit that ships 6.0.0; previous tag **v5.4.3**.

## Reviewer commands

```bash
# Pre-merge gate (outside sandbox):
bash qa/release/run-checks.sh

# After merge + Pages deploy:
node qa/release/live-smoke.mjs https://shamikhahmed.github.io/VaultCap/
```
