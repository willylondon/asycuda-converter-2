"use client";

import { useCallback, useRef, useState } from "react";
import { AlertTriangle, CheckCircle, FileText, Loader2, Upload, X } from "lucide-react";
import type { InvoiceExtractionResult } from "@/lib/asycuda/types";

interface Props {
  onExtracted: (result: InvoiceExtractionResult) => void;
  onSkip: () => void;
  onLoadDemo: () => void;
}

const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024;

export function InvoiceUploadStep({ onExtracted, onSkip, onLoadDemo }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "extracting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((candidate: File | null) => {
    setError(null);
    setStatus("idle");
    if (!candidate) {
      setFile(null);
      return;
    }
    if (!ALLOWED_TYPES.includes(candidate.type)) {
      setFile(null);
      setError("Unsupported file type. Use PDF, PNG, JPG, JPEG or WEBP.");
      return;
    }
    if (candidate.size > MAX_BYTES) {
      setFile(null);
      setError("File too large. Maximum size is 10 MB.");
      return;
    }
    setFile(candidate);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    handleFile(event.dataTransfer.files[0] ?? null);
  }, [handleFile]);

  const handleExtract = async () => {
    if (!file) return;
    setStatus("uploading");
    setProgress("Uploading invoice…");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      setStatus("extracting");
      setProgress("Gemini Flash is extracting invoice data…");

      const response = await fetch("/invoice-to-xml/api/extract", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(typeof payload?.error === "string" ? payload.error : "Invoice extraction failed.");
      }

      setStatus("done");
      setProgress("");
      onExtracted(payload as InvoiceExtractionResult);
    } catch (caught) {
      setStatus("error");
      setProgress("");
      setError(caught instanceof Error ? caught.message : "Invoice extraction failed.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="text-2xl font-bold text-text">Upload Commercial Invoice</h2>
      <p className="mt-2 text-text-muted">
        Upload a scanned or digital invoice. Gemini Flash is primary and OpenRouter is used only as a fallback.
      </p>

      {error && !file && (
        <div className="mt-6 rounded-xl border border-error/20 bg-error/5 p-4 text-sm text-error">
          <AlertTriangle className="mr-1 inline h-4 w-4" /> {error}
        </div>
      )}

      {!file && (
        <div
          onDrop={handleDrop}
          onDragOver={(event) => event.preventDefault()}
          className="mt-8 cursor-pointer rounded-2xl border-2 border-dashed border-border p-12 text-center transition-colors hover:border-accent/50"
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
          }}
        >
          <Upload className="mx-auto h-12 w-12 text-text-muted/50" />
          <p className="mt-4 text-lg font-semibold text-text">Drag and drop your invoice here</p>
          <p className="mt-2 text-sm text-text-muted">PDF, PNG, JPG, JPEG or WEBP — up to 10 MB</p>
          <span className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white">
            <FileText className="h-4 w-4" /> Select File
          </span>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
          />
        </div>
      )}

      {file && status !== "done" && (
        <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <FileText className="h-8 w-8 flex-shrink-0 text-accent" />
              <div className="min-w-0">
                <p className="truncate font-semibold text-text">{file.name}</p>
                <p className="text-sm text-text-muted">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
            </div>
            {status === "idle" && (
              <button
                type="button"
                aria-label="Remove selected file"
                onClick={() => handleFile(null)}
                className="rounded-lg p-2 text-text-muted transition-colors hover:bg-border/50"
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
              <AlertTriangle className="mr-1 inline h-4 w-4" /> {error}
            </div>
          )}

          {(status === "idle" || status === "error") && (
            <button
              type="button"
              onClick={handleExtract}
              className="mt-4 min-h-[48px] w-full rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-light"
            >
              {status === "error" ? "Try Extraction Again" : "Extract Invoice Data"}
            </button>
          )}
        </div>
      )}

      {status === "done" && (
        <div className="mt-8 rounded-2xl border border-success/30 bg-success/5 p-6 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-success" />
          <p className="mt-3 text-lg font-semibold text-text">Extraction Complete</p>
          <p className="mt-1 text-sm text-text-muted">Review and confirm the extracted data in the next steps.</p>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button type="button" onClick={onSkip} className="min-h-[44px] text-sm text-text-muted underline underline-offset-4 hover:text-text">
          Enter invoice data manually
        </button>
        <span className="text-text-muted/40">·</span>
        <button type="button" onClick={onLoadDemo} className="min-h-[44px] text-sm text-warning underline underline-offset-4 hover:text-warning/80">
          Load PriceSmart Demo
        </button>
      </div>
    </div>
  );
}
