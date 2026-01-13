import OpenAI from 'openai';
import FirecrawlApp from '@mendable/firecrawl-js';
import axios from 'axios';
import { Brief, Moodboard } from '../types';
import {
    parseVibeKeywords,
    hasEnoughKeywords,
    selectPlatforms,
    buildPlatformUrl,
    Platform,
    KNOWN_KEYWORDS,
} from '../helpers/platform-urls';

interface FirecrawlScrapeResponse {
    success?: boolean;
    links?: string[];
    data?: { links?: string[] };
    screenshot?: string;
    json?: Record<string, unknown>;
}

// --- Configuration ---
// Platform types for direct scraping
const PLATFORM_CONFIG: Record<Platform, { type: 'template' | 'gallery' }> = {
    framer: { type: 'template' },
    webflow: { type: 'template' },
    awwwards: { type: 'gallery' },
    godly: { type: 'gallery' },
    lapa: { type: 'gallery' },
};

// Legacy platforms for Tavily fallback
const LEGACY_PLATFORMS = [
    { name: 'Awwwards', site: 'awwwards.com', type: 'gallery' },
    { name: 'Godly', site: 'godly.website', type: 'gallery' },
    { name: 'Lapa Ninja', site: 'lapa.ninja', type: 'gallery' },
    { name: 'Framer', site: 'framer.com/templates', type: 'template' },
    { name: 'Webflow', site: 'webflow.com/templates', type: 'template' },
];

// Domains to filter out when finding external links
const INTERNAL_DOMAINS = [
    'awwwards.com', 'godly.website', 'siteinspire.com', 'lapa.ninja', 'landingfolio.com',
    'facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com', 'x.com',
    'youtube.com', 'google.com', 'pinterest.com', 'tiktok.com', 'dribbble.com', 'behance.net'
];

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "CV Platform",
    },
});

// Lazy initialization to prevent module-level crashes
let firecrawlClient: FirecrawlApp | null = null;
function getFirecrawl(): FirecrawlApp {
    if (!firecrawlClient && process.env.FIRECRAWL_API_KEY) {
        firecrawlClient = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });
    }
    if (!firecrawlClient) {
        throw new Error('Firecrawl API key not configured');
    }
    return firecrawlClient;
}

// Use Flash model for speed/cost
const GEMINI_MODEL = process.env.GEMINI_FLASH_MODEL || "google/gemini-3-flash-preview";

// Max sources to process (reduced to avoid Firecrawl rate limits - 11 req/min on free tier)
const MAX_SOURCES = 3;

// Delay between Firecrawl API calls to avoid rate limiting (in milliseconds)
const FIRECRAWL_DELAY_MS = 6000; // 6 seconds = ~10 req/min max

// Helper to add delay between API calls
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Types
interface Source {
    platform: string;
    url: string;
    type: 'gallery' | 'template' | 'visual_only';
}

interface ResolvedSource extends Source {
    resolvedUrl: string;
    canBrand: boolean;
}

interface ExtractedData {
    platform: string;
    url: string;
    screenshot?: string;
    branding?: BrandingData;
}

interface BrandingData {
    colors?: Record<string, string>;
    colorScheme?: string;
    typography?: {
        headingFont?: string;
        bodyFont?: string;
        fontFamilies?: {
            primary?: string;
            heading?: string;
            code?: string;
        };
        fontSizes?: Record<string, string>;
        fontWeights?: Record<string, number>;
    };
    spacing?: Record<string, string>;
    animations?: Record<string, string | object>;
    components?: {
        buttonPrimary?: Record<string, string>;
        buttonSecondary?: Record<string, string>;
        input?: Record<string, string>;
    };
    personality?: {
        tone?: string;
        energy?: string;
        targetAudience?: string;
        description?: string;
    };
}

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

