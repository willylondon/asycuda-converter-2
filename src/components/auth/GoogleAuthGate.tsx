"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { FileCheck2, LogOut, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

function GoogleMark() {
  return (
    <span
      aria-hidden="true"
      className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-base font-bold text-[#4285F4] shadow-sm"
    >
      G
    </span>
  );
}

function LoginCard() {
  return (
    <div className="mx-auto flex min-h-[68vh] max-w-lg items-center px-4 py-12 sm:px-6">
      <section className="w-full rounded-3xl border border-border bg-surface p-7 shadow-xl sm:p-10">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <FileCheck2 className="h-7 w-7" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-accent">
          Invoice-to-ASYCUDA
        </p>
        <h1 className="mt-2 text-3xl font-bold text-text">Sign in to your declaration workspace</h1>
        <p className="mt-4 leading-7 text-text-muted">
          Use your Google account to review invoices, verify Jamaican tariffs and generate test ASYCUDA XML.
        </p>

        <div className="mt-6 rounded-2xl border border-success/20 bg-success/5 p-4 text-sm text-text">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
            <p>
              This sign-in requests only your basic Google profile and email. It does not request access to Google Drive or Google Sheets.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/invoice-to-xml/new" })}
          className="mt-7 flex min-h-[52px] w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3 font-semibold text-slate-900 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          <GoogleMark />
          Continue with Google
        </button>

        <p className="mt-5 text-center text-xs leading-5 text-text-muted">
          By continuing, you create a secure 30-day browser session. Sign out at any time from the declaration workspace.
        </p>
      </section>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="flex min-h-[68vh] items-center justify-center px-4 py-12">
      <div className="rounded-2xl border border-border bg-surface px-8 py-7 text-center shadow-lg">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-accent/20 border-t-accent" />
        <p className="mt-4 font-medium text-text">Checking your Google session…</p>
      </div>
    </div>
  );
}

export function GoogleAuthGate({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  if (status === "loading") return <LoadingCard />;
  if (!session?.user) return <LoginCard />;

  const displayName = session.user.name || session.user.email || "Google user";
  const initial = displayName.trim().charAt(0).toUpperCase() || "U";

  return (
    <>
      <div className="border-b border-border bg-surface/80 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text">{displayName}</p>
              {session.user.email && session.user.name && (
                <p className="truncate text-xs text-text-muted">{session.user.email}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/invoice-to-xml/sign-in" })}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-text transition hover:border-error/30 hover:text-error"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
      {children}
    </>
  );
}

export function GoogleSignInScreen() {
  const { data: session, status } = useSession();

  if (status === "loading") return <LoadingCard />;
  if (session?.user) {
    return (
      <div className="mx-auto flex min-h-[68vh] max-w-lg items-center px-4 py-12 sm:px-6">
        <section className="w-full rounded-3xl border border-border bg-surface p-8 text-center shadow-xl">
          <ShieldCheck className="mx-auto h-12 w-12 text-success" />
          <h1 className="mt-4 text-2xl font-bold text-text">You are signed in</h1>
          <p className="mt-2 text-text-muted">Continue to the Invoice-to-ASYCUDA declaration workspace.</p>
          <a
            href="/invoice-to-xml/new"
            className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-accent px-6 py-3 font-semibold text-white hover:bg-accent-light"
          >
            Open declaration workspace
          </a>
        </section>
      </div>
    );
  }

  return <LoginCard />;
}
