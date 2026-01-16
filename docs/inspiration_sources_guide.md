# Inspiration Sources Guide

> A comprehensive guide on how to scrape design inspiration from 5 premium platforms without relying on Tavily search.

## Overview

Instead of using Tavily to search for portfolio sites (which yields ~80% irrelevant results), we directly scrape curated design platforms using their URL filtering systems. This gives us:

- **~95%+ relevant results** (pre-filtered by the platforms)
- **No Tavily API cost**
- **Full control** over style/theme targeting
- **Consistent quality** from curated sources

---

## Platform Quick Reference

| Platform | Type | Has Filters | Links To |
|----------|------|-------------|----------|
| **Framer** | Template marketplace | ✅ Styles | Template preview (`.framer.website`) |
| **Webflow** | Template marketplace | ✅ Styles | Template preview (`.webflow.io`) |
| **Awwwards** | Gallery of real sites | ✅ Color palette | Real portfolio websites |
| **Godly** | Gallery of real sites | ✅ Types + Styles | Real portfolio websites |
| **Lapa Ninja** | Gallery of real sites | ❌ Category only | Real portfolio websites |

---

## 1. Framer

### Base URL
```
https://www.framer.com/marketplace/templates/category/portfolio/
```

### URL Parameters

| Parameter | Format | Example |
|-----------|--------|---------|
| `style` | Comma-separated, URL encoded | `?style=dark%2Cgradient` |
| `page` | Integer | `&page=1` |

### Available Styles
```
3d, animated, black-and-white, colorful, dark, gradient, grid, 
illustrative, large-type, light, minimal, modern, monochromatic, 
pastel, professional, retro, typographic
```

### Example Filtered URLs
```
# Dark + Gradient portfolios
https://www.framer.com/marketplace/templates/category/portfolio/?style=dark%2Cgradient

# Minimal + Modern portfolios
https://www.framer.com/marketplace/templates/category/portfolio/?style=minimal%2Cmodern
```

### Preview URL Pattern
```
https://[template-slug].framer.website/
```

### Scraping Flow
1. Build filtered list URL with desired styles
2. Scrape list page with Firecrawl
3. Extract template card links (e.g., `/marketplace/templates/example-template`)
4. Navigate to template detail page
5. Find "Preview" button link → `[slug].framer.website`
6. Scrape preview site for branding/screenshot

### HTML Selectors (approximate)
```css
/* Template cards on list page */
a[href*="/marketplace/templates/"]

/* Preview button on detail page */
a[href*=".framer.website"]
```

---

## 2. Webflow

### Base URL
```
https://webflow.com/templates/category/portfolio-and-agency-websites
```

### URL Parameters

| Parameter | Format | Example |
|-----------|--------|---------|
| `styles` | Comma-separated, URL encoded | `?styles=Modern%2CDark` |

### Available Styles
```
Playful, Modern, Bold, Light, Corporate, Illustration, Dark, Retro, Minimal
```

### Example Filtered URLs
```
# Modern + Dark portfolios
https://webflow.com/templates/category/portfolio-and-agency-websites?styles=Modern%2CDark

# Minimal portfolios
https://webflow.com/templates/category/portfolio-and-agency-websites?styles=Minimal
```

### Preview URL Pattern
```
https://[template-slug].webflow.io
```

### Template Detail URL Pattern
```
https://webflow.com/templates/html/[template-name]-website-template
```

### Scraping Flow
1. Build filtered list URL with desired styles
2. Scrape list page with Firecrawl
3. Extract template card links
4. Navigate to template detail page
5. Find "Preview in browser" button → `[slug].webflow.io`
6. Scrape preview site for branding/screenshot

### HTML Selectors (approximate)
```css
/* Template cards on list page */
a[href*="/templates/html/"]

/* Preview button on detail page */
a[href*=".webflow.io"]
```

---

## 3. Awwwards

### Base URL
```
https://www.awwwards.com/websites/
```

### URL Parameters

| Parameter | Format | Example |
|-----------|--------|---------|
| `tag` | String | `?tag=portfolio` |
| `palette` | Hex color, URL encoded | `&palette=%23404040` |

### Available Color Palettes
```javascript
const AWWWARDS_PALETTES = {
    // Darks (best for dark theme portfolios)
    darkGray:    '#404040',
    gray:        '#7A7A7A',
    
    // Blues
    darkBlue:    '#1981C8',
    blue:        '#49ABE8',
    lightBlue:   '#8FCAF0',
    
    // Purples
    darkPurple:  '#7B19C8',
    purple:      '#9743D9',
    lightPurple: '#BE83ED',
    
    // Reds
    darkRed:     '#B42625',
    red:         '#DA4F48',
    lightRed:    '#E88D88',
    
    // Greens
    olive:       '#819526',
    lime:        '#B3CF3C',
    lightGreen:  '#CDDE7E',
    
    // Neutrals
    lightGray:   '#C4C4C4',
    veryLight:   '#E4E3E3',
    almostWhite: '#F3F2F2',
    white:       '#FFFFFF',
    
    // Accents
    orange:      '#F57327',
    yellow:      '#FABC0F',
    pink:        '#F0CED1',
    magenta:     '#9D33A1',
};
```

