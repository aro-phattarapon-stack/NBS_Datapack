---
name: NBs SMP Dashboard
description: Modern minimalist Soft Charcoal live scoreboard, Flash Quest tracker, and RCON admin console for Minecraft NBs SMP.
colors:
  bg-canvas: "#14171C"
  bg-surface: "#1B1F26"
  bg-elevated: "#232832"
  border-hairline: "#2C323E"
  border-strong: "#3D4657"
  text-primary: "#F3F5F8"
  text-secondary: "#A6B0C0"
  text-muted: "#8B95A6"
  accent-primary: "#34D399"
  accent-primary-ink: "#0B1310"
  accent-amber: "#FBBF24"
  accent-danger: "#F87171"
typography:
  display:
    fontFamily: "'IBM Plex Sans', 'IBM Plex Sans Thai', system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'IBM Plex Sans', 'IBM Plex Sans Thai', system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title:
    fontFamily: "'IBM Plex Sans', 'IBM Plex Sans Thai', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "'IBM Plex Sans', 'IBM Plex Sans Thai', system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "'IBM Plex Sans', 'IBM Plex Sans Thai', system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "0.02em"
  numeric:
    fontFamily: "'IBM Plex Sans', 'IBM Plex Sans Thai', system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.1
    fontFeature: "tnum"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent-primary}"
    textColor: "{colors.accent-primary-ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "{colors.bg-elevated}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  button-danger:
    backgroundColor: "{colors.bg-elevated}"
    textColor: "{colors.accent-danger}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  section-surface:
    backgroundColor: "{colors.bg-surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "20px 24px"
  score-bar-track:
    backgroundColor: "{colors.bg-elevated}"
    rounded: "{rounded.sm}"
    height: "10px"
---

# Design System: NBs SMP Dashboard

## Overview

**Creative North Star: "The Quiet Command Ledger"**

NBs SMP Dashboard is an operational live scoreboard and server control surface built for players who glance between Minecraft and a browser, and admins who issue RCON commands under live-event pressure. The visual language rejects heavy gaming neon, stacked glowing cards, and decorative clutter in favor of a **Modern Minimalist** ledger: calm Soft Charcoal surfaces, generous whitespace, and crisp `1px` hairline dividers that let scores, countdowns, and quest objectives carry the screen.

Every visual choice serves scannability and endurance. Instead of boxing every metric inside nested cards with drop-shadows, related content lives on a single clean plane separated by horizontal or vertical hairlines. Color is reserved strictly for status signals and team identification—and even then, every team indicator pairs hue with explicit text labels, rank numbers, and clear numeric values so no information depends on color perception alone.

**Key Characteristics:**
- **Soft Charcoal Dark Mode (`#14171C`):** Deep slate-charcoal canvas that avoids harsh pure `#000000` black and reduces eye strain during long play sessions.
- **1px Hairline Architecture:** Sections and list rows divide cleanly with `1px solid #2C323E` hairlines rather than nested cards-inside-cards.
- **AAA Numerical Clarity:** Primary scores, diamond counts, and Flash Quest countdowns render in high-contrast `#F3F5F8` (`> 15:1`) with `tabular-nums` alignment.
- **Color-Blind-Safe Scoreboard:** Team bars combine team color, rank/symbol badge, Thai team name, and right-aligned tabular figures.

## Colors

A restrained dark neutral foundation paired with functional emerald, amber, and coral accents.

### Primary
- **Emerald Signal** (`#34D399`): Used exclusively for active live indicators (`SSE Connected`), primary admin commit actions (e.g., launching a quest, starting the match), and positive state confirmations. Pair with `#0B1310` dark ink on filled buttons (`10.8:1` contrast).

### Secondary
- **Solar Amber** (`#FBBF24`): Reserved for `Raid Day` active warnings, timer urgency (`< 120s` remaining on Flash Quest), and attention badges.

### Tertiary
- **Coral Alert** (`#F87171`): Reserved for destructive or stop actions (ending a match, resetting state, failed RCON validation) and error states.

