# VaultOS LLM Proxy

Included Smart Import parsing for all VaultOS users — no API key setup required in the app.

## Deploy

```bash
cd worker
npx wrangler secret put LLM_API_KEY   # same crsr_ key as bundled in app
npx wrangler deploy
```

Live: `https://vaultos-llm-proxy.shamikhahmed.workers.dev`

## How it works

- VaultOS ships with bundled credentials in `js/config/llm-bundled.js`
- App calls `POST /parse` with `Authorization: Bearer <key>`
- Worker uses Cloudflare Workers AI (`@cf/meta/llama-3.1-8b-instruct`)
- Smart Parser remains offline fallback if proxy unavailable
