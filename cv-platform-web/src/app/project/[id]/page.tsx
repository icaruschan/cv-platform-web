import { supabase } from '@/lib/supabase';
import EditorPage from '@/components/editor/EditorPage';
import { Project, FileRecord } from '@/lib/types';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ token?: string }>;
}

export const dynamic = 'force-dynamic';

export default async function ProjectPage({ params, searchParams }: PageProps) {
    const { id } = await params;
    const { token } = await searchParams;

    console.log(`🔍 Loading Project: ${id}`);

    // 1. Fetch Project
    const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

    if (projectError || !project) {
        console.error("Project Load Error:", projectError);
        return notFound();
    }

    // 2. Fetch Files
    const { data: files, error: filesError } = await supabase
        .from('files')
        .select('*')
        .eq('project_id', id);

    if (filesError) {
        console.error("Files Load Error:", filesError);
        return <div>Error loading project files.</div>;
    }

    // 3. Token Enforcement — validate the session token against the database.
    // Without this, anyone who knows the project ID can edit the portfolio.
    if (!token) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-white">
                <div className="text-center space-y-3">
                    <div className="text-4xl">🔒</div>
                    <h1 className="text-xl font-semibold">Access Required</h1>
                    <p className="text-gray-400 text-sm">
                        Use the magic link from your email to access this project.
                    </p>
                    <a href="/recover" className="inline-block mt-4 text-sm text-violet-400 hover:text-violet-300 transition-colors">
                        Lost your link? Request a new one →
                    </a>
                </div>
            </div>
        );
    }

    const { data: session } = await supabase
        .from('sessions')
        .select('token, project_id')
        .eq('token', token)
        .eq('project_id', id)
        .single();

    if (!session) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-white">
                <div className="text-center space-y-3">
                    <div className="text-4xl">🔑</div>
                    <h1 className="text-xl font-semibold">Invalid or Expired Link</h1>
                    <p className="text-gray-400 text-sm max-w-xs">
                        This session link is invalid or has expired. Check your email for your original access link.
                    </p>
                    <a href="/recover" className="inline-block mt-4 text-sm text-violet-400 hover:text-violet-300 transition-colors">
                        Request a new access link →
                    </a>
                </div>
            </div>
        );
    }

    return (
        <EditorPage
            project={project as Project}
            files={files as FileRecord[]}
        />
    );
}
