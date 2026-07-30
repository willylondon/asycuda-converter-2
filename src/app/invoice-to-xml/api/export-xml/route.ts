import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { buildAsycudaXml } from "@/lib/asycuda/build-asycuda-xml";
import { DeclarationDraftSchema } from "@/lib/asycuda/declaration-draft-schema";
import { hasBlockingErrors, validateDeclaration } from "@/lib/asycuda/validation";
import type { ExportXmlResponse } from "@/lib/asycuda/types";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in with Google to generate XML." }, { status: 401 });
  }

  try {
    const parsed = DeclarationDraftSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "The declaration data is incomplete or invalid." },
        { status: 400 },
      );
    }

    const draft = parsed.data;
    const validation = validateDeclaration(draft);
    if (hasBlockingErrors(validation)) {
      const response: ExportXmlResponse = { xml: null, validation, status: "errors" };
      return NextResponse.json(response, { status: 422 });
    }

    const xml = buildAsycudaXml(draft);
    const status = validation.some((finding) => finding.type === "warning") ? "warnings" : "clean";
    const response: ExportXmlResponse = { xml, validation, status };
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("XML export failed", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({ error: "XML generation failed." }, { status: 500 });
  }
}
