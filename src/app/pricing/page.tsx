import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { PricingList } from "@/components/pricing/PricingList";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for ASYCUDA Excel conversion. Pay per conversion — no subscriptions required.",
};

export default function PricingPage() {
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

      <h1 className="text-3xl sm:text-4xl font-bold text-text">Pricing</h1>
      <p className="mt-2 text-lg text-text-muted">
        Simple, transparent pricing. Pay only when you convert.
      </p>

      <PricingList />
    </div>
  );
}

