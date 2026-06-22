import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Mail, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact the ASYCUDA Excel Converter team. Get in touch for support, enterprise pricing, or partnership inquiries.",
};

export default function ContactPage() {
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

      <h1 className="text-3xl sm:text-4xl font-bold text-text">Contact Us</h1>
      <p className="mt-2 text-lg text-text-muted">
        Have a question, suggestion, or business inquiry? We&apos;d love to hear from
        you.
      </p>

      <div className="mt-12 grid sm:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-surface border border-border p-6">
          <Mail className="h-8 w-8 text-accent mb-4" />
          <h3 className="text-lg font-semibold text-text">Email</h3>
          <p className="mt-2 text-sm text-text-muted">
            support@asycuda-converter.com
          </p>
        </div>
        <div className="rounded-2xl bg-surface border border-border p-6">
          <MapPin className="h-8 w-8 text-accent mb-4" />
          <h3 className="text-lg font-semibold text-text">Location</h3>
          <p className="mt-2 text-sm text-text-muted">
            Willy London — Kingston, Jamaica
          </p>
        </div>
      </div>

      <div className="mt-12 p-8 rounded-2xl bg-surface border border-border">
        <h2 className="text-xl font-semibold text-text mb-6">
          Send Us a Message
        </h2>
        <form className="space-y-5">
          <div>
            <label
              htmlFor="contact-name"
              className="block text-sm font-medium text-text mb-1"
            >
              Name
            </label>
            <input
              id="contact-name"
              type="text"
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
              placeholder="Your name"
            />
          </div>
          <div>
            <label
              htmlFor="contact-email"
              className="block text-sm font-medium text-text mb-1"
            >
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="contact-message"
              className="block text-sm font-medium text-text mb-1"
            >
              Message
            </label>
            <textarea
              id="contact-message"
              required
              rows={4}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors resize-y"
              placeholder="Your message..."
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