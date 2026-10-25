#!/usr/bin/env bash
# VaultCap 6.0.0 release gate — run from repo root OUTSIDE the Cursor sandbox.
#
# Reproduces every `run:` step from:
#   .github/workflows/ci.yml     → jobs quality, finish-matrix
#   .github/workflows/pages.yml  → job build (stage allowlist; no deploy)
#
# Then: full Playwright (--retries=0), ios-behaviour-check (WebKit) on staged
# site, prod-ready audit gates, version coherence.
#
# Usage: bash qa/release/run-checks.sh
# Writes: qa/release/logs/*  and  qa/release/SUMMARY.md
# Exit: non-zero if any step FAIL.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

EXPECT_VER="6.0.0"
EXPECT_SW="vaultcap-v600"
PORT="${RELEASE_PORT:-8840}"
SITE="_site"
LOGS="qa/release/logs"
SUMMARY="qa/release/SUMMARY.md"

export PLAYWRIGHT_BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH:-$HOME/Library/Caches/ms-playwright}"
export CI="${CI:-true}"

mkdir -p "$LOGS"

declare -a STEPS=()
declare -a STATUSES=()
declare -a DETAILS=()

record() {
  STEPS+=("$1")
  STATUSES+=("$2")
  DETAILS+=("$3")
  printf '%s  %s  %s\n' "$2" "$1" "$3"
}

run_logged() {
  local name="$1"
  local logfile="$2"
  shift 2
  set +e
  "$@" >"$logfile" 2>&1
  local rc=$?
  set -e
  return "$rc"
}

SRV_PID=""
cleanup() {
  if [[ -n "${SRV_PID}" ]]; then
    kill "$SRV_PID" 2>/dev/null || true
    wait "$SRV_PID" 2>/dev/null || true
    SRV_PID=""
  fi
}
trap cleanup EXIT

start_server() {
  local dir="$1"
  cleanup
  (cd "$dir" && python3 -m http.server "$PORT") >"$LOGS/http-server.log" 2>&1 &
  SRV_PID=$!
  local i=0
  while ! curl -sf -o /dev/null "http://127.0.0.1:${PORT}/"; do
    i=$((i + 1))
    if [[ "$i" -gt 30 ]]; then
      echo "FAIL: http.server on :${PORT} did not become ready" >&2
      return 1
    fi
    sleep 0.2
  done
}

# ── 0. HIG standing rules (static, no browser) ───────────────────────────────
if run_logged "hig-guards" "$LOGS/00-hig-guards.log" node scripts/hig-guards.mjs; then
  record "hig-guards (standing rules 1–4)" "PASS" "ok"
else
  record "hig-guards (standing rules 1–4)" "FAIL" "see $LOGS/00-hig-guards.log"
fi

# ── 1a. CI quality: build + xss ──────────────────────────────────────────────
if run_logged "ci-build-js" "$LOGS/01-build-js.log" npm run build:js; then
  record "ci.yml quality · build:js" "PASS" "ok"
else
  record "ci.yml quality · build:js" "FAIL" "see $LOGS/01-build-js.log"
fi

if run_logged "ci-xss" "$LOGS/02-audit-xss.log" npm run audit:xss; then
  record "ci.yml quality · audit:xss" "PASS" "ok"
else
  record "ci.yml quality · audit:xss" "FAIL" "see $LOGS/02-audit-xss.log"
fi

# ── 1b. CI quality: chromium gate (VAULTCAP_CI_GATE=1, retries 0 via env) ─────
set +e
(
  export VAULTCAP_CI_GATE=1
  export CI=true
  npx playwright test --project=chromium --retries=0
) >"$LOGS/03-ci-chromium-gate.log" 2>&1
RC=$?
set -e
if [[ "$RC" -eq 0 ]]; then
  PASSED=$(grep -Eo '[0-9]+ passed' "$LOGS/03-ci-chromium-gate.log" | tail -1 | awk '{print $1}')
  record "ci.yml quality · playwright chromium gate" "PASS" "${PASSED:-?} passed"
else
  record "ci.yml quality · playwright chromium gate" "FAIL" "rc=$RC (see $LOGS/03-ci-chromium-gate.log)"
fi

