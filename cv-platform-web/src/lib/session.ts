import { supabase } from './supabase';

export interface Session {
    token: string;
    project_id: string;
    edits_remaining: number;
    is_premium: boolean;
    expires_at: string;
}

/**
 * Creates a new session for a project
 */
export async function createSession(projectId: string): Promise<Session | null> {
    const token = crypto.randomUUID();

    const { data, error } = await supabase
        .from('sessions')
        .insert({
            token,
            project_id: projectId,
            edits_remaining: 5, // Standard tier limit
            is_premium: false
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating session:', error);
        return null;
    }

    return data;
}

/**
 * Retrieves a valid session by token
 */
export async function getSession(token: string): Promise<Session | null> {
    const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('token', token)
        .single();

    if (error || !data) return null;

    // Check expiration
    if (new Date(data.expires_at) < new Date()) {
        return null; // Expired
    }

    return data;
}

/**
 * Checks if a session has edits remaining and decrements the count
 * Returns true if allowed, false if limit reached
 */
export async function useEditCredit(token: string): Promise<boolean> {
    const session = await getSession(token);
    if (!session) return false;

    // Premium users have unlimited edits
    if (session.is_premium) return true;

    if (session.edits_remaining <= 0) {
        return false; // No edits left
    }

    const { error } = await supabase
        .from('sessions')
        .update({ edits_remaining: session.edits_remaining - 1 })
        .eq('token', token);

    return !error;
}

/**
 * Upgrade a session to premium
 */
export async function upgradeSession(token: string): Promise<boolean> {
    const { error } = await supabase
        .from('sessions')
        .update({
            is_premium: true,
            edits_remaining: 999999 // Visual indicator of unlimited
        })
        .eq('token', token);

    return !error;
}
