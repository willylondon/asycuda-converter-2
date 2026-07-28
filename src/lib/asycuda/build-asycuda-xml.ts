import { create } from "xmlbuilder2";
import type { DeclarationDraft } from "./declaration-draft";

interface XmlNode {
  ele(name: string): XmlNode;
  txt(value: string): XmlNode;
  up(): XmlNode;
  end(options?: { prettyPrint?: boolean }): string;
}

function text(parent: XmlNode, name: string, value: string | number | null | undefined, nullElement = true): XmlNode {
  const element = parent.ele(name);
  if (value == null || value === "") {
    if (nullElement) element.ele("null").up();
  } else {
    element.txt(String(value));
  }
  return element.up();
}

function empty(parent: XmlNode, name: string): XmlNode {
  return parent.ele(name).up();
}

function addCurrencyBlock(parent: XmlNode, name: string, amount: string | null, currency: string | null, rate: string | null): void {
  const block = parent.ele(name);
  empty(block, "Amount_national_currency");
  text(block, "Amount_foreign_currency", amount, false);
  text(block, "Currency_code", currency);
  text(block, "Currency_name", null);
  text(block, "Currency_rate", rate, false);
  block.up();
}

function totalForms(itemCount: number): number {
  if (itemCount <= 1) return 1;
  return 1 + Math.ceil((itemCount - 1) / 3);
}

function addBlankAssessment(root: XmlNode): void {
  const assessment = root.ele("Assessment_notice");
  empty(assessment, "Registration_year");
  empty(assessment, "Assessment_year");
  empty(assessment, "Total_item_taxes");
  text(assessment, "Statement_number", null);
  empty(assessment, "Statement_date");
  text(assessment, "Statement_serial", null);
  empty(assessment, "Items_taxes");
  empty(assessment, "Global_taxes");
  assessment.up();
}