export async function generateMoodboard(brief: Brief): Promise<Moodboard> {
    console.log(`🎨 Starting Inspiration Agent for: ${brief.style.vibe}`);

    try {
        // Step 0: Parse Vibe (keyword-first, LLM fallback)
        const vibeKeywords = await extractVibeKeywords(brief.style.vibe);
        console.log(`   🎯 Vibe Keywords: [${vibeKeywords.join(', ')}]`);

        // Step 1: Get Sources via Direct Platform Scraping (with Tavily fallback)
        const sources = await getInspirationSources(vibeKeywords, brief.style.vibe);
        if (sources.length === 0) {
            console.warn("⚠️ No inspiration sources found. Using fallback.");
            return createFallbackMoodboard(brief.style.vibe, "No inspiration sources found");
        }

        // Step 2: Extract Hybrid Data (Branding + Screenshots)
        const extractedData = await extractHybridData(sources);
        if (extractedData.length === 0) {
            console.warn("⚠️ No data could be extracted. Using fallback.");
            return createFallbackMoodboard(brief.style.vibe, "Data extraction failed");
        }

        // Step 3: Vision Analysis
        const visionAnalysis = await analyzeVisualPatterns(extractedData, vibeKeywords.join(' '));

        // Step 4: Synthesize to Object
        return synthesizeMoodboardObject(extractedData, visionAnalysis, vibeKeywords.join(' '));

    } catch (error: unknown) {
        console.error(`❌ Inspiration engine error: ${error instanceof Error ? error.message : String(error)}`);
        return createFallbackMoodboard(brief.style.vibe, String(error));
    }
}

// ============================================================================
// STEP 0: EXTRACT VIBE KEYWORDS (Hybrid: Keyword-first → LLM fallback)
// ============================================================================

async function extractVibeKeywords(fullVibe: string): Promise<string[]> {
    console.log(`   🔍 Parsing vibe: "${fullVibe.substring(0, 50)}${fullVibe.length > 50 ? '...' : ''}"`);

    // Step 1: Try direct keyword matching (free, instant)
    const directMatches = parseVibeKeywords(fullVibe);

    if (hasEnoughKeywords(directMatches)) {
        console.log(`   ✅ Keywords matched directly: [${directMatches.join(', ')}]`);
        return directMatches;
    }

    // Step 2: Vague vibe - use LLM to extract keywords
    console.log(`   🔄 Vague vibe, using LLM extraction...`);

    try {
        const response = await openai.chat.completions.create({
            model: GEMINI_MODEL,
            messages: [
                {
                    role: "system",
                    content: `You extract design style keywords from descriptions.
                    
Available keywords: ${KNOWN_KEYWORDS.join(', ')}

Return 2-4 keywords from this list that best match the vibe. 
Output ONLY a comma-separated list, nothing else.
Example: "dark, minimal, modern"`
                },
                { role: "user", content: fullVibe }
            ],
            max_tokens: 50,
            temperature: 0.3
        });

        const llmOutput = response.choices[0].message.content?.trim() || '';
        const extracted = llmOutput.split(',').map(k => k.trim().toLowerCase()).filter(k => KNOWN_KEYWORDS.includes(k));

        if (extracted.length >= 2) {
            console.log(`   ✅ Keywords extracted via LLM: [${extracted.join(', ')}]`);
            return extracted;
        }
    } catch (error) {
        console.warn(`   ⚠️ LLM extraction failed: ${error instanceof Error ? error.message : error}`);
    }

    // Fallback: default keywords
    console.log(`   ⚠️ Using default keywords: [dark, modern]`);
    return ['dark', 'modern'];
}

// ============================================================================
// STEP 1: GET INSPIRATION SOURCES (Direct Scraping → Tavily Fallback)
// ============================================================================

interface PlatformCard {
    platform: Platform;
    name: string;
    targetUrl: string;
    thumbnailUrl?: string;
}

async function getInspirationSources(vibeKeywords: string[], rawVibe: string): Promise<ResolvedSource[]> {
    try {
        // Primary: Direct platform scraping
        console.log(`   🎯 Using direct platform scraping...`);
        return await scrapeFilteredPlatforms(vibeKeywords);
    } catch (error) {
        console.warn(`   ⚠️ Direct scraping failed: ${error instanceof Error ? error.message : error}`);
        console.log(`   🔄 Falling back to Tavily search...`);

        // Fallback: Legacy Tavily search
        const sources = await searchDesignInspirationFallback(rawVibe);
        return await resolveGalleryUrls(sources);
    }
}

