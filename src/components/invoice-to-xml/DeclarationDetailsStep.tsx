"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

// ─── Schema ────────────────────────────────────────────────────────

export const declarationDetailsSchema = z.object({
  declarantName: z.string().min(1, "Declarant name is required"),
  declarantTrn: z.string().optional(),
  declarantRepresentative: z.string().optional(),
  consigneeName: z.string().optional(),
  consigneeTrn: z.string().optional(),
  manifestReference: z.string().optional(),
  blAwb: z.string().optional(),
  regimeType: z.string().optional(),
  declarationType: z.string().optional(),
  generalProcedureCode: z.string().optional(),
  extendedProcedure: z.string().optional(),
  nationalProcedure: z.string().optional(),
  customsOfficeCode: z.string().optional(),
  customsOfficeName: z.string().optional(),
  borderOfficeCode: z.string().optional(),
  borderOfficeName: z.string().optional(),
  locationOfGoods: z.string().optional(),
  exportCountry: z.string().optional(),
  exportCountryName: z.string().optional(),
  destinationCountry: z.string().optional(),
  destinationCountryName: z.string().optional(),
  defaultCountryOfOrigin: z.string().optional(),
  currency: z.string().optional(),
  exchangeRate: z.string().optional(),
  totalPackages: z.string().optional(),
  packageCode: z.string().optional(),
  packageName: z.string().optional(),
  packageType: z.string().optional(),
  marksAndNumbers: z.string().optional(),
  containerNumber: z.string().optional(),
  transportMode: z.string().optional(),
  placeOfLoading: z.string().optional(),
  deliveryTermCode: z.string().optional(),
  deferredPaymentRef: z.string().optional(),
  modeOfPayment: z.string().optional(),
});

export type DeclarationDetails = z.infer<typeof declarationDetailsSchema>;

// ─── Demo data ─────────────────────────────────────────────────────

const DEMO_DATA: DeclarationDetails = {
  declarantName: "Kingston Customs Brokers Ltd",
  declarantTrn: "001-234-567",
  declarantRepresentative: "Marcus Reid",
  consigneeName: "PriceSmart Jamaica Ltd",
  consigneeTrn: "002-345-678",
  manifestReference: "MAN-2026-07891",
  blAwb: "SEAB2407123",
  regimeType: "IM4",
  declarationType: "SAD",
  generalProcedureCode: "4000",
  extendedProcedure: "",
  nationalProcedure: "4000-21",
  customsOfficeCode: "JMKIN01",
  customsOfficeName: "Kingston Wharves",
  borderOfficeCode: "JMKIN01",
  borderOfficeName: "Kingston Port",
  locationOfGoods: "KINGSTON CONTAINER TERMINAL",
  exportCountry: "US",
  exportCountryName: "United States",
  destinationCountry: "JM",
  destinationCountryName: "Jamaica",
  defaultCountryOfOrigin: "US",
  currency: "USD",
  exchangeRate: "156.50",
  totalPackages: "25",
  packageCode: "PL",
  packageName: "Pallets",
  packageType: "PL",
  marksAndNumbers: "PRICESMART JA",
  containerNumber: "SMLU7871623",
  transportMode: "1",
  placeOfLoading: "PORT EVERGLADES, FL",
  deliveryTermCode: "CIF",
  deferredPaymentRef: "",
  modeOfPayment: "D",
};

// ─── Field definition ──────────────────────────────────────────────

