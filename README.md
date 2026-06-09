# VaultOS — Private Life Operating System

[![Live App](https://img.shields.io/badge/Live%20App-VaultOS-5b8dee?style=for-the-badge)](https://shamikhahmed.github.io/VaultOS)
[![PWA](https://img.shields.io/badge/PWA-Offline%20First-orange?style=for-the-badge)](https://shamikhahmed.github.io/VaultOS)
[![License](https://img.shields.io/badge/License-Source%20Available-green?style=for-the-badge)](./LICENSE)

> **Your entire financial and personal life. Encrypted. Offline. Always with you.**

VaultOS is a zero-knowledge personal life operating system built as a PWA. No servers. No accounts. No subscriptions. All data stays on your device, encrypted with AES-256-GCM.

---

## What It Does

VaultOS replaces a dozen fragmented apps with one encrypted vault — managing banks, cards, investments, loans, documents, family, identity, and more across Pakistan, the UK, and the UAE.

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

- **Smart Add** — describe what to add, Claude AI detects and pre-fills the form
- **AI Import** — paste any text, Claude extracts structured financial data
- **Live rates** — real-time FX (PKR/GBP/AED/USD) and gold/silver prices
- **PDF export** — full financial summary as print-ready PDF
- **Reminders** — unified timeline for document expiry, MOT, BC turns, loan due dates
- **Multi-country** — filter by Pakistan, UK, UAE
- **18 themes** — Midnight, Graphite, Cloud, Ivory, Blossom, and more
- **60+ bank logos** with real favicons
- **QR sync** — transfer vault between devices via QR code

---

## Architecture

```
VaultOS/
├── index.html           # App shell
├── js/
│   ├── app.js           # Core engine — routing, security, all data modules
│   └── ui.js            # Dashboard, Settings, Export, AI Import
├── css/                 # 4 CSS files — base, layout, components, themes
├── pitch.html           # 20-slide pitch deck
├── widget.html          # Standalone net worth widget
├── landing.html         # Marketing landing page
├── docs/
│   ├── GUIDE.md         # User documentation
│   └── PRESENTATION.md  # Product deck
└── sw.js                # Service worker (offline PWA)
```

**Stack:** Vanilla JS · Web Crypto API · localStorage · Tesseract.js · Claude API (optional)

---

## Getting Started

**Live:** https://shamikhahmed.github.io/VaultOS

**iPhone:** Safari → Share → Add to Home Screen

**Android:** Chrome → Menu → Add to Home Screen

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

**Local:**
```bash
git clone https://github.com/shamikhahmed/VaultOS.git
cd VaultOS
python3 -m http.server 8080
# open http://localhost:8080
```

---

## Roadmap

- [ ] Expenses — category charts
- [ ] Assets — purchase vs current value P&L
- [ ] Cash — multi-currency totals
- [ ] SIMs — contract expiry reminders

---

## About

**Shamikh Ahmed**
Director, NEWS Logistics · Founder, TheSolution360
MSc Logistics & Operations Management, Cardiff University
MSc Accounting & Finance, BPP University London
Karachi, Pakistan

VaultOS was built to solve a personal problem: managing finances across three countries with no single app that understood BC committees, prize bonds, Pakistani banks, UK accounts, zakat, and expat financial complexity.

---

## License

Source-available. See [LICENSE](./LICENSE).

---

*VaultOS © 2026 Shamikh Ahmed*
