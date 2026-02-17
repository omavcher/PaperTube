import MarkdownEditorClient from "@/components/tools/MarkdownEditorClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Markdown Editor Online | Real-time Preview & Syntax Highlighting",
  description: "Free online Markdown Editor with real-time preview, syntax highlighting, templates, and auto-save. Export to MD, HTML, or copy instantly. Perfect for developers and writers.",
  keywords: ["markdown editor", "online markdown editor", "markdown preview", "readme generator", "markdown to html", "developer tools", "text editor"],
  openGraph: {
    title: "Markdown Studio | Neural Tools",
    description: "Write, preview, and export Markdown instantly. Professional features, zero cost.",
    type: "website",
  }
};

export default function Page() {
  return <MarkdownEditorClient />;
}