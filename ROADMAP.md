# VaultCap — Roadmap

> Updated 2026-07-11. Fleet order & standard: `capricorn-tooling/shared/CAP-STANDARD.md`.

## Now — v5.0.0
Current shipped state. See `CHANGELOG.md` for how we got here.

## Cap Standard gaps
| Cap Standard item | Status |
|---|---|
| Docs pack | ✅ |
| Screen gallery | ✅ |
| Version discipline | ✅ |
| QA / e2e | ✅ |
| CI gate | ✅ |
| PWA polish | ✅ |
| Demo mode | ✅ |

## Next (ordered)
1. Phase 1 launch checklist (brain note): full e2e re-run, soft launch install link to select testers
2. Review 4 remote meridian/* beta branches — merge or delete (beta-complete, beta-readiness, dashboard-spacing, pin-recovery-fix)
3. Align script names to Cap Standard contract (`verify` alias)

## Later
- App Store / Play / MS Store — deferred by decision (PWA + install.html only)
- Support contact on trust pages — skipped by decision

## Ground rules
- No dirty trees: commit or discard before ending a session.
- CI green before tag; tag `vX.Y.Z` per release.
- Bump SW cache with any asset change (PWA apps).
- Never commit `.env` / secrets.
