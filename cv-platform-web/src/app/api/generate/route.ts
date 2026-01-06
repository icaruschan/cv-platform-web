import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateMoodboard } from '@/lib/agents/inspiration';
import { generateSpecs } from '@/lib/agents/spec';
import { generateSite } from '@/lib/agents/builder';
import { Brief } from '@/lib/types';
import { Resend } from 'resend';
import OpenAI from 'openai';

export const maxDuration = 300; // 5 minutes timeout
export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123'); // Fallback for build time

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
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

            // Use AI to structure the raw markdown into our Brief interface
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
                        1. For 'style.vibe', prioritize the "Search Vibe" or "Visual Style" field from the Markdown if available. It should be a short, search-ready phrase (e.g. "Sleek Animated Portfolio").
                        2. If 'personal.email' is missing in markdown, use the context.

                        OUTPUT:
                        Return ONLY the JSON.
                    `}
                ],
                response_format: { type: "json_object" }
            });

            brief = JSON.parse(parseCompletion.choices[0].message.content || "{}");
            // Ensure ID exists
            if (!brief.id) brief.id = crypto.randomUUID();
            // Fail-safes from direct payload
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
                status: 'draft',
                vibe: {}, // Initial placeholders
            })
            .select()
            .single();

        if (dbError || !project) {
            throw new Error(`DB Init Failed: ${dbError?.message}`);
        }

        const projectId = project.id;
        const magicLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/project/${projectId}?token=${project.magic_token}`;
        console.log(`🔗 Magic Link: ${magicLink}`);

        // 2. Run Agents
        // A. Inspiration
        const moodboard = await generateMoodboard(brief);

        // Update DB with vibe
        await supabase.from('projects').update({ vibe: moodboard as any }).eq('id', projectId);

        // B. Specs (Architect)
        const specsFiles = await generateSpecs(brief, moodboard);

        // C. Builder (Constructor) - pass the full specs array
        const codeFiles = await generateSite(brief, moodboard, specsFiles);

        // 3. Save EVERYTHING to Supabase
        const allFiles = [...specsFiles, ...codeFiles];

        const { error: uploadError } = await supabase.from('files').insert(
            allFiles.map(f => ({
                project_id: projectId,
                path: f.path,
                content: f.content
            }))
        );

        if (uploadError) {
            console.error("File Upload Failed:", uploadError);
            // Don't fail the whole request, we might have partial success
        }

        // 4. Send Email
        if (brief.personal.email) {
            try {
                await resend.emails.send({
                    from: 'onboarding@resend.dev', // Use your verified domain in prod
                    to: brief.personal.email,
                    subject: 'Your AI Portfolio is Ready (Draft)',
                    html: `<p>Your site is ready for review.</p><a href="${magicLink}">Click here to open Editor</a>`
                });
            } catch (emailError) {
                console.error("Email Failed:", emailError);
            }
        }

        return NextResponse.json({
            success: true,
            projectId,
            magicLink,
            fileCount: allFiles.length,
            message: "Draft Created. Check email or use link."
        });

    } catch (error: any) {
        console.error("❌ Orchestrator Critical Failure:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
