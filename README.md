# VaultOS — Your Private Financial OS

**Enterprise-grade security. Zero cloud. Fully private.**

[![Live](https://img.shields.io/badge/Live-shamikhahmed.github.io%2FVaultOS-0080ff?style=flat-square&logo=github)](https://shamikhahmed.github.io/VaultOS)
[![PWA](https://img.shields.io/badge/PWA-Installable-0080ff?style=flat-square)](#how-to-install)
[![AES-256-GCM](https://img.shields.io/badge/Encryption-AES--256--GCM-22c55e?style=flat-square)](#security)
[![Zero Cloud](https://img.shields.io/badge/Cloud-None-ef4444?style=flat-square)](#security)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-22c55e?style=flat-square)](#technical)

---

VaultOS is a fully offline, client-side personal finance and identity vault built as a Progressive Web App. Every bank account, card, investment, SIM, document, login, vehicle, and digital identity lives in one AES-256-GCM encrypted vault — on your device, nowhere else. No accounts. No subscriptions. No servers. Built for people who live across **Pakistan, the UK, and the UAE** and need one private, always-available place for their complete financial and digital life.

---

## Modules

| Category | Module | What it stores |
|----------|--------|----------------|
| 💰 Finance | 🏦 Banks | Accounts, IBAN, sort codes, login details, bank logos |
| 💰 Finance | 💳 Cards | Debit, credit, crypto & BNPL cards — Apple Wallet UI, front/back photos |
| 💰 Finance | 📈 Investments | Stocks, funds, bonds, crypto portfolios |
| 💰 Finance | 💵 Cash | Physical cash tracked by location, transfer between locations |
| 💰 Finance | 🤝 Loans | Money lent and borrowed |
| 💰 Finance | 📋 Expenses | Subscriptions & recurring bills |
| 🏠 Assets | 🏠 Assets | Property and valuables |
| 🏠 Assets | 🚗 Vehicles | Cars, fuel log, service records, insurance |
| 🪪 Identity | 📱 SIM Cards | Mobile numbers & networks |
| 🪪 Identity | 🪪 Documents | IDs, passports, visas, contracts — front/back photo capture |
| 🪪 Identity | 📧 Emails | All email identities & security config |
| 🪪 Identity | 💻 Gadgets | Devices, IMEI, warranty tracking |
| 🪪 Identity | 💼 Digital | Logins, wallets, social media |
| 🪪 Identity | 👥 Friends | Contacts & people |
| ⚙️ Tools | 🔔 Reminders | Expiry alerts & upcoming dues |
| ⚙️ Tools | 🤖 AI Import | Smart pattern-matching & AI-assisted data import |
| ⚙️ Tools | 🗑️ Trash | Deleted items — restore or purge within 30 days |

---

## Features

### Cards & Banks
- **Apple Wallet–style card UI** — realistic card rendering with network logos, holographic shimmer, and brand colours
- **Bank logos via favicon API** — real institution logos pulled automatically from brand name
- **Country-first bank picker** — select your country, then tap a tile from a curated grid; name, type, currency fill automatically
- **120+ bank database** — full coverage for PK / UK / UAE / US / SG with smart autocomplete
- **OCR card scanning** — point camera at a physical card to auto-fill card number, expiry, and name
- **Front & back photo capture** — photograph both sides of a card or document; stored securely in IndexedDB

### Import & Data Entry
- **AI Smart Add** — paste any text (bank statement, email, screenshot) and the AI extracts structured entries; requires a Claude API key in Settings
- **Excel multi-sheet import with row review** — drop `.xlsx` / `.xls`; all sheets are scanned, types auto-detected, and a row-by-row preview lets you approve or skip each entry
- **Duplicate detection** — before saving, checks for an existing entry with the same name and last-4 digits and prompts before overwriting
- **Auto-tagging** — banks and cards tagged automatically: Islamic, Digital, Business, Crypto, BNPL
- **Pending-link resolution** — cards auto-link to their bank on import; unresolved links retry on next save

### Cash & Finance
- **Cash transfers** — move cash between locations (Wallet → Safe, Safe → Car) with a From / To / Amount modal
- **Net worth history** — daily snapshots with sparkline trend chart on the dashboard

### UX & Mobile
- **Swipe-to-delete** — swipe left on any list row to reveal the delete action (iOS-native feel)
- **Long-press context menus** — hold any item to get Edit / Delete / Share options
- **Pull-to-refresh** — drag down on any list page to reload
- **Spring animations** — physics-based transitions throughout
- **Skeleton loaders** — content placeholders while data loads
- **Empty state illustrations** — helpful prompts when a module has no entries

### Demo & Onboarding
- **5 demo profiles** — load a fictional vault as:
  - Business Professional (Karachi)
  - Student (UK)
  - Family (Dubai)
  - Expat (multi-country)
  - Entrepreneur (PK + UK)

### Sync & Backup
- **QR device sync** — generate an AES-256-GCM encrypted QR on one device, scan on another, enter a one-time 6-digit code — vault merges without any cloud relay
- **Encrypted `.vos` export** — AES-256-GCM backup file you control
- **Legacy `.vault` / `.json` / `.csv` import** — bring data in from older exports or spreadsheets

### Customisation
- **18 themes** — Midnight, Ocean, Forest, Aurora, Rose, Slate, Amber, and more
- **Large text mode** — slightly increases base font size for accessibility
- **Privacy mode** — CSS blur on all sensitive fields (useful in public)
- **Module toggles** — enable only the sections you need; hidden modules still retain data

---

## Security

VaultOS uses the browser's native **Web Crypto API** — no third-party cryptography libraries.

```
User PIN (6 digits)
        │
        ▼
  PBKDF2 key derivation
  ├── Algorithm : SHA-256
  ├── Iterations: 310,000
  └── Salt      : random 16 bytes (stored alongside cipher)
        │
        ▼
  AES-256-GCM key  ←── lives in memory only, never written to disk
        │
        ▼
  Encrypted blob
  ├── IndexedDB  (live vault, local device)
  └── .vos file  (encrypted backup export)
```

| Property | Detail |
|----------|--------|
| Key derivation | PBKDF2 · SHA-256 · 310,000 iterations |
| Cipher | AES-256-GCM (authenticated encryption with integrity) |
| PIN storage | Never stored — only a PBKDF2-derived verifier |
| Session key | Held in memory; wiped on lock or app close |
| Decoy vault | Separate fake dataset shown on alternate PIN entry |
| Panic mode | One tap locks immediately and blanks all sensitive DOM elements |
| Auto-lock | Triggers on `visibilitychange` — tab switch or phone sleep |
| Brute-force | Exponential lockout after repeated failed PIN attempts |
| Privacy mode | CSS blur on all `.sens` fields |
| QR sync | Each QR is single-use with AES-256-GCM + 6-digit TOTP-style code |

---

## How to Use AI Features

AI Smart Add and the OCR import engine use the **Claude API** (Anthropic).

1. Get a free API key at [console.anthropic.com](https://console.anthropic.com)
2. In VaultOS → **Settings → Import**, paste your key
3. Use **AI Smart Add** (✨ button) on any module, or drag a screenshot / PDF to the Import page

Your key is stored locally in the vault (encrypted at rest). It is never sent to any VaultOS server — only directly to the Anthropic API from your device.

---

## How to Install

### iPhone / iPad (recommended)
1. Open **[https://shamikhahmed.github.io/VaultOS](https://shamikhahmed.github.io/VaultOS)** in **Safari**
2. Tap the **Share** button → **Add to Home Screen**
3. Set your 6-digit PIN on first launch
4. Your data stays on your device — always

### Android
1. Open the URL in **Chrome**
2. Tap the **Install** banner or Menu → **Add to Home Screen**

### Desktop (Mac / Windows)
1. Open the URL in **Chrome** or **Edge**
2. Click the **install icon** (⊕) in the address bar

### Run Locally
```bash
python3 -m http.server 8080
# Open http://localhost:8080
# Demo PIN: 123456
```

---

## Locale Coverage

| Country | Banks | Networks | Notes |
|---------|-------|----------|-------|
| 🇵🇰 Pakistan | HBL, UBL, MCB, Meezan, Sadapay, JazzCash, EasyPaisa, NayaPay, Zindigi + 40 more | Jazz, Zong, Ufone, Telenor PK, SCOM | PKR, Islamic finance types |
| 🇬🇧 United Kingdom | Monzo, Starling, Barclays, HSBC, NatWest, Lloyds, Revolut, Wise + 25 more | EE, O2, Vodafone, Three, giffgaff | GBP, sort codes |
| 🇦🇪 UAE | Emirates NBD, FAB, ADCB, Mashreq Neo, Liv., Wio Bank, ADIB + 15 more | Etisalat, du | AED, IBAN |
| 🇺🇸 🇸🇬 🇮🇳 Others | Chase, Bank of America, DBS, HDFC + more | — | USD, SGD, INR |

---

## Technical

- **Zero dependencies** — vanilla JS, no npm, no build system, no framework
- **Single-page shell** — `index.html` + `js/app.js` + `js/ui.js` + per-module files in `js/modules/`
- **< 2 MB total** — loads instantly on slow mobile connections
- **Web Crypto API** — PBKDF2 + AES-256-GCM, native browser cryptography, no polyfills
- **IndexedDB** — structured local storage; photo blobs stored separately from vault JSON
- **Schema migrations** — forward-compatible data model, currently v4
- **Service Worker** — full offline support after first load
- **18 themes** — CSS custom-property–based, zero layout cost to switch

---

## Built By

**Shamikh Ahmed**  
Director · [NEWS Logistics](https://newslogistics.co.uk) &nbsp;|&nbsp; Founder · [TheSolution360](https://thesolution360.com)

---

*Your financial life. Your device. Your rules.*
