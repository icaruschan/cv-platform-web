import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { data: files, error } = await supabase
            .from('files')
            .select('id, path, content, updated_at')
            .eq('project_id', id)
            .order('path');

        if (error) {
            console.error('Files fetch error:', error);
            return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
        }

        return NextResponse.json({
            projectId: id,
            files: files || [],
            count: files?.length || 0,
        });

    } catch (error: any) {
        console.error('Files endpoint error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
