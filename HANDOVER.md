# VaultCap — Handover

> Read this + `ROADMAP.md` + `~/Capricorn-Brain/01 Projects/VaultCap.md` before working here.
> Last updated: 2026-07-19 · Fleet-wide standard: `capricorn-tooling/shared/CAP-STANDARD.md`

## What this is
Private life OS — encrypted offline finance, identity, family vault. PK/UK/UAE expat finance. **100% free** consumer PWA.

## Facts
**Version:** 5.1.17
**Live:** https://shamikhahmed.github.io/VaultCap
**Repo:** https://github.com/shamikhahmed/VaultCap
**Stack:** Vanilla JS → `dist/vaultcap.bundle.js`. PIN-first unlock + recovery/backup keys + `.vos`. CSP `script-src 'self'` via `Act`/`data-act*`. Playwright e2e + XSS audit.
**Data:** Encrypted IndexedDB; no required cloud/accounts.

## Run & verify
```bash
npm ci
npm run build:js
npm run audit:xss
npm run test:e2e
```

## Architecture
- `js/boot-*.js` — external boot (CSP)
- `js/core/` — crypto, PIN, Act, store, router
- `js/modules/` — feature modules
- `dist/vaultcap.bundle.js` via `npm run build:js`
- SW `sw-v51.js` cache `vaultcap-v79`
- `.github/workflows/` — ci.yml + pages.yml

## Cap Standard status (2026-07-18)
| Cap Standard item | Status |
|---|---|
| Docs pack | ✅ |
| Screen gallery | ✅ |
| Version discipline | ✅ 5.1.17 |
| QA / e2e | ✅ |
| CI gate | ✅ |
| PWA polish | ✅ |
| Demo mode | ✅ |
| CSP (no inline handlers) | ✅ |

Gaps are tracked as tasks in `ROADMAP.md`.

## Gotchas — read before coding
- Zero-knowledge locked: no email/password login, no cloud vault, no Clerk/Neon (2026-07-09 decision).
- Development also happens from mobile workflow — ALWAYS git pull before local work (local was behind remote on 2026-07-11).
- XSS audit is part of the pipeline — run audit:xss before any release.

## Where decisions live
- Dated decisions: Capricorn-Brain project note (path above)
- Release history: `CHANGELOG.md`
- Fleet-level events: `Cap-Apps/docs/CHANGELOG.md` (master)
