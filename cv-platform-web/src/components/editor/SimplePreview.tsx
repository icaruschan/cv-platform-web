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
    // Create simple stub components for any imports that we can't resolve
    const stubComponents = ['Hero', 'About', 'Skills', 'Projects', 'Contact', 'Footer', 'Header', 'Navigation']
        .map(name => {
            if (components[name]) {
                // Clean up the component code for browser use
                return cleanComponentCode(components[name], name);
            }
            // Create a placeholder
            return `
                function ${name}() {
                    return React.createElement('section', { 
                        className: 'py-20 px-6 text-center' 
                    }, React.createElement('h2', { 
                        className: 'text-2xl font-bold' 
                    }, '${name} Section'));
                }
            `;
        })
        .join('\n\n');

    // Clean up App code
    const cleanedApp = cleanAppCode(appCode);

    return `
        // Stub hooks
        const useVisualEditing = () => {};
        const motion = { div: 'div', section: 'section', h1: 'h1', p: 'p', a: 'a', span: 'span' };
        
        ${stubComponents}
        
        ${cleanedApp}
        
        // Render the app
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
    // Replace JSX with createElement calls (basic transformation)
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
