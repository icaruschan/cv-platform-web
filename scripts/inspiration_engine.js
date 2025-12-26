require('dotenv').config();
const axios = require('axios');
const Firecrawl = require('@mendable/firecrawl-js').default;
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// --- Configuration ---
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "google/gemini-2.5-flash-preview-05-20";

// Initialize Clients
const firecrawl = new Firecrawl({ apiKey: FIRECRAWL_API_KEY });
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: OPENROUTER_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": "https://antigravity.ai",
        "X-Title": "Antigravity CV Generator",
    }
});

// --- Platform Configuration ---
// 8 platforms with type classification
const PLATFORMS = [
    // Gallery sites - need URL resolution to get real site
    { name: 'Awwwards', site: 'awwwards.com', type: 'gallery' },
    { name: 'SiteInspire', site: 'siteinspire.com', type: 'gallery' },
    { name: 'Lapa Ninja', site: 'lapa.ninja', type: 'gallery' },
    { name: 'Landingfolio', site: 'landingfolio.com', type: 'gallery' },

    // Template sites - need to extract preview URL
    // Framer: framer.com/templates/{name}/ → {name}.framer.website
    // Webflow: webflow.com/templates/{name} → needs link extraction
    { name: 'Framer', site: 'framer.com/templates', type: 'template' },
    { name: 'Webflow', site: 'webflow.com/templates', type: 'template' },

    // Visual only - no live site, just screenshot for ideas
    { name: 'Dribbble', site: 'dribbble.com', type: 'visual_only' },
    { name: 'Behance', site: 'behance.net', type: 'visual_only' },
];

/**
 * Step 1: Search for Inspiration
 * Queries each platform for the vibe, returns URLs with platform metadata.
 */
async function searchDesignInspiration(vibe) {
    console.log(`🔍 Searching for: "${vibe}" across ${PLATFORMS.length} platforms...`);

    const sources = [];

    for (const platform of PLATFORMS) {
        const query = `${vibe} website design site:${platform.site}`;

        try {
            const response = await axios.post("https://api.tavily.com/search", {
                api_key: TAVILY_API_KEY,
                query: query,
                search_depth: "basic",
                include_images: false,
                max_results: 1
            });

            if (response.data.results && response.data.results.length > 0) {
                sources.push({
                    platform: platform.name,
                    url: response.data.results[0].url,
                    type: platform.type
                });
                console.log(`   ✅ ${platform.name}: Found`);
            } else {
                console.log(`   ⚠️ ${platform.name}: No results`);
            }
        } catch (error) {
            console.warn(`   ⚠️ ${platform.name}: Search failed -`, error.message);
        }
    }

    console.log(`✅ Found ${sources.length} inspiration sources.`);
    return sources;
}

/**
 * Step 2: Resolve Gallery URLs to Real Site URLs
 * For gallery sites (Awwwards, SiteInspire, etc.), extracts the actual website URL.
 */
async function resolveGalleryUrls(sources) {
    console.log(`🔗 Resolving gallery URLs to real sites...`);

    const resolved = [];

    for (const source of sources) {
        try {
            if (source.type === 'visual_only') {
                // Visual only - keep for screenshots, can't extract branding
                resolved.push({ ...source, resolvedUrl: source.url, canBrand: false });
                console.log(`   📷 ${source.platform}: Visual only`);
            }
            else if (source.type === 'template') {
                // Template sites (Framer, Webflow) - extract preview URL
                console.log(`   🔍 ${source.platform}: Resolving template preview...`);

                const previewUrl = await resolveTemplateUrl(source.url, source.platform);

                if (previewUrl) {
                    resolved.push({ ...source, resolvedUrl: previewUrl, canBrand: true });
                    console.log(`   ✅ ${source.platform}: Resolved to ${previewUrl}`);
                } else {
                    resolved.push({ ...source, resolvedUrl: source.url, canBrand: false });
                    console.log(`   ⚠️ ${source.platform}: Could not resolve preview`);
                }
            }
            else if (source.type === 'gallery') {
                // Gallery sites - need to extract real URL
                console.log(`   🔍 ${source.platform}: Resolving...`);

                const page = await firecrawl.scrape(source.url, {
                    formats: ['links']
                });

                // Find external link (the actual site being featured)
                const externalUrl = findExternalLink(page.links, source.platform);

                if (externalUrl) {
                    resolved.push({ ...source, resolvedUrl: externalUrl, canBrand: true });
                    console.log(`   ✅ ${source.platform}: Resolved to ${externalUrl}`);
                } else {
                    // Fallback to original URL if resolution fails
                    resolved.push({ ...source, resolvedUrl: source.url, canBrand: false });
                    console.log(`   ⚠️ ${source.platform}: Could not resolve, using gallery page`);
                }
            }
        } catch (error) {
            console.warn(`   ⚠️ ${source.platform}: Resolution failed -`, error.message);
            resolved.push({ ...source, resolvedUrl: source.url, canBrand: false });
        }
    }

    return resolved;
}

