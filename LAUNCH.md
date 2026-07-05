# VaultCap — 7-Day Launch Plan

**Live app:** https://shamikhahmed.github.io/VaultCap  
**Install guide:** [install.html](./install.html)  
**Version:** 4.9.6 (beta readiness)

## What “ready” means

| Channel | Day 1–7 | Notes |
|---------|---------|--------|
| Website (browser) | **Ship** | Already live via GitHub Pages |
| Install as app (PWA) | **Ship** | iPhone, Android, Windows, Mac — see install.html |
| Google Play | Prepare | Needs Play Console ($25) + TWA/PWA Builder package |
| Apple App Store | Prepare | Needs Apple Developer ($99/yr) + native wrapper + review (often >7 days) |
| Mac App Store | Later | Same Apple account; extra Mac packaging |
| Microsoft Store | Prepare | PWA submit via Partner Center |

**Honest call:** Full App Store / Play approval in 7 days is **not guaranteed**. Website + PWA install **is** launchable now. Store listings are week-2 track once accounts exist.

---

## Data protection (no cloud ID)

VaultCap is **zero-knowledge**. Do **not** add email/password login for v1 — that needs servers and breaks the model.

| Control | Role |
|---------|------|
| **6-digit PIN** | Password — unlocks vault on this device |
| **Master recovery key** | Offline recovery if PIN forgotten |
| **AES-256-GCM + PBKDF2 310k** | Encrypts vault before storage |
| **IndexedDB / localStorage** | Encrypted data on device only |
| **Decoy PIN** | Optional fake vault under duress (sample data, real vault untouched) |
| **Lockout** | Slows / blocks brute force |
| **`.vos` export** | User-owned backup / device move |

PIN and keys never leave the device. We cannot reset a forgotten PIN without the master key.

---

## Day-by-day checklist

### Day 1 — Freeze + verify
- [x] PWA live on GitHub Pages (`npm run build:js` in Pages workflow)
- [x] Bank↔card linking + catalog
- [x] Dashboard / search / expense / loan link UX
- [ ] `npm run test:e2e` green on `main`
- [ ] `npm run audit:xss` green
- [ ] Manual smoke: unlock, add bank+card, backup export, lock

### Day 2 — Install surface
- [x] `install.html` — all platforms
- [ ] Landing CTAs → Install + Open
- [ ] Privacy / SECURITY links from install page
- [ ] Demo PIN only in demo vault (never production default)

### Day 3 — Security pass
- [ ] Confirm lockout persists (lockout-store)
- [ ] Confirm master key shown once at onboarding
- [ ] No secrets in repo (`git grep` for API keys)
- [ ] Bundled LLM proxy: optional, documented, Smart Parser default

### Day 4 — Content + trust
- [ ] Landing version badge matches VERSION.json
- [ ] Screenshots current in manifest
- [ ] Privacy policy accurate (local storage, no account)

### Day 5 — Store prep (optional)
- [ ] Create Google Play developer account
- [ ] Create Apple Developer account
- [ ] Package Android TWA via [PWA Builder](https://www.pwabuilder.com/) pointing at live URL
- [ ] Capacitor iOS only if Apple account ready (was removed; re-add only for store)

### Day 6 — Soft launch
- [ ] Share install.html with 5–10 testers
- [ ] Collect: install friction, PIN clarity, backup understanding
- [ ] Fix P0 bugs only

### Day 7 — Public launch
- [ ] Announce website + install guide
- [ ] Pin GitHub release / tag `v4.9.6`
- [ ] Submit Play/Apple packages if ready (review continues after launch)

---

## Pre-launch commands

```bash
npm run build:js
npm run audit:xss
npm run test:e2e
```

Deploy: push `main` → Pages workflow builds bundle and publishes.

---

## Do not block launch on

- Full App Store approval
- Cloud accounts / email login
- Capacitor iOS unless Apple account + certificates ready
- Perfect catalog of every bank worldwide (already 300+ banks / 1800+ cards)

## Must have for launch

- PIN + encryption working
- Backup / restore path clear
- Install instructions on website
- Tests green
- No known critical security holes
