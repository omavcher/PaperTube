import SplitPDFTool from "@/components/tools/SplitPDFTool";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Split PDF Files Online | Extract PDF Pages Free | Neural Tools",
  description: "Split PDF documents into multiple files instantly. Extract specific pages, split by range, or separate every page. 100% free, secure client-side processing.",
  keywords: ["split pdf", "extract pdf pages", "pdf separator", "free pdf tool", "secure pdf splitter"],
  openGraph: {
    title: "Split PDF Files Instantly",
    description: "Secure, local PDF splitting. Extract ranges or individual pages.",
    type: "website",
  }
};

export default function Page() {
  return <SplitPDFTool />;
}