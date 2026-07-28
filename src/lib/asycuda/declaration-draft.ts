import type { DeclarationDetails } from "@/components/invoice-to-xml/DeclarationDetailsStep";
import { normalizeHsCode } from "./hs-code";
import type { EditableLineItem, InvoiceExtractionResult } from "./types";

/** Single source of truth for review, validation and XML generation. */
export interface DeclarationDraft {
  source: "ai" | "manual" | "demo";
  warnings: string[];

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

function nullable(value: string | undefined | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function generateCommercialReference(): { year: string; number: string } {
  const date = new Date();
  const year = date.getFullYear().toString();
  const stamp = `${year}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const random = globalThis.crypto?.randomUUID?.().replace(/-/g, "").slice(0, 8).toUpperCase()
    ?? Math.random().toString(36).slice(2, 10).toUpperCase();
  return { year, number: `INV${stamp}${random}` };
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
    unitOfMeasure: "NMB",
    packageType: null,
    packageCount: null,
    statisticalQuantity: 1,
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
    hsConfirmed: false,
    hsSource: "manual",
    includeInXml: true,
  };
}

export function createBlankDeclarationDraft(): DeclarationDraft {
  return {
    source: "manual",
    warnings: [],
    commercialReference: generateCommercialReference(),
    declaration: {
      declarantName: "",
      declarantCode: null,
      declarantRepresentative: null,
      regimeType: null,
      declarationType: null,
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
      vessel: null,
      carrier: null,
      containerNumber: null,
      sealNumber: null,
      bookingNumber: null,
      billOfLading: null,
      manifestReference: null,
      transportMode: null,
      borderOfficeCode: null,
      borderOfficeName: null,
      placeOfLoadingCode: null,
      placeOfLoadingName: null,
      locationOfGoods: null,
      deliveryTermRaw: null,
      deliveryTermCode: null,
      grossWeightKg: null,
    },
    invoice: {
      number: null,
      date: null,
      currency: null,
      exchangeRate: null,
      merchandiseValue: null,
      freightValue: null,
      insuranceValue: null,
      totalValue: null,
    },
    items: [createBlankLineItem(1)],
  };
}

export function applyDeclarationDetails(draft: DeclarationDraft, details: DeclarationDetails): DeclarationDraft {
  const totalPackages = details.totalPackages?.trim() ? Number(details.totalPackages) : null;
  const next: DeclarationDraft = structuredClone(draft);

  next.declaration = {
    declarantName: details.declarantName.trim(),
    declarantCode: nullable(details.declarantTrn),
    declarantRepresentative: nullable(details.declarantRepresentative),
    regimeType: nullable(details.regimeType),
    declarationType: nullable(details.declarationType),
    generalProcedureCode: nullable(details.generalProcedureCode),
    extendedProcedure: nullable(details.extendedProcedure),
    nationalProcedure: nullable(details.nationalProcedure),
    customsOfficeCode: nullable(details.customsOfficeCode),
    customsOfficeName: nullable(details.customsOfficeName),
    borderOfficeCode: nullable(details.borderOfficeCode),
    borderOfficeName: nullable(details.borderOfficeName),
    locationOfGoods: nullable(details.locationOfGoods),
    exportCountry: nullable(details.exportCountry)?.toUpperCase() ?? null,
    exportCountryName: nullable(details.exportCountryName),
    destinationCountry: nullable(details.destinationCountry)?.toUpperCase() ?? null,
    destinationCountryName: nullable(details.destinationCountryName),
    defaultCountryOfOrigin: nullable(details.defaultCountryOfOrigin)?.toUpperCase() ?? null,
    currency: nullable(details.currency)?.toUpperCase() ?? null,
    exchangeRate: nullable(details.exchangeRate),
    totalPackages: Number.isFinite(totalPackages) ? totalPackages : null,
    packageCode: nullable(details.packageCode || details.packageType)?.toUpperCase() ?? null,
    packageName: nullable(details.packageName),
    marksAndNumbers: nullable(details.marksAndNumbers),
    containerNumber: nullable(details.containerNumber)?.toUpperCase() ?? null,
    containerFlag: Boolean(nullable(details.containerNumber)),
    transportMode: nullable(details.transportMode),
    placeOfLoadingCode: nullable(details.placeOfLoadingCode),
    placeOfLoadingName: nullable(details.placeOfLoadingName || details.placeOfLoading),
    deliveryTermCode: nullable(details.deliveryTermCode)?.toUpperCase() ?? null,
    deliveryTermRaw: draft.declaration.deliveryTermRaw,
    deferredPaymentRef: nullable(details.deferredPaymentRef),
    modeOfPayment: nullable(details.modeOfPayment),
  };

  next.consignee = {
    ...next.consignee,
    name: details.consigneeName?.trim() || "",
    address: nullable(details.consigneeAddress) ?? next.consignee.address,
    countryCode: next.declaration.destinationCountry,
    trn: nullable(details.consigneeTrn),
  };
  next.responsibleParty = {
    name: nullable(details.responsiblePartyName),
    code: nullable(details.responsiblePartyCode),
  };
  next.shipment = {
    ...next.shipment,
    containerNumber: next.declaration.containerNumber,
    billOfLading: nullable(details.blAwb),
    manifestReference: nullable(details.manifestReference),
    transportMode: next.declaration.transportMode,
    borderOfficeCode: next.declaration.borderOfficeCode,
    borderOfficeName: next.declaration.borderOfficeName,
    placeOfLoadingCode: next.declaration.placeOfLoadingCode,
    placeOfLoadingName: next.declaration.placeOfLoadingName,
    locationOfGoods: next.declaration.locationOfGoods,
    deliveryTermCode: next.declaration.deliveryTermCode,
  };
  next.invoice.currency = next.declaration.currency;
  next.invoice.exchangeRate = next.declaration.exchangeRate;
  return next;
}

export function declarationDetailsFromDraft(draft: DeclarationDraft): DeclarationDetails {
  const d = draft.declaration;
  return {
    declarantName: d.declarantName,
    declarantTrn: d.declarantCode ?? "",
    declarantRepresentative: d.declarantRepresentative ?? "",
    consigneeName: draft.consignee.name,
    consigneeAddress: draft.consignee.address ?? "",
    consigneeTrn: draft.consignee.trn ?? "",
    responsiblePartyName: draft.responsibleParty.name ?? "",
    responsiblePartyCode: draft.responsibleParty.code ?? "",
    manifestReference: draft.shipment.manifestReference ?? "",
    blAwb: draft.shipment.billOfLading ?? "",
    regimeType: d.regimeType ?? "",
    declarationType: d.declarationType ?? "",
    generalProcedureCode: d.generalProcedureCode ?? "",
    extendedProcedure: d.extendedProcedure ?? "",
    nationalProcedure: d.nationalProcedure ?? "",
    customsOfficeCode: d.customsOfficeCode ?? "",
    customsOfficeName: d.customsOfficeName ?? "",
    borderOfficeCode: d.borderOfficeCode ?? "",
    borderOfficeName: d.borderOfficeName ?? "",
    locationOfGoods: d.locationOfGoods ?? "",
    exportCountry: d.exportCountry ?? "",
    exportCountryName: d.exportCountryName ?? "",
    destinationCountry: d.destinationCountry ?? "",
    destinationCountryName: d.destinationCountryName ?? "",
    defaultCountryOfOrigin: d.defaultCountryOfOrigin ?? "",
    currency: d.currency ?? "",
    exchangeRate: d.exchangeRate ?? "",
    totalPackages: d.totalPackages?.toString() ?? "",
    packageCode: d.packageCode ?? "",
    packageName: d.packageName ?? "",
    packageType: d.packageCode ?? "",
    marksAndNumbers: d.marksAndNumbers ?? "",
    containerNumber: d.containerNumber ?? "",
    transportMode: d.transportMode ?? "",
    placeOfLoading: d.placeOfLoadingName ?? "",
    placeOfLoadingCode: d.placeOfLoadingCode ?? "",
    placeOfLoadingName: d.placeOfLoadingName ?? "",
    deliveryTermCode: d.deliveryTermCode ?? "",
    deferredPaymentRef: d.deferredPaymentRef ?? "",
    modeOfPayment: d.modeOfPayment ?? "",
  };
}

export function createDraftFromExtraction(
  extraction: InvoiceExtractionResult,
  baseDraft: DeclarationDraft,
  source: "ai" | "demo" = "ai",
): DeclarationDraft {
  const next = structuredClone(baseDraft);
  next.source = source;
  next.warnings = [...extraction.warnings];
  next.seller = {
    name: extraction.seller.name,
    address: extraction.seller.address,
    countryCode: extraction.seller.countryCode?.toUpperCase() ?? null,
    exporterCode: null,
  };

  // Manually entered consignee is authoritative. Extracted address/country only fill gaps.
  next.consignee = {
    name: baseDraft.consignee.name || extraction.consignee.name || "",
    address: baseDraft.consignee.address || extraction.consignee.address,
    countryCode: baseDraft.consignee.countryCode || extraction.consignee.countryCode?.toUpperCase() || null,
    trn: baseDraft.consignee.trn || extraction.consignee.trn,
  };

  next.shipment = {
    ...next.shipment,
    vessel: extraction.shipment.vessel,
    carrier: extraction.shipment.carrier,
    containerNumber: extraction.shipment.containerNumber || baseDraft.shipment.containerNumber,
    sealNumber: extraction.shipment.sealNumber,
    bookingNumber: extraction.shipment.bookingNumber,
    billOfLading: baseDraft.shipment.billOfLading || extraction.shipment.billOfLading,
    manifestReference: baseDraft.shipment.manifestReference || extraction.shipment.manifestReference,
    deliveryTermRaw: extraction.shipment.incotermRaw,
    grossWeightKg: extraction.shipment.grossWeightKg,
  };
  next.declaration.deliveryTermRaw = extraction.shipment.incotermRaw;
  next.declaration.containerNumber = next.shipment.containerNumber;
  next.declaration.containerFlag = Boolean(next.shipment.containerNumber);

  next.invoice = {
    number: extraction.invoice.invoiceNumber,
    date: extraction.invoice.invoiceDate,
    currency: baseDraft.invoice.currency || extraction.invoice.currency?.toUpperCase() || null,
    exchangeRate: baseDraft.invoice.exchangeRate,
    merchandiseValue: extraction.invoice.merchandiseValue?.toString() ?? null,
    freightValue: extraction.invoice.freightValue?.toString() ?? null,
    insuranceValue: extraction.invoice.insuranceValue?.toString() ?? null,
    totalValue: extraction.invoice.totalValue?.toString() ?? null,
  };

  const packageTotal = extraction.packages.reduce((sum, pkg) => sum + (pkg.quantity ?? 0), 0);
  if (!next.declaration.totalPackages && packageTotal > 0) next.declaration.totalPackages = packageTotal;

  next.items = extraction.items.map((item, index): EditableLineItem => {
    const raw = item.rawHsCode || item.suggestedHsCode || "";
    const normalized = normalizeHsCode(raw);
    const precision = [normalized?.precision1, normalized?.precision2, normalized?.precision3, normalized?.precision4]
      .filter(Boolean)
      .join("");
    return {
      ...item,
      lineNumber: item.lineNumber || index + 1,
      rawHsCode: item.rawHsCode,
      normalizedCommodityCode: normalized?.commodityCode ?? "",
      precision,
      precision1: normalized?.precision1 ?? null,
      precision2: normalized?.precision2 ?? null,
      precision3: normalized?.precision3 ?? null,
      precision4: normalized?.precision4 ?? null,
      confirmedHsCode: null,
      hsConfirmed: false,
      hsSource: item.rawHsCode ? "invoice" : item.suggestedHsCode ? "ai-suggestion" : "manual",
      includeInXml: true,
      packageCount: null,
      statisticalQuantity: item.quantity,
    };
  });

  if (next.items.length === 0) next.items = [createBlankLineItem(1)];
  return next;
}
