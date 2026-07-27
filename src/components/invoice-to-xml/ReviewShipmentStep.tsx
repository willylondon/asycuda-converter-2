"use client";

import { useState } from "react";
import { AlertTriangle, Info } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────

interface ShipmentData {
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
  warnings: string[];
}

// ─── Props ─────────────────────────────────────────────────────────

interface Props {
  data: ShipmentData;
  onUpdate: (data: ShipmentData) => void;
  onNext: () => void;
  onBack: () => void;
}

// ─── Helpers ───────────────────────────────────────────────────────

function EditableField({ label, value, onChange, type = "text", className = "" }: {
  label: string; value: string | number | null; onChange: (v: string) => void; type?: string; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-text-muted mb-1">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
      />
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────

export function ReviewShipmentStep({ data, onUpdate, onNext, onBack }: Props) {
  const [edited, setEdited] = useState(structuredClone(data));

  const update = (section: string, field: string, value: string) => {
    const next = structuredClone(edited);
    if (section === "seller" || section === "consignee") {
      (next[section] as Record<string, unknown>)[field] = value || null;
    } else if (section === "shipment") {
      (next.shipment as Record<string, unknown>)[field] = field === "grossWeightKg" ? (value ? parseFloat(value) : null) : (value || null);
    } else if (section === "invoice") {
      (next.invoice as Record<string, unknown>)[field] = ["merchandiseValue", "insuranceValue", "freightValue", "totalValue"].includes(field)
        ? (value ? parseFloat(value) : null)
        : (value || null);
    }
    setEdited(next);
  };

  const handleContinue = () => {
    onUpdate(edited);
    onNext();
  };

  const confidence = data.warnings.length === 0 ? "High" : data.warnings.length <= 3 ? "Medium" : "Low";

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-text">Review Extracted Data</h2>
          <p className="mt-2 text-text-muted">Verify and correct shipment header information.</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
          confidence === "High" ? "bg-success/10 text-success" :
          confidence === "Medium" ? "bg-warning/10 text-warning" : "bg-error/10 text-error"
        }`}>
          {confidence} confidence • {data.warnings.length} warning{data.warnings.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Warnings */}
      {data.warnings.length > 0 && (
        <div className="mb-6 rounded-xl border border-warning/30 bg-warning/5 p-4">
          <div className="flex items-center gap-2 text-warning font-semibold text-sm mb-2">
            <AlertTriangle className="h-4 w-4" />
            Extraction Warnings
          </div>
          <ul className="space-y-1">
            {data.warnings.map((w, i) => (
              <li key={i} className="text-sm text-text-muted flex gap-2">
                <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-warning/60" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Seller */}
      <fieldset className="mb-6 rounded-xl border border-border bg-surface p-6">
        <legend className="text-sm font-semibold text-accent px-2">Seller / Exporter</legend>
        <div className="grid gap-4 sm:grid-cols-2 mt-2">
          <EditableField label="Name" value={edited.seller.name} onChange={(v) => update("seller", "name", v)} className="sm:col-span-2" />
          <EditableField label="Address" value={edited.seller.address} onChange={(v) => update("seller", "address", v)} className="sm:col-span-2" />
          <EditableField label="Country Code" value={edited.seller.countryCode} onChange={(v) => update("seller", "countryCode", v)} />
        </div>
      </fieldset>

      {/* Consignee */}
      <fieldset className="mb-6 rounded-xl border border-border bg-surface p-6">
        <legend className="text-sm font-semibold text-accent px-2">Consignee / Importer</legend>
        <div className="grid gap-4 sm:grid-cols-2 mt-2">
          <EditableField label="Name" value={edited.consignee.name} onChange={(v) => update("consignee", "name", v)} className="sm:col-span-2" />
          <EditableField label="Address" value={edited.consignee.address} onChange={(v) => update("consignee", "address", v)} className="sm:col-span-2" />
          <EditableField label="Country Code" value={edited.consignee.countryCode} onChange={(v) => update("consignee", "countryCode", v)} />
          <EditableField label="TRN" value={edited.consignee.trn} onChange={(v) => update("consignee", "trn", v)} />
        </div>
      </fieldset>

      {/* Shipment */}
      <fieldset className="mb-6 rounded-xl border border-border bg-surface p-6">
        <legend className="text-sm font-semibold text-accent px-2">Shipment Details</legend>
        <div className="grid gap-4 sm:grid-cols-3 mt-2">
          <EditableField label="Container Number" value={edited.shipment.containerNumber} onChange={(v) => update("shipment", "containerNumber", v)} />
          <EditableField label="Booking Number" value={edited.shipment.bookingNumber} onChange={(v) => update("shipment", "bookingNumber", v)} />
          <EditableField label="Carrier" value={edited.shipment.carrier} onChange={(v) => update("shipment", "carrier", v)} />
          <EditableField label="Vessel" value={edited.shipment.vessel} onChange={(v) => update("shipment", "vessel", v)} />
          <EditableField label="Seal Number" value={edited.shipment.sealNumber} onChange={(v) => update("shipment", "sealNumber", v)} />
          <EditableField label="Sail Date" value={edited.shipment.sailDate} onChange={(v) => update("shipment", "sailDate", v)} />
          <EditableField label="ETA" value={edited.shipment.etaDate} onChange={(v) => update("shipment", "etaDate", v)} />
          <EditableField label="Bill of Lading" value={edited.shipment.billOfLading} onChange={(v) => update("shipment", "billOfLading", v)} />
          <EditableField label="Manifest Ref" value={edited.shipment.manifestReference} onChange={(v) => update("shipment", "manifestReference", v)} />
          <EditableField label="Incoterm" value={edited.shipment.incotermRaw} onChange={(v) => update("shipment", "incotermRaw", v)} />
          <EditableField label="Gross Weight (kg)" value={edited.shipment.grossWeightKg} onChange={(v) => update("shipment", "grossWeightKg", v)} type="number" />
        </div>
      </fieldset>

      {/* Invoice */}
      <fieldset className="mb-6 rounded-xl border border-border bg-surface p-6">
        <legend className="text-sm font-semibold text-accent px-2">Invoice Totals</legend>
        <div className="grid gap-4 sm:grid-cols-3 mt-2">
          <EditableField label="Invoice Number" value={edited.invoice.invoiceNumber} onChange={(v) => update("invoice", "invoiceNumber", v)} />
          <EditableField label="Invoice Date" value={edited.invoice.invoiceDate} onChange={(v) => update("invoice", "invoiceDate", v)} />
          <EditableField label="Currency" value={edited.invoice.currency} onChange={(v) => update("invoice", "currency", v)} />
          <EditableField label="Merchandise Value" value={edited.invoice.merchandiseValue} onChange={(v) => update("invoice", "merchandiseValue", v)} type="number" />
          <EditableField label="Insurance" value={edited.invoice.insuranceValue} onChange={(v) => update("invoice", "insuranceValue", v)} type="number" />
          <EditableField label="Freight" value={edited.invoice.freightValue} onChange={(v) => update("invoice", "freightValue", v)} type="number" />
          <EditableField label="Total Value" value={edited.invoice.totalValue} onChange={(v) => update("invoice", "totalValue", v)} type="number" />
        </div>
      </fieldset>

      {/* Packages */}
      <fieldset className="mb-6 rounded-xl border border-border bg-surface p-6">
        <legend className="text-sm font-semibold text-accent px-2">Packages</legend>
        <div className="flex flex-wrap gap-4 mt-2">
          {edited.packages.map((pkg, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2">
              <span className="text-sm font-semibold text-text">{pkg.quantity ?? "?"} ×</span>
              <input
                value={pkg.packageType ?? ""}
                onChange={(e) => {
                  const next = structuredClone(edited);
                  next.packages[i].packageType = e.target.value || null;
                  setEdited(next);
                }}
                className="w-16 rounded border border-border bg-background px-2 py-1 text-sm text-text text-center focus:border-accent focus:outline-none"
                placeholder="Type"
              />
              <input
                type="number"
                value={pkg.quantity ?? ""}
                onChange={(e) => {
                  const next = structuredClone(edited);
                  next.packages[i].quantity = e.target.value ? parseInt(e.target.value) : null;
                  setEdited(next);
                }}
                className="w-16 rounded border border-border bg-background px-2 py-1 text-sm text-text text-center focus:border-accent focus:outline-none"
                placeholder="Qty"
              />
            </div>
          ))}
        </div>
      </fieldset>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-border">
        <button onClick={onBack} className="text-sm font-medium text-text-muted hover:text-text transition-colors">
          ← Back
        </button>
        <button
          onClick={handleContinue}
          className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-accent px-8 py-3 text-base font-semibold text-white hover:bg-accent-light transition-colors"
        >
          Continue to Line Items
        </button>
      </div>
    </div>
  );
}
