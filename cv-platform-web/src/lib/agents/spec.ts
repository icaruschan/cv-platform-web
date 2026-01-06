import OpenAI from 'openai';
import { Brief, Moodboard } from '../types';

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

// Use Pro model for higher quality specs
const GEMINI_MODEL = process.env.GEMINI_PRO_MODEL || "google/gemini-3-pro-preview";

// ============================================================================
// TYPES
// ============================================================================

interface Section {
    name: string;
    description: string;
}

interface SpecOutput {
    path: string;
    content: string;
}

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

export async function generateSpecs(
    brief: Brief,
    moodboard: Moodboard
): Promise<SpecOutput[]> {
    console.log('📐 Starting Spec Agent (The Architect)...');

    const outputs: SpecOutput[] = [];

    try {
        // Step 1: Generate Style Guide
        console.log('   🎨 Generating STYLE_GUIDE.md...');
        const styleGuide = await generateStyleGuide(brief, moodboard);
        outputs.push({ path: 'docs/STYLE_GUIDE.md', content: styleGuide });

        // Step 2: Determine Sections Dynamically
        const sections = determineSections(brief);
        console.log(`   📋 Determined ${sections.length} sections: ${sections.map(s => s.name).join(', ')}`);

        // Step 3: Generate Project Requirements
        console.log('   📋 Generating PROJECT_REQUIREMENTS.md...');
        const requirements = await generateProjectRequirements(brief, styleGuide, sections);
        outputs.push({ path: 'docs/PROJECT_REQUIREMENTS.md', content: requirements });

        // Step 4: Generate Individual Section Specs
        console.log('   📄 Generating Section Specs...');
        const sectionSpecs = await generateSectionSpecs(brief, moodboard, sections);
        outputs.push(...sectionSpecs);

        console.log(`   ✅ Spec Agent complete. Generated ${outputs.length} documents.`);
        return outputs;

    } catch (error) {
        console.error("Spec Agent Failed:", error);
        // Return minimal fallback
        return [
            { path: 'docs/STYLE_GUIDE.md', content: createFallbackStyleGuide(brief, moodboard) },
            { path: 'docs/PROJECT_REQUIREMENTS.md', content: createFallbackRequirements(brief) }
        ];
    }
}

// ============================================================================
// STEP 1: GENERATE STYLE GUIDE
// ============================================================================

async function generateStyleGuide(brief: Brief, moodboard: Moodboard): Promise<string> {
    const systemPrompt = `You are a world-class Design Systems Engineer with over 15 years of experience at top agencies like Pentagram, IDEO, and Google. You are renowned for creating aesthetically stunning, harmonious design systems that translate beautifully into award-winning websites.

Your task is to create a comprehensive STYLE_GUIDE.md that will serve as the "Single Source of Truth" for building a visually breathtaking portfolio website.

## YOUR DESIGN PHILOSOPHY:
- Every color choice should evoke emotion and reinforce brand identity
- Typography must create visual hierarchy that guides the eye naturally
- Spacing should breathe — generous whitespace is a feature, not a bug
- Animations should feel organic and purposeful, never gimmicky

## OUTPUT REQUIREMENTS:
Your output MUST be a complete, production-ready style guide in Markdown format:

1. **Design Philosophy:** A compelling 2-3 sentence vision statement capturing the aesthetic soul of this project.

2. **Color Palette:** Define CSS variables with HSL values for flexibility:
    - \`--color-primary\` (the hero accent color)
    - \`--color-secondary\`
    - \`--color-background\` (main background)
    - \`--color-foreground\` (main text)
    - \`--color-muted\` (subtle backgrounds)
    - \`--color-muted-foreground\` (subtle text)
    - \`--color-accent\` (highlights)
    - \`--color-border\`
    - \`--color-card\` (card backgrounds)

3. **Typography:** Define with Google Font names:
    - \`--font-heading\` (display/heading font)
    - \`--font-body\` (readable body font)
    - Font sizes using clamp() for fluid typography:
      - \`--font-size-hero\`: clamp(2.5rem, 5vw, 4.5rem)
      - \`--font-size-h1\` through \`--font-size-body\`
    - Font weights for heading and body

4. **Spacing & Layout:**
    - 8px grid system: --space-1 (0.25rem) through --space-20 (5rem)
    - Border radius scale: sm, md, lg, full
    - Container max-width
    - Section padding defaults

5. **Animation Guidelines:**
    - Transition timing functions (ease-out for enters, ease-in for exits)
    - Default durations: fast (150ms), base (300ms), slow (500ms)
    - Scroll reveal patterns (fade-up, slide-in)
    - Hover state philosophy

6. **Component Patterns:** Brief descriptions of key UI patterns to use (e.g., glassmorphism cards, gradient borders).

7. **Motion Personality:**
    Analyze the "Vibe" and select ONE motion profile:
    - **STUDIO**: For creative, design-heavy, elegant briefs. (Overdamped, slow, fluid)
    - **TECH**: For developer, startup, SaaS briefs. (Underdamped, snappy, precise)
    
    Define this in a new \`MOODBOARD_CONFIG\` section at the end of the Style Guide in this exact format:
    \`\`\`
    ## MOODBOARD_CONFIG
    - Motion Profile: [STUDIO or TECH]
    \`\`\`

Output ONLY the Markdown content. Make it beautiful — this document itself should reflect the quality of the design system.`;

    const userMessage = `## Design Moodboard

${moodboard.visual_direction}

### Color Palette
${JSON.stringify(moodboard.color_palette, null, 2)}

### Typography
${JSON.stringify(moodboard.typography, null, 2)}

### UI Patterns
${JSON.stringify(moodboard.ui_patterns, null, 2)}

### Motion
${JSON.stringify(moodboard.motion, null, 2)}

---

## Product Brief

**Name:** ${brief.personal.name}
**Title:** ${brief.personal.role}
**Tagline:** ${brief.personal.tagline}
**Summary:** ${brief.personal.bio || 'Not provided'}

### Vibe
${brief.style.vibe}

### Work Experience
${brief.work.map((p: { title: string; role: string; impact?: string }) => `- ${p.title}: ${p.role}${p.impact ? ' - ' + p.impact : ''}`).join('\n')}`;

    try {
        const response = await openai.chat.completions.create({
            model: GEMINI_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ],
            temperature: 0.7
        });

        return response.choices[0].message.content || createFallbackStyleGuide(brief, moodboard);
    } catch (error) {
        console.error('   ❌ Style Guide generation failed:', error);
        return createFallbackStyleGuide(brief, moodboard);
    }
}

