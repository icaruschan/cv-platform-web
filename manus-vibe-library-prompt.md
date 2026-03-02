# Mission: Create 50 Portfolio Design Vibes Library

You are tasked with researching and creating a comprehensive library of 50 distinct portfolio design "vibes" for an AI-powered portfolio generator. Each vibe is a complete design system that will guide code generation.

## Context

We are building a portfolio website generator where users describe their desired aesthetic (e.g., "sleek minimal", "bold creative", "dark hacker"). We need pre-built style guides for 50 different vibes that our AI can use to generate consistent, premium-looking portfolios.

## Research Methodology

1. **Explore Portfolio Showcases:**
   - Awwwards.com (portfolios category)
   - Behance.net (portfolio searches)
   - Dribbble.com (portfolio shots)
   - Godly.website
   - Lapa.ninja
   - SiteInspire.com
   - PersonalWebsites.com
   - Minimal.gallery

2. **Identify Patterns:**
   - What color schemes are used?
   - What typography families are popular?
   - What animation styles differentiate vibes?
   - What layout patterns are common?
   - What makes each feel unique?

3. **Categorize Into Families:**
   - Developer/Tech vibes
   - Creative/Designer vibes
   - Corporate/Professional vibes
   - Artistic/Experimental vibes
   - Industry-specific vibes (photographer, writer, marketer, etc.)

## Vibe Categories to Research (Aim for 50 total)

### Developer/Tech (10 vibes)
Examples to research: Terminal aesthetics, GitHub-inspired, VS Code dark, neon cyberpunk, minimalist code, brutalist dev, ASCII art, hackathon energy

### Creative/Designer (10 vibes)
Examples to research: Bold colorful, soft gradients, editorial magazine, 3D immersive, Memphis style, Swiss design, motion-heavy, portfolio grid, asymmetric layouts

### Corporate/Professional (8 vibes)
Examples to research: Clean corporate, startup modern, consulting serious, executive luxury, finance trust, legal formal, healthcare clean, enterprise stable

### Artistic/Expressive (7 vibes)
Examples to research: Retro 70s/80s/90s, hand-drawn, illustrated, collage-style, glitch art, maximalist, vaporwave, Y2K nostalgia

### Niche/Industry-Specific (10 vibes)
Examples to research: Photographer (gallery-focused), writer (editorial), musician (audio-visual), filmmaker (cinematic), architect (blueprint), product designer (case study heavy), UX designer (prototype feel)

### Mood-Based (5 vibes)
Examples to research: Calm & zen, energetic & playful, mysterious & dark, warm & friendly, cutting-edge futuristic

---

## Output Format (Per Vibe)

For each of the 50 vibes, create a markdown file with this exact structure:

