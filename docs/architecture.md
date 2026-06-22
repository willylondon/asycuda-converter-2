# Architecture — ASYCUDA Excel Converter 2.0

## Overview

The ASYCUDA Excel Converter is a **server-rendered Next.js application** using the App Router. It follows a **feature-based architecture** where each domain concern (conversion, payment, upload) is isolated into its own feature module with clear boundaries.

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│                  Browser                      │
│  ┌─────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Upload  │  │Validate  │  │  Download   │  │
│  �────┬────┘  └────┬─────┘  └─────┬──────┘  │
│       │            │              │          │
├───────┼────────────┼──────────────┼──────────┤
│       ▼            ▼              ▼          │
│  ┌──────────────────────────────────────┐   │
│  │         Next.js App Router            │   │
│  │  ┌──────────┐  ┌──────────────────┐  │   │
│  │  │  Server   │  │  Client          │  │   │
│  │  │ Components│  │  Components      │  │   │
│  │  │ (RSC)     │  │  ('use client')  │  │   │
│  │  └─────┬─────┘  └────────┬─────────┘  │   │
│  │        │                 │             │   │
│  │  ┌─────▼─────────────────▼──────────┐  │   │
│  │  │       Feature Modules             │  │   │
│  │  │  upload │ validation │ xml-gen   │  │   │
│  │  └──────────────────────────────────┘  │   │
│  │                   │                     │   │
│  │           ┌───────▼────────┐            │   │
│  │           │   Zod Schemas   │            │   │
│  │           │  (type safety)  │            │   │
│  │           └─────────────────┘            │   │
│  └──────────────────────────────────────┘   │
│                    │                        │
│                    ▼                        │
│         ┌──────────────────┐                │
│         │   Stripe (payment)│ (future)      │
│         └──────────────────┘                │
└─────────────────────────────────────────────┘
```

## Key Architectural Decisions

### 1. Feature-Based Organization

```
features/
  converter/
    schemas.ts         # Zod schemas for validation
    engine.ts          # Core conversion logic
    utils.ts           # Helper functions
  payment/
    stripe.ts          # Stripe integration (future)
```

Each feature is self-contained. Dependencies flow inward — features don't import from other features directly.

### 2. Client/Server Boundary

- **Server Components (RSC)**: Page metadata, SEO, initial data loading
- **Client Components**: File upload, drag-and-drop, interactive validation UI
- **Server Actions**: File processing and XML generation

### 3. Type Safety

- Strict TypeScript (`strict: true`)
- Zod schemas for all runtime validation (file types, Excel data, XML output)
- No `any` types — everything is typed

### 4. Styling

- Tailwind CSS v4 with `@theme inline` for CSS variables
- No CSS-in-JS runtime
- Design tokens in `globals.css` as single source of truth

### 5. State Management

- React state for UI state (upload progress, validation status)
- No global state library needed — the converter is a single-page interactive flow

## Data Flow

```
User Excel File
      │
      ▼
[Client] File selection (drag-drop or browser)
      │
      ▼
[Client] MIME + extension + size validation
      │
      ▼
[Server Action] Parse Excel with xlsx
      │
      ▼
[Server Action] Validate structure (columns, types, required fields)
      │
      ▼
[Server Action] Generate Validation Report → stream back to client
      │
      ▼
[Client] Display validation results
      │
      ▼
[Server Action] Convert to ASYCUDA XML
      │
      ▼
[Client] Display XML preview, enable download
```

## Performance Strategy

- **Lazy loading**: Demo video loads on click, not on page load
- **Dynamic imports**: Heavy processing modules loaded only when needed
- **Server-side processing**: Excel parsing runs server-side, not in browser
- **Minimal JavaScript**: No framework soup — just React + Tailwind + Lucide