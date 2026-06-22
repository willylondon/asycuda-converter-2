import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planType } = body as { planType: "single" | "pack" };

    if (!planType || !["single", "pack"].includes(planType)) {
      return NextResponse.json({ error: "Invalid planType provided" }, { status: 400 });
    }

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const wipayAccountNumber = process.env.WIPAY_ACCOUNT_NUMBER || "1234567890";
    const wipayEnvironment = process.env.WIPAY_ENVIRONMENT || "sandbox";
    const wipayCountryCode = process.env.WIPAY_COUNTRY_CODE || "TT";
    const wipayCurrency = process.env.WIPAY_CURRENCY || "TTD";
    const wipayFeeStructure = process.env.WIPAY_FEE_STRUCTURE || "customer_pay";

    const singlePrice = Number(process.env.WIPAY_PRICE_SINGLE || (wipayCurrency === "TTD" ? "35" : "5"));
    const packPrice = Number(process.env.WIPAY_PRICE_10PACK || (wipayCurrency === "TTD" ? "270" : "40"));
    const total = planType === "single" ? singlePrice : packPrice;

    // Generate a unique order ID
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const responseUrl = `${origin}/converter`;

    const formData = new URLSearchParams();
    formData.append("account_number", wipayAccountNumber);
    formData.append("country_code", wipayCountryCode);
    formData.append("currency", wipayCurrency);
    formData.append("environment", wipayEnvironment);
    formData.append("fee_structure", wipayFeeStructure);
    formData.append("method", "credit_card");
    formData.append("order_id", orderId);
    formData.append("origin", "asycuda-converter");
    formData.append("response_url", responseUrl);
    formData.append("total", total.toFixed(2));

    const endpoint = `https://${wipayCountryCode.toLowerCase()}.wipayfinancial.com/plugins/payments/request`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("WiPay request failed:", errorText);
      return NextResponse.json({ error: "Failed to contact WiPay gateway" }, { status: 502 });
    }

    const result = await response.json();
    console.log("WiPay result:", result);
    const redirectUrl = result.url || result.hosted_page_url;

    if (redirectUrl) {
      return NextResponse.json({ url: redirectUrl });
    }

    return NextResponse.json({ error: "No redirection URL returned by WiPay" }, { status: 502 });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("WiPay checkout error:", errorMessage);
    return NextResponse.json({ error: "Failed to initiate payment session" }, { status: 500 });
  }
}
