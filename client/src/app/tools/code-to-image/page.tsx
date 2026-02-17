import CodeToImageClient from "@/components/tools/CodeToImageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Code to Image Converter | Beautiful Syntax Highlighting",
  description: "Convert your code snippets into beautiful, shareable images. Customize themes, backgrounds, and padding instantly. Perfect for Twitter, LinkedIn, and Instagram.",
  keywords: ["code to image", "carbon clone", "code screenshot", "syntax highlighter", "developer tools", "code snippet image"],
  openGraph: {
    title: "Code to Image Studio | Neural Tools",
    description: "Create stunning code screenshots instantly. Free, secure, and customizable.",
    type: "website",
  }
};

export default function Page() {
  return <CodeToImageClient />;
}