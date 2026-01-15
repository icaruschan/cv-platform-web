'use client';

import { SandpackProvider, SandpackPreview as SandpackPreviewComponent } from '@codesandbox/sandpack-react';
import { useMemo } from 'react';

interface SandpackPreviewProps {
    files: Record<string, string>;
    onLoad?: () => void;
    onError?: (error: Error) => void;
}

export default function SandpackPreview({ files, onLoad, onError }: SandpackPreviewProps) {
    // Transform files for Sandpack format
    const sandpackFiles = useMemo(() => {
        if (Object.keys(files).length === 0) return null;

        const transformed: Record<string, { code: string; active?: boolean }> = {};

        // Debug: Log incoming files
        console.log('[SandpackPreview] Incoming files:', Object.keys(files));

        // Copy all files with proper path handling
        Object.entries(files).forEach(([path, content]) => {
            // Sandpack expects paths WITH leading slash
            let cleanPath = path.startsWith('/') ? path : `/${path}`;

            // Map component paths correctly
            // If path is "components/Hero.tsx" -> "/components/Hero.tsx"
            transformed[cleanPath] = { code: content };
        });

        // Debug: Log transformed files
        console.log('[SandpackPreview] Transformed files:', Object.keys(transformed));

        // Ensure App.tsx exists and is the entry point
        if (transformed['/App.tsx']) {
            transformed['/App.tsx'].active = true;
            console.log('[SandpackPreview] Found /App.tsx - setting as active');
        } else if (transformed['/src/App.tsx']) {
            transformed['/src/App.tsx'].active = true;
            console.log('[SandpackPreview] Found /src/App.tsx - setting as active');
        } else {
            console.warn('[SandpackPreview] No App.tsx found! Available files:', Object.keys(transformed));
        }

        return transformed;
    }, [files]);

    if (!sandpackFiles) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-900">
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center animate-pulse">
                        <span className="text-white text-xl">✦</span>
                    </div>
                    <p className="text-slate-400">Waiting for files...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full" style={{ minHeight: '500px' }}>
            <SandpackProvider
                template="react-ts"
                files={sandpackFiles}
                theme="dark"
                customSetup={{
                    dependencies: {
                        'react': '^18.2.0',
                        'react-dom': '^18.2.0',
                        'framer-motion': '^10.16.0',
                        '@phosphor-icons/react': '^2.0.0',
                        'clsx': '^2.0.0',
                    },
                }}
                options={{
                    externalResources: [
                        'https://cdn.tailwindcss.com',
                        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
                    ],
                }}
            >
                <SandpackPreviewComponent
                    showNavigator={false}
                    showRefreshButton={true}
                    showOpenInCodeSandbox={false}
                    style={{ height: '100%', minHeight: '500px' }}
                />
            </SandpackProvider>
        </div>
    );
}
