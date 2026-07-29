import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { XMLParser } from "fast-xml-parser";
import { describe, expect, it } from "vitest";
import { buildAsycudaXml } from "@/lib/asycuda/build-asycuda-xml";
import { createExtractionDraft } from "@/lib/asycuda/create-extraction-draft";
import {
  createBlankDeclarationDraft,
  type DeclarationDraft,
} from "@/lib/asycuda/declaration-draft";
import { formatMinorUnits, sumMinorUnits, toMinorUnits } from "@/lib/asycuda/decimal";
import { PRICEMART_DEMO_EXTRACTION } from "@/lib/asycuda/demo-data";
import { normalizeHsCode, stripHsCodeFormatting, validateHsCode } from "@/lib/asycuda/hs-code";
import { hasBlockingErrors, validateDeclaration } from "@/lib/asycuda/validation";
import {
  searchJamaicaTariff,
  splitJamaicaTariffCode,
} from "@/lib/tariff/jamaica-tariff";

const OFFICIAL_CODES: Record<string, { code: string; description: string }> = {
  "83030000": {
    code: "8303000000",
    description: "Armoured or reinforced safes, strong-boxes and doors and safe deposit lockers for strong-rooms, cash or deed boxes and the like, of base metal.",
  },
  "84254900": { code: "8425490000", description: "Other jacks and hoists" },
  "84388000": { code: "8438800000", description: "Other machinery for the industrial preparation or manufacture of food or drink" },
  "94036090": { code: "9403609000", description: "Other wooden furniture" },
};

function createReadyDraft(): DeclarationDraft {
  const base = createBlankDeclarationDraft();
  base.declaration = {
    ...base.declaration,
    declarantName: "Kingston Customs Brokers & Sons",
    declarantCode: "001234567",
    declarantRepresentative: "Marcus Reid",
    regimeType: "IM4",
    declarationType: "SAD",
    generalProcedureCode: "4000",
    extendedProcedure: "4000",
    nationalProcedure: "21",
    customsOfficeCode: "JMKIN01",
    customsOfficeName: "Kingston <Clearance> Office",
    borderOfficeCode: "JMKIN01",
    borderOfficeName: "Kingston Port",
    locationOfGoods: "KINGSTON CONTAINER TERMINAL",
    exportCountry: "US",
    exportCountryName: "United States",
    destinationCountry: "JM",
    destinationCountryName: "Jamaica",
    defaultCountryOfOrigin: "US",
    currency: "USD",
    exchangeRate: "156.50",
    totalPackages: 25,
    packageCode: "PL",
    packageName: "Pallet",
    marksAndNumbers: "PRICESMART & JAMAICA",
    containerNumber: "SMLU7871623",
    containerFlag: true,
    transportMode: "1",
    placeOfLoadingCode: "USPEF",
    placeOfLoadingName: "Port Everglades",
    deliveryTermCode: "CNI",
    deliveryTermRaw: "C&I (Cost & Insurance)",
    modeOfPayment: "D",
  };
  base.consignee = {
    name: "PriceSmart Jamaica Ltd",
    address: "Kingston, Jamaica",
    countryCode: "JM",
    trn: "002345678",
  };
  base.responsibleParty = { name: "PriceSmart Jamaica Ltd", code: "002345678" };
  base.shipment = {
    ...base.shipment,
    billOfLading: "SEAB2407123",
    manifestReference: "MAN-2026-07891",
    transportMode: "1",
    borderOfficeCode: "JMKIN01",
    borderOfficeName: "Kingston Port",
    placeOfLoadingCode: "USPEF",
    placeOfLoadingName: "Port Everglades",
    locationOfGoods: "KINGSTON CONTAINER TERMINAL",
    deliveryTermRaw: "C&I (Cost & Insurance)",
    deliveryTermCode: "CNI",
  };

  const draft = createExtractionDraft(PRICEMART_DEMO_EXTRACTION, base, "demo");
  draft.invoice.exchangeRate = "156.50";
  draft.items = draft.items.map((item) => {
    const official = OFFICIAL_CODES[item.normalizedCommodityCode];
    if (!official) throw new Error(`Missing official test tariff for ${item.normalizedCommodityCode}`);
    const split = splitJamaicaTariffCode(official.code);
    return {
      ...item,
      normalizedCommodityCode: split.commodityCode,
      precision1: split.precision1,
      precision2: split.precision2,
      precision3: split.precision3,
      precision4: split.precision4,
      precision: [split.precision1, split.precision2].filter(Boolean).join(""),
      hsConfirmed: true,
      confirmedHsCode: official.code,
      hsSource: "jca-tariff" as const,
      officialJamaicaTariffCode: official.code,
      officialTariffDescription: official.description,
      officialTariffUnits: ["kg", "u"],
      officialTariffRates: null,
      officialTariffEffectiveDate: "2026-02-27",
      officialTariffSourceUrl: "https://jca.gov.jm/",
      officialTariffSource: "jca-pdf-2026" as const,
      tariffVerified: true,
    };
  });
  return draft;
}

