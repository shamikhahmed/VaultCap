# VaultCap 6 — Design system

Sober, Apple HIG-aligned, ported from the ScentCap 3.0 system (`ScentCap/src/design/system.css`, `DESIGN.md`).
Content first; chrome stays quiet. VaultCap keeps its own accent: **vault gold**.

Source of truth:

| File | Role | Loading |
|---|---|---|
| `css/design/tokens.css` | Semantic tokens (light / dark / increased contrast) + legacy bridge | render-blocking, unlayered |
| `css/design/system.css` | `ui-*` primitives (ScentCap port) | `@layer components` via `css/app.css` |
| `css/design/vaultcap.css` | Reskin of 5.x shell + shared classes (`.btabs`, `.ni`, `.entry`, `.si`, `.modal`…) | `@layer components` |
| `css/app.css` | Cascade orchestrator: 5.x CSS demoted to `@layer legacy` | deferred (`media=print` → `all`, see `js/boot-cache.js`) |
| `js/core/ui-kit.js` | `UIKit` — vanilla HTML-string kit for string-rendered screens | app bundle |

## Principles

1. **Content first.** Numbers and names carry the screen; surfaces are grey/white (light) or black/graphite (dark).
2. **One accent.** Gold (`--tint`) marks the single primary action per screen, selection and links. Never decorative.
3. **System type.** SF (`--font-ui`) at 17pt body; SF Rounded (`--font-rounded`) only for hero amounts. Tabular figures for money.
4. **Native patterns.** Large titles on top-level screens, inset-grouped lists for settings and records, segmented controls,
   sheets with grabber + Cancel / Title / Done, floating glass tab bar (phone) / glass sidebar (≥700px).
5. **Accessible by default.** 44pt targets, AA contrast in light / dark / increased contrast, reduced motion + transparency honoured,
   colour never the only signal, every icon button has `aria-label`.

## Accent

| Appearance | `--tint` | Contrast |
|---|---|---|
| Dark (default) | `#d4a017` brand gold, `--on-tint: #000` | 7.2:1 on `#1c1c1e`; 8.8:1 black on gold |
| Light | `#8b6508` deep gold, `--on-tint: #fff` | 5.3:1 on white, 4.75:1 on `#f2f2f7` |
| Increased contrast | `#6e5005` light / `#e8c84a` dark | — |

## Tokens

Same names as ScentCap: `--bg`, `--surface(-2|-elevated)`, `--fill(-2)`, `--separator`, `--label(-2|-3|-4)`,
`--tint(-hover|-soft)`, `--on-tint`, `--success/--warning/--danger`, `--t-large … --t-caption2`, `--r-sm/md/lg/xl`,
`--shadow-1/2/3`, `--ease`, `--hit`, `--gutter`, `--tabbar-h`. The glass material is `--glass-material`
(`--glass` is a legacy name, bridged to `--surface`).

**Do not** use hex values or legacy tokens (`--text*`, `--accent`, `--glass*`, `--lx-*`, `--cap-*`, `--vault-panel-*`) in new code.
They are bridged in `tokens.css` so 5.x screens inherit the palette, and will be removed once every screen is on the kit.

## Primitives (`ui-*`)

Identical to ScentCap minus the bottle-specific classes (`ui-plinth`, `ui-bottle*`, `ui-grid`, `ui-tabbar`, `ui-sidebar`):
`ui-page`, `ui-header`, `ui-eyebrow`, `ui-largetitle`, `ui-section(-head|-title|-link)`, `ui-card(--lg)`, `ui-list`,
`ui-row(--media|--icon)`, `ui-row__main/__title/__sub/__value/__icon`, `ui-chevron`, `ui-list-header/-footer`,
`ui-btn` + `--primary/--secondary/--gray/--plain/--danger/--sm/--block`, `ui-icon-btn(--tint)`, `ui-chip`, `ui-tag(--tint)`,
`ui-segmented`, `ui-search`, `ui-field(--left)`, `ui-switch`, `ui-widgets`, `ui-widget(__label|__value|__unit)`, `ui-meter`,
`ui-scroller`, `ui-skeleton`, `ui-rise`, `ui-sheet*`, plus `.num` (tabular figures).

## Kit (`UIKit`, js/core/ui-kit.js)

- `UIKit.header({eyebrow, title, subtitle, trailing})`
- `UIKit.section({title, id, action: {label, act}}, body)`
- `UIKit.list(rows, {header, footer, label})`
- `UIKit.row({icon, title, sub, value, act, chevron, aria})` — `<button>` when `act` is set
- `UIKit.widget({icon, label, value, unit, sub, act, sens})` — `sens` keeps privacy-mode blur
- `UIKit.meter(pct, color)`, `UIKit.segmented(items, current, actFor, label)`

All helpers return trusted HTML; escape user data with `UIKit.esc()`. `act` strings go through the CSP-safe `data-act` delegate.

## Shell

- Phone (<700px): floating glass tab bar — Home · Money · Wealth · Identity · More. Tabs navigate or open hub sheets; no FAB.
  "Add" lives in page headers (`+ Add`, dashboard `+` opens the Add menu).
- ≥700px: glass sidebar with grouped modules; selected row is a gold capsule.
- Sheets (`Modal.open`): grabber on phone, centred card on iPad/desktop. `Modal._sheetBar()` promotes the footer's
  Cancel to the leading slot and a single primary to the trailing slot; anything else (Delete…) stays in the footer.

## Copy

Plain, warm, short. Sentence case. No exclamation marks. Fictional data is always labelled ("Sample · Fictional data only").

**Pull-to-refresh: deliberately removed (owner decision, 2026-10-25).** VaultCap is local-first — there is
nothing to fetch on a pull, and pull-to-refresh firing on ordinary downward swipes made the app feel like it
"refreshed" itself. Do not reintroduce it. Guarded by `tests/code-review-hig.spec.js` (swipe test).
