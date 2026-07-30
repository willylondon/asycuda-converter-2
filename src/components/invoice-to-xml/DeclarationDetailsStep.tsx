"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FileText, PackageCheck, Save, Ship, UserRound } from "lucide-react";

export const declarationDetailsSchema = z.object({
  declarantName: z.string().min(1, "Declarant name is required"),
  declarantTrn: z.string().optional(),
  declarantRepresentative: z.string().optional(),
  consigneeName: z.string().optional(),
  consigneeAddress: z.string().optional(),
  consigneeTrn: z.string().optional(),
  responsiblePartyName: z.string().optional(),
  responsiblePartyCode: z.string().optional(),
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
  placeOfLoadingCode: z.string().optional(),
  placeOfLoadingName: z.string().optional(),
  deliveryTermCode: z.string().optional(),
  deferredPaymentRef: z.string().optional(),
  modeOfPayment: z.string().optional(),
});

export type DeclarationDetails = z.infer<typeof declarationDetailsSchema>;

const DEMO_DATA: DeclarationDetails = {
  declarantName: "Kingston Customs Brokers Ltd",
  declarantTrn: "001-234-567",
  declarantRepresentative: "Marcus Reid",
  consigneeName: "PriceSmart Jamaica Ltd",
  consigneeAddress: "Jamaica",
  consigneeTrn: "002-345-678",
  responsiblePartyName: "PriceSmart Jamaica Ltd",
  responsiblePartyCode: "002-345-678",
  manifestReference: "MAN-2026-07891",
  blAwb: "SEAB2407123",
  regimeType: "IM4",
  declarationType: "SAD",
  generalProcedureCode: "4000",
  extendedProcedure: "4000",
  nationalProcedure: "21",
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
  packageName: "Pallet",
  packageType: "PL",
  marksAndNumbers: "PRICESMART JA",
  containerNumber: "SMLU7871623",
  transportMode: "1",
  placeOfLoading: "Port Everglades, Florida",
  placeOfLoadingCode: "USPEF",
  placeOfLoadingName: "Port Everglades, Florida",
  // PriceSmart prints C&I. It must be reviewed rather than silently changed to CIF.
  deliveryTermCode: "",
  deferredPaymentRef: "",
  modeOfPayment: "D",
};

const FIELDS: Array<{ name: keyof DeclarationDetails; label: string; required?: boolean; placeholder?: string; wide?: boolean }> = [
  { name: "declarantName", label: "Declarant Name", required: true, placeholder: "e.g. Kingston Customs Brokers Ltd", wide: true },
  { name: "declarantTrn", label: "Declarant TRN / Code" },
  { name: "declarantRepresentative", label: "Declarant Representative" },
  { name: "consigneeName", label: "Consignee / Importer Name", wide: true },
  { name: "consigneeAddress", label: "Consignee Address", wide: true },
  { name: "consigneeTrn", label: "Consignee TRN / Code" },
  { name: "responsiblePartyName", label: "Person / Entity Responsible" },
  { name: "responsiblePartyCode", label: "Responsible Party Code" },
  { name: "manifestReference", label: "Manifest Reference Number" },
  { name: "blAwb", label: "BL / AWB Number" },
  { name: "regimeType", label: "Regime Type", placeholder: "e.g. IM4" },
  { name: "declarationType", label: "Type of Declaration", placeholder: "e.g. SAD" },
  { name: "generalProcedureCode", label: "General Procedure Code", placeholder: "e.g. 4000" },
  { name: "extendedProcedure", label: "Extended Customs Procedure" },
  { name: "nationalProcedure", label: "National Customs Procedure" },
  { name: "customsOfficeCode", label: "Customs Clearance Office Code" },
  { name: "customsOfficeName", label: "Customs Clearance Office Name" },
  { name: "borderOfficeCode", label: "Office of Entry / Exit Code" },
  { name: "borderOfficeName", label: "Office of Entry / Exit Name" },
  { name: "locationOfGoods", label: "Location of Goods", wide: true },
  { name: "exportCountry", label: "Export Country Code" },
  { name: "exportCountryName", label: "Export Country Name" },
  { name: "destinationCountry", label: "Destination Country Code" },
  { name: "destinationCountryName", label: "Destination Country Name" },
  { name: "defaultCountryOfOrigin", label: "Default Country of Origin" },
  { name: "currency", label: "Invoice Currency" },
  { name: "exchangeRate", label: "Exchange Rate" },
  { name: "totalPackages", label: "Total Packages" },
  { name: "packageCode", label: "Default Package Code" },
  { name: "packageName", label: "Default Package Name" },
  { name: "marksAndNumbers", label: "Marks and Numbers", wide: true },
  { name: "containerNumber", label: "Container Number" },
  { name: "transportMode", label: "Transport Mode" },
  { name: "placeOfLoadingCode", label: "Place of Loading Code" },
  { name: "placeOfLoadingName", label: "Place of Loading Name" },
  { name: "deliveryTermCode", label: "Confirmed ASYCUDA Delivery-Term Code" },
  { name: "deferredPaymentRef", label: "Deferred Payment Reference" },
  { name: "modeOfPayment", label: "Mode of Payment" },
];

