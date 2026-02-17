import InternshipGeneratorClient from "@/components/tools/InternshipGeneratorClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Internship Certificate Generator | Create Professional Letterheads",
  description: "Generate authentic-looking internship certificates and offer letters instantly. Choose from 20+ professional templates, customize details, and download high-quality PDFs for free.",
  keywords: ["internship certificate generator", "offer letter maker", "fake internship certificate", "certificate template", "hr tools", "professional document generator"],
  openGraph: {
    title: "InternForge Pro | Authentic Document Generator",
    description: "Create professional internship certificates in seconds. Free, secure, and watermark-free options.",
    type: "website",
  }
};

export default function Page() {
  return <InternshipGeneratorClient />;
}