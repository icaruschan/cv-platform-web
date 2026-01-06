import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ChatRequest, ChatResponse } from '@/lib/types';
import { MOTION_SYSTEM_PROMPT, TECHNICAL_CONSTRAINTS_PROMPT } from '@/lib/agents/system-prompts';

export const maxDuration = 120; // 2 minutes
export const dynamic = 'force-dynamic';

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

const GEMINI_MODEL = process.env.GEMINI_FLASH_MODEL || "google/gemini-3-flash-preview";

export async function POST(request: Request) {
    try {
        const { messages, currentFiles } = await request.json() as ChatRequest;

        const systemPrompt = `You are the AI Editor for a Portfolio Builder.
You have full access to the source code. Your job is to EDIT the code based on user requests.

## CONTEXT
The site is built with Next.js 14, Tailwind CSS, and Framer Motion.
It uses a specific "Motion System" for animations.

## STRICT RULES
1. **Output Format**:
   - First, write a brief, friendly explanation of what you are doing.
   - Then, output the CHANGED files using this format:
     ### FILE: [path]
     [full new content of the file]
   - You MUST output the FULL content of the file you are editing. Do not use diffs.

2. **Constraints**:
   - Do NOT break the build.
   - Do NOT remove 'use client' if it exists.
   - Do NOT invent new libraries. Use what is installed (Lucide/Phosphor, Framer Motion).
   
${TECHNICAL_CONSTRAINTS_PROMPT}

${MOTION_SYSTEM_PROMPT}
`;

        // Create a context summary of existing files (to avoid stuffing too much)
        // For Gemini Flash 1M context, we can actually stuff A LOT.
        // Let's dump the relevant file names, and maybe the full content of 'active' usage.
        // For MVP, we'll dump specific key files or simply rely on the user "currentFiles" payload being manageable.
        // Sandpack usually has < 20 files.
        const codeContext = Object.entries(currentFiles)
            .map(([path, content]) => `### FILE: ${path}\n${content}`)
            .join('\n\n');

        const fullContextMessage = `
## CURRENT CODEBASE STATE
${codeContext}

## USER REQUEST
${messages[messages.length - 1].content}
`;

        const response = await openai.chat.completions.create({
            model: GEMINI_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                ...messages.slice(0, -1), // History
                { role: "user", content: fullContextMessage } // Latest with context
            ],
            temperature: 0.2, // Low temp for code stability
        });

        const reply = response.choices[0].message.content || "";

        // Parse Output
        const updates: Array<{ path: string, content: string }> = [];
        const lines = reply.split('\n');
        let currentFile: string | null = null;
        let currentContent: string[] = [];
        let naturalMessage = [];

        // Simple parser
        for (const line of lines) {
            if (line.trim().startsWith('### FILE:')) {
                if (currentFile) {
                    updates.push({ path: currentFile, content: currentContent.join('\n').trim() });
                }
                currentFile = line.replace('### FILE:', '').trim();
                currentContent = [];
            } else {
                if (currentFile) {
                    currentContent.push(line);
                } else {
                    naturalMessage.push(line);
                }
            }
        }
        if (currentFile) {
            updates.push({ path: currentFile, content: currentContent.join('\n').trim() });
        }

        return NextResponse.json({
            message: naturalMessage.join('\n').trim(),
            files: updates
        } as ChatResponse);

    } catch (error: any) {
        console.error("Chat API Error:", error);
        return NextResponse.json({ message: "Error processing request", files: [] }, { status: 500 });
    }
}
