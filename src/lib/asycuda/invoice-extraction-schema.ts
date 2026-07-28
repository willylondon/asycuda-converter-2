import { z } from "zod";
import type { InvoiceExtractionResult } from "./types";

/**
 * Strict Zod schema for invoice extraction validation.
 * Every provider response must pass this before being returned to the client.
 */
export const InvoiceExtractionResultSchema = z.object({
  documentType: z.enum(["commercial_invoice", "packing_list", "unknown"]).default("commercial_invoice"),
  seller: z.object({
    name: z.string().nullable(),
    address: z.string().nullable(),
    countryCode: z.string().nullable(),
  }),
  consignee: z.object({
    name: z.string().nullable(),
    address: z.string().nullable(),
    countryCode: z.string().nullable(),
    trn: z.string().nullable(),
  }),
  shipment: z.object({
    containerNumber: z.string().nullable(),
    bookingNumber: z.string().nullable(),
    carrier: z.string().nullable(),
    vessel: z.string().nullable(),
    sealNumber: z.string().nullable(),
    sailDate: z.string().nullable(),
    etaDate: z.string().nullable(),
    billOfLading: z.string().nullable(),
    manifestReference: z.string().nullable(),
    incotermRaw: z.string().nullable(),
    grossWeightKg: z.number().nullable(),
  }),
  invoice: z.object({
    invoiceNumber: z.string().nullable(),
    invoiceDate: z.string().nullable(),
    currency: z.string().nullable(),
    merchandiseValue: z.number().nullable(),
    insuranceValue: z.number().nullable(),
    freightValue: z.number().nullable(),
    totalValue: z.number().nullable(),
  }),
  packages: z.array(z.object({
    packageType: z.string().nullable(),
    quantity: z.number().nullable(),
  })),
  items: z.array(z.object({
    lineNumber: z.number().int().positive(),
    articleNumber: z.string().nullable(),
    commercialDescription: z.string(),
    rawHsCode: z.string().nullable(),
    suggestedHsCode: z.string().nullable(),
    hsCodeConfidence: z.number().min(0).max(1).nullable(),
    quantity: z.number().nullable(),
    unitOfMeasure: z.string().nullable(),
    packageType: z.string().nullable(),
    countryOfOrigin: z.string().nullable(),
    grossWeightKg: z.number().nullable(),
    netWeightKg: z.number().nullable(),
    unitPrice: z.number().nullable(),
    lineTotal: z.number().nullable(),
    extractionConfidence: z.number().min(0).max(1),
    warnings: z.array(z.string()),
  })).min(1, "At least one invoice item is required"),
  warnings: z.array(z.string()),
});

/**
 * Validates raw AI output against the strict invoice schema.
 * Returns the validated result or throws with clear error messages.
 */
export function validateInvoiceExtraction(raw: unknown): InvoiceExtractionResult {
  try {
    return InvoiceExtractionResultSchema.parse(raw) as InvoiceExtractionResult;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      throw new Error(`Invoice extraction validation failed: ${issues}`);
    }
    throw error;
  }
}
