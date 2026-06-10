# VaultCap — Privacy Policy

**Last updated:** June 10, 2026

VaultCap is an offline-first Progressive Web App. **Your vault data stays on your device** unless you explicitly export it.

## What we collect

- **Nothing by default.** No accounts, analytics SDKs, or third-party trackers ship in this app.
- **Smart Import (optional):** When enabled, text you paste for parsing is sent to the configured LLM endpoint. See Smart Import / LLM below.

## Storage

- App state is stored in **localStorage** and/or **IndexedDB** in your browser.
- Uninstalling or clearing site data removes local copies.
- Encrypted `.vos` backups are files you control — we never receive them.

## Network

- **Live FX / gold rates:** Public rate APIs with 6-hour cache; no personal data sent.
- **Smart Import / LLM:** See below.
- GitHub Pages serves static files only — no server-side access to your vault.

## Smart Import / LLM

VaultCap offers three parsing paths for Smart Add:

1. **Smart Parser (default, offline)** — Rule-based parsing on-device. No network. No data leaves your browser.
2. **Bundled LLM (shipped)** — VaultCap includes `js/config/llm-bundled.js` with a proxy provider. Requests go to the Cloudflare Worker at `https://VaultCap-llm-proxy.shamikhahmed.workers.dev` (`POST /parse`). Only the text you submit for parsing is transmitted — never your full vault, PIN, or encryption keys.
3. **Custom key (optional)** — Paste your own API key or proxy URL in Settings → Import. Stored in localStorage on your device only.

The Cloudflare Worker uses Workers AI (`@cf/meta/llama-3.1-8b-instruct`). If the proxy is unavailable, Smart Parser is used automatically.

**Important:** Bundled credentials are visible in the public PWA bundle. Treat Smart Import text as non-secret; do not paste full account numbers or passwords into Smart Add.

## Children

- VaultCap is a general-purpose adult life OS. Parents should supervise device sharing and exports on shared family devices.

## Contact

Built by Shamikh Ahmed — issues via the [VaultCap GitHub repository](https://github.com/shamikhahmed/VaultCap).
