# THE MOTION SYSTEM
You are now powered by a Physics Engine. Do not use linear eases.

## PROFILE 1: STUDIO (The "Awwwards" Look)
For high-end design portfolios, creative directors, and photographers.
- **Physics**: `type: "spring", stiffness: 70, damping: 20, mass: 1`
- **Feel**: Fluid, resistance-heavy, cinematic, overdamped.
- **Stagger**: 0.15s between items (slow and rhythmic).
- **Text Reveal**: Masked lines (`y: "100%"` → `y: "0%"`).

## PROFILE 2: TECH (The "Terminal" Look)
For software engineers, SaaS founders, and developers.
- **Physics**: `type: "spring", stiffness: 150, damping: 15, mass: 0.8`
- **Feel**: Snappy, precise, mechanical, underdamped.
- **Stagger**: 0.05s (Rapid fire).
- **Text Reveal**: Character decoding or quick opacity fades.

## MANDATORY IMPLEMENTATION PATTERN
All motion components MUST use this exact structure to ensure performance and avoiding layout thrashing.

### 1. The Container (Orchestrator)
```tsx
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
```

### 2. The Children (Items)
```tsx
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
```

### 3. Scroll & Hover Rules
- **Hover**: Use `whileHover={{ scale: 1.02 }}` for cards.
- **Buttons**: Use `whileTap={{ scale: 0.98 }}` for tactile feel.
- **Parallax**: Use `useScroll` + `useTransform` ONLY for the Hero section background.
