import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B1F33",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://asycuda-converter-2.vercel.app"
  ),
  title: {
    default: "Clearance — Invoice to ASYCUDA XML",
    template: "%s | Clearance",
  },
  description:
    "Review commercial invoice data, verify Jamaican tariff codes and generate test ASYCUDA XML.",
  keywords: [
    "ASYCUDA",
    "invoice extraction",
    "customs XML",
    "Jamaica tariff",
    "customs declaration",
    "XML generator",
  ],
  authors: [{ name: "Willy London" }],
  creator: "Willy London",
  publisher: "Willy London",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://asycuda-converter-2.vercel.app",
    siteName: "Clearance",
    title: "Review Invoices and Generate Test ASYCUDA XML",
    description:
      "Prepare declaration data, verify Jamaican tariff codes and export test ASYCUDA XML.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Clearance",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Review Invoices and Generate Test ASYCUDA XML",
    description:
      "Prepare declaration data, verify Jamaican tariff codes and export test ASYCUDA XML.",
    images: ["/images/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/images/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <a href="#main-content" className="skip-link">
            Skip to content
          </a>
          <Header />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
