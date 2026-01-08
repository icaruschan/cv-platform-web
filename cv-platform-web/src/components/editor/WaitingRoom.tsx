'use client';

import { motion } from 'framer-motion';

interface WaitingRoomProps {
    status?: 'loading' | 'building' | 'ready';
    message?: string;
    progress?: number; // 0-100
}

export default function WaitingRoom({
    status = 'loading',
    message = 'Getting ready...',
    progress,
}: WaitingRoomProps) {
    return (
        <div className="h-full w-full flex items-center justify-center bg-[var(--background)]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-6 max-w-md text-center px-8"
            >
                {/* Animated Logo/Spinner */}
                <motion.div
                    animate={{
                        rotate: status === 'loading' || status === 'building' ? 360 : 0,
                    }}
                    transition={{
                        duration: 2,
                        repeat: status === 'loading' || status === 'building' ? Infinity : 0,
                        ease: 'linear'
                    }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
                >
                    <span className="text-white text-2xl">✦</span>
                </motion.div>

                {/* Status Message */}
                <div className="flex flex-col items-center gap-3 w-full">
                    <div className="flex items-center gap-2">
                        {status !== 'ready' && (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="w-4 h-4 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full"
                            />
                        )}
                        <span className="text-[var(--text-secondary)] text-sm font-medium">
                            {message}
                        </span>
                    </div>

                    {/* Progress Bar */}
                    {typeof progress === 'number' && status === 'building' && (
                        <div className="w-full max-w-xs">
                            <div className="h-2 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                />
                            </div>
                            <div className="text-xs text-[var(--text-tertiary)] mt-1">
                                {progress}% complete
                            </div>
                        </div>
                    )}
                </div>

                {/* Feature Discovery Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="cream-card p-6 w-full space-y-4"
                >
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <h3 className="font-medium text-[var(--foreground)]">Powered by AI</h3>
                            <p className="text-sm text-[var(--text-secondary)]">
                                Your website is being crafted with intelligent design choices.
                            </p>
                        </div>
                    </div>

                    {/* Stage List */}
                    <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                        <StageItem
                            done={progress ? progress >= 20 : false}
                            active={progress ? progress >= 5 && progress < 20 : false}
                            label="Finding design inspiration"
                        />
                        <StageItem
                            done={progress ? progress >= 45 : false}
                            active={progress ? progress >= 20 && progress < 45 : false}
                            label="Writing specifications"
                        />
                        <StageItem
                            done={progress ? progress >= 70 : false}
                            active={progress ? progress >= 45 && progress < 70 : false}
                            label="Generating code"
                        />
                        <StageItem
                            done={progress ? progress >= 100 : false}
                            active={progress ? progress >= 70 && progress < 100 : false}
                            label="Final polish"
                        />
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}

function StageItem({ done, active, label }: { done: boolean; active?: boolean; label: string }) {
    return (
        <div className="flex items-center gap-2 text-sm">
            {done ? (
                <svg className="w-4 h-4 text-[var(--accent-success)]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
            ) : active ? (
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full"
                />
            ) : (
                <div className="w-4 h-4 rounded-full border-2 border-[var(--border-light)]" />
            )}
            <span className={done ? 'text-[var(--foreground)]' : active ? 'text-[var(--accent-primary)] font-medium' : 'text-[var(--text-tertiary)]'}>
                {label}
            </span>
        </div>
    );
}
