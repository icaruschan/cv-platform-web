import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const STATUS_MESSAGES: Record<string, { label: string; progress: number }> = {
    'draft': { label: 'Starting generation...', progress: 5 },
    'queued': { label: 'Queued for processing...', progress: 5 },
    'inspiration': { label: 'Finding design inspiration...', progress: 20 },
    'specs': { label: 'Writing technical specifications...', progress: 45 },
    'building': { label: 'Generating your portfolio code...', progress: 70 },
    'saving': { label: 'Saving your files...', progress: 90 },
    'ready': { label: 'Your portfolio is ready!', progress: 100 },
    'error': { label: 'Something went wrong', progress: 0 },
};

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Only select columns that definitely exist
        const { data: project, error } = await supabase
            .from('projects')
            .select('id, status, updated_at')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Status query error:', error);
            return NextResponse.json({ error: 'Project not found', details: error.message }, { status: 404 });
        }

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const statusInfo = STATUS_MESSAGES[project.status] || STATUS_MESSAGES['draft'];

        // Check if files exist to determine completion
        const { count: fileCount } = await supabase
            .from('files')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', id);

        const hasFiles = (fileCount || 0) > 0;
        const isComplete = project.status === 'ready' || (project.status === 'draft' && hasFiles);

        return NextResponse.json({
            projectId: project.id,
            status: project.status,
            message: statusInfo.label,
            progress: hasFiles ? 100 : statusInfo.progress,
            isComplete: isComplete,
            isError: project.status === 'error',
            hasFiles: hasFiles,
            fileCount: fileCount || 0,
            updatedAt: project.updated_at,
        });

    } catch (error: any) {
        console.error('Status check failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
