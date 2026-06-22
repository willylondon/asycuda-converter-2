import Link from "next/link";
import {
  FileSpreadsheet,
  Upload,
  CheckCircle,
  Download,
  Shield,
  Zap,
  ArrowRight,
} from "lucide-react";

const STEPS = [
  {
    icon: Upload,
    title: "Upload Excel File",
    description:
      "Drag and drop your delivery manifest Excel file. We support .xlsx and .xls formats up to 10MB.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: CheckCircle,
    title: "Validate Structure",
    description:
      "Our engine checks every column, row, and data type against ASYCUDA requirements. Fix issues before conversion.",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    icon: Download,
    title: "Download XML",
    description:
      "Get your ASYCUDA-compliant XML file instantly. Ready for direct submission to customs.",
    color: "text-success",
    bg: "bg-success/10",
  },
];

const BENEFITS = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Convert manifests in under 60 seconds. No more manual data entry or XML formatting.",
  },
  {
    icon: Shield,
    title: "Customs Compliant",
    description: "Output XML follows ASYCUDA World specifications. Built-in validation catches issues before submission, reducing customs rejections.",
  },
  {
    icon: FileSpreadsheet,
    title: "Excel Native",
    description: "Works with your existing Excel templates. No new software to learn.",
  },
];

const FAQ_ITEMS = [
  {
    q: "What is ASYCUDA?",
    a: "ASYCUDA (Automated System for Customs Data) is a computerized customs management system used by customs administrations worldwide to process trade data and declarations.",
  },
  {
    q: "What file formats do you support?",
    a: "We support .xlsx and .xls Excel files. Your file must include the required columns: Container Number, Bill of Lading, Consignee, Description, Weight, and other customs-relevant fields.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. Files are processed in memory and deleted immediately after conversion. We never store your manifests or XML output. All data is transferred over HTTPS.",
  },
  {
    q: "How much does it cost?",
    a: "We offer pay-per-conversion pricing. See our Pricing page for details. No subscriptions, no commitments — pay only when you convert.",
  },
  {
    q: "Can I test before paying?",
    a: "Absolutely. Download our sample Excel file, run it through the converter, and see the XML output before you commit to anything.",
  },
];

