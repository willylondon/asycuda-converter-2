import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const nextauthSecret = process.env.NEXTAUTH_SECRET;
  const nextauthUrl = process.env.NEXTAUTH_URL;

  return NextResponse.json(
    {
      googleClientId: clientId
        ? `${clientId.slice(0, 15)}... (${clientId.length} chars)`
        : "MISSING",
      googleClientSecret: clientSecret
        ? `${clientSecret.slice(0, 8)}... (${clientSecret.length} chars)`
        : "MISSING",
      nextauthSecret: nextauthSecret
        ? `${nextauthSecret.slice(0, 4)}... (${nextauthSecret.length} chars)`
        : "MISSING",
      nextauthUrl: nextauthUrl || "MISSING",
      nodeEnv: process.env.NODE_ENV || "MISSING",
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    }
  );
}