/**
 * Helper: Resolve Framer/Webflow template URLs to preview sites
 */
async function resolveTemplateUrl(url, platform) {
    try {
        if (platform === 'Framer') {
            // Framer pattern: framer.com/templates/{name}/ → {name}.framer.website
            // Example: framer.com/templates/evanston/ → evanston.framer.website
            const match = url.match(/framer\.com\/(?:marketplace\/)?templates\/([a-zA-Z0-9-]+)/i);
            if (match) {
                const templateName = match[1].toLowerCase();
                return `https://${templateName}.framer.website`;
            }

            // Fallback: scrape for preview link
            const page = await firecrawl.scrape(url, { formats: ['links'] });
            const previewLink = page.links?.find(link => link.includes('.framer.website'));
            return previewLink || null;
        }

        if (platform === 'Webflow') {
            // Webflow: Need to scrape for preview link
            const page = await firecrawl.scrape(url, { formats: ['links'] });
            const previewLink = page.links?.find(link =>
                link.includes('.webflow.io') ||
                link.includes('preview--')
            );
            return previewLink || null;
        }

        return null;
    } catch (error) {
        console.warn(`   ⚠️ Template URL resolution failed:`, error.message);
        return null;
    }
}

/**
 * Helper: Find external link from gallery page
 */
function findExternalLink(links, platform) {
    if (!links || !Array.isArray(links)) return null;

    // Filter out internal links and common non-site URLs
    const internalDomains = [
        'awwwards.com', 'siteinspire.com', 'lapa.ninja', 'landingfolio.com',
        'facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com',
        'youtube.com', 'google.com', 'pinterest.com'
    ];

    const externalLinks = links.filter(link => {
        if (!link || !link.startsWith('http')) return false;
        return !internalDomains.some(domain => link.includes(domain));
    });

    // Return first valid external link
    return externalLinks[0] || null;
}

/**
 * Step 3: Extract Hybrid Data (Branding + Screenshots)
 * For each resolved source, get both exact branding AND visual screenshot.
 */
async function extractHybridData(sources) {
    console.log(`\n📊 Extracting hybrid data (branding + screenshots)...`);

    const results = [];
    const maxSources = 5; // Limit to control API usage

    for (const source of sources.slice(0, maxSources)) {
        const data = {
            platform: source.platform,
            url: source.resolvedUrl,
            type: source.type,
            branding: null,
            screenshot: null
        };

        try {
            // Always try to get screenshot
            console.log(`   📸 ${source.platform}: Capturing screenshot...`);
            const screenshotResult = await firecrawl.scrape(source.resolvedUrl, {
                formats: ['screenshot']
            });
            data.screenshot = screenshotResult.screenshot || null;

            // Get branding only for sites that support it
            if (source.canBrand) {
                console.log(`   🎨 ${source.platform}: Extracting branding...`);
                try {
                    // Framer sites need extra wait time for hydration
                    const scrapeOptions = { formats: ['branding'] };
                    if (source.platform === 'Framer') {
                        scrapeOptions.waitFor = 3000; // Wait 3s for Framer hydration
                        console.log(`   ⏳ ${source.platform}: Waiting for hydration (3s)...`);
                    }

                    const brandingResult = await firecrawl.scrape(source.resolvedUrl, scrapeOptions);
                    data.branding = brandingResult.branding || null;

                    if (data.branding) {
                        console.log(`   ✅ ${source.platform}: Branding extracted`);
                    }
                } catch (brandError) {
                    console.warn(`   ⚠️ ${source.platform}: Branding extraction failed`);
                }
            }

            results.push(data);
        } catch (error) {
            console.warn(`   ⚠️ ${source.platform}: Data extraction failed -`, error.message);
        }
    }

    console.log(`✅ Extracted data from ${results.length} sources.`);
    return results;
}

