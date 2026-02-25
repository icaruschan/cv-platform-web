import type { Brief } from './brief-mapper';

/**
 * AI polish endpoint URL — proxied through the main app.
 * The onboarding app calls `/api/polish` on the main app which runs Gemini Flash.
 */
const POLISH_API_URL = import.meta.env.VITE_APP_URL
    ? `${import.meta.env.VITE_APP_URL}/api/polish`
    : '/api/polish';

/**
 * Send the Brief to a lightweight AI polish endpoint.
 *
 * This single Gemini Flash call replaces the 2 heavy AI calls from the
 * n8n workflow (brief generation + brief parsing). It polishes:
 *
 *   1. Expands short bios (< 100 chars) into 2-3 professional sentences
 *   2. Fixes grammar and spelling
 *   3. Creates or polishes taglines
 *
 * If the polish call fails, returns the original Brief unchanged.
 */
export async function polishBrief(brief: Brief): Promise<Brief> {
    try {
        const res = await fetch(POLISH_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                bio: brief.personal.bio,
                vibe: brief.style.vibe,
                tagline: brief.personal.tagline,
                role: brief.personal.role,
            }),
        });

        if (!res.ok) {
            console.warn('Polish API returned', res.status, '— using original text');
            return brief;
        }

        const polished = await res.json();

        return {
            ...brief,
            personal: {
                ...brief.personal,
                bio: polished.bio || brief.personal.bio,
                tagline: polished.tagline || brief.personal.tagline,
            },
            style: {
                ...brief.style,
                vibe: polished.vibe || brief.style.vibe,
            },
        };
    } catch (err) {
        console.warn('Polish call failed, using original:', err);
        return brief;
    }
}