const DECLARATION_FIELDS: Array<keyof DeclarationDetails> = [
  "declarantName",
  "consigneeName",
  "manifestReference",
  "regimeType",
  "customsOfficeCode",
];

const SHIPMENT_FIELDS: Array<keyof DeclarationDetails> = [
  "blAwb",
  "transportMode",
  "exportCountryName",
  "borderOfficeCode",
  "placeOfLoadingName",
  "deliveryTermCode",
];

const PRIMARY_FIELDS = new Set([...DECLARATION_FIELDS, ...SHIPMENT_FIELDS]);

interface Props {
  initialData: DeclarationDetails | null;
  onNext: (data: DeclarationDetails) => void;
}

export function DeclarationDetailsStep({ initialData, onNext }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    reset,
  } = useForm<DeclarationDetails>({
    resolver: zodResolver(declarationDetailsSchema),
    defaultValues: initialData ?? {},
  });
  const [saved, setSaved] = useState(false);

  const renderField = (fieldName: keyof DeclarationDetails) => {
    const field = FIELDS.find((candidate) => candidate.name === fieldName);
    if (!field) return null;
    return (
      <div key={field.name} className={field.wide ? "sm:col-span-2" : ""}>
        <label htmlFor={field.name} className="mb-1.5 block text-sm font-semibold text-text">
          {field.label} {field.required && <span className="text-error">*</span>}
        </label>
        <input
          id={field.name}
          {...register(field.name)}
          placeholder={field.placeholder}
          className="min-h-[46px] w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
        />
        {errors[field.name] && <p className="mt-1 text-xs text-error">{errors[field.name]?.message}</p>}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold text-text">Start a declaration</h1>
          <p className="mt-2 text-text-muted">Enter declaration and shipment details before uploading an invoice.</p>
        </div>
        <button
          type="button"
          onClick={() => reset(DEMO_DATA)}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/5"
        >
          <FileText className="h-4 w-4" /> Load demo
        </button>
      </div>

      <form onSubmit={handleSubmit(onNext)} className="space-y-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr_290px]">
          <section aria-labelledby="declaration-heading">
            <div className="mb-5 flex items-center gap-2 border-b border-border pb-3">
              <UserRound className="h-5 w-5 text-accent" />
              <h2 id="declaration-heading" style={{ fontSize: "1.125rem" }} className="font-bold text-text">Declaration details</h2>
            </div>
            <div className="grid gap-4">{DECLARATION_FIELDS.map(renderField)}</div>
          </section>

          <section aria-labelledby="shipment-heading">
            <div className="mb-5 flex items-center gap-2 border-b border-border pb-3">
              <Ship className="h-5 w-5 text-accent" />
              <h2 id="shipment-heading" style={{ fontSize: "1.125rem" }} className="font-bold text-text">Shipment details</h2>
            </div>
            <div className="grid gap-4">{SHIPMENT_FIELDS.map(renderField)}</div>
          </section>

          <aside className="rounded-xl border border-accent/20 bg-success/5 p-5">
            <h2 style={{ fontSize: "1.125rem" }} className="font-bold text-accent-dark">What you&apos;ll need</h2>
            <div className="mt-5 space-y-5 text-sm">
              <div className="flex gap-3">
                <FileText className="mt-0.5 h-5 w-5 flex-none text-accent" />
                <div><p className="font-semibold text-text">Invoice file</p><p className="mt-1 text-text-muted">A clear PDF or image, up to 10 MB.</p></div>
              </div>
              <div className="border-t border-accent/15 pt-5 flex gap-3">
                <Ship className="mt-0.5 h-5 w-5 flex-none text-accent" />
                <div><p className="font-semibold text-text">Shipment reference</p><p className="mt-1 text-text-muted">Manifest and bill of lading or AWB.</p></div>
              </div>
              <div className="border-t border-accent/15 pt-5 flex gap-3">
                <PackageCheck className="mt-0.5 h-5 w-5 flex-none text-accent" />
                <div><p className="font-semibold text-text">Consignee details</p><p className="mt-1 text-text-muted">Name, TRN and address for review.</p></div>
              </div>
            </div>
          </aside>
        </div>

        <details className="rounded-xl border border-border bg-surface">
          <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-text hover:bg-surface-hover">
            Additional customs fields
            <span className="ml-2 font-normal text-text-muted">Optional now; confirm before export</span>
          </summary>
          <div className="grid gap-4 border-t border-border p-5 sm:grid-cols-2 lg:grid-cols-3">
            {FIELDS.filter((field) => !PRIMARY_FIELDS.has(field.name)).map((field) => renderField(field.name))}
          </div>
        </details>

        <div className="sticky bottom-0 -mx-4 flex flex-col-reverse gap-3 border-t border-border bg-white/95 px-4 py-4 backdrop-blur sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={() => {
              window.localStorage.setItem("clearance-declaration-draft", JSON.stringify(getValues()));
              setSaved(true);
            }}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-border px-5 py-3 text-sm font-semibold text-text hover:bg-surface-hover"
          >
            <Save className="h-4 w-4" /> {saved ? "Draft saved" : "Save draft"}
          </button>
          <button type="submit" className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-accent px-8 py-3 font-semibold text-white hover:bg-accent-light">
            Continue to invoice →
          </button>
        </div>
      </form>
    </div>
  );
}
