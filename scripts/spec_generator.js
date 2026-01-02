require('dotenv').config();
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// --- Configuration ---
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
// Use Flash model for specs (cheaper, faster for documentation)
const GEMINI_MODEL = process.env.GEMINI_MODEL_FAST || "google/gemini-3-flash-preview";

// Initialize OpenAI client for OpenRouter
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: OPENROUTER_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": "https://antigravity.ai",
        "X-Title": "Antigravity CV Generator",
    }
});

/**
 * SpecGenerator: Creates STYLE_GUIDE.md using the Moodboard and Brief.
 * This follows the "Follow Along Guide" Prompt #1.
 */

async function generateStyleGuide() {
    console.log("🎨 Generating STYLE_GUIDE.md...");

    const guidelinesDir = path.join(__dirname, '../website-guidelines');
    const moodboardPath = path.join(guidelinesDir, '0.design-moodboard.md');
    const briefPath = path.join(guidelinesDir, 'product-brief.md');

    // Check if required files exist
    if (!fs.existsSync(moodboardPath)) {
        console.error("❌ Moodboard not found. Run inspiration_engine.js first.");
        return;
    }
    if (!fs.existsSync(briefPath)) {
        console.error("❌ Product Brief not found. Run brief_generator.js first.");
        return;
    }

    const moodboard = fs.readFileSync(moodboardPath, 'utf8');
    const brief = fs.readFileSync(briefPath, 'utf8');

    // The Prompt (Enhanced with expert persona)
    const systemPrompt = `You are a world-class Design Systems Engineer with over 15 years of experience at top agencies like Pentagram, IDEO, and Google. You are renowned for creating aesthetically stunning, harmonious design systems that translate beautifully into award-winning websites.

Your task is to create a comprehensive STYLE_GUIDE.md that will serve as the "Single Source of Truth" for building a visually breathtaking portfolio website.

You will be given a Design Moodboard (containing color palette, typography, UI patterns) and a Product Brief (containing client info and vibe keywords).

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

Output ONLY the Markdown content. Make it beautiful — this document itself should reflect the quality of the design system.`;

    const userMessage = `## Design Moodboard

${moodboard}

---

## Product Brief

${brief}`;

    try {
        const response = await openai.chat.completions.create({
            model: GEMINI_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ]
        });

        const styleGuideContent = response.choices[0].message.content;

        const outputPath = path.join(guidelinesDir, 'STYLE_GUIDE.md');
        fs.writeFileSync(outputPath, styleGuideContent);
        console.log(`✅ STYLE_GUIDE.md generated at: ${outputPath}`);
        return outputPath;

    } catch (error) {
        console.error("❌ Style Guide generation failed:", error.message);
        return null;
    }
}

/**
 * Generates PROJECT_REQUIREMENTS.md (Guide Prompt #2)
 * Consolidates overview, tech stack, dependencies, and section index.
 */
async function generateProjectRequirements() {
    console.log("📋 Generating PROJECT_REQUIREMENTS.md...");

    const guidelinesDir = path.join(__dirname, '../website-guidelines');
    const briefPath = path.join(guidelinesDir, 'product-brief.md');
    const styleGuidePath = path.join(guidelinesDir, 'STYLE_GUIDE.md');

    if (!fs.existsSync(briefPath) || !fs.existsSync(styleGuidePath)) {
        console.error("❌ Required files not found. Run brief_generator and spec_generator first.");
        return null;
    }

    const brief = fs.readFileSync(briefPath, 'utf8');
    const styleGuide = fs.readFileSync(styleGuidePath, 'utf8');

    const systemPrompt = `You are a Senior Technical Lead. Create a PROJECT_REQUIREMENTS.md document that consolidates project information.

OUTPUT STRUCTURE:
# Project Requirements

## 1. Project Overview
[Extract from the brief: What, Who, Goal - 3 bullet points max]

## 2. Tech Stack
| Technology | Purpose |
|------------|---------|
[List technologies: HTML5, CSS3, JavaScript, Three.js if 3D, etc.]

## 3. Dependencies
- list npm packages or CDN links needed based on the style guide effects

## 4. Design System
Reference: See STYLE_GUIDE.md for complete design specifications.

## 5. Page Sections
| Section | Description | Status |
|---------|-------------|--------|
| Hero | Main landing section with headline and CTA | Pending |
| About | Bio and professional background | Pending |
| Projects | Portfolio showcase with bento grid | Pending |
| Contact | Contact form and social links | Pending |

## 6. File Structure
\`\`\`
project/
├── index.html
├── styles/
│   └── main.css
├── scripts/
│   └── main.js
└── assets/
    └── images/
\`\`\`

## 7. Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

RULES:
- Keep it under 80 lines
- Do NOT duplicate the STYLE_GUIDE content
- This is an overview/index document`;

    const userMessage = `## Product Brief\n${brief}\n\n## Style Guide (Reference Only)\n${styleGuide.substring(0, 500)}...`;

    try {
        const response = await openai.chat.completions.create({
            model: GEMINI_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ]
        });

        const content = response.choices[0].message.content;
        const outputPath = path.join(guidelinesDir, 'PROJECT_REQUIREMENTS.md');
        fs.writeFileSync(outputPath, content);
        console.log(`✅ PROJECT_REQUIREMENTS.md generated at: ${outputPath}`);
        return outputPath;

    } catch (error) {
        console.error("❌ Project Requirements generation failed:", error.message);
        return null;
    }
}

