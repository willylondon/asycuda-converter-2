"use client";

import { useEffect, useState } from "react";
import { Copy, Plus, RotateCcw, Trash2 } from "lucide-react";
import { createBlankLineItem } from "@/lib/asycuda/declaration-draft";
import { normalizeHsCode } from "@/lib/asycuda/hs-code";
import type { EditableLineItem } from "@/lib/asycuda/types";

interface Props {
  items: EditableLineItem[];
  onContinue: (items: EditableLineItem[]) => void;
  onBack: () => void;
}

function numberOrNull(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function ReviewItemsStep({ items: initialItems, onContinue, onBack }: Props) {
  const [items, setItems] = useState<EditableLineItem[]>(() => structuredClone(initialItems));
  const [selected, setSelected] = useState<Set<number>>(new Set());

  useEffect(() => {
    setItems(structuredClone(initialItems));
  }, [initialItems]);

  const updateItem = <K extends keyof EditableLineItem>(index: number, field: K, value: EditableLineItem[K]) => {
    setItems((current) => {
      const next = structuredClone(current);
      next[index][field] = value;

      if (field === "rawHsCode") {
        const raw = String(value ?? "");
        const normalized = normalizeHsCode(raw);
        next[index].normalizedCommodityCode = normalized?.commodityCode ?? "";
        next[index].precision1 = normalized?.precision1 ?? null;
        next[index].precision2 = normalized?.precision2 ?? null;
        next[index].precision3 = normalized?.precision3 ?? null;
        next[index].precision4 = normalized?.precision4 ?? null;
        next[index].precision = [normalized?.precision1, normalized?.precision2, normalized?.precision3, normalized?.precision4]
          .filter(Boolean)
          .join("");
        next[index].confirmedHsCode = null;
        next[index].hsConfirmed = false;
        next[index].hsSource = raw ? "manual" : next[index].hsSource;
      }

      if (field === "normalizedCommodityCode" || field === "precision1" || field === "precision2" || field === "precision3" || field === "precision4") {
        next[index].confirmedHsCode = null;
        next[index].hsConfirmed = false;
        next[index].precision = [next[index].precision1, next[index].precision2, next[index].precision3, next[index].precision4]
          .filter(Boolean)
          .join("");
      }

      return next;
    });
  };

  const addRow = () => {
    const maxLine = items.reduce((maximum, item) => Math.max(maximum, item.lineNumber), 0);
    setItems((current) => [...current, createBlankLineItem(maxLine + 1)]);
  };

  const deleteRow = (index: number) => {
    setItems((current) => current.length <= 1 ? current : current.filter((_, itemIndex) => itemIndex !== index));
    setSelected(new Set());
  };

  const duplicateRow = (index: number) => {
    const maxLine = items.reduce((maximum, item) => Math.max(maximum, item.lineNumber), 0);
    const clone = structuredClone(items[index]);
    clone.lineNumber = maxLine + 1;
    setItems((current) => [...current, clone]);
  };

  const restoreRow = (index: number) => {
    const original = initialItems[index];
    if (!original) return;
    setItems((current) => {
      const next = structuredClone(current);
      next[index] = structuredClone(original);
      return next;
    });
  };

  const toggleSelect = (index: number) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index); else next.add(index);
      return next;
    });
  };

  const included = items.filter((item) => item.includeInXml !== false);
  const sumLineTotal = included.reduce((sum, item) => sum + (item.lineTotal ?? 0), 0);

  return (
    <div className="mx-auto max-w-full">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text">Review Invoice Items</h2>
          <p className="mt-2 text-text-muted">{included.length} included line{included.length === 1 ? "" : "s"} · Sum: ${sumLineTotal.toFixed(2)}</p>
        </div>
        <button onClick={addRow} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text hover:bg-background">
          <Plus className="h-4 w-4" /> Add Row
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-left">
            <tr>
              {["#", "Article", "Description", "Printed HS", "Commodity", "P1", "HS OK", "Qty", "Stat Qty", "Unit", "Pkg", "Pkg Qty", "Origin", "Gross kg", "Net kg", "Unit Price", "Line Total", "XML", "Actions"].map((heading) => (
                <th key={heading} className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-text-muted">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item, index) => (
              <tr
                key={`${item.lineNumber}-${index}`}
                className={`${selected.has(index) ? "bg-accent/5" : "hover:bg-surface"} ${item.includeInXml === false ? "opacity-50" : ""}`}
                onClick={() => toggleSelect(index)}
              >
                <td className="px-3 py-2 font-mono text-xs text-text-muted">{item.lineNumber}</td>
                <td className="px-3 py-2"><input value={item.articleNumber ?? ""} onClick={(e) => e.stopPropagation()} onChange={(e) => updateItem(index, "articleNumber", e.target.value || null)} className="w-20 rounded border border-border bg-transparent px-1.5 py-1 text-xs" /></td>
                <td className="px-3 py-2"><input value={item.commercialDescription} onClick={(e) => e.stopPropagation()} onChange={(e) => updateItem(index, "commercialDescription", e.target.value)} className="min-w-[190px] rounded border border-border bg-transparent px-1.5 py-1 text-xs" /></td>
                <td className="px-3 py-2">
                  <div className="flex flex-col gap-1">
                    <input value={item.rawHsCode ?? ""} onClick={(e) => e.stopPropagation()} onChange={(e) => updateItem(index, "rawHsCode", e.target.value || null)} className="w-28 rounded border border-border bg-transparent px-1.5 py-1 font-mono text-xs" />
                    {item.suggestedHsCode && item.suggestedHsCode !== item.rawHsCode && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); updateItem(index, "rawHsCode", item.suggestedHsCode); updateItem(index, "hsSource", "ai-suggestion"); }}
                        className="text-left text-xs text-accent hover:underline"
                      >
                        Use {item.suggestedHsCode}
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2"><input value={item.normalizedCommodityCode} onClick={(e) => e.stopPropagation()} onChange={(e) => updateItem(index, "normalizedCommodityCode", e.target.value.replace(/\D/g, "").slice(0, 8))} className="w-24 rounded border border-border bg-transparent px-1.5 py-1 font-mono text-xs" /></td>
                <td className="px-3 py-2"><input value={item.precision1 ?? ""} onClick={(e) => e.stopPropagation()} onChange={(e) => updateItem(index, "precision1", e.target.value.replace(/\D/g, "").slice(0, 2) || null)} className="w-12 rounded border border-border bg-transparent px-1.5 py-1 font-mono text-xs" /></td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={item.hsConfirmed}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      updateItem(index, "hsConfirmed", e.target.checked);
                      updateItem(index, "confirmedHsCode", e.target.checked ? `${item.normalizedCommodityCode}${item.precision1 ?? ""}${item.precision2 ?? ""}${item.precision3 ?? ""}${item.precision4 ?? ""}` : null);
                    }}
                  />
                </td>
                <td className="px-3 py-2"><input type="number" value={item.quantity ?? ""} onClick={(e) => e.stopPropagation()} onChange={(e) => updateItem(index, "quantity", numberOrNull(e.target.value))} className="w-16 rounded border border-border bg-transparent px-1.5 py-1 text-xs" /></td>
                <td className="px-3 py-2"><input type="number" value={item.statisticalQuantity ?? ""} onClick={(e) => e.stopPropagation()} onChange={(e) => updateItem(index, "statisticalQuantity", numberOrNull(e.target.value))} className="w-20 rounded border border-border bg-transparent px-1.5 py-1 text-xs" /></td>
                <td className="px-3 py-2"><input value={item.unitOfMeasure ?? ""} onClick={(e) => e.stopPropagation()} onChange={(e) => updateItem(index, "unitOfMeasure", e.target.value.toUpperCase() || null)} className="w-16 rounded border border-border bg-transparent px-1.5 py-1 text-xs" /></td>
                <td className="px-3 py-2"><input value={item.packageType ?? ""} onClick={(e) => e.stopPropagation()} onChange={(e) => updateItem(index, "packageType", e.target.value.toUpperCase() || null)} className="w-14 rounded border border-border bg-transparent px-1.5 py-1 text-xs" /></td>
                <td className="px-3 py-2"><input type="number" value={item.packageCount ?? ""} onClick={(e) => e.stopPropagation()} onChange={(e) => updateItem(index, "packageCount", numberOrNull(e.target.value))} className="w-16 rounded border border-border bg-transparent px-1.5 py-1 text-xs" /></td>
                <td className="px-3 py-2"><input value={item.countryOfOrigin ?? ""} onClick={(e) => e.stopPropagation()} onChange={(e) => updateItem(index, "countryOfOrigin", e.target.value.toUpperCase() || null)} className="w-14 rounded border border-border bg-transparent px-1.5 py-1 text-xs" /></td>
                <td className="px-3 py-2"><input type="number" value={item.grossWeightKg ?? ""} onClick={(e) => e.stopPropagation()} onChange={(e) => updateItem(index, "grossWeightKg", numberOrNull(e.target.value))} className="w-20 rounded border border-border bg-transparent px-1.5 py-1 text-xs" /></td>
                <td className="px-3 py-2"><input type="number" value={item.netWeightKg ?? ""} onClick={(e) => e.stopPropagation()} onChange={(e) => updateItem(index, "netWeightKg", numberOrNull(e.target.value))} className="w-20 rounded border border-border bg-transparent px-1.5 py-1 text-xs" /></td>
                <td className="px-3 py-2"><input type="number" step="0.01" value={item.unitPrice ?? ""} onClick={(e) => e.stopPropagation()} onChange={(e) => updateItem(index, "unitPrice", numberOrNull(e.target.value))} className="w-24 rounded border border-border bg-transparent px-1.5 py-1 text-xs" /></td>
                <td className="px-3 py-2"><input type="number" step="0.01" value={item.lineTotal ?? ""} onClick={(e) => e.stopPropagation()} onChange={(e) => updateItem(index, "lineTotal", numberOrNull(e.target.value))} className="w-24 rounded border border-border bg-transparent px-1.5 py-1 text-xs font-semibold" /></td>
                <td className="px-3 py-2 text-center"><input type="checkbox" checked={item.includeInXml !== false} onClick={(e) => e.stopPropagation()} onChange={(e) => updateItem(index, "includeInXml", e.target.checked)} /></td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={(e) => { e.stopPropagation(); duplicateRow(index); }} className="rounded p-1 text-text-muted hover:bg-border/50 hover:text-text" title="Duplicate"><Copy className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); restoreRow(index); }} className="rounded p-1 text-text-muted hover:bg-border/50 hover:text-text" title="Restore"><RotateCcw className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); deleteRow(index); }} className="rounded p-1 text-text-muted hover:bg-error/10 hover:text-error" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected.size > 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-2 text-sm">
          <span className="text-text-muted">{selected.size} selected</span>
          <button type="button" onClick={() => {
            setItems((current) => current.map((item, index) => selected.has(index) ? { ...item, includeInXml: !item.includeInXml } : item));
            setSelected(new Set());
          }} className="text-accent hover:underline">Toggle XML</button>
          <button type="button" onClick={() => {
            setItems((current) => current.filter((_, index) => !selected.has(index)));
            setSelected(new Set());
          }} className="text-error hover:underline">Delete Selected</button>
        </div>
      )}

      <div className="mt-6 flex justify-between border-t border-border pt-6">
        <button onClick={onBack} className="min-h-[44px] text-sm font-medium text-text-muted hover:text-text">← Back to Shipment</button>
        <button onClick={() => onContinue(structuredClone(items))} className="inline-flex min-h-[48px] items-center rounded-xl bg-accent px-8 py-3 font-semibold text-white hover:bg-accent-light">
          Continue to Validation
        </button>
      </div>
    </div>
  );
}
