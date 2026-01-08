# Vibe: Corporate Clean

## Overview
- **Category:** Corporate/Professional
- **Keywords:** clean, professional, corporate, business, trustworthy, minimal, enterprise
- **Best For:** Consultants, business analysts, project managers, executives, enterprise professionals
- **Inspiration:** McKinsey, Deloitte, IBM, professional services firms

## Design Philosophy
Trust through simplicity. Clean lines, generous whitespace, and a refined color palette project competence and reliability. Every element serves a purpose—no decoration for decoration's sake.

## Color Palette

| Role | Hex Code | Usage Notes |
|------|----------|-------------|
| Background Primary | #FFFFFF | Main background |
| Background Secondary | #F8FAFC | Section backgrounds |
| Background Tertiary | #F1F5F9 | Cards |
| Text Primary | #0F172A | Headlines |
| Text Secondary | #64748B | Body text |
| Accent Primary | #2563EB | Brand blue - CTAs |
| Accent Secondary | #1E40AF | Hover states |
| Accent Success | #059669 | Positive indicators |
| Border/Subtle | #E2E8F0 | Dividers, borders |

## Typography

| Element | Font Family | Weight | Size (Desktop) | Notes |
|---------|-------------|--------|----------------|-------|
| H1 | Inter | Bold | 48px | Tight tracking |
| H2 | Inter | Semibold | 36px | |
| H3 | Inter | Medium | 24px | |
| Body | Inter | Regular | 16px | Line height 1.7 |
| Caption | Inter | Medium | 13px | Uppercase for labels |

**Font Loading:** 
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

## Spacing & Layout

- **Container Max Width:** 1140px
- **Section Padding:** 100px vertical
- **Grid System:** 12-column bootstrap-style
- **Base Unit:** 4px
- **Card Padding:** 24px
- **Element Gap:** 16px

## Animation Philosophy

Minimal and purposeful. Animations should be barely noticeable—smooth transitions that don't distract from content. Professional means restrained.

### Entrance Animations
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Headings | fade-in | 0.4s | ease-out |
| Body Text | fade-in | 0.3s | ease-out |
| Cards | fade-in + slight slide-up | 0.4s | ease-out |
| Images | fade-in | 0.5s | ease-out |

### Interaction Animations
| Trigger | Animation | Notes |
|---------|-----------|-------|
| Button Hover | darken background | 0.2s |
| Card Hover | subtle shadow increase | 0.2s |
| Link Hover | underline | immediate |
| Scroll | none or very subtle | minimal |

## Component Styles

### Buttons
```css
.btn-primary {
  background: #2563EB;
  color: #FFFFFF;
  border-radius: 6px;
  padding: 12px 24px;
  font-weight: 500;
  transition: background 0.2s ease;
}
.btn-primary:hover {
  background: #1E40AF;
}

.btn-secondary {
  background: #FFFFFF;
  color: #2563EB;
  border: 1px solid #2563EB;
  border-radius: 6px;
  padding: 12px 24px;
}
```

### Cards
```css
.card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 24px;
  transition: box-shadow 0.2s ease;
}
.card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
```

### Navigation
- Style: Fixed, clean white
- Background: White with bottom border on scroll
- Layout: Logo left, links center, single CTA right

## Section Layout Guidelines

### Hero Section
- **Layout:** Left-aligned text with professional image or illustration right
- **Elements:** Clear headline, value prop subheadline, 1-2 CTAs, professional photo or geometric illustration
- **Unique Feature:** Straightforward, no gimmicks

### About Section
- **Layout:** Two-column with professional headshot
- **Personality:** Professional summary, credentials, experience highlights

### Projects/Work Section
- **Layout:** Clean grid, uniform cards
- **Card Style:** Title, description, outcomes/metrics, company logo if relevant
- **Hover Effect:** Subtle shadow

### Skills/Tech Section
- **Display:** Clean list or categorized grid
- **Style:** Simple text or minimal icons

### Contact Section
- **Style:** Simple form with clear fields
- **Tone:** Professional and direct

## Do's and Don'ts

### Do
- Use plenty of whitespace
- Keep color usage minimal (mostly grayscale + blue)
- Focus on clear hierarchy
- Use real metrics and outcomes
- Maintain consistency

### Don't
- Add playful or casual elements
- Use flashy animations
- Include unnecessary decorations
- Use multiple accent colors
- Break the grid
