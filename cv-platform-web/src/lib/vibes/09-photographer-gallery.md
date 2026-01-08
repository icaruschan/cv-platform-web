# Vibe: Photographer Gallery

## Overview
- **Category:** Niche/Industry-Specific
- **Keywords:** photography, gallery, visual, portfolio, images, minimal, showcase, artist
- **Best For:** Photographers, visual artists, cinematographers, art directors, creative professionals
- **Inspiration:** High-end photography portfolios, gallery websites, photography agencies

## Design Philosophy
The work speaks for itself. Strip away everything that distracts from the images. Ultra-minimal navigation, full-bleed imagery, and whisper-quiet typography let the visual work take center stage.

## Color Palette

| Role | Hex Code | Usage Notes |
|------|----------|-------------|
| Background Primary | #FFFFFF | Clean white |
| Background Secondary | #0A0A0A | Dark mode / alternating |
| Background Gallery | #F5F5F5 | Neutral gray for image contrast |
| Text Primary | #0A0A0A | Headlines (on white) |
| Text Primary Alt | #FFFFFF | Headlines (on dark) |
| Text Secondary | #737373 | Captions, descriptions |
| Accent Primary | #0A0A0A | Minimal accent (just black) |
| Border/Subtle | rgba(0,0,0,0.08) | Very subtle dividers |

## Typography

| Element | Font Family | Weight | Size (Desktop) | Notes |
|---------|-------------|--------|----------------|-------|
| H1 | Cormorant Garamond | Light | 48px | Elegant, unobtrusive |
| H2 | Cormorant Garamond | Regular | 32px | |
| H3 | Inter | Light | 18px | Sans contrast |
| Body | Inter | Light | 15px | Line height 1.7 |
| Caption | Inter | Regular | 11px | Uppercase, wide tracking |

**Font Loading:** 
```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Inter:wght@300;400&display=swap" rel="stylesheet">
```

## Spacing & Layout

- **Container Max Width:** Full-width (edge to edge)
- **Section Padding:** Minimal (40-60px) or none
- **Grid System:** Masonry or full-bleed single column
- **Base Unit:** 8px
- **Card Padding:** 0 (images bleed to edge)
- **Element Gap:** 8px (tight gallery) or 0

## Animation Philosophy

Nearly invisible. Animations should be like a gallery curator silently adjusting a frame—you shouldn't notice them happening. Slow fades, minimal movement.

### Entrance Animations
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Images | fade-in | 0.8s | ease-out |
| Text | fade-in | 0.6s | ease-out |
| Gallery items | staggered fade | 0.4s each | ease-out |

### Interaction Animations
| Trigger | Animation | Notes |
|---------|-----------|-------|
| Image Hover | slight zoom (1.02) | 0.6s smooth |
| Link Hover | opacity change | 0.2s |
| Gallery filter | crossfade | 0.4s |
| Lightbox | fade-in overlay | 0.3s |

## Component Styles

### Buttons
```css
.btn-primary {
  background: transparent;
  color: #0A0A0A;
  border: 1px solid #0A0A0A;
  border-radius: 0;
  padding: 12px 24px;
  font-weight: 400;
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  transition: all 0.3s ease;
}
.btn-primary:hover {
  background: #0A0A0A;
  color: #FFFFFF;
}
```

### Image Cards
```css
.gallery-item {
  position: relative;
  overflow: hidden;
  cursor: pointer;
}
.gallery-item img {
  display: block;
  width: 100%;
  transition: transform 0.6s ease;
}
.gallery-item:hover img {
  transform: scale(1.02);
}
.gallery-item .caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: linear-gradient(transparent, rgba(0,0,0,0.5));
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.gallery-item:hover .caption {
  opacity: 1;
}
```

### Navigation
- Style: Fixed, minimal, disappears on scroll
- Background: Transparent
- Layout: Single line—name left, minimal links right

## Section Layout Guidelines

### Hero Section
- **Layout:** Full-screen hero image or video
- **Elements:** Just the image, maybe small name overlay in corner
- **Unique Feature:** Immediate visual impact, no text distraction

### About Section
- **Layout:** Minimal—small photo, brief bio, contact info
- **Personality:** Third-person artist statement or very brief personal note

### Projects/Work Section (Main Focus)
- **Layout:** Full-bleed masonry or single-column stacked
- **Card Style:** Just images, maybe series titles on hover
- **Hover Effect:** Subtle zoom, caption reveal

### Skills/Tech Section
- **Display:** Not included or minimal (equipment list)
- **Style:** Simple text list if present

### Contact Section
- **Style:** Email and social links only
- **Tone:** "Available for commissions" / minimal

## Do's and Don'ts

### Do
- Let images fill the screen
- Use generous negative space
- Keep navigation minimal
- Use high-quality images only
- Create a gallery-like experience

### Don't
- Add cluttered UI elements
- Use heavy typography
- Include distracting colors
- Add playful animations
- Put text over images unnecessarily
