# Vibe: Minimal Developer

## Overview
- **Category:** Developer/Tech
- **Keywords:** minimal, dark, developer, clean, monospace, terminal, sleek, modern
- **Best For:** Software developers, engineers, full-stack developers, technical professionals
- **Inspiration:** Brittany Chiang, Josh Comeau, Lee Robinson

## Design Philosophy
Dark interfaces feel native to developers who spend hours in terminals and dark-themed IDEs. The minimal approach puts focus on content and projects, not flashy design. Subtle animations add polish without distraction.

## Color Palette

| Role | Hex Code | Usage Notes |
|------|----------|-------------|
| Background Primary | #0A0A0A | Main page background |
| Background Secondary | #141414 | Cards, sections |
| Background Tertiary | #1E1E1E | Hover states, inputs |
| Text Primary | #FAFAFA | Headlines, important text |
| Text Secondary | #A1A1A1 | Body text, descriptions |
| Accent Primary | #00D9FF | CTAs, links, highlights |
| Accent Secondary | #7C3AED | Hover states, secondary actions |
| Border/Subtle | rgba(255,255,255,0.1) | Dividers, card borders |

## Typography

| Element | Font Family | Weight | Size (Desktop) | Notes |
|---------|-------------|--------|----------------|-------|
| H1 | Inter | Bold | 64px | Tight letter-spacing (-0.02em) |
| H2 | Inter | Semibold | 40px | |
| H3 | Inter | Medium | 28px | |
| Body | Inter | Regular | 16px | Line height 1.7 |
| Code | JetBrains Mono | Regular | 14px | For inline code |
| Caption | Inter | Regular | 14px | Text secondary color |

**Font Loading:** 
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
```

## Spacing & Layout

- **Container Max Width:** 1200px
- **Section Padding:** 120px vertical
- **Grid System:** CSS Grid, 12-col
- **Base Unit:** 8px
- **Card Padding:** 24px
- **Element Gap:** 16px

## Animation Philosophy

Subtle and purposeful. Animations should feel smooth and professional, never playful or bouncy. Use ease-out for entrances, ease-in-out for transitions.

### Entrance Animations
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Headings | fade-up | 0.5s | ease-out |
| Body Text | fade-up (staggered) | 0.4s | ease-out |
| Cards | fade-up (staggered) | 0.5s | ease-out |
| Images | fade-in + scale(0.98→1) | 0.6s | ease-out |

### Interaction Animations
| Trigger | Animation | Notes |
|---------|-----------|-------|
| Button Hover | background lightens, subtle glow | 0.2s transition |
| Card Hover | translateY(-4px), border glow | 0.3s ease-out |
| Link Hover | color → accent, underline slides in | 0.2s |
| Scroll | Elements reveal on scroll-in-view | 0.5s |

## Component Styles

### Buttons
```css
.btn-primary {
  background: linear-gradient(135deg, #00D9FF 0%, #7C3AED 100%);
  color: #0A0A0A;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  transition: all 0.2s ease;
}
.btn-primary:hover {
  box-shadow: 0 0 20px rgba(0, 217, 255, 0.3);
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  color: #FAFAFA;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  padding: 12px 24px;
}
```

### Cards
```css
.card {
  background: #141414;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
}
.card:hover {
  border-color: rgba(0, 217, 255, 0.3);
  transform: translateY(-4px);
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
}
```

### Navigation
- Style: Fixed, blur background on scroll
- Background: rgba(10, 10, 10, 0.8) with backdrop-blur
- Layout: Logo left, links center, CTA right

## Section Layout Guidelines

### Hero Section
- **Layout:** Centered or left-aligned
- **Elements:** Small tag/label, large headline, short tagline, 2 CTAs, optional terminal/code animation
- **Unique Feature:** Subtle gradient orb or grid pattern in background

### About Section
- **Layout:** Two-column (text left, image/skills right)
- **Personality:** Professional but personable, focus on tech journey

### Projects/Work Section
- **Layout:** 2-3 column grid, featured project can span full width
- **Card Style:** Dark card with image, title, tech tags, brief description
- **Hover Effect:** Lift + border glow + image slight zoom

### Skills/Tech Section
- **Display:** Icon grid or categorized lists
- **Style:** Minimal icons with labels, grouped by category

### Contact Section
- **Style:** Simple heading + email link + social icons
- **Tone:** Direct and professional

## Do's and Don'ts

### Do
- Use monospace font for code snippets and tech elements
- Keep color usage minimal (mostly grayscale + one accent)
- Show real projects with GitHub links
- Add subtle hover states to everything interactive
- Use generous whitespace

### Don't
- Add colorful gradients everywhere
- Use playful or bouncy animations
- Include excessive decorative elements
- Use more than 2-3 colors beyond grayscale
