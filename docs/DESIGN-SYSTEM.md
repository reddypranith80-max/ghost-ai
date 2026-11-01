# Ghost AI design system: Ink & Signal

Dark-only. Depth comes from tonal surface steps and soft shadows, not borders. Tokens live in `src/app/globals.css`; utilities in `src/app/ghost-kit.css`.

## Colour tokens
| Token | Value | Use |
|---|---|---|
| `--ink` | #0a0b0d | page canvas |
| `--surface-1/2/3` | #101216 / #15181d / #1b1f25 | cards, raised, controls |
| `--hairline` / `--hairline-strong` | white 7% / 12% | the only borders, only where needed |
| `--text` / `--text-muted` / `--text-faint` | #eceef2 / #9aa1ad / #6b7280 | copy |
| `--mint` (+ `--mint-ink`) | #3ee6a0 | primary action, success |
| `--amber` | #ffb454 | running, in progress, highlight |
| `--blue` | #7b8cff | links, info |
| `--coral` | #ff7a6b | danger, failed |
| `--*-tint` | accent at 12% | chip and badge fills |
| `--agent-cyan/violet/emerald/amber/rose/sky/fuchsia/lime` | tuned hues | the 8 agents |

Legacy aliases: `--gh-cyan` = mint, `--gh-violet` = blue, `--gh-line` = hairline, `--gh-text-dim` = muted, `--gh-void` = ink.

## Radii, shadows, spacing
- Radius: cards and panels 16px (`--r-card`), controls 10-12px (`--r-control`), pills full.
- Shadows: `--shadow-1` (resting), `--shadow-2` (hover/raised), `--shadow-mint` (primary glow), `--inner-top` (1px top highlight).
- Spacing: 4px base; section rhythm via `.section` (64-112px); page gutter 24px; container 1160px.

## Type
Display Bricolage Grotesque (600-700, tracking -0.03em), body Instrument Sans, mono Geist Mono (hashes and code only). Scale: 12 / 14 / 16 / 18 / 24 / 32 / 48 / 64. Headings use `.h-display` or the h1-h4 defaults.

## Utilities
`.container-page .section .section-tight .divider-soft` layout; `.surface .surface-raised .surface-inset .card-lift` surfaces; `.eyebrow .h-display .text-balance .kbd` type; `.chip .chip-mint .chip-amber .chip-blue .chip-coral`; `.btn .btn-primary .btn-secondary .btn-ghost .btn-outline .btn-sm .btn-lg`; `.bg-atmosphere .bg-dots .bg-noise .fade-mask-b`; `.reveal .reveal-1 ... .reveal-8`.

Legacy `gh-*` classes still work but are restyled (bevel is a rounded surface, hud is a quiet 12px label, rivet/ticks/scanlines/corners/scanbar render nothing, glow is a soft shadow). Prefer the new names in new code.

## Motion
150-200ms ease-out `cubic-bezier(.2,.7,.2,1)`. One page-load `rise` (opacity + 8px) staggered with `.reveal-N` (80ms steps). Cards lift -2px; buttons press to scale .98. `prefers-reduced-motion` disables all animation, and content is visible without JS.

## Do / don't
- Do separate regions with tone and spacing. Don't add borders or glow outlines.
- Do use mint for the single primary action per view. Don't use gradients on buttons.
- Do keep labels in normal case. Don't use all-caps tracked HUD labels, bevels, scanlines or rivets.
- Do use mono only for code and hashes.
