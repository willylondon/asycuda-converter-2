"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Loader2, Search, ShieldCheck, X } from "lucide-react";
import type { JamaicaTariffEntry } from "@/lib/asycuda/types";

interface SearchResponse {
  results: JamaicaTariffEntry[];
  catalogue: "jca-2026-seed" | "jamaica-trade-portal-public" | "jamaica-trade-portal-api";
  fullCatalogueConfigured: boolean;
  exactCodeLookupAvailable: boolean;
  sourceUrl: string;
  effectiveDate: string;
  message?: string;
}

interface Props {
  lineNumber: number;
  initialQuery: string;
  onApply: (entry: JamaicaTariffEntry) => void;
  onClose: () => void;
}

function displayRate(value: string | null): string {
  if (!value || value === "-") return "—";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return value;
  if (numeric >= 0 && numeric <= 1) return `${(numeric * 100).toLocaleString("en-US", { maximumFractionDigits: 3 })}%`;
  return value;
}

function sourceLabel(catalogue: SearchResponse["catalogue"]): string {
  if (catalogue === "jamaica-trade-portal-api") return "Jamaica Trade Portal API";
  if (catalogue === "jamaica-trade-portal-public") return "Live public Jamaica Trade Portal";
  return "JCA 2026 client-demo catalogue";
}

export function TariffLookupPanel({ lineNumber, initialQuery, onApply, onClose }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (searchValue: string) => {
    const trimmed = searchValue.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/invoice-to-xml/api/tariff?q=${encodeURIComponent(trimmed)}`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Tariff lookup failed.");
      setData(await response.json());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Tariff lookup failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void search(initialQuery);
  }, [initialQuery, search]);

  return (
    <section className="mt-5 rounded-2xl border border-accent/30 bg-accent/5 p-5" aria-label={`Jamaica tariff lookup for line ${lineNumber}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-accent">
            <ShieldCheck className="h-5 w-5" />
            <h3 className="font-semibold">Official Jamaica Tariff Lookup — Line {lineNumber}</h3>
          </div>
          <p className="mt-1 text-sm text-text-muted">
            Verify the complete 10-digit tariff code against the current Jamaican tariff before confirming the HS code.
          </p>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-2 text-text-muted hover:bg-background hover:text-text" aria-label="Close tariff lookup">
          <X className="h-5 w-5" />
        </button>
      </div>

      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          void search(query);
        }}
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Enter an exact 10-digit code or search the demo descriptions"
          className="min-h-[46px] flex-1 rounded-xl border border-border bg-background px-4 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button type="submit" disabled={loading || !query.trim()} className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-accent px-5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Search tariff
        </button>
      </form>

      {error && <p className="mt-3 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>}

      {data && (
        <div className="mt-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted">
            <span>Source: {sourceLabel(data.catalogue)} · Tariff reference effective {data.effectiveDate}</span>
            <a href={data.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-accent hover:underline">
              Open official source <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {!data.fullCatalogueConfigured && (
            <div className="mb-3 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-text">
              Exact 10-digit codes are verified live against the public Jamaica Trade Portal. Broad keyword and partial-code searches outside the PriceSmart demo require official Trade Portal API credentials.
            </div>
          )}

          {data.message && <p className="mb-3 text-sm text-text-muted">{data.message}</p>}

          <div className="space-y-3">
            {data.results.map((entry) => (
              <article key={`${entry.source}-${entry.code}`} className="rounded-xl border border-border bg-background p-4">
                <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="rounded-md bg-primary-dark px-2 py-1 text-sm font-bold text-white">{entry.code}</code>
                      <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-semibold text-success">Official match</span>
                      {entry.units.length > 0 && <span className="text-xs text-text-muted">Units: {entry.units.join(", ")}</span>}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-text">{entry.description}</p>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-text-muted">
                      <span>Import duty: <strong className="text-text">{displayRate(entry.rates.importDuty)}</strong></span>
                      <span>GCT: <strong className="text-text">{displayRate(entry.rates.gct)}</strong></span>
                      <span>SCF: <strong className="text-text">{displayRate(entry.rates.standardComplianceFee)}</strong></span>
                      <span>ENVL: <strong className="text-text">{displayRate(entry.rates.environmentalLevy)}</strong></span>
                    </div>
                  </div>
                  <button type="button" onClick={() => onApply(entry)} className="inline-flex min-h-[44px] flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-success px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
                    <ShieldCheck className="h-4 w-4" /> Use this tariff
                  </button>
                </div>
              </article>
            ))}
          </div>

          {!loading && data.results.length === 0 && (
            <div className="rounded-xl border border-border bg-background p-5 text-center text-sm text-text-muted">
              No matching tariff was found. Enter the complete 10-digit code for live verification or revise the product description.
            </div>
          )}
        </div>
      )}

      <p className="mt-4 text-xs leading-5 text-text-muted">
        Tariff lookup supports classification review. It does not calculate final customs liability or replace confirmation by a licensed customs broker.
      </p>
    </section>
  );
}
