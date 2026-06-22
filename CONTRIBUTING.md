# Contributing to ASYCUDA Excel Converter 2.0

Thanks for contributing! Here's how to get started.

## Development Setup

```bash
# Clone and install
git clone https://github.com/willylondon/asycuda-converter-2.git
cd asycuda-converter-2
npm install
cp .env.example .env.local
npm run dev
```

## Branch Strategy

- `main` — production branch (deploys to Vercel)
- `feat/*` — feature branches
- `fix/*` — bug fixes
- `docs/*` — documentation updates

Always branch from `main` and PR back to `main`.

## Pull Request Process

1. Create a feature branch
2. Make your changes
3. Run `npm run build` — must pass with no errors
4. Run `npm run lint` — must pass with no warnings
5. Verify accessibility (heading hierarchy, landmarks, focus states)
6. Open a PR with a clear description
7. Vercel creates a preview deployment automatically
8. Review the preview before merging

## Code Standards

- TypeScript strict mode
- No `any` types
- Components as function declarations
- Plain English error messages
- WCAG 2.2 AA compliance on all new pages
- Touch targets ≥ 44px
- Colors from the design system (CSS variables), not hard-coded hex values

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add bulk file upload
fix: correct XML namespace in output
docs: update deployment guide
refactor: extract validation logic to lib/
style: format with Prettier
perf: lazy-load demo video
```

## Getting Help

Open an issue or contact the maintainers.