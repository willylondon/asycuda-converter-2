/**
 * DeclarationDraft — the single source of truth for the entire declaration workflow.
 * Every validation rule and the XML builder consume this exact payload.
 * No Record<string,unknown>, no any[], no loosely assembled objects.
 */
import type { EditableLineItem } from "./types";

export interface DeclarationDraft {
  source: "ai" | "manual" | "demo";

  commercialReference: {
    year: string;
    number: string;
  };

  declaration: {
    declarantName: string;
    declarantCode: string | null;
    declarantRepresentative: string | null;
    regimeType: string | null;
    declarationType: string | null;
    generalProcedureCode: string | null;
    extendedProcedure: string | null;
    nationalProcedure: string | null;
    customsOfficeCode: string | null;
    customsOfficeName: string | null;
    borderOfficeCode: string | null;
    borderOfficeName: string | null;
    locationOfGoods: string | null;
    exportCountry: string | null;
    exportCountryName: string | null;
    destinationCountry: string | null;
    destinationCountryName: string | null;
    defaultCountryOfOrigin: string | null;
    currency: string | null;
    exchangeRate: string | null;
    totalPackages: number | null;
    packageCode: string | null;
    packageName: string | null;
    marksAndNumbers: string | null;
    containerNumber: string | null;
    containerFlag: boolean;
    transportMode: string | null;
    placeOfLoadingCode: string | null;
    placeOfLoadingName: string | null;
    deliveryTermCode: string | null;
    deliveryTermRaw: string | null;
    deferredPaymentRef: string | null;
    modeOfPayment: string | null;
  };

  seller: {
    name: string | null;
    address: string | null;
    countryCode: string | null;
    exporterCode: string | null;
  };

  consignee: {
    name: string;
    address: string | null;
    countryCode: string | null;
    trn: string | null;
  };

  responsibleParty: {
    name: string | null;
    code: string | null;
  };

  shipment: {
    vessel: string | null;
    carrier: string | null;
    containerNumber: string | null;
    sealNumber: string | null;
    bookingNumber: string | null;
    billOfLading: string | null;
    manifestReference: string | null;
    transportMode: string | null;
    borderOfficeCode: string | null;
    borderOfficeName: string | null;
    placeOfLoadingCode: string | null;
    placeOfLoadingName: string | null;
    locationOfGoods: string | null;
    deliveryTermRaw: string | null;
    deliveryTermCode: string | null;
    grossWeightKg: number | null;
  };

  invoice: {
    number: string | null;
    date: string | null;
    currency: string | null;
    exchangeRate: string | null;
    merchandiseValue: string | null;
    freightValue: string | null;
    insuranceValue: string | null;
    totalValue: string | null;
  };

  items: EditableLineItem[];
}

// ─── Commercial Reference ──────────────────────────────────────────

let _lastRefNumber = 0;

export function generateCommercialReference(): { year: string; number: string } {
  _lastRefNumber++;
  const date = new Date();
  const y = date.getFullYear().toString();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const seq = String(_lastRefNumber).padStart(4, "0");
  return { year: y, number: `INV${y}${m}${d}${seq}` };
}

export function resetCommercialReferenceCounter(): void {
  _lastRefNumber = 0;
}

// ─── Blank Draft (Manual Entry) ────────────────────────────────────

