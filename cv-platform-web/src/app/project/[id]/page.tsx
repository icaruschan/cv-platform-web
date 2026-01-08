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

    // 3. Security Check (Optional V1)
    // If we wanted to enforce token:
    // if (project.magic_token !== token) return <div>Unauthorized</div>;

    return (
        <EditorPage
            project={project as Project}
            files={files as FileRecord[]}
        />
    );
}
