import { NextRequest, NextResponse } from "next/server";
import { searchJamaicaTariff } from "@/lib/tariff/jamaica-tariff";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length > 160) {
    return NextResponse.json({ error: "Tariff search is too long." }, { status: 400 });
  }

  const response = await searchJamaicaTariff(query);
  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "private, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
