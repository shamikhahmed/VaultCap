#!/usr/bin/env bash
# Run Playwright smoke/e2e across all Capricorn PWAs (sibling repos under Projects/).
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
FAILED=()
PASSED=()

run_app() {
  local dir="$1"
  local name="$(basename "$dir")"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "▶ $name"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  if (cd "$dir" && npm run test:e2e); then
    PASSED+=("$name")
  else
    FAILED+=("$name")
  fi
}

for app in VaultCap PulseCap PrismCap SteadyCap LedgerCap DeePonyCap; do
  run_app "$ROOT/$app"
done

if [[ -d "$ROOT/AuraCap/dist" ]] || (cd "$ROOT/AuraCap" && npm run build); then
  run_app "$ROOT/AuraCap"
else
  FAILED+=("AuraCap (build failed)")
fi

run_app "$ROOT/ScentCap"

echo ""
echo "════════════════════════════════════════"
echo "PLAYWRIGHT SWEEP SUMMARY"
echo "════════════════════════════════════════"
printf '✓ Passed (%s): %s\n' "${#PASSED[@]}" "${PASSED[*]:-none}"
if ((${#FAILED[@]})); then
  printf '✗ Failed (%s): %s\n' "${#FAILED[@]}" "${FAILED[*]}"
  exit 1
fi
echo "All apps passed."
exit 0
