export interface Project {
    id: string;
    magic_token: string;
    email: string;
    status: 'draft' | 'published';
    domain?: string;
    vibe?: Moodboard;
    created_at?: string;
}

export interface FileRecord {
    id: string;
    project_id: string;
    path: string;
    content: string;
}

// The raw input from Typeform/n8n
export interface Brief {
    id: string; // job id
    personal: {
        name: string;
        role: string;
        tagline: string;
        bio: string;
        location?: string;
        avatar_url?: string;
        email?: string;
    };
    socials: Record<string, string>; // { "twitter": "...", "linkedin": "..." }
    work: Array<{
        title: string;
        role: string;
        description: string;
        link?: string;
        impact?: string;
    }>;
    style: {
        vibe: string; // The "prompt"
        likes?: string[];
        dislikes?: string[];
    };
}

// The output of the Inspiration Agent
export interface Moodboard {
    visual_direction: string;
    color_palette: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        surface: string;
        text: string;
    };
    typography: {
        heading_font: string;
        body_font: string;
        mono_font: string;
        font_sizes?: Record<string, string>;  // NEW: from Firecrawl branding
        font_weights?: number[];              // NEW: from Firecrawl branding
    };
    ui_patterns: {
        card_style: string;
        button_style: string;
        layout_structure: string;
    };
    motion: {
        profile: 'STUDIO' | 'TECH' | 'BOLD'; // From Motion System
        description: string;
    };
    // NEW: Extended fields from Firecrawl branding extraction
    spacing?: Record<string, string>;                    // CSS spacing tokens
    animations?: { name: string; value: string }[];      // CSS transitions/keyframes
    components?: { name: string; styles: Record<string, string> }[]; // Button/input styles
    personality?: {                                      // Brand personality
        tone?: string;
        energy?: string;
        targetAudience?: string;
        description?: string;
    };
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface ChatRequest {
    messages: ChatMessage[];
    projectId: string;
    currentFiles: Record<string, string>; // Sandpack state
}

export interface ChatResponse {
    message: string;
    files?: Array<{ path: string, content: string }>; // Updates
}
