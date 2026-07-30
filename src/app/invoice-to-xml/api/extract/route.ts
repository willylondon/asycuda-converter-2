import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { createExtractionProvider, AIExtractionError } from "@/lib/asycuda/extraction-provider";
import { authOptions } from "@/lib/auth";

/**
 * POST /invoice-to-xml/api/extract
 *
 * Accepts a multipart file upload (PDF or image) and returns structured
 * invoice extraction data from the AI provider chain (Gemini → OpenRouter).
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in with Google to process an invoice." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Use PDF, PNG, JPG, or WEBP.` },
        { status: 400 },
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum 10 MB." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const provider = createExtractionProvider();

    const result = await provider.extractInvoice({
      fileBuffer: buffer,
      fileName: file.name,
      mimeType: file.type,
    });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Extraction error:", error instanceof Error ? error.name : "UnknownError");

    if (error instanceof AIExtractionError) {
      const { code, retryable, retryAfter } = error.toResponse();
      return NextResponse.json(
        {
          error: retryable
            ? "Invoice processing is temporarily unavailable."
            : error.message,
          code,
          retryable,
          ...(retryAfter !== undefined ? { retryAfter } : {}),
        },
        { status: retryable ? 503 : 422 },
      );
    }

    return NextResponse.json(
      { error: "Invoice extraction failed. Please try again." },
      { status: 500 },
    );
  }
}
