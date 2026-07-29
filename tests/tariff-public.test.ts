import { describe, expect, it } from "vitest";
import { parseTradePortalCommodityPage } from "@/lib/tariff/jamaica-tariff";

const PAGE_FIXTURE = `
<script>
  const tree = "[{\\"id\\":\\"0714200010\\",\\"parent\\":\\"071420\\",\\"text\\":\\"0714200010: Sweet potatoes, fresh or naturally dried\\",\\"type\\":\\"file\\"}]";
</script>
<table id="datatable_tariff">
  <tbody>
    <tr><td>1</td><td>ID-01</td><td>Import Duty</td><td>Import</td><td>40.00%</td><td>kg</td><td>2018-10-17</td><td>9999-12-31</td></tr>
    <tr><td>2</td><td>ASD05</td><td>Additional Stamp Duty</td><td>Import</td><td>-</td><td>kg</td><td>2018-10-17</td><td>9999-12-31</td></tr>
    <tr><td>3</td><td>GCT 06</td><td>General Consumption Tax</td><td>Import</td><td>15%</td><td>kg</td><td>2018-10-17</td><td>9999-12-31</td></tr>
    <tr><td>8</td><td>SCF90</td><td>Standard Compliance Fee</td><td>Import</td><td>0.30%</td><td>kg</td><td>2018-10-17</td><td>9999-12-31</td></tr>
    <tr><td>9</td><td>ENVL20</td><td>Environmental Levy</td><td>Import</td><td>0.50%</td><td>kg</td><td>2018-10-17</td><td>9999-12-31</td></tr>
  </tbody>
</table>`;

describe("public Jamaica Trade Portal parser", () => {
  it("extracts description, units and tariff rates from a commodity page", () => {
    const entry = parseTradePortalCommodityPage(PAGE_FIXTURE, "0714200010");
    expect(entry).not.toBeNull();
    expect(entry?.code).toBe("0714200010");
    expect(entry?.description).toBe("Sweet potatoes, fresh or naturally dried");
    expect(entry?.units).toEqual(["kg"]);
    expect(entry?.rates.importDuty).toBe("40.00%");
    expect(entry?.rates.gct).toBe("15%");
    expect(entry?.rates.standardComplianceFee).toBe("0.30%");
    expect(entry?.rates.environmentalLevy).toBe("0.50%");
    expect(entry?.source).toBe("jamaica-trade-portal-public");
  });

  it("rejects an invalid or incomplete commodity page", () => {
    expect(parseTradePortalCommodityPage("not a tariff page", "0714200010")).toBeNull();
    expect(parseTradePortalCommodityPage(PAGE_FIXTURE, "07142000")).toBeNull();
  });
});
