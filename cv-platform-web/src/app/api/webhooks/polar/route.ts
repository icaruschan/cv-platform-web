import { Webhooks } from "@polar-sh/nextjs";
import { createClient } from "@supabase/supabase-js";

// Use the SERVICE_ROLE_KEY here — this is a server-to-server webhook and needs to bypass
// Row Level Security (RLS) to write credits to sessions for any user's project.
// The anon key would be silently blocked by RLS policies.
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const POST = Webhooks({
    webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
    onPayload: async (payload) => {
        switch (payload.type) {
            case "checkout.created": // Just for logging/debug
                console.log("Checkout created:", payload.data.id);
                break;

            case "order.created": // Payment successful and order created!
                const order = payload.data;
                const customerEmail = order.customer.email;
                // Check if this is a top-up purchase
                const topupProductId = process.env.NEXT_PUBLIC_POLAR_TOPUP_PRODUCT_ID;
                const isTopUp = order.product?.id === topupProductId;

                if (isTopUp) {
                    console.log(`💰 Top-up purchase detected for ${customerEmail}`);

                    // Get all projects for this email
                    const { data: projects } = await supabase
                        .from('projects')
                        .select('id')
                        .eq('email', customerEmail);

                    if (projects && projects.length > 0) {
                        // Get the most recent session for these projects
                        const projectIds = projects.map(p => p.id);
                        const { data: session, error } = await supabase
                            .from('sessions')
                            .select('*')
                            .in('project_id', projectIds)
                            .order('created_at', { ascending: false })
                            .limit(1)
                            .single();

                        if (!error && session) {
                            // Add 5 credits
                            const newCredits = (session.edits_remaining || 0) + 5;

                            await supabase
                                .from('sessions')
                                .update({ edits_remaining: newCredits })
                                .eq('token', session.token);

                            console.log(`✅ Added 5 credits to session ${session.token}. New total: ${newCredits}`);
                        }
                    }
                } else {
                    console.log(`ℹ️ Non-topup order for ${customerEmail}, no action taken.`);
                }
                break;

            default:
                console.log("Unhandled webhook event:", payload.type);
        }
    },
});
