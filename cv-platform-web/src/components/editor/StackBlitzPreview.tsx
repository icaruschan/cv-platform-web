'use client';

import sdk, { VM } from '@stackblitz/sdk';
import { useEffect, useRef, useState, useCallback } from 'react';

interface StackBlitzPreviewProps {
    files: Record<string, string>;
    onLoad?: () => void;
    onError?: (error: Error) => void;
}

export default function StackBlitzPreview({ files, onLoad, onError }: StackBlitzPreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const vmRef = useRef<VM | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Convert our Vite-style files to StackBlitz format
    const prepareFiles = useCallback((inputFiles: Record<string, string>) => {
        const projectFiles: Record<string, string> = {};

        // Copy all files, removing leading slashes for StackBlitz
        Object.entries(inputFiles).forEach(([path, content]) => {
            const cleanPath = path.startsWith('/') ? path.slice(1) : path;
            projectFiles[cleanPath] = content;
        });

        // Ensure package.json exists with all dependencies
        if (!projectFiles['package.json']) {
            projectFiles['package.json'] = JSON.stringify({
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
            }, null, 2);
        }

        // Ensure vite.config.ts exists
        if (!projectFiles['vite.config.ts']) {
            projectFiles['vite.config.ts'] = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`;
        }

        // Ensure index.html exists
        if (!projectFiles['index.html']) {
            projectFiles['index.html'] = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Portfolio</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
        }

        // Ensure main.tsx exists
        if (!projectFiles['src/main.tsx']) {
            projectFiles['src/main.tsx'] = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`;
        }

        // Ensure App.tsx exists with a fallback
        if (!projectFiles['src/App.tsx']) {
            projectFiles['src/App.tsx'] = `import React from 'react'

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

        // Ensure index.css exists
        if (!projectFiles['src/index.css']) {
            projectFiles['src/index.css'] = `body {
  margin: 0;
  font-family: 'Inter', system-ui, sans-serif;
}`;
        }

        return projectFiles;
    }, []);

    useEffect(() => {
        if (!containerRef.current || Object.keys(files).length === 0) return;

        const embedProject = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Clear previous embed
                if (containerRef.current) {
                    containerRef.current.innerHTML = '';
                }

                const projectFiles = prepareFiles(files);

                const vm = await sdk.embedProject(
                    containerRef.current!,
                    {
                        title: 'Portfolio',
                        description: 'AI-Generated Portfolio',
                        template: 'node',
                        files: projectFiles,
                    },
                    {
                        view: 'preview',
                        hideNavigation: true,
                        hideExplorer: true,
                        terminalHeight: 0,
                        clickToLoad: false,
                    }
                );

                vmRef.current = vm;
                setIsLoading(false);
                onLoad?.();

            } catch (err) {
                console.error('StackBlitz embed error:', err);
                const error = err instanceof Error ? err : new Error('Failed to load preview');
                setError(error.message);
                setIsLoading(false);
                onError?.(error);
            }
        };

        embedProject();

        return () => {
            vmRef.current = null;
        };
    }, [files, prepareFiles, onLoad, onError]);

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-red-50">
                <div className="text-center p-8">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-red-700 mb-2">Preview Error</h3>
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--background)] z-10">
                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-[var(--text-secondary)]">Starting preview...</p>
                    </div>
                </div>
            )}
            <div ref={containerRef} className="w-full h-full" />
        </div>
    );
}
