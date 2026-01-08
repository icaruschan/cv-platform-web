import OpenAI from 'openai';
import { Brief, Moodboard } from '../types';
import { MOTION_SYSTEM_PROMPT, TECHNICAL_CONSTRAINTS_PROMPT } from './system-prompts';

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
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

    // Handle both old format (sections/*.md) and new format (SECTION_SPECS.md)
    let sectionSpecsText = '';
    const legacySectionSpecs = specs.filter(s => s.path.includes('sections/'));
    const combinedSectionSpecs = specs.find(s => s.path.includes('SECTION_SPECS'));

    if (legacySectionSpecs.length > 0) {
      // Old format: individual section files
      sectionSpecsText = legacySectionSpecs.map(s => {
        const name = s.path.split('/').pop()?.replace('.md', '') || 'section';
        return `\n--- SPEC FOR SECTION: ${name.toUpperCase()} ---\n${s.content}\n`;
      }).join('\n');
    } else if (combinedSectionSpecs) {
      // New format: combined SECTION_SPECS.md
      sectionSpecsText = combinedSectionSpecs.content;
    }

    // Extract social links and profile data
    const socialLinks = extractSocialLinks(brief);
    const profileImageUrl = brief.personal.avatar_url || 'https://via.placeholder.com/400';

    // Format work experience for prompt
    const projectsJson = JSON.stringify(brief.work.map(p => ({
      name: p.title,
      role: p.role,
      description: p.description,
      impact: p.impact || '',
      link: p.link || ''
    })), null, 2);

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
      message: 'Generating complete site code...',
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
  return `You are an elite frontend engineer and visual designer, renowned for crafting breathtakingly beautiful, pixel-perfect websites with fluid, cinematic animations. Your work has been featured on Awwwards and CSS Design Awards. You obsess over buttery-smooth micro-interactions, typography harmony, and motion design that feels alive. Your animations are subtle yet impactful — never flashy, always purposeful.

## ARCHITECTURE
- Next.js 14 App Router
- Tailwind CSS (using variables from globals.css)
- Framer Motion (for all animations)
- Phosphor Icons (use Regular weight by default, Bold for emphasis) - import from '@phosphor-icons/react'
- shadcn/ui patterns (inline, no external imports)

## VISUAL CONSISTENCY RULES (NON-NEGOTIABLE)
1. **ONE ACCENT COLOR**: Use the primary accent from the style guide EVERYWHERE.
   - NEVER mix different accent colors across sections.
   - Use CSS variables: 'var(--color-primary)' for accents.
2. **CONSISTENT BUTTONS**: All CTAs must look identical (same radius, padding, hover effect).
3. **TYPOGRAPHY HIERARCHY**: 
   - 'font-heading' for ALL headings (h1-h6)
   - 'font-body' for ALL body text
   - **NEVER use 'font-mono'** unless displaying actual code.
4. **SPACING RHYTHM**: Use consistent padding/margins from the 8px grid.

## VOICE & TONE (CRITICAL)
- Write ALL bio/about text in FIRST PERSON ("I am", "my work", "I've built")
- NEVER use third person ("${brief.personal.name} is", "He has", "She works")
- If the provided summary is in third person, CONVERT it to first person

## ANIMATION & PHYSICS ENGINE (CRITICAL)
${MOTION_SYSTEM_PROMPT}

## MOTION PROFILE CHECK
Look at the Style Guide for the "Motion Profile" in MOODBOARD_CONFIG.
- Current Profile: ${moodboard.motion.profile}
- If STUDIO: Use stiffness: 70, damping: 20 (slow, fluid, elegant)
- If TECH: Use stiffness: 150, damping: 15 (snappy, precise, energetic)
Apply these values to ALL <motion.div> transitions.

## TECHNICAL CONSTRAINTS
${TECHNICAL_CONSTRAINTS_PROMPT}

## DATA SOURCES (USE EXACTLY — DO NOT HALLUCINATE)
- Name: ${brief.personal.name}
- Title: ${brief.personal.role}
- Tagline: ${brief.personal.tagline}
- Bio: ${brief.personal.bio || 'Not provided'}
- Location: ${brief.personal.location || 'Not provided'}
- Profile Image: ${profileImageUrl}
- Email: ${socialLinks.email || brief.personal.email || 'Not provided'}
- Twitter: ${socialLinks.twitter || 'Not provided'}
- LinkedIn: ${socialLinks.linkedin || 'Not provided'}
- Discord: ${socialLinks.discord || 'Not provided'}
- Projects/Work: ${projectsJson}

## DATA BINDING INSTRUCTIONS
1. **Profile Image**: Use the provided URL in an <Image> component with proper next/image props.
2. **Project Links (CRITICAL)**: Each project has a 'link' field.
   - If it starts with '@', convert to Twitter URL: 'https://x.com/[handle without @]'
   - If it's a full URL (starts with 'http'), use it directly
   - Make the ENTIRE project card clickable using <a> or Link with target="_blank"
   - Add hover effects to indicate clickability
3. **Social Links**: Render icon buttons only if the URL is not 'Not provided'. Hide missing ones.
4. **Experience Display**: Show professional experience prominently in About section.

## OUTPUT FORMAT
Return a single raw text response. Separate files using this marker:
### FILE: [path]
[code content]

Example:
### FILE: pages/index.tsx
import Hero from '../components/Hero';
...

### FILE: components/Hero.tsx
'use client';
...

## FILES TO GENERATE (PAGES ROUTER - REQUIRED FOR SANDPACK)
1. pages/_app.tsx (Main app wrapper with Google Font imports)
2. pages/index.tsx (Main page importing all sections)
3. styles/globals.css (CSS variables from Style Guide + Tailwind setup)
4. components/Hero.tsx
5. components/About.tsx
6. components/Projects.tsx
7. components/Skills.tsx
8. components/Contact.tsx

**IMPORTANT PATH RULES:**
- Use 'pages/' NOT 'app/' (Sandpack only supports Pages Router)
- Import components from '../components/' NOT '@/components/'
- Import styles as 'import '../styles/globals.css'' in _app.tsx

Generate ALL files in a single response. Ensure perfectly consistent design across all components.`;
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

