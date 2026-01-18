/**
 * Spec Agent V4 - AI-Powered Style Guide
 * 
 * Uses Gemini Flash to generate style guides from scraped moodboard data.
 * AI handles font mapping, color harmonization, and cohesive design decisions.
 */

import OpenAI from 'openai';
import { Brief, Moodboard } from '../types';

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "CV Platform",
    },
});

// Gemini Flash for fast, cheap style guide generation
const GEMINI_FLASH_MODEL = process.env.GEMINI_FLASH_MODEL || "google/gemini-3-flash-preview";
// Pro model for higher quality section specs
const GEMINI_PRO_MODEL = process.env.GEMINI_PRO_MODEL || "google/gemini-3-pro-preview";

// Types
interface SpecOutput {
    path: string;
    content: string;
}

interface Section {
    name: string;
    description: string;
}

// ============================================================================
// MANDATORY REQUIREMENTS (Override moodboard style)
// ============================================================================

const MANDATORY_REQUIREMENTS = `
## ⚠️ NON-NEGOTIABLE REQUIREMENTS
These requirements MUST be met regardless of the style guide or moodboard aesthetics:

### 1. PROFILE IMAGE (Required)
- The Hero OR About section MUST include the profile image
- Use the provided profile image URL - NEVER omit it
- Style it according to the moodboard, but it MUST be visible
- Acceptable: circular, rounded, full-width, overlapping, creative crops
- NOT acceptable: text-only About section, placeholder initials, omitting entirely

### 2. PROJECT VISUALS (Required)
- Each project card MUST have a visual element (image, screenshot, or generated gradient placeholder)
- NEVER create text-only project cards
- If no image URL provided, use a stylized gradient or pattern as placeholder
- The visual should be prominent, not a tiny thumbnail

### 3. CONTACT CTA (Required)
- Contact section MUST have a clearly visible primary CTA button
- Email link MUST be a working mailto: link
- Social icons MUST be visible for all provided handles
- The CTA should stand out as the main conversion goal

### 4. WCAG COMPLIANCE (Required)
- All text must have minimum 4.5:1 contrast ratio
- Interactive elements must have visible focus states
- Never sacrifice accessibility for aesthetics
`;

// ============================================================================
// GOOGLE FONTS MAPPER
// ============================================================================

// Known Google Fonts (safe to use)
const GOOGLE_FONTS = new Set([
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Raleway',
    'Nunito', 'Merriweather', 'Playfair Display', 'Rubik', 'Poppins', 'Outfit',
    'Plus Jakarta Sans', 'Space Grotesk', 'Syne', 'DM Sans', 'Manrope', 'Lora',
    'Work Sans', 'Fira Code', 'JetBrains Mono', 'Source Code Pro', 'IBM Plex Mono',
    'Archivo', 'Clash Display', 'Space Mono', 'Inconsolata', 'Geist', 'Geist Mono'
]);

// Map proprietary/paid fonts to Google Fonts alternatives
const FONT_ALTERNATIVES: Record<string, string> = {
    // Geometric Sans
    'circular': 'Inter',
    'sf pro': 'Inter',
    'sf pro display': 'Inter',
    'sf pro text': 'Inter',
    'product sans': 'Outfit',
    'gotham': 'Montserrat',
    'proxima nova': 'Montserrat',
    'futura': 'Outfit',
    'century gothic': 'Poppins',
    // Humanist Sans
    'avenir': 'Nunito',
    'avenir next': 'Nunito',
    'gill sans': 'Lato',
    'myriad pro': 'Open Sans',
    'segoe ui': 'Open Sans',
    'helvetica': 'Inter',
    'helvetica neue': 'Inter',
    'arial': 'Inter',
    // Serif
    'georgia': 'Merriweather',
    'times new roman': 'Lora',
    'garamond': 'Cormorant Garamond',
    // Mono
    'sf mono': 'JetBrains Mono',
    'consolas': 'Fira Code',
    'monaco': 'Source Code Pro',
    'menlo': 'JetBrains Mono',
    'courier new': 'Inconsolata',
};

function mapToGoogleFont(fontName: string | undefined, fallback: string): string {
    if (!fontName || !fontName.trim()) return fallback;

    const cleaned = fontName.trim();
    const lower = cleaned.toLowerCase();

    // Check if it's already a known Google Font
    if (GOOGLE_FONTS.has(cleaned)) return cleaned;

    // Check case-insensitive
    for (const gf of GOOGLE_FONTS) {
        if (gf.toLowerCase() === lower) return gf;
    }

    // Check for alternatives
    if (FONT_ALTERNATIVES[lower]) return FONT_ALTERNATIVES[lower];

    // Partial match in alternatives
    for (const [key, value] of Object.entries(FONT_ALTERNATIVES)) {
        if (lower.includes(key) || key.includes(lower)) return value;
    }

    // Return the original (might work) or fallback
    console.log(`   ⚠️ Unknown font "${cleaned}", falling back to "${fallback}"`);
    return fallback;
}

