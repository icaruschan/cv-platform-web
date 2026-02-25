'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { motion } from 'framer-motion';
import TopUpModal from './TopUpModal';

interface EditorLayoutProps {
    sidebar: ReactNode;
    canvas: ReactNode;
    codeView?: ReactNode;
    projectName?: string;
    status?: 'draft' | 'generating' | 'ready' | 'error' | 'publishing';
    onPublish?: (slug?: string) => void;
    isPublishing?: boolean;
    editsRemaining?: number;
    isUpgradeModalOpen?: boolean;
    onOpenUpgradeModal?: () => void;
    onCloseUpgradeModal?: () => void;
    onUpgrade?: () => void; // Called when user confirms the purchase in the TopUpModal
    isPremium?: boolean;   // Premium users get unlimited edits (no credit deduction)
}

export default function EditorLayout({
    sidebar,
    canvas,
    codeView,
    projectName = 'Untitled Project',
    status = 'draft',
    onPublish,
    isPublishing = false,
    editsRemaining,
    isUpgradeModalOpen = false,
    onOpenUpgradeModal,
    onCloseUpgradeModal,
    onUpgrade,
    isPremium = false,
}: EditorLayoutProps) {
    const [sidebarWidth, setSidebarWidth] = useState(360);
    const [isResizing, setIsResizing] = useState(false);
    const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
    const [darkMode, setDarkMode] = useState(false);

    // Publish Modal State
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [publishSlug, setPublishSlug] = useState('');

    // Initialize dark mode from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('editor-dark-mode');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = stored ? stored === 'true' : prefersDark;
        setDarkMode(shouldBeDark);
        document.documentElement.classList.toggle('dark', shouldBeDark);
    }, []);

    // Toggle dark mode
    const toggleDarkMode = () => {
        const newValue = !darkMode;
        setDarkMode(newValue);
        document.documentElement.classList.toggle('dark', newValue);
        localStorage.setItem('editor-dark-mode', String(newValue));
    };

    const MIN_WIDTH = 280;
    const MAX_WIDTH = 600;

    const statusConfig = {
        draft: { label: 'Draft', color: 'bg-gray-400' },
        generating: { label: 'Generating...', color: 'bg-blue-500 animate-pulse' },
        ready: { label: 'Ready', color: 'bg-green-500' },
        error: { label: 'Error', color: 'bg-red-500' },
        publishing: { label: 'Publishing...', color: 'bg-purple-500 animate-pulse' },
    };

    const currentStatus = statusConfig[status] || statusConfig.draft;

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
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${darkMode ? 'from-orange-400 to-orange-600' : 'from-orange-500 to-orange-600'}`}>
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
                <div className="flex items-center gap-1 bg-[var(--background-tertiary)] px-1 py-1 rounded-full border border-[var(--border-subtle)]">
                    <button
                        onClick={() => setViewMode('preview')}
                        className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${viewMode === 'preview'
                            ? 'bg-[var(--background)] text-[var(--foreground)] shadow-sm'
                            : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                            }`}
                    >
                        {viewMode === 'preview' && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />}
                        Preview
                    </button>
                    <button
                        onClick={() => setViewMode('code')}
                        className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${viewMode === 'code'
                            ? 'bg-[var(--background)] text-[var(--foreground)] shadow-sm'
                            : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                            }`}
                    >
                        {viewMode === 'code' && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />}
                        Code
                    </button>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)] transition-colors"
                        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {darkMode ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>

                    <button
                        onClick={() => setIsPublishModalOpen(true)}
                        disabled={isPublishing}
                        className={`px-4 py-1.5 text-sm font-medium rounded-full bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity ${isPublishing ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isPublishing ? 'Publishing...' : 'Publish'}
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

            {/* Publish Modal */}
            {isPublishModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[var(--background)] border border-[var(--border-subtle)] rounded-xl shadow-2xl p-6 w-full max-w-md"
                    >
                        <h2 className="text-xl font-bold mb-2 text-[var(--foreground)]">Publish to Vercel</h2>
                        <p className="text-sm text-[var(--text-secondary)] mb-6">
                            Choose a unique name for your portfolio. It will be hosted at <code className="bg-[var(--background-secondary)] px-1 py-0.5 rounded">name.vercel.app</code>
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
                                    Project Name <span className="text-[var(--text-tertiary)]">(Optional)</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder={`cv-${projectName.toLowerCase().substring(0, 8)}`}
                                        value={publishSlug}
                                        onChange={(e) => setPublishSlug(e.target.value)}
                                        className="flex-1 bg-[var(--background-secondary)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--accent-primary)] outline-none"
                                    />
                                    <span className="text-sm text-[var(--text-tertiary)]">.vercel.app</span>
                                </div>
                                <p className="text-xs text-[var(--text-tertiary)] mt-1 ml-1">
                                    Lowercase letters, numbers, and hyphens only.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    onClick={() => setIsPublishModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        onPublish?.(publishSlug);
                                        setIsPublishModalOpen(false);
                                    }}
                                    className={`px-6 py-2 text-sm font-bold rounded-lg bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity shadow-lg ${darkMode ? 'shadow-orange-500/20' : 'shadow-orange-600/20'}`}
                                >
                                    🚀 Deploy Now
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* TopUp Modal */}
            <TopUpModal
                isOpen={isUpgradeModalOpen}
                onClose={() => onCloseUpgradeModal?.()}
            />
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
