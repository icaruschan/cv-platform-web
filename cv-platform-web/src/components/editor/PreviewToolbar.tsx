'use client';

import { motion } from 'framer-motion';

interface PreviewToolbarProps {
    onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
    currentDevice: 'desktop' | 'tablet' | 'mobile';
    onRefresh: () => void;
}

export default function PreviewToolbar({ onDeviceChange, currentDevice, onRefresh }: PreviewToolbarProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 bg-white/80 backdrop-blur-md border border-[var(--border-subtle)] rounded-full shadow-sm z-50 transition-all hover:shadow-md hover:bg-white"
        >
            <div className="flex items-center gap-1 border-r border-[var(--border-subtle)] pr-2 mr-1">
                <button
                    onClick={() => onDeviceChange('mobile')}
                    className={`p-1.5 rounded-full transition-colors ${currentDevice === 'mobile'
                            ? 'bg-[var(--background-secondary)] text-[var(--foreground)]'
                            : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                        }`}
                    title="Mobile View"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="7" y="4" width="10" height="16" rx="2" strokeWidth={2} />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17h.01" />
                    </svg>
                </button>
                <button
                    onClick={() => onDeviceChange('tablet')}
                    className={`p-1.5 rounded-full transition-colors ${currentDevice === 'tablet'
                            ? 'bg-[var(--background-secondary)] text-[var(--foreground)]'
                            : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                        }`}
                    title="Tablet View"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth={2} />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17h.01" />
                    </svg>
                </button>
                <button
                    onClick={() => onDeviceChange('desktop')}
                    className={`p-1.5 rounded-full transition-colors ${currentDevice === 'desktop'
                            ? 'bg-[var(--background-secondary)] text-[var(--foreground)]'
                            : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                        }`}
                    title="Desktop View"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth={2} />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21h8M12 17v4" />
                    </svg>
                </button>
            </div>

            <button
                onClick={onRefresh}
                className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors rounded-full hover:bg-[var(--background-secondary)]"
                title="Refresh Preview"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            </button>

            <button
                className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors rounded-full hover:bg-[var(--background-secondary)]"
                title="Open in New Tab"
                onClick={() => { /* TODO: Implement open in new tab logic */ }}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
            </button>
        </motion.div>
    );
}
