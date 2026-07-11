# VaultCap — Handover

> Read this + `ROADMAP.md` + `~/Capricorn-Brain/01 Projects/VaultCap.md` before working here.
> Last updated: 2026-07-11 · Fleet-wide standard: `capricorn-tooling/shared/CAP-STANDARD.md`

## What this is
Private life OS — encrypted offline finance, identity, family vault. PK/UK/UAE expat finance.

## Facts
**Version:** 5.0.0
**Live:** https://shamikhahmed.github.io/VaultCap
**Repo:** https://github.com/shamikhahmed/VaultCap
**Stack:** Vanilla JS bundled via scripts/build-bundle.mjs. Zero-knowledge: PIN + master key + .vos backup. Playwright e2e + XSS audit.
**Data:** Encrypted local storage; .vos export/import backup. No cloud, no accounts (v1 decision).

## Run & verify
```bash
npm ci
npm run build:js
npm run audit:xss
npm run test:e2e
```

## Architecture
- `js/core/` — crypto, store, router
- `js/modules/` — feature modules (finance, identity, family, SIM contracts, ...)
- `dist/vaultcap.bundle.js` via `npm run build:js`
- 89-screen gallery + docs (LAUNCH, GUIDE, pitch, presentation)
- `.github/workflows/` — ci.yml + pages.yml

## Cap Standard status (2026-07-11)
| Cap Standard item | Status |
|---|---|
| Docs pack | ✅ |
| Screen gallery | ✅ |
| Version discipline | ✅ |
| QA / e2e | ✅ |
| CI gate | ✅ |
| PWA polish | ✅ |
| Demo mode | ✅ |

Gaps are tracked as tasks in `ROADMAP.md`.

## Gotchas — read before coding
- Zero-knowledge locked: no email/password login, no cloud vault, no Clerk/Neon (2026-07-09 decision).
- Development also happens from mobile workflow — ALWAYS git pull before local work (local was behind remote on 2026-07-11).
- XSS audit is part of the pipeline — run audit:xss before any release.

## Where decisions live
- Dated decisions: Capricorn-Brain project note (path above)
- Release history: `CHANGELOG.md`
- Fleet-level events: `Cap-Apps/docs/CHANGELOG.md` (master)