### Neutral
- **Canvas Charcoal** (`#14171C`): Root application background.
- **Surface Slate** (`#1B1F26`): Primary panel background for major workspace sections.
- **Elevated Slate** (`#232832`): Progress bar tracks, input backgrounds, secondary button fills, and subtle row hover highlights.
- **Hairline Divider** (`#2C323E`): Standard `1px` structural border separating sections, table rows, and header bars.
- **Strong Border** (`#3D4657`): Input focus/resting borders and interactive button outlines.
- **Ink Primary** (`#F3F5F8`): Main headings, team names, and all primary scores/timers (`16.4:1` on `#14171C`, `15.1:1` on `#1B1F26` — exceeds WCAG AAA `7:1`).
- **Ink Secondary** (`#A6B0C0`): Supporting descriptions, item sub-labels, and secondary metadata (`8.19:1` on `#14171C`, `7.55:1` on `#1B1F26` — exceeds WCAG AAA `7:1`).
- **Ink Muted** (`#8B95A6`): Column headers, timestamps, and unit suffixes (`5.94:1` on `#14171C`, `5.48:1` on `#1B1F26` — exceeds WCAG AA `4.5:1`).

### Named Rules
- **The WCAG Floor Rule.** Body copy and metadata must maintain at least `4.5:1` contrast (never use text darker than `#8B95A6` on `#1B1F26`). All live scores, diamond counts, and countdown timers must use `#F3F5F8` (`>= 7:1`).
- **The Restrained Accent Rule.** Emerald `#34D399` and Amber `#FBBF24` occupy under `10%` of the viewport; never tint whole panel backgrounds with saturated team colors.

## Typography

**Display & UI Font:** `'IBM Plex Sans', 'IBM Plex Sans Thai', system-ui, sans-serif`  
**Numeric Treatment:** `font-variant-numeric: tabular-nums` (`tabular-nums` in Tailwind)

**Character:** Clean technical sans-serif paired with legible Thai glyphs (`IBM Plex Sans Thai`) so bilingual strings (Thai labels + English Minecraft block names) align at uniform x-height without visual jitter.

### Hierarchy
- **Display** (`700`, `2rem` / `32px`, `line-height: 1.15`, `letter-spacing: -0.02em`): Hero countdown clock and top-level match status readouts.
- **Headline** (`600`, `1.25rem` / `20px`, `line-height: 1.3`, `letter-spacing: -0.01em`): Major section titles (e.g., Scoreboard, Active Flash Quest, Admin Controls).
- **Title** (`600`, `1rem` / `16px`, `line-height: 1.4`): Team row names and quest item titles.
- **Body** (`400`, `0.9375rem` / `15px`, `line-height: 1.55`): Quest reasoning, audit descriptions, and form helper copy (`65ch` max measure for prose).
- **Label** (`500`, `0.75rem` / `12px`, `line-height: 1.35`, `letter-spacing: 0.02em`): Table column headers, status pills, and source tags (`AI`, `POOL`, `MANUAL`).
- **Numeric** (`700`, `1.5rem` / `24px`, `line-height: 1.1`, `tabular-nums`): Team scores, diamond totals, and timer readouts.

### Named Rules
- **The Tabular Figures Rule.** Every score, diamond count, rank index, countdown timer (`MM:SS`), and timestamp must apply `font-variant-numeric: tabular-nums` so real-time SSE ticks never cause horizontal layout shift.

## Layout

Single-container centered layout (`max-width: 1200px`, `padding: 24px 32px` on desktop, `16px` on mobile) structured around a clean header strip followed by asymmetric workspace columns (`7/5` or `2/1` split on `lg:` for Scoreboard + Flash Quest, stacking cleanly to single column on smaller viewports).

- **Whitespace & Rhythm:** Maintain at least `24px` (`spacing.lg`) between distinct functional regions and `16px` (`spacing.md`) internal row padding.
- **Hairline Separation Over Card Nesting:** Avoid wrapping a card inside another card. Use a single `#1B1F26` container per major region and separate rows inside it with `1px solid #2C323E` horizontal dividers (`divide-y divide-[#2C323E]`).

## Elevation & Depth

**Flat-by-Default Rule.** This system uses **no drop-shadows at rest**. Depth is communicated strictly through subtle tonal stepping (`#14171C` canvas → `#1B1F26` section surface → `#232832` interactive controls/tracks) and crisp `1px` borders (`#2C323E`). Focus states rely on a clean `2px` outline ring (`#34D399` with `2px` offset) rather than blurred glow shadows.

