---
name: Cinematic Noir
colors:
  surface: "#0e0e10"
  surface-dim: "#131315"
  surface-bright: "#39393b"
  surface-container-lowest: "#0e0e10"
  surface-container-low: "#1c1b1d"
  surface-container: "#201f22"
  surface-container-high: "#2a2a2c"
  surface-container-highest: "#353437"
  on-surface: "#e5e1e4"
  on-surface-variant: "#cbc3d7"
  inverse-surface: "#e5e1e4"
  inverse-on-surface: "#313032"
  outline: "#958ea0"
  outline-variant: "#494454"
  surface-tint: "#d0bcff"
  primary: "#d0bcff"
  on-primary: "#3c0091"
  primary-container: "#a078ff"
  on-primary-container: "#340080"
  inverse-primary: "#6d3bd7"
  secondary: "#4cd7f6"
  on-secondary: "#003640"
  secondary-container: "#03b5d3"
  on-secondary-container: "#00424e"
  tertiary: "#ffb95f"
  on-tertiary: "#472a00"
  tertiary-container: "#ca8100"
  on-tertiary-container: "#3e2400"
  error: "#ffb4ab"
  on-error: "#690005"
  error-container: "#93000a"
  on-error-container: "#ffdad6"
  primary-fixed: "#e9ddff"
  primary-fixed-dim: "#d0bcff"
  on-primary-fixed: "#23005c"
  on-primary-fixed-variant: "#5516be"
  secondary-fixed: "#acedff"
  secondary-fixed-dim: "#4cd7f6"
  on-secondary-fixed: "#001f26"
  on-secondary-fixed-variant: "#004e5c"
  tertiary-fixed: "#ffddb8"
  tertiary-fixed-dim: "#ffb95f"
  on-tertiary-fixed: "#2a1700"
  on-tertiary-fixed-variant: "#653e00"
  background: "#0e0e10"
  on-background: "#e5e1e4"
  surface-variant: "#353437"
  card: "#1c1b1d"
  border: "rgba(229,225,228,0.08)"
  input-border: "rgba(229,225,228,0.14)"
  ring: "#d0bcff"
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: "700"
    lineHeight: 56px
    letterSpacing: -0.04em
  display-lg-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: "700"
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: "600"
    lineHeight: 32px
    letterSpacing: -0.01em
  body-base:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
    letterSpacing: 0em
  label-caps:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: "600"
    lineHeight: 16px
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

# ReelFind — Cinematic Noir

> Source of truth for tokens is `app/globals.css` (CSS variables, mirrored into Tailwind v4 via `@theme inline`). This file documents the intent and how the tokens are used; if the two disagree, the CSS wins — update this file.

## Brand & Style

A premium, immersive movie-discovery experience in a **Cinematic Dark** style: high-end minimalism with modern-tech cues. The interface recedes so posters and backdrops take centre stage, while UI elements feel like precision tools. Subtle backdrop blur, deep overlays and electric accents signal intelligence (the app is AI-powered). Audience: cinephiles and tech-forward users who value speed and curation.

The theme is **dark-only**: `:root` and `.dark` carry identical values, and `ThemeProvider` (class strategy) exists only for shadcn/ui compatibility. There is no light palette; do not add `dark:`-only colours that would diverge from `:root`.

## Colors

Near-black foundation to remove visual noise and maximise the glow of imagery. Tokens follow Material-3 naming (`surface-*`, `on-*`, `*-container`) with shadcn aliases (`card`, `muted`, `border`, `ring`…) pointing at them.

