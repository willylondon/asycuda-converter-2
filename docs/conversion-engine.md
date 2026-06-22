# Conversion Engine — ASYCUDA Excel Converter 2.0

## Architecture

The conversion engine transforms Excel delivery manifests into ASYCUDA-compliant XML files through a multi-stage pipeline:

```
Excel File (.xlsx/.xls)
    │
    ▼
[Stage 1] Parse Excel — SheetJS (xlsx) extracts raw data
    │
    ▼
[Stage 2] Validate Structure — check columns, data types, required fields
    │
    ▼
[Stage 3] Validate Content — check individual cell values (dates, numbers, codes)
    │
    ▼
[Stage 4] Map to ASYCUDA Schema — transform Excel columns → ASYCUDA XML elements
    │
    ▼
[Stage 5] Generate XML — produce well-formed, compliant ASYCUDA XML
    │
    ▼
[Stage 6] Validate XML — verify against ASYCUDA XSD schema (future)
    │
    ▼
Output: ASYCUDA XML file (.xml)
```

## Required Excel Columns

| Column | Type | Required | ASYCUDA Mapping |
|--------|------|----------|-----------------|
| Container Number | Text | Yes | `Consignment/ContainerNumber` |
| Bill of Lading | Text | Yes | `Consignment/BillOfLading` |
| Consignee | Text | Yes | `Consignment/Consignee` |
| Description | Text | Yes | `Consignment/Description` |
| Gross Weight | Number | Yes | `Consignment/GrossWeight` |
| Package Count | Number | Yes | `Consignment/PackageCount` |
| Port of Origin | Text (code) | Yes | `Consignment/PortOfOrigin` |
| Port of Destination | Text (code) | Yes | `Consignment/PortOfDestination` |

## Validation Rules

### Column Validation
- All 8 required columns must be present (case-insensitive match)
- Extra columns are ignored (not errors)
- Column order doesn't matter

### Data Type Validation
- **Container Number**: String, max 20 chars, alphanumeric + hyphens
- **Bill of Lading**: String, max 30 chars
- **Gross Weight**: Positive number, max 99,999 kg
- **Package Count**: Positive integer, max 9,999
- **Port Codes**: 3-5 character uppercase alphabetic codes

### Content Validation
- No empty cells in required columns
- No duplicate Bill of Lading numbers
- Dates must be valid and not in the future
- Container numbers must match regex: `^[A-Z0-9-]{4,20}$`

## XML Output Format

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ASYCUDA xmlns="http://www.wcoomd.org/ASYCUDA">
  <Manifest>
    <Header>
      <ManifestNumber>MAN-1719000000</ManifestNumber>
      <Date>2026-06-22</Date>
      <Carrier>{from config or filename}</Carrier>
      <Vessel>{from config}</Vessel>
      <VoyageNumber>{from config}</VoyageNumber>
    </Header>
    <Consignments>
      <Consignment>
        <ContainerNumber>CONT-1234567</ContainerNumber>
        <BillOfLading>BL-98765</BillOfLading>
        <Consignee>Example Corp</Consignee>
        <Description>General Cargo</Description>
        <GrossWeight unit="KG">12500</GrossWeight>
        <PackageCount>42</PackageCount>
        <PortOfOrigin>KIN</PortOfOrigin>
        <PortOfDestination>USMIA</PortOfDestination>
      </Consignment>
      <!-- ... -->
    </Consignments>
  </Manifest>
</ASYCUDA>
```

## Error Handling

- All parsing errors produce human-readable messages (e.g., "Row 14 contains an invalid date")
- The engine never crashes — if one row fails, it reports the error and continues validating remaining rows
- After validation, users see a complete report before conversion proceeds

## Technology

- **SheetJS (xlsx)**: Industry-standard Excel parsing
- **Server-side only**: No Excel processing in the browser
- **In-memory processing**: Files never written to disk