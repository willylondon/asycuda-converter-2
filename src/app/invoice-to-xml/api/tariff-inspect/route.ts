import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = (request.nextUrl.searchParams.get("code") ?? "").replace(/\D/g, "");
  if (!/^\d{10}$/.test(code)) return NextResponse.json({ error: "10-digit code required" }, { status: 400 });
  const url = `https://jamaicatradeportal.gov.jm/en-gb/site/commodity/${code}`;
  const response = await fetch(url, { cache: "no-store", headers: { "User-Agent": "Mozilla/5.0 ASYCUDA-Converter/1.0" } });
  const html = await response.text();
  const patterns = [
    /<title[^>]*>[\s\S]*?<\/title>/gi,
    /<meta[^>]+(?:description|og:title|og:description)[^>]*>/gi,
    /<h[1-4][^>]*>[\s\S]*?<\/h[1-4]>/gi,
    new RegExp(`.{0,300}${code}.{0,500}`, "gi"),
    /Commodity Structure[\s\S]{0,3000}/gi,
  ];
  const matches = patterns.flatMap((pattern) => html.match(pattern) ?? []).slice(0, 30);
  return NextResponse.json({ status: response.status, length: html.length, matches });
}
