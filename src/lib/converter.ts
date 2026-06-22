/**
 * ASYCUDA Excel-to-XML Conversion Engine
 *
 * Processes Excel delivery manifests into ASYCUDA-compliant XML.
 * Files are processed in memory only — nothing is written to disk.
 */

import * as XLSX from "xlsx";

// ─── Types ───────────────────────────────────────────────────────

export interface ConversionResult {
  success: boolean;
  xml: string | null;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  stats: {
    rowCount: number;
    columnCount: number;
    fileName: string;
    fileSizeKB: number;
  } | null;
}

export interface ValidationIssue {
  type: "error" | "warning";
  message: string;
  row?: number;
  column?: string;
}

// ─── Required ASYCUDA Columns ────────────────────────────────────

const REQUIRED_COLUMNS = [
  "containernumber",
  "billoflading",
  "consignee",
  "description",
  "grossweight",
  "packagecount",
  "portoforigin",
  "portofdestination",
];

const COLUMN_ALIASES: Record<string, string[]> = {
  containernumber: ["container number", "container #", "cntr no.", "cntr #", "container"],
  billoflading: ["bill of lading", "bl #", "bl number", "bol", "hbl"],
  consignee: ["consignee name", "receiver", "importer"],
  description: ["goods description", "cargo description", "item description", "commodity"],
  grossweight: ["weight (kg)", "weight kg", "gross weight", "total weight", "weight"],
  packagecount: ["packages", "package count", "pkg count", "no. of packages", "pcs"],
  portoforigin: ["origin port", "origin", "port of origin", "loading port", "pol"],
  portofdestination: ["destination port", "destination", "port of destination", "discharge port", "pod"],
};

// ─── Column Mapping ──────────────────────────────────────────────

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, "");
}

function mapColumns(headers: string[]): { mapping: Map<string, number>; unmapped: string[] } {
  const mapping = new Map<string, number>();
  const unmatched = new Set<string>();

  for (let i = 0; i < headers.length; i++) {
    const normalized = normalizeHeader(String(headers[i]));
    let matched = false;

    for (const [canonical, aliases] of Object.entries(COLUMN_ALIASES)) {
      if (canonical === normalized || aliases.includes(normalized)) {
        mapping.set(canonical, i);
        matched = true;
        break;
      }
    }

    if (!matched) {
      unmatched.add(String(headers[i]));
    }
  }

  return { mapping, unmapped: Array.from(unmatched) };
}

// ─── Row-Level Validation ────────────────────────────────────────

function validateRow(
  row: Record<string, unknown>,
  mapping: Map<string, number>,
  headers: string[],
  rowIndex: number
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const [col, colIndex] of mapping) {
    const headerName = headers[colIndex];
    const value = row[headerName];

    // Missing/empty check
    if (value === undefined || value === null || String(value).trim() === "") {
      issues.push({
        type: "error",
        message: `Missing required value for "${headerName}"`,
        row: rowIndex,
        column: col,
      });
      continue;
    }

    // Type-specific validation
    switch (col) {
      case "grossweight":
        if (isNaN(Number(value))) {
          issues.push({
            type: "error",
            message: `"${headerName}" must be a number — got "${value}"`,
            row: rowIndex,
            column: col,
          });
        }
        break;

      case "packagecount":
        if (isNaN(Number(value)) || !Number.isInteger(Number(value))) {
          issues.push({
            type: "error",
            message: `"${headerName}" must be a whole number — got "${value}"`,
            row: rowIndex,
            column: col,
          });
        }
        break;

      case "containernumber":
        if (String(value).trim().length < 4) {
          issues.push({
            type: "warning",
            message: `"${headerName}" seems unusually short — "${value}"`,
            row: rowIndex,
            column: col,
          });
        }
        break;

      case "billoflading":
        if (String(value).trim().length < 3) {
          issues.push({
            type: "warning",
            message: `"${headerName}" seems unusually short — "${value}"`,
            row: rowIndex,
            column: col,
          });
        }
        break;
    }
  }

  return issues;
}

// ─── XML Generation ──────────────────────────────────────────────

