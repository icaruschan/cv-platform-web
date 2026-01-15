import OpenAI from 'openai';
import { Brief, Moodboard } from '../types';
import { MOTION_SYSTEM_PROMPT, TECHNICAL_CONSTRAINTS_PROMPT } from './system-prompts';
import { getProfileImageUrl, getSocialLinks, formatProjectsWithImages } from '../helpers/brief-parser';

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "CV Platform",
    },
});

// Use Pro model for highest quality code generation
const GEMINI_MODEL = process.env.GEMINI_PRO_MODEL || "google/gemini-3-pro-preview";

// ============================================================================
// TYPES
// ============================================================================

interface SpecOutput {
    path: string;
    content: string;
}

interface GeneratedFile {
    path: string;
    content: string;
}

// New types for self-healing and UI feedback
export interface ThoughtStep {
    id: string;
    type: 'thinking' | 'generating' | 'validating' | 'fixing' | 'complete' | 'error';
    message: string;
    duration?: number;
    details?: string[];
}

export interface ValidationError {
    file: string;
    line?: number;
    message: string;
    fixable: boolean;
}

export interface BuilderResult {
    files: GeneratedFile[];
    thoughtSteps: ThoughtStep[];
    validationErrors: ValidationError[];
    fixAttempts: number;
    success: boolean;
}

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

export async function generateSite(
    brief: Brief,
    moodboard: Moodboard,
    specs: SpecOutput[]
): Promise<BuilderResult> {
    console.log('🏗️ Starting Builder Agent (The Constructor)...');

    const thoughtSteps: ThoughtStep[] = [];
    const startTime = Date.now();

    // Step 1: Thinking
    thoughtSteps.push({
        id: `thought-${Date.now()}`,
        type: 'thinking',
        message: 'Analyzing brief and preparing generation...',
        duration: 0,
    });

    try {
        // Extract style guide and requirements from specs
        const styleGuide = specs.find(s => s.path.includes('STYLE_GUIDE'))?.content || '';
        const requirements = specs.find(s => s.path.includes('REQUIREMENTS'))?.content || '';

        // Handle combined specs
        let sectionSpecsText = '';
        const combinedSectionSpecs = specs.find(s => s.path.includes('SECTION_SPECS'));

        if (combinedSectionSpecs) {
            sectionSpecsText = combinedSectionSpecs.content;
        } else {
            // Fallback for legacy specs format
            const legacySectionSpecs = specs.filter(s => s.path.includes('sections/'));
            sectionSpecsText = legacySectionSpecs.map(s => {
                const name = s.path.split('/').pop()?.replace('.md', '') || 'section';
                return `\n--- SPEC FOR SECTION: ${name.toUpperCase()} ---\n${s.content}\n`;
            }).join('\n');
        }

        // Extract social links and profile data using brief-parser helpers
        const socialLinks = getSocialLinks(brief);
        const profileImageUrl = getProfileImageUrl(brief);

        // Format work experience with project images using brief-parser helper
        const formattedProjects = formatProjectsWithImages(brief);
        const projectsJson = JSON.stringify(formattedProjects, null, 2);

        // Build the comprehensive system prompt
        const systemPrompt = buildSystemPrompt(
            brief,
            moodboard,
            styleGuide,
            sectionSpecsText,
            socialLinks,
            profileImageUrl,
            projectsJson
        );

        // Build user message
        const userMessage = buildUserMessage(brief, moodboard, styleGuide, requirements, sectionSpecsText);

        // Step 2: Generating
        const genStart = Date.now();
        thoughtSteps.push({
            id: `gen-${Date.now()}`,
            type: 'generating',
            message: 'Generating complete React site code...',
        });

        console.log('   📝 Generating complete site code...');

        const response = await openai.chat.completions.create({
            model: GEMINI_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ],
            temperature: 0.7
        });

        const fullResponse = response.choices[0].message.content || '';
        const genDuration = Math.round((Date.now() - genStart) / 1000);

        // Update generating step with duration
        thoughtSteps[thoughtSteps.length - 1].duration = genDuration;

        // Parse files from response
        let files = parseFiles(fullResponse);

        // Step 3: Validating
        const valStart = Date.now();
        thoughtSteps.push({
            id: `val-${Date.now()}`,
            type: 'validating',
            message: 'Analyzing for errors...',
        });

        console.log('   🔍 Validating generated code...');
        let errors = detectErrors(files);
        const valDuration = Math.round((Date.now() - valStart) / 1000);
        thoughtSteps[thoughtSteps.length - 1].duration = valDuration;
        thoughtSteps[thoughtSteps.length - 1].details = errors.map(e => `${e.file}: ${e.message}`);

        // Step 4: Auto-fix if needed
        let fixAttempts = 0;
        if (errors.filter(e => e.fixable).length > 0) {
            fixAttempts = 1;
            thoughtSteps.push({
                id: `fix-${Date.now()}`,
                type: 'fixing',
                message: `Auto-fixing ${errors.filter(e => e.fixable).length} issues...`,
                details: errors.filter(e => e.fixable).map(e => e.message),
            });

            console.log(`   🔧 Auto-fixing ${errors.filter(e => e.fixable).length} issues...`);
            files = autoFixErrors(files, errors);

            // Re-validate after fix
            errors = detectErrors(files);
        }

        // Apply legacy validation as final cleanup
        const validatedFiles = files.map(f => ({
            ...f,
            content: validateAndFix(f.content, f.path)
        }));

        // Step 5: Complete
        const totalDuration = Math.round((Date.now() - startTime) / 1000);
        thoughtSteps.push({
            id: `complete-${Date.now()}`,
            type: 'complete',
            message: `Generated ${validatedFiles.length} files`,
            duration: totalDuration,
            details: validatedFiles.map(f => f.path),
        });

        console.log(`   ✅ Builder Agent complete. Generated ${validatedFiles.length} files.`);

        return {
            files: validatedFiles,
            thoughtSteps,
            validationErrors: errors,
            fixAttempts,
            success: true,
        };

    } catch (error) {
        console.error("Builder Agent Failed:", error);

        thoughtSteps.push({
            id: `error-${Date.now()}`,
            type: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });

        const fallbackFiles = createFallbackSite(brief, moodboard);

        return {
            files: fallbackFiles,
            thoughtSteps,
            validationErrors: [],
            fixAttempts: 0,
            success: false,
        };
    }
}

