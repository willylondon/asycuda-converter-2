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
  it("rejects empty items", () => {
    const findings = validateDeclaration({ declarantName: "Test Broker" }, []);
    expect(hasBlockingErrors(findings)).toBe(true);
    expect(findings.some((f) => f.message.includes("No invoice items"))).toBe(true);
  });

  it("flags missing HS codes", () => {
    const findings = validateDeclaration(
      { declarantName: "Test" },
      [
        {
          lineNumber: 1,
          commercialDescription: "Test item",
          quantity: 1,
          lineTotal: 100,
          countryOfOrigin: "US",
          normalizedCommodityCode: "",
        },
      ],
    );
    expect(findings.some((f) => f.message.includes("HS code is missing"))).toBe(true);
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
});
