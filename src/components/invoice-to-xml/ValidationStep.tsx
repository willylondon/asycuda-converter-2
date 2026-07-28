"use client";

import { useMemo } from "react";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import type { DeclarationDraft } from "@/lib/asycuda/declaration-draft";
import { validateDeclaration } from "@/lib/asycuda/validation";

interface Props {
  draft: DeclarationDraft;
  onGenerate: () => void;
  onBack: () => void;
}

export function ValidationStep({ draft, onGenerate, onBack }: Props) {
  const findings = useMemo(() => validateDeclaration(draft), [draft]);
  const errors = findings.filter((finding) => finding.type === "error");
  const warnings = findings.filter((finding) => finding.type === "warning");
  const infos = findings.filter((finding) => finding.type === "info");

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="text-2xl font-bold text-text">Validation Results</h2>
      <p className="mt-2 text-text-muted">The same deterministic rules run here and on the XML export endpoint.</p>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-error/30 bg-error/5 p-4 text-center">
          <AlertTriangle className="mx-auto h-6 w-6 text-error" />
          <p className="mt-2 text-2xl font-bold text-error">{errors.length}</p>
          <p className="text-xs text-text-muted">Errors</p>
        </div>
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 text-center">
          <AlertTriangle className="mx-auto h-6 w-6 text-warning" />
          <p className="mt-2 text-2xl font-bold text-warning">{warnings.length}</p>
          <p className="text-xs text-text-muted">Warnings</p>
        </div>
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 text-center">
          <Info className="mx-auto h-6 w-6 text-accent" />
          <p className="mt-2 text-2xl font-bold text-accent">{infos.length}</p>
          <p className="text-xs text-text-muted">Information</p>
        </div>
      </div>

      {findings.length > 0 ? (
        <div className="mt-6 space-y-2">
          {findings.map((finding, index) => (
            <div
              key={`${finding.message}-${index}`}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
                finding.type === "error" ? "border-error/20 bg-error/5" :
                finding.type === "warning" ? "border-warning/20 bg-warning/5" :
                "border-accent/20 bg-accent/5"
              }`}
            >
              {finding.type === "info" ? <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" /> : <AlertTriangle className={`mt-0.5 h-5 w-5 flex-shrink-0 ${finding.type === "error" ? "text-error" : "text-warning"}`} />}
              <div>
                <span className={`font-semibold ${finding.type === "error" ? "text-error" : finding.type === "warning" ? "text-warning" : "text-accent"}`}>
                  {finding.type.toUpperCase()}
                </span>
                <span className="ml-2 text-text">{finding.message}</span>
                {finding.field && <span className="ml-2 text-xs text-text-muted">({finding.field})</span>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-success/30 bg-success/5 p-8 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-success" />
          <p className="mt-3 text-lg font-semibold text-text">All Deterministic Checks Passed</p>
        </div>
      )}

      <div className="mt-8 flex justify-between border-t border-border pt-6">
        <button onClick={onBack} className="min-h-[44px] text-sm font-medium text-text-muted hover:text-text">← Back to Items</button>
        <button
          onClick={onGenerate}
          disabled={errors.length > 0}
          className={`inline-flex min-h-[48px] items-center rounded-xl px-8 py-3 font-semibold text-white ${errors.length > 0 ? "cursor-not-allowed bg-border" : "bg-accent hover:bg-accent-light"}`}
        >
          {errors.length > 0 ? "Fix Errors to Continue" : warnings.length > 0 ? "Generate Test XML" : "Generate Test XML"}
        </button>
      </div>
    </div>
  );
}
