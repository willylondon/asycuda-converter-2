"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, FileText, X, Loader2, AlertTriangle, CheckCircle } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────

interface InvoiceExtractionResult {
  documentType: string;
  seller: { name: string | null; address: string | null; countryCode: string | null };
  consignee: { name: string | null; address: string | null; countryCode: string | null; trn: string | null };
  shipment: {
    containerNumber: string | null; bookingNumber: string | null; carrier: string | null;
    vessel: string | null; sealNumber: string | null; sailDate: string | null;
    etaDate: string | null; billOfLading: string | null; manifestReference: string | null;
    incotermRaw: string | null; grossWeightKg: number | null;
  };
  invoice: {
    invoiceNumber: string | null; invoiceDate: string | null; currency: string | null;
    merchandiseValue: number | null; insuranceValue: number | null;
    freightValue: number | null; totalValue: number | null;
  };
  packages: Array<{ packageType: string | null; quantity: number | null }>;
  items: Array<{
    lineNumber: number; articleNumber: string | null; commercialDescription: string;
    rawHsCode: string | null; suggestedHsCode: string | null; hsCodeConfidence: number | null;
    quantity: number | null; unitOfMeasure: string | null; packageType: string | null;
    countryOfOrigin: string | null; grossWeightKg: number | null; netWeightKg: number | null;
    unitPrice: number | null; lineTotal: number | null; extractionConfidence: number;
    warnings: string[];
  }>;
  warnings: string[];
}

// ─── Props ─────────────────────────────────────────────────────────

interface Props {
  onExtracted: (result: InvoiceExtractionResult) => void;
  onSkip: () => void;
  onLoadDemo: () => void;
}

// ─── Component ─────────────────────────────────────────────────────

export function InvoiceUploadStep({ onExtracted, onSkip, onLoadDemo }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "extracting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File | null) => {
    setError(null);
    setStatus("idle");
    if (!f) return;

    const allowed = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(f.type)) {
      setError("Unsupported file type. Use PDF, PNG, JPG, or WEBP.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum 10 MB.");
      return;
    }
    setFile(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0] || null);
  }, [handleFile]);

  const handleExtract = async () => {
    if (!file) return;
    setStatus("uploading");
    setProgress("Uploading file...");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      setStatus("extracting");
      setProgress("AI extracting invoice data...");

      const res = await fetch("/invoice-to-xml/api/extract", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Extraction failed");
      }

      const result: InvoiceExtractionResult = await res.json();
      setStatus("done");
      setProgress("");
      onExtracted(result);
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Extraction failed");
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="text-2xl font-bold text-text">Upload Commercial Invoice</h2>
      <p className="mt-2 text-text-muted">
        Upload a scanned or digital commercial invoice. AI will extract shipment details, line items, and HS codes.
      </p>

      {/* Drop zone */}
      {!file && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="mt-8 rounded-2xl border-2 border-dashed border-border p-12 text-center hover:border-accent/50 transition-colors cursor-pointer"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-text-muted/50" />
          <p className="mt-4 text-lg font-semibold text-text">
            Drag and drop your invoice here
          </p>
          <p className="mt-2 text-sm text-text-muted">
            PDF, PNG, JPG, or WEBP — up to 10 MB
          </p>
          <button
            type="button"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-light transition-colors"
          >
            <FileText className="h-4 w-4" />
            Select File
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] || null)}
          />
        </div>
      )}

      {/* File selected */}
      {file && status !== "done" && (
        <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-accent" />
              <div>
                <p className="font-semibold text-text">{file.name}</p>
                <p className="text-sm text-text-muted">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
            </div>
            {status === "idle" && (
              <button
                onClick={() => { setFile(null); setStatus("idle"); }}
                className="rounded-lg p-2 text-text-muted hover:bg-border/50 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {(status === "uploading" || status === "extracting") && (
            <div className="mt-4 flex items-center gap-3 text-text-muted">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{progress}</span>
            </div>
          )}

          {status === "error" && (
            <div className="mt-4 rounded-xl bg-error/10 p-4 text-sm text-error">
              <AlertTriangle className="inline h-4 w-4 mr-1" />
              {error}
            </div>
          )}

          {status === "idle" && (
            <button
              onClick={handleExtract}
              className="mt-4 w-full rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-light transition-colors"
            >
              Extract Invoice Data
            </button>
          )}
        </div>
      )}

      {/* Done */}
      {status === "done" && (
        <div className="mt-8 rounded-2xl border border-success/30 bg-success/5 p-6 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-success" />
          <p className="mt-3 text-lg font-semibold text-text">Extraction Complete</p>
          <p className="mt-1 text-sm text-text-muted">Review the extracted data in the next steps.</p>
        </div>
      )}

      {/* Manual entry / Demo mode */}
      <div className="mt-8 flex items-center justify-center gap-6">
        <button
          onClick={onSkip}
          className="text-sm text-text-muted hover:text-text underline underline-offset-4"
        >
          Enter invoice data manually
        </button>
        <span className="text-text-muted/40">·</span>
        <button
          onClick={onLoadDemo}
          className="text-sm text-warning hover:text-warning/80 underline underline-offset-4"
        >
          Load PriceSmart Demo
        </button>
      </div>
    </div>
  );
}
