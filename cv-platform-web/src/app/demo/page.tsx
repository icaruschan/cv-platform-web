'use client';

import EditorLayout from '@/components/editor/EditorLayout';
import ChatSidebar from '@/components/editor/ChatSidebar';
import WaitingRoom from '@/components/editor/WaitingRoom';
import { FeedItem } from '@/components/editor/ProcessFeed';
import { SelectedElement } from '@/lib/visual-editing';
import { useState } from 'react';

// Mock data for demonstration
const mockMessages: FeedItem[] = [
    {
        id: 'thought-1',
        type: 'thought',
        content: 'Analyzing your brief...',
        duration: 8,
    },
    {
        id: 'ai-1',
        type: 'ai_message',
        content: `Building you an award-worthy portfolio with stunning animations! I'll create:\n\n1. **Hero** - Dramatic animated entrance with text reveal\n2. **About** - Parallax scroll effects\n3. **Projects** - Magnetic hover effects, staggered reveals\n4. **Skills** - Animated progress indicators\n5. **Contact** - Interactive form with micro-animations\n\nLet me set up the design system and install animation libraries first.`,
        toolsUsed: 4,
    },
    {
        id: 'action-1',
        type: 'action',
        content: 'Edited',
        actionType: 'edit',
        fileName: 'index.css',
    },
    {
        id: 'action-2',
        type: 'action',
        content: 'Generated image',
        actionType: 'generate',
        fileName: 'Abstract 3D gems...',
    },
    {
        id: 'thought-2',
        type: 'thought',
        content: 'Analyzed errors',
        duration: 45,
    },
    {
        id: 'action-3',
        type: 'action',
        content: 'Edited',
        actionType: 'edit',
        fileName: 'components/Hero.tsx',
    },
    {
        id: 'ai-2',
        type: 'ai_message',
        content: `Now let me enhance the design system for this award-worthy portfolio and create all the components.`,
        toolsUsed: 6,
    },
];

export default function DemoPage() {
    const [messages, setMessages] = useState<FeedItem[]>(mockMessages);
    const [isStreaming, setIsStreaming] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // Visual Editing Demo State
    const [visualEditMode, setVisualEditMode] = useState(false);
    const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);

    const handleSendMessage = async (message: string) => {
        // 1. Add User Message
        const userMsg: FeedItem = {
            id: `user-${Date.now()}`,
            type: 'user_message',
            content: message,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMsg]);
        setIsStreaming(true);

        // 2. Simulate AI Thinking Delay
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: `thought-${Date.now()}`,
                type: 'thought',
                content: 'Analyzing your request...',
                duration: 2
            }]);
        }, 1000);

        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: `action-${Date.now()}`,
                type: 'action',
                content: 'Updating content',
                actionType: 'edit',
                fileName: 'components/Hero.tsx'
            }]);
        }, 2500);

        // 3. Simulate AI Response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: `ai-${Date.now()}`,
                type: 'ai_message',
                content: selectedElement
                    ? `I've updated the <${selectedElement.tag}> element as you requested! The change has been applied.`
                    : "I've updated the Hero section as you requested! Since this is a demo, I can't actually modify the code, but you can see how the interface handles the interaction.\n\nReady to build the real thing?",
                toolsUsed: 1,
            }]);
            setIsStreaming(false);
            setSelectedElement(null); // Clear selection after response
        }, 4000);
    };

    const handleVisualEditToggle = (enabled: boolean) => {
        setVisualEditMode(enabled);
        if (!enabled) {
            setSelectedElement(null);
        }
        // In demo, simulate selecting an element when mode is enabled
        if (enabled) {
            setTimeout(() => {
                setSelectedElement({
                    tag: 'h1',
                    id: 'hero-title',
                    className: 'text-6xl font-bold',
                    textContent: 'Welcome to my Portfolio',
                    selectorPath: '#hero-title'
                });
            }, 2000);
        }
    };

    const handleClearSelection = () => {
        setSelectedElement(null);
    };

    const sidebarContent = (
        <ChatSidebar
            projectId="demo-project"
            messages={messages}
            isStreaming={isStreaming}
            onSendMessage={handleSendMessage}
            visualEditMode={visualEditMode}
            onVisualEditToggle={handleVisualEditToggle}
            selectedElement={selectedElement}
            onClearSelection={handleClearSelection}
        />
    );

    const canvasContent = showPreview ? (
        <div className="h-full w-full flex items-center justify-center bg-gray-900 text-white">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">Preview Area</h1>
                <p className="text-gray-400">Your generated site would appear here</p>
            </div>
        </div>
    ) : (
        <WaitingRoom
            status="loading"
            message="Demo mode - toggle Visual Edits to see the selection feature"
        />
    );

    return (
        <EditorLayout
            sidebar={sidebarContent}
            canvas={canvasContent}
            projectName="Portfolio Alchemy"
            status="ready"
        />
    );
}
