# VaultCap — Screen inventory (prod-ready audit)

Source: `index.html` page roots + `js/core/router.js` (`R.goto`) + `js/core/module-registry.js` + `js/core/nav-ui.js` (tabs / settings).  
Generated during HIG-3 prod-ready audit. Not guessed.

## Shell / auth surfaces

| ID | Kind | How opened |
|---|---|---|
| `#pgHome` | Welcome / entry | First paint, lock exit |
| `#pgLock` | PIN lock | `R.showLock()` / auto-lock |
| `#pgOnboard` | Onboarding wizard | First-run / reset |
| `#pgProfilePicker` | Profile switcher | VaultProfiles |
| `#splashScreen` | Boot splash | Boot only |
| `#app` | Main shell | After unlock |
| `#btabs` | Phone tab bar | Home · Money · Wealth · Identity · More |
| `#sidebar` / `#sbNav` | ≥700px sidebar | Same modules |
| `#fab` / `#fabMenu` | Quick add (hidden on utility/dashboard) | `FAB.toggle()` |
| `#modal` | Sheet/dialog | `Modal.open(...)` |
| `#themeOverlay` | Appearance picker | `ThemeEngine.openPicker()` |
| `#demoBanner` | Demo profile banner | Demo vault |

## App pages (`#pg-*`, `R.goto`)

| Page id | Title (chrome) | Group |
|---|---|---|
| `dashboard` | Dashboard | Home |
| `family` | Family | Home |
| `finance-home` | Banking & Cashflow | Money hub |
| `banks` | Banks | Banking |
| `cards` | Cards | Banking |
| `cash` | Cash | Banking |
| `loans` | Loans | Cashflow |
| `expenses` | Expenses | Cashflow |
| `bc` | Committee | Cashflow |
| `assets-home` | Holdings | Wealth hub |
| `investments` | Investments | Wealth |
| `bonds` | Prize Bonds | Wealth |
| `assets` | Property | Wealth |
| `vehicles` | Vehicles (alias → assets / vehicle) | Wealth |
| `gadgets` | Gadgets (alias → assets / electronics) | Wealth |
| `gold` | Precious Metals (alias → assets / precious_metals) | Wealth |
| `vault-home` | Identity | Identity hub |
| `friends` | Contacts | Identity |
| `sims` | SIM Cards | Identity |
| `documents` | Documents | Identity |
| `emails` | Email Identities | Identity |
| `digital` | Digital Services | Identity |
| `currency` | Currency | Planning |
| `zakat` | Zakat | Planning |
| `credit` | Credit Score | Planning |
| `tax` | Tax Calculator | Planning |
| `alerts` | Alerts | Tools |
| `reminders` | Reminders | Tools |
| `timeline` | Timeline | Tools |
| `import` | Smart Import (`ai-import` alias) | Tools |
| `search` | Search | Tools |
| `trash` | Trash | Tools |
| `emergency` | Emergency | Tools |
| `recovery` | Recovery | Tools |
| `recovery-center` | Vault Recovery | Tools |
| `workspace` | Workspaces | Tools |
| `sync` | Sync Devices | Tools |
| `security` | Security Center | System |
| `backup` | Backup Center | System |
| `help` | Help & Guide | System |
| `settings` | Settings | System |

## Settings sub-tabs (`SettingsNav.show`)

Account · General · Appearance · Access · Alerts · Privacy · About

## Representative sheets (`Modal.open` titles)

Add/Edit Bank, Card, Cash, Investment, Loan, Friend, SIM, Email, Digital, Expense, Asset; Change PIN; Reset Vault; Encrypted Backup / Import Backup; Demo vault / Sample vault; Privacy Policy; License; Net Worth Breakdown; Smart Add; Smart Help; Appearance (theme overlay); Forgot PIN / Master Key Recovery; Countries & Regions; Display Currency; and module-specific sheets (bonds draw, bill, carrying cards, etc.).

## Demo vs empty

- Demo: `?demo=1` + `loadDemoProfile(...)` (personal / family / business / global).
- Empty: fresh profile after onboard or wipe — every list page must show empty state, not crash.
