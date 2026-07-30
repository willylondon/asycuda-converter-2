import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { authOptions } from "@/lib/auth";

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
