# VaultCap — Monetization Plan

## Model: Freemium → Pro ($4.99/mo or $39.99/yr)

### Why someone pays
VaultCap's free tier gives genuine value (encrypted local vault, PIN, offline). Pro is for the user who actually manages their financial life — multiple family members, bank imports across three countries, Zakat, investments. That user has a real problem and real money. A one-time $39.99/yr for their private financial OS is not a hard sell.

### Revenue logic
- Target: 1,000 active users at 5% Pro conversion = 50 Pro users × $4.99 = **$249/mo**
- With 10,000 MAU (realistic after App Store): 500 × $4.99 = **$2,495/mo**
- Enterprise/team: custom pricing via solutions.html → email

---

## Free vs Pro

| Feature | Free | Pro |
|---------|------|-----|
| Vault entries | Up to 5 | Unlimited |
| PIN protection | ✅ | ✅ |
| Local AES-256-GCM encryption | ✅ | ✅ |
| Offline PWA | ✅ | ✅ |
| Family profiles | ❌ | ✅ Up to 6 members |
| Bank statement import | ❌ | ✅ 120+ banks (PK/UK/UAE) |
| Zakat engine | ❌ | ✅ |
| Smart Import (AI-assisted parse) | ❌ | ✅ |
| Investment portfolio tracker | ❌ | ✅ |
| Decoy PIN / panic features | ❌ | ✅ |
| Priority support | ❌ | ✅ |
| Future: cloud backup (opt-in E2E) | ❌ | ✅ Roadmap |

---

## Implementation gates
- `window.VaultPro.isPro()` — reads `localStorage.getItem('vc_pro_active') === '1'`
- Demo mode always returns `isPro() = true` (full experience in demo)
- Gates enforced at: family profile add (>1), bank import modal, Zakat tab, investment tab
- Gate copy: "This is a Pro feature. Unlock the full vault →" + `openProUpgrade()`

## Payment path (current)
- Payment not yet integrated — waitlist via `openProUpgrade()` modal in-app
- Next step: Stripe Checkout (hosted) → webhook sets `vc_pro_token` in localStorage via redirect URL param
- Or: RevenueCat for App Store native billing when Capacitor ships

## Enterprise / investor angle
- See `ENTERPRISE.md` — white-label, family office, diaspora remittance use case
- Demo deck at `pitch.html` covers B2B angle
- Contact: shamikh73@gmail.com

---

*Last updated: 2026-06-28*
