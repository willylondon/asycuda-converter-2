import type { InvoiceExtractionResult } from "./types";
import { extractInvoiceData, AIExtractionError, AI_ERROR_CODES } from "@/lib/ai/extract-invoice";
import { validateInvoiceExtraction } from "./invoice-extraction-schema";

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
 * Gemini-based extraction provider using the multi-provider AI layer.
 * Attempts Gemini first, falls back to OpenRouter for retryable failures.
 */
export class InvoiceAiExtractionProvider implements InvoiceExtractionProvider {
  async extractInvoice(input: InvoiceInput): Promise<InvoiceExtractionResult> {
    const result = await extractInvoiceData(input.fileBuffer, input.mimeType);

    // Run through strict Zod validation
    try {
      return validateInvoiceExtraction(result);
    } catch (err) {
      console.error("Invoice extraction validation failed:", err);
      throw new AIExtractionError(
        AI_ERROR_CODES.INVALID_RESPONSE,
        "AI returned data that did not match the required invoice schema.",
        true,
      );
    }
  }
}

/** Factory: returns the AI extraction provider */
export function createExtractionProvider(): InvoiceExtractionProvider {
  return new InvoiceAiExtractionProvider();
}

// Re-export for the API route
export { AIExtractionError, AI_ERROR_CODES };