// ============================================================================
// AI-POWERED STYLE GUIDE GENERATOR
// ============================================================================

async function generateStyleGuideWithAI(moodboard: Moodboard, brief: Brief): Promise<string> {
    const googleFontsList = Array.from(GOOGLE_FONTS).join(', ');

    const systemPrompt = `You are a Design Systems Engineer creating CSS-ready style guides.

## YOUR TASK
Convert the scraped moodboard data into a cohesive, production-ready style guide.

## CRITICAL RULES
1. **FONTS**: You MUST only use Google Fonts. Available: ${googleFontsList}
   - If the scraped font isn't on this list, pick the closest Google Font alternative
   - Example: "Circular" → "Inter", "Avenir" → "Nunito", "Helvetica" → "Inter"
2. **COLORS**: Use the exact scraped colors. If they clash, suggest subtle adjustments.
3. **MOTION**: Follow the motion profile physics exactly.
4. **OUTPUT**: Return ONLY the markdown style guide, no explanations.

## OUTPUT FORMAT
Your response must be a complete STYLE_GUIDE.md with these exact sections:
- Design Philosophy (based on vibe)
- Color Palette (CSS variables with exact hex values)
- Typography (CSS variables with Google Fonts only)
- Spacing (8px grid system)
- Motion Profile (stiffness, damping, stagger values)
- UI Patterns (card, button, layout descriptions)
- Visual Direction`;

    const moodboardData = `
## User's Vibe
"${brief.style.vibe}"

## Scraped Colors
- Primary: ${moodboard.color_palette.primary}
- Secondary: ${moodboard.color_palette.secondary}
- Accent: ${moodboard.color_palette.accent}
- Background: ${moodboard.color_palette.background}
- Surface: ${moodboard.color_palette.surface}
- Text: ${moodboard.color_palette.text}

## Scraped Fonts (MAP TO GOOGLE FONTS)
- Heading: ${moodboard.typography.heading_font} → pick closest Google Font
- Body: ${moodboard.typography.body_font} → pick closest Google Font
- Mono: ${moodboard.typography.mono_font} → pick closest Google Font

## Motion Profile
- Profile: ${moodboard.motion.profile}
- Description: ${moodboard.motion.description}
- Physics: ${moodboard.motion.profile === 'TECH' ? 'stiffness: 150, damping: 15' : moodboard.motion.profile === 'BOLD' ? 'stiffness: 300, damping: 20' : 'stiffness: 70, damping: 20'}

## UI Patterns
- Card: ${moodboard.ui_patterns.card_style}
- Button: ${moodboard.ui_patterns.button_style}
- Layout: ${moodboard.ui_patterns.layout_structure}

## Visual Direction
${moodboard.visual_direction}

${moodboard.personality ? `## Brand Personality
- Tone: ${moodboard.personality.tone || 'Professional'}
- Energy: ${moodboard.personality.energy || 'Balanced'}
- Description: ${moodboard.personality.description || ''}` : ''}

Generate the complete STYLE_GUIDE.md now.`;

    try {
        const response = await openai.chat.completions.create({
            model: GEMINI_FLASH_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: moodboardData }
            ],
            temperature: 0.3,
            max_tokens: 2000
        });

        const content = response.choices[0].message.content?.trim() || '';

        // Ensure it starts with proper markdown header
        if (!content.startsWith('#')) {
            return `# Style Guide\n\n${content}`;
        }

        return content;

    } catch (error) {
        console.error('   ❌ AI style guide generation failed, using fallback:', error);
        // Fall back to template version
        return buildFallbackStyleGuide(moodboard, brief);
    }
}

