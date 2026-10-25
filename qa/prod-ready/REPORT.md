# VaultCap — Production-readiness report (HIG 3 / `design/hig-3`)

**Date:** 2026-10-25  
**Folder:** `Cap-Apps/_workspace/VaultCap-hig`  
**Browser note:** Cursor sandbox kills Chromium (`SIGSEGV` / `SEGV_ACCERR`) and rejects `required_permissions: ["all"]`. Interactive A–G evidence that needs a real browser was **not** re-run in-agent. Prior HIG-6 WebKit ios-check on this branch: **21/21 PASS** (`qa/hig-6/ios-check-branch.txt`). Re-run locally: `bash qa/prod-ready/run-prod-ready-local.sh` (ports 8840–8849).

## A–L checklist

| | Area | Status | Evidence |
|---|---|---|---|
| A | Build & gates | **FIXED** / partial | `npm run build:js` OK; `npm run audit:xss` OK; `tests/version-coherence.spec.js` **1 passed** (VERSION↔SW↔pkg↔boot-ver). Full e2e **blocked** in sandbox (159 launch failures). |
| B | Screen inventory | **PASS** | `qa/prod-ready/INVENTORY.md` from `index.html` / `R.goto` / modules / settings tabs / Modal titles. |
| C | Visual pass | **FAIL** (env) | No new shots (browser blocked). Harness ready: `scripts/prod-ready-audit.mjs`. |
| D | Interaction pass | **FIXED** (code) / **FAIL** (env proof) | Esc left overlay open — **fixed** (`FocusTrap` + `Modal.close`). Full tap pass needs browser. |
| E | Core flows | **FAIL** (env) | Not re-proven here. Prior suite + WebKit bank add on branch. Leave `VaultProfiles.switch()` reload. |
| F | iPhone behaviour | **PASS** (prior) / **FIXED** (CSS) | `qa/hig-6/ios-check-branch.txt` 21/21. Early tab-bar `bottom`/`pb` pad aligned to `max(14px,safe+6)` + bar+48+safe. |
| G | Accessibility | **FAIL** (env) | axe harness in audit script; `@axe-core/playwright` present. Modal has `aria-modal` + labelledby in shell. |
| H | PWA/offline | **PASS** (static) | Manifest icons+maskable+apple-touch; theme `#000` = dark `--bg`. SW `vaultcap-v100` precaches design CSS + bundles; no `skipWaiting`/`clients.claim`. |
| I | Performance | **N/A** this pass | Prior v7 LH mobile median 95 (`qa/v7/`). No new LH run. |
| J | Robustness/privacy | **FIXED** / **PASS** (static) | Pitch `rel=noopener`; CSP in `index.html`; XSS audit OK; connect-src allowlist: `open.er-api.com`, `api.metals.live`, `data-asg.goldprice.org`, `vaultos-llm-proxy…workers.dev`. |
| K | Content | **PASS** (static) | No lorem/TODO/coming-soon in shell HTML/JS user paths scanned. |
| L | Docs | **FIXED** | README/HANDOVER → 5.4.3 / `vaultcap-v100`; CHANGELOG Unreleased audit entry; DESIGN.md already accurate. |

## Defects found & fixed

| Sev | Screen / area | Cause | Fix commit |
|---|---|---|---|
| High | All sheets | Esc called `FocusTrap.release()` only → overlay stayed `.on` | `fix(a11y): Esc closes modal overlay` |
| Med | A / release | `VERSION.json` `swCache` `v99` vs SW `v100` | `fix(version): sync VERSION swCache to vaultcap-v100` |
| Med | Phone tab bar | Early CSS `bottom: max(10px,…)` and `+32px` pad disagreed with HIG canonical rules | `fix(hig): align tab bar safe-area CSS` |
| Low | pitch.html | `target=_blank` without `rel=noopener` | `fix(privacy): noopener on pitch blank links` |
| Low | Docs | README/HANDOVER still 5.4.0 / v96 | `docs: sync README HANDOVER to 5.4.3 / v100` |

## Left FAIL (why)

1. **C / D / E / G interactive proof** — Playwright cannot launch in Cursor sandbox; user denied unsandboxed runs. Run `qa/prod-ready/run-prod-ready-local.sh` on the Mac to fill shots + findings JSON.
2. **Full e2e count** — not re-established this session (sandbox). Version gate alone: 1 passed. Prior brain note: ~154 pass / 5 fail (4 pre-existing on main).