# ── 1c. CI finish-matrix ─────────────────────────────────────────────────────
set +e
(
  export FINISH_MATRIX=1
  export CI=true
  npm run test:matrix
) >"$LOGS/04-finish-matrix.log" 2>&1
RC=$?
set -e
if [[ "$RC" -eq 0 ]]; then
  PASSED=$(grep -Eo '[0-9]+ passed' "$LOGS/04-finish-matrix.log" | tail -1 | awk '{print $1}')
  record "ci.yml finish-matrix" "PASS" "${PASSED:-?} passed"
else
  record "ci.yml finish-matrix" "FAIL" "rc=$RC (see $LOGS/04-finish-matrix.log)"
fi

# ── 1d. pages.yml stage allowlist (C-57) ─────────────────────────────────────
set +e
(
  export SW_FILE=sw-v51.js
  export ALLOW_PATHS="index.html landing.html pitch.html presentation.html privacy.html changelog.html screen-gallery.html install.html widget.html sw-v51.js manifest.json VERSION.json css js assets icons dist vendor apple-touch-icon.png favicon.svg mark.svg icon.svg icon-mark.svg icon-192.png icon-512.png icon-1024.png icon-maskable-192.png icon-maskable-512.png"
  export FORBIDDEN_EXTRA="resources scripts worker docs memory ios www"
  bash scripts/stage-pages-site.sh "$SITE"
) >"$LOGS/05-stage-pages.log" 2>&1
RC=$?
set -e
if [[ "$RC" -eq 0 ]]; then
  NFILES=$(find "$SITE" -type f | wc -l | tr -d ' ')
  record "pages.yml build · stage-pages-site" "PASS" "${NFILES} files in $SITE"
else
  record "pages.yml build · stage-pages-site" "FAIL" "rc=$RC (see $LOGS/05-stage-pages.log)"
fi

# Serve staged site for remaining browser steps
if [[ -d "$SITE" ]]; then
  if start_server "$SITE"; then
    record "serve staged site :${PORT}" "PASS" "http://127.0.0.1:${PORT}/"
  else
    record "serve staged site :${PORT}" "FAIL" "server start"
  fi
else
  record "serve staged site :${PORT}" "FAIL" "no $SITE"
fi

BASE="http://127.0.0.1:${PORT}/"

# ── 2. Full Playwright suite, retries=0 ──────────────────────────────────────
set +e
(
  unset VAULTCAP_CI_GATE || true
  export CI=true
  # Force retries=0 even if CI would set 1 (playwright.config: CI?1:0 unless gate)
  npx playwright test --retries=0
) >"$LOGS/06-playwright-full.log" 2>&1
RC=$?
set -e
FULL_PASSED=$(grep -Eo '[0-9]+ passed' "$LOGS/06-playwright-full.log" | tail -1 | awk '{print $1}' || true)
FULL_FAILED=$(grep -Eo '[0-9]+ failed' "$LOGS/06-playwright-full.log" | tail -1 | awk '{print $1}' || true)
if [[ "$RC" -eq 0 ]]; then
  record "full Playwright --retries=0" "PASS" "${FULL_PASSED:-?} passed"
else
  record "full Playwright --retries=0" "FAIL" "passed=${FULL_PASSED:-0} failed=${FULL_FAILED:-?} rc=$RC"
fi

# ── 3. ios-behaviour-check (WebKit only) against staged site ─────────────────
set +e
node scripts/ios-behaviour-check.mjs "$BASE" >"$LOGS/07-ios-behaviour.log" 2>&1
RC=$?
set -e
IOS_PASS=$(grep -c '^PASS' "$LOGS/07-ios-behaviour.log" || true)
IOS_FAIL=$(grep -c '^FAIL' "$LOGS/07-ios-behaviour.log" || true)
if [[ "$RC" -eq 0 ]]; then
  record "ios-behaviour-check (WebKit)" "PASS" "${IOS_PASS} PASS / ${IOS_FAIL} FAIL"
else
  record "ios-behaviour-check (WebKit)" "FAIL" "${IOS_PASS} PASS / ${IOS_FAIL} FAIL (see $LOGS/07-ios-behaviour.log)"
fi

# ── 4. Prod-ready audit harness + gates ──────────────────────────────────────
set +e
node scripts/prod-ready-audit.mjs "$BASE" >"$LOGS/08-prod-ready-audit.log" 2>&1
RC_AUDIT=$?
set -e

