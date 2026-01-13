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
 * Complete Awwwards color palette with semantic names.
 * @see https://www.awwwards.com/websites/?tag=portfolio&palette=%23[HEX]
 */
const AWWWARDS_COLORS = {
    // Reds
    darkRed: '#B42625',
    red: '#DA4F48',
    lightRed: '#E88D88',
    // Oranges
    darkOrange: '#C14E0B',
    orange: '#F57327',
    // Pinks
    salmon: '#F0CED1',
    darkPink: '#9D33A1',
    pink: '#C559C4',
    lightPink: '#DC94DE',
    // Yellows
    gold: '#FABC0F',
    yellow: '#FAD15F',
    lightYellow: '#FBE9A7',
    // Greens
    darkGreen: '#819526',
    green: '#B3CF3C',
    lightGreen: '#CDDE7E',
    // Blues
    darkBlue: '#1981C8',
    blue: '#49ABE8',
    lightBlue: '#8FCAF0',
    // Purples
    darkPurple: '#7B19C8',
    purple: '#9743D9',
    lightPurple: '#BE83ED',
    // Grays (dark to light)
    darkGray: '#404040',    // Perfect for dark themes
    gray: '#7A7A7A',        // Good for dark themes
    lightGray: '#C4C4C4',
    offWhite: '#E4E3E3',
    nearWhite: '#F3F2F2',
    white: '#FFFFFF',
};

/**
 * Maps common vibe keywords to platform-specific filter values.
 * Each platform has its own naming conventions for styles.
 * 
 * Framer styles (17): 3D, Animated, Black & White, Colorful, Dark, Gradient, 
 *   Grid, Illustrative, Large Type, Light, Minimal, Modern, Monochromatic, 
 *   Pastel, Professional, Retro, Typographic
 * 
 * Webflow styles (9): Playful, Modern, Bold, Light, Corporate, Illustration,
 *   Dark, Retro, Minimal
 * 
 * Godly styles (30): Dark, Minimal, Interactive, Large Type, Animation, 
 *   Single Page, Unusual Layout, Typographic, Fun, Long Scrolling, 
 *   Big Background Video, Black & White, Clean, Colourful, Gradient, 
 *   Illustrative, Grid, Small Type, Bento Grid, Infinite Scroll, Monochromatic,
 *   Horizontal Layout, Big Background Image, Light, Pastel, Retro, 
 *   Brutalist, Drag & Drop, Horizontal Scrolling, Masonry
 * 
 * Awwwards: 27 color palette options
 */
