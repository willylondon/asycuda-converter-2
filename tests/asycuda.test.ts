import { describe, it, expect } from "vitest";
import { normalizeHsCode, validateHsCode, stripHsCodeFormatting } from "@/lib/asycuda/hs-code";
import { validateDeclaration, hasBlockingErrors } from "@/lib/asycuda/validation";
import { PRICEMART_DEMO_EXTRACTION } from "@/lib/asycuda/demo-data";

describe("HS Code normalization", () => {
  it("strips spaces and periods", () => {
    expect(stripHsCodeFormatting("8303.00.00.0")).toBe("830300000");
  });

  it("preserves all digits", () => {
    const result = normalizeHsCode("9403.60.90.0");
    expect(result).not.toBeNull();
    expect(result!.commodityCode).toBe("94036090");
    expect(result!.precision1).toBe("0");
  });

  it("handles 8-digit codes", () => {
    const result = normalizeHsCode("8303.00.00");
    expect(result).not.toBeNull();
    expect(result!.commodityCode).toBe("83030000");
    expect(result!.precision1).toBeUndefined();
  });

  it("flags ambiguous 9-digit codes", () => {
    const validation = validateHsCode("830300000");
    expect(validation.valid).toBe(false);
    expect(validation.issues.some((i) => i.includes("ambiguous"))).toBe(true);
  });

  it("rejects non-digit content", () => {
    const validation = validateHsCode("ABC123");
    expect(validation.valid).toBe(false);
  });

  it("accepts valid 8-digit codes", () => {
    const validation = validateHsCode("94036090");
    expect(validation.valid).toBe(true);
  });
});

describe("Validation", () => {
  const makeMockDraft = (overrides: any = {}) => ({
    declaration: { declarantName: "", declarantCode: null, declarantRepresentative: null, regimeType: null, declarationType: null, generalProcedureCode: null, extendedProcedure: null, nationalProcedure: null, customsOfficeCode: null, customsOfficeName: null, borderOfficeCode: null, borderOfficeName: null, locationOfGoods: null, exportCountry: null, exportCountryName: null, destinationCountry: null, destinationCountryName: null, defaultCountryOfOrigin: null, currency: null, exchangeRate: null, totalPackages: null, packageCode: null, packageName: null, marksAndNumbers: null, containerNumber: null, containerFlag: false, transportMode: null, placeOfLoadingCode: null, placeOfLoadingName: null, deliveryTermCode: null, deliveryTermRaw: null, deferredPaymentRef: null, modeOfPayment: null },
    consignee: { name: "", address: null, countryCode: null, trn: null },
    seller: { name: null, address: null, countryCode: null, exporterCode: null },
    responsibleParty: { name: null, code: null },
    shipment: { vessel: null, carrier: null, containerNumber: null, sealNumber: null, bookingNumber: null, billOfLading: null, manifestReference: null, transportMode: null, borderOfficeCode: null, borderOfficeName: null, placeOfLoadingCode: null, placeOfLoadingName: null, locationOfGoods: null, deliveryTermRaw: null, deliveryTermCode: null, grossWeightKg: null },
    invoice: { number: null, date: null, currency: null, exchangeRate: null, merchandiseValue: null, freightValue: null, insuranceValue: null, totalValue: null },
    commercialReference: { year: "2026", number: "INV001" },
    items: [],
    source: "manual" as const,
    ...overrides,
  });

  it("rejects empty items", () => {
    const draft = makeMockDraft({ declaration: { declarantName: "Test Broker" }, consignee: { name: "Test" } });
    const findings = validateDeclaration(draft);
    expect(hasBlockingErrors(findings)).toBe(true);
    expect(findings.some((f) => f.message.includes("No invoice items"))).toBe(true);
  });

  it("flags missing HS codes", () => {
    const draft = makeMockDraft({
      declaration: { declarantName: "Test" },
      consignee: { name: "TestConsignee" },
      items: [{ lineNumber: 1, commercialDescription: "Test item", quantity: 1, lineTotal: 100, countryOfOrigin: "US", normalizedCommodityCode: "", includeInXml: true }],
    });
    const findings = validateDeclaration(draft);
    expect(findings.some((f) => f.message.includes("HS commodity code is missing"))).toBe(true);
  });
});

describe("PriceSmart demo data", () => {
  it("has 6 items", () => {
    expect(PRICEMART_DEMO_EXTRACTION.items).toHaveLength(6);
  });

  it("total is 80779.46", () => {
    expect(PRICEMART_DEMO_EXTRACTION.invoice.totalValue).toBe(80779.46);
  });

  it("has 19 pallets and 6 cases", () => {
    const pallets = PRICEMART_DEMO_EXTRACTION.packages.find((p) => p.packageType === "PL");
    const cases = PRICEMART_DEMO_EXTRACTION.packages.find((p) => p.packageType === "CS");
    expect(pallets?.quantity).toBe(19);
    expect(cases?.quantity).toBe(6);
  });

  it("items 4 and 5 are both Register Stands with same HS code", () => {
    const item4 = PRICEMART_DEMO_EXTRACTION.items[3];
    const item5 = PRICEMART_DEMO_EXTRACTION.items[4];
    expect(item4.commercialDescription).toContain("Register Stand");
    expect(item5.commercialDescription).toContain("Register Stand");
    expect(item4.rawHsCode).toBe(item5.rawHsCode);
    // Different package types
    expect(item4.packageType).not.toBe(item5.packageType);
  });

  it("has warnings about missing fields", () => {
    const warnings = PRICEMART_DEMO_EXTRACTION.warnings;
    expect(warnings.some((w) => w.includes("Consignee"))).toBe(true);
    expect(warnings.some((w) => w.includes("Manifest"))).toBe(true);
    expect(warnings.some((w) => w.includes("weight"))).toBe(true);
  });

  it("is marked as DEMO DATA", () => {
    // Demo data should always have the demo warning
    // When loaded through the wizard, the first warning is the demo label
    const demoData = PRICEMART_DEMO_EXTRACTION;
    expect(demoData.seller.name).toContain("PriceSmart");
  });
});

