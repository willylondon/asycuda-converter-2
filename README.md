# ASYCUDA Excel Converter 2.0

Convert Excel delivery manifests into ASYCUDA-compliant XML files in minutes. A modern, fast, and secure customs document conversion platform built with Next.js 15+.

## Features

- **Drag-and-drop upload** — Upload .xlsx or .xls files up to 10MB
- **Instant validation** — Check column structure, data types, and ASYCUDA requirements before conversion
- **ASYCUDA-compliant XML** — Output follows ASYCUDA World requirements and is validated before generation
- **No account required** — Convert files immediately, no registration needed
- **Secure by design** — Files processed in memory, never stored on disk
- **Accessible** — WCAG 2.2 AA compliant with full keyboard navigation
- **Responsive** — Works on desktop, tablet, and mobile devices

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16+ (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Validation | Zod |
| Forms | React Hook Form |
| Excel Parsing | SheetJS (xlsx) |
| Deployment | Vercel |
| Font | Inter (Google Fonts) |

## Quick Start

```bash
# Clone the repository
git clone https://github.com/willylondon/asycuda-converter-2.git
cd asycuda-converter-2

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
asycuda-converter-2/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── converter/        # File upload & conversion
│   │   ├── pricing/          # Pricing plans
│   │   ├── faq/              # Frequently asked questions
│   │   ├── support/          # Support & contact form
│   │   ├── privacy/          # Privacy policy
│   │   ├── terms/            # Terms of service
│   │   ├── contact/          # Contact page
│   │   ├── layout.tsx        # Root layout (metadata, skip-link, header/footer)
│   │   ├── page.tsx          # Homepage
│   │   └── globals.css       # Design system & Tailwind
│   ├── components/
│   │   ├── layout/           # Header, Footer
│   │   ├── ui/               # Reusable UI components
│   │   └── converter/        # Converter-specific components
│   ├── features/
│   │   └── converter/        # Conversion engine logic
│   ├── lib/                  # Utility functions
│   ├── hooks/                # Custom React hooks
│   └── types/                # TypeScript type definitions
├── public/
│   ├── images/               # Static images & OG images
│   └── samples/              # Sample Excel & config files
├── docs/                     # Project documentation
│   ├── architecture.md       # Architecture overview
│   ├── deployment.md         # Deployment guide
│   ├── api.md                # API documentation
│   ├── conversion-engine.md  # Conversion engine details
│   ├── security.md           # Security architecture
│   ├── roadmap.md            # Future development roadmap
│   └── project-context.md    # Project context for AI coding agents
└── tests/                    # Test files
```

## Documentation

- [Architecture](docs/architecture.md)
- [Deployment](docs/deployment.md)
- [API Reference](docs/api.md)
- [Conversion Engine](docs/conversion-engine.md)
- [Security](docs/security.md)
- [Roadmap](docs/roadmap.md)
- [Project Context](docs/project-context.md) (for AI coding agents)

## Environment Variables

See `.env.example` for all required variables.

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SITE_URL` | Production URL | Yes |
| `STRIPE_SECRET_KEY` | Stripe payment processing | For production |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification | For production |

## License

MIT © Willy London