const FIELDS: { name: keyof DeclarationDetails; label: string; required?: boolean; placeholder?: string }[] = [
  { name: "declarantName", label: "Declarant Name", required: true, placeholder: "e.g. Kingston Customs Brokers Ltd" },
  { name: "declarantTrn", label: "Declarant TRN / Code", placeholder: "e.g. 001-234-567" },
  { name: "consigneeName", label: "Consignee Name", placeholder: "e.g. PriceSmart Jamaica Ltd" },
  { name: "consigneeTrn", label: "Consignee TRN / Code", placeholder: "e.g. 002-345-678" },
  { name: "manifestReference", label: "Manifest Reference Number", placeholder: "e.g. MAN-2026-07891" },
  { name: "blAwb", label: "BL / AWB Number", placeholder: "e.g. SEAB2407123" },
  { name: "regimeType", label: "Regime Type", placeholder: "e.g. IM4" },
  { name: "declarationType", label: "Type of Declaration", placeholder: "e.g. SAD" },
  { name: "generalProcedureCode", label: "General Procedure Code", placeholder: "e.g. 4000" },
  { name: "extendedProcedure", label: "Extended Customs Procedure", placeholder: "" },
  { name: "nationalProcedure", label: "National Customs Procedure", placeholder: "e.g. 4000-21" },
  { name: "customsOfficeCode", label: "Customs Clearance Office Code", placeholder: "e.g. JMKIN01" },
  { name: "customsOfficeName", label: "Customs Clearance Office Name", placeholder: "e.g. Kingston Wharves" },
  { name: "locationOfGoods", label: "Location of Goods", placeholder: "e.g. KINGSTON CONTAINER TERMINAL" },
  { name: "exportCountry", label: "Export Country (ISO)", placeholder: "e.g. US" },
  { name: "destinationCountry", label: "Destination Country (ISO)", placeholder: "e.g. JM" },
  { name: "defaultCountryOfOrigin", label: "Default Country of Origin (ISO)", placeholder: "e.g. US" },
  { name: "currency", label: "Currency (ISO)", placeholder: "e.g. USD" },
  { name: "exchangeRate", label: "Exchange Rate", placeholder: "e.g. 156.50" },
  { name: "totalPackages", label: "Total Packages", placeholder: "e.g. 25" },
  { name: "packageType", label: "Package Type", placeholder: "e.g. PL" },
  { name: "marksAndNumbers", label: "Marks and Numbers", placeholder: "e.g. PRICESMART JA" },
  { name: "containerNumber", label: "Container Number", placeholder: "e.g. SMLU7871623" },
  { name: "transportMode", label: "Transport Mode", placeholder: "e.g. 1 (Sea)" },
  { name: "placeOfLoading", label: "Place of Loading", placeholder: "e.g. PORT EVERGLADES, FL" },
  { name: "deferredPaymentRef", label: "Deferred Payment Reference", placeholder: "" },
  { name: "modeOfPayment", label: "Mode of Payment", placeholder: "e.g. D (Deferred)" },
];

// ─── Component ─────────────────────────────────────────────────────

interface Props {
  initialData: DeclarationDetails | null;
  onNext: (data: DeclarationDetails) => void;
}

export function DeclarationDetailsStep({ initialData, onNext }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DeclarationDetails>({
    resolver: zodResolver(declarationDetailsSchema),
    defaultValues: initialData || {},
  });

  const loadDemo = () => {
    reset(DEMO_DATA);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text">Declaration Details</h2>
        <p className="mt-2 text-text-muted">
          Enter the core customs declaration information. Fields marked * are required.
        </p>
        <button
          type="button"
          onClick={loadDemo}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent/5 transition-colors"
        >
          Load Demo Data
        </button>
      </div>

      <form onSubmit={handleSubmit(onNext)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <div key={field.name} className={field.name === "marksAndNumbers" || field.name === "declarantName" ? "sm:col-span-2" : ""}>
              <label htmlFor={field.name} className="block text-sm font-medium text-text mb-1.5">
                {field.label} {field.required && <span className="text-error">*</span>}
              </label>
              <input
                id={field.name}
                {...register(field.name)}
                placeholder={field.placeholder}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text placeholder:text-text-muted/50 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
              />
              {errors[field.name] && (
                <p className="mt-1 text-xs text-error">{errors[field.name]?.message}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <button
            type="submit"
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-accent px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-accent-light"
          >
            Continue to Upload
          </button>
        </div>
      </form>
    </div>
  );
}
