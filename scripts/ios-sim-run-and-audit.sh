#!/usr/bin/env bash
# Launch VaultCap on iOS Simulator from a full (unsandboxed) Terminal session.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
OUT="$ROOT/qa/ios-audit-2026-10-16"
mkdir -p "$OUT"
LOG="$OUT/sim-run.log"
exec > >(tee "$LOG") 2>&1

echo "== $(date -Iseconds) VaultCap iOS sim run =="
xcodebuild -version
npm run cap:sync

# Prefer any available iPhone simulator
UDID="$(xcrun simctl list devices available -j | python3 -c '
import json,sys
d=json.load(sys.stdin)
prefer=["iPhone 17","iPhone 16","iPhone 15","iPhone 14","iPhone"]
cands=[]
for runtime,devs in d.get("devices",{}).items():
  for dev in devs:
    if not dev.get("isAvailable"): continue
    name=dev.get("name","")
    if "iPhone" not in name: continue
    cands.append((name,dev["udid"],dev.get("state"),runtime))
if not cands:
  sys.exit("No available iPhone simulators")
def score(n):
  for i,p in enumerate(prefer):
    if p in n: return i
  return 99
cands.sort(key=lambda x: (score(x[0]), x[0]))
print(cands[0][1])
')"
NAME="$(xcrun simctl list devices | grep "$UDID" | head -1 | sed 's/(.*//' | xargs)"
echo "Using simulator: $NAME ($UDID)"

xcrun simctl boot "$UDID" 2>/dev/null || true
open -a Simulator || true
# Wait for boot
for i in $(seq 1 60); do
  state="$(xcrun simctl list devices | grep "$UDID" | grep -o 'Booted\|Shutdown' | head -1 || true)"
  [[ "$state" == "Booted" ]] && break
  sleep 1
done

echo "Building…"
xcodebuild -project ios/App/App.xcodeproj -scheme App \
  -configuration Debug \
  -destination "id=$UDID" \
  -derivedDataPath "$ROOT/.derivedData" \
  build

APP="$(find "$ROOT/.derivedData/Build/Products" -name 'App.app' -type d | head -1)"
if [[ -z "$APP" ]]; then
  echo "ERROR: App.app not found after build" >&2
  exit 1
fi
echo "Installing $APP"
xcrun simctl install "$UDID" "$APP"
xcrun simctl launch "$UDID" com.capricorn.vaultcap || \
  xcrun simctl launch "$UDID" "$(defaults read "$APP/Info" CFBundleIdentifier 2>/dev/null || echo com.capricorn.vaultcap)"

# Deep-link style: open demo via URL scheme if registered; else just screenshot home
sleep 3
xcrun simctl io "$UDID" screenshot "$OUT/sim-01-launch.png" || true

# Inject demo via Safari-less approach: open capacitor localhost not available.
# Capture a few more screenshots of current UI.
sleep 1
xcrun simctl io "$UDID" screenshot "$OUT/sim-02.png" || true

echo "BUNDLE=$(defaults read "$APP/Info" CFBundleIdentifier 2>/dev/null || true)"
echo "DONE — screenshots in $OUT"
ls -la "$OUT"/*.png 2>/dev/null || true
