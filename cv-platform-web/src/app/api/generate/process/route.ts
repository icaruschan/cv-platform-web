import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateMoodboard } from '@/lib/agents/inspiration';
import { generateSpecs } from '@/lib/agents/spec';
import { generateSite } from '@/lib/agents/builder';
import { Brief } from '@/lib/types';

export const maxDuration = 300; // This endpoint does the heavy lifting
export const dynamic = 'force-dynamic';

// Simple internal auth to prevent external calls
function validateInternalRequest(request: Request): boolean {
    const secret = request.headers.get('X-Internal-Secret');
    const expectedSecret = process.env.INTERNAL_API_SECRET || 'dev-secret';
    return secret === expectedSecret;
}

async function updateProjectStatus(projectId: string, status: string, message?: string) {
    console.log(`   📊 Status Update: ${status}${message ? ` - ${message}` : ''}`);

    const updateData: any = { status };
    // Note: status_message column doesn't exist in DB, messages are handled by status endpoint map
    // if (message) {
    //    updateData.status_message = message;
    // }
    updateData.updated_at = new Date().toISOString();

    await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId);
}

export async function POST(request: Request) {
    // Verify this is an internal call
    if (!validateInternalRequest(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { projectId, brief } = await request.json() as { projectId: string; brief: Brief };

        if (!projectId || !brief) {
            return NextResponse.json({ error: 'Missing projectId or brief' }, { status: 400 });
        }

        console.log(`🏗️ Background Processor V2: Starting for project ${projectId}`);

        // Stage 1: Inspiration Agent (Full Pipeline with web scraping + vision analysis)
        await updateProjectStatus(projectId, 'inspiration', 'Gathering design inspiration...');
        const moodboard = await generateMoodboard(brief); // Full Tavily + Firecrawl + Vision pipeline

        // Save moodboard to project
        await supabase
            .from('projects')
            .update({ vibe: moodboard as any })
            .eq('id', projectId);

        // Stage 2: Specs
        await updateProjectStatus(projectId, 'specs', 'Writing technical specifications...');
        const specsFiles = await generateSpecs(brief, moodboard);

        // Stage 3: Building
        await updateProjectStatus(projectId, 'building', 'Generating your portfolio code...');
        const builderResult = await generateSite(brief, moodboard, specsFiles);

        // Stage 4: Save Files
        await updateProjectStatus(projectId, 'saving', 'Saving your files...');
        const allFiles = [...specsFiles, ...builderResult.files];

        const { error: uploadError } = await supabase.from('files').insert(
            allFiles.map(f => ({
                project_id: projectId,
                path: f.path,
                content: f.content
            }))
        );

        if (uploadError) {
            console.error("File Upload Failed:", uploadError);
            await updateProjectStatus(projectId, 'error', 'Failed to save files');
            return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
        }

        // Stage 5: Complete!
        await updateProjectStatus(projectId, 'ready', 'Your portfolio is ready!');

        console.log(`✅ Background Processor: Complete for project ${projectId}`);

        return NextResponse.json({
            success: true,
            projectId,
            fileCount: allFiles.length,
            message: 'Portfolio generation complete!'
        });

    } catch (error: any) {
        console.error("❌ Background Processor Failed:", error);

        // Try to update project status to error
        try {
            const body = await request.clone().json();
            if (body.projectId) {
                await updateProjectStatus(body.projectId, 'error', error.message || 'Generation failed');
            }
        } catch { /* ignore */ }

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
