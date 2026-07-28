import { z } from "zod";
import type { InvoiceExtractionResult } from "../asycuda/types";

export const AI_ERROR_CODES = {
  PROVIDER_UNAVAILABLE: "AI_PROVIDER_UNAVAILABLE",
  QUOTA_EXCEEDED: "AI_QUOTA_EXCEEDED",
  CONFIGURATION_ERROR: "AI_CONFIGURATION_ERROR",
  RATE_LIMITED: "AI_RATE_LIMITED",
  INVALID_RESPONSE: "AI_INVALID_RESPONSE",
} as const;

export type AIErrorCode = (typeof AI_ERROR_CODES)[keyof typeof AI_ERROR_CODES];

export interface ExtractionError {
  error: string;
  code: AIErrorCode;
  retryable: boolean;
  retryAfter?: number;
}

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
      error: this.retryable ? "Invoice processing is temporarily unavailable." : this.message,
      code: this.code,
      retryable: this.retryable,
      ...(this.retryAfter !== undefined ? { retryAfter: this.retryAfter } : {}),
    };
  }
}

export type ExtractInvoiceFn = (
  fileBuffer: Buffer,
  mimeType: string,
) => Promise<InvoiceExtractionResult>;

export type ProviderId = "gemini" | "openrouter";

export interface AIProviderConfig {
  order: string;
  gemini: { apiKey: string | undefined; model: string };
  openrouter: { apiKey: string | undefined; model: string };
}

const nullableFiniteNumber = z.number().finite().nullable().default(null);

/** Canonical provider response schema. */
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
    grossWeightKg: nullableFiniteNumber,
  }),
  invoice: z.object({
    invoiceNumber: z.string().nullable().default(null),
    invoiceDate: z.string().nullable().default(null),
    currency: z.string().nullable().default(null),
    merchandiseValue: nullableFiniteNumber,
    insuranceValue: nullableFiniteNumber,
    freightValue: nullableFiniteNumber,
    totalValue: nullableFiniteNumber,
  }),
  packages: z.array(z.object({
    packageType: z.string().nullable().default(null),
    quantity: nullableFiniteNumber,
  })).default([]),
  items: z.array(z.object({
    lineNumber: z.number().int().positive(),
    articleNumber: z.string().nullable().default(null),
    commercialDescription: z.string().default(""),
    rawHsCode: z.string().nullable().default(null),
    suggestedHsCode: z.string().nullable().default(null),
    hsCodeConfidence: z.number().min(0).max(1).nullable().default(null),
    quantity: nullableFiniteNumber,
    unitOfMeasure: z.string().nullable().default(null),
    packageType: z.string().nullable().default(null),
    packageCount: nullableFiniteNumber,
    statisticalQuantity: nullableFiniteNumber,
    countryOfOrigin: z.string().nullable().default(null),
    grossWeightKg: nullableFiniteNumber,
    netWeightKg: nullableFiniteNumber,
    unitPrice: nullableFiniteNumber,
    lineTotal: nullableFiniteNumber,
    extractionConfidence: z.number().min(0).max(1).default(0.5),
    warnings: z.array(z.string()).default([]),
  })).min(1),
  warnings: z.array(z.string()).default([]),
});
