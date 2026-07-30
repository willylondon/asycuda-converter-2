"use client";

import { useState } from "react";
import { CheckCircle, Download, Eye, FileText, Upload } from "lucide-react";
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
  { id: 2, label: "Upload", icon: Upload },
  { id: 3, label: "Review Shipment", icon: Eye },
  { id: 4, label: "Review Items", icon: Eye },
  { id: 5, label: "Validate", icon: CheckCircle },
  { id: 6, label: "XML", icon: Download },
];

export default function NewDeclarationPage() {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<DeclarationDraft>(() => createBlankDeclarationDraft());

  const handleRestart = () => {
    setDraft(createBlankDeclarationDraft());
    setStep(1);
  };

  return (
    <GoogleAuthGate>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav aria-label="Progress" className="mb-10 overflow-x-auto">
          <ol className="flex min-w-max items-center gap-2 sm:gap-4">
            {STEPS.map((item, index) => {
              const active = step === item.id;
              const done = step > item.id;
              return (
                <li key={item.id} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${active ? "bg-accent text-white" : done ? "bg-success/10 text-success" : "bg-surface text-text-muted"}`}>
                    <item.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </div>
                  {index < STEPS.length - 1 && <div className={`h-px w-4 sm:w-8 ${done ? "bg-success/30" : "bg-border"}`} />}
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
