import Link from "next/link";
import {
  FileSpreadsheet,
  Upload,
  CheckCircle,
  Download,
  Shield,
  Zap,
  ArrowRight,
  Play,
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
    description: "Output XML follows ASYCUDA World specifications exactly. No rejections, no resubmissions.",
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
      {/* ═══ HERO ═══ */}
      <section
        className="relative bg-primary overflow-hidden"
        aria-labelledby="hero-heading"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-light to-accent-dark opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl">
            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]"
            >
              Convert Excel Delivery Manifests Into{" "}
              <span className="text-accent">ASYCUDA XML</span> In Minutes
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-2xl leading-relaxed">
              Validate, convert, and download customs-ready XML files without
              manual formatting. Upload your Excel file and get compliant XML in
              under 60 seconds.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/converter"
                className="inline-flex items-center justify-center rounded-xl bg-accent text-white px-8 py-4 text-base font-semibold hover:bg-accent-light transition-colors shadow-lg shadow-accent/25 min-h-[56px]"
              >
                Start Converting
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/samples/sample-manifest.xlsx"
                className="inline-flex items-center justify-center rounded-xl border-2 border-white/20 text-white px-8 py-4 text-base font-semibold hover:bg-white/10 transition-colors min-h-[56px]"
              >
                <FileSpreadsheet className="mr-2 h-5 w-5" />
                Download Sample File
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section
        className="py-16 sm:py-24 bg-surface"
        aria-labelledby="how-it-works-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2
              id="how-it-works-heading"
              className="text-3xl sm:text-4xl font-bold text-text"
            >
              How It Works
            </h2>
            <p className="mt-4 text-lg text-text-muted">
              Three simple steps from Excel to customs-ready XML.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="relative flex flex-col items-center text-center p-8 rounded-2xl border border-border bg-surface hover:shadow-lg transition-shadow"
              >
                <div
                  className={`w-16 h-16 ${step.bg} rounded-2xl flex items-center justify-center mb-5`}
                >
                  <step.icon className={`h-8 w-8 ${step.color}`} />
                </div>
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </div>
                <h3 className="text-xl font-semibold text-text mb-3">
                  {step.title}
                </h3>
                <p className="text-text-muted leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BENEFITS ═══ */}
      <section
        className="py-16 sm:py-24 bg-background"
        aria-labelledby="benefits-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2
              id="benefits-heading"
              className="text-3xl sm:text-4xl font-bold text-text"
            >
              Why Use Our Converter?
            </h2>
            <p className="mt-4 text-lg text-text-muted">
              Built for customs brokers, freight forwarders, and logistics
              professionals.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {BENEFITS.map((benefit) => (
              <div
                key={benefit.title}
                className="p-8 rounded-2xl bg-surface border border-border text-center hover:border-accent/30 transition-colors"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-text mb-2">
                  {benefit.title}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DEMO ═══ */}
      <section
        className="py-16 sm:py-24 bg-surface"
        aria-labelledby="demo-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2
              id="demo-heading"
              className="text-3xl sm:text-4xl font-bold text-text"
            >
              Watch the Demo
            </h2>
            <p className="mt-4 text-lg text-text-muted">
              See how easy it is to convert your Excel files to ASYCUDA XML.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden bg-primary-light aspect-video group">
              {/* Thumbnail placeholder — click to load YouTube */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mx-auto mb-4 shadow-xl shadow-accent/50 group-hover:scale-110 transition-transform">
                    <Play className="h-8 w-8 text-white ml-1" />
                  </div>
                  <p className="text-white/70 text-sm">
                    Click to watch the demo video
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section
        className="py-16 sm:py-24 bg-background"
        aria-labelledby="faq-heading"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              id="faq-heading"
              className="text-3xl sm:text-4xl font-bold text-text"
            >
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.q}
                className="group bg-surface border border-border rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-surface-hover transition-colors min-h-[56px] font-medium text-text">
                  {item.q}
                  <span className="ml-4 flex-shrink-0 text-text-muted group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-6 pb-4 text-text-secondary leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-16 sm:py-24 bg-primary" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2
            id="cta-heading"
            className="text-3xl sm:text-4xl font-bold text-white"
          >
            Ready to Convert Your First Manifest?
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Try it free with our sample file — no account required.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/converter"
              className="inline-flex items-center justify-center rounded-xl bg-accent text-white px-8 py-4 text-base font-semibold hover:bg-accent-light transition-colors shadow-lg shadow-accent/25 min-h-[56px]"
            >
              Start Converting Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}