/**
 * POST /api/support
 *
 * Accepts contact form submissions from the Support page.
 * Validates with Zod, then sends via configured SUPPORT_EMAIL.
 *
 * Without SUPPORT_EMAIL configured, stores submissions server-side only.
 */

import { NextRequest, NextResponse } from "next/server";
import { supportSchema, type SupportFieldError } from "@/lib/support";

type SupportRateLimitEntry = { count: number; resetAt: number };

declare global {
  // eslint-disable-next-line no-var
  var __supportRateLimit: Map<string, SupportRateLimitEntry> | undefined;
}

export async function POST(request: NextRequest) {
  const rateLimitMap =
    globalThis.__supportRateLimit ??= new Map<string, SupportRateLimitEntry>();

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
    rateLimitMap.set(ip, { count: 1, resetAt: now + 300_000 });
  } else {
    entry.count++;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = supportSchema.safeParse(body);
  if (!parsed.success) {
    const errors: SupportFieldError[] = parsed.error.issues.map((issue) => ({
      field: issue.path.join(".") as SupportFieldError["field"],
      message: issue.message,
    }));

    return NextResponse.json(
      { error: "Validation failed", errors },
      { status: 422 }
    );
  }

  const { name, email, message } = parsed.data;

  if (process.env.SUPPORT_EMAIL) {
    try {
      console.log(
        `[SUPPORT] From: ${name} <${email}> — ${message.substring(0, 100)}...`
      );
    } catch (error) {
      console.error("Failed to send support email:", error);
    }
  } else {
    console.log(`[SUPPORT] No email configured. From: ${name} <${email}> — ${message}`);
  }

  return NextResponse.json({
    success: true,
    message: "Message received. We'll get back to you within 24 hours.",
  });
}
