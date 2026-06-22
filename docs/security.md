# Security Architecture — ASYCUDA Excel Converter 2.0

## Security Principles

1. **Zero Trust** — Every file is potentially malicious until validated
2. **Defense in Depth** — Multiple layers of security at every stage
3. **Least Privilege** — Minimal access needed for each operation
4. **Secure by Default** — Safe defaults, opt-in for risky operations

## File Upload Security

### Validation Pipeline

```
Uploaded File
    │
    ▼
[MIME Type Check] — Only application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
                     and application/vnd.ms-excel allowed
    │
    ▼
[Extension Check] — Only .xlsx and .xls
    │
    ▼
[File Size Check] — Max 10MB
    │
    ▼
[Magic Bytes Check] — Verify file header matches claimed MIME type (future enhancement)
    │
    ▼
[Content Validation] — SheetJS parsing, column structure, data types
```

### Upload Limits

| Parameter | Value |
|-----------|-------|
| Max file size | 10 MB |
| Allowed MIME types | 2 (xlsx, xls) |
| Allowed extensions | 2 (.xlsx, .xls) |
| Rate limit | 10/min, 50/hr, 200/day |

## Data Protection

### In-Memory Processing

- Files are parsed entirely in memory using SheetJS
- No temporary files written to disk
- No file contents stored in any database or cache
- Parsed workbook data is garbage-collected after XML generation

### Transport Security

- HTTPS enforced (Vercel + Cloudflare)
- HTTP/3 (QUIC) for reduced latency
- TLS 1.3 minimum

## Security Headers

Set via `next.config.ts`:

| Header | Value |
|--------|-------|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-src https://www.youtube.com; connect-src 'self' https://www.google-analytics.com` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |

## XML Generation Security

- XML output is generated server-side — no client can inject content
- Template-based generation prevents XML injection
- All values are entity-escaped before insertion into XML structure
- No XXE (XML External Entity) risk — we generate XML, we don't parse user-submitted XML

## Payment Security

- All payment processing handled by Stripe
- No card numbers or sensitive payment data touches our servers
- Stripe.js loads securely from Stripe's CDN
- Webhook signatures verified server-side

## Logging & Monitoring

- Conversion events logged (anonymized — file names only, not contents)
- Rate limit violations logged
- No PII logged
- Vercel runtime logs for error monitoring

## Secrets Management

- All secrets in environment variables
- No secrets committed to Git
- `.env.local` in `.gitignore`
- Vercel environment variables for production secrets
- Stripe keys rotated periodically

## Dependencies

- Regular `npm audit` runs
- Dependabot enabled for automated security updates
- Minimal dependency footprint — no jQuery, Bootstrap, or legacy plugins