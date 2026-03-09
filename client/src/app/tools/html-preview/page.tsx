import HtmlPreviewClient from "@/components/tools/HtmlPreviewClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "HTML/CSS/JS Live Preview | VS Code-style Editor",
  description: "Free online HTML, CSS, and JavaScript live editor with instant preview. Write code and watch it render in real-time. Supports import of external libraries, responsive preview, and code export.",
  keywords: ["html live preview", "html css js editor", "online code editor", "live html renderer", "web playground", "codesandbox alternative", "codepen alternative"],
  openGraph: {
    title: "HTML Live Editor | Paperxify Tools",
    description: "VS Code-style HTML/CSS/JS live editor with instant preview. Build and test web code in the browser.",
    type: "website",
  }
};

export default function Page() {
  return <HtmlPreviewClient />;
}