export const VIBE_MAPPINGS: Record<string, {
    framer?: string[];
    webflow?: string[];
    awwwards?: string[];  // Hex color codes
    godly?: string[];
}> = {
    // ==================== THEME MODES ====================
    dark: {
        framer: ['dark'],
        webflow: ['Dark'],
        awwwards: [AWWWARDS_COLORS.darkGray, AWWWARDS_COLORS.gray],
        godly: ['dark'],
    },
    light: {
        framer: ['light'],
        webflow: ['Light'],
        awwwards: [AWWWARDS_COLORS.offWhite, AWWWARDS_COLORS.nearWhite, AWWWARDS_COLORS.white],
        godly: ['light'],
    },

    // ==================== STYLE AESTHETICS ====================
    minimal: {
        framer: ['minimal'],
        webflow: ['Minimal'],
        awwwards: [AWWWARDS_COLORS.darkGray, AWWWARDS_COLORS.white],
        godly: ['minimal', 'clean'],
    },
    clean: {
        framer: ['minimal'],
        webflow: ['Minimal'],
        awwwards: [AWWWARDS_COLORS.white, AWWWARDS_COLORS.nearWhite],
        godly: ['clean'],
    },
    modern: {
        framer: ['modern'],
        webflow: ['Modern'],
        awwwards: [AWWWARDS_COLORS.darkGray],
        godly: ['interactive', 'animation'],
    },
    professional: {
        framer: ['professional'],
        webflow: ['Corporate'],
        awwwards: [AWWWARDS_COLORS.darkGray, AWWWARDS_COLORS.darkBlue],
        godly: ['clean', 'minimal'],
    },
    corporate: {
        framer: ['professional'],
        webflow: ['Corporate'],
        awwwards: [AWWWARDS_COLORS.darkBlue, AWWWARDS_COLORS.gray],
        godly: ['clean'],
    },
    retro: {
        framer: ['retro'],
        webflow: ['Retro'],
        awwwards: [AWWWARDS_COLORS.orange, AWWWARDS_COLORS.gold],
        godly: ['retro'],
    },

    // ==================== TYPOGRAPHY ====================
    typographic: {
        framer: ['typographic', 'large-type'],
        webflow: ['Bold'],
        awwwards: [AWWWARDS_COLORS.darkGray],
        godly: ['typographic', 'large-type'],
    },
    bold: {
        framer: ['large-type'],
        webflow: ['Bold'],
        awwwards: [AWWWARDS_COLORS.darkGray, AWWWARDS_COLORS.red],
        godly: ['large-type'],
    },
    'large-type': {
        framer: ['large-type'],
        webflow: ['Bold'],
        godly: ['large-type'],
    },
    'small-type': {
        framer: ['minimal'],
        godly: ['small-type'],
    },

    // ==================== VISUAL EFFECTS ====================
    '3d': {
        framer: ['3d'],
        godly: ['3d'],
    },
    animated: {
        framer: ['animated'],
        godly: ['animation', 'interactive'],
    },
    animation: {
        framer: ['animated'],
        godly: ['animation'],
    },
    interactive: {
        framer: ['animated'],
        godly: ['interactive'],
    },
    gradient: {
        framer: ['gradient'],
        awwwards: [AWWWARDS_COLORS.purple, AWWWARDS_COLORS.blue, AWWWARDS_COLORS.pink],
        godly: ['gradient'],
    },
    glassmorphism: {
        framer: ['gradient', 'modern'],
        godly: ['gradient'],
    },
    brutalist: {
        framer: ['black-white', 'typographic'],
        godly: ['brutalist'],
    },

    // ==================== LAYOUT PATTERNS ====================
    grid: {
        framer: ['grid'],
        awwwards: [AWWWARDS_COLORS.darkGray],
        godly: ['grid'],
    },
    bento: {
        framer: ['grid'],
        godly: ['bento-grid'],
    },
    'bento-grid': {
        framer: ['grid'],
        godly: ['bento-grid'],
    },
    'single-page': {
        godly: ['single-page'],
    },
    'unusual-layout': {
        godly: ['unusual-layout'],
    },
    'horizontal-layout': {
        godly: ['horizontal-layout'],
    },
    'horizontal-scrolling': {
        godly: ['horizontal-scrolling'],
    },
    masonry: {
        framer: ['grid'],
        godly: ['masonry'],
    },

    // ==================== SCROLL/MOTION ====================
    'long-scrolling': {
        godly: ['long-scrolling'],
    },
    'infinite-scroll': {
        godly: ['infinite-scroll'],
    },
    scroll: {
        godly: ['long-scrolling', 'infinite-scroll'],
    },

    // ==================== BACKGROUND STYLES ====================
    'big-background-video': {
        godly: ['big-background-video'],
    },
    'big-background-image': {
        godly: ['big-background-image'],
    },
    video: {
        godly: ['big-background-video'],
    },

    // ==================== COLOR THEMES ====================
    colorful: {
        framer: ['colorful'],
        awwwards: [AWWWARDS_COLORS.blue, AWWWARDS_COLORS.purple, AWWWARDS_COLORS.orange],
        godly: ['colourful'],
    },
    colourful: {
        framer: ['colorful'],
        awwwards: [AWWWARDS_COLORS.blue, AWWWARDS_COLORS.purple, AWWWARDS_COLORS.orange],
        godly: ['colourful'],
    },
    monochrome: {
        framer: ['monochromatic', 'black-white'],
        awwwards: [AWWWARDS_COLORS.darkGray, AWWWARDS_COLORS.gray, AWWWARDS_COLORS.lightGray],
        godly: ['monochromatic'],
    },
    monochromatic: {
        framer: ['monochromatic'],
        awwwards: [AWWWARDS_COLORS.darkGray, AWWWARDS_COLORS.gray],
        godly: ['monochromatic'],
    },
    blackwhite: {
        framer: ['black-white'],
        awwwards: [AWWWARDS_COLORS.darkGray, AWWWARDS_COLORS.white],
        godly: ['black-white'],
    },
    'black-white': {
        framer: ['black-white'],
        awwwards: [AWWWARDS_COLORS.darkGray, AWWWARDS_COLORS.white],
        godly: ['black-white'],
    },
    pastel: {
        framer: ['pastel'],
        awwwards: [AWWWARDS_COLORS.lightBlue, AWWWARDS_COLORS.lightPink, AWWWARDS_COLORS.lightYellow],
        godly: ['pastel'],
    },

    // ==================== SPECIFIC COLORS ====================
    blue: {
        framer: ['colorful'],
        awwwards: [AWWWARDS_COLORS.darkBlue, AWWWARDS_COLORS.blue, AWWWARDS_COLORS.lightBlue],
        godly: ['colourful'],
    },
    purple: {
        framer: ['colorful', 'gradient'],
        awwwards: [AWWWARDS_COLORS.darkPurple, AWWWARDS_COLORS.purple, AWWWARDS_COLORS.lightPurple],
        godly: ['colourful'],
    },
    pink: {
        framer: ['colorful', 'pastel'],
        awwwards: [AWWWARDS_COLORS.darkPink, AWWWARDS_COLORS.pink, AWWWARDS_COLORS.lightPink],
        godly: ['colourful'],
    },
    red: {
        framer: ['colorful'],
        awwwards: [AWWWARDS_COLORS.darkRed, AWWWARDS_COLORS.red, AWWWARDS_COLORS.lightRed],
        godly: ['colourful'],
    },
    orange: {
        framer: ['colorful'],
        awwwards: [AWWWARDS_COLORS.darkOrange, AWWWARDS_COLORS.orange],
        godly: ['colourful'],
    },
    yellow: {
        framer: ['colorful'],
        awwwards: [AWWWARDS_COLORS.gold, AWWWARDS_COLORS.yellow, AWWWARDS_COLORS.lightYellow],
    },
    green: {
        framer: ['colorful'],
        awwwards: [AWWWARDS_COLORS.darkGreen, AWWWARDS_COLORS.green, AWWWARDS_COLORS.lightGreen],
        godly: ['colourful'],
    },

    // ==================== CREATIVE ====================
    playful: {
        framer: ['colorful', 'animated'],
        webflow: ['Playful'],
        awwwards: [AWWWARDS_COLORS.pink, AWWWARDS_COLORS.yellow, AWWWARDS_COLORS.blue],
        godly: ['fun', 'colourful'],
    },
    fun: {
        framer: ['colorful', 'animated'],
        webflow: ['Playful'],
        awwwards: [AWWWARDS_COLORS.pink, AWWWARDS_COLORS.yellow],
        godly: ['fun'],
    },
    creative: {
        framer: ['illustrative'],
        webflow: ['Illustration'],
        awwwards: [AWWWARDS_COLORS.purple, AWWWARDS_COLORS.orange],
        godly: ['illustrative'],
    },
    illustrative: {
        framer: ['illustrative'],
        webflow: ['Illustration'],
        godly: ['illustrative'],
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
    awwwards: AWWWARDS_COLORS.darkGray,
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
