import {
  createDraftFromExtraction as createBaseDraft,
  type DeclarationDraft,
} from "./declaration-draft";
import type { InvoiceExtractionResult } from "./types";

/**
 * Extends the base draft assembler without inferring package counts from product
 * quantities. Only values explicitly extracted from the invoice are copied.
 */
export function createExtractionDraft(
  extraction: InvoiceExtractionResult,
  baseDraft: DeclarationDraft,
  source: "ai" | "demo" = "ai",
): DeclarationDraft {
  const draft = createBaseDraft(extraction, baseDraft, source);
  draft.items = draft.items.map((item, index) => ({
    ...item,
    packageCount: extraction.items[index]?.packageCount ?? null,
    statisticalQuantity: extraction.items[index]?.statisticalQuantity ?? null,
  }));
  return draft;
}