async function scrapeFilteredPlatforms(vibeKeywords: string[]): Promise<ResolvedSource[]> {
    // Select 3 platforms: 1 template + 2 galleries
    const platforms = selectPlatforms();
    console.log(`   📋 Selected platforms: [${platforms.join(', ')}]`);

    const results: ResolvedSource[] = [];

    for (const platform of platforms) {
        const listUrl = buildPlatformUrl(platform, vibeKeywords);
        console.log(`   🔗 ${platform}: ${listUrl.substring(0, 80)}...`);

        try {
            // Add delay to avoid rate limiting
            await delay(FIRECRAWL_DELAY_MS);

            // Scrape the list page
            const cards = await scrapeListPage(platform, listUrl);
            console.log(`   📦 ${platform}: Found ${cards.length} cards`);

            // Take first 1-2 cards from each platform
            const selectedCards = cards.slice(0, 2);

            for (const card of selectedCards) {
                const config = PLATFORM_CONFIG[platform];
                results.push({
                    platform: platform,
                    url: card.targetUrl,
                    type: config.type,
                    resolvedUrl: card.targetUrl,
                    canBrand: true,
                });
            }
        } catch (error) {
            console.warn(`   ⚠️ ${platform}: Scrape failed - ${error instanceof Error ? error.message : error}`);
        }
    }

    console.log(`   ✅ Total sources from direct scraping: ${results.length}`);
    return results;
}

async function scrapeListPage(platform: Platform, listUrl: string): Promise<PlatformCard[]> {
    const result = await getFirecrawl().scrape(listUrl, {
        formats: ['html', 'links'] as unknown as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        waitFor: 2000,
    }) as unknown as FirecrawlScrapeResponse & { html?: string };

    const links = result?.links || result?.data?.links || [];
    const cards: PlatformCard[] = [];

    switch (platform) {
        case 'framer':
            // Extract .framer.website links (direct preview links)
            for (const link of links) {
                if (link.includes('.framer.website') && !link.includes('framer.com')) {
                    const name = link.split('.')[0].replace('https://', '');
                    cards.push({ platform, name, targetUrl: link });
                }
            }
            // Extract from marketplace template URLs (NOT category pages)
            // Template URLs: /marketplace/templates/sawad/
            // Category URLs: /marketplace/templates/category/portfolio/
            for (const link of links) {
                // Match individual template pages, NOT category pages
                const match = link.match(/framer\.com\/marketplace\/templates\/([a-zA-Z0-9-]+)\/?$/);
                if (match) {
                    const slug = match[1].toLowerCase();
                    // Skip if it's a category keyword
                    const categoryKeywords = ['category', 'all', 'featured', 'new', 'free'];
                    if (categoryKeywords.includes(slug)) continue;
                    // Skip very short slugs that are likely not templates
                    if (slug.length < 3) continue;
                    cards.push({ platform, name: slug, targetUrl: `https://${slug}.framer.website` });
                }
            }
            break;

        case 'webflow':
            // Extract .webflow.io links (direct preview links)
            for (const link of links) {
                if (link.includes('.webflow.io') && !link.includes('webflow.com')) {
                    const name = link.split('.')[0].replace('https://', '');
                    cards.push({ platform, name, targetUrl: link });
                }
            }
            // Extract from template HTML pages
            // Pattern: /templates/html/[template-name]-website-template
            for (const link of links) {
                const match = link.match(/webflow\.com\/templates\/html\/([a-zA-Z0-9-]+)/);
                if (match) {
                    // Clean up slug - remove common suffixes
                    let slug = match[1].toLowerCase()
                        .replace(/-website-template$/, '')
                        .replace(/-template$/, '');
                    if (slug.length < 3) continue;
                    cards.push({ platform, name: slug, targetUrl: `https://${slug}.webflow.io` });
                }
            }
            break;

        case 'awwwards':
        case 'godly':
        case 'lapa':
            // These link to real external sites
            const externalLinks = links.filter((link: string) => {
                if (!link || !link.startsWith('http')) return false;
                // Filter out internal/social links
                return !INTERNAL_DOMAINS.some(domain => link.includes(domain));
            });
            for (const link of externalLinks.slice(0, 5)) {
                cards.push({ platform, name: new URL(link).hostname, targetUrl: link });
            }
            break;
    }

    // Dedupe by targetUrl
    const seen = new Set<string>();
    return cards.filter(card => {
        if (seen.has(card.targetUrl)) return false;
        seen.add(card.targetUrl);
        return true;
    });
}

// ============================================================================
// STEP 0: EXTRACT SEARCH VIBE
// ============================================================================

