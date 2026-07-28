import Link from "next/link";
import { FileText, Upload, Eye, Download, Shield, ArrowRight, AlertTriangle } from "lucide-react";

const STEPS = [
  {
    icon: FileText,
    title: "Enter Declaration Details",
    description: "Fill in declarant, consignee, manifest reference, BL/AWB, regime type, and customs office information.",
  },
  {
    icon: Upload,
    title: "Upload Commercial Invoice",
    description: "Upload a PDF or image of your commercial invoice. AI will extract shipment details and line items automatically.",
  },
  {
    icon: Eye,
    title: "Review & Correct",
    description: "Review all extracted information. Edit, add, or remove invoice items. Confirm HS codes before export.",
  },
  {
    icon: Download,
    title: "Download ASYCUDA XML",
    description: "Get your ASYCUDA-compliant XML file. Preview it first, validate against customs rules, then download.",
  },
];

export default function InvoiceToXmlLanding() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
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
            <p className="text-sm font-semibold tracking-normal text-accent-light">
              Invoice to ASYCUDA XML
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
              Turn commercial invoices into ASYCUDA XML — without the manual grind.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/75 sm:text-xl">
              Upload a scanned invoice, let AI extract the details, review and
              correct everything, then download customs-ready XML. Built for
              declarants who need speed without losing confidence.
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
              {["PDF • PNG • JPG • WEBP", "AI-Powered Extraction", "Editable Review"].map((item) => (
                <span key={item} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24" aria-labelledby="steps-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="steps-heading" className="text-center text-3xl font-bold text-text sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-center text-lg text-text-muted">
            Four steps from invoice to customs-ready XML.
          </p>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <div key={step.title} className="rounded-2xl border border-border bg-surface p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                  <step.icon aria-hidden="true" className="h-6 w-6 text-accent" />
                </div>
                <div className="mt-4">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-3 text-base font-semibold text-text">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info cards */}
      <section className="py-16 sm:py-24 bg-surface" aria-label="Important notes">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background p-6">
              <Shield aria-hidden="true" className="h-8 w-8 text-accent" />
              <h3 className="mt-4 text-lg font-semibold text-text">Privacy First</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                Uploaded invoices are processed temporarily and discarded after extraction. Nothing is stored permanently.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background p-6">
              <FileText aria-hidden="true" className="h-8 w-8 text-accent" />
              <h3 className="mt-4 text-lg font-semibold text-text">Supported Formats</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                PDF, PNG, JPG, JPEG, and WEBP files up to 10 MB. Maximum 10 pages for PDFs in this MVP.
              </p>
            </div>

            <div className="rounded-2xl border border-warning/30 bg-warning/5 p-6">
              <AlertTriangle aria-hidden="true" className="h-8 w-8 text-warning" />
              <h3 className="mt-4 text-lg font-semibold text-text">Test Mode</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                This is an MVP. Tax calculations are not included. AI extraction requires a Gemini API key.
                Without it, use the PriceSmart demo to test the full workflow.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
