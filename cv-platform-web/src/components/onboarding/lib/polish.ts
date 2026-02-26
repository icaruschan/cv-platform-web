import type { Brief } from './brief-mapper';

/**
 * Send the Brief to a lightweight AI polish endpoint.
 *
 * Now that onboarding runs on the same origin as the Next.js API,
 * we use a simple relative URL — no cross-origin config needed.
 */
export async function polishBrief(brief: Brief): Promise<Brief> {
    try {
        const res = await fetch('/api/polish', {
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
