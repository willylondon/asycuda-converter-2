import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for ASYCUDA Excel Converter. Learn how we handle your data, files, and personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 prose prose-gray">
      <nav aria-label="Breadcrumb" className="mb-8 not-prose">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-text-muted hover:text-accent transition-colors min-h-[44px]"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4 mr-1" /> Back to Home
        </Link>
      </nav>

      <h1>Privacy Policy</h1>
      <p className="text-text-muted">Last updated: June 2026</p>

      <h2>1. Information We Collect</h2>
      <p>
        We collect only the information necessary to provide our conversion service.
        When you upload an Excel file, we process it in memory to generate ASYCUDA XML.
        We do <strong>not</strong> store your files, manifests, or generated XML output.
      </p>
      <ul>
        <li>Uploaded Excel files (processed in memory only)</li>
        <li>Email address (if you contact support)</li>
        <li>Payment information (processed by Stripe — we never see your card details)</li>
      </ul>

      <h2>2. How We Use Information</h2>
      <p>We use your information solely to:</p>
      <ul>
        <li>Process your Excel-to-XML conversions</li>
        <li>Respond to support inquiries</li>
        <li>Process payments via Stripe</li>
        <li>Improve our conversion engine based on error patterns</li>
      </ul>

      <h2>3. Data Retention</h2>
      <p>
        Files uploaded for conversion are processed entirely in memory and deleted
        immediately after the XML is generated. We do not retain copies of your
        manifests, Excel files, or XML output on any storage medium.
      </p>

      <h2>4. Third-Party Services</h2>
      <p>We use the following third-party services:</p>
      <ul>
        <li><strong>Stripe</strong> — for payment processing</li>
        <li><strong>Vercel</strong> — for hosting and deployment</li>
        <li><strong>Cloudflare</strong> — for CDN and security</li>
      </ul>

      <h2>5. Security</h2>
      <p>
        All data is transferred over HTTPS. We implement appropriate technical and
        organizational measures to protect your information against unauthorized access,
        alteration, disclosure, or destruction.
      </p>

      <h2>6. Contact</h2>
      <p>
        For privacy-related questions, contact us at{" "}
        <a href="mailto:support@asycuda-converter.com">
          support@asycuda-converter.com
        </a>
        .
      </p>
    </div>
  );
}
