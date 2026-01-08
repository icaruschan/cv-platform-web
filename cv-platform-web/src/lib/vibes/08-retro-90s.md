# Vibe: Retro 90s

## Overview
- **Category:** Artistic/Expressive
- **Keywords:** retro, 90s, nostalgic, vintage, grunge, y2k, throwback, analog
- **Best For:** Creative directors, nostalgic brands, indie game developers, musicians, vintage enthusiasts
- **Inspiration:** 90s web design, VHS aesthetics, Windows 95/98, early internet

## Design Philosophy
Embrace the charm of early web design with a modern twist. Chunky elements, bold shadows, and nostalgic color palettes transport visitors back in time. It's retro done right—playful, bold, and unapologetically fun.

## Color Palette

| Role | Hex Code | Usage Notes |
|------|----------|-------------|
| Background Primary | #FFF4E6 | Warm cream/beige |
| Background Secondary | #FFFBEB | Light yellow |
| Background Accent | #7C3AED | Purple accent blocks |
| Text Primary | #1E1B4B | Deep indigo |
| Text Secondary | #4338CA | Indigo |
| Accent Primary | #F59E0B | Amber/Yellow |
| Accent Secondary | #EC4899 | Hot pink |
| Accent Tertiary | #10B981 | Teal green |
| Border/Subtle | #1E1B4B | Bold black/indigo borders |

## Typography

| Element | Font Family | Weight | Size (Desktop) | Notes |
|---------|-------------|--------|----------------|-------|
| H1 | Space Grotesk | Bold | 64px | Chunky, blocky feel |
| H2 | Space Grotesk | Bold | 48px | |
| H3 | Space Grotesk | Medium | 28px | |
| Body | IBM Plex Sans | Regular | 17px | Line height 1.6 |
| Caption | Space Mono | Regular | 13px | Monospace for labels |
| Decorative | VT323 | Regular | Variable | Pixelated accent text |

**Font Loading:** 
```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Sans:wght@400;500&family=Space+Mono&family=VT323&display=swap" rel="stylesheet">
```

## Spacing & Layout

- **Container Max Width:** 1100px
- **Section Padding:** 80px vertical
- **Grid System:** Chunky blocks, intentionally "broken" grid
- **Base Unit:** 8px
- **Card Padding:** 24px
- **Element Gap:** 20px

## Animation Philosophy

Bouncy and playful. Animations should feel like old computer transitions—slightly chunky, fun, and nostalgic. Think Windows loading bars, bouncing icons, and screen wipes.

### Entrance Animations
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Headings | bounce-in | 0.5s | cubic-bezier(0.68, -0.55, 0.265, 1.55) |
| Body Text | slide-in from left | 0.4s | ease-out |
| Cards | pop-in with rotation | 0.5s | spring |
| Images | pixelate-reveal | 0.6s | steps(10) |

### Interaction Animations
| Trigger | Animation | Notes |
|---------|-----------|-------|
| Button Hover | 3D push effect, shadow shift | 0.1s |
| Card Hover | wiggle + shadow grow | 0.3s |
| Link Hover | underline + color shift | immediate |
| Scroll | elements bounce in | staggered |

## Component Styles

### Buttons
```css
.btn-primary {
  background: #F59E0B;
  color: #1E1B4B;
  border: 3px solid #1E1B4B;
  border-radius: 0;
  padding: 14px 28px;
  font-weight: 700;
  text-transform: uppercase;
  box-shadow: 4px 4px 0 #1E1B4B;
  transition: all 0.1s ease;
}
.btn-primary:hover {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 #1E1B4B;
}
.btn-primary:active {
  transform: translate(4px, 4px);
  box-shadow: none;
}
```

### Cards
```css
.card {
  background: #FFFFFF;
  border: 3px solid #1E1B4B;
  border-radius: 0;
  padding: 24px;
  box-shadow: 6px 6px 0 #1E1B4B;
  transition: all 0.2s ease;
}
.card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 8px 8px 0 #1E1B4B;
}
```

### Navigation
- Style: Fixed, chunky
- Background: Solid color with bold border bottom
- Layout: Blocky logo left, chunky button-style links

## Section Layout Guidelines

### Hero Section
- **Layout:** Asymmetric with stacked/overlapping elements
- **Elements:** Big chunky headline, sticker-style tagline, 3D buttons, maybe a pixel art or retro illustration
- **Unique Feature:** Retro window UI elements, maybe a faux browser chrome

### About Section
- **Layout:** Card-based, like software "about" dialog
- **Personality:** Fun facts, casual tone, maybe 8-bit avatar

### Projects/Work Section
- **Layout:** Grid with varied, chunky cards
- **Card Style:** Bold borders, shadows, colorful backgrounds
- **Hover Effect:** Wiggle or pop

### Skills/Tech Section
- **Display:** Progress bars (90s loading bar style) or pixel icon grid
- **Style:** Nostalgic, gamified

### Contact Section
- **Style:** Retro form inputs with bold styling
- **Tone:** "Drop me a line!" / "Send a message"

## Do's and Don'ts

### Do
- Use bold, chunky borders
- Add hard drop shadows
- Include playful, bouncy animations
- Use nostalgic color combinations
- Make it feel fun and approachable

### Don't
- Use soft gradients
- Make it too polished or minimal
- Use subtle, refined typography
- Forget the playful energy
- Take yourself too seriously