/**
 * Determines which sections to generate based on the brief content.
 * This makes the output dynamic based on what data the user provided.
 */
function determineSections(brief) {
    const sections = [];

    // Hero is always first
    sections.push({ name: 'hero', description: 'Hero section with name, tagline, and CTA' });

    // About section - ALWAYS include
    sections.push({ name: 'about', description: 'About section with bio and professional background' });

    // Projects section - ALWAYS include
    sections.push({ name: 'projects', description: 'Projects showcase using bento grid layout' });

    // Skills section - ALWAYS include (AI can infer from role/projects)
    sections.push({ name: 'skills', description: 'Skills and technologies section (inferred from projects and role)' });

    // Testimonials section - only if user actually provided testimonials
    if (brief.includes('## Testimonials') &&
        !brief.includes('omit this') &&
        !brief.includes('none provided') &&
        !brief.includes('If none provided')) {
        // Check if there's actual content after the testimonials header
        const testimonialsMatch = brief.match(/## Testimonials\s*\n+([\s\S]*?)(?=\n##|$)/);
        if (testimonialsMatch && testimonialsMatch[1].trim().length > 20) {
            sections.push({ name: 'testimonials', description: 'Client testimonials and reviews' });
        }
    }

    // Contact is always last
    sections.push({ name: 'contact', description: 'Contact form and social links' });

    console.log(`   📋 Determined ${sections.length} sections: ${sections.map(s => s.name).join(', ')}`);
    return sections;
}

/**
 * Generates individual section spec files in website-sections/
 */
async function generateSectionSpecs() {
    console.log("📄 Generating Section Specs...");

    const guidelinesDir = path.join(__dirname, '../website-guidelines');
    const sectionsDir = path.join(__dirname, '../website-sections');
    const briefPath = path.join(guidelinesDir, 'product-brief.md');
    const moodboardPath = path.join(guidelinesDir, '0.design-moodboard.md');

    if (!fs.existsSync(sectionsDir)) {
        fs.mkdirSync(sectionsDir, { recursive: true });
    }

    const brief = fs.readFileSync(briefPath, 'utf8');
    const moodboard = fs.readFileSync(moodboardPath, 'utf8');

    // Dynamically determine sections based on brief content
    const sections = determineSections(brief);

    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        console.log(`   - Generating ${section.name}...`);

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

        const userMessage = `Moodboard:\n${moodboard}\n\nBrief:\n${brief}`;

        try {
            const response = await openai.chat.completions.create({
                model: GEMINI_MODEL,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ]
            });

            const content = response.choices[0].message.content;
            const outputPath = path.join(sectionsDir, `${i + 1}.${section.name}.md`);
            fs.writeFileSync(outputPath, content);
            console.log(`   ✅ ${section.name} spec generated.`);

        } catch (error) {
            console.error(`   ❌ Failed to generate ${section.name}:`, error.message);
        }
    }

    console.log("✅ All section specs generated.");
}

// --- CLI Execution ---
if (require.main === module) {
    const command = process.argv[2] || 'all';

    async function run() {
        if (command === 'style' || command === 'all') {
            await generateStyleGuide();
        }
        if (command === 'requirements' || command === 'all') {
            await generateProjectRequirements();
        }
        if (command === 'sections' || command === 'all') {
            await generateSectionSpecs();
        }
    }

    run();
}

module.exports = { generateStyleGuide, generateProjectRequirements, generateSectionSpecs };