// ============================================================================
// SYSTEM PROMPT BUILDER
// ============================================================================

function buildSystemPrompt(
    brief: Brief,
    moodboard: Moodboard,
    styleGuide: string,
    sectionSpecs: string,
    socialLinks: Record<string, string>,
    profileImageUrl: string,
    projectsJson: string
): string {
    return `## ⚠️ CRITICAL RULES (READ FIRST)
These rules are NON-NEGOTIABLE. Violating any of them will result in a failed generation.

1. **ICONS**: Use Phosphor Icons ONLY. Import from '@phosphor-icons/react'.
   - ❌ NEVER use: lucide-react, heroicons, react-icons, or any other icon library
   - ✅ Example: import { User, Envelope, LinkedinLogo, TwitterLogo } from '@phosphor-icons/react'

2. **NO NEXT.JS**: This is a Vite project. Do NOT use any Next.js imports.
   - ❌ NEVER use: next/image, next/link, next/head, next/router
   - ✅ Use: standard <img>, <a>, React Router (if needed)

3. **MOTION PHYSICS**: Current profile is "${moodboard.motion.profile}".
   ${moodboard.motion.profile === 'STUDIO' ? '- Use: stiffness: 70, damping: 20 (slow, fluid, elegant)' : ''}
   ${moodboard.motion.profile === 'TECH' ? '- Use: stiffness: 150, damping: 15 (snappy, precise, energetic)' : ''}
   ${moodboard.motion.profile === 'BOLD' ? '- Use: stiffness: 300, damping: 20 (explosive, playful)' : ''}

4. **DATA INTEGRITY**: Use ONLY the provided data below. Do NOT invent any content.

---

## 🎯 DATA ANCHOR (This Portfolio Is For)
- **Name**: ${brief.personal.name}
- **Role**: ${brief.personal.role}
- **Tagline**: ${brief.personal.tagline}

---

You are an elite frontend engineer and visual designer, renowned for crafting breathtakingly beautiful, pixel-perfect websites with fluid, cinematic animations. Your work has been featured on Awwwards and CSS Design Awards.

## ARCHITECTURE: REACT + VITE
- **Framework**: React 18 (Standard Client-Side)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (using variables from index.css)
- **Animation**: Framer Motion
- **Icons**: Phosphor Icons (see CRITICAL RULES above)
- **Components**: shadcn/ui patterns (inline, no external imports)

## VISUAL CONSISTENCY RULES
1. **ONE ACCENT COLOR**: Use CSS variables: 'var(--color-primary)' for accents.
2. **CONSISTENT BUTTONS**: All CTAs must look identical (same radius, padding, hover effect).
3. **TYPOGRAPHY HIERARCHY**: 
   - 'font-heading' for ALL headings (h1-h6)
   - 'font-body' for ALL body text
4. **SPACING RHYTHM**: Use consistent padding/margins from the 8px grid.

## VOICE & TONE
- Write ALL bio/about text in FIRST PERSON ("I am", "my work", "I've built")
- NEVER use third person ("${brief.personal.name} is", "He has", "She works")
- If the provided summary is in third person, CONVERT it to first person

## ANIMATION ENGINE
${MOTION_SYSTEM_PROMPT}

## FULL DATA SOURCES
- Name: ${brief.personal.name}
- Title: ${brief.personal.role}
- Tagline: ${brief.personal.tagline}
- Bio: ${brief.personal.bio || 'Not provided'}
- Location: ${brief.personal.location || 'Not provided'}
- Profile Image: ${profileImageUrl}
- Email: ${socialLinks.email || brief.personal.email || 'Not provided'}
- Twitter: ${socialLinks.twitter || 'Not provided'}
- LinkedIn: ${socialLinks.linkedin || 'Not provided'}
- Projects/Work: ${projectsJson}

## DATA BINDING INSTRUCTIONS
1. **Profile Image**: Use the provided URL in an <img /> tag.
2. **Project Links**: Each project has a 'link' field.
   - If it starts with '@', convert to Twitter URL: 'https://x.com/[handle without @]'
   - If it's a full URL (starts with 'http'), use it directly
   - Make the ENTIRE project card clickable using <a> with target="_blank"
3. **Social Links**: Render icon buttons only if the URL is not 'Not provided'. Hide missing ones.

---

## 📝 OUTPUT FORMAT
Return a single raw text response. Separate files using this marker:
### FILE: [path]
[code content]

## FILES TO GENERATE (REQUIRED)
1. src/main.tsx (Entry point, mounts App to root)
2. src/App.tsx (Main app wrapper)
3. src/index.css (CSS variables from Style Guide + Tailwind setup)
4. tailwind.config.ts (ESM format, extending theme with CSS vars)
5. src/components/Hero.tsx
6. src/components/About.tsx
7. src/components/Projects.tsx
8. src/components/Skills.tsx
9. src/components/Contact.tsx

**PATH RULES:**
- All code goes in 'src/' (except tailwind.config.ts)
- Import components using relative paths: './components/Hero'
- Import styles in main.tsx: "import './index.css'"

**TAILWIND CONFIG:**
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        text: "var(--color-text)",
      },
      fontFamily: {
        heading: "var(--font-heading)",
        body: "var(--font-body)",
        mono: "var(--font-mono)",
      }
    }
  },
  plugins: [],
}

---

## ⚠️ FINAL REMINDER (READ BEFORE GENERATING)
Before you generate, confirm these are followed:
- [ ] Icons are from '@phosphor-icons/react' ONLY (not lucide, heroicons, etc.)
- [ ] No Next.js imports (no next/image, next/link, next/head)
- [ ] Motion uses ${moodboard.motion.profile} profile physics
- [ ] All content uses ONLY the provided data (no hallucinations)
- [ ] Bio/about is in FIRST PERSON voice

Generate ALL files now. Ensure perfectly consistent design across all components.`;
}

