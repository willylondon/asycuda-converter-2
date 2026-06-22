"use client";

import { type FormEvent, useState } from "react";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import type {
  SupportApiResponse,
  SupportFieldError,
  SupportFieldName,
} from "@/lib/support";

type HeadingLevel = "h2" | "h3";

interface SupportFormProps {
  title: string;
  description?: string;
  titleAs?: HeadingLevel;
  submitLabel?: string;
  successMessage?: string;
  idPrefix?: string;
  className?: string;
}

const DEFAULT_SUCCESS_MESSAGE =
  "We'll get back to you within 24 hours.";

export function SupportForm({
  title,
  description,
  titleAs = "h2",
  submitLabel = "Send Message",
  successMessage = DEFAULT_SUCCESS_MESSAGE,
  idPrefix = "support",
  className = "",
}: SupportFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errors, setErrors] = useState<SupportFieldError[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const TitleTag = titleAs;
  const getError = (field: SupportFieldName) =>
    errors.find((error) => error.field === field)?.message;
  const reset = () => {
    setStatus("idle");
    setErrors([]);
    setServerError(null);
  };
  const clear = () => {
    setName("");
    setEmail("");
    setMessage("");
    reset();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors([]);
    setServerError(null);
    setStatus("submitting");

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = (await response.json()) as SupportApiResponse;

      if (!response.ok) {
        if ("errors" in data && data.errors?.length) {
          setErrors(data.errors);
        } else {
          setServerError("error" in data ? data.error : "Something went wrong.");
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

  const nameError = getError("name");
  const emailError = getError("email");
  const messageError = getError("message");
  const nameErrorId = `${idPrefix}-name-error`;
  const emailErrorId = `${idPrefix}-email-error`;
  const messageErrorId = `${idPrefix}-message-error`;
  const statusId = `${idPrefix}-status`;

  return (
    <section className={`rounded-2xl bg-surface border border-border p-8 ${className}`}>
      <TitleTag id={statusId} className="text-xl font-semibold text-text">
        {title}
      </TitleTag>
      {description ? (
        <p className="mt-2 text-sm text-text-muted">{description}</p>
      ) : null}

      {status === "success" ? (
        <div
          role="status"
          aria-live="polite"
          className="mt-6 rounded-xl bg-success/5 border border-success/20 p-4"
        >
          <div className="flex items-start gap-3">
            <CheckCircle aria-hidden="true" className="mt-0.5 h-5 w-5 text-success" />
            <div>
              <p className="font-semibold text-success text-sm">Message Sent</p>
              <p className="text-sm text-text-secondary mt-1">{successMessage}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={clear}
            className="mt-4 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-light"
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <>
          {(serverError || status === "error") && !errors.length ? (
            <div
              role="alert"
              aria-live="assertive"
              className="mt-6 flex items-start gap-3 rounded-xl bg-danger/5 border border-danger/20 p-4"
            >
              <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 text-danger" />
              <div>
                <p className="font-semibold text-danger text-sm">Error</p>
                <p className="text-sm text-text-secondary mt-1">
                  {serverError || "Something went wrong. Please try again."}
                </p>
                <button
                  type="button"
                  onClick={reset}
                  className="mt-2 text-sm font-medium text-accent hover:text-accent-light"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : null}

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
            aria-labelledby={statusId}
          >
            <div>
              <label htmlFor={`${idPrefix}-name`} className="mb-1 block text-sm font-medium text-text">
                Name
              </label>
              <input
                id={`${idPrefix}-name`}
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                aria-invalid={!!nameError}
                aria-describedby={nameErrorId}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-text placeholder:text-text-muted outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
                placeholder="Your name"
              />
              {nameError ? (
                <p id={nameErrorId} className="mt-1 text-xs text-danger">
                  {nameError}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor={`${idPrefix}-email`} className="mb-1 block text-sm font-medium text-text">
                Email
              </label>
              <input
                id={`${idPrefix}-email`}
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={!!emailError}
                aria-describedby={emailErrorId}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-text placeholder:text-text-muted outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
                placeholder="you@example.com"
              />
              {emailError ? (
                <p id={emailErrorId} className="mt-1 text-xs text-danger">
                  {emailError}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor={`${idPrefix}-message`} className="mb-1 block text-sm font-medium text-text">
                Message
              </label>
              <textarea
                id={`${idPrefix}-message`}
                required
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                aria-invalid={!!messageError}
                aria-describedby={messageErrorId}
                className="w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm text-text placeholder:text-text-muted outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
                placeholder="Describe your issue or question..."
              />
              {messageError ? (
                <p id={messageErrorId} className="mt-1 text-xs text-danger">
                  {messageError}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={status === "submitting"}
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-accent px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "submitting" ? (
                <>
                  <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                submitLabel
              )}
            </button>
          </form>
        </>
      )}
    </section>
  );
}
