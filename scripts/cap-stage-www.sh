#!/usr/bin/env bash
# Stage an allowlisted Capacitor webDir (www/). Capacitor rejects webDir="." .
# Native bundle = the app only: no marketing/web-only pages, no store screenshots.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
npm run build:js
export SW_FILE=sw-v51.js
# assets/ is staged per subfolder so assets/screenshots (~63 MB) stays out of the app.
export ALLOW_PATHS="index.html privacy.html sw-v51.js manifest.json VERSION.json css js assets/banks assets/fonts icons dist vendor apple-touch-icon.png favicon.svg mark.svg icon.svg icon-mark.svg icon-192.png icon-512.png icon-1024.png icon-maskable-192.png icon-maskable-512.png"
export FORBIDDEN_EXTRA="resources scripts worker docs memory ios assets/screenshots landing.html pitch.html presentation.html screen-gallery.html install.html widget.html changelog.html"
bash "$ROOT/scripts/stage-pages-site.sh" "$ROOT/www"
# stage-pages-site.sh forbids LICENSE (Pages artifact rule); the native app ships it for Settings → License.
cp -a "$ROOT/LICENSE" "$ROOT/www/LICENSE"
rm -f "$ROOT/www/.nojekyll"
echo "Staged Capacitor webDir → www/ ($(du -sh "$ROOT/www" | cut -f1))"