/**
 * Step 4: Analyze Visual Patterns (Vision API)
 * Focuses on layout, animation, and effects - NOT colors/fonts (we have those from branding).
 */
async function analyzeVisualPatterns(sources, vibe) {
    console.log(`\n🧠 Analyzing visual patterns with Gemini Vision...`);

    const screenshots = sources.filter(s => s.screenshot);
    if (screenshots.length === 0) {
        console.warn('⚠️ No screenshots available for vision analysis.');
        return null;
    }

    const content = [
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
            [description]
            `
        }
    ];

    // Add screenshot images
    screenshots.slice(0, 3).forEach(s => {
        content.push({
            type: "image_url",
            image_url: { url: s.screenshot }
        });
    });

    try {
        const response = await openai.chat.completions.create({
            model: GEMINI_MODEL,
            messages: [{ role: "user", content: content }]
        });

        console.log("✅ Visual pattern analysis complete.");
        return response.choices[0].message.content;
    } catch (error) {
        console.error("❌ Vision Analysis Failed:", error.message);
        return null;
    }
}

/**
 * Step 5: Synthesize Final Moodboard
 * Combines EXACT branding data (full profile) + CREATIVE visual pattern analysis.
 */
function synthesizeMoodboard(sources, visualAnalysis, vibe) {
    console.log(`\n📝 Synthesizing final moodboard...`);

    // Collect branding data from all sources that have it
    const brandingSources = sources.filter(s => s.branding);

    // Build the moodboard markdown
    let moodboard = `# Design Moodboard: ${vibe}\n\n`;
    moodboard += `*Generated from ${sources.length} sources using Firecrawl branding extraction + Gemini Vision analysis.*\n\n`;

    // === SECTION 1: Color Scheme & Palette ===
    moodboard += `## 1. Color Palette\n`;
    const colorScheme = brandingSources.find(s => s.branding?.colorScheme)?.branding?.colorScheme;
    if (colorScheme) {
        moodboard += `**Color Scheme:** ${colorScheme}\n\n`;
    }

    const colors = collectColors(brandingSources);
    if (colors.length > 0) {
        moodboard += `| Token | Value | Source |\n`;
        moodboard += `|-------|-------|--------|\n`;
        colors.forEach(c => {
            moodboard += `| ${c.name} | \`${c.value}\` | ${c.source} |\n`;
        });
    } else {
        moodboard += `*No branding data extracted*\n`;
    }
    moodboard += `\n`;

    // === SECTION 2: Typography ===
    moodboard += `## 2. Typography\n`;
    const typo = collectTypography(brandingSources);
    if (typo.fontFamilies.length > 0) {
        moodboard += `### Font Families\n`;
        typo.fontFamilies.forEach(f => {
            moodboard += `- **${f.type}:** ${f.family} (${f.source})\n`;
        });
        moodboard += `\n`;
    }
    if (typo.fontSizes.length > 0) {
        moodboard += `### Font Sizes\n`;
        typo.fontSizes.forEach(s => {
            moodboard += `- ${s.name}: \`${s.value}\`\n`;
        });
        moodboard += `\n`;
    }
    if (typo.fontWeights.length > 0) {
        moodboard += `### Font Weights\n`;
        moodboard += typo.fontWeights.map(w => `\`${w}\``).join(', ') + `\n\n`;
    }

    // === SECTION 3: Spacing & Layout (only if data exists) ===
    const spacing = collectSpacing(brandingSources);
    if (spacing.length > 0) {
        moodboard += `## 3. Spacing & Layout\n`;
        moodboard += `| Property | Value | Source |\n`;
        moodboard += `|----------|-------|--------|\n`;
        spacing.forEach(s => {
            moodboard += `| ${s.name} | \`${s.value}\` | ${s.source} |\n`;
        });
        moodboard += `\n`;
    }

    // === SECTION 4: Animations (only if data exists) ===
    const animations = collectAnimations(brandingSources);
    if (animations.length > 0) {
        moodboard += `## 4. Animations & Transitions\n`;
        moodboard += `*Extracted from live CSS*\n\n`;
        animations.forEach(a => {
            moodboard += `- **${a.name}:** ${a.value} (${a.source})\n`;
        });
        moodboard += `\n`;
    }

    // === SECTION 5: Components (only if data exists) ===
    const components = collectComponents(brandingSources);
    if (components.length > 0) {
        moodboard += `## 5. Component Styles\n`;
        components.forEach(c => {
            moodboard += `### ${c.name}\n`;
            Object.entries(c.styles).forEach(([prop, val]) => {
                moodboard += `- ${prop}: \`${val}\`\n`;
            });
            moodboard += `\n`;
        });
    }

    // === SECTION 6: Brand Personality (only if data exists) ===
    const personality = collectPersonality(brandingSources);
    if (personality) {
        moodboard += `## 6. Brand Personality\n`;
        if (personality.tone) moodboard += `- **Tone:** ${personality.tone}\n`;
        if (personality.energy) moodboard += `- **Energy:** ${personality.energy}\n`;
        if (personality.targetAudience) moodboard += `- **Target Audience:** ${personality.targetAudience}\n`;
        if (personality.description) moodboard += `\n> ${personality.description}\n`;
        moodboard += `\n`;
    }


    // === SECTION 7: Visual Patterns (From Gemini Vision - Layout Only) ===
    if (visualAnalysis) {
        moodboard += `## 7. Visual Layout Patterns\n`;
        moodboard += `*Analyzed from screenshots by Gemini Vision*\n\n`;
        moodboard += visualAnalysis;
    }

    moodboard += `\n---\n`;
    moodboard += `*Sources: ${sources.map(s => s.platform).join(', ')}*\n`;

    return moodboard;
}

/**
 * Helper: Collect colors from branding sources
 */
function collectColors(sources) {
    const colors = [];
    const seen = new Set();

    sources.forEach(source => {
        if (!source.branding?.colors) return;

        Object.entries(source.branding.colors).forEach(([name, value]) => {
            if (value && !seen.has(value)) {
                seen.add(value);
                colors.push({
                    name: name,
                    value: value,
                    source: source.platform
                });
            }
        });
    });

    return colors.slice(0, 8); // Limit to 8 colors
}

/**
 * Helper: Collect fonts from branding sources (legacy - for backward compat)
 */
function collectFonts(sources) {
    const fonts = [];
    const seen = new Set();

    sources.forEach(source => {
        if (!source.branding?.typography) return;

        const typo = source.branding.typography;

        if (typo.headingFont && !seen.has(typo.headingFont)) {
            seen.add(typo.headingFont);
            fonts.push({
                type: 'Heading',
                family: typo.headingFont,
                source: source.platform
            });
        }

        if (typo.bodyFont && !seen.has(typo.bodyFont)) {
            seen.add(typo.bodyFont);
            fonts.push({
                type: 'Body',
                family: typo.bodyFont,
                source: source.platform
            });
        }
    });

    return fonts;
}

/**
 * Helper: Collect comprehensive typography info
 */
function collectTypography(sources) {
    const result = {
        fontFamilies: [],
        fontSizes: [],
        fontWeights: [],
        lineHeights: []
    };
    const seenFamilies = new Set();

    sources.forEach(source => {
        const typo = source.branding?.typography;
        if (!typo) return;

        // Font families
        if (typo.fontFamilies) {
            if (typo.fontFamilies.primary && !seenFamilies.has(typo.fontFamilies.primary)) {
                seenFamilies.add(typo.fontFamilies.primary);
                result.fontFamilies.push({ type: 'Primary', family: typo.fontFamilies.primary, source: source.platform });
            }
            if (typo.fontFamilies.heading && !seenFamilies.has(typo.fontFamilies.heading)) {
                seenFamilies.add(typo.fontFamilies.heading);
                result.fontFamilies.push({ type: 'Heading', family: typo.fontFamilies.heading, source: source.platform });
            }
            if (typo.fontFamilies.code && !seenFamilies.has(typo.fontFamilies.code)) {
                seenFamilies.add(typo.fontFamilies.code);
                result.fontFamilies.push({ type: 'Code', family: typo.fontFamilies.code, source: source.platform });
            }
        }

        // Font sizes
        if (typo.fontSizes && result.fontSizes.length === 0) {
            Object.entries(typo.fontSizes).forEach(([name, value]) => {
                result.fontSizes.push({ name, value });
            });
        }

        // Font weights
        if (typo.fontWeights && result.fontWeights.length === 0) {
            Object.values(typo.fontWeights).forEach(weight => {
                if (weight && !result.fontWeights.includes(String(weight))) {
                    result.fontWeights.push(String(weight));
                }
            });
        }
    });

    return result;
}

/**
 * Helper: Collect spacing data
 */
function collectSpacing(sources) {
    const spacing = [];
    const seen = new Set();

    sources.forEach(source => {
        const sp = source.branding?.spacing;
        if (!sp) return;

        Object.entries(sp).forEach(([name, value]) => {
            const key = `${name}:${value}`;
            if (value && !seen.has(key)) {
                seen.add(key);
                spacing.push({ name, value, source: source.platform });
            }
        });
    });

    return spacing.slice(0, 10);
}

/**
 * Helper: Collect animations data (FROM FIRECRAWL!)
 */
function collectAnimations(sources) {
    const animations = [];
    const seen = new Set();

    sources.forEach(source => {
        const anim = source.branding?.animations;
        if (!anim) return;

        Object.entries(anim).forEach(([name, value]) => {
            const key = `${name}`;
            if (value && !seen.has(key)) {
                seen.add(key);
                const displayValue = typeof value === 'object' ? JSON.stringify(value) : value;
                animations.push({ name, value: displayValue, source: source.platform });
            }
        });
    });

    return animations;
}

/**
 * Helper: Collect component styles (buttons, inputs)
 */
function collectComponents(sources) {
    const components = [];

    sources.forEach(source => {
        const comp = source.branding?.components;
        if (!comp) return;

        if (comp.buttonPrimary && components.length === 0) {
            components.push({ name: 'Primary Button', styles: comp.buttonPrimary });
        }
        if (comp.buttonSecondary) {
            components.push({ name: 'Secondary Button', styles: comp.buttonSecondary });
        }
        if (comp.input) {
            components.push({ name: 'Input Field', styles: comp.input });
        }
    });

    return components.slice(0, 3);
}

/**
 * Helper: Collect brand personality (AI-inferred by Firecrawl!)
 */
function collectPersonality(sources) {
    for (const source of sources) {
        const personality = source.branding?.personality;
        if (personality) {
            return {
                tone: personality.tone,
                energy: personality.energy,
                targetAudience: personality.targetAudience,
                description: personality.description || null
            };
        }
    }
    return null;
}

/**
 * Main Execution Function
 */
async function runInspirationEngine(userVibe) {
    if (!userVibe) {
        console.error("❌ No Vibe provided.");
        return;
    }

    console.log(`\n🚀 Starting HYBRID Inspiration Engine for: "${userVibe}"\n`);
    console.log(`${'='.repeat(60)}\n`);

    // Step 1: Search across 8 platforms
    const sources = await searchDesignInspiration(userVibe);
    if (sources.length === 0) {
        console.error("❌ No inspiration sources found.");
        return;
    }

    // Step 2: Resolve gallery URLs to real sites
    const resolvedSources = await resolveGalleryUrls(sources);

    // Step 3: Extract hybrid data (branding + screenshots)
    const extractedData = await extractHybridData(resolvedSources);
    if (extractedData.length === 0) {
        console.error("❌ No data could be extracted.");
        return;
    }

    // Step 4: Analyze visual patterns with Gemini Vision
    const visualAnalysis = await analyzeVisualPatterns(extractedData, userVibe);

    // Step 5: Synthesize final moodboard
    const moodboard = synthesizeMoodboard(extractedData, visualAnalysis, userVibe);

    // Step 6: Save output
    const outputDir = path.join(__dirname, '../website-guidelines');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, '0.design-moodboard.md');
    fs.writeFileSync(outputPath, moodboard);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎉 Hybrid moodboard generated at: ${outputPath}`);
    console.log(`${'='.repeat(60)}\n`);

    // Summary stats
    const brandingCount = extractedData.filter(d => d.branding).length;
    const screenshotCount = extractedData.filter(d => d.screenshot).length;
    console.log(`📊 Summary:`);
    console.log(`   - Sources searched: ${sources.length}`);
    console.log(`   - URLs resolved: ${resolvedSources.length}`);
    console.log(`   - Branding extracted: ${brandingCount}`);
    console.log(`   - Screenshots captured: ${screenshotCount}`);
}

// CLI Execution
if (require.main === module) {
    const vibe = process.argv[2] || "Minimalist Dark Portfolio";
    runInspirationEngine(vibe);
}

module.exports = { runInspirationEngine };
