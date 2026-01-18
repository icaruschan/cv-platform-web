'use client';

import { useState, useMemo, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileCode,
    FileCss,
    FileJs,
    FileTs,
    FileHtml,
    Folder,
    FolderOpen,
    CaretRight,
    CaretDown,
    FileText
} from '@phosphor-icons/react';

interface CodeViewProps {
    files: Record<string, string>;
}

// Tree node type
interface TreeNode {
    name: string;
    path: string;
    isFolder: boolean;
    children: TreeNode[];
}

// Helper for file icons
const getFileIcon = (filename: string, size = 16) => {
    if (filename.endsWith('.css')) return <FileCss size={size} className="text-blue-400" />;
    if (filename.endsWith('.html')) return <FileHtml size={size} className="text-orange-400" />;
    if (filename.endsWith('.ts') && !filename.endsWith('.tsx')) return <FileTs size={size} className="text-blue-500" />;
    if (filename.endsWith('.tsx')) return <FileTs size={size} className="text-blue-500" />;
    if (filename.endsWith('.js') || filename.endsWith('.jsx')) return <FileJs size={size} className="text-yellow-400" />;
    if (filename.endsWith('.md')) return <FileText size={size} className="text-gray-400" />;
    if (filename.endsWith('.json')) return <FileCode size={size} className="text-yellow-600" />;
    return <FileCode size={size} className="text-gray-400" />;
};

// Helper for language detection
const getLanguage = (path: string) => {
    if (path.endsWith('.css')) return 'css';
    if (path.endsWith('.html')) return 'html';
    if (path.endsWith('.ts') || path.endsWith('.tsx')) return 'typescript';
    if (path.endsWith('.js') || path.endsWith('.jsx')) return 'javascript';
    if (path.endsWith('.json')) return 'json';
    if (path.endsWith('.md')) return 'markdown';
    return 'plaintext';
};

// Build tree from flat file paths
function buildFileTree(files: Record<string, string>): TreeNode[] {
    const root: TreeNode[] = [];

    Object.keys(files).forEach(filePath => {
        // Remove leading slash if present
        const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
        const parts = cleanPath.split('/');

        let currentLevel = root;
        let currentPath = '';

        parts.forEach((part, index) => {
            currentPath = currentPath ? `${currentPath}/${part}` : part;
            const isFolder = index < parts.length - 1;

            // Check if this node already exists
            let existingNode = currentLevel.find(n => n.name === part);

            if (!existingNode) {
                existingNode = {
                    name: part,
                    path: '/' + currentPath,
                    isFolder,
                    children: []
                };
                currentLevel.push(existingNode);
            }

            currentLevel = existingNode.children;
        });
    });

    // Sort: folders first, then alphabetically
    const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.sort((a, b) => {
            if (a.isFolder && !b.isFolder) return -1;
            if (!a.isFolder && b.isFolder) return 1;
            return a.name.localeCompare(b.name);
        }).map(node => ({
            ...node,
            children: sortNodes(node.children)
        }));
    };

    return sortNodes(root);
}

