# Vibe: Brutalist Web

## Overview
- **Category:** Artistic/Expressive
- **Keywords:** brutalist, raw, experimental, anti-design, edgy, bold, unconventional, artistic
- **Best For:** Experimental artists, avant-garde designers, typographers, conceptual creatives
- **Inspiration:** Brutalist websites, Yale Art School, experimental design studios

## Design Philosophy
Break every rule. Brutalism rejects conventional beauty for raw, honest expression. Exposed HTML aesthetics, jarring contrasts, and intentional "ugliness" create a memorable statement.

## Color Palette

| Role | Hex Code | Usage Notes |
|------|----------|-------------|
| Background Primary | #FFFFFF | Stark white |
| Background Secondary | #000000 | Full black sections |
| Background Accent | #FFFF00 | Jarring yellow |
| Text Primary | #000000 | Pure black |
| Text Secondary | #FF0000 | Red for emphasis |
| Accent Primary | #0000FF | Pure blue |
| Accent Secondary | #FF00FF | Magenta |
| Border/Subtle | #000000 | Black, always visible |

## Typography

| Element | Font Family | Weight | Size (Desktop) | Notes |
|---------|-------------|--------|----------------|-------|
| H1 | Arial Black | Black | 120px | System font, intentional |
| H2 | Times New Roman | Bold | 72px | Serif contrast |
| H3 | Courier New | Bold | 32px | Monospace |
| Body | Georgia | Regular | 18px | Line height 1.5 |
| Caption | Arial | Regular | 12px | Can be HUGE or tiny |

**Font Loading:** 
```html
/* No custom fonts - system fonts only for raw aesthetic */
```

## Spacing & Layout

- **Container Max Width:** None or random
- **Section Padding:** Inconsistent (0px to 200px)
- **Grid System:** Intentionally broken
- **Base Unit:** None
- **Card Padding:** Random or none
- **Element Gap:** Varies wildly

## Animation Philosophy

None or jarring. If animations exist, they should feel intentionally broken or uncomfortable. Think "website loading error" energy.

### Entrance Animations
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| All | None or instant appear | 0s | linear |
| Alternative | Jarring flash | 0.1s | steps(2) |

### Interaction Animations
| Trigger | Animation | Notes |
|---------|-----------|-------|
| Button Hover | color invert or none | instant |
| Link Hover | underline or background | immediate |
| Scroll | none | |

## Component Styles

### Buttons
```css
.btn-primary {
  background: #0000FF;
  color: #FFFFFF;
  border: 3px solid #000000;
  border-radius: 0;
  padding: 20px 40px;
  font-family: Arial Black, sans-serif;
  font-size: 24px;
  text-transform: uppercase;
  cursor: pointer;
}
.btn-primary:hover {
  background: #FFFF00;
  color: #000000;
}
```

### Cards
```css
.card {
  background: #FFFFFF;
  border: 4px solid #000000;
  padding: 40px;
  margin: 20px 0;
}
```

### Navigation
- Style: Static, visible, utilitarian
- Background: White with black border
- Layout: Simple list, no hamburger menus

## Section Layout Guidelines

### Hero Section
- **Layout:** Full-screen text, no images, or giant overlapping elements
- **Elements:** HUGE headline, raw contact info, nothing else
- **Unique Feature:** Intentionally uncomfortable layout

### About Section
- **Layout:** Dense text block or sparse single line
- **Personality:** Raw, unfiltered, maybe just a sentence

### Projects/Work Section
- **Layout:** List or table format, no fancy cards
- **Card Style:** Plain links, dates, maybe thumbnails
- **Hover Effect:** Underline or background color

### Skills/Tech Section
- **Display:** Plain text list
- **Style:** Unformatted

### Contact Section
- **Style:** Email address in giant text
- **Tone:** Direct. No fluff.

## Do's and Don'ts

### Do
- Use system fonts
- Break conventional layouts
- Make bold typographic choices
- Use clashing colors intentionally
- Be raw and honest

### Don't
- Make it pretty
- Use subtle design
- Add smooth animations
- Follow grid systems
- Care about traditional aesthetics