// Fallback template if AI fails
function buildFallbackStyleGuide(moodboard: Moodboard, brief: Brief): string {
    const headingFont = mapToGoogleFont(moodboard.typography?.heading_font, 'Inter');
    const bodyFont = mapToGoogleFont(moodboard.typography?.body_font, 'Inter');
    const monoFont = mapToGoogleFont(moodboard.typography?.mono_font, 'JetBrains Mono');

    const motionPhysics = moodboard.motion.profile === 'TECH'
        ? { stiffness: 150, damping: 15, stagger: '0.05s' }
        : moodboard.motion.profile === 'BOLD'
            ? { stiffness: 300, damping: 20, stagger: '0.08s' }
            : { stiffness: 70, damping: 20, stagger: '0.15s' };

    return `# Style Guide
Generated from inspiration sources.

## Design Philosophy
${moodboard.visual_direction}

**Vibe:** ${brief.style.vibe}

---

## Color Palette (CSS Variables)
\`\`\`css
:root {
    --color-primary: ${moodboard.color_palette.primary};
    --color-secondary: ${moodboard.color_palette.secondary};
    --color-accent: ${moodboard.color_palette.accent};
    --color-background: ${moodboard.color_palette.background};
    --color-surface: ${moodboard.color_palette.surface};
    --color-text: ${moodboard.color_palette.text};
}
\`\`\`

---

## Typography
\`\`\`css
:root {
    --font-heading: '${headingFont}', system-ui, sans-serif;
    --font-body: '${bodyFont}', system-ui, sans-serif;
    --font-mono: '${monoFont}', monospace;
}
\`\`\`

**Google Fonts Import:**
\`\`\`css
@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(headingFont)}:wght@400;500;600;700&family=${encodeURIComponent(bodyFont)}:wght@400;500;600&display=swap');
\`\`\`

---

## Motion Profile: ${moodboard.motion.profile}
\`\`\`typescript
const spring = { type: "spring", stiffness: ${motionPhysics.stiffness}, damping: ${motionPhysics.damping} };
const staggerChildren = ${motionPhysics.stagger.replace('s', '')};
\`\`\`

---

## UI Patterns
- **Card:** ${moodboard.ui_patterns.card_style}
- **Button:** ${moodboard.ui_patterns.button_style}
- **Layout:** ${moodboard.ui_patterns.layout_structure}
`;
}

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

export async function generateSpecs(
    brief: Brief,
    moodboard: Moodboard
): Promise<SpecOutput[]> {
    console.log('📐 Starting Spec Agent V2 (Single Call)...');

    const outputs: SpecOutput[] = [];

    try {
        // Step 1: Build style guide from scraped moodboard data
        console.log('   🎨 Building STYLE_GUIDE.md with AI...');
        const styleGuide = await generateStyleGuideWithAI(moodboard, brief);
        outputs.push({ path: 'docs/STYLE_GUIDE.md', content: styleGuide });

        // Step 2: Determine sections
        const sections = determineSections(brief);
        console.log(`   📋 Sections: ${sections.map(s => s.name).join(', ')}`);

        // Step 3: Generate ALL specs in ONE LLM call
        console.log('   📄 Generating all specs in single call...');
        const allSpecs = await generateAllSpecsInOneCall(brief, moodboard, styleGuide, sections);
        outputs.push(...allSpecs);

        console.log(`   ✅ Spec Agent V2 complete. Generated ${outputs.length} documents.`);
        return outputs;

    } catch (error) {
        console.error("Spec Agent V2 Failed:", error);
        // Return minimal fallback
        return [
            { path: 'docs/STYLE_GUIDE.md', content: buildFallbackStyleGuide(moodboard, brief) },
            { path: 'docs/PROJECT_REQUIREMENTS.md', content: createFallbackRequirements(brief) }
        ];
    }
}

// ============================================================================
// DETERMINE SECTIONS
// ============================================================================

function determineSections(brief: Brief): Section[] {
    const sections: Section[] = [
        { name: 'hero', description: 'The first impression - name, role, tagline, and primary CTA' },
        { name: 'about', description: 'Personal story, background, and what drives them' }
    ];

    // Add projects if they have work to show
    if (brief.work && brief.work.length > 0) {
        sections.push({
            name: 'projects',
            description: `Showcase of ${brief.work.length} projects with details and impact`
        });
    }

    // Skills section for developers/tech roles
    const techRoles = ['developer', 'engineer', 'programmer', 'designer', 'architect'];
    const role = brief.personal.role?.toLowerCase() || '';
    if (techRoles.some(t => role.includes(t))) {
        sections.push({
            name: 'skills',
            description: 'Technical skills, tools, and competencies'
        });
    }

    // Always add contact
    sections.push({
        name: 'contact',
        description: 'Call to action with contact information and social links'
    });

    return sections;
}

// ============================================================================
// SINGLE LLM CALL FOR ALL SPECS
// ============================================================================

