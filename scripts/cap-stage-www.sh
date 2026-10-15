#!/usr/bin/env bash
# Stage an allowlisted Capacitor webDir (www/). Capacitor rejects webDir="." .
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
npm run build:js
export SW_FILE=sw-v51.js
export ALLOW_PATHS="index.html landing.html pitch.html presentation.html privacy.html changelog.html screen-gallery.html install.html widget.html sw-v51.js manifest.json VERSION.json css js assets icons dist vendor apple-touch-icon.png favicon.svg mark.svg icon.svg icon-mark.svg icon-192.png icon-512.png icon-1024.png icon-maskable-192.png icon-maskable-512.png"
export FORBIDDEN_EXTRA="resources scripts worker docs memory ios"
bash "$ROOT/scripts/stage-pages-site.sh" "$ROOT/www"
echo "Staged Capacitor webDir → www/"
