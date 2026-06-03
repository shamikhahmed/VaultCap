# VaultOS — Personal Finance & Identity Vault

**Privacy-first. Local-first. Offline-first. Your data, your device, your rules.**

🔗 **Live:** https://shamikhahmed.github.io/VaultOS

VaultOS is a personal vault app that stores your financial and identity information entirely on your device. No accounts. No servers. No tracking. Everything encrypted with your PIN.

Built for people who manage finances across Pakistan, UK, and UAE.

---

## Why VaultOS?

Most finance apps upload your data to servers you don't control. VaultOS is different:

- **Local-first** — data lives on your device, works fully offline
- **Encrypted** — AES-256-GCM encryption with your PIN as the key
- **Transparent** — open source, no hidden cloud sync, no analytics
- **Recoverable** — export encrypted .vos backups you own forever
- **Multi-country** — built for PKR, GBP, AED, USD across PK/UK/UAE

---

## Features

### Security
- 6-digit PIN with lockout after failed attempts
- Decoy PIN — secondary PIN shows a blank vault
- AES-256-GCM encrypted `.vos` backup/restore (PBKDF2, 310 000 iterations)
- Auto-lock on screen hide with configurable timeout
- Panic lock — one tap blanks all sensitive values
- Privacy mode — blurs all sensitive fields

### Banks & Cards
- 50+ banks across Pakistan, UK, UAE, USA, Canada, EU
- Includes HBL, Meezan, UBL, Monzo, Revolut, Starling, Yonder, Wirex, Klarna, Emirates NBD, FAB, Mashreq, ADCB
- Cards with full details — network (Visa, Mastercard, Amex, UnionPay, PayPak), type, limit, expiry
- Smart bank shortlist when adding cards
- Credit limit overview across all cards
- Today's wallet — pin which cards you're carrying

### Family Vault
- Family head master profile + individual member profiles
- Per-member tabs: Documents, Banks & Cards, Cash, Investments, Notes
- Expiry alerts for family documents
- Photo storage for cards and documents

### Currency & Net Worth
- Live FX rates from your own Currency module — no stale defaults
- Base currency: PKR, USD, GBP, AED, EUR
- Total net worth aggregated across all asset classes in your chosen currency
- Dashboard toggle between currencies

### Precious Metals (Gold & Silver)
- Weight in grams, tola, ounce, kilogram
- Gold, silver, platinum tracking
- Manual spot price entry
- Portfolio value in base currency

### Zakat Calculator
- Personal, Business/AOP, and FBR bank-deduction modes
- Silver (612.36g) and gold (87.48g) nisab standards
- Full zakatable asset and liability breakdown
- **Quranic & Hadith references** with scholarly sources (Surah At-Tawbah 9:103, Sahih al-Bukhari 1496, etc.)
- Follows Hanafi fiqh as practised in Pakistan
- Printable Zakat statement

### Tax Calculator
**Pakistan** — 2025–26 slabs:
- Salaried / Non-salaried / AOP / Company
- Non-filer surcharges, freelancer IT-export exemptions
- Super Tax, Zakat deduction, property tax (FBR)

**United Kingdom** — 2024/25:
- Employed (PAYE), Self-Employed (Class 2/4 NI), Landlord
- Capital Gains Tax (basic/higher rate, annual exempt £3 000)
- Inheritance Tax (£325 000 nil-rate band, 40%)
- Dividend Tax, SDLT (residential/first-time buyer), VAT

**UAE**:
- Individual (0% income tax)
- Corporate Tax (9% above AED 375 000 threshold, free zone rules)
- VAT (5% standard, 0% exempt categories), excise tax

Printable report with monthly/weekly/daily breakdowns.

### Credit Score Tracker
- UK: Experian (0–999), Equifax (0–1 000), TransUnion (0–710)
- Pakistan: eCIB (SECP/SBP scale)
- UAE: AECB (300–900)
- Manual entry with trend history and band labels

### Other Modules
| Module | What it tracks |
|--------|---------------|
| Investments | Stocks, funds, crypto, property — value + currency |
| Assets | Physical assets with current value |
| Cash | Cash positions across accounts and currencies |
| Loans | Money lent and borrowed, per-currency amounts, settlement status |
| Vehicles | MOT & road tax expiry alerts, full vehicle details |
| Documents | Passports, IDs, visas, licences with expiry tracking |
| SIM Cards | Numbers, networks, plans across countries |
| Digital | Subscriptions and digital services |
| Gadgets | Device inventory |
| Expenses | Spending log |
| Emails | Important email archive |
| Reminders | Custom alerts with due dates |
| Timeline | Full activity history |
| Friends | Contact book linked to loans |
| Search | Full-text search across all modules |

### Import / Export
- `.vos` — AES-256-GCM encrypted full backup
- `.vault` — legacy format
- `.json` — plain JSON
- `.csv` — spreadsheet export
- AI-assisted smart import from screenshots, PDFs, and spreadsheets

---

## Running Locally

```bash
git clone https://github.com/shamikhahmed/VaultOS.git
cd VaultOS
python3 -m http.server 8080
# open http://localhost:8080
```

Demo PIN: **123456**

For iPhone: Safari → Share → Add to Home Screen

---

## Tech Stack

- Vanilla HTML, CSS, JavaScript — zero dependencies, zero build step
- Web Crypto API — AES-256-GCM encryption, PBKDF2 key derivation
- localStorage — all data on-device
- Service Worker — full offline support
- PWA manifest — installable on iOS and Android

---

## Author

**Shamikh Ahmed**  
Director, NEWS Logistics · Founder, TheSolution360  
Karachi, Pakistan

---
*Built with Claude Code*