async function generateAllSpecsInOneCall(
    brief: Brief,
    moodboard: Moodboard,
    styleGuide: string,
    sections: Section[]
): Promise<SpecOutput[]> {

    const sectionList = sections.map((s, i) => `${i + 1}. ${s.name.toUpperCase()}: ${s.description}`).join('\n');

    // Determine motion profile from moodboard
    const motionProfile = moodboard.motion?.profile || 'STUDIO';
    const motionPhysics = motionProfile === 'TECH'
        ? 'stiffness: 150, damping: 15, mass: 0.8 (snappy, precise, mechanical)'
        : 'stiffness: 70, damping: 20, mass: 1 (fluid, cinematic, elegant)';

    const systemPrompt = `You are a world-class Design Systems Engineer with over 15 years of experience at top agencies like Pentagram, IDEO, and Google. You are renowned for creating aesthetically stunning, harmonious design systems that translate beautifully into award-winning websites.

## ⚠️ CRITICAL: STAY FAITHFUL TO THE USER'S VIBE
- The user's vibe description is: "${brief.style.vibe}"
- Use the user's EXACT WORDS when describing the visual style
- Do NOT invent new aesthetic labels (e.g., don't replace "sleek professional" with "high-tech luxury")
- Do NOT add elaborate design systems the user didn't ask for
- If the user says "modern professional" — give them modern and professional, not fintech-meets-creative-agency

## YOUR DESIGN PHILOSOPHY
- Every color choice should evoke emotion and reinforce brand identity
- Typography must create visual hierarchy that guides the eye naturally
- Spacing should breathe — generous whitespace is a feature, not a bug
- Animations should feel organic and purposeful, never gimmicky

## MOTION PROFILE: ${motionProfile}
- **Physics**: type: "spring", ${motionPhysics}
- **Feel**: ${motionProfile === 'TECH' ? 'Snappy, precise, mechanical — for developers & startups' : 'Fluid, resistance-heavy, cinematic — for creatives & designers'}
- **Stagger**: ${motionProfile === 'TECH' ? '0.05s (rapid fire)' : '0.15s (slow and rhythmic)'}

Your task is to generate TWO documents in a single response:

1. **PROJECT_REQUIREMENTS.md** - High-level technical requirements
2. **SECTION_SPECS.md** - Detailed specs for each section

## STYLE GUIDE (From real inspiration sites):
${styleGuide}

${MANDATORY_REQUIREMENTS}

## SECTIONS TO SPECIFY:
${sectionList}

## OUTPUT FORMAT:

Respond with EXACTLY this structure:

---FILE: docs/PROJECT_REQUIREMENTS.md---
# Project Requirements

## Overview
[Brief summary — use the user's vibe description verbatim: "${brief.style.vibe}"]

## Technical Stack
- Framework: React + Vite
- Styling: Tailwind CSS + custom CSS variables
- Animations: Framer Motion (${motionProfile} profile)
- Icons: Phosphor Icons
- Fonts: Google Fonts (from style guide)

## Motion Profile
- Profile: ${motionProfile}
- Physics: ${motionPhysics}
- All animations use spring physics, not linear eases

## Sections
[List each section with brief requirements]

## Accessibility
- WCAG 2.1 AA compliance
- Semantic HTML
- Keyboard navigation
- Focus states on all interactive elements

## Performance
- Core Web Vitals optimized
- Lazy loading for images
- Minimal JavaScript

---FILE: docs/SECTION_SPECS.md---
# Section Specifications

${sections.map((s, i) => `## ${i + 1}. ${s.name.charAt(0).toUpperCase() + s.name.slice(1)} Section

### Purpose
${s.description}

### Layout Architecture
- Container: [max-width, padding, background]
- Grid structure: [columns for mobile/tablet/desktop]
- Vertical rhythm: [spacing between elements using 8px grid]

### Component Breakdown
- [Component name with specific props/variants]
- [Include shadcn/ui pattern references where applicable]

### Content Mapping
- [Heading] → uses: name, title, or tagline from brief
- [Body text] → uses: summary or description from brief
- [Images] → uses: profile image or project images from brief

### Animation Choreography (Framer Motion - ${motionProfile} Profile)
- Entry animation: [type, duration, delay, stagger]
- Scroll-triggered: [threshold, animation]
- Hover/interaction: [scale, color, shadow changes]
- Physics: ${motionPhysics}

### Accessibility Checklist
- [ ] Focus states for interactive elements
- [ ] Semantic HTML structure (section, article, nav, etc.)
- [ ] Color contrast requirements met
- [ ] Alt text for images
- [ ] ARIA labels where needed

### Responsive Breakpoints
- Mobile (< 640px): [layout changes]
- Tablet (640-1024px): [layout changes]
- Desktop (> 1024px): [layout changes]

`).join('')}

---END---

Keep it under 50 lines per section. Be specific, actionable, and brilliant.`;

    const userMessage = `## Brief

        ** Name:** ${brief.personal.name}
** Role:** ${brief.personal.role}
** Tagline:** ${brief.personal.tagline}
** Bio:** ${brief.personal.bio || 'Not provided'}

### Vibe
${brief.style.vibe}

### Work Experience
${brief.work.map(p => `- **${p.title}**: ${p.role}${p.impact ? ' — ' + p.impact : ''}`).join('\n')}

### Socials
${Object.entries(brief.socials || {}).map(([k, v]) => `- ${k}: ${v}`).join('\n') || 'None provided'}

Generate the PROJECT_REQUIREMENTS.md and SECTION_SPECS.md now.`;

    try {
        const response = await openai.chat.completions.create({
            model: GEMINI_PRO_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ],
            temperature: 0.3,
            max_tokens: 4000
        });

        const content = response.choices[0].message.content || '';

        // Parse the response into separate files
        return parseSpecsResponse(content, brief);

    } catch (error) {
        console.error('   ❌ All-in-one specs generation failed:', error);
        return [
            { path: 'docs/PROJECT_REQUIREMENTS.md', content: createFallbackRequirements(brief) },
            { path: 'docs/SECTION_SPECS.md', content: createFallbackSectionSpecs(sections) }
        ];
    }
}

