# Google Login Setup

The Invoice-to-ASYCUDA declaration workspace uses the same NextAuth and Google OAuth pattern as Receipts-to-Sheets.

## Application behavior

- `/invoice-to-xml` remains a public product page.
- `/invoice-to-xml/sign-in` provides the app-owned Google login screen.
- `/invoice-to-xml/new` requires a valid Google session.
- Invoice extraction, Jamaican tariff lookup and XML export also require an authenticated server session.
- Sessions use encrypted JWT cookies with a maximum age of 30 days.
- The app requests only `openid email profile`.
- It does not request Google Drive or Google Sheets access.

## Reuse the Receipts-to-Sheets OAuth credentials

Copy these encrypted server-side values from the Receipts-to-Sheets Vercel project into the ASYCUDA Converter Vercel project:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://asycuda-converter-2.vercel.app
```

Do not print, export, commit or expose the values as `NEXT_PUBLIC_*` variables.

Apply the variables to the Production environment. Apply them to Preview only when preview sign-in testing is required.

## Google Cloud OAuth configuration

Open the same OAuth 2.0 Web Client used by Receipts-to-Sheets and add this authorized redirect URI exactly:

```text
https://asycuda-converter-2.vercel.app/api/auth/callback/google
```

For branch-preview testing, also add the stable branch alias only when necessary:

```text
https://asycuda-converter-2-git-feat-d1eb4e-willardwells-7888s-projects.vercel.app/api/auth/callback/google
```

The OAuth consent screen must permit the client's Google account. When the Google OAuth application remains in Testing mode, add the client's Gmail address as a test user.

## Vercel deployment protection

The public Production deployment must not require a Vercel account. Disable Vercel Authentication for the Production deployment or configure Deployment Protection so Production is public while Preview deployments remain protected.

The intended client flow is:

```text
Public ASYCUDA URL
→ Invoice-to-ASYCUDA sign-in page
→ Continue with Google
→ Google consent/account selection
→ Declaration workspace
```

## Verification

After configuration:

1. Open the production URL in an incognito browser where no Vercel account is signed in.
2. Confirm the ASYCUDA sign-in page appears instead of the Vercel login page.
3. Click **Continue with Google**.
4. Confirm Google returns to `/api/auth/callback/google` and then `/invoice-to-xml/new`.
5. Confirm the account name/email and **Sign out** control appear.
6. Confirm unauthenticated calls to extraction, tariff and XML endpoints return HTTP 401.
7. Confirm authenticated calls proceed normally.
