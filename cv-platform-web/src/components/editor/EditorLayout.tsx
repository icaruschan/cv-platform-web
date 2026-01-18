'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface EditorLayoutProps {
    sidebar: ReactNode;
    canvas: ReactNode;
    codeView?: ReactNode;
    projectName?: string;
    status?: 'draft' | 'generating' | 'ready' | 'error';
}

export default function EditorLayout({
    sidebar,
    canvas,
    codeView,
    projectName = 'Untitled Project',
    status = 'draft'
}: EditorLayoutProps) {
    const [sidebarWidth, setSidebarWidth] = useState(360);
    const [isResizing, setIsResizing] = useState(false);
    const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');

    const MIN_WIDTH = 280;
    const MAX_WIDTH = 600;

    const statusConfig = {
        draft: { label: 'Draft', color: 'bg-gray-400' },
        generating: { label: 'Generating...', color: 'bg-blue-500 animate-pulse' },
        ready: { label: 'Ready', color: 'bg-green-500' },
        error: { label: 'Error', color: 'bg-red-500' },
    };

    const currentStatus = statusConfig[status];

    // Handle mouse move during resize
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing) return;
        e.preventDefault();
        const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX));
        setSidebarWidth(newWidth);
    }, [isResizing]);

    // Handle mouse up to stop resizing
    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
    }, []);

    // Add/remove event listeners for resize
    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        } else {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);

    const startResizing = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden bg-[var(--background)]">
            {/* Prevent iframe interference during resize */}
            {isResizing && (
                <style>{`
                    iframe { pointer-events: none !important; }
                `}</style>
            )}

            {/* Top Header Bar */}
            <header className="h-14 border-b border-[var(--border-subtle)] flex items-center justify-between px-4 bg-[var(--background)]">
                {/* Left: Project Info */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">✦</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <h1 className="font-semibold text-[var(--foreground)]">{projectName}</h1>
                        <span className={`px-2 py-0.5 text-xs rounded-full text-white ${currentStatus.color}`}>
                            {currentStatus.label}
                        </span>
                    </div>
                </div>

                {/* Center: Preview/Code Toggle */}
                <div className="flex items-center gap-1 pill-container px-1 py-1">
                    <button
                        onClick={() => setViewMode('preview')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${viewMode === 'preview'
                            ? 'bg-[var(--foreground)] text-white'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)]'
                            }`}
                    >
                        Preview
                    </button>
                    <button
                        onClick={() => setViewMode('code')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${viewMode === 'code'
                            ? 'bg-[var(--foreground)] text-white'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)]'
                            }`}
                    >
                        Code
                    </button>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    <button className="text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                    </button>
                    <button className="px-4 py-1.5 text-sm font-medium rounded-full bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity">
                        Publish
                    </button>
                </div>
            </header>

            {/* Main Content: Sidebar + Canvas */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar (The "Brain") */}
                <motion.aside
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col bg-[var(--background-secondary)] border-r border-[var(--border-subtle)] relative"
                    style={{ width: sidebarWidth, minWidth: MIN_WIDTH, maxWidth: MAX_WIDTH }}
                >
                    {sidebar}

                    {/* Resize Handle */}
                    <div
                        onMouseDown={startResizing}
                        onDoubleClick={() => setSidebarWidth(360)} // Double-click to reset
                        className="absolute top-0 -right-2 w-4 h-full cursor-col-resize z-20 group flex items-center justify-center"
                    >
                        {/* Visual grab bar */}
                        <div
                            className={`w-1 h-full transition-all duration-150 flex items-center justify-center
                                ${isResizing
                                    ? 'bg-blue-500 w-1.5'
                                    : 'bg-transparent group-hover:bg-blue-400/60'
                                }`}
                        >
                            {/* Grip dots - visible on hover */}
                            <div className={`flex flex-col gap-1 transition-opacity duration-150
                                ${isResizing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                                <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                                <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                            </div>
                        </div>
                    </div>
                </motion.aside>

                {/* Right Canvas (The Preview or Code View) */}
                <main className="flex-1 bg-[var(--background)] overflow-hidden flex flex-col">
                    {viewMode === 'preview' ? canvas : (codeView || <CodeViewFallback />)}
                </main>
            </div>
        </div>
    );
}

// Simple fallback for when no code view is provided
function CodeViewFallback() {
    return (
        <div className="flex-1 flex items-center justify-center text-[var(--text-secondary)]">
            <p>Code view not available</p>
        </div>
    );
}

