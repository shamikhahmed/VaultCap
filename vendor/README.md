# VaultCap vendor scripts (same-origin; CSP script-src 'self')

| File | Package | Version | Source | SHA-256 |
|------|---------|---------|--------|---------|
| `xlsx.full.min.js` | SheetJS Community | 0.20.3 | https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js | `cc015130aa8521e7f088f88898eba949ccdcbfb38df0bd129b44b7273c3a6f41` |
| `mammoth.browser.min.js` | mammoth | 1.8.0 | jsDelivr (vendored once) | `deb07bf230d1cb3e190bc5adc6743f35c6531b6571d1e5469b24f452a7f0f4ab` |
| `jsQR.min.js` | jsQR | 1.4.0 | jsDelivr (vendored once) | `32214c74ee92d37de6d88276987690d996ce757668e82ca1709dba5e0be9fcce` |
| `qrcode.min.js` | qrcodejs | 1.0.0 | cdnjs (vendored once) | `c541ef06327885a8415bca8df6071e14189b4855336def4f36db54bde8484f36` |
| `tesseract.min.js` | tesseract.js | (existing) | already local | — |

Loaded only via `VaultLazy` / `loadLocal` — never from CDN at runtime (VLT-P0-01).
Untrusted file parsing should move into a Web Worker (follow-up).
