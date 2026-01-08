# Vibe: Swiss Minimal

## Overview
- **Category:** Creative/Designer
- **Keywords:** swiss, minimal, grid, typography, helvetica, clean, modernist, design
- **Best For:** Typographers, graphic designers, print designers, brand designers
- **Inspiration:** Swiss International Style, Bauhaus, modernist design

## Design Philosophy
Less is more. Rooted in Swiss design principles—strong grids, bold typography, and mathematical precision. Let the type and layout do the talking.

## Color Palette

| Role | Hex Code | Usage Notes |
|------|----------|-------------|
| Background Primary | #FFFFFF | Pure white |
| Background Secondary | #F5F5F5 | Light gray |
| Background Accent | #000000 | Black sections |
| Text Primary | #000000 | Pure black |
| Text Secondary | #666666 | Dark gray |
| Accent Primary | #FF0000 | Swiss red (sparingly) |
| Accent Secondary | #0066FF | Blue accent |
| Border/Subtle | #E0E0E0 | Grid lines |

## Typography

| Element | Font Family | Weight | Size (Desktop) | Notes |
|---------|-------------|--------|----------------|-------|
| H1 | Inter | Bold | 80px | Tight tracking, clean |
| H2 | Inter | Semibold | 56px | |
| H3 | Inter | Medium | 32px | |
| Body | Inter | Regular | 16px | Line height 1.6 |
| Caption | Inter | Regular | 11px | Uppercase, tracked |
| Display | Space Grotesk | Bold | Variable | For impact |

**Font Loading:** 
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet">
```

## Spacing & Layout

- **Container Max Width:** 1200px
- **Section Padding:** 80px vertical
- **Grid System:** Strict 12-column grid
- **Base Unit:** 8px (strict)
- **Card Padding:** 24px
- **Element Gap:** 16px

## Animation Philosophy

Nearly none. If animations exist, they should be invisible—so smooth they're not noticed. The focus is content and composition.

### Entrance Animations
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| All | fade-in (subtle) | 0.3s | ease-out |
| Images | none or simple fade | 0.4s | ease-out |

### Interaction Animations
| Trigger | Animation | Notes |
|---------|-----------|-------|
| Button Hover | background invert | 0.15s |
| Link Hover | underline slide | 0.2s |
| Card Hover | minimal border change | 0.2s |

## Component Styles

### Buttons
```css
.btn-primary {
  background: #000000;
  color: #FFFFFF;
  border: none;
  border-radius: 0;
  padding: 14px 28px;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: background 0.15s ease;
}
.btn-primary:hover {
  background: #333333;
}

.btn-secondary {
  background: transparent;
  color: #000000;
  border: 2px solid #000000;
  padding: 12px 26px;
}
```

### Cards
```css
.card {
  background: #FFFFFF;
  border: none;
  padding: 24px;
}
.card:hover {
  /* Minimal or none */
}
```

### Navigation
- Style: Fixed or static, minimal
- Background: White, maybe black line bottom
- Layout: Logo left (wordmark), links right, aligned to grid

## Section Layout Guidelines

### Hero Section
- **Layout:** Asymmetric or large type grid
- **Elements:** Massive headline, maybe a single date or tagline
- **Unique Feature:** Typography is the hero—no images needed

### About Section
- **Layout:** Text block with strong alignment
- **Personality:** Brief, factual, design-focused

### Projects/Work Section
- **Layout:** Clean grid with generous gaps
- **Card Style:** Image + title + year, minimal info
- **Hover Effect:** Subtle or none

### Skills/Tech Section
- **Display:** Simple categorized list
- **Style:** Column layout, aligned

### Contact Section
- **Style:** Single line contact info
- **Tone:** Direct

## Do's and Don'ts

### Do
- Follow strict grid systems
- Use bold, large typography
- Keep color usage extreme minimal
- Embrace white space
- Align everything to a baseline

### Don't
- Add decorative elements
- Use rounded corners
- Include playful animations
- Use many colors
- Break the grid
