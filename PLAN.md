# VaultCap — Sprint Plan (2026-07-09)

**Version target:** 5.1.1 (CSP hardened · PIN-first)  
**Distribution:** PWA + install.html only — **no app stores this sprint**  
**Launch:** Soft — share install link with select testers; no public announce / release tag yet

> Historical Phase 2 plan below kept for reference. Current ship = `CHANGELOG.md` / `VERSION.json`.

## Phase 0 — Foundation

- [x] Capricorn Brain `VaultCap.md` updated (v4.9.5, decisions)
- [x] `~/Capricorn-Brain/AI/Cursor/VaultCap-Claude-Code-Mobile-Workflow.md`
- [x] Local repo synced to `Desktop/Projects/VaultCap`
- [x] This `PLAN.md`

## Phase 1 — Launch hardening

- [x] `npm run build:js` green
- [x] `npm run audit:xss` green (prior run)
- [x] `npm run test:e2e` green (exit 0 after fixes)
- [x] `npm run test:e2e:safari` green
- [x] Landing/install CTAs wired
- [x] Version badges match `VERSION.json` (5.0.0)
- [x] Privacy: delete-vault / no-account copy clear
- [ ] Manual iPhone smoke (README checklist)

## Phase 2 — Product (all four)

- [x] **Expenses** — category bar chart + donut + monthly overview
- [x] **Assets** — purchase vs current P&L on rows + portfolio summary widget
- [x] **Cash** — multi-currency breakdown on dashboard Money widget
- [x] **SIMs** — contract expiry field + alerts + timeline + demo data

- [x] Gallery regen for v5.0.0 Phase 2 UI (`npm run gallery`)

## Deferred

- [ ] Google Play TWA / Apple wrapper / Microsoft Store
- [ ] Public GitHub release + social announce
- [ ] In-app store review links

## AI workflow

See Capricorn Brain: `VaultCap-Claude-Code-Mobile-Workflow.md`
