'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SandpackPreview, useSandpack } from '@codesandbox/sandpack-react';
import { motion, AnimatePresence } from 'framer-motion';
import PreviewToolbar from './PreviewToolbar';

interface CanvasAreaProps {
    visualEditMode?: boolean;
}

export default function CanvasArea({ visualEditMode = false }: CanvasAreaProps) {
    const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const { sandpack } = useSandpack();
    const [key, setKey] = useState(0);

    const handleRefresh = () => {
        setKey(prev => prev + 1);
    };

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

    // Close fullscreen on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen]);

    const content = (
        <div className={`relative w-full h-full bg-[var(--background-secondary)] flex flex-col items-center justify-center overflow-hidden
            ${isFullscreen ? 'fixed inset-0 z-[100]' : ''}`}>

            <PreviewToolbar
                currentDevice={device}
                onDeviceChange={setDevice}
                onRefresh={handleRefresh}
                isFullscreen={isFullscreen}
                onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
                onOpenNewTab={() => { }}
            />

            {/* Visual Edit Mode Indicator */}
            <AnimatePresence>
                {visualEditMode && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`absolute left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-full shadow-lg z-50
                            ${isFullscreen ? 'top-20' : 'top-16'}`}
                    >
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        Click to select elements
                    </motion.div>
                )}
            </AnimatePresence>

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
                        } 
                        ${visualEditMode ? 'ring-2 ring-blue-500 ring-offset-4' : ''}`}
                >
                    {/* Notch for mobile/tablet */}
                    {device !== 'desktop' && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30%] h-5 bg-gray-900 rounded-b-xl z-20" />
                    )}

                    <div className="flex-1 w-full h-full relative">
                        <SandpackPreview
                            key={key}
                            showNavigator={device === 'desktop' && !isFullscreen}
                            showRefreshButton={false}
                            showOpenInCodeSandbox={false}
                            style={{
                                height: '100%',
                                width: '100%',
                                minHeight: '100%',
                                backgroundColor: 'white'
                            }}
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );

    if (isFullscreen) {
        return createPortal(content, document.body);
    }

    return content;
}
