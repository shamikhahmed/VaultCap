# VaultCap 6.0.0 — Release report

**Date:** 2026-10-25  
**Branch:** `release/6.0.0`  
**Previous:** 5.4.3 / `v5.4.3`  
**PR:** [#7](https://github.com/shamikhahmed/VaultCap/pull/7) (HIG 6 + prod audit; versioned here as 6.0.0)  
**SW cache:** `vaultcap-v600`

## What this release is

Version-only ship of work already on `main`: Cap HIG 6 redesign + production-readiness audit. No additional product code fixes in this branch beyond the version bump and release gate scripts.

## Commits on this branch (release prep)

1. `01f775b` chore(release): bump VaultCap to 6.0.0 / vaultcap-v600
2. `6958c0d` docs(release): CHANGELOG + RELEASE.md for 6.0.0
3. `28520c0` test(release): add run-checks.sh and live-smoke.mjs
4. docs(release): REPORT + SUMMARY for reviewer gate (HEAD of release/6.0.0 prep)

## Reviewer must run

```bash
# Pre-merge / pre-tag (outside sandbox; writes qa/release/logs/ + SUMMARY.md):
bash qa/release/run-checks.sh

# After merge to main + Pages deploy:
node qa/release/live-smoke.mjs https://shamikhahmed.github.io/VaultCap/
```

Do **not** push/merge/tag/deploy from the agent — reviewer owns those one-command steps.

## Rollback

Revert the squash commit that ships 6.0.0; previous tag **v5.4.3**.

## Notes

- Pull-to-refresh stays removed (owner decision).
- `node_modules` is a worktree symlink — not committed.
- Unrelated local dirt left alone: `assets/screenshots/.../banks.png`, `qa/prod-ready/audit-findings.json`.
