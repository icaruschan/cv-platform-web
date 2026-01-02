require('dotenv').config();
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { parseBrief, getProfileImageUrl, getProjectImageUrl, getSocialLinks } = require('./brief_parser');

// --- Configuration ---
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "google/gemini-3-pro-preview";
const TWITTER_API_KEY = process.env.TWITTER_API_KEY;

const GUIDELINES_DIR = path.join(__dirname, '../website-guidelines');
const SECTIONS_DIR = path.join(__dirname, '../website-sections');
const PROMPTS_DIR = path.join(__dirname, '../prompts');
const OUTPUT_DIR = path.join(__dirname, '../output');

/**
 * Load technical constraints document
 */
function loadTechnicalConstraints() {
    const constraintsPath = path.join(PROMPTS_DIR, 'TECHNICAL_CONSTRAINTS.md');
    if (fs.existsSync(constraintsPath)) {
        return fs.readFileSync(constraintsPath, 'utf8');
    }
    console.warn('⚠️  TECHNICAL_CONSTRAINTS.md not found, proceeding without guardrails.');
    return '';
}

/**
 * Load style guide for consistent visual styling
 */
function loadStyleGuide() {
    const styleGuidePath = path.join(GUIDELINES_DIR, 'STYLE_GUIDE.md');
    if (fs.existsSync(styleGuidePath)) {
        return fs.readFileSync(styleGuidePath, 'utf8');
    }
    console.warn('⚠️  STYLE_GUIDE.md not found, components may have inconsistent styling.');
    return '';
}

/**
 * Validates generated component code for common issues
 */
function validateComponent(code, sectionName) {
    const issues = [];

    // Hydration safety checks
    if (code.includes('<style>')) {
        issues.push('❌ Inline <style> tag detected - will cause hydration error');
    }
    if (code.includes('Math.random()') && !code.includes('useEffect')) {
        issues.push('⚠️  Math.random() used without useEffect wrapper');
    }

    // Interactivity checks
    if (code.includes('<button') && !code.includes('onClick')) {
        issues.push('⚠️  Button without onClick handler detected');
    }
    if (code.includes('href="#"') || code.includes("href='#'")) {
        issues.push('⚠️  Empty href="#" detected');
    }

    // Structure checks
    if (!code.includes("'use client'") && !code.includes('"use client"')) {
        if (code.includes('useState') || code.includes('useEffect') || code.includes('motion')) {
            issues.push('❌ Missing "use client" directive for interactive component');
        }
    }

    // Section ID check
    const sectionId = sectionName.toLowerCase().replace('section', '');
    if (!code.includes('id=')) {
        issues.push(`⚠️  Missing section id attribute (should be id="${sectionId}")`);
    }

    return issues;
}

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
 * Creates the Next.js project scaffold
 */