describe("HS-code handling", () => {
  it("preserves every printed digit", () => {
    expect(stripHsCodeFormatting("8303.00.00.0")).toBe("830300000");
    const result = normalizeHsCode("9403.60.90.0");
    expect(result?.commodityCode).toBe("94036090");
    expect(result?.precision1).toBe("0");
  });

  it("keeps eight-digit codes without inventing precision", () => {
    const result = normalizeHsCode("8303.00.00");
    expect(result?.commodityCode).toBe("83030000");
    expect(result?.precision1).toBeUndefined();
  });

  it("flags a raw nine-digit code as ambiguous until reviewed", () => {
    const validation = validateHsCode("830300000");
    expect(validation.valid).toBe(false);
    expect(validation.issues.some((issue) => issue.includes("ambiguous"))).toBe(true);
  });

  it("rejects non-numeric content", () => {
    expect(validateHsCode("ABC123").valid).toBe(false);
  });
});

describe("Jamaica tariff lookup", () => {
  it("splits the official 10-digit tariff into ASYCUDA commodity and precision fields", () => {
    expect(splitJamaicaTariffCode("9403609000")).toEqual({
      commodityCode: "94036090",
      precision1: "0",
      precision2: "0",
      precision3: null,
      precision4: null,
    });
  });

  it("finds the official PriceSmart safe tariff in the JCA client-demo catalogue", async () => {
    const response = await searchJamaicaTariff("8303.00.00.0");
    expect(response.results[0]?.code).toBe("8303000000");
    expect(response.results[0]?.description).toContain("safes");
    expect(response.results[0]?.effectiveDate).toBe("2026-02-27");
  });

  it("supports description search", async () => {
    const response = await searchJamaicaTariff("pallet jacks hoists");
    expect(response.results.some((entry) => entry.code === "8425490000")).toBe(true);
  });
});

describe("decimal-safe arithmetic", () => {
  it("reconciles the PriceSmart line totals exactly", () => {
    const total = sumMinorUnits(PRICEMART_DEMO_EXTRACTION.items.map((item) => item.lineTotal));
    expect(formatMinorUnits(total)).toBe("80779.46");
    expect(total).toBe(toMinorUnits("80779.46"));
  });

  it("rounds decimal input to minor units without floating-point addition", () => {
    expect(toMinorUnits("10.005")).toBe(1001n);
    expect(formatMinorUnits(1001n)).toBe("10.01");
  });
});

describe("declaration validation", () => {
  it("blocks a declaration with no included items", () => {
    const draft = createReadyDraft();
    draft.items = [];
    const findings = validateDeclaration(draft);
    expect(hasBlockingErrors(findings)).toBe(true);
    expect(findings.some((finding) => finding.message.includes("At least one invoice item"))).toBe(true);
  });

  it("blocks an unconfirmed HS code", () => {
    const draft = createReadyDraft();
    draft.items[0].hsConfirmed = false;
    draft.items[0].confirmedHsCode = null;
    const findings = validateDeclaration(draft);
    expect(findings.some((finding) => finding.message.includes("reviewed and confirmed"))).toBe(true);
  });

  it("blocks an item that has not been verified against the Jamaican tariff", () => {
    const draft = createReadyDraft();
    draft.items[0].tariffVerified = false;
    draft.items[0].officialJamaicaTariffCode = null;
    const findings = validateDeclaration(draft);
    expect(findings.some((finding) => finding.message.includes("official 10-digit Jamaican tariff"))).toBe(true);
  });

  it("blocks a mismatch between official tariff and ASYCUDA fields", () => {
    const draft = createReadyDraft();
    draft.items[0].precision2 = "9";
    const findings = validateDeclaration(draft);
    expect(findings.some((finding) => finding.message.includes("do not match official tariff"))).toBe(true);
  });

  it("blocks missing package quantity instead of copying product quantity", () => {
    const draft = createReadyDraft();
    draft.items[0].packageCount = null;
    const findings = validateDeclaration(draft);
    expect(findings.some((finding) => finding.message.includes("Number of packages is required"))).toBe(true);
  });

  it("blocks a printed delivery term that has not been mapped", () => {
    const draft = createReadyDraft();
    draft.shipment.deliveryTermCode = null;
    const findings = validateDeclaration(draft);
    expect(findings.some((finding) => finding.message.includes("must be mapped and confirmed"))).toBe(true);
  });

  it("passes blocking checks for a completed controlled test declaration", () => {
    const findings = validateDeclaration(createReadyDraft());
    expect(hasBlockingErrors(findings)).toBe(false);
    expect(findings.some((finding) => finding.message.includes("Shipment gross weight"))).toBe(true);
  });
});

