import tariffData from "@/data/jca-tariff-2026.generated.json";
import type { JamaicaTariffEntry, JamaicaTariffRates } from "@/lib/asycuda/types";

export const JCA_TARIFF_SOURCE_URL = tariffData.metadata.sourceUrl;
export const JCA_TARIFF_EFFECTIVE_DATE = tariffData.metadata.effectiveDate;
export const JAMAICA_TRADE_PORTAL_API_URL = "https://jamaicatradeportal.gov.jm/index.php/en-gb/api/commodity";

const seedEntries = tariffData.entries as JamaicaTariffEntry[];

export interface JamaicaTariffSearchResponse {
  results: JamaicaTariffEntry[];
  catalogue: "jca-2026-seed" | "jamaica-trade-portal-api";
  fullCatalogueConfigured: boolean;
  sourceUrl: string;
  effectiveDate: string;
  message?: string;
}

export function normalizeTariffCode(value: string): string {
  return value.replace(/[^0-9]/g, "").slice(0, 10);
}

export function splitJamaicaTariffCode(code: string): {
  commodityCode: string;
  precision1: string | null;
  precision2: string | null;
  precision3: string | null;
  precision4: string | null;
} {
  const digits = normalizeTariffCode(code);
  return {
    commodityCode: digits.slice(0, 8),
    precision1: digits.charAt(8) || null,
    precision2: digits.charAt(9) || null,
    precision3: null,
    precision4: null,
  };
}

