"use client";

import Link from "next/link";
import { useCallback, useRef, useState, useEffect, type DragEvent, type KeyboardEvent } from "react";
import {
  ArrowLeft,
  Upload,
  CheckCircle,
  AlertTriangle,
  Download,
  Loader2,
  XCircle,
} from "lucide-react";
import type { ConversionResult, ValidationIssue } from "@/lib/converter";

type Step = "upload" | "uploading" | "validating" | "complete" | "failed";

export function ConverterWorkspace() {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [warnings, setWarnings] = useState<ValidationIssue[]>([]);
  const [xmlContent, setXmlContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ConversionResult["stats"]>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // WiPay Verification States
  const [paymentVerified, setPaymentVerified] = useState<boolean | null>(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string | null>(null);
  const [paymentTxId, setPaymentTxId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const transactionId = params.get("transaction_id");
    const orderId = params.get("order_id");
    const total = params.get("total");
    const hash = params.get("hash");

    if (status && transactionId && total && hash) {
      // Defer state updates to avoid synchronous setState in useEffect
      Promise.resolve().then(() => {
        setVerifyingPayment(true);
        setPaymentTxId(transactionId);
        setPaymentAmount(total);
      });

      // Clean URL params so they do not linger on refresh
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);

      fetch("/api/wipay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, transactionId, orderId, total, hash }),
      })
        .then((res) => {
          if (!res.ok) {
            return res.json().then((data) => {
              throw new Error(data.error || "Payment verification failed.");
            });
          }
          return res.json();
        })
        .then((data) => {
          if (data.success) {
            setPaymentVerified(true);
          } else {
            setPaymentError("Payment verification failed.");
          }
        })
        .catch((err) => {
          console.error("Verification error:", err);
          setPaymentError(err instanceof Error ? err.message : "Network error during payment verification.");
        })
        .finally(() => {
          setVerifyingPayment(false);
        });
    }
  }, []);

  const reset = () => {
    setStep("upload");
    setFile(null);
    setIssues([]);
    setWarnings([]);
    setXmlContent(null);
    setError(null);
    setStats(null);
  };


  const convertFile = useCallback(async (selectedFile: File) => {
    setStep("validating");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/convert", { method: "POST", body: formData });
      const result: ConversionResult = await response.json();

      if (result.success && result.xml) {
        setXmlContent(result.xml);
        setIssues([]);
        setWarnings(result.warnings || []);
        setStats(result.stats);
        setStep("complete");
        return;
      }

      setIssues(result.errors || []);
      setWarnings(result.warnings || []);
      setStats(result.stats);
      setStep("failed");
    } catch {
      setError("Network error: Could not reach the server. Please check your connection and try again.");
      setStep("upload");
    }
  }, []);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setError(null);

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
    void convertFile(selectedFile);
  }, [convertFile]);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const droppedFile = event.dataTransfer.files[0];
      if (droppedFile) handleFileSelect(droppedFile);
    },
    [handleFileSelect]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (step !== "upload") return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        fileInputRef.current?.click();
      }
    },
    [step]
  );

  const handleDownload = () => {
    if (!xmlContent || !file) return;
    const blob = new Blob([xmlContent], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = file.name.replace(/\.(xlsx|xls)$/i, ".xml");
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-8">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center text-sm text-text-muted transition-colors hover:text-accent"
        >
          <ArrowLeft aria-hidden="true" className="mr-1 h-4 w-4" />
          Back to Home
        </Link>
      </nav>

      <h1 className="text-3xl font-bold text-text sm:text-4xl">Convert Your Excel Manifest</h1>
      <p className="mt-2 text-lg text-text-muted">
        Upload your delivery manifest, validate against ASYCUDA requirements, and download compliant XML.
      </p>

      {verifyingPayment && (
        <div className="mt-8 flex items-center gap-3 rounded-xl border border-accent/20 bg-accent/5 p-4 animate-pulse">
          <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin text-accent" />
          <p className="text-sm font-medium text-text-secondary">
            Verifying your WiPay payment... Please wait.
          </p>
        </div>
      )}

      {paymentVerified && (
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-success/20 bg-success/5 p-4 animate-fade-in">
          <CheckCircle aria-hidden="true" className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
          <div>
            <p className="text-sm font-semibold text-success">Payment Verified</p>
            <p className="mt-1 text-sm text-text-secondary">
              Thank you! Your payment of ${paymentAmount} TTD (Tx ID: #{paymentTxId}) has been successfully verified. You can now use the converter workspace.
            </p>
          </div>
        </div>
      )}

      {paymentError && (
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-danger/20 bg-danger/5 p-4">
          <XCircle aria-hidden="true" className="mt-0.5 h-5 w-5 flex-shrink-0 text-danger" />
          <div>
            <p className="text-sm font-semibold text-danger">Payment Verification Failed</p>
            <p className="mt-1 text-sm text-text-secondary">{paymentError}</p>
          </div>
        </div>
      )}


      {(step === "upload" || step === "uploading" || step === "validating") && (
        <div className="mt-8">
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload Excel file"
            aria-describedby="converter-upload-help"
            onDrop={handleDrop}
            onDragOver={(event) => event.preventDefault()}
            onClick={() => step === "upload" && fileInputRef.current?.click()}
            onKeyDown={handleKeyDown}
            className={`relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all sm:p-16 ${
              step === "upload"
                ? "border-border hover:border-accent/50 hover:bg-accent/[0.02]"
                : "border-accent/30 bg-accent/[0.02]"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={(event) => event.target.files?.[0] && handleFileSelect(event.target.files[0])}
              className="hidden"
              aria-label="Upload Excel file"
            />

            {step === "upload" ? (
              <>
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10">
                  <Upload aria-hidden="true" className="h-10 w-10 text-accent" />
                </div>
                <p className="text-lg font-semibold text-text">Drag and drop your Excel file here</p>
                <p id="converter-upload-help" className="mt-2 text-sm text-text-muted">
                  or click to browse — .xlsx and .xls up to 10MB
                </p>
              </>
            ) : (
              <>
                <Loader2 aria-hidden="true" className="mb-4 h-16 w-16 animate-spin text-accent" />
                <p className="text-lg font-semibold text-text">
                  {step === "uploading" ? "Uploading..." : "Validating your file..."}
                </p>
                <p className="mt-2 text-sm text-text-muted">{file?.name}</p>
              </>
            )}
          </div>

          {error ? (
            <div role="alert" className="mt-4 flex items-start gap-3 rounded-xl border border-danger/20 bg-danger/5 p-4">
              <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 flex-shrink-0 text-danger" />
              <div>
                <p className="text-sm font-semibold text-danger">Upload Error</p>
                <p className="mt-1 text-sm text-text-secondary">{error}</p>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setError(null);
                  }}
                  className="mt-2 text-sm font-medium text-accent hover:text-accent-light"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {step === "failed" && (
        <div className="mt-8 space-y-6">
          <div className="flex items-start gap-4 rounded-2xl border border-danger/20 bg-danger/5 p-6">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-danger/10">
              <XCircle aria-hidden="true" className="h-6 w-6 text-danger" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-text">Conversion Failed</h2>
              <p className="mt-1 text-sm text-text-muted">
                {issues.length} issue{issues.length !== 1 ? "s" : ""} found — review the details below and re-upload a corrected file.
              </p>
              {stats ? (
                <p className="mt-2 text-xs text-text-muted">
                  Processed {stats.rowCount} row{stats.rowCount !== 1 ? "s" : ""} across {stats.columnCount} column
                  {stats.columnCount !== 1 ? "s" : ""}
                  {" · "}
                  <span className="font-mono">{stats.fileName}</span>
                  {" · "}
                  {stats.fileSizeKB} KB
                </p>
              ) : null}
            </div>
          </div>

          {issues.length > 0 ? (
            <div className="max-h-80 overflow-y-auto rounded-2xl border border-border bg-surface">
              <div className="border-b border-border bg-surface-hover px-6 py-3">
                <span className="text-sm font-semibold text-text">Validation Errors ({issues.length})</span>
              </div>
              <div className="divide-y divide-border">
                {issues.map((issue, index) => (
                  <div key={`${issue.message}-${index}`} className="flex items-start gap-3 px-6 py-3 text-sm">
                    <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 flex-shrink-0 text-danger" />
                    <div>
                      <span className="text-text-secondary">{issue.message}</span>
                      {(issue.row || issue.column) && (
                        <span className="ml-2 text-xs text-text-muted">
                          {issue.row ? `Row ${issue.row}` : ""}
                          {issue.row && issue.column ? " · " : ""}
                          {issue.column ?? ""}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {warnings.length > 0 ? (
            <div className="rounded-2xl border border-warning/20 bg-warning/5 p-4">
              <p className="mb-2 text-sm font-semibold text-warning">Warnings ({warnings.length})</p>
              <ul className="space-y-1">
                {warnings.map((warning, index) => (
                  <li key={`${warning.message}-${index}`} className="flex items-start gap-2 text-sm text-text-secondary">
                    <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
                    {warning.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-[56px] items-center justify-center rounded-xl bg-accent px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-accent-light"
          >
            Upload a Different File
          </button>
        </div>
      )}

      {step === "complete" && xmlContent ? (
        <div className="mt-8 space-y-6">
          <div className="flex items-start gap-4 rounded-2xl border border-success/20 bg-success/5 p-6">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-success/10">
              <CheckCircle aria-hidden="true" className="h-6 w-6 text-success" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-text">XML Generated Successfully</h2>
              <p className="mt-1 text-sm text-text-muted">
                Your ASYCUDA-compliant XML is ready.
                {stats ? ` ${stats.rowCount} consignment${stats.rowCount !== 1 ? "s" : ""} processed.` : ""}
              </p>
              {warnings.length > 0 ? (
                <p className="mt-2 text-xs text-warning">
                  {warnings.length} warning{warnings.length !== 1 ? "s" : ""} — see details below.
                </p>
              ) : null}
            </div>
          </div>

          {warnings.length > 0 ? (
            <div className="rounded-2xl border border-warning/20 bg-warning/5 p-4">
              <p className="mb-2 text-sm font-semibold text-warning">Warnings</p>
              <ul className="space-y-1">
                {warnings.map((warning, index) => (
                  <li key={`${warning.message}-${index}`} className="flex items-start gap-2 text-sm text-text-secondary">
                    <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
                    {warning.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border bg-surface-hover px-6 py-3">
              <span className="text-sm font-semibold text-text">XML Preview</span>
              <span className="font-mono text-xs text-text-muted">
                {file?.name?.replace(/\.(xlsx|xls)$/i, ".xml")}
              </span>
            </div>
            <pre className="max-h-96 overflow-x-auto overflow-y-auto whitespace-pre-wrap p-6 font-mono text-sm text-text-secondary">
              {xmlContent}
            </pre>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex min-h-[56px] flex-1 items-center justify-center rounded-xl bg-success px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-success-light sm:flex-none"
            >
              <Download aria-hidden="true" className="mr-2 h-5 w-5" />
              Download XML File
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-[56px] items-center justify-center rounded-xl border border-border px-6 py-4 text-base font-medium text-text-secondary transition-colors hover:bg-surface-hover"
            >
              Convert Another File
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
