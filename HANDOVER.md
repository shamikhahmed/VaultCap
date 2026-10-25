# VaultCap — Handover

> Read this + `ROADMAP.md` + `~/Capricorn-Brain/01 Projects/VaultCap.md` before working here.
> Last updated: 2026-10-25 · Fleet-wide standard: `capricorn-tooling/shared/CAP-STANDARD.md`

## What this is
Personal vault — encrypted offline finance, identity, family vault. PK/UK/UAE expat finance. **100% free** consumer PWA.

## Facts
**Version:** 5.4.3 (HIG 6 on `design/hig-3`; owner may release as 6.0.0)
**Live:** https://shamikhahmed.github.io/VaultCap
**Repo:** https://github.com/shamikhahmed/VaultCap
**Stack:** Vanilla JS → `dist/vaultcap.boot.js` (lock/onboard) + lazy `dist/vaultcap.app.js` / VaultLazy modules. PIN-first unlock + recovery/backup keys + `.vos`. CSP `script-src 'self'` via `Act`/`data-act*`. Playwright e2e + XSS audit. Design: `css/design/*` + `DESIGN.md`.
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
- `dist/vaultcap.boot.js` + `dist/vaultcap.app.js` via `npm run build:js` (`js/bundle-boot-order.json` / `js/bundle-app-order.json`); `vaultcap.bundle.js` aliases boot for probes
- SW `sw-v51.js` cache `vaultcap-v100` (must match `VERSION.json` `swCache`)
- `.github/workflows/` — ci.yml + pages.yml
- Leave `VaultProfiles.switch()` full reload as-is (owner decision)

## Cap Standard status (2026-10-25)
| Cap Standard item | Status |
|---|---|
| Docs pack | ✅ |
| Screen gallery | ✅ |
| Version discipline | ✅ 5.4.3 / vaultcap-v100 |
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
- `npm run build:js` minifies via esbuild; keep the `/*! VaultCap boot|app */` banner (install-banner SW probe). Set `VC_NO_MINIFY=1` only for debugging.
- First-load JS target <250 KB (boot + storage + boot-*). Unlock calls `VaultLazy.ensure('app')` before Dash/nav.
- QA evidence lives in `build/qa/` (gitignored). Curated v6 docs: `qa/v6/`. Never put screenshots in `test-results/` for safekeeping.
- App Store / native iOS work: branch `perfection/v6-appstore`; pack in `qa/v6/APP-STORE.md`. Face ID + Keychain wrap = owner design decision only.
- Privacy AI provider is Cloudflare Workers AI (proxy), not the old UI “claude-haiku” label.

## Where decisions live
- Dated decisions: Capricorn-Brain project note (path above)
- Release history: `CHANGELOG.md`
- Fleet-level events: `Cap-Apps/docs/CHANGELOG.md` (master)
