import tariffData from "@/data/jca-tariff-2026.generated.json";
import type { JamaicaTariffEntry, JamaicaTariffRates } from "@/lib/asycuda/types";

export const JCA_TARIFF_SOURCE_URL = tariffData.metadata.sourceUrl;
export const JCA_TARIFF_EFFECTIVE_DATE = tariffData.metadata.effectiveDate;
export const JAMAICA_TRADE_PORTAL_API_URL = "https://jamaicatradeportal.gov.jm/index.php/en-gb/api/commodity";
export const JAMAICA_TRADE_PORTAL_COMMODITY_URL = "https://jamaicatradeportal.gov.jm/en-gb/site/commodity";

const seedEntries = tariffData.entries as JamaicaTariffEntry[];

type CatalogueSource = "jca-2026-seed" | "jamaica-trade-portal-public" | "jamaica-trade-portal-api";

export interface JamaicaTariffSearchResponse {
  results: JamaicaTariffEntry[];
  catalogue: CatalogueSource;
  /** True when private API credentials permit keyword and partial-code search. */
  fullCatalogueConfigured: boolean;
  /** Exact 10-digit codes can always be checked through the public portal. */
  exactCodeLookupAvailable: boolean;
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

function decodeHtml(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, number: string) => String.fromCodePoint(Number(number)))
    .replace(/&#x([0-9a-f]+);/gi, (_, number: string) => String.fromCodePoint(Number.parseInt(number, 16)));
}