Generate the complete Next.js portfolio website now. Ensure:
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
    // Check for file marker - handle various formats
    const fileMatch = line.match(/^###\s*FILE:\s*(.+?)\s*$/i) ||
      line.match(/^###\s*(.+\.tsx?)\s*$/i);

    if (fileMatch) {
      // Save previous file
      if (currentFile) {
        let content = currentContent.join('\n').trim();
        // Clean markdown code blocks if present
        content = content.replace(/^```tsx?\n?/, '').replace(/```$/, '').trim();
        files.push({ path: normalizePath(currentFile), content });
      }
      // Start new file
      currentFile = fileMatch[1].trim();
      currentContent = [];
    } else {
      if (currentFile) {
        currentContent.push(line);
      }
    }
  }

  // Save last file
  if (currentFile) {
    let content = currentContent.join('\n').trim();
    content = content.replace(/^```tsx?\n?/, '').replace(/```$/, '').trim();
    files.push({ path: normalizePath(currentFile), content });
  }

  console.log(`   📊 Parsed ${files.length} files: ${files.map(f => f.path).join(', ')}`);
  return files;
}

function normalizePath(path: string): string {
  // Remove leading slash if present
  let normalized = path.startsWith('/') ? path.slice(1) : path;

  // Ensure proper file structure
  if (!normalized.includes('/')) {
    // If no path, assume components folder for .tsx files
    if (normalized.endsWith('.tsx') && !normalized.includes('page') && !normalized.includes('layout')) {
      normalized = `components/${normalized}`;
    }
  }

  return normalized;
}

// ============================================================================
// VALIDATION & FIXES
// ============================================================================

/**
 * Detect common errors that would break Sandpack
 */
export function detectErrors(files: GeneratedFile[]): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const file of files) {
    // Check for 'use client' in Pages Router files (Sandpack doesn't support it)
    if (file.path.includes('pages/') && (file.content.includes("'use client'") || file.content.includes('"use client"'))) {
      errors.push({
        file: file.path,
        message: "'use client' directive not supported in Pages Router",
        fixable: true,
      });
    }

    // Check for @/ imports (Sandpack doesn't resolve path aliases)
    if (file.content.includes("from '@/")) {
      errors.push({
        file: file.path,
        message: "Path alias '@/' not supported in Sandpack - use relative imports",
        fixable: true,
      });
    }

    // Check for missing React import in TSX files
    if (file.path.endsWith('.tsx') && !file.content.includes("import React") && !file.content.includes("from 'react'")) {
      // This is often fine in modern React, but note it
    }

    // Check for motion usage without import
    if (file.content.includes('motion.') && !file.content.includes("from 'framer-motion'")) {
      errors.push({
        file: file.path,
        message: "Using 'motion' without importing from 'framer-motion'",
        fixable: true,
      });
    }

    // Check for empty components
    if (file.content.includes('export default function') && file.content.length < 100) {
      errors.push({
        file: file.path,
        message: "Component appears to be incomplete or empty",
        fixable: false,
      });
    }

    // Check for App Router specific syntax in Pages Router
    if (file.path.includes('pages/') && file.content.includes('export const metadata')) {
      errors.push({
        file: file.path,
        message: "'metadata' export is App Router only - not supported in Pages Router",
        fixable: true,
      });
    }

    // Check for next/font in pages (requires different setup)
    if (file.path.includes('pages/') && file.content.includes("from 'next/font")) {
      errors.push({
        file: file.path,
        message: "next/font requires special setup in Pages Router",
        fixable: true,
      });
    }
  }

  return errors;
}

/**
 * Auto-fix common issues
 */
