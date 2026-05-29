# VaultOS — Personal Finance & Identity Vault

**Enterprise-grade security. Zero cloud. Fully private.**

[![Live](https://img.shields.io/badge/Live-shamikhahmed.github.io%2FVaultOS-0080ff?style=flat-square)](https://shamikhahmed.github.io/VaultOS)
[![PWA](https://img.shields.io/badge/PWA-Installable-0080ff?style=flat-square)](#how-to-install)
[![Encryption](https://img.shields.io/badge/Encryption-AES--256--GCM-success?style=flat-square)](#security)
[![Zero Cloud](https://img.shields.io/badge/Cloud-None-critical?style=flat-square)](#security)
[![Dependencies](https://img.shields.io/badge/Dependencies-Zero-success?style=flat-square)](#technical)

---

## What is VaultOS?

VaultOS is a fully offline, client-side personal finance and identity vault built as a Progressive Web App. It stores everything — bank accounts, cards, investments, SIM cards, documents, logins, vehicles, assets — locally on your device, encrypted at rest using AES-256-GCM. Nothing leaves your phone. No accounts, no subscriptions, no servers. It is purpose-built for people who live across Pakistan, the UK, and the UAE and need one private place to hold the complete picture of their financial and digital life.

---

## Key Features

### Privacy & Security
- **AES-256-GCM encryption** — every backup is encrypted with a key derived from your PIN
- **Zero plaintext persistence** — no sensitive value is ever written to disk in the clear
- **IndexedDB storage** — data lives in the browser's secure local storage, never a server
- **Session key in memory only** — the encryption key is never written to disk
- **Decoy vault** — enter your decoy PIN to show a fake dataset to anyone looking over your shoulder
- **Panic mode** — one tap blanks all sensitive values instantly
- **Brute-force protection** — lockout after repeated failed PIN attempts
- **Auto-lock** — locks automatically when the app goes to the background
- **Screenshot blur / privacy mode** — one toggle blurs all sensitive fields on screen

### Data Modules (15+)
| Category | Modules |
|----------|---------|
| Finance | Banks, Cards, Investments, Cash, Loans, Expenses |
| Assets | Assets, Vehicles |
| Identity | SIM Cards, Documents, Emails, Gadgets, Digital Logins, Friends |
| Tools | Reminders, AI Import, 30-day Trash |

### Smart Autocomplete
Typing a bank name like "Meezan" instantly fills country (Pakistan), currency (PKR), bank type (Islamic), and SWIFT code from a curated database covering PK / UK / UAE / US / SG institutions.

### AI Import Engine
Paste any text — a screenshot, a statement snippet, a spreadsheet export — and the AI pattern-matcher identifies what it is, maps it to the correct module, and prompts you to confirm before saving. No API key required.

### Locale-first Design
- Pakistani banks: HBL, UBL, Meezan, Sadapay, JazzCash, EasyPaisa, NayaPay, and 50+ more
- UK banks: Monzo, Starling, Barclays, HSBC, Revolut, Wise, and 30+ more
- UAE banks: Emirates NBD, FAB, Mashreq Neo, Liv., Wio Bank, and 20+ more
- Currencies: PKR, GBP, AED, USD, EUR, SAR, and more
- SIM networks: Jazz, Zong, Ufone, Telenor PK, EE, O2, Vodafone, Etisalat, du

### PWA — No App Store Needed
Installs natively on iPhone, Android, Mac, and Windows directly from the browser. Works fully offline after first load.

### More
- Net worth dashboard with currency toggle (PKR / GBP / AED / USD)
- 30-day trash with restore and permanent delete
- 8 themes: Midnight, Ocean, Forest, Aurora, Iron Man, Rose Gold, Titanium, Light
- ⌘K command palette, keyboard shortcuts
- Encrypted `.vos` backup exports and AI-assisted import

---

## Security

VaultOS uses the Web Crypto API exclusively — no third-party crypto libraries.

```
PIN (6-digit)
  │
  ▼
PBKDF2  ──  310,000 iterations, SHA-256, random 16-byte salt
  │
  ▼
AES-256-GCM key  ──  lives in memory only, never written to disk
  │
  ▼
Encrypted blob  ──  stored in IndexedDB / exported as .vos file
```

| Property | Detail |
|----------|--------|
| Key derivation | PBKDF2 · SHA-256 · 310,000 iterations |
| Cipher | AES-256-GCM (authenticated encryption) |
| PIN storage | Never stored — only a PBKDF2-derived verifier hash |
| Session key | Held in memory, cleared on lock |
| Decoy vault | Separate fake dataset shown on decoy PIN entry |
| Panic mode | Immediately locks and blanks all `.sens` DOM elements |
| Auto-lock | Triggers on `visibilitychange` (tab switch / phone sleep) |
| Brute force | Exponential lockout after failed attempts |
| Privacy mode | CSS blur on all sensitive fields, no data hidden from DOM |

---

## How to Install

### iPhone / iPad (recommended)
1. Open **[https://shamikhahmed.github.io/VaultOS](https://shamikhahmed.github.io/VaultOS)** in Safari
2. Tap the **Share** button → **Add to Home Screen**
3. Set your 6-digit PIN on first launch
4. Add your data — it never leaves your device

### Android
1. Open the URL in Chrome
2. Tap the **Install** banner or Menu → **Add to Home Screen**

### Desktop (Mac / Windows)
1. Open the URL in Chrome or Edge
2. Click the install icon in the address bar

---

## Running Locally

No build step required:

```bash
python3 -m http.server 8080
# Open http://localhost:8080
```

Demo PIN: **123456**

---

## Technical

- **Zero dependencies** — vanilla JS, no npm, no build system
- **Single HTML shell** — `index.html` + `js/app.js` + `js/ui.js` + CSS files
- **< 2 MB total** — loads instantly even on slow connections
- **Web Crypto API** — PBKDF2 + AES-256-GCM, native browser cryptography
- **IndexedDB** — structured local storage, survives app restarts
- **Schema migrations** — forward-compatible data model (currently v4)
- **Service Worker ready** — full offline support
- **15+ data modules** — each self-contained with its own render / add / edit / delete lifecycle

---

## Built By

**Shamikh Ahmed**  
Director at [NEWS Logistics](https://newslogistics.co.uk) · Founder of [TheSolution360](https://thesolution360.com)

---

*VaultOS — your financial life, your device, your rules.*