### Example Filtered URLs
```
# Dark gray portfolios
https://www.awwwards.com/websites/?tag=portfolio&palette=%23404040

# Blue-themed portfolios
https://www.awwwards.com/websites/?tag=portfolio&palette=%231981C8
```

### Links To
**Real portfolio websites** (not templates). The arrow icon (↗) on each card links directly to the actual portfolio site.

### Scraping Flow
1. Build filtered URL with `tag=portfolio` and desired palette
2. Scrape list page with Firecrawl
3. Extract external website URLs from card arrow icons
4. Scrape external sites for branding/screenshot

### HTML Selectors (approximate)
```css
/* Card links to external sites */
a[href^="http"][target="_blank"]  /* External links */

/* Or look for the arrow icon button */
.js-visit-site, [data-external-url]
```

---

## 4. Godly

### Base URL
```
https://godly.website/
```

### URL Parameters

| Parameter | Format | Example |
|-----------|--------|---------|
| `types` | JSON array, URL encoded | `?types=%5B"personal"%2C"portfolio"%5D` |
| `styles` | JSON array, URL encoded | `&styles=%5B"dark"%5D` |

### URL Encoding Reference
```
[ = %5B
] = %5D
" = %22 (or can use unencoded in some cases)
, = %2C
```

### Available Types
```
personal, portfolio, design, agency, e-commerce, startup, 
development, fashion, mobile-app, web-app
```

### Available Styles (30 total)
```
dark, minimal, interactive, large-type, animation, single-page,
unusual-layout, typographic, fun, long-scrolling, big-background-video,
black-white, clean, colourful, gradient, illustrative, grid,
small-type, bento-grid, infinite-scroll, monochromatic, horizontal-layout,
big-background-image, light, pastel, retro, brutalist, drag-drop,
horizontal-scrolling, masonry
```

### Example Filtered URLs
```
# Personal + Portfolio, Dark style
https://godly.website/?types=%5B%22personal%22%2C%22portfolio%22%5D&styles=%5B%22dark%22%5D

# Portfolio, Minimal + Animation
https://godly.website/?types=%5B%22portfolio%22%5D&styles=%5B%22minimal%22%2C%22animation%22%5D
```

### Links To
**Real portfolio websites**. The **+** icon on each card links directly to the original site with `?ref=godly` appended.

### Scraping Flow
1. Build filtered URL with types and styles
2. Scrape list page with Firecrawl
3. Extract external URLs from + icon links
4. Scrape external sites for branding/screenshot

### HTML Selectors (approximate)
```css
/* Plus icon links to external sites */
a[href*="?ref=godly"]

/* Or card wrapper links */
[data-external-url], a[target="_blank"]
```

---

## 5. Lapa Ninja

### Base URL
```
https://www.lapa.ninja/category/portfolio/
```

### URL Parameters
**None** — Lapa Ninja doesn't have style filters, only category-based navigation.

### Available Categories
```
All, SaaS, Business, Agency, Portfolio, Studio, ECommerce, 
Creative, Minimal, Technology, Illustration, Corporate, 
Productivity, App
```

### Category URL Pattern
```
https://www.lapa.ninja/category/[category-name]/
```

### Example URLs
```
# Portfolio category
https://www.lapa.ninja/category/portfolio/

# Minimal category (alternative)
https://www.lapa.ninja/category/minimal/
```

### Links To
**Real portfolio websites**. The link icon (↗) on each card links directly to the actual site.

### Scraping Flow
1. Use fixed portfolio category URL
2. Scrape list page with Firecrawl
3. Extract external URLs from link icons
4. Scrape external sites for branding/screenshot

### HTML Selectors (approximate)
```css
/* Card links to external sites */
a[href^="http"][target="_blank"]
a.external-link
```

---

## Implementation Strategy

### 1. Vibe-to-Filter Mapping

Map common vibe keywords to platform-specific filters:

