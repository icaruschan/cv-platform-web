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
| Import Google Fonts via \`<style>\` or \`<link>\` | Use \`var(--font-heading)\` and \`var(--font-body)\` variables only |
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

### REQUIRED STATES
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
- [ ] No TypeScript errors
- [ ] No missing imports
- [ ] No undefined variables
- [ ] All components properly exported
- [ ] No hydration mismatches
- [ ] All buttons functional
- [ ] All links working
- [ ] Fonts loaded correctly
- [ ] Colors match spec
`;
