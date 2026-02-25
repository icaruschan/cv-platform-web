import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "CV Platform",
    },
});

const FLASH_MODEL = process.env.GEMINI_FLASH_MODEL || "google/gemini-3-flash-preview";

/**
 * POST /api/polish
 *
 * AI polish endpoint that transforms raw form text into portfolio-ready copy.
 * Accepts { bio, vibe, tagline, role } and returns polished versions.
 *
 * Replaces the 2 heavy AI calls from the n8n workflow with a single
 * Gemini Flash call.
 */
export async function POST(request: Request) {
    try {
        const { bio, vibe, tagline, role } = await request.json();

        if (!bio && !vibe && !tagline) {
            return NextResponse.json({ error: 'Nothing to polish' }, { status: 400 });
        }

        const completion = await openai.chat.completions.create({
            model: FLASH_MODEL,
            messages: [
                {
                    role: "system",
                    content: `You are a professional portfolio content strategist. Your job is to polish raw form responses into compelling portfolio copy.

## RULES
1. **Bio**: If under 100 characters, expand into 2-3 professional sentences written in third person. Keep the original voice and facts — never invent details. Fix grammar/spelling.
2. **Tagline**: Make it punchy, memorable, and under 80 characters. If missing or generic, craft one that captures their role and unique angle.
3. **Vibe/Style**: If it matches a known preset (Minimal, Dark, Bold, Corporate, Typography, Glassmorphism), return it unchanged. If user-customized, polish for clarity while keeping design intent.
4. NEVER change core meaning or facts. NEVER add fictional information.
5. Return ONLY a valid JSON object with keys: bio, vibe, tagline.`
                },
                {
                    role: "user",
                    content: `Polish the following portfolio text. Return JSON with keys: bio, vibe, tagline.

ROLE: ${role || '(not provided)'}
BIO: ${bio || '(none)'}
TAGLINE: ${tagline || '(none)'}
VISUAL STYLE: ${vibe || '(none)'}

Return ONLY the JSON.`
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.3, // Low creativity — polishing, not rewriting
        });

        const result = JSON.parse(completion.choices[0].message.content || '{}');

        return NextResponse.json({
            bio: result.bio || bio,
            vibe: result.vibe || vibe,
            tagline: result.tagline || tagline,
        });
    } catch (error: any) {
        console.error('Polish API error:', error);
        // Graceful fallback — return originals
        return NextResponse.json(
            { error: 'Polish failed', message: error.message },
            { status: 500 }
        );
    }
}
