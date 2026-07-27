"use client";

import { useState } from "react";
import { Plus, Trash2, Copy, RotateCcw, AlertTriangle } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────

interface InvoiceItem {
  lineNumber: number;
  articleNumber: string | null;
  commercialDescription: string;
  rawHsCode: string | null;
  suggestedHsCode: string | null;
  hsCodeConfidence: number | null;
  normalizedCommodityCode?: string;
  precision?: string;
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
  confirmedHsCode?: string | null;
  includeInXml?: boolean;
  hsSource?: "invoice" | "kimi-suggestion" | "manual" | "saved-mapping";
}

// ─── Props ─────────────────────────────────────────────────────────

interface Props {
  items: InvoiceItem[];
  onUpdate: (items: InvoiceItem[]) => void;
  onNext: () => void;
  onBack: () => void;
}

// ─── Helpers ───────────────────────────────────────────────────────

function normalizeHsCode(raw: string | null): { commodityCode: string; precision: string } {
  if (!raw) return { commodityCode: "", precision: "" };
  const cleaned = raw.replace(/[\s.]+/g, "");
  if (cleaned.length <= 8) return { commodityCode: cleaned, precision: "" };
  return { commodityCode: cleaned.slice(0, 8), precision: cleaned.slice(8) };
}

// ─── Component ─────────────────────────────────────────────────────

