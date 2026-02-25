import { Polar } from "@polar-sh/sdk";
import { NextResponse } from "next/server";

const polar = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
    server: process.env.NODE_ENV === "development" ? "sandbox" : "production",
});

// The onboarding app URL — pass checkout_id after successful payment
const ONBOARDING_URL = process.env.ONBOARDING_URL || "http://localhost:5173";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("products");

    console.log("Manual Checkout Route Hit");
    console.log("Product ID:", productId);

    if (!productId) {
        return NextResponse.json({ error: "Missing 'products' query parameter" }, { status: 400 });
    }

    try {
        const result = await polar.checkouts.create({
            products: [productId],
            successUrl: `${ONBOARDING_URL}?checkout_id={CHECKOUT_ID}`,
        });

        return NextResponse.redirect(result.url);
    } catch (error: any) {
        console.error("Polar Checkout Error:", error);
        return NextResponse.json(
            {
                error: "Failed to create checkout session",
                details: error.message,
                stack: error.stack
            },
            { status: 500 }
        );
    }
}

