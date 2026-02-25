/// <reference types="vite/client" />

// Fallback declarations for when vite/client types aren't installed
interface ImportMetaEnv {
    readonly VITE_APP_URL: string;
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
