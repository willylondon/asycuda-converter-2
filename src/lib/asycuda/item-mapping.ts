import type { DeclarationDraft } from "./declaration-draft";
import type { EditableLineItem } from "./types";

const ITEM_TEMPLATE = `<Item>
<Packages>
<Number_of_packages/>
<Marks1_of_packages><null/></Marks1_of_packages>
<Marks2_of_packages><null/></Marks2_of_packages>
<Kind_of_packages_code><null/></Kind_of_packages_code>
<Kind_of_packages_name><null/></Kind_of_packages_name>
</Packages>
<IncoTerms>
<Code><null/></Code>
<Place><null/></Place>
</IncoTerms>
<Tarification>
<Tarification_data><null/></Tarification_data>
<HScode>
<Commodity_code><null/></Commodity_code>
<Precision_1><null/></Precision_1>
<Precision_2><null/></Precision_2>
<Precision_3><null/></Precision_3>
<Precision_4><null/></Precision_4>
</HScode>
<Preference_code><null/></Preference_code>
<Extended_customs_procedure><null/></Extended_customs_procedure>
<National_customs_procedure><null/></National_customs_procedure>
<Quota><QuotaCode><null/></QuotaCode></Quota>
<Supplementary_unit>
<Supplementary_unit_rank>1</Supplementary_unit_rank>
<Suppplementary_unit_code>NMB</Suppplementary_unit_code>
<Suppplementary_unit_name>Number</Suppplementary_unit_name>
<Suppplementary_unit_quantity/>
</Supplementary_unit>
<Supplementary_unit>
<Supplementary_unit_rank>2</Supplementary_unit_rank>
<Suppplementary_unit_code><null/></Suppplementary_unit_code>
<Suppplementary_unit_name><null/></Suppplementary_unit_name>
<Suppplementary_unit_quantity/>
</Supplementary_unit>
<Supplementary_unit>
<Supplementary_unit_rank>3</Supplementary_unit_rank>
<Suppplementary_unit_code><null/></Suppplementary_unit_code>
<Suppplementary_unit_name><null/></Suppplementary_unit_name>
<Suppplementary_unit_quantity/>
</Supplementary_unit>
<Valuation_method_code><null/></Valuation_method_code>
<A.I._code><null/></A.I._code>
</Tarification>
<Goods_description>
<Country_of_origin_code><null/></Country_of_origin_code>
<Country_of_origin_region><null/></Country_of_origin_region>
<Description_of_goods><null/></Description_of_goods>
<Commercial_Description><null/></Commercial_Description>
</Goods_description>
<Previous_doc>
<Summary_declaration><null/></Summary_declaration>
<Summary_declaration_sl><null/></Summary_declaration_sl>
<Previous_document_reference><null/></Previous_document_reference>
<Previous_warehouse_code><null/></Previous_warehouse_code>
</Previous_doc>
<Licence_number><null/></Licence_number>
<Amount_deducted_from_licence/>
<Quantity_deducted_from_licence/>
<Free_text_1><null/></Free_text_1>
<Free_text_2><null/></Free_text_2>
<Taxation>
<Item_taxes_amount/>
<Item_taxes_guaranted_amount/>
<Item_taxes_mode_of_payment><null/></Item_taxes_mode_of_payment>
<Counter_of_normal_mode_of_payment/>
<Displayed_item_taxes_amount/>
</Taxation>
<Valuation_item>
<Weight_itm>
<Gross_weight_itm/>
<Net_weight_itm/>
</Weight_itm>
<Total_cost_itm/>
<Total_CIF_itm/>
<Rate_of_adjustement/>
<Statistical_value/>
<Alpha_coeficient_of_apportionment/>
<Item_Invoice>
<Amount_national_currency/>
<Amount_foreign_currency/>
<Currency_code><null/></Currency_code>
<Currency_name><null/></Currency_name>
<Currency_rate/>
</Item_Invoice>
<item_external_freight>
<Amount_national_currency/>
<Amount_foreign_currency>0.0</Amount_foreign_currency>
<Currency_code><null/></Currency_code>
<Currency_name><null/></Currency_name>
<Currency_rate/>
</item_external_freight>
<item_internal_freight>
<Amount_national_currency/>
<Amount_foreign_currency>0.0</Amount_foreign_currency>
<Currency_code><null/></Currency_code>
<Currency_name><null/></Currency_name>
<Currency_rate/>
</item_internal_freight>
<item_insurance>
<Amount_national_currency/>
<Amount_foreign_currency>0.0</Amount_foreign_currency>
<Currency_code><null/></Currency_code>
<Currency_name><null/></Currency_name>
<Currency_rate/>
</item_insurance>
<item_other_cost>
<Amount_national_currency/>
<Amount_foreign_currency>0.0</Amount_foreign_currency>
<Currency_code><null/></Currency_code>
<Currency_name><null/></Currency_name>
<Currency_rate/>
</item_other_cost>
<item_deduction>
<Amount_national_currency/>
<Amount_foreign_currency>0.0</Amount_foreign_currency>
<Currency_code><null/></Currency_code>
<Currency_name><null/></Currency_name>
<Currency_rate/>
</item_deduction>
<Market_valuer>
<Rate/>
<Currency_code><null/></Currency_code>
<Currency_amount/>
<Basis_description><null/></Basis_description>
<Basis_amount/>
</Market_valuer>
</Valuation_item>
</Item>`;

