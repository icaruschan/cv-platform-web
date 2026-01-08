# Vibe: Nature Organic

## Overview
- **Category:** Mood-Based
- **Keywords:** nature, organic, earthy, sustainable, green, natural, eco, calm, grounded
- **Best For:** Sustainability consultants, environmental professionals, wellness coaches, eco-brands
- **Inspiration:** Patagonia, organic brands, nature photography, wellness apps

## Design Philosophy
Ground in nature. Earthy tones, organic shapes, and natural textures create a calming, authentic experience. Like taking a deep breath in a forest.

## Color Palette

| Role | Hex Code | Usage Notes |
|------|----------|-------------|
| Background Primary | #FDFBF7 | Warm off-white (natural paper) |
| Background Secondary | #F5F0E8 | Tan/beige |
| Background Tertiary | #EBE4D8 | Deeper tan |
| Text Primary | #1F2421 | Forest dark |
| Text Secondary | #4A5043 | Moss gray-green |
| Accent Primary | #2D6A4F | Deep forest green |
| Accent Secondary | #95D5B2 | Soft sage |
| Accent Tertiary | #D4A373 | Warm terracotta |
| Border/Subtle | #D9D0C0 | Natural border |

## Typography

| Element | Font Family | Weight | Size (Desktop) | Notes |
|---------|-------------|--------|----------------|-------|
| H1 | Fraunces | Semibold | 52px | Organic serif |
| H2 | Fraunces | Medium | 36px | |
| H3 | DM Sans | Medium | 24px | |
| Body | DM Sans | Regular | 17px | Line height 1.8 |
| Caption | DM Sans | Medium | 13px | |

**Font Loading:** 
```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
```

## Spacing & Layout

- **Container Max Width:** 1100px
- **Section Padding:** 120px vertical
- **Grid System:** Organic, flowing layouts
- **Base Unit:** 8px
- **Card Padding:** 32px
- **Element Gap:** 24px

## Animation Philosophy

Gentle and natural. Animations should feel like leaves falling or water flowing—organic, peaceful, never jarring. Think smooth fades and subtle movements.

### Entrance Animations
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Headings | fade-up | 0.7s | ease-out |
| Body Text | fade-up (staggered) | 0.5s | ease-out |
| Cards | gentle rise | 0.6s | ease-out |
| Images | fade-in | 0.8s | ease-out |

### Interaction Animations
| Trigger | Animation | Notes |
|---------|-----------|-------|
| Button Hover | background darken, subtle grow | 0.3s |
| Card Hover | gentle lift, shadow grow | 0.3s |
| Link Hover | underline + color shift | 0.2s |
| Scroll | subtle parallax on images | gentle |

## Component Styles

### Buttons
```css
.btn-primary {
  background: #2D6A4F;
  color: #FFFFFF;
  border-radius: 50px;
  padding: 14px 32px;
  font-weight: 500;
  transition: all 0.3s ease;
}
.btn-primary:hover {
  background: #1B4332;
  transform: scale(1.02);
}

.btn-secondary {
  background: transparent;
  color: #2D6A4F;
  border: 2px solid #2D6A4F;
  border-radius: 50px;
  padding: 12px 30px;
}
```

### Cards
```css
.card {
  background: #FFFFFF;
  border: 1px solid #D9D0C0;
  border-radius: 16px;
  padding: 32px;
  transition: all 0.3s ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(31, 36, 33, 0.08);
}
```

### Navigation
- Style: Fixed or static, warm
- Background: Background color, simple
- Layout: Organic logo left, minimal links right

## Section Layout Guidelines

### Hero Section
- **Layout:** Split with nature image or centered with texture background
- **Elements:** Warm headline, short tagline, single CTA, nature photography
- **Unique Feature:** Organic shapes, maybe overlapping leaf/plant elements

### About Section
- **Layout:** Flowing text with embedded image
- **Personality:** First-person, values-focused, mission-driven

### Projects/Work Section
- **Layout:** Soft grid, rounded corners
- **Card Style:** Natural images, earthy overlays
- **Hover Effect:** Gentle lift

### Skills/Tech Section
- **Display:** Simple list or organic tag cloud
- **Style:** Muted, not techy

### Contact Section
- **Style:** Warm, inviting form or simple email
- **Tone:** "Let's grow something together"

## Do's and Don'ts

### Do
- Use warm, earthy tones
- Include natural textures (paper, wood, leaves)
- Add organic, curvy shapes
- Keep it calming and peaceful
- Use high-quality nature photography

### Don't
- Use harsh, neon colors
- Add aggressive animations
- Make it feel corporate
- Use sharp, angular shapes
- Forget the human/natural touch
