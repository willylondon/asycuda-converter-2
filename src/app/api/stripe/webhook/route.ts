/**
 * POST /api/stripe/webhook
 *
 * Receives Stripe webhook events to verify payment completion.
 * On checkout.session.completed, marks the session as paid.
 *
 * Test with: stripe listen --forward-to localhost:3000/api/stripe/webhook
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not configured" },
      { status: 500 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  try {
    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-06-16.acacia" as unknown as never,
    });

    const body = await request.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("Payment completed:", session.id, session.metadata?.fileName);
        // In production: store session.id → paid status in DB or Redis
        break;
      }
      case "checkout.session.expired": {
        // Handle abandoned checkouts
        break;
      }
      default:
        console.log("Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook error:", errorMessage);
    return NextResponse.json(
      { error: `Webhook verification failed: ${errorMessage}` },
      { status: 400 }
    );
  }
}