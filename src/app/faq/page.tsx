import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about ASYCUDA Excel Converter — file formats, security, pricing, and more.",
};

const FAQ_DATA = [
  {
    q: "What is ASYCUDA?",
    a: "ASYCUDA (Automated System for Customs Data) is a computerized customs management system developed by UNCTAD. It is used by customs administrations in over 100 countries to process trade data, manifests, and customs declarations electronically.",
  },
  {
    q: "What Excel format does the converter accept?",
    a: "We accept .xlsx (Excel 2007+) and .xls (Excel 97-2003) files. Your file must include the required columns for ASYCUDA conversion: Container Number, Bill of Lading, Consignee, Description, Gross Weight, Package Count, Port of Origin, and Port of Destination.",
  },
  {
    q: "How does the conversion work?",
    a: "Upload your Excel file → our engine validates the structure and data types → you review a validation report → one click to convert → download your ASYCUDA-compliant XML. Average conversion time is under 60 seconds.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. All files are processed in memory and deleted immediately after conversion. We use HTTPS encryption for all data transfer. We never store your manifests, Excel files, or generated XML output on our servers.",
  },
  {
    q: "What if my Excel file has errors?",
    a: "Our validation engine checks every row and column before conversion. If it finds issues — missing columns, invalid dates, empty required fields — you'll see a clear validation report telling you exactly what needs to be fixed and where.",
  },
  {
    q: "Do I need an account?",
    a: "Not right now. You can convert files immediately without registration. In the future, we'll offer accounts for conversion history, saved templates, and subscription plans.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept credit and debit cards. Payment is processed through Stripe for secure checkout before you download your XML file.",
  },
  {
    q: "Can I get a refund?",
    a: "If the conversion fails or the XML output is rejected by customs due to a formatting error on our end, we'll provide a full refund. Contact support within 7 days of conversion.",
  },
  {
    q: "Do you offer bulk conversion?",
    a: "We're building bulk processing capabilities. For now, you can convert one file at a time. Our 10-pack pricing gives you a discount for multiple conversions.",
  },
  {
    q: "Which countries use ASYCUDA?",
    a: "Over 100 countries and territories use some version of ASYCUDA, including Jamaica, Trinidad & Tobago, Barbados, Guyana, and many other CARICOM nations, plus countries across Africa, Asia, and the Pacific.",
  },
];

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <nav aria-label="Breadcrumb" className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-text-muted hover:text-accent transition-colors min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Home
        </Link>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-bold text-text">
        Frequently Asked Questions
      </h1>
      <p className="mt-2 text-lg text-text-muted">
        Everything you need to know about converting Excel manifests to ASYCUDA
        XML.
      </p>

      <div className="mt-12 space-y-4">
        {FAQ_DATA.map((item) => (
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
  );
}