async function createProjectScaffold() {
    console.log("📁 Creating Next.js project scaffold...");

    // Create directories
    const dirs = [
        OUTPUT_DIR,
        path.join(OUTPUT_DIR, 'app'),
        path.join(OUTPUT_DIR, 'components/ui'),
        path.join(OUTPUT_DIR, 'components/sections'),
        path.join(OUTPUT_DIR, 'lib'),
        path.join(OUTPUT_DIR, 'public/images'),
    ];

    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    // Create package.json
    const packageJson = {
        name: "portfolio-site",
        version: "1.0.0",
        private: true,
        scripts: {
            dev: "next dev",
            build: "next build",
            start: "next start",
            lint: "next lint"
        },
        dependencies: {
            "next": "^14.0.0",
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "framer-motion": "^10.16.0",
            "lenis": "^1.0.0",
            "clsx": "^2.0.0",
            "tailwind-merge": "^2.0.0",
            "class-variance-authority": "^0.7.0",
            "@phosphor-icons/react": "^2.0.15"
        },
        devDependencies: {
            "@types/node": "^20.0.0",
            "@types/react": "^18.2.0",
            "@types/react-dom": "^18.2.0",
            "autoprefixer": "^10.4.0",
            "postcss": "^8.4.0",
            "tailwindcss": "^3.3.0",
            "typescript": "^5.0.0"
        }
    };
    fs.writeFileSync(path.join(OUTPUT_DIR, 'package.json'), JSON.stringify(packageJson, null, 2));

    // Create next.config.js
    const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '**' }
        ]
    }
};
module.exports = nextConfig;
`;
    fs.writeFileSync(path.join(OUTPUT_DIR, 'next.config.js'), nextConfig);

    // Create tailwind.config.js
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        './app/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                background: 'var(--color-background)',
                foreground: 'var(--color-primary)',
                accent: 'var(--color-accent)',
                muted: 'var(--color-secondary)',
                border: 'var(--color-border)',
            },
            fontFamily: {
                heading: ['var(--font-heading)', 'system-ui', 'sans-serif'],
                body: ['var(--font-body)', 'system-ui', 'sans-serif'],
            }
        }
    },
    plugins: []
};
`;
    fs.writeFileSync(path.join(OUTPUT_DIR, 'tailwind.config.js'), tailwindConfig);

    // Create postcss.config.js
    fs.writeFileSync(path.join(OUTPUT_DIR, 'postcss.config.js'),
        `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };`
    );

    // Create tsconfig.json
    const tsconfig = {
        compilerOptions: {
            target: "es5",
            lib: ["dom", "dom.iterable", "esnext"],
            allowJs: true,
            skipLibCheck: true,
            strict: true,
            noEmit: true,
            esModuleInterop: true,
            module: "esnext",
            moduleResolution: "bundler",
            resolveJsonModule: true,
            isolatedModules: true,
            jsx: "preserve",
            incremental: true,
            plugins: [{ name: "next" }],
            paths: { "@/*": ["./*"] }
        },
        include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
        exclude: ["node_modules"]
    };
    fs.writeFileSync(path.join(OUTPUT_DIR, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

    // Create lib/utils.ts (shadcn helper)
    const utilsTs = `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
`;
    fs.writeFileSync(path.join(OUTPUT_DIR, 'lib/utils.ts'), utilsTs);

    console.log("✅ Scaffold created.");
}

/**
 * Reads and parses the style guide for CSS variables
 */
function parseStyleGuide() {
    const styleGuide = fs.readFileSync(path.join(GUIDELINES_DIR, 'STYLE_GUIDE.md'), 'utf8');

    // Extract CSS code blocks
    const cssBlockRegex = /```css\n([\s\S]*?)\n```/g;
    let cssContent = '';
    let match;

    while ((match = cssBlockRegex.exec(styleGuide)) !== null) {
        cssContent += match[1] + '\n';
    }

    return cssContent;
}

/**
 * Creates the globals.css with style guide CSS variables
 */
function createGlobalsCss() {
    console.log("🎨 Creating globals.css...");

    const cssVariables = parseStyleGuide();

    const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

${cssVariables}

@layer base {
    * {
        @apply border-border;
    }
    body {
        @apply bg-background text-foreground font-body;
        font-feature-settings: "rlig" 1, "calt" 1;
    }
    h1, h2, h3, h4, h5, h6 {
        @apply font-heading font-bold;
    }
}

/* Smooth scrolling */
html {
    scroll-behavior: smooth;
}

/* Scrollbar styling */
::-webkit-scrollbar {
    width: 8px;
}
::-webkit-scrollbar-track {
    background: var(--color-background);
}
::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 4px;
}
`;

    fs.writeFileSync(path.join(OUTPUT_DIR, 'app/globals.css'), globalsCss);
    console.log("✅ globals.css created.");
}

/**
 * Generates all website content in a SINGLE LLM call to ensure consistency
 * @param {Object} briefData - Structured brief data
 * @param {string} moodboard - Design moodboard
 * @param {string} constraints - Technical constraints
 * @param {string} styleGuide - Style guide
 * @param {Array<string>} sectionFiles - List of section spec filenames
 */
async function generateFullSiteContent(briefData, moodboard, constraints, styleGuide, sectionFiles) {
    console.log("   🔧 Generating FULL SITE in a single pass for consistency...");

    // Get social links and image URLs
    const socialLinks = getSocialLinks(briefData);
    const profileImageUrl = getProfileImageUrl(briefData);

    // Format projects
    const projectsJson = JSON.stringify(briefData.projects.map(p => ({
        name: p.name,
        role: p.role,
        impact: p.impact,
        imageUrl: getProjectImageUrl(p),
        twitterHandle: p.twitterHandle
    })), null, 2);

    // Read all section specs
    let allSectionSpecs = "";
    const sectionNames = [];

    for (const file of sectionFiles) {
        const spec = fs.readFileSync(path.join(SECTIONS_DIR, file), 'utf8');
        const name = file.replace('.md', '').replace(/^\d+\./, ''); // e.g. "hero"
        sectionNames.push(name);
        allSectionSpecs += `\n--- SPEC FOR SECTION: ${name.toUpperCase()} ---\n${spec}\n`;
    }

    // Build the Prompt (Enhanced with elite developer persona)
    const systemPrompt = `You are an elite frontend engineer and visual designer, renowned for crafting breathtakingly beautiful, pixel-perfect websites with fluid, cinematic animations. Your work has been featured on Awwwards and CSS Design Awards. You obsess over buttery-smooth micro-interactions, typography harmony, and motion design that feels alive. Your animations are subtle yet impactful — never flashy, always purposeful.

You must generate a COMPLETE portfolio website with ${sectionNames.length} sections: ${sectionNames.join(', ')}.

## ARCHITECTURE
- Next.js 14 App Router
- Tailwind CSS (using variables from globals.css)
- Framer Motion (for all animations)
- Phosphor Icons (icons - use Regular weight by default, Bold for emphasis)
- shadcn/ui patterns (inline, no external imports)

## VISUAL CONSISTENCY RULES (NON-NEGOTIABLE)
1. **ONE ACCENT COLOR**: Use the primary accent from the moodboard EVERYWHERE.
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
- NEVER use third person ("Fortune is", "He has", "She works")
- If the provided summary is in third person, CONVERT it to first person

## ANIMATION PHILOSOPHY
- Entry animations: Subtle fade + slight translateY (0.4-0.6s, ease-out)
- Stagger children with 0.1s delays
- Hover effects: Scale 1.02-1.05, subtle shadow lift
- Scroll-triggered reveals using viewport intersection
- No jarring or flashy transitions

## TECHNICAL CONSTRAINTS
${constraints}

## DATA SOURCES (USE EXACTLY — DO NOT HALLUCINATE)
- Name: ${briefData.name}
- Title: ${briefData.title}
- Experience: ${briefData.experience || 'Not provided'}
- Tagline: ${briefData.tagline}
- Summary: ${briefData.summary || 'Not provided'}
- Profile Image: ${profileImageUrl}
- Email: ${socialLinks.email || 'Not provided'}
- Twitter: ${socialLinks.twitter || 'Not provided'}
- LinkedIn: ${socialLinks.linkedin || 'Not provided'}
- Discord: ${socialLinks.discord || 'Not provided'}
- Projects: ${projectsJson}

## DATA BINDING INSTRUCTIONS
1. **Profile Image**: Use the provided URL in an <Image> component (About section).
2. **Project Images**: Each project has 'imageUrl' — use it for card thumbnails.
3. **Social Links**: Render icon buttons only if URL is not 'Not provided'. Hide missing ones.
4. **Experience**: Display as "X+ Years" badge if provided.

## OUTPUT FORMAT
Return code for ALL sections in a single response.
DO NOT generate 'globals.css' or 'layout.tsx'.
Separate each file with:
### SECTION: [section_name] ###
[Complete TSX code with 'use client']

Example:
### SECTION: hero ###
'use client';
export default function HeroSection() {...}

### SECTION: about ###
'use client';
export default function AboutSection() {...}
`;

    const userMessage = `
## DESIGN MOODBOARD
${moodboard.substring(0, 2000)}

## STYLE GUIDE (Use these tokens)
${styleGuide ? styleGuide.substring(0, 4000) : 'Standard Tailwind tokens'}

## SECTION SPECIFICATIONS
${allSectionSpecs}

Generate the code for ALL ${sectionNames.length} sections now.
Ensure perfectly consistent design across them.
`;

    try {
        const response = await openai.chat.completions.create({
            model: GEMINI_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ],
            temperature: 0.7, // Slightly creative but consistent
        });

        const fullResponse = response.choices[0].message.content;
        return parseAndSaveSections(fullResponse, sectionNames);

    } catch (error) {
        console.error("❌ Failed to generate full site:", error.message);
        return [];
    }
}

/**
 * Parses the monolithic LLM response and saves individual files
 */
function parseAndSaveSections(fullResponse, expectedSections) {
    const generatedComponents = [];

    // DEBUG: Log the first 500 chars to see what we got
    console.log("   🔍 Raw Response Preview:\n" + fullResponse.substring(0, 500) + "...\n");

    // Split by the delimiter "### SECTION: name ###"
    // Regex matches "### SECTION: name ###" and captures "name"
    // IMPROVED: Case-insensitive flag 'i', flexible spacing, AND ALLOW DOTS matches like 'hero.tsx'
    const regex = /###\s*SECTION:\s*([a-zA-Z0-9._-]+)\s*###/gi;

    let match;

    // We need to find all matches to slice the string between them
    const matches = [];
    while ((match = regex.exec(fullResponse)) !== null) {
        matches.push({
            name: match[1].toLowerCase(),
            index: match.index,
            endOfTag: match.index + match[0].length
        });
    }

    console.log(`   📊 Found ${matches.length} sections: ${matches.map(m => m.name).join(', ')}`);

    // Process matches
    for (let i = 0; i < matches.length; i++) {
        const section = matches[i];
        const nextSection = matches[i + 1];

        // Content is from end of this tag to start of next tag (or end of string)
        const endOfContent = nextSection ? nextSection.index : fullResponse.length;

        let code = fullResponse.slice(section.endOfTag, endOfContent).trim();

        // Clean markdown code blocks if present
        code = code.replace(/^```tsx?\n?/, '').replace(/```$/, '').trim();

        // Validate component
        const sectionName = section.name;
        const issues = validateComponent(code, sectionName);
        if (issues.length > 0) {
            console.warn(`   ⚠️ Issues in ${sectionName}:`, issues);
        }

        // Save file
        const componentName = sectionName.charAt(0).toUpperCase() + sectionName.slice(1) + 'Section';
        const filePath = path.join(OUTPUT_DIR, 'components/sections', `${componentName}.tsx`);

        // Add ID if missing (simple patch)
        if (!code.includes(`id="${sectionName}"`)) {
            code = code.replace(/<section/, `<section id="${sectionName}"`);
        }

        fs.writeFileSync(filePath, code);
        generatedComponents.push(componentName);
        console.log(`   ✅ Parsed & Saved: ${componentName}.tsx`);
    }

    return generatedComponents;
}

/**
 * Generates all section components
 */
async function generateAllSections(briefData) {
    console.log("\n📝 Generating ALL site sections (Single-Pass Mode)...");

    const moodboard = fs.readFileSync(path.join(GUIDELINES_DIR, '0.design-moodboard.md'), 'utf8');
    const constraints = loadTechnicalConstraints();
    const styleGuide = loadStyleGuide();

    // Read all section spec files
    const sectionFiles = fs.readdirSync(SECTIONS_DIR).filter(f => f.endsWith('.md'));

    // Call the new monolithic generator
    const generatedSections = await generateFullSiteContent(
        briefData, moodboard, constraints, styleGuide, sectionFiles
    );

    return generatedSections;
}

/**
 * Creates the main page.tsx that imports all sections
 */
function createMainPage(sections) {
    console.log("\n📄 Creating page.tsx...");

    const imports = sections.map(s => `import ${s} from '@/components/sections/${s}';`).join('\n');
    const components = sections.map(s => `            <${s} />`).join('\n');

    const pageCode = `${imports}

export default function Home() {
    return (
        <main className="min-h-screen bg-background">
${components}
        </main>
    );
}
`;

    fs.writeFileSync(path.join(OUTPUT_DIR, 'app/page.tsx'), pageCode);
    console.log("✅ page.tsx created.");
}

/**
 * Parses fonts from the style guide and returns Next.js font configurations
 */
function parseFontsFromStyleGuide() {
    const styleGuide = loadStyleGuide();

    // Default fallback
    const defaults = {
        heading: { name: 'Inter', variable: '--font-heading', importName: 'Inter' },
        body: { name: 'Inter', variable: '--font-body', importName: 'Inter' },
        mono: { name: 'JetBrains Mono', variable: '--font-mono', importName: 'JetBrains_Mono' }
    };

    if (!styleGuide) return defaults;

    // Regex to extract font families: e.g. --font-heading: 'Playfair Display', serif;
    const extractFont = (varName) => {
        const regex = new RegExp(`${varName}:\\s*['"]?([^,'";]+)['"]?`);
        const match = styleGuide.match(regex);
        return match ? match[1].trim() : null;
    };

    const headingFont = extractFont('--font-heading');
    const bodyFont = extractFont('--font-body');

    return {
        heading: getFontConfig(headingFont, '--font-heading') || defaults.heading,
        body: getFontConfig(bodyFont, '--font-body') || defaults.body,
        mono: defaults.mono // Keep mono default for code snippets
    };
}

/**
 * Maps a font name to its Next.js configuration
 */
function getFontConfig(fontName, variableName) {
    if (!fontName) return null;

    // Map common Google Fonts to Next.js export names
    // This handles spaces and special cases
    const normalize = (name) => name.replace(/\s+/g, '_');

    // List of supported Google Fonts in next/font/google
    // We can't support all, but we hit the top popular ones from our inspiration engine
    const supportedFonts = [
        'Inter', 'Roboto', 'Open_Sans', 'Lato', 'Montserrat', 'Oswald', 'Raleway',
        'Nunito', 'Merriweather', 'Playfair_Display', 'Rubik', 'Poppins',
        'Plus_Jakarta_Sans', 'Archivo_Narrow', 'Space_Grotesk', 'Syne', 'Outfit',
        'DM_Sans', 'Manrope', 'Lora', 'Work_Sans', 'Fira_Code', 'JetBrains_Mono'
    ];

    const normalized = normalize(fontName);
    const found = supportedFonts.find(f => f.toLowerCase() === normalized.toLowerCase());

    if (found) {
        return {
            name: fontName,
            variable: variableName,
            importName: found
        };
    }

    return null;
}

/**
 * Creates the layout.tsx with DYNAMIC fonts from style guide
 */
function createLayout() {
    console.log("📄 Creating layout.tsx...");

    const fonts = parseFontsFromStyleGuide();
    console.log(`   🎨 Fonts detected: Heading=${fonts.heading.name}, Body=${fonts.body.name}`);

    // Deduplicate imports
    const imports = new Set([fonts.heading.importName, fonts.body.importName, fonts.mono.importName]);

    const layoutCode = `import type { Metadata } from 'next';
import { ${Array.from(imports).join(', ')} } from 'next/font/google';
import './globals.css';

const headingFont = ${fonts.heading.importName}({ 
    subsets: ['latin'], 
    variable: '${fonts.heading.variable}',
    display: 'swap',
});

const bodyFont = ${fonts.body.importName}({ 
    subsets: ['latin'], 
    variable: '${fonts.body.variable}',
    display: 'swap',
});

const monoFont = ${fonts.mono.importName}({ 
    subsets: ['latin'], 
    variable: '${fonts.mono.variable}',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Portfolio',
    description: 'Professional Portfolio Website',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark scroll-smooth">
            <body className={\`\${headingFont.variable} \${bodyFont.variable} \${monoFont.variable} font-body antialiased bg-background text-foreground\`}>
                {children}
            </body>
        </html>
    );
}
`;

    fs.writeFileSync(path.join(OUTPUT_DIR, 'app/layout.tsx'), layoutCode);
    console.log("✅ layout.tsx created.");
}

/**
 * Main orchestrator
 */
async function generateSite() {
    console.log("🚀 Starting Site Generation...\n");

    // Step 0: Parse brief data early
    const briefPath = path.join(GUIDELINES_DIR, 'product-brief.md');
    console.log("📋 Parsing product brief...");
    const briefData = parseBrief(briefPath);
    console.log(`   ✅ Client: ${briefData.name} - ${briefData.title}`);

    // Step 1: Create scaffold
    await createProjectScaffold();

    // Step 2: Create globals.css with style guide
    createGlobalsCss();

    // Step 3: Create layout
    createLayout();

    // Step 4: Generate all section components (pass briefData)
    const sections = await generateAllSections(briefData);

    // Step 5: Create main page (no navbar)
    createMainPage(sections);

    console.log("\n🎉 Site generation complete!");
    console.log(`📁 Output: ${OUTPUT_DIR}`);
    console.log("\n📋 Next steps:");
    console.log("   cd output && npm install && npm run dev");
}

// CLI
if (require.main === module) {
    generateSite().catch(console.error);
}

module.exports = { generateSite };
