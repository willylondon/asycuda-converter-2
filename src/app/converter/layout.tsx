import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Converter — Upload Excel & Get ASYCUDA XML",
  description:
    "Upload your Excel delivery manifest and convert it to ASYCUDA-compliant XML in minutes. Drag-and-drop upload, instant validation, and one-click download.",
};

export default function ConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}