function addItem(root: XmlNode, draft: DeclarationDraft, item: DeclarationDraft["items"][number]): void {
  const line = root.ele("Item");

  const packages = line.ele("Packages");
  text(packages, "Number_of_packages", item.packageCount, false);
  text(packages, "Marks1_of_packages", draft.declaration.marksAndNumbers);
  text(packages, "Marks2_of_packages", null);
  text(packages, "Kind_of_packages_code", item.packageType || draft.declaration.packageCode);
  text(packages, "Kind_of_packages_name", draft.declaration.packageName);
  packages.up();

  const incoterms = line.ele("IncoTerms");
  text(incoterms, "Code", draft.shipment.deliveryTermCode);
  text(incoterms, "Place", draft.shipment.placeOfLoadingName);
  incoterms.up();

  const tariff = line.ele("Tarification");
  text(tariff, "Tarification_data", null);
  const hs = tariff.ele("HScode");
  text(hs, "Commodity_code", item.normalizedCommodityCode);
  text(hs, "Precision_1", item.precision1);
  text(hs, "Precision_2", item.precision2);
  text(hs, "Precision_3", item.precision3);
  text(hs, "Precision_4", item.precision4);
  hs.up();
  text(tariff, "Preference_code", null);
  text(tariff, "Extended_customs_procedure", draft.declaration.extendedProcedure);
  text(tariff, "National_customs_procedure", draft.declaration.nationalProcedure);
  const quota = tariff.ele("Quota");
  text(quota, "QuotaCode", null);
  quota.up();

  const supplementary = tariff.ele("Supplementary_unit");
  text(supplementary, "Supplementary_unit_rank", 1, false);
  text(supplementary, "Suppplementary_unit_code", item.unitOfMeasure);
  text(supplementary, "Suppplementary_unit_name", null);
  text(supplementary, "Suppplementary_unit_quantity", item.statisticalQuantity, false);
  supplementary.up();
  for (const rank of [2, 3]) {
    const blankUnit = tariff.ele("Supplementary_unit");
    text(blankUnit, "Supplementary_unit_rank", rank, false);
    text(blankUnit, "Suppplementary_unit_code", null);
    text(blankUnit, "Suppplementary_unit_name", null);
    empty(blankUnit, "Suppplementary_unit_quantity");
    blankUnit.up();
  }
  text(tariff, "Valuation_method_code", null);
  text(tariff, "A.I._code", null);
  tariff.up();

  const goods = line.ele("Goods_description");
  text(goods, "Country_of_origin_code", item.countryOfOrigin);
  text(goods, "Country_of_origin_region", null);
  text(goods, "Description_of_goods", item.commercialDescription);
  text(goods, "Commercial_Description", item.commercialDescription);
  goods.up();

  const previous = line.ele("Previous_doc");
  text(previous, "Summary_declaration", draft.shipment.manifestReference);
  text(previous, "Summary_declaration_sl", null);
  text(previous, "Previous_document_reference", draft.shipment.billOfLading);
  text(previous, "Previous_warehouse_code", null);
  previous.up();

  text(line, "Licence_number", null);
  empty(line, "Amount_deducted_from_licence");
  empty(line, "Quantity_deducted_from_licence");
  text(line, "Free_text_1", item.articleNumber);
  text(line, "Free_text_2", null);

  const taxation = line.ele("Taxation");
  empty(taxation, "Item_taxes_amount");
  empty(taxation, "Item_taxes_guaranted_amount");
  text(taxation, "Item_taxes_mode_of_payment", null);
  empty(taxation, "Counter_of_normal_mode_of_payment");
  empty(taxation, "Displayed_item_taxes_amount");
  taxation.up();

  const valuation = line.ele("Valuation_item");
  const weight = valuation.ele("Weight_itm");
  text(weight, "Gross_weight_itm", item.grossWeightKg, false);
  text(weight, "Net_weight_itm", item.netWeightKg, false);
  weight.up();
  empty(valuation, "Total_cost_itm");
  empty(valuation, "Total_CIF_itm");
  empty(valuation, "Rate_of_adjustement");
  empty(valuation, "Statistical_value");
  empty(valuation, "Alpha_coeficient_of_apportionment");
  addCurrencyBlock(valuation, "Item_Invoice", item.lineTotal?.toString() ?? null, draft.invoice.currency, draft.invoice.exchangeRate);
  addCurrencyBlock(valuation, "item_external_freight", null, draft.invoice.currency, draft.invoice.exchangeRate);
  addCurrencyBlock(valuation, "item_internal_freight", null, draft.invoice.currency, draft.invoice.exchangeRate);
  addCurrencyBlock(valuation, "item_insurance", null, draft.invoice.currency, draft.invoice.exchangeRate);
  addCurrencyBlock(valuation, "item_other_cost", null, draft.invoice.currency, draft.invoice.exchangeRate);
  addCurrencyBlock(valuation, "item_deduction", null, draft.invoice.currency, draft.invoice.exchangeRate);
  const market = valuation.ele("Market_valuer");
  empty(market, "Rate");
  text(market, "Currency_code", null);
  empty(market, "Currency_amount");
  text(market, "Basis_description", null);
  empty(market, "Basis_amount");
  market.up();
  valuation.up();

  line.up();
}

