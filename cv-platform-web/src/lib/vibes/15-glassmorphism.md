# Vibe: Glassmorphism

## Overview
- **Category:** Creative/Designer
- **Keywords:** glass, blur, translucent, frosted, modern, clean, layered, subtle
- **Best For:** UI/UX designers, iOS developers, product designers, modern tech creatives
- **Inspiration:** iOS design, macOS Big Sur, modern dashboard UIs

## Design Philosophy
Depth through transparency. Frosted glass effects create visual hierarchy and depth while maintaining a light, airy feel. The background shows through, creating a sense of layers.

## Color Palette

| Role | Hex Code | Usage Notes |
|------|----------|-------------|
| Background Primary | linear-gradient(135deg, #667eea 0%, #764ba2 100%) | Gradient for glass effect |
| Background Secondary | #F1F5F9 | Subtle sections |
| Glass Surface | rgba(255, 255, 255, 0.25) | Frosted glass |
| Glass Border | rgba(255, 255, 255, 0.18) | Subtle border |
| Text Primary | #FFFFFF | On glass/gradient |
| Text Secondary | #1E293B | On light backgrounds |
| Accent Primary | #FFFFFF | CTAs on glass |
| Accent Secondary | #667EEA | Links |

## Typography

| Element | Font Family | Weight | Size (Desktop) | Notes |
|---------|-------------|--------|----------------|-------|
| H1 | Inter | Bold | 56px | Clean, modern |
| H2 | Inter | Semibold | 40px | |
| H3 | Inter | Medium | 26px | |
| Body | Inter | Regular | 16px | Line height 1.7 |
| Caption | Inter | Medium | 13px | |

**Font Loading:** 
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

## Spacing & Layout

- **Container Max Width:** 1200px
- **Section Padding:** 120px vertical
- **Grid System:** Layered cards, overlapping elements
- **Base Unit:** 8px
- **Card Padding:** 32px
- **Element Gap:** 24px

## Animation Philosophy

Ethereal and smooth. Animations should feel like clouds floating—gentle, continuous, and graceful. Blur effects can animate subtly.

### Entrance Animations
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Glass Cards | fade-in + scale(0.95→1) | 0.6s | ease-out |
| Headings | fade-up | 0.5s | ease-out |
| Body Text | fade-up | 0.4s | ease-out |
| Background | subtle gradient shift | 8s | linear loop |

### Interaction Animations
| Trigger | Animation | Notes |
|---------|-----------|-------|
| Card Hover | slight lift + glow | 0.3s |
| Button Hover | brighten + shadow | 0.2s |
| Link Hover | underline | 0.2s |
| Scroll | parallax layers | subtle |

## Component Styles

### Glass Cards
```css
.glass-card {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 32px;
  transition: all 0.3s ease;
}
.glass-card:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}
```

### Buttons
```css
.btn-primary {
  background: rgba(255, 255, 255, 0.9);
  color: #667EEA;
  border: none;
  border-radius: 12px;
  padding: 14px 28px;
  font-weight: 600;
  backdrop-filter: blur(4px);
  transition: all 0.2s ease;
}
.btn-primary:hover {
  background: #FFFFFF;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.15);
}
```

### Navigation
- Style: Fixed, glass effect
- Background: rgba(255,255,255,0.15) with blur
- Layout: Logo left, links center, glass CTA right

## Section Layout Guidelines

### Hero Section
- **Layout:** Centered with gradient background, floating glass cards
- **Elements:** Headline, subtext, CTA, floating glass elements behind
- **Unique Feature:** Layered glass cards creating depth

### About Section
- **Layout:** Glass card with profile info
- **Personality:** Clean, modern, approachable

### Projects/Work Section
- **Layout:** Staggered glass cards with depth
- **Card Style:** Glass background, image thumbnails, text overlay
- **Hover Effect:** Lift + brighten

### Skills/Tech Section
- **Display:** Glass pills or badges
- **Style:** Organized, floating feel

### Contact Section
- **Style:** Glass form card
- **Tone:** Friendly and modern

## Do's and Don'ts

### Do
- Use backdrop-filter: blur()
- Layer elements for depth
- Use gradient backgrounds
- Keep glass surfaces light
- Add subtle shadows for depth

### Don't
- Overuse glass (becomes muddy)
- Forget browser support fallbacks
- Use glass on glass (too much blur)
- Make text hard to read
- Use on very dark backgrounds (loses effect)