```markdown
# Vibe: [Vibe Name]

## Overview
- **Category:** [Developer/Creative/Corporate/Artistic/Niche/Mood]
- **Keywords:** [5-7 keywords users might say to match this vibe]
- **Best For:** [What type of professional this suits]
- **Inspiration Sources:** [2-3 real portfolio URLs that embody this]

## Design Philosophy
[2-3 sentences describing the overall feel and why it works]

## Color Palette

| Role | Hex Code | Usage Notes |
|------|----------|-------------|
| Background Primary | #XXXXXX | Main page background |
| Background Secondary | #XXXXXX | Cards, sections |
| Text Primary | #XXXXXX | Headlines, important text |
| Text Secondary | #XXXXXX | Body text, descriptions |
| Accent Primary | #XXXXXX | CTAs, links, highlights |
| Accent Secondary | #XXXXXX | Hover states, secondary actions |
| Border/Subtle | #XXXXXX | Dividers, card borders |

## Typography

| Element | Font Family | Weight | Size (Desktop) | Notes |
|---------|-------------|--------|----------------|-------|
| H1 | [Font Name] | Bold | 72px | [Style notes] |
| H2 | [Font Name] | Semibold | 48px | |
| H3 | [Font Name] | Medium | 32px | |
| Body | [Font Name] | Regular | 18px | Line height 1.6 |
| Caption | [Font Name] | Regular | 14px | |

**Font Loading:** [Google Fonts link or note about custom fonts]

## Spacing & Layout

- **Container Max Width:** [1200px / 1400px / full-width]
- **Section Padding:** [Top/Bottom in px]
- **Grid System:** [12-col / custom / none]
- **Base Unit:** [4px / 8px for spacing scale]
- **Card Padding:** [px value]
- **Element Gap:** [px value]

## Animation Philosophy

[Describe the overall animation feel - subtle/energetic/playful/professional]

### Entrance Animations
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Headings | [fade-up/slide-in/etc] | [0.4s] | [ease-out] |
| Body Text | [description] | [value] | [value] |
| Cards | [description] | [value] | [value] |
| Images | [description] | [value] | [value] |

### Interaction Animations
| Trigger | Animation | Notes |
|---------|-----------|-------|
| Button Hover | [scale/glow/color shift] | |
| Card Hover | [lift/border glow/etc] | |
| Link Hover | [underline/color/etc] | |
| Scroll | [parallax/reveal/etc] | |

## Component Styles

### Buttons
```css
/* Primary Button */
.btn-primary {
  background: [value];
  color: [value];
  border-radius: [value];
  padding: [value];
  /* hover effect description */
}
```

### Cards
```css
/* Card Component */
.card {
  background: [value];
  border: [value];
  border-radius: [value];
  box-shadow: [value];
  /* hover effect description */
}
```

### Navigation
- Style: [Sticky/Fixed/Static]
- Background: [Transparent/Solid/Blur]
- Layout: [Logo left + links center + CTA right / etc]

## Section Layout Guidelines

### Hero Section
- **Layout:** [Centered/Split/Asymmetric]
- **Elements:** [What appears: headline, tagline, CTA, image, etc]
- **Unique Feature:** [What makes this vibe's hero special]

### About Section
- **Layout:** [Grid/Single column/Split image]
- **Personality:** [How personal info is displayed]

### Projects/Work Section
- **Layout:** [Grid/Masonry/Stacked/Carousel]
- **Card Style:** [Detailed above]
- **Hover Effect:** [What happens on project hover]

### Skills/Tech Section
- **Display:** [Tags/Bars/Icons/Grid]
- **Style:** [Minimal/Detailed/Animated]

### Contact Section
- **Style:** [Form/Links only/CTA focused]
- **Tone:** [Professional/Casual/Creative]

## Code Reference

### Recommended Libraries
- CSS Framework: [Tailwind/Vanilla/etc]
- Animation Library: [Framer Motion/GSAP/CSS only]
- Component Library: [shadcn/ui/Radix/Custom]

### Sample Hero Code Snippet
```tsx
// Example component structure for this vibe
// [Provide a simple structural example]
```

## Do's and Don'ts

### Do
- [3-5 things that reinforce this vibe]

### Don't
- [3-5 things that would break this vibe]
```

---

## Deliverables

Create 50 separate markdown files, each following the exact structure above:

```
vibes/
├── 01-minimal-developer.md
├── 02-neon-hacker.md
├── 03-bold-creative.md
├── 04-soft-gradients.md
├── 05-corporate-clean.md
... (50 total)
```

Also create a master index file:

```markdown
# Vibe Library Index

## Developer/Tech
1. [Minimal Developer](01-minimal-developer.md) - Clean, dark, monospace
2. [Neon Hacker](02-neon-hacker.md) - Cyberpunk, glows, terminal
...

## Creative/Designer
11. [Bold Creative](11-bold-creative.md) - Vibrant, asymmetric, playful
...
```

---

## Quality Criteria

Each vibe must:
- Be distinctly different from other vibes
- Have specific, actionable design specifications (not vague)
- Include real color hex codes that work well together
- Reference real font families available on Google Fonts
- Include inspiration URLs from real portfolios
- Be implementable by an AI code generator

## Research Tips

1. **For Color Palettes:** Use tools like Coolors, Adobe Color, or extract from inspiration sites
2. **For Typography:** Stick to Google Fonts for easy implementation
3. **For Animations:** Describe in terms of CSS/Framer Motion properties
4. **For Inspiration:** Include 2-3 real URLs per vibe that embody the aesthetic

---

## Timeline

This is a comprehensive research project. Take your time to ensure quality and distinctiveness for each vibe. The output will be used to generate thousands of portfolios, so accuracy matters.
