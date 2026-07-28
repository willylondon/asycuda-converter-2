"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle, Download, Loader2, RotateCcw } from "lucide-react";
import type { DeclarationDraft } from "@/lib/asycuda/declaration-draft";
import { formatMinorUnits, sumMinorUnits } from "@/lib/asycuda/decimal";

interface Props {
  draft: DeclarationDraft;
  onBack: () => void;
  onRestart: () => void;
}

export function XmlPreviewStep({ draft, onBack, onRestart }: Props) {
  const [xml, setXml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"clean" | "warnings" | "errors">("clean");

  useEffect(() => {
    let cancelled = false;
    const generate = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/invoice-to-xml/api/export-xml", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        });
        const data = await response.json();
        if (cancelled) return;
        if (!response.ok || data.status === "errors" || !data.xml) {
          const details = Array.isArray(data.validation)
            ? data.validation.filter((finding: { type: string }) => finding.type === "error").map((finding: { message: string }) => finding.message).join("; ")
            : data.error;
          setStatus("errors");
          setError(details || "XML generation failed validation.");
          return;
        }
        setXml(data.xml);
        setStatus(data.status);
      } catch (caught) {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "XML generation failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void generate();
    return () => { cancelled = true; };
  }, [draft]);

  const includedItems = useMemo(() => draft.items.filter((item) => item.includeInXml !== false), [draft.items]);
  const invoiceTotal = formatMinorUnits(sumMinorUnits(includedItems.map((item) => item.lineTotal)));
  const weightTotal = includedItems.reduce((sum, item) => sum + (item.grossWeightKg ?? 0), 0);

  const download = (content: string, fileName: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-text-muted" />
        <p className="mt-4 text-lg font-semibold text-text">Generating test ASYCUDA XML…</p>
      </div>
    );
  }

  if (error || !xml) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-error" />
        <p className="mt-4 text-lg font-semibold text-error">{error || "XML generation failed"}</p>
        <button onClick={onBack} className="mt-6 min-h-[44px] text-accent hover:underline">Return to validation</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="text-2xl font-bold text-text">Test ASYCUDA XML Ready</h2>
      <div className="mt-4 flex items-center gap-3">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${status === "clean" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
          {status === "clean" ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          TEST ASYCUDA XML — IMPORT COMPATIBILITY NOT YET VERIFIED
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <Summary label="Items" value={includedItems.length.toString()} />
        <Summary label="Invoice Total" value={`${draft.invoice.currency ?? ""} ${invoiceTotal}`.trim()} />
        <Summary label="Weight Total" value={`${weightTotal.toFixed(4)} kg`} />
        <Summary label="Status" value={status} />
      </div>

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-text">XML Preview</h3>
          <div className="flex gap-2">
            <button onClick={() => download(JSON.stringify(draft, null, 2), "declaration-draft.json", "application/json")} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text hover:bg-background">
              <Download className="h-4 w-4" /> JSON
            </button>
            <button onClick={() => download(xml, "asycuda-test-declaration.xml", "application/xml")} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-light">
              <Download className="h-4 w-4" /> Download XML
            </button>
          </div>
        </div>
        <pre className="max-h-[500px] overflow-auto rounded-xl border border-border bg-primary-dark p-6 font-mono text-sm leading-relaxed text-white/85">{xml}</pre>
      </div>

      <div className="mt-8 flex justify-between border-t border-border pt-6">
        <button onClick={onBack} className="min-h-[44px] text-sm text-text-muted hover:text-text">← Back to Validation</button>
        <button onClick={onRestart} className="inline-flex min-h-[44px] items-center gap-2 text-sm text-text-muted hover:text-text">
          <RotateCcw className="h-4 w-4" /> Start New Declaration
        </button>
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 break-words text-lg font-bold text-text">{value}</p>
    </div>
  );
}
