'use client';

interface CodeViewProps {
    files: Record<string, string>;
}

export default function CodeView({ files }: CodeViewProps) {
    const fileEntries = Object.entries(files).filter(([path]) =>
        path.endsWith('.tsx') || path.endsWith('.ts') || path.endsWith('.css')
    );

    if (fileEntries.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center text-[var(--text-secondary)]">
                <p>No files to display</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-auto bg-[#1e1e1e] text-white font-mono text-sm">
            {fileEntries.map(([path, content]) => (
                <div key={path} className="border-b border-[#333]">
                    <div className="sticky top-0 bg-[#2d2d2d] px-4 py-2 text-xs text-[#888] border-b border-[#333]">
                        {path}
                    </div>
                    <pre className="p-4 overflow-x-auto whitespace-pre-wrap">
                        <code>{content}</code>
                    </pre>
                </div>
            ))}
        </div>
    );
}
