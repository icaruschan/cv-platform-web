'use client';

import React, { useState, useEffect } from 'react';
import {
    SandpackProvider,
    SandpackLayout,
    SandpackPreview,
    SandpackCodeEditor,
    useSandpack
} from '@codesandbox/sandpack-react';
import { Project, FileRecord, ChatMessage } from '@/lib/types';
import { PaperPlaneRight, Spinner, Code, Desktop, Warning, MagicWand } from '@phosphor-icons/react/dist/ssr';
import clsx from 'clsx';

// --- Inner Component (Has Access to Sandpack Context) ---
const EditorLayout = ({
    activeTab,
    setActiveTab,
    messages,
    loading,
    input,
    setInput,
    handleSend,
    onAutoFix
}: any) => {
    const { sandpack } = useSandpack();
    const [error, setError] = useState<string | null>(null);

    // simple error listener (mocked for MVP via console intercept or visual check)
    // Real sandpack error listening is complex, for MVP we'll assume if the preview falls back
    // For now, we will assume user reports errors OR we check if sandpack status is 'idle' vs 'error'

    // BETTER APPROACH FOR MVP:
    // We can't easily hook into the iframe's console error without a custom bundler.
    // BUT we can provide a manual "Fix Bug" button if the user sees red.

    // However, let's try to detect if we can find error overlay. 
    // Actually, Sandpack doesn't expose error state easily to the outside.

    // Plan B: "I'm Stuck" button that sends the current code + "Fix any build errors" prompt.

    return (
        <div className="flex-1 flex overflow-hidden">
            {/* Chat Sidebar */}
            <div className="w-80 border-r border-neutral-800 flex flex-col bg-neutral-900/50 backdrop-blur-sm">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((m: any, i: number) => (
                        <div key={i} className={clsx("text-sm p-3 rounded-lg max-w-[90%]",
                            m.role === 'user' ? "bg-blue-600 ml-auto text-white" : "bg-neutral-800 mr-auto text-neutral-200"
                        )}>
                            {m.content}
                        </div>
                    ))}
                    {loading && (
                        <div className="bg-neutral-800 mr-auto p-3 rounded-lg w-12 flex items-center justify-center">
                            <Spinner className="animate-spin text-neutral-400" />
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-neutral-800 bg-neutral-900 space-y-2">
                    <button
                        onClick={() => onAutoFix("Analyze the code for any build errors or runtime crashes and fix them immediately.")}
                        className="w-full bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs py-2 rounded flex items-center justify-center gap-2 transition"
                    >
                        <Warning className="w-4 h-4" />
                        Fix Crashes / Errors
                    </button>

                    <div className="relative">
                        <textarea
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-3 pr-10 py-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                            rows={2}
                            placeholder="Make the button bigger..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className="absolute right-2 bottom-2 p-1.5 hover:bg-neutral-700 rounded-full text-blue-500 disabled:opacity-50 transition"
                        >
                            <PaperPlaneRight weight="fill" className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Workspace */}
            <div className="flex-1 overflow-hidden relative">
                <SandpackLayout className="h-full">
                    <div className={clsx("h-full w-full", activeTab === 'code' ? "block" : "hidden")}>
                        <SandpackCodeEditor
                            showTabs
                            showLineNumbers
                            closableTabs
                            showInlineErrors
                            wrapContent
                            style={{ height: '100%' }}
                        />
                    </div>
                    <div className={clsx("h-full w-full", activeTab === 'preview' ? "block" : "hidden")}>
                        <SandpackPreview
                            showNavigator
                            showOpenInCodeSandbox={false}
                            style={{ height: '100%' }}
                        />
                    </div>
                </SandpackLayout>
            </div>
        </div>
    );
};

// --- Main Wrapper ---

interface EditorWrapperProps {
    project: Project;
    files: FileRecord[];
}

export default function EditorWrapper({ project, files: initialFiles }: EditorWrapperProps) {
    const [sandpackFiles, setSandpackFiles] = useState(() => {
        return initialFiles.reduce((acc, file) => {
            const path = file.path.startsWith('/') ? file.path : `/${file.path}`;
            acc[path] = file.content;
            return acc;
        }, {} as Record<string, string>);
    });

    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'assistant', content: "Hello! I built this site for you. How can we improve it? Try 'Make the background dark' or 'Add a contact form'." }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

    const handleSend = async (overridePrompt?: string) => {
        const promptText = overridePrompt || input;
        if (!promptText.trim() || loading) return;

        const userMsg: ChatMessage = { role: 'user', content: promptText };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg],
                    projectId: project.id,
                    currentFiles: sandpackFiles
                })
            });

            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);

            if (data.files && data.files.length > 0) {
                setSandpackFiles(prev => {
                    const newFiles = { ...prev };
                    data.files.forEach((f: any) => {
                        const path = f.path.startsWith('/') ? f.path : `/${f.path}`;
                        newFiles[path] = f.content;
                    });
                    return newFiles;
                });
            }

        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error updating your site." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-screen flex flex-col bg-neutral-950 text-white overflow-hidden">
            <header className="h-14 border-b border-neutral-800 flex items-center px-4 justify-between bg-neutral-900 z-10">
                <div className="flex items-center gap-4">
                    <h1 className="font-bold text-sm">Project: {project.id.slice(0, 8)}</h1>
                    <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded">Draft</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('code')}
                        className={clsx("px-3 py-1.5 text-xs rounded-md flex items-center gap-2 transition", activeTab === 'code' ? "bg-white text-black" : "bg-neutral-800 hover:bg-neutral-700")}
                    >
                        <Code weight="bold" /> Code
                    </button>
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={clsx("px-3 py-1.5 text-xs rounded-md flex items-center gap-2 transition", activeTab === 'preview' ? "bg-white text-black" : "bg-neutral-800 hover:bg-neutral-700")}
                    >
                        <Desktop weight="bold" /> Preview
                    </button>
                </div>
            </header>

            <SandpackProvider
                template="nextjs"
                theme="dark"
                files={sandpackFiles}
                options={{
                    externalResources: ["https://cdn.tailwindcss.com"],
                    classes: { "sp-layout": "h-full", "sp-wrapper": "h-full" }
                }}
                customSetup={{
                    dependencies: {
                        "framer-motion": "^12.0.0",
                        "lucide-react": "latest",
                        "clsx": "^2.0.0",
                        "tailwind-merge": "^2.0.0",
                        "@phosphor-icons/react": "^2.0.0"
                    }
                }}
            >
                <EditorLayout
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    messages={messages}
                    loading={loading}
                    input={input}
                    setInput={setInput}
                    handleSend={() => handleSend()}
                    onAutoFix={(msg: string) => handleSend(msg)}
                />
            </SandpackProvider>
        </div>
    );
}
