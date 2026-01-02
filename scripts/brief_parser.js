/**
 * Brief Parser - Extracts structured data from product-brief.md
 * This ensures component generators use real data, not hallucinated content.
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse the product brief markdown into structured JSON
 * @param {string} briefPath - Path to product-brief.md
 * @returns {Object} Structured brief data
 */
function parseBrief(briefPath) {
    const content = fs.readFileSync(briefPath, 'utf8');

    const data = {
        name: extractField(content, /\*\*Name:\*\*\s*(.+)/),
        title: extractField(content, /\*\*Title:\*\*\s*(.+)/),
        experience: extractField(content, /\*\*Experience:\*\*\s*(.+)/),
        tagline: extractField(content, /\*\*Tagline:\*\*\s*(.+)/),
        summary: extractSection(content, '## Professional Summary'),
        designDirection: {
            visualStyle: extractField(content, /\*\*Visual Style:\*\*\s*(.+?)(?=\n-|\n#|$)/s),
            interpretation: extractField(content, /\*\*Interpretation:\*\*\s*(.+?)(?=\n-|\n#|$)/s),
            searchVibe: extractField(content, /\*\*Search Vibe:\*\*\s*(.+)/)
        },
        socials: {
            email: extractField(content, /\*\*Email:\*\*\s*(.+)/),
            twitter: extractTwitterHandle(content),
            linkedin: extractLinkedInHandle(content),
            discord: extractDiscordHandle(content)
        },
        projects: extractProjects(content)
    };

    return data;
}

/**
 * Extract a single field using regex
 */
function extractField(content, regex) {
    const match = content.match(regex);
    return match ? match[1].trim() : null;
}

/**
 * Extract a full section until next heading
 */
function extractSection(content, heading) {
    const regex = new RegExp(`${heading}\\n([\\s\\S]*?)(?=\\n## |$)`);
    const match = content.match(regex);
    return match ? match[1].trim() : null;
}

/**
 * Extract Twitter handle from URL or @mention
 * Prioritizes the Contact Information section's X/Twitter field
 */
function extractTwitterHandle(content) {
    // FIRST: Try the specific X/Twitter field (most reliable)
    const fieldMatch = content.match(/\*\*X\/Twitter:\*\*\s*(?:\[.*?\]\()?\s*(?:https?:\/\/)?(?:x\.com|twitter\.com)\/([a-zA-Z0-9_]+)/);
    if (fieldMatch) return fieldMatch[1];

    // SECOND: Try looking within Contact Information section only
    const contactSection = content.match(/## Contact Information([\s\S]*?)(?=\n## |$)/);
    if (contactSection) {
        const contactUrlMatch = contactSection[1].match(/(?:x\.com|twitter\.com)\/([a-zA-Z0-9_]+)/);
        if (contactUrlMatch) return contactUrlMatch[1];
    }

    // FALLBACK: Generic URL match (may pick up project links, avoid if possible)
    // Don't use this fallback as it causes bugs
    return null;
}

/**
 * Extract LinkedIn handle from URL
 * Prioritizes the Contact Information section
 */
function extractLinkedInHandle(content) {
    // FIRST: Try specific LinkedIn field
    const fieldMatch = content.match(/\*\*LinkedIn:\*\*\s*(?:\[.*?\]\()?\s*(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/);
    if (fieldMatch) return fieldMatch[1];

    // SECOND: Try looking within Contact Information section only
    const contactSection = content.match(/## Contact Information([\s\S]*?)(?=\n## |$)/);
    if (contactSection) {
        const contactUrlMatch = contactSection[1].match(/linkedin\.com\/in\/([a-zA-Z0-9_-]+)/);
        if (contactUrlMatch) return contactUrlMatch[1];
    }

    // FALLBACK: Global match
    const match = content.match(/linkedin\.com\/in\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
}

/**
 * Extract Discord handle/server
 */
function extractDiscordHandle(content) {
    // Try discord.com/username format
    const urlMatch = content.match(/discord\.com\/([a-zA-Z0-9_-]+)/);
    if (urlMatch) return urlMatch[1];

    // Try Discord field with any format
    const fieldMatch = content.match(/\*\*Discord:\*\*\s*(.+)/);
    if (fieldMatch) return fieldMatch[1].trim();

    return null;
}

/**
 * Extract all projects from the Projects Portfolio section
 */
function extractProjects(content) {
    const projects = [];

    // Find the Projects Portfolio section using indexOf (more reliable than regex)
    const sectionStart = content.indexOf('## Projects Portfolio');
    if (sectionStart === -1) return projects;

    // Find where the section ends (next ## heading or end of file)
    let sectionEnd = content.indexOf('\n## ', sectionStart + 1);
    if (sectionEnd === -1) sectionEnd = content.length;

    const projectContent = content.substring(sectionStart, sectionEnd);

    // Split by ### to get individual project blocks
    const blocks = projectContent.split(/\n### /);

    // Skip the first block (it's just "## Projects Portfolio")
    for (let i = 1; i < blocks.length; i++) {
        const block = blocks[i];
        const lines = block.split('\n');
        const name = lines[0].trim();

        // Skip invalid names
        if (!name || name.length < 2) continue;

        const project = {
            name: name,
            role: extractField(block, /\*\*Role:\*\*\s*(.+)/),
            link: extractField(block, /\*\*Link:\*\*\s*(.+)/),
            impact: extractField(block, /\*\*Impact:\*\*\s*(.+)/)
        };

        // Extract Twitter handle from link (e.g., @persona_journey → persona_journey)
        if (project.link) {
            project.twitterHandle = project.link.replace(/^@/, '');
        }

        projects.push(project);
    }

    return projects;
}

/**
 * Get profile image URL using unavatar
 */
function getProfileImageUrl(briefData) {
    if (briefData.socials.twitter) {
        return `https://unavatar.io/twitter/${briefData.socials.twitter}`;
    }
    // Fallback to UI Avatars with name
    const name = briefData.name || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=256`;
}

/**
 * Get project image URL using unavatar
 */
function getProjectImageUrl(project) {
    if (project.twitterHandle) {
        return `https://unavatar.io/twitter/${project.twitterHandle}`;
    }
    // Fallback to UI Avatars with project name
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(project.name)}&background=8b5cf6&color=fff&size=256`;
}

/**
 * Get full social links
 */
function getSocialLinks(briefData) {
    const socials = briefData.socials;
    return {
        email: socials.email,
        twitter: socials.twitter ? `https://x.com/${socials.twitter}` : null,
        linkedin: socials.linkedin ? `https://linkedin.com/in/${socials.linkedin}` : null,
        discord: socials.discord ? (
            socials.discord.startsWith('http') ? socials.discord : `https://discord.com/${socials.discord}`
        ) : null
    };
}

// CLI test
if (require.main === module) {
    const briefPath = path.join(__dirname, '../website-guidelines/product-brief.md');
    if (fs.existsSync(briefPath)) {
        const data = parseBrief(briefPath);
        console.log('📋 Parsed Brief Data:');
        console.log(JSON.stringify(data, null, 2));
        console.log('\n🖼️ Profile Image:', getProfileImageUrl(data));
        console.log('🔗 Social Links:', getSocialLinks(data));
    } else {
        console.log('⚠️ No product-brief.md found. Run the pipeline first.');
    }
}

module.exports = {
    parseBrief,
    getProfileImageUrl,
    getProjectImageUrl,
    getSocialLinks
};
