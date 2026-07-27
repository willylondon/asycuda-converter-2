import { create } from "xmlbuilder2";
import type { AsycudaXmlInput, ValidationFinding } from "./types";

/**
 * Build an ASYCUDA-compliant XML declaration from declaration data and invoice items.
 *
 * System-generated fields (registration, assessment, receipt numbers, calculated taxes)
 * are left blank. The XML is prefixed with a comment noting this is an MVP.
 */
export function buildAsycudaXml(input: AsycudaXmlInput): string {
  const { declaration, items } = input;

  const root = create({ version: "1.0", encoding: "UTF-8" }).ele("ASYCUDA");

  root.com("Tax calculations are not included in this MVP.");

  // Property
  const prop = root.ele("Property");

  // Identification
  const ident = prop.ele("Identification");
  ident.ele("Declaration_type").txt(String(declaration.declarationType || declaration.regimeType || "IM4"));
  ident.ele("Declaration_date").txt(new Date().toISOString().split("T")[0]);
  ident.ele("Customs_office_code").txt(String(declaration.customsOfficeCode || ""));
  ident.ele("Customs_office_name").txt(String(declaration.customsOfficeName || ""));

  // Traders
  const traders = prop.ele("Traders");
  const exporter = traders.ele("Exporter");
  exporter.ele("Name").txt(String(declaration.consigneeName || ""));
  exporter.ele("Address").txt("");
  exporter.ele("Country_code").txt(String(declaration.exportCountry || ""));

  const importer = traders.ele("Importer");
  importer.ele("Name").txt(String(declaration.declarantName || ""));
  importer.ele("TRN").txt(String(declaration.declarantTrn || ""));

  // Declarant
  const decl = prop.ele("Declarant");
  decl.ele("Name").txt(String(declaration.declarantName || ""));
  decl.ele("Code").txt(String(declaration.declarantTrn || ""));

  // General Information
  const gen = prop.ele("General_information");
  gen.ele("Regime_type").txt(String(declaration.regimeType || "IM4"));
  gen.ele("Procedure_code").txt(String(declaration.generalProcedureCode || "4000"));
  gen.ele("National_procedure").txt(String(declaration.nationalProcedure || ""));
  gen.ele("Location_of_goods").txt(String(declaration.locationOfGoods || ""));
  gen.ele("Total_packages").txt(String(declaration.totalPackages || "0"));
  gen.ele("Package_type").txt(String(declaration.packageType || "PL"));
  gen.ele("Marks_and_numbers").txt(String(declaration.marksAndNumbers || ""));

  // Transport
  const transport = prop.ele("Transport");
  transport.ele("Mode_of_transport").txt(String(declaration.transportMode || "1"));
  transport.ele("Container_number").txt(String(declaration.containerNumber || ""));
  transport.ele("Place_of_loading").txt(String(declaration.placeOfLoading || ""));
  transport.ele("Country_of_export").txt(String(declaration.exportCountry || ""));
  transport.ele("Country_of_destination").txt(String(declaration.destinationCountry || ""));
  transport.ele("Bill_of_lading").txt(String(declaration.blAwb || ""));
  transport.ele("Manifest_reference").txt(String(declaration.manifestReference || ""));

  // Financial
  const fin = prop.ele("Financial");
  fin.ele("Currency_code").txt(String(declaration.currency || "USD"));
  fin.ele("Exchange_rate").txt(String(declaration.exchangeRate || "1"));
  fin.ele("Mode_of_payment").txt(String(declaration.modeOfPayment || "D"));
  fin.ele("Deferred_payment_ref").txt(String(declaration.deferredPaymentRef || ""));

  // Valuation
  const valuation = prop.ele("Valuation");
  const merchandise = declaration.merchandiseValue != null ? String(declaration.merchandiseValue) : "";
  const insurance = declaration.insuranceValue != null ? String(declaration.insuranceValue) : "";
  const freight = declaration.freightValue != null ? String(declaration.freightValue) : "";
  const total = declaration.invoiceTotal != null ? String(declaration.invoiceTotal) : "";
  valuation.ele("Merchandise_value").txt(merchandise);
  valuation.ele("Insurance").txt(insurance);
  valuation.ele("Freight").txt(freight);
  valuation.ele("Total_invoice_value").txt(total);

  // Items
  for (const item of items) {
    const itemEl = root.ele("Item");

    // Packages
    const pkgs = itemEl.ele("Packages");
    pkgs.ele("Package_type").txt(String(item.packageType || ""));
    pkgs.ele("Package_quantity").txt(String(item.quantity || "1"));

    // Tarification / HS Code
    const tariff = itemEl.ele("Tarification");
    const commodityCode = String(item.normalizedCommodityCode || item.rawHsCode || "");
    tariff.ele("Commodity_code").txt(commodityCode.slice(0, 8));
    if (commodityCode.length > 8) {
      tariff.ele("Precision_1").txt(commodityCode.slice(8, 10));
    }
    if (commodityCode.length > 10) {
      tariff.ele("Precision_2").txt(commodityCode.slice(10, 12));
    }

    // Procedures
    const proc = itemEl.ele("Procedures");
    proc.ele("Procedure_code").txt(String(declaration.generalProcedureCode || "4000"));

    // Supplementary units
    itemEl.ele("Supplementary_units").txt("");

    // Goods description
    itemEl.ele("Goods_description").txt(String(item.commercialDescription || ""));

    // Country of origin
    itemEl.ele("Country_of_origin").txt(String(item.countryOfOrigin || ""));

    // Weight
    const weight = itemEl.ele("Weight");
    weight.ele("Gross_weight_kg").txt(String(item.grossWeightKg || ""));
    weight.ele("Net_weight_kg").txt(String(item.netWeightKg || ""));

    // Item valuation
    const itemVal = itemEl.ele("Item_valuation");
    itemVal.ele("Unit_price").txt(String(item.unitPrice || ""));
    itemVal.ele("Line_value").txt(String(item.lineTotal || ""));

    // (Taxation placeholders left empty intentionally)
    itemEl.ele("Taxation").txt("");
  }

  // Pretty-print
  return root.end({ prettyPrint: true });
}