async function extractSearchVibe(fullVibe: string): Promise<string> {
    // If already short enough (under 50 chars), use as-is
    if (fullVibe.length <= 50) {
        console.log(`   ✅ Vibe already short enough: "${fullVibe}"`);
        return fullVibe;
    }

    console.log(`   🔄 Condensing long vibe (${fullVibe.length} chars)...`);

    // Fallback function - extract meaningful keywords from vibe
    const getFallbackVibe = (): string => {
        const designTerms = ['minimalist', 'modern', 'playful', 'dark', 'light', 'neobrutalist',
            'corporate', 'creative', 'elegant', 'bold', 'clean', 'tech', 'portfolio', 'sleek', 'animated'];
        const vibeWords = fullVibe.toLowerCase().split(/\s+/);
        const matchedTerms = designTerms.filter(term => vibeWords.some(w => w.includes(term)));

        if (matchedTerms.length >= 2) {
            return matchedTerms.slice(0, 3).map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' ') + ' Portfolio';
        }
        // Default fallback: first 5 words
        return fullVibe.split(' ').slice(0, 5).join(' ');
    };

    try {
        const response = await openai.chat.completions.create({
            model: GEMINI_MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are a design curator. Extract the core visual style from the description into a SHORT search query (3-5 words max). Examples: 'Minimalist Dark Portfolio', 'Neobrutalist Tech Site', 'Sleek Animated Professional'. Output ONLY the short phrase, nothing else."
                },
                { role: "user", content: fullVibe }
            ],
            max_tokens: 30,
            temperature: 0.3
        });

        const shortVibe = response.choices[0].message.content?.trim().replace(/['"]/g, '') || '';

        // Validate the response
        if (!shortVibe || shortVibe.length < 3) {
            console.warn(`   ⚠️ LLM returned empty/invalid vibe, using fallback...`);
            return getFallbackVibe();
        }

        console.log(`   ✅ Condensed vibe: "${shortVibe}"`);
        return shortVibe;

    } catch (error) {
        console.warn(`   ⚠️ Failed to condense vibe: ${error instanceof Error ? error.message : error}`);
        return getFallbackVibe();
    }
}

// ============================================================================
// TAVILY FALLBACK: SEARCH DESIGN INSPIRATION
// ============================================================================

async function searchDesignInspirationFallback(vibe: string): Promise<Source[]> {
    console.log(`   🔍 [Fallback] Searching via Tavily for: "${vibe}" across ${LEGACY_PLATFORMS.length} platforms...`);

    const sources: Source[] = [];

    for (const platform of LEGACY_PLATFORMS) {
        // Use the vibe directly without appending "website design"
        const query = `${vibe} site:${platform.site}`;

        try {
            const response = await axios.post("https://api.tavily.com/search", {
                api_key: process.env.TAVILY_API_KEY,
                query: query,
                search_depth: "basic",
                include_images: false,
                max_results: 1
            });

            if (response.data.results && response.data.results.length > 0) {
                sources.push({
                    platform: platform.name,
                    url: response.data.results[0].url,
                    type: platform.type as 'gallery' | 'template' | 'visual_only'
                });
                console.log(`      ✅ ${platform.name}: Found`);
            } else {
                console.log(`      ⚠️ ${platform.name}: No results`);
            }
        } catch {
            console.warn(`      ⚠️ ${platform.name}: Search failed`);
        }
    }

    console.log(`   ✅ Found ${sources.length} inspiration sources.`);
    return sources;
}

// ============================================================================
// STEP 2: RESOLVE GALLERY URLS TO REAL SITES
// ============================================================================

