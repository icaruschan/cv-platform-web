# Vibe: Soft Gradients

## Overview
- **Category:** Creative/Designer
- **Keywords:** gradient, soft, modern, saas, startup, aurora, dreamy, elegant
- **Best For:** Product designers, UX designers, startup founders, tech creatives
- **Inspiration:** Linear, Stripe, Vercel, modern SaaS landing pages

## Design Philosophy
Embrace the beauty of smooth color transitions. Soft gradients create depth and visual interest without being overwhelming. This vibe feels premium, modern, and sophisticated—perfect for designers who appreciate subtle beauty.

## Color Palette

| Role | Hex Code | Usage Notes |
|------|----------|-------------|
| Background Primary | #FAFAFA | Clean light base |
| Background Secondary | #FFFFFF | Cards |
| Gradient Start | #667EEA | Blue-purple |
| Gradient End | #764BA2 | Purple |
| Gradient Alt Start | #F093FB | Pink |
| Gradient Alt End | #F5576C | Coral |
| Text Primary | #1A1A2E | Headlines |
| Text Secondary | #6B7280 | Body text |
| Accent Primary | #667EEA | Links, CTAs |
| Border/Subtle | rgba(0,0,0,0.06) | Dividers |

## Typography

| Element | Font Family | Weight | Size (Desktop) | Notes |
|---------|-------------|--------|----------------|-------|
| H1 | Inter | Bold | 56px | Gradient text possible |
| H2 | Inter | Semibold | 42px | |
| H3 | Inter | Medium | 28px | |
| Body | Inter | Regular | 17px | Line height 1.7 |
| Caption | Inter | Medium | 13px | Uppercase, tracked |

**Font Loading:** 
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

## Spacing & Layout

- **Container Max Width:** 1200px
- **Section Padding:** 120px vertical
- **Grid System:** 12-column
- **Base Unit:** 8px
- **Card Padding:** 32px
- **Element Gap:** 24px

## Animation Philosophy

Smooth and elegant. Animations should feel like floating through clouds—gentle, continuous, and soothing. Gradient shifts and soft fades create a dreamy experience.

### Entrance Animations
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Headings | fade-up | 0.6s | cubic-bezier(0.16, 1, 0.3, 1) |
| Body Text | fade-up (staggered) | 0.5s | ease-out |
| Cards | fade-up + scale(0.95→1) | 0.6s | ease-out |
| Images | fade-in | 0.7s | ease-out |

### Interaction Animations
| Trigger | Animation | Notes |
|---------|-----------|-------|
| Button Hover | gradient shift + shadow grow | 0.3s |
| Card Hover | lift + soft shadow | 0.3s |
| Link Hover | underline + color shift | 0.2s |
| Background | subtle gradient animation | continuous 10s |

## Component Styles

### Buttons
```css
.btn-primary {
  background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
  color: #FFFFFF;
  border-radius: 12px;
  padding: 14px 32px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4);
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
}

.btn-secondary {
  background: #FFFFFF;
  color: #667EEA;
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  padding: 14px 32px;
}
```

### Cards
```css
.card {
  background: #FFFFFF;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 16px;
  padding: 32px;
  transition: all 0.3s ease;
}
.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.2);
}
```

### Navigation
- Style: Fixed, white with subtle shadow on scroll
- Background: White or frosted glass
- Layout: Logo left, links center, gradient CTA right

## Section Layout Guidelines

### Hero Section
- **Layout:** Centered with gradient orbs in background
- **Elements:** Badge/tag, large headline (possibly gradient text), subheadline, 2 CTAs, soft gradient orbs behind
- **Unique Feature:** Aurora-like gradient blobs animating subtly

### About Section
- **Layout:** Two-column, image with gradient overlay
- **Personality:** Professional but warm, approachable

### Projects/Work Section
- **Layout:** Clean grid, consistent card sizes
- **Card Style:** White cards with large images, gradient hover effects
- **Hover Effect:** Soft lift + gradient border

### Skills/Tech Section
- **Display:** Icon pills or badges with subtle gradient backgrounds
- **Style:** Clean, organized, modern

### Contact Section
- **Style:** Simple form with gradient accent elements
- **Tone:** Friendly and inviting

## Do's and Don'ts

### Do
- Use smooth, multi-stop gradients
- Add gradient orbs/blobs in backgrounds
- Keep plenty of whitespace
- Use gradient text for key headlines
- Add subtle continuous animations to gradients

### Don't
- Use harsh color combinations
- Make gradients too saturated or neon
- Overcrowd the layout
- Use sharp corners everywhere
- Forget the soft, dreamy feeling
