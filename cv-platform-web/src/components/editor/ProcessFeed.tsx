'use client';

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useState, useEffect } from 'react';

// ============================================
// TYPES
// ============================================

export type FeedItemType =
    | 'user_message'
    | 'ai_message'
    | 'thought'
    | 'action'
    | 'error';

export interface FeedItem {
    id: string;
    type: FeedItemType;
    content: string;
    timestamp?: Date;
    // For 'thought' type
    duration?: number;
    expanded?: boolean;
    // For 'action' type
    actionType?: 'edit' | 'generate' | 'fix' | 'analyze';
    fileName?: string;
    // For 'ai_message' with tools
    toolsUsed?: number;
}

interface ProcessFeedProps {
    items: FeedItem[];
    isStreaming?: boolean;
}

// ============================================
// SUB-COMPONENTS
// ============================================

const messageVariants: Variants = {
    hidden: { opacity: 0, y: 10, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: { duration: 0.2 }
    }
};

function UserMessage({ content }: { content: string }) {
    return (
        <motion.div
            variants={messageVariants}
            className="flex justify-end"
        >
            <div className="max-w-[85%] bg-[var(--background)] border border-[var(--border-light)] rounded-2xl rounded-br-md px-4 py-3 shadow-sm">
                <p className="text-[var(--foreground)] text-sm whitespace-pre-wrap">{content}</p>
            </div>
        </motion.div>
    );
}

function TypewriterEffect({ text }: { text: string }) {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            setDisplayedText((prev) => {
                if (index < text.length) {
                    index++;
                    return text.substring(0, index);
                }
                clearInterval(interval);
                return prev;
            });
        }, 15); // Speed of typing

        return () => clearInterval(interval);
    }, [text]);

    return <span>{displayedText}</span>;
}

function AIMessage({ content, toolsUsed, isNew = false }: { content: string; toolsUsed?: number; isNew?: boolean }) {
    const [showTools, setShowTools] = useState(false);

    return (
        <motion.div variants={messageVariants} className="flex flex-col gap-2">
            <div className="text-[var(--foreground)] text-sm whitespace-pre-wrap leading-relaxed">
                {isNew ? <TypewriterEffect text={content} /> : content}
            </div>
            {toolsUsed && toolsUsed > 0 && (
                <button
                    onClick={() => setShowTools(!showTools)}
                    className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors w-fit"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    {toolsUsed} tools used
                    <svg className={`w-3 h-3 transition-transform ${showTools ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            )}
        </motion.div>
    );
}

function ThoughtAccordion({ content, duration }: { content: string; duration?: number }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <motion.button
            variants={messageVariants}
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors py-1 w-full text-left group"
        >
            <div className="w-4 h-4 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 animate-pulse text-[var(--accent-primary)]" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" opacity="0.2" />
                    <circle cx="12" cy="12" r="4" />
                </svg>
            </div>
            <span>Thought for {duration || '?'}s</span>
            <div className="flex-1 h-px bg-[var(--border-subtle)] opacity-0 group-hover:opacity-100 transition-opacity" />
            <svg className={`w-3 h-3 transition-transform text-[var(--text-tertiary)] ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </motion.button>
    );
}

function ActionChip({ actionType, fileName, content }: { actionType?: string; fileName?: string; content: string }) {
    const icons: Record<string, string> = {
        edit: '📝',
        generate: '🖼️',
        fix: '🔧',
        analyze: '🔍',
    };

    const icon = actionType ? icons[actionType] || '⚡' : '⚡';

    return (
        <motion.div variants={messageVariants} className="flex items-center gap-2 text-xs text-[var(--text-secondary)] py-1 pl-1">
            <span className="opacity-80 grayscale">{icon}</span>
            <span>{content}</span>
            {fileName && (
                <code className="px-1.5 py-0.5 bg-[var(--background-tertiary)] border border-[var(--border-subtle)] rounded text-[10px] font-mono text-[var(--text-secondary)]">
                    {fileName}
                </code>
            )}
        </motion.div>
    );
}

function ErrorMessage({ content }: { content: string }) {
    return (
        <motion.div variants={messageVariants} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg shadow-sm">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700">{content}</p>
        </motion.div>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ProcessFeed({ items, isStreaming }: ProcessFeedProps) {
    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-4">
            <AnimatePresence mode="popLayout" initial={false}>
                {items.map((item, index) => {
                    // Only apply typewriter to the very last AI message and only if we are currently not streaming (meaning it just finished) 
                    // OR if we want it to type as it arrives. 
                    // Since we get the full block at once, let's type the last item if it's new.
                    const isLast = index === items.length - 1;

                    return (
                        <motion.div
                            layout
                            key={item.id}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={messageVariants}
                        >
                            {item.type === 'user_message' && (
                                <UserMessage content={item.content} />
                            )}
                            {item.type === 'ai_message' && (
                                <AIMessage content={item.content} toolsUsed={item.toolsUsed} isNew={isLast} />
                            )}
                            {item.type === 'thought' && (
                                <ThoughtAccordion content={item.content} duration={item.duration} />
                            )}
                            {item.type === 'action' && (
                                <ActionChip
                                    actionType={item.actionType}
                                    fileName={item.fileName}
                                    content={item.content}
                                />
                            )}
                            {item.type === 'error' && (
                                <ErrorMessage content={item.content} />
                            )}
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {/* Streaming Indicator */}
            {isStreaming && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]"
                >
                    <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    Working...
                </motion.div>
            )}
        </div>
    );
}