async function resolveGalleryUrls(sources: Source[]): Promise<ResolvedSource[]> {
    console.log(`   🔗 Resolving gallery URLs to real sites...`);

    const resolved: ResolvedSource[] = [];

    for (const source of sources) {
        try {
            if (source.type === 'visual_only') {
                // Visual only - keep for screenshots, can't extract branding
                resolved.push({ ...source, resolvedUrl: source.url, canBrand: false });
                console.log(`      📷 ${source.platform}: Visual only`);
            }
            else if (source.type === 'template') {
                // Template sites (Framer, Webflow) - extract preview URL
                console.log(`      🔍 ${source.platform}: Resolving template preview...`);
                const previewUrl = await resolveTemplateUrl(source.url, source.platform);

                if (previewUrl) {
                    resolved.push({ ...source, resolvedUrl: previewUrl, canBrand: true });
                    console.log(`      ✅ ${source.platform}: Resolved to ${previewUrl}`);
                } else {
                    resolved.push({ ...source, resolvedUrl: source.url, canBrand: false });
                    console.log(`      ⚠️ ${source.platform}: Could not resolve preview`);
                }
            }
            else if (source.type === 'gallery') {
                // Gallery sites - need to extract real URL via Firecrawl
                console.log(`      🔍 ${source.platform}: Resolving external link...`);

                // Add delay to avoid rate limiting
                await delay(FIRECRAWL_DELAY_MS);

                const scrapeResult = await getFirecrawl().scrape(source.url, {
                    formats: ['links'] as unknown as any // eslint-disable-line @typescript-eslint/no-explicit-any
                }) as unknown as FirecrawlScrapeResponse;

                // Debug: Log the actual response structure
                console.log(`      📦 ${source.platform}: Firecrawl response keys:`, Object.keys(scrapeResult || {}));

                // Handle different Firecrawl SDK response formats
                // v1 SDK: { success: true, data: { links: [...] } } or { success: true, links: [...] }
                const links = scrapeResult?.links || scrapeResult?.data?.links || [];
                const isSuccess = scrapeResult?.success !== false; // Default to true if not explicitly false

                if (isSuccess && links.length > 0) {
                    const externalUrl = findExternalLink(links);
                    if (externalUrl) {
                        resolved.push({ ...source, resolvedUrl: externalUrl, canBrand: true });
                        console.log(`      ✅ ${source.platform}: Resolved to ${externalUrl}`);
                    } else {
                        resolved.push({ ...source, resolvedUrl: source.url, canBrand: false });
                        console.log(`      ⚠️ ${source.platform}: No external link found in ${links.length} links`);
                    }
                } else {
                    resolved.push({ ...source, resolvedUrl: source.url, canBrand: false });
                    console.log(`      ⚠️ ${source.platform}: Scrape returned no links (success: ${isSuccess})`);
                }
            }
        } catch (error) {
            console.warn(`      ⚠️ ${source.platform}: Resolution failed - ${error instanceof Error ? error.message : error}`);
            resolved.push({ ...source, resolvedUrl: source.url, canBrand: false });
        }
    }

    return resolved;
}

/**
 * Helper: Resolve Framer/Webflow template URLs to preview sites
 */
async function resolveTemplateUrl(url: string, platform: string): Promise<string | null> {
    try {
        if (platform === 'Framer') {
            // Framer pattern: framer.com/templates/{name}/ → {name}.framer.website
            const match = url.match(/framer\.com\/(?:marketplace\/)?templates\/([a-zA-Z0-9-]+)/i);
            if (match) {
                const templateName = match[1].toLowerCase();
                return `https://${templateName}.framer.website`;
            }

            // Fallback: scrape for preview link
            const scrapeResult = await getFirecrawl().scrape(url, { formats: ['links'] as unknown as any }) as unknown as FirecrawlScrapeResponse; // eslint-disable-line @typescript-eslint/no-explicit-any
            const links = scrapeResult?.links || scrapeResult?.data?.links || [];
            if (links.length > 0) {
                const previewLink = links.find((link: string) => link.includes('.framer.website'));
                return previewLink || null;
            }
        }

        if (platform === 'Webflow') {
            // Webflow: Need to scrape for preview link
            const scrapeResult = await getFirecrawl().scrape(url, { formats: ['links'] as unknown as any }) as unknown as FirecrawlScrapeResponse; // eslint-disable-line @typescript-eslint/no-explicit-any
            const links = scrapeResult?.links || scrapeResult?.data?.links || [];
            if (links.length > 0) {
                const previewLink = links.find((link: string) =>
                    link.includes('.webflow.io') || link.includes('preview--')
                );
                return previewLink || null;
            }
        }

        return null;
    } catch (error) {
        console.warn(`      ⚠️ Template URL resolution failed: ${error instanceof Error ? error.message : error}`);
        return null;
    }
}

/**
 * Helper: Find external link from gallery page
 */
