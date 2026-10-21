# VaultCap — motion audit (Experience Lab)

**Personality:** discreet, precise, reassuring — midnight/gold brand; no bounce theater.

## Existing (keep)

| Token / rule | Where | Notes |
|---|---|---|
| `--lx-spring: cubic-bezier(0.22, 1, 0.36, 1)` | `css/luxe.css` | Single spring for press/sheet |
| Button/key press scale | luxe `.btn` / `.key` | 0.18s — does not delay submit |
| `prefers-reduced-motion: reduce` | luxe + base + components + identity + themes + capricorn-core | Transitions/animations off |
| `body.reduce-motion` | luxe | In-app Accessibility toggle |

## Gaps / planned refinements (after visual pass)

| Item | Priority | Status |
|---|---|---|
| Page enter: one short fade (not per-widget) | Med | pending — only if CLS stays &lt; 0.05 |
| Sheet present: translateY + fade, reduced-motion = instant | Med | pending |
| Toast enter — confirm no stack on rapid errors | High | pending Persona I |
| Chart/net-worth number change — tabular, no count-up spam | Low | n/a if no count-up today |
| Launch screen → app — native LaunchMark already covers cold start | Done | native |

## Do not add

Parallax, continuous background motion, particles, multi-element bounce, animation that blocks primary actions.