## Test counts

| | Count |
|---|---|
| Before (this session, sandboxed full e2e) | 0 pass / 170 fail (browser missing) / 3 skip |
| After (proven here) | version-coherence **1 passed**; xss **ok**; build **ok** |
| ios-check (prior on branch) | **21/21 PASS** (`qa/hig-6/ios-check-branch.txt`) |

## External hosts (CSP / connect-src)

- `open.er-api.com` (FX)
- `api.metals.live` / `data-asg.goldprice.org` (metals)
- `vaultos-llm-proxy.shamikhahmed.workers.dev` (opt-in LLM)

## How to finish evidence locally

```bash
export PLAYWRIGHT_BROWSERS_PATH="$HOME/Library/Caches/ms-playwright"
cd /Users/shamikhahmed/Projects/Cap/Cap-Apps/_workspace/VaultCap-hig
bash qa/prod-ready/run-prod-ready-local.sh
# then refresh REPORT statuses from audit-findings.json + e2e-chromium.log + ios-check.txt
```

## Round 2 (outside-sandbox evidence → code fixes)

**Evidence in:** `qa/prod-ready/audit-findings.json`, `round2-findings.json`, WebKit ios-check **22/22**, Playwright **167 pass / 3 skip / 0 fail**.

| Item | Root cause | Fix |
|---|---|---|
| axe ×36 (aria-required-children, scrollable-region-focusable, select-name, label, button-name, aria-hidden-focus) | Empty/`div` FAB menu under `role=menu`; closed menus used `aria-hidden` with focusable children; unlabeled selects/toggles; investment fav icon buttons; chip/`wallet-row` scrollers without keyboard name | Menuitems as `<button role="menuitem">`; closed menus `hidden`+`inert`; labels/`aria-label` on sorts & toggles; chip buttons; sticky/`tabindex` scrollers |
| 12× CSS 404 (`/base.css` … `/design/vaultcap.css`) | `css/app.css` `@import` URLs re-resolved against document root when stylesheets are cloned (e.g. axe) | Discrete `<link layer="legacy\|components">` tags; `app.css` only declares `@layer` order |
| Banks `openAdd` click timeout | Header Add scrolled off-screen under document-scroll + large-title layout; harness used unbound `.first()` | Sticky `.ph`; harness targets `#pg-banks.on .ph [data-act=…]` + scrollIntoView |

**Regression specs:** `tests/prod-ready-round2.spec.js` (no root CSS 404s; axe smoke on dashboard/banks/settings; Banks Add visible after scroll).

**Re-verify locally:** `npx playwright test tests/prod-ready-round2.spec.js` then `bash qa/prod-ready/run-prod-ready-local.sh`.

## Code review (hig-3 follow-ups)

Nine review findings fixed on `design/hig-3` (one commit each). Cheap specs: `tests/code-review-hig.spec.js`. Browser not re-run in Cursor sandbox — re-verify locally: `npx playwright test tests/code-review-hig.spec.js`.

| # | Finding | Fix |
|---|---|---|
| 1 | `resetScroll` ignored ScrollLock pin | `ScrollLock.scrollTo(0)` when locked |
| 2 | Multi-currency cash breakdown missing | Cash widget `sub` with escaped `.sens` amounts |
| 3 | Pull-to-refresh removed with `.pb` | Document-level PTR (`initDocumentPullToRefresh`) |
| 4 | ScrollLock skipped overlays outside `#app` | Sync locks whenever OPEN overlay is visible |
| 5 | FocusTrap Esc did not close all overlays | `onEscape` on theme, cmdPal, dialogs, sheets |
| 6 | FAB `hidden` killed open/close transition | `inert`/`aria-hidden` immediately; `hidden` after `transitionend` |
| 7 | Body-wide class MutationObserver | Explicit `ScrollLock.sync()` on open/close paths |
| 8 | Theme dots were inline-styled buttons | `ui-segmented` (+ critical CSS) |
| 9 | `<button>` tiles had `<div>` children | `<span>` + CSS `display:block/flex` |

**Commits:** `81aedd0`–`f97ab5a` (+ this REPORT). Specs not executed in-agent (sandbox kills Chromium).
