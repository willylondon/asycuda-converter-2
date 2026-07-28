import type { DeclarationDraft } from "./declaration-draft";
import type { EditableLineItem } from "./types";

const txt = (v: string | number | null | undefined): string => {
  if (v == null || v === "") return "";
  return String(v);
};

const orNull = (v: string | null | undefined): string => {
  if (!v) return "<null/>";
  return v;
};

// Field mapping: DeclarationDraft → ASYCUDA XML element
export function applyFieldMappings(draft: DeclarationDraft, xml: string): string {
  const d = draft.declaration;
  const s = draft.seller;
  const c = draft.consignee;
  const r = draft.responsibleParty;
  const sh = draft.shipment;
  const inv = draft.invoice;
  const comref = draft.commercialReference;

  const itemWeightSum = draft.items
    .filter(i => i.includeInXml !== false)
    .reduce((sum, i) => sum + (i.grossWeightKg || 0), 0);

  const replacements: [string, string][] = [
    // Property
    ['<Total_number_of_items/>', `<Total_number_of_items>${draft.items.filter(i=>i.includeInXml!==false).length}</Total_number_of_items>`],
    ['<Total_number_of_packages/>', `<Total_number_of_packages>${txt(d.totalPackages)}</Total_number_of_packages>`],

    // Identification
    ['<Customs_clearance_office_code><null/></Customs_clearance_office_code>', `<Customs_clearance_office_code>${orNull(d.customsOfficeCode)}</Customs_clearance_office_code>`],
    ['<Customs_Clearance_office_name><null/></Customs_Clearance_office_name>', `<Customs_Clearance_office_name>${orNull(d.customsOfficeName)}</Customs_Clearance_office_name>`],
    ['<Type_of_declaration><null/></Type_of_declaration>', `<Type_of_declaration>${orNull(d.declarationType)}</Type_of_declaration>`],
    ['<Declaration_gen_procedure_code><null/></Declaration_gen_procedure_code>', `<Declaration_gen_procedure_code>${orNull(d.generalProcedureCode)}</Declaration_gen_procedure_code>`],
    ['<Manifest_reference_number><null/></Manifest_reference_number>', `<Manifest_reference_number>${orNull(sh.manifestReference)}</Manifest_reference_number>`],

    // Traders
    ['<Exporter_code><null/></Exporter_code>', `<Exporter_code>${orNull(s.exporterCode)}</Exporter_code>`],
    ['<Exporter_name><null/></Exporter_name>', `<Exporter_name>${orNull(s.name)}</Exporter_name>`],
    ['<Consignee_code><null/></Consignee_code>', `<Consignee_code>${orNull(c.trn)}</Consignee_code>`],
    ['<Consignee_name><null/></Consignee_name>', `<Consignee_name>${orNull(c.name)}</Consignee_name>`],
    ['<Financial_code><null/></Financial_code>', `<Financial_code>${orNull(r.code)}</Financial_code>`],
    ['<Financial_name><null/></Financial_name>', `<Financial_name>${orNull(r.name)}</Financial_name>`],

    // Declarant
    ['<Declarant_code><null/></Declarant_code>', `<Declarant_code>${orNull(d.declarantCode)}</Declarant_code>`],
    ['<Declarant_name><null/></Declarant_name>', `<Declarant_name>${orNull(d.declarantName)}</Declarant_name>`],
    ['<Declarant_representative><null/></Declarant_representative>', `<Declarant_representative>${orNull(d.declarantRepresentative)}</Declarant_representative>`],
    ['<Year/>', `<Year>${txt(comref.year)}</Year>`],
    ['<Number><null/></Number>', `<Number>${orNull(comref.number)}</Number>`],

    // General_information
    ['<Export_country_code><null/></Export_country_code>', `<Export_country_code>${orNull(d.exportCountry)}</Export_country_code>`],
    ['<Export_country_name><null/></Export_country_name>', `<Export_country_name>${orNull(d.exportCountryName)}</Export_country_name>`],
    ['<Destination_country_code><null/></Destination_country_code>', `<Destination_country_code>${orNull(d.destinationCountry)}</Destination_country_code>`],
    ['<Destination_country_name><null/></Destination_country_name>', `<Destination_country_name>${orNull(d.destinationCountryName)}</Destination_country_name>`],
    ['<Country_of_origin_name><null/></Country_of_origin_name>', `<Country_of_origin_name>${orNull(d.defaultCountryOfOrigin)}</Country_of_origin_name>`],

    // Transport
    ['<Departure_arrival_information>\n<Identity><null/></Identity>', `<Departure_arrival_information>\n<Identity>${orNull(sh.vessel)}</Identity>`],
    ['<Container_flag>false</Container_flag>', `<Container_flag>${d.containerFlag ? "true" : "false"}</Container_flag>`],
    ['<Delivery_terms>\n<Code><null/></Code>', `<Delivery_terms>\n<Code>${orNull(sh.deliveryTermCode)}</Code>`],
    ['<Border_office>\n<Code><null/></Code>', `<Border_office>\n<Code>${orNull(d.borderOfficeCode)}</Code>`],
    ['<Border_office>\n<Code><null/></Code>\n<Name><null/></Name>', `<Border_office>\n<Code>${orNull(d.borderOfficeCode)}</Code>\n<Name>${orNull(d.borderOfficeName)}</Name>`],
    ['<Place_of_loading>\n<Code><null/></Code>', `<Place_of_loading>\n<Code>${orNull(d.placeOfLoadingCode)}</Code>`],
    ['<Place_of_loading>\n<Code><null/></Code>\n<Name><null/></Name>', `<Place_of_loading>\n<Code>${orNull(d.placeOfLoadingCode)}</Code>\n<Name>${orNull(d.placeOfLoadingName)}</Name>`],
    ['<Location_of_goods><null/></Location_of_goods>', `<Location_of_goods>${orNull(d.locationOfGoods)}</Location_of_goods>`],

    // Financial
    ['<Total_invoice/>', `<Total_invoice>${txt(inv.totalValue)}</Total_invoice>`],
    ['<Deffered_payment_reference><null/></Deffered_payment_reference>', `<Deffered_payment_reference>${orNull(d.deferredPaymentRef)}</Deffered_payment_reference>`],
    ['<Mode_of_payment><null/></Mode_of_payment>', `<Mode_of_payment>${orNull(d.modeOfPayment)}</Mode_of_payment>`],

    // Valuation
    ['<Gs_Invoice>\n<Amount_national_currency/>', `<Gs_Invoice>\n<Amount_national_currency>${txt(inv.totalValue)}</Amount_national_currency>`],
    ['<Gs_Invoice>\n<Amount_national_currency/>\n<Amount_foreign_currency/>', `<Gs_Invoice>\n<Amount_national_currency>${txt(inv.totalValue)}</Amount_national_currency>\n<Amount_foreign_currency>${txt(inv.totalValue)}</Amount_foreign_currency>`],
    ['<Currency_code><null/></Currency_code>\n<Currency_name><null/></Currency_name>\n<Currency_rate/>\n</Gs_Invoice>', `<Currency_code>${orNull(inv.currency)}</Currency_code>\n<Currency_name><null/></Currency_name>\n<Currency_rate>${txt(inv.exchangeRate)}</Currency_rate>\n</Gs_Invoice>`],
    ['<Gs_external_freight>\n<Amount_national_currency/>', `<Gs_external_freight>\n<Amount_national_currency>${txt(inv.freightValue)}</Amount_national_currency>`],
    ['<Gs_external_freight>\n<Amount_national_currency/>\n<Amount_foreign_currency/>', `<Gs_external_freight>\n<Amount_national_currency>${txt(inv.freightValue)}</Amount_national_currency>\n<Amount_foreign_currency>${txt(inv.freightValue)}</Amount_foreign_currency>`],
    ['<Gs_insurance>\n<Amount_national_currency/>', `<Gs_insurance>\n<Amount_national_currency>${txt(inv.insuranceValue)}</Amount_national_currency>`],
    ['<Gs_insurance>\n<Amount_national_currency/>\n<Amount_foreign_currency/>', `<Gs_insurance>\n<Amount_national_currency>${txt(inv.insuranceValue)}</Amount_national_currency>\n<Amount_foreign_currency>${txt(inv.insuranceValue)}</Amount_foreign_currency>`],
    ['<Total_invoice/>\n<Total_weight/>\n</Total>', `<Total_invoice>${txt(inv.totalValue)}</Total_invoice>\n<Total_weight>${itemWeightSum.toFixed(1)}</Total_weight>\n</Total>`],
  ];

  let result = xml;
  for (const [from, to] of replacements) {
    result = result.replace(from, to);
  }
  return result;
}
