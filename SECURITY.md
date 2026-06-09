# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in VaultOS, please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Contact: security@vaultos.app (or open a private discussion via GitHub if email unavailable)

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

I will acknowledge receipt within 48 hours and aim to release a fix within 7 days for critical issues.

## Scope

- Cryptographic implementation (`js/storage.js`)
- PIN / authentication bypass
- Data leakage from localStorage
- XSS in render paths
- CDN supply-chain risks

## Out of Scope

- Issues requiring physical access to an already-unlocked device
- Social engineering attacks
- Issues in third-party CDN libraries themselves

## Security Architecture

VaultOS uses:
- **AES-256-GCM** encryption via Web Crypto API
- **PBKDF2** key derivation (310,000 iterations, SHA-256)
- **Zero-knowledge** PIN authentication — wrong PIN = failed decryption, PIN never stored
- **IndexedDB** for encrypted vault storage (banks, cards, investments, documents, loans, and all other modules)
- **No servers** — all data stays on your device

### Known limitations

The following data remains in **unencrypted** `localStorage` (non-vault, cache only):

- Cached exchange rates (`vo_rates`, `vo_currency`)
- Theme/preferences (`vos_prefs`)
- Per-profile cryptographic salt (`vos_salt_*`) — not secret; required for key derivation

Calculator state (zakat, tax, credit score) is stored inside the encrypted vault via `S.vaultMeta`.

The widget snapshot (`vaultos_widget`) stores **counts and health score only** — no net worth, names, or item titles. Financial figures require unlocking the app.
