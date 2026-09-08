---
name: Artisanal Nordic Minimalist
colors:
  surface: '#f4faff'
  surface-dim: '#cfdce4'
  surface-bright: '#f4faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e9f6fd'
  surface-container: '#e3f0f8'
  surface-container-high: '#ddeaf2'
  surface-container-highest: '#d7e4ec'
  on-surface: '#111d23'
  on-surface-variant: '#504441'
  inverse-surface: '#263238'
  inverse-on-surface: '#e6f3fb'
  outline: '#827470'
  outline-variant: '#d4c3be'
  surface-tint: '#77574d'
  primary: '#442a22'
  on-primary: '#ffffff'
  primary-container: '#5d4037'
  on-primary-container: '#d4ada1'
  inverse-primary: '#e7bdb1'
  secondary: '#655d5a'
  on-secondary: '#ffffff'
  secondary-container: '#ece0dc'
  on-secondary-container: '#6b6360'
  tertiary: '#2f312e'
  on-tertiary: '#ffffff'
  tertiary-container: '#454745'
  on-tertiary-container: '#b5b5b2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd0'
  primary-fixed-dim: '#e7bdb1'
  on-primary-fixed: '#2c160e'
  on-primary-fixed-variant: '#5d4037'
  secondary-fixed: '#ece0dc'
  secondary-fixed-dim: '#cfc4c0'
  on-secondary-fixed: '#201a18'
  on-secondary-fixed-variant: '#4c4542'
  tertiary-fixed: '#e2e3df'
  tertiary-fixed-dim: '#c6c7c3'
  on-tertiary-fixed: '#1a1c1a'
  on-tertiary-fixed-variant: '#454745'
  background: '#f4faff'
  on-background: '#111d23'
  surface-variant: '#d7e4ec'
typography:
  headline-xl:
    fontFamily: Playfair Display
    fontSize: 60px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style
The design system embodies the intersection of Scandinavian functionality and the warmth of hand-crafted wood joinery. It targets an audience that values slow living, sustainable luxury, and tactile quality.

The visual direction follows a **Modern Minimalist** approach with a **Tactile** twist. This is achieved through generous whitespace (the "breathing room" of a quiet home) paired with subtle depth cues that mimic the physical layering of furniture components. The UI should evoke a sense of calm, precision, and enduring reliability.

## Colors
The palette is derived from natural timber and organic fibers to ground the digital experience in the physical world.

- **Primary (Walnut Brown):** Used for key brand moments, primary CTAs, and active states. It represents the strength of the wood.
- **Secondary (Warm Beige):** Used for subtle backgrounds, secondary buttons, and decorative separators.
- **Tertiary (Cream/Off-white):** The foundational surface color, providing a softer, more premium feel than pure white.
- **Neutral (Dark Charcoal):** Reserved strictly for typography and iconography to ensure high legibility and a sharp, professional finish.
- **Accent (Natural Light Wood):** Use `#E0C9A6` sparingly for highlighting craftsmanship details or small badges.

## Typography
The typographic hierarchy relies on the tension between the editorial elegance of **Playfair Display** and the functional precision of **Inter**.

Headlines should be treated with intentionality; use `headline-xl` for hero sections and product names. Body text remains clean and understated to keep the focus on photography. Always ensure a high contrast ratio between the Dark Charcoal text and Cream backgrounds.

## Layout & Spacing
This design system utilizes a **Fixed Grid** model for desktop to maintain the "framed" feel of a high-end catalog, transitioning to a fluid model for mobile.

- **Desktop (1440px+):** 12-column grid with 64px outside margins and 24px gutters.
- **Tablet (768px - 1024px):** 8-column grid with 40px margins.
- **Mobile (<768px):** 4-column fluid grid with 20px margins.

Spacing follows an 8px linear scale. Use larger spacing increments (64px, 80px, 120px) between sections to reinforce the minimalist aesthetic and give the product imagery room to breathe.

## Elevation & Depth
Depth is communicated through **Tonal Layers** and **Ambient Shadows** rather than harsh borders. 

- **Level 0 (Base):** The Cream (`#F5F5F1`) background.
- **Level 1 (Cards/Surfaces):** Pure white surfaces with a very soft, diffused shadow (Blur: 20px, Y: 4px, Color: `#000000` at 3% opacity).
- **Level 2 (Interactive/Hover):** Increase shadow spread and slightly darken the Walnut brown accents.

Avoid using heavy inner shadows or glows. The goal is to make elements feel as though they are resting gently on a solid surface, like furniture on a gallery floor.

## Shapes
The shape language is **Soft (0.25rem)**. This subtle rounding mimics the "sanded edge" of a wooden plank—not sharp enough to be cold, but not rounded enough to lose its architectural structure. 

- **Small elements (Inputs, Buttons):** 4px (0.25rem) radius.
- **Large elements (Cards, Image containers):** 8px (0.5rem) radius.
- **Decorative elements:** Use circles only for avatars or price badges.

## Components
- **Buttons:** Primary buttons use Walnut Brown with white text, 4px corner radius, and generous horizontal padding. Secondary buttons use a subtle 1px border of Walnut Brown or are entirely text-based with a bottom-border hover effect.
- **Input Fields:** Use a Warm Beige background with a bottom-only border in Dark Charcoal to maintain an airy, minimalist look. Labels should use the `label-sm` style.
- **Cards:** Product cards should have no visible borders; use a subtle Tonal Layer (Pure White on Cream background) to define the boundary.
- **Chips/Filters:** Use the Secondary Warm Beige as a fill for unselected states and Walnut Brown for active states.
- **Lists:** Use wide spacing between list items (min 16px) with 1px horizontal dividers in a very faint beige (`#E0E0E0`).
- **Additional Components:**
    - **Material Badge:** A small icon + text component to highlight "Solid Oak" or "Hand-carved" features.
    - **Image Zoom:** A custom interaction component for high-resolution wood grain inspection.