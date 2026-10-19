# VaultCap — Experience Lab (v6+ addendum)

Integrated into Perfection Loop v6 on branch `perfection/v6-appstore`. Does **not** replace phases A–K.

## Status (2026-10-19)

| Workstream | Status | Notes |
|---|---|---|
| Feature inventory | ◐ | Seeded from `INVENTORY.md` + forms/e2e coverage → `FEATURE-MATRIX.md` |
| Persona scenarios | ◐ | `PERSONAS.md` — 10 personas, 6 E2E scenarios (simulated usability) |
| Interaction inventory | ◐ | Mapped to existing Playwright suites; gaps listed in matrix |
| Motion (discreet vault) | ◐ | Audit `css/luxe.css` reduced-motion + spring; refine after visual pass |
| Typography / alignment | ◐ | Prior WebKit matrix + FIXED-LIST; re-check post-gallery |
| Device matrix | ◐ | iPad sweep tail open; MacBook sizes to add to harness |
| Presentations | ⏳ | After gallery + verified screenshots → `build/qa/v6/presentations/` |
| Demo videos | ⏳ | After simulator evidence → `build/qa/v6/videos/` |
| APP-REPORT Experience Lab section | ⏳ | Fill with real counts after gates |

## Order relative to v6 gates

1. Finish Phase I docs gate (privacy ⊆ CSP) — in progress  
2. `npm run verify` green ×2 (Phase J start)  
3. Feature matrix pass on critical paths (sample unlock, CRUD bank, export share stub on web, settings privacy)  
4. Persona scenarios (Playwright where possible; simulator video for native-only)  
5. Motion polish (reduced-motion already present; no bounce theater)  
6. Gallery regen → screenshots for decks  
7. iPad sweep tail  
8. Presentations + videos from **real** footage only  
9. Phases J/K close + APP-REPORT

## Evidence roots

- Curated in-git: `qa/v6/`
- Generated / large: `build/qa/v6/` (gitignored via `build/`)
