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
} from "lucide-react";
import Link from "next/link";

type Step = "upload" | "validating" | "validated" | "converting" | "complete";
type ValidationIssue = {
  type: "error" | "warning";
  message: string;
  row?: number;
  column?: string;
};

export default function ConverterPage() {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [xmlContent, setXmlContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (selectedFile: File) => {
      setError(null);

      // MIME validation
      const validMimes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];

      const validExtensions = [".xlsx", ".xls"];
      const ext = "." + selectedFile.name.split(".").pop()?.toLowerCase();

      if (
        !validMimes.includes(selectedFile.type) &&
        !validExtensions.includes(ext)
      ) {
        setError(
          `This file type is not supported. Please upload a .xlsx or .xls Excel file.`
        );
        return;
      }

      // Size check (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError(
          `File is too large. Maximum file size is 10MB. Your file is ${(
            selectedFile.size /
            1024 /
            1024
          ).toFixed(1)}MB.`
        );
        return;
      }

      setFile(selectedFile);
      setStep("validating");

      // Simulate validation (in production, this would use xlsx on server)
      await new Promise((r) => setTimeout(r, 1500));

      const validationIssues: ValidationIssue[] = [];

      // Check filename for common patterns
      if (
        !selectedFile.name.toLowerCase().includes("manifest") &&
        !selectedFile.name.toLowerCase().includes("delivery")
      ) {
        validationIssues.push({
          type: "warning",
          message:
            'File name does not contain "manifest" or "delivery". Make sure this is the correct file.',
        });
      }

      setIssues(validationIssues);
      setStep("validated");
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFile(droppedFile);
    },
    [handleFile]
  );

  const handleConvert = async () => {
    setStep("converting");
    await new Promise((r) => setTimeout(r, 2500));

    // Generate sample XML (in production, this uses server-side xlsx + XML builder)
    const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<ASYCUDA xmlns="http://www.wcoomd.org/ASYCUDA">
  <Manifest>
    <Header>
      <ManifestNumber>MAN-${Date.now()}</ManifestNumber>
      <Date>${new Date().toISOString().split("T")[0]}</Date>
      <Carrier>Sample Carrier</Carrier>
      <Vessel>Sample Vessel</Vessel>
      <VoyageNumber>VOY-${Math.floor(Math.random() * 999) + 1}</VoyageNumber>
    </Header>
    <Consignments>
      <Consignment>
        <ContainerNumber>CONT-1234567</ContainerNumber>
        <BillOfLading>BL-987654321</BillOfLading>
        <Consignee>Sample Consignee Ltd.</Consignee>
        <Description>General Cargo - Electronics</Description>
        <GrossWeight unit="KG">12500</GrossWeight>
        <PackageCount>42</PackageCount>
        <PortOfOrigin>KIN</PortOfOrigin>
        <PortOfDestination>USMIA</PortOfDestination>
      </Consignment>
    </Consignments>
  </Manifest>
</ASYCUDA>`;

    setXmlContent(sampleXml);
    setStep("complete");
  };

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

  const handleReset = () => {
    setStep("upload");
    setFile(null);
    setIssues([]);
    setXmlContent(null);
    setError(null);
  };

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
        Upload your delivery manifest, validate the structure, and download your
        ASYCUDA-compliant XML.
      </p>

      {/* Download Samples */}
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href="/samples/sample-manifest.xlsx"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover hover:border-accent/30 transition-colors min-h-[44px]"
        >
          <FileSpreadsheet className="h-4 w-4 text-accent" />
          Download Sample Excel
        </a>
      </div>

      {/* Upload Area */}
      {(step === "upload" || step === "validating") && (
        <div className="mt-8">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 sm:p-16 cursor-pointer transition-all min-h-[280px] ${
              error
                ? "border-danger bg-danger/5"
                : "border-border hover:border-accent/50 hover:bg-accent/[0.02]"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
              aria-label="Upload Excel file"
            />

            {step === "validating" ? (
              <>
                <Loader2 className="h-16 w-16 text-accent animate-spin mb-4" />
                <p className="text-lg font-semibold text-text">
                  Validating your file...
                </p>
                <p className="text-sm text-text-muted mt-2">{file?.name}</p>
              </>
            ) : (
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
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-3 rounded-xl bg-danger/5 border border-danger/20 p-4"
            >
              <AlertTriangle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-danger text-sm">
                  Upload Error
                </p>
                <p className="text-sm text-text-secondary mt-1">{error}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setError(null);
                  }}
                  className="mt-2 text-sm font-medium text-accent hover:text-accent-light transition-colors"
                >
                  Try again
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Validation Report */}
      {step === "validated" && (
        <div className="mt-8 space-y-6">
          <div className="flex items-start gap-4 rounded-2xl bg-surface border border-border p-6">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-text">
                Validation Report
              </h2>
              <p className="text-sm text-text-muted mt-1">
                File: <span className="font-medium text-text">{file?.name}</span>{" "}
                &middot;{" "}
                {file?.size && `${(file.size / 1024).toFixed(0)} KB`}
              </p>

              {issues.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {issues.map((issue, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                        issue.type === "error"
                          ? "bg-danger/5 text-danger"
                          : "bg-warning/5 text-warning"
                      }`}
                    >
                      {issue.type === "error" ? (
                        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      )}
                      <span>{issue.message}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-success font-medium flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  File structure looks good — ready to convert.
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleConvert}
              className="inline-flex items-center justify-center rounded-xl bg-accent text-white px-8 py-4 text-base font-semibold hover:bg-accent-light transition-colors min-h-[56px] flex-1 sm:flex-none"
            >
              Convert to ASYCUDA XML
              <Download className="ml-2 h-5 w-5" />
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-xl border border-border text-text-secondary px-6 py-4 text-base font-medium hover:bg-surface-hover transition-colors min-h-[56px]"
            >
              Upload Different File
            </button>
          </div>
        </div>
      )}

      {/* Converting */}
      {step === "converting" && (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl bg-surface border border-border p-16">
          <Loader2 className="h-16 w-16 text-accent animate-spin mb-6" />
          <h2 className="text-xl font-semibold text-text">
            Converting your manifest...
          </h2>
          <p className="text-sm text-text-muted mt-2">
            This usually takes a few seconds.
          </p>
          <div className="mt-6 w-full max-w-xs h-2 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full animate-pulse w-2/3" />
          </div>
        </div>
      )}

      {/* Complete */}
      {step === "complete" && xmlContent && (
        <div className="mt-8 space-y-6">
          <div className="flex items-start gap-4 rounded-2xl bg-success/5 border border-success/20 p-6">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-text">
                XML Generated Successfully
              </h2>
              <p className="text-sm text-text-muted mt-1">
                Your ASYCUDA-compliant XML file is ready. Download it below.
              </p>
            </div>
          </div>

          {/* XML Preview */}
          <div className="rounded-2xl bg-surface border border-border overflow-hidden">
            <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface-hover">
              <span className="text-sm font-semibold text-text">
                XML Preview
              </span>
              <span className="text-xs text-text-muted">
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
              onClick={handleReset}
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