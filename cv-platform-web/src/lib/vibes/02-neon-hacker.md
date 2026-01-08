# Vibe: Neon Hacker

## Overview
- **Category:** Developer/Tech
- **Keywords:** cyberpunk, neon, hacker, glowing, matrix, futuristic, dark, electric
- **Best For:** Security researchers, ethical hackers, game developers, blockchain developers
- **Inspiration:** Cyberpunk 2077 aesthetic, Matrix-inspired sites, Hacker News dark themes

## Design Philosophy
Embrace the cyberpunk aesthetic with vibrant neon accents against deep dark backgrounds. This vibe screams "I live in the terminal." Glowing effects and electric colors create an immersive, futuristic experience that stands out.

## Color Palette

| Role | Hex Code | Usage Notes |
|------|----------|-------------|
| Background Primary | #0D0D0D | Main page background |
| Background Secondary | #1A1A2E | Cards, sections |
| Background Tertiary | #16213E | Inputs, hover states |
| Text Primary | #EAEAEA | Headlines |
| Text Secondary | #8892B0 | Body text |
| Accent Primary | #00FF41 | Matrix green - primary CTAs |
| Accent Secondary | #FF00FF | Magenta - secondary highlights |
| Accent Tertiary | #00FFFF | Cyan - links, hover states |
| Border/Subtle | rgba(0, 255, 65, 0.2) | Glowing borders |

## Typography

| Element | Font Family | Weight | Size (Desktop) | Notes |
|---------|-------------|--------|----------------|-------|
| H1 | Space Mono | Bold | 56px | Uppercase, letter-spacing 0.1em |
| H2 | Space Mono | Bold | 36px | Uppercase |
| H3 | Inter | Semibold | 24px | |
| Body | Inter | Regular | 16px | Line height 1.7 |
| Code | Fira Code | Regular | 14px | With ligatures |
| Caption | Space Mono | Regular | 12px | Uppercase |

**Font Loading:** 
```html
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@400;600&family=Fira+Code&display=swap" rel="stylesheet">
```

## Spacing & Layout

- **Container Max Width:** 1100px
- **Section Padding:** 100px vertical
- **Grid System:** CSS Grid
- **Base Unit:** 8px
- **Card Padding:** 32px
- **Element Gap:** 24px

## Animation Philosophy

Electric and dynamic. Animations should feel like data flowing through circuits. Glitch effects, typing animations, and glowing pulses reinforce the hacker aesthetic.

### Entrance Animations
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Headings | glitch-in (text scramble) | 0.8s | steps(20) |
| Body Text | typewriter effect | 0.05s/char | linear |
| Cards | fade-in + neon glow pulse | 0.6s | ease-out |
| Images | scanline reveal | 0.8s | ease-out |

### Interaction Animations
| Trigger | Animation | Notes |
|---------|-----------|-------|
| Button Hover | glow intensifies, text glitch | 0.2s |
| Card Hover | border glow pulse, slight lift | 0.3s |
| Link Hover | color shift + underline glitch | 0.15s |
| Scroll | elements decode/reveal | 0.5s |

## Component Styles

### Buttons
```css
.btn-primary {
  background: transparent;
  color: #00FF41;
  border: 2px solid #00FF41;
  border-radius: 0;
  padding: 14px 28px;
  font-family: 'Space Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  position: relative;
  overflow: hidden;
}
.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #00FF41;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}
.btn-primary:hover::before {
  transform: translateX(0);
}
.btn-primary:hover {
  color: #0D0D0D;
  box-shadow: 0 0 30px rgba(0, 255, 65, 0.5);
}
```

### Cards
```css
.card {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 65, 0.3);
  border-radius: 0;
  padding: 32px;
  position: relative;
}
.card::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #00FF41, transparent);
}
.card:hover {
  border-color: #00FF41;
  box-shadow: 0 0 40px rgba(0, 255, 65, 0.2);
}
```

### Navigation
- Style: Fixed, transparent with subtle blur
- Background: rgba(13, 13, 13, 0.9) + scanline overlay
- Layout: Logo left (styled as terminal prompt), links right

## Section Layout Guidelines

### Hero Section
- **Layout:** Centered with terminal-style frame
- **Elements:** ASCII art or matrix rain background, typed headline, blinking cursor, command-line styled CTAs
- **Unique Feature:** Terminal/console aesthetic with typing animation

### About Section
- **Layout:** Single column, terminal log style
- **Personality:** Written as system output or hacker bio

### Projects/Work Section
- **Layout:** Grid with equal cards, no images (or glitched images)
- **Card Style:** Terminal window aesthetic with title bar
- **Hover Effect:** Screen flicker + glow

### Skills/Tech Section
- **Display:** Matrix-style grid or skill bars with loading animation
- **Style:** Terminal output format

### Contact Section
- **Style:** Email as command-line input field style
- **Tone:** "Initiate connection" / "Send transmission"

## Do's and Don'ts

### Do
- Use monospace fonts everywhere
- Add subtle scanline overlays
- Use neon glow effects on interactive elements
- Include typing/glitch animations
- Keep it dark with high contrast accents

### Don't
- Use soft, rounded corners
- Add playful or cute elements
- Use pastel or muted colors
- Make it too bright or colorful
- Use traditional button styles
