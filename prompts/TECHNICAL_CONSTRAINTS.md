# Technical Constraints & Guardrails

This document is injected into every AI code generation prompt to prevent common errors and ensure production-quality output.

---

## 🔴 CRITICAL: Next.js & React Rules

### Hydration Safety (MOST COMMON ERROR)
| ❌ NEVER | ✅ ALWAYS |
|----------|-----------|
| Inline `<style>` tags in components | Put all CSS in `globals.css` or CSS modules |
| `Math.random()` in render | Wrap in `useEffect` or use `crypto.randomUUID()` |
| `Date.now()` or `new Date()` in render | Use `useState` + `useEffect` pattern |
| `window` or `document` without checks | Wrap in `typeof window !== 'undefined'` |
| `localStorage` access in render | Use `useEffect` for storage access |

### Component Architecture
| ❌ NEVER | ✅ ALWAYS |
|----------|-----------|
| Interactive components without `'use client'` | Add `'use client'` at top of file for any hooks/events |
| Import Google Fonts via `<style>` or `<link>` | Use `next/font` or `@import` in `globals.css` |
| Use `<a>` for internal navigation | Use Next.js `<Link>` component |
| Use `<img>` tag | Use Next.js `<Image>` component with width/height |
| Async component without Suspense boundary | Wrap dynamic imports in `<Suspense>` |

---

## 🟡 FUNCTIONAL: Interactivity Rules

### Buttons & CTAs (THE "VIEW SELECTED WORK" PROBLEM)
```tsx
// ❌ BROKEN - No functionality
<button>View Selected Work</button>

// ❌ BROKEN - Empty href
<a href="#">View Selected Work</a>

// ✅ CORRECT - Scrolls to section
<button onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}>
  View Selected Work
</button>

// ✅ CORRECT - Anchor link
<a href="#projects">View Selected Work</a>
```

### All Interactive Elements MUST:
- [ ] Have working `onClick`, `href`, or form action
- [ ] Have visible hover state (opacity, color, or transform)
- [ ] Have focus state for keyboard navigation
- [ ] Have active/pressed state feedback
- [ ] Have `cursor: pointer` on clickables

### Navigation
- [ ] All section links must use `#section-id` format
- [ ] All sections must have matching `id` attributes
- [ ] Mobile menu must have open/close toggle
- [ ] Current page/section should be visually indicated

---

## 🟢 VISUAL: UI/UX Consistency Rules

### Typography Hierarchy
| Element | Font | Size | Weight |
|---------|------|------|--------|
| H1 (Hero) | Heading font | 4-6rem (fluid) | 700-900 |
| H2 (Section) | Heading font | 2-3rem | 600-700 |
| H3 (Card title) | Heading font | 1.25-1.5rem | 600 |
| Body | Body font | 1rem (16px min) | 400 |
| Caption | Body font | 0.875rem | 400 |
| Label/Tag | Body font | 0.75rem | 500-600 |

### Spacing System (8px Grid)
- Use multiples of 8px: 8, 16, 24, 32, 48, 64, 96, 128
- Section padding: 64-128px vertical
- Component gaps: 16-32px
- Text margins: 8-16px

