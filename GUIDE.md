# VaultOS User Guide

VaultOS is a private, zero-server financial operating system. Everything lives on your device, encrypted with your PIN. No accounts. No syncing. No data leaving your phone.

---

## Philosophy

Most finance apps store your data on their servers. VaultOS does not. Your vault exists only on your device, encrypted with a PIN only you know. If you delete the app or lose your phone without a backup, the data is gone — because no one else has it.

This is the trade-off: complete privacy, in exchange for complete responsibility. Back up regularly.

---

## Getting Started (5 Steps)

### Step 1 — Set a strong PIN

Go to **Settings → Security → Change PIN**. Your PIN is the encryption key for your entire vault. Pick something memorable but not obvious. Do not use 123456 (the demo PIN).

> Without your PIN, your backup file cannot be opened. There is no "forgot PIN" flow.

### Step 2 — Add your primary country

During onboarding (or via **Settings → Profile**), set the country where you primarily manage finances. This filters banks, sets your default currency, and configures the tax calculator.

### Step 3 — Add banks and cards

Go to **Finance → Banks → + Add Bank**. Add your bank name, country, account type, and currency. Then add cards via **Finance → Cards**, linking each card to its bank account.

### Step 4 — Add key documents

Go to **Identity → Documents → + Add Document**. Store passports, driving licences, and national IDs. You can photograph the front and back. Expiry dates trigger automatic alerts.

### Step 5 — Export your first backup

Go to **Settings → Backup & Export → Export Vault**. A `.vos` file downloads — save it to iCloud Drive, Google Drive, or email it to yourself. **Do this now.** You cannot recover data without a backup if you lose your device.

---

## All Modules

### Finance

| Module | What it's for |
|--------|---------------|
| **Banks** | Current, savings, and Islamic accounts. Stores IBAN, sort code, balance, online banking credentials. |
| **Cards** | Debit, credit, and prepaid cards. Links to bank accounts. Stores expiry, CVV hint, card photos. |
| **Cash** | Track physical cash by location (wallet, safe, foreign currency). |
| **Investments** | Stocks, funds, bonds, crypto, pension. Tracks cost basis and current value. |
| **Loans** | Money you've lent or borrowed. Tracks amount, person, due date, and status. |
| **Expenses** | Subscriptions and recurring bills. Monthly cost tracking. |
| **Credit Score** | Track your credit score over time across multiple bureaus. |
| **Zakat** | Annual Islamic wealth obligation calculator. Uses your bank balances and investment values. |
| **Tax** | Income tax calculators for Pakistan, UK, and UAE. |
| **Currency** | Live exchange rates and precious metals prices. |

### Identity

| Module | What it's for |
|--------|---------------|
| **Documents** | Passports, ID cards, driving licences, visas, certificates. With expiry alerts. |
| **Digital** | Login credentials, social media accounts, digital wallets. |
| **Emails** | Email identities and their security status (2FA, breach monitoring). |
| **SIM Cards** | Mobile numbers, networks, PUK codes. |
| **Contacts** | People you lend to, owe money to, or deal with financially. |
| **Gadgets** | Devices with IMEI numbers, purchase dates, and warranty info. |

### Assets

| Module | What it's for |
|--------|---------------|
| **Vehicles** | Cars, motorbikes. Tracks registration, insurance, service history. |
| **Property & Assets** | Real estate, valuables, business equipment. |
| **Precious Metals** | Gold and silver holdings with live price tracking. |

### Tools

| Module | What it's for |
|--------|---------------|
| **Timeline** | Chronological activity history across all modules. |
| **Reminders** | Custom and automatic reminders (document expiry, loan due dates). |
| **AI Import** | Smart import from screenshots, spreadsheets, and PDFs using Claude AI. |
| **Recovery Center** | Backup health score, export/restore actions, encryption explainer. |
| **Help & Guide** | This guide, in-app. |
| **Emergency** | Medical info and emergency contacts visible without a PIN. |

