'use client';

import { useState, useEffect, useCallback } from 'react';
import { SandpackProvider, SandpackPreview } from '@codesandbox/sandpack-react';
import CanvasArea from './CanvasArea';
import EditorLayout from './EditorLayout';
import ChatSidebar from './ChatSidebar';
import WaitingRoom from './WaitingRoom';
import { Project, FileRecord } from '@/lib/types';
import { FeedItem } from './ProcessFeed';
import { injectVisualEditing, SelectedElement } from '@/lib/visual-editing';

interface EditorPageProps {
    project: Project;
    files: FileRecord[];
}

interface StatusResponse {
    status: string;
    message: string;
    progress: number;
    isComplete: boolean;
    isError: boolean;
}

export default function EditorPage({ project, files: initialFiles }: EditorPageProps) {
    const [sandpackFiles, setSandpackFiles] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState<'draft' | 'generating' | 'ready' | 'error'>('draft');

    // Generation progress state (for async pipeline)
    const [generationStatus, setGenerationStatus] = useState<StatusResponse | null>(null);
    const [files, setFiles] = useState<FileRecord[]>(initialFiles);

    // Visual Editing State
    const [visualEditMode, setVisualEditMode] = useState(false);
    const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);

    // Chat State
    const [messages, setMessages] = useState<FeedItem[]>([
        {
            id: 'welcome',
            type: 'ai_message',
            content: `I built your portfolio. Here's what I included:\n\n• **Hero** - Animated entrance\n• **About** - Your story\n• **Projects** - Work showcase\n• **Contact** - Get in touch\n\nClick any element in the preview (toggle "Visual edits" first) or just type what you'd like to change!`,
            toolsUsed: 4,
        },
    ]);
    const [isStreaming, setIsStreaming] = useState(false);

    // Poll for status when files are empty (generation in progress)
    useEffect(() => {
        // Only poll if we have no files yet
        if (files && files.length > 0) {
            return;
        }

        const pollStatus = async () => {
            try {
                const response = await fetch(`/api/project/${project.id}/status`);
                if (!response.ok) return;

                const data: StatusResponse = await response.json();
                setGenerationStatus(data);

                // If generation is complete, fetch the files
                if (data.isComplete && !data.isError) {
                    const filesResponse = await fetch(`/api/project/${project.id}/files`);
                    if (filesResponse.ok) {
                        const filesData = await filesResponse.json();
                        if (filesData.files && filesData.files.length > 0) {
                            setFiles(filesData.files);
                        }
                    }
                }

                // Update status for UI
                if (data.isError) {
                    setStatus('error');
                } else if (data.isComplete) {
                    setStatus('ready');
                } else {
                    setStatus('generating');
                }
            } catch (error) {
                console.error('Status poll failed:', error);
            }
        };

        // Initial poll
        pollStatus();

        // Poll every 3 seconds
        const interval = setInterval(pollStatus, 3000);

        return () => clearInterval(interval);
    }, [project.id, files]);

    // Convert files to Sandpack format with Visual Editing injection
    useEffect(() => {
        if (files && files.length > 0) {
            const formattedFiles: Record<string, string> = {};
            files.forEach(f => {
                formattedFiles[f.path.startsWith('/') ? f.path : `/${f.path}`] = f.content;
            });

            // Hot-fix: Ensure _app.tsx has font imports if it uses them
            if (formattedFiles['/pages/_app.tsx']) {
                const appContent = formattedFiles['/pages/_app.tsx'];
                if ((appContent.includes('inter.') || appContent.includes('jetbrainsMono.')) &&
                    !appContent.includes('next/font/google')) {

                    const fontImports = `import { Inter, JetBrains_Mono } from 'next/font/google';\n\nconst inter = Inter({ subsets: ['latin'], variable: '--font-inter' });\nconst jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });\n`;

                    formattedFiles['/pages/_app.tsx'] = appContent.replace('// Configure fonts', fontImports)
                        .replace('import type { AppProps } from \'next/app\';', 'import type { AppProps } from \'next/app\';\n' + fontImports);
                }
            }

            setSandpackFiles(injectVisualEditing(formattedFiles) as Record<string, string>);
            setIsLoading(false);
            setStatus('ready');
        } else {
            setIsLoading(true);
        }
    }, [files]);

    // Listen for messages from the Sandpack iframe
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'ELEMENT_SELECTED') {
                const payload = event.data.payload as SelectedElement;
                setSelectedElement(payload);
                console.log('Element selected:', payload);
            } else if (event.data?.type === 'VISUAL_EDITING_READY') {
                const iframe = document.querySelector('iframe');
                if (iframe?.contentWindow) {
                    iframe.contentWindow.postMessage(
                        { type: 'VISUAL_EDITING_TOGGLE', enabled: visualEditMode },
                        '*'
                    );
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [visualEditMode]);

    // Send visual edit mode updates to the iframe
    useEffect(() => {
        const iframe = document.querySelector('iframe');
        if (iframe?.contentWindow) {
            iframe.contentWindow.postMessage(
                { type: 'VISUAL_EDITING_TOGGLE', enabled: visualEditMode },
                '*'
            );
        }
        if (!visualEditMode) {
            setSelectedElement(null);
        }
    }, [visualEditMode]);

    const handleSendMessage = async (message: string) => {
        const userMsg: FeedItem = {
            id: `user-${Date.now()}`,
            type: 'user_message',
            content: message,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMsg]);
        setIsStreaming(true);
        setStatus('generating');

        let selectionContext = '';
        if (selectedElement) {
            selectionContext = `\n\n[CONTEXT: User has selected a <${selectedElement.tag}> element${selectedElement.id ? ` with id="${selectedElement.id}"` : ''}${selectedElement.textContent ? ` containing text "${selectedElement.textContent}"` : ''}. Focus your changes on this specific element.]`;
        }

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: project.id,
                    messages: messages.map(m => ({
                        role: m.type === 'user_message' ? 'user' : 'assistant',
                        content: m.content
                    })).concat({ role: 'user', content: message + selectionContext }),
                    currentFiles: sandpackFiles,
                    selectionContext: selectedElement ? {
                        tag: selectedElement.tag,
                        id: selectedElement.id,
                        textContent: selectedElement.textContent,
                        selectorPath: selectedElement.selectorPath,
                    } : null,
                }),
            });

            if (!response.ok) throw new Error('Chat failed');

            const data = await response.json();

            const newFeedItems: FeedItem[] = [];

            if (data.thoughtSteps) {
                data.thoughtSteps.forEach((step: any) => {
                    if (step.type === 'thinking' || step.type === 'validating') {
                        newFeedItems.push({
                            id: step.id,
                            type: 'thought',
                            content: step.message,
                            duration: step.duration || 1
                        });
                    } else if (step.type === 'fixing') {
                        newFeedItems.push({
                            id: step.id,
                            type: 'action',
                            content: step.message,
                            actionType: 'fix'
                        });
                    } else if (step.type === 'generating') {
                        newFeedItems.push({
                            id: step.id,
                            type: 'action',
                            content: step.message,
                            actionType: 'generate'
                        });
                    }
                });
            }

            if (data.response) {
                newFeedItems.push({
                    id: `ai-${Date.now()}`,
                    type: 'ai_message',
                    content: data.response,
                    toolsUsed: data.filesChanged || 0,
                });
            }

            setMessages(prev => [...prev, ...newFeedItems]);

            if (data.files && Object.keys(data.files).length > 0) {
                setSandpackFiles(prev => {
                    const updated = { ...prev };
                    for (const [path, content] of Object.entries(data.files)) {
                        updated[path] = content as string;
                    }

                    // Hot-fix: Ensure _app.tsx has font imports if it uses them
                    if (updated['/pages/_app.tsx']) {
                        let appContent = updated['/pages/_app.tsx'];
                        if ((appContent.includes('inter.') || appContent.includes('jetbrainsMono.')) &&
                            !appContent.includes('next/font/google')) {

                            const fontImports = `import { Inter, JetBrains_Mono } from 'next/font/google';\n\nconst inter = Inter({ subsets: ['latin'], variable: '--font-inter' });\nconst jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });\n\n`;

                            // Try to insert after imports
                            const importRegex = /import\s+type\s+{\s*AppProps\s*}\s+from\s+['"]next\/app['"];?/;
                            if (importRegex.test(appContent)) {
                                appContent = appContent.replace(importRegex, (match) => `${match}\n${fontImports}`);
                            } else {
                                // Fallback: Prepend to top
                                appContent = fontImports + appContent;
                            }

                            updated['/pages/_app.tsx'] = appContent;
                        }
                    }

                    return injectVisualEditing(updated) as Record<string, string>;
                });
            }

            setSelectedElement(null);
            setStatus('ready');
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                id: `error-${Date.now()}`,
                type: 'error',
                content: 'Something went wrong. Please try again.'
            }]);
            setStatus('error');
        } finally {
            setIsStreaming(false);
        }
    };

    const handleClearSelection = useCallback(() => {
        setSelectedElement(null);
    }, []);

    // Sidebar Content
    const sidebarContent = (
        <ChatSidebar
            projectId={project.id}
            messages={messages}
            isStreaming={isStreaming}
            onSendMessage={handleSendMessage}
            visualEditMode={visualEditMode}
            onVisualEditToggle={setVisualEditMode}
            selectedElement={selectedElement}
            onClearSelection={handleClearSelection}
        />
    );

    // Canvas Content - Show progress when generating
    const canvasContent = isLoading ? (
        generationStatus && !generationStatus.isComplete ? (
            <WaitingRoom
                status="building"
                message={generationStatus.message}
                progress={generationStatus.progress}
            />
        ) : (
            <WaitingRoom status="loading" message="Loading your site..." />
        )
    ) : Object.keys(sandpackFiles).length === 0 ? (
        <WaitingRoom status="building" message="No files yet. Start a conversation!" />
    ) : (
        <SandpackProvider
            template="nextjs"
            files={sandpackFiles}
            options={{
                activeFile: '/pages/index.tsx',
                visibleFiles: Object.keys(sandpackFiles),
            }}
            theme="light"
            customSetup={{
                dependencies: {
                    "next": "14.2.4",
                    "react": "18.3.1",
                    "react-dom": "18.3.1",
                    "framer-motion": "^11.0.0",
                    "@phosphor-icons/react": "^2.0.0",
                    "clsx": "^2.0.0",
                    "tailwind-merge": "^2.0.0",
                    "lucide-react": "^0.263.0",
                    "eslint-config-next": "14.2.4"
                }
            }}
        >
            <div className="h-full w-full">
                <CanvasArea visualEditMode={visualEditMode} />
            </div>
        </SandpackProvider>
    );

    return (
        <EditorLayout
            sidebar={sidebarContent}
            canvas={canvasContent}
            projectName={`Project ${project.id.slice(0, 8)}`}
            status={status}
        />
    );
}
