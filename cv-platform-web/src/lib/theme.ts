// Theme configuration for the "Portfolio Alchemy" aesthetic
// Warm, cream-based palette with soft accents

export const theme = {
    colors: {
        // Core backgrounds
        background: {
            primary: '#FDFDFC',      // Warm white (main canvas)
            secondary: '#FAF9F6',    // Cream (sidebar bg)
            tertiary: '#F5F3EF',     // Slightly darker cream (cards)
        },

        // Text
        text: {
            primary: '#1A1A1A',      // Near black
            secondary: '#6B6B6B',    // Muted gray
            tertiary: '#9CA3AF',     // Light gray (placeholders)
        },

        // Accents
        accent: {
            primary: '#3B82F6',      // Bright blue (CTAs, links)
            secondary: '#10B981',    // Success green (checkmarks)
            coral: '#E88B8B',        // Soft coral (decorative)
        },

        // Borders & Dividers
        border: {
            light: '#E5E5E5',        // Standard border
            subtle: '#EDE8E4',       // Very light dividers
        },

        // Status
        status: {
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
            info: '#3B82F6',
        },
    },

    // Shadows
    shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        pill: '0 2px 8px -2px rgb(0 0 0 / 0.1)',
    },

    // Border Radius
    radius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        pill: '24px',
        full: '9999px',
    },

    // Typography
    fonts: {
        sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        mono: "'JetBrains Mono', 'Fira Code', monospace",
    },
} as const;

export type Theme = typeof theme;
