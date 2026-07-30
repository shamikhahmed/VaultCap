# VaultCap Audit Map — Phase 1

**Audited:** 2026-07-30  
**App truth:** `5.1.16` · SW `vaultcap-v78` (`VERSION.json`, `package.json`, `js/boot-ver.js`)  
**Live:** https://shamikhahmed.github.io/VaultCap  
**Path:** `/Users/shamikhahmed/Desktop/Cap-Apps/VaultCap`  
**Stack:** Vanilla JS PWA · Web Crypto AES-256-GCM · IndexedDB · GitHub Pages

---

## 1. Architecture map

```
index.html + boot-{cache,ver,shell}.js
  → js/storage.js          IndexedDB VaultDB (AES-GCM)
  → dist/vaultcap.bundle.js  (scripts/build-bundle.mjs ← js/bundle-order.json)
       core/   crypto, pin, store, router, act, theme, migrate…
       modules/ banks, cards, family, tax, zakat…
Nav: dock sheets (Money / Wealth / Identity / More) + desktop sidebar + FAB
Deploy: push main → .github/workflows/pages.yml
Optional: worker/llm-proxy.js (CF Workers AI + /logo)
```

### Why each layer exists
| Layer | Why |
|-------|-----|
| VaultDB / PIN / decoy | Zero-knowledge offline vault; duress PIN |
| Act / data-act | CSP `script-src 'self'` — no inline handlers |
| Module registry + toggles | Progressive disclosure; users disable unused domains |
| Dock sheets | Phone-first IA; ≤2 taps to core money/identity |
| Facade modules (gold/vehicles/gadgets) | Legacy deep-links → Assets typed filter |
| Smart Parser / LLM opt-in | Rules-first; cloud only when user enables |
| Bundled bank logos | Privacy — no Google favicon at runtime |
| SW precache | Offline shell + lazy smart-db/tax |

### Routing (R.goto)
**Features:** dashboard, banks, cards, investments, cash, loans, friends, sims, assets, expenses, emails, digital, documents, bc, bonds, zakat, credit, tax, currency, family  

**Aliases:** gadgets→electronics, vehicles→vehicle, gold→precious_metals (Assets)  

**System:** alerts, search, import, timeline, security, backup, recovery, workspace, reminders, trash, emergency, recovery-center, help, sync, settings  

**Hubs:** finance-home, vault-home, assets-home  

### State
- IDB `vaultos[_profile]` store `vault`: keys `main`, `pin_backup`, `decoy`, `recovery`
- Session key in memory; PBKDF2 600k target (legacy 310k migrate)
- `S` in-memory schema v13; `vos_prefs` / salts in localStorage (non-secret meta)
- Export: encrypted `.vos` (backup key) + plaintext JSON/CSV (confirm)

### Design system
Tokens in `css/base.css` + light overrides `css/themes.css`. Space Grotesk / Cinzel / IBM Plex Mono. Dual spacing (`--sp1` vs `--sp-*`). ~141 hex + ~1871 px literals in CSS; ~1489 inline `style=` in JS.

### Build / test / deploy
| Piece | Notes |
|-------|-------|
| Bundle | ~1.1MB `dist/vaultcap.bundle.js` |
| Assets | banks 2.2MB; screenshots ~62MB (gallery) |
| Tests | Playwright chromium + webkit-iphone; ~20 specs |
| Deps | Only Playwright (runtime: zero npm) |
| CI | build + XSS audit + e2e |

---

## 2. Top risks (prioritized)

