import { z } from "zod";
import type { InvoiceExtractionResult } from "../asycuda/types";

/**
 * Shared error codes for AI extraction operations.
 */
export const AI_ERROR_CODES = {
  PROVIDER_UNAVAILABLE: "AI_PROVIDER_UNAVAILABLE",
  QUOTA_EXCEEDED: "AI_QUOTA_EXCEEDED",
  CONFIGURATION_ERROR: "AI_CONFIGURATION_ERROR",
  RATE_LIMITED: "AI_RATE_LIMITED",
  INVALID_RESPONSE: "AI_INVALID_RESPONSE",
} as const;

export type AIErrorCode = (typeof AI_ERROR_CODES)[keyof typeof AI_ERROR_CODES];

/**
 * Structured error returned to the API consumer.
 */
export interface ExtractionError {
  error: string;
  code: AIErrorCode;
  retryable: boolean;
  retryAfter?: number;
}

/**
 * An error that carries a structured AI provider error code.
 */
export class AIExtractionError extends Error {
  public readonly code: AIErrorCode;
  public readonly retryable: boolean;
  public readonly retryAfter?: number;

  constructor(code: AIErrorCode, message: string, retryable = false, retryAfter?: number) {
    super(message);
    this.name = "AIExtractionError";
    this.code = code;
    this.retryable = retryable;
    this.retryAfter = retryAfter;
  }

  toResponse(): ExtractionError {
    return {
      error: this.retryable
        ? "Invoice processing is temporarily unavailable."
        : this.message,
      code: this.code,
      retryable: this.retryable,
      ...(this.retryAfter !== undefined ? { retryAfter: this.retryAfter } : {}),
    };
  }
}

/**
 * All providers return an InvoiceExtractionResult through the same normalization pipeline.
 */
export type ExtractInvoiceFn = (
  fileBuffer: Buffer,
  mimeType: string,
) => Promise<InvoiceExtractionResult>;

/**
 * List of possible provider identifiers.
 */
export type ProviderId = "gemini" | "openrouter";

/**
 * Configuration for the AI extraction layer.
 */
export interface AIProviderConfig {
  order: string;
  gemini: {
    apiKey: string | undefined;
    model: string;
  };
  openrouter: {
    apiKey: string | undefined;
    model: string;
  };
}

/**
 * Zod schema shared by all providers to validate invoice extraction.
 * This is a lightweight pre-check. Full validation uses invoice-extraction-schema.ts.
 */
export const InvoiceJsonSchema = z.object({
  documentType: z.enum(["commercial_invoice", "packing_list", "unknown"]).default("commercial_invoice"),
  seller: z.object({
    name: z.string().nullable().default(null),
    address: z.string().nullable().default(null),
    countryCode: z.string().nullable().default(null),
  }),
  consignee: z.object({
    name: z.string().nullable().default(null),
    address: z.string().nullable().default(null),
    countryCode: z.string().nullable().default(null),
    trn: z.string().nullable().default(null),
  }),
  shipment: z.object({
    containerNumber: z.string().nullable().default(null),
    bookingNumber: z.string().nullable().default(null),
    carrier: z.string().nullable().default(null),
    vessel: z.string().nullable().default(null),
    sealNumber: z.string().nullable().default(null),
    sailDate: z.string().nullable().default(null),
    etaDate: z.string().nullable().default(null),
    billOfLading: z.string().nullable().default(null),
    manifestReference: z.string().nullable().default(null),
    incotermRaw: z.string().nullable().default(null),
    grossWeightKg: z.number().nullable().default(null),
  }),
  invoice: z.object({
    invoiceNumber: z.string().nullable().default(null),
    invoiceDate: z.string().nullable().default(null),
    currency: z.string().nullable().default(null),
    merchandiseValue: z.number().nullable().default(null),
    insuranceValue: z.number().nullable().default(null),
    freightValue: z.number().nullable().default(null),
    totalValue: z.number().nullable().default(null),
  }),
  packages: z.array(
    z.object({
      packageType: z.string().nullable().default(null),
      quantity: z.number().nullable().default(null),
    }),
  ).default([]),
  items: z.array(
    z.object({
      lineNumber: z.number(),
      articleNumber: z.string().nullable().default(null),
      commercialDescription: z.string().default(""),
      rawHsCode: z.string().nullable().default(null),
      suggestedHsCode: z.string().nullable().default(null),
      hsCodeConfidence: z.number().nullable().default(null),
      quantity: z.number().nullable().default(null),
      unitOfMeasure: z.string().nullable().default(null),
      packageType: z.string().nullable().default(null),
      countryOfOrigin: z.string().nullable().default(null),
      grossWeightKg: z.number().nullable().default(null),
      netWeightKg: z.number().nullable().default(null),
      unitPrice: z.number().nullable().default(null),
      lineTotal: z.number().nullable().default(null),
      extractionConfidence: z.number().default(0.5),
      warnings: z.array(z.string()).default([]),
    }),
  ).default([]),
  warnings: z.array(z.string()).default([]),
});