set +e
node <<'NODE' >"$LOGS/08-prod-ready-gate.log" 2>&1
const fs = require('fs');
const path = require('path');
const f = path.join('qa', 'prod-ready', 'audit-findings.json');
if (!fs.existsSync(f)) {
  console.log('FAIL missing audit-findings.json');
  process.exit(1);
}
const r = JSON.parse(fs.readFileSync(f, 'utf8'));
const findings = r.findings || [];
const axeBad = findings.filter((x) => x.area === 'G' && (x.sev === 'crit' || x.sev === 'high'));
const consoleBad = findings.filter((x) =>
  (x.screen === 'console' || x.screen === 'console-fresh' || (x.msg || '').startsWith('http')) &&
  (x.sev === 'crit' || x.sev === 'high')
);
// Prefer typed console/http from D area
const httpBad = findings.filter((x) => /^(4|5)\d\d\s/.test(x.msg || '') || (x.msg || '').includes('http') && /^\d{3}\s/.test(x.msg || ''));
const httpFromMsg = findings.filter((x) => /^(4|5)\d\d\s/.test(String(x.msg || '')));
const offlineFail = findings.some((x) => x.area === 'H' && x.screen === 'offline' && (x.sev === 'high' || x.sev === 'crit'));
const offlineOk = findings.some((x) => x.area === 'H' && x.screen === 'offline' && /shell present offline/i.test(x.msg || ''));

let fail = 0;
const axeN = typeof r.axeSerious === 'number' ? r.axeSerious : axeBad.length;
console.log(`axe_serious_critical=${axeN}`);
if (axeN !== 0) { console.log(`FAIL axe serious/critical = ${axeN}`); fail = 1; }
else console.log('PASS axe serious/critical = 0');

const cons = findings.filter((x) => x.area === 'D' && (x.screen === 'console' || x.screen === 'console-fresh'));
console.log(`console_errors=${cons.length}`);
if (cons.length !== 0) { console.log('FAIL console errors'); cons.slice(0, 10).forEach((c) => console.log('  ', c.msg)); fail = 1; }
else console.log('PASS no console errors');

console.log(`http_ge_400=${httpFromMsg.length}`);
if (httpFromMsg.length !== 0) { console.log('FAIL HTTP ≥400'); httpFromMsg.slice(0, 10).forEach((c) => console.log('  ', c.msg)); fail = 1; }
else console.log('PASS no HTTP ≥400');

if (offlineFail || !offlineOk) { console.log('FAIL offline reload'); fail = 1; }
else console.log('PASS offline reload OK');

process.exit(fail);
NODE
RC_GATE=$?
set -e

if [[ "$RC_AUDIT" -ne 0 ]]; then
  record "prod-ready audit harness" "FAIL" "audit rc=$RC_AUDIT"
elif [[ "$RC_GATE" -ne 0 ]]; then
  AXE=$(grep -Eo 'axe_serious_critical=[0-9]+' "$LOGS/08-prod-ready-gate.log" | head -1 | cut -d= -f2 || echo '?')
  record "prod-ready audit gates" "FAIL" "axe=${AXE} (see $LOGS/08-prod-ready-gate.log)"
else
  record "prod-ready audit gates" "PASS" "axe=0 console=0 http=0 offline=OK"
fi

# ── 5. Version coherence ─────────────────────────────────────────────────────
set +e
EXPECT_VER="$EXPECT_VER" EXPECT_SW="$EXPECT_SW" node <<NODE >"$LOGS/09-version-coherence.log" 2>&1
const fs = require('fs');
const path = require('path');
const expectVer = process.env.EXPECT_VER || '6.0.0';
const expectSw = process.env.EXPECT_SW || 'vaultcap-v600';
const root = process.cwd();
let fail = 0;
const ver = JSON.parse(fs.readFileSync(path.join(root, 'VERSION.json'), 'utf8'));
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const sw = fs.readFileSync(path.join(root, 'sw-v51.js'), 'utf8');
const boot = fs.readFileSync(path.join(root, 'js/boot-ver.js'), 'utf8');
const cache = fs.readFileSync(path.join(root, 'js/boot-cache.js'), 'utf8');
const shell = fs.readFileSync(path.join(root, 'js/boot-shell.js'), 'utf8');
const load = fs.readFileSync(path.join(root, 'js/boot-load.js'), 'utf8');
const lazy = fs.readFileSync(path.join(root, 'js/core/lazy-loader.js'), 'utf8');
const stagedVer = path.join(root, '_site', 'VERSION.json');
const stagedSw = path.join(root, '_site', 'sw-v51.js');

