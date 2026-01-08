# Vibe: Vaporwave Y2K

## Overview
- **Category:** Artistic/Expressive
- **Keywords:** vaporwave, y2k, retro, aesthetic, nostalgic, neon, pink, blue, dreamy, surreal
- **Best For:** Digital artists, music producers, content creators, nostalgia-focused creatives
- **Inspiration:** Vaporwave aesthetic, early 2000s web, Windows 95/98, Japanese city pop

## Design Philosophy
A E S T H E T I C. Embrace the dreamy, surreal world of vaporwave with pastel gradients, Greek statues, palm trees, and early internet nostalgia. It's ironic, it's sincere, it's timeless in its datedness.

## Color Palette

| Role | Hex Code | Usage Notes |
|------|----------|-------------|
| Background Primary | #1A1A2E | Deep purple-blue |
| Background Gradient | linear-gradient(180deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%) | Night sky feel |
| Text Primary | #FFE4F3 | Soft pink |
| Text Secondary | #00FFF0 | Cyan |
| Accent Primary | #FF6EC7 | Hot pink |
| Accent Secondary | #00FFFF | Classic cyan |
| Accent Tertiary | #FF00FF | Magenta |
| Glow | rgba(255, 110, 199, 0.5) | Pink glow |

## Typography

| Element | Font Family | Weight | Size (Desktop) | Notes |
|---------|-------------|--------|----------------|-------|
| H1 | VT323 | Regular | 72px | Pixelated, retro |
| H2 | Space Mono | Bold | 48px | Monospace |
| H3 | Space Mono | Regular | 28px | |
| Body | Inter | Regular | 16px | Line height 1.7 |
| Caption | VT323 | Regular | 14px | Uppercase |
| Japanese | Noto Sans JP | Regular | Various | Optional aesthetic text |

**Font Loading:** 
```html
<link href="https://fonts.googleapis.com/css2?family=VT323&family=Space+Mono:wght@400;700&family=Inter:wght@400&display=swap" rel="stylesheet">
```

## Spacing & Layout

- **Container Max Width:** 1000px
- **Section Padding:** 100px vertical
- **Grid System:** Flexible, dreamy
- **Base Unit:** 8px
- **Card Padding:** 32px
- **Element Gap:** 24px

## Animation Philosophy

Dreamy and slow. Animations should feel like floating through a digital dream—slow pans, gentle glows, and pulsing neon. Think screensaver energy.

### Entrance Animations
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Headings | glitch flicker + fade | 1s | steps |
| Body Text | scan line reveal | 0.8s | linear |
| Cards | fade + slow float | 1.2s | ease-out |
| Images | CRT boot effect | 0.6s | steps(8) |

### Interaction Animations
| Trigger | Animation | Notes |
|---------|-----------|-------|
| Button Hover | neon glow pulse | 0.5s |
| Card Hover | float + chromatic aberration | 0.4s |
| Link Hover | glitch + color shift | 0.2s |
| Background | slow gradient shift | continuous 20s |

## Component Styles

### Buttons
```css
.btn-primary {
  background: transparent;
  color: #FF6EC7;
  border: 2px solid #FF6EC7;
  border-radius: 0;
  padding: 14px 32px;
  font-family: 'VT323', monospace;
  font-size: 20px;
  text-transform: uppercase;
  text-shadow: 0 0 10px #FF6EC7;
  box-shadow: 0 0 20px rgba(255, 110, 199, 0.3);
  transition: all 0.3s ease;
}
.btn-primary:hover {
  background: #FF6EC7;
  color: #1A1A2E;
  text-shadow: none;
  box-shadow: 0 0 40px rgba(255, 110, 199, 0.6);
}
```

### Cards
```css
.card {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(255, 110, 199, 0.3);
  border-radius: 0;
  padding: 32px;
  position: relative;
}
.card::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(45deg, #FF6EC7, #00FFFF, #FF6EC7);
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.card:hover::before {
  opacity: 1;
}
```

### Navigation
- Style: Fixed, transparent
- Background: Gradient with scanlines overlay
- Layout: Pixelated logo, neon-styled links

## Section Layout Guidelines

### Hero Section
- **Layout:** Centered with floating elements (statues, palm trees, geometric shapes)
- **Elements:** Glitchy headline, Japanese subtitle optional, neon CTAs
- **Unique Feature:** 3D rotating object, Greek bust, or sunset gradient

### About Section
- **Layout:** Split with surreal imagery
- **Personality:** Ironic third-person or Japanese aesthetic text

### Projects/Work Section
- **Layout:** Grid with VHS-style thumbnails
- **Card Style:** Glitchy borders, magenta/cyan accents
- **Hover Effect:** Chromatic aberration, static noise

### Skills/Tech Section
- **Display:** Retro progress bars or pixelated icons
- **Style:** Windows 95 dialog box aesthetic

### Contact Section
- **Style:** Retro form or just neon email link
- **Tone:** "リーチアウト" / "Reach Out"

## Do's and Don'ts

### Do
- Use pink/cyan/purple gradients
- Add VHS/glitch effects
- Include Japanese text aesthetically
- Reference 90s computing
- Make it feel dreamy

### Don't
- Make it too clean or modern
- Use plain system fonts
- Forget the neon glow
- Be too serious
- Skip the irony