| Role | Token | Hex | Use |
| --- | --- | --- | --- |
| Primary (Electric Violet) | `primary` | `#d0bcff` | High-intent actions, active nav, AI features, focus ring |
| | `primary-container` | `#a078ff` | Stronger violet fills (also shadcn `accent`) |
| | `on-primary` | `#3c0091` | Text/icons on `primary` |
| Secondary (Cyan) | `secondary` | `#4cd7f6` | Metadata, genre chips, technical labels, "Semantic match" eyebrow |
| Tertiary (Amber) | `tertiary` | `#ffb95f` | Ratings and accolades only |
| Error | `error` / `destructive` | `#ffb4ab` | Error text and destructive tints |
| Text | `on-surface` | `#e5e1e4` | Primary text |
| | `on-surface-variant` | `#cbc3d7` | Body/secondary text |
| | `outline` | `#958ea0` | Tertiary text: years, captions, inactive nav |
| Borders | `border` | `rgba(229,225,228,.08)` | Hairlines, header/footer dividers |
| | `input` | `rgba(229,225,228,.14)` | Field and outline-button borders |

Accent usage is semantic, not decorative: violet = act / AI, cyan = describe, amber = rate. Don't use amber for anything that isn't a rating.

## Typography

**Geist** (sans) for everything, **Geist Mono** for numeric facts (budget, revenue, popularity, build version). Loaded via the `geist` package as CSS variables on `<html>`.

| Style | Spec | Where |
| --- | --- | --- |
| display-lg | 48px/56 · 700 · −0.04em (mobile 32px/40 · −0.02em) | Home hero H1 (scales 32 → 48 → 60 → 64) and movie title |
| headline-md | 24px/32 · 600 · −0.01em | Section headings ("Popular now"), empty-state titles |
| page title | 24–30px · 700 · −0.03em | Watchlist, Profile |
| body-base | 16px/24 · 400 | Chat and overview copy (overview uses 26px line-height) |
| body-sm | 14px/20 · 400 | Descriptions, nav, card titles (600) |
| label-caps | 12px/16 · 600 · +0.1em · UPPERCASE | Eyebrows ("Catalog discovery", "Overview", "Facts", "Narrow it") |

Display type is tight and heavy for a poster feel; labels are uppercase and tracked to separate stats from narrative.

## Layout & Spacing

- 4px baseline. Container max width **1440px**, centred.
- Page gutters: **64px** on desktop sections (`lg:px-16`), **20px** on mobile (`px-5`). Utility pages (watchlist) use 16/24/32px (`px-4 sm:px-6 lg:px-8`).
- Vertical rhythm between major sections: 56px mobile → 80px desktop (home).
- Poster grids: 2 → 3 → 4 → 5 → 6 columns across breakpoints, 16–24px gap.
- Posters are **2:3**, backdrops use a 38vh / 46vh / 52vh hero that fades into the background.
- The shell is: sticky 64px **Header** (desktop nav) → page → **Footer** (shows release version); below `md` a fixed 64px **BottomNav** replaces the header nav, and `<body>` gets `pb-16` to clear it.
- Every async view must render all four states: pending (Skeleton), error, empty (`EmptyState`), success.

## Elevation & Depth

Depth comes from tonal surfaces, not shadows.

| Level | Token | Hex | Use |
| --- | --- | --- | --- |
| 0 | `background` / `surface` / `surface-container-lowest` | `#0e0e10` | Page base |
| 1 | `card` / `surface-container-low` | `#1c1b1d` | Cards, inputs, panels (Facts, shortlist, CTA block) |
| 1+ | `surface-container` → `-highest` | `#201f22` → `#353437` | Avatars fallback, skeleton-ish blocks, toggles |
| 2 | `popover` | `#1c1b1d` | Popovers/tooltips, with blur and a 1px 10% white ring |

Glass: sticky Header and BottomNav use `surface-container-lowest/85` + `backdrop-blur-xl`; icon buttons over imagery use `surface-container-lowest/60` + `backdrop-blur-md`.

**Interaction:** hovering a movie card scales it to 1.02 and swaps its ring for a violet-tinted glow (`ring-primary/35` + soft `rgba(208,188,255,.2)` shadow) instead of a black shadow. Focus is a 3px `ring` at 50% opacity plus a `ring`-coloured border. Pressed buttons nudge down 1px.

## Shapes