// Recursive tree item component
function TreeItem({
    node,
    selectedFile,
    onSelectFile,
    expandedFolders,
    onToggleFolder,
    depth = 0
}: {
    node: TreeNode;
    selectedFile: string;
    onSelectFile: (path: string) => void;
    expandedFolders: Set<string>;
    onToggleFolder: (path: string) => void;
    depth?: number;
}) {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedFile === node.path;
    const paddingLeft = 12 + depth * 16;

    if (node.isFolder) {
        return (
            <div>
                <button
                    onClick={() => onToggleFolder(node.path)}
                    className="w-full flex items-center gap-1.5 py-1 text-[13px] text-[#cccccc] hover:bg-[#2a2d2e] transition-colors"
                    style={{ paddingLeft }}
                >
                    <span className="flex-shrink-0 text-[#858585]">
                        {isExpanded ? <CaretDown size={12} /> : <CaretRight size={12} />}
                    </span>
                    <span className="flex-shrink-0">
                        {isExpanded
                            ? <FolderOpen size={16} className="text-yellow-500" weight="fill" />
                            : <Folder size={16} className="text-yellow-500" weight="fill" />
                        }
                    </span>
                    <span className="truncate">{node.name}</span>
                </button>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            {node.children.map(child => (
                                <TreeItem
                                    key={child.path}
                                    node={child}
                                    selectedFile={selectedFile}
                                    onSelectFile={onSelectFile}
                                    expandedFolders={expandedFolders}
                                    onToggleFolder={onToggleFolder}
                                    depth={depth + 1}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <button
            onClick={() => onSelectFile(node.path)}
            className={`w-full flex items-center gap-1.5 py-1 text-[13px] transition-colors
                ${isSelected
                    ? 'bg-[#37373d] text-white'
                    : 'text-[#cccccc] hover:bg-[#2a2d2e]'
                }`}
            style={{ paddingLeft: paddingLeft + 16 }}
        >
            <span className="flex-shrink-0 opacity-80">
                {getFileIcon(node.name)}
            </span>
            <span className="truncate">{node.name}</span>
        </button>
    );
}

export default function CodeView({ files }: CodeViewProps) {
    const [selectedFile, setSelectedFile] = useState<string>('');
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    // Build hierarchical tree from flat file list
    const fileTree = useMemo(() => buildFileTree(files), [files]);

    // Auto-expand folders containing App.tsx or index.tsx on first load
    useEffect(() => {
        const initialExpanded = new Set<string>();

        // Find and expand folders containing common entry files
        const findAndExpand = (nodes: TreeNode[], path: string = '') => {
            nodes.forEach(node => {
                if (node.isFolder) {
                    // Check if any child is an important file
                    const hasImportant = node.children.some(c =>
                        !c.isFolder && (c.name === 'App.tsx' || c.name === 'index.tsx')
                    );
                    if (hasImportant || node.name === 'components') {
                        initialExpanded.add(node.path);
                    }
                    findAndExpand(node.children, node.path);
                }
            });
        };

        findAndExpand(fileTree);
        setExpandedFolders(initialExpanded);

        // Select first non-folder file
        const findFirstFile = (nodes: TreeNode[]): string | null => {
            for (const node of nodes) {
                if (!node.isFolder) return node.path;
                const found = findFirstFile(node.children);
                if (found) return found;
            }
            return null;
        };

        if (!selectedFile || !files[selectedFile]) {
            const first = findFirstFile(fileTree);
            if (first) setSelectedFile(first);
        }
    }, [fileTree, files, selectedFile]);

    const toggleFolder = (path: string) => {
        setExpandedFolders(prev => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    };

    return (
        <div className="flex w-full h-full bg-[#1e1e1e] overflow-hidden text-[#cccccc] font-sans">
            {/* Sidebar: File Explorer */}
            <div className="w-56 flex-shrink-0 flex flex-col border-r border-[#333] bg-[#252526]">
                <div className="h-9 px-3 flex items-center text-[11px] font-semibold text-[#bbbbbb] uppercase tracking-wider bg-[#252526]">
                    File explorer
                </div>

                <div className="flex-1 overflow-y-auto py-1">
                    {fileTree.map(node => (
                        <TreeItem
                            key={node.path}
                            node={node}
                            selectedFile={selectedFile}
                            onSelectFile={setSelectedFile}
                            expandedFolders={expandedFolders}
                            onToggleFolder={toggleFolder}
                        />
                    ))}
                </div>
            </div>

            {/* Main Area: Editor */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
                {/* Editor Tabs */}
                <div className="flex bg-[#2d2d2d] h-9 overflow-x-auto border-b border-[#252526]">
                    {selectedFile && (
                        <div className="flex items-center gap-2 px-3 bg-[#1e1e1e] text-white text-[13px] border-t-2 border-[#007fd4] min-w-[120px]">
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
                                readOnly: true,
                                scrollbar: {
                                    vertical: 'visible',
                                    horizontal: 'visible',
                                    useShadows: false,
                                    verticalScrollbarSize: 10,
                                    horizontalScrollbarSize: 10
                                },
                                overviewRulerBorder: false,
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
