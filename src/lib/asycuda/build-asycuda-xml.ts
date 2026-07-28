import fs from "fs";
import path from "path";
import type { DeclarationDraft } from "./declaration-draft";
import { applyFieldMappings } from "./field-mapping";
import { buildItemElements } from "./item-mapping";

const TEMPLATE_PATH = path.join(process.cwd(), "src/lib/asycuda/templates/blank-asycuda-template.xml");

let _cachedTemplate: string | null = null;

function loadTemplate(): string {
  if (!_cachedTemplate) {
    _cachedTemplate = fs.readFileSync(TEMPLATE_PATH, "utf-8");
  }
  return _cachedTemplate;
}

/**
 * Build an ASYCUDA-compliant XML declaration from a DeclarationDraft.
 * Uses CBJ250.xml structure as the authoritative template.
 * All money values are strings to avoid floating-point issues.
 */
export function buildAsycudaXml(draft: DeclarationDraft): string {
  let xml = loadTemplate();

  // Apply header/summary field mappings
  xml = applyFieldMappings(draft, xml);

  // Build item elements
  const itemsXml = buildItemElements(draft);

  // Replace placeholder with items
  xml = xml.replace("<!-- ITEMS_PLACEHOLDER -->", itemsXml);

  // Add MVP disclaimer comment
  const comment = "<!-- Tax calculations are not included in this MVP. -->\n";
  return comment + xml;
}
