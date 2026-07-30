# VaultCap Phase Report

**Shipped:** 2026-07-30 · **App:** `5.1.23` · **SW:** `vaultcap-v85`

## This closeout (L debt)

| Item | Result |
|------|--------|
| PIN-as-KDF | **Done** — PIN wraps random DEK (`key_wrap`); migrate on unlock; changePin re-wraps |
| Inline styles | **Done wave** — ~57% cut (1884→806) via `vc-ix-*`; CSP unsafe-inline still (residual) |
| Gallery CAPTURE | **Running / regen** — `CAPTURE_SCREENSHOTS=1` + embed |
| Click-all | **Done** — `tests/click-all.spec.js` |

## Prior (5.1.21–22)
Install banner / SW poison; doc PDF; vault switch flush; PERF.md; QA-MATRIX.

## Still L
App Store · drop style-src unsafe-inline · hover micro-states

## Skipped appendices
E cloud auth · I push · J i18n — N/A
