# VaultCap — v6 inventory (Phase A)

Branch: `perfection/v6-appstore` · Version 5.3.1 · Reviewed against `index.html` page registry + `js/core/router.js` · 2026-10-19.

## Shell / auth

| ID | Role | Empty / loading / error |
|---|---|---|
| `pgHome` | Welcome (create vault / explore sample) | Sample-aware copy when demo active |
| `pgOnboard` | First-run PIN → recovery key | Toast-safe on short screens |
| `pgLock` | PIN unlock / sample PIN button | Migrate-from-passphrase path; forgot-PIN after fails |
| `pgProfilePicker` | Personal / sample / test sandbox | Dev-mode only for test |

## Hub pages

| ID | Module | Notes |
|---|---|---|
| `pg-dashboard` | Dashboard | Empty = one start card; with data = net worth leads |
| `pg-finance-home` | Banking & cashflow hub | |
| `pg-vault-home` | Identity hub | |
| `pg-assets-home` | Holdings hub | |
| `pg-settings` | Settings (7 sections) | Privacy network toggles; About |

## Feature pages (router `pg-*`)

banks · cards · cash · loans · investments · expenses · bc (committee) · friends · family · sims · emails · digital · documents · assets · gadgets · vehicles · gold · bonds · currency · zakat · tax · credit · alerts · reminders · search · import (Smart Import) · timeline · security · backup · recovery · recovery-center · emergency · help · workspace · trash · sync

## Sheets / overlays (representative)

- Add/edit forms per module (ComboPicker on former `<datalist>` fields)
- Encrypted backup export sheet (native share on iOS)
- Print / PDF (native print sheet on iOS)
- In-app Privacy Policy + License sheets (`ActHelpers`)
- Demo / sample welcome guide
- More overlay, toast stack, confirm dialogs
- Install / PWA banner — **hidden when `isNativeApp()`**

## Demo / sample path

1. Welcome → “Explore a sample vault”
2. Sample lock → “Use sample PIN” (PIN never printed)
3. Sample welcome sheet → Start exploring
4. Banner: `SAMPLE · Fictional data only · Exit`

## Network destinations (from code → must ⊆ privacy table ⊆ CSP)

| Destination | Code | Feature | Default |
|---|---|---|---|
| `https://open.er-api.com/v6/latest/USD` | `js/modules/rates.js` | Live FX | Off (`ratesNetworkEnabled`) |
| `https://api.metals.live/v1/spot` | `rates.js` | Metals | Off |
| `https://data-asg.goldprice.org/dbXRates/USD` | `rates.js` | Metals fallback | Off |
| `https://vaultos-llm-proxy.shamikhahmed.workers.dev` | `llm-assist.js`, `logo-engine.js` | AI parse + logo proxy | Off; **hidden in native iOS** |
| Same-origin `privacy.html`, `LICENSE` | `act-helpers.js` | In-app legal | Always |

CSP `connect-src` (`index.html`): `'self'` + the four hosts above.

External link opens (in-app browser on native): credit-bureau sites, prize-bond pages, GitHub — no vault data.

## Gate A

Inventory matched to `id="pg-*"` / shell IDs in `index.html` — no screen missing from this list.
