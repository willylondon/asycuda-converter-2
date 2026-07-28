import { z } from "zod";
import type { InvoiceExtractionResult } from "./types";

const nullableFiniteNumber = z.number().finite().nullable();

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
    grossWeightKg: nullableFiniteNumber,
  }),
  invoice: z.object({
    invoiceNumber: z.string().nullable(),
    invoiceDate: z.string().nullable(),
    currency: z.string().nullable(),
    merchandiseValue: nullableFiniteNumber,
    insuranceValue: nullableFiniteNumber,
    freightValue: nullableFiniteNumber,
    totalValue: nullableFiniteNumber,
  }),
  packages: z.array(z.object({
    packageType: z.string().nullable(),
    quantity: nullableFiniteNumber,
  })),
  items: z.array(z.object({
    lineNumber: z.number().int().positive(),
    articleNumber: z.string().nullable(),
    commercialDescription: z.string().min(1),
    rawHsCode: z.string().nullable(),
    suggestedHsCode: z.string().nullable(),
    hsCodeConfidence: z.number().min(0).max(1).nullable(),
    quantity: nullableFiniteNumber,
    unitOfMeasure: z.string().nullable(),
    packageType: z.string().nullable(),
    packageCount: nullableFiniteNumber,
    statisticalQuantity: nullableFiniteNumber,
    countryOfOrigin: z.string().nullable(),
    grossWeightKg: nullableFiniteNumber,
    netWeightKg: nullableFiniteNumber,
    unitPrice: nullableFiniteNumber,
    lineTotal: nullableFiniteNumber,
    extractionConfidence: z.number().min(0).max(1),
    warnings: z.array(z.string()),
  })).min(1, "At least one invoice item is required"),
  warnings: z.array(z.string()),
});

export function validateInvoiceExtraction(raw: unknown): InvoiceExtractionResult {
  try {
    return InvoiceExtractionResultSchema.parse(raw) as InvoiceExtractionResult;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
      throw new Error(`Invoice extraction validation failed: ${issues}`);
    }
    throw error;
  }
}
