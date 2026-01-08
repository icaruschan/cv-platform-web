# Vibe: Dark Elegant

## Overview
- **Category:** Artistic/Expressive  
- **Keywords:** elegant, dark, luxury, sophisticated, noir, refined, premium, mysterious
- **Best For:** Photographers, luxury brand designers, fashion professionals, high-end creatives
- **Inspiration:** Apple Pro products, luxury fashion brands, high-end photography portfolios

## Design Philosophy
Sophistication through restraint. Deep blacks, refined typography, and careful use of space create a luxury experience. Less is more—every element should feel intentional and premium.

## Color Palette

| Role | Hex Code | Usage Notes |
|------|----------|-------------|
| Background Primary | #000000 | True black |
| Background Secondary | #0A0A0A | Subtle sections |
| Background Tertiary | #141414 | Cards |
| Text Primary | #FFFFFF | Headlines |
| Text Secondary | #A3A3A3 | Body text |
| Text Tertiary | #737373 | Captions |
| Accent Primary | #D4AF37 | Gold - luxury accent |
| Accent Secondary | #B8860B | Darker gold |
| Border/Subtle | rgba(255,255,255,0.08) | Subtle dividers |

## Typography

| Element | Font Family | Weight | Size (Desktop) | Notes |
|---------|-------------|--------|----------------|-------|
| H1 | Cormorant Garamond | Light | 72px | Elegant serif |
| H2 | Cormorant Garamond | Regular | 48px | |
| H3 | Inter | Light | 24px | Sans-serif contrast |
| Body | Inter | Light | 16px | Line height 1.8 |
| Caption | Inter | Regular | 12px | Uppercase, tracked wide |

**Font Loading:** 
```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Inter:wght@300;400&display=swap" rel="stylesheet">
```

## Spacing & Layout

- **Container Max Width:** 1400px (expansive)
- **Section Padding:** 160px vertical (generous)
- **Grid System:** Asymmetric, gallery-style
- **Base Unit:** 8px
- **Card Padding:** 40px
- **Element Gap:** 32px

## Animation Philosophy

Graceful and measured. Animations should feel like slow camera movements in a luxury commercial—smooth, deliberate, and elegant. Never rushed.

### Entrance Animations
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Headings | fade-in + slight scale | 1s | cubic-bezier(0.16, 1, 0.3, 1) |
| Body Text | fade-in | 0.8s | ease-out |
| Cards | reveal (clip-path) | 1s | ease-out |
| Images | slow zoom reveal | 1.2s | ease-out |

### Interaction Animations
| Trigger | Animation | Notes |
|---------|-----------|-------|
| Button Hover | gold glow + subtle scale | 0.4s |
| Card Hover | image subtle zoom | 0.6s |
| Link Hover | gold color + fade underline | 0.3s |
| Scroll | parallax on images | subtle, slow |

## Component Styles

### Buttons
```css
.btn-primary {
  background: transparent;
  color: #D4AF37;
  border: 1px solid #D4AF37;
  border-radius: 0;
  padding: 16px 40px;
  font-weight: 400;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-size: 12px;
  transition: all 0.4s ease;
}
.btn-primary:hover {
  background: #D4AF37;
  color: #000000;
}
```

### Cards
```css
.card {
  background: #0A0A0A;
  border: none;
  padding: 0;
  overflow: hidden;
}
.card img {
  transition: transform 0.6s ease;
}
.card:hover img {
  transform: scale(1.05);
}
```

### Navigation
- Style: Fixed, minimal
- Background: Transparent → black on scroll
- Layout: Logo center or left (refined wordmark), links minimal, no heavy CTAs

## Section Layout Guidelines

### Hero Section
- **Layout:** Full-screen image or video with minimal overlay text
- **Elements:** One powerful headline, subtle scroll indicator
- **Unique Feature:** Cinematic, full-bleed imagery

### About Section
- **Layout:** Asymmetric, image dominant
- **Personality:** Third-person or minimal first-person, refined tone

### Projects/Work Section
- **Layout:** Large images, gallery or masonry
- **Card Style:** Image-first, minimal text overlay on hover
- **Hover Effect:** Subtle zoom + text reveal

### Skills/Tech Section
- **Display:** Minimal or hidden entirely
- **Style:** If included, simple text list

### Contact Section
- **Style:** Single line of text, email only
- **Tone:** "For inquiries" - formal and refined

## Do's and Don'ts

### Do
- Use generous whitespace (or "blackspace")
- Let images speak
- Use refined serif typography for headlines
- Add gold sparingly for luxury feel
- Keep animations slow and graceful

### Don't
- Add too much text
- Use bright or saturated colors
- Include playful elements
- Use rounded corners
- Rush animations
