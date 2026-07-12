---
name: Cinematic Noir
colors:
  surface: "#131315"
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
  background: "#131315"
  on-background: "#e5e1e4"
  surface-variant: "#353437"
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

## Brand & Style

The design system is engineered for a premium, immersive movie-discovery experience. It adopts a **Cinematic Dark** style, blending high-end minimalism with modern technology cues. The target audience is cinephiles and tech-forward users who value speed, curation, and visual fidelity.

The emotional response should be one of "sophisticated discovery"—the interface recedes to let high-quality movie posters and trailers take center stage, while the UI elements feel like precision tools. Drawing inspiration from **Glassmorphism** and **Modern SaaS** aesthetics, the system utilizes subtle background blurs, deep overlays, and electric accents to signify intelligence and premium quality.

## Colors

The palette is rooted in a near-black foundation to eliminate visual noise and maximize the "glow" of cinematic content.

- **Primary (Electric Violet):** Reserved for high-intent actions, active states, and AI-powered recommendations.
- **Secondary (Cyan):** Used for metadata, technical labels, and genre categorization to provide a cool, high-tech contrast.
- **Tertiary (Amber):** Specifically designated for ratings and critical accolades, evoking the warmth of traditional cinema awards.
- **Surfaces:** A tiered system of deep grays (Graphite) creates a sense of depth without relying on high-contrast borders.

## Typography

This design system utilizes **Geist** for its technical precision and systematic spacing, which aligns with the app's AI-powered nature.

Large display headings use tight letter-spacing and heavy weights to create a "poster" feel. Body copy remains legible with generous line-heights. Metadata and labels frequently use uppercase with increased tracking to differentiate information-heavy stats from narrative descriptions. On mobile, display sizes scale down significantly to ensure the content remains the focal point within narrower viewports.

## Layout & Spacing

The layout follows a **Fluid Grid** model with high horizontal margins on desktop to create a "theatrical" aspect ratio for content areas.

- **Desktop:** 12-column grid with 24px gutters. Content is centered with a max-width of 1440px.
- **Tablet:** 8-column grid with 20px gutters and margins.
- **Mobile:** 4-column grid with 16px gutters and 20px margins.

Spacing follows a 4px baseline. Use wide vertical spacing (stack-lg) between distinct content sections (e.g., "Trending" vs "For You") to maintain an airy, premium feel. Content cards should utilize a dynamic aspect ratio—typically 2:3 for posters and 16:9 for backdrops.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Glassmorphism**. Shadows are used sparingly; instead, depth is created by the lightness of the gray surface.

- **Level 0 (Background):** #09090B. Pure base.
- **Level 1 (Cards/Sections):** #18181B. Used for the primary content containers.
- **Level 2 (Modals/Popovers):** #27272A with a 20px backdrop blur and a 1px subtle white stroke at 10% opacity.
- **Interaction:** Hovering over a Level 1 element should lift it via a subtle scale (1.02x) and a soft, violet-tinted outer glow rather than a traditional black shadow.

## Shapes

The shape language is modern and balanced. A `0.5rem` (8px) base radius is applied to most standard components to keep the UI feeling approachable yet structured. Larger containers like movie posters or hero banners should use `1rem` (16px) to soften the large visual masses of the cinematic imagery.

## Components

- **Buttons:**
  - _Primary:_ Electric-violet background, white text, bold weight. High-gloss finish on hover.
  - _Secondary:_ Ghost style with a 1px border (#27272A) and a subtle blur background.
- **Chips:** Small, pill-shaped markers for genres. Cyan text on a low-opacity cyan background (10%) for a "glowing" effect.
- **Lists:** Horizontal scrolling "carousels" are the primary list format. Ensure the scrollbar is custom-styled to be ultra-thin and muted-gray.
- **Cards:** No borders. Use the Level 1 surface color. Images should have a subtle dark-to-transparent gradient overlay at the bottom to ensure white text remains legible when placed directly over imagery.
- **Input Fields:** Deep graphite background (#121214) with a focus state that triggers a 1px Electric-violet border and a soft violet outer glow.
- **Ratings:** Use the Amber accent for stars or numerical values. For AI-match percentages, use a circular progress ring in Primary Electric-violet.
