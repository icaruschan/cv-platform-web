import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ChatRequest } from '../../../lib/types';
import { MOTION_SYSTEM_PROMPT, TECHNICAL_CONSTRAINTS_PROMPT } from '../../../lib/agents/system-prompts';
import { detectErrors, autoFixErrors, ThoughtStep } from '../../../lib/agents/builder';
import { supabase } from '@/lib/supabase';

export const maxDuration = 120; // 2 minutes
export const dynamic = 'force-dynamic';

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "CV Platform",
    },
});

const GEMINI_MODEL = process.env.GEMINI_FLASH_MODEL || "google/gemini-3-flash-preview";

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
        const { messages, currentFiles, projectId } = await request.json() as ChatRequest & { projectId?: string };
        const userPrompt = messages[messages.length - 1].content;

        const systemPrompt = `You are the AI Editor for a Portfolio Builder.
You have full access to the source code. Your job is to EDIT the code based on user requests.

## CONTEXT
The site is built with React 18 + Vite, Tailwind CSS, and Framer Motion.
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
   - Do NOT use 'use client' (not needed in Vite).
   - Do NOT use Next.js imports (next/image, next/link, next/router).
   - Do NOT invent new libraries. Use what is installed (Phosphor Icons, Framer Motion).
   
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
        const naturalMessageLines: string[] = [];
        let inCodeBlock = false;

        for (const line of lines) {
            if (line.trim().startsWith('### FILE:')) {
                if (currentFile) {
                    // Clean the content before saving
                    let content = currentContent.join('\n').trim();
                    // Remove markdown code block fences if present
                    content = content.replace(/^```\w*\n?/gm, '').replace(/\n?```$/gm, '').trim();
                    updates.push({ path: currentFile, content });
                }
                currentFile = line.replace('### FILE:', '').trim();
                currentContent = [];
                inCodeBlock = false;
            } else if (currentFile) {
                // Skip markdown code fences inside file content
                if (line.trim().startsWith('```')) {
                    inCodeBlock = !inCodeBlock;
                    // Don't add the fence line to content
                    continue;
                }
                currentContent.push(line);
            } else {
                naturalMessageLines.push(line);
            }
        }
        if (currentFile) {
            let content = currentContent.join('\n').trim();
            // Remove any remaining markdown code fences
            content = content.replace(/^```\w*\n?/gm, '').replace(/\n?```$/gm, '').trim();
            updates.push({ path: currentFile, content });
        }

        const naturalMessage = naturalMessageLines.join('\n').trim();

        console.log(`📝 Parsed ${updates.length} files from LLM response:`, updates.map(u => u.path));

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

        // Check for critical (non-fixable) errors
        const criticalErrors = errors.filter(e => !e.fixable);
        const hasCriticalErrors = criticalErrors.length > 0;

        // Step 5: Complete
        const totalDuration = Math.round((Date.now() - startTime) / 1000);

        if (hasCriticalErrors) {
            // Warn about broken code - don't apply changes
            thoughtSteps.push({
                id: `chat-warning-${Date.now()}`,
                type: 'error',
                message: `⚠️ Found ${criticalErrors.length} critical error(s) - changes NOT applied`,
                details: criticalErrors.map(e => e.message),
            });

            // Return without applying changes
            return NextResponse.json({
                response: `${naturalMessage}\n\n⚠️ **Warning:** I generated code with errors that I couldn't fix:\n${criticalErrors.map(e => `- ${e.message}`).join('\n')}\n\nPlease try rephrasing your request or being more specific.`,
                files: {},  // Empty - don't apply broken code
                thoughtSteps,
                validationErrors: errors,
                filesChanged: 0,
                fixAttempts,
                hasErrors: true
            });
        }

        thoughtSteps.push({
            id: `chat-complete-${Date.now()}`,
            type: 'complete',
            message: `Updated ${finalFiles.length} files`,
            duration: totalDuration,
        });

        // Convert files array to object format (frontend expects { path: content })
        const filesObject: Record<string, string> = {};
        for (const file of finalFiles) {
            filesObject[file.path] = file.content;
        }

        // Persist files to Supabase if projectId is provided
        if (projectId && finalFiles.length > 0) {
            console.log(`💾 Saving ${finalFiles.length} files to project ${projectId}`);

            for (const file of finalFiles) {
                // Delete existing file first, then insert new version
                await supabase
                    .from('files')
                    .delete()
                    .eq('project_id', projectId)
                    .eq('path', file.path);

                const { error } = await supabase
                    .from('files')
                    .insert({
                        project_id: projectId,
                        path: file.path,
                        content: file.content
                    });

                if (error) {
                    console.error(`Failed to save ${file.path}:`, error);
                }
            }
        }

        return NextResponse.json({
            response: naturalMessage,  // Frontend expects 'response', not 'message'
            files: filesObject,        // Object format, not array
            thoughtSteps,
            validationErrors: errors,
            filesChanged: finalFiles.length,
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
