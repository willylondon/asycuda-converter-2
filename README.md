# ASYCUDA Converter 2

A Next.js application that extracts commercial invoices, supports declaration review, verifies Jamaican tariff codes and generates test ASYCUDA XML for import verification.

> The Invoice-to-ASYCUDA module produces **test ASYCUDA XML**. Import compatibility has not yet been confirmed inside a live Jamaica Customs ASYCUDA declaration. Do not describe the output as certified, customs-approved or guaranteed to import.

## Invoice-to-ASYCUDA MVP

Route: `/invoice-to-xml`

The progressive workflow is:

1. Enter declarant, consignee, manifest, BL/AWB, procedure, office and transport details.
2. Upload a PDF or image, enter data manually, or load the PriceSmart demo.
3. Extract invoice information using Gemini 2.5 Flash with OpenRouter fallback.
4. Review exporter, shipment and invoice values.
5. Review every line item, package count, statistical quantity, origin, weight and value.
6. Verify each item against an official 10-digit Jamaican tariff.
7. Run deterministic validation.
8. Preview and download test ASYCUDA XML.

### Jamaican tariff verification

The tariff reference is the Jamaica Customs Agency **Integrated Tariff Based on HS 2022**, effective February 27, 2026.

The application provides:

- Live server-side verification of any exact 10-digit code through the public Jamaica Trade Information Portal.
- A small checked-in JCA 2026 catalogue for immediate PriceSmart client demonstrations.
- Optional official API support for broad keyword and partial-code searches across the complete catalogue.
- Official tariff descriptions, statistical units and selected duty/tax columns.
- Automatic mapping of the first eight digits to `Commodity_code` and the final two digits to ASYCUDA precision fields.
- Blocking validation when the selected official tariff and the XML commodity/precision fields disagree.
- Links back to the exact official tariff source used for verification.

Exact 10-digit verification does not require private credentials. The application fetches the corresponding public Trade Portal commodity page on the server and extracts its description, rates and units.

The checked-in catalogue remains deliberately limited to the PriceSmart demonstration and test fixtures. Broad description or partial-code search outside those fixtures requires official Jamaica Trade Portal API credentials.

Tariff rates are displayed for broker review only. The application does not calculate final customs liability because liability may depend on valuation, origin, procedure, exemptions, concessions, end-use conditions and other declaration facts.

## AI providers

Primary provider:

```text
Gemini 2.5 Flash
```

Fallback provider:

```text
OpenRouter — Google Gemini 2.5 Flash
```

Kimi and Moonshot are not used.

## Environment variables

Copy `.env.example` to `.env.local`.

```bash
cp .env.example .env.local
```

Google sign-in fails closed unless `ALLOWED_GOOGLE_EMAILS` contains a
comma-separated list of approved addresses. The allowlist is enforced during
sign-in and whenever an existing session is read, so removing an address also
revokes its access.

### Invoice extraction

```env
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
OPENROUTER_API_KEY=
OPENROUTER_MODEL=google/gemini-2.5-flash
AI_PROVIDER_ORDER=gemini,openrouter
```

### Optional broad Jamaican tariff search

```env
JAMAICA_TARIFF_API_TOKEN=
JAMAICA_TARIFF_API_SECRET=
```

These credentials are optional for exact 10-digit verification. They enable broad keyword and partial-code searches through the official API.

The credentials must remain server-side. Never prefix them with `NEXT_PUBLIC_` and never return them through an API response or browser bundle.

## Core safeguards

- One typed `DeclarationDraft` is used through review, validation and XML generation.
- User edits are preserved before moving to validation.
- Manual invoice entry works without an AI provider.
- Product quantity, statistical quantity and package count remain separate.
- Same-HS invoice rows are not merged.
- Printed tariff digits are preserved for audit.
- Each included item requires a verified official 10-digit Jamaican tariff.
- Editing an HS commodity or precision field clears tariff verification.
- XML is generated with `xmlbuilder2` so text is escaped and the document remains well formed.
- Registration, assessment, receipt and calculated tax-result values are not copied from the reference declaration.
- Monetary reconciliation uses integer minor-unit arithmetic.
- XML generation is blocked for missing required declaration fields, unresolved tariffs and invalid item data.

## Development

```bash
git clone https://github.com/willylondon/asycuda-converter-2.git
cd asycuda-converter-2
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000/invoice-to-xml`.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

The production build runs the unit suite before `next build`.

Current automated coverage includes:

- Gemini-first and OpenRouter-fallback configuration.
- HS-code preservation and precision mapping.
- Official Jamaican tariff seed search.
- Public Trade Portal commodity-page parsing.
- Official 10-digit tariff-to-ASYCUDA mapping.
- Tariff-verification blocking rules.
- Decimal-safe invoice reconciliation.
- Party, manifest, commercial-reference and Box 40 mappings.
- XML element order, escaping and included-item handling.
- Blank registration, assessment and receipt fields.

## Production acceptance still required

Before describing the module as production-ready:

1. Process a real commercial invoice through the configured AI providers.
2. Verify all extracted and tariff-classified values with a customs broker.
3. Import a generated XML file into a live ASYCUDA declaration.
4. Confirm the required header and item boxes populate correctly.
5. Record and correct any import error.

Until that acceptance test passes, retain the visible notice:

```text
TEST ASYCUDA XML — IMPORT COMPATIBILITY NOT YET VERIFIED
```

## Deployment rule

Deploy this project only through the Vercel account associated with:

```text
willardwells@gmail.com
```

Do not deploy it through `itsupport@mac`.

## License

MIT © Willy London
