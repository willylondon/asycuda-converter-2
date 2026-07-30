import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export function isAllowedGoogleEmail(
  email: string | null | undefined,
  configuredEmails = process.env.ALLOWED_GOOGLE_EMAILS
) {
  if (!email || !configuredEmails) return false;

  const allowedEmails = new Set(
    configuredEmails
      .split(/[,\n]/)
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  );

  return allowedEmails.has(email.trim().toLowerCase());
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "select_account",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: "/invoice-to-xml/sign-in",
    error: "/invoice-to-xml/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async signIn({ user }) {
      return isAllowedGoogleEmail(user.email);
    },
    async jwt({ token }) {
      token.accessAllowed = isAllowedGoogleEmail(token.email);
      return token;
    },
    async session({ session, token }) {
      if (!token.accessAllowed || !isAllowedGoogleEmail(session.user?.email)) {
        return { ...session, user: undefined };
      }
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
