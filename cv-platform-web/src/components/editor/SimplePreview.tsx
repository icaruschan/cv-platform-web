'use client';

import { useEffect, useRef, useMemo } from 'react';

interface SimplePreviewProps {
    files: Record<string, string>;
}

export default function SimplePreview({ files }: SimplePreviewProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Build a complete HTML document from the files
    const htmlContent = useMemo(() => {
        if (Object.keys(files).length === 0) return null;

        // Get CSS content
        let cssContent = '';
        const cssFile = files['/src/index.css'] || files['src/index.css'] || '';
        if (cssFile) {
            cssContent = cssFile;
        }

        // Get the App component code
        const appCode = files['/src/App.tsx'] || files['src/App.tsx'] || '';

        // Get component files
        const componentFiles: Record<string, string> = {};
        Object.entries(files).forEach(([path, content]) => {
            if (path.includes('/components/') && path.endsWith('.tsx')) {
                const name = path.split('/').pop()?.replace('.tsx', '') || '';
                componentFiles[name] = content;
            }
        });

        // Build the HTML document with embedded React
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', system-ui, sans-serif; }
        ${cssContent}
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel" data-presets="react,typescript">
        ${generateComponentCode(componentFiles, appCode)}
    </script>
</body>
</html>`;
    }, [files]);

    useEffect(() => {
        if (iframeRef.current && htmlContent) {
            const iframe = iframeRef.current;
            const doc = iframe.contentDocument || iframe.contentWindow?.document;
            if (doc) {
                doc.open();
                doc.write(htmlContent);
                doc.close();
            }
        }
    }, [htmlContent]);

    if (!htmlContent) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-900">
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center animate-pulse">
                        <span className="text-white text-xl">✦</span>
                    </div>
                    <p className="text-slate-400">Generating preview...</p>
                </div>
            </div>
        );
    }

    return (
        <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
            title="Portfolio Preview"
        />
    );
}

// Helper function to generate component code
function generateComponentCode(components: Record<string, string>, appCode: string): string {
    // Collect all imports to generate stubs
    const allImports = new Set<string>();

    // Analyze imports from all files
    [appCode, ...Object.values(components)].forEach(code => {
        const matches = code.matchAll(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/g);
        for (const match of matches) {
            match[1].split(',').forEach(i => allImports.add(i.trim()));
        }
    });

    // Generate Icon stubs
    const iconStubs = Array.from(allImports).map(name => `
        const ${name} = (props) => React.createElement('svg', { ...props, width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, 
            React.createElement('rect', { x: 3, y: 3, width: 18, height: 18, rx: 2 })
        );
    `).join('\n');

    // Create simple stub components for any imports that we can't resolve
    const stubComponents = ['Hero', 'About', 'Skills', 'Projects', 'Contact', 'Footer', 'Header', 'Navigation', 'Feature']
        .map(name => {
            if (components[name]) {
                return cleanComponentCode(components[name], name);
            }
            // Create a placeholder if not found but referenced
            // Only strictly needed if we can't find it, but Babel might complain if we don't define potential deps.
            // For now relying on the loop above which only defines what's in components
            return '';
        })
        .filter(Boolean)
        .join('\n\n');

    // Clean up App code
    const cleanedApp = cleanAppCode(appCode);

    return `
        // Stub hooks/libs
        const useVisualEditing = () => {};
        const motion = new Proxy({}, {
            get: (target, prop) => (props) => React.createElement(prop || 'div', props)
        });
        const AnimatePresence = ({ children }) => children;
        
        // Icon Stubs
        ${iconStubs}

        // Components
        ${stubComponents}
        
        // App
        ${cleanedApp}
        
        // Render
        const container = document.getElementById('root');
        const root = ReactDOM.createRoot(container);
        root.render(React.createElement(App));
    `;
}

function cleanComponentCode(code: string, componentName: string): string {
    // Remove imports
    let cleaned = code.replace(/^import.*$/gm, '');
    // Remove export default  
    cleaned = cleaned.replace(/export\s+default\s+/g, '');
    // Remove 'use client'
    cleaned = cleaned.replace(/'use client';?/g, '');
    return cleaned;
}

function cleanAppCode(code: string): string {
    // Remove imports
    let cleaned = code.replace(/^import.*$/gm, '');
    // Remove export default
    cleaned = cleaned.replace(/export\s+default\s+/g, '');
    // Remove 'use client'
    cleaned = cleaned.replace(/'use client';?/g, '');
    return cleaned;
}
