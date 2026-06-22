# Project Context — ASYCUDA Excel Converter 2.0

> 📌 **Purpose**: This document provides AI coding agents with instant project understanding. Read this first before making any changes.

## Business Goals

Build the world's simplest customs document conversion tool. Convert Excel delivery manifests into ASYCUDA-compliant XML in under 60 seconds with zero friction.

**Target Users**: Customs brokers, freight forwarders, logistics companies, import/export businesses

**Market**: Caribbean (Jamaica, Trinidad, Barbados, CARICOM) → Africa → Asia → Global

## Product Overview

A web-based SaaS tool that:
1. Accepts Excel files (drag-drop or browser upload)
2. Validates column structure and data types
3. Generates ASYCUDA-compliant XML
4. Delivers the XML for direct customs submission

**Key differentiators**: Speed (under 60 seconds), security (in-memory processing, no file storage), accessibility (WCAG AA), simplicity (3-step flow).

## Architecture

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4 with `@theme inline`
- **Icons**: Lucide React
- **Excel Parsing**: SheetJS (xlsx) — server-side only
- **Deployment**: Vercel

## Development Standards

### Code Style
- All TypeScript, strict mode
- No `any` types
- Components use function declarations (`export function Foo()`) not arrow functions
- All user-facing strings are plain English, no technical jargon
- Error messages include actionable guidance (e.g., "Column 'Container Number' is missing — add this column to your Excel file")

### Component Rules
- Keep components under 200 lines
- Extract logic into `lib/` or `features/` when it exceeds this
- Use `'use client'` only when needed (state, effects, browser APIs)
- Server components for static content and metadata

### Accessibility (WCAG 2.2 AA)
- Every page has exactly one `<h1>`
- Heading hierarchy is sequential (no skips)
- All interactive elements have visible focus states
- Touch targets are minimum 44px
- Color contrast meets 4.5:1 (normal) / 3:1 (large) thresholds
- Skip-to-content link on every page
- Semantic HTML landmarks (`<header>`, `<main>`, `<footer>`)

### Performance Targets
- Lighthouse Performance: 95+
- Lighthouse Accessibility: 100
- Lighthouse Best Practices: 100
- Lighthouse SEO: 95+
- LCP under 2.5 seconds

### Security
- Never write files to disk (in-memory processing only)
- Validate MIME types, extensions, and file sizes before processing
- No secrets in code — only environment variables
- All external values are sanitized before XML generation

## File Organization

```
src/
├── app/              # Pages (Next.js file-based routing)
├── components/       # Shared components
│   ├── layout/       # Header, Footer
│   ├── ui/           # Button, Container, etc.
│   └── converter/    # Converter-specific components
├── features/         # Feature modules (business logic)
├── lib/              # Utility functions
├── hooks/            # Custom React hooks
└── types/            # TypeScript types/interfaces
```

## Running the Project

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

## Key Files

| File | Purpose |
|------|---------|
| `src/app/globals.css` | Design system (colors, typography, CSS variables) |
| `src/app/layout.tsx` | Root layout (metadata, skip link, header/footer) |
| `src/app/page.tsx` | Homepage |
| `src/app/converter/page.tsx` | Converter page (upload, validation, XML generation) |
| `src/components/layout/Header.tsx` | Navigation bar |
| `src/components/layout/Footer.tsx` | Site footer |
| `docs/` | Full project documentation |

## When Making Changes

1. Read `docs/architecture.md` for system design
2. Read `docs/conversion-engine.md` for the conversion pipeline
3. Read `docs/security.md` for security constraints
4. Check `docs/roadmap.md` for planned features
5. Follow the coding conventions above
6. Verify accessibility isn't broken (heading hierarchy, landmarks, focus states)
7. Run `npm run build` before committing — never commit broken builds