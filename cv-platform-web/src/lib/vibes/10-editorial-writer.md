# Vibe: Editorial Writer

## Overview
- **Category:** Niche/Industry-Specific
- **Keywords:** editorial, writer, journalist, author, longform, magazine, literary, sophisticated
- **Best For:** Writers, journalists, authors, content strategists, editors, copywriters
- **Inspiration:** Medium, New York Times, literary magazines, author websites

## Design Philosophy
Words are the hero. Beautiful typography, generous line height, and focused reading experiences put the writing front and center. Think of a well-designed book or premium magazine.

## Color Palette

| Role | Hex Code | Usage Notes |
|------|----------|-------------|
| Background Primary | #FDFCFA | Warm off-white (paper-like) |
| Background Secondary | #FFFFFF | Article backgrounds |
| Background Tertiary | #F5F3EF | Subtle sections |
| Text Primary | #1A1A1A | Article text |
| Text Secondary | #666666 | Meta info, captions |
| Accent Primary | #B8372B | Editorial red (links) |
| Accent Secondary | #2563EB | Alternate blue |
| Border/Subtle | #E8E5DF | Warm dividers |

## Typography

| Element | Font Family | Weight | Size (Desktop) | Notes |
|---------|-------------|--------|----------------|-------|
| H1 | Playfair Display | Bold | 56px | Elegant serif |
| H2 | Playfair Display | Semibold | 36px | |
| H3 | Playfair Display | Medium | 24px | |
| Body | Source Serif 4 | Regular | 19px | Line height 1.85, 65ch max |
| Meta | Inter | Regular | 13px | Dates, categories |
| Byline | Inter | Medium | 14px | Author attribution |

**Font Loading:** 
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Source+Serif+4:wght@400;500&family=Inter:wght@400;500&display=swap" rel="stylesheet">
```

## Spacing & Layout

- **Container Max Width:** 720px for articles (optimal reading width)
- **Section Padding:** 80px vertical
- **Grid System:** Single column, centered
- **Base Unit:** 8px
- **Paragraph Spacing:** 1.5em
- **Element Gap:** 24px

## Animation Philosophy

Nearly none. Reading should be distraction-free. Only subtle page transitions and link hover states. The focus is content, not motion.

### Entrance Animations
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Text | none or very subtle fade | 0.4s | ease-out |
| Images | fade-in | 0.5s | ease-out |

### Interaction Animations
| Trigger | Animation | Notes |
|---------|-----------|-------|
| Link Hover | underline + color | immediate |
| Article Card Hover | subtle shadow | 0.2s |
| Reading Progress | top bar fill | scroll-based |

## Component Styles

### Links
```css
a {
  color: #B8372B;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
  transition: color 0.2s ease;
}
a:hover {
  color: #1A1A1A;
}
```

### Article Cards
```css
.article-card {
  padding: 32px 0;
  border-bottom: 1px solid #E8E5DF;
}
.article-card:hover .title {
  color: #B8372B;
}
.article-card .meta {
  font-family: Inter, sans-serif;
  font-size: 13px;
  color: #666666;
  margin-bottom: 8px;
}
.article-card .title {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  font-weight: 600;
  line-height: 1.3;
  transition: color 0.2s ease;
}
```

### Navigation
- Style: Fixed or static, minimal
- Background: Background color, simple
- Layout: Name/logo left, minimal links right (About, Writing, Contact)

## Section Layout Guidelines

### Hero Section
- **Layout:** Minimal—just name and tagline, or featured article
- **Elements:** Author name, brief tagline or role, maybe recent publication
- **Unique Feature:** Focus on the writing, not flashy visuals

### About Section
- **Layout:** Single column, bio-style
- **Personality:** First-person narrative, literary tone, publications listed

### Projects/Work Section (Writing Samples)
- **Layout:** List format with article titles, excerpts, dates
- **Card Style:** Text-focused, minimal imagery
- **Hover Effect:** Title color change

### Skills/Tech Section
- **Display:** Not typical—maybe "Areas of Expertise" or "Topics"
- **Style:** Simple text list or tag cloud

### Contact Section
- **Style:** Simple—email and relevant social (Twitter/X, LinkedIn)
- **Tone:** "Get in touch" or "Available for commissions"

## Do's and Don'ts

### Do
- Use beautiful, readable typography
- Keep line lengths around 65 characters
- Use generous line height (1.7-1.9)
- Let text breathe with whitespace
- Make links clearly visible

### Don't
- Add distracting visual elements
- Use heavy imagery
- Make text too small or cramped
- Include flashy animations
- Compete with the writing for attention
