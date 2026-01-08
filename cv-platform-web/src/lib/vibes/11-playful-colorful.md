# Vibe: Playful Colorful

## Overview
- **Category:** Mood-Based
- **Keywords:** playful, colorful, fun, energetic, youthful, vibrant, joyful, animated
- **Best For:** Content creators, educators, game designers, social media managers, kids-focused professionals
- **Inspiration:** Notion's marketing, Duolingo, Figma, playful product sites

## Design Philosophy
Life's too short for boring portfolios. Embrace joy with bouncy animations, colorful illustrations, and unexpected delights. Every interaction should spark a smile.

## Color Palette

| Role | Hex Code | Usage Notes |
|------|----------|-------------|
| Background Primary | #FFFEF5 | Warm cream |
| Background Secondary | #FEF3C7 | Soft yellow |
| Background Accent | #DBEAFE | Soft blue sections |
| Text Primary | #1E1B4B | Deep purple-black |
| Text Secondary | #6B7280 | Neutral gray |
| Accent Primary | #F472B6 | Hot pink |
| Accent Secondary | #34D399 | Mint green |
| Accent Tertiary | #A78BFA | Purple |
| Accent Quaternary | #FBBF24 | Golden yellow |
| Border/Subtle | #E5E7EB | Light gray |

## Typography

| Element | Font Family | Weight | Size (Desktop) | Notes |
|---------|-------------|--------|----------------|-------|
| H1 | Nunito | ExtraBold | 56px | Rounded, friendly |
| H2 | Nunito | Bold | 40px | |
| H3 | Nunito | Semibold | 28px | |
| Body | Nunito | Regular | 17px | Line height 1.7 |
| Caption | Nunito | Medium | 14px | |

**Font Loading:** 
```html
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
```

## Spacing & Layout

- **Container Max Width:** 1100px
- **Section Padding:** 100px vertical
- **Grid System:** Playful, slightly irregular
- **Base Unit:** 8px
- **Card Padding:** 28px
- **Element Gap:** 24px

## Animation Philosophy

Bouncy and delightful! Animations should feel like a happy bounce. Use spring physics, playful delays, and micro-interactions that reward engagement.

### Entrance Animations
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Headings | bounce-in | 0.6s | spring(1, 100, 10, 0) |
| Body Text | fade-up with wobble | 0.5s | ease-out |
| Cards | pop-in with scale | 0.4s | spring |
| Images | bounce-scale | 0.5s | spring |

### Interaction Animations
| Trigger | Animation | Notes |
|---------|-----------|-------|
| Button Hover | bounce scale(1.08) + color | 0.3s spring |
| Card Hover | tilt + wobble + shadow | 0.3s |
| Link Hover | underline bounce + emoji | 0.2s |
| Scroll | staggered pop-in | playful delays |

## Component Styles

### Buttons
```css
.btn-primary {
  background: linear-gradient(135deg, #F472B6 0%, #A78BFA 100%);
  color: #FFFFFF;
  border-radius: 50px;
  padding: 16px 32px;
  font-weight: 700;
  font-size: 16px;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 4px 14px rgba(244, 114, 182, 0.4);
}
.btn-primary:hover {
  transform: scale(1.08) rotate(-2deg);
  box-shadow: 0 8px 25px rgba(244, 114, 182, 0.5);
}
```

### Cards
```css
.card {
  background: #FFFFFF;
  border: 2px solid #E5E7EB;
  border-radius: 20px;
  padding: 28px;
  transition: all 0.3s ease;
}
.card:hover {
  transform: translateY(-8px) rotate(1deg);
  border-color: #F472B6;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}
```

### Navigation
- Style: Fixed, colorful
- Background: White with colored underline on active
- Layout: Fun logo/illustration left, bouncy links right

## Section Layout Guidelines

### Hero Section
- **Layout:** Centered with floating illustrations
- **Elements:** Big friendly headline, fun emoji or illustration, colorful CTAs
- **Unique Feature:** Floating animated elements, maybe confetti on load

### About Section
- **Layout:** Illustrated avatar + fun facts
- **Personality:** First-person, casual, uses emoji 🎉

### Projects/Work Section
- **Layout:** Colorful card grid
- **Card Style:** Each card different accent color
- **Hover Effect:** Wobble + pop

### Skills/Tech Section
- **Display:** Colorful badges or illustrated icons
- **Style:** Gamified, maybe with progress animations

### Contact Section
- **Style:** "Say hi! 👋" with fun form
- **Tone:** Friendly, casual, inviting

## Do's and Don'ts

### Do
- Use multiple bright colors
- Add playful micro-interactions
- Include illustrations or emoji
- Make buttons feel clickable
- Add surprise and delight moments

### Don't
- Be corporate or serious
- Use dark, moody colors
- Keep animations subtle
- Use formal language
- Forget to have fun
