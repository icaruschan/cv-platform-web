'use client';

import { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface EditorLayoutProps {
    sidebar: ReactNode;
    canvas: ReactNode;
    projectName?: string;
    status?: 'draft' | 'generating' | 'ready' | 'error';
}

export default function EditorLayout({
    sidebar,
    canvas,
    projectName = 'Untitled Project',
    status = 'draft'
}: EditorLayoutProps) {
    const [sidebarWidth] = useState(320);

    const statusConfig = {
        draft: { label: 'Draft', color: 'bg-gray-400' },
        generating: { label: 'Generating...', color: 'bg-blue-500 animate-pulse' },
        ready: { label: 'Ready', color: 'bg-green-500' },
        error: { label: 'Error', color: 'bg-red-500' },
    };

    const currentStatus = statusConfig[status];

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden bg-[var(--background)]">
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

                {/* Center: Preview Controls (Placeholder) */}
                <div className="flex items-center gap-1 pill-container px-1 py-1">
                    <button className="px-4 py-1.5 text-sm font-medium rounded-full bg-[var(--foreground)] text-white">
                        Preview
                    </button>
                    <button className="px-4 py-1.5 text-sm font-medium rounded-full text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)] transition-colors">
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
                    className="flex flex-col bg-[var(--background-secondary)] border-r border-[var(--border-subtle)]"
                    style={{ width: sidebarWidth, minWidth: 320, maxWidth: 500 }}
                >
                    {sidebar}
                </motion.aside>

                {/* Right Canvas (The Preview) */}
                <main className="flex-1 bg-[var(--background)] overflow-hidden">
                    {canvas}
                </main>
            </div>
        </div>
    );
}
