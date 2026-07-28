import { NextRequest, NextResponse } from "next/server";
import { buildAsycudaXml } from "@/lib/asycuda/build-asycuda-xml";
import { validateDeclaration, hasBlockingErrors } from "@/lib/asycuda/validation";
import type { ExportXmlResponse, ValidationFinding } from "@/lib/asycuda/types";
import type { DeclarationDraft } from "@/lib/asycuda/declaration-draft";

/**
 * POST /api/invoice-to-xml/export-xml
 *
 * Accepts a DeclarationDraft, runs validation, and returns
 * the generated ASYCUDA XML (or validation errors).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const draft = body as DeclarationDraft;

    if (!draft || !draft.items) {
      return NextResponse.json({ error: "Missing declaration draft or items" }, { status: 400 });
    }

    const validation = validateDeclaration(draft);

    if (hasBlockingErrors(validation)) {
      const response: ExportXmlResponse = { xml: null, validation, status: "errors" };
      return NextResponse.json(response, { status: 422 });
    }

    const xml = buildAsycudaXml(draft);
    const status = validation.some(f => f.type === "warning") ? "warnings" : "clean";

    let finalXml = xml;
    if (status === "warnings") {
      finalXml = `<!-- ⚠️ TEST ASYCUDA XML — IMPORT COMPATIBILITY NOT YET VERIFIED — ${validation.filter(f => f.type === "warning").length} warning(s) found -->\n${xml}`;
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
