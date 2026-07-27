import { NextRequest, NextResponse } from "next/server";
import { createExtractionProvider } from "@/lib/asycuda/extraction-provider";

/**
 * POST /api/invoice-to-xml/extract
 *
 * Accepts a multipart file upload (PDF or image) and returns structured
 * invoice extraction data from Kimi K3 (or demo data if no API key).
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate type
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Use PDF, PNG, JPG, or WEBP.` },
        { status: 400 },
      );
    }

    // Validate size (10 MB)
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

    return NextResponse.json(result);
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Extraction failed" },
      { status: 500 },
    );
  }
}
