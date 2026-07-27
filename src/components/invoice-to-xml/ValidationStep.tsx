"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, Info, Loader2 } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────

interface ValidationFinding {
  type: "error" | "warning" | "info";
  message: string;
  field?: string;
}

interface Props {
  declarationData: Record<string, unknown>;
  items: Array<Record<string, unknown>>;
  onGenerate: () => void;
  onBack: () => void;
}

// ─── Validation logic (client-side mirror of server validation) ────

function runClientValidation(declaration: Record<string, unknown>, items: Array<Record<string, unknown>>): ValidationFinding[] {
  const findings: ValidationFinding[] = [];

  // Check declaration fields
  if (!declaration.declarantName) findings.push({ type: "error", message: "Declarant name is missing", field: "declarantName" });
  if (!declaration.consigneeName) findings.push({ type: "warning", message: "Consignee name is not provided", field: "consigneeName" });

  // Check items
  if (items.length === 0) {
    findings.push({ type: "error", message: "No invoice items found" });
  }

  let lineSum = 0;
  let weightSum = 0;
  const lineNumbers = new Set<number>();

  items.forEach((item, i) => {
    const lineNum = item.lineNumber as number;
    if (lineNumbers.has(lineNum)) {
      findings.push({ type: "error", message: `Duplicate line number ${lineNum}`, field: `items[${i}].lineNumber` });
    }
    lineNumbers.add(lineNum);

    if (!item.commercialDescription) {
      findings.push({ type: "error", message: `Line ${lineNum}: Description is missing`, field: `items[${i}].commercialDescription` });
    }

    const code = (item.normalizedCommodityCode || item.rawHsCode || "") as string;
    if (!code) {
      findings.push({ type: "error", message: `Line ${lineNum}: HS code is missing`, field: `items[${i}].rawHsCode` });
    } else if (code.length < 4 || code.length > 10) {
      findings.push({ type: "warning", message: `Line ${lineNum}: Unusual HS code length (${code.length} digits)`, field: `items[${i}].rawHsCode` });
    } else if (code.length > 8) {
      findings.push({ type: "info", message: `Line ${lineNum}: HS code has precision digits — review required`, field: `items[${i}].rawHsCode` });
    }

    if (!item.quantity && item.quantity !== 0) {
      findings.push({ type: "error", message: `Line ${lineNum}: Quantity is missing`, field: `items[${i}].quantity` });
    }

    if (!item.countryOfOrigin) {
      findings.push({ type: "warning", message: `Line ${lineNum}: Country of origin is missing`, field: `items[${i}].countryOfOrigin` });
    }

    const lineTotal = item.lineTotal as number;
    if (lineTotal != null) {
      lineSum += lineTotal;
      if (lineTotal <= 0) {
        findings.push({ type: "warning", message: `Line ${lineNum}: Line total is zero or negative`, field: `items[${i}].lineTotal` });
      }
    } else {
      findings.push({ type: "warning", message: `Line ${lineNum}: Line total is missing`, field: `items[${i}].lineTotal` });
    }

    const weight = item.grossWeightKg as number;
    if (weight != null) {
      weightSum += weight;
    }

    // Check for invalid XML characters in description
    const desc = (item.commercialDescription || "") as string;
    const invalidXml = /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(desc);
    if (invalidXml) {
      findings.push({ type: "warning", message: `Line ${lineNum}: Description contains invalid XML characters`, field: `items[${i}].commercialDescription` });
    }
  });

  // Sum check
  const invoiceTotal = declaration.invoiceTotal as number;
  if (invoiceTotal != null && Math.abs(lineSum - invoiceTotal) > 0.02) {
    findings.push({
      type: "warning",
      message: `Line total sum (${lineSum.toFixed(2)}) does not match invoice total (${(invoiceTotal).toFixed(2)}). Difference: ${(lineSum - invoiceTotal).toFixed(2)}`,
      field: "items"
    });
  }

  // Merchandise + insurance + freight vs total
  const merch = (declaration.merchandiseValue || 0) as number;
  const ins = (declaration.insuranceValue || 0) as number;
  const frt = (declaration.freightValue || 0) as number;
  const total = declaration.invoiceTotal as number;
  if (total != null && Math.abs(merch + ins + frt - total) > 0.02) {
    findings.push({
      type: "warning",
      message: `Merchandise (${merch.toFixed(2)}) + Insurance (${ins.toFixed(2)}) + Freight (${frt.toFixed(2)}) ≠ Total (${total.toFixed(2)})`,
      field: "invoice"
    });
  }

  // Weight check
  const shipmentWeight = declaration.shipmentGrossWeightKg as number;
  if (shipmentWeight != null && weightSum > 0) {
    const diff = Math.abs(shipmentWeight - weightSum);
    if (diff > 100) {
      findings.push({
        type: "info",
        message: `Shipment gross weight (${shipmentWeight.toFixed(0)} kg) differs significantly from sum of item weights (${weightSum.toFixed(0)} kg). Difference: ${diff.toFixed(0)} kg`,
        field: "weight"
      });
    }
  }

  return findings;
}

