'use client';

import { useEffect, useRef, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import PreviewToolbar from './PreviewToolbar';

interface SimplePreviewProps {
    files: Record<string, string>;
}

// Helper function to extract Google Font names from CSS
function extractFontsFromCSS(css: string): string[] {
    const fonts = new Set<string>();

    // 1. Extract fonts from @import url('https://fonts.googleapis.com/css2?family=...')
    const importMatches = css.matchAll(/@import\s+url\(['"]?https:\/\/fonts\.googleapis\.com\/css2\?([^'")\s]+)['"]?\)/g);
    for (const match of importMatches) {
        const params = match[1];
        const familyMatches = params.matchAll(/family=([^&:+]+)/g);
        for (const fam of familyMatches) {
            // Convert URL-encoded font name: Playfair+Display -> Playfair Display
            fonts.add(decodeURIComponent(fam[1].replace(/\+/g, ' ')));
        }
    }

    // 2. Extract fonts from font-family declarations (common Google Fonts)
    const fontFamilyMatches = css.matchAll(/font-family:\s*['"]?([^;'"]+)/g);
    const popularGoogleFonts = [
        'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Playfair Display',
        'Source Sans Pro', 'Raleway', 'Nunito', 'Ubuntu', 'Merriweather', 'PT Sans', 'Rubik',
        'Work Sans', 'Outfit', 'Space Grotesk', 'DM Sans', 'Manrope', 'Sora', 'Lexend',
        'JetBrains Mono', 'Fira Code', 'Space Mono', 'IBM Plex Mono', 'Source Code Pro',
        'Libre Baskerville', 'Cormorant Garamond', 'EB Garamond', 'Crimson Text', 'Lora',
        'Plus Jakarta Sans', 'Archivo', 'Barlow', 'Titillium Web', 'Oswald', 'Bebas Neue'
    ];

    for (const match of fontFamilyMatches) {
        const fontList = match[1].split(',').map(f => f.trim().replace(/['"]/g, ''));
        for (const font of fontList) {
            if (popularGoogleFonts.some(gf => font.toLowerCase() === gf.toLowerCase())) {
                fonts.add(font);
            }
        }
    }

    // 3. Extract from CSS variable definitions: --font-heading: 'Playfair Display', serif;
    const varMatches = css.matchAll(/--font-[\w-]+:\s*['"]?([^;'"]+)/g);
    for (const match of varMatches) {
        const fontList = match[1].split(',').map(f => f.trim().replace(/['"]/g, ''));
        for (const font of fontList) {
            if (popularGoogleFonts.some(gf => font.toLowerCase() === gf.toLowerCase())) {
                fonts.add(font);
            }
        }
    }

    // Always include fallback fonts
    fonts.add('Inter');
    fonts.add('JetBrains Mono');

    return Array.from(fonts);
}

// Build Google Fonts URL from font list
function buildGoogleFontsUrl(fonts: string[]): string {
    const families = fonts.map(font => {
        const encoded = font.replace(/ /g, '+');
        // Add common weights for each font
        if (font.toLowerCase().includes('mono')) {
            return `family=${encoded}:wght@400;500;600`;
        }
        return `family=${encoded}:wght@300;400;500;600;700;800`;
    });
    return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;
}

export default function SimplePreview({ files }: SimplePreviewProps) {
    const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
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

        // Extract fonts from CSS and build dynamic Google Fonts URL
        const detectedFonts = extractFontsFromCSS(cssContent);
        const googleFontsUrl = buildGoogleFontsUrl(detectedFonts);

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
    <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js" crossorigin="anonymous"></script>
    <script src="https://unpkg.com/framer-motion@11.0.8/dist/framer-motion.js" crossorigin="anonymous"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="${googleFontsUrl}" rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/regular/style.css" />
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/bold/style.css" />
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
                    // Methods that need window as 'this' to avoid "Illegal invocation"
                    const needsWindowContext = new Set([
                        'setInterval', 'clearInterval', 'setTimeout', 'clearTimeout',
                        'requestAnimationFrame', 'cancelAnimationFrame',
                        'fetch', 'alert', 'confirm', 'prompt',
                        'getComputedStyle', 'matchMedia', 'open', 'close',
                        'addEventListener', 'removeEventListener', 'dispatchEvent'
                    ]);
                    
                    // Create a proxy to catch all undefined variables
                    const sandboxProxy = new Proxy(window, {
                        has: (target, prop) => true, // Trap everything
                        get: (target, prop) => {
                            // Explicit React/ReactDOM
                            if (prop === 'React') return window.React;
                            if (prop === 'ReactDOM') return window.ReactDOM;
                            
                            // Check Framer Motion (they're on window.Motion)
                            if (window.Motion && prop in window.Motion) {
                                return window.Motion[prop];
                            }
                            // Check Phosphor Icons (they're on window.PhosphorIcons)
                            if (window.PhosphorIcons && prop in window.PhosphorIcons) {
                                return window.PhosphorIcons[prop];
                            }
                            
                            // Allow access to real globals
                            if (prop in target) {
                                const val = target[prop];
                                // Only bind functions that NEED window context (browser APIs)
                                if (typeof val === 'function' && needsWindowContext.has(prop)) {
                                    return val.bind(window);
                                }
                                return val;
                            }
                            
                            // Return stub for anything else (missing imports)
                            return window.__IconStub;
                        }
                    });

                    // Run code with the proxy as scope
                    const runner = new Function('sandbox', 'with(sandbox) { ' + compiled + ' }');
                    runner(sandboxProxy);
                    
                    // Initialize Visual Editing after app loads
                    initVisualEditing();
                } catch (e) {
                    showError('Execution Error', e);
                }

            } catch (err) {
                showError('Setup Error', err);
            }
        });
        
        // Visual Editing Implementation
        function initVisualEditing() {
            let enabled = false;
            
            // Listen for enable/disable from parent
            window.addEventListener('message', (event) => {
                if (event.data?.type === 'VISUAL_EDITING_TOGGLE') {
                    enabled = event.data.enabled;
                    updateVisualEditing();
                }
            });
            
            // Notify parent we're ready
            window.parent.postMessage({ type: 'VISUAL_EDITING_READY' }, '*');
            
            function updateVisualEditing() {
                if (enabled) {
                    document.body.style.cursor = 'crosshair';
                    document.addEventListener('mouseover', handleMouseOver, true);
                    document.addEventListener('mouseout', handleMouseOut, true);
                    document.addEventListener('click', handleClick, true);
                } else {
                    document.body.style.cursor = '';
                    document.removeEventListener('mouseover', handleMouseOver, true);
                    document.removeEventListener('mouseout', handleMouseOut, true);
                    document.removeEventListener('click', handleClick, true);
                    clearHighlights();
                }
            }
            
            function handleMouseOver(e) {
                if (!enabled) return;
                e.stopPropagation();
                clearHighlights();
                if (e.target !== document.body && e.target !== document.documentElement && e.target.id !== 'root') {
                    e.target.style.outline = '2px solid #3b82f6';
                    e.target.style.outlineOffset = '2px';
                    e.target.setAttribute('data-ve-hover', 'true');
                }
            }
            
            function handleMouseOut(e) {
                if (!enabled) return;
                e.target.style.outline = '';
                e.target.removeAttribute('data-ve-hover');
            }
            
            function handleClick(e) {
                if (!enabled) return;
                e.preventDefault();
                e.stopPropagation();
                
                const target = e.target;
                if (target === document.body || target === document.documentElement || target.id === 'root') return;
                
                // Add persistent selection highlight
                clearHighlights();
                target.style.outline = '3px solid #10b981';
                target.style.outlineOffset = '2px';
                target.setAttribute('data-ve-selected', 'true');
                
                window.parent.postMessage({
                    type: 'ELEMENT_SELECTED',
                    payload: {
                        tag: target.tagName.toLowerCase(),
                        id: target.id || null,
                        className: target.className || null,
                        textContent: (target.innerText || '').substring(0, 50),
                        selectorPath: buildSelectorPath(target)
                    }
                }, '*');
            }
            
            function clearHighlights() {
                document.querySelectorAll('[data-ve-hover], [data-ve-selected]').forEach(el => {
                    el.style.outline = '';
                    el.removeAttribute('data-ve-hover');
                    el.removeAttribute('data-ve-selected');
                });
            }
            
            function buildSelectorPath(el) {
                if (el.id) return '#' + el.id;
                const tag = el.tagName.toLowerCase();
                if (el.className && typeof el.className === 'string') {
                    const first = el.className.split(' ')[0];
                    if (first) return tag + '.' + first;
                }
                return tag;
            }
        }
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
    }, [htmlContent, refreshKey]);



    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
        // Re-write the iframe content
        if (iframeRef.current && htmlContent) {
            const doc = iframeRef.current.contentDocument;
            if (doc) {
                doc.open();
                doc.write(htmlContent);
                doc.close();
            }
        }
    };

    // Close fullscreen on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen]);

    const getWidth = () => {
        if (isFullscreen && device === 'desktop') return '100%';
        switch (device) {
            case 'mobile': return '375px';
            case 'tablet': return '768px';
            default: return '100%';
        }
    };

    const getHeight = () => {
        if (isFullscreen) return '100%';
        return device === 'desktop' ? '100%' : '90%';
    };

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

    const handleOpenNewTab = () => {
        if (!htmlContent) return;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };

    const content = (
        <div className={`relative w-full h-full bg-[var(--background-secondary)] flex flex-col items-center justify-center overflow-hidden
            ${isFullscreen ? 'fixed inset-0 z-[100]' : ''}`}>

            <PreviewToolbar
                currentDevice={device}
                onDeviceChange={setDevice}
                onRefresh={handleRefresh}
                isFullscreen={isFullscreen}
                onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
                onOpenNewTab={handleOpenNewTab}
            />

            <div className={`flex-1 w-full flex items-center justify-center overflow-auto 
                ${isFullscreen ? 'p-0' : 'p-8'}`}>
                <motion.div
                    layout
                    initial={false}
                    animate={{
                        width: getWidth(),
                        height: getHeight(),
                        opacity: 1
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                    className={`relative bg-white shadow-2xl overflow-hidden flex flex-col transition-all duration-300
                        ${device !== 'desktop'
                            ? 'rounded-[2rem] border-[6px] border-gray-900 ring-1 ring-gray-900/50'
                            : isFullscreen
                                ? 'rounded-none border-0'
                                : 'rounded-xl border border-[var(--border-subtle)]'
                        }`}
                >
                    {/* Notch for mobile/tablet */}
                    {device !== 'desktop' && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30%] h-5 bg-gray-900 rounded-b-xl z-20" />
                    )}

                    <iframe
                        ref={iframeRef}
                        className="w-full h-full border-0 flex-1"
                        sandbox="allow-scripts allow-same-origin"
                        title="Portfolio Preview"
                    />
                </motion.div>
            </div>
        </div>
    );

    return content;
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

        // Phosphor Icons Proxy - Uses icon font with <i> tags
        // Converts PascalCase icon names to kebab-case (ArrowDown -> arrow-down)
        window.PhosphorIcons = new Proxy({}, {
            get: (target, prop) => {
                // Convert PascalCase to kebab-case: ArrowDown -> arrow-down
                const iconName = String(prop).replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
                
                return (props = {}) => {
                    const { size = 24, weight = 'regular', className = '', style = {}, ...rest } = props;
                    const weightClass = weight === 'regular' ? 'ph' : 'ph-' + weight;
                    const iconClass = 'ph-' + iconName;
                    
                    return React.createElement('i', {
                        className: weightClass + ' ' + iconClass + (className ? ' ' + className : ''),
                        style: { fontSize: size + 'px', ...style },
                        'aria-hidden': 'true',
                        ...rest
                    });
                };
            }
        });

        // Framer Motion - Use the REAL CDN-loaded library (window.Motion)
        // If not loaded, fall back to a stub proxy
        window.FramerMotion = window.Motion || new Proxy({
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

        // useVisualEditing is now implemented natively in the iframe (see initVisualEditing)
        // Keep a stub for compatibility with injected code
        function useVisualEditing() { return {}; }

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
    // Use simpler, more precise patterns: match { ... } without crossing into other imports
    cleaned = cleaned.replace(/import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]react['"];?/g, 'const { $1 } = React;');
    cleaned = cleaned.replace(/import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]lucide-react['"];?/g, 'const { $1 } = window.LucideReact;');
    cleaned = cleaned.replace(/import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]framer-motion['"];?/g, 'const { $1 } = window.FramerMotion;');
    cleaned = cleaned.replace(/import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]@phosphor-icons\/react['"];?/g, 'const { $1 } = window.PhosphorIcons;');

    // Remove other imports (CSS imports, relative imports, etc.) - match per line only
    cleaned = cleaned.replace(/import\s*\{[^}]*\}\s*from\s*['"][^'"]+['"];?/g, '');
    cleaned = cleaned.replace(/^\s*import\s+[^\n;]+;?\s*$/gm, '');

    // Handle exports
    cleaned = cleaned.replace(/export\s+default\s+function\s+([a-zA-Z0-9_]+)/g, 'function $1');
    cleaned = cleaned.replace(/export\s+default\s+class\s+([a-zA-Z0-9_]+)/g, 'class $1');
    cleaned = cleaned.replace(/^\s*export\s+default\s+[^\n;]+;?\s*$/gm, '');

    cleaned = cleaned.replace(/'use client';?/g, '');

    // Wrap in IIFE
    return `const ${componentName} = (() => {
        ${cleaned}
        return ${componentName};
    })();`;
}

function cleanAppCode(code: string): string {
    let cleaned = code;

    // Transform known libraries - use simpler patterns that match { ... } without crossing imports
    cleaned = cleaned.replace(/import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]react['"];?/g, 'const { $1 } = React;');
    cleaned = cleaned.replace(/import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]lucide-react['"];?/g, 'const { $1 } = window.LucideReact;');
    cleaned = cleaned.replace(/import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]framer-motion['"];?/g, 'const { $1 } = window.FramerMotion;');
    cleaned = cleaned.replace(/import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]@phosphor-icons\/react['"];?/g, 'const { $1 } = window.PhosphorIcons;');

    // Remove other imports (CSS imports, relative imports, etc.) - match per line only
    cleaned = cleaned.replace(/import\s*\{[^}]*\}\s*from\s*['"][^'"]+['"];?/g, '');
    cleaned = cleaned.replace(/^\s*import\s+[^\n;]+;?\s*$/gm, '');

    // Handle exports
    cleaned = cleaned.replace(/export\s+default\s+function\s+([a-zA-Z0-9_]+)/g, 'function $1');
    cleaned = cleaned.replace(/^\s*export\s+default\s+[^\n;]+;?\s*$/gm, '');

    cleaned = cleaned.replace(/'use client';?/g, '');
    return cleaned;
}
