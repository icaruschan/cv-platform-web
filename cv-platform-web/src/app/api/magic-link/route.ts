import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123');
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        // 1. Validate email
        if (!email || typeof email !== 'string' || !email.includes('@')) {
            return NextResponse.json(
                { error: 'A valid email address is required' },
                { status: 400 }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();

        // 2. Find the most recent project for this email
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('id, status')
            .eq('email', normalizedEmail)
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

        if (projectError || !project) {
            // Don't reveal whether the email exists in the system (security best practice).
            // Always return a success-like response to prevent email enumeration.
            console.log(`Magic link requested for unknown email: ${normalizedEmail}`);
            return NextResponse.json({
                success: true,
                message: 'If an account exists with this email, a magic link has been sent.',
            });
        }

        // 3. Find an active session for this project
        const { data: session, error: sessionError } = await supabase
            .from('sessions')
            .select('token')
            .eq('project_id', project.id)
            .order('expires_at', { ascending: false })
            .limit(1)
            .single();

        if (sessionError || !session) {
            // Session expired or never existed — same safe message
            console.log(`No active session for project ${project.id}`);
            return NextResponse.json({
                success: true,
                message: 'If an account exists with this email, a magic link has been sent.',
            });
        }

        // 4. Build the magic link (same format as /api/generate)
        const magicLink = `${BASE_URL}/project/${project.id}?token=${session.token}`;

        // 5. Send the email via Resend
        await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
            to: normalizedEmail,
            subject: 'Your Portfolio Access Link',
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
                    <h2 style="font-size: 22px; font-weight: 700; color: #111; margin-bottom: 8px;">
                        Here's your access link
                    </h2>
                    <p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
                        Click the button below to get back into your portfolio editor. This link will take you directly to your project.
                    </p>
                    <a href="${magicLink}" style="display: inline-block; background: #7c3aed; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                        Open My Portfolio →
                    </a>
                    <p style="font-size: 13px; color: #999; margin-top: 32px; line-height: 1.5;">
                        If you didn't request this link, you can safely ignore this email.
                    </p>
                </div>
            `,
        });

        console.log(`✅ Magic link re-sent to ${normalizedEmail} for project ${project.id}`);

        return NextResponse.json({
            success: true,
            message: 'If an account exists with this email, a magic link has been sent.',
        });

    } catch (error: any) {
        console.error('Magic link error:', error);
        return NextResponse.json(
            { error: 'Something went wrong. Please try again.' },
            { status: 500 }
        );
    }
}