// ─── Component ─────────────────────────────────────────────────────

export function ValidationStep({ declarationData, items, onGenerate, onBack }: Props) {
  const [findings, setFindings] = useState<ValidationFinding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Run validation after a short delay to show loading state
    const timer = setTimeout(() => {
      setFindings(runClientValidation(declarationData, items));
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [declarationData, items]);

  const errors = findings.filter((f) => f.type === "error");
  const warnings = findings.filter((f) => f.type === "warning");
  const infos = findings.filter((f) => f.type === "info");

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="text-2xl font-bold text-text">Validation Results</h2>
      <p className="mt-2 text-text-muted">
        Pre-flight checks before XML generation. Errors must be fixed; warnings produce a labeled XML.
      </p>

      {loading ? (
        <div className="mt-12 flex flex-col items-center gap-4 text-text-muted">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Running validation checks...</span>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-error/30 bg-error/5 p-4 text-center">
              <AlertTriangle className="mx-auto h-6 w-6 text-error" />
              <p className="mt-2 text-2xl font-bold text-error">{errors.length}</p>
              <p className="text-xs text-text-muted">Errors</p>
            </div>
            <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 text-center">
              <AlertTriangle className="mx-auto h-6 w-6 text-warning" />
              <p className="mt-2 text-2xl font-bold text-warning">{warnings.length}</p>
              <p className="text-xs text-text-muted">Warnings</p>
            </div>
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 text-center">
              <Info className="mx-auto h-6 w-6 text-accent" />
              <p className="mt-2 text-2xl font-bold text-accent">{infos.length}</p>
              <p className="text-xs text-text-muted">Info</p>
            </div>
          </div>

          {/* Findings list */}
          {findings.length > 0 && (
            <div className="mt-6 space-y-2">
              {findings.map((f, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
                    f.type === "error" ? "border-error/20 bg-error/5" :
                    f.type === "warning" ? "border-warning/20 bg-warning/5" :
                    "border-accent/20 bg-accent/5"
                  }`}
                >
                  {f.type === "error" ? (
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 text-error mt-0.5" />
                  ) : f.type === "warning" ? (
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 text-warning mt-0.5" />
                  ) : (
                    <Info className="h-5 w-5 flex-shrink-0 text-accent mt-0.5" />
                  )}
                  <div>
                    <span className={`font-semibold ${
                      f.type === "error" ? "text-error" : f.type === "warning" ? "text-warning" : "text-accent"
                    }`}>
                      {f.type.toUpperCase()}
                    </span>
                    <span className="ml-2 text-text">{f.message}</span>
                    {f.field && <span className="ml-2 text-xs text-text-muted">({f.field})</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* All clear */}
          {findings.length === 0 && (
            <div className="mt-8 rounded-2xl border border-success/30 bg-success/5 p-8 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-success" />
              <p className="mt-3 text-lg font-semibold text-text">All Checks Passed</p>
              <p className="mt-1 text-sm text-text-muted">Ready to generate ASYCUDA XML.</p>
            </div>
          )}
        </>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-border mt-8">
        <button onClick={onBack} className="text-sm font-medium text-text-muted hover:text-text transition-colors">
          ← Back to Items
        </button>
        <button
          onClick={onGenerate}
          disabled={errors.length > 0}
          className={`inline-flex min-h-[48px] items-center justify-center rounded-xl px-8 py-3 text-base font-semibold text-white transition-colors ${
            errors.length > 0
              ? "bg-border cursor-not-allowed"
              : "bg-accent hover:bg-accent-light"
          }`}
          title={errors.length > 0 ? "Fix errors before generating XML" : undefined}
        >
          {errors.length > 0 ? "Fix Errors to Continue" : (
            warnings.length > 0 ? "Generate XML (with warnings)" : "Generate XML"
          )}
        </button>
      </div>
    </div>
  );
}
