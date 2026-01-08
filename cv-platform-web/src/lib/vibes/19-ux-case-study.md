# Vibe: UX Case Study

## Overview
- **Category:** Niche/Industry-Specific
- **Keywords:** ux, case study, product design, research, process, figma, user experience, portfolio
- **Best For:** UX designers, product designers, UI designers, design researchers
- **Inspiration:** Figma's design, Notion, modern design portfolios

## Design Philosophy
Show your process. UX portfolios need to demonstrate thinking, not just visuals. Clean layouts, clear sections, and narrative flow guide readers through your design decisions.

## Color Palette

| Role | Hex Code | Usage Notes |
|------|----------|-------------|
| Background Primary | #FFFFFF | Clean white |
| Background Secondary | #F9FAFB | Gray sections |
| Background Tertiary | #F3F4F6 | Cards, callouts |
| Text Primary | #111827 | Headlines |
| Text Secondary | #6B7280 | Body text |
| Accent Primary | #7C3AED | Purple (Figma-esque) |
| Accent Secondary | #EC4899 | Pink highlight |
| Border/Subtle | #E5E7EB | Dividers |

## Typography

| Element | Font Family | Weight | Size (Desktop) | Notes |
|---------|-------------|--------|----------------|-------|
| H1 | Inter | Bold | 48px | Project titles |
| H2 | Inter | Semibold | 32px | Section headers |
| H3 | Inter | Medium | 22px | Subsections |
| Body | Inter | Regular | 17px | Line height 1.8, max-width 680px |
| Caption | Inter | Medium | 13px | Image labels |
| Quote | Inter | Regular Italic | 20px | Pull quotes |

**Font Loading:** 
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

## Spacing & Layout

- **Container Max Width:** 900px for reading, full for images
- **Section Padding:** 80px vertical
- **Grid System:** Single column content, 2-3 col for comparisons
- **Base Unit:** 8px
- **Card Padding:** 32px
- **Element Gap:** 24px

## Animation Philosophy

Minimal. The content is king. Subtle scroll reveals help pace the reading, but nothing should distract from the case study narrative.

### Entrance Animations
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Text | fade-up (subtle) | 0.4s | ease-out |
| Images | fade-in | 0.5s | ease-out |
| Sections | reveal on scroll | 0.4s | ease-out |

### Interaction Animations
| Trigger | Animation | Notes |
|---------|-----------|-------|
| Image Hover | slight zoom or lightbox | 0.3s |
| Link Hover | underline + color | 0.2s |
| Card Hover | subtle shadow | 0.2s |

## Component Styles

### Section Headers
```css
.section-header {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #7C3AED;
  margin-bottom: 12px;
}
```

### Image Containers
```css
.image-container {
  background: #F3F4F6;
  border-radius: 12px;
  padding: 24px;
  margin: 32px 0;
}
.image-container img {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.image-container .caption {
  text-align: center;
  margin-top: 12px;
  font-size: 13px;
  color: #6B7280;
}
```

### Callout Box
```css
.callout {
  background: #F3F4F6;
  border-left: 4px solid #7C3AED;
  padding: 20px 24px;
  border-radius: 0 8px 8px 0;
  margin: 24px 0;
}
```

### Navigation
- Style: Fixed, minimal
- Background: White with subtle shadow
- Layout: Name left, case study links center, contact right

## Section Layout Guidelines

### Hero Section (Case Study Intro)
- **Layout:** Large title, role/timeline/tools summary
- **Elements:** Project name, brief description, hero image, metadata bar
- **Unique Feature:** Quick stats (timeline, team size, my role)

### Problem Section
- **Layout:** Full-width text block
- **Content:** User problems, business goals, constraints

### Research Section
- **Layout:** Text + supporting images/diagrams
- **Content:** User interviews, surveys, competitive analysis

### Ideation/Design Section
- **Layout:** Image-heavy with annotations
- **Content:** Wireframes, iterations, design decisions

### Solution Section
- **Layout:** Full mockups, before/after comparisons
- **Content:** Final designs, interactions, prototypes

### Results Section
- **Layout:** Metrics cards or impact summary
- **Content:** Outcomes, learnings, next steps

### Contact Section
- **Style:** Simple CTA for inquiries
- **Tone:** "Let's design together"

## Do's and Don'ts

### Do
- Show process, not just finals
- Use clear section headers
- Include real metrics and outcomes
- Add annotations to design images
- Keep text readable (max 680px width)

### Don't
- Only show pretty mockups
- Write walls of text
- Forget mobile views of your work
- Skip the problem statement
- Make navigation confusing
