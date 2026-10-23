# Design Brief

## Direction

Signal Blue — a calm, high-trust campus Lost & Found system where crisp white surfaces, deep navy ink, and one vibrant blue do all the work.

## Tone

Refined minimalism executed with conviction: Linear/Stripe-grade restraint, generous whitespace, and precise alignment — nothing decorative for its own sake.

## Differentiation

A single confident blue is the entire brand language — it marks every action, match, and status, so the interface reads as a trustworthy instrument rather than a generic dashboard.

## Color Palette

| Token      | OKLCH         | Role                                        |
| ---------- | ------------- | ------------------------------------------- |
| background | 0.985 0.004 255 | Cool off-white app canvas                 |
| foreground | 0.21 0.045 262  | Deep navy ink for all typography          |
| card       | 1 0 0           | Pure white elevated surfaces              |
| primary    | 0.52 0.215 262  | Vibrant signal blue — CTAs, links, focus  |
| accent     | 0.62 0.19 258   | Brighter blue for highlights & active nav |
| muted      | 0.965 0.012 255 | Quiet fills, chips, disabled surfaces     |
| border     | 0.92 0.008 255  | 1px cool-gray hairline separators         |
| success    | 0.58 0.15 158   | Returned / approved / high confidence     |
| warning    | 0.72 0.16 78    | Lost / pending attention                  |
| destructive| 0.56 0.215 27   | Rejected / disputed / low confidence      |

## Typography

- Display: Space Grotesk — headings, wordmark, hero, card titles (bold, tracking-tight)
- Body: DM Sans — paragraphs, labels, form fields, metadata
- Mono: JetBrains Mono — confidence scores, IDs, timestamps
- Scale: hero `text-5xl md:text-7xl font-bold tracking-tight`, h2 `text-3xl md:text-4xl font-bold tracking-tight`, label `text-xs font-semibold tracking-widest uppercase`, body `text-base md:text-lg`

## Elevation & Depth

Three-tier surface hierarchy: canvas (`background`) → white cards (`card`) → floating overlays (`popover`); depth via hairline borders plus layered soft shadows (`shadow-subtle`, `shadow-elevated`, `shadow-floating`), never heavy drop shadows.

## Structural Zones

| Zone    | Background        | Border     | Notes                                                        |
| ------- | ----------------- | ---------- | ------------------------------------------------------------ |
| Header  | `card` white      | `border-b` | Sticky, subtle blur, logo left, primary CTA + theme toggle right |
| Content | `background`      | —          | Alternating `muted/30` bands between sections; card grids    |
| Footer  | `muted/40`        | `border-t` | Quiet, small type, brand mark + minimal links                |

## Spacing & Rhythm

Sections separated by `py-16 md:py-24`; content grouped in `gap-6` grids inside `max-w-7xl` containers; micro-spacing on a strict 4px scale with `p-6` card padding.

## Component Patterns

- Buttons: `rounded-lg`, primary = gradient blue with `shadow-elevated`, hover lifts + deepens; secondary = white with hairline border; radius varies by role (pills for filters/badges)
- Cards: `rounded-xl` white, `border` hairline, `shadow-subtle` at rest → `shadow-elevated` + `-translate-y-0.5` on hover
- Badges: full-radius pills, tinted background + darker same-hue text (lost=amber, found=blue, returned=green, pending=gray, approved=green, rejected=red, disputed=orange)
- Confidence indicator: circular ring or horizontal bar colored by ramp — low red, mid amber, high green — with mono percentage label

## Motion

- Entrance: `fade-in-up` 0.4s staggered across card grids; `scale-in` 0.2s for popovers/dialogs
- Hover: `transition-smooth` 0.3s on lift, border tint, and shadow; `transition-fast` 0.15s on color/opacity
- Decorative: `pulse-ring` on live match indicators; `shimmer` on skeletons; all disabled under `prefers-reduced-motion`

## Constraints

- Tokens only — no raw hex/rgb, no arbitrary color classes, no inline color styles
- One accent hue family; gradients reserved for primary CTA and hero wash only
- Mobile-first; every interactive element keyboard-reachable with a visible focus ring
- AA+ contrast in both light and dark mode; dark mode tuned intentionally, not inverted

## Signature Detail

The confidence-score ring — a thin animated blue arc with a mono percentage at its center — turns abstract matching into a single glanceable, trustworthy signal.
