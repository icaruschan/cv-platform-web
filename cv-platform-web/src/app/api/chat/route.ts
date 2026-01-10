import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ChatRequest, ChatResponse } from '@/lib/types';
import { MOTION_SYSTEM_PROMPT, TECHNICAL_CONSTRAINTS_PROMPT } from '@/lib/agents/system-prompts';
import { detectErrors, autoFixErrors, ThoughtStep, ValidationError } from '@/lib/agents/builder';

export const maxDuration = 120; // 2 minutes
export const dynamic = 'force-dynamic';

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

const GEMINI_MODEL = process.env.GEMINI_FLASH_MODEL || "google/gemini-pro";

export async function POST(request: Request) {
    const thoughtSteps: ThoughtStep[] = [];
    const startTime = Date.now();

    // Step 1: Thinking
    thoughtSteps.push({
        id: `chat-think-${Date.now()}`,
        type: 'thinking',
        message: 'Analyzing your request...',
        duration: 0,
    });

    try {
        const { messages, currentFiles } = await request.json() as ChatRequest;
        const userPrompt = messages[messages.length - 1].content;

        const systemPrompt = `You are the AI Editor for a Portfolio Builder.
You have full access to the source code. Your job is to EDIT the code based on user requests.

## CONTEXT
The site is built with Next.js 14 (Pages Router fallback), Tailwind CSS, and Framer Motion.
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
   - Do NOT use 'use client' (we are in Pages Router mode for Sandpack).
   - Do NOT invent new libraries. Use what is installed (Lucide/Phosphor, Framer Motion).
   
${TECHNICAL_CONSTRAINTS_PROMPT}

${MOTION_SYSTEM_PROMPT}
`;

        // Create context from current files
        // Limit context if needed, but Gemini 1.5 Flash has huge context window
        const codeContext = Object.entries(currentFiles)
            .map(([path, content]) => `### FILE: ${path}\n${content}`)
            .join('\n\n');

        const fullContextMessage = `
## CURRENT CODEBASE STATE
${codeContext}

## USER REQUEST
${userPrompt}
`;

        // Step 2: Generating
        const genStart = Date.now();
        thoughtSteps.push({
            id: `chat-gen-${Date.now()}`,
            type: 'generating',
            message: 'Generating code changes...',
        });

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
        const genDuration = Math.round((Date.now() - genStart) / 1000);
        thoughtSteps[thoughtSteps.length - 1].duration = genDuration;

        // Parse Output
        const updates: Array<{ path: string, content: string }> = [];
        const lines = reply.split('\n');
        let currentFile: string | null = null;
        let currentContent: string[] = [];
        let naturalMessageLines: string[] = [];

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
                    naturalMessageLines.push(line);
                }
            }
        }
        if (currentFile) {
            updates.push({ path: currentFile, content: currentContent.join('\n').trim() });
        }

        const naturalMessage = naturalMessageLines.join('\n').trim();

        // Step 3: Validating
        const valStart = Date.now();
        thoughtSteps.push({
            id: `chat-val-${Date.now()}`,
            type: 'validating',
            message: 'Checking for errors...',
        });

        let errors = detectErrors(updates);
        const valDuration = Math.round((Date.now() - valStart) / 1000);
        thoughtSteps[thoughtSteps.length - 1].duration = valDuration;
        thoughtSteps[thoughtSteps.length - 1].details = errors.map(e => `${e.file}: ${e.message}`);

        // Step 4: Auto-fix
        let fixAttempts = 0;
        let finalFiles = updates;

        if (errors.filter(e => e.fixable).length > 0) {
            fixAttempts = 1;
            thoughtSteps.push({
                id: `chat-fix-${Date.now()}`,
                type: 'fixing',
                message: `Auto-fixing ${errors.filter(e => e.fixable).length} issues...`,
                details: errors.filter(e => e.fixable).map(e => e.message),
            });

            finalFiles = autoFixErrors(updates, errors);

            // Re-validate (optional, for logging)
            errors = detectErrors(finalFiles);
        }

        // Step 5: Complete
        const totalDuration = Math.round((Date.now() - startTime) / 1000);
        thoughtSteps.push({
            id: `chat-complete-${Date.now()}`,
            type: 'complete',
            message: `Updated ${finalFiles.length} files`,
            duration: totalDuration,
        });

        return NextResponse.json({
            message: naturalMessage,
            files: finalFiles,
            thoughtSteps,
            validationErrors: errors,
            fixAttempts
        });

    } catch (error: unknown) {
        console.error("Chat API Error:", error);

        const errorMessage = error instanceof Error ? error.message : "Error processing request";

        thoughtSteps.push({
            id: `chat-error-${Date.now()}`,
            type: 'error',
            message: errorMessage,
        });

        return NextResponse.json({
            message: "I encountered an error while processing your request.",
            files: [],
            thoughtSteps
        }, { status: 500 });
    }
}
