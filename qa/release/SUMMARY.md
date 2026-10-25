# VaultCap release checks — 6.0.0

Date: 2026-10-25T18:19Z
Port: 8840  Staged: _site

| Step | Result | Detail |
|---|---|---|
| ci.yml quality · build:js | PASS | ok |
| ci.yml quality · audit:xss | PASS | ok |
| ci.yml quality · playwright chromium gate | PASS | 34 passed |
| ci.yml finish-matrix | PASS | 6 passed |
| pages.yml build · stage-pages-site | PASS | 1296 files in _site |
| serve staged site :8840 | PASS | http://127.0.0.1:8840/ |
| full Playwright --retries=0 | FAIL | passed=180 failed=5 rc=1 |
| ios-behaviour-check (WebKit) | PASS | 23 PASS / 0 FAIL |
| prod-ready audit gates | FAIL | axe=0 (see qa/release/logs/08-prod-ready-gate.log) |
| version coherence (6.0.0 / vaultcap-v600) | PASS | files + staged + pw |

**Overall: FAIL** (2 step(s))
