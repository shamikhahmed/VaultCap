# VaultCap — Security Notes

## How data is stored (user-facing)

VaultCap does **not** use email/password accounts. That would require our servers.

| Piece | What it is |
|-------|------------|
| **PIN (6 digits)** | Your password — unlocks the vault on this device only |
| **Master recovery key** | Shown once at setup — recover if PIN forgotten |
| **AES-256-GCM vault** | Encrypted blob in browser storage (IndexedDB / localStorage) |
| **PBKDF2 310k** | Derives encryption key from PIN — never sent anywhere |
| **Decoy PIN** | Optional — opens empty vault under duress |
| **`.vos` export** | Your backup file — move to another device yourself |

**PIN and keys never leave the device.** We cannot reset your PIN. No cloud login, no “forgot password” email.

## Threat model boundaries

| Boundary | In scope | Out of scope |
|----------|----------|--------------|
| Device storage | AES-encrypted vault, localStorage session | Cloud backup (unless you export) |
| Network | Optional LLM proxy, static PWA assets | Server-side vault sync |
| Attacker model | Physical device access, shoulder surfing, malicious backup files | Nation-state remote breach of GitHub Pages |
| Trust assumptions | User chooses PIN strength; user controls exports | VaultCap does not custody funds or identity documents |

**Demo / enterprise:** Fictional demo profiles never contain real PII. Rotate bundled LLM proxy keys if exposed.

## Encryption & vault

- Vault PIN protects local **AES-256-GCM** storage with **PBKDF2** (310k iterations).
- PIN and derived keys **never leave your device**.
- Decoy PIN opens a separate honeypot vault.
- Brute-force lockout after repeated failed attempts.
- No cloud backup unless you export `.vos` yourself.

## Smart Import / LLM

| Path | Network | Secret exposure |
|------|---------|-----------------|
| Smart Parser | None | N/A — fully offline |
| Bundled proxy | Cloudflare Worker | Bearer token in public JS bundle (extractable) |
| Custom API key | User-configured endpoint | localStorage on device only |

### Bundled LLM architecture

- **Client:** `js/config/llm-bundled.js` → `js/modules/llm-assist.js`
- **Proxy:** `https://VaultCap-llm-proxy.shamikhahmed.workers.dev` (see `worker/llm-proxy.js`)
- **Worker secret:** Real API key stored via `wrangler secret put LLM_API_KEY` — not in git
- **Fallback:** Smart Parser if proxy fails or is disabled

**Operational guidance:**

- Rotate bundled/proxy keys if exposed in screenshots or chat.
- Do not paste credentials, full card numbers, or medical records into Smart Import.
- Prefer Smart Parser for sensitive free-text when LLM parsing is not required.

## PWA / supply chain

- Static assets served from GitHub Pages; verify `sw-v51.js` cache version when updating.
- Do not commit `.env`, wrangler secrets, or raw API keys to the repository.
- Subresource integrity: review third-party scripts (`vendor/tesseract.min.js`) when upgrading.

## Reporting

Open a private security issue on the [VaultCap GitHub repo](https://github.com/shamikhahmed/VaultCap) for vulnerabilities.