function findExternalLink(links: string[]): string | null {
    if (!links || !Array.isArray(links)) return null;

    // Filter out internal links and common non-site URLs
    const externalLinks = links.filter(link => {
        if (!link || !link.startsWith('http')) return false;
        return !INTERNAL_DOMAINS.some(domain => link.includes(domain));
    });

    // Return first valid external link
    return externalLinks[0] || null;
}

// ============================================================================
// STEP 3: EXTRACT HYBRID DATA (BRANDING + SCREENSHOTS)
// ============================================================================

async function extractHybridData(sources: ResolvedSource[]): Promise<ExtractedData[]> {
    console.log(`   📊 Extracting hybrid data (branding + screenshots)...`);

    const results: ExtractedData[] = [];

    for (const source of sources.slice(0, MAX_SOURCES)) {
        const data: ExtractedData = {
            platform: source.platform,
            url: source.resolvedUrl,
        };

        try {
            // Always try to get screenshot
            console.log(`      📸 ${source.platform}: Capturing screenshot...`);

            // Add delay to avoid rate limiting
            await delay(FIRECRAWL_DELAY_MS);

            // Set up scrape options - always wait for JS hydration
            const scrapeOptions: Record<string, unknown> = {
                formats: ['screenshot'],
                waitFor: 3000, // Wait for JS to render
            };

            const screenshotResult = await getFirecrawl().scrape(source.resolvedUrl, scrapeOptions as unknown as any) as unknown as FirecrawlScrapeResponse; // eslint-disable-line @typescript-eslint/no-explicit-any

            // Check for screenshot existence (success may be undefined in some SDK versions)
            if (screenshotResult.screenshot) {
                data.screenshot = screenshotResult.screenshot;
                console.log(`      ✅ ${source.platform}: Screenshot captured (${Math.round(screenshotResult.screenshot.length / 1024)}KB)`);
            } else {
                console.log(`      ⚠️ ${source.platform}: No screenshot returned`);
            }

            // Get branding only for sites that support it
            if (source.canBrand) {
                console.log(`      🎨 ${source.platform}: Extracting branding...`);
                try {
                    // Add delay before branding extraction
                    await delay(FIRECRAWL_DELAY_MS);

                    // Use native Firecrawl branding format (returns full CSS properties)
                    const brandingResult = await getFirecrawl().scrape(source.resolvedUrl, {
                        formats: ['branding'] as unknown as any // eslint-disable-line @typescript-eslint/no-explicit-any
                    }) as unknown as { success?: boolean; branding?: BrandingData };

                    // Check for branding existence (not just success flag)
                    if (brandingResult.branding) {
                        data.branding = brandingResult.branding;
                        console.log(`      ✅ ${source.platform}: Full branding extracted`);

                        // Log what we got
                        const b = brandingResult.branding;
                        console.log(`         - Colors: ${b.colors ? Object.keys(b.colors).length : 0}`);
                        console.log(`         - Spacing: ${b.spacing ? Object.keys(b.spacing).length : 0}`);
                        console.log(`         - Animations: ${b.animations ? Object.keys(b.animations).length : 0}`);
                        console.log(`         - Components: ${b.components ? 'yes' : 'no'}`);
                        console.log(`         - Personality: ${b.personality ? 'yes' : 'no'}`);
                    } else {
                        console.log(`      ⚠️ ${source.platform}: No branding returned`);
                    }
                } catch {
                    console.warn(`      ⚠️ ${source.platform}: Branding extraction failed`);
                }
            }

            results.push(data);
        } catch (error) {
            console.warn(`      ⚠️ ${source.platform}: Data extraction failed - ${error instanceof Error ? error.message : error}`);
        }
    }

    console.log(`   ✅ Extracted data from ${results.length} sources.`);
    return results;
}

// ============================================================================
// STEP 4: ANALYZE VISUAL PATTERNS (VISION API)
// ============================================================================

