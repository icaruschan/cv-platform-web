/**
 * Platform URL Builders
 * 
 * Builds filtered URLs for 5 curated design platforms based on vibe keywords.
 * Replaces Tavily search with direct, targeted scraping.
 * 
 * @see docs/inspiration_sources_guide.md for detailed platform documentation
 */

// ============================================================================
// VIBE KEYWORD MAPPINGS
// ============================================================================

/**
 * Maps common vibe keywords to platform-specific filter values.
 * Each platform has its own naming conventions for styles.
 */
export const VIBE_MAPPINGS: Record<string, {
    framer?: string[];
    webflow?: string[];
    awwwards?: string[];  // Hex color palettes
    godly?: string[];
}> = {
    // Dark themes
    dark: {
        framer: ['dark'],
        webflow: ['Dark'],
        awwwards: ['#404040', '#7A7A7A'],
        godly: ['dark'],
    },

    // Minimal/Clean
    minimal: {
        framer: ['minimal'],
        webflow: ['Minimal'],
        godly: ['minimal', 'clean'],
    },
    clean: {
        framer: ['minimal'],
        webflow: ['Minimal'],
        godly: ['clean'],
    },

    // Modern/Interactive
    modern: {
        framer: ['modern'],
        webflow: ['Modern'],
        godly: ['interactive', 'animation'],
    },
    interactive: {
        framer: ['animated'],
        godly: ['interactive'],
    },

    // Typography focused
    typographic: {
        framer: ['typographic', 'large-type'],
        webflow: ['Bold'],
        godly: ['typographic', 'large-type'],
    },
    bold: {
        framer: ['large-type'],
        webflow: ['Bold'],
        godly: ['large-type'],
    },

    // Visual styles
    gradient: {
        framer: ['gradient'],
        godly: ['gradient'],
    },
    colorful: {
        framer: ['colorful'],
        godly: ['colourful'],
    },
    monochrome: {
        framer: ['monochromatic', 'black-white'],
        godly: ['monochromatic', 'black-white'],
    },

    // Retro/Vintage
    retro: {
        framer: ['retro'],
        webflow: ['Retro'],
        godly: ['retro'],
    },

    // Professional
    professional: {
        framer: ['professional'],
        webflow: ['Corporate'],
        godly: ['clean'],
    },
    corporate: {
        framer: ['professional'],
        webflow: ['Corporate'],
    },

    // Creative/Playful
    playful: {
        framer: ['colorful'],
        webflow: ['Playful'],
        godly: ['fun'],
    },
    creative: {
        framer: ['illustrative'],
        webflow: ['Illustration'],
        godly: ['illustrative'],
    },

    // Layout styles
    grid: {
        framer: ['grid'],
        godly: ['grid', 'bento-grid'],
    },
    bento: {
        godly: ['bento-grid'],
    },

    // Light themes
    light: {
        framer: ['light'],
        webflow: ['Light'],
        godly: ['light'],
    },
    pastel: {
        framer: ['pastel'],
        godly: ['pastel'],
    },
};

/**
 * Known vibe keywords for direct matching (avoids LLM call).
 */
export const KNOWN_KEYWORDS = Object.keys(VIBE_MAPPINGS);

// ============================================================================
// DEFAULT FILTERS
// ============================================================================

/**
 * Default filters when no specific vibe keywords match.
 * Targets high-quality dark portfolios.
 */
const DEFAULT_FILTERS = {
    framer: ['dark', 'modern'],
    webflow: ['Modern', 'Dark'],
    awwwards: '#404040',
    godly: ['dark', 'minimal'],
};

// ============================================================================
// URL BUILDERS
// ============================================================================

/**
 * Build Framer marketplace URL with style filters.
 * 
 * @example
 * buildFramerUrl(['dark', 'minimal']) 
 * // => "https://www.framer.com/marketplace/templates/category/portfolio/?style=dark%2Cminimal"
 */
export function buildFramerUrl(vibeKeywords: string[]): string {
    const baseUrl = 'https://www.framer.com/marketplace/templates/category/portfolio/';

    // Collect all Framer styles from vibe keywords
    const styles = vibeKeywords
        .flatMap(vibe => VIBE_MAPPINGS[vibe]?.framer || [])
        .filter((v, i, arr) => arr.indexOf(v) === i); // dedupe

    if (styles.length === 0) {
        // Use defaults
        return `${baseUrl}?style=${encodeURIComponent(DEFAULT_FILTERS.framer.join(','))}`;
    }

    return `${baseUrl}?style=${encodeURIComponent(styles.join(','))}`;
}

/**
 * Build Webflow templates URL with style filters.
 * 
 * @example
 * buildWebflowUrl(['dark', 'modern'])
 * // => "https://webflow.com/templates/category/portfolio-and-agency-websites?styles=Dark%2CModern"
 */
