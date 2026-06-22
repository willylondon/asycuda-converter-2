import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B1F33",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://asycuda-converter.vercel.app"
  ),
  title: {
    default: "ASYCUDA Excel Converter — Excel Manifests to Customs XML",
    template: "%s | ASYCUDA Excel Converter",
  },
  description:
    "Convert Excel delivery manifests into ASYCUDA-compliant XML files in minutes. Validate, convert, and download customs-ready XML without manual formatting.",
  keywords: [
    "ASYCUDA",
    "Excel converter",
    "customs XML",
    "manifest converter",
    "delivery manifest",
    "customs declaration",
    "XML generator",
  ],
  authors: [{ name: "IGonics" }],
  creator: "IGonics",
  publisher: "IGonics",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://asycuda-converter.vercel.app",
    siteName: "ASYCUDA Excel Converter",
    title: "Convert Excel Manifests to ASYCUDA XML",
    description:
      "Validate, convert, and download customs-ready XML files without manual formatting.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "ASYCUDA Excel Converter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Convert Excel Manifests to ASYCUDA XML",
    description:
      "Validate, convert, and download customs-ready XML files without manual formatting.",
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
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}