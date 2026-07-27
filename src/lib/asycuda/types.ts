/**
 * Shared types for the ASYCUDA invoice-to-XML service.
 *
 * These types model:
 *  - DeclarationData: the user-confirmed customs declaration form data
 *  - InvoiceExtractionResult: values extracted from the commercial invoice (AI/OCR)
 */

// ─── Extraction result (matches Kimi K3 output) ───────────────────

export interface ExtractionSeller {
  name: string | null;
  address: string | null;
  countryCode: string | null;
}

export interface ExtractionConsignee {
  name: string | null;
  address: string | null;
  countryCode: string | null;
  trn: string | null;
}

export interface ExtractionShipment {
  containerNumber: string | null;
  bookingNumber: string | null;
  carrier: string | null;
  vessel: string | null;
  sealNumber: string | null;
  sailDate: string | null;
  etaDate: string | null;
  billOfLading: string | null;
  manifestReference: string | null;
  incotermRaw: string | null;
  grossWeightKg: number | null;
}

export interface ExtractionInvoice {
  invoiceNumber: string | null;
  invoiceDate: string | null;
  currency: string | null;
  merchandiseValue: number | null;
  insuranceValue: number | null;
  freightValue: number | null;
  totalValue: number | null;
}

export interface ExtractionPackage {
  packageType: string | null;
  quantity: number | null;
}

export interface ExtractionItem {
  lineNumber: number;
  articleNumber: string | null;
  commercialDescription: string;
  rawHsCode: string | null;
  suggestedHsCode: string | null;
  hsCodeConfidence: number | null;
  quantity: number | null;
  unitOfMeasure: string | null;
  packageType: string | null;
  countryOfOrigin: string | null;
  grossWeightKg: number | null;
  netWeightKg: number | null;
  unitPrice: number | null;
  lineTotal: number | null;
  extractionConfidence: number;
  warnings: string[];
}

export interface InvoiceExtractionResult {
  documentType: "commercial_invoice" | "packing_list" | "unknown";
  seller: ExtractionSeller;
  consignee: ExtractionConsignee;
  shipment: ExtractionShipment;
  invoice: ExtractionInvoice;
  packages: ExtractionPackage[];
  items: ExtractionItem[];
  warnings: string[];
}

// ─── HS Code ───────────────────────────────────────────────────────

export interface NormalizedHsCode {
  commodityCode: string;
  precision1?: string;
  precision2?: string;
}

export interface HsCodeValidation {
  valid: boolean;
  issues: string[];
}

// ─── Editable item (wizard internal) ──────────────────────────────

export interface EditableLineItem extends ExtractionItem {
  normalizedCommodityCode: string;
  precision: string;
  confirmedHsCode: string | null;
  includeInXml: boolean;
  hsSource: "invoice" | "kimi-suggestion" | "manual" | "saved-mapping";
}

// ─── Validation ────────────────────────────────────────────────────

export type ValidationSeverity = "error" | "warning" | "info";

export interface ValidationFinding {
  type: ValidationSeverity;
  message: string;
  field?: string;
  line?: number;
}

// ─── XML generation ────────────────────────────────────────────────

export interface AsycudaXmlInput {
  declaration: Record<string, unknown>;
  items: Record<string, unknown>[];
}

export type ExportXmlStatus = "clean" | "warnings" | "errors";

export interface ExportXmlResponse {
  xml: string | null;
  validation: ValidationFinding[];
  status: ExportXmlStatus;
}
