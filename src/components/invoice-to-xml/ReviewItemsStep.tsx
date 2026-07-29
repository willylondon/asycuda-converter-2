"use client";

import { useEffect, useState } from "react";
import { Copy, Plus, RotateCcw, Search, ShieldCheck, Trash2 } from "lucide-react";
import { TariffLookupPanel } from "@/components/invoice-to-xml/TariffLookupPanel";
import { createBlankLineItem } from "@/lib/asycuda/declaration-draft";
import { normalizeHsCode } from "@/lib/asycuda/hs-code";
import type { EditableLineItem, JamaicaTariffEntry } from "@/lib/asycuda/types";
import { splitJamaicaTariffCode } from "@/lib/tariff/jamaica-tariff";

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

function clearTariffVerification(item: EditableLineItem): void {
  item.officialJamaicaTariffCode = null;
  item.officialTariffDescription = null;
  item.officialTariffUnits = [];
  item.officialTariffRates = null;
  item.officialTariffEffectiveDate = null;
  item.officialTariffSourceUrl = null;
  item.officialTariffSource = null;
  item.tariffVerified = false;
}

export function ReviewItemsStep({ items: initialItems, onContinue, onBack }: Props) {
  const [items, setItems] = useState<EditableLineItem[]>(() => structuredClone(initialItems));
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [tariffLookupIndex, setTariffLookupIndex] = useState<number | null>(null);

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
        clearTariffVerification(next[index]);
      }

      if (field === "normalizedCommodityCode" || field === "precision1" || field === "precision2" || field === "precision3" || field === "precision4") {
        next[index].confirmedHsCode = null;
        next[index].hsConfirmed = false;
        next[index].precision = [next[index].precision1, next[index].precision2, next[index].precision3, next[index].precision4]
          .filter(Boolean)
          .join("");
        clearTariffVerification(next[index]);
      }

      return next;
    });
  };

  const applyTariff = (index: number, entry: JamaicaTariffEntry) => {
    const split = splitJamaicaTariffCode(entry.code);
    setItems((current) => {
      const next = structuredClone(current);
      const item = next[index];
      item.normalizedCommodityCode = split.commodityCode;
      item.precision1 = split.precision1;
      item.precision2 = split.precision2;
      item.precision3 = split.precision3;
      item.precision4 = split.precision4;
      item.precision = [split.precision1, split.precision2, split.precision3, split.precision4].filter(Boolean).join("");
      item.confirmedHsCode = entry.code;
      item.hsConfirmed = true;
      item.hsSource = "jca-tariff";
      item.officialJamaicaTariffCode = entry.code;
      item.officialTariffDescription = entry.description;
      item.officialTariffUnits = entry.units;
      item.officialTariffRates = entry.rates;
      item.officialTariffEffectiveDate = entry.effectiveDate;
      item.officialTariffSourceUrl = entry.sourceUrl;
      item.officialTariffSource = entry.source;
      item.tariffVerified = true;
      if (!item.unitOfMeasure && entry.units.length > 0) {
        item.unitOfMeasure = entry.units.includes("u") ? "NMB" : entry.units[0].toUpperCase();
      }
      return next;
    });
    setTariffLookupIndex(null);
  };

  const addRow = () => {
    const maxLine = items.reduce((maximum, item) => Math.max(maximum, item.lineNumber), 0);
    setItems((current) => [...current, createBlankLineItem(maxLine + 1)]);
  };

  const deleteRow = (index: number) => {
    setItems((current) => current.length <= 1 ? current : current.filter((_, itemIndex) => itemIndex !== index));
    setSelected(new Set());
    if (tariffLookupIndex === index) setTariffLookupIndex(null);
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
  const verifiedCount = included.filter((item) => item.tariffVerified).length;

  return (
    <div className="mx-auto max-w-full">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-2xl font-bold text-text">Review Invoice Items</h2>
          <p className="mt-2 text-text-muted">
            {included.length} included line{included.length === 1 ? "" : "s"} · Sum: ${sumLineTotal.toFixed(2)} · {verifiedCount}/{included.length} JCA tariffs verified
          </p>
        </div>
        <button onClick={addRow} className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text hover:bg-background">
          <Plus className="h-4 w-4" /> Add Row
        </button>
      </div>

      <div className="mb-4 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-text">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
          <p>
            Use <strong>Verify JCA tariff</strong> to select the official 10-digit Jamaican tariff. The app then maps the first eight digits to the commodity code and the final digits to ASYCUDA precision fields.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-left">
            <tr>
              {["#", "Article", "Description", "Printed HS", "JCA Tariff", "Commodity", "P1", "P2", "HS OK", "Qty", "Stat Qty", "Unit", "Pkg", "Pkg Qty", "Origin", "Gross kg", "Net kg", "Unit Price", "Line Total", "XML", "Actions"].map((heading) => (
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
                <td className="px-3 py-2"><input value={item.articleNumber ?? ""} onClick={(event) => event.stopPropagation()} onChange={(event) => updateItem(index, "articleNumber", event.target.value || null)} className="w-20 rounded border border-border bg-transparent px-1.5 py-1 text-xs" /></td>
                <td className="px-3 py-2"><input value={item.commercialDescription} onClick={(event) => event.stopPropagation()} onChange={(event) => updateItem(index, "commercialDescription", event.target.value)} className="min-w-[190px] rounded border border-border bg-transparent px-1.5 py-1 text-xs" /></td>
                <td className="px-3 py-2">
                  <div className="flex flex-col gap-1">
                    <input value={item.rawHsCode ?? ""} onClick={(event) => event.stopPropagation()} onChange={(event) => updateItem(index, "rawHsCode", event.target.value || null)} className="w-28 rounded border border-border bg-transparent px-1.5 py-1 font-mono text-xs" />
                    {item.suggestedHsCode && item.suggestedHsCode !== item.rawHsCode && (
                      <button
                        type="button"
                        onClick={(event) => { event.stopPropagation(); updateItem(index, "rawHsCode", item.suggestedHsCode); updateItem(index, "hsSource", "ai-suggestion"); }}
                        className="text-left text-xs text-accent hover:underline"
                      >
                        Use {item.suggestedHsCode}
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); setTariffLookupIndex(index); }}
                    className={`inline-flex min-h-[38px] min-w-[130px] items-center justify-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-semibold ${
                      item.tariffVerified
                        ? "border-success/30 bg-success/10 text-success"
                        : "border-accent/30 bg-accent/5 text-accent hover:bg-accent/10"
                    }`}
                  >
                    {item.tariffVerified ? <ShieldCheck className="h-3.5 w-3.5" /> : <Search className="h-3.5 w-3.5" />}
                    {item.officialJamaicaTariffCode || "Verify JCA tariff"}
                  </button>
                  {item.officialTariffDescription && <p className="mt-1 max-w-[180px] text-[11px] leading-4 text-text-muted">{item.officialTariffDescription}</p>}
                </td>
                <td className="px-3 py-2"><input value={item.normalizedCommodityCode} onClick={(event) => event.stopPropagation()} onChange={(event) => updateItem(index, "normalizedCommodityCode", event.target.value.replace(/\D/g, "").slice(0, 8))} className="w-24 rounded border border-border bg-transparent px-1.5 py-1 font-mono text-xs" /></td>
                <td className="px-3 py-2"><input value={item.precision1 ?? ""} onClick={(event) => event.stopPropagation()} onChange={(event) => updateItem(index, "precision1", event.target.value.replace(/\D/g, "").slice(0, 2) || null)} className="w-12 rounded border border-border bg-transparent px-1.5 py-1 font-mono text-xs" /></td>
                <td className="px-3 py-2"><input value={item.precision2 ?? ""} onClick={(event) => event.stopPropagation()} onChange={(event) => updateItem(index, "precision2", event.target.value.replace(/\D/g, "").slice(0, 2) || null)} className="w-12 rounded border border-border bg-transparent px-1.5 py-1 font-mono text-xs" /></td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={item.hsConfirmed}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => {
                      updateItem(index, "hsConfirmed", event.target.checked);
                      updateItem(index, "confirmedHsCode", event.target.checked ? `${item.normalizedCommodityCode}${item.precision1 ?? ""}${item.precision2 ?? ""}${item.precision3 ?? ""}${item.precision4 ?? ""}` : null);
                    }}
                  />
                </td>
                <td className="px-3 py-2"><input type="number" value={item.quantity ?? ""} onClick={(event) => event.stopPropagation()} onChange={(event) => updateItem(index, "quantity", numberOrNull(event.target.value))} className="w-16 rounded border border-border bg-transparent px-1.5 py-1 text-xs" /></td>
                <td className="px-3 py-2"><input type="number" value={item.statisticalQuantity ?? ""} onClick={(event) => event.stopPropagation()} onChange={(event) => updateItem(index, "statisticalQuantity", numberOrNull(event.target.value))} className="w-20 rounded border border-border bg-transparent px-1.5 py-1 text-xs" /></td>
                <td className="px-3 py-2"><input value={item.unitOfMeasure ?? ""} onClick={(event) => event.stopPropagation()} onChange={(event) => updateItem(index, "unitOfMeasure", event.target.value.toUpperCase() || null)} className="w-16 rounded border border-border bg-transparent px-1.5 py-1 text-xs" /></td>
                <td className="px-3 py-2"><input value={item.packageType ?? ""} onClick={(event) => event.stopPropagation()} onChange={(event) => updateItem(index, "packageType", event.target.value.toUpperCase() || null)} className="w-14 rounded border border-border bg-transparent px-1.5 py-1 text-xs" /></td>
                <td className="px-3 py-2"><input type="number" value={item.packageCount ?? ""} onClick={(event) => event.stopPropagation()} onChange={(event) => updateItem(index, "packageCount", numberOrNull(event.target.value))} className="w-16 rounded border border-border bg-transparent px-1.5 py-1 text-xs" /></td>
                <td className="px-3 py-2"><input value={item.countryOfOrigin ?? ""} onClick={(event) => event.stopPropagation()} onChange={(event) => updateItem(index, "countryOfOrigin", event.target.value.toUpperCase() || null)} className="w-14 rounded border border-border bg-transparent px-1.5 py-1 text-xs" /></td>
                <td className="px-3 py-2"><input type="number" value={item.grossWeightKg ?? ""} onClick={(event) => event.stopPropagation()} onChange={(event) => updateItem(index, "grossWeightKg", numberOrNull(event.target.value))} className="w-20 rounded border border-border bg-transparent px-1.5 py-1 text-xs" /></td>
                <td className="px-3 py-2"><input type="number" value={item.netWeightKg ?? ""} onClick={(event) => event.stopPropagation()} onChange={(event) => updateItem(index, "netWeightKg", numberOrNull(event.target.value))} className="w-20 rounded border border-border bg-transparent px-1.5 py-1 text-xs" /></td>
                <td className="px-3 py-2"><input type="number" step="0.01" value={item.unitPrice ?? ""} onClick={(event) => event.stopPropagation()} onChange={(event) => updateItem(index, "unitPrice", numberOrNull(event.target.value))} className="w-24 rounded border border-border bg-transparent px-1.5 py-1 text-xs" /></td>
                <td className="px-3 py-2"><input type="number" step="0.01" value={item.lineTotal ?? ""} onClick={(event) => event.stopPropagation()} onChange={(event) => updateItem(index, "lineTotal", numberOrNull(event.target.value))} className="w-24 rounded border border-border bg-transparent px-1.5 py-1 text-xs font-semibold" /></td>
                <td className="px-3 py-2 text-center"><input type="checkbox" checked={item.includeInXml !== false} onClick={(event) => event.stopPropagation()} onChange={(event) => updateItem(index, "includeInXml", event.target.checked)} /></td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={(event) => { event.stopPropagation(); duplicateRow(index); }} className="rounded p-1 text-text-muted hover:bg-border/50 hover:text-text" title="Duplicate"><Copy className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={(event) => { event.stopPropagation(); restoreRow(index); }} className="rounded p-1 text-text-muted hover:bg-border/50 hover:text-text" title="Restore"><RotateCcw className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={(event) => { event.stopPropagation(); deleteRow(index); }} className="rounded p-1 text-text-muted hover:bg-error/10 hover:text-error" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tariffLookupIndex != null && items[tariffLookupIndex] && (
        <TariffLookupPanel
          lineNumber={items[tariffLookupIndex].lineNumber}
          initialQuery={items[tariffLookupIndex].officialJamaicaTariffCode || items[tariffLookupIndex].rawHsCode || items[tariffLookupIndex].commercialDescription}
          onApply={(entry) => applyTariff(tariffLookupIndex, entry)}
          onClose={() => setTariffLookupIndex(null)}
        />
      )}

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
