#!/usr/bin/env bash
# Run outside Cursor sandbox: Playwright cannot spawn browsers in the sandbox.
set -euo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
export PLAYWRIGHT_BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH:-$HOME/Library/Caches/ms-playwright}"
cd "$REPO"
mkdir -p qa/prod-ready

if ! curl -sf -o /dev/null http://127.0.0.1:8841/; then
  python3 -m http.server 8841 &
  SRV=$!
  trap 'kill "$SRV" 2>/dev/null || true' EXIT
  sleep 1
else
  SRV=""
fi

echo "=== prod-ready-audit ==="
node scripts/prod-ready-audit.mjs http://127.0.0.1:8841/

echo "=== playwright chromium ==="
npx playwright test --project=chromium 2>&1 | tee qa/prod-ready/e2e-chromium.log

echo "=== ios-behaviour-check ==="
node scripts/ios-behaviour-check.mjs http://127.0.0.1:8841/ | tee qa/prod-ready/ios-check.txt

if [[ -n "${SRV:-}" ]]; then kill "$SRV" 2>/dev/null || true; fi
