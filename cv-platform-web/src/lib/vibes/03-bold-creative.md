# Vibe: Bold Creative

## Overview
- **Category:** Creative/Designer
- **Keywords:** bold, colorful, creative, vibrant, playful, artistic, dynamic, expressive
- **Best For:** Graphic designers, creative directors, brand designers, illustrators, art directors
- **Inspiration:** DDB Worldwide, Pentagram, award-winning agency portfolios

## Design Philosophy
Go big or go home. This vibe is for creatives who want their personality to shine through vibrant colors, bold typography, and unexpected layouts. Break the grid, use oversized elements, and make a statement.

## Color Palette

| Role | Hex Code | Usage Notes |
|------|----------|-------------|
| Background Primary | #FFFFFF | Clean white base |
| Background Secondary | #F5F5F5 | Subtle sections |
| Background Accent | #FF5733 | Hero/feature backgrounds |
| Text Primary | #1A1A1A | Headlines |
| Text Secondary | #4A4A4A | Body text |
| Accent Primary | #FF5733 | Vibrant orange-red |
| Accent Secondary | #5B2EFF | Electric purple |
| Accent Tertiary | #00D4AA | Teal green |
| Border/Subtle | #E0E0E0 | Dividers |

## Typography

| Element | Font Family | Weight | Size (Desktop) | Notes |
|---------|-------------|--------|----------------|-------|
| H1 | Clash Display | Bold | 96px | Uppercase, tight tracking |
| H2 | Clash Display | Semibold | 64px | Can break across lines |
| H3 | Space Grotesk | Medium | 32px | |
| Body | Space Grotesk | Regular | 18px | Line height 1.6 |
| Caption | Space Grotesk | Regular | 14px | Uppercase, tracked |
| Accent | Clash Display | Bold | Variable | For decorative text |

**Font Loading:** 
```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
/* Clash Display from Fontshare or similar */
```

## Spacing & Layout

- **Container Max Width:** Full-width with 80px side padding
- **Section Padding:** 140px vertical
- **Grid System:** Asymmetric/broken grid
- **Base Unit:** 8px
- **Card Padding:** 40px
- **Element Gap:** 32px

## Animation Philosophy

Energetic and playful. Animations should feel like expressions of creativity—bouncy, unexpected, and delightful. Oversized movements and playful delays add character.

### Entrance Animations
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Headings | split-reveal (per character) | 0.8s | cubic-bezier(0.16, 1, 0.3, 1) |
| Body Text | slide-up with fade | 0.6s | ease-out |
| Cards | scale-up + fade | 0.5s | spring |
| Images | clip-path reveal | 0.8s | ease-out |

### Interaction Animations
| Trigger | Animation | Notes |
|---------|-----------|-------|
| Button Hover | background slides, scale(1.05) | 0.3s bounce |
| Card Hover | tilt 3D + shadow grow | 0.4s |
| Link Hover | color + underline expand | 0.2s |
| Scroll | parallax + sticky elements | continuous |

## Component Styles

### Buttons
```css
.btn-primary {
  background: #FF5733;
  color: #FFFFFF;
  border-radius: 50px;
  padding: 18px 40px;
  font-weight: 700;
  font-size: 16px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.btn-primary:hover {
  background: #5B2EFF;
  transform: scale(1.05);
  box-shadow: 0 20px 40px rgba(91, 46, 255, 0.3);
}
```

### Cards
```css
.card {
  background: #FFFFFF;
  border: none;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  transition: all 0.4s ease;
}
.card:hover {
  transform: translateY(-10px) rotate(1deg);
  box-shadow: 0 30px 60px rgba(0,0,0,0.15);
}
```

### Navigation
- Style: Fixed, clean white or transparent
- Background: White with subtle shadow on scroll
- Layout: Logo left (can be illustrated), links center, colorful CTA right

## Section Layout Guidelines

### Hero Section
- **Layout:** Asymmetric split or full-width statement
- **Elements:** Massive headline (broken across lines), colorful accent shapes, dynamic imagery, playful CTA
- **Unique Feature:** Oversized typography that breaks convention

### About Section
- **Layout:** Mixed media collage or split with personality
- **Personality:** Expressive, shows creative process, maybe hand-drawn elements

### Projects/Work Section
- **Layout:** Masonry or asymmetric grid, varied card sizes
- **Card Style:** Large images, minimal text, hover reveals details
- **Hover Effect:** 3D tilt + color overlay

### Skills/Tech Section
- **Display:** Visual/graphic representation or custom illustrations
- **Style:** Playful icons, maybe animated

### Contact Section
- **Style:** Bold statement + large simple form
- **Tone:** "Let's create something amazing"

## Do's and Don'ts

### Do
- Use oversized typography
- Break the grid intentionally
- Add personality through color blocking
- Use playful micro-interactions
- Mix fonts creatively

### Don't
- Make it too minimal or restrained
- Use boring stock photos
- Keep everything perfectly aligned
- Use subtle, muted colors
- Be afraid to be bold
