'use client';

import { useState, useMemo, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
    FileCode,
    FileCss,
    FileJs,
    FileTs,
    FileHtml,
    File
} from '@phosphor-icons/react';

interface CodeViewProps {
    files: Record<string, string>;
}

// Helper for file icons
const getFileIcon = (filename: string) => {
    if (filename.endsWith('.css')) return <FileCss size={16} className="text-blue-400" />;
    if (filename.endsWith('.html')) return <FileHtml size={16} className="text-orange-400" />;
    if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return <FileTs size={16} className="text-blue-500" />;
    if (filename.endsWith('.js') || filename.endsWith('.jsx')) return <FileJs size={16} className="text-yellow-400" />;
    return <FileCode size={16} className="text-gray-400" />;
};

// Helper for language detection
const getLanguage = (path: string) => {
    if (path.endsWith('.css')) return 'css';
    if (path.endsWith('.html')) return 'html';
    if (path.endsWith('.ts') || path.endsWith('.tsx')) return 'typescript';
    if (path.endsWith('.js') || path.endsWith('.jsx')) return 'javascript';
    if (path.endsWith('.json')) return 'json';
    return 'plaintext';
};

export default function CodeView({ files }: CodeViewProps) {
    // Sort files: App.tsx or index.tsx top, then alphabetical
    const sortedFiles = useMemo(() => {
        return Object.keys(files).sort((a, b) => {
            const priority = ['/App.tsx', '/index.tsx', '/styles.css'];
            const idxA = priority.indexOf(a);
            const idxB = priority.indexOf(b);

            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;

            return a.localeCompare(b);
        });
    }, [files]);

    const [selectedFile, setSelectedFile] = useState<string>('');

    // Select first file on load or if selection becomes invalid
    useEffect(() => {
        if (!selectedFile || !files[selectedFile]) {
            if (sortedFiles.length > 0) {
                setSelectedFile(sortedFiles[0]);
            }
        }
    }, [sortedFiles, selectedFile, files]);

    return (
        <div className="flex w-full h-full bg-[#1e1e1e] overflow-hidden text-[#cccccc] font-sans">
            {/* Sidebar: File Explorer */}
            <div className="w-64 flex-shrink-0 flex flex-col border-r border-[#333] bg-[#252526]">
                <div className="h-9 px-4 flex items-center text-[11px] font-bold text-[#bbbbbb] uppercase tracking-wider bg-[#252526]">
                    Explorer
                </div>

                <div className="flex-1 overflow-y-auto py-2">
                    {sortedFiles.map(path => {
                        const filename = path.split('/').pop() || path;
                        const isSelected = selectedFile === path;

                        return (
                            <button
                                key={path}
                                onClick={() => setSelectedFile(path)}
                                className={`w-full flex items-center gap-2 px-3 py-1 text-[13px] transition-colors border-l-2
                                    ${isSelected
                                        ? 'bg-[#37373d] text-white border-[#007fd4]'
                                        : 'border-transparent hover:bg-[#2a2d2e] hover:text-white'
                                    }`}
                            >
                                <span className="flex-shrink-0 opacity-80">
                                    {getFileIcon(path)}
                                </span>
                                <span className="truncate">{filename}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Area: Editor */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
                {/* Editor Tabs (Visual Only for now) */}
                <div className="flex bg-[#2d2d2d] h-9 overflow-x-auto scrollbar-hide">
                    {selectedFile && (
                        <div className="flex items-center gap-2 px-3 bg-[#1e1e1e] text-white text-[13px] border-t border-[#007fd4] min-w-[120px]">
                            <span className="opacity-80">{getFileIcon(selectedFile)}</span>
                            <span className="truncate">{selectedFile.split('/').pop()}</span>
                        </div>
                    )}
                </div>

                {/* Monaco Editor */}
                <div className="flex-1 relative">
                    {selectedFile && files[selectedFile] ? (
                        <Editor
                            height="100%"
                            theme="vs-dark"
                            path={selectedFile}
                            defaultLanguage={getLanguage(selectedFile)}
                            value={files[selectedFile]}
                            options={{
                                minimap: { enabled: true, renderCharacters: false },
                                fontSize: 14,
                                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                                fontLigatures: true,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                padding: { top: 16, bottom: 16 },
                                tabSize: 2,
                                renderLineHighlight: 'all',
                                contextmenu: true,
                                scrollbar: {
                                    vertical: 'visible',
                                    horizontal: 'visible',
                                    useShadows: false,
                                    verticalScrollbarSize: 10,
                                    horizontalScrollbarSize: 10
                                },
                                overviewRulerBorder: false,
                                hideCursorInOverviewRuler: true,
                            }}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-[#666]">
                            <p>Select a file to view code</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
