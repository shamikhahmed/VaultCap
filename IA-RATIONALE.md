# VaultCap — Information Architecture Rationale

**Updated:** 2026-07-30 · Phase 3  
**Product:** Encrypted offline life vault (PWA)

---

## Principle

One concept → one home. Ordering law: **most-used / identity at top**; rare in middle; **destructive / legal / sign-out at bottom**. Core tools ≤2 taps from dock.

---

## Primary navigation (dock)

| Tab | Job | Why |
|-----|-----|-----|
| **Home** | Net worth + today | Single landing after unlock — not a junk drawer |
| **Money** (sheet) | Banks · Cards · Cash · Loans · Expenses · BC | Liquid + obligations; one money surface |
| **Wealth** (sheet) | Investments · Bonds · Property | Holdings only; vehicles/metals live as Property filters (no duplicate tiles) |
| **Identity** (sheet) | Docs · SIMs · Emails · Digital · Contacts | Who you are + credentials |
| **More** | Full index + Settings + Help | Escape hatch; not a second Settings |

**Removed from More → System:** Backup + Security as duplicate entries. Those homes are Settings tabs (Account / Privacy). Score dashboard still reachable via `R.goto('security')` from Account → “Open Security Score”.

---

## Settings tabs (mature grouping)

| Tab | Owns | Why here |
|-----|------|----------|
| **Account** | Identity + unlock (PIN, WebAuthn, decoy, auto-lock, profiles) | Identity + vault key are the same mental model for a PIN-first vault |
| **General** | Module toggles | Rarely changed; not appearance |
| **Appearance** | Dark / Light / System only | One concept — theme. No a11y nesting |
| **Access** | Large text · Reduce motion | Accessibility alone — not under Appearance |
| **Alerts** | Links to Reminders / Alerts / Timeline | Discoverable ≤2 taps; prefs are “where to look”, not push servers |
| **Privacy** | Privacy blur · Backup · Import · Plaintext export · Delete | Export/delete near bottom with confirm; plaintext separated from encrypted .vos |
| **About** | Version · Vault ID · Legal · Diagnostics | Always last |

### Legacy aliases (no broken deep-links)
`profile`/`security` → Account · `modules` → General · `backup`/`import` → Privacy

---

## Discoverability map (≤2 taps)

| Need | Path |
|------|------|
| Banks | Money → Banks |
| Add anything | FAB |
| PIN / decoy | Settings → Account |
| Encrypted backup | Settings → Privacy → Export .vos |
| Theme | Settings → Appearance |
| Large text | Settings → Access |
| Reminders | Settings → Alerts → Reminders **or** More → Tools |
| Smart Import | More → Tools → Smart Import **or** Privacy → Import |
| Reset vault | Settings → Privacy → Delete (bottom) |

---

## Progressive disclosure

- Dock sheets show **enabled** modules only; empty → “Enable in Settings”.
- Property holds vehicles/metals/gadgets via filters — Wealth sheet stays three tiles.
- Security **score** page remains a diagnostic surface; controls live in Account.
- Backup **health** (`recovery-center`) remains for power users; daily path is Privacy.

---

## Rejected alternatives

| Idea | Why rejected |
|------|----------------|
| Keep Security + Backup as More peers | Duplicate homes; users missed Settings copies |
| Put PIN under Privacy | Unlock is identity, not export |
| Nest Language under Appearance | N/A today; if added → General |
| Notifications push toggles | No push server — would be dishonest UI |

---

*See also: `AUDIT.md` Phase 1 risks · Cap Family dock convention.*