| # | Sev | Issue | Business impact | User impact | Fix | Effort |
|---|-----|-------|-----------------|-------------|-----|--------|
| 1 | Critical | CSP `connect-src` omits Workers LLM/logo proxy | Smart Assistant + logo fallback dead in prod | Silent fail | Allowlist proxy URL | Low |
| 2 | High | Plaintext JSON/CSV export one confirm away | Vault leak via share/cloud | Data exposure | Typed EXPORT PLAINTEXT gate; .vos default | Low |
| 3 | High | No-PIN mode in Settings | Shared/coercion = open vault | Security story broken | Hide / require master-key ack | Low |
| 4 | High | Docs version drift (README 5.1.11 vs app 5.1.16) | Support/investor distrust | Wrong SW guidance | Sync all version surfaces | Low |
| 5 | High | Help copy claims PIN unlocks `.vos` | Failed restores | Frustration | Align to backup-key model | Med |
| 6 | High | Dual asset storage (`S.assets` + gadgets/vehicles) | NW/export skew | Wrong totals | Migrate + drop parallel arrays | Med |
| 7 | Med | Settings IA dupes (Security×2, Backup×3, a11y∩appearance) | Features missed | Confusion | Collapse homes | Med |
| 8 | Med | ~1489 inline styles | Theme/a11y/CSP style migration blocked | Inconsistent UI | Extract classes incrementally | High |
| 9 | Med | `style-src 'unsafe-inline'` | Weaker XSS defense | Style injection | Nonce/hash migration | High |
| 10 | Med | 6-digit PIN = vault KDF | Offline brute if IDB stolen | Crypto claim weak | PIN wraps stronger key | High |
| 11 | Med | Orphan `pg-gadgets/vehicles/gold` + facades | Dead DOM | Deep-link confusion | Keep aliases; thin facades OK | Low |
| 12 | Med | `constants.js` PBKDF2 310k vs live 600k | Future weak callers | Crypto drift | Point at 600000 | Low |
| 13 | Med | Test gaps: decoy, No-PIN, CSP worker, WebAuthn | Silent regressions | — | Security e2e suite | Med |
| 14 | Low | Home module grid non-navigating | Looks tappable | Dead affordance | Wire or remove | Low |
| 15 | Low | Manifest no version; SW file `sw-v51` vs cache v78 | Ops confusion | — | Add version; rename later | Low |

---

## 3. Dead / duplicate / unused

| Item | Verdict |
|------|---------|
| `gold.js` / `vehicles.js` / `gadgets.js` | Thin facades (26–45 LOC) — keep for API compat until migrate complete |
| `currency.js` vs `currency-engine.js` | Both live: UI page vs NW SSOT — not dead |
| Orphan `pg-gadgets` / `pg-vehicles` / `pg-gold` | Unused when routed via alias — candidates to remove |
| frankfurter in CSP | Allowlisted; rates.js may not use — verify before drop |
| `console.log` in migrate.js (6) | Dev noise — strip or gate |
| Real TODO/FIXME backlog | Empty (placeholders only) |
| Unused npm deps | None (Playwright only) |

---

## 4. Settings IA today (problems)

Order: Profile · Security · Appearance · Modules · Backup · Import · Accessibility · About  

Overlaps:
- Security page (More) **and** Settings→Security
- Backup page **and** Settings→Backup **and** Recovery Center
- Appearance a11y toggles **and** Accessibility tab
- Privacy in Security **and** Accessibility

Target (Phase 3): Account · General · Appearance · Accessibility · Notifications · Privacy & Data · About & Legal — one home per concept; Security/Backup pages deep-link into Settings tabs.

---

## 5. Prioritized plan (Phases 2–13)

1. **P2 Code health:** CSP proxy allowlist; version sync; PBKDF2 constant; strip migrate console.log; orphan page cleanup if safe; build green  
2. **P3 IA:** Collapse Settings groups; More System → Settings deep-links; write `IA-RATIONALE.md`; wire dead home tiles  
3. **P4 Design:** Sheet/settings class extraction for worst inline styles; token consistency; contrast pass  
4. **P5 Forms:** Label/validation/hit-target audit on add flows; selection control semantics  
5. **P6 Responsive:** Viewport + theme live verify; safe-area; keyboard  
6. **P7 A11y:** Expand a11y.spec; focus/ARIA; reduced-motion  
7. **P8 Perf:** Measure TTI/bundle; lazy already present — prove numbers  
8. **P9 Security:** Plaintext export gate; No-PIN hardening; help copy honesty  
9. **P10 Offline:** SW precache prove; rates cache; no stale-build trap  
10. **P11 QA:** Persona walks + edge attacks; fix friction  
11. **P12 Docs:** README/CHANGELOG/gallery captions; bump version consistently  
12. **P13 Final:** Full verify live + report with evidence  

---

## 6. Ambiguous choices (smallest safe default)

- Keep gold/vehicles/gadgets facades until dual-storage migrate proven (don't delete business paths)  
- CSP: add proxy host only — do not widen to `*`  
- No-PIN: require confirm + warning, not silent delete in first pass  
- Version bump to **5.1.17** after Phase 2+3 landed fixes  

---

*Phase 1 complete — map only, no product code changed in this file's commit scope beyond AUDIT.md itself.*