function searchSeed(query: string, limit: number): JamaicaTariffEntry[] {
  const normalizedCode = normalizeTariffCode(query);
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);

  return seedEntries
    .map((entry) => {
      let score = 0;
      if (normalizedCode) {
        if (entry.code === normalizedCode) score += 100;
        else if (entry.code.startsWith(normalizedCode)) score += 60;
        else if (normalizedCode.startsWith(entry.code.slice(0, 8))) score += 40;
      }
      const text = `${entry.code} ${entry.description}`.toLowerCase();
      for (const term of terms) {
        if (text.includes(term)) score += term.length >= 4 ? 8 : 3;
      }
      return { entry, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.entry.code.localeCompare(b.entry.code))
    .slice(0, limit)
    .map(({ entry }) => entry);
}

function stringValue(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function pick(record: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = stringValue(record[key]);
    if (value) return value;
  }
  return null;
}

function parseUnits(record: Record<string, unknown>): string[] {
  const values = [
    pick(record, ["unit1", "unit_1", "units1", "statistical_unit_1", "unit"]),
    pick(record, ["unit2", "unit_2", "units2", "statistical_unit_2"]),
  ].filter((value): value is string => Boolean(value));
  return [...new Set(values)];
}

function parseRates(record: Record<string, unknown>): JamaicaTariffRates {
  return {
    importDuty: pick(record, ["importDuty", "import_duty", "id", "duty", "mfn"]),
    additionalStampDuty: pick(record, ["additionalStampDuty", "additional_stamp_duty", "asd"]),
    gct: pick(record, ["gct", "general_consumption_tax"]),
    excise: pick(record, ["excise", "exc"]),
    scta: pick(record, ["scta"]),
    scts: pick(record, ["scts"]),
    sctf: pick(record, ["sctf"]),
    standardComplianceFee: pick(record, ["standardComplianceFee", "standard_compliance_fee", "scf"]),
    environmentalLevy: pick(record, ["environmentalLevy", "environmental_levy", "envl"]),
    developmentCess: pick(record, ["developmentCess", "development_cess", "dcess"]),
    raw: [],
  };
}

function collectRecords(value: unknown, records: Record<string, unknown>[]): void {
  if (Array.isArray(value)) {
    for (const item of value) collectRecords(item, records);
    return;
  }
  if (!value || typeof value !== "object") return;
  const record = value as Record<string, unknown>;
  const code = pick(record, ["hscode", "hs_code", "hsCode", "tariff_code", "tariffCode", "commodity_code", "code"]);
  const description = pick(record, ["description", "commodity_description", "commodityDescription", "name", "label"]);
  if (code && description && /^\d[\d.\s-]{5,}$/.test(code)) records.push(record);
  for (const nested of Object.values(record)) collectRecords(nested, records);
}

function normalizeTradePortalResponse(value: unknown): JamaicaTariffEntry[] {
  const records: Record<string, unknown>[] = [];
  collectRecords(value, records);
  const entries = records
    .map((record): JamaicaTariffEntry | null => {
      const code = normalizeTariffCode(pick(record, ["hscode", "hs_code", "hsCode", "tariff_code", "tariffCode", "commodity_code", "code"]) ?? "");
      const description = pick(record, ["description", "commodity_description", "commodityDescription", "name", "label"]);
      if (code.length !== 10 || !description) return null;
      return {
        code,
        description,
        units: parseUnits(record),
        rates: parseRates(record),
        effectiveDate: JCA_TARIFF_EFFECTIVE_DATE,
        sourceUrl: JAMAICA_TRADE_PORTAL_API_URL,
        source: "jamaica-trade-portal-api",
      };
    })
    .filter((entry): entry is JamaicaTariffEntry => Boolean(entry));

  const unique = new Map<string, JamaicaTariffEntry>();
  for (const entry of entries) unique.set(entry.code, entry);
  return [...unique.values()];
}

async function searchTradePortal(code: string): Promise<JamaicaTariffEntry[]> {
  const apiToken = process.env.JAMAICA_TARIFF_API_TOKEN?.trim();
  const secretKey = process.env.JAMAICA_TARIFF_API_SECRET?.trim();
  if (!apiToken || !secretKey || normalizeTariffCode(code).length < 6) return [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(JAMAICA_TRADE_PORTAL_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        api_token: apiToken,
        secret_key: secretKey,
        hscode: normalizeTariffCode(code),
      }),
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) return [];
    return normalizeTradePortalResponse(await response.json());
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function searchJamaicaTariff(query: string, limit = 12): Promise<JamaicaTariffSearchResponse> {
  const cleanQuery = query.trim();
  const fullCatalogueConfigured = Boolean(
    process.env.JAMAICA_TARIFF_API_TOKEN?.trim() && process.env.JAMAICA_TARIFF_API_SECRET?.trim(),
  );

  if (!cleanQuery) {
    return {
      results: [],
      catalogue: fullCatalogueConfigured ? "jamaica-trade-portal-api" : "jca-2026-seed",
      fullCatalogueConfigured,
      sourceUrl: JCA_TARIFF_SOURCE_URL,
      effectiveDate: JCA_TARIFF_EFFECTIVE_DATE,
    };
  }

  const local = searchSeed(cleanQuery, limit);
  const exactLocal = local.find((entry) => entry.code === normalizeTariffCode(cleanQuery));
  if (exactLocal) {
    return {
      results: local,
      catalogue: "jca-2026-seed",
      fullCatalogueConfigured,
      sourceUrl: JCA_TARIFF_SOURCE_URL,
      effectiveDate: JCA_TARIFF_EFFECTIVE_DATE,
    };
  }

  const remote = await searchTradePortal(cleanQuery);
  if (remote.length > 0) {
    return {
      results: remote.slice(0, limit),
      catalogue: "jamaica-trade-portal-api",
      fullCatalogueConfigured,
      sourceUrl: JAMAICA_TRADE_PORTAL_API_URL,
      effectiveDate: JCA_TARIFF_EFFECTIVE_DATE,
    };
  }

  return {
    results: local,
    catalogue: "jca-2026-seed",
    fullCatalogueConfigured,
    sourceUrl: JCA_TARIFF_SOURCE_URL,
    effectiveDate: JCA_TARIFF_EFFECTIVE_DATE,
    message: fullCatalogueConfigured
      ? "No matching official tariff was returned. Review the wording or code."
      : "The client-demo tariff catalogue is active. Add Jamaica Trade Portal API credentials for full-catalogue lookup.",
  };
}
