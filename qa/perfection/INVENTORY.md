# VaultCap — Perfection v3 INVENTORY
Seeded from §13.1 + `index.html` page ids + `js/core/router.js` · 2026-10-14

Live entry: `/VaultCap/?demo=1` (PIN `123456`) · Stack: static JS PWA · own Pages

## Shell / global
| ID | Surface | Notes |
|---|---|---|
| S-SKIP | Skip to content | `.cap-skip-link` → `#mainPages` |
| S-SPLASH | Splash door | first-launch ≤600ms; skipped on `?demo=1` / `vc_splash_seen` |
| S-LOCK | PIN lock (`pgLock`) | keypad, WebAuthn, lockout bar |
| S-ONBOARD | Onboarding (`pgOnboard`) | first-run wizard |
| S-PROFILE | Profile picker (`pgProfilePicker`) | create / switch / decoy |
| S-HOME | App shell (`pgHome` + `#app`) | sidebar + bottom tabs + FAB + cmd palette |
| S-CMD | Command palette | ⌘K search |
| S-TOAST / S-ALERT | Toast / alert live regions | |
| S-DEMO | Demo banner | Exit demo |
| S-PANIC | Panic lock button | workspace security |
| S-MODAL | Generic modal + theme picker | `#overlay` / `#themeOv` |

## Primary pages (`pg-*`)
| ID | Page | Nav |
|---|---|---|
| S-DASH | dashboard | home / net worth |
| S-BANKS | banks | finance |
| S-CARDS | cards | finance |
| S-INV | investments | finance |
| S-CASH | cash | finance |
| S-LOANS | loans | finance |
| S-CREDIT | credit | finance |
| S-BONDS | bonds | finance |
| S-CURR | currency | finance |
| S-GOLD | gold (alias → assets filter) | assets |
| S-ZAKAT | zakat | finance |
| S-TAX | tax | finance |
| S-BC | bc (committees) | social/finance |
| S-FRIENDS | friends | social |
| S-FAMILY | family | social |
| S-SIMS | sims | vault |
| S-EMAILS | emails | vault |
| S-DOCS | documents | vault |
| S-ASSETS | assets | assets |
| S-GADGETS | gadgets (alias → assets) | assets |
| S-VEH | vehicles (alias → assets) | assets |
| S-DIGITAL | digital | vault |
| S-EXP | expenses | finance |
| S-REM | reminders | utility |
| S-ALERTS | alerts | utility |
| S-TIMELINE | timeline | utility |
| S-SEARCH | search | utility |
| S-IMPORT | import / Smart Import | utility |
| S-SEC | security | utility |
| S-BACKUP | backup / export | utility |
| S-RECOVERY | recovery | utility |
| S-RECOVERY-C | recovery-center | utility |
| S-SYNC | sync | utility |
| S-TRASH | trash | utility |
| S-EMERGENCY | emergency | utility |
| S-WORKSPACE | workspace | utility |
| S-HELP | help | utility |
| S-SETTINGS | settings / profile | utility |
| S-FIN-HOME | finance-home | hub section |
| S-VAULT-HOME | vault-home | hub section |
| S-ASSETS-HOME | assets-home | hub section |

## Forms (seed — expand in Phase C)
PIN setup / confirm / change · WebAuthn enrol · add/edit bank (IBAN) · card (masked+expiry) · loan · investment lot · document (photo/PDF) · committee members/rounds · reminder date/repeat · Smart Import paste · Zakat (nisab/holdings) · tax · export `.vos` passphrase · import `.vos` · family profile · decoy PIN · Settings account/appearance/modules

## States (§7.9)
empty · loading · error · offline bar · first-run · demo · lots-of-data · locked / lockout · decoy · reduce-motion · light/dark · panic-locked

## Flows to exercise
first-run → PIN → empty vault → add each type → net worth · lock/unlock · profile switch · export → erase → import · document PDF pack · decoy vault

## External / network (CSP connect-src)
| Destination | Purpose | Default |
|---|---|---|
| `https://open.er-api.com` | FX rates | opt-in (D-08) |
| `https://api.metals.live` | metals | opt-in |
| `https://data-asg.goldprice.org` | gold | opt-in |
| `https://vaultos-llm-proxy.shamikhahmed.workers.dev` | Smart Import LLM | opt-in + consent |
| Hub support / privacy | Settings links | G-4 |

## Decisions applied
P-VLT-1 (no marketing scene canvas in app shell) · P-VLT-2 (PBKDF2 ≥600k) · D-08 · G-1 store pack BLOCKED-EXTERNAL at submission
