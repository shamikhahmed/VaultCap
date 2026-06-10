# Changelog — VaultOS

## 4.1.0 (2026-06-10)

### Phase 2 — Quality
- Playwright smoke tests verified (lock screen, settings shell)
- `privacy.html` / `changelog.html` landing pages from PRIVACY.md / CHANGELOG.md
- Docs truth pass: bundled LLM + Cloudflare worker proxy documented accurately

### Smart Import / LLM
- **Bundled LLM** via `js/config/llm-bundled.js` — proxy provider, no user key required
- **Cloudflare Worker** at `https://vaultos-llm-proxy.shamikhahmed.workers.dev` (`worker/llm-proxy.js`)
- Workers AI backend (`@cf/meta/llama-3.1-8b-instruct`) with Smart Parser offline fallback
- Optional custom API key override in Settings → Import

### PWA & icons
- PNG maskable icons (192/512), service worker cache bump (`vaultos-v20`)
- Offline Tesseract OCR for document capture

### Docs
- PRIVACY.md, SECURITY.md, CHANGELOG.md aligned with shipped LLM architecture
