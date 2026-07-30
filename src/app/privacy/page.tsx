import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for Clearance. Learn how invoice, declaration and account information is handled.",
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
        We collect and process the information necessary to provide the declaration
        workflow, including the approved Google account used to sign in and the
        invoice or declaration information submitted for processing.
      </p>
      <ul>
        <li>Uploaded commercial invoice files and extracted invoice data</li>
        <li>Email address and basic profile information used for sign-in</li>
        <li>Payment information (processed by Stripe — we never see your card details)</li>
      </ul>

      <h2>2. How We Use Information</h2>
      <p>We use your information solely to:</p>
      <ul>
        <li>Extract and validate invoice and declaration information</li>
        <li>Respond to support inquiries</li>
        <li>Process payments via Stripe</li>
        <li>Improve our conversion engine based on error patterns</li>
      </ul>

      <h2>3. Data Retention</h2>
      <p>
        Uploaded files are processed to complete the requested extraction. Users
        should not assume that browser drafts, service logs or third-party processing
        records are deleted immediately. Retention controls should be reviewed by the
        company administrator before using the service with sensitive records.
      </p>

      <h2>4. Third-Party Services</h2>
      <p>We use the following third-party services:</p>
      <ul>
        <li><strong>Stripe</strong> — for payment processing</li>
        <li><strong>Vercel</strong> — for hosting and deployment</li>
        <li><strong>Google</strong> — for account authentication and invoice extraction</li>
        <li><strong>OpenRouter</strong> — as a fallback invoice-extraction provider</li>
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