export function createBlankDeclarationDraft(): DeclarationDraft {
  return {
    source: "manual",
    commercialReference: generateCommercialReference(),
    declaration: {
      declarantName: "",
      declarantCode: null,
      declarantRepresentative: null,
      regimeType: null,
      declarationType: "IMR",
      generalProcedureCode: null,
      extendedProcedure: null,
      nationalProcedure: null,
      customsOfficeCode: null,
      customsOfficeName: null,
      borderOfficeCode: null,
      borderOfficeName: null,
      locationOfGoods: null,
      exportCountry: null,
      exportCountryName: null,
      destinationCountry: null,
      destinationCountryName: null,
      defaultCountryOfOrigin: null,
      currency: null,
      exchangeRate: null,
      totalPackages: null,
      packageCode: null,
      packageName: null,
      marksAndNumbers: null,
      containerNumber: null,
      containerFlag: false,
      transportMode: null,
      placeOfLoadingCode: null,
      placeOfLoadingName: null,
      deliveryTermCode: null,
      deliveryTermRaw: null,
      deferredPaymentRef: null,
      modeOfPayment: null,
    },
    seller: { name: null, address: null, countryCode: null, exporterCode: null },
    consignee: { name: "", address: null, countryCode: null, trn: null },
    responsibleParty: { name: null, code: null },
    shipment: {
      vessel: null, carrier: null, containerNumber: null, sealNumber: null,
      bookingNumber: null, billOfLading: null, manifestReference: null,
      transportMode: null, borderOfficeCode: null, borderOfficeName: null,
      placeOfLoadingCode: null, placeOfLoadingName: null, locationOfGoods: null,
      deliveryTermRaw: null, deliveryTermCode: null, grossWeightKg: null,
    },
    invoice: {
      number: null, date: null, currency: null, exchangeRate: null,
      merchandiseValue: null, freightValue: null, insuranceValue: null, totalValue: null,
    },
    items: [createBlankLineItem(1)],
  };
}

export function createBlankLineItem(lineNumber: number): EditableLineItem {
  return {
    lineNumber,
    articleNumber: null,
    commercialDescription: "",
    rawHsCode: null,
    suggestedHsCode: null,
    hsCodeConfidence: null,
    quantity: 1,
    unitOfMeasure: "PCS",
    packageType: null,
    countryOfOrigin: null,
    grossWeightKg: null,
    netWeightKg: null,
    unitPrice: null,
    lineTotal: null,
    extractionConfidence: 1,
    warnings: [],
    normalizedCommodityCode: "",
    precision: "",
    precision1: null,
    precision2: null,
    precision3: null,
    precision4: null,
    confirmedHsCode: null,
    hsSource: "manual",
    includeInXml: true,
  };
}

// ─── Assemble from extraction ──────────────────────────────────────