// ============================================================================
// STEP 2: DETERMINE SECTIONS DYNAMICALLY
// ============================================================================

function determineSections(brief: Brief): Section[] {
    const sections: Section[] = [];

    // Hero is always first
    sections.push({
        name: 'hero',
        description: 'Hero section with name, tagline, and CTA'
    });

    // About section - ALWAYS include
    sections.push({
        name: 'about',
        description: 'About section with bio and professional background'
    });

    // Projects section - ALWAYS include (this is a portfolio after all)
    sections.push({
        name: 'projects',
        description: 'Projects showcase using bento grid layout'
    });

    // Skills section - ALWAYS include (AI can infer from role/projects)
    sections.push({
        name: 'skills',
        description: 'Skills and technologies section (inferred from projects and role)'
    });

    // Testimonials section - The Brief interface doesn't have testimonials, skip for now
    // Future: Add testimonials to Brief interface if needed

    // Contact is always last
    sections.push({
        name: 'contact',
        description: 'Contact form and social links'
    });

    return sections;
}

// ============================================================================
// STEP 3: GENERATE PROJECT REQUIREMENTS
// ============================================================================

async function generateProjectRequirements(
    brief: Brief,
    styleGuide: string,
    sections: Section[]
): Promise<string> {
    const systemPrompt = `You are a Senior Technical Lead. Create a PROJECT_REQUIREMENTS.md document that consolidates project information.

OUTPUT STRUCTURE:
# Project Requirements

## 1. Project Overview
[Extract from the brief: What, Who, Goal - 3 bullet points max]

## 2. Tech Stack
| Technology | Purpose |
|------------|---------|
[List: Next.js 14, Tailwind CSS, Framer Motion, Phosphor Icons, etc.]

## 3. Dependencies
- list npm packages needed based on the style guide effects

## 4. Design System
Reference: See STYLE_GUIDE.md for complete design specifications.

## 5. Page Sections
| Section | Description | Status |
|---------|-------------|--------|
${sections.map(s => `| ${s.name.charAt(0).toUpperCase() + s.name.slice(1)} | ${s.description} | Pending |`).join('\n')}

## 6. File Structure
\`\`\`
app/
├── layout.tsx
├── page.tsx
├── globals.css
components/
├── Hero.tsx
├── About.tsx
├── Projects.tsx
├── Skills.tsx
├── Contact.tsx
└── ui/
    └── Button.tsx
lib/
└── utils.ts
\`\`\`

## 7. Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

RULES:
- Keep it under 80 lines
- Do NOT duplicate the STYLE_GUIDE content
- This is an overview/index document`;

    const userMessage = `## Product Brief
Name: ${brief.personal.name}
Title: ${brief.personal.role}
Tagline: ${brief.personal.tagline}

## Style Guide (Reference Only - First 500 chars)
${styleGuide.substring(0, 500)}...`;

    try {
        const response = await openai.chat.completions.create({
            model: GEMINI_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ],
            temperature: 0.5
        });

        return response.choices[0].message.content || createFallbackRequirements(brief);
    } catch (error) {
        console.error('   ❌ Project Requirements generation failed:', error);
        return createFallbackRequirements(brief);
    }
}

// ============================================================================
// STEP 4: GENERATE SECTION SPECS
// ============================================================================

