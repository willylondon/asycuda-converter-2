import type { InvoiceExtractionResult } from "./types";
import { PRICEMART_DEMO_EXTRACTION } from "./demo-data";

/**
 * Provider abstraction for AI-powered invoice extraction.
 */
export interface InvoiceInput {
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
}

export interface InvoiceExtractionProvider {
  extractInvoice(input: InvoiceInput): Promise<InvoiceExtractionResult>;
}

/**
 * Kimi K3 extraction provider using the Moonshot API.
 */
export class KimiExtractionProvider implements InvoiceExtractionProvider {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.MOONSHOT_API_KEY || "";
    this.model = process.env.KIMI_MODEL || "kimi-k3";
    this.baseUrl = "https://api.moonshot.cn/v1";
  }

  async extractInvoice(input: InvoiceInput): Promise<InvoiceExtractionResult> {
    if (!this.apiKey) {
      console.warn("MOONSHOT_API_KEY not set — returning demo data");
      return { ...PRICEMART_DEMO_EXTRACTION, warnings: [
        "AI extraction unavailable — MOONSHOT_API_KEY is not configured. Showing PriceSmart demo data.",
        ...PRICEMART_DEMO_EXTRACTION.warnings,
      ]};
    }

    // Build multimodal content
    const base64Content = input.fileBuffer.toString("base64");
    const mimeType = input.mimeType === "application/pdf" ? "application/pdf" : input.mimeType;

    const systemPrompt = `You are an expert customs declaration assistant. Extract structured data from this commercial invoice.

Return ONLY valid JSON matching this exact structure:
{
  "documentType": "commercial_invoice",
  "seller": {"name": "...", "address": "...", "countryCode": "US"},
  "consignee": {"name": "...", "address": "...", "countryCode": "...", "trn": null},
  "shipment": {"containerNumber": "...", "bookingNumber": "...", "carrier": "...", "vessel": null, "sealNumber": null, "sailDate": null, "etaDate": null, "billOfLading": null, "manifestReference": null, "incotermRaw": "...", "grossWeightKg": null},
  "invoice": {"invoiceNumber": null, "invoiceDate": null, "currency": "USD", "merchandiseValue": null, "insuranceValue": null, "freightValue": null, "totalValue": null},
  "packages": [{"packageType": "PL", "quantity": 0}],
  "items": [{"lineNumber": 1, "articleNumber": "...", "commercialDescription": "...", "rawHsCode": "...", "suggestedHsCode": null, "hsCodeConfidence": 0.9, "quantity": 0, "unitOfMeasure": "PCS", "packageType": "PL", "countryOfOrigin": "US", "grossWeightKg": 0, "netWeightKg": null, "unitPrice": 0, "lineTotal": 0, "extractionConfidence": 0.9, "warnings": []}],
  "warnings": []
}

Rules:
- Preserve HS codes exactly as they appear on the invoice (with dots).
- Do NOT infer or calculate tax. Do NOT reconcile totals.
- If a field is not visible on the invoice, use null.
- Set extractionConfidence per item: 0.9+ = clearly visible, 0.7-0.9 = partially visible, <0.7 = guessed.
- For each item, add warnings about any ambiguity.`;

    try {
      const response = await this.callKimi(systemPrompt, base64Content, mimeType);
      return this.parseAndValidate(response);
    } catch (error) {
      // Retry once with schema correction
      console.warn("First extraction attempt failed, retrying...", error);
      try {
        const response = await this.callKimi(
          systemPrompt + "\n\nIMPORTANT: Your previous response did not match the required JSON schema. Output ONLY valid JSON matching the exact structure above.",
          base64Content,
          mimeType,
        );
        return this.parseAndValidate(response);
      } catch (retryError) {
        console.error("Extraction retry failed:", retryError);
        throw new Error("AI extraction failed after retry. Please try again or enter data manually.");
      }
    }
  }

  private async callKimi(systemPrompt: string, base64Content: string, mimeType: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Extract all data from this commercial invoice as JSON." },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Content}`,
                },
              },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Kimi API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  }

  private parseAndValidate(raw: string): InvoiceExtractionResult {
    // Extract JSON from response (may be wrapped in markdown code blocks)
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, raw];
    const jsonStr = jsonMatch[1] || raw;

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonStr.trim());
    } catch {
      throw new Error("Failed to parse Kimi response as JSON");
    }

    // Basic validation — ensure required fields exist
    if (!parsed.documentType || !parsed.items || !Array.isArray(parsed.items)) {
      throw new Error("Extraction result missing required fields (documentType, items)");
    }

    return parsed as unknown as InvoiceExtractionResult;
  }
}

/** Factory: returns the appropriate provider */
export function createExtractionProvider(): InvoiceExtractionProvider {
  return new KimiExtractionProvider();
}