function plainText(value: string): string {
  return decodeHtml(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function emptyRates(): JamaicaTariffRates {
  return {
    importDuty: null,
    additionalStampDuty: null,
    gct: null,
    excise: null,
    scta: null,
    scts: null,
    sctf: null,
    standardComplianceFee: null,
    environmentalLevy: null,
    developmentCess: null,
    raw: [],
  };
}

function setPublicRate(rates: JamaicaTariffRates, feeCode: string, group: string, rate: string): void {
  const key = `${feeCode} ${group}`.toLowerCase();
  if (key.includes("import duty") || /^id(?:-|\s|$)/i.test(feeCode)) rates.importDuty = rate;
  else if (key.includes("additional stamp") || /^asd/i.test(feeCode)) rates.additionalStampDuty = rate;
  else if (key.includes("general consumption") || /^gct/i.test(feeCode)) rates.gct = rate;
  else if (key.includes("excise") || /^exc/i.test(feeCode)) rates.excise = rate;
  else if (/^scta/i.test(feeCode)) rates.scta = rate;
  else if (/^scts/i.test(feeCode)) rates.scts = rate;
  else if (/^sctf/i.test(feeCode)) rates.sctf = rate;
  else if (key.includes("standard compliance") || /^scf/i.test(feeCode)) rates.standardComplianceFee = rate;
  else if (key.includes("environmental levy") || /^envl/i.test(feeCode)) rates.environmentalLevy = rate;
  else if (key.includes("development cess") || /^dcess/i.test(feeCode)) rates.developmentCess = rate;
}

function extractPublicDescription(html: string, code: string): string | null {
  const escapedCode = code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`\\\\?"id\\\\?"\\s*:\\s*\\\\?"${escapedCode}\\\\?"[\\s\\S]{0,500}?\\\\?"text\\\\?"\\s*:\\s*\\\\?"${escapedCode}:\\s*([^"\\\\]+)`, "i"),
    new RegExp(`"${escapedCode}:\\s*([^"]+)"`, "i"),
    new RegExp(`${escapedCode}:\\s*([^<\\r\\n]{3,500})`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (!match?.[1]) continue;
    const description = plainText(match[1].replace(/\\"/g, '"').replace(/\\\//g, "/"));
    if (description && description !== code) return description;
  }
  return null;
}

/** Parse one official public JTIP commodity page. Exported for deterministic tests. */
export function parseTradePortalCommodityPage(html: string, code: string): JamaicaTariffEntry | null {
  const normalizedCode = normalizeTariffCode(code);
  if (normalizedCode.length !== 10 || html.length < 100) return null;

  const description = extractPublicDescription(html, normalizedCode);
  if (!description) return null;

  const table = html.match(/<table[^>]+id=["']datatable_tariff["'][^>]*>([\s\S]*?)<\/table>/i)?.[1] ?? "";
  const rates = emptyRates();
  const units = new Set<string>();
  for (const row of table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = Array.from(row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi), (match) => plainText(match[1]));
    if (cells.length < 8) continue;
    const [, feeCode, group, activity, rate, unit, validFrom, validTo] = cells;
    if (!feeCode || !group || activity.toLowerCase() !== "import") continue;
    if (unit && unit !== "-") units.add(unit);
    setPublicRate(rates, feeCode, group, rate || "-");
    rates.raw.push([feeCode, group, rate || "-", unit || "-", validFrom || "", validTo || ""].join(" | "));
  }

  if (rates.raw.length === 0) return null;
  return {
    code: normalizedCode,
    description,
    units: [...units],
    rates,
    effectiveDate: JCA_TARIFF_EFFECTIVE_DATE,
    sourceUrl: `${JAMAICA_TRADE_PORTAL_COMMODITY_URL}/${normalizedCode}`,
    source: "jamaica-trade-portal-public",
  };
}

async function fetchPublicTradePortalEntry(code: string): Promise<JamaicaTariffEntry | null> {
  const normalizedCode = normalizeTariffCode(code);
  if (normalizedCode.length !== 10) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(`${JAMAICA_TRADE_PORTAL_COMMODITY_URL}/${normalizedCode}`, {
      headers: { "User-Agent": "Mozilla/5.0 ASYCUDA-Converter/1.0", Accept: "text/html" },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) return null;
    return parseTradePortalCommodityPage(await response.text(), normalizedCode);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
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

async function searchTradePortalApi(query: string): Promise<JamaicaTariffEntry[]> {
  const apiToken = process.env.JAMAICA_TARIFF_API_TOKEN?.trim();
  const secretKey = process.env.JAMAICA_TARIFF_API_SECRET?.trim();
  if (!apiToken || !secretKey || query.trim().length < 2) return [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(JAMAICA_TRADE_PORTAL_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ api_token: apiToken, secret_key: secretKey, hscode: query.trim() }),
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
  const normalizedCode = normalizeTariffCode(cleanQuery);
  const fullCatalogueConfigured = Boolean(
    process.env.JAMAICA_TARIFF_API_TOKEN?.trim() && process.env.JAMAICA_TARIFF_API_SECRET?.trim(),
  );
  const base = { fullCatalogueConfigured, exactCodeLookupAvailable: true, effectiveDate: JCA_TARIFF_EFFECTIVE_DATE };

  if (!cleanQuery) {
    return {
      results: [],
      catalogue: fullCatalogueConfigured ? "jamaica-trade-portal-api" : "jca-2026-seed",
      sourceUrl: JCA_TARIFF_SOURCE_URL,
      ...base,
    };
  }

  const local = searchSeed(cleanQuery, limit);
  const exactLocal = local.find((entry) => entry.code === normalizedCode);
  if (exactLocal) {
    return { results: local, catalogue: "jca-2026-seed", sourceUrl: JCA_TARIFF_SOURCE_URL, ...base };
  }

  if (normalizedCode.length === 10) {
    const publicEntry = await fetchPublicTradePortalEntry(normalizedCode);
    if (publicEntry) {
      return {
        results: [publicEntry],
        catalogue: "jamaica-trade-portal-public",
        sourceUrl: publicEntry.sourceUrl,
        ...base,
      };
    }
  }

  const apiEntries = await searchTradePortalApi(cleanQuery);
  if (apiEntries.length > 0) {
    return {
      results: apiEntries.slice(0, limit),
      catalogue: "jamaica-trade-portal-api",
      sourceUrl: JAMAICA_TRADE_PORTAL_API_URL,
      ...base,
    };
  }

  return {
    results: local,
    catalogue: "jca-2026-seed",
    sourceUrl: JCA_TARIFF_SOURCE_URL,
    ...base,
    message: fullCatalogueConfigured
      ? "No matching official tariff was returned. Review the wording or code."
      : "Exact 10-digit codes are checked against the public Jamaica Trade Portal. Keyword and partial-code search outside the client-demo catalogue require official API credentials.",
  };
}