const txt = (v: string | number | null | undefined): string => {
  if (v == null || v === "") return "";
  return String(v);
};

const orNull = (v: string | null | undefined): string => {
  if (!v) return "<null/>";
  return v;
};

export function buildItemElements(draft: DeclarationDraft): string {
  const included = draft.items.filter(i => i.includeInXml !== false);
  if (included.length === 0) return "";

  return included.map(item => {
    let xml = ITEM_TEMPLATE;

    const replacements: [string, string][] = [
      // Packages
      ['<Number_of_packages/>', `<Number_of_packages>${txt(item.quantity)}</Number_of_packages>`],
      ['<Marks1_of_packages><null/></Marks1_of_packages>', `<Marks1_of_packages>${orNull(draft.declaration.marksAndNumbers)}</Marks1_of_packages>`],
      ['<Kind_of_packages_code><null/></Kind_of_packages_code>', `<Kind_of_packages_code>${orNull(item.packageType)}</Kind_of_packages_code>`],

      // IncoTerms
      ['<IncoTerms>\n<Code><null/></Code>', `<IncoTerms>\n<Code>${orNull(draft.shipment.deliveryTermCode)}</Code>`],

      // HS Code
      ['<Commodity_code><null/></Commodity_code>', `<Commodity_code>${orNull(item.normalizedCommodityCode)}</Commodity_code>`],
      ['<Precision_1><null/></Precision_1>', `<Precision_1>${orNull(item.precision1)}</Precision_1>`],
      ['<Precision_2><null/></Precision_2>', `<Precision_2>${orNull(item.precision2)}</Precision_2>`],
      ['<Precision_3><null/></Precision_3>', `<Precision_3>${orNull(item.precision3)}</Precision_3>`],
      ['<Precision_4><null/></Precision_4>', `<Precision_4>${orNull(item.precision4)}</Precision_4>`],

      // Procedures
      ['<Extended_customs_procedure><null/></Extended_customs_procedure>', `<Extended_customs_procedure>${orNull(draft.declaration.extendedProcedure)}</Extended_customs_procedure>`],
      ['<National_customs_procedure><null/></National_customs_procedure>', `<National_customs_procedure>${orNull(draft.declaration.nationalProcedure)}</National_customs_procedure>`],

      // Supplementary unit
      ['<Suppplementary_unit_quantity/>', `<Suppplementary_unit_quantity>${txt(item.quantity)}</Suppplementary_unit_quantity>`],

      // Goods description
      ['<Country_of_origin_code><null/></Country_of_origin_code>', `<Country_of_origin_code>${orNull(item.countryOfOrigin)}</Country_of_origin_code>`],
      ['<Description_of_goods><null/></Description_of_goods>', `<Description_of_goods>${orNull(item.commercialDescription)}</Description_of_goods>`],
      ['<Commercial_Description><null/></Commercial_Description>', `<Commercial_Description>${orNull(item.commercialDescription)}</Commercial_Description>`],

      // Previous doc — BL/AWB for Box 40
      ['<Previous_document_reference><null/></Previous_document_reference>', `<Previous_document_reference>${orNull(draft.shipment.billOfLading)}</Previous_document_reference>`],

      // Weights
      ['<Gross_weight_itm/>', `<Gross_weight_itm>${txt(item.grossWeightKg)}</Gross_weight_itm>`],
      ['<Net_weight_itm/>', `<Net_weight_itm>${txt(item.netWeightKg)}</Net_weight_itm>`],

      // Item invoice
      ['<Item_Invoice>\n<Amount_national_currency/>', `<Item_Invoice>\n<Amount_national_currency>${txt(item.lineTotal)}</Item_Invoice>`],
      ['<Amount_foreign_currency/>', `<Amount_foreign_currency>${txt(item.lineTotal)}</Amount_foreign_currency>`],
      ['<Currency_code><null/></Currency_code>\n<Currency_name><null/></Currency_name>\n<Currency_rate/>\n</Item_Invoice>', `<Currency_code>${orNull(draft.invoice.currency)}</Currency_code>\n<Currency_name><null/></Currency_name>\n<Currency_rate>${txt(draft.invoice.exchangeRate)}</Currency_rate>\n</Item_Invoice>`],
    ];

    for (const [from, to] of replacements) {
      xml = xml.replace(from, to);
    }
    return xml;
  }).join("\n");
}
