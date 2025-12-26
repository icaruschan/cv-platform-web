require('dotenv').config();
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
            "@lenis/react": "^1.0.0",
            "lenis": "^1.0.0",
            "clsx": "^2.0.0",
            "tailwind-merge": "^2.0.0",
            "class-variance-authority": "^0.7.0",
            "lucide-react": "^0.294.0"
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
 * Generates a section component using Gemini
 */
async function generateSectionComponent(sectionName, sectionSpec, moodboard, brief, constraints) {
    console.log(`   🔧 Generating ${sectionName} component...`);

    // Build the enhanced system prompt with guardrails
    const systemPrompt = `You are an expert React/Next.js developer specializing in premium portfolio websites.

Generate a TSX component for a "${sectionName}" section using:
- Next.js 14 App Router
- Tailwind CSS for styling  
- Framer Motion for animations
- shadcn/ui patterns (but write the styles inline, don't import shadcn components)

## CRITICAL TECHNICAL CONSTRAINTS
${constraints}

## ADDITIONAL RULES
1. Use 'use client' directive at the top
2. Export default function named appropriately (e.g., HeroSection)
3. Use Tailwind classes that reference CSS variables (e.g., bg-background, text-foreground)
4. Add Framer Motion animations (fade-in, slide-up on scroll)
5. Make it responsive (mobile-first)
6. Use semantic HTML with proper section id (e.g., id="${sectionName.toLowerCase()}")
7. Include placeholder content that matches the brief
8. DO NOT import any external components - write everything inline
9. DO NOT use inline <style> tags - all fonts are already in globals.css
10. ALL buttons MUST have working onClick handlers (e.g., scroll to section)
11. Output ONLY the TSX code, no markdown, no explanation

The component should look PREMIUM - use gradients, subtle glows, modern typography.`;

    const userMessage = `## Section Spec
${sectionSpec}

## Design Moodboard
${moodboard}

## Client Brief
${brief.substring(0, 500)}

Generate the TSX component for this section. Remember:
- Add id="${sectionName.toLowerCase()}" to the section element
- All buttons must scroll to their target or have real functionality
- No inline <style> tags`;

    try {
        const response = await openai.chat.completions.create({
            model: GEMINI_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ]
        });

        let code = response.choices[0].message.content;

        // Clean up the response (remove markdown code blocks if present)
        code = code.replace(/```tsx?\n?/g, '').replace(/```$/g, '').trim();

        // Validate the generated code
        const issues = validateComponent(code, sectionName);
        if (issues.length > 0) {
            console.log(`   ⚠️  Validation issues for ${sectionName}:`);
            issues.forEach(issue => console.log(`      ${issue}`));
        }

        return code;

    } catch (error) {
        console.error(`   ❌ Failed to generate ${sectionName}:`, error.message);
        return null;
    }
}

/**
 * Generates all section components
 */
async function generateAllSections() {
    console.log("\n📝 Generating section components...");

    const moodboard = fs.readFileSync(path.join(GUIDELINES_DIR, '0.design-moodboard.md'), 'utf8');
    const brief = fs.readFileSync(path.join(GUIDELINES_DIR, 'product-brief.md'), 'utf8');

    // Load technical constraints for guardrails
    const constraints = loadTechnicalConstraints();
    console.log(constraints ? '🛡️  Technical constraints loaded.' : '⚠️  Running without guardrails.');

    // Read all section spec files
    const sectionFiles = fs.readdirSync(SECTIONS_DIR).filter(f => f.endsWith('.md'));
    const generatedSections = [];

    for (const file of sectionFiles) {
        const sectionSpec = fs.readFileSync(path.join(SECTIONS_DIR, file), 'utf8');
        const sectionName = file.replace('.md', '').replace(/^\d+\./, ''); // e.g., "1.hero.md" → "hero"

        const componentCode = await generateSectionComponent(sectionName, sectionSpec, moodboard, brief, constraints);

        if (componentCode) {
            const componentName = sectionName.charAt(0).toUpperCase() + sectionName.slice(1) + 'Section';
            const filePath = path.join(OUTPUT_DIR, 'components/sections', `${componentName}.tsx`);
            fs.writeFileSync(filePath, componentCode);
            generatedSections.push(componentName);
            console.log(`   ✅ ${componentName}.tsx created.`);
        }
    }

    return generatedSections;
}

/**
 * Creates the main page.tsx that imports all sections
 */
function createMainPage(sections) {
    console.log("\n📄 Creating page.tsx...");

    const imports = sections.map(s => `import ${s} from '@/components/sections/${s}';`).join('\n');
    const components = sections.map(s => `        <${s} />`).join('\n');

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
 * Creates the layout.tsx
 */
function createLayout() {
    console.log("📄 Creating layout.tsx...");

    const layoutCode = `import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });

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
        <html lang="en" className="dark">
            <body className={inter.variable}>
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

    // Step 1: Create scaffold
    await createProjectScaffold();

    // Step 2: Create globals.css with style guide
    createGlobalsCss();

    // Step 3: Create layout
    createLayout();

    // Step 4: Generate all section components
    const sections = await generateAllSections();

    // Step 5: Create main page
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
