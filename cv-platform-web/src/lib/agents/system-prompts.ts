export const MOTION_SYSTEM_PROMPT = `# THE MOTION SYSTEM
You are now powered by a Physics Engine. Do not use linear eases.

## PROFILE 1: STUDIO (The "Awwwards" Look)
For high-end design portfolios, creative directors, and photographers.
- **Physics**: \`type: "spring", stiffness: 70, damping: 20, mass: 1\`
- **Feel**: Fluid, resistance-heavy, cinematic, overdamped.
- **Stagger**: 0.15s between items (slow and rhythmic).
- **Text Reveal**: Masked lines (\`y: "100%"\` → \`y: "0%"\`).

## PROFILE 2: TECH (The "Terminal" Look)
For software engineers, SaaS founders, and developers.
- **Physics**: \`type: "spring", stiffness: 150, damping: 15, mass: 0.8\`
- **Feel**: Snappy, precise, mechanical, underdamped.
- **Stagger**: 0.05s (Rapid fire).
- **Text Reveal**: Character decoding or quick opacity fades.

## MANDATORY IMPLEMENTATION PATTERN
All motion components MUST use this exact structure to ensure performance and avoiding layout thrashing.

### 1. The Container (Orchestrator)
\`\`\`tsx
<motion.section
  initial="initial"
  whileInView="animate"
  viewport={{ once: true, amount: 0.2 }}
  variants={{
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 } // Adjusted by profile
    }
  }}
>
\`\`\`

### 2. The Children (Items)
\`\`\`tsx
<motion.div
  variants={{
    initial: { y: 20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        // INJECT PHYSICS VALUES HERE BASED ON PROFILE
        stiffness: 100, 
        damping: 20 
      }
    }
  }}
>
\`\`\`

### 3. Scroll & Hover Rules
- **Hover**: Use \`whileHover={{ scale: 1.02 }}\` for cards.
- **Buttons**: Use \`whileTap={{ scale: 0.98 }}\` for tactile feel.
- **Parallax**: Use \`useScroll\` + \`useTransform\` ONLY for the Hero section background.
`;