/** Build a well-formed, escaped test ASYCUDA XML document. */
export function buildAsycudaXml(draft: DeclarationDraft): string {
  const includedItems = draft.items.filter((item) => item.includeInXml !== false);
  const root = create({ version: "1.0", encoding: "UTF-8", standalone: false }).ele("ASYCUDA") as unknown as XmlNode;

  const exportRelease = root.ele("Export_release");
  empty(exportRelease, "Date_of_exit");
  empty(exportRelease, "Time_of_exit");
  text(exportRelease, "Actual_office_of_exit_code", null);
  text(exportRelease, "Actual_office_of_exit_name", null);
  text(exportRelease, "Exit_reference", null);
  text(exportRelease, "Comments", null);
  exportRelease.up();
  addBlankAssessment(root);

  const property = root.ele("Property");
  text(property, "Sad_flow", "I", false);
  const forms = property.ele("Forms");
  text(forms, "Number_of_the_form", 1, false);
  text(forms, "Total_number_of_forms", totalForms(includedItems.length), false);
  forms.up();
  const numbers = property.ele("Nbers");
  empty(numbers, "Number_of_loading_lists");
  text(numbers, "Total_number_of_items", includedItems.length, false);
  text(numbers, "Total_number_of_packages", draft.declaration.totalPackages, false);
  numbers.up();
  text(property, "Place_of_declaration", draft.declaration.customsOfficeName);
  empty(property, "Date_of_declaration");
  text(property, "Selected_page", 1, false);
  property.up();

  const identification = root.ele("Identification");
  const office = identification.ele("Office_segment");
  text(office, "Customs_clearance_office_code", draft.declaration.customsOfficeCode);
  text(office, "Customs_Clearance_office_name", draft.declaration.customsOfficeName);
  office.up();
  const type = identification.ele("Type");
  text(type, "Type_of_declaration", draft.declaration.declarationType);
  text(type, "Declaration_gen_procedure_code", draft.declaration.generalProcedureCode);
  text(type, "Type_of_transit_document", null);
  type.up();
  text(identification, "Manifest_reference_number", draft.shipment.manifestReference);
  for (const name of ["Registration", "Assessment", "receipt"]) {
    const block = identification.ele(name);
    text(block, "Serial_number", null);
    empty(block, "Number");
    empty(block, "Date");
    block.up();
  }
  identification.up();

  const traders = root.ele("Traders");
  const exporter = traders.ele("Exporter");
  text(exporter, "Exporter_code", draft.seller.exporterCode);
  text(exporter, "Exporter_name", draft.seller.name);
  exporter.up();
  const consignee = traders.ele("Consignee");
  text(consignee, "Consignee_code", draft.consignee.trn);
  text(consignee, "Consignee_name", draft.consignee.name);
  consignee.up();
  const financialTrader = traders.ele("Financial");
  text(financialTrader, "Financial_code", draft.responsibleParty.code);
  text(financialTrader, "Financial_name", draft.responsibleParty.name);
  financialTrader.up();
  traders.up();

  const declarant = root.ele("Declarant");
  text(declarant, "Declarant_code", draft.declaration.declarantCode);
  text(declarant, "Declarant_name", draft.declaration.declarantName);
  text(declarant, "Declarant_representative", draft.declaration.declarantRepresentative);
  const reference = declarant.ele("Reference");
  text(reference, "Year", draft.commercialReference.year, false);
  text(reference, "Number", draft.commercialReference.number);
  reference.up();
  declarant.up();

  const general = root.ele("General_information");
  const country = general.ele("Country");
  text(country, "Country_first_destination", draft.declaration.destinationCountry);
  text(country, "Trading_country", draft.declaration.exportCountry);
  const exportCountry = country.ele("Export");
  text(exportCountry, "Export_country_code", draft.declaration.exportCountry);
  text(exportCountry, "Export_country_name", draft.declaration.exportCountryName);
  text(exportCountry, "Export_country_region", null);
  exportCountry.up();
  const destination = country.ele("Destination");
  text(destination, "Destination_country_code", draft.declaration.destinationCountry);
  text(destination, "Destination_country_name", draft.declaration.destinationCountryName);
  text(destination, "Destination_country_region", null);
  destination.up();
  text(country, "Country_of_origin_name", draft.declaration.defaultCountryOfOrigin);
  country.up();
  text(general, "Value_details", 0, false);
  text(general, "CAP", null);
  text(general, "Additional_information", null);
  text(general, "Comments_free_text", "TEST ASYCUDA XML — IMPORT COMPATIBILITY NOT YET VERIFIED");
  general.up();

  const transport = root.ele("Transport");
  const means = transport.ele("Means_of_transport");
  const departure = means.ele("Departure_arrival_information");
  text(departure, "Identity", draft.shipment.vessel);
  text(departure, "Nationality", draft.seller.countryCode);
  departure.up();
  const borderInfo = means.ele("Border_information");
  text(borderInfo, "Identity", draft.shipment.vessel);
  text(borderInfo, "Nationality", draft.seller.countryCode);
  text(borderInfo, "Mode", draft.shipment.transportMode);
  borderInfo.up();
  text(means, "Inland_mode_of_transport", draft.shipment.transportMode);
  means.up();
  text(transport, "Container_flag", draft.declaration.containerFlag ? "true" : "false", false);
  const delivery = transport.ele("Delivery_terms");
  text(delivery, "Code", draft.shipment.deliveryTermCode);
  text(delivery, "Place", draft.shipment.placeOfLoadingName);
  text(delivery, "Situation", null);
  delivery.up();
  const borderOffice = transport.ele("Border_office");
  text(borderOffice, "Code", draft.shipment.borderOfficeCode);
  text(borderOffice, "Name", draft.shipment.borderOfficeName);
  borderOffice.up();
  const loading = transport.ele("Place_of_loading");
  text(loading, "Code", draft.shipment.placeOfLoadingCode);
  text(loading, "Name", draft.shipment.placeOfLoadingName);
  text(loading, "Country", draft.declaration.exportCountry);
  loading.up();
  text(transport, "Location_of_goods", draft.shipment.locationOfGoods);
  transport.up();

  const financial = root.ele("Financial");
  const transaction = financial.ele("Financial_transaction");
  text(transaction, "code1", null);
  text(transaction, "code2", null);
  transaction.up();
  const bank = financial.ele("Bank");
  for (const name of ["Code", "Name", "Branch", "Reference"]) text(bank, name, null);
  bank.up();
  const terms = financial.ele("Terms");
  text(terms, "Code", draft.shipment.deliveryTermCode);
  text(terms, "Description", draft.shipment.deliveryTermRaw);
  terms.up();
  text(financial, "Total_invoice", draft.invoice.totalValue, false);
  text(financial, "Deffered_payment_reference", draft.declaration.deferredPaymentRef);
  text(financial, "Mode_of_payment", draft.declaration.modeOfPayment);
  const amounts = financial.ele("Amounts");
  empty(amounts, "Total_manual_taxes");
  empty(amounts, "Global_taxes");
  empty(amounts, "Totals_taxes");
  amounts.up();
  const guarantee = financial.ele("Guarantee");
  text(guarantee, "Name", null);
  text(guarantee, "Amount", 0, false);
  empty(guarantee, "Date");
  const excluded = guarantee.ele("Excluded_country");
  text(excluded, "Code", null);
  text(excluded, "Name", null);
  excluded.up();
  guarantee.up();
  financial.up();

  const warehouse = root.ele("Warehouse");
  text(warehouse, "Identification", null);
  empty(warehouse, "Delay");
  warehouse.up();

  const transit = root.ele("Transit");
  const principal = transit.ele("Principal");
  text(principal, "Code", null);
  text(principal, "Name", null);
  text(principal, "Representative", null);
  principal.up();
  const signature = transit.ele("Signature");
  text(signature, "Place", null);
  empty(signature, "Date");
  signature.up();
  const transitDestination = transit.ele("Destination");
  text(transitDestination, "Office", null);
  text(transitDestination, "Country", null);
  transitDestination.up();
  const seals = transit.ele("Seals");
  empty(seals, "Number");
  text(seals, "Identity", draft.shipment.sealNumber);
  seals.up();
  text(transit, "Result_of_control", null);
  empty(transit, "Time_limit");
  text(transit, "Officer_name", null);
  transit.up();

  const valuation = root.ele("Valuation");
  text(valuation, "Calculation_working_mode", 0, false);
  const weight = valuation.ele("Weight");
  text(weight, "Gross_weight", draft.shipment.grossWeightKg, false);
  weight.up();
  text(valuation, "Total_cost", 0, false);
  empty(valuation, "Total_CIF");
  addCurrencyBlock(valuation, "Gs_Invoice", draft.invoice.totalValue, draft.invoice.currency, draft.invoice.exchangeRate);
  addCurrencyBlock(valuation, "Gs_external_freight", draft.invoice.freightValue, draft.invoice.currency, draft.invoice.exchangeRate);
  addCurrencyBlock(valuation, "Gs_internal_freight", null, draft.invoice.currency, draft.invoice.exchangeRate);
  addCurrencyBlock(valuation, "Gs_insurance", draft.invoice.insuranceValue, draft.invoice.currency, draft.invoice.exchangeRate);
  addCurrencyBlock(valuation, "Gs_other_cost", null, draft.invoice.currency, draft.invoice.exchangeRate);
  addCurrencyBlock(valuation, "Gs_deduction", null, draft.invoice.currency, draft.invoice.exchangeRate);
  const totals = valuation.ele("Total");
  text(totals, "Total_invoice", draft.invoice.totalValue, false);
  text(totals, "Total_weight", includedItems.reduce((sum, item) => sum + (item.grossWeightKg ?? 0), 0), false);
  totals.up();
  valuation.up();

  for (const item of includedItems) addItem(root, draft, item);

  const xml = root.end({ prettyPrint: true });
  return xml.replace(">\n<ASYCUDA>", ">\n<!-- Tax calculations are not included in this MVP. TEST ASYCUDA XML — IMPORT COMPATIBILITY NOT YET VERIFIED. -->\n<ASYCUDA>");
}
