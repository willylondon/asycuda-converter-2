import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { authOptions, isAllowedGoogleEmail } from "@/lib/auth";

describe("Google authentication", () => {
  it("uses one Google provider with profile-only scopes", () => {
    expect(authOptions.providers).toHaveLength(1);
    expect(authOptions.providers[0].id).toBe("google");

    const provider = authOptions.providers[0] as unknown as {
      options?: { authorization?: { params?: { scope?: string } } };
    };
    const scope = provider.options?.authorization?.params?.scope ?? "";

    expect(scope).toContain("openid");
    expect(scope).toContain("email");
    expect(scope).toContain("profile");
    expect(scope).not.toContain("drive");
    expect(scope).not.toContain("spreadsheets");
  });

  it("uses a 30-day JWT session and the branded sign-in route", () => {
    expect(authOptions.session?.strategy).toBe("jwt");
    expect(authOptions.session?.maxAge).toBe(30 * 24 * 60 * 60);
    expect(authOptions.pages?.signIn).toBe("/invoice-to-xml/sign-in");
  });

  it("allows only configured Google email addresses", async () => {
    const configured = " approved@example.com,\nSECOND@example.com ";

    expect(isAllowedGoogleEmail("approved@example.com", configured)).toBe(true);
    expect(isAllowedGoogleEmail("second@EXAMPLE.com", configured)).toBe(true);
    expect(isAllowedGoogleEmail("outsider@example.com", configured)).toBe(false);
    expect(isAllowedGoogleEmail("approved@example.com", "")).toBe(false);

    const previous = process.env.ALLOWED_GOOGLE_EMAILS;
    process.env.ALLOWED_GOOGLE_EMAILS = configured;
    const signIn = authOptions.callbacks?.signIn as (input: {
      user: { email?: string | null };
    }) => Promise<boolean>;

    await expect(signIn({ user: { email: "approved@example.com" } })).resolves.toBe(true);
    await expect(signIn({ user: { email: "outsider@example.com" } })).resolves.toBe(false);

    if (previous === undefined) delete process.env.ALLOWED_GOOGLE_EMAILS;
    else process.env.ALLOWED_GOOGLE_EMAILS = previous;
  });

  it("removes user access from an existing session when the email is no longer allowed", async () => {
    const previous = process.env.ALLOWED_GOOGLE_EMAILS;
    process.env.ALLOWED_GOOGLE_EMAILS = "approved@example.com";
    const sessionCallback = authOptions.callbacks?.session as unknown as (input: {
      session: { user?: { email?: string | null } };
      token: { accessAllowed?: boolean; sub?: string };
    }) => Promise<{ user?: { email?: string | null } }>;

    const session = await sessionCallback({
      session: { user: { email: "outsider@example.com" } },
      token: { accessAllowed: false, sub: "outsider" },
    });

    expect(session.user).toBeUndefined();

    if (previous === undefined) delete process.env.ALLOWED_GOOGLE_EMAILS;
    else process.env.ALLOWED_GOOGLE_EMAILS = previous;
  });

  it("protects invoice extraction, tariff lookup and XML export on the server", () => {
    const protectedRoutes = [
      "../src/app/invoice-to-xml/api/extract/route.ts",
      "../src/app/invoice-to-xml/api/tariff/route.ts",
      "../src/app/invoice-to-xml/api/export-xml/route.ts",
    ];

    for (const path of protectedRoutes) {
      const source = readFileSync(resolve(__dirname, path), "utf-8");
      expect(source).toContain("getServerSession(authOptions)");
      expect(source).toMatch(/status:\s*401/);
    }
  });
});
