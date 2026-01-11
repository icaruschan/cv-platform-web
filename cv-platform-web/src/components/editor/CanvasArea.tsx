'use client';

import { useState } from 'react';
import { SandpackPreview, useSandpack } from '@codesandbox/sandpack-react';
import { motion, AnimatePresence } from 'framer-motion';
import PreviewToolbar from './PreviewToolbar';

interface CanvasAreaProps {
    visualEditMode?: boolean;
}

export default function CanvasArea({ visualEditMode = false }: CanvasAreaProps) {
    const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const { sandpack } = useSandpack();
    const [key, setKey] = useState(0);

    const handleRefresh = () => {
        setKey(prev => prev + 1);
    };

    const getWidth = () => {
        switch (device) {
            case 'mobile': return '375px';
            case 'tablet': return '768px';
            default: return '100%';
        }
    };

    return (
        <div className="relative w-full h-full bg-[var(--background-secondary)] flex flex-col items-center justify-center overflow-hidden">

            <PreviewToolbar
                currentDevice={device}
                onDeviceChange={setDevice}
                onRefresh={handleRefresh}
            />

            {/* Visual Edit Mode Indicator */}
            <AnimatePresence>
                {visualEditMode && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-16 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-full shadow-lg z-50"
                    >
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        Click to select elements
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex-1 w-full flex items-center justify-center p-8 overflow-auto">
                <motion.div
                    layout
                    initial={false}
                    animate={{
                        width: getWidth(),
                        height: device === 'desktop' ? '100%' : '90%',
                        opacity: 1
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                    className={`relative bg-white shadow-2xl overflow-hidden flex flex-col ${device !== 'desktop' ? 'rounded-[2rem] border-8 border-gray-900' : 'rounded-xl border border-[var(--border-subtle)]'
                        } ${visualEditMode ? 'ring-2 ring-blue-500 ring-offset-4' : ''}`}
                >
                    {device !== 'desktop' && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-gray-900 rounded-b-xl z-20" />
                    )}

                    <div className="flex-1 w-full h-full relative">
                        <SandpackPreview
                            key={key}
                            showNavigator={device === 'desktop'}
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
}
