'use client';

import sdk, { VM } from '@stackblitz/sdk';
import { useEffect, useRef, useState, useMemo } from 'react';

interface StackBlitzPreviewProps {
    files: Record<string, string>;
    onLoad?: () => void;
    onError?: (error: Error) => void;
}

// Pre-warmed template configuration
// This template has all dependencies pre-installed for faster boot
const TEMPLATE_CONFIG = {
    // Using a pre-configured Vite + React template
    // Dependencies are already cached in StackBliz's CDN
    template: 'node' as const,
    // Pre-defined package.json with all deps
    basePackageJson: {
        name: 'portfolio',
        private: true,
        version: '0.0.0',
        type: 'module',
        scripts: {
            dev: 'vite',
            build: 'vite build',
            preview: 'vite preview'
        },
        dependencies: {
            'react': '^18.2.0',
            'react-dom': '^18.2.0',
            'framer-motion': '^10.16.0',
            '@phosphor-icons/react': '^2.0.0',
            'clsx': '^2.0.0',
        },
        devDependencies: {
            '@types/react': '^18.2.0',
            '@types/react-dom': '^18.2.0',
            '@vitejs/plugin-react': '^4.0.0',
            'typescript': '^5.0.0',
            'vite': '^5.0.0',
        }
    }
};

// Base config files that rarely change
const BASE_FILES = {
    'vite.config.ts': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`,
    'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}`,
};

