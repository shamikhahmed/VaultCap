# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in VaultOS, please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Contact: shamikh73@gmail.com

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

The following data is stored in **unencrypted** `localStorage` and will be migrated to encrypted storage in a future release:

- Gold & precious metals holdings (`vo_gold`)
- Zakat calculation state (`vo_zakat_state`)
- Credit score entries (`vo_credit_score`)
- Cached exchange rates (`vo_currency`)

The widget snapshot (`vaultos_widget`) also stores a non-sensitive summary (item counts, net worth figure, expiring item names) in unencrypted `localStorage` for the PWA home-screen widget.
