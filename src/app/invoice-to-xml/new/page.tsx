"use client";

import { useState } from "react";
import { Check, CheckCircle, Download, Eye, FileText, Upload } from "lucide-react";
import { GoogleAuthGate } from "@/components/auth/GoogleAuthGate";
import { DeclarationDetailsStep } from "@/components/invoice-to-xml/DeclarationDetailsStep";
import { InvoiceUploadStep } from "@/components/invoice-to-xml/InvoiceUploadStep";
import { ReviewItemsStep } from "@/components/invoice-to-xml/ReviewItemsStep";
import { ReviewShipmentStep } from "@/components/invoice-to-xml/ReviewShipmentStep";
import { ValidationStep } from "@/components/invoice-to-xml/ValidationStep";
import { XmlPreviewStep } from "@/components/invoice-to-xml/XmlPreviewStep";
import { createExtractionDraft } from "@/lib/asycuda/create-extraction-draft";
import { PRICEMART_DEMO_EXTRACTION } from "@/lib/asycuda/demo-data";
import {
  applyDeclarationDetails,
  createBlankDeclarationDraft,
  declarationDetailsFromDraft,
  type DeclarationDraft,
} from "@/lib/asycuda/declaration-draft";
import type { InvoiceExtractionResult } from "@/lib/asycuda/types";

const STEPS = [
  { id: 1, label: "Declaration", icon: FileText },
  { id: 2, label: "Invoice", icon: Upload },
  { id: 3, label: "Review", icon: Eye },
  { id: 4, label: "Validate", icon: CheckCircle },
  { id: 5, label: "Export", icon: Download },
];

export default function NewDeclarationPage() {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<DeclarationDraft>(() => createBlankDeclarationDraft());
  const progressStep = step <= 2 ? step : step <= 4 ? 3 : step === 5 ? 4 : 5;

  const handleRestart = () => {
    setDraft(createBlankDeclarationDraft());
    setStep(1);
  };

  return (
    <GoogleAuthGate>
      <div className="mx-auto max-w-[1320px] px-4 py-7 sm:px-6 lg:px-8">
        <nav aria-label="Progress" className="mb-10 overflow-x-auto border-b border-border pb-7">
          <ol className="flex min-w-[720px] items-center">
            {STEPS.map((item, index) => {
              const active = progressStep === item.id;
              const done = progressStep > item.id;
              return (
                <li key={item.id} className="flex flex-1 items-center last:flex-none">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold ${
                      active ? "border-accent bg-accent text-white" : done ? "border-success bg-success/10 text-success" : "border-border bg-white text-text-muted"
                    }`}>
                      {done ? <Check className="h-4 w-4" /> : item.id}
                    </span>
                    <span className={`text-sm font-semibold ${active ? "text-accent" : done ? "text-text" : "text-text-muted"}`}>{item.label}</span>
                  </div>
                  {index < STEPS.length - 1 && <div className={`mx-4 h-px flex-1 ${done ? "bg-success" : "bg-border"}`} />}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="min-h-[400px]">
          {step === 1 && (
            <DeclarationDetailsStep
              initialData={declarationDetailsFromDraft(draft)}
              onNext={(details) => {
                setDraft((current) => applyDeclarationDetails(current, details));
                setStep(2);
              }}
            />
          )}

          {step === 2 && (
            <InvoiceUploadStep
              onExtracted={(result: InvoiceExtractionResult) => {
                setDraft((current) => createExtractionDraft(result, current, "ai"));
                setStep(3);
              }}
              onSkip={() => {
                setDraft((current) => ({ ...current, source: "manual", warnings: ["Manual entry mode — no invoice data was extracted."] }));
                setStep(3);
              }}
              onLoadDemo={() => {
                const demo = PRICEMART_DEMO_EXTRACTION as InvoiceExtractionResult;
                setDraft((current) => {
                  const next = createExtractionDraft(demo, current, "demo");
                  next.warnings = [
                    "DEMO DATA — NOT EXTRACTED FROM AN UPLOADED FILE",
                    ...next.warnings,
                  ];
                  return next;
                });
                setStep(3);
              }}
            />
          )}

          {step === 3 && (
            <ReviewShipmentStep
              draft={draft}
              onContinue={(reviewedDraft) => {
                setDraft(reviewedDraft);
                setStep(4);
              }}
              onBack={() => setStep(2)}
            />
          )}

          {step === 4 && (
            <ReviewItemsStep
              items={draft.items}
              onContinue={(items) => {
                setDraft((current) => ({ ...current, items }));
                setStep(5);
              }}
              onBack={() => setStep(3)}
            />
          )}

          {step === 5 && (
            <ValidationStep
              draft={draft}
              onGenerate={() => setStep(6)}
              onBack={() => setStep(4)}
            />
          )}

          {step === 6 && (
            <XmlPreviewStep
              draft={draft}
              onBack={() => setStep(5)}
              onRestart={handleRestart}
            />
          )}
        </div>
      </div>
    </GoogleAuthGate>
  );
}