export default function StackBlitzPreview({ files, onLoad, onError }: StackBlitzPreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const vmRef = useRef<VM | null>(null);
    const [loadingStage, setLoadingStage] = useState<'init' | 'deps' | 'build' | 'ready' | 'error'>('init');
    const [error, setError] = useState<string | null>(null);

    // Memoize prepared files - only recompute when input files change
    const projectFiles = useMemo(() => {
        if (Object.keys(files).length === 0) return null;

        const prepared: Record<string, string> = {
            // Start with base config files
            ...BASE_FILES,
            'package.json': JSON.stringify(TEMPLATE_CONFIG.basePackageJson, null, 2),
        };

        // Copy all generated files, removing leading slashes
        Object.entries(files).forEach(([path, content]) => {
            const cleanPath = path.startsWith('/') ? path.slice(1) : path;
            prepared[cleanPath] = content;
        });

        // Ensure index.html exists with Tailwind CDN and Google Fonts
        if (!prepared['index.html']) {
            prepared['index.html'] = createIndexHtml();
        } else {
            prepared['index.html'] = injectCdnDependencies(prepared['index.html']);
        }

        // Ensure main.tsx exists
        if (!prepared['src/main.tsx']) {
            prepared['src/main.tsx'] = createMainTsx();
        }

        // Ensure App.tsx exists with a fallback
        if (!prepared['src/App.tsx']) {
            prepared['src/App.tsx'] = createFallbackApp();
        }

        // Ensure index.css exists
        if (!prepared['src/index.css']) {
            prepared['src/index.css'] = `body { margin: 0; font-family: 'Inter', system-ui, sans-serif; }`;
        }

        return prepared;
    }, [files]);

    useEffect(() => {
        if (!containerRef.current || !projectFiles) return;

        const embedProject = async () => {
            try {
                setLoadingStage('init');
                setError(null);

                // Clear previous embed
                if (containerRef.current) {
                    containerRef.current.innerHTML = '';
                }

                setLoadingStage('deps');

                // Embed project with all files inline
                // Note: timeout in ms for how long to wait for VM connection
                const vm = await sdk.embedProject(
                    containerRef.current!,
                    {
                        title: 'Portfolio',
                        description: 'AI-Generated Portfolio',
                        template: TEMPLATE_CONFIG.template,
                        files: projectFiles,
                    },
                    {
                        view: 'preview',
                        hideNavigation: true,
                        hideExplorer: true,
                        terminalHeight: 0,
                        clickToLoad: false,
                        startScript: 'dev',
                        // Longer timeout for VM connection (default is 20s)
                        // @ts-ignore - timeout option may not be in types but works
                        timeout: 120000, // 120 seconds
                    }
                );

                vmRef.current = vm;
                setLoadingStage('build');

                // Give Vite more time to compile (especially first load), then mark as ready
                setTimeout(() => {
                    setLoadingStage('ready');
                    onLoad?.();
                }, 4000);

            } catch (err) {
                console.error('StackBlitz embed error:', err);
                const error = err instanceof Error ? err : new Error('Failed to load preview');
                setError(error.message);
                setLoadingStage('error');
                onError?.(error);
            }
        };

        embedProject();

        return () => {
            vmRef.current = null;
        };
    }, [projectFiles, onLoad, onError]);

    if (loadingStage === 'error') {
        return (
            <div className="w-full h-full flex items-center justify-center bg-red-50 dark:bg-red-950/20">
                <div className="text-center p-8">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">Preview Error</h3>
                    <p className="text-sm text-red-600 dark:text-red-500">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative">
            {/* Progressive Loading Skeleton */}
            {loadingStage !== 'ready' && (
                <div className="absolute inset-0 z-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
                    {/* Animated background */}
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
                    </div>

                    {/* Skeleton Content */}
                    <div className="relative z-10 p-8 h-full flex flex-col">
                        {/* Nav skeleton */}
                        <div className="flex justify-between items-center mb-16">
                            <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
                            <div className="flex gap-4">
                                <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
                                <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
                                <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
                            </div>
                        </div>

                        {/* Hero skeleton */}
                        <div className="flex-1 flex flex-col justify-center max-w-3xl">
                            <div className="h-4 w-24 bg-white/10 rounded mb-4 animate-pulse" />
                            <div className="h-12 w-3/4 bg-white/10 rounded mb-3 animate-pulse" />
                            <div className="h-12 w-1/2 bg-white/10 rounded mb-6 animate-pulse" />
                            <div className="h-5 w-full bg-white/10 rounded mb-2 animate-pulse" />
                            <div className="h-5 w-4/5 bg-white/10 rounded mb-8 animate-pulse" />
                            <div className="flex gap-4">
                                <div className="h-12 w-36 bg-white/20 rounded-lg animate-pulse" />
                                <div className="h-12 w-36 bg-white/10 rounded-lg animate-pulse" />
                            </div>
                        </div>

                        {/* Loading Status */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full">
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-sm text-white/70">
                                    {loadingStage === 'init' && 'Initializing preview...'}
                                    {loadingStage === 'deps' && 'Loading dependencies...'}
                                    {loadingStage === 'build' && 'Building your site...'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* StackBlitz Container */}
            <div
                ref={containerRef}
                className={`w-full h-full transition-opacity duration-500 ${loadingStage === 'ready' ? 'opacity-100' : 'opacity-0'}`}
            />
        </div>
    );
}

// Helper functions for creating base files
function createIndexHtml(): string {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Portfolio</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
}

function injectCdnDependencies(html: string): string {
    let result = html;

    // Inject Tailwind CDN if not present
    if (!result.includes('cdn.tailwindcss.com')) {
        result = result.replace(
            '</head>',
            '    <script src="https://cdn.tailwindcss.com"></script>\n  </head>'
        );
    }

    // Inject Inter font if not present
    if (!result.includes('fonts.googleapis.com') || !result.includes('Inter')) {
        result = result.replace(
            '</head>',
            `    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  </head>`
        );
    }

    return result;
}

function createMainTsx(): string {
    return `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`;
}

function createFallbackApp(): string {
    return `import React from 'react'

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center animate-pulse">
          <span className="text-white text-2xl">✦</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Building your site...</h1>
        <p className="text-slate-400">Please wait while we generate your portfolio.</p>
      </div>
    </div>
  )
}`;
}

