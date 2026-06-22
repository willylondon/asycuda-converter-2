import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for ASYCUDA Excel Converter. Read the terms governing use of our Excel-to-ASYCUDA XML conversion service.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 prose prose-gray">
      <nav aria-label="Breadcrumb" className="mb-8 not-prose">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-text-muted hover:text-accent transition-colors min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Home
        </Link>
      </nav>

      <h1>Terms of Service</h1>
      <p className="text-text-muted">Last updated: June 2026</p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By using the ASYCUDA Excel Converter, you agree to these Terms of Service.
        If you do not agree, do not use the service.
      </p>

      <h2>2. Service Description</h2>
      <p>
        ASYCUDA Excel Converter is a web-based tool that converts Excel delivery
        manifest files into ASYCUDA-compliant XML format for customs submission.
      </p>

      <h2>3. User Responsibilities</h2>
      <p>You are responsible for:</p>
      <ul>
        <li>Ensuring your Excel files contain accurate and complete data</li>
        <li>Verifying the generated XML output before submission to customs</li>
        <li>Complying with all applicable customs regulations and laws</li>
      </ul>

      <h2>4. Payment</h2>
      <p>
        Payment is required before downloading converted XML files. We use Stripe for
        secure payment processing. Refunds are available within 7 days if the XML
        output is rejected by customs due to a formatting error on our part.
      </p>

      <h2>5. Limitation of Liability</h2>
      <p>
        ASYCUDA Excel Converter is provided &quot;as is&quot; without warranty. We are not
        liable for customs rejections, delays, penalties, or damages resulting from
        use of our service. Always verify the XML output before submission.
      </p>

      <h2>6. Contact</h2>
      <p>
        For questions about these terms, contact{" "}
        <a href="mailto:support@asycuda-converter.com">
          support@asycuda-converter.com
        </a>
        .
      </p>
    </div>
  );
}