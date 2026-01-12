/**
 * Brief Parser Helpers
 * 
 * Ported from legacy brief_parser.js
 * Provides helper functions for profile images, project images, and social link repair
 */

import { Brief } from '../types';

/**
 * Get profile image URL using Unavatar (Twitter) or UI Avatars fallback
 */
export function getProfileImageUrl(brief: Brief): string {
    // Try Twitter handle from socials
    const twitterHandle = brief.socials?.twitter || brief.socials?.x;

    if (twitterHandle) {
        // Clean the handle (remove @ if present, extract from URL)
        const cleanHandle = extractTwitterHandle(twitterHandle);
        if (cleanHandle) {
            return `https://unavatar.io/twitter/${cleanHandle}`;
        }
    }

    // Fallback to UI Avatars with name
    const name = brief.personal?.name || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=256`;
}

/**
 * Get project image URL using Unavatar (Twitter) or gradient placeholder
 */
export function getProjectImageUrl(project: { title: string; link?: string }): string {
    // If link looks like a Twitter handle, use Unavatar
    if (project.link) {
        const handle = extractTwitterHandle(project.link);
        if (handle) {
            return `https://unavatar.io/twitter/${handle}`;
        }
    }

    // Fallback to UI Avatars with project name
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(project.title)}&background=8b5cf6&color=fff&size=256`;
}

/**
 * Get full social links with URL repair (filters out null values)
 */
export function getSocialLinks(brief: Brief): Record<string, string> {
    const socials = brief.socials || {};

    const result: Record<string, string> = {};

    const email = socials.email || brief.personal?.email;
    const twitter = repairSocialUrl(socials.twitter || socials.x, 'twitter');
    const linkedin = repairSocialUrl(socials.linkedin, 'linkedin');
    const github = repairSocialUrl(socials.github, 'github');
    const discord = socials.discord;
    const website = socials.website;

    // Only include non-null values
    if (email) result.email = email;
    if (twitter) result.twitter = twitter;
    if (linkedin) result.linkedin = linkedin;
    if (github) result.github = github;
    if (discord) result.discord = discord;
    if (website) result.website = website;

    return result;
}

/**
 * Repair social URL - converts handles to full URLs
 */
function repairSocialUrl(value: string | undefined, type: 'twitter' | 'linkedin' | 'github'): string | null {
    if (!value) return null;

    // Already a URL
    if (value.startsWith('http')) {
        return value;
    }

    // Clean the value
    const cleaned = value.replace(/^@/, '').trim();
    if (!cleaned) return null;

    // Build full URL based on type
    switch (type) {
        case 'twitter':
            return `https://x.com/${cleaned}`;
        case 'linkedin':
            return `https://linkedin.com/in/${cleaned}`;
        case 'github':
            return `https://github.com/${cleaned}`;
        default:
            return value;
    }
}

/**
 * Extract Twitter handle from URL or @mention
 */
function extractTwitterHandle(value: string): string | null {
    if (!value) return null;

    // Handle @mention format
    if (value.startsWith('@')) {
        return value.slice(1);
    }

    // Handle URL format (x.com or twitter.com)
    const urlMatch = value.match(/(?:x\.com|twitter\.com)\/([a-zA-Z0-9_]+)/);
    if (urlMatch) {
        return urlMatch[1];
    }

    // If it's just a plain handle without @ or URL
    if (/^[a-zA-Z0-9_]+$/.test(value)) {
        return value;
    }

    return null;
}

/**
 * Format projects with image URLs
 */
export function formatProjectsWithImages(brief: Brief): Array<{
    name: string;
    role: string;
    impact: string;
    imageUrl: string;
    link?: string;
}> {
    return (brief.work || []).map(project => ({
        name: project.title,
        role: project.role,
        impact: project.impact || project.description,
        imageUrl: getProjectImageUrl(project),
        link: project.link
    }));
}