async function analyzeVisualPatterns(sources: ExtractedData[], vibe: string): Promise<string | null> {
    console.log(`   🧠 Analyzing visual patterns with Gemini Vision...`);

    const screenshots = sources.filter(s => s.screenshot);
    if (screenshots.length === 0) {
        console.warn('   ⚠️ No screenshots available for vision analysis.');
        return null;
    }

    const content: Array<OpenAI.Chat.Completions.ChatCompletionContentPart> = [
        {
            type: "text",
            text: `You are a Senior UI/UX Designer. I am building a portfolio website with the vibe: "${vibe}".
            
Analyze these reference screenshots. Focus ONLY on:

1. **Layout Patterns** - How is content structured? Grid systems? Hero layout?
2. **Visual Hierarchy** - What draws attention first? How is emphasis created?
3. **Animation Clues** - What suggests motion? Parallax? Hover effects? Reveals?
4. **Signature Effects** - Unique techniques? Ghost text? Spotlights? Gradients?
5. **Whitespace Usage** - Dense or spacious? Editorial?
6. **Overall Vibe** - What emotion does this evoke?

DO NOT describe specific colors or font names - I have those already from CSS extraction.

Return in this format:

## Layout Patterns
- [pattern 1]
- [pattern 2]

## Animation Style
- [animation 1]
- [animation 2]

## Signature Effects
- [effect 1]
- [effect 2]

## Overall Vibe
[description]`
        }
    ];

    // Add screenshot images (max 3)
    screenshots.slice(0, 3).forEach(s => {
        content.push({
            type: "image_url",
            image_url: { url: s.screenshot || '' }
        });
    });

    try {
        const response = await openai.chat.completions.create({
            model: GEMINI_MODEL,
            messages: [{ role: "user", content: content }]
        });

        console.log("   ✅ Visual pattern analysis complete.");
        return response.choices[0].message.content;
    } catch (error) {
        console.error("   ❌ Vision Analysis Failed:", error instanceof Error ? error.message : error);
        return null;
    }
}

// ============================================================================
// STEP 5: SYNTHESIZE MOODBOARD OBJECT
// ============================================================================

function synthesizeMoodboardObject(sources: ExtractedData[], analysis: string | null, vibe: string): Moodboard {
    console.log(`   📝 Synthesizing final moodboard...`);

    // Collect all branding data from sources
    const colors = collectColors(sources);
    const typography = collectTypography(sources);
    const spacing = collectSpacing(sources);
    const animations = collectAnimations(sources);
    const components = collectComponents(sources);
    const personality = collectPersonality(sources);

    // Log what we collected
    console.log(`   📊 Collected: ${Object.keys(colors).length} colors, ${typography.heading ? 'custom fonts' : 'default fonts'}`);
    console.log(`   📊 Extras: ${Object.keys(spacing).length} spacing tokens, ${animations.length} animations, ${components.length} components`);

    // Build the moodboard with real data
    const moodboard: Moodboard = {
        visual_direction: analysis || `Clean, modern design inspired by ${vibe}`,
        color_palette: {
            primary: colors.primary || "#000000",
            secondary: colors.secondary || "#ffffff",
            accent: colors.accent || "#3b82f6",
            background: colors.background || "#ffffff",
            surface: colors.surface || "#f3f4f6",
            text: colors.text || "#111827"
        },
        typography: {
            heading_font: typography.heading || "Inter",
            body_font: typography.body || "Inter",
            mono_font: "JetBrains Mono",
            font_sizes: typography.fontSizes,
            font_weights: typography.fontWeights
        },
        ui_patterns: {
            card_style: "clean borders",
            button_style: "rounded-md",
            layout_structure: "open grid"
        },
        motion: {
            profile: 'STUDIO', // Default, Spec Agent will refine based on vibe
            description: "Smooth, elegant transitions"
        }
    };

    // Add optional extended data if collected
    if (Object.keys(spacing).length > 0) {
        moodboard.spacing = spacing;
    }
    if (animations.length > 0) {
        moodboard.animations = animations;
    }
    if (components.length > 0) {
        moodboard.components = components;
    }
    if (personality) {
        moodboard.personality = personality;
    }

    return moodboard;
}

// ============================================================================
// COLLECTION HELPERS
// ============================================================================

/**
 * Collect colors from branding sources
 */
function collectColors(sources: ExtractedData[]): Record<string, string> {
    const result: Record<string, string> = {};
    const seen = new Set<string>();

    for (const source of sources) {
        if (!source.branding?.colors) continue;

        const colors = source.branding.colors;
        for (const [name, value] of Object.entries(colors)) {
            if (value && !seen.has(name)) {
                seen.add(name);
                result[name] = value;
            }
        }
    }

    return result;
}

/**
 * Collect typography from branding sources
 */