---

## Multi-Country Usage

VaultOS is designed for people managing finances across Pakistan, UK, UAE, USA, and more.

### Setting up multiple countries

During onboarding, after choosing your primary country, you can add secondary countries. This enables:

- **Context switcher** — a pill bar on the Finance home and Banks pages lets you filter to one country at a time or view all
- **Bank filtering** — banks are grouped by country flag automatically
- **Currency display** — each bank shows its own currency

### Context switcher

If you have 2+ countries set up, a pill bar appears at the top of Finance and Banks. Tap a country to filter everything to that context, or tap "All" to see everything.

Change secondary countries anytime via **Settings → Profile → Countries**.

---

## Family Vault

The Family module lets you manage finances for your entire household.

### Adding family members

**Family → + Add Member**. Give them a name, relationship (spouse, child, parent), and avatar. Each member gets their own sub-vault containing banks, cards, cash, investments, and documents.

### Head of Family

The first member you add (usually yourself) becomes the Head of Family and appears prominently at the top of the Family page.

### Family member data

Tap any member's card to open their vault. Everything works the same as your own vault — add banks, cards, documents, notes. Data is scoped to that member and won't appear in your own Finance overview.

---

## Backup and Recovery

### Why backups matter

Your data exists only on your device. If your phone is stolen, lost, or reset without a backup, the data is unrecoverable. Export a backup every time you make significant changes.

### Exporting a backup

1. Go to **Settings → Backup & Export → Export Vault**
2. A `.vos` file downloads
3. Save it to iCloud Drive, Google Drive, Dropbox, or email it to yourself
4. Note the fingerprint code shown (e.g. `A3F9KX2M`) — useful for verifying the file later

Or use **Recovery Center → Export Backup** for a more visual view of your backup health.

### Restoring from a backup

1. Open any browser on any device
2. Visit the app
3. Go to **Settings → Import** and select your `.vos` file
4. Enter your PIN when prompted
5. Your vault is fully restored

### What if I lose my phone?

Open any browser → visit the app → Settings → Import → select your `.vos` file → enter your PIN. Done.

**This is why you must keep a backup file somewhere accessible.**

### Backup health score

The Recovery Center shows a health score (0–100) based on how recently you backed up:

| Days since backup | Score |
|------------------|-------|
| Today | 100 |
| ≤ 7 days | 90 |
| ≤ 14 days | 75 |
| ≤ 30 days | 55 |
| ≤ 60 days | 35 |
| Never / >60 days | 20 |

---

## Security Guide

### How encryption works

Your PIN is used as the key for **AES-256-GCM** encryption — the same standard used by banks and governments worldwide.

Key derivation uses **PBKDF2 with 310,000 iterations and SHA-256** — making brute-force attacks computationally expensive even if someone obtains your encrypted data.

Each backup file uses a unique random **salt** and **IV** — so two exports of the same vault produce completely different encrypted files.

**Your PIN never leaves your device.** No server ever sees it.

### Decoy vault

Go to **Settings → Security → Set Decoy PIN**. If someone forces you to open the app, enter the decoy PIN — it shows a completely empty vault. Your real data remains locked behind your real PIN.

### Auto-lock

Enable **Settings → Security → Auto-Lock** to lock the vault automatically when you switch away from the app. The lock triggers on browser tab hide / app backgrounding.

### Panic lock

The lock button (⌘L on desktop, or the lock icon in the FAB menu) instantly locks the vault and blanks all sensitive fields on screen.

### Brute force protection

After 5 wrong PIN attempts, the vault locks for an increasing cooldown period. Attempt counts persist across reloads.

### Emergency access

**Settings → Tools → Emergency** lets you store medical info (blood type, allergies, medications) and an emergency contact. Enable "Show on Lock Screen" — this information is accessible to first responders without a PIN.

---

## Tips and Tricks

