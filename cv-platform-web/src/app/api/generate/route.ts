import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Brief } from '@/lib/types';
import { Resend } from 'resend';
import OpenAI from 'openai';

export const maxDuration = 60; // Fast endpoint - 60 seconds max
export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123');

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "CV Platform",
    },
});

const FLASH_MODEL = process.env.GEMINI_FLASH_MODEL || "google/gemini-3-flash-preview";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        let brief = body.brief as Brief;

        // --- N8N / Flat Payload Handling ---
        if (!brief && body.briefContent) {
            console.log("🧩 Parsing raw n8n payload...");
            const rawContent = body.briefContent;

            const parseCompletion = await openai.chat.completions.create({
                model: FLASH_MODEL,
                messages: [
                    { role: "system", content: "You are a Data Parser. Convert the provided Markdown Product Brief into a strictly structured JSON object matching the TypeScript interface provided." },
                    {
                        role: "user", content: `
                        INTERFACE:
                        interface Brief {
                            id: string; // generate a random UUID
                            personal: { name: string; role: string; tagline: string; bio: string; location?: string; avatar_url?: string; email?: string; };
                            socials: Record<string, string>;
                            work: Array<{ title: string; role: string; description: string; link?: string; impact?: string; }>;
                            style: { vibe: string; likes?: string[]; dislikes?: string[]; };
                        }
                        
                        INPUT MARKDOWN:
                        ${rawContent}
                        
                        ADDITIONAL CONTEXT:
                        Name: ${body.name}
                        Vibe: ${body.vibe}
                        
                        RULES:
                        1. For 'style.vibe', prioritize the "Search Vibe" or "Visual Style" field from the Markdown if available.
                        2. If 'personal.email' is missing in markdown, use the context.

                        OUTPUT:
                        Return ONLY the JSON.
                    `}
                ],
                response_format: { type: "json_object" }
            });

            brief = JSON.parse(parseCompletion.choices[0].message.content || "{}");
            if (!brief.id) brief.id = crypto.randomUUID();
            if (body.email) brief.personal.email = body.email;
            if (body.vibe) brief.style.vibe = body.vibe;
        }

        if (!brief) {
            return NextResponse.json({ error: "No brief provided" }, { status: 400 });
        }

        console.log(`🚀 Orchestrator: Starting for ${brief.personal.name}`);

        // 1. Create Project Skeleton in DB
        const { data: project, error: dbError } = await supabase
            .from('projects')
            .insert({
                email: brief.personal.email || 'user@example.com',
                status: 'draft', // Use 'draft' to pass DB constraint, background processor will update
                vibe: {},
            })
            .select()
            .single();

        if (dbError || !project) {
            throw new Error(`DB Init Failed: ${dbError?.message}`);
        }

        const projectId = project.id;
        const magicLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/project/${projectId}?token=${project.magic_token}`;
        console.log(`🔗 Magic Link: ${magicLink}`);

        // 2. Trigger background processing (fire and forget)
        const processUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/generate/process`;

        // Use fetch with no-wait pattern for background processing
        fetch(processUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Internal-Secret': process.env.INTERNAL_API_SECRET || 'dev-secret'
            },
            body: JSON.stringify({ projectId, brief }),
        }).catch(err => {
            console.error('Background process trigger failed:', err);
        });

        console.log(`⏳ Background processing triggered for project ${projectId}`);

        // 3. Send Email Immediately
        if (brief.personal.email) {
            try {
                await resend.emails.send({
                    from: 'onboarding@resend.dev',
                    to: brief.personal.email,
                    subject: 'Your AI Portfolio is Being Built!',
                    html: `
                        <p>We're creating your portfolio now! This typically takes 2-3 minutes.</p>
                        <p><a href="${magicLink}">Click here to watch the progress</a></p>
                        <p>We'll update the page automatically when it's ready.</p>
                    `
                });
            } catch (emailError) {
                console.error("Email Failed:", emailError);
            }
        }

        // 4. Return immediately with magic link
        return NextResponse.json({
            success: true,
            projectId,
            magicLink,
            status: 'queued',
            message: "Your portfolio is being generated! Check the magic link to watch progress.",
        });

    } catch (error: any) {
        console.error("❌ Orchestrator Critical Failure:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
