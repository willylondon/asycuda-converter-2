import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about creating test ASYCUDA XML from commercial invoices.",
};

const FAQ_DATA = [
  {
    q: "What is ASYCUDA?",
    a: "ASYCUDA (Automated System for Customs Data) is a computerized customs management system developed by UNCTAD. It is used by customs administrations in over 100 countries to process trade data, manifests, and customs declarations electronically.",
  },
  {
    q: "What invoice formats can I upload?",
    a: "You can upload a commercial invoice as a PDF or image. You can also enter the invoice information manually.",
  },
  {
    q: "How does the conversion work?",
    a: "Enter the declaration details, upload or manually enter the invoice, review every extracted value and tariff classification, validate the declaration, then preview and download test ASYCUDA XML.",
  },
  {
    q: "Is my data secure?",
    a: "The application uses HTTPS and requires an approved Google account. Treat commercial invoices and declarations as confidential business records and review all extracted information before export.",
  },
  {
    q: "What if the invoice has missing or incorrect information?",
    a: "The validation step identifies missing declaration fields, unresolved tariffs and invalid item values. You can return to the relevant step, correct the information and validate again.",
  },
  {
    q: "Do I need an account?",
    a: "Yes. Access is restricted to Google accounts approved by the application administrator.",
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
          <ArrowLeft aria-hidden="true" className="h-4 w-4 mr-1" /> Back to Home
        </Link>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-bold text-text">
        Frequently Asked Questions
      </h1>
      <p className="mt-2 text-lg text-text-muted">
        Everything you need to know about preparing test ASYCUDA XML from a
        commercial invoice.
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
