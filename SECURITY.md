# VaultOS — Security Notes


## API keys
- LLM keys are **never** hardcoded. Paste in Settings → Import; stored in localStorage on your device only.
- Rotate any key that was exposed in chat or screenshots.

## Encryption
- Vault PIN protects local AES-encrypted storage. No cloud backup unless you export.


## PWA / supply chain
- Static assets served from GitHub Pages; verify `sw.js` cache version when updating.
- Do not commit `.env` or API keys to the repository.

## Reporting
Open a private security issue on the VaultOS GitHub repo for vulnerabilities.
