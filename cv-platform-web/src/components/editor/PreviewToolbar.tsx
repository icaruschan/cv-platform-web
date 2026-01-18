'use client';

import { motion } from 'framer-motion';
import {
    DeviceMobile,
    DeviceTablet,
    Monitor,
    ArrowsOutSimple,
    ArrowsInSimple,
    ArrowClockwise,
    ArrowSquareOut
} from '@phosphor-icons/react';

interface PreviewToolbarProps {
    onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
    currentDevice: 'desktop' | 'tablet' | 'mobile';
    onRefresh: () => void;
    isFullscreen: boolean;
    onFullscreenToggle: () => void;
    onOpenNewTab: () => void;
}

export default function PreviewToolbar({
    onDeviceChange,
    currentDevice,
    onRefresh,
    isFullscreen,
    onFullscreenToggle,
    onOpenNewTab
}: PreviewToolbarProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-2 p-1.5 bg-white/90 backdrop-blur-md border border-[var(--border-subtle)] rounded-full shadow-sm z-50 transition-all hover:shadow-md 
                ${isFullscreen ? 'fixed bottom-6 left-1/2 -translate-x-1/2' : 'absolute bottom-6 left-1/2 -translate-x-1/2'}`}
        >
            {/* Device Selector Group */}
            <div className="flex items-center gap-1 border-r border-[var(--border-subtle)] pr-2 mr-1">
                <span className="text-xs font-medium text-[var(--text-tertiary)] px-2">Device</span>

                <button
                    onClick={() => onDeviceChange('mobile')}
                    className={`p-1.5 rounded-full transition-colors ${currentDevice === 'mobile'
                        ? 'bg-[var(--background-secondary)] text-[var(--foreground)]'
                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                        }`}
                    title="Mobile"
                >
                    <DeviceMobile size={18} weight={currentDevice === 'mobile' ? "fill" : "regular"} />
                </button>
                <button
                    onClick={() => onDeviceChange('tablet')}
                    className={`p-1.5 rounded-full transition-colors ${currentDevice === 'tablet'
                        ? 'bg-[var(--background-secondary)] text-[var(--foreground)]'
                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                        }`}
                    title="Tablet"
                >
                    <DeviceTablet size={18} weight={currentDevice === 'tablet' ? "fill" : "regular"} />
                </button>
                <button
                    onClick={() => onDeviceChange('desktop')}
                    className={`p-1.5 rounded-full transition-colors ${currentDevice === 'desktop'
                        ? 'bg-[var(--background-secondary)] text-[var(--foreground)]'
                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                        }`}
                    title="Desktop"
                >
                    <Monitor size={18} weight={currentDevice === 'desktop' ? "fill" : "regular"} />
                </button>
            </div>

            {/* Actions Group */}
            <div className="flex items-center gap-1">
                <button
                    onClick={onRefresh}
                    className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors rounded-full hover:bg-[var(--background-secondary)]"
                    title="Refresh Preview"
                >
                    <ArrowClockwise size={18} />
                </button>

                <button
                    onClick={onFullscreenToggle}
                    className={`p-1.5 transition-colors rounded-full hover:bg-[var(--background-secondary)] ${isFullscreen ? 'text-blue-500 bg-blue-50' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                        }`}
                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                    {isFullscreen ? <ArrowsInSimple size={18} /> : <ArrowsOutSimple size={18} />}
                </button>

                <button
                    className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors rounded-full hover:bg-[var(--background-secondary)]"
                    title="Open in New Tab"
                    onClick={onOpenNewTab}
                >
                    <ArrowSquareOut size={18} />
                </button>
            </div>
        </motion.div>
    );
}
