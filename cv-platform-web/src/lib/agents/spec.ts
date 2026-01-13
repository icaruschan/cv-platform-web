/**
 * Spec Agent V2 - Single LLM Call
 * 
 * Simplified spec agent that uses pre-built vibe style guides
 * and generates all section specs in a single LLM call.
 */

import OpenAI from 'openai';
import { Brief, Moodboard } from '../types';
import { getVibeStyleGuide } from '../vibes';

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "CV Platform",
    },
});

// Use Pro model for higher quality specs
const GEMINI_MODEL = process.env.GEMINI_PRO_MODEL || "google/gemini-3-pro-preview";

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
// MAIN EXPORT FUNCTION
// ============================================================================

export async function generateSpecs(
    brief: Brief,
    moodboard: Moodboard
): Promise<SpecOutput[]> {
    console.log('📐 Starting Spec Agent V2 (Single Call)...');

    const outputs: SpecOutput[] = [];

    try {
        // Step 1: Use pre-built style guide from vibe
        console.log('   🎨 Using vibe-based STYLE_GUIDE.md...');
        const styleGuide = getVibeStyleGuide(moodboard);
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
            { path: 'docs/STYLE_GUIDE.md', content: getVibeStyleGuide(moodboard) },
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

    const systemPrompt = `You are a world-class UI/UX Architect creating production-ready specifications.

Your task is to generate TWO documents in a single response:

1. **PROJECT_REQUIREMENTS.md** - High-level technical requirements
2. **SECTION_SPECS.md** - Detailed specs for each section

## STYLE GUIDE (Already defined):
${styleGuide}

## SECTIONS TO SPECIFY:
${sectionList}

## OUTPUT FORMAT:

Respond with EXACTLY this structure:

---FILE: docs/PROJECT_REQUIREMENTS.md---
# Project Requirements

## Overview
[Brief summary of the portfolio]

## Technical Stack
- Framework: Next.js with Pages Router
- Styling: Tailwind CSS + custom CSS
- Animations: Framer Motion
- Fonts: Google Fonts

## Sections
[List each section with brief requirements]

## Accessibility
- WCAG 2.1 AA compliance
- Semantic HTML
- Keyboard navigation

## Performance
- Core Web Vitals optimized
- Lazy loading for images
- Minimal JavaScript

---FILE: docs/SECTION_SPECS.md---
# Section Specifications

${sections.map(s => `## ${s.name.charAt(0).toUpperCase() + s.name.slice(1)} Section

### Purpose
${s.description}

### Layout
[Describe layout: container, grid, spacing]

### Components
[List key components with brief specs]

### Animations
[Entrance animations, hover states]

### Responsive
[Mobile/tablet/desktop breakpoints]

`).join('')}

---END---

Be concise but specific. Focus on actionable specs the builder can implement.`;

    const userMessage = `## Brief

**Name:** ${brief.personal.name}
**Role:** ${brief.personal.role}
**Tagline:** ${brief.personal.tagline}
**Bio:** ${brief.personal.bio || 'Not provided'}

### Vibe
${brief.style.vibe}

### Work Experience
${brief.work.map(p => `- **${p.title}**: ${p.role}${p.impact ? ' — ' + p.impact : ''}`).join('\n')}

### Socials
${Object.entries(brief.socials || {}).map(([k, v]) => `- ${k}: ${v}`).join('\n') || 'None provided'}

Generate the PROJECT_REQUIREMENTS.md and SECTION_SPECS.md now.`;

    try {
        const response = await openai.chat.completions.create({
            model: GEMINI_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ],
            temperature: 0.6,
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
- Fonts: Google Fonts (Inter)

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
- Full-width container with max-width 1200px
- Responsive padding: 20px mobile, 40px tablet, 80px desktop
- Center-aligned with appropriate whitespace

### Components
- Section heading with subtle animation
- Content appropriate to section purpose
- Clear visual hierarchy

### Animations
- Fade-up on scroll into view
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
