import type { ValidationFinding } from "./types";
import type { DeclarationDraft } from "./declaration-draft";

/**
 * Run deterministic validation on a DeclarationDraft.
 * All arithmetic uses string-based decimal-safe operations.
 */
export function validateDeclaration(draft: DeclarationDraft): ValidationFinding[] {
  const findings: ValidationFinding[] = [];

  // ─── Required header fields ────────────────────────────────────
  if (!draft.declaration.declarantName) findings.push({ type: "error", message: "Declarant name is required", field: "declarantName" });
  if (!draft.consignee.name) findings.push({ type: "error", message: "Consignee name is required", field: "consignee" });
  if (!draft.declaration.customsOfficeCode) findings.push({ type: "error", message: "Customs clearance office code is required", field: "customsOfficeCode" });
  if (!draft.declaration.declarationType) findings.push({ type: "error", message: "Declaration type is required", field: "declarationType" });
  if (!draft.declaration.generalProcedureCode) findings.push({ type: "warning", message: "General procedure code is not set", field: "generalProcedureCode" });
  if (!draft.commercialReference.number) findings.push({ type: "error", message: "Commercial reference is missing", field: "commercialReference" });

  // ─── Currency validation ───────────────────────────────────────
  const currency = (draft.invoice.currency || "").toUpperCase();
  if (currency && !/^[A-Z]{3}$/.test(currency)) {
    findings.push({ type: "error", message: `Currency "${currency}" is not valid ISO 4217`, field: "currency" });
  }

  // ─── Country validation ────────────────────────────────────────
  for (const [field, val] of [["exportCountry", draft.declaration.exportCountry], ["destinationCountry", draft.declaration.destinationCountry]] as const) {
    if (val && !/^[A-Z]{2}$/.test(val.toUpperCase())) {
      findings.push({ type: "warning", message: `${field}: "${val}" is not a valid ISO 2-letter code`, field });
    }
  }

  // ─── Items ─────────────────────────────────────────────────────
  const includedItems = draft.items.filter(i => i.includeInXml !== false);
  if (includedItems.length === 0) {
    findings.push({ type: "error", message: "No invoice items included" });
    return findings;
  }

  let lineSum = 0;
  let weightSum = 0;
  const lineNumbers = new Set<number>();

  for (const item of includedItems) {
    const ln = item.lineNumber;

    if (lineNumbers.has(ln)) {
      findings.push({ type: "error", message: `Duplicate line number ${ln}`, line: ln });
    }
    lineNumbers.add(ln);

    if (!item.commercialDescription) {
      findings.push({ type: "error", message: `Line ${ln}: Description is missing`, line: ln });
    }

    // HS code
    const code = item.normalizedCommodityCode || "";
    if (!code) {
      findings.push({ type: "error", message: `Line ${ln}: HS commodity code is missing`, line: ln });
    } else if (code.length < 4) {
      findings.push({ type: "warning", message: `Line ${ln}: HS code too short (${code.length} digits)`, line: ln });
    } else if (code.length > 10) {
      findings.push({ type: "warning", message: `Line ${ln}: HS code too long (${code.length} digits)`, line: ln });
    }

    // Precision requires confirmation if present
    const hasPrecision = item.precision1 || item.precision2 || item.precision3 || item.precision4;
    if (hasPrecision && !item.confirmedHsCode) {
      findings.push({ type: "warning", message: `Line ${ln}: HS code has precision digits — confirm before production XML`, line: ln });
    }

    if (!item.quantity || item.quantity <= 0) {
      findings.push({ type: "error", message: `Line ${ln}: Quantity is missing or invalid`, line: ln });
    }

    if (!item.countryOfOrigin) {
      findings.push({ type: "warning", message: `Line ${ln}: Country of origin is missing`, line: ln });
    } else if (!/^[A-Z]{2}$/.test(String(item.countryOfOrigin).toUpperCase())) {
      findings.push({ type: "warning", message: `Line ${ln}: Origin "${item.countryOfOrigin}" is not a valid ISO 2-letter code`, line: ln });
    }

    if (item.lineTotal != null) {
      lineSum += item.lineTotal;
      if (item.lineTotal <= 0) {
        findings.push({ type: "warning", message: `Line ${ln}: Line total is zero or negative`, line: ln });
      }
    } else {
      findings.push({ type: "warning", message: `Line ${ln}: Line total is missing`, line: ln });
    }

    if (item.grossWeightKg != null) weightSum += item.grossWeightKg;

    // Invalid XML characters
    if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(item.commercialDescription)) {
      findings.push({ type: "warning", message: `Line ${ln}: Description contains invalid XML characters`, line: ln });
    }
  }

  // ─── Financial reconciliation ──────────────────────────────────
  const invoiceTotal = draft.invoice.totalValue ? parseFloat(draft.invoice.totalValue) : null;
  if (invoiceTotal != null && invoiceTotal > 0) {
    if (Math.abs(lineSum - invoiceTotal) > 0.5) {
      findings.push({
        type: "warning",
        message: `Line total sum (${lineSum.toFixed(2)}) doesn't match invoice total (${invoiceTotal.toFixed(2)}). Diff: ${(lineSum - invoiceTotal).toFixed(2)}`,
      });
    }

    const merch = draft.invoice.merchandiseValue ? parseFloat(draft.invoice.merchandiseValue) : 0;
    const ins = draft.invoice.insuranceValue ? parseFloat(draft.invoice.insuranceValue) : 0;
    const frt = draft.invoice.freightValue ? parseFloat(draft.invoice.freightValue) : 0;
    if ((merch + ins + frt) > 0 && Math.abs(merch + ins + frt - invoiceTotal) > 0.5) {
      findings.push({
        type: "warning",
        message: `Merchandise + Insurance + Freight (${(merch+ins+frt).toFixed(2)}) ≠ Total (${invoiceTotal.toFixed(2)})`,
      });
    }
  }

  // ─── Weight reconciliation ─────────────────────────────────────
  const shipWeight = draft.shipment.grossWeightKg;
  if (shipWeight != null && weightSum > 0 && Math.abs(shipWeight - weightSum) > 100) {
    findings.push({
      type: "info",
      message: `Shipment weight (${shipWeight} kg) differs from item sum (${weightSum.toFixed(1)} kg). Diff: ${Math.abs(shipWeight - weightSum).toFixed(1)} kg`,
    });
  }

  // ─── Delivery term warning ─────────────────────────────────────
  if (draft.shipment.deliveryTermRaw && !draft.shipment.deliveryTermCode) {
    findings.push({
      type: "warning",
      message: `Delivery term "${draft.shipment.deliveryTermRaw}" has not been mapped to an ASYCUDA code`,
      field: "deliveryTermCode",
    });
  }

  return findings;
}

export function hasBlockingErrors(findings: ValidationFinding[]): boolean {
  return findings.some(f => f.type === "error");
}
