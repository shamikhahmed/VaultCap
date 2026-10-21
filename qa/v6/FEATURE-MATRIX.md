# VaultCap — feature / interaction traceability matrix (v6+)

Seeded from `INVENTORY.md`, FIXED-LIST, and Playwright suites. Status values: **pass** · **fail** · **blocked** · **partial** · **n/a** · **pending**.

Evidence under `build/qa/v6/` unless noted. Do not invent passes.

## Legend

- **Suite** = automated Playwright file covering the feature  
- **Cond** = key conditions tested (✓ done in suite / ○ planned)

## Critical shell

| ID | Feature | Screen | Suite / evidence | Cond | Result |
|---|---|---|---|---|---|
| VLT-S01 | Welcome create vault | pgHome | smoke, onboarding paths | first/invalid PIN | pass (suite 2026-10-19) |
| VLT-S02 | Explore sample vault | pgHome | smoke `?demo=1` | first | pass |
| VLT-S03 | Sample PIN one-tap | pgLock | smoke unlock | no PIN print | pass (smoke demo PIN) |
| VLT-S04 | Lock / unlock | pgLock | smoke, lockout, vault-switch | fail lockout | pass |
| VLT-S05 | Switch vault | pgLock | vault-switch.spec | | pass |
| VLT-S06 | Theme dark/light/system | settings | theme-audit | preserve body classes | pass |
| VLT-S07 | Dynamic Type scale | shell | FIXED #26; dt | 1/1.3/1.6 | partial (prior FIXED; dt re-run pending) |
| VLT-S08 | Bottom tabs / sidebar | shell | viewport.spec | 320–1280 | pass |
| VLT-S09 | Install banner (web only) | shell | install-banner | hidden native | pass |
| VLT-S10 | Privacy policy in-app | settings | act-helpers fetch | | partial (privacy page satellite pass) |

## Modules — CRUD / render

| ID | Feature | Suite | Result |
|---|---|---|---|
| VLT-M01 | Dashboard empty + with data | smoke, dashboard paths | pass |
| VLT-M02 | Banks list/add/edit/del | forms-coverage, webkit bank | pass |
| VLT-M03 | ComboPicker (53 former datalists) | forms-coverage | pass |
| VLT-M04 | Cards / cash / loans / inv / expenses | forms-coverage, modules | pass |
| VLT-M05 | Family / friends / sims / emails / digital | forms-coverage | pass |
| VLT-M06 | Documents search/list | viewport 320 docs | pass (nav); layout 320 prior WARN |
| VLT-M07 | Assets / gadgets / vehicles / gold / bonds | modules, full-nav | pass |
| VLT-M08 | Currency / zakat / tax / credit | modules, tax | pass |
| VLT-M09 | Alerts / reminders / timeline / search | full-navigation | pass |
| VLT-M10 | Smart Import (offline parser) | smart-parser | pass |
| VLT-M11 | Security / backup / recovery / trash / sync | settings, smoke | pass |
| VLT-M12 | Full nav all pages | full-navigation | pass |
| VLT-M13 | Settings 7 tabs + aliases | settings-tabs | pass |

## Security / privacy / integrity

| ID | Feature | Suite / FIXED | Result |
|---|---|---|---|
| VLT-P01 | Network default off | network-default-off | pass |
| VLT-P02 | XSS audit | `npm run audit:xss` | pass |
| VLT-P03 | Encrypted .vos round-trip | vaultdb-import | pass |
| VLT-P04 | DEK wrap / KDF | vault-kdf-wrap | pass |
| VLT-P05 | Security score from persisted state | FIXED #11 | pass (prior) |
| VLT-P06 | Sample integrity 0 false dupes | FIXED #15 | pass (prior) |
| VLT-P07 | Native clipboard expiry | FIXED #10 sim | blocked* |
| VLT-P08 | App-switcher cover | FIXED #9 sim | blocked* |
| VLT-P09 | Native share backup | FIXED #1 sim | blocked* |
| VLT-P10 | Native print | FIXED #3 sim | blocked* |

\*Blocked in this Cursor session until simulator retest this turn; prior ✅ recorded 2026-10-17.

## Interaction classes (coverage map)

| Class | Covered by | Gaps |
|---|---|---|
| Buttons / icon buttons | forms, smoke, settings | Rapid double-submit matrix ○ |
| Tabs / nav | settings-tabs, viewport, full-nav | Duo fold transition ○ |
| ComboPicker / search / filters | forms-coverage | Every picker on device Prompt 3B ○ |
| Switches | settings privacy | | 
| Sheets / dialogs / toasts | forms, FIXED close icon | Encrypted backup sheet light N1 ○ |
| Export / share / print | FIXED native; web export | Native video evidence regen ○ |
| Theme | theme-audit | |
| Destructive delete | forms del flows | Confirm copy audit ○ |

## Defect log (Experience Lab)

| Sev | Problem | Root cause | Fix | Regression |
|---|---|---|---|---|
| — | *(none new this session yet)* | | | |

Prior FIXED-LIST #1–45 remain the regression baseline.
