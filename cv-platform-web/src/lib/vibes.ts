/**
 * Vibe Library - Instant Style Guide Matcher
 * 
 * Replaces the slow inspiration agent with instant vibe matching.
 * Loads pre-built style guides and matches them to user's brief.
 */

import { Brief, Moodboard } from './types';

// Vibe metadata for matching
interface VibeMetadata {
    id: string;
    name: string;
    keywords: string[];
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        surface: string;
        text: string;
    };
    typography: {
        heading: string;
        body: string;
        mono: string;
    };
    motion: 'STUDIO' | 'TECH';
    visualDirection: string;
    uiPatterns: {
        cardStyle: string;
        buttonStyle: string;
        layoutStructure: string;
    };
}

// Pre-defined vibe library with extracted data
const VIBE_LIBRARY: VibeMetadata[] = [
    {
        id: 'minimal-developer',
        name: 'Minimal Developer',
        keywords: ['minimal', 'dark', 'developer', 'clean', 'monospace', 'terminal', 'sleek', 'modern', 'dev', 'code', 'tech'],
        colors: {
            primary: '#00D9FF',
            secondary: '#7C3AED',
            accent: '#00D9FF',
            background: '#0A0A0A',
            surface: '#141414',
            text: '#FAFAFA'
        },
        typography: { heading: 'Inter', body: 'Inter', mono: 'JetBrains Mono' },
        motion: 'TECH',
        visualDirection: 'Dark, minimal, developer-focused. Terminal aesthetic with subtle cyan accents. Clean typography, monospace elements for code.',
        uiPatterns: {
            cardStyle: 'Dark #141414 background, 1px border rgba(255,255,255,0.1), 12px radius, subtle glow on hover',
            buttonStyle: 'Gradient cyan-to-purple background, 8px radius, glow shadow on hover',
            layoutStructure: 'Centered hero, 2-3 column grid for projects, generous whitespace'
        }
    },
    {
        id: 'neon-hacker',
        name: 'Neon Hacker',
        keywords: ['cyberpunk', 'neon', 'hacker', 'glowing', 'matrix', 'futuristic', 'electric', 'terminal', 'cyber', 'green'],
        colors: {
            primary: '#00FF41',
            secondary: '#FF00FF',
            accent: '#00FFFF',
            background: '#0D0D0D',
            surface: '#1A1A2E',
            text: '#EAEAEA'
        },
        typography: { heading: 'Space Mono', body: 'Inter', mono: 'Fira Code' },
        motion: 'TECH',
        visualDirection: 'Cyberpunk aesthetic with vibrant neon glows. Matrix-inspired, terminal aesthetics, glitch effects.',
        uiPatterns: {
            cardStyle: 'Transparent dark with neon border, no radius, scanline overlay',
            buttonStyle: 'Outline with neon glow, no radius, uppercase monospace text',
            layoutStructure: 'Terminal-style frames, centered with asymmetric accents'
        }
    },
    {
        id: 'bold-creative',
        name: 'Bold Creative',
        keywords: ['bold', 'colorful', 'creative', 'vibrant', 'playful', 'artistic', 'dynamic', 'expressive', 'designer', 'agency'],
        colors: {
            primary: '#FF5733',
            secondary: '#5B2EFF',
            accent: '#00D4AA',
            background: '#FFFFFF',
            surface: '#F5F5F5',
            text: '#1A1A1A'
        },
        typography: { heading: 'Clash Display', body: 'Space Grotesk', mono: 'Fira Code' },
        motion: 'STUDIO',
        visualDirection: 'Vibrant, expressive, breaks the grid. Oversized typography, playful animations, color blocking.',
        uiPatterns: {
            cardStyle: 'White background, large radius (20px), bouncy hover with rotation',
            buttonStyle: 'Pill-shaped, vibrant gradient, bouncy scale on hover',
            layoutStructure: 'Asymmetric, broken grid, oversized headlines'
        }
    },
    {
        id: 'soft-gradients',
        name: 'Soft Gradients',
        keywords: ['gradient', 'soft', 'modern', 'saas', 'startup', 'aurora', 'dreamy', 'elegant', 'linear', 'stripe'],
        colors: {
            primary: '#667EEA',
            secondary: '#764BA2',
            accent: '#F093FB',
            background: '#FAFAFA',
            surface: '#FFFFFF',
            text: '#1A1A2E'
        },
        typography: { heading: 'Inter', body: 'Inter', mono: 'JetBrains Mono' },
        motion: 'STUDIO',
        visualDirection: 'Modern SaaS aesthetic with smooth gradient transitions. Glassmorphism elements, soft shadows, aurora-like backgrounds.',
        uiPatterns: {
            cardStyle: 'White with subtle border, 16px radius, gradient glow on hover',
            buttonStyle: 'Gradient background, 12px radius, soft shadow',
            layoutStructure: 'Centered with gradient orbs in background, clean grid'
        }
    },
    {
        id: 'corporate-clean',
        name: 'Corporate Clean',
        keywords: ['clean', 'professional', 'corporate', 'business', 'trustworthy', 'enterprise', 'minimal', 'blue'],
        colors: {
            primary: '#2563EB',
            secondary: '#1E40AF',
            accent: '#059669',
            background: '#FFFFFF',
            surface: '#F8FAFC',
            text: '#0F172A'
        },
        typography: { heading: 'Inter', body: 'Inter', mono: 'JetBrains Mono' },
        motion: 'TECH',
        visualDirection: 'Professional, trustworthy, enterprise-grade. Clean lines, blue accents, no unnecessary decoration.',
        uiPatterns: {
            cardStyle: 'White with subtle gray border, 8px radius, minimal shadow on hover',
            buttonStyle: 'Solid blue background, 6px radius, simple darken on hover',
            layoutStructure: 'Traditional grid, left-aligned hero, consistent spacing'
        }
    },
    {
        id: 'warm-friendly',
        name: 'Warm Friendly',
        keywords: ['warm', 'friendly', 'approachable', 'personal', 'cozy', 'inviting', 'human', 'soft', 'freelancer'],
        colors: {
            primary: '#EA580C',
            secondary: '#F59E0B',
            accent: '#059669',
            background: '#FFFBF5',
            surface: '#FFFFFF',
            text: '#1C1917'
        },
        typography: { heading: 'Outfit', body: 'Source Sans 3', mono: 'JetBrains Mono' },
        motion: 'STUDIO',
        visualDirection: 'Warm, approachable, personal. Natural colors, rounded shapes, inviting tone.',
        uiPatterns: {
            cardStyle: 'Warm white, soft border, 16px radius, gentle lift on hover',
            buttonStyle: 'Warm orange, full pill shape, subtle scale on hover',
            layoutStructure: 'Intimate container width, story-driven layout'
        }
    },
    {
        id: 'dark-elegant',
        name: 'Dark Elegant',
        keywords: ['elegant', 'dark', 'luxury', 'sophisticated', 'noir', 'refined', 'premium', 'mysterious', 'gold'],
        colors: {
            primary: '#D4AF37',
            secondary: '#B8860B',
            accent: '#D4AF37',
            background: '#000000',
            surface: '#0A0A0A',
            text: '#FFFFFF'
        },
        typography: { heading: 'Cormorant Garamond', body: 'Inter', mono: 'JetBrains Mono' },
        motion: 'STUDIO',
        visualDirection: 'Luxury, sophisticated, minimalist noir. Gold accents on black, elegant serif typography, graceful animations.',
        uiPatterns: {
            cardStyle: 'Deep black, no border, subtle gold accent line, slow transitions',
            buttonStyle: 'Gold outline on transparent, no radius, uppercase tracking',
            layoutStructure: 'Full-screen sections, image-dominant, generous spacing'
        }
    },
    {
        id: 'retro-90s',
        name: 'Retro 90s',
        keywords: ['retro', '90s', 'nostalgic', 'vintage', 'grunge', 'y2k', 'throwback', 'analog', 'chunky', 'fun'],
        colors: {
            primary: '#F59E0B',
            secondary: '#EC4899',
            accent: '#7C3AED',
            background: '#FFF4E6',
            surface: '#FFFFFF',
            text: '#1E1B4B'
        },
        typography: { heading: 'Space Grotesk', body: 'IBM Plex Sans', mono: 'Space Mono' },
        motion: 'STUDIO',
        visualDirection: 'Nostalgic 90s web aesthetic. Chunky borders, hard shadows, playful colors, bouncy animations.',
        uiPatterns: {
            cardStyle: 'White with 3px black border, hard shadow offset, no radius',
            buttonStyle: 'Bright color, black border, hard shadow, push effect on click',
            layoutStructure: 'Intentionally broken grid, stacked elements, chunky blocks'
        }
    },
    {
        id: 'photographer-gallery',
        name: 'Photographer Gallery',
        keywords: ['photography', 'gallery', 'visual', 'images', 'minimal', 'showcase', 'artist', 'portfolio', 'photo'],
        colors: {
            primary: '#0A0A0A',
            secondary: '#FFFFFF',
            accent: '#0A0A0A',
            background: '#FFFFFF',
            surface: '#F5F5F5',
            text: '#0A0A0A'
        },
        typography: { heading: 'Cormorant Garamond', body: 'Inter', mono: 'JetBrains Mono' },
        motion: 'STUDIO',
        visualDirection: 'Image-first gallery aesthetic. Ultra-minimal UI, full-bleed images, whisper-quiet typography.',
        uiPatterns: {
            cardStyle: 'No visible card, just image with subtle zoom on hover',
            buttonStyle: 'Thin black outline, no radius, minimal padding',
            layoutStructure: 'Full-screen hero image, masonry grid for gallery'
        }
    },
    {
        id: 'editorial-writer',
        name: 'Editorial Writer',
        keywords: ['editorial', 'writer', 'journalist', 'author', 'longform', 'magazine', 'literary', 'blog', 'content'],
        colors: {
            primary: '#B8372B',
            secondary: '#2563EB',
            accent: '#B8372B',
            background: '#FDFCFA',
            surface: '#FFFFFF',
            text: '#1A1A1A'
        },
        typography: { heading: 'Playfair Display', body: 'Source Serif 4', mono: 'JetBrains Mono' },
        motion: 'TECH',
        visualDirection: 'Typography-focused editorial aesthetic. Beautiful serif fonts, optimal reading experience, magazine-inspired.',
        uiPatterns: {
            cardStyle: 'No visible card, text-focused article layout',
            buttonStyle: 'Text link with underline, editorial red color',
            layoutStructure: 'Single column (max 720px), generous line height, article format'
        }
    },
    {
        id: 'playful-colorful',
        name: 'Playful Colorful',
        keywords: ['playful', 'colorful', 'fun', 'energetic', 'youthful', 'vibrant', 'joyful', 'animated', 'bouncy'],
        colors: {
            primary: '#F472B6',
            secondary: '#34D399',
            accent: '#A78BFA',
            background: '#FFFEF5',
            surface: '#FFFFFF',
            text: '#1E1B4B'
        },
        typography: { heading: 'Nunito', body: 'Nunito', mono: 'JetBrains Mono' },
        motion: 'STUDIO',
        visualDirection: 'Bouncy, joyful, emoji-friendly. Multiple bright colors, spring animations, delightful interactions.',
        uiPatterns: {
            cardStyle: 'White with colorful border, 20px radius, wiggle on hover',
            buttonStyle: 'Pink-purple gradient, pill shape, bouncy scale animation',
            layoutStructure: 'Playful layout with floating elements, staggered animations'
        }
    },
    {
        id: 'startup-modern',
        name: 'Startup Modern',
        keywords: ['startup', 'modern', 'tech', 'saas', 'product', 'innovative', 'clean', 'scalable', 'vercel', 'linear'],
        colors: {
            primary: '#6366F1',
            secondary: '#8B5CF6',
            accent: '#6366F1',
            background: '#FFFFFF',
            surface: '#FAFAFA',
            text: '#18181B'
        },
        typography: { heading: 'Inter', body: 'Inter', mono: 'JetBrains Mono' },
        motion: 'TECH',
        visualDirection: 'Polished product aesthetic. Clean, intentional, refined. Dark mode toggle optional.',
        uiPatterns: {
            cardStyle: 'White with zinc border, 12px radius, subtle shadow on hover',
            buttonStyle: 'Dark background (#18181B), 8px radius, slight lift on hover',
            layoutStructure: 'Centered hero, clean grid, consistent component sizing'
        }
    },
    {
        id: '3d-immersive',
        name: '3D Immersive',
        keywords: ['3d', 'immersive', 'interactive', 'spline', 'three.js', 'webgl', 'experience', 'futuristic', 'experimental'],
        colors: {
            primary: '#3B82F6',
            secondary: '#8B5CF6',
            accent: '#06B6D4',
            background: '#000000',
            surface: '#0A0A0A',
            text: '#FFFFFF'
        },
        typography: { heading: 'Syne', body: 'Inter', mono: 'JetBrains Mono' },
        motion: 'STUDIO',
        visualDirection: 'Cinematic 3D experience. Dark backgrounds for WebGL contrast, scroll-triggered animations, immersive.',
        uiPatterns: {
            cardStyle: 'Glassmorphism with blur, subtle border, depth on hover',
            buttonStyle: 'Gradient with glow, rounded, futuristic feel',
            layoutStructure: 'Full-screen 3D sections, parallax, sticky scroll'
        }
    },
    {
        id: 'brutalist-web',
        name: 'Brutalist Web',
        keywords: ['brutalist', 'raw', 'experimental', 'anti-design', 'edgy', 'bold', 'unconventional', 'artistic'],
        colors: {
            primary: '#0000FF',
            secondary: '#FF0000',
            accent: '#FFFF00',
            background: '#FFFFFF',
            surface: '#FFFFFF',
            text: '#000000'
        },
        typography: { heading: 'Arial Black', body: 'Georgia', mono: 'Courier New' },
        motion: 'TECH',
        visualDirection: 'Raw, anti-design aesthetic. System fonts, harsh colors, intentionally uncomfortable layouts.',
        uiPatterns: {
            cardStyle: 'Plain with thick black border, no radius, no shadow',
            buttonStyle: 'Bright color with black border, instant color invert on hover',
            layoutStructure: 'Intentionally broken, no grid, varying spacing'
        }
    },
    {
        id: 'glassmorphism',
        name: 'Glassmorphism',
        keywords: ['glass', 'blur', 'translucent', 'frosted', 'modern', 'clean', 'layered', 'subtle', 'ios'],
        colors: {
            primary: '#FFFFFF',
            secondary: '#667EEA',
            accent: '#667EEA',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            surface: 'rgba(255, 255, 255, 0.25)',
            text: '#FFFFFF'
        },
        typography: { heading: 'Inter', body: 'Inter', mono: 'JetBrains Mono' },
        motion: 'STUDIO',
        visualDirection: 'Frosted glass aesthetic. Gradient backgrounds, blur effects, layered depth.',
        uiPatterns: {
            cardStyle: 'Glass surface with backdrop-blur, subtle white border, 16px radius',
            buttonStyle: 'Glass or solid white, rounded, subtle glow',
            layoutStructure: 'Layered cards creating depth, gradient backgrounds'
        }
    },
    {
        id: 'swiss-minimal',
        name: 'Swiss Minimal',
        keywords: ['swiss', 'minimal', 'grid', 'typography', 'helvetica', 'clean', 'modernist', 'design', 'bauhaus'],
        colors: {
            primary: '#000000',
            secondary: '#FF0000',
            accent: '#0066FF',
            background: '#FFFFFF',
            surface: '#F5F5F5',
            text: '#000000'
        },
        typography: { heading: 'Inter', body: 'Inter', mono: 'JetBrains Mono' },
        motion: 'TECH',
        visualDirection: 'Swiss International Style. Strong grid, bold typography, mathematical precision.',
        uiPatterns: {
            cardStyle: 'No visible card, grid-aligned content blocks',
            buttonStyle: 'Black background, no radius, simple invert on hover',
            layoutStructure: 'Strict 12-column grid, baseline alignment'
        }
    },
    {
        id: 'motion-heavy',
        name: 'Motion Heavy',
        keywords: ['motion', 'animated', 'kinetic', 'scroll', 'gsap', 'lottie', 'dynamic', 'interactive', 'awwwards'],
        colors: {
            primary: '#FF4D4D',
            secondary: '#4DFFFF',
            accent: '#FFD700',
            background: '#0F0F0F',
            surface: '#1A1A1A',
            text: '#FFFFFF'
        },
        typography: { heading: 'Clash Display', body: 'Inter', mono: 'JetBrains Mono' },
        motion: 'STUDIO',
        visualDirection: 'Animation-first design. Every element animates on scroll, magnetic buttons, custom cursor.',
        uiPatterns: {
            cardStyle: 'Dark with clip-path reveal animation, dramatic hover states',
            buttonStyle: 'Morphing background on hover, magnetic effect',
            layoutStructure: 'Full-screen sections, horizontal scroll optional, pinned elements'
        }
    },
    {
        id: 'vaporwave-y2k',
        name: 'Vaporwave Y2K',
        keywords: ['vaporwave', 'y2k', 'retro', 'aesthetic', 'nostalgic', 'neon', 'pink', 'dreamy', 'surreal'],
        colors: {
            primary: '#FF6EC7',
            secondary: '#00FFFF',
            accent: '#FF00FF',
            background: '#1A1A2E',
            surface: 'rgba(26, 26, 46, 0.8)',
            text: '#FFE4F3'
        },
        typography: { heading: 'VT323', body: 'Inter', mono: 'Space Mono' },
        motion: 'STUDIO',
        visualDirection: 'Dreamy vaporwave aesthetic. Pink/cyan neons, glitch effects, 90s nostalgia, surreal imagery.',
        uiPatterns: {
            cardStyle: 'Semi-transparent dark with neon border glow, no radius',
            buttonStyle: 'Neon outline with glow, pixelated font, no radius',
            layoutStructure: 'Dreamy floating elements, scanline overlays, slow animations'
        }
    },
    {
        id: 'ux-case-study',
        name: 'UX Case Study',
        keywords: ['ux', 'case study', 'product design', 'research', 'process', 'figma', 'user experience', 'portfolio'],
        colors: {
            primary: '#7C3AED',
            secondary: '#EC4899',
            accent: '#7C3AED',
            background: '#FFFFFF',
            surface: '#F9FAFB',
            text: '#111827'
        },
        typography: { heading: 'Inter', body: 'Inter', mono: 'JetBrains Mono' },
        motion: 'TECH',
        visualDirection: 'Process-focused portfolio. Clean sections, annotated images, narrative flow.',
        uiPatterns: {
            cardStyle: 'Gray background callout boxes, rounded corners',
            buttonStyle: 'Purple accent, simple design, clear CTAs',
            layoutStructure: 'Single column reading width (900px), full-width images'
        }
    },
    {
        id: 'nature-organic',
        name: 'Nature Organic',
        keywords: ['nature', 'organic', 'earthy', 'sustainable', 'green', 'natural', 'eco', 'calm', 'grounded', 'wellness'],
        colors: {
            primary: '#2D6A4F',
            secondary: '#95D5B2',
            accent: '#D4A373',
            background: '#FDFBF7',
            surface: '#FFFFFF',
            text: '#1F2421'
        },
        typography: { heading: 'Fraunces', body: 'DM Sans', mono: 'JetBrains Mono' },
        motion: 'STUDIO',
        visualDirection: 'Earthy, natural, calming. Organic shapes, nature photography, sustainable ethos.',
        uiPatterns: {
            cardStyle: 'Warm white with natural border, 16px radius, gentle shadows',
            buttonStyle: 'Forest green, pill shape, subtle scale on hover',
            layoutStructure: 'Flowing organic sections, nature imagery, intimate container'
        }
    }
];

