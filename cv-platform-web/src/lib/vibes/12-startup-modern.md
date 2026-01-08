# Vibe: Startup Modern

## Overview
- **Category:** Corporate/Professional
- **Keywords:** startup, modern, tech, saas, product, innovative, clean, scalable
- **Best For:** Startup founders, product managers, tech entrepreneurs, growth marketers
- **Inspiration:** Linear, Vercel, Stripe, modern tech company sites

## Design Philosophy
Ship fast, look premium. Clean interfaces, subtle gradients, and polished micro-interactions convey innovation without being flashy. Every pixel should feel intentional.

## Color Palette

| Role | Hex Code | Usage Notes |
|------|----------|-------------|
| Background Primary | #FFFFFF | Clean white |
| Background Secondary | #FAFAFA | Subtle sections |
| Background Dark | #09090B | Dark sections for contrast |
| Text Primary | #18181B | Near-black |
| Text Secondary | #71717A | Zinc gray |
| Text On Dark | #FAFAFA | White text on dark |
| Accent Primary | #6366F1 | Indigo |
| Accent Secondary | #8B5CF6 | Purple |
| Border/Subtle | #E4E4E7 | Zinc border |

## Typography

| Element | Font Family | Weight | Size (Desktop) | Notes |
|---------|-------------|--------|----------------|-------|
| H1 | Inter | Semibold | 52px | Tracking -0.02em |
| H2 | Inter | Semibold | 38px | |
| H3 | Inter | Medium | 24px | |
| Body | Inter | Regular | 16px | Line height 1.6 |
| Caption | Inter | Medium | 13px | Uppercase for tags |

**Font Loading:** 
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

## Spacing & Layout

- **Container Max Width:** 1280px
- **Section Padding:** 120px vertical
- **Grid System:** 12-column
- **Base Unit:** 4px
- **Card Padding:** 24px
- **Element Gap:** 16px

## Animation Philosophy

Smooth and intentional. Animations should feel like a well-crafted product—polished, predictable, and purposeful. Nothing surprising, everything refined.

### Entrance Animations
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Headings | fade-up | 0.5s | cubic-bezier(0.16, 1, 0.3, 1) |
| Body Text | fade-up (staggered) | 0.4s | ease-out |
| Cards | fade-up | 0.5s | ease-out |
| Images | fade-in | 0.6s | ease-out |

### Interaction Animations
| Trigger | Animation | Notes |
|---------|-----------|-------|
| Button Hover | subtle lift + shadow | 0.2s |
| Card Hover | lift + border glow | 0.2s |
| Link Hover | underline slide | 0.15s |
| Toggle | smooth switch | 0.2s |

## Component Styles

### Buttons
```css
.btn-primary {
  background: #18181B;
  color: #FAFAFA;
  border-radius: 8px;
  padding: 12px 20px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
}
.btn-primary:hover {
  background: #27272A;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.btn-secondary {
  background: #FFFFFF;
  color: #18181B;
  border: 1px solid #E4E4E7;
  border-radius: 8px;
  padding: 12px 20px;
}
```

### Cards
```css
.card {
  background: #FFFFFF;
  border: 1px solid #E4E4E7;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s ease;
}
.card:hover {
  border-color: #A1A1AA;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}
```

### Navigation
- Style: Fixed, minimal
- Background: White with subtle border bottom
- Layout: Logo left, links center, dark CTA right

## Section Layout Guidelines

### Hero Section
- **Layout:** Centered text, optional product screenshot below
- **Elements:** Badge/tag, clear headline, subheadline, 2 CTAs (primary dark, secondary outlined)
- **Unique Feature:** Maybe a subtle grid pattern or gradient orb in background

### About Section
- **Layout:** Split—text left, metrics or image right
- **Personality:** Professional, achievements-focused

### Projects/Work Section
- **Layout:** Clean grid, consistent cards
- **Card Style:** Image top, title/description below, tech tags
- **Hover Effect:** Subtle lift + border

### Skills/Tech Section
- **Display:** Icon grid or categorized list
- **Style:** Clean, organized badges

### Contact Section
- **Style:** Simple—email + social links
- **Tone:** Professional and direct

## Do's and Don'ts

### Do
- Use plenty of whitespace
- Keep components consistent
- Add subtle hover states
- Use dark/light contrast for CTAs
- Make it feel polished

### Don't
- Over-animate
- Use too many colors
- Add decorative elements
- Make it feel cheap
- Forget mobile responsiveness
