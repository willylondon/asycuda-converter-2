"use client";

import { useState } from "react";
import { FileText, Upload, Eye, CheckCircle, Download } from "lucide-react";
import { DeclarationDetailsStep, type DeclarationDetails } from "@/components/invoice-to-xml/DeclarationDetailsStep";
import { InvoiceUploadStep } from "@/components/invoice-to-xml/InvoiceUploadStep";
import { ReviewShipmentStep } from "@/components/invoice-to-xml/ReviewShipmentStep";
import { ReviewItemsStep } from "@/components/invoice-to-xml/ReviewItemsStep";
import { ValidationStep } from "@/components/invoice-to-xml/ValidationStep";
import { XmlPreviewStep } from "@/components/invoice-to-xml/XmlPreviewStep";
import { PRICEMART_DEMO_EXTRACTION } from "@/lib/asycuda/demo-data";

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

// ─── Step definitions ──────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Declaration", icon: FileText },
  { id: 2, label: "Upload", icon: Upload },
  { id: 3, label: "Review Shipment", icon: Eye },
  { id: 4, label: "Review Items", icon: Eye },
  { id: 5, label: "Validate", icon: CheckCircle },
  { id: 6, label: "XML", icon: Download },
];

// ─── Page ──────────────────────────────────────────────────────────

export default function NewDeclarationPage() {
  const [step, setStep] = useState(1);
  const [declaration, setDeclaration] = useState<DeclarationDetails | null>(null);
  const [extraction, setExtraction] = useState<InvoiceExtractionResult | null>(null);
  const [editedItems, setEditedItems] = useState<any[]>([]);
  const [isDemo, setIsDemo] = useState(false);

  const handleDeclarationNext = (data: DeclarationDetails) => {
    setDeclaration(data);
    setStep(2);
  };

  const handleExtracted = (result: InvoiceExtractionResult) => {
    setExtraction(result);
    setEditedItems(result.items.map((item) => ({...item})));
    setIsDemo(false);
    setStep(3);
  };

  const handleSkipUpload = () => {
    setIsDemo(false);
    setStep(3);
  };

  const handleLoadDemo = () => {
    const demoData = PRICEMART_DEMO_EXTRACTION as unknown as InvoiceExtractionResult;
    setExtraction({
      ...demoData,
      warnings: [
        "⚠️ DEMO DATA — NOT EXTRACTED FROM AN UPLOADED FILE",
        "This is the built-in PriceSmart test fixture. Upload a real invoice to use AI extraction.",
        ...demoData.warnings,
      ],
    });
    setEditedItems(demoData.items.map((item) => ({...item})));
    setIsDemo(true);
    setStep(3);
  };

  const handleShipmentNext = () => {
    setStep(4);
  };

  const handleItemsNext = (items: any[]) => {
    setEditedItems(items);
    setStep(5);
  };

  const handleGenerate = () => {
    setStep(6);
  };

  const handleRestart = () => {
    setStep(1);
    setDeclaration(null);
    setExtraction(null);
    setEditedItems([]);
  };

  // Build combined data for validation
  const buildValidationData = () => {
    const decl: Record<string, unknown> = {};
    if (declaration) {
      decl.declarantName = declaration.declarantName;
      decl.declarantTrn = declaration.declarantTrn;
      decl.consigneeName = declaration.consigneeName;
      decl.consigneeTrn = declaration.consigneeTrn;
      decl.manifestReference = declaration.manifestReference;
      decl.blAwb = declaration.blAwb;
      decl.regimeType = declaration.regimeType;
      decl.currency = declaration.currency;
      decl.totalPackages = declaration.totalPackages;
      decl.containerNumber = declaration.containerNumber;
      decl.exportCountry = declaration.exportCountry;
      decl.destinationCountry = declaration.destinationCountry;
    }
    if (extraction) {
      decl.merchandiseValue = extraction.invoice.merchandiseValue;
      decl.insuranceValue = extraction.invoice.insuranceValue;
      decl.freightValue = extraction.invoice.freightValue;
      decl.invoiceTotal = extraction.invoice.totalValue;
      decl.shipmentGrossWeightKg = extraction.shipment.grossWeightKg;
    }
    return decl;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Step indicator */}
      <nav aria-label="Progress" className="mb-10">
        <ol className="flex items-center gap-2 sm:gap-4">
          {STEPS.map((s, i) => {
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <li key={s.id} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent text-white"
                      : isDone
                      ? "bg-success/10 text-success"
                      : "bg-surface text-text-muted"
                  }`}
                >
                  <s.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-4 sm:w-8 ${isDone ? "bg-success/30" : "bg-border"}`} />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Step content */}
      <div className="min-h-[400px]">
        {step === 1 && (
          <DeclarationDetailsStep
            initialData={declaration}
            onNext={handleDeclarationNext}
          />
        )}

        {step === 2 && (
          <InvoiceUploadStep
            onExtracted={handleExtracted}
            onSkip={handleSkipUpload}
            onLoadDemo={handleLoadDemo}
          />
        )}

        {step === 3 && extraction && (
          <ReviewShipmentStep
            data={{
              seller: extraction.seller,
              consignee: extraction.consignee,
              shipment: extraction.shipment,
              invoice: extraction.invoice,
              packages: extraction.packages,
              warnings: extraction.warnings,
            }}
            onUpdate={(updated) => {
              setExtraction({
                ...extraction,
                seller: updated.seller,
                consignee: updated.consignee,
                shipment: updated.shipment,
                invoice: updated.invoice,
                packages: updated.packages,
              });
            }}
            onNext={handleShipmentNext}
            onBack={() => setStep(1)}
          />
        )}

        {step === 4 && extraction && (
          <ReviewItemsStep
            items={extraction.items.map((item) => ({
              ...item,
              includeInXml: true,
              normalizedCommodityCode: (item.rawHsCode || "").replace(/[\s.]+/g, "").slice(0, 8),
              precision: (item.rawHsCode || "").replace(/[\s.]+/g, "").slice(8),
              confirmedHsCode: null,
              hsSource: item.rawHsCode ? "invoice" as const : item.suggestedHsCode ? "ai-suggestion" as const : undefined,
            }))}
            onUpdate={(items) => setEditedItems(items)}
            onNext={() => handleItemsNext(editedItems)}
            onBack={() => setStep(3)}
          />
        )}

        {step === 5 && (
          <ValidationStep
            declarationData={buildValidationData()}
            items={editedItems}
            onGenerate={handleGenerate}
            onBack={() => setStep(4)}
          />
        )}

        {step === 6 && (
          <XmlPreviewStep
            declarationData={buildValidationData()}
            items={editedItems}
            onRestart={handleRestart}
          />
        )}
      </div>
    </div>
  );
}
