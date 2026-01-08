'use client';

import { useEffect, useRef } from 'react';
import ProcessFeed, { FeedItem } from './ProcessFeed';
import CommandBar from './CommandBar';
import { SelectedElement } from '@/lib/visual-editing';

interface ChatSidebarProps {
    projectId: string;
    messages: FeedItem[];
    isStreaming?: boolean;
    onSendMessage: (message: string) => void;
    visualEditMode?: boolean;
    onVisualEditToggle?: (enabled: boolean) => void;
    selectedElement?: SelectedElement | null;
    onClearSelection?: () => void;
}

export default function ChatSidebar({
    projectId,
    messages,
    isStreaming = false,
    onSendMessage,
    visualEditMode = false,
    onVisualEditToggle,
    selectedElement,
    onClearSelection,
}: ChatSidebarProps) {
    const feedEndRef = useRef<HTMLDivElement>(null);

    // Default suggestions
    const suggestions = [
        { id: '1', label: 'Add dark mode', icon: '🌙' },
        { id: '2', label: 'Make hero bigger', icon: '📐' },
        { id: '3', label: 'Add animations', icon: '✨', highlight: true },
    ];

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (message: string) => {
        onSendMessage(message);
    };

    return (
        <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="flex-shrink-0 px-4 py-3 border-b border-[var(--border-subtle)]">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-tertiary)]">
                        {new Date().toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                        })}
                    </span>
                    <button className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Message Stream */}
            <ProcessFeed items={messages} isStreaming={isStreaming} />
            <div ref={feedEndRef} />

            {/* Command Input */}
            <div className="flex-shrink-0">
                <CommandBar
                    onSend={handleSend}
                    suggestions={suggestions}
                    placeholder={selectedElement ? `Edit the ${selectedElement.tag}...` : "Ask anything..."}
                    loading={isStreaming}
                    visualEditMode={visualEditMode}
                    onVisualEditToggle={onVisualEditToggle}
                    selectedElement={selectedElement}
                    onClearSelection={onClearSelection}
                />
            </div>
        </div>
    );
}
