import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Mail, MessageCircle, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Get help with the ASYCUDA Excel Converter. Contact support, report issues, or ask questions about Excel-to-XML conversion.",
};

export default function SupportPage() {
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

      <h1 className="text-3xl sm:text-4xl font-bold text-text">Support</h1>
      <p className="mt-2 text-lg text-text-muted">
        We&apos;re here to help. Reach out and we&apos;ll get back to you quickly.
      </p>

      <div className="mt-12 grid sm:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-surface border border-border p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-6 w-6 text-accent" />
          </div>
          <h3 className="text-lg font-semibold text-text">Email</h3>
          <p className="mt-2 text-sm text-text-muted">
            support@asycuda-converter.com
          </p>
          <p className="text-xs text-text-muted mt-1">Response within 24 hours</p>
        </div>

        <div className="rounded-2xl bg-surface border border-border p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-6 w-6 text-accent" />
          </div>
          <h3 className="text-lg font-semibold text-text">Live Chat</h3>
          <p className="mt-2 text-sm text-text-muted">Available during business hours</p>
          <p className="text-xs text-text-muted mt-1">Mon–Fri, 9am–5pm EST</p>
        </div>

        <div className="rounded-2xl bg-surface border border-border p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Clock className="h-6 w-6 text-accent" />
          </div>
          <h3 className="text-lg font-semibold text-text">FAQ</h3>
          <p className="mt-2 text-sm text-text-muted">
            Check our FAQ for instant answers to common questions.
          </p>
          <Link
            href="/faq"
            className="mt-2 inline-block text-sm font-medium text-accent hover:text-accent-light transition-colors"
          >
            View FAQ →
          </Link>
        </div>
      </div>

      <div className="mt-12 p-8 rounded-2xl bg-surface border border-border">
        <h2 className="text-xl font-semibold text-text mb-6">Send a Message</h2>
        <form className="space-y-5">
          <div>
            <label htmlFor="support-name" className="block text-sm font-medium text-text mb-1">
              Name
            </label>
            <input
              id="support-name"
              type="text"
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-text placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="support-email" className="block text-sm font-medium text-text mb-1">
              Email
            </label>
            <input
              id="support-email"
              type="email"
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-text placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="support-message" className="block text-sm font-medium text-text mb-1">
              Message
            </label>
            <textarea
              id="support-message"
              required
              rows={4}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-text placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors resize-y"
              placeholder="Describe your issue or question..."
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-accent text-white px-8 py-3 text-sm font-semibold hover:bg-accent-light transition-colors min-h-[48px]"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}