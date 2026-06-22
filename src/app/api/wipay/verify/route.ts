import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { status, transactionId, total, hash } = body as {
      status?: string;
      transactionId?: string;
      total?: string;
      hash?: string;
    };

    if (!status || !transactionId || !total || !hash) {
      return NextResponse.json({ error: "Missing required verification parameters" }, { status: 400 });
    }

    if (status !== "success") {
      return NextResponse.json({ error: `Transaction status is: ${status}` }, { status: 400 });
    }

    const apiKey = process.env.WIPAY_API_KEY || "123";
    const calculatedHash = crypto
      .createHash("md5")
      .update(transactionId + total + apiKey)
      .digest("hex");

    if (calculatedHash.toLowerCase() === hash.toLowerCase()) {
      return NextResponse.json({ success: true });
    }

    console.error("WiPay signature verification failed. Calculated:", calculatedHash, "Received:", hash);
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("WiPay verification error:", errorMessage);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