export function ReviewItemsStep({ items: initialItems, onUpdate, onNext, onBack }: Props) {
  const [items, setItems] = useState<InvoiceItem[]>(() =>
    initialItems.map((item, i) => {
      const norm = normalizeHsCode(item.rawHsCode);
      return {
        ...item,
        includeInXml: item.includeInXml ?? true,
        normalizedCommodityCode: norm.commodityCode,
        precision: norm.precision,
        hsSource: item.hsSource || (item.rawHsCode ? "invoice" : item.suggestedHsCode ? "kimi-suggestion" : undefined),
      };
    })
  );
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const updateItem = (index: number, field: keyof InvoiceItem, value: unknown) => {
    const next = structuredClone(items);
    (next[index] as unknown as Record<string, unknown>)[field as string] = value;

    // Auto-normalize HS code
    if (field === "rawHsCode") {
      const norm = normalizeHsCode(value as string | null);
      next[index].normalizedCommodityCode = norm.commodityCode;
      next[index].precision = norm.precision;
      next[index].hsSource = value ? "invoice" : next[index].hsSource;
    }

    setItems(next);
  };

  const addRow = () => {
    const maxLine = items.reduce((max, i) => Math.max(max, i.lineNumber), 0);
    setItems([...items, {
      lineNumber: maxLine + 1,
      articleNumber: null,
      commercialDescription: "",
      rawHsCode: null,
      suggestedHsCode: null,
      hsCodeConfidence: null,
      normalizedCommodityCode: "",
      precision: "",
      quantity: 1,
      unitOfMeasure: "PCS",
      packageType: null,
      countryOfOrigin: null,
      grossWeightKg: null,
      netWeightKg: null,
      unitPrice: null,
      lineTotal: null,
      extractionConfidence: 1.0,
      warnings: [],
      includeInXml: true,
      hsSource: "manual",
    }]);
  };

  const deleteRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
    setSelected(new Set());
  };

  const duplicateRow = (index: number) => {
    const maxLine = items.reduce((max, i) => Math.max(max, i.lineNumber), 0);
    const clone = structuredClone(items[index]);
    clone.lineNumber = maxLine + 1;
    setItems([...items, clone]);
  };

  const restoreRow = (index: number) => {
    const orig = initialItems[index];
    if (!orig) return;
    const next = structuredClone(items);
    next[index] = { ...orig, includeInXml: true };
    setItems(next);
  };

  const toggleSelect = (index: number) => {
    const next = new Set(selected);
    if (next.has(index)) next.delete(index); else next.add(index);
    setSelected(next);
  };

  const handleContinue = () => {
    onUpdate(items.filter((i) => i.includeInXml !== false));
    onNext();
  };

  const sumLineTotal = items
    .filter((i) => i.includeInXml !== false)
    .reduce((sum, i) => sum + (i.lineTotal ?? 0), 0);

  return (
    <div className="mx-auto max-w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text">Review Invoice Items</h2>
          <p className="mt-2 text-text-muted">
            {items.length} line{items.length !== 1 ? "s" : ""} extracted
            {" • "}Sum: ${sumLineTotal.toFixed(2)}
          </p>
        </div>
        <button
          onClick={addRow}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text hover:bg-background transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Row
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-left">
            <tr>
              <th className="px-3 py-2.5 font-semibold text-text-muted text-xs">#</th>
              <th className="px-3 py-2.5 font-semibold text-text-muted text-xs">Article</th>
              <th className="px-3 py-2.5 font-semibold text-text-muted text-xs min-w-[180px]">Description</th>
              <th className="px-3 py-2.5 font-semibold text-text-muted text-xs">HS Code</th>
              <th className="px-3 py-2.5 font-semibold text-text-muted text-xs">Prec.</th>
              <th className="px-3 py-2.5 font-semibold text-text-muted text-xs">Qty</th>
              <th className="px-3 py-2.5 font-semibold text-text-muted text-xs">Unit</th>
              <th className="px-3 py-2.5 font-semibold text-text-muted text-xs">Pkg</th>
              <th className="px-3 py-2.5 font-semibold text-text-muted text-xs">Origin</th>
              <th className="px-3 py-2.5 font-semibold text-text-muted text-xs">Weight</th>
              <th className="px-3 py-2.5 font-semibold text-text-muted text-xs">Price</th>
              <th className="px-3 py-2.5 font-semibold text-text-muted text-xs">Total</th>
              <th className="px-3 py-2.5 font-semibold text-text-muted text-xs">Conf.</th>
              <th className="px-3 py-2.5 font-semibold text-text-muted text-xs w-10">XML</th>
              <th className="px-3 py-2.5 font-semibold text-text-muted text-xs w-20">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item, index) => (
              <tr
                key={index}
                className={`hover:bg-surface transition-colors ${selected.has(index) ? "bg-accent/5" : ""} ${
                  item.includeInXml === false ? "opacity-50" : ""
                }`}
                onClick={() => toggleSelect(index)}
              >
                <td className="px-3 py-2 text-text-muted font-mono text-xs">{item.lineNumber}</td>
                <td className="px-3 py-2">
                  <input
                    value={item.articleNumber ?? ""}
                    onChange={(e) => updateItem(index, "articleNumber", e.target.value || null)}
                    className="w-20 rounded border border-border bg-transparent px-1.5 py-1 text-xs focus:border-accent focus:outline-none"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    value={item.commercialDescription}
                    onChange={(e) => updateItem(index, "commercialDescription", e.target.value)}
                    className="w-full min-w-[160px] rounded border border-border bg-transparent px-1.5 py-1 text-xs focus:border-accent focus:outline-none"
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-col gap-1">
                    <input
                      value={item.normalizedCommodityCode ?? ""}
                      onChange={(e) => updateItem(index, "rawHsCode", e.target.value)}
                      className={`w-24 rounded border px-1.5 py-1 text-xs font-mono focus:outline-none ${
                        item.hsSource === "kimi-suggestion" ? "border-warning/50 bg-warning/5" :
                        item.hsSource === "manual" ? "border-accent/50 bg-accent/5" :
                        "border-border bg-transparent"
                      }`}
                    />
                    {item.suggestedHsCode && item.suggestedHsCode !== item.rawHsCode && (
                      <button
                        onClick={(e) => { e.stopPropagation(); updateItem(index, "rawHsCode", item.suggestedHsCode); }}
                        className="text-xs text-accent hover:underline text-left"
                      >
                        Use: {item.suggestedHsCode} ({((item.hsCodeConfidence ?? 0) * 100).toFixed(0)}%)
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <input
                    value={item.precision ?? ""}
                    onChange={(e) => updateItem(index, "precision", e.target.value)}
                    className="w-12 rounded border border-border bg-transparent px-1.5 py-1 text-xs font-mono focus:border-accent focus:outline-none"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={item.quantity ?? ""}
                    onChange={(e) => updateItem(index, "quantity", e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-16 rounded border border-border bg-transparent px-1.5 py-1 text-xs focus:border-accent focus:outline-none"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    value={item.unitOfMeasure ?? ""}
                    onChange={(e) => updateItem(index, "unitOfMeasure", e.target.value || null)}
                    className="w-14 rounded border border-border bg-transparent px-1.5 py-1 text-xs focus:border-accent focus:outline-none"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    value={item.packageType ?? ""}
                    onChange={(e) => updateItem(index, "packageType", e.target.value || null)}
                    className="w-12 rounded border border-border bg-transparent px-1.5 py-1 text-xs focus:border-accent focus:outline-none"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    value={item.countryOfOrigin ?? ""}
                    onChange={(e) => updateItem(index, "countryOfOrigin", e.target.value || null)}
                    className="w-14 rounded border border-border bg-transparent px-1.5 py-1 text-xs focus:border-accent focus:outline-none"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={item.grossWeightKg ?? ""}
                    onChange={(e) => updateItem(index, "grossWeightKg", e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-20 rounded border border-border bg-transparent px-1.5 py-1 text-xs focus:border-accent focus:outline-none"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={item.unitPrice ?? ""}
                    onChange={(e) => updateItem(index, "unitPrice", e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-20 rounded border border-border bg-transparent px-1.5 py-1 text-xs focus:border-accent focus:outline-none"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={item.lineTotal ?? ""}
                    onChange={(e) => updateItem(index, "lineTotal", e.target.value ? parseFloat(e.target.value) : null)}
                    className={`w-24 rounded border px-1.5 py-1 text-xs font-semibold focus:outline-none ${
                      item.warnings.length > 0 ? "border-warning/50 bg-warning/5" : "border-border bg-transparent"
                    }`}
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <span className={`text-xs font-semibold ${
                    (item.extractionConfidence ?? 0) >= 0.9 ? "text-success" :
                    (item.extractionConfidence ?? 0) >= 0.7 ? "text-warning" : "text-error"
                  }`}>
                    {((item.extractionConfidence ?? 0) * 100).toFixed(0)}%
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={item.includeInXml !== false}
                    onChange={(e) => updateItem(index, "includeInXml", e.target.checked)}
                    className="rounded"
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); duplicateRow(index); }}
                      className="rounded p-1 text-text-muted hover:text-text hover:bg-border/50 transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); restoreRow(index); }}
                      className="rounded p-1 text-text-muted hover:text-text hover:bg-border/50 transition-colors"
                      title="Restore original"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteRow(index); }}
                      className="rounded p-1 text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected actions */}
      {selected.size > 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-2 text-sm">
          <span className="text-text-muted">{selected.size} selected</span>
          <button
            onClick={() => {
              const next = structuredClone(items);
              selected.forEach((i) => { next[i].includeInXml = !next[i].includeInXml; });
              setItems(next);
              setSelected(new Set());
            }}
            className="text-accent hover:underline"
          >
            Toggle XML
          </button>
          <button
            onClick={() => {
              setItems(items.filter((_, i) => !selected.has(i)));
              setSelected(new Set());
            }}
            className="text-error hover:underline"
          >
            Delete Selected
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-border mt-6">
        <button onClick={onBack} className="text-sm font-medium text-text-muted hover:text-text transition-colors">
          ← Back to Shipment
        </button>
        <button
          onClick={handleContinue}
          className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-accent px-8 py-3 text-base font-semibold text-white hover:bg-accent-light transition-colors"
        >
          Validate & Generate XML
        </button>
      </div>
    </div>
  );
}
