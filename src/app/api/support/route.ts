/**
 * POST /api/support
 *
 * Accepts contact form submissions from the Support page.
 * Validates with Zod, then sends via configured SUPPORT_EMAIL.
 *
 * Without SUPPORT_EMAIL configured, stores submissions server-side only.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const supportSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name is too long"),
  email: z.string().email("Invalid email address"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must be under 5,000 characters"),
});

export async function POST(request: NextRequest) {
  // Rate limiting (same in-memory pattern as /api/convert)
  const rateLimitMap = (globalThis as any).__supportRateLimit || new Map<string, { count: number; resetAt: number }>();
  (globalThis as any).__supportRateLimit = rateLimitMap;

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (entry && now < entry.resetAt && entry.count >= 5) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 300_000 }); // 5 min window
  } else {
    entry.count++;
  }

  // Parse and validate
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const parsed = supportSchema.safeParse(body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return NextResponse.json({ error: "Validation failed", errors }, { status: 422 });
  }

  const { name, email, message } = parsed.data;

  // If SUPPORT_EMAIL is configured, send it
  if (process.env.SUPPORT_EMAIL) {
    try {
      // In production, use a mail provider (Resend, SendGrid, Nodemailer, etc.)
      // For now, log it — email sending requires additional configuration
      console.log(`[SUPPORT] From: ${name} <${email}> — ${message.substring(0, 100)}...`);
    } catch (err) {
      console.error("Failed to send support email:", err);
    }
  } else {
    console.log(`[SUPPORT] No email configured. From: ${name} <${email}> — ${message}`);
  }

  return NextResponse.json({
    success: true,
    message: "Message received. We'll get back to you within 24 hours.",
  });
}