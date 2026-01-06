export type MotionVibe = 'studio' | 'tech' | 'playful' | 'minimal';

export interface MotionConfig {
    type: MotionVibe;
    transition: {
        duration: number;
        ease: number[];
    };
    stagger: number;
    viewport: {
        once: boolean;
        margin: string;
    };
}

// 1. The "Studio" Preset (DDLab Style)
// Long, fluid, water-like friction.
export const STUDIO_MOTION: MotionConfig = {
    type: 'studio',
    transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1], // The "Pricey" Bezier
    },
    stagger: 0.12, // Slow, deliberate reveals
    viewport: {
        once: true,
        margin: "-10%"
    }
};

// 2. The "Tech" Preset (ELVTD Style)
// Fast, exponential, precise.
export const TECH_MOTION: MotionConfig = {
    type: 'tech',
    transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1], // Snappier
    },
    stagger: 0.05, // Fast data-feed style
    viewport: {
        once: true,
        margin: "-5%"
    }
};

// Default fallback
export const DEFAULT_MOTION = STUDIO_MOTION;

export const MOTION_VARIANTS = {
    fadeInUp: {
        hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
        visible: { opacity: 1, y: 0, filter: "blur(0px)" }
    },
    fadeIn: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    },
    staggerContainer: {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }
};