export function createDraftFromExtraction(
  extraction: { seller: any; consignee: any; shipment: any; invoice: any; packages: any[]; items: any[]; warnings: string[] },
  declarationDefaults: Partial<DeclarationDraft["declaration"]> = {},
): DeclarationDraft {
  const ref = generateCommercialReference();
  return {
    source: "ai",
    commercialReference: ref,
    declaration: {
      declarantName: declarationDefaults.declarantName || "",
      declarantCode: declarationDefaults.declarantCode || null,
      declarantRepresentative: declarationDefaults.declarantRepresentative || null,
      regimeType: declarationDefaults.regimeType || null,
      declarationType: declarationDefaults.declarationType || null,
      generalProcedureCode: declarationDefaults.generalProcedureCode || null,
      extendedProcedure: declarationDefaults.extendedProcedure || null,
      nationalProcedure: declarationDefaults.nationalProcedure || null,
      customsOfficeCode: declarationDefaults.customsOfficeCode || null,
      customsOfficeName: declarationDefaults.customsOfficeName || null,
      borderOfficeCode: null,
      borderOfficeName: null,
      locationOfGoods: declarationDefaults.locationOfGoods || null,
      exportCountry: extraction.seller?.countryCode || declarationDefaults.exportCountry || null,
      exportCountryName: null,
      destinationCountry: extraction.consignee?.countryCode || declarationDefaults.destinationCountry || null,
      destinationCountryName: null,
      defaultCountryOfOrigin: declarationDefaults.defaultCountryOfOrigin || null,
      currency: extraction.invoice?.currency || declarationDefaults.currency || null,
      exchangeRate: declarationDefaults.exchangeRate || null,
      totalPackages: extraction.packages?.reduce((s: number, p: any) => s + (p.quantity || 0), 0) || null,
      packageCode: declarationDefaults.packageCode || null,
      packageName: declarationDefaults.packageName || null,
      marksAndNumbers: declarationDefaults.marksAndNumbers || null,
      containerNumber: extraction.shipment?.containerNumber || declarationDefaults.containerNumber || null,
      containerFlag: false,
      transportMode: declarationDefaults.transportMode || null,
      placeOfLoadingCode: declarationDefaults.placeOfLoadingCode || null,
      placeOfLoadingName: declarationDefaults.placeOfLoadingName || null,
      deliveryTermCode: null,
      deliveryTermRaw: extraction.shipment?.incotermRaw || null,
      deferredPaymentRef: declarationDefaults.deferredPaymentRef || null,
      modeOfPayment: declarationDefaults.modeOfPayment || null,
    },
    seller: {
      name: extraction.seller?.name || null,
      address: extraction.seller?.address || null,
      countryCode: extraction.seller?.countryCode || null,
      exporterCode: null,
    },
    consignee: {
      name: extraction.consignee?.name || "",
      address: extraction.consignee?.address || null,
      countryCode: extraction.consignee?.countryCode || null,
      trn: extraction.consignee?.trn || null,
    },
    responsibleParty: { name: null, code: null },
    shipment: {
      vessel: extraction.shipment?.vessel || null,
      carrier: extraction.shipment?.carrier || null,
      containerNumber: extraction.shipment?.containerNumber || null,
      sealNumber: extraction.shipment?.sealNumber || null,
      bookingNumber: extraction.shipment?.bookingNumber || null,
      billOfLading: extraction.shipment?.billOfLading || null,
      manifestReference: extraction.shipment?.manifestReference || null,
      transportMode: declarationDefaults.transportMode || null,
      borderOfficeCode: null,
      borderOfficeName: null,
      placeOfLoadingCode: null,
      placeOfLoadingName: null,
      locationOfGoods: declarationDefaults.locationOfGoods || null,
      deliveryTermRaw: extraction.shipment?.incotermRaw || null,
      deliveryTermCode: null,
      grossWeightKg: extraction.shipment?.grossWeightKg || null,
    },
    invoice: {
      number: extraction.invoice?.invoiceNumber || null,
      date: extraction.invoice?.invoiceDate || null,
      currency: extraction.invoice?.currency || null,
      exchangeRate: declarationDefaults.exchangeRate || null,
      merchandiseValue: extraction.invoice?.merchandiseValue?.toString() || null,
      freightValue: extraction.invoice?.freightValue?.toString() || null,
      insuranceValue: extraction.invoice?.insuranceValue?.toString() || null,
      totalValue: extraction.invoice?.totalValue?.toString() || null,
    },
    items: extraction.items.map((item: any, i: number) => ({
      lineNumber: item.lineNumber || i + 1,
      articleNumber: item.articleNumber || null,
      commercialDescription: item.commercialDescription || "",
      rawHsCode: item.rawHsCode || null,
      suggestedHsCode: item.suggestedHsCode || null,
      hsCodeConfidence: item.hsCodeConfidence || null,
      quantity: item.quantity || null,
      unitOfMeasure: item.unitOfMeasure || "PCS",
      packageType: item.packageType || null,
      countryOfOrigin: item.countryOfOrigin || null,
      grossWeightKg: item.grossWeightKg || null,
      netWeightKg: item.netWeightKg || null,
      unitPrice: item.unitPrice || null,
      lineTotal: item.lineTotal || null,
      extractionConfidence: item.extractionConfidence || 0.5,
      warnings: item.warnings || [],
      normalizedCommodityCode: (item.rawHsCode || "").replace(/[.\s]+/g, "").slice(0, 8),
      precision: (item.rawHsCode || "").replace(/[.\s]+/g, "").slice(8),
      precision1: null,
      precision2: null,
      precision3: null,
      precision4: null,
      confirmedHsCode: null,
      hsSource: item.rawHsCode ? "invoice" as const : item.suggestedHsCode ? "ai-suggestion" as const : "manual" as const,
      includeInXml: true,
    })),
  };
}