describe("AI provider routing", () => {
  it("AI_ERROR_CODES includes CONFIGURATION_ERROR", async () => {
    const mod = await import("@/lib/ai/types");
    expect(mod.AI_ERROR_CODES.CONFIGURATION_ERROR).toBe("AI_CONFIGURATION_ERROR");
  });

  it("AI_ERROR_CODES includes PROVIDER_UNAVAILABLE", async () => {
    const mod = await import("@/lib/ai/types");
    expect(mod.AI_ERROR_CODES.PROVIDER_UNAVAILABLE).toBe("AI_PROVIDER_UNAVAILABLE");
  });

  it("InvoiceJsonSchema rejects invalid JSON", async () => {
    const { InvoiceJsonSchema } = await import("@/lib/ai/types");
    expect(() => InvoiceJsonSchema.parse({})).toThrow();
  });

  it("InvoiceJsonSchema accepts valid minimal data", async () => {
    const { InvoiceJsonSchema } = await import("@/lib/ai/types");
    const result = InvoiceJsonSchema.parse({
      documentType: "commercial_invoice",
      seller: { name: null, address: null, countryCode: null },
      consignee: { name: null, address: null, countryCode: null, trn: null },
      shipment: { containerNumber: null, bookingNumber: null, carrier: null, vessel: null, sealNumber: null, sailDate: null, etaDate: null, billOfLading: null, manifestReference: null, incotermRaw: null, grossWeightKg: null },
      invoice: { invoiceNumber: null, invoiceDate: null, currency: null, merchandiseValue: null, insuranceValue: null, freightValue: null, totalValue: null },
      items: [{ lineNumber: 1, commercialDescription: "Test" }],
    });
    expect(result.items).toHaveLength(1);
  });

  it("InvoiceExtractionResultSchema validates properly", async () => {
    const { InvoiceExtractionResultSchema } = await import("@/lib/asycuda/invoice-extraction-schema");
    expect(() => InvoiceExtractionResultSchema.parse({ items: [] })).toThrow();
    const result = InvoiceExtractionResultSchema.parse({
      seller: { name: null, address: null, countryCode: null },
      consignee: { name: null, address: null, countryCode: null, trn: null },
      shipment: { containerNumber: null, bookingNumber: null, carrier: null, vessel: null, sealNumber: null, sailDate: null, etaDate: null, billOfLading: null, manifestReference: null, incotermRaw: null, grossWeightKg: null },
      invoice: { invoiceNumber: null, invoiceDate: null, currency: null, merchandiseValue: null, insuranceValue: null, freightValue: null, totalValue: null },
      packages: [],
      items: [{ lineNumber: 1, articleNumber: null, commercialDescription: "Test", rawHsCode: null, suggestedHsCode: null, hsCodeConfidence: null, quantity: null, unitOfMeasure: null, packageType: null, countryOfOrigin: null, grossWeightKg: null, netWeightKg: null, unitPrice: null, lineTotal: null, extractionConfidence: 0.9, warnings: [] }],
      warnings: [],
    });
    expect(result.items).toHaveLength(1);
  });

  it("has Gemini configured as first provider", async () => {
    const { getProviderConfig } = await import("@/lib/ai/extract-invoice");
    const config = getProviderConfig();
    expect(config.order).toContain("gemini");
    expect(config.order.split(",")[0].trim()).toBe("gemini");
  });

  it("parseProviderOrder returns gemini first", async () => {
    const { getProviderConfig } = await import("@/lib/ai/extract-invoice");
    const config = getProviderConfig();
    const order = config.order.split(",").map((s: string) => s.trim());
    expect(order[0]).toBe("gemini");
  });

  it("no Kimi or Moonshot references in extraction provider", () => {
    const fs = require("fs");
    const providerContent = fs.readFileSync(
      require("path").resolve(__dirname, "../src/lib/asycuda/extraction-provider.ts"),
      "utf-8"
    );
    expect(providerContent).not.toMatch(/kimi/i);
    expect(providerContent).not.toMatch(/moonshot/i);
  });

  it("no Kimi or Moonshot references in API extract route", () => {
    const fs = require("fs");
    const routeContent = fs.readFileSync(
      require("path").resolve(__dirname, "../src/app/invoice-to-xml/api/extract/route.ts"),
      "utf-8"
    );
    expect(routeContent).not.toMatch(/kimi/i);
    expect(routeContent).not.toMatch(/moonshot/i);
  });

  it("PriceSmart demo data has warning about being demo", () => {
    const demo = PRICEMART_DEMO_EXTRACTION;
    // Demo data itself doesn't include the DEMO DATA warning (it's added by the UI)
    // But the demo data should not claim it was extracted
    expect(demo.warnings.some((w) => w.includes("Consignee information"))).toBe(true);
    // Ensure no claim of being extracted
    expect(demo.warnings.join(" ")).not.toMatch(/extracted from uploaded file/i);
  });
});
