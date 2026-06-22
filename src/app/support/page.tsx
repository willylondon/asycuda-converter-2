"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Mail, MessageCircle, Clock, Loader2, CheckCircle, AlertTriangle } from "lucide-react";

export default function SupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errors, setErrors] = useState<{ field: string; message: string }[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setServerError(null);
    setStatus("submitting");

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setServerError(data.error || "Something went wrong.");
        }
        setStatus("error");
        return;
      }

      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setServerError("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  };

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

        {/* Success state */}
        {status === "success" && (
          <div className="flex items-start gap-3 rounded-xl bg-success/5 border border-success/20 p-4 mb-6">
            <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-success text-sm">Message Sent</p>
              <p className="text-sm text-text-secondary mt-1">
                We&apos;ll get back to you within 24 hours.
              </p>
            </div>
          </div>
        )}

        {/* Server error */}
        {(serverError || status === "error") && !errors.length && (
          <div className="flex items-start gap-3 rounded-xl bg-danger/5 border border-danger/20 p-4 mb-6">
            <AlertTriangle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-danger text-sm">Error</p>
              <p className="text-sm text-text-secondary mt-1">
                {serverError || "Something went wrong. Please try again."}
              </p>
              <button
                onClick={() => { setStatus("idle"); setServerError(null); }}
                className="mt-2 text-sm font-medium text-accent"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {status === "success" && (
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="inline-flex items-center justify-center rounded-xl bg-accent text-white px-8 py-3 text-sm font-semibold hover:bg-accent-light transition-colors min-h-[48px]"
            >
              Send Another Message
            </button>
          )}

          {(status === "idle" || status === "submitting" || status === "error") && (
            <>
              <div>
                <label htmlFor="support-name" className="block text-sm font-medium text-text mb-1">
                  Name
                </label>
                <input
                  id="support-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-text placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
                  placeholder="Your name"
                />
                {errors.find((e) => e.field === "name") && (
                  <p className="text-xs text-danger mt-1">{errors.find((e) => e.field === "name")!.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="support-email" className="block text-sm font-medium text-text mb-1">
                  Email
                </label>
                <input
                  id="support-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-text placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
                  placeholder="you@example.com"
                />
                {errors.find((e) => e.field === "email") && (
                  <p className="text-xs text-danger mt-1">{errors.find((e) => e.field === "email")!.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="support-message" className="block text-sm font-medium text-text mb-1">
                  Message
                </label>
                <textarea
                  id="support-message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-text placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors resize-y"
                  placeholder="Describe your issue or question..."
                />
                {errors.find((e) => e.field === "message") && (
                  <p className="text-xs text-danger mt-1">{errors.find((e) => e.field === "message")!.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={status === "submitting"}
                className="inline-flex items-center justify-center rounded-xl bg-accent text-white px-8 py-3 text-sm font-semibold hover:bg-accent-light transition-colors min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
