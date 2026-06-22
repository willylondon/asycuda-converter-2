# Deployment Guide — ASYCUDA Excel Converter 2.0

## Production Deployment (Vercel)

### Prerequisites

- [Vercel account](https://vercel.com)
- [GitHub account](https://github.com)
- [Node.js 20+](https://nodejs.org)

### One-Click Deploy

1. Push the repository to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Vercel auto-detects Next.js — no configuration needed
5. Add environment variables in Vercel dashboard
6. Deploy

### Environment Variables

Set these in **Vercel Dashboard → Settings → Environment Variables**:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SITE_URL` | `https://asycuda-converter.vercel.app` | Production |
| `STRIPE_SECRET_KEY` | (from Stripe dashboard) | Production |
| `STRIPE_WEBHOOK_SECRET` | (from Stripe dashboard) | Production |

### Preview Deployments

Every PR automatically gets a preview deployment. Vercel comments the preview URL on the PR.

### Production Branch

`main` branch deploys to production. Use feature branches + PRs for all changes.

## Manual Deployment

### Build

```bash
npm run build
```

### Start

```bash
npm start
```

The app runs on port 3000 by default.

## Health Check

Visit `/api/health` (to be implemented) for a health check endpoint.

## Rollback

In Vercel Dashboard: **Deployments → Select previous deployment → Promote to Production**

## Custom Domain

1. Add domain in Vercel Dashboard → Domains
2. Update DNS records:
   - CNAME `www` → `cname.vercel-dns.com`
   - A record `@` → Vercel's IP (shown in dashboard)
3. Vercel auto-provisions SSL via Let's Encrypt

## Monitoring

- [Vercel Analytics](https://vercel.com/analytics) — Web Vitals, traffic, errors
- [Vercel Logs](https://vercel.com/docs/observability/logs) — Runtime logs