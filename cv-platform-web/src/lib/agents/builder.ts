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

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

export async function generateSite(
  brief: Brief,
  moodboard: Moodboard,
  specs: SpecOutput[]
): Promise<GeneratedFile[]> {
  console.log('🏗️ Starting Builder Agent (The Constructor)...');

  try {
    // Extract style guide and requirements from specs
    const styleGuide = specs.find(s => s.path.includes('STYLE_GUIDE'))?.content || '';
    const requirements = specs.find(s => s.path.includes('REQUIREMENTS'))?.content || '';
    const sectionSpecs = specs.filter(s => s.path.includes('sections/'));

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

    // Build section specs string
    const sectionSpecsText = sectionSpecs.map(s => {
      const name = s.path.split('/').pop()?.replace('.md', '') || 'section';
      return `\n--- SPEC FOR SECTION: ${name.toUpperCase()} ---\n${s.content}\n`;
    }).join('\n');

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

    // Parse files from response
    const files = parseFiles(fullResponse);

    // Validate and fix common issues
    const validatedFiles = files.map(f => ({
      ...f,
      content: validateAndFix(f.content, f.path)
    }));

    console.log(`   ✅ Builder Agent complete. Generated ${validatedFiles.length} files.`);
    return validatedFiles;

  } catch (error) {
    console.error("Builder Agent Failed:", error);
    return createFallbackSite(brief, moodboard);
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
### FILE: app/page.tsx
import Hero from '@/components/Hero';
...

### FILE: components/Hero.tsx
'use client';
...

## FILES TO GENERATE
1. app/layout.tsx (With Google Font imports using next/font)
2. app/page.tsx (Main page importing all sections)
3. app/globals.css (CSS variables from Style Guide + Tailwind setup)
4. components/Hero.tsx
5. components/About.tsx
6. components/Projects.tsx
7. components/Skills.tsx
8. components/Contact.tsx

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

function validateAndFix(code: string, filePath: string): string {
  let fixed = code;

  // Add 'use client' if using Framer Motion or React hooks
  if ((fixed.includes('motion.') || fixed.includes('useState') || fixed.includes('useEffect')) &&
    !fixed.includes("'use client'") && !fixed.includes('"use client"')) {
    fixed = "'use client';\n\n" + fixed;
  }

  // Fix common import issues
  if (fixed.includes('framer-motion') && !fixed.includes("from 'framer-motion'")) {
    // Already has a framer-motion reference but no import
    if (!fixed.includes("import") || !fixed.match(/import.*from\s+['"]framer-motion['"]/)) {
      fixed = "import { motion } from 'framer-motion';\n" + fixed;
    }
  }

  // Ensure section components have id for scroll navigation
  const sectionName = filePath.split('/').pop()?.replace('.tsx', '').toLowerCase();
  if (sectionName && !fixed.includes(`id="${sectionName}"`) && !fixed.includes(`id={'${sectionName}'}`)) {
    // Try to add id to the main section element
    fixed = fixed.replace(/<section([^>]*)>/i, `<section id="${sectionName}"$1>`);
  }

  return fixed;
}

// ============================================================================
// FALLBACK SITE
// ============================================================================

function createFallbackSite(brief: Brief, moodboard: Moodboard): GeneratedFile[] {
  console.warn('   ⚠️ Using fallback site generation');

  const layoutContent = `import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '${brief.personal.name} - ${brief.personal.role}',
  description: '${brief.personal.tagline}',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}`;

  const pageContent = `import Hero from '@/components/Hero';
import About from '@/components/About';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';

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

  const heroContent = `'use client';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section id="hero" className="min-h-screen flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-6">${brief.personal.name}</h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-4">${brief.personal.role}</p>
        <p className="text-lg text-gray-500">${brief.personal.tagline}</p>
      </motion.div>
    </section>
  );
}`;

  const aboutContent = `'use client';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-3xl font-bold mb-8"
        >
          About Me
        </motion.h2>
        <p className="text-lg leading-relaxed">
          ${brief.personal.bio || 'Bio not provided.'}
        </p>
      </div>
    </section>
  );
}`;

  const projectsContent = `'use client';
import { motion } from 'framer-motion';

export default function Projects() {
  const projects = ${JSON.stringify(brief.work.map(p => ({
    title: p.title,
    role: p.role,
    description: p.description
  })), null, 2)};

  return (
    <section id="projects" className="py-24 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center">Work</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
              <p className="text-gray-600 mb-2">{project.role}</p>
              <p className="text-gray-500">{project.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}`;

  const contactContent = `'use client';
import { motion } from 'framer-motion';

export default function Contact() {
  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8">Get in Touch</h2>
        <p className="text-lg mb-8">
          Interested in working together? Let's connect.
        </p>
        <a 
          href="mailto:${brief.personal.email || 'hello@example.com'}"
          className="inline-block bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Contact Me
        </a>
      </div>
    </section>
  );
}`;

  return [
    { path: 'app/layout.tsx', content: layoutContent },
    { path: 'app/page.tsx', content: pageContent },
    { path: 'app/globals.css', content: globalsContent },
    { path: 'components/Hero.tsx', content: heroContent },
    { path: 'components/About.tsx', content: aboutContent },
    { path: 'components/Projects.tsx', content: projectsContent },
    { path: 'components/Contact.tsx', content: contactContent },
  ];
}
