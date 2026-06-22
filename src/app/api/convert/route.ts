/**
 * POST /api/convert
 *
 * Accepts an Excel file upload, validates it server-side against
 * ASYCUDA requirements, and returns the generated XML or a detailed
 * error report. Files are processed entirely in memory.
 */

import { NextRequest, NextResponse } from "next/server";
import { convertExcelToAsycudaXml } from "@/lib/converter";

// In-memory rate limiter (per-IP, 10 requests/minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count++;
  return { allowed: true, retryAfter: 0 };
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const { allowed, retryAfter } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      }
    );
  }

  // Parse multipart form
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid form data. Expected multipart/form-data." },
      { status: 400 }
    );
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json(
      { success: false, error: "No file provided. Include a 'file' field in the form." },
      { status: 400 }
    );
  }

  // Metadata validation
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (![".xlsx", ".xls"].includes(ext)) {
    return NextResponse.json(
      {
        success: false,
        error: `Unsupported format "${ext}". Please upload .xlsx or .xls.`,
      },
      { status: 400 }
    );
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      {
        success: false,
        error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 10MB.`,
      },
      { status: 400 }
    );
  }

  if (file.size === 0) {
    return NextResponse.json(
      { success: false, error: "File is empty." },
      { status: 400 }
    );
  }

  // Read file into memory buffer (never touches disk)
  let buffer: ArrayBuffer;
  try {
    buffer = await file.arrayBuffer();
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to read the uploaded file." },
      { status: 500 }
    );
  }

  // Convert
  const result = convertExcelToAsycudaXml(buffer, file.name, file.size);

  return NextResponse.json(result, {
    status: result.success ? 200 : 422,
  });
}

// Note: Next.js App Router handles body parsing automatically for multipart forms.
// The 10MB limit is enforced in the handler above.