Base radius `--radius: 0.5rem`. Scale: sm 4px, md 12px, lg 16px, xl 24px, full.

- Buttons in shared UI default to `rounded-lg`, but **primary page-level controls are pills** (`rounded-full`): header auth buttons, search bar, CTAs, chips, icon buttons.
- Movie cards and posters: 16px (`rounded-2xl`). Auth card: 24px.
- Chat bubbles: 18px with a 6px tail corner (bottom-right for the user).

## Components

- **Button** (`components/ui/button.tsx`): variants `default` (violet fill, `on-primary` text), `outline` (hairline + faint fill), `secondary`, `ghost`, `destructive` (tinted), `link`. Page CTAs override to `h-11/12 rounded-full font-semibold` and gain a violet glow on hover. The AI CTA ("Ask AI about this film") is a tinted `primary/15` pill, not a solid one.
- **Badge** (`components/ui/badge.tsx`): `chip` (cyan text on `secondary/15`, faint cyan glow) for genres; `rating` (`tertiary/15`) for scores; `ai` (`primary/15`) for AI-powered markers; `outline` for flags such as "Adult".
- **Search bar** (`main-search.tsx`): a pill on `card` with a 1px `foreground/12` border, a Semantic/Keyword toggle at the start, a violet sparkle icon, and a circular violet submit button. Hero size is 56–68px tall with a faint violet halo (`0 0 0 6px primary/6%`) and a deep drop shadow; `compact` (40px) is for results pages.
- **Movie card** (`movie-card.tsx`): `card` surface, no borders beyond the 8% ring, 2:3 poster with a bottom black→transparent gradient, a glass bookmark button top-right (signed-in only), title (truncated), year + amber star rating, one cyan genre chip.
- **Facts panel / CTA block** (movie details): `card`/`surface-container-low` rounded-2xl panels; labels in `outline`, values in `on-surface`, numbers in Geist Mono.
- **Chat** (Ask AI): user bubble `primary/12` with a `primary/20` border; assistant avatar is a `primary/14` rounded square with a sparkle; movie suggestions scroll horizontally with hidden scrollbars; "Narrow it" and "Try:" suggestions are small outline pills; a right-hand **Shortlist rail** holds picks with a "save all" action.
- **Auth form**: a `card` panel with pill fields, show/hide password, live rule checklist on sign-up, inline form errors.
- **Empty state**: 64px circular icon on `card`, headline-md title, body-sm description, optional action button.
- **Lists:** horizontal carousels for AI suggestions; responsive grids elsewhere. Scrollbars are thin and muted where visible.
- **Ratings:** amber star + one-decimal number. AI-match percentages use a violet treatment (a circular progress ring is the intended pattern; the chat currently shows no confidence values — don't invent them).

## Page inventory

`/` Discover (hero search + featured grids) · `/search` results · `/ask` AI chat with history and shortlist · `/movies/[movieId]` details · `/discover/popular` · `/watchlist` · `/history` (empty state today) · `/profile` · `/sign-in`, `/sign-up`.

## Accessibility

- Text pairs must keep ≥4.5:1 contrast; `outline` (#958ea0) is for secondary captions only, never for essential content.
- Icon-only buttons need `aria-label`; decorative icons and gradients get `aria-hidden`.
- Form fields use real `<label>` (visually hidden is fine, as in the search bar); invalid fields set `aria-invalid`.
- Touch targets ≥44px for primary actions on mobile; keep the BottomNav at 64px.
- Always use `next/link` for navigation and keep controls keyboard-operable; focus rings must stay visible.

## Do / Don't

- Do reach for semantic tokens (`bg-card`, `text-on-surface-variant`, `text-outline`) — never raw hex in components.
- Do keep violet for action/AI, cyan for metadata, amber for ratings.
- Don't add borders to cards, heavy black shadows, light-theme colours, gradients washes beyond the single hero halo, or emoji.
- Don't invent data (match %, citations, stats); show only what the API returns.
