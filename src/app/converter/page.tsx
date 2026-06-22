import type { Metadata } from "next";
import { ConverterWorkspace } from "@/components/converter/ConverterWorkspace";

export const metadata: Metadata = {
  title: "Convert Excel Manifest",
  description: "Upload and validate your manifest Excel workbook",
};

export default function ConverterPage() {
  return <ConverterWorkspace />;
}
