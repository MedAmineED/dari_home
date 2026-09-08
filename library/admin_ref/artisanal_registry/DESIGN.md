---
name: Artisanal Registry
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#51443c'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0f0'
  outline: '#83746b'
  outline-variant: '#d5c3b8'
  surface-tint: '#805533'
  primary: '#6f4627'
  on-primary: '#ffffff'
  primary-container: '#8b5e3c'
  on-primary-container: '#ffe3d1'
  inverse-primary: '#f4bb92'
  secondary: '#77574d'
  on-secondary: '#ffffff'
  secondary-container: '#fed3c7'
  on-secondary-container: '#795950'
  tertiary: '#3e5800'
  on-tertiary: '#ffffff'
  tertiary-container: '#517201'
  on-tertiary-container: '#cdf67f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcc5'
  primary-fixed-dim: '#f4bb92'
  on-primary-fixed: '#301400'
  on-primary-fixed-variant: '#653d1e'
  secondary-fixed: '#ffdbd0'
  secondary-fixed-dim: '#e7bdb1'
  on-secondary-fixed: '#2c160e'
  on-secondary-fixed-variant: '#5d4037'
  tertiary-fixed: '#c8f17a'
  tertiary-fixed-dim: '#add461'
  on-tertiary-fixed: '#131f00'
  on-tertiary-fixed-variant: '#364e00'
  background: '#fcf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
typography:
  headline-lg:
    fontFamily: IBM Plex Sans
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
  headline-md:
    fontFamily: IBM Plex Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: IBM Plex Sans
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-bold:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-caps:
    fontFamily: IBM Plex Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 24px
  gutter: 16px
  sidebar-width: 260px
  header-height: 64px
---

## Brand & Style
The design system is a high-performance administrative interface tailored for the craftsmanship industry. It balances the precision of a modern SaaS tool with the tactile warmth of handcrafted furniture. The brand personality is professional, efficient, and grounded, evoking an emotional response of trust and organized mastery.

The design style is **Corporate Modern with Tactile Accents**. It utilizes high-quality typography and a disciplined grid to manage complex data, while incorporating soft, earthy tones to reflect the organic nature of the wood materials. The UI is clean and functional, prioritizing information density without sacrificing visual breathing room.

## Colors
The palette is rooted in natural, earthy tones that signify quality and durability.

- **Primary (#8B5E3C):** Natural Wood Brown, used for primary actions and active navigation states.
- **Secondary (#5D4037):** Deep Umber, used for sidebar backgrounds and high-level structural elements.
- **Accent (#6B8E23):** Olive Green, reserved for success states, completions, and positive trend indicators.
- **Surface & Background:** Off-White (#FAF9F6) provides a clean canvas, while Soft Beige (#F5F5DC) is used for container backgrounds to create subtle layering.
- **Text:** Deep Charcoal (#2C2C2C) ensures maximum contrast and readability for dense data tables.
- **Functional:** Use high-saturation Orange for warnings and Red for destructive actions, ensuring they stand out against the muted earth tones.

## Typography
The system employs a dual-font strategy to ensure clarity across both Latin (French) and Arabic scripts. **IBM Plex Sans** (and its Arabic counterpart) is used for structural headings and labels due to its technical, authoritative feel. **Inter** is utilized for body copy and data entry for its exceptional legibility at small sizes.

For RTL (Arabic) contexts, line heights should be increased by approximately 10% to accommodate the script's vertical ascenders and descenders. Data tables should prioritize the `body-sm` size to maximize information density while maintaining a clear hierarchy using `label-caps` for column headers.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid** model. The sidebar remains fixed at 260px, while the main content area expands to fill the remaining width, capped at a maximum of 1600px for readability on ultra-wide monitors.

A 4px base-unit scaling system governs all margins and paddings. 
- **Desktop:** 12-column grid, 24px margins, 16px gutters.
- **Tablet:** 8-column grid, 16px margins, 16px gutters. Sidebar collapses to an icon-only rail (64px).
- **Mobile:** 4-column grid, 16px margins, 12px gutters. Sidebar transitions to a hidden drawer.

Alignment must be strictly bidirectional. In RTL mode, the sidebar moves to the right, and all chevron icons/data flow directions are mirrored.

## Elevation & Depth
This design system uses **Tonal Layering** and **Low-Contrast Outlines** rather than heavy shadows to maintain a professional, flat SaaS aesthetic.

- **Level 0 (Base):** Background (#FAF9F6).
- **Level 1 (Cards/Containers):** Surface (#F5F5DC) with a 1px solid border (#E0E0E0). No shadow.
- **Level 2 (Modals/Popovers):** Surface (#FFFFFF) with a subtle, diffused shadow (0px 4px 12px rgba(0,0,0,0.05)) and a 1px border.
- **Interactions:** Hover states on interactive cards should transition to a slightly darker border (#D0D0D0) rather than increasing elevation.

## Shapes
The shape language is disciplined and geometric, reflecting the precision of fine joinery. A **Soft (4px)** radius is the standard for almost all UI components, including buttons, input fields, and data cards. 

- **Standard Radius:** 4px (inputs, small buttons, chips).
- **Large Radius:** 8px (main content containers, dashboard widgets).
- **Full Radius:** Only used for status indicators or user avatars to distinguish them from functional UI elements.

## Components
- **Buttons:** Primary buttons use Wood Brown (#8B5E3C) with white text. Secondary buttons use a transparent background with a 1px Umber (#5D4037) border.
- **Inputs:** High-contrast borders (#E0E0E0) that darken on focus. Labels are always positioned above the input in `label-bold`.
- **Status Badges:** Use low-opacity backgrounds (10-15%) of the status color (e.g., Olive Green for "In Stock") with high-opacity text of the same hue.
- **Data Tables:** Use a zebra-stripe pattern with very subtle alternating rows. Headers should be sticky with a 1px bottom border.
- **Side Navigation:** Vertical layout using Deep Umber (#5D4037) as the background. Active states are indicated by a Wood Brown (#8B5E3C) left-edge (or right-edge in RTL) highlight.
- **Product Cards:** Should include a small image thumbnail with a 4px border radius, clearly displaying SKU, stock level, and price in a compact, structured format.