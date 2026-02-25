import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Vercel API Configuration
const VERCEL_API_URL = 'https://api.vercel.com';
const VERCEL_TOKEN = process.env.VERCEL_API_TOKEN || process.env.VERCEL_TOKEN; // Support both names
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID; // Optional

export const maxDuration = 60; // Allow 60s for deployment kickoff

export async function POST(request: Request) {
    try {
        if (!VERCEL_TOKEN) {
            throw new Error('Server misconfiguration: Missing VERCEL_API_TOKEN env var');
        }

        const body = await request.json();
        const { projectId, slug } = body;

        if (!projectId) {
            return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
        }

        console.log(`🚀 Publishing Project: ${projectId}`);

        // 1. Fetch Project Details
        const { data: project, error: projError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();

        if (projError || !project) {
            throw new Error(`Project not found: ${projError?.message}`);
        }

        // 2. Fetch All Files
        const { data: files, error: filesError } = await supabase
            .from('files')
            .select('path, content')
            .eq('project_id', projectId);

        if (filesError) {
            throw new Error(`Failed to fetch files: ${filesError.message}`);
        }

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files to deploy' }, { status: 400 });
        }

        // 3. Construct Vercel File Payload
        const vercelFiles = files.map(f => ({
            file: f.path.startsWith('/') ? f.path.substring(1) : f.path, // Remove leading slash
            data: f.content
        }));

        // 4. Create/Get Vercel Project
        let projectName = `cv-${projectId.substring(0, 8)}`; // Default

        if (slug) {
            // Sanitize slug: lowercase, alphanumeric + hyphens only
            const sanitized = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
            if (sanitized.length > 3) {
                projectName = sanitized;
            }
        }

        // 5. Trigger Deployment
        // Note: Generated portfolios are React + Vite (static HTML/JS/CSS).
        // We omit 'framework' so Vercel treats this as a raw static file deployment,
        // which is correct — there is no build step needed, files are pre-compiled by the AI.
        const deployPayload = {
            name: projectName,
            files: vercelFiles,
            target: 'production' // Deploy straight to prod URL
        };

        const teamQuery = VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : '';
        const deployUrl = `${VERCEL_API_URL}/v13/deployments${teamQuery}`;

        console.log(`📤 Sending to Vercel: ${deployUrl}`);

        const deployRes = await fetch(deployUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${VERCEL_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(deployPayload)
        });

        const deployData = await deployRes.json();

        if (!deployRes.ok) {
            console.error('Vercel Logic Error:', deployData);
            throw new Error(`Vercel API Error: ${deployData.error?.message || 'Unknown error'}`);
        }

        console.log(`✅ Deployment Queued: ${deployData.url}`);

        // 6. Update Project Status in Supabase
        await supabase
            .from('projects')
            .update({
                status: 'published',
                domain: `https://${deployData.alias?.[0] || deployData.url}` // Prefer alias if available
            })
            .eq('id', projectId);

        return NextResponse.json({
            success: true,
            url: `https://${deployData.alias?.[0] || deployData.url}`,
            deploymentIds: deployData.id,
            dashboardUrl: deployData.inspectorUrl
        });

    } catch (error: any) {
        console.error('❌ Publish Failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
