import { z } from "zod";

/**
 * Zod schemas for AI-driven commercial invoice extraction.
 *
 * These schemas are the single source of truth for the shape of data
 * returned by an `InvoiceExtractionProvider` (see extraction-provider.ts).
 * The extraction provider instructs the LLM to produce JSON matching
 * `InvoiceExtractionResultSchema` and validates the response with it
 * server-side before anything reaches the client.
 */

/** A party on the invoice (seller/exporter, consignee, etc.). */
export const ExtractedPartySchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  country: z.string().optional(),
});

export type ExtractedParty = z.infer<typeof ExtractedPartySchema>;

/** Transport / shipment references found on the invoice. */
export const ExtractedTransportSchema = z.object({
  containerNumber: z.string().optional(),
  bookingNumber: z.string().optional(),
  carrier: z.string().optional(),
  vesselName: z.string().optional(),
  portOfLoading: z.string().optional(),
  portOfDischarge: z.string().optional(),
});

export type ExtractedTransport = z.infer<typeof ExtractedTransportSchema>;

/** A package count line, e.g. 19 pallets, 6 cases. */
export const ExtractedPackageSchema = z.object({
  packageType: z.string().min(1),
  count: z.number().int().positive(),
});

export type ExtractedPackage = z.infer<typeof ExtractedPackageSchema>;

/** A single invoice line item. */
export const ExtractedInvoiceItemSchema = z.object({
  lineNumber: z.number().int().positive(),
  articleNumber: z.string().min(1),
  description: z.string().min(1),
  hsCode: z.string().min(4),
  quantity: z.number().positive(),
  unitOfMeasure: z.string().min(1),
  netWeightKg: z.number().nonnegative(),
  unitPrice: z.number().nonnegative(),
  totalPrice: z.number().nonnegative(),
});

export type ExtractedInvoiceItem = z.infer<typeof ExtractedInvoiceItemSchema>;

/** Per-field confidence scores, 0..1. Keys are dot paths, e.g. "items.2.hsCode". */
export const ExtractionConfidenceSchema = z.object({
  overall: z.number().min(0).max(1),
  fields: z.record(z.string(), z.number().min(0).max(1)).default({}),
});

export type ExtractionConfidence = z.infer<typeof ExtractionConfidenceSchema>;

/** The full structured extraction result for one commercial invoice. */
export const InvoiceExtractionResultSchema = z.object({
  invoiceNumber: z.string().min(1),
  invoiceDate: z.string().min(1),
  currency: z.string().length(3),
  seller: ExtractedPartySchema,
  consignee: ExtractedPartySchema.optional(),
  transport: ExtractedTransportSchema,
  packages: z.array(ExtractedPackageSchema),
  items: z.array(ExtractedInvoiceItemSchema).min(1),
  totalValue: z.number().nonnegative(),
  totalNetWeightKg: z.number().nonnegative().optional(),
  confidence: ExtractionConfidenceSchema,
  warnings: z.array(z.string()).default([]),
});

export type InvoiceExtractionResult = z.infer<typeof InvoiceExtractionResultSchema>;
