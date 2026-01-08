# Vibe: 3D Immersive

## Overview
- **Category:** Creative/Designer
- **Keywords:** 3d, immersive, interactive, spline, three.js, webgl, experience, futuristic
- **Best For:** 3D artists, motion designers, creative technologists, game designers, XR developers
- **Inspiration:** Apple product pages, Three.js showcases, Awwwards 3D sites

## Design Philosophy
Break the 2D barrier. Immersive 3D elements create memorable experiences that showcase technical prowess. The portfolio itself becomes a demonstration of skills.

## Color Palette

| Role | Hex Code | Usage Notes |
|------|----------|-------------|
| Background Primary | #000000 | Deep black for 3D contrast |
| Background Secondary | #0A0A0A | Subtle sections |
| Background Gradient | linear-gradient(135deg, #1a1a2e, #16213e) | 3D scene backdrops |
| Text Primary | #FFFFFF | Headlines |
| Text Secondary | #9CA3AF | Body text |
| Accent Primary | #3B82F6 | Electric blue |
| Accent Secondary | #8B5CF6 | Purple |
| Accent Tertiary | #06B6D4 | Cyan |
| Glow | rgba(59, 130, 246, 0.5) | Blue glow effects |

## Typography

| Element | Font Family | Weight | Size (Desktop) | Notes |
|---------|-------------|--------|----------------|-------|
| H1 | Syne | Bold | 64px | Wide, futuristic |
| H2 | Syne | Semibold | 44px | |
| H3 | Inter | Medium | 24px | |
| Body | Inter | Regular | 16px | Line height 1.7 |
| Caption | Inter | Regular | 12px | Uppercase, tracked |

**Font Loading:** 
```html
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
```

## Spacing & Layout

- **Container Max Width:** Full-width for immersive sections
- **Section Padding:** 160px vertical
- **Grid System:** Flexible, content-driven
- **Base Unit:** 8px
- **Card Padding:** 32px
- **Element Gap:** 32px

## Animation Philosophy

Cinematic and interactive. 3D elements respond to scroll and mouse movement. Animations should feel like exploring a digital world—immersive and continuous.

### Entrance Animations
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| 3D Objects | fade-in + rotate | 1s | ease-out |
| Headings | reveal from depth | 0.8s | cubic-bezier |
| Body Text | fade-up | 0.6s | ease-out |
| Sections | scroll-triggered reveal | 0.8s | smooth |

### Interaction Animations
| Trigger | Animation | Notes |
|---------|-----------|-------|
| Mouse Move | 3D parallax / rotate | continuous |
| Scroll | 3D object animation | scroll-linked |
| Button Hover | glow + slight 3D effect | 0.3s |
| Card Hover | depth shift | 0.4s |

## Component Styles

### Buttons
```css
.btn-primary {
  background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
  color: #FFFFFF;
  border-radius: 8px;
  padding: 14px 28px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
}
.btn-primary:hover {
  box-shadow: 0 0 40px rgba(59, 130, 246, 0.6);
  transform: translateY(-2px);
}
```

### Cards
```css
.card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  transition: all 0.4s ease;
}
.card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateZ(20px) rotateX(2deg);
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
```

### Navigation
- Style: Fixed, floating, glassmorphism
- Background: Transparent with blur
- Layout: Minimal—logo left, few links right

## Section Layout Guidelines

### Hero Section
- **Layout:** Full-screen 3D canvas with text overlay
- **Elements:** Simple headline, minimal UI, immersive 3D scene
- **Unique Feature:** Interactive 3D object that responds to mouse/scroll

### About Section
- **Layout:** Split—text with 3D avatar or object
- **Personality:** Tech-focused, creative background

### Projects/Work Section
- **Layout:** Horizontal scroll or large featured cards
- **Card Style:** 3D preview or video embeds
- **Hover Effect:** Depth/parallax

### Skills/Tech Section
- **Display:** 3D skill spheres or orbital layout
- **Style:** Interactive, explorable

### Contact Section
- **Style:** Minimal floating form or just links
- **Tone:** "Let's create something immersive"

## Do's and Don'ts

### Do
- Use Three.js, Spline, or React Three Fiber
- Make 3D elements respond to interaction
- Keep text minimal
- Optimize for performance
- Add loading states for 3D assets

### Don't
- Overload with too many 3D elements
- Forget about fallbacks for older devices
- Make it impossible to navigate
- Ignore performance
- Add 3D for 3D's sake
