"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Download,
  Loader2,
  ArrowLeft,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import type { ConversionResult, ValidationIssue } from "@/lib/converter";

type Step = "upload" | "uploading" | "validating" | "validated" | "converting" | "complete" | "failed";

export default function ConverterPage() {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [warnings, setWarnings] = useState<ValidationIssue[]>([]);
  const [xmlContent, setXmlContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ConversionResult["stats"]>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep("upload");
    setFile(null);
    setIssues([]);
    setWarnings([]);
    setXmlContent(null);
    setError(null);
    setStats(null);
  };

  const handleFileSelect = useCallback((selectedFile: File) => {
    setError(null);

    // Client-side metadata check
    const ext = "." + selectedFile.name.split(".").pop()?.toLowerCase();
    if (![".xlsx", ".xls"].includes(ext)) {
      setError("Unsupported file format. Please upload a .xlsx or .xls file.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError(
        `File too large. Maximum is 10MB. Your file is ${(selectedFile.size / 1024 / 1024).toFixed(1)}MB.`
      );
      return;
    }

    if (selectedFile.size === 0) {
      setError("File is empty.");
      return;
    }

    setFile(selectedFile);
    setStep("uploading");

    // Send to server API
    convertFile(selectedFile);
  }, []);

  const convertFile = async (selectedFile: File) => {
    setStep("validating");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      const result: ConversionResult = await response.json();

      if (result.success && result.xml) {
        setXmlContent(result.xml);
        setIssues([]);
        setWarnings(result.warnings || []);
        setStats(result.stats);
        setStep("complete");
      } else {
        setIssues(result.errors || []);
        setWarnings(result.warnings || []);
        setStats(result.stats);
        setStep("failed");
      }
    } catch (err) {
      setError(
        "Network error: Could not reach the server. Please check your connection and try again."
      );
      setStep("upload");
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFileSelect(droppedFile);
    },
    [handleFileSelect]
  );

  const handleDownload = () => {
    if (!xmlContent || !file) return;
    const blob = new Blob([xmlContent], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name.replace(/\.(xlsx|xls)$/i, ".xml");
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Render ───────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-text-muted hover:text-accent transition-colors min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Link>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-bold text-text">
        Convert Your Excel Manifest
      </h1>
      <p className="mt-2 text-lg text-text-muted">
        Upload your delivery manifest, validate against ASYCUDA requirements, and download compliant XML.
      </p>

      {/* Upload Area */}
      {(step === "upload" || step === "uploading" || step === "validating") && (
        <div className="mt-8">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => step === "upload" && fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 sm:p-16 transition-all min-h-[280px] ${
              step === "upload"
                ? "cursor-pointer border-border hover:border-accent/50 hover:bg-accent/[0.02]"
                : "border-accent/30 bg-accent/[0.02]"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
              aria-label="Upload Excel file"
            />

            {step === "upload" ? (
              <>
                <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                  <Upload className="h-10 w-10 text-accent" />
                </div>
                <p className="text-lg font-semibold text-text">
                  Drag and drop your Excel file here
                </p>
                <p className="text-sm text-text-muted mt-2">
                  or click to browse — .xlsx and .xls up to 10MB
                </p>
              </>
            ) : (
              <>
                <Loader2 className="h-16 w-16 text-accent animate-spin mb-4" />
                <p className="text-lg font-semibold text-text">
                  {step === "uploading"
                    ? "Uploading..."
                    : "Validating your file..."}
                </p>
                <p className="text-sm text-text-muted mt-2">{file?.name}</p>
              </>
            )}
          </div>

          {error && (
            <div role="alert" className="mt-4 flex items-start gap-3 rounded-xl bg-danger/5 border border-danger/20 p-4">
              <AlertTriangle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-danger text-sm">Upload Error</p>
                <p className="text-sm text-text-secondary mt-1">{error}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setError(null);
                  }}
                  className="mt-2 text-sm font-medium text-accent hover:text-accent-light"
                >
                  Try again
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── FAILED STATE ─── */}
      {step === "failed" && (
        <div className="mt-8 space-y-6">
          <div className="flex items-start gap-4 rounded-2xl bg-danger/5 border border-danger/20 p-6">
            <div className="w-12 h-12 rounded-xl bg-danger/10 flex items-center justify-center flex-shrink-0">
              <XCircle className="h-6 w-6 text-danger" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-text">Conversion Failed</h2>
              <p className="text-sm text-text-muted mt-1">
                {issues.length} issue{issues.length !== 1 ? "s" : ""} found — review the details below and re-upload a corrected file.
              </p>
              {stats && (
                <p className="text-xs text-text-muted mt-2">
                  Processed {stats.rowCount} row{stats.rowCount !== 1 ? "s" : ""} across {stats.columnCount} column{stats.columnCount !== 1 ? "s" : ""}
                  {" · "}
                  <span className="font-mono">{stats.fileName}</span>
                  {" · "}
                  {stats.fileSizeKB} KB
                </p>
              )}
            </div>
          </div>

          {/* Error list */}
          {issues.length > 0 && (
            <div className="rounded-2xl bg-surface border border-border overflow-hidden">
              <div className="px-6 py-3 border-b border-border bg-surface-hover">
                <span className="text-sm font-semibold text-text">Validation Errors ({issues.length})</span>
              </div>
              <div className="divide-y divide-border max-h-80 overflow-y-auto">
                {issues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-3 px-6 py-3 text-sm">
                    <AlertTriangle className="h-4 w-4 text-danger flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-text-secondary">{issue.message}</span>
                      {(issue.row || issue.column) && (
                        <span className="text-text-muted ml-2 text-xs">
                          {issue.row && `Row ${issue.row}`}
                          {issue.row && issue.column && " · "}
                          {issue.column && `${issue.column}`}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {warnings.length > 0 && (
            <div className="rounded-2xl bg-warning/5 border border-warning/20 p-4">
              <p className="text-sm font-semibold text-warning mb-2">Warnings ({warnings.length})</p>
              <ul className="space-y-1">
                {warnings.map((w, i) => (
                  <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                    {w.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center rounded-xl bg-accent text-white px-8 py-4 text-base font-semibold hover:bg-accent-light transition-colors min-h-[56px]"
            >
              Upload a Different File
            </button>
          </div>
        </div>
      )}

      {/* ─── COMPLETE STATE ─── */}
      {step === "complete" && xmlContent && (
        <div className="mt-8 space-y-6">
          <div className="flex items-start gap-4 rounded-2xl bg-success/5 border border-success/20 p-6">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-text">XML Generated Successfully</h2>
              <p className="text-sm text-text-muted mt-1">
                Your ASYCUDA-compliant XML is ready. {stats && `${stats.rowCount} consignment${stats.rowCount !== 1 ? "s" : ""} processed.`}
              </p>
              {warnings.length > 0 && (
                <p className="text-xs text-warning mt-2">
                  {warnings.length} warning{warnings.length !== 1 ? "s" : ""} — see details below.
                </p>
              )}
            </div>
          </div>

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="rounded-2xl bg-warning/5 border border-warning/20 p-4">
              <p className="text-sm font-semibold text-warning mb-2">Warnings</p>
              <ul className="space-y-1">
                {warnings.map((w, i) => (
                  <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                    {w.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* XML Preview */}
          <div className="rounded-2xl bg-surface border border-border overflow-hidden">
            <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface-hover">
              <span className="text-sm font-semibold text-text">XML Preview</span>
              <span className="text-xs text-text-muted font-mono">
                {file?.name?.replace(/\.(xlsx|xls)$/i, ".xml")}
              </span>
            </div>
            <pre className="p-6 text-sm text-text-secondary overflow-x-auto font-mono max-h-96 overflow-y-auto whitespace-pre-wrap">
              {xmlContent}
            </pre>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="inline-flex items-center justify-center rounded-xl bg-success text-white px-8 py-4 text-base font-semibold hover:bg-success-light transition-colors min-h-[56px] flex-1 sm:flex-none"
            >
              <Download className="mr-2 h-5 w-5" />
              Download XML File
            </button>
            <button
              onClick={reset}
              className="inline-flex items-center justify-center rounded-xl border border-border text-text-secondary px-6 py-4 text-base font-medium hover:bg-surface-hover transition-colors min-h-[56px]"
            >
              Convert Another File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
