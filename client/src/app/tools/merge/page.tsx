// app/tools/merge/page.tsx (Server Component)
import MergePDFPage from "@/components/tools/MergePDFTool";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merge PDF Files Free | Combine PDFs Online | Neural Tools",
  description: "Merge multiple PDF files into one document instantly. 100% free, secure client-side processing, no file limits, and no watermarks.",
  keywords: ["merge pdf", "combine pdf", "pdf joiner", "free pdf tool", "secure pdf merge"],
  openGraph: {
    title: "Merge PDF Files Instantly",
    description: "Secure, local PDF merging. No upload limits.",
    type: "website",
  }
};

export default function Page() {
  return <MergePDFPage />;
}