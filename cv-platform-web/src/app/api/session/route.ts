import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    const session = await getSession(token);
    if (!session) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 404 });
    }

    return NextResponse.json(session);
}