## Shapes

Restrained, precise geometry:
- **Section Containers:** `8px` (`rounded.lg`) with `1px solid #2C323E`.
- **Buttons, Inputs, Badges:** `6px` (`rounded.md`) for tactile control alignment.
- **Progress Bars & Score Tracks:** `4px` (`rounded.sm`) clean linear bars without pill-bubble distortion.

## Components

### Architecture (`shadcn/ui` + `React Bits`)
- **Foundational Primitives (`shadcn/ui`):** Use `shadcn/ui` (`web/components.json`, `src/components/ui/*`, `cn()` utility) for interactive primitives (`Button`, `Badge`, `Input`, `Select`, `Progress`, `Table`) instead of re-inventing unstyled controls.
- **Purposeful Micro-Interactions (`React Bits`):** Apply `React Bits` selectively for subtle, GPU-composited numerical feedback (e.g., `CountUp` animated score/diamond readouts) while respecting `prefers-reduced-motion` and never cluttering the minimalist layout.

### Buttons
- **Shape:** `6px` radius (`rounded.md`), `font-weight: 500`, `font-size: 0.875rem`.
- **Primary:** `#34D399` background, `#0B1310` text, `8px 16px` padding; darkens slightly on hover with `150ms` transition.
- **Secondary / Ghost:** `#232832` fill with `1px solid #3D4657` border and `#F3F5F8` text (`8px 14px` padding).
- **Danger:** `#232832` fill with `1px solid #3D4657` border and `#F87171` text; transitions to subtle `#F87171/15` tint on hover.

### Hairline Ledger Rows (Replacing Nested Cards)
- **Structure:** Full-width horizontal rows inside a `#1B1F26` region separated by `1px solid #2C323E` (`border-b` on all except last item).
- **Padding:** `14px 20px` per row; subtle `#232832/60` background shift on hover only when interactive.

### Color-Blind-Safe Team Score Bars
- **No Color-Only Encoding:** Every team entry must display:
  1. **Rank & Shape/Prefix Badge:** Explicit rank (`#1`, `#2`, ...) plus a crisp geometric swatch or team symbol alongside the team's Thai label (e.g., `แดง`, `น้ำเงิน`, `เขียว`) — never rely on bar color alone.
  2. **Linear Progress Bar:** `10px` height (`rounded.sm`) over `#232832` track with the team's accent fill (and clear `1px` contrast edge for light colors like `white` `#F1F5F9`).
  3. **Right-Aligned Tabular Figures:** Score and diamond count rendered in `#F3F5F8` (`tabular-nums`) with explicit unit labels (`pts`, `💎` or `Diamonds`).

### Inputs / Fields
- **Style:** `#232832` background, `1px solid #3D4657` border, `6px` radius, `#F3F5F8` text, `#8B95A6` placeholder.
- **Focus:** Border shifts to `#34D399` with a `2px` solid `#34D399` focus ring (`outline-offset: 2px`).

### Flash Quest Strip
- **Display:** Single clean header band or dedicated panel showing item icon/name, required count (`tabular-nums`), source tag (`AI` / `POOL` / `MANUAL`), and `MM:SS` countdown (`2rem`, `tabular-nums`, `#F3F5F8` shifting to `#FBBF24` under `120s`).

## Do's and Don'ts

### Do:
- **Do** use `1px solid #2C323E` hairline dividers and `24px` whitespace gaps to separate dashboard sections instead of stacking shadowed cards.
- **Do** enforce `tabular-nums` on every score, diamond total, countdown timer, and timestamp.
- **Do** pair every team color bar with an explicit rank number, text label, and numeric value for color-blind accessibility.
- **Do** keep body text at `#F3F5F8` / `#A6B0C0` / `#8B95A6` (`>= 4.5:1`) and critical numbers at `#F3F5F8` (`>= 7:1`) on `#14171C`–`#1B1F26`.

### Don't:
- **Don't** use pure `#000000` backgrounds or neon glowing `box-shadow` effects.
- **Don't** nest bordered cards inside other bordered cards (`card-in-card` clutter).
- **Don't** encode team identity or quest difficulty using color alone without text or symbol labels.
- **Don't** allow live SSE updates to shift column widths by omitting `tabular-nums`.
