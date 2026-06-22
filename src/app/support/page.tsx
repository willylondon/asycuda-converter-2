import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Mail, MessageCircle, Clock } from "lucide-react";
import { SupportForm } from "@/components/support/SupportForm";

export const metadata: Metadata = {
  title: "Support",
  description: "Get in touch with support",
};

const SUPPORT_CARDS = [
  {
    icon: Mail,
    title: "Email",
    description: "support@asycuda-converter.com",
    note: "Response within 24 hours",
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Available during business hours",
    note: "Mon–Fri, 9am–5pm EST",
  },
  {
    icon: Clock,
    title: "FAQ",
    description: "Check our FAQ for instant answers to common questions.",
    link: { href: "/faq", label: "View FAQ →" },
  },
] as const;

export default function SupportPage() {
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

      <h1 className="text-3xl font-bold text-text sm:text-4xl">Support</h1>
      <p className="mt-2 text-lg text-text-muted">
        We&apos;re here to help. Reach out and we&apos;ll get back to you quickly.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {SUPPORT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.title} className="rounded-2xl border border-border bg-surface p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <Icon aria-hidden="true" className="h-6 w-6 text-accent" />
              </div>
              <h2 className="text-lg font-semibold text-text">{card.title}</h2>
              <p className="mt-2 text-sm text-text-muted">{card.description}</p>
              {"note" in card ? <p className="mt-1 text-xs text-text-muted">{card.note}</p> : null}
              {"link" in card ? (
                <Link
                  href={card.link.href}
                  className="mt-2 inline-block text-sm font-medium text-accent transition-colors hover:text-accent-light"
                >
                  {card.link.label}
                </Link>
              ) : null}
            </article>
          );
        })}
      </div>

      <SupportForm
        className="mt-12"
        title="Send a Message"
        titleAs="h3"
        description="Tell us what you need help with and we&apos;ll respond as soon as possible."
        submitLabel="Send Message"
        idPrefix="support"
      />
    </div>
  );
}
