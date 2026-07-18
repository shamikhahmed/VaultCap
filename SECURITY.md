# VaultCap Security Model

VaultCap is a **100% free**, consumer, offline-first PWA. No account. No subscription. No required cloud AI.

## What protects your data

| Layer | Role |
|-------|------|
| **PIN (6 digits)** | Daily unlock on this device. Derives AES-256-GCM key via PBKDF2 (~600k iterations). |
| **Recovery key** | Shown once at setup. Restores access if you forget PIN (this device / recovery flow). |
| **Backup key** | Generated when you export a `.vos` file. Needed with the file to restore on another device. Not your PIN. |
| **Decoy PIN** | Optional. Opens a convincing fake vault under duress. |
| **Biometrics (optional)** | WebAuthn Face ID / Touch ID / Windows Hello. When PRF is supported, can restore session key; otherwise confirms identity before PIN. |

## Honest limits

- A short PIN is convenient but **not** as strong as a long random secret against someone who copies your device storage offline.
- Keep the device locked, use a recovery key, and export encrypted `.vos` backups with the generated backup key.
- Optional FX / metals rates may fetch when online. Core vault data stays on-device.
- Smart Help is a **rules-based** in-app assistant — not a cloud LLM.

## What we never do

- No Capricorn server holds your vault contents.
- No required API key or paid AI.
- No B2B / pricing tier in the product.

## Report issues

Open a GitHub issue on the VaultCap repository. Do not attach live vault files or recovery keys.