**Command palette** — Press ⌘K (desktop) or tap the search icon to open the command palette. You can search all your data or run actions: `lock vault`, `export`, `theme midnight`, `add bank`.

**Keyboard shortcuts** — ⌘L to lock, ⌘N to add new entry, ⌘F to search, ⌘1–⌘3 to switch nav tabs.

**Tags** — Add tags to any entry. Tags are searchable, filterable, and shared across all modules. Use tags like `uk`, `business`, `urgent`, `halal`, `family`.

**Favouriting** — Star any bank, card, or investment. Favourites appear at the top of their list and in smart collections on the dashboard.

**Archiving** — Tap 🗂️ on any entry to archive it (hide without deleting). Useful for old accounts you want to keep a record of. Tap "Show archived" to reveal them.

**Privacy mode** — Tap the 👁️ icon in settings to enable privacy mode. All sensitive values (balances, card numbers, PINs) are blurred on screen. Useful when using the app in public.

**Themes** — 5 themes available: Midnight (black), Graphite (dark grey gold), Cloud (white), Ivory (warm cream), Blossom (pink). Switch instantly via Settings → Appearance or ⌘K → "theme".

**PWA install** — On iPhone: Safari → Share → Add to Home Screen. On Android: browser menu → Install app. VaultOS works fully offline after installation.

**Pull to refresh** — Pull down on any list page to force a re-render and refresh counters.

---

## FAQ

**Is my data safe?**
Yes. Your data never leaves your device. It is encrypted with AES-256-GCM using your PIN. No server, no cloud, no account required.

**What happens if this website goes down?**
Your data is stored on your device, not on any server. Even if the URL disappears, your data is safe in your `.vos` backup. You can open a `.vos` file on any device using any browser.

**Can I use this on multiple devices?**
Export a `.vos` backup from one device and import it on another. There is no automatic sync — this is intentional, to keep your data private.

**What if I forget my PIN?**
Your PIN cannot be recovered — it is never stored anywhere. If you have a `.vos` backup and remember your old PIN, you can restore from that. This is why regular backups and PIN memory are essential.

**Is this app free?**
Yes, completely free. No ads, no subscriptions, no premium tier.

**Does it work offline?**
Yes. After your first visit, install it as a PWA (Add to Home Screen in Safari/Chrome) and it works with zero internet connection. Exchange rates and AI import require an internet connection.

**Who built this?**
VaultOS is built by Shamikh Ahmed — independently, with no company or investor backing. It is a privacy-first tool built for people managing finances across multiple countries.

---

*VaultOS © 2026 Shamikh Ahmed. Source-available. See LICENSE.*

---

## Committee (BC) — Rotating Savings Groups

VaultOS tracks **ballot committees (BC)**, known as BC in Pakistan, pardner in the UK, jamiya in the Middle East, and susu in West Africa.

