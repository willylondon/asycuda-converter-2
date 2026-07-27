import type { ValidationFinding } from "./types";

/**
 * Run deterministic validation checks on a declaration before XML generation.
 * Does NOT use AI — all checks are arithmetic, completeness, and format validation.
 */
export function validateDeclaration(
  declaration: Record<string, unknown>,
  items: Record<string, unknown>[],
): ValidationFinding[] {
  const findings: ValidationFinding[] = [];

  // ─── Required declaration fields ──────────────────────────────────
  if (!declaration.declarantName) {
    findings.push({ type: "error", message: "Declarant name is required", field: "declarantName" });
  }

  // ─── Item validation ──────────────────────────────────────────────
  if (items.length === 0) {
    findings.push({ type: "error", message: "No invoice items found" });
    return findings;
  }

  let lineSum = 0;
  let weightSum = 0;
  const lineNumbers = new Set<number>();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const lineNum = (item.lineNumber as number) || i + 1;

    // Duplicate line numbers
    if (lineNumbers.has(lineNum)) {
      findings.push({
        type: "error",
        message: `Duplicate line number ${lineNum}`,
        line: lineNum,
      });
    }
    lineNumbers.add(lineNum);

    // Missing description
    if (!item.commercialDescription) {
      findings.push({
        type: "error",
        message: `Line ${lineNum}: Description is missing`,
        line: lineNum,
      });
    }

    // HS code
    const code = String(item.normalizedCommodityCode || item.rawHsCode || "");
    if (!code) {
      findings.push({
        type: "error",
        message: `Line ${lineNum}: HS code is missing`,
        line: lineNum,
      });
    } else if (code.length > 10) {
      findings.push({
        type: "warning",
        message: `Line ${lineNum}: HS code is ${code.length} digits — exceeds 10-digit maximum`,
        line: lineNum,
      });
    } else if (code.length < 4) {
      findings.push({
        type: "warning",
        message: `Line ${lineNum}: HS code is only ${code.length} digits — too coarse`,
        line: lineNum,
      });
    }

    // Quantity
    const qty = item.quantity as number | null | undefined;
    if (qty == null || qty <= 0) {
      findings.push({
        type: "error",
        message: `Line ${lineNum}: Quantity is missing or invalid`,
        line: lineNum,
      });
    }

    // Country of origin
    if (!item.countryOfOrigin) {
      findings.push({
        type: "warning",
        message: `Line ${lineNum}: Country of origin is missing`,
        line: lineNum,
      });
    } else {
      const origin = String(item.countryOfOrigin).toUpperCase();
      if (!/^[A-Z]{2}$/.test(origin)) {
        findings.push({
          type: "warning",
          message: `Line ${lineNum}: Country of origin "${origin}" is not a valid ISO 2-letter code`,
          line: lineNum,
        });
      }
    }

    // Line total
    const lineTotal = item.lineTotal as number | null | undefined;
    if (lineTotal != null) {
      lineSum += lineTotal;
      if (lineTotal <= 0) {
        findings.push({
          type: "warning",
          message: `Line ${lineNum}: Line total is zero or negative`,
          line: lineNum,
        });
      }
    } else {
      findings.push({
        type: "warning",
        message: `Line ${lineNum}: Line total is missing`,
        line: lineNum,
      });
    }

    // Weight
    const weight = item.grossWeightKg as number | null | undefined;
    if (weight != null) {
      weightSum += weight;
    }

    // Invalid XML characters
    const desc = String(item.commercialDescription || "");
    if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(desc)) {
      findings.push({
        type: "warning",
        message: `Line ${lineNum}: Description contains invalid XML characters`,
        line: lineNum,
      });
    }
  }

  // ─── Financial reconciliation ─────────────────────────────────────
  const invoiceTotal = declaration.invoiceTotal as number | undefined;
  if (invoiceTotal != null && invoiceTotal > 0) {
    if (Math.abs(lineSum - invoiceTotal) > 0.02) {
      findings.push({
        type: "warning",
        message: `Line total sum (${lineSum.toFixed(2)}) does not match invoice total (${invoiceTotal.toFixed(2)}). Difference: ${(lineSum - invoiceTotal).toFixed(2)}`,
      });
    }

    // Merchandise + insurance + freight vs total
    const merch = (declaration.merchandiseValue as number) || 0;
    const ins = (declaration.insuranceValue as number) || 0;
    const frt = (declaration.freightValue as number) || 0;
    if (merch + ins + frt > 0 && Math.abs(merch + ins + frt - invoiceTotal) > 0.02) {
      findings.push({
        type: "warning",
        message: `Merchandise (${merch.toFixed(2)}) + Insurance (${ins.toFixed(2)}) + Freight (${frt.toFixed(2)}) ≠ Total (${invoiceTotal.toFixed(2)})`,
      });
    }
  }

  // ─── Weight reconciliation ────────────────────────────────────────
  const shipmentWeight = declaration.shipmentGrossWeightKg as number | undefined;
  if (shipmentWeight != null && weightSum > 0 && Math.abs(shipmentWeight - weightSum) > 100) {
    findings.push({
      type: "info",
      message: `Shipment gross weight (${shipmentWeight.toFixed(0)} kg) differs significantly from sum of item weights (${weightSum.toFixed(0)} kg). Difference: ${Math.abs(shipmentWeight - weightSum).toFixed(0)} kg`,
    });
  }

  // ─── Currency validation ──────────────────────────────────────────
  const currency = String(declaration.currency || "").toUpperCase();
  if (currency && !/^[A-Z]{3}$/.test(currency)) {
    findings.push({
      type: "error",
      message: `Currency "${currency}" is not a valid ISO 4217 code`,
      field: "currency",
    });
  }

  // ─── Export / destination country validation ──────────────────────
  for (const field of ["exportCountry", "destinationCountry"]) {
    const val = String(declaration[field] || "").toUpperCase();
    if (val && !/^[A-Z]{2}$/.test(val)) {
      findings.push({
        type: "warning",
        message: `${field}: "${val}" is not a valid ISO 2-letter country code`,
        field,
      });
    }
  }

  return findings;
}

/**
 * Returns true if there are blocking errors (not just warnings/info).
 */
export function hasBlockingErrors(findings: ValidationFinding[]): boolean {
  return findings.some((f) => f.type === "error");
}