// ============================================================================
// RESPONSE PARSER
// ============================================================================

function parseSpecsResponse(content: string, brief: Brief): SpecOutput[] {
    const outputs: SpecOutput[] = [];

    // Split by file markers
    const fileRegex = /---FILE:\s*([\w\/\.]+)---\s*([\s\S]*?)(?=---FILE:|---END---|$)/gi;
    let match;

    while ((match = fileRegex.exec(content)) !== null) {
        const path = match[1].trim();
        const fileContent = match[2].trim();

        if (path && fileContent) {
            outputs.push({ path, content: fileContent });
        }
    }

    // If parsing failed, try to extract content another way
    if (outputs.length === 0) {
        // Look for markdown headings as file separators
        if (content.includes('# Project Requirements')) {
            const reqMatch = content.match(/# Project Requirements[\s\S]*?(?=# Section Specifications|$)/);
            if (reqMatch) {
                outputs.push({ path: 'docs/PROJECT_REQUIREMENTS.md', content: reqMatch[0].trim() });
            }
        }

        if (content.includes('# Section Specifications')) {
            const specMatch = content.match(/# Section Specifications[\s\S]*/);
            if (specMatch) {
                outputs.push({ path: 'docs/SECTION_SPECS.md', content: specMatch[0].trim() });
            }
        }
    }

    // If still empty, use fallback
    if (outputs.length === 0) {
        console.log('   ⚠️ Could not parse specs response, using fallback');
        const sections = determineSections(brief);
        return [
            { path: 'docs/PROJECT_REQUIREMENTS.md', content: createFallbackRequirements(brief) },
            { path: 'docs/SECTION_SPECS.md', content: createFallbackSectionSpecs(sections) }
        ];
    }

    return outputs;
}

// ============================================================================
// FALLBACKS
// ============================================================================

function createFallbackRequirements(brief: Brief): string {
    return `# Project Requirements

## Overview
Portfolio website for ${brief.personal.name}, a ${brief.personal.role}.

## Technical Stack
        - Framework: Next.js with Pages Router
            - Styling: Tailwind CSS
                - Animations: Framer Motion
                    - Fonts: Google Fonts(Inter)

## Sections
    1. Hero - Introduction with name, role, and CTA
    2. About - Personal story and background
    3. Projects - Work showcase
    4. Contact - Contact information and socials

## Accessibility
        - WCAG 2.1 AA compliance
            - Semantic HTML structure
                - Keyboard navigation support

## Performance
        - Optimized Core Web Vitals
            - Lazy loading for images
                - Minimal JavaScript bundle
            `;
}

function createFallbackSectionSpecs(sections: Section[]): string {
    let content = `# Section Specifications\n\n`;

    for (const section of sections) {
        content += `## ${section.name.charAt(0).toUpperCase() + section.name.slice(1)} Section

### Purpose
${section.description}

### Layout
        - Full - width container with max - width 1200px
            - Responsive padding: 20px mobile, 40px tablet, 80px desktop
                - Center - aligned with appropriate whitespace

### Components
        - Section heading with subtle animation
            - Content appropriate to section purpose
                - Clear visual hierarchy

### Animations
        - Fade - up on scroll into view
            - Subtle hover states on interactive elements

### Responsive
        - Mobile: Single column, stacked layout
            - Tablet: 2 columns where appropriate
                - Desktop: Full layout with all features

                    `;
    }

    return content;
}

// Re-export determineSections for use in other modules if needed
export { determineSections };