export default function HomePage() {
  return (
    <>
      <section
        className="relative overflow-hidden bg-primary text-white"
        aria-labelledby="hero-heading"
      >
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(7, 21, 36, 0.97), rgba(11, 31, 51, 0.94)), radial-gradient(circle at top left, rgba(14, 165, 196, 0.22), transparent 30%), radial-gradient(circle at 82% 10%, rgba(201, 134, 20, 0.16), transparent 25%)",
          }}
        />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold tracking-normal text-accent-light">
              Built for customs workflows
            </p>
            <h1
              id="hero-heading"
              className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-balance sm:text-5xl lg:text-6xl"
            >
              Convert Excel manifests into ASYCUDA XML without the manual drag.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75 sm:text-xl">
              Validate, convert, and download customs-ready XML in a single
              flow. Your file stays in memory, checks happen before export, and
              the output is ready fast enough to keep the day moving.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/converter"
                className="inline-flex min-h-[54px] items-center justify-center rounded-xl bg-accent px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-accent-light"
              >
                Start Converting
                <ArrowRight aria-hidden="true" className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/samples/sample-manifest.xlsx"
                className="inline-flex min-h-[54px] items-center justify-center rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                <FileSpreadsheet aria-hidden="true" className="mr-2 h-5 w-5" />
                Download Sample File
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap gap-3">
              {[
                "In-memory processing",
                "WCAG 2.2 AA",
                "No account required",
              ].map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:pt-6">
            <div className="rounded-[24px] border border-white/10 bg-primary-dark/92 p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-accent-light">
                    Validation cockpit
                  </p>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/70">
                    Your manifest is checked before conversion so issues show up
                    while they are still easy to fix.
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                  Under 60 seconds
                </span>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      manifest-delivery.xlsx
                    </p>
                    <p className="mt-1 text-xs text-white/60">
                      XLSX upload, 8.4 MB
                    </p>
                  </div>
                  <div className="rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success-light">
                    Ready to validate
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    {
                      title: "Required columns",
                      detail: "Container Number, Bill of Lading, Consignee, and other customs fields.",
                    },
                    {
                      title: "Type checks",
                      detail: "Weights, package counts, ports, and date formats are verified.",
                    },
                    {
                      title: "Output",
                      detail: "ASYCUDA-compliant XML is generated only after validation passes.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <CheckCircle aria-hidden="true" className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-light" />
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-white/70">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/70">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                  <Shield aria-hidden="true" className="h-4 w-4 text-accent-light" />
                  Files stay in memory only
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                  <Download aria-hidden="true" className="h-4 w-4 text-accent-light" />
                  Direct XML download
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="-mt-6 py-8 sm:py-10" aria-label="Trust signals">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid overflow-hidden rounded-[24px] border border-border bg-surface md:grid-cols-3">
            {[
              {
                title: "In-memory processing",
                description:
                  "Excel files are checked and converted without being written to disk.",
              },
              {
                title: "Instant validation",
                description:
                  "Structure, types, and customs requirements are surfaced before XML generation.",
              },
              {
                title: "Customs-ready XML",
                description:
                  "The output follows ASYCUDA expectations so users can move toward submission quickly.",
              },
            ].map((item, index) => (
              <div
                key={item.title}
                className={`p-6 sm:p-7 ${
                  index < 2 ? "border-b border-border md:border-b-0 md:border-r" : ""
                } border-border`}
              >
                <p className="text-base font-semibold text-text">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="py-16 sm:py-24 lg:py-28"
        aria-labelledby="how-it-works-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="how-it-works-heading"
              className="text-3xl font-bold text-text sm:text-4xl"
            >
              How It Works
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-text-muted">
              A short, linear path from spreadsheet to customs-ready XML.
            </p>
          </div>

          <div className="mt-14 grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
            <div className="space-y-5">
              {STEPS.map((step, i) => (
                <div
                  key={step.title}
                  className="flex gap-4 rounded-[20px] border border-border bg-surface px-5 py-5 sm:px-6"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-surface-muted">
                    <step.icon aria-hidden="true" className={`h-6 w-6 ${step.color}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      <h3 className="text-lg font-semibold text-text">
                        {step.title}
                      </h3>
                    </div>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-muted">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[24px] border border-border bg-surface p-6 sm:p-8">
              <p className="text-sm font-semibold text-accent">
                What gets checked
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-text">
                Validation stays visible before conversion.
              </h3>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-muted">
                The converter is not a black box. It checks the structure you
                depend on, then explains what it found in plain English.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  "File type and size",
                  "Required column presence",
                  "Column data types",
                  "Duplicate BOL detection",
                  "Container number format",
                  "Port code consistency",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-border-light bg-background px-4 py-3 text-sm font-medium text-text-secondary"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="py-16 sm:py-24 lg:py-28 bg-background"
        aria-labelledby="benefits-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_0.92fr] lg:gap-16">
            <div>
              <h2
                id="benefits-heading"
                className="text-3xl font-bold text-text sm:text-4xl"
              >
                Why Use Our Converter?
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-text-muted">
                Built for customs brokers, freight forwarders, and logistics
                teams that need speed without trading away confidence.
              </p>

              <div className="mt-10 divide-y divide-border rounded-[24px] border border-border bg-surface">
                {BENEFITS.map((benefit) => (
                  <div
                    key={benefit.title}
                    className="flex gap-4 px-6 py-6 sm:px-7"
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-accent/10">
                      <benefit.icon aria-hidden="true" className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-text">
                        {benefit.title}
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-[24px] border border-primary/10 bg-primary p-8 text-white">
              <p className="text-sm font-semibold text-accent-light">
                Built for the real workflow
              </p>
              <p className="mt-4 text-xl font-semibold leading-tight">
                One file. One validation pass. One clean XML export.
              </p>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/76">
                No subscription maze, no scattered settings, and no guessing
                whether the manifest was accepted. The interface keeps the
                conversion process readable from top to bottom.
              </p>
              <ul className="mt-8 space-y-3 text-sm text-white/75">
                <li className="flex gap-3">
                  <CheckCircle aria-hidden="true" className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-light" />
                  Uses your existing Excel templates.
                </li>
                <li className="flex gap-3">
                  <CheckCircle aria-hidden="true" className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-light" />
                  Surfaces problems before XML generation.
                </li>
                <li className="flex gap-3">
                  <CheckCircle aria-hidden="true" className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-light" />
                  Keeps the output ready for direct download.
                </li>
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <section
        className="py-16 sm:py-24 lg:py-28 bg-surface"
        aria-labelledby="demo-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
            <div>
              <h2
                id="demo-heading"
                className="text-3xl font-bold text-text sm:text-4xl"
              >
                Watch the Demo
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-text-muted">
                See the real conversion flow in motion before you upload your
                own manifest.
              </p>

              <div className="mt-8 overflow-hidden rounded-[24px] border border-border bg-primary shadow-sm">
                <div className="relative aspect-video overflow-hidden">
                  <video
                    className="h-full w-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    poster="/demo/demo-poster.png"
                  >
                    <source src="/demo/demo.mp4" type="video/mp4" />
                    Your browser does not support the demo video.
                  </video>
                  <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/15 bg-primary/80 px-3 py-1 text-xs font-semibold tracking-wide text-white/85 backdrop-blur">
                    Real demo reel
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-border bg-background p-6 sm:p-8">
              <p className="text-sm font-semibold text-accent">What the demo shows</p>
              <ul className="mt-5 space-y-4 text-sm leading-relaxed text-text-muted">
                <li className="flex gap-3">
                  <CheckCircle aria-hidden="true" className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                  The live homepage introducing the converter.
                </li>
                <li className="flex gap-3">
                  <CheckCircle aria-hidden="true" className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                  The converter page showing the upload state.
                </li>
                <li className="flex gap-3">
                  <CheckCircle aria-hidden="true" className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                  The actual XML output generated from the sample workbook.
                </li>
              </ul>
              <div className="mt-8 rounded-2xl border border-border-light bg-surface px-5 py-4">
                <p className="text-sm font-semibold text-text">Tip</p>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  Use the sample file first if you want to compare the reel with
                  the real validation and download flow before connecting your
                  own data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="py-16 sm:py-24 lg:py-28 bg-background"
        aria-labelledby="faq-heading"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2
              id="faq-heading"
              className="text-3xl font-bold text-text sm:text-4xl"
            >
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-text-muted">
              Straight answers for the questions teams usually ask before they
              switch tools.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-[24px] border border-border bg-surface">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.q}
                className="group border-b border-border last:border-b-0"
              >
                <summary className="flex min-h-[56px] cursor-pointer items-center justify-between px-6 py-5 font-semibold text-text transition-colors hover:bg-surface-hover">
                  <span className="pr-4 text-left">{item.q}</span>
                  <span className="flex-shrink-0 text-text-muted transition-transform group-open:rotate-180">
                    ▼
                  </span>
                </summary>
                <div className="px-6 pb-5 text-sm leading-relaxed text-text-muted">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section
        className="bg-primary py-16 text-white sm:py-24 lg:py-28"
        aria-labelledby="cta-heading"
      >
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2
            id="cta-heading"
            className="text-3xl font-bold text-white sm:text-4xl"
          >
            Ready to convert your first manifest?
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/80">
            Try the converter with the sample file. No account required.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/converter"
              className="inline-flex min-h-[54px] items-center justify-center rounded-xl bg-accent px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-accent-light"
            >
              Start Converting Now
              <ArrowRight aria-hidden="true" className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