async function generateSectionSpecs(
    brief: Brief,
    moodboard: Moodboard,
    sections: Section[]
): Promise<SpecOutput[]> {
    const outputs: SpecOutput[] = [];

    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        console.log(`      - Generating ${section.name}...`);

        const systemPrompt = `You are a world-class UI/UX Architect with 15+ years of experience designing award-winning websites for clients like Apple, Stripe, and Linear. Your specifications are so precise that developers can build pixel-perfect implementations without additional clarification.

Create a production-ready specification for the "${section.name.toUpperCase()}" section.

## YOUR STANDARDS:
- Mobile-first design (320px → 1280px)
- Every element must have a purpose — no decorative noise
- Animations should guide attention, not distract
- Accessibility is non-negotiable (WCAG 2.1 AA minimum)

## OUTPUT FORMAT:
# ${i + 1}. ${section.name.charAt(0).toUpperCase() + section.name.slice(1)} Section

## Purpose
${section.description}

## Layout Architecture
- Container: [max-width, padding, background]
- Grid structure: [columns for mobile/tablet/desktop]
- Vertical rhythm: [spacing between elements]

## Component Breakdown
- [Component name with specific props/variants]
- [Include shadcn/ui pattern references where applicable]

## Content Mapping
- [Heading] → uses: name, title, or tagline from brief
- [Body text] → uses: summary or description from brief
- [Images] → uses: profile image or project images from brief

## Animation Choreography (Framer Motion)
- Entry animation: [type, duration, delay, stagger]
- Scroll-triggered: [threshold, animation]
- Hover/interaction: [scale, color, shadow changes]

## Accessibility Checklist
- Focus states for interactive elements
- Semantic HTML structure
- Color contrast requirements

## Design Notes
- [Specific visual treatments tied to moodboard colors/patterns]

Keep it under 50 lines. Be specific, actionable, and brilliant.`;

        const userMessage = `## Moodboard
${moodboard.visual_direction}

## Brief
Name: ${brief.personal.name}
Title: ${brief.personal.role}
Tagline: ${brief.personal.tagline}
Summary: ${brief.personal.bio || 'Not provided'}

## Work Experience
${brief.work.map((p: { title: string; role: string }) => `- ${p.title}: ${p.role}`).join('\n')}`;

        try {
            const response = await openai.chat.completions.create({
                model: GEMINI_MODEL,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ],
                temperature: 0.6
            });

            const content = response.choices[0].message.content || `# ${section.name} Section\n\nGeneration failed.`;
            outputs.push({
                path: `docs/sections/${i + 1}.${section.name}.md`,
                content: content
            });
            console.log(`      ✅ ${section.name} spec generated.`);

        } catch (error) {
            console.error(`      ❌ Failed to generate ${section.name}:`, error);
            outputs.push({
                path: `docs/sections/${i + 1}.${section.name}.md`,
                content: `# ${section.name} Section\n\nGeneration failed. Please regenerate.`
            });
        }
    }

    return outputs;
}

// ============================================================================
// FALLBACK GENERATORS
// ============================================================================

function createFallbackStyleGuide(brief: Brief, moodboard: Moodboard): string {
    return `# Style Guide

## Design Philosophy
A clean, modern portfolio for ${brief.personal.name} that emphasizes clarity and professional presentation.

## Color Palette
\`\`\`css
:root {
    --color-primary: ${moodboard.color_palette.primary};
    --color-secondary: ${moodboard.color_palette.secondary};
    --color-accent: ${moodboard.color_palette.accent};
    --color-background: ${moodboard.color_palette.background};
    --color-foreground: ${moodboard.color_palette.text};
    --color-muted: ${moodboard.color_palette.surface};
    --color-border: hsl(0 0% 89%);
}
\`\`\`

## Typography
\`\`\`css
:root {
    --font-heading: '${moodboard.typography.heading_font}', system-ui, sans-serif;
    --font-body: '${moodboard.typography.body_font}', system-ui, sans-serif;
    --font-size-hero: clamp(2.5rem, 5vw, 4.5rem);
    --font-size-h1: clamp(2rem, 4vw, 3rem);
    --font-size-h2: clamp(1.5rem, 3vw, 2rem);
    --font-size-body: 1rem;
}
\`\`\`

## Spacing
\`\`\`css
:root {
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-4: 1rem;
    --space-8: 2rem;
    --space-16: 4rem;
}
\`\`\`

## Animation
- Transition: 300ms ease-out
- Hover scale: 1.02
- Entry: fade-up

## MOODBOARD_CONFIG
- Motion Profile: ${moodboard.motion.profile}
`;
}

function createFallbackRequirements(brief: Brief): string {
    return `# Project Requirements

## 1. Project Overview
- Portfolio website for ${brief.personal.name}
- Role: ${brief.personal.role}
- Goal: Showcase professional work and attract opportunities

## 2. Tech Stack
| Technology | Purpose |
|------------|---------|
| Next.js 14 | Framework |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Phosphor Icons | Iconography |

## 3. Page Sections
| Section | Description | Status |
|---------|-------------|--------|
| Hero | Main landing with name and tagline | Pending |
| About | Bio and background | Pending |
| Projects | Portfolio showcase | Pending |
| Contact | Contact form and links | Pending |

## 4. Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px
`;
}
