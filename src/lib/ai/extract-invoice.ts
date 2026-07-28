import { createGeminiExtractor } from "./providers/gemini";
import { createOpenRouterExtractor } from "./providers/openrouter";
import {
  AIExtractionError,
  AI_ERROR_CODES,
  AIProviderConfig,
  ExtractInvoiceFn,
  ProviderId,
} from "./types";
import type { InvoiceExtractionResult } from "../asycuda/types";

// ── Defaults ────────────────────────────────────────────────────────

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const DEFAULT_OPENROUTER_MODEL = "google/gemini-2.5-flash";
const DEFAULT_PROVIDER_ORDER = "gemini,openrouter";

/**
 * Reads the AI provider configuration from environment variables.
 */
export function getProviderConfig(): AIProviderConfig {
  return {
    order: process.env.AI_PROVIDER_ORDER?.trim() || DEFAULT_PROVIDER_ORDER,
    gemini: {
      apiKey: process.env.GEMINI_API_KEY?.trim(),
      model: process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL,
    },
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY?.trim(),
      model: process.env.OPENROUTER_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL,
    },
  };
}

/**
 * Parses the provider order string into a list of ProviderId values.
 */
function parseProviderOrder(order: string): ProviderId[] {
  const ids: ProviderId[] = [];
  for (const raw of order.split(",")) {
    const trimmed = raw.trim().toLowerCase();
    if (trimmed === "gemini" || trimmed === "openrouter") {
      ids.push(trimmed as ProviderId);
    }
  }
  return ids;
}

/**
 * Builds the extraction function for a single provider.
 */
function buildProvider(id: ProviderId, config: AIProviderConfig): ExtractInvoiceFn | null {
  switch (id) {
    case "gemini":
      return createGeminiExtractor({ apiKey: config.gemini.apiKey, model: config.gemini.model });
    case "openrouter":
      return createOpenRouterExtractor({ apiKey: config.openrouter.apiKey, model: config.openrouter.model });
    default:
      return null;
  }
}

/**
 * Main extraction function.
 *
 * Attempts providers in the configured order, falling back to the next
 * when the current one fails with a retryable error (quota, rate-limit,
 * transient 5xx, timeout, network, invalid response).
 */
export async function extractInvoiceData(
  fileBuffer: Buffer,
  mimeType: string,
): Promise<InvoiceExtractionResult> {
  const config = getProviderConfig();
  const order = parseProviderOrder(config.order);

  if (order.length === 0) {
    throw new AIExtractionError(
      AI_ERROR_CODES.CONFIGURATION_ERROR,
      "No AI providers configured. Set GEMINI_API_KEY and/or OPENROUTER_API_KEY.",
      false,
    );
  }

  // Build provider functions — only those with valid API keys
  const providers: Array<{ id: ProviderId; fn: ExtractInvoiceFn }> = [];
  for (const id of order) {
    try {
      const fn = buildProvider(id, config);
      if (fn) {
        providers.push({ id, fn });
      }
    } catch (err) {
      console.warn(`[AI] Skipping provider "${id}":`, err);
    }
  }

  if (providers.length === 0) {
    throw new AIExtractionError(
      AI_ERROR_CODES.CONFIGURATION_ERROR,
      "No AI providers are configured. Set GEMINI_API_KEY and/or OPENROUTER_API_KEY.",
      false,
    );
  }

  const errors: Array<{ provider: ProviderId; error: string }> = [];

  for (const { id, fn } of providers) {
    try {
      console.log(`[AI] Trying provider: ${id}`);
      const result = await fn(fileBuffer, mimeType);
      console.log(`[AI] Provider "${id}" succeeded.`);
      return result;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`[AI] Provider "${id}" failed:`, msg);

      if (error instanceof AIExtractionError) {
        errors.push({ provider: id, error: error.message });
        // Don't fall through for permanent errors
        if (!error.retryable) {
          throw error;
        }
        console.warn(`[AI] "${id}" error is retryable — falling back to next provider.`);
        continue;
      }

      errors.push({ provider: id, error: msg });
      continue;
    }
  }

  // All providers exhausted
  const errorSummary = errors.map((e) => `${e.provider}: ${e.error}`).join(" | ");
  throw new AIExtractionError(
    AI_ERROR_CODES.PROVIDER_UNAVAILABLE,
    `All AI providers failed: ${errorSummary}`,
    true,
    60,
  );
}

export { AIExtractionError, AI_ERROR_CODES };
export type { AIProviderConfig, ExtractInvoiceFn, ProviderId };
