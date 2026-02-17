import JsonFormatterClient from "@/components/tools/JsonFormatterClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free JSON Formatter & Validator | Beautify JSON Online",
  description: "Professional JSON Formatter to beautify, minify, and validate JSON data instantly. 100% client-side processing for privacy and security.",
  keywords: ["json formatter", "json beautifier", "json validator", "minify json", "json editor online"],
  openGraph: {
    title: "Universal JSON Formatter | Neural Study Engine",
    description: "Format and validate JSON instantly with our professional-grade engineering tool.",
    type: "website",
  },
};

export default function Page() {
  return <JsonFormatterClient />;
}