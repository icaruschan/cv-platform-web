import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Brief } from '@/lib/types';
import { createSession } from '@/lib/session';
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

// CORS headers for the onboarding app (may run on a different origin)
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': process.env.ONBOARDING_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
    return NextResponse.json(null, { headers: CORS_HEADERS });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        let brief = body.brief as Brief;
        const checkoutId = body.checkout_id as string | undefined;

        // ─── Payment Validation Gate ───────────────────────────────
        // Native flow: The checkout_id is passed from the onboarding form.
        // We check if it's already been consumed in the used_checkouts table.
        // This replaces the 4-step n8n Polar validation chain.
        if (checkoutId) {
            const { data: existing } = await supabase
                .from('used_checkouts')
                .select('checkout_id')
                .eq('checkout_id', checkoutId)
                .maybeSingle();

            if (existing) {
                return NextResponse.json(
                    { error: 'This payment has already been used to generate a portfolio.' },
                    { status: 402, headers: CORS_HEADERS }
                );
            }

            // Mark the checkout as consumed immediately to prevent race conditions
            const { error: insertError } = await supabase
                .from('used_checkouts')
                .insert({
                    checkout_id: checkoutId,
                    email: brief?.personal?.email || body.email || null,
                });

            if (insertError) {
                console.error('Failed to mark checkout as used:', insertError);
                // Don't block — the check above already prevents double-use
            }
        }
        // If no checkout_id is provided, we allow the request through
        // (for internal/admin/testing calls via n8n or direct API)
        // ─────────────────────────────────────────────────────────────

        // --- N8N / Flat Payload Handling (Legacy) ---
        if (!brief && body.briefContent) {
            console.log("🧩 Parsing raw n8n payload (legacy path)...");
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
            return NextResponse.json(
                { error: "No brief provided" },
                { status: 400, headers: CORS_HEADERS }
            );
        }

        console.log(`🚀 Orchestrator: Starting for ${brief.personal.name}`);

        // 1. Create Project Skeleton in DB
        const { data: project, error: dbError } = await supabase
            .from('projects')
            .insert({
                email: brief.personal.email || 'user@example.com',
                status: 'draft',
                vibe: {},
            })
            .select()
            .single();

        if (dbError || !project) {
            throw new Error(`DB Init Failed: ${dbError?.message}`);
        }

        const projectId = project.id;

        // Create a session for this user
        const session = await createSession(projectId);
        const tokenToUse = session?.token || project.magic_token;

        const magicLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/project/${projectId}?token=${tokenToUse}`;
        console.log(`🔗 Magic Link: ${magicLink}`);

        // 2. Trigger background processing (fire and forget)
        const processUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/generate/process`;

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
                    from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
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
            sessionToken: tokenToUse,
            status: 'queued',
            message: "Your portfolio is being generated! Check the magic link to watch progress.",
        }, { headers: CORS_HEADERS });

    } catch (error: any) {
        console.error("❌ Orchestrator Critical Failure:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500, headers: CORS_HEADERS }
        );
    }
}
