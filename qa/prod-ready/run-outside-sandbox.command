#!/bin/bash
# Double-click or: open qa/prod-ready/run-outside-sandbox.command
# Runs Playwright outside Cursor sandbox.
set -euo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO"
export PLAYWRIGHT_BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH:-$HOME/Library/Caches/ms-playwright}"
OUT="$REPO/qa/prod-ready"
mkdir -p "$OUT/shots"
LOG="$OUT/outside-run.log"
exec > >(tee "$LOG") 2>&1

echo "=== $(date) VaultCap prod-ready outside-sandbox ==="
echo "REPO=$REPO"
echo "PLAYWRIGHT_BROWSERS_PATH=$PLAYWRIGHT_BROWSERS_PATH"

pkill -f "http.server 8842" 2>/dev/null || true
python3 -m http.server 8842 &
SRV=$!
sleep 0.8

echo "=== audit ==="
node scripts/prod-ready-audit.mjs "http://127.0.0.1:8842/" || echo "AUDIT_EXIT=$?"

echo "=== e2e chromium ==="
npx playwright test --project=chromium 2>&1 | tee "$OUT/e2e-chromium.log" | tail -80
echo "E2E_DONE"

echo "=== ios-check ==="
node scripts/ios-behaviour-check.mjs "http://127.0.0.1:8842/" 2>&1 | tee "$OUT/ios-check.txt" || echo "IOS_EXIT=$?"

kill "$SRV" 2>/dev/null || true
echo "DONE" > "$OUT/outside-run.done"
echo "=== finished $(date) ==="
