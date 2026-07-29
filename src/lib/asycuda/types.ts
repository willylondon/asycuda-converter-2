/** Shared types for the Invoice-to-ASYCUDA workflow. */

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
  /** Product/unit quantity shown on the invoice. */
  quantity: number | null;
  unitOfMeasure: string | null;
  packageType: string | null;
  /** Number of packages for this line, kept separate from product quantity. */
  packageCount: number | null;
  /** Statistical/supplementary quantity for Box 41 when shown. */
  statisticalQuantity: number | null;
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

export interface NormalizedHsCode {
  commodityCode: string;
  precision1?: string;
  precision2?: string;
  precision3?: string;
  precision4?: string;
}

export interface HsCodeValidation {
  valid: boolean;
  issues: string[];
}

export interface JamaicaTariffRates {
  importDuty: string | null;
  additionalStampDuty: string | null;
  gct: string | null;
  excise: string | null;
  scta: string | null;
  scts: string | null;
  sctf: string | null;
  standardComplianceFee: string | null;
  environmentalLevy: string | null;
  developmentCess: string | null;
  raw: string[];
}

export interface JamaicaTariffEntry {
  code: string;
  description: string;
  units: string[];
  rates: JamaicaTariffRates;
  effectiveDate: string;
  sourceUrl: string;
  source: "jca-pdf-2026" | "jamaica-trade-portal-api";
}

export interface EditableLineItem extends ExtractionItem {
  /** Confirmed ASYCUDA commodity-code portion, normally eight digits. */
  normalizedCommodityCode: string;
  /** Full remainder retained for display and audit. */
  precision: string;
  precision1: string | null;
  precision2: string | null;
  precision3: string | null;
  precision4: string | null;
  confirmedHsCode: string | null;
  hsConfirmed: boolean;
  includeInXml: boolean;
  hsSource: "invoice" | "ai-suggestion" | "manual" | "saved-mapping" | "jca-tariff";
  /** Official 10-digit Jamaican tariff selected by the declarant. */
  officialJamaicaTariffCode?: string | null;
  officialTariffDescription?: string | null;
  officialTariffUnits?: string[];
  officialTariffRates?: JamaicaTariffRates | null;
  officialTariffEffectiveDate?: string | null;
  officialTariffSourceUrl?: string | null;
  officialTariffSource?: JamaicaTariffEntry["source"] | null;
  tariffVerified?: boolean;
}

export type ValidationSeverity = "error" | "warning" | "info";

export interface ValidationFinding {
  type: ValidationSeverity;
  message: string;
  field?: string;
  line?: number;
}

export type ExportXmlStatus = "clean" | "warnings" | "errors";

export interface ExportXmlResponse {
  xml: string | null;
  validation: ValidationFinding[];
  status: ExportXmlStatus;
}
