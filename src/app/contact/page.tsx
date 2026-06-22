import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Mail, MapPin } from "lucide-react";
import { SupportForm } from "@/components/support/SupportForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact the ASYCUDA Excel Converter team. Get in touch for support, enterprise pricing, or partnership inquiries.",
};

const CONTACT_CARDS = [
  {
    icon: Mail,
    title: "Email",
    description: "support@asycuda-converter.com",
  },
  {
    icon: MapPin,
    title: "Location",
    description: "Willy London — Kingston, Jamaica",
  },
] as const;

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-8">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center text-sm text-text-muted transition-colors hover:text-accent"
        >
          <ArrowLeft aria-hidden="true" className="mr-1 h-4 w-4" />
          Back to Home
        </Link>
      </nav>

      <h1 className="text-3xl font-bold text-text sm:text-4xl">Contact Us</h1>
      <p className="mt-2 text-lg text-text-muted">
        Have a question, suggestion, or business inquiry? We&apos;d love to hear from you.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {CONTACT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.title} className="rounded-2xl border border-border bg-surface p-6">
              <Icon aria-hidden="true" className="mb-4 h-8 w-8 text-accent" />
              <h2 className="text-lg font-semibold text-text">{card.title}</h2>
              <p className="mt-2 text-sm text-text-muted">{card.description}</p>
            </article>
          );
        })}
      </div>

      <SupportForm
        className="mt-12"
        title="Send Us a Message"
        titleAs="h2"
        description="Share what you need and our team will respond quickly."
        submitLabel="Send Message"
        idPrefix="contact"
      />
    </div>
  );
}