function sanitizeXml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateAsycudaXml(
  rows: Record<string, unknown>[],
  mapping: Map<string, number>,
  headers: string[],
  fileName: string
): string {
  const now = new Date().toISOString();
  const ts = Date.now();

  const lines: string[] = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<ASYCUDA xmlns="http://www.wcoomd.org/ASYCUDA" generated="${now}" source="${sanitizeXml(fileName)}">`,
    `  <Manifest>`,
    `    <Header>`,
    `      <ManifestNumber>MAN-${ts}</ManifestNumber>`,
    `      <GeneratedDate>${now.split("T")[0]}</GeneratedDate>`,
    `      <TotalConsignments>${rows.length}</TotalConsignments>`,
    `    </Header>`,
    `    <Consignments>`,
  ];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const get = (col: string): string => {
      const idx = mapping.get(col);
      if (idx === undefined) return "";
      return sanitizeXml(row[headers[idx]]);
    };

    lines.push(`      <Consignment index="${i + 1}">`);
    lines.push(`        <ContainerNumber>${get("containernumber")}</ContainerNumber>`);
    lines.push(`        <BillOfLading>${get("billoflading")}</BillOfLading>`);
    lines.push(`        <Consignee>${get("consignee")}</Consignee>`);
    lines.push(`        <Description>${get("description")}</Description>`);
    lines.push(`        <GrossWeight unit="KG">${get("grossweight")}</GrossWeight>`);
    lines.push(`        <PackageCount>${get("packagecount")}</PackageCount>`);
    lines.push(`        <PortOfOrigin>${get("portoforigin")}</PortOfOrigin>`);
    lines.push(`        <PortOfDestination>${get("portofdestination")}</PortOfDestination>`);
    lines.push(`      </Consignment>`);
  }

  lines.push(`    </Consignments>`);
  lines.push(`  </Manifest>`);
  lines.push(`</ASYCUDA>`);

  return lines.join("\n");
}

// ─── Main Converter Function ─────────────────────────────────────

export function convertExcelToAsycudaXml(
  buffer: ArrayBuffer,
  fileName: string,
  fileSizeBytes: number
): ConversionResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  // Parse workbook from memory buffer
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
  } catch (e) {
    return {
      success: false,
      xml: null,
      errors: [
        {
          type: "error",
          message: `Failed to parse Excel file. The file may be corrupted or password-protected.`,
        },
      ],
      warnings: [],
      stats: null,
    };
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return {
      success: false,
      xml: null,
      errors: [{ type: "error", message: "Excel file contains no sheets." }],
      warnings: [],
      stats: null,
    };
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  if (rows.length === 0) {
    return {
      success: false,
      xml: null,
      errors: [{ type: "error", message: "Sheet is empty — no data rows found." }],
      warnings: [],
      stats: null,
    };
  }

  const headers = Object.keys(rows[0]);
  if (headers.length === 0) {
    return {
      success: false,
      xml: null,
      errors: [{ type: "error", message: "No column headers found in the first row." }],
      warnings: [],
      stats: null,
    };
  }

  // Map columns
  const { mapping, unmapped } = mapColumns(headers);

  // Check for missing required columns
  for (const requiredCol of REQUIRED_COLUMNS) {
    if (!mapping.has(requiredCol)) {
      const aliases = COLUMN_ALIASES[requiredCol];
      errors.push({
        type: "error",
        message: `Required column "${requiredCol}" not found. Expected a column named like: ${aliases.slice(0, 3).join(", ")}`,
      });
    }
  }

  if (unmapped.length > 0) {
    warnings.push({
      type: "warning",
      message: `Unrecognized columns will be ignored: ${unmapped.join(", ")}`,
    });
  }

  // Validate each row
  let errorCount = 0;
  for (let i = 0; i < rows.length; i++) {
    const rowIssues = validateRow(rows[i], mapping, headers, i + 2); // +2 = Excel row (1-indexed + header)
    for (const issue of rowIssues) {
      if (issue.type === "error") {
        errors.push(issue);
        errorCount++;
      } else {
        warnings.push(issue);
      }
    }
  }

  if (errorCount > 0) {
    return {
      success: false,
      xml: null,
      errors,
      warnings,
      stats: {
        rowCount: rows.length,
        columnCount: headers.length,
        fileName,
        fileSizeKB: Math.round(fileSizeBytes / 1024),
      },
    };
  }

  // Generate XML
  const xml = generateAsycudaXml(rows, mapping, headers, fileName);

  return {
    success: true,
    xml,
    errors,
    warnings,
    stats: {
      rowCount: rows.length,
      columnCount: headers.length,
      fileName,
      fileSizeKB: Math.round(fileSizeBytes / 1024),
    },
  };
}

// ─── Client-side Preview Validator (no file read, metadata only) ──

export function validateFileMetadata(file: File): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const ext = "." + file.name.split(".").pop()?.toLowerCase();

  const validExtensions = [".xlsx", ".xls"];
  if (!validExtensions.includes(ext)) {
    issues.push({
      type: "error",
      message: `Unsupported format "${ext}". Please upload a .xlsx or .xls file.`,
    });
  }

  if (file.size > 10 * 1024 * 1024) {
    issues.push({
      type: "error",
      message: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 10MB.`,
    });
  }

  if (file.size === 0) {
    issues.push({
      type: "error",
      message: "File is empty.",
    });
  }

  return issues;
}