export function buildWebflowUrl(vibeKeywords: string[]): string {
    const baseUrl = 'https://webflow.com/templates/category/portfolio-and-agency-websites';

    // Collect all Webflow styles from vibe keywords
    const styles = vibeKeywords
        .flatMap(vibe => VIBE_MAPPINGS[vibe]?.webflow || [])
        .filter((v, i, arr) => arr.indexOf(v) === i); // dedupe

    if (styles.length === 0) {
        return `${baseUrl}?styles=${encodeURIComponent(DEFAULT_FILTERS.webflow.join(','))}`;
    }

    return `${baseUrl}?styles=${encodeURIComponent(styles.join(','))}`;
}

/**
 * Build Awwwards URL with portfolio tag and color palette filter.
 * 
 * @example
 * buildAwwwardsUrl(['dark'])
 * // => "https://www.awwwards.com/websites/?tag=portfolio&palette=%23404040"
 */
export function buildAwwwardsUrl(vibeKeywords: string[]): string {
    const baseUrl = 'https://www.awwwards.com/websites/';

    // Find first matching palette color
    const palette = vibeKeywords
        .flatMap(vibe => VIBE_MAPPINGS[vibe]?.awwwards || [])
    [0] || DEFAULT_FILTERS.awwwards;

    return `${baseUrl}?tag=portfolio&palette=${encodeURIComponent(palette)}`;
}

/**
 * Build Godly URL with types and styles filters.
 * Always includes 'personal' and 'portfolio' types.
 * 
 * @example
 * buildGodlyUrl(['dark', 'minimal'])
 * // => "https://godly.website/?types=%5B%22personal%22%2C%22portfolio%22%5D&styles=%5B%22dark%22%2C%22minimal%22%5D"
 */
export function buildGodlyUrl(vibeKeywords: string[]): string {
    const baseUrl = 'https://godly.website/';

    // Fixed types for portfolio focus
    const types = ['personal', 'portfolio'];
    const typesParam = encodeURIComponent(JSON.stringify(types));

    // Collect all Godly styles from vibe keywords
    const styles = vibeKeywords
        .flatMap(vibe => VIBE_MAPPINGS[vibe]?.godly || [])
        .filter((v, i, arr) => arr.indexOf(v) === i); // dedupe

    if (styles.length === 0) {
        const defaultStyles = encodeURIComponent(JSON.stringify(DEFAULT_FILTERS.godly));
        return `${baseUrl}?types=${typesParam}&styles=${defaultStyles}`;
    }

    const stylesParam = encodeURIComponent(JSON.stringify(styles));
    return `${baseUrl}?types=${typesParam}&styles=${stylesParam}`;
}

/**
 * Build Lapa Ninja URL (no filters, just portfolio category).
 * 
 * @example
 * buildLapaUrl()
 * // => "https://www.lapa.ninja/category/portfolio/"
 */
export function buildLapaUrl(): string {
    return 'https://www.lapa.ninja/category/portfolio/';
}

// ============================================================================
// PLATFORM SELECTION
// ============================================================================

export type Platform = 'framer' | 'webflow' | 'awwwards' | 'godly' | 'lapa';

const TEMPLATE_PLATFORMS: Platform[] = ['framer', 'webflow'];
const GALLERY_PLATFORMS: Platform[] = ['awwwards', 'godly', 'lapa'];

/**
 * Select 3 random platforms: 1 template + 2 galleries.
 * This ensures a mix of high-quality template CSS and real portfolio diversity.
 */
export function selectPlatforms(): Platform[] {
    // Pick 1 random template platform
    const template = TEMPLATE_PLATFORMS[Math.floor(Math.random() * TEMPLATE_PLATFORMS.length)];

    // Pick 2 random gallery platforms
    const shuffledGalleries = [...GALLERY_PLATFORMS].sort(() => Math.random() - 0.5);
    const galleries = shuffledGalleries.slice(0, 2);

    return [template, ...galleries];
}

/**
 * Build filtered URL for a specific platform.
 */
export function buildPlatformUrl(platform: Platform, vibeKeywords: string[]): string {
    switch (platform) {
        case 'framer':
            return buildFramerUrl(vibeKeywords);
        case 'webflow':
            return buildWebflowUrl(vibeKeywords);
        case 'awwwards':
            return buildAwwwardsUrl(vibeKeywords);
        case 'godly':
            return buildGodlyUrl(vibeKeywords);
        case 'lapa':
            return buildLapaUrl();
        default:
            throw new Error(`Unknown platform: ${platform}`);
    }
}

// ============================================================================
// VIBE PARSING
// ============================================================================

/**
 * Parse raw vibe string into keywords using direct matching.
 * Returns matched keywords, or empty array if no matches found.
 * 
 * @example
 * parseVibeKeywords("dark minimal portfolio")
 * // => ["dark", "minimal"]
 * 
 * parseVibeKeywords("something sleek and techy")
 * // => [] (no direct matches, needs LLM fallback)
 */
export function parseVibeKeywords(rawVibe: string): string[] {
    const lowered = rawVibe.toLowerCase();

    return KNOWN_KEYWORDS.filter(keyword => {
        // Match whole words to avoid partial matches
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        return regex.test(lowered);
    });
}

/**
 * Check if we have enough keywords to skip LLM extraction.
 * Threshold: 2 or more keywords.
 */
export function hasEnoughKeywords(keywords: string[]): boolean {
    return keywords.length >= 2;
}