describe("PriceSmart fixture", () => {
  it("contains six separate items and reconciles to USD 80,779.46", () => {
    expect(PRICEMART_DEMO_EXTRACTION.items).toHaveLength(6);
    expect(PRICEMART_DEMO_EXTRACTION.invoice.totalValue).toBe(80779.46);
  });

  it("keeps same-code register stands as separate rows", () => {
    const item4 = PRICEMART_DEMO_EXTRACTION.items[3];
    const item5 = PRICEMART_DEMO_EXTRACTION.items[4];
    expect(item4.rawHsCode).toBe(item5.rawHsCode);
    expect(item4.packageType).not.toBe(item5.packageType);
    expect(item4.articleNumber).not.toBe(item5.articleNumber);
  });

  it("contains explicit package counts rather than inferred values", () => {
    expect(PRICEMART_DEMO_EXTRACTION.items.map((item) => item.packageCount)).toEqual([1, 10, 1, 6, 6, 1]);
  });
});

describe("ASYCUDA XML generation", () => {
  it("generates well-formed XML with the declaration first", () => {
    const xml = buildAsycudaXml(createReadyDraft());
    expect(xml.startsWith("<?xml")).toBe(true);
    expect(() => new XMLParser({ ignoreAttributes: false }).parse(xml)).not.toThrow();
  });

  it("keeps major ASYCUDA sections as root-level siblings in order", () => {
    const xml = buildAsycudaXml(createReadyDraft());
    const rootChildren = Array.from(xml.matchAll(/^  <([A-Za-z0-9_.-]+)>/gm), (match) => match[1]);
    expect(rootChildren.slice(0, 14)).toEqual([
      "Export_release",
      "Assessment_notice",
      "Property",
      "Identification",
      "Traders",
      "Declarant",
      "General_information",
      "Transport",
      "Financial",
      "Warehouse",
      "Transit",
      "Valuation",
      "Item",
      "Item",
    ]);
  });

  it("maps exporter, importer, declarant, commercial reference and Box 40 source", () => {
    const draft = createReadyDraft();
    const xml = buildAsycudaXml(draft);
    expect(xml).toContain("<Exporter_name>PriceSmart, Inc.</Exporter_name>");
    expect(xml).toContain("<Consignee_name>PriceSmart Jamaica Ltd</Consignee_name>");
    expect(xml).toContain("<Declarant_name>Kingston Customs Brokers &amp; Sons</Declarant_name>");
    expect(xml).toContain(`<Number>${draft.commercialReference.number}</Number>`);
    expect(xml).toContain("<Previous_document_reference>SEAB2407123</Previous_document_reference>");
  });

  it("maps the complete official tariff into commodity and precision nodes", () => {
    const xml = buildAsycudaXml(createReadyDraft());
    expect(xml).toContain("<Commodity_code>83030000</Commodity_code>");
    expect(xml).toContain("<Precision_1>0</Precision_1>");
    expect(xml).toContain("<Precision_2>0</Precision_2>");
  });

  it("escapes normal commercial characters", () => {
    const xml = buildAsycudaXml(createReadyDraft());
    expect(xml).toContain("Kingston Customs Brokers &amp; Sons");
    expect(xml).toContain("Kingston &lt;Clearance&gt; Office");
    expect(xml).toContain("PRICESMART &amp; JAMAICA");
  });

  it("creates one Item element per included row and preserves edits", () => {
    const draft = createReadyDraft();
    draft.items[0].commercialDescription = "Edited Safe & Security Cabinet";
    draft.items[5].includeInXml = false;
    const xml = buildAsycudaXml(draft);
    expect((xml.match(/<Item>/g) ?? [])).toHaveLength(5);
    expect(xml).toContain("Edited Safe &amp; Security Cabinet");
    expect(xml).not.toContain("Scanner Center Module");
  });

  it("does not copy sample registration, assessment, receipt, tax or root IDs", () => {
    const xml = buildAsycudaXml(createReadyDraft());
    expect(xml).not.toMatch(/<ASYCUDA\s+id=/);
    expect(xml).toMatch(/<Registration>[\s\S]*?<Serial_number>\s*<null\/>/);
    expect(xml).toMatch(/<Assessment>[\s\S]*?<Serial_number>\s*<null\/>/);
    expect(xml).toMatch(/<receipt>[\s\S]*?<Serial_number>\s*<null\/>/);
    expect(xml).not.toContain("5893622");
  });
});

describe("AI provider configuration", () => {
  it("uses Gemini first and OpenRouter as fallback", async () => {
    const { getProviderConfig } = await import("@/lib/ai/extract-invoice");
    const order = getProviderConfig().order.split(",").map((provider) => provider.trim());
    expect(order[0]).toBe("gemini");
    expect(order).toContain("openrouter");
  });

  it("rejects incomplete provider JSON", async () => {
    const { InvoiceJsonSchema } = await import("@/lib/ai/types");
    expect(() => InvoiceJsonSchema.parse({})).toThrow();
  });

  it("contains no Kimi or Moonshot references in the extraction implementation", () => {
    const paths = [
      "../src/lib/ai/extract-invoice.ts",
      "../src/lib/ai/providers/gemini.ts",
      "../src/lib/ai/providers/openrouter.ts",
      "../src/app/invoice-to-xml/api/extract/route.ts",
    ];
    for (const path of paths) {
      const content = readFileSync(resolve(__dirname, path), "utf-8");
      expect(content).not.toMatch(/kimi|moonshot/i);
    }
  });
});
