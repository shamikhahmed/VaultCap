# VaultCap screen gallery

**Status (2026-11-26):** full `npm run gallery` PASS (~6.2m) after world catalogs v112 + Cap motion token map — **89 screens** embedded into `screen-gallery.html`. Curated `docs/screenshots/gallery/` webp set may still show older captions until a separate curated pass.

## Commands

```bash
npm run build:js
npm run gallery          # ~10 min historically (89 screens × themes/viewports + embed)
npm run gallery:embed    # re-embed only (no capture)
npm run gallery:view     # http://127.0.0.1:8765/screen-gallery.html
```

Requires Playwright browsers. Set `CAPTURE_SCREENSHOTS=1` (the `gallery` script does this).

## Outputs

| Path | Role |
|------|------|
| `assets/screenshots/` | Theme/viewport PNG tree used by the app gallery |
| `docs/screenshots/gallery/` | Curated webp gallery + `gallery-manifest.json` |
| `screen-gallery.html` | Offline viewer (manifest embedded) |

## Stories

Example day-in-the-life personas (Ayesha / Omar / Margaret) live under Capricorn Lab:

`../capricorn-lab/content/stories/vaultcap/`

Hub: https://shamikhahmed.github.io/apps/vaultcap/  
Recapture is a lab `capture-story.mjs` pass — not part of `npm run gallery`.

## Notes

- No pin-scrub / ScrollTrigger in product UI — splash + Halo + `js/motion.js` only, Cap `--cap-dur-*` tokens, `prefers-reduced-motion` respected.
- World catalog JSON is precached by SW (`assets/data/world-*.min.json`); gallery shots should show catalog-backed pickers when those screens are captured.
