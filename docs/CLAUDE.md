# CLAUDE.md

This file provides guidance for AI coding assistants when working with code in this repository.

## Running the App

No build required for dev — open `index.html` or serve static. **Ship:** `npm run build:js` (bundle → `dist/vaultcap.bundle.js`, gitignored; CI builds on Pages deploy).

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

Demo PIN for testing: **123456**

For iPhone PWA: Safari → Share → Add to Home Screen.

## Architecture

VaultCap is a client-side encrypted finance/identity vault PWA. Uses vanilla JS, Playwright E2E, optional Capacitor iOS wrapper.

```bash
python3 -m http.server 8765
# or: npx playwright test
```

Demo PIN: **123456**

## Architecture (current — v5.0.x)

| Layer | Role |
|-------|------|
| `index.html` | SPA shell, 70+ script tags, SW registration (`sw-v51.js`) |
| `js/core/store-engine.js` | Global state `S` + `Store.save/load` |
| `js/storage.js` | **VaultDB** — IndexedDB + AES-256-GCM |
| `js/core/migrate.js` | Schema migrations (`SCHEMA_VERSION` = 13) |
| `js/modules/*` | Feature modules (banks, cards, family, zakat, …) |
| `js/ui.js` | Dashboard, settings, export/import, QR sync |

**Storage:** Primary persistence is encrypted **IndexedDB** via `VaultDB`, not `localStorage['vos3']` (legacy migration only). All features are free — no paywall.

Key properties:
- `S.user` — profile, theme, currency, net worth history
- `S[moduleId]` — array of records for each module (e.g. `S.banks`, `S.cards`, `S.vehicles`)
- `S.modules` — object of booleans controlling which modules are active
- `S.wallet` — card IDs currently in today's wallet
- `S.pin` / `S.decoyPin` / `S.noPin` — authentication config
- `S.unlocked` / `S.decoy` — runtime session flags

### Routing

`R.goto(page)` (`app.js:655`) — toggles `.on` class on `#pg-{page}` elements and calls the module's `render()`. Page IDs match module IDs (`banks`, `cards`, `dashboard`, etc.).

### Module Pattern

Each data module follows this pattern:
- `ModuleName.render()` — rebuilds the page's inner HTML
- `ModuleName.add()` / `ModuleName.edit(id)` — opens a modal form
- `ModuleName.save()` / `ModuleName.del(id)` — mutates `S[moduleId]`, calls `Store.save()`, re-renders

### Security Architecture

- **PIN**: 6-digit; verified by `PIN.verify()` (`app.js:751`); lockout after failed attempts
- **Decoy mode**: entering `S.decoyPin` loads `loadDecoyData()` — fake data shown instead of real vault
- **Encryption**: `Crypto` object (`app.js:439`) uses Web Crypto API — PBKDF2 key derivation (310 000 iterations, SHA-256) → AES-256-GCM; used for `.vos` encrypted backup exports
- **Panic lock**: `PanicLock.trigger()` — immediately locks and blanks `.sens` elements
- **Privacy mode**: adds `privacy` class to `<body>`; `.sens` elements are blurred
- **Auto-lock**: triggered on `visibilitychange` when `S.autoLock` is true

### Theming

5 themes defined in `THEMES` array (`app.js:1`). `ThemeEngine.apply(id)` sets `document.body.className` to the theme's `cls` value and updates CSS custom properties. All colour values are CSS variables (`--bg`, `--bg2`, `--bg3`, `--accent`, `--glow`, `--text`, `--text2`, `--text3`).

### CSS Conventions

- Sensitive values that should blur in privacy mode: add class `sens`
- Spacing: use `--sp1`–`--sp6` variables
- Borders/backgrounds: use `--glass`, `--glass2`, `--glass3`, `--border`, `--border2`
- Status colours: `--ok` (green), `--warn` (amber), `--err` (red), `--info` (blue)
- Border radius tokens: `--rsm`, `--r`, `--rlg`, `--rxl`, `--rfull`

### Command Palette & Keyboard Shortcuts

`CMD` object (`app.js:1033`) handles `⌘K` command palette. App-wide shortcuts (`⌘L` lock, `⌘N` add, `⌘F` search, `⌘1-3` nav) are registered in `App()` (`app.js:1164`).

### Export/Import

`ExIm` (`ui.js:253`) supports `.vos` (AES-256-GCM encrypted), `.vault` (legacy), `.json`, and `.csv` exports. `ImportEngine` (`ui.js:368`) provides AI-assisted smart import from screenshots, spreadsheets, and PDFs by parsing with a prompt sent to optional LLM API key.