export function autoFixErrors(files: GeneratedFile[], errors: ValidationError[]): GeneratedFile[] {
  return files.map(file => {
    let content = file.content;
    const fileErrors = errors.filter(e => e.file === file.path && e.fixable);

    for (const error of fileErrors) {
      // Fix 'use client' in Pages Router
      if (error.message.includes("'use client'")) {
        content = content.replace(/['"]use client['"];?\n*/g, '');
      }

      // Fix @/ imports to relative
      if (error.message.includes("Path alias")) {
        content = content.replace(/@\//g, '../');
      }

      // Fix missing framer-motion import
      if (error.message.includes("'motion' without importing")) {
        if (!content.includes("import { motion }")) {
          content = "import { motion } from 'framer-motion';\n" + content;
        }
      }

      // Remove metadata export
      if (error.message.includes("'metadata' export")) {
        content = content.replace(/export const metadata[^;]+;/g, '');
      }

      // Remove next/font usage
      if (error.message.includes("next/font")) {
        content = content.replace(/import.*from ['"]next\/font.*['"];?\n?/g, '');
        content = content.replace(/const \w+ = \w+\([^)]+\);?\n?/g, '');
      }
    }

    return { path: file.path, content };
  });
}

/**
 * Legacy single-file fix (still used for additional cleanup)
 */
function validateAndFix(code: string, filePath: string): string {
  let fixed = code;

  // Remove 'use client' for Pages Router compatibility
  if (filePath.includes('pages/')) {
    fixed = fixed.replace(/['"]use client['"];?\n*/g, '');
  }

  // Fix common import issues
  if (fixed.includes('motion.') && !fixed.match(/import.*from\s+['"]framer-motion['"]/)) {
    fixed = "import { motion } from 'framer-motion';\n" + fixed;
  }

  // Ensure section components have id for scroll navigation
  const sectionName = filePath.split('/').pop()?.replace('.tsx', '').toLowerCase();
  if (sectionName && !fixed.includes(`id="${sectionName}"`) && !fixed.includes(`id={'${sectionName}'}`)) {
    fixed = fixed.replace(/<section([^>]*)>/i, `<section id="${sectionName}"$1>`);
  }

  return fixed;
}

// ============================================================================
// FALLBACK SITE
// ============================================================================

function createFallbackSite(brief: Brief, moodboard: Moodboard): GeneratedFile[] {
  console.warn('   ⚠️ Using fallback site generation');

  // Escape special characters in strings for JSX
  const safeName = brief.personal.name.replace(/'/g, "\\'");
  const safeRole = brief.personal.role.replace(/'/g, "\\'");
  const safeTagline = brief.personal.tagline.replace(/'/g, "\\'");
  const safeBio = (brief.personal.bio || 'Bio not provided.').replace(/'/g, "\\'");
  const safeEmail = brief.personal.email || 'hello@example.com';

  // Pages Router _app.tsx (NO 'use client')
  const layoutContent = `import type { AppProps } from 'next/app';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}`;

  // Pages Router index.tsx (NO 'use client')
  const pageContent = `import Hero from '../components/Hero';
import About from '../components/About';
import Projects from '../components/Projects';
import Contact from '../components/Contact';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <About />
      <Projects />
      <Contact />
    </main>
  );
}`;

  const globalsContent = `@tailwind base;
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
}`;

  // Pure React components - NO framer-motion, NO 'use client'
  const heroContent = `export default function Hero() {
  return (
    <section id="hero" className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">${safeName}</h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-4">${safeRole}</p>
        <p className="text-lg text-gray-500">${safeTagline}</p>
      </div>
    </section>
  );
}`;

  const aboutContent = `export default function About() {
  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">About Me</h2>
        <p className="text-lg leading-relaxed">${safeBio}</p>
      </div>
    </section>
  );
}`;

  // Safely stringify projects array
  const projectsArray = brief.work.map(p => ({
    title: p.title,
    role: p.role,
    description: p.description
  }));

  const projectsContent = `export default function Projects() {
  const projects = ${JSON.stringify(projectsArray, null, 2)};

  return (
    <section id="projects" className="py-24 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center">Work</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project: any, i: number) => (
            <div
              key={i}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
              <p className="text-gray-600 mb-2">{project.role}</p>
              <p className="text-gray-500">{project.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`;

  const contactContent = `export default function Contact() {
  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8">Get in Touch</h2>
        <p className="text-lg mb-8">Interested in working together? Let's connect.</p>
        <a 
          href="mailto:${safeEmail}"
          className="inline-block bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Contact Me
        </a>
      </div>
    </section>
  );
}`;

  return [
    { path: 'pages/_app.tsx', content: layoutContent },
    { path: 'pages/index.tsx', content: pageContent },
    { path: 'styles/globals.css', content: globalsContent },
    { path: 'components/Hero.tsx', content: heroContent },
    { path: 'components/About.tsx', content: aboutContent },
    { path: 'components/Projects.tsx', content: projectsContent },
    { path: 'components/Contact.tsx', content: contactContent },
  ];
}
