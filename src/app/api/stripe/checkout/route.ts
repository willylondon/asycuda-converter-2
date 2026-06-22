/**
 * POST /api/stripe/checkout
 *
 * Creates a Stripe Checkout Session for pay-per-conversion.
 * Returns the session URL for client-side redirect.
 *
 * Set STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env.local
 * Test mode: use sk_test_... keys and Stripe test card 4242 4242 4242 4242
 */

import { NextRequest, NextResponse } from "next/server";

// Lazy-initialize Stripe to avoid errors when env vars are missing
let Stripe: typeof import("stripe").Stripe | null = null;
async function getStripe() {
  if (!Stripe) {
    const { default: StripeModule } = await import("stripe");
    Stripe = StripeModule;
  }
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(key, {
    apiVersion: "2025-06-16.acacia" as unknown as never,
  });
}

export async function POST(request: NextRequest) {
  // Check Stripe is configured
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Payment processing is not configured yet." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { fileName, priceId } = body as { fileName?: string; priceId?: string };

    const stripe = await getStripe();

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId || process.env.STRIPE_PRICE_ID || "price_default",
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/converter?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/converter?cancelled=true`,
      metadata: {
        fileName: fileName || "unknown",
      },
      // Allow promo codes in test mode
      ...(process.env.STRIPE_SECRET_KEY.startsWith("sk_test") && {
        allow_promotion_codes: true,
      }),
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe checkout error:", errorMessage);
    return NextResponse.json(
      { error: "Failed to create checkout session." },
      { status: 500 }
    );
  }
}