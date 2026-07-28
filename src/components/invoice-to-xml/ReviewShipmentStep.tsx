"use client";

import { useState } from "react";
import { AlertTriangle, Info } from "lucide-react";
import type { DeclarationDraft } from "@/lib/asycuda/declaration-draft";

interface Props {
  draft: DeclarationDraft;
  onContinue: (draft: DeclarationDraft) => void;
  onBack: () => void;
}

function EditableField({ label, value, onChange, type = "text", wide = false }: {
  label: string;
  value: string | number | null;
  onChange: (value: string) => void;
  type?: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <label className="mb-1 block text-xs font-medium text-text-muted">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
    </div>
  );
}

export function ReviewShipmentStep({ draft, onContinue, onBack }: Props) {
  const [edited, setEdited] = useState<DeclarationDraft>(() => structuredClone(draft));

  const setText = <S extends "seller" | "consignee" | "responsibleParty" | "shipment" | "invoice">(
    section: S,
    field: keyof DeclarationDraft[S],
    value: string,
  ) => {
    setEdited((current) => {
      const next = structuredClone(current);
      const target = next[section] as Record<string, unknown>;
      if (section === "shipment" && field === "grossWeightKg") {
        target[String(field)] = value === "" ? null : Number(value);
      } else {
        target[String(field)] = value.trim() === "" ? null : value;
      }
      return next;
    });
  };

  const confidence = edited.warnings.length === 0 ? "High" : edited.warnings.length <= 3 ? "Medium" : "Low";

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text">Review Shipment and Invoice</h2>
          <p className="mt-2 text-text-muted">Correct every extracted value before reviewing the line items.</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
          confidence === "High" ? "bg-success/10 text-success" :
          confidence === "Medium" ? "bg-warning/10 text-warning" : "bg-error/10 text-error"
        }`}>
          {confidence} confidence · {edited.warnings.length} warning{edited.warnings.length === 1 ? "" : "s"}
        </span>
      </div>

      {edited.warnings.length > 0 && (
        <div className="mb-6 rounded-xl border border-warning/30 bg-warning/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-warning">
            <AlertTriangle className="h-4 w-4" /> Extraction Warnings
          </div>
          <ul className="space-y-1">
            {edited.warnings.map((warning, index) => (
              <li key={`${warning}-${index}`} className="flex gap-2 text-sm text-text-muted">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning/60" /> {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      <fieldset className="mb-6 rounded-xl border border-border bg-surface p-6">
        <legend className="px-2 text-sm font-semibold text-accent">Seller / Exporter</legend>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <EditableField label="Exporter Name" value={edited.seller.name} onChange={(v) => setText("seller", "name", v)} wide />
          <EditableField label="Exporter Address" value={edited.seller.address} onChange={(v) => setText("seller", "address", v)} wide />
          <EditableField label="Exporter Country Code" value={edited.seller.countryCode} onChange={(v) => setText("seller", "countryCode", v.toUpperCase())} />
          <EditableField label="Exporter Code" value={edited.seller.exporterCode} onChange={(v) => setText("seller", "exporterCode", v)} />
        </div>
      </fieldset>

      <fieldset className="mb-6 rounded-xl border border-border bg-surface p-6">
        <legend className="px-2 text-sm font-semibold text-accent">Consignee / Importer</legend>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <EditableField label="Consignee Name" value={edited.consignee.name} onChange={(v) => setText("consignee", "name", v)} wide />
          <EditableField label="Consignee Address" value={edited.consignee.address} onChange={(v) => setText("consignee", "address", v)} wide />
          <EditableField label="Country Code" value={edited.consignee.countryCode} onChange={(v) => setText("consignee", "countryCode", v.toUpperCase())} />
          <EditableField label="TRN / Code" value={edited.consignee.trn} onChange={(v) => setText("consignee", "trn", v)} />
        </div>
      </fieldset>

      <fieldset className="mb-6 rounded-xl border border-border bg-surface p-6">
        <legend className="px-2 text-sm font-semibold text-accent">Person / Entity Responsible</legend>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <EditableField label="Name" value={edited.responsibleParty.name} onChange={(v) => setText("responsibleParty", "name", v)} />
          <EditableField label="Code" value={edited.responsibleParty.code} onChange={(v) => setText("responsibleParty", "code", v)} />
        </div>
      </fieldset>

      <fieldset className="mb-6 rounded-xl border border-border bg-surface p-6">
        <legend className="px-2 text-sm font-semibold text-accent">Shipment Details</legend>
        <div className="mt-2 grid gap-4 sm:grid-cols-3">
          <EditableField label="Container Number" value={edited.shipment.containerNumber} onChange={(v) => setText("shipment", "containerNumber", v.toUpperCase())} />
          <EditableField label="Booking Number" value={edited.shipment.bookingNumber} onChange={(v) => setText("shipment", "bookingNumber", v)} />
          <EditableField label="Carrier" value={edited.shipment.carrier} onChange={(v) => setText("shipment", "carrier", v)} />
          <EditableField label="Vessel" value={edited.shipment.vessel} onChange={(v) => setText("shipment", "vessel", v)} />
          <EditableField label="Seal Number" value={edited.shipment.sealNumber} onChange={(v) => setText("shipment", "sealNumber", v)} />
          <EditableField label="BL / AWB" value={edited.shipment.billOfLading} onChange={(v) => setText("shipment", "billOfLading", v)} />
          <EditableField label="Manifest Reference" value={edited.shipment.manifestReference} onChange={(v) => setText("shipment", "manifestReference", v)} />
          <EditableField label="Transport Mode" value={edited.shipment.transportMode} onChange={(v) => setText("shipment", "transportMode", v)} />
          <EditableField label="Gross Weight (kg)" value={edited.shipment.grossWeightKg} onChange={(v) => setText("shipment", "grossWeightKg", v)} type="number" />
          <EditableField label="Printed Delivery Term" value={edited.shipment.deliveryTermRaw} onChange={(v) => setText("shipment", "deliveryTermRaw", v)} />
          <EditableField label="Confirmed ASYCUDA Delivery-Term Code" value={edited.shipment.deliveryTermCode} onChange={(v) => setText("shipment", "deliveryTermCode", v.toUpperCase())} />
          <EditableField label="Location of Goods" value={edited.shipment.locationOfGoods} onChange={(v) => setText("shipment", "locationOfGoods", v)} />
          <EditableField label="Border Office Code" value={edited.shipment.borderOfficeCode} onChange={(v) => setText("shipment", "borderOfficeCode", v)} />
          <EditableField label="Border Office Name" value={edited.shipment.borderOfficeName} onChange={(v) => setText("shipment", "borderOfficeName", v)} />
          <EditableField label="Place of Loading Code" value={edited.shipment.placeOfLoadingCode} onChange={(v) => setText("shipment", "placeOfLoadingCode", v)} />
          <EditableField label="Place of Loading Name" value={edited.shipment.placeOfLoadingName} onChange={(v) => setText("shipment", "placeOfLoadingName", v)} wide />
        </div>
      </fieldset>

      <fieldset className="mb-6 rounded-xl border border-border bg-surface p-6">
        <legend className="px-2 text-sm font-semibold text-accent">Invoice Values</legend>
        <div className="mt-2 grid gap-4 sm:grid-cols-3">
          <EditableField label="Invoice Number" value={edited.invoice.number} onChange={(v) => setText("invoice", "number", v)} />
          <EditableField label="Invoice Date" value={edited.invoice.date} onChange={(v) => setText("invoice", "date", v)} />
          <EditableField label="Currency" value={edited.invoice.currency} onChange={(v) => setText("invoice", "currency", v.toUpperCase())} />
          <EditableField label="Exchange Rate" value={edited.invoice.exchangeRate} onChange={(v) => setText("invoice", "exchangeRate", v)} type="number" />
          <EditableField label="Merchandise Value" value={edited.invoice.merchandiseValue} onChange={(v) => setText("invoice", "merchandiseValue", v)} type="number" />
          <EditableField label="Insurance" value={edited.invoice.insuranceValue} onChange={(v) => setText("invoice", "insuranceValue", v)} type="number" />
          <EditableField label="Freight" value={edited.invoice.freightValue} onChange={(v) => setText("invoice", "freightValue", v)} type="number" />
          <EditableField label="Total Value" value={edited.invoice.totalValue} onChange={(v) => setText("invoice", "totalValue", v)} type="number" />
        </div>
      </fieldset>

      <div className="flex justify-between border-t border-border pt-4">
        <button onClick={onBack} className="min-h-[44px] text-sm font-medium text-text-muted hover:text-text">← Back to Upload</button>
        <button onClick={() => onContinue(edited)} className="inline-flex min-h-[48px] items-center rounded-xl bg-accent px-8 py-3 font-semibold text-white hover:bg-accent-light">
          Continue to Line Items
        </button>
      </div>
    </div>
  );
}
