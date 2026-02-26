'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { OnboardingData } from './types';

interface LayoutProps {
    currentStep: number;
    totalSteps: number;
    children: React.ReactNode;
    onBack: () => void;
    showBack: boolean;
    formData: OnboardingData;
    leftPanelContent: React.ReactNode;
}

export const OnboardingLayout: React.FC<LayoutProps> = ({
    currentStep,
    totalSteps,
    children,
    onBack,
    showBack,
    leftPanelContent
}) => {
    const progress = Math.min(((currentStep) / totalSteps) * 100, 100);

    return (
        <div className="min-h-screen w-full flex bg-white font-sans">

            {/* Left Side - Visual Panel */}
            <div className="hidden lg:flex w-5/12 h-screen sticky top-0 bg-[#faf9f7] items-center justify-center overflow-hidden relative">
                {/* Logo */}
                <motion.div
                    className="absolute top-8 left-8 z-20"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.3 }}
                >
                    <img src="/logo.svg" alt="Portfolio Alchemy" className="h-10 w-auto" />
                </motion.div>

                <motion.div
                    className="absolute bottom-8 left-8 z-20 border-l-4 border-orange-400 pl-4 max-w-xs"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.6 }}
                >
                    <p className="text-neutral-600 text-sm italic font-medium leading-relaxed">
                        &quot;Your story is what sets you apart. Make it memorable.&quot;
                    </p>
                </motion.div>

                {/* The Main Visual Content — animated externally in page.tsx */}
                <div className="w-full h-full p-12 relative z-10 flex items-center justify-center">
                    {leftPanelContent}
                </div>

                {/* Decorative blurs */}
                <motion.div
                    className="absolute top-0 right-0 w-64 h-64 bg-white/40 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
                    transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute bottom-0 left-0 w-64 h-64 bg-orange-100/30 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut', delay: 2 }}
                />
            </div>

            {/* Right Side - Form Interaction */}
            <div className="w-full lg:w-7/12 flex flex-col min-h-screen relative bg-white">

                {/* Progress Header */}
                <div className="px-8 md:px-16 pt-12 pb-6 max-w-3xl mx-auto w-full">
                    <div className="flex justify-between items-end mb-4 text-xs font-bold tracking-widest text-gray-400 uppercase">
                        <motion.span
                            key={currentStep}
                            className="text-gray-900"
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        >
                            Step {currentStep} of {totalSteps}
                        </motion.span>
                        <motion.button
                            className="hover:text-orange-600 transition-colors flex items-center gap-1 group"
                            whileHover={{ x: 2 }}
                        >
                            Save & Exit
                            <span className="text-lg leading-none transition-transform group-hover:translate-x-1">→</span>
                        </motion.button>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                            className="bg-orange-500 h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ type: 'spring', stiffness: 100, damping: 20, mass: 0.5 }}
                            style={{ boxShadow: '0 0 12px rgba(249,115,22,0.4)' }}
                        />
                    </div>
                </div>

                {/* Back Button */}
                <div className="px-8 md:px-16 pt-2 max-w-3xl mx-auto w-full h-8">
                    <motion.button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors group"
                        initial={false}
                        animate={{
                            opacity: showBack ? 1 : 0,
                            x: showBack ? 0 : -10,
                            pointerEvents: showBack ? 'auto' as const : 'none' as const,
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        whileHover={{ x: -3 }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-medium text-sm">Back</span>
                    </motion.button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 px-8 md:px-16 max-w-3xl mx-auto w-full pb-12 flex flex-col justify-center z-10">
                    {children}
                </div>

                {/* Mobile Header */}
                <div className="lg:hidden fixed top-0 left-0 w-full bg-white border-b border-gray-100 p-4 z-50 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-neutral-900 rounded flex items-center justify-center">
                            <span className="text-white font-bold text-xs">P</span>
                        </div>
                        <span className="font-bold text-gray-900">Portfoli</span>
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Step {currentStep}/{totalSteps}</span>
                </div>
            </div>
        </div>
    );
};