### Color Contrast (WCAG AA)
- Body text on background: minimum 4.5:1
- Large text (18px+): minimum 3:1
- Interactive elements: minimum 3:1
- Never use pure black (#000) on pure white or vice versa

### Responsive Breakpoints
```css
/* Mobile First */
@media (min-width: 640px) { /* sm: Tablet */ }
@media (min-width: 768px) { /* md: Small laptop */ }
@media (min-width: 1024px) { /* lg: Desktop */ }
@media (min-width: 1280px) { /* xl: Large desktop */ }
```

### Responsive Rules
- [ ] All text readable at 320px width minimum
- [ ] No horizontal scroll on any device
- [ ] Touch targets minimum 44x44px on mobile
- [ ] Images scale proportionally (aspect-ratio or padding-bottom hack)
- [ ] Navigation collapses to hamburger < 768px

---

## 🔵 ANIMATION: Motion & Performance Rules

### Framer Motion (THE SCROLL WARNING PROBLEM)
```tsx
// ❌ BROKEN - Causes warning on static containers
const { scrollYProgress } = useScroll({
  target: containerRef,
  offset: ["start start", "end start"]
});

// ✅ CORRECT - Add layoutScroll for scroll containers
<motion.div style={{ overflow: 'auto' }} layoutScroll>
  {/* content */}
</motion.div>

// ✅ CORRECT - Use window scroll if no container ref
const { scrollYProgress } = useScroll();
```

### Animation Performance
| ❌ AVOID | ✅ PREFER |
|----------|-----------|
| Animating `width`, `height` | Animate `transform: scale()` |
| Animating `top`, `left`, `margin` | Animate `transform: translate()` |
| Animating `background-color` on large areas | Animate `opacity` of overlay |
| Animation duration > 1s for UI feedback | Keep UI animations 0.2-0.5s |
| Many simultaneous animations | Stagger children, limit concurrent |

### Required Animation States
- Page load: Fade in content (0.3-0.5s)
- Scroll reveal: Slide up + fade (0.5-0.8s)
- Hover: Immediate response (0.15-0.3s)
- Click: Tactile feedback (scale 0.95 → 1)

---

## 🟣 CONTENT: Data Binding Rules

### Dynamic Content Injection
```tsx
// ❌ HARDCODED - Will break for different users
<h1>Alex Chen</h1>

// ✅ DYNAMIC - Reads from props/context
<h1>{userData.name}</h1>

// ✅ FALLBACK - Handles missing data
<h1>{userData.name || 'Your Name'}</h1>
```

### Required Fallbacks
| Content Type | Fallback |
|--------------|----------|
| User name | "Your Name" |
| Role/Title | "Professional" |
| Bio | "Welcome to my portfolio" |
| Project image | Gradient placeholder |
| Project count | Minimum 3, generate placeholders |
| Skills | Default tech stack |

### Image Handling
- [ ] Never use broken image URLs
- [ ] Always provide fallback for missing images
- [ ] Use Unsplash/Pexels for placeholder professional images
- [ ] Optimize all images (WebP preferred)
- [ ] Add loading="lazy" for below-fold images

---

## ⚫ STRUCTURE: File Organization Rules

### Component Files Must Include
```tsx
// 1. 'use client' directive (if interactive)
'use client';

// 2. All imports at top
import React from 'react';
import { motion } from 'framer-motion';

// 3. TypeScript interfaces
interface Props {
  title: string;
  description?: string;
}

// 4. Component with proper export
export default function ComponentName({ title, description = 'Default' }: Props) {
  // 5. Hooks at top of component
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // 6. Return JSX
  return (
    <section id="unique-section-id">
      {/* Content */}
    </section>
  );
}
```

### Section ID Requirements
| Section | Required ID |
|---------|-------------|
| Hero | `hero` |
| About | `about` |
| Projects/Work | `projects` or `work` |
| Skills/Expertise | `skills` |
| Contact | `contact` |
| Footer | `footer` |

---

## 🧪 VALIDATION CHECKLIST

Before generation is complete, AI must verify:

### Build Checks
- [ ] No TypeScript errors
- [ ] No missing imports
- [ ] No undefined variables
- [ ] All components properly exported

### Runtime Checks
- [ ] No hydration mismatches
- [ ] No console errors
- [ ] All buttons functional
- [ ] All links working

### Visual Checks
- [ ] Fonts loaded correctly
- [ ] Colors match spec
- [ ] Responsive at 320px, 768px, 1024px, 1440px
- [ ] No text overflow/truncation issues

### Accessibility Checks
- [ ] All images have alt text
- [ ] Heading hierarchy (h1 → h2 → h3)
- [ ] Focus visible on interactive elements
- [ ] Color contrast passes

---

## 📋 COMMON AI MISTAKES TO AVOID

1. **The Dead Button** - Writing `<button>` without `onClick`
2. **The Hydration Bomb** - Inline styles with special characters
3. **The Font Flash** - Loading fonts via `<style>` instead of proper imports
4. **The Scroll Trap** - useScroll() without proper container
5. **The Missing State** - No hover/focus states on interactive elements
6. **The Hardcode Hell** - User content written directly instead of from props
7. **The Image 404** - Using placeholder URLs that don't exist
8. **The Accessibility Void** - Missing alt text, no focus states
9. **The Mobile Disaster** - Fixed widths that break on small screens
10. **The Z-Index War** - Random z-index values causing overlays to break

---

*This document version: 1.0 | Last updated: 2024-12-23*
