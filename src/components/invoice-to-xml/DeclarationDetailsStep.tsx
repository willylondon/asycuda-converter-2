"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
    defaultValues: initialData ?? {},
  });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text">Declaration Details</h2>
        <p className="mt-2 text-text-muted">Enter the customs information that must not be guessed by AI.</p>
        <button
          type="button"
          onClick={() => reset(DEMO_DATA)}
          className="mt-3 inline-flex min-h-[44px] items-center rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-accent hover:bg-accent/5"
        >
          Load Demo Data
        </button>
      </div>

      <form onSubmit={handleSubmit(onNext)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <div key={field.name} className={field.wide ? "sm:col-span-2" : ""}>
              <label htmlFor={field.name} className="mb-1.5 block text-sm font-medium text-text">
                {field.label} {field.required && <span className="text-error">*</span>}
              </label>
              <input
                id={field.name}
                {...register(field.name)}
                placeholder={field.placeholder}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text placeholder:text-text-muted/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              {errors[field.name] && <p className="mt-1 text-xs text-error">{errors[field.name]?.message}</p>}
            </div>
          ))}
        </div>

        <div className="flex justify-end border-t border-border pt-4">
          <button type="submit" className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-accent px-8 py-3 font-semibold text-white hover:bg-accent-light">
            Continue to Upload
          </button>
        </div>
      </form>
    </div>
  );
}
