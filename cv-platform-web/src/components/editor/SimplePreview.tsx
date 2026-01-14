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
    <script>
        // Inject Premium Fallback Config for Tailwind
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        background: '#F5F5F5',
                        text: '#111827',
                        primary: '#000000',
                        secondary: '#ffffff',
                        accent: '#3b82f6',
                        surface: '#f3f4f6'
                    },
                    fontFamily: {
                        heading: ['Inter', 'sans-serif'],
                        body: ['Inter', 'sans-serif'],
                        mono: ['JetBrains Mono', 'monospace']
                    }
                }
            }
        }
    </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', system-ui, sans-serif; background-color: #0f172a; color: white; }
        ${cssContent}
        #error-display { display: none; padding: 20px; color: #ef4444; background: #1f1212; font-family: monospace; white-space: pre-wrap; border-bottom: 1px solid #333; }
    </style>
</head>
<body>
    <div id="error-display"></div>
    <div id="root"></div>
    <script>
        // Error handler
        function showError(title, err) {
            const display = document.getElementById('error-display');
            if (display) {
                display.style.display = 'block';
                display.innerHTML += '<h3>' + title + '</h3>' + (err.message || err) + '<br>' + (err.stack || '') + '<hr>';
            }
            console.error(title, err);
        }

        window.onerror = function(msg, url, line, col, error) {
            showError('Global Runtime Error', error || msg);
            return false;
        };

        window.addEventListener('load', function() {
            try {
                // Check libs
                if (typeof React === 'undefined') throw new Error('React not loaded');
                if (typeof ReactDOM === 'undefined') throw new Error('ReactDOM not loaded');
                if (typeof Babel === 'undefined') throw new Error('Babel not loaded');

                // Define global stub for missing components
                window.__IconStub = (props) => React.createElement('svg', { 
                    ...props, 
                    width: 24, height: 24, viewBox: '0 0 24 24', 
                    fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' 
                }, React.createElement('rect', { x: 3, y: 3, width: 18, height: 18, rx: 2 }));

                // Source code
                const code = \`${generateComponentCode(componentFiles, appCode).replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
                
                // Compile
                let compiled;
                try {
                    compiled = Babel.transform(code, { 
                        presets: ['react', 'typescript', ['env', { modules: false }]],
                        filename: 'app.tsx'
                    }).code;
                    // Remove strict mode to allow 'with' statement
                    compiled = compiled.replace(/"use strict";/g, '').replace(/'use strict';/g, '');
                } catch (e) {
                    showError('Compilation Error (Syntax)', e);
                    return;
                }

                // Execute with Proxy Sandbox
                try {
                    // Create a proxy to catch all undefined variables
                    const sandboxProxy = new Proxy(window, {
                        has: (target, prop) => true, // Trap everything
                        get: (target, prop) => {
                            // Allow access to real globals
                            if (prop in target) return target[prop];
                            if (prop === 'React') return window.React;
                            if (prop === 'ReactDOM') return window.ReactDOM;
                            // Return stub for anything else (missing imports/icons)
                            return window.__IconStub;
                        }
                    });

                    // Run code with the proxy as scope
                    const runner = new Function('sandbox', 'with(sandbox) { ' + compiled + ' }');
                    runner(sandboxProxy);
                } catch (e) {
                    showError('Execution Error', e);
                }

            } catch (err) {
                showError('Setup Error', err);
            }
        });
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
    // We filter out components that are actually files to avoid shadowing
    const stubComponents = ['Hero', 'About', 'Skills', 'Projects', 'Contact', 'Footer', 'Header', 'Navigation', 'Feature']
        .map(name => {
            if (components[name]) {
                return cleanComponentCode(components[name], name);
            }
            return '';
        })
        .filter(Boolean)
        .join('\n\n');

    // Clean up App code
    const cleanedApp = cleanAppCode(appCode);

    return `
        // Check libraries
        if (typeof React === 'undefined') throw new Error('React not loaded');
        if (typeof ReactDOM === 'undefined') throw new Error('ReactDOM not loaded');
        if (typeof Babel === 'undefined') throw new Error('Babel not loaded');

        // Setup Library Proxies
        
        // Generic Icon Component Stub
        const IconStub = (props) => React.createElement('svg', { 
            ...props, 
            width: 24, height: 24, viewBox: '0 0 24 24', 
            fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' 
        }, React.createElement('rect', { x: 3, y: 3, width: 18, height: 18, rx: 2 }));

        // Lucide Proxy
        window.LucideReact = new Proxy({}, {
            get: (target, prop) => IconStub
        });

        // Framer Motion Proxy
        window.FramerMotion = new Proxy({
            AnimatePresence: ({ children }) => children,
            motion: new Proxy({}, {
                get: (target, prop) => (props) => React.createElement(prop || 'div', props)
            })
        }, {
            get: (target, prop) => {
                if (prop === 'AnimatePresence' || prop === 'motion') return target[prop];
                return (props) => props.children || null; 
            }
        });

        // Components
        ${stubComponents}
        
        // App
        const App = (() => {
            ${cleanedApp}
            return App;
        })();
        
        // Render
        const container = document.getElementById('root');
        const root = ReactDOM.createRoot(container);
        root.render(React.createElement(App));
    `;
}

function cleanComponentCode(code: string, componentName: string): string {
    let cleaned = code;

    // Transform known libraries to global proxies
    cleaned = cleaned.replace(/import\s+({[\s\S]*?})\s+from\s+['"]lucide-react['"];?/g, 'const $1 = window.LucideReact;');
    cleaned = cleaned.replace(/import\s+({[\s\S]*?})\s+from\s+['"]framer-motion['"];?/g, 'const $1 = window.FramerMotion;');

    // Remove other imports
    cleaned = cleaned.replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '');
    cleaned = cleaned.replace(/import\s+['"][^'"]+['"];?/g, '');

    // Handle exports
    cleaned = cleaned.replace(/export\s+default\s+function\s+([a-zA-Z0-9_]+)/g, 'function $1');
    cleaned = cleaned.replace(/export\s+default\s+class\s+([a-zA-Z0-9_]+)/g, 'class $1');
    cleaned = cleaned.replace(/export\s+default\s+[^;]+;?/g, '');

    cleaned = cleaned.replace(/'use client';?/g, '');

    // Wrap in IIFE
    return `const ${componentName} = (() => {
        ${cleaned}
        return ${componentName};
    })();`;
}

function cleanAppCode(code: string): string {
    let cleaned = code;

    // Transform known libraries
    cleaned = cleaned.replace(/import\s+({[\s\S]*?})\s+from\s+['"]lucide-react['"];?/g, 'const $1 = window.LucideReact;');
    cleaned = cleaned.replace(/import\s+({[\s\S]*?})\s+from\s+['"]framer-motion['"];?/g, 'const $1 = window.FramerMotion;');

    // Remove other imports
    cleaned = cleaned.replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '');
    cleaned = cleaned.replace(/import\s+['"][^'"]+['"];?/g, '');

    // Handle exports
    cleaned = cleaned.replace(/export\s+default\s+function\s+([a-zA-Z0-9_]+)/g, 'function $1');
    cleaned = cleaned.replace(/export\s+default\s+[^;]+;?/g, '');

    cleaned = cleaned.replace(/'use client';?/g, '');
    return cleaned;
}