/**
 * Match a brief's style preferences to the best vibe
 */
export function matchVibe(brief: Brief): Moodboard {
    const userVibe = brief.style?.vibe?.toLowerCase() || '';
    const userLikes = brief.style?.likes?.map(l => l.toLowerCase()) || [];

    let bestMatch = VIBE_LIBRARY[0]; // Default to minimal-developer
    let bestScore = 0;

    for (const vibe of VIBE_LIBRARY) {
        let score = 0;

        // Check keyword matches in user's vibe string
        for (const keyword of vibe.keywords) {
            if (userVibe.includes(keyword)) {
                score += 10; // Strong match
            }
            // Check in likes array
            for (const like of userLikes) {
                if (like.includes(keyword) || keyword.includes(like)) {
                    score += 5;
                }
            }
        }

        // Exact name match
        if (userVibe.includes(vibe.name.toLowerCase())) {
            score += 50;
        }

        // ID match
        if (userVibe.includes(vibe.id)) {
            score += 50;
        }

        if (score > bestScore) {
            bestScore = score;
            bestMatch = vibe;
        }
    }

    console.log(`🎨 Vibe Matched: ${bestMatch.name} (score: ${bestScore})`);

    // Convert to Moodboard type
    return {
        visual_direction: bestMatch.visualDirection,
        color_palette: {
            primary: bestMatch.colors.primary,
            secondary: bestMatch.colors.secondary,
            accent: bestMatch.colors.accent,
            background: bestMatch.colors.background,
            surface: bestMatch.colors.surface,
            text: bestMatch.colors.text
        },
        typography: {
            heading_font: bestMatch.typography.heading,
            body_font: bestMatch.typography.body,
            mono_font: bestMatch.typography.mono
        },
        ui_patterns: {
            card_style: bestMatch.uiPatterns.cardStyle,
            button_style: bestMatch.uiPatterns.buttonStyle,
            layout_structure: bestMatch.uiPatterns.layoutStructure
        },
        motion: {
            profile: bestMatch.motion,
            description: bestMatch.motion === 'STUDIO'
                ? 'Expressive animations with personality - bouncy transitions, playful hovers, creative reveals'
                : 'Subtle, purposeful motion - smooth fades, gentle transitions, professional restraint'
        }
    };
}

/**
 * Get the full style guide content for a matched vibe
 */
export function getVibeStyleGuide(moodboard: Moodboard): string {
    return `# Style Guide

## Visual Direction
${moodboard.visual_direction}

## Color Palette
- **Primary:** ${moodboard.color_palette.primary}
- **Secondary:** ${moodboard.color_palette.secondary}
- **Accent:** ${moodboard.color_palette.accent}
- **Background:** ${moodboard.color_palette.background}
- **Surface:** ${moodboard.color_palette.surface}
- **Text:** ${moodboard.color_palette.text}

## Typography
- **Headings:** ${moodboard.typography.heading_font}
- **Body:** ${moodboard.typography.body_font}
- **Mono/Code:** ${moodboard.typography.mono_font}

## UI Patterns
- **Cards:** ${moodboard.ui_patterns.card_style}
- **Buttons:** ${moodboard.ui_patterns.button_style}
- **Layout:** ${moodboard.ui_patterns.layout_structure}

## Motion Profile: ${moodboard.motion.profile}
${moodboard.motion.description}
`;
}

/**
 * Get all available vibe names for reference
 */
export function getAvailableVibes(): string[] {
    return VIBE_LIBRARY.map(v => v.name);
}