// ============================================================================
// USER MESSAGE BUILDER
// ============================================================================

function buildUserMessage(
    brief: Brief,
    moodboard: Moodboard,
    styleGuide: string,
    requirements: string,
    sectionSpecs: string
): string {
    return `## 1. PRODUCT BRIEF
Name: ${brief.personal.name}
Role: ${brief.personal.role}
Tagline: ${brief.personal.tagline}
Bio: ${brief.personal.bio || 'Not provided'}

## 2. MOODBOARD VISUALS
${moodboard.visual_direction}

Color Palette:
${JSON.stringify(moodboard.color_palette, null, 2)}

Typography:
${JSON.stringify(moodboard.typography, null, 2)}

Motion Profile: ${moodboard.motion.profile}
Motion Description: ${moodboard.motion.description}

## 3. STYLE GUIDE
${styleGuide.substring(0, 4000)}

## 4. REQUIREMENTS
${requirements.substring(0, 2000)}

## 5. SECTION SPECIFICATIONS
${sectionSpecs}

## 6. WORK EXPERIENCE / PROJECTS
${brief.work.map(p => `- ${p.title}: ${p.role} - ${p.description}`).join('\n')}

Generate the complete React portfolio website now. Ensure:
- All sections use consistent design tokens
- First-person voice in all copy
- Proper spring physics based on Motion Profile
- All social links are correctly rendered
- Project cards are clickable with proper hover states`;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function extractSocialLinks(brief: Brief): Record<string, string> {
    const links: Record<string, string> = {};

    if (brief.socials) {
        for (const [key, value] of Object.entries(brief.socials)) {
            if (value && value !== 'Not provided' && value.trim() !== '') {
                links[key.toLowerCase()] = value;
            }
        }
    }

    // Add email from personal if not in socials
    if (brief.personal.email && !links.email) {
        links.email = brief.personal.email;
    }

    return links;
}

// ============================================================================
// FILE PARSER
// ============================================================================

function parseFiles(response: string): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const lines = response.split('\n');
    let currentFile: string | null = null;
    let currentContent: string[] = [];

    for (const line of lines) {
        // Check for file marker
        const fileMatch = line.match(/^###\s*FILE:\s*(.+?)\s*$/i);

        if (fileMatch) {
            if (currentFile) {
                let content = currentContent.join('\n').trim();
                content = content.replace(/^```[\w-]*\n?/, '').replace(/```$/, '').trim();
                files.push({ path: normalizePath(currentFile), content });
            }
            currentFile = fileMatch[1].trim();
            currentContent = [];
        } else {
            if (currentFile) {
                currentContent.push(line);
            }
        }
    }

    if (currentFile) {
        let content = currentContent.join('\n').trim();
        content = content.replace(/^```[\w-]*\n?/, '').replace(/```$/, '').trim();
        files.push({ path: normalizePath(currentFile), content });
    }

    console.log(`   📊 Parsed ${files.length} files: ${files.map(f => f.path).join(', ')}`);
    return files;
}

function normalizePath(path: string): string {
    // Remove leading slash
    let normalized = path.startsWith('/') ? path.slice(1) : path;

    // Ensure src prefix if missing
    if (!normalized.startsWith('src/') && (normalized.endsWith('.tsx') || normalized.endsWith('.ts') || normalized.endsWith('.css'))) {
        if (normalized === 'vite.config.ts' || normalized === 'index.html' || normalized === 'package.json') {
            // root files, keep as is
        } else {
            normalized = `src/${normalized}`;
        }
    }

    return normalized;
}

// ============================================================================
// VALIDATION & FIXES
// ============================================================================

export function detectErrors(files: GeneratedFile[]): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const file of files) {
        // Skip non-code files
        if (!file.path.endsWith('.tsx') && !file.path.endsWith('.ts')) {
            continue;
        }

        // ==== Next.js imports (existing) ====
        if (file.content.includes("from 'next/") || file.content.includes('from "next/')) {
            errors.push({
                file: file.path,
                message: "Next.js imports (next/*) are not supported in Vite",
                fixable: true,
            });
        }

        // ==== React hooks usage without imports ====
        const reactHooks = ['useState', 'useEffect', 'useRef', 'useMemo', 'useCallback', 'useContext', 'useReducer', 'useLayoutEffect'];
        const usedHooks = reactHooks.filter(hook =>
            new RegExp(`\\b${hook}\\b`).test(file.content)
        );
        if (usedHooks.length > 0 && !file.content.includes("from 'react'") && !file.content.includes('from "react"')) {
            errors.push({
                file: file.path,
                message: `Using React hooks (${usedHooks.join(', ')}) without importing from 'react'`,
                fixable: true,
            });
        }

        // ==== motion usage without import (existing, enhanced) ====
        if (file.content.includes('motion.') && !file.content.includes("from 'framer-motion'") && !file.content.includes('from "framer-motion"')) {
            errors.push({
                file: file.path,
                message: "Using 'motion' without importing from 'framer-motion'",
                fixable: true,
            });
        }

        // ==== AnimatePresence usage without import ====
        if (file.content.includes('<AnimatePresence') && !file.content.includes("AnimatePresence") && !file.content.match(/import\s*\{[^}]*AnimatePresence[^}]*\}\s*from\s*['"]framer-motion['"]/)) {
            errors.push({
                file: file.path,
                message: "Using 'AnimatePresence' without importing from 'framer-motion'",
                fixable: true,
            });
        }

        // ==== Phosphor Icons usage (informational) ====
        if (file.content.includes('@phosphor-icons/react') || file.content.match(/from ['""]@phosphor-icons/)) {
            errors.push({
                file: file.path,
                message: "Uses Phosphor Icons - will render via icon font in preview",
                fixable: false, // Informational only
            });
        }

        // ==== Lucide React icons without import ====
        const lucideIconPattern = /\b(ArrowRight|ArrowLeft|ArrowDown|ArrowUp|Mail|ExternalLink|Check|X|Menu|ChevronDown|ChevronRight|Github|Linkedin|Twitter|User|Phone|MapPin|Calendar|Clock|Star)\b/g;
        const lucideIcons = file.content.match(lucideIconPattern) || [];
        const uniqueLucideIcons = [...new Set(lucideIcons)];
        if (uniqueLucideIcons.length > 0 && !file.content.includes("from 'lucide-react'") && !file.content.includes('from "lucide-react"')) {
            // Check if they're actually being used as JSX components
            const usedAsJsx = uniqueLucideIcons.filter(icon =>
                new RegExp(`<${icon}[\\s/>]`).test(file.content)
            );
            if (usedAsJsx.length > 0) {
                errors.push({
                    file: file.path,
                    message: `Using Lucide icons (${usedAsJsx.join(', ')}) without importing from 'lucide-react'`,
                    fixable: true,
                });
            }
        }

        // ==== Malformed destructuring: const { x } from 'module' ====
        const malformedDestructure = file.content.match(/const\s*\{[^}]+\}\s+from\s+['"]/);
        if (malformedDestructure) {
            errors.push({
                file: file.path,
                message: "Malformed destructuring: 'const {...} from' should be 'import {...} from'",
                fixable: true,
            });
        }

        // ==== Syntax validation using Function constructor ====
        try {
            // Strip imports/exports and try to parse
            const strippedCode = file.content
                .replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '')
                .replace(/export\s+(default\s+)?/g, '')
                .replace(/export\s*\{[^}]*\};?/g, '');
            new Function(strippedCode);
        } catch (e: any) {
            // Only report syntax errors, not reference errors
            if (e.message && !e.message.includes('is not defined')) {
                errors.push({
                    file: file.path,
                    message: `Potential syntax error: ${e.message.split('\n')[0]}`,
                    fixable: false,
                });
            }
        }

        // ==== Check for empty component bodies ====
        if (file.path.includes('/components/') && file.content.includes('export default function')) {
            const returnMatch = file.content.match(/return\s*\(\s*\)/);
            if (returnMatch) {
                errors.push({
                    file: file.path,
                    message: "Component returns empty JSX - may cause blank render",
                    fixable: false,
                });
            }
        }

        // ==== Check for 'use client' directive (cleanup, not error) ====
        if (file.content.includes("'use client'") || file.content.includes('"use client"')) {
            // Not an error in Vite, but we can clean it up silently
        }
    }

    return errors;
}

