/**
 * HS code normalization and validation for the Invoice-to-ASYCUDA module.
 *
 * Hard rules (do not relax):
 *  1. Strip spaces and periods only — they are formatting, not data.
 *  2. NEVER discard digits. Every digit found on the source document must
 *     survive normalization (into commodityCode / precision1 / precision2).
 *  3. NEVER invent digits. In particular, never pad with trailing zeros to
 *     reach a "nicer" length — a 6-digit code stays 6 digits.
 *  4. 9–10 digit codes are ambiguous for ASYCUDA segmentation (8-digit
 *     commodity code + up to 2x2 precision digits). They are preserved in
 *     full but flagged so a human can confirm the split.
 */

import type { HsCodeValidation, NormalizedHsCode } from "./types";

/** Recognized HS code lengths at each level of the nomenclature. */
export const HS_CODE_VALID_LENGTHS = [2, 4, 6, 8, 10] as const;

/** Length of the ASYCUDA commodity code (harmonized subheading + 2 national digits). */
export const COMMODITY_CODE_LENGTH = 8;

/**
 * Remove formatting separators (spaces and periods) from a raw HS code.
 * All digits are preserved; any other characters are preserved too so that
 * validateHsCode() can flag them instead of silently dropping data.
 */
export function stripHsCodeFormatting(raw: string): string {
  return raw.replace(/[\s.]+/g, "");
}

/**
 * Normalize a raw HS code as found on an invoice into ASYCUDA segments.
 *
 * Segmentation (never loses digits):
 *  - digits 1–8   → commodityCode
 *  - digits 9–10  → precision1 (national tariff line)
 *  - digits 11–12 → precision2 (statistical / additional)
 *
 * Codes shorter than 9 digits yield only a commodityCode (no padding).
 * Codes longer than 12 digits keep ALL digits in commodityCode rather than
 * discarding anything — validateHsCode() will flag the excess length.
 *
 * Returns null when the input contains no usable content.
 */
export function normalizeHsCode(raw: string): NormalizedHsCode | null {
  if (raw == null) return null;

  const stripped = stripHsCodeFormatting(String(raw).trim());
  if (stripped.length === 0) return null;

  // Non-digit content (e.g. letters) cannot be segmented reliably — return
  // it verbatim as commodityCode so validation can flag it. No data lost.
  if (!/^[0-9]+$/.test(stripped)) {
    return { commodityCode: stripped };
  }

  if (stripped.length <= COMMODITY_CODE_LENGTH) {
    return { commodityCode: stripped };
  }

  const result: NormalizedHsCode = {
    commodityCode: stripped.slice(0, COMMODITY_CODE_LENGTH),
  };

  const remainder = stripped.slice(COMMODITY_CODE_LENGTH);
  // 9–10 digit codes: remainder (1–2 digits) is the national tariff line.
  // 11–12 digit codes: first 2 of the remainder are precision1, rest precision2.
  if (remainder.length <= 2) {
    result.precision1 = remainder;
  } else {
    result.precision1 = remainder.slice(0, 2);
    result.precision2 = remainder.slice(2); // keeps any excess digits — never discarded
  }

  return result;
}

/**
 * Validate a raw or normalized HS code.
 *
 * A code is valid when, after stripping spaces/periods, it is all digits at a
 * recognized HS length (2, 4, 6, 8, or 10). A 9-digit code is reported as
 * invalid-but-recoverable via a specific ambiguity issue. Issues are always
 * human-readable and never cause data loss — callers decide how to proceed.
 */
export function validateHsCode(code: string): HsCodeValidation {
  const issues: string[] = [];

  if (code == null || String(code).trim().length === 0) {
    return { valid: false, issues: ["HS code is empty"] };
  }

  const stripped = stripHsCodeFormatting(String(code).trim());

  if (stripped.length === 0) {
    return { valid: false, issues: ["HS code contains only separators (spaces/periods)"] };
  }

  if (!/^[0-9]+$/.test(stripped)) {
    issues.push(`HS code "${code}" contains non-digit characters after removing spaces/periods`);
    return { valid: false, issues };
  }

  const length = stripped.length;

  if (!(HS_CODE_VALID_LENGTHS as readonly number[]).includes(length)) {
    if (length === 9) {
      // Ambiguous: is the 9th digit the start of a 2-digit tariff line, or a typo?
      issues.push(
        `HS code "${code}" is 9 digits — ambiguous ASYCUDA segmentation; ` +
          `confirm whether the commodity code is the first 8 digits with a 1-digit tariff line`,
      );
    } else if (length > 10) {
      issues.push(
        `HS code "${code}" is ${length} digits — longer than the 10-digit national tariff line; ` +
          `excess digits are preserved but must be reviewed`,
      );
    } else {
      issues.push(
        `HS code "${code}" is ${length} digits — expected one of ${HS_CODE_VALID_LENGTHS.join(", ")} digits`,
      );
    }
    return { valid: false, issues };
  }

  if (length === 10) {
    // Valid length, but the 8+2 split is an assumption — surface it as an info-level note.
    issues.push(
      `HS code "${code}" is 10 digits — assumed split is 8-digit commodity code + 2-digit national tariff line; verify before submission`,
    );
  }

  if (length < 6) {
    issues.push(
      `HS code "${code}" is only ${length} digits — too coarse for a declaration line (6+ digits recommended)`,
    );
    return { valid: false, issues };
  }

  return { valid: true, issues };
}

/**
 * Convenience helper: normalize a raw code and validate the result in one call.
 */
export function normalizeAndValidateHsCode(raw: string): {
  normalized: NormalizedHsCode | null;
  validation: HsCodeValidation;
} {
  const normalized = normalizeHsCode(raw);
  const validation = validateHsCode(raw);
  return { normalized, validation };
}