```typescript
const VIBE_MAPPINGS = {
    dark: {
        framer: ['dark'],
        webflow: ['Dark'],
        awwwards: ['#404040', '#7A7A7A'],
        godly: ['dark'],
        lapa: null, // No filter, but include for variety
    },
    minimal: {
        framer: ['minimal'],
        webflow: ['Minimal'],
        awwwards: null, // No minimal filter
        godly: ['minimal', 'clean'],
        lapa: null,
    },
    modern: {
        framer: ['modern'],
        webflow: ['Modern'],
        awwwards: null,
        godly: ['interactive', 'animation'],
        lapa: null,
    },
    gradient: {
        framer: ['gradient'],
        webflow: null,
        awwwards: null,
        godly: ['gradient'],
        lapa: null,
    },
    typographic: {
        framer: ['typographic', 'large-type'],
        webflow: ['Bold'],
        awwwards: null,
        godly: ['typographic', 'large-type'],
        lapa: null,
    },
};
```

### 2. URL Builder Function

```typescript
function buildPlatformUrl(platform: string, vibeKeywords: string[]): string {
    switch (platform) {
        case 'framer': {
            const styles = vibeKeywords
                .flatMap(v => VIBE_MAPPINGS[v]?.framer || [])
                .join(',');
            return `https://www.framer.com/marketplace/templates/category/portfolio/${styles ? `?style=${encodeURIComponent(styles)}` : ''}`;
        }
        
        case 'webflow': {
            const styles = vibeKeywords
                .flatMap(v => VIBE_MAPPINGS[v]?.webflow || [])
                .join(',');
            return `https://webflow.com/templates/category/portfolio-and-agency-websites${styles ? `?styles=${encodeURIComponent(styles)}` : ''}`;
        }
        
        case 'awwwards': {
            const palette = vibeKeywords
                .flatMap(v => VIBE_MAPPINGS[v]?.awwwards || [])
                [0] || '#404040';
            return `https://www.awwwards.com/websites/?tag=portfolio&palette=${encodeURIComponent(palette)}`;
        }
        
        case 'godly': {
            const styles = vibeKeywords
                .flatMap(v => VIBE_MAPPINGS[v]?.godly || []);
            const typesParam = encodeURIComponent(JSON.stringify(['personal', 'portfolio']));
            const stylesParam = styles.length 
                ? `&styles=${encodeURIComponent(JSON.stringify(styles))}`
                : '';
            return `https://godly.website/?types=${typesParam}${stylesParam}`;
        }
        
        case 'lapa':
        default:
            return 'https://www.lapa.ninja/category/portfolio/';
    }
}
```

### 3. Platform Selection Strategy

For each generation, select 2-3 platforms to balance variety and quality:

```typescript
function selectPlatforms(vibeKeywords: string[]): string[] {
    const hasDark = vibeKeywords.includes('dark');
    const hasMinimal = vibeKeywords.includes('minimal');
    
    // Always include at least one template platform (higher quality CSS)
    const templatePlatform = Math.random() > 0.5 ? 'framer' : 'webflow';
    
    // Include 1-2 gallery platforms (real sites)
    const galleryPlatforms = ['awwwards', 'godly', 'lapa']
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);
    
    return [templatePlatform, ...galleryPlatforms.slice(0, 1)];
}
```

### 4. Scrape Result Extraction

For each platform, extract the target URLs from the list page:

```typescript
interface ScrapedCard {
    name: string;
    thumbnailUrl?: string;
    targetUrl: string;  // The URL to scrape for branding
}

async function extractCardsFromListPage(
    platform: string, 
    listPageHtml: string
): Promise<ScrapedCard[]> {
    // Platform-specific extraction logic
    // Return array of cards with target URLs
}
```

---

## Firecrawl Integration

### Step 1: Scrape List Page
```typescript
const listResult = await firecrawl.scrapeUrl(platformListUrl, {
    formats: ['html'],
    waitFor: 2000,  // Wait for JS rendering
});
```

### Step 2: Extract Target URLs
```typescript
const cards = extractCardsFromListPage(platform, listResult.html);
const targetUrls = cards.map(c => c.targetUrl);
```

### Step 3: Scrape Target Sites (parallel, with rate limiting)
```typescript
const brandingResults = await Promise.all(
    targetUrls.slice(0, 3).map((url, i) => 
        new Promise(resolve => setTimeout(resolve, i * 500))
            .then(() => firecrawl.scrapeUrl(url, {
                formats: ['branding', 'screenshot'],
            }))
    )
);
```

---

## Summary

This approach replaces Tavily search with direct, targeted scraping of curated design platforms. By constructing filtered URLs based on the user's vibe keywords, we ensure that every scraped result is relevant and high-quality.

### Key Benefits
1. **Accuracy**: ~95%+ relevant results vs ~20% with Tavily
2. **Cost**: Eliminates Tavily API costs
3. **Speed**: One less API hop
4. **Control**: Full targeting via URL parameters
5. **Quality**: Curated sources only

### Platforms by Use Case
- **For template CSS/design systems**: Framer, Webflow
- **For real portfolio inspiration**: Awwwards, Godly, Lapa Ninja
- **For dark themes**: All except Lapa (no filter)
- **For variety**: Always include Lapa Ninja