export const TECHNICAL_CONSTRAINTS_PROMPT = `# Technical Constraints & Guardrails

This document is injected into every AI code generation prompt to prevent common errors and ensure production-quality output.

---

## 🔴 CRITICAL: Next.js & React Rules

### Hydration Safety (MOST COMMON ERROR)
| ❌ NEVER | ✅ ALWAYS |
|----------|-----------|
| Inline \`<style>\` tags in components | Put all CSS in \`globals.css\` or CSS modules |
| \`Math.random()\` in render | Wrap in \`useEffect\` or use \`crypto.randomUUID()\` |
| \`Date.now()\` or \`new Date()\` in render | Use \`useState\` + \`useEffect\` pattern |
| \`window\` or \`document\` without checks | Wrap in \`typeof window !== 'undefined'\` |
| \`localStorage\` access in render | Use \`useEffect\` for storage access |

### Component Architecture
| ❌ NEVER | ✅ ALWAYS |
|----------|-----------|
| Interactive components without \`'use client'\` | Add \`'use client'\` at top of file for any hooks/events |
| Import Google Fonts via \`<style>\` or \`<link>\` in components | Use \`@import url('https://fonts.googleapis.com/...')\` in index.css only |
| Use \`<a>\` for internal navigation | Use Next.js \`<Link>\` component |
| Use \`<img>\` tag | Use Next.js \`<Image>\` component with width/height |
| Async component without Suspense boundary | Wrap dynamic imports in \`<Suspense>\` |

### Import Verification (THE "ArrowUpRight" PROBLEM)
| ❌ NEVER | ✅ ALWAYS |
|----------|-----------|
| Use a component/icon without importing it | Every component/icon used in JSX MUST have a matching import |
| Assume Phosphor icons are auto-imported | Explicitly import each icon: \`import { ArrowUpRight, Envelope } from '@phosphor-icons/react';\` |

---

## 🟡 FUNCTIONAL: Interactivity Rules

### Buttons & CTAs (THE "VIEW SELECTED WORK" PROBLEM)
\`\`\`tsx
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
\`\`\`

### All Interactive Elements MUST:
- [ ] Have working \`onClick\`, \`href\`, or form action
- [ ] Have visible hover state (opacity, color, or transform)
- [ ] Have focus state for keyboard navigation
- [ ] Have active/pressed state feedback
- [ ] Have \`cursor: pointer\` on clickables

### Navigation
- [ ] All section links must use \`#section-id\` format
- [ ] All sections must have matching \`id\` attributes
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
\`\`\`css
/* Mobile First */
@media (min-width: 640px) { /* sm: Tablet */ }
@media (min-width: 768px) { /* md: Small laptop */ }
@media (min-width: 1024px) { /* lg: Desktop */ }
@media (min-width: 1280px) { /* xl: Large desktop */ }
\`\`\`

### Responsive Rules
- [ ] All text readable at 320px width minimum
- [ ] No horizontal scroll on any device
- [ ] Touch targets minimum 44x44px on mobile
- [ ] Images scale proportionally (aspect-ratio or padding-bottom hack)
- [ ] Navigation collapses to hamburger < 768px

---

## 🔵 ANIMATION: Motion & Performance Rules

### Framer Motion (THE SCROLL WARNING PROBLEM)
\`\`\`tsx
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
\`\`\`

### Animation Performance
| ❌ AVOID | ✅ PREFER |
|----------|-----------|
| Animating \`width\`, \`height\` | Animate \`transform: scale()\` |
| Animating \`top\`, \`left\`, \`margin\` | Animate \`transform: translate()\` |
| Animating \`background-color\` on large areas | Animate \`opacity\` of overlay |
| Animation duration > 1s for UI feedback | Keep UI animations 0.2-0.5s |
| Many simultaneous animations | Stagger children, limit concurrent |

### Required Animation States
- Page load: Fade in content (0.3-0.5s)
- Scroll reveal: Slide up + fade (0.5-0.8s)
- Hover: Immediate response (0.15-0.3s)
- Click: Tactile feedback (scale 0.95 → 1)

### Performance NON-NEGOTIABLES
- **NEVER** animate \`width\`, \`height\`, \`padding\`, or \`layout\` prop on large lists.
- **ALWAYS** animate \`scale\`, \`opacity\`, \`x\`, \`y\` (GPU-accelerated).
- **NEVER** use \`AnimatePresence\` on whole page routes (causes hydration/scroll issues).

---

## 🟣 CONTENT: Data Binding Rules

### Dynamic Content Injection
\`\`\`tsx
// ❌ HARDCODED - Will break for different users
<h1>Alex Chen</h1>

// ✅ DYNAMIC - Reads from props/context
<h1>{userData.name}</h1>

// ✅ FALLBACK - Handles missing data
<h1>{userData.name || 'Your Name'}</h1>
\`\`\`

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
\`\`\`tsx
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
\`\`\`

### Section ID Requirements
| Section | Required ID |
|---------|-------------|
| Hero | \`hero\` |
| About | \`about\` |
| Projects/Work | \`projects\` or \`work\` |
| Skills/Expertise | \`skills\` |
| Contact | \`contact\` |
| Footer | \`footer\` |

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

## DATA INTEGRITY: Anti-Hallucination Rules

### THE CARDINAL RULE
> **NEVER invent content. If data is provided, USE IT EXACTLY. If data is missing, OMIT the element.**

### Data Binding Hierarchy
| Data Type | Source | If Missing |
|-----------|--------|------------|
| Name | \`briefData.name\` | Show "Your Name" |
| Title | \`briefData.title\` | Show "Professional" |
| Email | \`briefData.socials.email\` | OMIT email button entirely |
| Twitter/X | \`briefData.socials.twitter\` | OMIT Twitter button entirely |
| LinkedIn | \`briefData.socials.linkedin\` | OMIT LinkedIn button entirely |
| Discord | \`briefData.socials.discord\` | OMIT Discord button entirely |
| Projects | \`briefData.projects[]\` | OMIT projects section |
| Tagline | \`briefData.tagline\` | OMIT tagline line |

### Social Link Rules
| ❌ NEVER | ✅ ALWAYS |
|----------|----------|
| Invent social URLs | Use exact URLs provided in brief |
| Use placeholder URLs (twitter.com/username) | Use the provided handle from contact section |
| Show social button if no data provided | Hide/omit element if URL is null/undefined |
| Mix project handles with personal handles | Personal Twitter from Contact ≠ Project Twitter from Projects |
| Hardcode any user content | Read all content from briefData or props |

### Project Content Rules
\`\`\`tsx
// ❌ HALLUCINATED - Invented project details
<h3>Amazing Project</h3>
<p>Built scalable solutions...</p>

// ✅ EXACT DATA - Using provided values
<h3>{project.name}</h3>
<p>{project.impact}</p>
\`\`\`

---

## 🟣 VISUAL CONSISTENCY: Design System Enforcement

### THE ONE-ACCENT RULE
> **Pick ONE accent color from the style guide and use it EVERYWHERE. No mixing blue, pink, green, yellow across sections.**

### Button Variants (USE EXACTLY THESE 3 PATTERNS)
\`\`\`tsx
// PRIMARY - Main CTAs only (1-2 per page max)
<button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
  Get in Touch
</button>

// SECONDARY - Secondary actions, outlined style
<button className="border-2 border-foreground bg-transparent px-6 py-3 rounded-lg font-semibold hover:bg-foreground/10 transition-colors">
  Learn More
</button>

// GHOST - Tertiary/navigation actions
<button className="bg-transparent px-4 py-2 hover:bg-muted rounded-lg transition-colors">
  View All
</button>
\`\`\`

### Color Usage Rules
| Purpose | Use This | Never Use |
|---------|----------|-----------| 
| Primary CTA background | \`bg-primary\` | \`bg-blue-500\`, \`bg-indigo-600\`, etc. |
| Accent highlights | \`bg-accent\` or \`text-accent\` | Multiple different accent colors |
| Body text | \`text-foreground\` | Hardcoded \`text-gray-800\`, \`text-black\` |
| Muted text | \`text-muted-foreground\` | Random opacity values |
| Card borders | \`border-border\` | Random border colors |
| Backgrounds | \`bg-background\` or \`bg-card\` | Hardcoded colors |

### Cross-Section Consistency Checklist
- [ ] ALL buttons across ALL sections use the same 3 variants above
- [ ] ALL cards have the same \`rounded-xl border-2 border-border\` pattern
- [ ] ALL shadows use \`shadow-lg\` consistently
- [ ] ALL hover transitions use \`transition-all duration-300\`
- [ ] ALL spacing uses the 8px grid (16, 24, 32, 48, 64px)
- [ ] Hero, Projects, Contact all use the SAME accent color

---

## 🔵 COMPONENT PATTERNS: Reusable UI Elements

### Standard Card Pattern
\`\`\`tsx
<div className="p-6 rounded-xl border-2 border-border bg-card shadow-lg hover:shadow-xl transition-shadow">
  {/* Card content */}
</div>
\`\`\`

### Project/Bento Card Pattern
\`\`\`tsx
<div className="p-6 rounded-xl border-2 border-border bg-card hover:border-primary transition-colors">
  <Image 
    src={project.imageUrl} 
    alt={project.name}
    width={64} 
    height={64} 
    className="rounded-lg"
  />
  <h3 className="text-xl font-semibold mt-4">{project.name}</h3>
  <p className="text-muted-foreground text-sm">{project.role}</p>
  <p className="mt-2">{project.impact}</p>
</div>
\`\`\`

### Social Link Button Pattern (Conditional Rendering)
\`\`\`tsx
{/* ONLY render if URL exists - never show broken links */}
{socialLinks.twitter && (
  <a 
    href={socialLinks.twitter}
    target="_blank"
    rel="noopener noreferrer"
    className="p-3 rounded-lg border-2 border-border hover:border-primary hover:text-primary transition-colors"
  >
    <TwitterIcon className="w-5 h-5" />
  </a>
)}

{/* Same pattern for all social links */}
{socialLinks.linkedin && (
  <a href={socialLinks.linkedin} ...>
    <LinkedInIcon />
  </a>
)}
\`\`\`

### CTA Section Pattern
\`\`\`tsx
<section className="py-24 text-center">
  <h2 className="text-4xl font-bold mb-4">{briefData.tagline || "Let's Work Together"}</h2>
  <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
    {briefData.summary?.substring(0, 150) || "Get in touch to discuss your project."}
  </p>
  
  {/* Only show email button if email exists */}
  {socialLinks.email && (
    <a href={\`mailto:\${socialLinks.email}\`} className="bg-primary text-primary-foreground px-8 py-4 rounded-lg">
      Contact Me
    </a>
  )}
</section>
\`\`\`

---

## 📋 COMMON AI MISTAKES TO AVOID

1. **The Dead Button** - Writing \`<button>\` without \`onClick\`
2. **The Hydration Bomb** - Inline styles with special characters
3. **The Font Flash** - Loading fonts via \`<style>\` instead of proper imports
4. **The Scroll Trap** - useScroll() without proper container
5. **The Missing State** - No hover/focus states on interactive elements
6. **The Hardcode Hell** - User content written directly instead of from props
7. **The Image 404** - Using placeholder URLs that don't exist
8. **The Accessibility Void** - Missing alt text, no focus states
9. **The Mobile Disaster** - Fixed widths that break on small screens
10. **The Z-Index War** - Random z-index values causing overlays to break
11. **The Content Hallucination** - Inventing project names, titles, or bios instead of using provided data
12. **The Color Chaos** - Using different accent colors in different sections (blue hero, green navbar, pink buttons)
13. **The Handle Mix-Up** - Using project Twitter handles when personal handle was provided
14. **The Phantom Social** - Showing social buttons for URLs that don't exist
15. **The Button Buffet** - Creating 4+ different button styles instead of consistent 3 variants

---

*This document version: 2.0 | Last updated: 2024-12-31*
`;