function check(name, ok, detail) {
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + name + (detail ? '  (' + detail + ')' : ''));
  if (!ok) fail = 1;
}

const m = sw.match(/const\s+CACHE\s*=\s*'([^']+)'/);
check('VERSION.json version', ver.version === expectVer, ver.version);
check('VERSION.json swCache', ver.swCache === expectSw, ver.swCache);
check('package.json version', pkg.version === expectVer, pkg.version);
check('sw-v51.js CACHE', m && m[1] === expectSw, m && m[1]);
check('boot-ver VER', boot.includes("window.VER = '" + expectVer + "'"));
check('boot-ver APP_VERSION', boot.includes("window.APP_VERSION = '" + expectVer + "'"));
check('boot-cache BUILD', cache.includes("var BUILD = '" + expectVer + "'"));
check('boot-shell SW ?v=', shell.includes('sw-v51.js?v=' + expectVer));
check('boot-load fallback', load.includes("'" + expectVer + "'"));
check('lazy-loader app ?v=', lazy.includes('vaultcap.app.js?v=' + expectVer));
if (fs.existsSync(stagedVer)) {
  const sv = JSON.parse(fs.readFileSync(stagedVer, 'utf8'));
  check('staged VERSION.json', sv.version === expectVer && sv.swCache === expectSw, JSON.stringify(sv));
}
if (fs.existsSync(stagedSw)) {
  const ssw = fs.readFileSync(stagedSw, 'utf8');
  const sm = ssw.match(/const\s+CACHE\s*=\s*'([^']+)'/);
  check('staged sw CACHE', sm && sm[1] === expectSw, sm && sm[1]);
}
process.exit(fail);
NODE
RC=$?
set -e
# also run the playwright coherence test for belt-and-suspenders
set +e
npx playwright test tests/version-coherence.spec.js --retries=0 >"$LOGS/09-version-coherence-pw.log" 2>&1
RC_PW=$?
set -e

if [[ "$RC" -eq 0 && "$RC_PW" -eq 0 ]]; then
  record "version coherence (${EXPECT_VER} / ${EXPECT_SW})" "PASS" "files + staged + pw"
else
  record "version coherence (${EXPECT_VER} / ${EXPECT_SW})" "FAIL" "node_rc=$RC pw_rc=$RC_PW"
fi

# ── Summary table ────────────────────────────────────────────────────────────
FAIL_COUNT=0
{
  echo "# VaultCap release checks — ${EXPECT_VER}"
  echo
  echo "Date: $(date -u +%Y-%m-%dT%H:%MZ)"
  echo "Port: ${PORT}  Staged: ${SITE}"
  echo
  echo "| Step | Result | Detail |"
  echo "|---|---|---|"
  for i in "${!STEPS[@]}"; do
    echo "| ${STEPS[$i]} | ${STATUSES[$i]} | ${DETAILS[$i]} |"
    if [[ "${STATUSES[$i]}" == "FAIL" ]]; then
      FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
  done
  echo
  if [[ "$FAIL_COUNT" -eq 0 ]]; then
    echo "**Overall: PASS**"
  else
    echo "**Overall: FAIL** (${FAIL_COUNT} step(s))"
  fi
} | tee "$SUMMARY"

echo
echo "=== SUMMARY ==="
printf '%-52s %-6s %s\n' "STEP" "RESULT" "DETAIL"
printf '%-52s %-6s %s\n' "----" "------" "------"
for i in "${!STEPS[@]}"; do
  printf '%-52s %-6s %s\n' "${STEPS[$i]}" "${STATUSES[$i]}" "${DETAILS[$i]}"
done
echo
if [[ "$FAIL_COUNT" -eq 0 ]]; then
  echo "OVERALL PASS"
  exit 0
fi
echo "OVERALL FAIL ($FAIL_COUNT)"
exit 1
