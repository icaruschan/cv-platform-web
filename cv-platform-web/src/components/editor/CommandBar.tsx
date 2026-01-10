'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SelectedElement } from '@/lib/visual-editing';

interface Suggestion {
    id: string;
    label: string;
    icon?: string;
    highlight?: boolean;
}

interface CommandBarProps {
    onSend: (message: string) => void;
    suggestions?: Suggestion[];
    placeholder?: string;
    disabled?: boolean;
    loading?: boolean;
    visualEditMode?: boolean;
    onVisualEditToggle?: (enabled: boolean) => void;
    selectedElement?: SelectedElement | null;
    onClearSelection?: () => void;
}

export default function CommandBar({
    onSend,
    suggestions = [],
    placeholder = "Ask anything...",
    disabled = false,
    loading = false,
    visualEditMode = false,
    onVisualEditToggle,
    selectedElement,
    onClearSelection,
}: CommandBarProps) {
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        if (input.trim() && !disabled && !loading) {
            onSend(input.trim());
            setInput('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        // Auto-resize
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
        }
    };

    const handleSuggestionClick = (suggestion: Suggestion) => {
        onSend(suggestion.label);
    };

    const handleVisualEditToggle = () => {
        onVisualEditToggle?.(!visualEditMode);
    };

    return (
        <div className="flex flex-col gap-3 w-full px-4 pb-4">
            {/* Selected Element Indicator */}
            <AnimatePresence>
                {selectedElement && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: 10, height: 0 }}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl"
                    >
                        <span className="text-blue-600 text-xs font-medium">Selected:</span>
                        <code className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-mono">
                            &lt;{selectedElement.tag}&gt;
                        </code>
                        {selectedElement.textContent && (
                            <span className="text-blue-600 text-xs truncate max-w-[120px]">
                                &quot;{selectedElement.textContent}&quot;
                            </span>
                        )}
                        <button
                            onClick={onClearSelection}
                            className="ml-auto p-1 text-blue-400 hover:text-blue-600 transition-colors"
                            title="Clear selection"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Suggestion Pills Row */}
            <AnimatePresence>
                {suggestions.length > 0 && !selectedElement && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
                    >
                        {suggestions.map((suggestion) => (
                            <button
                                key={suggestion.id}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className={`
                  flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium
                  border transition-all duration-200 hover-lift
                  ${suggestion.highlight
                                        ? 'bg-[var(--accent-primary)] text-white border-transparent'
                                        : 'bg-white text-[var(--text-secondary)] border-[var(--border-light)] hover:border-[var(--text-tertiary)]'
                                    }
                `}
                            >
                                {suggestion.icon && <span className="mr-1.5">{suggestion.icon}</span>}
                                {suggestion.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Input Container (The "Pill") */}
            <div className={`
        pill-container p-4 transition-shadow duration-200
        ${disabled ? 'opacity-60' : 'hover:shadow-md focus-within:shadow-md'}
      `}>
                {/* Text Area */}
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled || loading}
                    rows={1}
                    className="
            w-full bg-transparent outline-none text-[var(--foreground)] text-base
            resize-none min-h-[28px] max-h-[150px]
            placeholder:text-[var(--text-tertiary)]
          "
                />

                {/* Action Footer */}
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-[var(--border-subtle)]">
                    {/* Left Tools */}
                    <div className="flex items-center gap-2">
                        {/* Add Context Button */}
                        <button
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)] transition-colors"
                            title="Add context"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>

                        {/* Visual Edits Toggle */}
                        <button
                            onClick={handleVisualEditToggle}
                            className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                ${visualEditMode
                                    ? 'bg-[var(--accent-primary)] text-white'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)]'
                                }
              `}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                            </svg>
                            Visual edits
                        </button>
                    </div>

                    {/* Right Tools */}
                    <div className="flex items-center gap-2">
                        {/* Chat Mode Indicator */}
                        <span className="text-sm text-[var(--text-tertiary)] flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Chat
                        </span>

                        {/* Send Button */}
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || disabled || loading}
                            className={`
                w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200
                ${input.trim() && !disabled && !loading
                                    ? 'bg-[var(--foreground)] text-white hover:scale-105'
                                    : 'bg-[var(--border-light)] text-[var(--text-tertiary)] cursor-not-allowed'
                                }
              `}
                        >
                            {loading ? (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
