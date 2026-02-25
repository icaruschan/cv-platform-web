import { NextRequest, NextResponse } from 'next/server';
import { Polar } from "@polar-sh/sdk";
import { supabase } from "@/lib/supabase";

const polar = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN ?? "",
    server: process.env.NODE_ENV === "development" ? "sandbox" : "production",
});

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const sessionToken = searchParams.get('token');

        if (!sessionToken) {
            return NextResponse.json(
                { error: 'Session token required' },
                { status: 400 }
            );
        }

        // Get the session to find the project ID
        const { data: session } = await supabase
            .from('sessions')
            .select('project_id')
            .eq('token', sessionToken)
            .single();

        if (!session) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            );
        }

        // Get the top-up product ID from env
        const productId = process.env.NEXT_PUBLIC_POLAR_TOPUP_PRODUCT_ID;

        if (!productId) {
            console.error('NEXT_PUBLIC_POLAR_TOPUP_PRODUCT_ID not configured');
            return NextResponse.json(
                { error: 'Top-up product not configured' },
                { status: 500 }
            );
        }

        // Use NEXT_PUBLIC_APP_URL as the canonical production base URL.
        // Falls back to NEXT_PUBLIC_BASE_URL for backward compatibility.
        // In production, if neither is set, this throws — preventing silent localhost redirects.
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL
            || process.env.NEXT_PUBLIC_BASE_URL
            || 'http://localhost:3000';

        if (!baseUrl.startsWith('http://localhost') && !baseUrl.startsWith('https://')) {
            throw new Error('Invalid base URL configuration for Polar success redirect');
        }

        // Create a checkout session with the session token and project ID in the success URL
        const result = await polar.checkouts.create({
            products: [productId],
            successUrl: `${baseUrl}/topup-success?token=${sessionToken}&project=${session.project_id}&checkout_id={CHECKOUT_ID}`,
        });

        return NextResponse.redirect(result.url);
    } catch (error) {
        console.error('Top-up checkout error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout' },
            { status: 500 }
        );
    }
}
