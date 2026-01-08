# Vibe: Warm Friendly

## Overview
- **Category:** Mood-Based
- **Keywords:** warm, friendly, approachable, personal, cozy, inviting, human, soft
- **Best For:** Freelancers, coaches, educators, writers, personal brands, solopreneurs
- **Inspiration:** Personal blogs, lifestyle brands, friendly SaaS products

## Design Philosophy
Feel like a warm conversation with a friend. Natural colors, rounded shapes, and approachable typography create an inviting atmosphere. This vibe says "I'm a real person you'll enjoy working with."

## Color Palette

| Role | Hex Code | Usage Notes |
|------|----------|-------------|
| Background Primary | #FFFBF5 | Warm cream base |
| Background Secondary | #FFF7ED | Peachy cream |
| Background Tertiary | #FFFFFF | Cards |
| Text Primary | #1C1917 | Warm black |
| Text Secondary | #78716C | Warm gray |
| Accent Primary | #EA580C | Warm orange |
| Accent Secondary | #F59E0B | Golden amber |
| Accent Tertiary | #059669 | Natural green |
| Border/Subtle | #E7E5E4 | Warm border |

## Typography

| Element | Font Family | Weight | Size (Desktop) | Notes |
|---------|-------------|--------|----------------|-------|
| H1 | Outfit | Bold | 52px | Friendly, rounded |
| H2 | Outfit | Semibold | 38px | |
| H3 | Outfit | Medium | 26px | |
| Body | Source Sans 3 | Regular | 17px | Line height 1.8 |
| Caption | Source Sans 3 | Medium | 14px | |

**Font Loading:** 
```html
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600&display=swap" rel="stylesheet">
```

## Spacing & Layout

- **Container Max Width:** 1000px (more intimate)
- **Section Padding:** 100px vertical
- **Grid System:** Simple layouts, rarely more than 2 columns
- **Base Unit:** 8px
- **Card Padding:** 32px
- **Element Gap:** 24px

## Animation Philosophy

Gentle and welcoming. Animations should feel like a friendly wave—subtle, warm, and never startling. Soft entrances and smooth transitions.

### Entrance Animations
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Headings | fade-up | 0.6s | ease-out |
| Body Text | fade-up | 0.5s | ease-out |
| Cards | fade-up with slight scale | 0.5s | ease-out |
| Images | fade-in | 0.6s | ease-out |

### Interaction Animations
| Trigger | Animation | Notes |
|---------|-----------|-------|
| Button Hover | warm color shift + scale(1.02) | 0.2s |
| Card Hover | gentle lift + warm shadow | 0.3s |
| Link Hover | color shift + underline | 0.2s |
| Scroll | soft parallax on images | subtle |

## Component Styles

### Buttons
```css
.btn-primary {
  background: #EA580C;
  color: #FFFFFF;
  border-radius: 50px;
  padding: 14px 32px;
  font-weight: 600;
  transition: all 0.2s ease;
}
.btn-primary:hover {
  background: #DC2626;
  transform: scale(1.02);
}

.btn-secondary {
  background: transparent;
  color: #EA580C;
  border: 2px solid #EA580C;
  border-radius: 50px;
  padding: 12px 30px;
}
```

### Cards
```css
.card {
  background: #FFFFFF;
  border: 1px solid #E7E5E4;
  border-radius: 16px;
  padding: 32px;
  transition: all 0.3s ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(28, 25, 23, 0.08);
}
```

### Navigation
- Style: Simple, fixed or static
- Background: Cream/transparent
- Layout: Logo left (can be friendly/illustrated), links right, warm CTA

## Section Layout Guidelines

### Hero Section
- **Layout:** Centered or split with friendly photo
- **Elements:** Warm greeting headline, personal tagline, approachable photo, single warm CTA
- **Unique Feature:** Feels like meeting someone in person

### About Section
- **Layout:** Story-driven, conversational tone
- **Personality:** First-person narrative, personal story, relatable

### Projects/Work Section
- **Layout:** Simple cards or case study format
- **Card Style:** Warm images, friendly descriptions
- **Hover Effect:** Gentle lift

### Skills/Tech Section
- **Display:** Casual list or friendly icons
- **Style:** Not too technical, approachable language

### Contact Section
- **Style:** "Let's chat" energy, simple form or just email
- **Tone:** Friendly and inviting

## Do's and Don'ts

### Do
- Use warm, natural colors
- Add rounded corners everywhere
- Write in first person
- Include real, smiling photos
- Create an approachable vibe

### Don't
- Use cold blues or grays
- Make it feel corporate
- Use formal language
- Add sharp corners
- Feel impersonal
