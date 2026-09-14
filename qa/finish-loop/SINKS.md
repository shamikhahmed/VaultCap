# VaultCap innerHTML sinks (VLT-P1-06)

Generated during finish loop 2026-09-15.

## Policy
- Prefer `textContent` / DOM APIs for user and remote strings.
- `escHtml` / attribute escaping for any remaining HTML templates.
- `npm run audit:xss` must stay green before release.

## Status
`npm run audit:xss` → **ok** (2026-09-15).

## Notes
Finance hubs and import preview were included in the static XSS audit. New modules must not introduce unescaped `innerHTML` with user/remote data.
