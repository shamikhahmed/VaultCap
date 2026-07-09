# VaultCap — Private Life Operating System

[![Live App](https://img.shields.io/badge/Live%20App-VaultCap-ffffff?style=for-the-badge&labelColor=000000)](https://shamikhahmed.github.io/VaultCap)
[![PWA](https://img.shields.io/badge/PWA-Offline%20First-orange?style=for-the-badge)](https://shamikhahmed.github.io/VaultCap)
[![License](https://img.shields.io/badge/License-Source%20Available-green?style=for-the-badge)](./LICENSE)

> **Your entire financial and personal life. Encrypted. Offline. Always with you.**

VaultCap by Capricorn Systems is a zero-knowledge personal life operating system built as a PWA. No servers. No accounts. No subscriptions. All data stays on your device, encrypted with AES-256-GCM.

---

## What It Does

VaultCap replaces a dozen fragmented apps with one encrypted vault — managing banks, cards, investments, loans, documents, family, identity, and more across Pakistan, the UK, and the UAE.

### Finance
- Banks & accounts across PK/UK/UAE with IBAN tracking
- Cards with expiry alerts and camera OCR scan
- Investments with P&L tracking (stocks, crypto, mutual funds, sukuk)
- Loans with partial payment tracking and overdue alerts
- Cash in multiple currencies
- Expenses & subscriptions
- BC/Committee (rotating savings) with turn tracking
- Prize bonds & savings certificates
- Credit score tracking (Experian, Equifax, TransUnion, ECIB)
- Zakat calculator with live nisab and hawl tracking
- Income tax calculator (UK, Pakistan, UAE)
- Live FX rates and precious metals prices

### Identity & Documents
- Passport, NIC, driving licence, visa — 12 document types with expiry alerts
- SIM cards, email accounts, digital logins, gadgets with warranty tracking

### Family Vault
- Family profiles with linked documents, banks, and cards
- BC committee organiser with member tracking

### Assets
- Property, vehicles with MOT/road tax/insurance expiry alerts
- Gadgets and personal assets with P&L

---

## Security

- **AES-256-GCM** encryption via Web Crypto API
- **PBKDF2** key derivation (310,000 iterations, SHA-256)
- **IndexedDB** encrypted storage — never leaves your device
- PIN brute-force lockout (30s → 5 min → vault wipe)
- **Decoy PIN** — shows empty vault to protect under duress
- Fully offline — no internet required after install

---

## Features

- **Smart Add** — describe what to add, Smart Parser (optional LLM) detects and pre-fills the form
- **Smart Import** — paste any text, Smart Parser / LLM extracts structured financial data
- **Live rates** — real-time FX (PKR/GBP/AED/USD) and gold/silver prices
- **PDF export** — full financial summary as print-ready PDF
- **Reminders** — unified timeline for document expiry, MOT, BC turns, loan due dates
- **Multi-country** — filter by Pakistan, UK, UAE
- **Dark & light modes** — plus system appearance on supported devices
- **60+ bank logos** with real favicons
- **QR sync** — transfer vault between devices via QR code

---

## Architecture

```
VaultCap/
├── index.html              # App shell (loads dist/vaultcap.bundle.js)
├── dist/                   # Generated bundle — run npm run build:js
├── js/
│   ├── bundle-order.json   # Module load order for bundler
│   ├── core/               # Crypto, PIN, lockout, store, router
│   └── modules/            # Banks, cards, family, etc.
├── scripts/build-bundle.mjs
├── css/                    # base, layout, components, themes
├── landing.html            # Marketing landing page
├── docs/
└── sw-v51.js               # Service worker (offline PWA)
```

**Stack:** Vanilla JS · Web Crypto API · localStorage · Tesseract.js · optional LLM API key (optional)

---

## Getting Started

**Live:** https://shamikhahmed.github.io/VaultCap  
**Install (all devices):** https://shamikhahmed.github.io/VaultCap/install.html  
**Launch plan:** [LAUNCH.md](./LAUNCH.md)

**No account.** PIN = password. Master key = recovery. Data encrypted on-device (AES-256-GCM).

| Device | Install |
|--------|---------|
| iPhone / iPad | Safari → Share → Add to Home Screen |
| Android | Chrome → Install app / Add to Home screen |
| Windows | Edge/Chrome → Install VaultCap |
| Mac | Safari Add to Dock / Chrome Install |

App Store / Play / Microsoft Store need developer accounts + review — website PWA ships first.

## iPhone test checklist

- [ ] PIN setup and unlock flow works
- [ ] Banks, cards, and documents add/edit correctly
- [ ] Expiry reminders appear on dashboard timeline
- [ ] Export `.vos` backup downloads successfully
- [ ] Decoy PIN shows empty vault
- [ ] App works offline after first load (rates use cache)
- [ ] Safe area: FAB and nav clear notch / home indicator

## Documentation

| Resource | Path |
|----------|------|
| User guide | [docs/GUIDE.md](docs/GUIDE.md) |
| Presentation | [docs/PRESENTATION.md](docs/PRESENTATION.md) |
| Landing page | [landing.html](landing.html) |

**Demo PIN:** `123456` — load demo data from Settings → Load Demo

**Local dev:**
```bash
git clone https://github.com/shamikhahmed/VaultCap.git
cd VaultCap
npm ci
npm run build:js    # required — dist/ is not committed
npm run serve       # http://127.0.0.1:8765
```

**Tests:** `npm run test:e2e` (builds bundle first). **XSS audit:** `npm run audit:xss`.

**GitHub Pages / deploy:** push to `main` runs `.github/workflows/pages.yml` (`npm run build:js` then publish). Local: always `npm run build:js` before serve — `index.html` loads `dist/vaultcap.bundle.js`.

**Screenshots:** `npm run gallery` (or `npm run capture:screenshots`) then commit `assets/screenshots/` + `screen-gallery.html` embed. Viewer: [screen-gallery.html](screen-gallery.html) or `npm run gallery:view`.

---

## Roadmap

- [x] Expenses — category charts *(v5.0.0: bar chart + donut + monthly overview)*
- [x] Assets — purchase vs current value P&L *(v5.0.0: row badges + portfolio summary)*
- [x] Cash — multi-currency totals *(v5.0.0: dashboard breakdown + module summary)*
- [x] SIMs — contract expiry reminders *(v5.0.0: contract end + recharge alerts/timeline)*

---

## About

**Shamikh Ahmed**
Director, NEWS Logistics · Founder, TheSolution360
MSc Logistics & Operations Management, Cardiff University
MSc Accounting & Finance, BPP University London
Karachi, Pakistan

VaultCap was built to solve a personal problem: managing finances across three countries with no single app that understood BC committees, prize bonds, Pakistani banks, UK accounts, zakat, and expat financial complexity.

---

## License

Source-available. See [LICENSE](./LICENSE).

---

*VaultCap © 2026 Shamikh Ahmed*
