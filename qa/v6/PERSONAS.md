# VaultCap — persona scenarios (simulated usability)

Not human research. Personas exercise real product paths. Sample vault only (`?demo=1` / Explore sample). Never real credentials.

## Personas (VaultCap-relevant)

| ID | Persona | Why it matters here |
|---|---|---|
| A | First-time | Welcome → create vault vs sample; shortest path to value |
| B | Returning | Lock → unlock → dashboard; remembered theme/prefs |
| C | Power | Many banks/cards, search/filter, export, More tools |
| D | Infrequent | Labels, Help, Recovery Center discoverability |
| E | Accessibility | Dynamic Type XL, reduce motion, keyboard/focus |
| F | Small-screen | SE / 320–375; keyboard vs primary actions |
| G | Large-screen | iPad sidebar, MacBook ≥1280 content measure |
| H | Offline / flaky net | Rates/AI off; offline Smart Parser; honest errors |
| I | Impatient / error-prone | Double-tap, cancel mid-form, destructive confirms |
| J | Privacy-conscious | App-switcher cover, clipboard expiry, privacy sheet truth |

## Scenarios (≥5)

### S1 — First useful outcome (A, F)
1. Open welcome (cold).  
2. Tap Explore a sample vault.  
3. Use sample PIN → Start exploring.  
4. Land on dashboard with healthy sample net worth (no crash %, no “N issues”).  
**Pass:** ≤4 intentional taps to useful dashboard; PIN never printed.  
**Evidence:** e2e smoke + simulator video (planned).

### S2 — Add a bank and find it (B, C, I)
1. Unlocked sample → Banks → Add.  
2. ComboPicker bank name; leave country alone while typing partial.  
3. Save; list shows bank; edit opens populated.  
4. Rapid double Save does not duplicate.  
**Pass:** forms-coverage + bank edit tests; no country flip (FIXED #14).

### S3 — Privacy & network honesty (J, H)
1. Settings → Privacy: rates off; AI/logo hidden or off.  
2. With rates off, no workers.dev / rate hosts on click-through.  
3. Open in-app Privacy Policy; destinations match CSP.  
**Pass:** `network-default-off.spec.js`; privacy claim gate in APP-STORE.md.

### S4 — Backup path understanding (A, D, J)
1. Backup Center / Privacy export.  
2. Web: download/share affordance; Native: share sheet only after real save.  
3. Cancel does not mark “Backed up”.  
**Pass:** FIXED #1; simulator evidence for native.

### S5 — Lock, background, clipboard (J, B)
1. Unlock; copy a secret; wait past clipboard TTL; paste empty.  
2. Background → privacy cover / auto-lock per settings.  
**Pass:** FIXED #9–10; simulator `pbpaste` evidence.

### S6 — Large text + SE (E, F)
1. Accessibility Extra Large + 320/375.  
2. Dashboard greeting wraps; quick-add reflows; primary labels not truncated.  
**Pass:** dt.spec / FIXED #40–45; WebKit 320 docs row.

## Comparison notes (fill after runs)

| Scenario | Personas | Steps | Confusing? | Pass |
|---|---|---|---|---|
| S1 | A,F | ~4 | none observed in smoke | pass (automated) |
| S2 | B,C,I | forms suite | none | pass (automated) |
| S3 | J,H | network-default-off | none | pass (automated) |
| S4 | A,D,J | smoke export buttons | native share = sim | partial (web OK; native prior ✅) |
| S5 | J,B | — | — | blocked (sim this session) |
| S6 | E,F | FIXED #40–45 | — | partial (prior FIXED; XL re-shot pending) |
