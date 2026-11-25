# VaultCap screen gallery

**Status (2026-11-26):** Wave 1 **real** gallery regen PASS — `npm run build:js` + `npm run gallery` finished **2026-11-26 00:56:57 PKT** (manifest `generatedAt` `2026-11-25T19:50:18.688Z`, duration **~6.7m / 401s**, 1 worker). **89 screens** embedded into `screen-gallery.html`; **786** theme×viewport PNGs under `assets/screenshots/{dark,light}/` (mtimes post-motion). Curated `docs/screenshots/gallery/` webp set is older (Oct) — hub OS sync uses Cap gallery paths; story recapture is Wave 1b.

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
Recapture is Playwright (not Blender) via Capricorn tooling — **Wave 1b**, not part of `npm run gallery`:

```bash
# from Cap-Apps/
node capricorn-tooling/scripts/capture-story.mjs vaultcap vaultcap-ayesha
node capricorn-tooling/scripts/capture-story.mjs vaultcap vaultcap-omar
node capricorn-tooling/scripts/capture-story.mjs vaultcap vaultcap-margaret
# then hub:
cd capricorn-lab && npm run build:minisites   # or node scripts/build-minisites.mjs
node scripts/sync-screenshots.mjs             # OS window thumbs from Cap galleries
```

## Notes

- No pin-scrub / ScrollTrigger in product UI — splash + Halo + `js/motion.js` only, Cap `--cap-dur-*` tokens, `prefers-reduced-motion` respected.
- World catalog JSON is precached by SW (`assets/data/world-*.min.json`); gallery shots should show catalog-backed pickers when those screens are captured.