function collectTypography(sources: ExtractedData[]): { heading?: string; body?: string; fontSizes?: Record<string, string>; fontWeights?: number[] } {
    for (const source of sources) {
        if (!source.branding?.typography) continue;

        const typo = source.branding.typography;
        if (typo.headingFont || typo.bodyFont || typo.fontFamilies?.primary) {
            return {
                heading: typo.headingFont || typo.fontFamilies?.heading || typo.fontFamilies?.primary,
                body: typo.bodyFont || typo.fontFamilies?.primary,
                fontSizes: typo.fontSizes,
                fontWeights: typo.fontWeights ? Object.values(typo.fontWeights) : undefined
            };
        }
    }

    return {};
}

/**
 * Collect spacing tokens from branding sources
 */
function collectSpacing(sources: ExtractedData[]): Record<string, string> {
    const result: Record<string, string> = {};
    const seen = new Set<string>();

    for (const source of sources) {
        if (!source.branding?.spacing) continue;

        for (const [name, value] of Object.entries(source.branding.spacing)) {
            if (value && !seen.has(name)) {
                seen.add(name);
                result[name] = value;
            }
        }
    }

    return result;
}

/**
 * Collect animations from branding sources (CSS transitions/keyframes)
 */
function collectAnimations(sources: ExtractedData[]): { name: string; value: string }[] {
    const result: { name: string; value: string }[] = [];
    const seen = new Set<string>();

    for (const source of sources) {
        if (!source.branding?.animations) continue;

        for (const [name, value] of Object.entries(source.branding.animations)) {
            if (value && !seen.has(name)) {
                seen.add(name);
                const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
                result.push({ name, value: displayValue });
            }
        }
    }

    return result;
}

/**
 * Collect component styles (buttons, inputs) from branding sources
 */
function collectComponents(sources: ExtractedData[]): { name: string; styles: Record<string, string> }[] {
    const result: { name: string; styles: Record<string, string> }[] = [];

    for (const source of sources) {
        if (!source.branding?.components) continue;

        const comp = source.branding.components;

        if (comp.buttonPrimary && result.length === 0) {
            result.push({ name: 'Primary Button', styles: comp.buttonPrimary });
        }
        if (comp.buttonSecondary) {
            result.push({ name: 'Secondary Button', styles: comp.buttonSecondary });
        }
        if (comp.input) {
            result.push({ name: 'Input Field', styles: comp.input });
        }
    }

    return result.slice(0, 3);
}

/**
 * Collect brand personality from branding sources
 */
function collectPersonality(sources: ExtractedData[]): { tone?: string; energy?: string; targetAudience?: string; description?: string } | null {
    for (const source of sources) {
        if (!source.branding?.personality) continue;

        const p = source.branding.personality;
        if (p.tone || p.energy || p.description) {
            return p;
        }
    }

    return null;
}

// ============================================================================
// FALLBACK MOODBOARD
// ============================================================================

function createFallbackMoodboard(vibe: string, reason: string): Moodboard {
    console.warn(`   ⚠️ Using fallback moodboard: ${reason}`);

    return {
        visual_direction: `Clean, modern design inspired by: ${vibe}. 

## Layout Patterns
- Full-width hero section with centered content
- Card-based project grid with generous whitespace
- Sticky navigation with smooth scroll behavior

## Animation Style
- Fade-in on scroll (staggered)
- Subtle hover transforms (scale 1.02)
- Smooth page transitions

## Signature Effects
- Gradient overlays on hero
- Subtle drop shadows on cards
- Glass morphism accents

## Overall Vibe
${vibe}

*Note: This is a fallback moodboard. Reason: ${reason}*`,
        color_palette: {
            primary: "#0a0a0a",
            secondary: "#1a1a1a",
            accent: "#6366f1",
            background: "#ffffff",
            surface: "#f5f5f5",
            text: "#171717"
        },
        typography: {
            heading_font: "Inter",
            body_font: "Inter",
            mono_font: "JetBrains Mono"
        },
        ui_patterns: {
            card_style: "clean borders with subtle shadow",
            button_style: "rounded-md with hover scale",
            layout_structure: "open grid with generous padding"
        },
        motion: {
            profile: 'STUDIO',
            description: "Smooth, elegant transitions with spring physics"
        }
    };
}
