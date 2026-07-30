import type { Metadata } from "next";
import { GoogleSignInScreen } from "@/components/auth/GoogleAuthGate";

export const metadata: Metadata = {
  title: "Sign in — Invoice-to-ASYCUDA",
  description: "Sign in with Google to access the Invoice-to-ASYCUDA declaration workspace.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function InvoiceToXmlSignInPage() {
  return <GoogleSignInScreen />;
}
