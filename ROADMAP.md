# VaultCap — Roadmap

> Updated 2026-07-18. Fleet order & standard: `capricorn-tooling/shared/CAP-STANDARD.md`.

## Now — v5.1.10
UX polish (44px targets, tax accent, integrity toast once, Space Grotesk fleet). CSP kill in 5.1.1. See `CHANGELOG.md`.

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
| CSP (no HTML handlers) | ✅ |

## Next (ordered)
1. Soft-launch install link to select testers; watch SW cache adoption (`vaultcap-v63`)
2. Review remote meridian/* beta branches — merge or delete
3. Optional: tighten `style-src` (fonts/themes) when ready

## Later
- App Store / Play / MS Store — deferred (PWA + install.html only)
- Support contact on trust pages — skipped by decision

## Ground rules
- No dirty trees: commit or discard before ending a session.
- CI green before tag; tag `vX.Y.Z` per release.
- Bump SW cache with any asset change (PWA apps).
- Never commit `.env` / secrets.
