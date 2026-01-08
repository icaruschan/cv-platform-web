# Vibe: Motion Heavy

## Overview
- **Category:** Creative/Designer
- **Keywords:** motion, animated, kinetic, scroll, gsap, lottie, dynamic, interactive
- **Best For:** Motion designers, animators, creative developers, agency creatives
- **Inspiration:** Apple product launches, award-winning Awwwards sites, Nike campaigns

## Design Philosophy
Movement is the message. Every scroll, every hover, every page load is an opportunity for expression. The portfolio should feel alive, demonstrating motion design skills through the experience itself.

## Color Palette

| Role | Hex Code | Usage Notes |
|------|----------|-------------|
| Background Primary | #0F0F0F | Dark for contrast |
| Background Secondary | #1A1A1A | Subtle sections |
| Text Primary | #FFFFFF | Headlines |
| Text Secondary | #888888 | Body text |
| Accent Primary | #FF4D4D | Vibrant red |
| Accent Secondary | #4DFFFF | Cyan |
| Accent Tertiary | #FFD700 | Gold |

## Typography

| Element | Font Family | Weight | Size (Desktop) | Notes |
|---------|-------------|--------|----------------|-------|
| H1 | Clash Display | Bold | 120px | Animated reveal |
| H2 | Clash Display | Semibold | 64px | |
| H3 | Inter | Medium | 28px | |
| Body | Inter | Regular | 16px | Line height 1.7 |
| Caption | Inter | Regular | 12px | Uppercase |

**Font Loading:** 
```html
<!-- Clash Display from Fontshare -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap" rel="stylesheet">
```

## Spacing & Layout

- **Container Max Width:** Full-width sections, 1200px content
- **Section Padding:** 200px vertical (room for animations)
- **Grid System:** Flexible, broken for effect
- **Base Unit:** 8px
- **Card Padding:** 40px
- **Element Gap:** 40px

## Animation Philosophy

Go big. Every element should animate. Use scroll-triggered reveals, parallax, staggered text animations, and smooth page transitions. GSAP and Framer Motion are essential.

### Entrance Animations
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Headings | split-text reveal (per char) | 1.2s | power4.out |
| Body Text | staggered line reveal | 0.8s | power3.out |
| Cards | clip-path reveal | 1s | power3.inOut |
| Images | parallax + scale | continuous | smooth |

### Interaction Animations
| Trigger | Animation | Notes |
|---------|-----------|-------|
| Scroll | parallax, pin sections, reveals | GSAP ScrollTrigger |
| Mouse Move | magnetic buttons, cursor follower | continuous |
| Button Hover | morph + expand | 0.4s |
| Page Transition | clip/wipe + fade | 0.8s |

## Component Styles

### Buttons
```css
.btn-primary {
  background: #FFFFFF;
  color: #0F0F0F;
  border-radius: 50px;
  padding: 18px 36px;
  font-weight: 600;
  position: relative;
  overflow: hidden;
}
/* Magnetic effect via JS */
.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #FF4D4D;
  transform: translateY(100%);
  transition: transform 0.4s cubic-bezier(0.65, 0, 0.35, 1);
}
.btn-primary:hover::before {
  transform: translateY(0);
}
.btn-primary:hover {
  color: #FFFFFF;
}
```

### Cards
```css
.card {
  background: #1A1A1A;
  border: none;
  border-radius: 20px;
  padding: 40px;
  transform: translateY(100px);
  opacity: 0;
  /* JS handles scroll reveal */
}
.card.revealed {
  animation: cardReveal 0.8s forwards;
}
@keyframes cardReveal {
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

### Navigation
- Style: Fixed, minimal, animated on scroll
- Background: Transparent → solid on scroll (animation)
- Layout: Logo left (animated), links right with hover effects

## Section Layout Guidelines

### Hero Section
- **Layout:** Full-screen, text-centered or split
- **Elements:** Huge animated headline, subtle scroll indicator, maybe video background
- **Unique Feature:** Text split animation, scroll-triggered transforms

### About Section
- **Layout:** Horizontal scroll or parallax layers
- **Personality:** Motion-focused bio, skills shown through animation examples

### Projects/Work Section
- **Layout:** Large featured cards, horizontal scroll optional
- **Card Style:** Video/GIF previews, animated hover states
- **Hover Effect:** Full card transformation, video play

### Skills/Tech Section
- **Display:** Animated skill bars or orbiting icons
- **Style:** Everything moves

### Contact Section
- **Style:** Animated CTA, maybe interactive form
- **Tone:** "Let's create motion together"

## Do's and Don'ts

### Do
- Use GSAP ScrollTrigger
- Animate text with split reveals
- Add scroll-based progress
- Include magnetic/interactive buttons
- Create custom cursor

### Don't
- Make it choppy (60fps minimum)
- Overwhelm with too much at once
- Forget performance optimization
- Ignore reduced-motion preferences
- Skip loading states for heavy assets
