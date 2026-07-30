import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invoice to ASYCUDA XML",
  description: "Convert commercial invoices into ASYCUDA-compliant XML declarations.",
};

export default function InvoiceToXmlLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">{children}</div>
  );
}
