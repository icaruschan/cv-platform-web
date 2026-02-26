import type { OnboardingData } from '../types';

/**
 * The Brief interface expected by the 3-agent pipeline.
 * Mirrors src/lib/types.ts → Brief
 */
export interface Brief {
    id: string;
    personal: {
        name: string;
        role: string;
        tagline: string;
        bio: string;
        location?: string;
        avatar_url?: string;
        email?: string;
    };
    socials: Record<string, string>;
    work: Array<{
        title: string;
        role: string;
        description: string;
        link?: string;
        impact?: string;
    }>;
    style: {
        vibe: string;
        likes?: string[];
        dislikes?: string[];
    };
}

/**
 * Transform native OnboardingData into the Brief JSON the agents expect.
 */
export function mapOnboardingToBrief(
    data: OnboardingData,
    profileImageUrl: string | null
): Brief {
    return {
        id: crypto.randomUUID(),
        personal: {
            name: data.fullName,
            role: data.role,
            tagline: data.tagline,
            bio: data.bio,
            email: data.email,
            avatar_url: profileImageUrl || undefined,
        },
        socials: {
            twitter: data.socials.x || '',
            linkedin: data.socials.linkedin || '',
            github: data.socials.github || '',
            discord: data.socials.discord || '',
        },
        work: data.projects
            .filter((p) => p.name.trim() !== '')
            .map((p) => ({
                title: p.name,
                role: p.role,
                description: p.impact || p.role, // impact doubles as description
                link: p.link || undefined,
                impact: p.impact || undefined,
            })),
        style: {
            vibe: data.visualStyle,
        },
    };
}
