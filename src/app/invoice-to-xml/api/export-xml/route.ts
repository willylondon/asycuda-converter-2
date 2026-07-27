import { NextRequest, NextResponse } from "next/server";
import { buildAsycudaXml } from "@/lib/asycuda/build-asycuda-xml";
import { validateDeclaration, hasBlockingErrors } from "@/lib/asycuda/validation";
import type { ExportXmlResponse } from "@/lib/asycuda/types";

/**
 * POST /api/invoice-to-xml/export-xml
 *
 * Accepts declaration data + items, runs validation, and returns
 * the generated ASYCUDA XML (or validation errors).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { declaration, items } = body as {
      declaration: Record<string, unknown>;
      items: Record<string, unknown>[];
    };

    if (!declaration || !items) {
      return NextResponse.json(
        { error: "Missing declaration or items" },
        { status: 400 },
      );
    }

    // Run validation
    const validation = validateDeclaration(declaration, items);

    // Check for blocking errors
    if (hasBlockingErrors(validation)) {
      const response: ExportXmlResponse = { xml: null, validation, status: "errors" };
      return NextResponse.json(response, { status: 422 });
    }

    // Build XML
    const xml = buildAsycudaXml({ declaration, items });

    // Determine status
    const status = validation.some((f) => f.type === "warning") ? "warnings" : "clean";

    // If warnings exist, prefix the XML with a verification notice
    let finalXml = xml;
    if (status === "warnings") {
      finalXml = `<!-- ⚠️ TEST XML — REQUIRES DECLARANT VERIFICATION — ${validation.filter((f) => f.type === "warning").length} warning(s) found -->\n${xml}`;
    }

    const response: ExportXmlResponse = { xml: finalXml, validation, status };
    return NextResponse.json(response);
  } catch (error) {
    console.error("XML export error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "XML generation failed" },
      { status: 500 },
    );
  }
}