### Adding a BC
Go to **Finance → Committee (BC) → + Join / Create a BC**. Fill in:
- **Name** — e.g. "Family BC 2026"
- **Role** — Participant (you're a member) or Organiser (you manage it)
- **Type** — Ballot (random draw), Fixed Order (pre-agreed), Bid-based (premium), Auto-deduction
- **Members & Contribution** — the pot is calculated automatically
- **My Turn (Round #)** — which round you receive the pot (leave blank if not drawn yet)
- **Payment Day** — which day of the month payments are due

### Ballot Draw
If you're the organiser and the type is Ballot, open the committee detail and tap **Run Ballot Draw** to randomly assign the next round's winner.

### Islamic Ruling on BC
Pure rotating committees (no premium, no interest) are generally permissible per contemporary scholars including Mufti Taqi Usmani. Bid-based BCs are flagged with a warning as scholars differ on their permissibility.

### Zakat on BC Money
Money you've paid into a BC that you haven't yet received is **zakatable as a receivable** — it's your money held by the group. This is auto-added to your Zakat calculator.

---

## Prize Bonds & Government Securities

Track prize bonds, premium bonds, NSS certificates, and government securities across Pakistan, UK, and UAE.

### Adding Bonds
Go to **Finance → Prize Bonds & Savings → + Add Bond / Security**. Select the bond type — VaultOS knows the draw months for each denomination automatically.

### Bulk Import
Tap **Bulk Import Bond Numbers** to paste a list of bond numbers (one per line). Select the denomination and they're all imported at once.

### Upcoming Draws
VaultOS shows when your next draw is and links directly to the official results page (CDNS for Pakistan, NS&I for UK).

### Zakat on Prize Bonds
Prize bonds are zakatable at **face value** — the total value of all your bonds is automatically added to your Zakat calculator.

---

## Live Rates (Gold, Silver & Currency)

VaultOS fetches live exchange rates and metal prices automatically when you unlock your vault.

- **Exchange rates** — updated from open.er-api.com (free, USD-based)
- **Gold & Silver prices** — updated from api.metals.live (per troy ounce)
- **Cache** — rates are cached for 6 hours. If offline, the last cached rates are used.
- **Manual override** — in the Currency module, tap any rate field to override it manually. Tap "Use live ↺" to revert.

### Gold Net Worth
If you've added gold or silver holdings, VaultOS values them at the **live market price** automatically. Your dashboard net worth reflects the current market value.

---

## Zakat Calculator

VaultOS includes a comprehensive Zakat calculator built on AAOIFI standards and classical fiqh.

### Nisab
Two standards are supported:
- **Silver nisab** — 612.36g of silver (52.5 tola) — default, recommended by Hanafi scholars for mixed assets
- **Gold nisab** — 87.48g of gold (7.5 tola) — stricter standard

Both thresholds are calculated at **live market prices** and shown in your currency.

### Hawl Tracker
Enter the date your wealth first crossed the nisab threshold. VaultOS tracks the 354-day lunar year and shows how many days remain until Zakat becomes due.

### Auto-Fill from Vault
All your vault data is automatically read:
- Cash and bank balances
- Investments (with trading vs long-term type selector — AAOIFI: trading=100%, long-term=25%)
- Gold and silver at live prices
- Loans given out (receivables)
- BC committee money paid in (receivable)
- Prize bonds at face value

All fields are editable — tap any field to adjust before calculating.

### Multi-Currency Result
Zakat due is shown in your currency plus GBP, AED, and PKR equivalents.

---

## Tax Calculator

Go to **Finance → Tax** and select your country tab:

- **🇵🇰 Pakistan** — FBR income tax slabs 2024-25, effective rate, monthly take-home
- **🇬🇧 UK** — Income tax bands + National Insurance (2024-25), your tax band, take-home
- **🇦🇪 UAE** — No personal income tax; corporate tax calculator (9% above AED 375,000)

---

## Widget (Home Screen Snapshot)

Go to **Settings → Home Screen Widget** to open the widget page. Add it to your iPhone/Android home screen:
- **iPhone**: Safari → Share → Add to Home Screen
- **Android**: Chrome → Menu → Add to Home Screen

The widget shows your net worth, vault health, expiring items, and backup status — all read from a local snapshot updated every time you unlock.

---

## Notifications

Go to **Settings → Notifications** and tap **Enable** to allow browser notifications.

VaultOS will alert you when:
- Documents expire in the next 7 days
- Cards expire in the next 30 days
- Loans are due in the next 7 days
- BC payments are due in 3 days

Notifications fire automatically 2.5 seconds after you unlock your vault.

---

## QR Sync

Transfer your vault to another device without cloud storage:

1. On the **source device**: Settings → Sync → Export via QR
2. Scan all QR codes shown (large vaults split into multiple chunks)
3. On the **receiving device**: Settings → Sync → Import via QR
4. Scan the same QR codes — data merges automatically

Data is compressed and transferred as base64 chunks. No internet required.
