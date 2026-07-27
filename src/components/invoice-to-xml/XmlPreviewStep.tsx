"use client";

import { useState, useEffect } from "react";
import { Download, FileText, CheckCircle, AlertTriangle, Loader2, RotateCcw } from "lucide-react";
import Link from "next/link";

// ─── Types ─────────────────────────────────────────────────────────

interface ValidationFinding {
  type: "error" | "warning" | "info";
  message: string;
  field?: string;
}

interface Props {
  declarationData: Record<string, unknown>;
  items: Array<Record<string, unknown>>;
  onRestart: () => void;
}

// ─── Component ─────────────────────────────────────────────────────

export function XmlPreviewStep({ declarationData, items, onRestart }: Props) {
  const [xml, setXml] = useState<string | null>(null);
  const [json, setJson] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"clean" | "warnings" | "errors">("clean");

  useEffect(() => {
    generateXml();
  }, []);

  const generateXml = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/invoice-to-xml/api/export-xml", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ declaration: declarationData, items }),
      });

      const data = await res.json();

      if (data.status === "errors") {
        setError("Validation errors exist. Please go back and fix them.");
        setStatus("errors");
        return;
      }

      setXml(data.xml);
      setJson(JSON.stringify({ declaration: declarationData, items }, null, 2));
      setStatus(data.status);
    } catch (e) {
      setError(e instanceof Error ? e.message : "XML generation failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadXml = () => {
    if (!xml) return;
    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "asycuda-declaration.xml";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJson = () => {
    if (!json) return;
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "extracted-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-text-muted" />
        <p className="mt-4 text-lg font-semibold text-text">Generating ASYCUDA XML...</p>
        <p className="mt-2 text-sm text-text-muted">Building declaration structure from your data.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-error" />
        <p className="mt-4 text-lg font-semibold text-error">{error}</p>
        <button onClick={onRestart} className="mt-6 text-accent hover:underline">
          Go back to fix
        </button>
      </div>
    );
  }

  const itemCount = items.length;
  const lineSum = items.reduce((sum, i) => sum + ((i.lineTotal as number) ?? 0), 0);
  const weightSum = items.reduce((sum, i) => sum + ((i.grossWeightKg as number) ?? 0), 0);

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="text-2xl font-bold text-text">ASYCUDA XML Ready</h2>

      {/* Status badge */}
      <div className="mt-4 flex items-center gap-3">
        {status === "clean" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-sm font-semibold text-success">
            <CheckCircle className="h-4 w-4" />
            Clean Declaration
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1 text-sm font-semibold text-warning">
            <AlertTriangle className="h-4 w-4" />
            TEST XML — REQUIRES DECLARANT VERIFICATION
          </span>
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-text-muted">Items</p>
          <p className="mt-1 text-2xl font-bold text-text">{itemCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-text-muted">Invoice Total</p>
          <p className="mt-1 text-2xl font-bold text-text">${lineSum.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-text-muted">Weight Total</p>
          <p className="mt-1 text-2xl font-bold text-text">{weightSum.toFixed(1)} kg</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-text-muted">Status</p>
          <p className="mt-1 text-lg font-bold text-text capitalize">{status}</p>
        </div>
      </div>

      {/* XML Preview */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-text">XML Preview</h3>
          <div className="flex gap-2">
            <button
              onClick={downloadJson}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text hover:bg-background transition-colors"
            >
              <Download className="h-4 w-4" />
              JSON
            </button>
            <button
              onClick={downloadXml}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-1.5 text-sm font-semibold text-white hover:bg-accent-light transition-colors"
            >
              <Download className="h-4 w-4" />
              Download XML
            </button>
          </div>
        </div>
        <pre className="overflow-x-auto rounded-xl border border-border bg-primary-dark p-6 text-sm text-white/85 max-h-[500px] overflow-y-auto font-mono leading-relaxed">
          {xml}
        </pre>
      </div>

      {/* Restart */}
      <div className="mt-8 text-center">
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Start New Declaration
        </button>
      </div>
    </div>
  );
}
