import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Invoice to ASYCUDA XML",
  description: "Convert commercial invoices into ASYCUDA-compliant XML declarations.",
};

export default function InvoiceToXmlLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Mini header */}
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/invoice-to-xml"
            className="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Invoice to XML
          </Link>
          <span className="text-sm text-text-muted">|</span>
          <span className="text-sm font-semibold text-text">ASYCUDA Declaration Builder</span>
        </div>
      </header>
      {children}
    </div>
  );
}
