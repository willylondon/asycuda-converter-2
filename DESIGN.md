---
name: ASYCUDA Excel Converter
description: A calm, precise customs workflow with clear hierarchy and trusted color.
colors:
  background: "#EDF2F7"
  surface: "#FFFFFF"
  surface-muted: "#EAF0F6"
  primary: "#0B1F33"
  primary-strong: "#071524"
  primary-soft: "#12395D"
  accent: "#0EA5C4"
  accent-strong: "#0B7E96"
  accent-warm: "#C98614"
  success: "#15803D"
  warning: "#D97706"
  danger: "#B91C1C"
  text: "#10263D"
  text-muted: "#4A6078"
  border: "#C7D4E2"
  border-strong: "#97AABD"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 5vw, 4.75rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0"
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0"
rounded:
  sm: "10px"
  md: "14px"
  lg: "18px"
  xl: "24px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "72px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "14px 22px"
  button-primary-hover:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "14px 22px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "14px 22px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "24px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "14px 16px"
---

# Design System: ASYCUDA Excel Converter

## Overview

**Creative North Star: "The Customs Control Room"**

This system should feel like a well-run operations desk: calm, precise, and quietly confident. The interface is built for people who need to get from spreadsheet to submission without friction, so clarity beats ornament every time.

The visual tone is restrained, with enough contrast and structure to feel authoritative but not cold. It avoids the usual startup tropes: no neon haze, no decorative glass, no oversized hero-stat templates, and no card-grid wallpaper. The goal is familiar trust with a little editorial sharpness, so the product feels serious without becoming sterile.

Key Characteristics:
- Crisp hierarchy
- Cool, trustworthy surfaces
- Fast, unambiguous actions
- Dense when needed, spacious when it helps
- Minimal decoration, strong structure

## Colors

The palette is a cool operational system: deep navy for authority, cyan for action, amber for interruption, and pale blue-gray neutrals for breathing room.

### Primary
- **Deep Navy** (`#0B1F33`): The main brand anchor. Use for the header, hero band, primary text on dark surfaces, and the strongest brand moments.
- **Mid Navy** (`#12395D`): Secondary depth for layered surfaces, hover states, and supporting dark sections.
- **Ink Navy** (`#071524`): The deepest shade. Reserve for the sharpest contrast points and elevated dark areas.

### Secondary
- **Signal Cyan** (`#0EA5C4`): Primary action and status accent. Use for CTAs, active states, progress, and key indicators only.
- **Deep Cyan** (`#0B7E96`): Hover and active variant for the cyan system.

### Tertiary
- **Process Amber** (`#C98614`): Used sparingly for warnings, examples, and attention moments where cyan would be too cold.

### Neutral
- **Cloud Background** (`#EDF2F7`): Page background that keeps the interface bright without feeling sterile.
- **White Surface** (`#FFFFFF`): Primary content surface.
- **Muted Surface** (`#EAF0F6`): Secondary panels, callouts, and subtle section contrast.
- **Text Navy** (`#10263D`): Main body text and headings on light surfaces.
- **Muted Slate** (`#4A6078`): Supporting copy, metadata, and helper text.
- **Border Mist** (`#C7D4E2`): Default borders and dividers.
- **Border Slate** (`#97AABD`): Stronger separators and focus-adjacent boundaries.

### Named Rules
**The One Accent Rule.** Cyan is the action color, not decoration. If a surface doesn't need help being understood, leave it alone.

## Typography

**Display Font:** Inter, ui-sans-serif, system-ui, sans-serif
**Body Font:** Inter, ui-sans-serif, system-ui, sans-serif
**Label Font:** Inter, ui-sans-serif, system-ui, sans-serif

**Character:** One family carries the whole product so the interface stays cohesive and easy to scan. The rhythm comes from weight, size, spacing, and layout rather than font switching.

### Hierarchy
- **Display** (800, clamp(2.75rem, 5vw, 4.75rem), 1.02): Reserved for hero headlines and the most important page-level statements.
- **Headline** (700, 2rem, 1.1): Section headings and major screen titles.
- **Title** (600, 1.25rem, 1.25): Cards, panels, and component headings.
- **Body** (400, 1rem, 1.6): Paragraphs and supporting explanation. Keep prose at roughly 65-75ch on marketing sections.
- **Label** (600, 0.875rem, 1.2): Buttons, badges, metadata, and form labels.

### Named Rules
**The Fixed Scale Rule.** Product typography uses a stable size ladder. No fluid shrinkage inside the task UI.

## Elevation

Depth is tonal rather than glossy. Surfaces separate through background value, borders, and carefully measured shadow rather than blur-heavy effects. The page should feel layered, not floating.

### Shadow Vocabulary
- **Surface Lift** (`0 10px 30px rgba(11, 31, 51, 0.08)`): Hovered cards and active panels.
- **Action Lift** (`0 12px 28px rgba(14, 165, 196, 0.18)`): Primary CTA emphasis and success moments.
- **Focus Halo** (`0 0 0 4px rgba(14, 165, 196, 0.18)`): Keyboard focus ring support when borders alone are not enough.

### Named Rules
**The Flat-By-Default Rule.** Resting surfaces stay mostly flat. Depth appears in response to state, not as decoration.

## Components

Components should feel familiar and dependable. The aim is earned trust, not invention for its own sake.

### Buttons
- **Shape:** 14px radius for standard buttons, full pill only for compact tags.
- **Primary:** Deep Navy background with white text; compact but substantial padding; reserved for the main action on a surface.
- **Hover / Focus:** Shift to Mid Navy on hover, with a visible cyan focus ring and no bounce or spring.
- **Secondary / Ghost:** White or transparent background with navy text and a restrained border for lower-priority actions.

### Cards / Containers
- **Corner Style:** 18px radius on larger cards, 14px on smaller controls.
- **Background:** White or muted surface with a subtle border and minimal shadow.
- **Border:** One clear border, not border-plus-heavy-shadow decoration.
- **Internal Padding:** 24px on standard cards, more generous on hero panels.

### Inputs / Fields
- **Style:** White surface, cool border, clear label above the field.
- **Focus:** Border shifts toward cyan with a visible ring and no layout shift.
- **Error / Disabled:** Errors use amber or red with plain-English guidance; disabled states stay legible, not faded into illegibility.

### Navigation
- **Style:** Sticky top bar with a stable, predictable layout and a strong current-page state.
- **Behavior:** Mobile navigation collapses cleanly without hiding the primary action.

### Status Elements
- **Style:** Compact badges and callouts for validation, warnings, and success states.
- **Behavior:** Use semantic colors consistently across the app so the same color always means the same thing.

## Do's and Don'ts

Do:
- Keep the main task path obvious.
- Use spacing to create rhythm and separation.
- Make validation and security feel visible, not buried.
- Keep the product vocabulary consistent from homepage to converter.
- Respect reduced-motion preferences and keyboard users.

Don't:
- Add decorative gradients, glass cards, or loud hero effects.
- Use identical card grids everywhere just because they are convenient.
- Let gray text sit on colored surfaces.
- Increase radius until components feel toy-like.
- Animate for spectacle instead of state.
