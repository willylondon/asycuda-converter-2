import Link from "next/link";
import type { Metadata } from "next";
import { Check, ArrowLeft } from "lucide-react";

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

      <div className="mt-12 grid sm:grid-cols-3 gap-6">
        <PricingCard
          title="Single Conversion"
          price="$5"
          period="per conversion"
          features={[
            "One Excel to XML conversion",
            "Instant validation report",
            "ASYCUDA-compliant output",
            "Email support",
          ]}
          cta="Get Started"
          href="/converter"
          featured={false}
        />
        <PricingCard
          title="10-Pack"
          price="$40"
          period="10 conversions"
          features={[
            "10 conversions",
            "Priority processing",
            "Priority email support",
            "Save 20% vs single",
          ]}
          cta="Get Started"
          href="/converter"
          featured={true}
        />
        <PricingCard
          title="Enterprise"
          price="Custom"
          period="volume pricing"
          features={[
            "Unlimited conversions",
            "API access",
            "Custom integration",
            "Dedicated support",
            "SLA guarantee",
            "Invoice billing",
          ]}
          cta="Contact Us"
          href="/contact"
          featured={false}
        />
      </div>
    </div>
  );
}

function PricingCard({
  title,
  price,
  period,
  features,
  cta,
  href,
  featured,
}: {
  title: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  href: string;
  featured: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-8 ${
        featured
          ? "border-accent bg-accent/5 ring-1 ring-accent/20"
          : "border-border bg-surface"
      }`}
    >
      <h2 className="text-xl font-semibold text-text">{title}</h2>
      <div className="mt-4">
        <span className="text-4xl font-extrabold text-text">{price}</span>
        <span className="text-sm text-text-muted ml-2">{period}</span>
      </div>
      <ul className="mt-6 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-text-secondary">
            <Check aria-hidden="true" className="h-4 w-4 flex-shrink-0 mt-0.5 text-accent" />
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`mt-8 block text-center rounded-xl px-6 py-3 text-sm font-semibold transition-colors min-h-[48px] flex items-center justify-center ${
          featured
            ? "bg-accent text-white hover:bg-accent-light"
            : "bg-surface-hover text-text hover:bg-border"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
