# VaultCap — Product Presentation

---

## Slide 1 — Title

# VaultCap
### Your Private Life Operating System

*Encrypted · Offline · PK · UK · UAE*

**Live:** shamikhahmed.github.io/VaultCap

---

## Slide 2 — Problem

Expats and multi-country households juggle:

- 3+ bank ecosystems (HBL, Barclays, ENBD…)
- BC committees, prize bonds, zakat
- Documents across passports, visas, NICs
- A dozen apps that all want your data on *their* servers

---

## Slide 3 — Solution

**VaultCap** — one encrypted vault on your device:

- Banks, cards, investments, loans, cash
- Identity documents with expiry alerts
- Family sub-vaults
- Zakat, tax, FX, gold — built in

**Zero servers. Zero accounts.**

---

## Slide 4 — Security model

| Layer | Standard |
|-------|----------|
| Encryption | AES-256-GCM |
| Key derivation | PBKDF2 · 600k iterations · SHA-256 |
| Storage | IndexedDB encrypted blobs |
| Unlock | 6-digit PIN · optional WebAuthn |
| Recovery | Recovery key (setup) · backup key (`.vos` export) |
| Duress | Decoy PIN → empty vault |
| Lockout | Brute-force cooldown → wipe |
| CSP | `script-src 'self'` — no inline handlers / no `eval` |

Your PIN never leaves your device.

---

## Slide 5 — Finance modules

- **Banks & Cards** — 60+ logos, IBAN, expiry alerts, OCR scan
- **Investments** — P&L, stocks, crypto, sukuk, pension
- **BC Committee** — ballot draw, turn tracking, zakat receivable
- **Prize Bonds** — bulk import, draw calendar
- **Zakat** — AAOIFI calculator, live nisab, hawl tracker
- **Tax** — Pakistan, UK, UAE slabs
- **Bills** — dashboard due-soon widget

---

## Slide 6 — Identity & assets

- 12 document types — passport, NIC, visa, licence
- SIMs, emails, digital logins, gadgets
- Vehicles — MOT, road tax, insurance alerts
- Property, precious metals at live prices

---

## Slide 7 — Smart features (honest)

- **Smart Add / Smart Import** — rules-based Smart Parser (optional LLM only if you opt in)
- **Smart Help** — offline rules assistant (not cloud AI)
- Works fully offline for core vault

---

## Version

**v5.1.1** — PIN-first · 100% free · CSP hardened

---

## Slide 8 — Multi-country

Context switcher for Pakistan 🇵🇰 · UK 🇬🇧 · UAE 🇦🇪

- Filter banks by country
- Per-currency balances
- Cross-border net worth

Built for Shamikh's life — designed for millions like it.

---

## Slide 9 — Backup & sync

- **Export** `.vos` encrypted backup
- **QR sync** — chunk transfer, no cloud
- **PDF summary** — print-ready financial snapshot
- **Widget** — home screen net worth snapshot

*Privacy means you own the backup responsibility.*

---

## Slide 10 — Design

- Accent `#5b8dee` — trust blue on obsidian
- 5 themes — Midnight to Blossom
- Glass cards, command palette ⌘K
- PWA — full offline after install

---

## Slide 11 — Demo

**Demo PIN:** `123456` → Settings → Load Demo

Try Smart Add, expense category charts, asset P&L summary, multi-currency cash on dashboard, SIM contract reminders, zakat auto-fill.

---

## Slide 12 — Analytics (v5.0)

- **Expenses** — bar chart + donut + monthly/yearly totals
- **Assets** — portfolio P&L widget + per-row gain/loss
- **Cash** — per-currency breakdown on dashboard Money widget
- **SIMs** — recharge + contract expiry in alerts & timeline

---

## Slide 13 — Close

> *Your entire financial life. Encrypted. Offline. Always with you.*

**VaultCap** — github.com/shamikhahmed/VaultCap

*Shamikh Ahmed · 2026*
