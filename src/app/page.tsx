import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileSearch,
  FileText,
  SearchCheck,
  ShieldCheck,
} from "lucide-react";

const WORKFLOW = [
  {
    icon: FileText,
    title: "Enter shipment details",
    description: "Add the consignee, manifest, BL or AWB, regime and office information the system must not guess.",
  },
  {
    icon: FileSearch,
    title: "Upload the invoice",
    description: "Extract the exporter, values, package counts and individual invoice lines from a PDF or image.",
  },
  {
    icon: SearchCheck,
    title: "Review tariff codes",
    description: "Confirm every line and match it to an official 10-digit Jamaican tariff before export.",
  },
  {
    icon: ShieldCheck,
    title: "Validate and export",
    description: "Resolve data issues, preview the declaration XML and download it for controlled ASYCUDA import testing.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-24">
          <div>
            <h1 className="max-w-xl text-4xl font-bold leading-tight text-text sm:text-5xl">
              Turn commercial invoices into reviewed declaration XML.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-text-muted">
              A guided workspace for Jamaican customs brokers: extract invoice data, verify HS codes, catch missing details and prepare XML for import testing.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/invoice-to-xml/new"
                className="inline-flex min-h-[52px] items-center justify-center rounded-lg bg-accent px-7 py-3 font-semibold text-white transition hover:bg-accent-light"
              >
                Start a declaration <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/invoice-to-xml"
                className="inline-flex min-h-[52px] items-center justify-center rounded-lg border border-border bg-white px-7 py-3 font-semibold text-text transition hover:bg-surface-hover"
              >
                See how it works
              </Link>
            </div>
            <p className="mt-5 text-sm text-text-muted">
              PDF and image invoices · Official Jamaican tariff verification · Google sign-in
            </p>
          </div>

          <div className="border border-border bg-surface p-5 shadow-[0_18px_50px_rgba(16,38,61,0.08)] sm:p-7">
            <div className="flex items-center justify-between border-b border-border pb-5">
              <div>
                <p className="text-sm font-semibold text-text">Declaration readiness</p>
                <p className="mt-1 text-xs text-text-muted">Invoice INV-PSJ-2026-0418</p>
              </div>
              <span className="text-sm font-semibold text-success">8 of 9 items verified</span>
            </div>
            <div className="mt-5 space-y-3">
              {[
                { label: "Shipment details", status: "Complete", complete: true },
                { label: "Invoice values", status: "Totals match", complete: true },
                { label: "Official tariff codes", status: "1 item needs review", complete: false },
                { label: "XML validation", status: "Waiting for tariff review", complete: false },
              ].map(({ label, status, complete }) => (
                <div key={label} className="flex items-center justify-between border-b border-border-light py-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className={`h-5 w-5 ${complete ? "text-success" : "text-text-muted/40"}`} />
                    <span className="font-medium text-text">{label}</span>
                  </div>
                  <span className={`text-sm ${complete ? "text-success" : "text-text-muted"}`}>{status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-muted py-16" aria-labelledby="workflow-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 id="workflow-title" className="text-3xl font-bold text-text">One clear workflow</h2>
            <p className="mt-3 text-text-muted">The app keeps broker-entered details, extracted invoice data and tariff verification in one reviewable declaration.</p>
          </div>
          <ol className="mt-10 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-4">
            {WORKFLOW.map((step, index) => (
              <li key={step.title} className="bg-white p-6">
                <div className="flex items-center justify-between">
                  <step.icon className="h-6 w-6 text-accent" />
                  <span className="text-sm font-semibold text-text-muted">0{index + 1}</span>
                </div>
                <h3 className="mt-8 text-lg font-bold text-text">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-text-muted">{step.description}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 rounded-lg border border-warning/25 bg-warning/5 px-5 py-4 text-sm leading-6 text-text-muted">
            XML output remains for controlled import testing until compatibility is confirmed in a live Jamaica Customs ASYCUDA declaration.
          </div>
        </div>
      </section>
    </>
  );
}
