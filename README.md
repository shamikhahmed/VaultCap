# VaultOS — Your Personal Financial Vault

**The most complete personal finance vault app. Offline-first. Zero cloud. All yours.**

🔗 Live: https://shamikhahmed.github.io/VaultOS

---

## What is VaultOS?

VaultOS is a premium offline-first personal finance vault built as a single PWA. No accounts, no cloud, no subscriptions. Everything is stored on your device and encrypted with your PIN.

## Features

### 🔐 Security
- 6-digit PIN with brute force protection (lockout after failed attempts)
- Master Key system — mathematically derived recovery key
- Decoy PIN — shows empty vault under coercion
- Auto-lock with configurable timeout
- AES-256-GCM encrypted backup/restore

### 🏦 Banks & Cards
- Track banks across Pakistan, UK, UAE, USA and more
- 50+ banks including HBL, Meezan, Standard Chartered, Monzo, Revolut, Zabel, Yonder, Wirex, Klarna, Emirates NBD, FAB
- Cards with network detection (Visa, Mastercard, Amex, UnionPay, PayPak, JCB)
- Credit limit per card + total credit limit overview
- Smart bank shortlist when adding cards

### 👨‍👩‍👧‍👦 Family Tree
- Head of family master view
- Individual profiles for each member (docs, banks, cards, cash, investments, notes)
- Visual list + member detail with tabs
- Family document expiry alerts

### 💱 Currency & Net Worth
- Base currency selection (PKR, USD, GBP, AED, EUR)
- USD pivot for auto-calculation of AED/GBP rates
- Manual rate entry with override
- Total net worth across all assets

### 🥇 Precious Metals
- Gold, silver, platinum tracking
- Weight in grams, tola, oz, kg
- Manual price entry per session
- Total portfolio value in base currency

### 🌙 Zakat Calculator
- Individual, Business/AOP, Farmer filing types
- Both nisab standards (Silver 612.36g / Gold 87.48g)
- Full asset and liability categories
- Printable Zakat report

### 🧾 Tax Calculator
- UK: Employed, Self-Employed, Landlord (2024/25 rates with NI)
- Pakistan: Salaried, Business/AOP, Non-filer, Freelancer/IT Export
- UAE: Individual (zero tax), Corporate Tax (9%), VAT Calculator (5%)
- Editable tax rates for when slabs change
- Printable tax report with monthly/weekly breakdown

### 📊 Credit Score Tracker
- UK (Experian/Equifax/TransUnion), Pakistan (eCIB), UAE (AECB)
- Manual entry with history tracking
- Visual score gauge with band labels
- Score trend over time

### 🚗 Vehicles
- MOT expiry tracking (UK) with 30-day alerts
- Road tax expiry tracking
- Full vehicle details

### 🔔 Alerts & Reminders
- Live alerts for expiring cards, documents, MOT, family docs
- Upcoming reminders within 7 days
- Colour-coded by urgency

### 💼 Everything Else
- Documents (passports, IDs, driving licences)
- Cash tracking across accounts
- Investments portfolio
- Loans and EMI tracking
- SIM cards
- Digital subscriptions
- Gadgets & assets
- Expenses
- Emails
- Timeline / activity log
- Search across everything
- Import/Export (.vault encrypted backup)
- Demo mode with sample data

## Tech Stack
- Vanilla HTML, CSS, JavaScript — zero dependencies
- localStorage for all data
- Service Worker for offline support
- PWA — installs to home screen on iOS and Android

## Running Locally
```bash
git clone https://github.com/shamikhahmed/VaultOS.git
cd VaultOS
# Open index.html directly or:
python3 -m http.server 8080
# then open http://localhost:8080
```

Demo PIN: **123456**

## Author
**Shamikh Ahmed**
Director, NEWS Logistics · Founder, TheSolution360
Karachi, Pakistan

---
*Built with Claude Code*
