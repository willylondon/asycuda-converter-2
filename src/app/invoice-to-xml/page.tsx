import Link from "next/link";
import { AlertTriangle, ArrowRight, Download, Eye, FileText, Shield, Upload } from "lucide-react";

const STEPS = [
  {
    icon: FileText,
    title: "Enter Declaration Details",
    description: "Enter declarant, consignee, manifest, BL/AWB, procedures and customs-office information that AI must not guess.",
  },
  {
    icon: Upload,
    title: "Upload Commercial Invoice",
    description: "Upload a PDF or image. Gemini Flash extracts shipment details, packages and invoice line items, with OpenRouter as fallback.",
  },
  {
    icon: Eye,
    title: "Review and Confirm",
    description: "Correct shipment data, keep package quantities separate from product quantities, and confirm every HS-code split.",
  },
  {
    icon: Download,
    title: "Download Test XML",
    description: "Run deterministic validation, preview the generated ASYCUDA-style XML and download it for controlled import verification.",
  },
];

export default function InvoiceToXmlLanding() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-primary text-white">
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(7,21,36,0.97), rgba(11,31,51,0.94)), radial-gradient(circle at top left, rgba(14,165,196,0.22), transparent 30%), radial-gradient(circle at 82% 10%, rgba(201,134,20,0.16), transparent 25%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold text-accent-light">Invoice to ASYCUDA XML</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
              Extract, review and map commercial invoices into test ASYCUDA XML.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/75 sm:text-xl">
              A Receipt-to-Sheets-style workflow for declaration review: upload the invoice, correct every field, validate the data and download XML for import testing.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/invoice-to-xml/new"
                className="inline-flex min-h-[54px] items-center justify-center rounded-xl bg-accent px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-accent-light"
              >
                Start Declaration
                <ArrowRight aria-hidden="true" className="ml-2 h-5 w-5" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {["PDF • PNG • JPG • WEBP", "Gemini + OpenRouter", "Editable Review"].map((item) => (
                <span key={item} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24" aria-labelledby="steps-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="steps-heading" className="text-center text-3xl font-bold text-text sm:text-4xl">How It Works</h2>
          <p className="mt-4 text-center text-lg text-text-muted">Four stages from invoice to test XML.</p>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-border bg-surface p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                  <step.icon aria-hidden="true" className="h-6 w-6 text-accent" />
                </div>
                <div className="mt-4">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{index + 1}</span>
                </div>
                <h3 className="mt-3 text-base font-semibold text-text">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-16 sm:py-24" aria-label="Important notes">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background p-6">
              <Shield aria-hidden="true" className="h-8 w-8 text-accent" />
              <h3 className="mt-4 text-lg font-semibold text-text">Privacy First</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">Uploaded invoices are processed temporarily and are not intentionally stored by this workflow.</p>
            </div>

            <div className="rounded-2xl border border-border bg-background p-6">
              <FileText aria-hidden="true" className="h-8 w-8 text-accent" />
              <h3 className="mt-4 text-lg font-semibold text-text">Supported Formats</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">PDF, PNG, JPG, JPEG and WEBP files up to 10 MB. The MVP limits PDFs to 10 pages.</p>
            </div>

            <div className="rounded-2xl border border-warning/30 bg-warning/5 p-6">
              <AlertTriangle aria-hidden="true" className="h-8 w-8 text-warning" />
              <h3 className="mt-4 text-lg font-semibold text-text">Import Verification Required</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                Tax calculations are not included. The XML follows the supplied sample structure, but ASYCUDA import compatibility must be confirmed in a controlled test before production use.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
