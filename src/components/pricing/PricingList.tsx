"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

export function PricingList() {
  const [loadingPlan, setLoadingPlan] = useState<"single" | "pack" | null>(null);

  const handleGetStarted = async (planType: "single" | "pack") => {
    setLoadingPlan(planType);
    try {
      const response = await fetch("/api/wipay/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      }

      // If response is not ok or no url, fall back to /converter
      console.warn("WiPay checkout initiation failed. Falling back to converter.");
      window.location.href = "/converter";
    } catch (err) {
      console.error("WiPay checkout error. Falling back to converter:", err);
      window.location.href = "/converter";
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="mt-12 grid sm:grid-cols-3 gap-6">
      {/* Single Conversion */}
      <div className="rounded-2xl border border-border bg-surface p-8">
        <h2 className="text-xl font-semibold text-text">Single Conversion</h2>
        <div className="mt-4">
          <span className="text-4xl font-extrabold text-text">$5</span>
          <span className="text-sm text-text-muted ml-2">per conversion</span>
        </div>
        <ul className="mt-6 space-y-3">
          <li className="flex items-start gap-2 text-sm text-text-secondary">
            <Check aria-hidden="true" className="h-4 w-4 flex-shrink-0 mt-0.5 text-accent" />
            One Excel to XML conversion
          </li>
          <li className="flex items-start gap-2 text-sm text-text-secondary">
            <Check aria-hidden="true" className="h-4 w-4 flex-shrink-0 mt-0.5 text-accent" />
            Instant validation report
          </li>
          <li className="flex items-start gap-2 text-sm text-text-secondary">
            <Check aria-hidden="true" className="h-4 w-4 flex-shrink-0 mt-0.5 text-accent" />
            ASYCUDA-compliant output
          </li>
          <li className="flex items-start gap-2 text-sm text-text-secondary">
            <Check aria-hidden="true" className="h-4 w-4 flex-shrink-0 mt-0.5 text-accent" />
            Email support
          </li>
        </ul>
        <button
          type="button"
          disabled={loadingPlan !== null}
          onClick={() => handleGetStarted("single")}
          className="mt-8 w-full text-center rounded-xl bg-surface-hover text-text hover:bg-border px-6 py-3 text-sm font-semibold transition-colors min-h-[48px] flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingPlan === "single" ? (
            <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin text-text" />
          ) : (
            "Get Started"
          )}
        </button>
      </div>

      {/* 10-Pack */}
      <div className="rounded-2xl border border-accent bg-accent/5 ring-1 ring-accent/20 p-8">
        <h2 className="text-xl font-semibold text-text">10-Pack</h2>
        <div className="mt-4">
          <span className="text-4xl font-extrabold text-text">$40</span>
          <span className="text-sm text-text-muted ml-2">10 conversions</span>
        </div>
        <ul className="mt-6 space-y-3">
          <li className="flex items-start gap-2 text-sm text-text-secondary">
            <Check aria-hidden="true" className="h-4 w-4 flex-shrink-0 mt-0.5 text-accent" />
            10 conversions
          </li>
          <li className="flex items-start gap-2 text-sm text-text-secondary">
            <Check aria-hidden="true" className="h-4 w-4 flex-shrink-0 mt-0.5 text-accent" />
            Priority processing
          </li>
          <li className="flex items-start gap-2 text-sm text-text-secondary">
            <Check aria-hidden="true" className="h-4 w-4 flex-shrink-0 mt-0.5 text-accent" />
            Priority email support
          </li>
          <li className="flex items-start gap-2 text-sm text-text-secondary">
            <Check aria-hidden="true" className="h-4 w-4 flex-shrink-0 mt-0.5 text-accent" />
            Save 20% vs single
          </li>
        </ul>
        <button
          type="button"
          disabled={loadingPlan !== null}
          onClick={() => handleGetStarted("pack")}
          className="mt-8 w-full text-center rounded-xl bg-accent text-white hover:bg-accent-light px-6 py-3 text-sm font-semibold transition-colors min-h-[48px] flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingPlan === "pack" ? (
            <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin text-white" />
          ) : (
            "Get Started"
          )}
        </button>
      </div>

      {/* Enterprise */}
      <div className="rounded-2xl border border-border bg-surface p-8">
        <h2 className="text-xl font-semibold text-text">Enterprise</h2>
        <div className="mt-4">
          <span className="text-4xl font-extrabold text-text">Custom</span>
          <span className="text-sm text-text-muted ml-2">volume pricing</span>
        </div>
        <ul className="mt-6 space-y-3">
          <li className="flex items-start gap-2 text-sm text-text-secondary">
            <Check aria-hidden="true" className="h-4 w-4 flex-shrink-0 mt-0.5 text-accent" />
            Unlimited conversions
          </li>
          <li className="flex items-start gap-2 text-sm text-text-secondary">
            <Check aria-hidden="true" className="h-4 w-4 flex-shrink-0 mt-0.5 text-accent" />
            API access
          </li>
          <li className="flex items-start gap-2 text-sm text-text-secondary">
            <Check aria-hidden="true" className="h-4 w-4 flex-shrink-0 mt-0.5 text-accent" />
            Custom integration
          </li>
          <li className="flex items-start gap-2 text-sm text-text-secondary">
            <Check aria-hidden="true" className="h-4 w-4 flex-shrink-0 mt-0.5 text-accent" />
            Dedicated support
          </li>
          <li className="flex items-start gap-2 text-sm text-text-secondary">
            <Check aria-hidden="true" className="h-4 w-4 flex-shrink-0 mt-0.5 text-accent" />
            SLA guarantee
          </li>
          <li className="flex items-start gap-2 text-sm text-text-secondary">
            <Check aria-hidden="true" className="h-4 w-4 flex-shrink-0 mt-0.5 text-accent" />
            Invoice billing
          </li>
        </ul>
        <Link
          href="/contact"
          className="mt-8 block text-center rounded-xl bg-surface-hover text-text hover:bg-border px-6 py-3 text-sm font-semibold transition-colors min-h-[48px] flex items-center justify-center"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