export function autoFixErrors(files: GeneratedFile[], errors: ValidationError[]): GeneratedFile[] {
    return files.map(file => {
        let content = file.content;
        const fileErrors = errors.filter(e => e.file === file.path && e.fixable);

        for (const error of fileErrors) {
            // ==== Remove Next.js Image ====
            if (content.includes("from 'next/image'") || content.includes('from "next/image"')) {
                content = content.replace(/import\s+Image\s+from\s+['"]next\/image['"];?\n?/g, '');
                content = content.replace(/<Image/g, '<img');
            }

            // ==== Remove Next.js Link ====
            if (content.includes("from 'next/link'") || content.includes('from "next/link"')) {
                content = content.replace(/import\s+Link\s+from\s+['"]next\/link['"];?\n?/g, '');
                content = content.replace(/<Link/g, '<a');
                content = content.replace(/<\/Link>/g, '</a>');
            }

            // ==== Fix missing framer-motion import for motion ====
            if (error.message.includes("'motion' without importing")) {
                if (!content.includes("import { motion }") && !content.includes("import {motion}")) {
                    // Add to existing framer-motion import or create new one
                    if (content.includes("from 'framer-motion'")) {
                        content = content.replace(
                            /import\s*\{([^}]*)\}\s*from\s*['"]framer-motion['"]/,
                            (match, imports) => `import { ${imports.trim()}, motion } from 'framer-motion'`
                        );
                    } else {
                        content = "import { motion } from 'framer-motion';\n" + content;
                    }
                }
            }

            // ==== Fix missing AnimatePresence import ====
            if (error.message.includes("'AnimatePresence' without importing")) {
                if (!content.includes("AnimatePresence")) {
                    if (content.includes("from 'framer-motion'")) {
                        content = content.replace(
                            /import\s*\{([^}]*)\}\s*from\s*['"]framer-motion['"]/,
                            (match, imports) => `import { ${imports.trim()}, AnimatePresence } from 'framer-motion'`
                        );
                    } else {
                        content = "import { AnimatePresence } from 'framer-motion';\n" + content;
                    }
                }
            }

            // ==== Fix missing React hooks imports ====
            if (error.message.includes("React hooks") && error.message.includes("without importing")) {
                const reactHooks = ['useState', 'useEffect', 'useRef', 'useMemo', 'useCallback', 'useContext', 'useReducer', 'useLayoutEffect'];
                const usedHooks = reactHooks.filter(hook =>
                    new RegExp(`\\b${hook}\\b`).test(content)
                );
                if (usedHooks.length > 0) {
                    // Check if there's already a React import to extend
                    if (content.includes("from 'react'") || content.includes('from "react"')) {
                        // Extend existing import
                        content = content.replace(
                            /import\s*\{([^}]*)\}\s*from\s*['"]react['"]/,
                            (match, imports) => {
                                const existingImports = imports.split(',').map((i: string) => i.trim()).filter(Boolean);
                                const newImports = [...new Set([...existingImports, ...usedHooks])];
                                return `import { ${newImports.join(', ')} } from 'react'`;
                            }
                        );
                    } else {
                        // Add new import
                        content = `import { ${usedHooks.join(', ')} } from 'react';\n` + content;
                    }
                }
            }

            // ==== Fix missing Lucide icons imports ====
            if (error.message.includes("Lucide icons") && error.message.includes("without importing")) {
                const match = error.message.match(/\(([^)]+)\)/);
                if (match) {
                    const icons = match[1].split(',').map(s => s.trim());
                    if (content.includes("from 'lucide-react'") || content.includes('from "lucide-react"')) {
                        content = content.replace(
                            /import\s*\{([^}]*)\}\s*from\s*['"]lucide-react['"]/,
                            (match, imports) => {
                                const existingImports = imports.split(',').map((i: string) => i.trim()).filter(Boolean);
                                const newImports = [...new Set([...existingImports, ...icons])];
                                return `import { ${newImports.join(', ')} } from 'lucide-react'`;
                            }
                        );
                    } else {
                        content = `import { ${icons.join(', ')} } from 'lucide-react';\n` + content;
                    }
                }
            }

            // ==== Fix malformed destructuring ====
            if (error.message.includes("Malformed destructuring")) {
                // Convert "const { x } from 'module'" to "import { x } from 'module'"
                content = content.replace(
                    /const\s*(\{[^}]+\})\s+from\s+(['"][^'"]+['"])/g,
                    'import $1 from $2'
                );
            }
        }

        // ==== Always clean up 'use client' directive ====
        content = content.replace(/['"]use client['"];?\s*\n?/g, '');

        return { path: file.path, content };
    });
}


function validateAndFix(code: string, filePath: string): string {
    let fixed = code;

    // Clean 'use client'
    fixed = fixed.replace(/['"]use client['"];?\n*/g, '');

    // Ensure sections have IDs
    const sectionName = filePath.split('/').pop()?.replace('.tsx', '').toLowerCase();

    // Skip non-section files
    if (sectionName && !['app', 'main', 'hero', 'about', 'projects', 'contact', 'skills'].includes(sectionName)) {
        return fixed;
    }

    if (sectionName && ['hero', 'about', 'projects', 'contact', 'skills'].includes(sectionName)) {
        if (!fixed.includes(`id="${sectionName}"`) && !fixed.includes(`id={'${sectionName}'}`)) {
            fixed = fixed.replace(/<section([^>]*)>/i, `<section id="${sectionName}"$1>`);
        }
    }

    return fixed;
}

// ============================================================================
// FALLBACK SITE
// ============================================================================

function createFallbackSite(brief: Brief, moodboard: Moodboard): GeneratedFile[] {
    console.warn('   ⚠️ Using fallback site generation');

    const safeName = brief.personal.name.replace(/'/g, "\\'");
    const safeRole = brief.personal.role.replace(/'/g, "\\'");
    const safeEmail = brief.personal.email || 'hello@example.com';

    const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: ${moodboard.color_palette.primary};
  --color-secondary: ${moodboard.color_palette.secondary};
  --color-accent: ${moodboard.color_palette.accent};
  --color-background: ${moodboard.color_palette.background};
  --color-foreground: ${moodboard.color_palette.text};
  --color-surface: ${moodboard.color_palette.surface};
}

body {
  background: var(--color-background);
  color: var(--color-foreground);
  font-family: sans-serif;
}`;

    const mainTsx = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`;

    const appTsx = `import React from 'react';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';

export default function App() {
  return (
    <main className="min-h-screen">
      <Hero />
      <About />
      <Projects />
      <Contact />
    </main>
  );
}`;

    const heroTsx = `import React from 'react';
export default function Hero() {
  return (
    <section id="hero" className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">${safeName}</h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-4">${safeRole}</p>
      </div>
    </section>
  );
}`;

    const aboutTsx = `import React from 'react';
export default function About() {
  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">About Me</h2>
        <p className="text-lg leading-relaxed">Passionate about building great things.</p>
      </div>
    </section>
  );
}`;

    const projectsTsx = `import React from 'react';
export default function Projects() {
  return (
    <section id="projects" className="py-24 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center">Work</h2>
        <p className="text-center">Projects coming soon.</p>
      </div>
    </section>
  );
}`;

    const contactTsx = `import React from 'react';
export default function Contact() {
  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8">Get in Touch</h2>
        <a href="mailto:${safeEmail}" className="inline-block bg-black text-white px-8 py-3 rounded-lg">Contact Me</a>
      </div>
    </section>
  );
}`;

    return [
        { path: 'src/main.tsx', content: mainTsx },
        { path: 'src/App.tsx', content: appTsx },
        { path: 'src/index.css', content: indexCss },
        { path: 'src/components/Hero.tsx', content: heroTsx },
        { path: 'src/components/About.tsx', content: aboutTsx },
        { path: 'src/components/Projects.tsx', content: projectsTsx },
        { path: 'src/components/Contact.tsx', content: contactTsx },
    ];
}
